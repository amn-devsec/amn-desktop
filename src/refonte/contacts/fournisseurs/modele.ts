import { ajouterJours, ecartJours, estOuvre, type Jour } from '../commun';
import type { SourcesContacts } from '../sources/types';

/**
 * LOT-02 · H45 « FOURNISSEURS » — la matrice « Comparer pour un besoin » (logique pure, fiche H45 rubrique 6).
 *
 * Tout se calcule sur l'HISTORIQUE D'ACHATS (`SourcesContacts.achats`) : dernier prix payé, délai annoncé, qualité sur
 * 12 mois (70 % livrées dans le délai, 30 % conformes), dépense. L'application n'a pas cet historique (`achats: null`) :
 * la comparaison dit alors « non disponible » au lieu d'inventer un prix. La garantie et le contrat n'existent nulle part :
 * ce critère reste affiché, vide, et sort du score (la fiche : « le critère est ignoré dans le score »).
 */
export type Urgence = 'depannage' | 'planifie';
export type Critere = 'prix' | 'delai' | 'qualite' | 'garantie';

/** Les réglages de poids de la fiche : « dépannage » et « équipement planifié ». */
export const POIDS_PAR_URGENCE: Readonly<Record<Urgence, Readonly<Record<Critere, number>>>> = {
  depannage: { prix: 35, delai: 30, qualite: 25, garantie: 10 },
  planifie: { prix: 45, delai: 10, qualite: 30, garantie: 15 },
};

export interface Besoin { article: string; quantite: number; urgence: Urgence }

export interface ColonneFournisseur {
  id: string;
  nom: string;
  categorie: string;
  prixCents: number | null;
  totalCents: number | null;
  delaiJours: number;
  /** Livraison estimée : aujourd'hui + délai en jours ouvrés. */
  livraison: Jour;
  /** 0 à 100, ou `null` sans commande livrée sur 12 mois. */
  qualite: number | null;
  depense12mCents: number;
  notes: Partial<Record<Critere, number>>;
  score: number | null;
  recommande: boolean;
  egalite: boolean;
  meilleurs: { prix: boolean; total: boolean; delai: boolean; qualite: boolean };
}

export interface CommandeEnCours {
  id: string;
  fournisseur: string;
  objet: string;
  commandeLe: Jour;
  attendueLe: Jour;
  /** Jours de retard sur la date attendue (0 si dans les délais). */
  retardJours: number;
}

export interface Renegociation { fournisseur: string; depenseCents: number; derniereNegociation: Jour | null }

export interface ModeleFournisseurs {
  /** `false` : pas d'historique d'achats dans l'application. */
  disponible: boolean;
  total: number;
  besoins: Besoin[];
  besoin: Besoin | null;
  colonnes: ColonneFournisseur[];
  /** Les poids effectivement appliqués (le critère sans donnée est à 0, le reste renormalisé à 100). */
  poids: Record<Critere, number>;
  recommande: ColonneFournisseur | null;
  commandes: { liste: CommandeEnCours[]; dansLesDelais: number };
  renegocier: Renegociation | null;
}

const FENETRE_JOURS = 365;
const MAX_COLONNES = 4;

/** Ajoute `n` jours OUVRÉS (le week-end saute) : vendredi 30 oct. + 1 = lundi 2 nov. */
export function ajouterJoursOuvres(jour: Jour, n: number): Jour {
  let j = jour;
  let reste = n;
  while (reste > 0) {
    j = ajouterJours(j, 1);
    if (estOuvre(j)) reste -= 1;
  }
  return j;
}

/** Prix : le plus bas ÷ prix × 100 ; délai : 100 − (jours − 1) × 10, plancher 0 ; qualité : sa valeur. */
export const noteDePrix = (prix: number, plusBas: number): number => Math.round((plusBas / prix) * 1000) / 10;
export const noteDeDelai = (jours: number): number => Math.max(0, 100 - (jours - 1) * 10);

const norm = (s: string): string => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export function modeleFournisseurs(src: SourcesContacts, choix?: { besoin?: Besoin | null; urgence?: Urgence }): ModeleFournisseurs {
  const achats = src.achats;
  const vide: ModeleFournisseurs = {
    disponible: achats !== null, total: src.fournisseurs.length, besoins: [], besoin: null, colonnes: [], poids: { prix: 0, delai: 0, qualite: 0, garantie: 0 }, recommande: null,
    commandes: { liste: [], dansLesDelais: 0 }, renegocier: null,
  };
  if (!achats || achats.length === 0) return vide;
  const debut = ajouterJours(src.aujourdhui, -FENETRE_JOURS);
  const parId = new Map(src.fournisseurs.map((f) => [f.id, f]));
  const recents = achats.filter((a) => a.commandeLe >= debut && parId.has(a.fournisseurId));

  // Les besoins proposés : les articles achetés chez au moins deux fournisseurs, les plus fournis d'abord.
  const parArticle = new Map<string, { article: string; fournisseurs: Set<string>; derniere: number; depense: number }>();
  for (const a of [...recents].sort((x, y) => y.commandeLe.localeCompare(x.commandeLe))) {
    const k = norm(a.article);
    const x = parArticle.get(k) ?? { article: a.article, fournisseurs: new Set<string>(), derniere: a.quantite, depense: 0 };
    x.fournisseurs.add(a.fournisseurId);
    x.depense += a.totalCents;
    parArticle.set(k, x);
  }
  const urgence = choix?.urgence ?? choix?.besoin?.urgence ?? 'depannage';
  const besoins: Besoin[] = [...parArticle.values()]
    .filter((x) => x.fournisseurs.size >= 2)
    .sort((a, b) => b.fournisseurs.size - a.fournisseurs.size || b.depense - a.depense || a.article.localeCompare(b.article, 'fr'))
    .map((x) => ({ article: x.article, quantite: x.derniere, urgence }));
  const besoin = choix?.besoin ? { ...choix.besoin, urgence } : besoins[0] ?? null;

  const commandes = commandesEnCours(src);
  const renegocier = suggestionRenegocier(src, recents);
  if (!besoin) return { ...vide, besoins, commandes, renegocier };

  // Les colonnes : les fournisseurs qui ont déjà vendu cet article (douze mois), au plus quatre, les plus fréquents d'abord.
  const k = norm(besoin.article);
  const ids = [...new Set(recents.filter((a) => norm(a.article) === k).map((a) => a.fournisseurId))];
  const brut = ids.flatMap((id) => {
    const f = parId.get(id);
    if (!f) return [];
    const siens = recents.filter((a) => a.fournisseurId === id);
    const dernier = siens.filter((a) => norm(a.article) === k).sort((a, b) => b.commandeLe.localeCompare(a.commandeLe))[0];
    const livrees = siens.filter((a) => a.recuLe != null);
    const aTemps = livrees.filter((a) => ecartJours(a.commandeLe, a.recuLe as Jour) <= f.delaiAnnonceJours).length;
    const conformes = livrees.filter((a) => a.conforme).length;
    const qualite = livrees.length ? Math.round(70 * (aTemps / livrees.length) + 30 * (conformes / livrees.length)) : null;
    return [{
      f, qualite, nb: siens.length,
      prix: dernier ? dernier.prixUnitaireCents : null,
      depense: siens.reduce((s, a) => s + a.totalCents, 0),
    }];
  }).sort((a, b) => b.nb - a.nb || a.f.nom.localeCompare(b.f.nom, 'fr')).slice(0, MAX_COLONNES);

  // Les poids : un critère sans aucune donnée sort du score, les autres sont ramenés à 100.
  const base = POIDS_PAR_URGENCE[urgence];
  const dispo: Record<Critere, boolean> = { prix: brut.some((c) => c.prix != null), delai: brut.length > 0, qualite: brut.some((c) => c.qualite != null), garantie: false };
  const somme = (Object.keys(base) as Critere[]).reduce((s, c) => s + (dispo[c] ? base[c] : 0), 0);
  const poids = Object.fromEntries((Object.keys(base) as Critere[]).map((c) => [c, dispo[c] && somme > 0 ? Math.round((base[c] / somme) * 100) : 0])) as Record<Critere, number>;
  const plusBas = Math.min(...brut.filter((c) => c.prix != null).map((c) => c.prix as number));

  const colonnes: ColonneFournisseur[] = brut.map((c) => {
    const notes: Partial<Record<Critere, number>> = {};
    if (c.prix != null) notes.prix = noteDePrix(c.prix, plusBas);
    notes.delai = noteDeDelai(c.f.delaiAnnonceJours);
    if (c.qualite != null) notes.qualite = c.qualite;
    const pesees = (Object.keys(notes) as Critere[]).filter((k2) => dispo[k2]);
    const poidsTotal = pesees.reduce((s, k2) => s + base[k2], 0);
    const score = poidsTotal > 0 ? Math.round(pesees.reduce((s, k2) => s + (notes[k2] as number) * base[k2], 0) / poidsTotal) : null;
    return {
      id: c.f.id, nom: c.f.nom, categorie: c.f.categorie, prixCents: c.prix, totalCents: c.prix == null ? null : c.prix * besoin.quantite,
      delaiJours: c.f.delaiAnnonceJours, livraison: ajouterJoursOuvres(src.aujourdhui, c.f.delaiAnnonceJours), qualite: c.qualite, depense12mCents: c.depense,
      notes, score, recommande: false, egalite: false, meilleurs: { prix: false, total: false, delai: false, qualite: false },
    };
  });
  const prix = colonnes.filter((c) => c.prixCents != null).map((c) => c.prixCents as number);
  const qual = colonnes.filter((c) => c.qualite != null).map((c) => c.qualite as number);
  const delaiMin = Math.min(...colonnes.map((c) => c.delaiJours));
  // Une coche dit « meilleure valeur » : sans écart entre les colonnes, personne ne la porte.
  const different = (l: (number | null)[]): boolean => new Set(l.filter((v) => v != null)).size > 1;
  const ecartPrix = different(colonnes.map((c) => c.prixCents));
  const ecartDelai = different(colonnes.map((c) => c.delaiJours));
  const ecartQualite = different(colonnes.map((c) => c.qualite));
  for (const c of colonnes) {
    c.meilleurs = {
      prix: ecartPrix && c.prixCents === Math.min(...prix),
      total: ecartPrix && c.prixCents === Math.min(...prix),
      delai: ecartDelai && c.delaiJours === delaiMin,
      qualite: ecartQualite && c.qualite === Math.max(...qual),
    };
  }
  const notees = colonnes.filter((c) => c.score != null).sort((a, b) => (b.score as number) - (a.score as number));
  const tete = notees[0] ?? null;
  if (tete) {
    tete.recommande = true;
    const proche = notees.filter((c) => c !== tete && (tete.score as number) - (c.score as number) < 3);
    if (proche.length > 0) { tete.egalite = true; for (const c of proche) { c.recommande = true; c.egalite = true; } }
  }
  return { disponible: true, total: src.fournisseurs.length, besoins, besoin, colonnes, poids, recommande: tete, commandes, renegocier };
}

/** « Commandes en cours » : les achats non reçus, les trois plus proches de leur livraison attendue. */
export function commandesEnCours(src: SourcesContacts): { liste: CommandeEnCours[]; dansLesDelais: number } {
  const parId = new Map(src.fournisseurs.map((f) => [f.id, f]));
  const ouvertes = (src.achats ?? []).filter((a) => a.recuLe == null).flatMap((a) => {
    const f = parId.get(a.fournisseurId);
    if (!f) return [];
    const attendueLe = ajouterJoursOuvres(a.commandeLe, f.delaiAnnonceJours);
    return [{ id: a.id, fournisseur: f.nom, objet: `${a.quantite} × ${a.article}`, commandeLe: a.commandeLe, attendueLe, retardJours: Math.max(0, ecartJours(attendueLe, src.aujourdhui)) }];
  }).sort((a, b) => a.attendueLe.localeCompare(b.attendueLe) || a.id.localeCompare(b.id)).slice(0, 3);
  return { liste: ouvertes, dansLesDelais: ouvertes.filter((c) => c.retardJours === 0).length };
}

/** La suggestion : le fournisseur de la plus forte dépense sur 12 mois, sans négociation enregistrée depuis plus d'un an. */
export function suggestionRenegocier(src: SourcesContacts, recents: readonly { fournisseurId: string; totalCents: number }[]): Renegociation | null {
  const parId = new Map(src.fournisseurs.map((f) => [f.id, f]));
  const depense = new Map<string, number>();
  for (const a of recents) depense.set(a.fournisseurId, (depense.get(a.fournisseurId) ?? 0) + a.totalCents);
  const limite = ajouterJours(src.aujourdhui, -FENETRE_JOURS);
  const candidats = [...depense.entries()]
    .flatMap(([id, cents]) => {
      const f = parId.get(id);
      return f && (f.negociationLe == null || f.negociationLe < limite) ? [{ f, cents }] : [];
    })
    .sort((a, b) => b.cents - a.cents);
  const premier = candidats[0];
  return premier ? { fournisseur: premier.f.nom, depenseCents: premier.cents, derniereNegociation: premier.f.negociationLe } : null;
}

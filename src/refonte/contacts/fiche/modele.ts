import { totauxDeFacture, totauxDeLignes } from '../../donnees/argent';
import { couleurSante, facteursSante, libelleSante, type CouleurSante, type LibelleSante } from '../clients';
import { ecartJours, jourDeInstant, type Jour } from '../commun';
import { derniersMois } from '../clients/modele';
import type { SourcesContacts } from '../sources/types';

/**
 * LOT-02 · G04 « FICHE CLIENT » — le modèle du dossier d'un client (logique pure, fiche G04 rubrique 6).
 *
 * Tout vient de `SourcesContacts` : l'identité et la santé, la frise « La relation », « Ce qui est ouvert »,
 * « L'argent » et sa bande de ponctualité. Ce que l'application ne sait pas (tickets, documents, alertes de
 * La Garde, interlocuteurs) reste `null` : la vue dit « non disponible » au lieu d'inventer.
 */

export type EtatFactureFrise = 'payee' | 'attente' | 'retard';
export type EtatDevisFrise = 'signe' | 'envoye';

export interface MarqueFacture { numero: string; cents: number; jour: Jour; etat: EtatFactureFrise }
export interface MarqueDevis { numero: string; titre: string; cents: number; jour: Jour; etat: EtatDevisFrise }

export interface MoisRelation {
  /** `AAAA-MM`. */
  cle: string;
  echanges: number;
  factures: MarqueFacture[];
  devis: MarqueDevis[];
}

export interface Jalon {
  /** Où il tombe : le numéro du mois dans `mois`. */
  indice: number;
  genre: 'premier' | 'signe';
  titre: string;
  jour: Jour;
}

export type GenreOuvert = 'rdv' | 'devis' | 'factureRetard' | 'factureBrouillon' | 'factureEmise';

export interface ElementOuvert {
  cle: string;
  /** L'identifiant de l'objet (facture, devis, rendez-vous) pour l'ouvrir dans son module. */
  refId: string;
  genre: GenreOuvert;
  urgent: boolean;
  /** Le titre : numéro et objet, ou titre du rendez-vous. */
  titre: string;
  numero: string;
  /** Paramètres des phrases de détail. */
  detail: Record<string, string | number>;
  /** Pour les pastilles (`Vu`, `Envoyé`, `Brouillon`) et le tri. */
  etat: 'vu' | 'envoye' | 'brouillon' | null;
  tri: number;
}

export interface PointPonctualite {
  numero: string;
  /** Jours d'écart à l'échéance, bornés à ± 12 : négatif = payée avant. */
  jours: number;
  aLHeure: boolean;
}

export interface ModeleFiche {
  id: number;
  nom: string;
  initiale: string;
  activite: string;
  ville: string;
  palier: 'Bronze' | 'Argent' | 'Or' | null;
  depuis: string;
  sante: number;
  couleur: CouleurSante;
  libelleSante: LibelleSante;
  /** Les deux meilleurs facteurs de la santé, ou aucun si rien ne se détache. */
  facteurs: ('delai' | 'reactivite' | 'activite' | 'satisfaction')[];
  coordonnees: { email: string; telephone: string; site: string; adresse: string };
  /** `null` : pas de collection d'interlocuteurs dans l'application (STATUT §1.28). */
  interlocuteurs: { id: string; nom: string; fonction: string; email: string; telephone: string }[] | null;
  suivieePar: { email: string; nom: string }[];
  /** `null` : pas sous la Garde (aucun site relié à la fiche). */
  garde: { sites: number } | null;
  sousTitre: { mois: number; trait: 'avance' | 'sansRetard' | null; rdv: { heure: string } | null };
  relation: { mois: MoisRelation[]; jalons: Jalon[]; totaux: { mois: number; echanges: number; factures: number; enAttente: number } };
  ouvert: ElementOuvert[];
  argent: {
    factureCents: number;
    /** Écart avec les 12 mois d'avant, en %, ou `null` sans base de comparaison. */
    deltaPourcent: number | null;
    enAttenteCents: number;
    nombreFactures: number;
    panierCents: number | null;
    ponctualite: PointPonctualite[];
    /** Moyenne des écarts (jours, bornés) : négatif = en avance. `null` sans facture payée. */
    moyenneJours: number | null;
    prochaine: { numero: string; cents: number } | null;
  };
  /** `null` : les documents ne sont pas rattachés aux clients dans l'application. */
  documents: { total: number; recents: { id: string; titre: string; quand: string }[] } | null;
  /** Les modèles de départ d'un client sans aucune trace. */
  sansHistorique: boolean;
}

const moisDe = (jour: Jour): string => jour.slice(0, 7);
const accentuer = (s: string): string => s.trim();

/** Les mois de `debut` à `fin` inclus, du plus ancien au plus récent (`AAAA-MM`). */
export function moisEntre(debut: string, fin: string): string[] {
  const sortie: string[] = [];
  let [a, m] = debut.split('-').map(Number);
  const [af, mf] = fin.split('-').map(Number);
  while (a < af || (a === af && m <= mf)) {
    sortie.push(`${a}-${String(m).padStart(2, '0')}`);
    m += 1;
    if (m > 12) { m = 1; a += 1; }
  }
  return sortie;
}

export const nombreDeMois = (debut: string, fin: string): number => Math.max(1, moisEntre(debut, fin).length - 1);

/**
 * Les jalons : au plus quatre, choisis parmi le premier devis et les devis signés (les plus récents d'abord quand ils
 * se gênent), dont les libellés ne se recouvrent pas. `pasPx` : écart entre deux mois ; `largeurLibellePx` : la place
 * d'un libellé. Un jalon trop près d'un autre déjà gardé est écarté.
 */
export function choisirJalons(candidats: readonly Jalon[], pasPx: number, largeurLibellePx: number, max = 4): Jalon[] {
  const gardes: Jalon[] = [];
  const premier = candidats.find((j) => j.genre === 'premier');
  const parRecence = [...candidats].filter((j) => j !== premier).sort((a, b) => b.jour.localeCompare(a.jour));
  for (const j of parRecence) {
    if (gardes.length >= max - (premier ? 1 : 0)) break;
    if (gardes.every((g) => Math.abs(g.indice - j.indice) * pasPx >= largeurLibellePx) && (!premier || Math.abs(premier.indice - j.indice) * pasPx >= largeurLibellePx)) gardes.push(j);
  }
  return (premier ? [premier, ...gardes] : gardes).sort((a, b) => a.indice - b.indice);
}

export function modeleFiche(src: SourcesContacts, clientId: number): ModeleFiche | null {
  const c = src.clients.find((x) => x.id === clientId);
  if (!c) return null;
  const mesFactures = src.factures.filter((f) => f.clientId === clientId);
  const mesDevis = src.devis.filter((d) => d.clientId === clientId);
  const emises = mesFactures.filter((f) => f.status === 'issued' || f.status === 'paid');
  const payees = mesFactures.filter((f) => f.status === 'paid' && f.paidAt);
  const enRetard = (f: { status: string; dueAt: string }) => f.status === 'issued' && f.dueAt < src.aujourdhui;
  const total = (f: (typeof mesFactures)[number]): number => totauxDeFacture(f).ttcCents;

  // ── Identité
  const fidelite = src.fidelite.find((x) => x.clientId === clientId);
  const f = facteursSante(c, { factures: src.factures, devis: src.devis.map((d) => ({ clientId: d.clientId, createdAt: d.createdAt })), avis: src.avis }, src.aujourdhui);
  const classes = (Object.entries(f) as [keyof typeof f, number][]).filter(([, v]) => v >= 60).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k]) => k);
  const liste = src.interlocuteurs?.filter((i) => i.organisationType === 'client' && i.organisationId === String(clientId)) ?? null;
  const resp = src.equipe.filter((m) => m.email === c.responsableEmail).map((m) => ({ email: m.email, nom: m.nomComplet }));

  // ── La relation
  const premiersJours: Jour[] = [c.debutLe, ...mesDevis.map((d) => d.createdAt.slice(0, 10) as Jour), ...emises.map((x) => x.issuedAt)].filter(Boolean);
  const premier = premiersJours.sort()[0] ?? src.aujourdhui;
  const mois: MoisRelation[] = moisEntre(moisDe(premier), moisDe(src.aujourdhui)).map((cle) => ({ cle, echanges: 0, factures: [], devis: [] }));
  const parCle = new Map(mois.map((m) => [m.cle, m]));
  for (const e of src.echanges) {
    const m = e.clientId === clientId ? parCle.get(moisDe(jourDeInstant(e.at))) : undefined;
    if (m) m.echanges += 1;
  }
  for (const x of emises) {
    const m = parCle.get(moisDe(x.issuedAt));
    if (m) m.factures.push({ numero: x.number, cents: total(x), jour: x.issuedAt, etat: x.status === 'paid' ? 'payee' : enRetard(x) ? 'retard' : 'attente' });
  }
  for (const d of mesDevis) {
    if (d.status === 'draft') continue;
    const signe = d.status === 'accepted' || d.acceptéLe != null;
    const jour = (signe ? d.acceptéLe ?? d.updatedAt.slice(0, 10) : (d.sentAt ?? d.createdAt).slice(0, 10)) as Jour;
    const m = parCle.get(moisDe(jour));
    if (m) m.devis.push({ numero: d.numero, titre: d.title, cents: totauxDeLignes(d.lignes).ttcCents, jour, etat: signe ? 'signe' : 'envoye' });
  }
  const indiceDe = (jour: Jour): number => Math.max(0, mois.findIndex((m) => m.cle === moisDe(jour)));
  const premierDevis = [...mesDevis].filter((d) => d.status !== 'draft').sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
  const candidats: Jalon[] = [];
  if (premierDevis) candidats.push({ indice: indiceDe(premierDevis.createdAt.slice(0, 10) as Jour), genre: 'premier', titre: premierDevis.title, jour: premierDevis.createdAt.slice(0, 10) as Jour });
  for (const d of mesDevis) {
    if (d === premierDevis || !(d.status === 'accepted' || d.acceptéLe != null)) continue;
    const jour = (d.acceptéLe ?? d.updatedAt.slice(0, 10)) as Jour;
    candidats.push({ indice: indiceDe(jour), genre: 'signe', titre: d.title, jour });
  }
  const attente = emises.filter((x) => x.status === 'issued').length;

  // ── Ce qui est ouvert
  const ouvert: ElementOuvert[] = [];
  const dans7 = src.maintenant + 7 * 86_400_000;
  for (const e of src.evenements) {
    if (e.systeme || e.clientId !== clientId || e.type !== 'rendez-vous client' || e.confirmation === 'manqué') continue;
    const debut = Date.parse(e.startAt);
    if (debut + e.durationMin * 60_000 <= src.maintenant || debut > dans7) continue;
    const jour = jourDeInstant(debut);
    ouvert.push({ cle: `rdv-${e.id}`, refId: String(e.id), genre: 'rdv', urgent: false, titre: e.title, numero: '', etat: null, tri: (debut - src.maintenant) / 60_000, detail: { jour, aujourdhui: jour === src.aujourdhui ? 1 : 0, heure: heureParis(debut), mode: e.mode } });
  }
  for (const d of mesDevis) {
    if (d.acceptéLe != null || d.refuséLe != null || d.status === 'accepted' || d.status === 'refused') continue;
    const brouillon = d.status === 'draft';
    ouvert.push({
      cle: `devis-${d.id}`, refId: String(d.id), genre: 'devis', urgent: false, titre: d.title, numero: d.numero, etat: brouillon ? 'brouillon' : d.vuAt ? 'vu' : 'envoye', tri: 20_000 + (brouillon ? 1 : 0),
      detail: { cents: totauxDeLignes(d.lignes).ttcCents, jours: d.sentAt ? Math.max(0, ecartJours(d.sentAt.slice(0, 10), src.aujourdhui)) : 0 },
    });
  }
  for (const x of mesFactures) {
    if (x.status === 'draft') ouvert.push({ cle: `f-${x.id}`, refId: String(x.id), genre: 'factureBrouillon', urgent: false, titre: x.number, numero: x.number, etat: 'brouillon', tri: 30_000, detail: { cents: total(x) } });
    else if (x.status === 'issued') {
      const retard = enRetard(x);
      ouvert.push({ cle: `f-${x.id}`, refId: String(x.id), genre: retard ? 'factureRetard' : 'factureEmise', urgent: retard, titre: x.number, numero: x.number, etat: null, tri: retard ? -ecartJours(x.dueAt, src.aujourdhui) : 40_000 + Math.max(0, ecartJours(src.aujourdhui, x.dueAt)), detail: { cents: total(x), jour: x.dueAt, jours: Math.max(0, ecartJours(x.dueAt, src.aujourdhui)) } });
    }
  }
  ouvert.sort((a, b) => Number(b.urgent) - Number(a.urgent) || a.tri - b.tri);

  // ── L'argent
  const fenetre = derniersMois(src.aujourdhui);
  const avant = derniersMois(`${Number(src.aujourdhui.slice(0, 4)) - 1}-${src.aujourdhui.slice(5)}`);
  const somme = (liste: string[]) => emises.filter((x) => liste.includes(moisDe(x.issuedAt))).reduce((s, x) => s + total(x), 0);
  const factureCents = somme(fenetre);
  const precedent = somme(avant);
  const nombre = emises.filter((x) => fenetre.includes(moisDe(x.issuedAt))).length;
  const derniers12 = [...payees].sort((a, b) => b.paidAt.localeCompare(a.paidAt)).slice(0, 12).reverse();
  const ecarts = derniers12.map((x) => ecartJours(x.dueAt, x.paidAt));
  const ponctualite: PointPonctualite[] = derniers12.map((x, i) => ({ numero: x.number, jours: Math.max(-12, Math.min(12, ecarts[i])), aLHeure: ecarts[i] <= 0 }));
  const brouillon = [...mesFactures].filter((x) => x.status === 'draft').sort((a, b) => a.issuedAt.localeCompare(b.issuedAt))[0];
  const moyenne = ecarts.length ? ecarts.reduce((s, x) => s + x, 0) / ecarts.length : null;
  const jamaisEnRetard = payees.length > 0 && payees.every((x) => x.paidAt <= x.dueAt) && !mesFactures.some(enRetard);

  const rdvDuJour = ouvert.find((o) => o.genre === 'rdv' && o.detail.aujourdhui === 1);
  const sansHistorique = emises.length === 0 && mesDevis.length === 0 && !src.echanges.some((e) => e.clientId === clientId);

  return {
    id: c.id,
    nom: accentuer(c.company || c.name),
    initiale: (c.company || c.name).trim().charAt(0).toUpperCase(),
    activite: c.secteur,
    ville: c.ville,
    palier: fidelite?.niveau ?? null,
    depuis: moisDe(c.debutLe),
    sante: c.sante,
    couleur: couleurSante(c.sante),
    libelleSante: libelleSante(c.sante),
    facteurs: classes,
    coordonnees: { email: c.email, telephone: c.phone, site: c.siteWeb, adresse: [c.adresse].filter(Boolean).join(', ') },
    interlocuteurs: liste && liste.map((i) => ({ id: i.id, nom: i.nomComplet, fonction: i.fonction, email: i.email, telephone: i.telephone })),
    suivieePar: resp,
    garde: c.linkedSiteIds?.length ? { sites: c.linkedSiteIds.length } : null,
    sousTitre: { mois: nombreDeMois(moisDe(premier), moisDe(src.aujourdhui)), trait: moyenne != null && moyenne < 0 ? 'avance' : jamaisEnRetard ? 'sansRetard' : null, rdv: rdvDuJour ? { heure: String(rdvDuJour.detail.heure) } : null },
    relation: { mois, jalons: candidats, totaux: { mois: nombreDeMois(moisDe(premier), moisDe(src.aujourdhui)), echanges: mois.reduce((s, m) => s + m.echanges, 0), factures: emises.length, enAttente: attente } },
    ouvert,
    argent: { factureCents, deltaPourcent: precedent > 0 ? Math.round(((factureCents - precedent) / precedent) * 100) : null, enAttenteCents: emises.filter((x) => x.status === 'issued').reduce((s, x) => s + total(x), 0), nombreFactures: nombre, panierCents: nombre ? Math.round(factureCents / nombre) : null, ponctualite, moyenneJours: moyenne == null ? null : Math.round(moyenne), prochaine: brouillon ? { numero: brouillon.number, cents: total(brouillon) } : null },
    documents: null,
    sansHistorique,
  };
}

function heureParis(ms: number): string {
  return new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris', hourCycle: 'h23' }).format(new Date(ms));
}

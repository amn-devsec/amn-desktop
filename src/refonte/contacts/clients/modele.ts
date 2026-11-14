import { totauxDeFacture, totauxDeLignes } from '../../donnees/argent';
import { comparerATraiter, couleurSante, joursDeRetard, santeDuPortefeuille, type CouleurSante, type StatutClient } from '../clients';
import { ajouterJours, ecartJours, jourDeInstant, type Jour } from '../commun';
import { initialesDe } from '../hub/modele';
import type { SourcesContacts } from '../sources/types';

/**
 * LOT-02 · H05 « CLIENTS » — le modèle de la mosaïque (logique pure, fiche H05 rubrique 6).
 *
 * Chaque client devient une tuile : santé et couleur, facturé sur 12 mois et sa courbe, dernier échange, pastille de
 * statut, « prochaine chose ». Les segments, la recherche, le filtre « Responsable » et les tris se jouent ici, sur le
 * modèle, pour être contrôlés sans navigateur. Rien n'est écrit en dur : tout vient de `SourcesContacts`.
 */

export type GenreProchaine = 'retard' | 'sansReponse' | 'devisVu' | 'rdv' | 'paiement' | 'depuis';

export interface ProchaineChose {
  genre: GenreProchaine;
  params: Record<string, string | number>;
}

export interface TuileClient {
  id: number;
  nom: string;
  /** « secteur · ville » quand la fiche les porte, sinon l'adresse courriel. */
  sousTitre: string;
  initiale: string;
  sante: number;
  couleur: CouleurSante;
  /** Facturé sur 12 mois, en centimes. */
  factureCents: number;
  /** Facturé par mois sur les 12 derniers mois (le plus ancien d'abord), en centimes. */
  courbe: number[];
  echange: { genre: 'aujourdhui' | 'hier' | 'jours'; n: number };
  dernierEchangeAt: string;
  statut: StatutClient;
  /** « Impayé » et « À relancer » : le filet de 2 px en haut de la carte. */
  aTraiter: boolean;
  retardMaxJours: number;
  /** Le client est actif au sens de H05 (statut de la fiche : actif). */
  actif: boolean;
  prochaine: ProchaineChose;
  /** Un rendez-vous aujourd'hui : bord éclairci et voyant bleu. */
  rdvDuJour: boolean;
  responsable: ResponsableFiltre | null;
  /** Texte de recherche : nom, secteur, ville, courriel. */
  recherche: string;
}

export interface ResponsableFiltre {
  email: string;
  nom: string;
  initiales: string;
  teinte: number;
}

export interface ModeleClients {
  tuiles: TuileClient[];
  total: number;
  segments: Record<SegmentClient, number>;
  portefeuille: { bonne: number; aSurveiller: number; fragile: number };
  /** Clients qui ont payé avant l'échéance ce mois-ci. */
  payesEnAvance: number;
  responsables: ResponsableFiltre[];
  impayes: number;
  /** Le premier rendez-vous du jour (le sous-titre : « Menna Conseil t'attend à 11:00 »). */
  prochainRdv: { client: string; heure: string } | null;
}

export type SegmentClient = 'tous' | 'actifs' | 'aRelancer' | 'impayes';
export type TriClient = 'aTraiter' | 'sante' | 'nom' | 'facture' | 'echange';

const accent = (s: string): string => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const MOIS_COURBE = 12;

/** Les douze derniers mois, du plus ancien au plus récent, sous la forme `AAAA-MM`. */
export function derniersMois(aujourdhui: Jour, n = MOIS_COURBE): string[] {
  const [a, m] = aujourdhui.split('-').map(Number);
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(Date.UTC(a, m - 1 - (n - 1 - i), 1));
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  });
}

export function echangeDe(dernierEchangeAt: string, aujourdhui: Jour): TuileClient['echange'] {
  const n = Math.max(0, ecartJours(jourDeInstant(dernierEchangeAt), aujourdhui));
  return n === 0 ? { genre: 'aujourdhui', n: 0 } : n === 1 ? { genre: 'hier', n: 1 } : { genre: 'jours', n };
}

export function modeleClients(src: SourcesContacts): ModeleClients {
  const mois = derniersMois(src.aujourdhui);
  const depuis = `${mois[0]}-01`;
  const parEmail = new Map(src.equipe.map((m) => [m.email, m]));
  const ouvertsParClient = new Map<number, typeof src.factures>();
  for (const f of src.factures) ouvertsParClient.set(f.clientId, [...(ouvertsParClient.get(f.clientId) ?? []), f]);

  const rdvDuJour = new Map<number, { heure: string; at: number }>();
  for (const e of src.evenements) {
    if (e.systeme || e.type !== 'rendez-vous client' || e.clientId == null || e.confirmation === 'manqué') continue;
    if (jourDeInstant(e.startAt) !== src.aujourdhui || Date.parse(e.startAt) + e.durationMin * 60_000 <= src.maintenant) continue;
    const vu = rdvDuJour.get(e.clientId);
    const at = Date.parse(e.startAt);
    if (!vu || at < vu.at) rdvDuJour.set(e.clientId, { heure: heureDe(at), at });
  }

  const tuiles: TuileClient[] = src.clients.map((c) => {
    const factures = ouvertsParClient.get(c.id) ?? [];
    const courbe = mois.map((m) => factures.filter((f) => (f.status === 'issued' || f.status === 'paid') && f.issuedAt.slice(0, 7) === m).reduce((s, f) => s + totauxDeFacture(f).ttcCents, 0));
    const factureCents = factures.filter((f) => (f.status === 'issued' || f.status === 'paid') && f.issuedAt >= depuis).reduce((s, f) => s + totauxDeFacture(f).ttcCents, 0);
    const retards = joursDeRetard(src.factures, c.id, src.aujourdhui);
    const retardMax = retards.length ? Math.max(...retards) : 0;
    const plusEnRetard = factures.filter((f) => f.status === 'issued' && f.dueAt < src.aujourdhui).sort((a, b) => a.dueAt.localeCompare(b.dueAt))[0];
    const rdv = rdvDuJour.get(c.id);
    const devis = src.devis.filter((d) => d.clientId === c.id && d.status === 'sent' && d.acceptéLe == null && d.refuséLe == null).sort((a, b) => (a.sentAt ?? '').localeCompare(b.sentAt ?? ''))[0];
    const prochainPaiement = factures.filter((f) => f.status === 'issued' && f.dueAt >= src.aujourdhui).sort((a, b) => a.dueAt.localeCompare(b.dueAt))[0];
    const joursDevis = devis?.sentAt ? Math.max(0, ecartJours(devis.sentAt.slice(0, 10), src.aujourdhui)) : 0;

    // La prochaine chose (fiche H05, par priorité) : facture en retard ; rendez-vous du jour (devant une relance de moins de 7 jours) ;
    // devis vu mais pas signé ; devis sans réponse ; paiement attendu ; sinon depuis quand on se connaît.
    const ecartMois = (Number(src.aujourdhui.slice(0, 4)) - Number(c.debutLe.slice(0, 4))) * 12 + Number(src.aujourdhui.slice(5, 7)) - Number(c.debutLe.slice(5, 7));
    let prochaine: ProchaineChose = { genre: 'depuis', params: { mois: moisAnnee(c.debutLe), annee: ecartMois >= 12 ? 1 : 0 } };
    if (plusEnRetard && (retardMax > 7 || !rdv)) prochaine = { genre: 'retard', params: { numero: plusEnRetard.number, jours: ecartJours(plusEnRetard.dueAt, src.aujourdhui) } };
    else if (rdv) prochaine = { genre: 'rdv', params: { heure: rdv.heure } };
    else if (devis && devis.vuAt) prochaine = { genre: 'devisVu', params: {} };
    else if (devis && joursDevis >= 5) prochaine = { genre: 'sansReponse', params: { jours: joursDevis } };
    else if (prochainPaiement) prochaine = { genre: 'paiement', params: { jour: jourCourt(prochainPaiement.dueAt) } };

    const resp = parEmail.get(c.responsableEmail);
    return {
      id: c.id,
      nom: c.company || c.name,
      sousTitre: [c.secteur, c.ville].filter(Boolean).join(' · ') || c.email,
      initiale: (c.company || c.name).trim().charAt(0).toUpperCase(),
      sante: c.sante,
      couleur: couleurSante(c.sante),
      factureCents,
      courbe,
      echange: echangeDe(c.dernierEchangeAt, src.aujourdhui),
      dernierEchangeAt: c.dernierEchangeAt,
      statut: c.statutAffiche,
      aTraiter: c.statutAffiche === 'Impayé' || c.statutAffiche === 'À relancer',
      retardMaxJours: retardMax,
      actif: c.status === 'active',
      prochaine,
      rdvDuJour: Boolean(rdv),
      responsable: resp ? { email: resp.email, nom: resp.nomComplet, initiales: resp.initiales, teinte: resp.teinte } : null,
      recherche: accent([c.company, c.name, c.secteur, c.ville, c.email].join(' ')),
    };
  });

  const responsables = [...new Map(tuiles.filter((t) => t.responsable).map((t) => [t.responsable?.email, t.responsable as ResponsableFiltre])).values()].sort((a, b) => a.initiales.localeCompare(b.initiales));
  const debutMois = `${src.aujourdhui.slice(0, 7)}-01`;
  const enAvance = new Set(src.factures.filter((f) => f.status === 'paid' && f.paidAt >= debutMois && f.paidAt < f.dueAt).map((f) => f.clientId));
  const rdvs = [...rdvDuJour.entries()].sort((a, b) => a[1].at - b[1].at)[0];
  const rdvClient = rdvs ? src.clients.find((c) => c.id === rdvs[0]) : undefined;
  return {
    tuiles,
    total: tuiles.length,
    segments: {
      tous: tuiles.length,
      actifs: tuiles.filter((t) => t.actif).length,
      aRelancer: tuiles.filter((t) => t.statut === 'À relancer').length,
      impayes: tuiles.filter((t) => t.statut === 'Impayé').length,
    },
    portefeuille: santeDuPortefeuille(tuiles.map((t) => t.sante)),
    payesEnAvance: enAvance.size,
    responsables,
    impayes: tuiles.filter((t) => t.statut === 'Impayé').length,
    prochainRdv: rdvs && rdvClient ? { client: rdvClient.company || rdvClient.name, heure: rdvs[1].heure } : null,
  };
}

const heureDe = (ms: number): string => {
  const d = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris', hourCycle: 'h23' }).format(new Date(ms));
  return d;
};
const MOIS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const MOIS_COURTS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
/** « octobre » pour un début de ce mois-ci ou du mois dernier, « octobre 2025 » au-delà : la langue est choisie par la vue. */
export const moisAnnee = (jour: Jour): string => `${jour.slice(0, 4)}-${jour.slice(5, 7)}`;
export const nomDuMois = (aaaaMm: string): { mois: number; annee: number } => ({ mois: Number(aaaaMm.slice(5, 7)) - 1, annee: Number(aaaaMm.slice(0, 4)) });
export const jourCourt = (j: Jour): string => `${Number(j.slice(8, 10))} ${MOIS_COURTS[Number(j.slice(5, 7)) - 1]}`;
export { MOIS_FR, MOIS_COURTS };

/** Filtre (segment, recherche, responsables) puis trie. Les égalités gardent l'ordre alphabétique. */
export function filtrerEtTrier(
  m: ModeleClients,
  o: { segment: SegmentClient; recherche: string; responsables: ReadonlySet<string>; tri: TriClient },
): TuileClient[] {
  const q = accent(o.recherche.trim());
  const garde = (t: TuileClient): boolean => {
    if (o.segment === 'actifs' && !t.actif) return false;
    if (o.segment === 'aRelancer' && t.statut !== 'À relancer') return false;
    if (o.segment === 'impayes' && t.statut !== 'Impayé') return false;
    if (q && !t.recherche.includes(q)) return false;
    if (o.responsables.size > 0 && !(t.responsable && o.responsables.has(t.responsable.email))) return false;
    return true;
  };
  const cmp: Record<TriClient, (a: TuileClient, b: TuileClient) => number> = {
    aTraiter: (a, b) => comparerATraiter({ statut: a.statut, retardMaxJours: a.retardMaxJours, sante: a.sante, dernierEchangeAt: a.dernierEchangeAt }, { statut: b.statut, retardMaxJours: b.retardMaxJours, sante: b.sante, dernierEchangeAt: b.dernierEchangeAt }),
    sante: (a, b) => a.sante - b.sante,
    nom: (a, b) => a.nom.localeCompare(b.nom, 'fr'),
    facture: (a, b) => b.factureCents - a.factureCents,
    echange: (a, b) => b.dernierEchangeAt.localeCompare(a.dernierEchangeAt),
  };
  return m.tuiles.filter(garde).sort((a, b) => cmp[o.tri](a, b) || a.nom.localeCompare(b.nom, 'fr'));
}

export const TAILLE_PAGE = 12;

export function pageDe<T>(liste: readonly T[], page: number, taille = TAILLE_PAGE): { elements: T[]; debut: number; fin: number; total: number; pages: number } {
  const pages = Math.max(1, Math.ceil(liste.length / taille));
  const p = Math.min(Math.max(0, page), pages - 1);
  const elements = liste.slice(p * taille, p * taille + taille);
  return { elements, debut: liste.length === 0 ? 0 : p * taille + 1, fin: p * taille + elements.length, total: liste.length, pages };
}

/** La part de chaque couleur de santé dans la barre empilée : 31 / 11 / 6 sur 48 → 64,6 / 22,9 / 12,5 %. */
export function partsDeLaBarre(p: ModeleClients['portefeuille']): { bonne: number; aSurveiller: number; fragile: number } {
  const total = p.bonne + p.aSurveiller + p.fragile;
  return total === 0 ? { bonne: 0, aSurveiller: 0, fragile: 0 } : { bonne: p.bonne / total, aSurveiller: p.aSurveiller / total, fragile: p.fragile / total };
}

/** Le dernier recours : un jour avant `aujourdhui`, pour dater un client sans historique. */
export const veille = (aujourdhui: Jour): Jour => ajouterJours(aujourdhui, -1);
export { totauxDeLignes, initialesDe };

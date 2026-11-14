import { totauxDeFacture } from '../donnees/argent';
import type { CompteFidelite, Facture } from '../donnees/types';
import { ajouterJours, ecartJours, type Jour } from './commun';

/**
 * LOT-02 · LA FIDÉLITÉ (MC02) — logique pure.
 *
 * Règles de la fiche MC02 : 1 € facturé et payé = 1 point (TTC, arrondi à l'euro inférieur), un
 * avis = 50, un client recommandé = 200, sur 12 mois glissants ; Bronze dès 0, Argent dès 800, Or
 * dès 1 800 (réglables). Le jeu de SIM (`derives.ts › genererFidelite`) suit les mêmes règles depuis
 * le 14 nov. : un écran REFAIT le calcul à partir des sources (`pointsProgramme`), le jeu sert à comparer.
 *
 * LES DEUX FORMULES (décision du CO, `STATUT.md` §1.28). Les points et niveaux de MC02
 * sont l'écran. La carte à tampons de l'écran actuel `/fidelite` (`LoyaltyScreen` :
 * 10 tampons, le onzième offert, collection `loyaltyCards`) reste une formule au choix
 * de l'organisation, et c'est la formule PAR DÉFAUT là où elle sert déjà.
 */

export type Formule = 'points' | 'tampons';

/** Nombre de tampons d'une carte pleine (`SEUIL` de `LoyaltyScreen`). */
export const TAMPONS_PAR_CARTE = 10;

/**
 * La formule d'une organisation : son choix s'il existe ; sinon « tampons » dès qu'elle a
 * déjà des cartes (on ne retire rien à qui s'en sert), « points » pour une organisation neuve.
 */
export function formuleDe(choix: Formule | null, nbCartesATampons: number): Formule {
  return choix ?? (nbCartesATampons > 0 ? 'tampons' : 'points');
}

export interface ProgressionTampons {
  /** Tampons sur la carte en cours (0 à `TAMPONS_PAR_CARTE`). */
  tampons: number;
  /** Tampons qui manquent pour la récompense ; 0 quand la carte est pleine. */
  manque: number;
  pleine: boolean;
}

/** Une carte à tampons : la récompense est due dès que la carte est pleine. */
export function progressionTampons(tampons: number): ProgressionTampons {
  const n = Math.max(0, Math.min(TAMPONS_PAR_CARTE, Math.floor(tampons)));
  return { tampons: n, manque: TAMPONS_PAR_CARTE - n, pleine: n >= TAMPONS_PAR_CARTE };
}


export type Niveau = CompteFidelite['niveau'];

/** Un palier : son nom et le nombre de points à partir duquel on y est. */
export interface Palier {
  niveau: Niveau;
  depuis: number;
}

/**
 * Les paliers de la FICHE MC02 (réglables) : Bronze 0 à 799, Argent 800 à 1 799, Or dès 1 800,
 * sur 12 mois glissants. C'est la référence de l'écran.
 */
export const PALIERS: readonly Palier[] = [
  { niveau: 'Bronze', depuis: 0 },
  { niveau: 'Argent', depuis: 800 },
  { niveau: 'Or', depuis: 1800 },
];

export const niveauPour = (points: number, paliers: readonly Palier[] = PALIERS): Niveau =>
  [...paliers].reverse().find((p) => points >= p.depuis)?.niveau ?? 'Bronze';

/** Les points d'un client : 1 par euro payé (TTC) sur les 12 derniers mois. */
export function pointsDe(factures: readonly Facture[], clientId: number, aujourdhui: Jour): number {
  const an = `${Number(aujourdhui.slice(0, 4)) - 1}${aujourdhui.slice(4)}`;
  return factures
    .filter((f) => f.clientId === clientId && f.status === 'paid' && f.paidAt >= an && f.paidAt <= aujourdhui)
    .reduce((s, f) => s + Math.floor(totauxDeFacture(f).ttcCents / 100), 0);
}

export interface Progression {
  niveau: Niveau;
  suivant: Niveau | null;
  /** Points qui manquent pour le niveau suivant ; `null` au dernier niveau. */
  manque: number | null;
  /** 0 à 1 dans le niveau courant ; 1 au dernier niveau. */
  part: number;
}

export function progression(points: number, paliers: readonly Palier[] = PALIERS): Progression {
  const i = paliers.reduce((k, p, j) => (points >= p.depuis ? j : k), 0);
  const courant = paliers[i];
  const suivant = paliers[i + 1];
  if (!suivant) return { niveau: courant.niveau, suivant: null, manque: null, part: 1 };
  return {
    niveau: courant.niveau,
    suivant: suivant.niveau,
    manque: suivant.depuis - points,
    part: (points - courant.depuis) / (suivant.depuis - courant.depuis),
  };
}

export interface ResumeFidelite {
  parNiveau: Record<Niveau, number>;
  total: number;
  /** Valeur des avantages encore « Offert » (à utiliser), en centimes. */
  avantagesOffertsCents: number;
  /** Comptes sans activité depuis plus de `joursInactif` jours : une attention à leur porter. */
  inactifs: number;
}

export function resumeFidelite(comptes: readonly CompteFidelite[], aujourdhui: Jour, joursInactif = 90): ResumeFidelite {
  const limite = ajouterJours(aujourdhui, -joursInactif);
  const parNiveau: Record<Niveau, number> = { Bronze: 0, Argent: 0, Or: 0 };
  for (const c of comptes) parNiveau[c.niveau] += 1;
  return {
    parNiveau,
    total: comptes.length,
    avantagesOffertsCents: comptes.reduce((s, c) => s + c.avantages.filter((a) => a.statut === 'Offert').reduce((t, a) => t + a.valeurCents, 0), 0),
    inactifs: comptes.filter((c) => c.derniereActiviteLe < limite).length,
  };
}

/** Un compte est cohérent quand son niveau découle de ses points : sert à contrôler les jeux et les écrans. */
export const niveauCoherent = (c: Pick<CompteFidelite, 'points' | 'niveau'>, paliers: readonly Palier[] = PALIERS): boolean => niveauPour(c.points, paliers) === c.niveau;

/* ------------------------------ Le programme (fiche MC02) ------------------------------ */

/** « Règles du programme » (réglage) : 1 € facturé et payé = 1 point, un avis = 50, un client recommandé = 200. */
export interface ReglesProgramme {
  pointsParEuro: number;
  pointsParAvis: number;
  pointsParRecommandation: number;
  /** Un client à moins de ce nombre de points du palier suivant est mis en avant (proposition de la fiche : 100). */
  seuilBientot: number;
}

export const REGLES_PROGRAMME: ReglesProgramme = { pointsParEuro: 1, pointsParAvis: 50, pointsParRecommandation: 200, seuilBientot: 100 };

export interface ActiviteClient {
  clientId: number;
  factures: readonly Facture[];
  /** Jours des avis laissés par ce client. */
  avis: readonly Jour[];
  /** Jours où ce client en a recommandé un autre. */
  recommandations: readonly Jour[];
}

/**
 * Les points du programme sur 12 mois glissants : euros payés, avis, recommandations. Jamais de
 * point retiré pour punir : la fonction ne fait qu'additionner.
 */
export function pointsProgramme(a: ActiviteClient, aujourdhui: Jour, regles: ReglesProgramme = REGLES_PROGRAMME): number {
  const an = `${Number(aujourdhui.slice(0, 4)) - 1}${aujourdhui.slice(4)}`;
  const dans = (j: Jour) => j >= an && j <= aujourdhui;
  const euros = a.factures
    .filter((f) => f.clientId === a.clientId && f.status === 'paid' && dans(f.paidAt))
    .reduce((s, f) => s + Math.floor((totauxDeFacture(f).ttcCents / 100) * regles.pointsParEuro), 0);
  return euros + a.avis.filter(dans).length * regles.pointsParAvis + a.recommandations.filter(dans).length * regles.pointsParRecommandation;
}

/** « Plus que {n} points » : le client est à moins de `seuilBientot` points du palier suivant. */
export function bientotAuPalier(points: number, paliers: readonly Palier[] = PALIERS, regles: ReglesProgramme = REGLES_PROGRAMME): { manque: number; vers: Niveau } | null {
  const p = progression(points, paliers);
  return p.suivant && p.manque != null && p.manque < regles.seuilBientot ? { manque: p.manque, vers: p.suivant } : null;
}

/**
 * Un palier ne se perd qu'après 12 mois sans activité, et la personne en est prévenue avant :
 * `prevenir` s'allume `prevenirAvantJours` jours avant l'échéance.
 */
export function descenteDePalier(derniereActiviteLe: Jour, niveau: Niveau, aujourdhui: Jour, prevenirAvantJours = 30): { descend: boolean; prevenir: boolean; vers: Niveau | null } {
  const inactif = Math.max(0, ecartJours(derniereActiviteLe, aujourdhui));
  const vers: Niveau | null = niveau === 'Or' ? 'Argent' : niveau === 'Argent' ? 'Bronze' : null;
  return { descend: vers != null && inactif >= 365, prevenir: vers != null && inactif >= 365 - prevenirAvantJours && inactif < 365, vers };
}

/** Clients fidèles = au moins 1 point actif sur 12 mois ÷ clients actifs. `null` sans client actif. */
export const partFideles = (clientsAvecPoints: number, clientsActifs: number): number | null => (clientsActifs === 0 ? null : clientsAvecPoints / clientsActifs);

/**
 * Sur chaque barreau, au plus `max` clients (les plus proches du palier suivant d'abord, puis les
 * plus actifs) ; les autres sont comptés dans « N autres clients ».
 */
export function clientsAffiches<T extends { points: number; derniereActiviteLe: Jour }>(clients: readonly T[], paliers: readonly Palier[], max = 4): { affiches: T[]; autres: number } {
  const manque = (c: T) => progression(c.points, paliers).manque ?? Number.POSITIVE_INFINITY;
  const tries = [...clients].sort((a, b) => manque(a) - manque(b) || b.derniereActiviteLe.localeCompare(a.derniereActiviteLe));
  return { affiches: tries.slice(0, max), autres: Math.max(0, tries.length - max) };
}

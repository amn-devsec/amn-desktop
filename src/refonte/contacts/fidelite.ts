import { totauxDeFacture } from '../donnees/argent';
import type { CompteFidelite, Facture } from '../donnees/types';
import { ajouterJours, type Jour } from './commun';

/**
 * LOT-02 · LA FIDÉLITÉ (MC02) — logique pure.
 *
 * Les règles sont celles du jeu de SIM (`derives.ts › genererFidelite`), qui suit
 * la fiche : 1 point par euro encaissé (TTC, arrondi à l'euro inférieur) sur les
 * 12 derniers mois ; Bronze dès 0, Argent dès 500 points, Or dès 1 500. Un écran
 * REFAIT ce calcul à partir des factures : le jeu sert à comparer, pas à recopier.
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

export const PALIERS: readonly { niveau: Niveau; depuis: number }[] = [
  { niveau: 'Bronze', depuis: 0 },
  { niveau: 'Argent', depuis: 500 },
  { niveau: 'Or', depuis: 1500 },
];

export const niveauPour = (points: number): Niveau => [...PALIERS].reverse().find((p) => points >= p.depuis)?.niveau ?? 'Bronze';

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

export function progression(points: number): Progression {
  const i = PALIERS.reduce((k, p, j) => (points >= p.depuis ? j : k), 0);
  const courant = PALIERS[i];
  const suivant = PALIERS[i + 1];
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
export const niveauCoherent = (c: Pick<CompteFidelite, 'points' | 'niveau'>): boolean => niveauPour(c.points) === c.niveau;

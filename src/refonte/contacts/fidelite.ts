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
 * À ne pas confondre avec l'écran actuel `/fidelite` (`LoyaltyScreen`) : c'est une
 * carte à tampons (10 tampons, le onzième offert), une autre mécanique, qui vit
 * dans la collection `loyaltyCards`. Voir la note du lot.
 */

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

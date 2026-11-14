import { plafonner } from './commun';

/**
 * L01 · SÉRIES ET JALONS — l'escalier, les rails et les médailles (fiche L01, rubriques 6 et 9). Logique pure.
 *
 * Rien ne se perd, rien ne se compare : un palier atteint reste acquis (le record le dit), une médaille non obtenue est « à gagner »
 * (jamais « manquée »), aucun nombre ne classe personne. Les paliers de H04 vont jusqu'à 100 ; l'escalier de L01 monte jusqu'à 365.
 */

export const PALIERS_DE_L_ESCALIER = [5, 10, 20, 30, 50, 100, 200, 365] as const;
/** Le badge « Série de 7 jours » (losange sur le chemin). */
export const BADGE_SERIE = 7;

export type EtatDeNoeud = 'parcouru' | 'ici' | 'prochain' | 'avenir' | 'badge' | 'pas';
export interface NoeudDeLEscalier {
  /** Jours de suite à ce nœud ; `0` : le départ. */
  jours: number;
  etat: EtatDeNoeud;
  /** Un palier (disque) ou un simple jour (petit rond) ou un badge (losange). */
  genre: 'depart' | 'palier' | 'jour' | 'badge';
}

/**
 * Les nœuds du chemin, de gauche à droite : le départ, chaque palier, le jour où l'on est, le badge de 7 jours, et les jours entre la
 * position et le prochain palier (petits ronds). Au-delà du prochain palier, les paliers sont « à venir ». Le record n'est pas un nœud :
 * c'est un drapeau planté après le dernier palier qu'il a franchi.
 */
export function noeudsDeLEscalier(serie: number, record: number): NoeudDeLEscalier[] {
  const noeuds: NoeudDeLEscalier[] = [{ jours: 0, etat: 'parcouru', genre: 'depart' }];
  const prochain = PALIERS_DE_L_ESCALIER.find((p) => p > serie) ?? null;
  const vus = new Set<number>();
  const ajouter = (n: NoeudDeLEscalier) => {
    const cle = n.jours * 10 + (n.genre === 'badge' ? 1 : 0);
    if (vus.has(cle)) return;
    vus.add(cle);
    noeuds.push(n);
  };
  for (const p of PALIERS_DE_L_ESCALIER) {
    if (p <= serie) ajouter({ jours: p, etat: 'parcouru', genre: 'palier' });
  }
  if (serie > 0 && !PALIERS_DE_L_ESCALIER.includes(serie as (typeof PALIERS_DE_L_ESCALIER)[number])) ajouter({ jours: serie, etat: 'ici', genre: 'jour' });
  if (BADGE_SERIE > serie) ajouter({ jours: BADGE_SERIE, etat: 'badge', genre: 'badge' });
  if (prochain !== null) {
    for (let j = Math.max(serie + 1, 1); j < prochain; j += 1) if (j !== BADGE_SERIE && prochain - serie <= 6) ajouter({ jours: j, etat: 'pas', genre: 'jour' });
    ajouter({ jours: prochain, etat: 'prochain', genre: 'palier' });
  }
  for (const p of PALIERS_DE_L_ESCALIER) if (prochain !== null && p > prochain) ajouter({ jours: p, etat: 'avenir', genre: 'palier' });
  void record;
  return noeuds.sort((a, b) => a.jours - b.jours || (a.genre === 'badge' ? 1 : 0) - (b.genre === 'badge' ? 1 : 0));
}

/** Le palier après lequel planter le drapeau du record : le plus grand palier atteint par le record (`null` : aucun). */
export const palierDuRecord = (record: number): number | null => [...PALIERS_DE_L_ESCALIER].reverse().find((p) => p <= record) ?? null;

export interface Rail {
  valeur: number;
  /** Marques franchies, la prochaine, puis celles à venir. */
  marques: { valeur: number; etat: 'atteinte' | 'prochaine' | 'avenir' }[];
  prochaine: number | null;
  /** « encore 13 » : ce qu'il reste jusqu'à la prochaine marque. */
  reste: number | null;
  progression: number;
}

export const MARQUES_TACHES = [10, 50, 100, 250] as const;
export const MARQUES_BOITE_A_ZERO = [5, 10, 20, 30] as const;
export const MARQUES_RITUELS = [5, 10, 20, 50] as const;

/** Un rail de compteur : jamais décroissant, jamais « raté ». Au-delà de la dernière marque, il n'y a plus de prochaine. */
export function railDeCompteur(valeur: number, marques: readonly number[]): Rail {
  const v = Math.max(0, Math.trunc(valeur));
  const prochaine = marques.find((m) => m > v) ?? null;
  const precedente = [...marques].reverse().find((m) => m <= v) ?? 0;
  return {
    valeur: v,
    marques: marques.map((m) => ({ valeur: m, etat: m <= v ? 'atteinte' : m === prochaine ? 'prochaine' : 'avenir' })),
    prochaine,
    reste: prochaine === null ? null : prochaine - v,
    progression: prochaine === null ? 1 : plafonner((v - precedente) / (prochaine - precedente)),
  };
}

export type Medaille = 'obtenue' | 'a-gagner';
/** Une médaille ne se retire jamais : obtenue, elle le reste ; sinon elle dit « à gagner ». */
export const etatDeMedaille = (obtenueLe: string | null): Medaille => (obtenueLe ? 'obtenue' : 'a-gagner');

/** « n sur N obtenus ». */
export const medaillesObtenues = (medailles: readonly { obtenueLe: string | null }[]): { obtenues: number; total: number } => ({ obtenues: medailles.filter((m) => m.obtenueLe).length, total: medailles.length });

import type { BandeChaleur, PointChaleur } from './modele';
import { SATISFACTION_MAX, SATISFACTION_MIN } from './modele';

/**
 * LA GÉOMÉTRIE DU NUAGE « CHALEUR DES RELATIONS » (logique pure) : où tombe un client sur le tracé, quel rayon, quels noms écrire.
 * Séparée du composant pour être contrôlée sans navigateur (`check:contacts`).
 */

/** Les trois bandes, en part de la largeur utile : 42 % / 34 % / 24 % (fiche F10). */
export const PARTS_BANDES: Record<BandeChaleur, number> = { chaleureuse: 0.42, aEntretenir: 0.34, refroidie: 0.24 };

/** Jours → part de la largeur (0 à 1), linéaire dans chaque bande ; « 60 j et plus » touche le bord. */
export function positionX(jours: number): number {
  if (jours < 7) return (jours / 7) * PARTS_BANDES.chaleureuse;
  if (jours < 30) return PARTS_BANDES.chaleureuse + ((jours - 7) / 23) * PARTS_BANDES.aEntretenir;
  return PARTS_BANDES.chaleureuse + PARTS_BANDES.aEntretenir + (Math.min(30, jours - 30) / 30) * PARTS_BANDES.refroidie;
}

/** Marges du tracé : la rangée des étiquettes de bande au-dessus de 5,0 (18,5 %), un peu d'air sous 3,0 (11,5 %). Mesurées sur l'image F10. */
export const MARGE_HAUT = 0.185;
export const MARGE_BAS = 0.115;

/** Satisfaction → part de la hauteur du tracé (5,0 vers le haut, 3,0 vers le bas, dans les marges ci-dessus). */
export const positionY = (sat: number): number =>
  MARGE_HAUT + (1 - (Math.min(SATISFACTION_MAX, Math.max(SATISFACTION_MIN, sat)) - SATISFACTION_MIN) / (SATISFACTION_MAX - SATISFACTION_MIN)) * (1 - MARGE_HAUT - MARGE_BAS);

/** La largeur de dessin du tracé (692 px, la fiche) : sert à éviter que deux noms se recouvrent. */
const LARGEUR_TRACE = 692;
const HAUTEUR_TRACE = 178;

/**
 * Quels noms écrire : les points nommés, par ordre de valeur, SANS recouvrir un nom déjà posé ni un autre point nommé.
 * Un nom qui n'a pas de place reste lisible au survol et au clavier (la bulle) ; la fiche : « aucun point anonyme sous une étiquette ».
 */
export function nomsAffiches(points: readonly PointChaleur[], choisi: number | null): Set<number> {
  const posés: { x0: number; x1: number; y0: number; y1: number }[] = [];
  const garde = (x0: number, x1: number, y0: number, y1: number) => posés.push({ x0, x1, y0, y1 });
  const montres = new Set<number>();
  const ordre = [...points].filter((p) => p.nomme).sort((a, b) => b.valeurCents - a.valeurCents);
  // Les points eux-mêmes comptent comme obstacles (nommés et anonymes).
  for (const p of points) {
    const x = positionX(p.jours) * LARGEUR_TRACE;
    const y = positionY(p.satisfaction) * HAUTEUR_TRACE;
    garde(x - 6, x + 6, y - 6, y + 6);
  }
  for (const p of ordre) {
    if (p.clientId === choisi) continue;
    const x = positionX(p.jours) * LARGEUR_TRACE;
    const y = positionY(p.satisfaction) * HAUTEUR_TRACE;
    const largeur = p.nom.length * 6.3 + 4;
    const rect = { x0: x + 12, x1: x + 12 + largeur, y0: y - 8, y1: y + 8 };
    // Le propre point du nom est un obstacle : on le retire du test pour ce nom seulement.
    const autres = posés.filter((b) => !(Math.abs((b.x0 + b.x1) / 2 - x) < 1 && Math.abs((b.y0 + b.y1) / 2 - y) < 1));
    if (rect.x1 <= LARGEUR_TRACE && !autres.some((b) => rect.x0 < b.x1 && rect.x1 > b.x0 && rect.y0 < b.y1 && rect.y1 > b.y0)) {
      montres.add(p.clientId);
      garde(rect.x0, rect.x1, rect.y0, rect.y1);
    }
  }
  return montres;
}

/** Rayon : 5 à 9 px pour un point nommé selon la valeur, 3 à 4,5 px pour un anonyme. */
export function rayonDuPoint(p: Pick<PointChaleur, 'nomme' | 'valeurCents'>, plafond: number): number {
  const part = plafond > 0 ? Math.min(1, p.valeurCents / plafond) : 0;
  return p.nomme ? 5 + part * 4 : 3 + part * 1.5;
}


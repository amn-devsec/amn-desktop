import type { Point } from '../../tournees';

/**
 * Plan SCHÉMATIQUE (STATUT §1.27 n° 5) : pas de géocodage, donc les repères sont posés sur une courbe douce, dans l'ordre
 * de la tournée. `points[0]` est le départ. Déterministe : n étapes, mêmes positions.
 */
export function pointsSchematiques(n: number): Point[] {
  const sortie: Point[] = [{ x: 16, y: 18 }];
  for (let i = 1; i <= n; i += 1) {
    const t = i / Math.max(1, n);
    sortie.push({ x: 22 + 52 * Math.sin(t * Math.PI * 0.9) + (i % 2 === 0 ? 6 : -4), y: 20 + 56 * t });
  }
  return sortie;
}

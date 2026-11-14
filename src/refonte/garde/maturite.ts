/**
 * LES NIVEAUX DE MATURITÉ (LOT-08, H34 ; STATUT §1.8 n° 2 et §1.11) — purs.
 *
 * Le score fait foi (`scoreDe`, sur 100, `bureaux/donnees/cyber.ts`) ; le niveau
 * n'en est qu'une lecture : cinq niveaux, par tranches de 20 points.
 *
 *   niveau 1 : 0 à 19 · niveau 2 : 20 à 39 · niveau 3 : 40 à 59
 *   niveau 4 : 60 à 79 · niveau 5 : 80 à 100
 *
 * Les noms de niveaux ne sont pas décidés : cette fonction rend un nombre.
 */
export type Niveau = 1 | 2 | 3 | 4 | 5;
export const TRANCHE_DE_NIVEAU = 20;

function borne(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.min(100, Math.max(0, Math.round(score)));
}

export function niveauDeScore(score: number): Niveau {
  return Math.min(5, Math.floor(borne(score) / TRANCHE_DE_NIVEAU) + 1) as Niveau;
}

/** Les points qui manquent pour atteindre le niveau suivant ; `0` au niveau 5. */
export function pointsAuNiveauSuivant(score: number): number {
  const s = borne(score);
  const n = niveauDeScore(s);
  return n === 5 ? 0 : n * TRANCHE_DE_NIVEAU - s;
}

/** Le seuil du niveau suivant, ou `null` au niveau maximal. */
export function seuilDuNiveauSuivant(score: number): number | null {
  const n = niveauDeScore(score);
  return n === 5 ? null : n * TRANCHE_DE_NIVEAU;
}

/** Le plus petit score du niveau (le seuil à partir duquel on y est). */
export function seuilDuNiveau(niveau: Niveau): number {
  return (niveau - 1) * TRANCHE_DE_NIVEAU;
}

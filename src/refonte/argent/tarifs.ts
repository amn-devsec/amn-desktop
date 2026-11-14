import { arrondi, pourcentage } from './commun';

/**
 * TARIFS ET REMISES (MA12) — marge, marge moyenne, remises, variations de prix.
 *
 * Une remise ne fait jamais descendre un prix sous zéro ; une remise qui passe sous
 * le coût de revient est signalée (`sousLeCout`), jamais refusée : c'est un choix
 * commercial, la personne décide.
 */

/** Marge sur le prix de vente, en % à une décimale ; `null` sans coût connu ou sans prix. */
export function margePct(prixCents: number, coutCents: number | null): number | null {
  if (coutCents === null || !prixCents) return null;
  return pourcentage(prixCents - coutCents, prixCents, 1);
}

export type Remise = { type: 'pct'; valeur: number } | { type: 'montant'; cents: number };

export function appliquerRemise(prixCents: number, remise: Remise, coutCents: number | null): { prixCents: number; remiseCents: number; sousLeCout: boolean } {
  const brute = remise.type === 'pct' ? arrondi((prixCents * Math.min(100, Math.max(0, remise.valeur))) / 100) : Math.max(0, remise.cents);
  const remiseCents = Math.min(prixCents, brute);
  const prix = prixCents - remiseCents;
  return { prixCents: prix, remiseCents, sousLeCout: coutCents !== null && prix < coutCents };
}

/**
 * Marge moyenne pondérée par les ventes du mois : Σ (prix − coût) × ventes ÷ Σ prix × ventes,
 * sur les prestations actives dont le coût est connu.
 */
export function margeMoyennePonderee(prestations: readonly { prixCents: number; coutCents: number | null; ventesMois: number; etat: string }[]): number | null {
  const l = prestations.filter((p) => p.etat === 'active' && p.coutCents !== null && p.ventesMois > 0);
  const ca = l.reduce((s, p) => s + p.prixCents * p.ventesMois, 0);
  const marge = l.reduce((s, p) => s + (p.prixCents - (p.coutCents as number)) * p.ventesMois, 0);
  return pourcentage(marge, ca, 1);
}

/** La variation d'un prix, en % à une décimale. */
export const variationPct = (ancienCents: number, nouveauCents: number): number | null => pourcentage(nouveauCents - ancienCents, ancienCents, 1);

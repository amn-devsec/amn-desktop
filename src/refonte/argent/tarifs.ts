import { arrondi, pourcentage } from './commun';

/**
 * TARIFS ET REMISES (MA12) — fiche v4, rubrique 6. Montants HT (proposition, à valider par un comptable).
 *
 *   · marge = (prix − coût) ÷ prix, arrondie à l'entier, 0,5 vers le haut (2 400 / 900 → 63 %) ;
 *   · couleur : verte si ≥ objectif (55 %), orange entre objectif − 20 points et
 *     l'objectif, rouge en dessous ou si négative ;
 *   · simulateur : prix payé = prix × (1 − remise) ; marge sur le prix payé ; effet sur
 *     un mois = (nouveau prix payé − prix actuel) × quantité vendue du mois ;
 *   · une remise au-delà de 5 % (plafond sans accord, réglage) demande l'accord d'un
 *     administrateur ;
 *   · une remise qui passe sous le coût est signalée (`sousLeCout`), jamais refusée.
 * Coûts et marges ne sont visibles que des administrateurs (droit de l'écran).
 */
export const OBJECTIF_MARGE_PCT = 55;
export const REMISE_SANS_ACCORD_PCT = 5;

/** Marge sur le prix, en % entier ; `null` sans coût connu ou sans prix. */
export function margePct(prixCents: number, coutCents: number | null): number | null {
  if (coutCents === null || !prixCents) return null;
  return pourcentage(prixCents - coutCents, prixCents, 0);
}

export function couleurMarge(marge: number | null, objectif = OBJECTIF_MARGE_PCT): 'verte' | 'orange' | 'rouge' | null {
  if (marge === null) return null;
  if (marge < 0 || marge < objectif - 20) return 'rouge';
  return marge >= objectif ? 'verte' : 'orange';
}

/** Marge par vente = prix − coût (« par heure » pour une unité horaire, « à chaque vente » sinon). */
export const margeParVente = (prixCents: number, coutCents: number | null): number | null => (coutCents === null ? null : prixCents - coutCents);

export type Remise = { type: 'pct'; valeur: number } | { type: 'montant'; cents: number };

export function appliquerRemise(prixCents: number, remise: Remise, coutCents: number | null): { prixCents: number; remiseCents: number; sousLeCout: boolean; accordRequis: boolean } {
  const brute = remise.type === 'pct' ? arrondi((prixCents * Math.min(100, Math.max(0, remise.valeur))) / 100) : Math.max(0, remise.cents);
  const remiseCents = Math.min(prixCents, brute);
  const prix = prixCents - remiseCents;
  const pct = prixCents > 0 ? (remiseCents / prixCents) * 100 : 0;
  return { prixCents: prix, remiseCents, sousLeCout: coutCents !== null && prix < coutCents, accordRequis: pct > REMISE_SANS_ACCORD_PCT };
}

/** L'effet d'un nouveau prix sur un mois : (nouveau prix − prix actuel) × quantité vendue du mois. */
export const effetSurUnMois = (prixActuelCents: number, nouveauPrixCents: number, quantiteMois: number): number => (nouveauPrixCents - prixActuelCents) * quantiteMois;

/** Marge moyenne pondérée par les ventes de la période, en % entier : Σ (prix − coût) × ventes ÷ Σ prix × ventes. */
export function margeMoyennePonderee(prestations: readonly { prixCents: number; coutCents: number | null; ventesMois: number; etat: string }[]): number | null {
  const l = prestations.filter((p) => p.etat === 'active' && p.coutCents !== null && p.ventesMois > 0);
  const ca = l.reduce((s, p) => s + p.prixCents * p.ventesMois, 0);
  const marge = l.reduce((s, p) => s + (p.prixCents - (p.coutCents as number)) * p.ventesMois, 0);
  return pourcentage(marge, ca, 0);
}

/** « Remises accordées » du mois : Σ (prix de la grille − prix facturé), sur les lignes remisées. */
export const remisesAccordees = (lignes: readonly { prixGrilleCents: number; prixFactureCents: number; quantite: number }[]): number =>
  lignes.reduce((s, l) => s + Math.max(0, l.prixGrilleCents - l.prixFactureCents) * l.quantite, 0);

/** La suggestion de MA12 : +10 %, arrondi à l'euro supérieur (65 € → 72 €). */
export const prixSuggere = (prixCents: number, hausse = 10): number => Math.ceil((prixCents * (100 + hausse)) / 100 / 100) * 100;

/** La variation d'un prix (historique), en % à une décimale. */
export const variationPct = (ancienCents: number, nouveauCents: number): number | null => pourcentage(nouveauCents - ancienCents, ancienCents, 1);

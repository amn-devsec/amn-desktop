/**
 * Les tons d'état des composants « vivant » (§0.4) — un NOM, jamais une couleur. La feuille `vivant.css`
 * traduit chaque nom en `var(--socle-etat-…)` (noir.css) par `data-ton` : ok `#5ee6a8`, attention `#ffbe5c`,
 * critique `#ff6b7a`, info `#6ea8ff`. « neutre » est l'encre principale (T1) ou, pour un lien, T3.
 */
export type TonVivant = 'ok' | 'attention' | 'critique' | 'info';
export type TonVivantNeutre = TonVivant | 'neutre';

export const TONS_VIVANT: readonly TonVivant[] = ['ok', 'attention', 'critique', 'info'];

/** Borne un nombre dans [min, max] ; une valeur non finie vaut `min`. */
export function borner(v: number, min: number, max: number): number {
  return Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : min;
}

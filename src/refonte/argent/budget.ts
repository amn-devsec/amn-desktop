import { arrondi, ecartJours, joursDansMois, moisDe, type Jour, type Mois } from './commun';

/**
 * BUDGET (MA06) — fiche v4, rubrique 6. Montants TTC (proposition, à valider par un comptable).
 *
 *   · dépensé = dépenses du mois rattachées à l'enveloppe (ses catégories) ;
 *   · pourcentage = dépensé ÷ prévu, arrondi — jamais « 100 % » si dépensé < prévu
 *     (99 %), au moins 101 % si dépensé > prévu ;
 *   · état : Dépassé (dépensé > prévu) ; Payé (dépensé = prévu, enveloppe à paiement
 *     unique) ; Presque plein (≥ 90 %, seuil réglable) ; sinon Dans le budget ;
 *   · avancée du mois = jours écoulés ÷ jours du mois ; une enveloppe sous la ligne est
 *     « en avance sur le rythme ».
 */

export const SEUIL_PRESQUE_PLEIN_PCT = 90;

export interface EnveloppeLue {
  id: string;
  nom: string;
  prevuCents: number;
  categories: readonly string[];
  /** `AAAA-MM`. */
  mois: string;
  /** Une enveloppe à paiement unique (les assurances) : « Payé » quand elle est consommée pile. */
  paiementUnique?: boolean;
}

export type EtatEnveloppe = 'dans-le-budget' | 'presque-plein' | 'paye' | 'depasse';

/** Le pourcentage affiché : arrondi, mais jamais 100 % sous le prévu ni au plus 100 % au-dessus. */
export function pourcentageAffiche(depenseCents: number, prevuCents: number): number {
  if (prevuCents <= 0) return depenseCents > 0 ? 101 : 0;
  const p = arrondi((depenseCents / prevuCents) * 100);
  if (depenseCents < prevuCents) return Math.min(p, 99);
  if (depenseCents > prevuCents) return Math.max(p, 101);
  return 100;
}

export function etatEnveloppe(
  e: EnveloppeLue,
  depenses: readonly { amountCents: number; spentAt: string; category: string }[],
  seuilPct = SEUIL_PRESQUE_PLEIN_PCT,
): { depenseCents: number; resteCents: number; pourcentage: number; etat: EtatEnveloppe; debordementCents: number } {
  const depense = depenses.filter((d) => moisDe(d.spentAt) === e.mois && e.categories.includes(d.category)).reduce((s, d) => s + d.amountCents, 0);
  const pct = pourcentageAffiche(depense, e.prevuCents);
  const etat: EtatEnveloppe =
    depense > e.prevuCents ? 'depasse' : depense === e.prevuCents && e.paiementUnique ? 'paye' : (depense / Math.max(1, e.prevuCents)) * 100 >= seuilPct ? 'presque-plein' : 'dans-le-budget';
  return { depenseCents: depense, resteCents: e.prevuCents - depense, pourcentage: pct, etat, debordementCents: Math.max(0, depense - e.prevuCents) };
}

/** L'avancée du mois : jours écoulés (aujourd'hui compris) ÷ jours du mois, en fraction (30 ÷ 31 le 30 oct.). */
export function avanceeDuMois(mois: Mois, aujourdhui: Jour): number {
  const [a, m] = mois.split('-').map(Number);
  const total = joursDansMois(a, m);
  return Math.min(total, Math.max(0, ecartJours(`${mois}-01`, aujourdhui) + 1)) / total;
}

/** Le bandeau de MA06 : budget, dépensé (et %), reste ; « il te restera environ » = reste − prévu demain. */
export function bandeauBudget(enveloppes: readonly { prevuCents: number }[], depensesParEnveloppe: readonly number[], prevuDemainCents = 0): { budgetCents: number; depenseCents: number; pourcentage: number; resteCents: number; resteApresPrevuCents: number } {
  const budget = enveloppes.reduce((s, e) => s + e.prevuCents, 0);
  const depense = depensesParEnveloppe.reduce((s, d) => s + d, 0);
  return { budgetCents: budget, depenseCents: depense, pourcentage: pourcentageAffiche(depense, budget), resteCents: budget - depense, resteApresPrevuCents: budget - depense - prevuDemainCents };
}

/** La couleur de la barre globale de H08 : neutre sous 85 %, orange de 85 à 100 %, rouge au-delà. */
export const couleurBudgetGlobal = (pourcentage: number): 'neutre' | 'orange' | 'rouge' => (pourcentage > 100 ? 'rouge' : pourcentage >= 85 ? 'orange' : 'neutre');

/** « Mois sous le budget » : un mois clos coché si son dépensé ≤ son budget. */
export const moisSousLeBudget = (mois: readonly { depenseCents: number; budgetCents: number }[]): number => mois.filter((m) => m.depenseCents <= m.budgetCents).length;

/**
 * Rééquilibrage (proposition de la fiche) : prendre du prévu à l'enveloppe la MOINS
 * consommée par rapport à l'avancée du mois. Le budget total ne change pas ; aucune
 * dépense n'est modifiée.
 */
export function enveloppeDonneuse<E extends { id: string; prevuCents: number }>(enveloppes: readonly (E & { depenseCents: number })[], avancee: number): E | null {
  const candidates = enveloppes.filter((e) => e.prevuCents > 0 && e.depenseCents < e.prevuCents);
  if (candidates.length === 0) return null;
  return [...candidates].sort((a, b) => a.depenseCents / a.prevuCents - avancee - (b.depenseCents / b.prevuCents - avancee))[0];
}

import { arrondi, ecartJours, joursDansMois, moisDe, type Jour } from './commun';

/**
 * BUDGET (MA06) — les enveloppes du mois : consommé, reste, projection, état.
 *
 * Règles (valeurs de départ adoptées par le CO, STATUT §1.29 n° 3, modifiables) :
 *   · consommé = dépenses du mois de l'enveloppe, dans ses catégories ;
 *   · projection = consommé ramené au mois entier au rythme actuel (mois terminé :
 *     le consommé) ;
 *   · « dépassé » au-delà du prévu ; « à surveiller » dès 80 % ou si la projection
 *     dépasse le prévu ; sinon « dans les clous ».
 */

export const SEUIL_ATTENTION_PCT = 80;

export interface EnveloppeLue {
  id: string;
  nom: string;
  prevuCents: number;
  categories: readonly string[];
  /** `AAAA-MM`. */
  mois: string;
}

export interface EtatEnveloppe {
  consommeCents: number;
  resteCents: number;
  pourcentage: number;
  projectionCents: number;
  etat: 'ok' | 'attention' | 'depasse';
}

export function etatEnveloppe(e: EnveloppeLue, depenses: readonly { amountCents: number; spentAt: string; category: string }[], aujourdhui: Jour): EtatEnveloppe {
  const consomme = depenses.filter((d) => moisDe(d.spentAt) === e.mois && e.categories.includes(d.category)).reduce((s, d) => s + d.amountCents, 0);
  const [a, m] = e.mois.split('-').map(Number);
  const total = joursDansMois(a, m);
  const ecoules = Math.min(total, Math.max(0, ecartJours(`${e.mois}-01`, aujourdhui) + 1));
  const projection = ecoules >= total || ecoules === 0 ? consomme : arrondi((consomme * total) / ecoules);
  const pct = e.prevuCents > 0 ? arrondi((consomme / e.prevuCents) * 100) : consomme > 0 ? 100 : 0;
  const etat: EtatEnveloppe['etat'] = consomme > e.prevuCents ? 'depasse' : pct >= SEUIL_ATTENTION_PCT || projection > e.prevuCents ? 'attention' : 'ok';
  return { consommeCents: consomme, resteCents: e.prevuCents - consomme, pourcentage: pct, projectionCents: projection, etat };
}

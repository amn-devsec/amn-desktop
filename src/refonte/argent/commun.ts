import { roundHalfAwayFromZero } from '../../lib/money';

/**
 * L'ARGENT (LOT-04) — ce que tous les calculs partagent : les jours, les mois,
 * l'arrondi et le format des montants.
 *
 * Tout est pur : ni React, ni réseau, ni lecture de l'horloge (« aujourd'hui »
 * est toujours passé par l'appelant). Les montants sont en CENTIMES ENTIERS ;
 * une seule règle d'arrondi, celle du comptable : 0,5 s'éloigne de zéro
 * (`src/lib/money.ts`), dans les deux sens, pour qu'un avoir soit l'exact
 * opposé de sa facture.
 */

/** Un jour du calendrier, `AAAA-MM-JJ`. */
export type Jour = string;
/** Un mois, `AAAA-MM`. */
export type Mois = string;
export type Langue = 'fr' | 'en';

/** Arrondi commercial, au centime entier. */
export const arrondi = roundHalfAwayFromZero;

const versUtc = (j: Jour): number => {
  const [a, m, d] = j.split('-').map(Number);
  return Date.UTC(a, m - 1, d);
};
const depuisUtc = (ms: number): Jour => new Date(ms).toISOString().slice(0, 10);

export function ajouterJours(j: Jour, n: number): Jour {
  return depuisUtc(versUtc(j) + n * 86_400_000);
}

/** Le nombre de jours de `de` à `a` (positif si `a` est après `de`). */
export function ecartJours(de: Jour, a: Jour): number {
  return Math.round((versUtc(a) - versUtc(de)) / 86_400_000);
}

export const moisDe = (j: Jour): Mois => j.slice(0, 7);

export function joursDansMois(annee: number, mois: number): number {
  return new Date(Date.UTC(annee, mois, 0)).getUTCDate();
}

/** Le jour `jour` du mois `mois` (`AAAA-MM`), ramené au dernier jour d'un mois trop court. */
export function jourDuMois(mois: Mois, jour: number): Jour {
  const [a, m] = mois.split('-').map(Number);
  return `${mois}-${String(Math.min(jour, joursDansMois(a, m))).padStart(2, '0')}`;
}

export function moisSuivant(mois: Mois, n = 1): Mois {
  const [a, m] = mois.split('-').map(Number);
  const t = a * 12 + (m - 1) + n;
  return `${Math.floor(t / 12)}-${String((t % 12) + 1).padStart(2, '0')}`;
}

/** Le lundi de la semaine d'un jour. */
export function lundiDe(j: Jour): Jour {
  const jourSemaine = new Date(versUtc(j)).getUTCDay(); // 0 = dimanche
  return ajouterJours(j, -((jourSemaine + 6) % 7));
}

/** Un instant ISO ou un jour → le jour (la partie `AAAA-MM-JJ`). */
export const jourDe = (valeur: string): Jour => valeur.slice(0, 10);

/** « 1 263,56 € » (fr) ou « €1,263.56 » (en). */
export function formaterMontant(cents: number, langue: Langue = 'fr'): string {
  return new Intl.NumberFormat(langue === 'en' ? 'en-GB' : 'fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
    (Number.isFinite(cents) ? cents : 0) / 100,
  );
}

/** « 20/10/2026 » (fr) ou « 20/10/2026 » (en-GB) : une date de document, sans le jour de la semaine. */
export function formaterJour(j: Jour, langue: Langue = 'fr'): string {
  const [a, m, d] = j.split('-');
  return langue === 'en' ? `${d}/${m}/${a}` : `${d}/${m}/${a}`;
}

/** Un pourcentage à une décimale près (`62`, `47.5`), ou `null` quand le dénominateur est nul. */
export function pourcentage(numerateur: number, denominateur: number, decimales = 1): number | null {
  if (!denominateur) return null;
  const f = 10 ** decimales;
  return arrondi((numerateur / denominateur) * 100 * f) / f;
}

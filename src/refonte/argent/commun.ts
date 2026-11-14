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

/**
 * Un montant au format des fiches (G03 rubrique 6) : espace fine insécable pour les
 * milliers, espace insécable avant « € », virgule décimale, vrai signe moins « − »
 * (U+2212). Mode `exact` (documents, lignes, totaux) : toujours deux décimales
 * (« 1 250,00 € ») ; mode `compact` (bandes, listes) : sans décimales si le montant est
 * rond (« 1 250 € »), deux sinon (« 62,40 € »).
 *
 * Ce format ne sert plus, à la construction, qu'aux textes envoyés aux clients : les
 * écrans liront `src/socle/formats.ts` (STATUT §1.29 n° 8).
 */
export function formaterMontant(cents: number, langue: Langue = 'fr', mode: 'exact' | 'compact' = 'exact'): string {
  const c = Number.isFinite(cents) ? cents : 0;
  const decimales = mode === 'compact' && c % 100 === 0 ? 0 : 2;
  const texte = new Intl.NumberFormat(langue === 'en' ? 'en-GB' : 'fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: decimales, maximumFractionDigits: decimales }).format(c / 100);
  return texte.replace('-', '\u2212');
}

/** Arrondi à la centaine d'euros (les étiquettes de trésorerie : « 22 200 € »). */
export const arrondirCentaine = (cents: number): number => arrondi(cents / 10_000) * 10_000;

/** Le jour ouvré (lundi à vendredi) `n` jours ouvrés avant `j` (jours fériés non comptés : à confirmer). */
export function joursOuvresAvant(j: Jour, n: number): Jour {
  let d = j;
  let reste = n;
  while (reste > 0) {
    d = ajouterJours(d, -1);
    const js = new Date(`${d}T12:00:00Z`).getUTCDay();
    if (js !== 0 && js !== 6) reste -= 1;
  }
  return d;
}

/** « 20/10/2026 » (fr) ou « 20/10/2026 » (en-GB) : une date de document, sans le jour de la semaine. */
export function formaterJour(j: Jour, langue: Langue = 'fr'): string {
  const [a, m, d] = j.split('-');
  return langue === 'en' ? `${d}/${m}/${a}` : `${d}/${m}/${a}`;
}

/** Un pourcentage à une décimale près (`62`, `47.5`), ou `null` quand le dénominateur est nul. */
export function pourcentage(numerateur: number, denominateur: number, decimales = 1): number | null {
  // Arrondi demi vers le haut (MA12 : 62,5 → 63).
  if (!denominateur) return null;
  const f = 10 ** decimales;
  return arrondi((numerateur / denominateur) * 100 * f) / f;
}

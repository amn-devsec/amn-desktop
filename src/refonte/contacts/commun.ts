import { ajouterJours, ecartJours, estOuvre, instantParis, jourDe, jourSemaine, type Jour } from '../donnees/outils';

/**
 * LOT-02 · MES CONTACTS ET CLIENTS — aides communes (logique pure, sans React).
 *
 * Rien ici ne lit l'horloge : « maintenant » (ms) et « aujourd'hui » (un jour de
 * Paris, `AAAA-MM-JJ`) sont toujours passés en paramètre, pour qu'un test, une
 * capture et un écran voient le même monde. Les jours et l'heure de Paris viennent
 * des aides de SIM (`src/refonte/donnees/outils.ts`), qui gèrent l'heure d'été.
 */

export type Langue = 'fr' | 'en';
export type { Jour };
export { ajouterJours, ecartJours, estOuvre, instantParis, jourDe, jourSemaine };

export const MS_MINUTE = 60_000;
export const MS_JOUR = 86_400_000;

/** Le jour de Paris d'un instant ISO ou en millisecondes. */
export const jourDeInstant = (i: number | string): Jour => jourDe(typeof i === 'number' ? i : Date.parse(i));

/** Minutes depuis minuit, heure de Paris, de `HH:MM`. */
export function minutesDe(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/** Les minutes depuis minuit (heure de Paris) d'un instant. */
export function minutesParis(ms: number): number {
  const jour = jourDe(ms);
  return Math.round((ms - instantParis(jour, '00:00')) / MS_MINUTE);
}

/** Argent en centimes, affiché « 1 250 € » (espace insécable, sans décimales si rond). */
export function euros(cents: number, langue: Langue = 'fr'): string {
  const v = cents / 100;
  const texte = v.toLocaleString(langue === 'fr' ? 'fr-FR' : 'en-GB', { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 });
  return langue === 'fr' ? `${texte.replace(/[\u202f\u00a0 ]/g, '\u00a0')}\u00a0€` : `€${texte}`;
}

/** `jj/mm/aaaa`, pour les textes envoyés à un client. */
export const jourFrancais = (j: Jour): string => j.split('-').reverse().join('/');

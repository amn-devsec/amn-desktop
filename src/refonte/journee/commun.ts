/**
 * LOT-01 · MA JOURNÉE — aides communes (logique pure, sans React).
 *
 * Rien ici ne lit l'horloge : « maintenant » est toujours passé en paramètre, pour qu'un test, une capture et un
 * écran voient le même monde. Les jours sont des chaînes `AAAA-MM-JJ` du calendrier de Paris, heure d'été et
 * d'hiver comprises ; les instants sont des chaînes ISO ou des millisecondes.
 *
 * Les fiches du lot (dossier v4) n'étaient pas à disposition de la session de préparation : ce qui en dépend est
 * marqué « à confirmer » dans `docs/refonte/preparation/LOT-01-ma-journee.md`, et les valeurs de départ vivent à un
 * seul endroit (`REGLES_PAR_DEFAUT`, dans `serie.ts`, `defis.ts`…).
 */

export type Langue = 'fr' | 'en';
export type Jour = string;
export type Instant = number | string;

const MS_JOUR = 86_400_000;

const FORMAT_JOUR_PARIS = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' });

/** Le jour de Paris où tombe cet instant. */
export function jourDeParis(i: Instant): Jour {
  const ms = typeof i === 'number' ? i : Date.parse(i);
  if (!Number.isFinite(ms)) throw new Error(`instant illisible : ${String(i)}`);
  return FORMAT_JOUR_PARIS.format(new Date(ms));
}

const utc = (j: Jour): number => {
  const [a, m, d] = j.split('-').map(Number);
  return Date.UTC(a, m - 1, d, 12);
};

/** Le jour + `n` jours calendaires (n négatif pour reculer). Indépendant des changements d'heure. */
export function ajouterJours(j: Jour, n: number): Jour {
  return new Date(utc(j) + n * MS_JOUR).toISOString().slice(0, 10);
}

/** Jours entiers entre deux jours (`b - a`). */
export function ecartJours(a: Jour, b: Jour): number {
  return Math.round((utc(b) - utc(a)) / MS_JOUR);
}

/** 1 = lundi … 7 = dimanche (ISO 8601). */
export function jourSemaineIso(j: Jour): number {
  const d = new Date(utc(j)).getUTCDay();
  return d === 0 ? 7 : d;
}

export const lundiDe = (j: Jour): Jour => ajouterJours(j, 1 - jourSemaineIso(j));
export const debutDeMois = (j: Jour): Jour => `${j.slice(0, 7)}-01`;

/** `x` ramené entre `min` et `max`. */
export const plafonner = (x: number, min = 0, max = 1): number => Math.min(max, Math.max(min, x));
export const somme = (xs: readonly number[]): number => xs.reduce((s, x) => s + x, 0);
export const entre = (j: Jour, debut: Jour, fin: Jour): boolean => j >= debut && j <= fin;

/** Écart en pourcent arrondi à l'entier, ou `null` quand la base est nulle (« +12 % » ne se dit pas sans base). */
export const ecartPourcent = (actuel: number, avant: number): number | null => (avant > 0 ? Math.round(((actuel - avant) / avant) * 100) : null);

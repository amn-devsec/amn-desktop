/**
 * L'HEURE DE PARIS — pour les moteurs locaux (rappels, rapports, plages calmes).
 *
 * Tout ce que l'équipe planifie (« tous les jours à 08:00 ») est une heure
 * murale de Paris, changements d'heure compris. Rien ici ne dépend du fuseau
 * du poste : on passe par `Intl`, pas par `getHours()`.
 */

import type { Jour } from '../types';

export const FUSEAU = 'Europe/Paris';

const FORMAT = new Intl.DateTimeFormat('en-GB', {
  timeZone: FUSEAU,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
  weekday: 'short',
});

const JOURS_ISO: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };

export interface PartiesParis {
  jour: Jour;
  heure: number;
  minute: number;
  /** 1 = lundi … 7 = dimanche. */
  jourIso: number;
}

export function partiesParis(ms: number): PartiesParis {
  const p = Object.fromEntries(FORMAT.formatToParts(ms).map((x) => [x.type, x.value]));
  return {
    jour: `${p.year}-${p.month}-${p.day}`,
    heure: Number(p.hour),
    minute: Number(p.minute),
    jourIso: JOURS_ISO[p.weekday],
  };
}

/** Décalage de Paris sur UTC, en ms, à cet instant. */
function decalage(ms: number): number {
  const p = Object.fromEntries(FORMAT.formatToParts(ms).map((x) => [x.type, x.value]));
  const commeUtc = Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), Number(p.hour), Number(p.minute), Number(p.second));
  return commeUtc - Math.floor(ms / 1000) * 1000;
}

/**
 * L'instant d'une heure murale de Paris. Une heure qui n'existe pas (le
 * dimanche du passage à l'heure d'été, 02:30) glisse à l'heure suivante ; une
 * heure qui existe deux fois (passage à l'heure d'hiver) prend la première.
 */
export function instantParis(jour: Jour, hhmm: string): number {
  const [a, m, d] = jour.split('-').map(Number);
  const [h, mi] = hhmm.split(':').map(Number);
  const mural = Date.UTC(a, m - 1, d, h, mi);
  const candidats = [mural - decalage(mural - 3 * 3_600_000), mural - decalage(mural + 3 * 3_600_000)].sort((x, y) => x - y);
  for (const c of candidats) {
    const p = partiesParis(c);
    if (p.jour === jour && p.heure === h && p.minute === mi) return c;
  }
  // Heure absente (passage à l'heure d'été) : une heure plus tard, à l'heure murale suivante.
  return instantParis(jour, `${String(h + 1).padStart(2, '0')}:${String(mi).padStart(2, '0')}`);
}

export function ajouterJours(jour: Jour, n: number): Jour {
  const [a, m, d] = jour.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, d + n)).toISOString().slice(0, 10);
}

export function jourIsoDe(jour: Jour): number {
  const [a, m, d] = jour.split('-').map(Number);
  const j = new Date(Date.UTC(a, m - 1, d)).getUTCDay();
  return j === 0 ? 7 : j;
}

export function minutesDe(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

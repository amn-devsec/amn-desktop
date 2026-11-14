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

/**
 * LES ZONES DE CLIC (STATUT §1.39 et §1.41) : le côté de la zone invisible de chaque cible d'un nuage. 36 px au plus ; plus petite
 * quand un voisin est trop proche : la zone d'une cible ne doit jamais couvrir le centre, ni la moitié centrale, d'une autre cible.
 * Jamais plus petite que la cible elle-même (deux cibles qui se touchent déjà se recouvrent par leur dessin, rien à faire de plus).
 */
export function zonesDeClic(cibles: readonly { x: number; y: number; r: number }[], cote = 36): number[] {
  return cibles.map((a, i) => {
    let demi = cote / 2;
    cibles.forEach((b, j) => {
      if (i === j) return;
      const d = Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
      demi = Math.min(demi, d - b.r - 1);
    });
    return Math.max(2 * a.r, Math.round(2 * demi * 10) / 10);
  });
}

/**
 * ÉCARTER LES POINTS QUI SE RECOUVRENT (STATUT §1.41 : le centre d'une cible ne doit jamais renvoyer un voisin). Deux points qui tombent
 * au même endroit (même intérêt et même montant, même nombre de jours et même note) sont poussés l'un de l'autre, à peine : jamais plus
 * de leur rayon cumulé, déterministe (l'ordre d'entrée décide). Les points isolés ne bougent pas.
 */
export function ecarterPoints<T extends { x: number; y: number; r: number }>(points: readonly T[], bornes?: { l: number; h: number }, iterations = 160): T[] {
  const p = points.map((q) => ({ ...q }));
  for (let tour = 0; tour < iterations; tour += 1) {
    let bouge = false;
    for (let i = 0; i < p.length; i += 1) {
      for (let j = i + 1; j < p.length; j += 1) {
        const min = p[i].r + p[j].r + 1;
        let dx = p[j].x - p[i].x;
        let dy = p[j].y - p[i].y;
        let d = Math.hypot(dx, dy);
        if (d >= min) continue;
        if (d < 0.01) { const a = (j * 2.399963) % (2 * Math.PI); dx = Math.cos(a); dy = Math.sin(a); d = 1; }
        const pousse = (min - d) / 2;
        p[i].x -= (dx / d) * pousse; p[i].y -= (dy / d) * pousse;
        p[j].x += (dx / d) * pousse; p[j].y += (dy / d) * pousse;
        bouge = true;
      }
    }
    if (bornes) for (const q of p) { q.x = Math.min(bornes.l - q.r, Math.max(q.r, q.x)); q.y = Math.min(bornes.h - q.r, Math.max(q.r, q.y)); }
    if (!bouge) break;
  }
  return p;
}

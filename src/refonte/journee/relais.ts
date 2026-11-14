import { ajouterJours, ecartJours, jourSemaineIso, lundiDe, plafonner, type Jour } from './commun';

/**
 * L07 · le RELAIS de la semaine, les compteurs longs et les repères du défi (fiche L07, rubrique 6). Logique pure, complément de `defis.ts`.
 *
 * Mêmes limites que `defis.ts` (§1.10) : tout est un total d'ÉQUIPE. Aucune structure d'ici ne porte un nombre rattaché à une personne ; « plus tard »
 * n'est jamais rouge ni un reproche ; « en attente » ne compte ni pour ni contre tant que le délai n'est pas passé.
 */

/** Un jour ouvré du relais : des totaux d'équipe seulement. */
export interface JourDeRelais { jour: Jour; aTemps: number; echus: number; enAttente: number }

export interface BarreDeRelais {
  jour: Jour;
  /** Lundi = 1 … vendredi = 5. */
  rang: number;
  courant: boolean;
  aTemps: number;
  /** Répondu après le délai : gris, jamais rouge. */
  plusTard: number;
  enAttente: number;
  echus: number;
  /** Largeur relative (0 à 1) : proportionnelle à (échus + en attente) du jour, la plus longue valant 1. */
  largeur: number;
  /** Les parts de la barre (0 à 1 de sa largeur) : à temps, plus tard, en attente. Leur somme vaut 1 quand le jour a des éléments. */
  parts: { aTemps: number; plusTard: number; enAttente: number };
}

/** % = à temps / échus, arrondi (47 / 52 = 90 %) ; `null` : rien d'échu (« Rien à mesurer pour l'instant »). */
export const tauxDeTenue = (aTemps: number, echus: number): number | null => (echus > 0 ? Math.round((100 * Math.min(aTemps, echus)) / echus) : null);

export function totauxDeLaSemaine(jours: readonly JourDeRelais[]): { aTemps: number; echus: number; enAttente: number; taux: number | null } {
  const aTemps = jours.reduce((s, j) => s + j.aTemps, 0);
  const echus = jours.reduce((s, j) => s + j.echus, 0);
  return { aTemps, echus, enAttente: jours.reduce((s, j) => s + j.enAttente, 0), taux: tauxDeTenue(aTemps, echus) };
}

/** Une barre par jour ouvré (lundi à vendredi de la semaine d'`aujourdhui`), dans l'ordre. Les jours sans donnée sont des barres vides. */
export function relaisDeLaSemaine(jours: readonly JourDeRelais[], aujourdhui: Jour): BarreDeRelais[] {
  const lundi = lundiDe(aujourdhui);
  const brutes = Array.from({ length: 5 }, (_, i) => {
    const jour = ajouterJours(lundi, i);
    const j = jours.find((x) => x.jour === jour) ?? { jour, aTemps: 0, echus: 0, enAttente: 0 };
    return { jour, rang: i + 1, j };
  });
  const maxTotal = Math.max(1, ...brutes.map(({ j }) => j.echus + j.enAttente));
  return brutes.map(({ jour, rang, j }) => {
    const total = j.echus + j.enAttente;
    const aTemps = Math.min(j.aTemps, j.echus);
    return {
      jour, rang, courant: jour === aujourdhui, aTemps, plusTard: j.echus - aTemps, enAttente: j.enAttente, echus: j.echus,
      largeur: total / maxTotal,
      parts: total > 0 ? { aTemps: aTemps / total, plusTard: (j.echus - aTemps) / total, enAttente: j.enAttente / total } : { aTemps: 0, plusTard: 0, enAttente: 0 },
    };
  });
}

/** L'encadré d'action : seulement quand des éléments attendent ; « garde l'objectif » si le taux est déjà à la cible, « rapproche » sinon. Aucun nom. */
export function phraseDActionDuRelais(enAttente: number, taux: number | null, cible: number): 'garde' | 'rapproche' | null {
  if (enAttente <= 0) return null;
  return taux !== null && taux >= cible ? 'garde' : 'rapproche';
}

/** « le plus ancien depuis 1 h 20 » : un âge en minutes ouvrées, en heures et minutes. */
export const ageEnHeuresMinutes = (minutes: number): { h: number; m: number } => ({ h: Math.floor(Math.max(0, minutes) / 60), m: Math.round(Math.max(0, minutes)) % 60 });

/** Compteur de jours (« Zéro impayé pendant 30 jours ») : le pourcentage de la barre et « encore n jours » (cible moins compteur). */
export const progressionDuCompteur = (jours: number, cible: number): { pct: number; encore: number } => ({ pct: cible > 0 ? Math.round(plafonner(jours / cible) * 100) : 100, encore: Math.max(0, cible - jours) });

/** Durée sans incident (cible 168 h) : % = heures depuis la dernière remise à zéro / cible, « plus que n heures ». Seule l'heure de remise à zéro est utilisée. */
export function progressionDeLaDuree(heures: number, cible = 168): { pct: number; plusQue: number } {
  const h = Math.max(0, Math.floor(heures));
  return { pct: cible > 0 ? Math.round(plafonner(h / cible) * 100) : 100, plusQue: Math.max(0, cible - h) };
}

/** Les heures entières écoulées depuis la dernière remise à zéro (un incident déclaré). `null` : jamais d'incident connu. */
export const heuresDepuis = (remisA: number | null, maintenant: number): number | null => (remisA === null ? null : Math.max(0, Math.floor((maintenant - remisA) / 3_600_000)));

export type EtiquetteDeJour = { type: 'aujourdhui' } | { type: 'hier' } | { type: 'jour'; jour: Jour } | { type: 'date'; jour: Jour };

/** « Auj. », « Hier », jour abrégé dans les 6 derniers jours, puis date courte. */
export function etiquetteDeJour(jour: Jour, aujourdhui: Jour): EtiquetteDeJour {
  const e = ecartJours(jour, aujourdhui);
  if (e <= 0) return { type: 'aujourdhui' };
  if (e === 1) return { type: 'hier' };
  return e <= 6 ? { type: 'jour', jour } : { type: 'date', jour };
}

/** Les célébrations : les 7 derniers jours, la plus récente d'abord. */
export function celebrationsRecentes<T extends { jour: Jour; id: string }>(liste: readonly T[], aujourdhui: Jour): T[] {
  return liste.filter((c) => ecartJours(c.jour, aujourdhui) >= 0 && ecartJours(c.jour, aujourdhui) <= 6).sort((a, b) => b.jour.localeCompare(a.jour) || a.id.localeCompare(b.id));
}

/** « Fêtez ensemble » : le premier vendredi APRÈS la fin du défi (le vendredi 6 novembre pour un défi qui se termine le vendredi 30 octobre). */
export function vendrediDeFete(finLe: Jour): Jour {
  const ecart = ((5 - jourSemaineIso(finLe) + 7) % 7) || 7;
  return ajouterJours(finLe, ecart);
}

/** Le numéro de semaine ISO (la semaine 44 : du lundi 26 au vendredi 30 octobre 2026). */
export function numeroDeSemaine(jour: Jour): number {
  const jeudi = ajouterJours(jour, 4 - jourSemaineIso(jour));
  return Math.floor(ecartJours(`${jeudi.slice(0, 4)}-01-01`, jeudi) / 7) + 1;
}

/** Le défi de la semaine se termine le vendredi à 19:00 (fin des heures ouvrées réglées) : le vendredi de la semaine du jour donné. */
export const vendrediDeLaSemaine = (jour: Jour): Jour => ajouterJours(lundiDe(jour), 4);

/**
 * Le déclencheur de « Fêtez ensemble » (Proposition) : le défi de la semaine est au-dessus de sa cible le dernier jour, ou un défi long atteint 70 %
 * et sa fin est connue. Sans cela, l'écran montre une astuce, jamais un vide.
 */
export function proposerLaFete(p: { principal: { taux: number | null; cible: number; dernierJour: boolean } | null; longs: readonly { pct: number; finConnue: boolean }[] }): boolean {
  if (p.principal && p.principal.dernierJour && p.principal.taux !== null && p.principal.taux >= p.principal.cible) return true;
  return p.longs.some((l) => l.finConnue && l.pct >= 70);
}

/** Un engagement : une phrase libre de 80 caractères au plus. */
export const ENGAGEMENT_MAX = 80;
export const engagementValide = (t: string): boolean => t.trim().length > 0 && t.trim().length <= ENGAGEMENT_MAX;

/** Un défi se joue à deux ou plus : en dessous, il passe en pause (la personne peut quitter sans conséquence). */
export const PARTICIPANTS_MIN = 2;
export const defiEnPause = (participants: number): boolean => participants < PARTICIPANTS_MIN;

import { jourDeParis, plafonner, type Jour } from './commun';

/**
 * L02 · MODE FOCUS — la machine à états d'une session de concentration (fiche L02, à confirmer).
 *
 * La fiche L02 n'a pas été lue. Les règles viennent du Pomodoro qui existe déjà dans l'application
 * (`src/screens/PomodoroScreen.tsx`), que le Mode Focus prolonge : trois durées de séance (15, 25, 50 minutes), une
 * pause de 5 minutes, **une pause longue de 15 minutes au bout de quatre séances** (c'est ce qui fait un cycle), et
 * **une séance abandonnée ne compte pas** : le cycle reprend à la première. Rien de plus n'est inventé ici.
 *
 * Tout est pur, et « maintenant » vient de l'appelant : la même session donne le même reste, qu'on la regarde à la
 * seconde près ou après une veille de l'ordinateur (le temps écoulé se déduit des instants, il ne se compte pas
 * seconde après seconde). Aucun reproche : s'arrêter est permis, rien ne se perd, aucun compteur de « ratés ».
 */

export const DUREES_DE_SEANCE = [15, 25, 35, 45, 50, 90] as const;
export const DUREE_PAR_DEFAUT = 25;
export const PAUSE_MIN = 5;
export const PAUSE_LONGUE_MIN = 15;
export const SEANCES_PAR_CYCLE = 4;

export type PhaseDeFocus = 'travail' | 'pause' | 'pauseLongue';

export interface Focus {
  phase: PhaseDeFocus;
  /** La durée de séance choisie, en minutes (une des `DUREES_DE_SEANCE`). */
  dureeSeanceMin: number;
  /** Séances terminées dans le cycle en cours (0 à 3). */
  rang: number;
  /** Temps écoulé dans la phase AVANT la dernière reprise, en millisecondes. */
  ecouleMs: number;
  /** Instant de la dernière reprise ; `null` : la phase est à l'arrêt (pas encore lancée, ou en pause). */
  reprisA: number | null;
}

const MS_MINUTE = 60_000;

export function nouveauFocus(dureeSeanceMin: number = DUREE_PAR_DEFAUT): Focus {
  const duree = (DUREES_DE_SEANCE as readonly number[]).includes(dureeSeanceMin) ? dureeSeanceMin : DUREE_PAR_DEFAUT;
  return { phase: 'travail', dureeSeanceMin: duree, rang: 0, ecouleMs: 0, reprisA: null };
}

export function dureeDeLaPhaseMs(f: Pick<Focus, 'phase' | 'dureeSeanceMin'>): number {
  return (f.phase === 'travail' ? f.dureeSeanceMin : f.phase === 'pause' ? PAUSE_MIN : PAUSE_LONGUE_MIN) * MS_MINUTE;
}

/** Temps écoulé dans la phase, plafonné à sa durée. */
export function ecouleDansLaPhaseMs(f: Focus, maintenant: number): number {
  const enCours = f.reprisA === null ? 0 : Math.max(0, maintenant - f.reprisA);
  return Math.min(dureeDeLaPhaseMs(f), f.ecouleMs + enCours);
}

export const restantMs = (f: Focus, maintenant: number): number => dureeDeLaPhaseMs(f) - ecouleDansLaPhaseMs(f, maintenant);
export const progression = (f: Focus, maintenant: number): number => plafonner(ecouleDansLaPhaseMs(f, maintenant) / dureeDeLaPhaseMs(f));
export const phaseTerminee = (f: Focus, maintenant: number): boolean => restantMs(f, maintenant) <= 0;
export const enMarche = (f: Focus): boolean => f.reprisA !== null;
export const commencee = (f: Focus): boolean => f.reprisA !== null || f.ecouleMs > 0;

/** « 24:07 » : minutes et secondes restantes, arrondies vers le HAUT à la seconde (le cadran ne montre jamais 00:00 avant la fin). */
export function restantEnTexte(f: Focus, maintenant: number): string {
  const secondes = Math.ceil(restantMs(f, maintenant) / 1000);
  return `${String(Math.floor(secondes / 60)).padStart(2, '0')}:${String(secondes % 60).padStart(2, '0')}`;
}

/** Lance ou reprend la phase. Sans effet si elle est déjà en marche. */
export function lancer(f: Focus, maintenant: number): Focus {
  return f.reprisA === null ? { ...f, reprisA: maintenant } : f;
}

/** Met en pause : le temps écoulé est gardé. Sans effet si la phase est à l'arrêt. */
export function mettreEnPause(f: Focus, maintenant: number): Focus {
  return f.reprisA === null ? f : { ...f, ecouleMs: ecouleDansLaPhaseMs(f, maintenant), reprisA: null };
}

/** Change la durée de séance : seulement avant de commencer une séance de travail, et seulement parmi les trois durées. */
export function choisirLaDuree(f: Focus, dureeMin: number): Focus {
  if (f.phase !== 'travail' || commencee(f) || !(DUREES_DE_SEANCE as readonly number[]).includes(dureeMin)) return f;
  return { ...f, dureeSeanceMin: dureeMin };
}

/**
 * Passe à la phase suivante quand la phase est terminée. Une séance de travail terminée fait avancer le cycle ; la
 * quatrième ouvre la pause longue et remet le cycle à zéro ; une pause se termine par une séance de travail.
 * `seanceTerminee` dit s'il y a une séance à enregistrer (au temps passé de l'utilisateur) et à fêter.
 */
export function phaseSuivante(f: Focus): { focus: Focus; seanceTerminee: boolean } {
  if (f.phase === 'travail') {
    const suivant = f.rang + 1;
    const longue = suivant >= SEANCES_PAR_CYCLE;
    return { focus: { ...f, phase: longue ? 'pauseLongue' : 'pause', rang: longue ? 0 : suivant, ecouleMs: 0, reprisA: null }, seanceTerminee: true };
  }
  return { focus: { ...f, phase: 'travail', ecouleMs: 0, reprisA: null }, seanceTerminee: false };
}

/** Abandonner : la séance ne compte pas et le cycle reprend à la première. Aucune trace de reproche : on repart, c'est tout. */
export function abandonner(f: Focus): Focus {
  return { ...f, phase: 'travail', rang: 0, ecouleMs: 0, reprisA: null };
}

export interface SeanceFaite {
  startedAt: string;
  minutes: number;
}

/** Les séances faites un jour (Paris) et leur total en minutes. Aucune comparaison avec un autre jour ni une autre personne. */
export function seancesDuJour(seances: readonly SeanceFaite[], jour: Jour): { nombre: number; minutes: number } {
  const duJour = seances.filter((s) => jourDeParis(s.startedAt) === jour);
  return { nombre: duJour.length, minutes: duJour.reduce((n, s) => n + s.minutes, 0) };
}

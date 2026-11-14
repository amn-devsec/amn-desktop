import { ajouterJours, instantParis, jourIsoDe, minutesDe, partiesParis } from './temps';
import type { Jour } from '../types';

/**
 * LE PLANIFICATEUR LOCAL — « tous les jours à 08:00 », tant qu'un poste est ouvert.
 *
 * Comme `AutomationsRunner`, il tourne dans la mise en page d'un poste ouvert.
 * Poste fermé, rien ne tourne : à la réouverture, une occurrence manquée est
 * rattrapée UNE fois (la plus récente), jamais autant de fois qu'il y a eu de
 * jours fermés. L'exécution sans poste ouvert est demandée à amn-api
 * (`amnApi.ts`, « taches-planifiees-serveur »).
 *
 * L'identifiant d'exécution est déterministe (`<planification>-<jour>`) : deux
 * postes ouverts en même temps écrivent la même exécution, jamais deux.
 */

export interface Planification {
  id: string;
  /** « HH:MM », heure de Paris. */
  heure: string;
  /** Jours ISO (1 = lundi). Absent = tous les jours. */
  jours?: readonly number[];
}

function jourPrevu(p: Planification, jour: Jour): boolean {
  return !p.jours || p.jours.includes(jourIsoDe(jour));
}

/** La prochaine occurrence strictement après `apres`. */
export function prochaineOccurrence(p: Planification, apres: number): number {
  let jour = partiesParis(apres).jour;
  for (let k = 0; k < 8; k += 1) {
    if (jourPrevu(p, jour)) {
      const t = instantParis(jour, p.heure);
      if (t > apres) return t;
    }
    jour = ajouterJours(jour, 1);
  }
  throw new Error(`planification sans jour valide : ${p.id}`);
}

/** La dernière occurrence à `maintenant` ou avant, sur les 8 derniers jours ; `null` s'il n'y en a pas. */
export function derniereOccurrence(p: Planification, maintenant: number): number | null {
  let jour = partiesParis(maintenant).jour;
  for (let k = 0; k < 8; k += 1) {
    if (jourPrevu(p, jour)) {
      const t = instantParis(jour, p.heure);
      if (t <= maintenant) return t;
    }
    jour = ajouterJours(jour, -1);
  }
  return null;
}

/**
 * Ce qu'il faut exécuter maintenant : l'occurrence la plus récente qui n'a pas
 * encore tourné et qui suit la création de la planification. `null` = rien.
 */
export function occurrenceAExecuter(p: Planification, etat: { dernierPassageAt: number | null; creeeAt: number }, maintenant: number): { at: number; id: string } | null {
  const t = derniereOccurrence(p, maintenant);
  if (t === null || t < etat.creeeAt) return null;
  if (etat.dernierPassageAt !== null && etat.dernierPassageAt >= t) return null;
  return { at: t, id: `${p.id}-${partiesParis(t).jour}` };
}

/* ─── Les plages calmes ──────────────────────────────────────────────────── */

/**
 * Une plage d'envoi : on n'écrit pas à un client la nuit ni le week-end, et on
 * ne réveille pas l'équipe. Valeurs de départ adoptées (STATUT §1.22), modifiables : `reglages.ts`.
 */
export interface Plage {
  jours: readonly number[];
  debut: string;
  fin: string;
}

/** Textes aux clients : du lundi au vendredi, de 08:00 à 19:00 (valeur de départ). */
export const PLAGE_CLIENTS: Plage = { jours: [1, 2, 3, 4, 5], debut: '08:00', fin: '19:00' };
/** Notifications à l'équipe : tous les jours, de 07:30 à 21:00 (valeur de départ). */
export const PLAGE_EQUIPE: Plage = { jours: [1, 2, 3, 4, 5, 6, 7], debut: '07:30', fin: '21:00' };

export function dansLaPlage(ms: number, plage: Plage): boolean {
  const p = partiesParis(ms);
  const m = p.heure * 60 + p.minute;
  return plage.jours.includes(p.jourIso) && m >= minutesDe(plage.debut) && m < minutesDe(plage.fin);
}

/** Le premier instant dans la plage, à partir de `ms` (lui-même s'il y est). */
export function prochainCreneau(ms: number, plage: Plage): number {
  if (dansLaPlage(ms, plage)) return ms;
  let jour = partiesParis(ms).jour;
  for (let k = 0; k < 8; k += 1) {
    if (plage.jours.includes(jourIsoDe(jour))) {
      const t = instantParis(jour, plage.debut);
      if (t >= ms) return t;
    }
    jour = ajouterJours(jour, 1);
  }
  throw new Error('plage sans jour');
}

/** Le dernier instant dans la plage, au plus tard à `ms` (lui-même s'il y est). */
export function dernierCreneau(ms: number, plage: Plage): number {
  if (dansLaPlage(ms, plage)) return ms;
  let jour = partiesParis(ms).jour;
  for (let k = 0; k < 8; k += 1) {
    if (plage.jours.includes(jourIsoDe(jour))) {
      const t = instantParis(jour, plage.fin) - 60_000;
      if (t <= ms) return t;
    }
    jour = ajouterJours(jour, -1);
  }
  throw new Error('plage sans jour');
}

import type { Evenement, Relance } from '../donnees/types';
import { ajouterJours, instantParis, jourDeInstant, MS_MINUTE, type Jour } from './commun';

/**
 * LOT-02 · LES RENDEZ-VOUS CLIENTS (MC06) — logique pure.
 *
 * Un rendez-vous client est un `Evenement` de type « rendez-vous client » (calendrier
 * H01). Ici : ce qui est à confirmer, ce qui a été manqué (et la relance qu'il
 * appelle), les chevauchements, les créneaux libres. Les événements du système
 * (rondes de La Garde) ne comptent jamais.
 */

export const estRendezVousClient = (e: Evenement): boolean => !e.systeme && e.type === 'rendez-vous client';

const debutMs = (e: Pick<Evenement, 'startAt'>): number => Date.parse(e.startAt);
const finMs = (e: Pick<Evenement, 'startAt' | 'durationMin'>): number => Date.parse(e.startAt) + e.durationMin * MS_MINUTE;

export type EtatRendezVous = 'a-venir' | 'a-confirmer' | 'en-cours' | 'passe' | 'manque';

/** L'état affiché d'un rendez-vous, à `maintenant`. */
export function etatRendezVous(e: Evenement, maintenant: number): EtatRendezVous {
  if (e.confirmation === 'manqué') return 'manque';
  if (maintenant >= finMs(e)) return 'passe';
  if (maintenant >= debutMs(e)) return 'en-cours';
  return e.confirmation === 'à confirmer' ? 'a-confirmer' : 'a-venir';
}

/** Les rendez-vous clients à venir qui n'ont pas encore été confirmés, dans les `horizonJours` jours. */
export function aConfirmer(evenements: readonly Evenement[], maintenant: number, horizonJours = 3): Evenement[] {
  const limite = instantParis(ajouterJours(jourDeInstant(maintenant), horizonJours + 1), '00:00');
  return evenements
    .filter((e) => estRendezVousClient(e) && e.confirmation === 'à confirmer' && debutMs(e) > maintenant && debutMs(e) < limite)
    .sort((a, b) => debutMs(a) - debutMs(b));
}

export const manques = (evenements: readonly Evenement[]): Evenement[] =>
  evenements.filter((e) => estRendezVousClient(e) && e.confirmation === 'manqué').sort((a, b) => debutMs(b) - debutMs(a));

/** Deux rendez-vous se chevauchent quand l'un commence avant la fin de l'autre (bout à bout n'est pas un chevauchement). */
export function chevauchements(evenements: readonly Evenement[]): [Evenement, Evenement][] {
  const l = evenements.filter((e) => !e.systeme && e.confirmation !== 'manqué').sort((a, b) => debutMs(a) - debutMs(b));
  const paires: [Evenement, Evenement][] = [];
  for (let i = 0; i < l.length; i += 1) {
    for (let j = i + 1; j < l.length && debutMs(l[j]) < finMs(l[i]); j += 1) paires.push([l[i], l[j]]);
  }
  return paires;
}

/** Les rendez-vous d'un jour de Paris, dans l'ordre de l'horloge. */
export const duJour = (evenements: readonly Evenement[], jour: Jour): Evenement[] =>
  evenements.filter((e) => !e.systeme && jourDeInstant(e.startAt) === jour).sort((a, b) => debutMs(a) - debutMs(b));

export interface OptionsCreneaux {
  debut?: string;
  fin?: string;
  /** Pas de la grille, en minutes. */
  pas?: number;
  dureeMin: number;
}

/** Les créneaux libres d'un jour : à l'intérieur de la plage, sans toucher un autre rendez-vous. */
export function creneauxLibres(evenements: readonly Evenement[], jour: Jour, { debut = '09:00', fin = '18:00', pas = 30, dureeMin }: OptionsCreneaux): number[] {
  const ouvre = instantParis(jour, debut);
  const ferme = instantParis(jour, fin);
  const pris = duJour(evenements, jour).filter((e) => e.confirmation !== 'manqué');
  const libres: number[] = [];
  for (let t = ouvre; t + dureeMin * MS_MINUTE <= ferme; t += pas * MS_MINUTE) {
    const fini = t + dureeMin * MS_MINUTE;
    if (!pris.some((e) => debutMs(e) < fini && finMs(e) > t)) libres.push(t);
  }
  return libres;
}

/**
 * La relance qu'appelle un rendez-vous manqué (même forme que celles de SIM :
 * motif « rendez-vous »). `null` quand le rendez-vous n'est pas à relancer.
 */
export function relanceDepuisManque(e: Evenement): Omit<Relance, 'id'> | null {
  if (!estRendezVousClient(e) || e.confirmation !== 'manqué') return null;
  return {
    clientId: e.clientId,
    clientNom: e.clientName || '',
    motif: 'rendez-vous',
    objetId: e.id,
    objetLibelle: e.title,
    montantCents: null,
    departLe: jourDeInstant(e.startAt),
    etat: 'prête',
    message: '',
    nbEnvoyees: 0,
    derniereEnvoiLe: null,
  };
}


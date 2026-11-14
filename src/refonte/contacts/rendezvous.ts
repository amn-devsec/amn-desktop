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


/* ------------------------------ La journée en tournée (fiche MC06) ------------------------------ */

/**
 * LA JOURNÉE : les rendez-vous, les trajets entre eux, la pause déjeuner, le résumé. Les DURÉES de
 * trajet viennent d'un service d'itinéraire (connecteur, LOT-12) : cette logique les reçoit en
 * entrée, elle n'en calcule aucune. Sans durée (adresse manquante), le trajet est « à préciser ».
 */

/** La pause déjeuner : la plage libre de plus de 45 minutes entre 12:00 et 14:00, la plus longue. */
export function pauseDejeuner(evenements: readonly Evenement[], jour: Jour, minLibreMin = 45): { debut: number; fin: number } | null {
  const ouvre = instantParis(jour, '12:00');
  const ferme = instantParis(jour, '14:00');
  const pris = duJour(evenements, jour).filter((e) => e.confirmation !== 'manqué' && finMs(e) > ouvre && debutMs(e) < ferme);
  let meilleur: { debut: number; fin: number } | null = null;
  let curseur = ouvre;
  const fermer = (fin: number) => {
    if (fin - curseur > minLibreMin * MS_MINUTE && (!meilleur || fin - curseur > meilleur.fin - meilleur.debut)) meilleur = { debut: curseur, fin };
  };
  for (const e of pris) {
    fermer(Math.min(debutMs(e), ferme));
    curseur = Math.max(curseur, finMs(e));
  }
  fermer(ferme);
  return meilleur;
}

export interface Trajet {
  /** Du rendez-vous précédent (ou du point de départ) au suivant. */
  verId: string;
  /** Durée du trajet en minutes, `null` si le lieu est à préciser. */
  dureeMin: number | null;
  /** Début conseillé (ms) pour arriver à l'heure ; `null` sans durée. */
  departConseille: number | null;
  /** Le trajet ne tient pas entre les deux rendez-vous : bloc orange, « départ conseillé {heure} ». */
  tropJuste: boolean;
}

/**
 * Les trajets d'une journée. `durees[id]` : minutes pour rejoindre le rendez-vous `id` depuis le
 * précédent. Un rendez-vous en visio n'a pas de trajet. Le bloc commence à la fin du rendez-vous
 * précédent ; s'il ne tient pas avant le début du suivant, il est « trop juste ».
 */
export function trajetsDeLaJournee(evenements: readonly Evenement[], jour: Jour, durees: Readonly<Record<string, number | null>>): Trajet[] {
  // La chaîne de la journée compte TOUS les rendez-vous clients : partir pendant une visio n'est pas possible.
  const chaine = duJour(evenements, jour).filter((e) => estRendezVousClient(e) && e.confirmation !== 'manqué');
  const trajets: Trajet[] = [];
  chaine.forEach((e, i) => {
    if (e.mode === 'visio') return;
    const dureeMin = durees[e.id] ?? null;
    if (dureeMin == null) {
      trajets.push({ verId: e.id, dureeMin: null, departConseille: null, tropJuste: false });
      return;
    }
    const depart = debutMs(e) - dureeMin * MS_MINUTE;
    const libreDepuis = i === 0 ? null : finMs(chaine[i - 1]);
    trajets.push({ verId: e.id, dureeMin, departConseille: depart, tropJuste: libreDepuis != null && depart < libreDepuis });
  });
  return trajets;
}

export interface ResumeJournee {
  rendezVous: number;
  trajetTotalMin: number;
  /** Fin du dernier rendez-vous plus le trajet de retour (ms) ; `null` sans rendez-vous. */
  finDeJournee: number | null;
}

export function resumeJournee(evenements: readonly Evenement[], jour: Jour, durees: Readonly<Record<string, number | null>>, retourMin = 0): ResumeJournee {
  const l = duJour(evenements, jour).filter((e) => estRendezVousClient(e) && e.confirmation !== 'manqué');
  if (l.length === 0) return { rendezVous: 0, trajetTotalMin: 0, finDeJournee: null };
  const trajets = trajetsDeLaJournee(evenements, jour, durees);
  const total = trajets.reduce((s, t) => s + (t.dureeMin ?? 0), 0) + retourMin;
  return { rendezVous: l.length, trajetTotalMin: total, finDeJournee: finMs(l[l.length - 1]) + retourMin * MS_MINUTE };
}

/** Le lien de réservation : « 13 sur 20 pris » = créneaux pris ÷ créneaux ouverts. `null` si rien n'est ouvert. */
export const tauxReservation = (ouverts: number, pris: number): { pris: number; ouverts: number; part: number | null } => ({
  pris: Math.min(pris, ouverts),
  ouverts,
  part: ouverts === 0 ? null : Math.min(pris, ouverts) / ouverts,
});

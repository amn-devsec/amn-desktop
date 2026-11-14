import { ajouterJours, instantParis, jourDeInstant, minutesParis, MS_MINUTE, type Jour } from '../commun';
import { duJour, estRendezVousClient, etatRendezVous, pauseDejeuner, resumeJournee, trajetsDeLaJournee, type EtatRendezVous, type Trajet } from '../rendezvous';
import type { SourcesContacts } from '../sources/types';

/**
 * LOT-02 · MC06 « RENDEZ-VOUS CLIENTS » — le ruban de la journée (logique pure, fiche MC06 rubrique 6).
 *
 * Un rendez-vous client est un événement du calendrier (`rendezvous.ts`). Ici : sa place sur le ruban de 1 036 px (de 08:00 à
 * 19:00, 94,2 px par heure), les cartes décalées pour ne jamais se chevaucher, la ligne « maintenant », la pause déjeuner et, quand
 * un service d'itinéraire fournit les durées (`durees`), la bande de route. L'application n'a pas ce service : sans durées
 * (`durees: null`) la bande de route n'existe pas et « Le trajet du jour » dit « non disponible ». Le lien de réservation
 * (créneaux ouverts, pris) n'existe pas non plus : « non disponible ».
 */
export const LARGEUR_RUBAN = 1036;
export const HEURE_DEBUT = 8;
export const HEURE_FIN = 19;
export const PX_PAR_HEURE = LARGEUR_RUBAN / (HEURE_FIN - HEURE_DEBUT);
export const LARGEUR_CARTE_MIN = 170;
export const LARGEUR_CARTE_MAX = 196;
export const ECART_CARTES = 8;

export interface CarteRdv {
  id: string;
  client: string;
  clientId: number | null;
  sujet: string;
  lieu: string;
  mode: 'salle' | 'visio' | 'chez le client' | 'téléphone';
  heure: string;
  dureeMin: number;
  debutMs: number;
  finMs: number;
  etat: EtatRendezVous;
  /** Le prochain rendez-vous du jour (bord bleu). */
  prochain: boolean;
  dansMin: number | null;
  /** Position du bord gauche de la carte sur le ruban (px), largeur de la carte. */
  x: number;
  largeur: number;
  /** Position du créneau sur l'axe (px) et largeur de la barre de durée. */
  xCreneau: number;
  largeurBarre: number;
}

export interface PuceJour { jour: Jour; nb: number; actif: boolean; aujourdhui: boolean }

export interface BlocTrajet { verId: string; dureeMin: number | null; x: number; largeur: number; tropJuste: boolean; depart: string | null; mode: 'pied' | 'vehicule' }

export interface ModeleJournee {
  jour: Jour;
  puces: PuceJour[];
  cartes: CarteRdv[];
  maintenantX: number | null;
  maintenantHeure: string;
  pause: { x: number; largeur: number } | null;
  /** `null` : pas de service d'itinéraire, pas de bande de route. */
  route: { blocs: BlocTrajet[]; totalMin: number; finDeJournee: string | null } | null;
  total: number;
  prochain: { client: string; heure: string } | null;
}

const heureParis = (ms: number): string => new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris', hourCycle: 'h23' }).format(new Date(ms));

/** La position d'une minute de la journée sur le ruban : (heure − 8) × 94,2. */
export const xDeLaMinute = (minutes: number): number => ((minutes - HEURE_DEBUT * 60) / 60) * PX_PAR_HEURE;

/** Le lundi de la semaine de `jour`. */
export function lundiDe(jour: Jour): Jour {
  const d = new Date(`${jour}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

/**
 * Place les cartes : chacune est centrée sur son créneau (largeur 170 à 196 px), puis poussée vers la droite pour ne jamais
 * toucher la précédente (écart de 8 px), puis, si le bord droit du ruban est dépassé, tout le groupe est ramené vers la gauche.
 * L'ordre des cartes est celui des heures de début.
 */
export function placerCartes(creneaux: readonly { centre: number; largeur: number }[], largeurRuban = LARGEUR_RUBAN): number[] {
  const x: number[] = creneaux.map((c) => Math.max(0, Math.min(largeurRuban - c.largeur, c.centre - c.largeur / 2)));
  for (let i = 1; i < x.length; i += 1) x[i] = Math.max(x[i], x[i - 1] + creneaux[i - 1].largeur + ECART_CARTES);
  for (let i = x.length - 1; i >= 0; i -= 1) {
    const limite = i === x.length - 1 ? largeurRuban - creneaux[i].largeur : x[i + 1] - ECART_CARTES - creneaux[i].largeur;
    x[i] = Math.min(x[i], limite);
  }
  for (let i = 1; i < x.length; i += 1) x[i] = Math.max(x[i], x[i - 1] + creneaux[i - 1].largeur + ECART_CARTES);
  return x;
}

export function modeleJournee(src: SourcesContacts, o: { jour?: Jour; durees?: Readonly<Record<string, number | null>> | null; retourMin?: number } = {}): ModeleJournee {
  const jour = o.jour ?? src.aujourdhui;
  const lundi = lundiDe(jour);
  const clients = new Map(src.clients.map((c) => [c.id, c.company || c.name]));
  const rdv = src.evenements.filter(estRendezVousClient);
  const duJourL = duJour(rdv, jour).filter((e) => e.confirmation !== 'manqué').sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt));

  const prochain = duJourL.find((e) => Date.parse(e.startAt) > src.maintenant);
  const base = duJourL.map((e) => {
    const debutMs = Date.parse(e.startAt);
    const minutes = minutesParis(debutMs);
    const largeur = Math.max(LARGEUR_CARTE_MIN, Math.min(LARGEUR_CARTE_MAX, 150 + (e.clientName || clients.get(e.clientId ?? -1) || e.title).length * 2));
    return { e, debutMs, finMs: debutMs + e.durationMin * MS_MINUTE, minutes, largeur };
  });
  const xs = placerCartes(base.map((b) => ({ centre: xDeLaMinute(b.minutes) + (b.e.durationMin / 120) * PX_PAR_HEURE, largeur: b.largeur })));
  const cartes: CarteRdv[] = base.map((b, i) => ({
    id: b.e.id, client: b.e.clientName || clients.get(b.e.clientId ?? -1) || '', clientId: b.e.clientId, sujet: b.e.title, lieu: b.e.location, mode: b.e.mode, heure: heureParis(b.debutMs), dureeMin: b.e.durationMin,
    debutMs: b.debutMs, finMs: b.finMs, etat: etatRendezVous(b.e, src.maintenant), prochain: prochain?.id === b.e.id,
    dansMin: prochain?.id === b.e.id && jourDeInstant(b.debutMs) === src.aujourdhui ? Math.max(0, Math.round((b.debutMs - src.maintenant) / MS_MINUTE)) : null,
    x: xs[i], largeur: b.largeur, xCreneau: xDeLaMinute(b.minutes), largeurBarre: (b.e.durationMin / 60) * PX_PAR_HEURE,
  }));

  const minutesMaintenant = minutesParis(src.maintenant);
  const maintenantX = jour === src.aujourdhui && minutesMaintenant >= HEURE_DEBUT * 60 && minutesMaintenant <= HEURE_FIN * 60 ? xDeLaMinute(minutesMaintenant) : null;
  const pause = pauseDejeuner(rdv, jour);
  const durees = o.durees ?? null;

  let route: ModeleJournee['route'] = null;
  if (durees !== null && cartes.length > 0) {
    const trajets: Trajet[] = trajetsDeLaJournee(rdv, jour, durees);
    const parId = new Map(cartes.map((c) => [c.id, c]));
    const blocs: BlocTrajet[] = trajets.flatMap((t) => {
      const c = parId.get(t.verId);
      if (!c) return [];
      const dMin = t.dureeMin;
      const largeur = dMin == null ? 24 : (dMin / 60) * PX_PAR_HEURE;
      const fin = c.debutMs;
      return [{ verId: t.verId, dureeMin: dMin, x: xDeLaMinute(minutesParis(fin - (dMin ?? 10) * MS_MINUTE)), largeur, tropJuste: t.tropJuste, depart: t.departConseille == null ? null : heureParis(t.departConseille), mode: dMin != null && dMin <= 15 ? 'pied' : 'vehicule' }];
    });
    const r = resumeJournee(rdv, jour, durees, o.retourMin ?? 0);
    route = { blocs, totalMin: r.trajetTotalMin, finDeJournee: r.finDeJournee == null ? null : heureParis(r.finDeJournee) };
  }

  const puces: PuceJour[] = Array.from({ length: 5 }, (_, i) => {
    const j = ajouterJours(lundi, i);
    return { jour: j, nb: duJour(rdv, j).filter((e) => e.confirmation !== 'manqué').length, actif: j === jour, aujourdhui: j === src.aujourdhui };
  });
  const aVenir = rdv.filter((e) => e.confirmation !== 'manqué' && Date.parse(e.startAt) > src.maintenant).sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt))[0];
  return {
    jour, puces, cartes, maintenantX, maintenantHeure: heureParis(src.maintenant),
    pause: pause ? { x: xDeLaMinute(minutesParis(pause.debut)), largeur: ((pause.fin - pause.debut) / MS_MINUTE / 60) * PX_PAR_HEURE } : null,
    route, total: cartes.length,
    prochain: aVenir ? { client: aVenir.clientName || clients.get(aVenir.clientId ?? -1) || aVenir.title, heure: heureParis(Date.parse(aVenir.startAt)) } : null,
  };
}

export { instantParis };

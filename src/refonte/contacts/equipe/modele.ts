import { ajouterJours, ecartJours, jourDeInstant, minutesParis, type Jour } from '../commun';
import type { MembreSource, SourcesContacts } from '../sources/types';

/**
 * LOT-02 · MC04 « ÉQUIPE » — qui fait quoi, qui est chargé aujourd'hui (logique pure, fiche MC04 rubrique 6).
 *
 * La CHARGE de chaque jour = les heures des rendez-vous où la personne figure + `HEURES_PAR_TACHE` heure par tâche qui lui est
 * assignée et échoit ce jour-là (les tâches n'ont pas de durée : c'est une hypothèse du modèle, dite à l'écran). Elle n'existe que
 * si l'application donne les tâches ou des rendez-vous avec participants (`charge: null` sinon : « Charge inconnue : reliez le
 * calendrier ou les tâches »). Jamais de classement : les cartes gardent l'ordre de l'équipe, jamais celui de la charge ; le défi
 * est collectif.
 */
export const HEURES_PAR_TACHE = 1;
export const HEURES_PAR_SEMAINE = 35;
export const SEUIL_VERT = 0.8;
export const SEUIL_LIBRE = 0.65;

export type EtatJour = 'passe' | 'aujourdhui' | 'futur' | 'absent';
export type TonCharge = 'vert' | 'orange' | 'rouge';

export interface JourCharge { jour: Jour; heures: number; etat: EtatJour; depasse: boolean }

export interface ChargeSemaine {
  jours: JourCharge[];
  totalHeures: number;
  capaciteHeures: number;
  /** 0 à plus de 1 : le total ÷ la capacité de la semaine. */
  part: number;
  ton: TonCharge;
  /** La capacité d'un jour (la semaine ÷ 5). */
  capaciteJour: number;
}

export interface Maintenant {
  genre: 'evenement' | 'disponible' | 'absent';
  titre: string;
  /** « 11:00 · Paris 8e » : l'heure et le lieu quand il y en a un. */
  detail: string;
}

export interface CartePersonne {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  initiale: string;
  teinte: number;
  moi: boolean;
  role: string;
  presence: MembreSource['statut'];
  absent: boolean;
  maintenant: Maintenant;
  competences: string[];
  /** `null` : charge inconnue. */
  charge: ChargeSemaine | null;
  /** « Libre à partir de HH:MM » ; `null` = libre maintenant. */
  libreA: string | null;
  enCours: number | null;
}

export interface AccesExterne { id: string; nom: string; initiale: string; role: string }

export interface ModeleEquipe {
  cartes: CartePersonne[];
  total: number;
  /** La charge moyenne en % : la moyenne des parts, ou `null` sans charge connue. */
  chargeMoyenne: number | null;
  acces: AccesExterne[] | null;
  suggestion: { de: CartePersonne; vers: CartePersonne; partDe: number; tache: string | null } | null;
}

const heureParis = (ms: number): string => new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris', hourCycle: 'h23' }).format(new Date(ms));

/** Le lundi de la semaine de `jour`. */
export function lundiDeLaSemaine(jour: Jour): Jour {
  const d = new Date(`${jour}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

export const tonDeCharge = (part: number): TonCharge => (part < SEUIL_VERT ? 'vert' : part <= 1 ? 'orange' : 'rouge');

export function chargeDe(src: SourcesContacts, m: MembreSource): ChargeSemaine | null {
  if (src.taches === null && !src.evenements.some((e) => e.participants?.length)) return null;
  const lundi = lundiDeLaSemaine(src.aujourdhui);
  const semaine = m.heuresSemaine ?? HEURES_PAR_SEMAINE;
  const capaciteJour = semaine / 5;
  const conges = new Set(m.congesJours ?? []);
  const jours: JourCharge[] = Array.from({ length: 5 }, (_, i) => {
    const jour = ajouterJours(lundi, i);
    const heures = src.evenements
      .filter((e) => !e.systeme && jourDeInstant(e.startAt) === jour && e.participants?.some((p) => p === m.email || p === m.nomComplet))
      .reduce((s, e) => s + e.durationMin / 60, 0)
      + (src.taches ?? []).filter((t) => t.assigneeEmail === m.email && t.echeance === jour).length * HEURES_PAR_TACHE;
    const etat: EtatJour = conges.has(jour) ? 'absent' : jour === src.aujourdhui ? 'aujourdhui' : jour < src.aujourdhui ? 'passe' : 'futur';
    return { jour, heures: Math.round(heures * 10) / 10, etat, depasse: heures > capaciteJour };
  });
  const total = Math.round(jours.reduce((s, j) => s + j.heures, 0) * 10) / 10;
  const part = semaine > 0 ? total / semaine : 0;
  return { jours, totalHeures: total, capaciteHeures: semaine, part, ton: tonDeCharge(part), capaciteJour };
}

export function maintenantDe(src: SourcesContacts, m: MembreSource): { maintenant: Maintenant; libreA: string | null } {
  const sien = src.evenements
    .filter((e) => !e.systeme && e.participants?.some((p) => p === m.email || p === m.nomComplet))
    .map((e) => ({ e, debut: Date.parse(e.startAt), fin: Date.parse(e.startAt) + e.durationMin * 60_000 }))
    .sort((a, b) => a.debut - b.debut);
  const encours = sien.find((x) => x.debut <= src.maintenant && x.fin > src.maintenant);
  const prochain = sien.find((x) => x.debut > src.maintenant && x.debut - src.maintenant <= 3_600_000 && jourDeInstant(x.debut) === src.aujourdhui);
  const choisi = encours ?? prochain;
  if (m.statut === 'absent') return { maintenant: { genre: 'absent', titre: '', detail: '' }, libreA: null };
  if (choisi) {
    // Libre à partir de la fin du bloc planifié qui touche l'heure actuelle (les blocs qui s'enchaînent comptent ensemble).
    let fin = choisi.fin;
    for (const x of sien) if (x.debut <= fin && x.fin > fin) fin = x.fin;
    return { maintenant: { genre: 'evenement', titre: choisi.e.title, detail: [heureParis(choisi.debut), choisi.e.location].filter(Boolean).join(' · ') }, libreA: heureParis(fin) };
  }
  return { maintenant: { genre: 'disponible', titre: '', detail: '' }, libreA: null };
}

export function modeleEquipe(src: SourcesContacts): ModeleEquipe {
  const membres = src.equipe.filter((m) => m.role !== 'guest');
  const cartes: CartePersonne[] = membres.map((m) => {
    const { maintenant, libreA } = maintenantDe(src, m);
    const charge = chargeDe(src, m);
    return {
      id: m.id, email: m.email, nom: m.nomComplet, prenom: m.prenom, initiale: m.initiales || m.prenom.charAt(0).toUpperCase(), teinte: m.teinte, moi: src.moi.email === m.email,
      role: m.fonction ?? '', presence: m.statut, absent: m.statut === 'absent', maintenant, competences: (m.specialites ?? []).slice(0, 4), charge, libreA,
      enCours: src.taches ? src.taches.filter((t) => t.assigneeEmail === m.email && t.status !== 'done').length : null,
    };
  });
  const connues = cartes.filter((c) => c.charge).map((c) => (c.charge as ChargeSemaine).part);
  const surcharge = [...cartes].filter((c) => c.charge && (c.charge as ChargeSemaine).part > SEUIL_VERT && !c.absent).sort((a, b) => (b.charge as ChargeSemaine).part - (a.charge as ChargeSemaine).part)[0];
  const libre = surcharge ? [...cartes].filter((c) => c !== surcharge && c.charge && (c.charge as ChargeSemaine).part < SEUIL_LIBRE && !c.absent).sort((a, b) => (a.charge as ChargeSemaine).part - (b.charge as ChargeSemaine).part)[0] : undefined;
  const tache = surcharge && libre && src.taches
    ? src.taches.filter((t) => t.assigneeEmail === surcharge.email && t.status !== 'done' && libre.competences.some((c) => `${t.title} ${t.etiquettes.join(' ')}`.toLowerCase().includes(c.toLowerCase())))[0]?.title ?? null
    : null;
  const guests = src.equipe.filter((m) => m.role === 'guest');
  return {
    cartes,
    total: cartes.length,
    chargeMoyenne: connues.length ? Math.round((connues.reduce((s, x) => s + x, 0) / connues.length) * 100) : null,
    acces: guests.length ? guests.map((g) => ({ id: g.id, nom: g.nomComplet, initiale: g.initiales || g.prenom.charAt(0), role: g.fonction ?? '' })) : null,
    suggestion: surcharge && libre ? { de: surcharge, vers: libre, partDe: Math.round((surcharge.charge as ChargeSemaine).part * 100), tache } : null,
  };
}

export { ecartJours, minutesParis };

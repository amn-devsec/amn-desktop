import { ajouterJours, ecartJours, jourDeParis, jourSemaineIso, lundiDe, type Jour } from '../commun';
import { instantParis } from '../../donnees/outils';
import { COLONNES_DE_TICKET, type ColonneDeTicket } from '../cockpit';
import { trierLaColonne } from '../kanban';

/**
 * LOT-01 · H03 « MISSIONS ET TICKETS » — le kanban (logique pure, fiche H03 rubriques 4, 6 et 8).
 *
 * Ce qui se CALCULE ici : l'ordre de chaque colonne (urgents en tête, puis l'ordre manuel ; Terminé : le plus récent en haut, sept jours),
 * les limites par colonne (« 3 sur 3 », colonne pleine), les quatre pastilles, le délai moyen de prise en charge, et le MINUTEUR de chaque
 * carte : prise en charge tant que personne n'a pris le ticket, puis résolution ; « en revue depuis 2 j » ; jamais de reproche (un délai
 * dépassé se dit « dépassé de … », la carte ne change pas de place).
 * Délais proposés par la fiche : urgent = prise en charge 30 min, résolution le jour même avant 17:00 ; normal = 4 h ouvrées et 3 jours ouvrés.
 */
export const LIBELLES: Record<ColonneDeTicket, string> = { 'a-faire': 'À faire', 'en-cours': 'En cours', 'en-revue': 'En revue', termine: 'Terminé' };
export const LIMITES_PAR_DEFAUT: Partial<Record<ColonneDeTicket, number>> = { 'en-cours': 3, 'en-revue': 4 };
export const CARTES_PAR_COLONNE = 3;
export const JOURS_TERMINES = 7;
export const PRISE_EN_CHARGE_URGENT_MIN = 30;
export const PRISE_EN_CHARGE_NORMAL_H = 4;
export const RESOLUTION_URGENT_AVANT = '17:00';
export const RESOLUTION_NORMAL_JOURS = 3;

export interface TicketMission {
  id: string;
  titre: string;
  colonne: ColonneDeTicket;
  urgent: boolean;
  client: string | null;
  etiquette: string;
  sousTaches: { faites: number; total: number } | null;
  assigne: { nom: string; enLigne?: boolean } | null;
  echeance: Jour | null;
  termineLe: Jour | null;
  commentaires: number;
  partageClient: boolean;
  ordre: number;
  /** Création, première prise en charge, entrée dans la colonne (ISO). */
  creeAt: string;
  priseEnChargeAt: string | null;
  entreeColonneAt: string | null;
  /** « relu par Aaron » : la personne qui relit un ticket en revue. */
  relecteur?: string;
}

export type MinuteurGenre = 'prise' | 'resolution' | 'revue';
export interface Minuteur { genre: MinuteurGenre; ton: 'neutre' | 'attention' | 'danger'; depasse: boolean; minutes: number; heureLimite?: string; part: number }

export interface CarteMission extends TicketMission {
  minuteur: Minuteur | null;
  /** Une ligne de date : « Aujourd'hui », « Demain », « 3 nov. », « Lun. 2 », « Mar. 27 » (Terminé). */
  dateTexte: { genre: 'aujourdhui' | 'demain' | 'date'; texte: string } | null;
}

export interface ColonneMission {
  cle: ColonneDeTicket;
  libelle: string;
  total: number;
  limite: number | null;
  pleine: boolean;
  /** Segments de la jauge de limite (au plus 4) : ceux qui sont pris. */
  segments: { total: number; pris: number } | null;
  cartes: CarteMission[];
  reste: number;
}

export interface Pastilles { urgents: number; enCours: { n: number; limite: number | null }; termines: number; partages: number }

export interface ModeleMissions {
  colonnes: ColonneMission[];
  pastilles: Pastilles;
  /** Moyenne sur 30 jours du temps entre la création et la première prise en charge des tickets clients, en minutes ; `null` sans donnée. */
  delaiMoyenMin: number | null;
  presence: { nom: string; ticket: string } | null;
  vide: boolean;
}

const ms = (x: string | number): number => (typeof x === 'number' ? x : Date.parse(x));
const minutes = (a: string | number, b: string | number): number => Math.round((ms(b) - ms(a)) / 60_000);
const ouvre = (j: Jour): boolean => jourSemaineIso(j) <= 5;

/** Ajoute des minutes OUVRÉES (lun.–ven., 09:00–18:00) à un instant ; renvoie l'instant (ms). */
export function ajouterMinutesOuvrees(depart: number, min: number): number {
  let t = depart;
  let reste = min;
  for (let garde = 0; garde < 400 && reste > 0; garde += 1) {
    const jour = jourDeParis(t);
    // minutes écoulées dans la journée de Paris
    const parts = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date(t));
    const m = (Number(parts.find((p) => p.type === 'hour')?.value) % 24) * 60 + Number(parts.find((p) => p.type === 'minute')?.value);
    if (!ouvre(jour) || m >= 18 * 60) { t += (24 * 60 - m + 9 * 60) * 60_000; continue; }
    if (m < 9 * 60) { t += (9 * 60 - m) * 60_000; continue; }
    const dispo = 18 * 60 - m;
    const pris = Math.min(dispo, reste);
    t += pris * 60_000;
    reste -= pris;
  }
  return t;
}

/** Le minuteur d'une carte à un instant, ou `null` (ticket sans client, ou terminé). */
export function minuteurDe(t: TicketMission, maintenant: number): Minuteur | null {
  if (t.colonne === 'termine') return null;
  if (t.colonne === 'en-revue') {
    const depuis = t.entreeColonneAt ? Math.max(0, minutes(t.entreeColonneAt, maintenant)) : 0;
    // Le minuteur de revue n'apparaît qu'à partir d'un jour : avant, il n'y a rien à dire.
    return t.entreeColonneAt && depuis >= 24 * 60 ? { genre: 'revue', ton: 'neutre', depasse: false, minutes: depuis, part: 0 } : null;
  }
  if (!t.client) return null;
  const aujourdhui = jourDeParis(maintenant);
  if (!t.priseEnChargeAt && t.colonne === 'a-faire') {
    const delai = t.urgent ? PRISE_EN_CHARGE_URGENT_MIN : PRISE_EN_CHARGE_NORMAL_H * 60;
    const limite = t.urgent ? Date.parse(t.creeAt) + delai * 60_000 : ajouterMinutesOuvrees(Date.parse(t.creeAt), delai);
    const reste = Math.round((limite - maintenant) / 60_000);
    // Un délai normal ne se montre que s'il approche (moins d'un quart restant) ou s'il est dépassé ; un urgent se montre toujours.
    if (!t.urgent && reste > delai / 4) return null;
    return { genre: 'prise', ton: reste < 0 ? 'danger' : 'attention', depasse: reste < 0, minutes: Math.abs(reste), part: Math.min(1, Math.max(0, 1 - reste / delai)) };
  }
  const limite = t.urgent ? instantParis(aujourdhui, RESOLUTION_URGENT_AVANT) : ajouterMinutesOuvrees(Date.parse(t.priseEnChargeAt ?? t.creeAt), RESOLUTION_NORMAL_JOURS * 9 * 60);
  const reste = Math.round((limite - maintenant) / 60_000);
  if (!t.urgent && reste > (RESOLUTION_NORMAL_JOURS * 9 * 60) / 4) return null;
  return { genre: 'resolution', ton: reste < 0 ? 'danger' : 'neutre', depasse: reste < 0, minutes: Math.abs(reste), heureLimite: t.urgent ? RESOLUTION_URGENT_AVANT : undefined, part: 0 };
}

const MOIS_COURTS_FR = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const JOURS_COURTS_FR = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];

/** La date d'une carte : « Aujourd'hui », « Demain », « 3 nov. » ; en Terminé et dans la semaine : « Mar. 27 ». */
export function dateDeCarte(jour: Jour, aujourdhui: Jour, enTermine = false): { genre: 'aujourdhui' | 'demain' | 'date'; texte: string } {
  if (jour === aujourdhui && !enTermine) return { genre: 'aujourdhui', texte: '' };
  if (jour === ajouterJours(aujourdhui, 1) && !enTermine) return { genre: 'demain', texte: '' };
  const d = new Date(Date.UTC(Number(jour.slice(0, 4)), Number(jour.slice(5, 7)) - 1, Number(jour.slice(8, 10)), 12));
  if (enTermine || Math.abs(ecartJours(aujourdhui, jour)) <= 3) return { genre: 'date', texte: `${JOURS_COURTS_FR[d.getUTCDay()]} ${d.getUTCDate()}` };
  return { genre: 'date', texte: `${d.getUTCDate()} ${MOIS_COURTS_FR[d.getUTCMonth()]}` };
}

export interface EntreesMissions {
  tickets: readonly TicketMission[];
  maintenant: number;
  limites?: Partial<Record<ColonneDeTicket, number>>;
  /** Filtre d'une pastille (null : aucun). */
  filtre?: 'urgents' | 'enCours' | 'termines' | 'partages' | null;
  /** Colonnes dépliées (« Voir n autres »). */
  depliees?: ReadonlySet<ColonneDeTicket>;
  presence?: { nom: string; ticket: string } | null;
}

export function modeleMissions(e: EntreesMissions): ModeleMissions {
  const aujourdhui = jourDeParis(e.maintenant);
  const lundi = lundiDe(aujourdhui);
  const limites = { ...LIMITES_PAR_DEFAUT, ...e.limites };
  const garde = (t: TicketMission): boolean =>
    !e.filtre || (e.filtre === 'urgents' ? t.urgent && t.colonne !== 'termine' : e.filtre === 'enCours' ? t.colonne === 'en-cours' : e.filtre === 'termines' ? t.colonne === 'termine' && (t.termineLe ?? '') >= lundi : t.partageClient && t.colonne !== 'termine');

  const colonnes: ColonneMission[] = COLONNES_DE_TICKET.map((cle) => {
    const tous = e.tickets.filter((t) => t.colonne === cle);
    const recents = cle === 'termine' ? tous.filter((t) => t.termineLe && ecartJours(t.termineLe, aujourdhui) < JOURS_TERMINES) : tous;
    const tries = cle === 'termine'
      ? [...recents].sort((a, b) => (b.termineLe ?? '').localeCompare(a.termineLe ?? '') || a.ordre - b.ordre || a.id.localeCompare(b.id))
      : trierLaColonne(recents);
    const visibles = tries.filter(garde);
    const montre = e.depliees?.has(cle) ? visibles : visibles.slice(0, CARTES_PAR_COLONNE);
    const limite = limites[cle] ?? null;
    return {
      cle, libelle: LIBELLES[cle], total: tous.length, limite, pleine: limite != null && tous.length >= limite,
      segments: limite != null ? { total: Math.min(4, limite), pris: Math.min(limite, tous.length) } : null,
      cartes: montre.map((t) => ({ ...t, minuteur: minuteurDe(t, e.maintenant), dateTexte: t.echeance ?? t.termineLe ? dateDeCarte((cle === 'termine' ? t.termineLe : t.echeance) as Jour, aujourdhui, cle === 'termine') : null })),
      reste: visibles.length - montre.length,
    };
  });

  const ouverts = e.tickets.filter((t) => t.colonne !== 'termine');
  const enCours = e.tickets.filter((t) => t.colonne === 'en-cours').length;
  const priseEnCharge = e.tickets.filter((t) => t.client && t.priseEnChargeAt && ecartJours(jourDeParis(t.creeAt), aujourdhui) <= 30);
  const delaiMoyenMin = priseEnCharge.length ? Math.round(priseEnCharge.reduce((s, t) => s + Math.max(0, minutes(t.creeAt, t.priseEnChargeAt as string)), 0) / priseEnCharge.length) : null;
  return {
    colonnes,
    pastilles: {
      urgents: ouverts.filter((t) => t.urgent).length,
      enCours: { n: enCours, limite: limites['en-cours'] ?? null },
      termines: e.tickets.filter((t) => t.colonne === 'termine' && (t.termineLe ?? '') >= lundi).length,
      partages: ouverts.filter((t) => t.partageClient).length,
    },
    delaiMoyenMin,
    presence: e.presence ?? null,
    vide: e.tickets.length === 0,
  };
}

/**
 * Déposer une carte dans une colonne : l'issue. Une colonne pleine renvoie la carte à sa place avec le message de limite et propose
 * « Dépasser quand même » (personne n'est bloqué) ; sinon la carte est posée en bas de la colonne.
 */
export type IssueDepot = { genre: 'ok'; vers: ColonneDeTicket; prevenu: string | null } | { genre: 'limite'; vers: ColonneDeTicket; limite: number } | { genre: 'meme-colonne' };
export function deposer(t: TicketMission, vers: ColonneDeTicket, tickets: readonly TicketMission[], limites: Partial<Record<ColonneDeTicket, number>> = LIMITES_PAR_DEFAUT, depasser = false): IssueDepot {
  if (t.colonne === vers) return { genre: 'meme-colonne' };
  const limite = limites[vers] ?? null;
  if (limite != null && !depasser && tickets.filter((x) => x.colonne === vers).length >= limite) return { genre: 'limite', vers, limite };
  return { genre: 'ok', vers, prevenu: vers === 'termine' ? t.assigne?.nom ?? null : null };
}

/** « 2 h 30 », « 45 min », « 4 h ». */
export function dureeCourte(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, '0')}`;
}

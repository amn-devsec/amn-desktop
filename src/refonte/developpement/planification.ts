import { ajouterJours, dateCourte, hhmm, instantParis, jourLong, jourCourt, lireHeure, ms, partiesParis, MS_MINUTE, type Instant, type Langue } from './commun';
import { dire } from './i18n';

/**
 * LOT-11 · LES TÂCHES PLANIFIÉES LOCALES — logique pure, sans React.
 *
 * Fiches : `DEV-editeur.md` (bloc « Tous les jours à 08:00 »), `DEV-serveur.md`
 * (« Chaque nuit à 03:00 », « Rondes toutes les 15 min »), `DEV-deploiements.md` (planifiés).
 *
 * Une tâche planifiée tourne SUR LE POSTE (autonomie d'abord, PLAN-10NOV §4) : elle n'a
 * besoin d'aucun service payant. Le poste peut être éteint à l'heure prévue : au réveil,
 * on rattrape UN passage (le dernier manqué, s'il n'est pas trop vieux), jamais une rafale.
 * L'exécution planifiée côté serveur, poste éteint, relève d'amn-api (liste « Demandé à
 * amn-api » de LOT-12) : ce module ne la contourne pas.
 *
 * Toutes les heures sont celles de Paris, heure d'été et d'hiver comprises.
 */

export type Planification =
  /** Chaque jour (ou certains jours, ISO 1 = lundi … 7 = dimanche) à une heure « HH:MM ». */
  | { type: 'quotidien'; heure: string; jours?: readonly number[] }
  /** Toutes les `minutes` minutes, à partir de `depuis`. */
  | { type: 'intervalle'; minutes: number; depuis: Instant }
  /** Une seule fois. */
  | { type: 'une-fois'; a: Instant };

export interface TachePlanifiee {
  id: string;
  nom: string;
  planification: Planification;
  active: boolean;
  /** Créée à : aucun passage n'est rattrapé avant. */
  creeeA: Instant;
  /** L'heure PRÉVUE du dernier passage fait (pas l'heure réelle de l'exécution). */
  dernierPassagePrevu?: Instant | null;
}

/** Au-delà de cette fenêtre, un passage manqué n'est plus rattrapé (proposition : 12 h). */
export const FENETRE_RATTRAPAGE_MIN = 12 * 60;
/** Intervalle le plus court accepté. */
export const INTERVALLE_MIN = 5;

/** Une planification valide ? Rend la raison du refus, ou `null`. */
export function fauteDePlanification(p: Planification): string | null {
  if (p.type === 'quotidien') {
    try {
      lireHeure(p.heure);
    } catch (e) {
      return (e as Error).message;
    }
    if (p.jours && (p.jours.length === 0 || p.jours.some((j) => !Number.isInteger(j) || j < 1 || j > 7))) return 'jours : de 1 (lundi) à 7 (dimanche), au moins un';
    return null;
  }
  if (p.type === 'intervalle') {
    if (!Number.isInteger(p.minutes) || p.minutes < INTERVALLE_MIN) return `intervalle : ${INTERVALLE_MIN} minutes au moins`;
    ms(p.depuis);
    return null;
  }
  ms(p.a);
  return null;
}

const joursDe = (p: { jours?: readonly number[] }) => (p.jours && p.jours.length ? new Set(p.jours) : null);

/** Le prochain passage STRICTEMENT après `apres`, ou `null` (une fois, déjà passé). */
export function prochainPassage(p: Planification, apres: Instant): number | null {
  const t = ms(apres);
  if (p.type === 'une-fois') return ms(p.a) > t ? ms(p.a) : null;
  if (p.type === 'intervalle') {
    const d = ms(p.depuis);
    const pas = p.minutes * MS_MINUTE;
    if (t < d) return d;
    return d + (Math.floor((t - d) / pas) + 1) * pas;
  }
  const minutes = lireHeure(p.heure);
  const jours = joursDe(p);
  const depart = partiesParis(t).jour;
  for (let k = 0; k <= 8; k += 1) {
    const j = ajouterJours(depart, k);
    const x = instantParis(j, minutes);
    if (x > t && (!jours || jours.has(partiesParis(x).jourSemaine))) return x;
  }
  return null;
}

/** Le dernier passage prévu AU PLUS TARD à `avant` (compris), ou `null`. */
export function precedentPassage(p: Planification, avant: Instant): number | null {
  const t = ms(avant);
  if (p.type === 'une-fois') return ms(p.a) <= t ? ms(p.a) : null;
  if (p.type === 'intervalle') {
    const d = ms(p.depuis);
    if (t < d) return null;
    const pas = p.minutes * MS_MINUTE;
    return d + Math.floor((t - d) / pas) * pas;
  }
  const minutes = lireHeure(p.heure);
  const jours = joursDe(p);
  const depart = partiesParis(t).jour;
  for (let k = 0; k <= 8; k += 1) {
    const j = ajouterJours(depart, -k);
    const x = instantParis(j, minutes);
    if (x <= t && (!jours || jours.has(partiesParis(x).jourSemaine))) return x;
  }
  return null;
}

/**
 * Ce que le poste doit lancer MAINTENANT pour cette tâche : l'heure prévue du passage à faire,
 * ou `null`. Un seul passage, le plus récent qui n'a pas été fait, s'il date de moins de
 * `fenetreMin` minutes et n'est pas antérieur à la création de la tâche.
 */
export function aLancer(t: TachePlanifiee, maintenant: Instant, fenetreMin = FENETRE_RATTRAPAGE_MIN): number | null {
  if (!t.active) return null;
  const m = ms(maintenant);
  const prevu = precedentPassage(t.planification, m);
  if (prevu == null) return null;
  if (prevu < ms(t.creeeA)) return null;
  if (t.dernierPassagePrevu != null && prevu <= ms(t.dernierPassagePrevu)) return null;
  if (m - prevu > fenetreMin * MS_MINUTE) return null;
  return prevu;
}

/** Après le passage : on note l'heure PRÉVUE (le rythme ne glisse pas avec les retards). */
export const apresPassage = (t: TachePlanifiee, prevu: Instant): TachePlanifiee => ({ ...t, dernierPassagePrevu: ms(prevu) });

/** Les tâches à lancer maintenant, dans l'ordre de leur heure prévue. */
export function tachesALancer(ts: readonly TachePlanifiee[], maintenant: Instant): { tache: TachePlanifiee; prevu: number }[] {
  return ts
    .map((tache) => ({ tache, prevu: aLancer(tache, maintenant) }))
    .filter((x): x is { tache: TachePlanifiee; prevu: number } => x.prevu != null)
    .sort((a, b) => a.prevu - b.prevu || a.tache.id.localeCompare(b.tache.id));
}

/* ------------------------------ Libellés ------------------------------ */

/**
 * « Tous les jours à 08:00 », « Chaque nuit à 03:00 » (de 00:00 à 05:59), « Du lundi au
 * vendredi à 08:00 », « Chaque lundi à 09:00 », « Lun., mer., ven. à 18:00 »,
 * « Toutes les 15 min », « Toutes les heures », « Toutes les 2 h », « Le jeu. 12 à 18:00 ».
 */
export function libellePlanification(p: Planification, langue: Langue = 'fr'): string {
  if (p.type === 'intervalle') {
    if (p.minutes % 60 === 0) return p.minutes === 60 ? dire(langue, 'planif.heure') : dire(langue, 'planif.heures', { n: p.minutes / 60 });
    return dire(langue, 'planif.minutes', { n: p.minutes });
  }
  if (p.type === 'une-fois') return dire(langue, 'planif.uneFois', { date: dateCourte(p.a, langue), heure: hhmm(partiesParis(p.a).minutes) });
  const minutes = lireHeure(p.heure);
  const heure = hhmm(minutes);
  const jours = [...new Set(p.jours ?? [])].sort((a, b) => a - b);
  if (jours.length === 0 || jours.length === 7) return dire(langue, minutes < 6 * 60 ? 'planif.chaqueNuit' : 'planif.tousLesJours', { heure });
  if (jours.join(',') === '1,2,3,4,5') return dire(langue, 'planif.semaine', { heure });
  if (jours.length === 1) return dire(langue, 'planif.chaque', { jour: jourLong(jours[0], langue), heure });
  const liste = jours.map((j) => jourCourt(j, langue)).join(', ');
  return dire(langue, 'planif.jours', { jours: liste.charAt(0).toUpperCase() + liste.slice(1), heure });
}

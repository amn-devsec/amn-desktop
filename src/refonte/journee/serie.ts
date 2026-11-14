import { ajouterJours, ecartJours, jourSemaineIso, plafonner, type Jour } from './commun';

/**
 * LA SÉRIE DE MA JOURNÉE — une seule règle pour N01, la carte « Aujourd'hui », H02, H04, H25 et L01.
 *
 * Règle validée (STATUT §1.5 n° 2, fiche L01) : **la journée compte à la clôture des priorités du jour** — les trois
 * priorités que la personne choisit le matin (`dailyPriorities`, au plus 3). Une journée est « bouclée » quand
 * chaque priorité choisie ce jour-là est faite AVANT la fin de ce même jour. On compte à la clôture : une priorité
 * finie le lendemain ne rattrape pas la veille.
 *
 * Ce que la règle ne fait pas, volontairement (STATUT §1.10, « à ne pas simplifier ») :
 *   · aucune comparaison entre personnes, aucun classement ;
 *   · aucun point perdu : une série interrompue ne devient pas « 0 », elle « reprend aujourd'hui » et le record
 *     reste affiché ; un palier atteint est gardé pour toujours (`Palier.atteint`) ;
 *   · aucun reproche : une journée sans priorité choisie, un week-end, une journée en cours ne cassent rien.
 *
 * Trois points que la fiche L01 tranchera (note du lot, §2) — leurs valeurs de départ sont dans
 * `REGLES_PAR_DEFAUT`, à UN seul endroit :
 *   1. une journée sans aucune priorité choisie est « pas jouée » : elle ne compte pas et ne casse pas ;
 *   2. samedi et dimanche sont des jours de repos (décision du CO pour la série d'écriture, STATUT §1.29 n° 1) :
 *      une priorité non finie un jour de repos ne casse pas la série, finie elle la fait avancer ;
 *   3. les paliers sont ceux de H04 (*Proposition* de la fiche) : 5, 10, 20, 30, 50, 100.
 */

export const PALIERS_DE_SERIE = [5, 10, 20, 30, 50, 100] as const;

export interface ReglesDeSerie {
  /** Jours de repos, en jours ISO (1 = lundi … 7 = dimanche) : une journée de repos ne casse jamais la série. */
  joursDeRepos: readonly number[];
  /** Vrai : un jour ouvré sans priorité choisie casse la série. Faux (le défaut) : il est « pas joué ». */
  jourSansPrioriteCasse: boolean;
  /** Nombre maximum de priorités par jour (l'écran Priorités en accepte 3). */
  prioritesParJour: number;
}

export const REGLES_PAR_DEFAUT: ReglesDeSerie = { joursDeRepos: [6, 7], jourSansPrioriteCasse: false, prioritesParJour: 3 };

export interface PrioriteDuJour {
  id: string;
  /** Le jour (Paris) où elle a été faite, ou `null` tant qu'elle ne l'est pas. */
  faitLe: Jour | null;
}

export interface PrioritesDuJour {
  jour: Jour;
  items: readonly PrioriteDuJour[];
}

/** Une ligne de la collection `dailyPriorities` (`{ email, day, items: [{ id, label, doneAt }] }`) mise à la forme de la règle. */
export function prioritesDeLaCollection(
  ligne: { day: string; items?: readonly { id: string; doneAt: string | null }[] },
  jourDe: (iso: string) => Jour,
): PrioritesDuJour {
  return { jour: ligne.day, items: (ligne.items ?? []).map((p) => ({ id: p.id, faitLe: p.doneAt ? jourDe(p.doneAt) : null })) };
}

/** Une journée est bouclée quand elle a au moins une priorité et que toutes sont faites au plus tard ce jour-là. */
export function journeeBouclee(p: PrioritesDuJour | undefined): boolean {
  return p !== undefined && p.items.length > 0 && p.items.every((i) => i.faitLe !== null && i.faitLe <= p.jour);
}

export type EtatDeSerie = 'aucune' | 'en-cours' | 'reprise';

export interface Palier {
  valeur: number;
  /** Atteint un jour, pour toujours : le record le dit, une série interrompue ne le retire pas. */
  atteint: boolean;
  /** La série en cours le couvre aujourd'hui. */
  enCours: boolean;
}

export interface Serie {
  /** Journées bouclées qui se suivent jusqu'à aujourd'hui (ou hier tant qu'aujourd'hui n'est pas bouclée). */
  serie: number;
  /** La plus longue série jamais atteinte. */
  record: number;
  /** `aucune` : aucune journée n'a jamais été bouclée. `reprise` : série interrompue, « elle reprend aujourd'hui ». */
  etat: EtatDeSerie;
  /** La journée d'aujourd'hui est bouclée. */
  boucleeAujourdhui: boolean;
  /** Priorités d'aujourd'hui qu'il reste à faire (0 si rien n'est choisi). */
  restantesAujourdhui: number;
  prochainPalier: number | null;
  /** Journées qu'il manque pour l'atteindre. */
  joursAvantPalier: number | null;
  /** Série / prochain palier, entre 0 et 1 (1 au-delà du dernier). */
  progression: number;
  paliers: Palier[];
}

export function serieDeLaJournee(journees: readonly PrioritesDuJour[], aujourdhui: Jour, regles: Partial<ReglesDeSerie> = {}): Serie {
  const r = { ...REGLES_PAR_DEFAUT, ...regles };
  const repos = new Set(r.joursDeRepos);
  const par = new Map<Jour, PrioritesDuJour>(journees.filter((j) => j.jour <= aujourdhui).map((j) => [j.jour, j]));
  const jours = [...par.keys()].sort();
  const premier = jours.find((j) => journeeBouclee(par.get(j)));

  /** Le sort d'une journée passée : +1 (bouclée), 0 (ne change rien) ou -1 (casse). */
  const effet = (j: Jour): 1 | 0 | -1 => {
    const p = par.get(j);
    if (journeeBouclee(p)) return 1;
    const jouee = p !== undefined && p.items.length > 0;
    if (repos.has(jourSemaineIso(j))) return 0;
    // Aujourd'hui, la personne n'a peut-être pas encore choisi : la journée n'est pas finie, elle ne casse rien.
    if (!jouee) return r.jourSansPrioriteCasse && j !== aujourdhui ? -1 : 0;
    return j === aujourdhui ? 0 : -1; // aujourd'hui n'est pas fini : il ne casse rien
  };

  let serie = 0;
  if (premier !== undefined) {
    for (let j = aujourdhui; j >= premier; j = ajouterJours(j, -1)) {
      const e = effet(j);
      if (e === 1) serie += 1;
      else if (e === -1) break;
    }
  }

  let record = 0;
  if (premier !== undefined) {
    let courante = 0;
    for (let j = premier; j <= aujourdhui; j = ajouterJours(j, 1)) {
      const e = effet(j);
      if (e === 1) {
        courante += 1;
        record = Math.max(record, courante);
      } else if (e === -1) courante = 0;
    }
  }
  record = Math.max(record, serie);

  const aujourdhuiP = par.get(aujourdhui);
  const etat: EtatDeSerie = premier === undefined ? 'aucune' : serie === 0 ? 'reprise' : 'en-cours';
  const prochainPalier = PALIERS_DE_SERIE.find((p) => p > serie) ?? null;
  return {
    serie,
    record,
    etat,
    boucleeAujourdhui: journeeBouclee(aujourdhuiP),
    restantesAujourdhui: aujourdhuiP ? aujourdhuiP.items.filter((i) => i.faitLe === null).length : 0,
    prochainPalier,
    joursAvantPalier: prochainPalier === null ? null : prochainPalier - serie,
    progression: prochainPalier === null ? 1 : plafonner(serie / prochainPalier),
    paliers: PALIERS_DE_SERIE.map((valeur) => ({ valeur, atteint: record >= valeur, enCours: serie >= valeur })),
  };
}

/** Le premier jour où le prochain palier serait atteint si chaque journée est bouclée à partir d'aujourd'hui. `null` au-delà du dernier. */
export function jourDuPalier(s: Pick<Serie, 'joursAvantPalier' | 'boucleeAujourdhui'>, aujourdhui: Jour, regles: Partial<ReglesDeSerie> = {}): Jour | null {
  if (s.joursAvantPalier === null) return null;
  const repos = new Set({ ...REGLES_PAR_DEFAUT, ...regles }.joursDeRepos);
  let restant = s.boucleeAujourdhui ? s.joursAvantPalier : s.joursAvantPalier - 1;
  let jour = aujourdhui;
  // Un jour de repos n'oblige pas : on compte les journées de travail à venir.
  while (restant > 0) {
    jour = ajouterJours(jour, 1);
    if (!repos.has(jourSemaineIso(jour))) restant -= 1;
  }
  return jour;
}

/** Jours entre deux jours : pour les écrans qui disent « il y a 12 jours ». */
export const joursEntre = ecartJours;

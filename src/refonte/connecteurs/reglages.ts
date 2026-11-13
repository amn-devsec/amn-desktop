import { PLAGE_CLIENTS, PLAGE_EQUIPE, type Plage } from './moteurs/planificateur';
import { DELAI_ENTRE_RELANCES_JOURS } from './moteurs/relances';
import { MAX_PAR_HEURE } from './moteurs/courriels';
import { POLITIQUE_PAR_DEFAUT, type Politique } from './moteurs/sauvegardes';
import { SEUIL_SUGGESTION_FORFAIT } from './couts';

/**
 * LES RÉGLAGES DE L'AUTONOMIE — valeurs de départ, modifiables.
 *
 * Décision du CO (STATUT §1.22) : les valeurs proposées par S9 sont adoptées
 * comme valeurs de DÉPART, toutes modifiables dans les réglages, et Harun
 * peut les corriger à tout moment. Ce module les réunit, complète un réglage
 * partiel et dit ce qui ne va pas dans une valeur saisie. Il ne range rien :
 * l'écran de réglages enregistre où il enregistre le reste.
 */

export interface ReglagesAutonomie {
  /** Quand un texte peut partir chez un client. */
  plageClients: Plage;
  /** Quand l'équipe peut être prévenue. */
  plageEquipe: Plage;
  delaiEntreRelancesJours: number;
  maxCourrielsParHeure: number;
  rotationSauvegardes: Politique;
  /** Ajmani propose de prévenir au-delà de cette part d'un forfait (%). */
  seuilSuggestionForfaitPct: number;
}

export const VALEURS_DE_DEPART: Readonly<ReglagesAutonomie> = {
  plageClients: PLAGE_CLIENTS,
  plageEquipe: PLAGE_EQUIPE,
  delaiEntreRelancesJours: DELAI_ENTRE_RELANCES_JOURS,
  maxCourrielsParHeure: MAX_PAR_HEURE,
  rotationSauvegardes: POLITIQUE_PAR_DEFAUT,
  seuilSuggestionForfaitPct: SEUIL_SUGGESTION_FORFAIT,
};

/** Les réglages de l'équipe : ce qu'elle a changé, le reste aux valeurs de départ. */
export function avecValeursDeDepart(partiel: Partial<ReglagesAutonomie> = {}): ReglagesAutonomie {
  const v = VALEURS_DE_DEPART;
  return {
    plageClients: partiel.plageClients ?? v.plageClients,
    plageEquipe: partiel.plageEquipe ?? v.plageEquipe,
    delaiEntreRelancesJours: partiel.delaiEntreRelancesJours ?? v.delaiEntreRelancesJours,
    maxCourrielsParHeure: partiel.maxCourrielsParHeure ?? v.maxCourrielsParHeure,
    rotationSauvegardes: { ...v.rotationSauvegardes, ...partiel.rotationSauvegardes },
    seuilSuggestionForfaitPct: partiel.seuilSuggestionForfaitPct ?? v.seuilSuggestionForfaitPct,
  };
}

export type DefautReglage =
  | 'plage-clients'
  | 'plage-equipe'
  | 'delai-relances'
  | 'max-courriels'
  | 'rotation'
  | 'seuil-forfait';

const HEURE = /^([01]\d|2[0-3]):[0-5]\d$/;
const entierEntre = (n: number, min: number, max: number) => Number.isInteger(n) && n >= min && n <= max;

function plageValide(p: Plage): boolean {
  return (
    p.jours.length > 0 &&
    new Set(p.jours).size === p.jours.length &&
    p.jours.every((j) => entierEntre(j, 1, 7)) &&
    HEURE.test(p.debut) &&
    HEURE.test(p.fin) &&
    p.debut < p.fin
  );
}

/** Ce qui ne va pas dans des réglages, ou une liste vide. */
export function defautsDesReglages(r: ReglagesAutonomie): DefautReglage[] {
  const d: DefautReglage[] = [];
  if (!plageValide(r.plageClients)) d.push('plage-clients');
  if (!plageValide(r.plageEquipe)) d.push('plage-equipe');
  if (!entierEntre(r.delaiEntreRelancesJours, 1, 90)) d.push('delai-relances');
  if (!entierEntre(r.maxCourrielsParHeure, 1, 500)) d.push('max-courriels');
  const rot = r.rotationSauvegardes;
  if (!entierEntre(rot.quotidiennes, 1, 60) || !entierEntre(rot.hebdomadaires, 0, 52) || !entierEntre(rot.mensuelles, 0, 120)) d.push('rotation');
  if (!entierEntre(r.seuilSuggestionForfaitPct, 1, 100)) d.push('seuil-forfait');
  return d;
}

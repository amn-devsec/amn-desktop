import { PLAGE_CLIENTS, PLAGE_EQUIPE, type Plage } from './moteurs/planificateur';
import { DELAI_ENTRE_RELANCES_BORNES, DELAI_ENTRE_RELANCES_JOURS, FENETRE_PAR_CLIENT_JOURS, MAX_RELANCES_PAR_FACTURE } from './moteurs/relances';
import { MAX_PAR_HEURE } from './moteurs/courriels';
import { POLITIQUE_PAR_DEFAUT, type Politique } from './moteurs/sauvegardes';
import { SEUIL_SUGGESTION_FORFAIT } from './couts';

/**
 * LES RÉGLAGES DE L'AUTONOMIE — valeurs de départ, modifiables.
 *
 * Décision du CO (STATUT §1.22) : les valeurs proposées par S9 sont adoptées
 * comme valeurs de DÉPART, toutes modifiables dans les réglages, et Harun
 * peut les corriger à tout moment. Pour les relances, la fiche MC07 l'emporte
 * (§1.31) : 5 jours entre deux relances (3 à 14), plage clients du lundi au
 * vendredi de 09:00 à 18:00, 3 relances au plus par facture, une relance au
 * plus par client sur 7 jours glissants. C'est la SEULE source de ces valeurs :
 * LOT-02 (S1) les lit ici, sans les recopier. Ce module les réunit, complète un réglage
 * partiel et dit ce qui ne va pas dans une valeur saisie. Il ne range rien :
 * l'écran de réglages enregistre où il enregistre le reste.
 */

export interface ReglagesAutonomie {
  /** Quand un texte peut partir chez un client. */
  plageClients: Plage;
  /** Quand l'équipe peut être prévenue. */
  plageEquipe: Plage;
  /** Entre deux relances d'une même facture : 3 à 14 jours. */
  delaiEntreRelancesJours: number;
  /** Relances au plus par facture : 1 à 3 (la fiche plafonne à 3). */
  maxRelancesParFacture: number;
  /** Une relance au plus par client sur cette fenêtre glissante : 7 jours au moins. */
  fenetreParClientJours: number;
  maxCourrielsParHeure: number;
  rotationSauvegardes: Politique;
  /** Ajmani propose de prévenir au-delà de cette part d'un forfait (%). */
  seuilSuggestionForfaitPct: number;
}

export const VALEURS_DE_DEPART: Readonly<ReglagesAutonomie> = {
  plageClients: PLAGE_CLIENTS,
  plageEquipe: PLAGE_EQUIPE,
  delaiEntreRelancesJours: DELAI_ENTRE_RELANCES_JOURS,
  maxRelancesParFacture: MAX_RELANCES_PAR_FACTURE,
  fenetreParClientJours: FENETRE_PAR_CLIENT_JOURS,
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
    maxRelancesParFacture: partiel.maxRelancesParFacture ?? v.maxRelancesParFacture,
    fenetreParClientJours: partiel.fenetreParClientJours ?? v.fenetreParClientJours,
    maxCourrielsParHeure: partiel.maxCourrielsParHeure ?? v.maxCourrielsParHeure,
    rotationSauvegardes: { ...v.rotationSauvegardes, ...partiel.rotationSauvegardes },
    seuilSuggestionForfaitPct: partiel.seuilSuggestionForfaitPct ?? v.seuilSuggestionForfaitPct,
  };
}

export type DefautReglage =
  | 'plage-clients'
  | 'plage-equipe'
  | 'delai-relances'
  | 'max-relances-facture'
  | 'fenetre-client'
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
  if (!entierEntre(r.delaiEntreRelancesJours, DELAI_ENTRE_RELANCES_BORNES.min, DELAI_ENTRE_RELANCES_BORNES.max)) d.push('delai-relances');
  if (!entierEntre(r.maxRelancesParFacture, 1, MAX_RELANCES_PAR_FACTURE)) d.push('max-relances-facture');
  if (!entierEntre(r.fenetreParClientJours, FENETRE_PAR_CLIENT_JOURS, 31)) d.push('fenetre-client');
  if (!entierEntre(r.maxCourrielsParHeure, 1, 500)) d.push('max-courriels');
  const rot = r.rotationSauvegardes;
  if (!entierEntre(rot.quotidiennes, 1, 60) || !entierEntre(rot.hebdomadaires, 0, 52) || !entierEntre(rot.mensuelles, 0, 120)) d.push('rotation');
  if (!entierEntre(r.seuilSuggestionForfaitPct, 1, 100)) d.push('seuil-forfait');
  return d;
}

/** Les règles de relance tirées des réglages, à passer à `relancesDuJour`. */
export function reglesDeRelance(r: ReglagesAutonomie): { delaiEntreRelancesJours: number; maxRelancesParFacture: number; fenetreParClientJours: number } {
  return { delaiEntreRelancesJours: r.delaiEntreRelancesJours, maxRelancesParFacture: r.maxRelancesParFacture, fenetreParClientJours: r.fenetreParClientJours };
}

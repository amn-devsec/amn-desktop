import type { EtapeProspect, Prospect } from '../donnees/types';
import { groupePipeline } from '../donnees/contacts';
import { ecartJours, type Jour } from './commun';

/**
 * LOT-02 · LE PIPELINE COMMERCIAL (H06 Prospects, MC01 Pipeline) — logique pure.
 *
 * H06 et MC01 lisent la même donnée, regroupée autrement : H06 garde les six
 * étapes, MC01 les ramène à quatre colonnes (voir `groupePipeline` de SIM :
 * « contacté » rejoint « nouveau », « gagné » devient « signé »).
 */

export const ETAPES_OUVERTES: readonly EtapeProspect[] = ['nouveau', 'contacté', 'rendez-vous', 'devis envoyé'];
export const ETAPES: readonly EtapeProspect[] = [...ETAPES_OUVERTES, 'gagné', 'perdu'];
export const COLONNES = ['Nouveau', 'Rendez-vous', 'Devis envoyé', 'Signé'] as const;
export type Colonne = (typeof COLONNES)[number];

export const estOuvert = (p: Pick<Prospect, 'etape'>): boolean => p.etape !== 'gagné' && p.etape !== 'perdu';

/** La valeur attendue d'un prospect : montant × probabilité (un signé compte pour 100 %, un perdu pour 0). */
export function valeurPonderee(p: Pick<Prospect, 'montantCents' | 'probabilite' | 'etape'>): number {
  if (p.montantCents == null || p.etape === 'perdu') return 0;
  if (p.etape === 'gagné') return p.montantCents;
  return Math.round((p.montantCents * Math.min(100, Math.max(0, p.probabilite))) / 100);
}

/** L'ordre d'une colonne : l'urgent d'abord, puis la prochaine action la plus proche (sans date en dernier), puis le nom. */
export function comparerProspects(a: Prospect, b: Prospect): number {
  if (a.urgent !== b.urgent) return a.urgent ? -1 : 1;
  const da = a.prochaineActionLe ?? '9999-12-31';
  const db = b.prochaineActionLe ?? '9999-12-31';
  return da.localeCompare(db) || a.nom.localeCompare(b.nom, 'fr');
}

export interface ColonnePipeline {
  colonne: Colonne;
  prospects: Prospect[];
  /** Somme des montants connus. */
  totalCents: number;
  /** Somme pondérée par la probabilité. */
  pondereCents: number;
  /** Prospects sans montant (le total ne les compte pas : l'écran le dit). */
  sansMontant: number;
}

/** MC01 : quatre colonnes. Les perdus n'y figurent pas. */
export function colonnesPipeline(prospects: readonly Prospect[]): ColonnePipeline[] {
  return COLONNES.map((colonne) => {
    const liste = prospects.filter((p) => groupePipeline(p.etape) === colonne).sort(comparerProspects);
    return {
      colonne,
      prospects: liste,
      totalCents: liste.reduce((s, p) => s + (p.montantCents ?? 0), 0),
      pondereCents: liste.reduce((s, p) => s + valeurPonderee(p), 0),
      sansMontant: liste.filter((p) => p.montantCents == null).length,
    };
  });
}

/** Une prochaine action est en retard quand son jour est passé et que le prospect est encore ouvert. */
export function actionEnRetard(p: Prospect, aujourdhui: Jour): boolean {
  return estOuvert(p) && p.prochaineActionLe != null && p.prochaineActionLe < aujourdhui;
}

export interface ResumePipeline {
  ouverts: number;
  gagnes: number;
  perdus: number;
  enRetard: number;
  urgents: number;
  valeurOuverteCents: number;
  valeurPondereeCents: number;
  /** gagnés ÷ (gagnés + perdus), 0 à 1 ; `null` tant qu'aucun prospect n'est conclu. */
  tauxConversion: number | null;
}

export function resumePipeline(prospects: readonly Prospect[], aujourdhui: Jour): ResumePipeline {
  const ouverts = prospects.filter(estOuvert);
  const gagnes = prospects.filter((p) => p.etape === 'gagné').length;
  const perdus = prospects.filter((p) => p.etape === 'perdu').length;
  return {
    ouverts: ouverts.length,
    gagnes,
    perdus,
    enRetard: ouverts.filter((p) => actionEnRetard(p, aujourdhui)).length,
    urgents: ouverts.filter((p) => p.urgent).length,
    valeurOuverteCents: ouverts.reduce((s, p) => s + (p.montantCents ?? 0), 0),
    valeurPondereeCents: ouverts.reduce((s, p) => s + valeurPonderee(p), 0),
    tauxConversion: gagnes + perdus === 0 ? null : gagnes / (gagnes + perdus),
  };
}

/**
 * Où un prospect peut aller. Avancer de n'importe quel nombre d'étapes (un devis
 * peut partir sans rendez-vous), reculer d'une seule ; « perdu » depuis toute étape
 * ouverte ; « gagné » et « perdu » sont terminaux (rouvrir est une décision à
 * prendre, voir la note du lot).
 */
export function transitionsPermises(etape: EtapeProspect): EtapeProspect[] {
  if (etape === 'gagné' || etape === 'perdu') return [];
  const i = ETAPES_OUVERTES.indexOf(etape);
  const avant = i > 0 ? [ETAPES_OUVERTES[i - 1]] : [];
  const apres = ETAPES_OUVERTES.slice(i + 1);
  return [...avant, ...apres, 'gagné', 'perdu'];
}

export interface ResultatTransition {
  prospect: Prospect;
  /** Vrai quand le prospect vient d'être gagné et n'a pas encore de fiche client. */
  creerClient: boolean;
}

/** Déplace un prospect. Lève une erreur si le mouvement n'est pas permis : l'écran ne propose que `transitionsPermises`. */
export function deplacer(p: Prospect, vers: EtapeProspect, aujourdhui: Jour): ResultatTransition {
  if (!transitionsPermises(p.etape).includes(vers)) throw new Error(`mouvement refusé : ${p.etape} → ${vers}`);
  const suite: Prospect = { ...p, etape: vers };
  if (vers === 'gagné') {
    suite.signeLe = aujourdhui;
    suite.probabilite = 100;
    suite.prochaineAction = '';
    suite.prochaineActionLe = null;
    suite.urgent = false;
  } else if (vers === 'perdu') {
    suite.perduLe = aujourdhui;
    suite.probabilite = 0;
    suite.prochaineAction = '';
    suite.prochaineActionLe = null;
    suite.urgent = false;
  }
  return { prospect: suite, creerClient: vers === 'gagné' && p.clientId == null };
}

/** Depuis combien de jours un prospect attend (création → aujourd'hui), pour l'âge d'une carte. */
export const ageEnJours = (p: Pick<Prospect, 'creeLe'>, aujourdhui: Jour): number => Math.max(0, ecartJours(p.creeLe, aujourdhui));

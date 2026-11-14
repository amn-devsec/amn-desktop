import { ajouterJours, arrondi, ecartJours, moisDe, moisSuivant, type Jour } from './commun';

/**
 * CONTRATS (MA01) — fiche v4, rubrique 6. Valeurs HT par période de facturation
 * (proposition). Reconduction, préavis et révision du prix : à valider par un juriste
 * ou un comptable.
 *
 *   · valeur annualisée = valeur × périodes par an (mensuel 12, trimestriel 4, annuel 1) ;
 *   · « À renouveler » (dérivé) = Actif dont l'échéance tombe dans le préavis (60 jours
 *     par défaut), HORS reconduction tacite (un contrat tacite n'est jamais à renouveler) ;
 *   · valeur révisée = valeur × (1 + taux de la clause, sinon du réglage).
 */
export const PREAVIS_PAR_DEFAUT_JOURS = 60;
export type Periode = 'Annuel' | 'Trimestriel' | 'Mensuel';
const PAR_AN: Record<Periode, number> = { Mensuel: 12, Trimestriel: 4, Annuel: 1 };

export interface ContratLu {
  periode: Periode;
  valeurParPeriodeCents: number;
  debutLe: Jour;
  echeanceLe: Jour;
  reconduction: 'tacite' | 'manuelle';
  /** État saisi : Brouillon, Actif, Terminé (« À renouveler » se dérive). */
  etat: 'Brouillon' | 'Actif' | 'Terminé' | string;
  preavisJours?: number;
}

export const valeurAnnualisee = (c: Pick<ContratLu, 'periode' | 'valeurParPeriodeCents'>): number => c.valeurParPeriodeCents * PAR_AN[c.periode];

export type EtatContrat = 'brouillon' | 'actif' | 'a-renouveler' | 'termine';

export function etatContrat(c: ContratLu, aujourdhui: Jour): EtatContrat {
  if (c.etat === 'Brouillon') return 'brouillon';
  if (c.etat === 'Terminé') return 'termine';
  if (c.reconduction === 'tacite') return 'actif';
  const reste = ecartJours(aujourdhui, c.echeanceLe);
  return reste >= 0 && reste <= (c.preavisJours ?? PREAVIS_PAR_DEFAUT_JOURS) ? 'a-renouveler' : 'actif';
}

/** « Valeur annuelle » : somme des valeurs annualisées des contrats Actif et À renouveler. */
export const valeurAnnuelle = (contrats: readonly ContratLu[], aujourdhui: Jour): number =>
  contrats.filter((c) => ['actif', 'a-renouveler'].includes(etatContrat(c, aujourdhui))).reduce((s, c) => s + valeurAnnualisee(c), 0);

/** Le compte à rebours d'un contrat À renouveler : jours avant l'échéance, préavis écoulé, part (44 ÷ 60 = 73 %). */
export function compteARebours(c: ContratLu, aujourdhui: Jour): { jours: number; preavisEcoule: number; preavis: number; pourcentage: number } {
  const preavis = c.preavisJours ?? PREAVIS_PAR_DEFAUT_JOURS;
  const ecoule = Math.min(preavis, Math.max(0, ecartJours(ajouterJours(c.echeanceLe, -preavis), aujourdhui)));
  return { jours: ecartJours(aujourdhui, c.echeanceLe), preavisEcoule: ecoule, preavis, pourcentage: arrondi((ecoule / preavis) * 100) };
}

/** La valeur révisée d'un avenant : valeur × (1 + taux), au centime (2 800 € × 1,04 = 2 912 €). */
export const valeurRevisee = (valeurCents: number, tauxPct: number): number => arrondi((valeurCents * (100 + tauxPct)) / 100);

/** La fenêtre de la frise : du 1er du 4e mois avant aujourd'hui, sur un an (30 oct. 2026 → 1er juil. 2026 au 1er juil. 2027). */
export function fenetreDeLaFrise(aujourdhui: Jour): { debut: Jour; fin: Jour } {
  const debut = `${moisSuivant(moisDe(aujourdhui), -3)}-01`;
  return { debut, fin: `${moisSuivant(moisDe(debut), 12)}-01` };
}

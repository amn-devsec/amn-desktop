import type { Facture, FicheClient, StatutClientAffiche } from '../donnees/types';
import { ajouterJours, ecartJours, jourDeInstant, type Jour } from './commun';

/**
 * LOT-02 · LES CLIENTS (H05, G04) — le statut et la couleur de santé, logique pure.
 *
 * Règles de la fiche H05 (rubrique 6) :
 *   · « Impayé »     = au moins une facture échue depuis PLUS DE 7 jours (prioritaire) ;
 *   · « À relancer » = facture échue depuis 7 jours ou moins, OU dernier échange il y a plus de 5 jours,
 *                      OU santé sous 45 ;
 *   · « Nouveau »    = client créé depuis moins de 30 jours ;
 *   · sinon « Actif » (aucune pastille).
 * La santé elle-même (0 à 100) se calcule avec `calculerSante` de SIM (40 % délai de paiement,
 * 25 % réactivité, 20 % activité, 15 % satisfaction, les poids de la fiche) : ce fichier ne la recopie pas.
 */

export type StatutClient = StatutClientAffiche;

/** Les retards, en jours, des factures émises et échues d'un client. */
export function joursDeRetard(factures: readonly Facture[], clientId: number, aujourdhui: Jour): number[] {
  return factures.filter((f) => f.clientId === clientId && f.status === 'issued' && f.dueAt < aujourdhui).map((f) => ecartJours(f.dueAt, aujourdhui));
}

export const SEUIL_IMPAYE_JOURS = 7;
export const SEUIL_SANS_ECHANGE_JOURS = 5;
export const SEUIL_SANTE_A_RELANCER = 45;
export const NOUVEAU_JUSQU_A_JOURS = 30;

export function statutClient(
  c: Pick<FicheClient, 'debutLe' | 'dernierEchangeAt' | 'sante'>,
  retardsEnJours: readonly number[],
  aujourdhui: Jour,
): StatutClient {
  if (retardsEnJours.some((j) => j > SEUIL_IMPAYE_JOURS)) return 'Impayé';
  const depuisEchange = ecartJours(jourDeInstant(c.dernierEchangeAt), aujourdhui);
  if (retardsEnJours.length > 0 || depuisEchange > SEUIL_SANS_ECHANGE_JOURS || c.sante < SEUIL_SANTE_A_RELANCER) return 'À relancer';
  return ecartJours(c.debutLe, aujourdhui) < NOUVEAU_JUSQU_A_JOURS ? 'Nouveau' : 'Actif';
}

export type CouleurSante = 'vert' | 'orange' | 'rouge';

/** ≥ 70 vert, 45 à 69 orange, < 45 rouge — la règle commune de l'application (H05, G04, H44). */
export const couleurSante = (sante: number): CouleurSante => (sante >= 70 ? 'vert' : sante >= 45 ? 'orange' : 'rouge');

export type LibelleSante = 'excellente' | 'bonne' | 'a-surveiller' | 'fragile';

/** G04 : ≥ 85 « Excellente santé », 70 à 84 « Bonne santé », 45 à 69 « Santé à surveiller », < 45 « Santé fragile ». */
export const libelleSante = (sante: number): LibelleSante => (sante >= 85 ? 'excellente' : sante >= 70 ? 'bonne' : sante >= 45 ? 'a-surveiller' : 'fragile');

/** « Santé du portefeuille » : bonne santé / à surveiller / fragiles, d'après la règle de couleur. */
export function santeDuPortefeuille(santes: readonly number[]): { bonne: number; aSurveiller: number; fragile: number } {
  return {
    bonne: santes.filter((s) => couleurSante(s) === 'vert').length,
    aSurveiller: santes.filter((s) => couleurSante(s) === 'orange').length,
    fragile: santes.filter((s) => couleurSante(s) === 'rouge').length,
  };
}

/**
 * Le tri « à traiter d'abord » de H05 : Impayé (retard le plus ancien d'abord), puis À relancer
 * (santé croissante), puis les autres par dernier échange (le plus récent d'abord).
 */
export function comparerATraiter(
  a: { statut: StatutClient; retardMaxJours: number; sante: number; dernierEchangeAt: string },
  b: { statut: StatutClient; retardMaxJours: number; sante: number; dernierEchangeAt: string },
): number {
  const rang = (s: StatutClient) => (s === 'Impayé' ? 0 : s === 'À relancer' ? 1 : 2);
  if (rang(a.statut) !== rang(b.statut)) return rang(a.statut) - rang(b.statut);
  if (a.statut === 'Impayé') return b.retardMaxJours - a.retardMaxJours;
  if (a.statut === 'À relancer') return a.sante - b.sante;
  return b.dernierEchangeAt.localeCompare(a.dernierEchangeAt);
}

/* ------------------------------ La santé d'un client ------------------------------ */

const moyenne = (l: readonly number[]): number => (l.length ? l.reduce((s, x) => s + x, 0) / l.length : 0);

/**
 * La santé d'un client, de 0 à 100 (fiche H05, proposition retenue par le jeu de SIM) : 40 % délai de paiement
 * (100 à l'heure, 0 à 30 jours de retard moyen), 25 % réactivité (dernier échange : 100 aujourd'hui, 0 à 30 jours),
 * 20 % activité sur 90 jours (35 points par facture ou devis), 15 % satisfaction (moyenne des avis sur 5, 60 sans avis).
 * Recalculée depuis les sources : `check:contacts` la compare au jeu de SIM sur les quatre volumes.
 */
export function santeClient(
  client: Pick<FicheClient, 'id' | 'dernierEchangeAt'>,
  donnees: {
    factures: readonly Pick<Facture, 'clientId' | 'status' | 'dueAt' | 'paidAt' | 'issuedAt'>[];
    devis: readonly { clientId: number; createdAt: string }[];
    avis: readonly { clientId: number; noteSur5: number }[];
  },
  aujourdhui: Jour,
): number {
  const emises = donnees.factures.filter((f) => f.clientId === client.id && (f.status === 'issued' || f.status === 'paid'));
  const retards = emises.map((f) => {
    const fin = f.status === 'paid' ? f.paidAt : aujourdhui > f.dueAt ? aujourdhui : f.dueAt;
    return Math.max(0, ecartJours(f.dueAt, fin));
  });
  const delai = Math.max(0, 100 - (moyenne(retards) * 100) / 30);
  const reactivite = Math.max(0, 100 - (ecartJours(jourDeInstant(client.dernierEchangeAt), aujourdhui) * 100) / 30);
  const depuis = ajouterJours(aujourdhui, -90);
  const activite = Math.min(100, 35 * (emises.filter((f) => f.issuedAt >= depuis).length + donnees.devis.filter((d) => d.clientId === client.id && d.createdAt.slice(0, 10) >= depuis).length));
  const avis = donnees.avis.filter((a) => a.clientId === client.id);
  const satisfaction = avis.length ? (moyenne(avis.map((a) => a.noteSur5)) / 5) * 100 : 60;
  return Math.round(0.4 * delai + 0.25 * reactivite + 0.2 * activite + 0.15 * satisfaction);
}

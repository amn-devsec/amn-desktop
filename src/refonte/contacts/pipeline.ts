import type { EtapeProspect, Prospect } from '../donnees/types';
import { groupePipeline } from '../donnees/contacts';
import { ajouterJours, ecartJours, type Jour } from './commun';

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
 * ouverte. « gagné » ne se rouvre pas. « perdu » ne se déplace pas comme les autres :
 * il se ROUVRE (voir `rouvrir`), avec confirmation et une trace — décision du CO
 * (`STATUT.md` §1.28), valable tant que la fiche H06 n'en dit pas autre chose.
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

/** Où repart un prospect rouvert : au début, la fiche H06 dira s'il en va autrement. */
export const ETAPE_DE_REOUVERTURE: EtapeProspect = 'nouveau';

/** La trace gardée d'une réouverture : qui regardera l'historique saura qu'un prospect perdu est revenu. */
export interface TraceReouverture {
  genre: 'reouvert';
  le: Jour;
  depuis: 'perdu';
  vers: EtapeProspect;
  /** Le jour où il avait été perdu. */
  perduLe: Jour | null;
}

/**
 * Rouvrir un prospect perdu. Exige la confirmation de la personne (`confirme`) : sans
 * elle, rien ne change et l'erreur le dit. Un prospect gagné, ou encore ouvert, ne se
 * rouvre pas. La probabilité reste à 0 : la personne la fixe, la valeur pondérée ne
 * monte pas toute seule.
 */
export function rouvrir(p: Prospect, aujourdhui: Jour, confirme: boolean): { prospect: Prospect; trace: TraceReouverture } {
  if (p.etape !== 'perdu') throw new Error(`réouverture refusée : ${p.etape} n'est pas perdu`);
  if (!confirme) throw new Error('réouverture refusée : confirmation requise');
  return {
    prospect: { ...p, etape: ETAPE_DE_REOUVERTURE, perduLe: null },
    trace: { genre: 'reouvert', le: aujourdhui, depuis: 'perdu', vers: ETAPE_DE_REOUVERTURE, perduLe: p.perduLe },
  };
}

/** Depuis combien de jours un prospect attend (création → aujourd'hui), pour l'âge d'une carte. */
export const ageEnJours = (p: Pick<Prospect, 'creeLe'>, aujourdhui: Jour): number => Math.max(0, ecartJours(p.creeLe, aujourdhui));

/* ------------------------------ MC01 : l'entonnoir (fiche v4) ------------------------------ */

/**
 * La CHANCE PAR ÉTAPE de MC01 (réglage, valeurs de la fiche) : Nouveau 20 %, Rendez-vous 40 %,
 * Devis envoyé 55 %, Signé 100 %. Elle sert la prévision pondérée de l'entonnoir. H06 (le nuage de
 * prospects) a sa propre chance PAR PROSPECT, modifiable : `valeurPonderee`. Deux calculs,
 * deux écrans, deux nombres — l'écran dit lequel il montre.
 */
export const CHANCES_MC01: Readonly<Record<Colonne, number>> = { Nouveau: 20, 'Rendez-vous': 40, 'Devis envoyé': 55, Signé: 100 };

/** « En jeu » (MC01) : les montants des opportunités NON signées et NON perdues. « Signé » n'y est plus compté. */
export const enJeu = (prospects: readonly Prospect[]): number => prospects.filter(estOuvert).reduce((s, p) => s + (p.montantCents ?? 0), 0);

export interface ContributionPrevision {
  colonne: Colonne;
  cents: number;
  /** Part de la contribution dans le « en jeu » (0 à 1) : la longueur du segment de la barre. */
  part: number;
}

/** Prévision pondérée = Σ montant × chance de l'ÉTAPE, ouvertes seulement, avec la part de chaque colonne. */
export function previsionPonderee(
  prospects: readonly Prospect[],
  chances: Readonly<Record<Colonne, number>> = CHANCES_MC01,
): { totalCents: number; contributions: ContributionPrevision[] } {
  const jeu = enJeu(prospects);
  const contributions = COLONNES.filter((c) => c !== 'Signé').map((colonne) => {
    const cents = Math.round(
      prospects.filter((p) => estOuvert(p) && groupePipeline(p.etape) === colonne).reduce((s, p) => s + ((p.montantCents ?? 0) * chances[colonne]) / 100, 0),
    );
    return { colonne, cents, part: jeu === 0 ? 0 : cents / jeu };
  });
  return { totalCents: contributions.reduce((s, c) => s + c.cents, 0), contributions };
}

/** Une entrée d'un prospect dans une étape (historique des mouvements). */
export interface MouvementEtape {
  prospectId: string;
  vers: EtapeProspect;
  le: Jour;
}

const colonneSuivante = (c: Colonne): Colonne | null => COLONNES[COLONNES.indexOf(c) + 1] ?? null;

/**
 * Taux de passage d'une colonne = opportunités entrées dans la colonne SUIVANTE ÷ entrées dans
 * cette colonne, sur 90 jours glissants (fiche MC01). `taux` est `null` sans entrée, et pour la
 * dernière colonne (rien après « Signé »).
 */
export function tauxDePassage(
  mouvements: readonly MouvementEtape[],
  colonne: Colonne,
  aujourdhui: Jour,
  fenetreJours = 90,
): { entrees: number; passees: number; taux: number | null } {
  const suivante = colonneSuivante(colonne);
  const depuis = ajouterJoursLocal(aujourdhui, -fenetreJours);
  const dans = (m: MouvementEtape, c: Colonne) => groupePipeline(m.vers) === c && m.le >= depuis && m.le <= aujourdhui;
  const entrees = new Set(mouvements.filter((m) => dans(m, colonne)).map((m) => m.prospectId));
  if (!suivante) return { entrees: entrees.size, passees: 0, taux: null };
  const passees = new Set(mouvements.filter((m) => dans(m, suivante) && entrees.has(m.prospectId)).map((m) => m.prospectId));
  return { entrees: entrees.size, passees: passees.size, taux: entrees.size === 0 ? null : passees.size / entrees.size };
}

/** Âge moyen dans l'étape : moyenne des jours depuis l'entrée, pour les opportunités qui y sont. `null` si aucune. */
export function ageMoyenDansEtape(entrees: readonly { depuis: Jour }[], aujourdhui: Jour): number | null {
  if (entrees.length === 0) return null;
  return entrees.reduce((s, e) => s + Math.max(0, ecartJours(e.depuis, aujourdhui)), 0) / entrees.length;
}

/** « N j sans réponse » : devis envoyé depuis `seuil` jours ou plus sans réponse du client (fiche : 5, proposition). */
export function joursSansReponse(devisEnvoyeLe: Jour, reponseLe: Jour | null, aujourdhui: Jour, seuil = 5): number | null {
  if (reponseLe != null && reponseLe >= devisEnvoyeLe) return null;
  const n = ecartJours(devisEnvoyeLe, aujourdhui);
  return n >= seuil ? n : null;
}

/** « Signé ce mois » : les passages à Signé du mois civil de `aujourdhui`, et leur total. */
export function signesDuMois(prospects: readonly Prospect[], aujourdhui: Jour): { nb: number; totalCents: number } {
  const mois = aujourdhui.slice(0, 7);
  const l = prospects.filter((p) => p.etape === 'gagné' && p.signeLe?.slice(0, 7) === mois);
  return { nb: l.length, totalCents: l.reduce((s, p) => s + (p.montantCents ?? 0), 0) };
}

/** L'objectif du mois (réglage) : ce qui reste, ou atteint. Jamais de reproche si le mois est faible. */
export function objectifDuMois(signeCents: number, objectifCents: number | null): { reste: number; atteint: boolean } | null {
  if (objectifCents == null || objectifCents <= 0) return null;
  return { reste: Math.max(0, objectifCents - signeCents), atteint: signeCents >= objectifCents };
}

/** Les signatures des `nbMois` derniers mois (le mois courant en dernier). */
export function signaturesParMois(prospects: readonly Prospect[], aujourdhui: Jour, nbMois = 6): { mois: string; nb: number }[] {
  const [a, m] = aujourdhui.split('-').map(Number);
  const mois: string[] = [];
  for (let i = nbMois - 1; i >= 0; i -= 1) {
    const d = new Date(Date.UTC(a, m - 1 - i, 1));
    mois.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`);
  }
  return mois.map((k) => ({ mois: k, nb: prospects.filter((p) => p.etape === 'gagné' && p.signeLe?.slice(0, 7) === k).length }));
}

export type FaitEncourageant =
  | { genre: 'record' }
  | { genre: 'egale-meilleur'; nb: number }
  | { genre: 'meilleur-depuis'; depuis: string }
  | { genre: 'regularite'; mois: number; auDessusDe: number };

/**
 * Le fait encourageant de l'histogramme (fiche MC01) : « égale votre meilleur mois », « votre meilleur
 * mois depuis {mois} », « belle régularité ». Rien de négatif : un mois faible n'a pas de ligne.
 * Un mois qui dépasse tous les précédents est un `record` (positif, la fiche n'en écrit pas le texte).
 */
export function faitEncourageant(serie: readonly { mois: string; nb: number }[]): FaitEncourageant | null {
  const courant = serie[serie.length - 1];
  if (!courant || courant.nb === 0) return null;
  const avant = serie.slice(0, -1);
  const meilleur = Math.max(0, ...avant.map((x) => x.nb));
  if (avant.length > 0 && courant.nb > meilleur) return { genre: 'record' };
  if (courant.nb === meilleur) return { genre: 'egale-meilleur', nb: courant.nb };
  // Le dernier mois plus fort que celui-ci : il doit y avoir au moins un mois entre les deux.
  let k = -1;
  avant.forEach((x, i) => {
    if (x.nb > courant.nb) k = i;
  });
  if (k >= 0 && k < avant.length - 1) return { genre: 'meilleur-depuis', depuis: avant[k].mois };
  const plancher = Math.min(...serie.map((x) => x.nb));
  const auDessus = serie.filter((x) => x.nb > plancher).length;
  return auDessus >= 3 && serie.every((x) => x.nb > 0) ? { genre: 'regularite', mois: serie.length, auDessusDe: plancher } : null;
}

const ajouterJoursLocal = (j: Jour, n: number): Jour => ajouterJours(j, n);

import { ecartJours, type Jour } from '../commun';
import type { SourcesContacts } from '../sources/types';

/**
 * LOT-02 · MC05 « PARTENAIRES » — la carte du réseau (logique pure, fiche MC05 rubrique 6).
 *
 * L'ORBITE d'un partenaire est sa fréquence réelle d'échanges sur 90 jours (au moins un par semaine : « chaque semaine » ; au
 * moins un par mois : « chaque mois » ; sinon « plus rarement »). La FORCE de la relation (0 à 100) mêle la régularité (50 %),
 * la récence (30 %) et les recommandations (20 %) ; l'application ne porte ni la date du dernier échange ni les recommandations :
 * la force se calcule sur les composantes CONNUES, ramenées à 100, et le modèle le dit (`composantes`). La collection de
 * partenaires n'existe pas dans l'application (`partenaires: null`) : l'écran dit « non disponible ».
 */
export type Orbite = 'semaine' | 'mois' | 'rare';
export type EtatPartenaire = 'actif' | 'pause' | 'renouveler';

export const SEUIL_SEMAINE_90J = 13;
export const SEUIL_MOIS_90J = 3;
export const JOURS_RENOUVELLEMENT = 30;

export interface NoeudPartenaire {
  id: string;
  nom: string;
  nomCourt: string;
  description: string;
  icone: string;
  categorie: string;
  orbite: Orbite;
  /** 0 à 100. */
  force: number;
  /** 1 + force ÷ 100 × 5 px. */
  epaisseur: number;
  /** Lien en pointillés sous 20. */
  pointille: boolean;
  etat: EtatPartenaire;
  finContratLe: Jour | null;
  /** Jours avant la fin du contrat (négatif : échu), ou `null`. */
  joursAvantFin: number | null;
  echanges90j: number;
  rythmeParMois: number | null;
  referents: string[];
}

export interface ModeleReseau {
  noeuds: NoeudPartenaire[];
  total: number;
  actifs: number;
  /** Les composantes de la force qui ont servi (la fiche en compte trois ; l'application n'en a qu'une). */
  composantes: ('regularite' | 'recence' | 'recommandations')[];
  suggestion: NoeudPartenaire | null;
  chips: { tous: number; renouveler: number };
}

export type FiltreReseau = 'tous' | 'renouveler';

export const orbiteDe = (echanges90j: number): Orbite => (echanges90j >= SEUIL_SEMAINE_90J ? 'semaine' : echanges90j >= SEUIL_MOIS_90J ? 'mois' : 'rare');

/** La force à partir de ce qui est connu : la régularité = échanges réels ÷ échanges attendus sur 90 jours (plafonnée à 1). */
export function forceDe(p: { echanges90j: number; rythmeEchangesParMois: number | null }): number {
  const attendus = (p.rythmeEchangesParMois ?? 1) * 3;
  const regularite = Math.min(1, p.echanges90j / Math.max(1, attendus));
  return Math.round(regularite * 100);
}

export const epaisseurDe = (force: number): number => Math.round((1 + (Math.max(0, Math.min(100, force)) / 100) * 5) * 10) / 10;

export function etatDe(p: { statut: 'Actif' | 'En pause'; finContratLe: Jour | null }, aujourdhui: Jour): EtatPartenaire {
  if (p.finContratLe != null && ecartJours(aujourdhui, p.finContratLe) < JOURS_RENOUVELLEMENT) return 'renouveler';
  return p.statut === 'En pause' ? 'pause' : 'actif';
}

export function modeleReseau(src: SourcesContacts): ModeleReseau | null {
  if (src.partenaires === null) return null;
  const noeuds: NoeudPartenaire[] = src.partenaires.map((p) => {
    const force = forceDe(p);
    const fin = p.finContratLe;
    return {
      id: p.id, nom: p.nom, nomCourt: p.nomCourt, description: p.description, icone: p.icone, categorie: p.categorie, orbite: orbiteDe(p.echanges90j), force, epaisseur: epaisseurDe(force), pointille: force < 20,
      etat: etatDe(p, src.aujourdhui), finContratLe: fin, joursAvantFin: fin ? ecartJours(src.aujourdhui, fin) : null, echanges90j: p.echanges90j, rythmeParMois: p.rythmeEchangesParMois, referents: p.referents,
    };
  });
  const aRenouveler = noeuds.filter((n) => n.etat === 'renouveler').sort((a, b) => (a.joursAvantFin ?? 0) - (b.joursAvantFin ?? 0));
  return {
    noeuds, total: noeuds.length, actifs: noeuds.filter((n) => n.etat === 'actif').length, composantes: ['regularite'],
    suggestion: aRenouveler.find((n) => (n.joursAvantFin ?? -1) >= 0) ?? null,
    chips: { tous: noeuds.length, renouveler: aRenouveler.length },
  };
}

export const gardeLeFiltre = (n: NoeudPartenaire, f: FiltreReseau): boolean => (f === 'tous' ? true : n.etat !== 'actif');

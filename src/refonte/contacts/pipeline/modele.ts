import { groupePipeline } from '../../donnees/contacts';
import { ajouterJours, ecartJours, type Jour } from '../commun';
import {
  ageMoyenDansEtape, CHANCES_MC01, enJeu, estOuvert, faitEncourageant, joursSansReponse, objectifDuMois, previsionPonderee, signaturesParMois, signesDuMois, tauxDePassage,
  type Colonne, type ContributionPrevision, type FaitEncourageant, type MouvementEtape,
} from '../pipeline';
import type { SourcesContacts } from '../sources/types';

/**
 * LOT-02 · MC01 « PIPELINE COMMERCIAL » — le modèle de l'entonnoir (logique pure, fiche MC01 rubrique 6).
 *
 * Quatre étapes (Nouveau, Rendez-vous, Devis envoyé, Signé), des pastilles dont le rayon suit le montant (9 + 0,34 × √€),
 * la sortie « Signé ce mois », la prévision pondérée, l'histogramme des signatures. Les règles viennent de `pipeline.ts`.
 *
 * Ce que l'application ne sait pas reste honnête : sans historique de mouvements (`mouvements: null`) le taux de passage
 * est `null` (« — »), et sans date d'entrée dans l'étape (`entreesEtape`) l'âge se compte depuis la création.
 */
export type Periode = 'mois' | 'trimestre' | 'tout';
export type ColonneOuverte = Exclude<Colonne, 'Signé'>;

export const COLONNES_OUVERTES: readonly ColonneOuverte[] = ['Nouveau', 'Rendez-vous', 'Devis envoyé'];

export interface Pastille {
  id: string;
  nom: string;
  /** L'initiale du responsable, ou celle du nom. */
  initiale: string;
  /** `null` : pas de montant estimé (pastille pointillée de rayon minimal, « à estimer »). */
  montantCents: number | null;
  rayon: number;
  /** Les grosses pastilles écrivent leur montant dedans. */
  grande: boolean;
  colonne: ColonneOuverte;
  /** Depuis quel jour dans l'étape (ou depuis la création, `depuisCreation`). */
  depuis: Jour;
  /** Devis envoyé depuis 5 jours ou plus sans réponse : le nombre de jours. */
  sansReponse: number | null;
  responsable: string | null;
}

export interface EtapeModele {
  colonne: ColonneOuverte;
  numero: string;
  nb: number;
  totalCents: number;
  chance: number;
  /** Les pastilles dessinées (les plus grosses, au plus `MAX_PAR_ETAPE`). */
  pastilles: Pastille[];
  /** Les autres : regroupées en une pastille « + N » qui ouvre la liste. */
  regroupees: Pastille[];
  ageMoyenJours: number | null;
  /** Taux de passage vers l'étape suivante (0 à 1), ou `null` sans historique. */
  taux: number | null;
}

export interface LigneSignee { id: string; nom: string; initiale: string; cents: number | null; le: Jour }

export interface ModeleEntonnoir {
  etapes: EtapeModele[];
  total: number;
  enJeuCents: number;
  /** « 62 % passent à l'étape suivante » : le taux de la première étape qui en a un. */
  passagePourcent: number | null;
  /** Vrai : l'âge moyen se compte depuis la création (pas de date d'entrée dans l'étape). */
  ageDepuisCreation: boolean;
  /** Vrai : pas d'historique des mouvements, les taux sont « — ». */
  tauxIndisponibles: boolean;
  sortie: { lignes: LigneSignee[]; nb: number; totalCents: number };
  periode: Periode;
  objectif: { objectifCents: number; signeCents: number; reste: number; atteint: boolean; part: number } | null;
  prevision: { totalCents: number; contributions: ContributionPrevision[]; enJeuCents: number };
  signatures: { mois: { mois: string; nb: number }[]; fait: FaitEncourageant | null };
  /** La relance à suggérer : le devis sans réponse le plus gros. */
  suggestion: { id: string; nom: string; cents: number | null; jours: number } | null;
}

/** Rayon d'une pastille : 9 + 0,34 × √montant (en euros) : la SURFACE est proportionnelle au montant. */
export const rayonDePastille = (montantCents: number | null): number => (montantCents == null || montantCents <= 0 ? 9 : 9 + 0.34 * Math.sqrt(montantCents / 100));
/** Une pastille de ce rayon écrit son montant dedans. */
export const SEUIL_GRANDE = 30;

const SEUIL_SANS_REPONSE = 5;
/** Au-delà, les plus petites se regroupent en « + N » (la fiche : au plus douze ; le tracé n'en porte lisiblement que cinq par étape). */
export const MAX_PAR_ETAPE: Readonly<Record<ColonneOuverte, number>> = { Nouveau: 4, 'Rendez-vous': 3, 'Devis envoyé': 2 };
const NUMERO = ['01', '02', '03'] as const;

const premierJourDe = (periode: Periode, aujourdhui: Jour): Jour | null => (periode === 'mois' ? `${aujourdhui.slice(0, 7)}-01` : periode === 'trimestre' ? ajouterJours(aujourdhui, -90) : null);

export function modeleEntonnoir(
  src: SourcesContacts,
  o: { mouvements?: readonly MouvementEtape[] | null; objectifCents?: number | null; periode?: Periode } = {},
): ModeleEntonnoir {
  const periode = o.periode ?? 'mois';
  const mouvements = o.mouvements ?? null;
  const equipe = new Map(src.equipe.map((m) => [m.email, m.nomComplet]));
  const entrees = src.entreesEtape ?? null;
  const ouverts = src.prospects.filter(estOuvert);

  const pastilles: Pastille[] = ouverts.flatMap((p) => {
    const colonne = groupePipeline(p.etape);
    if (colonne == null || colonne === 'Signé') return [];
    const responsable = p.responsableEmail ? equipe.get(p.responsableEmail) ?? null : null;
    const depuis = entrees?.[p.id] ?? p.creeLe;
    const rayon = rayonDePastille(p.montantCents);
    return [{
      id: p.id, nom: p.nom, initiale: (responsable ?? p.nom).trim().charAt(0).toUpperCase(), montantCents: p.montantCents, rayon, grande: rayon >= SEUIL_GRANDE, colonne,
      depuis, sansReponse: colonne === 'Devis envoyé' ? joursSansReponse(depuis, null, src.aujourdhui, SEUIL_SANS_REPONSE) : null, responsable,
    }];
  });

  const etapes: EtapeModele[] = COLONNES_OUVERTES.map((colonne, i) => {
    const liste = pastilles.filter((x) => x.colonne === colonne).sort((a, b) => a.depuis.localeCompare(b.depuis) || a.id.localeCompare(b.id));
    const age = ageMoyenDansEtape(liste.map((x) => ({ depuis: x.depuis })), src.aujourdhui);
    const taux = mouvements ? tauxDePassage(mouvements, colonne, src.aujourdhui).taux : null;
    const gardees = new Set([...liste].sort((a, b) => (b.montantCents ?? 0) - (a.montantCents ?? 0) || a.id.localeCompare(b.id)).slice(0, MAX_PAR_ETAPE[colonne]).map((x) => x.id));
    return {
      colonne, numero: NUMERO[i], nb: liste.length, totalCents: liste.reduce((s, x) => s + (x.montantCents ?? 0), 0), chance: CHANCES_MC01[colonne],
      pastilles: liste.filter((x) => gardees.has(x.id)), regroupees: liste.filter((x) => !gardees.has(x.id)), ageMoyenJours: age == null ? null : Math.round(age), taux,
    };
  });

  const debut = premierJourDe(periode, src.aujourdhui);
  const signes = src.prospects
    .filter((p) => p.etape === 'gagné' && p.signeLe != null && p.signeLe <= src.aujourdhui && (debut == null || p.signeLe >= debut))
    .sort((a, b) => (b.signeLe ?? '').localeCompare(a.signeLe ?? '') || a.id.localeCompare(b.id));
  const lignes: LigneSignee[] = signes.map((p) => ({ id: p.id, nom: p.nom, initiale: (p.responsableEmail && equipe.get(p.responsableEmail) ? (equipe.get(p.responsableEmail) as string) : p.nom).trim().charAt(0).toUpperCase(), cents: p.montantCents, le: p.signeLe as Jour }));
  const mois = signesDuMois(src.prospects, src.aujourdhui);
  const jeu = enJeu(src.prospects);
  const obj = o.objectifCents ?? null;
  const cible = objectifDuMois(mois.totalCents, obj);
  const serie = signaturesParMois(src.prospects, src.aujourdhui);
  const cas = [...etapes[2].pastilles, ...etapes[2].regroupees]
    .filter((x) => x.sansReponse != null)
    .sort((a, b) => (b.montantCents ?? 0) - (a.montantCents ?? 0) || (b.sansReponse ?? 0) - (a.sansReponse ?? 0))[0];

  return {
    etapes,
    total: pastilles.length,
    enJeuCents: jeu,
    passagePourcent: (() => { const t = etapes.find((e) => e.taux != null)?.taux; return t == null ? null : Math.round(t * 100); })(),
    ageDepuisCreation: entrees === null,
    tauxIndisponibles: mouvements === null,
    sortie: { lignes, nb: lignes.length, totalCents: lignes.reduce((s, l) => s + (l.cents ?? 0), 0) },
    periode,
    objectif: cible && obj ? { objectifCents: obj, signeCents: mois.totalCents, reste: cible.reste, atteint: cible.atteint, part: Math.min(1, mois.totalCents / obj) } : null,
    prevision: { ...previsionPonderee(src.prospects), enJeuCents: jeu },
    signatures: { mois: serie, fait: faitEncourageant(serie) },
    suggestion: cas ? { id: cas.id, nom: cas.nom, cents: cas.montantCents, jours: cas.sansReponse as number } : null,
  };
}

/** Un mouvement d'une pastille vers une colonne : ce que `deplacer` du pipeline autorise (en avant, en arrière, vers Signé). */
export function colonneVoisine(colonne: Colonne, sens: 1 | -1): Colonne | null {
  const ordre: Colonne[] = ['Nouveau', 'Rendez-vous', 'Devis envoyé', 'Signé'];
  return ordre[ordre.indexOf(colonne) + sens] ?? null;
}

export const jourDepuis = (depuis: Jour, aujourdhui: Jour): number => Math.max(0, ecartJours(depuis, aujourdhui));

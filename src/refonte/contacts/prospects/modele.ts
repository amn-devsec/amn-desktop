import { ecartJours, type Jour } from '../commun';
import { estOuvert, faitEncourageant, signaturesParMois, type FaitEncourageant } from '../pipeline';
import { appelsDeLaSemaine, estPrioritaire, interet, libelleInteret, nouveaux, QUADRANT_PAR_DEFAUT, trainee, type LibelleInteret, type ReglagesQuadrant, type SignauxInteret } from '../interet';
import type { SourcesContacts } from '../sources/types';

/**
 * LOT-02 · H06 « PROSPECTS » — le modèle du nuage intérêt × montant (logique pure, fiche H06 rubrique 6).
 *
 * L'intérêt est calculé par `interet.ts` à partir de SIGNAUX (lectures du devis, réponses, rendez-vous, fraîcheur). Ces
 * signaux ne sont pas des collections de l'application : quand l'appelant n'en fournit pas (`signaux: null`), chaque
 * prospect reçoit un intérêt ESTIMÉ (étape et ancienneté seulement), et le modèle le dit (`estime`), pour que la vue
 * l'écrive au lieu de le laisser croire mesuré.
 */
export type GenreSignal = 'devisOuvert' | 'lectures' | 'reponse' | 'rendezVous';

export interface SignalProspect {
  genre: GenreSignal;
  /** Le nombre (lectures de la semaine) ou les minutes (lecture cumulée, délai de réponse en minutes). */
  n: number;
  /** Il y a combien de minutes (le voyant vit sous 15 min). */
  ilYaMin: number;
}

/** Ce qu'un producteur de signaux donne pour UN prospect. */
export interface SignauxProspect {
  signaux: SignauxInteret;
  /** L'intérêt calculé il y a 14 jours, ou `null` si inconnu. */
  interetIlYa14j: number | null;
  evenements: SignalProspect[];
}

export interface PointProspect {
  id: string;
  nom: string;
  initiale: string;
  offre: string;
  montantCents: number;
  interet: number;
  libelle: LibelleInteret;
  chance: number;
  prioritaire: boolean;
  /** L'intérêt d'il y a 14 jours quand l'écart atteint 10 points. */
  trainee: number | null;
  etape: 'nouveau' | 'contacté' | 'rendez-vous' | 'devis envoyé';
  responsable: { email: string; nom: string } | null;
  prochaineAction: string;
  signaux: SignalProspect[];
  estime: boolean;
  nouveau: boolean;
  mien: boolean;
}

export interface ModeleProspects {
  points: PointProspect[];
  total: number;
  enJeuCents: number;
  prioritaires: { n: number; totalCents: number };
  reglages: ReglagesQuadrant;
  /** Le haut de l'axe des montants, en centimes : 10 000 € au moins, arrondi à 2 500 € au-dessus du plus gros. */
  plafondCents: number;
  chips: { tous: number; miens: number; nouveaux: number };
  /** Les prospects de « Appels de la semaine », dans l'ordre. */
  appels: PointProspect[];
  /** Quadrant vide : les deux meilleurs candidats hors quadrant. */
  candidats: PointProspect[];
  signatures: { ceMois: number; fait: FaitEncourageant | null };
  /** Vrai si au moins un intérêt est estimé : la vue écrit « estimé ». */
  estime: boolean;
}

export type FiltreProspects = 'tous' | 'miens' | 'nouveaux';

const PAS_AXE_CENTS = 250_000;
const PLANCHER_AXE_CENTS = 1_000_000;

/** Le haut de l'axe : 10 000 € ici ; au-delà, l'axe s'étend par pas de 2 500 € au-dessus du plus gros montant. */
export function plafondDAxe(montantMaxCents: number): number {
  return Math.max(PLANCHER_AXE_CENTS, Math.ceil(montantMaxCents / PAS_AXE_CENTS) * PAS_AXE_CENTS);
}

/** L'estimation quand aucun signal n'est mesuré : un rendez-vous compte si l'étape l'implique, la fraîcheur vient de la création. */
export function signauxEstimes(p: { etape: PointProspect['etape']; creeLe: Jour }, aujourdhui: Jour): SignauxProspect {
  return {
    signaux: {
      lectures14j: 0,
      delaiReponseHeures: null,
      rendezVous: p.etape === 'rendez-vous' || p.etape === 'devis envoyé' ? 1 : 0,
      joursDepuisContact: Math.max(0, ecartJours(p.creeLe, aujourdhui)),
    },
    interetIlYa14j: null,
    evenements: [],
  };
}

export function modeleProspects(src: SourcesContacts, signaux: Readonly<Record<string, SignauxProspect>> | null = null, reglages: ReglagesQuadrant = QUADRANT_PAR_DEFAUT): ModeleProspects {
  const equipe = new Map(src.equipe.map((m) => [m.email, m.nomComplet]));
  const recents = new Set(nouveaux(src.prospects, src.aujourdhui).map((p) => p.id));
  const ouverts = src.prospects.filter(estOuvert);
  const brutes = ouverts.map((p) => {
    const fournis = signaux?.[p.id];
    const donnees = fournis ?? signauxEstimes({ etape: p.etape as PointProspect['etape'], creeLe: p.creeLe }, src.aujourdhui);
    const valeur = interet(donnees.signaux);
    return { p, valeur, donnees, estime: !fournis };
  });
  const points: PointProspect[] = brutes.map(({ p, valeur, donnees, estime }) => ({
    id: p.id,
    nom: p.nom,
    initiale: p.nom.trim().charAt(0).toUpperCase(),
    offre: p.offre,
    montantCents: p.montantCents ?? 0,
    interet: valeur,
    libelle: libelleInteret(valeur),
    chance: p.probabilite,
    prioritaire: estPrioritaire({ prospect: p, interet: valeur }, reglages),
    trainee: trainee(valeur, donnees.interetIlYa14j),
    etape: p.etape as PointProspect['etape'],
    responsable: p.responsableEmail && equipe.has(p.responsableEmail) ? { email: p.responsableEmail, nom: equipe.get(p.responsableEmail) as string } : null,
    prochaineAction: p.prochaineAction,
    signaux: donnees.evenements,
    estime,
    nouveau: recents.has(p.id),
    mien: p.responsableEmail !== '' && p.responsableEmail === src.moi.email,
  }));
  const notes = brutes.map(({ p, valeur }) => ({ prospect: p, interet: valeur }));
  const parId = new Map(points.map((x) => [x.id, x]));
  const appels = appelsDeLaSemaine(notes, reglages).map((n) => parId.get(n.prospect.id) as PointProspect);
  const prioritaires = points.filter((x) => x.prioritaire);
  const serie = signaturesParMois(src.prospects, src.aujourdhui);
  return {
    points,
    total: points.length,
    enJeuCents: points.reduce((s, x) => s + x.montantCents, 0),
    prioritaires: { n: prioritaires.length, totalCents: prioritaires.reduce((s, x) => s + x.montantCents, 0) },
    reglages,
    plafondCents: plafondDAxe(Math.max(0, ...points.map((x) => x.montantCents))),
    chips: { tous: points.length, miens: points.filter((x) => x.mien).length, nouveaux: points.filter((x) => x.nouveau).length },
    appels,
    candidats: appels.length > 0 ? [] : [...points].filter((x) => !x.prioritaire).sort((a, b) => b.interet * b.montantCents - a.interet * a.montantCents).slice(0, 2),
    signatures: { ceMois: serie[serie.length - 1]?.nb ?? 0, fait: faitEncourageant(serie) },
    estime: points.some((x) => x.estime),
  };
}

export function filtrerPoints(points: readonly PointProspect[], filtre: FiltreProspects): PointProspect[] {
  return points.filter((x) => (filtre === 'miens' ? x.mien : filtre === 'nouveaux' ? x.nouveau : true));
}

/** La Liste de l'en-tête : tous les prospects ouverts, du plus intéressé au moins intéressé, puis du plus gros montant. */
export function listeParInteret(points: readonly PointProspect[]): PointProspect[] {
  return [...points].sort((a, b) => b.interet - a.interet || b.montantCents - a.montantCents || a.nom.localeCompare(b.nom, 'fr'));
}

/** Les semaines commencent le lundi : la clé de « Appels de la semaine » (remise à zéro le lundi). */
export function lundiDe(jour: Jour): Jour {
  const d = new Date(`${jour}T12:00:00Z`);
  const decalage = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - decalage);
  return d.toISOString().slice(0, 10);
}

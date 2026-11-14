import { ajouterJours, ecartJours, jourDeParis, jourSemaineIso, type Jour } from '../commun';

/**
 * LOT-01 · MJ04 « NOTES RAPIDES » — le mur de notes (logique pure, fiche MJ04 rubriques 3, 4 et 6).
 *
 * Ce qui se CALCULE ici : l'ordre (épinglées d'abord, puis les plus récentes), la répartition dans la colonne la plus courte (de gauche à
 * droite), les compteurs des puces (Toutes, Épinglées, À trier, Vocales), le libellé de date du pied (« 09:12 », « Hier », « Lun. », « 12 oct. »),
 * « à trier » (ni étiquette, ni lien, ni dossier) et les propositions de rangement de la carte d'Ajmani (jamais appliquées sans accord).
 *
 * SÉCURITÉ : une note d'ACCÈS ne porte JAMAIS sa valeur : le modèle n'a pas de champ « valeur » (`acces: { masque: true }`), la vignette montre
 * « •••• •• » ; la note pointe vers le coffre-fort (H24). Ne jamais stocker un code en clair dans une note.
 */
export const COLONNES = 4;
export const ECART_NOTES = 12;
export type TypeDeNote = 'texte' | 'liste' | 'vocale' | 'citation' | 'lien' | 'acces' | 'choix';
export type FiltreMur = 'toutes' | 'epinglees' | 'aTrier' | 'vocales';
export type TriMur = 'recentes' | 'anciennes' | 'titre';

export interface NoteEntree {
  id: string;
  titre: string;
  corps: string;
  type: TypeDeNote;
  /** « Idée produit », « À faire », « Chantier »… ou `null`. */
  etiquette: string | null;
  ton?: 'info' | 'attention';
  epinglee: boolean;
  /** ISO. */
  updatedAt: string;
  clientId?: number | null;
  tacheId?: string | null;
  projectId?: string | null;
  dossier?: string | null;
  /** Texte de la puce sous le corps (« Cabinet Roux, même besoin »). */
  puce?: { genre: 'client' | 'lien'; texte: string } | null;
  items?: readonly { texte: string; fait: boolean }[];
  choix?: readonly string[];
  vocale?: { duree: string; transcription: string; onde: readonly number[]; lu: number };
  /** Ce que le pied dit en plus : « transcrite par Ajmani », « pour la refonte Menna ? »… */
  precision?: string;
  /** « En faire une tâche » : l'action proposée sur la note. */
  action?: 'tache' | null;
}

export interface NoteMur extends NoteEntree {
  aTrier: boolean;
  pied: { genre: 'heure' | 'hier' | 'jour' | 'date'; texte: string };
  hauteur: number;
}

export interface PropositionRangement { cle: string; note: string; vers: string }

export interface ModeleMur {
  compteurs: Record<FiltreMur, number>;
  colonnes: NoteMur[][];
  ordre: NoteMur[];
  nbATrier: number;
  propositions: PropositionRangement[];
  vide: boolean;
  /** Le filtre n'a rien donné alors qu'il y a des notes. */
  filtreVide: boolean;
}

const JOURS_COURTS = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
const MOIS_COURTS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

const heureParis = (iso: string): string => new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso));

/** Le pied : l'heure si aujourd'hui, « Hier », le jour abrégé jusqu'à 7 jours, sinon la date courte. */
export function piedDeNote(iso: string, aujourdhui: Jour): NoteMur['pied'] {
  const jour = jourDeParis(iso);
  const ecart = ecartJours(jour, aujourdhui);
  if (ecart === 0) return { genre: 'heure', texte: heureParis(iso) };
  if (ecart === 1) return { genre: 'hier', texte: 'Hier' };
  if (ecart > 1 && ecart <= 7) return { genre: 'jour', texte: JOURS_COURTS[jourSemaineIso(jour) % 7] };
  const d = new Date(`${jour}T12:00:00Z`);
  return { genre: 'date', texte: `${d.getUTCDate()} ${MOIS_COURTS[d.getUTCMonth()]}` };
}

/** À trier : ni étiquette, ni lien (client, tâche, projet), ni dossier. */
export const estATrier = (n: Pick<NoteEntree, 'etiquette' | 'clientId' | 'tacheId' | 'projectId' | 'dossier'>): boolean => !n.etiquette && n.clientId == null && !n.tacheId && !n.projectId && !n.dossier;

/** Une hauteur estimée (px) pour répartir : titre + corps + forme + pied. */
export function hauteurEstimee(n: Pick<NoteEntree, 'type' | 'corps' | 'items' | 'choix' | 'puce'>): number {
  const lignes = Math.max(0, Math.ceil(n.corps.length / 38));
  const base = 78 + lignes * 19;
  switch (n.type) {
    case 'liste': return 96 + (n.items?.length ?? 0) * 26;
    case 'vocale': return 150 + Math.ceil(n.corps.length / 42) * 19;
    case 'acces': return 138;
    case 'choix': return 100 + Math.ceil((n.choix?.length ?? 1) / 2) * 30;
    case 'citation': return base + 26;
    default: return base + (n.puce ? 32 : 0);
  }
}

const normaliser = (t: string): string => t.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

export interface EntreesMur {
  notes: readonly NoteEntree[];
  aujourdhui: Jour;
  filtre?: FiltreMur;
  tri?: TriMur;
  recherche?: string;
  /** « À trier » existe-t-il dans cette source (des étiquettes, des dossiers) ? Sans, la puce, le compte et la carte d'Ajmani n'existent pas. */
  aTrierActif?: boolean;
  /** Les propositions de rangement : données par l'appelant (Ajmani), jamais déduites ici. */
  propositions?: readonly PropositionRangement[];
  /** Un placement imposé (aperçu, tests) : les identifiants de chaque colonne, de haut en bas. */
  colonnesImposees?: readonly (readonly string[])[];
  /** La carte d'Ajmani occupe la première place de cette colonne (0 à 3) ; absente : elle ne prend aucune place. */
  carteAjmaniHauteur?: number;
}

export function modeleMur(e: EntreesMur): ModeleMur {
  const aTrierActif = e.aTrierActif ?? true;
  const toutes: NoteMur[] = e.notes.map((n) => ({ ...n, aTrier: aTrierActif && estATrier(n), pied: piedDeNote(n.updatedAt, e.aujourdhui), hauteur: hauteurEstimee(n) }));
  const compteurs: Record<FiltreMur, number> = { toutes: toutes.length, epinglees: toutes.filter((n) => n.epinglee).length, aTrier: toutes.filter((n) => n.aTrier).length, vocales: toutes.filter((n) => n.type === 'vocale').length };

  const q = normaliser((e.recherche ?? '').trim());
  const filtrees = toutes.filter((n) => {
    if (e.filtre === 'epinglees' && !n.epinglee) return false;
    if (e.filtre === 'aTrier' && !n.aTrier) return false;
    if (e.filtre === 'vocales' && n.type !== 'vocale') return false;
    return !q || normaliser(`${n.titre} ${n.corps} ${n.etiquette ?? ''}`).includes(q);
  });
  const tri = e.tri ?? 'recentes';
  const ordre = [...filtrees].sort((a, b) => {
    if (tri === 'titre') return normaliser(a.titre).localeCompare(normaliser(b.titre)) || a.id.localeCompare(b.id);
    const sens = tri === 'anciennes' ? -1 : 1;
    return Number(b.epinglee) - Number(a.epinglee) || sens * b.updatedAt.localeCompare(a.updatedAt) || a.id.localeCompare(b.id);
  });

  const colonnes: NoteMur[][] = Array.from({ length: COLONNES }, () => []);
  if (e.colonnesImposees) {
    const parId = new Map(ordre.map((n) => [n.id, n]));
    e.colonnesImposees.forEach((ids, i) => { for (const id of ids) { const n = parId.get(id); if (n && colonnes[i]) colonnes[i].push(n); } });
  } else {
    // La colonne la plus courte, de gauche à droite ; la carte d'Ajmani (quand elle existe) prend la première place de la dernière colonne.
    const hauteurs = Array.from({ length: COLONNES }, (_, i) => (i === COLONNES - 1 && e.carteAjmaniHauteur ? e.carteAjmaniHauteur + ECART_NOTES : 0));
    for (const n of ordre) {
      let c = 0;
      for (let i = 1; i < COLONNES; i += 1) if (hauteurs[i] < hauteurs[c]) c = i;
      colonnes[c].push(n);
      hauteurs[c] += n.hauteur + ECART_NOTES;
    }
  }
  const nbATrier = compteurs.aTrier;
  return {
    compteurs, colonnes, ordre, nbATrier,
    propositions: aTrierActif && nbATrier > 0 ? [...(e.propositions ?? [])] : [],
    vide: toutes.length === 0, filtreVide: toutes.length > 0 && filtrees.length === 0,
  };
}

/** Sans les dates : le jour de la semaine abrégé d'un jour ISO (pour les tests et l'aperçu). */
export const jourCourtDe = (j: Jour): string => JOURS_COURTS[jourSemaineIso(j) % 7];
export { ajouterJours };

import { ecartJours, ms, type Instant, type Jour } from './commun';

/**
 * ÉCRIRE ET RETENIR, VUE D'ENSEMBLE (F20) — l'index des 9 modules, les mesures des tuiles, la suggestion de rangement.
 * Logique pure. Le hub ne contient aucune donnée propre : il lit les autres écrans du lot.
 */

/** Les 9 modules, dans l'ordre de la fiche. `route` : à poser avec les substitutions quand le socle v4 sera fusionné. */
export const MODULES_D_ECRIRE = [
  { cle: 'notes', ecran: 'H10', vue: 'notes' },
  { cle: 'documents', ecran: 'H11', vue: 'binder' },
  { cle: 'journal', ecran: 'ME01', vue: 'logbook' },
  { cle: 'redaction', ecran: 'ME02', vue: 'writing' },
  { cle: 'modeles', ecran: 'ME03', vue: 'templates' },
  { cle: 'signatures', ecran: 'H12', vue: 'esign' },
  { cle: 'archives', ecran: 'ME04', vue: null },
  { cle: 'connaissances', ecran: 'ME05', vue: 'knowledge' },
  { cle: 'dictee', ecran: null, vue: null },
] as const;
export type ModuleDEcrire = (typeof MODULES_D_ECRIRE)[number]['cle'];

export interface MesuresDuHub {
  pages: number;
  documents: number;
  /** Série d'écriture du journal (jours de suite). */
  serieJournal: number;
  brouillons: number;
  modeles: number;
  enAttenteDeSignature: number;
  archives: number;
  articles: number;
  lecturesDuMois: number;
  /** Nombre de dictées déjà faites : « Nouveau » tant qu'il n'y en a aucune. */
  dictees: number;
  /** Quelqu'un écrit avec la personne en ce moment (membre en ligne sur une page). */
  coAuteur?: string | null;
}

export type TonDeTuile = 'neutre' | 'vert' | 'orange';

export interface TuileDeModule {
  cle: ModuleDEcrire;
  /** La mesure : un nombre, ou deux (articles et lectures). */
  nombres: number[];
  ton: TonDeTuile;
  /** Pastille « Nouveau » : Dictée vocale tant qu'aucune dictée. */
  nouveau: boolean;
  /** Pastille de compte (Signatures : 3 en attente), seulement si > 0. */
  pastille: number | null;
}

/**
 * Les tuiles de l'index : ne montre que les modules actifs du métier (le reste se range derrière « Ajouter un module »).
 * Journal en vert (série), Signatures en orange tant qu'une demande attend. Dictée vocale : un point d'entrée à créer.
 */
export function tuilesDuHub(m: MesuresDuHub, actifs: ReadonlySet<ModuleDEcrire> | null = null): TuileDeModule[] {
  const tuile = (cle: ModuleDEcrire, nombres: number[], plus: Partial<TuileDeModule> = {}): TuileDeModule => ({ cle, nombres, ton: 'neutre', nouveau: false, pastille: null, ...plus });
  const toutes: TuileDeModule[] = [
    tuile('notes', [m.pages]),
    tuile('documents', [m.documents]),
    tuile('journal', [m.serieJournal], { ton: m.serieJournal > 0 ? 'vert' : 'neutre' }),
    tuile('redaction', [m.brouillons]),
    tuile('modeles', [m.modeles]),
    tuile('signatures', [m.enAttenteDeSignature], { ton: m.enAttenteDeSignature > 0 ? 'orange' : 'neutre', pastille: m.enAttenteDeSignature > 0 ? m.enAttenteDeSignature : null }),
    tuile('archives', [m.archives]),
    tuile('connaissances', [m.articles, m.lecturesDuMois]),
    tuile('dictee', [], { nouveau: m.dictees === 0 }),
  ];
  return actifs ? toutes.filter((t) => actifs.has(t.cle)) : toutes;
}

/* ------------------------------ Suggestion de rangement ------------------------------ */

export const NOTES_POUR_RANGER = 5;
export const JOURS_SANS_PLACE = 3;

export interface NoteRapideMin {
  id: string;
  texte: string;
  creeeLe: Jour;
  projetId?: string | null;
  categorie?: string | null;
}

/**
 * « 14 notes rapides n'ont pas de place. Je les range dans tes projets en cours ? » Déclencheur : au moins 5 notes
 * rapides sans projet ni catégorie depuis plus de 3 jours ; sinon rien. Rien ne bouge sans accord (aperçu avant validation).
 */
export function suggestionDeRangement(notes: readonly NoteRapideMin[], aujourdhui: Jour): { n: number; ids: string[] } | null {
  const sansPlace = notes.filter((x) => !x.projetId && !x.categorie && ecartJours(x.creeeLe, aujourdhui) > JOURS_SANS_PLACE);
  return sansPlace.length >= NOTES_POUR_RANGER ? { n: sansPlace.length, ids: sansPlace.map((x) => x.id) } : null;
}

export interface ProjetMin {
  id: string;
  nom: string;
  actif: boolean;
}

/** Les projets actifs dont le nom figure dans la note (ou la note dans le nom) : la cible proposée. Aucune correspondance : pas de cible. */
export function projetCible(note: Pick<NoteRapideMin, 'texte'>, projets: readonly ProjetMin[]): ProjetMin | null {
  const t = note.texte.toLowerCase();
  return projets.filter((p) => p.actif).find((p) => p.nom && t.includes(p.nom.toLowerCase())) ?? null;
}

/* ------------------------------ Salutation et accueil ------------------------------ */

/** « Bonjour » avant 18 h, « Bonsoir » ensuite (heure de Paris, en minutes depuis minuit). */
export const salutation = (minutes: number): 'bonjour' | 'bonsoir' => (minutes >= 18 * 60 || minutes < 4 * 60 ? 'bonsoir' : 'bonjour');

/** Un invité ne voit que les pages partagées avec lui ; il n'a pas de « Nouvelle page ». */
export const peutCreerUnePage = (role: string): boolean => role !== 'Invité' && role !== 'Partenaire';

/** Maintenant, borné : instants invalides refusés pour que l'écran n'affiche jamais « NaN jours ». */
export const instantValide = (i: Instant): boolean => Number.isFinite(typeof i === 'number' ? i : Date.parse(i)) && ms(i) > 0;

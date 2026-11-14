/**
 * MJ04 · NOTES RAPIDES — ce qui se calcule sur une liste de notes (fiche MJ04, à confirmer).
 *
 * Écrit d'après `NoteRapide` (sur-ensemble de `Note`, `src/state/useNotes.ts`) et les jeux de SIM. La visibilité suit
 * les trois valeurs du modèle : « privée » (son auteur seulement), « équipe » (tout le monde), « personnes
 * choisies ». **Le modèle ne dit pas QUELLES personnes** : tant que la liste n'existe pas, une note « personnes
 * choisies » n'est montrée qu'à son auteur (le choix qui ne divulgue rien) — c'est une demande de données (note du
 * lot, « Manque aux données »).
 */

export type VisibiliteDeNote = 'privée' | 'équipe' | 'personnes choisies';

export interface NoteDuLot {
  id: string;
  title: string;
  body: string;
  authorEmail: string;
  pinned: boolean;
  updatedAt: string;
  etiquette: string | null;
  visibilite: VisibiliteDeNote;
  clientId: number | null;
  tacheId: string | null;
  projectId?: string | null;
  /** Point blanc « non lue » : créée ou modifiée ailleurs depuis la dernière ouverture. */
  nonLue: boolean;
}

/** Une note est visible de `email` : l'équipe la voit toute entière ; le reste, son auteur seulement. */
export function noteVisiblePar(n: Pick<NoteDuLot, 'visibilite' | 'authorEmail'>, email: string): boolean {
  return n.visibilite === 'équipe' || n.authorEmail === email;
}

/** Épinglées d'abord, puis les plus récemment modifiées, puis l'identifiant (l'ordre ne bouge jamais d'un rendu à l'autre). */
export function trierLesNotes<N extends Pick<NoteDuLot, 'id' | 'pinned' | 'updatedAt'>>(notes: readonly N[]): N[] {
  return [...notes].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt) || a.id.localeCompare(b.id));
}

/** Minuscules, sans accents : « Réunion » se trouve en tapant « reunion ». */
export const normaliser = (t: string): string => t.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

export interface FiltreDeNotes {
  recherche?: string;
  etiquette?: string | null;
  /** Seulement celles qui portent le point blanc. */
  nonLues?: boolean;
}

/** Les notes que `email` peut voir, filtrées, triées. La recherche porte sur le titre et le corps. */
export function notesAffichees<N extends NoteDuLot>(notes: readonly N[], email: string, filtre: FiltreDeNotes = {}): N[] {
  const q = normaliser((filtre.recherche ?? '').trim());
  return trierLesNotes(
    notes.filter(
      (n) =>
        noteVisiblePar(n, email) &&
        (!filtre.etiquette || n.etiquette === filtre.etiquette) &&
        (!filtre.nonLues || n.nonLue) &&
        (q === '' || normaliser(`${n.title}\n${n.body}`).includes(q)),
    ),
  );
}

/** Les étiquettes en usage, de la plus fréquente à la moins fréquente (puis par nom), avec leur compte. Les notes sans étiquette n'y figurent pas. */
export function etiquettesDesNotes(notes: readonly Pick<NoteDuLot, 'etiquette'>[]): { etiquette: string; nombre: number }[] {
  const compte = new Map<string, number>();
  for (const n of notes) if (n.etiquette) compte.set(n.etiquette, (compte.get(n.etiquette) ?? 0) + 1);
  return [...compte.entries()].map(([etiquette, nombre]) => ({ etiquette, nombre })).sort((a, b) => b.nombre - a.nombre || a.etiquette.localeCompare(b.etiquette));
}

/** Une note « sans place » n'est liée ni à un client, ni à une tâche, ni à un projet : Ajmani propose de la ranger. */
export function notesSansPlace<N extends Pick<NoteDuLot, 'clientId' | 'tacheId' | 'projectId'>>(notes: readonly N[]): N[] {
  return notes.filter((n) => n.clientId === null && n.tacheId === null && !n.projectId);
}

/** La première ligne du texte, coupée avec « … » (70 signes par défaut). */
export function apercuDeNote(corps: string, max = 70): string {
  const ligne = corps.split('\n')[0].trim();
  return ligne.length <= max ? ligne : `${ligne.slice(0, max - 1).trimEnd()}…`;
}

/** Combien de notes portent le point blanc pour cette personne (celles qu'elle peut voir). */
export function nonLues(notes: readonly NoteDuLot[], email: string): number {
  return notes.filter((n) => n.nonLue && noteVisiblePar(n, email)).length;
}

import type { Jour } from './commun';

/**
 * MJ01 · PROJETS — l'avancement et le statut sont CALCULÉS, jamais saisis (fiche MJ01, « règle d'affichage »).
 *
 * L'avancement d'un projet est la part de ses tâches terminées ; un projet sans tâche garde l'avancement saisi à la
 * main (`avancementManuel`). Le statut suit l'ordre exact de la fiche : Terminé, En retard, Presque fini, À démarrer,
 * En cours. SIM a recalculé les mêmes règles dans ses jeux (`avancementProjet`, `statutProjet`) : `check:journee`
 * compare.
 *
 * Le mot « En retard » est celui de la fiche ; l'écran l'habille sans reproche (pas de rouge qui crie, une phrase qui
 * dit la suite : voir `phrases.ts`).
 */

export type StatutDeProjet = 'À démarrer' | 'En cours' | 'Presque fini' | 'En retard' | 'Terminé';

/** À partir de cet avancement (pourcent), un projet est « Presque fini » ; jusqu'à celui-ci, « À démarrer ». */
export const SEUIL_PRESQUE_FINI = 85;
export const SEUIL_A_DEMARRER = 20;

export interface ProjetPourStatut {
  id: string;
  avancementManuel: number | null;
  /** Jour d'échéance (`deadline`). */
  deadline: Jour;
}

export interface TacheDeProjet {
  projectId: string | null;
  status: string;
}

export function avancementDuProjet(projet: Pick<ProjetPourStatut, 'id' | 'avancementManuel'>, taches: readonly TacheDeProjet[]): number {
  const liees = taches.filter((t) => t.projectId === projet.id);
  if (liees.length === 0) return projet.avancementManuel ?? 0;
  return Math.round((liees.filter((t) => t.status === 'done').length / liees.length) * 100);
}

export function statutDuProjet(avancement: number, deadline: Jour, aujourdhui: Jour, aDesTachesCommencees: boolean): StatutDeProjet {
  if (avancement >= 100) return 'Terminé';
  if (deadline < aujourdhui) return 'En retard';
  if (avancement >= SEUIL_PRESQUE_FINI) return 'Presque fini';
  if (avancement <= SEUIL_A_DEMARRER || !aDesTachesCommencees) return 'À démarrer';
  return 'En cours';
}

export interface ProjetCalcule {
  id: string;
  avancement: number;
  statut: StatutDeProjet;
}

export function projetCalcule(projet: ProjetPourStatut, taches: readonly TacheDeProjet[], aujourdhui: Jour): ProjetCalcule {
  const liees = taches.filter((t) => t.projectId === projet.id);
  const avancement = avancementDuProjet(projet, taches);
  return { id: projet.id, avancement, statut: statutDuProjet(avancement, projet.deadline, aujourdhui, liees.some((t) => t.status !== 'todo')) };
}

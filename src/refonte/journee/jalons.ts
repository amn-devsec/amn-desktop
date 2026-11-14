import { plafonner } from './commun';

/**
 * LES JALONS — ce que la personne a atteint, et ce qui vient ensuite (H04 « Jalons », L01).
 *
 * Un jalon n'a que deux états : atteint, ou pas encore. Jamais « raté », jamais « perdu ». Ce fichier ne connaît que
 * les jalons que le dépôt documente (la *Proposition* de la fiche H04, reprise par SIM) : les autres jalons de L01
 * sont à lire sur la fiche (note du lot, §2) et s'ajoutent ici, un par une constante.
 */

/** « 10 factures » : le jalon des factures envoyées ou payées (H04, *Proposition*). */
export const JALON_FACTURES = 10;

export interface JalonDeFactures {
  atteint: boolean;
  /** Factures envoyées ou payées, au total. */
  nombre: number;
  /** Combien il en manque pour l'atteindre (0 une fois atteint). */
  reste: number;
  progression: number;
}

/** Les factures « envoyées ou payées » : les brouillons et les annulées ne comptent pas. */
export function compterFacturesEnvoyees(factures: readonly { status: string }[]): number {
  return factures.filter((f) => f.status === 'issued' || f.status === 'paid').length;
}

export function jalonDeFactures(envoyeesOuPayees: number): JalonDeFactures {
  const nombre = Math.max(0, Math.trunc(envoyeesOuPayees));
  return { atteint: nombre >= JALON_FACTURES, nombre, reste: Math.max(0, JALON_FACTURES - nombre), progression: plafonner(nombre / JALON_FACTURES) };
}

import { lazy } from 'react';
import { declarerSubstitutions } from '../declarer';

/**
 * LOT-05 — Échanger. Les écrans refondus de la famille, un par route d'origine ; un écran n'est déclaré qu'une fois
 * construit et mesuré (un commit chacun).
 */
export default declarerSubstitutions('echanger', [
  // F40 — la vue d'ensemble de la famille, à la place de la page générique (`/ensemble/echanger`, sa route exacte).
  { route: '/ensemble/echanger', composant: lazy(() => import('../../echanger/ecrans/f40/PageHub')) },
]);

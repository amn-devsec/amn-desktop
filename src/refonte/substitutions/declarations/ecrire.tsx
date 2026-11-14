import { lazy } from 'react';
import { declarerSubstitutions } from '../declarer';

/**
 * LOT-03 — Écrire et retenir. Les écrans refondus de la famille, un par route d'origine ; un écran n'est déclaré
 * qu'une fois construit et mesuré (un commit chacun).
 */
export default declarerSubstitutions('ecrire', [
  // F20 — la vue d'ensemble de la famille, à la place de la page générique (`/ensemble/ecrire`, sa route exacte).
  { route: '/ensemble/ecrire', composant: lazy(() => import('../../ecrire/ecrans/f20/PageHub')) },
]);

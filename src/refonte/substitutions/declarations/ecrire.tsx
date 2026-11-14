import { lazy } from 'react';
import { declarerSubstitutions } from '../declarer';

/**
 * LOT-03 — Écrire et retenir. Les écrans refondus de la famille, un par route d'origine ; un écran n'est déclaré
 * qu'une fois construit et mesuré (un commit chacun).
 */
export default declarerSubstitutions('ecrire', [
  // F20 — la vue d'ensemble de la famille, à la place de la page générique (`/ensemble/ecrire`, sa route exacte).
  { route: '/ensemble/ecrire', composant: lazy(() => import('../../ecrire/ecrans/f20/PageHub')) },
  // H10 — Notes et pages, à la place de l'écran des notes (même route ; la session de support garde l'écran d'origine).
  { route: '/notes', composant: lazy(() => import('../../ecrire/ecrans/h10/PageNotes')) },
  // H11 — Documents, à la place du classeur (même route).
  { route: '/classeur', composant: lazy(() => import('../../ecrire/ecrans/h11/PageDocuments')) },
  // H12 — Signatures : les circuits de signature à distance, à la place de leur écran (même route).
  { route: '/signature-a-distance', composant: lazy(() => import('../../ecrire/ecrans/h12/PageSignatures')) },
  // ME01 — Journal, à la place du journal personnel (même route).
  { route: '/personnel/journal', composant: lazy(() => import('../../ecrire/ecrans/me01/PageJournal')) },
]);

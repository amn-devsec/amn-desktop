import { lazy } from 'react';
import { declarerSubstitutions } from '../declarer';

/**
 * LOT-05 — Échanger. Les écrans refondus de la famille, un par route d'origine ; un écran n'est déclaré qu'une fois
 * construit et mesuré (un commit chacun).
 */
export default declarerSubstitutions('echanger', [
  // F40 — la vue d'ensemble de la famille, à la place de la page générique (`/ensemble/echanger`, sa route exacte).
  { route: '/ensemble/echanger', composant: lazy(() => import('../../echanger/ecrans/f40/PageHub')) },
  // H13 — Appels et salles : le combiné, les salles en direct et l'historique.
  { route: '/appels', composant: lazy(() => import('../../echanger/ecrans/h13/PageAppels')) },
  // MX04 — Canaux : le rail, la conversation du canal et le fil. Route d'origine des groupes.
  { route: '/groupes', composant: lazy(() => import('../../echanger/ecrans/mx04/PageCanaux')) },
  // MX05 — Sondages : le résultat en direct et l'éditeur.
  { route: '/sondages', composant: lazy(() => import('../../echanger/ecrans/mx05/PageSondages')) },
  // H14 — Annonces : le tableau de l'équipe.
  { route: '/annonces', composant: lazy(() => import('../../echanger/ecrans/h14/PageAnnonces')) },
]);

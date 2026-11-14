import { lazy } from 'react';
import { declarerSubstitutions } from '../declarer';

/**
 * LOT-11 — Développement : le 8e hub, la vue d'ensemble (fiche DEV-ensemble, validée par Harun le 12 nov.), à la
 * place du repli générique `/ensemble/developpement`. Les six autres écrans du lot sont neufs : le registre les
 * monte lui-même (`modules/declarations/developpement.ts`).
 */
export default declarerSubstitutions('developpement', [
  { route: '/ensemble/developpement', composant: lazy(() => import('../../developpement/VueDEnsemble')) },
]);

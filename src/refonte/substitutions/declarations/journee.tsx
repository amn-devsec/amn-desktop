import { lazy } from 'react';
import { declarerSubstitutions } from '../declarer';

/**
 * LOT-01 — Ma journée. Chaque écran refondu est un composant de `src/refonte/journee/ecrans/<ID>/`, substitué à l'écran
 * d'origine de la même route (STATUT §1.3). Les écrans nouveaux (H03, MJ05, L01, L02, L03, L07, G08) sont des vues du
 * registre (`declarations/jour.ts`, `nouveau`) ; N01 passe par la couture `@edition/accueils` ; H01 par une couture,
 * son fichier d'origine étant partagé avec l'édition cliente.
 */
export default declarerSubstitutions('journee', [
  // H25 — Tableau de bord, widgets.
  { route: '/tableau-de-bord', module: 'dashboard', composant: lazy(() => import('../../journee/ecrans/H25/TableauDeBordRefonte')) },
]);

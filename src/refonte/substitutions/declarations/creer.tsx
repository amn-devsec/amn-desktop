import { lazy } from 'react';
import { declarerSubstitutions } from '../declarer';

/**
 * LOT-06 — Créer et produire. Chaque écran refondu est un composant de `src/refonte/creer/ecrans/<ID>/`, substitué à
 * l'écran d'origine de la même route (STATUT §1.3). `/reservations` et `/photos-chantier` sont des routes nouvelles :
 * elles se montent dans `appRoot.internal.tsx`, pas ici.
 */
export default declarerSubstitutions('creer', [
  // F50 — le hub de la famille (route exacte, `hubs.ts`).
  { route: '/ensemble/creer', composant: lazy(() => import('../../creer/ecrans/F50/HubCreer')) },
  // H15 — Stock.
  { route: '/stock', module: 'stock', composant: lazy(() => import('../../creer/ecrans/H15/StockRefonte')) },
]);

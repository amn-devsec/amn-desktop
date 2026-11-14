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
  // H16 — Chantiers (les bons d'intervention gardent `/interventions`).
  { route: '/montage', module: 'assembly', composant: lazy(() => import('../../creer/ecrans/H16/ChantiersRefonte')) },
  // H17 — Visuels et marque (`/visuels-pub` garde son écran).
  { route: '/identite-visuelle', module: 'brand', composant: lazy(() => import('../../creer/ecrans/H17/MarqueRefonte')) },
  // MR01 — Vidéo (`/productions-video` garde son écran : la production, reliée par le titre).
  { route: '/montage-video', module: 'video', composant: lazy(() => import('../../creer/ecrans/MR01/VideoRefonte')) },
  // MR02 — Ma page publique (`/portfolio` garde son écran).
  { route: '/mini-page', module: 'minisite', composant: lazy(() => import('../../creer/ecrans/MR02/PagePubliqueRefonte')) },
  // MR03 — Tournées (`/itineraires` garde son écran).
  { route: '/tournees', module: 'rounds', composant: lazy(() => import('../../creer/ecrans/MR03/TourneesRefonte')) },
]);

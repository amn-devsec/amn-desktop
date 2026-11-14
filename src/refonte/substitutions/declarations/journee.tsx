import { lazy } from 'react';
import { declarerSubstitutions } from '../declarer';

/**
 * LOT-01 — Ma journée (STATUT § 1.3), construit par S7 (`journee/ecrans/<ID>/`) et S1 (`journee/<écran>/`) : les écrans
 * refondus, substitués à l'écran d'origine de la même route. Les écrans nouveaux (H03, G08, MJ05, L01, L02, L03, L07) sont des
 * vues du registre (`declarations/jour.ts`, `nouveau`), pas ici ; N01 passe par la couture `@edition/accueils` ; H01 par une
 * couture, son fichier d'origine étant partagé avec l'édition cliente.
 */
export default declarerSubstitutions('journee', [
  // — Moitié S7 —
  // H25 — Tableau de bord, widgets.
  { route: '/tableau-de-bord', module: 'dashboard', composant: lazy(() => import('../../journee/ecrans/H25/TableauDeBordRefonte')) },
  // H02 — Tâches.
  { route: '/tasks', module: 'tasks', composant: lazy(() => import('../../journee/ecrans/H02/TachesRefonte')) },
  // H04 — Bilan de la semaine.
  { route: '/revue-hebdo', module: 'weekly', composant: lazy(() => import('../../journee/ecrans/H04/BilanRefonte')) },

  // — Moitié S1 —
  // H01 — Calendrier : la semaine. « Jour », « Mois » et la création passent par l'écran d'origine (`useOutlet`), partagé avec l'édition cliente.
  { route: '/agenda', composant: lazy(() => import('../../journee/calendrier/PageCalendrier')) },

  // MJ01 — Projets : la feuille de route. La création, l'ouverture d'un projet et le modèle passent par l'écran d'origine (`useOutlet`).
  { route: '/projets', composant: lazy(() => import('../../journee/projets/PageProjets')) },

  // MJ02 — Habitudes : la grille de régularité. Créer, retirer et la bibliothèque passent par l'écran d'origine (`useOutlet`).
  { route: '/personnel/habitudes', composant: lazy(() => import('../../journee/habitudes/PageHabitudes')) },

  // MJ03 — Planning de l'équipe : un bloc par personne. Créer, modifier et dupliquer passent par l'écran d'origine (`useOutlet`).
  { route: '/planning', composant: lazy(() => import('../../journee/planning/PagePlanning')) },
]);

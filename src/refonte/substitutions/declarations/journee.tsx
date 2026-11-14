import { lazy } from 'react';
import { declarerSubstitutions } from '../declarer';

/**
 * LOT-01 — Ma journée, la moitié de S1 (STATUT § 1.3) : les écrans refondus, à la place des écrans d'origine. Chaque écran vit dans
 * `src/refonte/journee/<écran>/` (une vue, une page branchée, un fichier de mots) et se déclare ici par la route EXACTE de l'écran
 * d'origine. Les écrans neufs (H03, G08, MJ05) n'ont pas d'écran d'origine : ils se déclarent au registre des modules
 * (`modules/declarations/jour.ts`, champ `nouveau`), pas ici.
 */
export default declarerSubstitutions('journee', [
  // H01 — Calendrier : la semaine. « Jour », « Mois » et la création passent par l'écran d'origine (`useOutlet`), partagé avec l'édition cliente.
  { route: '/agenda', composant: lazy(() => import('../../journee/calendrier/PageCalendrier')) },

  // MJ01 — Projets : la feuille de route. La création, l'ouverture d'un projet et le modèle passent par l'écran d'origine (`useOutlet`).
  { route: '/projets', composant: lazy(() => import('../../journee/projets/PageProjets')) },

  // MJ02 — Habitudes : la grille de régularité. Créer, retirer et la bibliothèque passent par l'écran d'origine (`useOutlet`).
  { route: '/personnel/habitudes', composant: lazy(() => import('../../journee/habitudes/PageHabitudes')) },
]);

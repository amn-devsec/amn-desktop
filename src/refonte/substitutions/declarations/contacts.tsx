import { lazy } from 'react';
import { declarerSubstitutions } from '../declarer';

/**
 * LOT-02 — Mes contacts et clients : les écrans refondus, à la place des écrans d'origine (STATUT § 1.3).
 *
 * Chaque écran vit dans `src/refonte/contacts/<écran>/` (une vue de présentation, une page branchée, un fichier de
 * mots) et se déclare ici par la route EXACTE de l'écran d'origine. La nouvelle coquille éteinte, l'écran d'origine
 * reste seul ; allumée (Paramètres › Nouvelle coquille), le substitut le remplace.
 *
 * Les écrans neufs (MC01, MC03, MC05, MC06 : `/pipeline-commercial`, `/contacts/fiches`, `/partenaires`,
 * `/rendez-vous-clients`) n'ont pas d'écran d'origine : ils se déclarent au registre des modules
 * (`modules/declarations/contacts.ts`, champ `nouveau`), pas ici.
 */
export default declarerSubstitutions('contacts', [
  // F10 — la vue d'ensemble de la famille : la route exacte de SON hub (`hubs.ts`), jamais `/ensemble/:famille`.
  { route: '/ensemble/contacts', composant: lazy(() => import('../../contacts/hub/PageHub')) },
]);

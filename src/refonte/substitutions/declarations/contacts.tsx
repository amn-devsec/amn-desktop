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

  // H05 — Clients : la mosaïque. La fiche, la création et le reste passent par l'écran d'origine (`useOutlet`) jusqu'à leur refonte.
  { route: '/clients', composant: lazy(() => import('../../contacts/clients/PageClients')) },

  // H06 — Prospects : le nuage intérêt × montant. « Colonnes » et la création restent servies par l'écran d'origine (`useOutlet`).
  { route: '/pipeline', composant: lazy(() => import('../../contacts/prospects/PageProspects')) },

  // H44 — Retours clients : la jauge, les thèmes et le mur. « Demander un avis » passe par l'écran d'origine (`useOutlet`).
  { route: '/avis', composant: lazy(() => import('../../contacts/retours/PageRetours')) },

  // H45 — Fournisseurs : la matrice « Comparer pour un besoin ». La liste des fournisseurs reste servie par l'écran d'origine (`useOutlet`).
  { route: '/fournisseurs', composant: lazy(() => import('../../contacts/fournisseurs/PageFournisseurs')) },

  // MC07 — Relances : la pile focalisée. L'écran d'origine (relances de factures, envoi par courriel) reste servi par « Modèles de messages » (`useOutlet`).
  { route: '/relances', composant: lazy(() => import('../../contacts/pile/PagePile')) },

  // MC04 — Équipe : les cartes de personne. L'organigramme reste servi par l'écran d'origine (`useOutlet`).
  { route: '/trombinoscope', composant: lazy(() => import('../../contacts/equipe/PageEquipe')) },
]);

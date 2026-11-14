import { lazy } from 'react';
import { declarerSubstitutions } from '../declarer';

/**
 * LOT-04 — L'argent : les écrans refondus, chacun à la place de sa route d'origine (coquille allumée).
 *
 * Les vues sans route d'origine (Budget, Comptabilité, Tarifs et remises) sont des écrans neufs du registre
 * (`src/refonte/modules/declarations/argent.ts`), pas des substitutions.
 */
export default declarerSubstitutions('argent', [
  // MA03 · Paiements en ligne : l'écran des acomptes et du paiement en ligne.
  { route: '/acompte', composant: lazy(() => import('../../argent/ecrans/paiements/PagePaiements')) },
  // H07 · Devis : le devis en cours, sur son plan de travail.
  { route: '/facturation/devis', composant: lazy(() => import('../../argent/ecrans/devis/PageDevis')) },
]);

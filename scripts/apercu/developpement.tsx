/**
 * LOT-11 · ESPACE DÉVELOPPEMENT — ce que partagent les aperçus `DEV-*` (scripts/apercu/ecrans/DEV-*.tsx).
 *
 * Les données sont les jeux FICTIFS de SIM à l'état rempli (`construireMonde()`), au « maintenant » de référence des
 * jeux, mis à la forme des écrans par `depuisMonde` (la même porte que l'application pour un compte d'essai). La
 * coquille est `ApercuBureau`, famille Développement dépliée ; ses deux signaux sont calculés comme dans
 * l'application (`src/refonte/compteurs/developpement.ts`). Rien ici n'entre dans l'application.
 */
import React from 'react';
import { construireMonde, MAINTENANT_REFERENCE } from '../../src/refonte/donnees';
import { depuisMonde } from '../../src/refonte/developpement/donnees';
import { etatGlobal } from '../../src/refonte/developpement/deploiements';
import { ApercuBureau } from './coquille';

export const DONNEES = depuisMonde(construireMonde(), MAINTENANT_REFERENCE);

const SIGNAUX = {
  deploiements: DONNEES.deploiements.filter((x) => etatGlobal(x) === 'en-cours').length,
  tests: DONNEES.depots.filter((x) => x.tests.etat === 'echec').length,
};

export function ApercuDev({ sousPage, titre, children }: { sousPage: string; titre: string; children: React.ReactNode }) {
  return (
    <ApercuBureau famille="developpement" sousPage={sousPage} fil={['Développement', titre]} developpement={SIGNAUX}>
      {children}
    </ApercuBureau>
  );
}

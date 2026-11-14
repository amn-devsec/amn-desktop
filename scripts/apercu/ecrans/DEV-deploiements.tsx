/**
 * APERÇU « DEV-deploiements » — Développement, Déploiements (v4), sur les déploiements FICTIFS de SIM (état rempli).
 *
 *   npm run apercu -- DEV-deploiements
 */
import React from 'react';
import { DeploiementsDev } from '../../../src/refonte/developpement/PageDeploiements';
import { ApercuDev, DONNEES } from '../developpement';

export default function Apercu() {
  return (
    <ApercuDev sousPage="deploiements" titre="Déploiements">
      <DeploiementsDev d={DONNEES} />
    </ApercuDev>
  );
}

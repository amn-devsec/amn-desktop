/**
 * APERÇU « DEV-ensemble » — Développement, Vue d'ensemble (proposition de LOT-11, sans image v4, validée par Harun),
 * sur les jeux FICTIFS de SIM à l'état rempli.
 *
 *   npm run apercu -- DEV-ensemble
 */
import React from 'react';
import { EnsembleDev } from '../../../src/refonte/developpement/VueDEnsemble';
import { ApercuDev, DONNEES } from '../developpement';

export default function Apercu() {
  return (
    <ApercuDev sousPage="ensemble" titre="Vue d'ensemble">
      <EnsembleDev d={DONNEES} />
    </ApercuDev>
  );
}

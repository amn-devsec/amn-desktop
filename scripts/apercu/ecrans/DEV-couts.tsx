/**
 * APERÇU « DEV-couts » — Développement, Coûts et API (v4), sur les connecteurs et paiements FICTIFS de SIM (état rempli).
 * Les comptes sont calculés depuis le jeu, jamais repris de l'image.
 *
 *   npm run apercu -- DEV-couts
 */
import React from 'react';
import { CoutsDev } from '../../../src/refonte/developpement/CoutsEtApi';
import { ApercuDev, DONNEES } from '../developpement';

export default function Apercu() {
  return (
    <ApercuDev sousPage="couts" titre="Coûts et API">
      <CoutsDev d={DONNEES} />
    </ApercuDev>
  );
}

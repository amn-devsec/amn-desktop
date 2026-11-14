/**
 * APERÇU « DEV-projets » — Développement, Projets de code (v4), sur les dépôts FICTIFS de SIM (état rempli).
 * Les dépôts, commits et tests sont ceux du jeu, pas ceux de l'image.
 *
 *   npm run apercu -- DEV-projets
 */
import React from 'react';
import { ProjetsDev } from '../../../src/refonte/developpement/ProjetsDeCode';
import { ApercuDev, DONNEES } from '../developpement';

export default function Apercu() {
  return (
    <ApercuDev sousPage="projets" titre="Projets de code">
      <ProjetsDev d={DONNEES} />
    </ApercuDev>
  );
}

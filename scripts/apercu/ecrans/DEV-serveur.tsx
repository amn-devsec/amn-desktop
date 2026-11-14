/**
 * APERÇU « DEV-serveur » — Développement, Serveur et santé (v4), sur les mesures et services FICTIFS de SIM (état
 * rempli). Aucun nom de machine ni adresse : le jeu n'en a pas.
 *
 *   npm run apercu -- DEV-serveur
 */
import React from 'react';
import { ServeurDev } from '../../../src/refonte/developpement/ServeurSante';
import { ApercuDev, DONNEES } from '../developpement';

export default function Apercu() {
  return (
    <ApercuDev sousPage="serveur" titre="Serveur et santé">
      <ServeurDev d={DONNEES} />
    </ApercuDev>
  );
}

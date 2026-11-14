/**
 * APERÇU « DEV-modeles-sites-code » — Modèles de sites, un modèle ouvert en vue Code (image v4
 * `DEV-modeles-sites-code.png`), sur le modèle FICTIF « Veillance » de `../modeles-exemple` (celui de l'image).
 *
 *   npm run apercu -- DEV-modeles-sites-code
 */
import React from 'react';
import { ModelesDev } from '../../../src/refonte/developpement/ModelesDeSites';
import { ApercuDev, DONNEES } from '../developpement';
import { MODELES_EXEMPLE } from '../modeles-exemple';

export default function Apercu() {
  return (
    <ApercuDev sousPage="modeles-sites" titre="Modèles de sites">
      <ModelesDev d={DONNEES} ajoutesInitiaux={MODELES_EXEMPLE} ouvertInitial="exemple-veillance" vueInitiale="code" />
    </ApercuDev>
  );
}

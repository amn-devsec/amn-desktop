/**
 * APERÇU « DEV-modeles-sites » — Développement, Modèles de sites (image v4 `DEV-modeles-sites.png`), état rempli.
 *
 * Dans l'application, la liste livrée reste vide jusqu'à la relecture des textes par Harun (décision du 12 nov.) :
 * l'aperçu pose donc huit modèles FICTIFS (`../modeles-exemple`), aux noms, secteurs et étiquettes de l'image, avec
 * des pages simples écrites pour l'aperçu (pas celles de la maquette, qui n'entrent pas dans le dépôt).
 *
 *   npm run apercu -- DEV-modeles-sites
 */
import React from 'react';
import { ModelesDev } from '../../../src/refonte/developpement/ModelesDeSites';
import { ApercuDev, DONNEES } from '../developpement';
import { MODELES_EXEMPLE } from '../modeles-exemple';

export default function Apercu() {
  return (
    <ApercuDev sousPage="modeles-sites" titre="Modèles de sites">
      <ModelesDev d={DONNEES} ajoutesInitiaux={MODELES_EXEMPLE} />
    </ApercuDev>
  );
}

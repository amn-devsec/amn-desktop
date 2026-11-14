/**
 * APERÇU « H45 » — Fournisseurs (LOT-02), tel que sur l'image : vendredi 30 oct. 2026, 10:42.
 *
 *   npm run apercu -- H45
 *
 * Rendue par les VRAIS composants de l'écran (`VueFournisseurs`) sur le modèle `modeleFournisseurs` calculé depuis les
 * fournisseurs et l'historique d'achats FICTIFS de SIM. Les noms, les prix et les délais sont ceux du jeu ; c'est la
 * disposition qui se compare.
 */
import React from 'react';
import { ApercuBureau } from '../coquille';
import { construireMonde } from '../../../src/refonte/donnees';
import { instantParis } from '../../../src/refonte/donnees/outils';
import { depuisMonde } from '../../../src/refonte/contacts/sources/depuisMonde';
import { VueFournisseurs, type ActionsFournisseurs } from '../../../src/refonte/contacts/fournisseurs/VueFournisseurs';
import { modeleFournisseurs } from '../../../src/refonte/contacts/fournisseurs/modele';

const monde = construireMonde({ maintenant: instantParis('2026-10-30', '10:42') });
const modele = modeleFournisseurs(depuisMonde(monde));

const rien = () => undefined;
const ACTIONS: ActionsFournisseurs = { tous: rien, choisirBesoin: rien, urgence: rien, commander: rien, demanderDevis: rien, preparerDemande: rien, plusTard: rien, reessayer: rien };

export default function Apercu() {
  return (
    <ApercuBureau famille="contacts" sousPage="fournisseurs" fil={['Mes contacts et clients', 'Fournisseurs']} ajmani="Demande « qui livre le plus vite des bornes Wi-Fi ? » ou compare un autre besoin">
      <VueFournisseurs statut="pret" modele={modele} actions={ACTIONS} />
    </ApercuBureau>
  );
}

/**
 * APERÇU « F10 » — Mes contacts et clients, vue d'ensemble (LOT-02), tel que sur l'image : vendredi 30 oct. 2026, 10:42.
 *
 *   npm run apercu -- F10
 *
 * Rendue par les VRAIS composants de l'écran (`VueHub`, la vue de présentation sans accès aux données) sur le modèle
 * `modeleHub` calculé depuis les jeux FICTIFS de SIM (`src/refonte/donnees/`) : rien n'est écrit à la main, ni nom, ni
 * montant. Les chiffres diffèrent donc de ceux de la maquette (ce sont ceux du jeu) ; c'est la disposition qui se compare.
 */
import React from 'react';
import { ApercuBureau } from '../coquille';
import { construireMonde } from '../../../src/refonte/donnees';
import { instantParis } from '../../../src/refonte/donnees/outils';
import { depuisMonde } from '../../../src/refonte/contacts/sources/depuisMonde';
import { VueHub, type ActionsHub } from '../../../src/refonte/contacts/hub/VueHub';
import { modeleHub } from '../../../src/refonte/contacts/hub/modele';

const monde = construireMonde({ maintenant: instantParis('2026-10-30', '10:42') });
const modele = modeleHub(depuisMonde(monde));

const rien = () => undefined;
const ACTIONS: ActionsHub = { nouveauClient: rien, personnaliser: rien, ouvrirClient: rien, preparerAppel: rien, plusTard: rien, ouvrirAttente: rien, ouvrirRdv: rien, reessayer: rien };

export default function Apercu() {
  return (
    <ApercuBureau famille="contacts" sousPage="ensemble" fil={['Mes contacts et clients', 'Vue d’ensemble']} ajmani="Demande à Ajmani : « Quels clients n’ont rien commandé depuis 30 jours ? »">
      <VueHub statut="pret" modele={modele} actions={ACTIONS} versTousLesModules="/tous-les-modules" />
    </ApercuBureau>
  );
}

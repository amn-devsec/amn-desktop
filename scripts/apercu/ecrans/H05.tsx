/**
 * APERÇU « H05 » — Clients (LOT-02), tel que sur l'image : vendredi 30 oct. 2026, 10:42.
 *
 *   npm run apercu -- H05
 *
 * Rendue par les VRAIS composants de l'écran (`VueClients`) sur le modèle `modeleClients` calculé depuis les jeux
 * FICTIFS de SIM : rien n'est écrit à la main. Les noms et les montants sont ceux du jeu ; c'est la disposition qui se compare.
 */
import React from 'react';
import { ApercuBureau } from '../coquille';
import { construireMonde } from '../../../src/refonte/donnees';
import { instantParis } from '../../../src/refonte/donnees/outils';
import { depuisMonde } from '../../../src/refonte/contacts/sources/depuisMonde';
import { VueClients, type ActionsClients, type FiltresClients } from '../../../src/refonte/contacts/clients/VueClients';
import { filtrerEtTrier, modeleClients } from '../../../src/refonte/contacts/clients/modele';

const monde = construireMonde({ maintenant: instantParis('2026-10-30', '10:42') });
const modele = modeleClients(depuisMonde(monde));
const FILTRES: FiltresClients = { segment: 'tous', recherche: '', responsables: new Set(), tri: 'aTraiter', affichage: 'mosaique', page: 0 };
const visibles = filtrerEtTrier(modele, FILTRES);

const rien = () => undefined;
const ACTIONS: ActionsClients = { ouvrir: rien, nouveau: rien, importer: rien, changer: rien, effacerFiltres: rien, reessayer: rien };

export default function Apercu() {
  return (
    <ApercuBureau famille="contacts" sousPage="clients" fil={['Mes contacts et clients', 'Clients']} ajmani="Demande à Ajmani : « Quels clients dois-je relancer cette semaine ? »">
      <VueClients statut="pret" modele={modele} visibles={visibles} filtres={FILTRES} actions={ACTIONS} prenom="Aaron" salutation="bonjour" />
    </ApercuBureau>
  );
}

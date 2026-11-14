/**
 * APERÇU « MC06 » — Rendez-vous clients (LOT-02), tel que sur l'image : vendredi 30 oct. 2026, 10:42.
 *
 *   npm run apercu -- MC06
 *
 * Rendue par les VRAIS composants de l'écran (`VueRdv`) sur le modèle `modeleJournee` calculé depuis les rendez-vous FICTIFS
 * de SIM. L'application n'a pas de service d'itinéraire : l'aperçu fournit des durées de trajet fabriquées (déterministes) pour
 * dessiner la bande de route comme la fiche ; elles n'existent QUE ici. Les noms et les heures sont ceux du jeu.
 */
import React from 'react';
import { ApercuBureau } from '../coquille';
import { construireMonde } from '../../../src/refonte/donnees';
import { instantParis } from '../../../src/refonte/donnees/outils';
import { depuisMonde } from '../../../src/refonte/contacts/sources/depuisMonde';
import { VueRdv, type ActionsRdv } from '../../../src/refonte/contacts/rdv/VueRdv';
import { modeleJournee } from '../../../src/refonte/contacts/rdv/modele';
import { duJour, estRendezVousClient } from '../../../src/refonte/contacts/rendezvous';

const monde = construireMonde({ maintenant: instantParis('2026-10-30', '10:42') });
const src = depuisMonde(monde);
const duJourClients = duJour(src.evenements.filter(estRendezVousClient), src.aujourdhui);
const durees = Object.fromEntries(duJourClients.map((e, i) => [e.id, [15, 35, 20, 10][i % 4]]));
const modele = modeleJournee(src, { durees, retourMin: 10 });

const rien = () => undefined;
const ACTIONS: ActionsRdv = { nouveau: rien, lien: rien, jour: rien, ouvrir: rien, ouvrirAgenda: rien, reessayer: rien };

export default function Apercu() {
  return (
    <ApercuBureau famille="contacts" sousPage="rdv" fil={['Mes contacts et clients', 'Rendez-vous clients']} ajmani="Demande à Ajmani, ou dis ce que tu veux faire">
      <VueRdv statut="pret" modele={modele} actions={ACTIONS} />
    </ApercuBureau>
  );
}

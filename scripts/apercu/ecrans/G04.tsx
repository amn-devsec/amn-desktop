/**
 * APERÇU « G04 » — Fiche client (LOT-02), tel que sur l'image : vendredi 30 oct. 2026, 10:42.
 *
 *   npm run apercu -- G04
 *
 * Rendue par les VRAIS composants de l'écran (`VueFiche`) sur le modèle `modeleFiche` calculé depuis les jeux FICTIFS de
 * SIM, pour le client le plus ancien et le mieux fourni en factures et en devis. Rien n'est écrit à la main.
 */
import React from 'react';
import { ApercuBureau } from '../coquille';
import { construireMonde } from '../../../src/refonte/donnees';
import { instantParis } from '../../../src/refonte/donnees/outils';
import { depuisMonde } from '../../../src/refonte/contacts/sources/depuisMonde';
import { VueFiche, type ActionsFiche } from '../../../src/refonte/contacts/fiche/VueFiche';
import { modeleFiche } from '../../../src/refonte/contacts/fiche/modele';

const monde = construireMonde({ maintenant: instantParis('2026-10-30', '10:42') });
const src = depuisMonde(monde);
const riche = [...src.clients].sort((a, b) => src.factures.filter((f) => f.clientId === b.id).length - src.factures.filter((f) => f.clientId === a.id).length)[0];
const modele = modeleFiche(src, riche.id);

const rien = () => undefined;
const ACTIONS: ActionsFiche = { ecrire: rien, devis: rien, facture: rien, ouvrirElement: rien, preparer: rien, relancer: rien, envoyer: rien, voirGarde: rien, mettreSousGarde: rien, ajouterInterlocuteur: rien, ouvrirInterlocuteur: rien, modifier: rien, retour: rien, reessayer: rien, copier: rien };
const principal = src.interlocuteurs?.find((i) => i.organisationType === 'client' && i.organisationId === String(riche.id));

export default function Apercu() {
  return (
    <ApercuBureau famille="contacts" sousPage="clients" fil={['Mes contacts et clients', 'Clients', modele?.nom ?? '']} ajmani="Demande à Ajmani : « Résume ce client en 5 lignes »">
      <VueFiche statut="pret" modele={modele} actions={ACTIONS} destinataire={principal ? principal.prenom : null} />
    </ApercuBureau>
  );
}

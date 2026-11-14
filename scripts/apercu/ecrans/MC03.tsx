/**
 * APERÇU « MC03 » — Fiches contacts (LOT-02), tel que sur l'image : vendredi 30 oct. 2026, 10:42.
 *
 *   npm run apercu -- MC03
 *
 * Rendue par les VRAIS composants de l'écran (`VueContacts`) sur le modèle `modeleContacts` calculé depuis les
 * interlocuteurs FICTIFS de SIM (l'application n'en a pas : la page dit « non disponible » tant qu'ils n'existent pas).
 * Les noms et les chiffres sont ceux du jeu ; c'est la disposition qui se compare.
 */
import React from 'react';
import { ApercuBureau } from '../coquille';
import { construireMonde } from '../../../src/refonte/donnees';
import { instantParis } from '../../../src/refonte/donnees/outils';
import { depuisMonde } from '../../../src/refonte/contacts/sources/depuisMonde';
import { VueContacts, type ActionsContacts } from '../../../src/refonte/contacts/personnes/VueContacts';
import { modeleContacts } from '../../../src/refonte/contacts/personnes/modele';

const monde = construireMonde({ maintenant: instantParis('2026-10-30', '10:42') });
const src = depuisMonde(monde);
const modele = modeleContacts(src);

const rien = () => undefined;
const ACTIONS: ActionsContacts = { nouveau: rien, importer: rien, choisir: rien, filtre: rien, recherche: rien, ecrire: rien, appeler: rien, ouvrirClient: rien, preparer: rien, non: rien, reessayer: rien };

export default function Apercu() {
  return (
    <ApercuBureau famille="contacts" sousPage="contacts" fil={['Mes contacts et clients', 'Fiches contacts']} ajmani="Cherche une personne, une entreprise ou une conversation">
      <VueContacts statut="pret" modele={modele} selectionId={modele.profil?.id ?? null} filtre="tous" recherche="" actions={ACTIONS} aujourdhui={src.aujourdhui} />
    </ApercuBureau>
  );
}

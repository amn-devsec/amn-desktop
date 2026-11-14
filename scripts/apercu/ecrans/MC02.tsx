/**
 * APERÇU « MC02 » — Fidélité, l'échelle des paliers (LOT-02), tel que sur l'image : vendredi 30 oct. 2026, 10:42.
 *
 *   npm run apercu -- MC02
 *
 * Rendue par les VRAIS composants de l'écran (`VueFidelite`) sur le modèle `modeleFidelite` calculé depuis les comptes de
 * fidélité FICTIFS de SIM : rien n'est écrit à la main. Les noms et les points sont ceux du jeu ; c'est la disposition qui se compare.
 */
import React from 'react';
import { ApercuBureau } from '../coquille';
import { construireMonde } from '../../../src/refonte/donnees';
import { instantParis } from '../../../src/refonte/donnees/outils';
import { depuisMonde } from '../../../src/refonte/contacts/sources/depuisMonde';
import { VueFidelite, type ActionsFidelite } from '../../../src/refonte/contacts/fidelite/VueFidelite';
import { modeleFidelite } from '../../../src/refonte/contacts/fidelite/modele';

const monde = construireMonde({ maintenant: instantParis('2026-10-30', '10:42') });
const src = depuisMonde(monde);
const modele = modeleFidelite(src);

const rien = () => undefined;
const ACTIONS: ActionsFidelite = { regles: rien, offrir: rien, ouvrirClient: rien, cocher: rien, preparer: rien, nonMerci: rien, reessayer: rien };

export default function Apercu() {
  return (
    <ApercuBureau famille="contacts" sousPage="fidelite" fil={['Mes contacts et clients', 'Fidélité']} ajmani="Demande « qui est proche de l’Or ? » ou dis ce que tu veux faire">
      <VueFidelite statut="pret" modele={modele} faits={new Set(modele.gestes.slice(2, 3).map((g) => g.cle))} actions={ACTIONS} aujourdhui={src.aujourdhui} />
    </ApercuBureau>
  );
}

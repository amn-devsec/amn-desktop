/**
 * APERÇU « MC05 » — Partenaires (LOT-02), tel que sur l'image : vendredi 30 oct. 2026, 10:42.
 *
 *   npm run apercu -- MC05
 *
 * Rendue par les VRAIS composants de l'écran (`VuePartenaires`) sur le modèle `modeleReseau` calculé depuis les partenaires
 * FICTIFS de SIM (l'application n'en a pas : la page dit « non disponible » tant que la collection n'existe pas). Les noms et
 * les chiffres sont ceux du jeu ; c'est la disposition qui se compare.
 */
import React from 'react';
import { ApercuBureau } from '../coquille';
import { construireMonde } from '../../../src/refonte/donnees';
import { instantParis } from '../../../src/refonte/donnees/outils';
import { depuisMonde } from '../../../src/refonte/contacts/sources/depuisMonde';
import { VuePartenaires, type ActionsPartenaires } from '../../../src/refonte/contacts/partenaires/VuePartenaires';
import { modeleReseau } from '../../../src/refonte/contacts/partenaires/modele';

const monde = construireMonde({ maintenant: instantParis('2026-10-30', '10:42') });
const modele = modeleReseau(depuisMonde(monde));

const rien = () => undefined;
const ACTIONS: ActionsPartenaires = { ajouter: rien, inviter: rien, ecrire: rien, voirAcces: rien, comparer: rien, plusTard: rien, ouvrirFournisseurs: rien, reessayer: rien };
const choisi = modele ? [...modele.noeuds].sort((a, b) => b.force - a.force)[0]?.id ?? null : null;

export default function Apercu() {
  return (
    <ApercuBureau famille="contacts" sousPage="partenaires" fil={['Mes contacts et clients', 'Partenaires']} ajmani="Demande « qui m’a envoyé des clients cette année ? » ou écris à un partenaire">
      <VuePartenaires statut="pret" modele={modele} actions={ACTIONS} selectionInitiale={choisi} />
    </ApercuBureau>
  );
}

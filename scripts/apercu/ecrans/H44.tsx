/**
 * APERÇU « H44 » — Retours clients (LOT-02), tel que sur l'image : vendredi 30 oct. 2026, 10:42.
 *
 *   npm run apercu -- H44
 *
 * Rendue par les VRAIS composants de l'écran (`VueRetours`) sur le modèle `modeleRetours` calculé depuis les avis FICTIFS
 * de SIM : rien n'est écrit à la main. Les citations et les chiffres sont ceux du jeu ; c'est la disposition qui se compare.
 */
import React from 'react';
import { ApercuBureau } from '../coquille';
import { construireMonde } from '../../../src/refonte/donnees';
import { instantParis } from '../../../src/refonte/donnees/outils';
import { depuisMonde } from '../../../src/refonte/contacts/sources/depuisMonde';
import { VueRetours, type ActionsRetours } from '../../../src/refonte/contacts/retours/VueRetours';
import { modeleRetours } from '../../../src/refonte/contacts/retours/modele';
import { ajouterJours } from '../../../src/refonte/contacts/commun';

const monde = construireMonde({ maintenant: instantParis('2026-10-30', '10:42') });
const base = depuisMonde(monde);
// L'image montre un avis à répondre : le jeu n'en a pas à cette date, on en ajoute UN (3 étoiles, il y a 9 jours) pour dessiner la carte.
const modele0 = base.avis[0];
const src = { ...base, avis: [...base.avis, { ...modele0, id: 'avis-apercu', noteSur5: 3, recommandation: 6, sentiment: 'neutre' as const, date: ajouterJours(base.aujourdhui, -9), themes: ['Délais'], texte: 'Un retard sur la dernière intervention, mais bien géré. J’aurais aimé être prévenue plus tôt.' }] };
const modele = modeleRetours(src);

const rien = () => undefined;
const ACTIONS: ActionsRetours = { exporter: rien, demander: rien, repondre: rien, ouvrir: rien, reessayer: rien };

export default function Apercu() {
  return (
    <ApercuBureau famille="contacts" sousPage="retours" fil={['Mes contacts et clients', 'Retours clients']} ajmani="Demande « que reprochent-ils le plus ? » ou réponds à un avis">
      <VueRetours statut="pret" modele={modele} actions={ACTIONS} aujourdhui={src.aujourdhui} />
    </ApercuBureau>
  );
}

/**
 * APERÇU « MC04 » — Équipe (LOT-02), tel que sur l'image : vendredi 30 oct. 2026, 10:42.
 *
 *   npm run apercu -- MC04
 *
 * Rendue par les VRAIS composants de l'écran (`VueEquipe`) sur le modèle `modeleEquipe` calculé depuis l'équipe, les
 * tâches et les rendez-vous FICTIFS de SIM : rien n'est écrit à la main. La charge vient des tâches échues et des
 * rendez-vous du jeu ; les noms et les heures sont ceux du jeu, c'est la disposition qui se compare.
 */
import React from 'react';
import { ApercuBureau } from '../coquille';
import { construireMonde } from '../../../src/refonte/donnees';
import { instantParis } from '../../../src/refonte/donnees/outils';
import { depuisMonde } from '../../../src/refonte/contacts/sources/depuisMonde';
import { VueEquipe, type ActionsEquipe } from '../../../src/refonte/contacts/equipe/VueEquipe';
import { modeleEquipe } from '../../../src/refonte/contacts/equipe/modele';

const monde = construireMonde({ maintenant: instantParis('2026-10-30', '10:42') });
const src = depuisMonde(monde);
const modele = modeleEquipe({ ...src, equipe: src.equipe.slice(0, 3) });

const rien = () => undefined;
const ACTIONS: ActionsEquipe = { inviter: rien, organigramme: rien, message: rien, confier: rien, membresEtAcces: rien, proposer: rien, non: rien, relier: rien, reessayer: rien };

export default function Apercu() {
  return (
    <ApercuBureau famille="contacts" sousPage="equipe" fil={['Mes contacts et clients', 'Équipe']} ajmani="Demande à Ajmani, ou dis ce que tu veux faire">
      <VueEquipe statut="pret" modele={modele} actions={ACTIONS} />
    </ApercuBureau>
  );
}

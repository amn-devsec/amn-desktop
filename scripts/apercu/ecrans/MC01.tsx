/**
 * APERÇU « MC01 » — Pipeline commercial (LOT-02), tel que sur l'image : vendredi 30 oct. 2026, 10:42.
 *
 *   npm run apercu -- MC01
 *
 * Rendue par les VRAIS composants de l'écran (`VuePipeline`) sur le modèle `modeleEntonnoir` calculé depuis les prospects
 * FICTIFS de SIM. L'application ne garde ni l'historique des mouvements (taux de passage) ni l'objectif du mois : l'aperçu
 * fournit un historique fabriqué (déterministe) et un objectif de 8 000 €, pour dessiner la surface comme la fiche ;
 * ils n'existent QUE ici. Les noms et les montants sont ceux du jeu ; c'est la disposition qui se compare.
 */
import React from 'react';
import { ApercuBureau } from '../coquille';
import { construireMonde } from '../../../src/refonte/donnees';
import { instantParis } from '../../../src/refonte/donnees/outils';
import { depuisMonde } from '../../../src/refonte/contacts/sources/depuisMonde';
import { VuePipeline, type ActionsPipeline } from '../../../src/refonte/contacts/pipeline/VuePipeline';
import { modeleEntonnoir } from '../../../src/refonte/contacts/pipeline/modele';
import type { MouvementEtape } from '../../../src/refonte/contacts/pipeline';

const monde = construireMonde({ maintenant: instantParis('2026-10-30', '10:42') });
const src = depuisMonde(monde);

/** Historique d'aperçu : chaque prospect est entré dans Nouveau ; deux sur trois passent à Rendez-vous, un sur deux à Devis, un sur trois signe. */
const mouvements: MouvementEtape[] = src.prospects.flatMap((p, i) => [
  { prospectId: p.id, vers: 'nouveau' as const, le: '2026-09-20' },
  ...(i % 3 !== 0 ? [{ prospectId: p.id, vers: 'rendez-vous' as const, le: '2026-10-02' }] : []),
  ...(i % 2 === 0 ? [{ prospectId: p.id, vers: 'devis envoyé' as const, le: '2026-10-12' }] : []),
  ...(i % 3 === 0 ? [{ prospectId: p.id, vers: 'gagné' as const, le: '2026-10-20' }] : []),
]);
const modele = modeleEntonnoir(src, { mouvements, objectifCents: 800_000, periode: 'mois' });

const rien = () => undefined;
const ACTIONS: ActionsPipeline = { nouvelle: rien, importer: rien, periode: rien, deplacer: rien, definirObjectif: rien, voirMessage: rien, plusTard: rien, reessayer: rien };

export default function Apercu() {
  return (
    <ApercuBureau famille="contacts" sousPage="pipeline" fil={['Mes contacts et clients', 'Pipeline commercial']} ajmani="Demande à Ajmani, ou dis ce que tu veux faire">
      <VuePipeline statut="pret" modele={modele} actions={ACTIONS} aujourdhui={src.aujourdhui} selectionInitiale={modele.etapes[2].pastilles[0]?.id ?? null} />
    </ApercuBureau>
  );
}

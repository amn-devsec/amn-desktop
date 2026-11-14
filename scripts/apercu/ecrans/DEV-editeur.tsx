/**
 * APERÇU « DEV-editeur » — Développement, Éditeur de flux (v4). Le jeu de SIM n'a pas de règle au format des flux :
 * l'aperçu pose ici UNE règle fictive, celle que décrit la fiche (Quand un courriel arrive, Si il parle de devis,
 * Alors trois actions, Sinon le classer), au format étendu de S9 (`src/refonte/connecteurs`). Rien n'est enregistré.
 *
 *   npm run apercu -- DEV-editeur
 */
import React from 'react';
import { EditeurDev } from '../../../src/refonte/developpement/EditeurDeFlux';
import type { AutomationEtendue } from '../../../src/refonte/connecteurs/automatisations';
import { ApercuDev, DONNEES } from '../developpement';

const REGLE = {
  id: 'apercu-flux-1',
  trigger: 'flux',
  action: 'task',
  enabled: true,
  assigneeEmail: 'essai@exemple.test',
  createdAt: '2026-10-01T08:00:00.000Z',
  updatedAt: '2026-10-01T08:00:00.000Z',
  flux: {
    format: 2,
    nom: 'Demande de devis par courriel',
    etat: 'actif',
    quand: { id: 'q', mode: 'local', type: 'courriel-recu', parametres: { boite: 'contact@' } },
    si: { id: 's', mode: 'local', type: 'contient-mots', parametres: { mots: ['devis', 'tarif', 'prix'] } },
    alors: [
      { id: 'a1', mode: 'local', type: 'creer-contact', parametres: {} },
      { id: 'a2', mode: 'local', type: 'repondre-modele', parametres: { modeleId: 'Devis, accusé de réception' } },
      { id: 'a3', mode: 'local', type: 'creer-tache', parametres: { titre: 'Chiffrer la mission', echeanceJours: 1 } },
    ],
    sinon: [{ id: 'n1', mode: 'local', type: 'classer', parametres: { dossier: 'À lire' } }],
  },
} as unknown as AutomationEtendue & { id: string };

export default function Apercu() {
  return (
    <ApercuDev sousPage="editeur" titre="Éditeur de flux">
      <EditeurDev d={DONNEES} regles={[REGLE]} sauver={async () => undefined} />
    </ApercuDev>
  );
}

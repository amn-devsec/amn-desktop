/**
 * APERÇU « H03 » — Missions et tickets (LOT-01), tel que sur l'image : vendredi 30 oct. 2026, 10:42, la carte H-113 en cours de glisser
 * vers « Terminé ».
 *
 *   npm run apercu -- H03
 *
 * Rendue par les VRAIS composants de l'écran (`VueMissions`) sur le modèle `modeleMissions`. Les tickets sont FABRIQUÉS ICI d'après le
 * tableau de la fiche H03 (identifiants, titres, noms fictifs) : le jeu de SIM n'a ni délais, ni limites, ni présence. L'état de glisser est
 * dessiné d'avance (props `glisse`). Rien de tout cela n'existe dans l'application.
 */
import React from 'react';
import { ApercuBureau } from '../coquille';
import { instantParis } from '../../../src/refonte/donnees/outils';
import { VueMissions, type ActionsMissions } from '../../../src/refonte/journee/missions/VueMissions';
import { modeleMissions, type TicketMission } from '../../../src/refonte/journee/missions/modele';

const maintenant = instantParis('2026-10-30', '10:42');
const at = (jour: string, h: string): string => new Date(instantParis(jour, h)).toISOString();
const t = (id: string, titre: string, colonne: TicketMission['colonne'], o: Partial<TicketMission> = {}): TicketMission => ({
  id, titre, colonne, urgent: false, client: null, etiquette: '', sousTaches: null, assigne: null, echeance: null, termineLe: null, commentaires: 0, partageClient: false, ordre: 0, creeAt: at('2026-10-27', '09:00'), priseEnChargeAt: null, entreeColonneAt: null, ...o,
});
const tickets: TicketMission[] = [
  t('H-121', 'Paiements Stripe refusés pour 3 clients', 'a-faire', { urgent: true, client: 'Medina', etiquette: 'Facturation', assigne: { nom: 'Mohamed' }, echeance: '2026-10-30', commentaires: 4, partageClient: true, creeAt: at('2026-10-30', '10:24'), ordre: 0 }),
  t('H-119', 'Export CSV des factures', 'a-faire', { client: 'Menna', etiquette: 'Argent', assigne: { nom: 'Riyad' }, echeance: '2026-11-03', commentaires: 1, partageClient: true, creeAt: at('2026-10-29', '16:00'), priseEnChargeAt: at('2026-10-29', '16:26'), ordre: 1 }),
  t('H-116', 'Texte de la page d’accueil', 'a-faire', { client: 'Menna', etiquette: 'Contenu', assigne: { nom: 'Amina' }, echeance: '2026-11-04', partageClient: true, creeAt: at('2026-10-29', '16:30'), priseEnChargeAt: at('2026-10-29', '16:52'), ordre: 2 }),
  t('H-115', 'Relire les mentions légales', 'a-faire', { etiquette: 'Contenu', ordre: 3 }),
  t('H-118', 'Données utilisateurs absentes du tableau de bord', 'en-cours', { urgent: true, client: 'Menna', sousTaches: { faites: 2, total: 5 }, assigne: { nom: 'Mohamed', enLigne: true }, echeance: '2026-10-30', commentaires: 6, partageClient: true, creeAt: at('2026-10-30', '08:30'), priseEnChargeAt: at('2026-10-30', '08:48'), ordre: 0 }),
  t('H-114', 'Refonte de la facture PDF', 'en-cours', { etiquette: 'Argent', sousTaches: { faites: 3, total: 4 }, assigne: { nom: 'Amina' }, echeance: '2026-11-05', commentaires: 2, ordre: 1 }),
  t('H-112', 'Connecteur Stripe par clé API', 'en-cours', { etiquette: 'Connecteurs', sousTaches: { faites: 1, total: 3 }, assigne: { nom: 'Mohamed' }, echeance: '2026-11-06', ordre: 2 }),
  t('H-113', 'Page de connexion, version mobile', 'en-revue', { etiquette: 'Design', assigne: { nom: 'Riyad' }, echeance: '2026-10-31', commentaires: 3, entreeColonneAt: at('2026-10-30', '09:00'), ordre: 0 }),
  t('H-110', 'Rappel automatique des impayés', 'en-revue', { etiquette: 'Automatisation', assigne: { nom: 'Mohamed' }, echeance: '2026-10-31', relecteur: 'Aaron', commentaires: 2, entreeColonneAt: at('2026-10-29', '15:00'), ordre: 1 }),
  t('H-111', 'Modèle de devis 2027', 'en-revue', { etiquette: 'Argent', assigne: { nom: 'Amina' }, echeance: '2026-11-02', commentaires: 1, entreeColonneAt: at('2026-10-28', '10:00'), ordre: 2 }),
  t('H-109', 'Sauvegarde nocturne chiffrée', 'termine', { assigne: { nom: 'Mohamed' }, termineLe: '2026-10-27', ordre: 0 }),
  t('H-107', 'Page Clients, vues enregistrées', 'termine', { assigne: { nom: 'Riyad' }, termineLe: '2026-10-26', ordre: 1 }),
  t('H-104', 'Étiquettes des tickets', 'termine', { assigne: { nom: 'Amina' }, termineLe: '2026-10-26', ordre: 2 }),
  t('H-105', 'Filtre des tickets urgents', 'termine', { assigne: { nom: 'Riyad' }, termineLe: '2026-10-26', ordre: 3 }),
  t('H-106', 'Export des tickets', 'termine', { assigne: { nom: 'Mohamed' }, termineLe: '2026-10-26', ordre: 4 }),
  t('H-108', 'Colonnes de couleur', 'termine', { assigne: { nom: 'Amina' }, termineLe: '2026-10-26', ordre: 5 }),
];
const modele = modeleMissions({ tickets, maintenant, presence: { nom: 'Mohamed', ticket: 'H-118' } });

const rien = () => undefined;
const ACTIONS: ActionsMissions = { vue: rien, nouveau: rien, ouvrir: rien, filtre: rien, deposer: rien, plus: rien, ajouter: rien, alerte: rien, reessayer: rien };

export default function Apercu() {
  return (
    <ApercuBureau famille="jour" sousPage="missions" fil={['Ma journée', 'Missions et tickets']} ajmani="Demande à Ajmani, ou dis ce que tu veux faire">
      <VueMissions statut="pret" modele={modele} vue="kanban" filtre={null} alerte tickets={tickets} actions={ACTIONS} glisse={{ id: 'H-113', vers: 'termine', flottant: { x: 701, y: 56 } }} />
    </ApercuBureau>
  );
}

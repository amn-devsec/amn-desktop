/**
 * APERÇU « MJ03 » — Planning de l'équipe (LOT-01), tel que sur l'image : vendredi 30 oct. 2026, 10:42, semaine du 26 au 30 octobre.
 *
 *   npm run apercu -- MJ03
 *
 * Rendue par les VRAIS composants de l'écran (`VuePlanning`) sur le modèle `modelePlanning`. Les trois personnes et leurs créneaux sont
 * FABRIQUÉS ICI d'après la liste de la fiche MJ03 (30 h, 27 h 15 et 19 h 15 sur 35 h ; 76 h 30 sur 105 h) : le jeu de SIM n'a pas ces créneaux.
 * Rien de tout cela n'existe dans l'application.
 */
import React from 'react';
import { ApercuBureau } from '../coquille';
import { instantParis } from '../../../src/refonte/donnees/outils';
import { VuePlanning, type ActionsPlanning } from '../../../src/refonte/journee/planning/VuePlanning';
import { modelePlanning, type CategorieCreneau, type CreneauPlanning } from '../../../src/refonte/journee/planning/modele';

const maintenant = instantParis('2026-10-30', '10:42');
const J = { lun: '2026-10-26', mar: '2026-10-27', mer: '2026-10-28', jeu: '2026-10-29', ven: '2026-10-30' };
let n = 0;
const c = (p: string, jour: string, debut: string, fin: string, titre: string, categorie: CategorieCreneau, titreLong?: string): CreneauPlanning => ({ id: `c${(n += 1)}`, jour, debut, fin, titre, categorie, personnes: [p], titreLong });
const creneaux: CreneauPlanning[] = [
  // Aaron
  c('aaron', J.lun, '09:00', '09:45', 'Équipe', 'interne'), c('aaron', J.lun, '10:00', '12:30', 'Maquettes Menna', 'interne'), c('aaron', J.lun, '14:00', '15:30', 'Atelier Menna', 'client'), c('aaron', J.lun, '16:00', '18:00', 'Audit Roux, rapport', 'securite'),
  c('aaron', J.mar, '09:00', '10:00', 'Veille', 'securite'), c('aaron', J.mar, '10:00', '11:00', 'Appel Medina', 'client'), c('aaron', J.mar, '11:15', '12:45', 'Intégration site', 'interne'), c('aaron', J.mar, '13:30', '15:00', 'Intégration site', 'interne'), c('aaron', J.mar, '15:00', '16:00', 'Devis', 'argent'),
  c('aaron', J.mer, '09:00', '12:00', 'Chantier Dupont', 'client'), c('aaron', J.mer, '14:00', '17:00', 'Intégration du site Menna', 'interne'),
  c('aaron', J.jeu, '09:00', '11:00', 'Rapport Roux', 'securite'), c('aaron', J.jeu, '11:00', '12:00', 'Démo client', 'client'), c('aaron', J.jeu, '14:00', '16:00', 'Recette du site', 'interne'), c('aaron', J.jeu, '16:00', '17:00', 'Sécurité', 'securite'),
  c('aaron', J.ven, '09:45', '11:00', 'Préparer le RDV', 'client'), c('aaron', J.ven, '11:00', '12:00', 'RDV Menna', 'client', 'Rendez-vous Menna'), c('aaron', J.ven, '14:00', '16:00', 'Livraison du site', 'interne'), c('aaron', J.ven, '16:00', '17:00', 'Bilan', 'interne'),
  // Mohamed
  c('mohamed', J.lun, '09:00', '09:45', 'Équipe', 'interne'), c('mohamed', J.lun, '10:00', '12:30', 'Tableau de bord, données', 'interne'), c('mohamed', J.lun, '14:00', '16:00', 'Devis Boulangerie Léo', 'argent'), c('mohamed', J.lun, '16:00', '17:00', 'Factures', 'argent'),
  c('mohamed', J.mar, '09:00', '12:00', 'Brancher Stripe', 'interne'), c('mohamed', J.mar, '13:30', '15:00', 'Factures', 'argent'), c('mohamed', J.mar, '15:00', '16:00', 'Devis', 'argent'),
  c('mohamed', J.mer, '09:30', '11:30', 'Contrat 2027, relecture', 'argent'), c('mohamed', J.mer, '14:00', '15:00', 'Relances', 'argent'), c('mohamed', J.mer, '15:30', '17:30', 'Stock et achats', 'argent'),
  c('mohamed', J.jeu, '09:00', '11:00', 'Tableau de bord', 'interne'), c('mohamed', J.jeu, '11:00', '12:00', 'Démo client', 'client'), c('mohamed', J.jeu, '14:00', '17:00', 'Brancher Stripe', 'interne'),
  c('mohamed', J.ven, '10:00', '12:00', 'Stripe, tests', 'interne'), c('mohamed', J.ven, '14:00', '15:30', 'Facturation du mois', 'argent'), c('mohamed', J.ven, '16:00', '17:00', 'Bilan', 'interne'),
  // Riyad
  c('riyad', J.lun, '09:00', '09:45', 'Équipe', 'interne'), c('riyad', J.lun, '10:00', '12:00', 'Chantier Dupont', 'client'), c('riyad', J.lun, '14:00', '17:00', 'Visites de prospects', 'client'),
  c('riyad', J.mar, '09:00', '11:00', 'Formation sécurité', 'securite'), c('riyad', J.mar, '11:00', '12:30', 'Support Parc Sud', 'client'), c('riyad', J.mar, '14:00', '15:00', 'Ronde Léo', 'securite'),
  c('riyad', J.mer, '09:00', '12:00', 'Chantier Dupont', 'client'), c('riyad', J.mer, '14:00', '16:00', 'Prospection', 'client'),
  c('riyad', J.jeu, '09:00', '11:00', 'Support clients', 'client'), c('riyad', J.jeu, '16:00', '17:00', 'Sécurité', 'securite'),
  c('riyad', J.ven, '16:00', '17:00', 'Bilan', 'interne'),
];
const modele = modelePlanning({
  personnes: [
    { id: 'aaron', nom: 'Aaron', role: 'sécurité et sites', enLigne: true, moi: true, disponibiliteH: 35 },
    { id: 'mohamed', nom: 'Mohamed', role: 'argent et outils', enLigne: true, moi: false, disponibiliteH: 35 },
    { id: 'riyad', nom: 'Riyad', role: 'clients et terrain', enLigne: true, moi: false, disponibiliteH: 35 },
  ],
  creneaux,
  maintenant,
});
const rien = () => undefined;
const ACTIONS: ActionsPlanning = { dupliquer: rien, ajouter: rien, semaine: rien, ouvrir: rien, proposer: rien, non: rien, reessayer: rien };

export default function Apercu() {
  return (
    <ApercuBureau famille="jour" sousPage="planning" fil={['Ma journée', 'Planning']} ajmani="Demande à Ajmani, ou dis ce que tu veux faire">
      <VuePlanning statut="pret" modele={modele} semaine="cette" actions={ACTIONS} />
    </ApercuBureau>
  );
}

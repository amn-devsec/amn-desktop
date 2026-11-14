/**
 * APERÇU « H01 » — Calendrier (LOT-01), tel que sur l'image : vendredi 30 oct. 2026, 10:42, semaine du 26 octobre.
 *
 *   npm run apercu -- H01
 *
 * Rendue par les VRAIS composants de l'écran (`VueCalendrier`) sur le modèle `modeleSemaine`. Les événements sont FABRIQUÉS ICI, d'après le
 * tableau de la fiche H01 (noms, lieux et heures fictifs) : le jeu de SIM n'a que douze événements cette semaine-là, sans concentration, sans
 * trajet, sans événement sur la journée. Aucune de ces données n'existe dans l'application.
 */
import React from 'react';
import { ApercuBureau } from '../coquille';
import { instantParis } from '../../../src/refonte/donnees/outils';
import { VueCalendrier, type ActionsCalendrier } from '../../../src/refonte/journee/calendrier/VueCalendrier';
import { modeleSemaine, type EvenementGrille, type FamilleBloc, type GenreBloc } from '../../../src/refonte/journee/calendrier/modele';

const maintenant = instantParis('2026-10-30', '10:42');
const iso = (jour: string, h: string): string => new Date(instantParis(jour, h)).toISOString();
const ev = (id: string, jour: string, de: string, a: string, titre: string, famille: FamilleBloc, genre: GenreBloc = 'normal', detail = '', extra: Partial<EvenementGrille> = {}): EvenementGrille => ({
  id, titre, startAt: iso(jour, de), endAt: iso(jour, a), famille, genre, detail, ...extra,
});
const evenements: EvenementGrille[] = [
  ev('a1', '2026-10-26', '09:00', '10:00', 'Point d’équipe', 'equipe', 'normal', 'Aaron, Moha…'),
  ev('a2', '2026-10-26', '10:15', '12:00', 'Concentration', 'equipe', 'concentration', 'Devis Dupont'),
  ev('a3', '2026-10-26', '13:30', '14:00', 'Trajet', 'personnel', 'trajet'),
  ev('a4', '2026-10-26', '14:00', '15:30', 'Atelier Menna', 'clients', 'normal', 'Chez Menna, Paris 8e'),
  ev('b1', '2026-10-27', '10:00', '11:00', 'Appel Medina', 'clients', 'normal', 'Accès des c…'),
  ev('b2', '2026-10-27', '13:30', '15:00', 'Concentration', 'equipe', 'concentration', 'Facture PDF'),
  ev('b3', '2026-10-27', '15:00', '16:00', 'Revue des devis', 'argent', 'normal', 'avec Moha…'),
  ev('c1', '2026-10-28', '08:20', '09:00', 'Trajet', 'personnel', 'trajet'),
  ev('c2', '2026-10-28', '09:00', '12:00', 'Chantier Dupont', 'chantiers', 'normal', 'Pose du réseau, 3 p…'),
  ev('c3', '2026-10-28', '14:00', '14:45', 'Relances clients', 'clients'),
  ev('c4', '2026-10-28', '15:00', '17:00', 'Concentration', 'equipe', 'concentration', 'Rapport Cabinet Roux'),
  ev('d1', '2026-10-29', '09:00', '10:30', 'Concentration', 'equipe', 'concentration', 'Connecteur Stripe'),
  ev('d2', '2026-10-29', '10:30', '11:00', 'Trajet', 'personnel', 'trajet'),
  ev('d3', '2026-10-29', '11:00', '12:00', 'Démo client', 'clients', 'normal', 'Cabinet Roux'),
  ev('d4', '2026-10-29', '16:00', '17:00', 'Point sécurité', 'securite', 'normal', 'Rondes de l…'),
  ev('e1', '2026-10-30', '09:30', '09:45', 'Stand-up', 'equipe'),
  ev('e2', '2026-10-30', '11:00', '12:00', 'Rendez-vous Menna', 'clients', 'normal', 'Salle clients', { enLigne: true, lieu: 'salle clients', participants: ['Aaron', 'Amina'] }),
  ev('e3', '2026-10-30', '12:30', '13:30', 'Déjeuner', 'personnel'),
  ev('e4', '2026-10-30', '14:00', '15:00', 'Point facturation', 'argent', 'normal', 'avec Moha…'),
  ev('e5', '2026-10-30', '16:00', '17:00', 'Bilan de la semaine', 'equipe'),
  ev('f1', '2026-10-31', '10:00', '11:30', 'Vélo', 'personnel'),
];
const modele = modeleSemaine({
  evenements,
  maintenant,
  journees: [
    { id: 'j1', titre: 'Audit Cabinet Roux, 3 jours', debut: '2026-10-26', fin: '2026-10-28', famille: 'securite' },
    { id: 'j2', titre: 'Clôture d’octobre', debut: '2026-10-30', fin: '2026-10-30', famille: 'argent' },
  ],
  taches: [{ id: 't1', titre: 'Valider le tableau de bord Menna', echeance: iso('2026-10-30', '17:00') }],
});

const rien = () => undefined;
const ACTIONS: ActionsCalendrier = { vue: rien, precedent: rien, suivant: rien, aujourdhui: rien, nouveau: rien, ouvrir: rien, jour: rien, moisPrecedent: rien, moisSuivant: rien, rejoindre: rien, preparer: rien, bloquer: rien, refuser: rien, reessayer: rien };

export default function Apercu() {
  return (
    <ApercuBureau famille="jour" sousPage="calendrier" fil={['Ma journée', 'Calendrier']} ajmani="Demande à Ajmani, ou dis ce que tu veux faire">
      <VueCalendrier statut="pret" modele={modele} actions={ACTIONS} />
    </ApercuBureau>
  );
}

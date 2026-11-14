/**
 * APERÇU « MJ01 » — Projets (LOT-01), tel que sur l'image : vendredi 30 oct. 2026, 10:42, frise « Trimestre ».
 *
 *   npm run apercu -- MJ01
 *
 * Rendue par les VRAIS composants de l'écran (`VueProjets`) sur le modèle `modeleFeuille`. Les six projets, leurs jalons, les trois tâches de
 * la semaine, le lien proposé et « 12 sur 15 » sont FABRIQUÉS ICI d'après le tableau de la fiche MJ01 : le jeu de SIM n'a ni ces noms ni ces
 * dates. Rien de tout cela n'existe dans l'application.
 */
import React from 'react';
import { ApercuBureau } from '../coquille';
import { instantParis } from '../../../src/refonte/donnees/outils';
import { VueProjets, type ActionsProjets } from '../../../src/refonte/journee/projets/VueProjets';
import { modeleFeuille, type ProjetEntree } from '../../../src/refonte/journee/projets/modele';

const maintenant = instantParis('2026-10-30', '10:42');
const projets: ProjetEntree[] = [
  { id: 'p1', nom: 'Atelier du mardi', icone: 'calendar', membres: ['Amina', 'Riyad'], avancement: 30, debut: '2026-10-19', fin: '2026-11-03', jalons: [{ id: 'j1', titre: 'Invitations', jour: '2026-10-27', fait: false }, { id: 'j2', titre: 'Atelier', jour: '2026-11-03', fait: false }] },
  { id: 'p2', nom: 'Refonte du site Menna', icone: 'globe', membres: ['Amina', 'Mohamed'], avancement: 72, debut: '2026-09-21', fin: '2026-11-04', jalons: [{ id: 'j3', titre: 'Maquettes validées', jour: '2026-10-16', fait: true }, { id: 'j4', titre: 'Livraison', jour: '2026-11-04', fait: false }] },
  { id: 'p3', nom: 'Contrat de maintenance 2027', icone: 'file', membres: ['Amina'], avancement: 90, debut: '2026-10-12', fin: '2026-11-06', jalons: [{ id: 'j5', titre: 'Version 3 relue', jour: '2026-10-23', fait: true }, { id: 'j6', titre: 'Signature client', jour: '2026-11-06', fait: false }] },
  { id: 'p4', nom: 'Tableau de bord client', icone: 'chart', membres: ['Mohamed', 'Riyad'], avancement: 45, debut: '2026-10-19', fin: '2026-11-27', jalons: [{ id: 'j7', titre: 'Stripe branché', jour: '2026-10-30', fait: false }, { id: 'j8', titre: 'Bêta avec Menna', jour: '2026-11-13', fait: false }, { id: 'j9', titre: 'Mise en service', jour: '2026-11-27', fait: false }] },
  { id: 'p5', nom: 'Application mobile', icone: 'phone', membres: ['Mohamed', 'Riyad'], avancement: 0, debut: '2026-11-09', fin: '2026-12-11', jalons: [{ id: 'j10', titre: 'Cadrage des écrans', jour: '2026-11-20', fait: false }, { id: 'j11', titre: 'Maquettes', jour: '2026-12-07', fait: false }] },
  { id: 'p6', nom: 'Audit sécurité Cabinet Roux', icone: 'shield', membres: ['Amina'], avancement: 100, debut: '2026-09-14', fin: '2026-10-23', termineLe: '2026-10-23', jalons: [{ id: 'j12', titre: 'Rapport remis', jour: '2026-10-23', fait: true }] },
];
const modele = modeleFeuille({ projets, aujourdhui: '2026-10-30', maintenant, objectifTermines: 15, lien: { deId: 'p4', versId: 'p5', jour: '2026-11-13' } });
// « 12 sur 15 » : le jeu fabriqué n'a qu'un projet terminé, les onze autres sont ceux du trimestre, hors frise.
modele.terminesTrimestre.n = 12;
const taches = [
  { id: 't1', libelle: 'Valider les maquettes Menna', fait: true, dureeMin: 0 },
  { id: 't2', libelle: 'Brancher Stripe au tableau de bord', fait: false, dureeMin: 60 },
  { id: 't3', libelle: 'Envoyer les invitations de l’atelier', fait: false, dureeMin: 30 },
];
const rien = () => undefined;
const ACTIONS: ActionsProjets = { nouveau: rien, modele: rien, ouvrir: rien, filtre: rien, fenetre: rien, lier: rien, plusTard: rien, cocher: rien, ajouterDates: rien, reessayer: rien };

export default function Apercu() {
  return (
    <ApercuBureau famille="jour" sousPage="projets" fil={['Ma journée', 'Projets']} ajmani="Demande à Ajmani, ou dis ce que tu veux faire">
      <VueProjets statut="pret" modele={modele} filtre="tous" fenetre="trimestre" jourCourt="ven. 30" taches={taches} suggestion={{ a: 'Tableau de bord client', b: 'Application mobile' }} actions={ACTIONS} />
    </ApercuBureau>
  );
}

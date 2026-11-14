/**
 * APERÇU « G08 » — Cockpit d'un client (LOT-01), tel que sur l'image : vendredi 30 oct. 2026, 10:42, « Menna Conseil ».
 *
 *   npm run apercu -- G08
 *
 * Rendue par les VRAIS composants de l'écran (`VueCockpit`) sur le modèle `modeleCockpit`. Toutes les valeurs sont FABRIQUÉES ICI d'après la
 * fiche G08 (revenu 4 820 €, 37 connectés, paiements Stripe, tickets, santé) : l'application ne reçoit aucun agrégat Stripe ou Vercel. Les
 * cartes sont masquées (quatre chiffres), aucune clé ni aucun jeton n'apparaît nulle part.
 */
import React from 'react';
import { ApercuBureau } from '../coquille';
import { instantParis } from '../../../src/refonte/donnees/outils';
import { VueCockpit } from '../../../src/refonte/journee/cockpit/VueCockpit';
import { modeleCockpit } from '../../../src/refonte/journee/cockpit/modele';

const maintenant = instantParis('2026-10-30', '10:42');
const at = (jour: string, h: string): number => instantParis(jour, h);
const serie = Array.from({ length: 30 }, (_, i) => Math.round(3_900_00 + (i / 29) * 920_00 + Math.sin(i / 2.4) * 18_00));
const minutes = [14, 16, 15, 18, 17, 19, 22, 21, 24, 23, 26, 25, 27, 29, 28, 30, 32, 31, 33, 32, 34, 35, 33, 36, 35, 34, 36, 35, 37, 37];
const segments = Array.from({ length: 48 }, (_, i) => (i === 41 || i === 42 ? ('ralenti' as const) : ('ok' as const)));
const modele = modeleCockpit({
  client: 'Menna Conseil',
  aujourdhui: '2026-10-30',
  maintenant,
  revenu: { cents: 4_820_00, ecartPourcent: 18, objectifCents: 6_000_00, serie: [...serie.slice(0, 29), 4_820_00], encaisseDuMoisCents: 12_940_00, clientsActifs: 38, nouveaux: 6, impayes: 1 },
  connectes: { courant: 37, picDuJour: 52, picHeure: '9:40', aujourdhui: 214, picDes30Jours: 52, minutes },
  paiements: {
    totalCents: 1_240_00, nombre: 7, reussis: 6, refuse: { n: 1, raison: 'carte expirée' },
    derniers: [
      { heure: '10:31', offre: 'Pro mensuel', carte4: '4242', cents: 49_00, echec: false },
      { heure: '10:12', offre: 'Équipe', carte4: '0019', cents: 129_00, echec: false },
      { heure: '09:58', offre: 'Pro mensuel', carte4: '7781', cents: 49_00, echec: true },
      { heure: '09:40', offre: 'Pro mensuel', carte4: '3310', cents: 49_00, echec: false },
    ],
    note: 'Relance douce envoyée pour la carte expirée, à 10:00',
  },
  tickets: [
    { id: 'H-118', titre: 'Données utilisateurs absentes du tableau de bord', urgent: true, initiale: 'Mohamed', creeAt: at('2026-10-30', '10:12'), echeanceAt: at('2026-10-30', '17:00'), creeLabel: '10:12', echeanceLabel: '17:00' },
    { id: 'H-115', titre: 'Affichage mobile du calendrier', urgent: false, initiale: 'Riyad', creeAt: at('2026-10-29', '09:00'), echeanceAt: at('2026-10-30', '09:00'), creeLabel: 'hier', echeanceLabel: '9:00' },
    { id: 'H-119', titre: 'Export CSV des factures', urgent: false, initiale: 'Riyad', creeAt: at('2026-10-27', '14:00'), echeanceAt: at('2026-11-03', '18:00'), creeLabel: 'mar.', echeanceLabel: '3 nov.' },
    { id: 'H-116', titre: 'Texte de la page d’accueil', urgent: false, initiale: 'Amina', creeAt: at('2026-10-29', '09:00'), echeanceAt: at('2026-11-04', '18:00'), creeLabel: 'jeu.', echeanceLabel: '4 nov.' },
  ],
  delaisTenusPourcent: 92,
  sante: {
    noeuds: [
      { cle: 'stripe', libelle: 'Stripe', detail: 'webhooks 99,6 %', ton: 'ok' },
      { cle: 'vercel', libelle: 'API Vercel', detail: 'rétablie à 10:38', ton: 'ok' },
      { cle: 'serveur', libelle: 'Serveur AMN', detail: 'chiffré · 142 ms', ton: 'neutre' },
      { cle: 'cockpit', libelle: 'Ce cockpit', detail: 'il y a 12 s', ton: 'neutre' },
      { cle: 'espace', libelle: 'Espace de Menna', detail: 'il y a 12 s', ton: 'neutre' },
    ],
    segments, disponibilitePourcent: 99.8, legende: '3 échecs Vercel, 10:05 à 10:38, ticket H-118', debutBande: 'hier 10:40',
  },
});

export default function Apercu() {
  return (
    <ApercuBureau famille="jour" sousPage="tableau" fil={['Ma journée', 'Tableau de bord', 'Menna Conseil']} ajmani="Demande à Ajmani, ou dis ce que tu veux faire">
      <VueCockpit statut="pret" modele={modele} actions={{ reessayer: () => undefined }} contact="Amina" mois="octobre" />
    </ApercuBureau>
  );
}

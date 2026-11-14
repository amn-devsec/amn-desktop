/**
 * APERÇU « MR06 » — Créer · Réservations (v4). Les ressources et les réservations du 30 oct. sont posées ici, à la main,
 * pour reproduire la journée de l'image (le jeu de SIM place ses réservations sur d'autres jours) ; les calculs sont ceux
 * de `reservations.ts`.
 *
 *   npm run apercu -- MR06
 */
import React, { useState } from 'react';
import { VueReservations } from '../../../src/refonte/creer/ecrans/MR06/VueReservations';
import { modeleDesReservations, type ReservationVue } from '../../../src/refonte/creer/ecrans/MR06/modele';
import type { FiltreRessource } from '../../../src/refonte/creer/reservations';
import '../../../src/refonte/creer/creer.css';
import { ApercuBureau } from '../coquille';

const jour = '2026-10-30';
const ouverture = { jours: [1, 2, 3, 4, 5], debut: '08:00', fin: '18:00' };
const iso = (h: string) => `${jour}T${String(Number(h.slice(0, 2)) - 1).padStart(2, '0')}:${h.slice(3)}:00Z`; // CET : Paris − 1 h
const r = (id: string, ressourceId: string, de: string, a: string, libelle: string, qui: string, statut: ReservationVue['statut'] = 'confirmée'): ReservationVue => ({ id, ressourceId, debutAt: iso(de), finAt: iso(a), statut, libelle, qui });
const ressources = [
  { id: 's1', nom: 'Salle clients', type: 'salle' as const, ouverture, detail: '6 places' }, { id: 's2', nom: 'Atelier', type: 'salle' as const, ouverture, detail: '4 postes' },
  { id: 'v1', nom: 'Renault Kangoo', type: 'véhicule' as const, ouverture, detail: 'GH-482-KT' }, { id: 'v2', nom: 'Peugeot e-Partner', type: 'véhicule' as const, ouverture, detail: 'FN-120-ZA' },
  { id: 'v3', nom: 'Citroën Berlingo', type: 'véhicule' as const, ouverture, detail: 'EP-905-LM', indisponible: true, motifIndisponible: 'Au garage · contrôle technique' },
  { id: 'm1', nom: 'Vidéoprojecteur', type: 'matériel' as const, ouverture, detail: 'salle clients' }, { id: 'm2', nom: 'Testeur réseau Fluke', type: 'matériel' as const, ouverture, detail: 'FL-7731' },
];
const reservations = [
  r('a', 's1', '09:00', '10:30', 'Devis Léo', 'Aaron'), r('b', 's1', '11:00', '12:00', 'Menna', 'Riyad'), r('c', 's1', '14:00', '15:30', 'Atelier clients', 'Mohamed'),
  r('d', 's2', '08:30', '12:00', 'Préparation des caisses', 'Riyad'), r('e', 's2', '14:00', '16:00', 'Montage des caisses', 'Riyad'), r('f', 's2', '15:00', '17:00', 'Formation sécurité', 'Aaron', 'en attente'),
  r('g', 'v1', '08:00', '16:45', 'Tournée du jour : 5 étapes', 'Riyad'), r('h', 'v2', '13:30', '15:00', 'Chez Medina', 'Aaron'),
  r('i', 'm1', '14:00', '15:30', 'Atelier clients', 'Mohamed'), r('j', 'm2', '08:00', '18:00', 'Prêté à Mohamed jusqu’à lundi', 'Mohamed'),
];

export default function Apercu() {
  const [filtre, setFiltre] = useState<FiltreRessource>('tout');
  const modele = modeleDesReservations({ ressources, reservations, conflitsLe: ['2026-09-18'], aujourdhui: jour, filtre });
  return (
    <ApercuBureau famille="creer" sousPage="reservations" fil={['Créer et produire', 'Réservations']}>
      <VueReservations modele={modele} filtre={filtre} onFiltre={setFiltre} aujourdhui={jour} dateLibelle="Vendredi 30 octobre" maintenantMin={10 * 60 + 42}
        phraseCreuse="Vendredi après-midi et lundi matin sont libres."
        suggestion="La formation sécurité de 15:00 chevauche le montage des caisses. Je propose 17:00 à Mohamed, l’atelier sera libre." />
    </ApercuBureau>
  );
}

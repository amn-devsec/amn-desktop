/**
 * APERÇU « MX06 » — Réponses automatiques, dans l'état de l'image MX06 : six règles et la règle proposée par Ajmani, « Message
 * hors horaires » ouvert dans l'éditeur en phrases, l'aperçu de ce que reçoit un client et la suggestion « Une règle manque ».
 * Rendu par la VRAIE vue (`VueReponses`), composée par la VRAIE logique (`composerReponses`) sur des données FICTIVES.
 *
 *   npm run apercu -- MX06
 */
import React, { useState } from 'react';
import { ApercuBureau } from '../coquille';
import { VueReponses } from '../../../src/refonte/echanger/ecrans/mx06/VueReponses';
import { composerReponses, type RegleAffichable } from '../../../src/refonte/echanger/ecrans/mx06/composer';
import { libellesDe, traduire } from '../../../src/refonte/echanger/ecrans/mx06/i18n';

const MAINT = '2026-10-30T09:42:00Z'; // 10:42 à Paris
const regle = (id: string, nom: string, envois: number, actif: boolean, extra: Partial<RegleAffichable> = {}): RegleAffichable => ({ id, nom, canaux: ['courriel', 'sms'], declencheur: { type: 'horaires' }, modele: 'Bonjour {prénom},\nMerci pour votre message.', sauf24h: true, actif, envoisDuMois: envois, ...extra });
const regles: RegleAffichable[] = [
  regle('r1', 'Message hors horaires', 52, true, {
    declencheurTexte: 'Après 18:00 et le week-end', cible: 'un client ou un prospect', modeleTitre: 'Bien reçu, à très vite', signature: 'L’équipe AMN DevSec', tache: { personne: 'Riyad', quand: '9:00 le lendemain' }, testeeQuand: 'hier', enregistreAt: '2026-10-30T09:41:00Z',
    modele: 'Bonjour {prénom},\nMerci pour votre message. Nous sommes fermés jusqu’à {réouverture} : Riyad vous répond en premier.\nPour une urgence, écrivez-nous simplement « urgent » : Aaron est prévenu et vous rappelle.',
  }),
  regle('r2', 'Demande de devis', 38, true, { declencheur: { type: 'mots', mots: ['devis', 'tarif', 'prix'] }, declencheurTexte: 'Mots : devis, tarif, prix' }),
  regle('r3', 'Question sur une facture', 27, true, { declencheur: { type: 'mots', mots: ['facture', 'paiement'] }, declencheurTexte: 'Mots : facture, paiement' }),
  regle('r4', 'Ticket urgent', 19, true, { declencheur: { type: 'drapeau', drapeau: 'urgent' }, declencheurTexte: 'Drapeau urgent activé', etiquette: { texte: 'Alerte', ton: 'critique' } }),
  regle('r5', 'Vacances d’été', 12, false, { declencheurTexte: 'Du 1er au 15 août' }),
  regle('r6', 'Rendez-vous manqué', 0, false, { declencheur: { type: 'rendez-vous-manque' }, declencheurTexte: 'Absent à un rendez-vous' }),
];

export default function Apercu() {
  const [choisie, setChoisie] = useState<string | null>('r1');
  const [cible, setCible] = useState<'client' | 'prospect'>('client');
  const tm = (c: string, p?: Record<string, string | number>) => traduire('fr', c as never, p);
  const v = composerReponses({
    langue: 'fr', maintenant: '2026-10-29T17:30:00Z', regles, proposee: { nom: 'Suivi de commande' }, choisieId: choisie, enLigne: true,
    apercu: { de: 'L’équipe AMN DevSec', prenom: 'Karim', destinataireNom: 'Karim Medina', delaiSecondes: 2, cible }, manque: { question: 'où en est ma commande ?', n: 12 }, avis: [4.5],
  });
  return (
    <ApercuBureau famille="echanger" sousPage="reponsesAuto" fil={['Échanger', 'Réponses automatiques']} ajmani="Demande à Ajmani, ou dis ce que tu veux faire">
      <VueReponses {...v} etat="normal" libelles={libellesDe(tm as never)} actions={{ onRegle: setChoisie, onBascule: () => undefined, onNouvelle: () => undefined, onJournal: () => undefined, onAjouter: () => undefined, onTester: () => undefined, onDestinataire: (id) => setCible(id as 'client' | 'prospect'), onSuggestion: () => undefined }} />
    </ApercuBureau>
  );
}

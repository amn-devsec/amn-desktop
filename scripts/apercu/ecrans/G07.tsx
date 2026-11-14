/**
 * APERÇU « G07 » — Messagerie, la boîte des clients, dans l'état de l'image G07 : 5 clients attendent (le plus ancien depuis
 * 2 h 11), 3 sont en attente, 9 sont faits ; le fil de Cabinet Roux est ouvert, avec son brouillon d'Ajmani. Rendu par la
 * VRAIE vue (`VueBoite`), composée par la VRAIE logique (`composerBoite`, `composerFils`) sur des données FICTIVES de bac à
 * sable : noms, heures et nombres sont ceux de la maquette et ne vivent qu'ici.
 *
 *   npm run apercu -- G07
 */
import React, { useState } from 'react';
import { ApercuBureau } from '../coquille';
import { VueBoite } from '../../../src/refonte/echanger/ecrans/g07/VueBoite';
import { composerBoite, type ClientDuFil, type MessageAffichable } from '../../../src/refonte/echanger/ecrans/g07/composer';
import { libellesDe, traduire } from '../../../src/refonte/echanger/ecrans/g07/i18n';
import type { CanalDeMessage, EtatDeCanal, GesteDeTri } from '../../../src/refonte/echanger/boite';

const MAINT = '2026-10-30T09:42:00Z'; // 10:42 à Paris
const il = (minutes: number) => new Date(Date.parse(MAINT) - minutes * 60_000).toISOString();

const sansContexte = (nom: string, initiales: string): ClientDuFil => ({ nom, initiales, sousContrat: false, contexte: {} });
const clients: Record<string, ClientDuFil> = {
  'client:1': sansContexte('Medina', 'ME'),
  'client:2': sansContexte('Roux Santé', 'RS'),
  'client:3': sansContexte('Dupont', 'DU'),
  'client:4': sansContexte('Boulangerie Léo', 'BL'),
  'client:5': {
    nom: 'Cabinet Roux',
    initiales: 'CR',
    interlocuteur: 'Claire Roux',
    sousContrat: true,
    contexte: {
      contrat: { actif: true, echeance: '2026-12-31' },
      contratNom: 'Maintenance 2026',
      dernierPassage: { le: '2026-10-12', par: 'Mohamed' },
      passageLibelle: '12 oct., serveur',
      facturesEnRetard: { nombre: 0, montantCents: 0 },
      prochaineEcheance: '2026-11-05',
      facturesRef: 'F-2045',
      creneauxLibres: ['9:30', '14:00'],
      creneauxJour: '2026-11-05',
      creneauxSource: '2026-11-05',
    },
  },
  'client:6': sansContexte('Menna Conseil', 'MC'),
  'client:7': sansContexte('Parc Sud', 'PS'),
  'client:8': sansContexte('Medina', 'ME'),
};

const m = (id: string, clientId: number, canal: CanalDeMessage, sens: 'entrant' | 'sortant', at: string, texte: string, auteur: string, lu = true, extra: Partial<MessageAffichable> = {}): MessageAffichable => ({ id, clientId, canal, sens, at, lu, texte, auteur, ...extra });

const messages: MessageAffichable[] = [
  m('c1', 5, 'courriel', 'entrant', '2026-10-29T14:20:00Z', 'Le poste de l’accueil redémarre tout seul depuis lundi.', 'Claire Roux'),
  m('c2', 5, 'courriel', 'sortant', '2026-10-29T15:05:00Z', 'Je regarde à distance dès que possible.', 'Mohamed'),
  m('c3', 5, 'whatsapp', 'entrant', il(131), 'Il a encore redémarré ce matin, pendant un appel… On peut avoir quelqu’un jeudi ? Je vous envoie l’écran.', 'Claire Roux', true, { piece: { nom: 'photo-ecran.jpg', detail: '1,2 Mo · code 0x0000009F' } }),
  { id: 'c4', clientId: 5, canal: 'whatsapp', sens: 'sortant', at: il(100), lu: true, noteInterne: true, auteur: 'Mohamed', texte: 'Même souci que chez Dupont en septembre, c’est le pilote graphique. Vingt minutes sur place.' },
  m('b1', 4, 'sms', 'entrant', il(65), 'Le terminal de paiement ne capte plus le Wi-Fi', 'Boulangerie Léo', false),
  m('d1', 3, 'courriel', 'entrant', il(48), 'Facture F-2046 : une question sur la TVA', 'Dupont', false),
  m('r1', 2, 'courriel', 'entrant', il(22), 'Un accès pour la nouvelle secrétaire ?', 'Roux Santé', true),
  m('e1', 1, 'whatsapp', 'entrant', il(6), 'Merci pour hier ! Une dernière question sur la box', 'Medina', false),
  // En attente : ils ont écrit ce matin, la balle est chez eux.
  m('w1', 6, 'courriel', 'entrant', il(240), 'Bonjour, nous avons bien reçu le devis.', 'Menna Conseil'),
  m('w2', 7, 'courriel', 'entrant', il(236), 'Pouvez-vous nous renvoyer le bon de commande ?', 'Parc Sud'),
  m('w3', 8, 'whatsapp', 'entrant', il(232), 'Je vous envoie la photo plus tard.', 'Medina'),
];
const gestes: GesteDeTri[] = [
  { filId: 'client:6', etat: 'en-attente', at: il(220), depuisLe: il(2 * 24 * 60 + 30), attend: 'Leur accord sur le devis D-2026-114' },
  { filId: 'client:7', etat: 'en-attente', at: il(218), depuisLe: il(30 * 60), attend: 'Le bon de commande signé', relanceLe: '2026-11-02' },
  { filId: 'client:8', etat: 'en-attente', at: il(216), depuisLe: il(20 * 60), attend: 'La photo de l’étiquette de la box' },
];
// Faits : neuf fils traités aujourd'hui, dont quatre en tête de liste (DU, PS, BL, MC).
const faits: [string, string, number, CanalDeMessage][] = [['DU', 'Dupont', 30, 'courriel'], ['PS', 'Parc Sud', 37, 'whatsapp'], ['BL', 'Boulangerie Léo', 44, 'sms'], ['MC', 'Menna Conseil', 62, 'courriel'], ['A1', 'Atelier Un', 90, 'courriel'], ['A2', 'Atelier Deux', 95, 'whatsapp'], ['A3', 'Atelier Trois', 100, 'sms'], ['A4', 'Atelier Quatre', 110, 'courriel'], ['A5', 'Atelier Cinq', 120, 'whatsapp']];
faits.forEach(([ini, nom, min, canal], i) => {
  const id = 20 + i;
  clients[`client:${id}`] = sansContexte(nom, ini);
  messages.push(m(`f${id}`, id, canal, 'entrant', il(min + 120), 'Merci de votre retour.', nom));
  gestes.push({ filId: `client:${id}`, etat: 'fait', at: il(min) });
});

const canaux: EtatDeCanal[] = [{ canal: 'courriel', etat: 'actif' }, { canal: 'whatsapp', etat: 'actif' }, { canal: 'sms', etat: 'actif' }];

export default function Apercu() {
  const [filtre, setFiltre] = useState<CanalDeMessage | 'tous'>('tous');
  const [choisi, setChoisi] = useState<string>('client:5');
  const [plies, setPlies] = useState<Set<string>>(new Set());
  const tm = (c: string, p?: Record<string, string | number>) => traduire('fr', c as never, p);
  const v = composerBoite({
    langue: 'fr',
    maintenant: MAINT,
    prenom: 'Aaron',
    messages,
    gestes,
    clients,
    canaux,
    soirs: [{ jour: '2026-10-26', aRepondreALaFin: 0 }, { jour: '2026-10-27', aRepondreALaFin: 0 }, { jour: '2026-10-28', aRepondreALaFin: 0 }, { jour: '2026-10-29', aRepondreALaFin: 0 }],
    filChoisi: choisi,
    filtre,
    pliesOuverts: plies,
    brouillon: { texte: 'Bonjour Madame Roux, je passe jeudi 5 nov. à 9:30 avec un poste de prêt, pour que l’accueil continue de fonctionner. Cela vous convient ?', creneau: '9:30' },
    resumesDePlis: { '2026-10-29:courriel': 'Claire signale que le poste de l’accueil redémarre tout seul ; tu as promis de regarder à distance.' },
    initialesJours: ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.'],
  });
  return (
    <ApercuBureau famille="echanger" sousPage="messagerie" fil={['Échanger', 'Messagerie']} ajmani="Demande à Ajmani, ou dis ce que tu veux faire">
      <VueBoite
        {...v}
        etat="normal"
        libelles={libellesDe(tm as never)}
        actions={{
          onReglesDeTri: () => undefined,
          onNouveauMessage: () => undefined,
          onFiltre: (id) => setFiltre(id),
          onChoisir: setChoisi,
          onDeplier: (id) => setPlies((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; }),
          onEnAttente: () => undefined,
          onFait: () => undefined,
          onEnvoyer: () => undefined,
          onBrouillon: () => undefined,
          onCreerTicket: () => undefined,
          onAppeler: () => undefined,
        }}
      />
    </ApercuBureau>
  );
}

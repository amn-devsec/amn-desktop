/**
 * APERÇU « MX01 » — Courriel, la boîte partagée, dans l'état de l'image MX01 : sept fils dans la Réception (3 non lus), le fil
 * d'Amina Menna ouvert avec le résumé d'Ajmani, deux messages repliés, le dernier déplié et un brouillon prêt. Rendu par la
 * VRAIE vue (`VueCourriel`), composée par la VRAIE logique (`composerCourriel`) sur des données FICTIVES de bac à sable.
 *
 *   npm run apercu -- MX01
 */
import React, { useState } from 'react';
import { ApercuBureau } from '../coquille';
import { VueCourriel, type DossierId } from '../../../src/refonte/echanger/ecrans/mx01/VueCourriel';
import { composerCourriel, type MessageAffichable } from '../../../src/refonte/echanger/ecrans/mx01/composer';
import { libellesDe, traduire } from '../../../src/refonte/echanger/ecrans/mx01/i18n';

const MAINT = '2026-10-30T09:42:00Z'; // 10:42 à Paris
const m = (id: string, filId: string, de: string, objet: string, texte: string, at: string, extra: Partial<MessageAffichable> = {}): MessageAffichable => ({ id, filId, de: `${de.toLowerCase().replace(/\W/g, '')}@ex.fr`, a: ['equipe@ex.fr'], at, lu: true, expediteur: de, objet, texte, ...extra });
const messages: MessageAffichable[] = [
  m('a1', 'f1', 'Amina Menna', 'Re : Tableau de bord, quelques précisions', 'Voici le lien de la démonstration de cet après-midi, à tout à l’heure.', '2026-10-28T13:00:00Z', { envoye: true, organisation: 'menna' }),
  m('a2', 'f1', 'Amina Menna', 'Re : Tableau de bord, quelques précisions', 'Merci, c’était très clair. Je reviens vers vous avec 2 précisions.', '2026-10-29T10:00:00Z', { organisation: 'menna' }),
  m('a3', 'f1', 'Amina Menna', 'Re : Tableau de bord, quelques précisions', 'Bonjour Aaron, merci pour la démonstration d’hier. Pouvons-nous voir le nombre d’utilisateurs actifs de la semaine directement en haut du tableau de bord ?\nDernier point : serait-il possible de recevoir une alerte lorsqu’un utilisateur signale un problème urgent ? Merci d’avance, Amina.', '2026-10-30T09:12:00Z', { lu: false, organisation: 'menna', piecesJointes: [{ nom: 'maquette-menna.pdf', analyse: 'sans-risque' }], taille: 1_200_000, assigneA: 'aaron@ex.fr' }),
  m('k1', 'f2', 'Karim Medina', 'Devis D-2026-117 : une question', 'Le délai de livraison des postes me semble long…', '2026-10-30T08:20:00Z', { lu: false }),
  m('k2', 'f2', 'Karim Medina', 'Devis D-2026-117 : une question', 'Le délai de livraison des postes me semble long…', '2026-10-30T08:30:00Z', { lu: false }),
  m('s1', 'f3', 'Stripe', 'Votre versement de 2 400 € est en route', 'Arrivée prévue lundi sur le compte pro.', '2026-10-30T08:02:00Z'),
  m('l1', 'f4', 'Léo Martin', 'Photos pour la page publique', 'Je vous envoie les 12 photos de la vitrine.', '2026-10-29T15:00:00Z', { lu: false, piecesJointes: [{ nom: 'photos.zip', analyse: 'sans-risque' }] }),
  m('c1', 'f5', 'Cabinet Lemoine', 'Pièces manquantes pour la TVA', 'Il nous manque 2 factures d’achat de septembre.', '2026-10-29T14:00:00Z'),
  m('c2', 'f5', 'Cabinet Lemoine', 'Pièces manquantes pour la TVA', 'Il nous manque 2 factures d’achat de septembre.', '2026-10-29T14:30:00Z'),
  m('c3', 'f5', 'Cabinet Lemoine', 'Pièces manquantes pour la TVA', 'Il nous manque 2 factures d’achat de septembre.', '2026-10-29T15:30:00Z'),
  m('c4', 'f5', 'Cabinet Lemoine', 'Pièces manquantes pour la TVA', 'Il nous manque 2 factures d’achat de septembre.', '2026-10-29T16:30:00Z'),
  m('h1', 'f6', 'Agence Horizon', 'Visuels de novembre pour Menna', 'Trois propositions, à valider avant mardi.', '2026-10-29T10:00:00Z', { piecesJointes: [{ nom: 'v.zip', analyse: 'sans-risque' }] }),
  m('h2', 'f6', 'Agence Horizon', 'Visuels de novembre pour Menna', 'Trois propositions, à valider avant mardi.', '2026-10-29T11:00:00Z'),
  m('n1', 'f7', 'Newsletter sécurité', 'Les 5 alertes de la semaine', 'Mises à jour urgentes : navigateurs et routeurs.', '2026-10-26T08:00:00Z'),
  m('b1', 'f8', 'Aaron', 'Brouillon', 'À finir', '2026-10-30T07:00:00Z', { dossier: 'brouillons', envoye: true }),
  m('p1', 'f9', 'Aaron', 'Programmé', 'Lundi', '2026-10-30T07:30:00Z', { programmeAt: '2026-11-02T08:00:00Z', envoye: true }),
];

export default function Apercu() {
  const [dossier, setDossier] = useState<DossierId>('reception');
  const [fil, setFil] = useState<string | null>('f1');
  const tm = (c: string, p?: Record<string, string | number>) => traduire('fr', c as never, p);
  const v = composerCourriel({
    langue: 'fr', maintenant: MAINT, moi: 'aaron@ex.fr', messages, dossier, filtre: 'tous', filChoisi: fil,
    presences: [{ email: 'mohamed@ex.fr', nom: 'Mohamed', filId: 'f2', filNom: 'Medina', mode: 'lit' }, { email: 'riyad@ex.fr', nom: 'Riyad', filId: 'f4', filNom: 'Léo', mode: 'ecrit' }],
    organisations: { menna: { type: 'client', nom: 'Menna Conseil', suivi: 'Aaron' } },
    etatBoite: 'reliee', brouillonPret: 'les 2 demandes, livraison vendredi', attend: 'une date de livraison. Rien n’a encore été promis.',
  });
  return (
    <ApercuBureau famille="echanger" sousPage="courriel" fil={['Échanger', 'Courriel']} ajmani="Dis ce que tu veux répondre, Ajmani rédige le message">
      <VueCourriel {...v} etat="normal" libelles={libellesDe(tm as never)} actions={{ onDossier: setDossier, onFil: setFil, onFiltre: () => undefined, onRegles: () => undefined, onNouveau: () => undefined, onArchiver: () => undefined, onUtiliser: () => undefined, onTache: () => undefined, onProgrammer: () => undefined }} />
    </ApercuBureau>
  );
}

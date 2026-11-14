/**
 * APERÇU « MX05 » — Sondages, dans l'état de l'image MX05 : « Quel nom pour la nouvelle offre ? » (Horizon 57 %, Boussole 29 %,
 * Cap 14 %), participation 7 sur 8, sept votes en direct, quatre autres sondages, et l'éditeur d'un brouillon préparé par
 * Ajmani. Rendu par la VRAIE vue (`VueSondages`), composée par la VRAIE logique (`composerSondages`) sur des données FICTIVES.
 *
 *   npm run apercu -- MX05
 */
import React, { useState } from 'react';
import { ApercuBureau } from '../coquille';
import { VueSondages } from '../../../src/refonte/echanger/ecrans/mx05/VueSondages';
import { composerSondages, type SondageAffichable } from '../../../src/refonte/echanger/ecrans/mx05/composer';
import { libellesDe, traduire } from '../../../src/refonte/echanger/ecrans/mx05/i18n';

const MAINT = '2026-10-30T09:42:00Z'; // 10:42 à Paris
const NOMS: Record<string, string> = { amina: 'Amina Menna', riyad: 'Riyad', karim: 'Karim Medina', leo: 'Léo Martin', claire: 'Claire Roux', sarah: 'Sarah Dubois', aaron: 'Aaron' };
const vote = (qui: string, optionId: string, hhmm: string) => ({ email: `${qui}@ex.fr`, optionId, at: `2026-10-30T${hhmm}:00Z` });
const sondages: SondageAffichable[] = [
  {
    id: 'p1', question: 'Quel nom pour la nouvelle offre ?', type: 'un-choix', anonyme: false, destinataires: 8, etat: 'en-cours', creeAt: '2026-10-28T09:00:00Z', clotureAt: '2026-11-02T17:00:00Z', audience: 'équipe et 5 clients',
    options: [{ id: 'h', libelle: 'Horizon', votes: 0 }, { id: 'b', libelle: 'Boussole', votes: 0 }, { id: 'c', libelle: 'Cap', votes: 0 }],
    votes: [vote('amina', 'h', '09:41'), vote('riyad', 'h', '09:33'), vote('karim', 'b', '09:12'), vote('leo', 'h', '08:58'), vote('claire', 'c', '08:31'), vote('sarah', 'b', '08:12'), vote('aaron', 'h', '08:05')],
  },
  {
    id: 'p2', question: 'Satisfaction d’octobre', type: 'note', anonyme: true, destinataires: 12, etat: 'en-cours', creeAt: '2026-10-27T09:00:00Z', clotureAt: '2026-11-01T17:00:00Z',
    options: ['1', '2', '3', '4', '5'].map((n) => ({ id: n, libelle: n, votes: 0 })),
    votes: [...Array.from({ length: 8 }, (_, i) => vote(`x${i}`, '5', '08:00')), ...Array.from({ length: 3 }, (_, i) => vote(`y${i}`, '4', '08:00')), vote('z', '3', '08:00')],
  },
  { id: 'p3', question: 'Priorité du trimestre', type: 'un-choix', anonyme: false, destinataires: 3, etat: 'en-cours', creeAt: '2026-10-26T09:00:00Z', clotureAt: '2026-11-04T17:00:00Z', options: [{ id: 'm', libelle: 'Mobile', votes: 0 }, { id: 'a', libelle: 'API', votes: 0 }], votes: [vote('a1', 'm', '08:00'), vote('a2', 'm', '08:00'), vote('a3', 'a', '08:00')] },
  { id: 'p4', question: 'Jour de l’atelier', type: 'un-choix', anonyme: false, destinataires: 8, etat: 'termine', creeAt: '2026-10-20T09:00:00Z', options: [{ id: 'ma', libelle: 'Mardi 3 nov.', votes: 0 }, { id: 'je', libelle: 'Jeudi 5 nov.', votes: 0 }], votes: [1, 2, 3].map((i) => vote(`d${i}`, 'ma', '08:00')).concat([vote('d4', 'je', '08:00'), vote('d5', 'je', '08:00')]) },
  { id: 'p5', question: 'Repas de fin d’année', type: 'un-choix', anonyme: false, destinataires: 3, etat: 'termine', creeAt: '2026-10-10T09:00:00Z', options: [{ id: 't', libelle: 'Traiteur', votes: 0 }, { id: 'r', libelle: 'Restaurant', votes: 0 }], votes: [vote('e1', 't', '08:00'), vote('e2', 't', '08:00'), vote('e3', 't', '08:00')] },
];

export default function Apercu() {
  const [choisi, setChoisi] = useState<string | null>(null);
  const tm = (c: string, p?: Record<string, string | number>) => traduire('fr', c as never, p);
  const v = composerSondages({
    langue: 'fr', maintenant: MAINT, moi: 'aaron@ex.fr', nom: (e) => NOMS[e.split('@')[0]] ?? e, sondages, choisiId: choisi,
    editeur: {
      question: 'Quel tarif de maintenance préfères-tu ?', options: ['29 € par mois, sans engagement', '290 € par an, 2 mois offerts'], anonyme: true,
      ajmani: 'tu hésites entre deux tarifs de maintenance.',
      extras: { type: 'un-choix', ouvertClients: { actif: true, detail: '5 meilleurs' }, resultatsVisibles: false, cloture: 'Lun. 9 nov., 18:00', destinataires: { noms: ['Aaron', 'Mohamed', 'Riyad'], texte: 'équipe et 5 clients' } },
    },
  });
  return (
    <ApercuBureau famille="echanger" sousPage="sondages" fil={['Échanger', 'Sondages']} ajmani="Demande à Ajmani, ou dis ce que tu veux faire">
      <VueSondages {...v} etat="normal" libelles={libellesDe(tm as never)} actions={{ onPuce: setChoisi, onAutre: setChoisi, onModeles: () => undefined, onTous: () => undefined, onPartager: () => undefined, onClore: () => undefined, onQuestion: () => undefined, onOption: () => undefined, onRetirerOption: () => undefined, onAjouterOption: () => undefined, onAnonyme: () => undefined, onType: () => undefined, onEnvoyer: () => undefined, onApercu: () => undefined }} />
    </ApercuBureau>
  );
}

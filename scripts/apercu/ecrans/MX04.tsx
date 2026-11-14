/**
 * APERÇU « MX04 » — Canaux, dans l'état de l'image MX04 : « # clients-urgents » ouvert (2 non lus), sa carte d'événement
 * « Urgent » résolue à 09:15, six messages, « Riyad est en train d'écrire » et le tiroir du fil ouvert sur le message de 08:54.
 * Rendu par la VRAIE vue (`VueCanaux`), composée par la VRAIE logique (`composerCanaux`) sur des données FICTIVES.
 *
 *   npm run apercu -- MX04
 */
import React, { useState } from 'react';
import { ApercuBureau } from '../coquille';
import { VueCanaux } from '../../../src/refonte/echanger/ecrans/mx04/VueCanaux';
import { composerCanaux, type MessageAffichable } from '../../../src/refonte/echanger/ecrans/mx04/composer';
import { libellesDe, traduire } from '../../../src/refonte/echanger/ecrans/mx04/i18n';

const MAINT = '2026-10-30T09:42:00Z'; // 10:42 à Paris
const NOMS: Record<string, string> = { aaron: 'Aaron', mohamed: 'Mohamed', riyad: 'Riyad' };
const m = (id: string, qui: string, hhmm: string, texte: string, extra: Partial<MessageAffichable> = {}): MessageAffichable => ({ id, canalId: 'cu', auteurEmail: `${qui}@ex.fr`, at: `2026-10-30T${hhmm}:00Z`, texte, ...extra });
const messages: MessageAffichable[] = [
  m('m1', 'aaron', '07:51', 'Mohamed, tu peux regarder avant 11 h ? Amina présente les chiffres à son équipe ce matin.', { reactions: [{ email: 'mohamed@ex.fr', type: 'oeil' }] }),
  m('m2', 'mohamed', '07:54', 'Je regarde la connexion à l’API tout de suite.'),
  m('r1', 'mohamed', '08:02', 'La connexion a expiré cette nuit, je la renouvelle côté serveur.', { repondA: 'm2' }),
  m('r2', 'aaron', '08:05', 'Merci, préviens-moi quand c’est bon.', { repondA: 'm2' }),
  m('r3', 'mohamed', '08:15', 'C’est reparti, les données remontent.', { repondA: 'm2' }),
  m('r4', 'riyad', '08:18', 'Je préviens Amina.', { repondA: 'm2' }),
  m('m3', 'aaron', '08:20', 'Correction envoyée, Menna confirme que tout est revenu. Merci aux deux.', { reactions: [{ email: 'aaron@ex.fr', type: 'coche' }, { email: 'mohamed@ex.fr', type: 'coche' }, { email: 'riyad@ex.fr', type: 'coche' }, { email: 'riyad@ex.fr', type: 'etoile' }] }),
  m('m4', 'riyad', '09:38', 'Medina demande si on peut avancer la livraison des postes à lundi.'),
  m('m5', 'mohamed', '09:41', 'Possible si le bon de commande arrive aujourd’hui.'),
];
const canal = (id: string, nom: string, lectureAt: string | null, extra: object = {}) => ({ id, nom, visibilite: 'public' as const, membres: ['aaron@ex.fr', 'mohamed@ex.fr', 'riyad@ex.fr'], lectureAt, ...extra });

export default function Apercu() {
  const [canalId, setCanalId] = useState('cu');
  const [fil, setFil] = useState<string | null>('m2');
  const tm = (c: string, p?: Record<string, string | number>) => traduire('fr', c as never, p);
  const v = composerCanaux({
    langue: 'fr', maintenant: MAINT, moi: 'aaron@ex.fr', role: 'Propriétaire', nom: (e) => NOMS[e.split('@')[0]] ?? e,
    canaux: [
      canal('ge', 'général', undefined), canal('cu', 'clients-urgents', '2026-10-30T07:00:00Z', { description: 'Les demandes qui ne peuvent pas attendre', alerte: true }),
      canal('cd', 'chantier-dupont', undefined), canal('te', 'technique', undefined), canal('id', 'idées', undefined), canal('bi', 'bilan-semaine', undefined),
    ],
    messages: [...messages, { id: 'n1', canalId: 'cd', auteurEmail: 'riyad@ex.fr', at: '2026-10-30T09:00:00Z', texte: 'Livraison jeudi.' }],
    evenements: [{ id: 'ev', canalId: 'cu', titre: 'Menna Conseil : données absentes', sous: 'Depuis le tableau de bord de Menna', at: '2026-10-30T07:50:00Z', resoluAt: '2026-10-30T08:15:00Z' }],
    directs: [{ id: 'mo', nom: 'Mohamed', concentre: true, enLigne: true }, { id: 'ri', nom: 'Riyad', concentre: false, tapeA: '2026-10-30T09:41:58Z', enLigne: true }],
    frappes: [{ canalId: 'cu', email: 'riyad@ex.fr', tapeA: '2026-10-30T09:41:58Z' }],
    canalId, filOuvertId: fil, brouillon: '', avecReactions: true, peutTache: true,
    resumes: { m2: 'Connexion expirée, rétablie à 09:15. Amina a été prévenue. Rien à faire de plus.' },
  });
  const rail = { ...v.rail, canaux: v.rail.canaux.map((c) => (c.id === 'cu' ? { ...c, nonLus: 2 } : c.id === 'cd' ? { ...c, nonLus: 1 } : c)) };
  return (
    <ApercuBureau famille="echanger" sousPage="canaux" fil={['Échanger', 'Canaux']} ajmani="Écris dans le canal, ou demande à Ajmani un résumé de la journée">
      <VueCanaux {...v} rail={rail} sousTitre="Une conversation par sujet, rien ne se perd · 3 non lus" etat="normal" libelles={libellesDe(tm as never)} actions={{ onCanal: setCanalId, onOuvrirFil: setFil, onFermerFil: () => setFil(null), onNouveauCanal: () => undefined, onParcourir: () => undefined, onReaction: () => undefined, onValeur: () => undefined, onEnvoyer: () => undefined }} />
    </ApercuBureau>
  );
}

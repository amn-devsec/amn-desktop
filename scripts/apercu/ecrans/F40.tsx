/**
 * APERÇU « F40 » — Échanger, vue d'ensemble, dans l'état de l'image F40 : 5 clients attendent, le plus ancien depuis
 * 2 h 11 ; la Boîte à zéro est à 12 sur 17. Rendu par la VRAIE vue (`VueHub`), composée par la VRAIE logique
 * (`composerHub`, `composerFils`) sur des données FICTIVES de bac à sable : noms, heures et nombres sont ceux de la
 * maquette et ne vivent qu'ici.
 *
 *   npm run apercu -- F40
 */
import React from 'react';
import { BellRing, CalendarClock, FolderLock, Headset, Mail, Megaphone, MessageSquare, MessagesSquare, Reply, Vote } from 'lucide-react';
import { ApercuBureau } from '../coquille';
import { VueHub } from '../../../src/refonte/echanger/ecrans/f40/VueHub';
import { composerHub, type InfoDeFil } from '../../../src/refonte/echanger/ecrans/f40/composer';
import { libellesDe, traduire } from '../../../src/refonte/echanger/ecrans/f40/i18n';
import { composerFils, type GesteDeTri, type MessageDeFil } from '../../../src/refonte/echanger/boite';

const MAINT = '2026-10-30T09:42:00Z'; // 10:42 à Paris
const il = (minutes: number) => new Date(Date.parse(MAINT) - minutes * 60_000).toISOString();
const clients: Record<number, InfoDeFil> = {
  1: { initiales: 'ME', nom: 'Medina', canal: 'WhatsApp' },
  2: { initiales: 'RS', nom: 'Roux Santé', canal: 'Courriel' },
  3: { initiales: 'DU', nom: 'Dupont', canal: 'Courriel' },
  4: { initiales: 'BL', nom: 'Boulangerie Léo', canal: 'SMS' },
  5: { initiales: 'CR', nom: 'Cabinet Roux', canal: 'WhatsApp' },
};
const attentes: [number, number, MessageDeFil['canal']][] = [[1, 6, 'whatsapp'], [2, 22, 'courriel'], [3, 48, 'courriel'], [4, 65, 'sms'], [5, 131, 'whatsapp']];
const messages: MessageDeFil[] = attentes.map(([id, min, canal]) => ({ id: `m${id}`, clientId: id, canal, sens: 'entrant', at: il(min), lu: id !== 1 }));
const gestes: GesteDeTri[] = [];
for (let i = 10; i < 22; i += 1) {
  messages.push({ id: `f${i}`, clientId: i, canal: 'courriel', sens: 'entrant', at: il(200 + i), lu: true });
  gestes.push({ filId: `client:${i}`, etat: i < 19 ? 'fait' : 'en-attente', at: il(100 + i) });
}
const fils = composerFils(messages, gestes, MAINT);
const infos: Record<string, InfoDeFil> = Object.fromEntries(Object.entries(clients).map(([id, v]) => [`client:${id}`, v]));
const ic = (n: React.ReactNode) => n;

export default function Apercu() {
  const tm = (c: string, p?: Record<string, string | number>) => traduire('fr', c as never, p);
  const canaux = [{ id: 'wa', nom: 'WhatsApp clients' }, { id: 'ml', nom: 'Courriel partagé' }, { id: 'sms', nom: 'SMS' }, { id: 'cu', nom: '# clients-urgents' }, { id: 'cd', nom: '# chantier-dupont' }, { id: 'gen', nom: '# général' }, { id: 'sal', nom: 'Salles' }];
  const msgsCanaux = [...Array.from({ length: 14 }, (_, i) => ({ canalId: 'wa', at: il(2 + i * 8) })), ...Array.from({ length: 10 }, (_, i) => ({ canalId: 'ml', at: il(5 + i * 9) })), ...Array.from({ length: 6 }, (_, i) => ({ canalId: 'cu', at: il(10 + i * 7) })), { canalId: 'sms', at: il(20) }, { canalId: 'cd', at: il(40) }, ...Array.from({ length: 5 }, (_, i) => ({ canalId: 'sal', at: il(3 + i * 4) })), { canalId: 'gen', at: il(300) }];
  const v = composerHub(
    {
      langue: 'fr', maintenant: MAINT, messages, fils, infos,
      soirs: [{ jour: '2026-10-26', aRepondreALaFin: 0 }, { jour: '2026-10-27', aRepondreALaFin: 0 }, { jour: '2026-10-28', aRepondreALaFin: 0 }, { jour: '2026-10-29', aRepondreALaFin: 0 }],
      canaux, messagesDeCanaux: msgsCanaux,
      statutsDeCanaux: { ml: { nonLus: 3 }, sms: { nonLus: 3 }, cu: { nonLus: 2 }, cd: { nonLus: 1 }, sal: { ouvertes: 1 } },
      attendentParCanal: { wa: 2 },
      repondusIds: [], lusNonArchives: 4, archivesAujourdhui: 0,
      mesures: { aRepondre: 5, courrielsNonLus: 3, canauxNonLus: 3, canauxAvecNonLus: 2, appelsEnCours: 1, reunionsAujourdhui: 1, annoncesAConfirmer: 1, partagesActifs: 17, sondagesEnCours: 3, reglesActives: 5, reglesTotal: 7, envoisProgrammes: 2, reunionsSemaine: 6, reunionsSemaineMinutes: 240, envoisAutoDuMois: 148, canauxTotal: 6, liensTousProteges: true },
      modulesOuverts: null,
      routes: { messagerie: '/messagerie', courriel: '/courriel', canaux: '/groupes', appels: '/appels', reunions: '/reunions', annonces: '/annonces', partages: '/partages', sondages: '/sondages', reponsesAuto: '/reponses-automatiques', programmes: '/courriel' },
      nomsCourts: {}, prenomDeFil: (id) => infos[id]?.nom ?? '', initialesJours: ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.'],
      icones: { messagerie: ic(<MessageSquare size={14} />), courriel: ic(<Mail size={14} />), canaux: ic(<MessagesSquare size={14} />), appels: ic(<Headset size={14} />), reunions: ic(<CalendarClock size={14} />), annonces: ic(<Megaphone size={14} />), partages: ic(<FolderLock size={14} />), sondages: ic(<Vote size={14} />), reponsesAuto: ic(<Reply size={14} />), programmes: ic(<BellRing size={14} />) },
    },
    { onResumer: () => undefined, onClic: { repondre: () => undefined } },
  );
  return (
    <ApercuBureau famille="echanger" sousPage="ensemble" fil={['Échanger', 'Vue d’ensemble']} ajmani="Demande à Ajmani : « Résume les messages de ce matin en 5 lignes »">
      <VueHub {...v} libelles={libellesDe(tm as never)} onNouveauMessage={() => undefined} onPersonnaliser={() => undefined} />
    </ApercuBureau>
  );
}

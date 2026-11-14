/**
 * APERÇU « H13 » — Appels et salles, dans l'état de l'image H13 : un appel de Menna Conseil en cours sur la ligne pro (04:12,
 * transfert vers le poste 102), l'équipe en salle, la Boulangerie Léo au standard, trois appels dans l'historique. Rendu par la
 * VRAIE vue (`VueAppels`), composée par la VRAIE logique (`composerAppels`) sur des données FICTIVES de bac à sable.
 *
 *   npm run apercu -- H13
 */
import React, { useState } from 'react';
import { ApercuBureau } from '../coquille';
import { VueAppels, type CombineVue } from '../../../src/refonte/echanger/ecrans/h13/VueAppels';
import { composerAppels } from '../../../src/refonte/echanger/ecrans/h13/composer';
import { libellesDe, traduire } from '../../../src/refonte/echanger/ecrans/h13/i18n';

const MAINT = '2026-10-30T09:42:00Z'; // 10:42 à Paris
const il = (min: number, sec = 0) => new Date(Date.parse(MAINT) - min * 60_000 - sec * 1000).toISOString();

const PAVE = [['1', ''], ['2', 'ABC'], ['3', 'DEF'], ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'], ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'], ['*', ''], ['0', '+'], ['#', '']].map(([touche, lettres]) => ({ touche, lettres, clair: ['1', '2', '0'].includes(touche) }));
const ONDE = [10, 18, 12, 24, 16, 8, 20, 26, 14, 22, 9, 17, 25, 12, 19, 28, 11, 15, 23, 10, 18, 26, 13, 21, 9, 16, 24, 12];

export default function Apercu() {
  const [filtre, setFiltre] = useState<'tout' | 'manques' | 'resume'>('tout');
  const tm = (c: string, p?: Record<string, string | number>) => traduire('fr', c as never, p);
  const v = composerAppels({
    langue: 'fr', maintenant: MAINT, incidentDeclare: false, roleDeSupervision: true,
    salles: [
      { def: { id: 'eq', nom: 'Salle de l’équipe', capacite: 8, genre: 'equipe', ton: 'jour' }, connectes: [{ email: 'riyad@ex.fr', voixA: il(0, 0) }, { email: 'mohamed@ex.fr' }], debutDeSession: il(8), titreDeSession: 'Point facturation', ecranPartage: true, evenementsDuJour: [] },
      { def: { id: 'cl', nom: 'Salle clients', capacite: 6, genre: 'clients', ton: 'contacts' }, connectes: [], debutDeSession: null, complement: 'lien invité, sans compte', evenementsDuJour: [{ at: '2026-10-30T10:00:00Z', titre: 'Menna Conseil' }] },
      { def: { id: 'at', nom: 'Atelier créatif', capacite: 6, genre: 'creatif', ton: 'creer' }, connectes: [], debutDeSession: null, complement: 'écran partagé conseillé', evenementsDuJour: [] },
      { def: { id: 'ga', nom: 'Salle de la Garde', capacite: 6, genre: 'garde', ton: 'neutre', supervision: true }, connectes: [], debutDeSession: null, evenementsDuJour: [] },
    ],
    appelEnCours: { nom: 'Aaron · Menna Conseil', sous: '', debutAt: il(4, -12 + 24), enLigne: true },
    file: [{ id: 'bl', nom: 'Boulangerie Léo', debutAt: il(0, 38) }],
    auTelephone: ['aaron@ex.fr'],
    appels: [
      { id: 'a1', titre: 'Stand-up de ce matin', sens: 'entrant', finAt: '2026-10-30T08:44:00Z', dureeSec: 14 * 60, resume: 'Les tickets urgents préviennent Mohamed tout de suite. Riyad termine la maquette mobile avant lundi.', decisions: ['a', 'b', 'c'], taches: ['t1', 't2'], moment: { lieu: 'Salle de l’équipe', at: '2026-10-30T08:30:00Z' } },
      { id: 'a2', titre: 'Medina Services', sens: 'sortant', finAt: '2026-10-29T15:40:00Z', dureeSec: 35 * 60, resume: 'Karim valide l’avenant et attend le planning de décembre avant de signer.', decisions: ['a'], taches: ['t1'], tachesCreees: true, moment: { at: '2026-10-29T15:05:00Z' } },
      { id: 'a3', titre: 'Boulangerie Léo', sens: 'manque', finAt: '2026-10-29T11:20:00Z', dureeSec: 0, resume: 'Pas de message laissé. La boulangerie rappelle en ce moment, l’appel attend au standard.', decisions: [], taches: [], moment: { at: '2026-10-29T11:20:00Z' } },
      { id: 'a4', titre: 'Cabinet Roux', sens: 'manque', finAt: '2026-10-29T09:00:00Z', dureeSec: 0, resume: null, decisions: [], taches: [], rappele: true, moment: { at: '2026-10-29T09:00:00Z' } },
    ],
    filtre,
    enLigneAvec: 'Menna Conseil',
    actions: { onRejoindre: () => undefined, onPreparer: () => undefined, onReserver: () => undefined, onCreerTaches: () => undefined, onPrendre: () => undefined },
  });
  const combine: CombineVue = {
    genre: 'ligne', ligne: 'Ligne pro AMN',
    correspondant: { initiales: 'M', nom: 'Menna Conseil', sous: 'Menna, dirigeante · appel entrant', etiquettes: [{ texte: 'Cliente' }, { texte: 'Contrat actif', vert: true }] },
    duree: '04:12', onde: ONDE,
    notes: { titre: 'Ajmani note pendant l’appel', lignes: ['Rendez-vous confirmé ven. 11:00', 'Ajouter la carte des tickets au tableau'] },
    commandes: [
      { cle: 'micro', libelle: 'Micro', actif: false, onClick: () => undefined },
      { cle: 'attente', libelle: 'Attente', actif: false, onClick: () => undefined },
      { cle: 'transferer', libelle: 'Transférer', actif: true, onClick: () => undefined },
      { cle: 'clavier', libelle: 'Clavier', actif: true, onClick: () => undefined },
      { cle: 'raccrocher', libelle: 'Raccrocher', actif: false, danger: true, onClick: () => undefined },
    ],
    transfert: { libelle: 'Transférer à', numero: '102', vers: 'Mohamed', onEnLigne: true },
    pave: PAVE,
    boutons: { transferer: { libelle: 'Transférer à Mohamed', onClick: () => undefined }, appeler: { libelle: 'Appeler', onClick: () => undefined } },
    joignables: [],
  };
  return (
    <ApercuBureau famille="echanger" sousPage="appels" fil={['Échanger', 'Appels et salles']} ajmani="Demande à Ajmani, ou dis ce que tu veux faire">
      <VueAppels {...v} etat="normal" libelles={libellesDe(tm as never)} combine={combine} actions={{ onInstantane: () => undefined, onProgrammer: () => undefined, onOuvrirSalle: () => undefined, onFiltre: setFiltre }} />
    </ApercuBureau>
  );
}

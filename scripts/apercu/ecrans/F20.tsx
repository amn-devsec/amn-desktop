/**
 * APERÇU « F20 » — Écrire et retenir, vue d'ensemble, dans l'état de l'image F20 : 126 pages, Mohamed écrit avec toi, une
 * relecture t'attend, 12 jours d'écriture, le vendredi 30 octobre 2026 à 10:42. Rendu par la VRAIE vue (`VueHub`),
 * composée par la VRAIE logique du lot (`composerHub`) sur des données FICTIVES de bac à sable : les prénoms, les titres,
 * Menna Conseil et les nombres sont ceux de la maquette et ne vivent qu'ici.
 *
 *   npm run apercu -- F20
 */
import React from 'react';
import { Archive, BookOpen, Plus, FileSignature, FileText, Folder, Lightbulb, Mic, PenLine, Layers } from 'lucide-react';
import { ApercuBureau } from '../coquille';
import { VueHub } from '../../../src/refonte/ecrire/ecrans/f20/VueHub';
import { composerHub } from '../../../src/refonte/ecrire/ecrans/f20/composer';
import { libellesDe, traduire } from '../../../src/refonte/ecrire/ecrans/f20/i18n';
import { motsParJour } from '../../../src/refonte/ecrire/serie';

const MAINT = '2026-10-30T09:42:00Z'; // 10:42 à Paris (heure d'hiver)
const iso = (j: string, hhmm: string) => `${j}T${hhmm}:00Z`;
const moi = 'aaron@exemple.test';
const prenoms: Record<string, string> = { 'aaron@exemple.test': 'Aaron', 'mohamed@exemple.test': 'Mohamed', 'riyad@exemple.test': 'Riyad' };

const page = (id: string, title: string, par: string, at: string, plus: object = {}) => ({
  id,
  title,
  parentId: null,
  espace: 'Clients' as const,
  clientId: null,
  blocs: [],
  auteurEmail: par,
  contributeurs: [par],
  modifieAt: at,
  modifieParEmail: par,
  favorisDe: [],
  ...plus,
});

const pages = [
  page('p1', 'Guide d’accueil', moi, iso('2026-10-26', '10:00')),
  page('p2', 'Procédure de sauvegarde, Roux Santé', 'mohamed@exemple.test', iso('2026-10-28', '15:00')),
  page('p3', 'Réunion du 28 oct.', 'riyad@exemple.test', iso('2026-10-29', '16:00')),
  page('p4', 'Plan de la semaine', moi, iso('2026-10-30', '08:12')),
  page('p5', 'Atelier Menna, préparation', moi, '2026-10-30T09:41:57Z', { contributeurs: [moi, 'mohamed@exemple.test'] }),
];

// 25 jours écrits en octobre, dont les 12 derniers de suite
const jours = Array.from({ length: 30 }, (_, i) => `2026-10-${String(i + 1).padStart(2, '0')}`).filter((j) => !['2026-10-04', '2026-10-11', '2026-10-16', '2026-10-17', '2026-10-18'].includes(j));
const mots = motsParJour(jours.map((j, i) => ({ jour: j, mots: 60 + ((i * 53) % 220) })));

export default function Apercu() {
  const tm = (c: string, p?: Record<string, string | number>) => traduire('fr', c as never, p);
  const vue = composerHub(
    {
      langue: 'fr',
      maintenant: MAINT,
      moi: { email: moi, prenom: 'Aaron' },
      prenomDe: (e) => prenoms[e] ?? e,
      pages,
      presences: [{ email: 'mohamed@exemple.test', pageId: 'p5', tapeA: '2026-10-30T09:41:55Z' }],
      filtre: 'toutes',
      mesures: { pages: 126, documents: 183, serieJournal: 12, brouillons: 1, modeles: 24, enAttenteDeSignature: 3, archives: 1482, articles: 38, lecturesDuMois: 214, dictees: 0 },
      modulesOuverts: null,
      documents: [
        { id: 'd1', titre: 'Rapport d’audit, Roux Santé', etat: 'Relecture demandée', relecteurEmail: moi, demandeurEmail: 'riyad@exemple.test', demandeAt: iso('2026-10-29', '10:00') },
        { id: 'd2', titre: 'Annonce de l’atelier', etat: 'Brouillon partagé', relecteurEmail: 'riyad@exemple.test', demandeurEmail: 'mohamed@exemple.test', demandeAt: iso('2026-10-30', '09:38') },
        { id: 'd3', titre: 'Offre Parc Sud 2027', etat: 'Relecture demandée', relecteurEmail: 'mohamed@exemple.test', demandeurEmail: moi, demandeAt: iso('2026-10-28', '11:00') },
        { id: 'd4', titre: 'Mandat de gestion, Cabinet Roux', etat: 'En signature', relecteurEmail: 'riyad@exemple.test', demandeurEmail: moi, demandeAt: iso('2026-10-28', '08:00') },
      ],
      signaturesActives: true,
      demandes: [
        { id: 's1', devis: true, envoyeAt: iso('2026-10-26', '09:00'), signataires: [{ id: 'a', ordre: 1, role: 'signataire', statut: 'Signé', envoyeAt: iso('2026-10-26', '09:00'), signeAt: iso('2026-10-27', '15:12') }] },
        { id: 's2', devis: true, envoyeAt: iso('2026-10-20', '09:00'), signataires: [{ id: 'b', ordre: 1, role: 'signataire', statut: 'Signé', envoyeAt: iso('2026-10-20', '09:00'), signeAt: iso('2026-10-22', '07:00') }] },
      ],
      mots,
      journal: [{ id: 'j1', auteurEmail: moi, jour: '2026-09-30', texte: 'Première vraie démonstration chez un client, tout s’est bien passé.' }] as never,
      notesRapides: Array.from({ length: 14 }, (_, i) => ({ id: `n${i}`, texte: `note ${i}`, creeeLe: '2026-10-20' })),
      apercuDe: () => ({
        cheminDe: ['Clients', 'Menna Conseil'],
        liee: 'reliée au rendez-vous de 11:00',
        blocs: [
          { type: 'titre', texte: 'Ce que Menna attend' },
          { type: 'texte', texte: 'Voir les utilisateurs actifs en haut du tableau de bord, et la carte des tickets juste en dessous.' },
          { type: 'tache', texte: 'Relire le compte rendu du 28 oct.', fait: true },
          { type: 'tache', texte: 'Préparer la démo des widgets', fait: true },
          { type: 'tache', texte: 'Chiffrer l’option tickets' },
          { type: 'titre', texte: 'Questions à poser' },
          { type: 'texte', texte: 'Qui valide les accès des nouveaux arrivants' },
        ],
      }),
      routes: { notes: '/notes', documents: '/classeur', journal: '/journal-de-bord', redaction: '/outils/redaction', modeles: '/outils/modeles', signatures: '/signature', archives: '/archives', connaissances: '/knowledge', dictee: '/dictee' },
      jourSemaineInitiales: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
    },
    tm,
    {
      onFiltre: () => undefined,
      onOuvrir: () => undefined,
      onNouvellePage: () => undefined,
      onPersonnaliser: () => undefined,
      onRanger: () => undefined,
      onNonRanger: () => undefined,
      icones: {
        notes: <FileText size={14} />,
        documents: <Folder size={14} />,
        journal: <BookOpen size={14} />,
        redaction: <PenLine size={14} />,
        modeles: <Layers size={14} />,
        signatures: <FileSignature size={14} />,
        archives: <Archive size={14} />,
        connaissances: <Lightbulb size={14} />,
        dictee: <Mic size={14} />,
        nouvellePage: <Plus size={13} />,
      },
      noms: { notes: 'Notes et pages', documents: 'Documents', journal: 'Journal', redaction: 'Rédaction et traduction', modeles: 'Modèles', signatures: 'Signatures', archives: 'Archives', connaissances: 'Base de connaissances', dictee: 'Dictée vocale' },
      libelles: libellesDe(tm as never, 9),
    },
  );
  return (
    <ApercuBureau famille="ecrire" sousPage="ensemble" fil={['Écrire et retenir', 'Vue d’ensemble']} ajmani="Demande à Ajmani : « Résume la réunion du 28 oct. en 5 lignes »">
      <VueHub {...vue} />
    </ApercuBureau>
  );
}

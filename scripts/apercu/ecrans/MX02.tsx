/**
 * APERÇU « MX02 » — Réunions, dans l'état de l'image MX02 : « Point facturation » en cours depuis 12 min, ses notes et ses
 * décisions, la suggestion de durée, « Point avec Menna » dans 18 min et quatre réunions à venir avec leur préparation.
 * Rendu par la VRAIE vue (`VueReunions`), composée par la VRAIE logique (`composerReunions`) sur des données FICTIVES.
 *
 *   npm run apercu -- MX02
 */
import React from 'react';
import { ApercuBureau } from '../coquille';
import { VueReunions } from '../../../src/refonte/echanger/ecrans/mx02/VueReunions';
import { composerReunions, type ReunionAffichable } from '../../../src/refonte/echanger/ecrans/mx02/composer';
import { libellesDe, traduire } from '../../../src/refonte/echanger/ecrans/mx02/i18n';

const MAINT = '2026-10-30T09:42:00Z'; // 10:42 à Paris
const NOMS: Record<string, string> = { aaron: 'Aaron', mohamed: 'Mohamed', riyad: 'Riyad', amina: 'Amina Menna' };
const sujets = (titres: string[], prepares: number, minutes = 10) => titres.map((titre, i) => ({ titre, minutes, prepare: i < prepares }));
const reunions: ReunionAffichable[] = [
  { id: 'r1', titre: 'Point facturation', debutPrevuAt: '2026-10-30T09:30:00Z', debutReelAt: '2026-10-30T09:30:00Z', dureePrevueMin: 30, participants: ['mohamed@ex.fr', 'riyad@ex.fr', 'aaron@ex.fr'], ordreDuJour: [{ titre: 'Factures de septembre', minutes: 6 }, { titre: 'Relances', minutes: 10 }, { titre: 'Pièces pour la TVA', minutes: 8 }, { titre: 'Divers', minutes: 6 }] },
  { id: 'r2', titre: 'Point avec Menna', debutPrevuAt: '2026-10-30T10:00:00Z', dureePrevueMin: 45, lieu: 'salle clients et visio', participants: ['aaron@ex.fr', 'amina@ex.fr'], documentNom: 'maquette-menna.pdf', ordreDuJour: [{ titre: 'Accueil et objectifs', minutes: 5, prepare: true }, { titre: 'Utilisateurs actifs en haut du tableau', minutes: 15, prepare: true }, { titre: 'Alerte des tickets urgents', minutes: 15 }, { titre: 'Date de livraison', minutes: 10 }], casesDePreparation: [{ libelle: 'Relire le compte rendu précédent', fait: true }, { libelle: 'Ouvrir le tableau de bord de Menna', fait: false }, { libelle: 'Préparer 3 questions', fait: false }] },
  { id: 'r3', titre: 'Atelier clients', debutPrevuAt: '2026-11-03T08:00:00Z', dureePrevueMin: 120, inscrits: 8, participants: ['aaron@ex.fr'], ordreDuJour: sujets(['a', 'b', 'c', 'd', 'e'], 2) },
  { id: 'r4', titre: 'Point facturation', debutPrevuAt: '2026-11-03T13:00:00Z', dureePrevueMin: 30, participants: ['aaron@ex.fr'], ordreDuJour: sujets(['a', 'b'], 2) },
  { id: 'r5', titre: 'Revue sécurité Roux', debutPrevuAt: '2026-11-04T09:00:00Z', dureePrevueMin: 60, lieu: 'visio', participants: ['aaron@ex.fr'], ordreDuJour: sujets(['a', 'b', 'c', 'd', 'e'], 3) },
  { id: 'r6', titre: 'Bilan de la semaine', debutPrevuAt: '2026-11-06T13:00:00Z', dureePrevueMin: 30, participants: ['aaron@ex.fr'], ordreDuJour: sujets(['a', 'b', 'c', 'd', 'e'], 1) },
];

export default function Apercu() {
  const tm = (c: string, p?: Record<string, string | number>) => traduire('fr', c as never, p);
  const v = composerReunions({
    langue: 'fr', maintenant: MAINT, moi: 'aaron@ex.fr', nom: (e) => NOMS[e.split('@')[0]] ?? e, reunions,
    enSalle: { vignettes: [{ email: 'mohamed@ex.fr', micro: true, parle: true }, { email: 'riyad@ex.fr', micro: false, parle: false }] },
    dureesReelles: [18, 17, 19],
    notes: {
      titre: 'Notes en direct', sous: 'prises par Riyad', curseur: false, saisie: false,
      lignes: [
        { heure: '10:31', texte: 'Septembre : 14 factures, 12 déjà payées.', decision: false },
        { heure: '10:36', texte: 'Atelier Sarah ne répond plus aux messages.', decision: false },
        { heure: '10:39', texte: 'Riyad appelle Atelier Sarah', decision: true },
        { heure: '10:42', texte: 'F-2041 à renvoyer à Menna avec le bon', decision: false },
      ],
    },
    actions: {
      titre: 'Décisions et actions', sous: 'vont dans Tâches', saisie: false,
      lignes: [
        { id: 'a1', avatar: 'R', texte: 'Appeler Atelier Sarah', sous: 'aujourd’hui', etat: { libelle: 'Tâche créée', ton: 'succes' } },
        { id: 'a2', avatar: 'M', texte: 'Renvoyer F-2041 à Menna', sous: 'demain', etat: { libelle: 'Tâche créée', ton: 'succes' } },
        { id: 'a3', avatar: 'A', texte: 'Valider le devis Medina', sous: 'lundi', etat: { libelle: 'À confirmer', ton: 'neutre' } },
      ],
    },
  });
  return (
    <ApercuBureau famille="echanger" sousPage="reunions" fil={['Échanger', 'Réunions']} ajmani="Demande à Ajmani, ou dis ce que tu veux faire">
      <VueReunions {...v} etat="normal" libelles={libellesDe(tm as never)} evenements={{ onPlanifier: () => undefined, onModeles: () => undefined, onRejoindre: () => undefined, onOuvrir: () => undefined, onSuggestion: () => undefined }} />
    </ApercuBureau>
  );
}

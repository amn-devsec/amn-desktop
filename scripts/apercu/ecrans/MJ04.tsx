/**
 * APERÇU « MJ04 » — Notes rapides (LOT-01), tel que sur l'image : vendredi 30 oct. 2026, onze notes dont quatre « à trier ».
 *
 *   npm run apercu -- MJ04
 *
 * Rendue par les VRAIS composants de l'écran (`VueNotes`) sur le modèle `modeleMur`. Les onze notes, les propositions de rangement et le
 * placement des colonnes sont FABRIQUÉS ICI d'après le tableau de la fiche MJ04 (données fictives : Menna, Cabinet Roux, Parc Sud, Boulangerie
 * Léo) ; rien de tout cela n'existe dans l'application, dont les notes n'ont ni type, ni étiquette, ni voix. Le « code du local » n'a AUCUNE
 * valeur : une note d'accès ne porte jamais son contenu.
 */
import React from 'react';
import { ApercuBureau } from '../coquille';
import { VueNotes, type ActionsNotes } from '../../../src/refonte/journee/notes/VueNotes';
import { modeleMur, type NoteEntree } from '../../../src/refonte/journee/notes/modele';

const AUJOURDHUI = '2026-10-30';
const ONDE = [0.3, 0.5, 0.4, 0.8, 0.6, 0.9, 0.5, 0.7, 0.4, 0.6, 0.85, 0.5, 0.35, 0.7, 0.9, 0.55, 0.4, 0.65, 0.8, 0.45, 0.3, 0.6, 0.75, 0.5, 0.4, 0.55, 0.7, 0.35, 0.3, 0.25];
const N = (o: Partial<NoteEntree> & Pick<NoteEntree, 'id' | 'titre' | 'updatedAt'>): NoteEntree => ({ corps: '', type: 'texte', etiquette: null, epinglee: false, ...o });

const notes: NoteEntree[] = [
  N({ id: 'n1', titre: 'Idée : bouton « Je suis arrivé »', corps: 'Le client touche un lien reçu par e-mail et toute l’équipe voit « Menna est arrivée ».', etiquette: 'Idée produit', ton: 'info', epinglee: true, updatedAt: '2026-10-30T09:12:00+01:00', puce: { genre: 'client', texte: 'Cabinet Roux, même besoin' } }),
  N({ id: 'n2', titre: 'Appeler le comptable', corps: 'Question sur la TVA du trimestre, à poser avant le 15.', etiquette: 'À faire', ton: 'attention', updatedAt: '2026-10-29T16:00:00+01:00', action: 'tache' }),
  N({ id: 'n3', titre: 'Note vocale', type: 'vocale', corps: '', etiquette: 'Vocale', updatedAt: '2026-10-30T08:05:00+01:00', precision: 'transcrite par Ajmani', dossier: 'vocales', vocale: { duree: '0:42', transcription: '« Commander deux bornes Wi-Fi pour la Boulangerie Léo. »', onde: ONDE, lu: 0 } }),
  N({ id: 'n4', titre: 'Courses pour le chantier Dupont', type: 'liste', etiquette: 'Chantier', updatedAt: '2026-10-26T10:00:00+01:00', items: [{ texte: 'Vis 4x40', fait: true }, { texte: 'Silicone', fait: false }, { texte: 'Gants', fait: true }, { texte: 'Bâches', fait: false }] }),
  N({ id: 'n5', titre: 'Code du local technique', type: 'acces', etiquette: 'Accès', epinglee: true, updatedAt: '2026-10-26T09:00:00+01:00', precision: 'visible par l’équipe, sur demande' }),
  N({ id: 'n6', titre: 'Phrase pour le site', type: 'citation', corps: '« La sécurité de l’entreprise, sans jargon. »', updatedAt: '2026-10-28T11:00:00+01:00', precision: 'pour la refonte Menna ?' }),
  N({ id: 'n7', titre: 'Remarque de Menna', corps: 'Veut voir le chiffre d’affaires tout en haut du tableau de bord, avant les tickets.', etiquette: 'Client', ton: 'info', updatedAt: '2026-10-23T14:00:00+01:00', puce: { genre: 'client', texte: 'Menna Conseil' } }),
  N({ id: 'n8', titre: 'Noms pour l’atelier', type: 'choix', choix: ['Atelier Horizon', 'Studio Nova', 'Forge'], etiquette: 'Idée', ton: 'info', updatedAt: '2026-10-24T09:00:00+01:00', precision: 'à voter mardi' }),
  N({ id: 'n9', titre: 'Horaires de la déchetterie', corps: '8 h 30 à 18 h, fermée le mardi. Badge pro à demander à l’accueil.', updatedAt: '2026-10-29T10:00:00+01:00' }),
  N({ id: 'n10', titre: 'Guide du routeur', type: 'lien', corps: 'La page d’aide du routeur du Parc Sud.', updatedAt: '2026-10-28T09:00:00+01:00', puce: { genre: 'lien', texte: 'parc-sud.fr/aide/routeur' } }),
  N({ id: 'n11', titre: 'Racheter du café', updatedAt: '2026-10-30T10:31:00+01:00' }),
];
// Le placement de l'image, colonne par colonne (la carte d'Ajmani ouvre la quatrième).
const COLONNES = [['n1', 'n2', 'n3'], ['n4', 'n5', 'n6'], ['n7', 'n8', 'n9'], ['n10', 'n11']];
const modele = modeleMur({
  notes, aujourdhui: AUJOURDHUI, colonnesImposees: COLONNES,
  propositions: [
    { cle: 'p1', note: 'Racheter du café', vers: 'Tâches' }, { cle: 'p2', note: 'Déchetterie', vers: 'Pages · Chantiers' },
    { cle: 'p3', note: 'Guide du routeur', vers: 'Client Parc Sud' }, { cle: 'p4', note: 'Phrase du site', vers: 'Projet Refonte Menna' },
  ],
});
const rien = () => undefined;
const ACTIONS: ActionsNotes = { noter: rien, dicter: rien, nouvelle: rien, filtre: rien, tri: rien, recherche: rien, ouvrir: rien, cocher: rien, faireTache: rien, lire: rien, afficher: rien, toutRanger: rien, uneParUne: rien, reessayer: rien };

export default function Apercu() {
  return (
    <ApercuBureau famille="jour" sousPage="notes" fil={['Ma journée', 'Notes rapides']} ajmani="Dicte ou écris une note, Ajmani la range pour toi">
      <VueNotes statut="pret" modele={modele} filtre="toutes" tri="recentes" recherche="" actions={ACTIONS} />
    </ApercuBureau>
  );
}

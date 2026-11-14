/**
 * APERÇU « H14 » — Annonces, le tableau de l'équipe, dans l'état de l'image H14 : « Maintenance ce soir à 22 h » à la une
 * (lue par 2 sur 3), cinq notes en mosaïque, le brouillon en place, « Presque à jour », les catégories, la suggestion
 * d'Ajmani et la nouveauté du produit. Rendu par la VRAIE vue (`VueAnnonces`), composée par la VRAIE logique
 * (`composerAnnonces`) sur des données FICTIVES de bac à sable.
 *
 *   npm run apercu -- H14
 */
import React, { useState } from 'react';
import { ApercuBureau } from '../coquille';
import { VueAnnonces } from '../../../src/refonte/echanger/ecrans/h14/VueAnnonces';
import { composerAnnonces, type AnnonceAffichable } from '../../../src/refonte/echanger/ecrans/h14/composer';
import { libellesDe, traduire } from '../../../src/refonte/echanger/ecrans/h14/i18n';

const MAINT = '2026-10-30T09:42:00Z'; // 10:42 à Paris
const equipe = [{ email: 'mohamed@ex.fr', nom: 'Mohamed' }, { email: 'riyad@ex.fr', nom: 'Riyad' }, { email: 'aaron@ex.fr', nom: 'Aaron' }];
const rx = (email: string, type: 'bien-note' | 'merci' | 'question') => ({ email: `${email}@ex.fr`, type });
const annonces: AnnonceAffichable[] = [
  { id: 'u', auteurEmail: 'mohamed@ex.fr', auteurNom: 'Mohamed', publieeAt: '2026-10-30T08:12:00Z', titre: 'Maintenance ce soir à 22 h', texte: 'Les sauvegardes et la mise à jour du serveur démarrent à 22 h. Le service reste disponible, la messagerie peut ralentir une dizaine de minutes. Rien à faire de ton côté.', categorie: 'Technique', epinglee: true, confirmations: [{ email: 'riyad@ex.fr', at: '2026-10-30T08:41:00Z' }], reactions: [rx('riyad', 'bien-note'), rx('mohamed', 'bien-note'), rx('riyad', 'merci')] },
  { id: 'd', auteurEmail: 'riyad@ex.fr', auteurNom: 'Riyad', publieeAt: '2026-10-29T16:40:00Z', titre: 'Nouvelle maquette de la connexion', texte: 'La version mobile est prête. Tes retours dans la page Design avant lundi, merci.', categorie: 'Design', epinglee: false, confirmations: [{ email: 'mohamed@ex.fr' }, { email: 'aaron@ex.fr' }], reactions: [rx('mohamed', 'merci'), rx('aaron', 'merci')] },
  { id: 'e', auteurEmail: 'aaron@ex.fr', auteurNom: 'Aaron', publieeAt: '2026-10-26T10:00:00Z', titre: 'Bureau fermé le 11 novembre', texte: 'Les astreintes restent assurées par Riyad, joignable au standard.', categorie: 'Équipe', epinglee: false, confirmations: [{ email: 'mohamed@ex.fr' }, { email: 'riyad@ex.fr' }], reactions: [rx('mohamed', 'bien-note'), rx('riyad', 'bien-note'), rx('aaron', 'bien-note')] },
  { id: 'c', auteurEmail: 'aaron@ex.fr', auteurNom: 'Aaron', publieeAt: '2026-10-26T09:00:00Z', titre: 'Bienvenue à Menna dans son espace', texte: 'Son tableau de bord est prêt, ses tickets urgents arrivent chez Mohamed.', categorie: 'Clients', epinglee: false, confirmations: [{ email: 'mohamed@ex.fr' }, { email: 'riyad@ex.fr' }], reactions: [rx('mohamed', 'merci'), rx('riyad', 'merci'), rx('aaron', 'merci')] },
  { id: 't', auteurEmail: 'mohamed@ex.fr', auteurNom: 'Mohamed', publieeAt: '2026-10-23T09:00:00Z', titre: 'Test de restauration chaque vendredi', texte: 'Un poste restauré depuis la sauvegarde chaque vendredi. Le rapport arrive dans Documents.', categorie: 'Technique', epinglee: false, confirmations: [{ email: 'aaron@ex.fr' }], reactions: [rx('aaron', 'question')] },
  { id: 'q', auteurEmail: 'riyad@ex.fr', auteurNom: 'Riyad', publieeAt: '2026-10-20T09:00:00Z', titre: 'Nouveau modèle de devis', texte: 'Plus court, avec le récapitulatif en tête. Déjà dans Modèles.', categorie: 'Clients', epinglee: false, confirmations: [{ email: 'mohamed@ex.fr' }, { email: 'aaron@ex.fr' }] },
];

export default function Apercu() {
  const [filtre, setFiltre] = useState<string | null>(null);
  const tm = (c: string, p?: Record<string, string | number>) => traduire('fr', c as never, p);
  const v = composerAnnonces({
    langue: 'fr', maintenant: MAINT, moi: 'aaron@ex.fr', equipe, annonces,
    avecCategories: true, avecReactions: true, filtre,
    brouillon: { titre: '', texte: '', epingler: false },
    nouveaute: 'Les réactions arrivent sur les annonces : un clic suffit, sans message.',
    rappelAvantMs: 12 * 3_600_000,
  });
  return (
    <ApercuBureau famille="echanger" sousPage="annonces" fil={['Échanger', 'Annonces']} ajmani="Demande à Ajmani, ou dis ce que tu veux faire">
      <VueAnnonces
        {...v}
        etat="normal"
        libelles={libellesDe(tm as never)}
        actions={{ onPublier: () => undefined, onReglages: () => undefined, onJaiLu: () => undefined, onRepondre: () => undefined, onReaction: () => undefined, onOuvrir: () => undefined, onCategorie: setFiltre, onBrouillon: () => undefined, onEnvoyerBrouillon: () => undefined, onProgrammer: () => undefined, onNonMerci: () => undefined }}
      />
    </ApercuBureau>
  );
}

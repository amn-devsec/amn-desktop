/**
 * APERÇU « MR02 » — Créer · Ma page publique (v4), sur les pages FICTIVES de SIM. Le contenu du site d'exemple, les visites
 * et l'avis en attente d'accord sont posés ici (le jeu n'en a pas).
 *
 *   npm run apercu -- MR02
 */
import React, { useState } from 'react';
import { VuePage, type SectionVue } from '../../../src/refonte/creer/ecrans/MR02/VuePage';
import { bilanDesVisites, recordDepuis } from '../../../src/refonte/creer/pagePublique';
import { ajouterJours } from '../../../src/refonte/creer/commun';
import { ApercuBureau } from '../coquille';

const jour = '2026-10-30';
const sections: SectionVue[] = [
  { id: 's1', titre: 'Bandeau d’accueil', versionEnLigne: 3, versionTravail: 3, corps: ['Votre informatique, sereine.', 'Cybersécurité et dépannage pour les TPE, expliqués simplement.'] },
  { id: 's2', titre: 'Offre phare', versionEnLigne: 2, versionTravail: 2 },
  { id: 's3', titre: 'Prendre rendez-vous', versionEnLigne: 2, versionTravail: 2 },
  { id: 's4', titre: 'Tarifs', versionEnLigne: 5, versionTravail: 5, corps: ['Essentiel · 49 € / mois', 'Sérénité · 89 € / mois', 'Sur mesure · Sur devis'] },
  { id: 's5', titre: 'Avis clients', versionEnLigne: 4, versionTravail: 5, nature: 'avis', corps: ['Ils nous font confiance · 4,6 sur 5 · 15 avis', '« Réactifs et clairs, enfin un vrai interlocuteur. » Sophie M.'] },
  { id: 's6', titre: 'Contact', versionEnLigne: 1, versionTravail: 2, aVerifier: true, nature: 'formulaire' },
  { id: 's7', titre: 'Mentions légales', versionEnLigne: null, versionTravail: 1, brouillon: true },
];
const serie = Array.from({ length: 14 }, (_, i) => ({ jour: ajouterJours(jour, i - 13), visites: i < 7 ? 150 + i * 10 : [160, 180, 210, 235, 260, 90, 235][i - 7] }));
const visites = { ...bilanDesVisites(serie, jour), record: recordDepuis([...serie, ...Array.from({ length: 60 }, (_, i) => ({ jour: ajouterJours(jour, -74 + i), visites: 120 }))], jour)?.mois ?? null };

export default function Apercu() {
  const [actif, setActif] = useState('s5');
  return (
    <ApercuBureau famille="creer" sousPage="minisite" fil={['Créer et produire', 'Ma page publique']}>
      <VuePage
        nomSite="AMN DevSec" adresse="amndevsec.fr" sections={sections} actifId={actif} onChoisir={setActif}
        droits={{ ecrire: true, publier: true, enLigne: true }} derniere="mardi 16:20" visites={visites}
        coches={new Set(['ctrl-s4'])} onCocher={() => undefined}
        libelleControle={(m, t) => (m === 'tester-formulaire' ? 'Tester le formulaire de contact' : m === 'accord-avis' ? 'Ajouter 2 avis récents' : `Relire la page ${t}`)}
        suggestion="Un 3e avis 5 étoiles est arrivé hier, de Karim B. (Garage Benali). Je lui demande s’il accepte d’être cité avant de l’afficher."
      />
    </ApercuBureau>
  );
}

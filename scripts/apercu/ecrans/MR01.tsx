/**
 * APERÇU « MR01 » — Créer · Vidéo (v4), sur les vidéos FICTIVES de SIM. Plans, sous-titres, voix off et retours de relecture
 * de l'aperçu sont posés ici (le jeu n'en a pas).
 *
 *   npm run apercu -- MR01
 */
import React from 'react';
import { construireMonde } from '../../../src/refonte/donnees';
import { VueVideo } from '../../../src/refonte/creer/ecrans/MR01/VueVideo';
import { lignesDeLaListe } from '../../../src/refonte/creer/ecrans/MR01/modele';
import { serieUneVideoParSemaine, sousTitreDePage, type Commentaire } from '../../../src/refonte/creer/video';
import { ApercuBureau } from '../coquille';

const monde = construireMonde();
const jour = monde.contexte.aujourdhui;
const videos = monde.videos.map((v) => ({ id: v.id, titre: v.titre, etape: v.etape, avancement: v.avancement, prevueLe: v.prevueLe, vues: v.vues, publieeLe: v.etape === 'Publiée' ? v.prevueLe : null }));
const actif = videos.find((v) => v.etape === 'Montage' || v.etape === 'Relecture') ?? videos[0];
const retours: Commentaire[] = [
  { id: 'r1', auteur: 'Mohamed', t: 12, texte: 'Le logo peut être un peu plus grand.', etat: 'À traiter' },
  { id: 'r2', auteur: 'Riyad', t: 47, texte: 'Le sous-titre arrive une demi-seconde trop tard.', etat: 'À traiter' },
  { id: 'r3', auteur: 'Aaron', t: 78, texte: 'Ajouter l’adresse du site à la fin.', etat: 'Traité' },
];
const plans = [['Logo', 0, 6], ['Aaron face caméra', 6, 22], ['Interview Menna Conseil', 22, 48], ['Écran : tableau de bord', 48, 70], ['Équipe à l’atelier', 70, 84], ['Fin', 84, 90]] as const;
const phrases = ['Bonjour', 'Ici Aaron', 'Chez Menna', 'Depuis un an', 'Zéro panne', 'Tout est clair', 'Le tableau', 'En direct', 'Une équipe proche', 'À bientôt'];

export default function Apercu() {
  const sous = sousTitreDePage(actif, retours);
  return (
    <ApercuBureau famille="creer" sousPage="video" fil={['Créer et produire', 'Vidéo']}>
      <VueVideo
        sousTitre={`${actif.titre} presque prête · ${sous.retoursATraiter} retours de relecture à traiter`}
        videos={lignesDeLaListe(videos, 'fr')}
        actifId={actif.id}
        onChoisir={() => undefined}
        serie={serieUneVideoParSemaine(['2026-09-28', '2026-10-05', '2026-10-19', '2026-10-27'], jour)}
        enregistre="Enregistré à l’instant"
        suggestion
        ouverte={{
          id: actif.id, titre: actif.titre, version: 4, dureeSec: 90, tete: 41, planSelectionneId: 'p2', publiee: false,
          plans: plans.map(([nom, debut, fin], i) => ({ id: `p${i}`, nom, debut, fin })), retours,
          sousTitres: phrases.map((texte, i) => ({ texte, debut: i * 9, fin: i * 9 + 8, retour: texte === 'Tout est clair' })),
          voix: [{ debut: 6, fin: 22 }, { debut: 48, fin: 70 }], musique: { type: 'musique', niveauDb: -18 },
        }}
      />
    </ApercuBureau>
  );
}

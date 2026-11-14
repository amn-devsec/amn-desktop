/**
 * APERÇU « H17 » — Créer · Visuels et marque (v4), sur la marque FICTIVE de SIM (`Maison Vallon`). Rôles et parts de
 * couleur, règles « à éviter » et date de mise à jour sont posés ici (le jeu n'en a pas).
 *
 *   npm run apercu -- H17
 */
import React from 'react';
import { construireMonde } from '../../../src/refonte/donnees';
import { VueMarque } from '../../../src/refonte/creer/ecrans/H17/VueMarque';
import { ApercuBureau } from '../coquille';

const m = construireMonde().marque[0];
const roles = ['Fond', 'Cartes', 'Texte', 'Texte discret', 'Succès, accent', 'Information'];
const parts = [58, 24, 9, 5, 3, 1];

export default function Apercu() {
  return (
    <ApercuBureau famille="creer" sousPage="brand" fil={['Créer et produire', 'Visuels et marque']}>
      <VueMarque
        nom={m.nom}
        marque={{
          monogramme: m.nom[0], logos: m.logos, typographie: m.typographie, modelesVisuels: m.modelesVisuels, modeleChoisi: m.modelesVisuels[0]?.nom,
          palette: m.palette.map((c, i) => ({ ...c, role: roles[i], part: parts[i] })), reglesAEviter: ['étiré', 'penché', 'fond chargé', 'effets'], modifieePar: 'Riyad', modifieeLe: '18 oct.',
        }}
      />
    </ApercuBureau>
  );
}

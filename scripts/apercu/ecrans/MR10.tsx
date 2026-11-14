/**
 * APERÇU « MR10 » — Créer · Photos de chantier (v4), sur des dossiers FICTIFS. Les photos sont des repères dessinés (jamais d'image) ;
 * les comptes, les dates et les auteurs sont posés ici pour que le chantier Dupont ait 36 photos (7 + 21 + 8).
 *
 *   npm run apercu -- MR10
 */
import React, { useState } from 'react';
import { construireMonde } from '../../../src/refonte/donnees';
import { VuePhotos, type DossierVue, type PhotoVue } from '../../../src/refonte/creer/ecrans/MR10/VuePhotos';
import '../../../src/refonte/creer/creer.css';
import { ApercuBureau } from '../coquille';

const monde = construireMonde();
const jour = monde.contexte.aujourdhui;
const j = (n: number) => { const [a, m, d] = jour.split('-').map(Number); return new Date(Date.UTC(a, m - 1, d + n)).toISOString().slice(0, 10); };

/** `n` photos réparties sur les jours `jours` (décalages par rapport à aujourd'hui). */
const lot = (id: string, phase: PhotoVue['phase'], n: number, jours: number[], extra: Partial<PhotoVue> = {}): PhotoVue[] =>
  Array.from({ length: n }, (_, i) => ({ id: `${id}${phase[0]}${i}`, phase, le: j(jours[Math.min(jours.length - 1, Math.floor((i * jours.length) / n))]), auteur: 'Riyad', ...extra }));

const DOSSIERS: DossierVue[] = [
  { id: 'd1', nom: 'Chantier Dupont', signatureClient: true, responsable: 'Riyad', photos: [...lot('d1', 'Avant', 7, [-18], { lieu: 'Salle de bain', orientationDeg: 90 }), ...lot('d1', 'Pendant', 9, [-10]), ...lot('d1', 'Pendant', 12, [-7]).map((x) => ({ ...x, id: `${x.id}b` })), ...lot('d1', 'Après', 8, [-2], { lieu: 'Salle de bain', orientationDeg: 94 })] },
  { id: 'd2', nom: 'Boulangerie Léo', signatureClient: false, photos: [...lot('d2', 'Avant', 5, [-12]), ...lot('d2', 'Pendant', 9, [-9, -6]), ...lot('d2', 'Après', 4, [-12])] },
  { id: 'd3', nom: 'Cabinet Roux', signatureClient: false, photos: [...lot('d3', 'Avant', 6, [-20]), ...lot('d3', 'Pendant', 12, [-16, -13, -9]), ...lot('d3', 'Après', 6, [-4])] },
  { id: 'd4', nom: 'Atelier Sarah', signatureClient: false, responsable: 'Riyad', termineLe: j(-5), photos: lot('d4', 'Avant', 9, [-6]) },
  { id: 'd5', nom: 'Clinique du Parc', signatureClient: true, photos: [...lot('d5', 'Avant', 10, [-24]), ...lot('d5', 'Pendant', 22, [-20, -17, -14, -12, -9]), ...lot('d5', 'Après', 10, [-6])] },
  { id: 'd6', nom: 'Garage Benali', signatureClient: false, photos: [], debutPrevuLe: j(5) },
];

export default function Apercu() {
  const [ouvert, setOuvert] = useState<string | null>('d1');
  return (
    <ApercuBureau famille="creer" sousPage="photosChantier" fil={['Créer et produire', 'Photos de chantier']}>
      <VuePhotos dossiers={DOSSIERS} ouvertId={ouvert} onOuvrir={setOuvert} aujourdhui={jour} onPartager={() => undefined} />
    </ApercuBureau>
  );
}

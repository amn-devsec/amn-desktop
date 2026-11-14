/**
 * APERÇU « MR11 » — Créer · Qualité et contrôles (v4), sur des contrôles FICTIFS. Le contrôle « Câblage baie Roux » (22 points :
 * 17 conformes, 2 non conformes, 3 à vérifier) et les 17 écarts du mois sont posés ici ; le jeu de SIM n'a ni sections ni écarts datés.
 *
 *   npm run apercu -- MR11
 */
import React, { useState } from 'react';
import { construireMonde } from '../../../src/refonte/donnees';
import { VueQualite, type ControleVue, type PointVue } from '../../../src/refonte/creer/ecrans/MR11/VueQualite';
import type { EcartEntree, Verdict } from '../../../src/refonte/creer/qualite';
import { ApercuBureau } from '../coquille';

const monde = construireMonde();
const jour = monde.contexte.aujourdhui;
const j = (n: number) => { const [a, m, d] = jour.split('-').map(Number); return new Date(Date.UTC(a, m - 1, d + n)).toISOString().slice(0, 10); };

/** 22 points en deux sections ; les verdicts 01-04 et 07-10 sont ceux de l'image, le reste est posé pour compter 17 + 2 + 3. */
const LIBELLES: [string, string, boolean?][] = [
  ['Baie fixée au mur, 4 points d’ancrage', 'a', true], ['Onduleur branché et testé', 'a'], ['Câble d’alimentation fixé sous la baie', 'a', true], ['Mise à la terre de la baie vérifiée', 'a'], ['Ventilation de la baie dégagée', 'a'], ['Prise secteur dédiée', 'a'],
  ['Étiquettes aux deux extrémités de chaque câble', 'b', true], ['Plan de brassage à jour et imprimé', 'b'], ['Rayon de courbure respecté', 'b'], ['Test de chaque prise, 24 sur 24', 'b', true],
  ...Array.from({ length: 12 }, (_, i): [string, string] => [`Point de vérification ${11 + i}`, 'b']),
];
const verdict = (i: number): Verdict => (i === 2 || i === 6 ? 'non-conforme' : i === 7 || i === 15 || i === 19 ? 'a-verifier' : 'conforme');
const points: PointVue[] = LIBELLES.map(([libelle, sectionId, photo], i) => ({
  id: `p${i}`, numero: String(i < 6 ? i + 1 : i + 1).padStart(2, '0'), sectionId, libelle, photo, verdict: verdict(i),
  note: i === 2 ? { texte: 'Attache manquante, le câble pend sur 40 cm.', ton: 'orange', responsable: 'Riyad', echeance: 'demain 09:00' } : i === 6 ? { texte: '6 câbles sans étiquette sur le panneau B.', ton: 'rouge', responsable: 'Riyad', echeance: 'demain 09:00' } : undefined,
}));
const instant = (n: number, h: string) => `${j(n)}T${h}:00+01:00`;
/** Un contrôle signé de 20 points, dont 19 conformes et un sans objet : 95 % de conformité. */
const signe = (id: string, titre: string, auteur: string, n: number, h: string): ControleVue => ({
  id, titre, auteur, instant: instant(n, h), signeLe: j(n), sections: [{ id: 'a', titre: '' }],
  points: Array.from({ length: 20 }, (_, i): PointVue => ({ id: `q${i}`, numero: String(i + 1).padStart(2, '0'), sectionId: 'a', libelle: `Point ${i + 1}`, verdict: i === 19 ? 'sans-objet' : i === 18 ? 'non-conforme' : 'conforme' })),
});
const AUTRES = Array.from({ length: 24 }, (_, i): ControleVue => signe(`a${i}`, `Contrôle ${i + 1}`, 'Aaron', -2 - (i % 20), '10:00'));
const CONTROLES: ControleVue[] = [
  signe('jour', 'Contrôle du jour', 'Mohamed', 0, '09:10'),
  { id: 'roux', titre: 'Câblage baie Roux', auteur: 'Riyad', instant: instant(-1, '16:40'), lieu: 'Cabinet Roux', sections: [{ id: 'a', titre: 'Baie et alimentation' }, { id: 'b', titre: 'Étiquetage et brassage' }], points },
  ...AUTRES,
];

const CAUSES: [string, number, string][] = [['Étiquettes', 7, 'Cabinet Roux'], ['Fixation', 4, 'Parc Sud'], ['Photos', 3, 'Léo'], ['Dossier', 2, 'Cabinet Roux'], ['Rangement', 1, 'Autres']];
const ECARTS: EcartEntree[] = CAUSES.flatMap(([cause, n], k) => Array.from({ length: n }, (_, i): EcartEntree => ({ id: `${cause}${i}`, cause, releveLe: j(-(i % 20)), lieu: k === 0 && i < 6 ? 'Cabinet Roux' : k === 1 && i < 4 ? 'Parc Sud' : i === 0 && k === 2 ? 'Léo' : ['Léo', 'Léo', 'Atelier', 'Dépôt'][(i + k) % 4] })));

export default function Apercu() {
  const [controles, setControles] = useState(CONTROLES);
  return (
    <ApercuBureau famille="creer" sousPage="checklists" fil={['Créer et produire', 'Qualité et contrôles']}>
      <VueQualite
        controles={controles}
        ecarts={ECARTS}
        aujourdhui={jour}
        ecartsParControle={Object.fromEntries(AUTRES.map((c, i) => [c.id, i < 17 ? 0 : 1]))}
        indexInitial={1}
        onVerdict={(cid, pid, v) => setControles((l) => l.map((c) => (c.id === cid ? { ...c, points: c.points.map((x) => (x.id === pid ? { ...x, verdict: v } : x)) } : c)))}
        onSigner={() => undefined}
        onAction={() => undefined}
        suggestion={{ titre: 'Corriger chez Roux', texte: 'Deux écarts sur le câblage. Je planifie 30 minutes demain à 09:00 avec Riyad, le client est prévenu.' }}
      />
    </ApercuBureau>
  );
}

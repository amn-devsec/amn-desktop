/**
 * APERÇU « H16 » — Créer · Chantiers (v4), sur les jeux FICTIFS de SIM (30 oct. 2026). Les interventions et la livraison
 * de l'aperçu sont posées ici (le jeu n'en a pas) ; les poids d'étape aussi, pour montrer l'avancement pondéré.
 *
 *   npm run apercu -- H16
 */
import React, { useState } from 'react';
import { construireMonde } from '../../../src/refonte/donnees';
import { VueChantiers } from '../../../src/refonte/creer/ecrans/H16/VueChantiers';
import { modeleDesChantiers } from '../../../src/refonte/creer/ecrans/H16/modele';
import { ajouterJours, semaineIso } from '../../../src/refonte/creer/commun';
import { ApercuBureau } from '../coquille';

const monde = construireMonde();
const jour = monde.contexte.aujourdhui;
const semaine = semaineIso(jour).semaine;
const chantiers = monde.chantiers.map((c, i) => ({
  id: c.id, nom: c.nom.split(' — ')[0], objet: c.nom.split(' — ')[1] ?? '', debutLe: c.debutLe, finPrevueLe: c.finPrevueLe, budgetCents: c.budgetCents, depenseCents: c.depenseCents,
  etapes: c.etapes.slice(0, 5).map((e, k) => ({ nom: e.nom, semaine: e.semaine > 40 ? e.semaine : semaine + k - 1, faite: e.faite, poids: 10 + k * 5, partRealisee: !e.faite ? 0.4 : undefined, equipe: [c.equipe[(i + k) % Math.max(1, c.equipe.length)] ?? 'M'] })),
}));
const ouvert = chantiers.find((c) => c.etapes.some((e) => e.faite) && c.etapes.some((e) => !e.faite)) ?? chantiers[0];
const interventions = [
  { id: 'i1', chantierId: ouvert.id, jour: ajouterJours(jour, 3), debut: '08:00', libelle: 'Pose des prises', equipe: ['M', 'R'] },
  { id: 'i2', chantierId: chantiers[1]?.id ?? ouvert.id, jour: ajouterJours(jour, 3), debut: '14:00', libelle: 'Audit du tableau', equipe: ['A'] },
  { id: 'i3', chantierId: chantiers[2]?.id ?? ouvert.id, jour: ajouterJours(jour, 5), debut: '08:00', libelle: 'Dépose du laboratoire', equipe: ['M'] },
];
const livraisons = [{ chantierId: ouvert.id, jour: ajouterJours(jour, 4), libelle: 'Livraison Rexel et Legrand' }];

export default function Apercu() {
  const [vue, setVue] = useState<'plans' | 'liste' | 'carte'>('plans');
  const modele = modeleDesChantiers({ chantiers, interventions, livraisons, aujourdhui: jour, ouvertId: ouvert.id, langue: 'fr' });
  return (
    <ApercuBureau famille="creer" sousPage="assembly" fil={['Créer et produire', 'Chantiers']}>
      <VueChantiers modele={modele} vue={vue} onVue={setVue} onOuvrir={() => undefined}
        suggestion={{ titre: 'Risque de retard sur le chantier ouvert', texte: 'La livraison arrive après la pose prévue. Je décale la fin de la pose et je préviens le client ?' }} />
    </ApercuBureau>
  );
}

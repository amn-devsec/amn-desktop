/**
 * APERÇU « MR04 » — Créer · Matériel (v4), sur les équipements FICTIFS de SIM. Les mouvements du jour, les prêts datés et le
 * dernier entretien sont posés ici (le jeu n'en a pas).
 *
 *   npm run apercu -- MR04
 */
import React, { useState } from 'react';
import { construireMonde } from '../../../src/refonte/donnees';
import { VueMateriel, type EquipementVue } from '../../../src/refonte/creer/ecrans/MR04/VueMateriel';
import { ApercuBureau } from '../coquille';

const monde = construireMonde();
const jour = monde.contexte.aujourdhui;
const equipements: EquipementVue[] = monde.equipements.map((e, i) => ({
  id: e.id, nom: e.nom, numero: e.serie.replace('N° ', ''), categorie: e.categorie, etat: e.etat, affectation: i % 3 === 0 ? { type: 'personne', libelle: ['Riyad', 'Aaron', 'Mohamed'][i % 3], depuisLe: 'lundi' } : e.affectation,
  prochainEntretienLe: e.prochainEntretienLe, periodiciteMois: e.periodiciteMois, reforme: e.statut === 'Au rebut', modifieLe: e.achatLe,
}));

export default function Apercu() {
  const [faits, setFaits] = useState<ReadonlySet<string>>(new Set());
  return (
    <ApercuBureau famille="creer" sousPage="equipment" fil={['Créer et produire', 'Matériel']}>
      <VueMateriel
        equipements={equipements} aujourdhui={jour} utilisateur="Aaron" faitsDuMois={faits}
        onCocher={(id) => setFaits((s) => { const n = new Set(s); n.add(id); return n; })}
        mouvements={[
          { id: 'm1', heure: '08:02', qui: 'Riyad', texte: 'Riyad a pris le kit de câblage RJ45', icone: 'pret' },
          { id: 'm2', heure: '09:15', qui: 'Mohamed', texte: 'Mohamed a rendu l’escabeau 3 marches', icone: 'retour' },
          { id: 'm3', heure: '09:48', qui: 'Mohamed', texte: 'Mohamed a étalonné le testeur', icone: 'controle' },
        ]}
        suggestion={{ titre: 'Planifier la révision', texte: 'Un équipement est hors service depuis 12 jours. Je réserve un créneau de réparation chez le fournisseur.' }}
      />
    </ApercuBureau>
  );
}

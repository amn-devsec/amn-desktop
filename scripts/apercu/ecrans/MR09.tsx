/**
 * APERÇU « MR09 » — Créer · Flotte de véhicules (v4), sur des véhicules FICTIFS. Le jeu de SIM porte l'énergie, le niveau et
 * l'autonomie ; le conducteur, le lieu du garage, les notes de compteur et les échéances datées sont posés ici.
 *
 *   npm run apercu -- MR09
 */
import React, { useState } from 'react';
import { construireMonde } from '../../../src/refonte/donnees';
import { VueFlotte, type VehiculeVue } from '../../../src/refonte/creer/ecrans/MR09/VueFlotte';
import { ApercuBureau } from '../coquille';

const monde = construireMonde();
const jour = monde.contexte.aujourdhui;
const jours = (n: number) => { const [a, m, d] = jour.split('-').map(Number); return new Date(Date.UTC(a, m - 1, d + n)).toISOString().slice(0, 10); };

/** Trois véhicules : le premier du monde fictif donne la forme, les chiffres sont posés pour la capture. */
const VEHICULES: VehiculeVue[] = [
  {
    id: 'v1', nom: 'Renault Kangoo', plaque: 'GH-482-KT', energie: 'thermique', etat: 'En tournée', conducteur: 'Riyad', niveauPct: 62, autonomiePleineKm: 660,
    km: 84210, kmSemaine: 412, kmSur30Jours: 1700,
    echeances: [{ nom: 'Vidange', feminin: true, nature: 'km', intervalle: 5000, dernierKm: 84210 - 4200 }, { nom: 'Pneus hiver', nature: 'jours', intervalle: 365, le: jours(46) }],
  },
  {
    id: 'v2', nom: 'Peugeot e-Partner', plaque: 'FN-120-ZA', energie: 'electrique', etat: 'Disponible', conducteur: 'Aaron, cet après-midi', niveauPct: 78, autonomiePleineKm: 230, enCharge: true,
    km: 126480, kmSemaine: null, noteCompteur: 'en charge à l’atelier', kmSur30Jours: 600,
    echeances: [{ nom: 'Révision', feminin: true, nature: 'jours', intervalle: 365, le: jours(103) }],
  },
  {
    id: 'v3', nom: 'Citroën Berlingo', plaque: 'EP-905-LM', energie: 'thermique', etat: 'Au garage', lieu: 'Garage Lefèvre, Sannois', niveauPct: 35, autonomiePleineKm: 660,
    km: 61030, kmSemaine: null, noteCompteur: 'immobilisé depuis mardi', kmSur30Jours: 300,
    echeances: [{ nom: 'Contrôle technique', nature: 'jours', intervalle: 730, le: jours(21) }, { nom: 'Courroie', feminin: true, nature: 'jours', intervalle: 1460, le: jours(130) }],
  },
];

export default function Apercu() {
  const [coches, setCoches] = useState<ReadonlySet<string>>(new Set(['pneus']));
  return (
    <ApercuBureau famille="creer" sousPage="fleet" fil={['Créer et produire', 'Flotte de véhicules']}>
      <VueFlotte
        vehicules={VEHICULES}
        aujourdhui={jour}
        bilan={{ kmDuMois: 2140, variationCarburantPct: -6 }}
        echeancesFlotte={[{ nom: 'Assurance', feminin: true, nature: 'jours', intervalle: 365, le: jours(152) }]}
        coches={coches}
        prochainId="v3"
        onCocher={(id) => setCoches((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; })}
      />
    </ApercuBureau>
  );
}

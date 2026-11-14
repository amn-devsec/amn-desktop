/**
 * APERÇU « L01 » — Ma journée · Séries et jalons (v4), sur des données FICTIVES posées ici.
 *
 *   npm run apercu -- L01
 */
import React from 'react';
import '../../../src/refonte/creer/creer.css';
import '../../../src/refonte/journee/journee.css';
import { VueSeries } from '../../../src/refonte/journee/ecrans/L01/VueSeries';
import { MARQUES_BOITE_A_ZERO, MARQUES_RITUELS, MARQUES_TACHES, railDeCompteur } from '../../../src/refonte/journee/escalier';
import { ApercuBureau } from '../coquille';

export default function Apercu() {
  return (
    <ApercuBureau famille="jour" sousPage="series" fil={['Ma journée', 'Séries et jalons']}>
      <VueSeries
        serie={{ jours: 6, record: 21, prochainPalier: 10, joursAvantPalier: 4, boucleeAujourdhui: false, etat: 'en-cours', depart: '22 oct.', atteints: { 5: '28 oct.' } }}
        gestes={[{ id: 'g1', titre: 'Traiter les 3 tâches du jour', detail: '1 sur 3', fait: false }, { id: 'g2', titre: 'Zéro message non lu', detail: '2 restants', fait: false }, { id: 'g3', titre: 'Écrire dans le journal', detail: 'fait', fait: true }]}
        rails={[
          { id: 'taches', sous: 'cumul depuis mars', rail: railDeCompteur(87, MARQUES_TACHES) },
          { id: 'boite', sous: 'jours de suite', rail: railDeCompteur(4, MARQUES_BOITE_A_ZERO), ceSoir: true },
          { id: 'rituels', sous: 'matins faits', rail: railDeCompteur(14, MARQUES_RITUELS) },
        ]}
        facile={{ titre: 'Envoyer le bilan' }}
        medailles={[
          { id: 'm1', nom: 'Première facture', quand: '12 mars', icone: 'trophee' }, { id: 'm2', nom: 'Boîte à zéro', quand: 'hier', icone: 'enveloppe' },
          { id: 'm3', nom: 'Client 5 étoiles', quand: '2 oct.', icone: 'etoile' }, { id: 'm4', nom: 'Objectif du mois', quand: '1er oct.', icone: 'cible' }, { id: 'm5', nom: 'Série de 7 jours', quand: null, icone: 'eclair' },
        ]}
        equipe={{ complet: { quand: '14 sept.', initiales: ['A', 'M', 'R'] }, zeroImpaye: { jours: 21 }, incident: false }}
      />
    </ApercuBureau>
  );
}

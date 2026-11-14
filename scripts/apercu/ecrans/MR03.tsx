/**
 * APERÇU « MR03 » — Créer · Tournées (v4), sur les étapes FICTIVES de SIM du 30 oct. Les kilomètres, le véhicule, l'étape
 * « en route » et les positions du plan schématique sont posés ici (le jeu n'en a pas).
 *
 *   npm run apercu -- MR03
 */
import React, { useState } from 'react';
import { construireMonde } from '../../../src/refonte/donnees';
import { VueTournees, type EtapeVue } from '../../../src/refonte/creer/ecrans/MR03/VueTournees';
import { calculerHeures, gainDeLOptimisation, resumerTournee } from '../../../src/refonte/creer/tournees';
import { ApercuBureau } from '../coquille';

const monde = construireMonde();
const jour = monde.contexte.aujourdhui;
const brutes = monde.etapesTournee.filter((e) => e.jour === jour).sort((a, b) => a.ordre - b.ordre).slice(0, 5);
const entrees = brutes.map((e, i) => ({ id: e.id, lieu: e.lieu, trajetMin: 14 + i * 3, trajetKm: 9 + i * 2, dureeMin: e.dureeMin, heureFixee: e.heureFixee ? e.arriveePrevue : null, etat: i < 2 ? 'Fait' : i === 2 ? 'En route' : 'À faire', arriveeReelle: i < 2 ? e.arriveePrevue : null }));
const calc = calculerHeures('08:00', entrees);
const etapes: EtapeVue[] = calc.map((c, i) => ({ ...c, adresse: brutes[i].adresse }));
const points = [{ x: 14, y: 22 }, { x: 24, y: 30 }, { x: 40, y: 22 }, { x: 62, y: 70 }, { x: 22, y: 55 }, { x: 72, y: 25 }];

export default function Apercu() {
  const [periode, setPeriode] = useState<'aujourdhui' | 'demain' | 'semaine'>('aujourdhui');
  return (
    <ApercuBureau famille="creer" sousPage="rounds" fil={['Créer et produire', 'Tournées']}>
      <VueTournees
        sousTitre={`${etapes.length} étapes, ${resumerTournee(calc, {}).distanceKm} km, Riyad est en route`}
        dateLibelle="Vendredi 30 octobre" vehicule="Kangoo GH-482-KT" resume={resumerTournee(calc, {})} gain={gainDeLOptimisation({ km: 76, min: 135 }, { km: 64, min: 110 })}
        etapes={etapes} points={points} conducteur="Riyad" enRouteDans={18} retourVers="16:40"
        villes={[{ nom: 'Franconville', x: 12, y: 40 }, { nom: 'Sannois', x: 44, y: 20 }, { nom: 'Argenteuil', x: 26, y: 88 }, { nom: 'La Seine', x: 64, y: 82 }]}
        avantDepart={[{ id: 'a', libelle: 'Charger le matériel', fait: true }, { id: 'b', libelle: 'Prévenir le prochain client de l’arrivée', fait: true }, { id: 'c', libelle: 'Vérifier l’itinéraire', fait: false }]}
        suggestion="Je peux envoyer « Nous arrivons dans 30 minutes » aux deux prochains clients."
        periode={periode} onPeriode={setPeriode}
      />
    </ApercuBureau>
  );
}

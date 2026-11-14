/**
 * APERÇU « MJ02 » — Habitudes (LOT-01), tel que sur l'image : vendredi 30 oct. 2026, grille des quatre dernières semaines.
 *
 *   npm run apercu -- MJ02
 *
 * Rendue par les VRAIS composants de l'écran (`VueHabitudes`) sur le modèle `modeleRegularite`. Les six habitudes et leur historique sont
 * FABRIQUÉS ICI d'après le tableau de la fiche MJ02 (séries 21 j, 6 j, 9 j, 4 sem., 4 j ; « Boîte à zéro » manquée les quatre jeudis) : le jeu de
 * SIM n'a ni ces noms ni ces dates. Rien de tout cela n'existe dans l'application.
 */
import React from 'react';
import { ApercuBureau } from '../coquille';
import { VueHabitudes, type ActionsHabitudes } from '../../../src/refonte/journee/habitudes/VueHabitudes';
import { modeleRegularite, type HabitudeEntree } from '../../../src/refonte/journee/habitudes/modele';

const AUJOURDHUI = '2026-10-30';
const jours = (debut: string, fin: string): string[] => { const out: string[] = []; for (let d = new Date(`${debut}T12:00:00Z`); d <= new Date(`${fin}T12:00:00Z`); d = new Date(d.getTime() + 86_400_000)) out.push(d.toISOString().slice(0, 10)); return out; };
const sauf = (debut: string, fin: string, manques: readonly string[], valeur = 1): Record<string, number> => Object.fromEntries(jours(debut, fin).filter((j) => !manques.includes(j)).map((j) => [j, valeur]));
const H = (o: Partial<HabitudeEntree> & Pick<HabitudeEntree, 'id' | 'nom' | 'icone' | 'rythme' | 'historique'>): HabitudeEntree => ({ frequence: { type: 'tous les jours' }, mesure: { type: 'case' }, debut: '2026-09-01', moment: 'matin', ...o });

// Quelques jours manqués en septembre : la fenêtre précédente est un peu moins régulière (« +6 points »).
const SEPT = ['2026-09-09', '2026-09-10', '2026-09-14', '2026-09-16', '2026-09-21', '2026-09-23', '2026-09-28', '2026-09-30', '2026-10-01', '2026-10-02'];
const habitudes: HabitudeEntree[] = [
  H({ id: 'h1', nom: 'Planifier la journée', icone: 'sun', rythme: 'Tous les jours · le matin', historique: sauf('2026-09-01', AUJOURDHUI, ['2026-10-06', '2026-10-08', '2026-10-09', ...SEPT]) }),
  H({ id: 'h2', nom: 'Méditer 5 minutes', icone: 'pause', rythme: 'Tous les jours · au réveil', historique: sauf('2026-09-01', AUJOURDHUI, ['2026-10-07', '2026-10-11', '2026-10-15', '2026-10-17', '2026-10-24', ...SEPT]) }),
  H({ id: 'h3', nom: 'Lire 20 minutes', icone: 'book', rythme: 'Tous les jours · dans le train', moment: 'soir', historique: sauf('2026-09-01', AUJOURDHUI, ['2026-10-08', '2026-10-11', '2026-10-14', '2026-10-16', '2026-10-21', ...SEPT]) }),
  H({ id: 'h4', nom: 'Séance de sport', icone: 'zap', rythme: '3 fois par semaine', moment: 'journee', frequence: { type: 'fois par semaine', fois: 3 }, debut: '2026-10-05',
    historique: Object.fromEntries(['2026-10-05', '2026-10-07', '2026-10-09', '2026-10-12', '2026-10-14', '2026-10-16', '2026-10-19', '2026-10-21', '2026-10-23', '2026-10-26', '2026-10-28', '2026-10-30'].map((j) => [j, 1])) }),
  H({ id: 'h5', nom: 'Marcher 8 000 pas', icone: 'activity', rythme: 'Mesuré par le téléphone', moment: 'journee', mesure: { type: 'objectif', cible: 8000, unite: 'pas' }, detail: 'Mesuré par le téléphone',
    historique: { ...sauf('2026-09-01', '2026-10-29', ['2026-10-06', '2026-10-11', '2026-10-17', '2026-10-25', ...SEPT], 8400), [AUJOURDHUI]: 3200 } }),
  H({ id: 'h6', nom: 'Boîte à zéro', icone: 'mail', rythme: 'Avant 18 h, via la messagerie', moment: 'soir', detail: '12 messages, avant 18 h', historique: sauf('2026-09-01', '2026-10-29', ['2026-10-08', '2026-10-15', '2026-10-22', '2026-10-29', ...SEPT]) }),
];
const modele = modeleRegularite({ habitudes, aujourdhui: AUJOURDHUI, formater: (n) => new Intl.NumberFormat('fr-FR').format(n) });
const rien = () => undefined;
const ACTIONS: ActionsHabitudes = { nouvelle: rien, bibliotheque: rien, filtre: rien, cocher: rien, reserver: rien, garder: rien, ajouter: rien, reessayer: rien };

export default function Apercu() {
  return (
    <ApercuBureau famille="jour" sousPage="habitudes" fil={['Ma journée', 'Habitudes']} ajmani="Demande à Ajmani, ou dis ce que tu veux faire">
      <VueHabitudes statut="pret" modele={modele} filtre="toutes" actions={ACTIONS} />
    </ApercuBureau>
  );
}

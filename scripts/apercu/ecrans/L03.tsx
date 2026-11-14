/**
 * APERÇU « L03 » — Ma journée · Rituel du matin (v4, étape 4 ouverte), sur des données FICTIVES posées ici.
 *
 *   npm run apercu -- L03
 */
import React from 'react';
import '../../../src/refonte/creer/creer.css';
import '../../../src/refonte/journee/journee.css';
import { VueRituel } from '../../../src/refonte/journee/ecrans/L03/VueRituel';
import { equilibre, journeeQuiSeDessine, FENETRE_PAR_DEFAUT, PAUSE_PAR_DEFAUT, tempsLibre } from '../../../src/refonte/journee/matin';
import { ApercuBureau } from '../coquille';

const EVENEMENTS = [
  { id: 'e1', debut: 570, fin: 585, label: 'Stand-up' }, { id: 'e2', debut: 660, fin: 690, label: 'Rendez-vous Menna' },
  { id: 'e3', debut: 840, fin: 870, label: 'Point facturation' }, { id: 'e4', debut: 960, fin: 990, label: 'Bilan de la semaine' },
];
const PRIORITES = [
  { id: 'p1', rang: 1, label: 'Tableau de bord Menna', dureeMin: 75, avant: 1020 }, { id: 'p2', rang: 2, label: 'Facturation du mois', dureeMin: 90, avant: 840 },
  { id: 'p3', rang: 3, label: 'Medina, les accès', dureeMin: 30, avant: null },
];
const plan = journeeQuiSeDessine(FENETRE_PAR_DEFAUT, EVENEMENTS, PRIORITES, PAUSE_PAR_DEFAUT, 514);
const eq = equilibre(PRIORITES, 435);
void tempsLibre;

export default function Apercu() {
  return (
    <ApercuBureau famille="jour" sousPage="rituel" fil={['Ma journée', 'Rituel du matin']}>
      <VueRituel
        prenom="Aaron" dateTexte="Vendredi 30 octobre" jourNom="vendredi" soir={false}
        parcours={{ ouverte: 3, faites: [0, 1, 2], termine: false }}
        etapes={['nuit', 'argent', 'agenda', 'choses']}
        resumes={{
          nuit: { resume: 'Tout est en ordre · 37 menaces bloquées · ronde de 03:00 sans écart', details: [] },
          argent: { resume: '8 550 € à encaisser · 2 840 € en retard, une relance groupée est prête', details: [] },
          agenda: { resume: '5 rendez-vous · stand-up à 09:30, Menna à 11:00, point facturation à 14:00', details: [] },
        }}
        minutesEstimees={1} reprise={null}
        choisis={[
          { id: 'p1', rang: 1, urgent: true, categorie: null, titre: 'Valider le tableau de bord de Menna', dureeMin: 75, echeance: { type: 'avant', heure: '17:00' }, confier: null },
          { id: 'p2', rang: 2, urgent: false, categorie: 'Argent', titre: 'Préparer la facturation du mois', dureeMin: 90, echeance: { type: 'avant', heure: '14:00' }, confier: null },
          { id: 'p3', rang: 3, urgent: false, categorie: 'Client', titre: 'Répondre à Medina sur les accès', dureeMin: 30, echeance: { type: 'ce-soir' }, confier: null },
        ]}
        autres={[
          { id: 'a1', titre: 'Mettre à jour les tarifs 2027', contexte: null, categorie: 'Argent', echeance: { type: 'jour-court', jour: '2026-11-02', jourCourt: 'lun.' }, confier: 'Mohamed' },
          { id: 'a2', titre: 'Appeler Boulangerie Léo', contexte: 'relance de 640 €', categorie: 'Client', echeance: { type: 'aucune' }, confier: null },
          { id: 'a3', titre: 'Planifier l’atelier de mardi', contexte: '3 sous-tâches', categorie: null, echeance: { type: 'aucune' }, confier: null },
        ]}
        refus={false} resteCandidates={0} aucuneTache={false} erreur={false}
        jour={{ debut: 480, fin: 1140, maintenant: 514, blocs: plan.blocs, libreMin: eq.libreMin, totalMin: eq.totalMin, ratio: eq.ratio, phrase: 'marge', finPrevue: '17:00' }}
        reglages={{ ouverts: false, heure: '08:30', jours: [1, 2, 3, 4, 5] }}
        confirmation={null} termine={null}
        onContinuer={() => undefined} onRetour={() => undefined} onPasser={() => undefined} onRevoir={() => undefined} onChoisir={() => undefined} onRetirer={() => undefined}
        onDeplacer={() => undefined} onConfier={() => undefined} onConfirmerConfier={() => undefined} onAnnulerConfier={() => undefined} onCommencer={() => undefined}
        onRecommencer={() => undefined} onFocus={() => undefined} onJournee={() => undefined} onModifier={() => undefined} onNouvelleTache={() => undefined} onToutes={() => undefined}
        onReessayer={() => undefined} onReglages={() => undefined} onHeure={() => undefined} onJours={() => undefined}
      />
    </ApercuBureau>
  );
}

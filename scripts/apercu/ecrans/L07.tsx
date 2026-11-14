/**
 * APERÇU « L07 » — Ma journée · Défis d'équipe (v4), sur des données FICTIVES posées ici.
 *
 *   npm run apercu -- L07
 */
import React from 'react';
import '../../../src/refonte/creer/creer.css';
import '../../../src/refonte/journee/journee.css';
import { VueDefis } from '../../../src/refonte/journee/ecrans/L07/VueDefis';
import { relaisDeLaSemaine, totauxDeLaSemaine } from '../../../src/refonte/journee/relais';
import { ApercuBureau } from '../coquille';

const SEMAINE = [
  { jour: '2026-10-26', aTemps: 9, echus: 9, enAttente: 0 }, { jour: '2026-10-27', aTemps: 10, echus: 11, enAttente: 0 }, { jour: '2026-10-28', aTemps: 9, echus: 11, enAttente: 0 },
  { jour: '2026-10-29', aTemps: 12, echus: 13, enAttente: 0 }, { jour: '2026-10-30', aTemps: 7, echus: 8, enAttente: 4 },
];
const t = totauxDeLaSemaine(SEMAINE);
const non = () => undefined;

export default function Apercu() {
  return (
    <ApercuBureau famille="jour" sousPage="defis" fil={['Ma journée', 'Défis d’équipe']}>
      <VueDefis
        hero={{
          etat: 'normal', semaine: 44, fin: 'se termine ce soir à 19:00', titre: 'Boîte à zéro de l’équipe',
          regle: 'Aucun message client sans réponse plus de 4 h ouvrées. Tenu si la semaine finit à 90 % ou plus.',
          pct: t.taux, cible: 90, aTemps: t.aTemps, echus: t.echus, barres: relaisDeLaSemaine(SEMAINE, '2026-10-30'),
          action: { n: 4, age: '1 h 20', garde: true },
          apports: [
            { email: 'a@x.fr', nom: 'Aaron', role: '', moi: true, engagement: 'Je prends les messages du matin, avant 11 h.' },
            { email: 'm@x.fr', nom: 'Mohamed', role: '', moi: false, engagement: 'Je relaie l’après-midi, entre deux rendez-vous.' },
            { email: 'r@x.fr', nom: 'Riyad', role: '', moi: false, engagement: 'Je couvre la fin de journée et l’astreinte.' },
          ],
        }}
        enCours={[
          { id: 'z', titre: 'Zéro impayé pendant 30 jours', sous: 'défi du mois · encore 9 jours', valeur: '21 sur 30 j', pct: 70, ton: 'vert', icone: 'euro' },
          { id: 'i', titre: 'Une semaine sans incident', sous: 'plus que 26 heures', valeur: '142 sur 168 h', pct: 85, ton: 'bleu', icone: 'bouclier' },
        ]}
        participants={['Aaron', 'Mohamed', 'Riyad']}
        passes={[
          { id: 's43', semaine: 'S43', titre: 'Tickets urgents traités en moins de 1 h', issue: 'Tenu', score: '11 sur 12 · 92 %', medaille: 'cible' },
          { id: 's42', semaine: 'S42', titre: 'Note moyenne des clients à 4,5 ou plus', issue: 'Tenu', score: '4,6 sur 5', medaille: 'etoile' },
          { id: 's41', semaine: 'S41', titre: 'Relances envoyées le jour même', issue: 'Terminé', score: '78 % · objectif 85 %', medaille: 'envoi' },
          { id: 's40', semaine: 'S40', titre: 'Devis envoyés sous 48 h', issue: 'Tenu', score: '6 sur 6 · 100 %', medaille: 'document' },
        ]}
        resumePasses="3 tenus sur les 4 dernières semaines"
        celebrations={[
          { id: 'c1', etiquette: { type: 'aujourdhui' }, icone: 'trophee', titre: 'Riyad a clos 5 tickets', detail: 'un record pour lui, bravo' },
          { id: 'c2', etiquette: { type: 'hier' }, icone: 'coche', titre: 'Mohamed a livré le kanban', detail: 'Menna est ravie du résultat' },
          { id: 'c3', etiquette: { type: 'jour', jour: '2026-10-26', texte: 'Lun.' }, icone: 'euro', titre: 'Aaron a décroché Medina', detail: 'contrat de 2 800 € par an' },
          { id: 'c4', etiquette: { type: 'jour', jour: '2026-10-24', texte: 'Ven.' }, icone: 'etoile', titre: 'Série d’équipe : 14 jours', detail: 'aucun message oublié' },
          { id: 'c5', etiquette: { type: 'jour', jour: '2026-10-29', texte: 'Jeu.' }, icone: 'eclair', titre: 'Ticket urgent pris en 20 min', detail: 'le plus rapide du mois' },
        ]}
        fete="vendredi 6 novembre" seul={false} erreur={false} propositions={[]} proposition={{ ouverte: false }}
        onProposer={non} onFermerProposition={non} onEnvoyerProposition={non} onHistorique={non} onVoirAttente={non} onReserver={non} onNon={non} onInviter={non} onReessayer={non} onIdees={non} onPartager={non}
      />
    </ApercuBureau>
  );
}

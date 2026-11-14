/**
 * APERÇU « ME01 » — Journal, dans l'état de l'image ME01 : octobre 2026, 12 jours de suite, la page du vendredi
 * 30 octobre. Rendu par la VRAIE vue (`VueJournal`), composée par la VRAIE logique (`composerJournal`) sur des données
 * FICTIVES de bac à sable : textes et nombres sont ceux de la maquette et ne vivent qu'ici.
 *
 *   npm run apercu -- ME01
 */
import React from 'react';
import { ApercuBureau } from '../coquille';
import { VueJournal } from '../../../src/refonte/ecrire/ecrans/me01/VueJournal';
import { composerJournal } from '../../../src/refonte/ecrire/ecrans/me01/composer';
import { libellesDe, traduire } from '../../../src/refonte/ecrire/ecrans/me01/i18n';

const moi = 'aaron@exemple.test';
const jours = Array.from({ length: 30 }, (_, i) => `2026-10-${String(i + 1).padStart(2, '0')}`).filter((j) => !['2026-10-04', '2026-10-11', '2026-10-16', '2026-10-17', '2026-10-18'].includes(j));
const pages = [
  ...jours.map((jour, i) => ({ jour, auteurEmail: moi, humeur: ((i % 4) + 2) as 2 | 3 | 4 | 5, texte: 'mot '.repeat(60 + ((i * 37) % 120)).trim() })),
];
pages.push({ jour: '2026-09-30', auteurEmail: moi, humeur: 4, texte: 'Première vraie démonstration chez un client. Stressé, mais tout s’est bien passé.' });
const dujour = pages.find((p) => p.jour === '2026-10-30');
if (dujour) Object.assign(dujour, { humeur: 3, energie: 4, mercis: ['Menna a dit que le tableau de bord était exactement ce qu’elle cherchait.', 'Mohamed a relu le contrat 2027 avec un jour d’avance.'], texte: 'Toujours faire une démonstration courte avant de parler prix : Menna a compris en deux minutes ce que trois e-mails n’avaient pas réussi à expliquer. Pour la semaine prochaine, préparer l’atelier de mardi sans me disperser.', etiquettes: ['Réussite', 'Menna Conseil', 'Atelier'] });

export default function Apercu() {
  const tm = (c: string, p?: Record<string, string | number>) => traduire('fr', c as never, p);
  const v = composerJournal(
    { langue: 'fr', maintenant: '2026-10-30T09:42:00Z', moi, pages: pages as never, jour: '2026-10-30', bilanAuCalendrier: true, heureDuBilan: '16:00', initiales: ['L', 'M', 'M', 'J', 'V', 'S', 'D'], enregistreA: '2026-10-30T09:41:00Z', commenceeA: '2026-10-30T06:40:00Z' },
    { onChoisirHumeur: () => undefined, onChangerTexte: () => undefined, onOuvrirJour: () => undefined, onResumer: () => undefined, onNonResumer: () => undefined },
  );
  return (
    <ApercuBureau famille="ecrire" sousPage="diary" fil={['Écrire et retenir', 'Journal']} ajmani="Écris ce que tu veux, Ajmani peut aussi te poser une question">
      <VueJournal {...v} libelles={libellesDe(tm as never)} onEcrire={() => undefined} onModeles={() => undefined} />
    </ApercuBureau>
  );
}

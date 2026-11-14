/**
 * APERÇU « L02 » — Ma journée · Mode Focus (v4), sur des données FICTIVES posées ici.
 *
 *   npm run apercu -- L02
 */
import React, { useState } from 'react';
import '../../../src/refonte/creer/creer.css';
import '../../../src/refonte/journee/journee.css';
import { VueFocus } from '../../../src/refonte/journee/ecrans/L02/VueFocus';
import { nouveauFocus, lancer, mettreEnPause, type Focus } from '../../../src/refonte/journee/focus';
import { ApercuBureau } from '../coquille';

// 30 oct. 2026, 10:42 à Paris : la session 3 est lancée depuis 9 min 48 s (reste 15:12).
const MAINTENANT = Date.parse('2026-10-30T09:42:00Z');
const DEPART: Focus = { ...lancer({ ...nouveauFocus(25), rang: 2 }, MAINTENANT - 588_000) };

export default function Apercu() {
  const [focus, setFocus] = useState<Focus>(DEPART);
  const [idee, setIdee] = useState('');
  const [ouverts, setOuverts] = useState(false);
  const [objectif, setObjectif] = useState(4);
  return (
    <ApercuBureau famille="jour" sousPage="focus" fil={['Ma journée', 'Mode Focus']}>
      <VueFocus
        focus={focus}
        maintenant={MAINTENANT}
        finPrevue="10:57"
        rangDuJour={2}
        numeroSession={3}
        objectif={objectif}
        minutes={50}
        bruit={{ notifications: 4, messages: 2, courriels: 3 }}
        tache={{ titre: 'Valider le tableau de bord de Menna', contexte: 'Menna Conseil · à rendre avant 17:00 · ta priorité 1 du jour' }}
        file={[{ id: 'a', titre: 'Préparer la facturation', minutes: 25 }, { id: 'b', titre: 'Répondre à Medina', minutes: 10 }]}
        resteFile={1}
        totalFile={55}
        matinee={{
          titre: 'matinee', debut: 540, fin: 750, maintenant: 642,
          blocs: [
            { id: '1', type: 'faite', debut: 545, fin: 570, label: '1' }, { id: 'p1', type: 'pause', debut: 570, fin: 576, label: '' },
            { id: '2', type: 'faite', debut: 576, fin: 602, label: '2' },
            { id: '3', type: 'courante', debut: 632, fin: 657, label: '' },
            { id: 'rdv', type: 'agenda', debut: 660, fin: 712, label: 'Menna' },
            { id: '4', type: 'prevue', debut: 721, fin: 746, label: '4' },
          ],
          phrase: 'Fin à 10:57, puis 3 minutes pour souffler avant le rendez-vous Menna.',
        }}
        idee={idee}
        ideeEnregistree={false}
        reglages={{ ouverts, dureeMin: focus.dureeSeanceMin, objectif }}
        onIdee={setIdee}
        onValiderIdee={() => setIdee('')}
        onLancer={() => setFocus(lancer(focus, MAINTENANT))}
        onPause={() => setFocus(mettreEnPause(focus, MAINTENANT))}
        onTerminer={() => undefined}
        onPasser={() => undefined}
        onQuitter={() => undefined}
        onReglages={setOuverts}
        onDuree={() => undefined}
        onObjectif={setObjectif}
      />
    </ApercuBureau>
  );
}

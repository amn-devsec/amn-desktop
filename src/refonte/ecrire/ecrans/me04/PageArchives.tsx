import React from 'react';
import { usePageCoquille } from '../../../coquille/page';
import { libellesDe, useMots } from './i18n';
import { VueArchives } from './VueArchives';

/**
 * ME04 — Archives, branché sur le poste. Route `/archives` (écran neuf du registre). Le poste n'a PAS de collection
 * d'archives (décision du CO, STATUT §1.29 n° 2 : ME04 se fait sans nouvelle collection ; la collection `archives` est
 * sur la liste présentée à Harun) et ni corbeille (H22) ni fichiers archivés (H11) n'existent encore dans les données
 * du poste : l'écran dit donc honnêtement « rien n'est encore archivé » et n'affiche ni règles automatiques, ni espace,
 * ni suggestions qui n'agiraient sur rien. La vue complète est celle de l'aperçu ; elle s'allume quand la source existera.
 */
export default function PageArchives() {
  const { tm } = useMots();
  usePageCoquille({ famille: 'ecrire', sousPage: 'archives', miettes: [{ libelle: tm('titre') }] });
  return (
    <VueArchives
      titre={tm('titre')}
      sousTitre={tm('sousTitreVide')}
      libelles={libellesDe(tm as never)}
      temps={null}
      recherche={{ valeur: '', onChange: () => undefined, contenu: false, onContenu: () => undefined, types: [], onType: () => undefined, resume: '', groupes: [], suite: null }}
      quota={null}
      regles={null}
      restaures={null}
      suggestion={null}
    />
  );
}

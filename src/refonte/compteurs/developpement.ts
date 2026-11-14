import { useMemo } from 'react';
import { declarerCompteurs } from '../coquille/declarerCompteurs';
import { etatGlobal } from '../developpement/deploiements';
import { useDonneesDeveloppement } from '../developpement/donnees';

/**
 * LES DEUX SIGNAUX DE « DÉVELOPPEMENT » (barre latérale, au-dessus de SURVEILLANCE) : les déploiements en cours et
 * les tests en échec. Sans source (compte réel, connecteurs de LOT-12 pas encore branchés), rien n'est déclaré :
 * la barre ne montre jamais un chiffre inventé, ni un zéro.
 */
function useSignaux() {
  const d = useDonneesDeveloppement();
  const actif = d.source === 'exemple' && d.pret;
  return useMemo(
    () =>
      actif
        ? {
            deploiementsEnCours: d.deploiements.filter((x) => etatGlobal(x) === 'en-cours').length,
            testsEnEchec: d.depots.filter((x) => x.tests.etat === 'echec').length,
          }
        : { deploiementsEnCours: null, testsEnEchec: null },
    [actif, d.deploiements, d.depots],
  );
}

function useCompteurs(): Record<string, number> {
  const d = useDonneesDeveloppement();
  const actif = d.source === 'exemple' && d.pret;
  return useMemo(() => {
    const compteurs: Record<string, number> = {};
    if (actif) compteurs['/developpement/projets'] = d.depots.filter((x) => x.tests.etat === 'echec').length;
    return compteurs;
  }, [actif, d.depots]);
}

export default declarerCompteurs({ famille: 'developpement', useCompteurs, useSignaux });

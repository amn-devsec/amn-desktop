import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useOutlet } from 'react-router-dom';
import { useAssistant } from '../../../assistant/AssistantContext';
import { useSourcesContacts } from '../sources/depuisApp';
import { csvDesAvis, modeleRetours, type ModeleRetours } from './modele';
import { VueRetours, type ActionsRetours } from './VueRetours';

/**
 * « RETOURS CLIENTS » (H44) — la page branchée sur les collections réelles, substituée à `/avis`.
 *
 * La mesure, les thèmes et le mur sont refondus. « Demander un avis » passe la main à l'écran d'origine (`useOutlet`), qui a
 * le geste de demande ; il garde la main jusqu'à ce qu'on quitte `/avis`. « Exporter » écrit le CSV des avis sur ce poste.
 * Aucune réponse n'est enregistrée par l'application : « Répondre avec Ajmani » ouvre l'assistant, rien ne part tout seul.
 */
function useMaintenant(pas = 60_000): number {
  const [maintenant, setMaintenant] = useState(() => Date.now());
  useEffect(() => {
    const minuteur = window.setInterval(() => setMaintenant(Date.now()), pas);
    return () => window.clearInterval(minuteur);
  }, [pas]);
  return maintenant;
}

export default function PageRetours(): React.ReactElement {
  const origine = useOutlet();
  const { open: ouvrirAjmani } = useAssistant();
  const maintenant = useMaintenant();
  const { statut, sources } = useSourcesContacts(maintenant);
  const [passee, setPassee] = useState(false);
  const modele: ModeleRetours | null = useMemo(() => (sources ? modeleRetours(sources) : null), [sources]);

  const exporter = useCallback(() => {
    if (!modele) return;
    const lien = document.createElement('a');
    const url = URL.createObjectURL(new Blob([csvDesAvis(modele.avis)], { type: 'text/csv;charset=utf-8' }));
    lien.href = url;
    lien.download = 'avis-clients.csv';
    document.body.appendChild(lien);
    lien.click();
    lien.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [modele]);

  const actions: ActionsRetours = useMemo(
    () => ({ exporter, demander: () => setPassee(true), repondre: () => ouvrirAjmani(), ouvrir: () => setPassee(true), reessayer: () => window.location.reload() }),
    [exporter, ouvrirAjmani],
  );

  if (passee && origine) return <>{origine}</>;
  const horsLigne = typeof navigator !== 'undefined' && navigator.onLine === false;
  return (
    <VueRetours
      statut={modele ? 'pret' : statut === 'pret' ? 'erreur' : 'chargement'}
      horsLigne={horsLigne}
      modele={modele ?? VIDE}
      actions={actions}
      aujourdhui={sources?.aujourdhui ?? new Date(maintenant).toISOString().slice(0, 10)}
    />
  );
}

const VIDE: ModeleRetours = {
  nbAvis: 0, positifs: 0, recommandent: 0, neutres: 0, decus: 0, parts: { recommandent: 0, neutres: 0, decus: 0 }, score: null, remplissage: 0, libelle: null, delta: null,
  noteMoyenne: null, courbe: [], moisCourbe: ['', ''], themes: null, avis: [], chips: { tous: 0, aRepondre: 0, cinqEtoiles: 0 }, aRepondre: null, collecte: null,
};

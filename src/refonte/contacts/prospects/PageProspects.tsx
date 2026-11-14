import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useOutlet } from 'react-router-dom';
import { useAssistant } from '../../../assistant/AssistantContext';
import { useSourcesContacts } from '../sources/depuisApp';
import { jourDeInstant } from '../commun';
import { lundiDe, modeleProspects, type ModeleProspects } from './modele';
import { SegmentVue, VueProspects, type ActionsProspects, type VueProspect } from './VueProspects';

/**
 * « PROSPECTS » (H06) — la page branchée sur les collections réelles, substituée à `/pipeline`.
 *
 * Le nuage et la liste sont refondus ; « Colonnes » (le tableau par étapes) et « Nouveau prospect » restent servis par
 * l'écran d'origine, que la substitution laisse dans l'`Outlet`, sous une barre qui permet de revenir au nuage. Les
 * signaux d'intérêt (lectures du devis, réponses) ne sont pas des collections de l'application : l'intérêt est ESTIMÉ
 * (étape, ancienneté), et la vue le dit.
 *
 * « Appels de la semaine » : les cases cochées se gardent sur ce poste, par semaine (clé = lundi), jusqu'à ce que
 * la décision de Harun sur le stockage des appels soit prise (STATUT).
 */
const CLE_APPELS = 'amn.refonte.contacts.appels';

function lireFaits(lundi: string): Set<string> {
  try {
    const brut = window.localStorage.getItem(CLE_APPELS);
    if (!brut) return new Set();
    const { semaine, faits } = JSON.parse(brut) as { semaine: string; faits: string[] };
    return semaine === lundi ? new Set(faits) : new Set();
  } catch {
    return new Set();
  }
}

function useMaintenant(pas = 60_000): number {
  const [maintenant, setMaintenant] = useState(() => Date.now());
  useEffect(() => {
    const minuteur = window.setInterval(() => setMaintenant(Date.now()), pas);
    return () => window.clearInterval(minuteur);
  }, [pas]);
  return maintenant;
}

export default function PageProspects(): React.ReactElement {
  const navigate = useNavigate();
  const origine = useOutlet();
  const { open: ouvrirAjmani } = useAssistant();
  const maintenant = useMaintenant();
  const { statut, sources } = useSourcesContacts(maintenant);
  const location = useLocation();
  const [vue, setVue] = useState<VueProspect>(() => ((location.state as { vue?: VueProspect } | null)?.vue === 'colonnes' ? 'colonnes' : 'nuage'));
  const lundi = lundiDe(jourDeInstant(maintenant));
  const [faits, setFaits] = useState<Set<string>>(() => lireFaits(lundi));
  useEffect(() => setFaits(lireFaits(lundi)), [lundi]);

  const modele: ModeleProspects | null = useMemo(() => (sources ? modeleProspects(sources) : null), [sources]);

  const cocher = useCallback((id: string, fait: boolean) => {
    setFaits((cur) => {
      const suite = new Set(cur);
      if (fait) suite.add(id); else suite.delete(id);
      try { window.localStorage.setItem(CLE_APPELS, JSON.stringify({ semaine: lundi, faits: [...suite] })); } catch { /* stockage refusé : la case reste cochée jusqu'au rechargement */ }
      return suite;
    });
  }, [lundi]);

  const versOrigine = useCallback(() => setVue('colonnes'), []);
  const actions: ActionsProspects = useMemo(
    () => ({
      nouveau: versOrigine,
      changerVue: setVue,
      appeler: () => ouvrirAjmani(),
      ecrire: () => navigate('/messages-prives'),
      ouvrir: versOrigine,
      cocher,
      reessayer: () => window.location.reload(),
    }),
    [versOrigine, ouvrirAjmani, navigate, cocher],
  );

  useEffect(() => {
    if (vue === 'colonnes') return undefined;
    const sur = (e: KeyboardEvent) => {
      const cible = e.target as HTMLElement | null;
      if (e.key.toLowerCase() !== 'n' || e.metaKey || e.ctrlKey || e.altKey) return;
      if (cible && (cible.tagName === 'INPUT' || cible.tagName === 'TEXTAREA' || cible.tagName === 'SELECT' || cible.isContentEditable)) return;
      e.preventDefault();
      versOrigine();
    };
    window.addEventListener('keydown', sur);
    return () => window.removeEventListener('keydown', sur);
  }, [vue, versOrigine]);

  if (vue === 'colonnes' && origine) {
    return (
      <div className="sc-pr-colonnes">
        <div className="sc-pr-colonnes__barre"><SegmentVue vue={vue} onChange={setVue} /></div>
        <div className="sc-pr-colonnes__corps">{origine}</div>
      </div>
    );
  }
  const horsLigne = typeof navigator !== 'undefined' && navigator.onLine === false;
  return (
    <VueProspects
      statut={modele ? 'pret' : statut === 'pret' ? 'erreur' : 'chargement'}
      horsLigne={horsLigne}
      modele={modele ?? VIDE}
      vue={vue === 'liste' ? 'liste' : 'nuage'}
      faits={faits}
      actions={actions}
    />
  );
}

const VIDE: ModeleProspects = {
  points: [], total: 0, enJeuCents: 0, prioritaires: { n: 0, totalCents: 0 }, reglages: { interetMin: 60, montantMinCents: 300_000 },
  plafondCents: 1_000_000, chips: { tous: 0, miens: 0, nouveaux: 0 }, appels: [], candidats: [], signatures: { ceMois: 0, fait: null }, estime: false,
};

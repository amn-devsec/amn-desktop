import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssistant } from '../../../assistant/AssistantContext';
import { useSourcesContacts } from '../sources/depuisApp';
import { lundiDe } from '../prospects/modele';
import { jourDeInstant } from '../commun';
import { modeleFidelite, type ModeleFidelite } from './modele';
import { VueFidelite, type ActionsFidelite } from './VueFidelite';

/**
 * « FIDÉLITÉ » (MC02) — la page branchée sur les collections réelles : l'échelle des paliers, vue `/fidelite/niveaux`.
 *
 * Elle ne crée ni n'envoie rien : « Offrir un avantage » et « Préparer » ouvrent l'assistant, qui prépare, jamais n'envoie
 * sans clic. Les points viennent des factures payées, des avis et des recommandations (`derivees.ts`). La formule
 * « tampons » reste l'écran d'origine (`/fidelite`) : F10 mène à l'une ou à l'autre selon que l'organisation a déjà des cartes.
 * Les gestes cochés se gardent sur ce poste, par semaine (clé = lundi), faute d'un stockage décidé (à trancher).
 */
const CLE_GESTES = 'amn.refonte.contacts.gestesFidelite';
const CLE_MASQUEE = 'amn.refonte.contacts.fideliteMasquee';
const SEPT_JOURS_MS = 7 * 24 * 3_600_000;

function lireFaits(lundi: string): Set<string> {
  try {
    const brut = window.localStorage.getItem(CLE_GESTES);
    if (!brut) return new Set();
    const { semaine, faits } = JSON.parse(brut) as { semaine: string; faits: string[] };
    return semaine === lundi ? new Set(faits) : new Set();
  } catch { return new Set(); }
}
function lireMasquee(maintenant: number): number | null {
  try {
    const brut = window.localStorage.getItem(CLE_MASQUEE);
    if (!brut) return null;
    const { clientId, jusqua } = JSON.parse(brut) as { clientId: number; jusqua: number };
    return jusqua > maintenant ? clientId : null;
  } catch { return null; }
}

function useMaintenant(pas = 60_000): number {
  const [maintenant, setMaintenant] = useState(() => Date.now());
  useEffect(() => {
    const minuteur = window.setInterval(() => setMaintenant(Date.now()), pas);
    return () => window.clearInterval(minuteur);
  }, [pas]);
  return maintenant;
}

export default function PageFidelite(): React.ReactElement {
  const navigate = useNavigate();
  const { open: ouvrirAjmani } = useAssistant();
  const maintenant = useMaintenant();
  const { statut, sources } = useSourcesContacts(maintenant);
  const lundi = lundiDe(jourDeInstant(maintenant));
  const [faits, setFaits] = useState<Set<string>>(() => lireFaits(lundi));
  const [masquee, setMasquee] = useState<number | null>(() => lireMasquee(Date.now()));
  useEffect(() => setFaits(lireFaits(lundi)), [lundi]);

  const modele: ModeleFidelite | null = useMemo(() => {
    if (!sources) return null;
    const m = modeleFidelite(sources);
    return m.suggestion && m.suggestion.clientId === masquee ? { ...m, suggestion: null } : m;
  }, [sources, masquee]);

  const cocher = useCallback((cle: string, fait: boolean) => {
    setFaits((cur) => {
      const suite = new Set(cur);
      if (fait) suite.add(cle); else suite.delete(cle);
      try { window.localStorage.setItem(CLE_GESTES, JSON.stringify({ semaine: lundi, faits: [...suite] })); } catch { /* stockage refusé : la case reste cochée jusqu'au rechargement */ }
      return suite;
    });
  }, [lundi]);

  const actions: ActionsFidelite = useMemo(
    () => ({
      regles: () => navigate('/fidelite'),
      offrir: () => ouvrirAjmani(),
      ouvrirClient: (id) => navigate(`/clients?fiche=${id}`),
      cocher,
      preparer: () => ouvrirAjmani(),
      nonMerci: () => {
        const id = modele?.suggestion?.clientId;
        if (id == null) return;
        try { window.localStorage.setItem(CLE_MASQUEE, JSON.stringify({ clientId: id, jusqua: Date.now() + SEPT_JOURS_MS })); } catch { /* stockage refusé : la suggestion revient au prochain chargement */ }
        setMasquee(id);
      },
      reessayer: () => window.location.reload(),
    }),
    [navigate, ouvrirAjmani, cocher, modele],
  );

  const horsLigne = typeof navigator !== 'undefined' && navigator.onLine === false;
  return <VueFidelite statut={modele ? 'pret' : statut === 'pret' ? 'erreur' : 'chargement'} horsLigne={horsLigne} modele={modele ?? VIDE} faits={faits} actions={actions} aujourdhui={sources?.aujourdhui ?? new Date(maintenant).toISOString().slice(0, 10)} />;
}

const VIDE: ModeleFidelite = {
  barreaux: (['Or', 'Argent', 'Bronze'] as const).map((niveau, i) => ({ niveau, depuis: [1800, 800, 0][i], jusqua: [null, 1800, 800][i], effectif: 0, poses: [], autres: 0, carres: [], revenus: 0 })),
  fideles: 0, actifs: 0, paliers: [{ niveau: 'Bronze', depuis: 0 }, { niveau: 'Argent', depuis: 800 }, { niveau: 'Or', depuis: 1800 }], regles: { pointsParEuro: 1, pointsParAvis: 50, pointsParRecommandation: 200, seuilBientot: 100 },
  gestes: [], programme: { pointsDistribues: 0, avantagesUtilises: 0, avantagesCents: 0, revenus: 0 }, suggestion: null, chips: { tous: 0, bientot: 0, inactifs: 0 }, total: 0,
};

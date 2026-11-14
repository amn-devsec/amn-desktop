import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssistant } from '../../../assistant/AssistantContext';
import { useSourcesContacts } from '../sources/depuisApp';
import { modeleReseau, type ModeleReseau } from './modele';
import { VuePartenaires, type ActionsPartenaires } from './VuePartenaires';

/**
 * « PARTENAIRES » (MC05) — la page branchée : la carte du réseau, écran neuf `/partenaires`.
 *
 * L'application n'a pas de collection de partenaires : tant que `sources.partenaires` est `null`, l'écran dit « non
 * disponible » et pourquoi, et renvoie aux fournisseurs. Dès qu'elle existe, la carte se construit depuis elle. « Comparer »
 * ouvre l'assistant (rien n'est résilié) ; « Plus tard » masque la suggestion 7 jours sur ce poste.
 */
const CLE_MASQUEE = 'amn.refonte.contacts.renouvellementMasque';
const SEPT_JOURS_MS = 7 * 24 * 3_600_000;

function lireMasquee(maintenant: number): string | null {
  try {
    const brut = window.localStorage.getItem(CLE_MASQUEE);
    if (!brut) return null;
    const { id, jusqua } = JSON.parse(brut) as { id: string; jusqua: number };
    return jusqua > maintenant ? id : null;
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

export default function PagePartenaires(): React.ReactElement {
  const navigate = useNavigate();
  const { open: ouvrirAjmani } = useAssistant();
  const maintenant = useMaintenant();
  const { statut, sources } = useSourcesContacts(maintenant);
  const [masquee, setMasquee] = useState<string | null>(() => lireMasquee(Date.now()));

  const modele: ModeleReseau | null = useMemo(() => {
    if (!sources) return null;
    const m = modeleReseau(sources);
    return m && m.suggestion && m.suggestion.id === masquee ? { ...m, suggestion: null } : m;
  }, [sources, masquee]);

  const plusTard = useCallback(() => {
    const id = modele?.suggestion?.id;
    if (!id) return;
    try { window.localStorage.setItem(CLE_MASQUEE, JSON.stringify({ id, jusqua: Date.now() + SEPT_JOURS_MS })); } catch { /* stockage refusé : la suggestion revient au prochain chargement */ }
    setMasquee(id);
  }, [modele]);

  const actions: ActionsPartenaires = useMemo(
    () => ({
      ajouter: () => navigate('/fournisseurs'),
      inviter: () => navigate('/membres'),
      ecrire: () => navigate('/messages-prives'),
      voirAcces: () => navigate('/membres'),
      comparer: () => ouvrirAjmani(),
      plusTard,
      ouvrirFournisseurs: () => navigate('/fournisseurs'),
      reessayer: () => window.location.reload(),
    }),
    [navigate, ouvrirAjmani, plusTard],
  );

  const horsLigne = typeof navigator !== 'undefined' && navigator.onLine === false;
  return (
    <VuePartenaires
      statut={sources && sources.partenaires === null ? 'indisponible' : modele ? 'pret' : statut === 'pret' ? 'erreur' : 'chargement'}
      horsLigne={horsLigne}
      modele={modele}
      actions={actions}
    />
  );
}

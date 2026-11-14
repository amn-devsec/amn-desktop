import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useOutlet } from 'react-router-dom';
import { useAssistant } from '../../../assistant/AssistantContext';
import { useSourcesContacts } from '../sources/depuisApp';
import { modeleFournisseurs, type Besoin, type ModeleFournisseurs, type Urgence } from './modele';
import { VueFournisseurs, type ActionsFournisseurs } from './VueFournisseurs';

/**
 * « FOURNISSEURS » (H45) — la page branchée sur les collections réelles, substituée à `/fournisseurs`.
 *
 * La matrice compare sur l'historique d'achats, que l'application n'a pas encore : elle dit donc « non disponible » et
 * « Tous les fournisseurs » (l'écran d'origine, par `useOutlet`) reste le chemin vers la liste, les coordonnées et
 * l'import. Le besoin et le réglage des poids vivent dans la page : rien n'est enregistré.
 * « Plus tard » masque la suggestion 14 jours sur ce poste.
 */
const CLE_MASQUEE = 'amn.refonte.contacts.renegociationMasquee';
const QUATORZE_JOURS_MS = 14 * 24 * 3_600_000;

function lireMasquee(maintenant: number): string | null {
  try {
    const brut = window.localStorage.getItem(CLE_MASQUEE);
    if (!brut) return null;
    const { nom, jusqua } = JSON.parse(brut) as { nom: string; jusqua: number };
    return jusqua > maintenant ? nom : null;
  } catch {
    return null;
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

export default function PageFournisseurs(): React.ReactElement {
  const origine = useOutlet();
  const { open: ouvrirAjmani } = useAssistant();
  const maintenant = useMaintenant();
  const { statut, sources } = useSourcesContacts(maintenant);
  const [passee, setPassee] = useState(false);
  const [besoin, setBesoin] = useState<Besoin | null>(null);
  const [urgence, setUrgence] = useState<Urgence>('depannage');
  const [masquee, setMasquee] = useState<string | null>(() => lireMasquee(Date.now()));

  const modele: ModeleFournisseurs | null = useMemo(() => {
    if (!sources) return null;
    const m = modeleFournisseurs(sources, { besoin, urgence });
    return m.renegocier && m.renegocier.fournisseur === masquee ? { ...m, renegocier: null } : m;
  }, [sources, besoin, urgence, masquee]);

  const plusTard = useCallback(() => {
    const nom = modele?.renegocier?.fournisseur;
    if (!nom) return;
    try { window.localStorage.setItem(CLE_MASQUEE, JSON.stringify({ nom, jusqua: Date.now() + QUATORZE_JOURS_MS })); } catch { /* stockage refusé : la suggestion revient au prochain chargement */ }
    setMasquee(nom);
  }, [modele]);

  const actions: ActionsFournisseurs = useMemo(
    () => ({
      tous: () => setPassee(true),
      choisirBesoin: setBesoin,
      urgence: setUrgence,
      commander: () => setPassee(true),
      demanderDevis: () => ouvrirAjmani(),
      preparerDemande: () => ouvrirAjmani(),
      plusTard,
      reessayer: () => window.location.reload(),
    }),
    [ouvrirAjmani, plusTard],
  );

  if (passee && origine) return <>{origine}</>;
  const horsLigne = typeof navigator !== 'undefined' && navigator.onLine === false;
  return <VueFournisseurs statut={modele ? 'pret' : statut === 'pret' ? 'erreur' : 'chargement'} horsLigne={horsLigne} modele={modele ?? VIDE} actions={actions} />;
}

const VIDE: ModeleFournisseurs = { disponible: false, total: 0, besoins: [], besoin: null, colonnes: [], poids: { prix: 0, delai: 0, qualite: 0, garantie: 0 }, recommande: null, commandes: { liste: [], dansLesDelais: 0 }, renegocier: null };

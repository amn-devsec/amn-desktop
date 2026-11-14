import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssistant } from '../../../assistant/AssistantContext';
import { useCollection, useSync } from '../../../state/SyncContext';
import { useSourcesContacts, STAGE_DE } from '../sources/depuisApp';
import type { Colonne } from '../pipeline';
import { transitionsPermises } from '../pipeline';
import { modeleEntonnoir, type ModeleEntonnoir, type Periode } from './modele';
import { VuePipeline, type ActionsPipeline } from './VuePipeline';
import { useMotsPipeline } from './i18n';

/**
 * « PIPELINE COMMERCIAL » (MC01) — la page branchée sur la collection `prospects` : lire, et déplacer une opportunité.
 *
 * Un déplacement est écrit comme l'écran d'origine l'écrit (`stage` et `movedAt`, `upsert` de la collection) : mise à
 * jour tout de suite, message « X déplacée vers Y · Annuler » pendant 6 s, qui remet l'étape et la date d'avant.
 * L'application ne garde pas l'historique des mouvements : les taux de passage disent « — ». L'objectif du mois se garde
 * sur ce poste (clé `amn.refonte.contacts.objectifMois`) faute d'un réglage décidé (à trancher). « Nouvelle opportunité »
 * mène à l'écran d'origine des prospects, vue « Colonnes », qui a le formulaire de création.
 */
const CLE_OBJECTIF = 'amn.refonte.contacts.objectifMois';
const CLE_MASQUEE = 'amn.refonte.contacts.relanceMasquee';
const SEPT_JOURS_MS = 7 * 24 * 3_600_000;
const SIX_SECONDES = 6000;

interface Brut { id: string; name: string; company: string; valueCents: number; stage: 'contact' | 'qualifie' | 'proposition' | 'gagne' | 'perdu'; note: string; createdAt: string; movedAt?: string; updatedAt: string }

const ETAPE_DE_COLONNE = { Nouveau: 'nouveau', 'Rendez-vous': 'rendez-vous', 'Devis envoyé': 'devis envoyé', Signé: 'gagné' } as const;

function lireObjectif(): number | null {
  try { const n = Number(window.localStorage.getItem(CLE_OBJECTIF)); return Number.isFinite(n) && n > 0 ? n : null; } catch { return null; }
}
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

export default function PagePipeline(): React.ReactElement {
  const navigate = useNavigate();
  const { tm } = useMotsPipeline();
  const { open: ouvrirAjmani } = useAssistant();
  const { upsert } = useSync();
  const brutes = useCollection<Brut>('prospects');
  const maintenant = useMaintenant();
  const { statut, sources } = useSourcesContacts(maintenant);
  const [periode, setPeriode] = useState<Periode>('mois');
  const [objectif, setObjectif] = useState<number | null>(() => lireObjectif());
  const [masquee, setMasquee] = useState<string | null>(() => lireMasquee(Date.now()));
  const [annonce, setAnnonce] = useState<{ texte: string; annuler: () => void } | null>(null);
  const minuteur = useRef<number | null>(null);
  useEffect(() => () => { if (minuteur.current) window.clearTimeout(minuteur.current); }, []);

  const modele: ModeleEntonnoir | null = useMemo(() => {
    if (!sources) return null;
    const m = modeleEntonnoir(sources, { mouvements: null, objectifCents: objectif, periode });
    return m.suggestion && m.suggestion.id === masquee ? { ...m, suggestion: null } : m;
  }, [sources, objectif, periode, masquee]);

  const deplacer = useCallback((id: string, vers: Colonne) => {
    const avant = brutes.find((p) => p.id === id);
    const p = sources?.prospects.find((x) => x.id === id);
    if (!avant || !p) return;
    const cible = ETAPE_DE_COLONNE[vers];
    if (!transitionsPermises(p.etape).includes(cible) && !(p.etape === 'nouveau' && cible === 'rendez-vous')) return;
    const stage = STAGE_DE[cible];
    if (stage === avant.stage) return;
    void upsert('prospects', id, { ...avant, stage, movedAt: new Date().toISOString() });
    if (minuteur.current) window.clearTimeout(minuteur.current);
    setAnnonce({ texte: tm('deplacer.annonce', { nom: p.nom, etape: tm(`etape.${vers}` as const) }), annuler: () => { void upsert('prospects', id, { ...avant }); setAnnonce(null); } });
    minuteur.current = window.setTimeout(() => setAnnonce(null), SIX_SECONDES);
  }, [brutes, sources, upsert, tm]);

  const actions: ActionsPipeline = useMemo(
    () => ({
      nouvelle: () => navigate('/pipeline', { state: { vue: 'colonnes' } }),
      periode: setPeriode,
      deplacer,
      definirObjectif: (cents) => { try { window.localStorage.setItem(CLE_OBJECTIF, String(cents)); } catch { /* stockage refusé : l'objectif vaut jusqu'au rechargement */ } setObjectif(cents); },
      voirMessage: () => ouvrirAjmani(),
      plusTard: () => {
        const id = modele?.suggestion?.id;
        if (!id) return;
        try { window.localStorage.setItem(CLE_MASQUEE, JSON.stringify({ id, jusqua: Date.now() + SEPT_JOURS_MS })); } catch { /* stockage refusé : la suggestion revient au prochain chargement */ }
        setMasquee(id);
      },
      reessayer: () => window.location.reload(),
    }),
    [navigate, deplacer, ouvrirAjmani, modele],
  );

  const horsLigne = typeof navigator !== 'undefined' && navigator.onLine === false;
  return (
    <VuePipeline
      statut={modele ? 'pret' : statut === 'pret' ? 'erreur' : 'chargement'}
      horsLigne={horsLigne}
      modele={modele ?? VIDE}
      actions={actions}
      aujourdhui={sources?.aujourdhui ?? new Date(maintenant).toISOString().slice(0, 10)}
      annonce={annonce}
    />
  );
}

const VIDE: ModeleEntonnoir = {
  etapes: (['Nouveau', 'Rendez-vous', 'Devis envoyé'] as const).map((colonne, i) => ({ colonne, numero: `0${i + 1}`, nb: 0, totalCents: 0, chance: [20, 40, 55][i], pastilles: [], regroupees: [], ageMoyenJours: null, taux: null })),
  total: 0, enJeuCents: 0, passagePourcent: null, ageDepuisCreation: true, tauxIndisponibles: true, sortie: { lignes: [], nb: 0, totalCents: 0 }, periode: 'mois', objectif: null,
  prevision: { totalCents: 0, contributions: [], enJeuCents: 0 }, signatures: { mois: [], fait: null }, suggestion: null,
};

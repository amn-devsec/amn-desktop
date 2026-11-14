import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useOutlet } from 'react-router-dom';
import { useSourcesContacts } from '../sources/depuisApp';
import type { TonMessage } from '../relances';
import { modelePile, type HistoriquePile, type ModelePile, type Trace } from './modele';
import { useMotsPile } from './i18n';
import { VuePile, type ActionsPile } from './VuePile';

/**
 * « RELANCES » (MC07) — la page branchée sur les relances DÉDUITES de l'application (`derivees.ts` : factures échues, devis
 * sans réponse, rendez-vous manqués, prospects, clients inactifs) : substitue `/relances`.
 *
 * L'application n'envoie pas de message depuis cette couche : « Copier et suivante » copie l'objet et le texte (à coller
 * dans la messagerie ou le courriel), note le geste et passe à la suivante ; rien n'est « envoyé » en son nom. L'envoi par
 * courriel d'une relance de facture reste dans l'écran d'origine (« Modèles de messages » y mène). Ce que le poste
 * retient — gestes, jours « boîte à zéro », liste du matin — est écrit sur ce poste (provisoire, à trancher : STATUT).
 * Les réponses des clients ne sont pas enregistrées : « Réponses du jour » et le taux disent « non disponible ».
 */
const CLE_HISTORIQUE = 'amn.refonte.contacts.relances';
const CLE_APPEL = 'amn.refonte.contacts.relanceAppelMasque';
const SEPT_JOURS_MS = 7 * 86_400_000;
const DIX_SECONDES = 10_000;

const HISTORIQUE_VIDE: HistoriquePile = { traces: [], joursVides: [], matin: null };

function lireHistorique(): HistoriquePile {
  try {
    const brut = window.localStorage.getItem(CLE_HISTORIQUE);
    if (!brut) return HISTORIQUE_VIDE;
    const v = JSON.parse(brut) as Partial<HistoriquePile>;
    const mois = Date.now() - 100 * 86_400_000;
    return {
      traces: (Array.isArray(v.traces) ? v.traces : []).filter((t): t is Trace => !!t && typeof t.cle === 'string' && (t.geste === 'envoyee' || t.geste === 'reportee') && typeof t.le === 'number' && t.le > mois),
      joursVides: Array.isArray(v.joursVides) ? v.joursVides.filter((j): j is string => typeof j === 'string').slice(-400) : [],
      matin: v.matin && typeof v.matin.jour === 'string' && Array.isArray(v.matin.cles) ? { jour: v.matin.jour, cles: v.matin.cles.filter((c): c is string => typeof c === 'string') } : null,
    };
  } catch {
    return HISTORIQUE_VIDE;
  }
}

function lireMasquees(): Record<string, number> {
  try {
    const v = JSON.parse(window.localStorage.getItem(CLE_APPEL) ?? '{}') as Record<string, number>;
    return Object.fromEntries(Object.entries(v).filter(([, jusqua]) => typeof jusqua === 'number' && jusqua > Date.now()));
  } catch {
    return {};
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

export default function PagePile(): React.ReactElement {
  const location = useLocation();
  const navigate = useNavigate();
  const origine = useOutlet();
  const { tm } = useMotsPile();
  const etat = location.state as { origine?: boolean } | null;
  const [passee, setPassee] = useState(etat?.origine === true);
  useEffect(() => { if (etat?.origine === true) setPassee(true); }, [etat]);

  const maintenant = useMaintenant();
  const { statut, sources } = useSourcesContacts(maintenant);
  const [historique, setHistorique] = useState<HistoriquePile>(lireHistorique);
  const [passees, setPassees] = useState<string[]>([]);
  const [selection, setSelection] = useState<string | null>(null);
  const [ton, setTon] = useState<TonMessage>('courtois');
  const [brouillons, setBrouillons] = useState<Record<string, string>>({});
  const [masquees, setMasquees] = useState<Record<string, number>>(lireMasquees);
  const [annulation, setAnnulation] = useState<{ texte: string; trace: Trace } | null>(null);
  const minuteur = useRef<number | null>(null);

  const ecrire = useCallback((h: HistoriquePile) => {
    try { window.localStorage.setItem(CLE_HISTORIQUE, JSON.stringify(h)); } catch { /* stockage refusé : les gestes tiennent jusqu'au rechargement */ }
  }, []);
  const changer = useCallback((f: (h: HistoriquePile) => HistoriquePile) => {
    setHistorique((h) => { const suivant = f(h); ecrire(suivant); return suivant; });
  }, [ecrire]);

  const modele: ModelePile | null = useMemo(
    () => (sources ? modelePile(sources, { historique, passees, selection, ton, brouillons, reponses: null, suggestionMasquee: new Set(Object.keys(masquees)) }) : null),
    [sources, historique, passees, selection, ton, brouillons, masquees],
  );

  // La liste du matin et les jours « boîte à zéro » se figent sur ce poste.
  useEffect(() => {
    if (!modele) return;
    const figee = historique.matin?.jour === modele.aujourdhui ? historique.matin.cles : [];
    if (modele.matin.some((c) => !figee.includes(c))) changer((h) => ({ ...h, matin: { jour: modele.aujourdhui, cles: modele.matin } }));
    if (modele.videe && !historique.joursVides.includes(modele.aujourdhui)) changer((h) => ({ ...h, joursVides: [...h.joursVides, modele.aujourdhui] }));
  }, [modele, historique, changer]);
  useEffect(() => () => { if (minuteur.current != null) window.clearTimeout(minuteur.current); }, []);

  const noter = useCallback((geste: Trace['geste'], cle: string, texte: string) => {
    const trace: Trace = { cle, geste, le: Date.now() };
    changer((h) => ({ ...h, traces: [...h.traces, trace] }));
    setSelection(null);
    setAnnulation({ texte, trace });
    if (minuteur.current != null) window.clearTimeout(minuteur.current);
    minuteur.current = window.setTimeout(() => setAnnulation(null), DIX_SECONDES);
  }, [changer]);

  const actions: ActionsPile = useMemo(() => ({
    envoyer: () => {
      const c = modele?.courante;
      // Point 8 : rien ne part sans un clic — celui-ci — et jamais quand la règle d'espacement l'interdit.
      if (!c || !c.peutPartir) return;
      try { void navigator.clipboard?.writeText(`${c.sujet}\n\n${c.corps}`); } catch { /* presse-papiers refusé : le texte reste dans la carte */ }
      setBrouillons((b) => { const reste = { ...b }; delete reste[c.cle]; return reste; });
      noter('envoyee', c.cle, tm('annuler.copie', { client: c.clientNom }));
    },
    reporter: () => { const c = modele?.courante; if (c) noter('reportee', c.cle, tm('annuler.reporte', { client: c.clientNom })); },
    passer: () => { const c = modele?.courante; if (c) { setPassees((p) => [...p.filter((x) => x !== c.cle), c.cle]); setSelection(null); } },
    appeler: () => navigate('/agenda'),
    ouvrirLigne: setSelection,
    ton: (t) => { setTon(t); const c = modele?.courante; if (c) setBrouillons((b) => { const reste = { ...b }; delete reste[c.cle]; return reste; }); },
    brouillon: (cle, texte) => setBrouillons((b) => ({ ...b, [cle]: texte })),
    modeles: () => { setPassee(true); navigate('/relances', { replace: true, state: { origine: true } }); },
    modifierReglages: () => navigate('/settings'),
    planifierAppel: () => navigate('/agenda'),
    masquerSuggestion: () => {
      const s = modele?.suggestion;
      if (!s) return;
      const suivant = { ...masquees, [s.cle]: Date.now() + SEPT_JOURS_MS };
      setMasquees(suivant);
      try { window.localStorage.setItem(CLE_APPEL, JSON.stringify(suivant)); } catch { /* stockage refusé : la suggestion revient au prochain chargement */ }
    },
    voirReponses: () => navigate('/messages-prives'),
    annuler: () => {
      if (!annulation) return;
      changer((h) => ({ ...h, traces: h.traces.filter((t) => !(t.cle === annulation.trace.cle && t.le === annulation.trace.le)) }));
      setAnnulation(null);
    },
    reessayer: () => window.location.reload(),
  }), [modele, navigate, noter, masquees, annulation, changer, tm]);

  if (passee && origine) return <>{origine}</>;

  const horsLigne = typeof navigator !== 'undefined' && navigator.onLine === false;
  return <VuePile statut={modele ? 'pret' : statut === 'pret' ? 'erreur' : 'chargement'} horsLigne={horsLigne} modele={modele ?? VIDE} ton={ton} envoi="copie" annulation={annulation} actions={actions} />;
}

const VIDE: ModelePile = {
  aujourdhui: '1970-01-01', total: 0, traitees: 0, reste: 0, videe: false, lignes: [], courante: null, ensuite: [], matin: [], frise: null, motifFrise: null,
  reponses: null, serie: 0, semaine: [], envoyeesMois: 0, tauxReponse: null, reglages: { debut: '09:00', fin: '18:00', espacementJours: 5 }, suggestion: null,
};


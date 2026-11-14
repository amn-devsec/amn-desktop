import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useOutlet } from 'react-router-dom';
import { usePersonalStore } from '../../../state/usePersonalStore';
import { modeleRegularite, type HabitudeEntree, type MomentDuJour } from './modele';
import { VueHabitudes, type ActionsHabitudes } from './VueHabitudes';

/**
 * « HABITUDES » (MJ02) — la page branchée sur les habitudes de la personne : substitue `/personnel/habitudes`.
 *
 * Une habitude de l'application a un libellé, les jours où elle a été cochée et un jour de création. Elle n'a NI moment de la journée, NI rythme
 * (« 3 fois par semaine »), NI mesure chiffrée, NI icône : toutes sont « tous les jours », à cocher, sans moment (le filtre « Matin / Journée /
 * Soir » ne retient donc rien d'elles) ; rien n'est inventé. Cocher la case d'aujourd'hui écrit dans la même liste que l'écran d'origine (les deux
 * se voient). Créer ou retirer une habitude, et la bibliothèque, passent la main à l'écran d'origine (`useOutlet`).
 */
interface HabitudeApp { id: string; label: string; ticks: string[]; createdAt: string; lastTickAt?: string }

const isoJour = (d: Date): string => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function habitudeDeLApp(h: HabitudeApp): HabitudeEntree {
  const creee = h.createdAt ? isoJour(new Date(h.createdAt)) : '1970-01-01';
  return {
    id: h.id, nom: h.label, icone: 'target', moment: null, rythme: 'Tous les jours', frequence: { type: 'tous les jours' }, mesure: { type: 'case' },
    debut: creee, historique: Object.fromEntries(h.ticks.map((t) => [t, 1])),
  };
}

function useJour(): string {
  const [jour, setJour] = useState(() => isoJour(new Date()));
  useEffect(() => {
    const minuteur = window.setInterval(() => setJour(isoJour(new Date())), 60_000);
    return () => window.clearInterval(minuteur);
  }, []);
  return jour;
}

export default function PageHabitudes(): React.ReactElement {
  const location = useLocation();
  const navigate = useNavigate();
  const origine = useOutlet();
  const etat = location.state as { origine?: boolean } | null;
  const [passee, setPassee] = useState(etat?.origine === true);
  useEffect(() => { if (etat?.origine === true) setPassee(true); }, [etat]);

  const [brutes, setBrutes, pret] = usePersonalStore<HabitudeApp[]>('habitudes', []);
  const [filtre, setFiltre] = useState<MomentDuJour | 'toutes'>('toutes');
  const aujourdhui = useJour();
  const modele = useMemo(() => modeleRegularite({ habitudes: brutes.map(habitudeDeLApp), aujourdhui, filtre, formater: (n) => new Intl.NumberFormat('fr-FR').format(n) }), [brutes, aujourdhui, filtre]);

  const versOrigine = () => { setPassee(true); navigate('/personnel/habitudes', { replace: true, state: { origine: true } }); };
  const actions: ActionsHabitudes = useMemo(() => ({
    nouvelle: versOrigine, bibliotheque: versOrigine, filtre: setFiltre,
    // Cocher aujourd'hui : la même liste de jours que l'écran d'origine, la même trace de la dernière coche.
    cocher: (id) => setBrutes((liste) => liste.map((h) => (h.id === id && !h.ticks.includes(aujourdhui) ? { ...h, ticks: [...h.ticks, aujourdhui], lastTickAt: new Date().toISOString() } : h))),
    reserver: () => undefined, garder: () => undefined, ajouter: versOrigine, reessayer: () => window.location.reload(),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [aujourdhui, setBrutes]);

  if (passee && origine) return <>{origine}</>;
  const horsLigne = typeof navigator !== 'undefined' && navigator.onLine === false;
  return <VueHabitudes statut={pret ? 'pret' : 'chargement'} horsLigne={horsLigne} modele={modele} filtre={filtre} actions={actions} />;
}

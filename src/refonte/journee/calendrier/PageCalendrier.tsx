import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useOutlet } from 'react-router-dom';
import { useAppointments, type Appointment } from '../../../state/useAppointments';
import { ajouterJours, jourDeParis } from '../commun';
import { modeleSemaine, type EvenementGrille, type ModeleSemaine } from './modele';
import { VueCalendrier, type ActionsCalendrier } from './VueCalendrier';

/**
 * « CALENDRIER » (H01) — la page branchée sur les rendez-vous de l'application : substitue `/agenda` (couture : le fichier d'origine
 * `src/business/AgendaScreen.tsx`, PARTAGÉ avec l'édition cliente, ne bouge pas).
 *
 * Elle montre la SEMAINE. Les vues « Jour » et « Mois », la création, la modification et la suppression d'un événement restent servies par
 * l'écran d'origine (`useOutlet`) : « Nouvel événement » et un clic sur un bloc lui passent la main. Ce que l'application ne connaît pas
 * n'est pas inventé : un événement n'a ni type ni salle ni participants (les blocs « Concentration » se reconnaissent à leur titre, il n'y
 * a ni trajet ni événement sur la journée entière), et le créneau proposé par Ajmani demande des tâches datées : sans elles, l'astuce.
 */
function useMaintenant(pas = 60_000): number {
  const [maintenant, setMaintenant] = useState(() => Date.now());
  useEffect(() => {
    const minuteur = window.setInterval(() => setMaintenant(Date.now()), pas);
    return () => window.clearInterval(minuteur);
  }, [pas]);
  return maintenant;
}

const mois = (j: string, n: number): string => {
  const d = new Date(Date.UTC(Number(j.slice(0, 4)), Number(j.slice(5, 7)) - 1 + n, 1, 12));
  return d.toISOString().slice(0, 10);
};

/** Un rendez-vous de l'application, lu par la grille. La famille vient du lien : fiche client → Clients, projet → Chantiers, sinon Équipe. */
export function evenementDeLApp(a: Appointment): EvenementGrille {
  const concentration = /^concentration\b/i.test(a.title.trim());
  return {
    id: a.id,
    titre: concentration ? a.title.replace(/^concentration\s*[:·-]?\s*/i, '') || a.title : a.title,
    startAt: a.startAt,
    endAt: new Date(Date.parse(a.startAt) + Math.max(15, a.durationMin) * 60_000).toISOString(),
    status: a.status,
    famille: a.clientId != null ? 'clients' : a.projectId ? 'chantiers' : 'equipe',
    genre: concentration ? 'concentration' : 'normal',
    detail: concentration ? a.title.replace(/^concentration\s*[:·-]?\s*/i, '') : [a.clientName, a.location].filter(Boolean).join(' · '),
    lieu: a.location,
    enLigne: /^https?:\/\//i.test(a.location),
  };
}

export default function PageCalendrier(): React.ReactElement {
  const location = useLocation();
  const navigate = useNavigate();
  const origine = useOutlet();
  const etat = location.state as { origine?: boolean } | null;
  const [passee, setPassee] = useState(etat?.origine === true);
  useEffect(() => { if (etat?.origine === true) setPassee(true); }, [etat]);

  const maintenant = useMaintenant();
  const { appointments } = useAppointments();
  const [jour, setJour] = useState<string | null>(null);
  const [moisVu, setMoisVu] = useState<string | null>(null);
  const [refuses] = useState<ReadonlySet<string>>(() => new Set());

  const evenements = useMemo(() => appointments.map(evenementDeLApp), [appointments]);
  const jourVu = jour ?? jourDeParis(maintenant);
  const modele: ModeleSemaine = useMemo(() => modeleSemaine({ evenements, maintenant, jour: moisVu && !jour ? moisVu : jourVu, refuses }), [evenements, maintenant, jourVu, moisVu, jour, refuses]);

  const vieille = (versOrigine: string | null) => { setPassee(true); navigate('/agenda', { replace: true, state: { origine: true, ...(versOrigine ? { vue: versOrigine } : null) } }); };
  const actions: ActionsCalendrier = useMemo(() => ({
    vue: (v) => { if (v !== 'semaine') vieille(v); },
    precedent: () => { setMoisVu(null); setJour(ajouterJours(jourVu, -7)); },
    suivant: () => { setMoisVu(null); setJour(ajouterJours(jourVu, 7)); },
    aujourdhui: () => { setMoisVu(null); setJour(null); },
    nouveau: () => vieille(null),
    ouvrir: () => vieille(null),
    jour: (j) => { setMoisVu(null); setJour(j); },
    moisPrecedent: () => { setJour(null); setMoisVu(mois(moisVu ?? jourVu, -1)); },
    moisSuivant: () => { setJour(null); setMoisVu(mois(moisVu ?? jourVu, 1)); },
    rejoindre: (id) => { const e = evenements.find((x) => x.id === id); if (e && /^https?:\/\//i.test(e.lieu ?? '')) window.open(e.lieu, '_blank', 'noopener,noreferrer'); else vieille(null); },
    preparer: () => vieille(null),
    bloquer: () => undefined,
    refuser: () => undefined,
    reessayer: () => window.location.reload(),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [evenements, jourVu, moisVu]);

  if (passee && origine) return <>{origine}</>;
  const horsLigne = typeof navigator !== 'undefined' && navigator.onLine === false;
  return <VueCalendrier statut="pret" horsLigne={horsLigne} modele={modele} actions={actions} />;
}

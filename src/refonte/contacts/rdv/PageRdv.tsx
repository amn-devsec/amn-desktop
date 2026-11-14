import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSourcesContacts } from '../sources/depuisApp';
import { jourDeInstant } from '../commun';
import { modeleJournee, type ModeleJournee } from './modele';
import { VueRdv, type ActionsRdv } from './VueRdv';

/**
 * « RENDEZ-VOUS CLIENTS » (MC06) — la page branchée sur le calendrier réel : écran neuf `/rendez-vous-clients`.
 *
 * Elle montre la journée des rendez-vous clients (les rendez-vous de l'agenda de l'application). Sans service d'itinéraire
 * (aucun n'est branché), pas de bande de route ni de « Le trajet du jour » : « non disponible ». Sans lien de réservation,
 * « Ton lien de réservation » dit de même. Créer ou déplacer un rendez-vous se fait dans l'agenda (`/agenda`).
 */
function useMaintenant(pas = 60_000): number {
  const [maintenant, setMaintenant] = useState(() => Date.now());
  useEffect(() => {
    const minuteur = window.setInterval(() => setMaintenant(Date.now()), pas);
    return () => window.clearInterval(minuteur);
  }, [pas]);
  return maintenant;
}

export default function PageRdv(): React.ReactElement {
  const navigate = useNavigate();
  const maintenant = useMaintenant();
  const { statut, sources } = useSourcesContacts(maintenant);
  const [jour, setJour] = useState<string | null>(null);

  const modele: ModeleJournee | null = useMemo(() => (sources ? modeleJournee(sources, { jour: jour ?? jourDeInstant(maintenant), durees: null }) : null), [sources, jour, maintenant]);

  const actions: ActionsRdv = useMemo(
    () => ({
      nouveau: () => navigate('/agenda'),
      lien: () => navigate('/agenda'),
      jour: setJour,
      ouvrir: () => navigate('/agenda'),
      ouvrirAgenda: () => navigate('/agenda'),
      reessayer: () => window.location.reload(),
    }),
    [navigate],
  );

  const horsLigne = typeof navigator !== 'undefined' && navigator.onLine === false;
  return <VueRdv statut={modele ? 'pret' : statut === 'pret' ? 'erreur' : 'chargement'} horsLigne={horsLigne} modele={modele ?? VIDE} actions={actions} />;
}

const VIDE: ModeleJournee = { jour: '1970-01-01', puces: [], cartes: [], maintenantX: null, maintenantHeure: '', pause: null, route: null, total: 0, prochain: null };

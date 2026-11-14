import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutlet } from 'react-router-dom';
import { useAssistant } from '../../../assistant/AssistantContext';
import { useSourcesContacts } from '../sources/depuisApp';
import { modeleEquipe, type ModeleEquipe } from './modele';
import { VueEquipe, type ActionsEquipe } from './VueEquipe';

/**
 * « ÉQUIPE » (MC04) — la page branchée, substituée à `/trombinoscope` : les cartes de l'équipe, lues dans les membres
 * de l'organisation.
 *
 * L'application donne les membres et leur présence ; elle ne donne pas (encore) les tâches ni les rendez-vous avec
 * leurs participants : la charge dit « inconnue : relie le calendrier ou les tâches » au lieu d'inventer des heures.
 * « Organigramme » passe la main à l'écran d'origine (`useOutlet`) ; « Inviter » et « Membres et accès » mènent à H19
 * (`/membres`). « Confier » et « Proposer » ouvrent l'assistant : rien n'est attribué sans l'accord de la personne.
 */
function useMaintenant(pas = 60_000): number {
  const [maintenant, setMaintenant] = useState(() => Date.now());
  useEffect(() => {
    const minuteur = window.setInterval(() => setMaintenant(Date.now()), pas);
    return () => window.clearInterval(minuteur);
  }, [pas]);
  return maintenant;
}

export default function PageEquipe(): React.ReactElement {
  const navigate = useNavigate();
  const origine = useOutlet();
  const { open: ouvrirAjmani } = useAssistant();
  const maintenant = useMaintenant();
  const { statut, sources } = useSourcesContacts(maintenant);
  const [passee, setPassee] = useState(false);
  const [masquee, setMasquee] = useState(false);

  const modele: ModeleEquipe | null = useMemo(() => {
    if (!sources) return null;
    const m = modeleEquipe(sources);
    return masquee ? { ...m, suggestion: null } : m;
  }, [sources, masquee]);

  const actions: ActionsEquipe = useMemo(
    () => ({
      inviter: () => navigate('/membres'),
      organigramme: () => setPassee(true),
      message: () => navigate('/messages-prives'),
      confier: () => ouvrirAjmani(),
      membresEtAcces: () => navigate('/membres'),
      proposer: () => ouvrirAjmani(),
      non: () => setMasquee(true),
      relier: () => navigate('/agenda'),
      reessayer: () => window.location.reload(),
    }),
    [navigate, ouvrirAjmani],
  );

  if (passee && origine) return <>{origine}</>;
  const horsLigne = typeof navigator !== 'undefined' && navigator.onLine === false;
  return <VueEquipe statut={modele ? 'pret' : statut === 'pret' ? 'erreur' : 'chargement'} horsLigne={horsLigne} modele={modele ?? VIDE} actions={actions} />;
}

const VIDE: ModeleEquipe = { cartes: [], total: 0, chargeMoyenne: null, acces: null, suggestion: null };

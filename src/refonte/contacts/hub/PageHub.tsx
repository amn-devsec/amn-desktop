import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssistant } from '../../../assistant/AssistantContext';
import { NAV_ITEMS } from '../../../data/navigation';
import { isModuleAllege, isModuleEnabled } from '../../../data/spaces';
import { useSourcesContacts } from '../sources/depuisApp';
import { modeleHub, type GroupeHub, type SuggestionAppel } from './modele';
import { VueHub, type ActionsHub } from './VueHub';

/**
 * LA VUE D'ENSEMBLE « MES CONTACTS ET CLIENTS » (F10) — la vue branchée sur les collections réelles.
 *
 * Elle s'affiche dans la zone principale de la coquille, substituée à la page générique `/ensemble/contacts`
 * (`substitutions/declarations/contacts.tsx`). Elle ne lit que `useSourcesContacts` et ne crée rien : « Préparer l'appel »
 * ouvre la fiche du client et le panneau d'Ajmani, sans rien envoyer.
 *
 * Les tuiles : seulement celles dont le module existe au catalogue de cette organisation (un module fermé ou allégé ne
 * laisse pas de tuile qui mène à l'Accueil).
 */
const CLE_MASQUEE = 'amn.refonte.contacts.suggestionMasquee';
const SEPT_JOURS_MS = 7 * 24 * 3_600_000;

function useMaintenant(pas = 60_000): number {
  const [maintenant, setMaintenant] = useState(() => Date.now());
  useEffect(() => {
    const minuteur = window.setInterval(() => setMaintenant(Date.now()), pas);
    return () => window.clearInterval(minuteur);
  }, [pas]);
  return maintenant;
}

/** « Plus tard » masque la suggestion 7 jours, pour ce client, sur ce poste. */
function lireMasquee(maintenant: number): number | null {
  try {
    const brut = window.localStorage.getItem(CLE_MASQUEE);
    if (!brut) return null;
    const { clientId, jusqua } = JSON.parse(brut) as { clientId: number; jusqua: number };
    return jusqua > maintenant ? clientId : null;
  } catch {
    return null;
  }
}

/** Ne garde que les tuiles dont la route est au catalogue ET dont le module est ouvert à l'organisation. */
export function tuilesAccessibles(groupes: GroupeHub[]): GroupeHub[] {
  const catalogue = new Map(NAV_ITEMS.map((i) => [i.to, i.key]));
  return groupes
    .map((g) => ({
      ...g,
      tuiles: g.tuiles.filter((t) => {
        const cle = catalogue.get(t.vers);
        return cle != null && isModuleEnabled(cle) && !isModuleAllege(cle);
      }),
    }))
    .filter((g) => g.tuiles.length > 0);
}

export default function PageHub(): React.ReactElement {
  const navigate = useNavigate();
  const { open: ouvrirAjmani } = useAssistant();
  const maintenant = useMaintenant();
  const { statut, sources } = useSourcesContacts(maintenant);
  const [masquee, setMasquee] = useState<number | null>(() => lireMasquee(Date.now()));

  const modele = useMemo(() => {
    if (!sources) return null;
    const m = modeleHub(sources);
    return { ...m, groupes: tuilesAccessibles(m.groupes), suggestion: m.suggestion && m.suggestion.clientId === masquee ? null : m.suggestion };
  }, [sources, masquee]);

  const versClient = useCallback((clientId: number) => navigate('/clients', { state: { focusClientId: clientId } }), [navigate]);

  const actions: ActionsHub = useMemo(
    () => ({
      nouveauClient: () => navigate('/clients', { state: { nouveau: true } }),
      personnaliser: () => navigate('/bibliotheque'),
      ouvrirClient: versClient,
      preparerAppel: (s: SuggestionAppel) => {
        versClient(s.clientId);
        ouvrirAjmani();
      },
      plusTard: (s: SuggestionAppel) => {
        try {
          window.localStorage.setItem(CLE_MASQUEE, JSON.stringify({ clientId: s.clientId, jusqua: Date.now() + SEPT_JOURS_MS }));
        } catch {
          /* stockage refusé : la suggestion revient au prochain chargement */
        }
        setMasquee(s.clientId);
      },
      ouvrirAttente: () => navigate('/messages-prives'),
      ouvrirRdv: () => navigate('/agenda'),
      reessayer: () => window.location.reload(),
    }),
    [navigate, ouvrirAjmani, versClient],
  );

  if (!modele) {
    return <VueHub statut={statut === 'pret' ? 'erreur' : 'chargement'} modele={VIDE} actions={actions} versTousLesModules="/tous-les-modules" />;
  }
  return <VueHub statut="pret" modele={modele} actions={actions} versTousLesModules="/tous-les-modules" />;
}

const VIDE = modeleHub({
  maintenant: 0,
  aujourdhui: '1970-01-01',
  moi: { prenom: '', email: '' },
  clients: [],
  devis: [],
  factures: [],
  avis: [],
  evenements: [],
  prospects: [],
  relances: [],
  fidelite: [],
  fournisseurs: [],
  partenaires: null,
  equipe: [],
  presence: false,
  interlocuteurs: null,
  attentes: null,
  echanges: [],
});

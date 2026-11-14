import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useOutlet } from 'react-router-dom';
import { useSourcesContacts } from '../sources/depuisApp';
import { salutationDe } from '../hub/modele';
import { filtrerEtTrier, modeleClients, type ModeleClients } from './modele';
import { VueClients, type ActionsClients, type FiltresClients } from './VueClients';

/**
 * « CLIENTS » (H05) — la page branchée sur les collections réelles, substituée à `/clients`
 * (`substitutions/declarations/contacts.tsx`).
 *
 * Elle montre la mosaïque. Tout ce qui n'est pas encore refondu (la fiche, la création, les devis, les sites liés)
 * reste servi par l'écran d'origine, que la substitution laisse dans l'`Outlet` : une demande d'ouverture d'un client
 * (`state.focusClientId`, que F10 et les mentions @client envoient) ou de création (`state.nouveau`) passe la main à
 * l'écran d'origine, qui garde la main jusqu'à ce qu'on quitte `/clients`.
 */
function useMaintenant(pas = 60_000): number {
  const [maintenant, setMaintenant] = useState(() => Date.now());
  useEffect(() => {
    const minuteur = window.setInterval(() => setMaintenant(Date.now()), pas);
    return () => window.clearInterval(minuteur);
  }, [pas]);
  return maintenant;
}

const FILTRES_DE_DEPART: FiltresClients = { segment: 'tous', recherche: '', responsables: new Set(), tri: 'aTraiter', affichage: 'mosaique', page: 0 };

export default function PageClients(): React.ReactElement {
  const location = useLocation();
  const navigate = useNavigate();
  const origine = useOutlet();
  const etat = location.state as { focusClientId?: number; nouveau?: boolean } | null;
  const demande = etat?.focusClientId != null || etat?.nouveau === true;
  // Une fois la main passée à l'écran d'origine, elle y reste : il nettoie lui-même `location.state`.
  const [passee, setPassee] = useState(demande);
  useEffect(() => { if (demande) setPassee(true); }, [demande]);

  const maintenant = useMaintenant();
  const { statut, sources } = useSourcesContacts(maintenant);
  const [filtres, setFiltres] = useState<FiltresClients>(FILTRES_DE_DEPART);

  const modele: ModeleClients | null = useMemo(() => (sources ? modeleClients(sources) : null), [sources]);
  const visibles = useMemo(() => (modele ? filtrerEtTrier(modele, filtres) : []), [modele, filtres]);

  const ouvrir = useCallback((id: number) => { setPassee(true); navigate('/clients', { state: { focusClientId: id } }); }, [navigate]);
  const nouveau = useCallback(() => { setPassee(true); navigate('/clients', { state: { nouveau: true } }); }, [navigate]);

  // « N » : nouveau client, hors d'un champ de saisie.
  useEffect(() => {
    if (passee) return undefined;
    const sur = (e: KeyboardEvent) => {
      const cible = e.target as HTMLElement | null;
      if (e.key.toLowerCase() !== 'n' || e.metaKey || e.ctrlKey || e.altKey) return;
      if (cible && (cible.tagName === 'INPUT' || cible.tagName === 'TEXTAREA' || cible.tagName === 'SELECT' || cible.isContentEditable)) return;
      e.preventDefault();
      nouveau();
    };
    window.addEventListener('keydown', sur);
    return () => window.removeEventListener('keydown', sur);
  }, [passee, nouveau]);

  const actions: ActionsClients = useMemo(
    () => ({
      ouvrir,
      nouveau,
      changer: (f) => setFiltres((cur) => ({ ...cur, ...f })),
      effacerFiltres: () => setFiltres((cur) => ({ ...FILTRES_DE_DEPART, tri: cur.tri, affichage: cur.affichage })),
      reessayer: () => window.location.reload(),
    }),
    [ouvrir, nouveau],
  );

  if (passee && origine) return <>{origine}</>;

  const horsLigne = typeof navigator !== 'undefined' && navigator.onLine === false;
  return (
    <VueClients
      statut={modele ? 'pret' : statut === 'pret' ? 'erreur' : 'chargement'}
      horsLigne={horsLigne}
      modele={modele ?? MODELE_VIDE}
      visibles={visibles}
      filtres={filtres}
      actions={actions}
      prenom={sources?.moi.prenom ?? ''}
      salutation={salutationDe(maintenant)}
    />
  );
}

const MODELE_VIDE: ModeleClients = {
  tuiles: [],
  total: 0,
  segments: { tous: 0, actifs: 0, aRelancer: 0, impayes: 0 },
  portefeuille: { bonne: 0, aSurveiller: 0, fragile: 0 },
  payesEnAvance: 0,
  responsables: [],
  impayes: 0,
  prochainRdv: null,
};

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useOutlet, useSearchParams } from 'react-router-dom';
import { useSourcesContacts } from '../sources/depuisApp';
import { salutationDe } from '../hub/modele';
import { filtrerEtTrier, modeleClients, type ModeleClients } from './modele';
import PageFiche from '../fiche/PageFiche';
import { VueClients, type ActionsClients, type FiltresClients } from './VueClients';

/**
 * « CLIENTS » (H05) — la page branchée sur les collections réelles, substituée à `/clients`
 * (`substitutions/declarations/contacts.tsx`).
 *
 * Elle montre la mosaïque, et la fiche d'un client (G04) à `?fiche=<id>` : une demande d'ouverture (`state.focusClientId`,
 * que F10 et les mentions @client envoient) devient cette adresse. Ce qui n'est pas encore refondu (la création, la
 * modification, les notes, l'historique, les sites liés) reste servi par l'écran d'origine, que la substitution laisse
 * dans l'`Outlet` : « Modifier la fiche » et « Nouveau client » lui passent la main, et il la garde jusqu'à ce qu'on
 * quitte `/clients`.
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
  const [params, setParams] = useSearchParams();
  const etat = location.state as { focusClientId?: number; nouveau?: boolean; origine?: boolean } | null;
  const fiche = Number(params.get('fiche')) || null;
  const demande = etat?.origine === true || etat?.nouveau === true;
  // Une fois la main passée à l'écran d'origine, elle y reste : il nettoie lui-même `location.state`.
  const [passee, setPassee] = useState(demande);
  useEffect(() => { if (demande) setPassee(true); }, [demande]);

  const maintenant = useMaintenant();
  const { statut, sources } = useSourcesContacts(maintenant);
  const [filtres, setFiltres] = useState<FiltresClients>(FILTRES_DE_DEPART);

  const modele: ModeleClients | null = useMemo(() => (sources ? modeleClients(sources) : null), [sources]);
  const visibles = useMemo(() => (modele ? filtrerEtTrier(modele, filtres) : []), [modele, filtres]);

  const ouvrir = useCallback((id: number) => setParams({ fiche: String(id) }), [setParams]);
  // F10 et les mentions @client envoient `state.focusClientId` : la fiche refondue le prend, l'état est nettoyé.
  useEffect(() => {
    if (etat?.focusClientId != null && etat.origine !== true) navigate(`/clients?fiche=${etat.focusClientId}`, { replace: true, state: null });
  }, [etat, navigate]);
  const modifier = useCallback((id: number) => { setPassee(true); navigate('/clients', { replace: true, state: { focusClientId: id, origine: true } }); }, [navigate]);
  const versLaListe = useCallback(() => setParams({}), [setParams]);
  const nouveau = useCallback(() => { setPassee(true); navigate('/clients', { state: { nouveau: true } }); }, [navigate]);

  // « N » : nouveau client, hors d'un champ de saisie.
  useEffect(() => {
    if (passee || fiche != null) return undefined;
    const sur = (e: KeyboardEvent) => {
      const cible = e.target as HTMLElement | null;
      if (e.key.toLowerCase() !== 'n' || e.metaKey || e.ctrlKey || e.altKey) return;
      if (cible && (cible.tagName === 'INPUT' || cible.tagName === 'TEXTAREA' || cible.tagName === 'SELECT' || cible.isContentEditable)) return;
      e.preventDefault();
      nouveau();
    };
    window.addEventListener('keydown', sur);
    return () => window.removeEventListener('keydown', sur);
  }, [passee, fiche, nouveau]);

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
  if (fiche != null) return <PageFiche clientId={fiche} onRetour={versLaListe} onModifier={() => modifier(fiche)} />;

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

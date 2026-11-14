import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssistant } from '../../../assistant/AssistantContext';
import { useSourcesContacts } from '../sources/depuisApp';
import { modeleFiche, type ElementOuvert } from './modele';
import { VueFiche, type ActionsFiche } from './VueFiche';

/**
 * « FICHE CLIENT » (G04) — la page branchée : le dossier d'un client, lu dans les collections réelles.
 *
 * Elle ne crée ni n'envoie rien : « Écrire » ouvre le courriel du client, « Nouveau devis » et « Nouvelle facture »
 * mènent aux modules de devis et de facturation (leurs écrans d'origine, pas encore refondus), « Relancer » et
 * « Envoyer » ouvrent la facture dans son module : l'envoi reste un geste fait là-bas, avec sa confirmation.
 */
function useMaintenant(pas = 60_000): number {
  const [maintenant, setMaintenant] = useState(() => Date.now());
  useEffect(() => {
    const minuteur = window.setInterval(() => setMaintenant(Date.now()), pas);
    return () => window.clearInterval(minuteur);
  }, [pas]);
  return maintenant;
}

export default function PageFiche({ clientId, onRetour, onModifier }: { clientId: number; onRetour: () => void; onModifier: () => void }): React.ReactElement {
  const navigate = useNavigate();
  const { open: ouvrirAjmani } = useAssistant();
  const maintenant = useMaintenant();
  const { statut, sources } = useSourcesContacts(maintenant);
  const modele = useMemo(() => (sources ? modeleFiche(sources, clientId) : null), [sources, clientId]);
  const principal = useMemo(() => {
    const liste = sources?.interlocuteurs?.filter((i) => i.organisationType === 'client' && i.organisationId === String(clientId)) ?? [];
    return [...liste].sort((a, b) => Number(b.favori) - Number(a.favori))[0] ?? null;
  }, [sources, clientId]);
  const courriel = principal?.email || modele?.coordonnees.email || '';

  const ouvrirElement = useCallback((e: ElementOuvert) => {
    if (e.genre === 'rdv') navigate('/agenda');
    else if (e.genre === 'devis') navigate('/facturation/devis');
    else navigate('/facturation', { state: { openInvoiceId: e.refId } });
  }, [navigate]);

  const actions: ActionsFiche = useMemo(
    () => ({
      ecrire: () => { if (courriel) window.open(`mailto:${courriel}`, '_self'); },
      devis: () => navigate('/facturation/devis'),
      facture: () => navigate('/facturation'),
      ouvrirElement,
      preparer: () => ouvrirAjmani(),
      relancer: ouvrirElement,
      envoyer: ouvrirElement,
      voirGarde: () => navigate('/garde'),
      mettreSousGarde: () => navigate('/garde'),
      ajouterInterlocuteur: onModifier,
      ouvrirInterlocuteur: onModifier,
      modifier: onModifier,
      retour: onRetour,
      reessayer: () => window.location.reload(),
      copier: (valeur: string) => { try { void navigator.clipboard?.writeText(valeur); } catch { /* presse-papiers refusé : rien à copier */ } },
    }),
    [courriel, navigate, ouvrirElement, ouvrirAjmani, onModifier, onRetour],
  );

  const prenom = principal ? principal.prenom : null;
  const horsLigne = typeof navigator !== 'undefined' && navigator.onLine === false;
  return (
    <VueFiche
      statut={!sources ? (statut === 'pret' ? 'erreur' : 'chargement') : modele ? 'pret' : 'archive'}
      horsLigne={horsLigne}
      modele={modele}
      actions={actions}
      destinataire={prenom}
    />
  );
}

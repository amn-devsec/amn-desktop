import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useClients } from '../../../state/useClients';
import { jourDeParis } from '../commun';
import { modeleCockpit } from './modele';
import { VueCockpit } from './VueCockpit';

/**
 * « COCKPIT D'UN CLIENT » (G08) — la page branchée : écran neuf `/cockpit-client` (registre, `nouveau`) ; aucun écran d'origine.
 *
 * L'application ne reçoit AUCUN agrégat de paiement, de connectés ou de santé d'intégration : les clés Stripe et Vercel restent côté serveur et
 * le serveur ne donne pas encore ces agrégats à cet écran (demande à amn-api). Les cinq instruments disent donc « non disponible », chacun avec
 * sa raison, au lieu de zéros qui mentiraient. Le client est celui de `?client=<id>`, à défaut le premier de la liste. Aucune clé, aucun jeton
 * ne passe par ce fichier.
 */
function useMaintenant(pas = 60_000): number {
  const [maintenant, setMaintenant] = useState(() => Date.now());
  useEffect(() => {
    const minuteur = window.setInterval(() => setMaintenant(Date.now()), pas);
    return () => window.clearInterval(minuteur);
  }, [pas]);
  return maintenant;
}

export default function PageCockpit(): React.ReactElement {
  const [params] = useSearchParams();
  const { clients } = useClients();
  const maintenant = useMaintenant();
  const voulu = Number(params.get('client')) || null;
  const client = clients.find((c) => c.id === voulu) ?? clients[0];
  const modele = useMemo(
    () => modeleCockpit({ client: client?.company || client?.name || '—', aujourdhui: jourDeParis(maintenant), maintenant, revenu: null, connectes: null, paiements: null, tickets: null, delaisTenusPourcent: null, sante: null }),
    [client, maintenant],
  );
  const horsLigne = typeof navigator !== 'undefined' && navigator.onLine === false;
  return <VueCockpit statut="pret" horsLigne={horsLigne} modele={modele} actions={{ reessayer: () => window.location.reload() }} contact="" mois={new Intl.DateTimeFormat('fr-FR', { month: 'long', timeZone: 'Europe/Paris' }).format(maintenant)} />;
}

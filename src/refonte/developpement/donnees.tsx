import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import type {
  Automatisation,
  Connecteur,
  CopieSauvegarde,
  Deploiement,
  DeploiementPlanifie,
  Depot,
  Execution,
  MesureServeur,
  PaiementConnecteurs,
  ResumeServeur,
  ServiceServeur,
  TachePlanifiee,
} from '../donnees';

/**
 * LOT-11 · LES DONNÉES DE L'ESPACE DÉVELOPPEMENT — une seule porte pour les sept écrans.
 *
 * Aujourd'hui, rien de tout cela n'a de source réelle : amn-api n'a aucune collection pour les dépôts, les
 * déploiements, la santé du serveur ou les coûts des connecteurs (connecteurs Code et Hébergement de LOT-12,
 * serveur de LOT-13). Deux cas, donc :
 *
 *   · `exemple` : le compte connecté est un compte d'essai (`@exemple.test`, API d’essai sur ce poste) — les
 *     écrans montrent les jeux fictifs de SIM (`src/refonte/donnees/`), au « maintenant » de référence des jeux,
 *     et le disent (« Données d'exemple ») ;
 *   · `non-branche` : tout autre compte — les écrans montrent leur état « à brancher », jamais une donnée inventée.
 *
 * Un banc de capture ou un test passe ses propres données par `FournisseurDeveloppement`.
 */

export type SourceDeveloppement = 'exemple' | 'non-branche';

export interface DonneesDeveloppement {
  source: SourceDeveloppement;
  /** Le « maintenant » des écrans (millisecondes) : celui des jeux en exemple, l'horloge sinon. */
  maintenant: number;
  pret: boolean;
  depots: readonly Depot[];
  deploiements: readonly Deploiement[];
  planifies: readonly DeploiementPlanifie[];
  executions: readonly Execution[];
  automatisations: readonly Automatisation[];
  taches: readonly TachePlanifiee[];
  mesures: readonly MesureServeur[];
  services: readonly ServiceServeur[];
  serveur: ResumeServeur | null;
  sauvegardes: readonly CopieSauvegarde[];
  connecteurs: readonly Connecteur[];
  paiements: readonly PaiementConnecteurs[];
  /** Tickets ouverts par dépôt (identifiant du ticket → statut), pour « n tickets ». */
  ticketsOuverts: ReadonlySet<string>;
  ticketsBloquants: ReadonlySet<string>;
}

export const VIDE: Omit<DonneesDeveloppement, 'source' | 'maintenant' | 'pret'> = {
  depots: [],
  deploiements: [],
  planifies: [],
  executions: [],
  automatisations: [],
  taches: [],
  mesures: [],
  services: [],
  serveur: null,
  sauvegardes: [],
  connecteurs: [],
  paiements: [],
  ticketsOuverts: new Set(),
  ticketsBloquants: new Set(),
};

const Contexte = createContext<DonneesDeveloppement | null>(null);

/** Pour un banc de capture ou un test : impose les données des écrans. */
export function FournisseurDeveloppement({ valeur, children }: { valeur: DonneesDeveloppement; children: React.ReactNode }) {
  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

/** Les jeux fictifs, assemblés une fois (à la demande, dans un morceau à part du paquet). */
let enCache: Promise<DonneesDeveloppement> | null = null;
export function donneesDExemple(): Promise<DonneesDeveloppement> {
  enCache ??= import('../donnees').then((m) => depuisMonde(m.construireMonde(), m.MAINTENANT_REFERENCE));
  return enCache;
}

/** Le monde fictif (`construireMonde()`) à la forme des écrans. */
export function depuisMonde(monde: ReturnType<typeof import('../donnees').construireMonde>, maintenant: number): DonneesDeveloppement {
  const ouverts = new Set<string>();
  const bloquants = new Set<string>();
  for (const t of monde.tickets) {
    if (t.termineLe) continue;
    ouverts.add(t.id);
    if (t.urgent) bloquants.add(t.id);
  }
  return {
    source: 'exemple',
    maintenant,
    pret: true,
    depots: monde.depots,
    deploiements: monde.deploiements,
    planifies: monde.deploiementsPlanifies,
    executions: monde.executions,
    automatisations: monde.automatisations,
    taches: monde.tachesPlanifiees,
    mesures: monde.mesuresServeur,
    services: monde.servicesServeur,
    serveur: monde.serveur[0] ?? null,
    sauvegardes: monde.sauvegardes,
    connecteurs: monde.connecteurs,
    paiements: monde.paiementsConnecteurs,
    ticketsOuverts: ouverts,
    ticketsBloquants: bloquants,
  };
}

const COMPTE_D_ESSAI = /@exemple\.test$/i;

/** Les données des écrans de l'espace Développement. */
export function useDonneesDeveloppement(): DonneesDeveloppement {
  const imposees = useContext(Contexte);
  const { user } = useAuth();
  const essai = !imposees && COMPTE_D_ESSAI.test(user?.email ?? '');
  const [exemple, setExemple] = useState<DonneesDeveloppement | null>(null);
  useEffect(() => {
    if (!essai) return undefined;
    let vivant = true;
    void donneesDExemple().then((d) => {
      if (vivant) setExemple(d);
    });
    return () => {
      vivant = false;
    };
  }, [essai]);
  if (imposees) return imposees;
  if (essai) return exemple ?? { source: 'exemple', maintenant: Date.now(), pret: false, ...VIDE };
  return { source: 'non-branche', maintenant: Date.now(), pret: true, ...VIDE };
}

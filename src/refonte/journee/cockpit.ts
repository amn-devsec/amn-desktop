import { ajouterJours, ecartPourcent, somme, type Jour, jourDeParis } from './commun';

/**
 * G08 · LE COCKPIT D'UN CLIENT — agrégats seulement (fiche G08, rubrique 6).
 *
 * Écran calculé (SIM : `attendusCockpit`). Il lit des CHIFFRES agrégés par le serveur : abonnements actifs, encaissé
 * du mois, tickets partagés, état des connecteurs. **Aucune clé, aucun jeton, aucun identifiant de paiement ne
 * traverse ce fichier** : les clés Stripe restent côté serveur, l'écran n'en voit que des valeurs masquées
 * (« connecté », « à reconnecter »). `check:journee` refuse tout champ qui ressemble à un secret dans l'entrée et la
 * sortie.
 *
 * Deux chiffres que les jeux ne portent pas sont rendus `null`, et dits dans `manque` : l'objectif du mois (un
 * réglage) et les utilisateurs connectés (une API du client). Un écran qui reçoit `null` n'affiche pas la tuile :
 * pas de faux chiffre (STATUT §1.10, règle A1).
 */

export type ColonneDeTicket = 'a-faire' | 'en-cours' | 'en-revue' | 'termine';
export const COLONNES_DE_TICKET: readonly ColonneDeTicket[] = ['a-faire', 'en-cours', 'en-revue', 'termine'];
/** Trois cartes visibles par colonne, les urgentes d'abord (fiche G08 et H25). */
export const CARTES_VISIBLES = 3;

export interface AbonnementDuCockpit {
  clientId: number | string;
  montantMensuelCents: number;
  depuis: Jour;
  etat: string;
  resilieLe: Jour | null;
}

export interface TicketDuCockpit {
  id: string;
  colonne: ColonneDeTicket;
  urgent: boolean;
  ordre: number;
  partageClient: boolean;
}

export interface EntreeCockpit {
  aujourdhui: Jour;
  abonnements: readonly AbonnementDuCockpit[];
  paiements: readonly { etat: string; date: string; montantCents: number }[];
  clients: readonly { id: number | string; debutLe: Jour }[];
  factures: readonly { status: string; dueAt: Jour }[];
  tickets: readonly TicketDuCockpit[];
  /** L'état des connecteurs, sans rien de plus que leur nom et leur état affiché. */
  connecteurs: readonly { nom: string; etat: string }[];
}

export interface Cockpit {
  /** Revenu récurrent mensuel : somme des abonnements actifs ; l'écart compare à il y a 30 jours. */
  mrr: { cents: number; ecartPourcent: number | null };
  encaisseDuMoisCents: number;
  clientsActifs: number;
  /** Clients du mois qui sont actifs (définition proposée par la fiche, à confirmer). */
  nouveauxClientsActifs: number;
  /** Factures émises dont l'échéance est passée. */
  impayes: number;
  tickets: Record<ColonneDeTicket, { compteur: number; visibles: string[] }>;
  sources: { nom: string; etat: string }[];
  objectifDuMois: null;
  utilisateursConnectes: null;
  manque: string[];
}

/** Un abonnement est actif un jour donné : commencé, et soit actif, soit résilié plus tard. */
export const abonnementActifAu = (a: Pick<AbonnementDuCockpit, 'depuis' | 'etat' | 'resilieLe'>, jour: Jour): boolean =>
  a.depuis <= jour && (a.etat === 'Actif' || (a.resilieLe !== null && a.resilieLe > jour));

export function cockpitDuClient(e: EntreeCockpit): Cockpit {
  const mrrAu = (j: Jour): number => somme(e.abonnements.filter((a) => abonnementActifAu(a, j)).map((a) => a.montantMensuelCents));
  const mois = e.aujourdhui.slice(0, 7);
  const actifs = new Set(e.abonnements.filter((a) => abonnementActifAu(a, e.aujourdhui)).map((a) => a.clientId));
  const partages = e.tickets.filter((t) => t.partageClient);
  const tickets = Object.fromEntries(
    COLONNES_DE_TICKET.map((colonne) => {
      const liste = partages
        .filter((t) => t.colonne === colonne)
        .sort((a, b) => Number(b.urgent) - Number(a.urgent) || a.ordre - b.ordre || a.id.localeCompare(b.id));
      return [colonne, { compteur: liste.length, visibles: liste.slice(0, CARTES_VISIBLES).map((t) => t.id) }];
    }),
  ) as Cockpit['tickets'];
  return {
    mrr: { cents: mrrAu(e.aujourdhui), ecartPourcent: ecartPourcent(mrrAu(e.aujourdhui), mrrAu(ajouterJours(e.aujourdhui, -30))) },
    encaisseDuMoisCents: somme(e.paiements.filter((p) => p.etat === 'réussi' && jourDeParis(p.date).startsWith(mois)).map((p) => p.montantCents)),
    clientsActifs: actifs.size,
    nouveauxClientsActifs: e.clients.filter((c) => c.debutLe.startsWith(mois) && actifs.has(c.id)).length,
    impayes: e.factures.filter((f) => f.status === 'issued' && f.dueAt < e.aujourdhui).length,
    tickets,
    sources: e.connecteurs.map((c) => ({ nom: c.nom, etat: c.etat })),
    objectifDuMois: null,
    utilisateursConnectes: null,
    manque: [
      'Objectif du mois (G08) : réglage d’objectif de revenu récurrent absent des réglages',
      'Utilisateurs connectés (G08) : aucune série par jour (API du client, à brancher côté serveur)',
    ],
  };
}

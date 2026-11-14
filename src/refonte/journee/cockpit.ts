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
 * Deux chiffres dépendent d'une donnée que l'entrée peut ne pas porter : l'objectif du mois (le réglage
 * `objectifMrrCents`) et les utilisateurs connectés (une série par jour, API du client). Sans la donnée, ils sont rendus
 * `null` et dits dans `manque` : l'écran n'affiche pas la tuile, pas de faux chiffre (STATUT §1.10, règle A1).
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
  /** Le réglage d'objectif de revenu récurrent mensuel, en centimes ; absent ou nul : pas d'objectif. */
  objectifMrrCents?: number | null;
  /** Les utilisateurs connectés par jour (API du client) ; absents ou vides : pas de série. */
  connexions?: readonly { jour: Jour; connectes: number }[];
}

export interface ObjectifDuMois {
  objectifCents: number;
  mrrCents: number;
  /** « Plus que… » : jamais négatif. */
  resteCents: number;
  /** Revenu ÷ objectif, arrondi à l'entier (l'anneau) ; peut dépasser 100. */
  partPourcent: number;
  /** (revenu ÷ objectif × jours du mois) − jour du mois, arrondi : positif « en avance de n jours », négatif « en retard de n jours ». */
  ecartDeRythmeJours: number;
  atteint: boolean;
}

export interface ConnexionsDeLaSemaine {
  aujourdhui: number;
  /** Les sept derniers jours connus, aujourd'hui en dernier. */
  parJour: { jour: Jour; connectes: number }[];
}

export const JOURS_DE_CONNEXIONS = 7;

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
  objectifDuMois: ObjectifDuMois | null;
  utilisateursConnectes: ConnexionsDeLaSemaine | null;
  manque: string[];
}

/** Un abonnement est actif un jour donné : commencé, et soit actif, soit résilié plus tard. */
export const abonnementActifAu = (a: Pick<AbonnementDuCockpit, 'depuis' | 'etat' | 'resilieLe'>, jour: Jour): boolean =>
  a.depuis <= jour && (a.etat === 'Actif' || (a.resilieLe !== null && a.resilieLe > jour));

/** L'objectif du mois et l'avancement du revenu récurrent ; `null` sans objectif (réglage absent ou nul). */
export function objectifDuMois(aujourdhui: Jour, mrrCents: number, objectifCents: number | null | undefined): ObjectifDuMois | null {
  if (objectifCents === null || objectifCents === undefined || !(objectifCents > 0)) return null;
  const [annee, mois, jourDuMois] = aujourdhui.split('-').map(Number);
  const joursDuMois = new Date(Date.UTC(annee, mois, 0)).getUTCDate();
  return {
    objectifCents,
    mrrCents,
    resteCents: Math.max(0, objectifCents - mrrCents),
    partPourcent: Math.round((mrrCents / objectifCents) * 100),
    ecartDeRythmeJours: Math.round((mrrCents / objectifCents) * joursDuMois - jourDuMois),
    atteint: mrrCents >= objectifCents,
  };
}

/** Les sept derniers jours de connexions jusqu'à aujourd'hui (les jours à venir ne comptent pas) ; `null` sans aucun jour. */
export function connexionsDeLaSemaine(aujourdhui: Jour, connexions: readonly { jour: Jour; connectes: number }[] | undefined): ConnexionsDeLaSemaine | null {
  const jours = (connexions ?? []).filter((c) => c.jour <= aujourdhui).sort((a, b) => a.jour.localeCompare(b.jour)).slice(-JOURS_DE_CONNEXIONS);
  if (jours.length === 0) return null;
  return { aujourdhui: jours[jours.length - 1].connectes, parJour: jours.map((c) => ({ jour: c.jour, connectes: c.connectes })) };
}

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
  const objectif = objectifDuMois(e.aujourdhui, mrrAu(e.aujourdhui), e.objectifMrrCents);
  const connectes = connexionsDeLaSemaine(e.aujourdhui, e.connexions);
  return {
    mrr: { cents: mrrAu(e.aujourdhui), ecartPourcent: ecartPourcent(mrrAu(e.aujourdhui), mrrAu(ajouterJours(e.aujourdhui, -30))) },
    encaisseDuMoisCents: somme(e.paiements.filter((p) => p.etat === 'réussi' && jourDeParis(p.date).startsWith(mois)).map((p) => p.montantCents)),
    clientsActifs: actifs.size,
    nouveauxClientsActifs: e.clients.filter((c) => c.debutLe.startsWith(mois) && actifs.has(c.id)).length,
    impayes: e.factures.filter((f) => f.status === 'issued' && f.dueAt < e.aujourdhui).length,
    tickets,
    sources: e.connecteurs.map((c) => ({ nom: c.nom, etat: c.etat })),
    objectifDuMois: objectif,
    utilisateursConnectes: connectes,
    manque: [
      ...(objectif === null ? ['Objectif du mois (G08) : réglage d’objectif de revenu récurrent absent des réglages'] : []),
      ...(connectes === null ? ['Utilisateurs connectés (G08) : aucune série par jour (API du client, à brancher côté serveur)'] : []),
    ],
  };
}

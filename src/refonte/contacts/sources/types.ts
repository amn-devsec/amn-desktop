import type {
  Achat, Avis, CompteFidelite, Devis, Evenement, Facture, FicheClient, Fournisseur, Interlocuteur, Membre, Prospect, Relance,
} from '../../donnees/types';
import type { Partenaire } from '../../donnees/types-suite';
import type { Jour } from '../commun';

/**
 * LES SOURCES DE LOT-02 — ce que les écrans lisent, dans UNE forme.
 *
 * Deux producteurs, un seul consommateur :
 *   · `depuisMonde` (SIM) : les jeux fictifs, pour les aperçus et les contrôles ;
 *   · `depuisApp` : les collections réelles de l'application (clients, factures, devis, prospects, rendez-vous…),
 *     rangées dans cette même forme.
 * Les écrans (`hub/`, `clients/`…) ne connaissent que `SourcesContacts` : une vue construite sur l'un se construit
 * pareil sur l'autre, et c'est ce qui permet de la contrôler sans application.
 *
 * Une source `null` n'est PAS une liste vide : elle dit « cette donnée n'existe pas (encore) dans l'application »
 * (la collection d'interlocuteurs, la messagerie G07…). L'écran l'affiche comme « non disponible », avec la raison,
 * au lieu de montrer un zéro qui mentirait.
 */
export interface AttenteClient {
  clientId: number | null;
  clientNom: string;
  /** Le début du message du client (une ligne). */
  extrait: string;
  /** Depuis quand il attend (ms). */
  depuisMs: number;
  canal: 'courriel' | 'message' | 'téléphone' | 'sms' | 'whatsapp';
}

export interface Echange {
  clientId: number;
  /** ISO. */
  at: string;
}

/** Ce que les écrans lisent d'un membre de l'équipe. */
export type MembreSource = Pick<Membre, 'id' | 'prenom' | 'nom' | 'nomComplet' | 'initiales' | 'email' | 'teinte' | 'statut'>;

export interface SourcesContacts {
  maintenant: number;
  aujourdhui: Jour;
  /** La personne connectée (la salutation, « mes clients »). */
  moi: { prenom: string; email: string };
  clients: FicheClient[];
  devis: Devis[];
  factures: Facture[];
  avis: Avis[];
  evenements: Evenement[];
  prospects: Prospect[];
  relances: Relance[];
  fidelite: CompteFidelite[];
  fournisseurs: Fournisseur[];
  /** `null` : l'application n'a pas d'historique d'achats auprès des fournisseurs (prix, délais, conformité : H45 dit « non disponible »). */
  achats: Achat[] | null;
  partenaires: Partenaire[] | null;
  equipe: MembreSource[];
  /** Vrai quand `equipe[].statut` est la VRAIE présence ; faux : l'application ne la connaît pas ici (la tuile dit « membres », pas « en ligne »). */
  presence: boolean;
  /** `null` : pas de collection d'interlocuteurs dans l'application (décision de Harun en attente, STATUT §1.28). */
  interlocuteurs: Interlocuteur[] | null;
  /** `null` : la messagerie des clients (G07) n'est pas branchée. */
  attentes: AttenteClient[] | null;
  /** Tous les échanges datés avec les clients (messages, courriels, appels, rendez-vous), pour « réchauffées cette semaine ». */
  echanges: Echange[];
}

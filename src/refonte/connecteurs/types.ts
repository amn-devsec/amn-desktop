/**
 * LE MODÈLE DES CONNECTEURS (LOT-12) — les formes, sans logique.
 *
 * Principe directeur (PLAN-10NOV §4, 07-ESPACE-DEV) : l'application fait le
 * maximum seule, sur le poste ou sur notre serveur. Une API payante n'est
 * jamais requise : c'est un connecteur facultatif, activé ou arrêté en trois
 * clics au plus, avec son coût affiché AVANT, et un plafond mensuel.
 *
 * Deux écrans reposent sur ce modèle sans en faire partie :
 *   · H21 Connecteurs (LOT-07, S6) : la baie de raccordement ;
 *   · DEV-couts Coûts et API (LOT-11, S8) : la part faite en local et le plafond.
 *
 * Règle d'or : AUCUN champ de ce modèle ne porte une clé, un jeton ou un mot de
 * passe. Seulement des états, des dates, des droits et des montants. Les clés
 * vivent côté serveur, chiffrées (voir `amnApi.ts`), et `check:connecteurs`
 * refuse tout champ dont le nom ressemble à un secret.
 */

import type { CleConnecteurs } from './i18n';

/** Une date du calendrier, `AAAA-MM-JJ`. */
export type Jour = string;

/** Les 14 catégories du §4 du plan, dans l'ordre du plan, puis « evenements » (Webhooks, STATUT §1.22). */
export type CategorieId =
  | 'messagerie'
  | 'agenda'
  | 'paiement'
  | 'banque'
  | 'stockage'
  | 'hebergement'
  | 'code'
  | 'notifications'
  | 'sms'
  | 'whatsapp'
  | 'telephonie'
  | 'signature'
  | 'assistant'
  | 'comptabilite'
  | 'evenements';

/** Où le travail se fait. `local` = sur le poste ou sur notre serveur, gratuit. */
export type Mode = 'local' | 'externe';

/**
 * L'état d'un connecteur externe, tel qu'on le dit partout où il compte.
 *
 *   · `connecte`    : branché et autorisé ; le mode externe est en service ;
 *   · `a-connecter` : rien de branché, ou une autorisation à refaire (voir `motif`) ;
 *   · `arrete`      : arrêté par une personne ou par le plafond ; le mode local reprend.
 */
export type EtatConnecteur = 'connecte' | 'a-connecter' | 'arrete';

/** Pourquoi un connecteur est « à connecter » ou « arrêté ». */
export type MotifEtat =
  /** Jamais branché : une prise libre. */
  | 'libre'
  /** Activé, en attente de l'autorisation chez le service. */
  | 'autorisation-en-attente'
  /** L'autorisation a expiré ou doit être renouvelée. */
  | 'a-reconnecter'
  /** Le service a répondu par une erreur qui n'est pas une autorisation expirée. */
  | 'erreur'
  /** Arrêté à la main. */
  | 'volontaire'
  /** Arrêté parce que le plafond mensuel est atteint. */
  | 'plafond';

/**
 * Les droits qu'un connecteur peut recevoir. « Lecture seule » par défaut ;
 * toute écriture est explicite, confirmée et journalisée (fiche H21 §6).
 */
export type Droit = 'lecture' | 'ajout' | 'ecriture' | 'envoi' | 'reception';

/** Comment un service facture. Connu seulement après relevé. */
export type Formule = 'gratuit' | 'abonnement' | 'a-l-usage' | 'commission';

/**
 * UN TARIF RELEVÉ — jamais deviné.
 *
 * Tant que personne n'a relevé le tarif sur la page du service, il vaut
 * `a-relever` : le coût ne peut pas s'afficher, donc le connecteur ne peut pas
 * s'activer. Un tarif relevé porte toujours sa source et sa date.
 */
export type Tarif =
  | { etat: 'a-relever' }
  /** Une brique qui tourne chez nous (poste, serveur, téléphone de l'équipe) : gratuite par construction, rien à relever. */
  | { etat: 'chez-nous' }
  | {
      etat: 'releve';
      formule: Formule;
      /** Abonnement mensuel, en centimes. */
      fixeMensuelCents?: number;
      /** Prix d'une unité au-delà de ce qui est inclus, en centimes (peut être fractionnaire : 0,45 c par SMS). */
      parUniteCents?: number;
      /** Ce que compte l'unité : « envoi », « SMS », « transaction »… (clé de `i18n.ts`). */
      unite?: UniteTarif;
      /** Unités incluses chaque mois dans l'abonnement. */
      inclusParMois?: number;
      /** Commission sur un montant encaissé, en dix-millièmes (1,5 % = 150). */
      commissionDixMillieme?: number;
      /** Partie fixe d'une commission, par transaction, en centimes. */
      commissionFixeCents?: number;
      /** Page publique du service où le tarif a été lu (https). */
      source: string;
      /** Le jour du relevé. */
      releveLe: Jour;
      /** Vrai si le montant relevé est hors taxes. */
      horsTaxes: boolean;
    };

export type UniteTarif = 'envoi' | 'sms' | 'message' | 'transaction' | 'minute' | 'go' | 'requete' | 'signature';

/** Où en est la version locale d'une catégorie. */
export type DisponibiliteLocale = 'prete' | 'partielle' | 'a-construire';

/** La version locale, gratuite, d'une catégorie. Elle existe TOUJOURS. */
export interface VersionLocale {
  /** Clé de texte (`i18n.ts`) du nom affiché. */
  nom: CleConnecteurs;
  /** Clé de texte de la description. */
  description: CleConnecteurs;
  disponibilite: DisponibiliteLocale;
  /** Ce qui, dans le dépôt, la porte déjà (chemins), pour la relecture. Vide si rien. */
  existant: readonly string[];
  /** Ce qu'elle attend d'amn-api pour aller au bout (identifiants de `amnApi.ts`). */
  attendDAmnApi: readonly string[];
}

/**
 * Une option branchable d'une catégorie — une prise de H21.
 *
 *   · `service`   : un service externe, facultatif, au tarif relevé (Stripe, Brevo…) ;
 *   · `chez-nous` : une brique à nous qu'il faut tout de même brancher (la boîte de
 *                   l'équipe, la passerelle SMS, une forge sur notre serveur). Gratuite,
 *                   elle reste du mode LOCAL.
 */
export interface OptionConnecteur {
  id: string;
  nature: 'service' | 'chez-nous';
  /** Nom tel qu'il se présente (marque, ou nom de la brique). */
  nom: string;
  tarif: Tarif;
  /** Les droits que ce connecteur demande, au plus. */
  droits: readonly Droit[];
}

export interface Categorie {
  id: CategorieId;
  /** Clé de texte du nom de la catégorie. */
  nom: CleConnecteurs;
  local: VersionLocale;
  options: readonly OptionConnecteur[];
  /** Les droits qu'aucun connecteur de cette catégorie ne reçoit jamais. */
  droitsInterdits: readonly Droit[];
}

/** Le coût montré à la personne, et qu'elle a accepté. Gardé pour la traçabilité. */
export interface CoutAccepte {
  optionId: string;
  /** Le tarif tel qu'il était affiché au moment du clic (copie, pas une référence). */
  tarif: Exclude<Tarif, { etat: 'a-relever' }>;
  plafondMensuelCents: number;
  accepteAt: number;
  parEmail: string;
}

/** Une erreur racontée en clair (fiche H21 §6) : jamais de détail technique sensible. */
export interface ErreurConnecteur {
  at: number;
  /** Clé de texte du message court. */
  message: CleConnecteurs;
  /** Éléments en attente depuis l'erreur (« 14 en attente »). */
  enAttente: number;
}

/**
 * UNE PRISE — une option d'une catégorie, telle qu'elle est chez nous, et son
 * état. Une catégorie peut avoir plusieurs prises (Vercel et Render pour
 * l'hébergement). Numéro de prise fixe, donné à l'ajout.
 */
export interface ConnecteurInstance {
  categorie: CategorieId;
  /** Numéro de prise fixe (H21 §13 : on ne trie jamais par état). */
  prise: number;
  optionId: string;
  etat: EtatConnecteur;
  /** `null` quand le connecteur est connecté. */
  motif: MotifEtat | null;
  droits: readonly Droit[];
  coutAccepte: CoutAccepte | null;
  derniereSynchroAt: number | null;
  /** Vrai pendant une synchronisation (au plus une animée à l'écran). */
  synchroEnCours: boolean;
  erreur: ErreurConnecteur | null;
  /** Widgets alimentés (« 7 widgets »). */
  widgets: number;
  /** Changé le — pour « arrêté le … ». */
  changeAt: number | null;
}

/** Ce que la consommation d'un mois dit, catégorie par catégorie (DEV-couts). */
export interface ConsommationMois {
  categorie: CategorieId;
  /** Opérations faites par la version locale (envois, rappels, tris…). */
  operationsLocales: number;
  /** Opérations faites par un service externe. */
  operationsExternes: number;
  /** Montant effectivement payé ce mois, en centimes (relevé par amn-api). */
  payeCents: number;
  /** Montant encaissé par le service (commission), en centimes. */
  encaisseCents?: number;
}

/** Une ligne du journal des connecteurs : chaque geste est tracé, sans aucun secret. */
export interface EntreeJournal {
  at: number;
  categorie: CategorieId;
  geste: 'activation' | 'autorisation' | 'arret' | 'erreur' | 'reconnexion';
  /** Qui a agi ; `null` quand c'est l'application (plafond, erreur du service). */
  parEmail: string | null;
  /** Clé de texte du détail. */
  detail: CleConnecteurs;
}

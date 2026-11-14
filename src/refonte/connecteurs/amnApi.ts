/**
 * « DEMANDÉ À AMN-API » — ce que ce dépôt ne fait pas, et ne contourne pas.
 *
 * amn-api vit hors de ce dépôt (PLAN-10NOV §4, « limite connue »). Chaque
 * entrée dit ce qui est attendu, ce que cela débloque, et ce qui marche en
 * attendant (le repli local). Aucune entrée ne décrit comment c'est protégé :
 * seulement le service attendu. La même liste figure dans
 * `docs/refonte/preparation/LOT-12-connecteurs.md`.
 */

export interface DemandeAmnApi {
  id: string;
  titre: string;
  attendu: string;
  debloque: readonly string[];
  /** Ce qui marche sans cette brique. Jamais vide : l'application reste utilisable. */
  repliLocal: string;
  /** 1 = d'abord. */
  priorite: 1 | 2 | 3;
}

export const DEMANDES_AMN_API: readonly DemandeAmnApi[] = [
  {
    id: 'coffre-cles',
    titre: 'Clés des connecteurs, côté serveur',
    attendu: 'Recevoir, garder chiffrées et renouveler les clés et autorisations des services externes ; ne jamais les renvoyer à l’application, seulement un état (présente, expire le…).',
    debloque: ['tout connecteur externe (H21)', 'renouvellement depuis le coffre-fort (H24)'],
    repliLocal: 'Tous les connecteurs restent en mode local ; aucune clé n’est saisie dans l’application.',
    priorite: 1,
  },
  {
    id: 'autorisation-services',
    titre: 'Retour d’autorisation des services',
    attendu: 'Recevoir le retour d’autorisation d’un service (troisième clic du parcours) et passer le connecteur à « connecté » ; idem pour « Reconnecter ».',
    debloque: ['activation en trois clics', 'reconnexion en deux clics'],
    repliLocal: 'Le connecteur reste « à connecter » ; le mode local continue.',
    priorite: 1,
  },
  {
    id: 'smtp-serveur',
    titre: 'Envoi des courriels depuis la boîte de l’équipe',
    attendu: 'Envoyer par SMTP, depuis le serveur, les courriels préparés par l’application (relances, rappels, accusés de réception), avec un état par envoi (parti, refusé, rebond).',
    debloque: ['courriels automatiques sans clic', 'rappels clients la veille', 'réponses automatiques'],
    repliLocal: 'Le courriel est prêt et part en un clic depuis la messagerie du poste (lien mailto).',
    priorite: 1,
  },
  {
    id: 'taches-planifiees-serveur',
    titre: 'Tâches planifiées, poste fermé',
    attendu: 'Exécuter à l’heure les planifications (rapports, relances du jour, rappels, sauvegardes) même quand aucun poste n’est ouvert, avec le même identifiant d’exécution que le planificateur local.',
    debloque: ['rapports du lundi à l’heure', 'rappels la nuit et le week-end', 'flux « Tous les jours à 08:00 »'],
    repliLocal: 'Le planificateur local tourne tant qu’un poste est ouvert et rattrape une fois à la réouverture.',
    priorite: 1,
  },
  {
    id: 'releve-consommation',
    titre: 'Compteurs de consommation et coupure au plafond',
    attendu: 'Compter, par connecteur et par mois, les opérations et le montant payé ; arrêter les connecteurs payants au plafond, côté serveur, même poste fermé.',
    debloque: ['DEV-couts (payé ce mois, part locale)', 'plafond et alerte à 80 %'],
    repliLocal: 'Sans connecteur payant actif, il n’y a rien à couper ; la part locale vaut 100 %.',
    priorite: 2,
  },
  {
    id: 'imap-serveur',
    titre: 'Lecture de la boîte de l’équipe',
    attendu: 'Lire par IMAP la boîte de l’équipe pour déclencher les flux « Quand un courriel arrive » et le tri, poste fermé.',
    debloque: ['flux sur courriel reçu', 'tri automatique des messages'],
    repliLocal: 'Le tri et les flux s’appliquent aux messages déjà présents dans l’application.',
    priorite: 2,
  },
  {
    id: 'webhooks-entrants',
    titre: 'Événements reçus des services',
    attendu: 'Recevoir les événements des services branchés (paiement reçu, signature faite) et les poser dans les collections.',
    debloque: ['flux « Quand un paiement est reçu » en mode API'],
    repliLocal: 'Le paiement est marqué à la main sur la facture ; le flux part de là.',
    priorite: 2,
  },
  {
    id: 'sauvegarde-serveur',
    titre: 'Sauvegarde nocturne chiffrée',
    attendu: 'Une sauvegarde chiffrée chaque nuit, hors du poste, et un essai de restauration régulier.',
    debloque: ['sauvegardes poste fermé (MO03)'],
    repliLocal: 'Export complet depuis le poste, avec le rythme et la rotation du moteur local.',
    priorite: 2,
  },
  {
    id: 'caldav-serveur',
    titre: 'Agenda en CalDAV',
    attendu: 'Exposer l’agenda intégré en CalDAV pour l’équipe.',
    debloque: ['agenda sur les téléphones sans service externe'],
    repliLocal: 'Agenda intégré dans l’application.',
    priorite: 3,
  },
  {
    id: 'passerelle-sms',
    titre: 'Relais vers le téléphone passerelle',
    attendu: 'Transmettre les SMS préparés au téléphone Android de l’équipe qui sert de passerelle, et remonter leur état.',
    debloque: ['SMS en mode local'],
    repliLocal: 'Le SMS est prêt et s’envoie à la main depuis un téléphone.',
    priorite: 3,
  },
  {
    id: 'etat-serveur',
    titre: 'État de notre serveur',
    attendu: 'Donner l’état du serveur maison (services, disque, dernière sauvegarde) quand il existera (LOT-13, reporté).',
    debloque: ['hébergement en mode local', 'DEV-serveur'],
    repliLocal: 'Rien d’affiché tant que le serveur n’existe pas.',
    priorite: 3,
  },
];

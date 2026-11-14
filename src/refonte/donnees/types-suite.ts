/**
 * FORMES DES JEUX « SUITE » — Écrire, Échanger, Créer, Outils, La Garde, Cyber,
 * et les écrans qui manquaient aux lots déjà faits (TVA, paie, tarifs,
 * partenaires, planning, défis).
 *
 * Mêmes règles de nommage que `types.ts` : un champ qui existe dans le dépôt
 * garde son nom ; un champ que seule une fiche réclame est en français et suit
 * sa fiche. Les règles que les fiches disent « à confirmer dans le code » sont
 * des propositions.
 *
 * Trois garde-fous propres à ces lots :
 *   · AUCUN SECRET, JAMAIS DE VALEUR : un secret n'a qu'un nom, un type, un
 *     responsable et des dates (H24) ; un connecteur n'a pas de clé (H21) ; une
 *     sauvegarde n'a ni chemin ni identifiant de stockage (MO03) ;
 *   · AUCUNE ADRESSE RÉELLE : sites et actifs sont en `.exemple.test`, les
 *     plaques de véhicules sont invalides par construction ;
 *   · RIEN D'OFFENSIF : les jeux Cyber ne portent que du pilotage (compteurs,
 *     états, accords, titres génériques de constats). Pas de technique, pas de
 *     charge, pas de nom d'outil réel, pas de vrai identifiant de faille
 *     (`FICT-AAAA-NNNN`).
 */

import type { Message } from '../../shared/api';
import type { Jour } from './outils';
import type { Facture } from './types';

/* ============================ Noms des jeux ============================ */

export const NOMS_DES_JEUX_SUITE = [
  // Compléments des lots déjà faits
  'echeancesFiscales', 'bulletins', 'prestations', 'partenaires', 'creneaux', 'defis', 'avoirs',
  // MR08 (boutique en ligne)
  'entonnoirBoutique', 'paniers', 'sessionsBoutique',
  // Développement (LOT-11)
  'dailyPriorities', 'engagementsDefis', 'utilisateursConnectes', 'boiteAZero', 'serveur', 'depots', 'deploiements', 'deploiementsPlanifies', 'executions', 'tachesPlanifiees', 'mesuresServeur', 'servicesServeur', 'paiementsConnecteurs',
  // Écrire
  'pages', 'fichiers', 'signatures', 'modeles', 'journal', 'textes', 'archives', 'connaissances', 'reglesArchivage', 'demandesRelecture',
  // Échanger
  'conversations', 'messages', 'canaux', 'annonces', 'courriels', 'salles', 'appels', 'reunions', 'partages', 'sondages', 'reponsesAuto',
  // Créer
  'articles', 'produits', 'commandes', 'chantiers', 'dossiersPhotos', 'marque', 'videos', 'pagesPubliques', 'etapesTournee', 'equipements',
  'ressources', 'reservations', 'vehicules', 'modelesControle', 'controles', 'ecarts',
  // Outils
  'corbeille', 'aide', 'secrets', 'sites', 'trackers', 'sauvegardes', 'operations', 'raccourcis', 'automatisations', 'connecteurs',
  'notifications', 'modelesMetier', 'usagesCalculs',
  // La Garde
  'organisations', 'actifs', 'alertes', 'incidents', 'vulnerabilites', 'rondes', 'evenementsSecurite', 'journalAcces', 'criteresMaturite', 'offresCyber',
  // Cyber
  'outilsCyber', 'accords', 'missions', 'constats', 'documentsCyber', 'logicielsClients', 'alertesVeille', 'fuites', 'dossiersConformite',
  'campagnes', 'parcSecurite',
] as const;
export type NomDuJeuSuite = (typeof NOMS_DES_JEUX_SUITE)[number];

/* ============== Compléments : TVA, paie, tarifs, partenaires, planning, défis ============== */

/** MA08. Le montant est celui à payer à l'organisme (ni HT ni TTC). */
export interface EcheanceFiscale {
  id: string;
  intitule: string;
  famille: 'TVA' | 'Cotisations' | 'Taxe' | 'Impôt sur les sociétés' | 'Bilan';
  mode: 'Déclaration en ligne' | 'Prélèvement automatique' | 'Avec l’expert-comptable';
  echeanceLe: Jour;
  montantCents: number | null;
  preparation: 'À préparer' | 'En préparation' | 'Prête';
  paiement: 'À payer' | 'Payée';
  payeLe: Jour | null;
  pieces: number;
}

/** MA11. L'application ne calcule ni brut ni cotisations : elle garde le net saisi ou importé. */
export interface Bulletin {
  id: string;
  membreEmail: string;
  mois: string;
  contrat: 'CDI' | 'CDD' | 'Apprentissage' | 'Temps partiel';
  netCents: number;
  heures: number;
  etat: 'À préparer' | 'À valider' | 'Prêt' | 'Validé' | 'Payé';
  paieLe: Jour;
  piece: string | null;
}

/** MA12. */
export interface Prestation {
  id: string;
  nom: string;
  precision: string;
  unite: 'forfait' | 'l’heure' | 'demi-journée' | 'mois';
  prixCents: number;
  coutCents: number | null;
  etat: 'active' | 'archivée';
  /** Quantité vendue sur le mois (pondère la marge moyenne). */
  ventesMois: number;
  historique: { le: Jour; parEmail: string; ancienCents: number; nouveauCents: number; motif: string }[];
}

/** MC05. */
export interface Partenaire {
  id: string;
  nom: string;
  nomCourt: string;
  description: string;
  icone: string;
  categorie: 'Fournisseur' | 'Prestataire' | 'Apporteur d’affaires' | 'Réseau';
  referents: string[];
  statut: 'Actif' | 'En pause';
  finContratLe: Jour | null;
  rythmeEchangesParMois: number | null;
  echanges90j: number;
  fournisseurId: string | null;
}

/** MJ03. `personnes` vide + `touteLEquipe` = tous les membres actifs. */
export interface Creneau {
  id: string;
  title: string;
  jour: Jour;
  debut: string;
  fin: string;
  personnes: string[];
  touteLEquipe: boolean;
  categorie: 'Ma journée' | 'Argent' | 'Clients' | 'Autre';
  lien: { type: 'client' | 'projet' | 'ticket' | null; id: string | null };
  repetition: null | 'chaque semaine';
  auteurEmail: string;
}

/** L07. Règles de calcul : propositions de la fiche. */
export interface Defi {
  id: string;
  titre: string;
  sousLigne: string;
  type: 'Compteur de jours' | 'Taux de tenue' | 'Seuil';
  source: { module: string; indicateur: string };
  debutLe: Jour;
  finLe: Jour | null;
  cible: number;
  valeurActuelle: number;
  participants: string[];
  etat: 'En cours' | 'Tenu' | 'Terminé';
  creeParEmail: string;
}

/* ================================ Écrire ================================ */

export interface Bloc {
  type: 'titre' | 'texte' | 'tache' | 'liste' | 'citation' | 'decision';
  texte: string;
  fait?: boolean;
  /** H10 : l'échéance d'un bloc tâche. */
  echeance?: Jour | null;
  /** H10 : les pages (identifiants) vers lesquelles ce bloc pointe — d'où les liens retour. */
  liens?: string[];
}

/** H10. */
export interface Page {
  id: string;
  title: string;
  icone: string;
  parentId: string | null;
  espace: 'Clients' | 'Équipe' | 'Modèles' | 'Personnel';
  clientId: number | null;
  blocs: Bloc[];
  statut: 'Brouillon' | 'En cours' | 'Terminée';
  auteurEmail: string;
  contributeurs: string[];
  modifieAt: string;
  modifieParEmail: string;
  favorisDe: string[];
  commentaires: number;
  versions: number;
  supprimeeLe: Jour | null;
  /** H10 : commentaires accrochés à un bloc (`bloc` = rang du bloc). */
  commentairesAncres: { id: string; bloc: number; auteurEmail: string; texte: string; le: string; resolu: boolean }[];
  /** H10 : qui écrit en ce moment (présence en direct) ; vide la plupart du temps. */
  presence: { email: string; tapeA: string }[];
  /** H10 : le rendez-vous lié à la page (propriété), ou null. */
  rendezVousId: string | null;
}

/** H11. Aucun contenu de fichier : seulement ses métadonnées. */
export interface Fichier {
  id: string;
  nom: string;
  extension: string;
  tailleOctets: number;
  typeMetier: 'Contrat' | 'Devis' | 'Facture' | 'Rapport' | 'Photo' | 'Présentation' | 'Tableur' | 'Autre';
  proprietaireEmail: string;
  modifieAt: string;
  dossier: string;
  clientId: number | null;
  signature: 'Signé' | 'En attente de signature' | null;
  partages: { email: string; droit: 'Propriétaire' | 'Modification' | 'Lecture seule' }[];
  /** Un lien externe a toujours une durée (7, 30 ou 90 jours) : jamais illimité. Le jeton reste côté serveur. */
  lienExterne: null | { jours: 7 | 30 | 90; creeLe: Jour; expireLe: Jour };
  versions: number;
  archive: boolean;
  /** H11 : l'intercalaire (le classeur) du document ; `dossier` en est le chemin. */
  intercalaire: string;
  /** H11 : les faits relevés d'un contrat (null pour tout autre document). */
  faitsReleves: null | { parties: string[]; echeanceLe: Jour; montantCents: number | null; reconductionTacite: boolean };
}

export type EtatSignature = 'À envoyer' | 'Envoyée' | 'Ouverte' | 'Partiellement signée' | 'Signée' | 'Refusée' | 'Expirée';

/** H12. */
export interface DemandeSignature {
  id: string;
  fichierId: string;
  titre: string;
  clientId: number | null;
  montantCents: number | null;
  signataires: { id: string; nom: string; email: string; ordre: number; role: 'signataire' | 'copie'; statut: 'En attente' | 'Ouvert' | 'Signé' | 'Refusé'; signeAt: string | null }[];
  /** H12 : les champs posés sur le document ; `signataireId` = `signataires[].id`. */
  champs: { id: string; type: 'signature' | 'paraphe' | 'date' | 'nom' | 'case' | 'texte'; page: number; signataireId: string; obligatoire: boolean; rempli: boolean }[];
  /** H12 : les relances automatiques (planifiées), distinctes des relances déjà faites (`relances`). */
  relanceAuto: { active: boolean; prochaineAt: string | null; intervalleJours: number };
  envoyeAt: string | null;
  echeanceLe: Jour | null;
  relances: number;
  etat: EtatSignature;
  /** Début de l'empreinte du document, comme l'écran l'affiche (8 caractères). */
  empreinteCourte: string;
}

/** ME03. */
export interface ModeleDocument {
  id: string;
  nom: string;
  description: string;
  type: 'page' | 'texte' | 'document' | 'demande de signature' | 'devis' | 'bon';
  icone: string;
  auteurEmail: string;
  origine: 'créé' | 'importé' | 'galerie';
  usagesMois: number;
  creationsDuTypeMois: number;
  utilisateurs30j: string[];
  archive: boolean;
}

/** ME01. Privé par défaut : seule la personne le voit. */
export interface EntreeJournal {
  id: string;
  jour: Jour;
  commenceA: string;
  texte: string;
  apercu: string;
  etiquettes: string[];
  /** ME01 : cinq niveaux (difficile, moyen, bien, très bien, excellent). */
  humeur: 'difficile' | 'moyen' | 'bien' | 'très bien' | 'excellent';
  /** Le niveau de 1 à 5 de `humeur` (difficile = 1). */
  humeurNiveau: 1 | 2 | 3 | 4 | 5;
  /** ME01 : l'énergie du jour, de 1 à 5. */
  energie: 1 | 2 | 3 | 4 | 5;
  /** ME01 : jusqu'à trois mercis du jour. */
  mercis: string[];
  auteurEmail: string;
}

/** ME02. */
export interface TexteRedige {
  id: string;
  titre: string;
  type: 'e-mail' | 'annonce' | 'réponse à un avis' | 'fiche produit' | 'conditions' | 'autre';
  interlocuteurId: string | null;
  destinataireNom: string;
  ton: 'Courtois' | 'Poli et direct' | 'Chaleureux' | 'Formel' | 'Décontracté';
  langue: string;
  traductions: { langue: string; etat: 'À jour' | 'À mettre à jour' }[];
  etat: 'brouillon' | 'à valider' | 'prêt' | 'envoyé';
  relecteurEmail: string | null;
  auteurEmail: string;
  modifieAt: string;
  apercu: string;
}

/** ME04. */
export interface ElementArchive {
  id: string;
  nom: string;
  sousTitre: string;
  type: 'Document' | 'Facture' | 'Message';
  tailleOctets: number;
  archiveLe: Jour;
  origine: string;
  mode: 'règle' | 'à la main';
  parEmail: string | null;
  conserverJusquau: Jour;
  /** ME04 : le texte indexé (de quoi retrouver l'élément en cherchant dans son contenu). */
  texteIndexe: string;
  /** ME04 : les restaurations de l'élément (restauré puis re-archivé). */
  restaurations: { le: Jour; parEmail: string }[];
}

/** ME04 : une règle de conservation (« archiver les factures réglées depuis N mois »). */
export interface ReglePourArchiver {
  id: string;
  type: 'facture-payee' | 'conversation-silencieuse' | 'devis-refuse';
  apresMois: number;
  active: boolean;
  dernierePasseeLe: Jour | null;
}

/** F20 : une demande de relecture est un objet (un document attend un relecteur). */
export interface DemandeRelecture {
  id: string;
  titre: string;
  etat: 'Brouillon partagé' | 'Relecture demandée' | 'En signature' | 'Terminé';
  relecteurEmail: string | null;
  demandeurEmail: string;
  demandeAt: string;
  /** La page ou le fichier relu. */
  objetId: string;
}

/** ME05. */
export interface EntreeConnaissance {
  id: string;
  type: 'article' | 'procédure' | 'question';
  titre: string;
  blocs: Bloc[];
  auteurEmail: string;
  contributeurs: string[];
  creeLe: Jour;
  majLe: Jour;
  lectures: { email: string; jour: Jour }[];
  aLireAbsolument: boolean;
  etat: 'brouillon' | 'publié';
  versions: number;
  questionsLieesIds: string[];
  /** ME05 : la rubrique, les étapes (articles et procédures) et les articles liés. */
  rubrique: string;
  etapes: { titre: string; texte: string; astuce?: string }[];
  articlesLiesIds: string[];
}

/* ================================ Échanger ================================ */

/** G07. */
export interface Conversation {
  id: string;
  type: 'équipe' | 'personne' | 'client' | 'annonces';
  nom: string;
  membres: string[];
  clientId: number | null;
  dernierMessageAt: string;
  apercu: string;
  /** Messages non lus par la personne connectée. */
  nonLus: number;
}

/** G07. Sur-ensemble de `Message` (id numérique, pièces jointes vides). */
export interface MessageEquipe extends Message {
  conversationId: string;
  lu: boolean;
}

/** MX04. */
export interface Canal {
  id: string;
  nom: string;
  description: string;
  visibilite: 'public' | 'privé';
  membres: string[];
  epinglePar: string[];
  archive: boolean;
  alerteTicketsUrgents: boolean;
  dernierMessageAt: string;
  apercu: string;
  nonLus: number;
}

/** H14. */
export interface Annonce {
  id: string;
  auteurEmail: string;
  publieeAt: string;
  titre: string;
  texte: string;
  categorie: 'Équipe' | 'Clients' | 'Sécurité' | 'Ressources humaines' | 'Outils';
  epinglee: boolean;
  confirmations: { email: string; at: string }[];
}

/** MX01. */
export interface Courriel {
  id: string;
  dossier: 'réception' | 'envoyés' | 'brouillons' | 'archive';
  expediteurNom: string;
  expediteurEmail: string;
  organisation: string;
  destinataires: string[];
  objet: string;
  corps: string;
  at: string;
  etiquettes: string[];
  lu: boolean;
  important: boolean;
  piecesJointes: { nom: string; tailleOctets: number }[];
  clientId: number | null;
  tacheId: string | null;
  envoiProgrammeAt: string | null;
}

/** H13. */
export interface Salle {
  id: string;
  nom: string;
  description: string;
  type: 'équipe permanente' | 'invités par lien' | 'supervision' | 'projet';
  famille: 'jour' | 'contacts' | 'creer' | 'outils';
  connectes: string[];
}

export interface Appel {
  id: string;
  titre: string;
  salleId: string;
  debutAt: string;
  dureeMin: number;
  participants: string[];
  resume: string | null;
  decisions: string[];
  actions: string[];
}

/** MX02. */
export interface Reunion {
  id: string;
  titre: string;
  debutAt: string;
  dureeMin: number;
  lieu: 'Salle clients' | 'Visio' | 'Équipe';
  organisateurEmail: string;
  inscrits: number;
  preparation: { libelle: string; fait: boolean }[];
  compteRendu: null | { resume: string; decisions: string[]; actions: string[] };
  evenementId: string | null;
}

/** MX03. */
export interface Partage {
  id: string;
  fichierId: string;
  nom: string;
  tailleOctets: number;
  note: string;
  destinataire: string;
  creeAt: string;
  expireAt: string | null;
  protection: 'mot de passe' | 'code par courriel' | 'aucune';
  droits: 'télécharger' | 'consulter';
  vu: 'Non ouvert' | 'Ouvert' | 'Téléchargé';
  revoque: boolean;
}

/** MX05. */
export interface Sondage {
  id: string;
  titre: string;
  type: 'choix' | 'date' | 'note';
  options: { libelle: string; votes: number }[];
  invites: number;
  repondants: number;
  creeAt: string;
  echeanceAt: string | null;
  statut: 'Nouveau' | 'En cours' | 'Terminé';
  auteurEmail: string;
  anonyme: boolean;
  icone: string;
}

/** MX06. Une règle naît toujours éteinte. */
export interface ReponseAuto {
  id: string;
  nom: string;
  declencheur: { type: 'horaires' | 'mots-clés' | 'événement' | 'période'; libelle: string };
  reponse: { type: 'Texte' | 'Formulaire' | 'Alerte'; modele: string };
  canaux: string[];
  actif: boolean;
  envois: number;
  creeLe: Jour;
}

/* ================================== Créer ================================== */

export interface MouvementStock {
  id: string;
  le: Jour;
  delta: number;
  motif: 'Réception' | 'Vente' | 'Inventaire' | 'Perte' | 'Retour';
  /** H15 : où le mouvement a eu lieu (les ventes sortent du lieu de l'article, les réceptions y entrent). */
  emplacement: string;
}

/** H15. La quantité est la somme des mouvements : elle ne s'édite pas directement. */
export interface ArticleStock {
  id: string;
  nom: string;
  sku: string;
  fournisseurId: string | null;
  seuilAlerte: number;
  prixAchatCents: number;
  emplacement: string;
  mouvements: MouvementStock[];
  /** H15 : le niveau qu'on vise (trois fois le seuil d'alerte). */
  niveauCible: number;
  /** H15 : les commandes passées au fournisseur, reçues ou en route. */
  commandesFournisseur: { id: string; quantite: number; commandeeLe: Jour; arriveeLe: Jour; recue: boolean }[];
}

/** MR05. */
export interface Produit {
  id: string;
  nom: string;
  description: string;
  prixCents: number;
  type: 'produit en stock' | 'service' | 'abonnement';
  quantite: number | null;
  niveauCible: number | null;
  seuilAlerte: number | null;
  responsableEmail: string;
  fournisseurId: string | null;
  articleId: string | null;
  etat: 'actif' | 'archivé';
  /** MR05. */
  photos: number;
  tvaPourcent: 20 | 10 | 5.5;
  prixAchatCents: number | null;
  /** Le niveau conseillé : quatre semaines de ventes moyennes (null pour un service). */
  niveauConseille: number | null;
  /** Les ventes des huit dernières semaines, de la plus ancienne à la plus récente (se lisent dans les mouvements de l'article). */
  ventesParSemaine: number[];
}

/** MR07 et MR08 : le même numéro (« #1042 ») dans les deux écrans. */
export interface Commande {
  id: string;
  numero: string;
  clientId: number | null;
  clientNom: string;
  lignes: { produitId: string; libelle: string; quantite: number; prixCents: number }[];
  remise: 'Retrait' | 'Colis' | 'Tournée';
  creeLe: Jour;
  prevueLe: Jour;
  responsableEmail: string;
  urgente: boolean;
  etapes: { libelle: string; fait: boolean }[];
  preuveRemise: boolean;
  paiement: 'Payé' | 'À payer';
  preparation: 'À préparer' | 'En préparation' | 'Prête' | 'Remise';
  /** MR07 : l'instant de création (ISO), le même jour que `creeLe`. */
  creeAt: string;
  /** MR07 : l'heure à laquelle la commande doit être prête ce jour-là (`HH:MM`). */
  heureEcheance: string;
  /** MR07 : le jour où elle a été remise (null tant qu'elle ne l'est pas). */
  livreeLe: Jour | null;
  /** MR07 : réglée en ligne (colis et tournées payés) plutôt qu'au retrait. */
  paiementEnLigne: boolean;
}

/** H16. */
export interface Chantier {
  id: string;
  nom: string;
  sousTitre: string;
  clientId: number | null;
  debutLe: Jour;
  finPrevueLe: Jour;
  /** `poids` : part de l'étape dans le chantier (la somme fait 100) ; `partRealisee` : de 0 à 1. */
  etapes: { nom: string; semaine: number; faite: boolean; poids: number; partRealisee: number }[];
  /** H16 : interventions planifiées sur le chantier. */
  interventions: { id: string; le: Jour; libelle: string; fait: boolean }[];
  /** H16 : livraisons rattachées au chantier. */
  livraisons: { id: string; libelle: string; le: Jour; recue: boolean }[];
  equipe: string[];
  budgetCents: number;
  depenseCents: number;
  teinte: number;
  statut: 'À venir' | 'En cours' | 'En retard' | 'Terminé';
}

/** MR10. Aucune image : seulement des repères de photos. */
export interface DossierPhoto {
  id: string;
  titre: string;
  description: string;
  chantierId: string | null;
  clientId: number | null;
  responsables: string[];
  photos: { id: string; phase: 'Avant' | 'Pendant' | 'Après'; le: Jour; lieu: string; auteurEmail: string; orientation: 'portrait' | 'paysage' }[];
  demarre: boolean;
  debutPrevuLe: Jour;
  /** MR10 : la signature du client à la remise du dossier (null tant qu'il n'a pas signé). */
  signatureClient: { le: Jour; signataire: string } | null;
}

/** H17. Palette et polices sont celles de l'entreprise d'exemple, pas des jetons de l'application. */
export interface Marque {
  id: string;
  nom: string;
  logos: { variante: 'fond noir' | 'fond clair'; format: 'SVG' | 'PNG' }[];
  /** `role` et `partUsage` (la somme fait 100) : à quoi sert chaque couleur et combien on s'en sert. */
  palette: { nom: string; hex: string; role: 'Principale' | 'Secondaire' | 'Accent' | 'Fond' | 'Texte'; partUsage: number }[];
  /** H17 : les règles « à éviter ». */
  aEviter: string[];
  modifieLe: Jour;
  typographie: { famille: string; graisses: number[] };
  modelesVisuels: { nom: string; format: string; largeur: number; hauteur: number }[];
}

/** MR01. */
export interface Video {
  id: string;
  titre: string;
  description: string;
  etape: 'Idée' | 'Tournage' | 'Montage' | 'Sous-titrage' | 'Relecture' | 'Publiée';
  avancement: number;
  responsables: string[];
  prevueLe: Jour;
  dureeSec: number;
  format: 'horizontal' | 'vertical';
  fichiers: string[];
  lienPublication: string | null;
  vues: number;
  /** MR01 : les plans du montage. */
  plans: { id: string; titre: string; debutSec: number; dureeSec: number }[];
  sousTitres: { langue: string; etat: 'brouillon' | 'relu' }[];
  commentaires: { id: string; auteurEmail: string; texte: string; le: Jour; resolu: boolean }[];
  publieeLe: Jour | null;
}

/** MR02. */
export interface PagePublique {
  id: string;
  titre: string;
  description: string;
  versionEnLigne: number | null;
  versionTravail: number;
  responsableEmail: string;
  statut: 'Publiée' | 'Brouillon' | 'Modifications non publiées';
  visites7j: number;
  /** MR02 : les sections de la page, les visites des sept derniers jours (la somme fait `visites7j`), les avis affichés. */
  sections: { id: string; type: 'Bandeau' | 'Texte' | 'Galerie' | 'Avis' | 'Contact'; titre: string; visible: boolean }[];
  visitesParJour: number[];
  avis: { auteur: string; texte: string; accordClient: boolean }[];
}

/** MR03. */
export interface EtapeTournee {
  id: string;
  jour: Jour;
  ordre: number;
  clientId: number | null;
  lieu: string;
  adresse: string;
  arriveePrevue: string;
  dureeMin: number;
  etat: 'À faire' | 'En route' | 'Sur place' | 'Fait' | 'Reportée';
  /** MR03 : durée du trajet depuis l'étape précédente (ou le dépôt, pour la première), en minutes. */
  trajetMin: number;
  /** MR03 : distance de ce trajet, en kilomètres. */
  distanceKm: number;
  heureFixee: boolean;
  conducteurEmail: string;
  commandeId: string | null;
}

/** MR04. */
export interface Equipement {
  id: string;
  nom: string;
  serie: string;
  categorie: string;
  etat: 'Bon' | 'À vérifier' | 'En panne';
  affectation: { type: 'personne' | 'lieu'; libelle: string };
  prochainEntretienLe: Jour;
  periodiciteMois: number;
  valeurCents: number;
  achatLe: Jour;
  statut: 'En service' | 'Au rebut';
  /** MR04 : depuis quand l'affectation actuelle dure. */
  affectationDepuis: Jour;
  /** MR04 : le dernier entretien fait (le prochain en découle). */
  dernierEntretienLe: Jour;
  /** MR04 : le dernier contrôle, après le dernier entretien. */
  dernierControleLe: Jour;
  /** MR04 : le jour de la réforme, pour un matériel au rebut. */
  reformeLe: Jour | null;
}

/** MR06. */
export interface Ressource {
  id: string;
  nom: string;
  type: 'salle' | 'matériel' | 'véhicule';
  groupe: string;
  regles: { dureeMaxMin: number; annulationGratuiteH: number; rappelMin: number };
  ouverture: { jours: number[]; debut: string; fin: string };
  /** MR06 : indisponible (garage, hors service) pour une période. */
  indisponibilites: { debut: Jour; fin: Jour; motif: string }[];
  /** MR06 : les demandes qui se sont heurtées à une autre réservation. */
  conflits: { le: Jour; demandeur: string; issue: 'refusée' | 'déplacée' }[];
}

export interface Reservation {
  id: string;
  ressourceId: string;
  usage: string;
  debutAt: string;
  finAt: string;
  reserveParEmail: string;
  clientId: number | null;
  motif: string;
  statut: 'confirmée' | 'en attente' | 'annulée';
}

/** MR09. La plaque est INVALIDE par construction (le format SIV exclut les lettres I, O et U). */
export interface Vehicule {
  id: string;
  modele: string;
  plaque: string;
  kilometrage: number;
  conducteurEmail: string;
  etat: 'Disponible' | 'En tournée' | 'À l’atelier';
  prochainEntretien: { km: number | null; le: Jour | null };
  assuranceLe: Jour;
  controleTechniqueLe: Jour;
  /** MR09. */
  energie: 'Diesel' | 'Essence' | 'Électrique' | 'Hybride';
  niveauPourcent: number;
  autonomieKm: number;
  /** Les sept derniers jours : kilomètres, et carburant (litres) quand le véhicule n'est pas électrique. */
  parJour: { jour: Jour; km: number; carburantL: number | null }[];
}

/** MR11. */
export interface ModeleControle {
  id: string;
  nom: string;
  points: { id: string; libelle: string; criticite: 'normale' | 'critique'; preuve: 'aucune' | 'facultative' | 'obligatoire' }[];
}

export interface Controle {
  id: string;
  modeleId: string;
  chantierId: string | null;
  clientId: number | null;
  responsableEmail: string;
  le: Jour;
  /** `sansObjet` : le point ne s'applique pas (alors `conforme` reste null). */
  resultats: { pointId: string; conforme: boolean | null; sansObjet: boolean }[];
  statut: 'À faire' | 'En cours' | 'Terminé';
}

export interface EcartQualite {
  id: string;
  libelle: string;
  controleId: string;
  chantierId: string | null;
  clientId: number | null;
  gravite: 'mineur' | 'critique';
  echeanceLe: Jour;
  responsableEmail: string;
  etat: 'ouvert' | 'corrigé' | 'accepté';
  /** MR11 : la cause trouvée, et le jour où l'écart a été relevé. */
  cause: string;
  releveLe: Jour;
}

/* ================================== Outils ================================== */

/** H22. Conservation 30 jours par défaut. */
export interface ElementSupprime {
  id: string;
  type: 'Page' | 'Fichier' | 'Tâche' | 'Note' | 'Fiche client' | 'Devis';
  nom: string;
  supprimeParEmail: string;
  supprimeAt: string;
  module: string;
  emplacement: string;
  conservationJours: number;
}

/** H23. */
export interface ArticleAide {
  id: string;
  titre: string;
  categorie: 'Démarrer' | 'Facturation' | 'Clients' | 'Équipe' | 'Sécurité' | 'Mobile';
  minutesLecture: number;
  contenu: string;
}

/** H24. La valeur n'existe pas ici : elle reste côté serveur, chiffrée. */
export interface SecretMasque {
  id: string;
  nom: string;
  type: 'Connecteur' | 'Serveur' | 'Mot de passe' | 'Document chiffré';
  responsableEmail: string;
  renouveleLe: Jour;
  dernierUsageAt: string | null;
  valeur: '••••••••';
}

/** MO02. */
export interface Site {
  id: string;
  adresse: string;
  libelle: string;
  type: 'équipe' | 'client' | 'portfolio';
  clientId: number | null;
  frequenceControleMin: number;
  tracker: boolean;
  etat: 'En ligne' | 'Dégradé' | 'Hors ligne';
  disponibilite30j: number;
  surveillanceActive: boolean;
}

export interface Tracker {
  id: string;
  siteId: string;
  nom: string;
  visites7j: number;
  derniereVisiteAt: string | null;
  etat: 'Actif' | 'Aucune donnée depuis 24 h' | 'À installer';
}

/** MO03. Les emplacements portent le NOM que l'administrateur leur a donné, jamais un chemin ni un identifiant. */
export interface CopieSauvegarde {
  id: string;
  at: string;
  declencheur: 'Automatique' | 'Hebdomadaire' | 'Manuelle' | 'Avant import' | 'Avant restauration';
  contenu: 'Tout' | string[];
  tailleOctets: number;
  emplacements: string[];
  etat: 'Réussie' | 'En cours' | 'Échouée';
  empreinteCourte: string;
}

/** MO04. */
export interface OperationImportExport {
  id: string;
  nom: string;
  type: 'Import' | 'Export';
  format: string;
  lignes: number;
  auteurEmail: string;
  at: string;
  etat: 'Terminée' | 'En cours' | 'Terminée avec erreurs' | 'Échouée';
  compteurs: { creees: number; fusionnees: number; ignorees: number; erreurs: number };
  copieId: string | null;
}

/** MO05. Tout est enregistré par personne. */
export interface Raccourci {
  id: string;
  action: string;
  libelle: string;
  touches: string | null;
  portee: string;
  origine: 'fourni' | 'personnel';
  actif: boolean;
  usages: number;
  epingle: boolean;
  barreRapide: boolean;
  gainSecondes: number;
}

/** H20 et CY11. `familleCyber` renseignée = vue Cyber. Une automatisation naît « En pause ». */
export interface Automatisation {
  id: string;
  nom: string;
  description: string;
  declencheur: string;
  type: 'Planifié' | 'Déclencheur' | 'Script';
  etat: 'Active' | 'En pause' | 'Brouillon';
  dernierPassageAt: string | null;
  executions: number;
  executionsMois: number;
  tempsGagneMinParExecution: number;
  familleCyber: string | null;
  auteurEmail: string;
}

/** H21. Aucun secret : seulement l'état et les dates. */
export interface Connecteur {
  id: string;
  nom: string;
  description: string;
  icone: string;
  etat: 'Non connecté' | 'Connecté' | 'À renouveler' | 'Erreur';
  derniereSynchroAt: string | null;
  droits: string[];
  cleCreeeLe: Jour | null;
  widgets: number;
  /** DEV-couts (modèle de S9, `src/refonte/connecteurs/`) : ce que le connecteur fait seul (« local »), ce qui est payant, ce qui n'est pas branché. */
  mode: 'local' | 'payant' | 'a-brancher';
  /** Les noms de `Formule` de S9. */
  modeleDeCout: 'gratuit' | 'abonnement' | 'a-l-usage' | 'commission';
  /** Ce qui a été consommé ce mois-ci, et le forfait inclus (null : pas de limite). */
  consommationMois: { unite: string; utilise: number; inclus: number | null };
  /** Ce qui a été payé ce mois-ci pour ce connecteur, en centimes (0 pour un connecteur local). */
  payeCeMoisCents: number;
}

/** H40. */
export interface Notification {
  id: string;
  type: 'urgent' | 'paiement' | 'sécurité' | 'mention' | 'rendez-vous' | 'devis' | 'stock' | 'client';
  titre: string;
  detail: string;
  module: string;
  at: string;
  lue: boolean;
  urgente: boolean;
  reporteJusquAt: string | null;
  pourEmail: string;
}

/** H47 et L04. */
export interface ModeleMetier {
  id: string;
  nom: string;
  description: string;
  motsCles: string[];
  icone: string;
  famille: string;
  modules: string[];
}

/** MO01. */
export interface UsageCalcul {
  id: string;
  calcul: string;
  utilisationsMois: number;
  joursUtilises: number;
  joursOuvresEcoules: number;
}

/* ================================ La Garde ================================ */

export type EtatGarde = 'Sain' | 'Attention' | 'Critique';
export type GraviteAlerte = 'Critique' | 'Moyenne' | 'Faible';

/** H30, H31, N02. L'état se déduit (voir `etatOrganisation`) : il n'est stocké ici que pour comparer. */
export interface OrganisationGarde {
  id: string;
  clientId: number | null;
  nom: string;
  lettre: string;
  secteur: string;
  score: number;
  scoreDebutMois: number;
  derniereRondeAt: string;
  intervalleRondeH: number;
  protegeDepuis: Jour;
  etat: EtatGarde;
}

/** H31. Noms en `.exemple.test`, jamais d'adresse IP. */
export interface ActifSurveille {
  id: string;
  organisationId: string;
  type: 'Domaine' | 'Sous-domaine' | 'Messagerie' | 'Accès distant' | 'Serveur';
  nom: string;
  principal: boolean;
  expireDansJours: number | null;
  certificatJours: number | null;
  messagerieOk: boolean | null;
  patchEnRetard: boolean | null;
}

/** MG01. */
export interface AlerteGarde {
  id: string;
  titre: string;
  detail: string;
  gravite: GraviteAlerte;
  organisationId: string;
  detecteeAt: string;
  etat: 'Ouverte' | 'Acquittée';
  acquitteeAt: string | null;
  assigneeEmail: string | null;
  sourdineJusquAt: string | null;
  fausseAlerte: boolean;
}

export type EtapeIncident = 'Détecté' | 'Pris en charge' | 'En traitement' | 'Résolu' | 'Clôturé';

/** H32 et CY08. */
export interface IncidentGarde {
  id: string;
  organisationId: string;
  titre: string;
  gravite: GraviteAlerte;
  etape: EtapeIncident;
  responsableEmail: string | null;
  ouvertAt: string;
  clotureAt: string | null;
  plan: { libelle: string; fait: boolean }[];
  chronologie: { at: string; texte: string; parEmail: string | null }[];
  clientInforme: boolean;
  donneesPersonnelles: 'oui' | 'non' | 'inconnu';
}

/** H31. Identifiant de substitution `FICT-AAAA-NNNN`, jamais un vrai. */
export interface Vulnerabilite {
  id: string;
  idFictif: string;
  organisationId: string;
  actifId: string | null;
  titre: string;
  gravite: GraviteAlerte;
  ouverteLe: Jour;
  etat: 'ouverte' | 'corrigée';
}

export type TypeRonde = 'Surface externe' | 'Certificats et domaines' | 'Vulnérabilités connues' | 'Hameçonnage simulé' | 'Sauvegardes' | 'Fuites de données';

/** H33. */
export interface RondeGarde {
  id: string;
  nom: string;
  type: TypeRonde;
  perimetre: string[];
  frequence: string;
  frequenceMin: number;
  activee: boolean;
  prochaineAt: string;
  derniereAt: string;
  dernierResultat: { libelle: string; ton: 'ok' | 'attention' | 'critique' };
}

/** MG02. Une entrée ne se modifie jamais. */
export interface EvenementSecurite {
  id: string;
  at: string;
  titre: string;
  detail: string;
  organisationId: string | null;
  source: 'Pare-feu' | 'Rondes' | 'Accès' | 'Messagerie' | 'Sauvegardes';
  resultat: 'Normal' | 'Bloqué' | 'Journalisé';
}

/** H35. Aucune adresse IP : un lieu approximatif seulement. */
export interface EntreeJournalAcces {
  id: string;
  at: string;
  acteur: { type: 'équipe' | 'client' | 'inconnu'; nom: string };
  action: string;
  lieu: string;
  resultat: 'Autorisé' | 'Refusé' | 'À revoir';
  revuParEmail: string | null;
}

export type DomaineMaturite = 'Gouvernance' | 'Protection' | 'Détection' | 'Réponse' | 'Récupération' | 'Sensibilisation';

/** H34. */
export interface CritereMaturite {
  id: string;
  domaine: DomaineMaturite;
  libelle: string;
  points: number;
  dureeMin: number;
  source: 'détecté' | 'déclaré';
  rempli: boolean;
}

/** MG03. */
export interface OffreCyber {
  id: string;
  nom: string;
  nomCourt: string;
  description: string;
  icone: string;
  prixCents: number;
  unite: string;
  responsables: string[];
  positionnement: 'Offre phare' | 'Complément' | 'Premium' | 'Atelier' | 'Ponctuel' | 'Nouveau';
  creeLe: Jour;
  activations: { clientId: number; statut: 'Actif' | 'Proposé' | 'Pas encore proposé' }[];
}

/* ================================== Cyber ================================== */

export type FamilleCyber =
  | 'Red Team' | 'Blue Team' | 'SOC' | 'Veille' | 'OSINT' | 'Sites et vie privée' | 'Réponse à incident' | 'Conformité' | 'Sensibilisation' | 'Automatisation';

/** CY02 à CY11. Noms génériques et descriptions de pilotage : aucun outil réel. */
export interface OutilCyber {
  id: string;
  famille: FamilleCyber;
  nom: string;
  description: string;
  type: 'Intégré' | 'Connecté';
  accord: 'Interne' | 'Passif' | 'Accord requis';
  dernierUsageAt: string | null;
  action: 'Lancer' | 'Ouvrir' | 'Vérifier' | 'Préparer' | 'Lire' | 'Appliquer';
  actif: boolean;
}

export type EtatAccord = 'Valide' | 'Expire bientôt' | 'Expiré' | 'En attente';

/** CY12, CY14. L'état se déduit (voir `etatAccord`). */
export interface AccordCyber {
  id: string;
  clientId: number;
  perimetre: { domaines: string[]; locaux: string[] };
  creneau: string | null;
  debutLe: Jour;
  finLe: Jour;
  fichierId: string | null;
  signe: boolean;
  conditionArret: string;
}

export type PhaseMission = 'Accord' | 'Reconnaissance' | 'Tests' | 'Constats' | 'Rapport';

/** CY12 et CY14. */
export interface MissionCyber {
  id: string;
  nom: string;
  clientId: number;
  type: string;
  famille: FamilleCyber;
  responsableEmail: string;
  accordId: string | null;
  phase: PhaseMission;
  debutLe: Jour;
  echeanceLe: Jour;
  etat: 'À préparer' | 'En cours' | 'Terminée';
  mensuelle: boolean;
  ticketsIds: string[];
}

/** CY14. Seul le titre et la gravité sont gardés : le détail technique n'existe pas dans ces jeux. */
export interface ConstatCyber {
  id: string;
  missionId: string;
  gravite: GraviteAlerte;
  titre: string;
  etat: 'ouvert' | 'corrigé';
  creeLe: Jour;
}

/** CY13. */
export interface DocumentCyber {
  id: string;
  titre: string;
  type: 'Accord' | 'Rapport' | 'Procédure' | 'Modèle' | 'Preuve' | 'Script' | 'Autre';
  famille: FamilleCyber;
  missionId: string | null;
  clientId: number | null;
  modifieLe: Jour;
  auteurEmail: string;
  version: number;
  signature: 'Signé' | 'À signer' | null;
  relu: boolean;
  archive: boolean;
}

/** CY05. */
export interface LogicielClient {
  id: string;
  clientId: number;
  nom: string;
  version: string;
  correctifDisponible: boolean;
  concerneParVeille: boolean;
}

export interface AlerteVeille {
  id: string;
  idFictif: string;
  titre: string;
  gravite: GraviteAlerte;
  publieeLe: Jour;
  logicielsConcernes: string[];
}

/** CY05. Jamais le contenu d'une fuite : un compteur, un client, une nature. */
export interface Fuite {
  id: string;
  clientId: number;
  nature: 'Adresses de messagerie' | 'Domaine';
  detecteeLe: Jour;
  etat: 'à traiter' | 'traitée';
}

/** CY09. */
export interface DossierConformite {
  id: string;
  clientId: number;
  referentiel: 'RGPD';
  points: { libelle: string; ok: boolean }[];
  registreRevuLe: Jour | null;
}

/** CY10. Seulement des comptes agrégés par équipe : jamais de nom de personne ni de saisie. */
export interface CampagneSensibilisation {
  id: string;
  clientId: number;
  titre: string;
  type: 'Simulation' | 'Quiz' | 'Module';
  le: Jour;
  etat: 'Planifiée' | 'En cours' | 'Terminée';
  envoyes: number;
  ouverts: number;
  cliques: number;
  signales: number;
  parEquipe: { equipe: string; envoyes: number; cliques: number; signales: number }[];
}

/** CY03. Agrégats par client : aucun nom de poste, de compte ni de mot de passe. */
export interface ParcSecurite {
  id: string;
  clientId: number;
  postes: number;
  postesAJour: number;
  correctifsEnAttente: number;
  correctifsImportants: number;
  sauvegardes: { total: number; verifiees: number };
  comptesSansDoubleValidation: number;
}

/* ============================= Le monde, suite ============================= */

/* ============================ Développement (LOT-11) ============================ */

/**
 * Ces formes sont des sur-ensembles de celles de `src/refonte/developpement/` (S8) : la logique de S8 lit ces jeux
 * sans adaptateur (`compat.ts` le vérifie). Aucun nom d'hôte, aucune adresse, aucun port, aucune variable d'environnement.
 */

/** DEV-projets. Un dépôt suivi : état des tests, langages, commits des 31 dernières semaines. */
export interface Depot {
  id: string;
  nom: string;
  description: string;
  branche: string;
  /** Les parts (somme 100) des langages du dépôt, le premier est le principal. */
  langages: { nom: string; part: number }[];
  tests: { etat: 'verts' | 'echec'; echecs: number; depuisLe: string | null };
  /** Le nombre de commits de chaque semaine, de la plus ancienne (il y a 30 semaines) à la semaine en cours. */
  commitsParSemaine: number[];
  dernierCommitAt: string | null;
  /** Où le dépôt est mis en ligne (libellé, pas une adresse). */
  cible: string;
  version: string | null;
  /** Une pièce du Studio liée, si le dépôt est un projet de client. */
  pieceStudioId: string | null;
  /** Les tickets (jeu `tickets`) rattachés au dépôt. */
  ticketIds: string[];
  teinte: number;
}

export type EtatEtapeDeploiement = 'a-venir' | 'en-cours' | 'reussie' | 'echouee' | 'sautee';

/** DEV-deploiements. Cinq étapes dans le même ordre : code, construction, tests, miseEnLigne, verification. */
export interface Deploiement {
  id: string;
  depot: string;
  branche: string;
  quoi: string | null;
  version: string | null;
  cible: 'apercu' | 'preproduction' | 'production' | 'interne' | 'serveur';
  /** Un prénom, jamais une adresse. */
  par: string;
  lanceA: string;
  etapes: { etape: 'code' | 'construction' | 'tests' | 'miseEnLigne' | 'verification'; etat: EtatEtapeDeploiement; debut: string | null; fin: string | null }[];
  annuleA: string | null;
  /** Ce déploiement remet en ligne celui-ci (« Revenir »). */
  retourDe: string | null;
}

export interface DeploiementPlanifie {
  id: string;
  depot: string;
  branche: string;
  quoi: string;
  cible: Deploiement['cible'];
  prevuA: string;
  par: string;
}

/** DEV-editeur : une exécution du journal d'une automatisation (`fluxId` = `Automatisation.id`). */
export interface Execution {
  id: string;
  fluxId: string;
  debut: string;
  fin: string | null;
  resultat: 'en-cours' | 'reussie' | 'echec' | 'ignoree';
  mode: 'local' | 'api';
  essai: boolean;
  actionHumaine: boolean;
  /** Une phrase courte, jamais une valeur secrète. */
  message: string | null;
}

export type PlanificationDeTache =
  | { type: 'quotidien'; heure: string; jours?: number[] }
  | { type: 'intervalle'; minutes: number; depuis: string }
  | { type: 'une-fois'; a: string };

export interface TachePlanifiee {
  id: string;
  nom: string;
  /** L'automatisation que cette planification fait tourner (null : une tâche seule). */
  automatisationId: string | null;
  planification: PlanificationDeTache;
  active: boolean;
  creeeA: string;
  /** L'heure PRÉVUE du dernier passage fait (pas l'heure réelle de l'exécution). */
  dernierPassagePrevu: string | null;
}

/** DEV-serveur : un point de la charge sur 24 heures, toutes les 10 minutes. Aucun hôte, aucune adresse. */
export interface MesureServeur {
  id: string;
  at: string;
  processeurPct: number;
  memoirePct: number;
  disquePct: number;
  reseauMoParS: number;
}

export interface ServiceServeur {
  id: string;
  nom: string;
  detail: string;
  /** Sur 30 jours, en pourcent à deux décimales. */
  disponibilite30jPct: number;
  etat: 'en marche' | 'attention' | 'arrêté';
}

/** DEV-couts : ce qui a été payé aux connecteurs sur les six derniers mois (le dernier est le mois courant). */
export interface PaiementConnecteurs {
  id: string;
  mois: string;
  payeCents: number;
  /** Ce que le même usage aurait coûté en API payantes, moins ce qui a été payé. */
  economiseCents: number;
}

/* ============================ Boutique en ligne (MR08) ============================ */

/** MR08 : l'entonnoir d'un jour — visites, produits vus, paniers créés, commandes, paiements réussis. Aucune donnée personnelle. */
export interface JourEntonnoir {
  id: string;
  jour: Jour;
  visites: number;
  produitsVus: number;
  paniersCrees: number;
  /** Se lit dans le jeu `commandes` (commandes créées ce jour-là). */
  commandes: number;
  /** Les commandes de ce jour qui sont payées. */
  paiements: number;
}

/** MR08 : un panier, avec sa dernière activité ; « converti » pointe la commande qu'il a donnée. */
export interface PanierBoutique {
  id: string;
  clientNom: string | null;
  lignes: number;
  montantCents: number;
  derniereActiviteAt: string;
  etat: 'ouvert' | 'abandonné' | 'converti';
  commandeId: string | null;
}

/** MR08 : une session en direct (visiteur anonyme sur le site) ; elle disparaît 5 minutes après sa dernière activité. */
export interface SessionBoutique {
  id: string;
  debutAt: string;
  derniereActiviteAt: string;
  page: string;
  appareil: 'mobile' | 'ordinateur' | 'tablette';
}

/** DEV-serveur : le résumé du serveur. Aucun nom d'hôte, aucune adresse, aucun port. Un seul enregistrement (le serveur de l'entreprise). */
export interface ResumeServeur {
  id: string;
  /** Jours depuis le dernier redémarrage. */
  enLigneDepuisJours: number;
  redemarreLe: string;
  memoireTotaleGo: number;
  disqueTotalGo: number;
  disqueUtiliseGo: number;
  /** La croissance du disque (Go) des quatre dernières semaines, de la plus ancienne à la plus récente. */
  croissanceDisqueGoParSemaine: number[];
  /** La capacité déclarée du lien, en Mo/s (de quoi calculer l'anneau du réseau). */
  capaciteReseauMoParS: number;
  sauvegardes: { derniereCopieAt: string | null; derniereCopieReussie: boolean; restaurationTesteeLe: Jour | null; copieHorsServeurChiffree: boolean };
  /** Les lignes de coût du mois en cours (TTC, centimes) : hébergement, stockage, copies. */
  couts: { ligne: string; cents: number }[];
}

/* ============================ Ma journée (LOT-01, suite) ============================ */

/**
 * Les priorités du jour d'une personne : un enregistrement par personne et par jour, de la forme de la collection
 * `dailyPriorities` (`PrioritiesScreen`) — `id` = `prio-<courriel en minuscules, tirets>-<jour>`. Au plus trois priorités ;
 * `doneAt` est l'instant de clôture de la priorité (null : pas faite). Une journée est « bouclée » quand chaque priorité
 * est faite avant la fin de ce jour-là : c'est la règle de la série (L01, N01, H04, H25).
 */
export interface JourDePriorites {
  id: string;
  email: string;
  day: Jour;
  items: { id: string; label: string; doneAt: string | null }[];
  updatedAt: string;
}

/** L07 « Ce que chacun apporte » : l'engagement ÉCRIT d'une personne dans un défi. Forme seulement : l'application ne les stocke pas encore. */
export interface EngagementDefi {
  id: string;
  defiId: string;
  email: string;
  texte: string;
  le: Jour;
}

/** G08 : les utilisateurs connectés un jour donné, côté client (API du client). Un compteur, jamais un nom. */
export interface JourDeConnexions {
  id: string;
  jour: Jour;
  connectes: number;
}

/** N01, H04 « Boîte à zéro » : le nombre de messages à traiter en fin de journée, et si zéro a été atteint ce jour-là. */
export interface JourBoiteAZero {
  id: string;
  jour: Jour;
  aTraiter: number;
  zeroAtteint: boolean;
}

export interface MondeSuite {
  dailyPriorities: JourDePriorites[];
  engagementsDefis: EngagementDefi[];
  utilisateursConnectes: JourDeConnexions[];
  boiteAZero: JourBoiteAZero[];
  serveur: ResumeServeur[];
  entonnoirBoutique: JourEntonnoir[];
  paniers: PanierBoutique[];
  sessionsBoutique: SessionBoutique[];
  depots: Depot[];
  deploiements: Deploiement[];
  deploiementsPlanifies: DeploiementPlanifie[];
  executions: Execution[];
  tachesPlanifiees: TachePlanifiee[];
  mesuresServeur: MesureServeur[];
  servicesServeur: ServiceServeur[];
  paiementsConnecteurs: PaiementConnecteurs[];
  /** G03, H07, MA04 : les avoirs sont des factures de nature `creditNote`, numérotées `AV-AAAA-NNNN`, qui réduisent `creditNoteFor`. Le chargeur les range avec les factures. */
  avoirs: Facture[];
  echeancesFiscales: EcheanceFiscale[];
  bulletins: Bulletin[];
  prestations: Prestation[];
  partenaires: Partenaire[];
  creneaux: Creneau[];
  defis: Defi[];
  pages: Page[];
  fichiers: Fichier[];
  signatures: DemandeSignature[];
  modeles: ModeleDocument[];
  journal: EntreeJournal[];
  textes: TexteRedige[];
  archives: ElementArchive[];
  connaissances: EntreeConnaissance[];
  reglesArchivage: ReglePourArchiver[];
  demandesRelecture: DemandeRelecture[];
  conversations: Conversation[];
  messages: MessageEquipe[];
  canaux: Canal[];
  annonces: Annonce[];
  courriels: Courriel[];
  salles: Salle[];
  appels: Appel[];
  reunions: Reunion[];
  partages: Partage[];
  sondages: Sondage[];
  reponsesAuto: ReponseAuto[];
  articles: ArticleStock[];
  produits: Produit[];
  commandes: Commande[];
  chantiers: Chantier[];
  dossiersPhotos: DossierPhoto[];
  marque: Marque[];
  videos: Video[];
  pagesPubliques: PagePublique[];
  etapesTournee: EtapeTournee[];
  equipements: Equipement[];
  ressources: Ressource[];
  reservations: Reservation[];
  vehicules: Vehicule[];
  modelesControle: ModeleControle[];
  controles: Controle[];
  ecarts: EcartQualite[];
  corbeille: ElementSupprime[];
  aide: ArticleAide[];
  secrets: SecretMasque[];
  sites: Site[];
  trackers: Tracker[];
  sauvegardes: CopieSauvegarde[];
  operations: OperationImportExport[];
  raccourcis: Raccourci[];
  automatisations: Automatisation[];
  connecteurs: Connecteur[];
  notifications: Notification[];
  modelesMetier: ModeleMetier[];
  usagesCalculs: UsageCalcul[];
  organisations: OrganisationGarde[];
  actifs: ActifSurveille[];
  alertes: AlerteGarde[];
  incidents: IncidentGarde[];
  vulnerabilites: Vulnerabilite[];
  rondes: RondeGarde[];
  evenementsSecurite: EvenementSecurite[];
  journalAcces: EntreeJournalAcces[];
  criteresMaturite: CritereMaturite[];
  offresCyber: OffreCyber[];
  outilsCyber: OutilCyber[];
  accords: AccordCyber[];
  missions: MissionCyber[];
  constats: ConstatCyber[];
  documentsCyber: DocumentCyber[];
  logicielsClients: LogicielClient[];
  alertesVeille: AlerteVeille[];
  fuites: Fuite[];
  dossiersConformite: DossierConformite[];
  campagnes: CampagneSensibilisation[];
  parcSecurite: ParcSecurite[];
}

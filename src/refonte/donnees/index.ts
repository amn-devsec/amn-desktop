/**
 * JEUX DE DONNÉES FICTIVES DE LA REFONTE — point d'entrée.
 *
 *   import { construireMonde, jeu } from '../donnees';
 *
 *   const monde = construireMonde({ volume: 'beaucoup' });
 *   const clients = jeu('clients', 'peu');
 *
 * Mode d'emploi, volumes et catalogue : `LISEZ-MOI.md` dans ce dossier.
 * Rien ici n'est importé par du code partagé entre les deux éditions : les jeux
 * servent aux écrans internes, aux tests et aux captures.
 */

export { construireMonde, creerContexte, type OptionsMonde } from './monde';
export { NOMS_DES_JEUX } from './types';
export type {
  Abonnement, Achat, Avis, ColonneTicket, CompteBancaire, CompteFidelite, Contexte, Contrat, Depense, Devis, Enveloppe, Entreprise, EtapeProspect,
  Evenement, Facture, FicheClient, Fournisseur, Habitude, Interlocuteur, Membre, Monde, MotifRelance, Mouvement, NomDuJeu, NoteRapide, Paiement,
  Projet, Prospect, Rappel, Relance, RoleMembre, SousTache, StatutClientAffiche, StatutProjet, Tache, Ticket, TypeEvenement,
} from './types';
export {
  ajouterJours, courriel, ecartJours, estCourrielFictif, estTelephoneFictif, GRAINE_REFERENCE, heureDe, instantParis, jourDe, MAINTENANT_CYBER,
  MAINTENANT_REFERENCE, maintenantCyberDe,
  VOLUMES, type Jour, type Volume,
} from './outils';
export { statutAffiche, totauxDeFacture, totauxDeLignes, type Totaux } from './argent';
export { calculerNps, calculerSante, groupePipeline, RAISONS_DE_PERTE } from './contacts';
export { avancementProjet, journeesDeTravail, serieEnCours, statutProjet, type JourneeDeTravail } from './ma-journee';
export { moi } from './equipe';
export { joursSansImpaye, jourDuCreneau } from './complements';
export { quantiteEnStock } from './creer';
export { etatOrganisation, niveauMaturite, NIVEAUX_MATURITE, scoreMaturite } from './garde';
export { etatAccord, niveauConformite, outilDisponible, PHASES_MISSION } from './cyber';
export {
  attendusBilanSemaine, attendusCockpit, attendusPrevisions, attendusTableauDeBord, PALIERS_DE_SERIE, serieDesPriorites,
  type AttendusBilanSemaine, type AttendusCockpit, type AttendusPrevisions, type AttendusTableauDeBord, type OptionsPrevisions,
} from './attendus';
export {
  choisirConnectees, CIBLE_DE_CHARGE, EFFECTIF_MAX, EFFECTIF_MIN, emailDuMembre, EQUIPE_INTERNE_DE_CHARGE, ESSAI_LONG_HEURES, genererOrganisationsDeCharge,
  MELANGE_D_ACTIONS, ORGANISATIONS_MAX, PALIERS_DE_CHARGE, PAUSE_ENTRE_ACTIONS_MS, SEUILS_DE_CHARGE,
  type OrganisationDeCharge, type ProfilDActivite, type TailleDeCharge,
} from './charge';
export type * from './types-suite';

import { construireMonde, type OptionsMonde } from './monde';
import type { Monde, NomDuJeu } from './types';
import type { Volume } from './outils';

/**
 * Un seul jeu, à un volume donné. Les jeux dont dépend celui-ci sont construits
 * à un volume `normal` pour que les liens (client d'une facture, par exemple)
 * existent ; on ne rend que le jeu demandé.
 */
export function jeu<N extends NomDuJeu>(nom: N, volume: Volume = 'normal', options: Omit<OptionsMonde, 'volume' | 'volumes'> = {}): Monde[N] {
  // Demander le jeu des avoirs, c'est vouloir des avoirs.
  return construireMonde({ avoirs: nom === 'avoirs', ...options, volume: 'normal', volumes: { [nom]: volume } })[nom];
}

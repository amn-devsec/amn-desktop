/**
 * COMPATIBILITÉ AVEC LES TYPES DU DÉPÔT — vérifiée à la compilation, sans coût
 * à l'exécution.
 *
 * Chaque ligne échoue au `typecheck` si un jeu cesse d'être un sur-ensemble du
 * type existant : on le saurait avant qu'un écran reçoive une donnée à laquelle
 * il manque un champ.
 */

import type { Client, Invoice, Quote, UserRole } from '../../shared/api';
import type { Appointment } from '../../state/useAppointments';
import type { Expense } from '../../state/expenseEngine';
import type { Note } from '../../state/useNotes';
import type { ProjectData } from '../../state/projectEngine';
import type { Deploiement as DeploiementS8 } from '../developpement/deploiements';
import type { Execution as ExecutionS8 } from '../developpement/journal';
import type { TachePlanifiee as TachePlanifieeS8 } from '../developpement/planification';
import type { Depense, Devis, Evenement, Facture, FicheClient, NoteRapide, Projet, RoleMembre } from './types';
import type { Deploiement, Execution, TachePlanifiee } from './types-suite';

type SurEnsemble<Jeu extends Ancien, Ancien> = Jeu;

export type VerifCompatibilite = [
  SurEnsemble<FicheClient, Client>,
  SurEnsemble<Devis, Quote>,
  SurEnsemble<Facture, Invoice>,
  SurEnsemble<Evenement, Appointment>,
  SurEnsemble<Depense, Expense>,
  SurEnsemble<NoteRapide, Note>,
  SurEnsemble<Projet, ProjectData>,
  // Les rôles fictifs sont ceux du serveur, rien d'autre.
  SurEnsemble<RoleMembre, UserRole>,
  // LOT-11 : la logique de S8 lit ces jeux sans adaptateur.
  SurEnsemble<Deploiement, DeploiementS8>,
  SurEnsemble<Execution, ExecutionS8>,
  SurEnsemble<TachePlanifiee, TachePlanifieeS8>,
];

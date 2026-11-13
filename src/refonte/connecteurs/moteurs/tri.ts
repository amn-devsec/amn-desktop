import { contientUnMot } from '../flux';

/**
 * LE TRI DES MESSAGES REÇUS — local, par mots repérés, sans modèle de langue.
 *
 * Même règle de lecture que le bloc SI de l'éditeur de flux (`contientUnMot`) :
 * sans accents, sans casse, mot entier, pluriel simple. Les règles sont
 * essayées par priorité ; aucune ne répond → « À lire ». Un expéditeur connu
 * sans règle qui réponde va dans « Clients ».
 *
 * Les mots par défaut sont un point de départ, modifiable par l'équipe.
 */

export interface RegleTri {
  id: string;
  dossier: string;
  mots: readonly string[];
  /** Plus petit = essayé d'abord. */
  priorite: number;
}

export const REGLES_PAR_DEFAUT: readonly RegleTri[] = [
  { id: 'devis', dossier: 'devis', mots: ['devis', 'tarif', 'prix', 'estimation', 'combien'], priorite: 10 },
  { id: 'facturation', dossier: 'facturation', mots: ['facture', 'paiement', 'reglement', 'virement', 'avoir', 'impaye'], priorite: 20 },
  { id: 'rendez-vous', dossier: 'rendez-vous', mots: ['rendez-vous', 'rdv', 'disponibilite', 'creneau', 'reporter'], priorite: 30 },
  { id: 'support', dossier: 'support', mots: ['panne', 'bug', 'erreur', 'probleme', 'ne marche pas', 'bloque'], priorite: 40 },
];

export const DOSSIER_A_LIRE = 'a-lire';
export const DOSSIER_CLIENTS = 'clients';

export interface MessageRecu {
  objet: string;
  corps: string;
  expediteur: string;
}

export function trier(m: MessageRecu, regles: readonly RegleTri[] = REGLES_PAR_DEFAUT, contactsConnus: ReadonlySet<string> = new Set()): { dossier: string; regleId: string | null } {
  const texte = `${m.objet}\n${m.corps}`;
  for (const r of [...regles].sort((a, b) => a.priorite - b.priorite || a.id.localeCompare(b.id))) {
    if (contientUnMot(texte, r.mots)) return { dossier: r.dossier, regleId: r.id };
  }
  if (contactsConnus.has(m.expediteur.trim().toLowerCase())) return { dossier: DOSSIER_CLIENTS, regleId: null };
  return { dossier: DOSSIER_A_LIRE, regleId: null };
}

import { CATALOGUE } from './catalogue';
import { normaliser } from './flux';
import type { CleConnecteurs } from './i18n';
import type { Categorie, Droit } from './types';

/**
 * « DEMANDER UN CONNECTEUR » — pour un outil qui n'est pas au catalogue (H21 §2).
 *
 * Décision du CO (STATUT §1.22) : Notion passe par ici tant que la liste des
 * catégories ne l'ajoute pas. La demande ne branche rien : elle part à
 * l'équipe, en lecture seule par défaut. Identifiant déterministe (outil +
 * jour) : un double clic, ou deux personnes le même jour, une seule demande.
 */

export interface OutilADemander {
  id: string;
  nom: string;
  role: CleConnecteurs;
}

/** Les prises d'exemple de H21 sans catégorie, proposées en « Demander un connecteur ». */
export const OUTILS_A_DEMANDER: readonly OutilADemander[] = [{ id: 'notion', nom: 'Notion', role: 'role.pages-et-bases' }];

export interface DemandeConnecteur {
  id: string;
  outilId: string;
  nom: string;
  droits: readonly Droit[];
  parEmail: string;
  at: number;
}

export type RefusDemande = 'nom-invalide' | 'deja-au-catalogue';

/** L'identifiant d'un outil d'après son nom : « Mon Outil ! » → « mon-outil ». */
export function idDOutil(nom: string): string {
  return normaliser(nom).replace(/[@.]/g, ' ').trim().replace(/\s+/g, '-');
}

export function demanderUnConnecteur(
  nom: string,
  parEmail: string,
  maintenant: number,
  catalogue: readonly Categorie[] = CATALOGUE,
): { ok: true; valeur: DemandeConnecteur } | { ok: false; raison: RefusDemande } {
  const propre = nom.trim();
  const outilId = idDOutil(propre);
  if (!outilId || propre.length > 60) return { ok: false, raison: 'nom-invalide' };
  if (catalogue.some((c) => c.options.some((o) => o.id === outilId || idDOutil(o.nom) === outilId))) return { ok: false, raison: 'deja-au-catalogue' };
  const jour = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).format(maintenant);
  return { ok: true, valeur: { id: `demande-${outilId}-${jour}`, outilId, nom: propre, droits: ['lecture'], parEmail, at: maintenant } };
}

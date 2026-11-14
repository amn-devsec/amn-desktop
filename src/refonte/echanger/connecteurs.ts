import { dessinDePrise, etatDePrise } from '../connecteurs/baie';
import type { CategorieId, ConnecteurInstance } from '../connecteurs/types';
import type { CanalDeMessage, EtatDeCanal } from './boite';

/**
 * LES CANAUX ET LES CONNECTEURS — l'état « connecteur à brancher » (STATUT §1.22, modèle de S9).
 *
 * Le courriel (la messagerie), WhatsApp, la passerelle SMS et la téléphonie ne sont pas à nous : ce
 * sont des prises de la baie de connecteurs (H21). Tant qu'une prise n'est pas branchée, l'écran dit « connecteur à
 * brancher » ; autorisation à refaire : « à reconnecter » ; il ne simule rien. Aucune clé, aucun jeton, aucune
 * adresse de serveur n'est lue ni affichée ici : seulement l'état d'une prise.
 */

const CATEGORIE_DU_CANAL: Record<CanalDeMessage, CategorieId> = { courriel: 'messagerie', whatsapp: 'whatsapp', sms: 'sms' };

export type EtatDeLaPrise = 'actif' | 'a-brancher' | 'a-reconnecter' | 'erreur' | 'arrete';

/** L'état d'une catégorie de connecteur : actif si au moins une de ses prises est branchée ET en forme (une prise « à reconnecter » pend du bus : elle ne sert pas). */
export function etatDeCategorie(categorie: CategorieId, instances: readonly ConnecteurInstance[], maintenant: number): EtatDeLaPrise {
  const prises = instances.filter((i) => i.categorie === categorie);
  if (!prises.length) return 'a-brancher';
  const etats = prises.map((p) => etatDePrise(p, maintenant));
  if (etats.some((e) => dessinDePrise(e) === 'branchee')) return 'actif';
  if (etats.includes('a-reconnecter')) return 'a-reconnecter';
  if (etats.includes('en-erreur')) return 'erreur';
  if (etats.every((e) => e === 'arrete')) return 'arrete';
  return 'a-brancher';
}

/** Les trois canaux de la boîte des clients, avec l'état de leur prise (grisés quand elle ne sert pas). */
export function etatsDesCanaux(instances: readonly ConnecteurInstance[], maintenant: number): EtatDeCanal[] {
  return (Object.keys(CATEGORIE_DU_CANAL) as CanalDeMessage[]).map((canal) => ({ canal, etat: etatDeCategorie(CATEGORIE_DU_CANAL[canal], instances, maintenant) }));
}

export type ModeDAppel = 'ligne-pro' | 'application-seulement';

/**
 * H13 : sans ligne professionnelle branchée, l'appel se fait dans l'application seulement (repli de la fiche) : pas de
 * pavé, pas de pièce « Standard », « Transférer » propose un membre au lieu d'un poste.
 */
export const modeDAppel = (instances: readonly ConnecteurInstance[], maintenant: number): ModeDAppel =>
  etatDeCategorie('telephonie', instances, maintenant) === 'actif' ? 'ligne-pro' : 'application-seulement';

/** La boîte est « vide » (aucun canal connecté) : l'écran propose de brancher sa messagerie dans les connecteurs. */
export const aucunCanalBranche = (etats: readonly EtatDeCanal[]): boolean => etats.every((e) => e.etat !== 'actif');

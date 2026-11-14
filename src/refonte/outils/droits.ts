import { isAdminRole } from '../../auth/roles';
import type { UserRole } from '../../shared/api';

/**
 * LES DROITS DE H19 (Membres et accès) — RÈGLES PROVISOIRES, par rôle.
 *
 * Décisions du CO (STATUT §1.34), en attendant la fiche de H19 et Harun :
 *   · les rôles sont ceux du serveur : `owner`, `admin`, `member`, `guest` (n° 2) ;
 *   · le droit de publier est distinct du droit d'écrire (§1.27 n° 9) : seul
 *     `owner` publie, les autres passent par « Demander la publication » (n° 3
 *     et 4). Aucun champ nouveau : une règle par rôle ;
 *   · `owner` et `admin` gèrent les connecteurs de H21 (n° 5).
 *
 * Le serveur reste juge des droits : ces règles disent ce que l'écran propose,
 * elles ne remplacent pas ce que le serveur accepte.
 *
 * Le droit d'écrire n'est pas tranché ici : il vient de l'écran qui l'utilise
 * (LOT-06 le reçoit déjà en paramètre). Pur : ni React, ni réseau.
 */

/** L'ordre d'affichage de H19 : la propriétaire d'abord (comme `MembersScreen`). */
export const ROLES_H19: readonly UserRole[] = ['owner', 'admin', 'member', 'guest'];

/** Provisoire (§1.34 n° 4) : seul le rôle dirigeant, `owner`, publie. */
export function peutPublier(role: UserRole | null | undefined): boolean {
  return role === 'owner';
}

/** Provisoire (§1.34 n° 5) : `owner` et `admin` branchent, débranchent et reconnectent un connecteur. */
export function peutGererLesConnecteurs(role: UserRole | null | undefined): boolean {
  return isAdminRole(role);
}

/** Ce que propose le bouton de publication : publier soi-même, ou demander. */
export function actionDePublicationPour(role: UserRole | null | undefined): 'publier' | 'demander' {
  return peutPublier(role) ? 'publier' : 'demander';
}

/**
 * Les droits d'une page publiable (`DroitsPage` de LOT-06) pour un rôle.
 * Publier suppose d'écrire : sans le droit d'écrire, pas de droit de publier.
 */
export function droitsDePage(role: UserRole | null | undefined, ecrire: boolean, enLigne: boolean): { ecrire: boolean; publier: boolean; enLigne: boolean } {
  return { ecrire, publier: ecrire && peutPublier(role), enLigne };
}

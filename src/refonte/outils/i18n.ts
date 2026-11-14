import type { Langue } from '../../i18n';
import type { UserRole } from '../../shared/api';

/**
 * LES MOTS D'OUTILS ET RÉGLAGES (LOT-07) — fr et en, à part des dictionnaires communs.
 *
 * Même modèle que `src/socle/i18n.ts` : l'anglais est le schéma, le français
 * est typé contre lui (une clé oubliée ne compile pas). L'interface tutoie.
 *
 * Les noms des rôles sont ceux du serveur, seuls réels (STATUT §1.34 n° 2).
 */
const EN = {
  'role.owner': 'Owner',
  'role.admin': 'Administrator',
  'role.member': 'Member',
  'role.guest': 'Guest',
} as const;

export type CleOutils = keyof typeof EN;

const FR: Record<CleOutils, string> = {
  'role.owner': 'Propriétaire',
  'role.admin': 'Administrateur',
  'role.member': 'Membre',
  'role.guest': 'Invité',
};

export const DICTIONNAIRES_OUTILS: Record<Langue, Record<CleOutils, string>> = { en: EN, fr: FR };

export function traduireOutils(langue: Langue, cle: CleOutils): string {
  return DICTIONNAIRES_OUTILS[langue][cle] ?? EN[cle];
}

export function libelleDuRole(langue: Langue, role: UserRole): string {
  return traduireOutils(langue, `role.${role}`);
}

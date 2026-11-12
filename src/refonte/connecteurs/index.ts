/**
 * LOT-12 · Connecteurs et autonomie — le modèle et les moteurs locaux.
 *
 * Aucun écran ici : H21 (LOT-07) et DEV-couts, DEV-editeur (LOT-11) s'appuient
 * sur ce module. Tout est pur (ni React, ni réseau), sauf `langue.ts`.
 * Mode d'emploi : `docs/refonte/preparation/LOT-12-connecteurs.md`.
 */
export * from './types';
export * from './catalogue';
export * from './tarifs';
export * from './cycle';
export * from './baie';
export * from './couts';
export * from './flux';
export * from './amnApi';
export * from './adaptateurs';
export * from './i18n';
export * as moteurs from './moteurs';

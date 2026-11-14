/**
 * LOT-01 · MA JOURNÉE — la logique pure du lot (préparation, aucun écran).
 *
 * Chaque fichier est sans React et sans horloge. Les écrans de `src/refonte/journee/` (N01, H01 à H04, H25, G08, MJ01
 * à MJ05, L01 à L03, L07) les liront à la construction visuelle ; la note du lot (`docs/refonte/preparation/
 * LOT-01-ma-journee.md`) dit quel écran lit quoi et ce qui reste à confirmer sur les fiches.
 *
 *   npm run check:journee
 */
export * from './commun';
export * from './serie';
export * from './jalons';
export * from './bilan';
export * from './cockpit';
export * from './tableauDeBord';
export * from './projets';
export * from './defis';
export * from './habitudes';
export * from './rappels';
export * from './planning';
export * from './kanban';
export * from './phrases';
export { dire, direCompte, useMotsJournee, DICTIONNAIRES_JOURNEE, type CleJournee } from './i18n';

/**
 * LOT-02 · Mes contacts et clients — la logique pure (aucun composant, aucune brique visuelle).
 * Importée seulement par le code interne et par `scripts/check-contacts.ts`.
 */
export * from './commun';
export * from './pipeline';
export * from './relances';
export * from './fidelite';
export * from './rendezvous';
export * from './interlocuteurs';
export { dire, direCompte, DICTIONNAIRES_CONTACTS, useMotsContacts, type CleContacts } from './i18n';

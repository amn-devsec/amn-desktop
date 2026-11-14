/**
 * LE MOTEUR DE H20, CÔTÉ INTERNE — ce que l'édition interne branche (S6, LOT-07).
 *
 * `AutomationsRunner` (partagé) fait toujours tourner le moteur actuel
 * (`src/state/useAutomations.ts`), inchangé ; il monte en plus `MoteurEtendu`,
 * qui exécute les règles au format étendu (branches Sinon et Puis, rangées par
 * le modèle des connecteurs de LOT-12).
 *
 * L'édition cliente reçoit `automatisations.business.tsx` à la place : rien
 * de plus que le moteur actuel. Rien de ce que ce fichier importe n'entre dans
 * son paquet.
 */
export { MoteurEtendu } from '../refonte/outils/MoteurEtendu';

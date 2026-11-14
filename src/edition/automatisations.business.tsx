import type { Declencheur } from '../state/useAutomations';

/**
 * LE MOTEUR DE H20, CÔTÉ CLIENTE — rien de nouveau, délibérément.
 *
 * Le moteur actuel (`src/state/useAutomations.ts`), monté par
 * `AutomationsRunner`, tourne à l'identique. Il n'y a ni moteur étendu, ni
 * format étendu : ce fichier n'importe rien de `src/refonte/**`.
 */
export const MoteurEtendu: (props: { libelles: Record<Declencheur, (a: string, b: string) => string> }) => null = () => null;

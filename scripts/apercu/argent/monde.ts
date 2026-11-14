/**
 * LE MONDE FICTIF DES APERÇUS DE L'ARGENT (LOT-04) — les jeux de SIM (`src/refonte/donnees/`), volume « normal »,
 * graine par défaut, au vendredi 30 octobre 2026 à 10:42 (l'horloge des maquettes). Rien de ceci n'entre dans
 * l'application : les aperçus montrent les VRAIS composants sur des données inventées.
 */
import { construireMonde } from '../../../src/refonte/donnees';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MONDE: any = construireMonde({ volume: 'normal' });
export const MAINTENANT = new Date(MONDE.contexte.maintenant);
export const AUJOURDHUI: string = MONDE.contexte.aujourdhui;

/** Le numéro d'une facture du monde, par son identifiant. */
export function numeroDeFacture(id: string | null): string | null {
  if (!id) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return [...MONDE.factures, ...(MONDE.avoirs ?? [])].find((f: any) => f.id === id)?.number || null;
}

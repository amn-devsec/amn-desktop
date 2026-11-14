import { ajouterJours, lundiDe, type Jour } from '../../commun';

/** Le numéro de semaine ISO 8601 (« semaine 44 »). */
export function semaineIso(j: Jour): number {
  const jeudi = ajouterJours(lundiDe(j), 3);
  const an = Number(jeudi.slice(0, 4));
  const premierJeudi = ajouterJours(lundiDe(`${an}-01-04`), 3);
  return 1 + Math.round((Date.parse(`${jeudi}T12:00:00Z`) - Date.parse(`${premierJeudi}T12:00:00Z`)) / (7 * 86_400_000));
}

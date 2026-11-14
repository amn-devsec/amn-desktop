import { ajouterJours, jourIsoDe, partiesParis } from './temps';

/**
 * LES SAUVEGARDES LOCALES — quand en refaire une, lesquelles garder.
 *
 * L'export lui-même existe (`src/lib/backup.ts`) ; ce moteur décide du
 * rythme et de la rotation, sans rien lire ni écrire :
 *
 *   · une sauvegarde par jour par défaut ; « en retard » au-delà d'une fois et demie ;
 *   · rotation « grand-père, père, fils » : la plus récente de chacun des 7
 *     derniers jours, des 4 dernières semaines et des 6 derniers mois (valeur de départ, modifiable).
 *
 * La copie chiffrée hors du poste, la nuit, poste fermé, est demandée à
 * amn-api (`amnApi.ts`, « sauvegarde-serveur »).
 */

export type EtatSauvegarde = 'jamais' | 'a-jour' | 'due' | 'en-retard';

export function etatSauvegarde(derniereAt: number | null, maintenant: number, intervalleH = 24): EtatSauvegarde {
  if (derniereAt === null) return 'jamais';
  const age = maintenant - derniereAt;
  const intervalle = intervalleH * 3_600_000;
  if (age < intervalle) return 'a-jour';
  if (age < intervalle * 1.5) return 'due';
  return 'en-retard';
}

export interface Politique {
  quotidiennes: number;
  hebdomadaires: number;
  mensuelles: number;
}

export const POLITIQUE_PAR_DEFAUT: Politique = { quotidiennes: 7, hebdomadaires: 4, mensuelles: 6 };

/** Les sauvegardes à garder ; les autres peuvent partir. La plus récente est toujours gardée. */
export function aConserver(copies: readonly { id: string; at: number }[], politique: Politique = POLITIQUE_PAR_DEFAUT): Set<string> {
  const triees = [...copies].sort((a, b) => b.at - a.at);
  const garder = new Set<string>();
  if (triees[0]) garder.add(triees[0].id);
  const parCle = (cleDe: (jour: string) => string, n: number) => {
    const vues = new Set<string>();
    for (const c of triees) {
      const cle = cleDe(partiesParis(c.at).jour);
      if (vues.has(cle)) continue;
      if (vues.size >= n) break;
      vues.add(cle);
      garder.add(c.id);
    }
  };
  parCle((j) => j, politique.quotidiennes);
  parCle((j) => ajouterJours(j, 1 - jourIsoDe(j)), politique.hebdomadaires);
  parCle((j) => j.slice(0, 7), politique.mensuelles);
  return garder;
}

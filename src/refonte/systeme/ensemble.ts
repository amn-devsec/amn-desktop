/**
 * LA VUE D'ENSEMBLE D'UNE FAMILLE — où mène la première ligne de chaque famille de la barre latérale.
 *
 * Toute famille sauf Ma journée commence par « Vue d'ensemble » (01-SOCLE-DESIGN §3). Ma journée a son
 * Accueil (`/`). Les sept autres ont leur hub, F10 à F70, à l'adresse `/ensemble/<famille>` — La Garde
 * comprise (`/ensemble/garde`, STATUT § 1.8 : sa salle `/garde` ne change pas). En attendant le hub de son
 * lot, déclaré par substitution sur cette route EXACTE (`src/refonte/substitutions/hubs.ts`), une page
 * générique (`PageEnsembleFamille`) dresse la liste des modules — jamais un lien mort, jamais « introuvable ».
 */

/** Les familles qui ont déjà une page d'accueil propre, et son adresse. */
const ACCUEILS_PROPRES: Readonly<Record<string, string>> = {
  jour: '/',
};

export const PREFIXE_ENSEMBLE = '/ensemble';

/** L'adresse de la vue d'ensemble d'une famille (identifiant du registre : `jour`, `contacts`, `garde`…). */
export function routeEnsemble(idFamille: string): string {
  return ACCUEILS_PROPRES[idFamille] ?? `${PREFIXE_ENSEMBLE}/${encodeURIComponent(idFamille)}`;
}

/** Vrai quand la vue d'ensemble de la famille est la page générique (donc à remplacer par celle de son lot). */
export function ensembleGenerique(idFamille: string): boolean {
  return !(idFamille in ACCUEILS_PROPRES);
}

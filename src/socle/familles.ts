/**
 * LES SEPT FAMILLES DE LA REFONTE — provisoires.
 *
 * Des identifiants stables, en minuscules, qui ne se confondent pas avec les
 * codes à deux lettres du rail actuel (`PI`, `CR`… voir `src/lib/teintes.ts`) :
 * les deux systèmes cohabitent tant que la navigation n'a pas été refaite.
 *
 * Les couleurs vivent dans `src/index.css` (`--color-fam-<id>` et ses
 * variantes), les noms affichés dans `src/socle/i18n.ts`. Ce fichier ne
 * connaît ni l'une ni l'autre.
 */
export const FAMILLES = ['jour', 'contacts', 'ecrire', 'argent', 'echanger', 'creer', 'outils'] as const;

export type Famille = (typeof FAMILLES)[number];

export function estFamille(valeur: unknown): valeur is Famille {
  return typeof valeur === 'string' && (FAMILLES as readonly string[]).includes(valeur);
}

/**
 * LES ONZE FAMILLES DE COULEUR (v4, 06-V4-NEON §1) — les sept, plus La Garde, Cyber (ses propres couleurs, plus
 * celles de La Garde), Développement (LOT-11) et Système (connexion, modules : la paire « brand »). Chacune a deux
 * couleurs, a (principal) et b (second) : jetons `--socle-fam-<id>-a` / `-b` de `noir.css`. La coquille pose la paire
 * de la famille active (`data-famille-active`) en `--fam-a` / `--fam-b` ; un bloc `data-famille` pose la sienne.
 */
export const FAMILLES_COULEUR = [...FAMILLES, 'garde', 'cyber', 'developpement', 'systeme'] as const;

export type FamilleCouleur = (typeof FAMILLES_COULEUR)[number];

export function estFamilleCouleur(valeur: unknown): valeur is FamilleCouleur {
  return typeof valeur === 'string' && (FAMILLES_COULEUR as readonly string[]).includes(valeur);
}

/**
 * La famille de couleur d'une page de la coquille : Cyber sur ses écrans (ses propres couleurs, plus celles de La
 * Garde), la famille active de la barre (ou celle que la page déclare), sinon Système (connexion, modules,
 * notifications…). Pur.
 */
export function familleDeCouleur(surCyber: boolean, familleActive: string | null | undefined): FamilleCouleur {
  if (surCyber) return 'cyber';
  return estFamilleCouleur(familleActive) ? familleActive : 'systeme';
}

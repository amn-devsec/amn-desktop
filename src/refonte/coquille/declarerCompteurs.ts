import { FAMILLES, type Famille } from '../../socle/familles';

/**
 * DÉCLARER UN COMPTEUR DE LA BARRE LATÉRALE — ce qu'un lot écrit.
 * ═══════════════════════════════════════════════════════════════
 *
 * Les pastilles de la barre latérale (« ce qui attend », par adresse de
 * module) ne sont plus calculées en dur dans la coquille : chaque lot déclare
 * les siennes dans UN fichier, `src/refonte/compteurs/<famille>.ts` :
 *
 *   import { declarerCompteurs } from '../coquille/declarerCompteurs';
 *   function useCompteurs(): Record<string, number> {
 *     const articles = useCollection<Article>('stock');
 *     return useMemo(() => ({ '/stock': articlesASurveiller(articles).length }), [articles]);
 *   }
 *   export default declarerCompteurs({ famille: 'creer', useCompteurs });
 *
 * `useCompteurs` est un HOOK (il lit les accès existants) qui rend les
 * compteurs par adresse de vue (`to` du catalogue, « /stock ») ; une adresse
 * absente ou à zéro n'affiche rien. La coquille ramasse les fichiers du
 * dossier seule (`compteurs.ts`), comme le registre des modules (S5) : rien à
 * inscrire ailleurs.
 *
 * Rien ne s'additionne (décision du CO) : sur une adresse, la déclaration du
 * MODULE l'emporte. Un lot peut aussi donner des compteurs de REPLI
 * (`useRepli`, l'activité non vue de `jour.ts`) : ils ne s'affichent que sur
 * une adresse qu'aucune déclaration ne donne — un zéro déclaré compte. Une
 * adresse se déclare une seule fois ; deux fois, la première dans l'ordre des
 * chemins l'emporte.
 *
 * Une déclaration mal formée (sans famille connue, sans hook) est écartée sans
 * rien casser : les autres compteurs s'affichent (`check:socle-coquille`).
 *
 * LES DEUX SIGNAUX DE DÉVELOPPEMENT (LOT-11). L'entrée « Développement » de
 * la barre écrit à droite deux signaux d'état : les déploiements en cours et
 * les tests en échec. Le lot les déclare dans `compteurs/developpement.ts` :
 *
 *   function useSignaux(): SignauxDeveloppement {
 *     const { deploiements, tests } = …; // ses propres accès
 *     return useMemo(() => ({ deploiementsEnCours: …, testsEnEchec: … }), [...]);
 *   }
 *   export default declarerCompteurs({ famille: 'developpement', useCompteurs, useSignaux });
 *
 * `null` (ou absent) : la source n'a pas répondu, rien ne s'écrit — jamais un
 * zéro inventé ; zéro : rien ne s'écrit non plus. `useSignaux` n'appartient
 * qu'à Développement : sur une autre famille, la déclaration est écartée.
 */

/** Qui déclare : une des sept familles, La Garde, Cyber ou Développement. */
export type FamilleCompteurs = Famille | 'garde' | 'cyber' | 'developpement';

/** Les deux signaux de l'entrée « Développement » : `null` ou absent, la source n'a pas répondu. */
export interface SignauxDeveloppement {
  deploiementsEnCours?: number | null;
  testsEnEchec?: number | null;
}

export interface DeclarationCompteurs {
  famille: FamilleCompteurs;
  /** Un hook : les compteurs par adresse de vue. Un objet mémorisé (`useMemo`) évite les recalculs de la barre. */
  useCompteurs: () => Record<string, number>;
  /** Un hook, facultatif : des compteurs de repli, montrés seulement là où aucune déclaration ne donne l'adresse. */
  useRepli?: () => Record<string, number>;
  /** Un hook, Développement seulement : ses deux signaux d'état. */
  useSignaux?: () => SignauxDeveloppement;
}

const FAMILLES_COMPTEURS: ReadonlySet<string> = new Set<string>([...FAMILLES, 'garde', 'cyber', 'developpement']);

/** L'identité, typée : ce que le fichier d'un lot exporte par défaut. */
export function declarerCompteurs(d: DeclarationCompteurs): DeclarationCompteurs {
  return d;
}

/** La raison pour laquelle une valeur n'est pas une déclaration, ou `null` si elle en est une. */
export function verifierDeclaration(valeur: unknown): string | null {
  if (!valeur || typeof valeur !== 'object') return 'pas d’export par défaut (attendu : declarerCompteurs({ famille, useCompteurs }))';
  const d = valeur as Partial<DeclarationCompteurs>;
  if (typeof d.famille !== 'string' || !FAMILLES_COMPTEURS.has(d.famille)) return `famille inconnue : ${String(d.famille)}`;
  if (typeof d.useCompteurs !== 'function') return 'useCompteurs n’est pas une fonction';
  if (d.useRepli !== undefined && typeof d.useRepli !== 'function') return 'useRepli n’est pas une fonction';
  if (d.useSignaux !== undefined && typeof d.useSignaux !== 'function') return 'useSignaux n’est pas une fonction';
  if (d.useSignaux !== undefined && d.famille !== 'developpement') return 'useSignaux est réservé à Développement';
  return null;
}

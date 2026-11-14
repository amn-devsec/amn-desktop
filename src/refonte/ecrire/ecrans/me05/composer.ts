import { dateCourte, jourDe, type Instant, type Jour, type Langue } from '../../commun';
import { aRelire, dureeDeLecture, nbARelire, repondre, type ArticleMin } from '../../connaissances';
import { traduire } from './i18n';
import type { EtapeVue, RubriqueDeLArbre, VueConnaissancesProps } from './VueConnaissances';

/**
 * ME05 — COMPOSER LA VUE de la Base de connaissances : l'arbre des rubriques (« à relire » en ambre), l'article en
 * étapes, la réponse sourcée d'Ajmani (jamais inventée : seuls les articles publiés répondent), le plan de la page.
 * Logique pure : les règles viennent de `../../connaissances.ts`. Ajmani ne dit que ce que la base dit, et propose de
 * créer l'article quand elle ne trouve rien.
 */

export interface EntreesConnaissances {
  langue: Langue;
  maintenant: Instant;
  articles: readonly ArticleMin[];
  choisi: string | null;
  question: string;
  filtre: string;
  rubriquesOuvertes: ReadonlySet<string> | null;
  lecturesDuMois: number | null;
  /** Les lectures de l'article ouvert, si connues. */
  lecturesDeLArticle: number | null;
  auteur: string | null;
  etapeCourante: number;
  /** Modules changés depuis la mise à jour d'un article : jour du changement par module (rend l'article « à relire »). */
  modulesChanges: Readonly<Record<string, Jour>>;
}

const mots = (t: string): number => t.split(/\s+/).filter(Boolean).length;
export const dureeDeLArticle = (a: ArticleMin): number => dureeDeLecture(a.etapes.reduce((s, e) => s + mots(`${e.titre} ${e.texte} ${e.astuce ?? ''}`), 0));

export function composerConnaissances(e: EntreesConnaissances, actions: { onOuvrir: (id: string) => void; onRubrique: (cle: string) => void; onUtile: (oui: boolean) => void }): Pick<VueConnaissancesProps, 'sousTitre' | 'arbre' | 'article' | 'droite'> & { question: VueConnaissancesProps['question'] extends infer Q ? Omit<Q & object, 'onChange'> : never } {
  const l = e.langue;
  const aujourdhui = jourDe(e.maintenant);
  const filtre = e.filtre.trim().toLowerCase();
  const visibles = filtre ? e.articles.filter((a) => a.titre.toLowerCase().includes(filtre)) : e.articles;
  const courant = e.articles.find((a) => a.id === e.choisi) ?? e.articles[0] ?? null;
  const reponse = e.question.trim() ? repondre(e.question, e.articles) : null;
  const source = reponse ? e.articles.find((a) => a.id === reponse.articleId) : null;
  const parRubrique = new Map<string, ArticleMin[]>();
  for (const a of visibles) parRubrique.set(a.rubrique, [...(parRubrique.get(a.rubrique) ?? []), a]);
  const rubriques: RubriqueDeLArbre[] = [...parRubrique].map(([cle, liste]) => ({
    cle,
    titre: cle,
    total: liste.length,
    ouverte: e.rubriquesOuvertes ? e.rubriquesOuvertes.has(cle) : liste.some((a) => a.id === courant?.id) || parRubrique.size === 1,
    articles: [...liste].sort((a, b) => a.titre.localeCompare(b.titre, l)).map((a) => ({ id: a.id, titre: a.titre, actif: a.id === courant?.id, aRelire: aRelire(a, aujourdhui, e.modulesChanges) })),
  }));
  const relire = nbARelire(e.articles, aujourdhui, e.modulesChanges);
  const etapes: EtapeVue[] = courant ? courant.etapes.map((s, i) => ({ rang: i + 1, titre: s.titre, texte: s.texte, astuce: s.astuce ?? null, citee: !!reponse && reponse.articleId === courant.id && reponse.etape === i + 1 })) : [];
  const duree = courant ? dureeDeLArticle(courant) : 0;
  const total = e.articles.length;
  return {
    sousTitre: !total ? traduire(l, 'sousTitreVide') : e.lecturesDuMois === null ? traduire(l, 'sousTitreSans', { a: total }) : traduire(l, 'sousTitre', { a: total, l: e.lecturesDuMois }),
    question: {
      valeur: e.question,
      reponse: reponse && source ? { entete: traduire(l, 'reponse.entete', { n: 1 }), texte: reponse.texte, source: `${source.titre}, ${l === 'fr' ? 'étape' : 'step'} ${reponse.etape}`, utile: traduire(l, 'reponse.utile'), onUtile: actions.onUtile } : null,
      rien: e.question.trim() && !reponse ? traduire(l, 'reponse.rien') : null,
    },
    arbre: { rubriques, onOuvrirArticle: actions.onOuvrir, onRubrique: actions.onRubrique, pied: { total: traduire(l, total <= 1 ? 'arbre.total.1' : 'arbre.total.n', { n: total }), aRelire: relire > 0 ? traduire(l, 'arbre.aRelire', { n: relire }) : null } },
    article: courant ? { chemin: [courant.rubrique, traduire(l, 'article')], titre: courant.titre, meta: { auteur: e.auteur, maj: traduire(l, 'article.maj', { quand: dateCourte(courant.majLe, l) }), lectures: e.lecturesDeLArticle === null ? null : traduire(l, e.lecturesDeLArticle <= 1 ? 'article.lectures.1' : 'article.lectures.n', { n: e.lecturesDeLArticle }) }, etapes, suggestion: null } : null,
    droite: courant
      ? {
          plan: { entete: traduire(l, 'plan.entete'), items: etapes.map((s) => ({ rang: s.rang, titre: s.titre, actif: s.rang === e.etapeCourante })), progression: etapes.length ? e.etapeCourante / etapes.length : 0, pied: traduire(l, 'plan.pied', { a: e.etapeCourante, b: etapes.length, m: duree }) },
          voirAussi: courant.lieA?.length ? { entete: traduire(l, 'aussi.entete'), items: courant.lieA.flatMap((id) => e.articles.filter((a) => a.id === id)).map((a) => ({ id: a.id, titre: a.titre, duree: traduire(l, 'aussi.duree', { m: dureeDeLArticle(a) }) })), onOuvrir: actions.onOuvrir } : null,
          dernierLecteur: null,
        }
      : null,
  };
}

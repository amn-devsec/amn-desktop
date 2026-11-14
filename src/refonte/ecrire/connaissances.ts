import { ajouterMois, aplatir, ecartJours, ms, type Instant, type Jour } from './commun';

/**
 * BASE DE CONNAISSANCES (ME05) — articles, lectures, « à relire », réponse sourcée d'Ajmani. Logique pure.
 *
 * Ajmani cherche d'abord dans la base et ne dit que ce que la base dit : jamais de réponse inventée, toujours la
 * source (article et étape). Une facture envoyée se corrige par un avoir (règle française) : une réponse ne
 * propose jamais de la supprimer.
 */

export interface EtapeDArticle {
  titre: string;
  texte: string;
  astuce?: string;
}

export interface ArticleMin {
  id: string;
  titre: string;
  rubrique: string;
  etapes: readonly EtapeDArticle[];
  majLe: Jour;
  statut: 'publié' | 'brouillon';
  /** Modules cités dans l'article : si l'un a changé depuis la mise à jour, l'article est « à relire ». */
  modulesCites?: readonly string[];
  lieA?: readonly string[];
}

/* ------------------------------ À relire ------------------------------ */

export const MOIS_AVANT_RELECTURE = 6;

/** À relire : non mis à jour depuis plus de 6 mois, ou dont un module cité a changé depuis (Proposition). */
export function aRelire(a: ArticleMin, aujourdhui: Jour, modulesChanges: Readonly<Record<string, Jour>> = {}): boolean {
  if (a.statut !== 'publié') return false;
  if (ajouterMois(a.majLe, MOIS_AVANT_RELECTURE) < aujourdhui) return true;
  return (a.modulesCites ?? []).some((m) => (modulesChanges[m] ?? '') > a.majLe);
}

/** Le compteur du pied : articles à relire. Il descend quand on relit (« Je l'ai relu » met `majLe` à jour). */
export const nbARelire = (articles: readonly ArticleMin[], aujourdhui: Jour, modulesChanges: Readonly<Record<string, Jour>> = {}): number =>
  articles.filter((a) => aRelire(a, aujourdhui, modulesChanges)).length;

/* ------------------------------ Lectures ------------------------------ */

/** Une ouverture compte au-delà de 10 secondes, une fois par personne et par jour. */
export const SECONDES_POUR_COMPTER = 10;

export interface Ouverture {
  articleId: string;
  email: string;
  jour: Jour;
  secondes: number;
}

export function lectures(ouvertures: readonly Ouverture[], options: { articleId?: string; mois?: string } = {}): number {
  const vues = new Set<string>();
  for (const o of ouvertures) {
    if (o.secondes <= SECONDES_POUR_COMPTER) continue;
    if (options.articleId && o.articleId !== options.articleId) continue;
    if (options.mois && !o.jour.startsWith(options.mois)) continue;
    vues.add(`${o.articleId}|${o.email}|${o.jour}`);
  }
  return vues.size;
}

/** Durée de lecture : mots / 200 par minute, arrondie à la minute (au moins 1). */
export const MOTS_PAR_MINUTE = 200;
export const dureeDeLecture = (mots: number): number => Math.max(1, Math.round(mots / MOTS_PAR_MINUTE));

/** « Un collègue l'a lu lundi » : la dernière lecture d'un AUTRE membre dans les 7 jours (Proposition), visible de l'équipe seulement. */
export const JOURS_DE_DERNIERE_LECTURE = 7;
export function derniereLectureParUnAutre(ouvertures: readonly Ouverture[], articleId: string, moi: string, aujourdhui: Jour): { email: string; jour: Jour } | null {
  const autres = ouvertures
    .filter((o) => o.articleId === articleId && o.email !== moi && o.secondes > SECONDES_POUR_COMPTER && ecartJours(o.jour, aujourdhui) >= 0 && ecartJours(o.jour, aujourdhui) <= JOURS_DE_DERNIERE_LECTURE)
    .sort((a, b) => b.jour.localeCompare(a.jour) || a.email.localeCompare(b.email));
  return autres.length ? { email: autres[0].email, jour: autres[0].jour } : null;
}

/* ------------------------------ Sommaire flottant ------------------------------ */

/** L'étape courante : celle en haut de la zone visible. `positions` = ordonnée du haut de chaque étape. */
export function etapeCourante(positions: readonly number[], defilement: number): number {
  let courante = 0;
  positions.forEach((p, i) => {
    if (p <= defilement) courante = i;
  });
  return courante;
}

/** Progression de lecture : part de l'article déjà passée à l'écran (0 à 1). */
export const progressionDeLecture = (defilement: number, hauteurVisible: number, hauteurTotale: number): number =>
  hauteurTotale <= hauteurVisible ? 1 : Math.min(1, Math.max(0, (defilement + hauteurVisible) / hauteurTotale));

/* ------------------------------ La réponse d'Ajmani ------------------------------ */

export interface ReponseSourcee {
  texte: string;
  articleId: string;
  /** Rang de l'étape citée, à partir de 1 ; marquée « cité dans la réponse » dans l'article. */
  etape: number;
}

const VIDES = new Set(['le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'd', 'l', 'a', 'au', 'aux', 'et', 'ou', 'en', 'je', 'tu', 'mon', 'ma', 'mes', 'ton', 'ta', 'tes', 'comment', 'pour', 'sur', 'dans', 'est', 'que', 'qui', 'quoi', 'the', 'to', 'how', 'do', 'i', 'my']);
const mots = (t: string): string[] => aplatir(t).split(/[^a-z0-9]+/).filter((m) => m.length > 1 && !VIDES.has(m));
const phrases = (t: string): string[] => t.split(/(?<=[.!?])\s+/).map((p) => p.trim()).filter(Boolean);

/**
 * Cherche d'abord dans la base. Réponse courte (2 phrases au plus), tirée de l'étape qui correspond le mieux,
 * avec sa source. Aucune correspondance : `null` — l'écran dit « Je n'ai rien trouvé dans ta base » et propose de
 * créer l'article ; rien n'est inventé. Seuls les articles publiés répondent.
 */
export function repondre(question: string, articles: readonly ArticleMin[]): ReponseSourcee | null {
  const q = new Set(mots(question));
  if (!q.size) return null;
  let meilleur: { score: number; a: ArticleMin; i: number } | null = null;
  for (const a of articles) {
    if (a.statut !== 'publié') continue;
    a.etapes.forEach((e, i) => {
      const cible = new Set(mots(`${a.titre} ${e.titre} ${e.texte}`));
      const communs = [...q].filter((m) => cible.has(m)).length;
      // Il faut couvrir la moitié de la question au moins, et un mot du titre de l'article ou de l'étape compte double.
      const titres = new Set(mots(`${a.titre} ${e.titre}`));
      const score = communs + [...q].filter((m) => titres.has(m)).length;
      if (communs * 2 >= q.size && (!meilleur || score > meilleur.score)) meilleur = { score, a, i };
    });
  }
  if (!meilleur) return null;
  const { a, i } = meilleur as { score: number; a: ArticleMin; i: number };
  return { texte: phrases(a.etapes[i].texte).slice(0, 2).join(' '), articleId: a.id, etape: i + 1 };
}

/* ------------------------------ Déclencheur du parcours d'accueil ------------------------------ */

export const CITATIONS_POUR_PARCOURS = 5;

/**
 * « Cet article répond à n questions fréquentes… » (parcours des nouveaux membres) : article cité dans au moins 5
 * réponses d'Ajmani ou lié à au moins 5 questions fréquentes, et absent du parcours d'accueil.
 */
export function proposerAuParcours(stats: { citations: number; questionsLiees: number; dansLeParcours: boolean }): boolean {
  return !stats.dansLeParcours && (stats.citations >= CITATIONS_POUR_PARCOURS || stats.questionsLiees >= CITATIONS_POUR_PARCOURS);
}

/** Les questions fréquentes (3 cliquables sous le champ vide) : les plus posées, à égalité par ordre alphabétique. */
export function questionsFrequentes(posees: readonly string[], n = 3): string[] {
  const c = new Map<string, number>();
  for (const q of posees) c.set(q, (c.get(q) ?? 0) + 1);
  return [...c].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, n).map(([q]) => q);
}

/** Maintenant ou plus tôt : un instant ISO vers un jour, pour les ouvertures. */
export const jourDeLOuverture = (i: Instant): Jour => new Date(ms(i)).toISOString().slice(0, 10);

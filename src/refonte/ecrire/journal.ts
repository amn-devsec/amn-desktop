import { ajouterJours, compterMots, ecartJours, jourSemaineIso, lundiDe, moisPrecedent, type Jour } from './commun';
import { intensiteDeMots } from './serie';

/**
 * JOURNAL (ME01) — la page du jour guidée. Logique pure.
 *
 * Le journal est PRIVÉ : une page n'est visible que par son auteur, jamais partagée par défaut, jamais dans une
 * notification ni dans un écran partagé. Ajmani ne le lit que quand on le lui demande.
 */

export const HUMEURS = [1, 2, 3, 4, 5] as const;
export type Humeur = (typeof HUMEURS)[number];
/** Du plus bas au plus haut : Difficile, Moyen, Bien, Très bien, Excellent (ME01 §4). */
export const NOM_DES_HUMEURS: Record<Humeur, { fr: string; en: string }> = {
  1: { fr: 'Difficile', en: 'Rough' },
  2: { fr: 'Moyen', en: 'So-so' },
  3: { fr: 'Bien', en: 'Good' },
  4: { fr: 'Très bien', en: 'Very good' },
  5: { fr: 'Excellent', en: 'Excellent' },
};

export interface PageDeJournal {
  jour: Jour;
  auteurEmail: string;
  humeur?: Humeur | null;
  /** 1 à 5 segments. */
  energie?: number | null;
  mercis?: readonly string[];
  texte?: string;
  etiquettes?: readonly string[];
}

/** Mots de tous les champs (mercis et texte libre). */
export const motsDeLaPage = (p: PageDeJournal): number => (p.mercis ?? []).reduce((s, m) => s + compterMots(m), 0) + compterMots(p.texte ?? '');

/** Un jour est écrit dès qu'un champ est rempli (humeur, énergie, un merci, du texte). */
export const estEcrite = (p: PageDeJournal): boolean =>
  p.humeur != null || (p.energie ?? 0) > 0 || (p.mercis ?? []).some((m) => m.trim()) || !!(p.texte ?? '').trim();

/** L'intensité du rond du calendrier : mots / 260, plafonné à 1. */
export const intensiteDeLaPage = (p: PageDeJournal): number => intensiteDeMots(motsDeLaPage(p));

/** Le journal d'une personne : jamais celui d'une autre. */
export const visiblePar = (p: PageDeJournal, email: string): boolean => p.auteurEmail === email;
export const pagesDe = (pages: readonly PageDeJournal[], email: string): PageDeJournal[] => pages.filter((p) => visiblePar(p, email));

/* ------------------------------ Humeur du mois ------------------------------ */

export interface BarreDHumeur {
  jour: Jour;
  humeur: Humeur;
  /** Hauteur de la barre = humeur × 20 %. */
  hauteurPourcent: number;
}

/**
 * Une barre par jour avec une humeur ; « le plus souvent » = la valeur la plus fréquente du mois
 * (à égalité, la plus récente, pour que le mot change avec la vie et pas avec l'ordre des clés).
 */
export function humeurDuMois(pages: readonly PageDeJournal[], mois: string): { barres: BarreDHumeur[]; leplusSouvent: Humeur | null } {
  const barres = pages
    .filter((p) => p.jour.startsWith(mois) && p.humeur != null)
    .sort((a, b) => a.jour.localeCompare(b.jour))
    .map((p): BarreDHumeur => ({ jour: p.jour, humeur: p.humeur as Humeur, hauteurPourcent: (p.humeur as Humeur) * 20 }));
  const compte = new Map<Humeur, { n: number; dernier: Jour }>();
  for (const b of barres) {
    const c = compte.get(b.humeur) ?? { n: 0, dernier: '' };
    compte.set(b.humeur, { n: c.n + 1, dernier: b.jour });
  }
  const tri = [...compte].sort((a, b) => b[1].n - a[1].n || b[1].dernier.localeCompare(a[1].dernier));
  return { barres, leplusSouvent: tri.length ? tri[0][0] : null };
}

/* ------------------------------ Il y a un mois ------------------------------ */

export const ILYAUNMOIS_TOLERANCE_JOURS = 7;

/**
 * La page du même jour le mois précédent (30 oct. → 30 sept.) ; à défaut, la page écrite la plus proche avant
 * cette date, à 7 jours au plus ; sinon la carte disparaît (`null`). Toujours dans les pages de la personne.
 */
export function ilYAUnMois(pages: readonly PageDeJournal[], moi: string, aujourdhui: Jour): PageDeJournal | null {
  const cible = moisPrecedent(aujourdhui);
  const miennes = pagesDe(pages, moi).filter(estEcrite);
  const exacte = miennes.find((p) => p.jour === cible);
  if (exacte) return exacte;
  const avant = miennes.filter((p) => p.jour < cible && ecartJours(p.jour, cible) <= ILYAUNMOIS_TOLERANCE_JOURS).sort((a, b) => b.jour.localeCompare(a.jour));
  return avant[0] ?? null;
}

/* ------------------------------ Le bandeau du vendredi ------------------------------ */

export const PAGES_POUR_RESUMER = 3;

/**
 * « C'est vendredi : je peux résumer ta semaine… ». Déclencheur : vendredi, au moins 3 pages écrites dans la
 * semaine, et un événement « Bilan de la semaine » dans le calendrier (H01). « Non merci » masque jusqu'au vendredi prochain.
 */
export function proposerResume(pages: readonly PageDeJournal[], moi: string, aujourdhui: Jour, bilanAuCalendrier: boolean, masqueJusquau?: Jour | null): boolean {
  if (jourSemaineIso(aujourdhui) !== 5 || !bilanAuCalendrier) return false;
  if (masqueJusquau && aujourdhui < masqueJusquau) return false;
  const lundi = lundiDe(aujourdhui);
  const n = pagesDe(pages, moi).filter((p) => estEcrite(p) && p.jour >= lundi && p.jour <= aujourdhui).length;
  return n >= PAGES_POUR_RESUMER;
}

/** « Non merci » : masqué jusqu'au vendredi suivant (7 jours plus tard). */
export const masquerResumeJusquau = (aujourdhui: Jour): Jour => ajouterJours(aujourdhui, 7);

/** ⌘↵ passe à la page du lendemain, seulement si demain n'est pas dans le futur ; sinon « À demain ». */
export const peutPasserADemain = (jourOuvert: Jour, aujourdhui: Jour): boolean => ajouterJours(jourOuvert, 1) <= aujourdhui;

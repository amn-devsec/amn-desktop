import { totauxDeFacture } from '../../donnees/argent';
import { ajouterJours, ecartJours, type Jour } from '../commun';
import { couleurSante, type CouleurSante } from '../clients';
import type { SourcesContacts } from '../sources/types';

/**
 * LOT-02 · H44 « RETOURS CLIENTS » — le modèle de la jauge de recommandation, des thèmes et du mur de citations
 * (logique pure, fiche H44 rubrique 6).
 *
 * Ce que l'application ne sait pas reste `null` (« non disponible », jamais un zéro qui mentirait) : les thèmes
 * (aucun avis n'en porte), la collecte (les demandes d'avis ne sont pas suivies). Aucune réponse à un avis n'est
 * enregistrée dans l'application : « À répondre » désigne un avis de 3 étoiles ou moins des 30 derniers jours.
 */
export type LibelleReco = 'excellent' | 'tresBon' | 'bon' | 'aAmeliorer' | 'fragile';
export type SentimentCarte = 'positif' | 'neutre' | 'negatif';

export interface CarteAvis {
  id: string;
  client: string;
  clientId: number;
  note: number;
  /** `true` : 4 ou 5 étoiles (vert), sinon orange. */
  positif: boolean;
  texte: string;
  date: Jour;
  themes: string[];
  initiale: string;
  aRepondre: boolean;
}

export interface ThemeMesure { theme: string; avis: number; partPositive: number; couleur: CouleurSante }

export interface FactureEnRetard { numero: string; jours: number; cents: number }

export interface ModeleRetours {
  /** Avis des 12 derniers mois. */
  nbAvis: number;
  positifs: number;
  recommandent: number;
  neutres: number;
  decus: number;
  /** % arrondis qui somment 100 (0 partout sans avis). */
  parts: { recommandent: number; neutres: number; decus: number };
  /** −100 à 100 ; `null` sans avis. */
  score: number | null;
  /** Remplissage de l'arc : (score + 100) ÷ 200. */
  remplissage: number;
  libelle: LibelleReco | null;
  /** Écart avec le score d'il y a 3 mois, ou `null` sans base. */
  delta: number | null;
  noteMoyenne: number | null;
  /** Moyenne par mois sur 6 mois (le plus ancien d'abord), `null` pour un mois sans avis. */
  courbe: (number | null)[];
  moisCourbe: [string, string];
  /** `null` : aucun avis ne porte de thème. */
  themes: ThemeMesure[] | null;
  avis: CarteAvis[];
  chips: { tous: number; aRepondre: number; cinqEtoiles: number };
  /** L'avis mis en avant : le plus récent de 3 étoiles ou moins, des 30 derniers jours. */
  aRepondre: { carte: CarteAvis; depuisJours: number; factureEnRetard: FactureEnRetard | null } | null;
  /** `null` : les demandes d'avis ne sont pas suivies par l'application. */
  collecte: { recus: number; demandes: number } | null;
}

export type FiltreMur = 'tous' | 'aRepondre' | 'cinqEtoiles';

const FENETRE_JOURS = 365;
const REPONDRE_JOURS = 30;

/** Arrondit des parts pour qu'elles somment 100 (méthode du plus grand reste). */
export function arrondirA100(valeurs: readonly number[]): number[] {
  const total = valeurs.reduce((s, v) => s + v, 0);
  if (total === 0) return valeurs.map(() => 0);
  const brut = valeurs.map((v) => (v / total) * 100);
  const base = brut.map((v) => Math.floor(v));
  let reste = 100 - base.reduce((s, v) => s + v, 0);
  const ordre = brut.map((v, i) => ({ i, f: v - Math.floor(v) })).sort((a, b) => b.f - a.f || a.i - b.i);
  for (const { i } of ordre) { if (reste <= 0) break; base[i] += 1; reste -= 1; }
  return base;
}

/** Recommandent 9-10, neutres 7-8, déçus 0-6 ; sans note de recommandation : 5 étoiles, 4, 3 ou moins. */
export function categorie(a: { recommandation: number | null; noteSur5: number }): 'recommandent' | 'neutres' | 'decus' {
  if (a.recommandation != null) return a.recommandation >= 9 ? 'recommandent' : a.recommandation >= 7 ? 'neutres' : 'decus';
  return a.noteSur5 >= 5 ? 'recommandent' : a.noteSur5 >= 4 ? 'neutres' : 'decus';
}

/** ≥ 70 « Excellent », 50 à 69 « Très bon », 30 à 49 « Bon », 0 à 29 « À améliorer », < 0 « Fragile ». */
export const libelleReco = (score: number): LibelleReco => (score >= 70 ? 'excellent' : score >= 50 ? 'tresBon' : score >= 30 ? 'bon' : score >= 0 ? 'aAmeliorer' : 'fragile');

export function scoreDe(avis: readonly { recommandation: number | null; noteSur5: number }[]): { score: number; parts: { recommandent: number; neutres: number; decus: number } } | null {
  if (avis.length === 0) return null;
  const n = { recommandent: 0, neutres: 0, decus: 0 };
  for (const a of avis) n[categorie(a)] += 1;
  const [r, ne, d] = arrondirA100([n.recommandent, n.neutres, n.decus]);
  return { score: r - d, parts: { recommandent: r, neutres: ne, decus: d } };
}

const moyenne = (l: readonly number[]): number => l.reduce((s, v) => s + v, 0) / l.length;

export function modeleRetours(src: SourcesContacts): ModeleRetours {
  const debut = ajouterJours(src.aujourdhui, -FENETRE_JOURS);
  const dans = src.avis.filter((a) => a.date >= debut && a.date <= src.aujourdhui);
  const courant = scoreDe(dans);
  const ilYa3Mois = ajouterJours(src.aujourdhui, -90);
  const avant = scoreDe(src.avis.filter((a) => a.date >= ajouterJours(ilYa3Mois, -FENETRE_JOURS) && a.date <= ilYa3Mois));

  const cartes: CarteAvis[] = [...src.avis]
    .sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id))
    .map((a) => ({
      id: a.id,
      client: a.clientNom,
      clientId: a.clientId,
      note: a.noteSur5,
      positif: a.noteSur5 >= 4,
      texte: a.texte,
      date: a.date,
      themes: a.themes,
      initiale: a.clientNom.trim().charAt(0).toUpperCase(),
      aRepondre: a.noteSur5 <= 3 && a.noteSur5 > 0 && ecartJours(a.date, src.aujourdhui) <= REPONDRE_JOURS,
    }));

  // Les six derniers mois, du plus ancien au plus récent.
  const [ya, ym] = src.aujourdhui.split('-').map(Number);
  const mois = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(Date.UTC(ya, ym - 1 - (5 - i), 1));
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  });
  const courbe = mois.map((m) => {
    const notes = src.avis.filter((a) => a.date.slice(0, 7) === m && a.noteSur5 > 0).map((a) => a.noteSur5);
    return notes.length ? Math.round(moyenne(notes) * 10) / 10 : null;
  });

  const parTheme = new Map<string, { n: number; pos: number }>();
  for (const a of dans) for (const t of new Set(a.themes)) {
    const x = parTheme.get(t) ?? { n: 0, pos: 0 };
    x.n += 1;
    if (a.noteSur5 >= 4) x.pos += 1;
    parTheme.set(t, x);
  }
  const themes: ThemeMesure[] | null = parTheme.size === 0 ? null : [...parTheme.entries()]
    .map(([theme, x]) => ({ theme, avis: x.n, partPositive: Math.round((x.pos / x.n) * 100), couleur: couleurSante(Math.round((x.pos / x.n) * 100)) }))
    .sort((a, b) => b.avis - a.avis || a.theme.localeCompare(b.theme, 'fr'))
    .slice(0, 5);

  const aRepondreCarte = cartes.find((c) => c.aRepondre) ?? null;
  const factures = aRepondreCarte
    ? src.factures
        .filter((f) => f.clientId === aRepondreCarte.clientId && f.status === 'issued' && f.dueAt < src.aujourdhui)
        .sort((a, b) => a.dueAt.localeCompare(b.dueAt))[0]
    : undefined;

  return {
    nbAvis: dans.length,
    positifs: dans.filter((a) => a.noteSur5 >= 4).length,
    recommandent: dans.filter((a) => categorie(a) === 'recommandent').length,
    neutres: dans.filter((a) => categorie(a) === 'neutres').length,
    decus: dans.filter((a) => categorie(a) === 'decus').length,
    parts: courant?.parts ?? { recommandent: 0, neutres: 0, decus: 0 },
    score: courant?.score ?? null,
    remplissage: courant ? (courant.score + 100) / 200 : 0,
    libelle: courant ? libelleReco(courant.score) : null,
    delta: courant && avant ? courant.score - avant.score : null,
    noteMoyenne: dans.filter((a) => a.noteSur5 > 0).length ? Math.round(moyenne(dans.filter((a) => a.noteSur5 > 0).map((a) => a.noteSur5)) * 10) / 10 : null,
    courbe,
    moisCourbe: [mois[0], mois[5]],
    themes,
    avis: cartes,
    chips: { tous: cartes.length, aRepondre: cartes.filter((c) => c.aRepondre).length, cinqEtoiles: cartes.filter((c) => c.note === 5).length },
    aRepondre: aRepondreCarte ? { carte: aRepondreCarte, depuisJours: ecartJours(aRepondreCarte.date, src.aujourdhui), factureEnRetard: factures ? { numero: factures.number, jours: ecartJours(factures.dueAt, src.aujourdhui), cents: totauxDeFacture(factures).ttcCents } : null } : null,
    collecte: null,
  };
}

export function filtrerMur(cartes: readonly CarteAvis[], filtre: FiltreMur, theme: string | null): CarteAvis[] {
  return cartes.filter((c) => (filtre === 'aRepondre' ? c.aRepondre : filtre === 'cinqEtoiles' ? c.note === 5 : true) && (theme == null || c.themes.includes(theme)));
}

/** Le poids d'une carte pour équilibrer les colonnes : le texte compte plus que le reste. */
const poids = (c: CarteAvis): number => 120 + c.texte.length;

/**
 * Le mur : trois colonnes indépendantes. Avec un avis à répondre, il occupe seul la colonne 2 et les autres cartes se
 * partagent les colonnes 1 et 3 ; sans lui, les trois colonnes se partagent tout. Chaque carte va dans la colonne la
 * moins chargée, les plus récentes d'abord : l'ordre de lecture reste celui du temps.
 */
export function repartirMur(cartes: readonly CarteAvis[], miseEnAvantId: string | null): [CarteAvis[], CarteAvis[], CarteAvis[]] {
  const col: [CarteAvis[], CarteAvis[], CarteAvis[]] = [[], [], []];
  const charge = [0, 0, 0];
  const dispo = miseEnAvantId ? [0, 2] : [0, 1, 2];
  if (miseEnAvantId) {
    const f = cartes.find((c) => c.id === miseEnAvantId);
    if (f) { col[1].push(f); charge[1] = Number.POSITIVE_INFINITY; }
  }
  for (const c of cartes) {
    if (c.id === miseEnAvantId) continue;
    const k = dispo.reduce((m, i) => (charge[i] < charge[m] ? i : m), dispo[0]);
    col[k].push(c);
    charge[k] += poids(c);
  }
  return col;
}

const neutraliser = (v: string): string => (/^[=+\-@\t\r]/.test(v) ? `'${v}` : v);
const cellule = (v: string | number): string => `"${neutraliser(String(v)).replace(/"/g, '""')}"`;

/** L'export des avis : un fichier CSV (date, client, note sur 5, texte, thèmes). Une cellule qui commence par `=`, `+`, `-` ou `@` est neutralisée pour un tableur. */
export function csvDesAvis(cartes: readonly CarteAvis[]): string {
  const lignes = [['date', 'client', 'note_sur_5', 'texte', 'themes'], ...cartes.map((c) => [c.date, c.client, c.note, c.texte, c.themes.join(' | ')])];
  return `\ufeff${lignes.map((l) => l.map(cellule).join(';')).join('\r\n')}\r\n`;
}

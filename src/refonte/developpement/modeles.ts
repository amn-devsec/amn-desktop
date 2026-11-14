/**
 * LOT-11 · LA BIBLIOTHÈQUE DES MODÈLES DE SITES — logique pure (fiche DEV-modeles-sites, rubrique 6).
 *
 * Un modèle est une page complète (un seul fichier HTML, sans dépendance). Les modèles livrés avec l'application
 * n'y entrent qu'après la relecture de leurs textes par Harun (décision du 12 nov.) : la liste livrée est vide
 * d'ici là. Les modèles ajoutés par l'équipe restent sur ce poste (« Il reste sur cet ordinateur. ») ; les
 * partager avec l'équipe demandera le serveur (évolution notée).
 */

export interface ModeleSite {
  id: string;
  nom: string;
  secteur: string;
  etiquettes: readonly string[];
  html: string;
  origine: 'livre' | 'ajoute';
}

/** Les modèles livrés : vides jusqu'à la relecture de Harun. */
export const MODELES_LIVRES: readonly ModeleSite[] = [];

export const NOM_MAX = 50;
export const SECTEUR_MAX = 30;
export const CLE_STOCKAGE = 'amn-modeles-sites';

const sansAccent = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

/** Les puces : « Tous » (clé et libellé vides, l'écran le nomme) puis un secteur par valeur, en ordre alphabétique français, avec leur compte. */
export function puces(modeles: readonly ModeleSite[]): { cle: string; libelle: string; compte: number }[] {
  const comptes = new Map<string, number>();
  for (const m of modeles) comptes.set(m.secteur, (comptes.get(m.secteur) ?? 0) + 1);
  const secteurs = [...comptes.keys()].sort((a, b) => a.localeCompare(b, 'fr'));
  return [{ cle: '', libelle: '', compte: modeles.length }, ...secteurs.map((s) => ({ cle: s, libelle: s, compte: comptes.get(s) ?? 0 }))];
}

/** Le filtre : la puce (secteur) et chaque mot tapé, cherché dans nom + secteur + étiquettes, sans casse ni accent. */
export function filtrer(modeles: readonly ModeleSite[], secteur: string, recherche: string): ModeleSite[] {
  const mots = sansAccent(recherche).split(/\s+/).filter(Boolean);
  return modeles.filter((m) => {
    if (secteur && m.secteur !== secteur) return false;
    if (!mots.length) return true;
    const foin = sansAccent([m.nom, m.secteur, ...m.etiquettes].join(' '));
    return mots.every((w) => foin.includes(w));
  });
}

/** « 4,5 Ko » : octets UTF-8 / 1024, une décimale, virgule. */
export function poids(html: string): string {
  const octets = new TextEncoder().encode(html).length;
  return `${(Math.round((octets / 1024) * 10) / 10).toFixed(1).replace('.', ',')} Ko`;
}

export const lignes = (html: string): number => html.split('\n').length;

/** Ce qui manque pour ajouter un modèle, ou `null`. */
export function fauteDAjout(nom: string, secteur: string, html: string): 'nom' | 'secteur' | 'code' | null {
  if (!nom.trim() || nom.trim().length > NOM_MAX) return 'nom';
  if (!secteur.trim() || secteur.trim().length > SECTEUR_MAX) return 'secteur';
  if (!html.trim() || !/<html[\s>]|<!doctype html/i.test(html)) return 'code';
  return null;
}

/** Lit les modèles ajoutés sur ce poste ; une valeur illisible donne une liste vide. */
export function lireAjoutes(brut: string | null): ModeleSite[] {
  if (!brut) return [];
  try {
    const v = JSON.parse(brut) as unknown;
    if (!Array.isArray(v)) return [];
    return v
      .filter((x): x is { id: string; nom: string; secteur: string; html: string } => !!x && typeof x === 'object' && typeof (x as { html?: unknown }).html === 'string' && typeof (x as { nom?: unknown }).nom === 'string')
      .map((x) => ({ id: String(x.id), nom: x.nom.slice(0, NOM_MAX), secteur: String(x.secteur ?? '').slice(0, SECTEUR_MAX), etiquettes: ['Ajouté'], html: x.html, origine: 'ajoute' as const }));
  } catch {
    return [];
  }
}

export const ecrireAjoutes = (modeles: readonly ModeleSite[]): string =>
  JSON.stringify(modeles.filter((m) => m.origine === 'ajoute').map(({ id, nom, secteur, html }) => ({ id, nom, secteur, html })));

export type JetonCode = { genre: 'texte' | 'balise' | 'attribut' | 'valeur' | 'commentaire'; texte: string };

/** Le code découpé en jetons colorables (balises, attributs, valeurs, commentaires), sans jamais l'interpréter. */
export function jetonsHtml(ligne: string): JetonCode[] {
  const sortie: JetonCode[] = [];
  const motif = /(<!--[\s\S]*?-->)|(<\/?)([a-zA-Z][\w-]*)|(\s)([\w:-]+)(=)("[^"]*")/g;
  let reste = 0;
  for (const m of ligne.matchAll(motif)) {
    if (m.index > reste) sortie.push({ genre: 'texte', texte: ligne.slice(reste, m.index) });
    if (m[1]) sortie.push({ genre: 'commentaire', texte: m[1] });
    else if (m[2]) sortie.push({ genre: 'texte', texte: m[2] }, { genre: 'balise', texte: m[3] });
    else sortie.push({ genre: 'texte', texte: m[4] }, { genre: 'attribut', texte: m[5] }, { genre: 'texte', texte: m[6] }, { genre: 'valeur', texte: m[7] });
    reste = m.index + m[0].length;
  }
  if (reste < ligne.length) sortie.push({ genre: 'texte', texte: ligne.slice(reste) });
  return sortie;
}

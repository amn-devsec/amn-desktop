/**
 * H25 · LA GRILLE DU TABLEAU DE BORD — logique pure (fiche H25, rubrique 6).
 *
 * Six colonnes, des rangées de 116 px, taille de 1 × 1 à 6 × 3. Un widget ne chevauche jamais un autre : un widget
 * posé ou agrandi pousse ses voisins vers le bas (« les voisins descendent »). La disposition ne contient aucune donnée
 * (ni clé, ni valeur d'un connecteur) : un type, une place, une taille, une source par son nom.
 */

export const COLONNES = 6;
export const HAUTEUR_RANGEE_PX = 116;
export const LARGEUR_MIN = 1;
export const HAUTEUR_MIN = 1;
export const LARGEUR_MAX = 6;
export const HAUTEUR_MAX = 3;

export const TYPES_DE_WIDGET = ['chiffre', 'courbe', 'barres', 'anneau', 'jauge', 'liste', 'agenda', 'note', 'garde'] as const;
export type TypeDeWidget = (typeof TYPES_DE_WIDGET)[number];

export interface Widget {
  id: string;
  /** Ce que le widget montre (`ca`, `objectif`, `taches`, `agenda`, `tickets`, `utilisateurs`, `note`, `factures`, `activite`, `garde`). */
  contenu: string;
  type: TypeDeWidget;
  /** Colonne de départ, 1 à 6. */
  colonne: number;
  /** Rangée de départ, 1 et plus. */
  rangee: number;
  largeur: number;
  hauteur: number;
  /** La source par son nom (`Stripe`, `AMN`, `Libre`…), jamais une clé. */
  source?: string;
}

const borner = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, Math.round(v)));

/** Ramène un widget dans la grille et dans les tailles permises. */
export function borne(w: Widget): Widget {
  const largeur = borner(w.largeur, LARGEUR_MIN, LARGEUR_MAX);
  const hauteur = borner(w.hauteur, HAUTEUR_MIN, HAUTEUR_MAX);
  return { ...w, largeur, hauteur, colonne: borner(w.colonne, 1, COLONNES - largeur + 1), rangee: Math.max(1, Math.round(w.rangee)) };
}

export const chevauche = (a: Widget, b: Widget): boolean =>
  a.id !== b.id && a.colonne < b.colonne + b.largeur && b.colonne < a.colonne + a.largeur && a.rangee < b.rangee + b.hauteur && b.rangee < a.rangee + a.hauteur;

/**
 * Pose `fixe` à sa place et fait descendre ce qui le gêne, de proche en proche. Les widgets qui n'ont pas bougé gardent
 * leur place tant qu'ils ne gênent personne ; l'ordre de lecture (rangée, colonne) départage.
 */
export function ranger(widgets: readonly Widget[], fixe?: Widget): Widget[] {
  const posés: Widget[] = fixe ? [borne(fixe)] : [];
  const autres = widgets
    .filter((w) => w.id !== fixe?.id)
    .map(borne)
    .sort((a, b) => a.rangee - b.rangee || a.colonne - b.colonne || a.id.localeCompare(b.id));
  for (const w of autres) {
    let courant = w;
    while (posés.some((p) => chevauche(courant, p))) courant = { ...courant, rangee: courant.rangee + 1 };
    posés.push(courant);
  }
  return posés.sort((a, b) => a.rangee - b.rangee || a.colonne - b.colonne || a.id.localeCompare(b.id));
}

/** Le déplacement : le widget va à la case demandée, ses voisins descendent. */
export function deplacer(widgets: readonly Widget[], id: string, colonne: number, rangee: number): Widget[] {
  const w = widgets.find((x) => x.id === id);
  return w ? ranger(widgets, { ...w, colonne, rangee }) : [...widgets];
}

/** Le redimensionnement : aligné sur la grille, dans les tailles permises, ses voisins descendent. */
export function redimensionner(widgets: readonly Widget[], id: string, largeur: number, hauteur: number): Widget[] {
  const w = widgets.find((x) => x.id === id);
  return w ? ranger(widgets, { ...w, largeur, hauteur }) : [...widgets];
}

export const retirer = (widgets: readonly Widget[], id: string): Widget[] => ranger(widgets.filter((w) => w.id !== id));

/** La première case libre où tient un widget de cette taille (de haut en bas, de gauche à droite). */
export function premierEmplacement(widgets: readonly Widget[], largeur: number, hauteur: number): { colonne: number; rangee: number } {
  const l = borner(largeur, LARGEUR_MIN, LARGEUR_MAX);
  const h = borner(hauteur, HAUTEUR_MIN, HAUTEUR_MAX);
  const bas = widgets.reduce((m, w) => Math.max(m, w.rangee + w.hauteur - 1), 0);
  for (let rangee = 1; rangee <= bas + 1; rangee += 1) {
    for (let colonne = 1; colonne <= COLONNES - l + 1; colonne += 1) {
      const essai: Widget = { id: '', contenu: '', type: 'note', colonne, rangee, largeur: l, hauteur: h };
      if (!widgets.some((w) => chevauche(essai, w))) return { colonne, rangee };
    }
  }
  return { colonne: 1, rangee: bas + 1 };
}

/** Un identifiant de widget qui n'est dans aucune liste donnée ; le suffixe vient de la liste, pas du hasard ni de l'horloge. */
export function idLibre(widgets: readonly Widget[], base: string): string {
  const pris = new Set(widgets.map((w) => w.id));
  let n = 1;
  let id = `${base}-${n}`;
  while (pris.has(id)) {
    n += 1;
    id = `${base}-${n}`;
  }
  return id;
}

/** L'ajout : à la première case libre, à la taille donnée. */
export function ajouter(widgets: readonly Widget[], neuf: Omit<Widget, 'id' | 'colonne' | 'rangee'>): Widget[] {
  const place = premierEmplacement(widgets, neuf.largeur, neuf.hauteur);
  return ranger([...widgets, { ...neuf, ...place, id: idLibre(widgets, neuf.contenu) }]);
}

/** La copie : même taille, première case libre, une source identique. */
export function dupliquer(widgets: readonly Widget[], id: string): Widget[] {
  const w = widgets.find((x) => x.id === id);
  if (!w) return [...widgets];
  const { id: _id, colonne: _c, rangee: _r, ...reste } = w;
  void _id; void _c; void _r;
  return ajouter(widgets, reste);
}

/** Les rangées occupées : de quoi dimensionner la toile. */
export const rangeesUtilisees = (widgets: readonly Widget[]): number => widgets.reduce((m, w) => Math.max(m, w.rangee + w.hauteur - 1), 0);

/** Le repère « l × h » d'un widget sélectionné. */
export const reperDeTaille = (w: Pick<Widget, 'largeur' | 'hauteur'>): string => `${w.largeur} × ${w.hauteur}`;

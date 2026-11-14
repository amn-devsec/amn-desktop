/**
 * LOT-02 · H06 — la géométrie du nuage « intérêt × montant » (logique pure, aucune mesure du navigateur).
 *
 * Le tracé fait 736 × 548 ; ses marges intérieures sont gauche 64, droite 16, haut 14, bas 46 (fiche H06, rubrique 3).
 * Le rayon d'un point est 5 + chance × 8 / 100 ; l'étiquette d'un point va à droite par défaut, puis à gauche, au-dessus,
 * en dessous, et se tait si aucune place ne laisse les points et les autres étiquettes intacts (« aucun chevauchement toléré »).
 */
export const TRACE = { largeur: 736, hauteur: 548, gauche: 64, droite: 16, haut: 14, bas: 46 } as const;
export const INTERIEUR = { x: TRACE.gauche, y: TRACE.haut, largeur: TRACE.largeur - TRACE.gauche - TRACE.droite, hauteur: TRACE.hauteur - TRACE.haut - TRACE.bas } as const;

export const positionX = (interet: number): number => INTERIEUR.x + (Math.max(0, Math.min(100, interet)) / 100) * INTERIEUR.largeur;
export const positionY = (montantCents: number, plafondCents: number): number => INTERIEUR.y + (1 - Math.max(0, Math.min(plafondCents, montantCents)) / plafondCents) * INTERIEUR.hauteur;
export const rayonDuPoint = (chance: number): number => 5 + (Math.max(0, Math.min(100, chance)) * 8) / 100;

export interface PointGeom { id: string; x: number; y: number; r: number; nom: string; montant: string; prioritaire: boolean; /** Plus gros d'abord : l'ordre de priorité des étiquettes. */ poids: number }
export type CoteEtiquette = 'droite' | 'gauche' | 'dessus' | 'dessous';
export interface Etiquette { id: string; cote: CoteEtiquette; x: number; y: number; largeur: number; hauteur: number }

const LARGEUR_CAR = 6.4;
const HAUTEUR_ETIQUETTE = 28;
const MARGE = 3;

export const largeurEtiquette = (nom: string, montant: string): number => Math.ceil(Math.max(nom.length * LARGEUR_CAR, montant.length * 6.6));

export interface Rect { x: number; y: number; largeur: number; hauteur: number }
const seCoupent = (a: Rect, b: Rect): boolean => a.x < b.x + b.largeur + MARGE && b.x < a.x + a.largeur + MARGE && a.y < b.y + b.hauteur + MARGE && b.y < a.y + a.hauteur + MARGE;
const coupeCercle = (r: Rect, c: { x: number; y: number; r: number }): boolean => {
  const px = Math.max(r.x, Math.min(c.x, r.x + r.largeur));
  const py = Math.max(r.y, Math.min(c.y, r.y + r.hauteur));
  return (px - c.x) ** 2 + (py - c.y) ** 2 < (c.r + MARGE) ** 2;
};

/**
 * Place les étiquettes une à une, les points prioritaires et les plus gros d'abord. Une étiquette qui ne trouve aucune
 * place sans toucher un point ou une étiquette déjà posée est omise : le nom reste lisible au survol (bulle du point).
 */
export function placerEtiquettes(points: readonly PointGeom[], sauf: ReadonlySet<string> = new Set(), reservees: readonly Rect[] = []): Map<string, Etiquette> {
  const posees = new Map<string, Etiquette>();
  const ordre = [...points].filter((p) => !sauf.has(p.id)).sort((a, b) => Number(b.prioritaire) - Number(a.prioritaire) || b.poids - a.poids);
  for (const p of ordre) {
    const l = largeurEtiquette(p.nom, p.montant);
    const h = HAUTEUR_ETIQUETTE;
    const candidats: Etiquette[] = [
      { id: p.id, cote: 'droite', x: p.x + p.r + 6, y: p.y - h / 2, largeur: l, hauteur: h },
      { id: p.id, cote: 'gauche', x: p.x - p.r - 6 - l, y: p.y - h / 2, largeur: l, hauteur: h },
      { id: p.id, cote: 'dessus', x: p.x - l / 2, y: p.y - p.r - 4 - h, largeur: l, hauteur: h },
      { id: p.id, cote: 'dessous', x: p.x - l / 2, y: p.y + p.r + 4, largeur: l, hauteur: h },
    ];
    const bon = candidats.find((e) => {
      if (e.x < INTERIEUR.x || e.y < INTERIEUR.y || e.x + e.largeur > INTERIEUR.x + INTERIEUR.largeur || e.y + e.hauteur > INTERIEUR.y + INTERIEUR.hauteur) return false;
      if (reservees.some((z) => seCoupent(e, z))) return false;
      if (points.some((q) => coupeCercle(e, q))) return false;
      for (const autre of posees.values()) if (seCoupent(e, autre)) return false;
      return true;
    });
    if (bon) posees.set(p.id, bon);
  }
  return posees;
}

/** Le quadrant prioritaire dans le tracé : à droite de `interetMin`, au-dessus de `montantMinCents`. */
export function rectangleQuadrant(interetMin: number, montantMinCents: number, plafondCents: number): Rect {
  const x = positionX(interetMin);
  const y = INTERIEUR.y;
  return { x, y, largeur: INTERIEUR.x + INTERIEUR.largeur - x, hauteur: positionY(montantMinCents, plafondCents) - y };
}

/** Les graduations de l'axe des montants : tous les 2 500 € jusqu'au plafond. */
export function graduationsMontant(plafondCents: number): number[] {
  const pas = 250_000;
  return Array.from({ length: Math.floor(plafondCents / pas) + 1 }, (_, i) => i * pas);
}

const LARGEUR_LEGENDE = 190;
const HAUTEUR_LEGENDE = 42;

/** Les zones des légendes de quadrant : une étiquette n'y entre pas. */
export function zonesDesLegendes(quadrant: Rect): Rect[] {
  const bas = INTERIEUR.y + INTERIEUR.hauteur;
  const droite = INTERIEUR.x + INTERIEUR.largeur;
  return [
    { x: INTERIEUR.x, y: INTERIEUR.y, largeur: LARGEUR_LEGENDE, hauteur: HAUTEUR_LEGENDE },
    { x: INTERIEUR.x, y: bas - HAUTEUR_LEGENDE, largeur: LARGEUR_LEGENDE, hauteur: HAUTEUR_LEGENDE },
    { x: droite - LARGEUR_LEGENDE, y: bas - HAUTEUR_LEGENDE, largeur: LARGEUR_LEGENDE, hauteur: HAUTEUR_LEGENDE },
    { x: quadrant.x, y: quadrant.y, largeur: quadrant.largeur, hauteur: HAUTEUR_LEGENDE - 6 },
  ];
}

/**
 * LOT-02 · MC01 — la géométrie de l'entonnoir (logique pure, aucune mesure du navigateur).
 *
 * Zone graphique de 1070 × 300 : la bande va de x = 0 à x = 735 (demi-hauteur 146 à gauche, 60 à la sortie, courbe de
 * Bézier), trois étapes de 245 px, la boîte « Signé ce mois » de 290 × 280 collée à droite (x = 780). Les pastilles se
 * posent dans la bande de leur étape, les plus anciennes à gauche, sans que deux pastilles (ni deux libellés) se chevauchent,
 * et sans toucher les pastilles de taux de passage (68 × 24, centrées sur l'axe à x = 245, 490 et 751).
 */
export const ZONE = { largeur: 1070, hauteur: 300, bande: 735, etape: 245, axeY: 150, demiGauche: 146, demiSortie: 60, sortieX: 780, sortieLargeur: 290, sortieHauteur: 280 } as const;
export const PASTILLES_TAUX_X = [245, 490, 751] as const;
const TAUX = { largeur: 68, hauteur: 24 } as const;

/** La demi-hauteur de la bande en x (0 à 735) : une courbe douce de 146 à 60 (Bézier cubique, tangentes horizontales). */
export function demiHauteur(x: number): number {
  const t = Math.max(0, Math.min(1, x / ZONE.bande));
  const s = t * t * (3 - 2 * t);
  return ZONE.demiGauche + (ZONE.demiSortie - ZONE.demiGauche) * s;
}

/** Le tracé de la bande : le haut, le bas, fermé. */
export function cheminBande(): string {
  const haut = Array.from({ length: 37 }, (_, i) => { const x = (i * ZONE.bande) / 36; return `${x.toFixed(1)} ${(ZONE.axeY - demiHauteur(x)).toFixed(1)}`; });
  const bas = Array.from({ length: 37 }, (_, i) => { const x = ZONE.bande - (i * ZONE.bande) / 36; return `${x.toFixed(1)} ${(ZONE.axeY + demiHauteur(x)).toFixed(1)}`; });
  return `M ${haut.join(' L ')} L ${bas.join(' L ')} Z`;
}

export interface Rond { id: string; rayon: number; /** Largeur approximative du libellé (px). */ libelle: number }
export interface Posee { id: string; x: number; y: number; rayon: number }

const MARGE = 6;
const HAUTEUR_LIBELLE = 30;

/** Une boîte (libellé sous la pastille, pastille de taux) contre un rond. */
const rectCoupeRond = (r: { x: number; y: number; l: number; h: number }, c: { x: number; y: number; r: number }): boolean => {
  const px = Math.max(r.x, Math.min(c.x, r.x + r.l));
  const py = Math.max(r.y, Math.min(c.y, r.y + r.h));
  return (px - c.x) ** 2 + (py - c.y) ** 2 < (c.r + MARGE) ** 2;
};
const rectsSeCoupent = (a: { x: number; y: number; l: number; h: number }, b: { x: number; y: number; l: number; h: number }): boolean => a.x < b.x + b.l + MARGE && b.x < a.x + a.l + MARGE && a.y < b.y + b.h + MARGE && b.y < a.y + a.h + MARGE;

/**
 * Pose les pastilles d'UNE étape (`indexEtape` 0 à 2) : d'abord sur une ligne régulière, en quinconce de part et d'autre
 * de l'axe, puis en cherchant la place libre la plus proche (anneaux croissants) quand ça se touche. Une pastille ne
 * sort jamais de la bande ni de son étape ; l'ordre est celui reçu (les plus anciennes d'abord, donc à gauche).
 */
export function placerEtape(ronds: readonly Rond[], indexEtape: number): Posee[] {
  const x0 = indexEtape * ZONE.etape;
  const x1 = x0 + ZONE.etape;
  const posees: Posee[] = [];
  const n = ronds.length;
  const taux = PASTILLES_TAUX_X.map((x) => ({ x: x - TAUX.largeur / 2, y: ZONE.axeY - TAUX.hauteur / 2, l: TAUX.largeur, h: TAUX.hauteur }));
  const libelleDe = (p: { x: number; y: number; rayon: number }, l: number) => ({ x: p.x - l / 2, y: p.y + p.rayon + 2, l, h: HAUTEUR_LIBELLE });
  const dedans = (x: number, y: number, r: number): boolean => {
    if (x - r < x0 + 6 || x + r > x1 - 6) return false;
    const demi = demiHauteur(x + r);
    return y - r >= ZONE.axeY - demi + 4 && y + r + HAUTEUR_LIBELLE <= ZONE.axeY + demi - 4;
  };
  const libre = (x: number, y: number, rond: Rond, mode: 0 | 1 | 2): boolean => {
    if (!dedans(x, y, rond.rayon)) return false;
    const c = { x, y, rayon: rond.rayon };
    const lib = libelleDe(c, rond.libelle);
    for (const t of taux) if (rectCoupeRond(t, { x, y, r: rond.rayon }) || (mode < 2 && rectsSeCoupent(t, lib))) return false;
    for (const q of posees) {
      const r2 = ronds.find((z) => z.id === q.id) as Rond;
      if ((q.x - x) ** 2 + (q.y - y) ** 2 < (q.rayon + rond.rayon + MARGE) ** 2) return false;
      if (mode === 0 && (rectCoupeRond(libelleDe(q, r2.libelle), { x, y, r: rond.rayon }) || rectCoupeRond(lib, { x: q.x, y: q.y, r: q.rayon }))) return false;
      if (mode < 2 && rectsSeCoupent(lib, libelleDe(q, r2.libelle))) return false;
    }
    return true;
  };
  ronds.forEach((rond, i) => {
    const px = x0 + ((i + 0.5) / Math.max(1, n)) * ZONE.etape;
    const py = ZONE.axeY + (i % 2 === 0 ? -1 : 1) * Math.min(60, 24 + 14 * (i % 3));
    let choisi: { x: number; y: number } | null = null;
    // Trois passes : rien ne se touche ; puis les libellés se frôlent seulement ; puis seules les pastilles restent distinctes.
    for (const mode of [0, 1, 2] as const) {
      for (let anneau = 0; anneau <= 200 && !choisi; anneau += 6) {
        const pas = anneau === 0 ? 1 : Math.max(8, Math.round((2 * Math.PI * anneau) / 6));
        for (let k = 0; k < pas && !choisi; k += 1) {
          const a = (k / pas) * 2 * Math.PI;
          const x = Math.round(px + anneau * Math.cos(a) * 1.4);
          const y = Math.round(py + anneau * Math.sin(a));
          if (libre(x, y, rond, mode)) choisi = { x, y };
        }
      }
      if (choisi) break;
    }
    // Faute de place (étape surchargée) : sur la ligne, sans éviter : la vue regroupe alors les plus petites.
    posees.push({ id: rond.id, x: choisi?.x ?? Math.round(px), y: choisi?.y ?? Math.round(py), rayon: rond.rayon });
  });
  return posees;
}

/** Un nom de pastille tient sur une ligne : 16 caractères, puis une ellipse (le nom entier reste dans la bulle). */
export const nomCourt = (nom: string): string => (nom.length > 16 ? `${nom.slice(0, 15).trimEnd()}…` : nom);

/** La largeur d'un libellé de 12 px (nom court ou montant) : 6,3 px par caractère. */
export const largeurLibelle = (nom: string, montant: string): number => Math.ceil(Math.max(nomCourt(nom).length * 6.3, montant.length * 6.6));

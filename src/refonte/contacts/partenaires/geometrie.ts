/**
 * LOT-02 · MC05 — la géométrie de la carte du réseau (logique pure, aucune mesure du navigateur).
 *
 * Zone graphique de 732 × 520 : AMN au centre bas (366, 470), trois orbites en demi-ellipses ouvertes vers le haut
 * (« chaque semaine » rx 150 / ry 182 ; « chaque mois » 270 / 306 ; « plus rarement » 352 / 412). Chaque partenaire est un disque
 * de 40 px posé sur son orbite à un angle choisi pour qu'aucun lien (du centre au disque) ne passe près d'un autre disque et
 * qu'aucun libellé ne couvre un autre libellé.
 */
export const CENTRE = { x: 366, y: 470 } as const;
export const ZONE = { largeur: 732, hauteur: 520 } as const;
export const ORBITES = { semaine: { rx: 150, ry: 182 }, mois: { rx: 270, ry: 306 }, rare: { rx: 352, ry: 412 } } as const;
export const RAYON_DISQUE = 20;
export const DEGAGEMENT = 26;
const HAUTEUR_LIBELLE = 34;

export interface Point { x: number; y: number }
export interface Pose { id: string; orbite: keyof typeof ORBITES; angle: number; x: number; y: number; /** Le libellé au-dessus du disque (défaut) ou en dessous quand le haut est pris. */ cote: 'haut' | 'bas' }


/** Le point de l'orbite à l'angle `theta` (en degrés : 0 à droite, 90 en haut, 180 à gauche). */
export function surOrbite(orbite: keyof typeof ORBITES, theta: number): Point {
  const o = ORBITES[orbite];
  const t = (theta * Math.PI) / 180;
  return { x: CENTRE.x + o.rx * Math.cos(t), y: CENTRE.y - o.ry * Math.sin(t) };
}

/** Distance d'un point au segment [a, b]. */
export function distanceAuSegment(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const l2 = dx * dx + dy * dy;
  const t = l2 === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

/** Le point de contrôle de la courbe quadratique du centre au partenaire : un léger arrondi, côté haut. */
export function controle(p: Point): Point {
  const mx = (CENTRE.x + p.x) / 2;
  const my = (CENTRE.y + p.y) / 2;
  const dx = p.x - CENTRE.x;
  return { x: mx - dx * 0.06, y: my - 10 };
}

/** Le chemin du lien, du centre au partenaire. */
export const cheminLien = (p: Point): string => {
  const c = controle(p);
  return `M ${CENTRE.x} ${CENTRE.y - 28} Q ${c.x.toFixed(1)} ${c.y.toFixed(1)} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
};

interface Candidat { id: string; orbite: keyof typeof ORBITES; largeurLibelle: number }

interface Boite { x: number; y: number; l: number; h: number }
const seTouchent = (a: Boite, b: Boite): boolean => a.x < b.x + b.l + 6 && b.x < a.x + a.l + 6 && a.y < b.y + b.h + 4 && b.y < a.y + a.h + 4;
const boiteDuLibelle = (p: Point, l: number, cote: 'haut' | 'bas'): Boite => ({ x: p.x - l / 2, y: cote === 'haut' ? p.y - RAYON_DISQUE - HAUTEUR_LIBELLE - 2 : p.y + RAYON_DISQUE + 2, l, h: HAUTEUR_LIBELLE });
const boiteDuDisque = (p: Point): Boite => ({ x: p.x - RAYON_DISQUE, y: p.y - RAYON_DISQUE, l: 2 * RAYON_DISQUE, h: 2 * RAYON_DISQUE });
const DEPART = { x: CENTRE.x, y: CENTRE.y - 28 } as const;

/**
 * Pose les partenaires : sur chaque orbite, des angles répartis entre 22° et 158°, décalés d'une orbite à l'autre ; puis, pour
 * chaque partenaire, on cherche autour de son angle (±5°, ±10°…) et, pour chaque angle, le libellé au-dessus puis en dessous,
 * le premier qui ne frôle ni un autre disque (par son lien ou par son libellé) ni un autre libellé. Sans place, on garde l'angle
 * d'origine (le partenaire reste dessiné, le libellé peut en toucher un autre : la vue le dit par une info-bulle).
 */
export function placer(candidats: readonly Candidat[]): Pose[] {
  const poses: Pose[] = [];
  const decalage: Record<keyof typeof ORBITES, number> = { semaine: 0, mois: 0.5, rare: 0.25 };
  const largeurDe = (id: string) => candidats.find((z) => z.id === id)?.largeurLibelle ?? 100;
  (Object.keys(ORBITES) as (keyof typeof ORBITES)[]).forEach((orbite) => {
    const ici = candidats.filter((c) => c.orbite === orbite);
    const n = ici.length;
    ici.forEach((c, i) => {
      const pas = n <= 1 ? 0 : 136 / Math.max(1, n - 1);
      const base = n <= 1 ? 90 + (decalage[orbite] - 0.25) * 40 : 22 + i * pas;
      for (let essai = 0; essai < 70; essai += 1) {
        const angle = Math.min(158, Math.max(22, base + (essai === 0 ? 0 : (essai % 2 === 1 ? 1 : -1) * Math.ceil(essai / 2) * 4)));
        const p = surOrbite(orbite, angle);
        const lienFrole = poses.some((q) => distanceAuSegment(q, DEPART, p) < DEGAGEMENT || distanceAuSegment(p, DEPART, q) < DEGAGEMENT);
        if (lienFrole) continue;
        for (const cote of ['haut', 'bas'] as const) {
          const libelle = boiteDuLibelle(p, c.largeurLibelle, cote);
          const gene = poses.some((q) => seTouchent(libelle, boiteDuLibelle(q, largeurDe(q.id), q.cote)) || seTouchent(libelle, boiteDuDisque(q)) || seTouchent(boiteDuLibelle(q, largeurDe(q.id), q.cote), boiteDuDisque(p)));
          if (!gene && libelle.x >= -10 && libelle.x + libelle.l <= ZONE.largeur + 10 && libelle.y >= -4) { poses.push({ id: c.id, orbite, angle, x: p.x, y: p.y, cote }); return; }
        }
      }
      const p = surOrbite(orbite, base);
      poses.push({ id: c.id, orbite, angle: base, x: p.x, y: p.y, cote: 'haut' });
    });
  });
  return poses;
}

/** La largeur d'un libellé : le plus long des deux textes, 6,4 px par caractère, plus la marge. */
export const largeurDuLibelle = (nom: string, ligne2: string): number => Math.ceil(Math.max(nom.length * 6.6, ligne2.length * 6.1)) + 20;

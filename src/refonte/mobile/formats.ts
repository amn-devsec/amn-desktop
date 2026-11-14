/**
 * LES FORMATS D'ÉCRAN — logique pure de LOT-09 (Mobile et tablette), STATUT § 1.4.
 *
 * Un seul code, trois formats : téléphone, tablette, bureau. Ce fichier ne dessine rien et n'importe rien : il dit
 * dans quel format on est, quelle navigation y répond, si la liste et le détail vont côte à côte ou l'un après
 * l'autre, et ce que devient l'état quand on tourne l'appareil (T01 §11 : « la rotation garde l'état, sans
 * rechargement »). Les écrans et le socle le liront ; aucun ne duplique un seuil.
 *
 * Les seuils suivent les fiches v4, qui font foi (décision provisoire du CO, révisable par Harun) : téléphone < 600,
 * tablette 600 à 1199, bureau ≥ 1200. T01 §11 y ajoute deux ruptures INTERNES à la tablette (800 et 1100), voir
 * `accueilTablette`. Le bureau à 1200 est le seuil du STATUT § 1.4, que les fiches ne contredisent pas. Une seule
 * constante, `SEUILS`, ou le paramètre `seuils` de chaque fonction, pour les ajuster.
 */

export type Format = 'telephone' | 'tablette' | 'bureau';

export interface Seuils {
  /** Largeur (px CSS) à partir de laquelle on est en tablette. */
  tablette: number;
  /** Largeur (px CSS) à partir de laquelle on est au bureau. */
  bureau: number;
}

export const SEUILS: Seuils = { tablette: 600, bureau: 1200 };

/** Le format d'une largeur de fenêtre. Une largeur absurde (NaN, négative) tombe au téléphone : le plus sobre. */
export function formatDe(largeur: number, seuils: Seuils = SEUILS): Format {
  if (!Number.isFinite(largeur) || largeur < seuils.tablette) return 'telephone';
  return largeur < seuils.bureau ? 'tablette' : 'bureau';
}

/**
 * Les requêtes `matchMedia` de chaque format, sans trou ni recouvrement (le `.98` évite le pixel fractionnaire
 * partagé). À brancher dans `useEtroit` ou son successeur : le même texte pour le CSS et pour le code.
 */
export function requetes(seuils: Seuils = SEUILS): Record<Format, string> {
  return {
    telephone: `(max-width: ${seuils.tablette - 0.02}px)`,
    tablette: `(min-width: ${seuils.tablette}px) and (max-width: ${seuils.bureau - 0.02}px)`,
    bureau: `(min-width: ${seuils.bureau}px)`,
  };
}

/**
 * La navigation du format : barre basse de 70 px au téléphone (Accueil, Tâches, Argent, Messages, Plus) ; rail de
 * 76 px en tablette ; la coquille v4 (barre latérale) au bureau.
 */
export type Navigation = 'barre-basse' | 'rail' | 'coquille';

export const NAVIGATION: Record<Format, Navigation> = { telephone: 'barre-basse', tablette: 'rail', bureau: 'coquille' };

export const HAUTEUR_BARRE_BASSE = 70;
export const LARGEUR_RAIL = 76;
/** Le bouton d'action flottant du téléphone (T01/H46) : 52 px. */
export const TAILLE_BOUTON_FLOTTANT = 52;
/** Les cinq places de la barre basse, dans l'ordre des maquettes. « Plus » ouvre le tiroir (`PanneauMobile`). */
export const BARRE_BASSE = ['accueil', 'taches', 'argent', 'messages', 'plus'] as const;
export type PlaceBarreBasse = (typeof BARRE_BASSE)[number];

/**
 * La taille minimale d'une zone qui se touche. 36 px au bureau (STATUT § 1.41, souris) ; 42 px au téléphone et en
 * tablette (STATUT § 1.4 : « cibles tactiles ≥ 42 px »). Les images MB04 et MB05 montrent 32 à 34 px : on construit
 * à 42 quand même, l'image ne fait pas la règle d'une zone qu'un pouce doit atteindre.
 */
export function cibleMinimale(format: Format): number {
  return format === 'bureau' ? 36 : 42;
}

/** Une zone tient-elle la taille de son format ? Pour les mesures de T1 comme pour les gardes. */
export function cibleTient(largeur: number, hauteur: number, format: Format): boolean {
  const min = cibleMinimale(format);
  return largeur >= min && hauteur >= min;
}

/**
 * Liste et détail (H05 + G04 → T02, boîte G07, calendrier…) :
 *  - `pile` : la liste d'abord, le détail en plein écran par-dessus, un retour pour revenir (téléphone) ;
 *  - `scinde` : les deux côte à côte (tablette et bureau).
 * `detailOuvert` n'a de sens qu'en `pile`.
 */
export type Presentation = 'pile' | 'scinde';

export const presentationListeDetail = (format: Format): Presentation => (format === 'telephone' ? 'pile' : 'scinde');

export interface EtatListeDetail {
  /** L'élément choisi, s'il y en a un. */
  selection: string | null;
  /** En `pile` : le détail est-il à l'écran ? */
  detailOuvert: boolean;
}

/**
 * Ce que le format montre de l'état. L'état ne change PAS quand on tourne l'appareil (T01 §11, « la rotation garde
 * l'état, sans rechargement ») : seule la lecture change.
 *  - en `scinde` : le volet de détail affiche la sélection, ou son état vide s'il n'y en a pas ;
 *  - en `pile` : le détail n'est à l'écran que si la sélection existe ET qu'elle a été ouverte ; sinon la liste.
 * Aller-retour tablette → téléphone → tablette : la sélection est la même, et un détail refermé reste refermé.
 */
export function detailVisible(etat: EtatListeDetail, format: Format): boolean {
  if (presentationListeDetail(format) === 'scinde') return true;
  return etat.selection !== null && etat.detailOuvert;
}

/** Le retour du détail plein écran (téléphone) : revient à la liste, la sélection reste surlignée. */
export function retourALaListe(etat: EtatListeDetail): EtatListeDetail {
  return { selection: etat.selection, detailOuvert: false };
}

/** Ouvrir un élément : au téléphone le détail prend l'écran ; ailleurs il remplit son volet. */
export function ouvrirElement(etat: EtatListeDetail, id: string): EtatListeDetail {
  return { ...etat, selection: id, detailOuvert: true };
}

/**
 * L'accueil de la tablette (T01 §11) : le nombre de volets et de KPI par largeur. Les paliers de T01 (1100, 800, 600)
 * sont les ruptures internes de la tablette : 600 est aussi le seuil téléphone/tablette de `SEUILS`, 800 et 1100 sont
 * propres à l'accueil. Ils sont gardés ici tels que la fiche les écrit (note de préparation, § 7, point 1).
 */
export interface AccueilTablette {
  /** Volets de contenu : 3 (liste, détail, fil), 2, ou 1 (colonne unique). */
  volets: 1 | 2 | 3;
  /** KPI par rangée : 4, ou 2 (2 × 2). */
  kpiParRangee: 2 | 4;
  /** Le troisième volet passe sous les deux autres. */
  voletCEnDessous: boolean;
  /** Le rail de 76 px est affiché. Faux sous 600 px : la barre basse prend le relais. */
  rail: boolean;
}

export const PALIERS_T01 = { large: 1100, moyen: 800, etroit: 600 } as const;

export function accueilTablette(largeur: number): AccueilTablette {
  if (!Number.isFinite(largeur) || largeur < PALIERS_T01.etroit) return { volets: 1, kpiParRangee: 2, voletCEnDessous: false, rail: false };
  if (largeur < PALIERS_T01.moyen) return { volets: 1, kpiParRangee: 2, voletCEnDessous: false, rail: true };
  if (largeur < PALIERS_T01.large) return { volets: 2, kpiParRangee: 2, voletCEnDessous: true, rail: true };
  return { volets: 3, kpiParRangee: 4, voletCEnDessous: false, rail: true };
}

/**
 * Ce qu'une PWA ne fait pas encore (STATUT § 1.4) : l'interface le dit, elle ne fait pas semblant.
 *  - `widgets` : pas de widget d'écran d'accueil (MB09 : hors première passe) ;
 *  - `empreinte` : pas de biométrie native ; l'écran de déverrouillage de MB09 ne s'allume que si l'appareil en
 *    offre une par WebAuthn ;
 *  - `apercuNotification` : l'aperçu d'une notification est MASQUÉ par défaut (MB09, MB04).
 */
export const LIMITES_PWA = { widgets: false, apercuNotificationParDefaut: false } as const;

/** La caméra du scan de reçu (MB07) et le micro de la dictée (MB05) passent par le navigateur : ils se demandent, ne se supposent pas. */
export interface CapacitesAppareil {
  camera: boolean;
  micro: boolean;
  biometrie: boolean;
  notifications: boolean;
}

export type Repli = 'ok' | 'import-de-fichier' | 'saisie-au-clavier' | 'code-seul' | 'sans-notification';

/** Le repli de chaque fonction quand l'appareil ne la donne pas : jamais un bouton mort. */
export function repliDe(fonction: keyof CapacitesAppareil, c: CapacitesAppareil): Repli {
  if (c[fonction]) return 'ok';
  switch (fonction) {
    case 'camera':
      return 'import-de-fichier';
    case 'micro':
      return 'saisie-au-clavier';
    case 'biometrie':
      return 'code-seul';
    case 'notifications':
      return 'sans-notification';
  }
}

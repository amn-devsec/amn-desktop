import { ms, partiesParis, MS_HEURE, type Instant } from './commun';

/**
 * ANNONCES (H14) — « À la une », accusés de lecture, réactions, mosaïque, « presque à jour ». Logique pure.
 *
 * Ouvrir n'est pas confirmer. Une réaction (« Bien noté ») ne vaut pas confirmation de lecture. Le jaune ambre dit
 * « à lire », jamais « urgent ». Aucun classement des lecteurs, aucun compte à rebours, aucun point retiré.
 */

export interface AnnonceMin {
  id: string;
  auteurEmail: string;
  publieeAt: Instant;
  titre: string;
  texte: string;
  categorie: string;
  epinglee: boolean;
  /** Les destinataires actifs ; absent = toute l'équipe active (`equipe`). */
  destinataires?: readonly string[];
  /** `at` absent : le poste sait que la personne a confirmé, pas à quelle heure. */
  confirmations: readonly { email: string; at?: Instant }[];
  reactions?: readonly { email: string; type: TypeDeReaction }[];
  /** « Nouveauté d'AMN Business » n'est pas une annonce de l'équipe : ni catégorie, ni « 5/6 ». */
  nouveauteDuProduit?: boolean;
}

const delEquipe = (a: AnnonceMin): AnnonceMin => a;

export const REACTIONS = ['bien-note', 'merci', 'question'] as const;
export type TypeDeReaction = (typeof REACTIONS)[number];

/** Les annonces de l'équipe : sans « Nouveauté d'AMN Business ». */
export const annoncesDeLEquipe = (annonces: readonly AnnonceMin[]): AnnonceMin[] => annonces.filter((a) => !a.nouveauteDuProduit).map(delEquipe);

const plusRecentes = (a: AnnonceMin, b: AnnonceMin) => ms(b.publieeAt) - ms(a.publieeAt) || a.id.localeCompare(b.id);

/**
 * « À la une » = l'annonce épinglée la plus récente (une seule). Les autres épinglées passent en tête de mosaïque
 * avec une épingle (Proposition). Aucune épinglée : la plus récente prend la largeur de « À la une » sans bordure ambre.
 */
export function composerLeTableau(annonces: readonly AnnonceMin[]): { aLaUne: AnnonceMin | null; sansBordureAmbre: boolean; mosaique: AnnonceMin[] } {
  const vraies = annoncesDeLEquipe(annonces).sort(plusRecentes);
  const epinglees = vraies.filter((a) => a.epinglee);
  if (epinglees.length) {
    const une = epinglees[0];
    return { aLaUne: une, sansBordureAmbre: false, mosaique: [...epinglees.slice(1), ...vraies.filter((a) => !a.epinglee)] };
  }
  return { aLaUne: vraies[0] ?? null, sansBordureAmbre: true, mosaique: vraies.slice(1) };
}

/* ------------------------------ Lecture ------------------------------ */

export interface LuPar {
  /** x : confirmations, l'auteur compté d'office. */
  lus: number;
  /** y : membres actifs destinataires. */
  sur: number;
  complet: boolean;
}

/** « Lu par x sur y » : barre verte quand x = y. L'auteur est compté d'office, une seule fois, s'il est destinataire. */
export function luPar(a: AnnonceMin, equipeActive: readonly string[]): LuPar {
  const destinataires = a.destinataires ?? equipeActive;
  const confirmes = new Set(a.confirmations.map((c) => c.email));
  confirmes.add(a.auteurEmail);
  const lus = destinataires.filter((d) => confirmes.has(d)).length;
  return { lus, sur: destinataires.length, complet: destinataires.length > 0 && lus === destinataires.length };
}

export interface Accuse {
  email: string;
  lu: boolean;
  at: number | null;
}

/** Un accusé par destinataire. La confirmation de l'auteur est d'office (sans heure). */
export function accuses(a: AnnonceMin, equipeActive: readonly string[]): Accuse[] {
  const destinataires = a.destinataires ?? equipeActive;
  return destinataires.map((email) => {
    const c = a.confirmations.find((x) => x.email === email);
    return { email, lu: !!c || email === a.auteurEmail, at: c?.at !== undefined ? ms(c.at) : null };
  });
}

/** « J'ai lu » n'existe que pour un destinataire qui n'a pas confirmé et n'est pas l'auteur. */
export const peutConfirmer = (a: AnnonceMin, email: string, equipeActive: readonly string[]): boolean =>
  (a.destinataires ?? equipeActive).includes(email) && email !== a.auteurEmail && !a.confirmations.some((c) => c.email === email);

/** Une réaction par type et par personne ; elle ne vaut pas confirmation. « Question » ouvre aussi une réponse. */
export function reagir(reactions: readonly { email: string; type: TypeDeReaction }[], email: string, type: TypeDeReaction): { email: string; type: TypeDeReaction }[] {
  if (!(REACTIONS as readonly string[]).includes(type)) throw new Error(`réaction inconnue : ${String(type)}`);
  return reactions.some((r) => r.email === email && r.type === type) ? reactions.filter((r) => !(r.email === email && r.type === type)) : [...reactions, { email, type }];
}
export const ouvreUneReponse = (type: TypeDeReaction): boolean => type === 'question';

export interface PresqueAJour {
  /** « 5/6 » : confirmées par la personne / destinées à la personne (hors les siennes). */
  faites: number;
  sur: number;
  etat: 'a-jour' | 'presque' | 'a-confirmer';
  restantes: number;
}

export function presqueAJour(annonces: readonly AnnonceMin[], moi: string, equipeActive: readonly string[]): PresqueAJour {
  const miennes = annoncesDeLEquipe(annonces).filter((a) => (a.destinataires ?? equipeActive).includes(moi) && a.auteurEmail !== moi);
  const faites = miennes.filter((a) => a.confirmations.some((c) => c.email === moi)).length;
  const restantes = miennes.length - faites;
  return { faites, sur: miennes.length, restantes, etat: restantes === 0 ? 'a-jour' : restantes === 1 ? 'presque' : 'a-confirmer' };
}

/** Le compteur de la barre latérale = annonces à confirmer par la personne. */
export const aConfirmer = (annonces: readonly AnnonceMin[], moi: string, equipeActive: readonly string[]): number => presqueAJour(annonces, moi, equipeActive).restantes;

/** Catégories : nombre d'annonces (toutes dates) ; la barre = nombre / le plus grand. */
export function categories(annonces: readonly AnnonceMin[]): { categorie: string; n: number; barre: number }[] {
  const c = new Map<string, number>();
  for (const a of annoncesDeLEquipe(annonces)) c.set(a.categorie, (c.get(a.categorie) ?? 0) + 1);
  const max = Math.max(1, ...c.values());
  return [...c].sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0])).map(([categorie, n]) => ({ categorie, n, barre: n / max }));
}

/* ------------------------------ Mosaïque ------------------------------ */

export const ECART_DE_MOSAIQUE = 14;

export interface CarteMosaique {
  id: string;
  hauteur: number;
}
export interface Placement {
  id: string;
  colonne: number;
  y: number;
}

/**
 * Rangement « maçonnerie » : la plus récente en haut à gauche, puis chaque carte dans la colonne la moins haute
 * (à égalité, la plus à gauche). Le brouillon (`reserve`) prend d'abord la place libre la plus haute de la colonne demandée.
 * Les hauteurs varient avec le contenu : on ne force jamais des cartes égales.
 */
export function maconnerie(cartes: readonly CarteMosaique[], colonnes = 3, reserve?: CarteMosaique & { colonne: number }): { placements: Placement[]; hauteurs: number[] } {
  const hauteurs = Array<number>(colonnes).fill(0);
  const placements: Placement[] = [];
  const poser = (c: CarteMosaique, col: number) => {
    placements.push({ id: c.id, colonne: col, y: hauteurs[col] });
    hauteurs[col] += c.hauteur + ECART_DE_MOSAIQUE;
  };
  if (reserve) poser(reserve, Math.min(colonnes - 1, Math.max(0, reserve.colonne)));
  for (const c of cartes) poser(c, hauteurs.indexOf(Math.min(...hauteurs)));
  return { placements, hauteurs };
}

/* ------------------------------ Suggestion d'Ajmani ------------------------------ */

/** Une heure du jour dans un texte : « à 14 h », « 14:30 », « 9h15 ». `null` sans heure. */
export function heureDansLeTexte(texte: string): number | null {
  const m = /\b([01]?\d|2[0-3])\s?(?:h|:)\s?([0-5]\d)?\b/i.exec(texte);
  return m ? Number(m[1]) * 60 + (m[2] ? Number(m[2]) : 0) : null;
}

export const RAPPEL_AVANT_MS = 2 * MS_HEURE;

/**
 * Rappel avant un événement annoncé : annonce épinglée portant une heure du jour, non confirmée par au moins un
 * membre, 2 h avant l'heure (Proposition). Rien n'est envoyé sans « Programmer ».
 */
export function rappelAProposer(a: AnnonceMin, equipeActive: readonly string[], maintenant: Instant, avantMs: number = RAPPEL_AVANT_MS): { heureMin: number; nonConfirmes: number } | null {
  if (!a.epinglee) return null;
  const heure = heureDansLeTexte(`${a.titre} ${a.texte}`);
  if (heure === null) return null;
  const p = partiesParis(maintenant);
  const reste = (heure - p.minutes) * 60_000;
  if (reste <= 0 || reste > avantMs) return null;
  const nonConfirmes = luPar(a, equipeActive).sur - luPar(a, equipeActive).lus;
  return nonConfirmes > 0 ? { heureMin: heure, nonConfirmes } : null;
}

/* ------------------------------ La barre de lecture ------------------------------ */

export const SEGMENTS_DE_LECTURE = 3;
/**
 * La barre de lecture d'une note : trois segments, verts quand tous ont lu (H14 §5). Un segment par tiers de l'équipe,
 * arrondi ; personne n'a lu : aucun ; quelqu'un a lu mais pas tous : au moins un et jamais les trois.
 */
export function segmentsDeLecture(lus: number, sur: number): { pleins: number; vert: boolean } {
  if (sur <= 0 || lus <= 0) return { pleins: 0, vert: false };
  if (lus >= sur) return { pleins: SEGMENTS_DE_LECTURE, vert: true };
  return { pleins: Math.min(SEGMENTS_DE_LECTURE - 1, Math.max(1, Math.round((SEGMENTS_DE_LECTURE * lus) / sur))), vert: false };
}

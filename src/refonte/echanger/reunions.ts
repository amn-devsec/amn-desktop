import { ms, minutesEcoulees, plafonner, pourcent, type Instant } from './commun';

/**
 * RÉUNIONS (MX02) — la salle de réunion : en cours, ordre du jour minuté, notes en direct, prochaine, préparation. Logique pure.
 *
 * L'enregistrement n'est jamais lancé sans l'accord de chaque participant ; caméra et micro sont coupés à l'arrivée.
 * Le niveau de parole d'un participant n'est affiché que pendant la réunion et JAMAIS enregistré : aucune fonction
 * d'ici ne le garde. Pas de mesure du temps de parole, pas de classement de préparation, pas de minuteur rouge.
 */

export interface SujetDeReunion {
  titre: string;
  minutes: number;
  prepare?: boolean;
  /** Marqué en cours par l'animateur. */
  enCours?: boolean;
}

export interface ReunionMin {
  id: string;
  titre: string;
  debutPrevuAt: Instant;
  dureePrevueMin: number;
  /** Début réel, quand la salle s'est ouverte. */
  debutReelAt?: Instant | null;
  finReelleAt?: Instant | null;
  participants: readonly string[];
  ordreDuJour: readonly SujetDeReunion[];
  documents?: { attendus: number; joints: number };
  /** Cases de préparation (« Avant 11:00 »). */
  casesDePreparation?: readonly { libelle: string; fait: boolean }[];
}

export const enCours = (r: ReunionMin, maintenant: Instant): boolean => !!r.debutReelAt && ms(r.debutReelAt) <= ms(maintenant) && (!r.finReelleAt || ms(r.finReelleAt) > ms(maintenant));

/** « depuis N min » = maintenant − début réel. */
export const depuisMinutes = (r: ReunionMin, maintenant: Instant): number | null => (enCours(r, maintenant) ? minutesEcoulees(r.debutReelAt as Instant, maintenant) : null);

export interface SujetMinute {
  titre: string;
  minutes: number;
  /** Fait, en cours, à venir. */
  etat: 'fait' | 'en-cours' | 'a-venir';
  /** Remplissage du sujet en cours : minutes écoulées dans le sujet ÷ minutes prévues (0 à 1). */
  remplissage: number;
}

/**
 * L'ordre du jour minuté. Le sujet en cours est celui que l'animateur a marqué ; si personne ne marque, le temps
 * écoulé le désigne (les sujets s'enchaînent selon leurs minutes prévues). Passé le dernier, tout est « fait ».
 */
export function ordreDuJourMinute(r: ReunionMin, maintenant: Instant): SujetMinute[] {
  if (!enCours(r, maintenant)) return r.ordreDuJour.map((s) => ({ titre: s.titre, minutes: s.minutes, etat: 'a-venir', remplissage: 0 }));
  const ecoule = minutesEcoulees(r.debutReelAt as Instant, maintenant);
  const marque = r.ordreDuJour.findIndex((s) => s.enCours);
  let courant = marque;
  let debutDuSujet = 0;
  if (courant < 0) {
    let cumul = 0;
    courant = r.ordreDuJour.findIndex((s) => {
      cumul += s.minutes;
      return ecoule < cumul;
    });
    debutDuSujet = courant < 0 ? 0 : cumul - r.ordreDuJour[courant].minutes;
  } else {
    debutDuSujet = r.ordreDuJour.slice(0, courant).reduce((s, x) => s + x.minutes, 0);
  }
  return r.ordreDuJour.map((s, i) => ({
    titre: s.titre,
    minutes: s.minutes,
    etat: courant < 0 ? 'fait' : i < courant ? 'fait' : i === courant ? 'en-cours' : 'a-venir',
    remplissage: i === courant ? plafonner((ecoule - debutDuSujet) / Math.max(1, s.minutes)) : 0,
  }));
}

/* ------------------------------ Notes, décisions, actions ------------------------------ */

export type LigneDeNotes = { genre: 'note'; texte: string } | { genre: 'decision'; texte: string } | { genre: 'action'; verbe: string; personne: string | null; echeance: string | null; texte: string; etat: 'tache-creee' | 'a-confirmer' };

/**
 * Une ligne étiquetée « Décision » devient une décision. Une action (verbe + personne + échéance) crée une tâche dans
 * Tâches (« Tâche créée »), sauf si la personne ou l'échéance manque (« À confirmer ») : rien n'est inventé.
 */
export function classerLaLigne(ligne: string, personnes: readonly string[]): LigneDeNotes {
  const brut = ligne.trim();
  if (/^d[ée]cision\s*[:.\-–]/i.test(brut)) return { genre: 'decision', texte: brut.replace(/^d[ée]cision\s*[:.\-–]\s*/i, '') };
  const m = /^action\s*[:.\-–]\s*(.+)$/i.exec(brut);
  if (!m) return { genre: 'note', texte: brut };
  const corps = m[1];
  const verbe = /^\S+/.exec(corps)?.[0].toLowerCase() ?? '';
  const personne = personnes.find((p) => new RegExp(`\\b${p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(corps)) ?? null;
  const echeance = /\b(?:avant|pour|d['’]ici)\s+([^,.;]+)/i.exec(corps)?.[1]?.trim() ?? null;
  return { genre: 'action', verbe, personne, echeance, texte: corps, etat: personne && echeance ? 'tache-creee' : 'a-confirmer' };
}

/* ------------------------------ La prochaine réunion et la préparation ------------------------------ */

export const COMPTE_A_REBOURS_MIN = 60;

/** La plus proche à venir où la personne participe ; compte à rebours en minutes sous une heure. */
export function prochaine(reunions: readonly ReunionMin[], moi: string, maintenant: Instant): { reunion: ReunionMin; dansMin: number; compteARebours: boolean } | null {
  const futures = reunions
    .filter((r) => r.participants.includes(moi) && ms(r.debutPrevuAt) > ms(maintenant) && !r.debutReelAt)
    .sort((a, b) => ms(a.debutPrevuAt) - ms(b.debutPrevuAt) || a.id.localeCompare(b.id));
  const r = futures[0];
  if (!r) return null;
  const dansMin = Math.ceil((ms(r.debutPrevuAt) - ms(maintenant)) / 60_000);
  return { reunion: r, dansMin, compteARebours: dansMin <= COMPTE_A_REBOURS_MIN };
}

export type TonDePreparation = 'vert' | 'neutre' | 'orange';

/**
 * Préparation d'une réunion à venir = (sujets préparés + documents joints + cases faites) ÷ (sujets + documents
 * attendus + cases), en %. Couleur : ≥ 70 vert, 45 à 69 neutre, < 45 orange (Proposition). Sans classement.
 */
export function preparation(r: ReunionMin): { pourcent: number; ton: TonDePreparation } {
  const cases = r.casesDePreparation ?? [];
  const docs = r.documents ?? { attendus: 0, joints: 0 };
  const fait = r.ordreDuJour.filter((s) => s.prepare).length + Math.min(docs.joints, docs.attendus) + cases.filter((c) => c.fait).length;
  const total = r.ordreDuJour.length + docs.attendus + cases.length;
  const p = pourcent(fait, total);
  return { pourcent: p, ton: p >= 70 ? 'vert' : p >= 45 ? 'neutre' : 'orange' };
}

/* ------------------------------ Suggestion d'Ajmani ------------------------------ */

export const OCCURRENCES_OBSERVEES = 3;
export const ECART_DE_DUREE_MIN = 0.3;

/**
 * « Ce point se termine toujours en 18 min… » : réunion récurrente dont la durée réelle est inférieure de 30 % ou
 * plus à la durée prévue sur ses 3 dernières occurrences. Retourne la durée moyenne réelle arrondie, ou `null`.
 */
export function suggestionDeDuree(dureePrevueMin: number, dureesReellesMin: readonly number[]): number | null {
  const dernieres = dureesReellesMin.slice(-OCCURRENCES_OBSERVEES);
  if (dernieres.length < OCCURRENCES_OBSERVEES || dureePrevueMin <= 0) return null;
  if (!dernieres.every((d) => d <= dureePrevueMin * (1 - ECART_DE_DUREE_MIN))) return null;
  return Math.round(dernieres.reduce((s, d) => s + d, 0) / dernieres.length);
}

/** Aucune prise de notes ni enregistrement sans l'accord des participants. */
export const peutPrendreDesNotes = (accords: Readonly<Record<string, boolean>>, participants: readonly string[]): boolean => participants.length > 0 && participants.every((p) => accords[p] === true);

/** Le compte rendu part dans les 10 minutes après la fin (« Compte rendu envoyé à 10:58 »). */
export const DELAI_COMPTE_RENDU_MIN = 10;
export const compteRenduAEnvoyer = (finAt: Instant, envoyeAt: Instant | null, maintenant: Instant): boolean => envoyeAt === null && ms(maintenant) - ms(finAt) >= 0 && ms(maintenant) - ms(finAt) <= DELAI_COMPTE_RENDU_MIN * 60_000;

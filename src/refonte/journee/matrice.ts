import { ajouterJours, ecartJours, jourSemaineIso, type Jour } from './commun';

/**
 * H02 · LA MATRICE DES TÂCHES — logique pure (fiche H02, rubrique 6).
 *
 * Deux axes, quatre cases : 1 Faire maintenant (urgent + important), 2 Planifier (important), 3 Déléguer (urgent),
 * 4 Alléger (ni l'un ni l'autre). Une tâche déplacée à la main garde sa case. Le tri dans une case : en retard,
 * puis échéance, puis création. L'ajout rapide comprend une date, une heure, une personne, une étiquette, « urgent »
 * et « important » ; ce qu'il ne reconnaît pas reste dans le titre.
 */

export type CaseDeMatrice = 'maintenant' | 'planifier' | 'deleguer' | 'alleger';
export const CASES: readonly CaseDeMatrice[] = ['maintenant', 'planifier', 'deleguer', 'alleger'];
/** Les touches 1 à 4 déplacent une carte sélectionnée dans la case de ce rang. */
export const CASE_DE_TOUCHE: Readonly<Record<string, CaseDeMatrice>> = { 1: 'maintenant', 2: 'planifier', 3: 'deleguer', 4: 'alleger' };

export interface TacheDeMatrice {
  id: string;
  titre: string;
  /** Jour d'échéance ; `null` : sans date. */
  echeance: Jour | null;
  /** « 17:00 » ; absent : pas d'heure. */
  heure?: string | null;
  /** Marquée urgente à la main. */
  urgente?: boolean;
  /** Marquée importante à la main, ou liée à un client, une facture ou un projet actif. */
  importante?: boolean;
  /** La personne a choisi sa case : elle ne la perd plus. */
  choix?: { urgent: boolean; important: boolean } | null;
  creeLe: string;
  faite?: boolean;
}

/** Jours ouvrés : du lundi au vendredi. */
const ouvre = (j: Jour): boolean => jourSemaineIso(j) <= 5;
/**
 * Le prochain jour ouvré : aujourd'hui s'il en est un (sa journée n'est pas finie), sinon le lundi suivant. Un vendredi, le lundi n'est donc
 * pas « urgent » de ce seul fait (l'image de la fiche range « Lun. 2 » dans « Planifier »).
 */
export function prochainJourOuvre(j: Jour): Jour {
  let n = j;
  while (!ouvre(n)) n = ajouterJours(n, 1);
  return n;
}

/** Urgent : marquée, ou échéance passée, ou échéance d'ici la fin du prochain jour ouvré (*Proposition* : réglage). */
export function estUrgente(t: Pick<TacheDeMatrice, 'urgente' | 'echeance' | 'choix'>, aujourdhui: Jour): boolean {
  if (t.choix) return t.choix.urgent;
  if (t.urgente) return true;
  return t.echeance !== null && t.echeance <= prochainJourOuvre(aujourdhui);
}
export const estImportante = (t: Pick<TacheDeMatrice, 'importante' | 'choix'>): boolean => (t.choix ? t.choix.important : t.importante === true);

export function caseDe(t: TacheDeMatrice, aujourdhui: Jour): CaseDeMatrice {
  const u = estUrgente(t, aujourdhui);
  const i = estImportante(t);
  return u && i ? 'maintenant' : i ? 'planifier' : u ? 'deleguer' : 'alleger';
}

/** Les axes de chaque case. */
export const AXES_DE_CASE: Readonly<Record<CaseDeMatrice, { urgent: boolean; important: boolean }>> = {
  maintenant: { urgent: true, important: true },
  planifier: { urgent: false, important: true },
  deleguer: { urgent: true, important: false },
  alleger: { urgent: false, important: false },
};

export const enRetard = (t: Pick<TacheDeMatrice, 'echeance' | 'faite'>, aujourdhui: Jour): boolean => !t.faite && t.echeance !== null && t.echeance < aujourdhui;

/** Dans une case : en retard d'abord, puis par échéance (sans date en dernier), puis par création, puis par identifiant. */
export function trierLaCase(taches: readonly TacheDeMatrice[], aujourdhui: Jour): TacheDeMatrice[] {
  return [...taches].sort(
    (a, b) =>
      Number(enRetard(b, aujourdhui)) - Number(enRetard(a, aujourdhui)) ||
      (a.echeance ?? '9999-12-31').localeCompare(b.echeance ?? '9999-12-31') ||
      (a.heure ?? '99:99').localeCompare(b.heure ?? '99:99') ||
      a.creeLe.localeCompare(b.creeLe) ||
      a.id.localeCompare(b.id),
  );
}

export interface VueDeMatrice {
  cases: Record<CaseDeMatrice, { taches: TacheDeMatrice[]; ouvertes: number; enRetard: number }>;
  ouvertes: number;
  enRetard: number;
}

/** Les tâches ouvertes rangées dans leurs cases ; le compteur d'en-tête est le nombre de tâches ouvertes de la case. */
export function matrice(taches: readonly TacheDeMatrice[], aujourdhui: Jour): VueDeMatrice {
  const ouvertes = taches.filter((t) => !t.faite);
  const vide = () => ({ taches: [] as TacheDeMatrice[], ouvertes: 0, enRetard: 0 });
  const cases: VueDeMatrice['cases'] = { maintenant: vide(), planifier: vide(), deleguer: vide(), alleger: vide() };
  for (const c of CASES) {
    const dedans = trierLaCase(ouvertes.filter((t) => caseDe(t, aujourdhui) === c), aujourdhui);
    cases[c] = { taches: dedans, ouvertes: dedans.length, enRetard: dedans.filter((t) => enRetard(t, aujourdhui)).length };
  }
  return { cases, ouvertes: ouvertes.length, enRetard: ouvertes.filter((t) => enRetard(t, aujourdhui)).length };
}

/** Au-delà de 4 tâches visibles, « + n autres » remplace le pied de la case. */
export const TACHES_VISIBLES_PAR_CASE = 4;

/* ------------------------------ Ajout rapide ------------------------------ */

const JOURS_NOMS: Readonly<Record<string, number>> = { lundi: 1, mardi: 2, mercredi: 3, jeudi: 4, vendredi: 5, samedi: 6, dimanche: 7 };

export interface SaisieAnalysee {
  titre: string;
  echeance: Jour | null;
  heure: string | null;
  /** « @Mohamed » : le nom tel qu'écrit ; la correspondance avec une personne se fait ailleurs. */
  personne: string | null;
  etiquette: string | null;
  urgent: boolean;
  important: boolean;
  /** Ce que l'aperçu annonce : la case calculée. */
  case: CaseDeMatrice;
}

/**
 * « Appeler Menna lundi 10 h, important » → titre « Appeler Menna », lundi suivant, 10:00, important, case « Planifier ».
 * Le jour de la semaine est le PROCHAIN (jamais aujourd'hui) ; « le 12 » est le prochain 12 ; ce qui n'est pas reconnu reste dans le titre.
 */
export function analyserLaSaisie(texte: string, aujourdhui: Jour): SaisieAnalysee {
  let reste = ` ${texte.trim()} `;
  let echeance: Jour | null = null;
  let heure: string | null = null;
  let personne: string | null = null;
  let etiquette: string | null = null;
  let urgent = false;
  let important = false;
  const retirer = (re: RegExp, quand: (m: RegExpMatchArray) => void) => {
    const m = reste.match(re);
    if (m) {
      quand(m);
      reste = reste.replace(re, ' ');
    }
  };
  retirer(/\s@([\p{L}\d_-]+)/iu, (m) => { personne = m[1]; });
  retirer(/\s#([\p{L}\d_-]+)/iu, (m) => { etiquette = m[1]; });
  retirer(/\s(?:à\s+)?(\d{1,2})\s*h\s*(\d{2})?(?=[\s,.;]|$)/iu, (m) => {
    const h = Number(m[1]);
    const min = m[2] ? Number(m[2]) : 0;
    if (h < 24 && min < 60) heure = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
  });
  retirer(/\s(après-demain|apres-demain)(?=[\s,.;]|$)/iu, () => { echeance = ajouterJours(aujourdhui, 2); });
  retirer(/\sdemain(?=[\s,.;]|$)/iu, () => { echeance = ajouterJours(aujourdhui, 1); });
  retirer(/\saujourd['’]hui(?=[\s,.;]|$)/iu, () => { echeance = aujourdhui; });
  retirer(/\s(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)(?=[\s,.;]|$)/iu, (m) => {
    const cible = JOURS_NOMS[m[1].toLowerCase()];
    const delta = ((cible - jourSemaineIso(aujourdhui) + 6) % 7) + 1;
    echeance = ajouterJours(aujourdhui, delta);
  });
  retirer(/\sle\s+(\d{1,2})(?=[\s,.;]|$)/iu, (m) => {
    const n = Number(m[1]);
    if (n >= 1 && n <= 28) {
      const [a, mo] = aujourdhui.split('-').map(Number);
      const ce = `${a}-${String(mo).padStart(2, '0')}-${String(n).padStart(2, '0')}`;
      const suivant = mo === 12 ? `${a + 1}-01-${String(n).padStart(2, '0')}` : `${a}-${String(mo + 1).padStart(2, '0')}-${String(n).padStart(2, '0')}`;
      echeance = ce > aujourdhui ? ce : suivant;
    }
  });
  retirer(/\s(urgent|urgente)(?=[\s,.;!]|$)/iu, () => { urgent = true; });
  retirer(/\s!(?=\s|$)/u, () => { urgent = true; });
  retirer(/\s(important|importante)(?=[\s,.;!]|$)/iu, () => { important = true; });
  const titre = reste.replace(/\s+,/g, ',').replace(/[,;]\s*$/, '').replace(/\s+/g, ' ').trim().replace(/,$/, '').trim();
  const tache: TacheDeMatrice = { id: '', titre, echeance, heure, urgente: urgent, importante: important, creeLe: '' };
  return { titre, echeance, heure, personne, etiquette, urgent, important, case: caseDe(tache, aujourdhui) };
}

/* ---------------------- « 5 sur 8 fait » et phrase du jour ---------------------- */

export type PhraseDeLaJournee =
  | { type: 'plus-que'; restantes: number; serieSiBouclee: number }
  | { type: 'finie' }
  | { type: 'bouclee' }
  | { type: 'rien' };

/** Plus que N−n, avant la fin de journée ; après l'heure de fin, le reste passe à demain ; N − n = 0 : journée bouclée. */
export function phraseDeLaJourneeDeTaches(faites: number, total: number, serie: number, apresLaFin: boolean): PhraseDeLaJournee {
  if (total === 0) return { type: 'rien' };
  if (faites >= total) return { type: 'bouclee' };
  if (apresLaFin) return { type: 'finie' };
  return { type: 'plus-que', restantes: total - faites, serieSiBouclee: serie + 1 };
}

/** Au-delà de 12 segments, une barre continue. */
export const SEGMENTS_MAX = 12;

/** « 2 h 30 libres lundi matin » : le plus grand trou entre deux créneaux d'une journée (heures décimales), de 8 h à 12 h. */
export function plusGrandTempsLibre(occupes: readonly { debut: number; fin: number }[], debut = 8, fin = 12): number {
  let courant = debut;
  let meilleur = 0;
  for (const c of [...occupes].sort((a, b) => a.debut - b.debut)) {
    if (c.debut > courant) meilleur = Math.max(meilleur, Math.min(c.debut, fin) - courant);
    courant = Math.max(courant, c.fin);
    if (courant >= fin) break;
  }
  return Math.max(meilleur, Math.max(0, fin - courant));
}

/** L'écart en jours d'une échéance, pour l'étiquette de la carte (« Mer. 28 » en rouge si en retard). */
export const joursAvantEcheance = (t: Pick<TacheDeMatrice, 'echeance'>, aujourdhui: Jour): number | null => (t.echeance === null ? null : ecartJours(aujourdhui, t.echeance));

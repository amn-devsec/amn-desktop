import { aplatir, ms, pourcent, type Instant } from './commun';

/**
 * MODÈLES (ME03) — usage, bibliothèque, variables, numéro proposé, case proposée. Logique pure.
 *
 * Les aperçus miniatures (`PageThumb`) sont du décor : aucune logique. Pas de mention fiscale (TVA, régime) en dur
 * dans un modèle de devis : elle dépend des réglages de l'entreprise.
 */

/** Utilisations depuis le 1er du mois (« Utilisé 31 fois ce mois »). */
export const usagesDuMois = (usages: readonly Instant[], debutDuMois: Instant): number => usages.filter((u) => ms(u) >= ms(debutDuMois)).length;

/**
 * La barre d'usage : utilisations du modèle / utilisations du modèle le plus utilisé de l'année glissante
 * (Proposition de la fiche), en %, plafonnée à 100.
 */
export const tauxDUsage = (usagesDuModele: number, usagesDuPlusUtilise: number): number => pourcent(usagesDuModele, usagesDuPlusUtilise);

/** « Ta bibliothèque 24 sur 30 » : modèles présents parmi les recommandés du métier (catalogue L04), plafonné. */
export function bibliotheque(presents: readonly string[], recommandes: readonly string[]): { presents: number; sur: number; pourcent: number } {
  const reco = new Set(recommandes);
  const n = new Set(presents.filter((p) => reco.has(p))).size;
  return { presents: n, sur: reco.size, pourcent: pourcent(n, reco.size) };
}

/* ------------------------------ Variables ------------------------------ */

export const SOURCES_DE_VARIABLE = ['fiche client', 'suite des devis', 'automatique', 'catalogue', 'calculé', 'à saisir', 'durée par défaut', 'signature électronique'] as const;
export type SourceDeVariable = (typeof SOURCES_DE_VARIABLE)[number];

export interface VariableDeModele {
  nom: string;
  source: SourceDeVariable;
  valeurParDefaut?: string;
}

/** « Remplies toutes seules » : variables dont la source n'est pas « à saisir ». */
export const remplies = (vars: readonly VariableDeModele[]): { toutes: number; seules: number; aSaisir: number } => {
  const aSaisir = vars.filter((v) => v.source === 'à saisir').length;
  return { toutes: vars.length, seules: vars.length - aSaisir, aSaisir };
};

/**
 * Les champs variables d'un contenu : `{nom}`, uniques, dans l'ordre. C'est la syntaxe proposée
 * (le moteur de variables est « à confirmer dans le code ») ; une accolade seule n'en est pas une.
 */
export function extraireVariables(contenu: string): string[] {
  const vus = new Set<string>();
  for (const m of contenu.matchAll(/\{([^{}\s][^{}]*?)\}/g)) vus.add(m[1].trim());
  return [...vus];
}

/** Remplit un contenu ; une variable sans valeur reste visible (`{nom}`) pour être saisie, jamais vide en silence. */
export const remplir = (contenu: string, valeurs: Readonly<Record<string, string>>): string =>
  contenu.replace(/\{([^{}\s][^{}]*?)\}/g, (tout, nom: string) => valeurs[nom.trim()] ?? tout);

/** Le prochain numéro de la suite : D-2026-117 → D-2026-118. Garde la largeur ; refuse un numéro sans chiffres. */
export function prochainNumero(dernier: string): string {
  const m = /^(.*?)(\d+)$/.exec(dernier);
  if (!m) throw new Error(`numéro sans chiffres : ${dernier}`);
  const suivant = String(Number(m[2]) + 1).padStart(m[2].length, '0');
  return `${m[1]}${suivant}`;
}

/* ------------------------------ Case proposée ------------------------------ */

export const CASE_PROPOSEE_MESSAGES = 5;
export const CASE_PROPOSEE_FENETRE_JOURS = 30;
export const CASE_PROPOSEE_SIMILARITE = 0.7;

const phrases = (t: string): Set<string> => new Set(t.split(/(?<=[.!?])\s+|\n+/).map(aplatir).filter((p) => p.length > 3));

/** Part de phrases communes entre deux textes (rapport à la plus longue des deux). */
export function similarite(a: string, b: string): number {
  const A = phrases(a);
  const B = phrases(b);
  if (!A.size || !B.size) return 0;
  let communes = 0;
  for (const p of A) if (B.has(p)) communes += 1;
  return communes / Math.max(A.size, B.size);
}

export interface MessageEcrit {
  id: string;
  texte: string;
  at: Instant;
}

/**
 * Ajmani propose une case quand la personne a écrit au moins 5 messages au contenu proche (plus de 70 % de phrases
 * communes) en 30 jours, sans modèle existant. Une seule proposition à la fois : la plus répétée.
 */
export function caseProposee(messages: readonly MessageEcrit[], modelesExistants: readonly string[], maintenant: Instant): { messageIds: string[]; exemple: string } | null {
  const debut = ms(maintenant) - CASE_PROPOSEE_FENETRE_JOURS * 86_400_000;
  const recents = messages.filter((m) => ms(m.at) >= debut && ms(m.at) <= ms(maintenant)).sort((a, b) => ms(a.at) - ms(b.at) || a.id.localeCompare(b.id));
  const groupes: { graine: MessageEcrit; ids: string[] }[] = [];
  for (const m of recents) {
    const g = groupes.find((x) => similarite(x.graine.texte, m.texte) > CASE_PROPOSEE_SIMILARITE);
    if (g) g.ids.push(m.id);
    else groupes.push({ graine: m, ids: [m.id] });
  }
  const meilleur = groupes
    .filter((g) => g.ids.length >= CASE_PROPOSEE_MESSAGES && !modelesExistants.some((mod) => similarite(mod, g.graine.texte) > CASE_PROPOSEE_SIMILARITE))
    .sort((a, b) => b.ids.length - a.ids.length)[0];
  return meilleur ? { messageIds: meilleur.ids, exemple: meilleur.graine.texte } : null;
}

export interface CaseDeGalerie {
  id: string;
  nom: string;
  usagesMois: number;
  proposee?: boolean;
}

/** Tri de la galerie : les plus utilisés ce mois d'abord ; la case proposée en dernier. */
export const trierGalerie = (cases: readonly CaseDeGalerie[]): CaseDeGalerie[] =>
  [...cases].sort((a, b) => Number(!!a.proposee) - Number(!!b.proposee) || b.usagesMois - a.usagesMois || a.nom.localeCompare(b.nom));

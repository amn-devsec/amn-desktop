import { aplatir, ms, MS_SECONDE, pourcent, type Instant, type Jour } from './commun';

/**
 * RÉDACTION ET TRADUCTION (ME02) — objectif de mots, notes de marge, vérification de date, déclencheurs.
 * Logique pure. Ajmani ne remplace rien sans clic et ne parle jamais à la place de la personne.
 */

export type Longueur = 'court' | 'moyen' | 'long';
/** Objectif de mots selon « Longueur » (Proposition de la fiche) : Court 120, Moyen 250, Long 500. */
export const OBJECTIF_DE_MOTS: Record<Longueur, number> = { court: 120, moyen: 250, long: 500 };
/** Vitesse de lecture : 3,2 mots par seconde (ME02 §6). */
export const MOTS_PAR_SECONDE = 3.2;

export interface AnneauDeMots {
  mots: number;
  objectif: number;
  /** 78 / 120 = 65 %. Plafonné à 100 pour l'anneau. */
  pourcent: number;
  /** Au-delà de l'objectif, l'anneau passe orange et le libellé dit « un peu long ». */
  depasse: boolean;
}

export function anneauDeMots(mots: number, longueur: Longueur): AnneauDeMots {
  const objectif = OBJECTIF_DE_MOTS[longueur];
  return { mots, objectif, pourcent: pourcent(mots, objectif), depasse: mots > objectif };
}

/** « Lu en 25 secondes » : mots / 3,2, arrondi à 5 secondes (au plus proche, jamais 0 pour un texte non vide). */
export function luEnSecondes(mots: number): number {
  if (mots <= 0) return 0;
  return Math.max(5, Math.round(mots / MOTS_PAR_SECONDE / 5) * 5);
}

/* ------------------------------ Notes de marge ------------------------------ */

export type TypeDeNote = 'reformulation' | 'ajout' | 'verification';

export interface NoteDeMarge {
  id: string;
  type: TypeDeNote;
  /** Ordonnée de la première ligne du passage visé, dans la page. */
  ligneY: number;
  /** Hauteur de la carte de la note. */
  hauteur: number;
}

export interface NotePositionnee {
  id: string;
  y: number;
  /** Chevauchement : la note descend sous la précédente et son fil devient oblique. */
  oblique: boolean;
}

/** Écart entre deux notes de marge qui se suivent (ME02 §6). */
export const ECART_DE_NOTES = 12;

/**
 * Chaque note s'aligne sur la première ligne de son passage. Si deux notes se chevauchent, la suivante descend
 * sous la précédente (écart 12) et son fil devient oblique. L'ordre d'entrée est celui du texte.
 */
export function positionnerNotes(notes: readonly NoteDeMarge[]): NotePositionnee[] {
  const ordre = [...notes].sort((a, b) => a.ligneY - b.ligneY || a.id.localeCompare(b.id));
  const out: NotePositionnee[] = [];
  let bas = Number.NEGATIVE_INFINITY;
  for (const n of ordre) {
    const y = Math.max(n.ligneY, bas + ECART_DE_NOTES);
    out.push({ id: n.id, y, oblique: y > n.ligneY });
    bas = y + n.hauteur;
  }
  return out;
}

/* ------------------------------ Date vérifiée ------------------------------ */

export interface Occupation {
  personne: string;
  jour: Jour;
}

/**
 * « Date vérifiée » : la date du texte est comparée au planning (MJ03) et au calendrier (H01) des personnes
 * concernées. La note n'a pas d'action (pas de bouton). Une date passée n'est pas vérifiable : `null`.
 */
export function verifierDate(jourDuTexte: Jour, personnes: readonly string[], occupations: readonly Occupation[], aujourdhui: Jour): { verifiee: boolean; conflits: string[] } | null {
  if (jourDuTexte < aujourdhui) return null;
  const conflits = personnes.filter((p) => occupations.some((o) => o.personne === p && o.jour === jourDuTexte));
  return { verifiee: conflits.length === 0, conflits };
}

/* ------------------------------ Déclencheurs (Propositions) ------------------------------ */

const FORMULES_LONGUES = ['je me permets de', 'je me permets d’', "je me permets d'", 'agréer', 'dans l’attente de votre retour', "dans l'attente de votre retour", 'à votre entière disposition'];
const MOTS_DE_RENDEZ_VOUS = /\b(rendez-vous|rdv|créneau|creneau|rencontre|appel|visio)\b/i;
const DATE_DANS_LE_TEXTE = /\b(\d{1,2}\s+(?:janv|févr|fevr|mars|avr|mai|juin|juil|août|aout|sept|oct|nov|déc|dec)[a-zé.]*|\d{1,2}\/\d{1,2}|lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|demain|la semaine prochaine)\b/i;

export type Declencheur = 'formule-longue' | 'rendez-vous-sans-date' | 'date-a-verifier' | 'version-dans-une-autre-langue';

export interface ContexteDeTexte {
  /** Langue du texte. */
  langue: string;
  /** Langue dans laquelle le destinataire écrit souvent. */
  langueDuDestinataire?: string | null;
}

export function declencheurs(texte: string, ctx: ContexteDeTexte): Declencheur[] {
  const t = aplatir(texte);
  const out: Declencheur[] = [];
  if (FORMULES_LONGUES.some((f) => t.includes(aplatir(f)))) out.push('formule-longue');
  const parleDeRdv = MOTS_DE_RENDEZ_VOUS.test(texte);
  const adate = DATE_DANS_LE_TEXTE.test(texte);
  if (parleDeRdv && !adate) out.push('rendez-vous-sans-date');
  if (adate) out.push('date-a-verifier');
  if (ctx.langueDuDestinataire && ctx.langueDuDestinataire !== ctx.langue) out.push('version-dans-une-autre-langue');
  return out;
}

/* ------------------------------ Enregistrement et registre ------------------------------ */

/** Brouillon enregistré automatiquement 2 s après la dernière frappe. */
export const DELAI_BROUILLON_MS = 2 * MS_SECONDE;
export const brouillonAEnregistrer = (derniereFrappe: Instant, dernierEnregistrement: Instant | null, maintenant: Instant): boolean =>
  (dernierEnregistrement === null || ms(derniereFrappe) > ms(dernierEnregistrement)) && ms(maintenant) - ms(derniereFrappe) >= DELAI_BROUILLON_MS;

/**
 * Le registre de langue du texte rédigé : ce qui part chez un client reste au vouvoiement (courriels, devis,
 * relances, réponses automatiques). L'interface, elle, tutoie. Un texte interne (annonce à l'équipe) suit la voix de l'équipe.
 */
export const registreDuTexte = (destinataireEstClient: boolean): 'vouvoiement' | 'tutoiement' => (destinataireEstClient ? 'vouvoiement' : 'tutoiement');

/** Le choix du canal du bouton « Envoyer » : le courriel de MX01 s'il est branché, sinon un connecteur de H21, sinon rien (brouillon gardé). */
export function canalDEnvoi(connecteurs: { courriel: boolean; connecteur: boolean }): 'courriel' | 'connecteur' | 'aucun' {
  return connecteurs.courriel ? 'courriel' : connecteurs.connecteur ? 'connecteur' : 'aucun';
}

/** ME02 (image v4) : le ton choisi, Chaleureux, Courtois ou Direct. Le ton courtois est celui d'un texte pour un client. */
export const TONS_DE_REDACTION = ['chaleureux', 'courtois', 'direct'] as const;
export type TonDeRedaction = (typeof TONS_DE_REDACTION)[number];

/** Le sens d'écriture d'une version : l'arabe, l'hébreu, le persan et l'ourdou s'écrivent de droite à gauche. */
export function sensDEcriture(langue: string): 'rtl' | 'ltr' {
  return ['ar', 'he', 'fa', 'ur'].includes(langue.toLowerCase().slice(0, 2)) ? 'rtl' : 'ltr';
}

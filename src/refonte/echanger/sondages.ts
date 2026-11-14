import { ms, type Instant } from './commun';

/**
 * SONDAGES (MX05) — résultats en direct, participation, votes reçus, éditeur. Logique pure.
 *
 * Un sondage ANONYME n'affiche jamais qui a voté quoi : ni avatars sur les barres, ni nom dans « Votes en direct »
 * (remplacé par « Un vote reçu »). La participation ne met jamais personne en cause nominativement : le reste s'écrit en
 * nombre (« 1 vote attendu »). Pas de classement de ceux qui votent le plus vite, pas de relance automatique.
 */

export type TypeDeReponse = 'un-choix' | 'plusieurs' | 'note';

export interface OptionDeSondage {
  id: string;
  libelle: string;
  votes: number;
}

export interface VoteRecu {
  email: string;
  optionId: string;
  at: Instant;
}

export interface SondageMin {
  id: string;
  question: string;
  type: TypeDeReponse;
  options: readonly OptionDeSondage[];
  anonyme: boolean;
  destinataires: number;
  votes: readonly VoteRecu[];
  etat: 'brouillon' | 'en-cours' | 'termine';
  creeAt: Instant;
  clotureAt?: Instant | null;
}

export interface BarreDeResultat {
  id: string;
  libelle: string;
  votes: number;
  /** Entier, somme forcée à 100 % sur l'option la plus forte. */
  pourcent: number;
  enTete: boolean;
  /** Égalité en tête : « à égalité » sur les deux. */
  aEgalite: boolean;
}

/**
 * Pourcentage = voix de l'option ÷ voix exprimées, arrondi à l'entier ; si la somme n'est pas 100, l'écart est reporté
 * sur l'option la plus forte (la première à égalité). En tête = plus de voix ; égalité : « à égalité » sur les deux.
 */
export function resultats(options: readonly OptionDeSondage[]): BarreDeResultat[] {
  const total = options.reduce((s, o) => s + o.votes, 0);
  const max = Math.max(0, ...options.map((o) => o.votes));
  const enTetes = options.filter((o) => o.votes === max && max > 0);
  const brut = options.map((o) => (total === 0 ? 0 : Math.round((o.votes / total) * 100)));
  if (total > 0) {
    const ecart = 100 - brut.reduce((s, x) => s + x, 0);
    const i = options.findIndex((o) => o.votes === max);
    if (i >= 0) brut[i] += ecart;
  }
  return options.map((o, i) => ({
    id: o.id,
    libelle: o.libelle,
    votes: o.votes,
    pourcent: brut[i],
    enTete: max > 0 && o.votes === max,
    aEgalite: enTetes.length > 1 && o.votes === max,
  }));
}

/** Les voix par option, recomptées depuis les votes reçus (un vote = une voix par option choisie). */
export const compterLesVoix = (options: readonly OptionDeSondage[], votes: readonly VoteRecu[]): OptionDeSondage[] =>
  options.map((o) => ({ ...o, votes: votes.filter((v) => v.optionId === o.id).length }));

/** La note moyenne d'un sondage de type « note », les options étant « 1 » à « 5 ». `null` sans vote. */
export function noteMoyenne(options: readonly OptionDeSondage[]): number | null {
  const total = options.reduce((s, o) => s + o.votes, 0);
  if (!total) return null;
  const somme = options.reduce((s, o) => s + Number(o.libelle) * o.votes, 0);
  return Math.round((somme / total) * 10) / 10;
}

export interface Participation {
  votants: number;
  destinataires: number;
  /** Huit cases dans la maquette : une par destinataire, jusqu'à 8 ; au-delà, une barre proportionnelle. */
  cases: boolean[];
  /** « 1 vote attendu » : un nombre, jamais un nom. */
  attendus: number;
}

export function participation(s: Pick<SondageMin, 'votes' | 'destinataires'>, casesMax = 8): Participation {
  const votants = new Set(s.votes.map((v) => v.email)).size;
  const dest = Math.max(0, s.destinataires);
  const n = Math.min(casesMax, dest);
  const remplies = dest === 0 ? 0 : Math.round((Math.min(votants, dest) / dest) * n);
  return { votants, destinataires: dest, cases: Array.from({ length: n }, (_, i) => i < remplies), attendus: Math.max(0, dest - votants) };
}

export type VoteEnDirect = { genre: 'nominatif'; email: string; optionId: string; at: number } | { genre: 'anonyme'; at: number };

/** Les votes des dernières 24 h, le plus récent en haut ; masqués (« Un vote reçu ») si le sondage est anonyme. */
export function votesEnDirect(s: Pick<SondageMin, 'votes' | 'anonyme'>, maintenant: Instant): VoteEnDirect[] {
  return s.votes
    .filter((v) => ms(maintenant) - ms(v.at) <= 86_400_000 && ms(v.at) <= ms(maintenant))
    .sort((a, b) => ms(b.at) - ms(a.at) || a.email.localeCompare(b.email))
    .map((v): VoteEnDirect => (s.anonyme ? { genre: 'anonyme', at: ms(v.at) } : { genre: 'nominatif', email: v.email, optionId: v.optionId, at: ms(v.at) }));
}

/** Sur un sondage anonyme, personne ne se reconnaît sur une barre : aucun avatar. */
export const avatarsSurLesBarres = (s: Pick<SondageMin, 'anonyme'>, votants: readonly string[]): string[] => (s.anonyme ? [] : [...votants]);

/** « Autres sondages » : en cours d'abord, puis les terminés récents ; le résultat montré est l'option en tête (ou la note moyenne). */
export function autresSondages(sondages: readonly SondageMin[], exceptId: string): SondageMin[] {
  const rang = (s: SondageMin) => (s.etat === 'en-cours' ? 0 : s.etat === 'termine' ? 1 : 2);
  return sondages.filter((s) => s.id !== exceptId && s.etat !== 'brouillon').sort((a, b) => rang(a) - rang(b) || ms(b.creeAt) - ms(a.creeAt) || a.id.localeCompare(b.id));
}

/* ------------------------------ L'éditeur ------------------------------ */

export const OPTIONS_MIN = 2;

/** « Envoyer le sondage » est désactivé tant qu'il manque la question ou 2 options. Le primaire de l'écran est dans l'éditeur. */
export function editeurComplet(question: string, options: readonly string[]): { complet: boolean; manque: ('question' | 'options')[] } {
  const manque: ('question' | 'options')[] = [];
  if (!question.trim()) manque.push('question');
  if (options.filter((o) => o.trim()).length < OPTIONS_MIN) manque.push('options');
  return { complet: manque.length === 0, manque };
}

/** Un sondage naît en brouillon, quel qu'en soit l'auteur (Ajmani compris) : il ne part jamais aux clients sans clic sur « Envoyer le sondage ». */
export const ETAT_A_LA_CREATION = 'brouillon' as const;

/** Clôture automatique à la date choisie. */
export const estCloture = (s: Pick<SondageMin, 'etat' | 'clotureAt'>, maintenant: Instant): boolean => s.etat === 'termine' || (!!s.clotureAt && ms(s.clotureAt) <= ms(maintenant));

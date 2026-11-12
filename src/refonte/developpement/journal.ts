import { debutDuJourParis, debutDuMoisParis, INSECABLE, masquerSecrets, ms, partiesParis, ajouterJours, quandRelatif, type Instant, type Jour, type Langue } from './commun';
import { dire, direCompte } from './i18n';

/**
 * LOT-11 · LE JOURNAL DES EXÉCUTIONS — logique pure, sans React.
 *
 * Fiches : `DEV-editeur.md` (puces « Test sur 3 courriels : réussi », « Dernière exécution »,
 * « actif · 38 exécutions ce mois », « 9 flux sur 12 tournent seuls ») et H20 (frise du jour,
 * compteurs « Tout / À regarder / Échecs », temps gagné, pause après 3 échecs de suite).
 *
 * Une exécution est un passage réel d'un flux (ou d'une tâche planifiée). Un ESSAI (« Tester »)
 * est noté pour l'écran, mais ne compte JAMAIS dans les exécutions ni le temps gagné.
 * Le message d'une exécution est passé par `masquerSecrets` avant d'être gardé.
 */

export type ResultatExecution = 'en-cours' | 'reussie' | 'echec' | 'ignoree';
export type Mode = 'local' | 'api';

export interface Execution {
  id: string;
  /** Le flux (ou la tâche planifiée) qui a tourné. */
  fluxId: string;
  debut: Instant;
  fin?: Instant | null;
  resultat: ResultatExecution;
  mode: Mode;
  /** Un essai (« Tester ») : visible, jamais compté. */
  essai?: boolean;
  /** L'exécution a laissé quelque chose à une personne (une tâche, une alerte) : « à regarder ». */
  actionHumaine?: boolean;
  /** Une phrase courte ; jamais de valeur secrète (masquée sinon). */
  message?: string | null;
}

/** Ce qu'on garde : 90 jours, 2 000 lignes au plus (les plus récentes). */
export const CONSERVATION_JOURS = 90;
export const LIGNES_MAX = 2000;
/** Un flux se met en pause seul après ce nombre d'échecs réels de suite (H20, proposition). */
export const SEUIL_PAUSE_AUTO = 3;

const recentDAbord = (a: Execution, b: Execution) => ms(b.debut) - ms(a.debut) || b.id.localeCompare(a.id);

/**
 * Ajoute (ou met à jour, même `id`) une exécution. Pur : rend un nouveau journal, trié du plus
 * récent au plus ancien, purgé de ce qui dépasse la conservation, message masqué.
 */
export function noter(
  journal: readonly Execution[],
  e: Execution,
  options: { maintenant: Instant; conservationJours?: number; lignesMax?: number },
): Execution[] {
  const propre: Execution = { ...e, message: e.message == null ? e.message : masquerSecrets(e.message) };
  const limite = ms(options.maintenant) - (options.conservationJours ?? CONSERVATION_JOURS) * 86_400_000;
  return [propre, ...journal.filter((x) => x.id !== e.id)]
    .filter((x) => ms(x.debut) >= limite)
    .sort(recentDAbord)
    .slice(0, options.lignesMax ?? LIGNES_MAX);
}

/** Les exécutions RÉELLES et terminées (ni essai, ni en cours). */
export const reelles = (j: readonly Execution[], fluxId?: string): Execution[] =>
  j.filter((x) => !x.essai && x.resultat !== 'en-cours' && (fluxId == null || x.fluxId === fluxId));

/** « n exécutions ce mois » : depuis le 1er à 00:00, heure de Paris. */
export function executionsDuMois(j: readonly Execution[], maintenant: Instant, fluxId?: string): number {
  const debut = debutDuMoisParis(maintenant);
  const m = ms(maintenant);
  return reelles(j, fluxId).filter((x) => ms(x.debut) >= debut && ms(x.debut) <= m).length;
}

export function texteExecutionsDuMois(j: readonly Execution[], maintenant: Instant, fluxId?: string, langue: Langue = 'fr'): string {
  return direCompte(langue, 'flux.executionsMois', executionsDuMois(j, maintenant, fluxId));
}

/** La dernière exécution réelle (les essais n'y sont pas). */
export function derniereExecution(j: readonly Execution[], fluxId?: string): Execution | null {
  return [...j].filter((x) => !x.essai && (fluxId == null || x.fluxId === fluxId)).sort(recentDAbord)[0] ?? null;
}

/** « Dernière exécution : il y a 9 min », ou « Aucune exécution pour l'instant ». */
export function texteDerniereExecution(j: readonly Execution[], maintenant: Instant, fluxId?: string, langue: Langue = 'fr'): string {
  const d = derniereExecution(j, fluxId);
  return d ? dire(langue, 'flux.derniere', { quand: quandRelatif(d.debut, maintenant, langue) }) : dire(langue, 'flux.aucune');
}

/** Compteurs du jour (H20) : « Tout », « À regarder », « Échecs », aujourd'hui à Paris. */
export function compteursDuJour(j: readonly Execution[], maintenant: Instant): { tout: number; aRegarder: number; echecs: number } {
  const debut = debutDuJourParis(maintenant);
  const m = ms(maintenant);
  const jour = reelles(j).filter((x) => ms(x.debut) >= debut && ms(x.debut) <= m);
  return {
    tout: jour.length,
    aRegarder: jour.filter((x) => x.actionHumaine && x.resultat === 'reussie').length,
    echecs: jour.filter((x) => x.resultat === 'echec').length,
  };
}

/** Le nombre d'échecs réels de suite, en partant du plus récent (un succès remet à zéro). */
export function echecsDeSuite(j: readonly Execution[], fluxId: string): number {
  let n = 0;
  for (const x of reelles(j, fluxId).sort(recentDAbord)) {
    if (x.resultat === 'echec') n += 1;
    else if (x.resultat === 'reussie') break;
  }
  return n;
}

export const doitSeMettreEnPause = (j: readonly Execution[], fluxId: string): boolean => echecsDeSuite(j, fluxId) >= SEUIL_PAUSE_AUTO;

/** Exécutions réelles par jour, sur `n` jours (aujourd'hui compris) : les mini-barres de H20. */
export function parJour(j: readonly Execution[], maintenant: Instant, n = 7, fluxId?: string): { jour: Jour; total: number }[] {
  const aujourdhui = partiesParis(maintenant).jour;
  const jours = Array.from({ length: n }, (_, k) => ajouterJours(aujourdhui, k - n + 1));
  const compte = new Map<Jour, number>(jours.map((x) => [x, 0]));
  const m = ms(maintenant);
  for (const x of reelles(j, fluxId)) {
    if (ms(x.debut) > m) continue;
    const jj = partiesParis(x.debut).jour;
    if (compte.has(jj)) compte.set(jj, (compte.get(jj) ?? 0) + 1);
  }
  return jours.map((x) => ({ jour: x, total: compte.get(x) ?? 0 }));
}

/* ------------------------------ Temps gagné ------------------------------ */

/**
 * Minutes gagnées ce mois : exécutions RÉUSSIES × durée de référence du flux (en minutes).
 * Les durées de référence sont des propositions (H20, à valider avec le dirigeant).
 */
export function minutesGagneesDuMois(j: readonly Execution[], dureesReference: Readonly<Record<string, number>>, maintenant: Instant): number {
  const debut = debutDuMoisParis(maintenant);
  const m = ms(maintenant);
  return reelles(j)
    .filter((x) => x.resultat === 'reussie' && ms(x.debut) >= debut && ms(x.debut) <= m)
    .reduce((s, x) => s + (dureesReference[x.fluxId] ?? 0), 0);
}

/** « 25 min gagnées », « 1 h 40 gagnées » (H20). */
export function texteTempsGagne(minutes: number, langue: Langue = 'fr'): string {
  const n = Math.max(0, Math.round(minutes));
  if (n < 60) return dire(langue, 'temps.minutes', { n }).replace(' ', INSECABLE);
  const h = Math.floor(n / 60);
  return dire(langue, 'temps.heures', { h, mm: String(n % 60).padStart(2, '0') });
}

/** « environ 3 h par mois » (suggestion d'Ajmani, arrondi à l'heure, au moins 1). */
export function texteEnvironParMois(minutes: number, langue: Langue = 'fr'): string {
  return dire(langue, 'temps.environ', { h: Math.max(1, Math.round(minutes / 60)) });
}

/* ------------------------------ Flux et essais ------------------------------ */

export type EtatFlux = 'Active' | 'En pause' | 'Brouillon';

/**
 * « 9 flux sur 12 tournent seuls » : flux actifs sur TOUS les flux, brouillons compris
 * (le jeu fictif donne 9 actifs, 2 en pause et 1 brouillon sur 12, comme l'image).
 */
export function resumeFlux(flux: readonly { etat: EtatFlux }[], langue: Langue = 'fr'): { actifs: number; total: number; texte: string } {
  const total = flux.length;
  const actifs = flux.filter((f) => f.etat === 'Active').length;
  return { actifs, total, texte: dire(langue, 'flux.tournentSeuls', { actifs, total }) };
}

/**
 * Le résultat d'un « Tester » : rejoué sur les derniers éléments réels, sans effet.
 * « Test sur 3 courriels : réussi » si aucun essai n'est en échec.
 */
export function resultatTest(essais: readonly Execution[], quoi: string, langue: Langue = 'fr'): { total: number; enErreur: number; reussi: boolean; texte: string } {
  const lot = essais.filter((x) => x.essai && x.resultat !== 'en-cours');
  const enErreur = lot.filter((x) => x.resultat === 'echec').length;
  const reussi = lot.length > 0 && enErreur === 0;
  const texte = reussi ? dire(langue, 'flux.test.reussi', { n: lot.length, quoi }) : dire(langue, 'flux.test.erreurs', { n: lot.length, quoi, e: enErreur });
  return { total: lot.length, enErreur, reussi, texte };
}

/** Part des exécutions réelles du mois faites en local (0 à 100, arrondi) ; `null` sans exécution. */
export function partLocaleDuMois(j: readonly Execution[], maintenant: Instant): number | null {
  const debut = debutDuMoisParis(maintenant);
  const m = ms(maintenant);
  const mois = reelles(j).filter((x) => ms(x.debut) >= debut && ms(x.debut) <= m);
  if (mois.length === 0) return null;
  return Math.round((mois.filter((x) => x.mode === 'local').length / mois.length) * 100);
}

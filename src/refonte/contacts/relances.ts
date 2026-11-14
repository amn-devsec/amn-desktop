import { VALEURS_DE_DEPART } from '../connecteurs/reglages';
import type { MotifRelance, Relance } from '../donnees/types';
import { ajouterJours, ecartJours, euros, instantParis, jourDe, jourFrancais, jourSemaine, minutesDe, MS_MINUTE, type Jour, type Langue } from './commun';
import { dire } from './i18n';

/**
 * LOT-02 · LES RELANCES (MC07) — logique pure.
 *
 * LA RÈGLE QUI COMPTE : on ne harcèle jamais un client. La fiche MC07 (rubrique 6) la
 * pose en huit points ; `check:contacts` en teste chacun :
 *
 *   1. UN CLIENT, UNE RELANCE PAR SEMAINE GLISSANTE, tous objets regroupés.
 *   2. ESPACEMENT d'un même objet : au moins `espacementJours` (réglable de 3 à 14).
 *   3. TROIS RELANCES AU PLUS par objet ; appel proposé après la 2e, suivi à la main après la 3e.
 *   4. JAMAIS le week-end, un jour férié, ni hors de la plage d'envoi ; les PRÉFÉRENCES de la
 *      fiche contact (MC03 : créneau, jours à éviter) décalent l'envoi.
 *   5. ARRÊT IMMÉDIAT dès que le client répond, paie, signe ou demande à ne plus être relancé.
 *   6. RIEN DANS LES 24 H qui suivent un échange humain.
 *   7. Une relance n'entre dans la file que le jour où ces règles l'autorisent.
 *   8. RIEN NE PART SANS UN CLIC HUMAIN (`marquerEnvoyee` l'exige).
 *
 * S'y ajoute la règle de H44 : si le client a une facture en retard ET un avis sans réponse,
 * les relances sont en pause (7 jours au plus).
 *
 * D'OÙ VIENNENT LES VALEURS. La fiche l'emporte (CO, `STATUT.md` §1.31) : 5 jours entre deux
 * relances d'un objet, plage clients lun.–ven. 9:00–18:00, réglable de 3 à 14 jours. Ces valeurs
 * n'ont qu'une source, `connecteurs/reglages.ts` (`VALEURS_DE_DEPART`) ; ce fichier les LIT, sans
 * constante recopiée. Les tests passent leurs propres règles quand ils ont besoin de dates fixes.
 *
 * Le verdict dit toujours POURQUOI et QUAND : l'écran n'a jamais à inventer une phrase.
 */

export interface ReglesRelance {
  /** Entre deux relances d'un même objet. Réglable de 3 à 14 jours. */
  espacementJours: number;
  /** Au plus ce nombre de relances par objet. */
  maxParObjet: number;
  /** Une relance par client sur cette fenêtre glissante (7 jours : « une relance par semaine au plus »). */
  clientDelaiJours: number;
  /** Aucune relance dans ces heures qui suivent un échange humain. */
  heuresApresEchange: number;
  /** Pause des relances pendant qu'un avis attend une réponse, au plus ce nombre de jours (H44). */
  pauseAvisJours: number;
  fenetre: { debut: string; fin: string; jours: readonly number[] };
}

export const ESPACEMENT_MIN_JOURS = 3;
export const ESPACEMENT_MAX_JOURS = 14;

/** Les valeurs de départ. L'espacement et la plage sont LUS de `connecteurs/reglages.ts` (une seule source, §1.31) ; le reste vient de la fiche MC07. */
export const REGLES_PAR_DEFAUT: ReglesRelance = {
  espacementJours: VALEURS_DE_DEPART.delaiEntreRelancesJours,
  maxParObjet: 3,
  clientDelaiJours: 7,
  heuresApresEchange: 24,
  pauseAvisJours: 7,
  fenetre: { debut: VALEURS_DE_DEPART.plageClients.debut, fin: VALEURS_DE_DEPART.plageClients.fin, jours: VALEURS_DE_DEPART.plageClients.jours },
};

/** Les réglages saisis, bornés comme la fiche le veut : l'espacement entre 3 et 14 jours. */
export function reglesBornees(partiel: Partial<ReglesRelance>): ReglesRelance {
  const r = { ...REGLES_PAR_DEFAUT, ...partiel };
  return { ...r, espacementJours: Math.min(ESPACEMENT_MAX_JOURS, Math.max(ESPACEMENT_MIN_JOURS, Math.round(r.espacementJours))) };
}

/* ------------------------------ Jours fériés ------------------------------ */

/** Dimanche de Pâques (calendrier grégorien, algorithme de Meeus / Jones / Butcher). */
function paques(annee: number): Jour {
  const a = annee % 19;
  const b = Math.floor(annee / 100);
  const c = annee % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mois = Math.floor((h + l - 7 * m + 114) / 31);
  const jour = ((h + l - 7 * m + 114) % 31) + 1;
  return `${annee}-${String(mois).padStart(2, '0')}-${String(jour).padStart(2, '0')}`;
}

/** Les onze jours fériés de la France métropolitaine d'une année. */
export function joursFeries(annee: number): Jour[] {
  const p = paques(annee);
  const fixe = (mm: string, jj: string): Jour => `${annee}-${mm}-${jj}`;
  return [
    fixe('01', '01'), ajouterJours(p, 1), fixe('05', '01'), fixe('05', '08'), ajouterJours(p, 39), ajouterJours(p, 50),
    fixe('07', '14'), fixe('08', '15'), fixe('11', '01'), fixe('11', '11'), fixe('12', '25'),
  ];
}

export const estFerie = (jour: Jour): boolean => joursFeries(Number(jour.slice(0, 4))).includes(jour);

/* ------------------------------ Préférences d'envoi (MC03) ------------------------------ */

/**
 * Ce que la fiche contact (MC03) dit de la manière d'écrire à une personne :
 * « Le matin, avant 11:00 », « Jamais le vendredi après-midi ».
 */
export interface PreferencesEnvoi {
  /** Pas avant cette heure (`HH:MM`). */
  apres?: string;
  /** Pas après cette heure (`HH:MM`). */
  avant?: string;
  /** 1 = lundi … 7 = dimanche ; `apresMidi` : seulement à partir de 12:00 ce jour-là. */
  joursAEviter?: readonly { jour: number; apresMidi?: boolean }[];
}

const hhmm = (minutes: number): string => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

/** L'intervalle (minutes depuis minuit) où l'on peut écrire un jour donné, ou `null` si le jour est exclu. */
function intervalleDuJour(jour: Jour, regles: ReglesRelance, prefs?: PreferencesEnvoi): [number, number] | null {
  const sem = jourSemaine(jour);
  if (!regles.fenetre.jours.includes(sem) || estFerie(jour)) return null;
  let debut = minutesDe(regles.fenetre.debut);
  let fin = minutesDe(regles.fenetre.fin);
  if (prefs?.apres) debut = Math.max(debut, minutesDe(prefs.apres));
  if (prefs?.avant) fin = Math.min(fin, minutesDe(prefs.avant));
  const evite = prefs?.joursAEviter?.find((j) => j.jour === sem);
  if (evite) {
    if (!evite.apresMidi) return null;
    fin = Math.min(fin, 12 * 60);
  }
  return fin > debut ? [debut, fin] : null;
}

/** Le premier instant ≥ `depuis` (ms) où l'on peut écrire : jour ouvré, non férié, dans la plage et les préférences. */
export function prochaineOuverture(depuis: number, regles: ReglesRelance = REGLES_PAR_DEFAUT, prefs?: PreferencesEnvoi): number {
  let jour: Jour = jourDe(depuis);
  let courant = depuis;
  for (let i = 0; i < 120; i += 1) {
    const creneau = intervalleDuJour(jour, regles, prefs);
    if (creneau) {
      const debut = instantParis(jour, hhmm(creneau[0]));
      const fin = instantParis(jour, hhmm(creneau[1]));
      if (courant < debut) return debut;
      if (courant < fin) return courant;
    }
    jour = ajouterJours(jour, 1);
    courant = instantParis(jour, '00:00');
  }
  return depuis; // aucune plage possible (réglages vides) : l'écran l'a déjà refusé, on ne boucle pas
}

/* ------------------------------ Le verdict ------------------------------ */

export type RaisonAttente = 'terminee' | 'plafond' | 'espacement' | 'client' | 'echangeRecent' | 'pauseAvis' | 'horsPlage';

export type Verdict =
  | { possible: true }
  /** `prochaineLe` : le premier instant (ms) où l'envoi sera permis ; `null` quand il ne le sera plus (terminée, plafond). */
  | { possible: false; raison: RaisonAttente; prochaineLe: number | null };

/** Ce que l'écran sait en plus de la relance. */
export interface ContexteRelance {
  /** Préférences de la fiche contact (MC03). */
  preferences?: PreferencesEnvoi;
  /** Dernier échange humain avec ce client (ms) : message, appel, rendez-vous. */
  dernierEchangeHumainAt?: number;
  /** Jour où un avis du client attend une réponse alors que sa facture est en retard (H44). */
  avisEnAttenteDepuis?: Jour;
}

/** Un client se reconnaît à son identifiant, à défaut à son nom (un prospect n'a pas de fiche). */
export const cleClient = (r: Pick<Relance, 'clientId' | 'clientNom'>): string => (r.clientId != null ? `c:${r.clientId}` : `n:${r.clientNom}`);

/**
 * Peut-on envoyer cette relance maintenant ? `autres` : les relances connues du même
 * poste (pour la règle « une relance par client et par semaine »).
 */
export function verdictRelance(
  r: Relance,
  autres: readonly Relance[],
  maintenant: number,
  regles: ReglesRelance = REGLES_PAR_DEFAUT,
  contexte: ContexteRelance = {},
): Verdict {
  if (r.etat === 'répondue' || r.etat === 'arrêtée') return { possible: false, raison: 'terminee', prochaineLe: null };
  if (r.nbEnvoyees >= regles.maxParObjet) return { possible: false, raison: 'plafond', prochaineLe: null };

  const aujourdhui = jourDe(maintenant);
  let plusTot = maintenant;
  let raison: RaisonAttente | null = null;
  const attendre = (cause: RaisonAttente, instant: number) => {
    plusTot = Math.max(plusTot, instant);
    raison ??= cause;
  };

  // 2. Espacement d'un même objet.
  if (r.derniereEnvoiLe && ecartJours(r.derniereEnvoiLe, aujourdhui) < regles.espacementJours) {
    attendre('espacement', instantParis(ajouterJours(r.derniereEnvoiLe, regles.espacementJours), regles.fenetre.debut));
  }
  // 1. Un client, une relance par semaine glissante, objets regroupés (la relance elle-même compte).
  for (const o of [r, ...autres.filter((x) => x.id !== r.id)]) {
    if (cleClient(o) === cleClient(r) && o.derniereEnvoiLe && ecartJours(o.derniereEnvoiLe, aujourdhui) < regles.clientDelaiJours) {
      attendre('client', instantParis(ajouterJours(o.derniereEnvoiLe, regles.clientDelaiJours), regles.fenetre.debut));
    }
  }
  // 6. Rien dans les 24 h qui suivent un échange humain.
  const finSilence = contexte.dernierEchangeHumainAt == null ? null : contexte.dernierEchangeHumainAt + regles.heuresApresEchange * 60 * MS_MINUTE;
  if (finSilence != null && maintenant < finSilence) attendre('echangeRecent', finSilence);
  // H44 : un avis sans réponse met les relances en pause, 7 jours au plus.
  if (contexte.avisEnAttenteDepuis && ecartJours(contexte.avisEnAttenteDepuis, aujourdhui) < regles.pauseAvisJours) {
    attendre('pauseAvis', instantParis(ajouterJours(contexte.avisEnAttenteDepuis, regles.pauseAvisJours), regles.fenetre.debut));
  }
  // 4. Pas le week-end, pas férié, dans la plage et les préférences.
  const ouverture = prochaineOuverture(plusTot, regles, contexte.preferences);
  if (raison === null && ouverture !== maintenant) raison = 'horsPlage';
  if (raison === null) return { possible: true };
  return { possible: false, raison, prochaineLe: ouverture };
}

/** La suite proposée à la personne selon le nombre de relances déjà parties : un message, un appel, ou le suivi à la main. */
export function suiteApres(nbEnvoyees: number, maxParObjet = REGLES_PAR_DEFAUT.maxParObjet): 'message' | 'appel' | 'manuel' {
  if (nbEnvoyees >= maxParObjet) return 'manuel';
  if (nbEnvoyees >= 2) return 'appel';
  return 'message';
}

export interface EntreeFile {
  relance: Relance;
  verdict: Verdict;
}

export interface FileDeRelances {
  /** Prêtes à partir maintenant (au plus une par client). */
  maintenant: EntreeFile[];
  /** Pas encore : espacement, plage d'envoi, un autre message récent au même client… */
  plusTard: EntreeFile[];
  /** Plafond atteint : la personne décide d'un autre geste. */
  plafond: EntreeFile[];
  /** Répondues ou arrêtées. */
  terminees: EntreeFile[];
}

/** L'ordre de MC07 : montant décroissant (sans montant en dernier), puis départ le plus récent d'abord. */
export function comparerRelances(a: Relance, b: Relance): number {
  return (b.montantCents ?? -1) - (a.montantCents ?? -1) || b.departLe.localeCompare(a.departLe) || a.id.localeCompare(b.id);
}

/**
 * Range les relances : ce qui part, ce qui attend, ce qui s'arrête. Une relance n'entre dans
 * « maintenant » que le jour où les règles l'autorisent, et un seul départ par client.
 * `contextes` : ce que l'on sait de chaque client (clé : `cleClient`).
 */
export function ordonnerFile(
  relances: readonly Relance[],
  maintenant: number,
  regles: ReglesRelance = REGLES_PAR_DEFAUT,
  contextes: ReadonlyMap<string, ContexteRelance> = new Map(),
): FileDeRelances {
  const file: FileDeRelances = { maintenant: [], plusTard: [], plafond: [], terminees: [] };
  const partent = new Set<string>();
  for (const relance of [...relances].sort(comparerRelances)) {
    // Un client qui part déjà dans cette file compte comme « déjà écrit aujourd'hui ».
    const retenues = relances.map((o) => (partent.has(cleClient(o)) && o.id !== relance.id ? { ...o, derniereEnvoiLe: jourDe(maintenant) } : o));
    const verdict = verdictRelance(relance, retenues, maintenant, regles, contextes.get(cleClient(relance)));
    const entree = { relance, verdict };
    if (verdict.possible) {
      partent.add(cleClient(relance));
      file.maintenant.push(entree);
    } else if (verdict.raison === 'terminee') file.terminees.push(entree);
    else if (verdict.raison === 'plafond') file.plafond.push(entree);
    else file.plusTard.push(entree);
  }
  return file;
}

/**
 * Après un envoi. Deux conditions, sinon l'erreur le dit : le verdict l'autorise, et une
 * PERSONNE a cliqué (`clic: true`) — rien ne part seul (point 8).
 */
export function marquerEnvoyee(
  r: Relance,
  autres: readonly Relance[],
  maintenant: number,
  options: { clic: boolean; regles?: ReglesRelance; contexte?: ContexteRelance },
): Relance {
  if (options.clic !== true) throw new Error(`relance ${r.id} refusée : il faut un clic humain`);
  const v = verdictRelance(r, autres, maintenant, options.regles ?? REGLES_PAR_DEFAUT, options.contexte);
  if (!v.possible) throw new Error(`relance ${r.id} refusée : ${v.raison}`);
  return { ...r, etat: 'envoyée', nbEnvoyees: r.nbEnvoyees + 1, derniereEnvoiLe: jourDe(maintenant) };
}

/** Ce qui arrête une relance sur-le-champ (point 5). */
export type RaisonArret = 'reponse' | 'paiement' | 'signature' | 'demande';

/** Le client a répondu, payé ou signé : la relance est terminée. Une demande de ne plus être relancé l'arrête. */
export const arreterPour = (r: Relance, raison: RaisonArret): Relance => ({ ...r, etat: raison === 'demande' ? 'arrêtée' : 'répondue' });
export const arreter = (r: Relance): Relance => ({ ...r, etat: 'arrêtée' });
export const marquerRepondue = (r: Relance): Relance => ({ ...r, etat: 'répondue' });

/** « Reporter à demain » : l'instant où elle repartira, dans le respect de toutes les règles. */
export function reporterADemain(
  r: Relance,
  autres: readonly Relance[],
  maintenant: number,
  regles: ReglesRelance = REGLES_PAR_DEFAUT,
  contexte: ContexteRelance = {},
): number {
  const demain = instantParis(ajouterJours(jourDe(maintenant), 1), regles.fenetre.debut);
  const v = verdictRelance(r, autres, demain, regles, contexte);
  return v.possible ? demain : (v.prochaineLe ?? demain);
}

/* ------------------------------ La cadence d'un objet ------------------------------ */

export interface EtapeCadence {
  genre: 'depart' | 'relance' | 'appel' | 'manuel';
  /** 1 ou 2 pour une relance de la frise (la 3e, si elle part, est la dernière par message). */
  rang?: number;
  /** Absent pour le suivi à la main (pas de date). */
  le?: Jour;
  /** J+N depuis le départ. */
  jourN?: number;
}

export const prochainJourOuvre = (jour: Jour, regles: ReglesRelance): Jour => {
  let j = jour;
  for (let i = 0; i < 30 && intervalleDuJour(j, regles) === null; i += 1) j = ajouterJours(j, 1);
  return j;
};

/**
 * La frise « Cadence de ce devis » (MC07) : le départ, deux relances par message, l'appel
 * proposé après la 2e, puis le suivi à la main. Les dates respectent l'espacement, les week-ends
 * et les jours fériés ; `premiereApresJours` : délai avant la 1re relance (réglage du motif).
 */
export function cadence(departLe: Jour, regles: ReglesRelance = REGLES_PAR_DEFAUT, premiereApresJours = 6): EtapeCadence[] {
  const etapes: EtapeCadence[] = [{ genre: 'depart', le: departLe, jourN: 0 }];
  let courant = prochainJourOuvre(ajouterJours(departLe, premiereApresJours), regles);
  for (const rang of [1, 2]) {
    etapes.push({ genre: 'relance', rang, le: courant, jourN: ecartJours(departLe, courant) });
    courant = prochainJourOuvre(ajouterJours(courant, regles.espacementJours), regles);
  }
  etapes.push({ genre: 'appel', le: courant, jourN: ecartJours(departLe, courant) });
  etapes.push({ genre: 'manuel' });
  return etapes;
}

/* ------------------------------ La file du jour ------------------------------ */

/** « 1 sur 5 traitée » : envoyées, reportées ou passées aujourd'hui ÷ total du matin. */
export function progressionFile(totalDuMatin: number, traitees: number): { traitees: number; total: number; reste: number; videe: boolean } {
  const t = Math.max(0, Math.min(totalDuMatin, traitees));
  return { traitees: t, total: totalDuMatin, reste: totalDuMatin - t, videe: totalDuMatin > 0 && t >= totalDuMatin };
}

/** La série « Boîte à zéro » : jours ouvrés consécutifs où la file a été vidée ; week-ends et fériés ne la cassent pas. */
export function serieBoiteAZero(joursVides: readonly Jour[], aujourdhui: Jour, regles: ReglesRelance = REGLES_PAR_DEFAUT): number {
  const vides = new Set(joursVides);
  let serie = 0;
  let j = aujourdhui;
  // La journée en cours n'a pas encore été vidée : elle ne casse pas la série, elle ne l'allonge pas.
  if (!vides.has(j)) j = ajouterJours(j, -1);
  for (let i = 0; i < 400; i += 1) {
    if (intervalleDuJour(j, regles) !== null) {
      if (!vides.has(j)) break;
      serie += 1;
    }
    j = ajouterJours(j, -1);
  }
  return serie;
}

/* ------------------------------ Les phrases ------------------------------ */

const jourCourt = (j: Jour, langue: Langue): string => (langue === 'fr' ? jourFrancais(j).slice(0, 5) : j.slice(5).split('-').reverse().join('/'));

/** La phrase d'attente affichée à la personne (interface : tutoiement). */
export function phraseAttente(v: Extract<Verdict, { possible: false }>, langue: Langue, regles: ReglesRelance = REGLES_PAR_DEFAUT): string {
  const quand = v.prochaineLe == null ? '' : jourCourt(jourDe(v.prochaineLe), langue);
  switch (v.raison) {
    case 'terminee': return dire(langue, 'relance.attente.terminee');
    case 'plafond': return dire(langue, 'relance.attente.plafond', { n: regles.maxParObjet });
    case 'espacement': return dire(langue, 'relance.attente.espacement', { jours: regles.espacementJours, quand });
    case 'client': return dire(langue, 'relance.attente.client', { quand });
    case 'echangeRecent': return dire(langue, 'relance.attente.echangeRecent', { quand });
    case 'pauseAvis': return dire(langue, 'relance.attente.pauseAvis', { quand });
    case 'horsPlage': return dire(langue, 'relance.attente.horsPlage', { debut: regles.fenetre.debut, fin: regles.fenetre.fin, quand });
  }
}

/** « Facture 2026-0023 » → « 2026-0023 » : la référence seule, pour les phrases qui disent déjà « la facture » ou « le devis ». */
export const referenceDe = (r: Pick<Relance, 'motif' | 'objetLibelle'>): string => r.objetLibelle.replace(/^(Facture|Devis)\s+/i, '');

export type TonMessage = 'courtois' | 'chaleureux' | 'bref';

/**
 * Le message qui PART chez le client — vouvoiement en français (`REGLES.md`, « Produit »).
 * C'est la version de repli : en fonctionnement normal, Ajmani rédige dans le ton choisi et la
 * personne relit (rien ne part sans clic). Les chiffres, dates et libellés viennent de la relance.
 * Le ton ne change que l'entrée et la fin : « courtois » (par défaut), « chaleureux » (une phrase d'accueil),
 * « bref » (sans rappel du message précédent).
 */
export function messageClientTon(r: Relance, langue: Langue, aujourdhui: Jour, prenom?: string, ton: TonMessage = 'courtois'): string {
  const motif = (m: MotifRelance): string =>
    dire(langue, `client.${m}` as const, {
      objet: referenceDe(r),
      montant: r.montantCents != null ? euros(r.montantCents, langue) : '',
      depuis: Math.max(0, ecartJours(r.departLe, aujourdhui)),
      jour: jourFrancais(r.departLe),
    });
  const salut = prenom ? dire(langue, 'client.bonjour.prenom', { prenom }) : dire(langue, 'client.bonjour');
  const suite = r.nbEnvoyees > 0 && ton !== 'bref' ? `${dire(langue, 'client.suite')} ` : '';
  const accueil = ton === 'chaleureux' ? `${dire(langue, 'client.chaleureux.intro')} ` : '';
  const fin = dire(langue, ton === 'chaleureux' ? 'client.chaleureux.fin' : ton === 'bref' ? 'client.bref.fin' : 'client.cordialement');
  return `${salut} ${accueil}${suite}${motif(r.motif)}\n\n${fin}`;
}

export const messageClient = (r: Relance, langue: Langue, aujourdhui: Jour, prenom?: string): string => messageClientTon(r, langue, aujourdhui, prenom, 'courtois');

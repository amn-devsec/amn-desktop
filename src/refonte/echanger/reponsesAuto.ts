import { aplatir, instantParis, MS_HEURE, ms, partiesParis, type Instant } from './commun';
import { HORAIRES_PAR_DEFAUT, type CanalDeMessage, type Horaires } from './boite';

/**
 * RÉPONSES AUTOMATIQUES (MX06) — des règles en phrases « Quand… alors… ». Logique pure.
 *
 * RÈGLE D'OR : rien n'est envoyé sans une règle explicite et ACTIVE. Une règle créée, importée ou proposée par Ajmani
 * NAÎT DÉSACTIVÉE ; Ajmani n'active jamais une règle. Ce que reçoit la personne est un texte destiné à un client : il
 * reste au VOUVOIEMENT (l'interface de l'éditeur, elle, tutoie). Aucune adresse ni numéro n'est affiché dans l'aperçu.
 */

export type Declencheur =
  | { type: 'horaires' }
  | { type: 'mots'; mots: readonly string[] }
  | { type: 'rendez-vous-manque' }
  | { type: 'drapeau'; drapeau: string };

export interface RegleAuto {
  id: string;
  nom: string;
  canaux: readonly (CanalDeMessage | 'formulaire')[];
  declencheur: Declencheur | null;
  /** Le modèle de réponse (vouvoiement) ; peut porter {prénom} et {réouverture}. */
  modele: string | null;
  /** Garde-fou « SAUF SI » : la même réponse n'est pas renvoyée à la même personne dans les N heures. */
  sauf24h: boolean;
  actif: boolean;
  /** Version active en cours de test : l'ancienne reste en service tant que la nouvelle n'est pas testée. */
  aTester?: boolean;
  envoisDuMois?: number;
}

export const GARDE_FOU_HEURES = 24;

/** Une règle neuve, importée ou proposée par Ajmani naît désactivée (aucun paramètre ne change cela), avec le garde-fou par défaut. */
export function nouvelleRegle(id: string, nom: string): RegleAuto {
  return { id, nom, canaux: [], declencheur: null, modele: null, sauf24h: true, actif: false };
}

export type ManqueDansLaRegle = 'canal' | 'declencheur' | 'modele';
/** Une règle incomplète (jeton manquant « à choisir ») ne peut pas être activée. */
export function manqueDansLaRegle(r: RegleAuto): ManqueDansLaRegle[] {
  const m: ManqueDansLaRegle[] = [];
  if (!r.canaux.length) m.push('canal');
  if (!r.declencheur) m.push('declencheur');
  if (!r.modele || !r.modele.trim()) m.push('modele');
  return m;
}
export const peutActiver = (r: RegleAuto, enLigne: boolean, droitDEcriture = true): boolean => enLigne && droitDEcriture && manqueDansLaRegle(r).length === 0;

/** Modifier une règle ACTIVE la passe « à tester » ; l'ancienne version reste en service jusqu'au test (Proposition). */
export function modifier(r: RegleAuto, changement: Partial<RegleAuto>): RegleAuto {
  return { ...r, ...changement, aTester: r.actif ? true : r.aTester };
}

/* ------------------------------ Horaires ------------------------------ */

/** « En dehors des horaires » = tout le reste (réglage de l'organisation + jours fériés). */
export function dansLesHoraires(instant: Instant, horaires: Horaires = HORAIRES_PAR_DEFAUT, joursFeries: readonly string[] = []): boolean {
  const p = partiesParis(instant);
  return horaires.jours.includes(p.jourSemaine) && !joursFeries.includes(p.jour) && p.minutes >= horaires.debut && p.minutes < horaires.fin;
}

/** Le prochain créneau d'ouverture, pour la variable {réouverture}. */
export function prochaineOuverture(instant: Instant, horaires: Horaires = HORAIRES_PAR_DEFAUT, joursFeries: readonly string[] = []): number {
  let jour = partiesParis(instant).jour;
  for (let i = 0; i < 400; i += 1) {
    const iso = partiesParis(instantParis(jour, 12 * 60)).jourSemaine;
    const t = instantParis(jour, horaires.debut);
    if (horaires.jours.includes(iso) && !joursFeries.includes(jour) && t > ms(instant)) return t;
    jour = new Date(Date.parse(`${jour}T12:00:00Z`) + 86_400_000).toISOString().slice(0, 10);
  }
  return ms(instant);
}

/* ------------------------------ Déclenchement ------------------------------ */

export interface MessageRecu {
  canal: CanalDeMessage | 'formulaire';
  at: Instant;
  texte: string;
  /** L'expéditeur, par une clé de personne (jamais une adresse affichée). */
  de: string;
  expediteurEstClient: boolean;
}

export interface ContexteDeRegle {
  horaires?: Horaires;
  joursFeries?: readonly string[];
  /** Les envois déjà faits : règle + personne + instant. Sert au garde-fou. */
  envoyes: readonly { regleId: string; a: string; at: Instant }[];
}

export type Decision = { envoyer: true } | { envoyer: false; raison: 'inactive' | 'incomplete' | 'canal' | 'declencheur' | 'garde-fou' | 'hors-cible' };

/**
 * Faut-il répondre ? Jamais sans règle active et complète. Le déclencheur « horaires » = hors des horaires ; « mots » = un
 * des mots dans le message (sans accent ni casse) ; le garde-fou « SAUF SI » : pas deux fois la même réponse à la
 * même personne en 24 h.
 */
export function decider(r: RegleAuto, m: MessageRecu, ctx: ContexteDeRegle): Decision {
  if (!r.actif) return { envoyer: false, raison: 'inactive' };
  if (manqueDansLaRegle(r).length) return { envoyer: false, raison: 'incomplete' };
  if (!r.canaux.includes(m.canal)) return { envoyer: false, raison: 'canal' };
  const d = r.declencheur as Declencheur;
  const horaires = ctx.horaires ?? HORAIRES_PAR_DEFAUT;
  let ok = false;
  if (d.type === 'horaires') ok = !dansLesHoraires(m.at, horaires, ctx.joursFeries ?? []);
  else if (d.type === 'mots') ok = d.mots.some((mot) => aplatir(m.texte).includes(aplatir(mot)));
  else ok = false; // rendez-vous manqué et drapeaux : déclenchés par leur module, pas par un message
  if (!ok) return { envoyer: false, raison: 'declencheur' };
  if (r.sauf24h && ctx.envoyes.some((e) => e.regleId === r.id && e.a === m.de && ms(m.at) - ms(e.at) < GARDE_FOU_HEURES * MS_HEURE && ms(m.at) >= ms(e.at))) return { envoyer: false, raison: 'garde-fou' };
  return { envoyer: true };
}

/* ------------------------------ Aperçu ------------------------------ */

/**
 * Les variables : {prénom} (fiche contact, sinon « Bonjour, »), {réouverture} (prochain créneau d'ouverture). Une variable
 * sans valeur ne bloque JAMAIS l'envoi : la phrase est réécrite sans elle.
 */
export function remplirLeModele(modele: string, valeurs: { prenom?: string | null; reouverture?: string | null }): string {
  let t = modele;
  t = valeurs.prenom ? t.replace(/\{prénom\}/g, valeurs.prenom) : t.replace(/\s*\{prénom\}/g, '').replace(/^Bonjour\s*,?/i, 'Bonjour,').replace(/Bonjour,\s*,/g, 'Bonjour,');
  t = valeurs.reouverture ? t.replace(/\{réouverture\}/g, valeurs.reouverture) : t.replace(/\s*\{réouverture\}/g, '');
  return t.replace(/\s{2,}/g, ' ').replace(/\s+([,.;:!?])/g, '$1').trim();
}

/** Les mots du tutoiement : s'ils paraissent dans un texte qui part chez un client, c'est une faute (le vouvoiement est gardé). */
const MOTS_DU_TUTOIEMENT = new Set(['tu', 'toi', 'ton', 'ta', 'tes', 'te', 'toi-même', 'peux-tu', 'veux-tu', 'pourrais-tu', 'as-tu', 'es-tu']);

/** Le tutoiement dans un texte destiné à un client : renvoie les mots à corriger (liste vide = vouvoiement tenu). */
export function tutoiementDansUnTexteClient(texte: string): string[] {
  const mots = texte.match(/[\p{L}]+(?:[’'-][\p{L}]+)*/gu) ?? [];
  return mots.filter((m) => MOTS_DU_TUTOIEMENT.has(m.toLowerCase()) || /^t[’']/i.test(m));
}

/* ------------------------------ Compteurs ------------------------------ */

export const MINUTES_GAGNEES_PAR_ENVOI = 2.5;

export function compteurs(regles: readonly RegleAuto[], avisApres: readonly number[] = []): { actives: number; total: number; envois: number; gagneMinutes: number; avisMoyen: number | null } {
  const envois = regles.reduce((s, r) => s + (r.envoisDuMois ?? 0), 0);
  return {
    actives: regles.filter((r) => r.actif).length,
    total: regles.length,
    envois,
    gagneMinutes: Math.round(envois * MINUTES_GAGNEES_PAR_ENVOI),
    avisMoyen: avisApres.length ? Math.round((avisApres.reduce((s, x) => s + x, 0) / avisApres.length) * 10) / 10 : null,
  };
}

export const MESSAGES_POUR_PROPOSER = 10;
export const FENETRE_DE_PROPOSITION_JOURS = 30;

/**
 * « Une règle manque » : au moins 10 messages reçus en 30 jours avec la même question, sans règle qui y répond.
 * La règle proposée naît désactivée. `repondues` : clés de questions déjà couvertes par une règle.
 */
export function regleManquante(messages: readonly { at: Instant; question: string }[], repondues: readonly string[], maintenant: Instant): { question: string; n: number } | null {
  const debut = ms(maintenant) - FENETRE_DE_PROPOSITION_JOURS * 86_400_000;
  const c = new Map<string, number>();
  for (const m of messages) if (ms(m.at) >= debut && ms(m.at) <= ms(maintenant)) c.set(aplatir(m.question), (c.get(aplatir(m.question)) ?? 0) + 1);
  const couvertes = new Set(repondues.map(aplatir));
  const meilleur = [...c].filter(([q, n]) => n >= MESSAGES_POUR_PROPOSER && !couvertes.has(q)).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];
  return meilleur ? { question: meilleur[0], n: meilleur[1] } : null;
}


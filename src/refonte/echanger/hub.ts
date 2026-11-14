import { jourDe, ms, partiesParis, instantParis, MS_MINUTE, MS_HEURE, type Instant } from './commun';
import { aRepondre, attente, type Fil, type Horaires, type MessageDeFil } from './boite';

/**
 * ÉCHANGER, VUE D'ENSEMBLE (F40) — la règle d'attente, les canaux actifs, les cases du jour, les dix tuiles.
 * Logique pure. Le hub ne contient aucune donnée propre : il lit G07, MX01, MX04 et les autres.
 *
 * Présence « lit / écrit » : une information d'aide, jamais un suivi d'activité par personne. Aucune fonction d'ici
 * ne garde d'historique ; elles ne répondent que pour l'instant présent.
 */

/* ------------------------------ La règle d'attente ------------------------------ */

/** L'axe de la règle : 3 heures de bout en bout (mesuré sur l'image v4 : 15 min, 30 min, 1 h, 2 h et 3 h tombent aux rangs √(t/3 h) ; l'échelle est en racine carrée, F40 pièges). */
export const ECHELLE_REGLE_MS = 3 * MS_HEURE;

export interface ClientSurLaRegle {
  filId: string;
  /** 0 (vient d'écrire) à 1 (attend depuis l'extrémité de l'axe). Racine carrée : sinon les attentes courtes se superposent. */
  position: number;
  attenteMs: number;
  /** Au-delà de la promesse : orange, jamais rouge. */
  orange: boolean;
}

export function regleDAttente(fils: readonly Fil[], maintenant: Instant, options: { echelleMs?: number; promesseMinutes?: number; horaires?: Horaires } = {}): { clients: ClientSurLaRegle[]; nombre: number; personneNAttend: boolean } {
  const echelle = options.echelleMs ?? ECHELLE_REGLE_MS;
  const clients = aRepondre(fils).map((f): ClientSurLaRegle => {
    const a = attente(f, maintenant, options);
    const msAttente = a ? a.ms : 0;
    return { filId: f.filId, position: Math.sqrt(Math.min(msAttente, echelle) / echelle), attenteMs: msAttente, orange: !!a?.depasse };
  });
  return { clients: clients.sort((x, y) => x.position - y.position || x.filId.localeCompare(y.filId)), nombre: clients.length, personneNAttend: clients.length === 0 };
}

export type EtatDePresence = { etat: 'lit' | 'ecrit'; par: string } | { etat: 'personne' };

/** « lit » : un membre a ouvert la conversation ; « écrit » : un brouillon est en cours ; sinon « personne dessus ». */
export function presenceDuFil(ouvertePar: readonly string[], brouillonPar: readonly string[]): EtatDePresence {
  if (brouillonPar.length) return { etat: 'ecrit', par: brouillonPar[0] };
  if (ouvertePar.length) return { etat: 'lit', par: ouvertePar[0] };
  return { etat: 'personne' };
}

/* ------------------------------ Les canaux actifs ------------------------------ */

export const FENETRE_CANAL_ACTIF_MS = 2 * MS_HEURE;
export const TRANCHE_MS = 5 * MS_MINUTE;
export const BARRE_MAX = 4;
/** Nombre de tranches de 5 minutes dessinées : une heure (Proposition). */
export const TRANCHES_PAR_DEFAUT = 12;

export interface CanalMin {
  id: string;
  nom: string;
}
export interface MessageDeCanal {
  canalId: string;
  at: Instant;
}

export interface LigneDeCanal {
  id: string;
  nom: string;
  actif: boolean;
  /** Un message par tranche de 5 min, plafonné à 4, de la plus ancienne à la plus récente. */
  barres: number[];
  dernierAt: number | null;
  attendent: number;
}

/**
 * Canaux et boîtes avec au moins un message dans les 2 dernières heures, les plus récents d'abord ; puis les
 * autres en « calme ». `attendentParCanal` : messages de la file « À répondre » sur ce canal (« 2 attendent »).
 */
export function canauxActifs(canaux: readonly CanalMin[], messages: readonly MessageDeCanal[], maintenant: Instant, attendentParCanal: Readonly<Record<string, number>> = {}, tranches = TRANCHES_PAR_DEFAUT): LigneDeCanal[] {
  const t = ms(maintenant);
  const lignes = canaux.map((c): LigneDeCanal => {
    const siens = messages.filter((m) => m.canalId === c.id && ms(m.at) <= t);
    const barres = Array<number>(tranches).fill(0);
    for (const m of siens) {
      const age = t - ms(m.at);
      const i = tranches - 1 - Math.floor(age / TRANCHE_MS);
      if (i >= 0) barres[i] = Math.min(BARRE_MAX, barres[i] + 1);
    }
    const dernierAt = siens.length ? Math.max(...siens.map((m) => ms(m.at))) : null;
    return { id: c.id, nom: c.nom, actif: dernierAt !== null && t - dernierAt <= FENETRE_CANAL_ACTIF_MS, barres, dernierAt, attendent: attendentParCanal[c.id] ?? 0 };
  });
  return lignes.sort((a, b) => Number(b.actif) - Number(a.actif) || (b.dernierAt ?? 0) - (a.dernierAt ?? 0) || a.nom.localeCompare(b.nom));
}

/** « 34 messages depuis 8 h » : tous canaux confondus, depuis `heureMin` (minutes depuis minuit, heure de Paris) aujourd'hui. */
export function messagesDepuis(messages: readonly { at: Instant }[], maintenant: Instant, heureMin = 8 * 60): number {
  const debut = instantParis(jourDe(maintenant), heureMin);
  return messages.filter((m) => ms(m.at) >= debut && ms(m.at) <= ms(maintenant)).length;
}

export const MESSAGES_POUR_RESUMER = 20;
export const CANAUX_POUR_RESUMER = 3;
/** « Je te résume la matinée en 5 lignes ? » : plus de 20 messages depuis 8 h et au moins 3 canaux actifs. */
export const proposerResume = (messagesDepuis8h: number, canauxActifsNb: number): boolean => messagesDepuis8h > MESSAGES_POUR_RESUMER && canauxActifsNb >= CANAUX_POUR_RESUMER;

/* ------------------------------ Les cases du jour ------------------------------ */

export interface CaseDuJour {
  genre: 'repondre' | 'archiver';
  /** Le fil à répondre (`repondre`), ou le nombre de messages lus à archiver (`archiver`). */
  filId?: string;
  n?: number;
  fait: boolean;
}

/**
 * Deux cases « Répondre à … » (les plus anciens de la file) et une « Archiver N messages lus ». Elles se cochent
 * seules quand l'action est faite : `repondusIds` = fils répondus depuis le début de la journée.
 */
export function casesDuJour(fils: readonly Fil[], repondusIds: readonly string[], lusNonArchives: number, archivesAujourdhui: number): CaseDuJour[] {
  const file = aRepondre(fils).map((f) => f.filId);
  const choisis = [...new Set([...repondusIds, ...file])].slice(0, 2);
  const cases: CaseDuJour[] = choisis.map((filId) => ({ genre: 'repondre', filId, fait: repondusIds.includes(filId) && !file.includes(filId) }));
  const aArchiver = lusNonArchives > 0 ? lusNonArchives : archivesAujourdhui;
  return [...cases, { genre: 'archiver', n: aArchiver, fait: lusNonArchives === 0 }];
}

/* ------------------------------ Les dix tuiles ------------------------------ */

/**
 * Les dix modules d'Échanger, dans l'ordre de la fiche. Le dixième, « Messages programmés », porte un nom PROPOSÉ
 * (F40 §2) : il lit les envois programmés de MX01.
 */
export const MODULES_D_ECHANGER = [
  { cle: 'messagerie', ecran: 'G07', vue: null },
  { cle: 'courriel', ecran: 'MX01', vue: null },
  { cle: 'canaux', ecran: 'MX04', vue: 'groups' },
  { cle: 'appels', ecran: 'H13', vue: 'calls' },
  { cle: 'reunions', ecran: 'MX02', vue: 'meetings' },
  { cle: 'annonces', ecran: 'H14', vue: 'announcements' },
  { cle: 'partages', ecran: 'MX03', vue: null },
  { cle: 'sondages', ecran: 'MX05', vue: 'polls' },
  { cle: 'reponsesAuto', ecran: 'MX06', vue: null },
  { cle: 'programmes', ecran: 'MX01', vue: null },
] as const;
export type ModuleDEchanger = (typeof MODULES_D_ECHANGER)[number]['cle'];

export interface MesuresDEchanger {
  aRepondre: number;
  /** Courriels non lus. */
  courrielsNonLus: number;
  /** Quelqu'un lit ou écrit dans la boîte partagée : « … lit … ». */
  courrielPresence?: string | null;
  canauxNonLus: number;
  /** Canaux ayant des messages non lus à voir. */
  canauxAvecNonLus: number;
  appelsEnCours: number;
  reunionsAujourdhui: number;
  annoncesAConfirmer: number;
  partagesActifs: number;
  sondagesEnCours: number;
  reglesActives: number;
  reglesTotal: number;
  envoisProgrammes: number;
  /** Détails des tuiles (image v4) : tous facultatifs, la tuile retombe sur son nombre sans eux. */
  reunionsSemaine?: number;
  reunionsSemaineMinutes?: number;
  envoisAutoDuMois?: number;
  prochainEnvoiProgramme?: Instant | null;
  canauxTotal?: number;
  liensTousProteges?: boolean;
}

export type TonDeTuile = 'neutre' | 'orange';
export interface TuileDEchange {
  cle: ModuleDEchanger;
  nombres: number[];
  /** Orange quand une action est attendue de la personne. */
  ton: TonDeTuile;
  /** Pastille de compte, seulement si > 0. */
  pastille: number | null;
  /** Ce que la tuile ajoute à son nombre : « 6 cette semaine · 4 h », « 148 envoyées ce mois », « partent lundi 9:00 »… */
  detail?: { semaine?: number; minutes?: number; envoisDuMois?: number; prochainEnvoi?: Instant; canauxTotal?: number; tousProteges?: boolean };
}

export function tuilesDuHub(m: MesuresDEchanger, actifs: ReadonlySet<ModuleDEchanger> | null = null): TuileDEchange[] {
  const t = (cle: ModuleDEchanger, nombres: number[], action = 0, detail?: TuileDEchange['detail']): TuileDEchange => ({
    cle,
    nombres,
    ton: action > 0 ? 'orange' : 'neutre',
    pastille: action > 0 ? action : null,
    ...(detail && Object.keys(detail).length ? { detail } : {}),
  });
  const sans = (o: Record<string, number | string | boolean | null | undefined>): NonNullable<TuileDEchange['detail']> => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null)) as NonNullable<TuileDEchange['detail']>;
  const toutes = [
    t('messagerie', [m.aRepondre], m.aRepondre),
    t('courriel', [m.courrielsNonLus], m.courrielsNonLus),
    t('canaux', [m.canauxNonLus], 0, sans({ canauxTotal: m.canauxTotal })),
    t('appels', [m.appelsEnCours]),
    t('reunions', [m.reunionsAujourdhui], 0, sans({ semaine: m.reunionsSemaine, minutes: m.reunionsSemaineMinutes })),
    t('annonces', [m.annoncesAConfirmer], m.annoncesAConfirmer),
    t('partages', [m.partagesActifs], 0, sans({ tousProteges: m.liensTousProteges })),
    t('sondages', [m.sondagesEnCours]),
    t('reponsesAuto', [m.reglesActives, m.reglesTotal], 0, sans({ envoisDuMois: m.envoisAutoDuMois })),
    t('programmes', [m.envoisProgrammes], 0, sans({ prochainEnvoi: m.prochainEnvoiProgramme })),
  ];
  return actifs ? toutes.filter((x) => actifs.has(x.cle)) : toutes;
}

/** « Bonjour » avant 18 h, « Bonsoir » ensuite (heure de Paris). */
export const salutation = (maintenant: Instant): 'bonjour' | 'bonsoir' => (partiesParis(maintenant).minutes >= 18 * 60 ? 'bonsoir' : 'bonjour');

/** Les messages d'un jour donné, tous canaux confondus. */
export const messagesDuJour = (messages: readonly Pick<MessageDeFil, 'at'>[], jour: string): number => messages.filter((m) => jourDe(m.at) === jour).length;

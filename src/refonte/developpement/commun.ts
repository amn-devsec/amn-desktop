/**
 * LOT-11 · ESPACE DÉVELOPPEMENT — aides communes (logique pure, sans React).
 *
 * Rien ici ne lit l'horloge : « maintenant » est toujours passé en paramètre, pour
 * qu'un test, une capture et un écran voient le même monde. Les instants sont des
 * millisecondes (ou des chaînes ISO, converties par `ms`) ; les jours sont des
 * chaînes `AAAA-MM-JJ` du calendrier de Paris, heure d'été et d'hiver comprises.
 *
 * Fiches : `docs/refonte/fiches/LOT-11/` (rubrique 6 de chaque écran).
 */

export type Langue = 'fr' | 'en';
/** Un instant : millisecondes depuis l'époque, ou chaîne ISO. */
export type Instant = number | string;
/** Un jour du calendrier de Paris, `AAAA-MM-JJ`. */
export type Jour = string;

export const MS_MINUTE = 60_000;
export const MS_HEURE = 3_600_000;
export const MS_JOUR = 86_400_000;
/** Espace insécable : devant `%`, `€`, `s`, `min`, `h`. */
export const INSECABLE = ' ';

export function ms(i: Instant): number {
  const v = typeof i === 'number' ? i : Date.parse(i);
  if (!Number.isFinite(v)) throw new Error(`instant illisible : ${String(i)}`);
  return v;
}

/* ------------------------------ Heure de Paris ------------------------------ */

const FORMAT_PARIS = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Paris',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export interface PartiesParis {
  jour: Jour;
  /** Minutes depuis minuit, heure de Paris (0 à 1439). */
  minutes: number;
  /** 1 = lundi … 7 = dimanche (ISO 8601). */
  jourSemaine: number;
}

/** L'heure murale de Paris d'un instant. */
export function partiesParis(i: Instant): PartiesParis {
  const p: Record<string, string> = {};
  for (const x of FORMAT_PARIS.formatToParts(new Date(ms(i)))) p[x.type] = x.value;
  const jour = `${p.year}-${p.month}-${p.day}`;
  return { jour, minutes: Number(p.hour) * 60 + Number(p.minute), jourSemaine: jourSemaineIso(jour) };
}

const versUtc = (j: Jour): number => {
  const [a, m, d] = j.split('-').map(Number);
  return Date.UTC(a, m - 1, d);
};

/** 1 = lundi … 7 = dimanche. */
export function jourSemaineIso(j: Jour): number {
  const d = new Date(versUtc(j)).getUTCDay();
  return d === 0 ? 7 : d;
}
export const ajouterJours = (j: Jour, n: number): Jour => new Date(versUtc(j) + n * MS_JOUR).toISOString().slice(0, 10);
export const ecartJours = (de: Jour, a: Jour): number => Math.round((versUtc(a) - versUtc(de)) / MS_JOUR);
export const lundiDe = (j: Jour): Jour => ajouterJours(j, 1 - jourSemaineIso(j));
export const debutDeMois = (j: Jour): Jour => `${j.slice(0, 7)}-01`;

/** Décalage de Paris sur UTC à cet instant, en minutes (60 l'hiver, 120 l'été). */
function decalageParis(t: number): number {
  const p = partiesParis(t);
  const mural = versUtc(p.jour) + p.minutes * MS_MINUTE;
  return Math.round((mural - Math.floor(t / MS_MINUTE) * MS_MINUTE) / MS_MINUTE);
}

/**
 * L'instant où il est `minutes` (depuis minuit) le `jour` donné, à Paris.
 * Heure qui n'existe pas (passage à l'heure d'été, 02:30) : décalée d'une heure (03:30).
 * Heure qui existe deux fois (passage à l'heure d'hiver) : la première.
 */
export function instantParis(jour: Jour, minutes: number): number {
  const mural = versUtc(jour) + minutes * MS_MINUTE;
  let t = mural - decalageParis(mural) * MS_MINUTE;
  const d2 = decalageParis(t);
  t = mural - d2 * MS_MINUTE;
  const plusTot = t - MS_HEURE;
  const voulu = (x: number) => {
    const p = partiesParis(x);
    return p.jour === jour && p.minutes === minutes;
  };
  return voulu(plusTot) ? plusTot : t;
}

/** Le début du jour de Paris qui contient l'instant. */
export const debutDuJourParis = (i: Instant): number => instantParis(partiesParis(i).jour, 0);
/** Lundi 00:00, heure de Paris, de la semaine qui contient l'instant. */
export const debutDeSemaineParis = (i: Instant): number => instantParis(lundiDe(partiesParis(i).jour), 0);
/** Le 1er du mois à 00:00, heure de Paris, du mois qui contient l'instant. */
export const debutDuMoisParis = (i: Instant): number => instantParis(debutDeMois(partiesParis(i).jour), 0);

export const hhmm = (minutes: number): string => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

/** « 08:00 » → 480. Refuse ce qui n'est pas une heure valide. */
export function lireHeure(h: string): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(h.trim());
  if (!m) throw new Error(`heure illisible : ${h}`);
  const heures = Number(m[1]);
  const min = Number(m[2]);
  if (heures > 23 || min > 59) throw new Error(`heure hors bornes : ${h}`);
  return heures * 60 + min;
}

/* ------------------------------ Mises en forme ------------------------------ */

const JOURS_COURTS: Record<Langue, readonly string[]> = {
  fr: ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'],
  en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
};
const JOURS_LONGS: Record<Langue, readonly string[]> = {
  fr: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'],
  en: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
};
const MOIS_COURTS: Record<Langue, readonly string[]> = {
  fr: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

export const jourCourt = (iso: number, langue: Langue = 'fr'): string => JOURS_COURTS[langue][iso - 1];
export const jourLong = (iso: number, langue: Langue = 'fr'): string => JOURS_LONGS[langue][iso - 1];
export const moisCourt = (j: Jour, langue: Langue = 'fr'): string => MOIS_COURTS[langue][Number(j.slice(5, 7)) - 1];

/** « jeu. 12 » (« Prochaines versions »). */
export function dateCourte(i: Instant, langue: Langue = 'fr'): string {
  const p = partiesParis(i);
  return `${jourCourt(p.jourSemaine, langue)} ${Number(p.jour.slice(8))}`;
}

/** « jeu. 12, 18:00 » (« Planifiés »). */
export function dateEtHeure(i: Instant, langue: Langue = 'fr'): string {
  const p = partiesParis(i);
  return `${dateCourte(i, langue)}, ${hhmm(p.minutes)}`;
}

/** « 27 oct. » (repères des histogrammes). */
export const jourEtMois = (j: Jour, langue: Langue = 'fr'): string => `${Number(j.slice(8))} ${moisCourt(j, langue)}`;

/**
 * Une durée de déploiement ou d'exécution : « 3 s », « 48 s », « 1 min 02 », « 12 min », « 1 h 05 ».
 * Arrondie à la seconde ; une durée négative ou illisible donne « — ».
 */
export function formaterDuree(duree: number): string {
  if (!Number.isFinite(duree) || duree < 0) return '—';
  const s = Math.round(duree / 1000);
  if (s < 60) return `${s}${INSECABLE}s`;
  const min = Math.floor(s / 60);
  const reste = s % 60;
  if (min < 10) return `${min}${INSECABLE}min ${String(reste).padStart(2, '0')}`;
  if (min < 60) return `${min}${INSECABLE}min`;
  const h = Math.floor(min / 60);
  return `${h}${INSECABLE}h ${String(min % 60).padStart(2, '0')}`;
}

/**
 * « Quand » d'une ligne d'historique : « à l'instant », « il y a 12 min », « il y a 3 h »
 * (moins de 24 h), puis « hier 18:20 », puis « lun. 9 » (cette année : jour et date).
 */
export function quandRelatif(i: Instant, maintenant: Instant, langue: Langue = 'fr'): string {
  const t = ms(i);
  const m = ms(maintenant);
  const ecart = m - t;
  const fr = langue === 'fr';
  if (ecart < MS_MINUTE) return fr ? 'à l’instant' : 'just now';
  if (ecart < MS_HEURE) return fr ? `il y a ${Math.floor(ecart / MS_MINUTE)}${INSECABLE}min` : `${Math.floor(ecart / MS_MINUTE)} min ago`;
  const jt = partiesParis(t);
  const jm = partiesParis(m);
  const jours = ecartJours(jt.jour, jm.jour);
  if (ecart < MS_JOUR && jours === 0) return fr ? `il y a ${Math.floor(ecart / MS_HEURE)}${INSECABLE}h` : `${Math.floor(ecart / MS_HEURE)} h ago`;
  if (jours <= 1) return `${fr ? 'hier' : 'yesterday'} ${hhmm(jt.minutes)}`;
  return dateCourte(t, langue);
}

/**
 * L'âge court d'une version en ligne (« En ligne maintenant ») : « 3 h », « hier », « lun. »,
 * puis « 12 oct. » au-delà d'une semaine.
 */
export function ageCourt(i: Instant, maintenant: Instant, langue: Langue = 'fr'): string {
  const t = ms(i);
  const m = ms(maintenant);
  const jt = partiesParis(t);
  const jours = ecartJours(jt.jour, partiesParis(m).jour);
  if (jours <= 0) {
    const h = Math.floor((m - t) / MS_HEURE);
    return h < 1 ? `${Math.max(0, Math.floor((m - t) / MS_MINUTE))}${INSECABLE}min` : `${h}${INSECABLE}h`;
  }
  if (jours === 1) return langue === 'fr' ? 'hier' : 'yesterday';
  if (jours < 7) return jourCourt(jt.jourSemaine, langue);
  return jourEtMois(jt.jour, langue);
}

/* ------------------------------ Secrets ------------------------------ */

/** Le masque affiché à la place d'une valeur secrète. */
export const MASQUE = '••••';

const NOMS_SECRETS = String.raw`(?:token|jeton|secret|password|passwd|mot de passe|mdp|api[_-]?key|cl[ée](?: d['’]api)?|key|authorization)`;
const MOTIFS_SECRETS: readonly RegExp[] = [
  // « Bearer <valeur> », « Basic <valeur> »
  /\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]{8,}/gi,
  // « token=<valeur> », « clé : <valeur> », « API_KEY="<valeur>" »
  new RegExp(String.raw`\b(${NOMS_SECRETS}\w*)(\s*[:=]\s*)(?!(?:Bearer|Basic)\b)(["']?)[^\s"',;]{4,}\3`, 'gi'),
  // identifiants d'accès dans une adresse : « //nom:<valeur>@ »
  /(\/\/[^/\s:@]+:)[^@\s/]+@/g,
  // une longue suite opaque (40 caractères ou plus, lettres et chiffres mêlés)
  /\b(?=[A-Za-z0-9_-]*\d)(?=[A-Za-z0-9_-]*[A-Za-z])[A-Za-z0-9_-]{40,}\b/g,
];

/**
 * Remplace dans un texte de journal tout ce qui ressemble à une valeur secrète par `••••`.
 * Ceinture de sécurité : un journal ne doit jamais recevoir de secret, mais s'il en reçoit
 * un, il ne l'affiche ni ne le garde.
 */
export function masquerSecrets(texte: string): string {
  let t = texte;
  t = t.replace(MOTIFS_SECRETS[0], (_m, schema: string) => `${schema} ${MASQUE}`);
  t = t.replace(MOTIFS_SECRETS[1], (_m, nom: string, sep: string) => `${nom}${sep}${MASQUE}`);
  t = t.replace(MOTIFS_SECRETS[2], (_m, debut: string) => `${debut}${MASQUE}@`);
  t = t.replace(MOTIFS_SECRETS[3], MASQUE);
  return t;
}

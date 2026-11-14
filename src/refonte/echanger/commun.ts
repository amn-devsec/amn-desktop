/**
 * LOT-05 · ÉCHANGER — aides communes (logique pure, sans React).
 *
 * Rien ici ne lit l'horloge : « maintenant » est toujours passé en paramètre, pour
 * qu'un test, une capture et un écran voient le même monde. Les instants sont des
 * millisecondes (ou des chaînes ISO) ; les jours sont des chaînes `AAAA-MM-JJ` du
 * calendrier de Paris, heure d'été et d'hiver comprises.
 *
 * Fiches : `lots/LOT-05-echanger/` du dossier v4 (rubrique 6 de chaque écran).
 */

export type Langue = 'fr' | 'en';
/** Un instant : millisecondes depuis l'époque, ou chaîne ISO. */
export type Instant = number | string;
/** Un jour du calendrier de Paris, `AAAA-MM-JJ`. */
export type Jour = string;

export const MS_SECONDE = 1000;
export const MS_MINUTE = 60_000;
export const MS_HEURE = 3_600_000;
export const MS_JOUR = 86_400_000;
/** Espace insécable : devant `%`, `€`, `s`, `min`, `Go` et entre les milliers. */
export const INSECABLE = ' ';

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

/** Le jour de Paris d'un instant. */
export const jourDe = (i: Instant): Jour => partiesParis(i).jour;
/** 1 = lundi … 7 = dimanche. */
export function jourSemaineIso(j: Jour): number {
  const d = new Date(versUtc(j)).getUTCDay();
  return d === 0 ? 7 : d;
}
export const ajouterJours = (j: Jour, n: number): Jour => new Date(versUtc(j) + n * MS_JOUR).toISOString().slice(0, 10);
export const ecartJours = (de: Jour, a: Jour): number => Math.round((versUtc(a) - versUtc(de)) / MS_JOUR);
export const lundiDe = (j: Jour): Jour => ajouterJours(j, 1 - jourSemaineIso(j));
export const debutDeMois = (j: Jour): Jour => `${j.slice(0, 7)}-01`;
export const joursDuMois = (j: Jour): number => new Date(Date.UTC(Number(j.slice(0, 4)), Number(j.slice(5, 7)), 0)).getUTCDate();

/** Le même quantième un mois plus tôt ; le dernier jour du mois précédent si le quantième n'existe pas (30 mars → 28 févr.). */
export function moisPrecedent(j: Jour): Jour {
  const a = Number(j.slice(0, 4));
  const m = Number(j.slice(5, 7));
  const d = Number(j.slice(8, 10));
  const pm = m === 1 ? 12 : m - 1;
  const pa = m === 1 ? a - 1 : a;
  const dernier = new Date(Date.UTC(pa, pm, 0)).getUTCDate();
  return `${String(pa).padStart(4, '0')}-${String(pm).padStart(2, '0')}-${String(Math.min(d, dernier)).padStart(2, '0')}`;
}

/* ------------------------------ Mises en forme ------------------------------ */

const clampe = (x: number, min: number, max: number) => Math.min(max, Math.max(min, x));
export const plafonner = (x: number, max = 1): number => clampe(x, 0, max);
/** Rapport entier en %, arrondi, borné à [0, 100] ; 0 quand le total est nul. */
export const pourcent = (n: number, total: number): number => (total <= 0 ? 0 : Math.round(clampe((n / total) * 100, 0, 100)));

/** « 1 482 » en français (espace insécable), « 1,482 » en anglais. */
export function nombre(n: number, langue: Langue = 'fr'): string {
  const [ent, dec] = Math.abs(n).toString().split('.');
  const groupes = ent.replace(/\B(?=(\d{3})+(?!\d))/g, langue === 'fr' ? INSECABLE : ',');
  const signe = n < 0 ? '-' : '';
  return `${signe}${groupes}${dec ? (langue === 'fr' ? ',' : '.') + dec : ''}`;
}

/** « 12 % » en français (espace insécable avant le %), « 12% » en anglais. */
export const pct = (n: number, langue: Langue = 'fr'): string => `${nombre(n, langue)}${langue === 'fr' ? INSECABLE : ''}%`;

/** Taille lisible : « 2,1 Go », « 840 Mo », « 12 Ko ». Base décimale, une décimale au plus. */
export function tailleLisible(octets: number, langue: Langue = 'fr'): string {
  const unites = langue === 'fr' ? ['o', 'Ko', 'Mo', 'Go', 'To'] : ['B', 'KB', 'MB', 'GB', 'TB'];
  let v = octets;
  let u = 0;
  while (v >= 1000 && u < unites.length - 1) {
    v /= 1000;
    u += 1;
  }
  const texte = u === 0 ? String(Math.round(v)) : (Math.round(v * 10) / 10).toString();
  const [e, d] = texte.split('.');
  return `${nombre(Number(e), langue)}${d ? (langue === 'fr' ? ',' : '.') + d : ''}${INSECABLE}${unites[u]}`;
}

/** Le mot est-il un mot ? Compte les mots d'un texte (séquences de lettres et chiffres, apostrophes comprises). */
export function compterMots(texte: string): number {
  const m = texte.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu);
  return m ? m.length : 0;
}

/** Sans accent, sans casse : « Tâche » et « ta » se rejoignent. */
export const aplatir = (t: string): string =>
  t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

/** Coupe à `max` caractères sur une limite de mot, avec « … ». */
export function couper(texte: string, max: number): string {
  if (texte.length <= max) return texte;
  const brut = texte.slice(0, max - 1);
  const dernierEspace = brut.lastIndexOf(' ');
  return `${(dernierEspace > max * 0.5 ? brut.slice(0, dernierEspace) : brut).trimEnd()}…`;
}

/** Écart-type d'échantillon (n − 1 au dénominateur ; 0 avec moins de deux valeurs). */
export function ecartType(valeurs: readonly number[]): number {
  if (valeurs.length < 2) return 0;
  const moy = valeurs.reduce((s, v) => s + v, 0) / valeurs.length;
  return Math.sqrt(valeurs.reduce((s, v) => s + (v - moy) ** 2, 0) / (valeurs.length - 1));
}

/* ------------------------------ Instants de Paris ------------------------------ */

/** Décalage de Paris sur UTC à cet instant, en minutes (60 l'hiver, 120 l'été). */
function decalageParis(t: number): number {
  const p = partiesParis(t);
  const mural = versUtc(p.jour) + p.minutes * MS_MINUTE;
  return Math.round((mural - Math.floor(t / MS_MINUTE) * MS_MINUTE) / MS_MINUTE);
}

/**
 * L'instant où il est `minutes` (depuis minuit) le `jour` donné, à Paris.
 * Heure qui n'existe pas (passage à l'heure d'été) : décalée d'une heure. Heure qui existe deux fois : la première.
 */
export function instantParis(jour: Jour, minutes: number): number {
  const mural = versUtc(jour) + minutes * MS_MINUTE;
  let t = mural - decalageParis(mural) * MS_MINUTE;
  t = mural - decalageParis(t) * MS_MINUTE;
  const plusTot = t - MS_HEURE;
  const p = partiesParis(plusTot);
  return p.jour === jour && p.minutes === minutes ? plusTot : t;
}

/** Jour ouvré : du lundi au vendredi. Les jours fériés ne sont pas connus ici (Proposition : réglage de l'entreprise). */
export const estJourOuvre = (j: Jour): boolean => jourSemaineIso(j) <= 5;

/** Ajoute des mois en gardant la fin de mois (31 oct. + 4 mois = 28 févr., pas 3 mars). Négatif pour reculer. */
export function ajouterMois(j: Jour, n: number): Jour {
  const total = Number(j.slice(0, 4)) * 12 + (Number(j.slice(5, 7)) - 1) + n;
  const a = Math.floor(total / 12);
  const m = (total % 12) + 1;
  const dernier = new Date(Date.UTC(a, m, 0)).getUTCDate();
  return `${String(a).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(Math.min(Number(j.slice(8, 10)), dernier)).padStart(2, '0')}`;
}

/** Mois (et jour) en toutes lettres : « avril », « 30 octobre » ; sans fuseau, depuis un `AAAA-MM-JJ`. */
const MOIS_LONGS: Record<Langue, readonly string[]> = {
  fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};
export function dateFr(j: Jour, langue: Langue = 'fr', options: { mois?: boolean } = {}): string {
  const mois = MOIS_LONGS[langue][Number(j.slice(5, 7)) - 1];
  return options.mois ? mois : langue === 'fr' ? `${Number(j.slice(8, 10))} ${mois}` : `${mois} ${Number(j.slice(8, 10))}`;
}

/* ------------------------------ Durées d'attente et de communication ------------------------------ */

/**
 * Le temps qu'un client attend : « 6 min », « 1 h 05 », puis « hier » (G07 §6). Sous une minute : « 1 min ».
 * `hier` quand l'attente dépasse 24 h ET que le message date de la veille ; au-delà, la date courte.
 */
export function attenteLisible(msAttente: number, langue: Langue = 'fr'): string {
  const minutes = Math.max(1, Math.floor(msAttente / MS_MINUTE));
  if (minutes < 60) return `${minutes}${INSECABLE}min`;
  if (minutes < 24 * 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}${INSECABLE}h${INSECABLE}${String(m).padStart(2, '0')}`;
  }
  return langue === 'fr' ? 'hier' : 'yesterday';
}

/** Compteur d'appel : `mm:ss`, et `h:mm:ss` au-delà d'une heure (H13 §6). */
export function dureeDAppel(secondes: number): string {
  const s = Math.max(0, Math.floor(secondes));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const reste = s % 60;
  const deux = (x: number) => String(x).padStart(2, '0');
  return h > 0 ? `${h}:${deux(m)}:${deux(reste)}` : `${deux(m)}:${deux(reste)}`;
}

/** Minutes entières écoulées, jamais négatives. */
export const minutesEcoulees = (depuis: Instant, maintenant: Instant): number => Math.max(0, Math.floor((ms(maintenant) - ms(depuis)) / MS_MINUTE));

/** Rapport borné, entier en %, sans NaN : 0 quand le total est nul. */
export const rapportEnPourcent = pourcent;

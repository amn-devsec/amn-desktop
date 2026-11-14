import { aplatir, couper, MS_SECONDE, ms, type Instant, type Jour } from './commun';

/**
 * NOTES ET PAGES (H10) et la pile « Pages récentes » de F20 — logique pure.
 *
 * Formes d'entrée minimales : l'écran branché sur les données réelles (`PageData` dans
 * `src/shared/api.ts`, `useNotes`) traduit vers elles ; les jeux fictifs de SIM
 * (`Page`, `Bloc`) les satisfont déjà. Aucun nom de la maquette n'est écrit ici.
 */

export interface BlocPage {
  type: 'titre' | 'texte' | 'tache' | 'liste' | 'citation' | 'decision';
  texte: string;
  fait?: boolean;
  /** Échéance d'un bloc tâche. Absente : « sans date ». */
  echeance?: Jour | null;
  /** Identifiants des pages vers lesquelles ce bloc fait un lien. */
  liens?: readonly string[];
}

export interface PageMin {
  id: string;
  title: string;
  /** Dossier parent (null à la racine). */
  parentId: string | null;
  espace: 'Clients' | 'Équipe' | 'Modèles' | 'Personnel';
  clientId: number | string | null;
  blocs: readonly BlocPage[];
  auteurEmail: string;
  contributeurs: readonly string[];
  modifieAt: Instant;
  modifieParEmail: string;
  favorisDe: readonly string[];
  supprimeeLe?: Jour | null;
  /** Dernière ouverture par la personne connectée, si connue. */
  ouverteAt?: Instant | null;
}

/* ------------------------------ Pages récentes (F20) ------------------------------ */

export type FiltreDePages = 'toutes' | 'miennes' | 'partagees';
export const NB_PAGES_RECENTES = 5;

/** « Les miennes » : créées par moi. « Partagées » : où un autre membre a écrit. */
export function estMienne(p: PageMin, moi: string): boolean {
  return p.auteurEmail === moi;
}
export function estPartagee(p: PageMin, moi: string): boolean {
  return p.contributeurs.some((c) => c !== moi) || p.modifieParEmail !== moi;
}

/** Quand la personne a touché la page pour la dernière fois (ouverture ou modification). */
const activite = (p: PageMin): number => Math.max(ms(p.modifieAt), p.ouverteAt ? ms(p.ouverteAt) : 0);

/**
 * Les 5 dernières pages ouvertes ou modifiées, la plus récente en tête (la « feuille du dessus »).
 * Hors corbeille. Un invité ne voit que les pages partagées avec lui (`seulementPartagees`).
 */
export function pagesRecentes(pages: readonly PageMin[], moi: string, filtre: FiltreDePages = 'toutes', options: { seulementPartagees?: boolean } = {}): PageMin[] {
  const garde = (p: PageMin) => {
    if (p.supprimeeLe) return false;
    if (options.seulementPartagees && !estPartagee(p, moi)) return false;
    if (filtre === 'miennes') return estMienne(p, moi);
    if (filtre === 'partagees') return estPartagee(p, moi);
    return true;
  };
  return pages
    .filter(garde)
    .sort((a, b) => activite(b) - activite(a) || a.id.localeCompare(b.id))
    .slice(0, NB_PAGES_RECENTES);
}

/** Le curseur d'un collègue n'existe que s'il a tapé il y a moins de 10 secondes (H10, Proposition). */
export const DELAI_PRESENCE_MS = 10 * MS_SECONDE;

export interface Presence {
  email: string;
  tapeA: Instant;
}

/** Les membres (autres que moi) qui écrivent sur la page maintenant. */
export function coAuteursPresents(presences: readonly Presence[], moi: string, maintenant: Instant): string[] {
  const t = ms(maintenant);
  const vus = new Set<string>();
  for (const p of presences) {
    if (p.email !== moi && t - ms(p.tapeA) <= DELAI_PRESENCE_MS && t - ms(p.tapeA) >= 0) vus.add(p.email);
  }
  return [...vus];
}

/* ------------------------------ L'arborescence (H10) ------------------------------ */

export interface CompteursArborescence {
  /** Pages favorites de la personne. */
  favoris: PageMin[];
  /** Pages par client (à tous niveaux, hors corbeille). */
  parClient: Map<string, number>;
  equipe: number;
  modeles: number;
}

/** Les pages contenues dans un dossier, à tous niveaux (le dossier lui-même non compté). */
export function descendants(pages: readonly PageMin[], dossierId: string): PageMin[] {
  const enfants = new Map<string, PageMin[]>();
  for (const p of pages) {
    if (p.supprimeeLe || p.parentId === null) continue;
    enfants.set(p.parentId, [...(enfants.get(p.parentId) ?? []), p]);
  }
  const out: PageMin[] = [];
  const pile = [...(enfants.get(dossierId) ?? [])];
  while (pile.length) {
    const p = pile.pop() as PageMin;
    out.push(p);
    pile.push(...(enfants.get(p.id) ?? []));
  }
  return out;
}

export function compteursArborescence(pages: readonly PageMin[], moi: string): CompteursArborescence {
  const vivantes = pages.filter((p) => !p.supprimeeLe);
  const parClient = new Map<string, number>();
  for (const p of vivantes) {
    if (p.espace === 'Clients' && p.clientId !== null) parClient.set(String(p.clientId), (parClient.get(String(p.clientId)) ?? 0) + 1);
  }
  return {
    favoris: vivantes.filter((p) => p.favorisDe.includes(moi)),
    parClient,
    equipe: vivantes.filter((p) => p.espace === 'Équipe').length,
    modeles: vivantes.filter((p) => p.espace === 'Modèles').length,
  };
}

/* ------------------------------ Tâches, plan, liens retour ------------------------------ */

export interface SectionDeTaches {
  /** Titre de la section ; vide pour les blocs avant le premier titre. */
  titre: string;
  faites: number;
  total: number;
  /** Même rapport que la barre : faites / total en %. */
  pourcent: number;
  /** « 3 sur 3 » : le compteur passe en vert, sans confettis. */
  complete: boolean;
  /** Tâches non faites sans échéance : « sans date » en ambre, jamais en rouge (rien n'est en retard). */
  sansDate: number;
}

/** « 2 sur 3 » par section : du titre au titre suivant. Les sections sans tâche sont omises. */
export function sectionsDeTaches(blocs: readonly BlocPage[]): SectionDeTaches[] {
  const sections: SectionDeTaches[] = [];
  let courante: SectionDeTaches = { titre: '', faites: 0, total: 0, pourcent: 0, complete: false, sansDate: 0 };
  const clore = () => {
    if (courante.total > 0) {
      courante.pourcent = Math.round((courante.faites / courante.total) * 100);
      courante.complete = courante.faites === courante.total;
      sections.push(courante);
    }
  };
  for (const b of blocs) {
    if (b.type === 'titre') {
      clore();
      courante = { titre: b.texte, faites: 0, total: 0, pourcent: 0, complete: false, sansDate: 0 };
    } else if (b.type === 'tache') {
      courante.total += 1;
      if (b.fait) courante.faites += 1;
      else if (!b.echeance) courante.sansDate += 1;
    }
  }
  clore();
  return sections;
}

/** Le plan : les titres dans l'ordre. « 3 blocs titrés » = le nombre de titres. */
export function planDePage(blocs: readonly BlocPage[]): { titres: string[]; nombre: number } {
  const titres = blocs.filter((b) => b.type === 'titre' && b.texte.trim()).map((b) => b.texte.trim());
  return { titres, nombre: titres.length };
}

export interface LienRetour {
  pageId: string;
  titre: string;
  /** La phrase qui contient le lien, 60 caractères avant, coupée par « … ». */
  extrait: string;
  modifieAt: Instant;
}

export const EXTRAIT_AVANT = 60;
export const LIENS_VISIBLES = 3;

/** Le texte jusqu'au lien, borné à `EXTRAIT_AVANT` caractères avant sa fin. Le début coupé commence par « … ». */
export function extraitDeLien(texte: string): string {
  const phrase = texte.split(/(?<=[.!?])\s+/).find((s) => s.trim()) ?? texte;
  const propre = phrase.trim();
  return propre.length <= EXTRAIT_AVANT ? propre : `…${propre.slice(propre.length - EXTRAIT_AVANT).trimStart()}`;
}

/** Les pages qui citent celle-ci, la plus récente d'abord. Les liens d'une page vers elle-même sont ignorés. */
export function liensRetour(pageId: string, pages: readonly PageMin[]): { visibles: LienRetour[]; total: number } {
  const tous: LienRetour[] = [];
  for (const p of pages) {
    if (p.id === pageId || p.supprimeeLe) continue;
    const bloc = p.blocs.find((b) => b.liens?.includes(pageId));
    if (bloc) tous.push({ pageId: p.id, titre: p.title, extrait: extraitDeLien(bloc.texte), modifieAt: p.modifieAt });
  }
  tous.sort((a, b) => ms(b.modifieAt) - ms(a.modifieAt) || a.pageId.localeCompare(b.pageId));
  return { visibles: tous.slice(0, LIENS_VISIBLES), total: tous.length };
}

/* ------------------------------ Le menu « / » ------------------------------ */

export const BLOCS_DU_MENU = [
  'texte',
  'titre1',
  'titre2',
  'liste',
  'listeNumerotee',
  'tache',
  'tableau',
  'decision',
  'citation',
  'separateur',
  'image',
  'lienDePage',
] as const;
export type BlocDuMenu = (typeof BLOCS_DU_MENU)[number];

/**
 * ÉCART DE LA FICHE. H10 §6 annonce « 14 entrées, d'où « 2 sur 14 » » mais n'en liste que 13, dont
 * « Demander à Ajmani » (⌘J), qui n'est pas un bloc et reste affiché sous un filet quel que soit le filtre.
 * Ici : 12 blocs comptés, plus l'entrée Ajmani à part. La 14ᵉ entrée est une question pour le CO (note du lot).
 */
const LIBELLES_MENU: Record<BlocDuMenu, { fr: string; en: string }> = {
  texte: { fr: 'Texte', en: 'Text' },
  titre1: { fr: 'Titre 1', en: 'Heading 1' },
  titre2: { fr: 'Titre 2', en: 'Heading 2' },
  liste: { fr: 'Liste', en: 'Bulleted list' },
  listeNumerotee: { fr: 'Liste numérotée', en: 'Numbered list' },
  tache: { fr: 'Tâche', en: 'Task' },
  tableau: { fr: 'Tableau', en: 'Table' },
  decision: { fr: 'Décision', en: 'Decision' },
  citation: { fr: 'Citation', en: 'Quote' },
  separateur: { fr: 'Séparateur', en: 'Divider' },
  image: { fr: 'Image', en: 'Image' },
  lienDePage: { fr: 'Lien vers une page', en: 'Link to a page' },
};

/**
 * Le filtre du menu « / », sans accent ni casse, sur le début d'un mot : « ta » trouve « Tâche » et « Tableau ».
 * `sur` est le dénominateur de « 2 sur … » ; « Demander à Ajmani » n'est pas filtré : il suit toujours.
 */
export function filtrerMenu(saisie: string, langue: 'fr' | 'en' = 'fr'): { blocs: BlocDuMenu[]; sur: number; ajmani: true } {
  const q = aplatir(saisie.replace(/^\//, ''));
  // Le début d'un mot du libellé : « ta » trouve Tâche et Tableau, pas Citation.
  const blocs = BLOCS_DU_MENU.filter((b) => q === '' || aplatir(LIBELLES_MENU[b][langue]).split(/\s+/).some((mot) => mot.startsWith(q)));
  return { blocs, sur: BLOCS_DU_MENU.length, ajmani: true };
}

/** Le libellé d'un bloc du menu. */
export const libelleDeBloc = (b: BlocDuMenu, langue: 'fr' | 'en' = 'fr'): string => LIBELLES_MENU[b][langue];

/* ------------------------------ Enregistrement ------------------------------ */

/** Automatique 1 s après la dernière frappe, à chaque changement de bloc et à la fermeture (H10 §6, Proposition). */
export const DELAI_ENREGISTREMENT_MS = 1 * MS_SECONDE;

export type EtatEnregistrement =
  | { genre: 'modifiee'; avant: number }
  | { genre: 'enregistrement' }
  | { genre: 'enregistree'; avant: number }
  | { genre: 'non-enregistree' }
  | { genre: 'hors-ligne' };

export interface SuiviEnregistrement {
  derniereFrappe: Instant | null;
  dernierEnregistrement: Instant | null;
  enErreur?: boolean;
  horsLigne?: boolean;
}

/**
 * Le fil de la feuille : « Enregistrement… » puis « Enregistré il y a 3 s » (compteur vivant), puis
 * « Modifiée il y a 5 min par … » au-delà d'une minute. En erreur : « Non enregistré, réessai en cours »
 * (le texte reste dans la feuille et sur l'appareil). Hors ligne : gardé sur l'appareil.
 */
export function etatEnregistrement(s: SuiviEnregistrement, maintenant: Instant): EtatEnregistrement {
  const t = ms(maintenant);
  if (s.horsLigne) return { genre: 'hors-ligne' };
  if (s.enErreur) return { genre: 'non-enregistree' };
  const frappe = s.derniereFrappe === null ? null : ms(s.derniereFrappe);
  const sauve = s.dernierEnregistrement === null ? null : ms(s.dernierEnregistrement);
  if (frappe !== null && (sauve === null || frappe > sauve)) return { genre: 'enregistrement' };
  if (sauve === null) return { genre: 'modifiee', avant: 0 };
  const secondes = Math.max(0, Math.round((t - sauve) / MS_SECONDE));
  return secondes < 60 ? { genre: 'enregistree', avant: secondes } : { genre: 'modifiee', avant: secondes };
}

/** Faut-il enregistrer maintenant ? Une seconde après la dernière frappe. */
export const doitEnregistrer = (derniereFrappe: Instant, dernierEnregistrement: Instant | null, maintenant: Instant): boolean =>
  (dernierEnregistrement === null || ms(derniereFrappe) > ms(dernierEnregistrement)) && ms(maintenant) - ms(derniereFrappe) >= DELAI_ENREGISTREMENT_MS;

/* ------------------------------ Clés collées dans une note ------------------------------ */

/**
 * Un texte collé qui ressemble à une clé d'accès : avertissement discret (« Range-la dans le coffre-fort
 * plutôt que dans une note »), jamais bloquant. Une note ne contient jamais de clé : elles vivent dans le coffre-fort (H24).
 */
export function ressembleAUneCle(texte: string): boolean {
  if (/-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(texte)) return true;
  if (/\b(?:sk|pk|rk|ghp|gho|xox[abp]|AKIA)[-_A-Za-z0-9]{16,}\b/.test(texte)) return true;
  // Un long mot sans espace qui mêle lettres et chiffres (hors adresses et identifiants courts).
  return texte.split(/\s+/).some((m) => m.length >= 28 && !/^https?:/.test(m) && /[A-Za-z]/.test(m) && /\d/.test(m) && /^[A-Za-z0-9_\-+/=]+$/.test(m));
}

/* ------------------------------ La note épinglée d'un client (H41, G04) ------------------------------ */

export interface NoteDeClient {
  id: string;
  clientId: number | string | null;
  texte: string;
  epinglee: boolean;
  /** Quand elle a été épinglée (à défaut, modifiée). */
  epingleeAt?: Instant | null;
  modifieAt: Instant;
}

export const LONGUEUR_NOTE_EPINGLEE = 80;

/**
 * La note épinglée d'un client, lue par l'aperçu de la palette (H41) et la fiche client (G04) :
 * la plus récemment épinglée, une seule, coupée à 80 caractères. `null` s'il n'y en a pas.
 * C'est la source que demande H41 ; la note elle-même reste une note de ce lot.
 */
export function noteEpingleeDuClient(notes: readonly NoteDeClient[], clientId: number | string): { id: string; texte: string } | null {
  const candidates = notes.filter((n) => n.epinglee && n.clientId !== null && String(n.clientId) === String(clientId));
  if (!candidates.length) return null;
  const date = (n: NoteDeClient) => ms(n.epingleeAt ?? n.modifieAt);
  const n = candidates.sort((a, b) => date(b) - date(a) || a.id.localeCompare(b.id))[0];
  return { id: n.id, texte: couper(n.texte.replace(/\s+/g, ' ').trim(), LONGUEUR_NOTE_EPINGLEE) };
}

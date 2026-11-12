import { modeDeCategorie } from './cycle';
import type { CategorieId, ConnecteurInstance } from './types';
import type { AutomationData, Declencheur } from '../../state/useAutomations';

/**
 * LE FORMAT DES FLUX (DEV-editeur) — des blocs Quand / Si / Alors, chacun en
 * mode Local (gratuit) ou API (payant).
 *
 * Un flux s'écrit comme il se lit à l'écran :
 *
 *     QUAND  un courriel arrive
 *     SI     demande de devis ?      (facultatif)
 *     ALORS  créer le contact   → PUIS répondre avec le modèle → PUIS créer une tâche
 *     SINON  classer dans « À lire »  (seulement s'il y a un SI)
 *
 * Le premier bloc d'une branche s'affiche ALORS (ou SINON), les suivants PUIS.
 * Le format est sérialisable tel quel (collection synchronisée), sans aucun
 * secret : un bloc nomme une boîte (« contact@ ») ou un modèle, jamais un accès.
 *
 * Il prolonge le moteur existant (`src/state/useAutomations.ts`) : une
 * automatisation d'aujourd'hui se traduit en flux (`depuisAutomation`), et un
 * flux assez simple se traduit en automatisation (`versAutomation`) pour être
 * exécuté par `AutomationsRunner` dès maintenant, sans rien changer.
 */

export type ModeBloc = 'local' | 'api';

export type TypeQuand =
  | 'courriel-recu'
  | 'rendez-vous-cree'
  | 'paiement-recu'
  | 'horaire'
  | 'formulaire-repondu'
  | 'facture-en-retard'
  | 'ticket-ouvert'
  | 'prospect-gagne'
  | 'stock-bas';

export type TypeSi = 'contient-mots' | 'montant-au-moins' | 'expediteur-connu';

export type TypeAction =
  | 'creer-contact'
  | 'repondre-modele'
  | 'creer-tache'
  | 'classer'
  | 'ecrire-journal'
  | 'envoyer-courriel'
  | 'envoyer-sms'
  | 'notifier-equipe'
  | 'preparer-relance';

export interface BlocQuand {
  id: string;
  mode: ModeBloc;
  type: TypeQuand;
  /** `boite` : la partie locale d'une adresse de l'équipe (« contact@ »), jamais un accès. `heure` : « HH:MM ». `jours` : ISO, 1 = lundi. */
  parametres: { boite?: string; heure?: string; jours?: number[] };
}

export interface BlocSi {
  id: string;
  mode: ModeBloc;
  type: TypeSi;
  parametres: { mots?: string[]; montantCents?: number };
}

export interface BlocAction {
  id: string;
  mode: ModeBloc;
  type: TypeAction;
  /** `modeleId` : modèle de message (texte client, vouvoiement). `dossier` : clé de dossier du tri. */
  parametres: { modeleId?: string; dossier?: string; titre?: string; echeanceJours?: number; assigneeEmail?: string };
}

export type EtatFlux = 'actif' | 'en-pause' | 'brouillon';

export interface Flux {
  id: string;
  nom: string;
  etat: EtatFlux;
  quand: BlocQuand;
  si: BlocSi | null;
  alors: BlocAction[];
  sinon: BlocAction[];
}

/** Ce que chaque type de bloc peut faire : la catégorie qu'il touche, et ses modes possibles. */
interface Capacite {
  categorie: CategorieId | null;
  local: boolean;
  api: boolean;
  /** Le bloc produit un texte destiné à un client : un modèle est exigé (vouvoiement). */
  versClient?: boolean;
}

export const CAPACITES_QUAND: Record<TypeQuand, Capacite> = {
  'courriel-recu': { categorie: 'messagerie', local: true, api: true },
  'rendez-vous-cree': { categorie: 'agenda', local: true, api: true },
  'paiement-recu': { categorie: 'paiement', local: true, api: true },
  horaire: { categorie: null, local: true, api: false },
  'formulaire-repondu': { categorie: null, local: true, api: false },
  'facture-en-retard': { categorie: null, local: true, api: false },
  'ticket-ouvert': { categorie: null, local: true, api: false },
  'prospect-gagne': { categorie: null, local: true, api: false },
  'stock-bas': { categorie: null, local: true, api: false },
};

export const CAPACITES_SI: Record<TypeSi, Capacite> = {
  'contient-mots': { categorie: null, local: true, api: false },
  'montant-au-moins': { categorie: null, local: true, api: false },
  'expediteur-connu': { categorie: null, local: true, api: false },
};

export const CAPACITES_ACTION: Record<TypeAction, Capacite> = {
  'creer-contact': { categorie: null, local: true, api: false },
  'repondre-modele': { categorie: 'messagerie', local: true, api: true, versClient: true },
  'creer-tache': { categorie: null, local: true, api: false },
  classer: { categorie: null, local: true, api: false },
  'ecrire-journal': { categorie: null, local: true, api: false },
  'envoyer-courriel': { categorie: 'messagerie', local: true, api: true, versClient: true },
  'envoyer-sms': { categorie: 'sms', local: true, api: true, versClient: true },
  'notifier-equipe': { categorie: 'notifications', local: true, api: true },
  'preparer-relance': { categorie: 'messagerie', local: true, api: false, versClient: true },
};

/** Avec quels déclencheurs une condition a du sens. */
const SI_COMPATIBLE: Record<TypeSi, readonly TypeQuand[]> = {
  'contient-mots': ['courriel-recu', 'formulaire-repondu', 'ticket-ouvert'],
  'montant-au-moins': ['paiement-recu', 'facture-en-retard'],
  'expediteur-connu': ['courriel-recu'],
};

/** Au plus, par branche : au-delà, un flux ne se lit plus d'un coup d'œil. */
export const BLOCS_MAX_PAR_BRANCHE = 6;

export type DefautFlux =
  | 'sans-action'
  | 'sinon-sans-si'
  | 'trop-de-blocs'
  | 'id-en-double'
  | 'mode-impossible'
  | 'si-incompatible'
  | 'mots-vides'
  | 'montant-invalide'
  | 'heure-invalide'
  | 'jours-invalides'
  | 'modele-manquant'
  | 'nom-vide';

export function capacite(bloc: BlocQuand | BlocSi | BlocAction, role: 'quand' | 'si' | 'action'): Capacite {
  if (role === 'quand') return CAPACITES_QUAND[(bloc as BlocQuand).type];
  if (role === 'si') return CAPACITES_SI[(bloc as BlocSi).type];
  return CAPACITES_ACTION[(bloc as BlocAction).type];
}

/** Les défauts d'un flux, ou une liste vide s'il peut tourner. */
export function defautsDuFlux(f: Flux): DefautFlux[] {
  const d = new Set<DefautFlux>();
  if (!f.nom.trim()) d.add('nom-vide');
  if (f.alors.length === 0) d.add('sans-action');
  if (!f.si && f.sinon.length > 0) d.add('sinon-sans-si');
  if (f.alors.length > BLOCS_MAX_PAR_BRANCHE || f.sinon.length > BLOCS_MAX_PAR_BRANCHE) d.add('trop-de-blocs');

  const tous: { bloc: BlocQuand | BlocSi | BlocAction; role: 'quand' | 'si' | 'action' }[] = [
    { bloc: f.quand, role: 'quand' },
    ...(f.si ? [{ bloc: f.si, role: 'si' as const }] : []),
    ...[...f.alors, ...f.sinon].map((bloc) => ({ bloc, role: 'action' as const })),
  ];
  const ids = tous.map((x) => x.bloc.id);
  if (new Set(ids).size !== ids.length) d.add('id-en-double');
  for (const { bloc, role } of tous) {
    const c = capacite(bloc, role);
    if ((bloc.mode === 'api' && !c.api) || (bloc.mode === 'local' && !c.local)) d.add('mode-impossible');
    if (role === 'action' && c.versClient && !(bloc as BlocAction).parametres.modeleId) d.add('modele-manquant');
  }

  const q = f.quand.parametres;
  if (f.quand.type === 'horaire') {
    if (!q.heure || !/^([01]\d|2[0-3]):[0-5]\d$/.test(q.heure)) d.add('heure-invalide');
    if (q.jours && (q.jours.length === 0 || q.jours.some((j) => !Number.isInteger(j) || j < 1 || j > 7))) d.add('jours-invalides');
  }
  if (f.si) {
    if (!SI_COMPATIBLE[f.si.type].includes(f.quand.type)) d.add('si-incompatible');
    if (f.si.type === 'contient-mots' && !(f.si.parametres.mots ?? []).some((m) => normaliser(m).length > 0)) d.add('mots-vides');
    if (f.si.type === 'montant-au-moins') {
      const m = f.si.parametres.montantCents;
      if (m === undefined || !Number.isInteger(m) || m < 0) d.add('montant-invalide');
    }
  }
  return [...d];
}

/** Le libellé de rôle affiché sur le bloc (QUAND, SI, ALORS, SINON, PUIS). */
export function roleAffiche(f: Flux, blocId: string): 'quand' | 'si' | 'alors' | 'sinon' | 'puis' | null {
  if (f.quand.id === blocId) return 'quand';
  if (f.si?.id === blocId) return 'si';
  const a = f.alors.findIndex((b) => b.id === blocId);
  if (a >= 0) return a === 0 ? 'alors' : 'puis';
  const s = f.sinon.findIndex((b) => b.id === blocId);
  if (s >= 0) return s === 0 ? 'sinon' : 'puis';
  return null;
}

/* ─── Le mode, bloc par bloc ─────────────────────────────────────────────── */

export type ModeEffectifBloc = 'local' | 'api' | 'suspendu';

/**
 * Le mode réel d'un bloc : API seulement si son connecteur est connecté ; sinon
 * le local reprend s'il existe ; sinon le bloc est suspendu (le flux continue
 * sans lui, et l'écran le dit). Un connecteur arrêté ne casse donc jamais un flux.
 */
export function modeEffectifBloc(bloc: BlocQuand | BlocSi | BlocAction, role: 'quand' | 'si' | 'action', instances: readonly ConnecteurInstance[]): ModeEffectifBloc {
  const c = capacite(bloc, role);
  if (bloc.mode === 'api' && c.api && c.categorie && modeDeCategorie(c.categorie, instances) === 'externe') return 'api';
  return c.local ? 'local' : 'suspendu';
}

/** « Comment ça tourne » : `local` si tout est fait par l'application, `api` dès qu'un bloc passe par un service. */
export function modeDuFlux(f: Flux): ModeBloc {
  return [f.quand, f.si, ...f.alors, ...f.sinon].some((b) => b?.mode === 'api') ? 'api' : 'local';
}

/** « Tu peux changer à tout moment » : bascule chaque bloc qui le permet. */
export function basculerFlux(f: Flux, mode: ModeBloc): Flux {
  const pose = <B extends BlocQuand | BlocSi | BlocAction>(b: B, role: 'quand' | 'si' | 'action'): B => {
    const c = capacite(b, role);
    return { ...b, mode: mode === 'api' ? (c.api ? 'api' : 'local') : c.local ? 'local' : b.mode };
  };
  return {
    ...f,
    quand: pose(f.quand, 'quand'),
    si: f.si ? pose(f.si, 'si') : null,
    alors: f.alors.map((b) => pose(b, 'action')),
    sinon: f.sinon.map((b) => pose(b, 'action')),
  };
}

/* ─── L'essai (« Tester ») : ce qui se passerait, sans rien faire ────────── */

export interface Evenement {
  type: TypeQuand;
  at: number;
  texte?: string;
  expediteur?: string;
  montantCents?: number;
  /** Pour `courriel-recu` : la boîte de l'équipe qui a reçu (« contact@… »). */
  boite?: string;
}

export interface EtapePrevue {
  blocId: string;
  type: TypeAction;
  mode: ModeEffectifBloc;
}

export interface Essai {
  declenche: boolean;
  branche: 'alors' | 'sinon' | null;
  etapes: EtapePrevue[];
}

/** Minuscules, sans accents, sans ponctuation : « Tarifs ? » → « tarifs ». */
export function normaliser(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9@.]+/g, ' ')
    .trim();
}

/** Un mot repéré, au singulier ou au pluriel simple (« tarif » trouve « tarifs »), jamais à l'intérieur d'un autre mot. */
export function contientUnMot(texte: string, mots: readonly string[]): boolean {
  const jetons = normaliser(texte).split(' ');
  const suite = ` ${jetons.join(' ')} `;
  return mots.some((m) => {
    const n = normaliser(m);
    if (!n) return false;
    if (n.includes(' ')) return suite.includes(` ${n} `);
    return jetons.some((j) => j === n || j === `${n}s` || j === `${n}x`);
  });
}

function quandCorrespond(q: BlocQuand, e: Evenement): boolean {
  if (q.type !== e.type) return false;
  if (q.type === 'courriel-recu' && q.parametres.boite) {
    const voulu = normaliser(q.parametres.boite).replace(/@.*$/, '');
    const recu = normaliser(e.boite ?? '').replace(/@.*$/, '');
    if (voulu && voulu !== recu) return false;
  }
  return true;
}

function siVrai(si: BlocSi, e: Evenement, contactsConnus: ReadonlySet<string>): boolean {
  switch (si.type) {
    case 'contient-mots':
      return contientUnMot(e.texte ?? '', si.parametres.mots ?? []);
    case 'montant-au-moins':
      return (e.montantCents ?? -1) >= (si.parametres.montantCents ?? Number.POSITIVE_INFINITY);
    case 'expediteur-connu':
      return !!e.expediteur && contactsConnus.has(e.expediteur.trim().toLowerCase());
  }
}

export function essayer(f: Flux, e: Evenement, contexte: { instances: readonly ConnecteurInstance[]; contactsConnus?: ReadonlySet<string> }): Essai {
  if (!quandCorrespond(f.quand, e)) return { declenche: false, branche: null, etapes: [] };
  const branche = !f.si || siVrai(f.si, e, contexte.contactsConnus ?? new Set()) ? 'alors' : 'sinon';
  const blocs = branche === 'alors' ? f.alors : f.sinon;
  return {
    declenche: true,
    branche: blocs.length ? branche : null,
    etapes: blocs.map((b) => ({ blocId: b.id, type: b.type, mode: modeEffectifBloc(b, 'action', contexte.instances) })),
  };
}

/* ─── Le pont avec le moteur existant (`useAutomations`) ─────────────────── */

const QUAND_DEPUIS: Record<Declencheur, TypeQuand> = {
  formAnswer: 'formulaire-repondu',
  invoiceOverdue: 'facture-en-retard',
  ticketOpened: 'ticket-ouvert',
  prospectWon: 'prospect-gagne',
  stockLow: 'stock-bas',
};

/** Une automatisation d'aujourd'hui, lue comme un flux (sans perte). */
export function depuisAutomation(id: string, nom: string, a: AutomationData): Flux {
  const action: BlocAction =
    a.action === 'task'
      ? { id: `${id}-alors`, mode: 'local', type: 'creer-tache', parametres: { assigneeEmail: a.assigneeEmail } }
      : { id: `${id}-alors`, mode: 'local', type: 'ecrire-journal', parametres: { assigneeEmail: a.assigneeEmail } };
  return {
    id,
    nom,
    etat: a.enabled ? 'actif' : 'en-pause',
    quand: { id: `${id}-quand`, mode: 'local', type: QUAND_DEPUIS[a.trigger], parametres: {} },
    si: null,
    alors: [action],
    sinon: [],
  };
}

/**
 * Un flux que `AutomationsRunner` sait déjà exécuter : un déclencheur existant,
 * sans condition, une seule action « tâche » ou « journal », en local.
 * `null` sinon : il attend le moteur de flux complet.
 */
export function versAutomation(f: Flux, createdAt: string): AutomationData | null {
  const trigger = (Object.keys(QUAND_DEPUIS) as Declencheur[]).find((k) => QUAND_DEPUIS[k] === f.quand.type);
  if (!trigger || f.si || f.sinon.length || f.alors.length !== 1 || f.etat === 'brouillon') return null;
  const [b] = f.alors;
  if (b.mode !== 'local') return null;
  if (b.type === 'creer-tache') {
    return { trigger, action: 'task', enabled: f.etat === 'actif', assigneeEmail: b.parametres.assigneeEmail ?? '', createdAt };
  }
  if (b.type === 'ecrire-journal') {
    return { trigger, action: 'logbook', enabled: f.etat === 'actif', assigneeEmail: b.parametres.assigneeEmail ?? '', createdAt };
  }
  return null;
}

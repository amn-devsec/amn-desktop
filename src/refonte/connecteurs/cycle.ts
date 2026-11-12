import { CATALOGUE } from './catalogue';
import { estGratuit, fraicheur, type Fraicheur, type TarifConnu } from './tarifs';
import type { Categorie, CategorieId, ConnecteurInstance, Droit, EntreeJournal, ErreurConnecteur, Jour, Mode } from './types';

/**
 * LE CYCLE D'UNE PRISE — ajouter, activer, autoriser, arrêter, reconnecter.
 *
 * Trois règles du plan, tenues ici et vérifiées par `check:connecteurs` :
 *
 *   1. Le coût s'affiche AVANT l'activation. `preparerActivation` refuse tant
 *      que le tarif n'est pas relevé (ou s'il est périmé) : sans chiffre sûr,
 *      pas de bouton « Activer ». Une brique « chez nous » coûte 0 €, c'est dit.
 *   2. Trois clics au plus pour activer, deux pour arrêter (`PARCOURS`).
 *   3. Une catégorie sans service connecté reste en mode local
 *      (`modeDeCategorie`) : l'écran reste utilisable.
 *
 * Toutes les fonctions sont pures : elles rendent la nouvelle prise et la
 * ligne de journal ; l'écriture (collection synchronisée, amn-api) est à
 * l'appelant.
 */

/** Les gestes de chaque parcours, dans l'ordre. Chaque geste = un clic. */
export const PARCOURS = {
  /** « Brancher » sur la prise (le coût s'affiche), « Activer », puis l'autorisation chez le service. */
  activer: ['brancher', 'activer', 'autoriser'],
  /** « Débrancher », puis la confirmation. */
  arreter: ['debrancher', 'confirmer'],
  /** « Reconnecter », puis l'autorisation chez le service. */
  reconnecter: ['reconnecter', 'autoriser'],
} as const;

export const CLICS_MAX = 3;

export type Refus =
  | 'option-inconnue'
  | 'tarif-a-relever'
  | 'tarif-perime'
  | 'droit-interdit'
  | 'sans-droit-de-gerer'
  | 'hors-ligne'
  | 'deja-actif'
  | 'plafond-invalide'
  | 'pas-connecte'
  | 'rien-a-reconnecter';

export type Resultat<T> = { ok: true; valeur: T } | { ok: false; raison: Refus };

export interface Contexte {
  maintenant: number;
  aujourdhui: Jour;
  /** La personne gère les accès (H19). */
  peutGerer: boolean;
  enLigne: boolean;
  parEmail: string;
  catalogue?: readonly Categorie[];
}

/** Ce qu'on montre AVANT le clic « Activer » : le service, son tarif, ses droits. */
export interface DevisActivation {
  categorie: CategorieId;
  optionId: string;
  nom: string;
  tarif: TarifConnu;
  fraicheur: Exclude<Fraicheur, 'a-relever' | 'perime'>;
  gratuit: boolean;
  droits: readonly Droit[];
}

export interface Changement {
  instance: ConnecteurInstance;
  journal: EntreeJournal;
}

function refus<T>(raison: Refus): Resultat<T> {
  return { ok: false, raison };
}

/** Une prise ajoutée à la baie, pas encore branchée : mode local. */
export function instanceLibre(categorie: CategorieId, optionId: string, prise: number): ConnecteurInstance {
  return {
    categorie,
    prise,
    optionId,
    etat: 'a-connecter',
    motif: 'libre',
    droits: [],
    coutAccepte: null,
    derniereSynchroAt: null,
    synchroEnCours: false,
    erreur: null,
    widgets: 0,
    changeAt: null,
  };
}

/** Les prises de départ, numérotées dans l'ordre donné (P01, P02…). */
export function baieInitiale(choix: readonly { categorie: CategorieId; optionId: string }[]): ConnecteurInstance[] {
  return choix.map((c, i) => instanceLibre(c.categorie, c.optionId, i + 1));
}

/** Le numéro de la prise suivante : jamais un numéro déjà donné, même libéré. */
export function prochainePrise(instances: readonly ConnecteurInstance[]): number {
  return instances.reduce((m, i) => Math.max(m, i.prise), 0) + 1;
}

function natureDe(i: ConnecteurInstance, catalogue: readonly Categorie[]): 'service' | 'chez-nous' | null {
  return catalogue.find((c) => c.id === i.categorie)?.options.find((o) => o.id === i.optionId)?.nature ?? null;
}

/** Le mode d'une prise : `externe` seulement pour un service connecté ; une brique chez nous reste `local`. */
export function modeEffectif(instance: ConnecteurInstance | undefined | null, catalogue: readonly Categorie[] = CATALOGUE): Mode {
  if (!instance || instance.etat !== 'connecte') return 'local';
  return natureDe(instance, catalogue) === 'service' ? 'externe' : 'local';
}

/**
 * Le mode d'une catégorie, partout où il compte : `externe` si un service de
 * cette catégorie est connecté (avec le droit demandé, s'il y en a un), sinon `local`.
 */
export function modeDeCategorie(categorie: CategorieId, instances: readonly ConnecteurInstance[], droit?: Droit, catalogue: readonly Categorie[] = CATALOGUE): Mode {
  return instances.some((i) => i.categorie === categorie && modeEffectif(i, catalogue) === 'externe' && (!droit || i.droits.includes(droit))) ? 'externe' : 'local';
}

/** Une brique chez nous de cette catégorie est-elle branchée (boîte de l'équipe, passerelle SMS…) ? */
export function briqueChezNousBranchee(categorie: CategorieId, instances: readonly ConnecteurInstance[], catalogue: readonly Categorie[] = CATALOGUE): boolean {
  return instances.some((i) => i.categorie === categorie && i.etat === 'connecte' && natureDe(i, catalogue) === 'chez-nous');
}

/** Clic 1 (« Brancher ») : prépare ce qui sera affiché avant l'activation. */
export function preparerActivation(instance: ConnecteurInstance, ctx: Contexte): Resultat<DevisActivation> {
  if (!ctx.peutGerer) return refus('sans-droit-de-gerer');
  if (!ctx.enLigne) return refus('hors-ligne');
  if (instance.etat === 'connecte' || instance.motif === 'autorisation-en-attente') return refus('deja-actif');
  const cat = (ctx.catalogue ?? CATALOGUE).find((c) => c.id === instance.categorie);
  const opt = cat?.options.find((o) => o.id === instance.optionId);
  if (!cat || !opt) return refus('option-inconnue');
  if (opt.droits.some((d) => cat.droitsInterdits.includes(d))) return refus('droit-interdit');
  const f = fraicheur(opt.tarif, ctx.aujourdhui);
  if (f === 'a-relever' || opt.tarif.etat === 'a-relever') return refus('tarif-a-relever');
  if (f === 'perime') return refus('tarif-perime');
  return {
    ok: true,
    valeur: { categorie: cat.id, optionId: opt.id, nom: opt.nom, tarif: opt.tarif, fraicheur: f, gratuit: estGratuit(opt.tarif), droits: opt.droits },
  };
}

/**
 * Clic 2 (« Activer ») : la personne a vu le coût et fixe un plafond.
 * La prise attend ensuite l'autorisation (clic 3).
 * Un service payant exige un plafond strictement positif ; un gratuit accepte 0.
 */
export function activer(instance: ConnecteurInstance, devis: DevisActivation, plafondMensuelCents: number, ctx: Contexte): Resultat<Changement> {
  if (!ctx.peutGerer) return refus('sans-droit-de-gerer');
  if (!ctx.enLigne) return refus('hors-ligne');
  if (instance.etat === 'connecte' || instance.motif === 'autorisation-en-attente') return refus('deja-actif');
  if (devis.categorie !== instance.categorie || devis.optionId !== instance.optionId) return refus('option-inconnue');
  if (!Number.isInteger(plafondMensuelCents) || plafondMensuelCents < 0 || (!devis.gratuit && plafondMensuelCents === 0)) {
    return refus('plafond-invalide');
  }
  return {
    ok: true,
    valeur: {
      instance: {
        ...instance,
        etat: 'a-connecter',
        motif: 'autorisation-en-attente',
        droits: devis.droits,
        coutAccepte: { optionId: devis.optionId, tarif: { ...devis.tarif }, plafondMensuelCents, accepteAt: ctx.maintenant, parEmail: ctx.parEmail },
        erreur: null,
        changeAt: ctx.maintenant,
      },
      journal: { at: ctx.maintenant, categorie: instance.categorie, geste: 'activation', parEmail: ctx.parEmail, detail: 'journal.activation' },
    },
  };
}

/** Clic 3 : le service a accordé l'autorisation (retour d'amn-api). */
export function autorisationRecue(instance: ConnecteurInstance, maintenant: number): Resultat<Changement> {
  const attend = instance.motif === 'autorisation-en-attente' || instance.motif === 'a-reconnecter' || instance.motif === 'erreur';
  if (instance.etat !== 'a-connecter' || !attend || !instance.coutAccepte) return refus('rien-a-reconnecter');
  const reprise = instance.motif !== 'autorisation-en-attente';
  return {
    ok: true,
    valeur: {
      instance: { ...instance, etat: 'connecte', motif: null, erreur: null, derniereSynchroAt: maintenant, changeAt: maintenant },
      journal: { at: maintenant, categorie: instance.categorie, geste: reprise ? 'reconnexion' : 'autorisation', parEmail: null, detail: reprise ? 'journal.reconnexion' : 'journal.autorisation' },
    },
  };
}

/** « Reconnecter » : relance l'autorisation, sans redemander le coût déjà accepté. */
export function demanderReconnexion(instance: ConnecteurInstance, ctx: Contexte): Resultat<ConnecteurInstance> {
  if (!ctx.peutGerer) return refus('sans-droit-de-gerer');
  if (!ctx.enLigne) return refus('hors-ligne');
  if (instance.etat !== 'a-connecter' || (instance.motif !== 'a-reconnecter' && instance.motif !== 'erreur')) return refus('rien-a-reconnecter');
  return { ok: true, valeur: instance };
}

/**
 * « Débrancher » puis « Confirmer » (2 clics), ou le plafond atteint.
 * Les données déjà importées restent ; la synchro s'arrête ; le mode local reprend.
 * Le coût accepté est oublié : une réactivation le remontre (le tarif a pu changer).
 */
export function arreter(instance: ConnecteurInstance, motif: 'volontaire' | 'plafond', ctx: Pick<Contexte, 'maintenant' | 'peutGerer' | 'enLigne' | 'parEmail'>): Resultat<Changement> {
  if (motif === 'volontaire') {
    if (!ctx.peutGerer) return refus('sans-droit-de-gerer');
    if (!ctx.enLigne) return refus('hors-ligne');
  }
  if (instance.etat === 'arrete' || instance.motif === 'libre') return refus('pas-connecte');
  return {
    ok: true,
    valeur: {
      instance: { ...instance, etat: 'arrete', motif, droits: [], coutAccepte: null, synchroEnCours: false, changeAt: ctx.maintenant },
      journal: {
        at: ctx.maintenant,
        categorie: instance.categorie,
        geste: 'arret',
        parEmail: motif === 'volontaire' ? ctx.parEmail : null,
        detail: motif === 'volontaire' ? 'journal.arret' : 'journal.arret-plafond',
      },
    },
  };
}

/** Le service a refusé : autorisation expirée (à reconnecter) ou autre erreur. Le mode local reprend. */
export function signalerErreur(instance: ConnecteurInstance, erreur: ErreurConnecteur, autorisationExpiree: boolean): Resultat<Changement> {
  if (instance.etat !== 'connecte') return refus('pas-connecte');
  return {
    ok: true,
    valeur: {
      instance: { ...instance, etat: 'a-connecter', motif: autorisationExpiree ? 'a-reconnecter' : 'erreur', erreur, synchroEnCours: false, changeAt: erreur.at },
      journal: { at: erreur.at, categorie: instance.categorie, geste: 'erreur', parEmail: null, detail: erreur.message },
    },
  };
}

/**
 * Ce qui ne tient pas dans une prise, ou une liste vide. Sert à la garde et
 * à l'écran (une prise incohérente s'affiche « en erreur », jamais « branchée »).
 */
export function defautsDePrise(i: ConnecteurInstance, catalogue: readonly Categorie[] = CATALOGUE): string[] {
  const d: string[] = [];
  const cat = catalogue.find((c) => c.id === i.categorie);
  const opt = cat?.options.find((o) => o.id === i.optionId);
  if (!cat || !opt) return [`option inconnue : ${i.categorie}/${i.optionId}`];
  if (!Number.isInteger(i.prise) || i.prise < 1) d.push('numéro de prise invalide');
  if ((i.etat === 'connecte') !== (i.motif === null)) d.push('motif incohérent avec l’état');
  if (i.etat === 'arrete' && i.motif !== 'volontaire' && i.motif !== 'plafond') d.push('arrêt sans motif d’arrêt');
  if (i.etat === 'a-connecter' && (i.motif === 'volontaire' || i.motif === 'plafond')) d.push('motif d’arrêt sur une prise à connecter');
  if ((i.etat === 'arrete' || i.motif === 'libre') && (i.droits.length > 0 || i.coutAccepte)) d.push('droits ou coût gardés sur une prise débranchée');
  if (i.etat === 'connecte' && opt.nature === 'service' && !i.coutAccepte) d.push('service connecté sans coût accepté');
  if (i.droits.some((x) => !opt.droits.includes(x))) d.push('droit au-delà de ce que demande l’option');
  if (i.droits.some((x) => cat.droitsInterdits.includes(x))) d.push('droit interdit dans cette catégorie');
  if (i.synchroEnCours && i.etat !== 'connecte') d.push('synchro sur une prise non connectée');
  if (i.coutAccepte && i.coutAccepte.optionId !== i.optionId) d.push('coût accepté pour une autre option');
  return d;
}

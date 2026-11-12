import { defautsDuFlux, essayer, modeEffectifBloc, type BlocAction, type Evenement, type Flux, type ModeEffectifBloc, type TypeAction, type TypeQuand } from './flux';
import type { ConnecteurInstance } from './types';
import type { Action, AutomationData, Declencheur, Source } from '../../state/useAutomations';

/**
 * LES BRANCHES SINON ET PUIS, DANS LE MOTEUR D'AUTOMATISATION EXISTANT (H20).
 *
 * Décision du CO : l'éditeur de flux (DEV-editeur) n'a pas de moteur à lui. Un
 * flux s'enregistre comme une règle de la collection `automations`, celle que
 * lit `useAutomations` (H20), dans un FORMAT ÉTENDU qui reste une
 * `AutomationData` :
 *
 *     { trigger, action, enabled, assigneeEmail, createdAt }   ← l'existant, inchangé
 *     + flux?: { format: 2, nom, etat, quand, si, alors[], sinon[] }   ← l'extension
 *
 * Trois propriétés, vérifiées par `check:connecteurs` :
 *
 *   1. CONVERTIBLE DANS LES DEUX SENS, SANS PERTE. `depuisAutomation` lit toute
 *      règle (ancienne ou étendue) ; `versAutomation` rend une règle dont la
 *      relecture redonne exactement le flux. Une règle existante relue puis
 *      réécrite revient À L'IDENTIQUE (pas de champ ajouté, rien à migrer).
 *
 *   2. SANS DANGER POUR LE MOTEUR ACTUEL, AVANT QUE S6 NE L'ÉTENDE. Quand le
 *      moteur actuel sait exécuter tout le flux (un déclencheur existant, une
 *      seule action « tâche » ou « journal », en local, sans condition), la
 *      règle garde son vrai `trigger`. Sinon, `trigger` vaut `'flux'` : le
 *      moteur actuel ne lui trouve aucune source (`sourcesPour` → `[]`) et ne
 *      fait RIEN, plutôt que d'exécuter la moitié d'un flux en ignorant son SI.
 *
 *   3. MÊMES IDENTIFIANTS. La première étape d'ALORS garde l'identifiant
 *      historique `auto-<règle>-<source>` : ajouter un PUIS à une règle qui
 *      tourne déjà ne refait pas ce qu'elle a fait. Les suivantes ajoutent un
 *      suffixe (`-p1`, `-sinon`, `-sinon-p1`…). Toujours déterministes : deux
 *      postes ouverts, une seule écriture.
 *
 * Chaque bloc garde son mode Local ou API. Aucun bloc ne porte d'accès : une
 * boîte (« contact@ »), un modèle, un dossier, jamais une clé.
 */

/** La valeur de `trigger` d'une règle que seul le moteur étendu sait exécuter. */
export const DECLENCHEUR_FLUX = 'flux' as const;

/** Version du format étendu. */
export const FORMAT_FLUX = 2 as const;

/** Le flux tel qu'il est rangé dans la règle (son identifiant est celui de la règle). */
export interface FluxRange {
  format: typeof FORMAT_FLUX;
  nom: string;
  etat: Flux['etat'];
  quand: Flux['quand'];
  si: Flux['si'];
  alors: Flux['alors'];
  sinon: Flux['sinon'];
}

/** Une règle de la collection `automations` : l'existant, plus l'extension facultative. */
export interface AutomationEtendue extends Omit<AutomationData, 'trigger'> {
  trigger: Declencheur | typeof DECLENCHEUR_FLUX;
  flux?: FluxRange;
}

const QUAND_DEPUIS: Record<Declencheur, TypeQuand> = {
  formAnswer: 'formulaire-repondu',
  invoiceOverdue: 'facture-en-retard',
  ticketOpened: 'ticket-ouvert',
  prospectWon: 'prospect-gagne',
  stockLow: 'stock-bas',
};

const ACTION_DEPUIS: Record<Action, TypeAction> = { task: 'creer-tache', logbook: 'ecrire-journal' };

function declencheurDe(q: TypeQuand): Declencheur | null {
  return (Object.keys(QUAND_DEPUIS) as Declencheur[]).find((k) => QUAND_DEPUIS[k] === q) ?? null;
}

/** Égalité de valeurs ; une clé absente vaut une clé à `undefined` (ce que fait JSON). */
export function memeValeur(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (Array.isArray(a) || Array.isArray(b)) {
    return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((x, i) => memeValeur(x, b[i]));
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const ra = a as Record<string, unknown>;
    const rb = b as Record<string, unknown>;
    const cles = new Set([...Object.keys(ra), ...Object.keys(rb)]);
    return [...cles].every((k) => memeValeur(ra[k], rb[k]));
  }
  return false;
}

/**
 * Le moteur actuel exécute-t-il ce flux EN ENTIER, à l'identique ?
 * Un déclencheur existant, en local ; pas de SI ni de SINON ; une seule action
 * « tâche » ou « journal », en local, sans autre réglage que la personne assignée.
 */
export function executableParLeMoteurActuel(f: Flux): boolean {
  if (f.etat === 'brouillon' || f.si || f.sinon.length || f.alors.length !== 1) return false;
  if (!declencheurDe(f.quand.type) || f.quand.mode !== 'local' || Object.values(f.quand.parametres).some((v) => v !== undefined)) return false;
  const [b] = f.alors;
  if (b.mode !== 'local' || (b.type !== 'creer-tache' && b.type !== 'ecrire-journal')) return false;
  return Object.entries(b.parametres).every(([k, v]) => v === undefined || k === 'assigneeEmail');
}

/** Ce que le moteur actuel lit de la règle. */
function projection(f: Flux, createdAt: string): AutomationEtendue {
  const enabled = f.etat === 'actif';
  if (executableParLeMoteurActuel(f)) {
    const [b] = f.alors;
    return {
      trigger: declencheurDe(f.quand.type) as Declencheur,
      action: b.type === 'creer-tache' ? 'task' : 'logbook',
      enabled,
      assigneeEmail: b.parametres.assigneeEmail ?? '',
      createdAt,
    };
  }
  const tache = f.alors.find((b) => b.type === 'creer-tache');
  return { trigger: DECLENCHEUR_FLUX, action: 'task', enabled, assigneeEmail: tache?.parametres.assigneeEmail ?? '', createdAt };
}

/**
 * Une règle lue comme un flux.
 *   · règle étendue : le flux rangé, à l'identique ;
 *   · règle existante : un QUAND, un ALORS, en local ; `nomParDefaut` est le
 *     nom que H20 affiche pour elle (l'ancienne règle n'a pas de nom à elle).
 */
export function depuisAutomation(id: string, nomParDefaut: string, a: AutomationEtendue): Flux {
  if (a.flux) {
    const { nom, etat, quand, si, alors, sinon } = a.flux;
    return { id, nom, etat, quand, si, alors, sinon };
  }
  if (a.trigger === DECLENCHEUR_FLUX) throw new Error(`règle ${id} : déclencheur « flux » sans flux rangé`);
  return {
    id,
    nom: nomParDefaut,
    etat: a.enabled ? 'actif' : 'en-pause',
    quand: { id: `${id}-quand`, mode: 'local', type: QUAND_DEPUIS[a.trigger], parametres: {} },
    si: null,
    alors: [{ id: `${id}-alors`, mode: 'local', type: ACTION_DEPUIS[a.action] ?? 'creer-tache', parametres: { assigneeEmail: a.assigneeEmail } }],
    sinon: [],
  };
}

/**
 * Un flux écrit comme une règle de `automations`.
 *
 * Si la règle existante (sans extension) se relit exactement en ce flux, on
 * l'écrit telle quelle : c'est le cas de toute règle créée par H20 et jamais
 * retouchée dans l'éditeur. Sinon, on ajoute `flux`. Un flux invalide ne
 * s'enregistre qu'en brouillon : `null` sinon.
 */
export function versAutomation(f: Flux, createdAt: string, nomParDefaut: string): AutomationEtendue | null {
  if (f.etat !== 'brouillon' && defautsDuFlux(f).length > 0) return null;
  const base = projection(f, createdAt);
  if (base.trigger !== DECLENCHEUR_FLUX && memeValeur(depuisAutomation(f.id, nomParDefaut, base), f)) return base;
  return {
    ...base,
    flux: { format: FORMAT_FLUX, nom: f.nom, etat: f.etat, quand: f.quand, si: f.si, alors: f.alors, sinon: f.sinon },
  };
}

/** Ce qui ne tient pas dans une règle rangée, ou une liste vide. */
export function defautsDeLAutomation(id: string, a: AutomationEtendue): string[] {
  const d: string[] = [];
  if (!a.flux) {
    if (a.trigger === DECLENCHEUR_FLUX) d.push('déclencheur « flux » sans flux rangé');
    else if (!QUAND_DEPUIS[a.trigger]) d.push(`déclencheur inconnu : ${String(a.trigger)}`);
    return d;
  }
  if (a.flux.format !== FORMAT_FLUX) d.push(`format inconnu : ${String(a.flux.format)}`);
  const f = depuisAutomation(id, a.flux.nom, a);
  if (a.flux.etat !== 'brouillon') d.push(...defautsDuFlux(f));
  const attendu = projection(f, a.createdAt);
  if (a.trigger !== attendu.trigger || a.action !== attendu.action || a.enabled !== attendu.enabled || a.assigneeEmail !== attendu.assigneeEmail) {
    d.push('champs du moteur actuel incohérents avec le flux');
  }
  return d;
}

/* ─── Ce que le moteur étendu (S6, H20) exécute ──────────────────────────── */

/** L'identifiant d'une étape : le premier ALORS garde l'identifiant historique. */
export function idDEtape(regleId: string, sourceId: string, branche: 'alors' | 'sinon', rang: number): string {
  const base = `auto-${regleId}-${sourceId}`;
  if (branche === 'alors') return rang === 0 ? base : `${base}-p${rang}`;
  return rang === 0 ? `${base}-sinon` : `${base}-sinon-p${rang}`;
}

export interface EtapeAExecuter {
  id: string;
  rang: number;
  branche: 'alors' | 'sinon';
  type: TypeAction;
  mode: ModeEffectifBloc;
  parametres: BlocAction['parametres'];
}

/**
 * Le plan d'exécution d'une règle pour une source : les étapes de la branche
 * choisie, dans l'ordre, chacune avec son identifiant et son mode réel. Une
 * étape `suspendu` ne s'exécute pas (son service est arrêté et elle n'a pas de
 * version locale) ; les suivantes, si. Rien pour une règle en pause, en
 * brouillon, ou dont le QUAND ne correspond pas.
 */
export function planDExecution(
  regleId: string,
  f: Flux,
  sourceId: string,
  evenement: Evenement,
  contexte: { instances: readonly ConnecteurInstance[]; contactsConnus?: ReadonlySet<string> },
): EtapeAExecuter[] {
  if (f.etat !== 'actif' || defautsDuFlux(f).length > 0) return [];
  const essai = essayer(f, evenement, contexte);
  if (!essai.declenche || !essai.branche) return [];
  const branche = essai.branche;
  const blocs = branche === 'alors' ? f.alors : f.sinon;
  return blocs.map((b, rang) => ({
    id: idDEtape(regleId, sourceId, branche, rang),
    rang,
    branche,
    type: b.type,
    mode: modeEffectifBloc(b, 'action', contexte.instances),
    parametres: b.parametres,
  }));
}

/**
 * Une source du moteur actuel (`sourcesPour`) vue comme un événement de flux.
 * Le texte est le titre et le détail réunis (pour un SI « mots repérés »). Le
 * montant n'existe pas encore dans `Source` : un SI « montant » sur une facture
 * en retard attend que S6 l'y ajoute (`montantCents`).
 */
export function evenementDepuisSource(trigger: Declencheur, source: Source & { montantCents?: number; expediteur?: string }, at: number): Evenement {
  return {
    type: QUAND_DEPUIS[trigger],
    at,
    texte: [source.titre, source.detail].filter(Boolean).join('\n'),
    montantCents: source.montantCents,
    expediteur: source.expediteur,
  };
}

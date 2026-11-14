import { ajouterJours, plafonner, type Jour } from './commun';

/**
 * L07 · LES DÉFIS D'ÉQUIPE — le défi de la semaine, sa jauge, ce que chacun apporte, la frise des défis passés, les
 * célébrations, « Proposer un défi ». **À ne pas simplifier** (STATUT §1.10, demande du dirigeant, qui y tient).
 *
 * Les quatre limites qu'il a fixées, qui sont des PROPRIÉTÉS DU CODE, vérifiées par `check:journee` :
 *   1. **aucun chiffre individuel** : la jauge est celle de l'ÉQUIPE ; « Ce que chacun apporte » est un engagement
 *      ÉCRIT (une phrase que la personne a rédigée), jamais un nombre. Aucune structure de ce fichier ne porte un
 *      nombre rattaché à une personne ;
 *   2. **aucun classement** : l'ordre des personnes ne dépend d'aucune valeur (alphabétique, stable) ;
 *   3. **aucun point perdu** : l'état d'un défi ne régresse pas ; un défi non tenu est « terminé », pas « raté » ;
 *   4. **aucun reproche** : pas d'état « en échec », pas de « il manque … à X ».
 *
 * Les règles de calcul sont les *Propositions* de la fiche L07 (SIM les a reprises : `Defi` dans
 * `src/refonte/donnees/types-suite.ts`) ; elles sont à confirmer sur la fiche (note du lot, §2).
 */

export type TypeDeDefi = 'Compteur de jours' | 'Taux de tenue' | 'Seuil';
export type EtatDeDefi = 'En cours' | 'Tenu' | 'Terminé';

export interface Defi {
  id: string;
  titre: string;
  sousLigne: string;
  type: TypeDeDefi;
  source: { module: string; indicateur: string };
  debutLe: Jour;
  finLe: Jour | null;
  /** Compteur de jours : des jours. Taux de tenue : un pourcentage. Seuil : une valeur (une note sur 5…). */
  cible: number;
  valeurActuelle: number;
  participants: readonly string[];
}

/**
 * L'état d'un défi à un jour donné.
 *   · Compteur de jours et Seuil : « Tenu » dès que la valeur atteint la cible ;
 *   · Taux de tenue : jugé à la FIN de sa période (« du lundi au dimanche ») — « Tenu » si la valeur y atteint la
 *     cible, « Terminé » sinon ; avant la fin, toujours « En cours », même au-dessus de la cible ;
 *   · une période terminée sans que la cible soit atteinte : « Terminé ». Jamais « raté ».
 */
export function etatDuDefi(d: Pick<Defi, 'type' | 'cible' | 'valeurActuelle' | 'finLe'>, aujourdhui: Jour): EtatDeDefi {
  const atteint = d.valeurActuelle >= d.cible;
  if (d.type === 'Taux de tenue') {
    if (d.finLe !== null && aujourdhui > d.finLe) return atteint ? 'Tenu' : 'Terminé';
    return 'En cours';
  }
  if (atteint) return 'Tenu';
  return d.finLe !== null && aujourdhui > d.finLe ? 'Terminé' : 'En cours';
}

export interface JaugeDeDefi {
  /** Valeur / cible, entre 0 et 1 : le remplissage de la jauge. */
  progression: number;
  /** Le chiffre que la jauge dit, à l'échelle du défi (jours, pourcent, note). */
  valeur: number;
  cible: number;
  /** Ce qu'il reste pour atteindre la cible, dans l'unité du défi (0 une fois atteinte). */
  reste: number;
  atteinte: boolean;
}

/** La jauge d'ÉQUIPE d'un défi. Aucune valeur par personne. */
export function jaugeDuDefi(d: Pick<Defi, 'cible' | 'valeurActuelle'>): JaugeDeDefi {
  const reste = Math.max(0, Math.round((d.cible - d.valeurActuelle) * 100) / 100);
  return { progression: d.cible > 0 ? plafonner(d.valeurActuelle / d.cible) : 1, valeur: d.valeurActuelle, cible: d.cible, reste, atteinte: d.valeurActuelle >= d.cible };
}

/**
 * Un défi est « en cours » tant que sa période n'est pas finie : il a commencé, et il n'a pas de fin ou sa fin n'est
 * pas passée. Un défi sans fin (« Note moyenne à 4,5 ou plus ») peut être « Tenu » et rester en cours : on le tient.
 */
export const estEnCours = (d: Pick<Defi, 'debutLe' | 'finLe'>, aujourdhui: Jour): boolean => d.debutLe <= aujourdhui && (d.finLe === null || d.finLe >= aujourdhui);

type PourChoisir = Pick<Defi, 'id' | 'debutLe' | 'finLe'>;

/** Le défi de la semaine : celui dont la période d'une semaine au plus contient aujourd'hui ; à défaut, le plus récent en cours. */
export function defiDeLaSemaine<D extends PourChoisir>(defis: readonly D[], aujourdhui: Jour): D | null {
  const enCours = defis.filter((d) => estEnCours(d, aujourdhui));
  const hebdo = enCours.filter((d) => d.finLe !== null && d.finLe <= ajouterJours(d.debutLe, 6));
  const pool = hebdo.length > 0 ? hebdo : enCours;
  return [...pool].sort((a, b) => b.debutLe.localeCompare(a.debutLe) || a.id.localeCompare(b.id))[0] ?? null;
}

/** « Aussi en cours » : les autres défis en cours (tenus ou non), du plus récent au plus ancien. */
export function aussiEnCours<D extends PourChoisir>(defis: readonly D[], principalId: string | null, aujourdhui: Jour): D[] {
  return defis.filter((d) => d.id !== principalId && estEnCours(d, aujourdhui)).sort((a, b) => b.debutLe.localeCompare(a.debutLe) || a.id.localeCompare(b.id));
}

export interface DefiPasse {
  id: string;
  titre: string;
  /** Le jour où sa période s'est terminée. */
  finLe: Jour;
  issue: 'Tenu' | 'Terminé';
}

/**
 * La frise des défis passés : ceux dont la période est finie, du plus récent au plus ancien, chacun avec son issue
 * (« Tenu » ou « Terminé »). Un défi tenu reste dans la frise pour toujours (aucun point perdu).
 */
export function friseDesDefis(defis: readonly Defi[], aujourdhui: Jour): DefiPasse[] {
  return defis
    .filter((d): d is Defi & { finLe: Jour } => d.finLe !== null && d.finLe < aujourdhui)
    .map((d) => ({ id: d.id, titre: d.titre, finLe: d.finLe, issue: etatDuDefi(d, aujourdhui) === 'Tenu' ? ('Tenu' as const) : ('Terminé' as const) }))
    .sort((a, b) => b.finLe.localeCompare(a.finLe) || a.id.localeCompare(b.id));
}

/** Les défis devenus « Tenu » entre deux instants : ce qu'il y a à célébrer (une célébration par défi, une seule fois). */
export function defisACelebrer(avant: ReadonlyMap<string, EtatDeDefi>, apres: ReadonlyMap<string, EtatDeDefi>): string[] {
  return [...apres.entries()].filter(([id, etat]) => etat === 'Tenu' && avant.get(id) !== 'Tenu').map(([id]) => id).sort();
}

export interface Engagement {
  email: string;
  /** Ce que la personne s'engage à apporter, dans ses mots. Jamais un nombre calculé. */
  texte: string;
}

export interface ApportDeLaPersonne {
  email: string;
  /** Son engagement écrit, ou `null` : elle n'a pas encore écrit le sien (l'écran l'invite, sans rien reprocher). */
  engagement: string | null;
}

/**
 * « Ce que chacun apporte » : pour chaque participant, son engagement ÉCRIT. L'ordre est alphabétique, donc ne
 * dépend d'aucune valeur : ni classement, ni « meilleur contributeur ». Aucun nombre n'en sort.
 */
export function apportsDeLEquipe(participants: readonly string[], engagements: readonly Engagement[]): ApportDeLaPersonne[] {
  const parEmail = new Map(engagements.map((e) => [e.email, e.texte.trim()]));
  return [...new Set(participants)]
    .sort((a, b) => a.localeCompare(b))
    .map((email) => ({ email, engagement: parEmail.get(email) || null }));
}

/** Les types d'indicateur qu'un défi peut suivre : les modules dont un indicateur d'équipe existe (à confirmer, fiche L07). */
export const MODULES_SUIVIS: readonly string[] = ['Facturation', 'Messagerie', 'Missions et tickets', 'Retours clients'];

export interface PropositionDeDefi {
  titre: string;
  type: TypeDeDefi;
  cible: number;
  module: string;
}

export type ErreurDeProposition = 'titre-vide' | 'titre-long' | 'cible-invalide' | 'module-inconnu';

/** « Proposer un défi » : ce qu'il faut pour que la proposition soit prise (aucune règle cachée, aucune sanction). */
export function verifierProposition(p: PropositionDeDefi): ErreurDeProposition[] {
  const erreurs: ErreurDeProposition[] = [];
  if (p.titre.trim() === '') erreurs.push('titre-vide');
  else if (p.titre.trim().length > 80) erreurs.push('titre-long');
  const borne = p.type === 'Taux de tenue' ? 100 : Infinity;
  if (!Number.isFinite(p.cible) || p.cible <= 0 || p.cible > borne) erreurs.push('cible-invalide');
  if (!MODULES_SUIVIS.includes(p.module)) erreurs.push('module-inconnu');
  return erreurs;
}

/**
 * Jours consécutifs, jusqu'à aujourd'hui, sans facture en retard de plus de 3 jours (défi « Zéro impayé pendant 30
 * jours », règle proposée par la fiche L07). Une facture « en retard » : émise ou payée, échéance + 3 jours passée,
 * et pas encore réglée ce jour-là.
 */
export function joursSansImpaye(factures: readonly { status: string; dueAt: Jour; paidAt: Jour | '' | null }[], aujourdhui: Jour, tolerance = 3, horizon = 365): number {
  let jours = 0;
  for (let d = 0; d < horizon; d += 1) {
    const jour = ajouterJours(aujourdhui, -d);
    const impaye = factures.some((f) => (f.status === 'issued' || f.status === 'paid') && ajouterJours(f.dueAt, tolerance) <= jour && (!f.paidAt || f.paidAt > jour));
    if (impaye) break;
    jours += 1;
  }
  return jours;
}

import { dureeDAppel, minutesEcoulees, ms, MS_SECONDE, pourcent, type Instant, type Jour } from './commun';

/**
 * APPELS ET SALLES (H13) — combiné, plan des salles, standard, historique, rappels du jour. Logique pure.
 *
 * Aucun lien d'invitation, jeton ou mot de passe de salle n'est ici ; un numéro complet n'est montré qu'à qui a le
 * droit de voir la fiche. Aucun temps d'appel cumulé par personne, aucun classement.
 */

/* ------------------------------ Poste interne ------------------------------ */

export interface PosteInterne {
  numero: string;
  nom: string;
}

/**
 * Le nom d'un poste interne est résolu dès 3 chiffres (« 102 » = un collègue). Moins de 3 chiffres, ou un numéro
 * qui n'est pas exactement un poste : `null`. Un numéro externe (plus de 3 chiffres) n'est jamais résolu ici.
 */
export function resoudrePoste(saisie: string, annuaire: readonly PosteInterne[]): PosteInterne | null {
  const n = saisie.replace(/\D/g, '');
  if (n.length < 3 || n.length > 3) return null;
  return annuaire.find((p) => p.numero === n) ?? null;
}

/** Transfert « annoncé » (on parle d'abord au collègue) ou direct (Proposition) ; sans ligne pro, vers un membre plutôt qu'un poste. */
export type ModeDeTransfert = 'annonce' | 'direct';

/* ------------------------------ Les salles ------------------------------ */

export interface SalleMin {
  id: string;
  nom: string;
  capacite: number;
  /** Seule la supervision voit la salle de La Garde. */
  supervision?: boolean;
}

export interface Connecte {
  email: string;
  /** Dernière activité vocale détectée (aucun son n'est enregistré pour cela). */
  voixA?: Instant | null;
}

export type EtatDeSalle =
  | { genre: 'en-cours'; depuisMin: number; connectes: number; places: number; surPlaces: string; parle: string | null }
  | { genre: 'libre'; prochainEvenement: { at: number; titre: string } | null };

/** « parle » = activité vocale dans la dernière seconde ; un seul halo à la fois (le plus récent). */
export const PAROLE_MS = 1 * MS_SECONDE;

/**
 * Une salle est « en cours » avec au moins une personne connectée : « depuis 8 min » = depuis le début de la session,
 * « 2 sur 8 places » = connectés / capacité. Libre : le prochain événement du jour avec cette salle (calendrier H01),
 * sinon « Rien de prévu aujourd'hui » (`prochainEvenement: null`).
 */
export function etatDeSalle(salle: SalleMin, connectes: readonly Connecte[], debutDeSession: Instant | null, evenementsDuJour: readonly { at: Instant; titre: string }[], maintenant: Instant): EtatDeSalle {
  const t = ms(maintenant);
  if (connectes.length > 0 && debutDeSession !== null) {
    const parlants = connectes.filter((c) => c.voixA != null && t - ms(c.voixA) <= PAROLE_MS && t >= ms(c.voixA)).sort((a, b) => ms(b.voixA as Instant) - ms(a.voixA as Instant));
    return {
      genre: 'en-cours',
      depuisMin: minutesEcoulees(debutDeSession, maintenant),
      connectes: connectes.length,
      places: salle.capacite,
      surPlaces: `${connectes.length} / ${salle.capacite}`,
      parle: parlants.length ? parlants[0].email : null,
    };
  }
  const prochain = evenementsDuJour.filter((e) => ms(e.at) >= t).sort((a, b) => ms(a.at) - ms(b.at))[0];
  return { genre: 'libre', prochainEvenement: prochain ? { at: ms(prochain.at), titre: prochain.titre } : null };
}

/** La salle de La Garde s'ouvre quand La Garde déclare un incident (F70, Proposition) et n'est visible qu'aux rôles de supervision. */
export const salleDeLaGardeVisible = (incidentDeclare: boolean, roleDeSupervision: boolean): boolean => incidentDeclare && roleDeSupervision;

/** « 3 personnes connectées » = membres en salle + membres au téléphone, sans doublon. */
export const personnesConnectees = (enSalle: readonly string[], auTelephone: readonly string[]): number => new Set([...enSalle, ...auTelephone]).size;

/* ------------------------------ Le standard ------------------------------ */

export interface AppelEnFile {
  id: string;
  debutAt: Instant;
}

/** « 1 en attente » = appels en file ; temps d'attente en m:ss. */
export function standard(file: readonly AppelEnFile[], maintenant: Instant): { enAttente: number; attentes: { id: string; duree: string }[]; aucunAppel: boolean } {
  return {
    enAttente: file.length,
    attentes: file.map((a) => ({ id: a.id, duree: dureeDAppel(Math.floor((ms(maintenant) - ms(a.debutAt)) / 1000)) })),
    aucunAppel: file.length === 0,
  };
}

export { dureeDAppel };

/* ------------------------------ L'historique ------------------------------ */

export interface AppelTermine {
  id: string;
  titre: string;
  sens: 'entrant' | 'sortant' | 'manque';
  finAt: Instant;
  dureeSec: number;
  resume: string | null;
  decisions: readonly string[];
  taches: readonly string[];
  tachesCreees?: boolean;
  rappele?: boolean;
}

export interface LigneDHistorique {
  id: string;
  /** La première phrase du résumé d'Ajmani ; `null` : réglage coupé, la ligne n'a que titre, moment, durée et « Résumer ». */
  resumeEnUneLigne: string | null;
  decisions: number;
  taches: number;
  tachesCreees: boolean;
  /** Un appel manqué pas encore rappelé : la ligne « à rappeler » avec l'action utile. */
  aRappeler: boolean;
}

export function premierePhrase(texte: string): string {
  const p = texte.trim().split(/(?<=[.!?])\s+/)[0] ?? '';
  return p.trim();
}

/** Appels terminés, le plus récent d'abord. */
export function historique(appels: readonly AppelTermine[]): LigneDHistorique[] {
  return [...appels]
    .sort((a, b) => ms(b.finAt) - ms(a.finAt) || a.id.localeCompare(b.id))
    .map((a) => ({
      id: a.id,
      resumeEnUneLigne: a.resume ? premierePhrase(a.resume) : null,
      decisions: a.decisions.length,
      taches: a.taches.length,
      tachesCreees: !!a.tachesCreees && a.taches.length > 0,
      aRappeler: a.sens === 'manque' && !a.rappele,
    }));
}

/**
 * « Rappels du jour : 1 sur 2 » = appels manqués d'hier et d'aujourd'hui rappelés (ou repris) / appels manqués de la
 * même période. L'anneau a le même rapport. À « 2 sur 2 », le texte devient « Tous rappelés » (vert), sans pression.
 */
export function rappelsDuJour(appels: readonly AppelTermine[], aujourdhui: Jour): { faits: number; sur: number; pourcent: number; tousRappeles: boolean } {
  const veille = new Date(Date.parse(`${aujourdhui}T12:00:00Z`) - 86_400_000).toISOString().slice(0, 10);
  const manques = appels.filter((a) => {
    if (a.sens !== 'manque') return false;
    const j = new Date(ms(a.finAt)).toISOString().slice(0, 10);
    return j === aujourdhui || j === veille;
  });
  const faits = manques.filter((a) => a.rappele).length;
  return { faits, sur: manques.length, pourcent: pourcent(faits, manques.length), tousRappeles: manques.length > 0 && faits === manques.length };
}

/**
 * Un résumé n'ajoute jamais un chiffre ou une date absente de la source : renvoie les nombres du résumé qu'on ne
 * retrouve pas dans la source (liste vide = résumé fidèle). Sert à H13 et à MX02.
 */
export function nombresAbsentsDeLaSource(resume: string, source: string): string[] {
  const nombres = (t: string) => [...t.matchAll(/\d+(?:[.,:]\d+)*/g)].map((m) => m[0].replace(',', '.'));
  const connus = new Set(nombres(source));
  return nombres(resume).filter((n) => !connus.has(n));
}

/** L'enregistrement de la voix n'est fait qu'avec l'accord affiché à tous les participants. */
export const peutEnregistrerLaVoix = (accords: Readonly<Record<string, boolean>>, participants: readonly string[]): boolean => participants.length > 0 && participants.every((p) => accords[p] === true);

/** Sans droit d'appel externe, « Appeler » et le pavé sont masqués. */
export const paveVisible = (droitDAppelExterne: boolean, ligneProBranchee: boolean): boolean => droitDAppelExterne && ligneProBranchee;


/** Les filtres de l'historique : « Tout », « Manqués 1 », « Avec résumé 3 » (image v4). */
export function compteursDHistorique(appels: readonly AppelTermine[]): { tout: number; manques: number; avecResume: number } {
  return { tout: appels.length, manques: appels.filter((a) => a.sens === 'manque').length, avecResume: appels.filter((a) => !!a.resume).length };
}

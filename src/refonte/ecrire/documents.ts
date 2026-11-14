import { ajouterJours, ajouterMois, ecartJours, ms, pourcent, type Instant, type Jour } from './commun';

/**
 * DOCUMENTS (H11) — le classeur : intercalaires, liste par année, états de signature,
 * faits relevés d'un contrat, versions, espace. Logique pure.
 */

export interface FichierMin {
  id: string;
  nom: string;
  /** Un intercalaire par type de document. */
  typeMetier: string;
  tailleOctets: number;
  /** Date de la version courante : sert au groupement par année. */
  modifieAt: Instant;
  archive: boolean;
  supprimeeLe?: Jour | null;
  clientId?: number | string | null;
}

/** Au plus 8 intercalaires affichés ; au-delà, un menu « Plus » (H11 §6, Proposition). */
export const INTERCALAIRES_VISIBLES = 8;
/** Lignes visibles d'un groupe avant « N autres contrats » (H11 §6). */
export const LIGNES_VISIBLES = 8;

const rangeable = (f: FichierMin) => !f.archive && !f.supprimeeLe;

export interface Intercalaire {
  type: string;
  /** Fichiers du type, hors corbeille et archives. */
  compteur: number;
}

/**
 * Les intercalaires : un par type, du plus fourni au moins fourni (à égalité, par nom).
 * `types` impose les types à montrer même vides (les intercalaires du métier, « 0 »).
 */
export function intercalaires(fichiers: readonly FichierMin[], types: readonly string[] = []): { visibles: Intercalaire[]; plus: Intercalaire[]; total: number } {
  const n = new Map<string, number>(types.map((t) => [t, 0]));
  for (const f of fichiers) if (rangeable(f)) n.set(f.typeMetier, (n.get(f.typeMetier) ?? 0) + 1);
  const tous = [...n].map(([type, compteur]) => ({ type, compteur })).sort((a, b) => b.compteur - a.compteur || a.type.localeCompare(b.type));
  return { visibles: tous.slice(0, INTERCALAIRES_VISIBLES), plus: tous.slice(INTERCALAIRES_VISIBLES), total: tous.reduce((s, i) => s + i.compteur, 0) };
}

export interface GroupeAnnuel {
  annee: number;
  /** Tous les fichiers de l'année (compteur de bande). */
  compteur: number;
  fichiers: FichierMin[];
}

/** La liste d'un intercalaire, groupée par année de la version courante, la plus récente d'abord. */
export function listeParAnnee(fichiers: readonly FichierMin[], type: string): { groupes: GroupeAnnuel[]; visibles: number; autres: number } {
  const lignes = fichiers.filter((f) => rangeable(f) && f.typeMetier === type).sort((a, b) => ms(b.modifieAt) - ms(a.modifieAt) || a.id.localeCompare(b.id));
  const parAnnee = new Map<number, FichierMin[]>();
  for (const f of lignes) {
    const annee = Number(new Date(ms(f.modifieAt)).toISOString().slice(0, 4));
    parAnnee.set(annee, [...(parAnnee.get(annee) ?? []), f]);
  }
  const groupes = [...parAnnee].sort((a, b) => b[0] - a[0]).map(([annee, fs]) => ({ annee, compteur: fs.length, fichiers: fs }));
  // Au-delà de 8 lignes visibles : « N autres » charge la suite.
  let reste = LIGNES_VISIBLES;
  const decoupe = groupes.map((g) => {
    const garde = g.fichiers.slice(0, Math.max(0, reste));
    reste -= garde.length;
    return { ...g, fichiers: garde };
  });
  const visibles = decoupe.reduce((s, g) => s + g.fichiers.length, 0);
  return { groupes: decoupe.filter((g) => g.fichiers.length > 0), visibles, autres: lignes.length - visibles };
}

/* ------------------------------ États de ligne ------------------------------ */

export type EtatDeLigne = 'signe' | 'a-signer' | 'envoye' | 'a-renouveler' | null;

export interface DemandeLiee {
  /** `Signée` ; `Envoyée` (jamais ouverte) ; `Ouverte` ou `Partiellement signée` (en cours) ; autres : aucun état affiché. */
  etat: 'À envoyer' | 'Envoyée' | 'Ouverte' | 'Partiellement signée' | 'Signée' | 'Refusée' | 'Expirée';
}

/** Fin de préavis dans les 60 jours : « 1 à renouveler bientôt » (Proposition). */
export const JOURS_AVANT_RENOUVELLEMENT = 60;

export function aRenouvelerBientot(echeanceDeDenonciation: Jour | null | undefined, aujourdhui: Jour): boolean {
  if (!echeanceDeDenonciation) return false;
  const d = ecartJours(aujourdhui, echeanceDeDenonciation);
  return d >= 0 && d <= JOURS_AVANT_RENOUVELLEMENT;
}

/**
 * L'état affiché sur une ligne : « Signé » (vert) si la demande est terminée ; « À signer » (ambre) si elle est
 * en cours ; « Envoyé » (gris) si elle est partie sans ouverture ; « À renouveler » (ambre) si l'échéance approche ;
 * rien sinon. La fiche ne dit pas lequel l'emporte quand un contrat signé arrive à échéance : ici « À renouveler »,
 * qui appelle une action (question pour le CO dans la note du lot).
 */
export function etatDeLigne(demande: DemandeLiee | null | undefined, echeanceDeDenonciation: Jour | null | undefined, aujourdhui: Jour): EtatDeLigne {
  if (demande?.etat === 'Signée') return aRenouvelerBientot(echeanceDeDenonciation, aujourdhui) ? 'a-renouveler' : 'signe';
  if (demande?.etat === 'Ouverte' || demande?.etat === 'Partiellement signée') return 'a-signer';
  if (demande?.etat === 'Envoyée') return 'envoye';
  return aRenouvelerBientot(echeanceDeDenonciation, aujourdhui) ? 'a-renouveler' : null;
}

/* ------------------------------ Faits relevés d'un contrat ------------------------------ */

/** Prix annuel = prix mensuel × 12, en centimes. */
export const prixAnnuelCents = (mensuelCents: number): number => Math.round(mensuelCents) * 12;

/** Date de préavis = fin de contrat − préavis (31 oct. 2027 − 2 mois = 31 août 2027). */
export const datePreavis = (finDeContrat: Jour, preavisMois: number): Jour => ajouterMois(finDeContrat, -preavisMois);

/** Rappel proposé : 30 jours avant la date de préavis (Proposition). Créé seulement après accord. */
export const JOURS_RAPPEL_AVANT_PREAVIS = 30;
export const rappelDePreavis = (preavis: Jour): Jour => ajouterJours(preavis, -JOURS_RAPPEL_AVANT_PREAVIS);

export interface FaitReleve {
  cle: 'parties' | 'prix' | 'duree' | 'renouvellement' | 'clauses';
  valeur: string;
  /** Repère numéroté sur la page (①…⑤). Un fait sans repère n'est pas montré : Ajmani n'affiche jamais une valeur absente de la page. */
  repere: number | null;
  verifiePar?: string | null;
  verifieLe?: Jour | null;
  /** Version où ce fait est apparu (« ajouté en v3 », image v4). */
  ajouteEnVersion?: number | null;
}

export type EtatDuFait = 'verifie' | 'a-verifier' | 'sans-repere';

/** Un fait reste « à vérifier » (pointillé) tant qu'une personne ne l'a pas validé. */
export function etatDuFait(f: FaitReleve): EtatDuFait {
  if (f.repere === null) return 'sans-repere';
  return f.verifiePar ? 'verifie' : 'a-verifier';
}

/** Les faits à montrer : ceux qui ont un repère sur la page, dans l'ordre des repères. */
export const faitsAMontrer = (faits: readonly FaitReleve[]): FaitReleve[] =>
  faits.filter((f) => f.repere !== null).sort((a, b) => (a.repere as number) - (b.repere as number));

/* ------------------------------ Versions ------------------------------ */

export interface VersionDeFichier {
  numero: number;
  creeAt: Instant;
  signee: boolean;
  actuelle: boolean;
}

/** Conservées 90 jours, sauf l'actuelle et toute version signée (gardée tant que le contrat vit). */
export const JOURS_DE_VERSION = 90;

export function versionsAPurger(versions: readonly VersionDeFichier[], maintenant: Instant): number[] {
  const t = ms(maintenant);
  return versions.filter((v) => !v.actuelle && !v.signee && t - ms(v.creeAt) > JOURS_DE_VERSION * 86_400_000).map((v) => v.numero);
}

/**
 * Restaurer crée une nouvelle version identique à l'ancienne (v4 = v2) ; rien n'est écrasé.
 * `avertirNonSignee` : si l'ancienne était signée, la nouvelle ne l'est pas, et l'écran le dit avant.
 */
export function restaurer(versions: readonly VersionDeFichier[], numero: number, maintenant: Instant): { versions: VersionDeFichier[]; nouvelle: VersionDeFichier; avertirNonSignee: boolean } {
  const source = versions.find((v) => v.numero === numero);
  if (!source) throw new Error(`version inconnue : v${numero}`);
  const suivant = Math.max(...versions.map((v) => v.numero)) + 1;
  const nouvelle: VersionDeFichier = { numero: suivant, creeAt: new Date(ms(maintenant)).toISOString(), signee: false, actuelle: true };
  return { versions: [...versions.map((v) => ({ ...v, actuelle: false })), nouvelle], nouvelle, avertirNonSignee: source.signee };
}

/* ------------------------------ Espace ------------------------------ */

export type TonEspace = 'neutre' | 'ambre' | 'rouge';

/** Barre neutre sous 80 %, ambre de 80 à 95 %, rouge au-delà. À 100 % : « Plus de place ». */
export function jaugeEspace(utiliseOctets: number, quotaOctets: number): { pourcent: number; ton: TonEspace; plein: boolean; reste: number } {
  const p = pourcent(utiliseOctets, quotaOctets);
  const exact = quotaOctets > 0 ? (utiliseOctets / quotaOctets) * 100 : 0;
  const ton: TonEspace = exact < 80 ? 'neutre' : exact <= 95 ? 'ambre' : 'rouge';
  return { pourcent: p, ton, plein: quotaOctets > 0 && utiliseOctets >= quotaOctets, reste: Math.max(0, quotaOctets - utiliseOctets) };
}

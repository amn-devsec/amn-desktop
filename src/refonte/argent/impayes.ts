import { ECHELLE, type PalierRelance } from '../../lib/relances';
import { arrondi, ecartJours, formaterJour, formaterMontant, jourDuMois, moisDe, moisSuivant, type Jour, type Langue, type Mois } from './commun';
import { joursDeRetard, resteDu, statutFacture, type ContexteFacture, type FactureLue } from './facturation';
import { traduire } from './i18n';

/**
 * IMPAYÉS (MA04) — fiche v4, rubrique 6.
 *
 * MA04 est un écran INFORMATIF : il ne calcule ni pénalités ni intérêts (« Aucune
 * pénalité n'est calculée ici »). Le taux des pénalités n'existe que comme RÉGLAGE de
 * l'identité de facturation, pour la mention portée sur les factures (STATUT §1.29 n° 6) :
 * voir `tauxPenalitesParDefaut`.
 *
 * Rien n'est jamais envoyé d'ici : une relance est PRÉPARÉE, au vouvoiement (elle part
 * chez le client), la personne la relit et l'envoie. L'étape « Mise en demeure » n'est
 * jamais atteinte automatiquement : elle exige l'accord d'un administrateur, et son texte
 * est à valider par un juriste ou un comptable.
 *
 * L'échelle de relance de la fiche (À relancer, Relance 1 à J+7, Relance 2 à J+21, Mise
 * en demeure à J+45) diffère des paliers de `src/lib/relances.ts` (écran existant :
 * rappel, ferme, mise en demeure dès J+22, dernier avis) : ce module suit la fiche, et
 * l'écart est porté au CO.
 */

export type Tranche = '0-30' | '31-60' | '61-90' | '90+';
export const TRANCHES: readonly Tranche[] = ['0-30', '31-60', '61-90', '90+'];

/** La colonne d'un retard en jours ; chaque borne appartient à la tranche basse (30 → « 0-30 »). */
export function trancheDe(jours: number): Tranche {
  if (jours <= 30) return '0-30';
  if (jours <= 60) return '31-60';
  if (jours <= 90) return '61-90';
  return '90+';
}

/* ── Échelle de relance ─────────────────────────────────────────────────── */

export type Etape = 'a-relancer' | 'relance-1' | 'relance-2' | 'mise-en-demeure';
export const ETAPES: readonly Etape[] = ['a-relancer', 'relance-1', 'relance-2', 'mise-en-demeure'];

/**
 * Le réglage « Politique de relance » : jours après l'échéance. UN SEUL MOTEUR (STATUT
 * §1.28 n° 2) : les valeurs par défaut sont les seuils de `src/lib/relances.ts` (7, 21,
 * 45, ceux de la fiche MA04), lus, jamais recopiés ; comme `paliereDe`, une étape
 * s'ouvre APRÈS son seuil (relance 1 au 8e jour de retard).
 */
export interface PolitiqueDeRelance {
  relance1: number;
  relance2: number;
  miseEnDemeure: number;
}
const seuilDe = (palier: PalierRelance): number => ECHELLE.find((e) => e.palier === palier)?.auDela ?? 0;
export const POLITIQUE_PAR_DEFAUT: PolitiqueDeRelance = { relance1: seuilDe('ferme'), relance2: seuilDe('mise-en-demeure'), miseEnDemeure: seuilDe('dernier-avis') };

/** Ce que les relances d'une facture disent (jeu `relances` : `objetId`, `etat`, `nbEnvoyees`). */
export interface RelancesLues {
  objetId: string;
  etat: 'prête' | 'envoyée' | 'répondue' | 'arrêtée' | string;
  nbEnvoyees: number;
}

/** L'étape où se pose le client : la DERNIÈRE ÉTAPE FAITE (« À relancer » = aucune relance envoyée). */
export function etapeFaite(nbEnvoyees: number, miseEnDemeureFaite = false): Etape {
  if (miseEnDemeureFaite) return 'mise-en-demeure';
  if (nbEnvoyees >= 2) return 'relance-2';
  if (nbEnvoyees === 1) return 'relance-1';
  return 'a-relancer';
}

/**
 * L'étape suivante, si son délai est atteint : `null` sinon. La mise en demeure n'est
 * jamais proposée sans l'accord d'un administrateur : `accordRequis` le dit.
 */
export function etapeSuivante(joursRetard: number, nbEnvoyees: number, politique: PolitiqueDeRelance = POLITIQUE_PAR_DEFAUT): { etape: Etape; accordRequis: boolean } | null {
  if (nbEnvoyees === 0 && joursRetard > politique.relance1) return { etape: 'relance-1', accordRequis: false };
  if (nbEnvoyees === 1 && joursRetard > politique.relance2) return { etape: 'relance-2', accordRequis: false };
  if (nbEnvoyees >= 2 && joursRetard > politique.miseEnDemeure) return { etape: 'mise-en-demeure', accordRequis: true };
  return null;
}

/** L'action de la carte : « Appeler » à partir de la relance 2 ou au-delà de 30 jours, sinon « Relancer ». */
export const actionDeCarte = (joursRetard: number, nbEnvoyees: number): 'appeler' | 'relancer' => (nbEnvoyees >= 2 || joursRetard > 30 ? 'appeler' : 'relancer');

/** Le sous-titre de la carte : « relance prête », sinon « relance N envoyée », sinon « aucune relance ». */
export function etatDeRelance(r: RelancesLues | undefined): { cle: 'relance.prete' | 'relance.envoyee' | 'relance.aucune'; n: number } {
  if (r?.etat === 'prête') return { cle: 'relance.prete', n: r.nbEnvoyees };
  if (r && r.nbEnvoyees > 0) return { cle: 'relance.envoyee', n: r.nbEnvoyees };
  return { cle: 'relance.aucune', n: 0 };
}

/* ── Les impayés ────────────────────────────────────────────────────────── */

export interface Impaye {
  facture: FactureLue;
  joursRetard: number;
  resteCents: number;
  tranche: Tranche;
  relancePrete: boolean;
  nbEnvoyees: number;
}

/** Les impayés (MA04) : factures « En retard » de G03 (envoyées ou vues, échéance dépassée, solde dû > 0). */
export function impayes(factures: readonly FactureLue[], aujourdhui: Jour, ctx: Pick<ContexteFacture, 'paiements'> & { relances?: readonly RelancesLues[] }): Impaye[] {
  const c: ContexteFacture = { factures, paiements: ctx.paiements };
  const parFacture = new Map((ctx.relances ?? []).map((r) => [r.objetId, r]));
  return factures
    .filter((f) => statutFacture(f, aujourdhui, c) === 'en-retard')
    .map((f) => {
      const j = joursDeRetard(f, aujourdhui);
      const r = parFacture.get(f.id);
      return { facture: f, joursRetard: j, resteCents: resteDu(f, c), tranche: trancheDe(j), relancePrete: r?.etat === 'prête', nbEnvoyees: r?.nbEnvoyees ?? 0 };
    });
}

export const totalImpaye = (factures: readonly FactureLue[], aujourdhui: Jour, ctx: Pick<ContexteFacture, 'paiements'>): number =>
  impayes(factures, aujourdhui, ctx).reduce((s, i) => s + i.resteCents, 0);

/**
 * Les quatre colonnes, toujours dans le même ordre, même vides ; dans une colonne :
 * retard décroissant, puis « relance prête » en premier à retard égal.
 */
export function colonnesDeRetard(factures: readonly FactureLue[], aujourdhui: Jour, ctx: Pick<ContexteFacture, 'paiements'> & { relances?: readonly RelancesLues[] }): { tranche: Tranche; nombre: number; montantCents: number; cartes: Impaye[] }[] {
  const liste = impayes(factures, aujourdhui, ctx);
  return TRANCHES.map((tranche) => {
    const cartes = liste.filter((i) => i.tranche === tranche).sort((a, b) => b.joursRetard - a.joursRetard || Number(b.relancePrete) - Number(a.relancePrete));
    return { tranche, nombre: cartes.length, montantCents: cartes.reduce((s, i) => s + i.resteCents, 0), cartes };
  });
}

/** Les tranches seules (nombre et montant), pour F30 et G03. */
export const tranchesDeRetard = (factures: readonly FactureLue[], aujourdhui: Jour, ctx: Pick<ContexteFacture, 'paiements'>) =>
  colonnesDeRetard(factures, aujourdhui, ctx).map(({ tranche, nombre, montantCents }) => ({ tranche, nombre, montantCents }));

/** « Objectif zéro impayé » : récupéré ce mois ÷ (récupéré + encore en retard), en % entier. */
export function objectifZeroImpaye(recupereCents: number, enRetardCents: number): { totalCents: number; pourcentage: number } {
  const total = recupereCents + enRetardCents;
  return { totalCents: total, pourcentage: total === 0 ? 100 : arrondi((recupereCents / total) * 100) };
}

/**
 * Délai moyen de paiement (G03) : moyenne (paiement − émission) des factures payées dans
 * la période (`AAAA-MM`, ou toutes sans période), arrondie au jour ; `null` sans facture payée.
 */
export function delaiMoyenDePaiement(factures: readonly FactureLue[], periode?: Mois): number | null {
  const payees = factures.filter((f) => f.status === 'paid' && f.issuedAt && f.paidAt && (!periode || moisDe(f.paidAt) === periode));
  if (payees.length === 0) return null;
  return arrondi(payees.reduce((s, f) => s + ecartJours(f.issuedAt, f.paidAt as string), 0) / payees.length);
}

/** « N de mieux » (plus court), « N de plus », ou « stable », d'une période à la précédente. */
export function comparerDelais(actuel: number | null, precedent: number | null): { sens: 'mieux' | 'plus' | 'stable'; jours: number } | null {
  if (actuel === null || precedent === null) return null;
  if (actuel === precedent) return { sens: 'stable', jours: 0 };
  return actuel < precedent ? { sens: 'mieux', jours: precedent - actuel } : { sens: 'plus', jours: actuel - precedent };
}

/**
 * La suggestion de MA04 : un impayé de plus de 30 jours avec au moins 2 relances.
 * Deux échéances = solde ÷ 2 (le centime restant va à la seconde), le 5 et le 20 du mois
 * suivant. « A du mal à payer » est une inférence interne, jamais montrée au client.
 */
export function planEnDeuxEcheances(i: Pick<Impaye, 'joursRetard' | 'nbEnvoyees' | 'resteCents'>, aujourdhui: Jour): { echeances: { date: Jour; montantCents: number }[] } | null {
  if (i.joursRetard <= 30 || i.nbEnvoyees < 2 || i.resteCents <= 0) return null;
  const premiere = Math.floor(i.resteCents / 2);
  const suivant = moisSuivant(moisDe(aujourdhui));
  return { echeances: [{ date: jourDuMois(suivant, 5), montantCents: premiere }, { date: jourDuMois(suivant, 20), montantCents: i.resteCents - premiere }] };
}

/* ── Le taux des pénalités : un réglage, jamais un calcul de MA04 ───────── */

/**
 * LE TAUX DES PÉNALITÉS (STATUT §1.29 n° 6) : un réglage de l'identité de facturation,
 * repris par H18, pour la mention des factures. Par défaut, le MINIMUM LÉGAL entre
 * professionnels, présenté comme tel : trois fois le taux d'intérêt légal (taux du
 * semestre = donnée du réglage, jamais écrit dans le code). À valider par un comptable.
 */
export const MULTIPLE_MINIMUM_LEGAL = 3;

export type TauxPenalites = { source: 'minimum-legal'; tauxAnnuelPct: number } | { source: 'conditions-generales'; tauxAnnuelPct: number };

export function tauxPenalitesParDefaut(tauxInteretLegalPct: number): TauxPenalites {
  return { source: 'minimum-legal', tauxAnnuelPct: Math.round(tauxInteretLegalPct * MULTIPLE_MINIMUM_LEGAL * 100) / 100 };
}

/* ── La relance préparée ────────────────────────────────────────────────── */

export interface RelancePreparee {
  etape: Exclude<Etape, 'a-relancer'>;
  joursRetard: number;
  resteCents: number;
  /** Le texte à envoyer, au vouvoiement. */
  texte: string;
  /** Toujours faux : l'application prépare, la personne envoie. */
  envoyee: false;
}

/**
 * Prépare le message de l'étape suivante, si son délai est atteint. La mise en demeure
 * n'est préparée qu'avec l'accord d'un administrateur (`accordAdministrateur`) ; sans
 * lui, `{ accordRequis: true }`. Elle n'a AUCUN modèle par défaut (MA04 : texte à
 * portée juridique, à valider par un juriste) : le modèle validé vient du réglage
 * (`modeleMiseEnDemeure`, mêmes paramètres que les relances) ; sans lui, `{ modeleRequis: true }`.
 */
export function preparerRelance(
  f: FactureLue,
  aujourdhui: Jour,
  ctx: Pick<ContexteFacture, 'paiements'> & Partial<Pick<ContexteFacture, 'factures'>> & { nbEnvoyees?: number; politique?: PolitiqueDeRelance; accordAdministrateur?: boolean; modeleMiseEnDemeure?: string },
  langue: Langue = 'fr',
): RelancePreparee | { accordRequis: true } | { modeleRequis: true } | null {
  const jours = joursDeRetard(f, aujourdhui);
  const suite = etapeSuivante(jours, ctx.nbEnvoyees ?? 0, ctx.politique);
  if (!suite || suite.etape === 'a-relancer') return null;
  if (suite.accordRequis && !ctx.accordAdministrateur) return { accordRequis: true };
  if (suite.etape === 'mise-en-demeure' && !ctx.modeleMiseEnDemeure?.trim()) return { modeleRequis: true };
  const reste = resteDu(f, { factures: ctx.factures ?? [f], paiements: ctx.paiements });
  if (reste === 0) return null;
  const valeurs = { numero: f.number, montant: formaterMontant(reste, langue), echeance: formaterJour(f.dueAt, langue), jours: String(jours) };
  const texte =
    suite.etape === 'mise-en-demeure'
      ? (ctx.modeleMiseEnDemeure as string).replace(/\{(\w+)\}/g, (m, k: string) => (k in valeurs ? valeurs[k as keyof typeof valeurs] : m))
      : traduire(langue, `client.relance.${suite.etape}`, valeurs);
  return { etape: suite.etape, joursRetard: jours, resteCents: reste, texte, envoyee: false };
}

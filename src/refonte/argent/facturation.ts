import type { Invoice, InvoiceLine } from '../../shared/api';
import { ajouterJours, arrondi, ecartJours, type Jour } from './commun';

/**
 * FACTURATION (G03, H07, MA04) — totaux, reste dû, statut, échéance, numérotation,
 * mentions.
 *
 * LA RÈGLE DE LA TVA (décision du CO, STATUT §1.29 n° 1, provisoire, révisable par
 * Harun après l'avis d'un comptable). La TVA s'arrondit LIGNE PAR LIGNE, puis se
 * totalise par taux : exactement la règle de `src/lib/money.ts` (`lineAmounts`,
 * `documentTotals`). `money.ts` sert aussi l'édition cliente, qui ne change pas, et
 * toutes les factures d'une organisation suivent une seule règle. Sur trois lignes de
 * 0,33 € à 20 %, cela donne 0,21 € de TVA (la règle par taux de la fiche H07 donnerait
 * 0,20 €). Les jeux de SIM, encore par taux, s'alignent (§1.29 n° 4 et n° 1).
 */

export type Ligne = Pick<InvoiceLine, 'quantity' | 'unitPriceCents' | 'vatRate'> & Partial<Pick<InvoiceLine, 'label' | 'id'>>;

export interface TotalTaux {
  taux: number;
  baseCents: number;
  tvaCents: number;
}

export interface TotauxDocument {
  htCents: number;
  tvaCents: number;
  ttcCents: number;
  /** Une entrée par taux employé, du plus petit au plus grand. */
  parTaux: TotalTaux[];
  /** Ce que la remise globale a retiré du hors taxes (0 sans remise). */
  remiseCents: number;
}

/**
 * Les totaux d'un devis, d'une facture ou d'un avoir — sans remise, identiques à
 * `documentTotals` de `src/lib/money.ts` (`check:argent` le vérifie).
 *
 * `remisePct` est une remise globale sur le hors taxes : elle s'applique au hors taxes
 * de chaque ligne, arrondi au centime, avant la TVA de la ligne.
 */
export function totauxDocument(lignes: readonly Ligne[], remisePct = 0): TotauxDocument {
  const facteur = (100 - Math.min(100, Math.max(0, remisePct))) / 100;
  const parTauxMap = new Map<number, TotalTaux>();
  let brut = 0;
  for (const l of lignes) {
    const taux = Number.isFinite(l.vatRate) ? l.vatRate : 0;
    const net = arrondi((Number.isFinite(l.quantity) ? l.quantity : 0) * (Number.isFinite(l.unitPriceCents) ? l.unitPriceCents : 0));
    brut += net;
    const base = remisePct ? arrondi(net * facteur) : net;
    const t = parTauxMap.get(taux) ?? { taux, baseCents: 0, tvaCents: 0 };
    t.baseCents += base;
    t.tvaCents += arrondi((base * taux) / 100);
    parTauxMap.set(taux, t);
  }
  const parTaux = [...parTauxMap.values()].sort((a, b) => a.taux - b.taux);
  const htCents = parTaux.reduce((s, t) => s + t.baseCents, 0);
  const tvaCents = parTaux.reduce((s, t) => s + t.tvaCents, 0);
  return { htCents, tvaCents, ttcCents: htCents + tvaCents, parTaux, remiseCents: brut - htCents };
}

/** Ce qu'une facture lit : le sous-ensemble d'`Invoice` utile aux calculs. */
export type FactureLue = Pick<Invoice, 'id' | 'status' | 'issuedAt' | 'dueAt' | 'lines' | 'number'> &
  Partial<Pick<Invoice, 'kind' | 'creditNoteFor' | 'paidAt' | 'billTo' | 'notes' | 'clientId'>> & {
    /** Nombre d'ouvertures du lien ou de l'e-mail par le client (G03 : « Vue N fois »). Absent = jamais vue. */
    vues?: number;
  };

/** Un règlement reçu (jeu `paiements`, MA03) ; seuls les « réussi » comptent. */
export interface ReglementLu {
  factureId: string | null;
  montantCents: number;
  etat: 'réussi' | 'en attente' | 'échoué' | 'remboursé';
  date?: string;
}

/** Le contexte d'une facture : toutes les factures (pour ses avoirs) et les règlements reçus. */
export interface ContexteFacture {
  factures: readonly FactureLue[];
  paiements: readonly ReglementLu[];
}

const estAvoir = (f: Pick<FactureLue, 'kind'>) => f.kind === 'creditNote';
const engage = (f: Pick<FactureLue, 'status'>) => f.status === 'issued' || f.status === 'paid';

/** Les avoirs émis sur cette facture (jamais les brouillons ni les annulés), en centimes TTC. */
export function avoirsEmis(f: Pick<FactureLue, 'id'>, factures: readonly FactureLue[]): number {
  return factures.filter((a) => estAvoir(a) && a.creditNoteFor === f.id && engage(a)).reduce((s, a) => s + totauxDocument(a.lines).ttcCents, 0);
}

/** Les règlements réussis reçus pour cette facture. */
export function encaisse(f: Pick<FactureLue, 'id'>, paiements: readonly ReglementLu[]): number {
  return paiements.filter((p) => p.factureId === f.id && p.etat === 'réussi').reduce((s, p) => s + p.montantCents, 0);
}

/**
 * Ce qui reste réellement dû : TTC − avoirs émis − règlements réussis, jamais
 * négatif. Une facture payée, annulée ou en brouillon, et un avoir, ne doivent rien.
 */
export function resteDu(f: FactureLue, ctx: ContexteFacture): number {
  if (estAvoir(f) || f.status !== 'issued') return 0;
  return Math.max(0, totauxDocument(f.lines).ttcCents - avoirsEmis(f, ctx.factures) - encaisse(f, ctx.paiements));
}

/** Les statuts de G03 (rubrique 6) ; « En retard » est dérivé, jamais stocké. */
export type StatutFacture = 'brouillon' | 'envoyee' | 'vue' | 'en-retard' | 'payee' | 'annulee';

/** Les jours de retard : 0 tant que l'échéance n'est pas dépassée (le jour même n'est pas en retard). */
export function joursDeRetard(f: Pick<FactureLue, 'dueAt'>, aujourdhui: Jour): number {
  if (!f.dueAt) return 0;
  return Math.max(0, ecartJours(f.dueAt, aujourdhui));
}

/**
 * Le statut AFFICHÉ (G03 rubrique 6), toujours calculé :
 *   · Payée quand le solde restant dû vaut 0 (règlements et avoirs compris) ;
 *   · En retard : Envoyée ou Vue avec une échéance STRICTEMENT avant aujourd'hui et un
 *     solde dû (MA04) — la facture est alors comptée là seulement ;
 *   · Vue dès que le client l'a ouverte, sinon Envoyée (un paiement partiel, une carte
 *     en cours ou un prélèvement en cours gardent ce statut).
 */
export function statutFacture(f: FactureLue, aujourdhui: Jour, ctx: ContexteFacture): StatutFacture {
  if (f.status === 'draft') return 'brouillon';
  if (f.status === 'cancelled') return 'annulee';
  if (f.status === 'paid') return 'payee';
  if (estAvoir(f)) return 'envoyee';
  if (resteDu(f, ctx) === 0) return 'payee';
  if (joursDeRetard(f, aujourdhui) > 0) return 'en-retard';
  return (f.vues ?? 0) > 0 ? 'vue' : 'envoyee';
}

/** La couleur d'un retard (G03, MA04) : orange jusqu'à 30 jours, rouge au-delà. */
export const graviteRetard = (jours: number): 'orange' | 'rouge' => (jours > 30 ? 'rouge' : 'orange');

/**
 * La bande de G03 pour une période (`AAAA-MM`) : nombre et montant par station.
 * Brouillons, Envoyées et Vues : émises ou créées dans la période (brouillons : tous) ;
 * En retard : tous les retards encore ouverts, quelle que soit la période ; Payées : les
 * factures payées dans la période. Montants : le solde dû (le TTC pour un brouillon et
 * une payée).
 */
export function compteursParStation(
  factures: readonly FactureLue[],
  periode: string,
  aujourdhui: Jour,
  ctx: Pick<ContexteFacture, 'paiements'>,
): Record<'brouillons' | 'envoyees' | 'vues' | 'enRetard' | 'payees', { nombre: number; montantCents: number }> {
  const c: ContexteFacture = { factures, paiements: ctx.paiements };
  const vide = () => ({ nombre: 0, montantCents: 0 });
  const r = { brouillons: vide(), envoyees: vide(), vues: vide(), enRetard: vide(), payees: vide() };
  const ajouter = (k: keyof typeof r, montant: number) => {
    r[k].nombre += 1;
    r[k].montantCents += montant;
  };
  for (const f of factures) {
    if (estAvoir(f)) continue;
    const st = statutFacture(f, aujourdhui, c);
    const dansPeriode = (f.issuedAt ?? '').startsWith(periode);
    if (st === 'brouillon') ajouter('brouillons', totauxDocument(f.lines).ttcCents);
    else if (st === 'en-retard') ajouter('enRetard', resteDu(f, c));
    else if (st === 'envoyee' && dansPeriode) ajouter('envoyees', resteDu(f, c));
    else if (st === 'vue' && dansPeriode) ajouter('vues', resteDu(f, c));
    else if (st === 'payee' && (f.paidAt ?? '').startsWith(periode)) ajouter('payees', totauxDocument(f.lines).ttcCents);
  }
  return r;
}

/** « X € attendus » (G03) = « à encaisser » (F30) : les soldes des factures Envoyées et Vues, hors retards. */
export function montantAttendu(factures: readonly FactureLue[], aujourdhui: Jour, ctx: Pick<ContexteFacture, 'paiements'>): number {
  const c: ContexteFacture = { factures, paiements: ctx.paiements };
  return factures.filter((f) => !estAvoir(f) && ['envoyee', 'vue'].includes(statutFacture(f, aujourdhui, c))).reduce((s, f) => s + resteDu(f, c), 0);
}

/**
 * L'ordre de la liste de G03 : retards d'abord (le plus ancien en tête), puis Vues et
 * Envoyées (par échéance), puis Brouillons, puis Payées (les plus récentes d'abord),
 * puis Annulées.
 */
export function ordreDeListe<F extends FactureLue>(factures: readonly F[], aujourdhui: Jour, ctx: Pick<ContexteFacture, 'paiements'>): F[] {
  const c: ContexteFacture = { factures, paiements: ctx.paiements };
  const rang: Record<StatutFacture, number> = { 'en-retard': 0, vue: 1, envoyee: 1, brouillon: 2, payee: 3, annulee: 4 };
  const cle = (f: F) => {
    const st = statutFacture(f, aujourdhui, c);
    return { st, r: rang[st] };
  };
  return [...factures].sort((a, b) => {
    const x = cle(a);
    const y = cle(b);
    if (x.r !== y.r) return x.r - y.r;
    if (x.st === 'en-retard' || x.r === 1) return (a.dueAt || '').localeCompare(b.dueAt || '');
    if (x.st === 'payee') return (b.paidAt || '').localeCompare(a.paidAt || '');
    return 0;
  });
}

/** Délai de paiement par défaut (jours après l'émission) : 30 jours, valeur de départ modifiable (STATUT §1.29 n° 3). */
export const DELAI_PAR_DEFAUT_JOURS = 30;
/** Délai au-delà duquel une échéance n'est plus conforme : 60 jours après l'émission (valeur de départ ; à valider par un comptable). */
export const DELAI_MAX_JOURS = 60;

export const echeanceParDefaut = (emisLe: Jour, delaiJours = DELAI_PAR_DEFAUT_JOURS): Jour => ajouterJours(emisLe, delaiJours);

/** Vrai si l'échéance tombe entre l'émission et 60 jours après. */
export function delaiConforme(emisLe: Jour, echeance: Jour): boolean {
  const d = ecartJours(emisLe, echeance);
  return d >= 0 && d <= DELAI_MAX_JOURS;
}

/**
 * LA NUMÉROTATION (STATUT §1.29 n° 4) : le format du module existant, pour que la
 * suite ne se rompe jamais — `AAAA-NNNN` pour une facture (préfixe vide), `AV-AAAA-NNNN`
 * pour un avoir (préfixe `AV`), comme `nextNumber` de `src/state/useInvoices.ts`. Les
 * devis gardent `D-AAAA-NNNN`. Les jeux de SIM (`F-AAAA-NNNN`) s'alignent ; d'ici là,
 * `check:argent` les lit avec le préfixe `F`.
 */
const debut = (prefixe: string, annee: number) => (prefixe ? `${prefixe}-${annee}-` : `${annee}-`);
const motif = (prefixe: string, annee: number) => new RegExp(`^${debut(prefixe, annee)}(\\d+)$`);

/**
 * Le numéro suivant : une suite continue par année et par préfixe. `chiffres` : la
 * largeur minimale (4 pour les factures, comme `nextNumber` ; 1 pour les devis, que la
 * fiche H07 écrit « D-2026-114 »).
 */
export function prochainNumero(numeros: readonly string[], annee: number, prefixe = '', chiffres = 4): string {
  const re = motif(prefixe, annee);
  const max = numeros.reduce((m, n) => Math.max(m, Number(re.exec(n)?.[1] ?? 0)), 0);
  return `${debut(prefixe, annee)}${String(max + 1).padStart(chiffres, '0')}`;
}

/** Les numéros qui manquent dans la suite d'une année (une suite de factures ne doit pas avoir de trou). */
export function trousDeNumerotation(numeros: readonly string[], annee: number, prefixe = '', chiffres = 4): string[] {
  const re = motif(prefixe, annee);
  const pris = new Set(numeros.map((n) => Number(re.exec(n)?.[1] ?? 0)).filter((k) => k > 0));
  const max = Math.max(0, ...pris);
  const trous: string[] = [];
  for (let k = 1; k <= max; k += 1) if (!pris.has(k)) trous.push(`${debut(prefixe, annee)}${String(k).padStart(chiffres, '0')}`);
  return trous;
}

/** L'identité de l'émetteur, telle que les réglages la tiennent. */
export interface Vendeur {
  raisonSociale: string;
  siren: string;
  adresse: string;
  tvaIntracom?: string;
  /** Franchise en base de TVA : aucune TVA facturée, et la mention de l'article 293 B du CGI. */
  franchiseEnBase: boolean;
}

export type Mention =
  | 'vendeur.raisonSociale'
  | 'vendeur.siren'
  | 'vendeur.adresse'
  | 'numero'
  | 'dateEmission'
  | 'echeance'
  | 'client.nom'
  | 'client.adresse'
  | 'ligne.designation'
  | 'tva.franchise';

export interface VerificationMentions {
  manquantes: Mention[];
  complet: boolean;
  /**
   * Toujours vrai : la liste n'est pas un avis juridique. « Valable juridiquement »
   * (H07) reste une affirmation à faire valider par un comptable, jamais une promesse
   * de l'application.
   */
  aFaireValider: true;
}

/**
 * Les mentions qui manquent sur un document, dans l'ordre où on les remplit
 * (émetteur, document, client, lignes, TVA). Les conditions de règlement
 * (pénalités, indemnité forfaitaire) sont imprimées par le modèle de document.
 */
export function verifierMentions(f: FactureLue, vendeur: Vendeur): VerificationMentions {
  const m: Mention[] = [];
  const vide = (v: string | undefined | null) => !v || !v.trim();
  if (vide(vendeur.raisonSociale)) m.push('vendeur.raisonSociale');
  if (vide(vendeur.siren)) m.push('vendeur.siren');
  if (vide(vendeur.adresse)) m.push('vendeur.adresse');
  if (vide(f.number)) m.push('numero');
  if (vide(f.issuedAt)) m.push('dateEmission');
  if (vide(f.dueAt) && !estAvoir(f)) m.push('echeance');
  if (vide(f.billTo?.company) && vide(f.billTo?.name)) m.push('client.nom');
  if (vide(f.billTo?.address)) m.push('client.adresse');
  if (f.lines.length === 0 || f.lines.some((l) => vide(l.label))) m.push('ligne.designation');
  if (vendeur.franchiseEnBase && (f.lines.some((l) => l.vatRate > 0) || !/293\s?B/i.test(f.notes ?? ''))) m.push('tva.franchise');
  return { manquantes: m, complet: m.length === 0, aFaireValider: true };
}

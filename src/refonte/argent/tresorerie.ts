import { ajouterJours, lundiDe, type Jour } from './commun';
import { prelevementsAVenir, type AbonnementLu } from './abonnements';
import { resteDu, type ContexteFacture, type FactureLue } from './facturation';

/**
 * TRÉSORERIE PRÉVISIONNELLE (H09 Prévisions, MA07 Trésorerie).
 *
 * Le principe : un solde de départ (celui de la banque, en lecture seule), puis des
 * flux datés — encaissements attendus, prélèvements d'abonnements, charges fixes,
 * échéances fiscales, salaires — projetés jour par jour sur N semaines.
 *
 * Règles (propositions, à valider par le CO) :
 *   · le solde de départ contient déjà tout ce qui est passé jusqu'à aujourd'hui
 *     inclus : seuls les flux datés de DEMAIN ou après comptent ;
 *   · une facture non échue est attendue à son échéance (« attendu ») ; une facture
 *     déjà en retard est attendue 14 jours après aujourd'hui (« incertain ») ;
 *   · scénario « attendu » : tous les flux ; scénario « prudent » : sans les
 *     encaissements incertains (les sorties, elles, sont toujours comptées) ;
 *   · « besoin » = ce qu'il manquerait au point bas pour rester à zéro.
 *
 * Les attendus calculés que SIM doit fournir pour H09 (STATUT §1.11, point 3) ne
 * sont pas encore livrés : `check:argent` compare aujourd'hui la projection à des
 * cas écrits à la main et à des invariants sur les jeux ; la comparaison aux
 * attendus de SIM s'ajoutera dès leur livraison.
 */

export type Certitude = 'attendu' | 'incertain';
export type Scenario = 'attendu' | 'prudent';

export interface Flux {
  date: Jour;
  /** Signé : positif = entrée, négatif = sortie. */
  montantCents: number;
  libelle: string;
  certitude: Certitude;
}

export interface JourProjete {
  date: Jour;
  entreesCents: number;
  sortiesCents: number;
  soldeCents: number;
}

export interface Projection {
  scenario: Scenario;
  jours: JourProjete[];
  pointBas: { date: Jour; soldeCents: number };
  /** Le premier jour sous zéro, ou `null`. */
  sousZeroLe: Jour | null;
  besoinCents: number;
  soldeFinCents: number;
}

/** Retard supposé d'une facture déjà échue. Proposition : 14 jours. */
export const DECALAGE_RETARD_JOURS = 14;
export const SEMAINES_PAR_DEFAUT = 12;

export function projeter(e: { soldeDepartCents: number; aujourdhui: Jour; flux: readonly Flux[]; semaines?: number; scenario: Scenario }): Projection {
  const n = (e.semaines ?? SEMAINES_PAR_DEFAUT) * 7;
  const garde = e.flux.filter((f) => e.scenario === 'attendu' || !(f.certitude === 'incertain' && f.montantCents > 0));
  const parJour = new Map<Jour, { e: number; s: number }>();
  for (const f of garde) {
    if (f.date <= e.aujourdhui) continue;
    const j = parJour.get(f.date) ?? { e: 0, s: 0 };
    if (f.montantCents >= 0) j.e += f.montantCents;
    else j.s += f.montantCents;
    parJour.set(f.date, j);
  }
  const jours: JourProjete[] = [];
  let solde = e.soldeDepartCents;
  let pointBas = { date: e.aujourdhui, soldeCents: solde };
  let sousZeroLe: Jour | null = null;
  for (let k = 1; k <= n; k += 1) {
    const date = ajouterJours(e.aujourdhui, k);
    const j = parJour.get(date) ?? { e: 0, s: 0 };
    solde += j.e + j.s;
    jours.push({ date, entreesCents: j.e, sortiesCents: j.s, soldeCents: solde });
    if (solde < pointBas.soldeCents) pointBas = { date, soldeCents: solde };
    if (solde < 0 && sousZeroLe === null) sousZeroLe = date;
  }
  return { scenario: e.scenario, jours, pointBas, sousZeroLe, besoinCents: Math.max(0, -pointBas.soldeCents), soldeFinCents: solde };
}

/** Les semaines (du lundi au dimanche) de la projection : solde de clôture, entrées, sorties. */
export function parSemaine(p: Projection): { lundi: Jour; soldeFinCents: number; entreesCents: number; sortiesCents: number }[] {
  const semaines = new Map<Jour, { soldeFinCents: number; entreesCents: number; sortiesCents: number }>();
  for (const j of p.jours) {
    const l = lundiDe(j.date);
    const s = semaines.get(l) ?? { soldeFinCents: 0, entreesCents: 0, sortiesCents: 0 };
    s.soldeFinCents = j.soldeCents;
    s.entreesCents += j.entreesCents;
    s.sortiesCents += j.sortiesCents;
    semaines.set(l, s);
  }
  return [...semaines.entries()].map(([lundi, s]) => ({ lundi, ...s }));
}

/** Les encaissements attendus des factures émises et pas soldées. */
export function fluxDesFactures(factures: readonly FactureLue[], aujourdhui: Jour, ctx: Pick<ContexteFacture, 'paiements'>): Flux[] {
  const c: ContexteFacture = { factures, paiements: ctx.paiements };
  return factures
    .filter((f) => f.status === 'issued' && f.kind !== 'creditNote' && f.dueAt)
    .map((f) => ({ f, reste: resteDu(f, c) }))
    .filter(({ reste }) => reste > 0)
    .map(({ f, reste }): Flux => {
      const enRetard = f.dueAt <= aujourdhui;
      return { date: enRetard ? ajouterJours(aujourdhui, DECALAGE_RETARD_JOURS) : f.dueAt, montantCents: reste, libelle: f.number, certitude: enRetard ? 'incertain' : 'attendu' };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function fluxDesAbonnements(abonnements: readonly AbonnementLu[], aujourdhui: Jour, jusquau: Jour): Flux[] {
  return prelevementsAVenir(abonnements, aujourdhui, jusquau).map((p) => ({ date: p.date, montantCents: p.montantCents, libelle: p.abonnement.clientNom, certitude: 'attendu' }));
}

/** Les échéances fiscales à payer, en sorties (montant connu seulement). */
export function fluxFiscaux(echeances: readonly { intitule: string; echeanceLe: Jour; montantCents: number | null; paiement: string }[]): Flux[] {
  return echeances
    .filter((e) => e.paiement === 'À payer' && e.montantCents !== null && e.montantCents > 0)
    .map((e) => ({ date: e.echeanceLe, montantCents: -(e.montantCents as number), libelle: e.intitule, certitude: 'attendu' }));
}

/** Les mouvements PRÉVUS du jeu `mouvements` (MA07), tels quels, tous « attendus ». */
export function fluxDesMouvementsPrevus(mouvements: readonly { date: Jour; montantCents: number; libelle: string; reel: boolean }[]): Flux[] {
  return mouvements
    .filter((m) => !m.reel)
    .map((m): Flux => ({ date: m.date, montantCents: m.montantCents, libelle: m.libelle, certitude: 'attendu' }));
}

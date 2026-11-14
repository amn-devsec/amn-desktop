import { arrondi, ecartJours, jourDe, jourDuMois, moisDe, moisSuivant, type Jour, type Mois } from './commun';
import { encaisse, totauxDocument, type FactureLue, type ReglementLu } from './facturation';

/**
 * TVA ET IMPÔTS (MA08) — la TVA d'un mois, son échéance, les échéances fiscales à venir.
 *
 * Tout résultat porte `aValiderParUnComptable: true` : l'application aide à
 * préparer, elle ne déclare rien et ne remplace pas le comptable.
 *
 * DEUX RÉGIMES — un réglage de l'entreprise (STATUT §1.29 n° 2, provisoire, révisable
 * par Harun). Par défaut : les encaissements pour les prestations de services, les
 * débits pour les ventes de biens (`regimeParDefaut`). À valider par un comptable :
 *   · `debits` — la TVA est due sur les factures ÉMISES dans le mois (avoirs déduits).
 *     C'est la règle des jeux fictifs de SIM.
 *   · `encaissements` — la TVA est due sur les règlements REÇUS dans le mois, au
 *     prorata de la TVA de chaque facture.
 * La TVA déductible vient des dépenses du mois (`tvaCents` de chaque dépense).
 */

export type Regime = 'debits' | 'encaissements';
export type NatureActivite = 'services' | 'biens';

/** Le régime proposé tant que l'entreprise n'a rien réglé (§1.29 n° 2). */
export const regimeParDefaut = (nature: NatureActivite): Regime => (nature === 'services' ? 'encaissements' : 'debits');

export interface DepenseLue {
  amountCents: number;
  tvaCents: number;
  spentAt: string;
}

export interface TvaDuMois {
  mois: Mois;
  regime: Regime;
  collecteeCents: number;
  deductibleCents: number;
  /** Collectée − déductible : positif = à payer, négatif = crédit. */
  soldeCents: number;
  aPayerCents: number;
  creditCents: number;
  aValiderParUnComptable: true;
}

/** La TVA contenue dans un montant TTC à un taux donné. */
export function tvaDepuisTTC(ttcCents: number, taux: number): number {
  if (!(taux > 0)) return 0;
  return arrondi((ttcCents * taux) / (100 + taux));
}

const signe = (f: Pick<FactureLue, 'kind'>) => (f.kind === 'creditNote' ? -1 : 1);
const comptee = (f: Pick<FactureLue, 'status'>) => f.status === 'issued' || f.status === 'paid';

export function tvaDuMois(e: { mois: Mois; regime: Regime; factures: readonly FactureLue[]; paiements: readonly (ReglementLu & { date?: string })[]; depenses: readonly DepenseLue[] }): TvaDuMois {
  let collectee = 0;
  if (e.regime === 'debits') {
    for (const f of e.factures) if (comptee(f) && f.issuedAt && moisDe(f.issuedAt) === e.mois) collectee += signe(f) * totauxDocument(f.lines).tvaCents;
  } else {
    for (const f of e.factures) {
      if (!comptee(f) || f.kind === 'creditNote') continue;
      const t = totauxDocument(f.lines);
      if (t.ttcCents === 0) continue;
      const recus = e.paiements.filter((p) => p.factureId === f.id && p.etat === 'réussi');
      if (recus.length > 0) {
        for (const p of recus) if (p.date && moisDe(jourDe(p.date)) === e.mois) collectee += arrondi((p.montantCents * t.tvaCents) / t.ttcCents);
      } else if (f.status === 'paid' && f.paidAt && moisDe(f.paidAt) === e.mois) {
        // Sans règlement enregistré, la date de paiement de la facture fait foi pour la totalité.
        collectee += t.tvaCents;
      }
    }
  }
  const deductible = e.depenses.filter((d) => moisDe(d.spentAt) === e.mois).reduce((s, d) => s + d.tvaCents, 0);
  const solde = collectee - deductible;
  return { mois: e.mois, regime: e.regime, collecteeCents: collectee, deductibleCents: deductible, soldeCents: solde, aPayerCents: Math.max(0, solde), creditCents: Math.max(0, -solde), aValiderParUnComptable: true };
}

/** Le montant encaissé sur une facture (pratique pour un écran qui détaille le régime des encaissements). */
export const encaisseSurFacture = encaisse;

/** Jour limite de déclaration : le 20 du mois suivant, valeur de départ modifiable (§1.29 n° 3 ; le vrai jour dépend de l'entreprise, à valider). */
export const JOUR_ECHEANCE_TVA = 20;

export const echeanceTva = (mois: Mois, jour = JOUR_ECHEANCE_TVA): Jour => jourDuMois(moisSuivant(mois), jour);

export interface EcheanceLue {
  id: string;
  intitule: string;
  famille: string;
  echeanceLe: Jour;
  montantCents: number | null;
  paiement: 'À payer' | 'Payée';
}

/**
 * Les échéances à payer d'ici `jours` jours, en retard comprises, triées par date.
 * Le total ne compte que les montants connus ; les autres sont comptés à part.
 */
export function echeancesAVenir(echeances: readonly EcheanceLue[], aujourdhui: Jour, jours = 30): { lignes: (EcheanceLue & { etat: 'en-retard' | 'a-payer' })[]; totalCents: number; montantInconnu: number } {
  const lignes = echeances
    .filter((e) => e.paiement === 'À payer' && ecartJours(aujourdhui, e.echeanceLe) <= jours)
    .sort((a, b) => a.echeanceLe.localeCompare(b.echeanceLe))
    .map((e) => ({ ...e, etat: (e.echeanceLe < aujourdhui ? 'en-retard' : 'a-payer') as 'en-retard' | 'a-payer' }));
  return {
    lignes,
    totalCents: lignes.reduce((s, e) => s + (e.montantCents ?? 0), 0),
    montantInconnu: lignes.filter((e) => e.montantCents === null).length,
  };
}

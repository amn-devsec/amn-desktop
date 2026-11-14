import { arrondi, ecartJours, jourDe, jourDuMois, joursOuvresAvant, moisDe, moisSuivant, type Jour, type Mois } from './commun';
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
  justificatif?: { statut: 'justifié' | 'à justifier' | string };
}

export interface TvaDuMois {
  mois: Mois;
  regime: Regime;
  collecteeCents: number;
  deductibleCents: number;
  /** Bases hors taxes de la période (MA08 : « 15 900 € » et « 9 850 € »). */
  baseVentesHtCents: number;
  baseAchatsHtCents: number;
  /** À reverser ÷ collectée, en % entier (la barre du résultat ; 0 en crédit). */
  partReversee: number;
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
  let baseVentes = 0;
  if (e.regime === 'debits') {
    for (const f of e.factures) {
      if (!comptee(f) || !f.issuedAt || moisDe(f.issuedAt) !== e.mois) continue;
      const t = totauxDocument(f.lines);
      collectee += signe(f) * t.tvaCents;
      baseVentes += signe(f) * t.htCents;
    }
  } else {
    for (const f of e.factures) {
      if (!comptee(f) || f.kind === 'creditNote') continue;
      const t = totauxDocument(f.lines);
      if (t.ttcCents === 0) continue;
      const recus = e.paiements.filter((p) => p.factureId === f.id && p.etat === 'réussi');
      if (recus.length > 0) {
        for (const p of recus) {
          if (!p.date || moisDe(jourDe(p.date)) !== e.mois) continue;
          const tva = arrondi((p.montantCents * t.tvaCents) / t.ttcCents);
          collectee += tva;
          baseVentes += p.montantCents - tva;
        }
      } else if (f.status === 'paid' && f.paidAt && moisDe(f.paidAt) === e.mois) {
        // Sans règlement enregistré, la date de paiement de la facture fait foi pour la totalité.
        collectee += t.tvaCents;
        baseVentes += t.htCents;
      }
    }
  }
  const achats = e.depenses.filter((d) => moisDe(d.spentAt) === e.mois);
  const deductible = achats.reduce((s, d) => s + d.tvaCents, 0);
  const baseAchats = achats.reduce((s, d) => s + d.amountCents - d.tvaCents, 0);
  const solde = collectee - deductible;
  return {
    mois: e.mois,
    regime: e.regime,
    collecteeCents: collectee,
    deductibleCents: deductible,
    baseVentesHtCents: baseVentes,
    baseAchatsHtCents: baseAchats,
    partReversee: solde > 0 && collectee > 0 ? arrondi((solde / collectee) * 100) : 0,
    soldeCents: solde,
    aPayerCents: Math.max(0, solde),
    creditCents: Math.max(0, -solde),
    aValiderParUnComptable: true,
  };
}

/** H08 : la TVA récupérable du mois = la TVA des seules dépenses JUSTIFIÉES (indicatif, à valider par un comptable). */
export const tvaRecuperable = (depenses: readonly DepenseLue[], mois: Mois): number =>
  depenses.filter((d) => moisDe(d.spentAt) === mois && d.justificatif?.statut === 'justifié').reduce((s, d) => s + d.tvaCents, 0);

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

/** Jours ouvrés entre le paiement proposé et l'échéance (MA08 : 20 nov. → 18 nov.). */
export const JOURS_OUVRES_AVANT_PAIEMENT = 2;

/** MA08 : la prochaine échéance non payée, le nombre de jours qui en séparent, et le jour de paiement proposé (2 jours ouvrés avant). */
export function prochaineEcheance(echeances: readonly EcheanceLue[], aujourdhui: Jour): { echeance: EcheanceLue; jours: number; payerLe: Jour } | null {
  const e = echeances.filter((x) => x.paiement === 'À payer' && x.echeanceLe >= aujourdhui).sort((a, b) => a.echeanceLe.localeCompare(b.echeanceLe))[0];
  return e ? { echeance: e, jours: ecartJours(aujourdhui, e.echeanceLe), payerLe: joursOuvresAvant(e.echeanceLe, JOURS_OUVRES_AVANT_PAIEMENT) } : null;
}

/** « En préparation · 92 % » : écritures prêtes ÷ écritures, arrondi à l'entier INFÉRIEUR (jamais 100 % s'il reste un point). */
export const preparationPct = (pretes: number, total: number): number => (total <= 0 ? 0 : Math.floor((pretes / total) * 100));

/** « Mis de côté » : provision suivie ÷ montants à payer d'ici la date, en % entier (l'application ne déplace pas d'argent). */
export const partMiseDeCote = (provisionCents: number, aPayerCents: number): number | null => (aPayerCents <= 0 ? null : arrondi((provisionCents / aPayerCents) * 100));

/** « Dû de l'année » : la somme des montants connus par famille, sur l'année civile. */
export function duDeLAnnee(echeances: readonly EcheanceLue[], annee: number): { famille: string; montantCents: number }[] {
  const par = new Map<string, number>();
  for (const e of echeances) if (e.echeanceLe.startsWith(String(annee)) && e.montantCents !== null) par.set(e.famille, (par.get(e.famille) ?? 0) + e.montantCents);
  return [...par.entries()].map(([famille, montantCents]) => ({ famille, montantCents }));
}

import { paliereDe, rangPalier, type PalierRelance } from '../../lib/relances';
import { arrondi, ecartJours, formaterJour, formaterMontant, type Jour, type Langue } from './commun';
import { joursDeRetard, resteDu, type ContexteFacture, type FactureLue } from './facturation';
import { traduire } from './i18n';

/**
 * IMPAYÉS (MA04) — tranches de retard, priorités, pénalités, relances préparées.
 *
 * Les paliers de relance (rappel, ferme, mise en demeure, dernier avis) sont ceux
 * de `src/lib/relances.ts`, repris tels quels : un seul barème dans l'application.
 * Rien n'est jamais envoyé d'ici : une relance est PRÉPARÉE (au vouvoiement), la
 * personne la relit et l'envoie elle-même.
 */

export type Tranche = '0-30' | '31-60' | '61-90' | '90+';
export const TRANCHES: readonly Tranche[] = ['0-30', '31-60', '61-90', '90+'];

/** La tranche d'un retard en jours ; chaque borne appartient à la tranche basse (30 → « 0-30 »). */
export function trancheDe(jours: number): Tranche {
  if (jours <= 30) return '0-30';
  if (jours <= 60) return '31-60';
  if (jours <= 90) return '61-90';
  return '90+';
}

export interface Impaye {
  facture: FactureLue;
  joursRetard: number;
  resteCents: number;
  palier: PalierRelance;
}

/** Les factures émises, échues et pas soldées. */
export function impayes(factures: readonly FactureLue[], aujourdhui: Jour, ctx: Pick<ContexteFacture, 'paiements'>): Impaye[] {
  const c: ContexteFacture = { factures, paiements: ctx.paiements };
  return factures
    .filter((f) => f.status === 'issued' && f.kind !== 'creditNote')
    .map((f) => ({ facture: f, joursRetard: joursDeRetard(f, aujourdhui), resteCents: resteDu(f, c), palier: paliereDe(joursDeRetard(f, aujourdhui)) }))
    .filter((i) => i.joursRetard > 0 && i.resteCents > 0);
}

export const totalImpaye = (factures: readonly FactureLue[], aujourdhui: Jour, ctx: Pick<ContexteFacture, 'paiements'>): number =>
  impayes(factures, aujourdhui, ctx).reduce((s, i) => s + i.resteCents, 0);

/** Les quatre tranches, toujours dans le même ordre, même vides. */
export function tranchesDeRetard(factures: readonly FactureLue[], aujourdhui: Jour, ctx: Pick<ContexteFacture, 'paiements'>): { tranche: Tranche; nombre: number; montantCents: number }[] {
  const liste = impayes(factures, aujourdhui, ctx);
  return TRANCHES.map((tranche) => {
    const dedans = liste.filter((i) => trancheDe(i.joursRetard) === tranche);
    return { tranche, nombre: dedans.length, montantCents: dedans.reduce((s, i) => s + i.resteCents, 0) };
  });
}

/** À relancer d'abord : le palier le plus dur, puis le montant le plus élevé, puis le plus ancien. */
export function prioritesDeRelance(factures: readonly FactureLue[], aujourdhui: Jour, ctx: Pick<ContexteFacture, 'paiements'>): Impaye[] {
  return impayes(factures, aujourdhui, ctx).sort((a, b) => rangPalier(b.palier) - rangPalier(a.palier) || b.resteCents - a.resteCents || b.joursRetard - a.joursRetard);
}

/** Délai moyen entre émission et paiement des factures payées, en jours entiers ; `null` sans facture payée. */
export function delaiMoyenDePaiement(factures: readonly FactureLue[]): number | null {
  const payees = factures.filter((f) => f.status === 'paid' && f.issuedAt && f.paidAt);
  if (payees.length === 0) return null;
  return arrondi(payees.reduce((s, f) => s + ecartJours(f.issuedAt, f.paidAt as string), 0) / payees.length);
}

/** Indemnité forfaitaire pour frais de recouvrement, par facture, entre professionnels : 40 €. À valider par un comptable. */
export const INDEMNITE_RECOUVREMENT_CENTS = 4_000;

/**
 * LE TAUX DES PÉNALITÉS (STATUT §1.29 n° 6) : un réglage de l'identité de facturation,
 * repris par H18. Par défaut, le MINIMUM LÉGAL entre professionnels, présenté comme
 * tel : trois fois le taux d'intérêt légal. Le taux d'intérêt légal change chaque
 * semestre : c'est une donnée du réglage, jamais une valeur écrite dans le code.
 */
export const MULTIPLE_MINIMUM_LEGAL = 3;

export type TauxPenalites = { source: 'minimum-legal'; tauxAnnuelPct: number } | { source: 'conditions-generales'; tauxAnnuelPct: number };

/** Le taux de départ : le minimum légal, calculé depuis le taux d'intérêt légal du semestre (réglage). */
export function tauxPenalitesParDefaut(tauxInteretLegalPct: number): TauxPenalites {
  return { source: 'minimum-legal', tauxAnnuelPct: Math.round(tauxInteretLegalPct * MULTIPLE_MINIMUM_LEGAL * 100) / 100 };
}

/** Pénalités de retard : reste dû × taux annuel × jours / 365, arrondies au centime. */
export function penalitesDeRetard(resteCents: number, jours: number, tauxAnnuelPct: number): number {
  if (resteCents <= 0 || jours <= 0 || !(tauxAnnuelPct > 0)) return 0;
  return arrondi((resteCents * tauxAnnuelPct * jours) / 100 / 365);
}

export interface RelancePreparee {
  palier: PalierRelance;
  joursRetard: number;
  resteCents: number;
  /** Le texte à envoyer, au vouvoiement. */
  texte: string;
  /** Toujours faux : l'application prépare, la personne envoie. */
  envoyee: false;
}

export function preparerRelance(f: FactureLue, aujourdhui: Jour, ctx: Pick<ContexteFacture, 'paiements'> & Partial<Pick<ContexteFacture, 'factures'>>, langue: Langue = 'fr'): RelancePreparee {
  const jours = joursDeRetard(f, aujourdhui);
  const palier = paliereDe(jours);
  const reste = resteDu(f, { factures: ctx.factures ?? [f], paiements: ctx.paiements });
  const texte = traduire(langue, `client.relance.${palier}`, {
    numero: f.number,
    montant: formaterMontant(reste, langue),
    echeance: formaterJour(f.dueAt, langue),
    jours,
  });
  return { palier, joursRetard: jours, resteCents: reste, texte, envoyee: false };
}

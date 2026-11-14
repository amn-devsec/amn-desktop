import { pourcentage } from './commun';

/**
 * COMPTABILITÉ (MA02) — fiche v4, rubrique 6. Tous les montants sont indicatifs, à
 * valider par un comptable ; le journal est celui du compte de banque (512).
 */

/** Le solde courant d'une écriture du compte 512 : solde précédent + débit (entrée) − crédit (sortie). */
export function soldesCourants(soldeReporteCents: number, ecritures: readonly { debitCents: number; creditCents: number }[]): number[] {
  let s = soldeReporteCents;
  return ecritures.map((e) => (s += e.debitCents - e.creditCents));
}

/** Résultat indicatif = chiffre d'affaires HT − charges HT ; marge = résultat ÷ chiffre d'affaires, arrondie (6 560 € → 53 %). */
export function resultatIndicatif(caHtCents: number, chargesHtCents: number): { resultatCents: number; marge: number | null } {
  const r = caHtCents - chargesHtCents;
  return { resultatCents: r, marge: pourcentage(r, caHtCents, 0) };
}

/** Une variation d'un mois à l'autre, en % entier (« +9 % », « −3 % »). */
export const variationMensuelle = (actuelCents: number, precedentCents: number): number | null => pourcentage(actuelCents - precedentCents, precedentCents, 0);

/** Les 8 points « Prêt pour le comptable », calculés (jamais cochés à la main). */
export interface PointsComptables {
  ecrituresSaisies: boolean;
  numerotationSansTrou: boolean;
  releveImporte: boolean;
  aucunMouvementAVerifier: boolean;
  aucunJustificatifManquant: boolean;
  tvaCalculee: boolean;
  fecGenere: boolean;
  envoiAuComptable: boolean;
}

/** « n sur 8 » et ce qu'il reste : « encore N points et le dossier part chez ton comptable ». */
export function pretPourLeComptable(p: PointsComptables): { faits: number; total: 8; restants: number } {
  const faits = Object.values(p).filter(Boolean).length;
  return { faits, total: 8, restants: 8 - faits };
}

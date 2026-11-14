import { arrondi, ecartJours, jourDuMois, moisDe, moisSuivant, type Jour, type Mois } from './commun';
import { tvaDepuisTTC } from './tva';

/**
 * DÉPENSES ET NOTES DE FRAIS (H08, MA05) — montants TTC en centimes, TVA récupérable,
 * justificatifs manquants, notes de frais à rembourser.
 *
 * Rembourser une note de frais, c'est un virement : l'application le PRÉPARE
 * (`banque.preparerOrdre`), la personne l'exécute dans sa banque.
 */

export interface DepenseLue {
  id: string;
  amountCents: number;
  tvaCents: number;
  spentAt: string;
  category: string;
  justificatif: { statut: 'justifié' | 'à justifier'; fichier: string | null };
  noteDeFrais: boolean;
  remboursee: boolean;
  auteurEmail: string;
}

/** Le hors taxes d'un TTC à un taux donné. */
export const htDepuisTTC = (ttcCents: number, taux: number): number => ttcCents - tvaDepuisTTC(ttcCents, taux);

export function aJustifier(depenses: readonly DepenseLue[]): { nombre: number; montantCents: number } {
  const l = depenses.filter((d) => d.justificatif.statut === 'à justifier');
  return { nombre: l.length, montantCents: l.reduce((s, d) => s + d.amountCents, 0) };
}

/** Les totaux d'un mois par catégorie, dans l'ordre de première apparition. */
export function totalParCategorie(depenses: readonly DepenseLue[], mois: Mois): { categorie: string; montantCents: number; tvaCents: number }[] {
  const parCat = new Map<string, { montantCents: number; tvaCents: number }>();
  for (const d of [...depenses].sort((a, b) => a.spentAt.localeCompare(b.spentAt))) {
    if (moisDe(d.spentAt) !== mois) continue;
    const c = parCat.get(d.category) ?? { montantCents: 0, tvaCents: 0 };
    c.montantCents += d.amountCents;
    c.tvaCents += d.tvaCents;
    parCat.set(d.category, c);
  }
  return [...parCat.entries()].map(([categorie, v]) => ({ categorie, ...v }));
}

/** Ce que l'entreprise doit à chaque personne pour ses notes de frais non remboursées. */
export function notesARembourser(depenses: readonly DepenseLue[]): { email: string; montantCents: number; nombre: number }[] {
  const par = new Map<string, { montantCents: number; nombre: number }>();
  for (const d of depenses) {
    if (!d.noteDeFrais || d.remboursee) continue;
    const p = par.get(d.auteurEmail) ?? { montantCents: 0, nombre: 0 };
    p.montantCents += d.amountCents;
    p.nombre += 1;
    par.set(d.auteurEmail, p);
  }
  return [...par.entries()].map(([email, v]) => ({ email, ...v })).sort((a, b) => b.montantCents - a.montantCents || a.email.localeCompare(b.email));
}

/** H08 : la date limite pour justifier les dépenses d'un mois = le 5 du mois suivant (réglage lié à la clôture de MA02). */
export const JOUR_LIMITE_JUSTIFICATIF = 5;
export const dateLimiteJustificatif = (mois: Mois, jour = JOUR_LIMITE_JUSTIFICATIF): Jour => jourDuMois(moisSuivant(mois), jour);

/** Les jours qui restent avant la date limite (l'anneau de H08) ; négatif = dépassée (« depuis le 5 nov. », orange, jamais rouge plein). */
export const joursAvantLimite = (mois: Mois, aujourdhui: Jour): number => ecartJours(aujourdhui, dateLimiteJustificatif(mois));

/** « Mois justifié » : dépenses justifiées ÷ dépenses du mois, en % entier (44 sur 48 = 92 %). */
export function moisJustifie(depenses: readonly DepenseLue[], mois: Mois): { justifiees: number; total: number; pourcentage: number } {
  const du = depenses.filter((d) => moisDe(d.spentAt) === mois);
  const j = du.filter((d) => d.justificatif.statut === 'justifié').length;
  return { justifiees: j, total: du.length, pourcentage: du.length === 0 ? 100 : arrondi((j / du.length) * 100) };
}

/** Tolérances de la lecture d'un reçu (H08) : même montant à ± 0,50 €, à ± 3 jours. */
export const TOLERANCE_RECU_CENTS = 50;
export const TOLERANCE_RECU_JOURS = 3;

/** Les dépenses à justifier qui correspondent à un reçu lu ; plusieurs = la liste est proposée. Aucune validation sans clic. */
export function depensesPourUnRecu(recu: { montantCents: number; date: Jour }, depenses: readonly DepenseLue[]): DepenseLue[] {
  return depenses.filter(
    (d) => d.justificatif.statut === 'à justifier' && Math.abs(d.amountCents - recu.montantCents) <= TOLERANCE_RECU_CENTS && Math.abs(ecartJours(d.spentAt, recu.date)) <= TOLERANCE_RECU_JOURS,
  );
}

/** Suggestion de H08 : un abonnement non utilisé depuis 30 jours ou plus ; économie annuelle = coût mensuel × 12. */
export const economieAnnuelle = (coutMensuelCents: number): number => coutMensuelCents * 12;
export const nonUtiliseDepuis = (dernierUsage: Jour, aujourdhui: Jour): boolean => ecartJours(dernierUsage, aujourdhui) >= 30;

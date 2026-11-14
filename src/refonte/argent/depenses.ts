import { moisDe, type Mois } from './commun';
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

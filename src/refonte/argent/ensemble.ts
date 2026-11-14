import { moisDe, type Jour, type Mois } from './commun';

/**
 * VUE D'ENSEMBLE (F30) — fiche v4, rubrique 6. Période : le mois civil en cours.
 *
 *   · entrées = mouvements créditeurs du mois rapprochés à une facture ou un client ; les
 *     5 plus gros clients sont nommés, le reste groupé (« 4 autres clients ») ;
 *   · sorties = mouvements débiteurs du mois, groupés par catégorie, 5 postes au plus, le
 *     reste dans « Autres » ;
 *   · solde au bout = solde au 1er + entrées − sorties ; s'il s'écarte de plus de 1 € du
 *     solde réel (mouvements non synchronisés), on montre le réel et l'écart ;
 *   · objectif d'encaissement (réglage) : barre plafonnée à 100 %, date où le cumul l'a dépassé.
 *
 * Les sorties du compte ne sont pas le « dépensé » du budget (MA06) : les deux coexistent.
 */
export const GROUPES_NOMMES = 5;

export function regrouper(montants: readonly { nom: string; montantCents: number }[], n = GROUPES_NOMMES): { nommes: { nom: string; montantCents: number }[]; autres: { nombre: number; montantCents: number } } {
  const par = new Map<string, number>();
  for (const m of montants) par.set(m.nom, (par.get(m.nom) ?? 0) + m.montantCents);
  const tries = [...par.entries()].map(([nom, montantCents]) => ({ nom, montantCents })).sort((a, b) => Math.abs(b.montantCents) - Math.abs(a.montantCents) || a.nom.localeCompare(b.nom));
  const reste = tries.slice(n);
  return { nommes: tries.slice(0, n), autres: { nombre: reste.length, montantCents: reste.reduce((s, m) => s + m.montantCents, 0) } };
}

export interface MouvementLu {
  date: Jour;
  montantCents: number;
  libelle: string;
  categorie: string;
  rapprochement: string;
  reel: boolean;
  /** Le client d'une entrée rapprochée, si connu. */
  clientNom?: string;
}

/** La rivière du mois : entrées (par client), sorties (par catégorie), solde au bout et son écart au solde réel. */
export function riviereDuMois(mouvements: readonly MouvementLu[], mois: Mois, soldeAu1erCents: number, soldeReelCents: number) {
  const du = mouvements.filter((m) => m.reel && moisDe(m.date) === mois);
  const entrees = du.filter((m) => m.montantCents > 0 && m.rapprochement === 'rapproché');
  const sorties = du.filter((m) => m.montantCents < 0);
  const totalEntrees = entrees.reduce((s, m) => s + m.montantCents, 0);
  const totalSorties = sorties.reduce((s, m) => s - m.montantCents, 0);
  const auBout = soldeAu1erCents + totalEntrees - totalSorties;
  const ecart = soldeReelCents - auBout;
  return {
    entreesCents: totalEntrees,
    sortiesCents: totalSorties,
    entrees: regrouper(entrees.map((m) => ({ nom: m.clientNom ?? m.libelle, montantCents: m.montantCents }))),
    sorties: regrouper(sorties.map((m) => ({ nom: m.categorie, montantCents: -m.montantCents }))),
    soldeAuBoutCents: Math.abs(ecart) > 100 ? soldeReelCents : auBout,
    ecartCents: Math.abs(ecart) > 100 ? ecart : 0,
  };
}

/** L'objectif d'encaissement du mois : part plafonnée à 100 %, et le jour où le cumul l'a atteint. */
export function objectifEncaissement(encaissements: readonly { date: Jour; montantCents: number }[], objectifCents: number | null): { pourcentage: number; atteintLe: Jour | null } | null {
  if (!objectifCents || objectifCents <= 0) return null;
  let cumul = 0;
  let atteintLe: Jour | null = null;
  for (const e of [...encaissements].sort((a, b) => a.date.localeCompare(b.date))) {
    cumul += e.montantCents;
    if (atteintLe === null && cumul >= objectifCents) atteintLe = e.date;
  }
  return { pourcentage: Math.min(100, Math.round((cumul / objectifCents) * 100)), atteintLe };
}

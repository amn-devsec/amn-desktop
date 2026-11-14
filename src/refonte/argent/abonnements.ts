import { ajouterJours, jourDuMois, moisDe, moisSuivant, pourcentage, type Jour, type Mois } from './commun';

/**
 * ABONNEMENTS RÉCURRENTS (MA09) — fiche v4, rubrique 6. Revenu en HT (proposition, à valider par un comptable).
 *
 * Revenu mensuel récurrent : les abonnements « Actif » et « Paiement échoué » (la
 * cliente est toujours abonnée, le prélèvement est à reprendre) ; « En pause » et
 * « Résilié » n'y entrent pas (STATUT §1.29 n° 5, sous réserve de la fiche).
 */

export type EtatAbonnement = 'Actif' | 'Paiement échoué' | 'En pause' | 'Résilié';

export interface AbonnementLu {
  id: string;
  clientNom: string;
  montantMensuelCents: number;
  jourPrelevement: number;
  etat: EtatAbonnement | string;
  depuis?: Jour;
  resilieLe?: Jour | null;
}

const recurrent = (a: AbonnementLu) => a.etat === 'Actif' || a.etat === 'Paiement échoué';

export const revenuMensuelRecurrent = (abonnements: readonly AbonnementLu[]): number => abonnements.filter(recurrent).reduce((s, a) => s + a.montantMensuelCents, 0);
export const revenuAnnuelRecurrent = (abonnements: readonly AbonnementLu[]): number => revenuMensuelRecurrent(abonnements) * 12;

/** « Abonnés » de MA09 : le nombre d'abonnements « Actif » et « Paiement échoué ». */
export const abonnes = (abonnements: readonly AbonnementLu[]): number => abonnements.filter(recurrent).length;

/** « Résiliations » de MA09 : les abonnements résiliés dans le mois (0 → vert). */
export const resiliationsDuMois = (abonnements: readonly AbonnementLu[], mois: Mois): number => abonnements.filter((a) => a.resilieLe && moisDe(a.resilieLe) === mois).length;

/** « Réussis en {mois} » : prélèvements réussis ÷ tentés du mois (« 10 sur 11 »). */
export const tauxDePrelevement = (reussis: number, tentes: number): { reussis: number; tentes: number; pourcentage: number | null } => ({ reussis, tentes, pourcentage: pourcentage(reussis, tentes, 0) });

/** L'objectif de revenu récurrent (réglage) : part atteinte en % entier, et ce qu'il reste. */
export const versObjectif = (revenuCents: number, objectifCents: number): { pourcentage: number | null; resteCents: number } => ({ pourcentage: pourcentage(revenuCents, objectifCents, 0), resteCents: Math.max(0, objectifCents - revenuCents) });

/** Le prochain prélèvement, STRICTEMENT après aujourd'hui, ramené au dernier jour d'un mois court. */
export function prochainPrelevement(aujourdhui: Jour, jour: number): Jour {
  const ce = jourDuMois(moisDe(aujourdhui), jour);
  return ce > aujourdhui ? ce : jourDuMois(moisSuivant(moisDe(aujourdhui)), jour);
}

/** Les prélèvements des abonnements actifs (et « à réessayer », si demandé) entre demain et `jusquau` inclus, un par mois. */
export function prelevementsAVenir(abonnements: readonly AbonnementLu[], aujourdhui: Jour, jusquau: Jour, inclureEchoues = false): { date: Jour; montantCents: number; abonnement: AbonnementLu }[] {
  const sortie: { date: Jour; montantCents: number; abonnement: AbonnementLu }[] = [];
  for (const a of abonnements) {
    if (a.etat !== 'Actif' && !(inclureEchoues && a.etat === 'Paiement échoué')) continue;
    let date = prochainPrelevement(aujourdhui, a.jourPrelevement);
    while (date <= jusquau) {
      sortie.push({ date, montantCents: a.montantMensuelCents, abonnement: a });
      date = jourDuMois(moisSuivant(moisDe(date)), a.jourPrelevement);
    }
  }
  return sortie.sort((x, y) => x.date.localeCompare(y.date));
}

/** MA09 : les prélèvements des 15 prochains jours, groupés par date (« à réessayer » compris quand le dernier a échoué). */
export function prochainsPrelevements(abonnements: readonly AbonnementLu[], aujourdhui: Jour, jours = 15): { date: Jour; montantCents: number; abonnements: AbonnementLu[] }[] {
  const par = new Map<Jour, AbonnementLu[]>();
  for (const p of prelevementsAVenir(abonnements, aujourdhui, ajouterJours(aujourdhui, jours), true)) par.set(p.date, [...(par.get(p.date) ?? []), p.abonnement]);
  return [...par.entries()].map(([date, l]) => ({ date, montantCents: l.reduce((s, a) => s + a.montantMensuelCents, 0), abonnements: l })).sort((a, b) => a.date.localeCompare(b.date));
}

import { jourDuMois, moisDe, moisSuivant, pourcentage, type Jour, type Mois } from './commun';

/**
 * ABONNEMENTS RÉCURRENTS (MA09) — revenu récurrent, attrition, prochain prélèvement.
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

/**
 * Attrition d'un mois : résiliés pendant le mois ÷ abonnés au premier jour du mois
 * (déjà abonnés avant, pas encore résiliés), en % à une décimale ; `null` sans abonné.
 */
export function attritionDuMois(abonnements: readonly AbonnementLu[], mois: Mois): number | null {
  const debut = `${mois}-01`;
  const auDebut = abonnements.filter((a) => a.depuis && a.depuis < debut && (!a.resilieLe || a.resilieLe >= debut));
  const partis = auDebut.filter((a) => a.resilieLe && moisDe(a.resilieLe) === mois).length;
  return pourcentage(partis, auDebut.length, 1);
}

/** Le prochain prélèvement, STRICTEMENT après aujourd'hui, ramené au dernier jour d'un mois court. */
export function prochainPrelevement(aujourdhui: Jour, jour: number): Jour {
  const ce = jourDuMois(moisDe(aujourdhui), jour);
  return ce > aujourdhui ? ce : jourDuMois(moisSuivant(moisDe(aujourdhui)), jour);
}

/** Les prélèvements des abonnements actifs entre demain et `jusquau` inclus, un par mois. */
export function prelevementsAVenir(abonnements: readonly AbonnementLu[], aujourdhui: Jour, jusquau: Jour): { date: Jour; montantCents: number; abonnement: AbonnementLu }[] {
  const sortie: { date: Jour; montantCents: number; abonnement: AbonnementLu }[] = [];
  for (const a of abonnements) {
    if (a.etat !== 'Actif') continue;
    let date = prochainPrelevement(aujourdhui, a.jourPrelevement);
    while (date <= jusquau) {
      sortie.push({ date, montantCents: a.montantMensuelCents, abonnement: a });
      date = jourDuMois(moisSuivant(moisDe(date)), a.jourPrelevement);
    }
  }
  return sortie.sort((x, y) => x.date.localeCompare(y.date));
}

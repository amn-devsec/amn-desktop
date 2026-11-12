import { ajouterJours, instantParis, jourIsoDe, partiesParis } from './temps';
import type { Jour } from '../types';

/**
 * LES RAPPORTS PÉRIODIQUES — la semaine ou le mois écoulés, rédigés en local.
 *
 * Le contenu reste aux écrans et à `useReports` (collection `reports`) ; ce
 * moteur dit QUAND un rapport est dû et SUR QUELLE période, en heure de Paris.
 * Identifiant `rapport-<planification>-<début de période>` : un seul rapport
 * par période, même avec deux postes ouverts ou une réouverture tardive.
 */

export type Periodicite = 'hebdo' | 'mensuel';

export interface PlanRapport {
  id: string;
  periodicite: Periodicite;
  /** « HH:MM », heure de Paris de rédaction. */
  heure: string;
}

export interface Periode {
  debut: Jour;
  fin: Jour;
}

/** La période close la plus récente : du lundi au dimanche d'avant, ou le mois d'avant. */
export function periodePrecedente(periodicite: Periodicite, jour: Jour): Periode {
  if (periodicite === 'hebdo') {
    const lundiCourant = ajouterJours(jour, 1 - jourIsoDe(jour));
    return { debut: ajouterJours(lundiCourant, -7), fin: ajouterJours(lundiCourant, -1) };
  }
  const [a, m] = jour.split('-').map(Number);
  const premierCourant = `${a}-${String(m).padStart(2, '0')}-01`;
  const fin = ajouterJours(premierCourant, -1);
  return { debut: `${fin.slice(0, 7)}-01`, fin };
}

/** Le premier jour de la période en cours (lundi, ou le 1er du mois). */
function debutDeLaPeriodeCourante(periodicite: Periodicite, jour: Jour): Jour {
  return periodicite === 'hebdo' ? ajouterJours(jour, 1 - jourIsoDe(jour)) : `${jour.slice(0, 7)}-01`;
}

/**
 * Le rapport dû maintenant, ou `null`. Il est dû dès l'heure prévue du
 * premier jour de la période suivante, et le reste jusqu'à ce qu'il soit fait.
 */
export function rapportDu(plan: PlanRapport, dejaFaits: ReadonlySet<string>, maintenant: number): { id: string; periode: Periode } | null {
  const jour = partiesParis(maintenant).jour;
  const debutCourant = debutDeLaPeriodeCourante(plan.periodicite, jour);
  // Avant l'heure du premier jour, la période close est encore celle d'avant.
  const reference = maintenant >= instantParis(debutCourant, plan.heure) ? jour : ajouterJours(debutCourant, -1);
  const periode = periodePrecedente(plan.periodicite, reference);
  const id = `rapport-${plan.id}-${periode.debut}`;
  return dejaFaits.has(id) ? null : { id, periode };
}

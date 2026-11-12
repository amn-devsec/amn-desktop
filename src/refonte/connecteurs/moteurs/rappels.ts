import { dansLaPlage, dernierCreneau, PLAGE_CLIENTS, PLAGE_EQUIPE, type Plage } from './planificateur';

/**
 * LES RAPPELS — rendez-vous et échéances, prévenus à l'avance.
 *
 * Par défaut (proposition, réglable) : le client la veille, l'équipe une heure
 * avant. Un rappel client qui tomberait hors de la plage calme (la nuit, le
 * week-end) est AVANCÉ au dernier moment calme d'avant, jamais repoussé après
 * le rendez-vous. Un rappel d'équipe hors plage n'est pas avancé : il part à
 * l'heure (une notification discrète vaut mieux qu'un oubli).
 *
 * Identifiant déterministe `rappel-<rdv>-<minutes>` : un poste ou deux, un seul rappel.
 */

export interface RendezVousARappeler {
  id: string;
  debutAt: number;
  annule?: boolean;
  /** Le client a donné un moyen d'être prévenu. */
  clientJoignable: boolean;
}

export interface RegleRappel {
  avantMin: number;
  pour: 'client' | 'equipe';
}

export const REGLES_PAR_DEFAUT: readonly RegleRappel[] = [
  { avantMin: 24 * 60, pour: 'client' },
  { avantMin: 60, pour: 'equipe' },
];

export interface Rappel {
  id: string;
  rendezVousId: string;
  pour: 'client' | 'equipe';
  prevuAt: number;
}

export function heureDuRappel(debutAt: number, regle: RegleRappel, plages: { clients: Plage; equipe: Plage } = { clients: PLAGE_CLIENTS, equipe: PLAGE_EQUIPE }): number {
  const nominal = debutAt - regle.avantMin * 60_000;
  if (regle.pour === 'equipe' || dansLaPlage(nominal, plages.clients)) return nominal;
  return dernierCreneau(nominal, plages.clients);
}

/** Les rappels à envoyer maintenant : dus, pas encore partis, et avant le début du rendez-vous. */
export function rappelsDus(
  rdvs: readonly RendezVousARappeler[],
  dejaPartis: ReadonlySet<string>,
  maintenant: number,
  regles: readonly RegleRappel[] = REGLES_PAR_DEFAUT,
): Rappel[] {
  const r: Rappel[] = [];
  for (const rdv of rdvs) {
    if (rdv.annule || rdv.debutAt <= maintenant) continue;
    for (const regle of regles) {
      if (regle.pour === 'client' && !rdv.clientJoignable) continue;
      const id = `rappel-${rdv.id}-${regle.avantMin}`;
      if (dejaPartis.has(id)) continue;
      const prevuAt = heureDuRappel(rdv.debutAt, regle);
      if (prevuAt <= maintenant) r.push({ id, rendezVousId: rdv.id, pour: regle.pour, prevuAt });
    }
  }
  return r.sort((a, b) => a.prevuAt - b.prevuAt);
}

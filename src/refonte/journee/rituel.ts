import { REGLES_PAR_DEFAUT } from './serie';

/**
 * L03 · RITUEL DU MATIN — les étapes, et où l'on en est (fiche L03, à confirmer).
 *
 * La fiche L03 n'a pas été lue. Ne sont écrites que les deux règles de produit que `REGLES.md` (« Chaleur ») donne
 * pour tout écran de la journée : **la salutation suit l'heure**, et **on reprend là où l'on s'était arrêté**.
 * Les trois étapes ci-dessous sont les gestes du matin que les données du dépôt permettent de dire sans rien
 * inventer ; la fiche dira lesquelles sont vraiment celles du rituel.
 *
 *   1. choisir ses priorités du jour (au plus 3) — faite dès qu'une priorité est choisie ;
 *   2. regarder sa journée (rendez-vous) — faite quand la personne l'a passée ;
 *   3. reprendre ce qui attend (rappels à reprendre, tickets urgents pas encore lus) — absente quand rien n'attend.
 *
 * Le rituel se propose le MATIN seulement, et une seule fois par jour : il n'insiste jamais, il ne se rappelle pas
 * à quelqu'un qui l'a fermé. Aucun reproche, aucun « tu n'as pas… ».
 */

export type MomentDeLaJournee = 'matin' | 'apres-midi' | 'soir';

/** 5 h à 11 h 59 : matin ; 12 h à 17 h 59 : après-midi ; le reste, soir (la nuit se salue « bonsoir »). */
export function momentDeLaJournee(heure: number): MomentDeLaJournee {
  const h = ((Math.floor(heure) % 24) + 24) % 24;
  return h >= 5 && h < 12 ? 'matin' : h >= 12 && h < 18 ? 'apres-midi' : 'soir';
}

export type CleDEtape = 'priorites' | 'agenda' | 'a-reprendre';

export interface SourcesDuRituel {
  /** L'heure locale, 0 à 23. */
  heure: number;
  /** Priorités du jour choisies par la personne. */
  priorites: { choisies: number };
  /** Rendez-vous qui comptent aujourd'hui (voir `rendezVousDuJour`). */
  rendezVous: number;
  /** Rappels à reprendre (passés, pas faits) et tickets urgents pas encore lus. */
  enAttente: { rappels: number; urgents: number };
  /** Ce que la personne a déjà passé ce matin (elle a touché « Suivant » ou fermé l'étape). */
  etapesPassees: readonly CleDEtape[];
  /** Le rituel a déjà été proposé et fermé aujourd'hui. */
  fermeAujourdhui: boolean;
}

export interface EtapeDuRituel {
  cle: CleDEtape;
  fait: boolean;
  /** Le nombre que l'étape montre (priorités choisies, rendez-vous, choses qui attendent). */
  nombre: number;
}

export interface Rituel {
  moment: MomentDeLaJournee;
  etapes: EtapeDuRituel[];
  faites: number;
  total: number;
  termine: boolean;
  /** « On reprend à… » : la première étape pas faite, ou `null` quand tout est fait. */
  reprise: CleDEtape | null;
  /** À proposer maintenant : le matin, pas fini, pas déjà fermé aujourd'hui. */
  aProposer: boolean;
}

export function rituelDuMatin(s: SourcesDuRituel): Rituel {
  const passee = (c: CleDEtape) => s.etapesPassees.includes(c);
  const enAttente = s.enAttente.rappels + s.enAttente.urgents;
  const etapes: EtapeDuRituel[] = [
    { cle: 'priorites', fait: s.priorites.choisies >= 1 || passee('priorites'), nombre: Math.min(s.priorites.choisies, REGLES_PAR_DEFAUT.prioritesParJour) },
    { cle: 'agenda', fait: passee('agenda'), nombre: s.rendezVous },
    // Rien n'attend : l'étape n'existe pas, on ne montre pas une case vide à cocher.
    ...(enAttente > 0 ? [{ cle: 'a-reprendre' as const, fait: passee('a-reprendre'), nombre: enAttente }] : []),
  ];
  const faites = etapes.filter((e) => e.fait).length;
  const termine = faites === etapes.length;
  const moment = momentDeLaJournee(s.heure);
  return {
    moment,
    etapes,
    faites,
    total: etapes.length,
    termine,
    reprise: etapes.find((e) => !e.fait)?.cle ?? null,
    aProposer: moment === 'matin' && !termine && !s.fermeAujourdhui,
  };
}

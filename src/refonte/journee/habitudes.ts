import { ajouterJours, ecartJours, jourSemaineIso, lundiDe, plafonner, type Jour } from './commun';

/**
 * MJ02 · HABITUDES — ce qui est prévu un jour, ce qui est fait, la série, le taux de tenue (fiche MJ02).
 *
 * Les règles ci-dessous sont celles que SIM a retenues en lisant la fiche (`Habitude` dans `types.ts`) ; elles sont
 * à confirmer sur la fiche (note du lot, §2). Elles obéissent à la même éthique que la série de la journée : un jour
 * non prévu ne casse rien, une journée en cours non faite ne casse rien, et rien ne se dit sur un ton de reproche.
 *
 *   · « tous les jours » : prévue chaque jour ; « jours choisis » : les jours ISO listés (1 = lundi … 7 = dimanche) ;
 *     « n fois par semaine » : le quota est la semaine (lundi à dimanche), pas un jour précis ;
 *   · mesure « case » : faite dès qu'une valeur est écrite ; mesure « objectif » : faite quand la valeur atteint la
 *     cible (8 000 pas, 20 minutes).
 */

export interface HabitudeDuLot {
  frequence: { type: 'tous les jours' | 'jours choisis' | 'fois par semaine'; jours?: number[]; fois?: number };
  mesure: { type: 'case' } | { type: 'objectif'; cible: number; unite: string };
  debut: Jour;
  /** Jour → quantité faite (1 pour une case cochée). Absent = non fait. */
  historique: Readonly<Record<Jour, number>>;
}

export function faiteCeJour(h: Pick<HabitudeDuLot, 'mesure' | 'historique'>, jour: Jour): boolean {
  const v = h.historique[jour] ?? 0;
  return h.mesure.type === 'objectif' ? v >= h.mesure.cible : v > 0;
}

/** Combien de fois la habitude est faite dans la semaine (lundi à dimanche) de ce jour. */
export function faitesDansLaSemaine(h: Pick<HabitudeDuLot, 'mesure' | 'historique'>, jour: Jour): number {
  const lundi = lundiDe(jour);
  return Array.from({ length: 7 }, (_, i) => ajouterJours(lundi, i)).filter((j) => faiteCeJour(h, j)).length;
}

/** Prévue ce jour-là : les jours listés ; pour « n fois par semaine », tant que le quota de la semaine n'est pas atteint. */
export function prevueCeJour(h: HabitudeDuLot, jour: Jour): boolean {
  if (jour < h.debut) return false;
  const f = h.frequence;
  if (f.type === 'tous les jours') return true;
  if (f.type === 'jours choisis') return (f.jours ?? []).includes(jourSemaineIso(jour));
  return faiteCeJour(h, jour) || faitesDansLaSemaine(h, jour) < (f.fois ?? 1);
}

export interface SerieDHabitude {
  /** Jours (ou semaines, pour « n fois par semaine ») qui se suivent, tenus, jusqu'à aujourd'hui. */
  serie: number;
  unite: 'jours' | 'semaines';
  faiteAujourdhui: boolean;
}

export function serieDHabitude(h: HabitudeDuLot, aujourdhui: Jour): SerieDHabitude {
  if (h.frequence.type === 'fois par semaine') {
    const fois = h.frequence.fois ?? 1;
    const tenue = (jour: Jour) => faitesDansLaSemaine(h, jour) >= fois;
    // La semaine en cours compte si son quota est déjà tenu ; sinon elle n'est pas finie, elle ne casse rien.
    let lundi = tenue(aujourdhui) ? lundiDe(aujourdhui) : ajouterJours(lundiDe(aujourdhui), -7);
    let serie = 0;
    while (ajouterJours(lundi, 6) >= h.debut && tenue(lundi)) {
      serie += 1;
      lundi = ajouterJours(lundi, -7);
    }
    return { serie, unite: 'semaines', faiteAujourdhui: faiteCeJour(h, aujourdhui) };
  }
  let serie = 0;
  for (let j = aujourdhui; j >= h.debut; j = ajouterJours(j, -1)) {
    if (!prevueCeJour(h, j)) continue;
    if (faiteCeJour(h, j)) serie += 1;
    else if (j === aujourdhui) continue; // la journée n'est pas finie
    else break;
  }
  return { serie, unite: 'jours', faiteAujourdhui: faiteCeJour(h, aujourdhui) };
}

/**
 * Le taux de tenue sur les `jours` derniers jours (30 par défaut) : jours tenus sur jours prévus ; « n fois par
 * semaine » : tenues (plafonnées au quota) sur quota, semaine après semaine. `null` quand rien n'était prévu.
 */
export function tauxDeTenue(h: HabitudeDuLot, aujourdhui: Jour, jours = 30): number | null {
  const debut = [ajouterJours(aujourdhui, -(jours - 1)), h.debut].sort().at(-1) as Jour;
  if (debut > aujourdhui) return null;
  if (h.frequence.type === 'fois par semaine') {
    const fois = h.frequence.fois ?? 1;
    let attendu = 0;
    let tenu = 0;
    for (let lundi = lundiDe(debut); lundi <= aujourdhui; lundi = ajouterJours(lundi, 7)) {
      attendu += fois;
      tenu += Math.min(fois, faitesDansLaSemaine(h, lundi));
    }
    return plafonner(tenu / attendu);
  }
  let prevues = 0;
  let tenues = 0;
  for (let j = debut; j <= aujourdhui; j = ajouterJours(j, 1)) {
    if (!prevueCeJour(h, j)) continue;
    // Aujourd'hui, une habitude pas encore faite n'est pas « ratée » : la journée n'est pas finie.
    if (j === aujourdhui && !faiteCeJour(h, j)) continue;
    prevues += 1;
    if (faiteCeJour(h, j)) tenues += 1;
  }
  return prevues === 0 ? null : tenues / prevues;
}

/** Jours entre deux jours : exposé pour « depuis 12 jours ». */
export const joursDepuis = ecartJours;

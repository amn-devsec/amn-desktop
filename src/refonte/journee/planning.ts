import type { Jour } from './commun';

/**
 * MJ03 · PLANNING DE L'ÉQUIPE — qui est sur quel créneau (fiche MJ03).
 *
 * Un créneau concerne soit des personnes nommées, soit « toute l'équipe » (tous les membres actifs). Un chevauchement
 * est une information (« Camille a déjà un créneau à cette heure »), jamais une faute : l'écran le dit au moment de
 * poser le créneau, sans rien bloquer.
 */

export interface CreneauDuLot {
  id: string;
  jour: Jour;
  /** `HH:MM`. */
  debut: string;
  fin: string;
  personnes: readonly string[];
  touteLEquipe: boolean;
}

/** Les personnes d'un créneau : les nommées, ou tous les membres actifs pour « toute l'équipe ». */
export function personnesDuCreneau(c: Pick<CreneauDuLot, 'personnes' | 'touteLEquipe'>, membresActifs: readonly string[]): string[] {
  return [...new Set(c.touteLEquipe ? membresActifs : c.personnes)].sort();
}

const minutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** Deux créneaux se chevauchent s'ils sont le même jour et que l'un commence avant la fin de l'autre (bout à bout : pas de chevauchement). */
export function seChevauchent(a: Pick<CreneauDuLot, 'jour' | 'debut' | 'fin'>, b: Pick<CreneauDuLot, 'jour' | 'debut' | 'fin'>): boolean {
  return a.jour === b.jour && minutes(a.debut) < minutes(b.fin) && minutes(b.debut) < minutes(a.fin);
}

export interface Chevauchement {
  email: string;
  creneaux: [string, string];
}

/** Les personnes prises par deux créneaux à la fois, avec les deux créneaux (tri stable : personne, puis identifiants). */
export function chevauchements(creneaux: readonly CreneauDuLot[], membresActifs: readonly string[]): Chevauchement[] {
  const sortie: Chevauchement[] = [];
  for (let i = 0; i < creneaux.length; i += 1) {
    for (let j = i + 1; j < creneaux.length; j += 1) {
      if (!seChevauchent(creneaux[i], creneaux[j])) continue;
      const a = new Set(personnesDuCreneau(creneaux[i], membresActifs));
      for (const email of personnesDuCreneau(creneaux[j], membresActifs)) {
        if (a.has(email)) sortie.push({ email, creneaux: [creneaux[i].id, creneaux[j].id].sort() as [string, string] });
      }
    }
  }
  return sortie.sort((x, y) => x.email.localeCompare(y.email) || x.creneaux[0].localeCompare(y.creneaux[0]) || x.creneaux[1].localeCompare(y.creneaux[1]));
}

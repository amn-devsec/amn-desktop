import { ajouterJours, debutDeMois, jourDeParis, lundiDe, type Jour } from './commun';

/**
 * H01 · CALENDRIER — ce que la grille a besoin de savoir (fiche H01, à confirmer).
 *
 * Écrit d'après le modèle `Evenement` de SIM (sur-ensemble d'`Appointment`) et la règle citée dans ses types : un
 * événement `systeme` (la ronde de La Garde) **ne compte pas** dans « n rendez-vous » de N01. La grille et ses cotes
 * sont à lire sur la fiche ; ici, seulement ce qui se calcule : quels événements un jour contient, où poser ceux qui
 * se chevauchent, l'état de chacun, la grille du mois.
 */

export interface EvenementDuCalendrier {
  id: string;
  /** Début et fin, ISO 8601 absolus. */
  startAt: string;
  endAt: string;
  /** `cancelled` : annulé ; absent ou autre : maintenu. */
  status?: string;
  /** Produit par l'application elle-même (ronde de La Garde) : ne compte pas comme rendez-vous. */
  systeme?: boolean;
}

const ms = (iso: string): number => Date.parse(iso);

/** Les événements qui COMPTENT un jour : ceux qui commencent ce jour-là (Paris), ni annulés ni produits par l'application. */
export function rendezVousDuJour<E extends EvenementDuCalendrier>(evenements: readonly E[], jour: Jour): E[] {
  return evenements
    .filter((e) => !e.systeme && e.status !== 'cancelled' && jourDeParis(e.startAt) === jour)
    .sort((a, b) => ms(a.startAt) - ms(b.startAt) || a.id.localeCompare(b.id));
}

export type EtatDEvenement = 'annule' | 'passe' | 'en-cours' | 'a-venir';

/** Où en est un événement à un instant : annulé, passé (fin atteinte), en cours (début atteint), à venir. */
export function etatDeLEvenement(e: Pick<EvenementDuCalendrier, 'startAt' | 'endAt' | 'status'>, maintenant: number): EtatDEvenement {
  if (e.status === 'cancelled') return 'annule';
  if (maintenant >= Math.max(ms(e.endAt), ms(e.startAt))) return 'passe';
  return maintenant >= ms(e.startAt) ? 'en-cours' : 'a-venir';
}

/** Le prochain événement qui compte, ou `null`. */
export function prochainEvenement<E extends EvenementDuCalendrier>(evenements: readonly E[], maintenant: number): E | null {
  return (
    evenements
      .filter((e) => !e.systeme && e.status !== 'cancelled' && ms(e.startAt) > maintenant)
      .sort((a, b) => ms(a.startAt) - ms(b.startAt) || a.id.localeCompare(b.id))[0] ?? null
  );
}

export interface Placement {
  id: string;
  /** Colonne de l'événement dans son groupe de chevauchement (0 à gauche). */
  colonne: number;
  /** Nombre de colonnes de son groupe : la largeur d'un événement est 1 / colonnes. */
  colonnes: number;
}

/**
 * Où poser les événements d'un jour. Deux événements qui se chevauchent (l'un commence avant la fin de l'autre ;
 * bout à bout ne chevauche pas) se partagent la largeur ; un événement seul prend toute la largeur. Les groupes de
 * chevauchement sont indépendants : un événement du matin ne rétrécit pas ceux de l'après-midi.
 */
export function placerLesEvenements(evenements: readonly Pick<EvenementDuCalendrier, 'id' | 'startAt' | 'endAt'>[]): Placement[] {
  const tries = [...evenements]
    .map((e) => ({ id: e.id, debut: ms(e.startAt), fin: Math.max(ms(e.endAt), ms(e.startAt)) }))
    .sort((a, b) => a.debut - b.debut || b.fin - a.fin || a.id.localeCompare(b.id));
  const sortie: Placement[] = [];
  let groupe: { id: string; colonne: number }[] = [];
  let finDesColonnes: number[] = [];
  let finDuGroupe = -Infinity;
  const clore = () => {
    for (const g of groupe) sortie.push({ id: g.id, colonne: g.colonne, colonnes: finDesColonnes.length });
    groupe = [];
    finDesColonnes = [];
    finDuGroupe = -Infinity;
  };
  for (const e of tries) {
    if (groupe.length > 0 && e.debut >= finDuGroupe) clore();
    let colonne = finDesColonnes.findIndex((fin) => fin <= e.debut);
    if (colonne === -1) colonne = finDesColonnes.length;
    finDesColonnes[colonne] = e.fin;
    finDuGroupe = Math.max(finDuGroupe, e.fin);
    groupe.push({ id: e.id, colonne });
  }
  clore();
  return sortie;
}

export interface JourDeLaSemaine<E> {
  jour: Jour;
  /** 1 = lundi … 7 = dimanche. */
  jourSemaine: number;
  evenements: E[];
}

/** Les sept jours d'une semaine (lundi à dimanche), chacun avec ses événements, du premier au dernier. */
export function semaineDuCalendrier<E extends EvenementDuCalendrier>(evenements: readonly E[], jourDeLaSemaine: Jour): JourDeLaSemaine<E>[] {
  const lundi = lundiDe(jourDeLaSemaine);
  return Array.from({ length: 7 }, (_, i) => {
    const jour = ajouterJours(lundi, i);
    // Dans la grille, un événement annulé ou produit par l'application reste visible ; seul le COMPTE l'écarte.
    const duJour = evenements
      .filter((e) => jourDeParis(e.startAt) === jour)
      .sort((a, b) => ms(a.startAt) - ms(b.startAt) || a.id.localeCompare(b.id));
    return { jour, jourSemaine: i + 1, evenements: duJour };
  });
}

export interface CaseDuMois {
  jour: Jour;
  dansLeMois: boolean;
}

/** La grille d'un mois : des semaines complètes de lundi à dimanche, de 4 à 6, qui contiennent tout le mois. */
export function moisEnSemaines(jourDuMois: Jour): CaseDuMois[][] {
  const premier = debutDeMois(jourDuMois);
  const mois = premier.slice(0, 7);
  let curseur = lundiDe(premier);
  const semaines: CaseDuMois[][] = [];
  do {
    semaines.push(Array.from({ length: 7 }, (_, i) => ({ jour: ajouterJours(curseur, i), dansLeMois: ajouterJours(curseur, i).startsWith(mois) })));
    curseur = ajouterJours(curseur, 7);
  } while (curseur.slice(0, 7) === mois || semaines.length < 4);
  return semaines;
}

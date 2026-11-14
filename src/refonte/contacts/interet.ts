import type { Prospect } from '../donnees/types';
import { ecartJours, type Jour } from './commun';
import { estOuvert } from './pipeline';

/**
 * LOT-02 · L'INTÉRÊT D'UN PROSPECT (H06 Prospects) — logique pure.
 *
 * La fiche H06 le propose (« proposition à valider ») : un score de 0 à 100 à partir de quatre
 * signaux, pondérés 35 / 25 / 20 / 20. Elle donne les poids, les libellés (froid, tiède, chaud)
 * et la FRAÎCHEUR (0 jour = 100, 30 jours ou plus = 0, linéaire). Elle ne donne PAS l'échelle des
 * trois autres signaux : les `ECHELLES` ci-dessous sont un choix de la session, réglable, à
 * valider avec Harun avant la construction.
 *
 * Le score se recalcule à chaque signal et chaque nuit : ici, une fonction pure de ses entrées.
 */

export interface SignauxInteret {
  /** Lectures du devis ou des documents sur 14 jours (nombre). */
  lectures14j: number;
  /** Délai moyen de réponse du prospect, en heures ; `null` s'il n'a jamais répondu. */
  delaiReponseHeures: number | null;
  /** Rendez-vous tenus ou fixés. */
  rendezVous: number;
  /** Jours depuis le dernier contact ; `null` s'il n'y en a pas. */
  joursDepuisContact: number | null;
}

/** Les poids de la fiche (somme 100). */
export const POIDS_INTERET = { lectures: 35, reponses: 25, rendezVous: 20, fraicheur: 20 } as const;

/** Les échelles qui ramènent chaque signal à 0–100. À valider : la fiche ne les donne pas. */
export const ECHELLES = {
  /** Autant de lectures valent 100. */
  lecturesPourCent: 4,
  /** Une réponse en moins de ce nombre d'heures vaut 100 ; au-delà de `reponseNulleHeures`, 0. */
  reponseRapideHeures: 4,
  reponseNulleHeures: 72,
  /** Autant de rendez-vous valent 100. */
  rendezVousPourCent: 2,
} as const;

const borne = (v: number): number => Math.max(0, Math.min(100, v));

/** Fraîcheur du dernier contact : 0 jour = 100, 30 jours ou plus = 0 (fiche). */
export const fraicheur = (jours: number | null): number => (jours == null ? 0 : borne(100 - (jours * 100) / 30));

export function interet(s: SignauxInteret, echelles = ECHELLES): number {
  const lectures = borne((s.lectures14j * 100) / echelles.lecturesPourCent);
  const reponses =
    s.delaiReponseHeures == null
      ? 0
      : borne(100 - ((s.delaiReponseHeures - echelles.reponseRapideHeures) * 100) / (echelles.reponseNulleHeures - echelles.reponseRapideHeures));
  const rdv = borne((s.rendezVous * 100) / echelles.rendezVousPourCent);
  const v = (POIDS_INTERET.lectures * lectures + POIDS_INTERET.reponses * reponses + POIDS_INTERET.rendezVous * rdv + POIDS_INTERET.fraicheur * fraicheur(s.joursDepuisContact)) / 100;
  return Math.round(v);
}

export type LibelleInteret = 'froid' | 'tiede' | 'chaud';

/** < 34 « froid », 34 à 66 « tiède », > 66 « chaud » (fiche). */
export const libelleInteret = (v: number): LibelleInteret => (v < 34 ? 'froid' : v <= 66 ? 'tiede' : 'chaud');

export interface ReglagesQuadrant {
  interetMin: number;
  montantMinCents: number;
}

/** Le quadrant « À appeler cette semaine » : intérêt ≥ 60 ET montant ≥ 3 000 € (deux réglages de la fiche). */
export const QUADRANT_PAR_DEFAUT: ReglagesQuadrant = { interetMin: 60, montantMinCents: 300_000 };

export interface ProspectNote {
  prospect: Prospect;
  interet: number;
}

export const estPrioritaire = (n: ProspectNote, r: ReglagesQuadrant = QUADRANT_PAR_DEFAUT): boolean =>
  estOuvert(n.prospect) && n.interet >= r.interetMin && (n.prospect.montantCents ?? 0) >= r.montantMinCents;

/** « Appels de la semaine » : le quadrant prioritaire, ordonné par intérêt × montant décroissant. */
export function appelsDeLaSemaine(notes: readonly ProspectNote[], r: ReglagesQuadrant = QUADRANT_PAR_DEFAUT): ProspectNote[] {
  return notes
    .filter((n) => estPrioritaire(n, r))
    .sort((a, b) => b.interet * (b.prospect.montantCents ?? 0) - a.interet * (a.prospect.montantCents ?? 0) || a.prospect.nom.localeCompare(b.prospect.nom, 'fr'));
}

/** Quadrant vide : la liste propose les `n` meilleurs candidats hors quadrant (fiche, états). */
export function candidatsHorsQuadrant(notes: readonly ProspectNote[], r: ReglagesQuadrant = QUADRANT_PAR_DEFAUT, n = 2): ProspectNote[] {
  return notes
    .filter((x) => estOuvert(x.prospect) && !estPrioritaire(x, r))
    .sort((a, b) => b.interet * (b.prospect.montantCents ?? 0) - a.interet * (a.prospect.montantCents ?? 0))
    .slice(0, n);
}

/** La traînée : l'intérêt d'il y a 14 jours, montrée seulement si l'écart est d'au moins 10 points. */
export const trainee = (actuel: number, ilYa14Jours: number | null): number | null => (ilYa14Jours != null && Math.abs(actuel - ilYa14Jours) >= 10 ? ilYa14Jours : null);

/** Chance par étape de H06 (proposition) : modifiable par prospect. Le milieu des fourchettes de la fiche. */
export const CHANCES_H06: Readonly<Record<'nouveau' | 'contacté' | 'rendez-vous' | 'devis envoyé', number>> = {
  nouveau: 20,
  contacté: 38,
  'rendez-vous': 55,
  'devis envoyé': 65,
};

/** Prospects créés depuis `jours` jours (puce « Nouveaux »). */
export const nouveaux = (prospects: readonly Prospect[], aujourdhui: Jour, jours = 14): Prospect[] =>
  prospects.filter((p) => ecartJours(p.creeLe, aujourdhui) <= jours && ecartJours(p.creeLe, aujourdhui) >= 0);

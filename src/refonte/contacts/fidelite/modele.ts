import { totauxDeFacture } from '../../donnees/argent';
import { ajouterJours, ecartJours, jourDeInstant, type Jour } from '../commun';
import { bientotAuPalier, clientsAffiches, niveauPour, PALIERS, progression, REGLES_PROGRAMME, type Niveau, type Palier, type ReglesProgramme } from '../fidelite';
import type { SourcesContacts } from '../sources/types';

/**
 * LOT-02 · MC02 « FIDÉLITÉ » — l'échelle des paliers (logique pure, fiche MC02 rubrique 6).
 *
 * Trois barreaux (Bronze, Argent, Or) entre deux montants ; chaque client est posé selon ses points, relatifs à son palier.
 * Les points et les niveaux sont ceux de `src.fidelite` (déduits des factures payées, des avis et des recommandations,
 * `derivees.ts`). Ce que l'application ne porte pas (le catalogue d'avantages d'un palier, l'historique des points) n'est
 * pas inventé : l'avantage d'un palier est « à définir », et « Le programme ce mois » se recalcule depuis les sources.
 */
export const NIVEAUX_HAUT_EN_BAS: readonly Niveau[] = ['Or', 'Argent', 'Bronze'];
/** Au-dessus de l'Or, l'échelle s'affiche jusqu'à 2 500 points (fiche). */
export const ECHELLE_OR_JUSQUA = 2500;
const INACTIF_JOURS = 30;
const SEMAINE_JOURS = 7;

export interface ClientPose {
  clientId: number;
  nom: string;
  initiale: string;
  points: number;
  niveau: Niveau;
  /** Position dans la plage du palier (0 à 1). */
  part: number;
  derniereActiviteLe: Jour;
  /** Mis en avant : à moins de 100 points du palier suivant. */
  bientot: { manque: number; vers: Niveau } | null;
  inactif: boolean;
  revenuCeMois: boolean;
  /** Le libellé passe à gauche : le client est collé au montant droit (moins de 10 % de la plage restante). */
  libelleAGauche: boolean;
  /** 0 (tige courte) ou 1 (tige haute) : deux rangées alternées pour éviter les chevauchements. */
  rangee: 0 | 1;
  /** La position sur le barreau, en px de la zone de l'échelle : `positionXClient(part)`, écartée des voisins de sa rangée. */
  x: number;
}

export interface BarreauModele {
  niveau: Niveau;
  depuis: number;
  /** Le seuil suivant, ou `null` pour l'Or. */
  jusqua: number | null;
  effectif: number;
  poses: ClientPose[];
  autres: number;
  /** Un carré par client du palier : plein = revenu ce mois. */
  carres: boolean[];
  revenus: number;
}

export type GenreGeste = 'anniversaire' | 'seuil' | 'palier';
export interface Geste { cle: string; clientId: number; clientNom: string; niveau: Niveau; genre: GenreGeste; params: Record<string, string | number> }

export interface ModeleFidelite {
  barreaux: BarreauModele[];
  fideles: number;
  actifs: number;
  paliers: readonly Palier[];
  regles: ReglesProgramme;
  gestes: Geste[];
  programme: { pointsDistribues: number; avantagesUtilises: number; avantagesCents: number; revenus: number };
  suggestion: { clientId: number; clientNom: string; jours: number; rythme: number } | null;
  chips: { tous: number; bientot: number; inactifs: number };
  total: number;
}

export type FiltreEchelle = 'tous' | 'bientot' | 'inactifs';

/** x d'un client sur le barreau : 230 + part × 444 (la zone de l'échelle : montants à 214 et 690). */
export const X_GAUCHE = 230;
export const LARGEUR_PLAGE = 444;
export const positionXClient = (part: number): number => X_GAUCHE + Math.max(0, Math.min(1, part)) * LARGEUR_PLAGE;

/** La position dans la plage de son palier : pour l'Or, jusqu'à 2 500 points. */
export function partDansLePalier(points: number, paliers: readonly Palier[] = PALIERS): number {
  const p = progression(points, paliers);
  if (p.suivant) return Math.max(0, Math.min(1, p.part));
  const or = paliers[paliers.length - 1].depuis;
  return Math.max(0, Math.min(1, (points - or) / (ECHELLE_OR_JUSQUA - or)));
}

/** Place minimale entre deux clients d'une même rangée : un carré de 26 et un libellé de 110 px. */
export const ECART_MINIMAL = 140;
const BORNE_GAUCHE = X_GAUCHE;

/**
 * Deux rangées alternées, dans l'ordre de gauche à droite : deux voisins ne partagent jamais la même tige. Dans une même
 * rangée, deux clients restent à `ECART_MINIMAL` px l'un de l'autre au moins : le plus à droite garde sa place, les autres
 * reculent vers la gauche (des clients tous au plafond de l'échelle ne s'empilent pas).
 */
export function rangees<T extends { part: number }>(clients: readonly T[]): (T & { rangee: 0 | 1; x: number })[] {
  const tries = [...clients].sort((a, b) => a.part - b.part).map((c, i) => ({ ...c, rangee: (i % 2) as 0 | 1, x: positionXClient(c.part) }));
  for (const r of [0, 1] as const) {
    const ligne = tries.filter((c) => c.rangee === r);
    for (let i = ligne.length - 2; i >= 0; i -= 1) ligne[i].x = Math.max(BORNE_GAUCHE, Math.min(ligne[i].x, ligne[i + 1].x - ECART_MINIMAL));
  }
  return tries;
}

const debutDuMois = (j: Jour): Jour => `${j.slice(0, 7)}-01`;

export function modeleFidelite(src: SourcesContacts, o: { paliers?: readonly Palier[]; regles?: ReglesProgramme } = {}): ModeleFidelite {
  const paliers = o.paliers ?? PALIERS;
  const regles = o.regles ?? REGLES_PROGRAMME;
  const debut = debutDuMois(src.aujourdhui);
  const parClient = new Map(src.clients.map((c) => [c.id, c]));
  const comptes = src.fidelite.filter((c) => c.points > 0);

  const clients: ClientPose[] = comptes.map((c) => {
    const niveau = niveauPour(c.points, paliers);
    const part = partDansLePalier(c.points, paliers);
    return {
      clientId: c.clientId, nom: c.clientNom, initiale: c.clientNom.trim().charAt(0).toUpperCase(), points: c.points, niveau, part,
      derniereActiviteLe: c.derniereActiviteLe, bientot: bientotAuPalier(c.points, paliers, regles),
      inactif: ecartJours(c.derniereActiviteLe, src.aujourdhui) >= INACTIF_JOURS, revenuCeMois: c.derniereActiviteLe >= debut && c.derniereActiviteLe <= src.aujourdhui,
      libelleAGauche: part > 0.9, rangee: 0, x: positionXClient(part),
    };
  });

  const barreaux: BarreauModele[] = NIVEAUX_HAUT_EN_BAS.map((niveau) => {
    const i = paliers.findIndex((p) => p.niveau === niveau);
    const liste = clients.filter((c) => c.niveau === niveau);
    const { affiches, autres } = clientsAffiches(liste, paliers, 4);
    return {
      niveau, depuis: paliers[i].depuis, jusqua: paliers[i + 1]?.depuis ?? null, effectif: liste.length,
      poses: rangees(affiches) as ClientPose[], autres,
      carres: [...liste].sort((a, b) => Number(b.revenuCeMois) - Number(a.revenuCeMois)).map((c) => c.revenuCeMois),
      revenus: liste.filter((c) => c.revenuCeMois).length,
    };
  });

  const actifs = src.clients.filter((c) => c.status === 'active').length;

  // « À offrir cette semaine » : un anniversaire de relation, un seuil de points franchi, un passage de palier.
  const gestes: Geste[] = [];
  const dans7 = ajouterJours(src.aujourdhui, SEMAINE_JOURS);
  for (const c of comptes) {
    const fiche = parClient.get(c.clientId);
    if (!fiche) continue;
    const niveau = niveauPour(c.points, paliers);
    const annee = Number(src.aujourdhui.slice(0, 4));
    const prochain = `${annee}${fiche.debutLe.slice(4)}` < src.aujourdhui ? `${annee + 1}${fiche.debutLe.slice(4)}` : `${annee}${fiche.debutLe.slice(4)}`;
    const ans = Number(prochain.slice(0, 4)) - Number(fiche.debutLe.slice(0, 4));
    if (ans >= 1 && prochain <= dans7) gestes.push({ cle: `an-${c.clientId}`, clientId: c.clientId, clientNom: c.clientNom, niveau, genre: 'anniversaire', params: { n: ans, jour: prochain } });
    const seuil = Math.floor(c.points / 500) * 500;
    if (seuil >= 500 && c.points - seuil < 50) gestes.push({ cle: `seuil-${c.clientId}`, clientId: c.clientId, clientNom: c.clientNom, niveau, genre: 'seuil', params: { points: seuil } });
    const franchi = paliers.find((p) => p.depuis > 0 && c.points >= p.depuis && c.points - p.depuis < 50);
    if (franchi) gestes.push({ cle: `palier-${c.clientId}`, clientId: c.clientId, clientNom: c.clientNom, niveau, genre: 'palier', params: { niveau: franchi.niveau } });
  }
  const ordreGeste: Record<GenreGeste, number> = { palier: 0, anniversaire: 1, seuil: 2 };
  gestes.sort((a, b) => ordreGeste[a.genre] - ordreGeste[b.genre] || a.clientNom.localeCompare(b.clientNom, 'fr'));

  // « Le programme ce mois » : points attribués dans le mois civil, avantages utilisés ce mois, clients revenus.
  const factures = src.factures.filter((f) => f.status === 'paid' && f.paidAt >= debut && f.paidAt <= src.aujourdhui);
  const pointsFactures = factures.reduce((s, f) => s + Math.floor((totauxDeFacture(f).ttcCents / 100) * regles.pointsParEuro), 0);
  const pointsAvis = src.avis.filter((a) => a.date >= debut && a.date <= src.aujourdhui).length * regles.pointsParAvis;
  const pointsReco = src.fidelite.reduce((s, c) => s + c.recommandations.filter((j) => j >= debut && j <= src.aujourdhui).length, 0) * regles.pointsParRecommandation;
  const utilises = src.fidelite.flatMap((c) => c.avantages.filter((a) => a.statut === 'Utilisé' && a.le >= debut && a.le <= src.aujourdhui));

  // La suggestion : un client dont l'intervalle habituel entre deux factures payées est dépassé de moitié ou plus.
  let meilleure: ModeleFidelite['suggestion'] = null;
  let rapportMax = 0;
  for (const c of comptes) {
    const jours = src.factures.filter((f) => f.clientId === c.clientId && f.status === 'paid' && f.paidAt <= src.aujourdhui).map((f) => f.paidAt).sort();
    if (jours.length < 3) continue;
    const ecarts = jours.slice(1).map((j, i) => ecartJours(jours[i], j)).filter((n) => n > 0).sort((a, b) => a - b);
    if (ecarts.length === 0) continue;
    const rythme = ecarts[Math.floor(ecarts.length / 2)];
    const depuis = ecartJours(jours[jours.length - 1], src.aujourdhui);
    if (depuis >= rythme * 1.5 && depuis / rythme > rapportMax) { rapportMax = depuis / rythme; meilleure = { clientId: c.clientId, clientNom: c.clientNom, jours: depuis, rythme }; }
  }

  const poseesVisibles = barreaux.flatMap((b) => b.poses);
  return {
    barreaux, fideles: comptes.length, actifs, paliers, regles, gestes: gestes.slice(0, 3),
    programme: { pointsDistribues: pointsFactures + pointsAvis + pointsReco, avantagesUtilises: utilises.length, avantagesCents: utilises.reduce((s, a) => s + a.valeurCents, 0), revenus: barreaux.reduce((s, b) => s + b.revenus, 0) },
    suggestion: meilleure,
    chips: { tous: comptes.length, bientot: clients.filter((c) => c.bientot).length, inactifs: clients.filter((c) => c.inactif).length },
    total: poseesVisibles.length,
  };
}

/** Un client reste en pleine lumière si le filtre le garde ; les autres pâlissent. */
export const gardeLeFiltre = (c: Pick<ClientPose, 'bientot' | 'inactif'>, f: FiltreEchelle): boolean => (f === 'tous' ? true : f === 'bientot' ? c.bientot != null : c.inactif);

/** L'anniversaire se lit « 2e » en français, « 2nd » en anglais : la vue choisit. Ici seulement le jour du mois. */
export const jourDeLAnnee = (j: Jour): { jour: number; mois: number } => ({ jour: Number(j.slice(8, 10)), mois: Number(j.slice(5, 7)) });
export { jourDeInstant };

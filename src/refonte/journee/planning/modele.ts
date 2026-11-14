import { ajouterJours, jourDeParis, jourSemaineIso, lundiDe, type Jour } from '../commun';

/**
 * LOT-01 · MJ03 « PLANNING DE L'ÉQUIPE » — un bloc par personne sur une semaine (logique pure, fiche MJ03 rubriques 3, 4 et 6).
 *
 * Ce qui se CALCULE ici : la place de chaque créneau sur l'axe de 9:00 à 18:00, le total du jour et le réservé de la semaine (charge ÷ 35 h),
 * la semaine « remplie » de l'équipe, les créneaux libres d'aujourd'hui (trous d'au moins 1 h entre l'heure courante et 18:00), l'état du
 * moment sous chaque nom, le bandeau d'équilibre. JAMAIS un tri par charge : la personne connectée d'abord, puis l'ordre de l'équipe.
 * Un chevauchement est une information (les deux barres se partagent la hauteur, bord d'alerte), pas une faute ; une absence ne compte pas.
 */
export const DEBUT_AXE = 9 * 60;
export const FIN_AXE = 18 * 60;
export const MIN_AXE = FIN_AXE - DEBUT_AXE;
export const DISPONIBILITE_PAR_DEFAUT_H = 35;
export const LIBRE_MIN = 60;
export const SEUIL_ORANGE = 0.85;
export const SEUIL_ROUGE = 1;
export const ECART_EQUILIBRE_MIN_H = 2;

export type CategorieCreneau = 'client' | 'argent' | 'interne' | 'securite';
export const CATEGORIES: readonly CategorieCreneau[] = ['client', 'argent', 'interne', 'securite'];

export interface CreneauPlanning { id: string; jour: Jour; debut: string; fin: string; titre: string; categorie: CategorieCreneau; personnes: readonly string[]; /** Le titre entier, pour la phrase « Rendez-vous Menna à 11:00 » quand la barre est étroite. */ titreLong?: string }
export interface PersonnePlanning { id: string; nom: string; role: string; enLigne: boolean; moi: boolean; disponibiliteH: number; absents?: readonly Jour[] }

export interface BarreCreneau {
  id: string;
  titre: string;
  categorie: CategorieCreneau;
  debut: string;
  fin: string;
  /** Position et largeur sur l'axe, en part de 0 à 1. */
  x: number;
  largeur: number;
  dureeMin: number;
  /** Deux créneaux de la personne se chevauchent : ils se partagent la hauteur de la ligne. */
  conflit: boolean;
  rangee: 0 | 1;
  rangees: 1 | 2;
  /** Pas de titre sous 34 px de large. */
  sansTitre: boolean;
}
export interface Libre { debut: string; fin: string; x: number; largeur: number; dureeMin: number }
export interface LigneJour { jour: Jour; aujourdhui: boolean; absent: boolean; barres: BarreCreneau[]; libres: Libre[]; totalMin: number }
export type EtatDuMoment = { genre: 'rendezVous'; titre: string; heure: string } | { genre: 'occupe'; jusqua: string } | { genre: 'libre'; jusqua: string } | null;
export interface BlocPersonne {
  id: string;
  nom: string;
  role: string;
  moi: boolean;
  enLigne: boolean;
  lignes: LigneJour[];
  reserveMin: number;
  disponibiliteMin: number;
  /** 0 à 1+ : le réservé ÷ la disponibilité. */
  charge: number;
  ton: 'ok' | 'orange' | 'rouge';
  moment: EtatDuMoment;
}
export interface Equilibre { nom: string; ecartH: number }

export interface ModeleSemainePlanning {
  lundi: Jour;
  vendredi: Jour;
  blocs: BlocPersonne[];
  /** La ligne de l'heure courante (part de l'axe) ; `null` hors de la semaine courante ou hors de 9:00–18:00. */
  maintenant: { x: number; heure: string } | null;
  heuresLibresAujourdhuiMin: number | null;
  remplie: { reserveMin: number; disponibleMin: number; pourcent: number | null };
  equilibre: Equilibre | null;
  semaineCourante: boolean;
  vide: boolean;
}

const minutesDe = (hhmm: string): number => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
const hhmm = (min: number): string => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
const xDe = (min: number): number => Math.min(1, Math.max(0, (min - DEBUT_AXE) / MIN_AXE));
export const heures = (min: number): string => { const h = Math.floor(min / 60); const m = min % 60; return m === 0 ? `${h} h` : h === 0 ? `${m} min` : `${h} h ${String(m).padStart(2, '0')}`; };

const minutesParis = (ms: number): number => {
  const p = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date(ms));
  return (Number(p.find((x) => x.type === 'hour')?.value) % 24) * 60 + Number(p.find((x) => x.type === 'minute')?.value);
};

/** Deux créneaux se chevauchent s'ils ne sont pas bout à bout. */
const seChevauchent = (a: { debut: string; fin: string }, b: { debut: string; fin: string }): boolean => minutesDe(a.debut) < minutesDe(b.fin) && minutesDe(b.debut) < minutesDe(a.fin);

/** Les trous d'au moins 1 h entre `depuis` (minutes) et 18:00, autour des créneaux donnés. */
export function creneauxLibres(creneaux: readonly Pick<CreneauPlanning, 'debut' | 'fin'>[], depuis: number): Libre[] {
  const occ = creneaux.map((c) => [Math.max(depuis, minutesDe(c.debut)), Math.min(FIN_AXE, minutesDe(c.fin))] as const).filter(([a, b]) => b > a).sort((a, b) => a[0] - b[0]);
  const trous: Libre[] = [];
  let courant = Math.max(DEBUT_AXE, depuis);
  const pousser = (a: number, b: number) => { if (b - a >= LIBRE_MIN) trous.push({ debut: hhmm(a), fin: hhmm(b), x: xDe(a), largeur: xDe(b) - xDe(a), dureeMin: b - a }); };
  for (const [a, b] of occ) { if (a > courant) pousser(courant, a); courant = Math.max(courant, b); }
  if (courant < FIN_AXE) pousser(courant, FIN_AXE);
  return trous;
}

export interface EntreesPlanning {
  personnes: readonly PersonnePlanning[];
  creneaux: readonly CreneauPlanning[];
  maintenant: number;
  /** Un jour de la semaine à montrer (par défaut aujourd'hui) ; +7 jours = « Semaine prochaine ». */
  jour?: Jour;
}

export function modelePlanning(e: EntreesPlanning): ModeleSemainePlanning {
  const aujourdhui = jourDeParis(e.maintenant);
  const lundi = lundiDe(e.jour ?? aujourdhui);
  const jours = Array.from({ length: 5 }, (_, i) => ajouterJours(lundi, i));
  const semaineCourante = jours.includes(aujourdhui);
  const nowMin = minutesParis(e.maintenant);
  const dansAxe = semaineCourante && jourSemaineIso(aujourdhui) <= 5 && nowMin >= DEBUT_AXE && nowMin <= FIN_AXE;

  // Un créneau « toute l'équipe » n'existe pas ici : il est écrit pour chaque personne par l'appelant (la logique de S2 donne `personnesDuCreneau`).
  const ordonnees = [...e.personnes].sort((a, b) => Number(b.moi) - Number(a.moi));
  const blocs: BlocPersonne[] = ordonnees.map((p) => {
    const lignes: LigneJour[] = jours.map((j) => {
      const absent = p.absents?.includes(j) ?? false;
      const duJour = absent ? [] : e.creneaux.filter((c) => c.jour === j && c.personnes.includes(p.id)).sort((a, b) => minutesDe(a.debut) - minutesDe(b.debut) || a.id.localeCompare(b.id));
      const barres: BarreCreneau[] = duJour.map((c) => {
        const conflit = duJour.some((o) => o.id !== c.id && seChevauchent(c, o));
        const rangee = conflit ? (duJour.filter((o) => seChevauchent(c, o) && (minutesDe(o.debut) < minutesDe(c.debut) || (minutesDe(o.debut) === minutesDe(c.debut) && o.id < c.id))).length % 2 === 0 ? 0 : 1) : 0;
        const x = xDe(minutesDe(c.debut));
        const largeur = xDe(minutesDe(c.fin)) - x;
        return { id: c.id, titre: c.titre, categorie: c.categorie, debut: c.debut, fin: c.fin, x, largeur, dureeMin: minutesDe(c.fin) - minutesDe(c.debut), conflit, rangee: rangee as 0 | 1, rangees: conflit ? 2 : 1, sansTitre: largeur * 784 < 34 };
      });
      const estAujourdhui = j === aujourdhui;
      return {
        jour: j, aujourdhui: estAujourdhui, absent, barres,
        libres: estAujourdhui && dansAxe && !absent ? creneauxLibres(duJour, nowMin) : [],
        totalMin: duJour.reduce((s, c) => s + minutesDe(c.fin) - minutesDe(c.debut), 0),
      };
    });
    const reserveMin = lignes.reduce((s, l) => s + l.totalMin, 0);
    const disponibiliteMin = p.disponibiliteH * 60;
    const charge = disponibiliteMin > 0 ? reserveMin / disponibiliteMin : 0;
    // L'état du moment : seulement pour la semaine courante, en heures ouvrées.
    let moment: EtatDuMoment = null;
    if (dansAxe) {
      const auj = e.creneaux.filter((c) => c.jour === aujourdhui && c.personnes.includes(p.id)).sort((a, b) => minutesDe(a.debut) - minutesDe(b.debut));
      const encours = auj.find((c) => minutesDe(c.debut) <= nowMin && minutesDe(c.fin) > nowMin);
      const prochainClient = auj.find((c) => c.categorie === 'client' && minutesDe(c.debut) > nowMin && minutesDe(c.debut) - nowMin < 30);
      if (prochainClient) moment = { genre: 'rendezVous', titre: prochainClient.titreLong ?? prochainClient.titre, heure: prochainClient.debut };
      else if (encours) moment = { genre: 'occupe', jusqua: hhmm(Math.max(...auj.filter((c) => minutesDe(c.debut) <= nowMin).map((c) => minutesDe(c.fin)))) };
      else {
        const suivant = auj.find((c) => minutesDe(c.debut) > nowMin);
        moment = { genre: 'libre', jusqua: suivant ? suivant.debut : hhmm(FIN_AXE) };
      }
    }
    return { id: p.id, nom: p.nom, role: p.role, moi: p.moi, enLigne: p.enLigne, lignes, reserveMin, disponibiliteMin, charge, ton: charge > SEUIL_ROUGE ? 'rouge' : charge >= SEUIL_ORANGE ? 'orange' : 'ok', moment };
  });

  const reserveEquipe = blocs.reduce((s, b) => s + b.reserveMin, 0);
  const disponibleEquipe = blocs.reduce((s, b) => s + b.disponibiliteMin, 0);
  const libresAujourdhui = dansAxe ? blocs.reduce((s, b) => s + b.lignes.filter((l) => l.aujourdhui).reduce((t, l) => t + l.libres.reduce((u, x) => u + x.dureeMin, 0), 0), 0) : null;

  // Équilibre : la personne la moins chargée contre la moins chargée des autres, arrondi à l'heure.
  let equilibre: Equilibre | null = null;
  if (blocs.length >= 3) {
    const tri = [...blocs].sort((a, b) => a.reserveMin - b.reserveMin || a.id.localeCompare(b.id));
    const ecartH = Math.round((tri[1].reserveMin - tri[0].reserveMin) / 60);
    if (ecartH >= ECART_EQUILIBRE_MIN_H) equilibre = { nom: tri[0].nom, ecartH };
  }
  return {
    lundi, vendredi: jours[4], blocs, maintenant: dansAxe ? { x: xDe(nowMin), heure: hhmm(nowMin) } : null, heuresLibresAujourdhuiMin: libresAujourdhui,
    remplie: { reserveMin: reserveEquipe, disponibleMin: disponibleEquipe, pourcent: disponibleEquipe > 0 ? Math.round((reserveEquipe / disponibleEquipe) * 100) : null },
    equilibre, semaineCourante, vide: e.creneaux.length === 0,
  };
}

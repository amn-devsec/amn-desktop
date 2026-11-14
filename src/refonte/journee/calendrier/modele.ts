import { ajouterJours, ecartJours, jourDeParis, jourSemaineIso, lundiDe, type Jour } from '../commun';
import { etatDeLEvenement, moisEnSemaines, placerLesEvenements, semaineDuCalendrier, type EtatDEvenement } from '../calendrier';

/**
 * LOT-01 · H01 « CALENDRIER » — la semaine heure par heure (logique pure, fiche H01 rubriques 3, 6 et 10).
 *
 * Ce qui se CALCULE ici : la place de chaque bloc sur la grille (47 px par heure, de 08:00 à 19:00), les colonnes des blocs qui se
 * chevauchent, la charge de chaque jour (barre sur une plage de travail de 9 h, jamais de rouge, jamais « surchargé »), la ligne
 * « maintenant », le sous-titre (« 12 rendez-vous, 2 h 30 libres lundi »), le mini-mois, « Ensuite » et le créneau proposé.
 * Le trajet n'est pas un événement : il n'a ni couleur de famille ni clic (fiche, piège « Trajet »).
 */
export const PX_PAR_HEURE = 47;
export const HEURE_DEBUT = 8;
export const HEURE_FIN = 19;
export const HAUTEUR_GRILLE = (HEURE_FIN - HEURE_DEBUT) * PX_PAR_HEURE;
export const HAUTEUR_MIN = 22;
/** La plage de travail qui sert de base à la barre de charge (9 h : réglage proposé par la fiche). */
export const PLAGE_TRAVAIL_MIN = 9 * 60;
export const COLONNES_MAX = 3;

/** Les six familles de couleur (fiche H01 rubrique 6) : Équipe (bleu Ma journée), Clients, Argent, Chantiers, Sécurité, Personnel. */
export type FamilleBloc = 'equipe' | 'clients' | 'argent' | 'chantiers' | 'securite' | 'personnel';
export const FAMILLES_BLOC: readonly FamilleBloc[] = ['equipe', 'clients', 'argent', 'chantiers', 'securite', 'personnel'];
export type GenreBloc = 'normal' | 'concentration' | 'trajet';

/** Ce que la grille lit d'un événement. `lieu` : le lieu ou la salle ; `enLigne` : il y a une salle ou un lien. */
export interface EvenementGrille {
  id: string;
  titre: string;
  startAt: string;
  endAt: string;
  status?: string;
  systeme?: boolean;
  famille: FamilleBloc;
  genre: GenreBloc;
  detail?: string;
  lieu?: string;
  enLigne?: boolean;
  participants?: readonly string[];
}

/** Un événement sur un ou plusieurs jours entiers (ligne « journée »). */
export interface EvenementJournee { id: string; titre: string; debut: Jour; fin: Jour; famille: FamilleBloc }

export interface BlocGrille {
  id: string;
  titre: string;
  genre: GenreBloc;
  famille: FamilleBloc;
  heure: string;
  detail: string;
  /** Position dans la colonne du jour (px depuis 08:00) et hauteur. */
  y: number;
  hauteur: number;
  colonne: number;
  colonnes: number;
  etat: EtatDEvenement;
  prochain: boolean;
  /** Une seule ligne : sous 40 px de haut. */
  uneLigne: boolean;
  dureeMin: number;
}

export interface Puce { id: string; titre: string; famille: FamilleBloc; colDebut: number; colFin: number }

export interface JourGrille {
  jour: Jour;
  /** 1 = lundi … 7 = dimanche. */
  jourSemaine: number;
  numero: number;
  weekend: boolean;
  aujourdhui: boolean;
  chargeMin: number;
  /** 0 à 1 de la plage de travail ; `null` le week-end (pas de barre). */
  charge: number | null;
  blocs: BlocGrille[];
  /** Au-delà de trois colonnes : « + n ». */
  enPlus: number;
}

export interface CreneauPropose { startAt: string; endAt: string; titre: string; tacheId: string; echeance: string }
export interface TacheUrgente { id: string; titre: string; echeance: string }

export interface ModeleSemaine {
  lundi: Jour;
  dimanche: Jour;
  semaine: number;
  jours: JourGrille[];
  puces: Puce[];
  /** La ligne « maintenant » : visible seulement si la semaine contient aujourd'hui. */
  maintenant: { y: number; heure: string; colonne: number } | null;
  /** Les heures dont l'étiquette disparaît (la pastille « 10:42 » est à moins de 25 minutes). */
  heuresMasquees: number[];
  nbRendezVous: number;
  libres: { minutes: number; jour: Jour; demain: boolean } | null;
  mois: { titre: string; semaines: { jour: Jour; numero: number; dansLeMois: boolean; weekend: boolean; aujourdhui: boolean; points: boolean; dansLaSemaine: boolean }[][] };
  concentrationMin: number;
  ensuite: { id: string; titre: string; debut: string; fin: string; lieu: string; dans: { genre: 'minutes'; n: number } | { genre: 'heure'; heure: string }; participants: string[]; action: 'rejoindre' | 'preparer' } | null;
  propose: (CreneauPropose & { y: number; hauteur: number; jour: Jour; colonne: number; heure: string; fin: string; echeanceHeure: string }) | null;
  /** Les familles et genres présents (le pied de la carte). */
  presents: { familles: FamilleBloc[]; concentration: boolean; trajet: boolean; propose: boolean };
  vide: boolean;
}

const minutesParis = (iso: string | number): number => {
  const d = new Date(typeof iso === 'number' ? iso : Date.parse(iso));
  const p = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(d);
  const get = (t: string) => Number(p.find((x) => x.type === t)?.value);
  return (get('hour') % 24) * 60 + get('minute');
};
export const heureHHMM = (iso: string | number): string => {
  const m = minutesParis(iso);
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};
export const yDeLaMinute = (m: number): number => ((m - HEURE_DEBUT * 60) * PX_PAR_HEURE) / 60;

/** « 2 h 30 », « 45 min », « 4 h ». */
export function dureeCourte(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, '0')}`;
}

const duree = (e: Pick<EvenementGrille, 'startAt' | 'endAt'>): number => Math.max(0, Math.round((Date.parse(e.endAt) - Date.parse(e.startAt)) / 60_000));

/** Un événement compte comme « rendez-vous » s'il n'est ni personnel, ni concentration, ni trajet, ni système, ni annulé. */
export const compteCommeRendezVous = (e: EvenementGrille): boolean => !e.systeme && e.status !== 'cancelled' && e.genre === 'normal' && e.famille !== 'personnel';

/**
 * Le créneau que propose Ajmani : une tâche urgente du jour sans créneau, et un trou d'au moins 45 minutes avant son échéance. Jamais dans le
 * passé, jamais sur un autre événement. `null` quand rien ne convient.
 */
export function proposerCreneau(evenements: readonly EvenementGrille[], taches: readonly TacheUrgente[], maintenant: number): CreneauPropose | null {
  const jour = jourDeParis(maintenant);
  const occupes = evenements.filter((e) => e.status !== 'cancelled' && !e.systeme && jourDeParis(e.startAt) === jour).map((e) => [Date.parse(e.startAt), Date.parse(e.endAt)] as const).sort((a, b) => a[0] - b[0]);
  for (const t of taches) {
    const limite = Date.parse(t.echeance);
    if (!Number.isFinite(limite) || jourDeParis(limite) !== jour) continue;
    let depart = Math.ceil(maintenant / 3_600_000) * 3_600_000;
    for (let essais = 0; essais < 12 && depart + 45 * 60_000 <= limite; essais += 1) {
      const fin = Math.min(depart + 60 * 60_000, limite);
      const choc = occupes.find(([a, b]) => a < fin && b > depart);
      if (!choc) return { startAt: new Date(depart).toISOString(), endAt: new Date(fin).toISOString(), titre: t.titre, tacheId: t.id, echeance: t.echeance };
      depart = Math.ceil(choc[1] / 900_000) * 900_000;
    }
  }
  return null;
}

/** Le plus grand temps libre d'un jour dans la plage de travail 09:00–18:00. */
export function plusGrandTempsLibre(evenements: readonly EvenementGrille[], jour: Jour): number {
  const debut = 9 * 60;
  const fin = 18 * 60;
  const occ = evenements
    .filter((e) => e.status !== 'cancelled' && !e.systeme && jourDeParis(e.startAt) === jour)
    .map((e) => [Math.max(debut, minutesParis(e.startAt)), Math.min(fin, minutesParis(e.endAt) || fin)] as const)
    .filter(([a, b]) => b > a)
    .sort((a, b) => a[0] - b[0]);
  let courant = debut;
  let meilleur = 0;
  for (const [a, b] of occ) { meilleur = Math.max(meilleur, a - courant); courant = Math.max(courant, b); }
  return Math.max(meilleur, fin - courant);
}

export interface EntreesSemaine {
  evenements: readonly EvenementGrille[];
  journees?: readonly EvenementJournee[];
  maintenant: number;
  /** Un jour de la semaine à montrer (par défaut aujourd'hui). */
  jour?: Jour;
  taches?: readonly TacheUrgente[];
  /** Créneaux proposés déjà refusés (« Non merci »). */
  refuses?: ReadonlySet<string>;
}

export function modeleSemaine(e: EntreesSemaine): ModeleSemaine {
  const aujourdhui = jourDeParis(e.maintenant);
  const jourVu = e.jour ?? aujourdhui;
  const lundi = lundiDe(jourVu);
  const dimanche = ajouterJours(lundi, 6);
  const parId = new Map(e.evenements.map((x) => [x.id, x]));
  const semaine = semaineDuCalendrier(e.evenements, jourVu);
  const prochainId = prochainRendezVous(e.evenements, e.maintenant)?.id ?? null;

  const jours: JourGrille[] = semaine.map((s) => {
    const duJour = s.evenements;
    const places = new Map(placerLesEvenements(duJour).map((p) => [p.id, p]));
    const blocs: BlocGrille[] = [];
    let enPlus = 0;
    for (const ev of duJour) {
      const p = places.get(ev.id) as { colonne: number; colonnes: number };
      if (p.colonne >= COLONNES_MAX) { enPlus += 1; continue; }
      const d = duree(ev);
      const y = Math.max(0, yDeLaMinute(minutesParis(ev.startAt)));
      const hauteur = Math.max(HAUTEUR_MIN, Math.min(HAUTEUR_GRILLE - y, (d * PX_PAR_HEURE) / 60 - 2));
      blocs.push({
        id: ev.id, titre: ev.titre, genre: ev.genre, famille: ev.famille, heure: heureHHMM(ev.startAt), detail: ev.detail ?? '', y, hauteur,
        colonne: p.colonne, colonnes: Math.min(COLONNES_MAX, p.colonnes), etat: etatDeLEvenement(ev, e.maintenant), prochain: ev.id === prochainId, uneLigne: hauteur < 40, dureeMin: d,
      });
    }
    const chargeMin = duJour.filter((x) => x.status !== 'cancelled' && !x.systeme).reduce((t, x) => t + duree(x), 0);
    const weekend = s.jourSemaine >= 6;
    return { jour: s.jour, jourSemaine: s.jourSemaine, numero: Number(s.jour.slice(8)), weekend, aujourdhui: s.jour === aujourdhui, chargeMin, charge: weekend ? null : Math.min(1, chargeMin / PLAGE_TRAVAIL_MIN), blocs, enPlus };
  });

  const puces: Puce[] = (e.journees ?? []).filter((j) => j.fin >= lundi && j.debut <= dimanche).map((j) => ({
    id: j.id, titre: j.titre, famille: j.famille, colDebut: Math.max(0, ecartJours(lundi, j.debut)), colFin: Math.min(6, ecartJours(lundi, j.fin)),
  }));

  const dansSemaine = aujourdhui >= lundi && aujourdhui <= dimanche;
  const nowMin = minutesParis(e.maintenant);
  const maintenant = dansSemaine && nowMin >= HEURE_DEBUT * 60 && nowMin <= HEURE_FIN * 60 ? { y: yDeLaMinute(nowMin), heure: heureHHMM(e.maintenant), colonne: jourSemaineIso(aujourdhui) - 1 } : null;
  const heuresMasquees: number[] = [];
  if (maintenant) for (let h = HEURE_DEBUT; h <= HEURE_FIN; h += 1) if (Math.abs(h * 60 - nowMin) < 25) heuresMasquees.push(h);

  const dansLaSemaine = e.evenements.filter((x) => jours.some((j) => j.jour === jourDeParis(x.startAt)));
  const nbRendezVous = dansLaSemaine.filter(compteCommeRendezVous).length;
  const prochainOuvre = (() => { let j = dansSemaine ? ajouterJours(aujourdhui, 1) : lundi; while (jourSemaineIso(j) >= 6) j = ajouterJours(j, 1); return j; })();
  const libres = { minutes: plusGrandTempsLibre(e.evenements, prochainOuvre), jour: prochainOuvre, demain: prochainOuvre === ajouterJours(aujourdhui, 1) };

  const semainesMois = moisEnSemaines(jourVu).map((sem) => sem.map((c) => ({
    jour: c.jour, numero: Number(c.jour.slice(8)), dansLeMois: c.dansLeMois, weekend: jourSemaineIso(c.jour) >= 6, aujourdhui: c.jour === aujourdhui,
    points: e.evenements.some((x) => x.status !== 'cancelled' && !x.systeme && jourDeParis(x.startAt) === c.jour), dansLaSemaine: c.jour >= lundi && c.jour <= dimanche,
  })));
  const concentrationMin = dansLaSemaine.filter((x) => x.genre === 'concentration' && x.status !== 'cancelled').reduce((t, x) => t + duree(x), 0);

  const suiv = prochainRendezVous(e.evenements, e.maintenant);
  const ensuite = suiv ? {
    id: suiv.id, titre: suiv.titre, debut: heureHHMM(suiv.startAt), fin: heureHHMM(suiv.endAt), lieu: suiv.lieu ?? '',
    dans: Date.parse(suiv.startAt) - e.maintenant <= 60 * 60_000 ? { genre: 'minutes' as const, n: Math.max(0, Math.ceil((Date.parse(suiv.startAt) - e.maintenant) / 60_000)) } : { genre: 'heure' as const, heure: heureHHMM(suiv.startAt) },
    participants: [...(suiv.participants ?? [])],
    action: suiv.enLigne ? ('rejoindre' as const) : ('preparer' as const),
  } : null;

  const cr = e.taches ? proposerCreneau(e.evenements, e.taches.filter((t) => !e.refuses?.has(t.id)), e.maintenant) : null;
  const colonneP = cr ? jourSemaineIso(jourDeParis(cr.startAt)) - 1 : 0;
  const propose = cr && jourDeParis(cr.startAt) >= lundi && jourDeParis(cr.startAt) <= dimanche ? {
    ...cr, y: yDeLaMinute(minutesParis(cr.startAt)), hauteur: Math.max(HAUTEUR_MIN, (duree(cr) * PX_PAR_HEURE) / 60 - 2), jour: jourDeParis(cr.startAt), colonne: colonneP, heure: heureHHMM(cr.startAt), fin: heureHHMM(cr.endAt), echeanceHeure: heureHHMM(cr.echeance),
  } : null;

  const familles = FAMILLES_BLOC.filter((f) => dansLaSemaine.some((x) => x.famille === f && x.genre === 'normal'));
  void parId;
  return {
    lundi, dimanche, semaine: isoSemaine(lundi), jours, puces, maintenant, heuresMasquees, nbRendezVous, libres, mois: { titre: jourVu.slice(0, 7), semaines: semainesMois }, concentrationMin, ensuite, propose,
    presents: { familles, concentration: dansLaSemaine.some((x) => x.genre === 'concentration'), trajet: dansLaSemaine.some((x) => x.genre === 'trajet'), propose: propose != null },
    vide: dansLaSemaine.filter((x) => !x.systeme).length === 0,
  };
}

/** Le prochain événement qui compte pour « Ensuite » : ni système, ni annulé, ni trajet, ni concentration. */
export function prochainRendezVous(evenements: readonly EvenementGrille[], maintenant: number): EvenementGrille | null {
  return evenements
    .filter((x) => !x.systeme && x.status !== 'cancelled' && x.genre === 'normal' && Date.parse(x.startAt) > maintenant)
    .sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt) || a.id.localeCompare(b.id))[0] ?? null;
}

/** Le numéro de semaine ISO d'un lundi. */
export function isoSemaine(lundi: Jour): number {
  const d = new Date(Date.UTC(Number(lundi.slice(0, 4)), Number(lundi.slice(5, 7)) - 1, Number(lundi.slice(8, 10))));
  const jeudi = new Date(d.getTime() + 3 * 86_400_000);
  const an = new Date(Date.UTC(jeudi.getUTCFullYear(), 0, 1));
  return Math.floor((jeudi.getTime() - an.getTime()) / 86_400_000 / 7) + 1;
}

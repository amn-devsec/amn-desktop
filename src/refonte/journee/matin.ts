import type { Jour } from './commun';

/**
 * L03 · RITUEL DU MATIN — la logique pure (fiche L03, rubriques 6 et 7). Sans React ni horloge : « aujourd'hui » et les minutes viennent de l'appelant.
 *
 * Quatre étapes (la nuit de La Garde, l'argent, l'agenda, les trois choses du jour), UNE seule ouverte à la fois ; les étapes faites se replient en une
 * ligne et se rouvrent par « Revoir » ; une étape à venir n'est pas cliquable. Aucun minuteur : « encore une minute » est une estimation fixe par étape
 * restante. Aucun reproche : passer, quitter, faire le rituel à 15 h ne remet rien à zéro.
 *
 * Ce fichier est distinct de `rituel.ts` (le rituel en trois gestes que la fiche remplace, encore lu par `phrases.ts`).
 */

export const ETAPES_DU_MATIN = ['nuit', 'argent', 'agenda', 'choses'] as const;
export type EtapeDuMatin = (typeof ETAPES_DU_MATIN)[number];

export const PRIORITES_MAX = 3;
/** « à défaut 25 min par tâche ». */
export const DUREE_PAR_DEFAUT_MIN = 25;
/** Le repère de confort de la barre d'équilibre. */
export const SEUIL_DE_CONFORT = 0.6;
export const SEUIL_DE_SURCHARGE = 0.9;
/** « encore une minute » : environ 45 s par étape restante. */
export const SECONDES_PAR_ETAPE = 45;
/** Les candidates : 3 présélectionnées, 3 « autres possibles », 12 au plus. */
export const CANDIDATES_MAX = 12;
export const AUTRES_POSSIBLES = 3;

/* ------------------------------- Parcours ------------------------------- */

export interface Parcours {
  /** L'index (dans la liste d'étapes visibles) de l'étape ouverte. */
  ouverte: number;
  /** Les index des étapes déjà vues (faites ou passées). */
  faites: readonly number[];
  /** « C'est parti » validé. */
  termine: boolean;
}

export const parcoursInitial = (): Parcours => ({ ouverte: 0, faites: [], termine: false });

/** Les étapes que la personne voit : sans le droit « argent », l'étape 2 est masquée (le rituel passe à 3 étapes). */
export function etapesVisibles(droits: { argent: boolean }): EtapeDuMatin[] {
  return ETAPES_DU_MATIN.filter((e) => e !== 'argent' || droits.argent);
}

const sansDoublon = (l: readonly number[]) => [...new Set(l)].sort((a, b) => a - b);

/** Replie l'étape ouverte (elle devient « faite ») et ouvre la première étape pas encore faite, la plus proche après elle, sinon la dernière. */
export function continuer(p: Parcours, nbEtapes: number): Parcours {
  const faites = sansDoublon([...p.faites, p.ouverte]);
  let suivante = -1;
  for (let i = p.ouverte + 1; i < nbEtapes; i += 1) if (!faites.includes(i)) { suivante = i; break; }
  if (suivante === -1) for (let i = 0; i < nbEtapes; i += 1) if (!faites.includes(i)) { suivante = i; break; }
  return { ...p, faites, ouverte: suivante === -1 ? nbEtapes - 1 : suivante };
}

/** « Passer » : passe l'étape en cours sans rien enregistrer ; la navigation est la même que « Continuer ». */
export const passer = continuer;

/** « Retour » : l'étape précédente (la courante garde son choix, elle n'est pas marquée faite). */
export const retour = (p: Parcours): Parcours => ({ ...p, ouverte: Math.max(0, p.ouverte - 1) });

/** « Revoir » : rouvre une étape faite. Une étape à venir n'est pas cliquable : rien ne change. */
export function revoir(p: Parcours, index: number): Parcours {
  return p.faites.includes(index) ? { ...p, ouverte: index } : p;
}

export const estCliquable = (p: Parcours, index: number): boolean => index === p.ouverte || p.faites.includes(index);

export type EtatDeSegment = 'fait' | 'en-cours' | 'a-venir';
export const segments = (p: Parcours, nbEtapes: number): EtatDeSegment[] =>
  Array.from({ length: nbEtapes }, (_, i) => (i === p.ouverte && !p.termine ? 'en-cours' : p.faites.includes(i) || p.termine ? 'fait' : 'a-venir'));

/** Le nombre d'étapes pas encore faites, celle qui est ouverte comprise. */
export const restantes = (p: Parcours, nbEtapes: number): number => (p.termine ? 0 : nbEtapes - p.faites.filter((i) => i < nbEtapes && i !== p.ouverte).length);

/** « encore une minute » : jamais un compte à rebours, une estimation arrondie ; `null` quand il n'y a plus rien à faire. */
export function minutesEstimees(p: Parcours, nbEtapes: number): number | null {
  const n = restantes(p, nbEtapes);
  return n <= 0 ? null : Math.max(1, Math.round((n * SECONDES_PAR_ETAPE) / 60));
}

/* ------------------------------- Candidates ------------------------------- */

export interface Echeance { jour: Jour; /** « HH:MM », ou `null` : « ce soir ». */ heure: string | null }

export interface Candidate {
  id: string;
  titre: string;
  urgente: boolean;
  /** « Argent », « Client » ou le nom d'un projet ; `null` : sans catégorie. */
  categorie: string | null;
  /** Durée connue en minutes ; `null` : pas de durée (25 min par défaut au calcul). */
  dureeMin: number | null;
  echeance: Echeance | null;
  /** Le petit texte de la ligne « autres possibles » (« relance de 640 € », « 3 sous-tâches »). */
  contexte: string | null;
  /** Pour départager sans hasard (date de création, ISO). */
  ordre: string;
}

const jourEnNombre = (j: Jour): number => Date.UTC(+j.slice(0, 4), +j.slice(5, 7) - 1, +j.slice(8, 10)) / 86_400_000;
const ecartEnJours = (de: Jour, a: Jour): number => jourEnNombre(a) - jourEnNombre(de);
const estArgentOuClient = (c: Candidate) => c.categorie !== null && /^(argent|client)$/i.test(c.categorie);

/**
 * Le groupe de tri (fiche rubrique 6) : 1 urgentes ; 2 dues aujourd'hui (par heure) ; 3 client ou argent dues sous 2 jours ; 4 en retard ; 5 le reste par échéance.
 */
export function groupeDeTri(c: Candidate, aujourdhui: Jour): 1 | 2 | 3 | 4 | 5 {
  if (c.urgente) return 1;
  if (c.echeance) {
    const e = ecartEnJours(aujourdhui, c.echeance.jour);
    if (e === 0) return 2;
    if (e > 0 && e <= 2 && estArgentOuClient(c)) return 3;
    if (e < 0) return 4;
  }
  return 5;
}

export function trierLesCandidates(cs: readonly Candidate[], aujourdhui: Jour): Candidate[] {
  const cle = (c: Candidate): [number, string, string] => [groupeDeTri(c, aujourdhui), c.echeance ? `${c.echeance.jour} ${c.echeance.heure ?? '99:99'}` : '9999-99-99 99:99', c.ordre];
  return [...cs].sort((a, b) => {
    const x = cle(a);
    const y = cle(b);
    return x[0] - y[0] || x[1].localeCompare(y[1]) || x[2].localeCompare(y[2]) || a.id.localeCompare(b.id);
  });
}

/** Ajmani présélectionne les 3 premières ; « autres possibles » montre les 3 suivantes ; `reste` : ce qui dépasse (lien « Voir toutes mes tâches »). */
export function preselection(cs: readonly Candidate[], aujourdhui: Jour): { choisies: Candidate[]; autres: Candidate[]; reste: number } {
  const triees = trierLesCandidates(cs, aujourdhui).slice(0, CANDIDATES_MAX);
  return { choisies: triees.slice(0, PRIORITES_MAX), autres: triees.slice(PRIORITES_MAX, PRIORITES_MAX + AUTRES_POSSIBLES), reste: Math.max(0, cs.length - PRIORITES_MAX - AUTRES_POSSIBLES) };
}

export type EtiquetteDEmplacement = { type: 'urgent' } | { type: 'categorie'; texte: string } | null;
export const etiquetteDe = (c: Candidate): EtiquetteDEmplacement => (c.urgente ? { type: 'urgent' } : c.categorie ? { type: 'categorie', texte: c.categorie } : null);

export type EcheanceEnTexte =
  | { type: 'avant'; heure: string }
  | { type: 'ce-soir' }
  | { type: 'jour-court'; jour: Jour }
  | { type: 'date'; jour: Jour }
  | { type: 'aucune' };

/** « avant 17:00 » (aujourd'hui avec heure), « ce soir » (aujourd'hui sans heure), « lun. » (dans la semaine), « 12 nov. » au-delà de 7 jours. */
export function echeanceEnTexte(e: Echeance | null, aujourdhui: Jour): EcheanceEnTexte {
  if (!e) return { type: 'aucune' };
  const ecart = ecartEnJours(aujourdhui, e.jour);
  if (ecart <= 0) return e.heure ? { type: 'avant', heure: e.heure } : { type: 'ce-soir' };
  return ecart <= 7 ? { type: 'jour-court', jour: e.jour } : { type: 'date', jour: e.jour };
}

/* ------------------------------- Les trois emplacements ------------------------------- */

/** Les choix, dans l'ordre des emplacements (le rang d'une priorité est sa position, à partir de 1). */
export type Choix = readonly string[];

export function choisir(choix: Choix, id: string): { choix: Choix; refuse: boolean } {
  if (choix.includes(id)) return { choix, refuse: false };
  if (choix.length >= PRIORITES_MAX) return { choix, refuse: true };
  return { choix: [...choix, id], refuse: false };
}
export const retirer = (choix: Choix, id: string): Choix => choix.filter((x) => x !== id);

/** Glisser un emplacement, ou Alt + ← / → : `de` et `vers` sont des positions (0 à 2) ; l'ordre des autres ne bouge pas. */
export function deplacer(choix: Choix, de: number, vers: number): Choix {
  if (de < 0 || de >= choix.length) return choix;
  const cible = Math.min(Math.max(vers, 0), choix.length - 1);
  const copie = [...choix];
  const [x] = copie.splice(de, 1);
  copie.splice(cible, 0, x);
  return copie;
}

/** Les choix qui existent encore parmi les candidates (une tâche faite ou retirée d'ailleurs disparaît du brouillon sans bruit). */
export const choixValides = (choix: Choix, cs: readonly Candidate[]): Choix => choix.filter((id) => cs.some((c) => c.id === id)).slice(0, PRIORITES_MAX);

/** « Confier à {prénom} » : le membre le moins chargé de la semaine, autre que la personne ; `null` : équipe d'une personne. */
export function moinsCharge(membres: readonly { email: string; prenom: string; charge: number }[], moi: string): { email: string; prenom: string } | null {
  const autres = membres.filter((m) => m.email.toLowerCase() !== moi.toLowerCase());
  if (autres.length === 0) return null;
  const m = [...autres].sort((a, b) => a.charge - b.charge || a.email.localeCompare(b.email))[0];
  return { email: m.email, prenom: m.prenom };
}

/* ------------------------------- « Votre journée se dessine » ------------------------------- */

export interface EvenementDuJour { id: string; debut: number; fin: number; label: string }
export interface PrioriteAPlacer { id: string; rang: number; label: string; dureeMin: number; /** Minute limite (« avant 17:00 ») ; `null` : sans heure. */ avant: number | null }
export interface BlocDeJournee { id: string; type: 'evenement' | 'priorite' | 'pause' | 'marge'; debut: number; fin: number; rang?: number; label: string }

export interface Fenetre { debut: number; fin: number }
export const FENETRE_PAR_DEFAUT: Fenetre = { debut: 8 * 60, fin: 19 * 60 };
/** La pause du midi proposée par défaut ; une proposition, pas une donnée de l'agenda. */
export const PAUSE_PAR_DEFAUT: Fenetre = { debut: 12 * 60 + 30, fin: 13 * 60 + 30 };

function occupe(fenetre: Fenetre, evenements: readonly EvenementDuJour[], pause: Fenetre | null): Fenetre[] {
  const l: Fenetre[] = evenements.map((e) => ({ debut: Math.max(fenetre.debut, e.debut), fin: Math.min(fenetre.fin, e.fin) })).filter((x) => x.fin > x.debut);
  if (pause) l.push({ debut: Math.max(fenetre.debut, pause.debut), fin: Math.min(fenetre.fin, pause.fin) });
  l.sort((a, b) => a.debut - b.debut);
  const fusion: Fenetre[] = [];
  for (const x of l) {
    if (x.fin <= x.debut) continue;
    const d = fusion[fusion.length - 1];
    if (d && x.debut <= d.fin) d.fin = Math.max(d.fin, x.fin);
    else fusion.push({ ...x });
  }
  return fusion;
}

const creneauxLibres = (fenetre: Fenetre, pris: readonly Fenetre[]): Fenetre[] => {
  const libres: Fenetre[] = [];
  let curseur = fenetre.debut;
  for (const p of pris) { if (p.debut > curseur) libres.push({ debut: curseur, fin: p.debut }); curseur = Math.max(curseur, p.fin); }
  if (curseur < fenetre.fin) libres.push({ debut: curseur, fin: fenetre.fin });
  return libres;
};

/** Le temps libre : les heures de travail moins les événements et la pause (minutes). */
export function tempsLibre(fenetre: Fenetre, evenements: readonly EvenementDuJour[], pause: Fenetre | null): number {
  return creneauxLibres(fenetre, occupe(fenetre, evenements, pause)).reduce((s, c) => s + c.fin - c.debut, 0);
}

/**
 * Ajmani place les priorités dans les créneaux libres assez longs, DANS L'ORDRE DES RANGS (chacune après la précédente) et, si possible, avant son
 * échéance ; sinon dans le premier créneau assez long. Ce qui reste après la dernière priorité est la marge. Rien n'est enregistré dans l'agenda.
 */
export function journeeQuiSeDessine(
  fenetre: Fenetre,
  evenements: readonly EvenementDuJour[],
  priorites: readonly PrioriteAPlacer[],
  pause: Fenetre | null = PAUSE_PAR_DEFAUT,
  depuis: number = fenetre.debut,
): { blocs: BlocDeJournee[]; nonPlacees: string[]; margeDebut: number | null; finPrevue: number | null } {
  const pris = occupe(fenetre, evenements, pause);
  const blocs: BlocDeJournee[] = evenements.filter((e) => e.fin > fenetre.debut && e.debut < fenetre.fin).map((e) => ({ id: e.id, type: 'evenement', debut: e.debut, fin: e.fin, label: e.label }));
  if (pause) blocs.push({ id: 'pause', type: 'pause', debut: pause.debut, fin: pause.fin, label: '' });
  const nonPlacees: string[] = [];
  let curseur = Math.max(fenetre.debut, depuis);
  let fin: number | null = null;
  const prises: Fenetre[] = [...pris];
  for (const p of [...priorites].sort((a, b) => a.rang - b.rang)) {
    const libres = creneauxLibres(fenetre, [...prises].sort((a, b) => a.debut - b.debut)).map((c) => ({ debut: Math.max(c.debut, curseur), fin: c.fin })).filter((c) => c.fin - c.debut >= p.dureeMin);
    const avantEcheance = libres.find((c) => p.avant === null || c.debut + p.dureeMin <= p.avant);
    const creneau = avantEcheance ?? libres[0];
    if (!creneau) { nonPlacees.push(p.id); continue; }
    const bloc = { debut: creneau.debut, fin: creneau.debut + p.dureeMin };
    blocs.push({ id: p.id, type: 'priorite', debut: bloc.debut, fin: bloc.fin, rang: p.rang, label: p.label });
    prises.push(bloc);
    curseur = bloc.fin;
    fin = bloc.fin;
  }
  const margeDebut = fin !== null && fin < fenetre.fin ? fin : null;
  if (margeDebut !== null) blocs.push({ id: 'marge', type: 'marge', debut: margeDebut, fin: fenetre.fin, label: '' });
  return { blocs: blocs.sort((a, b) => a.debut - b.debut), nonPlacees, margeDebut, finPrevue: fin };
}

/* ------------------------------- Équilibre ------------------------------- */

export type PhraseDEquilibre = 'marge' | 'remplie' | 'depasse' | 'astuce';

export interface Equilibre {
  /** Somme des durées des priorités (minutes ; 25 par défaut). */
  totalMin: number;
  libreMin: number;
  /** `totalMin / libreMin`, plafonné à 1 pour la barre (la valeur brute reste dans `ratio`). */
  ratio: number;
  phrase: PhraseDEquilibre;
}

/**
 * Somme des durées des priorités sur le temps libre ; repère de confort à 60 %. ≤ 60 % : marge ; 61 à 90 % : bien remplie ; > 90 % : dépasse (jamais un
 * rouge). Sans aucune durée connue, la phrase est l'astuce « ajoutez une durée ».
 */
export function equilibre(priorites: readonly { dureeMin: number | null }[], libreMin: number): Equilibre {
  const totalMin = priorites.reduce((s, p) => s + (p.dureeMin ?? DUREE_PAR_DEFAUT_MIN), 0);
  const ratio = libreMin > 0 ? totalMin / libreMin : totalMin > 0 ? 1 : 0;
  const sansDuree = priorites.length > 0 && priorites.every((p) => p.dureeMin === null);
  const phrase: PhraseDEquilibre = sansDuree ? 'astuce' : ratio <= SEUIL_DE_CONFORT ? 'marge' : ratio <= SEUIL_DE_SURCHARGE ? 'remplie' : 'depasse';
  return { totalMin, libreMin, ratio, phrase };
}

/* ------------------------------- Brouillon ------------------------------- */

/** Le brouillon d'un jour, par personne : le lendemain il est écarté sans message. */
export interface Brouillon { jour: Jour; parcours: Parcours; choix: Choix; confies: readonly string[]; modifieA: string }

export const brouillonVide = (jour: Jour, maintenant: string): Brouillon => ({ jour, parcours: parcoursInitial(), choix: [], confies: [], modifieA: maintenant });

/** Reprend le brouillon du jour ; celui d'un autre jour est écarté. */
export const brouillonDuJour = (b: Brouillon | null, jour: Jour, maintenant: string): Brouillon => (b && b.jour === jour ? b : brouillonVide(jour, maintenant));

/** « Reprise de votre rituel, étape n sur 4 » : seulement quand la personne s'est arrêtée au-delà de la première étape sans avoir fini. */
export const reprise = (b: Brouillon, nbEtapes: number): number | null => (!b.parcours.termine && (b.parcours.ouverte > 0 || b.parcours.faites.length > 0) ? Math.min(nbEtapes, b.parcours.ouverte + 1) : null);

/* ------------------------------- Réglages ------------------------------- */

export interface ReglagesDuRituel { heure: string; /** 1 = lundi … 7 = dimanche. */ jours: readonly number[] }
export const REGLAGES_PAR_DEFAUT: ReglagesDuRituel = { heure: '08:30', jours: [1, 2, 3, 4, 5] };
export const heureValide = (h: string): boolean => /^([01]\d|2[0-3]):[0-5]\d$/.test(h);
export const reglagesValides = (r: Partial<ReglagesDuRituel> | null): ReglagesDuRituel =>
  r && typeof r.heure === 'string' && heureValide(r.heure) && Array.isArray(r.jours) && r.jours.every((j) => Number.isInteger(j) && j >= 1 && j <= 7)
    ? { heure: r.heure, jours: [...new Set(r.jours)].sort((a, b) => a - b) }
    : REGLAGES_PAR_DEFAUT;

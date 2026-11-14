import { ajouterJours, ecartJours, jourSemaineIso, lundiDe, type Jour } from '../commun';
import type { StatutDeProjet } from '../projets';

/**
 * LOT-01 · MJ01 « PROJETS » — la feuille de route (logique pure, fiche MJ01 rubriques 3, 4 et 6).
 *
 * Un couloir par projet sur une frise de 70 jours (« Trimestre » : 10 semaines qui commencent trois semaines avant la semaine du jour) ou de
 * 5 semaines (« Mois »). Ce qui se CALCULE ici : la fenêtre, la place de chaque barre et de chaque jalon, l'ordre des couloirs (en retard
 * d'abord), le statut affiché, l'état de chaque jalon, les « prochains jalons » et le sous-titre. Le mot « En retard » est celui de la fiche ;
 * l'avancement n'est jamais le temps écoulé : la longueur remplie est avancement × durée de la barre.
 */
export const LARGEUR_FRISE = 826;
export const JOURS_TRIMESTRE = 70;
export const JOURS_MOIS = 35;
export const COULOIRS_VISIBLES = 6;

export type FenetreFrise = 'mois' | 'trimestre';
export type EtatJalon = 'atteint' | 'manque' | 'aujourdhui' | 'avenir';

export interface JalonEntree { id: string; titre: string; jour: Jour; fait: boolean }
export interface ProjetEntree {
  id: string;
  nom: string;
  icone: string;
  membres: readonly string[];
  /** Pourcentage, 0 à 100. */
  avancement: number;
  debut: Jour | null;
  fin: Jour | null;
  jalons: readonly JalonEntree[];
  termineLe?: Jour | null;
  archive?: boolean;
  /** Le projet est-il celui de la personne (filtre « Les miens ») ? */
  mien?: boolean;
}

export interface BarreProjet {
  /** px depuis le bord gauche de la frise. */
  x: number;
  largeur: number;
  /** Le projet a commencé avant la frise : bord gauche droit et fondu. */
  coupeAGauche: boolean;
  coupeADroite: boolean;
  /** La partie remplie (avancement × largeur de la barre). */
  rempli: number;
}

export interface JalonPlace { id: string; titre: string; jour: Jour; x: number; etat: EtatJalon; aDroite: boolean }
export interface Couloir {
  id: string;
  nom: string;
  icone: string;
  membres: readonly string[];
  avancement: number;
  statut: StatutDeProjet;
  barre: BarreProjet | null;
  /** Hors fenêtre : la date au bord de la frise (« → 12 janv. », « ← 3 sept. »). */
  horsFenetre: { cote: 'gauche' | 'droite'; jour: Jour } | null;
  sansDates: boolean;
  jalons: JalonPlace[];
}

export interface SemaineFrise { jour: Jour; x: number; debutDeMois: boolean }
export interface ProchainJalon { id: string; jour: Jour; titre: string; projet: string; etat: { genre: 'retard'; jours: number } | { genre: 'aujourdhui' } | { genre: 'jour'; jourSemaine: number } | { genre: 'date' } }

export interface ModeleFeuille {
  debut: Jour;
  fin: Jour;
  jours: number;
  pxParJour: number;
  semaines: SemaineFrise[];
  weekends: { x: number; largeur: number }[];
  /** La ligne « aujourd'hui » (x) ou `null` si elle est hors de la frise. */
  aujourdhuiX: number | null;
  couloirs: Couloir[];
  nbActifs: number;
  nbEnRetard: number;
  prochains: ProchainJalon[];
  aucunProchain: { jour: Jour; titre: string } | null;
  terminesTrimestre: { n: number; objectif: number | null };
  lien: { x1: number; y1: number; x2: number; y2: number; etiquetteX: number; etiquetteY: number } | null;
  vide: boolean;
}

export const ORDRE_STATUT: Record<StatutDeProjet, number> = { 'En retard': 0, 'En cours': 1, 'Presque fini': 1, 'À démarrer': 2, Terminé: 3 };

/** Le statut AFFICHÉ (fiche rubrique 6, dans cet ordre) : Terminé, En retard (un jalon non fait passé ou l'échéance passée), Presque fini (≥ 85 %), À démarrer (0 % et début futur), sinon En cours. */
export function statutAffiche(p: Pick<ProjetEntree, 'avancement' | 'fin' | 'debut' | 'jalons'>, aujourdhui: Jour): StatutDeProjet {
  if (p.avancement >= 100) return 'Terminé';
  if ((p.fin && p.fin < aujourdhui) || p.jalons.some((j) => !j.fait && j.jour < aujourdhui)) return 'En retard';
  if (p.avancement >= 85) return 'Presque fini';
  if (p.avancement <= 0 && (!p.debut || p.debut > aujourdhui)) return 'À démarrer';
  return 'En cours';
}

export function etatDuJalon(j: Pick<JalonEntree, 'jour' | 'fait'>, aujourdhui: Jour): EtatJalon {
  if (j.fait) return 'atteint';
  if (j.jour < aujourdhui) return 'manque';
  return j.jour === aujourdhui ? 'aujourdhui' : 'avenir';
}

/** La fenêtre de la frise : début (un lundi) et nombre de jours. */
export function fenetreDeLaFrise(aujourdhui: Jour, fenetre: FenetreFrise): { debut: Jour; jours: number } {
  const lundi = lundiDe(aujourdhui);
  return fenetre === 'trimestre' ? { debut: ajouterJours(lundi, -21), jours: JOURS_TRIMESTRE } : { debut: ajouterJours(lundi, -7), jours: JOURS_MOIS };
}

export interface EntreesFeuille {
  projets: readonly ProjetEntree[];
  aujourdhui: Jour;
  /** Instant courant (ms) : la ligne du jour se place à l'heure près. */
  maintenant: number;
  fenetre?: FenetreFrise;
  filtre?: 'tous' | 'enRetard' | 'miens';
  objectifTermines?: number | null;
  /** Le lien proposé par Ajmani entre deux projets : de la barre de `deId` (au jour `jour`) vers le début de la barre de `versId`. */
  lien?: { deId: string; versId: string; jour: Jour } | null;
}

export function modeleFeuille(e: EntreesFeuille): ModeleFeuille {
  const f = fenetreDeLaFrise(e.aujourdhui, e.fenetre ?? 'trimestre');
  const px = LARGEUR_FRISE / f.jours;
  const fin = ajouterJours(f.debut, f.jours - 1);
  const xDe = (j: Jour): number => ecartJours(f.debut, j) * px;

  const actifs = e.projets.filter((p) => !p.archive);
  const calcules = actifs.map((p) => ({ p, statut: statutAffiche(p, e.aujourdhui) }));
  const debutTrimestre = `${e.aujourdhui.slice(0, 4)}-${String(Math.floor((Number(e.aujourdhui.slice(5, 7)) - 1) / 3) * 3 + 1).padStart(2, '0')}-01`;
  // Les couloirs : en retard d'abord, puis en cours par échéance croissante, puis à démarrer, puis terminés du trimestre.
  const gardes = calcules.filter(({ p, statut }) => (statut !== 'Terminé' || (p.termineLe ?? '') >= debutTrimestre) && (e.filtre === 'enRetard' ? statut === 'En retard' : e.filtre === 'miens' ? !!p.mien : true));
  gardes.sort((a, b) => ORDRE_STATUT[a.statut] - ORDRE_STATUT[b.statut] || (a.p.fin ?? '9999').localeCompare(b.p.fin ?? '9999') || a.p.id.localeCompare(b.p.id));

  const couloirs: Couloir[] = gardes.map(({ p, statut }) => {
    const sansDates = !p.debut && !p.fin;
    const debut = p.debut ?? p.fin;
    const finP = p.fin ?? p.debut;
    let barre: BarreProjet | null = null;
    let horsFenetre: Couloir['horsFenetre'] = null;
    if (!sansDates && debut && finP) {
      if (finP < f.debut) horsFenetre = { cote: 'gauche', jour: finP };
      else if (debut > fin) horsFenetre = { cote: 'droite', jour: debut };
      else {
        const x1 = Math.max(0, xDe(debut));
        const x2 = Math.min(LARGEUR_FRISE, xDe(finP) + px);
        barre = { x: x1, largeur: Math.max(px, x2 - x1), coupeAGauche: debut < f.debut, coupeADroite: finP > fin, rempli: ((Math.max(px, x2 - x1)) * Math.min(100, Math.max(0, p.avancement))) / 100 };
      }
    }
    const jalons: JalonPlace[] = p.jalons
      .filter((j) => j.jour >= f.debut && j.jour <= fin)
      .map((j) => ({ id: j.id, titre: j.titre, jour: j.jour, x: xDe(j.jour) + px / 2, etat: etatDuJalon(j, e.aujourdhui), aDroite: ecartJours(j.jour, fin) < 7 }));
    return { id: p.id, nom: p.nom, icone: p.icone, membres: p.membres, avancement: p.avancement, statut, barre, horsFenetre, sansDates, jalons };
  });

  const semaines: SemaineFrise[] = [];
  for (let j = f.debut; j <= fin; j = ajouterJours(j, 7)) semaines.push({ jour: j, x: xDe(j), debutDeMois: Number(j.slice(8)) <= 7 });
  const weekends: ModeleFeuille['weekends'] = [];
  for (let i = 0; i < f.jours; i += 1) { const j = ajouterJours(f.debut, i); if (jourSemaineIso(j) === 6) weekends.push({ x: i * px, largeur: Math.min(2 * px, LARGEUR_FRISE - i * px) }); }

  const dansFrise = e.aujourdhui >= f.debut && e.aujourdhui <= fin;
  const parties = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date(e.maintenant));
  const minutes = (Number(parties.find((x) => x.type === 'hour')?.value) % 24) * 60 + Number(parties.find((x) => x.type === 'minute')?.value);
  const aujourdhuiX = dansFrise ? xDe(e.aujourdhui) + (minutes / 1440) * px : null;

  // Prochains jalons : non faits, manqués ou datés des 7 prochains jours, par date (les manqués en tête).
  const limite = ajouterJours(e.aujourdhui, 7);
  const tous = actifs.flatMap((p) => p.jalons.filter((j) => !j.fait).map((j) => ({ p, j })));
  const prochains: ProchainJalon[] = tous.filter(({ j }) => j.jour <= limite).sort((a, b) => a.j.jour.localeCompare(b.j.jour) || a.j.id.localeCompare(b.j.id)).slice(0, 4).map(({ p, j }) => ({
    id: j.id, jour: j.jour, titre: j.titre, projet: p.nom,
    etat: j.jour < e.aujourdhui ? { genre: 'retard' as const, jours: ecartJours(j.jour, e.aujourdhui) } : j.jour === e.aujourdhui ? { genre: 'aujourdhui' as const } : ecartJours(e.aujourdhui, j.jour) <= 6 ? { genre: 'jour' as const, jourSemaine: jourSemaineIso(j.jour) } : { genre: 'date' as const },
  }));
  const apres = tous.filter(({ j }) => j.jour > limite).sort((a, b) => a.j.jour.localeCompare(b.j.jour))[0];

  const termines = e.projets.filter((p) => !p.archive && p.avancement >= 100 && (p.termineLe ?? '') >= debutTrimestre).length;
  const nbEnRetard = calcules.filter((c) => c.statut === 'En retard').length;
  return {
    debut: f.debut, fin, jours: f.jours, pxParJour: px, semaines, weekends, aujourdhuiX, couloirs, nbActifs: calcules.filter((c) => c.statut !== 'Terminé').length, nbEnRetard,
    prochains, aucunProchain: prochains.length === 0 && apres ? { jour: apres.j.jour, titre: apres.j.titre } : null,
    terminesTrimestre: { n: termines, objectif: e.objectifTermines ?? null }, lien: lienPlace(e.lien ?? null, couloirs, f.debut, px), vide: actifs.length === 0,
  };
}

export const HAUTEUR_COULOIR = 48;
export const HAUT_BARRE = 12;
export const HAUTEUR_BARRE = 14;

/** Où dessiner le lien proposé : du bas de la barre de départ (au jour donné) au haut de la barre d'arrivée ; `null` si l'un des deux couloirs n'est pas à l'écran. */
function lienPlace(l: { deId: string; versId: string; jour: Jour } | null, couloirs: readonly Couloir[], debut: Jour, px: number): ModeleFeuille['lien'] {
  if (!l) return null;
  const i = couloirs.findIndex((c) => c.id === l.deId);
  const j = couloirs.findIndex((c) => c.id === l.versId);
  if (i < 0 || j < 0 || !couloirs[j].barre) return null;
  const x1 = ecartJours(debut, l.jour) * px + px / 2;
  const y1 = i * HAUTEUR_COULOIR + HAUT_BARRE + HAUTEUR_BARRE;
  const x2 = couloirs[j].barre.x;
  const y2 = j * HAUTEUR_COULOIR + HAUT_BARRE;
  return { x1, y1, x2, y2, etiquetteX: Math.max(0, x2 - 78), etiquetteY: y2 - 2 };
}

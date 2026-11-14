import { ajouterJours, jourSemaineIso, lundiDe, type Jour } from '../commun';
import { faiteCeJour, prevueCeJour, serieDHabitude, type HabitudeDuLot } from '../habitudes';

/**
 * LOT-01 · MJ02 « HABITUDES » — la grille de régularité (logique pure, fiche MJ02 rubriques 3, 4 et 6).
 *
 * Une ligne par habitude, une case par jour sur 4 semaines (lundi de la semaine d'il y a trois semaines à dimanche). Ce qui se CALCULE ici :
 * l'état de chaque case (fait, pas fait, non prévu, à venir, à faire, en cours, absent avant la création), la série et son palier (jamais
 * « 0 » : « la série reprend ce soir »), la régularité sur 4 semaines et l'écart avec les 4 précédentes, les « journées complètes », la
 * régularité par jour de la semaine et la proposition de protéger un jour. Jamais de reproche : un jour manqué est « pas fait », sans rouge.
 * Les règles de la série, de « prévue ce jour » et de la mesure sont celles de `../habitudes.ts` (S2), non recopiées.
 */
export type MomentDuJour = 'matin' | 'journee' | 'soir';
export type EtatCase = 'fait' | 'pas-fait' | 'non-prevu' | 'a-venir' | 'a-faire' | 'en-cours' | 'absent';
export const SEMAINES = 4;
export const JOURS_GRILLE = 28;
export const PALIERS_JOURS = [7, 14, 21, 30, 60, 100] as const;
export const PALIERS_SEMAINES = [4, 6, 10, 20] as const;
export const SEUIL_JOUR_CHARGE = 10;

export interface HabitudeEntree extends HabitudeDuLot {
  id: string;
  nom: string;
  icone: string;
  moment: MomentDuJour | null;
  /** « Tous les jours · le matin », « 3 fois par semaine »… : le rythme écrit. */
  rythme: string;
  /** Ce qui est écrit quand la mesure vient d'ailleurs : « Mesuré par le téléphone ». */
  detail?: string;
}

export interface CaseGrille { jour: Jour; etat: EtatCase; aujourdhui: boolean; /** Part de la cible faite (0 à 1) pour une mesure chiffrée en cours. */ part?: number }
export interface LigneHabitude {
  id: string;
  nom: string;
  icone: string;
  rythme: string;
  cases: CaseGrille[];
  serie: { valeur: number; unite: 'jours' | 'semaines'; palier: number; part: number; reprend: boolean };
  faiteAujourdhui: boolean;
  /** Une case « à faire » qu'on peut cocher à la main aujourd'hui. */
  cochable: boolean;
}
export interface JourneeComplete { jour: Jour; prevues: number; tenues: number; opacite: number; complete: boolean; aVenir: boolean; aujourdhui: boolean }
export interface JourDeLaSemaine { jourSemaine: number; pourcent: number | null; plusBas: boolean }
export interface Restante { id: string; nom: string; icone: string; genre: 'mesure' | 'case'; part: number; valeurTexte: string; detail: string }

export interface ModeleRegularite {
  debut: Jour;
  fin: Jour;
  semaines: Jour[];
  lignes: LigneHabitude[];
  completes: { jours: JourneeComplete[]; nbCompletes: number; nbJoursPasses: number };
  regularite: { pourcent: number | null; ecartPoints: number | null };
  parJour: { jours: JourDeLaSemaine[]; moyenne: number | null };
  aujourdhui: { faites: number; prevues: number; complete: boolean; restantes: Restante[] };
  proposition: { habitudeId: string; nom: string; jourSemaine: number } | null;
  vide: boolean;
}

/** Le palier suivant la série : 7, 14, 21, 30, 60, 100 jours (4, 6, 10, 20 semaines) ; au-delà, le dernier palier ×2. */
export function palierDe(serie: number, unite: 'jours' | 'semaines'): number {
  const liste = unite === 'jours' ? PALIERS_JOURS : PALIERS_SEMAINES;
  return liste.find((p) => p > serie) ?? liste[liste.length - 1] * 2;
}

/** L'état d'une case : voir la fiche, rubrique 6. */
export function etatDeLaCase(h: HabitudeDuLot, jour: Jour, aujourdhui: Jour): EtatCase {
  if (jour < h.debut) return 'absent';
  if (jour > aujourdhui) return 'a-venir';
  const fait = faiteCeJour(h, jour);
  if (fait) return 'fait';
  if (!prevueCeJour(h, jour)) return 'non-prevu';
  if (jour === aujourdhui) return (h.historique[jour] ?? 0) > 0 && h.mesure.type === 'objectif' ? 'en-cours' : 'a-faire';
  return 'pas-fait';
}

export interface EntreesRegularite {
  habitudes: readonly HabitudeEntree[];
  aujourdhui: Jour;
  filtre?: MomentDuJour | 'toutes';
  /** Pour la mesure chiffrée : « 3 200 » (le nombre écrit, la cible vient de l'habitude). */
  formater?: (n: number) => string;
}

const joursDe = (debut: Jour, n: number): Jour[] => Array.from({ length: n }, (_, i) => ajouterJours(debut, i));

/** La régularité sur une fenêtre de jours PASSÉS (aujourd'hui exclu) : cases tenues ÷ prévues ; `null` sans case prévue. */
function regulariteSur(habitudes: readonly HabitudeEntree[], jours: readonly Jour[], aujourdhui: Jour): { tenues: number; prevues: number } {
  let tenues = 0;
  let prevues = 0;
  for (const h of habitudes) for (const j of jours) {
    if (j >= aujourdhui || j < h.debut) continue;
    const fait = faiteCeJour(h, j);
    if (fait) { tenues += 1; prevues += 1; } else if (prevueCeJour(h, j)) prevues += 1;
  }
  return { tenues, prevues };
}

export function modeleRegularite(e: EntreesRegularite): ModeleRegularite {
  const formater = e.formater ?? ((n: number) => String(n));
  const debut = ajouterJours(lundiDe(e.aujourdhui), -7 * (SEMAINES - 1));
  const fin = ajouterJours(debut, JOURS_GRILLE - 1);
  const jours = joursDe(debut, JOURS_GRILLE);
  const visibles = e.habitudes.filter((h) => !e.filtre || e.filtre === 'toutes' || h.moment === e.filtre);

  const lignes: LigneHabitude[] = visibles.map((h) => {
    const s = serieDHabitude(h, e.aujourdhui);
    const palier = palierDe(s.serie, s.unite);
    const cases = jours.map((j): CaseGrille => {
      const etat = etatDeLaCase(h, j, e.aujourdhui);
      const part = etat === 'en-cours' && h.mesure.type === 'objectif' ? Math.min(1, (h.historique[j] ?? 0) / h.mesure.cible) : undefined;
      return { jour: j, etat, aujourdhui: j === e.aujourdhui, ...(part != null ? { part } : null) };
    });
    const caseDuJour = cases.find((c) => c.aujourdhui);
    return {
      id: h.id, nom: h.nom, icone: h.icone, rythme: h.rythme, cases,
      serie: { valeur: s.serie, unite: s.unite, palier, part: s.serie === 0 ? 0 : Math.min(1, s.serie / palier), reprend: s.serie === 0 },
      faiteAujourdhui: s.faiteAujourdhui, cochable: caseDuJour?.etat === 'a-faire' && h.mesure.type === 'case',
    };
  });

  // Journées complètes : les jours passés où toutes les habitudes prévues sont tenues ; opacité = (tenues ÷ prévues)².
  const comptes: JourneeComplete[] = jours.map((j) => {
    let prevues = 0;
    let tenues = 0;
    for (const h of visibles) {
      if (j < h.debut) continue;
      if (faiteCeJour(h, j)) { tenues += 1; prevues += 1; } else if (prevueCeJour(h, j)) prevues += 1;
    }
    const aVenir = j >= e.aujourdhui;
    return { jour: j, prevues, tenues, opacite: prevues === 0 ? 0 : (tenues / prevues) ** 2, complete: !aVenir && prevues > 0 && tenues === prevues, aVenir, aujourdhui: j === e.aujourdhui };
  });
  const passes = comptes.filter((c) => !c.aVenir);

  const cetteFenetre = regulariteSur(visibles, jours, e.aujourdhui);
  const precedentes = regulariteSur(visibles, joursDe(ajouterJours(debut, -JOURS_GRILLE), JOURS_GRILLE), e.aujourdhui);
  const pct = (r: { tenues: number; prevues: number }): number | null => (r.prevues > 0 ? Math.round((r.tenues / r.prevues) * 100) : null);
  const actuel = pct(cetteFenetre);
  const avant = pct(precedentes);

  const parJour: JourDeLaSemaine[] = Array.from({ length: 7 }, (_, i) => {
    const r = regulariteSur(visibles, jours.filter((j) => jourSemaineIso(j) === i + 1), e.aujourdhui);
    return { jourSemaine: i + 1, pourcent: pct(r), plusBas: false };
  });
  const valeurs = parJour.map((p) => p.pourcent).filter((v): v is number => v != null);
  const moyenne = valeurs.length ? Math.round(valeurs.reduce((s, v) => s + v, 0) / valeurs.length) : null;
  if (moyenne != null) {
    const min = Math.min(...valeurs);
    const idx = parJour.findIndex((p) => p.pourcent === min);
    if (idx >= 0 && min < moyenne - SEUIL_JOUR_CHARGE) parJour[idx].plusBas = true;
  }

  // Aujourd'hui : n/m tenues, la liste des restantes (trois au plus).
  const prevuesAujourdhui = visibles.filter((h) => prevueCeJour(h, e.aujourdhui));
  const faites = prevuesAujourdhui.filter((h) => faiteCeJour(h, e.aujourdhui)).length;
  const restantes: Restante[] = prevuesAujourdhui.filter((h) => !faiteCeJour(h, e.aujourdhui)).slice(0, 3).map((h) => {
    const valeur = h.historique[e.aujourdhui] ?? 0;
    return h.mesure.type === 'objectif'
      ? { id: h.id, nom: h.nom, icone: h.icone, genre: 'mesure' as const, part: Math.min(1, valeur / h.mesure.cible), valeurTexte: formater(valeur), detail: h.detail ?? h.rythme }
      : { id: h.id, nom: h.nom, icone: h.icone, genre: 'case' as const, part: 0, valeurTexte: '', detail: h.detail ?? h.rythme };
  });

  // Proposition : une habitude ratée le même jour de la semaine au moins 3 semaines sur 4 (jamais sur un jour non prévu).
  let proposition: ModeleRegularite['proposition'] = null;
  for (const h of visibles) {
    for (let d = 1; d <= 7 && !proposition; d += 1) {
      const ratees = jours.filter((j) => jourSemaineIso(j) === d && j < e.aujourdhui && j >= h.debut && prevueCeJour(h, j) && !faiteCeJour(h, j)).length;
      if (ratees >= 3) proposition = { habitudeId: h.id, nom: h.nom, jourSemaine: d };
    }
    if (proposition) break;
  }

  return {
    debut, fin, semaines: [0, 1, 2, 3].map((i) => ajouterJours(debut, 7 * i)), lignes,
    completes: { jours: comptes, nbCompletes: passes.filter((c) => c.complete).length, nbJoursPasses: passes.length },
    regularite: { pourcent: actuel, ecartPoints: actuel != null && avant != null ? actuel - avant : null },
    parJour: { jours: parJour, moyenne },
    aujourdhui: { faites, prevues: prevuesAujourdhui.length, complete: prevuesAujourdhui.length > 0 && faites === prevuesAujourdhui.length, restantes },
    proposition, vide: e.habitudes.length === 0,
  };
}

import { ajouterJours, debutDeMois, ecartJours, joursDuMois, jourSemaineIso, lundiDe, plafonner, type Jour } from './commun';

/**
 * LA SÉRIE D'ÉCRITURE — une seule règle pour F20, H10 et ME01 (fiche F20, rubrique 9).
 *
 * Un jour compte dès qu'au moins un mot est enregistré dans une page (H10), dans le
 * journal (ME01) ou dans Rédaction (ME02). La série est celle des jours qui se suivent
 * jusqu'à aujourd'hui, ou jusqu'à hier tant qu'aujourd'hui est vide : la journée n'est
 * pas finie, rien n'est perdu. Les jours de repos réglés ne la cassent pas.
 *
 * Les maquettes ne s'accordent pas : H10 montre 6 jours, ME01 en montre 12 (« ne mesurent
 * pas la même chose », F20 pièges). Ici il n'y en a qu'une, lue par les trois écrans.
 * C'est la « Proposition » de F20 §9 ; elle est à valider par Harun (voir la note du lot).
 *
 * Ce qu'on ne fait pas : aucune comparaison entre membres, aucun point perdu, aucun rouge.
 * Une série interrompue ne devient pas « 0 » : elle « reprend aujourd'hui » (ME01 §8).
 */

/** Les paliers de la série (ME01 §6). */
export const PALIERS_SERIE = [7, 14, 21, 30, 60, 100] as const;
/** Un jour à 260 mots est « plein » (ME01 §6) : l'intensité du rond monte jusque-là. */
export const MOTS_PAR_JOUR_PLEIN = 260;

/** Mots enregistrés par jour, toutes sources réunies. Un jour absent ou à 0 mot n'est pas écrit. */
export type MotsParJour = ReadonlyMap<Jour, number>;

export interface ActiviteEcrite {
  jour: Jour;
  mots: number;
}

/** Additionne les sources (pages, journal, rédaction) jour par jour. Ignore les jours sans mot. */
export function motsParJour(...sources: readonly (readonly ActiviteEcrite[])[]): Map<Jour, number> {
  const out = new Map<Jour, number>();
  for (const source of sources) {
    for (const { jour, mots } of source) {
      if (mots > 0) out.set(jour, (out.get(jour) ?? 0) + mots);
    }
  }
  return out;
}

/** Repos par défaut (décision du CO, STATUT §1.29 n° 1) : samedi et dimanche, réglable. */
export const JOURS_DE_REPOS_PAR_DEFAUT: readonly number[] = [6, 7];

export interface OptionsSerie {
  /** Jours de repos, en jours ISO (1 = lundi … 7 = dimanche) : sauter un jour de repos ne casse pas la série. */
  joursDeRepos?: readonly number[];
}

export type EtatSerie = 'aucune' | 'en-cours' | 'reprise';

export interface Serie {
  /** Jours écrits qui se suivent jusqu'à aujourd'hui (ou hier si aujourd'hui est vide). 0 si interrompue. */
  serie: number;
  /** La plus longue série jamais atteinte. */
  record: number;
  ecritAujourdhui: boolean;
  /** `aucune` : rien n'a jamais été écrit. `reprise` : série interrompue, « la série reprend aujourd'hui ». */
  etat: EtatSerie;
  /** Le prochain palier au-dessus de la série ; `null` au-delà du dernier. */
  prochainPalier: number | null;
  /** Jours d'écriture qui manquent pour l'atteindre (« 14 jours, dans 2 jours »). */
  joursAvantPalier: number | null;
  /** Série / palier, entre 0 et 1 (12 / 14 = 86 %). */
  progression: number;
}

export function serieDEcriture(mots: MotsParJour, aujourdhui: Jour, options: OptionsSerie = {}): Serie {
  const repos = new Set(options.joursDeRepos ?? JOURS_DE_REPOS_PAR_DEFAUT);
  const ecrit = (j: Jour) => (mots.get(j) ?? 0) > 0;
  const ecritAujourdhui = ecrit(aujourdhui);

  // Série en cours : on remonte depuis aujourd'hui (ou hier si aujourd'hui est vide ou de repos).
  let curseur = ecritAujourdhui ? aujourdhui : ajouterJours(aujourdhui, -1);
  let serie = 0;
  const jours = [...mots.keys()].filter(ecrit).sort();
  const premier = jours[0];
  while (premier !== undefined && curseur >= premier) {
    if (ecrit(curseur)) serie += 1;
    else if (!repos.has(jourSemaineIso(curseur))) break;
    curseur = ajouterJours(curseur, -1);
  }

  // Record : on parcourt toute la période.
  let record = 0;
  if (premier !== undefined) {
    let run = 0;
    for (let j = premier; j <= aujourdhui; j = ajouterJours(j, 1)) {
      if (ecrit(j)) {
        run += 1;
        if (run > record) record = run;
      } else if (!repos.has(jourSemaineIso(j))) run = 0;
    }
  }
  record = Math.max(record, serie);

  const etat: EtatSerie = jours.length === 0 ? 'aucune' : serie === 0 ? 'reprise' : 'en-cours';
  const prochainPalier = PALIERS_SERIE.find((p) => p > serie) ?? null;
  return {
    serie,
    record,
    ecritAujourdhui,
    etat,
    prochainPalier,
    joursAvantPalier: prochainPalier === null ? null : prochainPalier - serie,
    progression: prochainPalier === null ? 1 : plafonner(serie / prochainPalier),
  };
}

export interface Badge {
  /** `palier` : « 7 jours », « 14 jours » ; `record` : « Record 21 ». */
  genre: 'palier' | 'record';
  valeur: number;
  obtenu: boolean;
}

/**
 * Les badges de F20 : « 7 jours », « 14 jours » et « Record n ». Ils se lisent sur la série EN COURS : une série de 12
 * jours a le badge des 7 jours, pas celui des 14 ni le record de 21 (en pointillé), même si le record l'a déjà atteint
 * un jour. Une série interrompue repart de zéro ; le record, lui, reste affiché et intact.
 */
export function badgesDeSerie(s: Pick<Serie, 'record' | 'serie'>): Badge[] {
  const paliers = PALIERS_SERIE.slice(0, 2).map((valeur): Badge => ({ genre: 'palier', valeur, obtenu: s.serie >= valeur }));
  return [...paliers, { genre: 'record', valeur: s.record, obtenu: s.record > 0 && s.serie >= s.record }];
}

/* ------------------------------ Le mois en cases ------------------------------ */

export type EtatCase = 'ecrit' | 'non-ecrit' | 'aujourdhui' | 'futur';

export interface CaseDuJour {
  jour: Jour;
  etat: EtatCase;
  /** Mots du jour. */
  mots: number;
  /** ME01 : mots / 260, plafonné à 1. 0 si rien d'écrit. */
  intensite: number;
  /** F20 : 0 (rien) ou 1 à 5, par cinquièmes de l'intensité (Proposition). */
  palier: 0 | 1 | 2 | 3 | 4 | 5;
}

/** L'intensité d'un rond (ME01) : mots / 260 plafonné à 1. */
export const intensiteDeMots = (mots: number): number => plafonner(mots / MOTS_PAR_JOUR_PLEIN);

/** F20 : 5 paliers de teinte. 0 mot = pas de teinte ; ensuite par cinquièmes de l'intensité. */
export function palierDeMots(mots: number): CaseDuJour['palier'] {
  if (mots <= 0) return 0;
  return Math.min(5, Math.max(1, Math.ceil(intensiteDeMots(mots) * 5))) as CaseDuJour['palier'];
}

/** L'opacité de la teinte d'un palier, de 32 % (palier 1) à 82 % (palier 5), F20 §5. */
export const opaciteDuPalier = (p: CaseDuJour['palier']): number => (p === 0 ? 0 : Math.round(32 + ((p - 1) * 50) / 4));

export interface MoisEnCases {
  /** `AAAA-MM`. */
  mois: string;
  /** Cases vides avant le 1er pour tomber sur le bon jour de la semaine (le 1er oct. 2026, un jeudi : 3). */
  decalage: number;
  cases: CaseDuJour[];
  /** « 25 jours écrits » : jours du mois avec au moins un mot. */
  joursEcrits: number;
}

export function moisEnCases(mots: MotsParJour, jourDuMois: Jour, aujourdhui: Jour): MoisEnCases {
  const premier = debutDeMois(jourDuMois);
  const n = joursDuMois(jourDuMois);
  const cases: CaseDuJour[] = [];
  let joursEcrits = 0;
  for (let i = 0; i < n; i += 1) {
    const jour = ajouterJours(premier, i);
    const m = mots.get(jour) ?? 0;
    const etat: EtatCase = jour > aujourdhui ? 'futur' : m > 0 ? 'ecrit' : jour === aujourdhui ? 'aujourdhui' : 'non-ecrit';
    if (m > 0 && jour <= aujourdhui) joursEcrits += 1;
    cases.push({ jour, etat, mots: m, intensite: intensiteDeMots(m), palier: palierDeMots(m) });
  }
  return { mois: premier.slice(0, 7), decalage: jourSemaineIso(premier) - 1, cases, joursEcrits };
}

export interface DisqueDeSemaine {
  jour: Jour;
  /** 1 = lundi … 7 = dimanche. */
  jourSemaine: number;
  /** `coche` : écrit. `en-cours` : aujourd'hui, pas encore écrit (pointillé). `a-venir` : pointillé. `vide` : passé sans écriture. */
  etat: 'coche' | 'en-cours' | 'a-venir' | 'vide';
}

/** Les 7 disques de la carte « Série d'écriture » de H10 (L M M J V S D). */
export function semaineEnDisques(mots: MotsParJour, aujourdhui: Jour): DisqueDeSemaine[] {
  const lundi = lundiDe(aujourdhui);
  return Array.from({ length: 7 }, (_, i) => {
    const jour = ajouterJours(lundi, i);
    const ecrit = (mots.get(jour) ?? 0) > 0;
    const etat: DisqueDeSemaine['etat'] = ecrit ? 'coche' : jour === aujourdhui ? 'en-cours' : jour > aujourdhui ? 'a-venir' : 'vide';
    return { jour, jourSemaine: i + 1, etat };
  });
}

/** Jours qui séparent deux jours : exposé pour les écrans qui disent « il y a 12 jours ». */
export const joursEntre = ecartJours;

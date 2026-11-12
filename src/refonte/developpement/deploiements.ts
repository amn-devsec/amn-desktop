import {
  ageCourt,
  ajouterJours,
  debutDeSemaineParis,
  formaterDuree,
  jourEtMois,
  ms,
  partiesParis,
  quandRelatif,
  type Instant,
  type Jour,
  type Langue,
} from './commun';
import { dire, direCompte, type CleDeveloppement } from './i18n';

/**
 * LOT-11 · DÉPLOIEMENTS — l'état d'un déploiement et de l'historique (logique pure).
 *
 * Fiche : `docs/refonte/fiches/LOT-11/DEV-deploiements.md`, rubrique 6.
 *
 * Un déploiement passe par CINQ étapes, toujours dans le même ordre : Code reçu,
 * Construction, Tests, Mise en ligne, Vérification. Ce module ne lance rien : il
 * décrit l'état, le fait avancer (`avancer`) et en tire ce que l'écran affiche
 * (pastille, durée, historique, « Revenir », « En ligne maintenant », barres par jour).
 * L'exécution réelle viendra du connecteur Hébergement (LOT-12) et d'amn-api ;
 * l'adaptateur traduira leurs événements en appels à `avancer`.
 *
 * Aucune variable d'environnement, aucune valeur de configuration ni aucune clé
 * n'apparaît dans ces objets : seulement des noms, des états et des dates.
 */

export const ETAPES = ['code', 'construction', 'tests', 'miseEnLigne', 'verification'] as const;
export type Etape = (typeof ETAPES)[number];

export type EtatEtape = 'a-venir' | 'en-cours' | 'reussie' | 'echouee' | 'sautee';
export type EtatDeploiement = 'en-attente' | 'en-cours' | 'reussi' | 'echec' | 'annule';

export const CIBLES = ['apercu', 'preproduction', 'production', 'interne', 'serveur'] as const;
export type Cible = (typeof CIBLES)[number];

/**
 * La distribution interne (cible « Interne », l'installeur de l'édition interne) est FERMÉE :
 * aucune distribution pour l'instant (STATUT.md §1.16), canal privé décidé après SEC-0 (DIST).
 * Tant que cette constante est fausse, un déploiement vers « Interne » prépare la version
 * et s'arrête avant la mise en ligne. La changer est une décision de Harun, par le CO.
 */
export const DISTRIBUTION_INTERNE_OUVERTE = false;

export interface EtatDUneEtape {
  etape: Etape;
  etat: EtatEtape;
  debut?: Instant | null;
  fin?: Instant | null;
}

export interface Deploiement {
  id: string;
  /** Le nom du dépôt, tel que la forge le donne. */
  depot: string;
  branche: string;
  /** Une phrase courte (« textes de l'offre »), facultative. */
  quoi?: string | null;
  /** La version, si le dépôt en porte une (« 1.2.51 »). */
  version?: string | null;
  cible: Cible;
  /** Le prénom de qui l'a lancé (jamais une adresse). */
  par: string;
  lanceA: Instant;
  etapes: readonly EtatDUneEtape[];
  annuleA?: Instant | null;
  /** Ce déploiement remet en ligne la version d'un déploiement antérieur (« Revenir »). */
  retourDe?: string | null;
}

/** Un déploiement neuf : cinq étapes à venir. */
export function nouveauDeploiement(d: Omit<Deploiement, 'etapes' | 'annuleA'>): Deploiement {
  return { ...d, etapes: ETAPES.map((etape) => ({ etape, etat: 'a-venir' as const })), annuleA: null };
}

/* ------------------------------ État ------------------------------ */

export function etatGlobal(d: Deploiement): EtatDeploiement {
  if (d.annuleA) return 'annule';
  if (d.etapes.some((e) => e.etat === 'echouee')) return 'echec';
  if (d.etapes.some((e) => e.etat === 'en-cours')) return 'en-cours';
  if (d.etapes.length === ETAPES.length && d.etapes.every((e) => e.etat === 'reussie' || e.etat === 'sautee') && d.etapes.some((e) => e.etat === 'reussie')) return 'reussi';
  if (d.etapes.some((e) => e.etat === 'reussie')) return 'en-cours';
  return 'en-attente';
}

/** L'étape à montrer : celle en cours, sinon celle qui a échoué, sinon la prochaine à venir. */
export function etapeCourante(d: Deploiement): Etape | null {
  return (
    d.etapes.find((e) => e.etat === 'en-cours')?.etape ??
    d.etapes.find((e) => e.etat === 'echouee')?.etape ??
    d.etapes.find((e) => e.etat === 'a-venir')?.etape ??
    null
  );
}

/**
 * La durée MESURÉE de bout en bout : fin de la dernière étape terminée − début de la première.
 * Jamais la somme des étapes (la maquette montre 113 s d'étapes pour « 1 min 48 »).
 * Un déploiement en cours a une durée qui court jusqu'à `maintenant`.
 */
export function dureeTotale(d: Deploiement, maintenant?: Instant): number | null {
  const debuts = d.etapes.map((e) => e.debut).filter((x): x is Instant => x != null).map(ms);
  if (debuts.length === 0) return null;
  const debut = Math.min(...debuts);
  if (etatGlobal(d) === 'en-cours') return maintenant == null ? null : ms(maintenant) - debut;
  const fins = d.etapes.map((e) => e.fin).filter((x): x is Instant => x != null).map(ms);
  if (fins.length === 0) return null;
  return Math.max(...fins) - debut;
}

export function dureeEtape(e: EtatDUneEtape, maintenant?: Instant): number | null {
  if (e.debut == null) return null;
  if (e.fin != null) return ms(e.fin) - ms(e.debut);
  if (e.etat === 'en-cours' && maintenant != null) return ms(maintenant) - ms(e.debut);
  return null;
}

export const nomEtape = (e: Etape, langue: Langue = 'fr'): string => dire(langue, `etape.${e}` as CleDeveloppement);
export const nomCible = (c: Cible, langue: Langue = 'fr'): string => dire(langue, `cible.${c}` as CleDeveloppement);

export type Ton = 'succes' | 'danger' | 'info' | 'neutre' | 'attention';

/** La pastille : « Réussi en 1 min 48 », « Échec à l'étape Tests », « En cours · Construction ». */
export function pastille(d: Deploiement, langue: Langue = 'fr'): { ton: Ton; texte: string } {
  const etat = etatGlobal(d);
  if (etat === 'reussi') return { ton: 'succes', texte: dire(langue, 'deploiement.reussi', { duree: formaterDuree(dureeTotale(d) ?? Number.NaN) }) };
  if (etat === 'echec') return { ton: 'danger', texte: dire(langue, 'deploiement.echec', { etape: nomEtape(etapeCourante(d) ?? 'code', langue) }) };
  if (etat === 'en-cours') return { ton: 'info', texte: dire(langue, 'deploiement.enCours', { etape: nomEtape(etapeCourante(d) ?? 'code', langue) }) };
  if (etat === 'annule') return { ton: 'neutre', texte: dire(langue, 'deploiement.annule') };
  return { ton: 'neutre', texte: dire(langue, 'deploiement.attente') };
}

/* ------------------------------ Faire avancer ------------------------------ */

export type Evenement =
  | { type: 'debut'; etape: Etape; a: Instant }
  | { type: 'fin'; etape: Etape; a: Instant; reussie: boolean }
  | { type: 'sauter'; etape: Etape }
  | { type: 'annuler'; a: Instant };

/** Une transition refusée, avec sa raison (jamais une exception silencieuse). */
export class TransitionRefusee extends Error {}

/**
 * Applique un événement. Pur : rend un nouveau déploiement.
 * Règles : on ne démarre une étape que si toutes celles d'avant sont réussies ou sautées ;
 * une étape terminée ne bouge plus ; un échec saute toutes les étapes suivantes ;
 * la cible « Interne » s'arrête avant la mise en ligne tant que la distribution est fermée.
 */
export function avancer(d: Deploiement, ev: Evenement, options: { distributionInterneOuverte?: boolean } = {}): Deploiement {
  const fini = (x: EtatEtape) => x === 'reussie' || x === 'sautee' || x === 'echouee';
  const etat = etatGlobal(d);
  if (etat === 'annule' || etat === 'echec' || etat === 'reussi') throw new TransitionRefusee(`déploiement ${d.id} déjà terminé (${etat})`);
  if (ev.type === 'annuler') {
    return {
      ...d,
      annuleA: ev.a,
      etapes: d.etapes.map((e) => (e.etat === 'en-cours' ? { ...e, etat: 'sautee', fin: ev.a } : e.etat === 'a-venir' ? { ...e, etat: 'sautee' } : e)),
    };
  }
  const i = ETAPES.indexOf(ev.etape);
  const courante = d.etapes[i];
  if (!courante) throw new TransitionRefusee(`étape inconnue : ${String(ev.etape)}`);
  if (fini(courante.etat)) throw new TransitionRefusee(`l'étape ${ev.etape} est déjà terminée`);
  const remplacer = (n: number, e: EtatDUneEtape) => d.etapes.map((x, k) => (k === n ? e : x));
  if (ev.type === 'debut') {
    if (courante.etat !== 'a-venir') throw new TransitionRefusee(`l'étape ${ev.etape} a déjà commencé`);
    const avant = d.etapes.slice(0, i);
    if (avant.some((e) => e.etat !== 'reussie' && e.etat !== 'sautee')) throw new TransitionRefusee(`l'étape ${ev.etape} ne peut pas commencer avant les précédentes`);
    const ouverte = options.distributionInterneOuverte ?? DISTRIBUTION_INTERNE_OUVERTE;
    if (d.cible === 'interne' && !ouverte && (ev.etape === 'miseEnLigne' || ev.etape === 'verification')) {
      throw new TransitionRefusee('distribution interne fermée : la version est prête et attend');
    }
    return { ...d, etapes: remplacer(i, { ...courante, etat: 'en-cours', debut: ev.a }) };
  }
  if (ev.type === 'sauter') {
    if (courante.etat !== 'a-venir') throw new TransitionRefusee(`l'étape ${ev.etape} a déjà commencé`);
    return { ...d, etapes: remplacer(i, { ...courante, etat: 'sautee' }) };
  }
  // fin
  if (courante.etat !== 'en-cours') throw new TransitionRefusee(`l'étape ${ev.etape} n'a pas commencé`);
  const terminee: EtatDUneEtape = { ...courante, etat: ev.reussie ? 'reussie' : 'echouee', fin: ev.a };
  const etapes = d.etapes.map((x, k) => (k === i ? terminee : !ev.reussie && k > i && x.etat === 'a-venir' ? { ...x, etat: 'sautee' as const } : x));
  return { ...d, etapes };
}

/** La cible peut-elle aller jusqu'à la mise en ligne ? (« Interne » : non, tant que DIST n'est pas décidé.) */
export function cibleExecutable(c: Cible, options: { distributionInterneOuverte?: boolean } = {}): boolean {
  return c !== 'interne' || (options.distributionInterneOuverte ?? DISTRIBUTION_INTERNE_OUVERTE);
}

/* ------------------------------ Historique et « Revenir » ------------------------------ */

const plusRecentDAbord = (a: Deploiement, b: Deploiement) => ms(b.lanceA) - ms(a.lanceA) || b.id.localeCompare(a.id);

/** Les `n` derniers lancés (déjà lancés : pas les planifiés), du plus récent au plus ancien. */
export function historique(ds: readonly Deploiement[], maintenant: Instant, n = 4): Deploiement[] {
  const m = ms(maintenant);
  return ds.filter((d) => ms(d.lanceA) <= m).sort(plusRecentDAbord).slice(0, n);
}

/**
 * La version à remettre en ligne si l'on clique « Revenir » sur la ligne `d` : le dernier
 * déploiement RÉUSSI, sur le même dépôt et la même cible, lancé AVANT `d`. Pour une ligne en
 * échec, c'est donc ce qui est en ligne. `null` : rien à remettre (bouton désactivé).
 */
export function versionDeRetour(ds: readonly Deploiement[], d: Deploiement): Deploiement | null {
  const t = ms(d.lanceA);
  return (
    ds
      .filter((x) => x.id !== d.id && x.depot === d.depot && x.cible === d.cible && etatGlobal(x) === 'reussi' && ms(x.lanceA) < t)
      .sort(plusRecentDAbord)[0] ?? null
  );
}

/** Le déploiement que crée un « Revenir » (à faire avancer comme un autre). */
export function retourArriere(ds: readonly Deploiement[], d: Deploiement, nouveau: { id: string; par: string; a: Instant }, langue: Langue = 'fr'): Deploiement | null {
  const v = versionDeRetour(ds, d);
  if (!v) return null;
  const libelle = v.version ?? v.quoi ?? v.branche;
  return nouveauDeploiement({
    id: nouveau.id,
    depot: v.depot,
    branche: v.branche,
    quoi: dire(langue, 'deploiement.retourA', { version: libelle }),
    version: v.version ?? null,
    cible: v.cible,
    par: nouveau.par,
    lanceA: nouveau.a,
    retourDe: v.id,
  });
}

/**
 * Les échecs NON REPRIS : un échec cesse de compter dès qu'un déploiement réussi plus récent
 * existe sur le même dépôt et la même cible.
 */
export function echecsNonRepris(ds: readonly Deploiement[], depuis?: Instant): Deploiement[] {
  const borne = depuis == null ? -Infinity : ms(depuis);
  return ds.filter(
    (d) =>
      etatGlobal(d) === 'echec' &&
      ms(d.lanceA) >= borne &&
      !ds.some((x) => x.depot === d.depot && x.cible === d.cible && etatGlobal(x) === 'reussi' && ms(x.lanceA) > ms(d.lanceA)),
  );
}

/** Le sous-titre : « 9 cette semaine · 1 échec » (semaine = depuis lundi 00:00, Paris). */
export function resumeSemaine(ds: readonly Deploiement[], maintenant: Instant, langue: Langue = 'fr'): { total: number; echecs: number; texte: string } {
  const lundi = debutDeSemaineParis(maintenant);
  const m = ms(maintenant);
  const semaine = ds.filter((d) => ms(d.lanceA) >= lundi && ms(d.lanceA) <= m);
  const echecs = echecsNonRepris(semaine).length;
  const morceaux = [direCompte(langue, 'semaine.deploiements', semaine.length)];
  if (echecs > 0) morceaux.push(direCompte(langue, 'semaine.echecs', echecs));
  return { total: semaine.length, echecs, texte: morceaux.join(' · ') };
}

/** « Déploiements par jour » : `n` jours glissants, aujourd'hui compris, du plus ancien au plus récent. */
export function parJour(ds: readonly Deploiement[], maintenant: Instant, n = 14, langue: Langue = 'fr'): { jour: Jour; libelle: string; total: number; echec: boolean }[] {
  const aujourdhui = partiesParis(maintenant).jour;
  const m = ms(maintenant);
  const jours = Array.from({ length: n }, (_, k) => ajouterJours(aujourdhui, k - n + 1));
  const parCle = new Map(jours.map((j) => [j, { total: 0, echec: false }]));
  for (const d of ds) {
    if (ms(d.lanceA) > m) continue;
    const c = parCle.get(partiesParis(d.lanceA).jour);
    if (!c) continue;
    c.total += 1;
    if (etatGlobal(d) === 'echec') c.echec = true;
  }
  return jours.map((j) => ({ jour: j, libelle: jourEtMois(j, langue), ...parCle.get(j)! }));
}

/** « En ligne maintenant » : par dépôt et par cible, la dernière version réussie, la plus récente d'abord. */
export function enLigne(ds: readonly Deploiement[], maintenant: Instant, langue: Langue = 'fr'): { depot: string; cible: Cible; depuis: Instant; age: string; deploiementId: string }[] {
  const m = ms(maintenant);
  const meilleurs = new Map<string, Deploiement>();
  for (const d of ds) {
    if (etatGlobal(d) !== 'reussi' || ms(d.lanceA) > m) continue;
    const cle = `${d.depot}\u0000${d.cible}`;
    const deja = meilleurs.get(cle);
    if (!deja || ms(d.lanceA) > ms(deja.lanceA)) meilleurs.set(cle, d);
  }
  return [...meilleurs.values()]
    .sort(plusRecentDAbord)
    .map((d) => {
      const fin = d.etapes.map((e) => e.fin).filter((x): x is Instant => x != null).map(ms);
      const depuis = fin.length ? Math.max(...fin) : ms(d.lanceA);
      return { depot: d.depot, cible: d.cible, depuis, age: ageCourt(depuis, m, langue), deploiementId: d.id };
    });
}

/** La colonne « QUAND » d'une ligne d'historique : la date relative, puis le prénom de qui l'a lancé. */
export function quandEtQui(d: Deploiement, maintenant: Instant, langue: Langue = 'fr'): { quand: string; qui: string } {
  return { quand: quandRelatif(d.lanceA, maintenant, langue), qui: d.par };
}

/* ------------------------------ Planifiés ------------------------------ */

export interface DeploiementPlanifie {
  id: string;
  depot: string;
  quoi: string;
  cible: Cible;
  a: Instant;
  annule?: boolean;
}

/** Les planifiés à venir, du plus proche au plus lointain, et « n à venir ». */
export function planifies(ps: readonly DeploiementPlanifie[], maintenant: Instant, langue: Langue = 'fr'): { aVenir: DeploiementPlanifie[]; texte: string } {
  const m = ms(maintenant);
  const aVenir = ps.filter((p) => !p.annule && ms(p.a) > m).sort((a, b) => ms(a.a) - ms(b.a) || a.id.localeCompare(b.id));
  return { aVenir, texte: direCompte(langue, 'planifies.aVenir', aVenir.length) };
}

/* ------------------------------ Le Studio ------------------------------ */

/** Une mise en ligne notée dans la livraison du Studio (`PieceStudio.livraison.misesEnLigne`). */
export interface MiseEnLigneStudio {
  version: string;
  at: string;
  par: string;
  quoi?: string;
}

/**
 * Le rail des mises en ligne du Studio devient l'historique « Production » du dépôt relié :
 * une mise en ligne notée là EST un déploiement réussi (pas un second). Les étapes, que le
 * Studio ne connaît pas, sont réussies d'un bloc à l'instant noté.
 */
export function depuisStudio(depot: string, misesEnLigne: readonly MiseEnLigneStudio[]): Deploiement[] {
  return misesEnLigne.map((x) => ({
    id: `studio:${depot}:${x.version}:${x.at}`,
    depot,
    branche: 'main',
    quoi: x.quoi ?? null,
    version: x.version,
    cible: 'production' as const,
    par: x.par,
    lanceA: x.at,
    annuleA: null,
    etapes: ETAPES.map((etape) => ({ etape, etat: 'reussie' as const, debut: x.at, fin: x.at })),
  }));
}

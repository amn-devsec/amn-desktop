import { ecartJours, MS_JOUR, ms, partiesParis, type Instant, type Langue } from './commun';
import { echecsNonRepris, etatGlobal, nomCible, type Cible, type Deploiement } from './deploiements';
import { dire, direCompte } from './i18n';

/**
 * LOT-11 · CE QUE LES ÉCRANS TIRENT DES DONNÉES — logique pure (fiches DEV-projets, DEV-ensemble, rubrique 6).
 *
 * Formes minimales en entrée (sur-ensembles des jeux de SIM) : la logique ne sait rien de React ni de la source.
 */

export interface DepotVu {
  id: string;
  nom: string;
  description: string;
  branche: string;
  langages: readonly { nom: string; part: number }[];
  tests: { etat: 'verts' | 'echec'; echecs: number; depuisLe: string | null };
  commitsParSemaine: readonly number[];
  dernierCommitAt: string | null;
  cible: string;
  version: string | null;
  ticketIds: readonly string[];
  teinte: number;
}

/** « hier », « il y a 3 j », « aujourd'hui » (jours de Paris). */
export function ilYA(at: Instant, maintenant: Instant, langue: Langue = 'fr'): string {
  const n = ecartJours(partiesParis(at).jour, partiesParis(maintenant).jour);
  if (n <= 0) return dire(langue, 'temps.aujourdhui');
  if (n === 1) return dire(langue, 'temps.hier');
  return dire(langue, 'temps.ilYAJours', { n });
}

/** Les commits de la semaine en cours, tous dépôts. */
export const commitsDeLaSemaine = (depots: readonly DepotVu[]): number => depots.reduce((s, d) => s + (d.commitsParSemaine.at(-1) ?? 0), 0);

/** La part des dépôts dont le dernier passage de tests est vert (0 à 100), `null` sans dépôt. */
export function partTestsVerts(depots: readonly DepotVu[]): number | null {
  if (depots.length === 0) return null;
  return Math.round((depots.filter((d) => d.tests.etat === 'verts').length / depots.length) * 100);
}

/**
 * La carte d'activité : une colonne par semaine (31), sept cases par colonne. Le jeu donne des commits PAR SEMAINE,
 * pas par jour : une colonne se remplit donc de bas en haut, d'autant de cases que son niveau (0 à 7), sans
 * inventer de jour. Niveau = part du maximum des 31 semaines.
 */
export function carteDActivite(depots: readonly DepotVu[], semaines = 31): { semaine: number; total: number; cases: number }[] {
  const totaux = Array.from({ length: semaines }, (_, k) =>
    depots.reduce((s, d) => s + (d.commitsParSemaine[d.commitsParSemaine.length - semaines + k] ?? 0), 0),
  );
  const max = Math.max(1, ...totaux);
  return totaux.map((total, semaine) => ({ semaine, total, cases: total === 0 ? 0 : Math.max(1, Math.round((total / max) * 7)) }));
}

/** Les tickets ouverts d'un dépôt, et s'il en a un bloquant. */
export function ticketsDuDepot(d: DepotVu, ouverts: ReadonlySet<string>, bloquants: ReadonlySet<string>): { ouverts: number; bloquants: number } {
  const ids = d.ticketIds.filter((t) => ouverts.has(t));
  return { ouverts: ids.length, bloquants: ids.filter((t) => bloquants.has(t)).length };
}

/** Les deux lignes basses d'une carte de dépôt (fiche DEV-projets §6). */
export function lignesDuDepot(d: DepotVu, maintenant: Instant, tickets: { ouverts: number }, langue: Langue = 'fr'): { branche: string; cible: string } {
  const principale = d.branche === 'main' || d.branche === 'master';
  const semaine = d.commitsParSemaine.at(-1) ?? 0;
  const branche = principale
    ? d.dernierCommitAt
      ? `${d.branche} · ${dire(langue, 'depot.dernierCommit', { quand: ilYA(d.dernierCommitAt, maintenant, langue) })}`
      : `${d.branche} · ${dire(langue, 'depot.aucunCommit')}`
    : `${d.branche} · ${direCompte(langue, 'depot.commits', semaine)}`;
  const version = d.version ? `v${d.version} ` : '';
  return { branche, cible: `${version}${d.cible} · ${direCompte(langue, 'depot.tickets', tickets.ouverts)}` };
}

/** La pastille d'une carte : « Tests verts », « 1 test en échec ». */
export function pastilleDepot(d: DepotVu, langue: Langue = 'fr'): { ton: 'succes' | 'attention'; texte: string } {
  if (d.tests.etat === 'verts') return { ton: 'succes', texte: dire(langue, 'depot.testsVerts') };
  return { ton: 'attention', texte: direCompte(langue, 'depot.testsEchec', Math.max(1, d.tests.echecs)) };
}

/** Tri de la grille : en échec d'abord, puis le dernier commit le plus récent. */
export function trierDepots<T extends DepotVu>(depots: readonly T[]): T[] {
  const t = (d: DepotVu) => (d.dernierCommitAt ? ms(d.dernierCommitAt) : 0);
  return [...depots].sort((a, b) => Number(b.tests.etat === 'echec') - Number(a.tests.etat === 'echec') || t(b) - t(a) || a.nom.localeCompare(b.nom));
}

export type TonARegarder = 'attention' | 'critique';
export interface ARegarder {
  cle: string;
  ton: TonARegarder;
  nom: string;
  texte: string;
  /** Où mène « Ouvrir ». */
  vers: { ecran: 'projets' | 'deploiements' | 'tickets' | 'serveur'; id: string };
}

/**
 * « À regarder aujourd'hui » : tests en échec, tickets bloquants, déploiements échoués non repris, services en
 * attention ; par gravité (rouge d'abord), puis ancienneté. La liste complète : l'écran en montre trois.
 */
export function aRegarder(
  entree: {
    depots: readonly DepotVu[];
    deploiements: readonly Deploiement[];
    services: readonly { id: string; nom: string; etat: string; disponibilite30jPct: number }[];
    ouverts: ReadonlySet<string>;
    bloquants: ReadonlySet<string>;
    maintenant: Instant;
  },
  langue: Langue = 'fr',
): ARegarder[] {
  const sortie: (ARegarder & { depuis: number })[] = [];
  const m = ms(entree.maintenant);
  for (const d of entree.depots) {
    if (d.tests.etat === 'echec') {
      const depuis = d.tests.depuisLe ? ms(d.tests.depuisLe) : m;
      const matin = partiesParis(depuis).jour === partiesParis(m).jour;
      sortie.push({
        cle: `tests:${d.id}`,
        ton: 'attention',
        nom: d.nom,
        texte: direCompte(langue, matin ? 'regarder.testsCeMatin' : 'regarder.tests', Math.max(1, d.tests.echecs)),
        vers: { ecran: 'projets', id: d.id },
        depuis,
      });
    }
    const t = ticketsDuDepot(d, entree.ouverts, entree.bloquants);
    if (t.bloquants > 0) {
      sortie.push({
        cle: `tickets:${d.id}`,
        ton: 'critique',
        nom: d.nom,
        texte: `${direCompte(langue, 'regarder.ouverts', t.ouverts)}, ${direCompte(langue, 'regarder.bloquants', t.bloquants)}`,
        vers: { ecran: 'tickets', id: d.id },
        depuis: m,
      });
    }
  }
  for (const x of echecsNonRepris(entree.deploiements)) {
    if (m - ms(x.lanceA) > 7 * MS_JOUR) continue;
    sortie.push({
      cle: `deploiement:${x.id}`,
      ton: 'critique',
      nom: x.depot,
      texte: dire(langue, 'regarder.deploiement', { cible: nomCible(x.cible as Cible, langue) }),
      vers: { ecran: 'deploiements', id: x.id },
      depuis: ms(x.lanceA),
    });
  }
  for (const s of entree.services) {
    if (s.etat === 'en marche') continue;
    sortie.push({
      cle: `service:${s.id}`,
      ton: s.etat === 'arrêté' ? 'critique' : 'attention',
      nom: s.nom,
      texte: s.etat === 'arrêté' ? dire(langue, 'regarder.serviceArrete') : dire(langue, 'regarder.service'),
      vers: { ecran: 'serveur', id: s.id },
      depuis: m,
    });
  }
  return sortie
    .sort((a, b) => Number(b.ton === 'critique') - Number(a.ton === 'critique') || a.depuis - b.depuis || a.cle.localeCompare(b.cle))
    .map((x) => ({ cle: x.cle, ton: x.ton, nom: x.nom, texte: x.texte, vers: x.vers }));
}

/** Les déploiements de la semaine qui ont réussi, et le total (pied de la chaîne de DEV-ensemble). */
export function reussisDeLaSemaine(ds: readonly Deploiement[], debutSemaine: number, maintenant: Instant): { reussis: number; total: number } {
  const m = ms(maintenant);
  const semaine = ds.filter((d) => ms(d.lanceA) >= debutSemaine && ms(d.lanceA) <= m);
  return { reussis: semaine.filter((d) => etatGlobal(d) === 'reussi').length, total: semaine.length };
}

/**
 * Le temps avant un disque plein (fiche DEV-serveur §6) : pente = croissance moyenne des dernières semaines ;
 * `null` sans croissance mesurée (au moins deux semaines). En semaines.
 */
export function semainesAvantPlein(totalGo: number, utiliseGo: number, croissanceParSemaine: readonly number[]): number | null {
  if (croissanceParSemaine.length < 2) return null;
  const pente = croissanceParSemaine.reduce((s, x) => s + x, 0) / croissanceParSemaine.length;
  if (!(pente > 0)) return null;
  return Math.max(0, (totalGo - utiliseGo) / pente);
}

/** « 2 ans », « 1 an », « 5 mois », « 3 semaines » : à l'année au-delà de 12 mois, au mois en deçà. */
export function texteDuree(semaines: number, langue: Langue = 'fr'): string {
  if (semaines >= 52) return direCompte(langue, 'duree.ans', Math.round(semaines / 52));
  if (semaines >= 8) return direCompte(langue, 'duree.mois', Math.round(semaines / 4.345));
  return direCompte(langue, 'duree.semaines', Math.max(1, Math.round(semaines)));
}

/**
 * La part faite seul (fiche DEV-couts §6) : les opérations du mois des connecteurs en mode local, sur toutes les
 * opérations du mois (local et payant ; un connecteur non branché ne compte pas). `null` sans opération.
 */
export function partFaiteSeul(connecteurs: readonly { mode: string; consommationMois: { utilise: number } }[]): number | null {
  const branches = connecteurs.filter((c) => c.mode === 'local' || c.mode === 'payant');
  const total = branches.reduce((s, c) => s + c.consommationMois.utilise, 0);
  if (total === 0) return null;
  return Math.round((branches.filter((c) => c.mode === 'local').reduce((s, c) => s + c.consommationMois.utilise, 0) / total) * 100);
}

/** Ce qui a été payé ce mois aux connecteurs, en centimes (les commissions sont retenues à l'encaissement, à part). */
export const payeDuMois = (connecteurs: readonly { payeCeMoisCents: number }[]): number => connecteurs.reduce((s, c) => s + c.payeCeMoisCents, 0);

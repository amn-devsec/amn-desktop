import { ajouterJours, ecartPourcent, entre, jourDeParis, lundiDe, somme, type Jour } from './commun';
import { PALIERS_DE_SERIE, type Serie } from './serie';
import { JALON_FACTURES } from './jalons';

/**
 * H04 · LE BILAN DE LA SEMAINE — calculé, jamais saisi (fiche H04, rubrique 6).
 *
 * Écran calculé : la session du lot écrit le calcul, et SIM fournit les valeurs attendues (`attendusBilanSemaine`,
 * `src/refonte/donnees/attendus.ts`) ; `check:journee` compare les deux sur les quatre volumes. Si elles divergent,
 * l'une des deux a tort : c'est l'occasion de relire la fiche.
 *
 * Aucun chiffre individuel au-delà de ce que la personne voit d'elle-même : le bilan est celui d'UNE personne,
 * lue par elle (STATUT §1.10). Aucune comparaison avec un collègue.
 */

export interface TacheDuBilan {
  id: string;
  status: 'todo' | 'doing' | 'done' | string;
  assigneeEmail: string;
  /** Jour d'échéance ou `null`. */
  echeance: Jour | null;
  /** Instant où elle a été faite, ou `null`. */
  faiteAt: string | null;
}

export interface EntreeBilan {
  /** Un jour de la semaine voulue (aujourd'hui par défaut côté appelant). */
  jour: Jour;
  email: string;
  taches: readonly TacheDuBilan[];
  /** Paiements : seuls les `réussi` comptent. `date` est un instant ISO. */
  paiements: readonly { etat: string; date: string; montantCents: number }[];
  /** Jour de début de chaque client. */
  clients: readonly { debutLe: Jour }[];
  /** Pour le jalon des factures : toutes les factures (seuls `issued` et `paid` comptent). */
  factures: readonly { status: string }[];
  /** La série, calculée ailleurs par la règle unique (`serieDeLaJournee`). */
  serie: Pick<Serie, 'serie'>;
}

export interface BilanDeLaSemaine {
  semaine: { lundi: Jour; dimanche: Jour };
  tachesFaites: { faites: number; total: number; ecartSemainePrecedente: number; pourcent: number };
  encaisse: { cents: number; ecartPourcent: number | null; parJourCents: number[] };
  nouveauxClients: { nombre: number; ecartSemainePrecedente: number };
  /** Tâches terminées de lundi à dimanche. */
  parJour: number[];
  /** Index (0 = lundi) du meilleur jour — le plus récent en cas d'égalité — ou `null` si rien n'est fait. */
  meilleurJour: number | null;
  /** « À reporter » : non faites dont l'échéance tombe dans la semaine (définition à confirmer, fiche H04). */
  aReporter: { id: string; echeance: Jour | null }[];
  jalons: { serie: number; prochainPalier: number | null; joursRestants: number | null; progression: number; facturesEnvoyeesOuPayees: number; dixFactures: boolean };
  /** Se déclenche si les tâches prévues la semaine prochaine dépassent la moyenne des 4 semaines précédentes d'au moins 2. */
  semaineProchaine: { prevues: number; moyenne4Semaines: number; suggere: boolean };
}

/** L'écart de prévues à partir duquel Ajmani suggère de préparer la semaine suivante (H04, *Proposition*). */
export const ECART_SEMAINE_CHARGEE = 2;

export function bilanDeLaSemaine(e: EntreeBilan): BilanDeLaSemaine {
  const lundi = lundiDe(e.jour);
  const dimanche = ajouterJours(lundi, 6);
  /** [début, fin] de la semaine décalée de `k` semaines. */
  const sem = (k: number): [Jour, Jour] => [ajouterJours(lundi, 7 * k), ajouterJours(dimanche, 7 * k)];

  const siennes = e.taches.filter((t) => t.assigneeEmail === e.email);
  const faiteLe = (t: TacheDuBilan): Jour | null => (t.faiteAt ? jourDeParis(t.faiteAt) : null);
  const faites = (debut: Jour, fin: Jour) => siennes.filter((t) => t.status === 'done' && entre(faiteLe(t) ?? '', debut, fin));
  const prevues = (debut: Jour, fin: Jour) => siennes.filter((t) => t.echeance !== null && entre(t.echeance, debut, fin));

  const [d0, f0] = sem(0);
  const [d1, f1] = sem(-1);
  const faitesCetteSemaine = faites(d0, f0);
  // Le total : ce qui était prévu cette semaine, plus ce qui a été fait sans être prévu (sans doublon).
  const total = new Set([...prevues(d0, f0).map((t) => t.id), ...faitesCetteSemaine.map((t) => t.id)]).size;

  const encaisseSur = (debut: Jour, fin: Jour): number =>
    somme(e.paiements.filter((p) => p.etat === 'réussi' && entre(jourDeParis(p.date), debut, fin)).map((p) => p.montantCents));
  const encaisse = encaisseSur(d0, f0);
  const nouveaux = (debut: Jour, fin: Jour): number => e.clients.filter((c) => entre(c.debutLe, debut, fin)).length;

  const parJour = Array.from({ length: 7 }, (_, i) => faitesCetteSemaine.filter((t) => faiteLe(t) === ajouterJours(lundi, i)).length);
  const max = Math.max(...parJour);

  const prochain = PALIERS_DE_SERIE.find((p) => p > e.serie.serie) ?? null;
  const envoyees = e.factures.filter((f) => f.status === 'issued' || f.status === 'paid').length;

  const [dp, fp] = sem(1);
  const prevuesProchaine = prevues(dp, fp).filter((t) => t.status !== 'done').length;
  const moyenne = somme([1, 2, 3, 4].map((k) => prevues(...sem(-k)).length)) / 4;

  return {
    semaine: { lundi, dimanche },
    tachesFaites: {
      faites: faitesCetteSemaine.length,
      total,
      ecartSemainePrecedente: faitesCetteSemaine.length - faites(d1, f1).length,
      pourcent: total === 0 ? 0 : Math.round((faitesCetteSemaine.length / total) * 100),
    },
    encaisse: { cents: encaisse, ecartPourcent: ecartPourcent(encaisse, encaisseSur(d1, f1)), parJourCents: Array.from({ length: 7 }, (_, i) => encaisseSur(ajouterJours(lundi, i), ajouterJours(lundi, i))) },
    nouveauxClients: { nombre: nouveaux(d0, f0), ecartSemainePrecedente: nouveaux(d0, f0) - nouveaux(d1, f1) },
    parJour,
    meilleurJour: max === 0 ? null : parJour.lastIndexOf(max),
    aReporter: prevues(d0, f0)
      .filter((t) => t.status !== 'done')
      .sort((a, b) => String(a.echeance).localeCompare(String(b.echeance)) || a.id.localeCompare(b.id))
      .map((t) => ({ id: t.id, echeance: t.echeance })),
    jalons: {
      serie: e.serie.serie,
      prochainPalier: prochain,
      joursRestants: prochain === null ? null : prochain - e.serie.serie,
      progression: prochain === null ? 1 : e.serie.serie / prochain,
      facturesEnvoyeesOuPayees: envoyees,
      dixFactures: envoyees >= JALON_FACTURES,
    },
    semaineProchaine: { prevues: prevuesProchaine, moyenne4Semaines: moyenne, suggere: prevuesProchaine - moyenne >= ECART_SEMAINE_CHARGEE },
  };
}

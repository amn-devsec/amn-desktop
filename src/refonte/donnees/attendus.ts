/**
 * LES VALEURS ATTENDUES DES ÉCRANS CALCULÉS — des attendus de test, pas une
 * seconde implémentation.
 *
 * Quatre écrans ne lisent pas un jeu : ils calculent à partir de plusieurs.
 *
 *   · H09  Prévisions de trésorerie (LOT-04)   → `attendusPrevisions`
 *   · H04  Bilan de la semaine (LOT-01)        → `attendusBilanSemaine`
 *   · G08  Cockpit client / tableau de bord    → `attendusCockpit`
 *   · H25  Tableau de bord d'un client         → `attendusTableauDeBord`
 *
 * Le calcul de l'écran reste à la session du lot (DS pour H09, S2 pour H04,
 * G08 et H25). Elle le compare à ces valeurs ; si les deux divergent, l'une des
 * deux a tort, et c'est l'occasion de lire la fiche une seconde fois.
 *
 * Ces fonctions sont volontairement LITTÉRALES : une boucle sur les jours, une
 * somme, un minimum, comme la rubrique 6 de la fiche l'écrit. Pas
 * d'optimisation, pas de structure partagée avec l'écran. Chaque règle que la
 * fiche dit « à confirmer dans le code » ou « Proposition » est nommée comme
 * telle ici, pour qu'on sache ce qu'on compare.
 *
 * Ce que les jeux ne portent pas (encore) est rendu `null` et nommé dans `manque` :
 * c'est la liste « Manque aux données » du lot, à relire avec lui.
 */

import { ajouterJours, debutDeMois, jourDe, jourSemaine, lundiDe, type Jour } from './outils';
import { moi } from './equipe';
import type { Monde } from './types';

const jourDeIso = (iso: string): Jour => jourDe(Date.parse(iso));
const somme = (xs: readonly number[]): number => xs.reduce((s, x) => s + x, 0);
const entre = (j: Jour, debut: Jour, fin: Jour): boolean => j >= debut && j <= fin;
/** Écart en pourcent arrondi à l'entier, ou null quand la base est nulle. */
const ecartPourcent = (actuel: number, avant: number): number | null => (avant > 0 ? Math.round(((actuel - avant) / avant) * 100) : null);

/* ================== La série : la clôture des priorités du jour (L01, N01, H04, H25) ================== */

/**
 * La série d'une personne, d'après la règle retenue (STATUT §1.36 n° 1, fiche L01) : une journée est « bouclée » quand
 * chacune de ses priorités est faite avant la fin de ce jour-là. En remontant d'aujourd'hui :
 *   · une journée bouclée compte un ;
 *   · le week-end, une journée sans priorité choisie et la journée d'aujourd'hui (pas finie) ne comptent pas et ne cassent rien ;
 *   · une journée jouée et non bouclée casse la série.
 * C'est une relecture littérale de la règle, pas `serieDeLaJournee` : `check:journee` et `check:donnees` comparent les deux.
 */
export function serieDesPriorites(m: Monde, email: string, jour: Jour): number {
  const parJour = new Map(m.dailyPriorities.filter((p) => p.email === email && p.day <= jour).map((p) => [p.day, p]));
  const bouclee = (j: Jour): boolean => {
    const p = parJour.get(j);
    return p !== undefined && p.items.length > 0 && p.items.every((i) => i.doneAt !== null && jourDeIso(i.doneAt) <= p.day);
  };
  const premier = [...parJour.keys()].sort().find((j) => bouclee(j));
  if (premier === undefined) return 0;
  let serie = 0;
  for (let j = jour; j >= premier; j = ajouterJours(j, -1)) {
    if (bouclee(j)) { serie += 1; continue; }
    if (jourSemaine(j) >= 6) continue; // samedi et dimanche : repos
    const p = parJour.get(j);
    if (p === undefined || p.items.length === 0) continue; // pas jouée
    if (j === jour) continue; // aujourd'hui n'est pas fini
    break;
  }
  return serie;
}

/** La Boîte à zéro : jours consécutifs, en remontant d'aujourd'hui, où zéro message à traiter a été atteint. */
function serieBoiteAZero(m: Monde, jour: Jour): { jours: number; enCours: boolean } | null {
  const lignes = m.boiteAZero.filter((b) => b.jour <= jour).sort((a, b) => b.jour.localeCompare(a.jour));
  if (lignes.length === 0) return null;
  let jours = 0;
  for (const l of lignes) { if (!l.zeroAtteint) break; jours += 1; }
  return { jours, enCours: lignes[0].zeroAtteint };
}

/* ================================ H09 : prévisions ================================ */

export interface OptionsPrevisions {
  /** 30, 90 ou 365 jours (la fiche : « 30 j | 90 j | 12 mois »). Défaut : 90. */
  horizonJours?: 30 | 90 | 365;
  /** Retard appliqué au scénario « Paiements en retard » et à la bannière. Défaut : 15 jours (fiche H09, rubrique 6). */
  retardJours?: number;
  /** Scénario « Nouvelle embauche » : montant saisi par l'utilisateur, jamais calculé. Défaut : 3 200 €/mois. */
  embaucheMensuelleCents?: number;
  /** Premier prélèvement de l'embauche. Défaut : le 1er du mois, trois mois après le mois courant (« dès janvier » au 30 oct.). */
  embauchePremierLe?: Jour;
}

export interface AttendusPrevisions {
  horizonJours: number;
  soldeAujourdhuiCents: number;
  /** Solde à la fin de l'horizon, scénario central. */
  soldeFinCents: number;
  /** Une valeur par jour de 0 (aujourd'hui) à l'horizon : la « prévision centrale ». */
  serieCentrale: { jour: Jour; soldeCents: number }[];
  /** Minimum de la prévision centrale, avec son jour (le premier en cas d'égalité). */
  pointLePlusBas: { jour: Jour; soldeCents: number };
  /** Le marqueur « Creux » n'est tracé que si le minimum est au moins 10 % sous le solde actuel. */
  creuxTrace: boolean;
  entreesAttendues: { totalCents: number; nombre: number };
  /** Les six prochains mouvements datés du scénario central (même source que MA07 « À venir »). */
  prochainsMouvements: { jour: Jour; libelle: string; montantCents: number }[];
  scenarios: { central: number; paiementsEnRetard: number; nouvelleEmbauche: number };
  /**
   * La bande autour de la prévision, au jour du creux et à la fin de l'horizon : bas = entrées retardées de
   * `retardJours`, haut = entrées payées à l'échéance. Méthode à confirmer dans le code (fiche H09, rubrique 6).
   */
  fourchette: { auCreux: { basCents: number; hautCents: number }; aLaFin: { basCents: number; hautCents: number } };
  /** La bannière : le client de la plus grosse entrée attendue avant le creux, et le solde au creux s'il paie en retard. */
  banniere: { clientNom: string; soldeAuCreuxSiRetardCents: number } | null;
  /** Jusqu'où les mouvements prévus des jeux couvrent l'horizon (au-delà, la prévision est incomplète). */
  couvertJusquau: Jour | null;
}

/**
 * Prévision centrale = solde actuel + somme jour après jour des mouvements PRÉVUS des jeux
 * (encaissements attendus des factures dues, charges fixes). La fiche cite en plus les
 * abonnements, la TVA et les hypothèses : ici, c'est la liste `mouvements` qui les porte (MA07).
 */
export function attendusPrevisions(m: Monde, options: OptionsPrevisions = {}): AttendusPrevisions {
  const horizon = options.horizonJours ?? 90;
  const retard = options.retardJours ?? 15;
  const aujourdhui = m.contexte.aujourdhui;
  const fin = ajouterJours(aujourdhui, horizon);
  const solde0 = somme(m.comptes.map((c) => c.soldeCents));
  const prevus = m.mouvements.filter((x) => !x.reel && x.date > aujourdhui);
  const entrees = prevus.filter((x) => x.nature === 'Encaissement attendu');

  type Flux = { jour: Jour; montantCents: number };
  const serie = (flux: readonly Flux[]): { jour: Jour; soldeCents: number }[] => {
    const sortie: { jour: Jour; soldeCents: number }[] = [];
    for (let j = 0; j <= horizon; j += 1) {
      const jour = ajouterJours(aujourdhui, j);
      sortie.push({ jour, soldeCents: solde0 + somme(flux.filter((f) => f.jour <= jour).map((f) => f.montantCents)) });
    }
    return sortie;
  };
  const central: Flux[] = prevus.map((x) => ({ jour: x.date, montantCents: x.montantCents }));
  const decale = (x: { date: Jour }, jours: number): Jour => ajouterJours(x.date, jours);
  const sansEntrees = prevus.filter((x) => x.nature !== 'Encaissement attendu').map((x) => ({ jour: x.date, montantCents: x.montantCents }));

  const serieCentrale = serie(central);
  const bas = serieCentrale.reduce((a, b) => (b.soldeCents < a.soldeCents ? b : a), serieCentrale[0]);

  // Scénario « Paiements en retard » : toutes les entrées décalées ; celles qui sortent de l'horizon disparaissent.
  const enRetard = [...sansEntrees, ...entrees.map((x) => ({ jour: decale(x, retard), montantCents: x.montantCents }))];
  // Scénario « Nouvelle embauche » : le coût saisi est retranché à chaque échéance mensuelle dans l'horizon.
  const cout = options.embaucheMensuelleCents ?? 320_000;
  const premier = options.embauchePremierLe ?? `${ajouterJours(debutDeMois(aujourdhui), 92).slice(0, 7)}-01`;
  const embauche: Flux[] = [];
  for (let k = 0; k < 14; k += 1) {
    const [a, mo] = premier.split('-').map(Number);
    const d = new Date(Date.UTC(a, mo - 1 + k, 1, 12)).toISOString().slice(0, 10);
    if (d > aujourdhui && d <= fin) embauche.push({ jour: d, montantCents: -cout });
  }
  const finDe = (flux: readonly Flux[]): number => serie(flux)[horizon].soldeCents;
  const auJour = (flux: readonly Flux[], jour: Jour): number => (serie(flux).find((p) => p.jour === jour) ?? { soldeCents: solde0 }).soldeCents;

  // Fourchette : borne haute = entrées payées à l'échéance (au plus tôt demain) ; borne basse = entrées retardées.
  const echeanceDe = (x: { lien: { id: string | null } }): Jour | null => m.factures.find((f) => f.id === x.lien.id)?.dueAt ?? null;
  const haut = [...sansEntrees, ...entrees.map((x) => ({ jour: [echeanceDe(x) ?? x.date, ajouterJours(aujourdhui, 1)].sort().at(-1) as Jour, montantCents: x.montantCents }))];

  // Bannière : la plus grosse entrée attendue avant le creux, payée en retard.
  const avantCreux = entrees.filter((x) => x.date <= bas.jour).sort((a, b) => b.montantCents - a.montantCents || a.date.localeCompare(b.date));
  const gros = avantCreux[0];
  const banniere = gros
    ? {
        clientNom: gros.libelle.replace('Encaissement attendu ', ''),
        soldeAuCreuxSiRetardCents: serie(central.map((f) => (f.jour === gros.date && f.montantCents === gros.montantCents ? { ...f, jour: ajouterJours(f.jour, retard) } : f)))
          .find((p) => p.jour === bas.jour)?.soldeCents ?? bas.soldeCents,
      }
    : null;

  const dernier = prevus.map((x) => x.date).sort().at(-1) ?? null;
  return {
    horizonJours: horizon,
    soldeAujourdhuiCents: solde0,
    soldeFinCents: serieCentrale[horizon].soldeCents,
    serieCentrale,
    pointLePlusBas: { jour: bas.jour, soldeCents: bas.soldeCents },
    creuxTrace: bas.soldeCents <= solde0 * 0.9,
    entreesAttendues: {
      totalCents: somme(entrees.filter((x) => x.date <= fin).map((x) => x.montantCents)),
      nombre: entrees.filter((x) => x.date <= fin).length,
    },
    prochainsMouvements: [...prevus].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id)).slice(0, 6).map((x) => ({ jour: x.date, libelle: x.libelle, montantCents: x.montantCents })),
    scenarios: { central: serieCentrale[horizon].soldeCents, paiementsEnRetard: finDe(enRetard), nouvelleEmbauche: finDe([...central, ...embauche]) },
    fourchette: {
      auCreux: { basCents: auJour(enRetard, bas.jour), hautCents: auJour(haut, bas.jour) },
      aLaFin: { basCents: finDe(enRetard), hautCents: finDe(haut) },
    },
    banniere,
    couvertJusquau: dernier,
  };
}

/* ============================ H04 : bilan de la semaine ============================ */

export interface AttendusBilanSemaine {
  semaine: { lundi: Jour; dimanche: Jour };
  tachesFaites: { faites: number; total: number; ecartSemainePrecedente: number; pourcent: number };
  encaisse: { cents: number; ecartPourcent: number | null; parJourCents: number[] };
  nouveauxClients: { nombre: number; ecartSemainePrecedente: number };
  /** Tâches terminées de lundi à dimanche, et le meilleur jour (le plus récent en cas d'égalité ; null si rien de fait). */
  parJour: number[];
  meilleurJour: number | null;
  /** « À reporter » : tâches non faites dont l'échéance tombe dans la semaine (définition à confirmer dans le code). */
  aReporter: { id: string; echeance: Jour | null }[];
  jalons: { serie: number; prochainPalier: number | null; joursRestants: number | null; progression: number; facturesEnvoyeesOuPayees: number; dixFactures: boolean };
  /** Suggestion « semaine prochaine » : se déclenche si les tâches prévues dépassent la moyenne des 4 semaines précédentes d'au moins 2. */
  semaineProchaine: { prevues: number; moyenne4Semaines: number; suggere: boolean };
  /** « Boîte à zéro » : les jours consécutifs où zéro a été atteint (null sans historique). */
  boiteAZero: { jours: number; enCours: boolean } | null;
  manque: string[];
}

/** Paliers de série (fiche H04, *Proposition*). */
export const PALIERS_DE_SERIE = [5, 10, 20, 30, 50, 100] as const;

/** Le bilan d'une personne (« moi » par défaut) pour la semaine qui contient `jour` (aujourd'hui par défaut). */
export function attendusBilanSemaine(m: Monde, options: { jour?: Jour; email?: string } = {}): AttendusBilanSemaine {
  const jour = options.jour ?? m.contexte.aujourdhui;
  const email = options.email ?? moi(m.equipe).email;
  const lundi = lundiDe(jour);
  const dimanche = ajouterJours(lundi, 6);
  const semaine = (decalage: number): [Jour, Jour] => [ajouterJours(lundi, 7 * decalage), ajouterJours(dimanche, 7 * decalage)];
  const siennes = m.taches.filter((t) => t.assigneeEmail === email);
  const faiteLe = (t: { faiteAt: string | null }): Jour | null => (t.faiteAt ? jourDeIso(t.faiteAt) : null);
  const faites = (d: Jour, f: Jour) => siennes.filter((t) => t.status === 'done' && entre(faiteLe(t) ?? '', d, f));
  const prevues = (d: Jour, f: Jour) => siennes.filter((t) => t.echeance !== null && entre(t.echeance, d, f));

  const [d0, f0] = semaine(0);
  const [d1, f1] = semaine(-1);
  const faitesCetteSemaine = faites(d0, f0);
  const total = new Set([...prevues(d0, f0).map((t) => t.id), ...faitesCetteSemaine.map((t) => t.id)]).size;

  const encaisseSur = (d: Jour, f: Jour): number => somme(m.paiements.filter((p) => p.etat === 'réussi' && entre(jourDeIso(p.date), d, f)).map((p) => p.montantCents));
  const parJourCents = Array.from({ length: 7 }, (_, i) => encaisseSur(ajouterJours(lundi, i), ajouterJours(lundi, i)));
  const nouveaux = (d: Jour, f: Jour): number => m.clients.filter((c) => entre(c.debutLe, d, f)).length;

  const parJour = Array.from({ length: 7 }, (_, i) => faitesCetteSemaine.filter((t) => faiteLe(t) === ajouterJours(lundi, i)).length);
  const max = Math.max(...parJour);
  const meilleurJour = max === 0 ? null : parJour.lastIndexOf(max);

  const serie = serieDesPriorites(m, email, jour);
  const prochainPalier = PALIERS_DE_SERIE.find((p) => p > serie) ?? null;
  const envoyees = m.factures.filter((f) => f.status === 'issued' || f.status === 'paid').length;

  const [dp, fp] = semaine(1);
  const prevuesProchaine = prevues(dp, fp).filter((t) => t.status !== 'done').length;
  const quatre = [1, 2, 3, 4].map((k) => { const [a, b] = semaine(-k); return prevues(a, b).length; });
  const moyenne = somme(quatre) / 4;

  return {
    semaine: { lundi, dimanche },
    tachesFaites: { faites: faitesCetteSemaine.length, total, ecartSemainePrecedente: faitesCetteSemaine.length - faites(d1, f1).length, pourcent: total === 0 ? 0 : Math.round((faitesCetteSemaine.length / total) * 100) },
    encaisse: { cents: encaisseSur(d0, f0), ecartPourcent: ecartPourcent(encaisseSur(d0, f0), encaisseSur(d1, f1)), parJourCents },
    nouveauxClients: { nombre: nouveaux(d0, f0), ecartSemainePrecedente: nouveaux(d0, f0) - nouveaux(d1, f1) },
    parJour,
    meilleurJour,
    aReporter: prevues(d0, f0).filter((t) => t.status !== 'done').sort((a, b) => String(a.echeance).localeCompare(String(b.echeance)) || a.id.localeCompare(b.id)).map((t) => ({ id: t.id, echeance: t.echeance })),
    jalons: { serie, prochainPalier, joursRestants: prochainPalier === null ? null : prochainPalier - serie, progression: prochainPalier === null ? 1 : serie / prochainPalier, facturesEnvoyeesOuPayees: envoyees, dixFactures: envoyees >= 10 },
    semaineProchaine: { prevues: prevuesProchaine, moyenne4Semaines: moyenne, suggere: prevuesProchaine - moyenne >= 2 },
    boiteAZero: serieBoiteAZero(m, jour),
    manque: [],
  };
}

/* ============================ G08 : cockpit (tableau de bord) ============================ */

export interface AttendusCockpit {
  /** Revenu récurrent mensuel : somme des abonnements actifs ; l'écart compare au même jour du mois précédent. */
  mrr: { cents: number; ecartPourcent: number | null };
  encaisseDuMoisCents: number;
  clientsActifs: number;
  nouveauxClientsActifs: number;
  impayes: number;
  /** Tickets partagés avec le dev, par colonne (compteur réel, urgents d'abord ; 3 visibles au plus). */
  tickets: Record<'a-faire' | 'en-cours' | 'en-revue' | 'termine', { compteur: number; visibles: string[] }>;
  sources: { nom: string; etat: string }[];
  /**
   * L'objectif du mois (réglage `objectifMrrCents`) et l'avancement du revenu récurrent : `partPourcent` = revenu ÷ objectif (entier,
   * l'anneau) ; `resteCents` = « plus que… » (jamais négatif) ; `ecartDeRythmeJours` = (revenu ÷ objectif × jours du mois) − jour du mois,
   * arrondi : positif « en avance de n jours », négatif « en retard de n jours » ; `atteint` : « Objectif atteint ».
   */
  objectifDuMois: { objectifCents: number; mrrCents: number; resteCents: number; partPourcent: number; ecartDeRythmeJours: number; atteint: boolean } | null;
  /** Les utilisateurs connectés (API du client) : aujourd'hui, et les sept derniers jours, aujourd'hui en dernier ; null sans série. */
  utilisateursConnectes: { aujourdhui: number; parJour: { jour: Jour; connectes: number }[] } | null;
  manque: string[];
}

const actifAu = (a: { depuis: Jour; etat: string; resilieLe: Jour | null }, jour: Jour): boolean =>
  a.depuis <= jour && (a.etat === 'Actif' || (a.resilieLe !== null && a.resilieLe > jour));

function objectifDuMois(m: Monde, mrrCents: number): AttendusCockpit['objectifDuMois'] {
  const objectifCents = m.entreprise.reglages.objectifMrrCents;
  if (!(objectifCents > 0)) return null;
  const [a, mois, jourDuMois] = m.contexte.aujourdhui.split('-').map(Number);
  const joursDuMois = new Date(Date.UTC(a, mois, 0)).getUTCDate();
  return {
    objectifCents,
    mrrCents,
    resteCents: Math.max(0, objectifCents - mrrCents),
    partPourcent: Math.round((mrrCents / objectifCents) * 100),
    ecartDeRythmeJours: Math.round((mrrCents / objectifCents) * joursDuMois - jourDuMois),
    atteint: mrrCents >= objectifCents,
  };
}

function connectesDeLaSemaine(m: Monde): AttendusCockpit['utilisateursConnectes'] {
  const jours = m.utilisateursConnectes.filter((c) => c.jour <= m.contexte.aujourdhui).sort((x, y) => x.jour.localeCompare(y.jour)).slice(-7);
  if (jours.length === 0) return null;
  return { aujourdhui: jours[jours.length - 1].connectes, parJour: jours.map((c) => ({ jour: c.jour, connectes: c.connectes })) };
}

export function attendusCockpit(m: Monde): AttendusCockpit {
  const auj = m.contexte.aujourdhui;
  const mrrAu = (j: Jour): number => somme(m.abonnements.filter((a) => actifAu(a, j)).map((a) => a.montantMensuelCents));
  const avant = ajouterJours(auj, -30);
  const mois = auj.slice(0, 7);
  const actifs = new Set(m.abonnements.filter((a) => actifAu(a, auj)).map((a) => a.clientId));
  const colonnes = ['a-faire', 'en-cours', 'en-revue', 'termine'] as const;
  const partages = m.tickets.filter((t) => t.partageClient);
  const tickets = Object.fromEntries(colonnes.map((c) => {
    const liste = partages.filter((t) => t.colonne === c).sort((a, b) => Number(b.urgent) - Number(a.urgent) || a.ordre - b.ordre || a.id.localeCompare(b.id));
    return [c, { compteur: liste.length, visibles: liste.slice(0, 3).map((t) => t.id) }];
  })) as AttendusCockpit['tickets'];
  return {
    mrr: { cents: mrrAu(auj), ecartPourcent: ecartPourcent(mrrAu(auj), mrrAu(avant)) },
    encaisseDuMoisCents: somme(m.paiements.filter((p) => p.etat === 'réussi' && jourDeIso(p.date).startsWith(mois)).map((p) => p.montantCents)),
    clientsActifs: actifs.size,
    nouveauxClientsActifs: m.clients.filter((c) => c.debutLe.startsWith(mois) && actifs.has(c.id)).length,
    impayes: m.factures.filter((f) => f.status === 'issued' && f.dueAt < auj).length,
    tickets,
    sources: m.connecteurs.map((c) => ({ nom: c.nom, etat: c.etat })),
    objectifDuMois: objectifDuMois(m, mrrAu(auj)),
    utilisateursConnectes: connectesDeLaSemaine(m),
    manque: [],
  };
}

/* ============================ H25 : tableau de bord d'un client ============================ */

export interface AttendusTableauDeBord {
  /** Chiffre d'affaires du mois en cours (paiements réussis) et son écart avec le mois précédent à la même date. */
  chiffreAffaires: { cents: number; ecartPourcent: number | null };
  /** Tickets ouverts, urgents d'abord ; 3 lignes visibles puis « + n autres ». */
  tickets: { visibles: string[]; autres: number };
  /** Clients avec facture impayée, du plus gros montant au plus petit (*Proposition*) ; 3 lignes puis « + n autres ». */
  facturesImpayees: { visibles: { clientNom: string; soldeCents: number }[]; autres: number; totalCents: number };
  /** « Mes tâches » : même règle que N01 — n faites sur N tâches du jour, et la série en jours. */
  mesTaches: { faites: number; total: number; serie: number };
  prochainRendezVous: { id: string; debut: string } | null;
  activiteRecente: { libelle: string; jour: Jour }[];
  manque: string[];
}

export function attendusTableauDeBord(m: Monde, options: { email?: string } = {}): AttendusTableauDeBord {
  const auj = m.contexte.aujourdhui;
  const email = options.email ?? moi(m.equipe).email;
  const mois = auj.slice(0, 7);
  const jourDuMois = Number(auj.slice(8));
  const moisPrecedent = ajouterJours(debutDeMois(auj), -1).slice(0, 7);
  const encaisseA = (prefixe: string, jusquAuJour: number): number =>
    somme(m.paiements.filter((p) => p.etat === 'réussi' && jourDeIso(p.date).startsWith(prefixe) && Number(jourDeIso(p.date).slice(8)) <= jusquAuJour).map((p) => p.montantCents));

  const ouverts = m.tickets.filter((t) => t.colonne !== 'termine').sort((a, b) => Number(b.urgent) - Number(a.urgent) || a.ordre - b.ordre || a.id.localeCompare(b.id));
  const parClient = new Map<string, number>();
  for (const f of m.factures) if (f.status === 'issued' && f.soldeCents > 0) parClient.set(f.clientNom, (parClient.get(f.clientNom) ?? 0) + f.soldeCents);
  const impayes = [...parClient.entries()].map(([clientNom, soldeCents]) => ({ clientNom, soldeCents })).sort((a, b) => b.soldeCents - a.soldeCents || a.clientNom.localeCompare(b.clientNom));
  const duJour = m.taches.filter((t) => t.assigneeEmail === email && (t.echeance === auj || (t.status === 'done' && t.faiteAt !== null && jourDeIso(t.faiteAt) === auj)));
  const suivant = [...m.evenements]
    .filter((e) => Date.parse(e.startAt) > m.contexte.maintenant && !e.systeme)
    .sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt) || a.id.localeCompare(b.id))[0];

  const activite: { libelle: string; jour: Jour; at: number }[] = [
    ...m.factures.filter((f) => f.status === 'paid' && f.paidAt).map((f) => ({ libelle: `Facture ${f.number} encaissée`, jour: f.paidAt as Jour, at: Date.parse(`${f.paidAt}T12:00:00Z`) })),
    ...m.devis.filter((d) => d.status === 'sent' && d.sentAt).map((d) => ({ libelle: 'Nouveau devis envoyé', jour: jourDeIso(d.sentAt as string), at: Date.parse(d.sentAt as string) })),
    ...m.tickets.filter((t) => t.termineLe).map((t) => ({ libelle: 'Ticket résolu', jour: t.termineLe as Jour, at: Date.parse(`${t.termineLe}T12:00:00Z`) })),
  ]
    .filter((x) => x.jour <= auj)
    .sort((a, b) => b.at - a.at || a.libelle.localeCompare(b.libelle))
    .slice(0, 5);

  return {
    chiffreAffaires: { cents: encaisseA(mois, jourDuMois), ecartPourcent: ecartPourcent(encaisseA(mois, jourDuMois), encaisseA(moisPrecedent, jourDuMois)) },
    tickets: { visibles: ouverts.slice(0, 3).map((t) => t.id), autres: Math.max(0, ouverts.length - 3) },
    facturesImpayees: { visibles: impayes.slice(0, 3), autres: Math.max(0, impayes.length - 3), totalCents: somme(impayes.map((x) => x.soldeCents)) },
    mesTaches: { faites: duJour.filter((t) => t.status === 'done').length, total: duJour.length, serie: serieDesPriorites(m, email, auj) },
    prochainRendezVous: suivant ? { id: suivant.id, debut: suivant.startAt } : null,
    activiteRecente: activite.map(({ libelle, jour }) => ({ libelle, jour })),
    manque: [
      'Utilisateurs actifs (H25) : série fournie par une API du client (Vercel), absente des jeux',
      'Disposition des widgets (H25) : format de la grille à confirmer dans le code',
    ],
  };
}

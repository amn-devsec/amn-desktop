/**
 * LES JEUX DU LOT-11 « DÉVELOPPEMENT » — dépôts, déploiements, journal d'exécutions, tâches planifiées, charge du
 * serveur, services, coûts des connecteurs.
 *
 * Commandés par le CO d'après `docs/refonte/preparation/LOT-11-developpement.md` §8. Les formes sont celles de S8
 * (`src/refonte/developpement/`) et de S9 (`src/refonte/connecteurs/`), en sur-ensembles : leur logique lit ces jeux sans
 * adaptateur (`compat.ts`).
 *
 * Sûreté : aucun nom d'hôte, aucune adresse, aucun port, aucune variable d'environnement, aucune clé. Les dépôts, les
 * versions et les prénoms sont inventés ; les messages d'exécution sont des phrases courtes sans valeur secrète.
 */

import { cle, fabriquer, hasardDe, salaries } from './commun';
import { ajouterJours, compter, debutDeMois, estOuvre, instantParis, iso, jourDe, jourSemaine, lundiDe } from './outils';
import type { Contexte, Membre, Ticket } from './types';
import type {
  Automatisation, Connecteur, Depot, Deploiement, DeploiementPlanifie, Execution, MesureServeur, PaiementConnecteurs, PlanificationDeTache,
  CopieSauvegarde, ResumeServeur, ServiceServeur, TachePlanifiee,
} from './types-suite';

const MIN = 60_000;
const JOUR = 86_400_000;

/* ----------------------------------- Dépôts ----------------------------------- */

const DEPOTS: readonly (readonly [string, string, string, readonly (readonly [string, number])[], string, string | null])[] = [
  ['vallon-poste', 'Poste de travail de l’équipe', 'refonte-socle', [['TypeScript', 78], ['CSS', 16], ['HTML', 6]], 'Édition interne', '1.2'],
  ['vallon-serveur', 'Serveur de l’application', 'main', [['TypeScript', 82], ['Python', 18]], 'Serveur maison', '3.4'],
  ['vallon-vitrine', 'Site vitrine de l’entreprise', 'main', [['HTML', 52], ['CSS', 30], ['TypeScript', 18]], 'Hébergement web', null],
  ['optique-lumiere', 'Refonte du site d’un client', 'refonte-v2', [['TypeScript', 61], ['CSS', 27], ['HTML', 12]], 'Aperçu en ligne', null],
  ['location-horizon', 'Site de location de véhicules', 'main', [['HTML', 48], ['CSS', 31], ['TypeScript', 21]], 'Hébergement web', null],
  ['portfolio-camille', 'Site personnel', 'main', [['HTML', 64], ['CSS', 36]], 'Hébergement web', null],
];

export function genererDepots(ctx: Contexte, tickets: readonly Ticket[]): Depot[] {
  const h = hasardDe(ctx.graine, 'depots');
  const n = compter(ctx.volumes.depots, [0, 2, 6, 24]);
  const lundi = lundiDe(ctx.aujourdhui);
  return fabriquer(n, (i) => {
    const [base, description, branche, langages, cible, version] = DEPOTS[(i - 1) % DEPOTS.length];
    const suffixe = i > DEPOTS.length ? `-${Math.ceil(i / DEPOTS.length)}` : '';
    // Un dépôt sur six a un test en échec depuis ce matin (« 1 test en échec à regarder »), dès qu'il y en a deux.
    const enEchec = (n >= 2 && i % 6 === 4) || (n === 2 && i === 2);
    const actif = h.chance(0.85) || i === 1;
    const parSemaine = fabriquer(31, (k) => (actif ? Math.max(0, Math.round(h.entier(0, 14) * (0.4 + (k / 31) * 0.8) - h.entier(0, 3))) : h.entier(0, 2)));
    // La semaine en cours : les commits d'aujourd'hui et des jours d'avant, jamais dans le futur.
    const joursEcoules = Math.max(1, jourSemaine(ctx.aujourdhui));
    parSemaine[30] = actif ? Math.min(parSemaine[30] + 1, 3 * joursEcoules) : 0;
    const dernier = parSemaine[30] > 0
      ? iso(Math.min(ctx.maintenant - 20 * MIN, instantParis(ajouterJours(lundi, h.entier(0, joursEcoules - 1)), `${String(h.entier(9, 18)).padStart(2, '0')}:${String(h.entier(0, 59)).padStart(2, '0')}`)))
      : parSemaine.some((x) => x > 0) ? iso(ctx.maintenant - h.entier(8, 40) * JOUR - h.entier(0, 8) * 3_600_000) : null;
    const mes = tickets.filter((t) => t.colonne !== 'termine').slice((i - 1) % 3, (i - 1) % 3 + 1 + (i % 3));
    return {
      id: cle('dp', i, 3),
      nom: `${base}${suffixe}`,
      description,
      branche,
      langages: langages.map(([nom, part]) => ({ nom, part })),
      tests: enEchec
        ? { etat: 'echec', echecs: 1 + (i % 2), depuisLe: iso(Math.min(ctx.maintenant - 30 * MIN, instantParis(ctx.aujourdhui, '07:30'))) }
        : { etat: 'verts', echecs: 0, depuisLe: null },
      commitsParSemaine: parSemaine,
      dernierCommitAt: dernier,
      cible,
      version: version ? `${version}.${40 + i}` : null,
      pieceStudioId: base.startsWith('optique') || base.startsWith('location') ? `ps-${String(i).padStart(3, '0')}` : null,
      ticketIds: mes.map((t) => t.id),
      teinte: i % 8,
    };
  });
}

/* ------------------------------- Déploiements ------------------------------- */

type Etapes = Deploiement['etapes'];
const NOMS_ETAPES = ['code', 'construction', 'tests', 'miseEnLigne', 'verification'] as const;
/** Durées typiques (secondes) de chaque étape d'un déploiement réussi. */
const DUREES = [6, 38, 29, 21, 9] as const;
const QUOI = ['textes de l’offre', 'correctif des sessions', 'nouvelle page tarifs', 'mise à jour des dépendances', 'ajustements du menu', 'optimisation des images', 'corrections de contraste'] as const;

function etapesDe(lanceMs: number, etat: 'reussi' | 'echec' | 'en-cours' | 'annule', maintenant: number, h: ReturnType<typeof hasardDe>): Etapes {
  const aleaDuree = (k: number): number => Math.max(3, DUREES[k] + h.entier(-4, 6)) * 1000;
  let t = lanceMs;
  const echecA = 2; // l'échec arrive aux tests
  if (etat === 'en-cours') {
    // Les étapes qui tiennent avant « maintenant » sont faites, la suivante court, les autres attendent.
    let courante = false;
    return NOMS_ETAPES.map((etape, k) => {
      const d = aleaDuree(k);
      if (!courante && t + d <= maintenant - 1000) { const debut = t; t += d; return { etape, etat: 'reussie' as const, debut: iso(debut), fin: iso(t) }; }
      if (!courante) { courante = true; return { etape, etat: 'en-cours' as const, debut: iso(t), fin: null }; }
      return { etape, etat: 'a-venir' as const, debut: null, fin: null };
    });
  }
  return NOMS_ETAPES.map((etape, k) => {
    const d = aleaDuree(k);
    const debut = t;
    if (etat === 'reussi') { t += d; return { etape, etat: 'reussie' as const, debut: iso(debut), fin: iso(t) }; }
    if (etat === 'echec') {
      if (k < echecA) { t += d; return { etape, etat: 'reussie' as const, debut: iso(debut), fin: iso(t) }; }
      if (k === echecA) { t += d; return { etape, etat: 'echouee' as const, debut: iso(debut), fin: iso(t) }; }
      return { etape, etat: 'a-venir' as const, debut: null, fin: null };
    }
    if (etat === 'annule') {
      if (k < 2) { t += d; return { etape, etat: 'reussie' as const, debut: iso(debut), fin: iso(t) }; }
      return { etape, etat: 'a-venir' as const, debut: null, fin: null };
    }
    return { etape, etat: 'a-venir' as const, debut: null, fin: null };
  });
}

export function genererDeploiements(ctx: Contexte, equipe: readonly Membre[], depots: readonly Depot[]): Deploiement[] {
  const h = hasardDe(ctx.graine, 'deploiements');
  const n = depots.length ? compter(ctx.volumes.deploiements, [0, 5, 24, 200]) : 0;
  const gens = salaries(equipe).map((m) => m.prenom);
  const cibles: Deploiement['cible'][] = ['production', 'apercu', 'production', 'preproduction', 'serveur', 'apercu'];
  // Les états : de quoi remplir chaque pastille dès « peu » — un échec, un en cours, un annulé ; le reste réussit.
  const sorte = (i: number): 'reussi' | 'echec' | 'en-cours' | 'annule' => (i === 1 ? 'en-cours' : i === 2 ? 'echec' : i === 3 && n >= 5 ? 'annule' : i % 11 === 0 ? 'echec' : 'reussi');
  const brut = fabriquer(n, (i) => {
    const depot = depots[(i - 1) % depots.length];
    const etat = sorte(i);
    // i = 1 est le plus récent. Neuf déploiements cette semaine dès « normal », le reste étalé sur 14 jours.
    const dansLaSemaine = i <= Math.min(n, 9) && n >= 20;
    const age = etat === 'en-cours' ? 1 : dansLaSemaine ? 5 + ((i - 1) * 53) % (jourSemaine(ctx.aujourdhui) * 540) : 24 * 60 + (i - 1) * Math.max(40, Math.floor((13 * 24 * 60) / Math.max(1, n))) + h.entier(0, 90);
    const lance = Math.max(ctx.maintenant - age * MIN, instantParis(ajouterJours(ctx.aujourdhui, -90), '00:00'));
    return { depot, etat, lance, i };
  }).sort((a, b) => b.lance - a.lance);
  return brut.map(({ depot, etat, lance, i }, rang): Deploiement => {
    const cible = cibles[(i + rang) % cibles.length];
    const etapes = etapesDe(lance, etat, ctx.maintenant, h);
    return {
      id: cle('dl', rang + 1),
      depot: depot.nom,
      branche: cible === 'production' ? 'main' : depot.branche,
      quoi: h.chance(0.7) ? QUOI[(i + rang) % QUOI.length] : null,
      version: depot.version,
      cible,
      par: gens[(i + rang) % Math.max(1, gens.length)] ?? 'Camille',
      lanceA: iso(lance),
      etapes,
      annuleA: etat === 'annule' ? iso(Math.min(ctx.maintenant - MIN, Date.parse(etapes[1].fin ?? iso(lance)) + 15_000)) : null,
      retourDe: null,
    };
  }).map((d, k, tous) => {
    // « Revenir » : un déploiement remet en ligne la version d'un déploiement réussi antérieur du même dépôt et de la même cible.
    if (k !== 4 || n < 12) return d;
    const origine = tous.slice(k + 1).find((x) => x.depot === d.depot && x.cible === d.cible && x.etapes.every((e) => e.etat === 'reussie'));
    return origine && d.etapes.every((e) => e.etat === 'reussie') ? { ...d, retourDe: origine.id, quoi: 'retour à la version précédente' } : d;
  });
}

export function genererDeploiementsPlanifies(ctx: Contexte, equipe: readonly Membre[], depots: readonly Depot[]): DeploiementPlanifie[] {
  const h = hasardDe(ctx.graine, 'deploiementsPlanifies');
  const n = depots.length ? compter(ctx.volumes.deploiementsPlanifies, [0, 1, 3, 12]) : 0;
  const gens = salaries(equipe).map((m) => m.prenom);
  return fabriquer(n, (i) => {
    const depot = depots[(i - 1) % depots.length];
    let jour = ajouterJours(ctx.aujourdhui, i * 2 + h.entier(0, 2));
    while (!estOuvre(jour)) jour = ajouterJours(jour, 1);
    return {
      id: cle('dpl', i),
      depot: depot.nom,
      branche: depot.branche,
      quoi: ['correctif des sessions', 'mise en ligne du client', 'version de la semaine'][i % 3],
      cible: (['production', 'apercu', 'preproduction'] as const)[i % 3],
      prevuA: iso(instantParis(jour, `${String(9 + (i % 7)).padStart(2, '0')}:00`)),
      par: gens[i % Math.max(1, gens.length)] ?? 'Camille',
    };
  }).sort((a, b) => a.prevuA.localeCompare(b.prevuA));
}

/* --------------------------- Tâches planifiées et journal --------------------------- */

/** Le dernier passage PRÉVU d'une planification avant `maintenant` (heure de Paris), ou null. */
export function dernierPassagePrevu(p: PlanificationDeTache, creeeMs: number, maintenant: number): number | null {
  let dernier: number | null = null;
  if (p.type === 'une-fois') dernier = Date.parse(p.a) <= maintenant ? Date.parse(p.a) : null;
  else if (p.type === 'intervalle') {
    const depuis = Date.parse(p.depuis);
    if (maintenant >= depuis) dernier = depuis + Math.floor((maintenant - depuis) / (p.minutes * MIN)) * p.minutes * MIN;
  } else {
    for (let d = 0; d <= 8 && dernier === null; d += 1) {
      const jour = jourDe(maintenant - d * JOUR);
      if (p.jours && !p.jours.includes(jourSemaine(jour))) continue;
      const t = instantParis(jour, p.heure);
      if (t <= maintenant) dernier = t;
    }
  }
  return dernier !== null && dernier >= creeeMs ? dernier : null;
}

export function genererTachesPlanifiees(ctx: Contexte, automatisations: readonly Automatisation[]): TachePlanifiee[] {
  const h = hasardDe(ctx.graine, 'tachesPlanifiees');
  const n = compter(ctx.volumes.tachesPlanifiees, [0, 3, 8, 20]);
  const planifiees = automatisations.filter((a) => a.type === 'Planifié');
  const modeles: readonly PlanificationDeTache[] = [
    { type: 'quotidien', heure: '03:00' }, { type: 'quotidien', heure: '08:30', jours: [1, 2, 3, 4, 5] }, { type: 'intervalle', minutes: 15, depuis: iso(ctx.maintenant - 40 * JOUR) },
    { type: 'quotidien', heure: '17:00', jours: [5] }, { type: 'une-fois', a: iso(ctx.maintenant + 3 * JOUR) }, { type: 'intervalle', minutes: 60, depuis: iso(ctx.maintenant - 12 * JOUR) },
    { type: 'quotidien', heure: '23:45' }, { type: 'une-fois', a: iso(ctx.maintenant - 2 * JOUR) },
  ];
  return fabriquer(n, (i) => {
    const planification = modeles[(i - 1) % modeles.length];
    const auto = planifiees.length ? planifiees[(i - 1) % planifiees.length] : null;
    const creee = ctx.maintenant - (20 + h.entier(0, 120)) * JOUR;
    const dernier = dernierPassagePrevu(planification, creee, ctx.maintenant);
    return {
      id: cle('tp', i),
      nom: auto?.nom ?? ['Sauvegarde de la nuit', 'Rapport du matin', 'Contrôle du serveur', 'Bilan du vendredi', 'Rappel unique', 'Synchronisation horaire', 'Archivage du soir', 'Relance ponctuelle'][(i - 1) % 8],
      automatisationId: auto?.id ?? null,
      planification,
      active: i % 7 !== 4,
      creeeA: iso(creee),
      dernierPassagePrevu: dernier === null ? null : iso(dernier),
    };
  });
}

const MESSAGES_OK = ['Terminé sans remarque.', 'Fichiers traités : tous.', 'Rien de nouveau à signaler.', 'Synchronisation faite.', 'Rapport envoyé à l’équipe.'] as const;
const MESSAGES_ECHEC = ['Le service n’a pas répondu à temps.', 'Une connexion a été refusée.', 'Un fichier attendu est manquant.', 'La limite d’appels a été atteinte.'] as const;

/**
 * Le journal d'exécutions : pour chaque automatisation, EXACTEMENT `executionsMois` exécutions réelles depuis le début
 * du mois, plus un historique des deux mois d'avant (le journal garde 90 jours). Le journal est la vérité : le dernier
 * passage de l'automatisation en est déduit. Une automatisation en pause l'est parce que ses trois dernières exécutions
 * réelles ont échoué (`SEUIL_PAUSE_AUTO` de S8), une fois sur deux ; les essais ne comptent jamais.
 */
export function genererExecutions(ctx: Contexte, automatisations: Automatisation[]): Execution[] {
  const h = hasardDe(ctx.graine, 'executions');
  if (ctx.volumes.executions === 'vide') return [];
  const plafond = compter(ctx.volumes.executions, [0, 4, 40, 90]);
  const debutMois = instantParis(debutDeMois(ctx.aujourdhui), '00:00');
  const liste: Omit<Execution, 'id'>[] = [];
  let pauseAvecEchecs = 0;
  for (const a of automatisations) {
    if (a.etat === 'Brouillon') { a.executionsMois = 0; a.dernierPassageAt = null; continue; }
    const duMois = Math.min(a.executionsMois, plafond);
    const avant = Math.min(Math.max(0, a.executions - a.executionsMois), Math.floor(plafond / 2));
    const maintenantMax = ctx.maintenant - 5 * MIN;
    const fenetre = Math.max(30 * MIN, maintenantMax - debutMois);
    const debuts = fabriquer(duMois, () => debutMois + h.entier(0, Math.floor(fenetre / MIN)) * MIN).sort((x, y) => x - y);
    const anciens = fabriquer(avant, () => debutMois - h.entier(1, 60 * 24) * MIN).sort((x, y) => x - y);
    const tous = [...anciens, ...debuts].filter((t) => t <= maintenantMax);
    // Une automatisation sur deux en pause l'est parce que ses trois dernières exécutions réelles ont échoué : il lui faut au moins trois exécutions.
    const veutPause = a.etat === 'En pause' && pauseAvecEchecs++ % 2 === 0;
    while (veutPause && tous.length < 3) tous.unshift((tous[0] ?? debutMois) - (2 + tous.length) * 3_600_000);
    const enPauseAuto = veutPause;
    tous.forEach((t, k) => {
      const dernieres = enPauseAuto && k >= tous.length - 3;
      const echec = dernieres || h.chance(0.06);
      const ignoree = !echec && h.chance(0.04);
      const resultat: Execution['resultat'] = echec ? 'echec' : ignoree ? 'ignoree' : 'reussie';
      liste.push({
        fluxId: a.id,
        debut: iso(t),
        fin: iso(t + h.entier(2, 90) * 1000),
        resultat,
        mode: h.chance(0.15) ? 'api' : 'local',
        essai: false,
        actionHumaine: resultat === 'echec' ? h.chance(0.6) : resultat === 'reussie' && h.chance(0.05),
        message: resultat === 'echec' ? MESSAGES_ECHEC[k % MESSAGES_ECHEC.length] : resultat === 'ignoree' ? 'Aucune nouvelle donnée : rien à faire.' : MESSAGES_OK[k % MESSAGES_OK.length],
      });
    });
    // Un essai (« Tester ») est visible mais ne compte jamais : un par automatisation active sur trois.
    if (a.etat === 'Active' && a.id.endsWith('1') && ctx.maintenant - 2 * 3_600_000 > debutMois) {
      const t = ctx.maintenant - h.entier(30, 110) * MIN;
      liste.push({ fluxId: a.id, debut: iso(t), fin: iso(t + 4000), resultat: h.chance(0.5) ? 'reussie' : 'echec', mode: 'local', essai: true, actionHumaine: false, message: 'Essai lancé à la main.' });
    }
    // Le journal fait foi : le compte du mois et le dernier passage s'en déduisent.
    const reelles = tous.filter((t) => t >= debutMois);
    a.executionsMois = reelles.length;
    a.dernierPassageAt = tous.length ? iso(tous[tous.length - 1]) : a.etat === 'Active' ? a.dernierPassageAt : null;
    a.executions = Math.max(a.executions, tous.length);
  }
  return liste
    .sort((x, y) => y.debut.localeCompare(x.debut))
    .map((e, i) => ({ ...e, id: cle('ex', i + 1, 5) }));
}

/* --------------------------------- Le serveur --------------------------------- */

export function genererMesuresServeur(ctx: Contexte): MesureServeur[] {
  const h = hasardDe(ctx.graine, 'mesuresServeur');
  const n = compter(ctx.volumes.mesuresServeur, [0, 36, 144, 144]); // 24 h, un point toutes les 10 minutes
  const fin = Math.floor(ctx.maintenant / (10 * MIN)) * 10 * MIN;
  return fabriquer(n, (k) => {
    const t = fin - (n - k) * 10 * MIN;
    const heureDuJour = ((t / 3_600_000) % 24 + 24) % 24;
    // Un rythme de journée : plus de charge en milieu de journée, un pic de sauvegarde à 03:00.
    const jour = 0.5 + 0.5 * Math.sin(((heureDuJour - 8) / 24) * 2 * Math.PI);
    const sauvegarde = Math.abs(heureDuJour - 1) < 0.5 || Math.abs(heureDuJour - 2) < 0.5 ? 22 : 0; // 03:00 à Paris = 02:00 ou 01:00 UTC
    const processeur = Math.min(100, Math.max(2, Math.round(10 + jour * 26 + sauvegarde + h.entier(-4, 6))));
    return {
      id: cle('ms', k, 4),
      at: iso(t),
      processeurPct: processeur,
      memoirePct: Math.min(100, Math.max(5, Math.round(44 + jour * 10 + h.entier(-2, 3)))),
      disquePct: 24,
      reseauMoParS: Math.round((0.4 + jour * 1.4 + (h.chance(0.02) ? h.entier(2, 5) : 0) + h.reel() * 0.3) * 10) / 10,
    };
  });
}

export function genererServicesServeur(ctx: Contexte): ServiceServeur[] {
  const h = hasardDe(ctx.graine, 'servicesServeur');
  const n = compter(ctx.volumes.servicesServeur, [0, 3, 6, 6]);
  const modeles: readonly (readonly [string, string, number])[] = [
    ['API de l’application', 'Serveur de l’application', 99.98], ['Base de données', 'Deux connexions ouvertes', 99.99], ['La Garde H24', 'Rondes toutes les 15 min', 100],
    ['Sauvegardes', 'Chaque nuit à 03:00', 100], ['Passerelle sécurisée', 'HTTPS, certificats automatiques', 99.97], ['Courriels sortants', 'File d’attente : 0', 99.41],
  ];
  return fabriquer(n, (i) => {
    const [nom, detail, dispo] = modeles[(i - 1) % modeles.length];
    // Fiche DEV-serveur : en marche dès 99,9 %, attention entre 99,0 et 99,9 %, arrêté sous 99,0 %.
    const attention = dispo < 99.9;
    return { id: cle('sv', i, 3), nom, detail, disponibilite30jPct: Math.round((dispo - (h.chance(0.2) ? 0.01 : 0)) * 100) / 100, etat: attention ? 'attention' : 'en marche' };
  });
}

/** Le résumé du serveur : jours en ligne, mémoire et disque, sauvegardes (lues dans le jeu `sauvegardes`), coût du mois. */
export function genererServeur(ctx: Contexte, sauvegardes: readonly CopieSauvegarde[]): ResumeServeur[] {
  if (compter(ctx.volumes.serveur, [0, 1, 1, 1]) === 0) return [];
  const derniere = [...sauvegardes].sort((a, b) => b.at.localeCompare(a.at))[0] ?? null;
  const jours = 41;
  return [{
    id: 'srv-1',
    enLigneDepuisJours: jours,
    redemarreLe: iso(ctx.maintenant - jours * JOUR - 5 * 3_600_000),
    memoireTotaleGo: 8,
    disqueTotalGo: 160,
    // 24 % de 160 Go : les mesures de la journée disent 24 % (voir `genererMesuresServeur`).
    disqueUtiliseGo: 38.4,
    croissanceDisqueGoParSemaine: [0.9, 1.2, 1, 1.1],
    capaciteReseauMoParS: 12.5,
    sauvegardes: {
      derniereCopieAt: derniere ? derniere.at : null,
      derniereCopieReussie: derniere ? derniere.etat === 'Réussie' : false,
      restaurationTesteeLe: ajouterJours(ctx.aujourdhui, -28),
      copieHorsServeurChiffree: true,
    },
    couts: [{ ligne: 'Hébergement', cents: 600 }, { ligne: 'Stockage', cents: 200 }, { ligne: 'Copies', cents: 100 }],
  }];
}

/* ------------------------------- Coûts des connecteurs ------------------------------- */

/** Une consommation plausible par connecteur de H21 (nom, unité, inclus, coût mensuel en centimes) : les gratuits ne coûtent rien. */
const CONSO: Record<string, readonly [Connecteur['mode'], Connecteur['modeleDeCout'], string, number, number | null, number]> = {
  'Paiement en ligne': ['payant', 'commission', 'paiements', 18, null, 0],
  Banque: ['local', 'gratuit', 'lectures', 640, null, 0],
  'Agenda externe': ['local', 'gratuit', 'événements', 96, null, 0],
  Courrier: ['local', 'gratuit', 'envois', 412, 500, 0],
  'Stockage en ligne': ['a-brancher', 'abonnement', 'Go', 0, null, 0],
  Comptabilité: ['local', 'gratuit', 'exports', 3, null, 0],
  'Signature électronique': ['a-brancher', 'a-l-usage', 'signatures', 0, null, 0],
  'Messagerie instantanée': ['payant', 'abonnement', 'messages', 180, 250, 1_400],
};

/** Complète les connecteurs (DEV-couts) : mode, modèle de coût, consommation du mois, payé. Sans toucher à leur état. */
export function completerConnecteurs(ctx: Contexte, connecteurs: Connecteur[]): Connecteur[] {
  for (const c of connecteurs) {
    const nom = c.nom.replace(/ \(\d+\)$/, '');
    const [mode, modele, unite, utilise, inclus, paye] = CONSO[nom] ?? ['local', 'gratuit', 'opérations', 50, null, 0];
    const connecte = c.etat !== 'Non connecté';
    const m: Connecteur['mode'] = connecte ? mode === 'a-brancher' ? 'local' : mode : 'a-brancher';
    c.mode = m;
    c.modeleDeCout = modele;
    c.consommationMois = { unite, utilise: connecte ? utilise : 0, inclus };
    c.payeCeMoisCents = connecte && m === 'payant' ? paye : 0;
  }
  void ctx;
  return connecteurs;
}

/** Les six derniers mois de paiements aux connecteurs : le dernier est le mois courant et vaut la somme de `payeCeMoisCents`. */
export function genererPaiementsConnecteurs(ctx: Contexte, connecteurs: readonly Connecteur[]): PaiementConnecteurs[] {
  const h = hasardDe(ctx.graine, 'paiementsConnecteurs');
  if (ctx.volumes.paiementsConnecteurs === 'vide' || connecteurs.length === 0) return [];
  const ceMois = connecteurs.reduce((s, c) => s + c.payeCeMoisCents, 0);
  const mois: string[] = [];
  const [a, m] = ctx.aujourdhui.split('-').map(Number);
  for (let k = 5; k >= 0; k -= 1) {
    const t = a * 12 + (m - 1) - k;
    mois.push(`${Math.floor(t / 12)}-${String((t % 12) + 1).padStart(2, '0')}`);
  }
  return mois.map((cleMois, k) => {
    const paye = k === 5 ? ceMois : Math.max(0, Math.round((ceMois || 1_400) * (0.5 + (k / 5) * 0.4) + h.entier(-200, 300)));
    return { id: `pc-${cleMois}`, mois: cleMois, payeCents: paye, economiseCents: Math.round(paye * 5.8 + 2_000) };
  });
}


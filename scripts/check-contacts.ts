/**
 * Contrôle de la LOGIQUE DE LOT-02 · MES CONTACTS ET CLIENTS — `npm run check:contacts`.
 *
 * Sans réseau, sans navigateur. La logique pure du lot (`src/refonte/contacts/`) est exercée
 * hors interface : d'abord sur des cas écrits à la main (règles de `STATUT.md` §1.22 et de
 * `REGLES.md`), puis sur les jeux fictifs de SIM (`src/refonte/donnees/`) aux quatre volumes.
 * S'y ajoutent des contrôles de structure : aucun composant ni brique visuelle avant le feu
 * vert du CO, aucune lecture de l'horloge, aucun nom réel, et les deux voix — l'interface
 * tutoie, ce qui part chez un client vouvoie.
 *
 * Les fiches du lot (dossier v4) n'étaient pas à disposition de la session de préparation :
 * les règles qui en dépendent sont marquées « à confirmer » dans la note du lot, et les
 * valeurs de départ vivent à un seul endroit (`REGLES_PAR_DEFAUT`).
 *
 *   npm run check:contacts
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ZONE = 'src/refonte/contacts';
let echecs = 0;
let vus = 0;
const dit = async (nom: string, fn: () => void | Promise<void>) => {
  try {
    await fn();
    vus += 1;
    console.log(`  ✓ ${nom}`);
  } catch (err) {
    echecs += 1;
    console.error(`  ✗ ${nom}\n      ${(err as Error).message.split('\n').join('\n      ')}`);
  }
};

async function charger<T>(code: string): Promise<T> {
  const construit = await esbuild.build({
    stdin: { contents: code, resolveDir: path.join(racine, 'scripts'), loader: 'ts' },
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    charset: 'utf8',
    jsx: 'automatic',
    tsconfig: path.join(racine, 'tsconfig.json'),
    define: { 'process.env.NODE_ENV': '"production"', 'import.meta.env.DEV': 'false', __AMN_EDITION__: '"internal"', __AMN_VERSION__: '"0.0.0"' },
    logLevel: 'silent',
  });
  return (await import(`data:text/javascript;charset=utf-8;base64,${Buffer.from(construit.outputFiles[0].text, 'utf8').toString('base64')}`)) as T;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const M = await charger<any>(
  "export * as L from '../src/refonte/contacts';\nexport * as monde from '../src/refonte/donnees';\nexport { DICTIONNAIRES_CONTACTS } from '../src/refonte/contacts/i18n';\nexport * as V from '../src/refonte/connecteurs/reglages';\nexport * as H from '../src/refonte/contacts/hub/modele';\nexport * as N from '../src/refonte/contacts/hub/nuage';\nexport { DICTIONNAIRES_HUB } from '../src/refonte/contacts/hub/i18n';\nexport { depuisMonde } from '../src/refonte/contacts/sources/depuisMonde';",
);
const { L, monde, V, H, N, DICTIONNAIRES_HUB: DICO_HUB, depuisMonde, DICTIONNAIRES_CONTACTS: DICO } = M;
const paris = (jour: string, hhmm: string): number => L.instantParis(jour, hhmm);
const VOLUMES = ['vide', 'peu', 'normal', 'beaucoup'] as const;
const mondes = Object.fromEntries(VOLUMES.map((v) => [v, monde.construireMonde({ volume: v })])) as Record<(typeof VOLUMES)[number], any>;

const prospect = (o: Record<string, unknown> = {}) => ({
  id: 'p-x', nom: 'Atelier Test', contactNom: 'Alex Test', offre: 'Offre', montantCents: 100_000, recurrence: null, etape: 'nouveau', probabilite: 50,
  responsableEmail: 'a@exemple.test', prochaineAction: 'Appeler', prochaineActionLe: '2026-11-02', urgent: false, checklist: { faites: 0, total: 3 },
  creeLe: '2026-10-01', signeLe: null, perduLe: null, clientId: null, ...o,
});
const relance = (o: Record<string, unknown> = {}) => ({
  id: 'rl-x', clientId: 1, clientNom: 'Boulangerie Test', motif: 'facture', objetId: 'f-1', objetLibelle: 'Facture F-001', montantCents: 120_000,
  departLe: '2026-10-01', etat: 'prête', message: '', nbEnvoyees: 0, derniereEnvoiLe: null, ...o,
});

/* ── Pipeline ───────────────────────────────────────────────────────────── */
console.log('Contacts — pipeline (H06, MC01)\n');

await dit('six étapes, quatre colonnes : « contacté » rejoint Nouveau, « gagné » devient Signé, « perdu » sort', () => {
  assert.deepEqual(L.ETAPES, ['nouveau', 'contacté', 'rendez-vous', 'devis envoyé', 'gagné', 'perdu']);
  assert.deepEqual(L.COLONNES, ['Nouveau', 'Rendez-vous', 'Devis envoyé', 'Signé']);
  const cols = L.colonnesPipeline(['nouveau', 'contacté', 'rendez-vous', 'devis envoyé', 'gagné', 'perdu'].map((etape, i) => prospect({ id: `p${i}`, etape })));
  assert.deepEqual(cols.map((c: any) => c.prospects.length), [2, 1, 1, 1]);
});

await dit('valeur pondérée : montant × probabilité ; signé 100 % ; perdu et sans montant 0', () => {
  assert.equal(L.valeurPonderee(prospect({ montantCents: 200_000, probabilite: 25 })), 50_000);
  assert.equal(L.valeurPonderee(prospect({ montantCents: 200_000, probabilite: 25, etape: 'gagné' })), 200_000);
  assert.equal(L.valeurPonderee(prospect({ montantCents: 200_000, probabilite: 80, etape: 'perdu' })), 0);
  assert.equal(L.valeurPonderee(prospect({ montantCents: null })), 0);
  assert.equal(L.valeurPonderee(prospect({ montantCents: 100_000, probabilite: 150 })), 100_000, 'probabilité bornée à 100');
});

await dit('colonne : urgent d’abord, puis prochaine action la plus proche, sans date en dernier ; totaux et « sans montant »', () => {
  const [col] = L.colonnesPipeline([
    prospect({ id: 'a', prochaineActionLe: '2026-11-09' }),
    prospect({ id: 'b', prochaineActionLe: null }),
    prospect({ id: 'c', prochaineActionLe: '2026-11-03' }),
    prospect({ id: 'd', prochaineActionLe: '2026-12-01', urgent: true, montantCents: null }),
  ]);
  assert.deepEqual(col.prospects.map((p: any) => p.id), ['d', 'c', 'a', 'b']);
  assert.equal(col.totalCents, 300_000);
  assert.equal(col.pondereCents, 150_000);
  assert.equal(col.sansMontant, 1);
});

await dit('résumé : en retard seulement si ouvert ; taux de conversion = gagnés ÷ conclus, null sans conclu', () => {
  const r = L.resumePipeline(
    [prospect({ id: '1', prochaineActionLe: '2026-10-29' }), prospect({ id: '2', etape: 'gagné', prochaineActionLe: '2026-10-01' }), prospect({ id: '3', etape: 'perdu' }), prospect({ id: '4', etape: 'perdu' }), prospect({ id: '5', urgent: true })],
    '2026-10-30',
  );
  assert.deepEqual({ o: r.ouverts, g: r.gagnes, p: r.perdus, r: r.enRetard, u: r.urgents }, { o: 2, g: 1, p: 2, r: 1, u: 1 });
  assert.equal(r.tauxConversion, 1 / 3);
  assert.equal(L.resumePipeline([prospect()], '2026-10-30').tauxConversion, null);
});

await dit('transitions : avancer librement, reculer d’une étape, perdre partout, gagné et perdu terminaux', () => {
  assert.deepEqual(L.transitionsPermises('nouveau'), ['contacté', 'rendez-vous', 'devis envoyé', 'gagné', 'perdu']);
  assert.deepEqual(L.transitionsPermises('rendez-vous'), ['contacté', 'devis envoyé', 'gagné', 'perdu']);
  assert.deepEqual(L.transitionsPermises('gagné'), []);
  assert.deepEqual(L.transitionsPermises('perdu'), []);
});

await dit('gagner : date de signature, 100 %, plus d’action, et un client à créer s’il n’y en a pas', () => {
  const g = L.deplacer(prospect({ etape: 'devis envoyé', urgent: true }), 'gagné', '2026-10-30');
  assert.equal(g.prospect.signeLe, '2026-10-30');
  assert.equal(g.prospect.probabilite, 100);
  assert.equal(g.prospect.prochaineActionLe, null);
  assert.equal(g.prospect.urgent, false);
  assert.equal(g.creerClient, true);
  assert.equal(L.deplacer(prospect({ etape: 'devis envoyé', clientId: 7 }), 'gagné', '2026-10-30').creerClient, false);
  const p = L.deplacer(prospect(), 'perdu', '2026-10-30');
  assert.deepEqual([p.prospect.perduLe, p.prospect.probabilite, p.creerClient], ['2026-10-30', 0, false]);
});

await dit('rouvrir : un prospect perdu seulement, avec confirmation et une trace ; il repart en « Nouveau », sans probabilité inventée', () => {
  const perdu = L.deplacer(prospect({ probabilite: 60 }), 'perdu', '2026-10-20').prospect;
  assert.throws(() => L.rouvrir(perdu, '2026-10-30', false), /confirmation/);
  assert.equal(perdu.etape, 'perdu', 'sans confirmation, rien ne change');
  const r = L.rouvrir(perdu, '2026-10-30', true);
  assert.deepEqual([r.prospect.etape, r.prospect.perduLe, r.prospect.probabilite], ['nouveau', null, 0]);
  assert.deepEqual(r.trace, { genre: 'reouvert', le: '2026-10-30', depuis: 'perdu', vers: 'nouveau', perduLe: '2026-10-20' });
  assert.equal(L.valeurPonderee(r.prospect), 0);
  assert.throws(() => L.rouvrir(prospect({ etape: 'gagné' }), '2026-10-30', true), /n'est pas perdu/, 'un gagné ne se rouvre pas');
  assert.throws(() => L.rouvrir(prospect(), '2026-10-30', true), /n'est pas perdu/);
  assert.deepEqual(L.transitionsPermises('perdu'), [], 'rouvrir n’est pas un déplacement ordinaire');
});

await dit('un mouvement refusé lève une erreur ; l’objet d’origine n’est jamais modifié', () => {
  const p = prospect({ etape: 'gagné' });
  assert.throws(() => L.deplacer(p, 'nouveau', '2026-10-30'), /refusé/);
  const q = prospect();
  L.deplacer(q, 'gagné', '2026-10-30');
  assert.equal(q.etape, 'nouveau');
});

await dit('MC01 : chance par étape (20 / 40 / 55 / 100), en jeu hors signés et perdus, prévision pondérée et part de chaque colonne', () => {
  assert.deepEqual(L.CHANCES_MC01, { Nouveau: 20, 'Rendez-vous': 40, 'Devis envoyé': 55, Signé: 100 });
  // 1 900 + 900 + 15 600 = 18 400 en jeu ; 15 600 × 55 % + 900 × 40 % + 1 900 × 20 % = 9 320 (valeurs de la fiche)
  const l = [
    prospect({ id: 'a', etape: 'devis envoyé', montantCents: 1_560_000 }), prospect({ id: 'b', etape: 'rendez-vous', montantCents: 90_000 }),
    prospect({ id: 'c', etape: 'nouveau', montantCents: 190_000 }), prospect({ id: 'd', etape: 'gagné', montantCents: 620_000 }), prospect({ id: 'e', etape: 'perdu', montantCents: 500_000 }),
  ];
  assert.equal(L.enJeu(l), 1_840_000);
  const p = L.previsionPonderee(l);
  assert.equal(p.totalCents, 932_000);
  assert.deepEqual(p.contributions.map((c: any) => [c.colonne, c.cents]), [['Nouveau', 38_000], ['Rendez-vous', 36_000], ['Devis envoyé', 858_000]]);
  assert.ok(Math.abs(p.contributions.reduce((s: number, c: any) => s + c.part, 0) - 932_000 / 1_840_000) < 1e-9);
  assert.equal(L.previsionPonderee([]).totalCents, 0);
});

await dit('MC01 : taux de passage sur 90 jours glissants, âge moyen dans l’étape, « N j sans réponse » dès 5 jours', () => {
  const m = [
    { prospectId: 'a', vers: 'nouveau', le: '2026-09-01' }, { prospectId: 'a', vers: 'rendez-vous', le: '2026-09-10' },
    { prospectId: 'b', vers: 'nouveau', le: '2026-09-05' }, { prospectId: 'c', vers: 'contacté', le: '2026-10-01' }, { prospectId: 'c', vers: 'rendez-vous', le: '2026-10-05' },
    { prospectId: 'z', vers: 'nouveau', le: '2026-05-01' },
  ];
  assert.deepEqual(L.tauxDePassage(m, 'Nouveau', '2026-10-30'), { entrees: 3, passees: 2, taux: 2 / 3 });
  assert.deepEqual(L.tauxDePassage(m, 'Signé', '2026-10-30'), { entrees: 0, passees: 0, taux: null });
  assert.equal(L.tauxDePassage([], 'Nouveau', '2026-10-30').taux, null);
  assert.equal(L.ageMoyenDansEtape([{ depuis: '2026-10-20' }, { depuis: '2026-10-28' }], '2026-10-30'), 6);
  assert.equal(L.ageMoyenDansEtape([], '2026-10-30'), null);
  assert.equal(L.joursSansReponse('2026-10-24', null, '2026-10-30'), 6);
  assert.equal(L.joursSansReponse('2026-10-27', null, '2026-10-30'), null, '3 jours : pas encore');
  assert.equal(L.joursSansReponse('2026-10-24', '2026-10-26', '2026-10-30'), null, 'le client a répondu');
});

await dit('MC01 : signé ce mois, objectif du mois (rien de négatif), signatures par mois et fait encourageant', () => {
  const sig = (id: string, le: string, c = 100_000) => prospect({ id, etape: 'gagné', signeLe: le, montantCents: c });
  const l = [sig('1', '2026-10-02', 200_000), sig('2', '2026-10-10', 420_000), sig('3', '2026-09-30'), sig('4', '2026-10-31')];
  assert.deepEqual(L.signesDuMois(l, '2026-10-30'), { nb: 3, totalCents: 720_000 });
  assert.deepEqual(L.objectifDuMois(620_000, 800_000), { reste: 180_000, atteint: false });
  assert.deepEqual(L.objectifDuMois(800_000, 800_000), { reste: 0, atteint: true });
  assert.equal(L.objectifDuMois(100, null), null, 'pas d’objectif : « Fixez votre objectif du mois »');
  const serie = L.signaturesParMois(l, '2026-10-30', 6);
  assert.deepEqual(serie.map((x: any) => x.mois), ['2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10']);
  assert.equal(serie[5].nb, 3);
  assert.deepEqual(L.faitEncourageant([{ mois: 'a', nb: 1 }, { mois: 'b', nb: 4 }, { mois: 'c', nb: 2 }, { mois: 'd', nb: 4 }]), { genre: 'egale-meilleur', nb: 4 });
  assert.deepEqual(L.faitEncourageant([{ mois: '2026-05', nb: 5 }, { mois: '2026-06', nb: 2 }, { mois: '2026-07', nb: 3 }, { mois: '2026-08', nb: 1 }, { mois: '2026-09', nb: 2 }, { mois: '2026-10', nb: 4 }]), { genre: 'meilleur-depuis', depuis: '2026-05' });
  assert.deepEqual(L.faitEncourageant([{ mois: 'a', nb: 1 }, { mois: 'b', nb: 2 }, { mois: 'c', nb: 3 }]), { genre: 'record' });
  assert.deepEqual(L.faitEncourageant([{ mois: 'a', nb: 2 }, { mois: 'b', nb: 3 }, { mois: 'c', nb: 2 }, { mois: 'd', nb: 3 }, { mois: 'e', nb: 1 }, { mois: 'f', nb: 2 }]), { genre: 'meilleur-depuis', depuis: 'd' });
  assert.deepEqual(L.faitEncourageant([{ mois: 'a', nb: 2 }, { mois: 'b', nb: 3 }, { mois: 'c', nb: 3 }, { mois: 'd', nb: 3 }, { mois: 'e', nb: 3 }, { mois: 'f', nb: 2 }]), { genre: 'regularite', mois: 6, auDessusDe: 2 });
  assert.equal(L.faitEncourageant([{ mois: 'a', nb: 4 }, { mois: 'b', nb: 1 }]), null, 'un mois faible : aucune ligne, rien de négatif');
  assert.equal(L.faitEncourageant([{ mois: 'a', nb: 4 }, { mois: 'b', nb: 0 }]), null);
});

await dit('H06 : l’intérêt pondère 35 / 25 / 20 / 20, la fraîcheur va de 100 (aujourd’hui) à 0 (30 jours), libellés froid / tiède / chaud', () => {
  assert.deepEqual(L.POIDS_INTERET, { lectures: 35, reponses: 25, rendezVous: 20, fraicheur: 20 });
  assert.deepEqual([0, 15, 30, 45].map((j) => L.fraicheur(j)), [100, 50, 0, 0]);
  assert.equal(L.fraicheur(null), 0);
  const tout = { lectures14j: 99, delaiReponseHeures: 1, rendezVous: 9, joursDepuisContact: 0 };
  assert.equal(L.interet(tout), 100);
  assert.equal(L.interet({ lectures14j: 0, delaiReponseHeures: null, rendezVous: 0, joursDepuisContact: null }), 0);
  assert.equal(L.interet({ ...tout, lectures14j: 0 }), 65, 'sans lecture : 100 − 35');
  assert.deepEqual([0, 33, 34, 66, 67, 100].map((v) => L.libelleInteret(v)), ['froid', 'froid', 'tiede', 'tiede', 'chaud', 'chaud']);
});

await dit('H06 : « À appeler cette semaine » = intérêt ≥ 60 ET montant ≥ 3 000 €, classé par intérêt × montant ; repli hors quadrant ; traînée d’au moins 10 points', () => {
  const n = (id: string, i: number, c: number | null, etape = 'devis envoyé') => ({ prospect: prospect({ id, nom: id, montantCents: c, etape }), interet: i });
  const notes = [n('a', 80, 800_000), n('b', 60, 300_000), n('c', 59, 900_000), n('d', 90, 299_999), n('e', 95, 900_000), n('f', 99, 900_000, 'perdu'), n('g', 70, null)];
  assert.deepEqual(L.appelsDeLaSemaine(notes).map((x: any) => x.prospect.id), ['e', 'a', 'b']);
  assert.deepEqual(L.candidatsHorsQuadrant(notes, L.QUADRANT_PAR_DEFAUT, 2).map((x: any) => x.prospect.id), ['c', 'd']);
  assert.equal(L.trainee(70, 55), 55);
  assert.equal(L.trainee(70, 65), null, 'moins de 10 points : pas de traînée');
  assert.equal(L.trainee(70, null), null);
  assert.equal(L.nouveaux([prospect({ creeLe: '2026-10-20' }), prospect({ creeLe: '2026-09-01' })], '2026-10-30').length, 1);
});

/* ── Relances : la règle d'espacement (fiche MC07, rubrique 6) ───────────── */
console.log('\nContacts — relances (MC07) : on ne harcèle jamais un client — les huit points de la fiche\n');

const R = L.REGLES_PAR_DEFAUT;
/* Les scénarios ci-dessous ont des dates fixes : ils jouent avec des règles EXPLICITES (7 jours, 08:00–19:00), quelles que soient les valeurs de départ lues chez S9. */
const REGLES_ESSAI = { ...R, espacementJours: 7, clientDelaiJours: 7, fenetre: { debut: '08:00', fin: '19:00', jours: [1, 2, 3, 4, 5] } };
const R_ = {
  verdictRelance: (r: any, autres: any, t: number, regles = REGLES_ESSAI, ctx?: any) => L.verdictRelance(r, autres, t, regles, ctx),
  marquerEnvoyee: (r: any, autres: any, t: number, o: any) => L.marquerEnvoyee(r, autres, t, { regles: REGLES_ESSAI, ...o }),
  ordonnerFile: (rs: any, t: number, regles = REGLES_ESSAI, ctx?: any) => L.ordonnerFile(rs, t, regles, ctx),
  reporterADemain: (r: any, autres: any, t: number, regles = REGLES_ESSAI, ctx?: any) => L.reporterADemain(r, autres, t, regles, ctx),
  cadence: (d: string, regles = REGLES_ESSAI, n = 6) => L.cadence(d, regles, n),
  phraseAttente: (v: any, langue: string, regles = REGLES_ESSAI) => L.phraseAttente(v, langue, regles),
};
const VENDREDI_10H = paris('2026-10-30', '10:15');
const J = 86_400_000;
const clic = { clic: true };

await dit('valeurs de départ : espacement et plage LUS de connecteurs/reglages.ts (une seule source, §1.31) ; le reste vient de la fiche MC07', () => {
  assert.equal(R.espacementJours, V.VALEURS_DE_DEPART.delaiEntreRelancesJours, 'même source que les réglages de l’autonomie');
  assert.deepEqual(R.fenetre, V.VALEURS_DE_DEPART.plageClients);
  assert.ok(R.espacementJours >= L.ESPACEMENT_MIN_JOURS && R.espacementJours <= L.ESPACEMENT_MAX_JOURS, 'dans l’intervalle réglable (3 à 14 jours)');
  assert.deepEqual([R.maxParObjet, R.clientDelaiJours, R.heuresApresEchange, R.pauseAvisJours], [3, 7, 24, 7]);
});

await dit('l’espacement se règle de 3 à 14 jours, jamais au-delà', () => {
  assert.equal(L.reglesBornees({ espacementJours: 1 }).espacementJours, 3);
  assert.equal(L.reglesBornees({ espacementJours: 30 }).espacementJours, 14);
  assert.equal(L.reglesBornees({ espacementJours: 5 }).espacementJours, 5);
});

await dit('première relance : permise un jour ouvré, dans la plage', () => {
  assert.deepEqual(R_.verdictRelance(relance(), [], VENDREDI_10H), { possible: true });
});

await dit('point 2 — espacement d’un même objet : 3 jours après → attendre ; 7 jours pile → permis', () => {
  const r = relance({ etat: 'envoyée', nbEnvoyees: 1, derniereEnvoiLe: '2026-10-27' });
  const v = R_.verdictRelance(r, [], VENDREDI_10H);
  assert.equal(v.possible, false);
  assert.equal(v.raison, 'espacement');
  assert.equal(v.prochaineLe, paris('2026-11-03', '08:00'), 'mardi 3 nov. à l’ouverture');
  assert.equal(R_.verdictRelance(relance({ etat: 'envoyée', nbEnvoyees: 1, derniereEnvoiLe: '2026-10-23' }), [], VENDREDI_10H).possible, true);
  assert.equal(R_.verdictRelance(relance({ etat: 'envoyée', nbEnvoyees: 1, derniereEnvoiLe: '2026-10-24' }), [], VENDREDI_10H).possible, false, '6 jours : trop tôt');
});

await dit('l’espacement suit le réglage : à 5 jours (valeur de la fiche), 5 jours suffisent', () => {
  const r = relance({ etat: 'envoyée', nbEnvoyees: 1, derniereEnvoiLe: '2026-10-23' });
  const cinq = L.reglesBornees({ espacementJours: 5, clientDelaiJours: 5 });
  assert.equal(R_.verdictRelance(r, [], VENDREDI_10H, cinq).possible, true);
  const quatorze = L.reglesBornees({ espacementJours: 14 });
  assert.equal(R_.verdictRelance(relance({ etat: 'envoyée', nbEnvoyees: 1, derniereEnvoiLe: '2026-10-20' }), [], VENDREDI_10H, quatorze).raison, 'espacement');
});

await dit('changement d’heure : l’ouverture suivante reste 08:00 à Paris (heure d’hiver, UTC+1)', () => {
  const r = relance({ etat: 'envoyée', nbEnvoyees: 1, derniereEnvoiLe: '2026-10-22' });
  const v = R_.verdictRelance(r, [], paris('2026-10-25', '12:00'));
  assert.equal(v.possible, false);
  assert.equal(new Date(v.prochaineLe).toISOString(), '2026-10-29T07:00:00.000Z');
});

await dit('point 3 — trois relances au plus par objet ; appel proposé après la 2e, suivi à la main après la 3e', () => {
  const v = R_.verdictRelance(relance({ etat: 'envoyée', nbEnvoyees: 3, derniereEnvoiLe: '2026-09-01' }), [], VENDREDI_10H);
  assert.deepEqual([v.possible, v.raison, v.prochaineLe], [false, 'plafond', null]);
  assert.match(R_.phraseAttente(v, 'fr'), /3 relances envoyées : ensuite, suivi à la main/);
  assert.deepEqual([0, 1, 2, 3].map((n) => L.suiteApres(n)), ['message', 'message', 'appel', 'manuel']);
});

await dit('point 5 — arrêt immédiat dès que le client répond, paie, signe ou demande à ne plus être relancé', () => {
  for (const raison of ['reponse', 'paiement', 'signature']) assert.equal(L.arreterPour(relance(), raison).etat, 'répondue', raison);
  assert.equal(L.arreterPour(relance(), 'demande').etat, 'arrêtée');
  for (const etat of ['répondue', 'arrêtée']) assert.equal(R_.verdictRelance(relance({ etat }), [], VENDREDI_10H).raison, 'terminee');
  assert.equal(L.arreter(relance()).etat, 'arrêtée');
  assert.equal(L.marquerRepondue(relance()).etat, 'répondue');
});

await dit('point 4 — plage : samedi, dimanche, 07:59 et 19:00 attendent l’ouverture suivante', () => {
  const cas: [string, string, string, string][] = [
    ['2026-10-31', '11:00', '2026-11-03', '08:00'], // samedi → lundi 2 nov. : Toussaint (1er nov. un dimanche, lundi 2 ouvré)
    ['2026-11-01', '09:00', '2026-11-02', '08:00'], // dimanche (Toussaint) → lundi
    ['2026-10-30', '07:59', '2026-10-30', '08:00'],
    ['2026-10-30', '19:00', '2026-11-02', '08:00'], // vendredi soir → lundi
  ];
  cas[0] = ['2026-10-31', '11:00', '2026-11-02', '08:00'];
  for (const [j, h, jOk, hOk] of cas) {
    const v = R_.verdictRelance(relance(), [], paris(j, h));
    assert.deepEqual([v.possible, v.raison, v.prochaineLe], [false, 'horsPlage', paris(jOk, hOk)], `${j} ${h}`);
  }
  assert.equal(R_.verdictRelance(relance(), [], paris('2026-10-30', '08:00')).possible, true, '08:00 pile : ouvert');
  assert.equal(R_.verdictRelance(relance(), [], paris('2026-10-30', '18:59')).possible, true);
});

await dit('point 4 — jamais un jour férié : Pâques, Ascension, 14 juillet, 11 novembre', () => {
  assert.deepEqual(L.joursFeries(2026).sort(), ['2026-01-01', '2026-04-06', '2026-05-01', '2026-05-08', '2026-05-14', '2026-05-25', '2026-07-14', '2026-08-15', '2026-11-01', '2026-11-11', '2026-12-25']);
  assert.deepEqual(L.joursFeries(2027).filter((j: string) => j.startsWith('2027-03') || j.startsWith('2027-04')), ['2027-03-29']);
  const v = R_.verdictRelance(relance(), [], paris('2026-11-11', '10:00'));
  assert.deepEqual([v.possible, v.raison, v.prochaineLe], [false, 'horsPlage', paris('2026-11-12', '08:00')]);
  const pont = R_.verdictRelance(relance(), [], paris('2026-07-14', '10:00'));
  assert.equal(pont.prochaineLe, paris('2026-07-15', '08:00'));
});

await dit('point 4 — les préférences de la fiche contact décalent l’envoi (« avant 11:00 », « jamais le vendredi après-midi »)', () => {
  const ctx = { preferences: { avant: '11:00', joursAEviter: [{ jour: 5, apresMidi: true }] } };
  assert.equal(R_.verdictRelance(relance(), [], paris('2026-10-30', '10:00'), REGLES_ESSAI, ctx).possible, true, 'vendredi matin, avant 11:00');
  const apres = R_.verdictRelance(relance(), [], paris('2026-10-30', '11:30'), REGLES_ESSAI, ctx);
  assert.deepEqual([apres.possible, apres.raison, apres.prochaineLe], [false, 'horsPlage', paris('2026-11-02', '08:00')], 'vendredi 11:30 : pas avant lundi');
  const lundi = R_.verdictRelance(relance(), [], paris('2026-11-02', '11:30'), REGLES_ESSAI, ctx);
  assert.equal(lundi.prochaineLe, paris('2026-11-03', '08:00'), 'lundi après 11:00 : le lendemain');
  const jamais = R_.verdictRelance(relance(), [], paris('2026-10-30', '09:00'), REGLES_ESSAI, { preferences: { joursAEviter: [{ jour: 5 }] } });
  assert.equal(jamais.prochaineLe, paris('2026-11-02', '08:00'), 'jour évité en entier');
  const tard = R_.verdictRelance(relance(), [], paris('2026-10-29', '08:30'), REGLES_ESSAI, { preferences: { apres: '10:00' } });
  assert.equal(tard.prochaineLe, paris('2026-10-29', '10:00'));
});

await dit('point 1 — un client, une relance par semaine glissante, tous objets regroupés', () => {
  const dejaEcrit = relance({ id: 'rl-a', objetId: 'f-9', etat: 'envoyée', nbEnvoyees: 1, derniereEnvoiLe: '2026-10-27' });
  const v = R_.verdictRelance(relance({ id: 'rl-b' }), [dejaEcrit], VENDREDI_10H);
  assert.deepEqual([v.possible, v.raison, v.prochaineLe], [false, 'client', paris('2026-11-03', '08:00')]);
  assert.match(R_.phraseAttente(v, 'fr'), /Pas avant le 03\/11 : une relance par semaine au plus/);
  assert.equal(R_.verdictRelance(relance({ id: 'rl-b' }), [{ ...dejaEcrit, clientId: 2 }], VENDREDI_10H).possible, true, 'un autre client ne compte pas');
  assert.equal(R_.verdictRelance(relance({ id: 'rl-b' }), [{ ...dejaEcrit, derniereEnvoiLe: '2026-10-23' }], VENDREDI_10H).possible, true, 'il y a 7 jours : permis');
  assert.equal(R_.verdictRelance(relance({ id: 'rl-b' }), [{ ...dejaEcrit, derniereEnvoiLe: '2026-10-30' }], VENDREDI_10H).raison, 'client', 'le jour même aussi');
});

await dit('un prospect (sans fiche) se reconnaît à son nom', () => {
  const a = relance({ id: 'a', clientId: null, clientNom: 'Atelier Neuf', motif: 'prospect', derniereEnvoiLe: '2026-10-30', etat: 'envoyée', nbEnvoyees: 1 });
  const b = relance({ id: 'b', clientId: null, clientNom: 'Atelier Neuf', motif: 'prospect' });
  assert.equal(R_.verdictRelance(b, [a], VENDREDI_10H).raison, 'client');
});

await dit('point 6 — rien dans les 24 h qui suivent un échange humain', () => {
  const echange = paris('2026-10-30', '09:00');
  const v = R_.verdictRelance(relance(), [], VENDREDI_10H, REGLES_ESSAI, { dernierEchangeHumainAt: echange });
  assert.deepEqual([v.possible, v.raison], [false, 'echangeRecent']);
  assert.equal(v.prochaineLe, paris('2026-11-02', '08:00'), 'vendredi 09:00 + 24 h = samedi : lundi à l’ouverture');
  assert.equal(R_.verdictRelance(relance(), [], VENDREDI_10H, REGLES_ESSAI, { dernierEchangeHumainAt: echange - 25 * 3_600_000 }).possible, true, '25 h : permis');
});

await dit('H44 — un avis sans réponse met les relances en pause, 7 jours au plus', () => {
  const ctx = { avisEnAttenteDepuis: '2026-10-28' };
  const v = R_.verdictRelance(relance(), [], VENDREDI_10H, REGLES_ESSAI, ctx);
  assert.deepEqual([v.possible, v.raison, v.prochaineLe], [false, 'pauseAvis', paris('2026-11-04', '08:00')]);
  assert.equal(R_.verdictRelance(relance(), [], paris('2026-11-04', '09:00'), REGLES_ESSAI, ctx).possible, true, 'au bout de 7 jours, la pause cesse');
});

await dit('point 7 — la file : une relance n’entre que le jour permis, un seul départ par client (le plus gros montant)', () => {
  const file = R_.ordonnerFile([
    relance({ id: 'petite', objetId: 'f-1', montantCents: 10_000 }),
    relance({ id: 'grosse', objetId: 'f-2', montantCents: 900_000 }),
    relance({ id: 'autre', clientId: 2, clientNom: 'Autre', objetId: 'f-3', montantCents: 50_000 }),
    relance({ id: 'finie', clientId: 3, etat: 'répondue' }),
    relance({ id: 'plafonnee', clientId: 4, nbEnvoyees: 3, etat: 'envoyée', derniereEnvoiLe: '2026-09-01' }),
    relance({ id: 'prefere', clientId: 5, clientNom: 'Matinal' }),
  ], VENDREDI_10H, REGLES_ESSAI, new Map([['c:5', { preferences: { avant: '09:00' } }]]));
  assert.deepEqual(file.maintenant.map((e: any) => e.relance.id), ['grosse', 'autre']);
  assert.deepEqual(file.plusTard.map((e: any) => [e.relance.id, e.verdict.raison]), [['prefere', 'horsPlage'], ['petite', 'client']]);
  assert.deepEqual(file.plafond.map((e: any) => e.relance.id), ['plafonnee']);
  assert.deepEqual(file.terminees.map((e: any) => e.relance.id), ['finie']);
});

await dit('point 8 — rien ne part sans un clic humain ; refusé aussi si le verdict l’interdit', () => {
  assert.throws(() => R_.marquerEnvoyee(relance(), [], VENDREDI_10H, { clic: false }), /clic humain/);
  assert.throws(() => R_.marquerEnvoyee(relance(), [], VENDREDI_10H, {}), /clic humain/);
  const r = R_.marquerEnvoyee(relance(), [], VENDREDI_10H, clic);
  assert.deepEqual([r.etat, r.nbEnvoyees, r.derniereEnvoiLe], ['envoyée', 1, '2026-10-30']);
  assert.throws(() => R_.marquerEnvoyee(r, [], VENDREDI_10H, clic), /espacement/);
  assert.throws(() => R_.marquerEnvoyee(relance(), [], paris('2026-10-31', '10:00'), clic), /horsPlage/);
});

await dit('trois relances d’un même objet espacées de 7 jours, puis la quatrième est refusée', () => {
  let r = relance();
  let t = paris('2026-10-05', '10:00'); // lundi
  for (let i = 0; i < 3; i += 1) {
    r = R_.marquerEnvoyee(r, [], t, clic);
    t += 7 * J;
  }
  assert.equal(r.nbEnvoyees, 3);
  assert.equal(R_.verdictRelance(r, [], t).raison, 'plafond');
});

await dit('« Reporter à demain » : demain à l’ouverture, ou plus tard si une règle l’impose', () => {
  assert.equal(R_.reporterADemain(relance(), [], paris('2026-10-29', '10:00')), paris('2026-10-30', '08:00'));
  assert.equal(R_.reporterADemain(relance(), [], VENDREDI_10H), paris('2026-11-02', '08:00'), 'vendredi → lundi');
  const r = relance({ etat: 'envoyée', nbEnvoyees: 1, derniereEnvoiLe: '2026-10-29' });
  assert.equal(R_.reporterADemain(r, [], paris('2026-10-29', '10:00')), paris('2026-11-05', '08:00'), 'l’espacement prime');
});

await dit('la cadence d’un devis : départ, 1re relance, 2e, appel proposé, puis suivi à la main — jamais un week-end ni un férié', () => {
  const c = R_.cadence('2026-10-24');
  assert.deepEqual(c.map((e: any) => e.genre), ['depart', 'relance', 'relance', 'appel', 'manuel']);
  assert.deepEqual(c.slice(0, 4).map((e: any) => e.le), ['2026-10-24', '2026-10-30', '2026-11-06', '2026-11-13']);
  assert.deepEqual(c.slice(0, 4).map((e: any) => e.jourN), [0, 6, 13, 20]);
  assert.equal(c[4].le, undefined, 'le suivi à la main n’a pas de date');
  for (const e of c.filter((x: any) => x.le && x.genre !== 'depart')) assert.ok(!L.estFerie(e.le) && L.jourSemaine(e.le) <= 5, e.le);
  const cinq = R_.cadence('2026-10-24', L.reglesBornees({ espacementJours: 5 }), 6);
  assert.deepEqual(cinq.slice(1, 4).map((e: any) => e.le), ['2026-10-30', '2026-11-04', '2026-11-09']);
});

await dit('la file du jour : « 1 sur 5 traitée », la boîte à zéro, la série qui ignore week-ends et fériés', () => {
  assert.deepEqual(L.progressionFile(5, 1), { traitees: 1, total: 5, reste: 4, videe: false });
  assert.equal(L.progressionFile(5, 9).videe, true);
  assert.equal(L.progressionFile(0, 0).videe, false, 'une file vide dès le matin n’est pas « vidée »');
  // lundi 26 → jeudi 29 octobre vidés, vendredi 30 en cours : 4 jours de suite
  assert.equal(L.serieBoiteAZero(['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29'], '2026-10-30'), 4);
  assert.equal(L.serieBoiteAZero(['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30'], '2026-10-30'), 5);
  // vendredi 30 puis lundi 2 : le week-end ne casse pas la série ; le 11 nov. (férié) non plus
  assert.equal(L.serieBoiteAZero(['2026-10-29', '2026-10-30', '2026-11-02'], '2026-11-02'), 3);
  assert.equal(L.serieBoiteAZero(['2026-11-09', '2026-11-10', '2026-11-12'], '2026-11-12'), 3, 'le 11 nov. est férié');
  assert.equal(L.serieBoiteAZero(['2026-10-26', '2026-10-28'], '2026-10-30'), 0, 'un trou casse la série');
});

await dit('les phrases d’attente existent en fr et en, avec la date et les heures de la règle', () => {
  const v = R_.verdictRelance(relance(), [], paris('2026-10-31', '11:00'));
  assert.match(R_.phraseAttente(v, 'fr'), /02\/11 à 08:00.*08:00 et 19:00/);
  assert.match(R_.phraseAttente(v, 'en'), /02\/11 at 08:00.*08:00 and 19:00/);
  for (const raison of ['terminee', 'plafond', 'espacement', 'client', 'echangeRecent', 'pauseAvis', 'horsPlage']) {
    for (const langue of ['fr', 'en']) assert.ok(R_.phraseAttente({ possible: false, raison, prochaineLe: paris('2026-11-05', '09:00') }, langue).length > 10, `${raison} ${langue}`);
  }
});

/* ── Messages vers le client : vouvoiement ──────────────────────────────── */
console.log('\nContacts — ce qui part chez un client : vouvoiement\n');

const TUTOIEMENT = /\b(tu|toi|ton|ta|tes|te|t’|t')\b|\bt[’']/i;
const VOUVOIEMENT_UI = /(?<!rendez-)\b(vous|votre|vos|pourriez|souhaitez)\b/i;

await dit('les cinq messages de relance vouvoient et ne tutoient jamais, avec les chiffres de la relance', () => {
  for (const motif of ['facture', 'devis', 'rendez-vous', 'prospect', 'inactif']) {
    const m = L.messageClient(relance({ motif, objetLibelle: 'Objet X', montantCents: 123_400, departLe: '2026-10-01' }), 'fr', '2026-10-30');
    assert.match(m, /^Bonjour, /);
    assert.match(m, /Bien cordialement\.$/);
    assert.ok(/\bvous\b|\bvotre\b|\bnous\b/i.test(m), motif);
    assert.ok(!TUTOIEMENT.test(m), `${motif} tutoie : ${m}`);
  }
  const f = L.messageClient(relance({ objetLibelle: 'Facture F-001', montantCents: 123_400, departLe: '2026-10-01' }), 'fr', '2026-10-30');
  assert.match(f, /Facture F-001/);
  assert.match(f, /1\u00a0234,00\u00a0€|1\u00a0234\u00a0€/);
  assert.match(f, /01\/10\/2026/);
});

await dit('après une première relance, le message le dit ; le devis reprend la phrase de la fiche, avec le prénom', () => {
  assert.match(L.messageClient(relance({ nbEnvoyees: 1 }), 'fr', '2026-10-30'), /revenir vers vous/);
  assert.ok(!/revenir vers vous/.test(L.messageClient(relance({ nbEnvoyees: 0 }), 'fr', '2026-10-30')));
  assert.match(L.messageClient(relance({ motif: 'devis', objetLibelle: 'D-2026-117', departLe: '2026-10-24' }), 'fr', '2026-10-30', 'Karim'), /^Bonjour Karim, je reviens vers vous au sujet du devis D-2026-117 envoyé le 24\/10\/2026\. Avez-vous pu le parcourir/);
});

/* ── Fidélité ───────────────────────────────────────────────────────────── */
console.log('\nContacts — fidélité (MC02)\n');

await dit('paliers de la fiche : Bronze dès 0, Argent dès 800, Or dès 1 800', () => {
  for (const [pts, niv] of [[0, 'Bronze'], [799, 'Bronze'], [800, 'Argent'], [1799, 'Argent'], [1800, 'Or'], [9000, 'Or']] as const) assert.equal(L.niveauPour(pts), niv, String(pts));
  assert.equal(L.niveauPour(500), 'Bronze', '500 points ne suffisent plus pour Argent');
});

await dit('progression : points qui manquent, part dans le niveau, Or = plafond', () => {
  assert.deepEqual(L.progression(0), { niveau: 'Bronze', suivant: 'Argent', manque: 800, part: 0 });
  assert.deepEqual(L.progression(400), { niveau: 'Bronze', suivant: 'Argent', manque: 400, part: 0.5 });
  assert.deepEqual(L.progression(1300), { niveau: 'Argent', suivant: 'Or', manque: 500, part: 0.5 });
  assert.deepEqual(L.progression(1800), { niveau: 'Or', suivant: null, manque: null, part: 1 });
});

await dit('le programme : 1 € payé = 1 point, un avis = 50, un client recommandé = 200, sur 12 mois, rien de retiré', () => {
  const facture = { clientId: 1, status: 'paid', paidAt: '2026-06-01', lines: [{ id: 'l', label: 'x', quantity: 1, unitPriceCents: 10_000, vatRate: 20 }] };
  const base = { clientId: 1, factures: [facture], avis: [], recommandations: [] };
  assert.equal(L.pointsProgramme(base, '2026-10-30'), 120);
  assert.equal(L.pointsProgramme({ ...base, avis: ['2026-09-01', '2025-01-01'] }, '2026-10-30'), 170, 'l’avis d’il y a plus d’un an ne compte plus');
  assert.equal(L.pointsProgramme({ ...base, recommandations: ['2026-10-01'] }, '2026-10-30'), 320);
  assert.equal(L.pointsProgramme({ ...base, factures: [] }, '2026-10-30'), 0);
  assert.equal(L.pointsProgramme(base, '2026-10-30', { ...L.REGLES_PROGRAMME, pointsParEuro: 2 }), 240, 'le réglage s’applique');
});

await dit('« bientôt au palier suivant » : moins de 100 points du seuil ; la descente seulement après 12 mois, avec un message avant', () => {
  assert.deepEqual(L.bientotAuPalier(750), { manque: 50, vers: 'Argent' });
  assert.equal(L.bientotAuPalier(700), null, '100 points pile : pas encore');
  assert.equal(L.bientotAuPalier(1800), null);
  assert.deepEqual(L.descenteDePalier('2026-10-01', 'Or', '2026-10-30'), { descend: false, prevenir: false, vers: 'Argent' });
  assert.equal(L.descenteDePalier('2025-11-20', 'Or', '2026-10-30').prevenir, true, 'à moins de 30 jours de l’échéance');
  assert.equal(L.descenteDePalier('2025-12-01', 'Or', '2026-10-30').prevenir, false, 'encore loin');
  assert.deepEqual(L.descenteDePalier('2025-10-30', 'Argent', '2026-10-30'), { descend: true, prevenir: false, vers: 'Bronze' });
  assert.equal(L.descenteDePalier('2020-01-01', 'Bronze', '2026-10-30').descend, false, 'Bronze ne descend pas');
});

await dit('au plus 4 clients par barreau (les plus proches du palier suivant d’abord), les autres comptés', () => {
  const c = (points: number, j = '2026-10-01') => ({ points, derniereActiviteLe: j });
  const r = L.clientsAffiches([c(10), c(790), c(500), c(780), c(100), c(795, '2026-10-20')], L.PALIERS, 4);
  assert.deepEqual(r.affiches.map((x: any) => x.points), [795, 790, 780, 500]);
  assert.equal(r.autres, 2);
  assert.equal(L.partFideles(46, 72), 46 / 72);
  assert.equal(L.partFideles(0, 0), null);
});

await dit('deux formules : le choix de l’organisation, sinon tampons là où des cartes existent déjà, sinon points', () => {
  assert.equal(L.formuleDe('points', 12), 'points', 'le choix l’emporte');
  assert.equal(L.formuleDe('tampons', 0), 'tampons');
  assert.equal(L.formuleDe(null, 3), 'tampons', 'on ne retire rien à qui s’en sert');
  assert.equal(L.formuleDe(null, 0), 'points');
});

await dit('carte à tampons : 10 pour la récompense, bornée entre 0 et 10', () => {
  assert.deepEqual(L.progressionTampons(4), { tampons: 4, manque: 6, pleine: false });
  assert.deepEqual(L.progressionTampons(10), { tampons: 10, manque: 0, pleine: true });
  assert.deepEqual(L.progressionTampons(14), { tampons: 10, manque: 0, pleine: true });
  assert.deepEqual(L.progressionTampons(-2), { tampons: 0, manque: 10, pleine: false });
});

await dit('les points d’un client = euros TTC payés sur 12 mois, jamais une facture en attente, ancienne ou d’un autre client', () => {
  const facture = (o: Record<string, unknown>) => ({
    clientId: 1, status: 'paid', paidAt: '2026-06-01', lines: [{ id: 'l', label: 'x', quantity: 1, unitPriceCents: 10_000, vatRate: 20 }], ...o,
  });
  // 100 € HT + 20 % = 120 € TTC = 120 points
  assert.equal(L.pointsDe([facture({})], 1, '2026-10-30'), 120);
  assert.equal(L.pointsDe([facture({}), facture({})], 1, '2026-10-30'), 240);
  assert.equal(L.pointsDe([facture({ paidAt: '2025-10-29' })], 1, '2026-10-30'), 0, 'plus d’un an');
  assert.equal(L.pointsDe([facture({ paidAt: '2025-10-30' })], 1, '2026-10-30'), 120, 'tout juste un an');
  assert.equal(L.pointsDe([facture({ status: 'issued', paidAt: '' })], 1, '2026-10-30'), 0, 'en attente');
  assert.equal(L.pointsDe([facture({ clientId: 2 })], 1, '2026-10-30'), 0, 'autre client');
  assert.equal(L.pointsDe([facture({ lines: [{ id: 'l', label: 'x', quantity: 1, unitPriceCents: 9_999, vatRate: 0 }] })], 1, '2026-10-30'), 99, 'arrondi à l’euro inférieur');
});

for (const v of VOLUMES) {
  await dit(`SIM (${v}) : chaque compte de fidélité redonne ses points (factures, avis, recommandations) et son niveau, aux paliers de la fiche`, () => {
    const m = mondes[v];
    for (const c of m.fidelite) {
      const activite = {
        clientId: c.clientId,
        factures: m.factures,
        avis: m.avis.filter((a: any) => a.clientId === c.clientId).map((a: any) => a.date),
        recommandations: c.recommandations,
      };
      assert.equal(L.pointsProgramme(activite, m.contexte.aujourdhui), c.points, `${c.clientNom} : points`);
      assert.ok(L.niveauCoherent(c), `${c.clientNom} : ${c.points} → ${c.niveau}`);
      assert.equal(L.niveauPour(c.points), c.niveau);
      for (const r of c.recommandations) assert.ok(r <= m.contexte.aujourdhui && L.ecartJours(r, m.contexte.aujourdhui) <= 365, `${c.clientNom} : recommandation du ${r}`);
    }
    const r = L.resumeFidelite(m.fidelite, m.contexte.aujourdhui);
    assert.equal(r.total, m.fidelite.length);
    assert.equal(r.parNiveau.Bronze + r.parNiveau.Argent + r.parNiveau.Or, r.total);
  });
}

await dit('SIM (normal) : les trois paliers sont représentés, ce qui permet de contrôler les seuils 800 et 1 800', () => {
  const niveaux = new Set(mondes.normal.fidelite.map((c: any) => c.niveau));
  assert.deepEqual([...niveaux].sort(), ['Argent', 'Bronze', 'Or']);
  for (const c of mondes.normal.fidelite) assert.ok(c.niveau === 'Or' ? c.points >= 1800 : c.niveau === 'Argent' ? c.points >= 800 && c.points < 1800 : c.points < 800, c.clientNom);
});

/* ── Clients : statut et santé (fiche H05) ──────────────────────────────── */
console.log('\nContacts — statut et santé des clients (H05, G04)\n');

const cl = (o: Record<string, unknown> = {}) => ({ debutLe: '2025-01-10', dernierEchangeAt: '2026-10-28T10:00:00.000Z', sante: 80, ...o });

await dit('statut : Impayé au-delà de 7 jours de retard (prioritaire), À relancer à 7 jours ou moins, ou 5 jours sans échange, ou santé sous 45, Nouveau sous 30 jours', () => {
  const auj = '2026-10-30';
  assert.equal(L.statutClient(cl(), [8], auj), 'Impayé');
  assert.equal(L.statutClient(cl({ sante: 20 }), [30, 2], auj), 'Impayé', 'l’impayé l’emporte sur tout');
  assert.equal(L.statutClient(cl(), [7], auj), 'À relancer', '7 jours pile : encore « à relancer »');
  assert.equal(L.statutClient(cl(), [4], auj), 'À relancer');
  assert.equal(L.statutClient(cl({ dernierEchangeAt: '2026-10-24T10:00:00.000Z' }), [], auj), 'À relancer', '6 jours sans échange');
  assert.equal(L.statutClient(cl({ dernierEchangeAt: '2026-10-25T10:00:00.000Z' }), [], auj), 'Actif', '5 jours pile : encore actif');
  assert.equal(L.statutClient(cl({ sante: 44 }), [], auj), 'À relancer');
  assert.equal(L.statutClient(cl({ sante: 45 }), [], auj), 'Actif');
  assert.equal(L.statutClient(cl({ debutLe: '2026-10-10' }), [], auj), 'Nouveau');
  assert.equal(L.statutClient(cl({ debutLe: '2026-09-30' }), [], auj), 'Actif', '30 jours pile : plus nouveau');
  assert.equal(L.statutClient(cl({ debutLe: '2026-10-10', sante: 30 }), [], auj), 'À relancer', 'un nouveau à relancer reste à relancer');
});

await dit('santé : vert dès 70, orange de 45 à 69, rouge sous 45 ; libellés de G04 ; santé du portefeuille ; tri « à traiter d’abord »', () => {
  assert.deepEqual([100, 70, 69, 45, 44, 0].map((s) => L.couleurSante(s)), ['vert', 'vert', 'orange', 'orange', 'rouge', 'rouge']);
  assert.deepEqual([100, 85, 84, 70, 69, 45, 44].map((s) => L.libelleSante(s)), ['excellente', 'excellente', 'bonne', 'bonne', 'a-surveiller', 'a-surveiller', 'fragile']);
  assert.deepEqual(L.santeDuPortefeuille([90, 70, 60, 44, 10]), { bonne: 2, aSurveiller: 1, fragile: 2 });
  const e = (statut: string, retardMaxJours: number, sante: number, d: string) => ({ statut, retardMaxJours, sante, dernierEchangeAt: d });
  const l = [e('Actif', 0, 90, '2026-10-20'), e('À relancer', 3, 50, 'x'), e('Impayé', 10, 80, 'x'), e('Impayé', 40, 60, 'x'), e('À relancer', 1, 30, 'x'), e('Actif', 0, 90, '2026-10-29')];
  assert.deepEqual(l.sort(L.comparerATraiter).map((x: any) => [x.statut, x.retardMaxJours, x.sante]), [['Impayé', 40, 60], ['Impayé', 10, 80], ['À relancer', 1, 30], ['À relancer', 3, 50], ['Actif', 0, 90], ['Actif', 0, 90]]);
});

for (const v of VOLUMES) {
  await dit(`SIM (${v}) : la santé et le statut de chaque client se recalculent à l’identique depuis les factures, les devis et les avis`, () => {
    const m = mondes[v];
    const auj = m.contexte.aujourdhui;
    const comptes: Record<string, number> = {};
    for (const c of m.clients) {
      const sante = monde.calculerSante(c, { factures: m.factures, devis: m.devis, avis: m.avis }, auj);
      assert.equal(sante, c.sante, `${c.company || c.name} : santé`);
      assert.equal(L.santeClient(c, { factures: m.factures, devis: m.devis, avis: m.avis }, auj), c.sante, `${c.company || c.name} : santé recalculée (santeClient)`);
      const statut = L.statutClient(c, L.joursDeRetard(m.factures, c.id, auj), auj);
      assert.equal(statut, c.statutAffiche, `${c.company || c.name} : ${c.statutAffiche}`);
      comptes[statut] = (comptes[statut] ?? 0) + 1;
    }
    assert.equal(Object.values(comptes).reduce((a, b) => a + b, 0), m.clients.length);
  });
}

await dit('SIM (normal) : les quatre statuts de la fiche apparaissent dans le jeu', () => {
  const vus = new Set(mondes.normal.clients.map((c: any) => c.statutAffiche));
  assert.deepEqual([...vus].sort(), ['Actif', 'Impayé', 'Nouveau', 'À relancer']);
});

/* ── Rendez-vous ────────────────────────────────────────────────────────── */
console.log('\nContacts — rendez-vous clients (MC06)\n');

const ev = (o: Record<string, unknown> = {}) => ({
  id: 'e-x', title: 'Point', startAt: new Date(paris('2026-11-02', '10:00')).toISOString(), durationMin: 60, clientId: 1, clientName: 'Boulangerie Test',
  type: 'rendez-vous client', confirmation: 'confirmé', systeme: false, ...o,
});
const a = (j: string, h: string) => new Date(paris(j, h)).toISOString();

await dit('états : à venir, à confirmer, en cours, passé, manqué', () => {
  const t = paris('2026-11-02', '10:30');
  assert.equal(L.etatRendezVous(ev(), paris('2026-11-02', '08:00')), 'a-venir');
  assert.equal(L.etatRendezVous(ev({ confirmation: 'à confirmer' }), paris('2026-11-02', '08:00')), 'a-confirmer');
  assert.equal(L.etatRendezVous(ev(), t), 'en-cours');
  assert.equal(L.etatRendezVous(ev(), paris('2026-11-02', '11:00')), 'passe', 'fini pile à 11:00');
  assert.equal(L.etatRendezVous(ev({ confirmation: 'manqué' }), t), 'manque');
});

await dit('à confirmer : seulement les rendez-vous clients à venir dans l’horizon, par date ; jamais le système', () => {
  const liste = [
    ev({ id: 'tard', confirmation: 'à confirmer', startAt: a('2026-11-03', '09:00') }),
    ev({ id: 'tot', confirmation: 'à confirmer', startAt: a('2026-11-02', '09:00') }),
    ev({ id: 'loin', confirmation: 'à confirmer', startAt: a('2026-11-20', '09:00') }),
    ev({ id: 'ok', confirmation: 'confirmé' }),
    ev({ id: 'ronde', confirmation: 'à confirmer', systeme: true }),
    ev({ id: 'reunion', confirmation: 'à confirmer', type: 'réunion' }),
  ];
  assert.deepEqual(L.aConfirmer(liste, paris('2026-11-01', '12:00'), 3).map((e: any) => e.id), ['tot', 'tard']);
  assert.deepEqual(L.aConfirmer(liste, paris('2026-11-03', '12:00'), 3).map((e: any) => e.id), []);
});

await dit('chevauchements : bout à bout permis, empiètement signalé, manqués et système ignorés', () => {
  const l = [
    ev({ id: 'a', startAt: a('2026-11-02', '10:00'), durationMin: 60 }),
    ev({ id: 'b', startAt: a('2026-11-02', '11:00'), durationMin: 30 }),
    ev({ id: 'c', startAt: a('2026-11-02', '11:15'), durationMin: 30 }),
    ev({ id: 'd', startAt: a('2026-11-02', '11:20'), durationMin: 30, confirmation: 'manqué' }),
    ev({ id: 'e', startAt: a('2026-11-02', '11:20'), durationMin: 30, systeme: true }),
  ];
  assert.deepEqual(L.chevauchements(l).map(([x, y]: any) => `${x.id}${y.id}`), ['bc']);
});

await dit('créneaux libres : pas de 30 min dans 09:00–18:00, sans toucher un rendez-vous, durée entière dans la plage', () => {
  const l = [ev({ startAt: a('2026-11-02', '10:00'), durationMin: 60 }), ev({ startAt: a('2026-11-02', '16:30'), durationMin: 90 })];
  const hm = (t: number) => `${String(Math.floor(L.minutesParis(t) / 60)).padStart(2, '0')}:${String(L.minutesParis(t) % 60).padStart(2, '0')}`;
  const libres = L.creneauxLibres(l, '2026-11-02', { dureeMin: 60 }).map(hm);
  assert.deepEqual(libres, ['09:00', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30']);
  assert.deepEqual(L.creneauxLibres([], '2026-11-02', { dureeMin: 600 }), [], 'rien ne tient');
  const manque = [ev({ startAt: a('2026-11-02', '10:00'), confirmation: 'manqué' })];
  assert.ok(L.creneauxLibres(manque, '2026-11-02', { dureeMin: 60 }).includes(paris('2026-11-02', '10:00')), 'un manqué libère le créneau');
});

await dit('un rendez-vous manqué appelle une relance « rendez-vous » ; un autre non', () => {
  const r = L.relanceDepuisManque(ev({ confirmation: 'manqué', title: 'Visite' }));
  assert.deepEqual([r.motif, r.objetLibelle, r.etat, r.nbEnvoyees, r.departLe], ['rendez-vous', 'Visite', 'prête', 0, '2026-11-02']);
  assert.equal(L.relanceDepuisManque(ev()), null);
  assert.equal(L.relanceDepuisManque(ev({ confirmation: 'manqué', systeme: true })), null);
});

await dit('MC06 : la pause déjeuner = la plus longue plage libre de plus de 45 min entre 12:00 et 14:00', () => {
  const hm = (t: number | undefined) => (t == null ? null : `${String(Math.floor(L.minutesParis(t) / 60)).padStart(2, '0')}:${String(L.minutesParis(t) % 60).padStart(2, '0')}`);
  const lib = L.pauseDejeuner([ev({ startAt: a('2026-11-02', '11:00'), durationMin: 60 }), ev({ startAt: a('2026-11-02', '13:15'), durationMin: 30 })], '2026-11-02');
  assert.deepEqual([hm(lib.debut), hm(lib.fin)], ['12:00', '13:15'], '12:00 à 13:15 : 75 min');
  const trou = L.pauseDejeuner([ev({ startAt: a('2026-11-02', '12:00'), durationMin: 60 }), ev({ startAt: a('2026-11-02', '13:30'), durationMin: 60 })], '2026-11-02');
  assert.equal(trou, null, '13:00 à 13:30 : 30 min, trop court');
  assert.ok(L.pauseDejeuner([], '2026-11-02'), 'journée vide : pause entière');
  assert.equal(L.pauseDejeuner([ev({ startAt: a('2026-11-02', '12:00'), durationMin: 120 })], '2026-11-02'), null);
});

await dit('MC06 : les trajets — durée donnée par le service d’itinéraire, « départ conseillé », bloc trop juste, visio sans trajet', () => {
  const l = [
    ev({ id: 'm', startAt: a('2026-11-02', '09:00'), durationMin: 60 }),
    ev({ id: 'v', startAt: a('2026-11-02', '10:00'), durationMin: 30, mode: 'visio' }),
    ev({ id: 'n', startAt: a('2026-11-02', '11:00'), durationMin: 60 }),
    ev({ id: 'x', startAt: a('2026-11-02', '14:00'), durationMin: 60 }),
  ];
  const t = L.trajetsDeLaJournee(l, '2026-11-02', { m: 20, v: 99, n: 50, x: null });
  assert.deepEqual(t.map((x: any) => x.verId), ['m', 'n', 'x'], 'la visio n’a pas de trajet');
  assert.deepEqual(t.map((x: any) => x.tropJuste), [false, true, false], 'départ conseillé 10:10, mais la visio de 10:00 à 10:30 n’est pas finie : bloc orange');
  assert.equal(t[0].departConseille, paris('2026-11-02', '08:40'));
  assert.equal(t[1].departConseille, paris('2026-11-02', '10:10'));
  assert.deepEqual([t[2].dureeMin, t[2].departConseille, t[2].tropJuste], [null, null, false], 'lieu à préciser');
  const r = L.resumeJournee(l, '2026-11-02', { m: 20, n: 50, x: 30 }, 25);
  assert.deepEqual([r.rendezVous, r.trajetTotalMin], [4, 20 + 50 + 30 + 25]);
  assert.equal(r.finDeJournee, paris('2026-11-02', '15:25'));
  assert.deepEqual(L.resumeJournee([], '2026-11-02', {}), { rendezVous: 0, trajetTotalMin: 0, finDeJournee: null });
});

await dit('MC06 : « 13 sur 20 pris » = pris ÷ ouverts, null si rien d’ouvert', () => {
  assert.deepEqual(L.tauxReservation(20, 13), { pris: 13, ouverts: 20, part: 0.65 });
  assert.deepEqual(L.tauxReservation(0, 0), { pris: 0, ouverts: 0, part: null });
  assert.equal(L.tauxReservation(4, 9).part, 1, 'jamais plus de 100 %');
});

for (const v of VOLUMES) {
  await dit(`SIM (${v}) : les états des rendez-vous se recalculent, les manqués sont les manqués`, () => {
    const m = mondes[v];
    const clients = m.evenements.filter(L.estRendezVousClient);
    assert.ok(clients.every((e: any) => !e.systeme));
    assert.equal(L.manques(m.evenements).length, clients.filter((e: any) => e.confirmation === 'manqué').length);
    for (const e of clients) assert.ok(['a-venir', 'a-confirmer', 'en-cours', 'passe', 'manque'].includes(L.etatRendezVous(e, m.contexte.maintenant)));
    for (const x of L.aConfirmer(m.evenements, m.contexte.maintenant, 7)) assert.equal(x.confirmation, 'à confirmer');
  });
}

/* ── Contacts par client (source demandée par H41) ──────────────────────── */
console.log('\nContacts — contacts par client (source de H41, MC03, G04)\n');

const it = (o: Record<string, unknown>) => ({
  id: 'i-x', prenom: 'A', nom: 'B', nomComplet: 'A B', fonction: '', organisationType: 'client', organisationId: '1', organisationNom: 'Test', email: 'a@exemple.test',
  telephone: '06 39 98 00 01', notes: '', favori: false, dernierEchangeAt: '2026-10-01T10:00:00.000Z', nonLu: false, preference: 'courriel', ...o,
});

await dit('tri : favoris, puis le plus récemment joint, puis l’ordre alphabétique ; filtre par type ET identifiant', () => {
  const l = [
    it({ id: '1', nomComplet: 'Zoé' }), it({ id: '2', nomComplet: 'Anne', dernierEchangeAt: '2026-10-20T10:00:00.000Z' }), it({ id: '3', nomComplet: 'Marc', favori: true }),
    it({ id: '4', organisationId: '2' }), it({ id: '5', organisationType: 'fournisseur' }),
  ];
  assert.deepEqual(L.contactsParClient(l, 1).map((x: any) => x.id), ['3', '2', '1']);
  assert.deepEqual(L.contactsParClient(l, '2').map((x: any) => x.id), ['4']);
  assert.deepEqual(L.contactsParOrganisation(l, 'fournisseur', '1').map((x: any) => x.id), ['5']);
});

await dit('le résumé d’un client : principal, non lus, dernier échange, jours sans nouvelles ; client sans contact géré', () => {
  const c = L.contactsDuClient([it({ id: '1', nonLu: true }), it({ id: '2', favori: true, dernierEchangeAt: '2026-10-25T08:00:00.000Z' })], 1);
  assert.deepEqual([c.principal.id, c.nonLus, c.dernierEchangeAt], ['2', 1, '2026-10-25T08:00:00.000Z']);
  assert.equal(L.joursSansEchange(c, '2026-10-30'), 5);
  const vide = L.contactsDuClient([], 9);
  assert.deepEqual([vide.principal, vide.tous, vide.nonLus, L.joursSansEchange(vide, '2026-10-30')], [null, [], 0, null]);
});

await dit('moyen de joindre : la préférence, avec repli quand le champ manque ; « messagerie » (G07) n’est pas le courriel (MX01)', () => {
  assert.deepEqual(L.moyenDeJoindre(it({ preference: 'messagerie' })), { moyen: 'messagerie', valeur: 'a@exemple.test' });
  assert.deepEqual(L.moyenDeJoindre(it({ preference: 'messagerie', email: '' })), { moyen: 'téléphone', valeur: '06 39 98 00 01' });
  assert.deepEqual(L.moyenDeJoindre(it({ preference: 'téléphone' })), { moyen: 'téléphone', valeur: '06 39 98 00 01' });
  assert.deepEqual(L.moyenDeJoindre(it({ preference: 'téléphone', telephone: '' })), { moyen: 'courriel', valeur: 'a@exemple.test' });
  assert.deepEqual(L.moyenDeJoindre(it({ email: '', telephone: '06 39 98 00 01' })), { moyen: 'téléphone', valeur: '06 39 98 00 01' });
  assert.equal(L.moyenDeJoindre(it({ email: '', telephone: '' })), null);
});

for (const v of VOLUMES) {
  await dit(`SIM (${v}) : chaque interlocuteur d’un client appartient à une fiche client existante`, () => {
    const m = mondes[v];
    const ids = new Set(m.clients.map((c: any) => String(c.id)));
    const orphelins = m.interlocuteurs.filter((i: any) => i.organisationType === 'client' && !ids.has(i.organisationId)).map((i: any) => i.id);
    assert.deepEqual(orphelins, []);
    for (const c of m.clients) assert.ok(L.contactsDuClient(m.interlocuteurs, c.id).tous.every((i: any) => i.organisationType === 'client'));
  });
}

/* ── Ce qui se déduit des sources : les mêmes règles que le jeu de SIM ──── */
console.log('\nContacts — relances et fidélité déduites des sources (mêmes règles que SIM)\n');

for (const v of VOLUMES) {
  await dit(`SIM (${v}) : les relances à faire se déduisent des sources (cinq motifs), comme le jeu`, () => {
    const m = mondes[v];
    // Le jeu les a plafonnées (4 / 12 / 60) : on compare ce qu'il garde, dans l'ordre de MC07, aux premières déduites.
    const r = m.entreprise.reglages;
    const deduites = L.relancesDepuis(
      { aujourdhui: m.contexte.aujourdhui, clients: m.clients, factures: m.factures, devis: m.devis, evenements: m.evenements, prospects: m.prospects },
      { devisJours: r.delaiRelanceDevisJours, factureJours: r.delaiRelanceFactureJours, rendezVousJours: r.delaiRelanceRendezVousJours, prospectJours: r.delaiRelanceProspectJours, inactifJours: 30 },
    );
    const cle = (x: any) => `${x.motif}:${x.objetId}:${x.clientNom}`;
    assert.deepEqual(deduites.slice(0, m.relances.length).map(cle), m.relances.map(cle));
    assert.ok(deduites.length >= m.relances.length);
  });
  await dit(`SIM (${v}) : les comptes de fidélité se déduisent des sources (factures, avis), comme le jeu`, () => {
    const m = mondes[v];
    const recos = new Map<number, string[]>(m.fidelite.map((c: any) => [c.clientId, c.recommandations]));
    const deduits = L.fideliteDepuis({ aujourdhui: m.contexte.aujourdhui, clients: m.clients, factures: m.factures, avis: m.avis, recommandations: recos });
    const parClient = new Map(deduits.map((c: any) => [c.clientId, c]));
    for (const c of m.fidelite) {
      const d: any = parClient.get(c.clientId);
      assert.ok(d, `${c.clientNom} : absent des comptes déduits`);
      assert.deepEqual([d.points, d.niveau, d.derniereActiviteLe], [c.points, c.niveau, c.derniereActiviteLe], c.clientNom);
    }
  });
}

/* ── Les jeux de SIM : pipeline et relances aux quatre volumes ──────────── */
console.log('\nContacts — jeux fictifs de SIM\n');

for (const v of VOLUMES) {
  await dit(`SIM (${v}) : le pipeline range chaque prospect une fois, sans perdu dans les colonnes`, () => {
    const m = mondes[v];
    const cols = L.colonnesPipeline(m.prospects);
    const dedans = cols.flatMap((c: any) => c.prospects);
    assert.equal(dedans.length, m.prospects.filter((p: any) => p.etape !== 'perdu').length);
    assert.equal(new Set(dedans.map((p: any) => p.id)).size, dedans.length);
    const r = L.resumePipeline(m.prospects, m.contexte.aujourdhui);
    assert.equal(r.ouverts + r.gagnes + r.perdus, m.prospects.length);
    for (const c of cols) assert.equal(c.totalCents, c.prospects.reduce((s: number, p: any) => s + (p.montantCents ?? 0), 0));
  });
  await dit(`SIM (${v}) : la file de relances respecte les règles de la fiche (plafond, espacement, un client par semaine, jour ouvré non férié, plage), recalculées à part`, () => {
    const m = mondes[v];
    const file = L.ordonnerFile(m.relances, m.contexte.maintenant);
    const tous = [...file.maintenant, ...file.plusTard, ...file.plafond, ...file.terminees];
    assert.equal(tous.length, m.relances.length, 'aucune relance perdue');
    const parClient = new Map<string, number>();
    for (const { relance: r } of file.maintenant) {
      const j = L.jourDeInstant(m.contexte.maintenant);
      assert.ok(r.nbEnvoyees < 3, 'plafond');
      assert.ok(!r.derniereEnvoiLe || L.ecartJours(r.derniereEnvoiLe, j) >= L.REGLES_PAR_DEFAUT.espacementJours, `espacement ${r.id}`);
      assert.ok(r.etat !== 'répondue' && r.etat !== 'arrêtée');
      const k = L.cleClient(r);
      parClient.set(k, (parClient.get(k) ?? 0) + 1);
    }
    assert.ok([...parClient.values()].every((n) => n === 1), 'un seul départ par client');
    const j = L.jourDeInstant(m.contexte.maintenant);
    for (const { relance: r } of file.maintenant) {
      const recentes = m.relances.filter((o: any) => o.id !== r.id && L.cleClient(o) === L.cleClient(r) && o.derniereEnvoiLe && L.ecartJours(o.derniereEnvoiLe, j) < L.REGLES_PAR_DEFAUT.clientDelaiJours);
      assert.deepEqual(recentes, [], `une relance par client et par semaine : ${r.id}`);
    }
    assert.equal(file.maintenant.length === 0 || (L.jourSemaine(j) <= 5 && !L.estFerie(j)), true, 'jamais un week-end ni un jour férié');
    for (const { verdict } of file.plusTard) assert.ok(verdict.prochaineLe != null && verdict.prochaineLe > m.contexte.maintenant, 'une date future');
  });
}

/* ── Textes : deux voix ─────────────────────────────────────────────────── */
console.log('\nContacts — textes fr/en, tutoiement dans l’interface, vouvoiement vers les clients\n');

await dit('mêmes clés en fr et en, aucune vide, mêmes paramètres {x} dans les deux langues', () => {
  const en = Object.keys(DICO.en).sort();
  assert.deepEqual(Object.keys(DICO.fr).sort(), en);
  const params = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((x) => x[1]).sort().join(',');
  for (const k of en) {
    assert.ok(DICO.en[k].trim() && DICO.fr[k].trim(), k);
    assert.equal(params(DICO.fr[k]), params(DICO.en[k]), `paramètres de ${k}`);
  }
});

await dit('l’interface tutoie : aucune clé hors « client.* » ne vouvoie', () => {
  const fautes = Object.entries(DICO.fr as Record<string, string>).filter(([k, v]) => !k.startsWith('client.') && VOUVOIEMENT_UI.test(v)).map(([k, v]) => `${k} : ${v}`);
  assert.deepEqual(fautes, [], fautes.join('\n'));
});

await dit('ce qui part chez un client vouvoie : aucune clé « client.* » ne tutoie', () => {
  const fautes = Object.entries(DICO.fr as Record<string, string>).filter(([k, v]) => k.startsWith('client.') && TUTOIEMENT.test(v)).map(([k, v]) => `${k} : ${v}`);
  assert.deepEqual(fautes, [], fautes.join('\n'));
});

await dit('les comptes ont leurs deux formes (.1 et .n) dans les deux langues', () => {
  const bases = new Set(Object.keys(DICO.fr).filter((k) => /\.(1|n)$/.test(k)).map((k) => k.replace(/\.(1|n)$/, '')));
  for (const b of bases) for (const langue of ['fr', 'en']) assert.ok(DICO[langue][`${b}.1`] && DICO[langue][`${b}.n`], `${b} (${langue})`);
  assert.equal(L.direCompte('fr', 'relance.pretes', 1), '1 relance prête');
  assert.equal(L.direCompte('fr', 'relance.pretes', 4), '4 relances prêtes');
});

await dit('un encouragement quand une tâche est finie, jamais de reproche (Chaleur, REGLES.md)', () => {
  assert.match(DICO.fr['pipeline.signe'], /Bravo/);
  const reproches = Object.entries(DICO.fr as Record<string, string>).filter(([, v]) => /\b(retard de ta part|tu dois|tu as oublié|urgent !)/i.test(v));
  assert.deepEqual(reproches, []);
});

/* ── F10 : la vue d'ensemble ─────────────────────────────────────────────── */
console.log('\nContacts — F10, vue d’ensemble (chaleur, attentes, rendez-vous, modules)\n');

const base = (o: Record<string, unknown> = {}): any => ({
  maintenant: paris('2026-10-30', '10:42'), aujourdhui: '2026-10-30', moi: { prenom: 'Camille', email: 'camille@exemple.test' },
  clients: [], devis: [], factures: [], avis: [], evenements: [], prospects: [], relances: [], fidelite: [], fournisseurs: [], partenaires: [],
  equipe: [], presence: true, interlocuteurs: [], attentes: [], echanges: [], ...o,
});
const fiche = (id: number, jours: number, o: Record<string, unknown> = {}): any => ({
  id, name: `Client ${id}`, company: `Atelier ${id}`, status: 'active', statutAffiche: 'Actif', sante: 80, debutLe: '2025-01-10',
  dernierEchangeAt: new Date(paris('2026-10-30', '10:42') - jours * 86_400_000).toISOString(), ...o,
});
const facturePayee = (clientId: number, cents: number): any => ({ clientId, status: 'paid', paidAt: '2026-09-01', lines: [{ id: 'l', label: 'x', quantity: 1, unitPriceCents: cents, vatRate: 0 }] });
const devisVu = (id: number, clientId: number, cents: number, o: Record<string, unknown> = {}): any => ({ id, clientId, numero: `D-${id}`, status: 'sent', vuAt: '2026-10-25T10:00:00.000Z', acceptéLe: null, refuséLe: null, lignes: [{ id: 'l', label: 'x', quantity: 1, unitPriceCents: cents, vatRate: 0 }], ...o });

await dit('chaleur : Chaleureuse sous 7 jours, À entretenir de 7 à 29, Refroidie dès 30', () => {
  assert.deepEqual([0, 6, 7, 29, 30, 200].map((j) => H.bandeDeChaleur(j)), ['chaleureuse', 'chaleureuse', 'aEntretenir', 'aEntretenir', 'refroidie', 'refroidie']);
});

await dit('nuage : abscisse en trois bandes de 42 / 34 / 24 %, ordonnée de 5,0 (haut) à 3,0 (bas) dans les marges de l’image', () => {
  assert.deepEqual([0, 7, 30, 60, 90].map((j) => Math.round(N.positionX(j) * 1000) / 1000), [0, 0.42, 0.76, 1, 1]);
  const xs = Array.from({ length: 61 }, (_, j) => N.positionX(j));
  assert.ok(xs.every((x: number, i: number) => i === 0 || x >= xs[i - 1]), 'monotone');
  assert.equal(N.positionY(5), N.MARGE_HAUT);
  assert.equal(Math.round(N.positionY(3) * 1000) / 1000, Math.round((1 - N.MARGE_BAS) * 1000) / 1000);
  assert.equal(N.positionY(9), N.positionY(5), 'bornée');
  assert.equal(N.positionY(1), N.positionY(3), 'bornée');
  assert.ok(N.positionY(4) > N.positionY(5) && N.positionY(4) < N.positionY(3));
  assert.deepEqual([N.rayonDuPoint({ nomme: true, valeurCents: 0 }, 1000), N.rayonDuPoint({ nomme: true, valeurCents: 1000 }, 1000), N.rayonDuPoint({ nomme: false, valeurCents: 0 }, 1000), N.rayonDuPoint({ nomme: false, valeurCents: 1000 }, 1000)], [5, 9, 3, 4.5]);
});

await dit('nuage : deux noms ne se recouvrent jamais, et le point choisi n’écrit pas son nom (la bulle le dit)', () => {
  const pts = Array.from({ length: 8 }, (_, i) => ({ clientId: i, nom: `Client numéro ${i}`, jours: 1 + (i % 3), satisfaction: 5, satisfactionMoyenne: false, valeurCents: 1000 - i, nomme: true, bande: 'chaleureuse', statut: 'Actif' }));
  const vus = N.nomsAffiches(pts, 3);
  assert.ok(!vus.has(3));
  assert.ok(vus.size < pts.length, 'tous empilés au même endroit : certains noms doivent céder');
  const seuls = N.nomsAffiches([{ ...pts[0], jours: 2 }], null);
  assert.deepEqual([...seuls], [0], 'un nom sans voisin s’écrit');
});

await dit('« réchauffées cette semaine » : passés à une bande plus chaude depuis lundi 00:00 (vendredi 30 oct. → lundi 26)', () => {
  const lundi = paris('2026-10-26', '00:00');
  const il = (jours: number) => new Date(lundi - jours * 86_400_000).toISOString();
  const apres = new Date(paris('2026-10-28', '10:00')).toISOString();
  const src = base({
    clients: [fiche(1, 2, { dernierEchangeAt: apres }), fiche(2, 2, { dernierEchangeAt: apres }), fiche(3, 0, { dernierEchangeAt: apres }), fiche(4, 20)],
    echanges: [
      { clientId: 1, at: il(40) }, { clientId: 1, at: apres },    // refroidi lundi (40 j) → chaleureux : réchauffé
      { clientId: 2, at: il(2) }, { clientId: 2, at: apres },     // chaleureux lundi → chaleureux : pas de changement
      { clientId: 3, at: apres },                                 // aucun échange avant : « refroidi » → réchauffé
      { clientId: 4, at: il(20) },                                // 20 j : à entretenir, pas d'échange cette semaine
    ],
  });
  assert.equal(H.chaleurDesRelations(src).rechauffees, 2);
  assert.equal(H.lundiMinuit(paris('2026-10-30', '10:42')), lundi);
  assert.equal(H.lundiMinuit(paris('2026-11-01', '23:00')), lundi, 'dimanche : la semaine commencée lundi 26');
});

await dit('chaleur : un point par client, huit nommés au plus (les plus gros enjeux), satisfaction 3–5 ou moyenne en contour', () => {
  const clients = Array.from({ length: 12 }, (_, i) => fiche(i + 1, i * 3));
  const src = base({ clients, factures: clients.map((c: any, i: number) => facturePayee(c.id, (i + 1) * 100_000)), avis: [{ clientId: 1, noteSur5: 2, date: '2026-10-01' }, { clientId: 2, noteSur5: 5, date: '2026-10-02' }] });
  const c = H.chaleurDesRelations(src);
  assert.equal(c.total, 12);
  assert.equal(c.points.filter((p: any) => p.nomme).length, 8);
  assert.deepEqual(c.points.filter((p: any) => p.nomme).map((p: any) => p.clientId).sort((a: number, b: number) => a - b), [5, 6, 7, 8, 9, 10, 11, 12]);
  assert.equal(c.points[0].satisfaction, 3, 'une note de 2 se trace à 3,0');
  assert.equal(c.points[0].satisfactionMoyenne, false);
  assert.equal(c.points[3].satisfactionMoyenne, true, 'sans avis : la moyenne de l’espace, point en contour');
  assert.equal(c.parBande.chaleureuse + c.parBande.aEntretenir + c.parBande.refroidie, 12);
});

await dit('suggestion d’appel : devis envoyé, vu, non signé, chez un client qui s’est tu ; le plus gros d’abord ; jamais chez un chaleureux', () => {
  const clients = [fiche(1, 9), fiche(2, 12), fiche(3, 2), fiche(4, 40)];
  const devis = [devisVu(1, 1, 400_000), devisVu(2, 2, 900_000), devisVu(3, 3, 5_000_000), devisVu(4, 4, 100_000, { vuAt: null }), devisVu(5, 1, 700_000, { acceptéLe: '2026-10-27' })];
  const src = base({ clients, devis });
  const s = H.suggestionAppel(src, H.chaleurDesRelations(src));
  assert.deepEqual([s.clientId, s.jours, s.devis.numero, s.devis.cents], [2, 12, 'D-2', 900_000]);
  assert.equal(H.suggestionAppel(base({ clients: [fiche(3, 2)], devis: [devisVu(3, 3, 1)] }), H.chaleurDesRelations(base({ clients: [fiche(3, 2)] }))), null);
});

await dit('« Ils attendent une réponse » : la plus ancienne d’abord, barre = attente ÷ 4 h, orange au-delà de 2 h ; null = messagerie non branchée', () => {
  const now = paris('2026-10-30', '10:42');
  const a = (nom: string, min: number) => ({ clientId: 1, clientNom: nom, extrait: 'x', depuisMs: now - min * 60_000, canal: 'courriel' });
  const f = H.filesAttente([a('Dupont', 48), a('Cabinet Roux', 131), a('Boulangerie Léo', 65), a('Roux Santé', 22), a('Très long', 600)], now);
  assert.deepEqual(f.lignes.map((l: any) => l.nom), ['Très long', 'Cabinet Roux', 'Boulangerie Léo', 'Dupont', 'Roux Santé']);
  assert.deepEqual(f.lignes.map((l: any) => l.ton), ['attention', 'attention', 'neutre', 'neutre', 'neutre']);
  assert.deepEqual([f.lignes[0].barre, Math.round(f.lignes[1].barre * 1000) / 1000], [1, 0.546]);
  assert.equal(f.total, 5);
  assert.equal(H.filesAttente(null, now), null);
  assert.deepEqual(H.filesAttente([], now), { lignes: [], total: 0 });
  assert.deepEqual([22, 65, 131, 600, 3000].map((m) => H.dureeAttente(m)), ['22 min', '1 h 05', '2 h 11', '10 h 00', '2 j']);
  assert.deepEqual([H.initialesDe('Cabinet Roux'), H.initialesDe('Dupont'), H.initialesDe('Roux-Santé')], ['CR', 'DU', 'RS']);
});

await dit('prochains rendez-vous : fait, prochain (« dans 18 min »), à venir ; un manqué ou un événement du système n’y est pas ; pied = le prochain jour', () => {
  const equipe = [{ id: 'm1', prenom: 'Aaron', nom: 'X', nomComplet: 'Aaron X', initiales: 'AX', email: 'aaron@exemple.test', teinte: 2, statut: 'en ligne' }];
  const e = (id: string, jour: string, hm: string, o: Record<string, unknown> = {}): any => ({ id, title: `Sujet ${id}`, startAt: new Date(paris(jour, hm)).toISOString(), durationMin: 60, clientId: 1, clientName: `Client ${id}`, location: 'Paris', type: 'rendez-vous client', confirmation: 'confirmé', systeme: false, participants: ['aaron@exemple.test'], ...o });
  const src = base({
    equipe,
    clients: [fiche(1, 1)],
    devis: [devisVu(9, 1, 1000)],
    evenements: [e('a', '2026-10-30', '09:00'), e('b', '2026-10-30', '11:00'), e('c', '2026-10-30', '14:00', { durationMin: 90 }), e('d', '2026-10-30', '16:30', { durationMin: 45 }), e('x', '2026-10-30', '12:00', { confirmation: 'manqué' }), e('y', '2026-10-30', '13:00', { systeme: true }), e('z', '2026-10-30', '15:00', { type: 'réunion' }), e('s', '2026-11-02', '09:30'), e('t', '2026-11-03', '08:00')],
  });
  const f = H.friseDesRendezVous(src);
  assert.deepEqual(f.lignes.map((l: any) => [l.heure, l.etat]), [['09:00', 'fait'], ['11:00', 'prochain'], ['14:00', 'a-venir'], ['16:30', 'a-venir']]);
  assert.equal(f.total, 4);
  assert.equal(f.lignes[1].dansMin, 18);
  assert.deepEqual(f.lignes[1].etiquettes.map((x: any) => x.genre), ['dernierEchange', 'devisEnAttente']);
  assert.equal(f.lignes[1].etiquettes[0].jours, 1);
  assert.deepEqual(f.lignes[0].etiquettes, [], 'seul le prochain porte ses étiquettes');
  assert.deepEqual(f.lignes[0].responsable, { initiales: 'AX', teinte: 2 });
  assert.deepEqual([f.suivant.jour, f.suivant.heure], ['2026-11-02', '09:30'], 'le prochain jour : lundi 2 nov.');
  assert.equal(H.friseDesRendezVous(base()).suivant, null);
  assert.deepEqual([45, 60, 90, 150].map((m) => H.dureeRdv(m)), ['45 min', '1 h', '1 h 30', '2 h 30']);
});

await dit('les modules : trois groupes, aucune mesure inventée (null = « pas encore disponible »), « membres » quand la présence est inconnue', () => {
  const src = base({ clients: [fiche(1, 1, { statutAffiche: 'Impayé' }), fiche(2, 3)], interlocuteurs: null, partenaires: null, presence: false, equipe: [{ id: 'm', prenom: 'A', nom: '', nomComplet: 'A', initiales: 'A', email: 'a@exemple.test', teinte: 0, statut: 'hors ligne' }] });
  const g = H.groupesDuHub(src, H.chaleurDesRelations(src), H.friseDesRendezVous(src), '/fidelite');
  const tuile = (id: string) => g.flatMap((x: any) => x.tuiles).find((t: any) => t.id === id);
  assert.deepEqual(g.map((x: any) => x.cle), ['clients', 'developper', 'autour']);
  assert.deepEqual(tuile('clients').mesure.params, { n: 2, impayes: 1 });
  assert.equal(tuile('contactsFiches').disponible, false);
  assert.equal(tuile('contactsFiches').mesure, null);
  assert.equal(tuile('partenaires').disponible, false);
  assert.equal(tuile('directory').mesure.cle, 'tuile.equipe.membres');
  assert.equal(tuile('loyalty').vers, '/fidelite');
  assert.equal(tuile('reminders').mesure.cle, 'tuile.relances.aucune', 'aucune relance à envoyer : on le dit, calmement');
  assert.equal(tuile('aftersales').mesure, null);
});

await dit('la salutation suit l’heure (Chaleur) : bonjour avant midi, bon après-midi jusqu’à 18 h, bonsoir ensuite', () => {
  assert.deepEqual([paris('2026-10-30', '09:00'), paris('2026-10-30', '11:59'), paris('2026-10-30', '12:00'), paris('2026-10-30', '17:59'), paris('2026-10-30', '18:00')].map((t) => H.salutationDe(t)), ['bonjour', 'bonjour', 'apresMidi', 'apresMidi', 'bonsoir']);
});

for (const v of VOLUMES) {
  await dit(`SIM (${v}) : le modèle de la vue d’ensemble se construit et tient ses comptes`, () => {
    const m = mondes[v];
    const src = depuisMonde(m);
    const mod = H.modeleHub(src);
    assert.equal(mod.chaleur.total, m.clients.length);
    assert.equal(mod.chaleur.parBande.chaleureuse + mod.chaleur.parBande.aEntretenir + mod.chaleur.parBande.refroidie, m.clients.length);
    assert.ok(mod.chaleur.points.filter((p: any) => p.nomme).length <= 8);
    assert.ok(mod.chaleur.rechauffees <= m.clients.length);
    for (const p of mod.chaleur.points) assert.ok(p.satisfaction >= 3 && p.satisfaction <= 5 && p.jours >= 0);
    assert.equal(mod.groupes.flatMap((g: any) => g.tuiles).length, 13);
    assert.equal(mod.groupes[0].tuiles[0].mesure.params.n, m.clients.length);
    assert.equal(mod.frise.total, mod.frise.lignes.length);
    if (mod.attentes) for (let i = 1; i < mod.attentes.lignes.length; i += 1) assert.ok(mod.attentes.lignes[i - 1].attenteMin >= mod.attentes.lignes[i].attenteMin, 'la plus ancienne d’abord');
    if (mod.suggestion) {
      const p = mod.chaleur.points.find((x: any) => x.clientId === mod.suggestion.clientId);
      assert.notEqual(p.bande, 'chaleureuse');
    }
  });
}

await dit('F10 · textes : mêmes clés en fr et en, mêmes paramètres, comptes à deux formes, l’interface tutoie', () => {
  const en = Object.keys(DICO_HUB.en).sort();
  assert.deepEqual(Object.keys(DICO_HUB.fr).sort(), en);
  const params = (t: string) => [...t.matchAll(/\{(\w+)\}/g)].map((x) => x[1]).sort().join(',');
  for (const k of en) {
    assert.ok(DICO_HUB.en[k].trim() && DICO_HUB.fr[k].trim(), k);
    assert.equal(params(DICO_HUB.fr[k]), params(DICO_HUB.en[k]), `paramètres de ${k}`);
    assert.ok(!VOUVOIEMENT_UI.test(DICO_HUB.fr[k]), `${k} vouvoie : ${DICO_HUB.fr[k]}`);
  }
  for (const b of new Set(en.filter((k) => /\.(1|n)$/.test(k)).map((k) => k.replace(/\.(1|n)$/, '')))) for (const l of ['fr', 'en']) assert.ok(DICO_HUB[l][`${b}.1`] && DICO_HUB[l][`${b}.n`], `${b} (${l})`);
  assert.equal(DICO_HUB.fr['sousTitre.chaud'], '{salut} {prenom}, tes relations sont au chaud', 'la phrase de tutoiement.json');
  assert.equal(DICO_HUB.fr['modules.sousTitre'], 'ouvre, épingle ou masque', 'la phrase de tutoiement.json');
});

/* ── Structure ──────────────────────────────────────────────────────────── */
console.log('\nContacts — structure\n');

/** Tous les fichiers de la zone, en profondeur (`src/refonte/contacts/**`). */
function parcourir(dir: string): string[] {
  return fs.readdirSync(path.join(racine, dir), { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? parcourir(path.join(dir, e.name)) : [path.join(dir, e.name)]));
}
const fichiers = parcourir(ZONE).filter((f) => /\.(ts|tsx|css)$/.test(f));
const source = (f: string) => fs.readFileSync(path.join(racine, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
/** La LOGIQUE : les fichiers à la racine de la zone, les `modele.ts` des écrans et les sources — purs, sans React ni brique visuelle. */
const logique = fichiers.filter((f) => /\.ts$/.test(f) && (path.dirname(f) === ZONE || /(^|\/)(modele|nuage)\.ts$/.test(f) || (f.includes('/sources/') && !f.endsWith('depuisApp.ts'))) && !/i18n\.ts$/.test(f));
/** Les ÉCRANS : les sous-dossiers (`hub/`…), qui ont le droit de dessiner avec le socle. */
const ecrans = fichiers.filter((f) => path.dirname(f) !== ZONE && (!f.includes('/sources/') || f.endsWith('depuisApp.ts')));

await dit('la logique est pure : ni React, ni brique visuelle, ni code partagé, ni édition cliente', () => {
  const fautes: string[] = [];
  for (const f of logique) {
    for (const m of source(f).matchAll(/from\s+['"]([^'"]+)['"]/g)) {
      if (/socle\/ui|socle\/familles|\/screens\/|\/components\/|\/business\/|\.business|@edition|react|lucide/.test(m[1])) fautes.push(`${f} importe ${m[1]}`);
    }
  }
  assert.deepEqual(fautes, [], fautes.join('\n'));
});

await dit('les écrans ne touchent ni src/screens, ni src/business, ni l’édition cliente, ni la couture @edition', () => {
  const fautes: string[] = [];
  for (const f of ecrans.filter((x) => /\.tsx?$/.test(x))) {
    for (const m of source(f).matchAll(/from\s+['"]([^'"]+)['"]/g)) {
      if (/\/screens\/|\/business\/|\.business|@edition/.test(m[1])) fautes.push(`${f} importe ${m[1]}`);
    }
  }
  assert.deepEqual(fautes, [], fautes.join('\n'));
});

await dit('aucune lecture de l’horloge, aucun hasard, aucun réseau dans la logique ; les écrans ne lisent le stockage que par leurs hooks', () => {
  const fautes: string[] = [];
  for (const f of logique) {
    if (/Date\.now\s*\(|new Date\s*\(\s*\)|performance\.now|Math\.random|fetch\s*\(|localStorage|sessionStorage|XMLHttpRequest|process\.env/.test(source(f))) fautes.push(f);
  }
  for (const f of ecrans.filter((x) => /\.tsx?$/.test(x))) {
    if (/Math\.random|fetch\s*\(|XMLHttpRequest|process\.env/.test(source(f))) fautes.push(`${f} (écran)`);
  }
  assert.deepEqual(fautes, [], `horloge, hasard ou réseau dans : ${fautes.join(', ')}`);
});

await dit('aucune couleur écrite à la main dans les feuilles des écrans : jetons du socle seulement', () => {
  const fautes: string[] = [];
  for (const f of fichiers.filter((x) => x.endsWith('.css'))) {
    const css = fs.readFileSync(path.join(racine, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    const trouves = css.match(/#[0-9a-fA-F]{3,8}\b|rgba?\((?!0,\s*0,\s*0)[^)]*\)/g);
    if (trouves) fautes.push(`${f} : ${[...new Set(trouves)].join(' ')}`);
  }
  assert.deepEqual(fautes, [], fautes.join('\n'));
});

await dit('aucun nom réel, aucune adresse ni secret dans la zone, la note ou le rapport', () => {
  const lieux = [...fichiers, 'docs/refonte/preparation/LOT-02-contacts.md', 'docs/refonte/rapports/LOT-02-preparation.md'].filter((f) => fs.existsSync(path.join(racine, f)));
  const fautes: string[] = [];
  for (const f of lieux) {
    const s = fs.readFileSync(path.join(racine, f), 'utf8');
    if (/Syraagensy|NWSY|sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{12,}|\b\d{1,3}(\.\d{1,3}){3}\b|(?<![A-Za-z0-9.-])[a-z0-9-]+@(?!exemple\.test)[a-z0-9-]+\.(com|fr|net|org)\b/.test(s)) fautes.push(f);
  }
  assert.deepEqual(fautes, [], fautes.join(', '));
});

await dit('la zone est dans src/refonte/contacts/ et la garde est branchée dans package.json et editions.yml', () => {
  assert.match(fs.readFileSync(path.join(racine, 'package.json'), 'utf8'), /"check:contacts":\s*"[^"]*scripts\/check-contacts\.ts"/);
  assert.match(fs.readFileSync(path.join(racine, '.github/workflows/editions.yml'), 'utf8'), /npm run check:contacts/);
});

console.log('');
if (echecs > 0) {
  console.error(`ÉCHEC — ${echecs} contrôle(s) de LOT-02 en défaut sur ${vus + echecs}.`);
  process.exit(1);
}
console.log(`OK — ${vus} contrôles de LOT-02 tiennent.`);
process.exit(0);

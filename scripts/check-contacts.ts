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
  "export * as L from '../src/refonte/contacts';\nexport * as monde from '../src/refonte/donnees';\nexport { DICTIONNAIRES_CONTACTS } from '../src/refonte/contacts/i18n';\nexport * as V from '../src/refonte/connecteurs/reglages';\nexport * as H from '../src/refonte/contacts/hub/modele';\nexport * as N from '../src/refonte/contacts/hub/nuage';\nexport { DICTIONNAIRES_HUB } from '../src/refonte/contacts/hub/i18n';\nexport { depuisMonde } from '../src/refonte/contacts/sources/depuisMonde';\nexport * as C from '../src/refonte/contacts/clients/modele';\nexport { DICTIONNAIRES_CLIENTS } from '../src/refonte/contacts/clients/i18n';\nexport * as G from '../src/refonte/contacts/fiche/modele';\nexport { DICTIONNAIRES_FICHE } from '../src/refonte/contacts/fiche/i18n';\nexport * as P from '../src/refonte/contacts/prospects/modele';\nexport * as PN from '../src/refonte/contacts/prospects/nuage';\nexport { DICTIONNAIRES_PROSPECTS } from '../src/refonte/contacts/prospects/i18n';\nexport * as RT from '../src/refonte/contacts/retours/modele';\nexport { DICTIONNAIRES_RETOURS } from '../src/refonte/contacts/retours/i18n';\nexport * as FO from '../src/refonte/contacts/fournisseurs/modele';\nexport { DICTIONNAIRES_FOURNISSEURS } from '../src/refonte/contacts/fournisseurs/i18n';\nexport * as PL from '../src/refonte/contacts/pipeline/modele';\nexport * as PG from '../src/refonte/contacts/pipeline/geometrie';\nexport { DICTIONNAIRES_PIPELINE } from '../src/refonte/contacts/pipeline/i18n';\nexport * as FI from '../src/refonte/contacts/fidelite/modele';\nexport { DICTIONNAIRES_FIDELITE } from '../src/refonte/contacts/fidelite/i18n';\nexport * as PE from '../src/refonte/contacts/personnes/modele';\nexport { DICTIONNAIRES_CONTACTS_PERSONNES } from '../src/refonte/contacts/personnes/i18n';\nexport * as EQ from '../src/refonte/contacts/equipe/modele';\nexport { DICTIONNAIRES_EQUIPE } from '../src/refonte/contacts/equipe/i18n';",
);
const { L, monde, V, H, N, C, G, DICTIONNAIRES_HUB: DICO_HUB, DICTIONNAIRES_CLIENTS: DICO_CLIENTS, DICTIONNAIRES_FICHE: DICO_FICHE, P, PN, DICTIONNAIRES_PROSPECTS: DICO_PROSPECTS, RT, DICTIONNAIRES_RETOURS: DICO_RETOURS, FO, DICTIONNAIRES_FOURNISSEURS: DICO_FOURNISSEURS, PL, PG, DICTIONNAIRES_PIPELINE: DICO_PIPELINE, FI, DICTIONNAIRES_FIDELITE: DICO_FIDELITE, PE, DICTIONNAIRES_CONTACTS_PERSONNES: DICO_PERSONNES, EQ, DICTIONNAIRES_EQUIPE: DICO_EQUIPE, depuisMonde, DICTIONNAIRES_CONTACTS: DICO } = M;
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
  clients: [], devis: [], factures: [], avis: [], evenements: [], prospects: [], relances: [], fidelite: [], fournisseurs: [], achats: [], taches: [], partenaires: [],
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

/* ── H05 : Clients ──────────────────────────────────────────────────────── */
console.log('\nContacts — H05, Clients (mosaïque, segments, tris, prochaine chose)\n');

let compteurFactures = 0;
const factureH05 = (clientId: number, o: Record<string, unknown> = {}): any => ({
  id: `f-${clientId}-${++compteurFactures}`, clientId, number: `F-${2000 + clientId}`, status: 'issued', issuedAt: '2026-09-20', dueAt: '2026-10-20', paidAt: '',
  lines: [{ id: 'l', label: 'x', quantity: 1, unitPriceCents: 100_000, vatRate: 0 }], ...o,
});
const devisH05 = (id: number, clientId: number, o: Record<string, unknown> = {}): any => ({
  id, clientId, numero: `D-${id}`, status: 'sent', sentAt: '2026-10-24T10:00:00.000Z', vuAt: null, acceptéLe: null, refuséLe: null,
  lignes: [{ id: 'l', label: 'x', quantity: 1, unitPriceCents: 50_000, vatRate: 0 }], ...o,
});

await dit('H05 · segments : Tous, Actifs (statut actif), À relancer, Impayés — comptés sur les mêmes clients que la liste', () => {
  const src = base({
    clients: [fiche(1, 1), fiche(2, 2, { statutAffiche: 'Impayé' }), fiche(3, 3, { statutAffiche: 'À relancer' }), fiche(4, 4, { status: 'inactive' }), fiche(5, 5, { statutAffiche: 'Nouveau' })],
  });
  const m = C.modeleClients(src);
  assert.deepEqual(m.segments, { tous: 5, actifs: 4, aRelancer: 1, impayes: 1 });
  for (const [segment, attendu] of [['tous', 5], ['actifs', 4], ['aRelancer', 1], ['impayes', 1]] as const) {
    assert.equal(C.filtrerEtTrier(m, { segment, recherche: '', responsables: new Set(), tri: 'nom' }).length, attendu, segment);
  }
});

await dit('H05 · « à traiter d’abord » : impayés (le plus en retard d’abord), puis à relancer (le moins en santé d’abord), puis les autres par échange récent', () => {
  const src = base({
    clients: [
      fiche(1, 5, { statutAffiche: 'Actif' }), fiche(2, 1, { statutAffiche: 'Impayé' }), fiche(3, 1, { statutAffiche: 'Impayé' }),
      fiche(4, 1, { statutAffiche: 'À relancer', sante: 60 }), fiche(5, 1, { statutAffiche: 'À relancer', sante: 40 }), fiche(6, 1, { statutAffiche: 'Actif' }),
    ],
    factures: [factureH05(2, { dueAt: '2026-10-25' }), factureH05(3, { dueAt: '2026-10-01' })],
  });
  const ordre = C.filtrerEtTrier(C.modeleClients(src), { segment: 'tous', recherche: '', responsables: new Set(), tri: 'aTraiter' }).map((t: any) => t.id);
  assert.deepEqual(ordre, [3, 2, 5, 4, 6, 1]);
});

await dit('H05 · facturé sur 12 mois : factures émises ou payées des douze derniers mois, courbe de douze mois (le plus ancien d’abord)', () => {
  const src = base({
    clients: [fiche(1, 1)],
    factures: [
      factureH05(1, { status: 'paid', issuedAt: '2026-10-05', paidAt: '2026-10-10' }),       // ce mois-ci : 1 000 €
      factureH05(1, { status: 'issued', issuedAt: '2026-09-15', dueAt: '2026-12-01' }),       // septembre : 1 000 €
      factureH05(1, { status: 'paid', issuedAt: '2025-11-02', paidAt: '2025-11-05' }),        // il y a 11 mois : compté
      factureH05(1, { status: 'paid', issuedAt: '2025-10-02', paidAt: '2025-10-05' }),        // il y a 12 mois : hors fenêtre
      factureH05(1, { status: 'draft', issuedAt: '2026-10-06' }),                              // brouillon : jamais
    ],
  });
  const t = C.modeleClients(src).tuiles[0];
  assert.equal(t.factureCents, 300_000);
  assert.equal(t.courbe.length, 12);
  assert.equal(t.courbe[11], 100_000, 'dernier point : octobre');
  assert.equal(t.courbe[10], 100_000, 'septembre');
  assert.equal(t.courbe[0], 100_000, 'novembre de l’an dernier');
  assert.deepEqual(C.derniersMois('2026-10-30').slice(0, 2).concat(C.derniersMois('2026-10-30').slice(-1)), ['2025-11', '2025-12', '2026-10']);
});

await dit('H05 · prochaine chose : retard, rendez-vous du jour, devis vu, devis sans réponse, paiement attendu, sinon « client depuis »', () => {
  const rdv = (clientId: number, heure: string): any => ({ id: `e${clientId}`, clientId, type: 'rendez-vous client', systeme: false, confirmation: 'confirmé', startAt: new Date(paris('2026-10-30', heure)).toISOString(), durationMin: 45 });
  const src = base({
    clients: [fiche(1, 3), fiche(2, 3), fiche(3, 3), fiche(4, 3), fiche(5, 3), fiche(6, 3)],
    factures: [factureH05(1, { dueAt: '2026-10-10' }), factureH05(5, { dueAt: '2026-11-03' })],
    evenements: [rdv(2, '11:00')],
    devis: [devisH05(1, 3, { vuAt: '2026-10-28T09:00:00.000Z' }), devisH05(2, 4, { sentAt: '2026-10-20T09:00:00.000Z' })],
  });
  const genres = C.modeleClients(src).tuiles.map((t: any) => t.prochaine.genre);
  assert.deepEqual(genres, ['retard', 'rdv', 'devisVu', 'sansReponse', 'paiement', 'depuis']);
  const t1 = C.modeleClients(src).tuiles[0];
  assert.deepEqual(t1.prochaine.params, { numero: 'F-2001', jours: 20 });
  assert.equal(C.modeleClients(src).tuiles[1].rdvDuJour, true);
  assert.equal(C.modeleClients(src).prochainRdv.heure, '11:00');
});

await dit('H05 · recherche : nom, secteur, ville, sans accent ni casse ; le filtre « responsable » ne garde que les siens', () => {
  const src = base({
    clients: [fiche(1, 1, { company: 'Boulangerie Léo', secteur: 'Commerce', ville: 'Franconville', responsableEmail: 'a@exemple.test' }), fiche(2, 1, { company: 'Garage Benali', secteur: 'Garage', ville: 'Argenteuil', responsableEmail: 'b@exemple.test' })],
    equipe: [
      { id: 1, prenom: 'Alex', nom: 'T', nomComplet: 'Alex T', initiales: 'AT', email: 'a@exemple.test', teinte: 1, statut: 'en ligne' },
      { id: 2, prenom: 'Bea', nom: 'U', nomComplet: 'Bea U', initiales: 'BU', email: 'b@exemple.test', teinte: 2, statut: 'en ligne' },
    ],
  });
  const m = C.modeleClients(src);
  const cherche = (recherche: string, responsables: string[] = []) => C.filtrerEtTrier(m, { segment: 'tous', recherche, responsables: new Set(responsables), tri: 'nom' }).map((t: any) => t.id);
  assert.deepEqual(cherche('LEO'), [1]);
  assert.deepEqual(cherche('léo'), [1]);
  assert.deepEqual(cherche('argenteuil'), [2]);
  assert.deepEqual(cherche('commerce'), [1]);
  assert.deepEqual(cherche('zzz'), []);
  assert.deepEqual(cherche('', ['b@exemple.test']), [2]);
  assert.deepEqual(m.responsables.map((r: any) => r.initiales), ['AT', 'BU']);
});

await dit('H05 · pagination : 12 par page, « 1 à 12 sur 48 », dernière page partielle, page bornée', () => {
  const liste = Array.from({ length: 48 }, (_, i) => i);
  const p0 = C.pageDe(liste, 0);
  assert.deepEqual([p0.debut, p0.fin, p0.total, p0.pages, p0.elements.length], [1, 12, 48, 4, 12]);
  const p3 = C.pageDe(Array.from({ length: 50 }, (_, i) => i), 9);
  assert.deepEqual([p3.debut, p3.fin, p3.elements.length], [49, 50, 2]);
  assert.deepEqual([C.pageDe([], 0).debut, C.pageDe([], 0).fin], [0, 0]);
});

await dit('H05 · santé du portefeuille : 31 / 11 / 6 sur 48 en barre empilée ; « payé en avance » compte les clients, une fois chacun', () => {
  const parts = C.partsDeLaBarre({ bonne: 31, aSurveiller: 11, fragile: 6 });
  assert.equal(Math.round((parts.bonne + parts.aSurveiller + parts.fragile) * 1e6) / 1e6, 1);
  assert.equal(Math.round(parts.bonne * 1000) / 1000, 0.646);
  assert.deepEqual(C.partsDeLaBarre({ bonne: 0, aSurveiller: 0, fragile: 0 }), { bonne: 0, aSurveiller: 0, fragile: 0 });
  const src = base({
    clients: [fiche(1, 1, { sante: 90 }), fiche(2, 1, { sante: 50 }), fiche(3, 1, { sante: 10 })],
    factures: [
      factureH05(1, { status: 'paid', issuedAt: '2026-10-01', dueAt: '2026-10-20', paidAt: '2026-10-10' }),
      factureH05(1, { status: 'paid', issuedAt: '2026-10-02', dueAt: '2026-10-25', paidAt: '2026-10-12' }),
      factureH05(2, { status: 'paid', issuedAt: '2026-10-01', dueAt: '2026-10-20', paidAt: '2026-10-21' }),
      factureH05(3, { status: 'paid', issuedAt: '2026-09-01', dueAt: '2026-09-20', paidAt: '2026-09-10' }),
    ],
  });
  const m = C.modeleClients(src);
  assert.equal(m.payesEnAvance, 1, 'client 1 une fois ; client 2 en retard ; client 3 le mois dernier');
  assert.deepEqual(m.portefeuille, { bonne: 1, aSurveiller: 1, fragile: 1 });
});

await dit('H05 · sur les jeux de SIM (quatre volumes) : total = clients, segments cohérents, une tuile par client, tri stable', () => {
  for (const v of VOLUMES) {
    const m = C.modeleClients(depuisMonde(mondes[v]));
    assert.equal(m.total, mondes[v].clients.length, v);
    assert.equal(m.tuiles.length, m.total, v);
    assert.ok(m.segments.impayes + m.segments.aRelancer <= m.total, v);
    assert.equal(m.portefeuille.bonne + m.portefeuille.aSurveiller + m.portefeuille.fragile, m.total, v);
    const o1 = C.filtrerEtTrier(m, { segment: 'tous', recherche: '', responsables: new Set(), tri: 'aTraiter' }).map((t: any) => t.id);
    const o2 = C.filtrerEtTrier(m, { segment: 'tous', recherche: '', responsables: new Set(), tri: 'aTraiter' }).map((t: any) => t.id);
    assert.deepEqual(o1, o2, v);
    assert.equal(new Set(o1).size, m.total, v);
  }
});

await dit('H05 · textes : mêmes clés en fr et en, mêmes paramètres, comptes à deux formes, l’interface tutoie', () => {
  const en = Object.keys(DICO_CLIENTS.en).sort();
  assert.deepEqual(Object.keys(DICO_CLIENTS.fr).sort(), en);
  const params = (t: string) => [...t.matchAll(/\{(\w+)\}/g)].map((x) => x[1]).sort().join(',');
  for (const k of en) {
    assert.ok(DICO_CLIENTS.en[k].trim() && DICO_CLIENTS.fr[k].trim(), k);
    assert.equal(params(DICO_CLIENTS.fr[k]), params(DICO_CLIENTS.en[k]), `paramètres de ${k}`);
    assert.ok(!VOUVOIEMENT_UI.test(DICO_CLIENTS.fr[k]), `${k} vouvoie : ${DICO_CLIENTS.fr[k]}`);
  }
  for (const b of new Set(en.filter((k) => /\.(1|n)$/.test(k)).map((k) => k.replace(/\.(1|n)$/, '')))) for (const l of ['fr', 'en']) assert.ok(DICO_CLIENTS[l][`${b}.1`] && DICO_CLIENTS[l][`${b}.n`], `${b} (${l})`);
  assert.equal(DICO_CLIENTS.fr['sousTitre.rdv'], '{nom} t’attend à {heure}', 'la phrase de tutoiement.json');
});

/* ── G04 : Fiche client ─────────────────────────────────────────────────── */
console.log('\nContacts — G04, Fiche client (relation, ouvert, argent, ponctualité)\n');

const devisG04 = (id: number, clientId: number, o: Record<string, unknown> = {}): any => ({
  ...devisH05(id, clientId), createdAt: '2026-10-20T09:00:00.000Z', title: `Projet ${id}`, updatedAt: '2026-10-21T09:00:00.000Z', ...o,
});
const payee = (clientId: number, numero: string, emise: string, echeance: string, payeLe: string): any => factureH05(clientId, { number: numero, status: 'paid', issuedAt: emise, dueAt: echeance, paidAt: payeLe });
const srcG04 = (o: Record<string, unknown> = {}): any => base({ clients: [fiche(7, 2, { debutLe: '2025-12-01', secteur: 'Conseil', ville: 'Paris 8e', linkedSiteIds: [], phone: '', email: 'contact@exemple.test', siteWeb: '', adresse: '' })], ...o });

await dit('G04 · mois : de la première trace à aujourd’hui, « une relation de N mois » = écart de mois', () => {
  assert.deepEqual(G.moisEntre('2025-11', '2026-02'), ['2025-11', '2025-12', '2026-01', '2026-02']);
  assert.equal(G.nombreDeMois('2024-03', '2026-10'), 31);
  assert.equal(G.nombreDeMois('2026-10', '2026-10'), 1);
  const m = G.modeleFiche(srcG04({ devis: [devisG04(1, 7, { createdAt: '2026-04-02T09:00:00.000Z' })] }), 7);
  assert.equal(m.sousTitre.mois, 10, 'depuis le début de la fiche (déc. 2025) : le premier devis, plus tardif, n’avance pas la date');
});

await dit('G04 · ponctualité : écart payé − échéance, borné à ± 12, trait « en avance » si la moyenne est négative, « sans un jour de retard » sinon', () => {
  const avance = srcG04({ factures: [payee(7, 'F-1', '2026-06-01', '2026-06-30', '2026-06-20'), payee(7, 'F-2', '2026-07-01', '2026-07-30', '2026-07-10')] });
  const m = G.modeleFiche(avance, 7);
  assert.deepEqual(m.argent.ponctualite.map((p: any) => p.jours), [-10, -12], 'borné à −12');
  assert.equal(m.argent.moyenneJours, -15);
  assert.equal(m.sousTitre.trait, 'avance');
  const heure = G.modeleFiche(srcG04({ factures: [payee(7, 'F-1', '2026-06-01', '2026-06-30', '2026-06-30')] }), 7);
  assert.equal(heure.sousTitre.trait, 'sansRetard');
  const retard = G.modeleFiche(srcG04({ factures: [payee(7, 'F-1', '2026-06-01', '2026-06-30', '2026-07-05')] }), 7);
  assert.equal(retard.sousTitre.trait, null);
  assert.equal(retard.argent.ponctualite[0].aLHeure, false);
  assert.equal(G.modeleFiche(srcG04({ factures: [payee(7, 'F-1', '2026-06-01', '2026-06-30', '2026-06-30'), factureH05(7, { dueAt: '2026-10-01' })] }), 7).sousTitre.trait, null, 'une facture en retard retire le trait');
});

await dit('G04 · ce qui est ouvert : retard d’abord, puis rendez-vous, devis, factures ; un devis signé, un rendez-vous manqué ou à plus de 7 jours n’y est pas', () => {
  const rdv = (id: string, jour: string, heure: string, o: Record<string, unknown> = {}): any => ({ id, clientId: 7, type: 'rendez-vous client', systeme: false, confirmation: 'confirmé', title: 'Démonstration', mode: 'visio', startAt: new Date(paris(jour, heure)).toISOString(), durationMin: 45, ...o });
  const m = G.modeleFiche(srcG04({
    factures: [factureH05(7, { dueAt: '2026-10-26', number: 'F-2041' }), factureH05(7, { status: 'draft', number: 'F-2047' }), factureH05(7, { dueAt: '2026-11-20', number: 'F-2050' })],
    devis: [devisG04(1, 7, { vuAt: '2026-10-28T09:00:00.000Z' }), devisG04(2, 7, { status: 'accepted', acceptéLe: '2026-10-22' })],
    evenements: [rdv('a', '2026-10-30', '11:00'), rdv('b', '2026-10-30', '08:00'), rdv('c', '2026-10-31', '09:00', { confirmation: 'manqué' }), rdv('d', '2026-11-12', '09:00')],
  }), 7);
  assert.deepEqual(m.ouvert.map((o: any) => o.genre), ['factureRetard', 'rdv', 'devis', 'factureBrouillon', 'factureEmise']);
  assert.equal(m.ouvert[0].detail.jours, 4);
  assert.equal(m.ouvert[1].detail.heure, '11:00');
  assert.equal(m.ouvert[2].etat, 'vu');
  assert.deepEqual(m.sousTitre.rdv, { heure: '11:00' });
});

await dit('G04 · l’argent : facturé 12 mois, écart avec les 12 mois d’avant, en attente, panier moyen, prochaine facture = brouillon', () => {
  const m = G.modeleFiche(srcG04({
    factures: [
      factureH05(7, { status: 'paid', issuedAt: '2026-09-01', dueAt: '2026-09-30', paidAt: '2026-09-20', lines: [{ id: 'l', label: 'x', quantity: 1, unitPriceCents: 200_000, vatRate: 0 }] }),
      factureH05(7, { status: 'issued', issuedAt: '2026-10-01', dueAt: '2026-11-15', lines: [{ id: 'l', label: 'x', quantity: 1, unitPriceCents: 100_000, vatRate: 0 }] }),
      factureH05(7, { status: 'paid', issuedAt: '2025-06-01', dueAt: '2025-06-30', paidAt: '2025-06-25', lines: [{ id: 'l', label: 'x', quantity: 1, unitPriceCents: 200_000, vatRate: 0 }] }),
      factureH05(7, { status: 'draft', number: 'F-9', lines: [{ id: 'l', label: 'x', quantity: 1, unitPriceCents: 240_000, vatRate: 0 }] }),
    ],
  }), 7);
  assert.equal(m.argent.factureCents, 300_000);
  assert.equal(m.argent.deltaPourcent, 50, '300 000 contre 200 000');
  assert.equal(m.argent.enAttenteCents, 100_000);
  assert.equal(m.argent.panierCents, 150_000);
  assert.deepEqual(m.argent.prochaine, { numero: 'F-9', cents: 240_000 });
  assert.equal(G.modeleFiche(srcG04(), 7).argent.deltaPourcent, null, 'sans base de comparaison');
  assert.equal(G.modeleFiche(srcG04(), 7).argent.panierCents, null);
});

await dit('G04 · jalons : au plus quatre, le premier devis toujours, jamais deux libellés qui se recouvrent, les plus récents gardés', () => {
  const j = (indice: number, genre: string, jour: string) => ({ indice, genre, titre: `T${indice}`, jour });
  const candidats = [j(0, 'premier', '2024-03-01'), j(1, 'signe', '2024-04-01'), j(7, 'signe', '2024-10-01'), j(18, 'signe', '2025-09-01'), j(30, 'signe', '2026-09-01'), j(31, 'signe', '2026-10-01')];
  const gardes = G.choisirJalons(candidats, 21, 150);
  assert.ok(gardes.length <= 4);
  assert.equal(gardes[0].genre, 'premier');
  for (let i = 1; i < gardes.length; i += 1) assert.ok((gardes[i].indice - gardes[i - 1].indice) * 21 >= 150, `${gardes[i - 1].indice} / ${gardes[i].indice}`);
  assert.ok(gardes.some((g: any) => g.indice === 31), 'le plus récent est gardé');
  assert.ok(!gardes.some((g: any) => g.indice === 30), 'son voisin est écarté');
  assert.deepEqual(G.choisirJalons([], 21, 150), []);
});

await dit('G04 · client sans historique, sans interlocuteur, sans Garde, introuvable : états honnêtes', () => {
  const m = G.modeleFiche(srcG04({ clients: [fiche(7, 0, { debutLe: '2026-10-30', linkedSiteIds: [], phone: '', email: '', siteWeb: '', adresse: '' })] }), 7);
  assert.equal(m.sansHistorique, true);
  assert.equal(m.garde, null);
  assert.deepEqual(m.interlocuteurs, [], 'collection présente mais vide');
  assert.deepEqual(m.ouvert, []);
  assert.equal(G.modeleFiche(srcG04({ interlocuteurs: null }), 7).interlocuteurs, null, 'null = non disponible');
  assert.equal(G.modeleFiche(srcG04(), 999), null);
  assert.deepEqual(G.modeleFiche(srcG04({ clients: [fiche(7, 2, { linkedSiteIds: ['s1', 's2'], phone: '', email: '', siteWeb: '', adresse: '' })] }), 7).garde, { sites: 2 });
  assert.equal(G.modeleFiche(srcG04(), 7).documents, null, 'aucune source de documents');
});

await dit('G04 · sur les jeux de SIM (quatre volumes) : chaque fiche se construit, les comptes tiennent', () => {
  for (const v of VOLUMES) {
    const src = depuisMonde(mondes[v]);
    for (const c of src.clients.slice(0, 40)) {
      const m = G.modeleFiche(src, c.id);
      assert.ok(m, `${v} · ${c.id}`);
      assert.equal(m.relation.totaux.echanges, m.relation.mois.reduce((s: number, x: any) => s + x.echanges, 0));
      assert.ok(m.relation.mois.length >= 1);
      assert.ok(m.argent.ponctualite.length <= 12);
      assert.ok(m.argent.ponctualite.every((p: any) => p.jours >= -12 && p.jours <= 12));
      assert.ok(m.facteurs.length <= 2);
      assert.equal(m.sante, c.sante);
    }
  }
});

await dit('G04 · textes : mêmes clés en fr et en, mêmes paramètres, comptes à deux formes, l’interface tutoie', () => {
  const en = Object.keys(DICO_FICHE.en).sort();
  assert.deepEqual(Object.keys(DICO_FICHE.fr).sort(), en);
  const params = (t: string) => [...t.matchAll(/\{(\w+)\}/g)].map((x) => x[1]).sort().join(',');
  for (const k of en) {
    assert.ok(DICO_FICHE.en[k].trim() && DICO_FICHE.fr[k].trim(), k);
    assert.equal(params(DICO_FICHE.fr[k]), params(DICO_FICHE.en[k]), `paramètres de ${k}`);
    assert.ok(!VOUVOIEMENT_UI.test(DICO_FICHE.fr[k]), `${k} vouvoie : ${DICO_FICHE.fr[k]}`);
  }
  for (const b of new Set(en.filter((k) => /\.(1|n)$/.test(k)).map((k) => k.replace(/\.(1|n)$/, '')))) for (const l of ['fr', 'en']) assert.ok(DICO_FICHE[l][`${b}.1`] && DICO_FICHE[l][`${b}.n`], `${b} (${l})`);
  assert.equal(DICO_FICHE.fr['ouvert.titre'], 'Ce qui est ouvert');
});

/* ── H06 : Prospects ────────────────────────────────────────────────────── */
console.log('\nContacts — H06, Prospects (nuage intérêt × montant, appels de la semaine)\n');

const prospectH06 = (id: string, montantEuros: number, o: Record<string, unknown> = {}): any => prospect({ id, nom: `Prospect ${id}`, montantCents: montantEuros * 100, etape: 'devis envoyé', probabilite: 60, creeLe: '2026-10-28', ...o });
const signauxH06 = (lectures14j: number, delai: number | null, rdv: number, contact: number | null, ilYa14: number | null = null): any => ({ signaux: { lectures14j, delaiReponseHeures: delai, rendezVous: rdv, joursDepuisContact: contact }, interetIlYa14j: ilYa14, evenements: [] });

await dit('H06 · axe et rayon : plafond de 10 000 € au moins, arrondi à 2 500 € au-dessus du plus gros ; rayon = 5 + chance × 8 / 100', () => {
  assert.deepEqual([0, 820_000, 1_000_000, 1_020_000, 1_230_000].map((c) => P.plafondDAxe(c)), [1_000_000, 1_000_000, 1_000_000, 1_250_000, 1_250_000]);
  assert.deepEqual([0, 20, 70, 100].map((c) => Math.round(PN.rayonDuPoint(c) * 100) / 100), [5, 6.6, 10.6, 13]);
  assert.equal(PN.positionX(0), PN.INTERIEUR.x);
  assert.equal(PN.positionX(100), PN.INTERIEUR.x + PN.INTERIEUR.largeur);
  assert.equal(PN.positionY(1_000_000, 1_000_000), PN.INTERIEUR.y);
  assert.equal(PN.positionY(0, 1_000_000), PN.INTERIEUR.y + PN.INTERIEUR.hauteur);
  assert.equal(PN.positionX(250), PN.positionX(100), 'borné');
  assert.deepEqual(PN.graduationsMontant(1_000_000), [0, 250_000, 500_000, 750_000, 1_000_000]);
  assert.deepEqual([PN.TRACE.largeur, PN.TRACE.hauteur, PN.INTERIEUR.largeur, PN.INTERIEUR.hauteur], [736, 548, 656, 488]);
});

await dit('H06 · quadrant « à appeler » : intérêt ≥ 60 ET montant ≥ 3 000 € ; total et compteur ; appels ordonnés par intérêt × montant', () => {
  const src = base({ prospects: [prospectH06('a', 8200), prospectH06('b', 4200), prospectH06('c', 2700), prospectH06('d', 3000), prospectH06('e', 9000), prospectH06('f', 5000, { etape: 'gagné', signeLe: '2026-10-20' })] });
  const signaux = { a: signauxH06(4, 2, 2, 0), b: signauxH06(3, 10, 1, 2), c: signauxH06(4, 2, 2, 0), d: signauxH06(3, 8, 2, 1), e: signauxH06(0, null, 0, 40), f: signauxH06(4, 2, 2, 0) };
  const m = P.modeleProspects(src, signaux);
  assert.equal(m.total, 5, 'un prospect signé n’est plus en jeu');
  assert.deepEqual(m.points.filter((x: any) => x.prioritaire).map((x: any) => x.id).sort(), ['a', 'b', 'd']);
  assert.deepEqual(m.prioritaires, { n: 3, totalCents: (8200 + 4200 + 3000) * 100 });
  assert.equal(m.enJeuCents, (8200 + 4200 + 2700 + 3000 + 9000) * 100);
  assert.deepEqual(m.appels.map((x: any) => x.id), ['a', 'b', 'd'].sort((x, y) => { const v = (i: string) => m.points.find((p: any) => p.id === i); return v(y).interet * v(y).montantCents - v(x).interet * v(x).montantCents; }));
  assert.equal(m.estime, false);
  assert.equal(m.candidats.length, 0);
  assert.ok(m.points.find((x: any) => x.id === 'c').interet >= 60 && !m.points.find((x: any) => x.id === 'c').prioritaire, 'c est intéressé mais sous 3 000 €');
  assert.equal(m.points.find((x: any) => x.id === 'd').prioritaire, true, '3 000 € pile compte');
});

await dit('H06 · quadrant vide : les deux meilleurs candidats hors quadrant, par intérêt × montant', () => {
  const src = base({ prospects: [prospectH06('a', 1000), prospectH06('b', 2000), prospectH06('c', 2500)] });
  const m = P.modeleProspects(src, { a: signauxH06(1, 20, 0, 20), b: signauxH06(2, 12, 1, 10), c: signauxH06(0, null, 0, 40) });
  assert.equal(m.appels.length, 0);
  assert.deepEqual(m.candidats.map((x: any) => x.id), ['b', 'a'], 'c n’a aucun intérêt : produit nul');
});

await dit('H06 · traînée : l’intérêt d’il y a 14 jours, seulement si l’écart atteint 10 points', () => {
  const src = base({ prospects: [prospectH06('a', 5000), prospectH06('b', 5000)] });
  const m = P.modeleProspects(src, { a: signauxH06(4, 2, 2, 0, 20), b: signauxH06(4, 2, 2, 0, 95) });
  const [a, b] = ['a', 'b'].map((id) => m.points.find((x: any) => x.id === id));
  assert.equal(a.trainee, 20);
  assert.equal(b.trainee, null, 'moins de 10 points d’écart : pas de traînée');
});

await dit('H06 · sans signaux : l’intérêt est ESTIMÉ (étape et ancienneté), et le modèle le dit', () => {
  const src = base({ prospects: [prospectH06('a', 5000, { etape: 'nouveau', creeLe: '2026-10-29' }), prospectH06('b', 5000, { etape: 'devis envoyé', creeLe: '2026-10-01' })] });
  const m = P.modeleProspects(src, null);
  assert.equal(m.estime, true);
  assert.ok(m.points.every((x: any) => x.estime && x.signaux.length === 0 && x.trainee === null));
  const [a, b] = ['a', 'b'].map((id) => m.points.find((x: any) => x.id === id));
  assert.ok(a.interet !== b.interet);
  assert.deepEqual(P.signauxEstimes({ etape: 'nouveau', creeLe: '2026-10-20' }, '2026-10-30').signaux, { lectures14j: 0, delaiReponseHeures: null, rendezVous: 0, joursDepuisContact: 10 });
  assert.equal(P.signauxEstimes({ etape: 'devis envoyé', creeLe: '2026-10-20' }, '2026-10-30').signaux.rendezVous, 1);
  assert.equal(P.modeleProspects(src, { a: signauxH06(1, 1, 1, 1) }).points.find((x: any) => x.id === 'b').estime, true, 'un prospect sans signal reste estimé');
});

await dit('H06 · puces : « Les miens » = responsable connecté, « Nouveaux » = créés depuis 14 jours ; la liste va du plus intéressé au moins intéressé', () => {
  const src = base({ prospects: [prospectH06('a', 5000, { responsableEmail: 'camille@exemple.test', creeLe: '2026-10-25' }), prospectH06('b', 4000, { responsableEmail: 'autre@exemple.test', creeLe: '2026-08-01' }), prospectH06('c', 3000, { creeLe: '2026-10-29' })] });
  const m = P.modeleProspects(src, { a: signauxH06(0, null, 0, 20), b: signauxH06(4, 2, 2, 0), c: signauxH06(2, 12, 1, 10) });
  assert.deepEqual(m.chips, { tous: 3, miens: 1, nouveaux: 2 });
  assert.deepEqual(P.filtrerPoints(m.points, 'miens').map((x: any) => x.id), ['a']);
  assert.deepEqual(P.filtrerPoints(m.points, 'nouveaux').map((x: any) => x.id).sort(), ['a', 'c']);
  assert.deepEqual(P.listeParInteret(m.points).map((x: any) => x.id), ['b', 'c', 'a']);
});

await dit('H06 · étiquettes : aucune ne touche un point, une autre étiquette ou une légende ; elles restent dans le tracé ; le survolé n’en a pas', () => {
  const geom = Array.from({ length: 24 }, (_, i) => ({ id: `p${i}`, x: PN.positionX((i * 37) % 100), y: PN.positionY(((i * 53) % 10) * 100_000, 1_000_000), r: PN.rayonDuPoint(20 + ((i * 11) % 60)), nom: `Prospect numéro ${i}`, montant: `${1000 + i * 100} €`, prioritaire: i % 5 === 0, poids: 1000 + i }));
  const zones = PN.zonesDesLegendes(PN.rectangleQuadrant(60, 300_000, 1_000_000));
  const posees = PN.placerEtiquettes(geom, new Set(['p3']), zones);
  assert.ok(posees.size > 0 && posees.size < geom.length, 'certaines se taisent quand la place manque');
  assert.ok(!posees.has('p3'));
  const lst = [...posees.values()];
  const rect = (e: any) => ({ x0: e.x, x1: e.x + e.largeur, y0: e.y, y1: e.y + e.hauteur });
  const coupe = (a: any, b: any) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
  for (let i = 0; i < lst.length; i += 1) {
    const a = rect(lst[i]);
    assert.ok(a.x0 >= PN.INTERIEUR.x && a.x1 <= PN.INTERIEUR.x + PN.INTERIEUR.largeur && a.y0 >= PN.INTERIEUR.y && a.y1 <= PN.INTERIEUR.y + PN.INTERIEUR.hauteur, `${lst[i].id} dans le tracé`);
    for (let j = i + 1; j < lst.length; j += 1) assert.ok(!coupe(a, rect(lst[j])), `${lst[i].id} / ${lst[j].id}`);
    for (const z of zones) assert.ok(!coupe(a, { x0: z.x, x1: z.x + z.largeur, y0: z.y, y1: z.y + z.hauteur }), `${lst[i].id} sur une légende`);
    for (const g of geom) {
      const px = Math.max(a.x0, Math.min(g.x, a.x1)), py = Math.max(a.y0, Math.min(g.y, a.y1));
      assert.ok((px - g.x) ** 2 + (py - g.y) ** 2 >= g.r ** 2, `${lst[i].id} sur le point ${g.id}`);
    }
  }
  const seul = PN.placerEtiquettes([{ id: 'x', x: 300, y: 200, r: 8, nom: 'Seul', montant: '1 000 €', prioritaire: false, poids: 1 }]);
  assert.equal(seul.get('x').cote, 'droite', 'à droite par défaut');
});

await dit('H06 · semaine : les appels cochés se remettent à zéro le lundi ; pied encourageant : signatures du mois comparées aux cinq mois d’avant', () => {
  assert.deepEqual(['2026-10-26', '2026-10-30', '2026-11-01', '2026-11-02'].map((j) => P.lundiDe(j)), ['2026-10-26', '2026-10-26', '2026-10-26', '2026-11-02']);
  const signe = (id: string, jour: string) => prospectH06(id, 1000, { etape: 'gagné', signeLe: jour });
  const m = P.modeleProspects(base({ prospects: [signe('s1', '2026-10-02'), signe('s2', '2026-10-09'), signe('s3', '2026-10-16'), signe('s4', '2026-10-20'), signe('s5', '2026-09-01'), signe('s6', '2026-09-02'), signe('s7', '2026-09-03'), signe('s8', '2026-09-04')] }), null);
  assert.equal(m.signatures.ceMois, 4);
  assert.equal(m.signatures.fait.genre, 'egale-meilleur', '4 en octobre, 4 en septembre : comme ton meilleur mois');
  assert.equal(P.modeleProspects(base(), null).signatures.fait, null, 'aucune signature : rien à dire');
});

await dit('H06 · sur les jeux de SIM (quatre volumes) : le modèle se construit, les comptes tiennent, les intérêts sont entre 0 et 100', () => {
  for (const v of VOLUMES) {
    const src = depuisMonde(mondes[v]);
    const m = P.modeleProspects(src, null);
    assert.equal(m.total, src.prospects.filter((p: any) => p.etape !== 'gagné' && p.etape !== 'perdu').length, v);
    assert.ok(m.points.every((x: any) => x.interet >= 0 && x.interet <= 100), v);
    assert.equal(m.prioritaires.n, m.points.filter((x: any) => x.prioritaire).length, v);
    assert.ok(m.appels.every((x: any) => x.prioritaire), v);
    assert.equal(m.plafondCents % 250_000, 0, v);
    assert.ok(m.points.every((x: any) => x.montantCents <= m.plafondCents), v);
  }
});

await dit('H06 · textes : mêmes clés en fr et en, mêmes paramètres, comptes à deux formes, l’interface tutoie', () => {
  const en = Object.keys(DICO_PROSPECTS.en).sort();
  assert.deepEqual(Object.keys(DICO_PROSPECTS.fr).sort(), en);
  const params = (t: string) => [...t.matchAll(/\{(\w+)\}/g)].map((x) => x[1]).sort().join(',');
  for (const k of en) {
    assert.ok(DICO_PROSPECTS.en[k].trim() && DICO_PROSPECTS.fr[k].trim(), k);
    assert.equal(params(DICO_PROSPECTS.fr[k]), params(DICO_PROSPECTS.en[k]), `paramètres de ${k}`);
    assert.ok(!VOUVOIEMENT_UI.test(DICO_PROSPECTS.fr[k]), `${k} vouvoie : ${DICO_PROSPECTS.fr[k]}`);
  }
  for (const b of new Set(en.filter((k) => /\.(1|n)$/.test(k)).map((k) => k.replace(/\.(1|n)$/, '')))) for (const l of ['fr', 'en']) assert.ok(DICO_PROSPECTS[l][`${b}.1`] && DICO_PROSPECTS[l][`${b}.n`], `${b} (${l})`);
  assert.equal(DICO_PROSPECTS.fr['peek.rien'], 'Survole un point pour voir le détail');
});

/* ── H44 : Retours clients ─────────────────────────────────────────────── */
console.log('\nContacts — H44, Retours clients (recommandation, thèmes, mur de citations)\n');

const avisH44 = (id: string, note: number, o: Record<string, unknown> = {}): any => ({
  id, clientId: 7, clientNom: `Client ${id}`, noteSur5: note, recommandation: null, texte: `Avis ${id}`, date: '2026-10-20', themes: [], canal: 'courriel', sentiment: 'positif', ...o,
});

await dit('H44 · recommandent / neutres / déçus : note 0–10 (9-10, 7-8, 0-6) ou, sans elle, 5 étoiles / 4 / 3 ou moins', () => {
  assert.deepEqual([10, 9, 8, 7, 6, 0].map((r) => RT.categorie({ recommandation: r, noteSur5: 1 })), ['recommandent', 'recommandent', 'neutres', 'neutres', 'decus', 'decus']);
  assert.deepEqual([5, 4, 3, 1].map((n) => RT.categorie({ recommandation: null, noteSur5: n })), ['recommandent', 'neutres', 'decus', 'decus']);
  assert.equal(RT.categorie({ recommandation: 3, noteSur5: 5 }), 'decus', 'la note de recommandation passe devant les étoiles');
});

await dit('H44 · score = % recommandent − % déçus (70 − 8 = 62), parts arrondies pour sommer 100, jauge à (score + 100) ÷ 200 (81 %)', () => {
  const avis = [...Array.from({ length: 34 }, (_, i) => avisH44(`r${i}`, 5)), ...Array.from({ length: 11 }, (_, i) => avisH44(`n${i}`, 4)), ...Array.from({ length: 4 }, (_, i) => avisH44(`d${i}`, 2))];
  const r = RT.scoreDe(avis);
  assert.equal(r.parts.recommandent + r.parts.neutres + r.parts.decus, 100);
  assert.equal(r.score, r.parts.recommandent - r.parts.decus);
  const m = RT.modeleRetours(base({ avis }));
  assert.equal(m.score, r.score);
  assert.equal(m.remplissage, (r.score + 100) / 200);
  assert.deepEqual(RT.arrondirA100([1, 1, 1]), [34, 33, 33]);
  assert.deepEqual(RT.arrondirA100([0, 0, 0]), [0, 0, 0]);
  assert.equal(RT.scoreDe([]), null);
  assert.equal(RT.modeleRetours(base()).score, null);
  assert.equal(RT.modeleRetours(base()).remplissage, 0);
  assert.deepEqual([70, 62, 50, 49, 30, 29, 0, -1].map((s) => RT.libelleReco(s)), ['excellent', 'tresBon', 'tresBon', 'bon', 'bon', 'aAmeliorer', 'aAmeliorer', 'fragile']);
});

await dit('H44 · écart avec il y a 3 mois : positif = vert, nul = neutre, négatif = orange ; sans base, pas d’écart', () => {
  const ancien = [avisH44('a1', 3, { date: '2026-06-01' }), avisH44('a2', 3, { date: '2026-06-10' })];
  const recent = [avisH44('b1', 5, { date: '2026-10-10' }), avisH44('b2', 5, { date: '2026-10-12' })];
  const m = RT.modeleRetours(base({ avis: [...ancien, ...recent] }));
  assert.ok(m.delta != null && m.delta > 0, `delta ${m.delta}`);
  assert.equal(RT.modeleRetours(base({ avis: recent })).delta, null);
});

await dit('H44 · note moyenne sur 12 mois (une décimale), courbe de six mois, avis plus vieux qu’un an exclus', () => {
  const m = RT.modeleRetours(base({ avis: [avisH44('a', 5, { date: '2026-10-10' }), avisH44('b', 4, { date: '2026-10-11' }), avisH44('c', 4, { date: '2026-08-02' }), avisH44('d', 1, { date: '2025-09-01' })] }));
  assert.equal(m.noteMoyenne, 4.3);
  assert.equal(m.nbAvis, 3, 'l’avis de 2025-09 est hors fenêtre');
  assert.equal(m.courbe.length, 6);
  assert.deepEqual([m.courbe[5], m.courbe[3], m.courbe[4]], [4.5, 4, null]);
  assert.deepEqual(m.moisCourbe, ['2026-05', '2026-10']);
});

await dit('H44 · thèmes : part positive (4-5 étoiles) parmi les avis qui l’évoquent, les cinq plus cités, couleur 70 / 45 ; aucun thème = non disponible', () => {
  const lot = (theme: string, pos: number, neg: number) => [...Array.from({ length: pos }, (_, i) => avisH44(`${theme}p${i}`, 5, { themes: [theme] })), ...Array.from({ length: neg }, (_, i) => avisH44(`${theme}n${i}`, 2, { themes: [theme] }))];
  const m = RT.modeleRetours(base({ avis: [...lot('Rapidité', 12, 1), ...lot('Prix', 6, 4), ...lot('Exports', 2, 4), ...lot('A', 1, 0), ...lot('B', 1, 0), ...lot('C', 1, 0)] }));
  assert.equal(m.themes.length, 5);
  assert.deepEqual(m.themes.slice(0, 3).map((t: any) => [t.theme, t.avis, t.partPositive, t.couleur]), [['Rapidité', 13, 92, 'vert'], ['Prix', 10, 60, 'orange'], ['Exports', 6, 33, 'rouge']]);
  assert.equal(RT.modeleRetours(base({ avis: [avisH44('x', 5)] })).themes, null);
  assert.equal(RT.modeleRetours(base({ avis: [avisH44('x', 5)] })).collecte, null, 'collecte non suivie : non disponible');
});

await dit('H44 · « À répondre » : 3 étoiles ou moins, dans les 30 jours ; le plus récent est mis en avant, avec sa facture la plus en retard', () => {
  const src = base({
    avis: [avisH44('ok', 5, { date: '2026-10-28' }), avisH44('vieux', 2, { date: '2026-08-01' }), avisH44('a', 3, { date: '2026-10-21', clientId: 3, clientNom: 'Atelier Sarah' }), avisH44('b', 1, { date: '2026-10-05' })],
    factures: [factureH05(3, { number: 'F-2036', dueAt: '2026-09-26', lines: [{ id: 'l', label: 'x', quantity: 1, unitPriceCents: 64_000, vatRate: 0 }] }), factureH05(3, { number: 'F-2040', dueAt: '2026-10-20' })],
  });
  const m = RT.modeleRetours(src);
  assert.deepEqual(m.chips, { tous: 4, aRepondre: 2, cinqEtoiles: 1 });
  assert.equal(m.aRepondre.carte.id, 'a');
  assert.equal(m.aRepondre.depuisJours, 9);
  assert.deepEqual(m.aRepondre.factureEnRetard, { numero: 'F-2036', jours: 34, cents: 64_000 });
  assert.equal(RT.modeleRetours(base({ avis: [avisH44('ok', 5)] })).aRepondre, null);
  assert.deepEqual(RT.filtrerMur(m.avis, 'aRepondre', null).map((c: any) => c.id), ['a', 'b']);
  assert.deepEqual(RT.filtrerMur(m.avis, 'cinqEtoiles', null).map((c: any) => c.id), ['ok']);
  assert.deepEqual(RT.filtrerMur([...m.avis], 'tous', 'Rien').length, 0);
});

await dit('H44 · mur : trois colonnes, la carte à répondre seule au milieu, aucun avis perdu ni doublé, l’ordre du temps gardé dans chaque colonne', () => {
  const cartes = Array.from({ length: 9 }, (_, i) => ({ id: `c${i}`, client: 'X', clientId: 1, note: 5, positif: true, texte: 'x'.repeat(40 + i * 7), date: `2026-10-${String(28 - i).padStart(2, '0')}`, themes: [], initiale: 'X', aRepondre: i === 4 }));
  const [g, c, d] = RT.repartirMur(cartes, 'c4');
  assert.deepEqual(c.map((x: any) => x.id), ['c4']);
  assert.equal(g.length + c.length + d.length, 9);
  assert.equal(new Set([...g, ...c, ...d].map((x: any) => x.id)).size, 9);
  for (const col of [g, d]) assert.deepEqual(col.map((x: any) => x.date), [...col.map((x: any) => x.date)].sort().reverse());
  assert.ok(Math.abs(g.length - d.length) <= 1);
  const sans = RT.repartirMur(cartes, null);
  assert.ok(sans.every((col: any[]) => col.length >= 2));
});

await dit('H44 · export CSV : en-tête, une ligne par avis, guillemets doublés, cellule commençant par = + - @ neutralisée', () => {
  const csv = RT.csvDesAvis([{ id: 'a', client: '=HYPERLINK("x")', clientId: 1, note: 5, positif: true, texte: 'Il a dit « oui » ; "vraiment"', date: '2026-10-20', themes: ['Rapidité', 'Suivi'], initiale: 'H', aRepondre: false }]);
  const lignes = csv.replace('﻿', '').trim().split('\r\n');
  assert.equal(lignes[0], '"date";"client";"note_sur_5";"texte";"themes"');
  assert.ok(lignes[1].includes('"\'=HYPERLINK(""x"")"'), lignes[1]);
  assert.ok(lignes[1].includes('"Il a dit « oui » ; ""vraiment"""'));
  assert.ok(lignes[1].endsWith('"Rapidité | Suivi"'));
});

await dit('H44 · sur les jeux de SIM (quatre volumes) : le modèle se construit, parts = 100 ou 0, aucune carte perdue', () => {
  for (const v of VOLUMES) {
    const src = depuisMonde(mondes[v]);
    const m = RT.modeleRetours(src);
    assert.equal(m.avis.length, src.avis.length, v);
    assert.equal(m.parts.recommandent + m.parts.neutres + m.parts.decus, m.nbAvis === 0 ? 0 : 100, v);
    assert.equal(m.recommandent + m.neutres + m.decus, m.nbAvis, v);
    if (m.score != null) assert.ok(m.score >= -100 && m.score <= 100 && m.remplissage >= 0 && m.remplissage <= 1, v);
    const mur = RT.repartirMur(m.avis, m.aRepondre?.carte.id ?? null);
    assert.equal(mur[0].length + mur[1].length + mur[2].length, m.avis.length, v);
  }
});

await dit('H44 · textes : mêmes clés en fr et en, mêmes paramètres, comptes à deux formes, l’interface tutoie', () => {
  const en = Object.keys(DICO_RETOURS.en).sort();
  assert.deepEqual(Object.keys(DICO_RETOURS.fr).sort(), en);
  const params = (t: string) => [...t.matchAll(/\{(\w+)\}/g)].map((x) => x[1]).sort().join(',');
  for (const k of en) {
    assert.ok(DICO_RETOURS.en[k].trim() && DICO_RETOURS.fr[k].trim(), k);
    assert.equal(params(DICO_RETOURS.fr[k]), params(DICO_RETOURS.en[k]), `paramètres de ${k}`);
    assert.ok(!VOUVOIEMENT_UI.test(DICO_RETOURS.fr[k]), `${k} vouvoie : ${DICO_RETOURS.fr[k]}`);
  }
  for (const b of new Set(en.filter((k) => /\.(1|n)$/.test(k)).map((k) => k.replace(/\.(1|n)$/, '')))) for (const l of ['fr', 'en']) assert.ok(DICO_RETOURS[l][`${b}.1`] && DICO_RETOURS[l][`${b}.n`], `${b} (${l})`);
  assert.equal(DICO_RETOURS.fr['sousTitre'], 'Ce que tes clients pensent vraiment · {pos} avis positifs sur {n}', 'la phrase de tutoiement.json');
});

/* ── H45 : Fournisseurs ─────────────────────────────────────────────────── */
console.log('\nContacts — H45, Fournisseurs (matrice de comparaison, commandes en cours)\n');

const fourn = (id: string, delai: number, o: Record<string, unknown> = {}): any => ({ id, nom: `Fournisseur ${id}`, categorie: 'Réseau', contactNom: '', email: '', telephone: '', adresse: '', delaiAnnonceJours: delai, note: '', negociationLe: null, francoCents: null, fraisDePortCents: 0, ...o });
let compteurAchats = 0;
const achat = (fournisseurId: string, article: string, prixCents: number, o: Record<string, unknown> = {}): any => ({
  id: `a-${++compteurAchats}`, fournisseurId, commandeLe: '2026-09-01', recuLe: '2026-09-02', article, quantite: 10, prixUnitaireCents: prixCents, totalCents: prixCents * 10, conforme: true, ...o,
});

await dit('H45 · jours ouvrés : vendredi 30 oct. + 1 = lundi 2 nov. ; + 2 = mardi 3 ; + 9 = jeudi 12 nov.', () => {
  assert.deepEqual([0, 1, 2, 5, 9].map((n) => FO.ajouterJoursOuvres('2026-10-30', n)), ['2026-10-30', '2026-11-02', '2026-11-03', '2026-11-06', '2026-11-12']);
  assert.equal(FO.noteDePrix(129, 109), 84.5);
  assert.deepEqual([1, 2, 5, 11, 20].map((j) => FO.noteDeDelai(j)), [100, 90, 60, 0, 0]);
});

await dit('H45 · score = Σ note × poids sur les critères qui ont une donnée (la garantie, sans donnée, sort du score et les poids sont ramenés à 100)', () => {
  const src = base({ fournisseurs: [fourn('F1', 1), fourn('F2', 5)], achats: [achat('F1', 'Borne', 10_000), achat('F2', 'Borne', 20_000)] });
  const m = FO.modeleFournisseurs(src, { besoin: { article: 'Borne', quantite: 4, urgence: 'depannage' } });
  assert.deepEqual(m.poids, { prix: 39, delai: 33, qualite: 28, garantie: 0 });
  const [a, b] = ['F1', 'F2'].map((id) => m.colonnes.find((c: any) => c.id === id));
  assert.equal(a.score, 100);
  assert.equal(b.score, 67, '(35 × 50 + 30 × 60 + 25 × 100) ÷ 90');
  assert.equal(a.recommande, true);
  assert.equal(b.recommande, false);
  assert.equal(a.totalCents, 40_000);
  assert.equal(a.livraison, '2026-11-02');
  assert.deepEqual(a.meilleurs, { prix: true, total: true, delai: true, qualite: false }, 'qualité à égalité : pas de coche');
});

await dit('H45 · changer les poids change la recommandation : dépannage = le délai compte, équipement planifié = le prix compte', () => {
  const src = base({ fournisseurs: [fourn('F1', 1), fourn('F2', 9)], achats: [achat('F1', 'Borne', 15_000, { recuLe: '2026-09-02' }), achat('F2', 'Borne', 10_000, { recuLe: '2026-09-10' })] });
  const besoin = { article: 'Borne', quantite: 4 };
  const dep = FO.modeleFournisseurs(src, { besoin: { ...besoin, urgence: 'depannage' } });
  const pla = FO.modeleFournisseurs(src, { besoin: { ...besoin, urgence: 'planifie' } });
  assert.equal(dep.recommande.id, 'F1');
  assert.equal(pla.recommande.id, 'F2');
  assert.deepEqual(FO.POIDS_PAR_URGENCE.depannage, { prix: 35, delai: 30, qualite: 25, garantie: 10 });
  assert.deepEqual(FO.POIDS_PAR_URGENCE.planifie, { prix: 45, delai: 10, qualite: 30, garantie: 15 });
});

await dit('H45 · qualité = 70 % livrées dans le délai annoncé + 30 % conformes, sur 12 mois ; sans commande livrée, pas de note et le critère sort du score', () => {
  const a = (recu: string | null, conforme: boolean) => achat('F1', 'Borne', 10_000, { commandeLe: '2026-09-01', recuLe: recu, conforme });
  const src = base({ fournisseurs: [fourn('F1', 3), fourn('F2', 3)], achats: [a('2026-09-03', true), a('2026-09-04', false), a('2026-09-08', true), a('2026-09-02', false), achat('F2', 'Borne', 12_000, { recuLe: null })] });
  const m = FO.modeleFournisseurs(src, { besoin: { article: 'Borne', quantite: 1, urgence: 'depannage' } });
  assert.equal(m.colonnes.find((c: any) => c.id === 'F1').qualite, 68, '70 × 3/4 + 30 × 2/4 = 67,5');
  assert.equal(m.colonnes.find((c: any) => c.id === 'F2').qualite, null);
  assert.equal(m.colonnes.find((c: any) => c.id === 'F2').notes.qualite, undefined);
  const hors = FO.modeleFournisseurs(base({ fournisseurs: [fourn('F1', 3), fourn('F2', 3)], achats: [achat('F1', 'Borne', 1, { commandeLe: '2024-01-01', recuLe: '2024-01-02' }), achat('F1', 'Borne', 10_000), achat('F2', 'Borne', 11_000)] }), { besoin: { article: 'Borne', quantite: 1, urgence: 'depannage' } });
  assert.equal(hors.colonnes.find((c: any) => c.id === 'F1').prixCents, 10_000, 'les achats de plus d’un an ne comptent pas');
  const sansQualite = FO.modeleFournisseurs(base({ fournisseurs: [fourn('F1', 1), fourn('F2', 2)], achats: [achat('F1', 'Borne', 10_000, { recuLe: null }), achat('F2', 'Borne', 11_000, { recuLe: null })] }), { besoin: { article: 'Borne', quantite: 1, urgence: 'depannage' } });
  assert.equal(sansQualite.poids.qualite, 0);
  assert.equal(sansQualite.poids.prix + sansQualite.poids.delai, 100);
});

await dit('H45 · à moins de 3 points : « à égalité » sur les deux colonnes ; au-delà, une seule recommandée', () => {
  const src = base({ fournisseurs: [fourn('F1', 2), fourn('F2', 2), fourn('F3', 9)], achats: [achat('F1', 'Borne', 10_000), achat('F2', 'Borne', 10_100), achat('F3', 'Borne', 30_000, { recuLe: '2026-09-12' })] });
  const m = FO.modeleFournisseurs(src, { besoin: { article: 'Borne', quantite: 1, urgence: 'depannage' } });
  assert.deepEqual(m.colonnes.filter((c: any) => c.recommande).map((c: any) => c.id).sort(), ['F1', 'F2']);
  assert.ok(m.colonnes.filter((c: any) => c.recommande).every((c: any) => c.egalite));
  assert.equal(m.colonnes.find((c: any) => c.id === 'F3').recommande, false);
});

await dit('H45 · besoins proposés : les articles achetés chez au moins deux fournisseurs ; au plus quatre colonnes', () => {
  const src = base({ fournisseurs: ['F1', 'F2', 'F3', 'F4', 'F5', 'F6'].map((id) => fourn(id, 3)), achats: [...['F1', 'F2', 'F3', 'F4', 'F5', 'F6'].map((id) => achat(id, 'Câble', 1000)), achat('F1', 'Disque', 5000), achat('F2', 'Disque', 5200), achat('F1', 'Unique', 100)] });
  const m = FO.modeleFournisseurs(src);
  assert.deepEqual(m.besoins.map((b: any) => b.article), ['Câble', 'Disque']);
  assert.equal(m.besoin.article, 'Câble');
  assert.equal(m.colonnes.length, 4);
  assert.equal(m.besoin.quantite, 10);
  assert.equal(FO.modeleFournisseurs(src, { besoin: { article: 'disque', quantite: 2, urgence: 'planifie' } }).colonnes.length, 2, 'article trouvé sans tenir compte de la casse');
});

await dit('H45 · commandes en cours : les trois les plus proches de leur livraison, « N sur M dans les délais », retard en jours', () => {
  const o = (id: string, commandeLe: string) => achat('F1', `Article ${id}`, 1000, { id, commandeLe, recuLe: null });
  const m = FO.modeleFournisseurs(base({ fournisseurs: [fourn('F1', 3)], achats: [o('a', '2026-10-20'), o('b', '2026-10-29'), o('c', '2026-10-27'), o('d', '2026-10-30'), achat('F1', 'Livré', 1000)] }));
  assert.deepEqual(m.commandes.liste.map((c: any) => c.id), ['a', 'c', 'b']);
  assert.ok(m.commandes.liste[0].retardJours > 0);
  assert.equal(m.commandes.liste[2].retardJours, 0);
  assert.equal(m.commandes.dansLesDelais, m.commandes.liste.filter((c: any) => c.retardJours === 0).length);
  assert.deepEqual(FO.commandesEnCours(base({ achats: null })), { liste: [], dansLesDelais: 0 });
});

await dit('H45 · renégocier : le fournisseur de la plus forte dépense 12 mois, sans négociation enregistrée depuis un an ; sinon la carte « astuce »', () => {
  const src = base({ fournisseurs: [fourn('F1', 3, { negociationLe: '2026-06-01' }), fourn('F2', 3), fourn('F3', 3, { negociationLe: '2024-01-01' })], achats: [achat('F1', 'A', 90_000), achat('F2', 'B', 20_000), achat('F3', 'C', 50_000)] });
  const m = FO.modeleFournisseurs(src);
  assert.equal(m.renegocier.fournisseur, 'Fournisseur F3', 'F1 a été négocié il y a 5 mois : il passe son tour');
  assert.equal(m.renegocier.depenseCents, 500_000);
  assert.equal(FO.modeleFournisseurs(base({ fournisseurs: [fourn('F1', 3, { negociationLe: '2026-06-01' })], achats: [achat('F1', 'A', 1000)] })).renegocier, null);
});

await dit('H45 · sans historique d’achats : « non disponible » (null), jamais un zéro ; achats vides : disponible mais rien à comparer', () => {
  const m = FO.modeleFournisseurs(base({ achats: null, fournisseurs: [fourn('F1', 3)] }));
  assert.deepEqual([m.disponible, m.besoin, m.colonnes.length, m.recommande, m.renegocier], [false, null, 0, null, null]);
  assert.equal(m.total, 1);
  const vide = FO.modeleFournisseurs(base({ achats: [], fournisseurs: [fourn('F1', 3)] }));
  assert.deepEqual([vide.disponible, vide.besoin], [true, null]);
});

await dit('H45 · sur les jeux de SIM (quatre volumes) : le modèle se construit, les scores sont entre 0 et 100, une seule recommandée sauf égalité', () => {
  for (const v of VOLUMES) {
    const src = depuisMonde(mondes[v]);
    const m = FO.modeleFournisseurs(src);
    assert.equal(m.total, src.fournisseurs.length, v);
    assert.ok(m.colonnes.length <= 4, v);
    assert.ok(m.colonnes.every((c: any) => c.score == null || (c.score >= 0 && c.score <= 100)), v);
    const rec = m.colonnes.filter((c: any) => c.recommande);
    assert.ok(rec.length <= 1 || rec.every((c: any) => c.egalite), v);
    assert.equal(m.commandes.liste.length <= 3, true, v);
    for (const u of ['depannage', 'planifie']) assert.ok(FO.modeleFournisseurs(src, { urgence: u }), v);
  }
});

await dit('H45 · textes : mêmes clés en fr et en, mêmes paramètres, comptes à deux formes, l’interface tutoie', () => {
  const en = Object.keys(DICO_FOURNISSEURS.en).sort();
  assert.deepEqual(Object.keys(DICO_FOURNISSEURS.fr).sort(), en);
  const params = (t: string) => [...t.matchAll(/\{(\w+)\}/g)].map((x) => x[1]).sort().join(',');
  for (const k of en) {
    assert.ok(DICO_FOURNISSEURS.en[k].trim() && DICO_FOURNISSEURS.fr[k].trim(), k);
    assert.equal(params(DICO_FOURNISSEURS.fr[k]), params(DICO_FOURNISSEURS.en[k]), `paramètres de ${k}`);
    assert.ok(!VOUVOIEMENT_UI.test(DICO_FOURNISSEURS.fr[k]), `${k} vouvoie : ${DICO_FOURNISSEURS.fr[k]}`);
  }
  for (const b of new Set(en.filter((k) => /\.(1|n)$/.test(k)).map((k) => k.replace(/\.(1|n)$/, '')))) for (const l of ['fr', 'en']) assert.ok(DICO_FOURNISSEURS[l][`${b}.1`] && DICO_FOURNISSEURS[l][`${b}.n`], `${b} (${l})`);
  assert.equal(DICO_FOURNISSEURS.fr['actions.urgence.depannage'], 'Poids réglés pour un dépannage : le délai compte davantage.', 'la phrase de la fiche');
});

/* ── MC01 : Pipeline commercial ────────────────────────────────────────── */
console.log('\nContacts — MC01, Pipeline commercial (entonnoir, pastilles, prévision, sortie)\n');

const dealMC01 = (id: string, etape: string, euros: number | null, o: Record<string, unknown> = {}): any => prospect({ id, nom: `Opportunité ${id}`, etape, montantCents: euros == null ? null : euros * 100, creeLe: '2026-10-01', ...o });
const exemple = (): any[] => [
  dealMC01('n1', 'nouveau', 900), dealMC01('n2', 'nouveau', 650), dealMC01('n3', 'nouveau', 350),
  dealMC01('r1', 'rendez-vous', 480), dealMC01('r2', 'rendez-vous', 420),
  dealMC01('d1', 'devis envoyé', 12_400), dealMC01('d2', 'devis envoyé', 3_200),
  dealMC01('s1', 'gagné', 2_800, { signeLe: '2026-10-05' }), dealMC01('s2', 'gagné', 1_600, { signeLe: '2026-10-12' }), dealMC01('s3', 'gagné', 1_100, { signeLe: '2026-10-20' }), dealMC01('s4', 'gagné', 700, { signeLe: '2026-10-27' }),
];

await dit('MC01 · l’exemple de la fiche : 18 400 € en jeu (signé exclu), prévision 9 320 € = Σ montant × chance, lignes 8 580 / 360 / 380', () => {
  const m = PL.modeleEntonnoir(base({ prospects: exemple() }), { objectifCents: 800_000 });
  assert.equal(m.enJeuCents, 1_840_000);
  assert.equal(m.prevision.totalCents, 932_000);
  assert.deepEqual(m.prevision.contributions.map((c: any) => [c.colonne, c.cents]), [['Nouveau', 38_000], ['Rendez-vous', 36_000], ['Devis envoyé', 858_000]]);
  assert.deepEqual(m.etapes.map((e: any) => [e.numero, e.nb, e.totalCents, e.chance]), [['01', 3, 190_000, 20], ['02', 2, 90_000, 40], ['03', 2, 1_560_000, 55]]);
  assert.deepEqual(m.sortie, { lignes: m.sortie.lignes, nb: 4, totalCents: 620_000 });
  assert.deepEqual(m.objectif, { objectifCents: 800_000, signeCents: 620_000, reste: 180_000, atteint: false, part: 0.775 });
});

await dit('MC01 · rayon = 9 + 0,34 × √montant (surface proportionnelle) : 12 400 € ≈ 46,9 ; 350 € ≈ 15,4 ; sans montant = 9', () => {
  assert.deepEqual([1_240_000, 35_000, null, 0].map((c) => Math.round(PL.rayonDePastille(c) * 10) / 10), [46.9, 15.4, 9, 9]);
  const grande = PL.rayonDePastille(1_240_000) - 9;
  const petite = PL.rayonDePastille(35_000) - 9;
  assert.ok(Math.abs((grande / petite) ** 2 - 1_240_000 / 35_000) < 0.01, 'le rayon moins 9 suit la racine du montant');
  const m = PL.modeleEntonnoir(base({ prospects: exemple() }));
  assert.equal(m.etapes[2].pastilles.find((p: any) => p.id === 'd1').grande, true);
  assert.equal(m.etapes[0].pastilles.find((p: any) => p.id === 'n3').grande, false);
});

await dit('MC01 · objectif : « encore N » ; atteint = vert ; sans objectif = « Fixez votre objectif » (null) ; la sortie ne liste que le mois civil', () => {
  const src = base({ prospects: [...exemple(), dealMC01('s0', 'gagné', 5_000, { signeLe: '2026-09-15' })] });
  assert.equal(PL.modeleEntonnoir(src).objectif, null);
  const atteint = PL.modeleEntonnoir(src, { objectifCents: 500_000 });
  assert.deepEqual([atteint.objectif.atteint, atteint.objectif.reste, atteint.objectif.part], [true, 0, 1]);
  assert.equal(PL.modeleEntonnoir(src).sortie.nb, 4, 'octobre seulement');
  assert.equal(PL.modeleEntonnoir(src, { periode: 'trimestre' }).sortie.nb, 5, '90 jours : septembre y entre');
  assert.equal(PL.modeleEntonnoir(src, { periode: 'tout' }).sortie.totalCents, 1_120_000);
});

await dit('MC01 · taux de passage : sans historique de mouvements = null (« — »), avec = entrées dans l’étape suivante ÷ entrées, 90 jours', () => {
  const src = base({ prospects: exemple() });
  const sans = PL.modeleEntonnoir(src);
  assert.equal(sans.tauxIndisponibles, true);
  assert.ok(sans.etapes.every((e: any) => e.taux === null));
  assert.equal(sans.passagePourcent, null);
  const mv = [
    ...['a', 'b', 'c', 'd', 'e'].map((id) => ({ prospectId: id, vers: 'nouveau', le: '2026-10-01' })),
    ...['a', 'b', 'c'].map((id) => ({ prospectId: id, vers: 'rendez-vous', le: '2026-10-10' })),
    { prospectId: 'a', vers: 'devis envoyé', le: '2026-10-20' },
    { prospectId: 'z', vers: 'nouveau', le: '2025-01-01' },
  ];
  const m = PL.modeleEntonnoir(src, { mouvements: mv });
  assert.equal(m.tauxIndisponibles, false);
  assert.equal(m.etapes[0].taux, 0.6);
  assert.equal(Math.round(m.etapes[1].taux * 100), 33);
  assert.equal(m.passagePourcent, 60);
});

await dit('MC01 · « N j sans réponse » : devis envoyé depuis 5 jours ou plus ; la suggestion est le plus gros ; âge moyen dans l’étape (ou depuis la création sans date d’entrée)', () => {
  const src = base({ prospects: exemple(), entreesEtape: { d1: '2026-10-24', d2: '2026-10-10', r1: '2026-10-28', r2: '2026-10-26', n1: '2026-10-29' } });
  const m = PL.modeleEntonnoir(src);
  assert.equal(m.etapes[2].pastilles.find((p: any) => p.id === 'd1').sansReponse, 6);
  assert.equal(m.etapes[2].pastilles.find((p: any) => p.id === 'd2').sansReponse, 20);
  assert.deepEqual(m.suggestion, { id: 'd1', nom: 'Opportunité d1', cents: 1_240_000, jours: 6 }, 'le plus gros montant d’abord');
  assert.equal(m.etapes[1].ageMoyenJours, 3, '(2 + 4) ÷ 2');
  assert.equal(m.ageDepuisCreation, false);
  const sansDates = PL.modeleEntonnoir(base({ prospects: exemple() }));
  assert.equal(sansDates.ageDepuisCreation, true);
  assert.equal(sansDates.etapes[0].ageMoyenJours, 29);
  assert.equal(PL.modeleEntonnoir(base({ prospects: [dealMC01('n1', 'nouveau', 100)] })).suggestion, null, 'sans cas : la carte « astuce »');
});

await dit('MC01 · au-delà du plus lisible, les plus petites se regroupent en « + N » (les plus grosses restent), le compte de l’étape reste entier', () => {
  const src = base({ prospects: Array.from({ length: 9 }, (_, i) => dealMC01(`n${i}`, 'nouveau', 100 * (i + 1))) });
  const e = PL.modeleEntonnoir(src).etapes[0];
  assert.equal(e.nb, 9);
  assert.equal(e.pastilles.length, PL.MAX_PAR_ETAPE.Nouveau);
  assert.equal(e.pastilles.length + e.regroupees.length, 9);
  assert.ok(Math.min(...e.pastilles.map((p: any) => p.montantCents)) > Math.max(...e.regroupees.map((p: any) => p.montantCents)));
  assert.equal(e.totalCents, 450_000, '100 + 200 + … + 900 = 4 500 €');
});

await dit('MC01 · géométrie : la bande va de 146 à 60 de demi-hauteur, trois étapes de 245, pastilles de taux sur l’axe à 245 / 490 / 751', () => {
  assert.equal(PG.demiHauteur(0), 146);
  assert.equal(PG.demiHauteur(735), 60);
  assert.ok(PG.demiHauteur(367) < 146 && PG.demiHauteur(367) > 60);
  const xs = Array.from({ length: 50 }, (_, i) => PG.demiHauteur((i * 735) / 49));
  assert.ok(xs.every((v: number, i: number) => i === 0 || v <= xs[i - 1]), 'monotone');
  assert.deepEqual([...PG.PASTILLES_TAUX_X], [245, 490, 751]);
  assert.deepEqual([PG.ZONE.largeur, PG.ZONE.hauteur, PG.ZONE.sortieLargeur, PG.ZONE.sortieHauteur], [1070, 300, 290, 280]);
  assert.equal(PG.nomCourt('Boulangerie Léo'), 'Boulangerie Léo');
  assert.equal(PG.nomCourt('Brasserie Hautefeuille'), 'Brasserie Haute…');
});

await dit('MC01 · placement : aucune pastille ne se touche, toutes restent dans la bande de leur étape et loin des taux de passage ; l’exemple de la fiche tient sans rien frôler', () => {
  const verifie = (m: any, strict: boolean) => {
    m.etapes.forEach((e: any, i: number) => {
      const ronds = e.pastilles.map((p: any) => ({ id: p.id, rayon: p.rayon, libelle: PG.largeurLibelle(p.nom, '12 400 €') }));
      const pos = PG.placerEtape(ronds, i);
      assert.equal(pos.length, ronds.length);
      for (let a = 0; a < pos.length; a += 1) {
        assert.ok(pos[a].x - pos[a].rayon >= i * 245 && pos[a].x + pos[a].rayon <= (i + 1) * 245, `${e.colonne} ${pos[a].id} dans son étape`);
        assert.ok(Math.abs(pos[a].y - 150) + pos[a].rayon <= PG.demiHauteur(pos[a].x) + 1, `${e.colonne} ${pos[a].id} dans la bande`);
        for (const x of PG.PASTILLES_TAUX_X) assert.ok(Math.hypot(pos[a].x - x, pos[a].y - 150) >= pos[a].rayon + 12 || Math.abs(pos[a].x - x) > pos[a].rayon + 34, `${pos[a].id} sur le taux ${x}`);
        for (let b = a + 1; b < pos.length; b += 1) assert.ok(Math.hypot(pos[a].x - pos[b].x, pos[a].y - pos[b].y) >= pos[a].rayon + pos[b].rayon, `${pos[a].id} / ${pos[b].id}`);
      }
      void strict;
    });
  };
  verifie(PL.modeleEntonnoir(base({ prospects: exemple() })), true);
  for (const v of VOLUMES) verifie(PL.modeleEntonnoir(depuisMonde(mondes[v])), false);
});

await dit('MC01 · déplacer : colonne voisine, bornes aux deux bouts', () => {
  assert.deepEqual(['Nouveau', 'Rendez-vous', 'Devis envoyé', 'Signé'].map((c) => PL.colonneVoisine(c, 1)), ['Rendez-vous', 'Devis envoyé', 'Signé', null]);
  assert.deepEqual(['Nouveau', 'Rendez-vous', 'Signé'].map((c) => PL.colonneVoisine(c, -1)), [null, 'Nouveau', 'Devis envoyé']);
});

await dit('MC01 · signatures par mois : six mois, le mois courant en dernier, fait encourageant (égale le meilleur) ; rien de négatif si le mois est faible', () => {
  const src = base({ prospects: [...exemple().filter((p: any) => p.etape !== 'gagné'), ...['2026-10-02', '2026-10-09', '2026-10-16', '2026-10-20', '2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04', '2026-06-01'].map((j, i) => dealMC01(`g${i}`, 'gagné', 1000, { signeLe: j }))] });
  const m = PL.modeleEntonnoir(src);
  assert.deepEqual(m.signatures.mois.map((x: any) => x.nb), [0, 1, 0, 0, 4, 4]);
  assert.equal(m.signatures.fait.genre, 'egale-meilleur');
  const faible = PL.modeleEntonnoir(base({ prospects: [dealMC01('g', 'gagné', 1000, { signeLe: '2026-10-02' }), ...['2026-08-01', '2026-08-02', '2026-08-03'].map((j, i) => dealMC01(`h${i}`, 'gagné', 1000, { signeLe: j }))] }));
  assert.ok(faible.signatures.fait == null || faible.signatures.fait.genre !== 'record');
});

await dit('MC01 · sur les jeux de SIM (quatre volumes) : le modèle se construit, « en jeu » exclut les signés, les comptes tiennent', () => {
  for (const v of VOLUMES) {
    const src = depuisMonde(mondes[v]);
    const m = PL.modeleEntonnoir(src);
    const ouverts = src.prospects.filter((p: any) => p.etape !== 'gagné' && p.etape !== 'perdu');
    assert.equal(m.enJeuCents, ouverts.reduce((s: number, p: any) => s + (p.montantCents ?? 0), 0), v);
    assert.equal(m.etapes.reduce((s: number, e: any) => s + e.nb, 0), ouverts.length, v);
    assert.equal(m.total, ouverts.length, v);
    assert.equal(m.prevision.contributions.reduce((s: number, c: any) => s + c.cents, 0), m.prevision.totalCents, v);
    assert.ok(m.etapes.every((e: any) => e.pastilles.length <= PL.MAX_PAR_ETAPE[e.colonne] && e.pastilles.length + e.regroupees.length === e.nb), v);
  }
});

await dit('MC01 · textes : mêmes clés en fr et en, mêmes paramètres, comptes à deux formes, l’interface tutoie', () => {
  const en = Object.keys(DICO_PIPELINE.en).sort();
  assert.deepEqual(Object.keys(DICO_PIPELINE.fr).sort(), en);
  const params = (t: string) => [...t.matchAll(/\{(\w+)\}/g)].map((x) => x[1]).sort().join(',');
  for (const k of en) {
    assert.ok(DICO_PIPELINE.en[k].trim() && DICO_PIPELINE.fr[k].trim(), k);
    assert.equal(params(DICO_PIPELINE.fr[k]), params(DICO_PIPELINE.en[k]), `paramètres de ${k}`);
    assert.ok(!VOUVOIEMENT_UI.test(DICO_PIPELINE.fr[k]), `${k} vouvoie : ${DICO_PIPELINE.fr[k]}`);
  }
  for (const b of new Set(en.filter((k) => /\.(1|n)$/.test(k)).map((k) => k.replace(/\.(1|n)$/, '')))) for (const l of ['fr', 'en']) assert.ok(DICO_PIPELINE[l][`${b}.1`] && DICO_PIPELINE[l][`${b}.n`], `${b} (${l})`);
  assert.equal(DICO_PIPELINE.fr['suggestion.texte.n'], 'Le devis de {montant} est ouvert depuis {n} jours sans réponse. Je prépare un message court et poli, tu le relis avant l’envoi.', 'la phrase de tutoiement.json');
});

/* ── MC02 : Fidélité ───────────────────────────────────────────────────── */
console.log('\nContacts — MC02, Fidélité (échelle des paliers, gestes de la semaine)\n');

const compteMC02 = (clientId: number, points: number, activite: string, o: Record<string, unknown> = {}): any => ({ clientId, clientNom: `Client ${clientId}`, points, niveau: points >= 1800 ? 'Or' : points >= 800 ? 'Argent' : 'Bronze', derniereActiviteLe: activite, recommandations: [], avantages: [], ...o });
const srcMC02 = (comptes: any[], o: Record<string, unknown> = {}): any => base({ clients: comptes.map((c) => fiche(c.clientId, 3, { debutLe: '2024-06-15' })), fidelite: comptes, ...o });

await dit('MC02 · position sur le barreau : 230 + part × 444, la part est relative au palier (980 et 1 710 sont sur le même barreau) ; Or jusqu’à 2 500', () => {
  assert.equal(FI.positionXClient(0), 230);
  assert.equal(FI.positionXClient(1), 674);
  assert.equal(FI.positionXClient(2), 674, 'borné');
  const part = (p: number) => Math.round(FI.partDansLePalier(p) * 1000) / 1000;
  assert.deepEqual([980, 1360, 1710, 800].map(part), [0.18, 0.56, 0.91, 0]);
  assert.deepEqual([120, 740, 1800, 2150, 2500, 9000].map(part), [0.15, 0.925, 0, 0.5, 1, 1]);
  assert.ok(FI.positionXClient(FI.partDansLePalier(1710)) > 600, 'Medina : tout près du montant droit d’Argent');
  assert.deepEqual([...FI.NIVEAUX_HAUT_EN_BAS], ['Or', 'Argent', 'Bronze']);
});

await dit('MC02 · deux rangées alternées, deux clients d’une même rangée toujours à 140 px au moins, même tous au plafond de l’échelle', () => {
  const tous = Array.from({ length: 4 }, (_, i) => ({ id: i, part: 1 }));
  const r = FI.rangees(tous);
  assert.deepEqual(r.map((c: any) => c.rangee), [0, 1, 0, 1]);
  for (const rang of [0, 1]) {
    const xs = r.filter((c: any) => c.rangee === rang).map((c: any) => c.x).sort((a: number, b: number) => a - b);
    for (let i = 1; i < xs.length; i += 1) assert.ok(xs[i] - xs[i - 1] >= FI.ECART_MINIMAL, `rangée ${rang} : ${xs.join(', ')}`);
    assert.ok(xs.every((x: number) => x >= 230 && x <= 674));
  }
  const exemple = FI.rangees([{ part: 0.18 }, { part: 0.32 }, { part: 0.56 }, { part: 0.91 }]);
  assert.deepEqual(exemple.map((c: any) => c.rangee), [0, 1, 0, 1]);
  assert.deepEqual(exemple.map((c: any) => Math.round(c.x)), [310, 372, 479, 634], 'l’exemple de la fiche garde ses places');
});

await dit('MC02 · effectifs, au plus quatre clients posés par barreau (les plus proches du palier suivant d’abord), « N autres » ; carrés pleins = revenus ce mois', () => {
  const comptes = [
    ...Array.from({ length: 7 }, (_, i) => compteMC02(10 + i, 100 + i * 100, i < 4 ? '2026-10-12' : '2026-09-01')),
    compteMC02(30, 900, '2026-10-02'), compteMC02(31, 1900, '2026-10-20'), compteMC02(32, 0, '2026-10-20'),
  ];
  const m = FI.modeleFidelite(srcMC02(comptes));
  assert.equal(m.fideles, 9, 'un client à 0 point n’est pas fidèle');
  const [or, argent, bronze] = m.barreaux;
  assert.deepEqual([or.effectif, argent.effectif, bronze.effectif], [1, 1, 7]);
  assert.equal(bronze.poses.length, 4);
  assert.equal(bronze.autres, 3);
  assert.deepEqual(bronze.poses.map((c: any) => c.clientId).sort(), [13, 14, 15, 16].sort(), 'les plus proches de 800 points');
  assert.equal(bronze.carres.length, 7);
  assert.equal(bronze.revenus, 4);
  assert.equal(m.barreaux.reduce((s: number, b: any) => s + b.revenus, 0), m.programme.revenus);
  assert.equal(m.programme.revenus, 6, '4 + 1 + 1');
});

await dit('MC02 · « bientôt au palier suivant » : moins de 100 points du seuil, « plus que N points » ; l’Or n’a pas de palier suivant ; « inactifs » = 30 jours sans activité', () => {
  const m = FI.modeleFidelite(srcMC02([compteMC02(1, 1710, '2026-10-26'), compteMC02(2, 740, '2026-09-29'), compteMC02(3, 100, '2026-09-20'), compteMC02(4, 2140, '2026-10-29')]));
  const pose = (id: number) => m.barreaux.flatMap((b: any) => b.poses).find((c: any) => c.clientId === id);
  assert.deepEqual(pose(1).bientot, { manque: 90, vers: 'Or' });
  assert.deepEqual(pose(2).bientot, { manque: 60, vers: 'Argent' });
  assert.equal(pose(3).bientot, null);
  assert.equal(pose(4).bientot, null);
  assert.deepEqual([pose(1).inactif, pose(2).inactif, pose(3).inactif], [false, true, true]);
  assert.deepEqual(m.chips, { tous: 4, bientot: 2, inactifs: 2 });
  assert.deepEqual([pose(1), pose(2), pose(3)].map((c: any) => FI.gardeLeFiltre(c, 'bientot')), [true, true, false]);
  assert.deepEqual([pose(1), pose(3)].map((c: any) => FI.gardeLeFiltre(c, 'inactifs')), [false, true]);
});

await dit('MC02 · à offrir cette semaine : passage de palier, anniversaire de relation (7 jours), seuil de 500 points dépassé ; trois au plus', () => {
  const src = srcMC02([compteMC02(1, 1820, '2026-10-28'), compteMC02(2, 1020, '2026-10-20'), compteMC02(3, 300, '2026-10-20'), compteMC02(4, 340, '2026-10-20')]);
  src.clients = [fiche(1, 3, { debutLe: '2024-01-10' }), fiche(2, 3, { debutLe: '2024-03-04' }), fiche(3, 3, { debutLe: '2023-11-02' }), fiche(4, 3, { debutLe: '2026-09-01' })];
  const m = FI.modeleFidelite(src);
  assert.deepEqual(m.gestes.map((g: any) => [g.clientId, g.genre]), [[1, 'palier'], [3, 'anniversaire'], [2, 'seuil']]);
  const an = m.gestes.find((g: any) => g.genre === 'anniversaire');
  assert.deepEqual(an.params, { n: 3, jour: '2026-11-02' });
  assert.deepEqual(m.gestes.find((g: any) => g.genre === 'palier').params, { niveau: 'Or' });
  assert.equal(FI.modeleFidelite(srcMC02([compteMC02(1, 330, '2026-10-01')])).gestes.length, 0);
  const beaucoup = FI.modeleFidelite(srcMC02(Array.from({ length: 8 }, (_, i) => compteMC02(i + 1, 1810 + i, '2026-10-20'))));
  assert.equal(beaucoup.gestes.length, 3);
});

await dit('MC02 · le programme ce mois : points = euros payés ce mois + avis × 50 + recommandations × 200 ; avantages utilisés ce mois et leur valeur', () => {
  const f = (clientId: number, paye: string, cents: number) => factureH05(clientId, { status: 'paid', paidAt: paye, issuedAt: paye, lines: [{ id: 'l', label: 'x', quantity: 1, unitPriceCents: cents, vatRate: 0 }] });
  const src = srcMC02([compteMC02(1, 500, '2026-10-10', { recommandations: ['2026-10-05', '2026-06-01'], avantages: [{ id: 'a1', libelle: 'Bon', valeurCents: 3000, statut: 'Utilisé', le: '2026-10-15' }, { id: 'a2', libelle: 'Bon', valeurCents: 5000, statut: 'Offert', le: '2026-10-16' }, { id: 'a3', libelle: 'Bon', valeurCents: 2000, statut: 'Utilisé', le: '2026-09-01' }] })], {
    factures: [f(1, '2026-10-10', 120_000), f(1, '2026-09-10', 999_000)],
    avis: [{ clientId: 1, date: '2026-10-12' }, { clientId: 1, date: '2026-08-12' }],
  });
  const m = FI.modeleFidelite(src);
  assert.equal(m.programme.pointsDistribues, 1200 + 50 + 200);
  assert.deepEqual([m.programme.avantagesUtilises, m.programme.avantagesCents], [1, 3000]);
  assert.deepEqual(m.regles, { pointsParEuro: 1, pointsParAvis: 50, pointsParRecommandation: 200, seuilBientot: 100 });
});

await dit('MC02 · suggestion : un client dont l’intervalle habituel est dépassé de moitié ou plus (9 jours pour un rythme de 6) ; sans cas, la carte « astuce »', () => {
  const payee = (id: number, jour: string) => factureH05(id, { status: 'paid', paidAt: jour, issuedAt: jour });
  const regulier = ['2026-09-01', '2026-09-08', '2026-09-15', '2026-09-22'].map((j) => payee(1, j));
  const src = srcMC02([compteMC02(1, 600, '2026-09-22')], { factures: regulier });
  const m = FI.modeleFidelite(src);
  assert.deepEqual(m.suggestion, { clientId: 1, clientNom: 'Client 1', jours: 38, rythme: 7 });
  const recent = srcMC02([compteMC02(1, 600, '2026-10-26')], { factures: ['2026-10-05', '2026-10-12', '2026-10-19', '2026-10-26'].map((j) => payee(1, j)) });
  assert.equal(FI.modeleFidelite(recent).suggestion, null);
  assert.equal(FI.modeleFidelite(srcMC02([compteMC02(1, 600, '2026-09-22')], { factures: regulier.slice(0, 2) })).suggestion, null, 'moins de trois paiements : pas de rythme');
});

await dit('MC02 · sur les jeux de SIM (quatre volumes) : le modèle se construit, les effectifs somment les comptes, personne n’est posé hors de la plage du palier', () => {
  for (const v of VOLUMES) {
    const src = depuisMonde(mondes[v]);
    const m = FI.modeleFidelite(src);
    const comptes = src.fidelite.filter((c: any) => c.points > 0);
    assert.equal(m.barreaux.reduce((s: number, b: any) => s + b.effectif, 0), comptes.length, v);
    assert.equal(m.fideles, comptes.length, v);
    for (const b of m.barreaux) {
      assert.equal(b.carres.length, b.effectif, v);
      assert.ok(b.poses.length <= 4 && b.poses.length + b.autres === b.effectif, v);
      assert.ok(b.poses.every((c: any) => c.points >= b.depuis && (b.jusqua == null || c.points < b.jusqua) && c.x >= 230 && c.x <= 674), v);
    }
    assert.ok(m.gestes.length <= 3, v);
  }
});

await dit('MC02 · textes : mêmes clés en fr et en, mêmes paramètres, comptes à deux formes, l’interface tutoie', () => {
  const en = Object.keys(DICO_FIDELITE.en).sort();
  assert.deepEqual(Object.keys(DICO_FIDELITE.fr).sort(), en);
  const params = (t: string) => [...t.matchAll(/\{(\w+)\}/g)].map((x) => x[1]).sort().join(',');
  for (const k of en) {
    assert.ok(DICO_FIDELITE.en[k].trim() && DICO_FIDELITE.fr[k].trim(), k);
    assert.equal(params(DICO_FIDELITE.fr[k]), params(DICO_FIDELITE.en[k]), `paramètres de ${k}`);
    assert.ok(!VOUVOIEMENT_UI.test(DICO_FIDELITE.fr[k]), `${k} vouvoie : ${DICO_FIDELITE.fr[k]}`);
  }
  for (const b of new Set(en.filter((k) => /\.(1|n)$/.test(k)).map((k) => k.replace(/\.(1|n)$/, '')))) for (const l of ['fr', 'en']) assert.ok(DICO_FIDELITE[l][`${b}.1`] && DICO_FIDELITE[l][`${b}.n`], `${b} (${l})`);
  assert.equal(DICO_FIDELITE.fr['sousTitre'], 'Récompense ceux qui reviennent · 3 paliers, aucun effort', 'la phrase de tutoiement.json');
});

/* ── MC03 : Fiches contacts ─────────────────────────────────────────────── */
console.log('\nContacts — MC03, Fiches contacts (liste par récence, profil, frise)\n');

const personne = (id: string, nom: string, jours: number, o: Record<string, unknown> = {}): any => ({
  id, prenom: nom.split(' ')[0], nom: nom.split(' ')[1] ?? '', nomComplet: nom, fonction: 'Directrice', organisationType: 'client', organisationId: '7', organisationNom: 'Menna Conseil',
  email: `${id}@exemple.test`, telephone: '01 00 00 00 00', notes: '', favori: false, nonLu: false, preference: 'messagerie',
  dernierEchangeAt: new Date(paris('2026-10-30', '10:42') - jours * 86_400_000).toISOString(), ...o,
});
const srcMC03 = (gens: any[], o: Record<string, unknown> = {}): any => base({ clients: [fiche(7, 1, { debutLe: '2024-03-04', ville: 'Paris 8e' })], interlocuteurs: gens, ...o });

await dit('MC03 · groupes par récence : aujourd’hui et hier, cette semaine (jusqu’à 6 jours), plus ancien ; étiquettes relatives (Hier, jour, sem., mois)', () => {
  assert.deepEqual([0, 1, 2, 6, 7, 400].map((j) => PE.groupeDe(j)), ['recent', 'recent', 'semaine', 'semaine', 'ancien', 'ancien']);
  const g = (j: number) => PE.recenceDe(j, '2026-10-01');
  assert.deepEqual([0, 1, 3, 14, 27, 28, 65].map((j) => [g(j).genre, g(j).n]), [['aujourdhui', 0], ['hier', 1], ['jour', 3], ['semaines', 2], ['semaines', 3], ['mois', 1], ['mois', 2]]);
});

await dit('MC03 · liste : la plus récente d’abord, favoris et récents (30 jours) en filtres, recherche sur le nom, l’organisation, la fonction et le courriel sans accent ni casse', () => {
  const gens = [personne('a', 'Amina Menna', 1), personne('b', 'Karim Médina', 3, { organisationNom: 'Medina Services', fonction: 'Gérant' }), personne('c', 'Léo Martin', 14, { favori: true }), personne('d', 'Paul Dupont', 40, { favori: true })];
  const src = srcMC03(gens);
  assert.deepEqual(PE.lignesDe(src).map((l: any) => l.id), ['a', 'b', 'c', 'd']);
  assert.deepEqual(PE.lignesDe(src, '', 'favoris').map((l: any) => l.id), ['c', 'd']);
  assert.deepEqual(PE.lignesDe(src, '', 'recents').map((l: any) => l.id), ['a', 'b', 'c']);
  assert.deepEqual(PE.lignesDe(src, 'medina').map((l: any) => l.id), ['b']);
  assert.deepEqual(PE.lignesDe(src, 'GÉRANT').map((l: any) => l.id), ['b']);
  assert.deepEqual(PE.lignesDe(src, 'zzz'), []);
  const m = PE.modeleContacts(src, { filtre: 'tous' });
  assert.deepEqual(m.groupes.map((g: any) => [g.groupe, g.lignes.length]), [['recent', 1], ['semaine', 1], ['ancien', 2]]);
  assert.deepEqual(m.chips, { tous: 4, favoris: 2, recents: 3 });
  assert.equal(m.profil.id, 'a', 'sans sélection : la première ligne');
  assert.equal(PE.modeleContacts(src, { selectionId: 'c' }).profil.id, 'c');
  assert.equal(PE.modeleContacts(src, { selectionId: 'inconnu' }).profil.id, 'a');
});

await dit('MC03 · profil d’une personne cliente : encaissé de l’année civile, retard, échanges du trimestre, palier, « client depuis », prochain rendez-vous', () => {
  const f = (statut: string, jour: string, cents: number, o: Record<string, unknown> = {}) => factureH05(7, { status: statut, paidAt: statut === 'paid' ? jour : '', issuedAt: jour, lines: [{ id: 'l', label: 'x', quantity: 1, unitPriceCents: cents, vatRate: 0 }], ...o });
  const rdv: any = { id: 'e1', clientId: 7, type: 'rendez-vous client', systeme: false, confirmation: 'confirmé', title: 'Démonstration', mode: 'visio', startAt: new Date(paris('2026-10-30', '11:00')).toISOString(), durationMin: 45 };
  const src = srcMC03([personne('a', 'Amina Menna', 1)], {
    factures: [f('paid', '2026-03-10', 500_000), f('paid', '2025-12-10', 900_000), f('issued', '2026-09-20', 124_000, { number: 'F-2041', dueAt: '2026-10-26' })],
    fidelite: [compteMC02(7, 2140, '2026-10-20')],
    evenements: [rdv],
    echanges: [{ clientId: 7, at: '2026-10-29T08:48:00.000Z' }, { clientId: 7, at: '2026-10-28T10:00:00.000Z' }, { clientId: 7, at: '2026-10-15T10:00:00.000Z' }, { clientId: 7, at: '2026-05-02T10:00:00.000Z' }, { clientId: 8, at: '2026-10-29T10:00:00.000Z' }],
  });
  const p = PE.profilDe(src, 'a');
  assert.equal(p.faits.encaisseCents, 500_000, 'année civile 2026 seulement');
  assert.deepEqual(p.faits.enRetard, { numero: 'F-2041', jours: 4 });
  assert.equal(p.faits.echangesTrimestre, 3, 'octobre, trimestre civil, ce client seulement');
  assert.equal(p.palier, 'Or');
  assert.equal(p.clientDepuis, '2024-03');
  assert.equal(p.ville, 'Paris 8e');
  assert.equal(p.faits.prochainRdv.heure, '11:00');
  assert.equal(p.faits.prochainRdv.dansMin, 18);
  assert.deepEqual(p.preparation, { heure: '11:00', titre: 'Démonstration' });
  assert.equal(p.derniers.length, 3);
  assert.equal(p.derniers[0].jours, 1);
});

await dit('MC03 · frise : un mois par barre (plafonné à 7 échanges), premier contact, devis signés, dernier échange ; record du mois ; rythme habituel', () => {
  const echanges = [...['2026-07-02', '2026-08-03', '2026-08-04', '2026-09-05'].map((j) => ({ clientId: 7, at: `${j}T10:00:00.000Z` })), ...Array.from({ length: 9 }, (_, i) => ({ clientId: 7, at: `2026-10-${String(i + 1).padStart(2, '0')}T10:00:00.000Z` }))];
  const src = srcMC03([personne('a', 'Amina Menna', 1)], { echanges, devis: [devisG04(1, 7, { status: 'accepted', acceptéLe: '2026-08-20', title: 'Contrat de maintenance' })] });
  const r = PE.profilDe(src, 'a').relation;
  assert.deepEqual(r.mois.map((m: any) => m.cle), ['2026-07', '2026-08', '2026-09', '2026-10']);
  assert.deepEqual(r.mois.map((m: any) => m.echanges), [1, 2, 1, 9]);
  assert.equal(r.recordCeMois, true);
  assert.equal(r.debut, '2026-07');
  assert.deepEqual(r.evenements.map((e: any) => [e.indice, e.premier, e.dernier, e.titre]), [[0, true, false, ''], [1, false, false, 'Contrat de maintenance'], [3, false, true, '']]);
  assert.equal(r.rythme, Math.round(13 / 3));
  const calme = PE.profilDe(srcMC03([personne('a', 'Amina Menna', 1)], { echanges: [{ clientId: 7, at: '2026-08-02T10:00:00.000Z' }, { clientId: 7, at: '2026-08-03T10:00:00.000Z' }, { clientId: 7, at: '2026-10-03T10:00:00.000Z' }] }), 'a');
  assert.equal(calme.relation.recordCeMois, false);
});

await dit('MC03 · libellés de la frise : deux rangées, jamais deux libellés qui se touchent, le bord droit ancré à droite, l’excédent omis', () => {
  const evs = [{ x: 20, largeur: 110, ancreDroite: false }, { x: 60, largeur: 110, ancreDroite: false }, { x: 90, largeur: 110, ancreDroite: false }, { x: 400, largeur: 110, ancreDroite: false }, { x: 756, largeur: 120, ancreDroite: true }];
  const r = PE.rangerLibelles(evs);
  assert.deepEqual(r, [0, 1, null, 0, 0]);
  for (let rang = 0; rang < 2; rang += 1) {
    const boites = evs.map((e, i) => ({ e, i })).filter(({ i }) => r[i] === rang).map(({ e }) => [e.ancreDroite ? e.x - e.largeur : e.x - 6, (e.ancreDroite ? e.x - e.largeur : e.x - 6) + e.largeur]).sort((a, b) => a[0] - b[0]);
    for (let k = 1; k < boites.length; k += 1) assert.ok(boites[k][0] >= boites[k - 1][1], `rangée ${rang}`);
  }
  assert.deepEqual(PE.rangerLibelles([]), []);
});

await dit('MC03 · personne sans historique ou d’une autre organisation : faits vides (null), frise vide, jamais un zéro qui mentirait', () => {
  const fournisseur = personne('f', 'Yanis Benali', 20, { organisationType: 'fournisseur', organisationId: 'F-1', organisationNom: 'Distri Réseau', preference: 'courriel', notes: 'À joindre le matin.' });
  const p = PE.profilDe(srcMC03([fournisseur]), 'f');
  assert.deepEqual([p.clientId, p.palier, p.clientDepuis, p.faits.encaisseCents, p.faits.echangesTrimestre, p.faits.prochainRdv, p.preparation], [null, null, null, null, null, null, null]);
  assert.deepEqual([p.relation.mois, p.relation.debut, p.derniers], [[], null, []]);
  assert.equal(p.faits.dernierEchange.jours, 20, 'le dernier échange de la personne est connu');
  assert.deepEqual([p.preference, p.notes], ['courriel', 'À joindre le matin.']);
  const neuf = PE.profilDe(srcMC03([personne('n', 'Nouvelle Personne', 0)]), 'n');
  assert.deepEqual(neuf.relation.mois, []);
  assert.equal(PE.profilDe(srcMC03([]), 'x'), null);
});

await dit('MC03 · collection absente (interlocuteurs null) : aucune ligne, aucun profil — la page dit « non disponible »', () => {
  const src = srcMC03([], { interlocuteurs: null });
  assert.deepEqual(PE.lignesDe(src), []);
  const m = PE.modeleContacts(src);
  assert.deepEqual([m.total, m.groupes, m.profil], [0, [], null]);
  assert.equal(PE.profilDe(src, 'a'), null);
});

await dit('MC03 · sur les jeux de SIM (quatre volumes) : la liste et le profil se construisent, les groupes somment la liste, les libellés restent sans chevauchement possible', () => {
  for (const v of VOLUMES) {
    const src = depuisMonde(mondes[v]);
    const m = PE.modeleContacts(src);
    assert.equal(m.total, src.interlocuteurs.length, v);
    assert.equal(m.groupes.reduce((s: number, g: any) => s + g.lignes.length, 0), m.total, v);
    if (m.total > 0) assert.ok(m.profil, v);
    for (const i of src.interlocuteurs.slice(0, 30)) {
      const p = PE.profilDe(src, i.id);
      assert.ok(p, `${v} ${i.id}`);
      assert.ok(p.relation.mois.every((b: any) => b.echanges >= 0), v);
      assert.ok(p.relation.evenements.every((e: any) => e.indice >= 0 && e.indice < Math.max(1, p.relation.mois.length)), v);
      assert.ok(p.derniers.length <= 3, v);
    }
  }
});

await dit('MC03 · textes : mêmes clés en fr et en, mêmes paramètres, comptes à deux formes, l’interface tutoie', () => {
  const en = Object.keys(DICO_PERSONNES.en).sort();
  assert.deepEqual(Object.keys(DICO_PERSONNES.fr).sort(), en);
  const params = (t: string) => [...t.matchAll(/\{(\w+)\}/g)].map((x) => x[1]).sort().join(',');
  for (const k of en) {
    assert.ok(DICO_PERSONNES.en[k].trim() && DICO_PERSONNES.fr[k].trim(), k);
    assert.equal(params(DICO_PERSONNES.fr[k]), params(DICO_PERSONNES.en[k]), `paramètres de ${k}`);
    assert.ok(!VOUVOIEMENT_UI.test(DICO_PERSONNES.fr[k]), `${k} vouvoie : ${DICO_PERSONNES.fr[k]}`);
  }
  for (const b of new Set(en.filter((k) => /\.(1|n)$/.test(k)).map((k) => k.replace(/\.(1|n)$/, '')))) for (const l of ['fr', 'en']) assert.ok(DICO_PERSONNES[l][`${b}.1`] && DICO_PERSONNES[l][`${b}.n`], `${b} (${l})`);
  assert.equal(DICO_PERSONNES.fr['sousTitre'], 'Tout ce que tu sais sur une personne, au même endroit', 'la phrase de tutoiement.json');
});

/* ── MC04 : Équipe ─────────────────────────────────────────────────────── */
console.log('\nContacts — MC04, Équipe (charge de la semaine, maintenant, suggestion)\n');

const membre = (email: string, prenom: string, o: Record<string, unknown> = {}): any => ({ id: email, prenom, nom: '', nomComplet: prenom, initiales: prenom[0], email, teinte: 1, statut: 'en ligne', role: 'member', fonction: 'Rôle', specialites: ['Réseau'], heuresSemaine: 35, congesJours: [], ...o });
const tacheMC04 = (email: string, jour: string, o: Record<string, unknown> = {}): any => ({ id: `t-${Math.round(Math.random() * 1e9)}`, title: 'Tâche', assigneeEmail: email, status: 'todo', echeance: jour, etiquettes: [], ...o });
const rdvMC04 = (id: string, email: string, jour: string, heure: string, minutes: number, o: Record<string, unknown> = {}): any => ({ id, clientId: null, type: 'réunion', systeme: false, confirmation: 'confirmé', title: `Réunion ${id}`, location: 'Salle', participants: [email], startAt: new Date(paris(jour, heure)).toISOString(), durationMin: minutes, ...o });
const srcMC04 = (equipe: any[], o: Record<string, unknown> = {}): any => base({ equipe, taches: [], moi: { prenom: equipe[0]?.prenom ?? '', email: equipe[0]?.email ?? '' }, ...o });

await dit('MC04 · charge : heures des rendez-vous + 1 h par tâche échue, lundi à vendredi, capacité = semaine ÷ 5 (7 h), total et part sur 35 h, dépassement par jour', () => {
  const a = membre('a@exemple.test', 'Aaron');
  const src = srcMC04([a], {
    taches: [...Array.from({ length: 3 }, () => tacheMC04('a@exemple.test', '2026-10-28')), tacheMC04('autre@exemple.test', '2026-10-28'), tacheMC04('a@exemple.test', '2026-10-30')],
    evenements: [rdvMC04('r1', 'a@exemple.test', '2026-10-28', '09:00', 270), rdvMC04('r2', 'a@exemple.test', '2026-10-26', '10:00', 90), rdvMC04('r3', 'a@exemple.test', '2026-10-28', '16:00', 60, { systeme: true })],
  });
  const c = EQ.chargeDe(src, a);
  assert.deepEqual(c.jours.map((j: any) => j.jour), ['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30']);
  assert.deepEqual(c.jours.map((j: any) => j.heures), [1.5, 0, 7.5, 0, 1]);
  assert.deepEqual(c.jours.map((j: any) => j.etat), ['passe', 'passe', 'passe', 'passe', 'aujourdhui']);
  assert.deepEqual(c.jours.map((j: any) => j.depasse), [false, false, true, false, false], 'seul mercredi dépasse 7 h');
  assert.deepEqual([c.totalHeures, c.capaciteHeures, c.capaciteJour], [10, 35, 7]);
  assert.equal(Math.round(c.part * 100), 29);
  assert.equal(c.ton, 'vert');
});

await dit('MC04 · couleur du total : moins de 80 % vert, de 80 à 100 % orange, au-delà rouge ; la moyenne du sous-titre = moyenne des parts', () => {
  assert.deepEqual([0.58, 0.79, 0.8, 0.82, 1, 1.01].map((p) => EQ.tonDeCharge(p)), ['vert', 'vert', 'orange', 'orange', 'orange', 'rouge']);
  const taches = (email: string, n: number) => Array.from({ length: n }, (_, i) => tacheMC04(email, `2026-10-${26 + (i % 5)}`));
  const equipe = [membre('a@exemple.test', 'Aaron'), membre('b@exemple.test', 'Mohamed'), membre('c@exemple.test', 'Riyad')];
  const m = EQ.modeleEquipe(srcMC04(equipe, { taches: [...taches('a@exemple.test', 29), ...taches('b@exemple.test', 26), ...taches('c@exemple.test', 20)] }));
  assert.deepEqual(m.cartes.map((c: any) => Math.round(c.charge.part * 100)), [83, 74, 57]);
  assert.equal(m.chargeMoyenne, Math.round(((29 / 35 + 26 / 35 + 20 / 35) / 3) * 100));
  assert.deepEqual(m.cartes.map((c: any) => c.prenom), ['Aaron', 'Mohamed', 'Riyad'], 'jamais trié par charge');
});

await dit('MC04 · capacité réglable par personne, congés = jour hachuré hors de la charge, personne absente = carte sans encadré', () => {
  const part = membre('p@exemple.test', 'Pia', { heuresSemaine: 20, congesJours: ['2026-10-27'] });
  const src = srcMC04([part], { taches: [tacheMC04('p@exemple.test', '2026-10-26'), tacheMC04('p@exemple.test', '2026-10-26'), tacheMC04('p@exemple.test', '2026-10-27')] });
  const c = EQ.chargeDe(src, part);
  assert.equal(c.capaciteJour, 4);
  assert.deepEqual(c.jours.map((j: any) => j.etat), ['passe', 'absent', 'passe', 'passe', 'aujourdhui']);
  assert.equal(c.jours[0].depasse, false);
  const absent = membre('z@exemple.test', 'Zoé', { statut: 'absent' });
  const m = EQ.modeleEquipe(srcMC04([absent]));
  assert.equal(m.cartes[0].absent, true);
  assert.equal(m.cartes[0].maintenant.genre, 'absent');
  assert.equal(EQ.lundiDeLaSemaine('2026-10-30'), '2026-10-26');
  assert.equal(EQ.lundiDeLaSemaine('2026-11-01'), '2026-10-26');
  assert.equal(EQ.lundiDeLaSemaine('2026-11-02'), '2026-11-02');
});

await dit('MC04 · maintenant : le rendez-vous en cours ou dans l’heure, sinon « disponible » ; libre à partir de la fin des blocs qui s’enchaînent', () => {
  const a = membre('a@exemple.test', 'Aaron');
  const src = srcMC04([a], { evenements: [rdvMC04('r1', 'a@exemple.test', '2026-10-30', '10:30', 30), rdvMC04('r2', 'a@exemple.test', '2026-10-30', '11:00', 60), rdvMC04('r3', 'a@exemple.test', '2026-10-30', '15:00', 30)] });
  const r = EQ.maintenantDe(src, a);
  assert.equal(r.maintenant.genre, 'evenement');
  assert.equal(r.maintenant.titre, 'Réunion r1');
  assert.equal(r.libreA, '12:00', 'r1 puis r2 s’enchaînent');
  const dans = srcMC04([a], { evenements: [rdvMC04('r4', 'a@exemple.test', '2026-10-30', '11:30', 45)] });
  assert.equal(EQ.maintenantDe(dans, a).maintenant.genre, 'evenement');
  const loin = srcMC04([a], { evenements: [rdvMC04('r5', 'a@exemple.test', '2026-10-30', '16:00', 45)] });
  assert.deepEqual(EQ.maintenantDe(loin, a), { maintenant: { genre: 'disponible', titre: '', detail: '' }, libreA: null });
});

await dit('MC04 · charge inconnue (ni tâches ni participants) : null, jamais des zéros ; sans charge connue, pas de moyenne dans le sous-titre', () => {
  const a = membre('a@exemple.test', 'Aaron');
  const src = srcMC04([a], { taches: null });
  assert.equal(EQ.chargeDe(src, a), null);
  const m = EQ.modeleEquipe(src);
  assert.deepEqual([m.cartes[0].charge, m.cartes[0].enCours, m.chargeMoyenne, m.suggestion], [null, null, null, null]);
});

await dit('MC04 · suggestion « alléger » : une personne au-dessus de 80 % et une autre sous 65 %, jamais une personne absente ; la tâche proposée a une compétence chez l’autre', () => {
  const taches = (email: string, n: number, o: Record<string, unknown> = {}) => Array.from({ length: n }, (_, i) => tacheMC04(email, `2026-10-${26 + (i % 5)}`, o));
  const equipe = [membre('a@exemple.test', 'Aaron', { specialites: ['Sécurité'] }), membre('b@exemple.test', 'Mohamed', { specialites: ['Développement'] }), membre('c@exemple.test', 'Riyad', { specialites: ['Relances'] })];
  const src = srcMC04(equipe, { taches: [...taches('a@exemple.test', 29), tacheMC04('a@exemple.test', '2026-11-03', { title: 'Relances clients', status: 'todo' }), ...taches('b@exemple.test', 26), ...taches('c@exemple.test', 20)] });
  const s = EQ.modeleEquipe(src).suggestion;
  assert.equal(s.de.prenom, 'Aaron');
  assert.equal(s.vers.prenom, 'Riyad');
  assert.equal(s.partDe, 83);
  assert.equal(s.tache, 'Relances clients');
  const absent = srcMC04([equipe[0], equipe[1], { ...equipe[2], statut: 'absent' }], { taches: [...taches('a@exemple.test', 29), ...taches('b@exemple.test', 26), ...taches('c@exemple.test', 20)] });
  assert.equal(EQ.modeleEquipe(absent).suggestion, null);
  const calme = srcMC04(equipe, { taches: [...taches('a@exemple.test', 10), ...taches('b@exemple.test', 8), ...taches('c@exemple.test', 5)] });
  assert.equal(EQ.modeleEquipe(calme).suggestion, null, 'personne au-dessus de 80 % : la carte « astuce »');
});

await dit('MC04 · accès externes = les invités de l’équipe ; aucun invité = non disponible (null) ; les invités n’ont pas de carte', () => {
  const equipe = [membre('a@exemple.test', 'Aaron'), membre('g@exemple.test', 'Sarah', { role: 'guest', fonction: 'Invitée · lecture seule' })];
  const m = EQ.modeleEquipe(srcMC04(equipe));
  assert.equal(m.total, 1);
  assert.deepEqual(m.acces, [{ id: 'g@exemple.test', nom: 'Sarah', initiale: 'S', role: 'Invitée · lecture seule' }]);
  assert.equal(EQ.modeleEquipe(srcMC04([equipe[0]])).acces, null);
});

await dit('MC04 · sur les jeux de SIM (quatre volumes) : le modèle se construit, une carte par membre non invité, 5 jours par charge, parts entre 0 et plus', () => {
  for (const v of VOLUMES) {
    const src = depuisMonde(mondes[v]);
    const m = EQ.modeleEquipe(src);
    assert.equal(m.total, src.equipe.filter((x: any) => x.role !== 'guest').length, v);
    for (const c of m.cartes) {
      if (c.charge) {
        assert.equal(c.charge.jours.length, 5, v);
        assert.ok(c.charge.part >= 0 && c.charge.jours.every((j: any) => j.heures >= 0), v);
        assert.equal(c.charge.ton, EQ.tonDeCharge(c.charge.part), v);
      }
      assert.ok(c.competences.length <= 4, v);
    }
  }
});

await dit('MC04 · textes : mêmes clés en fr et en, mêmes paramètres, comptes à deux formes, l’interface tutoie', () => {
  const en = Object.keys(DICO_EQUIPE.en).sort();
  assert.deepEqual(Object.keys(DICO_EQUIPE.fr).sort(), en);
  const params = (t: string) => [...t.matchAll(/\{(\w+)\}/g)].map((x) => x[1]).sort().join(',');
  for (const k of en) {
    assert.ok(DICO_EQUIPE.en[k].trim() && DICO_EQUIPE.fr[k].trim(), k);
    assert.equal(params(DICO_EQUIPE.fr[k]), params(DICO_EQUIPE.en[k]), `paramètres de ${k}`);
    assert.ok(!VOUVOIEMENT_UI.test(DICO_EQUIPE.fr[k]), `${k} vouvoie : ${DICO_EQUIPE.fr[k]}`);
  }
  for (const b of new Set(en.filter((k) => /\.(1|n)$/.test(k)).map((k) => k.replace(/\.(1|n)$/, '')))) for (const l of ['fr', 'en']) assert.ok(DICO_EQUIPE[l][`${b}.1`] && DICO_EQUIPE[l][`${b}.n`], `${b} (${l})`);
  assert.equal(DICO_EQUIPE.fr['suggestion.astuce.texte'], 'Un statut « Concentré » met tes notifications en pause jusqu’à l’heure choisie.', 'la phrase de tutoiement.json');
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

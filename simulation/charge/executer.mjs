#!/usr/bin/env node
/**
 * LOT-14 — JOUER LES SCÉNARIOS DE CHARGE contre une API d'essai en mémoire.
 *
 *   node simulation/charge/executer.mjs cible   [--organisations 100] [--connectees 20] [--internes 3] [--duree-s 60]
 *   node simulation/charge/executer.mjs paliers [--paliers 20,50,100] [--palier-s 20]
 *   node simulation/charge/executer.mjs long    [--duree-s 120] [--coupure-s 30] [--redemarrage-s 45]
 *
 * Les scénarios, leurs seuils et ce qu'on y mesure sont écrits dans `docs/simulation/charge.md`.
 * Ici, on vérifie SEULEMENT que les scénarios tournent : le serveur d'essai vit dans le même processus
 * que les personnes simulées, donc les chiffres ne valent pas pour le vrai serveur (LOT-13, plus tard).
 *
 * Ce que le script fait, et rien d'autre :
 *   · il démarre la VRAIE amn-api (son `createApp`) sur une base SQLite en mémoire — ou, pour l'essai
 *     long, sur un fichier jetable du dossier temporaire, parce qu'un redémarrage doit retrouver les
 *     écritures — et n'écoute que sur 127.0.0.1, port libre au hasard ;
 *   · il crée les organisations fictives de `src/refonte/donnees/charge.ts` (courriels `.exemple.test`)
 *     et leurs sessions directement dans la base : l'API n'offre pas d'inscription, et la connexion
 *     est freinée (c'est voulu, ce n'est pas ce qu'on mesure) ;
 *   · aucun secret n'est lu ni écrit : le jeton d'opérateur est tiré au hasard pour ce processus ;
 *   · il refuse de tourner sans amn-api à côté (voir `scripts/api-root.mjs`).
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { monitorEventLoopDelay, performance } from 'node:perf_hooks';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as esbuild from 'esbuild';
import { trouverApiRoot } from '../../scripts/api-root.mjs';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/* --------------------------------- Options --------------------------------- */

const [scenario = '', ...restes] = process.argv.slice(2);
const option = (nom, defaut) => {
  const i = restes.indexOf(nom);
  return i >= 0 && restes[i + 1] !== undefined && !restes[i + 1].startsWith('--') ? restes[i + 1] : defaut;
};
const entier = (nom, defaut) => {
  const v = Number(option(nom, defaut));
  if (!Number.isFinite(v) || v < 0) {
    console.error(`Option ${nom} invalide : « ${option(nom, defaut)} ».`);
    process.exit(1);
  }
  return Math.floor(v);
};
if (!['cible', 'paliers', 'long'].includes(scenario)) {
  console.error('Usage : node simulation/charge/executer.mjs <cible|paliers|long> [options] — voir docs/simulation/charge.md');
  process.exit(1);
}

const apiRoot = trouverApiRoot(RACINE);
if (!apiRoot) {
  console.error('amn-api introuvable : renseignez AMN_API_ROOT (voir scripts/api-root.mjs).');
  process.exit(2);
}

/* --------------------------------- Les jeux --------------------------------- */

async function chargerGenerateur() {
  const built = await esbuild.build({
    entryPoints: [path.join(RACINE, 'src', 'refonte', 'donnees', 'index.ts')],
    bundle: true, write: false, format: 'esm', platform: 'neutral', target: 'node22', charset: 'utf8',
  });
  return import(`data:text/javascript;charset=utf-8;base64,${Buffer.from(built.outputFiles[0].text, 'utf8').toString('base64')}`);
}
const G = await chargerGenerateur();

/* --------------------------------- Le serveur --------------------------------- */

process.env.NODE_ENV = 'test'; // pas de courrier, pas de paiement, pas de rondes de la Garde
process.env.OPERATOR_TOKEN ||= crypto.randomBytes(24).toString('base64url');
const depuis = (f) => import(pathToFileURL(path.join(apiRoot, f)).href);
const { createApp } = await depuis('src/server.js');
const { createSqliteDb } = await depuis('src/db/sqlite.js');
const { createHub } = await depuis('src/ws/hub.js');
const { mintToken } = await depuis('src/lib/password.js');
const { AMN_ORG_ID } = await depuis('src/db/tenancy.js');

const dossierJetable = scenario === 'long' ? fs.mkdtempSync(path.join(os.tmpdir(), 'amn-charge-')) : null;
const cheminBase = dossierJetable ? path.join(dossierJetable, 'charge.db') : ':memory:';
let db = createSqliteDb(cheminBase);
await db.init();
let serveur = null;
let hub = null;
let port = 0;

async function demarrerServeur() {
  const app = await createApp({ db });
  serveur = http.createServer(app);
  hub = createHub(serveur, { db });
  app.locals.hub = hub;
  // 127.0.0.1 et rien d'autre ; au redémarrage, le MÊME port (les personnes simulées ne changent pas d'adresse).
  await new Promise((ok, ko) => { serveur.once('error', ko); serveur.listen(port, '127.0.0.1', ok); });
  port = serveur.address().port;
}
async function arreterServeur() {
  hub?.close();
  serveur.closeAllConnections?.();
  await new Promise((ok) => serveur.close(ok));
}
await demarrerServeur();
const base = () => `http://127.0.0.1:${port}`;

/* ---------------------------- Les personnes simulées ---------------------------- */

const graine = entier('--graine', G.GRAINE_REFERENCE ?? 20261030) || 20261030;
const nbOrganisations = entier('--organisations', scenario === 'cible' ? 100 : 40);
const organisations = G.genererOrganisationsDeCharge({ graine, nombre: nbOrganisations });
const parOrg = Math.max(2, entier('--connectes-par-organisation', 2)); // au moins 2 : il faut un collègue pour voir l'écriture
const donneesMax = entier('--donnees-max', 40);
const crees = new Map(); // org.id → { orgId, utilisateurs[] }

async function creerSession(user) {
  const { plaintext, hash } = mintToken();
  await db.createSession({ tokenHash: hash, userId: user.id, expiresAt: new Date(Date.now() + 6 * 3_600_000).toISOString() });
  return plaintext;
}

/** Crée l'organisation, ses `parOrg` personnes connectées et ses données de départ (selon sa taille). */
async function creerOrganisation(org) {
  if (crees.has(org.id)) return crees.get(org.id);
  const o = await db.createOrganization({ name: org.nom, plan: 'business_standard' });
  const utilisateurs = [];
  for (let rang = 0; rang < Math.min(parOrg, org.effectif); rang += 1) {
    const email = G.emailDuMembre(org, rang);
    if (!email.endsWith('.exemple.test')) throw new Error(`courriel non fictif refusé : ${email}`);
    const role = rang === 0 ? 'owner' : 'member';
    const u = await db.createUser({ orgId: o.id, email, passwordHash: null, role, status: 'active' });
    await db.addMembership({ userId: u.id, orgId: o.id, role });
    utilisateurs.push({ email, orgId: o.id, token: await creerSession(u), organisation: org.id });
  }
  const departs = Math.min(donneesMax, { peu: 10, normal: 40, beaucoup: 120 }[org.volume]);
  for (let k = 0; k < departs; k += 1) {
    await db.upsertRecord(o.id, 'tasks', `depart-${k}`, { id: `depart-${k}`, title: `Tâche de départ ${k + 1}`, status: k % 3 === 0 ? 'done' : 'todo', assigneeEmail: utilisateurs[0]?.email ?? '', createdAt: new Date().toISOString() });
  }
  const r = { orgId: o.id, utilisateurs };
  crees.set(org.id, r);
  return r;
}

async function creerInternes(n) {
  const gens = [];
  for (const email of G.EQUIPE_INTERNE_DE_CHARGE.slice(0, n)) {
    const u = await db.createUser({ orgId: AMN_ORG_ID, email, passwordHash: null, role: 'admin', status: 'active' });
    await db.addMembership({ userId: u.id, orgId: AMN_ORG_ID, role: 'admin' });
    gens.push({ email, orgId: AMN_ORG_ID, token: await creerSession(u), organisation: 'interne' });
  }
  return gens;
}

/* --------------------------------- Mesures --------------------------------- */

let fenetre = []; // les actions de la période en cours
const toutes = [];
const visibilite = []; // ms entre l'écriture et l'arrivée chez un collègue
let manquees = 0; // écritures jamais vues par un collègue dans le délai
const acquittees = new Map(); // `${orgId}/${id}` → 'vivant' | 'retire' (ce que le serveur a acquitté)
let indisponibles = 0;
const arret = { demande: false };
const lag = monitorEventLoopDelay({ resolution: 20 });
lag.enable();
let rssMax = 0;

const percentile = (valeurs, p) => {
  if (valeurs.length === 0) return null;
  const t = [...valeurs].sort((a, b) => a - b);
  return Math.round(t[Math.min(t.length - 1, Math.ceil(p * t.length) - 1)] * 10) / 10;
};

async function appel(u, methode, chemin, corps) {
  const t0 = performance.now();
  try {
    const r = await fetch(`${base()}${chemin}`, {
      method: methode,
      headers: { Authorization: `Bearer ${u.token}`, 'Content-Type': 'application/json' },
      body: corps ? JSON.stringify(corps) : undefined,
      signal: AbortSignal.timeout(10_000),
      redirect: 'error',
    });
    await r.text();
    return { ok: r.ok, status: r.status, ms: performance.now() - t0 };
  } catch {
    return { ok: false, status: 0, ms: performance.now() - t0, indisponible: true };
  }
}

function noter(action, r) {
  if (r.indisponible) indisponibles += 1;
  const m = { action, ms: r.ms, ok: r.ok, indisponible: Boolean(r.indisponible) };
  fenetre.push(m);
  toutes.push(m);
}

/* ---------------------------- Une personne qui travaille ---------------------------- */

const attente = (ms) => new Promise((ok) => setTimeout(ok, ms));
const tirer = (hasard) => {
  let x = hasard() * 100;
  for (const a of G.MELANGE_D_ACTIONS) { x -= a.poids; if (x < 0) return a; }
  return G.MELANGE_D_ACTIONS[0];
};

function ouvrirFlux(u, collegues) {
  const ouvrir = () => {
    if (arret.demande) return;
    const ws = new WebSocket(`ws://127.0.0.1:${port}/v1/stream?token=${encodeURIComponent(u.token)}&user=${encodeURIComponent(u.email)}`);
    u.ws = ws;
    ws.onmessage = (e) => {
      let m; try { m = JSON.parse(e.data); } catch { return; }
      if (m.type !== 'record') return;
      const attendu = u.attendus?.get(m.record?.id);
      if (attendu) { visibilite.push(performance.now() - attendu); u.attendus.delete(m.record.id); }
    };
    ws.onclose = () => { if (!arret.demande && !u.coupe) setTimeout(ouvrir, 500 + Math.random() * 1000); };
    ws.onerror = () => undefined;
  };
  u.attendus = new Map();
  u.collegues = collegues;
  ouvrir();
}

async function travailler(u, hasard) {
  let n = 0;
  while (!arret.demande) {
    await attente(G.PAUSE_ENTRE_ACTIONS_MS.min + hasard() * (G.PAUSE_ENTRE_ACTIONS_MS.max - G.PAUSE_ENTRE_ACTIONS_MS.min));
    if (arret.demande) break;
    const a = tirer(hasard);
    n += 1;
    const id = `${u.email.split('@')[0]}-${n}`;
    const cle = `${u.orgId}/${id}`;
    if (a.nom === 'lire une liste') noter(a.nom, await appel(u, 'GET', '/v1/collections/tasks'));
    else if (a.nom === 'ouvrir tout l’espace') noter(a.nom, await appel(u, 'GET', '/v1/collections/_bulk?names=tasks,clients,notes'));
    else if (a.nom === 'retirer un enregistrement') {
      const dernier = [...acquittees.entries()].reverse().find(([k, v]) => k.startsWith(`${u.orgId}/${u.email.split('@')[0]}-`) && v === 'vivant');
      if (!dernier) continue;
      const r = await appel(u, 'DELETE', `/v1/collections/tasks/${encodeURIComponent(dernier[0].split('/')[1])}`);
      if (r.ok) acquittees.set(dernier[0], 'retire');
      noter(a.nom, r);
    } else {
      const visible = a.nom.startsWith('écrire un enregistrement vu');
      const donnee = { id, title: `Tâche simulée ${n}`, status: 'todo', assigneeEmail: u.email, createdAt: new Date().toISOString() };
      const pairs = u.collegues.filter((c) => c !== u && c.ws?.readyState === 1);
      const t0 = performance.now();
      if (visible && pairs.length) for (const c of pairs) c.attendus.set(id, t0);
      const r = await appel(u, 'PUT', `/v1/collections/tasks/${encodeURIComponent(id)}`, { data: donnee });
      if (r.ok) acquittees.set(cle, 'vivant');
      noter(a.nom, r);
      if (visible && pairs.length) {
        setTimeout(() => { for (const c of pairs) if (c.attendus.delete(id)) manquees += 1; }, G.SEUILS_DE_CHARGE.visibiliteMs + 500);
      }
    }
  }
}

/** mulberry32, comme les jeux : un essai se rejoue avec la même graine. */
const hasardDe = (valeur) => { let a = valeur >>> 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };

const actifs = []; // { u, tache }
async function lancer(utilisateurs, groupe) {
  for (const u of utilisateurs) {
    ouvrirFlux(u, groupe);
    actifs.push({ u, tache: travailler(u, hasardDe(graine ^ [...u.email].reduce((s, c) => (s * 31 + c.charCodeAt(0)) >>> 0, 7))) });
  }
}

/* ---------------------------- Le rapport d'une période ---------------------------- */

function resumer(mesures, titre, dureeS) {
  const utiles = mesures.filter((m) => !m.indisponible);
  const lentes = utiles.filter((m) => m.ms > G.SEUILS_DE_CHARGE.actionRapideMs).length;
  const part = utiles.length ? 1 - lentes / utiles.length : 1;
  const parAction = {};
  for (const m of utiles) (parAction[m.action] ||= []).push(m.ms);
  return {
    titre,
    dureeS,
    actions: mesures.length,
    parSeconde: dureeS ? Math.round((mesures.length / dureeS) * 10) / 10 : null,
    erreurs: utiles.filter((m) => !m.ok).length,
    indisponibles: mesures.length - utiles.length,
    partEnMoinsDeLaSeconde: Math.round(part * 1000) / 10,
    seuilPartTenu: part >= G.SEUILS_DE_CHARGE.partRapide,
    p50: percentile(utiles.map((m) => m.ms), 0.5),
    p95: percentile(utiles.map((m) => m.ms), 0.95),
    p99: percentile(utiles.map((m) => m.ms), 0.99),
    parAction: Object.fromEntries(Object.entries(parAction).map(([k, v]) => [k, { n: v.length, p95: percentile(v, 0.95) }])),
  };
}

/** Chaque écriture acquittée doit être relue telle qu'acquittée. C'est LA propriété : aucune perte, aucun écrasement. */
async function verifierLesEcritures() {
  const parOrg = new Map();
  for (const [cle, etat] of acquittees) { const [orgId, id] = [cle.slice(0, cle.indexOf('/')), cle.slice(cle.indexOf('/') + 1)]; (parOrg.get(orgId) ?? parOrg.set(orgId, []).get(orgId)).push([id, etat]); }
  let perdues = 0;
  for (const [orgId, liste] of parOrg) {
    const lignes = await db.listRecords(orgId, 'tasks');
    const parId = new Map(lignes.map((l) => [l.id, l]));
    for (const [id, etat] of liste) {
      const l = parId.get(id);
      if (!l || l.deleted !== (etat === 'retire')) perdues += 1;
    }
  }
  return { acquittees: acquittees.size, perdues };
}

function etatDuProcessus() {
  const mem = process.memoryUsage();
  rssMax = Math.max(rssMax, mem.rss);
}

/* --------------------------------- Scénarios --------------------------------- */

const t0 = performance.now();
const cpu0 = process.cpuUsage();
const sonde = setInterval(etatDuProcessus, 1000);
const rapport = { scenario, graine, organisations: nbOrganisations, periodes: [] };

async function jouerCible() {
  const connectees = entier('--connectees', G.CIBLE_DE_CHARGE.connectees);
  const internes = entier('--internes', G.CIBLE_DE_CHARGE.internes);
  const duree = entier('--duree-s', 60);
  const choisies = G.choisirConnectees(organisations, connectees, graine);
  for (const org of organisations) await creerOrganisation(org); // toutes existent ; 20 travaillent
  for (const org of choisies) { const { utilisateurs } = crees.get(org.id); await lancer(utilisateurs, utilisateurs); }
  const eq = await creerInternes(internes);
  await lancer(eq, eq);
  fenetre = [];
  const debut = performance.now();
  await attente(duree * 1000);
  rapport.periodes.push(resumer(fenetre, `${choisies.length} organisations connectées + ${eq.length} internes`, (performance.now() - debut) / 1000));
}

async function jouerPaliers() {
  const paliers = option('--paliers', '10,20,40').split(',').map((x) => Number(x)).filter((x) => x > 0);
  const duree = entier('--palier-s', 15);
  const tousLesOrganisationsNecessaires = G.genererOrganisationsDeCharge({ graine, nombre: Math.max(...paliers) });
  const eq = await creerInternes(G.CIBLE_DE_CHARGE.internes);
  await lancer(eq, eq);
  let deja = 0;
  for (const p of paliers) {
    const choisies = G.choisirConnectees(tousLesOrganisationsNecessaires, p, graine);
    for (const org of choisies.slice(deja)) { const { utilisateurs } = await creerOrganisation(org); await lancer(utilisateurs, utilisateurs); }
    deja = choisies.length;
    fenetre = [];
    const visAvant = visibilite.length;
    const debut = performance.now();
    await attente(duree * 1000);
    const r = resumer(fenetre, `palier ${p} organisations connectées`, (performance.now() - debut) / 1000);
    r.visibiliteP95 = percentile(visibilite.slice(visAvant), 0.95);
    r.cpuPourcent = Math.round(((process.cpuUsage(cpu0).user + process.cpuUsage(cpu0).system) / 1000 / (performance.now() - t0)) * 100);
    r.retardBoucleMaxMs = Math.round(lag.max / 1e6);
    r.rssMaxMo = Math.round(rssMax / 1048576);
    rapport.periodes.push(r);
  }
  const rupture = rapport.periodes.find((r) => !r.seuilPartTenu || r.erreurs > 0);
  rapport.premierPointDeRupture = rupture ? { palier: rupture.titre, cause: rupture.erreurs > 0 ? 'erreurs' : 'lenteur', cpuPourcent: rupture.cpuPourcent, retardBoucleMaxMs: rupture.retardBoucleMaxMs, rssMaxMo: rupture.rssMaxMo } : null;
}

async function jouerLong() {
  const duree = entier('--duree-s', 120);
  const coupure = entier('--coupure-s', 30);
  const redemarrage = entier('--redemarrage-s', 45);
  const choisies = G.choisirConnectees(organisations, entier('--connectees', 6), graine);
  for (const org of choisies) { const { utilisateurs } = await creerOrganisation(org); await lancer(utilisateurs, utilisateurs); }
  const eq = await creerInternes(G.CIBLE_DE_CHARGE.internes);
  await lancer(eq, eq);
  const evenements = { coupuresReseau: 0, redemarrages: 0 };
  const debut = performance.now();
  fenetre = [];
  let prochaineCoupure = coupure * 1000;
  let prochainRedemarrage = redemarrage * 1000;
  while (performance.now() - debut < duree * 1000) {
    await attente(1000);
    const ecoule = performance.now() - debut;
    if (coupure && ecoule >= prochaineCoupure) {
      // Une coupure réseau : tous les flux se ferment, les postes se reconnectent seuls.
      for (const { u } of actifs) u.ws?.close();
      evenements.coupuresReseau += 1;
      prochaineCoupure += coupure * 1000;
    }
    if (redemarrage && ecoule >= prochainRedemarrage) {
      // Un plantage suivi d'une reprise : le serveur s'arrête net, la base est rouverte depuis son fichier.
      await arreterServeur();
      await db.close();
      await attente(1500);
      db = createSqliteDb(cheminBase);
      await db.init();
      await demarrerServeur();
      evenements.redemarrages += 1;
      prochainRedemarrage += redemarrage * 1000;
    }
  }
  rapport.periodes.push(resumer(fenetre, 'essai long (coupures et redémarrages)', (performance.now() - debut) / 1000));
  rapport.evenements = evenements;
}

try {
  if (scenario === 'cible') await jouerCible();
  else if (scenario === 'paliers') await jouerPaliers();
  else await jouerLong();
} finally {
  arret.demande = true;
  clearInterval(sonde);
  for (const { u } of actifs) { u.coupe = true; try { u.ws?.close(); } catch { /* déjà fermé */ } }
  await Promise.allSettled(actifs.map((a) => a.tache));
}

await attente(300);
manquees += [...actifs].reduce((s, { u }) => s + (u.attendus?.size ?? 0), 0);
rapport.visibilite = { observees: visibilite.length, p95Ms: percentile(visibilite, 0.95), manquees, seuilMs: G.SEUILS_DE_CHARGE.visibiliteMs, seuilTenu: manquees === 0 && (percentile(visibilite, 0.95) ?? 0) < G.SEUILS_DE_CHARGE.visibiliteMs };
rapport.ecritures = await verifierLesEcritures();
rapport.indisponibles = indisponibles;
rapport.global = resumer(toutes, 'tout l’essai', (performance.now() - t0) / 1000);

await arreterServeur();
await db.close();
if (dossierJetable) fs.rmSync(dossierJetable, { recursive: true, force: true });
lag.disable();

/* --------------------------------- Compte rendu --------------------------------- */

const ligne = (r) => `  ${r.titre}\n    ${r.actions} actions (${r.parSeconde}/s) · ${r.erreurs} erreurs · ${r.indisponibles} indisponibles · ${r.partEnMoinsDeLaSeconde} % en moins d’1 s · p50 ${r.p50} ms · p95 ${r.p95} ms · p99 ${r.p99} ms${r.cpuPourcent === undefined ? '' : `\n    ressources : processeur ${r.cpuPourcent} % · mémoire ${r.rssMaxMo} Mo · retard de boucle max ${r.retardBoucleMaxMs} ms · visibilité p95 ${r.visibiliteP95} ms`}`;
console.log(`\nScénario « ${scenario} » — graine ${graine}, ${nbOrganisations} organisations fictives (127.0.0.1, en mémoire)\n`);
for (const r of rapport.periodes) console.log(ligne(r));
console.log(`\n  Visibilité chez un collègue : ${rapport.visibilite.observees} observées · p95 ${rapport.visibilite.p95Ms} ms · ${rapport.visibilite.manquees} manquées (seuil ${rapport.visibilite.seuilMs} ms)`);
console.log(`  Écritures acquittées : ${rapport.ecritures.acquittees} · perdues ou écrasées : ${rapport.ecritures.perdues}`);
if (rapport.evenements) console.log(`  Coupures réseau : ${rapport.evenements.coupuresReseau} · redémarrages : ${rapport.evenements.redemarrages}`);
if (scenario === 'paliers') console.log(`  Premier point de rupture : ${rapport.premierPointDeRupture ? JSON.stringify(rapport.premierPointDeRupture) : 'aucun sur ces paliers'}`);
console.log('\n  Chiffres indicatifs : le serveur et les personnes simulées partagent un processus. Les vrais chiffres viendront du serveur maison.');

const sortie = option('--json', '');
if (sortie) fs.writeFileSync(sortie, `${JSON.stringify(rapport, null, 2)}\n`);
// Seule une perte ou un écrasement fait échouer l'exécution : les seuils de vitesse sont un constat, pas une panne du script.
process.exit(rapport.ecritures.perdues > 0 ? 1 : 0);

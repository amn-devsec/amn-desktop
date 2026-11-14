#!/usr/bin/env node
/**
 * UN GESTE MÈNE-T-IL À CHAQUE ÉCRAN ? (condition d'allumage de la coquille v4, STATUT §1.37)
 *
 * La coquille v4 ne lie plus 39 écrans de l'ancienne barre (C-011 §3). Ils existent par leur adresse ; reste à savoir si un
 * geste d'une personne y mène : un lien ou un onglet dans le CONTENU d'une autre page (la barre latérale et l'en-tête, communs
 * à tous les écrans, ne comptent pas), ou une ligne de « Tous les modules ».
 *
 * Le script visite chaque route de `docs/qualite/routes-interne.json`, relève les liens `#/…` du contenu, clique chaque onglet
 * (`role=tab`) et relève de nouveau, puis ouvre chaque ligne de « Tous les modules » pour lire sa destination. Une route
 * sans aucun geste entrant est rendue comme telle.
 *
 *   node scripts/qualite/routes-atteignables.mjs --dist <build-interne> [--cibles '#/relances,#/tracker' | --depuis-liste f.json] [--api …] [--sortie f.json]
 *
 * Sans `--cibles`, les cibles sont les routes de la liste que ni la barre ni « Tous les modules » ne relient.
 * Même sûreté que le reste de la chaîne : build servi depuis le disque, réseau limité à cette machine, compte @exemple.test.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, '..', '..');
const require = createRequire(path.join(RACINE, 'package.json'));
const { chromium } = require('playwright-core');
const args = process.argv.slice(2);
const opt = (n, d = null) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const DIST = opt('dist');
const API = opt('api', 'http://127.0.0.1:4171');
const SORTIE = opt('sortie');
const CIBLES_ARG = opt('cibles');
if (!DIST) { console.error("Usage : routes-atteignables.mjs --dist <build-interne> [--cibles '#/a,#/b'] [--api …] [--sortie f.json]"); process.exit(2); }
if (!/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(API)) { console.error('--api : cette machine seulement'); process.exit(2); }
const MAIL = process.env.AMN_E2E_EMAIL ?? 'essai.interne@exemple.test';
const MDP = process.env.AMN_E2E_PASSWORD ?? 'Interne-2026-Essai';
if (!/@exemple\.test$/i.test(MAIL)) { console.error('compte refusé (pas en @exemple.test)'); process.exit(2); }

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };
const ORIGINE = 'https://amn.local';
const hote = new URL(API).host;
const attendre = (ms) => new Promise((r) => setTimeout(r, ms));
const nav = await chromium.launch({ executablePath: process.env.AMN_E2E_CHROMIUM ?? '/opt/pw-browsers/chromium', args: ['--no-sandbox', '--no-proxy-server', '--disable-features=LocalNetworkAccessChecks,PrivateNetworkAccessSendPreflights,PrivateNetworkAccessRespectPreflightResults,BlockInsecurePrivateNetworkRequests'] });
const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', locale: 'fr-FR' });
await ctx.route((u) => !['file:', 'data:', 'blob:', 'about:'].includes(u.protocol) && u.host !== hote, (route) => {
  const u = new URL(route.request().url());
  if (u.origin !== ORIGINE) return route.abort();
  let f = path.join(DIST, decodeURIComponent(u.pathname));
  if (!f.startsWith(DIST) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(DIST, 'index.html');
  return route.fulfill({ status: 200, body: fs.readFileSync(f), contentType: TYPES[path.extname(f)] ?? 'application/octet-stream' });
});
await ctx.addInitScript((m) => {
  try {
    for (const q of ['general', 'profil', 'presentation']) localStorage.setItem(`amn.guide.${q}.${m}`, 'vu');
    localStorage.setItem(`amn.demarrage.propose.${m}`, '1');
    localStorage.setItem('amn.welcome.lastShown', new Date().toISOString().slice(0, 10));
    localStorage.setItem('amn.coquille', 'noir');
  } catch { /* sans stockage */ }
}, MAIL);
const page = await ctx.newPage();
await page.goto(`${ORIGINE}/`); await attendre(2500);
await page.locator('input[name="email"]').fill(MAIL);
await page.locator('input[name="password"]').fill(MDP);
await page.locator('button:has-text("Se connecter")').click();
await attendre(4000);

const liste = JSON.parse(fs.readFileSync(path.join(RACINE, 'docs', 'qualite', 'routes-interne.json'), 'utf8')).routes;
/** Les liens du CONTENU : hors barre latérale et hors en-tête, communs à tous les écrans. */
const liensContenu = () => page.evaluate(() => [...document.querySelectorAll('a[href^="#/"]')]
  .filter((a) => !a.closest('[data-socle="lateral"], [data-socle="entete"], [data-socle="ajmani"], aside, header, nav'))
  .map((a) => a.getAttribute('href')));
const entrants = new Map(); // route cible → Set de sources
const noter = (source, hrefs) => { for (const h of hrefs) { const cle = h.split('?')[0]; if (cle === source.split('?')[0]) continue; if (!entrants.has(cle)) entrants.set(cle, new Set()); entrants.get(cle).add(source); } };

// 1. liens et onglets du contenu de chaque écran
for (const r of liste) {
  await page.goto(`${ORIGINE}/${r}`); await attendre(1000);
  noter(r, await liensContenu());
  const n = await page.locator('[role="tab"]').count();
  for (let i = 0; i < Math.min(n, 8); i += 1) {
    try { await page.locator('[role="tab"]').nth(i).click({ timeout: 1500 }); await attendre(350); noter(`${r} (onglet ${i + 1})`, await liensContenu()); } catch { /* onglet caché */ }
  }
}
// 2. « Tous les modules » : où mène chaque ligne ?
await page.goto(`${ORIGINE}/#/tous-les-modules`); await attendre(2000);
const lignes = await page.evaluate(() => [...document.querySelectorAll('[data-ligne]:not([data-action])')].map((l) => l.getAttribute('data-ligne')));
const lignesVers = new Map();
for (const id of lignes) {
  await page.goto(`${ORIGINE}/#/tous-les-modules`); await attendre(500);
  await page.evaluate((x) => document.querySelector(`[data-ligne="${CSS.escape(x)}"]`)?.click(), id); await attendre(450);
  const h = (await page.evaluate(() => location.hash)).split('?')[0];
  if (h && h !== '#/tous-les-modules') { lignesVers.set(id, h); noter('#/tous-les-modules (ligne)', [h]); }
}
await nav.close();

// 3. les cibles : ce que la barre et « Tous les modules » ne relient pas
let cibles;
if (CIBLES_ARG) cibles = CIBLES_ARG.split(',').map((x) => x.trim());
else {
  const barre = JSON.parse(fs.readFileSync(path.join(RACINE, 'docs', 'qualite', 'routes-interne.json'), 'utf8')).routes; // la liste ne dit pas qui est dans la barre : on prend les 39 de C-011
  void barre;
  cibles = ['#/absences', '#/priorites', '#/rdv-en-ligne', '#/routines', '#/tableau-de-bord', '#/tableau-projets', '#/nps', '#/parrainage', '#/scoring-leads', '#/sentiment', '#/media', '#/outils/traduction', '#/pages', '#/personnel/journal', '#/signature-a-distance', '#/abonnements', '#/acompte', '#/factures-entrantes', '#/notes-de-frais', '#/prevision-fiscale', '#/relances', '#/scenarios', '#/simulateur-pret', '#/groupes', '#/salles', '#/flotte', '#/identite-visuelle', '#/interventions', '#/itineraires', '#/portfolio', '#/prevision-stock', '#/productions-video', '#/outils/calculatrice', '#/outils/convertisseurs', '#/alertes-personnalisees', '#/comparatif', '#/comply', '#/ssl', '#/tracker'];
}
const resultats = cibles.map((c) => ({ route: c, sources: [...(entrants.get(c) ?? [])].slice(0, 4), nombre: (entrants.get(c) ?? new Set()).size }));
console.log(`${liste.length} écran(s) visités, ${lignesVers.size}/${lignes.length} ligne(s) de « Tous les modules » ouvertes.`);
for (const r of resultats) console.log(`${r.nombre ? '✓' : '✗ AUCUN GESTE'}  ${r.route.padEnd(30)} ${r.sources.join(' · ')}`);
if (SORTIE) fs.writeFileSync(path.resolve(SORTIE), JSON.stringify({ visites: liste.length, lignes: lignes.length, lignesOuvertes: lignesVers.size, resultats }, null, 2));
process.exit(resultats.some((r) => !r.nombre) ? 1 : 0);

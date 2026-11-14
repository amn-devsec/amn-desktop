#!/usr/bin/env node
/**
 * LES ÉLÉMENTS LUDIQUES PROTÉGÉS (STATUT §1.10) — sont-ils à l'écran ?
 *
 * Le dirigeant y tient et demande de ne rien simplifier : le défi d'équipe L07, les trophées et paliers (H02, H04, L01,
 * MB04, CY01, CY04) et les défis hebdomadaires. Un élément absent d'un écran LIVRÉ est un écart bloquant.
 *
 * Ce script parcourt les écrans de l'édition interne (liste de `docs/qualite/routes-interne.json` + la navigation) et
 * cherche, pour chaque élément, ses mots à l'écran. Il ne sait pas quel lot a livré quoi : il dit où chaque élément se
 * trouve, ou qu'il ne se trouve nulle part — au CO de lire « absent » à la lumière des lots livrés.
 *
 *   node scripts/qualite/ludiques-proteges.mjs --dist <build-interne> [--api http://127.0.0.1:4171] [--sortie f.json] [--controle]
 *
 * MB04 est un écran de téléphone : il se cherche à 390 px (option --mobile, deuxième passage sur les mêmes routes).
 * Sortie 1 si au moins un élément est absent partout.
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
const TEXTES = opt('textes'); // dossier de textes rendus (*.txt, p. ex. la sortie de check:fidelite sur l'aperçu rempli) : on cherche là, sans navigateur
const CONTROLE = args.includes('--controle'); // contrôle positif : trois écrans, un mot qui s'y trouve sûrement ; doit sortir « trouvé »
if (!DIST && !TEXTES) { console.error('Usage : ludiques-proteges.mjs --dist <build-interne> [--api …] [--sortie f.json]  |  --textes <dossier de *.txt>'); process.exit(2); }
if (!/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(API)) { console.error('--api : cette machine seulement'); process.exit(2); }
const MAIL = process.env.AMN_E2E_EMAIL ?? 'essai.interne@exemple.test';
const MDP = process.env.AMN_E2E_PASSWORD ?? 'Interne-2026-Essai';
if (!/@exemple\.test$/i.test(MAIL)) { console.error('compte refusé (pas en @exemple.test)'); process.exit(2); }

/** Les éléments protégés et les mots qui les font reconnaître (STATUT §1.10, fiches v4). Tous les mots d'un élément doivent se trouver, sur un même écran. */
const ELEMENTS = [
  { id: 'L07 · défi d’équipe', mots: [/défi de la semaine/i, /ce que chacun apporte/i] },
  { id: 'L07 · aussi en cours', mots: [/aussi en cours/i] },
  { id: 'L07 · proposer un défi', mots: [/proposer un défi/i] },
  { id: 'L07 · page « Défis d’équipe »', mots: [/défis d.équipe/i] },
  { id: 'défis hebdomadaires', mots: [/défi/i, /cette semaine|de la semaine/i, /\d+\s*(?:\/|sur)\s*\d+|jauge/i] },
  { id: 'H02 · série et prochain palier', mots: [/série de \d+ jours?/i, /prochain palier/i] },
  { id: 'H04 · Bilan de la semaine', mots: [/bilan de la semaine/i, /clôturer la semaine/i] },
  { id: 'L01 · Séries et jalons', mots: [/séries et jalons/i, /partager un succès/i] },
  { id: 'MJ02 · Habitudes, séries', mots: [/faites aujourd.hui/i, /de régularité/i, /série \d+ (j|sem)/i] },
  { id: 'MJ02 · Journées complètes', mots: [/journées complètes/i, /sur \d+ jours/i] },
  { id: 'CY01 · Cyber, vue d’ensemble', mots: [/blue team/i, /osint/i] },
  { id: 'CY04 · SOC', mots: [/nouvelle règle/i, /ouvrir la garde/i] },
  { id: 'MB04 · Messages et alertes (mobile)', mots: [/messages et alertes/i], mobile: true },
];

if (CONTROLE) ELEMENTS.splice(0, ELEMENTS.length, { id: 'contrôle positif (« Tâches ouvertes »)', mots: [/tâches ouvertes/i] });

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };
const ORIGINE = 'https://amn.local';
const hote = new URL(API).host;
const attendre = (ms) => new Promise((r) => setTimeout(r, ms));
const nav = TEXTES ? null : await chromium.launch({ executablePath: process.env.AMN_E2E_CHROMIUM ?? '/opt/pw-browsers/chromium', args: ['--no-sandbox', '--no-proxy-server', '--disable-features=LocalNetworkAccessChecks,PrivateNetworkAccessSendPreflights,PrivateNetworkAccessRespectPreflightResults,BlockInsecurePrivateNetworkRequests'] });

async function parcourir(largeur) {
  const ctx = await nav.newContext({ viewport: { width: largeur, height: largeur < 600 ? 800 : 900 }, serviceWorkers: 'block', locale: 'fr-FR' });
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
  let routes = [];
  try { routes = JSON.parse(fs.readFileSync(path.join(RACINE, 'docs', 'qualite', 'routes-interne.json'), 'utf8')).routes ?? []; } catch { /* sans liste */ }
  const liens = await page.evaluate(() => [...document.querySelectorAll('a[href^="#/"]')].map((a) => a.getAttribute('href')));
  routes = CONTROLE ? ['#/', '#/tasks', '#/notifications'] : [...new Set([...routes, ...liens, '#/', '#/tasks', '#/notifications'])];
  const textes = new Map();
  for (const r of routes) {
    await page.goto(`${ORIGINE}/${r}`); await attendre(1100);
    textes.set(r, await page.evaluate(() => document.body.innerText || ''));
  }
  await ctx.close();
  return textes;
}

const bureau = TEXTES
  ? new Map(fs.readdirSync(TEXTES).filter((f) => f.endsWith('.txt')).map((f) => [f.replace(/\.txt$/, ''), fs.readFileSync(path.join(TEXTES, f), 'utf8')]))
  : await parcourir(1440);
const mobile = !TEXTES && ELEMENTS.some((e) => e.mobile) ? await parcourir(390) : new Map();
if (nav) await nav.close();

const resultats = ELEMENTS.map((e) => {
  const source = e.mobile ? mobile : bureau;
  const ou = [...source.entries()].filter(([, t]) => e.mots.every((m) => m.test(t))).map(([r]) => r);
  return { id: e.id, ou: ou.slice(0, 5), nombre: ou.length, absent: ou.length === 0 };
});
console.log(`${bureau.size} écran(s) parcourus à 1440 px${mobile.size ? `, ${mobile.size} à 390 px` : ''} :`);
for (const r of resultats) console.log(`${r.absent ? '✗ ABSENT' : '✓       '}  ${r.id.padEnd(40)} ${r.absent ? '' : r.ou.join(' ')}`);
if (SORTIE) fs.writeFileSync(path.resolve(SORTIE), JSON.stringify({ ecrans: bureau.size, resultats }, null, 2));
process.exit(resultats.some((r) => r.absent) ? 1 : 0);

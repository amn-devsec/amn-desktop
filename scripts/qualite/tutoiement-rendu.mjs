#!/usr/bin/env node
/**
 * LE TUTOIEMENT, TEL QU'IL S'AFFICHE — pas tel qu'il est écrit dans le code.
 *
 * Règle v4 : tutoiement dans l'interface ; le vouvoiement reste pour les textes destinés aux clientes et clients
 * (lettres, relances, devis, portail). Ici on parcourt les écrans de l'édition interne dans un navigateur et on
 * relève chaque « vous / votre / vos » VISIBLE. « Rendez-vous » et « êtes-vous » (pluriel : « Combien êtes-vous ? »)
 * sont écartés (un trait d'union colle le mot). Les textes de client — une lettre de relance affichée dans une
 * fenêtre, par exemple — sont à classer à la main : le script les liste avec leur écran, il ne devine pas.
 *
 *   node scripts/qualite/tutoiement-rendu.mjs --dist <build-interne> [--api http://127.0.0.1:4171] [--coquille] [--sortie f.json]
 *
 * Les routes viennent des liens de la navigation (rail ou coquille) plus une liste de départ. Même sûreté que la chaîne
 * de captures : build servi depuis le disque, réseau limité à cette machine, compte @exemple.test.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.resolve(ICI, '..', '..', 'package.json'));
const { chromium } = require('playwright-core');
const args = process.argv.slice(2);
const opt = (n, d = null) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const DIST = opt('dist');
const API = opt('api', 'http://127.0.0.1:4171');
const COQUILLE = args.includes('--coquille');
const SORTIE = opt('sortie');
if (!DIST) { console.error('Usage : tutoiement-rendu.mjs --dist <build-interne> [--api …] [--coquille] [--sortie f.json]'); process.exit(2); }
if (!/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(API)) { console.error('--api : cette machine seulement'); process.exit(2); }
const MAIL = process.env.AMN_E2E_EMAIL ?? 'essai.interne@exemple.test';
const MDP = process.env.AMN_E2E_PASSWORD ?? 'Interne-2026-Essai';
if (!/@exemple\.test$/i.test(MAIL)) { console.error('compte refusé (pas en @exemple.test)'); process.exit(2); }

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };
const ORIGINE = 'https://amn.local';
const attendre = (ms) => new Promise((r) => setTimeout(r, ms));
const VOUS = /(?<![\p{L}\p{N}_-])(vous|votre|vos|vôtre|vôtres)(?![\p{L}\p{N}_-])/giu;

const nav = await chromium.launch({ executablePath: process.env.AMN_E2E_CHROMIUM ?? '/opt/pw-browsers/chromium', args: ['--no-sandbox', '--no-proxy-server', '--disable-features=LocalNetworkAccessChecks,PrivateNetworkAccessSendPreflights,PrivateNetworkAccessRespectPreflightResults,BlockInsecurePrivateNetworkRequests'] });
const hote = new URL(API).host;
const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', locale: 'fr-FR' });
await ctx.route((u) => !['file:', 'data:', 'blob:', 'about:'].includes(u.protocol) && u.host !== hote, (route) => {
  const u = new URL(route.request().url());
  if (u.origin !== ORIGINE) return route.abort();
  let f = path.join(DIST, decodeURIComponent(u.pathname));
  if (!f.startsWith(DIST) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(DIST, 'index.html');
  return route.fulfill({ status: 200, body: fs.readFileSync(f), contentType: TYPES[path.extname(f)] ?? 'application/octet-stream' });
});
await ctx.addInitScript(([m, coq]) => {
  try {
    for (const q of ['general', 'profil', 'presentation']) localStorage.setItem(`amn.guide.${q}.${m}`, 'vu');
    localStorage.setItem(`amn.demarrage.propose.${m}`, '1');
    localStorage.setItem('amn.welcome.lastShown', new Date().toISOString().slice(0, 10));
    if (coq) localStorage.setItem('amn.coquille', 'noir');
  } catch { /* sans stockage */ }
}, [MAIL, COQUILLE]);
const page = await ctx.newPage();
await page.goto(`${ORIGINE}/`); await attendre(2500);
await page.locator('input[name="email"]').fill(MAIL);
await page.locator('input[name="password"]').fill(MDP);
await page.locator('button:has-text("Se connecter")').click();
await attendre(4000);

const departs = ['#/', '#/notifications', '#/demarrage', '#/demarrage/metier', '#/tous-les-modules', '#/tasks', '#/facturation', '#/clients', '#/messages', '#/agenda'];
const liens = await page.evaluate(() => [...document.querySelectorAll('a[href^="#/"]')].map((a) => a.getAttribute('href')));
const routes = [...new Set([...departs, ...liens])];
const hits = new Map(); // phrase → { ecrans: Set, mot }
let ecrans = 0;
for (const r of routes) {
  await page.goto(`${ORIGINE}/${r}`); await attendre(1400);
  const lignes = await page.evaluate(() => (document.body.innerText || '').split('\n').map((l) => l.trim()).filter(Boolean));
  ecrans += 1;
  for (const l of new Set(lignes)) {
    VOUS.lastIndex = 0;
    const m = VOUS.exec(l);
    if (!m) continue;
    const e = hits.get(l) ?? { ecrans: new Set(), mot: m[1].toLowerCase() };
    e.ecrans.add(r);
    hits.set(l, e);
  }
}
await nav.close();
const liste = [...hits.entries()].map(([texte, e]) => ({ texte: texte.slice(0, 200), mot: e.mot, ecrans: e.ecrans.size, exemples: [...e.ecrans].slice(0, 3) })).sort((a, b) => b.ecrans - a.ecrans);
console.log(`${ecrans} écran(s) parcourus (${COQUILLE ? 'coquille allumée' : 'coquille éteinte'}), ${liste.length} ligne(s) avec « vous / votre / vos » :`);
for (const l of liste) console.log(`  ${String(l.ecrans).padStart(3)}×  « ${l.texte} »  ${l.exemples.join(' ')}`);
if (SORTIE) fs.writeFileSync(path.resolve(SORTIE), JSON.stringify({ coquille: COQUILLE, ecrans, lignes: liste }, null, 2));
process.exit(liste.length ? 1 : 0);

#!/usr/bin/env node
/**
 * RÉGÉNÉRER `docs/qualite/routes-interne.json` — la liste des écrans de l'édition interne que les gardes navigateur
 * doivent parcourir sous la coquille v4 (C-008).
 *
 * La coquille v4 fusionne des modules : plusieurs écrans existent encore mais ne sont plus liés nulle part dans la
 * navigation. On prend donc l'UNION de ce que `routesDeLaCoquille` (scripts/lib/routes-coquille.mjs) trouve avec la
 * coquille éteinte (la barre de l'ancienne coquille liste tout) et avec la coquille v4 allumée.
 *
 *   node scripts/qualite/lister-routes.mjs --dist <build-interne> [--api http://127.0.0.1:4171] [--sortie fichier.json]
 *
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
const { routesDeLaCoquille } = await import(path.join(RACINE, 'scripts', 'lib', 'routes-coquille.mjs'));
const args = process.argv.slice(2);
const opt = (n, d = null) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const DIST = opt('dist');
const API = opt('api', 'http://127.0.0.1:4171');
const SORTIE = path.resolve(opt('sortie', path.join(RACINE, 'docs', 'qualite', 'routes-interne.json')));
if (!DIST) { console.error('Usage : lister-routes.mjs --dist <build-interne> [--api …] [--sortie f.json]'); process.exit(2); }
if (!/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(API)) { console.error('--api : cette machine seulement'); process.exit(2); }
const MAIL = process.env.AMN_E2E_EMAIL ?? 'essai.interne@exemple.test';
const MDP = process.env.AMN_E2E_PASSWORD ?? 'Interne-2026-Essai';
if (!/@exemple\.test$/i.test(MAIL)) { console.error('compte refusé (pas en @exemple.test)'); process.exit(2); }

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };
const ORIGINE = 'https://amn.local';
const hote = new URL(API).host;
const nav = await chromium.launch({ executablePath: process.env.AMN_E2E_CHROMIUM ?? '/opt/pw-browsers/chromium', args: ['--no-sandbox', '--no-proxy-server', '--disable-features=LocalNetworkAccessChecks,PrivateNetworkAccessSendPreflights,PrivateNetworkAccessRespectPreflightResults,BlockInsecurePrivateNetworkRequests'] });

async function lister(coquille) {
  const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', locale: 'fr-FR' });
  await ctx.route((u) => !['file:', 'data:', 'blob:', 'about:'].includes(u.protocol) && u.host !== hote, (route) => {
    const u = new URL(route.request().url());
    if (u.origin !== ORIGINE) return route.abort();
    let f = path.join(DIST, decodeURIComponent(u.pathname));
    if (!f.startsWith(DIST) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(DIST, 'index.html');
    return route.fulfill({ status: 200, body: fs.readFileSync(f), contentType: TYPES[path.extname(f)] ?? 'application/octet-stream' });
  });
  await ctx.addInitScript(([m, c]) => {
    try {
      for (const q of ['general', 'profil', 'presentation']) localStorage.setItem(`amn.guide.${q}.${m}`, 'vu');
      localStorage.setItem(`amn.demarrage.propose.${m}`, '1');
      localStorage.setItem('amn.welcome.lastShown', new Date().toISOString().slice(0, 10));
      if (c) localStorage.setItem('amn.coquille', 'noir');
    } catch { /* sans stockage */ }
  }, [MAIL, coquille]);
  const page = await ctx.newPage();
  await page.goto(`${ORIGINE}/`); await page.waitForTimeout(2500);
  await page.locator('input[name="email"]').fill(MAIL);
  await page.locator('input[name="password"]').fill(MDP);
  await page.locator('button:has-text("Se connecter")').click();
  await page.waitForTimeout(4000);
  // Sans la liste versionnée : on veut ce que la navigation donne, pas ce que le fichier contient déjà.
  process.env.AMN_ROUTES_SUPPLEMENT = path.join(os_tmp(), 'absent.json');
  const r = await routesDeLaCoquille(page, (ms) => page.waitForTimeout(ms));
  await ctx.close();
  return r;
}
function os_tmp() { return fs.mkdtempSync(path.join(fs.realpathSync('/tmp'), 'routes-')); }

const eteinte = await lister(false);
const allumee = await lister(true);
await nav.close();
const union = [...new Set([...eteinte, ...allumee])].sort();
fs.writeFileSync(SORTIE, `${JSON.stringify({ _: "Routes de l'édition interne, pour les gardes navigateur sous la coquille v4. Union de ce que la barre de l'ancienne coquille liste et de ce que la coquille v4 déplie : la coquille v4 fusionne des modules, et plusieurs écrans ne sont plus liés nulle part alors qu'ils existent. À régénérer quand le registre change : node scripts/qualite/lister-routes.mjs (voir docs/qualite/constats/C-008).", routes: union }, null, 1)}\n`);
console.log(`coquille éteinte : ${eteinte.length} · allumée : ${allumee.length} · union : ${union.length} → ${path.relative(RACINE, SORTIE)}`);

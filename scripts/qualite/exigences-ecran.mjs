#!/usr/bin/env node
/**
 * LES EXIGENCES DE L'ÉCRAN REFONDU (STATUT §1.37) — cibles ≥ 34 px, rien de coupé à 390 px.
 *
 * Les défauts des écrans d'origine (C-011) deviennent des exigences de l'écran de la refonte qui les remplace. Ce
 * script les mesure sur des routes données, à 390 px de large (la largeur du plus petit téléphone du produit) :
 *   - aucune coupure : le contenu du document ne dépasse pas la largeur de la fenêtre (`scrollWidth ≤ 390`) ;
 *   - aucune cible interactive visible (lien, bouton, champ, case, rôle button / checkbox / tab…) dont la ZONE DE CLIC est sous
 *     34 px : on sonde neuf points d'un carré de 34 × 34 px centré sur l'élément avec `elementFromPoint` (§1.39 ; un ::after
 *     invisible compte, la boîte seule non). Un lien en ligne dans une phrase est écarté (WCAG l'exempte).
 *
 *   node scripts/qualite/exigences-ecran.mjs --dist <build-interne> --routes '#/notes,#/classeur' [--api …] [--sortie f.json]
 *
 * Même sûreté que le reste de la chaîne : build servi depuis le disque, réseau limité à cette machine, compte @exemple.test.
 * Sort 1 si une route a une coupure ou une cible sous 34 px.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(path.resolve(ICI, '..', '..'), 'package.json'));
const { chromium } = require('playwright-core');
const args = process.argv.slice(2);
const opt = (n, d = null) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const DIST = opt('dist');
const API = opt('api', 'http://127.0.0.1:4171');
const ROUTES = (opt('routes') ?? '').split(',').map((r) => r.trim()).filter(Boolean);
const SORTIE = opt('sortie');
const CSS = opt('css'); // contrôle : un style ajouté après le chargement (ex. un ::after qui élargit les boutons) doit faire passer les cibles
const MIN = Number(opt('min', '34'));
const LARGEUR = Number(opt('largeur', '390'));
if (!DIST || !ROUTES.length) { console.error("Usage : exigences-ecran.mjs --dist <build-interne> --routes '#/a,#/b' [--api …] [--min 34] [--largeur 390] [--css '<style de contrôle>'] [--sortie f.json]"); process.exit(2); }
if (!/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(API)) { console.error('--api : cette machine seulement'); process.exit(2); }
const MAIL = process.env.AMN_E2E_EMAIL ?? 'essai.interne@exemple.test';
const MDP = process.env.AMN_E2E_PASSWORD ?? 'Interne-2026-Essai';
if (!/@exemple\.test$/i.test(MAIL)) { console.error('compte refusé (pas en @exemple.test)'); process.exit(2); }

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };
const ORIGINE = 'https://amn.local';
const hote = new URL(API).host;
const attendre = (ms) => new Promise((r) => setTimeout(r, ms));
const nav = await chromium.launch({ executablePath: process.env.AMN_E2E_CHROMIUM ?? '/opt/pw-browsers/chromium', args: ['--no-sandbox', '--no-proxy-server', '--disable-features=LocalNetworkAccessChecks,PrivateNetworkAccessSendPreflights,PrivateNetworkAccessRespectPreflightResults,BlockInsecurePrivateNetworkRequests'] });
const ctx = await nav.newContext({ viewport: { width: LARGEUR, height: 800 }, hasTouch: true, serviceWorkers: 'block', locale: 'fr-FR' });
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

const resultats = [];
for (const route of ROUTES) {
  await page.goto(`${ORIGINE}/${route}`); await attendre(2200);
  if (CSS) await page.addStyleTag({ content: CSS });
  const m = await page.evaluate(([min, large]) => {
    const doc = document.documentElement;
    const debord = Math.max(doc.scrollWidth, document.body.scrollWidth);
    // éléments plus larges que la fenêtre (le premier coupable)
    const coupables = [];
    for (const e of document.querySelectorAll('body *')) {
      const b = e.getBoundingClientRect();
      if (b.width > 0 && b.right > large + 1 && getComputedStyle(e).position !== 'fixed') {
        let cache = false;
        for (let p = e.parentElement; p && p !== document.body; p = p.parentElement) {
          const o = getComputedStyle(p).overflowX;
          if ((o === 'auto' || o === 'scroll' || o === 'hidden') && p.getBoundingClientRect().right <= large + 1) { cache = true; break; }
        }
        if (!cache) coupables.push(`${e.tagName.toLowerCase()}.${String(e.className).split(' ')[0].slice(0, 30)} → ${Math.round(b.right)} px « ${(e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 30)} »`);
      }
      if (coupables.length >= 4) break;
    }
    // LA ZONE DE CLIC, PAS LA BOÎTE (§1.39) : un élément plus petit que 34 px peut être élargi par un ::after invisible. On sonde
    // avec `elementFromPoint` neuf points d'un carré de 34 × 34 centré sur l'élément : le centre, les quatre bords et les quatre coins
    // (rentrés d'un pixel). La cible tient si chaque point renvoie l'élément ou l'un de ses descendants ; un point qui tombe sur le
    // voisin ou sur le fond dit que la zone de clic ne couvre pas le carré.
    const petites = [];
    let sauvees = 0;
    const cibles = document.querySelectorAll('a[href], button, input:not([type=hidden]), select, textarea, [role=button], [role=checkbox], [role=tab], [role=menuitem], [role=switch], [role=option]');
    const nom = (e) => ((e.getAttribute('aria-label') || e.textContent || e.getAttribute('title') || e.tagName) + '').trim().replace(/\s+/g, ' ').slice(0, 28);
    for (const e of cibles) {
      const cs = getComputedStyle(e);
      if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) < 0.05) continue;
      let b = e.getBoundingClientRect();
      if (b.width < 1 || b.height < 1) continue;
      if (e.closest('[aria-hidden="true"], [inert]')) continue;
      // un lien en ligne dans une phrase est exempté
      if (e.tagName === 'A' && cs.display === 'inline' && e.parentElement && (e.parentElement.textContent || '').trim().length > (e.textContent || '').trim().length + 12) continue;
      if (b.width >= min && b.height >= min) continue; // la boîte suffit
      e.scrollIntoView({ block: 'center', inline: 'center' });
      b = e.getBoundingClientRect();
      if (b.bottom < 0 || b.right < 0 || b.top > innerHeight || b.left > innerWidth) continue;
      const cx = b.left + b.width / 2;
      const cy = b.top + b.height / 2;
      const h = min / 2 - 1;
      const points = [[0, 0], [-h, 0], [h, 0], [0, -h], [0, h], [-h, -h], [h, -h], [-h, h], [h, h]];
      const rate = [];
      for (const [dx, dy] of points) {
        const x = cx + dx;
        const y = cy + dy;
        if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) continue; // hors fenêtre : non sondé
        const touche = document.elementFromPoint(x, y);
        if (!(touche && (touche === e || e.contains(touche)))) rate.push(`${dx},${dy}`);
      }
      if (rate.length) petites.push(`${Math.round(b.width)}×${Math.round(b.height)} « ${nom(e)} » (zone de clic : ${rate.length} point(s) sur 9 hors de l’élément)`);
      else sauvees += 1;
    }
    return { debord, coupables, petites, sauvees };
  }, [MIN, LARGEUR]);
  const coupe = m.debord > LARGEUR + 1;
  resultats.push({ route, debord: m.debord, coupe, coupables: m.coupables, petites: m.petites, sauvees: m.sauvees });
  console.log(`${coupe || m.petites.length ? '✗' : '✓'} ${route.padEnd(28)} largeur du contenu ${m.debord} px${coupe ? ' (COUPÉ)' : ''} · ${m.petites.length} zone(s) de clic < ${MIN} px${m.sauvees ? ` (+ ${m.sauvees} boîte(s) trop petite(s) mais zone de clic suffisante)` : ''}`);
  for (const c of m.coupables) console.log(`     coupe : ${c}`);
  for (const p of m.petites.slice(0, 6)) console.log(`     petite : ${p}`);
}
await nav.close();
if (SORTIE) fs.writeFileSync(path.resolve(SORTIE), JSON.stringify(resultats, null, 2));
process.exit(resultats.some((r) => r.coupe || r.petites.length) ? 1 : 0);

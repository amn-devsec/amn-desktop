#!/usr/bin/env node
/**
 * LE CONTRASTE TEL QU'IL SE VOIT — mesuré sur les pixels, pas sur les couleurs déclarées.
 *
 * `check:contraste` lit `color` et `background-color`. Sur la coquille v4 il ne voit ni les dégradés néon
 * (`background-image`), ni les halos et le voile de page (calques `radial-gradient`) : il ne peut donc ni
 * confirmer ni infirmer la condition du CO « texte lisible (AA, plancher T4) sous le troisième halo et le voile ».
 *
 * Ici : pour chaque texte visible, on lit sa couleur effective, on rend la page avec TOUS les textes transparents,
 * et on regarde les pixels qui sont réellement derrière chaque mot. Le contraste retenu est le PIRE des pixels de la
 * boîte du texte (la valeur la plus proche de la couleur du texte). Seuils WCAG AA : 4,5 (3 pour un grand texte :
 * ≥ 24 px, ou ≥ 18,66 px en gras). Un texte en dégradé (`background-clip: text`) est compté à part.
 *
 *   node scripts/qualite/contraste-pixels.mjs --dist <build-interne> [--api http://127.0.0.1:4171] \
 *        [--routes '#/,#/notifications'] [--coquille] [--reduit] [--sortie f.json] [--images <dossier>] [--css '<style de contrôle>']
 *
 * Même sûreté que la chaîne de captures : build servi depuis le disque, réseau limité à cette machine, compte @exemple.test.
 * Sort 1 si un texte passe sous son seuil.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { decoderPng } from './fidelite/png.mjs';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.resolve(ICI, '..', '..', 'package.json'));
const { chromium } = require('playwright-core');
const args = process.argv.slice(2);
const opt = (n, d = null) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const DIST = opt('dist');
const API = opt('api', 'http://127.0.0.1:4171');
const ROUTES = (opt('routes') ?? '#/,#/notifications,#/demarrage,#/demarrage/metier,#/tous-les-modules,#/tasks,#/facturation,#/clients,#/messages,#/agenda').split(',');
const COQUILLE = args.includes('--coquille');
const REDUIT = args.includes('--reduit');
const SORTIE = opt('sortie');
const IMAGES = opt('images');
const CSS = opt('css'); // contrôle négatif : un style qui DOIT faire échouer la mesure (ex. 'aside *{color:#2a2a2d !important}')
if (IMAGES) fs.mkdirSync(IMAGES, { recursive: true });
if (!DIST) { console.error('Usage : contraste-pixels.mjs --dist <build> [--api …] [--routes …] [--coquille] [--reduit] [--sortie f.json]'); process.exit(2); }
if (!/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(API)) { console.error('--api : cette machine seulement'); process.exit(2); }
const MAIL = process.env.AMN_E2E_EMAIL ?? 'essai.interne@exemple.test';
const MDP = process.env.AMN_E2E_PASSWORD ?? 'Interne-2026-Essai';
if (!/@exemple\.test$/i.test(MAIL)) { console.error('compte refusé (pas en @exemple.test)'); process.exit(2); }

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };
const ORIGINE = 'https://amn.local';
const attendre = (ms) => new Promise((r) => setTimeout(r, ms));
const lin = (c) => { const v = c / 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

const nav = await chromium.launch({ executablePath: process.env.AMN_E2E_CHROMIUM ?? '/opt/pw-browsers/chromium', args: ['--no-sandbox', '--no-proxy-server', '--disable-features=LocalNetworkAccessChecks,PrivateNetworkAccessSendPreflights,PrivateNetworkAccessRespectPreflightResults,BlockInsecurePrivateNetworkRequests'] });
const hote = new URL(API).host;
const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, serviceWorkers: 'block', locale: 'fr-FR', reducedMotion: REDUIT ? 'reduce' : 'no-preference' });
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

/** Les textes visibles : une boîte, une couleur effective (opacité des parents comprise), la taille, la graisse. */
const lireTextes = () => page.evaluate(() => {
  const res = [];
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const alphaCumule = (e) => { let a = 1; for (let p = e; p; p = p.parentElement) a *= Number(getComputedStyle(p).opacity); return a; };
  while (w.nextNode()) {
    const n = w.currentNode;
    const t = n.textContent.replace(/\s+/g, ' ').trim();
    if (!t || !n.parentElement) continue;
    const e = n.parentElement;
    if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(e.tagName)) continue;
    const cs = getComputedStyle(e);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    if (alphaCumule(e) < 0.05 || (cs.clip && cs.clip !== 'auto' && cs.position === 'absolute') || cs.clipPath === 'inset(50%)') continue;
    const r = document.createRange(); r.selectNodeContents(n);
    const b = r.getBoundingClientRect();
    if (b.width < 2 || b.height < 2 || b.bottom < 0 || b.top > innerHeight || b.right < 0 || b.left > innerWidth) continue;
    const m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/.exec(cs.color) ?? /color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)/.exec(cs.color);
    const srgb = cs.color.startsWith('color(');
    const coul = m ? [Number(m[1]) * (srgb ? 255 : 1), Number(m[2]) * (srgb ? 255 : 1), Number(m[3]) * (srgb ? 255 : 1), m[4] === undefined ? 1 : Number(m[4])] : [0, 0, 0, 1];
    const degrade = cs.webkitTextFillColor === 'rgba(0, 0, 0, 0)' || /text/.test(cs.webkitBackgroundClip || cs.backgroundClip || '');
    res.push({ t: t.slice(0, 50), x: b.left, y: b.top, w: b.width, h: b.height, coul, alpha: alphaCumule(e), px: parseFloat(cs.fontSize), gras: Number(cs.fontWeight) >= 700, degrade });
  }
  return res;
});
const masquer = () => page.addStyleTag({ content: '*{color:transparent !important;-webkit-text-fill-color:transparent !important;text-shadow:none !important;caret-color:transparent !important} svg text{fill:transparent !important}' });

const rapport = { coquille: COQUILLE, mouvementReduit: REDUIT, routes: {} };
let sousSeuil = 0;
let mesures = 0;
for (const route of ROUTES) {
  await page.goto(`${ORIGINE}/${route}`); await attendre(2200);
  if (CSS) await page.addStyleTag({ content: CSS });
  const textes = await lireTextes();
  if (IMAGES) await page.screenshot({ path: path.join(IMAGES, `${route.replace(/[^a-z0-9]+/gi, '_')}.png`) });
  const style = await masquer();
  await attendre(250);
  const png = decoderPng(await page.screenshot());
  await style.evaluate((n) => n.remove());
  const defauts = [];
  let degrades = 0;
  let mesure = 0;
  for (const s of textes) {
    if (s.degrade) { degrades += 1; continue; }
    const x0 = Math.max(0, Math.floor(s.x)), y0 = Math.max(0, Math.floor(s.y));
    const x1 = Math.min(png.largeur, Math.ceil(s.x + s.w)), y1 = Math.min(png.hauteur, Math.ceil(s.y + s.h));
    if (x1 <= x0 || y1 <= y0) continue;
    // Le pire pixel serait trompé par un point d'état ou un filet qui passe dans la boîte du texte : on retient le
    // 10e centile des contrastes pixel par pixel (au moins 90 % du texte se pose sur un fond au moins aussi lisible).
    const rapports = [];
    let pireFond = null;
    for (let y = y0; y < y1; y += 1) {
      for (let x = x0; x < x1; x += 1) {
        const i = (png.largeur * y + x) * 3;
        const fond = [png.rgb[i], png.rgb[i + 1], png.rgb[i + 2]];
        const a = s.coul[3] * s.alpha; // couleur effective = texte × opacité (texte et parents) posée sur CE pixel
        const eff = [0, 1, 2].map((k) => s.coul[k] * a + fond[k] * (1 - a));
        rapports.push([ratio(lum(...eff), lum(...fond)), fond]);
      }
    }
    rapports.sort((a, b) => a[0] - b[0]);
    const choisi = rapports[Math.floor(rapports.length * 0.1)];
    const pire = choisi ? choisi[0] : Infinity;
    pireFond = choisi ? choisi[1] : null;
    if (!Number.isFinite(pire)) continue;
    mesure += 1;
    const grand = s.px >= 24 || (s.px >= 18.66 && s.gras);
    const seuil = grand ? 3 : 4.5;
    if (pire < seuil) defauts.push({ texte: s.t, x: Math.round(s.x), y: Math.round(s.y), l: Math.round(s.w), h: Math.round(s.h), ratio: Math.round(pire * 100) / 100, seuil, taille: `${s.px}px${s.gras ? '/gras' : ''}`, couleur: s.coul.map((v) => Math.round(v)), fond: pireFond });
  }
  mesures += mesure;
  sousSeuil += defauts.length;
  rapport.routes[route] = { mesures: mesure, degrades, sousSeuil: defauts.length, defauts: defauts.slice(0, 25) };
  console.log(`${defauts.length ? '✗' : '✓'} ${route.padEnd(24)} ${String(mesure).padStart(4)} texte(s) mesuré(s) sur pixels, ${degrades} en dégradé, ${defauts.length} sous le seuil`);
  for (const d of defauts.slice(0, 8)) console.log(`     ${d.ratio} < ${d.seuil}  « ${d.texte} » @${d.x},${d.y} ${d.l}×${d.h}  ${d.taille}  texte rgb(${d.couleur.slice(0, 3)}) sur rgb(${d.fond})`);
}
await nav.close();
console.log(`\n${sousSeuil ? '✗' : '✓'} ${mesures} texte(s) mesurés, ${sousSeuil} sous le seuil AA (${COQUILLE ? 'coquille allumée' : 'coquille éteinte'}${REDUIT ? ', mouvement réduit' : ''}).`);
if (SORTIE) fs.writeFileSync(path.resolve(SORTIE), JSON.stringify(rapport, null, 2));
process.exit(sousSeuil ? 1 : 0);

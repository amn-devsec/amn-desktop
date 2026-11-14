#!/usr/bin/env node
/**
 * LES CONDITIONS DU CO SUR LA COQUILLE V4 (STATUT §1.25), MESURÉES DANS UN NAVIGATEUR.
 *
 * Trois conditions, posées à la fusion du socle v4 :
 *
 *   1. La famille active, posée sur <html> (`data-famille-active`) tant que la coquille est affichée,
 *      DISPARAÎT quand la coquille est éteinte ou démontée.
 *   2. Cet attribut — comme les jetons de famille `--fam-a` / `--fam-b` — n'existe JAMAIS dans l'édition
 *      cliente.
 *   3. Les lueurs animées s'arrêtent quand le mouvement est réduit (`prefers-reduced-motion: reduce`).
 *
 * Même principe de sûreté que `fidelite/capturer.mjs` : un build servi depuis le disque par interception,
 * réseau limité à cette machine, comptes @exemple.test seulement.
 *
 *   node scripts/qualite/coquille-v4.mjs --interne <build-interne> --cliente <build-cliente> \
 *        [--api http://127.0.0.1:4171] [--sortie fichier.json]
 *
 * Comptes : AMN_E2E_EMAIL_INTERNE / AMN_E2E_PASSWORD_INTERNE et AMN_E2E_EMAIL_CLIENTE / AMN_E2E_PASSWORD_CLIENTE
 * (par défaut ceux du bac à sable : essai.interne@exemple.test, fleuriste.essai@exemple.test).
 * Sort 1 si une condition n'est pas tenue.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.resolve(ICI, '..', '..', 'package.json'));
const { chromium } = require('playwright-core');
const arg = (n, d = null) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 ? process.argv[i + 1] : d; };
const INTERNE = arg('interne');
const CLIENTE = arg('cliente');
const API = arg('api', 'http://127.0.0.1:4171');
const SORTIE = arg('sortie');
if (!INTERNE || !CLIENTE) { console.error('Usage : coquille-v4.mjs --interne <build> --cliente <build> [--api …] [--sortie f.json]'); process.exit(2); }
if (!/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(API)) { console.error('--api : cette machine seulement'); process.exit(2); }
const COMPTES = {
  interne: { email: process.env.AMN_E2E_EMAIL_INTERNE ?? 'essai.interne@exemple.test', mdp: process.env.AMN_E2E_PASSWORD_INTERNE ?? 'Interne-2026-Essai' },
  cliente: { email: process.env.AMN_E2E_EMAIL_CLIENTE ?? 'fleuriste.essai@exemple.test', mdp: process.env.AMN_E2E_PASSWORD_CLIENTE ?? 'Fleuriste-2026-Essai' },
};
for (const c of Object.values(COMPTES)) if (!/@exemple\.test$/i.test(c.email)) { console.error(`compte refusé (pas en @exemple.test) : ${c.email}`); process.exit(2); }

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const ORIGINE = 'https://amn.local';
const FLAGS = ['--no-sandbox', '--no-proxy-server', '--disable-features=LocalNetworkAccessChecks,PrivateNetworkAccessSendPreflights,PrivateNetworkAccessRespectPreflightResults,BlockInsecurePrivateNetworkRequests'];
const attendre = (ms) => new Promise((r) => setTimeout(r, ms));
const apiHote = new URL(API).host;

const navigateur = await chromium.launch({ executablePath: process.env.AMN_E2E_CHROMIUM ?? '/opt/pw-browsers/chromium', args: FLAGS });

async function ouvrir(dist, compte, { coquille, mouvementReduit = false, connecte = true }) {
  const ctx = await navigateur.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', locale: 'fr-FR', timezoneId: 'Europe/Paris', reducedMotion: mouvementReduit ? 'reduce' : 'no-preference' });
  await ctx.route((u) => !['file:', 'data:', 'blob:', 'about:'].includes(u.protocol) && u.host !== apiHote, (route) => {
    const u = new URL(route.request().url());
    if (u.origin !== ORIGINE) return route.abort();
    let f = path.join(dist, decodeURIComponent(u.pathname));
    if (!f.startsWith(dist) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(dist, 'index.html');
    return route.fulfill({ status: 200, body: fs.readFileSync(f), contentType: TYPES[path.extname(f)] ?? 'application/octet-stream' });
  });
  await ctx.addInitScript(([mail, jour, allumer]) => {
    try {
      for (const q of ['general', 'profil', 'presentation']) localStorage.setItem(`amn.guide.${q}.${mail}`, 'vu');
      localStorage.setItem('amn.welcome.lastShown', jour);
      localStorage.setItem(`amn.demarrage.propose.${mail}`, '1');
      if (allumer) localStorage.setItem('amn.coquille', 'noir');
    } catch { /* sans stockage */ }
  }, [compte.email, new Date().toISOString().slice(0, 10), coquille]);
  const page = await ctx.newPage();
  await page.goto(`${ORIGINE}/`);
  await attendre(2200);
  if (connecte) {
    await page.locator('input[name="email"]').fill(compte.email);
    await page.locator('input[name="password"]').fill(compte.mdp);
    await page.locator('button:has-text("Se connecter")').click();
    for (let i = 0; i < 20 && (await page.content()).includes('name="password"'); i += 1) await attendre(500);
    await attendre(1800);
  }
  return { ctx, page };
}

/** Ce que <html> et la page portent, tel qu'un navigateur les voit. */
const lire = (page) => page.evaluate(() => {
  const r = document.documentElement;
  const css = getComputedStyle(r);
  return {
    familleActive: r.getAttribute('data-famille-active'),
    ambiance: r.getAttribute('data-ambiance'),
    mouvement: r.getAttribute('data-mouvement'),
    fam: [css.getPropertyValue('--fam-a').trim(), css.getPropertyValue('--fam-b').trim()],
    partout: document.querySelectorAll('[data-famille-active]').length,
    coquille: document.querySelectorAll('[data-socle=coquille]').length,
  };
});

const resultats = { verifications: [] };
const verifier = (nom, ok, detail) => { resultats.verifications.push({ nom, ok, detail }); console.log(`${ok ? '✓' : '✗'} ${nom}${detail ? ` — ${detail}` : ''}`); };

/* ── 1. La famille active suit la coquille (édition interne) ─────────────────── */
{
  const eteinte = await ouvrir(INTERNE, COMPTES.interne, { coquille: false });
  const e = await lire(eteinte.page);
  verifier('interne, coquille éteinte : pas de data-famille-active sur <html>', e.familleActive === null && e.partout === 0 && e.coquille === 0, JSON.stringify(e));
  await eteinte.ctx.close();

  const allumee = await ouvrir(INTERNE, COMPTES.interne, { coquille: true });
  const a = await lire(allumee.page);
  verifier('interne, coquille allumée : data-famille-active posé sur <html>', Boolean(a.familleActive) && a.coquille === 1, JSON.stringify(a));
  // la famille change avec la route
  const parRoute = {};
  for (const route of ['#/', '#/tasks', '#/facturation', '#/messages', '#/clients']) {
    await allumee.page.goto(`${ORIGINE}/${route}`); await attendre(1500);
    parRoute[route] = (await lire(allumee.page)).familleActive;
  }
  verifier('interne, coquille allumée : la famille suit la route', new Set(Object.values(parRoute).filter(Boolean)).size >= 2, JSON.stringify(parRoute));
  // éteindre en direct : l'attribut doit disparaître sans recharger
  await allumee.page.evaluate(() => { localStorage.removeItem('amn.coquille'); window.dispatchEvent(new Event('amn:coquille')); });
  await attendre(1200);
  const apres = await lire(allumee.page);
  verifier('interne : éteindre la coquille en direct retire l’attribut (sans recharger)', apres.familleActive === null && apres.partout === 0, JSON.stringify(apres));
  // la rallumer, puis se déconnecter : l'écran de connexion n'a pas de coquille, donc pas d'attribut
  await allumee.page.evaluate(() => { localStorage.setItem('amn.coquille', 'noir'); window.dispatchEvent(new Event('amn:coquille')); });
  await attendre(1200);
  const rallumee = await lire(allumee.page);
  verifier('interne : rallumer la coquille repose l’attribut', Boolean(rallumee.familleActive), JSON.stringify(rallumee));
  await allumee.page.evaluate(() => { for (const k of Object.keys(localStorage)) if (/session|token|auth/i.test(k)) localStorage.removeItem(k); });
  await allumee.page.goto(`${ORIGINE}/`); await attendre(1800);
  const dehors = await lire(allumee.page);
  const surLogin = (await allumee.page.locator('input[name="password"]').count()) > 0;
  verifier('interne : écran de connexion (coquille démontée) : pas d’attribut', surLogin && dehors.familleActive === null && dehors.partout === 0, `écran de connexion=${surLogin} ${JSON.stringify(dehors)}`);
  await allumee.ctx.close();
}

/* ── 2. Rien de cela dans l'édition cliente ──────────────────────────────────── */
{
  for (const coquille of [false, true]) {
    const { ctx, page } = await ouvrir(CLIENTE, COMPTES.cliente, { coquille });
    const c = await lire(page);
    verifier(`cliente${coquille ? ', drapeau amn.coquille posé' : ''} : ni data-famille-active, ni data-ambiance, ni --fam-a`, c.familleActive === null && c.ambiance === null && c.partout === 0 && c.coquille === 0 && c.fam.every((v) => v === ''), JSON.stringify(c));
    await ctx.close();
  }
}

/* ── 3. Les lueurs animées et le mouvement réduit ────────────────────────────── */
{
  const compter = (page) => page.evaluate(() => {
    const anims = document.getAnimations().filter((a) => a.constructor.name === 'CSSAnimation');
    const infinies = anims.filter((a) => a.effect?.getComputedTiming().iterations === Infinity);
    return { total: anims.length, infinies: infinies.length, noms: [...new Set(infinies.map((a) => a.animationName))].sort() };
  });
  const routes = ['#/', '#/notifications', '#/demarrage', '#/demarrage/metier', '#/tous-les-modules'];
  const mesure = {};
  for (const reduit of [false, true]) {
    const { ctx, page } = await ouvrir(INTERNE, COMPTES.interne, { coquille: true, mouvementReduit: reduit });
    for (const route of routes) {
      await page.goto(`${ORIGINE}/${route}`); await attendre(1800);
      mesure[`${route}|${reduit ? 'réduit' : 'permis'}`] = { ...(await compter(page)), mouvement: (await lire(page)).mouvement };
    }
    await ctx.close();
  }
  resultats.mouvement = mesure;
  for (const route of routes) {
    const p = mesure[`${route}|permis`];
    const r = mesure[`${route}|réduit`];
    verifier(`mouvement réduit, ${route} : plus aucune animation CSS infinie`, r.infinies === 0, `permis : ${p.infinies} infinie(s) [${p.noms.join(', ')}] · réduit : ${r.infinies} [${r.noms.join(', ')}] · data-mouvement=${r.mouvement}`);
  }
}

await navigateur.close();
const echecs = resultats.verifications.filter((v) => !v.ok);
console.log(`\n${resultats.verifications.length - echecs.length}/${resultats.verifications.length} conditions tenues.`);
if (SORTIE) fs.writeFileSync(path.resolve(SORTIE), JSON.stringify(resultats, null, 2));
process.exit(echecs.length ? 1 : 0);

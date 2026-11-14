#!/usr/bin/env node
/**
 * LES 20 TÂCHES COURANTES, EN NOMBRE D'ACTIONS (PLAN-10NOV §7) — mesurées sur le bac à sable.
 *
 * Cible : au plus 3 actions pour atteindre l'écran ou le formulaire de la tâche. Règle de comptage (écrite ici pour que
 * deux mesures se comparent) :
 *   - un clic, une touche ou un raccourci = 1 action ; ⌘K et ⌘J comptent pour UNE (c'est leur raison d'être) ;
 *   - saisir un mot dans la palette = 1 action ; valider (Entrée) = 1 action ;
 *   - on compte jusqu'à l'ARRIVÉE sur l'écran ou le formulaire où la tâche se fait. Remplir le formulaire et l'envoyer
 *     sont comptés à part (« + n pour finir ») : ils dépendent de la tâche, pas du chemin.
 *
 * Chaque tâche a un chemin déclaré, JOUÉ dans le navigateur (coquille v4 allumée) ; l'arrivée est vérifiée par un mot à l'écran.
 * Un chemin qui n'arrive pas là où il doit est « ÉCHEC » : la tâche n'a alors aucun chemin mesuré.
 *
 *   node scripts/qualite/taches-courantes.mjs --dist <build-interne> [--api http://127.0.0.1:4171] [--sortie f.json]
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
const args = process.argv.slice(2);
const opt = (n, d = null) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const DIST = opt('dist');
const API = opt('api', 'http://127.0.0.1:4171');
const SORTIE = opt('sortie');
if (!DIST) { console.error('Usage : taches-courantes.mjs --dist <build-interne> [--api …] [--sortie f.json]'); process.exit(2); }
if (!/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(API)) { console.error('--api : cette machine seulement'); process.exit(2); }
const MAIL = process.env.AMN_E2E_EMAIL ?? 'essai.interne@exemple.test';
const MDP = process.env.AMN_E2E_PASSWORD ?? 'Interne-2026-Essai';
if (!/@exemple\.test$/i.test(MAIL)) { console.error('compte refusé (pas en @exemple.test)'); process.exit(2); }

/*
  Les chemins. Une tâche a un ou plusieurs chemins candidats ; on les joue tous, on garde le plus court qui arrive.
    { palette: ['mot', /ligne à cliquer/] }  = ⌘K (1) + saisie (1) + clic sur la ligne (1)
    { barre: [/famille/, /écran/] }          = clic sur la famille de la barre (1) + clic sur l'écran (1) ; { barre: [/écran épinglé/] } = 1
    { ia: true } = ⌘J ; { recherche: true } = ⌘K ; { direct: true } = rien à faire
  `puis` : le clic qui ouvre le geste lui-même (« Nouvelle tâche »…), compté. `attendu` : ce qui doit se lire à l'arrivée.
  `pour_finir` : ce qu'il reste à saisir et valider sur place, compté à part, à titre indicatif.
*/
const TACHES = [
  { n: 1, nom: 'voir sa journée', chemins: [{ direct: true }], attendu: /tâches ouvertes|à prendre en premier|points? d.attention/i, pour_finir: 0 },
  { n: 2, nom: 'cocher une tâche', chemins: [{ barre: [/^Tâches et priorités/] }], puis: '[role="checkbox"], input[type="checkbox"]', attendu: /tâches|priorités/i, pour_finir: 0 },
  { n: 3, nom: 'créer une tâche', chemins: [{ barre: [/^Tâches et priorités/] }, { palette: ['tâche', /^Tâches/] }], puis: /nouvelle tâche/i, attendu: /nouvelle tâche|titre/i, pour_finir: 2 },
  { n: 4, nom: 'ajouter un rendez-vous', chemins: [{ barre: [/^Calendrier et RDV/] }, { palette: ['rendez-vous', /^Calendrier/] }], puis: /nouveau rendez-vous|nouvel événement|ajouter/i, attendu: /rendez-vous|agenda|calendrier/i, pour_finir: 3 },
  { n: 5, nom: 'créer un client', chemins: [{ barre: [/^Mes contacts et clients/, /^Clients/] }, { palette: ['client', /^Clients/] }], puis: /nouveau client|ajouter un client|nouvelle fiche/i, attendu: /client/i, pour_finir: 3 },
  { n: 6, nom: 'écrire à un client', chemins: [{ barre: [/^Messagerie/] }, { palette: ['messagerie', /^(Messages privés|Équipe)/] }], attendu: /messagerie|messages|conversation/i, pour_finir: 2 },
  { n: 7, nom: 'créer et envoyer un devis', chemins: [{ barre: [/^L.argent/, /^Devis/] }, { palette: ['devis', /^(Devis|Facturation)/] }], puis: /nouveau devis|créer un devis/i, attendu: /devis/i, pour_finir: 4 },
  { n: 8, nom: 'créer une facture', chemins: [{ barre: [/^L.argent/, /^Facturation/] }, { palette: ['facture', /^Facturation/] }], puis: /nouvelle facture|créer une facture/i, attendu: /facture/i, pour_finir: 4 },
  { n: 9, nom: 'relancer un impayé', chemins: [{ barre: [/Relancer ou mettre en demeure/] }], attendu: /relance|mise en demeure|facture/i, pour_finir: 1 },
  { n: 10, nom: 'noter une dépense', chemins: [{ barre: [/^L.argent/, /^Dépenses/] }, { palette: ['dépense', /^Dépenses/] }], puis: /nouvelle dépense|ajouter une dépense|noter/i, attendu: /dépense/i, pour_finir: 3 },
  { n: 11, nom: 'ajouter une note', chemins: [{ barre: [/^Écrire et retenir/, /^Notes/] }, { palette: ['note', /^Notes/] }], puis: /nouvelle note|ajouter une note/i, attendu: /note/i, pour_finir: 2 },
  { n: 12, nom: 'déposer un document', chemins: [{ barre: [/^Écrire et retenir/, /^Classeur/] }, { palette: ['document', /^Classeur/] }], puis: /déposer|ajouter un document|importer/i, attendu: /classeur|document|fichier/i, pour_finir: 2 },
  { n: 13, nom: 'chercher n’importe quoi', chemins: [{ recherche: true }], attendu: /rechercher|chercher|module|action/i, pour_finir: 0 },
  { n: 14, nom: 'demander à Ajmani', chemins: [{ ia: true }], attendu: /ajmani|demande|dis ce que/i, pour_finir: 1 },
  { n: 15, nom: 'ouvrir une alerte de La Garde', chemins: [{ barre: [/^La Garde/] }, { palette: ['alerte', /^Alertes personnalisées/] }], attendu: /alerte|garde/i, pour_finir: 1 },
  { n: 16, nom: 'prendre en charge un incident', chemins: [{ barre: [/^Cyber/] }, { palette: ['incident', /^Supervision/] }], attendu: /incident/i, pour_finir: 2 },
  { n: 17, nom: 'lancer une ronde', chemins: [{ barre: [/^La Garde/] }, { palette: ['ronde', /^Organigramme/] }], attendu: /ronde/i, pour_finir: 1 },
  { n: 18, nom: 'lancer une sauvegarde', chemins: [{ palette: ['sauvegarde', /^Import . export/] }], attendu: /sauvegarde/i, pour_finir: 1 },
  { n: 19, nom: 'voir les déploiements', chemins: [{ barre: [/^Développement/] }, { palette: ['déploiement', /^Déploiements/] }], attendu: /déploiement/i, pour_finir: 0 },
  { n: 20, nom: 'reprendre où l’on s’était arrêté', chemins: [{ barre: [/^Reprendre/] }, { palette: ['reprendre', /^Reprendre/] }], attendu: /reprendre|dernier|récent/i, pour_finir: 0 },
];

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
const depart = `${ORIGINE}/#/`;

const resultats = [];
const cliquer = async (rx, portee) => {
  const el = page.locator(portee ?? 'a, button, [role="option"], [role="menuitem"], li').filter({ hasText: rx }).first();
  await el.click({ timeout: 4000 });
};
for (const t of TACHES) {
  const essais = [];
  for (const ch of t.chemins) {
    await page.goto(depart); await attendre(1500);
    let actions = 0;
    let libelle = '';
    try {
      if (ch.direct) libelle = 'déjà sur l’Accueil';
      else if (ch.ia) { await page.keyboard.press('Control+j'); actions = 1; libelle = '⌘J'; await attendre(800); }
      else if (ch.recherche) { await page.keyboard.press('Control+k'); actions = 1; libelle = '⌘K'; await attendre(800); }
      else if (ch.palette) {
        await page.keyboard.press('Control+k'); await attendre(700);
        await page.keyboard.type(ch.palette[0], { delay: 25 }); await attendre(1000);
        await cliquer(ch.palette[1], '[role="dialog"] [role="option"], [role="dialog"] li, [role="dialog"] button');
        actions = 3; libelle = `⌘K · « ${ch.palette[0]} » · clic ${ch.palette[1]}`; await attendre(1300);
      } else if (ch.barre) {
        for (const rx of ch.barre) { await cliquer(rx, 'aside a, aside button, nav a, nav button, main a, main button, [data-socle="lateral"] a, [data-socle="lateral"] button'); actions += 1; await attendre(600); }
        libelle = `barre : ${ch.barre.map(String).join(' puis ')}`;
      }
      const hash1 = await page.evaluate(() => location.hash);
      const texte1 = await page.evaluate(() => `${location.hash}\n${document.body.innerText}`);
      const moduleAtteint = t.attendu.test(texte1) && (ch.direct || ch.ia || ch.recherche || hash1 !== '#/');
      const avant = actions;
      let geste = null;
      if (t.puis) {
        try {
          if (t.puis instanceof RegExp) await cliquer(t.puis, 'main a, main button, [role="main"] a, [role="main"] button');
          else await page.locator(t.puis).first().click({ timeout: 4000 });
          actions += 1; geste = true; await attendre(900);
        } catch { geste = false; }
      }
      essais.push({ actions: geste === false ? avant : actions, avant, moduleAtteint, geste, arrive: moduleAtteint, libelle: libelle.replace(/\/\^?/g, ' ').trim(), hash: await page.evaluate(() => location.hash) });
    } catch (e) {
      essais.push({ actions, arrive: false, libelle: `${libelle || 'chemin'} — ${String(e.message).split('\n')[0].slice(0, 70)}`, hash: '' });
    }
  }
  const bons = essais.filter((e) => e.arrive).sort((a, b) => a.actions - b.actions);
  const meilleur = bons[0] ?? essais[0];
  resultats.push({ n: t.n, nom: t.nom, actions: meilleur.actions, apresGeste: meilleur.geste, pourFinir: t.pour_finir, total: bons[0] ? meilleur.actions + t.pour_finir : null, arrive: Boolean(bons[0]), chemin: meilleur.libelle, hash: meilleur.hash, essais });
}
await nav.close();
console.log('  #  tâche                              actions  arrivée  chemin');
for (const r of resultats) console.log(`${String(r.n).padStart(3)}  ${r.nom.padEnd(34)} ${String(r.actions).padStart(4)}     ${r.arrive ? (r.actions <= 3 ? '✓' : '△') : '✗'}${r.arrive && r.apresGeste === false ? ' (geste introuvable)' : ''}       ${r.chemin}  [${r.hash}]`);
const ok = resultats.filter((r) => r.arrive && r.actions <= 3).length;
console.log(`\n${ok}/20 tâches atteintes en 3 actions ou moins ; ${resultats.filter((r) => !r.arrive).length} sans chemin mesuré.`);
if (SORTIE) fs.writeFileSync(path.resolve(SORTIE), JSON.stringify(resultats, null, 2));
process.exit(ok === 20 ? 0 : 1);

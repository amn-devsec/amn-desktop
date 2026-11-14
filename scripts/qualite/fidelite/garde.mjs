#!/usr/bin/env node
/**
 * check:fidelite — LES ÉCRANS LIVRÉS D'UN LOT CONTRE LEURS IMAGES v4, AVEC UN SEUIL.
 *
 * Pour chaque écran du lot : capture à 1440 × 900 (horloge fictive du scénario : vendredi 30 oct. 2026 à 10:42 ;
 * Cyber : mardi 3 nov.), comparaison à l'image v4, écart brut en pourcentage, puis la règle de `decision.mjs` :
 *   - écran déjà mesuré : échoue si l'écart monte de plus de 2 points au-dessus de sa valeur acceptée ;
 *   - écran nouveau : échoue au-dessus de 15 %, sauf écart justifié et écrit.
 * Seuils provisoires, révisables par Harun (STATUT §1.30).
 *
 * Les deux fichiers du lot, versionnés (ils ne contiennent que des nombres et des raisons, jamais une image) :
 *   docs/qualite/fidelite/acceptes-LOT-xx.json   { "mesure": "strict"|"disposition", "valeurs": { "H40": 14.5, … } }
 *   docs/qualite/fidelite/justifies-LOT-xx.json  { "ecrans": { "G05": { "raison": "données d'exemple, …" } } }
 *
 * LES IMAGES v4 N'ENTRENT JAMAIS DANS LE DÉPÔT PUBLIC. Le dossier se donne par la variable AMN_DOSSIER_V4
 * (celui qui contient `images/` et `_data/`). Sans elle, la garde dit « images absentes » et ne compte ni pour
 * ni contre (sortie 0) : c'est le cas sur GitHub Actions, où seuls les tests de la règle tournent
 * (`node tests/fidelite/decision.test.mjs`).
 *
 *   AMN_DOSSIER_V4=<dossier> AMN_E2E_EMAIL=essai.interne@exemple.test AMN_E2E_PASSWORD=… \
 *     node scripts/qualite/fidelite/garde.mjs --lot LOT-00 --dist <build> [--dist-dev <build NODE_ENV=development>] \
 *       [--api http://127.0.0.1:4171] [--sortie <dossier>] [--seulement H40,H41] [--rapport f.md] [--depuis <worktree-du-lot>]
 *
 * Sûreté : celle de `capturer.mjs` (build servi depuis le disque, réseau limité à cette machine, compte @exemple.test).
 * Sortie 0 = rien ne dépasse (ou images absentes), 1 = au moins un écran dépasse, 2 = erreur d'usage ou de capture.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { decider, echoue, SEUIL_HAUSSE, SEUIL_NOUVEAU } from './decision.mjs';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, '..', '..', '..');
const args = process.argv.slice(2);
const opt = (n, d = null) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const LOT = opt('lot');
const DIST = opt('dist');
const DIST_DEV = opt('dist-dev');
const API = opt('api', 'http://127.0.0.1:4171');
const SEUL = opt('seulement');
const RAPPORT = opt('rapport');
if (!LOT || !/^LOT-\d{2}$/.test(LOT)) {
  console.error('Usage : garde.mjs --lot LOT-00 --dist <build> [--dist-dev <build-dev>] [--api …] [--sortie …] [--seulement ID,ID] [--rapport f.md]');
  process.exit(2);
}

// 1. Les images : sans elles, ni pour ni contre.
const DOSSIER = process.env.AMN_DOSSIER_V4 ?? '';
const images = DOSSIER && path.join(DOSSIER, 'images');
if (!DOSSIER || !fs.existsSync(images)) {
  console.log(`check:fidelite ${LOT} : images absentes (${DOSSIER ? `${DOSSIER}/images introuvable` : 'AMN_DOSSIER_V4 non définie'}) — la garde ne compte ni pour ni contre.`);
  process.exit(0);
}
if (!DIST) { console.error('--dist <build de l’édition interne> manquant'); process.exit(2); }

// 2. Les fichiers du lot.
const slug = LOT.toLowerCase().replace('-', '');
const scenarios = path.join(ICI, `ecrans-${slug}.json`);
const fAcceptes = path.join(RACINE, 'docs', 'qualite', 'fidelite', `acceptes-${LOT}.json`);
// `--depuis <worktree>` : les écarts justifiés du lot sont écrits par la session du lot, sur SA branche (docs/qualite/fidelite/justifies-LOT-xx.json) :
// on les lit là où la branche est extraite, avant la fusion. Sans lui, ceux du dépôt courant.
const DEPUIS = opt('depuis');
const fJustifiesLot = DEPUIS ? path.join(path.resolve(DEPUIS), 'docs', 'qualite', 'fidelite', `justifies-${LOT}.json`) : null;
const fJustifies = fJustifiesLot && fs.existsSync(fJustifiesLot) ? fJustifiesLot : path.join(RACINE, 'docs', 'qualite', 'fidelite', `justifies-${LOT}.json`);
if (!fs.existsSync(scenarios)) { console.error(`pas de scénarios pour ${LOT} : ${path.relative(RACINE, scenarios)} (un fichier par lot, modèle ecrans-lot00.json)`); process.exit(2); }
const lire = (f, defaut) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : defaut);
const acceptes = lire(fAcceptes, { mesure: 'strict', valeurs: {} });
const justifies = lire(fJustifies, { ecrans: {} });
const mesure = acceptes.mesure === 'disposition' ? 'disposition' : 'strict';

// 3. Capture + comparaison (lot.mjs), dans un dossier hors du dépôt : les PNG ne se commitent jamais.
const sortie = path.resolve(opt('sortie', fs.mkdtempSync(path.join(os.tmpdir(), 'fidelite-'))));
const a = [path.join(ICI, 'lot.mjs'), '--scenarios', scenarios, '--dist', DIST, '--images', images, '--api', API, '--sortie', sortie];
if (fs.existsSync(path.join(DOSSIER, '_data'))) a.push('--data', path.join(DOSSIER, '_data'));
if (DIST_DEV) a.push('--dist-dev', DIST_DEV);
// Les écrans dont l'image v4 n'est pas (encore) dans le dossier ne comptent ni pour ni contre : on les dit, on ne les mesure pas.
const presentes = fs.readdirSync(images).filter((f) => f.endsWith('.png'));
const scenario = JSON.parse(fs.readFileSync(scenarios, 'utf8'));
const ids = scenario.ecrans.map((e) => e.id).filter((id) => !SEUL || SEUL.split(',').includes(id));
const sansImage = ids.filter((id) => !presentes.includes(`${id}.png`) && !presentes.some((f) => f.startsWith(`${id}-`)));
const aMesurer = ids.filter((id) => !sansImage.includes(id));
if (!aMesurer.length) { console.log(`check:fidelite ${LOT} : aucune image v4 pour ${sansImage.join(', ')} — la garde ne compte ni pour ni contre.`); process.exit(0); }
a.push('--seulement', aMesurer.join(','));
const run = spawnSync('node', a, { encoding: 'utf8', env: process.env, maxBuffer: 1 << 28 });
process.stdout.write(run.stdout ?? '');
if (run.status === 2 && !fs.existsSync(path.join(sortie, 'resultats.json'))) { process.stderr.write(run.stderr ?? ''); process.exit(2); }
const resultats = JSON.parse(fs.readFileSync(path.join(sortie, 'resultats.json'), 'utf8'));

// 4. La règle.
const pct = (x) => x.toFixed(1).replace('.', ',');
const lignes = [];
let echecs = 0;
let erreurs = 0;
for (const r of resultats) {
  const id = r.ecran ?? r.id;
  if (r.erreur) { erreurs += 1; lignes.push({ id, ecart: null, accepte: null, statut: 'erreur', raison: r.erreur }); continue; }
  const source = mesure === 'disposition' ? r.structure ?? r : r;
  const ecart = source.tauxEcart * 100;
  const accepte = typeof acceptes.valeurs?.[id] === 'number' ? acceptes.valeurs[id] : null;
  const d = decider({ ecart, accepte, justifie: justifies.ecrans?.[id] ?? null });
  if (echoue(d.statut)) echecs += 1;
  lignes.push({ id, ecart, accepte, ...d });
}

for (const id of sansImage) lignes.push({ id, ecart: null, accepte: null, statut: 'sans-image', raison: 'image v4 absente du dossier : ni pour ni contre' });
const marque = { 'sans-image': '–', accepte: '✓', 'nouveau-ok': '✓', 'nouveau-justifie': '≈', echec: '✗', 'nouveau-echec': '✗', erreur: '!' };
console.log(`\ncheck:fidelite ${LOT} — écart brut (${mesure === 'strict' ? '±2 px, couleur ±2' : 'disposition, couleur ±10'}) · seuils : +${SEUIL_HAUSSE} points sur l’accepté, ${SEUIL_NOUVEAU} % pour un écran nouveau`);
for (const l of lignes) console.log(`${marque[l.statut]} ${l.id.padEnd(4)} ${l.ecart === null ? '—'.padStart(6) : `${pct(l.ecart)} %`.padStart(8)}  ${l.accepte === null ? 'nouveau' : `accepté ${pct(l.accepte)} %`}  ${l.raison}`);

if (RAPPORT) {
  const L = [`# check:fidelite ${LOT}`, '', `Mesure : ${mesure}. Seuils provisoires : +${SEUIL_HAUSSE} points sur l’accepté, ${SEUIL_NOUVEAU} % pour un écran nouveau.`, '', '| Écran | Écart | Accepté | Résultat |', '|---|---|---|---|'];
  for (const l of lignes) L.push(`| ${l.id} | ${l.ecart === null ? '—' : `${pct(l.ecart)} %`} | ${l.accepte === null ? 'nouveau' : `${pct(l.accepte)} %`} | ${marque[l.statut]} ${l.raison} |`);
  fs.writeFileSync(path.resolve(RAPPORT), `${L.join('\n')}\n`);
}
console.log(echecs || erreurs ? `\n✗ ${echecs} écran(s) dépassent, ${erreurs} erreur(s).` : `\n✓ ${lignes.length} écran(s) dans les seuils.`);
process.exit(erreurs ? 2 : echecs ? 1 : 0);

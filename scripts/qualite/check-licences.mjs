#!/usr/bin/env node
/**
 * check:licences — LES LICENCES DES DÉPENDANCES, LISTÉES, AVEC UNE RÈGLE (direction de Harun, STATUT §1.43).
 *
 *   REFUSE toute AGPL (sortie 1) · SIGNALE GPL, LGPL, licences restrictives ou inconnues · dit le reste en une ligne.
 *
 * Il lit le LOCKFILE (`package-lock.json`, champ `license` de chaque paquet installé, dépendances indirectes comprises) :
 * pas de réseau, pas de `node_modules` à installer, donc il tourne tel quel sur la CI. Quand le lockfile ne dit rien d'un
 * paquet, il lit son `package.json` dans `node_modules` s'il est là.
 *
 *   node scripts/qualite/check-licences.mjs [--lock package-lock.json] [--tout] [--strict] [--json f.json] [--rapport f.md]
 *   node scripts/qualite/check-licences.mjs --candidat ffmpeg-static --candidat onnxruntime-web@1.20.0 …
 *
 *   --tout        liste aussi les paquets permissifs (par défaut, on compte les permissifs et on détaille le reste) ;
 *   --strict      sortie 1 aussi pour un signalement non accepté (à employer sur les lots qui ajoutent des dépendances) ;
 *   --candidat    AVANT d'ajouter une dépendance : lit sa licence sur le registre npm (`npm view`) et dit où elle tomberait.
 *                 Le registre est la seule sortie réseau du script, et seulement avec cette option. Il ne lit que la licence du
 *                 paquet lui-même, pas celles de ses dépendances indirectes : après l'ajout, relancer sans option.
 *
 * Les signalements acceptés se déclarent dans docs/qualite/licences-acceptees.json (un nom de paquet, la licence vue,
 * la raison, qui a accepté) : ils sortent alors « accepté » et ne font plus échouer --strict. UNE AGPL NE S'ACCEPTE PAS.
 *
 * Sortie 0 : aucune AGPL (et, avec --strict, aucun signalement non accepté) · 1 : une AGPL ou un signalement refusé ·
 * 2 : erreur d'usage ou lockfile illisible.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { licenceDe, niveauDeExpression, nomDepuisChemin } from './licences-lib.mjs';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, '..', '..');
const args = process.argv.slice(2);
const opt = (n, d = null) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const toutes = (n) => args.flatMap((a, i) => (a === `--${n}` ? [args[i + 1]] : []));
const TOUT = args.includes('--tout');
const STRICT = args.includes('--strict');
const JSON_OUT = opt('json');
const RAPPORT = opt('rapport');
const CANDIDATS = toutes('candidat');

const accepteesFichier = path.join(RACINE, 'docs', 'qualite', 'licences-acceptees.json');
let acceptees = {};
try { acceptees = JSON.parse(fs.readFileSync(accepteesFichier, 'utf8')).paquets ?? {}; } catch { /* aucune acceptation */ }

const marque = { ok: '✓', info: '·', signale: '!', refuse: '✗' };
const mots = { ok: 'permissive', info: 'copyleft faible', signale: 'à signaler', refuse: 'REFUSÉE' };

/* ── Mode candidat : une dépendance qu'on n'a pas encore ajoutée ─────────────────────────────────────────────── */
if (CANDIDATS.length) {
  let refus = 0;
  for (const c of CANDIDATS) {
    const r = spawnSync('npm', ['view', c, 'name', 'version', 'license', '--json'], { encoding: 'utf8', timeout: 60_000 });
    if (r.status !== 0) { console.log(`? ${c.padEnd(32)} introuvable sur le registre (${(r.stderr || '').split('\n').find((l) => /E404|ENOTFOUND|ECONN/.test(l))?.trim() ?? 'erreur npm'})`); continue; }
    let j; try { j = JSON.parse(r.stdout); } catch { console.log(`? ${c.padEnd(32)} réponse illisible`); continue; }
    const licence = licenceDe(j) || (typeof j.license === 'string' ? j.license : '');
    const n = niveauDeExpression(licence);
    if (n.niveau === 'refuse') refus += 1;
    const dejaAcceptee = acceptees[j.name];
    console.log(`${marque[n.niveau]} ${`${j.name}@${j.version}`.padEnd(32)} ${(licence || '(aucune)').padEnd(24)} ${mots[n.niveau]}${n.niveau === 'ok' ? '' : ` — ${n.raison}`}${dejaAcceptee ? ' (déjà acceptée)' : ''}`);
  }
  console.log(refus ? `\n✗ ${refus} candidat(s) refusé(s) : une AGPL ne s'ajoute pas.` : '\nAucune AGPL parmi les candidats.');
  process.exit(refus ? 1 : 0);
}

/* ── Mode lockfile ─────────────────────────────────────────────────────────────────────────────────────────── */
const lockChemin = path.resolve(RACINE, opt('lock', 'package-lock.json'));
let lock;
try { lock = JSON.parse(fs.readFileSync(lockChemin, 'utf8')); } catch (e) { console.error(`lockfile illisible (${path.relative(RACINE, lockChemin)}) : ${e.message}`); process.exit(2); }
if (!lock.packages) { console.error('lockfile sans champ « packages » (lockfileVersion ≥ 2 attendu)'); process.exit(2); }

const lignes = [];
for (const [chemin, v] of Object.entries(lock.packages)) {
  if (!chemin) continue; // la racine
  const nom = v.name ?? nomDepuisChemin(chemin);
  if (v.link) continue; // un lien vers un paquet du dépôt
  let licence = licenceDe(v);
  if (!licence) {
    try { licence = licenceDe(JSON.parse(fs.readFileSync(path.join(RACINE, chemin, 'package.json'), 'utf8'))); } catch { /* absent */ }
  }
  const n = niveauDeExpression(licence);
  lignes.push({ nom, version: v.version ?? '', chemin, licence: licence || '(aucune)', niveau: n.niveau, raison: n.raison, portee: v.dev ? 'dev' : v.peer ? 'peer' : v.optional ? 'optionnel' : 'prod' });
}
// Un même paquet à plusieurs endroits de l'arbre : on garde chaque version distincte une fois.
const vus = new Set();
const uniques = lignes.filter((l) => { const k = `${l.nom}@${l.version}|${l.licence}`; if (vus.has(k)) return false; vus.add(k); return true; });

const compte = Object.fromEntries(['ok', 'info', 'signale', 'refuse'].map((n) => [n, uniques.filter((l) => l.niveau === n).length]));
const refusees = uniques.filter((l) => l.niveau === 'refuse');
const signalees = uniques.filter((l) => l.niveau === 'signale');
const signaleesNonAcceptees = signalees.filter((l) => !acceptees[l.nom]);
const infos = uniques.filter((l) => l.niveau === 'info');

const sortie = [];
const dire = (s = '') => { console.log(s); sortie.push(s); };
dire(`check:licences — ${uniques.length} paquet(s) du lockfile (${path.relative(RACINE, lockChemin)})`);
const parLicence = new Map();
for (const l of uniques) parLicence.set(l.licence, (parLicence.get(l.licence) ?? 0) + 1);
dire(`Répartition : ${[...parLicence.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(' · ')}`);
dire(`Niveaux : ${compte.ok} permissive(s) · ${compte.info} copyleft faible · ${compte.signale} à signaler · ${compte.refuse} refusée(s)`);

const detail = (liste, titre) => {
  if (!liste.length) return;
  dire(`\n${titre}`);
  for (const l of liste.sort((a, b) => a.nom.localeCompare(b.nom))) {
    const acc = acceptees[l.nom];
    dire(`${marque[l.niveau]} ${`${l.nom}@${l.version}`.padEnd(40)} ${l.licence.padEnd(28)} ${l.portee.padEnd(9)} ${acc ? `accepté (${acc.raison ?? 'sans raison écrite'})` : l.raison}`);
  }
};
detail(refusees, 'REFUSÉES (AGPL) :');
detail(signalees, 'À SIGNALER (GPL, LGPL, restrictive, inconnue ou absente) :');
detail(infos, 'Copyleft faible (information) :');
if (TOUT) detail(uniques.filter((l) => l.niveau === 'ok'), 'Permissives :');

let code = 0;
if (refusees.length) { code = 1; dire(`\n✗ ${refusees.length} paquet(s) sous AGPL : refusés, une AGPL ne s'accepte pas.`); }
if (STRICT && signaleesNonAcceptees.length) { code = 1; dire(`\n✗ ${signaleesNonAcceptees.length} signalement(s) non accepté(s) (--strict) : à déclarer dans docs/qualite/licences-acceptees.json avec une raison, ou à retirer.`); }
if (!code) dire(`\n✓ aucune AGPL${signaleesNonAcceptees.length ? `, ${signaleesNonAcceptees.length} signalement(s) à lire ci-dessus` : ', aucun signalement'}.`);

if (JSON_OUT) fs.writeFileSync(path.resolve(JSON_OUT), JSON.stringify({ total: uniques.length, compte, refusees, signalees, infos }, null, 2));
if (RAPPORT) fs.writeFileSync(path.resolve(RAPPORT), `\`\`\`\n${sortie.join('\n')}\n\`\`\`\n`);
process.exit(code);

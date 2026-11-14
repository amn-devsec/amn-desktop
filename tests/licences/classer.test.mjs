/**
 * Tests de la règle de `check:licences` (scripts/qualite/licences-lib.mjs). Aucun réseau, aucun fichier.
 *   node tests/licences/classer.test.mjs
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { niveauDeExpression as n, niveauDeLicence as l, licenceDe, nomDepuisChemin } from '../../scripts/qualite/licences-lib.mjs';

let k = 0;
const ok = (nom, f) => { f(); k += 1; };
const niv = (e) => n(e).niveau;

// licences simples
for (const e of ['MIT', 'ISC', 'BSD-2-Clause', 'BSD-3-Clause', 'Apache-2.0', '0BSD', 'CC0-1.0', 'BlueOak-1.0.0', 'Unlicense', 'Python-2.0', 'CC-BY-4.0', 'OFL-1.1', 'WTFPL', 'MIT-0']) ok(`${e} : permissive`, () => assert.equal(niv(e), 'ok'));
for (const e of ['MPL-2.0', 'EPL-2.0', 'CDDL-1.0']) ok(`${e} : copyleft faible (information)`, () => assert.equal(niv(e), 'info'));
for (const e of ['GPL-2.0', 'GPL-3.0-only', 'GPL-3.0-or-later', 'GPL-2.0-only']) ok(`${e} : à signaler (GPL)`, () => { assert.equal(niv(e), 'signale'); assert.equal(n(e).raison, 'GPL'); });
for (const e of ['LGPL-2.1', 'LGPL-3.0-or-later', 'LGPL-2.1-only']) ok(`${e} : à signaler (LGPL, pas confondue avec GPL)`, () => { assert.equal(niv(e), 'signale'); assert.equal(n(e).raison, 'LGPL'); });
for (const e of ['AGPL-3.0', 'AGPL-3.0-only', 'AGPL-3.0-or-later', 'AGPL-1.0', 'agpl-3.0']) ok(`${e} : REFUSÉE`, () => assert.equal(niv(e), 'refuse'));
for (const e of ['SSPL-1.0', 'BUSL-1.1', 'CC-BY-NC-4.0', 'Elastic-2.0']) ok(`${e} : restrictive, à signaler`, () => assert.equal(niv(e), 'signale'));
for (const e of ['UNLICENSED', 'SEE LICENSE IN LICENSE.txt', '', undefined, 'Quelque-chose-d-inconnu']) ok(`« ${e} » : inconnue ou absente, à signaler`, () => assert.equal(niv(e), 'signale'));
ok('NCSA n’est pas « non commercial »', () => assert.equal(l('NCSA').niveau, 'ok'));

// expressions SPDX
ok('MIT OR AGPL-3.0 : on peut choisir MIT', () => assert.equal(niv('MIT OR AGPL-3.0'), 'ok'));
ok('(MIT OR CC0-1.0) : permissive', () => assert.equal(niv('(MIT OR CC0-1.0)'), 'ok'));
ok('AGPL-3.0 OR GPL-3.0 : le plus doux des deux, GPL à signaler', () => assert.equal(niv('AGPL-3.0 OR GPL-3.0'), 'signale'));
ok('MIT AND AGPL-3.0 : les deux s’appliquent, refusée', () => assert.equal(niv('MIT AND AGPL-3.0'), 'refuse'));
ok('MIT AND GPL-3.0 : à signaler', () => assert.equal(niv('MIT AND GPL-3.0'), 'signale'));
ok('(MIT OR Apache-2.0) AND AGPL-3.0 : refusée', () => assert.equal(niv('(MIT OR Apache-2.0) AND AGPL-3.0'), 'refuse'));
ok('MIT AND (ISC OR GPL-3.0) : permissive', () => assert.equal(niv('MIT AND (ISC OR GPL-3.0)'), 'ok'));
ok('GPL-2.0-only WITH Classpath-exception-2.0 : reste à signaler (prudence)', () => assert.equal(niv('GPL-2.0-only WITH Classpath-exception-2.0'), 'signale'));
ok('Apache-2.0 WITH LLVM-exception : permissive', () => assert.equal(niv('Apache-2.0 WITH LLVM-exception'), 'ok'));
ok('WTFPL OR ISC : permissive', () => assert.equal(niv('WTFPL OR ISC'), 'ok'));
ok('MPL-2.0 AND MIT : copyleft faible', () => assert.equal(niv('MPL-2.0 AND MIT'), 'info'));
ok('expression illisible : jamais « ok », et l’AGPL y est vue', () => {
  assert.notEqual(niv('(MIT OR'), 'ok');
  assert.equal(niv('(MIT OR AGPL-3.0'), 'refuse');
  assert.equal(niv('MIT OR OR'), 'signale');
});
ok('casse et espaces : « mit  or  agpl-3.0 »', () => assert.equal(niv('  mit  or  agpl-3.0 '), 'ok'));

// lecture d'un package.json / d'une entrée de lockfile
ok('licenceDe : chaîne SPDX', () => assert.equal(licenceDe({ license: 'MIT' }), 'MIT'));
ok('licenceDe : ancien champ licenses[]', () => assert.equal(licenceDe({ licenses: [{ type: 'MIT' }, { type: 'Apache-2.0' }] }), 'MIT OR Apache-2.0'));
ok('licenceDe : objet { type }', () => assert.equal(licenceDe({ license: { type: 'ISC' } }), 'ISC'));
ok('licenceDe : rien', () => { assert.equal(licenceDe({}), ''); assert.equal(licenceDe(null), ''); });
ok('nomDepuisChemin', () => { assert.equal(nomDepuisChemin('node_modules/@a/b'), '@a/b'); assert.equal(nomDepuisChemin('node_modules/x/node_modules/y'), 'y'); });

// le script entier, sur un lockfile d'essai : contrôle positif (AGPL refusée) et négatif (rien à dire)
const CLI = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'scripts', 'qualite', 'check-licences.mjs');
const lock = (paquets) => { const f = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'licences-')), 'lock.json'); fs.writeFileSync(f, JSON.stringify({ lockfileVersion: 3, packages: { '': {}, ...paquets } })); return f; };
const lancer = (f, ...extra) => spawnSync('node', [CLI, '--lock', f, ...extra], { encoding: 'utf8' });
ok('CLI : un lockfile permissif sort 0', () => assert.equal(lancer(lock({ 'node_modules/a': { version: '1.0.0', license: 'MIT' }, 'node_modules/b': { version: '2.0.0', license: 'ISC' } })).status, 0));
ok('CLI : une AGPL sort 1 et se nomme', () => {
  const r = lancer(lock({ 'node_modules/a': { version: '1.0.0', license: 'MIT' }, 'node_modules/mauvais': { version: '3.0.0', license: 'AGPL-3.0-or-later' } }));
  assert.equal(r.status, 1);
  assert.match(r.stdout, /mauvais@3\.0\.0/);
});
ok('CLI : une AGPL en dépendance de développement est refusée aussi', () => assert.equal(lancer(lock({ 'node_modules/o': { version: '1.0.0', license: 'AGPL-3.0', dev: true } })).status, 1));
ok('CLI : GPL et LGPL sont signalées sans échec, avec --strict elles échouent', () => {
  const f = lock({ 'node_modules/g': { version: '1.0.0', license: 'GPL-3.0-only' }, 'node_modules/l': { version: '1.0.0', license: 'LGPL-2.1' } });
  const r = lancer(f);
  assert.equal(r.status, 0);
  assert.match(r.stdout, /g@1\.0\.0/);
  assert.match(r.stdout, /l@1\.0\.0/);
  assert.equal(lancer(f, '--strict').status, 1);
});
ok('CLI : (MIT OR AGPL-3.0) passe', () => assert.equal(lancer(lock({ 'node_modules/d': { version: '1.0.0', license: '(MIT OR AGPL-3.0)' } })).status, 0));
ok('CLI : lockfile illisible sort 2', () => assert.equal(lancer('/chemin/qui/nexiste/pas.json').status, 2));

console.log(`licences : ${k} vérifications passées`);

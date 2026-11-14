/**
 * Tests de la règle de `check:fidelite` (scripts/qualite/fidelite/decision.mjs).
 * Aucune image, aucun navigateur : c'est la seule partie qui tourne sur la CI publique.
 *   node tests/fidelite/decision.test.mjs
 */
import assert from 'node:assert/strict';
import { decider, echoue, SEUIL_HAUSSE, SEUIL_NOUVEAU } from '../../scripts/qualite/fidelite/decision.mjs';

let n = 0;
const ok = (nom, f) => { f(); n += 1; };

ok('les seuils sont ceux du CO (STATUT §1.30)', () => { assert.equal(SEUIL_HAUSSE, 2); assert.equal(SEUIL_NOUVEAU, 15); });

// écran déjà mesuré
ok('écran mesuré : égal à la valeur acceptée passe', () => assert.equal(decider({ ecart: 12.2, accepte: 12.2 }).statut, 'accepte'));
ok('écran mesuré : mieux que la valeur acceptée passe', () => assert.equal(decider({ ecart: 3, accepte: 12.2 }).statut, 'accepte'));
ok('écran mesuré : +2 points exactement passe', () => assert.equal(decider({ ecart: 14.2, accepte: 12.2 }).statut, 'accepte'));
ok('écran mesuré : +2,04 points passe (le bruit après le dixième ne compte pas)', () => assert.equal(decider({ ecart: 14.24, accepte: 12.2 }).statut, 'accepte'));
ok('écran mesuré : +2,1 points échoue', () => assert.equal(decider({ ecart: 14.3, accepte: 12.2 }).statut, 'echec'));
ok('écran mesuré : valeur acceptée à 0 est bien une valeur (pas un écran nouveau)', () => {
  assert.equal(decider({ ecart: 1.9, accepte: 0 }).statut, 'accepte');
  assert.equal(decider({ ecart: 2.5, accepte: 0 }).statut, 'echec');
});
ok('écran mesuré : une justification n’efface pas une hausse', () => assert.equal(decider({ ecart: 30, accepte: 12.2, justifie: { raison: 'données d’exemple' } }).statut, 'echec'));

// écran nouveau
ok('écran nouveau : 15 % exactement passe', () => assert.equal(decider({ ecart: 15 }).statut, 'nouveau-ok'));
ok('écran nouveau : 15,04 % passe (arrondi au dixième)', () => assert.equal(decider({ ecart: 15.04 }).statut, 'nouveau-ok'));
ok('écran nouveau : 15,1 % échoue sans justification', () => assert.equal(decider({ ecart: 15.1 }).statut, 'nouveau-echec'));
ok('écran nouveau : justifié et écrit passe', () => {
  const r = decider({ ecart: 31, justifie: { raison: 'lignes du registre de D02' } });
  assert.equal(r.statut, 'nouveau-justifie');
  assert.match(r.raison, /registre de D02/);
});
ok('écran nouveau : une justification vide ne compte pas', () => {
  assert.equal(decider({ ecart: 31, justifie: { raison: '   ' } }).statut, 'nouveau-echec');
  assert.equal(decider({ ecart: 31, justifie: {} }).statut, 'nouveau-echec');
});

// robustesse
ok('écart illisible : échec, jamais un vert par défaut', () => {
  for (const ecart of [NaN, undefined, null, -1, Infinity]) assert.equal(decider({ ecart }).statut, 'echec');
});
ok('echoue() : seuls les deux échecs font échouer la garde', () => {
  assert.deepEqual(['accepte', 'echec', 'nouveau-ok', 'nouveau-justifie', 'nouveau-echec'].filter(echoue), ['echec', 'nouveau-echec']);
});

console.log(`✓ ${n} vérification(s) de la règle de fidélité.`);

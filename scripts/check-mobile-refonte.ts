/**
 * Contrôle de la LOGIQUE DE MOBILE ET TABLETTE (LOT-09) — `npm run check:formats`.
 *
 * Sans réseau, sans navigateur. `src/refonte/mobile/formats.ts` (formats d'écran, navigation, liste-détail, accueil
 * de la tablette, repli des fonctions d'appareil) est exercé hors interface, avec les valeurs du STATUT § 1.4 et de
 * la fiche T01 §11. Contrôles de structure : fichier pur (aucun import), aucune couleur, aucun secret.
 *
 *   npm run check:formats
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as F from '../src/refonte/mobile/formats.ts';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let echecs = 0;
let vus = 0;
const dit = (nom: string, fn: () => void) => {
  try {
    fn();
    vus += 1;
    console.log(`  ✓ ${nom}`);
  } catch (err) {
    echecs += 1;
    console.error(`  ✗ ${nom}\n      ${(err as Error).message.split('\n').join('\n      ')}`);
  }
};

console.log('Mobile et tablette — formats\n');

dit('seuils des fiches v4 (T01 §11) : téléphone < 600, tablette 600 à 1199, bureau ≥ 1200', () => {
  assert.deepEqual(F.SEUILS, { tablette: 600, bureau: 1200 });
  for (const [l, f] of [[320, 'telephone'], [390, 'telephone'], [599, 'telephone'], [599.5, 'telephone'], [600, 'tablette'], [768, 'tablette'], [1024, 'tablette'], [1199, 'tablette'], [1199.9, 'tablette'], [1200, 'bureau'], [1440, 'bureau'], [2560, 'bureau']] as const) {
    assert.equal(F.formatDe(l), f, `${l} px`);
  }
});
dit('une largeur absurde tombe au téléphone, jamais ailleurs', () => {
  for (const l of [NaN, -1, 0, Infinity * 0]) assert.equal(F.formatDe(l), 'telephone');
});
dit('les seuils sont ajustables : un seul endroit, tous les formats suivent', () => {
  const s = { tablette: 700, bureau: 1100 };
  assert.equal(F.formatDe(699, s), 'telephone');
  assert.equal(F.formatDe(700, s), 'tablette');
  assert.equal(F.formatDe(1100, s), 'bureau');
});
dit('les requêtes matchMedia couvrent toutes les largeurs sans trou ni recouvrement', () => {
  const q = F.requetes();
  assert.equal(q.telephone, '(max-width: 599.98px)');
  assert.equal(q.tablette, '(min-width: 600px) and (max-width: 1199.98px)');
  assert.equal(q.bureau, '(min-width: 1200px)');
  const verifie = (l: number, req: string): boolean => {
    const min = /min-width: ([\d.]+)px/.exec(req);
    const max = /max-width: ([\d.]+)px/.exec(req);
    return (!min || l >= Number(min[1])) && (!max || l <= Number(max[1]));
  };
  for (let l = 200; l <= 2000; l += 0.5) {
    const trouves = (['telephone', 'tablette', 'bureau'] as const).filter((f) => verifie(l, q[f]));
    assert.equal(trouves.length, 1, `${l} px : ${trouves.join(', ') || 'aucun format'}`);
    assert.equal(trouves[0], F.formatDe(l), `${l} px`);
  }
});

console.log('\nMobile et tablette — navigation et cibles\n');

dit('navigation : barre basse au téléphone, rail de 76 px en tablette, coquille au bureau', () => {
  assert.deepEqual(F.NAVIGATION, { telephone: 'barre-basse', tablette: 'rail', bureau: 'coquille' });
  assert.equal(F.HAUTEUR_BARRE_BASSE, 70);
  assert.equal(F.LARGEUR_RAIL, 76);
  assert.equal(F.TAILLE_BOUTON_FLOTTANT, 52);
});
dit('la barre basse a cinq places, « Plus » en dernier (il ouvre le tiroir)', () => {
  assert.deepEqual([...F.BARRE_BASSE], ['accueil', 'taches', 'argent', 'messages', 'plus']);
});
dit('cibles : 42 px au toucher (STATUT § 1.4), 36 px au bureau (§ 1.41)', () => {
  assert.equal(F.cibleMinimale('telephone'), 42);
  assert.equal(F.cibleMinimale('tablette'), 42);
  assert.equal(F.cibleMinimale('bureau'), 36);
  assert.equal(F.cibleTient(42, 42, 'telephone'), true);
  assert.equal(F.cibleTient(34, 34, 'telephone'), false, 'les 34 px des images MB04 et MB05 ne passent pas');
  assert.equal(F.cibleTient(36, 36, 'bureau'), true);
  assert.equal(F.cibleTient(41.9, 60, 'tablette'), false);
});

console.log('\nMobile et tablette — liste et détail\n');

dit('présentation : pile au téléphone, scindé en tablette et au bureau', () => {
  assert.equal(F.presentationListeDetail('telephone'), 'pile');
  assert.equal(F.presentationListeDetail('tablette'), 'scinde');
  assert.equal(F.presentationListeDetail('bureau'), 'scinde');
});
dit('au téléphone : la liste d’abord, le détail seulement une fois l’élément ouvert, le retour revient à la liste', () => {
  const debut = { selection: null, detailOuvert: false };
  assert.equal(F.detailVisible(debut, 'telephone'), false);
  const ouvert = F.ouvrirElement(debut, 'client-1');
  assert.equal(F.detailVisible(ouvert, 'telephone'), true);
  const retour = F.retourALaListe(ouvert);
  assert.equal(F.detailVisible(retour, 'telephone'), false);
  assert.equal(retour.selection, 'client-1', 'la sélection reste surlignée dans la liste');
});
dit('en tablette : le volet de détail est toujours là, avec son état vide faute de sélection', () => {
  assert.equal(F.detailVisible({ selection: null, detailOuvert: false }, 'tablette'), true);
});
dit('rotation : l’état n’est jamais perdu, aller-retour téléphone ⇄ tablette compris', () => {
  const etat = F.ouvrirElement({ selection: null, detailOuvert: false }, 'client-7');
  const copie = { ...etat };
  for (const f of ['tablette', 'telephone', 'bureau', 'telephone'] as const) F.detailVisible(etat, f);
  assert.deepEqual(etat, copie, 'la lecture ne touche pas à l’état');
  assert.equal(F.detailVisible(etat, 'telephone'), true, 'ouvert en tablette : plein écran au téléphone');
  const referme = F.retourALaListe(etat);
  assert.equal(F.detailVisible(referme, 'tablette'), true);
  assert.equal(F.detailVisible(referme, 'telephone'), false, 'un détail refermé reste refermé après rotation');
});
dit('ouvrir un élément ne mute pas l’état reçu', () => {
  const etat = Object.freeze({ selection: null, detailOuvert: false });
  assert.doesNotThrow(() => F.ouvrirElement(etat, 'a'));
  assert.doesNotThrow(() => F.retourALaListe(etat));
});

console.log('\nMobile et tablette — accueil de la tablette (T01 §11)\n');

dit('≥ 1100 : rail, 4 KPI sur une rangée, 3 volets', () => {
  for (const l of [1100, 1180, 1199]) assert.deepEqual(F.accueilTablette(l), { volets: 3, kpiParRangee: 4, voletCEnDessous: false, rail: true }, `${l} px`);
});
dit('800 à 1099 : KPI 2 × 2, 2 volets, le troisième passe dessous', () => {
  for (const l of [800, 900, 1099]) assert.deepEqual(F.accueilTablette(l), { volets: 2, kpiParRangee: 2, voletCEnDessous: true, rail: true }, `${l} px`);
});
dit('600 à 799 : colonne unique avec rail', () => {
  for (const l of [600, 700, 799]) assert.deepEqual(F.accueilTablette(l), { volets: 1, kpiParRangee: 2, voletCEnDessous: false, rail: true }, `${l} px`);
});
dit('sous 600 : colonne unique, sans rail (la barre basse prend le relais)', () => {
  for (const l of [320, 390, 599]) assert.equal(F.accueilTablette(l).rail, false, `${l} px`);
  assert.equal(F.accueilTablette(NaN).rail, false);
});
dit('les ruptures internes de T01 (800, 1100) sont dans la tablette ; 600 est aussi le seuil téléphone/tablette', () => {
  assert.deepEqual({ ...F.PALIERS_T01 }, { large: 1100, moyen: 800, etroit: 600 });
  assert.equal(F.PALIERS_T01.etroit, F.SEUILS.tablette);
  assert.equal(F.formatDe(700), 'tablette');
  assert.equal(F.accueilTablette(700).rail, true);
  assert.equal(F.formatDe(1180), 'tablette', 'le cadre de T01 (1180 px) est bien une tablette');
});

console.log('\nMobile et tablette — limites de la PWA\n');

dit('aucune fonction d’appareil n’est un bouton mort : chacune a un repli', () => {
  const rien = { camera: false, micro: false, biometrie: false, notifications: false };
  const tout = { camera: true, micro: true, biometrie: true, notifications: true };
  assert.equal(F.repliDe('camera', rien), 'import-de-fichier');
  assert.equal(F.repliDe('micro', rien), 'saisie-au-clavier');
  assert.equal(F.repliDe('biometrie', rien), 'code-seul');
  assert.equal(F.repliDe('notifications', rien), 'sans-notification');
  for (const k of ['camera', 'micro', 'biometrie', 'notifications'] as const) assert.equal(F.repliDe(k, tout), 'ok');
});
dit('première passe : pas de widget, aperçu de notification masqué', () => {
  assert.equal(F.LIMITES_PWA.widgets, false);
  assert.equal(F.LIMITES_PWA.apercuNotificationParDefaut, false);
});

console.log('\nMobile et tablette — structure\n');

const src = fs.readFileSync(path.join(racine, 'src/refonte/mobile/formats.ts'), 'utf8');
const sansCommentaires = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
dit('fichier pur : aucun import, aucun React, aucun accès au navigateur', () => {
  assert.ok(!/^\s*import\b/m.test(sansCommentaires), 'un import');
  assert.ok(!/\b(window|document|navigator|localStorage)\b/.test(sansCommentaires), 'un accès au navigateur');
});
dit('aucune couleur, aucun secret, aucune adresse', () => {
  assert.ok(!/#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(sansCommentaires), 'une couleur');
  assert.ok(!/https?:\/\/|(?:sk|pk)_(?:live|test)_|ghp_|AKIA/.test(sansCommentaires), 'un secret ou une adresse');
});
dit('rien dans src/screens ni dans le socle : seule la zone du lot est écrite', () => {
  assert.ok(fs.existsSync(path.join(racine, 'src/refonte/mobile')));
  assert.deepEqual(fs.readdirSync(path.join(racine, 'src/refonte/mobile')).filter((f) => !f.endsWith('.ts')), []);
});

console.log('');
if (echecs > 0) {
  console.error(`ÉCHEC — ${echecs} propriété(s) des formats ne tiennent pas.`);
  process.exit(1);
}
console.log(`OK — ${vus} propriétés des formats tiennent.`);
process.exit(0);

/**
 * Contrôle de la LOGIQUE DE L'ESPACE DÉVELOPPEMENT (LOT-11) — `npm run check:developpement`.
 *
 * Sans réseau, sans navigateur. La logique pure du lot (`src/refonte/developpement/`) est
 * exercée hors interface sur des cas écrits à la main d'après les fiches
 * (`docs/refonte/fiches/LOT-11/`, rubrique 6, avec les valeurs des images), puis sur les
 * jeux fictifs de SIM (`src/refonte/donnees/`) quand ils existent pour le lot.
 * S'y ajoutent des contrôles de structure : pas d'écran visuel avant le feu vert du CO,
 * aucun import depuis le code partagé, aucun nom ni montant des images dans la logique.
 *
 *   npm run check:developpement
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ZONE = 'src/refonte/developpement';
let echecs = 0;
let vus = 0;
const dit = async (nom: string, fn: () => void | Promise<void>) => {
  try {
    await fn();
    vus += 1;
    console.log(`  ✓ ${nom}`);
  } catch (err) {
    echecs += 1;
    console.error(`  ✗ ${nom}\n      ${(err as Error).message.split('\n').join('\n      ')}`);
  }
};

async function charger<T>(code: string): Promise<T> {
  const construit = await esbuild.build({
    stdin: { contents: code, resolveDir: path.join(racine, 'scripts'), loader: 'ts' },
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    charset: 'utf8',
    jsx: 'automatic',
    tsconfig: path.join(racine, 'tsconfig.json'),
    define: { 'process.env.NODE_ENV': '"production"', 'import.meta.env.DEV': 'false', __AMN_EDITION__: '"internal"', __AMN_VERSION__: '"0.0.0"' },
    logLevel: 'silent',
  });
  return (await import(`data:text/javascript;charset=utf-8;base64,${Buffer.from(construit.outputFiles[0].text, 'utf8').toString('base64')}`)) as T;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const M = await charger<any>(
  ['commun', 'deploiements', 'journal', 'planification', 'i18n', 'vues', 'modeles'].map((f) => `export * as ${f} from '../src/refonte/developpement/${f}';`).join('\n') +
    "\nexport * as monde from '../src/refonte/donnees';",
);
const { commun: C, deploiements: D, journal: J, planification: P, i18n: I, vues: V, modeles: MS, monde } = M;

const NB = ' ';
const t = (iso: string) => Date.parse(iso);
const MIN = 60_000;
const S = 1000;

/* ── Communs ─────────────────────────────────────────────────────────────── */
console.log('Développement — heure de Paris, durées, dates\n');

await dit('heure murale de Paris : hiver (+1) et été (+2), jour ISO', () => {
  assert.deepEqual(C.partiesParis('2026-10-30T09:15:00Z'), { jour: '2026-10-30', minutes: 10 * 60 + 15, jourSemaine: 5 });
  assert.deepEqual(C.partiesParis('2026-07-01T06:00:00Z'), { jour: '2026-07-01', minutes: 8 * 60, jourSemaine: 3 });
  assert.equal(C.partiesParis('2026-11-12T23:30:00Z').jour, '2026-11-13');
});
await dit('instant d’une heure de Paris, y compris l’heure qui manque et l’heure double', () => {
  assert.equal(C.instantParis('2026-11-12', 18 * 60), t('2026-11-12T17:00:00Z'));
  assert.equal(C.instantParis('2026-07-01', 8 * 60), t('2026-07-01T06:00:00Z'));
  // 29 mars 2026 : 02:30 n'existe pas → 03:30 (heure d'été)
  assert.equal(C.instantParis('2026-03-29', 150), t('2026-03-29T01:30:00Z'));
  // 25 oct. 2026 : 02:30 existe deux fois → la première (heure d'été)
  assert.equal(C.instantParis('2026-10-25', 150), t('2026-10-25T00:30:00Z'));
});
await dit('début du jour, de la semaine (lundi) et du mois, à Paris', () => {
  assert.equal(C.debutDuJourParis('2026-11-12T09:15:00Z'), t('2026-11-11T23:00:00Z'));
  assert.equal(C.debutDeSemaineParis('2026-11-12T09:15:00Z'), t('2026-11-08T23:00:00Z'));
  assert.equal(C.debutDuMoisParis('2026-11-12T09:15:00Z'), t('2026-10-31T23:00:00Z'));
});
await dit('durées : « 3 s », « 48 s », « 1 min 02 », « 1 min 48 », « 12 min », « 1 h 05 »', () => {
  assert.equal(C.formaterDuree(3 * S), `3${NB}s`);
  assert.equal(C.formaterDuree(48 * S), `48${NB}s`);
  assert.equal(C.formaterDuree(62 * S), `1${NB}min 02`);
  assert.equal(C.formaterDuree(108 * S), `1${NB}min 48`);
  assert.equal(C.formaterDuree(12 * MIN), `12${NB}min`);
  assert.equal(C.formaterDuree(65 * MIN), `1${NB}h 05`);
  assert.equal(C.formaterDuree(-1), '—');
});
await dit('dates des planifiés et des versions : « jeu. 12, 18:00 », « ven. 13, 09:00 », « jeu. 12 »', () => {
  assert.equal(C.dateEtHeure('2026-11-12T17:00:00Z'), 'jeu. 12, 18:00');
  assert.equal(C.dateEtHeure('2026-11-13T08:00:00Z'), 'ven. 13, 09:00');
  assert.equal(C.dateCourte('2026-11-20T10:00:00Z'), 'ven. 20');
  assert.equal(C.jourEtMois('2026-10-27'), '27 oct.');
});
await dit('« quand » : il y a 12 min, il y a 3 h, hier 18:20, lun. 9', () => {
  const m = '2026-11-12T09:15:00Z'; // jeudi 12 nov., 10:15 à Paris
  assert.equal(C.quandRelatif(t(m) - 12 * MIN, m), `il y a 12${NB}min`);
  assert.equal(C.quandRelatif(t(m) - 3 * 60 * MIN, m), `il y a 3${NB}h`);
  assert.equal(C.quandRelatif('2026-11-11T17:20:00Z', m), 'hier 18:20');
  assert.equal(C.quandRelatif('2026-11-09T15:00:00Z', m), 'lun. 9');
  assert.equal(C.quandRelatif(t(m) - 20 * S, m), 'à l’instant');
});
await dit('âge d’une version en ligne : « 3 h », « hier », « lun. », « 23 oct. »', () => {
  const m = '2026-11-12T09:15:00Z';
  assert.equal(C.ageCourt(t(m) - 3 * 60 * MIN, m), `3${NB}h`);
  assert.equal(C.ageCourt('2026-11-11T08:00:00Z', m), 'hier');
  assert.equal(C.ageCourt('2026-11-09T08:00:00Z', m), 'lun.');
  assert.equal(C.ageCourt('2026-10-23T08:00:00Z', m), '23 oct.');
});
await dit('une heure illisible est refusée', () => {
  assert.equal(C.lireHeure('08:00'), 480);
  assert.throws(() => C.lireHeure('25:00'));
  assert.throws(() => C.lireHeure('8h'));
});

console.log('\nDéveloppement — journal sans secret\n');

await dit('les valeurs qui ressemblent à un secret sont masquées', () => {
  assert.equal(C.masquerSecrets('Authorization: Bearer abcdefgh12345678'), `Authorization: Bearer ${C.MASQUE}`);
  assert.equal(C.masquerSecrets('échec : token=abc123def456 refusé'), `échec : token=${C.MASQUE} refusé`);
  assert.equal(C.masquerSecrets('API_KEY="Zx9QwErTy7"'), `API_KEY=${C.MASQUE}`);
  assert.equal(C.masquerSecrets('git clone https://equipe:motdepasse1@forge.exemple.test/depot'), `git clone https://equipe:${C.MASQUE}@forge.exemple.test/depot`);
  assert.equal(C.masquerSecrets(`empreinte ${'a1'.repeat(24)} reçue`), `empreinte ${C.MASQUE} reçue`);
});
await dit('un texte ordinaire n’est pas touché', () => {
  for (const x of [
    'La commande de build ne trouve pas l’image d’accueil.',
    'Mots repérés : devis, tarif, prix',
    'Test sur 3 courriels : réussi',
    'claude/refonte-socle · 3 commits',
  ]) {
    assert.equal(C.masquerSecrets(x), x);
  }
});

/* ── Déploiements ───────────────────────────────────────────────────────── */
console.log('\nDéveloppement — déploiements (DEV-deploiements)\n');

const base = (id: string, depot: string, cible: string, lanceA: string, extra: Record<string, unknown> = {}) =>
  D.nouveauDeploiement({ id, depot, branche: 'main', cible, par: 'Aaron', lanceA, ...extra });
/** Fait avancer un déploiement d'étape en étape ; `durees` en secondes, `echoueA` = étape qui échoue. */
function jouer(d: any, debut: string, durees: number[], echoueA?: string) {
  let x = d;
  let at = t(debut);
  for (let k = 0; k < D.ETAPES.length; k += 1) {
    const etape = D.ETAPES[k];
    if (D.etatGlobal(x) === 'echec') break;
    x = D.avancer(x, { type: 'debut', etape, a: at });
    at += durees[k] * S;
    x = D.avancer(x, { type: 'fin', etape, a: at, reussie: etape !== echoueA });
  }
  return x;
}

await dit('un déploiement neuf : 5 étapes à venir, en attente', () => {
  const d = base('d0', 'depot-a', 'apercu', '2026-11-12T09:00:00Z');
  assert.deepEqual(d.etapes.map((e: any) => e.etape), ['code', 'construction', 'tests', 'miseEnLigne', 'verification']);
  assert.equal(D.etatGlobal(d), 'en-attente');
  assert.equal(D.pastille(d).texte, 'En attente');
});
await dit('les 5 étapes réussies : « Réussi en 1 min 48 » (durée mesurée de bout en bout)', () => {
  let d = base('d1', 'depot-a', 'preproduction', '2026-11-12T09:03:00Z');
  const d0 = t('2026-11-12T09:03:00Z');
  // Les durées de la maquette (3, 48, 52, 6, 4 s = 113 s), avec des tests lancés 5 s avant la fin de la construction
  const plan: [string, number, number][] = [['code', 0, 3], ['construction', 3, 51], ['tests', 46, 98], ['miseEnLigne', 98, 104], ['verification', 104, 108]];
  for (const [etape, a, b] of plan) {
    d = D.avancer(d, { type: 'debut', etape, a: d0 + a * S });
    d = D.avancer(d, { type: 'fin', etape, a: d0 + b * S, reussie: true });
  }
  assert.equal(D.etatGlobal(d), 'reussi');
  assert.equal(D.dureeTotale(d), 108 * S);
  assert.equal(D.dureeEtape(d.etapes[2]), 52 * S);
  assert.deepEqual(D.pastille(d), { ton: 'succes', texte: `Réussi en 1${NB}min 48` });
});
await dit('une étape ne commence pas avant les précédentes ; une étape finie ne bouge plus', () => {
  const d = base('d2', 'depot-a', 'apercu', '2026-11-12T09:00:00Z');
  assert.throws(() => D.avancer(d, { type: 'debut', etape: 'tests', a: '2026-11-12T09:00:01Z' }), D.TransitionRefusee);
  const x = D.avancer(D.avancer(d, { type: 'debut', etape: 'code', a: '2026-11-12T09:00:01Z' }), { type: 'fin', etape: 'code', a: '2026-11-12T09:00:04Z', reussie: true });
  assert.throws(() => D.avancer(x, { type: 'fin', etape: 'code', a: '2026-11-12T09:00:05Z', reussie: true }), D.TransitionRefusee);
  assert.equal(D.etatGlobal(x), 'en-cours');
});
await dit('en cours : « En cours · Construction », durée qui court', () => {
  let d = base('d3', 'depot-a', 'apercu', '2026-11-12T09:00:00Z');
  d = D.avancer(d, { type: 'debut', etape: 'code', a: '2026-11-12T09:00:00Z' });
  d = D.avancer(d, { type: 'fin', etape: 'code', a: '2026-11-12T09:00:03Z', reussie: true });
  d = D.avancer(d, { type: 'debut', etape: 'construction', a: '2026-11-12T09:00:03Z' });
  assert.deepEqual(D.pastille(d), { ton: 'info', texte: 'En cours · Construction' });
  assert.equal(D.dureeTotale(d, '2026-11-12T09:00:30Z'), 30 * S);
  assert.equal(D.dureeEtape(d.etapes[1], '2026-11-12T09:00:30Z'), 27 * S);
});
await dit('un échec saute les étapes suivantes : « Échec à l’étape Tests »', () => {
  const d = jouer(base('d4', 'depot-b', 'apercu', '2026-11-12T04:15:00Z'), '2026-11-12T04:15:00Z', [3, 40, 19, 0, 0], 'tests');
  assert.equal(D.etatGlobal(d), 'echec');
  assert.deepEqual(d.etapes.map((e: any) => e.etat), ['reussie', 'reussie', 'echouee', 'sautee', 'sautee']);
  assert.deepEqual(D.pastille(d), { ton: 'danger', texte: 'Échec à l’étape Tests' });
  assert.equal(D.dureeTotale(d), 62 * S);
  assert.throws(() => D.avancer(d, { type: 'debut', etape: 'miseEnLigne', a: '2026-11-12T05:00:00Z' }), D.TransitionRefusee);
});
await dit('annuler : étape en cours et suivantes sautées, « Annulé »', () => {
  let d = base('d5', 'depot-a', 'apercu', '2026-11-12T09:00:00Z');
  d = D.avancer(d, { type: 'debut', etape: 'code', a: '2026-11-12T09:00:00Z' });
  d = D.avancer(d, { type: 'annuler', a: '2026-11-12T09:00:02Z' });
  assert.equal(D.etatGlobal(d), 'annule');
  assert.equal(D.pastille(d).texte, 'Annulé');
  assert.ok(d.etapes.every((e: any) => e.etat === 'sautee'));
});
await dit('cible « Interne » : prête, mais rien n’est mis en ligne tant que la distribution est fermée', () => {
  assert.equal(D.DISTRIBUTION_INTERNE_OUVERTE, false);
  assert.equal(D.cibleExecutable('interne'), false);
  assert.equal(D.cibleExecutable('production'), true);
  let d = base('d6', 'depot-a', 'interne', '2026-11-12T17:00:00Z', { version: '9.9.9' });
  for (const etape of ['code', 'construction', 'tests']) {
    d = D.avancer(d, { type: 'debut', etape, a: '2026-11-12T17:00:00Z' });
    d = D.avancer(d, { type: 'fin', etape, a: '2026-11-12T17:00:10Z', reussie: true });
  }
  assert.throws(() => D.avancer(d, { type: 'debut', etape: 'miseEnLigne', a: '2026-11-12T17:01:00Z' }), /distribution interne fermée/);
  assert.doesNotThrow(() => D.avancer(d, { type: 'debut', etape: 'miseEnLigne', a: '2026-11-12T17:01:00Z' }, { distributionInterneOuverte: true }));
});

const M0 = '2026-11-12T09:15:00Z'; // « maintenant » : jeudi 12 nov., 10:15 à Paris
/** Un déploiement réussi de `s` secondes en tout. */
const ok = (id: string, depot: string, cible: string, lanceA: string, s = 57, extra: Record<string, unknown> = {}) =>
  jouer(base(id, depot, cible, lanceA, extra), lanceA, [1, Math.floor((s - 3) / 2), Math.ceil((s - 3) / 2), 1, 1]);
const ko = (id: string, depot: string, cible: string, lanceA: string) => jouer(base(id, depot, cible, lanceA), lanceA, [3, 40, 19, 0, 0], 'tests');
const HISTO = [
  ok('h1', 'depot-a', 'preproduction', '2026-11-12T09:03:00Z', 108),
  ok('h2', 'depot-b', 'production', '2026-11-12T06:15:00Z', 42),
  ko('h3', 'depot-c', 'apercu', '2026-11-12T04:15:00Z'),
  ok('h4', 'depot-d', 'production', '2026-11-11T17:20:00Z', 57),
  ok('h5', 'depot-c', 'apercu', '2026-11-10T10:00:00Z', 50),
  ok('h6', 'depot-b', 'production', '2026-11-09T09:00:00Z', 40, { version: '2.0.0' }),
  ok('h7', 'depot-a', 'preproduction', '2026-11-09T08:00:00Z', 60),
  ok('h8', 'depot-a', 'production', '2026-11-03T08:00:00Z', 60),
  ok('h9', 'depot-d', 'production', '2026-11-10T08:00:00Z', 55),
  ok('h10', 'depot-b', 'apercu', '2026-11-11T08:00:00Z', 55),
  ok('futur', 'depot-a', 'production', '2026-11-13T08:00:00Z', 55),
];

await dit('historique : les 4 derniers lancés, du plus récent au plus ancien (pas le futur)', () => {
  assert.deepEqual(D.historique(HISTO, M0).map((d: any) => d.id), ['h1', 'h2', 'h3', 'h4']);
  assert.deepEqual(D.quandEtQui(HISTO[0], M0), { quand: `il y a 12${NB}min`, qui: 'Aaron' });
  assert.equal(D.quandEtQui(HISTO[3], M0).quand, 'hier 18:20');
});
await dit('« Revenir » vise la dernière version réussie AVANT la ligne, même dépôt, même cible', () => {
  assert.equal(D.versionDeRetour(HISTO, HISTO[0]).id, 'h7'); // pas h8 (même dépôt, autre cible)
  assert.equal(D.versionDeRetour(HISTO, HISTO[2]).id, 'h5'); // ligne en échec : ce qui est en ligne
  assert.equal(D.versionDeRetour(HISTO, HISTO[1]).id, 'h6');
  assert.equal(D.versionDeRetour(HISTO, HISTO[8]), null); // rien avant sur cette cible
  const r = D.retourArriere(HISTO, HISTO[1], { id: 'r1', par: 'Riyad', a: M0 });
  assert.equal(r.quoi, 'retour à 2.0.0');
  assert.equal(r.retourDe, 'h6');
  assert.equal(r.cible, 'production');
  assert.equal(D.etatGlobal(r), 'en-attente');
  assert.equal(D.retourArriere(HISTO, HISTO[8], { id: 'r2', par: 'Riyad', a: M0 }), null);
});
await dit('un échec repris par un déploiement réussi plus récent ne compte plus', () => {
  assert.deepEqual(D.echecsNonRepris(HISTO).map((d: any) => d.id), ['h3']);
  const repris = [...HISTO, ok('h11', 'depot-c', 'apercu', '2026-11-12T08:00:00Z')];
  assert.deepEqual(D.echecsNonRepris(repris), []);
});
await dit('sous-titre : « 9 cette semaine · 1 échec » (depuis lundi, Paris)', () => {
  assert.deepEqual(D.resumeSemaine(HISTO, M0), { total: 9, echecs: 1, texte: '9 cette semaine · 1 échec' });
  assert.equal(D.resumeSemaine([], M0).texte, '0 cette semaine');
  assert.equal(D.resumeSemaine(HISTO, M0, 'en').texte, '9 this week · 1 failure');
});
await dit('par jour : 14 jours glissants, du 27 oct. au 9 nov., un jour d’échec marqué', () => {
  const pj = D.parJour([...HISTO, ko('k1', 'depot-x', 'apercu', '2026-11-05T09:00:00Z')], '2026-11-09T18:00:00Z');
  assert.equal(pj.length, 14);
  assert.equal(pj[0].libelle, '27 oct.');
  assert.equal(pj[13].libelle, '9 nov.');
  assert.equal(pj[13].total, 2);
  assert.equal(pj.find((x: any) => x.jour === '2026-11-05').echec, true);
  assert.equal(pj.filter((x: any) => x.echec).length, 1);
});
await dit('en ligne maintenant : la dernière réussie par dépôt et cible, la plus récente d’abord', () => {
  const l = D.enLigne(HISTO, M0);
  assert.deepEqual(l.map((x: any) => `${x.depot}/${x.cible}`), ['depot-a/preproduction', 'depot-b/production', 'depot-d/production', 'depot-b/apercu', 'depot-c/apercu', 'depot-a/production']);
  assert.equal(l[1].age, `2${NB}h`);
  assert.equal(l[2].age, 'hier');
  assert.equal(l[4].age, 'mar.');
});
await dit('planifiés : à venir, du plus proche au plus lointain, « 2 à venir »', () => {
  const ps = [
    { id: 'p2', depot: 'depot-b', quoi: 'correctif', cible: 'serveur', a: '2026-11-13T08:00:00Z' },
    { id: 'p1', depot: 'depot-a', quoi: 'version 1.2.51', cible: 'interne', a: '2026-11-12T17:00:00Z' },
    { id: 'p0', depot: 'depot-a', quoi: 'ancien', cible: 'apercu', a: '2026-11-11T17:00:00Z' },
    { id: 'p3', depot: 'depot-a', quoi: 'annulé', cible: 'apercu', a: '2026-11-14T17:00:00Z', annule: true },
  ];
  const r = D.planifies(ps, M0);
  assert.deepEqual(r.aVenir.map((p: any) => p.id), ['p1', 'p2']);
  assert.equal(r.texte, '2 à venir');
  assert.equal(C.dateEtHeure(r.aVenir[0].a), 'jeu. 12, 18:00');
});
await dit('le rail des mises en ligne du Studio = l’historique « Production » du dépôt relié', () => {
  const s = D.depuisStudio('depot-s', [
    { version: '3', at: '2026-11-10T10:00:00Z', par: 'Mohamed', quoi: 'galerie' },
    { version: '2', at: '2026-11-01T10:00:00Z', par: 'Aaron' },
  ]);
  assert.ok(s.every((d: any) => D.etatGlobal(d) === 'reussi' && d.cible === 'production'));
  assert.equal(D.versionDeRetour(s, s[0]).version, '2');
  assert.equal(D.enLigne(s, M0)[0].deploiementId, s[0].id);
});
await dit('noms des étapes et des cibles, fr et en', () => {
  assert.deepEqual(D.ETAPES.map((e: string) => D.nomEtape(e)), ['Code reçu', 'Construction', 'Tests', 'Mise en ligne', 'Vérification']);
  assert.deepEqual(D.CIBLES.map((c: string) => D.nomCible(c)), ['Aperçu', 'Préproduction', 'Production', 'Interne', 'Serveur AMN']);
  assert.equal(D.nomEtape('miseEnLigne', 'en'), 'Go live');
});

/* ── Journal des exécutions ─────────────────────────────────────────────── */
console.log('\nDéveloppement — journal des exécutions (DEV-editeur, H20)\n');

const ex = (id: string, fluxId: string, debut: string, resultat = 'reussie', extra: Record<string, unknown> = {}) => ({ id, fluxId, debut, fin: debut, resultat, mode: 'local', ...extra });
const JRN = [
  ex('e1', 'devis', '2026-11-12T09:06:00Z'),
  ex('e2', 'devis', '2026-11-12T08:00:00Z', 'reussie', { actionHumaine: true }),
  ex('e3', 'devis', '2026-11-11T08:00:00Z', 'echec'),
  ex('e4', 'devis', '2026-11-01T00:10:00Z'), // 1er nov. 01:10 à Paris : dans le mois
  ex('e5', 'devis', '2026-10-31T22:50:00Z'), // 31 oct. 23:50 à Paris : hors du mois
  ex('e6', 'stock', '2026-11-12T07:00:00Z', 'ignoree'),
  ex('e7', 'stock', '2026-11-12T09:14:00Z', 'en-cours'),
  ex('t1', 'devis', '2026-11-12T09:10:00Z', 'reussie', { essai: true }),
  ex('e8', 'devis', '2026-11-05T08:00:00Z', 'reussie', { mode: 'api' }),
];

await dit('noter : trié du plus récent, même id = mise à jour, message masqué, purge à 90 jours', () => {
  let j = J.noter([], ex('a', 'f', '2026-11-12T09:00:00Z', 'en-cours'), { maintenant: M0 });
  j = J.noter(j, { ...ex('a', 'f', '2026-11-12T09:00:00Z', 'echec'), message: 'refus : token=abc123def456' }, { maintenant: M0 });
  j = J.noter(j, ex('vieux', 'f', '2026-08-01T09:00:00Z'), { maintenant: M0 });
  j = J.noter(j, ex('b', 'f', '2026-11-12T09:05:00Z'), { maintenant: M0 });
  assert.deepEqual(j.map((x: any) => x.id), ['b', 'a']);
  assert.equal(j[1].resultat, 'echec');
  assert.equal(j[1].message, `refus : token=${C.MASQUE}`);
  const plein = Array.from({ length: 5 }, (_, k) => ex(`n${k}`, 'f', `2026-11-12T0${k}:00:00Z`)).reduce((acc: any[], e) => J.noter(acc, e, { maintenant: M0, lignesMax: 3 }), []);
  assert.deepEqual(plein.map((x: any) => x.id), ['n4', 'n3', 'n2']);
});
await dit('exécutions du mois : depuis le 1er à Paris, sans essai ni exécution en cours', () => {
  assert.equal(J.executionsDuMois(JRN, M0, 'devis'), 5);
  assert.equal(J.executionsDuMois(JRN, M0), 6);
  assert.equal(J.texteExecutionsDuMois(JRN, M0, 'devis'), '5 exécutions ce mois');
  assert.equal(J.texteExecutionsDuMois([], M0), '0 exécution ce mois');
});
await dit('dernière exécution : les essais n’y sont pas ; « Dernière exécution : il y a 9 min »', () => {
  assert.equal(J.derniereExecution(JRN, 'devis').id, 'e1');
  assert.equal(J.texteDerniereExecution(JRN, M0, 'devis'), `Dernière exécution : il y a 9${NB}min`);
  assert.equal(J.texteDerniereExecution([], M0), 'Aucune exécution pour l’instant');
});
await dit('compteurs du jour : Tout, À regarder, Échecs', () => {
  assert.deepEqual(J.compteursDuJour(JRN, M0), { tout: 3, aRegarder: 1, echecs: 0 });
  assert.deepEqual(J.compteursDuJour(JRN, '2026-11-11T20:00:00Z'), { tout: 1, aRegarder: 0, echecs: 1 });
});
await dit('pause automatique après 3 échecs de suite ; un succès remet à zéro ; les essais ne comptent pas', () => {
  const j = [
    ex('x1', 'f', '2026-11-12T09:00:00Z', 'echec'),
    ex('x0', 'f', '2026-11-12T08:59:00Z', 'echec', { essai: true }),
    ex('x2', 'f', '2026-11-12T08:00:00Z', 'ignoree'),
    ex('x3', 'f', '2026-11-12T07:00:00Z', 'echec'),
    ex('x4', 'f', '2026-11-12T06:00:00Z', 'echec'),
    ex('x5', 'f', '2026-11-12T05:00:00Z', 'reussie'),
  ];
  assert.equal(J.SEUIL_PAUSE_AUTO, 3);
  assert.equal(J.echecsDeSuite(j, 'f'), 3);
  assert.equal(J.doitSeMettreEnPause(j, 'f'), true);
  assert.equal(J.doitSeMettreEnPause(j.slice(3), 'f'), false);
});
await dit('par jour : 7 jours, aujourd’hui compris', () => {
  const pj = J.parJour(JRN, M0, 7, 'devis');
  assert.equal(pj.length, 7);
  assert.equal(pj[6].jour, '2026-11-12');
  assert.equal(pj[6].total, 2);
  assert.equal(pj[5].total, 1);
});
await dit('temps gagné : « 25 min gagnées », « 1 h 40 gagnées », « environ 3 h par mois »', () => {
  assert.equal(J.minutesGagneesDuMois(JRN, { devis: 20, stock: 5 }, M0), 4 * 20);
  assert.equal(J.texteTempsGagne(25), `25${NB}min gagnées`);
  assert.equal(J.texteTempsGagne(100), '1 h 40 gagnées');
  assert.equal(J.texteEnvironParMois(185), 'environ 3 h par mois');
  assert.equal(J.texteEnvironParMois(10), 'environ 1 h par mois');
});
await dit('« Test sur 3 courriels : réussi » ; une erreur le dit', () => {
  const essais = [1, 2, 3].map((k) => ex(`t${k}`, 'devis', M0, 'reussie', { essai: true }));
  assert.equal(J.resultatTest(essais, 'courriels').texte, 'Test sur 3 courriels : réussi');
  const r = J.resultatTest([...essais.slice(0, 2), ex('t9', 'devis', M0, 'echec', { essai: true })], 'courriels');
  assert.deepEqual([r.reussi, r.texte], [false, 'Test sur 3 courriels : 1 en erreur']);
  assert.equal(J.resultatTest([ex('r', 'devis', M0)], 'courriels').total, 0); // une exécution réelle n'est pas un essai
});
await dit('part faite en local sur le mois (exécutions réelles)', () => {
  assert.equal(J.partLocaleDuMois(JRN, M0), Math.round((5 / 6) * 100));
  assert.equal(J.partLocaleDuMois([], M0), null);
});
await dit('jeu fictif `automatisations` : « 9 flux sur 12 tournent seuls » (brouillons compris)', () => {
  const { automatisations } = monde.construireMonde();
  const r = J.resumeFlux(automatisations);
  assert.deepEqual([r.actifs, r.total, r.texte], [9, 12, '9 flux sur 12 tournent seuls']);
  assert.equal(J.resumeFlux(monde.construireMonde({ volume: 'vide' }).automatisations).texte, '0 flux sur 0 tournent seuls');
  for (const v of ['peu', 'beaucoup']) {
    const x = J.resumeFlux(monde.construireMonde({ volume: v }).automatisations);
    assert.ok(x.actifs <= x.total);
  }
});

/* ── Tâches planifiées locales ──────────────────────────────────────────── */
console.log('\nDéveloppement — tâches planifiées locales\n');

const quotidien = (heure: string, jours?: number[]) => ({ type: 'quotidien', heure, ...(jours ? { jours } : {}) });

await dit('une planification invalide est refusée avec sa raison', () => {
  assert.equal(P.fauteDePlanification(quotidien('08:00')), null);
  assert.match(P.fauteDePlanification(quotidien('25:00')), /heure/);
  assert.match(P.fauteDePlanification(quotidien('08:00', [0])), /jours/);
  assert.match(P.fauteDePlanification({ type: 'intervalle', minutes: 2, depuis: M0 }), /5 minutes/);
});
await dit('« Tous les jours à 08:00 » : prochain passage demain, ou aujourd’hui s’il n’est pas passé', () => {
  assert.equal(P.prochainPassage(quotidien('08:00'), M0), t('2026-11-13T07:00:00Z'));
  assert.equal(P.prochainPassage(quotidien('08:00'), '2026-11-12T05:00:00Z'), t('2026-11-12T07:00:00Z'));
  assert.equal(P.precedentPassage(quotidien('08:00'), M0), t('2026-11-12T07:00:00Z'));
});
await dit('du lundi au vendredi : le vendredi soir mène au lundi', () => {
  assert.equal(P.prochainPassage(quotidien('08:00', [1, 2, 3, 4, 5]), '2026-11-13T17:00:00Z'), t('2026-11-16T07:00:00Z'));
  assert.equal(P.precedentPassage(quotidien('08:00', [1, 2, 3, 4, 5]), '2026-11-15T12:00:00Z'), t('2026-11-13T07:00:00Z'));
});
await dit('changements d’heure : 08:00 reste 08:00 à Paris ; 02:30 du 29 mars passe à 03:30', () => {
  assert.equal(P.prochainPassage(quotidien('08:00'), '2026-10-24T07:00:00Z'), t('2026-10-25T07:00:00Z'));
  assert.equal(P.prochainPassage(quotidien('08:00'), '2026-03-28T08:00:00Z'), t('2026-03-29T06:00:00Z'));
  assert.equal(P.prochainPassage(quotidien('02:30'), '2026-03-28T12:00:00Z'), t('2026-03-29T01:30:00Z'));
});
await dit('intervalle et passage unique', () => {
  const iv = { type: 'intervalle', minutes: 15, depuis: '2026-11-12T00:00:00Z' };
  assert.equal(P.prochainPassage(iv, '2026-11-12T09:15:00Z'), t('2026-11-12T09:30:00Z'));
  assert.equal(P.precedentPassage(iv, '2026-11-12T09:16:00Z'), t('2026-11-12T09:15:00Z'));
  assert.equal(P.prochainPassage(iv, '2026-11-11T00:00:00Z'), t('2026-11-12T00:00:00Z'));
  const une = { type: 'une-fois', a: '2026-11-12T17:00:00Z' };
  assert.equal(P.prochainPassage(une, M0), t('2026-11-12T17:00:00Z'));
  assert.equal(P.prochainPassage(une, '2026-11-12T18:00:00Z'), null);
});
await dit('au réveil du poste : UN passage rattrapé (le dernier), jamais une rafale ni un passage trop vieux', () => {
  const tache = { id: 'rapport', nom: 'Rapport du matin', planification: quotidien('08:00'), active: true, creeeA: '2026-11-01T00:00:00Z', dernierPassagePrevu: t('2026-11-08T07:00:00Z') };
  assert.equal(P.aLancer(tache, M0), t('2026-11-12T07:00:00Z'));
  const faite = P.apresPassage(tache, t('2026-11-12T07:00:00Z'));
  assert.equal(P.aLancer(faite, M0), null);
  assert.equal(P.aLancer(tache, '2026-11-12T20:30:00Z'), null); // 13 h 30 de retard : trop vieux
  assert.equal(P.aLancer({ ...tache, active: false }, M0), null);
  assert.equal(P.aLancer({ ...tache, creeeA: '2026-11-12T08:00:00Z', dernierPassagePrevu: null }, M0), null); // créée après l'heure du jour
});
await dit('tâches à lancer : dans l’ordre de leur heure prévue', () => {
  const ts = [
    { id: 'b', nom: 'b', planification: quotidien('09:00'), active: true, creeeA: '2026-11-01T00:00:00Z' },
    { id: 'a', nom: 'a', planification: quotidien('08:00'), active: true, creeeA: '2026-11-01T00:00:00Z' },
    { id: 'c', nom: 'c', planification: quotidien('20:00'), active: true, creeeA: '2026-11-01T00:00:00Z' },
  ];
  assert.deepEqual(P.tachesALancer(ts, M0).map((x: any) => x.tache.id), ['a', 'b']);
});
await dit('libellés : jours, nuits, semaine, intervalles, passage unique (fr et en)', () => {
  assert.equal(P.libellePlanification(quotidien('08:00')), 'Tous les jours à 08:00');
  assert.equal(P.libellePlanification(quotidien('03:00')), 'Chaque nuit à 03:00');
  assert.equal(P.libellePlanification(quotidien('08:00', [5, 1, 2, 3, 4])), 'Du lundi au vendredi à 08:00');
  assert.equal(P.libellePlanification(quotidien('09:00', [1])), 'Chaque lundi à 09:00');
  assert.equal(P.libellePlanification(quotidien('18:00', [1, 3, 5])), 'Lun., mer., ven. à 18:00');
  assert.equal(P.libellePlanification({ type: 'intervalle', minutes: 15, depuis: M0 }), 'Toutes les 15 min');
  assert.equal(P.libellePlanification({ type: 'intervalle', minutes: 60, depuis: M0 }), 'Toutes les heures');
  assert.equal(P.libellePlanification({ type: 'intervalle', minutes: 120, depuis: M0 }), 'Toutes les 2 h');
  assert.equal(P.libellePlanification({ type: 'une-fois', a: '2026-11-12T17:00:00Z' }), 'Le jeu. 12 à 18:00');
  assert.equal(P.libellePlanification(quotidien('08:00'), 'en'), 'Every day at 08:00');
});

/* ── Ce que les écrans tirent des données (vues.ts) ─────────────────────── */
console.log('\nDéveloppement — vues des écrans (DEV-projets, DEV-ensemble)\n');

const depot = (id: string, extra: Record<string, unknown> = {}) => ({
  id, nom: `depot-${id}`, description: 'x', branche: 'main', langages: [{ nom: 'TypeScript', part: 100 }],
  tests: { etat: 'verts', echecs: 0, depuisLe: null }, commitsParSemaine: Array.from({ length: 31 }, (_, k) => (k === 30 ? 3 : k % 4)),
  dernierCommitAt: '2026-11-11T09:00:00Z', cible: 'Hébergement web', version: null, ticketIds: ['t1', 't2'], teinte: 0, ...extra,
});
await dit('lignes d’une carte de dépôt : branche principale, autre branche, version et tickets', () => {
  const ouverts = { ouverts: 2 };
  assert.deepEqual(V.lignesDuDepot(depot('a'), M0, ouverts), { branche: 'main · dernier commit hier', cible: 'Hébergement web · 2 tickets' });
  assert.equal(V.lignesDuDepot(depot('b', { branche: 'refonte-v2' }), M0, ouverts).branche, 'refonte-v2 · 3 commits');
  assert.equal(V.lignesDuDepot(depot('c', { version: '1.2.41', cible: 'Édition interne' }), M0, { ouverts: 0 }).cible, 'v1.2.41 Édition interne · 0 ticket');
  assert.equal(V.lignesDuDepot(depot('d', { dernierCommitAt: '2026-11-09T09:00:00Z' }), M0, ouverts).branche, 'main · dernier commit il y a 3 j');
});
await dit('pastille, tri (en échec d’abord), commits de la semaine, part de dépôts verts', () => {
  const ko = depot('k', { tests: { etat: 'echec', echecs: 1, depuisLe: '2026-11-12T06:30:00Z' }, dernierCommitAt: '2026-11-01T09:00:00Z' });
  assert.deepEqual(V.pastilleDepot(depot('a')), { ton: 'succes', texte: 'Tests verts' });
  assert.deepEqual(V.pastilleDepot(ko), { ton: 'attention', texte: '1 test en échec' });
  assert.deepEqual(V.trierDepots([depot('a'), ko]).map((x: any) => x.id), ['k', 'a']);
  assert.equal(V.commitsDeLaSemaine([depot('a'), ko]), 6);
  assert.equal(V.partTestsVerts([depot('a'), ko]), 50);
  assert.equal(V.partTestsVerts([]), null);
});
await dit('carte d’activité : 31 semaines, des cases de bas en haut selon le niveau, jamais un jour inventé', () => {
  const c = V.carteDActivite([depot('a')]);
  assert.equal(c.length, 31);
  assert.ok(c.every((x: any) => x.cases >= 0 && x.cases <= 7));
  assert.equal(c[0].cases, 0); // semaine sans commit
  assert.equal(Math.max(...c.map((x: any) => x.cases)), 7);
});
await dit('« À regarder aujourd’hui » : rouge d’abord, tests du matin, tickets bloquants, déploiement non repris, service', () => {
  const ko = depot('k', { tests: { etat: 'echec', echecs: 1, depuisLe: '2026-11-12T06:30:00Z' } });
  const r = V.aRegarder({
    depots: [ko, depot('a', { ticketIds: ['t1', 't2', 't3'] })],
    deploiements: [jouer(base('x1', 'depot-x', 'apercu', '2026-11-12T04:00:00Z'), '2026-11-12T04:00:00Z', [3, 40, 19, 0, 0], 'tests')],
    services: [{ id: 's1', nom: 'Mails sortants', etat: 'attention', disponibilite30jPct: 99.41 }, { id: 's2', nom: 'Base', etat: 'en marche', disponibilite30jPct: 99.99 }],
    ouverts: new Set(['t1', 't2', 't3']),
    bloquants: new Set(['t3']),
    maintenant: M0,
  });
  assert.deepEqual(r.map((x: any) => x.cle), ['deploiement:x1', 'tickets:a', 'tests:k', 'service:s1']);
  assert.equal(r.find((x: any) => x.cle === 'tests:k').texte, '1 test en échec depuis ce matin');
  assert.equal(r.find((x: any) => x.cle === 'tickets:a').texte, '3 tickets ouverts, dont 1 bloquant');
  assert.equal(r.find((x: any) => x.cle === 'deploiement:x1').texte, 'déploiement vers Aperçu en échec');
});
await dit('disque : « tranquille pour 2 ans » à 1,1 Go par semaine (160 Go, 38 utilisés)', () => {
  const s = V.semainesAvantPlein(160, 38, [1.0, 1.2, 1.1, 1.1]);
  assert.ok(Math.abs(s - 110.9) < 0.1);
  assert.equal(V.texteDuree(s), '2 ans');
  assert.equal(V.texteDuree(30), '7 mois');
  assert.equal(V.texteDuree(3), '3 semaines');
  assert.equal(V.semainesAvantPlein(160, 38, [1]), null);
  assert.equal(V.semainesAvantPlein(160, 38, [0, 0]), null);
});
await dit('serveur : disponibilité « 99,98 % » / « 100 % », tons, Go, débit, moyenne de la dernière heure', () => {
  assert.equal(V.texteDisponibilite(99.98), `99,98${NB}%`);
  assert.equal(V.texteDisponibilite(100), `100${NB}%`);
  assert.deepEqual([99.97, 99.41, 98.2].map(V.tonDisponibilite), ['succes', 'attention', 'critique']);
  assert.equal(V.texteGo(4.08), `4,1${NB}Go`);
  assert.equal(V.texteGo(38.4), `38${NB}Go`);
  assert.equal(V.texteDebit(1.24), `1,2${NB}Mo/s`);
  assert.equal(V.moyenneDerniereHeure([90, 90, 10, 20, 30, 40, 50, 60]), 35);
  assert.equal(V.moyenneDerniereHeure([]), null);
});
await dit('jeux de SIM : un seul serveur, des services, 24 h de mesures sans hôte ni adresse', () => {
  const mm = monde.construireMonde();
  assert.equal(mm.serveur.length, 1);
  assert.ok(mm.servicesServeur.length > 0 && mm.mesuresServeur.length >= 100);
  const texte = JSON.stringify([mm.serveur, mm.servicesServeur]);
  assert.doesNotMatch(texte, /\b\d{1,3}(?:\.\d{1,3}){3}\b|https?:\/\/|localhost|\.local\b/);
});
await dit('coûts : part faite seul sur les opérations branchées, payé du mois sans commission', () => {
  const cs = [
    { mode: 'local', consommationMois: { utilise: 412 }, payeCeMoisCents: 0 },
    { mode: 'payant', consommationMois: { utilise: 180 }, payeCeMoisCents: 1400 },
    { mode: 'a-brancher', consommationMois: { utilise: 0 }, payeCeMoisCents: 0 },
  ];
  assert.equal(V.partFaiteSeul(cs), Math.round((412 / 592) * 100));
  assert.equal(V.partFaiteSeul([]), null);
  assert.equal(V.payeDuMois(cs), 1400);
});
await dit('jeux de SIM : les dépôts se lisent sans adaptateur (volumes vide à beaucoup)', () => {
  for (const v of ['vide', 'peu', 'normal', 'beaucoup']) {
    const mm = monde.construireMonde({ volume: v });
    for (const d of mm.depots) {
      assert.equal(d.commitsParSemaine.length, 31);
      V.lignesDuDepot(d, monde.MAINTENANT_REFERENCE, { ouverts: 0 });
    }
    assert.equal(V.carteDActivite(mm.depots).length, 31);
  }
});

/* ── Modèles de sites (modeles.ts) ──────────────────────────────────────── */
console.log('\nDéveloppement — modèles de sites (DEV-modeles-sites)\n');

const modele = (id: string, nom: string, secteur: string, etiquettes: string[] = [], html = '<!doctype html>\n<html lang="fr"><body>x</body></html>') => ({ id, nom, secteur, etiquettes, html, origine: 'ajoute' });
await dit('aucun modèle livré avant la relecture de Harun ; les ajoutés restent sur le poste', () => {
  assert.deepEqual(MS.MODELES_LIVRES, []);
  const brut = MS.ecrireAjoutes([modele('a', 'Atelier', 'Artisan')]);
  assert.deepEqual(MS.lireAjoutes(brut).map((m: any) => [m.nom, m.secteur, m.origine, m.etiquettes[0]]), [['Atelier', 'Artisan', 'ajoute', 'Ajouté']]);
  assert.deepEqual(MS.lireAjoutes('pas du json'), []);
  assert.deepEqual(MS.lireAjoutes('{"a":1}'), []);
  assert.deepEqual(MS.lireAjoutes(null), []);
});
await dit('puces : « Tous » d’abord, puis les secteurs en ordre alphabétique français, avec leur compte', () => {
  const ms = [modele('1', 'B', 'Restauration'), modele('2', 'A', 'Artisan'), modele('3', 'C', 'Écoles'), modele('4', 'D', 'Artisan')];
  assert.deepEqual(MS.puces(ms).map((p: any) => `${p.cle}:${p.compte}`), [':4', 'Artisan:2', 'Écoles:1', 'Restauration:1']);
});
await dit('recherche : chaque mot, dans nom, secteur et étiquettes, sans casse ni accent ; combinée à la puce', () => {
  const ms = [modele('1', 'Veillance', 'Services B2B', ['Cybersécurité', 'Sombre']), modele('2', 'Optique Lumière', 'Commerce local', ['Clair'])];
  assert.deepEqual(MS.filtrer(ms, '', 'cyber sombre').map((m: any) => m.id), ['1']);
  assert.deepEqual(MS.filtrer(ms, '', 'LUMIERE').map((m: any) => m.id), ['2']);
  assert.deepEqual(MS.filtrer(ms, 'Commerce local', 'sombre'), []);
  assert.equal(MS.filtrer(ms, '', '  ').length, 2);
});
await dit('poids « 4,5 Ko » (octets UTF-8), lignes, et refus d’un ajout incomplet', () => {
  assert.equal(MS.poids('x'.repeat(4608)), `4,5${NB}Ko`);
  assert.equal(MS.poids('é'.repeat(512)), `1,0${NB}Ko`);
  assert.equal(MS.lignes('a\nb\nc'), 3);
  assert.equal(MS.fauteDAjout('', 'Artisan', '<html></html>'), 'nom');
  assert.equal(MS.fauteDAjout('Garage', '', '<html></html>'), 'secteur');
  assert.equal(MS.fauteDAjout('Garage', 'Artisan', 'bonjour'), 'code');
  assert.equal(MS.fauteDAjout('Garage', 'Artisan', '<!doctype html><title>x</title>'), null);
});
await dit('le code est découpé en jetons colorables, rendus en texte (jamais interprétés)', () => {
  const j = MS.jetonsHtml('<meta name="viewport" content="x"><!-- note -->');
  assert.deepEqual(j.filter((x: any) => x.genre !== 'texte').map((x: any) => `${x.genre}:${x.texte}`), ['balise:meta', 'attribut:name', 'valeur:"viewport"', 'attribut:content', 'valeur:"x"', 'commentaire:<!-- note -->']);
  assert.equal(j.map((x: any) => x.texte).join(''), '<meta name="viewport" content="x"><!-- note -->');
});

/* ── Textes ─────────────────────────────────────────────────────────────── */
console.log('\nDéveloppement — textes (tutoiement, deux langues)\n');

await dit('le français a toutes les clés de l’anglais, et rien de plus', () => {
  const { en, fr } = I.DICTIONNAIRES_DEVELOPPEMENT;
  assert.deepEqual(Object.keys(fr).sort(), Object.keys(en).sort());
  for (const [k, v] of Object.entries(fr)) assert.ok(String(v).trim().length > 0, `clé vide : ${k}`);
});
await dit('l’interface tutoie : aucun « vous », « votre », « vos » dans les textes du lot', () => {
  for (const [k, v] of Object.entries(I.DICTIONNAIRES_DEVELOPPEMENT.fr)) {
    assert.doesNotMatch(String(v), /(^|[^\p{L}-])(vous|votre|vos)(?=[^\p{L}-]|$)/iu, `vouvoiement dans ${k}`);
  }
});

/* ── Structure de la zone ───────────────────────────────────────────────── */
console.log('\nDéveloppement — structure de la zone\n');

const fichiersSous = (dossier: string): string[] => {
  const abs = path.join(racine, dossier);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? fichiersSous(path.join(dossier, e.name)) : [path.join(dossier, e.name)]));
};
const zone = fichiersSous(ZONE);

/** Les fichiers visuels permis (étape 3, feu vert du CO le 14 nov.) : les écrans du lot et leurs briques. */
const VISUELS = new Set(['donnees.tsx', 'briques.tsx', 'VueDEnsemble.tsx', 'ProjetsDeCode.tsx', 'PageDeploiements.tsx', 'ServeurSante.tsx', 'EditeurDeFlux.tsx', 'CoutsEtApi.tsx', 'ModelesDeSites.tsx']);
await dit('construction : seuls les écrans du lot et leurs briques sont des .tsx', () => {
  assert.ok(zone.length >= 5, 'la zone du lot est vide');
  assert.deepEqual(zone.filter((f) => f.endsWith('.tsx') && !VISUELS.has(path.basename(f))), []);
});
await dit('feuille du lot (styles.ts) : jetons du socle seulement, aucune couleur écrite à la main, aucun fichier .css', () => {
  assert.deepEqual(zone.filter((x) => x.endsWith('.css')), []);
  const feuille = fs.readFileSync(path.join(racine, ZONE, 'styles.ts'), 'utf8');
  assert.doesNotMatch(feuille, /#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i);
  assert.match(feuille, /var\(--fam-a\)/);
});
await dit('aucun nom de fichier ne diffère d’un autre par la casse seule (Windows et macOS ne les distinguent pas)', () => {
  const vus = new Map<string, string>();
  for (const f of zone) {
    const cle = f.toLowerCase().replace(/\.(tsx?|ts)$/, '');
    assert.ok(!vus.has(cle), `${f} et ${vus.get(cle)} ne diffèrent que par la casse`);
    vus.set(cle, f);
  }
});
await dit('la logique n’importe ni l’écran partagé, ni l’édition cliente, ni le pont du poste', () => {
  for (const f of zone) {
    const src = fs.readFileSync(path.join(racine, f), 'utf8');
    assert.doesNotMatch(src, /from\s+['"][^'"]*(?:\/screens\/|\/business\/|\.business['"]|lib\/bridge|react-dom)/, f);
  }
});
await dit('aucun code partagé n’importe la zone du lot en direct', () => {
  const fautes = fichiersSous('src')
    .filter((f) => /\.tsx?$/.test(f) && !f.startsWith(`src${path.sep}refonte${path.sep}`) && !/\.internal\.tsx?$/.test(f))
    .filter((f) => /refonte\/developpement/.test(fs.readFileSync(path.join(racine, f), 'utf8')));
  assert.deepEqual(fautes, []);
});
await dit('aucun nom, montant ni adresse des images dans la logique (données fictives seulement)', () => {
  // « amn-api » n'y est pas : c'est le nom du serveur du projet, cité dans les commentaires (ce qui relève de lui).
  const interdits = [/amn-desktop/i, /amn-site/i, /optique-avenue/i, /aura-prestige/i, /amndevsec/i, /\bMohamed\b/, /\bRiyad\b/, /\bAaron\b/, /contact@/i, /\b\d{1,3}(?:\.\d{1,3}){3}\b/, /#[0-9a-f]{6}\b/i];
  for (const f of zone) {
    const src = fs.readFileSync(path.join(racine, f), 'utf8');
    for (const motif of interdits) assert.doesNotMatch(src, motif, `${f} contient ${motif}`);
  }
});
await dit('aucun secret ni clé écrit dans la zone', () => {
  for (const f of zone) {
    const src = fs.readFileSync(path.join(racine, f), 'utf8');
    assert.doesNotMatch(src, /(?:BEGIN [A-Z ]*PRIVATE KEY|ghp_[A-Za-z0-9]{20,}|sk_(?:live|test)_[A-Za-z0-9]{10,}|AKIA[0-9A-Z]{16})/, f);
  }
});

console.log(`\n${vus} contrôles verts${echecs ? `, ${echecs} en échec` : ''}.`);
if (echecs) process.exit(1);

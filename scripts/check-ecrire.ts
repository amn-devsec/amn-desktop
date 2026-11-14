/**
 * Contrôle de la LOGIQUE DE ÉCRIRE ET RETENIR (LOT-03) — `npm run check:ecrire`.
 *
 * Sans réseau, sans navigateur. La logique pure du lot (`src/refonte/ecrire/`) est exercée hors interface sur
 * des cas écrits à la main d'après les fiches du dossier v4 (`lots/LOT-03-ecrire/`, rubrique 6, avec les valeurs
 * des images), puis rejouée sur les jeux fictifs de SIM (`src/refonte/donnees/`) aux quatre volumes.
 * S'y ajoutent des contrôles de structure : pas d'écran visuel avant le socle v4, aucune brique du socle importée,
 * aucun code partagé, aucun nom ni montant des images dans la logique, tutoiement dans l'interface.
 *
 *   npm run check:ecrire
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ZONE = 'src/refonte/ecrire';
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

const FICHIERS = ['commun', 'serie', 'pages', 'relecture', 'documents', 'signatures', 'modeles', 'journal', 'redaction', 'archives', 'connaissances', 'hub', 'i18n', 'phrases'];

/* eslint-disable @typescript-eslint/no-explicit-any */
const M = await charger<any>(FICHIERS.map((f) => `export * as ${f} from '../${ZONE}/${f}';`).join('\n') + `\nexport * as composerH10 from '../${ZONE}/ecrans/h10/composer';\nexport * as composerF20 from '../${ZONE}/ecrans/f20/composer';\nexport * as composerH11 from '../${ZONE}/ecrans/h11/composer';\nexport * as composerH12 from '../${ZONE}/ecrans/h12/composer';` + "\nexport * as monde from '../src/refonte/donnees';");
const { commun: C, serie: S, pages: P, relecture: R, documents: D, signatures: G, modeles: MO, journal: J, redaction: RE, archives: A, connaissances: K, hub: H, i18n: I, phrases: PH, composerH10: CH10, composerF20: CF20, composerH11: CH11, composerH12: CH12, monde } = M;

const NB = ' ';
const paris = (j: string, hhmm: string) => C.instantParis(j, Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3)));
const jours = (de: string, a: string): string[] => {
  const out: string[] = [];
  for (let j = de; j <= a; j = C.ajouterJours(j, 1)) out.push(j);
  return out;
};
const AUJ = '2026-10-30'; // vendredi

/* ── Communs ─────────────────────────────────────────────────────────────── */
console.log('Écrire — communs\n');

await dit('heure de Paris : hiver (+1), été (+2), jour ISO ; vendredi 30 oct. 2026', () => {
  assert.deepEqual(C.partiesParis('2026-10-30T09:15:00Z'), { jour: '2026-10-30', minutes: 615, jourSemaine: 5 });
  assert.deepEqual(C.partiesParis('2026-07-01T06:00:00Z'), { jour: '2026-07-01', minutes: 480, jourSemaine: 3 });
  assert.equal(C.partiesParis('2026-11-12T23:30:00Z').jour, '2026-11-13');
  assert.equal(C.jourSemaineIso('2026-10-01'), 4, 'le 1er octobre 2026 est un jeudi');
  assert.equal(C.jourSemaineIso('2026-11-05'), 4);
  assert.equal(C.jourSemaineIso('2026-11-16'), 1);
});
await dit('instantParis : passage à l’heure d’hiver et d’été', () => {
  assert.equal(new Date(C.instantParis('2026-10-30', 10 * 60)).toISOString(), '2026-10-30T09:00:00.000Z', 'heure d’hiver depuis le 25 oct.');
  assert.equal(new Date(C.instantParis('2026-10-20', 10 * 60)).toISOString(), '2026-10-20T08:00:00.000Z', 'heure d’été avant le 25 oct.');
  assert.equal(new Date(C.instantParis('2026-11-02', 9 * 60)).toISOString(), '2026-11-02T08:00:00.000Z');
  assert.equal(new Date(C.instantParis('2026-03-29', 2 * 60 + 30)).toISOString(), '2026-03-29T01:30:00.000Z', 'l’heure qui n’existe pas est décalée');
});
await dit('jours et mois : ajouter, écart, mois précédent (30 mars → 28 févr.), ajouter des mois (fin de mois gardée)', () => {
  assert.equal(C.ajouterJours('2026-10-30', 3), '2026-11-02');
  assert.equal(C.ecartJours('2026-10-30', '2026-11-05'), 6);
  assert.equal(C.moisPrecedent('2026-10-30'), '2026-09-30');
  assert.equal(C.moisPrecedent('2026-03-30'), '2026-02-28');
  assert.equal(C.moisPrecedent('2026-01-15'), '2025-12-15');
  assert.equal(C.ajouterMois('2027-10-31', -2), '2027-08-31');
  assert.equal(C.ajouterMois('2026-10-31', 4), '2027-02-28');
  assert.equal(C.ajouterMois('2026-01-31', 1), '2026-02-28');
});
await dit('formats français : 1 482, 92 %, 2,1 Go, 17,9 Go', () => {
  assert.equal(C.nombre(1482), `1${NB}482`);
  assert.equal(C.nombre(1482, 'en'), '1,482');
  assert.equal(C.nombre(3.8), '3,8');
  assert.equal(C.pct(92), `92${NB}%`);
  assert.equal(C.tailleLisible(2_100_000_000), `2,1${NB}Go`);
  assert.equal(C.tailleLisible(17_900_000_000), `17,9${NB}Go`);
  assert.equal(C.tailleLisible(840_000), `840${NB}Ko`);
  assert.equal(C.pourcent(78, 120), 65);
  assert.equal(C.pourcent(5, 0), 0);
});
await dit('mots, coupure, accents, écart-type', () => {
  assert.equal(C.compterMots('Aujourd’hui, jour 12 : on a fini l’atelier !'), 7);
  assert.equal(C.compterMots('   '), 0);
  assert.equal(C.couper('court', 20), 'court');
  assert.ok(C.couper('une phrase assez longue pour être coupée proprement', 24).endsWith('…'));
  assert.ok(C.couper('une phrase assez longue pour être coupée proprement', 24).length <= 24);
  assert.equal(C.aplatir('Tâche'), 'tache');
  assert.equal(C.ecartType([1]), 0);
  assert.ok(Math.abs(C.ecartType([1.2, 2.4]) - 0.8485) < 0.001);
});

/* ── Série d'écriture ────────────────────────────────────────────────────── */
console.log('\nÉcrire — la série d’écriture (F20, H10, ME01)\n');

// Le mois de la maquette de ME01 : jours écrits 1, 2, 5 à 9, 12 à 17, 19 à 30 ; un record de 21 jours en septembre.
const ECRITS_OCT = [...jours('2026-10-01', '2026-10-02'), ...jours('2026-10-05', '2026-10-09'), ...jours('2026-10-12', '2026-10-17'), ...jours('2026-10-19', '2026-10-30')];
const motsMaquette = () => {
  const m = new Map<string, number>();
  for (const j of ECRITS_OCT) m.set(j, 130);
  for (const j of jours('2026-09-05', '2026-09-25')) m.set(j, 80);
  return m;
};

await dit('ME01 : 12 jours de suite, record 21, 25 jours écrits, prochain palier 14 dans 2 jours (86 %)', () => {
  const s = S.serieDEcriture(motsMaquette(), AUJ, { joursDeRepos: [] });
  assert.equal(s.serie, 12);
  assert.equal(s.record, 21);
  assert.equal(s.etat, 'en-cours');
  assert.equal(s.prochainPalier, 14);
  assert.equal(s.joursAvantPalier, 2);
  assert.equal(Math.round(s.progression * 100), 86);
  assert.equal(s.ecritAujourdhui, true);
  const mois = S.moisEnCases(motsMaquette(), AUJ, AUJ);
  assert.equal(mois.joursEcrits, 25);
  assert.equal(mois.cases.length, 31);
  assert.equal(mois.decalage, 3, 'le 1er octobre est un jeudi : 3 cases vides');
  assert.equal(mois.cases[29].etat, 'ecrit');
  assert.equal(mois.cases[30].etat, 'futur', 'le 31 est à venir');
  assert.equal(mois.cases[2].etat, 'non-ecrit', 'le 3 n’est pas écrit');
});
await dit('aujourd’hui vide : la série va jusqu’à hier, rien n’est perdu ; un jour de plus se compte', () => {
  const m = motsMaquette();
  m.delete(AUJ);
  const s = S.serieDEcriture(m, AUJ, { joursDeRepos: [] });
  assert.equal(s.serie, 11);
  assert.equal(s.ecritAujourdhui, false);
  assert.equal(s.etat, 'en-cours');
  assert.equal(S.serieDEcriture(m, '2026-10-30', { joursDeRepos: [] }).joursAvantPalier, 3);
  const mois = S.moisEnCases(m, AUJ, AUJ);
  assert.equal(mois.cases[29].etat, 'aujourdhui', 'le jour en cours reste en pointillé tant que rien n’est écrit');
});
await dit('série interrompue : elle reprend, sans « 0 » ni reproche ; le record reste ; jamais écrit : première page', () => {
  const m = new Map<string, number>([...jours('2026-10-01', '2026-10-10')].map((j) => [j, 50]));
  const s = S.serieDEcriture(m, AUJ, { joursDeRepos: [] });
  assert.equal(s.serie, 0);
  assert.equal(s.etat, 'reprise');
  assert.equal(s.record, 10);
  const vide = S.serieDEcriture(new Map(), AUJ);
  assert.equal(vide.etat, 'aucune');
  assert.equal(vide.record, 0);
  assert.equal(vide.prochainPalier, 7);
});
await dit('les jours de repos ne cassent pas la série ; sans repos, le week-end la casse', () => {
  const m = new Map<string, number>([['2026-10-23', 40], ['2026-10-26', 40], ['2026-10-27', 40]]);
  assert.equal(S.serieDEcriture(m, '2026-10-27', { joursDeRepos: [] }).serie, 2, 'samedi et dimanche non écrits la cassent');
  assert.equal(S.serieDEcriture(m, '2026-10-27', { joursDeRepos: [6, 7] }).serie, 3);
  assert.equal(S.serieDEcriture(m, '2026-10-27', { joursDeRepos: [6, 7] }).record, 3);
  assert.equal(S.serieDEcriture(m, '2026-10-27').serie, 3, 'repos par défaut : samedi et dimanche (décision du CO, §1.29 n° 1)');
});
await dit('les paliers : 7, 14, 21, 30, 60, 100 ; au-delà du dernier, plus de palier', () => {
  assert.deepEqual([...S.PALIERS_SERIE], [7, 14, 21, 30, 60, 100]);
  const longue = new Map<string, number>(jours('2026-06-01', AUJ).map((j) => [j, 10]));
  const s = S.serieDEcriture(longue, AUJ, { joursDeRepos: [] });
  assert.equal(s.serie, 152);
  assert.equal(s.prochainPalier, null);
  assert.equal(s.joursAvantPalier, null);
  assert.equal(s.progression, 1);
});
await dit('badges de F20 : sur la série en cours (7 jours obtenu, 14 et Record 21 en pointillé)', () => {
  const s = S.serieDEcriture(motsMaquette(), AUJ, { joursDeRepos: [] });
  assert.deepEqual(S.badgesDeSerie(s), [
    { genre: 'palier', valeur: 7, obtenu: true },
    { genre: 'palier', valeur: 14, obtenu: false },
    { genre: 'record', valeur: 21, obtenu: false },
  ]);
});
await dit('intensité des ronds : mots / 260 plafonné ; 5 paliers de teinte de 32 % à 82 %', () => {
  assert.equal(S.intensiteDeMots(130), 0.5);
  assert.equal(S.intensiteDeMots(900), 1);
  assert.equal(S.intensiteDeMots(0), 0);
  assert.deepEqual([0, 1, 52, 53, 130, 200, 260, 900].map(S.palierDeMots), [0, 1, 1, 2, 3, 4, 5, 5]);
  assert.deepEqual([0, 1, 2, 3, 4, 5].map(S.opaciteDuPalier), [0, 32, 45, 57, 70, 82].map((x) => x));
});
await dit('les trois sources s’additionnent jour par jour ; un jour sans mot n’est pas écrit', () => {
  const m = S.motsParJour([{ jour: AUJ, mots: 40 }, { jour: '2026-10-29', mots: 0 }], [{ jour: AUJ, mots: 60 }], []);
  assert.equal(m.get(AUJ), 100);
  assert.equal(m.has('2026-10-29'), false);
});
await dit('H10 : les 7 disques de la semaine (L M M J V S D) : 5 cochés, samedi et dimanche à venir', () => {
  const d = S.semaineEnDisques(motsMaquette(), AUJ);
  assert.deepEqual(d.map((x: any) => x.jour), ['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01']);
  assert.deepEqual(d.map((x: any) => x.etat), ['coche', 'coche', 'coche', 'coche', 'coche', 'a-venir', 'a-venir']);
  const m = motsMaquette();
  m.delete(AUJ);
  assert.equal(S.semaineEnDisques(m, AUJ)[4].etat, 'en-cours');
});
await dit('phrases : « Belle série · prochain palier : 14 jours, dans 2 jours », reprise, première page, conseil du jour', () => {
  const s = S.serieDEcriture(motsMaquette(), AUJ, { joursDeRepos: [] });
  assert.equal(PH.phraseDeSerie(s, 'fr'), 'Belle série · prochain palier : 14 jours, dans 2 jours');
  assert.equal(PH.phraseDeSerie(s, 'en'), 'Nice streak · next milestone: 14 days, in 2 days');
  assert.equal(PH.phraseDeSerie({ ...s, etat: 'reprise' }, 'fr'), 'La série reprend aujourd’hui');
  assert.equal(PH.phraseDeSerie({ ...s, etat: 'aucune' }, 'fr'), 'Ta première page t’attend');
  assert.equal(PH.conseilDuJour(s, 'fr'), null);
  assert.equal(PH.conseilDuJour({ ...s, ecritAujourdhui: false }, 'fr'), 'Une ligne aujourd’hui suffit pour la garder.');
  assert.equal(PH.conseilDuJour({ ...s, ecritAujourdhui: false, etat: 'aucune' }, 'fr'), 'Une ligne aujourd’hui suffit pour commencer.');
});

/* ── Notes et pages ──────────────────────────────────────────────────────── */
console.log('\nÉcrire — notes et pages (H10, F20)\n');

const page = (id: string, plus: Record<string, unknown> = {}) => ({
  id, title: id, parentId: null, espace: 'Équipe', clientId: null, blocs: [], auteurEmail: 'moi@x.test', contributeurs: [], modifieAt: '2026-10-30T08:00:00Z',
  modifieParEmail: 'moi@x.test', favorisDe: [], ...plus,
});

await dit('pages récentes : 5 au plus, la plus récente au-dessus, hors corbeille ; les miennes ; les partagées', () => {
  const pages = [
    ...[1, 2, 3, 4, 5, 6].map((i) => page(`p${i}`, { modifieAt: `2026-10-2${i}T08:00:00Z` })),
    page('mort', { modifieAt: '2026-10-30T09:00:00Z', supprimeeLe: '2026-10-30' }),
    page('autre', { auteurEmail: 'ami@x.test', modifieParEmail: 'ami@x.test', contributeurs: ['ami@x.test'], modifieAt: '2026-10-28T12:00:00Z' }),
  ];
  const tout = P.pagesRecentes(pages, 'moi@x.test');
  assert.equal(tout.length, 5);
  assert.deepEqual(tout.map((p: any) => p.id), ['autre', 'p6', 'p5', 'p4', 'p3']);
  assert.ok(!tout.some((p: any) => p.id === 'mort'));
  assert.equal(P.pagesRecentes(pages, 'moi@x.test', 'miennes').some((p: any) => p.id === 'autre'), false);
  assert.deepEqual(P.pagesRecentes(pages, 'moi@x.test', 'partagees').map((p: any) => p.id), ['autre']);
  assert.deepEqual(P.pagesRecentes(pages, 'moi@x.test', 'toutes', { seulementPartagees: true }).map((p: any) => p.id), ['autre'], 'un invité ne voit que le partagé');
  const ouverte = pages.map((p) => (p.id === 'p1' ? { ...p, ouverteAt: '2026-10-30T09:30:00Z' } : p));
  assert.equal(P.pagesRecentes(ouverte, 'moi@x.test')[0].id, 'p1', 'ouvrir une page la remonte');
});
await dit('présence : un collègue n’a un curseur que s’il a tapé il y a moins de 10 secondes ; jamais moi', () => {
  const now = '2026-10-30T10:00:10Z';
  const pres = [
    { email: 'a@x.test', tapeA: '2026-10-30T10:00:05Z' },
    { email: 'b@x.test', tapeA: '2026-10-30T09:59:59Z' },
    { email: 'moi@x.test', tapeA: '2026-10-30T10:00:09Z' },
    { email: 'c@x.test', tapeA: '2026-10-30T10:00:00Z' },
  ];
  assert.deepEqual(P.coAuteursPresents(pres, 'moi@x.test', now), ['a@x.test', 'c@x.test']);
  assert.deepEqual(P.coAuteursPresents([], 'moi@x.test', now), []);
});
await dit('arborescence : pages à tous niveaux d’un dossier ; favoris par personne ; clients, équipe, modèles', () => {
  const pages = [
    page('dossier', { espace: 'Clients', clientId: 7 }),
    page('f1', { parentId: 'dossier', espace: 'Clients', clientId: 7, favorisDe: ['moi@x.test'] }),
    page('f2', { parentId: 'f1', espace: 'Clients', clientId: 7 }),
    page('f3', { parentId: 'f2', espace: 'Clients', clientId: 7, supprimeeLe: '2026-10-01' }),
    page('eq', { espace: 'Équipe' }),
    page('mo', { espace: 'Modèles' }),
  ];
  assert.deepEqual(P.descendants(pages, 'dossier').map((p: any) => p.id).sort(), ['f1', 'f2']);
  const c = P.compteursArborescence(pages, 'moi@x.test');
  assert.deepEqual(c.favoris.map((p: any) => p.id), ['f1']);
  assert.equal(c.parClient.get('7'), 3);
  assert.equal(c.equipe, 1);
  assert.equal(c.modeles, 1);
  assert.equal(P.compteursArborescence(pages, 'autre@x.test').favoris.length, 0);
});
await dit('« 2 sur 3 » par section, « sans date » en ambre, section complète en vert', () => {
  const blocs = [
    { type: 'titre', texte: 'À préparer' },
    { type: 'tache', texte: 'a', fait: true, echeance: '2026-11-02' },
    { type: 'tache', texte: 'b', fait: true },
    { type: 'tache', texte: 'c', fait: false },
    { type: 'texte', texte: 'x' },
    { type: 'titre', texte: 'Fini' },
    { type: 'tache', texte: 'd', fait: true },
    { type: 'titre', texte: 'Sans tâche' },
  ];
  const s = P.sectionsDeTaches(blocs);
  assert.equal(s.length, 2, 'une section sans tâche est omise');
  assert.deepEqual(s[0], { titre: 'À préparer', faites: 2, total: 3, pourcent: 67, complete: false, sansDate: 1 });
  assert.equal(s[1].complete, true);
  assert.equal(P.sectionsDeTaches([{ type: 'tache', texte: 'seule', fait: false, echeance: '2026-11-01' }])[0].sansDate, 0);
});
await dit('plan : les titres dans l’ordre ; liens retour : extrait de 60 caractères, 3 visibles puis « Voir tout »', () => {
  assert.deepEqual(P.planDePage([{ type: 'titre', texte: ' Objectifs ' }, { type: 'texte', texte: 'x' }, { type: 'titre', texte: 'Décisions' }, { type: 'titre', texte: '  ' }]), { titres: ['Objectifs', 'Décisions'], nombre: 2 });
  const longue = `${'Mot '.repeat(30)}voir la page cible pour la suite. Autre phrase.`;
  const e = P.extraitDeLien(longue);
  assert.ok(e.startsWith('…') && e.length <= 61, `extrait : ${e.length}`);
  assert.equal(P.extraitDeLien('Voir la cible. Puis le reste.'), 'Voir la cible.');
  const cites = [1, 2, 3, 4].map((i) => page(`c${i}`, { blocs: [{ type: 'texte', texte: `Lien ${i}`, liens: ['cible'] }], modifieAt: `2026-10-2${i}T08:00:00Z` }));
  const r = P.liensRetour('cible', [page('cible', { blocs: [{ type: 'texte', texte: 'soi', liens: ['cible'] }] }), ...cites, page('ailleurs')]);
  assert.equal(r.total, 4);
  assert.deepEqual(r.visibles.map((l: any) => l.pageId), ['c4', 'c3', 'c2'], 'la plus récente d’abord, 3 visibles');
  assert.equal(P.liensRetour('rien', cites).total, 0);
});
await dit('menu « / » : « ta » trouve Tâche et Tableau, sans accent ; Ajmani suit toujours', () => {
  const f = P.filtrerMenu('/ta');
  assert.deepEqual(f.blocs, ['tache', 'tableau']);
  assert.equal(f.ajmani, true);
  assert.equal(P.filtrerMenu('/').blocs.length, P.BLOCS_DU_MENU.length);
  assert.deepEqual(P.filtrerMenu('/TÂ').blocs, ['tache', 'tableau']);
  assert.deepEqual(P.filtrerMenu('/zzz').blocs, []);
  assert.equal(P.libelleDeBloc('tache', 'fr'), 'Tâche');
});
await dit('enregistrement : 1 s après la dernière frappe ; « Enregistrement… », « Enregistré il y a 3 s », erreur, hors ligne', () => {
  const t0 = '2026-10-30T10:00:00Z';
  assert.equal(P.doitEnregistrer(t0, null, '2026-10-30T10:00:00.900Z'), false);
  assert.equal(P.doitEnregistrer(t0, null, '2026-10-30T10:00:01Z'), true);
  assert.equal(P.doitEnregistrer(t0, '2026-10-30T10:00:01Z', '2026-10-30T10:00:05Z'), false, 'déjà enregistré');
  assert.deepEqual(P.etatEnregistrement({ derniereFrappe: t0, dernierEnregistrement: null }, '2026-10-30T10:00:00.500Z'), { genre: 'enregistrement' });
  assert.deepEqual(P.etatEnregistrement({ derniereFrappe: t0, dernierEnregistrement: '2026-10-30T10:00:01Z' }, '2026-10-30T10:00:04Z'), { genre: 'enregistree', avant: 3 });
  assert.equal(P.etatEnregistrement({ derniereFrappe: t0, dernierEnregistrement: '2026-10-30T10:00:01Z' }, '2026-10-30T10:05:01Z').genre, 'modifiee');
  assert.equal(P.etatEnregistrement({ derniereFrappe: t0, dernierEnregistrement: null, enErreur: true }, t0).genre, 'non-enregistree');
  assert.equal(P.etatEnregistrement({ derniereFrappe: t0, dernierEnregistrement: null, horsLigne: true }, t0).genre, 'hors-ligne');
  assert.equal(PH.phraseDEnregistrement({ genre: 'enregistree', avant: 3 }, 'fr'), 'Enregistré il y a 3 s');
  assert.equal(PH.phraseDEnregistrement({ genre: 'non-enregistree' }, 'fr'), 'Non enregistré, réessai en cours');
});
await dit('une clé collée dans une note est repérée ; un texte ordinaire ou une URL, non', () => {
  assert.equal(P.ressembleAUneCle('voici sk_live_abcdefghijklmnopqrstuv'), true);
  assert.equal(P.ressembleAUneCle('-----BEGIN PRIVATE KEY-----\nxxxx'), true);
  assert.equal(P.ressembleAUneCle('code a9F3kLm2Qx7Rt5Vw8Yz1Bc4Dd6Ee0GhJ'), true);
  assert.equal(P.ressembleAUneCle('Réunion du 28 oct. : préparer la démonstration.'), false);
  assert.equal(P.ressembleAUneCle('https://exemple.test/une/adresse/assez/longue/et/propre-1234567890'), false);
});
await dit('H41 : la note épinglée d’un client — la plus récemment épinglée, une seule, 80 caractères', () => {
  const notes = [
    { id: 'n1', clientId: 5, texte: 'Préfère être appelé le matin.', epinglee: true, epingleeAt: '2026-10-01T08:00:00Z', modifieAt: '2026-10-01T08:00:00Z' },
    { id: 'n2', clientId: 5, texte: `Plus récente ${'très '.repeat(30)}longue.`, epinglee: true, epingleeAt: '2026-10-20T08:00:00Z', modifieAt: '2026-10-20T08:00:00Z' },
    { id: 'n3', clientId: 5, texte: 'Pas épinglée', epinglee: false, modifieAt: '2026-10-29T08:00:00Z' },
    { id: 'n4', clientId: 6, texte: 'Autre client', epinglee: true, modifieAt: '2026-10-29T08:00:00Z' },
  ];
  const n = P.noteEpingleeDuClient(notes, 5);
  assert.equal(n.id, 'n2');
  assert.ok(n.texte.length <= 80 && n.texte.endsWith('…'));
  assert.equal(P.noteEpingleeDuClient(notes, '5')?.id, 'n2', 'identifiant texte ou nombre');
  assert.equal(P.noteEpingleeDuClient(notes, 99), null);
  assert.equal(P.noteEpingleeDuClient([{ ...notes[0], epinglee: false }], 5), null);
});

/* ── Relecture (F20) ─────────────────────────────────────────────────────── */
console.log('\nÉcrire — « Attend une relecture » (F20)\n');

const docs = [
  { id: 'd1', titre: 'A', etat: 'Relecture demandée', relecteurEmail: 'moi@x.test', demandeurEmail: 'r@x.test', demandeAt: '2026-10-29T08:00:00Z' },
  { id: 'd2', titre: 'B', etat: 'Brouillon partagé', relecteurEmail: 'm@x.test', demandeurEmail: 'm@x.test', demandeAt: '2026-10-30T08:38:00Z' },
  { id: 'd3', titre: 'C', etat: 'Relecture demandée', relecteurEmail: 'moi@x.test', demandeurEmail: 'm@x.test', demandeAt: '2026-10-30T07:00:00Z' },
  { id: 'd4', titre: 'D', etat: 'En signature', relecteurEmail: null, demandeurEmail: 'moi@x.test', demandeAt: '2026-10-28T08:00:00Z' },
  { id: 'd5', titre: 'E', etat: 'Terminé', relecteurEmail: null, demandeurEmail: 'moi@x.test', demandeAt: '2026-10-01T08:00:00Z' },
];
await dit('la file : ceux où je relis d’abord, puis par ancienneté ; « Terminé » n’y est pas ; 4 documents', () => {
  const f = R.fileDeRelecture(docs, 'moi@x.test');
  assert.deepEqual(f.map((l: any) => l.id), ['d1', 'd3', 'd4', 'd2']);
  assert.deepEqual(f.map((l: any) => l.pourMoi), [true, true, false, false]);
  assert.equal(R.nbEnAttente(docs), 4);
});
await dit('StageBar : brouillon, relecture, signature = 3 segments (fait, en cours, à venir)', () => {
  const f = Object.fromEntries(R.fileDeRelecture(docs, 'moi@x.test').map((l: any) => [l.id, l]));
  assert.deepEqual(f.d2.segments, ['en-cours', 'a-venir', 'a-venir']);
  assert.deepEqual(f.d1.segments, ['fait', 'en-cours', 'a-venir']);
  assert.deepEqual(f.d4.segments, ['fait', 'fait', 'en-cours']);
  assert.equal(f.d4.etape, 'signature');
});
await dit('Signatures inactif : la ligne « signature » disparaît ; rien à relire : file vide', () => {
  assert.deepEqual(R.fileDeRelecture(docs, 'moi@x.test', { signaturesActives: false }).map((l: any) => l.id), ['d1', 'd3', 'd2']);
  assert.deepEqual(R.fileDeRelecture([], 'moi@x.test'), []);
  assert.equal(PH.libelleDeLigne(null, 'fr'), null);
});

/* ── Documents ───────────────────────────────────────────────────────────── */
console.log('\nÉcrire — documents (H11)\n');

const fichier = (id: string, type: string, modifieAt: string, plus: Record<string, unknown> = {}) => ({ id, nom: id, typeMetier: type, tailleOctets: 1000, modifieAt, archive: false, ...plus });
await dit('183 = 24 + 112 + 38 + 9 ; archives et corbeille hors compte ; au plus 8 intercalaires, le reste sous « Plus »', () => {
  const fs_ = [
    ...Array.from({ length: 24 }, (_, i) => fichier(`c${i}`, 'Contrat', '2026-01-01T00:00:00Z')),
    ...Array.from({ length: 112 }, (_, i) => fichier(`f${i}`, 'Facture', '2026-01-01T00:00:00Z')),
    ...Array.from({ length: 38 }, (_, i) => fichier(`d${i}`, 'Devis', '2026-01-01T00:00:00Z')),
    ...Array.from({ length: 9 }, (_, i) => fichier(`r${i}`, 'Rapport', '2026-01-01T00:00:00Z')),
    fichier('arch', 'Contrat', '2026-01-01T00:00:00Z', { archive: true }),
    fichier('mort', 'Contrat', '2026-01-01T00:00:00Z', { supprimeeLe: '2026-10-01' }),
  ];
  const i = D.intercalaires(fs_);
  assert.equal(i.total, 183);
  assert.deepEqual(i.visibles.map((x: any) => [x.type, x.compteur]), [['Facture', 112], ['Devis', 38], ['Contrat', 24], ['Rapport', 9]]);
  const neuf = D.intercalaires(Array.from({ length: 10 }, (_, k) => fichier(`x${k}`, `Type${k}`, '2026-01-01T00:00:00Z')));
  assert.equal(neuf.visibles.length, 8);
  assert.equal(neuf.plus.length, 2);
  assert.equal(D.intercalaires([], ['Contrat', 'Facture']).visibles.length, 2, 'un intercalaire du métier reste, à 0');
});
await dit('24 contrats = 5 (2026) + 19 (2025) ; 8 lignes visibles, « 16 autres » ; la plus récente d’abord', () => {
  const fs_ = [
    ...Array.from({ length: 5 }, (_, i) => fichier(`n${i}`, 'Contrat', `2026-0${i + 1}-10T10:00:00Z`)),
    ...Array.from({ length: 19 }, (_, i) => fichier(`o${i}`, 'Contrat', `2025-${String((i % 12) + 1).padStart(2, '0')}-10T10:00:00Z`)),
  ];
  const l = D.listeParAnnee(fs_, 'Contrat');
  assert.deepEqual(l.groupes.map((g: any) => [g.annee, g.compteur, g.fichiers.length]), [[2026, 5, 5], [2025, 19, 3]]);
  assert.equal(l.visibles, 8);
  assert.equal(l.autres, 16);
  assert.equal(l.groupes[0].fichiers[0].id, 'n4');
  assert.deepEqual(D.listeParAnnee([], 'Contrat'), { groupes: [], visibles: 0, autres: 0 });
});
await dit('états de ligne : Signé, À signer, Envoyé, À renouveler (60 jours), rien', () => {
  assert.equal(D.etatDeLigne({ etat: 'Signée' }, null, AUJ), 'signe');
  assert.equal(D.etatDeLigne({ etat: 'Ouverte' }, null, AUJ), 'a-signer');
  assert.equal(D.etatDeLigne({ etat: 'Partiellement signée' }, null, AUJ), 'a-signer');
  assert.equal(D.etatDeLigne({ etat: 'Envoyée' }, null, AUJ), 'envoye');
  assert.equal(D.etatDeLigne(null, '2026-12-15', AUJ), 'a-renouveler');
  assert.equal(D.etatDeLigne(null, '2027-02-01', AUJ), null);
  assert.equal(D.etatDeLigne({ etat: 'Refusée' }, null, AUJ), null);
  assert.equal(D.aRenouvelerBientot('2026-12-29', AUJ), true, '60 jours pile');
  assert.equal(D.aRenouvelerBientot('2026-12-30', AUJ), false);
  assert.equal(D.aRenouvelerBientot('2026-10-01', AUJ), false, 'déjà passée');
  assert.equal(PH.libelleDeLigne('a-renouveler', 'fr'), 'À renouveler');
});
await dit('faits relevés : 31 oct. 2027 − 2 mois = 31 août 2027 ; rappel 30 jours avant ; prix annuel ; à vérifier / vérifié', () => {
  assert.equal(D.datePreavis('2027-10-31', 2), '2027-08-31');
  assert.equal(D.rappelDePreavis('2027-08-31'), '2027-08-01');
  assert.equal(D.prixAnnuelCents(35_000), 420_000);
  assert.equal(D.etatDuFait({ cle: 'prix', valeur: 'x', repere: 2 }), 'a-verifier');
  assert.equal(D.etatDuFait({ cle: 'prix', valeur: 'x', repere: 2, verifiePar: 'm@x.test' }), 'verifie');
  assert.equal(D.etatDuFait({ cle: 'prix', valeur: 'x', repere: null }), 'sans-repere');
  const m = D.faitsAMontrer([{ cle: 'duree', valeur: 'a', repere: 3 }, { cle: 'prix', valeur: 'b', repere: null }, { cle: 'parties', valeur: 'c', repere: 1 }]);
  assert.deepEqual(m.map((f: any) => f.cle), ['parties', 'duree'], 'jamais une valeur absente de la page');
});
await dit('versions : 90 jours, sauf l’actuelle et les signées ; restaurer crée v4 sans rien écraser et prévient', () => {
  const now = '2026-10-30T10:00:00Z';
  const v = [
    { numero: 1, creeAt: '2026-06-01T00:00:00Z', signee: false, actuelle: false },
    { numero: 2, creeAt: '2026-06-02T00:00:00Z', signee: true, actuelle: false },
    { numero: 3, creeAt: '2026-10-20T00:00:00Z', signee: false, actuelle: true },
  ];
  assert.deepEqual(D.versionsAPurger(v, now), [1]);
  const r = D.restaurer(v, 2, now);
  assert.equal(r.nouvelle.numero, 4);
  assert.equal(r.nouvelle.signee, false);
  assert.equal(r.avertirNonSignee, true, 'la nouvelle version ne sera pas signée');
  assert.equal(r.versions.length, 4);
  assert.equal(r.versions.filter((x: any) => x.actuelle).length, 1);
  assert.equal(D.restaurer(v, 1, now).avertirNonSignee, false);
  assert.throws(() => D.restaurer(v, 9, now));
});
await dit('espace : neutre sous 80 %, ambre de 80 à 95 %, rouge au-delà, « plus de place » à 100 %', () => {
  const g = (u: number) => D.jaugeEspace(u, 100);
  assert.equal(g(79).ton, 'neutre');
  assert.equal(g(80).ton, 'ambre');
  assert.equal(g(95).ton, 'ambre');
  assert.equal(g(96).ton, 'rouge');
  assert.equal(g(100).plein, true);
  assert.equal(g(99).plein, false);
  assert.equal(D.jaugeEspace(10, 0).pourcent, 0);
});

/* ── Signatures ──────────────────────────────────────────────────────────── */
console.log('\nÉcrire — signatures (H12)\n');

const sig = (id: string, ordre: number, statut: string, plus: Record<string, unknown> = {}) => ({ id, ordre, role: 'signataire', statut, ...plus });
const demande = (signataires: any[], plus: Record<string, unknown> = {}) => ({ id: 'dm', signataires, envoyeAt: '2026-10-26T10:00:00Z', ...plus });

await dit('couleurs de signataire : bleu, violet de la famille, gris clair — des personnes, pas des états', () => {
  assert.deepEqual([1, 2, 3, 4].map(G.couleurDeSignataire), ['info', 'famille', 'gris', 'gris']);
});
await dit('états d’une demande : à envoyer, envoyée, vue, signée, refusée, annulée, expirée', () => {
  assert.equal(G.etatDeDemande(demande([sig('a', 1, 'En attente')], { envoyeAt: null })), 'À envoyer');
  assert.equal(G.etatDeDemande(demande([sig('a', 1, 'En attente')])), 'Envoyée');
  assert.equal(G.etatDeDemande(demande([sig('a', 1, 'Ouvert')])), 'Vue');
  assert.equal(G.etatDeDemande(demande([sig('a', 1, 'Signé'), sig('b', 2, 'En attente')])), 'Vue');
  assert.equal(G.etatDeDemande(demande([sig('a', 1, 'Signé'), sig('b', 2, 'Signé')])), 'Signée');
  assert.equal(G.etatDeDemande(demande([sig('a', 1, 'Refusé')])), 'Refusée');
  assert.equal(G.etatDeDemande(demande([sig('a', 1, 'En attente')], { annulee: true })), 'Annulée');
  assert.equal(G.estExpiree(demande([sig('a', 1, 'Ouvert')], { echeanceLe: '2026-10-29' }), AUJ), true);
  assert.equal(G.estExpiree(demande([sig('a', 1, 'Signé')], { echeanceLe: '2026-10-29' }), AUJ), false, 'une demande signée n’expire pas');
  assert.equal(PH.libelleDeDemande('Signée', 'fr'), 'Signée');
});
await dit('circuit ordonné : le suivant ne reçoit qu’après le précédent ; la copie reçoit à la fin ; « 1 sur 2 signé »', () => {
  const d = demande([sig('a', 1, 'Signé'), sig('b', 2, 'En attente'), { id: 'c', ordre: 3, role: 'copie', statut: 'En attente' }]);
  assert.equal(G.signataireEnCours(d)?.id, 'b');
  assert.equal(G.peutRecevoir(d, 'a'), true);
  assert.equal(G.peutRecevoir(d, 'b'), true);
  assert.equal(G.peutRecevoir(demande([sig('a', 1, 'En attente'), sig('b', 2, 'En attente')]), 'b'), false);
  assert.equal(G.copiePeutRecevoir(d), false);
  assert.equal(G.copiePeutRecevoir(demande([sig('a', 1, 'Signé')])), true);
  assert.deepEqual(G.avancementDuCircuit(d), { signes: 1, total: 2, rapport: 0.5 });
  assert.equal(I.dire('fr', 'circuit.signe', { signes: 1, total: 2 }), '1 sur 2 signé');
});
await dit('barre de 3 segments du ticket : étapes du signataire en cours, vert partout si signée', () => {
  assert.deepEqual(G.segmentsDeTicket(demande([sig('a', 1, 'En attente', { envoyeAt: '2026-10-26T10:00:00Z' })])), ['fait', 'en-cours', 'a-venir']);
  assert.deepEqual(G.segmentsDeTicket(demande([sig('a', 1, 'Ouvert')])), ['fait', 'fait', 'en-cours']);
  assert.deepEqual(G.segmentsDeTicket(demande([sig('a', 1, 'Signé')])), ['fait', 'fait', 'fait']);
  assert.deepEqual(G.segmentsDeTicket(demande([sig('a', 1, 'En attente')], { envoyeAt: null })), ['a-venir', 'a-venir', 'a-venir']);
  assert.equal(G.etapeDeSignataire(sig('a', 1, 'Refusé')), 'refuse');
});
await dit('champs : « 5 posés, 3 à remplir » ; un signataire a terminé quand ses champs obligatoires sont pleins', () => {
  const champs = [
    { type: 'signature', page: 1, signataireId: 'a', obligatoire: true, rempli: false },
    { type: 'date', page: 1, signataireId: 'a', obligatoire: true, rempli: false },
    { type: 'paraphe', page: 1, signataireId: 'a', obligatoire: true, rempli: false },
    { type: 'signature', page: 1, signataireId: 'b', obligatoire: true, rempli: true },
    { type: 'nom', page: 1, signataireId: 'b', obligatoire: false, rempli: false },
    { type: 'signature', page: 2, signataireId: 'a', obligatoire: true, rempli: false },
  ];
  assert.deepEqual(G.champsDeLaPage(champs, 1, 'a'), { poses: 5, aRemplir: 3 });
  assert.equal(G.aTermine(champs, 'a'), false);
  assert.equal(G.aTermine(champs, 'b'), true, 'le champ facultatif n’empêche pas de terminer');
});
await dit('3 demandes attendent : envoyées, ni signées, ni refusées, ni expirées, ni annulées', () => {
  const l = [
    demande([sig('a', 1, 'En attente')]),
    demande([sig('a', 1, 'Ouvert')]),
    demande([sig('a', 1, 'Signé'), sig('b', 2, 'En attente')]),
    demande([sig('a', 1, 'Signé')]),
    demande([sig('a', 1, 'Refusé')]),
    demande([sig('a', 1, 'Ouvert')], { echeanceLe: '2026-10-01' }),
    demande([sig('a', 1, 'En attente')], { envoyeAt: null }),
    demande([sig('a', 1, 'En attente')], { annulee: true }),
  ];
  assert.equal(G.enAttenteDeSignature(l, AUJ), 3);
  assert.equal(PH.libelleDeDemande('Annulée', 'en'), 'Cancelled');
});
await dit('délai moyen : 1,8 jour sur les devis signés dans la fenêtre ; « belle régularité » si l’écart-type est sous 1 jour', () => {
  const signee = (envoi: string, signe: string, devis = true) => demande([sig('a', 1, 'Signé', { signeAt: signe })], { envoyeAt: envoi, devis });
  const l = [
    signee('2026-10-05T08:00:00Z', '2026-10-06T12:48:00Z'), // 1,2 jour
    signee('2026-10-10T08:00:00Z', '2026-10-12T17:36:00Z'), // 2,4 jours
    signee('2026-10-12T08:00:00Z', '2026-10-20T08:00:00Z', false), // pas un devis
    signee('2026-08-01T08:00:00Z', '2026-08-02T08:00:00Z'), // hors fenêtre
  ];
  const r = G.delaiMoyenDeSignature(l, '2026-10-01T00:00:00Z', '2026-10-31T23:59:59Z');
  assert.deepEqual(r, { jours: 1.8, nombre: 2, regulier: true });
  const irregulier = G.delaiMoyenDeSignature([signee('2026-10-05T08:00:00Z', '2026-10-06T08:00:00Z'), signee('2026-10-10T08:00:00Z', '2026-10-17T08:00:00Z')], '2026-10-01T00:00:00Z', '2026-10-31T23:59:59Z');
  assert.equal(irregulier.regulier, false);
  assert.deepEqual(G.delaiMoyenDeSignature([], '2026-10-01T00:00:00Z', '2026-10-31T23:59:59Z'), { jours: null, nombre: 0, regulier: false });
  assert.equal(PH.sousTitreDeSignatures(3, r, 'fr'), '3 demandes attendent une signature · 1,8 jour en moyenne, belle régularité');
  assert.equal(PH.sousTitreDeSignatures(3, irregulier, 'fr').endsWith('régularité'), false);
  assert.equal(PH.sousTitreDeSignatures(1, { jours: null, nombre: 0, regulier: false }, 'fr'), '1 demande attend une signature');
});
await dit('relances : 48 h après l’envoi, entre 9 h et 18 h en jours ouvrés ; puis tous les 3 jours ; 3 au plus', () => {
  const d = (envoi: string) => demande([sig('a', 1, 'Ouvert', { envoyeAt: envoi })], { envoyeAt: envoi });
  // Lundi 26 oct. 10:00 → mercredi 28 oct. 10:00.
  const lundi = new Date(paris('2026-10-26', '10:00')).toISOString();
  const p1 = G.planDeRelance(d(lundi), [], AUJ);
  assert.equal(p1.prochaine, paris('2026-10-28', '10:00'));
  assert.equal(p1.rang, 1);
  // Vendredi 23 oct. 17:00 + 48 h = dimanche 17:00 → lundi 9:00.
  const vendredi = new Date(paris('2026-10-23', '17:00')).toISOString();
  assert.equal(G.planDeRelance(d(vendredi), [], AUJ).prochaine, paris('2026-10-26', '09:00'));
  // Mardi 27 oct. 18:30 + 48 h = jeudi 18:30 : après la plage → vendredi 9:00.
  const mardi = new Date(paris('2026-10-27', '18:30')).toISOString();
  assert.equal(G.planDeRelance(d(mardi), [], AUJ).prochaine, paris('2026-10-30', '09:00'));
  // Deuxième relance : 3 jours après la première.
  const premiere = new Date(paris('2026-10-28', '10:00')).toISOString();
  const p2 = G.planDeRelance(d(lundi), [premiere], AUJ);
  assert.equal(p2.prochaine, paris('2026-10-31', '10:00') > 0 ? G.prochainCreneauDeRelance(paris('2026-10-31', '10:00')) : 0);
  assert.equal(p2.rang, 2);
  assert.equal(G.planDeRelance(d(lundi), [premiere, premiere, premiere], AUJ).prochaine, null);
  assert.equal(G.planDeRelance(d(lundi), [premiere, premiere, premiere], AUJ).raison, 'maximum');
  assert.equal(I.dire('fr', 'relance.rang', { rang: 1, max: G.RELANCE_MAX }), '1 sur 3');
});
await dit('relances : arrêt à la signature, au refus, à l’annulation, à l’expiration ; rien tant que non envoyée', () => {
  const base = (s: any[], plus = {}) => demande(s, plus);
  assert.equal(G.planDeRelance(base([sig('a', 1, 'Signé')]), [], AUJ).raison, 'signee');
  assert.equal(G.planDeRelance(base([sig('a', 1, 'Refusé')]), [], AUJ).raison, 'refusee');
  assert.equal(G.planDeRelance(base([sig('a', 1, 'Ouvert')], { annulee: true }), [], AUJ).raison, 'annulee');
  assert.equal(G.planDeRelance(base([sig('a', 1, 'Ouvert')], { echeanceLe: '2026-10-01' }), [], AUJ).raison, 'expiree');
  assert.equal(G.planDeRelance(base([sig('a', 1, 'En attente')], { envoyeAt: null }), [], AUJ).raison, 'non-envoyee');
  for (const raison of ['signee', 'refusee', 'maximum']) assert.equal(G.planDeRelance(base([sig('a', 1, raison === 'signee' ? 'Signé' : 'Refusé')]), [], AUJ).prochaine, null);
});
await dit('relance manuelle : une par signataire toutes les 24 h', () => {
  assert.equal(G.relanceManuellePossible(null, '2026-10-30T10:00:00Z'), true);
  assert.equal(G.relanceManuellePossible('2026-10-29T10:00:01Z', '2026-10-30T10:00:00Z'), false);
  assert.equal(G.relanceManuellePossible('2026-10-29T10:00:00Z', '2026-10-30T10:00:00Z'), true);
});

/* ── Modèles ─────────────────────────────────────────────────────────────── */
console.log('\nÉcrire — modèles (ME03)\n');

await dit('usage du mois ; barre = usages / modèle le plus utilisé (92 %) ; bibliothèque 24 sur 30 (80 %)', () => {
  assert.equal(MO.usagesDuMois(['2026-09-30T10:00:00Z', '2026-10-01T00:00:00Z', '2026-10-20T10:00:00Z'], '2026-10-01T00:00:00Z'), 2);
  assert.equal(MO.tauxDUsage(31, 34), 91);
  assert.equal(MO.tauxDUsage(34, 34), 100);
  assert.equal(MO.tauxDUsage(5, 0), 0);
  const reco = Array.from({ length: 30 }, (_, i) => `m${i}`);
  assert.deepEqual(MO.bibliotheque(reco.slice(0, 24).concat(['maison']), reco), { presents: 24, sur: 30, pourcent: 80 });
  assert.equal(I.dire('fr', 'modeles.bibliotheque', { n: 24, sur: 30 }), 'Ta bibliothèque 24 sur 30');
});
await dit('variables : 8 sources ; « remplies toutes seules » = hors « à saisir » ; extraction {nom} ; remplir garde le champ vide visible', () => {
  assert.equal(MO.SOURCES_DE_VARIABLE.length, 8);
  const v = [{ nom: 'client', source: 'fiche client' }, { nom: 'numéro', source: 'suite des devis' }, { nom: 'objet', source: 'à saisir' }];
  assert.deepEqual(MO.remplies(v), { toutes: 3, seules: 2, aSaisir: 1 });
  const contenu = 'Devis {numéro} pour {client} : {objet}. Merci {client} ! {';
  assert.deepEqual(MO.extraireVariables(contenu), ['numéro', 'client', 'objet']);
  assert.equal(MO.remplir(contenu, { numéro: 'D-1', client: 'X' }), 'Devis D-1 pour X : {objet}. Merci X ! {');
});
await dit('numéro proposé : D-2026-117 → D-2026-118 ; la largeur est gardée ; sans chiffre, refusé', () => {
  assert.equal(MO.prochainNumero('D-2026-117'), 'D-2026-118');
  assert.equal(MO.prochainNumero('F-2026-0099'), 'F-2026-0100');
  assert.equal(MO.prochainNumero('9'), '10');
  assert.throws(() => MO.prochainNumero('sans'));
});
await dit('case proposée : 5 messages proches (plus de 70 % de phrases communes) en 30 jours, sans modèle existant', () => {
  const corps = 'Merci pour votre confiance. Nous avons terminé l’intervention. Dites-nous si tout est en ordre.';
  const msgs = [1, 2, 3, 4, 5].map((i) => ({ id: `m${i}`, texte: `${corps} Détail ${i}.`, at: `2026-10-${10 + i}T10:00:00Z` }));
  const autre = [{ id: 'z', texte: 'Un tout autre message.', at: '2026-10-20T10:00:00Z' }];
  const r = MO.caseProposee([...msgs, ...autre], [], '2026-10-30T10:00:00Z');
  assert.deepEqual(r?.messageIds, ['m1', 'm2', 'm3', 'm4', 'm5']);
  assert.equal(MO.caseProposee(msgs.slice(0, 4), [], '2026-10-30T10:00:00Z'), null, 'quatre ne suffisent pas');
  assert.equal(MO.caseProposee(msgs, [corps], '2026-10-30T10:00:00Z'), null, 'un modèle existe déjà');
  assert.equal(MO.caseProposee(msgs, [], '2026-12-30T10:00:00Z'), null, 'hors des 30 jours');
  assert.ok(MO.similarite(corps, corps) === 1 && MO.similarite(corps, 'rien de commun ici.') === 0);
});
await dit('galerie : les plus utilisés ce mois d’abord, la case proposée en dernier', () => {
  const t = MO.trierGalerie([{ id: 'p', nom: 'Proposée', usagesMois: 99, proposee: true }, { id: 'a', nom: 'A', usagesMois: 3 }, { id: 'b', nom: 'B', usagesMois: 31 }]);
  assert.deepEqual(t.map((x: any) => x.id), ['b', 'a', 'p']);
});

/* ── Journal ─────────────────────────────────────────────────────────────── */
console.log('\nÉcrire — journal (ME01)\n');

const jp = (jour: string, plus: Record<string, unknown> = {}) => ({ jour, auteurEmail: 'moi@x.test', ...plus });
await dit('jour écrit dès qu’un champ est rempli ; mots de tous les champs ; intensité = mots / 260', () => {
  assert.equal(J.estEcrite(jp(AUJ)), false);
  assert.equal(J.estEcrite(jp(AUJ, { humeur: 3 })), true);
  assert.equal(J.estEcrite(jp(AUJ, { energie: 4 })), true);
  assert.equal(J.estEcrite(jp(AUJ, { mercis: ['', ' '] })), false);
  assert.equal(J.estEcrite(jp(AUJ, { mercis: ['un'] })), true);
  const p = jp(AUJ, { mercis: ['deux mots', 'trois petits mots'], texte: 'quatre mots dans ce texte' });
  assert.equal(J.motsDeLaPage(p), 2 + 3 + 5);
  assert.equal(J.intensiteDeLaPage(p), 10 / 260);
  assert.deepEqual([1, 2, 3, 4, 5].map((h) => J.NOM_DES_HUMEURS[h].fr), ['Difficile', 'Moyen', 'Bien', 'Très bien', 'Excellent']);
});
await dit('privé : seules mes pages sont visibles, jamais celles d’un autre', () => {
  const pages = [jp(AUJ), jp('2026-10-29', { auteurEmail: 'autre@x.test' })];
  assert.equal(J.visiblePar(pages[1], 'moi@x.test'), false);
  assert.deepEqual(J.pagesDe(pages, 'moi@x.test').map((p: any) => p.jour), [AUJ]);
});
await dit('humeur du mois : une barre par jour (humeur × 20 %), « le plus souvent » = la plus fréquente', () => {
  const pages = [jp('2026-10-01', { humeur: 3 }), jp('2026-10-02', { humeur: 3 }), jp('2026-10-03', { humeur: 5 }), jp('2026-10-04', { humeur: 2 }), jp('2026-09-30', { humeur: 1 }), jp('2026-10-05')];
  const h = J.humeurDuMois(pages, '2026-10');
  assert.equal(h.barres.length, 4);
  assert.deepEqual(h.barres.map((b: any) => b.hauteurPourcent), [60, 60, 100, 40]);
  assert.equal(h.leplusSouvent, 3);
  assert.equal(J.humeurDuMois([], '2026-10').leplusSouvent, null);
  assert.equal(J.humeurDuMois([jp('2026-10-01', { humeur: 5 }), jp('2026-10-02', { humeur: 1 })], '2026-10').leplusSouvent, 1, 'à égalité, la plus récente');
});
await dit('« il y a un mois » : le même jour le mois précédent ; sinon la plus proche avant (7 jours au plus) ; sinon rien', () => {
  const mes = (jour: string) => jp(jour, { texte: 'quelque chose' });
  assert.equal(J.ilYAUnMois([mes('2026-09-30'), mes('2026-09-28')], 'moi@x.test', AUJ)?.jour, '2026-09-30');
  assert.equal(J.ilYAUnMois([mes('2026-09-28'), mes('2026-09-26')], 'moi@x.test', AUJ)?.jour, '2026-09-28');
  assert.equal(J.ilYAUnMois([mes('2026-09-23')], 'moi@x.test', AUJ)?.jour, '2026-09-23', 'à 7 jours : encore bon');
  assert.equal(J.ilYAUnMois([mes('2026-09-22')], 'moi@x.test', AUJ), null, 'à 8 jours : trop loin');
  assert.equal(J.ilYAUnMois([mes('2026-09-20')], 'moi@x.test', AUJ), null);
  assert.equal(J.ilYAUnMois([{ ...mes('2026-09-30'), auteurEmail: 'autre@x.test' }], 'moi@x.test', AUJ), null, 'jamais le journal d’un autre');
  assert.equal(J.ilYAUnMois([jp('2026-09-30')], 'moi@x.test', AUJ), null, 'une page vide ne compte pas');
});
await dit('bandeau du vendredi : 3 pages écrites dans la semaine et un « Bilan » au calendrier ; « Non merci » jusqu’au vendredi suivant', () => {
  const sem = ['2026-10-26', '2026-10-27', '2026-10-29'].map((j) => jp(j, { texte: 'x' }));
  assert.equal(J.proposerResume(sem, 'moi@x.test', AUJ, true), true);
  assert.equal(J.proposerResume(sem.slice(0, 2), 'moi@x.test', AUJ, true), false, 'deux pages ne suffisent pas');
  assert.equal(J.proposerResume(sem, 'moi@x.test', AUJ, false), false, 'pas de bilan au calendrier');
  assert.equal(J.proposerResume(sem, 'moi@x.test', '2026-10-29', true), false, 'jeudi');
  assert.equal(J.masquerResumeJusquau(AUJ), '2026-11-06');
  assert.equal(J.proposerResume(sem, 'moi@x.test', AUJ, true, '2026-11-06'), false);
  assert.equal(J.proposerResume(sem, 'moi@x.test', '2026-11-06', true, '2026-11-06'), false, 'faute de pages cette semaine-là');
});
await dit('⌘↵ passe à demain seulement si demain n’est pas dans le futur', () => {
  assert.equal(J.peutPasserADemain('2026-10-29', AUJ), true);
  assert.equal(J.peutPasserADemain(AUJ, AUJ), false);
});

/* ── Rédaction ───────────────────────────────────────────────────────────── */
console.log('\nÉcrire — rédaction et traduction (ME02)\n');

await dit('anneau : 78 mots sur 120 = 65 % ; objectifs 120, 250, 500 ; au-delà, « un peu long »', () => {
  assert.deepEqual(RE.anneauDeMots(78, 'court'), { mots: 78, objectif: 120, pourcent: 65, depasse: false });
  assert.equal(RE.anneauDeMots(130, 'court').depasse, true);
  assert.equal(RE.anneauDeMots(130, 'court').pourcent, 100);
  assert.deepEqual([RE.OBJECTIF_DE_MOTS.court, RE.OBJECTIF_DE_MOTS.moyen, RE.OBJECTIF_DE_MOTS.long], [120, 250, 500]);
  assert.equal(I.dire('fr', 'redaction.mots', { mots: 78, objectif: 120 }), '78 mots sur 120');
});
await dit('« lu en 25 secondes » : mots / 3,2 arrondi à 5 s ; jamais 0 pour un texte non vide', () => {
  assert.equal(RE.luEnSecondes(78), 25);
  assert.equal(RE.luEnSecondes(1), 5);
  assert.equal(RE.luEnSecondes(0), 0);
  assert.equal(RE.luEnSecondes(320), 100);
});
await dit('notes de marge : alignées sur leur passage ; un chevauchement descend sous la précédente (écart 12) et devient oblique', () => {
  const r = RE.positionnerNotes([
    { id: 'b', type: 'ajout', ligneY: 110, hauteur: 80 },
    { id: 'a', type: 'reformulation', ligneY: 100, hauteur: 60 },
    { id: 'c', type: 'verification', ligneY: 400, hauteur: 40 },
  ]);
  assert.deepEqual(r, [{ id: 'a', y: 100, oblique: false }, { id: 'b', y: 172, oblique: true }, { id: 'c', y: 400, oblique: false }]);
  assert.deepEqual(RE.positionnerNotes([]), []);
});
await dit('date vérifiée : comparée au planning et au calendrier des personnes ; une date passée ne se vérifie pas', () => {
  const occ = [{ personne: 'a', jour: '2026-11-05' }];
  assert.deepEqual(RE.verifierDate('2026-11-05', ['a', 'b'], occ, AUJ), { verifiee: false, conflits: ['a'] });
  assert.deepEqual(RE.verifierDate('2026-11-05', ['b'], occ, AUJ), { verifiee: true, conflits: [] });
  assert.equal(RE.verifierDate('2026-10-01', ['a'], occ, AUJ), null);
});
await dit('déclencheurs : formule longue, rendez-vous sans date, date à vérifier, autre langue du destinataire', () => {
  assert.deepEqual(RE.declencheurs('Je me permets de revenir vers vous.', { langue: 'fr' }), ['formule-longue']);
  assert.deepEqual(RE.declencheurs('Peut-on fixer un rendez-vous ?', { langue: 'fr' }), ['rendez-vous-sans-date']);
  assert.deepEqual(RE.declencheurs('On se voit le 5 nov. pour un rendez-vous.', { langue: 'fr' }), ['date-a-verifier']);
  assert.deepEqual(RE.declencheurs('Bonjour.', { langue: 'fr', langueDuDestinataire: 'en' }), ['version-dans-une-autre-langue']);
  assert.deepEqual(RE.declencheurs('Bonjour.', { langue: 'fr', langueDuDestinataire: 'fr' }), []);
});
await dit('brouillon enregistré 2 s après la dernière frappe ; le registre suit le destinataire ; canal d’envoi', () => {
  assert.equal(RE.brouillonAEnregistrer('2026-10-30T10:00:00Z', null, '2026-10-30T10:00:01.900Z'), false);
  assert.equal(RE.brouillonAEnregistrer('2026-10-30T10:00:00Z', null, '2026-10-30T10:00:02Z'), true);
  assert.equal(RE.registreDuTexte(true), 'vouvoiement');
  assert.equal(RE.registreDuTexte(false), 'tutoiement');
  assert.equal(RE.canalDEnvoi({ courriel: true, connecteur: true }), 'courriel');
  assert.equal(RE.canalDEnvoi({ courriel: false, connecteur: true }), 'connecteur');
  assert.equal(RE.canalDEnvoi({ courriel: false, connecteur: false }), 'aucun');
});

/* ── Archives ────────────────────────────────────────────────────────────── */
console.log('\nÉcrire — archives (ME04)\n');

const arch = (id: string, type: string, archiveLe: string, plus: Record<string, unknown> = {}) => ({ id, titre: id, type, tailleOctets: 1000, archiveLe, ...plus });
await dit('index du temps : barre grise = éléments / mois le plus chargé ; barre violette = correspondances (12 en 2026)', () => {
  const els = [arch('a', 'Facture', '2026-10-01'), arch('b', 'Facture', '2026-10-02'), arch('c', 'Facture', '2026-10-03'), arch('d', 'Message', '2026-09-01'), arch('e', 'Message', '2025-10-01')];
  const i = A.indexDuTemps(els, 2026, els.slice(0, 2));
  assert.equal(i.mois.length, 12);
  assert.equal(i.mois[9].elements, 3);
  assert.equal(i.mois[9].densite, 1);
  assert.ok(Math.abs(i.mois[8].densite - 1 / 3) < 1e-9);
  assert.equal(i.mois[9].correspondances, 2);
  assert.equal(i.correspondancesDeLAnnee, 2);
  assert.equal(A.indexDuTemps([], 2026).mois.every((m: any) => m.densite === 0), true);
});
await dit('recherche : titres, puis contenu avec l’option ; extrait = la phrase qui contient le mot, sur une ligne', () => {
  const els = [
    arch('F-1932', 'Facture', '2026-10-15', { titre: 'Facture F-1932 Studio', contenu: 'Règlement reçu. Le client Studio a payé en deux fois. Merci.' }),
    arch('c2', 'Document', '2025-06-02', { titre: 'Contrat Studio 2025', contenu: 'Durée de douze mois.' }),
    arch('m1', 'Message', '2026-08-01', { titre: 'Échange', contenu: 'On parle du studio photo ici.' }),
  ];
  const t = A.rechercher(els, 'studio');
  assert.deepEqual(t.map((r: any) => r.element.id), ['F-1932', 'c2'], 'le plus récent d’abord, titres seulement');
  const c = A.rechercher(els, 'studio', { dansLeContenu: true });
  assert.deepEqual(c.map((r: any) => [r.element.id, r.dans]), [['F-1932', 'titre'], ['m1', 'contenu'], ['c2', 'titre']]);
  assert.equal(c[1].extrait, 'On parle du studio photo ici.');
  assert.equal(A.rechercher(els, 'studio', { type: 'Document' }).length, 1);
  assert.deepEqual(A.rechercher(els, '  '), []);
  assert.equal(A.extrait('Une phrase très longue '.repeat(10) + 'avec studio au bout.', 'studio', 60)?.includes('studio'), true);
  assert.equal(A.extrait('rien ici', 'studio'), null);
  assert.deepEqual(A.compteursParType(c), { Tout: 3, Facture: 1, Message: 1, Document: 1 });
});
await dit('résultats groupés par mois d’archivage, 5 affichés puis « Afficher la suite »', () => {
  const r = Array.from({ length: 8 }, (_, i) => ({ element: arch(`r${i}`, 'Document', i < 3 ? '2026-10-10' : '2026-09-10'), dans: 'titre', extrait: null }));
  const g = A.grouperParMois(r);
  assert.equal(g.affiches, 5);
  assert.equal(g.reste, 3);
  assert.deepEqual(g.groupes.map((x: any) => [x.mois, x.resultats.length]), [['2026-10', 3], ['2026-09', 2]]);
});
await dit('règles : facture payée depuis 12 mois, conversation sans message depuis 6, devis refusé depuis 3 ; la date du jour compte', () => {
  const els = [
    { id: 'f1', genre: 'facture-payee', depuis: '2025-10-30' },
    { id: 'f2', genre: 'facture-payee', depuis: '2025-10-31' },
    { id: 'c1', genre: 'conversation-silencieuse', depuis: '2026-04-30' },
    { id: 'c2', genre: 'conversation-silencieuse', depuis: '2026-05-30' },
    { id: 'd1', genre: 'devis-refuse', depuis: '2026-07-30' },
    { id: 'd2', genre: 'devis-refuse', depuis: '2026-08-30' },
  ];
  assert.deepEqual(A.aArchiver(els, A.REGLES_PAR_DEFAUT, AUJ).map((e: any) => e.id), ['f1', 'c1', 'd1']);
  assert.deepEqual(A.aArchiver(els, [], AUJ), []);
});
await dit('conservation : factures 10 ans ; jamais de suppression définitive depuis les archives', () => {
  assert.equal(A.finDeConservation('Facture', '2026-10-15'), '2036-10-15');
  assert.equal(A.finDeConservation('Message', '2026-10-15'), null);
  assert.equal(A.finDeConservation('Message', '2026-10-15', 2), '2028-10-15');
  assert.equal(A.peutSupprimerDepuisLesArchives(), false);
});
await dit('espace : 2,1 Go sur 20 = 11 % (il reste 17,9 Go) ; quota proche au-delà de 85 %', () => {
  const e = A.espaceDesArchives([arch('a', 'Photo', '2026-10-01', { tailleOctets: 2_100_000_000 })]);
  assert.equal(e.pourcent, 11);
  assert.equal(e.reste, 17_900_000_000);
  assert.equal(e.proche, false);
  assert.equal(C.tailleLisible(e.reste), `17,9${NB}Go`);
  assert.equal(A.espaceDesArchives([arch('a', 'Photo', '2026-10-01', { tailleOctets: 17_100_000_000 })]).proche, true);
  assert.equal(A.espaceDesArchives([arch('a', 'Photo', '2026-10-01', { tailleOctets: 17_000_000_000 })]).proche, false, '85 % pile : pas encore proche');
  assert.equal(I.dire('fr', 'archives.reste', { reste: `17,9${NB}Go` }), `Il te reste 17,9${NB}Go.`);
});
await dit('restaurés récemment : 90 jours, les 2 plus récents affichés ; droit d’écriture et connexion requis', () => {
  const r = [{ id: 'a', at: '2026-10-28T10:00:00Z' }, { id: 'b', at: '2026-10-01T10:00:00Z' }, { id: 'c', at: '2026-08-15T10:00:00Z' }, { id: 'vieux', at: '2026-06-01T10:00:00Z' }];
  const x = A.restauresRecemment(r, '2026-10-30T10:00:00Z');
  assert.equal(x.total, 3);
  assert.deepEqual(x.affiches.map((e: any) => e.id), ['a', 'b']);
  assert.equal(A.peutRestaurer(true, true), true);
  assert.equal(A.peutRestaurer(true, false), false);
  assert.equal(A.peutRestaurer(false, true), false);
});
await dit('« libérer de la place » : une catégorie de photos ou vidéos au-dessus de 1 Go ; sinon rien', () => {
  const gros = [arch('p', 'Photo', '2026-10-01', { tailleOctets: 1_400_000_000 }), arch('d', 'Document', '2026-10-01', { tailleOctets: 9_000_000_000 })];
  assert.deepEqual(A.suggestionDeCompression(gros), { type: 'Photo', octets: 1_400_000_000 });
  assert.equal(A.suggestionDeCompression([arch('p', 'Photo', '2026-10-01', { tailleOctets: 900_000_000 })]), null);
  assert.equal(A.suggestionDeCompression([]), null);
  assert.deepEqual(A.elementsDuMois([arch('a', 'Document', '2026-10-01'), arch('b', 'Document', '2026-10-09'), arch('c', 'Document', '2026-09-30')], '2026-10').map((e: any) => e.id), ['b', 'a']);
  assert.equal(A.moisEnCours('2026-10-30T10:00:00Z'), '2026-10');
});

/* ── Base de connaissances ───────────────────────────────────────────────── */
console.log('\nÉcrire — base de connaissances (ME05)\n');

const art = (id: string, titre: string, etapes: { titre: string; texte: string }[], plus: Record<string, unknown> = {}) => ({ id, titre, rubrique: 'R', etapes, majLe: '2026-10-01', statut: 'publié', ...plus });
await dit('à relire : plus de 6 mois, ou un module cité a changé depuis la mise à jour ; un brouillon n’est jamais « à relire »', () => {
  assert.equal(K.aRelire(art('a', 'A', [], { majLe: '2026-04-29' }), AUJ), true, 'plus de 6 mois');
  assert.equal(K.aRelire(art('a', 'A', [], { majLe: '2026-04-30' }), AUJ), false, 'exactement 6 mois');
  assert.equal(K.aRelire(art('a', 'A', [], { majLe: '2026-10-01', modulesCites: ['facturation'] }), AUJ, { facturation: '2026-10-15' }), true);
  assert.equal(K.aRelire(art('a', 'A', [], { majLe: '2026-10-20', modulesCites: ['facturation'] }), AUJ, { facturation: '2026-10-15' }), false);
  assert.equal(K.aRelire(art('a', 'A', [], { majLe: '2025-01-01', statut: 'brouillon' }), AUJ), false);
  assert.equal(K.nbARelire([art('a', 'A', [], { majLe: '2026-01-01' }), art('b', 'B', [])], AUJ), 1);
  assert.equal(PH.moisEnToutesLettres('2026-04-12', 'fr'), 'avril');
  assert.equal(I.dire('fr', 'connaissances.aRelire', { mois: 'avril' }), 'Cet article date de avril. Vérifie-le avant de l’appliquer.');
});
await dit('lectures : plus de 10 secondes, une fois par personne et par jour ; durée = mots / 200 (au moins 1 min)', () => {
  const o = [
    { articleId: 'a', email: 'x@x.test', jour: '2026-10-28', secondes: 40 },
    { articleId: 'a', email: 'x@x.test', jour: '2026-10-28', secondes: 80 },
    { articleId: 'a', email: 'y@x.test', jour: '2026-10-28', secondes: 10 },
    { articleId: 'a', email: 'y@x.test', jour: '2026-10-29', secondes: 11 },
    { articleId: 'b', email: 'x@x.test', jour: '2026-09-29', secondes: 60 },
  ];
  assert.equal(K.lectures(o), 3);
  assert.equal(K.lectures(o, { articleId: 'a' }), 2);
  assert.equal(K.lectures(o, { mois: '2026-10' }), 2);
  assert.equal(K.dureeDeLecture(800), 4);
  assert.equal(K.dureeDeLecture(10), 1);
});
await dit('« Riyad l’a lu lundi » : la dernière lecture d’un autre membre dans les 7 jours, jamais la mienne', () => {
  const o = [
    { articleId: 'a', email: 'moi@x.test', jour: '2026-10-29', secondes: 60 },
    { articleId: 'a', email: 'r@x.test', jour: '2026-10-26', secondes: 60 },
    { articleId: 'a', email: 's@x.test', jour: '2026-10-20', secondes: 60 },
    { articleId: 'a', email: 'q@x.test', jour: '2026-10-28', secondes: 3 },
  ];
  assert.deepEqual(K.derniereLectureParUnAutre(o, 'a', 'moi@x.test', AUJ), { email: 'r@x.test', jour: '2026-10-26' });
  assert.equal(K.derniereLectureParUnAutre(o, 'b', 'moi@x.test', AUJ), null);
  assert.equal(K.derniereLectureParUnAutre(o.slice(2), 'a', 'moi@x.test', AUJ), null, 'plus de 7 jours');
});
await dit('sommaire : l’étape courante est celle en haut de la zone visible ; progression de lecture', () => {
  assert.equal(K.etapeCourante([0, 300, 700, 1200], 0), 0);
  assert.equal(K.etapeCourante([0, 300, 700, 1200], 299), 0);
  assert.equal(K.etapeCourante([0, 300, 700, 1200], 700), 2);
  assert.equal(K.etapeCourante([0, 300, 700, 1200], 5000), 3);
  assert.equal(K.progressionDeLecture(0, 500, 1000), 0.5);
  assert.equal(K.progressionDeLecture(600, 500, 1000), 1);
  assert.equal(K.progressionDeLecture(0, 800, 500), 1);
  assert.equal(I.dire('fr', 'connaissances.etape', { n: 4, total: 4 }), 'Étape 4 sur 4');
});
await dit('Ajmani répond avec sa source (article et étape), en 2 phrases au plus, sans rien inventer', () => {
  const base = [
    art('fact', 'Envoyer une facture', [
      { titre: 'Ouvrir Facturation', texte: 'Ouvre Facturation. Appuie sur Nouvelle facture. Choisis le client. Ajoute les lignes.' },
      { titre: 'Corriger après l’envoi', texte: 'Une facture envoyée ne se supprime pas : ouvre-la, puis Émettre un avoir.' },
    ]),
    art('stripe', 'Brancher Stripe', [{ titre: 'Clés', texte: 'Ajoute le connecteur de paiement dans les réglages. Les clés restent côté serveur.' }]),
    art('brouillon', 'Brouillon secret', [{ titre: 'x', texte: 'Facture facture facture brouillon.' }], { statut: 'brouillon' }),
  ];
  const r = K.repondre('Comment corriger une facture envoyée ?', base);
  assert.deepEqual(r, { texte: 'Une facture envoyée ne se supprime pas : ouvre-la, puis Émettre un avoir.', articleId: 'fact', etape: 2 });
  const longue = K.repondre('ouvrir la facturation', base);
  assert.equal(longue?.etape, 1);
  assert.equal(longue?.texte, 'Ouvre Facturation. Appuie sur Nouvelle facture.', '2 phrases au plus');
  assert.equal(K.repondre('Comment brancher Stripe ?', base)?.articleId, 'stripe');
  assert.equal(K.repondre('la météo de demain ?', base), null, 'rien d’inventé : « Je n’ai rien trouvé dans ta base »');
  assert.equal(K.repondre('   ', base), null);
  assert.equal(K.repondre('facture brouillon secret', [base[2]]), null, 'un brouillon ne répond pas');
  assert.equal(I.dire('fr', 'connaissances.rienTrouve'), 'Je n’ai rien trouvé dans ta base. Veux-tu créer l’article ?');
});
await dit('parcours des nouveaux : article cité 5 fois ou lié à 5 questions, absent du parcours ; questions fréquentes', () => {
  assert.equal(K.proposerAuParcours({ citations: 5, questionsLiees: 0, dansLeParcours: false }), true);
  assert.equal(K.proposerAuParcours({ citations: 0, questionsLiees: 9, dansLeParcours: false }), true);
  assert.equal(K.proposerAuParcours({ citations: 4, questionsLiees: 4, dansLeParcours: false }), false);
  assert.equal(K.proposerAuParcours({ citations: 9, questionsLiees: 9, dansLeParcours: true }), false);
  assert.deepEqual(K.questionsFrequentes(['b', 'a', 'a', 'c', 'c', 'c', 'd']), ['c', 'a', 'b']);
  assert.deepEqual(K.questionsFrequentes([]), []);
});

/* ── Vue d'ensemble ──────────────────────────────────────────────────────── */
console.log('\nÉcrire — vue d’ensemble (F20)\n');

const mesures = { pages: 126, documents: 183, serieJournal: 12, brouillons: 1, modeles: 24, enAttenteDeSignature: 3, archives: 1482, articles: 38, lecturesDuMois: 214, dictees: 0, coAuteur: 'M' };
await dit('les 9 modules dans l’ordre de la fiche ; Journal en vert, Signatures en orange avec sa pastille, Dictée « Nouveau »', () => {
  assert.deepEqual(H.MODULES_D_ECRIRE.map((m: any) => m.cle), ['notes', 'documents', 'journal', 'redaction', 'modeles', 'signatures', 'archives', 'connaissances', 'dictee']);
  const t = H.tuilesDuHub(mesures);
  assert.equal(t.length, 9);
  const par = Object.fromEntries(t.map((x: any) => [x.cle, x]));
  assert.equal(par.journal.ton, 'vert');
  assert.equal(par.signatures.ton, 'orange');
  assert.equal(par.signatures.pastille, 3);
  assert.equal(par.dictee.nouveau, true);
  assert.deepEqual(par.connaissances.nombres, [38, 214]);
  const calme = Object.fromEntries(H.tuilesDuHub({ ...mesures, serieJournal: 0, enAttenteDeSignature: 0, dictees: 4 }).map((x: any) => [x.cle, x]));
  assert.equal(calme.journal.ton, 'neutre');
  assert.equal(calme.signatures.pastille, null);
  assert.equal(calme.dictee.nouveau, false);
});
await dit('un métier qui n’utilise que 3 modules ne voit que ses tuiles', () => {
  const t = H.tuilesDuHub(mesures, new Set(['notes', 'documents', 'modeles']));
  assert.deepEqual(t.map((x: any) => x.cle), ['notes', 'documents', 'modeles']);
  assert.deepEqual(H.tuilesDuHub(mesures, new Set()).length, 0);
});
await dit('les mesures disent leur compte : « 126 pages · Mohamed écrit », « 183 documents rangés », « 1 482 éléments gardés »', () => {
  assert.equal(I.dire('fr', 'tuile.notes.coAuteur', { n: C.nombre(126), qui: 'Mo' }), `126 pages · Mo écrit`);
  assert.equal(I.direCompte('fr', 'tuile.documents', 183), '183 documents rangés');
  assert.equal(I.direCompte('fr', 'tuile.archives', 1482, { n: C.nombre(1482) }), `1${NB}482 éléments gardés`);
  assert.equal(I.direCompte('fr', 'tuile.signatures', 3), '3 en attente de signature');
  assert.equal(I.direCompte('fr', 'tuile.redaction', 1), '1 brouillon');
  assert.equal(I.dire('fr', 'tuile.connaissances', { articles: 38, lectures: 214 }), '38 articles · 214 lectures');
  assert.equal(I.dire('fr', 'tuile.dictee'), 'Parle, le texte s’écrit');
});
await dit('rangement : au moins 5 notes rapides sans place depuis plus de 3 jours, sinon rien ; la cible est un projet actif', () => {
  const n = (id: string, creeeLe: string, plus = {}) => ({ id, texte: `note ${id}`, creeeLe, ...plus });
  const six = ['a', 'b', 'c', 'd', 'e'].map((i) => n(i, '2026-10-20'));
  assert.deepEqual(H.suggestionDeRangement(six, AUJ), { n: 5, ids: ['a', 'b', 'c', 'd', 'e'] });
  assert.equal(H.suggestionDeRangement(six.slice(0, 4), AUJ), null);
  assert.equal(H.suggestionDeRangement([...six.slice(0, 4), n('f', '2026-10-28')], AUJ), null, 'trop récente');
  assert.equal(H.suggestionDeRangement([...six.slice(0, 4), n('f', '2026-10-20', { projetId: 'p' })], AUJ), null, 'déjà rangée');
  assert.equal(H.suggestionDeRangement([...six.slice(0, 4), n('f', '2026-10-20', { categorie: 'idée' })], AUJ), null);
  const projets = [{ id: 'p1', nom: 'Atelier', actif: false }, { id: 'p2', nom: 'Site', actif: true }];
  assert.equal(H.projetCible({ texte: 'Idée pour le Site vitrine' }, projets)?.id, 'p2');
  assert.equal(H.projetCible({ texte: 'atelier du mardi' }, projets), null, 'un projet terminé n’est pas une cible');
  assert.equal(I.dire('fr', 'hub.rangement', { n: 14 }), '14 notes rapides n’ont pas de place. Je les range dans tes projets en cours ?');
});
await dit('salutation selon l’heure ; un invité ne crée pas de page', () => {
  assert.equal(H.salutation(10 * 60 + 42), 'bonjour');
  assert.equal(H.salutation(18 * 60), 'bonsoir');
  assert.equal(H.salutation(2 * 60), 'bonsoir');
  assert.equal(H.peutCreerUnePage('Membre'), true);
  assert.equal(H.peutCreerUnePage('Invité'), false);
});

/* ── Textes ──────────────────────────────────────────────────────────────── */
console.log('\nÉcrire — textes fr/en, tutoiement\n');

await dit('les dictionnaires fr et en ont les mêmes clés, aucune vide ; les paramètres {…} sont les mêmes', () => {
  const fr = I.DICTIONNAIRES_ECRIRE.fr;
  const en = I.DICTIONNAIRES_ECRIRE.en;
  assert.deepEqual(Object.keys(fr).sort(), Object.keys(en).sort());
  const params = (t: string) => [...t.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');
  const fautes: string[] = [];
  for (const k of Object.keys(en)) {
    if (!fr[k].trim() || !en[k].trim()) fautes.push(`${k} : vide`);
    if (params(fr[k]) !== params(en[k])) fautes.push(`${k} : paramètres ${params(fr[k])} / ${params(en[k])}`);
  }
  assert.deepEqual(fautes, [], fautes.join('\n'));
});
await dit('l’interface tutoie : aucun « vous / votre / vos », aucun impératif en « -ez » dans le français', () => {
  const fautes: string[] = [];
  for (const [k, t] of Object.entries(I.DICTIONNAIRES_ECRIRE.fr) as [string, string][]) {
    if (/\b(vous|votre|vos|Vous|Votre|Vos)\b/.test(t)) fautes.push(`${k} : vouvoiement « ${t} »`);
    if (/\b[a-zéèêàùç]+ez\b/i.test(t.replace(/\{[^}]*\}/g, '')) && !/\bnez\b|\bchez\b/i.test(t)) fautes.push(`${k} : impératif en -ez « ${t} »`);
  }
  assert.deepEqual(fautes, [], fautes.join('\n'));
});
await dit('les comptes ont leurs deux formes (.1 et .n), dans les deux langues', () => {
  const cles = Object.keys(I.DICTIONNAIRES_ECRIRE.fr);
  const bases = new Set(cles.filter((c) => /\.(1|n)$/.test(c)).map((c) => c.replace(/\.(1|n)$/, '')));
  const manques = [...bases].filter((b) => !(cles.includes(`${b}.1`) && cles.includes(`${b}.n`)));
  assert.deepEqual(manques, [], manques.join(', '));
  assert.equal(I.direCompte('fr', 'file.documents', 0), '0 document');
  assert.equal(I.direCompte('fr', 'file.documents', 4), '4 documents');
  assert.equal(I.direCompte('en', 'serie.jours', 1), '1 day in a row');
});
await dit('français : espace insécable avant % et €, apostrophes typographiques', () => {
  for (const [k, t] of Object.entries(I.DICTIONNAIRES_ECRIRE.fr) as [string, string][]) {
    assert.ok(!/\d [%€]/.test(t), `${k} : espace ordinaire avant % ou €`);
    assert.ok(!/'/.test(t), `${k} : apostrophe droite dans « ${t} »`);
  }
});

/* ── Jeux fictifs de SIM ─────────────────────────────────────────────────── */
console.log('\nÉcrire — rejeu sur les jeux fictifs (vide, peu, normal, beaucoup)\n');

for (const volume of ['vide', 'peu', 'normal', 'beaucoup']) {
  await dit(`volume « ${volume} » : la logique tient sur les huit jeux d’Écrire`, () => {
    const w = monde.construireMonde({ volume });
    const moiEmail = monde.moi(w.equipe).email;
    const maintenant = new Date(monde.MAINTENANT_REFERENCE).toISOString();
    const auj = C.jourDe(maintenant);

    // H10 : pages
    const pages = w.pages.map((p: any) => ({ ...p, blocs: p.blocs.map((b: any) => ({ ...b })) }));
    const rec = P.pagesRecentes(pages, moiEmail);
    assert.ok(rec.length <= 5 && rec.length <= pages.filter((p: any) => !p.supprimeeLe).length);
    const arbo = P.compteursArborescence(pages, moiEmail);
    assert.equal(arbo.equipe, pages.filter((p: any) => !p.supprimeeLe && p.espace === 'Équipe').length);
    for (const p of pages) for (const s of P.sectionsDeTaches(p.blocs)) assert.ok(s.faites <= s.total && s.pourcent >= 0 && s.pourcent <= 100);
    // Liens entre pages : recomptés à part, page par page, puis comparés à la logique.
    const ids = new Set(pages.map((p: any) => p.id));
    for (const p of pages) for (const b of p.blocs) for (const cible of b.liens ?? []) assert.ok(ids.has(cible), `lien orphelin : « ${p.title} » cite ${cible}, qui n’existe pas dans le jeu`);
    for (const cible of pages) {
      const citantes = pages.filter((p: any) => p.id !== cible.id && !p.supprimeeLe && p.blocs.some((b: any) => (b.liens ?? []).includes(cible.id)));
      const lr = P.liensRetour(cible.id, pages);
      assert.equal(lr.total, citantes.length, `liens retour de « ${cible.title} »`);
      assert.ok(lr.visibles.length === Math.min(citantes.length, P.LIENS_VISIBLES));
      assert.ok(lr.visibles.every((l: any, i: number, tous: any[]) => i === 0 || Date.parse(tous[i - 1].modifieAt) >= Date.parse(l.modifieAt)), 'la plus récente d’abord');
      assert.ok(lr.visibles.every((l: any) => l.pageId !== cible.id && citantes.some((c: any) => c.id === l.pageId)), 'ni elle-même, ni une page supprimée');
      assert.ok(lr.visibles.every((l: any) => l.extrait.length > 0 && l.extrait.length <= P.EXTRAIT_AVANT + 1), 'extrait non vide et court');
    }
    // Le contrôle n'est pas creux : dès que le jeu a quelques pages, il porte de vrais liens à vérifier.
    const nbLiens = pages.reduce((n: number, p: any) => n + p.blocs.reduce((m: number, b: any) => m + (b.liens?.length ?? 0), 0), 0);
    if (volume === 'normal' || volume === 'beaucoup') assert.ok(nbLiens > 0, 'les jeux « normal » et « beaucoup » portent des liens entre pages');
    // Un lien vers soi-même ne compte pas ; une page supprimée ne cite plus.
    if (pages.length) {
      const a = pages[0];
      const seule = [{ ...a, supprimeeLe: undefined, blocs: [{ type: 'texte' as const, texte: 'Voir plus haut.', liens: [a.id] }] }];
      assert.equal(P.liensRetour(a.id, seule).total, 0);
      const supprimee = [{ ...a, id: 'z', supprimeeLe: '2026-10-01T00:00:00Z', blocs: [{ type: 'texte' as const, texte: 'Ancien.', liens: [a.id] }] }, ...seule];
      assert.equal(P.liensRetour(a.id, supprimee).total, 0);
    }

    // H11 : documents
    const fichiers = w.fichiers;
    const inter = D.intercalaires(fichiers);
    assert.equal(inter.total, fichiers.filter((f: any) => !f.archive && !f.supprimeeLe).length);
    for (const f of fichiers) assert.ok(D.listeParAnnee(fichiers, f.typeMetier).visibles <= D.LIGNES_VISIBLES);
    const espace = D.jaugeEspace(fichiers.reduce((s: number, f: any) => s + f.tailleOctets, 0), 5_000_000_000);
    assert.ok(espace.pourcent >= 0 && espace.pourcent <= 100);

    // H12 : signatures — traduction des demandes du jeu vers la forme du lot
    const demandes = w.signatures.map((s: any) => ({
      id: s.id,
      envoyeAt: s.envoyeAt,
      echeanceLe: s.echeanceLe,
      devis: s.montantCents !== null,
      signataires: s.signataires.map((x: any) => ({ id: x.email, ordre: x.ordre, role: 'signataire', statut: x.statut, signeAt: x.signeAt, envoyeAt: s.envoyeAt })),
    }));
    const attendent = G.enAttenteDeSignature(demandes, auj);
    assert.ok(attendent >= 0 && attendent <= demandes.length);
    for (const d of demandes) {
      const e = G.etatDeDemande(d);
      assert.ok(['À envoyer', 'Envoyée', 'Vue', 'Signée', 'Refusée', 'Expirée', 'Annulée'].includes(e));
      const av = G.avancementDuCircuit(d);
      assert.ok(av.signes <= av.total);
      const plan = G.planDeRelance(d, [], auj);
      if (plan.prochaine !== null) {
        const p = C.partiesParis(plan.prochaine);
        assert.ok(C.estJourOuvre(p.jour) && p.minutes >= 540 && p.minutes < 1080, `relance hors plage : ${new Date(plan.prochaine).toISOString()}`);
      }
    }
    const delai = G.delaiMoyenDeSignature(demandes, '2026-01-01T00:00:00Z', maintenant);
    assert.ok(delai.jours === null || delai.jours >= 0);

    // ME03 : modèles
    for (const m of w.modeles) assert.ok(MO.tauxDUsage(m.usagesMois, Math.max(1, ...w.modeles.map((x: any) => x.usagesMois))) <= 100);

    // ME01 : journal — les pages du jeu ont une humeur sur 4 niveaux (la fiche en veut 5) : voir la note du lot
    const journal = w.journal.filter((e: any) => e.auteurEmail === moiEmail);
    const mots = S.motsParJour(journal.map((e: any) => ({ jour: e.jour, mots: C.compterMots(e.texte) })));
    const serie = S.serieDEcriture(mots, auj);
    assert.ok(serie.serie >= 0 && serie.record >= serie.serie);
    assert.ok(S.moisEnCases(mots, auj, auj).joursEcrits <= C.joursDuMois(auj));
    for (const e of w.journal.filter((x: any) => x.auteurEmail !== moiEmail)) assert.equal(J.visiblePar({ jour: e.jour, auteurEmail: e.auteurEmail }, moiEmail), false);

    // ME04 : archives
    const els = w.archives.map((a: any) => ({ id: a.id, titre: a.nom, type: a.type, tailleOctets: a.tailleOctets, archiveLe: a.archiveLe }));
    const esp = A.espaceDesArchives(els);
    assert.equal(esp.utilise, els.reduce((s: number, e: any) => s + e.tailleOctets, 0));
    assert.equal(A.indexDuTemps(els, 2026).mois.reduce((s: number, m: any) => s + m.elements, 0), els.filter((e: any) => e.archiveLe.startsWith('2026')).length);
    assert.equal(A.rechercher(els, 'devis').every((r: any) => /devis/i.test(r.element.titre)), true);

    // ME05 : connaissances
    const arts = w.connaissances.filter((c: any) => c.type !== 'question').map((c: any) => ({
      id: c.id, titre: c.titre, rubrique: c.type, majLe: c.majLe, statut: c.etat === 'publié' ? 'publié' : 'brouillon',
      etapes: c.blocs.map((b: any) => ({ titre: b.texte.slice(0, 20), texte: b.texte })),
    }));
    assert.ok(K.nbARelire(arts, auj) <= arts.length);
    const ouv = w.connaissances.flatMap((c: any) => c.lectures.map((l: any) => ({ articleId: c.id, email: l.email, jour: l.jour, secondes: 30 })));
    assert.ok(K.lectures(ouv) <= ouv.length);

    // F20 : hub
    const t = H.tuilesDuHub({ pages: pages.length, documents: inter.total, serieJournal: serie.serie, brouillons: w.textes.filter((x: any) => x.etat === 'brouillon').length, modeles: w.modeles.length,
      enAttenteDeSignature: attendent, archives: els.length, articles: arts.length, lecturesDuMois: K.lectures(ouv, { mois: auj.slice(0, 7) }), dictees: 0 });
    assert.equal(t.length, 9);
    const attente = R.fileDeRelecture(
      w.fichiers.filter((f: any) => f.signature === 'En attente de signature').map((f: any) => ({ id: f.id, titre: f.nom, etat: 'En signature', relecteurEmail: null, demandeurEmail: f.proprietaireEmail, demandeAt: f.modifieAt })),
      moiEmail,
    );
    assert.ok(attente.every((l: any) => l.etape === 'signature'));
    const rangement = H.suggestionDeRangement(w.notes.map((n: any) => ({ id: n.id, texte: n.body, creeeLe: C.jourDe(n.createdAt), projetId: n.projectId })), auj);
    assert.ok(rangement === null || rangement.n >= 5);
  });
}

/* ── Structure ───────────────────────────────────────────────────────────── */
console.log('\nÉcrire — structure du lot\n');

const sources = FICHIERS.map((f) => ({ f, src: fs.readFileSync(path.join(racine, ZONE, `${f}.ts`), 'utf8') }));
const sansCommentaires = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

await dit('la logique reste en .ts à la racine de la zone ; les écrans vivent dans ecrans/ (un dossier par écran), et nulle part ailleurs', () => {
  const tous = fs.readdirSync(path.join(racine, ZONE));
  assert.deepEqual(tous.filter((f) => !f.endsWith('.ts') && f !== 'ecrans'), []);
  assert.deepEqual(tous.filter((f) => f.endsWith('.ts')).map((f) => f.replace(/\.ts$/, '')).sort(), [...FICHIERS].sort(), 'un fichier de la zone n’est pas dans la liste du contrôle');
});
await dit('images v4 · H10 : « palier de 14 jours dimanche » (écrit aujourd’hui) ; si rien n’est écrit, un jour plus tôt ; aucun palier au-delà du dernier', () => {
  assert.equal(S.jourDuPalier({ joursAvantPalier: 2, ecritAujourdhui: true }, AUJ), '2026-11-01');
  assert.equal(C.jourSemaineIso('2026-11-01'), 7, 'dimanche');
  assert.equal(S.jourDuPalier({ joursAvantPalier: 2, ecritAujourdhui: false }, AUJ), '2026-10-31');
  assert.equal(S.jourDuPalier({ joursAvantPalier: null, ecritAujourdhui: true }, AUJ), null);
});

await dit('images v4 · H12 : la preuve conservée est une piste datée, dans l’ordre du temps, sans la copie', () => {
  const sg = (id: string, ordre: number, role: 'signataire' | 'copie', envoyeAt: string | null, ouvertAt: string | null, signeAt: string | null) => ({ id, ordre, role, statut: 'En attente' as const, envoyeAt, ouvertAt, signeAt });
  const p = G.pisteDePreuve({ signataires: [
    sg('menna', 2, 'signataire', '2026-10-30T09:45:00Z', '2026-10-31T17:40:00Z', null),
    sg('aaron', 1, 'signataire', '2026-10-30T09:40:00Z', '2026-10-30T09:41:00Z', '2026-10-30T09:44:00Z'),
    sg('lea', 3, 'copie', '2026-10-30T09:46:00Z', '2026-10-30T09:50:00Z', '2026-10-30T09:51:00Z'),
  ] });
  assert.deepEqual(p.map((t: any) => `${t.signataireId}:${t.genre}`), ['aaron:envoi', 'aaron:ouverture', 'aaron:signature', 'menna:envoi', 'lea:envoi', 'menna:ouverture']);
  assert.deepEqual(G.pisteDePreuve({ signataires: [] }), []);
});

await dit('images v4 · ME02 : trois tons ; l’arabe s’écrit de droite à gauche', () => {
  assert.deepEqual([...RE.TONS_DE_REDACTION], ['chaleureux', 'courtois', 'direct']);
  assert.equal(RE.sensDEcriture('ar'), 'rtl');
  assert.equal(RE.sensDEcriture('ar-MA'), 'rtl');
  assert.equal(RE.sensDEcriture('en'), 'ltr');
  assert.equal(RE.sensDEcriture('fr'), 'ltr');
});

await dit('images v4 · ME03 : « utilisé par Aaron et Mohamed », la plus assidue d’abord, depuis le 1er du mois', () => {
  const u = (email: string, at: string) => ({ email, at });
  const qui = MO.utilisateursDuMois([u('m@x.fr', '2026-10-05T08:00:00Z'), u('a@x.fr', '2026-10-06T08:00:00Z'), u('a@x.fr', '2026-10-07T08:00:00Z'), u('r@x.fr', '2026-09-30T08:00:00Z')], '2026-10-01T00:00:00Z');
  assert.deepEqual(qui, ['a@x.fr', 'm@x.fr']);
  assert.deepEqual(MO.utilisateursDuMois([], '2026-10-01T00:00:00Z'), []);
});

await dit('images v4 · ME04 : les années repliées montrent leur total, leurs trouvés et leur courbe de 12 mois', () => {
  const e = (id: string, archiveLe: string) => ({ id, titre: id, type: 'Facture' as const, tailleOctets: 1, archiveLe });
  const tous = [e('1', '2026-10-15'), e('2', '2026-09-03'), e('3', '2025-03-01'), e('4', '2025-03-20'), e('5', '2024-12-31')];
  const r = A.resumeParAnnee(tous, [tous[0], tous[2]]);
  assert.deepEqual(r.map((x: any) => [x.annee, x.elements, x.trouves]), [[2026, 2, 1], [2025, 2, 1], [2024, 1, 0]]);
  assert.deepEqual(r[1].courbe, [0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  assert.equal(r[0].courbe.length, 12);
  assert.deepEqual(A.resumeParAnnee([]), []);
});

await dit('aucune brique visuelle : ni React, ni src/socle/ui, ni code partagé ; seuls les voisins et le dictionnaire du socle', () => {
  const fautes: string[] = [];
  for (const { f, src } of sources) {
    for (const m of src.matchAll(/(?:import|export)[^'"]*?from\s+['"]([^'"]+)['"]/g)) {
      const i = m[1];
      if (i.startsWith('./') || i === '../../socle/mots') continue;
      fautes.push(`${f}.ts importe ${i}`);
    }
  }
  assert.deepEqual(fautes, [], fautes.join('\n'));
});
function fichiersDesEcrans(dossier = path.join(racine, ZONE, 'ecrans')): string[] {
  if (!fs.existsSync(dossier)) return [];
  return fs.readdirSync(dossier, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? fichiersDesEcrans(path.join(dossier, d.name)) : [path.join(dossier, d.name)]));
}
await dit('écrans : composants du socle seulement, rien de src/screens ni de src/assistant, aucune couleur ni nom d’image écrits à la main, aucun secret', () => {
  const fautes: string[] = [];
  const interdits = /Menna|Medina|Cabinet Roux|Studio Nova|Roux Santé|Boulangerie|Parc Sud|Atelier Sarah|Mohamed|Riyad|Aaron|Karim|Léa Martin|Stripe|@[a-z-]+\.(?:fr|com)\b/;
  for (const f of fichiersDesEcrans()) {
    const rel = path.relative(racine, f);
    const src = fs.readFileSync(f, 'utf8');
    const code = f.endsWith('.css') ? src.replace(/\/\*[\s\S]*?\*\//g, '') : sansCommentaires(src);
    for (const m of src.matchAll(/(?:import|export)[^'"]*?from\s+['"]([^'"]+)['"]/g)) {
      if (/\/(screens|assistant|business)\//.test(m[1]) || /\.business(\.|$)/.test(m[1])) fautes.push(`${rel} importe ${m[1]}`);
    }
    if (/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/.test(code)) fautes.push(`${rel} : couleur écrite à la main`);
    if (interdits.test(code)) fautes.push(`${rel} : nom d’une image (${interdits.exec(code)?.[0]})`);
    if (/(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{8,}|ghp_[A-Za-z0-9]{20,}/.test(src)) fautes.push(`${rel} : un secret`);
    if (/\.(tsx|ts)$/.test(f) && /Math\.random\(/.test(code)) fautes.push(`${rel} : du hasard`);
  }
  assert.deepEqual(fautes, [], fautes.join('\n'));
});
await dit('H10 · composerNotes : l’arbre (favoris, clients, équipe), la recherche, les comptes, le plan et « palier de 14 jours dimanche »', () => {
  const base = { clientId: null, blocs: [], auteurEmail: 'a@x.test', contributeurs: ['a@x.test'], modifieAt: '2026-10-30T08:00:00Z', modifieParEmail: 'a@x.test', favorisDe: [] as string[] };
  const pg = (id: string, title: string, espace: string, plus: object = {}) => ({ ...base, id, title, parentId: null as string | null, espace, ...plus });
  const pages = [
    pg('f', 'Plan', 'Équipe', { favorisDe: ['a@x.test'] }),
    pg('c', 'Dossier client', 'Clients'),
    pg('p', 'Page ouverte', 'Clients', { parentId: 'c', blocs: [{ type: 'titre', texte: 'Objectifs' }, { type: 'texte', texte: 'x' }, { type: 'titre', texte: 'À préparer' }] }),
    pg('q', 'Autre page', 'Clients', { parentId: 'c' }),
    pg('s', 'Supprimée', 'Clients', { parentId: 'c', supprimeeLe: '2026-10-01' }),
    pg('e', 'Réunions', 'Équipe'),
  ];
  const jours = Array.from({ length: 12 }, (_, i) => `2026-10-${19 + i}`);
  const mots = S.motsParJour(jours.map((jour) => ({ jour, mots: 100 })));
  const entrees = { langue: 'fr', maintenant: '2026-10-30T09:42:00Z', moi: { email: 'a@x.test', prenom: 'X' }, pages, pageId: 'p', recherche: '', mots, clientDe: () => null, vers: () => undefined, onOuvrir: () => undefined, ecritDans: null };
  const tm = (c: string) => c;
  const v = CH10.composerNotes(entrees, tm);
  assert.deepEqual(v.arbre.sections.map((x: any) => x.titre), ['Favoris', 'Clients', 'Équipe']);
  const clients = v.arbre.sections[1].elements;
  assert.deepEqual(clients.map((x: any) => [x.titre, x.niveau, x.compte ?? null]), [['Dossier client', 0, 2], ['Page ouverte', 1, null], ['Autre page', 1, null]], 'compte hors corbeille ; enfants du dossier ouvert seulement');
  assert.equal(clients[1].actif, true);
  assert.deepEqual(v.droite.plan.items.map((x: any) => x.texte), ['Objectifs', 'À préparer']);
  assert.equal(v.droite.plan.total, '2 blocs titrés');
  assert.equal(v.arbre.serie.valeur, '12 jours');
  assert.equal(v.arbre.serie.phrase, 'Page du jour écrite, palier de 14 jours dimanche.');
  const filtre = CH10.composerNotes({ ...entrees, recherche: 'réunion' }, tm);
  assert.deepEqual(filtre.arbre.sections.map((x: any) => x.titre), ['Équipe']);
  assert.equal(CH10.composerNotes({ ...entrees, pageId: null, pages: [] }, tm).pageMeta, null);
  assert.equal(C.nomDuJour('2026-11-01'), 'dimanche');
  assert.equal(C.nomDuJour('2026-11-01', 'en'), 'Sunday');
});

await dit('F20 · composerHub : le curseur n’existe que s’il y a un coauteur ; la file de relecture met ma ligne d’abord ; rien n’est inventé sans donnée', () => {
  const base = { clientId: null, blocs: [{ type: 'texte', texte: 'Un texte.' }], auteurEmail: 'a@x.test', contributeurs: ['a@x.test'], modifieAt: '2026-10-30T09:41:57Z', modifieParEmail: 'a@x.test', favorisDe: [], parentId: null, espace: 'Équipe' };
  const mesures = { pages: 1, documents: 0, serieJournal: 0, brouillons: 0, modeles: 0, enAttenteDeSignature: 0, archives: 0, articles: 0, lecturesDuMois: 0, dictees: 0 };
  const e = (extra: object = {}) => ({ langue: 'fr', maintenant: '2026-10-30T09:42:00Z', moi: { email: 'a@x.test', prenom: 'X' }, prenomDe: (m: string) => m.split('@')[0], pages: [{ ...base, id: 'p', title: 'T' }], presences: [], filtre: 'toutes', mesures, modulesOuverts: null, documents: [], signaturesActives: true, demandes: [], mots: new Map(), journal: [], notesRapides: [], apercuDe: (p: any) => ({ blocs: p.blocs.map((b: any) => ({ type: b.type, texte: b.texte })), liee: null, cheminDe: ['Équipe'] }), routes: {}, jourSemaineInitiales: ['L', 'M', 'M', 'J', 'V', 'S', 'D'], ...extra });
  const etat = { onFiltre: () => undefined, onOuvrir: () => undefined, onNouvellePage: () => undefined, onPersonnaliser: () => undefined, onRanger: () => undefined, onNonRanger: () => undefined, icones: {}, noms: {}, libelles: {} };
  const tm = (c: string) => c;
  const seul = CF20.composerHub(e(), tm, etat);
  assert.ok(seul.pages.dessus.blocs.every((b: any) => !b.curseur), 'personne ne co-écrit : pas de curseur');
  assert.equal(seul.relecture.lignes.length, 0);
  assert.equal(seul.suggestion, null, 'moins de 5 notes rapides : pas de rangement');
  assert.equal(seul.serie.souvenir, null);
  const avec = CF20.composerHub(e({ presences: [{ email: 'm@x.test', pageId: 'p', tapeA: '2026-10-30T09:41:55Z' }] }), tm, etat);
  assert.equal(avec.pages.dessus.blocs.at(-1).curseur, 'm', 'un coauteur présent : le curseur est à la fin du dernier paragraphe');
  const docs = [
    { id: 'a', titre: 'Pour un autre', etat: 'Relecture demandée', relecteurEmail: 'm@x.test', demandeurEmail: 'a@x.test', demandeAt: '2026-10-28T10:00:00Z' },
    { id: 'b', titre: 'Pour moi', etat: 'Relecture demandée', relecteurEmail: 'a@x.test', demandeurEmail: 'm@x.test', demandeAt: '2026-10-29T10:00:00Z' },
  ];
  const f = CF20.composerHub(e({ documents: docs }), tm, etat);
  assert.deepEqual(f.relecture.lignes.map((l: any) => l.id), ['b', 'a']);
  assert.ok(f.relecture.lignes[0].action !== null && f.relecture.lignes[1].action === null, 'le bouton n’est que sur ma ligne');
  const sans = CF20.composerHub(e({ documents: docs, signaturesActives: false, modulesOuverts: new Set(['notes']) }), tm, etat);
  assert.deepEqual(sans.modules.map((m: any) => m.cle), ['notes'], 'seuls les modules ouverts ont une tuile');
});

await dit('H11 · composerDocuments : intercalaires, liste par année, états de ligne, « à renouveler bientôt », espace utilisé', () => {
  const f = (id: string, nom: string, at: string, plus: object = {}) => ({ id, nom, sous: 's', extension: 'PDF', typeMetier: 'Contrats', tailleOctets: 1, modifieAt: at, archive: false, ...plus });
  const fichiers = [
    f('a', 'Signé', '2026-10-28T10:00:00Z', { demande: { etat: 'Signée' } }),
    f('b', 'En cours', '2026-10-27T10:00:00Z', { demande: { etat: 'Ouverte' } }),
    f('c', 'À renouveler', '2025-12-01T10:00:00Z', { echeance: '2026-12-01' }),
    f('d', 'Facture', '2026-10-01T10:00:00Z', { typeMetier: 'Factures' }),
    f('e', 'Archivé', '2026-10-01T10:00:00Z', { archive: true }),
  ];
  const e = { langue: 'fr', maintenant: '2026-10-30T09:42:00Z', fichiers, types: ['Contrats', 'Factures', 'Clients'], type: 'Contrats', selection: 'a', recherche: '', utiliseOctets: 42e9, quotaOctets: 200e9, octetsLisibles: (n: number) => `${Math.round(n / 1e9)} Go` };
  const v = CH11.composerDocuments(e);
  assert.deepEqual(v.onglets.map((o: any) => [o.cle, o.compteur]), [['Contrats', 3], ['Factures', 1], ['Clients', 0]]);
  assert.deepEqual(v.liste.groupes.map((g: any) => [g.annee, g.compteur]), [[2026, 2], [2025, 1]]);
  assert.deepEqual(v.liste.groupes[0].lignes.map((l: any) => [l.nom, l.etat?.libelle ?? null]), [['Signé', 'Signé'], ['En cours', 'À signer']]);
  assert.equal(v.liste.groupes[1].lignes[0].etat.libelle, 'À renouveler');
  assert.equal(v.liste.sous, '3 documents · 1 à renouveler bientôt');
  assert.equal(v.liste.groupes[0].lignes[0].actif, true);
  assert.equal(v.liste.espace.pourcent, 21);
  assert.equal(v.liste.espace.ton, 'neutre');
  assert.equal(CH11.composerDocuments({ ...e, recherche: 'cours' }).liste.groupes.length, 1);
  assert.equal(CH11.composerDocuments({ ...e, quotaOctets: 0 }).liste.espace, null, 'pas de quota connu : pas de jauge');
  assert.deepEqual(CH11.composerDocuments({ ...e, fichiers: [] }).liste.groupes, []);
});

await dit('H12 · composerSignatures : tickets, circuit, relance « 1 sur 3 », preuve conservée dans l’ordre du temps', () => {
  const sg = (id: string, ordre: number, nom: string, role: string, statut: string, envoyeAt: string | null, ouvertAt: string | null, signeAt: string | null) => ({ id, ordre, role, statut, envoyeAt, ouvertAt, signeAt, nom, fonction: 'f' });
  const d = (id: string, signataires: any[], extra: object = {}) => ({ id, titre: `Doc ${id}`, client: 'C', envoyeAt: '2026-10-27T09:00:00Z', devis: true, signataires, relancesEnvoyees: [], ...extra });
  const demandes = [
    d('a', [sg('1', 1, 'Un', 'signataire', 'Signé', '2026-10-27T09:00:00Z', '2026-10-27T09:10:00Z', '2026-10-28T09:20:00Z')]),
    d('b', [sg('1', 1, 'Un Deux', 'signataire', 'Signé', '2026-10-30T09:40:00Z', '2026-10-30T09:41:00Z', '2026-10-30T09:44:00Z'), sg('2', 2, 'Trois', 'signataire', 'Ouvert', '2026-10-30T09:45:00Z', '2026-10-29T17:40:00Z', null), sg('3', 3, 'Copie', 'copie', 'En attente', '2026-10-30T09:46:00Z', null, null)], { envoyeAt: '2026-10-30T09:40:00Z', texteDeRelance: 'Bonjour, votre signature est attendue.' }),
    d('c', [sg('1', 1, 'Seul', 'signataire', 'En attente', '2026-10-27T09:00:00Z', null, null)], { envoyeAt: '2026-10-27T09:00:00Z' }),
  ];
  const e = { langue: 'fr', maintenant: '2026-10-30T09:42:00Z', demandes, choisie: 'b', relanceActive: true };
  const v = CH12.composerSignatures(e);
  assert.deepEqual(v.tickets.map((t: any) => t.etat.libelle), ['Signé le 28 oct.', 'Ouvert hier', 'Envoyé il y a 3 j']);
  assert.deepEqual(v.tickets[0].segments, ['fait', 'fait', 'fait']);
  assert.equal(v.tickets[1].actif, true);
  assert.equal(v.circuit.progression, '1 sur 2 signé');
  assert.deepEqual(v.circuit.signataires.map((s: any) => s.badge.libelle), ['Signé', 'À signer']);
  assert.equal(v.circuit.copie.nom, 'Copie');
  assert.ok(/1 sur 3/.test(v.relance.quand), 'la prochaine relance est la 1 sur 3');
  assert.equal(v.relance.relancer, 'Relancer Trois');
  assert.equal(v.preuve.traces[0].genre, 'ouverture', 'la piste commence par le fait le plus ancien');
  assert.ok(v.preuve.traces.every((t: any, i: number, a: any[]) => i === 0 || a[i - 1].quand.length > 0));
  const sans = CH12.composerSignatures({ ...e, choisie: 'a' });
  assert.equal(sans.relance, null, 'circuit signé : plus de relance');
  assert.equal(CH12.composerSignatures({ ...e, demandes: [], choisie: null }).circuit, null);
  assert.equal(C.dateCourte('2026-10-28'), '28 oct.');
  assert.equal(C.quandRelatif('2026-10-29T12:00:00Z', '2026-10-30T09:42:00Z'), 'hier');
});

await dit('rien ne lit l’horloge ni le hasard : « maintenant » est toujours un paramètre', () => {
  const fautes = sources.filter(({ src }) => /Date\.now\(|new Date\(\)|Math\.random|performance\.now/.test(sansCommentaires(src))).map(({ f }) => f);
  assert.deepEqual(fautes, []);
});
await dit('aucun nom, aucune adresse ni montant des images dans la logique (ni dans ses commentaires)', () => {
  const interdits = /Menna|Medina|Cabinet Roux|Studio Nova|Roux Santé|Boulangerie|Parc Sud|Atelier Sarah|Mohamed|Riyad|Aaron|Karim|Léa Martin|Stripe|@[a-z-]+\.(?:fr|com)\b|\d[\d  ]*\s?€/;
  const fautes = sources.filter(({ src }) => interdits.test(src)).map(({ f, src }) => `${f}.ts : ${interdits.exec(src)?.[0]}`);
  assert.deepEqual(fautes, [], fautes.join('\n'));
});
await dit('aucun secret : ni clé, ni jeton, ni mot de passe écrit dans la zone', () => {
  const fautes = sources.filter(({ src }) => /(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{8,}|ghp_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{12,}|BEGIN [A-Z ]*PRIVATE KEY-----\n/.test(src)).map(({ f }) => f);
  assert.deepEqual(fautes, []);
});
await dit('aucune couleur écrite à la main : les tons restent des mots, le néon vient des jetons de la famille', () => {
  const fautes = sources.filter(({ src }) => /#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(sansCommentaires(src))).map(({ f }) => f);
  assert.deepEqual(fautes, []);
});
await dit('la fiche d’origine est citée : chaque fichier nomme l’écran qu’il sert (ID de fiche en commentaire)', () => {
  const attendus: Record<string, RegExp> = { serie: /F20/, pages: /H10/, relecture: /F20/, documents: /H11/, signatures: /H12/, modeles: /ME03/, journal: /ME01/, redaction: /ME02/, archives: /ME04/, connaissances: /ME05/, hub: /F20/ };
  const fautes = Object.entries(attendus).filter(([f, re]) => !re.test(sources.find((s) => s.f === f)?.src ?? '')).map(([f]) => f);
  assert.deepEqual(fautes, []);
});

console.log('');
if (echecs > 0) {
  console.error(`ÉCHEC — ${echecs} propriété(s) de la logique d’Écrire ne tiennent pas.`);
  process.exit(1);
}
console.log(`OK — ${vus} propriétés de la logique d’Écrire tiennent.`);
process.exit(0);

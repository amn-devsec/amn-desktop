/**
 * Contrôle de la LOGIQUE DE LOT-01 · MA JOURNÉE — `npm run check:journee`.
 *
 * Sans réseau, sans navigateur. La logique pure du lot (`src/refonte/journee/`) est exercée hors interface :
 *   1. la série de la journée (clôture des priorités), ses paliers, son record, ses jours de repos ;
 *   2. les trois écrans CALCULÉS — H04 Bilan de la semaine, G08 Cockpit, H25 Tableau de bord — comparés aux valeurs
 *      attendues de SIM (`src/refonte/donnees/attendus.ts`), sur les quatre volumes et plusieurs graines ;
 *   3. les projets (MJ01), les défis d'équipe (L07), les habitudes (MJ02), les rappels (MJ05), le planning (MJ03),
 *      le kanban (H03) ;
 *   4. les PROPRIÉTÉS DES ÉLÉMENTS LUDIQUES PROTÉGÉS (STATUT §1.10) : aucun chiffre individuel, aucun classement,
 *      aucun point perdu, aucun reproche ;
 *   5. la voix : tutoiement, aucun point d'exclamation, aucun mot de reproche, fr et en alignés ;
 *   6. la structure : aucun composant ni brique visuelle avant le feu vert du CO, aucune lecture de l'horloge, aucun
 *      secret dans le cockpit.
 *
 * Les fiches du lot (dossier v4) n'étaient pas à disposition de la session de préparation : les règles qui en
 * dépendent sont marquées « à confirmer » dans la note du lot, et leurs valeurs de départ vivent à un seul endroit
 * (`REGLES_PAR_DEFAUT`, `PALIERS_DE_SERIE`, `MODULES_SUIVIS`…).
 *
 *   npm run check:journee
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ZONE = 'src/refonte/journee';
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
  [
    `export * as L from '../${ZONE}';`,
    `export * as G from '../${ZONE}/grille';`,
    `export * as MX from '../${ZONE}/matrice';`,
    `export * as ES from '../${ZONE}/escalier';`,
    `export * as MT from '../${ZONE}/matin';`,
    `export * as RL from '../${ZONE}/relais';`,
    "export * as monde from '../src/refonte/donnees';",
    "export * as attendus from '../src/refonte/donnees/attendus';",
    "export { avancementProjet, statutProjet } from '../src/refonte/donnees/ma-journee';",
    "export { joursSansImpaye as joursSansImpayeSim } from '../src/refonte/donnees/complements';",
    "export { moi } from '../src/refonte/donnees/equipe';",
    "export { jourDe as jourDeSim } from '../src/refonte/donnees/outils';",
    "export { DICTIONNAIRES_JOURNEE } from '../" + ZONE + "/i18n';",
    "export { ecartsDeVoix } from '../src/socle/mots/voix';",
  ].join('\n'),
);
const { L, G, MX, ES, MT, RL, monde, attendus, moi, jourDeSim, avancementProjet, statutProjet, joursSansImpayeSim, DICTIONNAIRES_JOURNEE: DICO, ecartsDeVoix } = M;

const VOLUMES = ['vide', 'peu', 'normal', 'beaucoup'] as const;
const mondes = Object.fromEntries(VOLUMES.map((v) => [v, monde.construireMonde({ volume: v })])) as Record<(typeof VOLUMES)[number], any>;
const autresGraines: Record<string, any> = {
  'normal/1': monde.construireMonde({ volume: 'normal', graine: 1 }),
  'normal/42': monde.construireMonde({ volume: 'normal', graine: 42 }),
  'peu/7': monde.construireMonde({ volume: 'peu', graine: 7 }),
  'beaucoup/3': monde.construireMonde({ volume: 'beaucoup', graine: 3 }),
};
const tousLesMondes: [string, any][] = [...Object.entries(mondes), ...Object.entries(autresGraines)];

/** Le code d'un fichier, sans commentaires (les commentaires CITENT ce qu'on interdit). */
function code(fichier: string): string {
  const src = fs.readFileSync(path.join(racine, fichier), 'utf8');
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1');
}
function fichiersDe(dossier: string): string[] {
  const sortie: string[] = [];
  for (const e of fs.readdirSync(path.join(racine, dossier), { withFileTypes: true })) {
    const rel = `${dossier}/${e.name}`;
    // Les sous-dossiers de la zone sont les ÉCRANS construits (`ecrans/` de S7 ; `calendrier/`, `missions/`… de S1) :
    // leur garde est `check:journee-ecrans`. La logique pure est dans les fichiers à la racine de la zone.
    if (e.isDirectory()) continue;
    else if (/\.(ts|tsx)$/.test(e.name)) sortie.push(rel);
  }
  return sortie.sort();
}

/* ── 1. La série de la journée ───────────────────────────────────────────── */
console.log('\nLOT-01 — la série (clôture des priorités)\n');

// Octobre 2026 : lundi 26, mardi 27, mercredi 28, jeudi 29, vendredi 30 ; samedi 31, dimanche 1er nov., lundi 2 nov.
const priorite = (jour: string, faitLe: string | null, id = 'p') => ({ id: `${jour}-${id}`, faitLe });
const bouclee = (jour: string) => ({ jour, items: [priorite(jour, jour, 'a'), priorite(jour, jour, 'b'), priorite(jour, jour, 'c')] });
/** Une journée à trois priorités dont `faites` sont faites. */
const ouverte = (jour: string, faites = 1) => ({ jour, items: Array.from({ length: 3 }, (_, i) => priorite(jour, i < faites ? jour : null, `p${i}`)) });

await dit('aucune journée jouée : état « aucune », série 0, aucun palier', () => {
  const s = L.serieDeLaJournee([], '2026-10-30');
  assert.equal(s.serie, 0);
  assert.equal(s.record, 0);
  assert.equal(s.etat, 'aucune');
  assert.equal(s.boucleeAujourdhui, false);
  assert.equal(s.prochainPalier, 5);
  assert.equal(s.joursAvantPalier, 5);
  assert.ok(s.paliers.every((p: any) => !p.atteint && !p.enCours));
});

await dit('une journée est bouclée quand TOUTES ses priorités sont faites avant la fin du jour', () => {
  assert.equal(L.journeeBouclee(bouclee('2026-10-28')), true);
  assert.equal(L.journeeBouclee(ouverte('2026-10-28', 2)), false);
  assert.equal(L.journeeBouclee({ jour: '2026-10-28', items: [] }), false, 'aucune priorité : pas bouclée');
  assert.equal(L.journeeBouclee(undefined), false);
  // Une priorité finie le LENDEMAIN ne rattrape pas la veille : on compte à la clôture.
  assert.equal(L.journeeBouclee({ jour: '2026-10-28', items: [priorite('2026-10-28', '2026-10-29')] }), false);
});

await dit('trois jours bouclés de suite : série 3 ; aujourd’hui pas fini ne casse rien et ne compte pas', () => {
  const j = [bouclee('2026-10-27'), bouclee('2026-10-28'), bouclee('2026-10-29'), ouverte('2026-10-30', 1)];
  const s = L.serieDeLaJournee(j, '2026-10-30');
  assert.equal(s.serie, 3);
  assert.equal(s.etat, 'en-cours');
  assert.equal(s.boucleeAujourdhui, false);
  assert.equal(s.restantesAujourdhui, 2);
  assert.equal(L.serieDeLaJournee([...j.slice(0, 3), bouclee('2026-10-30')], '2026-10-30').serie, 4, 'aujourd’hui bouclé : +1');
});

await dit('une journée passée non finie casse la série ; le record et les paliers atteints restent', () => {
  const cinq = ['2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23'].map(bouclee);
  const j = [...cinq, ouverte('2026-10-26', 2), bouclee('2026-10-29'), bouclee('2026-10-30')];
  const s = L.serieDeLaJournee(j, '2026-10-30');
  assert.equal(s.serie, 2);
  assert.equal(s.record, 5, 'aucun point perdu : le record de 5 reste');
  assert.equal(s.paliers.find((p: any) => p.valeur === 5).atteint, true, 'un palier atteint est gardé pour toujours');
  assert.equal(s.paliers.find((p: any) => p.valeur === 5).enCours, false, 'mais la série en cours ne le couvre plus');
});

await dit('série interrompue : « reprise », jamais un 0 sec sans mot ; le record est gardé', () => {
  const j = [bouclee('2026-10-20'), bouclee('2026-10-21'), ouverte('2026-10-22', 0)];
  const s = L.serieDeLaJournee(j, '2026-10-30');
  assert.equal(s.serie, 0);
  assert.equal(s.etat, 'reprise');
  assert.equal(s.record, 2);
});

await dit('samedi et dimanche ne cassent pas la série (repos par défaut) ; un week-end travaillé la fait avancer', () => {
  const s = L.serieDeLaJournee([bouclee('2026-10-29'), bouclee('2026-10-30'), bouclee('2026-11-02')], '2026-11-02');
  assert.equal(s.serie, 3, 'jeudi, vendredi et lundi : le week-end est neutre');
  const w = L.serieDeLaJournee([bouclee('2026-10-30'), bouclee('2026-10-31'), bouclee('2026-11-02')], '2026-11-02');
  assert.equal(w.serie, 3, 'un samedi bouclé compte');
  const casse = L.serieDeLaJournee([bouclee('2026-10-30'), ouverte('2026-10-31', 0), bouclee('2026-11-02')], '2026-11-02');
  assert.equal(casse.serie, 2, 'un samedi non fini ne casse rien');
});

await dit('un jour ouvré sans priorité n’est pas joué (il ne casse rien) ; l’option le fait casser, sauf aujourd’hui', () => {
  const j = [bouclee('2026-10-27'), bouclee('2026-10-29'), bouclee('2026-10-30')];
  assert.equal(L.serieDeLaJournee(j, '2026-10-30').serie, 3);
  assert.equal(L.serieDeLaJournee(j, '2026-10-30', { jourSansPrioriteCasse: true }).serie, 2, 'le mercredi vide casse');
  assert.equal(L.serieDeLaJournee([bouclee('2026-10-29')], '2026-10-30', { jourSansPrioriteCasse: true }).serie, 1, 'aujourd’hui, rien n’est encore choisi : rien ne casse');
});

await dit('paliers : prochain, jours restants, progression plafonnée, et plus de palier après le dernier', () => {
  const longue = (n: number) => Array.from({ length: n }, (_, i) => bouclee(L.ajouterJours('2026-10-30', -i)));
  const s7 = L.serieDeLaJournee(longue(7), '2026-10-30', { joursDeRepos: [] });
  assert.deepEqual([s7.serie, s7.prochainPalier, s7.joursAvantPalier], [7, 10, 3]);
  assert.ok(Math.abs(s7.progression - 0.7) < 1e-9);
  const s100 = L.serieDeLaJournee(longue(100), '2026-10-30', { joursDeRepos: [] });
  assert.equal(s100.prochainPalier, null);
  assert.equal(s100.joursAvantPalier, null);
  assert.equal(s100.progression, 1);
  assert.ok(s100.paliers.every((p: any) => p.atteint && p.enCours));
  assert.deepEqual(L.PALIERS_DE_SERIE, [5, 10, 20, 30, 50, 100], 'paliers de H04 (Proposition, repris par SIM)');
  assert.deepEqual([...attendus.PALIERS_DE_SERIE], [...L.PALIERS_DE_SERIE], 'les mêmes que ceux de SIM');
});

await dit('le jour du prochain palier saute le week-end ; la série n’est jamais négative et le record ≥ la série', () => {
  const s = { joursAvantPalier: 3, boucleeAujourdhui: true };
  assert.equal(L.jourDuPalier(s, '2026-10-30'), '2026-11-04', 'vendredi + 3 journées de travail : lundi, mardi, mercredi');
  assert.equal(L.jourDuPalier({ joursAvantPalier: null, boucleeAujourdhui: true }, '2026-10-30'), null);
  const hasard = [bouclee('2026-10-27'), ouverte('2026-10-28', 0), bouclee('2026-10-29')];
  const r = L.serieDeLaJournee(hasard, '2026-10-30');
  assert.ok(r.serie >= 0 && r.record >= r.serie);
});

await dit('la collection `dailyPriorities` se lit sans reconstruire la règle', () => {
  const ligne = { email: 'a@exemple.test', day: '2026-10-29', items: [{ id: 'p1', label: 'x', doneAt: '2026-10-29T16:40:00.000Z' }, { id: 'p2', label: 'y', doneAt: null }] };
  const p = L.prioritesDeLaCollection(ligne, L.jourDeParis);
  assert.deepEqual(p, { jour: '2026-10-29', items: [{ id: 'p1', faitLe: '2026-10-29' }, { id: 'p2', faitLe: null }] });
  assert.equal(L.journeeBouclee(p), false);
  // Le 29 oct. 2026 est en heure d'hiver (+01:00) : 23 h 30 UTC est déjà le lendemain à Paris.
  assert.equal(L.jourDeParis('2026-10-29T22:30:00.000Z'), '2026-10-29');
  assert.equal(L.jourDeParis('2026-10-29T23:30:00.000Z'), '2026-10-30');
});

await dit('une seule série : « Aujourd’hui » (N01 et la carte) lit la règle du lot, pas celle des routines (STATUT §1.36 n° 1)', () => {
  const src = code('src/refonte/coquille/aujourdhui/calculer.ts');
  assert.ok(/serieDeLaJournee/.test(src) && !/meilleureSerie/.test(src), 'calculer.ts doit lire serieDeLaJournee');
  assert.ok(/journee\/serie/.test(src), 'calculer.ts importe la règle du lot');
});

await dit('le moment « defi.tenu » existe au catalogue, ton « fête », famille Ma journée', () => {
  const src = code('src/socle/moments.ts');
  assert.ok(/'defi\.tenu': \{ defiId: string \}/.test(src));
  assert.ok(/'defi\.tenu': \{ famille: 'jour', ton: 'fete' \}/.test(src));
});

/* ── 2. Les écrans calculés, comparés à SIM ──────────────────────────────── */
console.log('\nLOT-01 — H04, G08, H25 face aux valeurs attendues de SIM\n');

const taches = (m: any) => m.taches.map((t: any) => ({ id: t.id, status: t.status, assigneeEmail: t.assigneeEmail, echeance: t.echeance, faiteAt: t.faiteAt }));
// La série vient des priorités du jour de la personne (collection `dailyPriorities`), comme le fait `calculerAujourdhui` : une seule règle.
const serieDeSim = (m: any, email: string, jour: string): number =>
  L.serieDeLaJournee(
    m.dailyPriorities.filter((d: any) => d.email.toLowerCase() === email.toLowerCase()).map((d: any) => L.prioritesDeLaCollection(d, L.jourDeParis)),
    jour,
  ).serie;

await dit('H04 : le bilan calculé égale `attendusBilanSemaine`, aux quatre volumes, sur plusieurs graines, plusieurs semaines et plusieurs personnes', () => {
  for (const [nom, m] of tousLesMondes) {
    const emails = [...new Set<string>([moi(m.equipe).email, ...m.equipe.slice(0, 3).map((x: any) => x.email)])];
    for (const email of emails) {
      for (const decalage of [0, -7, -14, 7]) {
        const jour = L.ajouterJours(m.contexte.aujourdhui, decalage);
        const attendu = attendus.attendusBilanSemaine(m, { jour, email });
        const calcule = L.bilanDeLaSemaine({
          jour,
          email,
          taches: taches(m),
          paiements: m.paiements,
          clients: m.clients,
          factures: m.factures,
          // La série vient de ailleurs (règle unique) : ici, la même fonction que N01, sur les priorités du jour.
          serie: { serie: serieDeSim(m, email, jour) },
        });
        const { boiteAZero: _b, manque: _m, ...sansManque } = attendu;
        assert.deepEqual(calcule, sansManque, `${nom} · ${email} · ${jour}`);
      }
    }
  }
});

await dit('H04 : les jalons des factures et le palier suivent la série passée en entrée', () => {
  const m = mondes.normal;
  const email = m.equipe[0].email;
  const base = { jour: m.contexte.aujourdhui, email, taches: taches(m), paiements: m.paiements, clients: m.clients, factures: m.factures };
  const j12 = L.bilanDeLaSemaine({ ...base, serie: { serie: 12 } }).jalons;
  assert.deepEqual([j12.serie, j12.prochainPalier, j12.joursRestants], [12, 20, 8]);
  assert.ok(Math.abs(j12.progression - 0.6) < 1e-9);
  assert.equal(L.bilanDeLaSemaine({ ...base, serie: { serie: 100 } }).jalons.prochainPalier, null);
  assert.equal(L.bilanDeLaSemaine({ ...base, factures: [] , serie: { serie: 0 } }).jalons.dixFactures, false);
});

await dit('G08 : le cockpit calculé égale `attendusCockpit`, aux quatre volumes et sur plusieurs graines', () => {
  for (const [nom, m] of tousLesMondes) {
    const attendu = attendus.attendusCockpit(m);
    const calcule = L.cockpitDuClient({
      aujourdhui: m.contexte.aujourdhui,
      abonnements: m.abonnements,
      paiements: m.paiements,
      clients: m.clients,
      factures: m.factures,
      tickets: m.tickets,
      connecteurs: m.connecteurs,
      objectifMrrCents: m.entreprise.reglages.objectifMrrCents,
      connexions: m.utilisateursConnectes,
    });
    const { manque: _a, ...a } = attendu;
    const { manque: _c, ...c } = calcule;
    assert.deepEqual(c, a, nom);
    // Une donnée absente est dite dans `manque` (SIM n'a pas de champ pour cela) ; présente, elle n'y figure pas.
    assert.equal(calcule.manque.some((x: string) => x.startsWith('Objectif du mois')), calcule.objectifDuMois === null, `${nom} : objectif`);
    assert.equal(calcule.manque.some((x: string) => x.startsWith('Utilisateurs connectés')), calcule.utilisateursConnectes === null, `${nom} : connectés`);
  }
});

await dit('G08 : l’objectif du mois — anneau arrondi, « plus que… » jamais négatif, rythme en jours, atteint à l’égalité, absent sans réglage', () => {
  // Octobre 2026 : 31 jours. Le 15, à mi-objectif, on est pile au rythme (0,5 × 31 − 15 = 0,5 → arrondi 1).
  const o = (jour: string, mrr: number, obj: number | null | undefined) => L.objectifDuMois(jour, mrr, obj);
  assert.deepEqual(o('2026-10-15', 5000, 10000), { objectifCents: 10000, mrrCents: 5000, resteCents: 5000, partPourcent: 50, ecartDeRythmeJours: 1, atteint: false });
  assert.equal(o('2026-10-30', 9999, 10000)?.atteint, false, 'un centime avant : pas atteint');
  assert.equal(o('2026-10-30', 10000, 10000)?.atteint, true, 'à l’égalité : atteint');
  assert.equal(o('2026-10-30', 12500, 10000)?.resteCents, 0, '« plus que » ne descend pas sous zéro');
  assert.equal(o('2026-10-30', 12500, 10000)?.partPourcent, 125, 'l’anneau peut dépasser 100');
  assert.equal(o('2026-10-10', 1000, 10000)?.ecartDeRythmeJours, -7, 'en retard de 7 jours (0,1 × 31 − 10 = −6,9)');
  assert.equal(o('2026-02-14', 5000, 10000)?.ecartDeRythmeJours, 0, 'février 2026 : 28 jours, 0,5 × 28 − 14 = 0');
  assert.equal(o('2028-02-14', 5000, 10000)?.ecartDeRythmeJours, 1, 'février 2028 : 29 jours (bissextile), 0,5 × 29 − 14 = 0,5');
  assert.equal(o('2026-10-15', 5000, 0), null);
  assert.equal(o('2026-10-15', 5000, null), null);
  assert.equal(o('2026-10-15', 5000, undefined), null);
  assert.equal(o('2026-10-15', 5000, -5), null, 'un objectif négatif n’est pas un objectif');
});

await dit('G08 : les utilisateurs connectés — sept derniers jours connus, aujourd’hui en dernier, le futur ne compte pas, vide : absent', () => {
  const c = (jour: string, connectes: number) => ({ jour, connectes });
  const dix = Array.from({ length: 10 }, (_, i) => c(L.ajouterJours('2026-10-21', i), i + 1)); // du 21 au 30 octobre
  const r = L.connexionsDeLaSemaine('2026-10-30', [...dix].reverse());
  assert.deepEqual(r?.parJour.map((x: any) => x.jour), ['2026-10-24', '2026-10-25', '2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30']);
  assert.equal(r?.aujourdhui, 10, 'le dernier jour est aujourd’hui');
  assert.equal(L.connexionsDeLaSemaine('2026-10-27', dix)?.aujourdhui, 7, 'le 28, le 29 et le 30 sont à venir : on s’arrête au 27');
  assert.equal(L.connexionsDeLaSemaine('2026-10-20', dix), null, 'rien d’avant le 21 : pas de série');
  assert.equal(L.connexionsDeLaSemaine('2026-10-30', []), null);
  assert.equal(L.connexionsDeLaSemaine('2026-10-30', undefined), null);
  assert.equal(L.connexionsDeLaSemaine('2026-10-22', dix)?.parJour.length, 2, 'moins de sept jours connus : on en rend moins, sans inventer');
  // Sans la donnée dans l'entrée, le cockpit le dit.
  const m = mondes.normal;
  const sans = L.cockpitDuClient({ aujourdhui: m.contexte.aujourdhui, abonnements: m.abonnements, paiements: m.paiements, clients: m.clients, factures: m.factures, tickets: m.tickets, connecteurs: m.connecteurs });
  assert.equal(sans.objectifDuMois, null);
  assert.equal(sans.utilisateursConnectes, null);
  assert.equal(sans.manque.length, 2, 'les deux chiffres absents sont dits, pas inventés');
});

await dit('G08 : un abonnement est actif un jour donné — commencé, et actif ou résilié plus tard (les limites du jour même)', () => {
  const a = (o: Record<string, unknown>) => ({ depuis: '2026-01-01', etat: 'Actif', resilieLe: null, ...o });
  assert.equal(L.abonnementActifAu(a({}), '2026-10-30'), true);
  assert.equal(L.abonnementActifAu(a({ etat: 'Résilié', resilieLe: '2026-10-30' }), '2026-10-30'), false, 'résilié CE jour : plus actif ce jour-là');
  assert.equal(L.abonnementActifAu(a({ etat: 'Résilié', resilieLe: '2026-10-31' }), '2026-10-30'), true, 'résilié demain : actif aujourd’hui');
  assert.equal(L.abonnementActifAu(a({ etat: 'Paiement échoué' }), '2026-10-30'), false, 'ni actif ni résilié plus tard');
  assert.equal(L.abonnementActifAu(a({ depuis: '2026-10-30' }), '2026-10-30'), true, 'commencé aujourd’hui');
  assert.equal(L.abonnementActifAu(a({ depuis: '2026-10-31' }), '2026-10-30'), false, 'pas encore commencé');
});

await dit('H25 : le tableau de bord calculé égale `attendusTableauDeBord` (libellés compris), aux quatre volumes et sur plusieurs graines', () => {
  for (const [nom, m] of tousLesMondes) {
    const email = m.equipe[0].email;
    const attendu = attendus.attendusTableauDeBord(m, { email });
    const calcule = L.tableauDeBord({
      aujourdhui: m.contexte.aujourdhui,
      maintenant: new Date(m.contexte.maintenant).toISOString(),
      email,
      paiements: m.paiements,
      tickets: m.tickets,
      factures: m.factures,
      devis: m.devis,
      taches: taches(m),
      evenements: m.evenements,
      serie: serieDeSim(m, email, m.contexte.aujourdhui),
    });
    const lisible = { ...calcule, activiteRecente: calcule.activiteRecente.map((a: any) => ({ libelle: L.libelleDActivite('fr', a), jour: a.jour })) };
    const { manque: _a, ...a } = attendu;
    const { manque: _c, ...c } = lisible;
    assert.deepEqual(c, a, nom);
    assert.ok(calcule.manque.length === 2);
  }
});

await dit('H25 : trois lignes visibles puis « + n autres », cinq lignes d’activité au plus', () => {
  const m = mondes.beaucoup;
  const t = L.tableauDeBord({ aujourdhui: m.contexte.aujourdhui, maintenant: new Date(m.contexte.maintenant).toISOString(), email: m.equipe[0].email, paiements: m.paiements, tickets: m.tickets, factures: m.factures, devis: m.devis, taches: taches(m), evenements: m.evenements, serie: 0 });
  assert.ok(t.tickets.visibles.length <= 3 && t.facturesImpayees.visibles.length <= 3 && t.activiteRecente.length <= 5);
  const ouverts = m.tickets.filter((x: any) => x.colonne !== 'termine').length;
  assert.equal(t.tickets.visibles.length + t.tickets.autres, ouverts);
});

await dit('G08 : aucun secret ne traverse le cockpit (entrée, sortie, code) — les clés restent côté serveur', () => {
  const secret = /secret|token|jeton|api[-_]?key|apikey|password|mot[-_]?de[-_]?passe|iban|\bsk_|\bpk_|cleCree|clePrivee/i;
  for (const f of [`${ZONE}/cockpit.ts`, `${ZONE}/tableauDeBord.ts`]) assert.ok(!secret.test(code(f)), `${f} nomme un secret`);
  const m = mondes.normal;
  const c = L.cockpitDuClient({ aujourdhui: m.contexte.aujourdhui, abonnements: m.abonnements, paiements: m.paiements, clients: m.clients, factures: m.factures, tickets: m.tickets, connecteurs: m.connecteurs });
  assert.ok(!secret.test(JSON.stringify(c)), 'la sortie du cockpit contient un mot de secret');
  // Les connecteurs n'entrent que par leur nom et leur état affiché.
  assert.deepEqual(Object.keys(c.sources[0] ?? { nom: 1, etat: 1 }).sort(), ['etat', 'nom']);
});

/* ── 3. Projets, habitudes, rappels, planning, kanban ───────────────────── */
console.log('\nLOT-01 — projets, habitudes, rappels, planning, kanban\n');

await dit('MJ01 : l’avancement et le statut calculés égalent ceux de SIM pour chaque projet de chaque monde', () => {
  let compte = 0;
  for (const [nom, m] of tousLesMondes) {
    for (const p of m.projets) {
      const c = L.projetCalcule({ id: p.id, avancementManuel: p.avancementManuel, deadline: p.deadline }, m.taches, m.contexte.aujourdhui);
      assert.equal(c.avancement, avancementProjet(p, m.taches), `${nom} ${p.id} avancement`);
      assert.equal(c.statut, p.status, `${nom} ${p.id} statut stocké`);
      compte += 1;
    }
  }
  assert.ok(compte > 20, `${compte} projets lus seulement`);
});

await dit('MJ01 : l’ordre exact des statuts (Terminé, En retard, Presque fini, À démarrer, En cours)', () => {
  const s = (av: number, dl: string, commence = true) => L.statutDuProjet(av, dl, '2026-10-30', commence);
  assert.equal(s(100, '2026-01-01'), 'Terminé', 'terminé avant tout, même échéance dépassée');
  assert.equal(s(90, '2026-10-29'), 'En retard');
  assert.equal(s(85, '2026-10-30'), 'Presque fini');
  assert.equal(s(20, '2026-12-01'), 'À démarrer');
  assert.equal(s(50, '2026-12-01', false), 'À démarrer', 'aucune tâche commencée');
  assert.equal(s(50, '2026-12-01'), 'En cours');
  assert.equal(L.avancementDuProjet({ id: 'p', avancementManuel: 40 }, []), 40, 'sans tâche : la saisie manuelle');
  assert.equal(L.avancementDuProjet({ id: 'p', avancementManuel: null }, []), 0);
});

await dit('MJ01 : SIM et le lot ont les mêmes fonctions de statut sur une grille de cas', () => {
  for (const av of [0, 20, 21, 50, 84, 85, 99, 100]) {
    for (const dl of ['2026-10-29', '2026-10-30', '2026-11-30']) {
      for (const c of [true, false]) assert.equal(L.statutDuProjet(av, dl, '2026-10-30', c), statutProjet(av, dl, '2026-10-30', c), `${av} ${dl} ${c}`);
    }
  }
});

await dit('MJ02 : série, taux et jours prévus d’une habitude (cas écrits à la main)', () => {
  const histo = (jours: string[], v = 1) => Object.fromEntries(jours.map((j) => [j, v]));
  const quotidienne = { frequence: { type: 'tous les jours' }, mesure: { type: 'case' }, debut: '2026-10-01', historique: histo(['2026-10-27', '2026-10-28', '2026-10-29']) };
  const s = L.serieDHabitude(quotidienne, '2026-10-30');
  assert.deepEqual([s.serie, s.unite, s.faiteAujourdhui], [3, 'jours', false], 'aujourd’hui pas encore fait : rien ne casse');
  assert.equal(L.serieDHabitude({ ...quotidienne, historique: histo(['2026-10-27', '2026-10-29', '2026-10-30']) }, '2026-10-30').serie, 2, 'le mardi manquant casse');
  const lundi = { frequence: { type: 'jours choisis', jours: [1] }, mesure: { type: 'case' }, debut: '2026-09-01', historique: histo(['2026-10-12', '2026-10-19', '2026-10-26']) };
  assert.equal(L.serieDHabitude(lundi, '2026-10-30').serie, 3, 'seuls les lundis sont prévus : les autres jours ne cassent rien');
  const pas = { frequence: { type: 'tous les jours' }, mesure: { type: 'objectif', cible: 8000, unite: 'pas' }, debut: '2026-10-28', historique: { '2026-10-28': 9000, '2026-10-29': 7000 } };
  assert.equal(L.faiteCeJour(pas, '2026-10-28'), true);
  assert.equal(L.faiteCeJour(pas, '2026-10-29'), false, '7 000 pas sur 8 000 : pas atteint');
  assert.equal(L.tauxDeTenue(pas, '2026-10-30'), 0.5, 'aujourd’hui (non fait) n’est pas compté contre la personne');
  assert.equal(L.tauxDeTenue({ ...pas, debut: '2026-11-15' }, '2026-10-30'), null, 'avant son début : rien à dire');
  const sport = { frequence: { type: 'fois par semaine', fois: 3 }, mesure: { type: 'case' }, debut: '2026-09-01', historique: histo(['2026-10-12', '2026-10-14', '2026-10-16', '2026-10-19', '2026-10-21', '2026-10-23', '2026-10-27', '2026-10-28']) };
  const ss = L.serieDHabitude(sport, '2026-10-30');
  assert.deepEqual([ss.serie, ss.unite], [2, 'semaines'], 'la semaine en cours (2 sur 3) n’est pas finie : elle ne casse rien');
  assert.equal(L.prevueCeJour(sport, '2026-10-29'), true, 'quota pas atteint : prévue');
  assert.equal(L.prevueCeJour({ ...sport, historique: { ...sport.historique, '2026-10-29': 1 } }, '2026-10-30'), false, 'quota atteint : plus prévue');
});

await dit('MJ02 : sur les habitudes de SIM, la série est un entier ≥ 0 et le taux est dans [0, 1] ou nul', () => {
  let n = 0;
  for (const [nom, m] of tousLesMondes) {
    for (const h of m.habitudes) {
      const s = L.serieDHabitude(h, m.contexte.aujourdhui);
      assert.ok(Number.isInteger(s.serie) && s.serie >= 0, `${nom} ${h.id} série`);
      const t = L.tauxDeTenue(h, m.contexte.aujourdhui);
      assert.ok(t === null || (t >= 0 && t <= 1), `${nom} ${h.id} taux ${t}`);
      n += 1;
    }
  }
  assert.ok(n > 10);
});

await dit('MJ05 : un rappel passé est « à reprendre », jamais « en retard » ; il se déclenche avant son heure', () => {
  const quand = '2026-10-30T14:00:00.000Z';
  const r = { fait: false, quandAt: quand, avanceeMin: 15 };
  const ms = Date.parse(quand);
  assert.equal(L.etatDuRappel(r, ms - 60 * 60_000), 'a-venir');
  assert.equal(L.etatDuRappel(r, ms - 10 * 60_000), 'bientot');
  assert.equal(L.etatDuRappel(r, ms + 1), 'a-reprendre');
  assert.equal(L.etatDuRappel({ ...r, fait: true }, ms + 99_999_999), 'fait');
  const liste = [
    { id: 'c', fait: true, quandAt: quand, avanceeMin: 0 },
    { id: 'b', fait: false, quandAt: '2026-10-30T20:00:00.000Z', avanceeMin: 0 },
    { id: 'a', fait: false, quandAt: '2026-10-30T09:00:00.000Z', avanceeMin: 0 },
  ];
  assert.deepEqual(L.ordreDesRappels(liste, ms).map((x: any) => x.id), ['a', 'b', 'c'], 'à reprendre, à venir, fait');
});

await dit('MJ03 : « toute l’équipe » = tous les membres actifs ; les chevauchements sont des informations ; bout à bout ne chevauche pas', () => {
  const equipe = ['a@exemple.test', 'b@exemple.test', 'c@exemple.test'];
  const c1 = { id: 'c1', jour: '2026-10-30', debut: '09:00', fin: '10:00', personnes: ['b@exemple.test'], touteLEquipe: false };
  const c2 = { id: 'c2', jour: '2026-10-30', debut: '09:30', fin: '11:00', personnes: [], touteLEquipe: true };
  const c3 = { id: 'c3', jour: '2026-10-30', debut: '10:00', fin: '11:00', personnes: ['b@exemple.test'], touteLEquipe: false };
  assert.deepEqual(L.personnesDuCreneau(c2, equipe), equipe);
  assert.equal(L.seChevauchent(c1, c3), false, 'bout à bout');
  assert.equal(L.seChevauchent(c1, { ...c2, jour: '2026-10-31' }), false, 'un autre jour');
  assert.deepEqual(L.chevauchements([c1, c2, c3], equipe), [
    { email: 'b@exemple.test', creneaux: ['c1', 'c2'] },
    { email: 'b@exemple.test', creneaux: ['c2', 'c3'] },
  ]);
  for (const [nom, m] of tousLesMondes) {
    const actifs = m.equipe.filter((x: any) => x.role !== 'guest').map((x: any) => x.email);
    const ch = L.chevauchements(m.creneaux, actifs);
    for (const c of ch) assert.ok(actifs.includes(c.email), `${nom} : ${c.email} n'est pas un membre`);
  }
});

await dit('H03 : les urgentes d’abord, puis l’ordre choisi, puis l’identifiant ; une carte « Terminé » prend son jour et le perd en sortant', () => {
  const cartes = [
    { id: 'c', urgent: false, ordre: 0 },
    { id: 'b', urgent: true, ordre: 5 },
    { id: 'a', urgent: false, ordre: 0 },
    { id: 'd', urgent: true, ordre: 1 },
  ];
  assert.deepEqual(L.trierLaColonne(cartes).map((c: any) => c.id), ['d', 'b', 'a', 'c']);
  const t = { id: 't', colonne: 'en-cours', urgent: false, ordre: 2, termineLe: null };
  const fini = L.deplacer(t, 'termine', '2026-10-30', 4);
  assert.deepEqual([fini.colonne, fini.termineLe, fini.ordre], ['termine', '2026-10-30', 4]);
  const reouvert = L.deplacer(fini, 'en-revue', '2026-11-02', 1);
  assert.deepEqual([reouvert.colonne, reouvert.termineLe], ['en-revue', null]);
  assert.equal(L.deplacer(t, 'en-cours', '2026-10-30', 9), t, 'même colonne : rien ne bouge');
  const m = mondes.normal;
  for (const col of L.COLONNES_DE_TICKET) {
    const tri = L.trierLaColonne(m.tickets.filter((x: any) => x.colonne === col));
    for (let i = 1; i < tri.length; i += 1) assert.ok(Number(tri[i - 1].urgent) >= Number(tri[i].urgent), `${col} : une urgente passe après une normale`);
  }
});

/* ── 3b. H01, MJ04, L02, L03 : d'après STATUT, le code existant et les jeux de SIM ─────────── */
console.log('\nLOT-01 — calendrier (H01), notes rapides (MJ04), mode Focus (L02), rituel du matin (L03)\n');

const ev = (id: string, debut: string, fin: string, o: Record<string, unknown> = {}) => ({ id, startAt: `2026-10-30T${debut}:00.000Z`, endAt: `2026-10-30T${fin}:00.000Z`, ...o });

await dit('H01 : « n rendez-vous » ne compte ni les événements du système ni les annulés, aux quatre volumes (oracle : le filtre direct sur les jeux de SIM)', () => {
  let nonVides = 0;
  for (const [nom, m] of tousLesMondes) {
    for (const decalage of [-14, -7, -1, 0, 1, 7]) {
      const jour = L.ajouterJours(m.contexte.aujourdhui, decalage);
      const attendu = m.evenements.filter((e: any) => !e.systeme && e.status !== 'cancelled' && jourDeSim(Date.parse(e.startAt)) === jour).map((e: any) => e.id).sort();
      const calcule = L.rendezVousDuJour(m.evenements, jour);
      assert.deepEqual(calcule.map((e: any) => e.id).sort(), attendu, `${nom} ${jour}`);
      for (let i = 1; i < calcule.length; i += 1) assert.ok(Date.parse(calcule[i - 1].startAt) <= Date.parse(calcule[i].startAt), `${nom} ${jour} : ordre`);
      if (attendu.length) nonVides += 1;
    }
  }
  assert.ok(nonVides > 5, `${nonVides} jours non vides seulement`);
  assert.deepEqual(L.rendezVousDuJour([ev('a', '09:00', '10:00', { systeme: true }), ev('b', '09:00', '10:00', { status: 'cancelled' }), ev('c', '09:00', '10:00')], '2026-10-30').map((e: any) => e.id), ['c']);
});

await dit('H01 : l’état d’un événement (annulé, passé, en cours, à venir) et le prochain événement', () => {
  const e = ev('x', '10:00', '11:00');
  const t = (h: string) => Date.parse(`2026-10-30T${h}:00.000Z`);
  assert.equal(L.etatDeLEvenement(e, t('09:59')), 'a-venir');
  assert.equal(L.etatDeLEvenement(e, t('10:00')), 'en-cours', 'le début est atteint');
  assert.equal(L.etatDeLEvenement(e, t('10:59')), 'en-cours');
  assert.equal(L.etatDeLEvenement(e, t('11:00')), 'passe', 'la fin est atteinte');
  assert.equal(L.etatDeLEvenement({ ...e, status: 'cancelled' }, t('10:30')), 'annule');
  assert.equal(L.etatDeLEvenement(ev('p', '10:00', '10:00'), t('10:00')), 'passe', 'un événement sans durée est passé dès son instant');
  const liste = [ev('b', '12:00', '13:00'), ev('a', '11:30', '12:00'), ev('s', '11:15', '11:45', { systeme: true }), ev('c', '11:20', '11:40', { status: 'cancelled' })];
  assert.equal(L.prochainEvenement(liste, t('11:00')).id, 'a', 'ni le système ni l’annulé');
  assert.equal(L.prochainEvenement(liste, t('13:30')), null);
  for (const [nom, m] of tousLesMondes) {
    const maintenant = m.contexte.maintenant;
    const attendu = m.evenements.filter((x: any) => !x.systeme && x.status !== 'cancelled' && Date.parse(x.startAt) > maintenant).map((x: any) => Date.parse(x.startAt));
    const p = L.prochainEvenement(m.evenements, maintenant);
    assert.equal(p ? Date.parse(p.startAt) : null, attendu.length ? Math.min(...attendu) : null, nom);
    for (const x of m.evenements) {
      const etat = L.etatDeLEvenement(x, maintenant);
      if (x.status === 'cancelled') assert.equal(etat, 'annule');
      else assert.equal(etat, maintenant >= Date.parse(x.endAt) ? 'passe' : maintenant >= Date.parse(x.startAt) ? 'en-cours' : 'a-venir', `${nom} ${x.id}`);
    }
  }
});

await dit('H01 : les événements qui se chevauchent se partagent la largeur ; les groupes sont indépendants ; bout à bout ne chevauche pas', () => {
  const p = (liste: any[]) => Object.fromEntries(L.placerLesEvenements(liste).map((x: any) => [x.id, [x.colonne, x.colonnes]]));
  assert.deepEqual(p([ev('A', '09:00', '10:00'), ev('B', '09:30', '10:30'), ev('C', '10:00', '11:00'), ev('D', '14:00', '15:00')]), { A: [0, 2], B: [1, 2], C: [0, 2], D: [0, 1] });
  assert.deepEqual(p([ev('A', '09:00', '12:00'), ev('B', '09:00', '10:00'), ev('C', '10:00', '11:00'), ev('D', '11:00', '12:00')]), { A: [0, 2], B: [1, 2], C: [1, 2], D: [1, 2] });
  assert.deepEqual(p([ev('A', '09:00', '11:00'), ev('B', '09:00', '11:00'), ev('C', '09:00', '11:00')]), { A: [0, 3], B: [1, 3], C: [2, 3] });
  assert.deepEqual(p([ev('A', '09:00', '10:00'), ev('B', '10:00', '11:00')]), { A: [0, 1], B: [0, 1] }, 'bout à bout : chacun prend toute la largeur');
  assert.deepEqual(p([ev('P', '09:00', '09:00'), ev('Q', '09:00', '09:00')]), { P: [0, 1], Q: [0, 1] }, 'deux instants ne se chevauchent pas');
  assert.deepEqual(L.placerLesEvenements([]), []);
  // L'ordre d'arrivée ne change rien.
  const trois = [ev('A', '09:00', '10:00'), ev('B', '09:30', '10:30'), ev('C', '10:15', '11:00')];
  assert.deepEqual(p([...trois].reverse()), p(trois));
});

await dit('H01 : sur les semaines de SIM, jamais deux événements qui se chevauchent dans la même colonne, et chaque colonne existe', () => {
  let groupes = 0;
  for (const [nom, m] of tousLesMondes) {
    for (const j of L.semaineDuCalendrier(m.evenements, m.contexte.aujourdhui)) {
      const places = L.placerLesEvenements(j.evenements);
      assert.equal(places.length, j.evenements.length, `${nom} ${j.jour} : un événement a disparu`);
      const par = new Map(j.evenements.map((e: any) => [e.id, e]));
      for (const a of places) {
        assert.ok(a.colonne >= 0 && a.colonne < a.colonnes, `${nom} ${a.id}`);
        if (a.colonnes > 1) groupes += 1;
        for (const b of places) {
          if (a.id >= b.id || a.colonne !== b.colonne) continue;
          const [x, y] = [par.get(a.id) as any, par.get(b.id) as any];
          const chevauche = Date.parse(x.startAt) < Date.parse(y.endAt) && Date.parse(y.startAt) < Date.parse(x.endAt);
          assert.ok(!chevauche, `${nom} ${j.jour} : ${a.id} et ${b.id} se chevauchent dans la colonne ${a.colonne}`);
        }
      }
    }
  }
  assert.ok(groupes >= 0);
});

await dit('H01 : la semaine (lundi à dimanche, annulés et système visibles) et la grille du mois (de 4 à 6 semaines complètes)', () => {
  const sem = L.semaineDuCalendrier([ev('a', '09:00', '10:00', { systeme: true }), ev('b', '09:00', '10:00', { status: 'cancelled' })], '2026-10-30');
  assert.deepEqual(sem.map((j: any) => j.jour), ['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01']);
  assert.deepEqual(sem.map((j: any) => j.jourSemaine), [1, 2, 3, 4, 5, 6, 7]);
  assert.deepEqual(sem[4].evenements.map((e: any) => e.id), ['a', 'b']);
  const oct = L.moisEnSemaines('2026-10-15');
  assert.equal(oct.length, 5);
  assert.equal(oct[0][0].jour, '2026-09-28');
  assert.deepEqual(oct[0].map((c: any) => c.dansLeMois), [false, false, false, true, true, true, true]);
  assert.equal(oct[4][6].jour, '2026-11-01');
  assert.equal(oct[4][6].dansLeMois, false);
  assert.equal(L.moisEnSemaines('2026-11-10').length, 6, 'novembre 2026 : le 30 est un lundi');
  assert.equal(L.moisEnSemaines('2027-02-10').length, 4, 'février 2027 : exactement quatre semaines');
  for (const jour of ['2026-01-15', '2026-02-15', '2026-03-15', '2026-12-15', '2028-02-15']) {
    const semaines = L.moisEnSemaines(jour);
    const jours = semaines.flat().map((c: any) => c.jour);
    assert.ok(semaines.length >= 4 && semaines.length <= 6, jour);
    assert.equal(L.jourSemaineIso(jours[0]), 1);
    assert.equal(jours.filter((j: string) => j.startsWith(jour.slice(0, 7))).length, new Date(Number(jour.slice(0, 4)), Number(jour.slice(5, 7)), 0).getDate(), `${jour} : tous les jours du mois`);
  }
});

const note = (id: string, o: Record<string, unknown> = {}) => ({ id, title: 'Titre', body: 'Corps de la note', authorEmail: 'a@exemple.test', pinned: false, updatedAt: '2026-10-29T10:00:00.000Z', etiquette: null, visibilite: 'privée', clientId: null, tacheId: null, projectId: null, nonLue: false, ...o });

await dit('MJ04 : la visibilité — privée et « personnes choisies » à leur auteur seulement, équipe à tous', () => {
  assert.equal(L.noteVisiblePar(note('n'), 'a@exemple.test'), true);
  assert.equal(L.noteVisiblePar(note('n'), 'b@exemple.test'), false);
  assert.equal(L.noteVisiblePar(note('n', { visibilite: 'équipe' }), 'b@exemple.test'), true);
  assert.equal(L.noteVisiblePar(note('n', { visibilite: 'personnes choisies' }), 'b@exemple.test'), false, 'la liste des personnes n’existe pas encore : on ne divulgue rien');
  assert.equal(L.noteVisiblePar(note('n', { visibilite: 'personnes choisies' }), 'a@exemple.test'), true);
});

await dit('MJ04 : tri (épinglées, puis récentes, puis identifiant), recherche sans accents ni majuscules, filtres, étiquettes', () => {
  const notes = [
    note('c', { updatedAt: '2026-10-20T10:00:00.000Z', title: 'Réunion équipe', etiquette: 'équipe', visibilite: 'équipe' }),
    note('b', { updatedAt: '2026-10-29T10:00:00.000Z', etiquette: 'commercial', nonLue: true }),
    note('a', { updatedAt: '2026-10-29T10:00:00.000Z', etiquette: 'commercial' }),
    note('z', { updatedAt: '2026-01-01T10:00:00.000Z', pinned: true, body: 'Une idée de CAFÉ' }),
    note('e', { authorEmail: 'b@exemple.test', visibilite: 'privée' }),
  ];
  const moi = 'a@exemple.test';
  assert.deepEqual(L.notesAffichees(notes, moi).map((n: any) => n.id), ['z', 'a', 'b', 'c'], 'épinglée, puis égalité de date par identifiant, puis plus ancienne ; la note privée d’un autre est absente');
  assert.deepEqual(L.notesAffichees(notes, moi, { recherche: 'reunion' }).map((n: any) => n.id), ['c'], 'accents et majuscules');
  assert.deepEqual(L.notesAffichees(notes, moi, { recherche: ' CAFE ' }).map((n: any) => n.id), ['z'], 'dans le corps aussi');
  assert.deepEqual(L.notesAffichees(notes, moi, { etiquette: 'commercial' }).map((n: any) => n.id), ['a', 'b']);
  assert.deepEqual(L.notesAffichees(notes, moi, { nonLues: true }).map((n: any) => n.id), ['b']);
  assert.deepEqual(L.notesAffichees(notes, 'b@exemple.test').map((n: any) => n.id), ['e', 'c'], 'un autre membre ne voit que l’équipe et les siennes');
  assert.deepEqual(L.etiquettesDesNotes(notes), [{ etiquette: 'commercial', nombre: 2 }, { etiquette: 'équipe', nombre: 1 }]);
  assert.equal(L.nonLues(notes, moi), 1);
});

await dit('MJ04 : « sans place » (ni client, ni tâche, ni projet) et l’aperçu', () => {
  const ns = [note('1'), note('2', { clientId: 4 }), note('3', { tacheId: 't-1' }), note('4', { projectId: 'p-1' }), note('5', { projectId: undefined })];
  assert.deepEqual(L.notesSansPlace(ns).map((n: any) => n.id), ['1', '5']);
  assert.equal(L.apercuDeNote('Première ligne\nDeuxième'), 'Première ligne');
  assert.equal(L.apercuDeNote('x'.repeat(100)).length, 70);
  assert.ok(L.apercuDeNote('x'.repeat(100)).endsWith('…'));
});

await dit('MJ04 : sur les notes de SIM — chaque note affichée est permise, l’ordre tient, et rien n’est perdu entre « avec » et « sans place »', () => {
  for (const [nom, m] of tousLesMondes) {
    const moiEmail = moi(m.equipe).email;
    const autre = m.equipe.find((x: any) => x.email !== moiEmail)?.email ?? 'autre@exemple.test';
    for (const email of [moiEmail, autre]) {
      const vues = L.notesAffichees(m.notes, email);
      for (const n of vues) assert.ok(n.visibilite === 'équipe' || n.authorEmail === email, `${nom} ${n.id} : visible à tort par ${email}`);
      for (let i = 1; i < vues.length; i += 1) {
        const [a, b] = [vues[i - 1], vues[i]];
        assert.ok(Number(a.pinned) > Number(b.pinned) || (a.pinned === b.pinned && a.updatedAt >= b.updatedAt), `${nom} : ordre`);
      }
    }
    const sans = L.notesSansPlace(m.notes).length;
    const avec = m.notes.filter((n: any) => n.clientId !== null || n.tacheId !== null || n.projectId).length;
    assert.equal(sans + avec, m.notes.length, nom);
  }
});

await dit('L02 : les règles du Pomodoro existant — trois durées, pause de 5 min, pause longue de 15 min à la quatrième séance', () => {
  assert.deepEqual([...L.DUREES_DE_SEANCE], [15, 25, 35, 45, 50, 90]);
  assert.deepEqual([L.DUREE_PAR_DEFAUT, L.PAUSE_MIN, L.PAUSE_LONGUE_MIN, L.SEANCES_PAR_CYCLE], [25, 5, 15, 4]);
  assert.equal(L.nouveauFocus(40).dureeSeanceMin, 25, 'une durée inconnue retombe sur 25');
  assert.equal(L.nouveauFocus(50).dureeSeanceMin, 50);
  const MIN = 60_000;
  let f = L.nouveauFocus(25);
  const t0 = 1_000_000;
  const vus: string[] = [];
  for (let i = 1; i <= 5; i += 1) {
    f = L.lancer(f, t0);
    assert.ok(L.phaseTerminee(f, t0 + 25 * MIN), 'la séance finit au bout de 25 minutes');
    const suite = L.phaseSuivante(f);
    assert.equal(suite.seanceTerminee, true);
    f = suite.focus;
    vus.push(`${f.phase}:${f.rang}`);
    const retour = L.phaseSuivante({ ...f, reprisA: t0 });
    assert.equal(retour.seanceTerminee, false, 'la fin d’une pause ne fabrique pas de séance');
    f = retour.focus;
  }
  assert.deepEqual(vus, ['pause:1', 'pause:2', 'pause:3', 'pauseLongue:0', 'pause:1'], 'la quatrième ouvre la pause longue et le cycle repart');
});

await dit('L02 : le temps se déduit des instants — pause, reprise, veille de l’ordinateur, jamais négatif', () => {
  const MIN = 60_000;
  const t0 = 5_000_000;
  let f = L.lancer(L.nouveauFocus(25), t0);
  assert.equal(L.restantMs(f, t0), 25 * MIN);
  assert.equal(L.restantMs(f, t0 + 10 * MIN), 15 * MIN);
  f = L.mettreEnPause(f, t0 + 10 * MIN);
  assert.equal(L.enMarche(f), false);
  assert.equal(L.restantMs(f, t0 + 90 * MIN), 15 * MIN, 'en pause, le temps ne passe pas');
  assert.equal(L.mettreEnPause(f, t0 + 99 * MIN), f, 'une pause déjà en pause ne change rien');
  f = L.lancer(f, t0 + 30 * MIN);
  assert.equal(L.restantMs(f, t0 + 30 * MIN), 15 * MIN);
  assert.equal(L.lancer(f, t0 + 31 * MIN), f, 'déjà en marche : sans effet');
  assert.equal(L.restantMs(f, t0 + 45 * MIN), 0);
  assert.equal(L.phaseTerminee(f, t0 + 45 * MIN), true);
  assert.equal(L.restantMs(f, t0 + 600 * MIN), 0, 'après une longue veille : 0, jamais négatif');
  assert.equal(L.progression(f, t0 + 600 * MIN), 1);
  assert.equal(L.progression(L.nouveauFocus(25), t0), 0);
  assert.equal(L.restantMs(L.lancer(L.nouveauFocus(25), t0 + 5000), t0), 25 * MIN, 'une horloge qui recule ne fait pas gagner de temps');
});

await dit('L02 : le cadran (arrondi vers le haut), les durées figées une fois commencé, l’abandon (le cycle repart, rien ne se perd)', () => {
  const MIN = 60_000;
  const f0 = L.nouveauFocus(25);
  assert.equal(L.restantEnTexte(f0, 0), '25:00');
  assert.equal(L.restantEnTexte(L.lancer(f0, 0), 1), '25:00', 'une milliseconde après le départ : toujours 25:00');
  assert.equal(L.restantEnTexte(L.lancer(f0, 0), 25 * MIN - 1), '00:01');
  assert.equal(L.restantEnTexte(L.lancer(f0, 0), 25 * MIN), '00:00');
  assert.equal(L.choisirLaDuree(f0, 50).dureeSeanceMin, 50);
  assert.equal(L.choisirLaDuree(f0, 33).dureeSeanceMin, 25, 'seulement parmi les six durées (fiche L02)');
  assert.equal(L.choisirLaDuree(L.lancer(f0, 0), 50).dureeSeanceMin, 25, 'pas en cours de séance');
  const enPause = { ...L.phaseSuivante({ ...f0, rang: 1 }).focus };
  assert.equal(L.choisirLaDuree(enPause, 50), enPause, 'pas pendant une pause');
  const milieu = L.mettreEnPause(L.lancer({ ...f0, rang: 2 }, 0), 7 * MIN);
  const abandon = L.abandonner(milieu);
  assert.deepEqual([abandon.phase, abandon.rang, abandon.ecouleMs, abandon.reprisA, abandon.dureeSeanceMin], ['travail', 0, 0, null, 25], 'le cycle reprend à la première, la durée choisie reste');
  assert.deepEqual(L.seancesDuJour([{ startedAt: '2026-10-30T08:00:00.000Z', minutes: 25 }, { startedAt: '2026-10-30T09:00:00.000Z', minutes: 50 }, { startedAt: '2026-10-29T08:00:00.000Z', minutes: 25 }], '2026-10-30'), { nombre: 2, minutes: 75 });
  assert.deepEqual(L.seancesDuJour([], '2026-10-30'), { nombre: 0, minutes: 0 });
});

await dit('L03 : la salutation suit l’heure (matin dès 5 h, après-midi dès 12 h, soir dès 18 h, la nuit se salue « bonsoir »)', () => {
  const m = (h: number) => L.momentDeLaJournee(h);
  assert.deepEqual([4, 5, 11, 12, 17, 18, 23, 0, 3].map(m), ['soir', 'matin', 'matin', 'apres-midi', 'apres-midi', 'soir', 'soir', 'soir', 'soir']);
  assert.equal(m(29), 'matin', 'une heure hors bornes est ramenée à 0–23 (29 h = 5 h)');
  assert.equal(m(-1), 'soir', '−1 h = 23 h');
});

const sourcesRituel = (o: Record<string, unknown> = {}) => ({ heure: 8, priorites: { choisies: 0 }, rendezVous: 2, enAttente: { rappels: 0, urgents: 0 }, etapesPassees: [], fermeAujourdhui: false, ...o });

await dit('L03 : les étapes, la reprise « là où l’on s’était arrêté », l’étape absente quand rien n’attend, une seule proposition le matin', () => {
  const r0 = L.rituelDuMatin(sourcesRituel());
  assert.deepEqual(r0.etapes.map((e: any) => [e.cle, e.fait, e.nombre]), [['priorites', false, 0], ['agenda', false, 2]]);
  assert.deepEqual([r0.faites, r0.total, r0.termine, r0.reprise, r0.aProposer], [0, 2, false, 'priorites', true]);
  const r1 = L.rituelDuMatin(sourcesRituel({ priorites: { choisies: 3 } }));
  assert.deepEqual([r1.faites, r1.reprise], [1, 'agenda'], 'les priorités choisies comptent d’elles-mêmes : on reprend à l’étape suivante');
  const r2 = L.rituelDuMatin(sourcesRituel({ priorites: { choisies: 1 }, etapesPassees: ['agenda'] }));
  assert.deepEqual([r2.termine, r2.reprise, r2.aProposer], [true, null, false], 'fini : plus proposé');
  const r3 = L.rituelDuMatin(sourcesRituel({ enAttente: { rappels: 2, urgents: 1 } }));
  assert.deepEqual(r3.etapes.map((e: any) => e.cle), ['priorites', 'agenda', 'a-reprendre']);
  assert.equal(r3.etapes[2].nombre, 3);
  assert.equal(L.rituelDuMatin(sourcesRituel({ heure: 14 })).aProposer, false, 'jamais l’après-midi');
  assert.equal(L.rituelDuMatin(sourcesRituel({ fermeAujourdhui: true })).aProposer, false, 'il n’insiste pas après avoir été fermé');
  assert.equal(L.rituelDuMatin(sourcesRituel({ priorites: { choisies: 9 } })).etapes[0].nombre, 3, 'au plus 3 priorités');
  assert.equal(L.rituelDuMatin(sourcesRituel({ priorites: { choisies: 1 }, etapesPassees: ['agenda'], enAttente: { rappels: 1, urgents: 0 } })).reprise, 'a-reprendre');
});

await dit('H01, MJ04, L02, L03 : leurs phrases tutoient et ne reprochent rien', () => {
  const t = [
    L.libelleDEtatDEvenement('fr', 'en-cours'),
    L.phraseDeRendezVous('fr', 1),
    L.phraseDeRendezVous('fr', 3),
    L.direCompte('fr', 'notes.sansPlace', 1),
    L.direCompte('fr', 'notes.sansPlace', 4),
    L.libelleDePhase('fr', 'pauseLongue'),
    L.phraseDeCycle('fr', { phase: 'travail', rang: 1 }),
    L.phraseDeCycle('fr', { phase: 'pause', rang: 2 }),
    L.phraseDeCycle('fr', { phase: 'pauseLongue', rang: 0 }),
    L.phraseDeFinDePhase('fr', 'travail'),
    L.phraseDeFinDePhase('fr', 'pause'),
    L.phraseDAbandon('fr'),
    L.direCompte('fr', 'focus.jour', 2, { minutes: 75 }),
    L.phraseDeSalutation('fr', 'matin', 'Aaron'),
    L.phraseDeSalutation('fr', 'soir', 'Aaron'),
    L.phraseDeReprise('fr', { reprise: 'agenda' }),
    L.phraseDeReprise('fr', { reprise: null }),
  ];
  assert.deepEqual(t, [
    'En cours', '1 rendez-vous', '3 rendez-vous',
    '1 note rapide n’a pas encore de place.', '4 notes rapides n’ont pas encore de place.',
    'Pause longue', 'Séance 2 sur 4', 'Séance 2 sur 4', 'Séance 4 sur 4',
    'Séance terminée. Souffle un peu.', 'Pause terminée. On y retourne quand tu veux.', 'Séance arrêtée. Tout est gardé.',
    '2 séances aujourd’hui · 75 min',
    'Bonjour Aaron', 'Bonsoir Aaron',
    'On reprend là où tu t’étais arrêté : Regarde ta journée', 'Ta journée est prête.',
  ]);
});

/* ── 3c. H25 : la grille du tableau de bord ─────────────────────────────── */
console.log('\nLOT-01 — grille du tableau de bord (H25)\n');

const wd = (id: string, colonne: number, rangee: number, largeur: number, hauteur: number) => ({ id, contenu: id, type: 'note', colonne, rangee, largeur, hauteur });

await dit('H25 : un widget ne chevauche jamais un autre, quoi qu’on pose ; les voisins descendent', () => {
  const base = [wd('a', 1, 1, 3, 2), wd('b', 4, 1, 3, 2), wd('c', 1, 3, 6, 1)];
  const apres = G.deplacer(base, 'c', 2, 1);
  for (const x of apres) for (const y of apres) assert.ok(!G.chevauche(x, y), `${x.id} / ${y.id}`);
  assert.equal(apres.find((w: any) => w.id === 'c').rangee, 1);
  assert.ok(apres.find((w: any) => w.id === 'a').rangee > 1, 'le voisin descend');
  const agrandi = G.redimensionner(base, 'a', 6, 3);
  for (const x of agrandi) for (const y of agrandi) assert.ok(!G.chevauche(x, y));
  assert.deepEqual(agrandi.find((w: any) => w.id === 'a'), { ...base[0], largeur: 6, hauteur: 3, colonne: 1, rangee: 1 });
});

await dit('H25 : tailles de 1 × 1 à 6 × 3, colonnes de 1 à 6, jamais hors de la grille', () => {
  const w = G.borne(wd('x', 9, 0, 12, 7));
  assert.equal(w.largeur, 6); assert.equal(w.hauteur, 3); assert.equal(w.colonne, 1); assert.equal(w.rangee, 1);
  const p = G.borne(wd('y', 6, 2, 3, 1));
  assert.equal(p.colonne, 4, 'un widget de 3 colonnes ne déborde pas à droite');
  assert.equal(G.borne(wd('z', 1, 1, 0, 0)).largeur, 1);
});

await dit('H25 : l’ajout prend la première case libre, la copie une autre, le retrait ne laisse aucun recouvrement ; le même résultat à chaque fois', () => {
  const base = [wd('a', 1, 1, 3, 2), wd('b', 4, 1, 3, 1)];
  assert.deepEqual(G.premierEmplacement(base, 3, 1), { colonne: 4, rangee: 2 });
  assert.deepEqual(G.premierEmplacement(base, 4, 1), { colonne: 1, rangee: 3 });
  const plus = G.ajouter(base, { contenu: 'note', type: 'note', largeur: 3, hauteur: 1 });
  assert.equal(plus.length, 3);
  assert.deepEqual(G.ajouter(base, { contenu: 'note', type: 'note', largeur: 3, hauteur: 1 }), plus, 'déterministe');
  assert.equal(new Set(plus.map((w: any) => w.id)).size, 3, 'identifiants distincts');
  const copie = G.dupliquer(plus, 'a');
  assert.equal(copie.length, 4);
  assert.equal(G.retirer(copie, 'a').length, 3);
  assert.equal(G.rangeesUtilisees([]), 0);
  assert.equal(G.reperDeTaille({ largeur: 2, hauteur: 1 }), '2 × 1');
});

await dit('H25 : neuf types de widgets, la disposition ne porte ni clé ni valeur', () => {
  assert.equal(G.TYPES_DE_WIDGET.length, 9);
  assert.ok(!/(secret|token|cle|apikey|password)/i.test(JSON.stringify(G.ajouter([], { contenu: 'ca', type: 'chiffre', largeur: 3, hauteur: 2, source: 'Stripe' }))));
});

/* ── 3d. H02 : la matrice des tâches ─────────────────────────────────────── */
console.log('\nLOT-01 — matrice des tâches (H02)\n');

const VEN = '2026-10-30';
const tc = (id: string, o: Record<string, unknown> = {}) => ({ id, titre: id, echeance: null, creeLe: `2026-10-0${id.length}`, ...o });

await dit('H02 : quatre cases — urgent + important, important, urgent, ni l’un ni l’autre ; une case choisie à la main est gardée', () => {
  assert.equal(MX.caseDe(tc('a', { urgente: true, importante: true }), VEN), 'maintenant');
  assert.equal(MX.caseDe(tc('b', { importante: true }), VEN), 'planifier');
  assert.equal(MX.caseDe(tc('c', { urgente: true }), VEN), 'deleguer');
  assert.equal(MX.caseDe(tc('d'), VEN), 'alleger');
  assert.equal(MX.caseDe(tc('e', { echeance: '2026-10-28', importante: true }), VEN), 'maintenant', 'en retard : urgent');
  assert.equal(MX.caseDe(tc('f', { echeance: VEN }), VEN), 'deleguer', 'pour aujourd’hui : urgent');
  assert.equal(MX.caseDe(tc('g', { echeance: '2026-11-02', importante: true }), VEN), 'planifier', 'un vendredi, le lundi n’est pas urgent');
  assert.equal(MX.caseDe(tc('h', { echeance: '2026-11-02', importante: true }), '2026-10-31'), 'maintenant', 'un samedi, le lundi est le prochain jour ouvré');
  assert.equal(MX.caseDe(tc('i', { echeance: '2026-10-20', choix: { urgent: false, important: false } }), VEN), 'alleger', 'le choix de la personne gagne');
});

await dit('H02 : tri d’une case (en retard, échéance, création), compteurs d’en-tête, « dont n en retard »', () => {
  const taches = [tc('z', { echeance: '2026-11-03' }), tc('y', { echeance: '2026-10-29' }), tc('x', { echeance: '2026-10-28' }), tc('w')];
  assert.deepEqual(MX.trierLaCase(taches, VEN).map((t: any) => t.id), ['x', 'y', 'z', 'w']);
  const m = MX.matrice([...taches, tc('fait', { faite: true, urgente: true })], VEN);
  assert.equal(m.ouvertes, 4);
  assert.equal(m.enRetard, 2);
  assert.equal(m.cases.deleguer.ouvertes, 2);
  assert.equal(m.cases.deleguer.enRetard, 2);
  assert.equal(m.cases.alleger.ouvertes, 2);
});

await dit('H02 : l’ajout rapide comprend la date, l’heure, la personne, l’étiquette, urgent, important ; le reste est le titre', () => {
  const a = MX.analyserLaSaisie('Appeler Menna lundi 10 h, important', VEN);
  assert.deepEqual({ ...a }, { titre: 'Appeler Menna', echeance: '2026-11-02', heure: '10:00', personne: null, etiquette: null, urgent: false, important: true, case: 'planifier' });
  const b = MX.analyserLaSaisie('Envoyer le devis demain à 9h30 @Mohamed #facturation !', VEN);
  assert.deepEqual({ ...b }, { titre: 'Envoyer le devis', echeance: '2026-10-31', heure: '09:30', personne: 'Mohamed', etiquette: 'facturation', urgent: true, important: false, case: 'deleguer' });
  assert.equal(MX.analyserLaSaisie('Relire le contrat le 12', VEN).echeance, '2026-11-12');
  assert.equal(MX.analyserLaSaisie('Relire le contrat le 12', '2026-10-05').echeance, '2026-10-12');
  assert.equal(MX.analyserLaSaisie('Rien de reconnu ici', VEN).titre, 'Rien de reconnu ici');
  assert.equal(MX.analyserLaSaisie('vendredi', VEN).echeance, '2026-11-06', 'le jour de la semaine est le prochain, jamais aujourd’hui');
  assert.equal(MX.analyserLaSaisie('', VEN).titre, '');
});

await dit('H02 : « 5 sur 8 fait » — plus que n, journée finie, bouclée ; le plus grand temps libre du matin', () => {
  assert.deepEqual(MX.phraseDeLaJourneeDeTaches(5, 8, 6, false), { type: 'plus-que', restantes: 3, serieSiBouclee: 7 });
  assert.deepEqual(MX.phraseDeLaJourneeDeTaches(5, 8, 6, true), { type: 'finie' });
  assert.deepEqual(MX.phraseDeLaJourneeDeTaches(8, 8, 6, false), { type: 'bouclee' });
  assert.deepEqual(MX.phraseDeLaJourneeDeTaches(0, 0, 0, false), { type: 'rien' });
  assert.equal(MX.plusGrandTempsLibre([{ debut: 9, fin: 9.5 }]), 2.5);
  assert.equal(MX.plusGrandTempsLibre([]), 4);
  assert.equal(MX.plusGrandTempsLibre([{ debut: 8, fin: 12 }]), 0);
});

/* ── 3e. L01 : l'escalier, les rails, les médailles ──────────────────────── */
console.log('\nLOT-01 — escalier, rails et médailles (L01)\n');

await dit('L01 : l’escalier — départ, paliers parcourus, position, badge de 7 jours, jours jusqu’au prochain palier, paliers à venir ; jamais décroissant', () => {
  const n = ES.noeudsDeLEscalier(6, 21);
  assert.deepEqual(n.map((x: any) => `${x.jours}:${x.etat}`), ['0:parcouru', '5:parcouru', '6:ici', '7:badge', '8:pas', '9:pas', '10:prochain', '20:avenir', '30:avenir', '50:avenir', '100:avenir', '200:avenir', '365:avenir']);
  for (let i = 1; i < n.length; i += 1) assert.ok(n[i].jours >= n[i - 1].jours, 'ordre croissant');
  const sans = ES.noeudsDeLEscalier(0, 0);
  assert.equal(sans[0].genre, 'depart');
  assert.ok(sans.some((x: any) => x.jours === 5 && x.etat === 'prochain'));
  const haut = ES.noeudsDeLEscalier(400, 400);
  assert.equal(haut.filter((x: any) => x.etat === 'avenir' || x.etat === 'prochain').length, 0, 'au-delà du dernier : rien à venir');
  assert.equal(ES.palierDuRecord(21), 20);
  assert.equal(ES.palierDuRecord(3), null);
});

await dit('L01 : un rail — marques atteintes, prochaine, ce qu’il reste ; jamais « raté »', () => {
  const r = ES.railDeCompteur(87, ES.MARQUES_TACHES);
  assert.deepEqual(r.marques.map((m: any) => m.etat), ['atteinte', 'atteinte', 'prochaine', 'avenir']);
  assert.equal(r.prochaine, 100); assert.equal(r.reste, 13);
  assert.ok(r.progression > 0.7 && r.progression < 0.8);
  assert.equal(ES.railDeCompteur(4, ES.MARQUES_BOITE_A_ZERO).reste, 1);
  assert.equal(ES.railDeCompteur(14, ES.MARQUES_RITUELS).prochaine, 20);
  assert.equal(ES.railDeCompteur(999, ES.MARQUES_TACHES).prochaine, null);
  assert.equal(ES.railDeCompteur(-3, ES.MARQUES_TACHES).valeur, 0);
});

await dit('L01 : une médaille obtenue le reste ; sinon « à gagner » ; « n sur N obtenus »', () => {
  assert.equal(ES.etatDeMedaille('2026-03-12'), 'obtenue');
  assert.equal(ES.etatDeMedaille(null), 'a-gagner');
  assert.deepEqual(ES.medaillesObtenues([{ obtenueLe: 'x' }, { obtenueLe: null }, { obtenueLe: 'y' }]), { obtenues: 2, total: 3 });
});

/* ── 3f. L03 : le rituel du matin ────────────────────────────────────────── */
console.log('\nLOT-01 — rituel du matin (L03)\n');

await dit('L03 : une seule étape ouverte ; « Continuer » replie et ouvre la suivante ; « Revoir » rouvre sans perdre ; une étape à venir n’est pas cliquable', () => {
  let p = MT.parcoursInitial();
  assert.deepEqual([p.ouverte, MT.estCliquable(p, 0), MT.estCliquable(p, 1)], [0, true, false]);
  p = MT.continuer(p, 4);
  p = MT.continuer(p, 4);
  assert.deepEqual([p.ouverte, [...p.faites]], [2, [0, 1]]);
  assert.deepEqual(MT.segments(p, 4), ['fait', 'fait', 'en-cours', 'a-venir']);
  const v = MT.revoir(p, 0);
  assert.equal(v.ouverte, 0, 'une étape faite se rouvre');
  assert.equal(MT.continuer(v, 4).ouverte, 2, 'on reprend à la première étape pas faite');
  assert.equal(MT.revoir(p, 3), p, 'une étape à venir ne s’ouvre pas');
  assert.equal(MT.retour(MT.parcoursInitial()).ouverte, 0);
  assert.equal(MT.retour(p).ouverte, 1);
});

await dit('L03 : « encore une minute » est une estimation arrondie, jamais un compte à rebours ; sans le droit « argent », trois étapes', () => {
  const trois = { ouverte: 3, faites: [0, 1, 2], termine: false };
  assert.equal(MT.minutesEstimees(trois, 4), 1);
  assert.equal(MT.minutesEstimees(MT.parcoursInitial(), 4), 3);
  assert.equal(MT.minutesEstimees({ ...trois, termine: true }, 4), null);
  assert.deepEqual(MT.etapesVisibles({ argent: false }), ['nuit', 'agenda', 'choses']);
  assert.equal(MT.etapesVisibles({ argent: true }).length, 4);
});

await dit('L03 : les candidates se trient urgentes, dues aujourd’hui, client ou argent sous 2 jours, en retard, puis le reste ; 3 présélectionnées, 3 autres, jamais plus de 12', () => {
  const c = (id: string, o: object = {}) => ({ id, titre: id, urgente: false, categorie: null, dureeMin: null, echeance: null, contexte: null, ordre: id, ...o });
  const j = '2026-10-30';
  const cs = [
    c('reste'), c('retard', { echeance: { jour: '2026-10-28', heure: null } }), c('argent2j', { categorie: 'Argent', echeance: { jour: '2026-11-01', heure: null } }),
    c('auj-14', { echeance: { jour: j, heure: '14:00' } }), c('auj-10', { echeance: { jour: j, heure: '10:00' } }), c('urgente', { urgente: true }),
  ];
  assert.deepEqual(MT.trierLesCandidates(cs, j).map((x: any) => x.id), ['urgente', 'auj-10', 'auj-14', 'argent2j', 'retard', 'reste']);
  const p = MT.preselection(cs, j);
  assert.deepEqual([p.choisies.length, p.autres.length, p.reste], [3, 3, 0]);
  const beaucoup = Array.from({ length: 20 }, (_, i) => c(`t${String(i).padStart(2, '0')}`));
  assert.equal(MT.preselection(beaucoup, j).reste, 14);
  assert.equal(MT.groupeDeTri(c('x', { categorie: 'Projet', echeance: { jour: '2026-11-01', heure: null } }), j), 5, 'sous 2 jours : seulement client ou argent');
});

await dit('L03 : étiquette et échéance — « Urgent » prime sur la catégorie ; « avant 17:00 », « ce soir », « lun. », « 12 nov. »', () => {
  assert.deepEqual(MT.etiquetteDe({ urgente: true, categorie: 'Argent' }), { type: 'urgent' });
  assert.deepEqual(MT.etiquetteDe({ urgente: false, categorie: 'Client' }), { type: 'categorie', texte: 'Client' });
  assert.equal(MT.etiquetteDe({ urgente: false, categorie: null }), null);
  const j = '2026-10-30';
  assert.deepEqual(MT.echeanceEnTexte({ jour: j, heure: '17:00' }, j), { type: 'avant', heure: '17:00' });
  assert.deepEqual(MT.echeanceEnTexte({ jour: j, heure: null }, j), { type: 'ce-soir' });
  assert.equal(MT.echeanceEnTexte({ jour: '2026-11-02', heure: null }, j).type, 'jour-court');
  assert.equal(MT.echeanceEnTexte({ jour: '2026-11-12', heure: null }, j).type, 'date');
  assert.equal(MT.echeanceEnTexte(null, j).type, 'aucune');
});

await dit('L03 : trois priorités au plus (la 4e est refusée), le rang suit l’ordre, on glisse sans toucher aux autres', () => {
  let ch: readonly string[] = [];
  for (const id of ['a', 'b', 'c']) ch = MT.choisir(ch, id).choix;
  const refus = MT.choisir(ch, 'd');
  assert.deepEqual([refus.refuse, refus.choix.length], [true, 3]);
  assert.equal(MT.choisir(ch, 'a').refuse, false, 'choisir deux fois la même ne change rien');
  assert.deepEqual(MT.deplacer(ch, 2, 0), ['c', 'a', 'b']);
  assert.deepEqual(MT.deplacer(ch, 0, 9), ['b', 'c', 'a']);
  assert.deepEqual(MT.retirer(ch, 'b'), ['a', 'c']);
  assert.deepEqual(MT.choixValides(['a', 'zzz', 'b'], [{ id: 'a' }, { id: 'b' }]), ['a', 'b']);
});

await dit('L03 : « Confier à » — le membre le moins chargé, jamais soi-même ; équipe d’une personne : personne', () => {
  const eq = [{ email: 'moi@x.fr', prenom: 'Moi', charge: 1 }, { email: 'mo@x.fr', prenom: 'Mohamed', charge: 2 }, { email: 'ri@x.fr', prenom: 'Riyad', charge: 5 }];
  assert.equal(MT.moinsCharge(eq, 'moi@x.fr').prenom, 'Mohamed');
  assert.equal(MT.moinsCharge([eq[0]], 'MOI@x.fr'), null);
});

await dit('L03 : la journée se dessine — les priorités dans les créneaux libres, dans l’ordre des rangs, avec la marge ; rien n’est enregistré', () => {
  const ev = [
    { id: 'e1', debut: 570, fin: 585, label: 'Stand-up' }, { id: 'e2', debut: 660, fin: 690, label: 'Menna' },
    { id: 'e3', debut: 840, fin: 870, label: 'Point facturation' }, { id: 'e4', debut: 960, fin: 990, label: 'Bilan' },
  ];
  const pr = [
    { id: 'p1', rang: 1, label: 'Tableau de bord', dureeMin: 75, avant: 1020 }, { id: 'p2', rang: 2, label: 'Facturation', dureeMin: 90, avant: 840 },
    { id: 'p3', rang: 3, label: 'Medina', dureeMin: 30, avant: null },
  ];
  const r = MT.journeeQuiSeDessine(MT.FENETRE_PAR_DEFAUT, ev, pr, MT.PAUSE_PAR_DEFAUT, 514);
  const de = (id: string) => r.blocs.find((b: any) => b.id === id);
  assert.deepEqual([de('p1').debut, de('p1').fin], [585, 660], 'à 08:34 le créneau avant le stand-up est trop court : après le stand-up, jusqu’à Menna');
  assert.equal(de('p2').debut, 870, 'rien d’assez long avant 14:00 : le premier créneau assez long');
  assert.equal(de('p3').debut, 990);
  assert.deepEqual([r.margeDebut, r.finPrevue], [1020, 1020]);
  assert.equal(de('marge').fin, 1140);
  assert.deepEqual(r.nonPlacees, []);
  for (const a of r.blocs.filter((b: any) => b.type === 'priorite')) for (const b of r.blocs.filter((x: any) => x.type !== 'priorite' && x.type !== 'marge')) assert.ok(a.fin <= b.debut || a.debut >= b.fin, `${a.id} ne chevauche pas ${b.id}`);
  const trop = MT.journeeQuiSeDessine({ debut: 540, fin: 600 }, [], [{ id: 'g', rang: 1, label: 'long', dureeMin: 120, avant: null }], null);
  assert.deepEqual([trop.nonPlacees, trop.margeDebut], [['g'], null]);
});

await dit('L03 : l’équilibre — repère de confort à 60 %, phrases, astuce sans durée, jamais de division par zéro', () => {
  const libre = MT.tempsLibre(MT.FENETRE_PAR_DEFAUT, [{ id: 'e', debut: 540, fin: 600, label: '' }], null);
  assert.equal(libre, 600);
  assert.equal(MT.equilibre([{ dureeMin: 75 }, { dureeMin: 90 }, { dureeMin: 30 }], 435).phrase, 'marge');
  assert.equal(MT.equilibre([{ dureeMin: 75 }, { dureeMin: 90 }, { dureeMin: 30 }], 435).totalMin, 195);
  assert.equal(MT.equilibre([{ dureeMin: 120 }, { dureeMin: 120 }], 300).phrase, 'remplie');
  assert.equal(MT.equilibre([{ dureeMin: 120 }, { dureeMin: 120 }], 240).phrase, 'depasse');
  const sans = MT.equilibre([{ dureeMin: null }, { dureeMin: null }], 400);
  assert.deepEqual([sans.totalMin, sans.phrase], [50, 'astuce']);
  assert.equal(MT.equilibre([], 0).ratio, 0);
  assert.equal(MT.equilibre([{ dureeMin: 30 }], 0).ratio, 1);
});

await dit('L03 : le brouillon est par jour (écarté le lendemain sans message) ; « reprise » seulement si la personne s’est arrêtée en route', () => {
  const b = MT.brouillonVide('2026-10-29', 'x');
  assert.equal(MT.brouillonDuJour(b, '2026-10-30', 'y').jour, '2026-10-30');
  assert.equal(MT.brouillonDuJour(b, '2026-10-29', 'y'), b);
  assert.equal(MT.reprise(b, 4), null);
  assert.equal(MT.reprise({ ...b, parcours: { ouverte: 2, faites: [0, 1], termine: false } }, 4), 3);
  assert.equal(MT.reprise({ ...b, parcours: { ouverte: 3, faites: [0, 1, 2], termine: true } }, 4), null);
});

await dit('L03 : les réglages — 08:30 du lundi au vendredi par défaut ; une valeur invalide revient au défaut', () => {
  assert.deepEqual(MT.REGLAGES_PAR_DEFAUT, { heure: '08:30', jours: [1, 2, 3, 4, 5] });
  assert.deepEqual(MT.reglagesValides({ heure: '07:15', jours: [3, 1, 1] }), { heure: '07:15', jours: [1, 3] });
  assert.deepEqual(MT.reglagesValides({ heure: '25:00', jours: [1] }), MT.REGLAGES_PAR_DEFAUT);
  assert.deepEqual(MT.reglagesValides(null), MT.REGLAGES_PAR_DEFAUT);
});

/* ── 3g. L07 : le relais, les compteurs longs, les repères du défi ───────── */
console.log('\nLOT-01 — relais et repères du défi (L07)\n');

await dit('L07 : 47 à temps sur 52 échus donnent 90 % ; les 4 en attente ne comptent ni pour ni contre ; rien d’échu : pas de pourcentage', () => {
  const sem = [
    { jour: '2026-10-26', aTemps: 9, echus: 9, enAttente: 0 }, { jour: '2026-10-27', aTemps: 10, echus: 11, enAttente: 0 }, { jour: '2026-10-28', aTemps: 9, echus: 11, enAttente: 0 },
    { jour: '2026-10-29', aTemps: 12, echus: 13, enAttente: 0 }, { jour: '2026-10-30', aTemps: 7, echus: 8, enAttente: 4 },
  ];
  const t = RL.totauxDeLaSemaine(sem);
  assert.deepEqual([t.aTemps, t.echus, t.enAttente, t.taux], [47, 52, 4, 90]);
  assert.equal(RL.tauxDeTenue(0, 0), null);
  assert.equal(RL.tauxDeTenue(9, 4), 100, 'jamais plus de 100 %');
  const r = RL.relaisDeLaSemaine(sem, '2026-10-30');
  assert.deepEqual(r.map((b: any) => b.rang), [1, 2, 3, 4, 5]);
  assert.deepEqual(r.map((b: any) => b.courant), [false, false, false, false, true]);
  assert.equal(r[3].largeur, 1, 'la plus longue barre (jeudi, 13)');
  assert.equal(Math.round(r[4].largeur * 100), Math.round((12 / 13) * 100), 'vendredi : échus 8 + en attente 4 = 12');
  assert.equal(r[1].plusTard, 1);
  assert.ok(Math.abs(r[4].parts.aTemps + r[4].parts.plusTard + r[4].parts.enAttente - 1) < 1e-9);
});

await dit('L07 : le relais ne porte aucun nom ni nombre par personne ; début de semaine : cinq barres vides, pas de division par zéro', () => {
  const r = RL.relaisDeLaSemaine([], '2026-10-26');
  assert.equal(r.length, 5);
  assert.ok(r.every((b: any) => b.largeur === 0 && b.echus === 0));
  assert.deepEqual(Object.keys(r[0]).sort(), ['aTemps', 'courant', 'echus', 'enAttente', 'jour', 'largeur', 'parts', 'plusTard', 'rang']);
});

await dit('L07 : l’encadré d’action — seulement s’il y a des éléments en attente ; « garde l’objectif » ou « rapproche »', () => {
  assert.equal(RL.phraseDActionDuRelais(0, 95, 90), null);
  assert.equal(RL.phraseDActionDuRelais(4, 90, 90), 'garde');
  assert.equal(RL.phraseDActionDuRelais(4, 80, 90), 'rapproche');
  assert.equal(RL.phraseDActionDuRelais(4, null, 90), 'rapproche');
  assert.deepEqual(RL.ageEnHeuresMinutes(80), { h: 1, m: 20 });
});

await dit('L07 : 21 jours sur 30 = 70 % et « encore 9 jours » ; 142 h sur 168 = 85 % et « plus que 26 heures » ; plafonnés à 100 %', () => {
  assert.deepEqual(RL.progressionDuCompteur(21, 30), { pct: 70, encore: 9 });
  assert.deepEqual(RL.progressionDuCompteur(45, 30), { pct: 100, encore: 0 });
  assert.deepEqual(RL.progressionDeLaDuree(142), { pct: 85, plusQue: 26 });
  assert.deepEqual(RL.progressionDeLaDuree(500), { pct: 100, plusQue: 0 });
  assert.equal(RL.heuresDepuis(null, 1000), null);
  assert.equal(RL.heuresDepuis(0, 142 * 3_600_000 + 5), 142);
});

await dit('L07 : étiquette de jour (Auj., Hier, jour abrégé, date courte) ; célébrations des 7 derniers jours', () => {
  const a = '2026-10-30';
  assert.equal(RL.etiquetteDeJour('2026-10-30', a).type, 'aujourdhui');
  assert.equal(RL.etiquetteDeJour('2026-10-29', a).type, 'hier');
  assert.equal(RL.etiquetteDeJour('2026-10-26', a).type, 'jour');
  assert.equal(RL.etiquetteDeJour('2026-10-23', a).type, 'date');
  const c = [{ id: 'a', jour: '2026-10-20' }, { id: 'b', jour: '2026-10-29' }, { id: 'c', jour: '2026-10-30' }, { id: 'd', jour: '2026-11-02' }];
  assert.deepEqual(RL.celebrationsRecentes(c, a).map((x: any) => x.id), ['c', 'b']);
});

await dit('L07 : semaine 44 = lundi 26 au vendredi 30 octobre ; la fête est le premier vendredi APRÈS la fin du défi (6 novembre)', () => {
  assert.equal(RL.numeroDeSemaine('2026-10-30'), 44);
  assert.equal(RL.numeroDeSemaine('2026-10-26'), 44);
  assert.equal(RL.vendrediDeLaSemaine('2026-10-28'), '2026-10-30');
  assert.equal(RL.vendrediDeFete('2026-10-30'), '2026-11-06');
  assert.equal(RL.vendrediDeFete('2026-10-28'), '2026-10-30');
});

await dit('L07 : « Fêtez ensemble » — défi de la semaine tenu le dernier jour, ou défi long à 70 % avec une fin connue ; sinon l’astuce', () => {
  assert.equal(RL.proposerLaFete({ principal: { taux: 91, cible: 90, dernierJour: true }, longs: [] }), true);
  assert.equal(RL.proposerLaFete({ principal: { taux: 91, cible: 90, dernierJour: false }, longs: [] }), false);
  assert.equal(RL.proposerLaFete({ principal: null, longs: [{ pct: 70, finConnue: true }] }), true);
  assert.equal(RL.proposerLaFete({ principal: null, longs: [{ pct: 70, finConnue: false }] }), false);
  assert.equal(RL.proposerLaFete({ principal: null, longs: [] }), false);
});

await dit('L07 : un engagement est une phrase de 80 caractères au plus ; un défi à un seul participant passe en pause', () => {
  assert.equal(RL.engagementValide('Je prends les messages du matin.'), true);
  assert.equal(RL.engagementValide('   '), false);
  assert.equal(RL.engagementValide('x'.repeat(81)), false);
  assert.equal(RL.defiEnPause(1), true);
  assert.equal(RL.defiEnPause(2), false);
});

/* ── 4. Les éléments ludiques protégés (L07, trophées, défis) ─────────────── */
console.log('\nLOT-01 — éléments ludiques protégés : aucun chiffre individuel, aucun classement, aucun point perdu, aucun reproche\n');

await dit('L07 : l’état d’un défi suit les règles de la fiche et égale celui de SIM, aux quatre volumes', () => {
  let n = 0;
  for (const [nom, m] of tousLesMondes) {
    for (const d of m.defis) {
      assert.equal(L.etatDuDefi(d, m.contexte.aujourdhui), d.etat, `${nom} ${d.id}`);
      n += 1;
    }
  }
  assert.ok(n >= 8, `${n} défis lus seulement`);
  const taux = { type: 'Taux de tenue', cible: 90, valeurActuelle: 95, finLe: '2026-11-01' };
  assert.equal(L.etatDuDefi(taux, '2026-10-30'), 'En cours', 'un taux de tenue se juge à la fin de sa période, même au-dessus de la cible');
  assert.equal(L.etatDuDefi(taux, '2026-11-02'), 'Tenu');
  assert.equal(L.etatDuDefi({ ...taux, valeurActuelle: 70 }, '2026-11-02'), 'Terminé', 'pas atteint : « terminé », jamais « raté »');
  assert.equal(L.etatDuDefi({ type: 'Seuil', cible: 4.5, valeurActuelle: 4.6, finLe: null }, '2026-10-30'), 'Tenu');
  assert.equal(L.etatDuDefi({ type: 'Compteur de jours', cible: 30, valeurActuelle: 12, finLe: null }, '2026-10-30'), 'En cours');
});

await dit('L07 : « zéro impayé » — les jours sans facture en retard égalent le calcul de SIM', () => {
  for (const [nom, m] of tousLesMondes) {
    assert.equal(L.joursSansImpaye(m.factures, m.contexte.aujourdhui), joursSansImpayeSim(m.factures, m.contexte.aujourdhui), nom);
  }
  const f = (due: string, paye = '') => ({ status: paye ? 'paid' : 'issued', dueAt: due, paidAt: paye });
  assert.equal(L.joursSansImpaye([], '2026-10-30'), 365, 'rien n’est dû : tout l’horizon');
  assert.equal(L.joursSansImpaye([f('2026-10-20')], '2026-10-30'), 0, 'échue le 20 et toujours due : le compte repart de zéro aujourd’hui');
  assert.equal(L.joursSansImpaye([f('2026-10-20', '2026-10-27')], '2026-10-30'), 4, 'réglée le 27 : les jours 27, 28, 29 et 30 comptent');
  assert.equal(L.joursSansImpaye([f('2026-10-20', '2026-10-22')], '2026-10-30'), 365, 'payée avant la fin de la tolérance : jamais en retard');
});

await dit('L07 : la jauge est celle de l’ÉQUIPE (valeur, cible, reste) ; elle ne dépasse pas 1 et ne descend pas sous 0', () => {
  const j = L.jaugeDuDefi({ cible: 30, valeurActuelle: 12 });
  assert.deepEqual([j.progression, j.reste, j.atteinte], [0.4, 18, false]);
  assert.deepEqual(L.jaugeDuDefi({ cible: 30, valeurActuelle: 45 }), { progression: 1, valeur: 45, cible: 30, reste: 0, atteinte: true });
  assert.equal(L.jaugeDuDefi({ cible: 4.5, valeurActuelle: 4.2 }).reste, 0.3);
  assert.equal(L.jaugeDuDefi({ cible: 0, valeurActuelle: 0 }).progression, 1);
  assert.deepEqual(Object.keys(L.jaugeDuDefi({ cible: 1, valeurActuelle: 1 })).sort(), ['atteinte', 'cible', 'progression', 'reste', 'valeur']);
});

await dit('L07 : le défi de la semaine, « Aussi en cours » (tenus compris) et la frise des défis passés', () => {
  const d = (id: string, debut: string, fin: string | null, type = 'Taux de tenue', valeur = 50, cible = 90) => ({ id, titre: id, sousLigne: '', type, source: { module: 'Facturation', indicateur: 'x' }, debutLe: debut, finLe: fin, cible, valeurActuelle: valeur, participants: [] });
  const defis = [
    d('long', '2026-10-01', null, 'Compteur de jours', 12, 30),
    d('semaine', '2026-10-26', '2026-11-01'),
    d('ancien', '2026-10-05', '2026-10-11', 'Taux de tenue', 95, 90),
    d('rate', '2026-10-12', '2026-10-18', 'Taux de tenue', 50, 90),
    d('seuil', '2026-09-30', null, 'Seuil', 4.7, 4.5),
  ];
  assert.equal(L.defiDeLaSemaine(defis, '2026-10-30').id, 'semaine', 'celui dont la période d’une semaine contient aujourd’hui');
  assert.deepEqual(L.aussiEnCours(defis, 'semaine', '2026-10-30').map((x: any) => x.id), ['long', 'seuil'], 'le défi sans fin est « tenu » et reste en cours');
  assert.deepEqual(L.friseDesDefis(defis, '2026-10-30').map((x: any) => [x.id, x.issue]), [['rate', 'Terminé'], ['ancien', 'Tenu']]);
  assert.equal(L.defiDeLaSemaine([], '2026-10-30'), null);
  assert.equal(L.defiDeLaSemaine([d('ancien', '2026-10-05', '2026-10-11')], '2026-10-30'), null, 'un défi fini n’est plus celui de la semaine');
  assert.equal(L.defiDeLaSemaine([d('long', '2026-10-01', null, 'Compteur de jours', 12, 30)], '2026-10-30').id, 'long', 'à défaut d’un défi d’une semaine, le plus récent en cours');
});

await dit('L07 : les célébrations — un défi devenu « Tenu » se fête une seule fois', () => {
  const avant = new Map([['a', 'En cours'], ['b', 'Tenu'], ['c', 'En cours']]);
  const apres = new Map([['a', 'Tenu'], ['b', 'Tenu'], ['c', 'En cours'], ['d', 'Tenu']]);
  assert.deepEqual(L.defisACelebrer(avant, apres), ['a', 'd']);
  assert.deepEqual(L.defisACelebrer(apres, apres), [], 'rien à re-fêter');
});

await dit('L07 · aucun chiffre individuel : « Ce que chacun apporte » est un engagement ÉCRIT, aucun nombre n’en sort', () => {
  const apports = L.apportsDeLEquipe(['yanis@exemple.test', 'camille@exemple.test', 'yanis@exemple.test'], [
    { email: 'camille@exemple.test', texte: '  Je relance mes trois impayés chaque lundi.  ' },
    { email: 'hors-defi@exemple.test', texte: 'Je ne participe pas.' },
  ]);
  assert.deepEqual(apports, [
    { email: 'camille@exemple.test', engagement: 'Je relance mes trois impayés chaque lundi.' },
    { email: 'yanis@exemple.test', engagement: null },
  ]);
  // Aucune valeur numérique rattachée à une personne : ni dans la structure, ni dans son type.
  for (const a of apports) for (const v of Object.values(a)) assert.ok(typeof v !== 'number', 'un nombre est rattaché à une personne');
  const src = code(`${ZONE}/defis.ts`);
  const interfaceApport = /interface ApportDeLaPersonne \{[\s\S]*?\}/.exec(src)?.[0] ?? '';
  assert.ok(interfaceApport && !/number/.test(interfaceApport), 'ApportDeLaPersonne ne porte aucun nombre');
  const interfaceEngagement = /interface Engagement \{[\s\S]*?\}/.exec(src)?.[0] ?? '';
  assert.ok(interfaceEngagement && !/number/.test(interfaceEngagement), 'Engagement ne porte aucun nombre');
});

await dit('L07 · aucun classement : l’ordre des personnes ne dépend d’aucune valeur ni de l’ordre d’arrivée', () => {
  const gens = ['d@exemple.test', 'a@exemple.test', 'c@exemple.test', 'b@exemple.test'];
  const attendu = L.apportsDeLEquipe(gens, []).map((x: any) => x.email);
  assert.deepEqual(attendu, [...gens].sort());
  // Mélange dans tous les sens, avec ou sans engagement : même ordre.
  for (const perm of [[...gens].reverse(), [gens[2], gens[0], gens[3], gens[1]], gens]) {
    assert.deepEqual(L.apportsDeLEquipe(perm, [{ email: 'd@exemple.test', texte: 'Un long engagement très détaillé' }, { email: 'a@exemple.test', texte: 'Court' }]).map((x: any) => x.email), attendu);
  }
});

await dit('L07 · aucun point perdu, aucun reproche : jamais d’état « raté », un défi tenu reste dans la frise, aucun mot de rang dans le code', () => {
  const src = code(`${ZONE}/defis.ts`) + code(`${ZONE}/serie.ts`) + code(`${ZONE}/jalons.ts`);
  const interdits = /\b(rang|rank|classement|leaderboard|podium|score|perdu|perdre|echec|échec|raté|rate|fail|failed|penalt|penalite|pénalité|honte|retard)\b/i;
  assert.ok(!interdits.test(src.replace(/'En retard'/g, '')), `mot interdit : ${interdits.exec(src)?.[0]}`);
  const etats = new Set<string>();
  for (const [, m] of tousLesMondes) {
    for (const d of m.defis) for (const valeur of [0, d.cible / 2, d.cible, d.cible * 2]) for (const decalage of [0, 10, 400]) etats.add(L.etatDuDefi({ ...d, valeurActuelle: valeur }, L.ajouterJours(m.contexte.aujourdhui, decalage)));
  }
  assert.ok([...etats].every((e) => ['En cours', 'Tenu', 'Terminé'].includes(e)), `un état inattendu : ${[...etats].join(', ')}`);
  // Un défi tenu le reste dans la frise même quand sa valeur retombe ensuite : la frise garde sa date de fin.
  const tenu = { id: 'x', titre: 'x', sousLigne: '', type: 'Taux de tenue', source: { module: 'Facturation', indicateur: 'i' }, debutLe: '2026-10-05', finLe: '2026-10-11', cible: 90, valeurActuelle: 95, participants: [] };
  assert.equal(L.friseDesDefis([tenu], '2026-10-30')[0].issue, 'Tenu');
});

await dit('L01 · aucun point perdu : une série interrompue ne retire ni palier ni record, et ne dit jamais 0 sans phrase', () => {
  const fr = (s: any) => L.phraseDeSerie('fr', s);
  assert.equal(fr({ etat: 'reprise', serie: 0 }), 'Ta série reprend aujourd’hui.');
  assert.equal(fr({ etat: 'aucune', serie: 0 }), 'Ta série commence avec ta première journée bouclée.');
  assert.equal(fr({ etat: 'en-cours', serie: 1 }), '1 jour de suite');
  assert.equal(fr({ etat: 'en-cours', serie: 12 }), '12 jours de suite');
  const j = [...['2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23'].map(bouclee)];
  const s = L.serieDeLaJournee([...j, ouverte('2026-10-26', 0)], '2026-10-30');
  assert.equal(s.etat, 'reprise');
  assert.equal(s.paliers[0].atteint, true);
});

await dit('L07 : « Proposer un défi » — titre, cible et module valides ; aucune règle cachée', () => {
  const ok = { titre: 'Zéro impayé pendant 30 jours', type: 'Compteur de jours', cible: 30, module: 'Facturation' };
  assert.deepEqual(L.verifierProposition(ok), []);
  assert.deepEqual(L.verifierProposition({ ...ok, titre: '   ' }), ['titre-vide']);
  assert.deepEqual(L.verifierProposition({ ...ok, titre: 'x'.repeat(81) }), ['titre-long']);
  assert.deepEqual(L.verifierProposition({ ...ok, cible: 0 }), ['cible-invalide']);
  assert.deepEqual(L.verifierProposition({ ...ok, type: 'Taux de tenue', cible: 120 }), ['cible-invalide'], 'un taux dépasse 100 %');
  assert.deepEqual(L.verifierProposition({ ...ok, module: 'Mots de passe' }), ['module-inconnu']);
  assert.deepEqual(L.verifierProposition({ titre: '', type: 'Seuil', cible: Number.NaN, module: '' }).sort(), ['cible-invalide', 'module-inconnu', 'titre-vide']);
});

/* ── 5. La voix ───────────────────────────────────────────────────────────── */
console.log('\nLOT-01 — les mots : tutoiement, aucun reproche, fr et en alignés\n');

const params = (t: string) => [...t.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

await dit('chaque clé a un français et un anglais, avec les mêmes paramètres', () => {
  const { fr, en } = DICO;
  assert.deepEqual(Object.keys(fr).sort(), Object.keys(en).sort());
  for (const cle of Object.keys(en)) {
    assert.ok(fr[cle].trim() && en[cle].trim(), `${cle} vide`);
    assert.deepEqual(params(fr[cle]), params(en[cle]), cle);
  }
  assert.ok(Object.keys(en).length >= 40, `${Object.keys(en).length} clés seulement`);
});

await dit('chaque compte a ses deux formes (<base>.1 et <base>.n), dans les deux langues', () => {
  for (const langue of ['fr', 'en'] as const) {
    const cles = Object.keys(DICO[langue]);
    for (const c of cles.filter((k) => k.endsWith('.1'))) assert.ok(cles.includes(`${c.slice(0, -2)}.n`), `${langue} : ${c} sans .n`);
    for (const c of cles.filter((k) => k.endsWith('.n'))) assert.ok(cles.includes(`${c.slice(0, -2)}.1`), `${langue} : ${c} sans .1`);
  }
  assert.equal(L.direCompte('fr', 'serie.jours', 0), '0 jour de suite');
  assert.equal(L.direCompte('fr', 'serie.jours', 1), '1 jour de suite');
  assert.equal(L.direCompte('fr', 'serie.jours', 2), '2 jours de suite');
  assert.equal(L.direCompte('en', 'serie.jours', 0), '0 days in a row');
  assert.equal(L.direCompte('en', 'serie.jours', 1), '1 day in a row');
});

await dit('le guide de voix du socle passe sur chaque texte français : tutoiement, pas de « -ez », pas de « ! »', () => {
  const fautes: string[] = [];
  for (const [cle, texte] of Object.entries<string>(DICO.fr)) for (const e of ecartsDeVoix(texte, 'interface')) fautes.push(`${cle} : ${e.regle} « ${e.extrait} »`);
  assert.deepEqual(fautes, []);
});

await dit('aucun mot de reproche ni d’urgence inventée dans les textes (fr et en), hors le libellé « En retard » de la fiche', () => {
  const reproche = /\b(raté|ratée|échec|echec|failed|failure|perdu|lost|oubli|forgot|forgotten|honte|shame|paresse|lazy|urgent|urgence|vite|hurry|dernière chance|last chance|trop tard|too late)\b/i;
  for (const langue of ['fr', 'en'] as const) {
    for (const [cle, texte] of Object.entries<string>(DICO[langue])) {
      if (cle === 'projet.statut.enRetard') continue; // le mot de la fiche MJ01 ; la phrase qui suit (projet.suite.enRetard) propose, elle, une issue
      assert.ok(!reproche.test(texte), `${langue}/${cle} : « ${texte} »`);
    }
  }
  assert.equal(DICO.fr['rappel.etat.aReprendre'], 'À reprendre', 'un rappel passé n’est jamais « en retard »');
  assert.ok(!/retard/i.test(DICO.fr['rappel.etat.aReprendre'] + DICO.fr['rappel.suite.aReprendre']));
  assert.ok(DICO.fr['projet.suite.enRetard'].endsWith('?'), 'un projet en retard reçoit une proposition, pas un constat');
});

await dit('les phrases de la logique tutoient et disent la suite (série, palier, jalon, défi, jauge)', () => {
  const jaune = L.serieDeLaJournee([bouclee('2026-10-28'), bouclee('2026-10-29'), ouverte('2026-10-30', 1)], '2026-10-30');
  const textes = [
    L.phraseDePalier('fr', jaune),
    L.phraseDeLaJournee('fr', jaune),
    L.phraseDeJalonFactures('fr', L.jalonDeFactures(7)),
    L.phraseDeJalonFactures('fr', L.jalonDeFactures(12)),
    L.phraseDeJauge('fr', 'Compteur de jours', L.jaugeDuDefi({ cible: 30, valeurActuelle: 29 })),
    L.phraseDeJauge('fr', 'Taux de tenue', L.jaugeDuDefi({ cible: 90, valeurActuelle: 78 })),
    L.phraseDeJauge('fr', 'Seuil', L.jaugeDuDefi({ cible: 4.5, valeurActuelle: 4.2 })),
    L.phraseDeCelebration('fr', 'Zéro impayé'),
    L.phraseDeSemaineChargee('fr', 9, 5.5),
  ];
  assert.deepEqual(textes, [
    'Prochain palier : 5 jours, dans 3 jours',
    'Il te reste 2 priorités pour boucler ta journée.',
    'Encore 3 factures pour atteindre 10.',
    '12 factures envoyées',
    'Encore 1 jour',
    'Encore 12 points',
    'Encore 0,3',
    'Défi tenu : Zéro impayé. Bravo à l’équipe.',
    'La semaine prochaine est chargée : 9 tâches prévues, contre 5,5 en moyenne. On la prépare ?',
  ]);
  assert.equal(L.phraseDePalier('fr', { prochainPalier: null, joursAvantPalier: null }), null);
  assert.equal(L.phraseDeLaJournee('fr', { boucleeAujourdhui: true, restantesAujourdhui: 0 }), 'Journée bouclée.');
  assert.equal(L.phraseDeLaJournee('fr', { boucleeAujourdhui: false, restantesAujourdhui: 0 }), null, 'rien de choisi : on ne dit rien');
  assert.equal(L.libelleDeStatut('fr', 'En retard'), 'En retard');
});

/* ── 6. La structure ─────────────────────────────────────────────────────── */
console.log('\nLOT-01 — structure : logique pure, aucune horloge, aucune brique visuelle\n');

await dit('aucun composant, aucun React, aucune brique du socle visuel avant le feu vert du CO (la logique seule)', () => {
  const fautes: string[] = [];
  for (const f of fichiersDe(ZONE)) {
    if (f.endsWith('.tsx')) fautes.push(`${f} : un composant dans la zone de préparation`);
    const src = code(f);
    for (const m of src.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
      const dep = m[1];
      if (/^react(-dom)?(\/|$)/.test(dep) || /framer-motion|lucide-react/.test(dep)) fautes.push(`${f} importe ${dep}`);
      if (/socle\/ui|socle\/coquille|\/screens\/|\/components\//.test(dep)) fautes.push(`${f} importe ${dep}`);
      if (/refonte\/donnees/.test(dep)) fautes.push(`${f} importe les jeux de SIM (réservés aux contrôles)`);
    }
  }
  assert.deepEqual(fautes, []);
});

await dit('aucune lecture de l’horloge ni du hasard : « maintenant » vient toujours de l’appelant', () => {
  const fautes: string[] = [];
  for (const f of fichiersDe(ZONE)) {
    const src = code(f);
    if (/Date\.now\s*\(|new Date\s*\(\s*\)|Math\.random|performance\.now/.test(src)) fautes.push(f);
  }
  assert.deepEqual(fautes, []);
});

await dit('aucun nom réel, aucune adresse hors `exemple.test` dans la zone (code et note)', () => {
  const fautes: string[] = [];
  const fichiers = [...fichiersDe(ZONE), 'docs/refonte/preparation/LOT-01-ma-journee.md'];
  for (const f of fichiers) {
    const src = fs.readFileSync(path.join(racine, f), 'utf8');
    for (const m of src.matchAll(/[\w.+-]+@([\w-]+\.[\w.-]+)/g)) if (m[1] !== 'exemple.test') fautes.push(`${f} : ${m[0]}`);
    if (/Syraagensy|NWSY|amndevsec/i.test(src)) fautes.push(`${f} : nom réel`);
  }
  assert.deepEqual(fautes, []);
});

await dit('la zone ne dépend d’aucune autre logique de lot (aucune copie croisée : chaque lot a ses aides)', () => {
  const fautes: string[] = [];
  for (const f of fichiersDe(ZONE)) {
    for (const m of code(f).matchAll(/from\s+['"]([^'"]+)['"]/g)) {
      const dep = m[1];
      if (/refonte\/(ecrire|contacts|creer|argent|echanger|outils|garde|accueil|developpement|connecteurs)/.test(dep)) fautes.push(`${f} importe ${dep}`);
    }
  }
  assert.deepEqual(fautes, []);
});

await dit('la note de préparation existe et nomme les 16 écrans du lot', () => {
  const note = fs.readFileSync(path.join(racine, 'docs/refonte/preparation/LOT-01-ma-journee.md'), 'utf8');
  for (const id of ['N01', 'H25', 'G08', 'H01', 'H02', 'H03', 'H04', 'MJ01', 'MJ03', 'MJ02', 'MJ04', 'MJ05', 'L03', 'L02', 'L01', 'L07']) assert.ok(note.includes(id), `${id} absent de la note`);
  assert.ok(/zips? v4/i.test(note) && /à confirmer/i.test(note), 'la note dit ce qui n’a pas pu être lu');
});

console.log(`\n${echecs ? `✗ ${echecs} échec(s)` : '✓'} check:journee — ${vus} contrôles passés.\n`);
process.exit(echecs ? 1 : 0);

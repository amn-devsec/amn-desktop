/**
 * Contrôle des ÉCRANS DE LOT-01 · MA JOURNÉE construits par S1 (H01, H03, G08, MJ01 à MJ05) — `npm run check:journee-ecrans`.
 *
 * Sans réseau, sans navigateur. La logique pure de chaque écran (`modele.ts`) est exercée hors interface sur des cas écrits à la main, les mots
 * (fr/en, tutoiement, comptes à deux formes) et la structure (aucune couleur écrite à la main dans les feuilles, aucune horloge dans la logique,
 * rien de `src/screens` ni de l'édition cliente). La logique de S2 (`src/refonte/journee/*.ts`) a sa propre garde : `check:journee`.
 *
 *   npm run check:journee-ecrans
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ECRANS = ['calendrier', 'missions', 'cockpit', 'projets', 'habitudes', 'planning', 'notes', 'rappels'].filter((d) => fs.existsSync(path.join(racine, 'src/refonte/journee', d)));
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
    loader: { '.css': 'empty' },
    tsconfig: path.join(racine, 'tsconfig.json'),
    define: { 'process.env.NODE_ENV': '"production"', 'import.meta.env.DEV': 'false', __AMN_EDITION__: '"internal"', __AMN_VERSION__: '"0.0.0"' },
    logLevel: 'silent',
  });
  return (await import(`data:text/javascript;charset=utf-8;base64,${Buffer.from(construit.outputFiles[0].text, 'utf8').toString('base64')}`)) as T;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const exportsDe = (d: string, nom: string): string => (fs.existsSync(path.join(racine, `src/refonte/journee/${d}/${nom}.ts`)) ? `export * as ${d.toUpperCase().slice(0, 3)}_${nom} from '../src/refonte/journee/${d}/${nom}';\n` : '');
const M = await charger<any>(
  [
    ...ECRANS.flatMap((d) => [exportsDe(d, 'modele'), fs.existsSync(path.join(racine, `src/refonte/journee/${d}/i18n.ts`)) ? `export { DICTIONNAIRES_${d.toUpperCase()} } from '../src/refonte/journee/${d}/i18n';\n` : '']),
    "export * as monde from '../src/refonte/donnees';\n",
    "export { instantParis } from '../src/refonte/donnees/outils';\n",
  ].join(''),
);
const paris = (jour: string, hhmm: string): number => M.instantParis(jour, hhmm);
const iso = (jour: string, hhmm: string): string => new Date(paris(jour, hhmm)).toISOString();
const TUTOIEMENT_INTERDIT = /(?<!rendez-)\b(vous|votre|vos|pourriez|souhaitez)\b/i;

/** Les mots d'un écran : mêmes clés en fr et en, mêmes paramètres, comptes à deux formes, l'interface tutoie. */
function motsJustes(dico: any, nom: string) {
  const en = Object.keys(dico.en).sort();
  assert.deepEqual(Object.keys(dico.fr).sort(), en, `${nom} : clés fr et en`);
  const params = (t: string) => [...t.matchAll(/\{(\w+)\}/g)].map((x) => x[1]).sort().join(',');
  for (const k of en) {
    assert.ok(dico.en[k].trim() && dico.fr[k].trim(), `${nom} ${k} vide`);
    assert.equal(params(dico.fr[k]), params(dico.en[k]), `${nom} : paramètres de ${k}`);
    assert.ok(!TUTOIEMENT_INTERDIT.test(dico.fr[k]), `${nom} : ${k} vouvoie : ${dico.fr[k]}`);
  }
  for (const b of new Set(en.filter((k) => /\.(1|n)$/.test(k)).map((k) => k.replace(/\.(1|n)$/, '')))) for (const l of ['fr', 'en']) assert.ok(dico[l][`${b}.1`] && dico[l][`${b}.n`], `${nom} : ${b} (${l})`);
}

/* ── H01 · Calendrier ───────────────────────────────────────────────────── */
if (M.CAL_modele) {
  console.log('\nMa journée — H01, Calendrier (grille, charge, maintenant, créneau proposé)\n');
  const CAL = M.CAL_modele;
  const ev = (id: string, jour: string, de: string, a: string, o: Record<string, unknown> = {}): any => ({ id, titre: `Événement ${id}`, startAt: iso(jour, de), endAt: iso(jour, a), famille: 'equipe', genre: 'normal', ...o });
  const NOW = paris('2026-10-30', '10:42');
  const sem = (evenements: any[], o: Record<string, unknown> = {}) => CAL.modeleSemaine({ evenements, maintenant: NOW, ...o });

  await dit('la grille : 47 px par heure depuis 08:00, hauteur = durée × 47 − 2 (22 au moins), une seule ligne sous 40 px', () => {
    assert.equal(CAL.PX_PAR_HEURE, 47);
    assert.equal(CAL.HAUTEUR_GRILLE, 517);
    const m = sem([ev('a', '2026-10-30', '09:00', '10:00'), ev('b', '2026-10-30', '11:00', '11:15'), ev('c', '2026-10-30', '14:00', '15:30')]);
    const ven = m.jours[4];
    const [a, b, c] = ven.blocs;
    assert.deepEqual([a.y, a.hauteur], [47, 45]);
    assert.deepEqual([b.y, b.hauteur, b.uneLigne], [141, 22, true], 'minimum 22 px');
    assert.deepEqual([c.y, Math.round(c.hauteur * 100) / 100], [282, 68.5]);
    assert.equal(a.uneLigne, false);
  });

  await dit('les jours : lundi à dimanche, week-end sans barre de charge, aujourd’hui reconnu, charge ÷ 9 h plafonnée à 1', () => {
    const m = sem([ev('a', '2026-10-30', '09:00', '13:30'), ev('b', '2026-10-30', '14:00', '20:00', { genre: 'normal' })]);
    assert.deepEqual(m.jours.map((j: any) => j.jour), ['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01']);
    assert.deepEqual(m.jours.map((j: any) => j.weekend), [false, false, false, false, false, true, true]);
    assert.deepEqual(m.jours.map((j: any) => j.aujourdhui), [false, false, false, false, true, false, false]);
    assert.equal(m.jours[5].charge, null);
    assert.equal(m.jours[4].chargeMin, 630);
    assert.equal(m.jours[4].charge, 1, 'plafonnée : jamais « surchargé »');
    assert.equal(m.jours[0].charge, 0);
    assert.equal(m.semaine, 44);
    assert.deepEqual([m.lundi, m.dimanche], ['2026-10-26', '2026-11-01']);
  });

  await dit('chevauchement : les parts sont égales, trois colonnes au plus puis « + n » ; un système et un annulé ne comptent pas dans la charge', () => {
    const m = sem([ev('a', '2026-10-27', '10:00', '11:00'), ev('b', '2026-10-27', '10:00', '11:00'), ev('c', '2026-10-27', '10:00', '11:00'), ev('d', '2026-10-27', '10:00', '11:00'), ev('s', '2026-10-27', '15:00', '16:00', { systeme: true }), ev('x', '2026-10-27', '16:00', '17:00', { status: 'cancelled' })]);
    const mar = m.jours[1];
    assert.deepEqual(mar.blocs.filter((b: any) => ['a', 'b', 'c', 'd'].includes(b.id)).map((b: any) => [b.colonne, b.colonnes]), [[0, 3], [1, 3], [2, 3]]);
    assert.equal(mar.enPlus, 1);
    assert.equal(mar.chargeMin, 240, 'ni le système ni l’annulé');
  });

  await dit('le sous-titre : « n rendez-vous » ne compte ni personnel, ni concentration, ni trajet, ni système, ni annulé ; « libres » = le plus grand trou de 09:00–18:00 du prochain jour ouvré', () => {
    const m = sem([
      ev('1', '2026-10-27', '10:00', '11:00', { famille: 'clients' }), ev('2', '2026-10-28', '10:00', '11:00'), ev('3', '2026-10-28', '12:00', '13:00', { genre: 'concentration' }),
      ev('4', '2026-10-29', '10:00', '10:30', { genre: 'trajet', famille: 'personnel' }), ev('5', '2026-10-29', '12:30', '13:30', { famille: 'personnel' }), ev('6', '2026-10-30', '09:00', '09:30', { systeme: true }),
      ev('7', '2026-10-30', '16:00', '17:00', { status: 'cancelled' }), ev('8', '2026-10-30', '16:00', '17:00'),
      ev('l1', '2026-11-02', '09:00', '10:00'), ev('l2', '2026-11-02', '12:00', '14:00'),
    ]);
    assert.equal(m.nbRendezVous, 3);
    assert.deepEqual(m.libres, { minutes: 240, jour: '2026-11-02', demain: false }, 'lundi : 10:00–12:00 = 2 h, 14:00–18:00 = 4 h');
    const demain = CAL.modeleSemaine({ evenements: [], maintenant: paris('2026-10-29', '10:00') });
    assert.deepEqual([demain.libres.minutes, demain.libres.demain], [540, true]);
    assert.equal(CAL.dureeCourte(150), '2 h 30');
    assert.equal(CAL.dureeCourte(45), '45 min');
    assert.equal(CAL.dureeCourte(240), '4 h');
  });

  await dit('« maintenant » : à la minute, seulement si la semaine contient aujourd’hui et dans 08:00–19:00 ; l’étiquette d’une heure à moins de 25 min disparaît', () => {
    const m = sem([]);
    assert.deepEqual([m.maintenant.heure, Math.round(m.maintenant.y), m.maintenant.colonne], ['10:42', Math.round((162 * 47) / 60), 4]);
    assert.deepEqual(m.heuresMasquees, [11], '11:00 est à 18 min de 10:42, 10:00 à 42 min');
    assert.equal(sem([], { jour: '2026-11-03' }).maintenant, null, 'une autre semaine : pas de ligne');
    assert.equal(CAL.modeleSemaine({ evenements: [], maintenant: paris('2026-10-30', '19:30') }).maintenant, null, 'après 19:00');
  });

  await dit('l’état d’un bloc (passé, en cours, à venir), le prochain rendez-vous et « Ensuite » : dans N min jusqu’à 60 min, puis à HH:MM ; Rejoindre seulement avec une salle', () => {
    const m = sem([ev('p', '2026-10-30', '08:00', '09:00'), ev('n', '2026-10-30', '11:00', '12:00', { enLigne: true, lieu: 'salle clients', participants: ['Aaron', 'Amina'] }), ev('t', '2026-10-30', '14:00', '15:00'), ev('c', '2026-10-30', '11:30', '12:00', { genre: 'concentration' })]);
    const ven = m.jours[4];
    assert.deepEqual(ven.blocs.map((b: any) => [b.id, b.etat, b.prochain]), [['p', 'passe', false], ['n', 'a-venir', true], ['c', 'a-venir', false], ['t', 'a-venir', false]]);
    assert.deepEqual(m.ensuite.dans, { genre: 'minutes', n: 18 });
    assert.equal(m.ensuite.action, 'rejoindre');
    assert.deepEqual(m.ensuite.participants, ['Aaron', 'Amina']);
    const plusTard = sem([ev('t', '2026-10-30', '14:00', '15:00')]);
    assert.deepEqual(plusTard.ensuite.dans, { genre: 'heure', heure: '14:00' });
    assert.equal(plusTard.ensuite.action, 'preparer');
    assert.equal(sem([]).ensuite, null);
  });

  await dit('concentration de la semaine, familles et genres présents (le pied), ligne « journée » sur plusieurs jours', () => {
    const m = sem([ev('c1', '2026-10-26', '10:15', '12:00', { genre: 'concentration' }), ev('c2', '2026-10-27', '13:30', '15:00', { genre: 'concentration' }), ev('c3', '2026-10-28', '15:00', '17:00', { genre: 'concentration' }), ev('k', '2026-10-27', '10:00', '11:00', { famille: 'clients' })], {
      journees: [{ id: 'j', titre: 'Audit', debut: '2026-10-26', fin: '2026-10-28', famille: 'securite' }, { id: 'h', titre: 'Ailleurs', debut: '2026-12-01', fin: '2026-12-02', famille: 'argent' }],
    });
    assert.equal(m.concentrationMin, 105 + 90 + 120);
    assert.deepEqual(m.presents, { familles: ['clients'], concentration: true, trajet: false, propose: false });
    assert.deepEqual(m.puces.map((p: any) => [p.id, p.colDebut, p.colFin]), [['j', 0, 2]]);
  });

  await dit('le mini-mois : semaines complètes, un point par jour qui a un événement, la semaine affichée marquée', () => {
    const m = sem([ev('a', '2026-10-27', '10:00', '11:00')]);
    assert.equal(m.mois.semaines.length, 5);
    assert.equal(m.mois.semaines[0][0].jour, '2026-09-28');
    const mardi = m.mois.semaines.flat().find((c: any) => c.jour === '2026-10-27');
    assert.deepEqual([mardi.points, mardi.dansLaSemaine, mardi.dansLeMois], [true, true, true]);
    assert.equal(m.mois.semaines.flat().filter((c: any) => c.dansLaSemaine).length, 7);
    assert.equal(m.mois.semaines.flat().find((c: any) => c.jour === '2026-10-30').aujourdhui, true);
  });

  await dit('le créneau proposé : une tâche urgente du jour, un trou d’au moins 45 min avant l’échéance, jamais dans le passé ni sur un autre événement ; « Non merci » le retire', () => {
    const tache = { id: 't1', titre: 'Valider le tableau de bord', echeance: iso('2026-10-30', '17:00') };
    const m = sem([ev('x', '2026-10-30', '11:00', '15:00')], { taches: [tache] });
    assert.deepEqual([m.propose.heure, m.propose.fin, m.propose.jour], ['15:00', '16:00', '2026-10-30']);
    assert.equal(m.propose.echeanceHeure, '17:00');
    assert.ok(Date.parse(m.propose.startAt) > NOW, 'jamais dans le passé');
    assert.equal(sem([ev('x', '2026-10-30', '11:00', '16:30')], { taches: [tache] }).propose, null, 'un trou de 30 min avant l’échéance ne suffit pas');
    assert.equal(sem([], { taches: [{ ...tache, echeance: iso('2026-10-31', '17:00') }] }).propose, null, 'pas une tâche d’un autre jour');
    assert.equal(sem([], { taches: [tache], refuses: new Set(['t1']) }).propose, null);
    assert.equal(sem([]).propose, null, 'sans tâche : l’astuce');
  });

  await dit('l’état vide : rien dans la semaine (le système ne compte pas)', () => {
    assert.equal(sem([ev('s', '2026-10-28', '11:00', '11:15', { systeme: true })]).vide, true);
    assert.equal(sem([ev('a', '2026-10-28', '11:00', '12:00')]).vide, false);
  });

  await dit('sur le monde de SIM : la semaine du 26 octobre se calcule sans valeur en dur (aux quatre volumes)', () => {
    for (const volume of ['vide', 'peu', 'normal', 'beaucoup']) {
      const monde = M.monde.construireMonde({ volume, maintenant: NOW });
      const evenements = monde.evenements.map((e: any) => ({ id: e.id, titre: e.title, startAt: e.startAt, endAt: e.endAt, status: e.status, systeme: e.systeme, famille: 'equipe', genre: 'normal' }));
      const m = CAL.modeleSemaine({ evenements, maintenant: NOW });
      assert.equal(m.jours.length, 7, volume);
      for (const j of m.jours) for (const b of j.blocs) assert.ok(b.y >= 0 && b.y + b.hauteur <= 517 + 0.01, `${volume} ${b.id} dans la grille`);
    }
  });

  await dit('H01 · textes : mêmes clés en fr et en, tutoiement', () => {
    motsJustes(M.DICTIONNAIRES_CALENDRIER, 'H01');
    assert.equal(M.DICTIONNAIRES_CALENDRIER.fr['action.nouveau'], 'Nouvel événement');
  });
}

/* ── Structure ──────────────────────────────────────────────────────────── */
console.log('\nMa journée — structure des écrans de S1\n');
const lister = (d: string): string[] => (fs.existsSync(path.join(racine, d)) ? fs.readdirSync(path.join(racine, d), { recursive: true, withFileTypes: true }).filter((f: any) => f.isFile()).map((f: any) => path.relative(racine, path.join(f.parentPath ?? f.path, f.name)).replace(/\\/g, '/')) : []);
const fichiers = ECRANS.flatMap((d) => lister(`src/refonte/journee/${d}`));

await dit('aucune couleur écrite à la main dans les feuilles des écrans : jetons du socle seulement', () => {
  const fautes: string[] = [];
  for (const f of fichiers.filter((x) => x.endsWith('.css'))) {
    const css = fs.readFileSync(path.join(racine, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    const trouves = css.match(/#[0-9a-fA-F]{3,8}\b|rgba?\((?!0,\s*0,\s*0)[^)]*\)/g);
    if (trouves) fautes.push(`${f} : ${[...new Set(trouves)].join(' ')}`);
  }
  assert.deepEqual(fautes, [], fautes.join('\n'));
});

await dit('la logique de chaque écran est pure : ni React, ni horloge, ni hasard, ni réseau ; les écrans ne touchent ni src/screens, ni src/business, ni l’édition cliente', () => {
  const fautes: string[] = [];
  for (const f of fichiers.filter((x) => /\/modele\.ts$/.test(x))) {
    const s = fs.readFileSync(path.join(racine, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    if (/from 'react'|Date\.now\s*\(|new Date\s*\(\s*\)|Math\.random|fetch\s*\(|localStorage|process\.env/.test(s)) fautes.push(f);
  }
  for (const f of fichiers.filter((x) => /\.tsx?$/.test(x))) {
    const s = fs.readFileSync(path.join(racine, f), 'utf8');
    if (/from '(\.\.\/)+screens\/|from '(\.\.\/)+business\/|\.business\./.test(s)) fautes.push(`${f} (importe l’édition cliente ou src/screens)`);
  }
  assert.deepEqual(fautes, [], fautes.join(', '));
});

await dit('aucun nom réel, aucune adresse ni secret dans les écrans', () => {
  const fautes: string[] = [];
  for (const f of fichiers) {
    const s = fs.readFileSync(path.join(racine, f), 'utf8');
    if (/Syraagensy|NWSY|sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{12,}|\b\d{1,3}(\.\d{1,3}){3}\b/.test(s)) fautes.push(f);
  }
  assert.deepEqual(fautes, [], fautes.join(', '));
});

console.log('');
if (echecs > 0) {
  console.error(`ÉCHEC — ${echecs} contrôle(s) de LOT-01 (S1) en défaut sur ${vus + echecs}.`);
  process.exit(1);
}
console.log(`OK — ${vus} contrôles de LOT-01 (S1) tiennent.`);
process.exit(0);

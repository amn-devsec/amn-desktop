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

/* ── H03 · Missions et tickets ──────────────────────────────────────────── */
if (M.MIS_modele) {
  console.log('\nMa journée — H03, Missions et tickets (colonnes, limites, minuteurs, dépôt)\n');
  const MIS = M.MIS_modele;
  const NOW = paris('2026-10-30', '10:42');
  const tk = (id: string, colonne: string, o: Record<string, unknown> = {}): any => ({
    id, titre: `Ticket ${id}`, colonne, urgent: false, client: null, etiquette: '', sousTaches: null, assigne: null, echeance: null, termineLe: null, commentaires: 0, partageClient: false, ordre: 0,
    creeAt: iso('2026-10-27', '09:00'), priseEnChargeAt: null, entreeColonneAt: null, ...o,
  });
  const mis = (tickets: any[], o: Record<string, unknown> = {}) => MIS.modeleMissions({ tickets, maintenant: NOW, ...o });

  await dit('l’ordre d’une colonne : urgents en tête, puis l’ordre manuel ; Terminé : le plus récent en haut, sept jours seulement', () => {
    const m = mis([tk('b', 'a-faire', { ordre: 1 }), tk('a', 'a-faire', { ordre: 0 }), tk('u', 'a-faire', { urgent: true, ordre: 5 }), tk('t1', 'termine', { termineLe: '2026-10-27' }), tk('t2', 'termine', { termineLe: '2026-10-29' }), tk('t3', 'termine', { termineLe: '2026-10-20' })]);
    assert.deepEqual(m.colonnes[0].cartes.map((c: any) => c.id), ['u', 'a', 'b']);
    assert.deepEqual(m.colonnes[3].cartes.map((c: any) => c.id), ['t2', 't1'], 'le ticket de 10 jours est aux archives');
    assert.equal(m.colonnes[3].total, 3, 'le compteur d’en-tête est le total réel');
  });

  await dit('trois cartes par colonne puis « Voir n autres » ; la colonne dépliée les montre toutes', () => {
    const tous = ['1', '2', '3', '4', '5'].map((i) => tk(i, 'a-faire', { ordre: Number(i) }));
    const m = mis(tous);
    assert.deepEqual([m.colonnes[0].cartes.length, m.colonnes[0].reste, m.colonnes[0].total], [3, 2, 5]);
    assert.equal(mis(tous, { depliees: new Set(['a-faire']) }).colonnes[0].reste, 0);
  });

  await dit('les limites : « 3 sur 3 » et colonne pleine pour En cours, 3 sur 4 pour En revue ; jamais de limite pour À faire et Terminé', () => {
    const m = mis([tk('1', 'en-cours'), tk('2', 'en-cours'), tk('3', 'en-cours'), tk('4', 'en-revue'), tk('5', 'en-revue'), tk('6', 'en-revue')]);
    const [af, ec, er, te] = m.colonnes;
    assert.deepEqual([ec.limite, ec.pleine, ec.segments], [3, true, { total: 3, pris: 3 }]);
    assert.deepEqual([er.limite, er.pleine, er.segments], [4, false, { total: 4, pris: 3 }]);
    assert.deepEqual([af.limite, te.limite], [null, null]);
    assert.equal(mis([tk('1', 'en-cours')], { limites: { 'en-cours': 1 } }).colonnes[1].pleine, true, 'la limite est un réglage');
  });

  await dit('les pastilles : urgents non terminés, En cours « n sur N », terminés depuis lundi, partagés non terminés ; un filtre ne change pas les compteurs', () => {
    const tickets = [tk('1', 'a-faire', { urgent: true, partageClient: true }), tk('2', 'en-cours'), tk('3', 'termine', { termineLe: '2026-10-26', urgent: true, partageClient: true }), tk('4', 'termine', { termineLe: '2026-10-25' }), tk('5', 'en-revue', { partageClient: true })];
    const m = mis(tickets);
    assert.deepEqual(m.pastilles, { urgents: 1, enCours: { n: 1, limite: 3 }, termines: 1, partages: 2 });
    const f = mis(tickets, { filtre: 'urgents' });
    assert.deepEqual(f.pastilles, m.pastilles, 'compteurs globaux');
    assert.deepEqual(f.colonnes.map((c: any) => c.cartes.length), [1, 0, 0, 0]);
    assert.equal(mis(tickets, { filtre: 'partages' }).colonnes.flatMap((c: any) => c.cartes).length, 2);
  });

  await dit('le minuteur : prise en charge (urgent 30 min), résolution avant 17:00, délai dépassé en mots, revue à partir d’un jour, rien pour un ticket sans client', () => {
    const urgent = MIS.minuteurDe(tk('u', 'a-faire', { urgent: true, client: 'Medina', creeAt: iso('2026-10-30', '10:24') }), NOW);
    assert.deepEqual([urgent.genre, urgent.minutes, urgent.depasse, urgent.ton], ['prise', 12, false, 'attention']);
    const tard = MIS.minuteurDe(tk('u', 'a-faire', { urgent: true, client: 'Medina', creeAt: iso('2026-10-30', '09:50') }), NOW);
    assert.deepEqual([tard.depasse, tard.minutes, tard.ton], [true, 22, 'danger']);
    const resolution = MIS.minuteurDe(tk('r', 'en-cours', { urgent: true, client: 'Menna', priseEnChargeAt: iso('2026-10-30', '08:48') }), NOW);
    assert.deepEqual([resolution.genre, resolution.heureLimite, resolution.minutes], ['resolution', '17:00', 378]);
    assert.equal(MIS.minuteurDe(tk('n', 'a-faire', { client: 'Menna', creeAt: iso('2026-10-30', '09:00') }), NOW), null, 'un délai normal loin de son terme ne se montre pas');
    assert.equal(MIS.minuteurDe(tk('x', 'en-cours', { urgent: true }), NOW), null, 'sans client : pas de délai engagé');
    assert.equal(MIS.minuteurDe(tk('d', 'termine', { client: 'Menna' }), NOW), null);
    assert.equal(MIS.minuteurDe(tk('v', 'en-revue', { entreeColonneAt: iso('2026-10-30', '09:00') }), NOW), null, 'moins d’un jour en revue : rien à dire');
    assert.equal(MIS.minuteurDe(tk('v', 'en-revue', { entreeColonneAt: iso('2026-10-28', '10:42') }), NOW).minutes, 2 * 24 * 60);
  });

  await dit('minutes ouvrées : vendredi 17:00 + 2 h → lundi 10:00 ; ni week-end, ni nuit', () => {
    assert.equal(MIS.ajouterMinutesOuvrees(paris('2026-10-30', '17:00'), 120), paris('2026-11-02', '10:00'));
    assert.equal(MIS.ajouterMinutesOuvrees(paris('2026-10-31', '11:00'), 30), paris('2026-11-02', '09:30'));
    assert.equal(MIS.ajouterMinutesOuvrees(paris('2026-10-29', '10:00'), 60), paris('2026-10-29', '11:00'));
  });

  await dit('le délai moyen de prise en charge : sur les tickets clients des 30 derniers jours, null sans donnée', () => {
    const m = mis([tk('a', 'en-cours', { client: 'X', creeAt: iso('2026-10-30', '08:30'), priseEnChargeAt: iso('2026-10-30', '08:48') }), tk('b', 'en-cours', { client: 'Y', creeAt: iso('2026-10-29', '09:00'), priseEnChargeAt: iso('2026-10-29', '09:26') }), tk('c', 'en-cours', { client: null, creeAt: iso('2026-10-29', '09:00'), priseEnChargeAt: iso('2026-10-29', '19:00') }), tk('d', 'en-cours', { client: 'Z', creeAt: iso('2026-08-01', '09:00'), priseEnChargeAt: iso('2026-08-01', '19:00') })]);
    assert.equal(m.delaiMoyenMin, 22);
    assert.equal(mis([tk('a', 'a-faire', { client: 'X' })]).delaiMoyenMin, null);
    assert.equal(MIS.dureeCourte(22), '22 min');
  });

  await dit('déposer une carte : colonne pleine → renvoyée avec la limite (« Dépasser quand même » passe) ; vers Terminé, la personne assignée est prévenue', () => {
    const t = tk('x', 'a-faire', { assigne: { nom: 'Riyad' } });
    const tous = [t, tk('1', 'en-cours'), tk('2', 'en-cours'), tk('3', 'en-cours')];
    assert.deepEqual(MIS.deposer(t, 'en-cours', tous), { genre: 'limite', vers: 'en-cours', limite: 3 });
    assert.deepEqual(MIS.deposer(t, 'en-cours', tous, MIS.LIMITES_PAR_DEFAUT, true), { genre: 'ok', vers: 'en-cours', prevenu: null });
    assert.deepEqual(MIS.deposer(t, 'termine', tous), { genre: 'ok', vers: 'termine', prevenu: 'Riyad' });
    assert.deepEqual(MIS.deposer(t, 'a-faire', tous), { genre: 'meme-colonne' });
  });

  await dit('les dates d’une carte : Aujourd’hui, Demain, « Lun. 2 » à moins de 4 jours, « 3 nov. » au-delà, « Mar. 27 » en Terminé', () => {
    const d = (j: string, termine = false) => MIS.dateDeCarte(j, '2026-10-30', termine);
    assert.deepEqual(d('2026-10-30'), { genre: 'aujourdhui', texte: '' });
    assert.deepEqual(d('2026-10-31'), { genre: 'demain', texte: '' });
    assert.equal(d('2026-11-02').texte, 'Lun. 2');
    assert.equal(d('2026-11-03').texte, '3 nov.');
    assert.equal(d('2026-10-27', true).texte, 'Mar. 27');
  });

  await dit('H03 · textes : mêmes clés en fr et en, tutoiement', () => {
    motsJustes(M.DICTIONNAIRES_MISSIONS, 'H03');
    assert.equal(M.DICTIONNAIRES_MISSIONS.fr['sousTitre.delai'], 'Un seul tableau pour l’équipe et nos clients · délai moyen de prise en charge : {duree}');
  });
}

/* ── G08 · Cockpit d'un client ──────────────────────────────────────────── */
if (M.COC_modele) {
  console.log('\nMa journée — G08, Cockpit d’un client (cinq instruments, agrégats seulement)\n');
  const COC = M.COC_modele;
  const NOW = paris('2026-10-30', '10:42');
  const base = (o: Record<string, unknown> = {}): any => ({ client: 'Menna Conseil', aujourdhui: '2026-10-30', maintenant: NOW, revenu: null, connectes: null, paiements: null, tickets: null, delaisTenusPourcent: null, sante: null, ...o });
  const ticket = (id: string, o: Record<string, unknown> = {}): any => ({ id, titre: `Ticket ${id}`, urgent: false, initiale: 'M', creeAt: paris('2026-10-30', '10:12'), echeanceAt: paris('2026-10-30', '17:00'), creeLabel: '10:12', echeanceLabel: '17:00', ...o });

  await dit('un instrument sans donnée est « non disponible » : null, nommé dans `manque`, jamais un zéro', () => {
    const m = COC.modeleCockpit(base());
    assert.deepEqual([m.revenu, m.connectes, m.paiements, m.couloirs, m.sante], [null, null, null, null, null]);
    assert.deepEqual(m.manque, ['revenu', 'connectes', 'paiements', 'tickets', 'sante']);
    assert.equal(COC.modeleCockpit(base({ tickets: [] })).couloirs.length, 0, 'une liste vide n’est pas une absence');
  });

  await dit('le revenu : objectif en %, rythme du mois (avance ou retard), courbe en 0–1, graduations rondes, objectif sur l’échelle', () => {
    const serie = Array.from({ length: 30 }, (_, i) => 390_000 + i * 3_000);
    const m = COC.modeleCockpit(base({ revenu: { cents: 482_000, ecartPourcent: 18, objectifCents: 600_000, serie, encaisseDuMoisCents: 1_294_000, clientsActifs: 38, nouveaux: 6, impayes: 1 } }));
    assert.equal(m.revenu.objectif.partPourcent, 80);
    assert.equal(m.revenu.objectif.ecartDeRythmeJours, -5, '(4 820 ÷ 6 000 × 31) − 30');
    assert.deepEqual(m.revenu.graduations.map((g: any) => g.v), [3000, 4000, 5000]);
    assert.ok(m.revenu.courbe.every((p: any) => p.x >= 0 && p.x <= 1 && p.y >= 0 && p.y <= 1));
    assert.ok(m.revenu.objectifY > m.revenu.courbe[29].y, 'l’objectif est au-dessus de la courbe');
    assert.equal(COC.modeleCockpit(base({ revenu: { cents: 100, ecartPourcent: null, objectifCents: null, serie: [100], encaisseDuMoisCents: 0, clientsActifs: 0, nouveaux: 0, impayes: 0 } })).revenu.objectif, null, 'sans objectif : pas de pourcentage');
  });

  await dit('le cadran : échelle = pic des 30 jours arrondi au-dessus à 20 près, fractions bornées, barres sur la plus haute', () => {
    assert.deepEqual([COC.echelleDuCadran(52), COC.echelleDuCadran(60), COC.echelleDuCadran(61), COC.echelleDuCadran(3)], [60, 60, 80, 20]);
    const m = COC.modeleCockpit(base({ connectes: { courant: 37, picDuJour: 52, picHeure: '9:40', aujourdhui: 214, picDes30Jours: 52, minutes: [10, 20, 40] } }));
    assert.deepEqual([m.connectes.echelle, Math.round(m.connectes.fraction * 100), Math.round(m.connectes.picFraction * 100)], [60, 62, 87]);
    assert.deepEqual(m.connectes.barres, [0.25, 0.5, 1]);
    assert.deepEqual(m.connectes.reperes, [0, 20, 40, 60]);
    assert.equal(COC.modeleCockpit(base({ connectes: { courant: 99, picDuJour: 99, picHeure: '1:00', aujourdhui: 1, picDes30Jours: 40, minutes: [] } })).connectes.fraction, 1, 'plafonnée à l’échelle');
  });

  await dit('les paiements : la part réussie, quatre derniers au plus, la carte est MASQUÉE (quatre chiffres, jamais plus)', () => {
    const derniers = ['1', '2', '3', '4', '5'].map((i) => ({ heure: `10:0${i}`, offre: 'Pro', carte4: '4242424242424242', cents: 4900, echec: false }));
    const m = COC.modeleCockpit(base({ paiements: { totalCents: 124_000, nombre: 7, reussis: 6, refuse: { n: 1, raison: 'carte expirée' }, derniers } }));
    assert.equal(Math.round(m.paiements.partReussie * 100), 86);
    assert.equal(m.paiements.derniers.length, 4);
    assert.ok(m.paiements.derniers.every((d: any) => d.carte4.length === 4), 'jamais plus de quatre chiffres');
    assert.equal(COC.modeleCockpit(base({ paiements: { totalCents: 0, nombre: 0, reussis: 0, refuse: null, derniers: [] } })).paiements.partReussie, 1);
  });

  await dit('les couloirs : urgents d’abord, puis dépassés, puis par temps restant ; la part écoulée = (maintenant − création) ÷ (échéance − création) ; « dépassé » barre pleine', () => {
    const m = COC.modeleCockpit(base({ tickets: [
      ticket('H-119', { creeAt: paris('2026-10-27', '14:00'), echeanceAt: paris('2026-11-03', '18:00') }),
      ticket('H-115', { creeAt: paris('2026-10-29', '09:00'), echeanceAt: paris('2026-10-30', '09:00') }),
      ticket('H-118', { urgent: true }),
      ticket('H-116', { creeAt: paris('2026-10-29', '09:00'), echeanceAt: paris('2026-11-04', '18:00') }),
    ] }));
    assert.deepEqual(m.couloirs.map((c: any) => c.id), ['H-118', 'H-115', 'H-119', 'H-116']);
    const [urgent, depasse, h119] = m.couloirs;
    assert.equal(Math.round(urgent.ecoule * 100), 7, '30 min sur 6 h 48');
    assert.deepEqual([depasse.depasse, depasse.ecoule, depasse.minutes], [true, 1, -102]);
    assert.ok(h119.ecoule > 0.35 && h119.ecoule < 0.6 && !h119.depasse);
    assert.deepEqual(COC.tempsDuCouloir(-102, true), { genre: 'depasse', jours: 0, heures: 1, minutes: 42 });
    assert.deepEqual(COC.tempsDuCouloir(378, false), { genre: 'reste', jours: 0, heures: 6, minutes: 18 });
    assert.deepEqual(COC.tempsDuCouloir(3 * 24 * 60 + 30, false).jours, 3);
  });

  await dit('la santé : « Tout circule » seulement si aucun nœud n’est ralenti ou coupé ; le pire état gagne', () => {
    const noeud = (ton: string) => ({ cle: 'stripe', libelle: 'Stripe', detail: '', ton });
    const sante = (tons: string[]) => COC.modeleCockpit(base({ sante: { noeuds: tons.map(noeud), segments: [], disponibilitePourcent: 99.8, legende: null, debutBande: 'hier' } })).sante.global;
    assert.deepEqual([sante(['ok', 'neutre']), sante(['ok', 'ralenti']), sante(['ralenti', 'coupe'])], ['ok', 'ralenti', 'coupe']);
  });

  await dit('SÉCURITÉ : ni clé, ni jeton, ni numéro de carte complet dans la logique, la vue ou la page ; aucun bouton « révéler »', () => {
    const lire = (f: string) => fs.readFileSync(path.join(racine, `src/refonte/journee/cockpit/${f}`), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    for (const f of ['modele.ts', 'VueCockpit.tsx', 'PageCockpit.tsx']) {
      const s = lire(f);
      assert.ok(!/sk_(live|test)|pk_(live|test)|whsec_|Bearer\s|apiKey|api_key|secret\s*[:=]|token\s*[:=]|\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/i.test(s), `${f} : une clé, un jeton ou un numéro de carte`);
      assert.ok(!/r[ée]v[ée]ler|reveal|showKey|afficher la cl[ée]/i.test(s), `${f} : un bouton « révéler »`);
    }
  });

  await dit('G08 · textes : mêmes clés en fr et en, tutoiement', () => {
    motsJustes(M.DICTIONNAIRES_COCKPIT, 'G08');
    assert.equal(M.DICTIONNAIRES_COCKPIT.fr['sousTitre'], 'Leur activité en ligne, en direct : revenus, utilisateurs, tickets et santé de l’intégration');
  });
}

/* ── MJ01 · Projets ─────────────────────────────────────────────────────── */
if (M.PRO_modele) {
  console.log('\nMa journée — MJ01, Projets (feuille de route : fenêtre, barres, jalons, ordre)\n');
  const PRO = M.PRO_modele;
  const NOW = paris('2026-10-30', '10:42');
  const proj = (id: string, o: Record<string, unknown> = {}): any => ({ id, nom: `Projet ${id}`, icone: 'folder', membres: ['Amina'], avancement: 50, debut: '2026-10-19', fin: '2026-11-27', jalons: [], ...o });
  const fe = (projets: any[], o: Record<string, unknown> = {}) => PRO.modeleFeuille({ projets, aujourdhui: '2026-10-30', maintenant: NOW, ...o });

  await dit('la fenêtre : « Trimestre » = 10 semaines qui commencent 3 semaines avant la semaine du jour (5 oct. au 13 déc.), « Mois » = 5 semaines', () => {
    const t = fe([]);
    assert.deepEqual([t.debut, t.fin, t.jours], ['2026-10-05', '2026-12-13', 70]);
    assert.equal(Math.round(t.pxParJour * 10) / 10, 11.8);
    const m = fe([], { fenetre: 'mois' });
    assert.deepEqual([m.debut, m.jours], ['2026-10-19', 35]);
    assert.deepEqual(t.semaines.map((s: any) => s.jour).slice(0, 3), ['2026-10-05', '2026-10-12', '2026-10-19']);
    assert.deepEqual(t.semaines.filter((s: any) => s.debutDeMois).map((s: any) => s.jour), ['2026-10-05', '2026-11-02', '2026-12-07']);
    assert.equal(t.weekends.length, 10);
  });

  await dit('la ligne d’aujourd’hui se place à l’heure près, et n’existe que dans la frise', () => {
    const t = fe([]);
    assert.equal(Math.round(t.aujourdhuiX * 10) / 10, Math.round((25 * t.pxParJour + (10 * 60 + 42) / 1440 * t.pxParJour) * 10) / 10);
    assert.equal(PRO.modeleFeuille({ projets: [], aujourdhui: '2027-03-01', maintenant: paris('2027-03-01', '10:00'), fenetre: 'trimestre' }).aujourdhuiX === null, false);
    assert.equal(fe([], { fenetre: 'mois' }).aujourdhuiX > 0, true);
  });

  await dit('la barre : du jour de début au jour de fin, remplie à l’avancement × sa longueur (pas au temps écoulé) ; avant la frise = bord gauche coupé', () => {
    const t = fe([proj('a', { debut: '2026-10-19', fin: '2026-11-03', avancement: 30 }), proj('b', { debut: '2026-09-21', fin: '2026-11-04', avancement: 72 })]);
    const [a, b] = t.couloirs;
    const jours = 16;
    assert.equal(Math.round(a.barre.x * 10) / 10, Math.round(14 * t.pxParJour * 10) / 10);
    assert.equal(Math.round(a.barre.largeur * 10) / 10, Math.round(jours * t.pxParJour * 10) / 10);
    assert.equal(Math.round(a.barre.rempli / a.barre.largeur * 100), 30);
    assert.deepEqual([b.barre.x, b.barre.coupeAGauche, b.barre.coupeADroite], [0, true, false]);
    assert.equal(Math.round(b.barre.rempli / b.barre.largeur * 100), 72);
  });

  await dit('hors fenêtre : une flèche au bord avec la date ; sans date : « Dates à définir », jamais une barre inventée', () => {
    const t = fe([proj('passe', { debut: '2026-08-01', fin: '2026-09-15' }), proj('futur', { debut: '2027-02-01', fin: '2027-03-01' }), proj('sans', { debut: null, fin: null })]);
    const par = Object.fromEntries(t.couloirs.map((c: any) => [c.id, c]));
    assert.deepEqual([par.passe.barre, par.passe.horsFenetre], [null, { cote: 'gauche', jour: '2026-09-15' }]);
    assert.deepEqual([par.futur.barre, par.futur.horsFenetre], [null, { cote: 'droite', jour: '2027-02-01' }]);
    assert.deepEqual([par.sans.sansDates, par.sans.barre], [true, null]);
  });

  await dit('le statut affiché : Terminé, En retard (échéance ou jalon non fait passé), Presque fini (≥ 85 %), À démarrer (0 % et début futur), sinon En cours', () => {
    const st = (o: Record<string, unknown>) => PRO.statutAffiche({ avancement: 50, fin: '2026-11-27', debut: '2026-10-19', jalons: [], ...o }, '2026-10-30');
    assert.equal(st({ avancement: 100, fin: '2026-01-01' }), 'Terminé', 'terminé même si l’échéance est passée');
    assert.equal(st({ fin: '2026-10-29' }), 'En retard');
    assert.equal(st({ jalons: [{ id: 'j', titre: 'x', jour: '2026-10-27', fait: false }] }), 'En retard');
    assert.equal(st({ jalons: [{ id: 'j', titre: 'x', jour: '2026-10-27', fait: true }] }), 'En cours', 'un jalon fait n’est pas un retard');
    assert.equal(st({ avancement: 85 }), 'Presque fini');
    assert.equal(st({ avancement: 84 }), 'En cours');
    assert.equal(st({ avancement: 0, debut: '2026-11-09' }), 'À démarrer');
    assert.equal(st({ avancement: 0, debut: '2026-10-19' }), 'En cours', '0 % mais commencé');
  });

  await dit('l’état d’un jalon : atteint, manqué (non fait et passé), aujourd’hui, à venir ; placé au milieu de son jour, étiquette à droite pour les 7 derniers jours', () => {
    const e = (jour: string, fait = false) => PRO.etatDuJalon({ jour, fait }, '2026-10-30');
    assert.deepEqual([e('2026-10-23', true), e('2026-10-27'), e('2026-10-30'), e('2026-11-13')], ['atteint', 'manque', 'aujourdhui', 'avenir']);
    const t = fe([proj('a', { jalons: [{ id: 'j1', titre: 'Fin', jour: '2026-12-10', fait: false }, { id: 'j2', titre: 'Milieu', jour: '2026-11-13', fait: false }, { id: 'j3', titre: 'Hors', jour: '2027-01-10', fait: false }] })]);
    const [j2, j1] = t.couloirs[0].jalons.sort((x: any, y: any) => x.jour.localeCompare(y.jour));
    assert.deepEqual([t.couloirs[0].jalons.length, j2.aDroite, j1.aDroite], [2, false, true], 'le jalon hors frise ne se dessine pas');
    assert.equal(Math.round(j2.x * 100) / 100, Math.round((39 * t.pxParJour + t.pxParJour / 2) * 100) / 100);
  });

  await dit('l’ordre des couloirs : en retard d’abord, puis en cours par échéance, puis à démarrer, puis terminés du trimestre seulement', () => {
    const t = fe([
      proj('fini', { avancement: 100, fin: '2026-10-23', termineLe: '2026-10-23' }), proj('ancien', { avancement: 100, fin: '2026-06-01', termineLe: '2026-06-01' }),
      proj('demarrer', { avancement: 0, debut: '2026-11-09', fin: '2026-12-11' }), proj('tard', { fin: '2026-12-20' }), proj('tot', { fin: '2026-11-04' }), proj('retard', { fin: '2026-10-20' }),
    ]);
    assert.deepEqual(t.couloirs.map((c: any) => c.id), ['retard', 'tot', 'tard', 'demarrer', 'fini']);
    assert.deepEqual([t.nbActifs, t.nbEnRetard], [4, 1], '« n actifs » : ni terminés ni archivés ; « dont n en retard »');
    assert.deepEqual(fe([proj('a', { archive: true })]).couloirs, []);
    assert.deepEqual(fe([proj('retard', { fin: '2026-10-20' }), proj('ok')], { filtre: 'enRetard' }).couloirs.map((c: any) => c.id), ['retard']);
    assert.deepEqual(fe([proj('a', { mien: true }), proj('b')], { filtre: 'miens' }).couloirs.map((c: any) => c.id), ['a']);
  });

  await dit('les prochains jalons : non faits, manqués ou des 7 prochains jours, par date (les manqués en tête), quatre au plus ; sinon « rien d’attendu » et le suivant', () => {
    const j = (id: string, jour: string, fait = false) => ({ id, titre: `Jalon ${id}`, jour, fait });
    const t = fe([proj('p', { jalons: [j('a', '2026-10-27'), j('b', '2026-10-30'), j('c', '2026-11-03'), j('d', '2026-11-04'), j('e', '2026-11-05'), j('f', '2026-10-20', true), j('g', '2026-11-12')] })]);
    assert.deepEqual(t.prochains.map((x: any) => x.id), ['a', 'b', 'c', 'd'], 'quatre, le fait et le lointain exclus');
    assert.deepEqual(t.prochains.map((x: any) => x.etat.genre), ['retard', 'aujourdhui', 'jour', 'jour']);
    assert.equal(t.prochains[0].etat.jours, 3);
    assert.equal(t.prochains[2].etat.jourSemaine, 2, 'mardi 3 nov.');
    const rien = fe([proj('p', { jalons: [j('x', '2026-11-20')] })]);
    assert.deepEqual([rien.prochains.length, rien.aucunProchain], [0, { jour: '2026-11-20', titre: 'Jalon x' }]);
  });

  await dit('« terminés ce trimestre » : passés à 100 % depuis le début du trimestre civil ; le lien proposé relie le bas d’une barre au haut de l’autre', () => {
    const t = fe([proj('a', { avancement: 100, termineLe: '2026-10-05' }), proj('b', { avancement: 100, termineLe: '2026-09-30' }), proj('c', { fin: '2026-11-27', debut: '2026-10-19' }), proj('d', { avancement: 0, debut: '2026-11-09', fin: '2026-12-11' })], { objectifTermines: 15, lien: { deId: 'c', versId: 'd', jour: '2026-11-13' } });
    assert.deepEqual(t.terminesTrimestre, { n: 1, objectif: 15 });
    const ordre = t.couloirs.map((c: any) => c.id);
    assert.ok(t.lien.y1 > ordre.indexOf('c') * 48 && t.lien.y2 < (ordre.indexOf('d') + 1) * 48 && t.lien.y2 > ordre.indexOf('d') * 48);
    assert.equal(fe([proj('c')], { lien: { deId: 'c', versId: 'zzz', jour: '2026-11-13' } }).lien, null, 'un lien vers un projet absent ne se dessine pas');
  });

  await dit('MJ01 · textes : mêmes clés en fr et en, tutoiement', () => {
    motsJustes(M.DICTIONNAIRES_PROJETS, 'MJ01');
    assert.equal(M.DICTIONNAIRES_PROJETS.fr['action.nouveau'], 'Nouveau projet');
  });
}

/* ── MJ02 · Habitudes ───────────────────────────────────────────────────── */
if (M.HAB_modele) {
  console.log('\nMa journée — MJ02, Habitudes (grille de régularité, séries, jour à protéger)\n');
  const HAB = M.HAB_modele;
  const AUJ = '2026-10-30';
  const jours = (debut: string, fin: string): string[] => { const out: string[] = []; for (let d = new Date(`${debut}T12:00:00Z`); d <= new Date(`${fin}T12:00:00Z`); d = new Date(d.getTime() + 86_400_000)) out.push(d.toISOString().slice(0, 10)); return out; };
  const hab = (id: string, o: Record<string, unknown> = {}): any => ({ id, nom: `Habitude ${id}`, icone: 'sun', moment: 'matin', rythme: 'Tous les jours', frequence: { type: 'tous les jours' }, mesure: { type: 'case' }, debut: '2026-09-01', historique: Object.fromEntries(jours('2026-09-01', AUJ).map((j) => [j, 1])), ...o });
  const sauf = (manques: string[], fin = AUJ): Record<string, number> => Object.fromEntries(jours('2026-09-01', fin).filter((j) => !manques.includes(j)).map((j) => [j, 1]));
  const reg = (habitudes: any[], o: Record<string, unknown> = {}) => HAB.modeleRegularite({ habitudes, aujourdhui: AUJ, ...o });

  await dit('la grille : 4 semaines de lundi (5 oct.) à dimanche (1er nov.), 28 cases par habitude, rangées dans l’ordre', () => {
    const m = reg([hab('a')]);
    assert.deepEqual([m.debut, m.fin, m.lignes[0].cases.length], ['2026-10-05', '2026-11-01', 28]);
    assert.deepEqual(m.semaines, ['2026-10-05', '2026-10-12', '2026-10-19', '2026-10-26']);
    assert.equal(m.lignes[0].cases[25].jour, '2026-10-30');
    assert.equal(m.lignes[0].cases[25].aujourdhui, true);
  });

  await dit('l’état d’une case : fait, pas fait, non prévu (hebdomadaire), à venir, à faire (aujourd’hui), en cours (mesure commencée), absent avant la création', () => {
    const e = (h: any, j: string) => HAB.etatDeLaCase(h, j, AUJ);
    const d = hab('a', { historique: sauf(['2026-10-12', AUJ]), debut: '2026-10-05' });
    assert.deepEqual([e(d, '2026-10-06'), e(d, '2026-10-12'), e(d, AUJ), e(d, '2026-10-31'), e(d, '2026-10-01')], ['fait', 'pas-fait', 'a-faire', 'a-venir', 'absent']);
    const sport = hab('s', { frequence: { type: 'fois par semaine', fois: 3 }, debut: '2026-10-05', historique: { '2026-10-05': 1, '2026-10-07': 1, '2026-10-09': 1 } });
    assert.equal(e(sport, '2026-10-06'), 'non-prevu', 'le quota de la semaine est atteint : les autres jours ne sont pas attendus');
    const pas = hab('p', { mesure: { type: 'objectif', cible: 8000, unite: 'pas' }, historique: { [AUJ]: 3200 } });
    assert.deepEqual([e(pas, AUJ), HAB.modeleRegularite({ habitudes: [pas], aujourdhui: AUJ }).lignes[0].cases[25].part], ['en-cours', 0.4]);
    assert.equal(e(hab('x', { mesure: { type: 'objectif', cible: 8000, unite: 'pas' }, historique: { [AUJ]: 8000 } }), AUJ), 'fait');
  });

  await dit('la série : jours prévus de suite jusqu’à aujourd’hui (hier si aujourd’hui n’est pas encore fait) ; à zéro, « la série reprend ce soir », jamais « 0 »', () => {
    const l = (manques: string[], fin = AUJ) => reg([hab('a', { historique: sauf(manques, fin) })]).lignes[0];
    assert.equal(l(['2026-10-09']).serie.valeur, 21);
    assert.equal(l(['2026-10-24']).serie.valeur, 6);
    const hier = l([AUJ]);
    assert.equal(hier.serie.valeur, 59, 'aujourd’hui non fait ne casse rien : tous les jours depuis le 1er septembre');
    const zero = l(['2026-10-29', AUJ]);
    assert.deepEqual([zero.serie.valeur, zero.serie.reprend, zero.serie.part], [0, true, 0]);
  });

  await dit('le palier : la prochaine valeur de 7, 14, 21, 30, 60, 100 jours (4, 6, 10, 20 semaines) ; barre = série ÷ palier', () => {
    assert.deepEqual([6, 7, 21, 29, 30, 99, 100].map((n) => HAB.palierDe(n, 'jours')), [7, 14, 30, 30, 60, 100, 200]);
    assert.deepEqual([4, 6, 19].map((n) => HAB.palierDe(n, 'semaines')), [6, 10, 20]);
    const m = reg([hab('a', { historique: sauf(['2026-10-09']) })]);
    assert.deepEqual([m.lignes[0].serie.palier, Math.round(m.lignes[0].serie.part * 100)], [30, 70]);
    const sport = reg([hab('s', { frequence: { type: 'fois par semaine', fois: 3 }, debut: '2026-10-05', historique: Object.fromEntries(['2026-10-05', '2026-10-07', '2026-10-09', '2026-10-12', '2026-10-14', '2026-10-16', '2026-10-19', '2026-10-21', '2026-10-23', '2026-10-26', '2026-10-28', '2026-10-30'].map((j) => [j, 1])) })]).lignes[0].serie;
    assert.deepEqual([sport.valeur, sport.unite, sport.palier], [4, 'semaines', 6]);
  });

  await dit('la régularité sur 4 semaines : cases tenues ÷ prévues, jours passés (aujourd’hui exclu) ; l’écart en points avec les 4 semaines précédentes', () => {
    const parfait = reg([hab('a')]);
    assert.deepEqual([parfait.regularite.pourcent, parfait.regularite.ecartPoints], [100, 0]);
    const sept = ['2026-09-09', '2026-09-10', '2026-09-14', '2026-09-16'];
    const m = reg([hab('a', { historique: sauf(['2026-10-08', '2026-10-15', ...sept]) })]);
    assert.equal(m.regularite.pourcent, 92, '23 jours passés sur 25 : 2 manqués');
    assert.equal(m.regularite.ecartPoints, 92 - 86, '+6 points : 24 jours sur 28 avant');
    assert.equal(reg([hab('a', { debut: AUJ, historique: {} })]).regularite.pourcent, null, 'rien de passé : pas de pourcentage');
  });

  await dit('les journées complètes : jours passés où toutes les habitudes prévues sont tenues ; opacité = (tenues ÷ prévues)²', () => {
    const m = reg([hab('a', { historique: sauf(['2026-10-08']) }), hab('b', { historique: sauf(['2026-10-08', '2026-10-09']) })]);
    assert.deepEqual([m.completes.nbCompletes, m.completes.nbJoursPasses], [23, 25]);
    const j8 = m.completes.jours.find((c: any) => c.jour === '2026-10-08');
    const j9 = m.completes.jours.find((c: any) => c.jour === '2026-10-09');
    assert.deepEqual([j8.complete, j8.opacite, j9.opacite], [false, 0, 0.25]);
    assert.equal(m.completes.jours.find((c: any) => c.jour === AUJ).aVenir, true, 'aujourd’hui n’est pas encore une journée passée');
  });

  await dit('« Selon le jour » : régularité par jour de la semaine ; le plus bas passe en orange seulement s’il est à plus de 10 points sous la moyenne ; « Boîte à zéro » manquée chaque jeudi propose de protéger le jeudi', () => {
    const jeudis = ['2026-10-08', '2026-10-15', '2026-10-22', '2026-10-29'];
    const m = reg([hab('a'), hab('b', { nom: 'Boîte à zéro', historique: sauf(jeudis) })]);
    const j = m.parJour.jours;
    assert.deepEqual([j[3].pourcent, j[0].pourcent, j[3].plusBas, j.filter((x: any) => x.plusBas).length], [50, 100, true, 1]);
    assert.deepEqual(m.proposition, { habitudeId: 'b', nom: 'Boîte à zéro', jourSemaine: 4 });
    const calme = reg([hab('a', { historique: sauf(['2026-10-08']) }), hab('b'), hab('c')]);
    assert.equal(calme.parJour.jours.some((x: any) => x.plusBas), false, 'un seul manqué sur douze : 92 % contre 99 % en moyenne, moins de 10 points d’écart');
    assert.equal(calme.proposition, null);
  });

  await dit('« Aujourd’hui » : n/m tenues, les restantes (trois au plus) avec leur mesure ; tout fait → « Journée complète »', () => {
    const m = reg([hab('a'), hab('b', { historique: sauf([AUJ]) }), hab('p', { nom: 'Marcher', mesure: { type: 'objectif', cible: 8000, unite: 'pas' }, historique: { [AUJ]: 3200 } })], { formater: (n: number) => String(n) });
    assert.deepEqual([m.aujourdhui.faites, m.aujourdhui.prevues, m.aujourdhui.complete], [1, 3, false]);
    assert.deepEqual(m.aujourdhui.restantes.map((r: any) => [r.id, r.genre, r.part, r.valeurTexte]), [['b', 'case', 0, ''], ['p', 'mesure', 0.4, '3200']]);
    assert.equal(reg([hab('a')]).aujourdhui.complete, true);
    assert.equal(reg([]).vide, true);
    assert.equal(reg(['1', '2', '3', '4', '5'].map((i) => hab(i, { historique: {} }))).aujourdhui.restantes.length, 3);
  });

  await dit('le filtre par moment (Matin, Journée, Soir) ne garde que les habitudes de ce moment', () => {
    const hs = [hab('a', { moment: 'matin' }), hab('b', { moment: 'soir' }), hab('c', { moment: null })];
    assert.deepEqual(reg(hs, { filtre: 'matin' }).lignes.map((l: any) => l.id), ['a']);
    assert.deepEqual(reg(hs, { filtre: 'toutes' }).lignes.length, 3);
    assert.equal(reg(hs, { filtre: 'journee' }).lignes.length, 0);
  });

  await dit('jamais de reproche : aucun mot de retard ou d’échec dans les textes, aucune couleur d’erreur sur une case « pas fait »', () => {
    const dico = M.DICTIONNAIRES_HABITUDES;
    for (const l of ['fr', 'en']) for (const k of Object.keys(dico[l])) assert.ok(!/\b(échec|raté|manqué|retard|paresse|failed?|late)\b/i.test(dico[l][k].replace('glisse chaque', '')), `${k} : ${dico[l][k]}`);
    const css = fs.readFileSync(path.join(racine, 'src/refonte/journee/habitudes/habitudes.css'), 'utf8');
    assert.ok(!/etat-critique|etat-erreur/.test(css), 'jamais de rouge dans la grille');
  });

  await dit('MJ02 · textes : mêmes clés en fr et en, tutoiement', () => {
    motsJustes(M.DICTIONNAIRES_HABITUDES, 'MJ02');
    assert.equal(M.DICTIONNAIRES_HABITUDES.fr['action.nouvelle'], 'Nouvelle habitude');
  });
}

/* ── MJ03 · Planning de l'équipe ────────────────────────────────────────── */
if (M.PLA_modele) {
  console.log('\nMa journée — MJ03, Planning de l’équipe (un bloc par personne, charge, créneaux libres, équilibre)\n');
  const PLA = M.PLA_modele;
  const NOW = paris('2026-10-30', '10:42');
  const pers = (id: string, o: Record<string, unknown> = {}): any => ({ id, nom: id, role: 'rôle', enLigne: true, moi: false, disponibiliteH: 35, ...o });
  const cr = (id: string, p: string, jour: string, debut: string, fin: string, o: Record<string, unknown> = {}): any => ({ id, jour, debut, fin, titre: `Créneau ${id}`, categorie: 'interne', personnes: [p], ...o });
  const pl = (personnes: any[], creneaux: any[], o: Record<string, unknown> = {}) => PLA.modelePlanning({ personnes, creneaux, maintenant: NOW, ...o });

  await dit('la semaine : lundi 26 au vendredi 30, un bloc par personne, la personne connectée d’abord, puis l’ordre donné ; jamais un tri par charge', () => {
    const m = pl([pers('b'), pers('c'), pers('a', { moi: true })], [cr('1', 'c', '2026-10-26', '09:00', '18:00')]);
    assert.deepEqual([m.lundi, m.vendredi, m.semaineCourante], ['2026-10-26', '2026-10-30', true]);
    assert.deepEqual(m.blocs.map((b: any) => b.id), ['a', 'b', 'c'], 'moi d’abord, puis l’ordre de l’équipe, pas par charge (c est la plus chargée)');
    assert.equal(m.blocs[0].lignes.length, 5);
    assert.deepEqual(pl([pers('a')], [], { jour: '2026-11-03' }).semaineCourante, false);
  });

  await dit('la barre : position et largeur sur l’axe 9:00–18:00 (784 px, 87,1 px par heure), pas de titre sous 34 px', () => {
    const m = pl([pers('a')], [cr('1', 'a', '2026-10-30', '10:00', '12:00'), cr('2', 'a', '2026-10-30', '16:00', '16:20')]);
    const [b1, b2] = m.blocs[0].lignes[4].barres;
    assert.deepEqual([Math.round(b1.x * 784), Math.round(b1.largeur * 784)], [87, 174]);
    assert.equal(b1.sansTitre, false);
    assert.equal(b2.sansTitre, true);
    assert.equal(PLA.heures(150), '2 h 30');
    assert.equal(PLA.heures(45), '45 min');
  });

  await dit('le total du jour, le réservé de la semaine et la charge ÷ 35 h : verte sous 85 %, orange de 85 à 100 %, rouge au-delà', () => {
    const jours = ['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30'];
    const pleine = (p: string, h: number) => jours.map((j, i) => cr(`${p}${i}`, p, j, '09:00', `${String(9 + h).padStart(2, '0')}:00`));
    const m = pl([pers('v'), pers('o'), pers('r')], [...pleine('v', 5), ...pleine('o', 6), ...pleine('r', 8)]);
    assert.deepEqual(m.blocs.map((b: any) => [b.reserveMin / 60, b.ton]), [[25, 'ok'], [30, 'orange'], [40, 'rouge']]);
    assert.equal(m.blocs[0].lignes[0].totalMin, 300);
    assert.equal(Math.round(m.blocs[1].charge * 100), 86);
    assert.equal(pl([pers('x', { disponibiliteH: 30 })], pleine('x', 6)).blocs[0].ton, 'orange', '30 h sur 30 h : à 100 % exactement, orange');
  });

  await dit('la semaine remplie : réservé de l’équipe ÷ disponible de l’équipe', () => {
    const m = pl([pers('a'), pers('b'), pers('c')], [cr('1', 'a', '2026-10-27', '09:00', '19:00'.replace('19', '18')), cr('2', 'b', '2026-10-27', '09:00', '18:00')]);
    assert.deepEqual([m.remplie.reserveMin, m.remplie.disponibleMin, m.remplie.pourcent], [1080, 6300, 17]);
    assert.equal(pl([], []).remplie.pourcent, null, 'sans personne : pas de pourcentage');
  });

  await dit('les créneaux libres du jour : trous d’au moins 1 h entre l’heure courante et 18:00, additionnés pour l’équipe ; rien hors de la semaine courante', () => {
    const m = pl([pers('a'), pers('r')], [
      cr('1', 'a', '2026-10-30', '09:45', '12:00'), cr('2', 'a', '2026-10-30', '14:00', '17:00'), cr('3', 'r', '2026-10-30', '16:00', '17:00'),
    ]);
    const a = m.blocs[0].lignes[4].libres.map((l: any) => [l.debut, l.fin]);
    assert.deepEqual(a, [['12:00', '14:00'], ['17:00', '18:00']]);
    const r = m.blocs[1].lignes[4].libres.map((l: any) => [l.debut, l.fin, l.dureeMin]);
    assert.deepEqual(r, [['10:42', '16:00', 318], ['17:00', '18:00', 60]]);
    assert.equal(m.heuresLibresAujourdhuiMin, 180 + 378);
    assert.equal(pl([pers('a')], [], { jour: '2026-11-03' }).heuresLibresAujourdhuiMin, null);
    assert.deepEqual(PLA.creneauxLibres([{ debut: '09:00', fin: '17:30' }], 9 * 60), [], 'un trou de 30 min ne se montre pas');
  });

  await dit('l’état du moment : « Rendez-vous X à HH:MM » (client dans moins de 30 min), « Occupé jusqu’à » pendant un créneau, « Libre jusqu’à » sinon', () => {
    const m = pl([pers('a'), pers('b'), pers('c')], [
      cr('1', 'a', '2026-10-30', '11:00', '12:00', { categorie: 'client', titre: 'RDV', titreLong: 'Rendez-vous Menna' }),
      cr('2', 'b', '2026-10-30', '10:00', '12:00'), cr('3', 'c', '2026-10-30', '16:00', '17:00'),
    ]);
    assert.deepEqual(m.blocs.map((b: any) => b.moment), [{ genre: 'rendezVous', titre: 'Rendez-vous Menna', heure: '11:00' }, { genre: 'occupe', jusqua: '12:00' }, { genre: 'libre', jusqua: '16:00' }]);
    assert.equal(pl([pers('a')], [cr('1', 'a', '2026-10-30', '15:00', '16:00', { categorie: 'client' })]).blocs[0].moment.genre, 'libre', 'un client dans plus de 30 min : libre');
    assert.equal(pl([pers('a')], [], { jour: '2026-11-03' }).blocs[0].moment, null, 'hors de la semaine courante : pas d’état');
  });

  await dit('le chevauchement : les deux barres se partagent la hauteur, marquées ; bout à bout ne chevauche pas ; une absence ne compte pas dans la charge', () => {
    const m = pl([pers('a', { absents: ['2026-10-29'] })], [cr('1', 'a', '2026-10-27', '10:00', '12:00'), cr('2', 'a', '2026-10-27', '11:00', '13:00'), cr('3', 'a', '2026-10-28', '09:00', '10:00'), cr('4', 'a', '2026-10-28', '10:00', '11:00'), cr('5', 'a', '2026-10-29', '09:00', '18:00')]);
    const mar = m.blocs[0].lignes[1].barres;
    assert.deepEqual(mar.map((b: any) => [b.conflit, b.rangees, b.rangee]), [[true, 2, 0], [true, 2, 1]]);
    assert.deepEqual(m.blocs[0].lignes[2].barres.map((b: any) => b.conflit), [false, false], 'bout à bout');
    assert.deepEqual([m.blocs[0].lignes[3].absent, m.blocs[0].lignes[3].barres.length, m.blocs[0].lignes[3].totalMin], [true, 0, 0]);
    assert.equal(m.blocs[0].reserveMin, 240 + 120, 'le créneau du jour d’absence ne compte pas');
  });

  await dit('le bandeau d’équilibre : la moins chargée contre la moins chargée des autres, arrondi à l’heure, seulement à partir de 2 h et de trois personnes', () => {
    const h = (p: string, heures: number) => cr(p, p, '2026-10-26', '09:00', `${String(9 + Math.floor(heures)).padStart(2, '0')}:${heures % 1 ? '15' : '00'}`);
    const m = pl([pers('a'), pers('b'), pers('r')], [h('a', 8), h('b', 6), h('r', 1)]);
    assert.deepEqual(m.equilibre, { nom: 'r', ecartH: 5 });
    assert.equal(pl([pers('a'), pers('b'), pers('r')], [h('a', 3), h('b', 3), h('r', 2)]).equilibre, null, 'moins de 2 h d’écart : rien à dire');
    assert.equal(pl([pers('a'), pers('b')], [h('a', 8), h('b', 1)]).equilibre, null, 'à deux, l’écart n’est pas un déséquilibre à rééquilibrer');
  });

  await dit('l’état vide : aucun créneau', () => {
    assert.equal(pl([pers('a')], []).vide, true);
    assert.equal(pl([pers('a')], [cr('1', 'a', '2026-10-26', '09:00', '10:00')]).vide, false);
  });

  await dit('MJ03 · textes : mêmes clés en fr et en, tutoiement', () => {
    motsJustes(M.DICTIONNAIRES_PLANNING, 'MJ03');
    assert.equal(M.DICTIONNAIRES_PLANNING.fr['action.ajouter'], 'Ajouter un créneau');
  });
}

/* ── MJ04 · Notes rapides ───────────────────────────────────────────────── */
if (M.NOT_modele) {
  console.log('\nMa journée — MJ04, Notes rapides (mur de notes, À trier, pied de date, rangement proposé)\n');
  const NOT = M.NOT_modele;
  const AUJ = '2026-10-30';
  const nt = (id: string, o: Record<string, unknown> = {}): any => ({ id, titre: `Note ${id}`, corps: '', type: 'texte', etiquette: null, epinglee: false, updatedAt: '2026-10-30T09:00:00+01:00', ...o });
  const mur = (notes: any[], o: Record<string, unknown> = {}) => NOT.modeleMur({ notes, aujourdhui: AUJ, ...o });

  await dit('le pied : l’heure aujourd’hui, « Hier », le jour abrégé jusqu’à 7 jours, puis la date courte', () => {
    assert.deepEqual(NOT.piedDeNote('2026-10-30T09:12:00+01:00', AUJ), { genre: 'heure', texte: '09:12' });
    assert.deepEqual(NOT.piedDeNote('2026-10-29T16:00:00+01:00', AUJ), { genre: 'hier', texte: 'Hier' });
    assert.deepEqual(NOT.piedDeNote('2026-10-26T10:00:00+01:00', AUJ), { genre: 'jour', texte: 'Lun.' });
    assert.deepEqual(NOT.piedDeNote('2026-10-23T14:00:00+01:00', AUJ), { genre: 'jour', texte: 'Ven.' });
    assert.deepEqual(NOT.piedDeNote('2026-10-12T14:00:00+01:00', AUJ), { genre: 'date', texte: '12 oct.' });
  });

  await dit('« à trier » : ni étiquette, ni client, ni tâche, ni projet, ni dossier ; sans cette source, rien n’est à trier', () => {
    assert.equal(NOT.estATrier({ etiquette: null }), true);
    for (const lien of [{ etiquette: 'Idée' }, { clientId: 3 }, { tacheId: 't1' }, { projectId: 'p1' }, { dossier: 'Chantier' }]) assert.equal(NOT.estATrier({ etiquette: null, ...lien }), false, JSON.stringify(lien));
    const m = mur([nt('a'), nt('b')], { aTrierActif: false });
    assert.deepEqual([m.nbATrier, m.compteurs.aTrier, m.propositions.length], [0, 0, 0]);
    assert.equal(m.colonnes.flat().every((n: any) => !n.aTrier), true);
  });

  await dit('l’ordre : épinglées d’abord, puis les plus récentes ; « anciennes » inverse le reste ; « titre » ignore accents et casse', () => {
    const notes = [nt('a', { updatedAt: '2026-10-28T09:00:00+01:00' }), nt('b', { epinglee: true, updatedAt: '2026-10-20T09:00:00+01:00' }), nt('c', { updatedAt: '2026-10-29T09:00:00+01:00' })];
    assert.deepEqual(mur(notes).ordre.map((n: any) => n.id), ['b', 'c', 'a']);
    assert.deepEqual(mur(notes, { tri: 'anciennes' }).ordre.map((n: any) => n.id), ['b', 'a', 'c']);
    assert.deepEqual(mur([nt('1', { titre: 'Écrire' }), nt('2', { titre: 'abeille' }), nt('3', { titre: 'Zèbre' })], { tri: 'titre' }).ordre.map((n: any) => n.titre), ['abeille', 'Écrire', 'Zèbre']);
  });

  await dit('les compteurs : Toutes, Épinglées, À trier, Vocales ; le filtre et la recherche (sans accents) ne changent pas les compteurs', () => {
    const notes = [nt('a', { epinglee: true, etiquette: 'Idée' }), nt('b', { type: 'vocale', titre: 'Réunion' }), nt('c'), nt('d', { etiquette: 'À faire' })];
    const m = mur(notes);
    assert.deepEqual(m.compteurs, { toutes: 4, epinglees: 1, aTrier: 2, vocales: 1 });
    assert.deepEqual(mur(notes, { filtre: 'vocales' }).ordre.map((n: any) => n.id), ['b']);
    assert.deepEqual(mur(notes, { recherche: 'reunion' }).ordre.map((n: any) => n.id), ['b']);
    assert.deepEqual(mur(notes, { filtre: 'epinglees' }).compteurs, m.compteurs);
  });

  await dit('le mur : quatre colonnes, chaque note dans la colonne la plus courte, de gauche à droite ; la carte d’Ajmani prend la place de la dernière', () => {
    const m = mur(Array.from({ length: 8 }, (_, i) => nt(`n${i}`, { updatedAt: `2026-10-30T0${9 - i}:00:00+01:00` })));
    assert.deepEqual(m.colonnes.map((c: any) => c.length), [2, 2, 2, 2]);
    assert.deepEqual(m.colonnes.map((c: any) => c[0].id), ['n0', 'n1', 'n2', 'n3']);
    const avec = mur(Array.from({ length: 6 }, (_, i) => nt(`n${i}`, { updatedAt: `2026-10-30T0${9 - i}:00:00+01:00` })), { carteAjmaniHauteur: 259 });
    assert.equal(avec.colonnes[3].length, 0, 'la dernière colonne est déjà occupée par la carte');
    assert.equal(mur([nt('a'), nt('b')], { colonnesImposees: [['b'], [], [], ['a']] }).colonnes[3][0].id, 'a', 'un placement imposé est respecté');
  });

  await dit('les propositions de rangement : données par l’appelant, seulement à partir de notes à trier, jamais déduites ici', () => {
    const p = [{ cle: 'p1', note: 'Café', vers: 'Tâches' }];
    assert.deepEqual(mur([nt('a')], { propositions: p }).propositions, p);
    assert.deepEqual(mur([nt('a', { etiquette: 'Idée' })], { propositions: p }).propositions, [], 'rien à trier : pas de carte');
    assert.deepEqual(mur([nt('a')]).propositions, [], 'sans proposition donnée, rien n’est inventé');
  });

  await dit('les états : mur vide (aucune note), filtre sans résultat (des notes, aucune ne passe)', () => {
    const v = mur([]);
    assert.deepEqual([v.vide, v.filtreVide], [true, false]);
    const f = mur([nt('a')], { filtre: 'vocales' });
    assert.deepEqual([f.vide, f.filtreVide], [false, true]);
  });

  await dit('SÉCURITÉ : une note d’accès ne porte jamais sa valeur ; le modèle n’a aucun champ « valeur » ni « code »', () => {
    const m = mur([nt('a', { type: 'acces', titre: 'Code du local', corps: '' })]);
    const note = m.colonnes.flat()[0];
    assert.deepEqual(Object.keys(note).filter((k) => /valeur|code|secret|mot.?de.?passe/i.test(k)), []);
    const source = fs.readFileSync(path.join(racine, 'src/refonte/journee/notes/VueNotes.tsx'), 'utf8');
    assert.ok(source.includes('•••• ••'), 'la vignette montre un masque');
    assert.ok(!/n\.(valeur|code|secret)\b/.test(source), 'la vue ne lit aucune valeur');
  });

  await dit('hauteurEstimee : une liste grandit avec ses lignes, une vocale est plus haute qu’un texte court', () => {
    const court = NOT.hauteurEstimee({ type: 'texte', corps: '' });
    assert.ok(NOT.hauteurEstimee({ type: 'vocale', corps: '' }) > court);
    assert.ok(NOT.hauteurEstimee({ type: 'liste', corps: '', items: [1, 2, 3, 4].map((i) => ({ texte: `${i}`, fait: false })) }) > NOT.hauteurEstimee({ type: 'liste', corps: '', items: [{ texte: 'a', fait: false }] }));
  });

  await dit('MJ04 · textes : mêmes clés en fr et en, tutoiement', () => {
    motsJustes(M.DICTIONNAIRES_NOTES, 'MJ04');
    assert.equal(M.DICTIONNAIRES_NOTES.fr['action.nouvelle'], 'Nouvelle note');
  });
}

/* ── MJ05 · Rappels ──────────────────────────────────────────────────────── */
if (M.RAP_modele) {
  console.log('\nMa journée — MJ05, Rappels (sections, à reprendre, report, tenus à temps)\n');
  const RAP = M.RAP_modele;
  const NOW = paris('2026-10-30', '10:42');
  const rp = (id: string, jour: string, h: string, o: Record<string, unknown> = {}): any => ({ id, titre: `Rappel ${id}`, contexte: '', personne: 'a', initiale: 'A', quandAt: new Date(paris(jour, h)).toISOString(), fait: false, faitAt: null, avanceeMin: 15, ...o });
  const fil = (rappels: any[], o: Record<string, unknown> = {}) => RAP.modeleRappels({ rappels, maintenant: NOW, ...o });
  const ids = (m: any, cle: string): string[] => (m.sections.find((s: any) => s.cle === cle)?.rappels ?? []).map((r: any) => r.id);

  await dit('les sections : faits du jour, Maintenant (à reprendre + les 15 prochaines minutes), Plus tard, Demain, semaine ; une section vide disparaît ; ordre chronologique', () => {
    const m = fil([
      rp('f', '2026-10-30', '08:00', { fait: true, faitAt: new Date(paris('2026-10-30', '08:01')).toISOString() }), rp('r', '2026-10-30', '10:00'), rp('b', '2026-10-30', '10:45'), rp('t', '2026-10-30', '17:00'), rp('t2', '2026-10-30', '14:00'),
      rp('d', '2026-10-31', '10:00'), rp('s2', '2026-11-03', '08:30'), rp('s1', '2026-11-02', '09:00'),
    ]);
    assert.deepEqual(m.sections.map((s: any) => s.cle), ['faits', 'maintenant', 'plus-tard', 'demain', 'semaine']);
    assert.deepEqual(ids(m, 'maintenant'), ['r', 'b'], 'l’imminent reste dans Maintenant, pas dans Plus tard');
    assert.deepEqual(ids(m, 'plus-tard'), ['t2', 't']);
    assert.deepEqual(ids(m, 'semaine'), ['s1', 's2'], 'chronologique strict');
    assert.deepEqual(fil([rp('x', '2026-10-30', '15:00')]).sections.map((s: any) => s.cle), ['plus-tard'], 'rien de fait, rien en cours : ces sections disparaissent');
  });

  await dit('« à reprendre depuis n » (jamais « en retard ») et « dans n min » ; le compteur du titre : restants du jour, dont à reprendre', () => {
    const m = fil([rp('r', '2026-10-30', '10:00'), rp('b', '2026-10-30', '10:45'), rp('t', '2026-10-30', '17:00'), rp('t2', '2026-10-30', '14:00'), rp('d', '2026-10-31', '10:00')]);
    const [r, b] = m.sections[0].rappels;
    assert.deepEqual([r.noeud, r.delai], ['a-reprendre', { genre: 'reprendre', minutes: 42 }]);
    assert.deepEqual([b.noeud, b.delai], ['bientot', { genre: 'dans', minutes: 3 }]);
    assert.deepEqual([m.restantAujourdhui, m.aReprendre], [4, 1], 'demain ne compte pas');
  });

  await dit('« Cette semaine » ou « Semaine prochaine » : le vendredi, la suite est la semaine prochaine', () => {
    assert.equal(fil([]).etiquetteSemaine, 'Semaine prochaine');
    assert.equal(RAP.modeleRappels({ rappels: [], maintenant: paris('2026-10-28', '10:00') }).etiquetteSemaine, 'Cette semaine');
  });

  await dit('l’heure du fil : « HH:MM » aujourd’hui et demain, « Lun. 9:00 » au-delà', () => {
    assert.equal(RAP.heureDuFil(new Date(paris('2026-10-30', '14:00')).toISOString(), '2026-10-30'), '14:00');
    assert.equal(RAP.heureDuFil(new Date(paris('2026-10-31', '10:00')).toISOString(), '2026-10-30'), '10:00');
    assert.equal(RAP.heureDuFil(new Date(paris('2026-11-02', '09:00')).toISOString(), '2026-10-30'), 'Lun. 9:00');
    assert.equal(RAP.heureDuFil(new Date(paris('2026-11-03', '08:30')).toISOString(), '2026-10-30'), 'Mar. 8:30');
  });

  await dit('les puces de report : +1 h, 14:00, Ce soir, le prochain jour ouvré à 9:00 (« Lundi » un vendredi, « Demain » sinon) ; jamais dans les heures calmes', () => {
    const calmes = { actif: true, debut: '20:00', fin: '08:00' };
    const p = RAP.pucesDeReport(NOW, calmes);
    assert.deepEqual(p.map((x: any) => [x.cle, x.heure]), [['plus1h', '11:42'], ['apresMidi', '14:00'], ['soir', '18:00'], ['ouvre', '09:00']]);
    assert.equal(p[3].jourSemaine, 1, 'un vendredi : lundi');
    assert.equal(p[3].jourDemain, false);
    const mercredi = RAP.pucesDeReport(paris('2026-10-28', '10:00'), calmes);
    assert.deepEqual([mercredi[3].jourDemain, mercredi[3].jourSemaine], [true, 4]);
    const tard = RAP.pucesDeReport(paris('2026-10-30', '19:30'), calmes);
    assert.deepEqual(tard.map((x: any) => x.cle), ['ouvre'], '+1 h tomberait à 20:30 (calme), plus d’après-midi, plus de soir');
    assert.equal(RAP.estCalme(21 * 60, calmes), true);
    assert.equal(RAP.estCalme(7 * 60, calmes), true);
    assert.equal(RAP.estCalme(12 * 60, calmes), false);
    assert.equal(RAP.estCalme(21 * 60, { ...calmes, actif: false }), false);
    assert.equal(RAP.prochainJourOuvre('2026-10-30'), '2026-11-02');
  });

  await dit('« Tenus à temps » : faits dans l’heure ÷ échus ce mois ; l’écart en points se compare au mois précédent ; sans échus, pas de pourcentage', () => {
    const tenu = (id: string, j: string, h: string, tard = false) => rp(id, j, h, { fait: true, faitAt: new Date(paris(j, tard ? '15:00' : h) + 600_000).toISOString() });
    const mois = [...['a', 'b', 'c'].map((i) => tenu(i, '2026-10-05', '09:00')), tenu('d', '2026-10-06', '09:00', true), rp('fut', '2026-10-30', '17:00')];
    const prec = [...['p1', 'p2'].map((i) => tenu(i, '2026-09-15', '09:00')), tenu('p3', '2026-09-15', '09:00', true), tenu('p4', '2026-09-15', '09:00', true)];
    const t = RAP.tenusATemps([...mois, ...prec], NOW);
    assert.deepEqual([t.traites, t.total, t.pourcent, t.ecartPoints], [3, 4, 75, 25], '75 % ce mois contre 50 %');
    assert.deepEqual(RAP.tenusATemps([], NOW), { pourcent: null, traites: 0, total: 0, ecartPoints: null });
  });

  await dit('le filtre « Les miens » / « Équipe », la section « Déjà fait » (aujourd’hui seulement) et l’état vide', () => {
    const rs = [rp('a', '2026-10-30', '15:00', { personne: 'a' }), rp('b', '2026-10-30', '16:00', { personne: 'b' }), rp('h', '2026-10-29', '09:00', { fait: true, faitAt: new Date(paris('2026-10-29', '09:05')).toISOString() })];
    assert.deepEqual(ids(fil(rs, { filtre: 'miens', moi: 'a' }), 'plus-tard'), ['a']);
    assert.deepEqual(ids(fil(rs, { filtre: 'equipe', moi: 'a' }), 'plus-tard'), ['b']);
    assert.deepEqual(ids(fil(rs), 'faits'), [], 'ce qui est fait hier n’est plus sur le fil du jour');
    assert.equal(fil([]).vide, true);
  });

  await dit('un rappel PROPOSÉ n’existe pas tant qu’il n’est pas programmé : sur le fil, en pointillé, hors du compte des rappels du jour', () => {
    const m = fil([rp('p', '2026-11-02', '09:00', { propose: true }), rp('s', '2026-11-03', '08:30')]);
    const s = m.sections[0];
    assert.deepEqual([s.nbPrevus, s.nbProposes, s.rappels[0].noeud], [1, 1, 'propose']);
    assert.deepEqual(RAP.tenusATemps([rp('p', '2026-10-02', '09:00', { propose: true })], NOW).total, 0, 'un proposé ne compte pas dans Tenus à temps');
  });

  await dit('heures calmes : un rappel dans la plage porte « silencieux »', () => {
    const m = fil([rp('n', '2026-10-30', '21:00'), rp('j', '2026-10-30', '15:00')], { calmes: { actif: true, debut: '20:00', fin: '08:00' } });
    assert.deepEqual(m.sections[0].rappels.map((r: any) => r.silencieux), [false, true]);
  });

  await dit('VOIX : aucun mot « retard » dans les textes, aucun rouge dans la feuille', () => {
    const dicos = JSON.stringify(M.DICTIONNAIRES_RAPPELS.fr).toLowerCase();
    assert.ok(!/en retard|retard/.test(dicos), 'un rappel passé est « à reprendre »');
    const css = fs.readFileSync(path.join(racine, 'src/refonte/journee/rappels/rappels.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    assert.ok(!/etat-critique/.test(css), 'jamais de rouge sur un rappel');
  });

  await dit('MJ05 · textes : mêmes clés en fr et en, tutoiement', () => {
    motsJustes(M.DICTIONNAIRES_RAPPELS, 'MJ05');
    assert.equal(M.DICTIONNAIRES_RAPPELS.fr['action.nouveau'], 'Nouveau rappel');
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

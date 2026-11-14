/**
 * Contrôle de la LOGIQUE D'ÉCHANGER (LOT-05) — `npm run check:echanger`.
 *
 * Sans réseau, sans navigateur. La logique pure du lot (`src/refonte/echanger/`) est exercée hors interface sur des
 * cas écrits à la main d'après les fiches du dossier v4 (`lots/LOT-05-echanger/`, rubrique 6, avec les valeurs des
 * images), puis rejouée sur les jeux fictifs de SIM (`src/refonte/donnees/`) aux quatre volumes. S'y ajoutent des
 * contrôles de structure : pas d'écran visuel avant le socle v4, aucune brique du socle importée, aucun code partagé,
 * aucun nom ni montant des images dans la logique, aucune adresse de lien, tutoiement dans l'interface.
 *
 *   npm run check:echanger
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ZONE = 'src/refonte/echanger';
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

const FICHIERS = ['commun', 'boite', 'hub', 'canaux', 'connecteurs', 'appels', 'annonces', 'courriel', 'reunions', 'partages', 'sondages', 'reponsesAuto', 'i18n', 'phrases'];

/* eslint-disable @typescript-eslint/no-explicit-any */
const M = await charger<any>(FICHIERS.map((f) => `export * as ${f} from '../${ZONE}/${f}';`).join('\n') + `\nexport * as composerF40 from '../${ZONE}/ecrans/f40/composer';` + `\nexport * as composerG07 from '../${ZONE}/ecrans/g07/composer';` + `\nexport * as composerH14 from '../${ZONE}/ecrans/h14/composer';` + `\nexport * as composerH13 from '../${ZONE}/ecrans/h13/composer';` + `\nexport * as composerMX05 from '../${ZONE}/ecrans/mx05/composer';` + `\nexport * as composerMX04 from '../${ZONE}/ecrans/mx04/composer';` + "\nexport * as monde from '../src/refonte/donnees';");
const { commun: C, boite: B, hub: H, canaux: CA, connecteurs: CO, appels: AP, annonces: AN, courriel: CM, reunions: RE, partages: PA, sondages: SO, reponsesAuto: AU, i18n: I, phrases: PH, composerF40: CF40, composerG07: CG07, composerH14: CH14, composerH13: CH13, composerMX05: CMX05, composerMX04: CMX04, monde } = M;
const A_SEG = AN.segmentsDeLecture;

const NB = ' ';
const paris = (j: string, hhmm: string): number => C.instantParis(j, Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3)));
const AUJ = '2026-10-30'; // vendredi
const VEILLE = '2026-10-29';
const MAINT = paris(AUJ, '10:15');
const at = (j: string, h: string) => new Date(paris(j, h)).toISOString();

/* ── Communs ─────────────────────────────────────────────────────────────── */
console.log('Échanger — communs\n');

await dit('temps d’attente : « 6 min », « 1 h 05 », puis « hier » ; compteur d’appel mm:ss puis h:mm:ss', () => {
  assert.equal(C.attenteLisible(6 * 60_000), `6${NB}min`);
  assert.equal(C.attenteLisible(30_000), `1${NB}min`);
  assert.equal(C.attenteLisible(65 * 60_000), `1${NB}h${NB}05`);
  assert.equal(C.attenteLisible(80 * 60_000), `1${NB}h${NB}20`);
  assert.equal(C.attenteLisible(30 * 3_600_000), 'hier');
  assert.equal(C.attenteLisible(30 * 3_600_000, 'en'), 'yesterday');
  assert.equal(C.dureeDAppel(65), '01:05');
  assert.equal(C.dureeDAppel(3725), '1:02:05');
  assert.equal(C.dureeDAppel(-4), '00:00');
});
await dit('heure de Paris : hiver (+1) depuis le 25 oct. 2026, été (+2) avant ; vendredi 30 oct.', () => {
  assert.equal(new Date(C.instantParis(AUJ, 10 * 60)).toISOString(), '2026-10-30T09:00:00.000Z');
  assert.equal(new Date(C.instantParis('2026-10-20', 10 * 60)).toISOString(), '2026-10-20T08:00:00.000Z');
  assert.deepEqual(C.partiesParis('2026-10-30T09:15:00Z'), { jour: AUJ, minutes: 615, jourSemaine: 5 });
  assert.equal(C.minutesEcoulees('2026-10-30T09:00:00Z', '2026-10-30T09:12:59Z'), 12);
  assert.equal(C.minutesEcoulees('2026-10-30T09:00:00Z', '2026-10-30T08:00:00Z'), 0);
});

/* ── Boîte des clients (G07) ─────────────────────────────────────────────── */
console.log('\nÉchanger — la boîte des clients (G07)\n');

const msg = (id: string, clientId: number | null, sens: string, quand: string, plus: Record<string, unknown> = {}) => ({ id, clientId, canal: 'courriel', sens, at: quand, lu: false, ...plus });
const MESSAGES = [
  msg('m1', 1, 'entrant', at(AUJ, '08:55')),
  msg('m1n', 1, 'sortant', at(AUJ, '10:05'), { noteInterne: true }),
  msg('m2', 2, 'entrant', at(VEILLE, '17:00')),
  msg('m3a', 3, 'entrant', at(AUJ, '09:00')),
  msg('m3b', 3, 'sortant', at(AUJ, '09:30')),
  msg('m4', 4, 'entrant', at(AUJ, '08:00'), { canal: 'whatsapp' }),
  msg('m5', 5, 'entrant', at(AUJ, '07:00'), { canal: 'sms' }),
  msg('m6', 6, 'entrant', at(VEILLE, '09:00')),
  msg('mx', null, 'entrant', at(AUJ, '10:00'), { expediteur: 'inconnu@exemple.test' }),
  msg('m7a', 7, 'entrant', at(AUJ, '07:00')),
  msg('m7b', 7, 'entrant', at(AUJ, '09:45')),
];
const GESTES = [
  { filId: 'client:4', etat: 'en-attente', at: at(AUJ, '09:00'), attend: 'le plan signé' },
  { filId: 'client:5', etat: 'fait', at: at(AUJ, '08:00') },
  { filId: 'client:6', etat: 'fait', at: at(VEILLE, '10:00') },
  { filId: 'client:7', etat: 'en-attente', at: at(AUJ, '08:00') },
];
const FILS = B.composerFils(MESSAGES, GESTES, MAINT);
const fil = (id: string) => FILS.find((f: any) => f.filId === id);

await dit('les trois couloirs : à répondre, en attente, fait ; remis à zéro chaque nuit', () => {
  assert.equal(fil('client:1').couloir, 'a-repondre');
  assert.equal(fil('client:2').couloir, 'a-repondre', 'hier, sans réponse : reste à répondre');
  assert.equal(fil('client:3').couloir, 'fait', 'réponse envoyée aujourd’hui');
  assert.equal(fil('client:4').couloir, 'en-attente');
  assert.equal(fil('client:4').attend, 'le plan signé');
  assert.equal(fil('client:5').couloir, 'fait');
  assert.equal(fil('client:6').couloir, null, 'fait hier : dans aucun couloir, l’historique reste dans le fil');
  assert.equal(fil('inconnu:inconnu@exemple.test').couloir, 'a-repondre');
  assert.equal(fil('inconnu:inconnu@exemple.test').inconnu, true);
});
await dit('un nouveau message du client fait revenir le fil « en attente » dans « à répondre » ; le plus ancien sans réponse compte', () => {
  assert.equal(fil('client:7').couloir, 'a-repondre');
  assert.equal(fil('client:7').enAttenteDepuis, paris(AUJ, '07:00'), 'le plus ancien message sans réponse, pas le dernier');
});
await dit('une note interne n’est ni un message du client ni la dernière réponse ; elle n’entre jamais dans un export client', () => {
  assert.equal(fil('client:1').dernierAt, paris(AUJ, '08:55'));
  assert.equal(B.exportPourLeClient(MESSAGES).some((m: any) => m.noteInterne), false);
  assert.equal(B.exportPourLeClient(MESSAGES).length, MESSAGES.length - 1);
});
await dit('à répondre : le plus ancien d’abord ; badge = nombre de fils à répondre', () => {
  assert.deepEqual(B.aRepondre(FILS).map((f: any) => f.filId), ['client:2', 'client:7', 'client:1', 'inconnu:inconnu@exemple.test']);
  assert.equal(B.badgeDeLaMessagerie(FILS), 4);
});
await dit('heures ouvrées : jeudi 17 h → vendredi 10 h 15 = 135 min ; le week-end ne compte pas', () => {
  assert.equal(B.minutesOuvrees(at(VEILLE, '17:00'), MAINT), 135);
  assert.equal(B.minutesOuvrees(at(AUJ, '17:00'), at('2026-11-02', '10:00')), 120);
  assert.equal(B.minutesOuvrees(at(AUJ, '06:00'), at(AUJ, '08:00')), 0, 'avant l’ouverture');
  assert.equal(B.minutesOuvrees(MAINT, MAINT), 0);
  assert.equal(B.minutesOuvrees(at('2026-11-01', '10:00'), at('2026-11-01', '15:00')), 0, 'dimanche');
});
await dit('attente : orange au-delà de 2 h ouvrées, jamais rouge ; promesse réglable', () => {
  assert.equal(B.attente(fil('client:2'), MAINT).depasse, true);
  assert.equal(B.attente(fil('client:1'), MAINT).depasse, false);
  assert.equal(B.attente(fil('client:1'), MAINT, { promesseMinutes: 60 }).depasse, true);
  assert.equal(B.attente(fil('client:3'), MAINT), null, 'hors « à répondre »');
  assert.equal(C.attenteLisible(B.attente(fil('client:1'), MAINT).ms), `1${NB}h${NB}20`);
});
await dit('filtres de canal : les fils du jour comptés par canal du dernier message', () => {
  assert.deepEqual(B.compteursParCanal(FILS), { tous: 7, courriel: 5, whatsapp: 1, sms: 1 });
});
await dit('rattachement : par adresse ou numéro connus ; un inconnu n’est rattaché à personne', () => {
  const fiches = [{ clientId: 7, emails: ['Contact@Exemple.test'], telephones: ['06 39 98 00 01'] }];
  assert.equal(B.rattacher('contact@exemple.test', fiches), 7);
  assert.equal(B.rattacher('+33 6 39 98 00 01', fiches), 7);
  assert.equal(B.rattacher('06.39.98.00.01', fiches), 7);
  assert.equal(B.rattacher('autre@exemple.test', fiches), null);
  assert.equal(B.rattacher('01 99 00 12 34', fiches), null);
  assert.equal(B.memeTelephone('123', '123'), false, 'trop court pour comparer');
  assert.equal(B.numeroMasque('06 39 98 00 01'), '… 00 01', 'jamais un numéro entier dans une liste');
});
await dit('Boîte à zéro : 7 fils du jour, 2 faits, 1 chez eux, 4 à répondre ; carrés dans l’ordre fait, en attente, à répondre', () => {
  const b = B.boiteAZero(MESSAGES, FILS, MAINT);
  assert.deepEqual({ total: b.total, faits: b.faits, chezEux: b.chezEux, aRepondre: b.aRepondre, valeur: b.valeur, pourcent: b.pourcent }, { total: 7, faits: 2, chezEux: 1, aRepondre: 4, valeur: 3, pourcent: 43 });
  assert.deepEqual(b.carres, ['fait', 'fait', 'en-attente', 'a-repondre', 'a-repondre', 'a-repondre', 'a-repondre']);
  assert.equal(b.atteinte, false);
  assert.equal(PH.phraseDeLaBoite(b, 'fr'), 'encore 4 réponses et c’est fini');
});
await dit('Boîte à zéro : 12 sur 17 = 71 % ; atteinte à 0 ; journée calme sans message', () => {
  const faits = Array.from({ length: 9 }, (_, i) => msg(`f${i}`, 100 + i, 'sortant', at(AUJ, '09:10')));
  const entrants = Array.from({ length: 9 }, (_, i) => msg(`e${i}`, 100 + i, 'entrant', at(AUJ, '09:00')));
  const attente = Array.from({ length: 3 }, (_, i) => msg(`w${i}`, 200 + i, 'sortant', at(AUJ, '09:20')));
  const entW = Array.from({ length: 3 }, (_, i) => msg(`ew${i}`, 200 + i, 'entrant', at(AUJ, '09:00')));
  const reste = Array.from({ length: 5 }, (_, i) => msg(`r${i}`, 300 + i, 'entrant', at(AUJ, '09:30')));
  const gestes = [200, 201, 202].map((id) => ({ filId: `client:${id}`, etat: 'en-attente', at: at(AUJ, '09:40') }));
  const tous = [...faits, ...entrants, ...attente, ...entW, ...reste];
  const f = B.composerFils(tous, gestes, MAINT);
  const b = B.boiteAZero(tous, f, MAINT);
  assert.deepEqual({ total: b.total, valeur: b.valeur, pourcent: b.pourcent, aRepondre: b.aRepondre }, { total: 17, valeur: 12, pourcent: 71, aRepondre: 5 });
  assert.equal(PH.phraseDeLaBoite(b, 'fr'), 'encore 5 réponses et c’est fini');
  const zero = B.boiteAZero(entrants, B.composerFils([...entrants, ...faits], [], MAINT), MAINT);
  assert.equal(zero.atteinte, true);
  assert.equal(PH.phraseDeLaBoite(zero, 'fr'), 'Boîte à zéro, belle journée');
  const calme = B.boiteAZero([], [], MAINT);
  assert.deepEqual({ total: calme.total, calme: calme.calme, atteinte: calme.atteinte }, { total: 0, calme: true, atteinte: false });
  assert.equal(PH.phraseDeLaBoite(calme, 'fr'), 'Journée calme pour l’instant');
  assert.equal(I.direCompte('fr', 'boite.encore', 1), 'encore une réponse et c’est fini');
});
await dit('belle série : soirs de suite à zéro (jours ouvrés), aujourd’hui seulement après 19 h ; une journée manquée remet à zéro', () => {
  const soirs = [['2026-10-22', 3], ['2026-10-23', 0], ['2026-10-26', 0], ['2026-10-27', 0], ['2026-10-28', 0], ['2026-10-29', 0]].map(([jour, n]) => ({ jour, aRepondreALaFin: n }));
  const s = B.serieDeSoirs(soirs, MAINT);
  assert.equal(s.serie, 5, 'le week-end est sauté');
  assert.deepEqual(s.semaine.map((x: any) => x.etat), ['zero', 'zero', 'zero', 'zero', 'aujourdhui']);
  const tard = B.serieDeSoirs([...soirs, { jour: AUJ, aRepondreALaFin: 0 }], paris(AUJ, '19:30'));
  assert.equal(tard.serie, 6);
  assert.equal(tard.semaine[4].etat, 'zero');
  assert.equal(B.serieDeSoirs([...soirs.filter((x) => x.jour !== '2026-10-28'), { jour: '2026-10-28', aRepondreALaFin: 2 }], MAINT).serie, 1);
  assert.equal(B.serieDeSoirs([], MAINT).serie, 0);
  assert.equal(PH.phraseDeSerieDeSoirs(4, 'fr'), 'à zéro 4 soirs de suite');
  assert.equal(PH.phraseDeSerieDeSoirs(0, 'fr'), null, 'jamais « 0 soir »');
});
await dit('contexte client : « Rien en retard » en vert, « N impayée(s) » en orange avec le montant, « Rien à signaler » sinon', () => {
  const c = Object.fromEntries(B.contexteClient({ contrat: { actif: true, echeance: '2027-03-01' }, dernierPassage: { le: '2026-10-12', par: 'quelqu’un' }, facturesEnRetard: { nombre: 0, montantCents: 0 }, prochaineEcheance: '2026-11-20', creneauxLibres: ['mardi 9 h', 'mardi 14 h'] }).map((x: any) => [x.cle, x]));
  assert.equal(c.factures.ton, 'vert');
  assert.equal(c.factures.valeur.prochaineEcheance, '2026-11-20');
  assert.equal(c.contrat.valeur.echeance, '2027-03-01');
  assert.equal(c.creneaux.valeur.length, 2);
  const o = Object.fromEntries(B.contexteClient({ facturesEnRetard: { nombre: 2, montantCents: 123_400 } }).map((x: any) => [x.cle, x]));
  assert.deepEqual({ ton: o.factures.ton, n: o.factures.valeur.nombre, m: o.factures.valeur.montantCents }, { ton: 'orange', n: 2, m: 123_400 });
  assert.equal(o.contrat.valeur, null);
  assert.equal(o.creneaux.valeur, null);
  assert.equal(B.contexteClient({}).every((x: any) => x.cle === 'factures' || x.valeur === null), true);
  assert.equal(I.direCompte('fr', 'contexte.impayees', 2), '2 impayées');
});
await dit('canal de réponse : celui du dernier message ; un canal débranché est grisé ; sinon le premier qui sert', () => {
  const etats = [{ canal: 'courriel', etat: 'actif' }, { canal: 'whatsapp', etat: 'a-reconnecter' }, { canal: 'sms', etat: 'a-brancher' }];
  assert.deepEqual({ ...B.canalDeReponse('courriel', etats), choix: undefined }, { canal: 'courriel', grise: false, choix: undefined });
  const w = B.canalDeReponse('whatsapp', etats);
  assert.deepEqual([w.canal, w.grise], ['courriel', false]);
  assert.equal(w.choix.find((c: any) => c.canal === 'whatsapp').grise, true);
  assert.equal(B.canalDeReponse('sms', etats.map((e) => ({ ...e, etat: 'a-brancher' }))).grise, true);
  assert.equal(B.brouillonPartSeul(), false, 'le brouillon d’Ajmani ne part jamais seul');
});

/* ── Connecteurs (S9) ────────────────────────────────────────────────────── */
console.log('\nÉchanger — « connecteur à brancher »\n');

const prise = (categorie: string, etat: string, motif: string | null, plus: Record<string, unknown> = {}) => ({
  categorie, prise: 1, optionId: 'x', etat, motif, droits: [], coutAccepte: null, derniereSynchroAt: MAINT - 3_600_000, synchroEnCours: false, erreur: null, widgets: 0, changeAt: null, ...plus,
});
await dit('l’état d’un canal vient de la baie de S9 : actif, à brancher, à reconnecter, en erreur, arrêté', () => {
  assert.equal(CO.etatDeCategorie('whatsapp', [], MAINT), 'a-brancher', 'aucune prise : à brancher');
  assert.equal(CO.etatDeCategorie('whatsapp', [prise('whatsapp', 'connecte', null)], MAINT), 'actif');
  assert.equal(CO.etatDeCategorie('whatsapp', [prise('whatsapp', 'a-connecter', 'a-reconnecter')], MAINT), 'a-reconnecter');
  assert.equal(CO.etatDeCategorie('whatsapp', [prise('whatsapp', 'a-connecter', 'erreur')], MAINT), 'erreur');
  assert.equal(CO.etatDeCategorie('whatsapp', [prise('whatsapp', 'a-connecter', 'libre')], MAINT), 'a-brancher');
  assert.equal(CO.etatDeCategorie('whatsapp', [prise('whatsapp', 'arrete', 'volontaire')], MAINT), 'arrete');
  assert.equal(CO.etatDeCategorie('whatsapp', [prise('sms', 'connecte', null)], MAINT), 'a-brancher', 'une autre catégorie ne compte pas');
  assert.equal(CO.etatDeCategorie('messagerie', [prise('messagerie', 'a-connecter', 'a-reconnecter'), prise('messagerie', 'connecte', null, { prise: 2 })], MAINT), 'actif', 'une prise branchée suffit');
});
await dit('les trois canaux de la boîte : courriel (messagerie), WhatsApp et SMS chacun leur prise', () => {
  const e = CO.etatsDesCanaux([prise('messagerie', 'connecte', null), prise('sms', 'a-connecter', 'a-reconnecter')], MAINT);
  assert.deepEqual(e, [{ canal: 'courriel', etat: 'actif' }, { canal: 'whatsapp', etat: 'a-brancher' }, { canal: 'sms', etat: 'a-reconnecter' }]);
  assert.equal(CO.aucunCanalBranche(CO.etatsDesCanaux([], MAINT)), true);
  assert.equal(CO.aucunCanalBranche(e), false);
  assert.equal(I.dire('fr', 'canal.aBrancher'), 'connecteur à brancher');
  assert.equal(I.dire('fr', 'canal.aReconnecter'), 'À reconnecter');
});
await dit('H13 : sans ligne pro branchée, l’appel se fait dans l’application seulement ; avec elle, ligne pro', () => {
  assert.equal(CO.modeDAppel([], MAINT), 'application-seulement');
  assert.equal(CO.modeDAppel([prise('telephonie', 'a-connecter', 'libre')], MAINT), 'application-seulement');
  assert.equal(CO.modeDAppel([prise('telephonie', 'connecte', null)], MAINT), 'ligne-pro');
  assert.equal(AP.paveVisible(true, false), false);
  assert.equal(AP.paveVisible(true, true), true);
  assert.equal(AP.paveVisible(false, true), false, 'sans droit d’appel externe');
});

/* ── Vue d'ensemble (F40) ────────────────────────────────────────────────── */
console.log('\nÉchanger — vue d’ensemble (F40)\n');

await dit('règle d’attente : échelle en racine carrée, orange au-delà de la promesse, personne n’attend → message calme', () => {
  const r = H.regleDAttente(FILS, MAINT);
  assert.equal(r.nombre, 4);
  assert.equal(r.personneNAttend, false);
  const pos = Object.fromEntries(r.clients.map((c: any) => [c.filId, c]));
  assert.ok(Math.abs(pos['client:1'].position - Math.sqrt(80 / 180)) < 1e-9);
  assert.ok(pos['client:2'].position >= pos['client:7'].position && pos['client:7'].position > pos['client:1'].position, 'plus on attend, plus on est à droite (à égalité au bout de l’axe de 3 h)');
  assert.equal(pos['client:2'].orange, true);
  assert.equal(pos['client:1'].orange, false);
  assert.ok(r.clients.every((c: any) => c.position >= 0 && c.position <= 1));
  assert.ok(Math.abs(H.regleDAttente(FILS, MAINT, { echelleMs: 60_000 }).clients[3].position - 1) < 1e-9, 'au-delà de l’axe : plafonné à 1');
  const vide = H.regleDAttente([], MAINT);
  assert.deepEqual([vide.nombre, vide.personneNAttend], [0, true]);
  assert.equal(PH.phraseDeLaRegle(0, paris(AUJ, '10:15'), 'fr'), 'Personne n’attend de réponse. Belle matinée.');
  assert.equal(PH.phraseDeLaRegle(0, paris(AUJ, '15:00'), 'fr'), 'Personne n’attend de réponse. Belle journée.');
  assert.equal(PH.phraseDeLaRegle(5, MAINT, 'fr'), '5 clients attendent');
});
await dit('présence « lit / écrit » : l’instant présent seulement, rien n’est gardé', () => {
  assert.deepEqual(H.presenceDuFil([], []), { etat: 'personne' });
  assert.deepEqual(H.presenceDuFil(['a'], []), { etat: 'lit', par: 'a' });
  assert.deepEqual(H.presenceDuFil(['a'], ['b']), { etat: 'ecrit', par: 'b' });
  assert.equal(I.dire('fr', 'presence.lit', { qui: 'Camille', nom: 'un client' }), 'Camille lit un client');
});
await dit('canaux actifs : un message dans les 2 dernières heures ; barres par tranche de 5 min, plafonnées à 4 ; les calmes ensuite', () => {
  const canaux = [{ id: 'a', nom: 'a' }, { id: 'b', nom: 'b' }, { id: 'c', nom: 'c' }];
  const m = [
    ...[0, 1, 2, 3, 4].map((i) => ({ canalId: 'a', at: MAINT - i * 10_000 })),
    { canalId: 'a', at: MAINT - 12 * 60_000 },
    { canalId: 'b', at: MAINT - 3 * 3_600_000 },
  ];
  const l = H.canauxActifs(canaux, m, MAINT, { a: 2 });
  assert.deepEqual(l.map((x: any) => [x.id, x.actif]), [['a', true], ['b', false], ['c', false]]);
  assert.equal(l[0].barres.length, 12);
  assert.equal(l[0].barres[11], 4, '5 messages dans la dernière tranche : plafonné à 4');
  assert.equal(l[0].barres[9], 1);
  assert.equal(l[0].attendent, 2);
  assert.equal(l[2].dernierAt, null);
  assert.deepEqual(l[2].barres, Array(12).fill(0));
  assert.equal(H.messagesDepuis([{ at: at(AUJ, '07:59') }, { at: at(AUJ, '08:00') }, { at: at(AUJ, '10:00') }, { at: at(AUJ, '11:00') }], MAINT), 2);
  assert.equal(H.proposerResume(21, 3), true);
  assert.equal(H.proposerResume(20, 3), false);
  assert.equal(H.proposerResume(40, 2), false);
});
await dit('cases du jour : deux « Répondre à… » (les plus anciens) et « Archiver N messages lus » ; elles se cochent seules', () => {
  const c = H.casesDuJour(FILS, [], 6, 0);
  assert.deepEqual(c.map((x: any) => [x.genre, x.filId ?? x.n, x.fait]), [['repondre', 'client:2', false], ['repondre', 'client:7', false], ['archiver', 6, false]]);
  const fait = H.casesDuJour(FILS.filter((f: any) => f.filId !== 'client:2'), ['client:2'], 0, 6);
  assert.equal(fait[0].fait, true);
  assert.equal(fait[2].fait, true);
});
await dit('les dix tuiles ; orange quand une action est attendue ; un métier à 3 modules ne voit que les siens', () => {
  assert.deepEqual(H.MODULES_D_ECHANGER.map((m: any) => m.cle), ['messagerie', 'courriel', 'canaux', 'appels', 'reunions', 'annonces', 'partages', 'sondages', 'reponsesAuto', 'programmes']);
  const mesures = { aRepondre: 5, courrielsNonLus: 3, canauxNonLus: 4, canauxAvecNonLus: 2, appelsEnCours: 1, reunionsAujourdhui: 2, annoncesAConfirmer: 1, partagesActifs: 17, sondagesEnCours: 2, reglesActives: 5, reglesTotal: 7, envoisProgrammes: 2 };
  const t = Object.fromEntries(H.tuilesDuHub(mesures).map((x: any) => [x.cle, x]));
  assert.equal(H.tuilesDuHub(mesures).length, 10);
  assert.deepEqual([t.messagerie.ton, t.messagerie.pastille], ['orange', 5]);
  assert.equal(t.canaux.ton, 'neutre');
  assert.deepEqual(t.reponsesAuto.nombres, [5, 7]);
  assert.deepEqual(H.tuilesDuHub(mesures, new Set(['messagerie', 'canaux', 'appels'])).map((x: any) => x.cle), ['messagerie', 'canaux', 'appels']);
  assert.equal(H.tuilesDuHub({ ...mesures, aRepondre: 0 })[0].pastille, null);
  assert.equal(I.dire('fr', 'tuile.reponsesAuto', { n: 5, total: 7 }), '5 actives sur 7');
  assert.equal(H.salutation(paris(AUJ, '10:15')), 'bonjour');
  assert.equal(H.salutation(paris(AUJ, '18:30')), 'bonsoir');
  assert.equal(H.messagesDuJour([{ at: at(AUJ, '08:00') }, { at: at(VEILLE, '08:00') }], AUJ), 1);
});

/* ── Canaux d'équipe (MX04) ──────────────────────────────────────────────── */
console.log('\nÉchanger — canaux d’équipe (MX04)\n');

const cm = (id: string, auteurEmail: string, quand: string, plus: Record<string, unknown> = {}) => ({ id, canalId: 'c1', auteurEmail, at: quand, texte: `texte ${id}`, ...plus });
await dit('non lus : les messages d’un autre postérieurs à la dernière lecture ; « 3 nouveaux messages » pendant la lecture', () => {
  const ms_ = [cm('1', 'a@x.test', at(AUJ, '09:00')), cm('2', 'moi@x.test', at(AUJ, '09:10')), cm('3', 'a@x.test', at(AUJ, '09:20')), cm('4', 'b@x.test', at(AUJ, '09:30'))];
  assert.equal(CA.nonLus(ms_, at(AUJ, '09:05'), 'moi@x.test'), 2);
  assert.equal(CA.nonLus(ms_, null, 'moi@x.test'), 3);
  assert.equal(CA.nouveauxPendantLaLecture(ms_, at(AUJ, '09:25'), 'moi@x.test'), 1);
});
await dit('droits : un invité ne voit que les canaux où il est membre et n’a pas « Nouveau canal » ; les archivés sont masqués', () => {
  const canaux = [{ id: 'p', nom: 'p', visibilite: 'public', membres: ['a@x.test'] }, { id: 'q', nom: 'q', visibilite: 'privé', membres: ['i@x.test'] }, { id: 'r', nom: 'r', visibilite: 'public', membres: [], archive: true }];
  assert.deepEqual(CA.canauxVisibles(canaux, 'i@x.test', 'Invité'), { canaux: [canaux[1]], peutCreer: false });
  assert.deepEqual(CA.canauxVisibles(canaux, 'm@x.test', 'Membre').canaux.map((c: any) => c.id), ['p']);
  assert.equal(CA.canauxVisibles(canaux, 'm@x.test', 'Membre').peutCreer, true);
});
await dit('carte d’événement d’un ticket : suit le ticket, n’est pas un message (ni réaction ni fil)', () => {
  assert.deepEqual(CA.evenementDeTicket({ id: 't1', urgent: true }, true), { genre: 'evenement', ticketId: 't1', etat: 'urgent', resoluAt: null });
  assert.equal(CA.evenementDeTicket({ id: 't1', urgent: true, resoluAt: at(AUJ, '09:15') }, true)?.etat, 'resolu');
  assert.equal(CA.evenementDeTicket({ id: 't1', urgent: true }, false), null, 'canal sans alerte branchée');
  assert.equal(CA.evenementDeTicket({ id: 't1', urgent: false }, true), null);
  assert.equal(CA.estUnMessage({ genre: 'evenement' }), false);
  assert.equal(CA.estUnMessage({}), true);
});
await dit('réactions : trois icônes, une par personne et par icône, pas d’emoji ; le même geste la retire', () => {
  assert.deepEqual([...CA.REACTIONS], ['coche', 'oeil', 'etoile']);
  let r: any[] = [];
  r = CA.basculerReaction(r, 'a', 'coche');
  r = CA.basculerReaction(r, 'a', 'coche').concat(CA.basculerReaction([], 'b', 'coche'));
  assert.deepEqual(CA.comptesDeReactions(r), { coche: 1, oeil: 0, etoile: 0 });
  r = CA.basculerReaction(r, 'b', 'oeil');
  assert.deepEqual(CA.comptesDeReactions(r), { coche: 1, oeil: 1, etoile: 0 });
  assert.throws(() => CA.basculerReaction([], 'a', '👍'));
});
await dit('fil : réponses, dernière réponse, abonnés (auteur, répondants, mentionnés)', () => {
  const tous = [cm('1', 'a@x.test', at(AUJ, '09:00'), { mentions: ['m@x.test'] }), cm('2', 'b@x.test', at(AUJ, '09:10'), { repondA: '1' }), cm('3', 'c@x.test', at(AUJ, '09:40'), { repondA: '1', mentions: ['d@x.test'] }), cm('4', 'e@x.test', at(AUJ, '09:50'))];
  const f = CA.resumeDeFil(tous[0], tous);
  assert.equal(f.reponses, 2);
  assert.equal(f.derniereAt, paris(AUJ, '09:40'));
  assert.deepEqual(f.abonnes.sort(), ['a@x.test', 'b@x.test', 'c@x.test', 'd@x.test', 'm@x.test']);
  assert.equal(CA.resumeAJour(2, 3), false, 'le résumé d’Ajmani est recalculé à chaque réponse');
  assert.equal(CA.RESUME_MAX_PHRASES, 3);
});
await dit('saisie en cours : disparaît après 6 s ; statut d’un message direct (concentré, écrit…, heure)', () => {
  const t = MAINT;
  const f = [{ email: 'a', tapeA: t - 5000 }, { email: 'b', tapeA: t - 7000 }, { email: 'moi', tapeA: t - 1000 }];
  assert.deepEqual(CA.quiEcrit(f, 'moi', t), ['a']);
  assert.deepEqual(CA.statutDeMessageDirect({ concentre: true }, t), { genre: 'concentre' });
  assert.deepEqual(CA.statutDeMessageDirect({ concentre: false, tapeA: t - 2000 }, t), { genre: 'ecrit' });
  assert.deepEqual(CA.statutDeMessageDirect({ concentre: false, tapeA: t - 9000, dernierMessageAt: t - 60_000 }, t), { genre: 'heure', at: t - 60_000 });
});
await dit('message vers tâche : le texte, l’auteur, et le message d’origine par son identifiant', () => {
  assert.deepEqual(CA.tacheDepuisMessage(cm('9', 'a@x.test', at(AUJ, '09:00'), { texte: 'Relancer le devis\nsuite du message' })), { titre: 'Relancer le devis', auteurEmail: 'a@x.test', messageId: '9', canalId: 'c1' });
});

/* ── Appels et salles (H13) ──────────────────────────────────────────────── */
console.log('\nÉchanger — appels et salles (H13)\n');

await dit('poste interne : le nom est résolu dès 3 chiffres, pas avant, pas pour un numéro externe', () => {
  const annuaire = [{ numero: '102', nom: 'Un collègue' }, { numero: '103', nom: 'Une autre' }];
  assert.equal(AP.resoudrePoste('102', annuaire)?.nom, 'Un collègue');
  assert.equal(AP.resoudrePoste('10', annuaire), null);
  assert.equal(AP.resoudrePoste('1022', annuaire), null);
  assert.equal(AP.resoudrePoste('999', annuaire), null);
  assert.equal(AP.resoudrePoste('1 0 2', annuaire)?.numero, '102');
});
await dit('salle en cours : « depuis 8 min », « 2 sur 8 places », un seul halo (le dernier qui parle dans la seconde) ; libre : prochain événement', () => {
  const salle = { id: 's', nom: 's', capacite: 8 };
  const e = AP.etatDeSalle(salle, [{ email: 'a', voixA: MAINT - 400 }, { email: 'b', voixA: MAINT - 100 }, { email: 'c', voixA: MAINT - 3000 }], MAINT - 8 * 60_000, [], MAINT);
  assert.deepEqual({ genre: e.genre, depuis: e.depuisMin, places: e.surPlaces, parle: e.parle }, { genre: 'en-cours', depuis: 8, places: '3 / 8', parle: 'b' });
  assert.equal(AP.etatDeSalle(salle, [{ email: 'a' }], MAINT - 60_000, [], MAINT).parle, null);
  const libre = AP.etatDeSalle(salle, [], null, [{ at: paris(AUJ, '14:00'), titre: 'B' }, { at: paris(AUJ, '09:00'), titre: 'A' }, { at: paris(AUJ, '11:00'), titre: 'C' }], MAINT);
  assert.deepEqual(libre, { genre: 'libre', prochainEvenement: { at: paris(AUJ, '11:00'), titre: 'C' } });
  assert.equal(AP.etatDeSalle(salle, [], null, [], MAINT).prochainEvenement, null);
  assert.equal(I.dire('fr', 'appels.places', { n: 2, max: 8 }), '2 sur 8 places');
  assert.equal(I.dire('fr', 'appels.rienDePrevu'), 'Rien de prévu aujourd’hui');
});
await dit('salle de La Garde : ouverte par un incident, visible de la supervision seulement ; personnes connectées sans doublon', () => {
  assert.equal(AP.salleDeLaGardeVisible(true, true), true);
  assert.equal(AP.salleDeLaGardeVisible(true, false), false);
  assert.equal(AP.salleDeLaGardeVisible(false, true), false);
  assert.equal(AP.personnesConnectees(['a', 'b'], ['b', 'c']), 3);
  assert.equal(I.direCompte('fr', 'appels.personnes', 3), '3 personnes connectées');
});
await dit('standard : appels en file et temps d’attente en m:ss ; aucun appel', () => {
  const s = AP.standard([{ id: 'x', debutAt: MAINT - 65_000 }], MAINT);
  assert.deepEqual([s.enAttente, s.attentes[0].duree, s.aucunAppel], [1, '01:05', false]);
  assert.equal(AP.standard([], MAINT).aucunAppel, true);
});
await dit('historique : le plus récent d’abord, première phrase du résumé, décisions et tâches, appel manqué à rappeler', () => {
  const appels = [
    { id: 'a', titre: 'A', sens: 'sortant', finAt: at(VEILLE, '10:00'), dureeSec: 600, resume: 'On a fixé le point. Puis on a parlé du reste.', decisions: ['d1', 'd2', 'd3'], taches: ['t1', 't2'], tachesCreees: true },
    { id: 'b', titre: 'B', sens: 'manque', finAt: at(AUJ, '09:00'), dureeSec: 0, resume: null, decisions: [], taches: [] },
    { id: 'c', titre: 'C', sens: 'manque', finAt: at(VEILLE, '17:00'), dureeSec: 0, resume: null, decisions: [], taches: [], rappele: true },
  ];
  const h = AP.historique(appels);
  assert.deepEqual(h.map((x: any) => x.id), ['b', 'c', 'a']);
  assert.deepEqual([h[2].resumeEnUneLigne, h[2].decisions, h[2].taches, h[2].tachesCreees], ['On a fixé le point.', 3, 2, true]);
  assert.equal(h[0].aRappeler, true);
  assert.equal(h[1].aRappeler, false);
  assert.equal(h[0].resumeEnUneLigne, null, 'réglage coupé : pas de résumé');
  assert.equal(AP.premierePhrase('  Une seule. '), 'Une seule.');
});
await dit('rappels du jour : manqués d’hier et d’aujourd’hui rappelés / manqués ; « Tous rappelés » à 2 sur 2', () => {
  const m = (id: string, jour: string, rappele: boolean) => ({ id, titre: id, sens: 'manque', finAt: at(jour, '10:00'), dureeSec: 0, resume: null, decisions: [], taches: [], rappele });
  const r = AP.rappelsDuJour([m('a', AUJ, false), m('b', VEILLE, true), m('vieux', '2026-10-20', false)], AUJ);
  assert.deepEqual(r, { faits: 1, sur: 2, pourcent: 50, tousRappeles: false });
  assert.equal(AP.rappelsDuJour([m('a', AUJ, true), m('b', VEILLE, true)], AUJ).tousRappeles, true);
  assert.deepEqual(AP.rappelsDuJour([], AUJ), { faits: 0, sur: 0, pourcent: 0, tousRappeles: false });
  assert.equal(I.dire('fr', 'appels.rappels', { n: 1, sur: 2 }), 'Rappels du jour : 1 sur 2');
});
await dit('un résumé n’ajoute jamais un chiffre absent de la source ; l’enregistrement exige l’accord de tous', () => {
  assert.deepEqual(AP.nombresAbsentsDeLaSource('Rendez-vous le 5 nov. à 14 h confirmé, 3 tâches.', 'Rendez-vous le 5 nov. à 14 h avec le client.'), ['3']);
  assert.deepEqual(AP.nombresAbsentsDeLaSource('Rendez-vous le 5 nov. à 14 h.', 'Rendez-vous le 5 nov. à 14 h.'), []);
  assert.equal(AP.peutEnregistrerLaVoix({ a: true, b: true }, ['a', 'b']), true);
  assert.equal(AP.peutEnregistrerLaVoix({ a: true }, ['a', 'b']), false);
  assert.equal(AP.peutEnregistrerLaVoix({}, []), false);
});

/* ── Annonces (H14) ──────────────────────────────────────────────────────── */
console.log('\nÉchanger — annonces (H14)\n');

const EQUIPE = ['a', 'b', 'c', 'd', 'e', 'f'];
const an = (id: string, plus: Record<string, unknown> = {}) => ({ id, auteurEmail: 'z', publieeAt: at(AUJ, '08:00'), titre: id, texte: '', categorie: 'Équipe', epinglee: false, confirmations: [], ...plus });
await dit('« À la une » = l’épinglée la plus récente ; les autres épinglées en tête de mosaïque ; sans épinglée, la plus récente sans bordure ambre', () => {
  const l = [an('1', { publieeAt: at(VEILLE, '09:00') }), an('2', { epinglee: true, publieeAt: at(VEILLE, '10:00') }), an('3', { epinglee: true, publieeAt: at(AUJ, '07:00') }), an('4', { publieeAt: at(AUJ, '09:00') }), an('nv', { nouveauteDuProduit: true, publieeAt: at(AUJ, '10:00') })];
  const t = AN.composerLeTableau(l);
  assert.equal(t.aLaUne.id, '3');
  assert.equal(t.sansBordureAmbre, false);
  assert.deepEqual(t.mosaique.map((x: any) => x.id), ['2', '4', '1'], 'l’autre épinglée d’abord, la nouveauté du produit n’est pas une annonce de l’équipe');
  const sans = AN.composerLeTableau([an('1', { publieeAt: at(VEILLE, '09:00') }), an('4')]);
  assert.deepEqual([sans.aLaUne.id, sans.sansBordureAmbre], ['4', true]);
  assert.deepEqual(AN.composerLeTableau([]), { aLaUne: null, sansBordureAmbre: true, mosaique: [] });
});
await dit('« Lu par x sur y » : l’auteur est compté d’office ; barre verte quand x = y ; ouvrir n’est pas confirmer', () => {
  const a = an('1', { auteurEmail: 'a', confirmations: [{ email: 'b', at: at(AUJ, '08:30') }, { email: 'c', at: at(AUJ, '08:40') }] });
  assert.deepEqual(AN.luPar(a, EQUIPE), { lus: 3, sur: 6, complet: false });
  const tous = an('2', { auteurEmail: 'a', confirmations: EQUIPE.slice(1).map((email) => ({ email, at: at(AUJ, '08:30') })) });
  assert.equal(AN.luPar(tous, EQUIPE).complet, true);
  assert.deepEqual(AN.luPar(an('3', { auteurEmail: 'a', destinataires: ['b', 'c'] }), EQUIPE), { lus: 0, sur: 2, complet: false });
  assert.deepEqual(AN.luPar(an('4', { destinataires: [] }), EQUIPE), { lus: 0, sur: 0, complet: false });
  assert.equal(I.dire('fr', 'annonces.lu', { x: 3, y: 6 }), 'Lu par 3 sur 6');
});
await dit('accusés par personne ; « J’ai lu » seulement pour un destinataire qui n’a pas confirmé et n’est pas l’auteur', () => {
  const a = an('1', { auteurEmail: 'a', confirmations: [{ email: 'b', at: at(AUJ, '08:30') }] });
  const acc = AN.accuses(a, EQUIPE);
  assert.deepEqual(acc.map((x: any) => x.lu), [true, true, false, false, false, false]);
  assert.equal(acc[1].at, paris(AUJ, '08:30'));
  assert.equal(AN.peutConfirmer(a, 'c', EQUIPE), true);
  assert.equal(AN.peutConfirmer(a, 'b', EQUIPE), false);
  assert.equal(AN.peutConfirmer(a, 'a', EQUIPE), false);
  assert.equal(AN.peutConfirmer(a, 'inconnu', EQUIPE), false);
});
await dit('réactions : trois types fixes, une par type et par personne ; elles ne valent pas confirmation ; « Question » ouvre une réponse', () => {
  assert.deepEqual([...AN.REACTIONS], ['bien-note', 'merci', 'question']);
  let r = AN.reagir([], 'a', 'bien-note');
  r = AN.reagir(r, 'a', 'merci');
  assert.equal(r.length, 2);
  assert.equal(AN.reagir(r, 'a', 'merci').length, 1);
  assert.throws(() => AN.reagir([], 'a', 'excellent'));
  assert.equal(AN.ouvreUneReponse('question'), true);
  assert.equal(AN.ouvreUneReponse('merci'), false);
  const a = an('1', { auteurEmail: 'z', reactions: r });
  assert.equal(AN.peutConfirmer(a, 'a', EQUIPE), true, 'une réaction ne confirme pas');
});
await dit('« 5/6 » : confirmées par moi / destinées à moi, hors les miennes et hors la nouveauté du produit ; presque à jour, à jour', () => {
  const six = Array.from({ length: 6 }, (_, i) => an(`n${i}`, { auteurEmail: 'z', confirmations: i < 5 ? [{ email: 'a', at: at(AUJ, '08:30') }] : [] }));
  const mienne = an('perso', { auteurEmail: 'a' });
  const produit = an('produit', { auteurEmail: 'z', nouveauteDuProduit: true });
  const p = AN.presqueAJour([...six, mienne, produit], 'a', EQUIPE);
  assert.deepEqual(p, { faites: 5, sur: 6, restantes: 1, etat: 'presque' });
  assert.equal(AN.aConfirmer([...six, mienne], 'a', EQUIPE), 1);
  assert.equal(AN.presqueAJour(six.map((x) => ({ ...x, confirmations: [{ email: 'a', at: at(AUJ, '08:30') }] })), 'a', EQUIPE).etat, 'a-jour');
  assert.equal(AN.presqueAJour(six.map((x) => ({ ...x, confirmations: [] })), 'a', EQUIPE).etat, 'a-confirmer');
  assert.equal(AN.presqueAJour([], 'a', EQUIPE).etat, 'a-jour');
});
await dit('catégories : nombre d’annonces, barre = nombre / le plus grand ; la nouveauté du produit n’y compte pas', () => {
  const c = AN.categories([an('1', { categorie: 'Clients' }), an('2', { categorie: 'Clients' }), an('3', { categorie: 'Équipe' }), an('4', { categorie: 'Outils', nouveauteDuProduit: true })]);
  assert.deepEqual(c, [{ categorie: 'Clients', n: 2, barre: 1 }, { categorie: 'Équipe', n: 1, barre: 0.5 }]);
  assert.deepEqual(AN.categories([]), []);
});
await dit('mosaïque « maçonnerie » : chaque carte dans la colonne la moins haute ; le brouillon prend la 2ᵉ colonne', () => {
  const cartes = [{ id: 'a', hauteur: 100 }, { id: 'b', hauteur: 50 }, { id: 'c', hauteur: 80 }, { id: 'd', hauteur: 60 }];
  const m = AN.maconnerie(cartes, 3);
  assert.deepEqual(m.placements.map((p: any) => [p.id, p.colonne, p.y]), [['a', 0, 0], ['b', 1, 0], ['c', 2, 0], ['d', 1, 64]]);
  const r = AN.maconnerie(cartes, 3, { id: 'brouillon', hauteur: 40, colonne: 1 });
  assert.deepEqual(r.placements.map((p: any) => [p.id, p.colonne, p.y]), [['brouillon', 1, 0], ['a', 0, 0], ['b', 2, 0], ['c', 1, 54], ['d', 2, 64]]);
  assert.deepEqual(AN.maconnerie([], 3).hauteurs, [0, 0, 0]);
});
await dit('rappel d’Ajmani : annonce épinglée portant une heure du jour, non confirmée par au moins un membre, dans les 2 h qui précèdent', () => {
  assert.equal(AN.heureDansLeTexte('Maintenance à 14 h 30'), 14 * 60 + 30);
  assert.equal(AN.heureDansLeTexte('Réunion à 14h'), 14 * 60);
  assert.equal(AN.heureDansLeTexte('Point à 9:15'), 9 * 60 + 15);
  assert.equal(AN.heureDansLeTexte('Fermeture le 11 novembre'), null);
  const a = an('1', { epinglee: true, auteurEmail: 'a', titre: 'Coupure à 14 h', confirmations: [{ email: 'b', at: at(AUJ, '08:30') }] });
  assert.equal(AN.rappelAProposer(a, EQUIPE, paris(AUJ, '11:30')), null, 'plus de 2 h avant');
  assert.deepEqual(AN.rappelAProposer(a, EQUIPE, paris(AUJ, '12:05')), { heureMin: 840, nonConfirmes: 4 });
  assert.equal(AN.rappelAProposer(a, EQUIPE, paris(AUJ, '14:05')), null, 'passé');
  assert.equal(AN.rappelAProposer({ ...a, epinglee: false }, EQUIPE, paris(AUJ, '12:05')), null);
  assert.equal(AN.rappelAProposer({ ...a, confirmations: EQUIPE.map((email) => ({ email, at: at(AUJ, '08:30') })) }, EQUIPE, paris(AUJ, '12:05')), null);
});

/* ── Courriel (MX01) ─────────────────────────────────────────────────────── */
console.log('\nÉchanger — courriel (MX01)\n');

const co = (id: string, filId: string, quand: string, plus: Record<string, unknown> = {}) => ({ id, filId, de: 'x@exemple.test', a: ['boite@exemple.test'], at: quand, lu: true, ...plus });
await dit('fils : compteur de messages, non lu, « à moi », pièce jointe ; le dernier message et tout non lu plus ancien sont dépliés', () => {
  const l = [co('1', 'f1', at(AUJ, '08:00'), { lu: false }), co('2', 'f1', at(AUJ, '08:30')), co('3', 'f1', at(AUJ, '09:00'), { piecesJointes: [{ nom: 'a.pdf', analyse: 'sans-risque' }] }), co('4', 'f2', at(AUJ, '09:30'), { assigneA: 'moi' }), co('p', 'f3', at(AUJ, '09:40'), { programmeAt: at('2026-11-02', '09:00') })];
  const f = CM.composerFils(l, 'moi');
  assert.deepEqual(f.map((x: any) => x.filId), ['f2', 'f1'], 'le plus récent d’abord ; un envoi programmé n’est pas un fil');
  const f1 = f[1];
  assert.deepEqual([f1.messages, f1.nonLu, f1.aMoi, f1.avecPieceJointe], [3, true, false, true]);
  assert.deepEqual(f1.deplies, ['1', '3']);
  assert.deepEqual(f1.replies, ['2']);
  assert.equal(f[0].aMoi, true);
  assert.deepEqual(CM.composerFils([co('5', 'f9', at(AUJ, '09:30'))], 'moi', ['boite@exemple.test'])[0].aMoi, true, 'adressé nommément');
});
await dit('dossiers automatiques Clients et Partenaires (filtres, rien ne se déplace) ; programmés', () => {
  const l = [co('1', 'f1', at(AUJ, '08:00'), { organisation: 'A' }), co('2', 'f1', at(AUJ, '08:10'), { organisation: 'A' }), co('3', 'f2', at(AUJ, '08:20'), { organisation: 'B' }), co('4', 'f3', at(AUJ, '08:30'), { programmeAt: at('2026-11-03', '09:00') }), co('5', 'f4', at(AUJ, '08:40'), { programmeAt: at('2026-11-02', '09:00') })];
  assert.deepEqual(CM.dossiersAutomatiques(l, { A: 'client', B: 'partenaire' }), { clients: 1, partenaires: 1, programmes: 2 });
  assert.deepEqual(CM.programmes(l).map((m: any) => m.id), ['5', '4']);
});
await dit('« Dans la boîte » : les autres seulement, rien n’est gardé ; résumé d’Ajmani à partir de 3 messages ou sur demande', () => {
  const p = [{ email: 'moi', filId: 'f', mode: 'lit' }, { email: 'a', filId: 'f', mode: 'ecrit' }];
  assert.deepEqual(CM.dansLaBoite(p, 'moi'), [p[1]]);
  assert.equal(CM.resumeAGenerer(2), false);
  assert.equal(CM.resumeAGenerer(3), true);
  assert.equal(CM.resumeAGenerer(1, true), true);
});
await dit('demandes d’un message : phrases interrogatives ou impératives adressées à l’équipe ; le brouillon ne part jamais seul', () => {
  const d = CM.demandesDuMessage('Bonjour. Pouvez-vous confirmer vendredi ? Nous avons reçu le devis. Merci de joindre le plan.\nEst-ce que le tarif change ?');
  assert.deepEqual(d, ['Pouvez-vous confirmer vendredi ?', 'Merci de joindre le plan.', 'Est-ce que le tarif change ?']);
  assert.deepEqual(CM.demandesDuMessage('Bonjour. Merci pour tout.'), []);
  assert.equal(CM.brouillonAPreparer(d.length), true);
  assert.equal(CM.brouillonAPreparer(0), false);
  assert.equal(CM.brouillonPartSeul(), false);
});
await dit('pièces jointes : jamais ouvertes sans analyse ; connexion perdue : les messages déjà chargés restent lisibles', () => {
  assert.equal(CM.peutOuvrir('sans-risque'), true);
  assert.equal(CM.peutOuvrir('en-cours'), false);
  assert.equal(CM.peutOuvrir('dangereuse'), false);
  assert.equal(CM.peutLire('reliee', 0), true);
  assert.equal(CM.peutLire('perdue', 12), true);
  assert.equal(CM.peutLire('perdue', 0), false);
  assert.equal(CM.peutLire('a-brancher', 5), false);
  assert.equal(I.dire('fr', 'courriel.connexionPerdue'), 'La boîte n’est plus reliée.');
});

/* ── Réunions (MX02) ─────────────────────────────────────────────────────── */
console.log('\nÉchanger — réunions (MX02)\n');

const reunion = (plus: Record<string, unknown> = {}) => ({
  id: 'r', titre: 'R', debutPrevuAt: at(AUJ, '10:00'), dureePrevueMin: 45, debutReelAt: at(AUJ, '10:00'), finReelleAt: null, participants: ['moi', 'a'],
  ordreDuJour: [{ titre: 'S1', minutes: 10 }, { titre: 'S2', minutes: 15 }, { titre: 'S3', minutes: 20 }], ...plus,
});
await dit('en cours : commencée et non terminée ; « depuis N min » = maintenant − début réel', () => {
  assert.equal(RE.enCours(reunion(), paris(AUJ, '10:12')), true);
  assert.equal(RE.depuisMinutes(reunion(), paris(AUJ, '10:12')), 12);
  assert.equal(RE.enCours(reunion({ finReelleAt: at(AUJ, '10:40') }), paris(AUJ, '10:45')), false);
  assert.equal(RE.enCours(reunion({ debutReelAt: null }), paris(AUJ, '10:12')), false);
  assert.equal(RE.depuisMinutes(reunion({ debutReelAt: null }), paris(AUJ, '10:12')), null);
});
await dit('ordre du jour minuté : le sujet marqué en cours, sinon le temps écoulé ; remplissage = minutes dans le sujet ÷ prévues', () => {
  const sans = RE.ordreDuJourMinute(reunion(), paris(AUJ, '10:30'));
  assert.deepEqual(sans.map((s: any) => s.etat), ['fait', 'fait', 'en-cours']);
  assert.ok(Math.abs(sans[2].remplissage - 0.25) < 1e-9);
  const marque = RE.ordreDuJourMinute(reunion({ ordreDuJour: [{ titre: 'S1', minutes: 10 }, { titre: 'S2', minutes: 15, enCours: true }, { titre: 'S3', minutes: 20 }] }), paris(AUJ, '10:20'));
  assert.deepEqual(marque.map((s: any) => s.etat), ['fait', 'en-cours', 'a-venir']);
  assert.ok(Math.abs(marque[1].remplissage - 10 / 15) < 1e-9);
  assert.deepEqual(RE.ordreDuJourMinute(reunion(), paris(AUJ, '11:30')).map((s: any) => s.etat), ['fait', 'fait', 'fait'], 'passé le dernier sujet');
  assert.deepEqual(RE.ordreDuJourMinute(reunion({ debutReelAt: null }), paris(AUJ, '09:50')).map((s: any) => s.etat), ['a-venir', 'a-venir', 'a-venir']);
});
await dit('notes en direct : « Décision » devient une décision ; une action sans personne ou sans échéance reste « À confirmer »', () => {
  const p = ['Camille', 'Hugo'];
  assert.deepEqual(RE.classerLaLigne('Décision : on garde le tarif actuel', p), { genre: 'decision', texte: 'on garde le tarif actuel' });
  const complete = RE.classerLaLigne('Action : envoyer le devis à Camille avant vendredi', p);
  assert.deepEqual([complete.genre, complete.verbe, complete.personne, complete.echeance, complete.etat], ['action', 'envoyer', 'Camille', 'vendredi', 'tache-creee']);
  assert.equal(RE.classerLaLigne('Action : envoyer le devis avant vendredi', p).etat, 'a-confirmer');
  assert.equal(RE.classerLaLigne('Action : relancer Hugo', p).etat, 'a-confirmer');
  assert.deepEqual(RE.classerLaLigne('On a parlé du planning', p), { genre: 'note', texte: 'On a parlé du planning' });
});
await dit('prochaine réunion : la plus proche à venir où je participe ; compte à rebours sous une heure', () => {
  const l = [reunion({ id: 'a', debutPrevuAt: at(AUJ, '11:00'), debutReelAt: null }), reunion({ id: 'b', debutPrevuAt: at(AUJ, '14:00'), debutReelAt: null }), reunion({ id: 'c', debutPrevuAt: at(AUJ, '10:30'), debutReelAt: null, participants: ['x'] }), reunion({ id: 'd', debutPrevuAt: at(AUJ, '09:00'), debutReelAt: null })];
  const n = RE.prochaine(l, 'moi', MAINT);
  assert.deepEqual([n.reunion.id, n.dansMin, n.compteARebours], ['a', 45, true]);
  assert.equal(RE.prochaine(l.filter((x: any) => x.id !== 'a'), 'moi', MAINT).compteARebours, false);
  assert.equal(RE.prochaine([], 'moi', MAINT), null);
});
await dit('préparation : (sujets préparés + documents + cases faites) ÷ total ; ≥ 70 vert, 45 à 69 neutre, < 45 orange', () => {
  const r = (plus: Record<string, unknown>) => reunion({ debutReelAt: null, ...plus });
  const p1 = RE.preparation(r({ ordreDuJour: [{ titre: 'a', minutes: 5, prepare: true }, { titre: 'b', minutes: 5, prepare: true }, { titre: 'c', minutes: 5, prepare: true }], documents: { attendus: 1, joints: 1 }, casesDePreparation: [{ libelle: 'x', fait: true }, { libelle: 'y', fait: false }] }));
  assert.deepEqual(p1, { pourcent: 83, ton: 'vert' });
  assert.equal(RE.preparation(r({ ordreDuJour: [{ titre: 'a', minutes: 5, prepare: true }, { titre: 'b', minutes: 5 }] })).ton, 'neutre');
  assert.equal(RE.preparation(r({ ordreDuJour: [{ titre: 'a', minutes: 5 }, { titre: 'b', minutes: 5 }, { titre: 'c', minutes: 5, prepare: true }] })).pourcent, 33);
  assert.equal(RE.preparation(r({ ordreDuJour: [{ titre: 'a', minutes: 5 }, { titre: 'b', minutes: 5 }, { titre: 'c', minutes: 5, prepare: true }] })).ton, 'orange');
  assert.deepEqual(RE.preparation(r({ ordreDuJour: [] })), { pourcent: 0, ton: 'orange' });
  assert.equal(RE.preparation(r({ ordreDuJour: [{ titre: 'a', minutes: 5, prepare: true }], documents: { attendus: 1, joints: 3 } })).pourcent, 100, 'des documents en trop ne dépassent pas 100 %');
});
await dit('suggestion de durée : sur les 3 dernières occurrences, 30 % plus courtes ou plus ; accord de tous pour les notes ; compte rendu sous 10 min', () => {
  assert.equal(RE.suggestionDeDuree(30, [20, 18, 19]), 19);
  assert.equal(RE.suggestionDeDuree(30, [20, 18, 22]), null, '22 > 21');
  assert.equal(RE.suggestionDeDuree(30, [18, 19]), null, 'trois occurrences');
  assert.equal(RE.suggestionDeDuree(30, [40, 20, 18, 19]), 19, 'les trois dernières');
  assert.equal(RE.peutPrendreDesNotes({ a: true, b: true }, ['a', 'b']), true);
  assert.equal(RE.peutPrendreDesNotes({ a: true }, ['a', 'b']), false);
  assert.equal(RE.compteRenduAEnvoyer(at(AUJ, '10:00'), null, paris(AUJ, '10:08')), true);
  assert.equal(RE.compteRenduAEnvoyer(at(AUJ, '10:00'), at(AUJ, '10:05'), paris(AUJ, '10:08')), false);
  assert.equal(I.dire('fr', 'reunions.duree', { n: 18 }), 'Ce point se termine toujours en 18 min…');
});

/* ── Partage de fichiers (MX03) ──────────────────────────────────────────── */
console.log('\nÉchanger — partage de fichiers (MX03)\n');

const lien = (id: string, plus: Record<string, unknown> = {}) => ({ id, fichier: id, tailleOctets: 1_000_000, destinataire: 'Un client', creeAt: at(VEILLE, '09:00'), expireLe: '2026-11-15', dureeJours: 30, protection: 'code par courriel', ouvertures: 2, derniereOuvertureAt: at(AUJ, '08:00'), ...plus });
await dit('jauge d’expiration : jours restants ÷ durée ; orange à 2 jours ou moins ; « Expire demain » ; pas de « Prolonger » sans expiration', () => {
  const j = PA.jaugeDExpiration(lien('a'), AUJ);
  assert.deepEqual([j.restants, j.sur, j.orange, j.expireDemain, j.peutProlonger], [16, 30, false, false, true]);
  assert.ok(Math.abs(j.rapport - 16 / 30) < 1e-9);
  assert.equal(PA.jaugeDExpiration(lien('b', { expireLe: '2026-11-01' }), AUJ).orange, true);
  assert.equal(PA.jaugeDExpiration(lien('c', { expireLe: '2026-10-31' }), AUJ).expireDemain, true);
  assert.equal(PA.jaugeDExpiration(lien('d', { expireLe: '2026-10-01' }), AUJ).restants, 0, 'jamais négatif');
  const interne = PA.jaugeDExpiration(lien('e', { expireLe: null, protection: 'compte' }), AUJ);
  assert.deepEqual([interne.restants, interne.rapport, interne.peutProlonger], [null, null, false]);
  assert.equal(I.dire('fr', 'partages.expire', { n: 16, sur: 30 }), '16 / 30 j');
});
await dit('« pas encore ouvert » : 0 ouverture après plus de 2 jours ; liens protégés 17 sur 17 = 100 % (un lien interne compte)', () => {
  assert.equal(PA.pasEncoreOuvert(lien('a', { ouvertures: 0, creeAt: at('2026-10-27', '09:00') }), MAINT), true);
  assert.equal(PA.pasEncoreOuvert(lien('a', { ouvertures: 0, creeAt: at(VEILLE, '09:00') }), MAINT), false);
  assert.equal(PA.pasEncoreOuvert(lien('a', { ouvertures: 1, creeAt: at('2026-10-20', '09:00') }), MAINT), false);
  const dixSept = Array.from({ length: 17 }, (_, i) => lien(`l${i}`, i === 0 ? { protection: 'compte', expireLe: null } : {}));
  assert.deepEqual(PA.liensProteges(dixSept), { proteges: 17, actifs: 17, pourcent: 100, tousProteges: true });
  const un = PA.liensProteges([...dixSept, lien('nu', { protection: 'aucune' }), lien('revoque', { protection: 'aucune', revoque: true })]);
  assert.deepEqual([un.proteges, un.actifs, un.tousProteges], [17, 18, false]);
  assert.deepEqual(PA.liensProteges([]), { proteges: 0, actifs: 0, pourcent: 0, tousProteges: false });
});
await dit('tri : expiration la plus proche d’abord, sans expiration en dernier, révoqués masqués', () => {
  const t = PA.trierLesLiens([lien('loin', { expireLe: '2026-12-01' }), lien('sans', { expireLe: null }), lien('proche', { expireLe: '2026-11-01' }), lien('mort', { revoque: true })]);
  assert.deepEqual(t.map((l: any) => l.id), ['proche', 'loin', 'sans']);
});
await dit('dépôt : refus au-delà de 2 Go ou si l’espace est plein ; espace utilisé ; fichier reçu ouvrable seulement une fois vérifié', () => {
  assert.equal(PA.peutDeposer(2_000_000_001, 0, 100_000_000_000), 'trop-lourd');
  assert.equal(PA.peutDeposer(2_000_000_000, 0, 100_000_000_000), null);
  assert.equal(PA.peutDeposer(500, 990, 1000), 'espace-plein');
  assert.equal(PA.peutDeposer(500, 990, 0), null, 'quota inconnu : pas de refus');
  assert.deepEqual(PA.espaceUtilise([lien('a'), lien('b', { tailleOctets: 3_000_000 }), lien('c', { revoque: true })], 100_000_000), { octets: 4_000_000, pourcent: 4 });
  assert.equal(PA.peutOuvrirLeFichier('verifie'), true);
  assert.equal(PA.peutOuvrirLeFichier('en-cours'), false);
  assert.equal(PA.peutOuvrirLeFichier('bloque'), false);
  assert.equal(PA.transferts([{ id: 'a', sens: 'envoi', at: at(AUJ, '08:00') }, { id: 'b', sens: 'reception', at: at('2026-10-28', '08:00') }, { id: 'c', sens: 'reception', at: at(VEILLE, '11:00') }], MAINT).map((t: any) => t.id).join(), 'a,c');
});
await dit('relance proposée : lien non ouvert après 3 jours et qui expire dans moins de 3 jours ; sinon rien', () => {
  const l = lien('a', { ouvertures: 0, creeAt: at('2026-10-20', '09:00'), expireLe: '2026-11-01' });
  assert.equal(PA.relanceAProposer([l], MAINT)?.id, 'a');
  assert.equal(PA.relanceAProposer([{ ...l, expireLe: '2026-11-10' }], MAINT), null);
  assert.equal(PA.relanceAProposer([{ ...l, ouvertures: 1 }], MAINT), null);
  assert.equal(PA.relanceAProposer([{ ...l, creeAt: at(VEILLE, '09:00') }], MAINT), null);
  assert.equal(PA.relanceAProposer([], MAINT), null);
  assert.equal(PA.adresseVisible(), false, 'l’adresse d’un lien ne s’affiche jamais');
});

/* ── Sondages (MX05) ─────────────────────────────────────────────────────── */
console.log('\nÉchanger — sondages (MX05)\n');

const opt = (votes: number[]) => votes.map((v, i) => ({ id: `o${i}`, libelle: `Option ${i + 1}`, votes: v }));
await dit('pourcentages entiers, somme forcée à 100 % sur l’option la plus forte ; en tête ; égalité', () => {
  assert.deepEqual(SO.resultats(opt([4, 2, 1])).map((o: any) => o.pourcent), [57, 29, 14]);
  assert.deepEqual(SO.resultats(opt([1, 1, 1])).map((o: any) => o.pourcent), [34, 33, 33], 'l’écart d’arrondi va sur la première option la plus forte');
  assert.equal(SO.resultats(opt([1, 1, 1])).reduce((s: number, o: any) => s + o.pourcent, 0), 100);
  const eg = SO.resultats(opt([3, 3, 1]));
  assert.deepEqual(eg.map((o: any) => [o.enTete, o.aEgalite]), [[true, true], [true, true], [false, false]]);
  const seul = SO.resultats(opt([5, 2]));
  assert.deepEqual(seul.map((o: any) => [o.enTete, o.aEgalite]), [[true, false], [false, false]]);
  assert.deepEqual(SO.resultats(opt([0, 0])).map((o: any) => [o.pourcent, o.enTete]), [[0, false], [0, false]], 'aucun vote : barres vides');
  assert.equal(I.dire('fr', 'sondages.enTete'), 'en tête');
});
await dit('voix recomptées depuis les votes ; note moyenne', () => {
  assert.deepEqual(SO.compterLesVoix(opt([0, 0]), [{ email: 'a', optionId: 'o0', at: 0 }, { email: 'b', optionId: 'o0', at: 0 }, { email: 'c', optionId: 'o1', at: 0 }]).map((o: any) => o.votes), [2, 1]);
  const notes = [1, 2, 3, 4, 5].map((n, i) => ({ id: `n${i}`, libelle: String(n), votes: [0, 0, 1, 2, 1][i] }));
  assert.equal(SO.noteMoyenne(notes), 4);
  assert.equal(SO.noteMoyenne(notes.map((n) => ({ ...n, votes: 0 }))), null);
});
await dit('participation : 7 sur 8 en 8 cases, « 1 vote attendu » (un nombre, jamais un nom) ; aucun vote', () => {
  const votes = Array.from({ length: 7 }, (_, i) => ({ email: `v${i}`, optionId: 'o0', at: at(AUJ, '09:00') }));
  const p = SO.participation({ votes, destinataires: 8 });
  assert.deepEqual([p.votants, p.destinataires, p.attendus, p.cases.length, p.cases.filter(Boolean).length], [7, 8, 1, 8, 7]);
  assert.equal(I.direCompte('fr', 'sondages.attendus', 1), '1 vote attendu');
  assert.equal(I.direCompte('fr', 'sondages.attendus', 2), '2 votes attendus');
  assert.equal(SO.participation({ votes: [], destinataires: 0 }).cases.length, 0);
  assert.equal(SO.participation({ votes: votes.concat(votes), destinataires: 8 }).votants, 7, 'un votant compte une fois');
  assert.equal(SO.participation({ votes: [], destinataires: 40 }).cases.length, 8, 'au plus 8 cases');
  assert.equal(SO.participation({ votes: [], destinataires: 8 }).attendus, 8);
});
await dit('votes en direct : 24 h, le plus récent en haut ; sondage anonyme : « Un vote reçu », jamais de nom ni d’avatar', () => {
  const votes = [{ email: 'a', optionId: 'o0', at: at(AUJ, '09:00') }, { email: 'b', optionId: 'o1', at: at(AUJ, '10:00') }, { email: 'vieux', optionId: 'o1', at: at('2026-10-28', '10:00') }];
  const nominatif = SO.votesEnDirect({ votes, anonyme: false }, MAINT);
  assert.deepEqual(nominatif.map((v: any) => v.email), ['b', 'a']);
  const anonyme = SO.votesEnDirect({ votes, anonyme: true }, MAINT);
  assert.deepEqual(anonyme.map((v: any) => v.genre), ['anonyme', 'anonyme']);
  assert.equal(JSON.stringify(anonyme).includes('"email"'), false, 'aucun nom dans un sondage anonyme');
  assert.deepEqual(SO.avatarsSurLesBarres({ anonyme: true }, ['a', 'b']), []);
  assert.deepEqual(SO.avatarsSurLesBarres({ anonyme: false }, ['a', 'b']), ['a', 'b']);
  assert.equal(I.dire('fr', 'sondages.unVote'), 'Un vote reçu');
});
await dit('autres sondages : en cours puis terminés récents, brouillons absents ; éditeur : question et 2 options ; clôture ; brouillon à la création', () => {
  const s = (id: string, etat: string, jour: string) => ({ id, question: id, type: 'un-choix', options: [], anonyme: false, destinataires: 8, votes: [], etat, creeAt: at(jour, '09:00') });
  const l = [s('t1', 'termine', '2026-10-20'), s('c1', 'en-cours', '2026-10-25'), s('c2', 'en-cours', '2026-10-28'), s('b', 'brouillon', '2026-10-29'), s('actif', 'en-cours', '2026-10-30')];
  assert.deepEqual(SO.autresSondages(l, 'actif').map((x: any) => x.id), ['c2', 'c1', 't1']);
  assert.deepEqual(SO.editeurComplet('', ['a']), { complet: false, manque: ['question', 'options'] });
  assert.deepEqual(SO.editeurComplet('Quel jour ?', ['a', ' ']), { complet: false, manque: ['options'] });
  assert.deepEqual(SO.editeurComplet('Quel jour ?', ['a', 'b']), { complet: true, manque: [] });
  assert.equal(SO.estCloture({ etat: 'en-cours', clotureAt: at(AUJ, '09:00') }, MAINT), true);
  assert.equal(SO.estCloture({ etat: 'en-cours', clotureAt: at('2026-11-02', '09:00') }, MAINT), false);
  assert.equal(SO.estCloture({ etat: 'termine' }, MAINT), true);
  assert.equal(SO.ETAT_A_LA_CREATION, 'brouillon');
});

/* ── Réponses automatiques (MX06) ────────────────────────────────────────── */
console.log('\nÉchanger — réponses automatiques (MX06)\n');

const regle = (plus: Record<string, unknown> = {}) => ({ id: 'r1', nom: 'Hors horaires', canaux: ['courriel'], declencheur: { type: 'horaires' }, modele: 'Bonjour {prénom}, nous sommes fermés. Nous rouvrons {réouverture}.', sauf24h: true, actif: true, ...plus });
const recu = (quand: string, plus: Record<string, unknown> = {}) => ({ canal: 'courriel', at: quand, texte: 'Bonjour, j’aimerais un devis.', de: 'p1', expediteurEstClient: true, ...plus });
await dit('une règle créée, importée ou proposée par Ajmani naît désactivée, avec le garde-fou par défaut', () => {
  const r = AU.nouvelleRegle('x', 'Nouvelle');
  assert.deepEqual([r.actif, r.sauf24h, r.canaux.length, r.declencheur, r.modele], [false, true, 0, null, null]);
  assert.deepEqual(AU.manqueDansLaRegle(r), ['canal', 'declencheur', 'modele']);
  assert.deepEqual(AU.manqueDansLaRegle(regle()), []);
});
await dit('activer exige une règle complète, en ligne, avec le droit d’écriture ; modifier une règle active la passe « à tester »', () => {
  assert.equal(AU.peutActiver(regle({ actif: false }), true), true);
  assert.equal(AU.peutActiver(regle({ actif: false, modele: ' ' }), true), false, 'jeton manquant');
  assert.equal(AU.peutActiver(regle({ actif: false }), false), false, 'hors ligne');
  assert.equal(AU.peutActiver(regle({ actif: false }), true, false), false, 'lecture seule');
  assert.equal(AU.modifier(regle(), { nom: 'Autre' }).aTester, true);
  assert.equal(AU.modifier(regle({ actif: false }), { nom: 'Autre' }).aTester, undefined);
});
await dit('horaires : lundi à vendredi 9 h à 18 h, jours fériés exclus ; prochaine ouverture', () => {
  assert.equal(AU.dansLesHoraires(paris(AUJ, '10:00')), true);
  assert.equal(AU.dansLesHoraires(paris(AUJ, '18:00')), false, '18 h pile : fermé');
  assert.equal(AU.dansLesHoraires(paris(AUJ, '08:59')), false);
  assert.equal(AU.dansLesHoraires(paris('2026-10-31', '10:00')), false, 'samedi');
  assert.equal(AU.dansLesHoraires(paris('2026-11-11', '10:00'), undefined, ['2026-11-11']), false, 'férié');
  assert.equal(AU.prochaineOuverture(paris(AUJ, '19:00')), paris('2026-11-02', '09:00'));
  assert.equal(AU.prochaineOuverture(paris(AUJ, '08:00')), paris(AUJ, '09:00'));
  assert.equal(AU.prochaineOuverture(paris('2026-11-10', '19:00'), undefined, ['2026-11-11']), paris('2026-11-12', '09:00'));
});
await dit('décision : jamais sans règle active et complète ; canal, déclencheur, garde-fou de 24 h', () => {
  const nuit = recu(paris(AUJ, '20:00'));
  const ctx = { envoyes: [] };
  assert.deepEqual(AU.decider(regle(), nuit, ctx), { envoyer: true });
  assert.equal(AU.decider(regle({ actif: false }), nuit, ctx).raison, 'inactive');
  assert.equal(AU.decider(regle({ modele: null }), nuit, ctx).raison, 'incomplete');
  assert.equal(AU.decider(regle(), recu(paris(AUJ, '20:00'), { canal: 'sms' }), ctx).raison, 'canal');
  assert.equal(AU.decider(regle(), recu(paris(AUJ, '10:00')), ctx).raison, 'declencheur', 'en journée, la règle des horaires se tait');
  const deja = { envoyes: [{ regleId: 'r1', a: 'p1', at: paris(AUJ, '19:00') }] };
  assert.equal(AU.decider(regle(), nuit, deja).raison, 'garde-fou');
  assert.deepEqual(AU.decider(regle(), recu(paris('2026-10-31', '20:30')), deja), { envoyer: true }, 'plus de 24 h plus tard');
  assert.deepEqual(AU.decider(regle(), nuit, { envoyes: [{ regleId: 'r1', a: 'autre', at: paris(AUJ, '19:00') }] }), { envoyer: true }, 'une autre personne');
  assert.deepEqual(AU.decider(regle({ sauf24h: false }), nuit, deja), { envoyer: true }, 'garde-fou retiré (avec confirmation dans l’écran)');
  const mots = regle({ declencheur: { type: 'mots', mots: ['devis', 'tarif'] } });
  assert.deepEqual(AU.decider(mots, recu(paris(AUJ, '10:00'), { texte: 'Quel est votre TARIF ?' }), ctx), { envoyer: true });
  assert.equal(AU.decider(mots, recu(paris(AUJ, '10:00'), { texte: 'Bonjour' }), ctx).raison, 'declencheur');
});
await dit('variables : {prénom} sinon « Bonjour, », {réouverture} ; une variable sans valeur ne bloque jamais l’envoi', () => {
  const m = 'Bonjour {prénom}, nous sommes fermés. Nous rouvrons {réouverture}.';
  assert.equal(AU.remplirLeModele(m, { prenom: 'Camille', reouverture: 'lundi à 9 h' }), 'Bonjour Camille, nous sommes fermés. Nous rouvrons lundi à 9 h.');
  const sans = AU.remplirLeModele(m, {});
  assert.equal(sans, 'Bonjour, nous sommes fermés. Nous rouvrons.');
  assert.ok(!/[{}]/.test(sans) && !/\s{2}/.test(sans), 'plus aucun jeton ni double espace');
  assert.equal(I.dire('fr', 'auto.bonjour'), 'Bonjour,');
});
await dit('ce qui part chez un client reste au vouvoiement : le tutoiement y est repéré', () => {
  assert.deepEqual(AU.tutoiementDansUnTexteClient('Bonjour, tu peux nous appeler quand ton dossier est prêt.'), ['tu', 'ton']);
  assert.deepEqual(AU.tutoiementDansUnTexteClient('Pourriez-vous nous appeler quand votre dossier est prêt ? Un tuyau, une attitude, la tuile.'), []);
  assert.deepEqual(AU.tutoiementDansUnTexteClient('Peux-tu confirmer ? J’espère que t’as reçu le devis.'), ['Peux-tu', 't’as']);
});
await dit('compteurs : « 5 actives sur 7 » (la règle proposée compte dans le total), gagné = envois × 2,5 min, avis moyen', () => {
  const l = [...Array.from({ length: 5 }, (_, i) => regle({ id: `a${i}`, envoisDuMois: i === 0 ? 24 : 0 })), regle({ id: 'o', actif: false }), regle({ id: 'p', actif: false })];
  assert.deepEqual(AU.compteurs(l, [5, 4, 4.5]), { actives: 5, total: 7, envois: 24, gagneMinutes: 60, avisMoyen: 4.5 });
  assert.equal(AU.compteurs([]).avisMoyen, null);
  assert.equal(I.dire('fr', 'auto.actives', { n: 5, total: 7 }), '5 actives sur 7');
});
await dit('« Une règle manque » : 10 messages avec la même question en 30 jours, sans règle qui y répond', () => {
  const q = (n: number, question: string, jour = '2026-10-20') => Array.from({ length: n }, () => ({ at: at(jour, '10:00'), question }));
  assert.deepEqual(AU.regleManquante(q(10, 'Où en est ma commande ?'), [], MAINT), { question: 'ou en est ma commande ?', n: 10 });
  assert.equal(AU.regleManquante(q(9, 'Où en est ma commande ?'), [], MAINT), null);
  assert.equal(AU.regleManquante(q(10, 'Où en est ma commande ?'), ['Où en est ma commande ?'], MAINT), null);
  assert.equal(AU.regleManquante(q(10, 'Où en est ma commande ?', '2026-08-01'), [], MAINT), null, 'hors des 30 jours');
});

/* ── Textes ──────────────────────────────────────────────────────────────── */
console.log('\nÉchanger — textes fr/en, tutoiement\n');

await dit('les dictionnaires fr et en ont les mêmes clés, aucune vide ; les paramètres {…} sont les mêmes', () => {
  const fr = I.DICTIONNAIRES_ECHANGER.fr;
  const en = I.DICTIONNAIRES_ECHANGER.en;
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
  for (const [k, t] of Object.entries(I.DICTIONNAIRES_ECHANGER.fr) as [string, string][]) {
    if (/\b(vous|votre|vos|Vous|Votre|Vos)\b/.test(t)) fautes.push(`${k} : vouvoiement « ${t} »`);
    if (/\b[a-zéèêàùç]+ez\b/i.test(t.replace(/\{[^}]*\}/g, '')) && !/\bnez\b|\bchez\b/i.test(t)) fautes.push(`${k} : impératif en -ez « ${t} »`);
  }
  assert.deepEqual(fautes, [], fautes.join('\n'));
});
await dit('les comptes ont leurs deux formes (.1 et .n) ; apostrophes typographiques ; espace insécable avant % et €', () => {
  const cles = Object.keys(I.DICTIONNAIRES_ECHANGER.fr);
  const bases = new Set(cles.filter((c) => /\.(1|n)$/.test(c)).map((c) => c.replace(/\.(1|n)$/, '')));
  assert.deepEqual([...bases].filter((b) => !(cles.includes(`${b}.1`) && cles.includes(`${b}.n`))), []);
  for (const [k, t] of Object.entries(I.DICTIONNAIRES_ECHANGER.fr) as [string, string][]) {
    assert.ok(!/'/.test(t), `${k} : apostrophe droite dans « ${t} »`);
    assert.ok(!/\d [%€]/.test(t), `${k} : espace ordinaire avant % ou €`);
  }
  assert.equal(I.direCompte('fr', 'regle.attendent', 5), '5 clients attendent');
  assert.equal(I.direCompte('en', 'regle.attendent', 1), '1 client is waiting');
});

/* ── Jeux fictifs de SIM ─────────────────────────────────────────────────── */
console.log('\nÉchanger — rejeu sur les jeux fictifs (vide, peu, normal, beaucoup)\n');

for (const volume of ['vide', 'peu', 'normal', 'beaucoup']) {
  await dit(`volume « ${volume} » : la logique tient sur les onze jeux d’Échanger`, () => {
    const w = monde.construireMonde({ volume });
    const moiEmail = monde.moi(w.equipe).email;
    const maintenant = monde.MAINTENANT_REFERENCE;
    const auj = C.jourDe(maintenant);
    const equipe: string[] = w.equipe.map((m: any) => m.email);

    // G07 : les conversations de clients du jeu, vues comme messages entrants (équipe = sortant). Le jeu n'a pas de canal : courriel.
    const parConv = new Map<string, any>(w.conversations.map((c: any) => [c.id, c]));
    const messages = w.messages
      .filter((m: any) => parConv.get(m.conversationId)?.type === 'client')
      .map((m: any) => ({ id: String(m.id), clientId: parConv.get(m.conversationId).clientId, canal: 'courriel', sens: equipe.includes(m.authorEmail) ? 'sortant' : 'entrant', at: m.createdAt, lu: m.lu }));
    const fils = B.composerFils(messages, [], maintenant);
    const b = B.boiteAZero(messages, fils, maintenant);
    assert.equal(b.faits + b.chezEux + b.aRepondre, b.total);
    assert.equal(b.carres.length, b.total);
    assert.ok(b.pourcent >= 0 && b.pourcent <= 100);
    for (const f of B.aRepondre(fils)) assert.ok(B.attente(f, maintenant).ms >= 0);
    const regle_ = H.regleDAttente(fils, maintenant);
    assert.equal(regle_.nombre, B.badgeDeLaMessagerie(fils));
    assert.ok(regle_.clients.every((c: any) => c.position >= 0 && c.position <= 1));
    assert.equal(B.compteursParCanal(fils).tous, fils.filter((f: any) => f.couloir !== null).length);

    // MX04 : canaux
    const canaux = w.canaux.map((c: any) => ({ id: c.id, nom: c.nom, visibilite: c.visibilite, membres: c.membres, archive: c.archive }));
    const lignes = H.canauxActifs(canaux, [], maintenant);
    assert.equal(lignes.length, canaux.length);
    assert.ok(lignes.every((l: any) => !l.actif && l.barres.every((x: number) => x === 0)));
    const visibles = CA.canauxVisibles(canaux, moiEmail, 'Administrateur').canaux;
    assert.ok(visibles.every((c: any) => !c.archive));

    // H13 : salles et appels
    for (const s of w.salles) {
      const e = AP.etatDeSalle({ id: s.id, nom: s.nom, capacite: 8 }, s.connectes.map((email: string) => ({ email })), s.connectes.length ? maintenant - 8 * 60_000 : null, [], maintenant);
      assert.equal(e.genre, s.connectes.length ? 'en-cours' : 'libre');
    }
    const histo = AP.historique(w.appels.map((a: any) => ({ id: a.id, titre: a.titre, sens: 'sortant', finAt: new Date(Date.parse(a.debutAt) + a.dureeMin * 60_000).toISOString(), dureeSec: a.dureeMin * 60, resume: a.resume, decisions: a.decisions, taches: a.actions })));
    assert.equal(histo.length, w.appels.length);
    for (const a of w.appels) if (a.resume) assert.deepEqual(AP.nombresAbsentsDeLaSource(AP.premierePhrase(a.resume), a.resume), [], 'la première phrase ne contient que des nombres du résumé');

    // H14 : annonces
    const annonces = w.annonces.map((a: any) => ({ id: a.id, auteurEmail: a.auteurEmail, publieeAt: a.publieeAt, titre: a.titre, texte: a.texte, categorie: a.categorie, epinglee: a.epinglee, confirmations: a.confirmations }));
    const t = AN.composerLeTableau(annonces);
    assert.equal((t.aLaUne ? 1 : 0) + t.mosaique.length, annonces.length);
    for (const a of annonces) {
      const l = AN.luPar(a, equipe);
      assert.ok(l.lus <= l.sur && l.sur === equipe.length);
    }
    const pj = AN.presqueAJour(annonces, moiEmail, equipe);
    assert.equal(pj.faites + pj.restantes, pj.sur);
    assert.ok(annonces.length === 0 || t.aLaUne !== null);

    // MX01 : courriels
    const cour = w.courriels.map((c: any) => ({ id: c.id, filId: c.objet.replace(/^(re|tr|fwd)\s*:\s*/i, '').toLowerCase(), de: c.expediteurEmail, a: c.destinataires, at: c.at, lu: c.lu, programmeAt: c.envoiProgrammeAt, organisation: c.organisation }));
    const filsC = CM.composerFils(cour, moiEmail);
    assert.equal(filsC.reduce((s: number, f: any) => s + f.messages, 0), cour.filter((m: any) => !m.programmeAt).length);

    // MX02 : réunions
    for (const r of w.reunions) {
      const rm = { id: r.id, titre: r.titre, debutPrevuAt: r.debutAt, dureePrevueMin: r.dureeMin, participants: [moiEmail], ordreDuJour: [], casesDePreparation: r.preparation };
      const p = RE.preparation(rm);
      assert.ok(p.pourcent >= 0 && p.pourcent <= 100);
      assert.equal(RE.enCours(rm, maintenant), false);
    }

    // MX03 : partages — le type du lot ne porte aucune adresse ; les protections du jeu se lisent
    const liens = w.partages.map((p: any) => ({ id: p.id, fichier: p.nom, tailleOctets: p.tailleOctets, destinataire: p.destinataire, creeAt: p.creeAt, expireLe: p.expireAt ? C.jourDe(p.expireAt) : null, dureeJours: 30, protection: p.protection === 'aucune' ? 'aucune' : p.protection, ouvertures: p.vu === 'Non ouvert' ? 0 : 1, derniereOuvertureAt: null, revoque: p.revoque }));
    const lp = PA.liensProteges(liens);
    assert.ok(lp.proteges <= lp.actifs);
    for (const l of PA.trierLesLiens(liens)) assert.ok(PA.jaugeDExpiration(l, auj).restants === null || PA.jaugeDExpiration(l, auj).restants >= 0);

    // MX05 : sondages
    for (const s of w.sondages) {
      const r = SO.resultats(s.options.map((o: any, i: number) => ({ id: String(i), libelle: o.libelle, votes: o.votes })));
      const somme = r.reduce((x: number, o: any) => x + o.pourcent, 0);
      assert.ok(somme === 0 || somme === 100, `somme des pourcentages : ${somme}`);
      const pa = SO.participation({ votes: [], destinataires: s.invites });
      assert.equal(pa.attendus, s.invites);
    }

    // MX06 : réponses automatiques — les règles du jeu sont des règles ; une règle inactive n'envoie jamais
    for (const ra of w.reponsesAuto) {
      const r = { id: ra.id, nom: ra.nom, canaux: ['courriel'], declencheur: { type: 'mots', mots: ['x'] }, modele: ra.reponse.modele, sauf24h: true, actif: ra.actif };
      if (!ra.actif) assert.equal(AU.decider(r, { canal: 'courriel', at: maintenant, texte: 'x', de: 'p', expediteurEstClient: true }, { envoyes: [] }).raison, 'inactive');
    }
    const c = AU.compteurs(w.reponsesAuto.map((ra: any) => ({ id: ra.id, nom: ra.nom, canaux: [], declencheur: null, modele: null, sauf24h: true, actif: ra.actif, envoisDuMois: ra.envois })));
    assert.equal(c.total, w.reponsesAuto.length);
    assert.ok(c.actives <= c.total);

    // F40 : les dix tuiles
    const tuiles = H.tuilesDuHub({ aRepondre: b.aRepondre, courrielsNonLus: filsC.filter((f: any) => f.nonLu).length, canauxNonLus: 0, canauxAvecNonLus: 0, appelsEnCours: 0, reunionsAujourdhui: 0, annoncesAConfirmer: pj.restantes, partagesActifs: lp.actifs, sondagesEnCours: 0, reglesActives: c.actives, reglesTotal: c.total, envoisProgrammes: 0 });
    assert.equal(tuiles.length, 10);
  });
}

/* ── Structure ───────────────────────────────────────────────────────────── */
console.log('\nÉchanger — structure du lot\n');

const sources = FICHIERS.map((f) => ({ f, src: fs.readFileSync(path.join(racine, ZONE, `${f}.ts`), 'utf8') }));
const sansCommentaires = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

await dit('la logique reste en .ts à la racine de la zone ; les écrans vivent dans ecrans/ (un dossier par écran), et nulle part ailleurs', () => {
  const tous = fs.readdirSync(path.join(racine, ZONE));
  assert.deepEqual(tous.filter((f) => !f.endsWith('.ts') && f !== 'ecrans'), []);
  assert.deepEqual(tous.filter((f) => f.endsWith('.ts')).map((f) => f.replace(/\.ts$/, '')).sort(), [...FICHIERS].sort(), 'un fichier de la zone n’est pas dans la liste du contrôle');
});
function fichiersDesEcrans(dossier = path.join(racine, ZONE, 'ecrans')): string[] {
  if (!fs.existsSync(dossier)) return [];
  return fs.readdirSync(dossier, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? fichiersDesEcrans(path.join(dossier, d.name)) : [path.join(dossier, d.name)]));
}
await dit('écrans : composants du socle seulement, rien de src/screens ni d’une édition, aucune couleur ni nom d’image écrits à la main, aucun secret', () => {
  const fautes: string[] = [];
  const interdits = /Menna|Medina|Cabinet Roux|Studio Nova|Roux Santé|Boulangerie|Parc Sud|Atelier Sarah|Mohamed|Riyad|Aaron|Karim|Léa Martin|Stripe|@[a-z-]+\.(?:fr|com)\b/;
  for (const f of fichiersDesEcrans()) {
    const rel = path.relative(racine, f);
    const src = fs.readFileSync(f, 'utf8');
    const code = f.endsWith('.css') ? src.replace(/\/\*[\s\S]*?\*\//g, '') : sansCommentaires(src);
    for (const m of src.matchAll(/(?:import|export)[^'"]*?from\s+['"]([^'"]+)['"]/g)) {
      if (/\/(screens|business)\//.test(m[1]) || /\.business(\.|$)/.test(m[1]) || (/\/assistant\//.test(m[1]) && !/\/assistant\/AssistantContext$/.test(m[1]))) fautes.push(`${rel} importe ${m[1]}`);
    }
    if (/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/.test(code)) fautes.push(`${rel} : couleur écrite à la main`);
    if (interdits.test(code)) fautes.push(`${rel} : nom d’une image (${interdits.exec(code)?.[0]})`);
    if (/(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{8,}|ghp_[A-Za-z0-9]{20,}/.test(src)) fautes.push(`${rel} : un secret`);
    if (/Math\.random\(/.test(code)) fautes.push(`${rel} : du hasard`);
  }
  assert.deepEqual(fautes, [], fautes.join('\n'));
});
await dit('heures ouvrées : une seule source, la plage « clients » des réglages (lun.–ven. 9:00–18:00), rien de recopié', () => {
  assert.deepEqual(B.HORAIRES_PAR_DEFAUT, { jours: [1, 2, 3, 4, 5], debut: 540, fin: 1080 });
  assert.deepEqual(B.horairesDepuis({ jours: [1, 2], debut: '08:30', fin: '12:00' }), { jours: [1, 2], debut: 510, fin: 720 });
});

await dit('images v4 · G07 : les messages d’un jour passé se plient par jour et par canal ; « Fait » montre 4 initiales, « +5 » et l’heure du dernier', () => {
  const ms0 = [
    { id: 'a', at: paris('2026-10-29', '16:00'), canal: 'courriel' as const },
    { id: 'b', at: paris('2026-10-29', '16:30'), canal: 'courriel' as const },
    { id: 'c', at: paris('2026-10-29', '17:00'), canal: 'whatsapp' as const },
    { id: 'd', at: paris(AUJ, '08:31'), canal: 'whatsapp' as const },
  ];
  const r = B.plierLesAnciens(ms0, AUJ);
  assert.deepEqual(r.visibles, ['d']);
  assert.deepEqual(r.plies.map((p: any) => [p.canal, p.nombre, p.premierId]), [['courriel', 2, 'a'], ['whatsapp', 1, 'c']]);
  assert.deepEqual(B.plierLesAnciens([], AUJ), { plies: [], visibles: [] });
  const faits = ['DU', 'PS', 'BL', 'MC', 'X1', 'X2', 'X3', 'X4', 'X5'].map((i, k) => ({ initiales: i, at: paris(AUJ, `10:${String(12 - k).padStart(2, '0')}`) }));
  const ap = B.apercuDuFait(faits);
  assert.deepEqual(ap.initiales, ['DU', 'PS', 'BL', 'MC']);
  assert.equal(ap.reste, 5);
  assert.equal(ap.dernierAt, paris(AUJ, '10:12'));
  assert.deepEqual(B.apercuDuFait([]), { initiales: [], reste: 0, dernierAt: null });
});

await dit('images v4 · F40 : les tuiles portent leurs détails (réunions de la semaine et durée, envois du mois, prochain envoi, canaux, liens protégés), sans eux elles retombent sur leur nombre', () => {
  const base = { aRepondre: 5, courrielsNonLus: 3, canauxNonLus: 3, canauxAvecNonLus: 2, appelsEnCours: 1, reunionsAujourdhui: 1, annoncesAConfirmer: 1, partagesActifs: 17, sondagesEnCours: 3, reglesActives: 5, reglesTotal: 7, envoisProgrammes: 2 };
  const nues = H.tuilesDuHub(base);
  assert.ok(nues.every((t: any) => t.detail === undefined), 'rien d’inventé');
  const riches = H.tuilesDuHub({ ...base, reunionsSemaine: 6, reunionsSemaineMinutes: 240, envoisAutoDuMois: 148, prochainEnvoiProgramme: paris('2026-11-02', '09:00'), canauxTotal: 6, liensTousProteges: true });
  const par = (c: string) => riches.find((t: any) => t.cle === c)!;
  assert.deepEqual(par('reunions').detail, { semaine: 6, minutes: 240 });
  assert.deepEqual(par('reponsesAuto').detail, { envoisDuMois: 148 });
  assert.deepEqual(par('programmes').detail, { prochainEnvoi: paris('2026-11-02', '09:00') });
  assert.deepEqual(par('canaux').detail, { canauxTotal: 6 });
  assert.deepEqual(par('partages').detail, { tousProteges: true });
  assert.deepEqual(par('messagerie').nombres, [5]);
});

await dit('images v4 · MX01 : les étiquettes comptent des fils, une fois chacun, sans les messages programmés', () => {
  const m = (id: string, filId: string, etiquettes?: string[], programmeAt?: number) => ({ id, filId, de: 'x@exemple.fr', a: ['equipe@exemple.fr'], at: paris(AUJ, '09:00'), lu: false, etiquettes, programmeAt });
  const c = CM.compterEtiquettes([m('1', 'f1', ['urgent']), m('2', 'f1', ['urgent', 'a-facturer']), m('3', 'f2', ['a-facturer']), m('4', 'f3', ['urgent'], paris('2026-11-02', '09:00')), m('5', 'f4')]);
  assert.deepEqual(c, { urgent: 1, 'a-facturer': 2, 'en-attente-client': 0 });
});

await dit('images v4 · MX03 : réglages du prochain lien (30 jours, code par courriel, filigrane, téléchargement) et onglets Partagés · Reçus · Expirés', () => {
  assert.deepEqual(PA.REGLAGES_DU_LIEN_PAR_DEFAUT, { dureeJours: 30, protection: 'code par courriel', filigrane: false, telechargement: true });
  assert.ok(PA.reglagesValides(PA.REGLAGES_DU_LIEN_PAR_DEFAUT));
  assert.ok(!PA.reglagesValides({ ...PA.REGLAGES_DU_LIEN_PAR_DEFAUT, protection: 'aucune' }), 'un lien ne part jamais sans protection');
  assert.ok(!PA.reglagesValides({ ...PA.REGLAGES_DU_LIEN_PAR_DEFAUT, dureeJours: 0 }));
  const l = (id: string, expireLe: string | null, revoque = false) => ({ id, fichier: 'f', tailleOctets: 1, destinataire: null, creeAt: paris('2026-10-01', '09:00'), expireLe, dureeJours: 30, protection: 'compte' as const, ouvertures: 0, derniereOuvertureAt: null, revoque });
  const o = PA.ongletsDePartage([l('1', '2026-11-05'), l('2', null), l('3', '2026-10-20'), l('4', '2026-12-01', true)], 9, AUJ);
  assert.deepEqual(o, { partagesParMoi: 2, recus: 9, expires: 2 });
});

await dit('images v4 · H13 : filtres de l’historique « Tout », « Manqués », « Avec résumé »', () => {
  const a = (id: string, sens: 'entrant' | 'sortant' | 'manque', resume: string | null) => ({ id, titre: id, sens, finAt: paris(AUJ, '09:00'), dureeSec: 60, resume, decisions: [], taches: [] });
  assert.deepEqual(AP.compteursDHistorique([a('1', 'entrant', 'Oui.'), a('2', 'sortant', 'Oui.'), a('3', 'manque', 'Pas de message laissé.')]), { tout: 3, manques: 1, avecResume: 3 });
  assert.deepEqual(AP.compteursDHistorique([]), { tout: 0, manques: 0, avecResume: 0 });
});

await dit('F40 · composerHub : sous-titre, règle en racine carrée sur 3 h, canaux, Boîte à zéro, tuiles ; rien d’inventé quand personne n’écrit', () => {
  const il = (min: number) => MAINT - min * 60_000;
  const msg = (id: string, clientId: number, min: number, canal = 'whatsapp') => ({ id, clientId, canal, sens: 'entrant', at: il(min), lu: true });
  const messages = [msg('a', 1, 6), msg('b', 2, 131), msg('c', 3, 30, 'courriel')];
  const fils = B.composerFils(messages, [], MAINT);
  const infos = { 'client:1': { initiales: 'AA', nom: 'Un', canal: 'WhatsApp' }, 'client:2': { initiales: 'BB', nom: 'Deux', canal: 'WhatsApp' }, 'client:3': { initiales: 'CC', nom: 'Trois', canal: 'Courriel' } };
  const mesures = { aRepondre: 3, courrielsNonLus: 1, canauxNonLus: 0, canauxAvecNonLus: 0, appelsEnCours: 0, reunionsAujourdhui: 0, annoncesAConfirmer: 0, partagesActifs: 0, sondagesEnCours: 0, reglesActives: 0, reglesTotal: 0, envoisProgrammes: 0 };
  const e = { langue: 'fr', maintenant: MAINT, messages, fils, infos, soirs: [], canaux: [{ id: 'c1', nom: 'Canal' }], messagesDeCanaux: [{ canalId: 'c1', at: il(3) }], attendentParCanal: { c1: 2 }, repondusIds: [], lusNonArchives: 0, archivesAujourdhui: 0, mesures, modulesOuverts: null, routes: { appels: '/appels' }, nomsCourts: {}, prenomDeFil: (id: string) => infos[id as keyof typeof infos]?.nom ?? '', initialesJours: ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.'], icones: {} };
  const v = CF40.composerHub(e, { onResumer: () => undefined });
  assert.ok(/^3 clients attendent une réponse, le plus ancien depuis 2\s?h\s?11 · la boîte en est à 0 sur 3$/.test(v.sousTitre.replace(/[\u00a0\u202f]/g, ' ')), v.sousTitre);
  assert.deepEqual(v.pouls.clients.map((c: any) => c.id), ['client:1', 'client:3', 'client:2'], 'du plus récent au plus ancien, de gauche à droite');
  assert.ok(Math.abs(v.pouls.clients[2].position - Math.sqrt(131 / 180)) < 1e-9);
  assert.ok(Math.abs(v.pouls.seuil.position - Math.sqrt(120 / 180)) < 1e-9, 'la promesse de 2 h est au rang √(120/180)');
  assert.deepEqual(v.pouls.graduations.map((g: any) => g.libelle), ['maintenant', '15\u00a0min', '30\u00a0min', '1\u00a0h', '2\u00a0h', '3\u00a0h']);
  assert.equal(v.pouls.vide, null);
  assert.equal(v.canaux.lignes[0].statut, '2 attendent');
  assert.equal(v.modules.tuiles.length, 10);
  assert.equal(v.modules.tuiles.find((t: any) => t.cle === 'appels').vers, '/appels');
  assert.equal(v.modules.tuiles.find((t: any) => t.cle === 'messagerie').sous, '3 à répondre');
  const calme = CF40.composerHub({ ...e, messages: [], fils: [], infos: {}, messagesDeCanaux: [], attendentParCanal: {}, mesures: { ...mesures, aRepondre: 0 }, modulesOuverts: new Set(['appels']) }, { onResumer: () => undefined });
  assert.equal(calme.sousTitre, 'Personne n’attend de réponse');
  assert.equal(calme.pouls.vide, 'Personne n’attend. Une journée calme.');
  assert.equal(calme.boite, null, 'rien à compter : pas de Boîte à zéro');
  assert.deepEqual(calme.modules.tuiles.map((t: any) => t.cle), ['appels'], 'seuls les modules ouverts ont une tuile');
  assert.equal(calme.canaux.lignes[0].statut, 'calme');
});

await dit('G07 · composerBoite : couloirs, filtres, bandeau, fil du client ; le plus ancien d’abord, un fil par client, la note interne dans le fil, rien d’inventé quand le poste n’a rien', () => {
  const il = (min: number) => MAINT - min * 60_000;
  const msg = (id: string, clientId: number, min: number, canal: string, sens = 'entrant', extra: any = {}) => ({ id, clientId, canal, sens, at: il(min), lu: id !== 'a', auteur: `Auteur ${clientId}`, texte: `Texte ${id}`, ...extra });
  const messages = [msg('a', 1, 6, 'whatsapp'), msg('b', 2, 131, 'courriel'), msg('b2', 2, 20, 'whatsapp'), msg('n', 2, 10, 'whatsapp', 'sortant', { noteInterne: true }), msg('c', 3, 300, 'courriel'), msg('c2', 3, 250, 'courriel', 'sortant')];
  const clients = { 'client:1': { nom: 'Un', initiales: 'UN', sousContrat: false, contexte: {} }, 'client:2': { nom: 'Deux', initiales: 'DE', interlocuteur: 'Une Personne', sousContrat: true, contexte: { contrat: { actif: true, echeance: '2026-12-31' }, contratNom: 'Contrat Z', facturesEnRetard: { nombre: 2, montantCents: 123_400 }, creneauxLibres: ['9:30', '14:00'], creneauxJour: '2026-11-05', creneauxSource: '2026-11-05' } }, 'client:3': { nom: 'Trois', initiales: 'TR', sousContrat: false, contexte: {} } };
  const canaux = [{ canal: 'courriel', etat: 'actif' }, { canal: 'whatsapp', etat: 'actif' }, { canal: 'sms', etat: 'a-brancher' }];
  const e = { langue: 'fr', maintenant: MAINT, prenom: 'Sam', messages, gestes: [{ filId: 'client:3', etat: 'en-attente', at: il(200), depuisLe: il(3 * 24 * 60), attend: 'Un accord' }], clients, canaux, soirs: [], filChoisi: 'client:2', filtre: 'tous', pliesOuverts: new Set(), brouillon: { texte: 'Bonjour Madame, à jeudi.', creneau: '9:30' }, initialesJours: ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.'] };
  const v = CG07.composerBoite(e);
  assert.equal(v.sousTitre.replace(/[\u00a0\u202f]/g, ' '), 'Bonjour Sam, 2 clients attendent une réponse · le plus ancien depuis 2 h 11');
  assert.deepEqual(v.couloirs.aRepondre.lignes.map((l: any) => l.id), ['client:2', 'client:1'], 'le plus ancien d’abord');
  assert.equal(v.couloirs.aRepondre.lignes[0].canal.id, 'whatsapp', 'le canal du dernier message du client, pas de la note interne');
  assert.ok(!v.couloirs.aRepondre.lignes.some((l: any) => /Texte n\b/.test(l.apercu)), 'l’aperçu n’est jamais une note interne');
  assert.deepEqual(v.couloirs.enAttente.lignes.map((l: any) => [l.id, l.attend, l.quand.replace(/[\u00a0\u202f]/g, ' ')]), [['client:3', 'Un accord', 'depuis 3 j']]);
  assert.equal(v.badge, 2);
  assert.deepEqual(v.filtres.map((f: any) => [f.id, f.n, f.actif]), [['tous', 3, true], ['courriel', 1, false], ['whatsapp', 2, false], ['sms', 0, false]]);
  assert.equal(v.fil.contrat.texte, 'Client sous contrat');
  assert.equal(v.fil.messages.length, 3, 'le fil du client mêle ses canaux et porte la note interne');
  assert.ok(v.fil.messages.some((m: any) => m.genre === 'note'));
  assert.equal(v.fil.memeFil.texte, 'Même fil sur 2 canaux');
  const cx = Object.fromEntries(v.fil.contexte.map((c: any) => [c.cle, c]));
  assert.equal(cx.contrat.valeur, 'Contrat Z');
  assert.equal(cx.factures.ton, 'orange');
  assert.equal(cx.factures.valeur, '2 impayées');
  assert.equal(cx.creneaux.etiquette, 'Créneaux jeudi');
  assert.equal(cx.creneaux.valeur, '9:30 ou 14:00');
  assert.equal(cx.passage.valeur, 'Rien à signaler', 'une donnée qui manque ne laisse pas un vide');
  assert.deepEqual(v.fil.reponse.canaux.map((c: any) => [c.id, c.actif, c.grise]), [['courriel', false, false], ['whatsapp', true, false], ['sms', false, true]], 'le canal du dernier message est choisi, un canal à brancher est grisé');
  assert.equal(v.fil.reponse.info, 'Brouillon d’Ajmani, à relire avant d’envoyer');
  const filtre = CG07.composerBoite({ ...e, filtre: 'courriel' });
  assert.deepEqual(filtre.couloirs.aRepondre.lignes, [], 'les puces de canal filtrent les couloirs');
  const vide = CG07.composerBoite({ ...e, messages: [], gestes: [], clients: {}, filChoisi: null, prenom: '' });
  assert.equal(vide.sousTitre, 'Personne n’attend de réponse');
  assert.equal(vide.fil, null);
  assert.deepEqual(vide.bandeau.carres, []);
  assert.equal(vide.bandeau.valeur, '0 sur 0');
  assert.equal(CG07.depuisLisible(il(30 * 60), MAINT, 'fr'), 'hier');
  assert.equal(CG07.depuisLisible(il(2 * 24 * 60 + 30), MAINT, 'fr'), '2 j');
});

await dit('H14 · composerAnnonces : À la une, accusés, « Lu par x sur y », mosaïque, « Presque à jour », catégories ; rien d’inventé sans catégories ni réactions', () => {
  const eq = [{ email: 'a@x', nom: 'Anne' }, { email: 'b@x', nom: 'Bob' }, { email: 'c@x', nom: 'Cléo' }];
  const an = (id: string, par: string, jour: string, extra: any = {}) => ({ id, auteurEmail: par, auteurNom: par, publieeAt: paris(jour, '09:12'), titre: `Titre ${id}`, texte: `Texte ${id}`, categorie: '', epinglee: false, confirmations: [], ...extra });
  const base = { langue: 'fr', maintenant: MAINT, moi: 'c@x', equipe: eq, avecCategories: false, avecReactions: false, filtre: null, brouillon: null };
  const nue = CH14.composerAnnonces({ ...base, annonces: [an('1', 'a@x', '2026-10-28'), an('2', 'b@x', AUJ, { confirmations: [{ email: 'a@x' }] })] });
  assert.equal(nue.aLaUne.id, '2', 'sans épingle, la plus récente prend « À la une »');
  assert.equal(nue.aLaUne.epinglee, false, '… sans bordure ambre');
  assert.equal(nue.categories, null, 'sans catégories, pas de carte');
  assert.equal(nue.aLaUne.reactions, null, 'sans réactions, pas de rangée');
  assert.equal(nue.brouillon, null);
  assert.equal(nue.suggestion, null);
  assert.equal(nue.aLaUne.lu.texte, 'Lu par 2 sur 3');
  assert.deepEqual(nue.aLaUne.accuses.map((x: any) => [x.nom, x.sous, x.lu]), [['Anne', 'lu', true], ['Bob', 'auteur', true], ['Cléo (toi)', 'pas encore confirmé', false]]);
  assert.equal(nue.aLaUne.peutConfirmer, true);
  assert.equal(nue.presque.texte, '0/2');
  assert.equal(nue.presque.titre, '2 à confirmer');
  assert.equal(nue.colonnes.flat().length, 1);
  const riche = CH14.composerAnnonces({ ...base, avecCategories: true, avecReactions: true, brouillon: { titre: '', texte: '', epingler: false }, annonces: [an('1', 'a@x', '2026-10-28', { categorie: 'Technique', epinglee: true, confirmations: [{ email: 'c@x', at: paris(AUJ, '08:00') }], reactions: [{ email: 'b@x', type: 'merci' }] }), an('2', 'b@x', AUJ, { categorie: 'Clients' })] });
  assert.equal(riche.aLaUne.id, '1', 'l’épinglée prend « À la une » même plus ancienne');
  assert.equal(riche.aLaUne.epinglee, true);
  assert.deepEqual(riche.aLaUne.reactions.map((r: any) => [r.type, r.n, r.active]), [['bien-note', 0, false], ['merci', 1, false], ['question', 0, false]]);
  assert.equal(riche.aLaUne.accuses[2].sous, 'lu à 08:00');
  assert.deepEqual(riche.categories.lignes.map((c: any) => [c.nom, c.n, c.ton]), [['Clients', 1, 'contacts'], ['Technique', 1, 'outils']]);
  assert.equal(riche.colonnes.flat().filter((c: any) => c.genre === 'brouillon').length, 1, 'le brouillon est dans la mosaïque, une fois');
  assert.equal(riche.presque.texte, '1/2');
  assert.equal(riche.presque.titre, 'Presque à jour');
  assert.deepEqual([0, 1, 2, 3].map((x) => A_SEG(x, 3)), [{ pleins: 0, vert: false }, { pleins: 1, vert: false }, { pleins: 2, vert: false }, { pleins: 3, vert: true }]);
  assert.deepEqual(A_SEG(0, 0), { pleins: 0, vert: false });
});

await dit('H13 · composerAppels : plan des salles, Standard et sa file, sous-titre, historique et rappels ; sans salle connue, pas de plan', () => {
  const il = (min: number) => MAINT - min * 60_000;
  const salle = (id: string, genre: string, extra: any = {}) => ({ def: { id, nom: id, capacite: 8, genre, ton: 'jour', ...(extra.supervision ? { supervision: true } : {}) }, connectes: [], debutDeSession: null, evenementsDuJour: [], ...extra });
  const salles = [salle('eq', 'equipe', { connectes: [{ email: 'riyad@x', voixA: MAINT }, { email: 'mo@x' }], debutDeSession: il(8), titreDeSession: 'Point', ecranPartage: true }), salle('cl', 'clients', { evenementsDuJour: [{ at: il(-30), titre: 'Rendez-vous' }] }), salle('at', 'creatif'), salle('ga', 'garde', { supervision: true })];
  const appel = (id: string, sens: string, jour: string, extra: any = {}) => ({ id, titre: `Appel ${id}`, sens, finAt: paris(jour, '12:00'), dureeSec: sens === 'manque' ? 0 : 35 * 60, resume: null, decisions: [], taches: [], moment: { at: paris(jour, '11:25') }, ...extra });
  const base = { langue: 'fr', maintenant: MAINT, salles, incidentDeclare: false, roleDeSupervision: true, appelEnCours: { nom: 'Aaron · Client', debutAt: il(4), enLigne: true, sous: '' }, file: [{ id: 'f1', nom: 'Léo', debutAt: il(1) }], auTelephone: ['aaron@x'], appels: [appel('1', 'manque', AUJ), appel('2', 'sortant', '2026-10-29', { resume: 'Une phrase. Deux.', decisions: ['d'], taches: ['t'], tachesCreees: true }), appel('3', 'manque', '2026-10-29', { rappele: true })], filtre: 'tout', enLigneAvec: 'Client' };
  const v = CH13.composerAppels(base);
  assert.equal(v.sousTitre.replace(/[\u00a0\u202f]/g, ' '), 'Tu es en ligne avec Client · l’équipe est en salle, Léo attend au standard');
  assert.deepEqual(v.salles.plan.map((p: any) => p.id), ['eq', 'cl', 'at', 'ga', 'standard']);
  assert.equal(v.salles.sous, '3 personnes connectées · 1 appel en attente');
  const eq = v.salles.plan[0];
  assert.deepEqual(eq.personnes.map((p: any) => [p.nom, p.libelle, p.parle]), [['Riyad', 'Riyad parle', true], ['Mo', 'Mo', false]]);
  assert.ok(/depuis 8 min/.test(eq.sous), eq.sous);
  assert.ok(/2 sur 8 places · écran partagé/.test(eq.pied.replace(/[\u00a0\u202f]/g, ' ')), eq.pied);
  assert.equal(v.salles.plan[1].action.libelle, 'Préparer la salle');
  assert.equal(v.salles.plan[2].action.libelle, 'Réserver', 'une salle sans événement se réserve');
  assert.equal(v.salles.plan[2].info.texte, 'Rien de prévu aujourd’hui');
  assert.equal(v.salles.plan[3].fermee, true, 'La Garde est fermée hors incident');
  const st = v.salles.plan[4];
  assert.deepEqual(st.file.map((f: any) => [f.nom, f.duree, f.ambre]), [['Aaron · Client', '04:00', false], ['Léo', '01:00', true]]);
  assert.deepEqual(v.historique.filtres.map((f: any) => [f.id, f.n]), [['tout', 3], ['manques', 2], ['resume', 1]]);
  assert.equal(v.historique.rappels.texte, 'Rappels du jour : 1 sur 2');
  assert.equal(v.historique.lignes[0].action.libelle, 'Rappeler', 'un appel manqué pas rappelé se rappelle');
  assert.equal(v.historique.lignes[0].duree, '0:00');
  assert.equal(v.historique.lignes[1].duree, '35 min');
  assert.deepEqual(v.historique.lignes[1].action, { genre: 'coche', libelle: 'tâche créée' });
  assert.equal(v.historique.lignes[1].resume, 'Une phrase. Deux.', 'le résumé de la ligne vient de la première phrase du résumé');
  assert.equal(v.historique.lignes[0].etiquettes[0].rouge, true);
  assert.deepEqual(CH13.composerAppels({ ...base, filtre: 'manques' }).historique.lignes.map((x: any) => x.id), ['1', '3']);
  const sans = CH13.composerAppels({ ...base, salles: null, appelEnCours: null, file: [], auTelephone: [], enLigneAvec: null, appels: [] });
  assert.equal(sans.salles, null);
  assert.equal(sans.sousTitre, 'Personne n’est au téléphone pour l’instant');
  assert.equal(sans.historique.rappels, null);
  const garde = CH13.composerAppels({ ...base, roleDeSupervision: false }).salles.plan.map((p: any) => p.id);
  assert.ok(!garde.includes('ga'), 'la salle de La Garde ne se voit que par la supervision');
});

await dit('MX05 · composerSondages : barres, en tête, participation sans nom, votes en direct (masqués si anonyme), autres sondages, éditeur ; jamais de nom sur un sondage anonyme', () => {
  const vt = (qui: string, optionId: string, hhmm: string) => ({ email: `${qui}@x`, optionId, at: paris(AUJ, hhmm) });
  const sond = (id: string, extra: any = {}) => ({ id, question: `Question ${id}`, type: 'un-choix', anonyme: false, destinataires: 8, etat: 'en-cours', creeAt: paris('2026-10-28', '09:00'), clotureAt: paris('2026-11-02', '18:00'), options: [{ id: 'h', libelle: 'Horizon', votes: 0 }, { id: 'b', libelle: 'Boussole', votes: 0 }, { id: 'c', libelle: 'Cap', votes: 0 }], votes: [vt('a', 'h', '10:05'), vt('b', 'h', '09:50'), vt('c', 'b', '08:00'), vt('d', 'h', '07:00')], ...extra });
  const base = { langue: 'fr', maintenant: MAINT, moi: 'a@x', nom: (e: string) => e.split('@')[0].toUpperCase(), sondages: [sond('p1'), sond('p2', { anonyme: true, etat: 'termine' }), sond('p3', { etat: 'termine', type: 'note', options: ['1', '2', '3', '4', '5'].map((n) => ({ id: n, libelle: n, votes: 0 })), votes: [vt('a', '5', '08:00'), vt('b', '4', '08:00')] })], choisiId: null, editeur: null };
  const v = CMX05.composerSondages(base);
  assert.equal(v.sousTitre, 'Décider ensemble en 30 secondes · 1 en cours, ton équipe participe');
  assert.deepEqual(v.resultat.barres.map((b: any) => [b.libelle, b.pourcent, b.enTete]), [['Horizon', 75, true], ['Boussole', 25, false], ['Cap', 0, false]]);
  assert.deepEqual(v.resultat.barres[0].avatars, ['A', 'B', 'D'], 'sondage visible : les avatars des votants');
  assert.equal(v.resultat.participation.texte, '4 sur 8');
  assert.equal(v.resultat.participation.attendus, '4 votes attendus', 'un nombre, jamais un nom');
  assert.ok(!JSON.stringify(v.resultat.participation).includes('@'));
  assert.deepEqual(v.direct.lignes.map((l: any) => [l.heure, l.nom, l.option]), [['10:05', 'A (toi)', 'Horizon'], ['09:50', 'B', 'Horizon'], ['08:00', 'C', 'Boussole'], ['07:00', 'D', 'Horizon']]);
  assert.equal(v.direct.lignes[0].nouveau, true);
  assert.equal(v.direct.lignes[1].nouveau, false);
  assert.ok(/se termine lundi à 18:00/.test(v.resultat.etat.detail) && /réponses visibles/.test(v.resultat.etat.detail), v.resultat.etat.detail);
  assert.deepEqual(v.autres.map((a: any) => [a.id, a.resultat]), [['p2', 'Horizon'], ['p3', '4,5 sur 5']]);
  const anon = CMX05.composerSondages({ ...base, choisiId: 'p2' });
  assert.equal(anon.resultat.etat.genre, 'termine');
  assert.ok(anon.resultat.barres.every((b: any) => b.avatars.length === 0), 'sondage anonyme : aucun avatar');
  assert.ok(anon.direct.lignes.every((l: any) => l.nom === null && l.option === null && l.texte === 'Un vote reçu'), 'sondage anonyme : « Un vote reçu », jamais un nom');
  assert.ok(!/@|\bA\b|\bB\b/.test(JSON.stringify(anon.direct)), 'aucun nom ni initiale dans les votes d’un sondage anonyme');
  const sansHeures = CMX05.composerSondages({ ...base, sondages: [sond('p1', { heuresConnues: false })] });
  assert.equal(sansHeures.direct, null, 'sans l’heure des votes, pas de « Votes en direct »');
  let vote: any = null;
  const avecVote = CMX05.composerSondages({ ...base, moi: 'z@x', sondages: [sond('p1')], actions: { onVoter: (s: string, o: string) => { vote = [s, o]; } } });
  avecVote.resultat.barres[1].onVoter();
  assert.deepEqual(vote, ['p1', 'b'], 'tant qu’on n’a pas voté, une barre se clique');
  assert.equal(CMX05.composerSondages({ ...base, actions: { onVoter: () => undefined } }).resultat.barres[0].onVoter, undefined, 'un seul vote par personne');
  const ed = CMX05.composerSondages({ ...base, editeur: { question: ' ', options: ['x', ''], anonyme: false, ajmani: null, extras: null } }).editeur;
  assert.equal(ed.complet, false);
  assert.equal(ed.note, 'Ton équipe voit le sondage tout de suite');
  const vide = CMX05.composerSondages({ ...base, sondages: [] });
  assert.equal(vide.resultat, null);
  assert.equal(vide.sousTitre, 'Décider ensemble en 30 secondes · aucun en cours');
});

await dit('MX04 · composerCanaux : rail, flux (événement, messages, réactions, fil), tiroir, « en train d’écrire », statuts ; un invité ne voit que ses canaux ; sans lecture connue, pas de pastille', () => {
  const at = (hhmm: string) => paris(AUJ, hhmm);
  const msg = (id: string, qui: string, h: string, extra: any = {}) => ({ id, canalId: 'cu', auteurEmail: `${qui}@x`, at: at(h), texte: `T ${id}`, ...extra });
  const messages = [msg('m1', 'a', '08:51', { reactions: [{ email: 'b@x', type: 'oeil' }] }), msg('m2', 'b', '08:54'), msg('r1', 'b', '09:02', { repondA: 'm2' }), msg('r2', 'a', '09:05', { repondA: 'm2' }), msg('r3', 'c', '09:18', { repondA: 'm2' }), msg('m3', 'a', '09:20', { reactions: [{ email: 'a@x', type: 'coche' }, { email: 'b@x', type: 'coche' }, { email: 'c@x', type: 'etoile' }] }), msg('x1', 'c', '10:00', { canalId: 'cd' })];
  const canal = (id: string, extra: any = {}) => ({ id, nom: id, visibilite: 'public', membres: ['a@x', 'b@x', 'c@x'], ...extra });
  const e = { langue: 'fr', maintenant: MAINT, moi: 'a@x', role: 'Propriétaire', nom: (m: string) => m.split('@')[0].toUpperCase(), canaux: [canal('cu', { lectureAt: at('08:00'), alerte: true, description: 'Urgent' }), canal('cd', { lectureAt: at('08:00') }), canal('sans', { lectureAt: undefined }), canal('prive', { visibilite: 'privé', membres: ['d@x'] })], messages, evenements: [{ id: 'ev', canalId: 'cu', titre: 'Ticket', sous: 'Depuis', at: at('08:50'), resoluAt: at('09:15') }], directs: [{ id: 'd1', nom: 'B', concentre: true, enLigne: true }, { id: 'd2', nom: 'C', concentre: false, tapeA: MAINT - 2000, enLigne: true }, { id: 'd3', nom: 'D', concentre: false, dernierAt: at('10:05'), enLigne: false }], frappes: [{ canalId: 'cu', email: 'c@x', tapeA: MAINT - 3000 }, { canalId: 'cu', email: 'a@x', tapeA: MAINT - 1000 }, { canalId: 'cu', email: 'b@x', tapeA: MAINT - 60_000 }], canalId: 'cu', filOuvertId: 'm2', brouillon: '', resumes: { m2: 'Résumé.' }, avecReactions: true, peutTache: true };
  const v = CMX04.composerCanaux(e);
  assert.deepEqual(v.rail.canaux.map((c: any) => [c.id, c.nonLus, c.actif]), [['cu', 3, true], ['cd', 1, false], ['sans', 0, false]], 'un canal privé dont on n’est pas membre ne se voit pas ; sans lecture connue, 0');
  assert.equal(v.sousTitre, 'Une conversation par sujet, rien ne se perd · 4 non lus');
  assert.deepEqual(v.rail.directs.map((d: any) => d.statut), ['concentré', 'écrit…', '10:05']);
  assert.equal(v.canal.alerte, 'Alerte tickets urgents');
  assert.ok(/3 membres/.test(v.canal.description));
  assert.deepEqual(v.flux.map((x: any) => x.genre + ':' + x.id), ['evenement:ev', 'message:m1', 'message:m2', 'message:m3'], 'l’événement, puis les messages (sans les réponses de fil), du plus ancien au plus récent');
  assert.equal(v.flux[0].etat.libelle, 'Résolu à 09:15');
  assert.equal(v.flux[2].fil.libelle, '3 réponses');
  assert.equal(v.flux[2].fil.derniere, 'dernière à 09:18');
  const r3 = Object.fromEntries(v.flux[3].reactions.map((r: any) => [r.type, [r.n, r.miennes]]));
  assert.deepEqual(r3, { coche: [2, true], oeil: [0, false], etoile: [1, false] });
  assert.equal(v.ecrit, 'C est en train d’écrire', 'ni moi, ni une frappe de plus de 6 s, jamais le contenu');
  assert.equal(v.tiroir.reponses, '3 réponses');
  assert.deepEqual(v.tiroir.lignes.map((l: any) => l.id), ['r1', 'r2', 'r3']);
  assert.equal(v.tiroir.systeme.texte, 'Ticket marqué résolu');
  assert.equal(v.tiroir.systeme.heure, '09:15');
  assert.equal(v.tiroir.suivent.texte, '3 personnes suivent ce fil');
  assert.equal(v.tiroir.resume, 'Résumé.');
  assert.equal(v.compositeur.placeholder, 'Écrire dans #cu');
  const invite = CMX04.composerCanaux({ ...e, role: 'Invité', moi: 'd@x' });
  assert.deepEqual(invite.rail.canaux.map((c: any) => c.id), ['prive'], 'un invité ne voit que les canaux dont il est membre');
  assert.equal(invite.rail.peutCreer, false);
  const sans = CMX04.composerCanaux({ ...e, avecReactions: false, filOuvertId: null, frappes: [] });
  assert.equal(sans.flux[1].reactions, null, 'sans réactions connues, aucune rangée');
  assert.equal(sans.tiroir, null);
  assert.equal(sans.ecrit, null);
  const ailleurs = CMX04.composerCanaux({ ...e, canaux: [{ ...canal('general'), ouvreAilleurs: true }], canalId: 'general' });
  assert.equal(ailleurs.canal, null, 'un canal qui s’ouvre ailleurs n’est jamais le canal choisi d’office');
});

await dit('aucune brique visuelle : ni React, ni src/socle/ui, ni code partagé ; seulement les voisins, le dictionnaire du socle et le modèle des connecteurs (S9)', () => {
  const fautes: string[] = [];
  for (const { f, src } of sources) {
    for (const m of src.matchAll(/(?:import|export)[^'"]*?from\s+['"]([^'"]+)['"]/g)) {
      const i = m[1];
      if (i.startsWith('./') || i === '../../socle/mots' || i === '../connecteurs/baie' || i === '../connecteurs/types' || i === '../connecteurs/reglages') continue;
      fautes.push(`${f}.ts importe ${i}`);
    }
  }
  assert.deepEqual(fautes, [], fautes.join('\n'));
});
await dit('rien ne lit l’horloge ni le hasard, et rien n’est gardé sur le poste : « maintenant » est un paramètre, la présence n’a pas d’historique', () => {
  const fautes = sources.filter(({ src }) => /Date\.now\(|new Date\(\)|Math\.random|performance\.now|localStorage|sessionStorage|indexedDB/.test(sansCommentaires(src))).map(({ f }) => f);
  assert.deepEqual(fautes, []);
});
await dit('aucun nom, aucune adresse ni montant des images dans la logique (ni dans ses commentaires)', () => {
  const interdits = /Menna|Medina|Cabinet Roux|Studio Nova|Roux Santé|Boulangerie|Parc Sud|Atelier Sarah|Mohamed|Riyad|Aaron|Karim|Amina|Dupont|Gmail|Stripe|@[a-z-]+\.(?:fr|com)\b|\d[\d  ]*\s?€/;
  const fautes = sources.filter(({ src }) => interdits.test(src)).map(({ f, src }) => `${f}.ts : ${interdits.exec(src)?.[0]}`);
  assert.deepEqual(fautes, [], fautes.join('\n'));
});
await dit('aucune adresse de lien, aucun jeton, aucun mot de passe dans les types de MX03 ; aucun secret dans la zone', () => {
  const partages = sansCommentaires(sources.find((s) => s.f === 'partages')?.src ?? '');
  assert.ok(!/\b(?:url|href|jeton|token|motDePasse|password|adresseDuLien|lienComplet)\b\s*[:?]/i.test(partages), 'un type de MX03 porte une adresse ou un secret');
  const fautes = sources.filter(({ src }) => /(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{8,}|ghp_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{12,}|BEGIN [A-Z ]*PRIVATE KEY-----\n|https?:\/\//.test(sansCommentaires(src))).map(({ f }) => f);
  assert.deepEqual(fautes, []);
});
await dit('aucune couleur écrite à la main : les tons restent des mots, le néon vient des jetons de la famille', () => {
  const fautes = sources.filter(({ src }) => /#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(sansCommentaires(src))).map(({ f }) => f);
  assert.deepEqual(fautes, []);
});
await dit('la fiche d’origine est citée : chaque fichier nomme l’écran qu’il sert (ID de fiche en commentaire)', () => {
  const attendus: Record<string, RegExp> = { boite: /G07/, hub: /F40/, canaux: /MX04/, connecteurs: /H21/, appels: /H13/, annonces: /H14/, courriel: /MX01/, reunions: /MX02/, partages: /MX03/, sondages: /MX05/, reponsesAuto: /MX06/ };
  const fautes = Object.entries(attendus).filter(([f, re]) => !re.test(sources.find((s) => s.f === f)?.src ?? '')).map(([f]) => f);
  assert.deepEqual(fautes, []);
});

console.log('');
if (echecs > 0) {
  console.error(`ÉCHEC — ${echecs} propriété(s) de la logique d’Échanger ne tiennent pas.`);
  process.exit(1);
}
console.log(`OK — ${vus} propriétés de la logique d’Échanger tiennent.`);
process.exit(0);

/**
 * Contrôle de la LOGIQUE DE LOT-02 · MES CONTACTS ET CLIENTS — `npm run check:contacts`.
 *
 * Sans réseau, sans navigateur. La logique pure du lot (`src/refonte/contacts/`) est exercée
 * hors interface : d'abord sur des cas écrits à la main (règles de `STATUT.md` §1.22 et de
 * `REGLES.md`), puis sur les jeux fictifs de SIM (`src/refonte/donnees/`) aux quatre volumes.
 * S'y ajoutent des contrôles de structure : aucun composant ni brique visuelle avant le feu
 * vert du CO, aucune lecture de l'horloge, aucun nom réel, et les deux voix — l'interface
 * tutoie, ce qui part chez un client vouvoie.
 *
 * Les fiches du lot (dossier v4) n'étaient pas à disposition de la session de préparation :
 * les règles qui en dépendent sont marquées « à confirmer » dans la note du lot, et les
 * valeurs de départ vivent à un seul endroit (`REGLES_PAR_DEFAUT`).
 *
 *   npm run check:contacts
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ZONE = 'src/refonte/contacts';
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
  "export * as L from '../src/refonte/contacts';\nexport * as monde from '../src/refonte/donnees';\nexport { DICTIONNAIRES_CONTACTS } from '../src/refonte/contacts/i18n';\nexport * as V from '../src/refonte/connecteurs/reglages';",
);
const { L, monde, V, DICTIONNAIRES_CONTACTS: DICO } = M;
const paris = (jour: string, hhmm: string): number => L.instantParis(jour, hhmm);
const VOLUMES = ['vide', 'peu', 'normal', 'beaucoup'] as const;
const mondes = Object.fromEntries(VOLUMES.map((v) => [v, monde.construireMonde({ volume: v })])) as Record<(typeof VOLUMES)[number], any>;

const prospect = (o: Record<string, unknown> = {}) => ({
  id: 'p-x', nom: 'Atelier Test', contactNom: 'Alex Test', offre: 'Offre', montantCents: 100_000, recurrence: null, etape: 'nouveau', probabilite: 50,
  responsableEmail: 'a@exemple.test', prochaineAction: 'Appeler', prochaineActionLe: '2026-11-02', urgent: false, checklist: { faites: 0, total: 3 },
  creeLe: '2026-10-01', signeLe: null, perduLe: null, clientId: null, ...o,
});
const relance = (o: Record<string, unknown> = {}) => ({
  id: 'rl-x', clientId: 1, clientNom: 'Boulangerie Test', motif: 'facture', objetId: 'f-1', objetLibelle: 'Facture F-001', montantCents: 120_000,
  departLe: '2026-10-01', etat: 'prête', message: '', nbEnvoyees: 0, derniereEnvoiLe: null, ...o,
});

/* ── Pipeline ───────────────────────────────────────────────────────────── */
console.log('Contacts — pipeline (H06, MC01)\n');

await dit('six étapes, quatre colonnes : « contacté » rejoint Nouveau, « gagné » devient Signé, « perdu » sort', () => {
  assert.deepEqual(L.ETAPES, ['nouveau', 'contacté', 'rendez-vous', 'devis envoyé', 'gagné', 'perdu']);
  assert.deepEqual(L.COLONNES, ['Nouveau', 'Rendez-vous', 'Devis envoyé', 'Signé']);
  const cols = L.colonnesPipeline(['nouveau', 'contacté', 'rendez-vous', 'devis envoyé', 'gagné', 'perdu'].map((etape, i) => prospect({ id: `p${i}`, etape })));
  assert.deepEqual(cols.map((c: any) => c.prospects.length), [2, 1, 1, 1]);
});

await dit('valeur pondérée : montant × probabilité ; signé 100 % ; perdu et sans montant 0', () => {
  assert.equal(L.valeurPonderee(prospect({ montantCents: 200_000, probabilite: 25 })), 50_000);
  assert.equal(L.valeurPonderee(prospect({ montantCents: 200_000, probabilite: 25, etape: 'gagné' })), 200_000);
  assert.equal(L.valeurPonderee(prospect({ montantCents: 200_000, probabilite: 80, etape: 'perdu' })), 0);
  assert.equal(L.valeurPonderee(prospect({ montantCents: null })), 0);
  assert.equal(L.valeurPonderee(prospect({ montantCents: 100_000, probabilite: 150 })), 100_000, 'probabilité bornée à 100');
});

await dit('colonne : urgent d’abord, puis prochaine action la plus proche, sans date en dernier ; totaux et « sans montant »', () => {
  const [col] = L.colonnesPipeline([
    prospect({ id: 'a', prochaineActionLe: '2026-11-09' }),
    prospect({ id: 'b', prochaineActionLe: null }),
    prospect({ id: 'c', prochaineActionLe: '2026-11-03' }),
    prospect({ id: 'd', prochaineActionLe: '2026-12-01', urgent: true, montantCents: null }),
  ]);
  assert.deepEqual(col.prospects.map((p: any) => p.id), ['d', 'c', 'a', 'b']);
  assert.equal(col.totalCents, 300_000);
  assert.equal(col.pondereCents, 150_000);
  assert.equal(col.sansMontant, 1);
});

await dit('résumé : en retard seulement si ouvert ; taux de conversion = gagnés ÷ conclus, null sans conclu', () => {
  const r = L.resumePipeline(
    [prospect({ id: '1', prochaineActionLe: '2026-10-29' }), prospect({ id: '2', etape: 'gagné', prochaineActionLe: '2026-10-01' }), prospect({ id: '3', etape: 'perdu' }), prospect({ id: '4', etape: 'perdu' }), prospect({ id: '5', urgent: true })],
    '2026-10-30',
  );
  assert.deepEqual({ o: r.ouverts, g: r.gagnes, p: r.perdus, r: r.enRetard, u: r.urgents }, { o: 2, g: 1, p: 2, r: 1, u: 1 });
  assert.equal(r.tauxConversion, 1 / 3);
  assert.equal(L.resumePipeline([prospect()], '2026-10-30').tauxConversion, null);
});

await dit('transitions : avancer librement, reculer d’une étape, perdre partout, gagné et perdu terminaux', () => {
  assert.deepEqual(L.transitionsPermises('nouveau'), ['contacté', 'rendez-vous', 'devis envoyé', 'gagné', 'perdu']);
  assert.deepEqual(L.transitionsPermises('rendez-vous'), ['contacté', 'devis envoyé', 'gagné', 'perdu']);
  assert.deepEqual(L.transitionsPermises('gagné'), []);
  assert.deepEqual(L.transitionsPermises('perdu'), []);
});

await dit('gagner : date de signature, 100 %, plus d’action, et un client à créer s’il n’y en a pas', () => {
  const g = L.deplacer(prospect({ etape: 'devis envoyé', urgent: true }), 'gagné', '2026-10-30');
  assert.equal(g.prospect.signeLe, '2026-10-30');
  assert.equal(g.prospect.probabilite, 100);
  assert.equal(g.prospect.prochaineActionLe, null);
  assert.equal(g.prospect.urgent, false);
  assert.equal(g.creerClient, true);
  assert.equal(L.deplacer(prospect({ etape: 'devis envoyé', clientId: 7 }), 'gagné', '2026-10-30').creerClient, false);
  const p = L.deplacer(prospect(), 'perdu', '2026-10-30');
  assert.deepEqual([p.prospect.perduLe, p.prospect.probabilite, p.creerClient], ['2026-10-30', 0, false]);
});

await dit('un mouvement refusé lève une erreur ; l’objet d’origine n’est jamais modifié', () => {
  const p = prospect({ etape: 'gagné' });
  assert.throws(() => L.deplacer(p, 'nouveau', '2026-10-30'), /refusé/);
  const q = prospect();
  L.deplacer(q, 'gagné', '2026-10-30');
  assert.equal(q.etape, 'nouveau');
});

/* ── Relances : la règle d'espacement ───────────────────────────────────── */
console.log('\nContacts — relances (MC07) : on ne harcèle jamais un client\n');

const R = L.REGLES_PAR_DEFAUT;
const VENDREDI_10H = paris('2026-10-30', '10:15');

await dit('valeurs de départ du CO (STATUT §1.22) : 7 jours entre relances, plage clients lun.–ven. 08:00–19:00, lues chez S9', () => {
  assert.equal(R.espacementJours, 7);
  assert.equal(R.espacementJours, V.VALEURS_DE_DEPART.delaiEntreRelancesJours, 'même source que les réglages de l’autonomie');
  assert.deepEqual(R.fenetre, V.VALEURS_DE_DEPART.plageClients);
  assert.deepEqual(R.fenetre, { debut: '08:00', fin: '19:00', jours: [1, 2, 3, 4, 5] });
  assert.equal(R.unParClientEtParJour, true);
});

await dit('première relance : permise en semaine, dans la plage', () => {
  assert.deepEqual(L.verdictRelance(relance(), [], VENDREDI_10H), { possible: true });
});

await dit('espacement : 3 jours après un envoi → attendre ; exactement 7 jours → permis', () => {
  const r = relance({ etat: 'envoyée', nbEnvoyees: 1, derniereEnvoiLe: '2026-10-27' });
  const v = L.verdictRelance(r, [], VENDREDI_10H);
  assert.equal(v.possible, false);
  assert.equal(v.raison, 'espacement');
  assert.equal(v.prochaineLe, paris('2026-11-03', '08:00'), 'mardi 3 nov. à l’ouverture');
  assert.equal(L.verdictRelance(relance({ etat: 'envoyée', nbEnvoyees: 1, derniereEnvoiLe: '2026-10-23' }), [], VENDREDI_10H).possible, true);
  assert.equal(L.verdictRelance(relance({ etat: 'envoyée', nbEnvoyees: 1, derniereEnvoiLe: '2026-10-24' }), [], VENDREDI_10H).possible, false, '6 jours : trop tôt');
});

await dit('l’espacement suit le réglage : à 14 jours, 10 jours ne suffisent pas', () => {
  const r = relance({ etat: 'envoyée', nbEnvoyees: 1, derniereEnvoiLe: '2026-10-20' });
  assert.equal(L.verdictRelance(r, [], VENDREDI_10H).possible, true);
  const v = L.verdictRelance(r, [], VENDREDI_10H, { ...R, espacementJours: 14 });
  assert.equal(v.raison, 'espacement');
  assert.equal(v.prochaineLe, paris('2026-11-03', '08:00'));
});

await dit('changement d’heure : l’ouverture du lendemain reste 08:00 à Paris (heure d’hiver, UTC+1)', () => {
  const r = relance({ etat: 'envoyée', nbEnvoyees: 1, derniereEnvoiLe: '2026-10-22' });
  const v = L.verdictRelance(r, [], paris('2026-10-25', '12:00'));
  assert.equal(v.possible, false);
  assert.equal(new Date(v.prochaineLe).toISOString(), '2026-10-29T07:00:00.000Z');
});

await dit('plafond : au bout de 3 relances, plus aucune, et la phrase propose un autre geste', () => {
  const v = L.verdictRelance(relance({ etat: 'envoyée', nbEnvoyees: 3, derniereEnvoiLe: '2026-09-01' }), [], VENDREDI_10H);
  assert.deepEqual([v.possible, v.raison, v.prochaineLe], [false, 'plafond', null]);
  assert.match(L.phraseAttente(v, 'fr'), /3 relances/);
  assert.match(L.phraseAttente(v, 'fr'), /appel/);
});

await dit('répondue ou arrêtée : terminée, jamais renvoyée', () => {
  for (const etat of ['répondue', 'arrêtée']) assert.equal(L.verdictRelance(relance({ etat }), [], VENDREDI_10H).raison, 'terminee');
  assert.equal(L.arreter(relance()).etat, 'arrêtée');
  assert.equal(L.marquerRepondue(relance()).etat, 'répondue');
});

await dit('plage d’envoi : samedi, dimanche, 07:59 et 19:00 attendent l’ouverture suivante', () => {
  const cas: [string, string, string, string][] = [
    ['2026-10-31', '11:00', '2026-11-02', '08:00'], // samedi → lundi
    ['2026-11-01', '09:00', '2026-11-02', '08:00'], // dimanche → lundi
    ['2026-10-30', '07:59', '2026-10-30', '08:00'],
    ['2026-10-30', '19:00', '2026-11-02', '08:00'], // vendredi soir → lundi
  ];
  for (const [j, h, jOk, hOk] of cas) {
    const v = L.verdictRelance(relance(), [], paris(j, h));
    assert.deepEqual([v.possible, v.raison, v.prochaineLe], [false, 'horsPlage', paris(jOk, hOk)], `${j} ${h}`);
  }
  assert.equal(L.verdictRelance(relance(), [], paris('2026-10-30', '08:00')).possible, true, '08:00 pile : ouvert');
  assert.equal(L.verdictRelance(relance(), [], paris('2026-10-30', '18:59')).possible, true);
});

await dit('un seul message par client et par jour, tous objets confondus', () => {
  const dejaEcrit = relance({ id: 'rl-a', objetId: 'f-9', etat: 'envoyée', nbEnvoyees: 1, derniereEnvoiLe: '2026-10-30' });
  const v = L.verdictRelance(relance({ id: 'rl-b' }), [dejaEcrit], VENDREDI_10H);
  assert.deepEqual([v.possible, v.raison, v.prochaineLe], [false, 'memeClient', paris('2026-11-02', '08:00')]);
  assert.equal(L.verdictRelance(relance({ id: 'rl-b' }), [{ ...dejaEcrit, clientId: 2 }], VENDREDI_10H).possible, true, 'un autre client ne compte pas');
  assert.equal(L.verdictRelance(relance({ id: 'rl-b' }), [{ ...dejaEcrit, derniereEnvoiLe: '2026-10-29' }], VENDREDI_10H).possible, true, 'hier ne compte pas');
});

await dit('un prospect (sans fiche) se reconnaît à son nom', () => {
  const a = relance({ id: 'a', clientId: null, clientNom: 'Atelier Neuf', motif: 'prospect', derniereEnvoiLe: '2026-10-30', etat: 'envoyée', nbEnvoyees: 1 });
  const b = relance({ id: 'b', clientId: null, clientNom: 'Atelier Neuf', motif: 'prospect' });
  assert.equal(L.verdictRelance(b, [a], VENDREDI_10H).raison, 'memeClient');
});

await dit('la file : un seul départ par client (le plus gros montant), les autres attendent le jour suivant', () => {
  const file = L.ordonnerFile([
    relance({ id: 'petite', objetId: 'f-1', montantCents: 10_000 }),
    relance({ id: 'grosse', objetId: 'f-2', montantCents: 900_000 }),
    relance({ id: 'autre', clientId: 2, clientNom: 'Autre', objetId: 'f-3', montantCents: 50_000 }),
    relance({ id: 'finie', clientId: 3, etat: 'répondue' }),
    relance({ id: 'plafonnee', clientId: 4, nbEnvoyees: 3, etat: 'envoyée', derniereEnvoiLe: '2026-09-01' }),
  ], VENDREDI_10H);
  assert.deepEqual(file.maintenant.map((e: any) => e.relance.id), ['grosse', 'autre']);
  assert.deepEqual(file.plusTard.map((e: any) => [e.relance.id, e.verdict.raison]), [['petite', 'memeClient']]);
  assert.deepEqual(file.plafond.map((e: any) => e.relance.id), ['plafonnee']);
  assert.deepEqual(file.terminees.map((e: any) => e.relance.id), ['finie']);
});

await dit('envoyer : compte +1, date du jour ; refusé (erreur) si le verdict ne le permet pas', () => {
  const r = L.marquerEnvoyee(relance(), [], VENDREDI_10H);
  assert.deepEqual([r.etat, r.nbEnvoyees, r.derniereEnvoiLe], ['envoyée', 1, '2026-10-30']);
  assert.throws(() => L.marquerEnvoyee(r, [], VENDREDI_10H), /espacement/);
  assert.throws(() => L.marquerEnvoyee(relance(), [], paris('2026-10-31', '10:00')), /horsPlage/);
});

await dit('à trois relances d’un même objet espacées de 7 jours, la quatrième est refusée', () => {
  let r = relance();
  let t = paris('2026-10-05', '10:00'); // lundi
  for (let i = 0; i < 3; i += 1) {
    r = L.marquerEnvoyee(r, [], t);
    t += 7 * 86_400_000;
  }
  assert.equal(r.nbEnvoyees, 3);
  assert.equal(L.verdictRelance(r, [], t).raison, 'plafond');
});

await dit('les cinq phrases d’attente existent en fr et en, avec la date et les heures de la règle', () => {
  const v = L.verdictRelance(relance(), [], paris('2026-10-31', '11:00'));
  assert.match(L.phraseAttente(v, 'fr'), /08:00.*19:00.*02\/11/);
  assert.match(L.phraseAttente(v, 'en'), /08:00.*19:00.*02\/11/);
});

/* ── Messages vers le client : vouvoiement ──────────────────────────────── */
console.log('\nContacts — ce qui part chez un client : vouvoiement\n');

const TUTOIEMENT = /\b(tu|toi|ton|ta|tes|te|t’|t')\b|\bt[’']/i;
const VOUVOIEMENT_UI = /(?<!rendez-)\b(vous|votre|vos|pourriez|souhaitez)\b/i;

await dit('les cinq messages de relance vouvoient et ne tutoient jamais, avec les chiffres de la relance', () => {
  for (const motif of ['facture', 'devis', 'rendez-vous', 'prospect', 'inactif']) {
    const m = L.messageClient(relance({ motif, objetLibelle: 'Objet X', montantCents: 123_400, departLe: '2026-10-01' }), 'fr', '2026-10-30');
    assert.match(m, /^Bonjour, /);
    assert.match(m, /Bien cordialement\.$/);
    assert.ok(/\bvous\b|\bvotre\b|\bnous\b/i.test(m), motif);
    assert.ok(!TUTOIEMENT.test(m), `${motif} tutoie : ${m}`);
  }
  const f = L.messageClient(relance({ objetLibelle: 'Facture F-001', montantCents: 123_400, departLe: '2026-10-01' }), 'fr', '2026-10-30');
  assert.match(f, /Facture F-001/);
  assert.match(f, /1\u00a0234,00\u00a0€|1\u00a0234\u00a0€/);
  assert.match(f, /01\/10\/2026/);
});

await dit('après une première relance, le message le dit ; le devis donne son ancienneté', () => {
  assert.match(L.messageClient(relance({ nbEnvoyees: 1 }), 'fr', '2026-10-30'), /revenir vers vous/);
  assert.ok(!/revenir vers vous/.test(L.messageClient(relance({ nbEnvoyees: 0 }), 'fr', '2026-10-30')));
  assert.match(L.messageClient(relance({ motif: 'devis', departLe: '2026-10-16' }), 'fr', '2026-10-30'), /il y a 14 jours/);
});

/* ── Fidélité ───────────────────────────────────────────────────────────── */
console.log('\nContacts — fidélité (MC02)\n');

await dit('paliers : Bronze dès 0, Argent dès 500, Or dès 1 500', () => {
  for (const [pts, niv] of [[0, 'Bronze'], [499, 'Bronze'], [500, 'Argent'], [1499, 'Argent'], [1500, 'Or'], [9000, 'Or']] as const) assert.equal(L.niveauPour(pts), niv, String(pts));
});

await dit('progression : points qui manquent, part dans le niveau, Or = plafond', () => {
  assert.deepEqual(L.progression(0), { niveau: 'Bronze', suivant: 'Argent', manque: 500, part: 0 });
  assert.deepEqual(L.progression(250), { niveau: 'Bronze', suivant: 'Argent', manque: 250, part: 0.5 });
  assert.deepEqual(L.progression(1000), { niveau: 'Argent', suivant: 'Or', manque: 500, part: 0.5 });
  assert.deepEqual(L.progression(1500), { niveau: 'Or', suivant: null, manque: null, part: 1 });
});

await dit('les points d’un client = euros TTC payés sur 12 mois, jamais une facture en attente, ancienne ou d’un autre client', () => {
  const facture = (o: Record<string, unknown>) => ({
    clientId: 1, status: 'paid', paidAt: '2026-06-01', lines: [{ id: 'l', label: 'x', quantity: 1, unitPriceCents: 10_000, vatRate: 20 }], ...o,
  });
  // 100 € HT + 20 % = 120 € TTC = 120 points
  assert.equal(L.pointsDe([facture({})], 1, '2026-10-30'), 120);
  assert.equal(L.pointsDe([facture({}), facture({})], 1, '2026-10-30'), 240);
  assert.equal(L.pointsDe([facture({ paidAt: '2025-10-29' })], 1, '2026-10-30'), 0, 'plus d’un an');
  assert.equal(L.pointsDe([facture({ paidAt: '2025-10-30' })], 1, '2026-10-30'), 120, 'tout juste un an');
  assert.equal(L.pointsDe([facture({ status: 'issued', paidAt: '' })], 1, '2026-10-30'), 0, 'en attente');
  assert.equal(L.pointsDe([facture({ clientId: 2 })], 1, '2026-10-30'), 0, 'autre client');
  assert.equal(L.pointsDe([facture({ lines: [{ id: 'l', label: 'x', quantity: 1, unitPriceCents: 9_999, vatRate: 0 }] })], 1, '2026-10-30'), 99, 'arrondi à l’euro inférieur');
});

for (const v of VOLUMES) {
  await dit(`SIM (${v}) : chaque compte de fidélité redonne ses points depuis les factures, et son niveau découle de ses points`, () => {
    const m = mondes[v];
    for (const c of m.fidelite) {
      assert.equal(L.pointsDe(m.factures, c.clientId, m.contexte.aujourdhui), c.points, c.clientNom);
      assert.ok(L.niveauCoherent(c), `${c.clientNom} : ${c.points} → ${c.niveau}`);
    }
    const r = L.resumeFidelite(m.fidelite, m.contexte.aujourdhui);
    assert.equal(r.total, m.fidelite.length);
    assert.equal(r.parNiveau.Bronze + r.parNiveau.Argent + r.parNiveau.Or, r.total);
  });
}

/* ── Rendez-vous ────────────────────────────────────────────────────────── */
console.log('\nContacts — rendez-vous clients (MC06)\n');

const ev = (o: Record<string, unknown> = {}) => ({
  id: 'e-x', title: 'Point', startAt: new Date(paris('2026-11-02', '10:00')).toISOString(), durationMin: 60, clientId: 1, clientName: 'Boulangerie Test',
  type: 'rendez-vous client', confirmation: 'confirmé', systeme: false, ...o,
});
const a = (j: string, h: string) => new Date(paris(j, h)).toISOString();

await dit('états : à venir, à confirmer, en cours, passé, manqué', () => {
  const t = paris('2026-11-02', '10:30');
  assert.equal(L.etatRendezVous(ev(), paris('2026-11-02', '08:00')), 'a-venir');
  assert.equal(L.etatRendezVous(ev({ confirmation: 'à confirmer' }), paris('2026-11-02', '08:00')), 'a-confirmer');
  assert.equal(L.etatRendezVous(ev(), t), 'en-cours');
  assert.equal(L.etatRendezVous(ev(), paris('2026-11-02', '11:00')), 'passe', 'fini pile à 11:00');
  assert.equal(L.etatRendezVous(ev({ confirmation: 'manqué' }), t), 'manque');
});

await dit('à confirmer : seulement les rendez-vous clients à venir dans l’horizon, par date ; jamais le système', () => {
  const liste = [
    ev({ id: 'tard', confirmation: 'à confirmer', startAt: a('2026-11-03', '09:00') }),
    ev({ id: 'tot', confirmation: 'à confirmer', startAt: a('2026-11-02', '09:00') }),
    ev({ id: 'loin', confirmation: 'à confirmer', startAt: a('2026-11-20', '09:00') }),
    ev({ id: 'ok', confirmation: 'confirmé' }),
    ev({ id: 'ronde', confirmation: 'à confirmer', systeme: true }),
    ev({ id: 'reunion', confirmation: 'à confirmer', type: 'réunion' }),
  ];
  assert.deepEqual(L.aConfirmer(liste, paris('2026-11-01', '12:00'), 3).map((e: any) => e.id), ['tot', 'tard']);
  assert.deepEqual(L.aConfirmer(liste, paris('2026-11-03', '12:00'), 3).map((e: any) => e.id), []);
});

await dit('chevauchements : bout à bout permis, empiètement signalé, manqués et système ignorés', () => {
  const l = [
    ev({ id: 'a', startAt: a('2026-11-02', '10:00'), durationMin: 60 }),
    ev({ id: 'b', startAt: a('2026-11-02', '11:00'), durationMin: 30 }),
    ev({ id: 'c', startAt: a('2026-11-02', '11:15'), durationMin: 30 }),
    ev({ id: 'd', startAt: a('2026-11-02', '11:20'), durationMin: 30, confirmation: 'manqué' }),
    ev({ id: 'e', startAt: a('2026-11-02', '11:20'), durationMin: 30, systeme: true }),
  ];
  assert.deepEqual(L.chevauchements(l).map(([x, y]: any) => `${x.id}${y.id}`), ['bc']);
});

await dit('créneaux libres : pas de 30 min dans 09:00–18:00, sans toucher un rendez-vous, durée entière dans la plage', () => {
  const l = [ev({ startAt: a('2026-11-02', '10:00'), durationMin: 60 }), ev({ startAt: a('2026-11-02', '16:30'), durationMin: 90 })];
  const hm = (t: number) => `${String(Math.floor(L.minutesParis(t) / 60)).padStart(2, '0')}:${String(L.minutesParis(t) % 60).padStart(2, '0')}`;
  const libres = L.creneauxLibres(l, '2026-11-02', { dureeMin: 60 }).map(hm);
  assert.deepEqual(libres, ['09:00', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30']);
  assert.deepEqual(L.creneauxLibres([], '2026-11-02', { dureeMin: 600 }), [], 'rien ne tient');
  const manque = [ev({ startAt: a('2026-11-02', '10:00'), confirmation: 'manqué' })];
  assert.ok(L.creneauxLibres(manque, '2026-11-02', { dureeMin: 60 }).includes(paris('2026-11-02', '10:00')), 'un manqué libère le créneau');
});

await dit('un rendez-vous manqué appelle une relance « rendez-vous » ; un autre non', () => {
  const r = L.relanceDepuisManque(ev({ confirmation: 'manqué', title: 'Visite' }));
  assert.deepEqual([r.motif, r.objetLibelle, r.etat, r.nbEnvoyees, r.departLe], ['rendez-vous', 'Visite', 'prête', 0, '2026-11-02']);
  assert.equal(L.relanceDepuisManque(ev()), null);
  assert.equal(L.relanceDepuisManque(ev({ confirmation: 'manqué', systeme: true })), null);
});

for (const v of VOLUMES) {
  await dit(`SIM (${v}) : les états des rendez-vous se recalculent, les manqués sont les manqués`, () => {
    const m = mondes[v];
    const clients = m.evenements.filter(L.estRendezVousClient);
    assert.ok(clients.every((e: any) => !e.systeme));
    assert.equal(L.manques(m.evenements).length, clients.filter((e: any) => e.confirmation === 'manqué').length);
    for (const e of clients) assert.ok(['a-venir', 'a-confirmer', 'en-cours', 'passe', 'manque'].includes(L.etatRendezVous(e, m.contexte.maintenant)));
    for (const x of L.aConfirmer(m.evenements, m.contexte.maintenant, 7)) assert.equal(x.confirmation, 'à confirmer');
  });
}

/* ── Contacts par client (source demandée par H41) ──────────────────────── */
console.log('\nContacts — contacts par client (source de H41, MC03, G04)\n');

const it = (o: Record<string, unknown>) => ({
  id: 'i-x', prenom: 'A', nom: 'B', nomComplet: 'A B', fonction: '', organisationType: 'client', organisationId: '1', organisationNom: 'Test', email: 'a@exemple.test',
  telephone: '06 39 98 00 01', notes: '', favori: false, dernierEchangeAt: '2026-10-01T10:00:00.000Z', nonLu: false, preference: 'courriel', ...o,
});

await dit('tri : favoris, puis le plus récemment joint, puis l’ordre alphabétique ; filtre par type ET identifiant', () => {
  const l = [
    it({ id: '1', nomComplet: 'Zoé' }), it({ id: '2', nomComplet: 'Anne', dernierEchangeAt: '2026-10-20T10:00:00.000Z' }), it({ id: '3', nomComplet: 'Marc', favori: true }),
    it({ id: '4', organisationId: '2' }), it({ id: '5', organisationType: 'fournisseur' }),
  ];
  assert.deepEqual(L.contactsParClient(l, 1).map((x: any) => x.id), ['3', '2', '1']);
  assert.deepEqual(L.contactsParClient(l, '2').map((x: any) => x.id), ['4']);
  assert.deepEqual(L.contactsParOrganisation(l, 'fournisseur', '1').map((x: any) => x.id), ['5']);
});

await dit('le résumé d’un client : principal, non lus, dernier échange, jours sans nouvelles ; client sans contact géré', () => {
  const c = L.contactsDuClient([it({ id: '1', nonLu: true }), it({ id: '2', favori: true, dernierEchangeAt: '2026-10-25T08:00:00.000Z' })], 1);
  assert.deepEqual([c.principal.id, c.nonLus, c.dernierEchangeAt], ['2', 1, '2026-10-25T08:00:00.000Z']);
  assert.equal(L.joursSansEchange(c, '2026-10-30'), 5);
  const vide = L.contactsDuClient([], 9);
  assert.deepEqual([vide.principal, vide.tous, vide.nonLus, L.joursSansEchange(vide, '2026-10-30')], [null, [], 0, null]);
});

await dit('moyen de joindre : la préférence, avec repli quand le champ manque', () => {
  assert.deepEqual(L.moyenDeJoindre(it({ preference: 'téléphone' })), { moyen: 'téléphone', valeur: '06 39 98 00 01' });
  assert.deepEqual(L.moyenDeJoindre(it({ preference: 'téléphone', telephone: '' })), { moyen: 'courriel', valeur: 'a@exemple.test' });
  assert.deepEqual(L.moyenDeJoindre(it({ email: '', telephone: '06 39 98 00 01' })), { moyen: 'téléphone', valeur: '06 39 98 00 01' });
  assert.equal(L.moyenDeJoindre(it({ email: '', telephone: '' })), null);
});

for (const v of VOLUMES) {
  await dit(`SIM (${v}) : chaque interlocuteur d’un client appartient à une fiche client existante`, () => {
    const m = mondes[v];
    const ids = new Set(m.clients.map((c: any) => String(c.id)));
    const orphelins = m.interlocuteurs.filter((i: any) => i.organisationType === 'client' && !ids.has(i.organisationId)).map((i: any) => i.id);
    assert.deepEqual(orphelins, []);
    for (const c of m.clients) assert.ok(L.contactsDuClient(m.interlocuteurs, c.id).tous.every((i: any) => i.organisationType === 'client'));
  });
}

/* ── Les jeux de SIM : pipeline et relances aux quatre volumes ──────────── */
console.log('\nContacts — jeux fictifs de SIM\n');

for (const v of VOLUMES) {
  await dit(`SIM (${v}) : le pipeline range chaque prospect une fois, sans perdu dans les colonnes`, () => {
    const m = mondes[v];
    const cols = L.colonnesPipeline(m.prospects);
    const dedans = cols.flatMap((c: any) => c.prospects);
    assert.equal(dedans.length, m.prospects.filter((p: any) => p.etape !== 'perdu').length);
    assert.equal(new Set(dedans.map((p: any) => p.id)).size, dedans.length);
    const r = L.resumePipeline(m.prospects, m.contexte.aujourdhui);
    assert.equal(r.ouverts + r.gagnes + r.perdus, m.prospects.length);
    for (const c of cols) assert.equal(c.totalCents, c.prospects.reduce((s: number, p: any) => s + (p.montantCents ?? 0), 0));
  });
  await dit(`SIM (${v}) : la file de relances respecte les quatre garde-fous, recalculés à part`, () => {
    const m = mondes[v];
    const file = L.ordonnerFile(m.relances, m.contexte.maintenant);
    const tous = [...file.maintenant, ...file.plusTard, ...file.plafond, ...file.terminees];
    assert.equal(tous.length, m.relances.length, 'aucune relance perdue');
    const parClient = new Map<string, number>();
    for (const { relance: r } of file.maintenant) {
      const j = L.jourDeInstant(m.contexte.maintenant);
      assert.ok(r.nbEnvoyees < 3, 'plafond');
      assert.ok(!r.derniereEnvoiLe || L.ecartJours(r.derniereEnvoiLe, j) >= 7, `espacement ${r.id}`);
      assert.ok(r.etat !== 'répondue' && r.etat !== 'arrêtée');
      const k = L.cleClient(r);
      parClient.set(k, (parClient.get(k) ?? 0) + 1);
    }
    assert.ok([...parClient.values()].every((n) => n === 1), 'un seul départ par client');
    for (const { verdict } of file.plusTard) assert.ok(verdict.prochaineLe != null && verdict.prochaineLe > m.contexte.maintenant, 'une date future');
  });
}

/* ── Textes : deux voix ─────────────────────────────────────────────────── */
console.log('\nContacts — textes fr/en, tutoiement dans l’interface, vouvoiement vers les clients\n');

await dit('mêmes clés en fr et en, aucune vide, mêmes paramètres {x} dans les deux langues', () => {
  const en = Object.keys(DICO.en).sort();
  assert.deepEqual(Object.keys(DICO.fr).sort(), en);
  const params = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((x) => x[1]).sort().join(',');
  for (const k of en) {
    assert.ok(DICO.en[k].trim() && DICO.fr[k].trim(), k);
    assert.equal(params(DICO.fr[k]), params(DICO.en[k]), `paramètres de ${k}`);
  }
});

await dit('l’interface tutoie : aucune clé hors « client.* » ne vouvoie', () => {
  const fautes = Object.entries(DICO.fr as Record<string, string>).filter(([k, v]) => !k.startsWith('client.') && VOUVOIEMENT_UI.test(v)).map(([k, v]) => `${k} : ${v}`);
  assert.deepEqual(fautes, [], fautes.join('\n'));
});

await dit('ce qui part chez un client vouvoie : aucune clé « client.* » ne tutoie', () => {
  const fautes = Object.entries(DICO.fr as Record<string, string>).filter(([k, v]) => k.startsWith('client.') && TUTOIEMENT.test(v)).map(([k, v]) => `${k} : ${v}`);
  assert.deepEqual(fautes, [], fautes.join('\n'));
});

await dit('les comptes ont leurs deux formes (.1 et .n) dans les deux langues', () => {
  const bases = new Set(Object.keys(DICO.fr).filter((k) => /\.(1|n)$/.test(k)).map((k) => k.replace(/\.(1|n)$/, '')));
  for (const b of bases) for (const langue of ['fr', 'en']) assert.ok(DICO[langue][`${b}.1`] && DICO[langue][`${b}.n`], `${b} (${langue})`);
  assert.equal(L.direCompte('fr', 'relance.pretes', 1), '1 relance prête');
  assert.equal(L.direCompte('fr', 'relance.pretes', 4), '4 relances prêtes');
});

await dit('un encouragement quand une tâche est finie, jamais de reproche (Chaleur, REGLES.md)', () => {
  assert.match(DICO.fr['pipeline.signe'], /Bravo/);
  const reproches = Object.entries(DICO.fr as Record<string, string>).filter(([, v]) => /\b(retard de ta part|tu dois|tu as oublié|urgent !)/i.test(v));
  assert.deepEqual(reproches, []);
});

/* ── Structure ──────────────────────────────────────────────────────────── */
console.log('\nContacts — structure\n');

const fichiers = fs.readdirSync(path.join(racine, ZONE)).map((f) => path.join(ZONE, f));
const source = (f: string) => fs.readFileSync(path.join(racine, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

await dit('mode préparation : aucun composant React, aucun import de src/socle/ui, rien du code partagé ni de l’édition cliente', () => {
  const fautes: string[] = [];
  for (const f of fichiers) {
    if (/\.tsx$/.test(f)) fautes.push(`${f} : composant visuel`);
    for (const m of source(f).matchAll(/from\s+['"]([^'"]+)['"]/g)) {
      const cible = m[1];
      if (/socle\/ui|socle\/familles|\/screens\/|\/components\/|\/business\/|\.business|@edition|react/.test(cible)) fautes.push(`${f} importe ${cible}`);
    }
  }
  assert.deepEqual(fautes, [], fautes.join('\n'));
});

await dit('aucune lecture de l’horloge, aucun réseau, aucun stockage dans la logique', () => {
  const fautes: string[] = [];
  for (const f of fichiers) {
    const s = source(f);
    if (/Date\.now\s*\(|new Date\s*\(\s*\)|performance\.now|Math\.random|fetch\s*\(|localStorage|sessionStorage|XMLHttpRequest|process\.env/.test(s)) fautes.push(f);
  }
  assert.deepEqual(fautes, [], `horloge, hasard, réseau ou stockage dans : ${fautes.join(', ')}`);
});

await dit('aucun nom réel, aucune adresse ni secret dans la zone, la note ou le rapport', () => {
  const lieux = [...fichiers, 'docs/refonte/preparation/LOT-02-contacts.md', 'docs/refonte/rapports/LOT-02-preparation.md'].filter((f) => fs.existsSync(path.join(racine, f)));
  const fautes: string[] = [];
  for (const f of lieux) {
    const s = fs.readFileSync(path.join(racine, f), 'utf8');
    if (/Syraagensy|NWSY|sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{12,}|\b\d{1,3}(\.\d{1,3}){3}\b|(?<![A-Za-z0-9.-])[a-z0-9-]+@(?!exemple\.test)[a-z0-9-]+\.(com|fr|net|org)\b/.test(s)) fautes.push(f);
  }
  assert.deepEqual(fautes, [], fautes.join(', '));
});

await dit('la zone est dans src/refonte/contacts/ et la garde est branchée dans package.json et editions.yml', () => {
  assert.match(fs.readFileSync(path.join(racine, 'package.json'), 'utf8'), /"check:contacts":\s*"[^"]*scripts\/check-contacts\.ts"/);
  assert.match(fs.readFileSync(path.join(racine, '.github/workflows/editions.yml'), 'utf8'), /npm run check:contacts/);
});

console.log('');
if (echecs > 0) {
  console.error(`ÉCHEC — ${echecs} contrôle(s) de LOT-02 en défaut sur ${vus + echecs}.`);
  process.exit(1);
}
console.log(`OK — ${vus} contrôles de LOT-02 tiennent.`);
process.exit(0);

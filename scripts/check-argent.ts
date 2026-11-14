/**
 * Contrôle de la LOGIQUE D'ARGENT (LOT-04 L'argent) — `npm run check:argent`.
 *
 * Sans réseau, sans navigateur. La logique pure du lot (`src/refonte/argent/`) est
 * exercée sur des CAS ÉCRITS À L'AVANCE : chaque montant attendu ci-dessous a été
 * calculé à la main (le détail est en commentaire), avant que le code n'existe.
 * Un calcul d'argent qui change de résultat fait échouer la garde ; on corrige le
 * calcul, jamais l'attendu, sauf décision écrite (et datée) du CO.
 *
 * Puis la même logique est rejouée sur les jeux fictifs de SIM (`src/refonte/donnees/`),
 * sur plusieurs graines et volumes : elle doit retrouver les chiffres que les jeux
 * stockent pour comparaison (soldes, TVA des échéances, cotisations, prélèvements).
 *
 * Enfin, des contrôles de structure : aucun écran (mode préparation), aucun import du
 * code partagé vers la zone, aucune fonction qui émettrait un virement, des textes
 * fr/en aux mêmes clés, l'interface au tutoiement et ce qui part chez un client au
 * vouvoiement.
 *
 *   npm run check:argent
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ZONE = 'src/refonte/argent';
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

const MODULES = ['commun', 'facturation', 'devis', 'depenses', 'impayes', 'tva', 'abonnements', 'budget', 'tarifs', 'tresorerie', 'banque', 'paie', 'connecteurs', 'contrats', 'paiements', 'comptabilite', 'ensemble', 'i18n'] as const;

/* eslint-disable @typescript-eslint/no-explicit-any */
const M = await charger<any>(
  MODULES.map((f) => `export * as ${f} from '../src/refonte/argent/${f}';`).join('\n') +
    "\nexport * as monde from '../src/refonte/donnees';\nexport { netDueCents, nextNumber } from '../src/state/useInvoices';\nexport { ECHELLE, paliereDe } from '../src/lib/relances';\nexport { documentTotals } from '../src/lib/money';",
);
const { commun: C, facturation: F, devis: DV, depenses: DP, impayes: IM, tva: TV, abonnements: AB, budget: BU, tarifs: TA, tresorerie: TR, banque: BA, paie: PA, connecteurs: CO, contrats: CT, paiements: PM, comptabilite: CP, ensemble: EN, i18n: I, monde } = M;

/* ── Fabriques de cas ─────────────────────────────────────────────────────── */

const ligne = (quantity: number, unitPriceCents: number, vatRate: number, label = 'Prestation') => ({ id: `l-${label}-${unitPriceCents}`, label, quantity, unitPriceCents, vatRate });
/** T1 — 2 × 450,00 € à 20 %, 1 × 120,00 € à 20 %, 3 × 12,50 € à 5,5 %. */
const LIGNES_T1 = [ligne(2, 45_000, 20, 'Site'), ligne(1, 12_000, 20, 'Hébergement'), ligne(3, 1_250, 5.5, 'Livres')];
const facture = (o: Record<string, unknown>) => ({
  id: 'fa-x',
  number: 'F-2026-0001',
  clientId: 1,
  billTo: { name: 'Client Exemple', company: 'Atelier Exemple', email: 'contact@client.exemple.test', address: '1 rue Exemple, 69000 Lyon', vatNumber: '' },
  issuedAt: '2026-10-05',
  dueAt: '2026-10-20',
  lines: LIGNES_T1,
  status: 'issued',
  paidAt: '',
  paymentMethod: '',
  cancelReason: '',
  notes: '',
  quoteId: null,
  kind: 'invoice',
  createdAt: '2026-10-05T09:00:00.000Z',
  updatedAt: '2026-10-05T09:00:00.000Z',
  ...o,
});
const AUJ = '2026-10-30'; // vendredi 30 octobre 2026, le jour des maquettes
const ETATS_DEVIS = ['brouillon', 'envoye', 'vu', 'signe', 'refuse', 'expire', 'annule', 'facture'];

console.log('L’argent — facturation\n');

/* La TVA s'arrondit LIGNE PAR LIGNE, comme `src/lib/money.ts` (décision du CO, STATUT §1.29 n° 1, 14 nov.,
 * provisoire, révisable par Harun). T2 et T5 ont changé d'attendu ce jour-là (0,20 → 0,21 € ; − 0,20 → − 0,21 €). */

await dit('T1 : TVA ligne par ligne — HT 1 057,50 €, TVA 206,06 €, TTC 1 263,56 €', () => {
  // 900,00 → 180,00 ; 120,00 → 24,00 ; 37,50 → 2,0625 → 2,06. Total TVA 206,06 €.
  const t = F.totauxDocument(LIGNES_T1);
  assert.equal(t.htCents, 105_750);
  assert.equal(t.tvaCents, 20_606);
  assert.equal(t.ttcCents, 126_356);
  assert.deepEqual(t.parTaux, [
    { taux: 5.5, baseCents: 3_750, tvaCents: 206 },
    { taux: 20, baseCents: 102_000, tvaCents: 20_400 },
  ]);
});

await dit('T2 : 3 × 0,33 € à 20 % — chaque ligne arrondie (0,066 → 0,07), soit 0,21 € de TVA et 1,20 € TTC, comme money.ts', () => {
  const lignes = [ligne(1, 33, 20, 'a'), ligne(1, 33, 20, 'b'), ligne(1, 33, 20, 'c')];
  const t = F.totauxDocument(lignes);
  assert.equal(t.tvaCents, 21);
  assert.equal(t.ttcCents, 120);
  const ref = M.documentTotals(lignes);
  assert.deepEqual([t.htCents, t.tvaCents, t.ttcCents], [ref.netCents, ref.vatCents, ref.grossCents]);
});

await dit('T3 : quantité décimale — 2,5 × 33,33 € = 83,325 € → 83,33 € HT, TVA 16,67 €, TTC 100,00 €', () => {
  const t = F.totauxDocument([ligne(2.5, 3_333, 20)]);
  assert.equal(t.htCents, 8_333);
  assert.equal(t.tvaCents, 1_667);
  assert.equal(t.ttcCents, 10_000);
});

await dit('T4 : remise de 10 % sur T1 — HT 951,75 €, TVA 185,46 €, TTC 1 137,21 €, remise 105,75 €', () => {
  // 810,00 → 162,00 ; 108,00 → 21,60 ; 33,75 → 1,85625 → 1,86. Total TVA 185,46 €.
  const t = F.totauxDocument(LIGNES_T1, 10);
  assert.equal(t.htCents, 95_175);
  assert.equal(t.tvaCents, 18_546);
  assert.equal(t.ttcCents, 113_721);
  assert.equal(t.remiseCents, 10_575);
});

await dit('T5 : un avoir est négatif et s’arrondit loin de zéro (3 × − 0,066 → − 0,07, soit − 0,21 €) ; taux 0 % → TVA nulle', () => {
  const a = F.totauxDocument([ligne(1, -33, 20, 'a'), ligne(1, -33, 20, 'b'), ligne(1, -33, 20, 'c')]);
  assert.equal(a.tvaCents, -21);
  assert.equal(a.ttcCents, -120);
  assert.equal(F.totauxDocument([ligne(2, 2_500, 0)]).tvaCents, 0);
  assert.equal(F.totauxDocument([]).ttcCents, 0);
});

await dit('reste dû : TTC − avoirs émis − paiements réussis, jamais négatif ; échoués, en attente et remboursés ne comptent pas', () => {
  const f = facture({});
  assert.equal(F.resteDu(f, { factures: [f], paiements: [] }), 126_356);
  const paiements = [
    { factureId: 'fa-x', montantCents: 26_356, etat: 'réussi' },
    { factureId: 'fa-x', montantCents: 50_000, etat: 'échoué' },
    { factureId: 'fa-x', montantCents: 50_000, etat: 'en attente' },
    { factureId: 'fa-x', montantCents: 50_000, etat: 'remboursé' },
    { factureId: 'autre', montantCents: 99_999, etat: 'réussi' },
  ];
  assert.equal(F.resteDu(f, { factures: [f], paiements }), 100_000);
  // Un avoir émis de 120,00 € TTC (100,00 € HT à 20 %) ; brouillon et annulé ne comptent pas.
  const av = facture({ id: 'av-1', number: 'AV-2026-0001', kind: 'creditNote', creditNoteFor: 'fa-x', lines: [ligne(1, 10_000, 20)] });
  const avBrouillon = facture({ id: 'av-2', number: '', kind: 'creditNote', creditNoteFor: 'fa-x', status: 'draft', lines: [ligne(1, 10_000, 20)] });
  assert.equal(F.resteDu(f, { factures: [f, av, avBrouillon], paiements: [{ factureId: 'fa-x', montantCents: 26_356, etat: 'réussi' }] }), 88_000);
  assert.equal(F.resteDu(f, { factures: [f, av], paiements: [{ factureId: 'fa-x', montantCents: 200_000, etat: 'réussi' }] }), 0);
  assert.equal(F.resteDu(facture({ status: 'paid', paidAt: '2026-10-10' }), { factures: [], paiements: [] }), 0);
  assert.equal(F.resteDu(facture({ status: 'cancelled' }), { factures: [], paiements: [] }), 0);
  assert.equal(F.resteDu(facture({ status: 'draft', issuedAt: '', dueAt: '' }), { factures: [], paiements: [] }), 0);
  assert.equal(F.resteDu(av, { factures: [f, av], paiements: [] }), 0, 'un avoir n’est jamais dû');
});

await dit('statut d’une facture (G03) : en retard au lendemain de l’échéance (pas le jour même), vue, soldée ; un acompte ne change pas la station', () => {
  const f = facture({});
  const ctx = (paiements: unknown[] = []) => ({ factures: [f], paiements });
  assert.equal(F.statutFacture(f, AUJ, ctx()), 'en-retard');
  assert.equal(F.joursDeRetard(f, AUJ), 10);
  assert.equal(F.statutFacture(facture({ dueAt: AUJ }), AUJ, { factures: [], paiements: [] }), 'envoyee');
  // G03 n'a que six stations : un paiement partiel laisse la facture « Envoyée » (ou « Vue »), avec son reste dû.
  assert.equal(F.statutFacture(facture({ dueAt: '2026-11-15' }), AUJ, { factures: [], paiements: [{ factureId: 'fa-x', montantCents: 26_356, etat: 'réussi' }] }), 'envoyee');
  assert.equal(F.statutFacture(facture({ dueAt: '2026-11-15', vues: 2 }), AUJ, { factures: [], paiements: [] }), 'vue');
  assert.equal(F.statutFacture(facture({ vues: 2 }), AUJ, ctx()), 'en-retard', 'le retard l’emporte sur « Vue »');
  assert.deepEqual([F.graviteRetard(30), F.graviteRetard(31)], ['orange', 'rouge']);
  assert.equal(F.statutFacture(f, AUJ, ctx([{ factureId: 'fa-x', montantCents: 26_356, etat: 'réussi' }])), 'en-retard');
  assert.equal(F.statutFacture(f, AUJ, ctx([{ factureId: 'fa-x', montantCents: 126_356, etat: 'réussi' }])), 'payee');
  assert.equal(F.statutFacture(facture({ status: 'paid' }), AUJ, ctx()), 'payee');
  assert.equal(F.statutFacture(facture({ status: 'draft' }), AUJ, ctx()), 'brouillon');
  assert.equal(F.statutFacture(facture({ status: 'cancelled' }), AUJ, ctx()), 'annulee');
  assert.equal(F.joursDeRetard(facture({ dueAt: '2026-11-15' }), AUJ), 0);
});

await dit('échéance : 30 jours par défaut ; au-delà de 60 jours après l’émission, le délai n’est pas conforme', () => {
  assert.equal(F.echeanceParDefaut('2026-10-30'), '2026-11-29');
  assert.equal(F.echeanceParDefaut('2026-01-31', 30), '2026-03-02');
  assert.equal(F.delaiConforme('2026-10-30', '2026-12-29'), true); // 60 jours pile
  assert.equal(F.delaiConforme('2026-10-30', '2026-12-30'), false); // 61 jours
  assert.equal(F.delaiConforme('2026-10-30', '2026-10-29'), false); // avant l’émission
});

await dit('numérotation : le format existant AAAA-NNNN et AV-AAAA-NNNN (§1.29 n° 4), comme nextNumber ; les trous se voient', () => {
  const n = ['2026-0001', '2026-0002', '2026-0004', '2025-0012', 'AV-2026-0001', 'D-2026-0009', ''];
  assert.equal(F.prochainNumero(n, 2026), '2026-0005');
  assert.equal(F.prochainNumero(n, 2027), '2027-0001');
  assert.equal(F.prochainNumero(n, 2026, 'AV'), 'AV-2026-0002');
  assert.deepEqual(F.trousDeNumerotation(n, 2026), ['2026-0003']);
  assert.deepEqual(F.trousDeNumerotation(['2026-0001', '2026-0002'], 2026), []);
  const factures = n.map((number) => ({ number }));
  assert.equal(F.prochainNumero(n, 2026), M.nextNumber(factures, 2026, 'invoice'));
  assert.equal(F.prochainNumero(n, 2026, 'AV'), M.nextNumber(factures, 2026, 'creditNote'));
});

await dit('mentions : celles qui manquent sont listées ; « valable juridiquement » n’est jamais affirmé, il reste à faire valider', () => {
  const vendeur = { raisonSociale: 'Exemple SAS', siren: '000000001', adresse: '1 place Exemple, 69000 Lyon', tvaIntracom: 'FR00000000001', franchiseEnBase: false };
  const v = F.verifierMentions(facture({}), vendeur);
  assert.deepEqual(v.manquantes, []);
  assert.equal(v.complet, true);
  assert.equal(v.aFaireValider, true);
  assert.equal('valableJuridiquement' in v, false);
  const v2 = F.verifierMentions(facture({ dueAt: '', lines: [ligne(1, 1_000, 20, '')] }), { ...vendeur, siren: '' });
  assert.deepEqual(v2.manquantes, ['vendeur.siren', 'echeance', 'ligne.designation']);
  assert.equal(v2.complet, false);
  // En franchise en base, la mention de l’article 293 B est attendue (et la TVA doit être nulle).
  const v3 = F.verifierMentions(facture({}), { ...vendeur, franchiseEnBase: true });
  assert.deepEqual(v3.manquantes, ['tva.franchise']);
});

console.log('\nL’argent — impayés\n');

await dit('MA04 est informatif : aucun calcul de pénalités ni d’indemnité dans la zone (fiche v4) ; seul le taux reste un réglage', () => {
  for (const nom of Object.keys(IM)) assert.doesNotMatch(nom, /penalitesDe|indemnite/i, `impayes.${nom}`);
  assert.match(I.traduire('fr', 'impayes.aucunePenalite'), /pénalit/i);
});

await dit('taux des pénalités par défaut : le minimum légal, trois fois le taux d’intérêt légal (3 × 3,71 % = 11,13 %), présenté comme tel', () => {
  // 3,71 % est un taux d’exemple passé en paramètre : le vrai taux du semestre est une donnée du réglage.
  assert.deepEqual(IM.tauxPenalitesParDefaut(3.71), { source: 'minimum-legal', tauxAnnuelPct: 11.13 });
  assert.match(I.traduire('fr', 'penalites.minimumLegal'), /minimum légal/i);
});

await dit('tranches de retard : 0–30, 31–60, 61–90, plus de 90 jours ; bornes comprises dans la tranche basse', () => {
  const mk = (id: string, dueAt: string, ht: number) => facture({ id, dueAt, lines: [ligne(1, ht, 0)] });
  // retards au 30/10 : 10 j, 31 j, 75 j, 120 j ; une non échue et une payée sont exclues.
  const fs = [mk('a', '2026-10-20', 10_000), mk('b', '2026-09-29', 25_000), mk('c', '2026-08-16', 8_000), mk('d', '2026-07-02', 4_050), mk('e', '2026-11-10', 99_000), facture({ id: 'f', status: 'paid', dueAt: '2026-01-01' })];
  const t = IM.tranchesDeRetard(fs, AUJ, { paiements: [] });
  assert.deepEqual(t.map((x: any) => [x.tranche, x.nombre, x.montantCents]), [['0-30', 1, 10_000], ['31-60', 1, 25_000], ['61-90', 1, 8_000], ['90+', 1, 4_050]]);
  assert.equal(IM.totalImpaye(fs, AUJ, { paiements: [] }), 47_050);
  assert.deepEqual([30, 31, 60, 61, 90, 91].map(IM.trancheDe), ['0-30', '31-60', '31-60', '61-90', '61-90', '90+']);
});

await dit('délai moyen de paiement : (10 + 20 + 45) / 3 = 25 jours ; rien de payé → aucun délai', () => {
  const p = (id: string, issuedAt: string, paidAt: string) => facture({ id, status: 'paid', issuedAt, paidAt });
  assert.equal(IM.delaiMoyenDePaiement([p('a', '2026-09-01', '2026-09-11'), p('b', '2026-09-01', '2026-09-21'), p('c', '2026-08-01', '2026-09-15'), facture({ id: 'd' })]), 25);
  assert.equal(IM.delaiMoyenDePaiement([facture({})]), null);
});

await dit('échelle de relance (MA04) : 7, 21, 45 jours lus dans src/lib/relances.ts (un seul moteur, §1.28 n° 2) ; chaque étape après son seuil ; mise en demeure avec l’accord d’un administrateur', () => {
  assert.deepEqual(IM.POLITIQUE_PAR_DEFAUT, { relance1: 7, relance2: 21, miseEnDemeure: 45 });
  const seuil = (p: string) => M.ECHELLE.find((e: any) => e.palier === p).auDela;
  assert.deepEqual(IM.POLITIQUE_PAR_DEFAUT, { relance1: seuil('ferme'), relance2: seuil('mise-en-demeure'), miseEnDemeure: seuil('dernier-avis') });
  // Comme paliereDe (strictement au-delà) : relance 1 au 8e jour, relance 2 au 22e, mise en demeure au 46e.
  assert.equal(IM.etapeSuivante(7, 0), null);
  assert.deepEqual(IM.etapeSuivante(8, 0), { etape: 'relance-1', accordRequis: false });
  assert.equal(M.paliereDe(8), 'ferme');
  assert.equal(IM.etapeSuivante(21, 1), null);
  assert.deepEqual(IM.etapeSuivante(22, 1), { etape: 'relance-2', accordRequis: false });
  assert.equal(IM.etapeSuivante(45, 2), null);
  assert.deepEqual(IM.etapeSuivante(46, 2), { etape: 'mise-en-demeure', accordRequis: true });
  assert.equal(IM.etapeSuivante(60, 1)?.etape, 'relance-2', 'une étape ne se saute jamais');
  assert.deepEqual([0, 1, 2, 5].map((n) => IM.etapeFaite(n)), ['a-relancer', 'relance-1', 'relance-2', 'relance-2']);
  assert.equal(IM.etapeFaite(2, true), 'mise-en-demeure');
  // Carte : « Appeler » à partir de la relance 2 ou au-delà de 30 jours.
  assert.deepEqual([IM.actionDeCarte(30, 1), IM.actionDeCarte(31, 0), IM.actionDeCarte(10, 2)], ['relancer', 'appeler', 'appeler']);
  assert.deepEqual(IM.etatDeRelance({ objetId: 'a', etat: 'prête', nbEnvoyees: 1 }), { cle: 'relance.prete', n: 1 });
  assert.deepEqual(IM.etatDeRelance({ objetId: 'a', etat: 'envoyée', nbEnvoyees: 2 }), { cle: 'relance.envoyee', n: 2 });
  assert.deepEqual(IM.etatDeRelance(undefined), { cle: 'relance.aucune', n: 0 });
});

await dit('colonnes de retard : toujours quatre, même vides ; retard décroissant, puis « relance prête » d’abord à retard égal', () => {
  const mk = (id: string, dueAt: string, ht: number) => facture({ id, dueAt, lines: [ligne(1, ht, 0)] });
  const fs = [mk('a', '2026-10-20', 10_000), mk('b', '2026-10-10', 5_000), mk('c', '2026-10-20', 7_000)];
  const col = IM.colonnesDeRetard(fs, AUJ, { paiements: [], relances: [{ objetId: 'c', etat: 'prête', nbEnvoyees: 1 }] });
  assert.deepEqual(col.map((x: any) => [x.tranche, x.nombre, x.montantCents]), [['0-30', 3, 22_000], ['31-60', 0, 0], ['61-90', 0, 0], ['90+', 0, 0]]);
  assert.deepEqual(col[0].cartes.map((x: any) => [x.facture.id, x.joursRetard, x.relancePrete]), [['b', 20, false], ['c', 10, true], ['a', 10, false]]);
});

await dit('objectif zéro impayé (MA04) : 6 120 € récupérés, 2 840 € en retard → 68 % ; plan en deux échéances de 640 € → 320 € le 05/11 et 320 € le 20/11', () => {
  // 612 000 ÷ 896 000 = 68,3 % → 68.
  assert.deepEqual(IM.objectifZeroImpaye(612_000, 284_000), { totalCents: 896_000, pourcentage: 68 });
  assert.equal(IM.objectifZeroImpaye(0, 0).pourcentage, 100);
  // Plus de 30 jours et au moins 2 relances ; au 14/10, les 5 et 20 du mois suivant ; le centime impair va à la seconde.
  assert.deepEqual(IM.planEnDeuxEcheances({ joursRetard: 31, nbEnvoyees: 2, resteCents: 64_000 }, '2026-10-14'), { echeances: [{ date: '2026-11-05', montantCents: 32_000 }, { date: '2026-11-20', montantCents: 32_000 }] });
  assert.deepEqual(IM.planEnDeuxEcheances({ joursRetard: 31, nbEnvoyees: 2, resteCents: 1_001 }, '2026-12-14')?.echeances.map((e: any) => [e.date, e.montantCents]), [['2027-01-05', 500], ['2027-01-20', 501]]);
  assert.equal(IM.planEnDeuxEcheances({ joursRetard: 30, nbEnvoyees: 2, resteCents: 64_000 }, '2026-10-14'), null);
  assert.equal(IM.planEnDeuxEcheances({ joursRetard: 40, nbEnvoyees: 1, resteCents: 64_000 }, '2026-10-14'), null);
  // Délais comparés : 25 j contre 31 j → 6 de mieux.
  assert.deepEqual(IM.comparerDelais(25, 31), { sens: 'mieux', jours: 6 });
  assert.deepEqual(IM.comparerDelais(31, 25), { sens: 'plus', jours: 6 });
  assert.equal(IM.comparerDelais(null, 25), null);
});

await dit('relance préparée : vouvoiement, montant et échéance au format français, jamais envoyée', () => {
  // Échue le 20/10, 10 jours au 30/10, aucune relance envoyée → relance 1.
  const r = IM.preparerRelance(facture({}), AUJ, { paiements: [] }, 'fr');
  assert.equal(r.etape, 'relance-1');
  assert.equal(r.joursRetard, 10);
  assert.equal(IM.preparerRelance(facture({ dueAt: '2026-10-25' }), AUJ, { paiements: [] }, 'fr'), null, 'avant J+7, rien n’est préparé');
  // Mise en demeure : jamais sans l’accord d’un administrateur.
  const vieille = facture({ dueAt: '2026-09-01' });
  assert.deepEqual(IM.preparerRelance(vieille, AUJ, { paiements: [], nbEnvoyees: 2 }, 'fr'), { accordRequis: true });
  // Aucun modèle de mise en demeure par défaut (MA04 : à valider par un juriste) : il vient du réglage.
  assert.deepEqual(IM.preparerRelance(vieille, AUJ, { paiements: [], nbEnvoyees: 2, accordAdministrateur: true }, 'fr'), { modeleRequis: true });
  assert.equal('client.relance.mise-en-demeure' in I.dictionnaires.fr, false);
  const modele = 'Modèle validé : facture {numero}, {montant}, échue le {echeance}, {jours} jours, {inconnu}.';
  const md = IM.preparerRelance(vieille, AUJ, { paiements: [], nbEnvoyees: 2, accordAdministrateur: true, modeleMiseEnDemeure: modele }, 'fr');
  assert.equal(md.etape, 'mise-en-demeure');
  assert.equal(md.envoyee, false);
  assert.equal(md.texte, 'Modèle validé : facture F-2026-0001, 1\u202f263,56\u00a0€, échue le 01/09/2026, 59 jours, {inconnu}.');
  assert.equal(r.envoyee, false);
  assert.match(r.texte, /vous|votre/i);
  assert.doesNotMatch(r.texte, /\btu\b|\bton\b|\bta\b|\btes\b|\btoi\b/i);
  assert.match(r.texte, /F-2026-0001/);
  assert.match(r.texte, /1\u202f263,56\u00a0€/);
  assert.match(r.texte, /20\/10\/2026/);
});

console.log('\nL’argent — TVA et impôts\n');

/* Le mois d’octobre 2026, écrit à la main :
 *   facture A émise le 05/10 : T1 (TVA 206,06 €, TTC 1 263,56 €) ;
 *   avoir émis le 20/10 : 100,00 € HT à 20 % (TVA 20,00 €) ;
 *   facture S émise le 28/09 : 250,00 € HT à 20 % (TVA 50,00 €, TTC 300,00 €), payée le 02/10 ;
 *   un brouillon et une facture annulée d’octobre (exclus) ;
 *   dépenses d’octobre : 120,00 € TTC (TVA 20,00 €) et 55,00 € TTC (TVA 5,00 €) ; une dépense de septembre (exclue) ;
 *   encaissements d’octobre : 631,78 € sur A (la moitié de son TTC), 300,00 € sur S. */
const A = facture({ id: 'A' });
const AV = facture({ id: 'AV', number: 'AV-2026-0001', kind: 'creditNote', creditNoteFor: 'A', issuedAt: '2026-10-20', dueAt: '', lines: [ligne(1, 10_000, 20)] });
const S = facture({ id: 'S', number: 'F-2026-0000', issuedAt: '2026-09-28', dueAt: '2026-10-28', status: 'paid', paidAt: '2026-10-02', lines: [ligne(1, 25_000, 20)] });
const BROUILLON = facture({ id: 'B', number: '', status: 'draft', issuedAt: '', dueAt: '', lines: [ligne(1, 99_000, 20)] });
const ANNULEE = facture({ id: 'X', status: 'cancelled', issuedAt: '2026-10-12', lines: [ligne(1, 99_000, 20)] });
const DEPENSES_OCT = [
  { id: 'd1', amountCents: 12_000, tvaCents: 2_000, spentAt: '2026-10-03', category: 'materiel', justificatif: { statut: 'justifié', fichier: 'j1.pdf' }, noteDeFrais: false, remboursee: false, auteurEmail: 'a@exemple.test' },
  { id: 'd2', amountCents: 5_500, tvaCents: 500, spentAt: '2026-10-18', category: 'deplacement', justificatif: { statut: 'à justifier', fichier: null }, noteDeFrais: false, remboursee: false, auteurEmail: 'a@exemple.test' },
  { id: 'd3', amountCents: 9_000, tvaCents: 1_500, spentAt: '2026-09-30', category: 'materiel', justificatif: { statut: 'justifié', fichier: 'j3.pdf' }, noteDeFrais: false, remboursee: false, auteurEmail: 'a@exemple.test' },
];
const ENCAISSEMENTS_OCT = [
  { factureId: 'A', montantCents: 63_178, etat: 'réussi', date: '2026-10-15T10:00:00.000Z' },
  { factureId: 'S', montantCents: 30_000, etat: 'réussi', date: '2026-10-02T09:00:00.000Z' },
  { factureId: 'A', montantCents: 10_000, etat: 'échoué', date: '2026-10-14T10:00:00.000Z' },
];

await dit('TVA depuis un TTC : 120,00 € à 20 % → 20,00 € ; 55,00 € à 10 % → 5,00 € ; 10,55 € à 5,5 % → 0,55 €', () => {
  assert.equal(TV.tvaDepuisTTC(12_000, 20), 2_000);
  assert.equal(TV.tvaDepuisTTC(5_500, 10), 500);
  assert.equal(TV.tvaDepuisTTC(1_055, 5.5), 55);
  assert.equal(TV.tvaDepuisTTC(1_000, 0), 0);
});

await dit('TVA d’octobre, régime des débits : collectée 206,06 − 20,00 = 186,06 € ; déductible 25,00 € ; à payer 161,06 €', () => {
  const r = TV.tvaDuMois({ mois: '2026-10', regime: 'debits', factures: [A, AV, S, BROUILLON, ANNULEE], paiements: ENCAISSEMENTS_OCT, depenses: DEPENSES_OCT });
  assert.equal(r.collecteeCents, 18_606);
  assert.equal(r.deductibleCents, 2_500);
  assert.equal(r.soldeCents, 16_106);
  assert.equal(r.aPayerCents, 16_106);
  assert.equal(r.creditCents, 0);
  assert.equal(r.aValiderParUnComptable, true);
});

await dit('TVA d’octobre, régime des encaissements : 103,03 € (moitié de A) + 50,00 € (S) = 153,03 € ; à payer 128,03 €', () => {
  // 63 178 × 20 606 / 126 356 = 10 303 exactement ; 30 000 × 5 000 / 30 000 = 5 000. L’échec ne compte pas.
  const r = TV.tvaDuMois({ mois: '2026-10', regime: 'encaissements', factures: [A, AV, S, BROUILLON, ANNULEE], paiements: ENCAISSEMENTS_OCT, depenses: DEPENSES_OCT });
  assert.equal(r.collecteeCents, 15_303);
  assert.equal(r.soldeCents, 12_803);
});

await dit('crédit de TVA : 10,00 € collectés, 30,00 € déductibles → rien à payer, crédit de 20,00 €', () => {
  const r = TV.tvaDuMois({ mois: '2026-10', regime: 'debits', factures: [facture({ id: 'p', lines: [ligne(1, 5_000, 20)] })], paiements: [], depenses: [{ ...DEPENSES_OCT[0], tvaCents: 3_000 }] });
  assert.equal(r.soldeCents, -2_000);
  assert.equal(r.aPayerCents, 0);
  assert.equal(r.creditCents, 2_000);
});

await dit('régime de TVA par défaut (§1.29 n° 2) : encaissements pour les services, débits pour les biens', () => {
  assert.equal(TV.regimeParDefaut('services'), 'encaissements');
  assert.equal(TV.regimeParDefaut('biens'), 'debits');
});

await dit('échéance de la TVA d’un mois : le 20 du mois suivant par défaut (proposition, à valider) ; décembre → janvier', () => {
  assert.equal(TV.echeanceTva('2026-10'), '2026-11-20');
  assert.equal(TV.echeanceTva('2026-12'), '2027-01-20');
  assert.equal(TV.echeanceTva('2026-10', 15), '2026-11-15');
});

await dit('échéances fiscales : en retard si dépassée et à payer ; total à payer sous 30 jours = 161,06 + 989,00 = 1 150,06 €', () => {
  const e = [
    { id: 'e1', intitule: 'TVA de septembre', famille: 'TVA', echeanceLe: '2026-10-20', montantCents: 16_106, paiement: 'À payer' },
    { id: 'e2', intitule: 'Cotisations sociales', famille: 'Cotisations', echeanceLe: '2026-11-05', montantCents: 98_900, paiement: 'À payer' },
    { id: 'e3', intitule: 'Acompte d’impôt', famille: 'Impôt sur les sociétés', echeanceLe: '2026-11-15', montantCents: 120_000, paiement: 'Payée' },
    { id: 'e4', intitule: 'Acompte d’impôt', famille: 'Impôt sur les sociétés', echeanceLe: '2026-12-15', montantCents: 120_000, paiement: 'À payer' },
    { id: 'e5', intitule: 'Dépôt des comptes', famille: 'Bilan', echeanceLe: '2026-11-10', montantCents: null, paiement: 'À payer' },
  ];
  const r = TV.echeancesAVenir(e, AUJ, 30);
  assert.deepEqual(r.lignes.map((x: any) => [x.id, x.etat]), [['e1', 'en-retard'], ['e2', 'a-payer'], ['e5', 'a-payer']]);
  assert.equal(r.totalCents, 115_006);
  assert.equal(r.montantInconnu, 1);
});

console.log('\nL’argent — dépenses, budget, abonnements, tarifs, paie\n');

await dit('dépenses : à justifier 1 ligne pour 55,00 € ; par catégorie en octobre ; notes de frais à rembourser par personne', () => {
  assert.deepEqual(DP.aJustifier(DEPENSES_OCT), { nombre: 1, montantCents: 5_500 });
  assert.deepEqual(DP.totalParCategorie(DEPENSES_OCT, '2026-10'), [{ categorie: 'materiel', montantCents: 12_000, tvaCents: 2_000 }, { categorie: 'deplacement', montantCents: 5_500, tvaCents: 500 }]);
  const notes = [
    { ...DEPENSES_OCT[0], id: 'n1', amountCents: 3_000, noteDeFrais: true, remboursee: false, auteurEmail: 'a@exemple.test' },
    { ...DEPENSES_OCT[0], id: 'n2', amountCents: 2_000, noteDeFrais: true, remboursee: false, auteurEmail: 'a@exemple.test' },
    { ...DEPENSES_OCT[0], id: 'n3', amountCents: 1_000, noteDeFrais: true, remboursee: true, auteurEmail: 'a@exemple.test' },
    { ...DEPENSES_OCT[0], id: 'n4', amountCents: 750, noteDeFrais: true, remboursee: false, auteurEmail: 'b@exemple.test' },
  ];
  assert.deepEqual(DP.notesARembourser(notes), [{ email: 'a@exemple.test', montantCents: 5_000, nombre: 2 }, { email: 'b@exemple.test', montantCents: 750, nombre: 1 }]);
  assert.equal(DP.htDepuisTTC(12_000, 20), 10_000);
});

/* MA06, le mois d’octobre de la maquette : six enveloppes, 6 600 € prévus, 5 331 € dépensés.
 *   Matériel 1 776 / 2 400 → 74 % ; Marketing 1 180 / 1 000 → 118 %, dépassé de 180 € ; Logiciels 819 / 900 → 91 %, presque plein ;
 *   Formation 416 / 800 → 52 % ; Déplacements 240 / 600 → 40 % ; Assurances 900 / 900, paiement unique → payé.
 *   Bandeau : 5 331 / 6 600 → 80,8 % → 81 %, reste 1 269 € ; 497 € prévus demain → il te restera environ 772 €. */
const ENVELOPPES = [
  ['materiel', 240_000, 177_600],
  ['marketing', 100_000, 118_000],
  ['logiciels', 90_000, 81_900],
  ['formation', 80_000, 41_600],
  ['deplacements', 60_000, 24_000],
  ['assurances', 90_000, 90_000],
] as const;

await dit('budget (MA06) : 74 %, 118 % dépassé de 180 €, 91 % presque plein, assurances payées ; bandeau 81 %, reste 1 269 €, environ 772 € après demain', () => {
  const env = (id: string, prevuCents: number) => ({ id, nom: id, prevuCents, categories: [id], mois: '2026-10', paiementUnique: id === 'assurances' });
  const dep = (category: string, montant: number) => ({ amountCents: montant, spentAt: '2026-10-12', category });
  const etats = ENVELOPPES.map(([id, prevu, depense]) => BU.etatEnveloppe(env(id, prevu), [dep(id, depense), { ...dep(id, 9_999), spentAt: '2026-09-30' }]));
  assert.deepEqual(etats.map((e: any) => [e.pourcentage, e.etat]), [[74, 'dans-le-budget'], [118, 'depasse'], [91, 'presque-plein'], [52, 'dans-le-budget'], [40, 'dans-le-budget'], [100, 'paye']]);
  assert.equal(etats[1].debordementCents, 18_000);
  assert.equal(etats[1].resteCents, -18_000);
  assert.equal(etats[0].resteCents, 62_400);
  // Sans « paiement unique », une enveloppe consommée pile est presque pleine, pas payée.
  assert.equal(BU.etatEnveloppe({ ...env('assurances', 90_000), paiementUnique: false }, [dep('assurances', 90_000)]).etat, 'presque-plein');
  // Seuil « presque plein » réglable (90 % par défaut).
  assert.equal(BU.SEUIL_PRESQUE_PLEIN_PCT, 90);
  assert.equal(BU.etatEnveloppe(env('materiel', 240_000), [dep('materiel', 177_600)], 70).etat, 'presque-plein');
  const b = BU.bandeauBudget(ENVELOPPES.map(([, prevuCents]) => ({ prevuCents })), ENVELOPPES.map(([, , d]) => d), 49_700);
  assert.deepEqual(b, { budgetCents: 660_000, depenseCents: 533_100, pourcentage: 81, resteCents: 126_900, resteApresPrevuCents: 77_200 });
});

await dit('budget : jamais « 100 % » sous le prévu (99), au moins 101 % au-dessus ; avancée du mois 30/31 ; barre H08 neutre, orange dès 85 %, rouge au-delà de 100 %', () => {
  assert.deepEqual([BU.pourcentageAffiche(99_950, 100_000), BU.pourcentageAffiche(100_000, 100_000), BU.pourcentageAffiche(100_050, 100_000), BU.pourcentageAffiche(0, 0), BU.pourcentageAffiche(1, 0)], [99, 100, 101, 0, 101]);
  assert.equal(BU.avanceeDuMois('2026-10', '2026-10-30'), 30 / 31);
  assert.equal(BU.avanceeDuMois('2026-10', '2026-11-02'), 1);
  assert.deepEqual([84, 85, 100, 101].map(BU.couleurBudgetGlobal), ['neutre', 'orange', 'orange', 'rouge']);
  assert.equal(BU.moisSousLeBudget([{ depenseCents: 100, budgetCents: 100 }, { depenseCents: 101, budgetCents: 100 }, { depenseCents: 0, budgetCents: 100 }]), 2);
  // Rééquilibrage : l’enveloppe la moins consommée au regard du mois donne (Déplacements, 40 %) ; dépassées et pleines exclues.
  const avecDepense = ENVELOPPES.map(([id, prevuCents, depenseCents]) => ({ id, prevuCents, depenseCents }));
  assert.equal(BU.enveloppeDonneuse(avecDepense, 30 / 31)?.id, 'deplacements');
  assert.equal(BU.enveloppeDonneuse([{ id: 'x', prevuCents: 100, depenseCents: 120 }], 0.5), null);
});

await dit('abonnements (MA09) : revenu mensuel 163,00 € (actifs et paiements échoués), annuel 1 956,00 €, 3 abonnés, 1 résiliation en octobre ; prélèvements 23 sur 24 → 96 %', () => {
  const ab = (id: string, etat: string, montant: number, jourPrelevement = 15, resilieLe: string | null = null) => ({ id, clientNom: id, montantMensuelCents: montant, jourPrelevement, etat, resilieLe });
  const liste = [ab('A', 'Actif', 8_900), ab('B', 'Résilié', 3_000, 15, '2026-10-12'), ab('C', 'Actif', 4_900, 3), ab('D', 'Résilié', 3_000, 15, '2026-09-20'), ab('E', 'En pause', 12_000), ab('F', 'Paiement échoué', 2_500, 15)];
  assert.equal(AB.revenuMensuelRecurrent(liste), 16_300);
  assert.equal(AB.revenuAnnuelRecurrent(liste), 195_600);
  assert.equal(AB.abonnes(liste), 3);
  assert.equal(AB.resiliationsDuMois(liste, '2026-10'), 1);
  assert.deepEqual(AB.tauxDePrelevement(23, 24), { reussis: 23, tentes: 24, pourcentage: 96 });
  assert.equal(AB.tauxDePrelevement(0, 0).pourcentage, null);
  // Objectif : 3 120 € sur 4 000 € → 78 %, il reste 880 €.
  assert.deepEqual(AB.versObjectif(312_000, 400_000), { pourcentage: 78, resteCents: 88_000 });
  // Les 15 prochains jours au 01/11 : C le 03/11 (49 €) ; A et F (à réessayer) le 15/11 (89 + 25 = 114 €).
  assert.deepEqual(AB.prochainsPrelevements(liste, '2026-11-01').map((x: any) => [x.date, x.montantCents, x.abonnements.length]), [['2026-11-03', 4_900, 1], ['2026-11-15', 11_400, 2]]);
  // Hors « à réessayer », seuls les actifs.
  assert.deepEqual(AB.prelevementsAVenir(liste, '2026-11-01', '2026-11-16').map((x: any) => x.abonnement.id), ['C', 'A']);
});

await dit('prochain prélèvement : strictement après aujourd’hui, ramené au dernier jour d’un mois court', () => {
  assert.equal(AB.prochainPrelevement('2026-10-30', 15), '2026-11-15');
  assert.equal(AB.prochainPrelevement('2026-10-30', 30), '2026-11-30');
  assert.equal(AB.prochainPrelevement('2026-10-30', 31), '2026-10-31');
  assert.equal(AB.prochainPrelevement('2026-11-15', 31), '2026-11-30');
  assert.equal(AB.prochainPrelevement('2027-01-31', 30), '2027-02-28');
  assert.equal(AB.prochainPrelevement('2026-12-20', 5), '2027-01-05');
});

await dit('tarifs (MA12) : 2 400 € pour 900 € de coût → 62,5 → 63 % ; 72 € pour 35 € → 51 % ; objectif 55 % ; remise au-delà de 5 % → accord requis', () => {
  assert.equal(TA.margePct(240_000, 90_000), 63);
  assert.equal(TA.margePct(7_200, 3_500), 51);
  assert.equal(TA.margePct(120_000, null), null);
  assert.equal(TA.margePct(0, 0), null);
  assert.equal(TA.OBJECTIF_MARGE_PCT, 55);
  assert.deepEqual([TA.couleurMarge(63), TA.couleurMarge(55), TA.couleurMarge(51), TA.couleurMarge(35), TA.couleurMarge(34), TA.couleurMarge(-2), TA.couleurMarge(null)], ['verte', 'verte', 'orange', 'orange', 'rouge', 'rouge', null]);
  assert.equal(TA.margeParVente(7_200, 3_500), 3_700);
  assert.deepEqual(TA.appliquerRemise(120_000, { type: 'pct', valeur: 15 }, 45_600), { prixCents: 102_000, remiseCents: 18_000, sousLeCout: false, accordRequis: true });
  assert.deepEqual(TA.appliquerRemise(120_000, { type: 'pct', valeur: 5 }, 45_600), { prixCents: 114_000, remiseCents: 6_000, sousLeCout: false, accordRequis: false });
  assert.deepEqual(TA.appliquerRemise(120_000, { type: 'montant', cents: 25_000 }, 45_600), { prixCents: 95_000, remiseCents: 25_000, sousLeCout: false, accordRequis: true });
  assert.deepEqual(TA.appliquerRemise(120_000, { type: 'pct', valeur: 70 }, 45_600), { prixCents: 36_000, remiseCents: 84_000, sousLeCout: true, accordRequis: true });
  assert.deepEqual(TA.appliquerRemise(10_000, { type: 'montant', cents: 25_000 }, null), { prixCents: 0, remiseCents: 10_000, sousLeCout: false, accordRequis: true });
});

await dit('tarifs : 41 € de plus sur 7 ventes → 287 € sur un mois ; suggestion +10 % à l’euro supérieur (65 € → 72 €) ; marge pondérée (180 + 200) / 800 = 47,5 → 48 %', () => {
  assert.equal(TA.effetSurUnMois(6_500, 10_600, 7), 28_700);
  assert.equal(TA.prixSuggere(6_500), 7_200);
  assert.equal(TA.prixSuggere(10_000), 11_000);
  // A : 100 € (coût 40 €) vendu 3 fois ; B : 500 € (coût 300 €) vendu 1 fois ; C sans coût, D archivée : exclues.
  const p = (id: string, prixCents: number, coutCents: number | null, ventesMois: number, etat = 'active') => ({ id, nom: id, prixCents, coutCents, ventesMois, etat });
  assert.equal(TA.margeMoyennePonderee([p('A', 10_000, 4_000, 3), p('B', 50_000, 30_000, 1), p('C', 9_000, null, 5), p('D', 7_000, 1_000, 4, 'archivée')]), 48);
  assert.equal(TA.margeMoyennePonderee([]), null);
  assert.equal(TA.remisesAccordees([{ prixGrilleCents: 10_000, prixFactureCents: 9_000, quantite: 2 }, { prixGrilleCents: 5_000, prixFactureCents: 6_000, quantite: 1 }]), 2_000);
  assert.equal(TA.variationPct(10_000, 11_500), 15);
});

await dit('paie : cotisations fictives = 46 % du net — 2 150,00 € → 989,00 € ; masse d’octobre 3 384,57 € ; montants masqués par défaut', () => {
  assert.equal(PA.COTISATIONS_FICTIVES_PCT, 46);
  assert.equal(PA.cotisations(215_000), 98_900);
  assert.equal(PA.cotisations(123_457), 56_790);
  assert.equal(PA.coutTotal(215_000), 313_900);
  const b = (id: string, mois: string, net: number) => ({ id, membreEmail: `${id}@exemple.test`, mois, netCents: net });
  const m = PA.masseSalariale([b('a', '2026-10', 215_000), b('b', '2026-10', 123_457), b('c', '2026-09', 999_999)], '2026-10');
  assert.deepEqual(m, { netCents: 338_457, cotisationsCents: 155_690, coutCents: 494_147, bulletins: 2 });
  assert.equal(PA.MONTANTS_MASQUES_PAR_DEFAUT, true);
  assert.equal(PA.montantAffiche(215_000, false), '•••• €');
  assert.equal(PA.montantAffiche(215_000, true), '2 150,00 €');
});

console.log('\nL’argent — devis\n');

await dit('devis (H07) : brouillon, envoyé, vu, signé, facturé, refusé, annulé, expiré (au lendemain de la validité)', () => {
  const d = (o: Record<string, unknown>) => ({ id: 1, status: 'sent', validiteJusquau: '2026-11-15', vuAt: null, ...o });
  assert.equal(DV.etatDevis(d({ status: 'draft' }), AUJ), 'brouillon');
  assert.equal(DV.etatDevis(d({}), AUJ), 'envoye');
  assert.equal(DV.etatDevis(d({ vuAt: '2026-10-29T10:00:00Z' }), AUJ), 'vu');
  assert.equal(DV.etatDevis(d({ status: 'accepted', validiteJusquau: '2026-01-01' }), AUJ), 'signe');
  assert.equal(DV.etatDevis(d({ status: 'accepted', factureId: 'fa-1' }), AUJ), 'facture');
  assert.equal(DV.etatDevis(d({ status: 'cancelled' }), AUJ), 'annule');
  assert.equal(DV.etatDevis(d({ status: 'refused' }), AUJ), 'refuse');
  assert.equal(DV.etatDevis(d({ validiteJusquau: AUJ }), AUJ), 'envoye');
  assert.equal(DV.etatDevis(d({ validiteJusquau: '2026-10-29' }), AUJ), 'expire');
});

await dit('taux de transformation : 5 acceptés sur 10 tranchés (3 refusés, 2 expirés) = 50 % ; les en-cours ne comptent pas', () => {
  const d = (status: string, validiteJusquau = '2026-12-31') => ({ status, validiteJusquau, vuAt: null });
  const liste = [...Array(5).fill(0).map(() => d('accepted')), ...Array(3).fill(0).map(() => d('refused')), d('sent', '2026-10-01'), d('sent', '2026-10-02'), ...Array(4).fill(0).map(() => d('sent')), d('draft')];
  assert.equal(DV.tauxDeTransformation(liste, AUJ), 50);
  assert.equal(DV.tauxDeTransformation([d('sent')], AUJ), null);
});

await dit('devis prérempli (H41, H42) : « maintenance » × 3 → D-2026-13, valable jusqu’au 29/11, 267,00 € HT, 320,40 € TTC', () => {
  const prestations = [
    { id: 'p1', nom: 'Site vitrine, 5 pages', prixCents: 180_000, unite: 'forfait', etat: 'active' },
    { id: 'p2', nom: 'Maintenance mensuelle', prixCents: 8_900, unite: 'mois', etat: 'active' },
    { id: 'p3', nom: 'Maintenance ancienne', prixCents: 5_000, unite: 'mois', etat: 'archivée' },
  ];
  const trouvee = DV.chercherPrestation('mainténance', prestations);
  assert.equal(trouvee?.id, 'p2', 'sans accent ni casse, et jamais une prestation archivée');
  assert.equal(DV.chercherPrestation('rien de tel', prestations), null);
  const d = DV.devisPrerempli({ prestation: trouvee, quantite: 3, client: { id: 7, nom: 'Atelier Exemple' }, aujourdhui: AUJ, numeros: ['D-2026-12', 'D-2026-3', 'D-2025-99'] });
  // H07 numérote les devis sans zéros (« D-2026-114 »).
  assert.equal(d.numero, 'D-2026-13');
  assert.equal(d.status, 'draft');
  assert.equal(d.validiteJusquau, '2026-11-29');
  assert.equal(d.clientId, 7);
  assert.deepEqual(d.lignes.map((l: any) => [l.label, l.quantity, l.unitPriceCents, l.vatRate]), [['Maintenance mensuelle', 3, 8_900, 20]]);
  assert.deepEqual([d.totaux.htCents, d.totaux.tvaCents, d.totaux.ttcCents], [26_700, 5_340, 32_040]);
  assert.equal(d.priceEuro, 267);
});

await dit('devis → facture : mêmes lignes, lien au devis, brouillon sans numéro ; acompte de 30 % sur 320,40 € = 96,12 €', () => {
  const d = { id: 13, clientId: 7, clientNom: 'Atelier Exemple', lignes: [ligne(3, 8_900, 20, 'Maintenance mensuelle')], status: 'accepted' };
  const f = DV.devisVersFacture(d);
  assert.equal(f.quoteId, 13);
  assert.equal(f.status, 'draft');
  assert.equal(f.number, '');
  assert.deepEqual(f.lines.map((l: any) => [l.label, l.quantity, l.unitPriceCents]), [['Maintenance mensuelle', 3, 8_900]]);
  assert.notEqual(f.lines[0], d.lignes[0], 'les lignes sont copiées, pas partagées');
  assert.equal(DV.acompte(32_040, 30), 9_612);
  assert.throws(() => DV.devisVersFacture({ ...d, status: 'refused' }));
});

await dit('devis de la fiche H07 : 3 200 + 1 400 + 900 + 12 × 108 € à 20 % → HT 6 796 €, TVA 1 359,20 €, TTC 8 155,20 € ; acompte 30 % 2 446,56 € ; écart avec la v1 − 172,80 €', () => {
  const t = F.totauxDocument([ligne(1, 320_000, 20, 'Refonte'), ligne(1, 140_000, 20, 'Contenus'), ligne(1, 90_000, 20, 'Formation'), ligne(12, 10_800, 20, 'Maintenance')]);
  assert.deepEqual([t.htCents, t.tvaCents, t.ttcCents], [679_600, 135_920, 815_520]);
  assert.equal(DV.acompte(815_520, 30), 244_656);
  assert.equal(DV.acompte(815_520, 140), 815_520, 'un acompte ne dépasse jamais le total');
  assert.equal(DV.ecartDeVersion(815_520, 832_800), -17_280);
  assert.equal(DV.ecartDeVersion(815_520, 815_520), null);
  assert.equal(DV.VALIDITE_JOURS, 30);
});

console.log('\nL’argent — trésorerie prévisionnelle (H09, MA07)\n');

/* Départ : 1 000,00 € le vendredi 30/10/2026, horizon de 90 jours (H09 : 30, 90 ou 180) → du 31/10 au 28/01/2027. Flux :
 *   30/10 + 999,00 (aujourd’hui : déjà dans le solde, ignoré) ;
 *   02/11 + 500,00 ; 03/11 − 1 200,00 loyer ; 05/11 + 300,00 incertain (facture en retard) ; 20/11 − 400,00 TVA ;
 *   05/02/2027 − 50,00 (hors horizon).
 * Deux hypothèses : H1 retard des encaissements {prudent 20 j, central 0, ambitieux 0} ; H2 volume {prudent − 10 %, central 0, ambitieux + 20 %}.
 *   Central : 1 000 → 1 500 (02/11) → 300 (03/11) → 600 (05/11) → 200 (20/11). Point bas 200,00 € le 20/11, fin 200,00 €.
 *   Prudent : entrées 450 et 270, décalées au 22/11 et au 25/11 : 1 000 → − 200 (03/11, sous zéro) → − 600 (20/11, point bas)
 *             → − 150 (22/11) → 120 (25/11). Fin 120,00 €, besoin 600,00 €.
 *   Ambitieux : entrées 600 et 360 : 1 000 → 1 600 → 400 → 760 → 360. Fin 360,00 €.
 *   Ce qui pèse : H2 seule → − 80,00 € / + 160,00 € ; H1 seule → 0 / 0 (le retard reste dans l’horizon). */
const FLUX = [
  { date: '2026-10-30', montantCents: 99_900, libelle: 'déjà là', certitude: 'attendu' },
  { date: '2026-11-02', montantCents: 50_000, libelle: 'Règlement', certitude: 'attendu' },
  { date: '2026-11-03', montantCents: -120_000, libelle: 'Loyer', certitude: 'attendu', recurrent: true },
  { date: '2026-11-05', montantCents: 30_000, libelle: 'Facture en retard', certitude: 'incertain' },
  { date: '2026-11-20', montantCents: -40_000, libelle: 'TVA', certitude: 'attendu', fiscal: true },
  { date: '2027-02-05', montantCents: -5_000, libelle: 'Lointain', certitude: 'attendu' },
];
const HYPOTHESES = [
  TR.retardDesEncaissements('h1', 'Retard des encaissements', { prudent: 20, central: 0, ambitieux: 0 }),
  TR.variationDesEncaissements('h2', 'Volume des ventes', { prudent: -10, central: 0, ambitieux: 20 }),
];
const DEPART = { soldeDepartCents: 100_000, aujourdhui: AUJ, flux: FLUX };

await dit('projection centrale : 90 jours (31/10 → 28/01), point bas 200,00 € le 20/11, jamais sous zéro, fin 200,00 €', () => {
  const p = TR.projeter(DEPART);
  assert.equal(TR.HORIZON_JOURS_PAR_DEFAUT, 90);
  assert.equal(p.jours.length, 90);
  assert.equal(p.jours[0].date, '2026-10-31');
  assert.equal(p.jours.at(-1).date, '2027-01-28');
  const sur = (d: string) => p.jours.find((j: any) => j.date === d).soldeCents;
  assert.deepEqual([sur('2026-11-01'), sur('2026-11-02'), sur('2026-11-03'), sur('2026-11-05'), sur('2026-11-20')], [100_000, 150_000, 30_000, 60_000, 20_000]);
  assert.deepEqual(p.pointBas, { date: '2026-11-20', soldeCents: 20_000 });
  assert.equal(p.sousZeroLe, null);
  assert.equal(p.besoinCents, 0);
  assert.equal(p.soldeFinCents, 20_000);
  assert.equal(TR.projeter({ ...DEPART, horizonJours: 30 }).jours.length, 30);
});

await dit('trois scénarios (H09) : central 200,00 €, prudent 120,00 € (sous zéro le 03/11, point bas − 600,00 € le 20/11), ambitieux 360,00 €', () => {
  const s = TR.projeterScenarios({ ...DEPART, hypotheses: HYPOTHESES });
  assert.deepEqual(TR.SCENARIOS, ['central', 'prudent', 'ambitieux']);
  assert.equal(s.central.soldeFinCents, 20_000);
  assert.equal(s.prudent.soldeFinCents, 12_000);
  assert.equal(s.prudent.sousZeroLe, '2026-11-03');
  assert.deepEqual(s.prudent.pointBas, { date: '2026-11-20', soldeCents: -60_000 });
  assert.equal(s.prudent.besoinCents, 60_000);
  assert.equal(s.ambitieux.soldeFinCents, 36_000);
  // Les hypothèses ne modifient jamais les mouvements d’origine.
  assert.equal(FLUX[1].montantCents, 50_000);
  assert.equal(FLUX[1].date, '2026-11-02');
});

await dit('ce qui pèse le plus : le volume (− 80,00 € / + 160,00 €) avant le retard (0 / 0) ; seuils : creux de 22 jours dès le 03/11, ou « reste sous » 250,00 € depuis le 20/11', () => {
  const c = TR.ceQuiPeseLePlus({ ...DEPART, hypotheses: HYPOTHESES });
  assert.deepEqual(c.map((x: any) => [x.id, x.versPrudentCents, x.versAmbitieuxCents]), [['h2', -8_000, 16_000], ['h1', 0, 0]]);
  const s = TR.projeterScenarios({ ...DEPART, hypotheses: HYPOTHESES });
  // Prudent, seuil 0 : sous zéro du 03/11 au 24/11 inclus (22 jours), puis au-dessus → creux court.
  assert.deepEqual(TR.passageSousLeSeuil(s.prudent, 0), { type: 'creux-court', debut: '2026-11-03', jours: 22 });
  // Central, seuil de confort 250,00 € : sous le seuil à partir du 20/11 jusqu’à la fin.
  assert.deepEqual(TR.passageSousLeSeuil(s.central, 25_000), { type: 'reste-sous', depuis: '2026-11-20' });
  assert.deepEqual(TR.passageSousLeSeuil(s.ambitieux, 0), { type: 'au-dessus' });
});

await dit('MA07 : variation de la semaine + 1 280 € ; autonomie 18 420 € ÷ 4 383,33 € = 4,2 mois, santé 70 (bonne) ; bande ± 680 € à J+16 ; 22 213,40 € → 22 200 €', () => {
  assert.equal(TR.variationDeLaSemaine(1_842_000, 1_714_000), 128_000);
  // Charges des 3 derniers mois : 4 300, 4 400, 4 450 € → moyenne 4 383,33 €. 18 420 ÷ 4 383,33 = 4,20 → 4,2 mois ; 4,2 ÷ 6 = 70 %.
  const a = TR.autonomie(1_842_000, [990_000, 430_000, 440_000, 445_000]);
  assert.deepEqual(a, { mois: 4.2, confortable: true, sante: 70, libelle: 'bonne', reserve: 100, reserveAtteinte: true });
  assert.equal(TR.autonomie(100_000, []), null);
  // 2 mois → 2 ÷ 6 = 33 → fragile ; 3 mois → 50 → correcte (et confortable).
  assert.deepEqual([TR.autonomie(200_000, [100_000])?.libelle, TR.autonomie(300_000, [100_000])?.libelle, TR.autonomie(300_000, [100_000])?.confortable], ['fragile', 'correcte', true]);
  assert.equal(TR.bandeIncertitude(16), 68_000);
  assert.equal(TR.bandeIncertitude(0), 0);
  assert.equal(C.arrondirCentaine(2_221_340), 2_220_000);
  assert.equal(TR.dans30Jours(TR.projeter(DEPART)), 20_000);
  assert.deepEqual([TR.couleurPointBas(20_000, 100_000, 25_000), TR.couleurPointBas(20_000, 100_000, null), TR.couleurPointBas(120_000, 100_000, 0)], ['rouge', 'orange', null]);
  // Achat décalable avant le point bas : ni le loyer (récurrent), ni la TVA (fiscale) → aucun ici.
  assert.equal(TR.achatDecalable(FLUX, AUJ, '2026-11-20'), null);
  assert.equal(TR.achatDecalable([...FLUX, { date: '2026-11-10', montantCents: -30_000, libelle: 'Écran', certitude: 'attendu' }], AUJ, '2026-11-20')?.libelle, 'Écran');
});

await dit('clôtures par semaine (du lundi au dimanche) : 1 000,00 / 600,00 / 600,00 / 200,00 €', () => {
  const s = TR.parSemaine(TR.projeter(DEPART));
  assert.deepEqual(s.slice(0, 4).map((x: any) => [x.lundi, x.soldeFinCents, x.entreesCents, x.sortiesCents]), [
    ['2026-10-26', 100_000, 0, 0],
    ['2026-11-02', 60_000, 80_000, -120_000],
    ['2026-11-09', 60_000, 0, 0],
    ['2026-11-16', 20_000, 0, -40_000],
  ]);
});

await dit('flux des factures : non échue → à son échéance (attendu) ; échue → 14 jours après aujourd’hui (incertain) ; soldées exclues', () => {
  const fl = TR.fluxDesFactures([facture({ id: 'a', dueAt: '2026-11-15' }), facture({ id: 'b', dueAt: '2026-10-20' }), facture({ id: 'c', status: 'paid' })], AUJ, { paiements: [{ factureId: 'a', montantCents: 26_356, etat: 'réussi' }] });
  assert.deepEqual(fl.map((x: any) => [x.date, x.montantCents, x.certitude]), [['2026-11-13', 126_356, 'incertain'], ['2026-11-15', 100_000, 'attendu']]);
});

await dit('flux des abonnements : un prélèvement par mois pour chaque actif, dans l’horizon seulement', () => {
  const fl = TR.fluxDesAbonnements([{ id: 'A', clientNom: 'A', montantMensuelCents: 8_900, jourPrelevement: 15, etat: 'Actif' }, { id: 'P', clientNom: 'P', montantMensuelCents: 5_000, jourPrelevement: 1, etat: 'En pause' }], AUJ, '2027-01-10');
  assert.deepEqual(fl.map((x: any) => [x.date, x.montantCents]), [['2026-11-15', 8_900], ['2026-12-15', 8_900]]);
});

await dit('flux fiscaux : seules les échéances à payer au montant connu sortent ; TVA de 161,06 € le 20/11 → − 161,06 €', () => {
  const fl = TR.fluxFiscaux([
    { intitule: 'TVA d’octobre', echeanceLe: '2026-11-20', montantCents: 16_106, paiement: 'À payer' },
    { intitule: 'Acompte d’impôt', echeanceLe: '2026-11-15', montantCents: 120_000, paiement: 'Payée' },
    { intitule: 'Dépôt des comptes', echeanceLe: '2026-11-10', montantCents: null, paiement: 'À payer' },
  ]);
  assert.deepEqual(fl.map((x: any) => [x.date, x.montantCents]), [['2026-11-20', -16_106]]);
});

console.log('\nL’argent — banque (lecture seule) et connecteurs\n');

await dit('ordre préparé : jamais émis, à exécuter dans ta banque ; pas d’IBAN complet ; montant positif exigé', () => {
  const o = BA.preparerOrdre({ beneficiaire: 'Fournisseur Exemple', ibanFin: '1234', montantCents: 16_106, reference: 'TVA septembre', echeance: '2026-11-20' });
  assert.equal(o.ok, true);
  assert.equal(o.ordre.emis, false);
  assert.equal(o.ordre.aExecuterDansTaBanque, true);
  assert.equal(BA.preparerOrdre({ beneficiaire: 'X', ibanFin: 'FR7600000000000000000000000', montantCents: 100, reference: 'r', echeance: AUJ }).ok, false);
  assert.equal(BA.preparerOrdre({ beneficiaire: 'X', ibanFin: '1234', montantCents: 0, reference: 'r', echeance: AUJ }).ok, false);
  assert.equal(BA.preparerOrdre({ beneficiaire: '', ibanFin: '1234', montantCents: 100, reference: 'r', echeance: AUJ }).ok, false);
  // Pour arriver à l’échéance, l’ordre est à passer 2 jours OUVRÉS avant (MA08) : ven. 20/11 → mer. 18/11 ; lun. 23/11 → jeu. 19/11.
  assert.equal(BA.dateLimiteDeLOrdre('2026-11-20'), '2026-11-18');
  assert.equal(BA.dateLimiteDeLOrdre('2026-11-23'), '2026-11-19');
});

await dit('rapprochement (MA10) : 92 sur 96 → 95 % ; une pièce proposée au centime près — exacte, probable, à vérifier — jamais appliquée seule', () => {
  const mv = (n: number, rapprochement: string) => Array.from({ length: n }, () => ({ rapprochement }));
  assert.deepEqual(BA.partRapprochee([...mv(92, 'rapproché'), ...mv(4, 'à vérifier')]), { rapproches: 92, total: 96, aVerifier: 4, pourcentage: 95 });
  assert.equal(BA.partRapprochee([]).pourcentage, 100);
  const ouvertes = [
    { id: 'f1', number: '2026-0041', issuedAt: '2026-10-01', resteCents: 126_356, clientNom: 'Atelier Exemple' },
    { id: 'f2', number: '2026-0042', issuedAt: '2026-10-02', resteCents: 48_000, clientNom: 'Studio Fictif' },
    { id: 'f3', number: '2026-0050', issuedAt: '2026-11-02', resteCents: 48_000, clientNom: 'Studio Fictif' },
  ];
  assert.deepEqual(BA.proposerAssociation({ montantCents: 126_356, date: '2026-10-07', libelle: 'VIR 2026-0041 ATELIER' }, ouvertes), { factureId: 'f1', confiance: 'exact' });
  assert.deepEqual(BA.proposerAssociation({ montantCents: 48_000, date: '2026-10-20', libelle: 'VIR STUDIO FICTIF' }, ouvertes), { factureId: 'f2', confiance: 'probable' });
  assert.deepEqual(BA.proposerAssociation({ montantCents: 48_000, date: '2026-10-20', libelle: 'VIR SEPA' }, ouvertes, new Set(['Studio Fictif'])), { factureId: 'f2', confiance: 'a-verifier' });
  assert.equal(BA.proposerAssociation({ montantCents: 48_000, date: '2026-10-20', libelle: 'VIR SEPA' }, ouvertes), null);
  assert.equal(BA.proposerAssociation({ montantCents: 126_357, date: '2026-10-07', libelle: 'VIR 2026-0041' }, ouvertes), null, 'au centime près');
  assert.equal(BA.proposerAssociation({ montantCents: -126_356, date: '2026-10-07', libelle: 'VIR 2026-0041' }, ouvertes), null, 'une sortie n’est jamais rapprochée d’une facture');
  // G03 « Avant de relancer » : un mouvement non rapproché à ± 0,50 € dans les 30 derniers jours.
  const mvts = [{ id: 'a', montantCents: 126_320, date: '2026-10-25', rapprochement: 'à vérifier' }, { id: 'b', montantCents: 126_356, date: '2026-09-20', rapprochement: 'à vérifier' }, { id: 'c', montantCents: 126_356, date: '2026-10-28', rapprochement: 'rapproché' }];
  assert.equal(BA.mouvementQuiRessemble(126_356, mvts, AUJ)?.id, 'a');
  assert.equal(BA.mouvementQuiRessemble(126_356, mvts.slice(1), AUJ), null);
  assert.equal(BA.soldeTotal([{ soldeCents: 1_000 }, { soldeCents: 2_500 }]), 3_500);
});

await dit('solde de départ (§1.29 n° 7) : comptes courants par défaut (1 000,00 + carte 200,00 = 1 200,00 €), épargne de 5 000,00 € à part ou ajoutée', () => {
  const comptes = [{ nom: 'Compte courant', soldeCents: 100_000 }, { nom: 'Compte d’épargne', soldeCents: 500_000 }, { nom: 'Compte carte', soldeCents: 20_000 }];
  assert.deepEqual(BA.soldeDeDepart(comptes), { courantCents: 120_000, epargneCents: 500_000, totalCents: 120_000 });
  assert.equal(BA.soldeDeDepart(comptes, { avecEpargne: true }).totalCents, 620_000);
  assert.equal(BA.natureDuCompte('Livret A'), 'epargne');
});

await dit('aucune fonction de la zone n’émet un virement ni n’envoie un paiement', () => {
  for (const mod of MODULES) {
    for (const nom of Object.keys(M[mod])) assert.doesNotMatch(nom, /^(virer|emettre|envoyer(Virement|Paiement)|executer|payer)/i, `${mod}.${nom}`);
  }
  for (const f of fs.readdirSync(path.join(racine, ZONE))) assert.doesNotMatch(fs.readFileSync(path.join(racine, ZONE, f), 'utf8'), /\bfetch\(|XMLHttpRequest|bridge\(/, `${f} appelle le réseau`);
});

await dit('connecteurs (modèle de S9, lecture seule) : paiements en ligne à brancher, puis externes ; la banque reste en lecture', () => {
  const inst = (categorie: string, optionId: string, etat: string, droits: string[]) => ({ categorie, prise: 1, optionId, etat, motif: null, droits, coutAccepte: null, derniereSynchroAt: null, synchroEnCours: false, erreur: null, widgets: 0, changeAt: null });
  assert.deepEqual(CO.etatPaiementsEnLigne([]), { mode: 'local', aBrancher: true, ouConfigurer: 'H21' });
  assert.deepEqual(CO.etatPaiementsEnLigne([inst('paiement', 'stripe', 'connecte', ['lecture'])]), { mode: 'externe', aBrancher: false, ouConfigurer: 'H21' });
  assert.deepEqual(CO.etatBanque([inst('banque', 'agregateur-dsp2', 'connecte', ['lecture'])]), { mode: 'externe', aBrancher: false, ouConfigurer: 'H21', lectureSeule: true });
  assert.equal(CO.etatBanque([]).lectureSeule, true);
});

console.log('\nL’argent — TVA à venir, justificatifs, contrats, paiements en ligne, comptabilité, vue d’ensemble\n');

await dit('MA08 : prochaine échéance le 20/11 → dans 21 jours, à payer le 18/11 ; mis de côté 3 270 / 3 850 € → 85 % ; préparation 91 sur 99 → 91 % (jamais arrondi vers le haut)', () => {
  const e = (id: string, echeanceLe: string, paiement = 'À payer') => ({ id, intitule: id, famille: 'TVA', echeanceLe, montantCents: 10_000, paiement });
  const r = TV.prochaineEcheance([e('payee', '2026-11-02', 'Payée'), e('passee', '2026-10-15'), e('tva', '2026-11-20'), e('plus-tard', '2026-12-20')], AUJ);
  assert.deepEqual([r.echeance.id, r.jours, r.payerLe], ['tva', 21, '2026-11-18']);
  assert.equal(TV.prochaineEcheance([], AUJ), null);
  assert.equal(TV.partMiseDeCote(327_000, 385_000), 85);
  assert.equal(TV.partMiseDeCote(1, 0), null);
  assert.deepEqual([TV.preparationPct(91, 99), TV.preparationPct(98, 99), TV.preparationPct(99, 99), TV.preparationPct(0, 0)], [91, 98, 100, 0]);
  // H08 : la TVA récupérable ne compte que les dépenses justifiées (d1 : 20,00 €) ; d2 est à justifier, d3 est de septembre.
  assert.equal(TV.tvaRecuperable(DEPENSES_OCT, '2026-10'), 2_000);
});

await dit('H08 : justificatifs d’octobre avant le 05/11 (dans 6 jours) ; 44 sur 48 → 92 % ; un reçu de 54,80 € le 20/10 trouve la dépense de 55,00 € du 18/10', () => {
  assert.equal(DP.dateLimiteJustificatif('2026-10'), '2026-11-05');
  assert.equal(DP.joursAvantLimite('2026-10', AUJ), 6);
  assert.equal(DP.joursAvantLimite('2026-10', '2026-11-07'), -2);
  const d = (statut: string) => ({ ...DEPENSES_OCT[0], justificatif: { statut, fichier: null } });
  assert.deepEqual(DP.moisJustifie([...Array(44).fill(0).map(() => d('justifié')), ...Array(4).fill(0).map(() => d('à justifier'))], '2026-10'), { justifiees: 44, total: 48, pourcentage: 92 });
  assert.equal(DP.moisJustifie([], '2026-10').pourcentage, 100);
  assert.deepEqual(DP.depensesPourUnRecu({ montantCents: 5_480, date: '2026-10-20' }, DEPENSES_OCT).map((x: any) => x.id), ['d2']);
  assert.deepEqual(DP.depensesPourUnRecu({ montantCents: 5_420, date: '2026-10-20' }, DEPENSES_OCT), [], 'au-delà de 0,50 € d’écart');
  assert.deepEqual(DP.depensesPourUnRecu({ montantCents: 5_500, date: '2026-10-22' }, DEPENSES_OCT), [], 'au-delà de 3 jours');
  assert.equal(DP.economieAnnuelle(2_900), 34_800);
  assert.deepEqual([DP.nonUtiliseDepuis('2026-09-30', AUJ), DP.nonUtiliseDepuis('2026-10-01', AUJ)], [true, false]);
});

await dit('contrats (MA01) : échéance du 15/11 → 16 jours, préavis écoulé 44 sur 60 → 73 % ; tacite jamais « à renouveler » ; 2 800 € révisés de 4 % → 2 912 € ; frise du 01/07/2026 au 01/07/2027', () => {
  const c = (o: Record<string, unknown>) => ({ periode: 'Mensuel', valeurParPeriodeCents: 25_000, debutLe: '2025-11-15', echeanceLe: '2026-11-15', reconduction: 'manuelle', etat: 'Actif', ...o });
  assert.equal(CT.PREAVIS_PAR_DEFAUT_JOURS, 60);
  assert.equal(CT.etatContrat(c({}), AUJ), 'a-renouveler');
  assert.equal(CT.etatContrat(c({ reconduction: 'tacite' }), AUJ), 'actif');
  assert.equal(CT.etatContrat(c({ echeanceLe: '2027-03-01' }), AUJ), 'actif');
  assert.equal(CT.etatContrat(c({ etat: 'Brouillon' }), AUJ), 'brouillon');
  assert.equal(CT.etatContrat(c({ etat: 'Terminé' }), AUJ), 'termine');
  assert.deepEqual(CT.compteARebours(c({}), AUJ), { jours: 16, preavisEcoule: 44, preavis: 60, pourcentage: 73 });
  assert.deepEqual([CT.valeurAnnualisee(c({})), CT.valeurAnnualisee(c({ periode: 'Trimestriel' })), CT.valeurAnnualisee(c({ periode: 'Annuel' }))], [300_000, 100_000, 25_000]);
  // Valeur annuelle : actifs et à renouveler (300 + 1 000 €) ; brouillon et terminé exclus.
  assert.equal(CT.valeurAnnuelle([c({}), c({ periode: 'Trimestriel', reconduction: 'tacite' }), c({ etat: 'Brouillon' }), c({ etat: 'Terminé' })], AUJ), 400_000);
  assert.equal(CT.valeurRevisee(280_000, 4), 291_200);
  assert.deepEqual(CT.fenetreDeLaFrise(AUJ), { debut: '2026-07-01', fin: '2027-07-01' });
});

await dit('paiements en ligne (MA03) : 41 paiements dont 1 échoué → 98 % ; 182 € de frais sur 9 640 € → 1,9 % ; carte 23 sur 24 → 96 % ; barres en racine', () => {
  const pa = (etat: string, montantCents = 24_100, fraisCents = 455, moyen = 'Virement', date = '2026-10-12T10:00:00Z') => ({ moyen, montantCents, fraisCents, etat, date });
  const liste = [...Array(40).fill(0).map(() => pa('réussi')), pa('échoué', 9_000, 0), pa('remboursé', 50_000, 0), pa('réussi', 99_999, 99, 'Virement', '2026-09-30T23:00:00Z')];
  assert.deepEqual(PM.bilanDuMois(liste, '2026-10'), { total: 41, reussis: 40, enAttente: 0, echoues: 1, tauxReussite: 98, encaisseCents: 964_000, fraisCents: 18_200, partFrais: 1.9 });
  const cartes = [...Array(23).fill(0).map(() => pa('réussi', 1_000, 0, 'Carte')), pa('échoué', 1_000, 0, 'Carte'), pa('en attente', 1_000, 0, 'Prélèvement')];
  assert.deepEqual(PM.parMoyen(cartes, '2026-10'), [{ moyen: 'Carte', total: 24, reussis: 23, taux: 96 }, { moyen: 'Prélèvement', total: 1, reussis: 0, taux: 0 }]);
  assert.deepEqual([PM.hauteurDeBarre(25_000, 100_000), PM.hauteurDeBarre(100_000, 100_000), PM.hauteurDeBarre(0, 100_000), PM.hauteurDeBarre(5, 0)], [38, 76, 0, 0]);
});

await dit('comptabilité (MA02) : 12 400 € de CA HT, 5 840 € de charges → 6 560 €, 53 % ; soldes courants du 512 ; 6 points sur 8 → encore 2', () => {
  assert.deepEqual(CP.resultatIndicatif(1_240_000, 584_000), { resultatCents: 656_000, marge: 53 });
  assert.deepEqual(CP.resultatIndicatif(0, 10_000), { resultatCents: -10_000, marge: null });
  assert.deepEqual(CP.soldesCourants(100_000, [{ debitCents: 50_000, creditCents: 0 }, { debitCents: 0, creditCents: 120_000 }, { debitCents: 30_000, creditCents: 0 }]), [150_000, 30_000, 60_000]);
  assert.deepEqual([CP.variationMensuelle(109_000, 100_000), CP.variationMensuelle(97_000, 100_000), CP.variationMensuelle(1, 0)], [9, -3, null]);
  const points = { ecrituresSaisies: true, numerotationSansTrou: true, releveImporte: true, aucunMouvementAVerifier: false, aucunJustificatifManquant: false, tvaCalculee: true, fecGenere: true, envoiAuComptable: true };
  assert.deepEqual(CP.pretPourLeComptable(points), { faits: 6, total: 8, restants: 2 });
});

await dit('vue d’ensemble (F30) : 5 clients nommés, le reste groupé ; solde au bout = au 1er + entrées − sorties, le réel s’il s’en écarte de plus de 1 € ; objectif atteint le jour du dépassement', () => {
  const r = EN.regrouper(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'A'].map((nom, i) => ({ nom, montantCents: (i + 1) * 1_000 })));
  // A = 1 000 + 8 000 = 9 000 ; G 7 000, F 6 000, E 5 000, D 4 000 ; reste C 3 000 + B 2 000.
  assert.deepEqual(r.nommes.map((x: any) => [x.nom, x.montantCents]), [['A', 9_000], ['G', 7_000], ['F', 6_000], ['E', 5_000], ['D', 4_000]]);
  assert.deepEqual(r.autres, { nombre: 2, montantCents: 5_000 });
  const m = (date: string, montantCents: number, categorie: string, rapprochement = 'rapproché', reel = true, clientNom?: string) => ({ date, montantCents, libelle: categorie, categorie, rapprochement, reel, clientNom });
  const mvts = [m('2026-10-05', 120_000, 'Ventes', 'rapproché', true, 'Atelier'), m('2026-10-06', 30_000, 'Ventes', 'à vérifier'), m('2026-10-03', -50_000, 'Loyer'), m('2026-10-28', -9_000, 'Logiciels'), m('2026-11-02', 99_000, 'Ventes'), m('2026-10-29', -1_000, 'Logiciels', 'rapproché', false)];
  const v = EN.riviereDuMois(mvts, '2026-10', 200_000, 261_000);
  assert.deepEqual([v.entreesCents, v.sortiesCents, v.soldeAuBoutCents, v.ecartCents], [120_000, 59_000, 261_000, 0]);
  assert.deepEqual(v.sorties.nommes.map((x: any) => [x.nom, x.montantCents]), [['Loyer', 50_000], ['Logiciels', 9_000]]);
  const w = EN.riviereDuMois(mvts, '2026-10', 200_000, 300_000);
  assert.deepEqual([w.soldeAuBoutCents, w.ecartCents], [300_000, 39_000]);
  assert.deepEqual([EN.riviereDuMois(mvts, '2026-10', 200_000, 261_100).ecartCents], [0], 'un écart de 1 € pile ne s’affiche pas');
  assert.deepEqual(EN.objectifEncaissement([{ date: '2026-10-20', montantCents: 60_000 }, { date: '2026-10-05', montantCents: 50_000 }], 100_000), { pourcentage: 100, atteintLe: '2026-10-20' });
  assert.deepEqual(EN.objectifEncaissement([{ date: '2026-10-05', montantCents: 50_000 }], 100_000), { pourcentage: 50, atteintLe: null });
  assert.equal(EN.objectifEncaissement([], null), null);
});

/* ── Les jeux fictifs de SIM ──────────────────────────────────────────────── */

console.log('\nL’argent — rejoué sur les jeux fictifs\n');

const MONDES: { nom: string; m: any }[] = [];
for (const volume of ['vide', 'peu', 'normal', 'beaucoup']) MONDES.push({ nom: volume, m: monde.construireMonde({ volume }) });
for (const graine of [7, 42, 2026]) MONDES.push({ nom: `normal/${graine}`, m: monde.construireMonde({ volume: 'normal', graine }) });

/* Les jeux de SIM calculent encore la TVA PAR TAUX (avant la décision du 14 nov., §1.29 n° 1) : en attendant leur
 * alignement, la logique est comparée À L'IDENTIQUE à `money.ts`, et aux jeux à une tolérance d'un centime par ligne
 * (l'écart qu'un arrondi par ligne peut produire, au plus). Quand SIM s'aligne, la tolérance passe à zéro. */
const ecartLignes = (f: any) => f.lines.length;

await dit('totaux et reste dû : identiques à money.ts ; aux jeux, à un centime par ligne près ; statut affiché identique', () => {
  const traduit: Record<string, string> = { brouillon: 'Brouillon', envoyee: 'Envoyée', 'en-retard': 'En retard', payee: 'Payée', annulee: 'Annulée' };
  let ecarts = 0;
  for (const { nom, m } of MONDES) {
    const auj = m.contexte.aujourdhui;
    for (const f of m.factures) {
      const t = F.totauxDocument(f.lines);
      const money = M.documentTotals(f.lines);
      assert.deepEqual([t.htCents, t.tvaCents, t.ttcCents], [money.netCents, money.vatCents, money.grossCents], `${nom} ${f.id} (money.ts)`);
      const ref = monde.totauxDeFacture(f);
      assert.equal(t.htCents, ref.htCents, `${nom} ${f.id} HT`);
      assert.ok(Math.abs(t.tvaCents - ref.tvaCents) <= ecartLignes(f), `${nom} ${f.id} TVA ${t.tvaCents} / ${ref.tvaCents}`);
      if (t.tvaCents !== ref.tvaCents) ecarts += 1;
      const reste = F.resteDu(f, { factures: m.factures, paiements: [] });
      assert.ok(Math.abs(reste - f.soldeCents) <= (f.soldeCents ? ecartLignes(f) : 0), `${nom} ${f.id} reste dû`);
      assert.equal(traduit[F.statutFacture(f, auj, { factures: m.factures, paiements: [] })], monde.statutAffiche(f, auj), `${nom} ${f.id} statut`);
      if (f.status === 'issued') assert.equal(reste, M.netDueCents(f, m.factures), `${nom} ${f.id} = netDueCents`);
    }
  }
  console.log(`      (factures dont la TVA diffère d’un centime entre les deux règles, sur tous les mondes : ${ecarts})`);
});

await dit('numérotation des jeux : continue, sans trou, chaque année', () => {
  for (const { nom, m } of MONDES) {
    // Les jeux numérotent encore `F-AAAA-NNNN` (§1.29 n° 4 : SIM s'aligne) : lus avec le préfixe `F`.
    const numeros = m.factures.map((f: any) => f.number);
    for (const an of new Set(numeros.filter(Boolean).map((n: string) => Number(n.slice(2, 6))))) assert.deepEqual(F.trousDeNumerotation(numeros, an, 'F'), [], `${nom} ${an}`);
  }
});

await dit('TVA (débits) de chaque échéance « TVA de … » des jeux, et cotisations à 46 % du net', () => {
  let tvaVues = 0;
  for (const { nom, m } of MONDES) {
    for (const e of m.echeancesFiscales) {
      const [a, mo] = e.echeanceLe.split('-').map(Number);
      const prec = mo === 1 ? `${a - 1}-12` : `${a}-${String(mo - 1).padStart(2, '0')}`;
      if (e.famille === 'TVA') {
        tvaVues += 1;
        // Tolérance d'un centime par ligne des factures du mois, jusqu'à l'alignement de SIM (voir plus haut).
        const lignesDuMois = m.factures.filter((f: any) => f.status !== 'draft' && f.status !== 'cancelled' && f.issuedAt.startsWith(prec)).reduce((s: number, f: any) => s + f.lines.length, 0);
        const calcule = TV.tvaDuMois({ mois: prec, regime: 'debits', factures: m.factures, paiements: [], depenses: m.depenses }).soldeCents;
        assert.ok(Math.abs(calcule - e.montantCents) <= lignesDuMois, `${nom} ${e.intitule} : ${calcule} / ${e.montantCents}`);
        assert.equal(TV.echeanceTva(prec), e.echeanceLe);
      }
      if (e.famille === 'Cotisations') {
        const masse = PA.masseSalariale(m.bulletins, prec);
        assert.equal(masse.cotisationsCents > 0 ? masse.cotisationsCents : null, e.montantCents, `${nom} cotisations ${prec}`);
      }
    }
  }
  assert.ok(tvaVues > 10, `au moins une dizaine d’échéances de TVA rejouées (${tvaVues})`);
});

await dit('prochain prélèvement des abonnements actifs : identique aux jeux ; revenu mensuel = somme des actifs et échoués', () => {
  for (const { nom, m } of MONDES) {
    for (const ab of m.abonnements) if (ab.prochainPrelevementLe) assert.equal(AB.prochainPrelevement(m.contexte.aujourdhui, ab.jourPrelevement), ab.prochainPrelevementLe, `${nom} ${ab.id}`);
    const attendu = m.abonnements.filter((a: any) => a.etat === 'Actif' || a.etat === 'Paiement échoué').reduce((s: number, a: any) => s + a.montantMensuelCents, 0);
    assert.equal(AB.revenuMensuelRecurrent(m.abonnements), attendu);
  }
});

await dit('trésorerie sur les jeux : solde final = départ + flux de l’horizon ; point bas ≤ chaque jour ; semaines = dernier jour', () => {
  for (const { nom, m } of MONDES) {
    const auj = m.contexte.aujourdhui;
    const flux = TR.fluxDesMouvementsPrevus(m.mouvements);
    const depart = BA.soldeDeDepart(m.comptes).totalCents;
    for (const scenario of ['attendu', 'prudent']) {
      const p = TR.projeter({ soldeDepartCents: depart, aujourdhui: auj, flux, semaines: 12, scenario });
      const fin = p.jours.at(-1).date;
      const somme = flux.filter((f: any) => f.date > auj && f.date <= fin && (scenario === 'attendu' || f.certitude !== 'incertain')).reduce((s: number, f: any) => s + f.montantCents, 0);
      assert.equal(p.soldeFinCents, depart + somme, `${nom} ${scenario}`);
      for (const j of p.jours) assert.ok(p.pointBas.soldeCents <= j.soldeCents);
      for (const s of TR.parSemaine(p)) {
        const dernier = [...p.jours].reverse().find((j: any) => j.date >= s.lundi && j.date <= C.ajouterJours(s.lundi, 6));
        assert.equal(s.soldeFinCents, dernier.soldeCents, `${nom} semaine ${s.lundi}`);
      }
    }
  }
});

await dit('devis, budget, tarifs, impayés et banque sur les jeux : aucun NaN, comptes cohérents, banque en lecture seule', () => {
  for (const { nom, m } of MONDES) {
    const auj = m.contexte.aujourdhui;
    for (const d of m.devis) assert.ok(ETATS_DEVIS.includes(DV.etatDevis(d, auj)), `${nom} devis ${d.id}`);
    const taux = DV.tauxDeTransformation(m.devis, auj);
    assert.ok(taux === null || (taux >= 0 && taux <= 100));
    for (const e of m.enveloppes) {
      const r = BU.etatEnveloppe(e, m.depenses);
      assert.ok(Number.isInteger(r.depenseCents) && Number.isInteger(r.pourcentage) && ['dans-le-budget', 'presque-plein', 'paye', 'depasse'].includes(r.etat), `${nom} ${e.id}`);
      assert.equal(r.depenseCents - e.prevuCents, -r.resteCents, `${nom} ${e.id} reste`);
    }
    for (const p of m.prestations) assert.ok(TA.margePct(p.prixCents, p.coutCents) === null || Number.isFinite(TA.margePct(p.prixCents, p.coutCents)));
    const tranches = IM.tranchesDeRetard(m.factures, auj, { paiements: [] });
    assert.equal(tranches.reduce((s: number, t: any) => s + t.montantCents, 0), IM.totalImpaye(m.factures, auj, { paiements: [] }));
    const enRetard = m.factures.filter((f: any) => monde.statutAffiche(f, auj) === 'En retard');
    const attendu = enRetard.reduce((s: number, f: any) => s + M.netDueCents(f, m.factures), 0);
    assert.equal(IM.totalImpaye(m.factures, auj, { paiements: [] }), attendu, `${nom} impayés`);
    for (const c of m.comptes) assert.equal(c.accesLectureSeule, true);
  }
});

/* ── Textes ───────────────────────────────────────────────────────────────── */

console.log('\nL’argent — textes\n');

await dit('mots fr/en : mêmes clés, aucune vide, paramètres identiques', () => {
  const { fr, en } = I.dictionnaires;
  assert.deepEqual(Object.keys(fr).sort(), Object.keys(en).sort());
  for (const k of Object.keys(en)) {
    assert.ok(fr[k].trim() && en[k].trim(), k);
    const params = (t: string) => [...t.matchAll(/\{(\w+)\}/g)].map((x) => x[1]).sort().join(',');
    assert.equal(params(fr[k]), params(en[k]), k);
  }
});

await dit('l’interface tutoie ; ce qui part chez un client (clés « client. ») vouvoie', () => {
  const { fr } = I.dictionnaires;
  for (const [k, v] of Object.entries<string>(fr)) {
    if (k.startsWith('client.')) {
      assert.match(v, /\bvous\b|\bvotre\b|\bvos\b/i, `${k} doit vouvoyer`);
      assert.doesNotMatch(v, /\btu\b|\bton\b|\bta\b|\btes\b|\btoi\b|\bte\b/i, `${k} tutoie un client`);
    } else {
      assert.doesNotMatch(v, /(^|[^\p{L}])(vous|votre|vos)([^\p{L}]|$)/iu, `${k} vouvoie dans l’interface : « ${v} »`);
      const enEz = [...v.matchAll(/\p{L}+ez(?!\p{L})/giu)].map((x) => x[0].toLowerCase()).filter((w) => !['chez', 'assez', 'nez'].includes(w));
      assert.deepEqual(enEz, [], `${k} : impératif en « -ez » dans l’interface`);
    }
  }
});

await dit('libellés de statut : chaque statut calculé a son texte, en fr et en en', () => {
  const aSonTexte = (cle: string) => {
    for (const l of ['fr', 'en']) assert.ok(I.dictionnaires[l][cle]?.trim(), `${l} : ${cle}`);
  };
  for (const s of ['brouillon', 'envoyee', 'vue', 'en-retard', 'payee', 'annulee']) aSonTexte(`facture.${s}`);
  for (const s of ETATS_DEVIS) aSonTexte(`devis.${s}`);
  for (const s of IM.TRANCHES) aSonTexte(`tranche.${s}`);
  for (const s of IM.ETAPES) aSonTexte(`etape.${s}`);
  for (const s of ['dans-le-budget', 'presque-plein', 'paye', 'depasse']) aSonTexte(`budget.${s}`);
  for (const s of TR.SCENARIOS) aSonTexte(`scenario.${s}`);
  for (const s of ['relance-1', 'relance-2']) aSonTexte(`client.relance.${s}`);
  assert.equal(I.traduire('fr', 'tresorerie.sousZero', { date: 'ven. 20 nov.' }), 'Tu passes sous zéro le ven. 20 nov.');
});

/* ── Structure ────────────────────────────────────────────────────────────── */

console.log('\nL’argent — structure\n');

await dit('mode préparation : aucun écran (.tsx), aucune brique visuelle, aucun React dans la zone', () => {
  for (const f of fs.readdirSync(path.join(racine, ZONE))) {
    assert.ok(!f.endsWith('.tsx'), `${f} : pas d’écran avant la fusion du socle v4`);
    const src = fs.readFileSync(path.join(racine, ZONE, f), 'utf8');
    assert.doesNotMatch(src, /from ['"][^'"]*socle\/ui|from ['"]react['"]|from ['"]react-dom/, `${f} importe une brique visuelle ou React`);
  }
});

await dit('aucun fichier partagé n’importe la zone (seuls src/refonte/** et les fichiers .internal le peuvent)', () => {
  const fautes: string[] = [];
  const parcourir = (dir: string) => {
    for (const e of fs.readdirSync(path.join(racine, dir), { withFileTypes: true })) {
      const rel = `${dir}/${e.name}`;
      if (e.isDirectory()) parcourir(rel);
      else if (/\.(tsx?)$/.test(e.name) && !rel.startsWith('src/refonte/') && !/\.internal\.tsx?$/.test(rel) && /refonte\/argent/.test(fs.readFileSync(path.join(racine, rel), 'utf8'))) fautes.push(rel);
    }
  };
  parcourir('src');
  assert.deepEqual(fautes, []);
});

await dit('aucun montant ni nom tiré d’une image : la zone n’écrit pas de montant en euros en dur', () => {
  for (const f of fs.readdirSync(path.join(racine, ZONE))) {
    const src = fs.readFileSync(path.join(racine, ZONE, f), 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
    assert.doesNotMatch(src, /\d[\d\s\u202f]*,\d{2}\s?€/, `${f} écrit un montant en dur`);
  }
});

console.log('');
if (echecs > 0) {
  console.error(`ÉCHEC — ${echecs} propriété(s) de l’argent ne tiennent pas.`);
  process.exit(1);
}
console.log(`OK — ${vus} propriétés de l’argent tiennent.`);
process.exit(0);

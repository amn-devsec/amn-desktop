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

const MODULES = ['commun', 'facturation', 'devis', 'depenses', 'impayes', 'tva', 'abonnements', 'budget', 'tarifs', 'tresorerie', 'banque', 'paie', 'connecteurs', 'i18n'] as const;

/* eslint-disable @typescript-eslint/no-explicit-any */
const M = await charger<any>(
  MODULES.map((f) => `export * as ${f} from '../src/refonte/argent/${f}';`).join('\n') +
    "\nexport * as monde from '../src/refonte/donnees';\nexport { netDueCents, nextNumber } from '../src/state/useInvoices';\nexport { documentTotals } from '../src/lib/money';",
);
const { commun: C, facturation: F, devis: DV, depenses: DP, impayes: IM, tva: TV, abonnements: AB, budget: BU, tarifs: TA, tresorerie: TR, banque: BA, paie: PA, connecteurs: CO, i18n: I, monde } = M;

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

await dit('statut d’une facture : en retard au lendemain de l’échéance (pas le jour même), partiellement payée, soldée', () => {
  const f = facture({});
  const ctx = (paiements: unknown[] = []) => ({ factures: [f], paiements });
  assert.equal(F.statutFacture(f, AUJ, ctx()), 'en-retard');
  assert.equal(F.joursDeRetard(f, AUJ), 10);
  assert.equal(F.statutFacture(facture({ dueAt: AUJ }), AUJ, { factures: [], paiements: [] }), 'envoyee');
  assert.equal(F.statutFacture(facture({ dueAt: '2026-11-15' }), AUJ, { factures: [], paiements: [{ factureId: 'fa-x', montantCents: 26_356, etat: 'réussi' }] }), 'partiellement-payee');
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

await dit('pénalités : 1 000,00 € × 13,15 %/an × 30 jours = 10,81 € ; indemnité forfaitaire de 40 € par facture entre professionnels', () => {
  // 100 000 × 0,1315 × 30 / 365 = 1 080,82 centimes → 1 081. Le taux est un paramètre (ici un taux d’exemple), jamais écrit en dur.
  assert.equal(IM.penalitesDeRetard(100_000, 30, 13.15), 1_081);
  assert.equal(IM.penalitesDeRetard(100_000, 0, 13.15), 0);
  assert.equal(IM.penalitesDeRetard(0, 30, 13.15), 0);
  assert.equal(IM.INDEMNITE_RECOUVREMENT_CENTS, 4_000);
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

await dit('priorités : le palier le plus dur d’abord, puis le plus gros montant ; paliers repris de src/lib/relances.ts', () => {
  const mk = (id: string, dueAt: string, ht: number) => facture({ id, dueAt, lines: [ligne(1, ht, 0)] });
  const p = IM.prioritesDeRelance([mk('petit-vieux', '2026-09-01', 1_000), mk('gros-recent', '2026-10-25', 90_000), mk('moyen-vieux', '2026-09-02', 50_000)], AUJ, { paiements: [] });
  // Au 30/10 : échue le 02/09 → 58 jours, le 01/09 → 59 jours (au-delà de 45 : dernier avis) ; le 25/10 → 5 jours (rappel).
  assert.deepEqual(p.map((x: any) => [x.facture.id, x.palier, x.joursRetard]), [['moyen-vieux', 'dernier-avis', 58], ['petit-vieux', 'dernier-avis', 59], ['gros-recent', 'rappel', 5]]);
});

await dit('relance préparée : vouvoiement, montant et échéance au format français, jamais envoyée', () => {
  const r = IM.preparerRelance(facture({}), AUJ, { paiements: [] }, 'fr');
  assert.equal(r.palier, 'ferme');
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

await dit('budget : 420 € sur 500 € le 30/10 → 84 %, attention, projection 434 € ; 50 € sur 200 € le 10 → 25 %, projection 155 € ; dépassé', () => {
  const env = (prevuCents: number) => ({ id: 'en', nom: 'Matériel', prevuCents, categories: ['materiel'], mois: '2026-10' });
  const dep = (montant: number, jour: string) => ({ ...DEPENSES_OCT[0], id: `x${montant}${jour}`, amountCents: montant, spentAt: jour });
  const a = BU.etatEnveloppe(env(50_000), [dep(42_000, '2026-10-03'), dep(9_999, '2026-09-30')], '2026-10-30');
  assert.deepEqual([a.consommeCents, a.resteCents, a.pourcentage, a.projectionCents, a.etat], [42_000, 8_000, 84, 43_400, 'attention']);
  const b = BU.etatEnveloppe(env(20_000), [dep(5_000, '2026-10-02')], '2026-10-10');
  assert.deepEqual([b.pourcentage, b.projectionCents, b.etat], [25, 15_500, 'ok']);
  const c = BU.etatEnveloppe(env(20_000), [dep(21_000, '2026-10-02')], '2026-10-10');
  assert.deepEqual([c.resteCents, c.etat], [-1_000, 'depasse']);
  // Projection au-dessus du prévu, consommation encore sous 80 % → attention.
  assert.equal(BU.etatEnveloppe(env(20_000), [dep(10_000, '2026-10-02')], '2026-10-10').etat, 'attention');
  // Un mois terminé : la projection vaut le consommé.
  assert.equal(BU.etatEnveloppe(env(50_000), [dep(42_000, '2026-10-03')], '2026-11-02').projectionCents, 42_000);
});

await dit('abonnements : revenu mensuel 163,00 € (actifs et paiements échoués), annuel 1 956,00 €, attrition d’octobre 25 %', () => {
  const ab = (id: string, etat: string, montant: number, depuis: string, resilieLe: string | null = null) => ({ id, clientNom: id, plan: 'p', montantMensuelCents: montant, depuis, jourPrelevement: 15, etat, resilieLe, prochainPrelevementLe: null });
  const liste = [ab('A', 'Actif', 8_900, '2026-01-01'), ab('B', 'Résilié', 3_000, '2026-02-01', '2026-10-12'), ab('C', 'Actif', 4_900, '2026-10-05'), ab('D', 'Résilié', 3_000, '2025-05-01', '2026-09-20'), ab('E', 'En pause', 12_000, '2026-03-01'), ab('F', 'Paiement échoué', 2_500, '2026-04-01')];
  assert.equal(AB.revenuMensuelRecurrent(liste), 16_300);
  assert.equal(AB.revenuAnnuelRecurrent(liste), 195_600);
  // Au 1er octobre : A, B, E, F (D résilié avant, C pas encore) = 4 ; résilié dans le mois : B → 25,0 %.
  assert.equal(AB.attritionDuMois(liste, '2026-10'), 25);
  assert.equal(AB.attritionDuMois([], '2026-10'), null);
});

await dit('prochain prélèvement : strictement après aujourd’hui, ramené au dernier jour d’un mois court', () => {
  assert.equal(AB.prochainPrelevement('2026-10-30', 15), '2026-11-15');
  assert.equal(AB.prochainPrelevement('2026-10-30', 30), '2026-11-30');
  assert.equal(AB.prochainPrelevement('2026-10-30', 31), '2026-10-31');
  assert.equal(AB.prochainPrelevement('2026-11-15', 31), '2026-11-30');
  assert.equal(AB.prochainPrelevement('2027-01-31', 30), '2027-02-28');
  assert.equal(AB.prochainPrelevement('2026-12-20', 5), '2027-01-05');
});

await dit('tarifs : marge 62,0 % ; remise 15 % → 1 020,00 € ; remise de 250 € → 950,00 € ; remise de 70 % sous le coût ; marge pondérée 47,5 %', () => {
  assert.equal(TA.margePct(120_000, 45_600), 62);
  assert.equal(TA.margePct(120_000, null), null);
  assert.equal(TA.margePct(0, 0), null);
  assert.deepEqual(TA.appliquerRemise(120_000, { type: 'pct', valeur: 15 }, 45_600), { prixCents: 102_000, remiseCents: 18_000, sousLeCout: false });
  assert.deepEqual(TA.appliquerRemise(120_000, { type: 'montant', cents: 25_000 }, 45_600), { prixCents: 95_000, remiseCents: 25_000, sousLeCout: false });
  assert.deepEqual(TA.appliquerRemise(120_000, { type: 'pct', valeur: 70 }, 45_600), { prixCents: 36_000, remiseCents: 84_000, sousLeCout: true });
  assert.deepEqual(TA.appliquerRemise(10_000, { type: 'montant', cents: 25_000 }, null), { prixCents: 0, remiseCents: 10_000, sousLeCout: false });
  // A : 100 € (coût 40 €) vendu 3 fois ; B : 500 € (coût 300 €) vendu 1 fois → (180 + 200) / 800 = 47,5 %.
  const p = (id: string, prixCents: number, coutCents: number | null, ventesMois: number, etat = 'active') => ({ id, nom: id, prixCents, coutCents, ventesMois, etat, historique: [] });
  assert.equal(TA.margeMoyennePonderee([p('A', 10_000, 4_000, 3), p('B', 50_000, 30_000, 1), p('C', 9_000, null, 5), p('D', 7_000, 1_000, 4, 'archivée')]), 47.5);
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

await dit('devis : brouillon, envoyé, vu, accepté, refusé, expiré (au lendemain de la validité)', () => {
  const d = (o: Record<string, unknown>) => ({ id: 1, status: 'sent', validiteJusquau: '2026-11-15', vuAt: null, ...o });
  assert.equal(DV.etatDevis(d({ status: 'draft' }), AUJ), 'brouillon');
  assert.equal(DV.etatDevis(d({}), AUJ), 'envoye');
  assert.equal(DV.etatDevis(d({ vuAt: '2026-10-29T10:00:00Z' }), AUJ), 'vu');
  assert.equal(DV.etatDevis(d({ status: 'accepted', validiteJusquau: '2026-01-01' }), AUJ), 'accepte');
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

await dit('devis prérempli (H41, H42) : « maintenance » × 3 → D-2026-0013, valable jusqu’au 29/11, 267,00 € HT, 320,40 € TTC', () => {
  const prestations = [
    { id: 'p1', nom: 'Site vitrine, 5 pages', prixCents: 180_000, unite: 'forfait', etat: 'active' },
    { id: 'p2', nom: 'Maintenance mensuelle', prixCents: 8_900, unite: 'mois', etat: 'active' },
    { id: 'p3', nom: 'Maintenance ancienne', prixCents: 5_000, unite: 'mois', etat: 'archivée' },
  ];
  const trouvee = DV.chercherPrestation('mainténance', prestations);
  assert.equal(trouvee?.id, 'p2', 'sans accent ni casse, et jamais une prestation archivée');
  assert.equal(DV.chercherPrestation('rien de tel', prestations), null);
  const d = DV.devisPrerempli({ prestation: trouvee, quantite: 3, client: { id: 7, nom: 'Atelier Exemple' }, aujourdhui: AUJ, numeros: ['D-2026-0012', 'D-2026-0003', 'D-2025-0099'] });
  assert.equal(d.numero, 'D-2026-0013');
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

console.log('\nL’argent — trésorerie prévisionnelle (H09, MA07)\n');

/* Départ : 1 000,00 € le vendredi 30/10/2026. Flux :
 *   30/10 + 999,00 (aujourd’hui : déjà dans le solde, ignoré) ;
 *   02/11 + 500,00 attendu ; 03/11 − 1 200,00 loyer ; 05/11 + 300,00 incertain (facture en retard) ; 20/11 − 400,00 TVA ;
 *   05/02/2027 − 50,00 (au-delà de 12 semaines : hors horizon).
 * Scénario attendu : 1 000 → 1 500 (02/11) → 300 (03/11) → 600 (05/11) → 200 (20/11). Point bas 200,00 € le 20/11, jamais sous zéro.
 * Scénario prudent (sans les incertains) : 1 000 → 1 500 → 300 → − 100 (20/11). Sous zéro le 20/11, besoin 100,00 €. */
const FLUX = [
  { date: '2026-10-30', montantCents: 99_900, libelle: 'déjà là', certitude: 'attendu' },
  { date: '2026-11-02', montantCents: 50_000, libelle: 'Règlement', certitude: 'attendu' },
  { date: '2026-11-03', montantCents: -120_000, libelle: 'Loyer', certitude: 'attendu' },
  { date: '2026-11-05', montantCents: 30_000, libelle: 'Facture en retard', certitude: 'incertain' },
  { date: '2026-11-20', montantCents: -40_000, libelle: 'TVA', certitude: 'attendu' },
  { date: '2027-02-05', montantCents: -5_000, libelle: 'Lointain', certitude: 'attendu' },
];

await dit('projection attendue : point bas 200,00 € le 20/11, jamais sous zéro ; solde à 12 semaines 200,00 €', () => {
  const p = TR.projeter({ soldeDepartCents: 100_000, aujourdhui: AUJ, flux: FLUX, semaines: 12, scenario: 'attendu' });
  assert.equal(p.jours.length, 84);
  assert.equal(p.jours[0].date, '2026-10-31');
  assert.equal(p.jours.at(-1).date, '2027-01-22');
  const sur = (d: string) => p.jours.find((j: any) => j.date === d).soldeCents;
  assert.deepEqual([sur('2026-11-01'), sur('2026-11-02'), sur('2026-11-03'), sur('2026-11-05'), sur('2026-11-20')], [100_000, 150_000, 30_000, 60_000, 20_000]);
  assert.deepEqual(p.pointBas, { date: '2026-11-20', soldeCents: 20_000 });
  assert.equal(p.sousZeroLe, null);
  assert.equal(p.besoinCents, 0);
  assert.equal(p.soldeFinCents, 20_000);
});

await dit('projection prudente : sans les encaissements incertains — sous zéro le 20/11, besoin de 100,00 €', () => {
  const p = TR.projeter({ soldeDepartCents: 100_000, aujourdhui: AUJ, flux: FLUX, semaines: 12, scenario: 'prudent' });
  assert.deepEqual(p.pointBas, { date: '2026-11-20', soldeCents: -10_000 });
  assert.equal(p.sousZeroLe, '2026-11-20');
  assert.equal(p.besoinCents, 10_000);
});

await dit('clôtures par semaine (du lundi au dimanche) : 1 000,00 / 600,00 / 600,00 / 200,00 €', () => {
  const p = TR.projeter({ soldeDepartCents: 100_000, aujourdhui: AUJ, flux: FLUX, semaines: 12, scenario: 'attendu' });
  const s = TR.parSemaine(p);
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
  // Pour arriver le 20/11, l’ordre est à passer au plus tard le 18/11 (proposition : 2 jours).
  assert.equal(BA.dateLimiteDeLOrdre('2026-11-20'), '2026-11-18');
});

await dit('rapprochement : un encaissement de 1 263,56 € le 07/10 propose la facture réglée le 05/10, pas celle du 01/09', () => {
  const mvt = [{ id: 'm1', montantCents: 126_356, date: '2026-10-07', rapprochement: 'à vérifier' }, { id: 'm2', montantCents: 126_356, date: '2026-10-07', rapprochement: 'rapproché' }];
  const fs = [facture({ id: 'ok', status: 'paid', paidAt: '2026-10-05' }), facture({ id: 'vieux', status: 'paid', paidAt: '2026-09-01' })];
  assert.deepEqual(BA.suggestionsDeRapprochement(mvt, fs).map((s: any) => [s.mouvementId, s.factureId]), [['m1', 'ok']]);
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
    for (const d of m.devis) assert.ok(['brouillon', 'envoye', 'vu', 'accepte', 'refuse', 'expire'].includes(DV.etatDevis(d, auj)), `${nom} devis ${d.id}`);
    const taux = DV.tauxDeTransformation(m.devis, auj);
    assert.ok(taux === null || (taux >= 0 && taux <= 100));
    for (const e of m.enveloppes) {
      const r = BU.etatEnveloppe(e, m.depenses, auj);
      assert.ok(Number.isInteger(r.consommeCents) && Number.isInteger(r.projectionCents) && ['ok', 'attention', 'depasse'].includes(r.etat), `${nom} ${e.id}`);
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
  for (const s of ['brouillon', 'envoyee', 'en-retard', 'partiellement-payee', 'payee', 'annulee']) assert.ok(I.traduire('fr', `facture.${s}`) !== `facture.${s}`);
  for (const s of ['brouillon', 'envoye', 'vu', 'accepte', 'refuse', 'expire']) assert.ok(I.traduire('en', `devis.${s}`));
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

#!/usr/bin/env node
/**
 * LES DONNÉES QUE LES MAQUETTES SUPPOSENT — pour que la comparaison mesure l'écran, pas l'absence de données.
 *
 * Les palettes ⌘K (H41) et ⌘J (G05) ne montrent « menna » ou la relance de la facture F-2041 que si ces
 * fiches existent. Sans elles, la capture affiche un état vide et la comparaison ne dit rien de la mise en
 * page. Ce script ajoute, au jeu d'essai de `scripts/seed-essai.mjs`, une poignée de fiches nommées comme
 * dans les maquettes du lot 00 : tout est inventé, rien ne vient d'une organisation réelle.
 *
 * Il refuse tout compte hors `@exemple.test` et tout hôte hors de cette machine, comme le reste de la chaîne.
 *
 *   AMN_E2E_EMAIL=essai.interne@exemple.test AMN_E2E_PASSWORD=… \
 *     node scripts/qualite/fidelite/graines-maquettes.mjs [--api http://127.0.0.1:4171]
 */
const i = process.argv.indexOf('--api');
const API = (i >= 0 ? process.argv[i + 1] : process.env.AMN_API ?? 'http://127.0.0.1:4171').replace(/\/$/, '');
const EMAIL = process.env.AMN_E2E_EMAIL ?? '';
const MDP = process.env.AMN_E2E_PASSWORD ?? '';

if (!/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(API)) {
  console.error(`REFUS : l'API doit être sur cette machine (127.0.0.1 ou localhost), pas ${API}`);
  process.exit(1);
}
if (!/@exemple\.test$/i.test(EMAIL) || !MDP) {
  console.error('REFUS : il faut AMN_E2E_EMAIL (en @exemple.test) et AMN_E2E_PASSWORD — jamais de compte réel.');
  process.exit(1);
}

const login = await fetch(`${API}/v1/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: EMAIL, password: MDP }) }).then((r) => r.json());
if (!login?.token) {
  console.error('Connexion refusée :', JSON.stringify(login).slice(0, 160));
  process.exit(1);
}
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
let ecrits = 0;
async function poser(collection, id, data) {
  for (let essai = 0; essai < 4; essai += 1) {
    const r = await fetch(`${API}/v1/collections/${collection}/${encodeURIComponent(id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${login.token}` }, body: JSON.stringify({ data }) });
    if (r.ok) { ecrits += 1; return; }
    if (r.status !== 429) { console.error(`  ✗ ${collection}/${id} → ${r.status}`); return; }
    await dormir(2000 * 2 ** essai);
  }
}
const instant = (jours) => new Date(Date.UTC(2026, 9, 30, 9, 0) + jours * 86_400_000).toISOString();
const jour = (iso) => iso.slice(0, 10);

// Des fiches clientes, nommées comme les maquettes.
const CLIENTS = [
  ['9101', 'menna', 'Menna Conseil', 'Conseil et services'],
  ['9102', 'dupont', 'Atelier Dupont', 'Chantiers'],
  ['9103', 'leo', 'Boulangerie Léo', 'Commerce'],
  ['9104', 'medina', 'Medina', 'Conseil et services'],
  ['9105', 'nova', 'Studio Nova', 'Création et agence'],
  ['9106', 'benali', 'Garage Benali', 'Commerce'],
];
// La clé de la fiche EST le numéro du client : c'est ce que la facture lui renvoie (`clientId`).
for (const [cle, court, company, notes] of CLIENTS) {
  await poser('clients', cle, { name: company, company, status: 'active', email: `contact@${court}.exemple.test`, phone: '', notes, imageDataUrl: '', linkedSiteIds: [], createdAt: instant(-60), events: [] });
}

// Les factures en retard de la maquette G05 (v4) : quatre factures, 2 840 € au total, au 30 octobre 2026.
const FACTURES = [
  ['maq-fac-2041', 'F-2041', 9101, 'Menna Conseil', 124_000, '2026-09-26', '2026-10-26'], // 4 jours de retard
  ['maq-fac-2039', 'F-2039', 9105, 'Studio Nova', 40_000, '2026-09-15', '2026-10-15'], // 15 jours
  ['maq-fac-2037', 'F-2037', 9106, 'Garage Benali', 56_000, '2026-09-18', '2026-10-18'], // 12 jours
  ['maq-fac-2033', 'F-2033', 9102, 'Atelier Dupont', 64_000, '2026-09-10', '2026-10-10'], // 20 jours
];
for (const [cle, num, id, nom, cents, emis, echeance] of FACTURES) {
  await poser('invoices', cle, {
    number: num,
    clientId: id,
    billTo: { name: nom, company: nom, email: `contact@${nom.toLowerCase().replace(/[^a-z]+/g, '-')}.exemple.test`, address: '', vatNumber: '' },
    issuedAt: emis,
    dueAt: echeance,
    lines: [{ id: 'l1', label: 'Prestation', quantity: 1, unitPriceCents: cents, vatRate: 0 }],
    status: 'issued',
    paidAt: '',
    paymentMethod: '',
    cancelReason: '',
    notes: '',
    quoteId: null,
  });
}

// Les tâches et le document que la recherche « menna » retrouve (H41).
for (const [cle, title, status, priorite] of [
  ['maq-tac-1', 'Valider le tableau de bord de Menna', 'doing', 'high'],
  ['maq-tac-2', 'Relancer la facture F-2041', 'todo', 'high'],
  ['maq-tac-3', 'Envoyer le devis à la Boulangerie Léo', 'todo', 'normal'],
  ['maq-tac-4', 'Répondre à Medina sur les accès', 'todo', 'normal'],
]) {
  await poser('tasks', cle, { title, detail: '', status, priority: priorite, assigneeEmail: EMAIL, createdAt: instant(-3) });
}
await poser('knowledge', 'maq-doc-menna', { title: 'Contrat de maintenance Menna', body: 'Contrat de maintenance annuel, reconduit tacitement. Exemple fictif.', createdAt: instant(-40) });

console.log(`${ecrits} fiche(s) ajoutée(s) pour ${EMAIL} (clients, quatre factures en retard dont F-2041, tâches, document).`);

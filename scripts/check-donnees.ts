/**
 * Contrôle des JEUX DE DONNÉES FICTIVES — `src/refonte/donnees/`, exercés hors application.
 *
 * Ces jeux servent à construire et tester les écrans de la refonte. Ils ne
 * valent que s'ils sont (1) reproductibles, (2) sans la moindre donnée réelle,
 * (3) cohérents entre eux : une facture payée a son paiement, un client est
 * « Impayé » parce qu'une facture est échue, une série vient des tâches faites.
 *
 *   · même graine, mêmes données ; graine différente, données différentes ;
 *   · « vide » est vide, « beaucoup » dépasse « normal » ; un volume par jeu prime ;
 *   · aucun courriel hors `.exemple.test`, aucun téléphone hors plages fictives,
 *     aucun IBAN, numéro de carte, SIRET ni secret réalistes ;
 *   · toute référence (client, facture, fournisseur, membre…) existe ;
 *   · la numérotation des factures est continue et sans trou ;
 *   · les chiffres se recoupent (statut, solde, santé, points, avancement) ;
 *   · rien n'est daté dans le futur quand cela doit être passé, et inversement.
 *
 *   node --experimental-strip-types scripts/check-donnees.ts
 */

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const here = path.dirname(fileURLToPath(import.meta.url));

async function loadFromSrc<T>(entry: string): Promise<T> {
  const built = await esbuild.build({
    entryPoints: [path.join(here, '..', entry)],
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'neutral',
    target: 'node22',
    charset: 'utf8',
  });
  return (await import(
    `data:text/javascript;charset=utf-8;base64,${Buffer.from(built.outputFiles[0].text, 'utf8').toString('base64')}`
  )) as T;
}

type Lien = Record<string, unknown>;
type ChargeOrg = { id: string; nom: string; effectif: number; taille: string; volume: string; profil: string; proprietaire: string; domaine: string; secteur: string };
type Attendu = any; // eslint-disable-line @typescript-eslint/no-explicit-any -- les attendus sont inspectés champ par champ
type MondeBrut = Record<string, Lien[]> & { contexte: { aujourdhui: string; maintenant: number; aujourdhuiCyber: string; maintenantCyber: number }; entreprise: Lien };
const D = await loadFromSrc<{
  construireMonde: (o?: Record<string, unknown>) => MondeBrut;
  NOMS_DES_JEUX: readonly string[];
  estCourrielFictif: (c: string) => boolean;
  estTelephoneFictif: (t: string) => boolean;
  totauxDeFacture: (f: unknown) => { htCents: number; tvaCents: number; ttcCents: number };
  statutAffiche: (f: unknown, j: string) => string;
  calculerSante: (c: unknown, d: unknown, j: string) => number;
  avancementProjet: (p: unknown, t: unknown) => number;
  statutProjet: (a: number, e: string, j: string, c: boolean) => string;
  journeesDeTravail: (t: unknown, email: string, jusqua: string, n?: number) => { jour: string; bouclee: boolean }[];
  serieEnCours: (j: unknown, aujourdhui: string) => number;
  jourDe: (ms: number) => string;
  heureDe: (ms: number) => string;
  ecartJours: (a: string, b: string) => number;
  etatOrganisation: (score: number, alertes: string[], derniere: string, intervalleH: number, maintenant: number) => string;
  etatAccord: (a: unknown, aujourdhui: string) => string;
  outilDisponible: (o: unknown, accords: unknown[], aujourdhui: string) => boolean;
  quantiteEnStock: (a: unknown) => number;
  scoreMaturite: (c: unknown) => number;
  niveauMaturite: (s: number) => { niveau: number; nom: string };
  niveauConformite: (d: unknown) => string;
  joursSansImpaye: (f: unknown, j: string) => number;
  attendusPrevisions: (m: MondeBrut, o?: Record<string, unknown>) => Attendu;
  serieDesPriorites: (m: MondeBrut, email: string, jour: string) => number;
  attendusBilanSemaine: (m: MondeBrut, o?: Record<string, unknown>) => Attendu;
  attendusCockpit: (m: MondeBrut) => Attendu;
  attendusTableauDeBord: (m: MondeBrut, o?: Record<string, unknown>) => Attendu;
  PALIERS_DE_SERIE: readonly number[];
  calculerNps: (a: unknown) => number | null;
  instantParis: (jour: string, hhmm?: string) => number;
  RAISONS_DE_PERTE: readonly string[];
  genererOrganisationsDeCharge: (o?: { graine?: number; nombre?: number }) => ChargeOrg[];
  choisirConnectees: (o: ChargeOrg[], n: number, graine?: number) => ChargeOrg[];
  emailDuMembre: (o: { domaine: string; effectif: number }, rang: number) => string;
  SEUILS_DE_CHARGE: { partRapide: number; actionRapideMs: number; visibiliteMs: number };
  CIBLE_DE_CHARGE: { organisations: number; connectees: number; internes: number };
  PALIERS_DE_CHARGE: readonly number[];
  ESSAI_LONG_HEURES: number;
  EQUIPE_INTERNE_DE_CHARGE: readonly string[];
  MELANGE_D_ACTIONS: readonly { nom: string; poids: number; ecriture: boolean }[];
}>('src/refonte/donnees/index.ts');

const S2 = await loadFromSrc<{
  serieDeLaJournee: (journees: unknown[], aujourdhui: string) => { serie: number };
  prioritesDeLaCollection: (ligne: unknown, jourDe: (iso: string) => string) => unknown;
}>('src/refonte/journee/serie.ts');

const S8 = {
  deploiements: await loadFromSrc<{
    etatGlobal: (d: unknown) => string;
    dureeTotale: (d: unknown, m?: unknown) => number | null;
    ETAPES: readonly string[];
    CIBLES: readonly string[];
    versionDeRetour: (ds: unknown[], d: unknown) => { id: string } | null;
  }>('src/refonte/developpement/deploiements.ts'),
  journal: await loadFromSrc<{
    executionsDuMois: (j: unknown, maintenant: unknown, fluxId?: string) => number;
    derniereExecution: (j: unknown, fluxId?: string) => { debut: string | number } | null;
    doitSeMettreEnPause: (j: unknown, fluxId: string) => boolean;
    CONSERVATION_JOURS: number;
    LIGNES_MAX: number;
  }>('src/refonte/developpement/journal.ts'),
  planification: await loadFromSrc<{
    precedentPassage: (p: unknown, avant: unknown) => number | null;
    fauteDePlanification: (p: unknown) => string | null;
  }>('src/refonte/developpement/planification.ts'),
};

let vus = 0;
const dit = (nom: string, fn: () => void) => {
  fn();
  vus += 1;
  console.log(`  ✓ ${nom}`);
};

const normal = D.construireMonde({ volume: 'normal' });
const gros = D.construireMonde({ volume: 'beaucoup' });
const peu = D.construireMonde({ volume: 'peu' });
const vide = D.construireMonde({ volume: 'vide' });
// Les avoirs sont dans le monde par défaut (DS les lit) ; `avoirs: false` redonne un monde sans avoir.
const peuAv = peu;
const normalAv = normal;
const grosAv = gros;
const videAv = vide;
const normalSansAv = D.construireMonde({ volume: 'normal', avoirs: false });
const jours = (m: MondeBrut): string => m.contexte.aujourdhui;
const joursCyber = (m: MondeBrut): string => m.contexte.aujourdhuiCyber;
const aujourdhuiDe = jours;
/** Le reste dû d'une facture : TTC − avoirs émis − règlements réussis, jamais négatif ; zéro hors facture envoyée (même règle que DS). */
const resteDuDe = (m: MondeBrut, f: Lien): number =>
  f.status === 'issued'
    ? Math.max(0, D.totauxDeFacture(f).ttcCents - m.avoirs.filter((x) => x.creditNoteFor === f.id).reduce((n, x) => n + D.totauxDeFacture(x).ttcCents, 0) - m.paiements.filter((p) => p.factureId === f.id && p.etat === 'réussi').reduce((n, p) => n + num(p.montantCents), 0))
    : 0;
const estCourrielFictifLocal = (c: string): boolean => /@[a-z0-9.-]+\.exemple\.test$/.test(c);
const str = (x: unknown): string => String(x ?? '');
const num = (x: unknown): number => Number(x);

console.log('Jeux de données fictives\n');

/* ----------------------------- Reproductibilité ----------------------------- */

console.log('Reproductibilité et volumes');
dit('même graine, mêmes données, à l’octet près', () => {
  assert.equal(JSON.stringify(D.construireMonde({ volume: 'normal' })), JSON.stringify(normal));
});
dit('une autre graine donne un autre monde', () => {
  assert.notEqual(JSON.stringify(D.construireMonde({ volume: 'normal', graine: 7 })), JSON.stringify(normal));
});
dit('« vide » est vide (sauf l’équipe : la personne connectée existe toujours)', () => {
  for (const nom of D.NOMS_DES_JEUX) {
    if (nom === 'equipe') assert.equal(vide[nom].length, 1, 'la personne connectée seule');
    else assert.equal(vide[nom].length, 0, `${nom} doit être vide`);
  }
});
dit('« peu » < « normal » < « beaucoup » pour les jeux principaux', () => {
  for (const nom of ['clients', 'factures', 'devis', 'depenses', 'notes', 'rappels', 'tickets', 'projets', 'avis', 'prospects']) {
    assert.ok(peu[nom].length > 0, `${nom} : « peu » n’est pas vide`);
    assert.ok(peu[nom].length < normal[nom].length, `${nom} : peu < normal`);
    assert.ok(normal[nom].length < gros[nom].length, `${nom} : normal < beaucoup`);
  }
  assert.ok(gros.clients.length >= 300 && gros.factures.length >= 600, '« beaucoup » dépasse largement une page d’écran');
});
dit('un volume propre à un jeu prime sur le volume général', () => {
  const m = D.construireMonde({ volume: 'normal', volumes: { clients: 'beaucoup', factures: 'vide' } });
  assert.equal(m.clients.length, gros.clients.length);
  assert.equal(m.factures.length, 0);
  assert.equal(m.paiements.length, 0, 'sans facture, aucun paiement');
});
dit('chaque jeu garde ses tirages quand on change le volume d’un autre', () => {
  const a = D.construireMonde({ volume: 'normal', volumes: { avis: 'vide' } });
  assert.equal(JSON.stringify(a.clients.map((c) => c.name)), JSON.stringify(normal.clients.map((c) => c.name)));
});
dit('la référence est le vendredi 30 octobre 2026, 10 h 42 ; Cyber est au mardi 3 novembre 2026, 10 h 42', () => {
  assert.equal(jours(normal), '2026-10-30');
  assert.equal(D.heureDe(normal.contexte.maintenant), '10:42');
  assert.equal(new Date(`${jours(normal)}T12:00:00Z`).getUTCDay(), 5, 'un vendredi');
  assert.equal(joursCyber(normal), '2026-11-03');
  assert.equal(D.heureDe(normal.contexte.maintenantCyber), '10:42');
  assert.equal(new Date(`${joursCyber(normal)}T12:00:00Z`).getUTCDay(), 2, 'un mardi');
  for (const m of [peu, gros]) assert.deepEqual([jours(m), joursCyber(m)], ['2026-10-30', '2026-11-03']);
});
dit('le bureau est daté du 30 oct. et Cyber du 3 nov. : La Garde n’a rien après le 30, la veille de Cyber tombe le 3', () => {
  const futurBureau = (x: unknown) => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(x) && Date.parse(x) > normal.contexte.maintenant;
  for (const a of normal.alertes) assert.ok(!futurBureau(a.detecteeAt), 'alerte de La Garde datée après le 30 oct.');
  const veille = normal.alertesVeille.filter((a) => a.publieeLe === joursCyber(normal));
  assert.ok(veille.length > 0, 'CY05 : une alerte de veille publiée le 3 nov.');
});
dit('un autre « maintenant » décale tout le monde de façon cohérente, Cyber compris (quatre jours plus tard)', () => {
  const m = D.construireMonde({ volume: 'normal', maintenant: Date.parse('2027-03-12T10:00:00Z') });
  assert.equal(jours(m), '2027-03-12');
  assert.equal(joursCyber(m), '2027-03-16');
  assert.equal(D.heureDe(m.contexte.maintenantCyber), D.heureDe(m.contexte.maintenant));
  assert.ok(m.factures.every((f) => !f.issuedAt || str(f.issuedAt) <= '2027-03-12'));
});

/* ------------------------------ Aucune donnée réelle ------------------------------ */

console.log('\nAucune donnée réelle');
function feuilles(valeur: unknown, chemin: string, sortie: [string, string][]): void {
  if (typeof valeur === 'string') sortie.push([chemin, valeur]);
  else if (Array.isArray(valeur)) valeur.forEach((v, i) => feuilles(v, `${chemin}[${i}]`, sortie));
  else if (valeur && typeof valeur === 'object') for (const [k, v] of Object.entries(valeur)) feuilles(v, chemin ? `${chemin}.${k}` : k, sortie);
}
const textes: [string, string][] = [];
feuilles(gros, '', textes);
dit('tout courriel est en « .exemple.test »', () => {
  const courriels = textes.filter(([, v]) => /@/.test(v) && /^[^\s@]+@[^\s@]+$/.test(v));
  assert.ok(courriels.length > 1000, 'il y en a beaucoup à vérifier');
  const faux = courriels.filter(([, v]) => !D.estCourrielFictif(v));
  assert.deepEqual(faux.slice(0, 5), [], 'courriel hors domaine fictif');
});
dit('tout téléphone vient des plages réservées à la fiction (01 99 00 / 06 39 98)', () => {
  const tels = textes.filter(([c]) => /(^|\.)(phone|telephone)$/.test(c.replace(/\[\d+\]/g, '')));
  assert.ok(tels.length > 500);
  assert.deepEqual(tels.filter(([, v]) => !D.estTelephoneFictif(v)).slice(0, 5), []);
});
dit('toute adresse web est en « .exemple.test »', () => {
  const urls = textes.filter(([, v]) => /^https?:\/\//.test(v));
  assert.ok(urls.length > 100);
  assert.deepEqual(urls.filter(([, v]) => !/^https:\/\/([a-z0-9-]+\.)*exemple\.test(\/|$)/.test(v)).slice(0, 5), []);
});
dit('aucun IBAN, numéro de carte ni SIRET réaliste (les valeurs d’identité sont invalides par construction)', () => {
  const brut = textes.map(([, v]) => v).join('\n');
  assert.equal(/\b[A-Z]{2}\d{2}(?: ?\d{4}){3,}/.test(brut.replace(/FR00 0000 0000 0000 0000 0000 000/g, '')), false, 'IBAN');
  assert.equal(/\b(?:\d[ -]?){13,19}\b/.test(brut.replace(/000 000 000 00012/g, '').replace(/FR00 0000 0000 0000 0000 0000 000/g, '')), false, 'suite de 13 à 19 chiffres');
  const identite = gros.entreprise.identite as Lien;
  assert.match(str(identite.iban), /^FR00 /, 'clé d’IBAN à 00 : toujours invalide');
  assert.match(str(identite.siret), /^000 /, 'un SIREN ne commence jamais par 000');
  for (const c of gros.comptes) assert.match(str(c.ibanFin), /^\d{4}$/, 'seuls 4 chiffres sont gardés');
});
dit('aucun secret : ni clé, ni jeton, ni mot de passe, ni longue chaîne opaque', () => {
  const noms = new Set<string>();
  const cles = (v: unknown, profondeur = 0): void => {
    if (Array.isArray(v)) v.forEach((x) => cles(x, profondeur + 1));
    else if (v && typeof v === 'object') {
      for (const [k, x] of Object.entries(v)) {
        // Le contexte nomme les jeux (dont `secrets`, le coffre-fort de H24) et le conteneur du coffre porte son nom : on contrôle les CHAMPS des enregistrements.
        if (profondeur === 0 && (k === 'contexte' || k === 'secrets')) { if (k === 'secrets') cles(x, profondeur + 1); continue; }
        noms.add(k);
        cles(x, profondeur + 1);
      }
    }
  };
  cles(gros);
  assert.deepEqual([...noms].filter((k) => /secret|token|api[_-]?key|password|motdepasse|^cle(api)?$/i.test(k)), []);
  // Le coffre-fort n'a ni valeur ni clé : un nom, un type, un responsable, des dates, et une valeur toujours masquée.
  for (const s of gros.secrets) {
    assert.equal(s.valeur, '••••••••', 'valeur d’un secret non masquée');
    assert.deepEqual(Object.keys(s).sort(), ['dernierUsageAt', 'id', 'nom', 'renouveleLe', 'responsableEmail', 'type', 'valeur']);
  }
  for (const c of gros.connecteurs) assert.ok(!('cle' in c) && !('secret' in c) && !('jeton' in c), 'un connecteur n’a aucune clé');
  for (const c of gros.sauvegardes) assert.ok(!('chemin' in c) && !('url' in c) && !('bucket' in c), 'une sauvegarde n’a aucun chemin');
  // Seule exception : l'identifiant des priorités du jour, tel que l'application le fabrique (`prio-<courriel en tirets>-<jour>`), lisible et sans rien d'opaque.
  const identifiantDePriorites = /^prio-[a-z0-9-]+-\d{4}-\d{2}-\d{2}(-\d)?$/;
  assert.deepEqual(textes.filter(([, v]) => /[A-Za-z0-9+/_=-]{32,}/.test(v) && !identifiantDePriorites.test(v)).slice(0, 3), [], 'chaîne opaque de 32 caractères ou plus');
  assert.deepEqual(textes.filter(([, v]) => /(sk|pk|rk)_(live|test)_|amn_live_/.test(v)), []);
});
dit('aucune photo ni pièce jointe réelle : les images sont vides', () => {
  assert.ok(gros.depenses.every((d) => str(d.photoDataUrl) === ''));
  assert.ok(gros.clients.every((c) => str(c.imageDataUrl) === ''));
});
dit('le domaine de l’entreprise d’exemple est fictif', () => {
  assert.match(str(gros.equipe[0].email), /@maison-vallon\.exemple\.test$/);
});

/* ------------------------------ Références ------------------------------ */

console.log('\nRéférences : tout ce qui est pointé existe');
const ids = (liste: Lien[], cle = 'id'): Set<unknown> => new Set(liste.map((x) => x[cle]));
dit('les identifiants sont uniques dans chaque jeu', () => {
  for (const nom of D.NOMS_DES_JEUX) {
    if (nom === 'relances' || nom === 'fidelite') continue;
    const l = gros[nom];
    assert.equal(ids(l).size, l.length, `${nom} : identifiants en double`);
  }
  assert.equal(new Set(gros.fidelite.map((f) => f.clientId)).size, gros.fidelite.length);
});
dit('les personnes citées (responsable, assigné, auteur…) sont de l’équipe', () => {
  const emails = new Set(gros.equipe.map((m) => m.email));
  const verifs: [string, string][] = [
    ['taches', 'assigneeEmail'], ['tickets', 'assigneeEmail'], ['clients', 'responsableEmail'], ['prospects', 'responsableEmail'],
    ['factures', 'responsableEmail'], ['depenses', 'auteurEmail'], ['notes', 'authorEmail'], ['rappels', 'pourEmail'], ['habitudes', 'proprietaireEmail'],
  ];
  for (const [jeu, champ] of verifs) assert.deepEqual(gros[jeu].filter((x) => !emails.has(x[champ])).slice(0, 2), [], `${jeu}.${champ}`);
  assert.ok(gros.evenements.every((e) => (e.participants as string[]).every((p) => emails.has(p))), 'participants');
  assert.ok(gros.projets.every((p) => (p.membres as string[]).every((e) => emails.has(e))), 'membres de projet');
});
dit('les clients cités existent (devis, factures, avis, abonnements, contrats, tickets, tâches, rendez-vous)', () => {
  const clients = ids(gros.clients);
  for (const jeu of ['devis', 'factures', 'avis', 'abonnements', 'contrats', 'fidelite']) assert.ok(gros[jeu].every((x) => clients.has(x.clientId)), jeu);
  for (const jeu of ['tickets', 'taches', 'evenements', 'relances']) assert.ok(gros[jeu].every((x) => x.clientId === null || x.clientId === undefined || clients.has(x.clientId)), jeu);
});
dit('les fournisseurs, projets, factures et paiements cités existent', () => {
  assert.ok(gros.achats.every((a) => ids(gros.fournisseurs).has(a.fournisseurId)), 'achats → fournisseurs');
  assert.ok(gros.taches.every((t) => t.projectId === null || ids(gros.projets).has(t.projectId)), 'tâches → projets');
  assert.ok(gros.paiements.every((p) => p.factureId === null || ids(gros.factures).has(p.factureId)), 'paiements → factures');
  assert.ok(gros.factures.every((f) => f.quoteId === null || ids(gros.devis).has(f.quoteId)), 'factures → devis');
  assert.ok(gros.mouvements.every((m) => ids(gros.comptes).has(m.compteId)), 'mouvements → comptes');
  const lien = (type: string, jeu: string) => gros.mouvements.filter((m) => (m.lien as Lien).type === type).every((m) => ids(gros[jeu]).has((m.lien as Lien).id));
  assert.ok(lien('paiement', 'paiements') && lien('depense', 'depenses') && lien('abonnement', 'abonnements') && lien('facture', 'factures'), 'liens des mouvements');
});
dit('un seul « moi » dans l’équipe', () => {
  for (const m of [vide, peu, normal, gros]) assert.equal(m.equipe.filter((x) => x.moi).length, 1);
});

/* ------------------------------ Factures et argent ------------------------------ */

console.log('\nL’argent se recoupe');
const aujourdhui = jours(normal);
dit('numérotation continue sans trou, par année, dans l’ordre d’émission ; les brouillons n’ont pas de numéro', () => {
  const emises = gros.factures.filter((f) => f.status !== 'draft').sort((a, b) => str(a.number).localeCompare(str(b.number)));
  const parAn = new Map<string, number[]>();
  for (const f of emises) {
    const m = /^(\d{4})-(\d{4})$/.exec(str(f.number));
    assert.ok(m, `numéro mal formé : ${str(f.number)}`);
    parAn.set(m[1], [...(parAn.get(m[1]) ?? []), Number(m[2])]);
  }
  for (const [an, suite] of parAn) assert.deepEqual(suite, suite.map((_, i) => i + 1), `trou dans la numérotation de ${an}`);
  assert.ok(gros.factures.filter((f) => f.status === 'draft').every((f) => str(f.number) === '' && str(f.issuedAt) === ''), 'brouillons');
  for (const an of parAn.keys()) {
    const dates = emises.filter((f) => str(f.number).startsWith(`${an}-`)).map((f) => str(f.issuedAt));
    assert.ok(dates.every((d) => d.startsWith(an)), `une facture ${an} n’est pas émise en ${an}`);
  }
  assert.ok(emises.length > 500);
});
dit('chronologie : échéance après émission, paiement après émission, rien de payé dans le futur', () => {
  for (const f of gros.factures.filter((x) => x.status !== 'draft')) {
    assert.ok(str(f.dueAt) >= str(f.issuedAt), 'échéance avant émission');
    assert.ok(str(f.issuedAt) <= aujourdhui, 'émise dans le futur');
    if (f.status === 'paid') assert.ok(str(f.paidAt) >= str(f.issuedAt) && str(f.paidAt) <= aujourdhui, `paiement invalide ${str(f.number)}`);
    else assert.equal(str(f.paidAt), '');
    if (f.status === 'cancelled') assert.ok(str(f.cancelReason).length > 0, 'annulation sans motif');
  }
});
dit('le solde dû vaut le TTC d’une facture envoyée, zéro sinon ; les totaux sont en centimes entiers', () => {
  for (const f of gros.factures) {
    const t = D.totauxDeFacture(f);
    assert.ok(Number.isInteger(t.htCents) && Number.isInteger(t.tvaCents));
    assert.equal(t.ttcCents, t.htCents + t.tvaCents);
    assert.equal(num(f.soldeCents), resteDuDe(gros, f), 'reste dû = TTC − avoirs − règlements');
  }
});
dit('les avoirs : AV-AAAA-NNNN continu, rattachés à une facture du même client, jamais plus grands qu’elle, le reste dû baisse', () => {
  for (const [nom, m] of [['normal', normalAv], ['peu', peuAv], ['beaucoup', grosAv], ['vide', videAv]] as const) {
    const parAn = new Map<string, number[]>();
    const emises = [...m.avoirs].sort((a, b) => str(a.number).localeCompare(str(b.number)));
    for (const a of emises) {
      const mt = /^AV-(\d{4})-(\d{4})$/.exec(str(a.number));
      assert.ok(mt, `${nom} : numéro d’avoir ${str(a.number)}`);
      parAn.set(mt[1], [...(parAn.get(mt[1]) ?? []), Number(mt[2])]);
      assert.equal(a.kind, 'creditNote');
      const origine = m.factures.find((f) => f.id === a.creditNoteFor);
      assert.ok(origine && (origine.status === 'paid' || origine.status === 'issued'), `${nom} : facture d’origine émise`);
      assert.equal(origine.clientId, a.clientId, `${nom} : même client`);
      assert.ok(str(a.issuedAt) >= str(origine.issuedAt) && str(a.issuedAt) <= aujourdhuiDe(m), `${nom} : date de l’avoir`);
      assert.ok(str(a.number).startsWith(`AV-${str(a.issuedAt).slice(0, 4)}-`), `${nom} : l’année du numéro est celle de l’émission`);
      const total = m.avoirs.filter((x) => x.creditNoteFor === origine.id).reduce((n, x) => n + D.totauxDeFacture(x).ttcCents, 0);
      assert.ok(total <= D.totauxDeFacture(origine).ttcCents, `${nom} : un avoir ne dépasse pas sa facture`);
      if (origine.status === 'issued') assert.ok(total < D.totauxDeFacture(origine).ttcCents, `${nom} : sur une facture encore due, l’avoir est partiel`);
      assert.equal(num(a.soldeCents), 0, 'un avoir n’est jamais dû');
    }
    for (const [an, suite] of parAn) assert.deepEqual(suite, suite.map((_, i) => i + 1), `${nom} : trou dans les avoirs de ${an}`);
    assert.equal(new Set([...m.factures, ...m.avoirs].map((f) => f.id)).size, m.factures.length + m.avoirs.length, `${nom} : identifiants uniques`);
    assert.ok(m.factures.every((f) => !f.kind || f.kind === 'invoice'), 'les factures restent des factures');
  }
  assert.ok(normalAv.avoirs.length >= 1 && grosAv.avoirs.length >= 10, 'des avoirs dès « normal »');
  assert.ok(grosAv.avoirs.some((a) => grosAv.factures.find((f) => f.id === a.creditNoteFor)?.status === 'issued') && grosAv.avoirs.some((a) => grosAv.factures.find((f) => f.id === a.creditNoteFor)?.status === 'paid'), 'avoirs sur factures dues et réglées');
  assert.equal(videAv.avoirs.length, 0);
  assert.equal(normalSansAv.avoirs.length, 0, '`avoirs: false` : aucun avoir');
  assert.ok(normalSansAv.factures.every((f) => num(f.soldeCents) === resteDuDe(normalSansAv, f)), '`avoirs: false` : le reste dû ne les compte pas');
  // Avec avoirs, le reste dû, la TVA et les encaissements attendus en tiennent compte (même calcul que les mondes sans avoirs, moins ce que les avoirs reprennent).
  for (const f of grosAv.factures) assert.equal(num(f.soldeCents), resteDuDe(grosAv, f), 'reste dû = TTC − avoirs − règlements');
  for (const x of grosAv.mouvements.filter((y) => y.nature === 'Encaissement attendu')) {
    const f = grosAv.factures.find((y) => y.id === (x.lien as Lien).id);
    assert.equal(num(x.montantCents), num(f?.soldeCents), 'l’encaissement attendu est le reste dû');
  }
});
dit('le statut « En retard » se déduit (envoyée + échéance passée) ; il y en a, mais peu', () => {
  const retard = gros.factures.filter((f) => D.statutAffiche(f, aujourdhui) === 'En retard');
  assert.ok(retard.length >= 10, 'MA04 a besoin d’impayés à montrer');
  assert.ok(retard.length < gros.factures.length * 0.2, 'trop d’impayés pour être plausible');
  assert.ok(retard.every((f) => f.status === 'issued' && str(f.dueAt) < aujourdhui));
  const normalRetard = normal.factures.filter((f) => D.statutAffiche(f, aujourdhui) === 'En retard').length;
  assert.ok(normalRetard >= 2, `au volume « normal », il faut au moins 2 impayés (${normalRetard})`);
});
dit('un devis accepté donne au plus une facture, émise après l’acceptation ; son règlement suit celle de la facture', () => {
  const parDevis = new Map<unknown, Lien[]>();
  for (const f of gros.factures.filter((x) => x.quoteId !== null)) parDevis.set(f.quoteId, [...(parDevis.get(f.quoteId) ?? []), f]);
  for (const [id, fs] of parDevis) {
    assert.equal(fs.length, 1, `devis ${id} facturé plusieurs fois`);
    const d = gros.devis.find((x) => x.id === id) as Lien;
    assert.equal(d.status, 'accepted', 'un devis non accepté ne se facture pas');
    assert.ok(str(fs[0].issuedAt) > str(d.acceptéLe), 'facture avant acceptation');
    const attendu = fs[0].status === 'paid' ? 'paid' : fs[0].status === 'issued' ? (str(fs[0].dueAt) < aujourdhui ? 'late' : 'pending') : 'unpaid';
    assert.equal(d.paymentStatus, attendu);
  }
  assert.ok(parDevis.size > 50);
});
dit('chaque paiement correspond à une facture réglée (ou en attente sur une facture due), au même montant', () => {
  for (const p of gros.paiements) {
    const f = gros.factures.find((x) => x.id === p.factureId) as Lien;
    assert.ok(f, 'paiement sans facture');
    // Un règlement partiel est un règlement réussi, plus petit que la facture, sur une facture encore envoyée.
    const partiel = p.etat === 'réussi' && f.status === 'issued';
    if (partiel) assert.ok(num(p.montantCents) > 0 && num(p.montantCents) < D.totauxDeFacture(f).ttcCents, 'règlement partiel : plus petit que la facture');
    else assert.equal(num(p.montantCents), D.totauxDeFacture(f).ttcCents, 'montant du paiement ≠ TTC de la facture');
    if (p.etat === 'réussi' && !partiel) assert.equal(f.status, 'paid');
    if (p.etat === 'remboursé') assert.equal(f.status, 'paid');
    if (p.etat === 'en attente') assert.equal(f.status, 'issued');
    assert.ok(str(p.date).slice(0, 10) <= aujourdhui, 'paiement dans le futur');
    assert.ok(num(p.fraisCents) >= 0 && (p.moyen === 'carte' || num(p.fraisCents) === 0), 'frais hors carte');
  }
  const reussies = new Set(gros.paiements.filter((p) => (p.etat === 'réussi' && gros.factures.find((f) => f.id === p.factureId)?.status === 'paid') || p.etat === 'remboursé').map((p) => p.factureId));
  const payees = gros.factures.filter((f) => f.status === 'paid');
  const complet = D.construireMonde({ volume: 'normal', volumes: { paiements: 'beaucoup' } });
  const c2 = new Set(complet.paiements.filter((p) => p.etat === 'réussi' || p.etat === 'remboursé').map((p) => p.factureId));
  // Des règlements partiels existent, sans jamais solder la facture ; deux règlements sur une même facture ne dépassent pas son TTC.
  const partiels = gros.paiements.filter((p) => p.etat === 'réussi' && gros.factures.find((f) => f.id === p.factureId)?.status === 'issued');
  assert.ok(partiels.length >= 5 && normal.paiements.some((p) => p.etat === 'réussi' && normal.factures.find((f) => f.id === p.factureId)?.status === 'issued'), 'des règlements partiels dès « normal »');
  for (const f of gros.factures.filter((x) => x.status === 'issued')) assert.ok(gros.paiements.filter((p) => p.factureId === f.id && p.etat === 'réussi').reduce((n, p) => n + num(p.montantCents), 0) < D.totauxDeFacture(f).ttcCents, 'un règlement partiel ne solde pas la facture');
  assert.ok(complet.factures.filter((f) => f.status === 'paid').every((f) => c2.has(f.id)), 'une facture payée sans paiement');
  assert.ok(reussies.size > 0 && payees.length > 0);
});
dit('les mouvements bancaires : réels dans le passé, prévus dans le futur, entrées positives pour les règlements', () => {
  for (const m of gros.mouvements) {
    if (m.reel) assert.ok(str(m.date) <= aujourdhui, `mouvement réel futur ${str(m.libelle)}`);
    else assert.ok(str(m.date) >= aujourdhui, `mouvement prévu passé ${str(m.libelle)}`);
    assert.ok(Number.isInteger(num(m.montantCents)) && num(m.montantCents) !== 0);
    const type = (m.lien as Lien).type;
    if (type === 'paiement' || type === 'facture' || type === 'abonnement') assert.ok(num(m.montantCents) > 0, 'une entrée est positive');
    if (type === 'depense') assert.ok(num(m.montantCents) < 0, 'une dépense est négative');
  }
  assert.ok(gros.mouvements.some((m) => !m.reel) && gros.mouvements.some((m) => m.reel));
  assert.ok(gros.comptes.every((c) => Number.isInteger(num(c.soldeCents)) && num(c.soldeCents) > 0));
});
dit('dépenses : TVA < montant, justificatif cohérent, plus d’« à justifier » au dernier mois', () => {
  for (const d of gros.depenses) {
    assert.ok(num(d.tvaCents) > 0 && num(d.tvaCents) < num(d.amountCents));
    const j = d.justificatif as Lien;
    assert.equal(j.statut === 'justifié', j.fichier !== null);
    assert.ok(str(d.spentAt) <= aujourdhui);
  }
  const recent = gros.depenses.filter((d) => str(d.spentAt) >= '2026-10-01');
  assert.ok(recent.some((d) => (d.justificatif as Lien).statut === 'à justifier'), 'H08 « Reste à justifier » a besoin d’en voir');
});
dit('enveloppes : le budget mensuel de l’entreprise en est la somme', () => {
  const total = normal.enveloppes.reduce((s, e) => s + num(e.prevuCents), 0);
  assert.equal(num((normal.entreprise.reglages as Lien).budgetMensuelDepensesCents), total);
  assert.ok(normal.enveloppes.every((e) => num(e.prevuCents) >= 5000));
});
dit('abonnements : prochain prélèvement dans le futur pour ceux qui sont actifs, aucun pour les résiliés', () => {
  for (const a of gros.abonnements) {
    if (a.etat === 'Actif' || a.etat === 'Paiement échoué') assert.ok(str(a.prochainPrelevementLe) > aujourdhui);
    else assert.equal(a.prochainPrelevementLe, null);
    assert.equal(a.etat === 'Résilié', a.resilieLe !== null);
  }
});
dit('contrats : l’état suit l’échéance', () => {
  for (const c of gros.contrats.filter((x) => x.etat !== 'Résilié')) {
    const reste = D.ecartJours(aujourdhui, str(c.echeanceLe));
    const attendu = reste < 0 ? 'Expiré' : reste <= 60 ? 'À renouveler' : 'En cours';
    assert.equal(c.etat, attendu, `${str(c.nom)} : ${reste} jours`);
  }
});

/* ------------------------------ Contacts ------------------------------ */

console.log('\nContacts');
dit('la santé est entre 0 et 100 et se recalcule avec la formule de la fiche H05', () => {
  const donnees = { factures: gros.factures, devis: gros.devis, avis: gros.avis };
  for (const c of gros.clients) {
    assert.ok(num(c.sante) >= 0 && num(c.sante) <= 100);
    assert.equal(D.calculerSante(c, donnees, jours(gros)), c.sante);
  }
  const sante = gros.clients.map((c) => num(c.sante));
  assert.ok(sante.some((s) => s >= 70) && sante.some((s) => s >= 45 && s < 70) && sante.some((s) => s < 45), 'vert, orange et rouge doivent exister (H05)');
});
dit('statut des clients (H05) : Impayé > 7 jours d’échéance, À relancer, Nouveau < 30 jours, Actif — dans cet ordre', () => {
  const regle = (m: MondeBrut, c: Lien): string => {
    const echues = m.factures.filter((f) => f.clientId === c.id && f.status === 'issued' && str(f.dueAt) < jours(m)).map((f) => D.ecartJours(str(f.dueAt), jours(m)));
    const depuis = D.ecartJours(D.jourDe(Date.parse(str(c.dernierEchangeAt))), jours(m));
    if (echues.some((e) => e > 7)) return 'Impayé';
    if (echues.length > 0 || depuis > 5 || num(c.sante) < 45) return 'À relancer';
    return D.ecartJours(str(c.debutLe), jours(m)) < 30 ? 'Nouveau' : 'Actif';
  };
  for (const m of [normal, peu, gros]) for (const c of m.clients) assert.equal(c.statutAffiche, regle(m, c), `client ${str(c.id)}`);
  assert.deepEqual([...new Set(gros.clients.map((c) => c.statutAffiche))].sort(), ['Actif', 'Impayé', 'Nouveau', 'À relancer']);
  assert.equal(D.ecartJours('2026-10-01', '2026-10-30') < 30, true, 'repère : 29 jours = encore nouveau');
  assert.equal(D.ecartJours('2026-09-30', '2026-10-30') < 30, false, 'repère : 30 jours = plus nouveau');
});
dit('le dernier échange n’est jamais dans le futur ni avant le début de la relation', () => {
  for (const c of gros.clients) {
    assert.ok(Date.parse(str(c.dernierEchangeAt)) <= gros.contexte.maintenant, 'échange futur');
    assert.ok(str(c.debutLe) <= jours(gros));
    assert.equal((c.events as Lien[]).length >= 2, true);
  }
});
dit('prospects : probabilité selon l’étape, signatures du mois, montants entiers', () => {
  const proba: Record<string, number> = { nouveau: 10, contacté: 25, 'rendez-vous': 45, 'devis envoyé': 70, gagné: 100, perdu: 0 };
  for (const p of gros.prospects) {
    assert.equal(p.probabilite, proba[str(p.etape)]);
    assert.equal(p.etape === 'gagné', p.signeLe !== null);
    assert.equal(p.etape === 'perdu', p.perduLe !== null);
    if (p.montantCents !== null) assert.ok(Number.isInteger(num(p.montantCents)) && num(p.montantCents) > 0);
  }
  const duMois = normal.prospects.filter((p) => p.signeLe && str(p.signeLe).slice(0, 7) === jours(normal).slice(0, 7));
  assert.ok(duMois.length >= 1, 'H06 « Gagné ce mois » ne doit pas être vide au volume normal');
  assert.ok(new Set(normal.prospects.map((p) => p.etape)).size >= 5, 'toutes les colonnes du pipeline sont représentées');
});
dit('avis : notes de 1 à 5, dates passées, ordre du plus récent au plus ancien', () => {
  for (const a of gros.avis) assert.ok(num(a.noteSur5) >= 1 && num(a.noteSur5) <= 5 && str(a.date) <= jours(gros));
  const dates = gros.avis.map((a) => str(a.date));
  assert.deepEqual(dates, [...dates].sort().reverse());
});
dit('achats : réception après commande, jamais dans le futur ; total = quantité × prix unitaire', () => {
  for (const a of gros.achats) {
    assert.equal(num(a.totalCents), num(a.quantite) * num(a.prixUnitaireCents));
    if (a.recuLe) assert.ok(str(a.recuLe) >= str(a.commandeLe) && str(a.recuLe) <= jours(gros));
  }
});
dit('relances : chacune pointe un objet réellement en retard ; tri par montant décroissant', () => {
  const retard = new Set(gros.factures.filter((f) => D.statutAffiche(f, jours(gros)) === 'En retard').map((f) => f.id));
  for (const r of gros.relances.filter((x) => x.motif === 'facture')) assert.ok(retard.has(r.objetId), 'relance d’une facture qui n’est pas en retard');
  const montants = gros.relances.map((r) => (r.montantCents === null ? -1 : num(r.montantCents)));
  assert.deepEqual(montants, [...montants].sort((a, b) => b - a));
  assert.ok(new Set(gros.relances.map((r) => r.motif)).size >= 3, 'plusieurs motifs');
});
dit('fidélité (MC02) : 1 point par euro payé, 50 par avis, 200 par recommandation, sur 12 mois ; Bronze < 800 ≤ Argent < 1 800 ≤ Or', () => {
  for (const [nom, m] of [['normal', normal], ['peu', peu], ['beaucoup', gros]] as const) {
    const depuis = `${Number(jours(m).slice(0, 4)) - 1}${jours(m).slice(4)}`;
    const dans = (j: string): boolean => j >= depuis && j <= jours(m);
    for (const f of m.fidelite) {
      const euros = m.factures.filter((x) => x.clientId === f.clientId && x.status === 'paid' && dans(str(x.paidAt))).reduce((s, x) => s + Math.floor(D.totauxDeFacture(x).ttcCents / 100), 0);
      const avis = m.avis.filter((a) => a.clientId === f.clientId && dans(str(a.date))).length;
      const reco = (f.recommandations as string[]).filter(dans).length;
      assert.equal((f.recommandations as string[]).length, reco, `${nom} : recommandations dans l’année`);
      assert.equal(f.points, euros + avis * 50 + reco * 200, `${nom} : points de ${str(f.clientNom)}`);
      assert.equal(f.niveau, num(f.points) >= 1800 ? 'Or' : num(f.points) >= 800 ? 'Argent' : 'Bronze', `${nom} : niveau`);
      assert.ok(num(f.points) > 0 && str(f.derniereActiviteLe) <= jours(m), `${nom} : activité`);
    }
  }
  assert.deepEqual([...new Set(normal.fidelite.map((f) => f.niveau))].sort(), ['Argent', 'Bronze', 'Or'], 'normal : les trois paliers');
  assert.ok(gros.fidelite.some((f) => (f.recommandations as string[]).length > 0) && gros.avis.length > 0, 'des recommandations');
});

/* ------------------------------ Ma journée ------------------------------ */

console.log('\nMa journée');
const moiEmail = str(normal.equipe.find((m) => m.moi)?.email);
dit('aujourd’hui : des tâches faites ce matin, d’autres à faire, et des tâches en retard', () => {
  const duJour = normal.taches.filter((t) => t.echeance === aujourdhui && t.assigneeEmail === moiEmail);
  assert.ok(duJour.length >= 3, `tâches du jour : ${duJour.length}`);
  assert.ok(duJour.some((t) => t.status === 'done') && duJour.some((t) => t.status !== 'done'));
  assert.ok(normal.taches.some((t) => t.status !== 'done' && str(t.echeance) < aujourdhui && t.assigneeEmail === moiEmail), 'H02 « En retard »');
});
dit('une tâche faite a une date de fin passée ; une tâche à faire n’en a pas', () => {
  for (const t of gros.taches) {
    if (t.status === 'done') {
      assert.ok(t.faiteAt && Date.parse(str(t.faiteAt)) <= gros.contexte.maintenant, `tâche faite dans le futur : ${str(t.title)}`);
      assert.ok((t.sousTaches as { done: boolean }[]).every((s) => s.done), 'sous-tâche ouverte sur une tâche faite');
    } else assert.equal(t.faiteAt, null);
  }
});
dit('la série vient des tâches : calculée, positive au volume normal, nulle sans tâche', () => {
  const j = D.journeesDeTravail(normal.taches, moiEmail, aujourdhui, 90);
  assert.ok(j.length > 20);
  const serie = D.serieEnCours(j, aujourdhui);
  assert.ok(serie >= 0 && serie <= j.length);
  assert.ok(j.some((x) => x.bouclee) && j.some((x) => !x.bouclee), 'des journées bouclées et d’autres non');
  assert.equal(D.serieEnCours(D.journeesDeTravail(vide.taches, moiEmail, aujourdhui), aujourdhui), 0);
  const rompue = D.serieEnCours([{ jour: '2026-10-29', bouclee: false }, { jour: '2026-10-28', bouclee: true }] as never, aujourdhui);
  assert.equal(rompue, 0, 'une journée non bouclée rompt la série');
});
dit('projets : le statut suit l’avancement et l’échéance (règle de MJ01) ; chaque statut existe', () => {
  for (const p of gros.projets) {
    const liees = gros.taches.filter((t) => t.projectId === p.id);
    const av = D.avancementProjet(p, gros.taches);
    assert.equal(p.status, D.statutProjet(av, str(p.deadline), jours(gros), liees.some((t) => t.status !== 'todo')));
  }
  assert.deepEqual([...new Set(gros.projets.map((p) => p.status))].sort(), ['En cours', 'En retard', 'Presque fini', 'Terminé', 'À démarrer']);
  assert.ok(normal.projets.some((p) => p.status === 'En retard'), 'MJ01 montre un projet en retard');
});
dit('événements : fin = début + durée, rendez-vous manqués annulés, rondes marquées « système »', () => {
  for (const e of gros.evenements) {
    assert.equal(Date.parse(str(e.endAt)) - Date.parse(str(e.startAt)), num(e.durationMin) * 60_000);
    if (e.confirmation === 'manqué') assert.equal(e.status, 'cancelled');
    if (e.type === 'système') assert.equal(e.systeme, true);
    else assert.equal(e.systeme, false);
    if (e.status === 'done') assert.ok(Date.parse(str(e.endAt)) <= gros.contexte.maintenant);
    if (e.status === 'scheduled') assert.ok(Date.parse(str(e.endAt)) > gros.contexte.maintenant, `événement passé encore « prévu » : ${str(e.title)}`);
  }
  const duJour = normal.evenements.filter((e) => D.jourDe(Date.parse(str(e.startAt))) === aujourdhui);
  assert.ok(duJour.length >= 3 && duJour.some((e) => e.systeme) && duJour.some((e) => e.status === 'done') && duJour.some((e) => e.status === 'scheduled'), 'la journée type : passé, à venir, ronde');
});
dit('tickets : un seul rang par colonne, aucun urgent terminé, des urgents ouverts, des tickets partagés', () => {
  const vus = new Set<string>();
  for (const t of gros.tickets) {
    const cle = `${str(t.colonne)}:${num(t.ordre)}`;
    assert.ok(!vus.has(cle), `rang en double ${cle}`);
    vus.add(cle);
    if (t.colonne === 'termine') { assert.equal(t.urgent, false); assert.ok(t.termineLe); }
    else assert.equal(t.termineLe, null);
    const s = t.sousTaches as { faites: number; total: number };
    assert.ok(s.faites <= s.total);
  }
  assert.ok(normal.tickets.some((t) => t.urgent) && normal.tickets.some((t) => t.partageClient));
  assert.ok(new Set(normal.tickets.map((t) => t.colonne)).size === 4, 'les quatre colonnes sont remplies');
});
dit('rappels : un en retard, des à venir, des faits ; ceux liés à une facture pointent une facture en retard', () => {
  const retard = normal.rappels.filter((r) => !r.fait && Date.parse(str(r.quandAt)) < normal.contexte.maintenant);
  assert.ok(retard.length >= 1 && normal.rappels.some((r) => !r.fait && Date.parse(str(r.quandAt)) > normal.contexte.maintenant) && normal.rappels.some((r) => r.fait));
  for (const r of gros.rappels) {
    if (r.fait) assert.ok(Date.parse(str(r.faitAt)) <= gros.contexte.maintenant, 'rappel fait dans le futur');
    const lien = r.lien as Lien;
    if (lien.type === 'facture') assert.equal(D.statutAffiche(gros.factures.find((f) => f.id === lien.id), jours(gros)), 'En retard');
  }
});
dit('notes : titre non vide, les épinglées sont plusieurs, une note d’équipe a un auteur de l’équipe', () => {
  assert.ok(gros.notes.every((n) => str(n.title).length > 0 && str(n.body).length > 0));
  assert.ok(gros.notes.filter((n) => n.pinned).length >= 3);
  assert.ok(gros.notes.every((n, i, l) => i === 0 || str(l[i - 1].updatedAt) >= str(n.updatedAt)), 'tri : modification la plus récente d’abord');
});
dit('habitudes : historique daté d’aujourd’hui au plus tard, après le début ; valeurs en entiers positifs', () => {
  for (const h of gros.habitudes) {
    for (const [jour, v] of Object.entries(h.historique as Record<string, number>)) {
      assert.ok(jour <= jours(gros) && jour >= str(h.debut), `${str(h.nom)} : ${jour}`);
      assert.ok(Number.isInteger(v) && v > 0);
    }
  }
  assert.ok(gros.habitudes.length >= 8);
});

dit('le français est correct : élision après « de », pas de modèle non remplacé, pas de double espace', () => {
  const titres = [...gros.taches.map((t) => str(t.title)), ...gros.notes.flatMap((n) => [str(n.title), str(n.body)]), ...gros.projets.map((p) => str(p.title)), ...gros.evenements.map((e) => str(e.title)), ...gros.relances.map((r) => str(r.message))];
  assert.deepEqual(titres.filter((t) => /\bde [AEIOUYÀÂÉÈÊÎÔÛ]/.test(t)).slice(0, 3), [], 'il manque une élision');
  assert.deepEqual(titres.filter((t) => /[{}]/.test(t) || / {2}/.test(t) || /undefined|null|NaN/.test(t)).slice(0, 3), [], 'modèle mal rempli');
  for (const [, v] of textes) assert.ok(!/undefined|NaN|\[object/.test(v), `valeur mal formée : ${v.slice(0, 40)}`);
});

/* ------------------------------ Équipe ------------------------------ */

console.log('\nÉquipe et entreprise');
dit('les six personnes écrites à la main sont stables ; la dirigeante est « moi »', () => {
  const six = normal.equipe.map((m) => m.nomComplet);
  assert.deepEqual(six, ['Camille Roux', 'Hugo Marchand', 'Nadia Bensalah', 'Léa Dubois', 'Yanis Garcia', 'Inès Traoré']);
  assert.equal(normal.equipe[0].moi, true);
  assert.equal(gros.equipe.length, 24);
  assert.equal(new Set(gros.equipe.map((m) => m.email)).size, 24, 'courriels uniques');
});
dit('l’astreinte est une personne de l’équipe ; le taux de TVA par défaut est 20 %', () => {
  const r = normal.entreprise.reglages as Lien;
  assert.ok(normal.equipe.some((m) => m.email === r.astreinteEmail));
  assert.equal((r.tauxTva as number[])[0], 20);
});

/* ------------------------------ Autres graines, autres volumes ------------------------------ */

console.log('\nPlusieurs graines et tous les volumes');

/** Les invariants qui ne doivent JAMAIS dépendre du tirage : une violation ne se voit parfois qu'avec une graine. */
function invariants(m: MondeBrut, nom: string): void {
  const auj = jours(m);
  const maintenant = m.contexte.maintenant;
  const clients = ids(m.clients);
  const emails = new Set(m.equipe.map((x) => x.email));
  // Références
  for (const jeu of ['devis', 'factures', 'avis', 'abonnements', 'contrats', 'fidelite']) assert.ok(m[jeu].every((x) => clients.has(x.clientId)), `${nom} : ${jeu} → client`);
  assert.ok(m.paiements.every((p) => ids(m.factures).has(p.factureId)), `${nom} : paiement → facture`);
  assert.ok(m.taches.every((t) => emails.has(t.assigneeEmail)), `${nom} : tâche → membre`);
  // Factures : numérotation, chronologie, solde
  const parAn = new Map<string, number[]>();
  for (const f of m.factures) {
    assert.equal(num(f.soldeCents), resteDuDe(m, f), `${nom} : solde`);
    if (f.status === 'draft') { assert.equal(str(f.number), ''); continue; }
    assert.ok(str(f.dueAt) >= str(f.issuedAt) && str(f.issuedAt) <= auj, `${nom} : dates ${str(f.number)}`);
    if (f.status === 'paid') assert.ok(str(f.paidAt) >= str(f.issuedAt) && str(f.paidAt) <= auj, `${nom} : paiement ${str(f.number)}`);
    const mt = /^(\d{4})-(\d{4})$/.exec(str(f.number));
    assert.ok(mt, `${nom} : numéro ${str(f.number)}`);
    parAn.set(mt[1], [...(parAn.get(mt[1]) ?? []), Number(mt[2])]);
  }
  for (const [an, suite] of parAn) assert.deepEqual([...suite].sort((a, b) => a - b), suite.map((_, i) => i + 1), `${nom} : trou en ${an}`);
  for (const p of m.paiements) {
    const f = m.factures.find((x) => x.id === p.factureId) as Lien;
    const ttc = D.totauxDeFacture(f).ttcCents;
    // Un règlement réussi sur une facture encore envoyée est partiel : strictement sous le TTC.
    if (p.etat === 'réussi' && f.status === 'issued') assert.ok(num(p.montantCents) > 0 && num(p.montantCents) < ttc, `${nom} : règlement partiel`);
    else assert.equal(num(p.montantCents), ttc, `${nom} : montant du paiement`);
  }
  // Passé et futur
  for (const t of m.taches) if (t.status === 'done') assert.ok(Date.parse(str(t.faiteAt)) <= maintenant, `${nom} : tâche faite dans le futur`);
  for (const r of m.rappels) if (r.fait) assert.ok(Date.parse(str(r.faitAt)) <= maintenant, `${nom} : rappel fait dans le futur`);
  for (const e of m.evenements) {
    if (e.status === 'scheduled') assert.ok(Date.parse(str(e.endAt)) > maintenant, `${nom} : événement passé « prévu »`);
    if (e.status === 'done') assert.ok(Date.parse(str(e.endAt)) <= maintenant, `${nom} : événement futur « fait »`);
  }
  for (const mv of m.mouvements) assert.ok(mv.reel ? str(mv.date) <= auj : str(mv.date) >= auj, `${nom} : mouvement ${mv.reel ? 'réel futur' : 'prévu passé'}`);
  for (const d of m.depenses) assert.ok(str(d.spentAt) <= auj && num(d.tvaCents) < num(d.amountCents), `${nom} : dépense`);
  // Clients : statut et santé
  const donnees = { factures: m.factures, devis: m.devis, avis: m.avis };
  for (const c of m.clients) {
    assert.equal(D.calculerSante(c, donnees, auj), c.sante, `${nom} : santé`);
    const impaye = m.factures.some((f) => f.clientId === c.id && f.status === 'issued' && D.ecartJours(str(f.dueAt), auj) > 7);
    assert.equal(c.statutAffiche === 'Impayé', impaye, `${nom} : statut Impayé (échue depuis plus de 7 jours)`);
    assert.ok(Date.parse(str(c.dernierEchangeAt)) <= maintenant, `${nom} : échange futur`);
  }
  // Projets
  for (const p of m.projets) {
    const liees = m.taches.filter((t) => t.projectId === p.id);
    assert.equal(p.status, D.statutProjet(D.avancementProjet(p, m.taches), str(p.deadline), auj, liees.some((t) => t.status !== 'todo')), `${nom} : statut de projet`);
  }
  // Tickets
  assert.ok(m.tickets.every((t) => !(t.urgent && t.colonne === 'termine')), `${nom} : urgent terminé`);
  assert.equal(new Set(m.tickets.map((t) => `${str(t.colonne)}:${num(t.ordre)}`)).size, m.tickets.length, `${nom} : rang en double`);
}

dit('les invariants tiennent pour 12 graines, aux volumes « peu » et « normal »', () => {
  for (let graine = 1; graine <= 12; graine += 1) for (const volume of ['peu', 'normal'] as const) invariants(D.construireMonde({ graine, volume }), `graine ${graine}, ${volume}`);
});
dit('… et pour 4 graines au volume « beaucoup »', () => {
  for (const graine of [101, 202, 303, 404]) invariants(D.construireMonde({ graine, volume: 'beaucoup' }), `graine ${graine}, beaucoup`);
});
dit('… et à d’autres dates de référence (hiver, été, changement d’heure)', () => {
  for (const jour of ['2026-03-29T10:00:00Z', '2026-07-14T09:00:00Z', '2026-10-25T11:30:00Z', '2027-01-04T08:00:00Z']) invariants(D.construireMonde({ volume: 'normal', maintenant: Date.parse(jour) }), `date ${jour}`);
});
dit('chaque volume montre les cas que les écrans attendent (au moins un impayé, un projet en retard…) dès « peu » ou « normal »', () => {
  for (let graine = 1; graine <= 12; graine += 1) {
    const p = D.construireMonde({ graine, volume: 'peu' });
    const n = D.construireMonde({ graine, volume: 'normal' });
    const auj = jours(n);
    const nom = `graine ${graine}`;
    assert.ok(p.factures.some((f) => D.statutAffiche(f, auj) === 'En retard'), `${nom}, peu : aucun impayé`);
    assert.ok(n.factures.filter((f) => D.statutAffiche(f, auj) === 'En retard').length >= 2, `${nom}, normal : moins de 2 impayés`);
    for (const statut of ['Brouillon', 'Envoyée', 'Payée', 'Annulée']) assert.ok(n.factures.some((f) => D.statutAffiche(f, auj) === statut), `${nom}, normal : aucune facture « ${statut} »`);
    assert.ok(p.taches.some((t) => t.echeance === auj) && p.evenements.some((e) => D.jourDe(Date.parse(str(e.startAt))) === auj), `${nom}, peu : rien aujourd’hui`);
    assert.ok(n.taches.some((t) => t.status !== 'done' && str(t.echeance) < auj), `${nom}, normal : aucune tâche en retard`);
    assert.ok(n.rappels.some((r) => !r.fait && Date.parse(str(r.quandAt)) < n.contexte.maintenant), `${nom}, normal : aucun rappel en retard`);
    assert.ok(new Set(n.clients.map((c) => c.statutAffiche)).size === 4, `${nom}, normal : les quatre statuts de client`);
    assert.equal(new Set(n.fidelite.map((f) => f.niveau)).size, 3, `${nom}, normal : les trois paliers de fidélité`);
    assert.ok(n.relances.length >= 3, `${nom}, normal : trop peu de relances`);
    assert.ok(n.paiements.some((p) => p.etat === 'réussi' && str(p.date).slice(0, 10) === auj), `${nom}, normal : rien d’encaissé aujourd’hui (N01)`);
  }
});


/* ============================ La suite : Écrire, Échanger, Créer, Outils, La Garde, Cyber ============================ */

console.log('\nLa suite');

const OUTILS_REELS = /\b(nmap|metasploit|burp|wireshark|kali|shodan|maltego|hydra|sqlmap|nessus|openvas|mimikatz|cobalt ?strike|hashcat|aircrack|nikto|john the ripper|zaproxy|gophish|virustotal|splunk|crowdstrike|palo alto|fortinet|cisco)\b/i;
const IPV4 = /\b(?:\d{1,3}\.){3}\d{1,3}\b/;

dit('chaque nouveau jeu existe, vide au volume « vide », rempli aux autres', () => {
  const suite = D.NOMS_DES_JEUX.slice(D.NOMS_DES_JEUX.indexOf('echeancesFiscales'));
  assert.ok(suite.length >= 60, `${suite.length} jeux dans la suite`);
  for (const nom of suite) {
    assert.equal(vide[nom].length, 0, `${nom} doit être vide`);
    assert.ok(gros[nom].length > 0, `${nom} : « beaucoup » est vide`);
    assert.ok(normal[nom].length > 0, `${nom} : « normal » est vide`);
    assert.ok(peu[nom].length > 0 || ['trackers', 'unites'].includes(nom), `${nom} : « peu » est vide`);
  }
});

dit('aucun nom d’outil de sécurité réel, aucune adresse IP, aucun vrai identifiant de faille', () => {
  const brut = textes.map(([, v]) => v).join('\n');
  assert.equal(OUTILS_REELS.test(brut), false, `nom d’outil réel : ${OUTILS_REELS.exec(brut)?.[0]}`);
  assert.equal(IPV4.test(brut.replace(/\b\d+\.\d+\.\d+\b/g, '')), false, 'adresse IP');
  assert.equal(/CVE-\d{4}-\d+/i.test(brut), false, 'identifiant CVE réel');
  for (const v of [...gros.vulnerabilites, ...gros.alertesVeille]) assert.match(str(v.idFictif), /^FICT-\d{4}-\d{4}$/);
  assert.equal(new Set([...gros.vulnerabilites, ...gros.alertesVeille].map((v) => v.idFictif)).size, gros.vulnerabilites.length + gros.alertesVeille.length, 'identifiants fictifs uniques');
});

dit('aucun contenu d’attaque : un constat n’a qu’un titre et une gravité, une fuite ni contenu ni nom, une campagne que des totaux', () => {
  for (const c of gros.constats) assert.deepEqual(Object.keys(c).sort(), ['creeLe', 'etat', 'gravite', 'id', 'missionId', 'titre']);
  for (const f of gros.fuites) assert.deepEqual(Object.keys(f).sort(), ['clientId', 'detecteeLe', 'etat', 'id', 'nature']);
  for (const c of gros.campagnes) {
    assert.deepEqual(Object.keys(c).sort(), ['clientId', 'cliques', 'envoyes', 'etat', 'id', 'le', 'ouverts', 'parEquipe', 'signales', 'titre', 'type']);
    for (const e of c.parEquipe as Lien[]) assert.deepEqual(Object.keys(e).sort(), ['cliques', 'envoyes', 'equipe', 'signales']);
  }
  for (const p of gros.parcSecurite) assert.ok(Object.values(p).every((v) => typeof v !== 'string' || /^(ps|pc)-\d+$/.test(v)), 'le parc ne porte aucun nom');
});

dit('les plaques de véhicules sont invalides par construction (les lettres I, O et U n’existent pas dans le format réel)', () => {
  assert.ok(gros.vehicules.length >= 8);
  for (const v of gros.vehicules) assert.match(str(v.plaque), /^[IOU]{2}-\d{3}-[IOU]{2}$/);
});

dit('la messagerie est compatible avec `Message` : id numérique, auteur, pièces jointes vides, non lus recoupés', () => {
  for (const m of gros.messages) {
    assert.equal(typeof m.id, 'number');
    assert.ok(Array.isArray(m.attachments) && (m.attachments as unknown[]).length === 0);
    assert.ok(Array.isArray(m.reactions) && typeof m.pinned === 'boolean');
  }
  for (const c of gros.conversations) {
    const msgs = gros.messages.filter((x) => x.conversationId === c.id);
    assert.ok(msgs.length >= 2, 'conversation presque vide');
    assert.equal(c.nonLus, msgs.filter((x) => x.lu === false).length, `non-lus de ${str(c.nom)}`);
    assert.equal(c.dernierMessageAt, msgs.map((x) => str(x.createdAt)).sort().pop(), 'dernier message');
    for (const x of msgs) { assert.ok(Date.parse(str(x.createdAt)) <= gros.contexte.maintenant, 'message futur'); if (x.replyToId !== null) assert.ok(msgs.some((y) => y.id === x.replyToId), 'réponse à un message absent'); }
  }
  assert.ok(new Set(normal.conversations.map((c) => c.type)).size >= 3, 'équipe, personne et client existent');
  assert.ok(normal.conversations.some((c) => num(c.nonLus) > 0));
});

console.log('  — compléments : TVA, paie, tarifs, partenaires, planning, défis');

dit('TVA : la TVA à reverser est celle des factures émises moins celle des dépenses du mois ; les cotisations suivent les bulletins', () => {
  assert.ok(normal.echeancesFiscales.some((e) => e.famille === 'TVA') && normal.echeancesFiscales.some((e) => e.famille === 'Cotisations'));
  for (const e of gros.echeancesFiscales.filter((x) => x.famille === 'TVA')) {
    const m = /^TVA de (\p{L}+)$/u.exec(str(e.intitule));
    assert.ok(m, str(e.intitule));
    const mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'].indexOf(m[1]) + 1;
    const [a, mEcheance] = str(e.echeanceLe).split('-').map(Number);
    const an = mEcheance === 1 ? a - 1 : a;
    const cleMois = `${an}-${String(mois).padStart(2, '0')}`;
    const col = gros.factures.filter((f) => f.status !== 'draft' && f.status !== 'cancelled' && str(f.issuedAt).startsWith(cleMois)).reduce((t, f) => t + D.totauxDeFacture(f).tvaCents, 0)
      - gros.avoirs.filter((x) => str(x.issuedAt).startsWith(cleMois)).reduce((t, x) => t + D.totauxDeFacture(x).tvaCents, 0);
    const ded = gros.depenses.filter((d) => str(d.spentAt).startsWith(cleMois)).reduce((t, d) => t + num(d.tvaCents), 0);
    assert.equal(num(e.montantCents), col - ded, `TVA de ${m[1]}`);
  }
  for (const e of gros.echeancesFiscales) {
    if (e.paiement === 'Payée') assert.ok(str(e.echeanceLe) < jours(gros) && str(e.payeLe) <= jours(gros), `payée mais ${str(e.echeanceLe)}`);
    else assert.equal(e.payeLe, null);
  }
  assert.ok(normal.echeancesFiscales.some((e) => e.paiement === 'À payer' && str(e.echeanceLe) < jours(normal)), 'MA08 « En retard »');
  assert.ok(normal.echeancesFiscales.some((e) => e.paiement === 'À payer' && str(e.echeanceLe) >= jours(normal)), 'MA08 « À venir »');
});

dit('paie : un bulletin par salarié et par mois, net positif, les mois passés sont payés, et la banque prélève la masse salariale', () => {
  const salaries = normal.equipe.filter((m) => m.role !== 'guest');
  assert.equal(normal.bulletins.length, salaries.length * 3);
  const vus = new Set<string>();
  for (const b of gros.bulletins) {
    const k = `${str(b.membreEmail)}:${str(b.mois)}`;
    assert.ok(!vus.has(k), `double bulletin ${k}`);
    vus.add(k);
    assert.ok(num(b.netCents) > 0 && num(b.heures) > 0);
    if (str(b.mois) < jours(gros).slice(0, 7)) assert.equal(b.etat, 'Payé');
    if (b.etat === 'Prêt' || b.etat === 'Validé' || b.etat === 'Payé') assert.ok(b.piece, 'pièce manquante');
    else assert.equal(b.piece, null);
  }
  assert.ok(normal.bulletins.some((b) => b.etat === 'À valider' || b.etat === 'Prêt'), 'MA11 « À valider / Prêt »');
  const parMois = new Map<string, number>();
  for (const b of normal.bulletins) parMois.set(str(b.mois), (parMois.get(str(b.mois)) ?? 0) + num(b.netCents));
  const moyenne = Math.round([...parMois.values()].reduce((t, x) => t + x, 0) / parMois.size);
  const salairesBanque = normal.mouvements.filter((m) => m.libelle === 'Salaires');
  assert.ok(salairesBanque.length >= 3 && salairesBanque.every((m) => num(m.montantCents) === -moyenne), 'les prélèvements « Salaires » = masse salariale');
});

dit('tarifs : la marge se calcule du prix et du coût ; les ventes du mois sont les lignes de facture de ce nom ; un historique daté', () => {
  const mois = jours(gros).slice(0, 7);
  for (const p of gros.prestations) {
    if (p.coutCents !== null) assert.ok(num(p.coutCents) < num(p.prixCents), 'coût ≥ prix');
    const ventes = gros.factures.filter((f) => f.status !== 'draft' && f.status !== 'cancelled' && str(f.issuedAt).startsWith(mois)).flatMap((f) => f.lines as Lien[]).filter((l) => l.label === p.nom).reduce((t, l) => t + num(l.quantity), 0);
    assert.equal(p.ventesMois, ventes, `ventes de ${str(p.nom)}`);
    for (const h of p.historique as Lien[]) assert.ok(str(h.le) <= jours(gros) && num(h.ancienCents) !== num(h.nouveauCents));
  }
  assert.ok(normal.prestations.some((p) => p.coutCents !== null) && gros.prestations.some((p) => p.etat === 'archivée'));
});

dit('partenaires : référents de l’équipe, fournisseurs existants, des contrats à renouveler (30 jours) et des pauses', () => {
  const emails = new Set(gros.equipe.map((m) => m.email));
  for (const p of gros.partenaires) {
    assert.ok((p.referents as string[]).length >= 1 && (p.referents as string[]).every((e) => emails.has(e)));
    if (p.fournisseurId !== null) assert.ok(ids(gros.fournisseurs).has(p.fournisseurId));
  }
  assert.ok(gros.partenaires.some((p) => p.finContratLe !== null && D.ecartJours(jours(gros), str(p.finContratLe)) <= 30), 'MC05 « À renouveler »');
  assert.ok(gros.partenaires.some((p) => p.statut === 'En pause') && gros.partenaires.some((p) => p.statut === 'Actif'));
});

dit('planning : du lundi au vendredi, début avant fin, personne en congé ce jour-là, « toute l’équipe » sans liste', () => {
  const emails = new Map(gros.equipe.map((m) => [str(m.email), m]));
  for (const c of gros.creneaux) {
    const [a, mo, j] = str(c.jour).split('-').map(Number);
    const jourSem = new Date(Date.UTC(a, mo - 1, j, 12)).getUTCDay();
    assert.ok(jourSem >= 1 && jourSem <= 5, `week-end ${str(c.jour)}`);
    assert.ok(str(c.debut) < str(c.fin));
    if (c.touteLEquipe) assert.equal((c.personnes as string[]).length, 0);
    else assert.ok((c.personnes as string[]).length >= 1);
    for (const e of c.personnes as string[]) { assert.ok(emails.has(e)); assert.ok(!((emails.get(e)?.congesJours as string[]) ?? []).includes(str(c.jour)), 'créneau pendant un congé'); }
  }
  assert.ok(normal.creneaux.some((c) => str(c.jour) >= '2026-10-26' && str(c.jour) <= '2026-10-30'), 'la semaine en cours est remplie');
});

dit('défis : le compteur de jours sans impayé se recalcule ; le seuil de note vient des avis ; les participants sont de l’équipe', () => {
  const emails = new Set(gros.equipe.map((m) => m.email));
  for (const d of gros.defis) {
    assert.ok((d.participants as string[]).length >= 2 && (d.participants as string[]).every((e) => emails.has(e)));
    if (d.type === 'Compteur de jours') assert.equal(d.valeurActuelle, D.joursSansImpaye(gros.factures, jours(gros)));
  }
  assert.ok(new Set(normal.defis.map((d) => d.type)).size >= 3, 'les trois types existent au volume normal');
});

console.log('  — Écrire');

dit('fichiers : la signature d’un fichier dit celle de sa demande ; un lien externe a une durée de 7, 30 ou 90 jours et expire à sa création + sa durée', () => {
  const parFichier = new Map(gros.signatures.map((s) => [s.fichierId, s]));
  for (const f of gros.fichiers) {
    const s = parFichier.get(f.id);
    const attendu = !s ? null : s.etat === 'Signée' ? 'Signé' : ['Envoyée', 'Ouverte', 'Partiellement signée'].includes(str(s.etat)) ? 'En attente de signature' : null;
    assert.equal(f.signature, attendu, `signature de ${str(f.nom)}`);
    assert.ok(num(f.tailleOctets) > 0);
    const l = f.lienExterne as Lien | null;
    if (l) { assert.ok([7, 30, 90].includes(num(l.jours))); assert.equal(l.expireLe, D.ecartJours(str(l.creeLe), str(l.expireLe)) === num(l.jours) ? l.expireLe : null, 'durée du lien'); }
    assert.ok(((f.partages as Lien[])[0]?.droit) === 'Propriétaire', 'le propriétaire est le premier partage');
  }
});

dit('signatures : l’état suit les signataires, l’échéance et l’envoi ; chaque demande pointe un fichier ; l’empreinte est tronquée', () => {
  for (const s of gros.signatures) {
    // Une personne « en copie » reçoit le document ; elle ne signe jamais et ne compte pas dans l'état.
    const st = (s.signataires as Lien[]).filter((x) => x.role === 'signataire').map((x) => x.statut);
    assert.match(str(s.empreinteCourte), /^[0-9a-f]{8}$/);
    assert.ok(ids(gros.fichiers).has(s.fichierId));
    if (s.etat === 'À envoyer') assert.ok(s.envoyeAt === null && st.every((x) => x === 'En attente'));
    if (s.etat === 'Signée') assert.ok(st.every((x) => x === 'Signé'));
    if (s.etat === 'Partiellement signée') assert.ok(st.includes('Signé') && st.some((x) => x !== 'Signé'));
    if (s.etat === 'Refusée') assert.ok(st.includes('Refusé'));
    if (s.etat === 'Expirée') assert.ok(str(s.echeanceLe) < jours(gros) && !st.every((x) => x === 'Signé'));
    for (const x of s.signataires as Lien[]) assert.equal(x.statut === 'Signé', x.signeAt !== null);
    for (const x of (s.signataires as Lien[]).filter((y) => y.role === 'copie')) assert.ok(x.statut === 'En attente' && x.signeAt === null, 'en copie : ne signe jamais');
  }
  assert.ok(normal.signatures.length >= 10 && new Set(normal.signatures.map((s) => s.etat)).size >= 6, 'H12 montre presque tous les états');
});

dit('pages, modèles, journal, textes, archives, connaissances : références, dates passées, règles propres', () => {
  const emails = new Set(gros.equipe.map((m) => m.email));
  for (const p of gros.pages) { assert.ok(p.parentId === null || ids(gros.pages).has(p.parentId)); assert.ok((p.blocs as unknown[]).length > 0 && Date.parse(str(p.modifieAt)) <= gros.contexte.maintenant); assert.ok(emails.has(p.auteurEmail)); }
  for (const m of gros.modeles) { assert.ok(num(m.usagesMois) <= num(m.creationsDuTypeMois)); assert.equal((m.utilisateurs30j as string[]).length > 0, num(m.usagesMois) > 0); }
  const cles = new Set<string>();
  for (const j of gros.journal) { const k = `${str(j.auteurEmail)}:${str(j.jour)}`; assert.ok(!cles.has(k), `deux entrées le même jour ${k}`); cles.add(k); assert.ok(str(j.jour) <= jours(gros)); assert.match(str(j.commenceA), /^\d{2}:\d{2}$/); assert.ok(['difficile', 'moyen', 'bien', 'très bien', 'excellent'].includes(str(j.humeur))); }
  for (const t of gros.textes) { if (t.interlocuteurId !== null) assert.ok(ids(gros.interlocuteurs).has(t.interlocuteurId)); if (t.etat === 'à valider' || t.etat === 'prêt') assert.ok(t.relecteurEmail); }
  for (const a of gros.archives) { assert.ok(str(a.conserverJusquau) > str(a.archiveLe) && str(a.archiveLe) <= jours(gros)); assert.equal(a.mode === 'à la main', a.parEmail !== null); if (a.type === 'Facture') assert.equal(num(str(a.conserverJusquau).slice(0, 4)) - num(str(a.archiveLe).slice(0, 4)), 10, 'factures : dix ans'); }
  for (const e of gros.connaissances) { assert.ok(!(e.lectures as Lien[]).some((l) => l.email === e.auteurEmail), 'l’auteur ne compte pas parmi les lecteurs'); for (const q of e.questionsLieesIds as string[]) assert.equal(gros.connaissances.find((x) => x.id === q)?.type, 'question'); }
  assert.ok(new Set(normal.connaissances.map((e) => e.type)).size === 3, 'article, procédure et question');
  assert.ok(gros.pages.some((p) => p.parentId !== null) && gros.journal.length >= 100);
});

console.log('  — Échanger');

dit('canaux, annonces, courriels, salles, appels, réunions, partages, sondages, réponses automatiques', () => {
  const emails = new Set(gros.equipe.map((m) => m.email));
  for (const c of gros.canaux) { assert.match(str(c.nom), /^[a-z0-9-]+$/); assert.ok((c.membres as string[]).every((e) => emails.has(e))); if (c.visibilite === 'privé') assert.ok((c.membres as string[]).length < gros.equipe.length || gros.equipe.length <= 2); }
  const art = gros.annonces;
  for (const a of art) { assert.ok((a.confirmations as Lien[]).some((c) => c.email === a.auteurEmail), 'l’auteur est compté d’office'); assert.ok((a.confirmations as Lien[]).every((c) => Date.parse(str(c.at)) <= gros.contexte.maintenant)); }
  assert.deepEqual(art.map((a) => Number(a.epinglee)), [...art.map((a) => Number(a.epinglee))].sort((x, y) => y - x), 'épinglées d’abord');
  for (const c of gros.courriels) { assert.ok(['réception', 'envoyés', 'brouillons', 'archive'].includes(str(c.dossier))); if (c.envoiProgrammeAt) assert.ok(Date.parse(str(c.envoiProgrammeAt)) > gros.contexte.maintenant, 'envoi programmé dans le passé'); else assert.ok(Date.parse(str(c.at)) <= gros.contexte.maintenant); }
  assert.ok(normal.courriels.some((c) => c.dossier === 'réception' && !c.lu) && normal.courriels.some((c) => c.dossier === 'envoyés'));
  for (const a of gros.appels) { assert.ok(Date.parse(str(a.debutAt)) < gros.contexte.maintenant && ids(gros.salles).has(a.salleId)); assert.ok((a.participants as string[]).every((e) => emails.has(e))); }
  for (const r of gros.reunions) { assert.ok(ids(gros.evenements).has(r.evenementId)); const passee = Date.parse(str(r.debutAt)) + num(r.dureeMin) * 60_000 <= gros.contexte.maintenant; if (r.compteRendu !== null) assert.ok(passee, 'compte rendu d’une réunion à venir'); if (!passee) assert.ok((r.preparation as unknown[]).length > 0); }
  for (const p of gros.partages) { assert.ok(ids(gros.fichiers).has(p.fichierId)); if (p.expireAt) assert.ok(str(p.expireAt) > str(p.creeAt)); if (p.destinataire === 'Équipe') assert.equal(p.protection, 'aucune'); }
  assert.ok(normal.partages.some((p) => p.expireAt && Date.parse(str(p.expireAt)) > normal.contexte.maintenant && Date.parse(str(p.expireAt)) - normal.contexte.maintenant <= 3 * 86_400_000), 'MX03 « Expirent bientôt »');
  for (const s of gros.sondages) { assert.ok(num(s.repondants) <= num(s.invites)); if (s.statut === 'Nouveau') assert.equal(s.repondants, 0); if (s.statut === 'Terminé') assert.ok(Date.parse(str(s.echeanceAt)) <= gros.contexte.maintenant); assert.equal((s.options as Lien[]).reduce((t, o) => t + num(o.votes), 0) <= num(s.repondants) + (s.options as unknown[]).length, true); }
  assert.ok(new Set(normal.sondages.map((s) => s.statut)).size === 3 && new Set(normal.sondages.map((s) => s.type)).size >= 2);
  for (const r of gros.reponsesAuto) { if (!r.actif) assert.equal(r.envois, 0); }
  assert.ok(normal.reponsesAuto.some((r) => r.actif) && normal.reponsesAuto.some((r) => !r.actif));
});

console.log('  — Créer');

dit('stock : la quantité est la somme des mouvements et ne passe jamais sous zéro ; il y a des articles sous le seuil ; un produit en stock a la quantité de son article', () => {
  for (const a of gros.articles) {
    let cumul = 0;
    for (const m of [...(a.mouvements as Lien[])].sort((x, y) => str(x.le).localeCompare(str(y.le)))) { cumul += num(m.delta); assert.ok(cumul >= 0, `quantité négative : ${str(a.nom)}`); assert.ok(str(m.le) <= jours(gros)); }
    assert.equal(D.quantiteEnStock(a), cumul);
  }
  assert.ok(normal.articles.some((a) => D.quantiteEnStock(a) < num(a.seuilAlerte)), 'H15 « sous le seuil »');
  assert.ok(peu.articles.some((a) => D.quantiteEnStock(a) < num(a.seuilAlerte)) || peu.articles.length < 4);
  for (const p of gros.produits.filter((x) => x.type === 'produit en stock')) assert.equal(p.quantite, D.quantiteEnStock(gros.articles.find((a) => a.id === p.articleId)));
  for (const p of gros.produits.filter((x) => x.type !== 'produit en stock')) assert.equal(p.quantite, null);
});

dit('commandes : numéros uniques et séquentiels (« #1042 »), lignes qui pointent des produits, une remise a toutes ses étapes et sa preuve', () => {
  const numeros = gros.commandes.map((c) => str(c.numero));
  assert.equal(new Set(numeros).size, numeros.length);
  assert.ok(numeros.every((x) => /^#1\d{3}$/.test(x)));
  for (const c of gros.commandes) {
    assert.ok(ids(gros.clients).has(c.clientId));
    for (const l of c.lignes as Lien[]) assert.ok(ids(gros.produits).has(l.produitId));
    const faites = (c.etapes as Lien[]).filter((e) => e.fait).length;
    assert.equal(c.preuveRemise, c.preparation === 'Remise');
    if (c.preparation === 'Remise') assert.equal(faites, (c.etapes as unknown[]).length);
    if (c.preparation === 'À préparer') assert.equal(faites, 0);
    assert.ok(str(c.prevueLe) >= str(c.creeLe));
  }
  assert.ok(new Set(normal.commandes.map((c) => c.preparation)).size === 4 && normal.commandes.some((c) => c.remise === 'Tournée'));
});

dit('chantiers, photos, tournées, matériel, flotte, réservations, qualité : statuts, dates, références', () => {
  for (const c of gros.chantiers) {
    if (c.statut === 'À venir') assert.ok(str(c.debutLe) > jours(gros));
    if (c.statut === 'Terminé') { assert.ok(str(c.finPrevueLe) < jours(gros)); assert.ok((c.etapes as Lien[]).every((e) => e.faite)); }
    if (c.statut === 'En retard') { assert.ok(str(c.finPrevueLe) < jours(gros)); assert.ok((c.etapes as Lien[]).some((e) => !e.faite)); }
    if (c.statut === 'En cours') assert.ok(str(c.debutLe) <= jours(gros) && str(c.finPrevueLe) >= jours(gros));
    assert.ok(num(c.depenseCents) >= 0 && str(c.finPrevueLe) > str(c.debutLe));
  }
  assert.ok(new Set(normal.chantiers.map((c) => c.statut)).size >= 4, 'H16 : les statuts');
  for (const d of gros.dossiersPhotos) { if (!d.demarre) assert.equal((d.photos as unknown[]).length, 0); for (const p of d.photos as Lien[]) assert.ok(str(p.le) <= jours(gros)); if (d.chantierId) assert.ok(ids(gros.chantiers).has(d.chantierId)); }
  assert.equal(gros.marque.length, 1);
  for (const c of (gros.marque[0].palette as Lien[])) assert.match(str(c.hex), /^#[0-9A-F]{6}$/i);
  for (const v of gros.videos) { assert.equal(v.etape === 'Publiée', v.lienPublication !== null); assert.equal(num(v.vues) > 0, v.etape === 'Publiée'); assert.equal(num(v.avancement) === 100, v.etape === 'Publiée'); }
  for (const p of gros.pagesPubliques) { if (p.statut === 'Brouillon') assert.equal(p.versionEnLigne, null); if (p.statut === 'Publiée') assert.equal(p.versionEnLigne, p.versionTravail); if (p.statut === 'Modifications non publiées') assert.ok(num(p.versionEnLigne) < num(p.versionTravail)); }
  const parJour = new Map<string, number[]>();
  for (const e of gros.etapesTournee) { parJour.set(str(e.jour), [...(parJour.get(str(e.jour)) ?? []), num(e.ordre)]); if (str(e.jour) > jours(gros)) assert.equal(e.etat, 'À faire'); if (e.commandeId) assert.ok(ids(gros.commandes).has(e.commandeId)); }
  for (const [j, ordres] of parJour) assert.deepEqual([...ordres].sort((a, b) => a - b), ordres.map((_, i) => i + 1), `ordre des étapes du ${j}`);
  assert.ok(normal.etapesTournee.some((e) => e.etat === 'Fait') || normal.etapesTournee.every((e) => str(e.arriveePrevue) > '10:15'));
  for (const e of gros.equipements) { assert.ok(num(e.valeurCents) > 0 && str(e.achatLe) <= jours(gros)); assert.ok(['personne', 'lieu'].includes(str((e.affectation as Lien).type))); }
  for (const v of gros.vehicules) assert.equal(Number((v.prochainEntretien as Lien).km !== null) + Number((v.prochainEntretien as Lien).le !== null), 1, 'entretien en km OU en date');
  const parRessource = new Map<string, Lien[]>();
  for (const r of gros.reservations) { assert.ok(ids(gros.ressources).has(r.ressourceId) && str(r.finAt) > str(r.debutAt)); parRessource.set(str(r.ressourceId), [...(parRessource.get(str(r.ressourceId)) ?? []), r]); }
  for (const [rid, l] of parRessource) { const t = [...l].sort((a, b) => str(a.debutAt).localeCompare(str(b.debutAt))); for (let i = 1; i < t.length; i += 1) assert.ok(str(t[i].debutAt) >= str(t[i - 1].finAt), `chevauchement sur ${rid}`); }
  for (const e of gros.ecarts) {
    const c = gros.controles.find((x) => x.id === e.controleId);
    assert.ok(c, 'écart sans contrôle');
    const modele = gros.modelesControle.find((m) => m.id === c.modeleId) as Lien;
    const point = (modele.points as Lien[]).find((p) => (c.resultats as Lien[]).find((r) => r.pointId === p.id)?.conforme === false);
    assert.ok(point, 'un écart naît d’un point non conforme');
    assert.equal(e.gravite, point.criticite === 'critique' ? 'critique' : 'mineur');
  }
  for (const c of gros.controles) { if (c.statut === 'À faire') assert.ok((c.resultats as Lien[]).every((r) => r.conforme === null)); if (c.statut === 'Terminé') assert.ok((c.resultats as Lien[]).every((r) => r.conforme !== null || r.sansObjet === true)); for (const r of c.resultats as Lien[]) if (r.sansObjet === true) assert.equal(r.conforme, null, 'sans objet : pas de résultat'); }
});

console.log('  — Outils');

dit('corbeille, sites, sauvegardes, import et export, raccourcis, notifications, usages : règles propres', () => {
  for (const e of gros.corbeille) { const age = (gros.contexte.maintenant - Date.parse(str(e.supprimeAt))) / 86_400_000; assert.ok(age >= 0 && age <= num(e.conservationJours), 'rien n’est conservé plus longtemps que la durée de conservation'); }
  for (const s of gros.sites) { assert.match(str(s.adresse), /^https:\/\/[a-z0-9.-]+\.exemple\.test/); assert.ok(num(s.disponibilite30j) > 0 && num(s.disponibilite30j) <= 100); }
  assert.ok(gros.sites.some((s) => s.etat === 'Dégradé') && gros.sites.some((s) => s.etat === 'Hors ligne') && normal.sites.some((s) => s.etat === 'Dégradé'));
  for (const t of gros.trackers) { const site = gros.sites.find((s) => s.id === t.siteId) as Lien; assert.ok(site && site.tracker === true); if (t.etat === 'Actif') assert.ok(num(t.visites7j) > 0 && t.derniereVisiteAt); if (t.etat === 'À installer') assert.equal(t.derniereVisiteAt, null); }
  for (const c of gros.sauvegardes) { assert.ok(Date.parse(str(c.at)) <= gros.contexte.maintenant); assert.match(str(c.empreinteCourte), /^[0-9a-f]{8}$/); assert.deepEqual(c.emplacements, ['Cloud chiffré', 'Disque du bureau']); }
  assert.ok(gros.sauvegardes.some((c) => c.etat === 'Échouée') && gros.sauvegardes.some((c) => c.declencheur === 'Hebdomadaire'));
  for (const o of gros.operations) { const k = o.compteurs as Lien; if (o.type === 'Import') assert.equal(num(k.creees) + num(k.fusionnees) + num(k.ignorees) + num(k.erreurs), num(o.lignes), 'compteurs d’import'); assert.equal(o.etat === 'Terminée avec erreurs', num(k.erreurs) > 0); }
  const actions = gros.raccourcis.map((r) => str(r.action));
  assert.equal(new Set(actions).size, actions.length, 'une action, un raccourci');
  const touches = gros.raccourcis.map((r) => r.touches).filter((t) => t !== null);
  assert.equal(new Set(touches).size, touches.length, 'une touche ne sert qu’une fois');
  const nts = gros.notifications;
  assert.deepEqual(nts.map((n) => str(n.at)), nts.map((n) => str(n.at)).sort().reverse(), 'plus récentes d’abord');
  assert.ok(nts.every((n) => Date.parse(str(n.at)) <= gros.contexte.maintenant) && nts.every((n) => n.type !== 'urgent' || n.urgente === true));
  assert.ok(normal.notifications.some((n) => !n.lue) && normal.notifications.some((n) => n.lue) && normal.notifications.some((n) => n.urgente) && new Set(normal.notifications.map((n) => n.type)).size >= 5);
  for (const u of gros.usagesCalculs) assert.ok(num(u.joursUtilises) <= num(u.joursOuvresEcoules) && num(u.utilisationsMois) >= num(u.joursUtilises));
  assert.equal(gros.usagesCalculs[0].joursOuvresEcoules, 22, 'jours ouvrés du 1er au 30 octobre 2026');
});

dit('automatisations : neuf actives et trois en pause sur douze ; un brouillon n’a jamais tourné ; une famille Cyber quand c’est une vue Cyber', () => {
  const douze = D.construireMonde({ volumes: { automatisations: 'normal' } }).automatisations;
  assert.equal(douze.length, 12);
  assert.equal(douze.filter((a) => a.etat === 'Active').length, 9);
  assert.equal(douze.filter((a) => a.etat !== 'Active').length, 3);
  for (const a of gros.automatisations) { if (a.etat === 'Brouillon') assert.ok(a.dernierPassageAt === null && a.executions === 0); assert.ok(num(a.executionsMois) <= num(a.executions)); if (a.etat !== 'Active') assert.equal(a.executionsMois, 0); }
  assert.ok(new Set(gros.automatisations.map((a) => a.type)).size === 3 && gros.automatisations.some((a) => a.familleCyber));
});

dit('connecteurs : sans clé ; l’état dit la synchro, les droits et la date de création de la clé', () => {
  for (const c of gros.connecteurs) {
    if (c.etat === 'Non connecté') { assert.ok(c.derniereSynchroAt === null && (c.droits as unknown[]).length === 0 && c.cleCreeeLe === null && c.widgets === 0); }
    else { assert.ok(c.derniereSynchroAt && (c.droits as unknown[]).length > 0 && c.cleCreeeLe); assert.ok(Date.parse(str(c.derniereSynchroAt)) <= gros.contexte.maintenant); }
    if (c.etat === 'À renouveler') assert.ok(D.ecartJours(str(c.cleCreeeLe), jours(gros)) >= 330);
  }
  assert.ok(new Set(normal.connecteurs.map((c) => c.etat)).size === 4, 'les quatre états de H21');
  const banque = gros.connecteurs.find((c) => c.nom === 'Banque') as Lien;
  assert.deepEqual(banque.droits.length ? banque.droits : ['Lecture seule'], ['Lecture seule'], 'la banque est en lecture seule');
  const metiers = gros.modelesMetier;
  assert.equal(new Set(metiers.map((m) => m.nom)).size, metiers.length);
  assert.ok(metiers.every((m) => (m.modules as unknown[]).length >= 5 && (m.motsCles as unknown[]).length === 3));
});

console.log('  — La Garde');

dit('l’état d’une organisation se déduit du score, des alertes ouvertes et de la ronde (N02, 6.1) ; les trois états existent', () => {
  for (const o of gros.organisations) {
    const ouvertes = gros.alertes.filter((a) => a.organisationId === o.id && a.etat === 'Ouverte' && !a.sourdineJusquAt).map((a) => str(a.gravite));
    assert.equal(o.etat, D.etatOrganisation(num(o.score), ouvertes, str(o.derniereRondeAt), num(o.intervalleRondeH), gros.contexte.maintenant), `état de ${str(o.nom)}`);
    assert.ok(ids(gros.clients).has(o.clientId) && num(o.score) >= 0 && num(o.score) <= 100);
    assert.equal(o.lettre, str(o.nom)[0].toUpperCase());
  }
  for (const m of [normal, gros]) assert.deepEqual([...new Set(m.organisations.map((o) => o.etat))].sort(), ['Attention', 'Critique', 'Sain'], 'les trois états existent');
  // Une organisation peut avoir un bon score et pourtant être critique : c'est l'alerte (ou la ronde) qui décide.
  assert.ok(gros.organisations.some((o) => o.etat === 'Critique' && num(o.score) >= 65), 'N02 : « 71 en rouge à cause de l’alerte critique »');
  // Les bornes de N02 6.1, écrites en dur : sans elles, comparer la fonction à elle-même ne prouverait rien.
  const maintenant = gros.contexte.maintenant;
  const ilYa = (min: number) => new Date(maintenant - min * 60_000).toISOString();
  const cas: [string, number, string[], number, number, string][] = [
    ['score 70', 70, [], 5, 4, 'Sain'], ['score 69', 69, [], 5, 4, 'Attention'], ['score 45', 45, [], 5, 4, 'Attention'], ['score 44', 44, [], 5, 4, 'Critique'],
    ['alerte moyenne', 95, ['Moyenne'], 5, 4, 'Attention'], ['alerte critique', 95, ['Critique'], 5, 4, 'Critique'], ['alertes faibles seules', 95, ['Faible', 'Faible'], 5, 4, 'Sain'],
    ['ronde à exactement 2 intervalles', 95, [], 2 * 4 * 60, 4, 'Sain'], ['ronde juste au-delà de 2 intervalles', 95, [], 2 * 4 * 60 + 1, 4, 'Attention'],
    ['ronde à 24 h pile (intervalle 4 h)', 95, [], 24 * 60, 4, 'Attention'], ['ronde au-delà de 24 h', 95, [], 24 * 60 + 1, 4, 'Critique'], ['ronde à 24 h pile (intervalle 24 h) : pas encore deux intervalles', 95, [], 24 * 60, 24, 'Sain'], ['le plus grave l’emporte', 80, ['Moyenne'], 25 * 60, 4, 'Critique'],
  ];
  for (const [nom, score, alertes, minutes, intervalle, attendu] of cas) assert.equal(D.etatOrganisation(score, alertes, ilYa(minutes), intervalle, maintenant), attendu, nom);
  const regle = D.etatOrganisation(90, [], new Date(gros.contexte.maintenant - 3 * 3_600_000).toISOString(), 1, gros.contexte.maintenant);
  assert.equal(regle, 'Attention', 'une ronde de plus de deux intervalles pèse');
  assert.equal(D.etatOrganisation(90, ['Faible'], new Date(gros.contexte.maintenant - 600_000).toISOString(), 4, gros.contexte.maintenant), 'Sain', 'des alertes faibles seules ne changent rien');
});

dit('alertes, incidents, vulnérabilités, actifs : références, chronologie, cycle de vie', () => {
  for (const a of gros.alertes) {
    assert.ok(ids(gros.organisations).has(a.organisationId) && Date.parse(str(a.detecteeAt)) <= gros.contexte.maintenant);
    if (a.etat === 'Ouverte') assert.equal(a.acquitteeAt, null);
    else { assert.ok(a.acquitteeAt && Date.parse(str(a.acquitteeAt)) >= Date.parse(str(a.detecteeAt)) && Date.parse(str(a.acquitteeAt)) <= gros.contexte.maintenant); }
    if (a.fausseAlerte) assert.equal(a.etat, 'Acquittée');
  }
  const ordre = { Critique: 0, Moyenne: 1, Faible: 2 } as Record<string, number>;
  assert.deepEqual(gros.alertes.map((a) => ordre[str(a.gravite)]), gros.alertes.map((a) => ordre[str(a.gravite)]).sort((x, y) => x - y), 'tri par gravité');
  assert.ok(normal.alertes.some((a) => a.etat === 'Ouverte') && normal.alertes.some((a) => a.etat === 'Acquittée' && str(a.acquitteeAt).slice(0, 10) === jours(normal)), 'MG01 « Traitées aujourd’hui »');
  const etapes = ['Détecté', 'Pris en charge', 'En traitement', 'Résolu', 'Clôturé'];
  for (const i of gros.incidents) {
    assert.match(str(i.id), /^INC-\d{4}$/);
    assert.ok(ids(gros.organisations).has(i.organisationId) && etapes.includes(str(i.etape)));
    assert.equal(i.responsableEmail === null, i.etape === 'Détecté', 'responsable : nul seulement avant la prise en charge');
    assert.equal(i.etape === 'Clôturé', i.clotureAt !== null);
    if (i.clotureAt) assert.ok(str(i.clotureAt) >= str(i.ouvertAt));
    const faites = (i.plan as Lien[]).filter((p) => p.fait).length;
    if (i.etape === 'Résolu' || i.etape === 'Clôturé') assert.ok(faites >= 4 && i.clientInforme === true);
    if (i.etape === 'Détecté') assert.equal(faites, 0);
    assert.ok((i.chronologie as Lien[]).every((c) => Date.parse(str(c.at)) <= gros.contexte.maintenant));
  }
  assert.equal(new Set(gros.incidents.map((i) => i.id)).size, gros.incidents.length);
  assert.ok(normal.incidents.some((i) => i.etape === 'En traitement'), 'H32 « En traitement »');
  for (const v of gros.vulnerabilites) assert.ok(ids(gros.organisations).has(v.organisationId) && (v.actifId === null || ids(gros.actifs).has(v.actifId)));
  for (const a of gros.actifs) {
    assert.ok(ids(gros.organisations).has(a.organisationId) && /\.exemple\.test$/.test(str(a.nom)));
    if (a.type === 'Domaine') assert.ok(num(a.expireDansJours) > 0);
    if (a.type === 'Messagerie') assert.equal(typeof a.messagerieOk, 'boolean');
    if (a.type === 'Serveur') assert.equal(typeof a.patchEnRetard, 'boolean');
  }
  for (const o of gros.organisations) assert.ok(gros.actifs.some((a) => a.organisationId === o.id && a.type === 'Domaine'), 'chaque organisation a son domaine');
});

dit('rondes, événements de sécurité, journal d’accès : périmètres, ordre, aucune IP, aucune valeur de secret', () => {
  for (const r of gros.rondes) { assert.ok((r.perimetre as string[]).every((id) => ids(gros.organisations).has(id)) && str(r.prochaineAt) > str(r.derniereAt) && Date.parse(str(r.derniereAt)) <= gros.contexte.maintenant); assert.ok(['ok', 'attention', 'critique'].includes(str((r.dernierResultat as Lien).ton))); }
  assert.ok(new Set(gros.rondes.map((r) => r.type)).size === 6, 'les six types de ronde');
  const ev = gros.evenementsSecurite;
  assert.deepEqual(ev.map((e) => str(e.at)), ev.map((e) => str(e.at)).sort().reverse());
  assert.ok(ev.every((e) => Date.parse(str(e.at)) <= gros.contexte.maintenant && (e.organisationId === null || ids(gros.organisations).has(e.organisationId))));
  assert.deepEqual([...new Set(ev.map((e) => e.resultat))].sort(), ['Bloqué', 'Journalisé', 'Normal']);
  const noms = gros.secrets.map((s) => str(s.nom));
  for (const j of gros.journalAcces) {
    assert.ok(Date.parse(str(j.at)) <= gros.contexte.maintenant && ['Autorisé', 'Refusé', 'À revoir'].includes(str(j.resultat)));
    assert.equal(IPV4.test(str(j.lieu)) || IPV4.test(str(j.action)), false, 'adresse IP dans le journal');
    const m = /secret « (.+) »/.exec(str(j.action));
    if (m) assert.ok(noms.includes(m[1]), 'seul le NOM du secret figure');
    if (j.resultat !== 'À revoir') assert.equal(j.revuParEmail, null);
  }
  assert.ok(normal.journalAcces.some((j) => j.resultat === 'Refusé') && normal.journalAcces.some((j) => j.resultat === 'À revoir') && normal.journalAcces.some((j) => (j.acteur as Lien).type === 'client'));
});

dit('maturité SOC : le score est points obtenus ÷ points possibles (pas la moyenne des domaines) ; les six domaines ; le niveau suit la grille', () => {
  const c = gros.criteresMaturite;
  assert.equal(new Set(c.map((x) => x.domaine)).size, 6);
  const possibles = c.reduce((t, x) => t + num(x.points), 0);
  const obtenus = c.filter((x) => x.rempli).reduce((t, x) => t + num(x.points), 0);
  assert.equal(D.scoreMaturite(c), Math.round((obtenus / possibles) * 100));
  const parDomaine = [...new Set(c.map((x) => x.domaine))].map((d) => D.scoreMaturite(c.filter((x) => x.domaine === d)));
  const moyenneSimple = Math.round(parDomaine.reduce((t, x) => t + x, 0) / parDomaine.length);
  assert.ok(Math.abs(moyenneSimple - D.scoreMaturite(c)) <= 15, 'même ordre de grandeur, mais pas la moyenne simple');
  assert.deepEqual([0, 39, 40, 74, 75, 86, 87, 94, 95, 100].map((x) => D.niveauMaturite(x).niveau), [1, 1, 2, 2, 3, 3, 4, 4, 5, 5]);
  assert.ok(normal.criteresMaturite.some((x) => !x.rempli), 'H34 a un plan de progression à montrer');
  assert.ok(normal.criteresMaturite.every((x) => num(x.points) > 0 && num(x.dureeMin) > 0));
});

dit('offres : prix en centimes, positionnement de la liste fixe, une activation par client surveillé', () => {
  const orgClients = gros.organisations.map((o) => o.clientId);
  for (const o of gros.offresCyber) { assert.ok(Number.isInteger(num(o.prixCents)) && num(o.prixCents) > 0); assert.deepEqual((o.activations as Lien[]).map((a) => a.clientId), orgClients); assert.ok((o.responsables as string[]).length >= 1); }
  assert.ok(gros.offresCyber.some((o) => o.positionnement === 'Nouveau') && gros.offresCyber.some((o) => (o.activations as Lien[]).some((a) => a.statut === 'Actif')));
});

console.log('  — Cyber');

dit('accords : l’état se déduit de la signature et des dates ; les quatre états existent ; un outil « Accord requis » est bloqué sans accord valide', () => {
  for (const a of gros.accords) {
    const etat = D.etatAccord(a, joursCyber(gros));
    assert.equal(etat === 'En attente', !a.signe);
    if (a.signe) assert.equal(etat, str(a.finLe) < joursCyber(gros) ? 'Expiré' : D.ecartJours(joursCyber(gros), str(a.finLe)) <= 30 ? 'Expire bientôt' : 'Valide');
    assert.ok(str(a.finLe) > str(a.debutLe) && (a.perimetre as Lien).domaines && ((a.perimetre as Lien).domaines as string[]).every((d) => /\.exemple\.test$/.test(d)));
    assert.ok(str(a.conditionArret).length > 0);
  }
  assert.deepEqual([...new Set(normal.accords.map((a) => D.etatAccord(a, joursCyber(normal))))].sort(), ['En attente', 'Expire bientôt', 'Expiré', 'Valide']);
  const requis = { accord: 'Accord requis' };
  const mk = (signe: boolean, debutLe: string, finLe: string) => ({ signe, debutLe, finLe });
  assert.equal(D.outilDisponible(requis, [], joursCyber(normal)), false, 'aucun accord');
  assert.equal(D.outilDisponible(requis, [mk(true, '2026-01-01', '2026-02-01')], joursCyber(normal)), false, 'accord expiré');
  assert.equal(D.outilDisponible(requis, [mk(false, '2026-10-01', '2027-01-01')], joursCyber(normal)), false, 'accord non signé');
  assert.equal(D.outilDisponible(requis, [mk(true, '2026-09-01', '2026-11-10')], joursCyber(normal)), true, 'accord qui expire bientôt');
  assert.equal(D.outilDisponible({ accord: 'Passif' }, [], joursCyber(normal)), true, 'un outil passif n’exige aucun accord');
});

dit('outils : 54 au volume normal (9 familles × 6), les types et accords de la fiche, des noms génériques', () => {
  assert.equal(normal.outilsCyber.length, 54);
  const familles = new Map<string, number>();
  for (const o of normal.outilsCyber) familles.set(str(o.famille), (familles.get(str(o.famille)) ?? 0) + 1);
  assert.equal(familles.size, 9);
  assert.ok([...familles.values()].every((n) => n === 6));
  const accordsDe = (f: string) => new Set(normal.outilsCyber.filter((o) => o.famille === f).map((o) => o.accord));
  assert.deepEqual([...accordsDe('OSINT')], ['Passif'], 'OSINT : 6 outils passifs');
  assert.deepEqual([...accordsDe('Sites et vie privée')], ['Passif']);
  assert.deepEqual([...accordsDe('Conformité')], ['Interne']);
  assert.ok(accordsDe('Red Team').has('Accord requis') && accordsDe('Sensibilisation').has('Accord requis') && accordsDe('Réponse à incident').has('Accord requis'));
  assert.equal(normal.outilsCyber.filter((o) => o.famille === 'SOC' && o.type === 'Connecté').length, 1, 'SOC : un seul connecté (corrélation)');
  assert.ok(normal.outilsCyber.some((o) => !o.actif) && normal.outilsCyber.some((o) => o.actif));
  assert.equal(peu.outilsCyber.length, 9);
  assert.equal(new Set(peu.outilsCyber.map((o) => o.famille)).size, 9, 'une de chaque famille dès « peu »');
});

dit('missions, constats, documents : accords, phases, signatures, états', () => {
  for (const m of gros.missions) {
    assert.ok(ids(gros.clients).has(m.clientId) && ['Accord', 'Reconnaissance', 'Tests', 'Constats', 'Rapport'].includes(str(m.phase)));
    if (m.accordId !== null) assert.equal(gros.accords.find((a) => a.id === m.accordId)?.clientId, m.clientId, 'l’accord est celui du client de la mission');
    if (m.etat === 'À préparer') assert.equal(m.phase, 'Accord');
    if (m.etat === 'Terminée') { assert.equal(m.phase, 'Rapport'); const a = gros.accords.find((x) => x.id === m.accordId); if (a) assert.equal(a.signe, true, 'une mission terminée a un accord signé'); }
  }
  assert.ok(normal.missions.some((m) => m.etat === 'En cours' && normal.accords.find((a) => a.id === m.accordId)?.signe === false), 'CY12 : une mission en cours dont l’accord attend sa signature');
  assert.ok(new Set(normal.missions.map((m) => m.etat)).size === 3 && normal.missions.some((m) => m.mensuelle));
  for (const c of gros.constats) { const m = gros.missions.find((x) => x.id === c.missionId); assert.ok(m && m.etat !== 'À préparer' && str(c.creeLe) >= str(m.debutLe) && str(c.creeLe) <= joursCyber(gros)); }
  assert.deepEqual([...new Set(gros.constats.map((c) => c.gravite))].sort(), ['Critique', 'Faible', 'Moyenne']);
  const docsAccord = gros.documentsCyber.filter((d) => d.type === 'Accord');
  assert.equal(docsAccord.length, gros.accords.length, 'un document par accord');
  for (const d of docsAccord) assert.equal(d.signature, gros.accords.find((a) => a.clientId === d.clientId)?.signe ? 'Signé' : 'À signer');
  assert.ok(new Set(gros.documentsCyber.map((d) => d.type)).size === 7 && gros.documentsCyber.every((d) => str(d.modifieLe) <= joursCyber(gros)));
});

dit('veille, conformité, sensibilisation, parc : compteurs recoupés, rien de nominatif', () => {
  const lg = new Set(gros.logicielsClients.map((l) => l.id));
  for (const a of gros.alertesVeille) assert.ok((a.logicielsConcernes as string[]).every((id) => lg.has(id)) && str(a.publieeLe) <= joursCyber(gros));
  const concernes = new Set(gros.alertesVeille.flatMap((a) => a.logicielsConcernes as string[]));
  for (const l of gros.logicielsClients) assert.equal(l.concerneParVeille, concernes.has(str(l.id)));
  assert.ok(normal.alertesVeille.some((a) => a.publieeLe === joursCyber(normal)) && normal.alertesVeille.some((a) => (a.logicielsConcernes as unknown[]).length > 0), 'CY05 « N vous concernent »');
  assert.ok(gros.fuites.some((f) => f.etat === 'à traiter') && gros.fuites.every((f) => str(f.detecteeLe) <= joursCyber(gros)));
  for (const d of gros.dossiersConformite) { assert.equal((d.points as unknown[]).length, 5); assert.equal(d.registreRevuLe === null, !(d.points as Lien[])[0].ok); }
  assert.deepEqual([...new Set(gros.dossiersConformite.map((d) => D.niveauConformite(d)))].sort(), ['Conforme', 'Partiel', 'À traiter']);
  for (const c of gros.campagnes) {
    const eq = c.parEquipe as Lien[];
    if (c.etat === 'Planifiée') assert.ok(num(c.envoyes) === 0 && eq.length === 0 && str(c.le) > joursCyber(gros));
    else { assert.equal(eq.reduce((t, e) => t + num(e.envoyes), 0), num(c.envoyes)); assert.equal(eq.reduce((t, e) => t + num(e.cliques), 0), num(c.cliques)); assert.ok(num(c.cliques) <= num(c.envoyes) && num(c.signales) <= num(c.envoyes) && num(c.ouverts) <= num(c.envoyes)); }
    if (c.type !== 'Simulation') assert.ok(num(c.cliques) === 0 && num(c.signales) === 0);
  }
  for (const p of gros.parcSecurite) { assert.ok(num(p.postesAJour) <= num(p.postes) && num(p.correctifsImportants) <= num(p.correctifsEnAttente)); const s = p.sauvegardes as Lien; assert.ok(num(s.verifiees) <= num(s.total)); }
  assert.ok(new Set(normal.campagnes.map((c) => c.etat)).size >= 2 && normal.campagnes.some((c) => c.type === 'Simulation'));
});

/** Les invariants de la suite qui ne doivent JAMAIS dépendre du tirage. */
function invariantsSuite(m: MondeBrut, nom: string): void {
  const auj = jours(m);
  const maintenant = m.contexte.maintenant;
  const clients = ids(m.clients);
  for (const jeu of ['fichiers', 'commandes', 'organisations', 'abonnements', 'accords', 'missions', 'campagnes', 'parcSecurite', 'fuites', 'dossiersConformite', 'logicielsClients']) {
    for (const x of m[jeu]) if (x.clientId !== null && x.clientId !== undefined) assert.ok(clients.has(x.clientId), `${nom} : ${jeu} → client`);
  }
  for (const s of m.signatures) assert.ok(ids(m.fichiers).has(s.fichierId), `${nom} : signature → fichier`);
  for (const p of m.partages) assert.ok(ids(m.fichiers).has(p.fichierId), `${nom} : partage → fichier`);
  for (const r of m.reunions) assert.ok(ids(m.evenements).has(r.evenementId), `${nom} : réunion → événement`);
  for (const a of m.alertes) assert.ok(ids(m.organisations).has(a.organisationId), `${nom} : alerte → organisation`);
  for (const a of m.alertes) assert.ok(Date.parse(str(a.detecteeAt)) <= maintenant, `${nom} : alerte future`);
  for (const o of m.organisations) {
    const ouvertes = m.alertes.filter((a) => a.organisationId === o.id && a.etat === 'Ouverte' && !a.sourdineJusquAt).map((a) => str(a.gravite));
    assert.equal(o.etat, D.etatOrganisation(num(o.score), ouvertes, str(o.derniereRondeAt), num(o.intervalleRondeH), maintenant), `${nom} : état d’organisation`);
  }
  for (const a of m.articles) { let c = 0; for (const mv of [...(a.mouvements as Lien[])].sort((x, y) => str(x.le).localeCompare(str(y.le)))) { c += num(mv.delta); assert.ok(c >= 0, `${nom} : stock négatif`); } }
  for (const mi of m.missions) if (mi.accordId !== null) assert.equal(m.accords.find((a) => a.id === mi.accordId)?.clientId, mi.clientId, `${nom} : accord d’une mission`);
  for (const a of m.accords) assert.equal(D.etatAccord(a, joursCyber(m)) === 'En attente', !a.signe, `${nom} : accord`);
  const parRessource = new Map<string, Lien[]>();
  for (const r of m.reservations) parRessource.set(str(r.ressourceId), [...(parRessource.get(str(r.ressourceId)) ?? []), r]);
  for (const l of parRessource.values()) { const t = [...l].sort((x, y) => str(x.debutAt).localeCompare(str(y.debutAt))); for (let i = 1; i < t.length; i += 1) assert.ok(str(t[i].debutAt) >= str(t[i - 1].finAt), `${nom} : chevauchement`); }
  for (const c of m.conversations) assert.equal(c.nonLus, m.messages.filter((x) => x.conversationId === c.id && x.lu === false).length, `${nom} : non-lus`);
  for (const s of m.secrets) assert.equal(s.valeur, '••••••••', `${nom} : secret non masqué`);
  for (const t of m.etapesTournee) if (str(t.jour) > auj) assert.equal(t.etat, 'À faire', `${nom} : tournée future`);
  for (const b of m.bulletins) if (str(b.mois) < auj.slice(0, 7)) assert.equal(b.etat, 'Payé', `${nom} : bulletin passé non payé`);
  for (const j of m.journalAcces) assert.ok(Date.parse(str(j.at)) <= maintenant, `${nom} : accès futur`);
  for (const c of m.sauvegardes) assert.ok(Date.parse(str(c.at)) <= maintenant, `${nom} : sauvegarde future`);
}

dit('les invariants de la suite tiennent pour 12 graines (« peu » et « normal »), 4 graines (« beaucoup ») et d’autres dates', () => {
  for (let graine = 1; graine <= 12; graine += 1) for (const volume of ['peu', 'normal'] as const) invariantsSuite(D.construireMonde({ graine, volume }), `graine ${graine}, ${volume}`);
  for (const graine of [101, 202, 303, 404]) invariantsSuite(D.construireMonde({ graine, volume: 'beaucoup' }), `graine ${graine}, beaucoup`);
  for (const jour of ['2026-03-29T10:00:00Z', '2026-07-14T09:00:00Z', '2026-10-25T11:30:00Z', '2027-01-04T08:00:00Z']) invariantsSuite(D.construireMonde({ volume: 'normal', maintenant: Date.parse(jour) }), `date ${jour}`);
});

dit('les cas attendus par les écrans existent dès « normal », pour 12 graines (organisations en trois états, impayés fiscaux, accords en attente…)', () => {
  for (let graine = 1; graine <= 12; graine += 1) {
    const n = D.construireMonde({ graine, volume: 'normal' });
    const nom = `graine ${graine}`;
    assert.equal(new Set(n.organisations.map((o) => o.etat)).size, 3, `${nom} : états d’organisation`);
    assert.ok(n.alertes.some((a) => a.gravite === 'Critique' && a.etat === 'Ouverte') && n.alertes.some((a) => a.etat === 'Acquittée'), `${nom} : alertes`);
    assert.ok(n.incidents.some((i) => i.etape === 'En traitement'), `${nom} : incident en traitement`);
    assert.ok(n.articles.some((a) => D.quantiteEnStock(a) < num(a.seuilAlerte)), `${nom} : stock bas`);
    assert.ok(n.signatures.length >= 10 && new Set(n.signatures.map((s) => s.etat)).size >= 6, `${nom} : états de signature`);
    assert.equal(new Set(n.accords.map((a) => D.etatAccord(a, joursCyber(n)))).size, 4, `${nom} : états d’accord`);
    assert.ok(n.echeancesFiscales.some((e) => e.paiement === 'À payer' && str(e.echeanceLe) < jours(n)), `${nom} : échéance fiscale en retard`);
    assert.ok(n.sites.some((s) => s.etat === 'Dégradé') && n.notifications.some((x) => !x.lue), `${nom} : sites, notifications`);
  }
});

console.log('  — Les valeurs attendues des écrans calculés');

dit('H09 prévisions : la série part du solde, le creux est son minimum, les scénarios se recoupent', () => {
  for (const [nom, m] of [['normal', normal], ['peu', peu], ['beaucoup', gros], ['vide', vide]] as const) {
    for (const horizon of [30, 90, 365]) {
      const p = D.attendusPrevisions(m, { horizonJours: horizon });
      const solde0 = m.comptes.reduce((s, c) => s + num(c.soldeCents), 0);
      assert.equal(p.serieCentrale.length, horizon + 1, `${nom} ${horizon} : un point par jour`);
      assert.equal(p.serieCentrale[0].soldeCents, solde0, `${nom} : le premier point est le solde d’aujourd’hui`);
      assert.equal(p.soldeAujourdhuiCents, solde0);
      const prevus = m.mouvements.filter((x) => x.reel === false && str(x.date) > aujourdhuiDe(m) && str(x.date) <= D.jourDe(Date.parse(`${aujourdhuiDe(m)}T12:00:00Z`) + horizon * 86_400_000));
      assert.equal(p.soldeFinCents, solde0 + prevus.reduce((s, x) => s + num(x.montantCents), 0), `${nom} ${horizon} : solde final = solde + mouvements prévus`);
      assert.equal(p.pointLePlusBas.soldeCents, Math.min(...p.serieCentrale.map((x: Attendu) => x.soldeCents)), `${nom} : le creux est le minimum`);
      assert.equal(p.scenarios.central, p.soldeFinCents);
      assert.ok(p.scenarios.paiementsEnRetard <= p.scenarios.central, `${nom} : un retard ne peut qu’enlever des entrées à l’horizon`);
      assert.equal(p.creuxTrace, p.pointLePlusBas.soldeCents <= solde0 * 0.9);
      assert.ok(p.prochainsMouvements.length <= 6 && p.prochainsMouvements.every((x: Attendu, i: number, l: Attendu[]) => i === 0 || l[i - 1].jour <= x.jour));
      assert.ok(p.fourchette.auCreux.basCents <= p.fourchette.auCreux.hautCents + 1 || p.fourchette.auCreux.basCents <= p.pointLePlusBas.soldeCents, `${nom} : bas ≤ haut`);
    }
  }
  // Le scénario « Nouvelle embauche » retranche le coût saisi à chaque 1er du mois dans l’horizon, rien d’autre (cas de référence : 90 jours depuis le 30 oct. → un seul 1er janvier).
  const p90 = D.attendusPrevisions(normal, { horizonJours: 90 });
  assert.equal(p90.scenarios.nouvelleEmbauche, p90.scenarios.central - 320_000, '23 100 − 3 200 = 19 900 : un seul prélèvement en janvier');
  assert.equal(D.attendusPrevisions(normal, { horizonJours: 365 }).scenarios.nouvelleEmbauche, D.attendusPrevisions(normal, { horizonJours: 365 }).scenarios.central - 320_000 * 10, 'dix échéances sur 12 mois : du 1er janvier au 1er octobre 2027');
  assert.equal(D.attendusPrevisions(normal, { embaucheMensuelleCents: 100_000 }).scenarios.nouvelleEmbauche, p90.scenarios.central - 100_000, 'le coût est saisi, jamais calculé');
  // Les prévus couvrent l’horizon de 90 jours (sinon la prévision serait tronquée), dès « normal ».
  assert.ok(str(p90.couvertJusquau) >= D.jourDe(Date.parse(`${aujourdhui}T12:00:00Z`) + 90 * 86_400_000), 'les mouvements prévus couvrent 90 jours');
  // Les trois situations existent : un creux, une prévision négative, pas de creux.
  assert.ok(D.attendusPrevisions(normal).creuxTrace && D.attendusPrevisions(peu).pointLePlusBas.soldeCents < 0 && !D.attendusPrevisions(gros).creuxTrace, 'creux / négatif / pas de creux');
  assert.equal(D.attendusPrevisions(vide).couvertJusquau, null);
});

dit('H04 bilan de la semaine : lundi à dimanche, les parties font le tout, les garanties de la semaine existent', () => {
  for (const [nom, m] of [['normal', normal], ['peu', peu], ['beaucoup', gros], ['vide', vide]] as const) {
    const b = D.attendusBilanSemaine(m);
    assert.equal(b.semaine.lundi, '2026-10-26');
    assert.equal(b.semaine.dimanche, '2026-11-01');
    assert.equal(b.parJour.length, 7);
    assert.equal(b.parJour.reduce((s: number, x: number) => s + x, 0), b.tachesFaites.faites, `${nom} : la somme des jours = les tâches faites`);
    assert.ok(b.tachesFaites.faites <= b.tachesFaites.total);
    assert.equal(b.meilleurJour === null, b.tachesFaites.faites === 0);
    if (b.meilleurJour !== null) assert.ok(b.parJour[b.meilleurJour] === Math.max(...b.parJour) && b.parJour.slice(b.meilleurJour + 1).every((x: number) => x < b.parJour[b.meilleurJour]), 'meilleur jour : le plus récent en cas d’égalité');
    assert.equal(b.encaisse.parJourCents.reduce((s: number, x: number) => s + x, 0), b.encaisse.cents, `${nom} : l’encaissé du jour fait celui de la semaine`);
    assert.ok(b.aReporter.every((t: Attendu) => t.echeance >= b.semaine.lundi && t.echeance <= b.semaine.dimanche));
    assert.ok(b.aReporter.length <= b.tachesFaites.total - b.tachesFaites.faites + 0, `${nom} : à reporter ≤ non faites`);
    assert.ok(b.jalons.prochainPalier === null || (b.jalons.prochainPalier > b.jalons.serie && D.PALIERS_DE_SERIE.includes(b.jalons.prochainPalier) && b.jalons.joursRestants === b.jalons.prochainPalier - b.jalons.serie));
    assert.equal(b.jalons.dixFactures, b.jalons.facturesEnvoyeesOuPayees >= 10);
    assert.ok(b.boiteAZero === null ? m.boiteAZero.length === 0 : b.boiteAZero.jours >= 0 && typeof b.boiteAZero.enCours === 'boolean', `${nom} : Boîte à zéro`);
  }
  const b = D.attendusBilanSemaine(normal);
  assert.ok(b.nouveauxClients.nombre >= 1 && b.encaisse.cents > 0 && b.aReporter.length > 0 && b.tachesFaites.faites > 0, 'normal : nouveaux clients, encaissé, à reporter, tâches faites');
  assert.equal(b.semaineProchaine.suggere, true, 'normal : la semaine prochaine pèse au moins 2 de plus que d’habitude');
  assert.equal(D.attendusBilanSemaine(normal, { jour: '2026-10-28' }).semaine.lundi, '2026-10-26', 'un mercredi donne la même semaine');
});

dit('H04 jalons : le palier suivant est strictement au-dessus de la série (cas de référence 0, 4 et 5 journées bouclées)', () => {
  const moiEmail = str((normal.equipe.find((x) => x.moi === true) as Lien).email);
  const jourOuvres = ['2026-10-29', '2026-10-28', '2026-10-27', '2026-10-26', '2026-10-23', '2026-10-22'];
  const avec = (n: number) => ({ ...normal, dailyPriorities: jourOuvres.slice(0, n).map((j) => ({ id: `ref-${j}`, email: moiEmail, day: j, items: [{ id: `ref-${j}-1`, label: 'Priorité', doneAt: `${j}T09:00:00Z` }], updatedAt: `${j}T09:00:00Z` })) }) as unknown as MondeBrut;
  const cas: [number, number, number | null][] = [[4, 4, 5], [5, 5, 10], [0, 0, 5]];
  for (const [n, serie, palier] of cas) {
    const j = D.attendusBilanSemaine(avec(n)).jalons;
    assert.deepEqual([j.serie, j.prochainPalier], [serie, palier], `${n} jours bouclés`);
  }
});

dit('H04 : deux règlements cette semaine et deux la semaine d’avant dès « normal » (« peu » n’a que huit factures : pas de garantie)', () => {
  const dans = (m: MondeBrut, debut: string, fin: string) => m.factures.filter((f) => f.status === 'paid' && str(f.paidAt) >= debut && str(f.paidAt) <= fin).length;
  for (let graine = 1; graine <= 12; graine += 1) {
    const n = D.construireMonde({ volume: 'normal', graine });
    assert.ok(dans(n, '2026-10-26', '2026-10-30') >= 2 && dans(n, '2026-10-19', '2026-10-25') >= 2, `graine ${graine} : règlements des deux semaines`);
  }
});

dit('G08 cockpit : le revenu récurrent est la somme des abonnements actifs, les compteurs de tickets sont réels', () => {
  for (const [nom, m] of [['normal', normal], ['peu', peu], ['beaucoup', gros], ['vide', vide]] as const) {
    const c = D.attendusCockpit(m);
    const actifs = m.abonnements.filter((a) => a.etat === 'Actif' && str(a.depuis) <= aujourdhuiDe(m));
    assert.equal(c.mrr.cents, actifs.reduce((s, a) => s + num(a.montantMensuelCents), 0), `${nom} : MRR`);
    assert.equal(c.clientsActifs, new Set(actifs.map((a) => a.clientId)).size);
    const partages = m.tickets.filter((t) => t.partageClient);
    assert.equal(Object.values(c.tickets).reduce((s: number, x: Attendu) => s + x.compteur, 0), partages.length, `${nom} : tous les tickets partagés sont comptés`);
    for (const col of Object.values(c.tickets) as Attendu[]) assert.ok(col.visibles.length <= 3 && col.visibles.length <= col.compteur);
    assert.equal(c.impayes, m.factures.filter((f) => f.status === 'issued' && str(f.dueAt) < aujourdhuiDe(m)).length);
    assert.equal(c.sources.length, m.connecteurs.length);
    assert.ok(c.objectifDuMois === null && c.utilisateursConnectes === null && c.manque.length === 2);
  }
  const c = D.attendusCockpit(normal);
  assert.ok(c.mrr.ecartPourcent !== null && c.mrr.ecartPourcent !== 0 && c.nouveauxClientsActifs >= 1, 'normal : le MRR a bougé, des nouveaux clients actifs');
});

dit('H25 tableau de bord : tickets urgents d’abord, impayés du plus gros au plus petit, tâches du jour', () => {
  for (const [nom, m] of [['normal', normal], ['peu', peu], ['beaucoup', gros], ['vide', vide]] as const) {
    const t = D.attendusTableauDeBord(m);
    const ouverts = m.tickets.filter((x) => x.colonne !== 'termine');
    assert.equal(t.tickets.visibles.length + t.tickets.autres, ouverts.length, `${nom} : visibles + autres = ouverts`);
    const urgents = ouverts.filter((x) => x.urgent).length;
    assert.ok(t.tickets.visibles.slice(0, Math.min(urgents, 3)).every((id: string) => ouverts.find((x) => x.id === id)?.urgent), `${nom} : les urgents d’abord`);
    const montants = t.facturesImpayees.visibles.map((x: Attendu) => x.soldeCents);
    assert.deepEqual(montants, [...montants].sort((a: number, b: number) => b - a), `${nom} : du plus gros au plus petit`);
    assert.equal(t.facturesImpayees.totalCents, m.factures.filter((f) => f.status === 'issued').reduce((s, f) => s + num(f.soldeCents), 0));
    assert.ok(t.mesTaches.faites <= t.mesTaches.total && t.activiteRecente.length <= 5);
  }
  const t = D.attendusTableauDeBord(normal);
  assert.ok(t.chiffreAffaires.cents > 0 && t.chiffreAffaires.ecartPourcent !== null && t.prochainRendezVous !== null && t.mesTaches.total > 0, 'normal : de quoi remplir chaque widget');
});

dit('les cas attendus par H04, H25 et G08 existent aussi pour 12 graines', () => {
  for (let graine = 1; graine <= 12; graine += 1) {
    const n = D.construireMonde({ volume: 'normal', graine });
    const b = D.attendusBilanSemaine(n);
    assert.ok(b.nouveauxClients.nombre >= 3 && b.nouveauxClients.ecartSemainePrecedente !== undefined, `graine ${graine} : trois nouveaux clients cette semaine`);
    assert.ok(b.encaisse.cents > 0 && b.encaisse.ecartPourcent !== null, `graine ${graine} : un encaissé comparable à la semaine d’avant`);
    assert.equal(b.semaineProchaine.suggere, true, `graine ${graine} : suggestion de la semaine prochaine`);
    assert.ok(D.attendusPrevisions(n).entreesAttendues.nombre > 0 && D.attendusCockpit(n).nouveauxClientsActifs >= 1, `graine ${graine} : entrées attendues, nouveaux clients actifs`);
    assert.deepEqual([...new Set(n.deploiements.map((d) => S8.deploiements.etatGlobal(d)))].sort(), ['annule', 'echec', 'en-cours', 'reussi'], `graine ${graine} : les quatre états de déploiement`);
    assert.ok(n.depots.some((d) => (d.tests as Lien).etat === 'echec') && n.servicesServeur.some((x) => x.etat === 'attention'), `graine ${graine} : un test en échec, un service à surveiller`);
    assert.ok(n.automatisations.some((x) => x.etat === 'En pause' && S8.journal.doitSeMettreEnPause(n.executions, str(x.id))), `graine ${graine} : une pause automatique`);
    for (const x of n.automatisations) assert.equal(S8.journal.executionsDuMois(n.executions, n.contexte.maintenant, str(x.id)), num(x.executionsMois), `graine ${graine} : exécutions du mois`);
  }
});

console.log('  — Les champs que les lots réclament (« Manque aux données »)');

dit('LOT-02 : les partenaires ont leurs référents, les avis un sentiment et un NPS, les prospects perdus une raison', () => {
  for (const [nom, m] of [['normal', normal], ['beaucoup', gros]] as const) {
    const ids = new Set(m.partenaires.map((p) => str(p.id)));
    const deLaListe = m.interlocuteurs.filter((i) => i.organisationType === 'partenaire');
    assert.ok(deLaListe.length > 0 && deLaListe.every((i) => ids.has(str(i.organisationId))), `${nom} : des interlocuteurs de type partenaire, tous rattachés à un partenaire`);
    assert.ok(m.partenaires.every((p) => deLaListe.some((i) => i.organisationId === p.id)), `${nom} : chaque partenaire a au moins un référent`);
    assert.ok(deLaListe.every((i) => estCourrielFictifLocal(str(i.email))), `${nom} : courriels fictifs`);
    for (const a of m.avis) assert.equal(a.sentiment, num(a.noteSur5) >= 4 ? 'positif' : num(a.noteSur5) === 3 ? 'neutre' : 'négatif', `${nom} : sentiment d’un avis`);
    const recos = m.avis.map((a) => a.recommandation).filter((r): r is number => typeof r === 'number');
    const promoteurs = recos.filter((r) => r >= 9).length;
    const detracteurs = recos.filter((r) => r <= 6).length;
    assert.equal(D.calculerNps(m.avis), Math.round(((promoteurs - detracteurs) / recos.length) * 100), `${nom} : NPS`);
    for (const p of m.prospects) {
      assert.equal(p.raisonPerte !== null, p.perduLe !== null && p.etape === 'perdu', `${nom} : raison de perte ⇔ prospect perdu`);
      if (p.raisonPerte !== null) assert.ok(D.RAISONS_DE_PERTE.includes(str(p.raisonPerte)));
    }
    assert.ok(m.prospects.some((p) => p.etape === 'perdu') && new Set(m.prospects.filter((p) => p.raisonPerte).map((p) => p.raisonPerte)).size >= (nom === 'normal' ? 1 : 2), `${nom} : des raisons de perte`);
    assert.ok(new Set(m.avis.map((a) => a.sentiment)).size === 3, `${nom} : les trois sentiments existent`);
  }
  assert.equal(D.calculerNps([]), null);
  assert.equal(D.calculerNps([{ recommandation: 10 }, { recommandation: 9 }, { recommandation: 7 }, { recommandation: 3 }]), 25, '2 promoteurs, 1 détracteur, 1 passif : (2 − 1) / 4');
  assert.equal(D.calculerNps([{ recommandation: null }]), null);
});

dit('LOT-04 : régime de TVA, taux à 10 et 5,5 %, historique des soldes et des enveloppes, encaissements échus', () => {
  const id = normal.entreprise.identite as Lien;
  assert.ok(['Réel normal', 'Réel simplifié', 'Franchise en base'].includes(str(id.regimeTva)));
  assert.equal(id.vatExempt, id.regimeTva === 'Franchise en base', 'franchise en base ⇔ exonéré de TVA');
  for (const [nom, m] of [['normal', normal], ['beaucoup', gros]] as const) {
    const taux = new Set(m.factures.flatMap((f) => (f.lines as Lien[]).map((l) => num(l.vatRate))));
    assert.ok(taux.has(20) && taux.has(10) && taux.has(5.5), `${nom} : des lignes à 20, 10 et 5,5 %`);
    for (const f of m.factures) { const t = D.totauxDeFacture(f); assert.equal(t.htCents + t.tvaCents, t.ttcCents); }
    assert.ok(m.depenses.some((d) => num(d.tvaCents) > 0 && Math.abs(num(d.tvaCents) - Math.round((num(d.amountCents) * 5.5) / 105.5)) <= 1), `${nom} : une dépense à 5,5 %`);
    for (const c of m.comptes) {
      const h = c.historique as Lien[];
      assert.equal(h.length, 90, `${nom} : 90 jours d’historique`);
      assert.equal(num(h[89].soldeCents), num(c.soldeCents), `${nom} : le dernier point est le solde`);
      assert.equal(str(h[89].jour), aujourdhuiDe(m));
      for (let k = 1; k < h.length; k += 1) {
        assert.equal(D.ecartJours(str(h[k - 1].jour), str(h[k].jour)), 1, 'jours consécutifs');
        const jour = str(h[k].jour);
        const bouge = m.mouvements.filter((x) => x.reel && x.compteId === c.id && str(x.date) === jour).reduce((s, x) => s + num(x.montantCents), 0);
        assert.equal(num(h[k].soldeCents) - num(h[k - 1].soldeCents), bouge, `${nom} : la variation du ${jour} = les mouvements réels du jour`);
      }
    }
    for (const e of m.enveloppes) {
      const h = e.historique as Lien[];
      assert.equal(h.length, 6);
      assert.equal(str(h[5].mois), aujourdhuiDe(m).slice(0, 7), 'le dernier mois est le mois courant');
      for (let k = 1; k < 6; k += 1) assert.equal(D.ecartJours(`${str(h[k - 1].mois)}-01`, `${str(h[k].mois)}-01`) >= 28 && D.ecartJours(`${str(h[k - 1].mois)}-01`, `${str(h[k].mois)}-01`) <= 31, true, 'mois consécutifs');
      for (const mois of h) assert.equal(num(mois.depenseCents), m.depenses.filter((d) => (e.categories as string[]).includes(str(d.category)) && str(d.spentAt).startsWith(str(mois.mois))).reduce((s, d) => s + num(d.amountCents), 0), `${nom} : dépensé du mois ${str(mois.mois)}`);
    }
    const echues = new Set(m.factures.filter((f) => f.status === 'issued' && str(f.dueAt) < aujourdhuiDe(m)).map((f) => f.id));
    for (const x of m.mouvements) {
      const lien = x.lien as Lien;
      assert.equal(x.echue, x.reel === false && x.nature === 'Encaissement attendu' && lien.type === 'facture' && echues.has(str(lien.id)), `${nom} : échue ⇔ encaissement attendu d’une facture échue`);
    }
    assert.ok(m.mouvements.some((x) => x.echue) && m.mouvements.some((x) => x.nature === 'Encaissement attendu' && !x.echue), `${nom} : des encaissements échus et d’autres à venir`);
  }
});

dit('LOT-06 : commandes (création, échéance, livraison, paiement en ligne), tournées (trajets, sur place), équipements (entretien, contrôle, réforme)', () => {
  for (const [nom, m] of [['normal', normal], ['beaucoup', gros]] as const) {
    for (const c of m.commandes) {
      assert.equal(D.jourDe(Date.parse(str(c.creeAt))), str(c.creeLe), `${nom} : creeAt tombe le jour de creeLe`);
      assert.ok(Date.parse(str(c.creeAt)) <= m.contexte.maintenant, `${nom} : commande créée dans le futur`);
      assert.match(str(c.heureEcheance), /^\d{2}:\d{2}$/);
      assert.equal(c.livreeLe !== null, c.preparation === 'Remise', `${nom} : livrée ⇔ remise`);
      if (c.livreeLe !== null) assert.ok(str(c.livreeLe) >= str(c.creeLe) && str(c.livreeLe) <= aujourdhuiDe(m), `${nom} : date de livraison`);
      if (c.paiementEnLigne) assert.ok(c.paiement === 'Payé' && c.remise !== 'Retrait', `${nom} : paiement en ligne`);
    }
    assert.ok(m.commandes.some((c) => c.paiementEnLigne) && m.commandes.some((c) => c.livreeLe !== null) && m.commandes.some((c) => c.livreeLe === null), `${nom} : les cas existent`);
    const parJour = new Map<string, Lien[]>();
    for (const e of m.etapesTournee) parJour.set(str(e.jour), [...(parJour.get(str(e.jour)) ?? []), e]);
    for (const e of m.etapesTournee) {
      assert.ok(Number.isInteger(num(e.trajetMin)) && num(e.trajetMin) >= 10 && num(e.distanceKm) >= 1, `${nom} : trajet`);
      if (num(e.ordre) === 1) assert.equal(e.trajetMin, 15, 'depuis le dépôt');
      // L'état d'une étape du jour se déduit de l'heure : fait, sur place, en route (trajet entamé) ou à faire.
      if (str(e.jour) === aujourdhuiDe(m)) {
        const arrivee = D.instantParis(str(e.jour), str(e.arriveePrevue));
        const fin = arrivee + num(e.dureeMin) * 60_000;
        const maintenant = m.contexte.maintenant;
        const attendu = fin <= maintenant ? 'Fait' : arrivee <= maintenant ? 'Sur place' : arrivee - num(e.trajetMin) * 60_000 <= maintenant ? 'En route' : 'À faire';
        assert.equal(e.etat, attendu, `${nom} : état de l’étape ${str(e.id)}`);
      }
      if (e.etat === 'En route' || e.etat === 'Sur place' || e.etat === 'Fait') assert.equal(str(e.jour), aujourdhuiDe(m), `${nom} : seule la tournée du jour a avancé`);
    }
    for (const e of m.equipements) {
      assert.ok(str(e.dernierEntretienLe) <= aujourdhuiDe(m) && str(e.dernierControleLe) >= str(e.dernierEntretienLe) && str(e.dernierControleLe) <= aujourdhuiDe(m), `${nom} : entretien puis contrôle`);
      assert.equal(str(e.prochainEntretienLe), D.jourDe(Date.parse(`${str(e.dernierEntretienLe)}T12:00:00Z`) + num(e.periodiciteMois) * 30 * 86_400_000), `${nom} : le prochain entretien découle du dernier`);
      assert.equal(e.reformeLe !== null, e.statut === 'Au rebut', `${nom} : réformé ⇔ au rebut`);
      if (e.reformeLe !== null) assert.ok(str(e.reformeLe) >= str(e.achatLe) && str(e.reformeLe) <= aujourdhuiDe(m));
    }
  }
  assert.ok(normal.etapesTournee.some((e) => e.etat === 'Sur place' || e.etat === 'En route' || e.etat === 'Fait'), 'la tournée du jour est entamée');
  // Au fil de la matinée, une étape passe de « À faire » à « En route », « Sur place » puis « Fait » : les quatre états existent, et la règle tient à chaque instant.
  const vus = new Set<string>();
  for (let minutes = 7 * 60 + 30; minutes <= 13 * 60; minutes += 10) {
    const hhmm = `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
    const maintenant = D.instantParis('2026-10-30', hhmm);
    const m = D.construireMonde({ volume: 'normal', maintenant });
    for (const e of m.etapesTournee.filter((x) => str(x.jour) === '2026-10-30')) {
      const arrivee = D.instantParis('2026-10-30', str(e.arriveePrevue));
      const attendu = arrivee + num(e.dureeMin) * 60_000 <= maintenant ? 'Fait' : arrivee <= maintenant ? 'Sur place' : arrivee - num(e.trajetMin) * 60_000 <= maintenant ? 'En route' : 'À faire';
      assert.equal(e.etat, attendu, `à ${hhmm} : étape ${str(e.id)}`);
      vus.add(str(e.etat));
    }
  }
  assert.deepEqual([...vus].sort(), ['En route', 'Fait', 'Sur place', 'À faire'], 'les quatre états apparaissent dans la matinée');
});

dit('LOT-06 (suite) : stock, chantiers, marque, vidéos, pages, produits, ressources, véhicules, photos, contrôles', () => {
  for (const [nom, m] of [['normal', normal], ['beaucoup', gros]] as const) {
    const auj = aujourdhuiDe(m);
    // H15
    for (const a of m.articles) {
      assert.equal(a.niveauCible, num(a.seuilAlerte) * 3);
      for (const mv of a.mouvements as Lien[]) assert.equal(mv.emplacement, a.emplacement, `${nom} : emplacement d’un mouvement`);
      for (const c of a.commandesFournisseur as Lien[]) assert.ok(str(c.commandeeLe) <= auj && str(c.arriveeLe) > str(c.commandeeLe) && (c.recue === true ? str(c.arriveeLe) <= auj : str(c.arriveeLe) >= auj), `${nom} : commande fournisseur`);
      if (D.quantiteEnStock(a) < num(a.seuilAlerte)) assert.ok((a.commandesFournisseur as Lien[]).some((c) => c.recue === false), `${nom} : un article sous son seuil a une commande en route`);
    }
    for (const f of m.fournisseurs) assert.ok(Number.isInteger(num(f.fraisDePortCents)) && num(f.fraisDePortCents) > 0 && (f.francoCents === null || num(f.francoCents) > num(f.fraisDePortCents)), `${nom} : franco et port`);
    assert.ok(m.fournisseurs.some((f) => f.francoCents !== null) && m.fournisseurs.some((f) => f.francoCents === null), `${nom} : avec et sans franco`);
    // H16, F50
    for (const c of m.chantiers) {
      const e = c.etapes as Lien[];
      assert.equal(e.reduce((s, x) => s + num(x.poids), 0), 100, `${nom} : les poids font 100`);
      assert.equal(str(e[e.length - 1].nom), 'Réception', `${nom} : dernière étape « Réception »`);
      for (const x of e) assert.ok(num(x.partRealisee) >= 0 && num(x.partRealisee) <= 1 && (x.faite === true ? x.partRealisee === 1 : num(x.partRealisee) < 1), `${nom} : part réalisée`);
      if (c.statut === 'Terminé') assert.ok(e.every((x) => x.faite === true), `${nom} : terminé = reçu`);
      for (const i of c.interventions as Lien[]) assert.equal(i.fait === true, str(i.le) <= auj && c.statut !== 'À venir', `${nom} : intervention faite ⇔ passée`);
      for (const l of c.livraisons as Lien[]) assert.equal(l.recue === true, str(l.le) <= auj, `${nom} : livraison reçue ⇔ passée`);
      if (c.statut === 'À venir') assert.equal((c.livraisons as unknown[]).length, 0);
    }
    assert.ok(m.controles.some((c) => c.chantierId !== null && c.statut !== 'Terminé'), `${nom} : F50 — un contrôle ouvert rattaché à un chantier`);
    // H17
    for (const q of m.marque) {
      const p = q.palette as Lien[];
      assert.equal(p.reduce((s, x) => s + num(x.partUsage), 0), 100, `${nom} : la palette fait 100 %`);
      assert.ok(p.every((x) => ['Principale', 'Secondaire', 'Accent', 'Fond', 'Texte'].includes(str(x.role))) && (q.aEviter as string[]).length >= 3 && str(q.modifieLe) <= auj);
    }
    // MR01
    for (const v of m.videos) {
      const rang = ['Idée', 'Tournage', 'Montage', 'Sous-titrage', 'Relecture', 'Publiée'].indexOf(str(v.etape));
      assert.ok(rang >= 0);
      assert.equal((v.plans as unknown[]).length > 0, rang >= 2, `${nom} : des plans dès le montage`);
      assert.equal((v.sousTitres as unknown[]).length > 0, rang >= 3, `${nom} : des sous-titres dès l’étape « Sous-titrage »`);
      assert.equal((v.commentaires as unknown[]).length > 0, rang >= 4, `${nom} : des commentaires dès la relecture`);
      assert.equal(v.publieeLe !== null, v.etape === 'Publiée');
      if (v.publieeLe !== null) assert.ok(str(v.publieeLe) <= auj);
    }
    assert.ok(new Set(m.videos.map((v) => v.etape)).size === 6, `${nom} : les six étapes existent`);
    // MR02
    for (const pg of m.pagesPubliques) {
      assert.equal((pg.visitesParJour as number[]).length, 7);
      assert.equal((pg.visitesParJour as number[]).reduce((s, x) => s + x, 0), num(pg.visites7j), `${nom} : les visites par jour font celles des 7 jours`);
      assert.ok((pg.sections as unknown[]).length >= 3 && (pg.visitesParJour as number[]).every((x) => x >= 0));
    }
    assert.ok(m.pagesPubliques.some((pg) => (pg.avis as Lien[]).some((a) => a.accordClient === false)) && m.pagesPubliques.some((pg) => (pg.avis as Lien[]).some((a) => a.accordClient === true)), `${nom} : des avis avec et sans accord`);
    // MR04, MR05
    for (const e of m.equipements) assert.ok(str(e.affectationDepuis) <= auj, `${nom} : affectation datée, dans le passé`);
    for (const p of m.produits) {
      assert.ok([20, 10, 5.5].includes(num(p.tvaPourcent)));
      const a = m.articles.find((x) => x.id === p.articleId);
      if (a) {
        assert.equal(p.prixAchatCents, a.prixAchatCents);
        assert.equal((p.ventesParSemaine as number[]).length, 8);
        const ventes = (a.mouvements as Lien[]).filter((x) => x.motif === 'Vente');
        // La somme des huit semaines est celle des ventes datées de ces huit semaines (du lundi d'il y a 7 semaines à aujourd'hui).
        const lundiCourant = D.jourDe(Date.parse(`${auj}T12:00:00Z`) - ((new Date(`${auj}T12:00:00Z`).getUTCDay() + 6) % 7) * 86_400_000);
        const debutFenetre = D.jourDe(Date.parse(`${lundiCourant}T12:00:00Z`) - 49 * 86_400_000);
        const attendu = ventes.filter((x) => str(x.le) >= debutFenetre && str(x.le) <= auj).reduce((s, x) => s - num(x.delta), 0);
        assert.equal((p.ventesParSemaine as number[]).reduce((s, x) => s + x, 0), attendu, `${nom} : les ventes par semaine se lisent dans les mouvements`);
        assert.ok(num(p.niveauConseille) >= num(p.seuilAlerte), 'niveau conseillé ≥ seuil');
      } else assert.ok(p.prixAchatCents === null && p.niveauConseille === null && (p.ventesParSemaine as unknown[]).length === 0 && p.photos === 0);
    }
    // MR06, MR09, MR10, MR11
    for (const r of m.ressources) for (const ind of r.indisponibilites as Lien[]) {
      assert.ok(str(ind.debut) <= str(ind.fin));
      assert.ok(m.reservations.filter((x) => x.ressourceId === r.id).every((x) => { const j = D.jourDe(Date.parse(str(x.debutAt))); return j < str(ind.debut) || j > str(ind.fin); }), `${nom} : aucune réservation pendant une indisponibilité`);
    }
    assert.ok(m.ressources.some((r) => (r.indisponibilites as unknown[]).length > 0) && m.ressources.some((r) => (r.conflits as unknown[]).length > 0), `${nom} : indisponibilités et conflits`);
    for (const v of m.vehicules) {
      assert.ok(['Diesel', 'Essence', 'Électrique', 'Hybride'].includes(str(v.energie)) && num(v.niveauPourcent) >= 0 && num(v.niveauPourcent) <= 100 && num(v.autonomieKm) > 0);
      const j = v.parJour as Lien[];
      assert.equal(j.length, 7);
      assert.equal(str(j[6].jour), auj);
      for (const x of j) assert.equal(x.carburantL === null, v.energie === 'Électrique', `${nom} : pas de carburant pour un véhicule électrique`);
    }
    for (const d of m.dossiersPhotos) {
      for (const p of d.photos as Lien[]) assert.ok(['portrait', 'paysage'].includes(str(p.orientation)));
      if (d.signatureClient !== null) assert.ok(m.chantiers.find((c) => c.id === d.chantierId)?.statut === 'Terminé' && str((d.signatureClient as Lien).le) <= auj);
    }
    for (const c of m.controles) for (const r of c.resultats as Lien[]) if (r.sansObjet === true) assert.ok(c.statut === 'Terminé' && r.conforme === null);
    assert.ok(m.controles.some((c) => (c.resultats as Lien[]).some((r) => r.sansObjet === true)), `${nom} : un point « sans objet »`);
    for (const e of m.ecarts) assert.ok(str(e.cause).length > 0 && str(e.releveLe) === str(m.controles.find((c) => c.id === e.controleId)?.le));
  }
});

console.log('  — Développement (LOT-11)');

dit('dépôts : langages à 100 %, 31 semaines de commits, tests, tickets qui existent', () => {
  for (const [nom, m] of [['normal', normal], ['peu', peu], ['beaucoup', gros]] as const) {
    const debutSemaine = D.instantParis(D.jourDe(Date.parse(`${aujourdhuiDe(m)}T12:00:00Z`) - ((new Date(`${aujourdhuiDe(m)}T12:00:00Z`).getUTCDay() + 6) % 7) * 86_400_000), '00:00');
    const tickets = ids(m.tickets);
    assert.equal(new Set(m.depots.map((d) => d.nom)).size, m.depots.length, `${nom} : noms uniques`);
    for (const d of m.depots) {
      assert.equal((d.langages as Lien[]).reduce((t, l) => t + num(l.part), 0), 100, `${nom} : langages`);
      const c = d.commitsParSemaine as number[];
      assert.ok(c.length === 31 && c.every((x) => Number.isInteger(x) && x >= 0), `${nom} : 31 semaines`);
      if (c[30] > 0) assert.ok(str(d.dernierCommitAt) >= new Date(debutSemaine).toISOString() && Date.parse(str(d.dernierCommitAt)) < m.contexte.maintenant, `${nom} : le dernier commit est de cette semaine, dans le passé`);
      if (d.dernierCommitAt !== null) assert.ok(Date.parse(str(d.dernierCommitAt)) < m.contexte.maintenant);
      const t = d.tests as Lien;
      assert.equal(t.etat === 'echec', num(t.echecs) > 0, `${nom} : tests en échec ⇔ échecs`);
      assert.equal(t.depuisLe !== null, t.etat === 'echec');
      assert.ok((d.ticketIds as string[]).every((id) => tickets.has(id)), `${nom} : tickets du dépôt`);
    }
    assert.ok(m.depots.length === 0 || m.depots.some((d) => (d.tests as Lien).etat === 'echec'), `${nom} : un test en échec à regarder`);
  }
  assert.ok(normal.depots.some((d) => (d.tests as Lien).etat === 'verts') && vide.depots.length === 0);
});

dit('déploiements : cinq étapes dans l’ordre, les quatre états existent (lus par la logique de S8), neuf cette semaine, « Revenir » vers un réussi', () => {
  for (const [nom, m] of [['normal', normal], ['peu', peu], ['beaucoup', gros]] as const) {
    const depots = new Set(m.depots.map((d) => str(d.nom)));
    const parId = new Map(m.deploiements.map((d) => [str(d.id), d]));
    for (const d of m.deploiements) {
      assert.ok(depots.has(str(d.depot)), `${nom} : dépôt`);
      assert.ok(S8.deploiements.CIBLES.includes(str(d.cible)) && d.cible !== 'interne', `${nom} : cible`);
      assert.deepEqual((d.etapes as Lien[]).map((e) => e.etape), [...S8.deploiements.ETAPES], `${nom} : cinq étapes`);
      assert.ok(Date.parse(str(d.lanceA)) <= m.contexte.maintenant, `${nom} : lancé dans le futur`);
      let t = Date.parse(str(d.lanceA));
      for (const e of d.etapes as Lien[]) {
        if (e.debut !== null) { assert.ok(Date.parse(str(e.debut)) >= t && Date.parse(str(e.debut)) <= m.contexte.maintenant, `${nom} : début d’étape`); t = Date.parse(str(e.debut)); }
        if (e.fin !== null) { assert.ok(Date.parse(str(e.fin)) >= t && Date.parse(str(e.fin)) <= m.contexte.maintenant + 1, `${nom} : fin d’étape`); t = Date.parse(str(e.fin)); }
        assert.equal(e.etat === 'a-venir', e.debut === null, `${nom} : étape à venir ⇔ sans début`);
      }
      assert.ok(!/@|https?:|localhost/.test(JSON.stringify(d)), `${nom} : aucune adresse`);
      const etat = S8.deploiements.etatGlobal(d);
      if (etat === 'echec') { const e = d.etapes as Lien[]; assert.equal(e.find((x) => x.etat === 'echouee')?.etape, 'tests'); assert.ok(e.slice(3).every((x) => x.etat === 'a-venir')); }
      if (etat !== 'en-cours') assert.ok(S8.deploiements.dureeTotale(d, m.contexte.maintenant) === null || (S8.deploiements.dureeTotale(d, m.contexte.maintenant) as number) >= 0);
      if (d.retourDe !== null) {
        const o = parId.get(str(d.retourDe));
        assert.ok(o && o.depot === d.depot && o.cible === d.cible && S8.deploiements.etatGlobal(o) === 'reussi' && str(o.lanceA) < str(d.lanceA), `${nom} : « Revenir » vers un déploiement réussi antérieur du même dépôt et de la même cible`);
        assert.equal(S8.deploiements.versionDeRetour(m.deploiements, d)?.id, o.id, 'la logique de S8 retrouve la même version');
      }
    }
    for (const p of m.deploiementsPlanifies) assert.ok(Date.parse(str(p.prevuA)) > m.contexte.maintenant && depots.has(str(p.depot)), `${nom} : déploiement planifié à venir`);
    assert.deepEqual(m.deploiements.map((d) => str(d.lanceA)), [...m.deploiements.map((d) => str(d.lanceA))].sort().reverse(), `${nom} : du plus récent au plus ancien`);
  }
  const etats = new Set(normal.deploiements.map((d) => S8.deploiements.etatGlobal(d)));
  assert.deepEqual([...etats].sort(), ['annule', 'echec', 'en-cours', 'reussi'], 'normal : les quatre états');
  const lundi = D.instantParis(D.jourDe(Date.parse(`${aujourdhui}T12:00:00Z`) - ((new Date(`${aujourdhui}T12:00:00Z`).getUTCDay() + 6) % 7) * 86_400_000), '00:00');
  assert.ok(normal.deploiements.filter((d) => Date.parse(str(d.lanceA)) >= lundi).length >= 9, 'normal : neuf déploiements cette semaine');
  assert.ok(normal.deploiements.some((d) => d.retourDe !== null) && normal.deploiementsPlanifies.length >= 1);
  assert.ok(peu.deploiements.length === 5 && new Set(peu.deploiements.map((d) => S8.deploiements.etatGlobal(d))).size >= 3);
});

dit('journal d’exécutions : le compte du mois et le dernier passage se lisent dans le journal ; une pause automatique après trois échecs', () => {
  for (const [nom, m] of [['normal', normal], ['peu', peu], ['beaucoup', gros]] as const) {
    const flux = ids(m.automatisations);
    const maintenant = m.contexte.maintenant;
    assert.ok(m.executions.length <= S8.journal.LIGNES_MAX, `${nom} : le journal tient en ${S8.journal.LIGNES_MAX} lignes`);
    for (const e of m.executions) {
      assert.ok(flux.has(str(e.fluxId)), `${nom} : flux`);
      assert.ok(Date.parse(str(e.debut)) <= maintenant && maintenant - Date.parse(str(e.debut)) <= (S8.journal.CONSERVATION_JOURS + 1) * 86_400_000, `${nom} : dans les ${S8.journal.CONSERVATION_JOURS} jours`);
      assert.ok(e.fin === null || Date.parse(str(e.fin)) >= Date.parse(str(e.debut)));
      assert.ok(['reussie', 'echec', 'ignoree', 'en-cours'].includes(str(e.resultat)) && ['local', 'api'].includes(str(e.mode)));
    }
    for (const a of m.automatisations) {
      assert.equal(S8.journal.executionsDuMois(m.executions, maintenant, str(a.id)), num(a.executionsMois), `${nom} : exécutions du mois de ${str(a.id)}`);
      const reelles = m.executions.filter((e) => e.fluxId === a.id && e.essai !== true);
      if (reelles.length) assert.equal(S8.journal.derniereExecution(m.executions, str(a.id))?.debut, str(reelles[0].debut), `${nom} : dernière exécution`);
      if (a.etat === 'Brouillon') assert.equal(reelles.length, 0, 'un brouillon n’a jamais tourné');
      if (reelles.length) assert.equal(str(a.dernierPassageAt), str(reelles[0].debut), `${nom} : dernier passage de l’automatisation = dernière exécution réelle`);
      assert.ok(num(a.executions) >= reelles.length, `${nom} : le total n’est pas inférieur au journal`);
    }
    for (const e of m.executions.filter((x) => x.essai === true)) assert.ok(m.automatisations.find((a) => a.id === e.fluxId)?.etat === 'Active', 'les essais sont visibles mais ne comptent jamais');
  }
  assert.ok(normal.automatisations.some((a) => a.etat === 'En pause' && S8.journal.doitSeMettreEnPause(normal.executions, str(a.id))), 'normal : une automatisation en pause après trois échecs de suite');
  assert.ok(normal.executions.some((e) => e.resultat === 'echec') && normal.executions.some((e) => e.resultat === 'ignoree') && normal.executions.some((e) => e.actionHumaine === true) && normal.executions.some((e) => e.mode === 'api') && normal.executions.some((e) => e.essai === true), 'normal : tous les cas du journal');
  assert.equal(vide.executions.length, 0);
});

dit('tâches planifiées : planifications valides pour S8, dernier passage prévu = le précédent passage calculé par S8', () => {
  for (const [nom, m] of [['normal', normal], ['peu', peu], ['beaucoup', gros]] as const) {
    for (const t of m.tachesPlanifiees) {
      assert.equal(S8.planification.fauteDePlanification(t.planification), null, `${nom} : planification valide`);
      const attendu = S8.planification.precedentPassage(t.planification, m.contexte.maintenant + 1);
      const cree = Date.parse(str(t.creeeA));
      const voulu = attendu !== null && attendu >= cree && attendu <= m.contexte.maintenant ? new Date(attendu).toISOString() : null;
      assert.equal(t.dernierPassagePrevu, voulu, `${nom} : dernier passage prévu de ${str(t.nom)}`);
      assert.ok(Date.parse(str(t.creeeA)) < m.contexte.maintenant);
      assert.ok(t.automatisationId === null || ids(m.automatisations).has(str(t.automatisationId)));
    }
  }
  const types = new Set(normal.tachesPlanifiees.map((t) => (t.planification as Lien).type));
  assert.deepEqual([...types].sort(), ['intervalle', 'quotidien', 'une-fois'], 'normal : les trois sortes de planification');
  assert.ok(normal.tachesPlanifiees.some((t) => t.active === false) && normal.tachesPlanifiees.some((t) => t.dernierPassagePrevu === null));
});

dit('serveur : 24 h toutes les 10 minutes, jauges bornées, services avec disponibilité ; ni hôte, ni adresse, ni port', () => {
  for (const [nom, m] of [['normal', normal], ['peu', peu], ['beaucoup', gros]] as const) {
    const mesures = m.mesuresServeur;
    assert.equal(mesures.length, nom === 'peu' ? 36 : 144, `${nom} : nombre de points`);
    for (let k = 0; k < mesures.length; k += 1) {
      const x = mesures[k];
      assert.ok(num(x.processeurPct) >= 0 && num(x.processeurPct) <= 100 && num(x.memoirePct) >= 0 && num(x.memoirePct) <= 100 && num(x.disquePct) >= 0 && num(x.disquePct) <= 100 && num(x.reseauMoParS) >= 0, `${nom} : jauges`);
      assert.ok(Date.parse(str(x.at)) <= m.contexte.maintenant, `${nom} : mesure dans le futur`);
      if (k > 0) assert.equal(Date.parse(str(x.at)) - Date.parse(str(mesures[k - 1].at)), 600_000, `${nom} : un point toutes les 10 minutes`);
    }
    if (mesures.length) assert.ok(m.contexte.maintenant - Date.parse(str(mesures[mesures.length - 1].at)) < 600_000 + 1, `${nom} : la dernière mesure est de maintenant`);
    for (const sv of m.servicesServeur) {
      assert.ok(num(sv.disponibilite30jPct) >= 95 && num(sv.disponibilite30jPct) <= 100, `${nom} : disponibilité`);
      assert.equal(sv.etat, num(sv.disponibilite30jPct) < 99.5 ? 'attention' : 'en marche', `${nom} : état d’un service`);
    }
    assert.ok(!/https?:|localhost|\b\d{1,3}(\.\d{1,3}){3}\b|\b[a-z0-9-]+\.(com|fr|net|io|org|dev)\b|\bport\s*\d+/i.test(JSON.stringify([m.servicesServeur, m.mesuresServeur])), `${nom} : ni hôte, ni adresse, ni port`);
  }
  assert.ok(normal.servicesServeur.length === 6 && normal.servicesServeur.some((s) => s.etat === 'attention') && normal.servicesServeur.filter((s) => s.etat === 'en marche').length === 5, 'normal : six services dont un à surveiller');
  const cpu = normal.mesuresServeur.map((x) => num(x.processeurPct));
  assert.ok(Math.max(...cpu) - Math.min(...cpu) >= 15, 'normal : la charge varie dans la journée');
  assert.equal(vide.mesuresServeur.length + vide.servicesServeur.length, 0);
});

dit('coûts des connecteurs : mode, consommation, payé ; six mois dont le dernier est le mois courant ; le plafond tient', () => {
  for (const [nom, m] of [['normal', normal], ['peu', peu], ['beaucoup', gros]] as const) {
    const reg = m.entreprise.reglages as Lien;
    assert.equal(reg.plafondConnecteursCents, 4000);
    assert.equal(reg.prevenirConnecteursAPourcent, 80);
    let paye = 0;
    for (const c of m.connecteurs) {
      assert.ok(['local', 'payant', 'a-brancher'].includes(str(c.mode)) && ['gratuit', 'abonnement', 'a-l-usage', 'commission'].includes(str(c.modeleDeCout)));
      assert.equal(c.mode === 'a-brancher', c.etat === 'Non connecté', `${nom} : « à brancher » ⇔ non connecté`);
      if (num(c.payeCeMoisCents) > 0) assert.equal(c.mode, 'payant', `${nom} : ce qui est payé est payant`);
      if (c.mode === 'a-brancher') assert.equal(num((c.consommationMois as Lien).utilise), 0);
      const cm = c.consommationMois as Lien;
      assert.ok(Number.isInteger(num(cm.utilise)) && num(cm.utilise) >= 0 && (cm.inclus === null || num(cm.inclus) > 0));
      paye += num(c.payeCeMoisCents);
    }
    assert.ok(paye <= num(reg.plafondConnecteursCents), `${nom} : le payé tient sous le plafond`);
    const p = m.paiementsConnecteurs;
    if (m.connecteurs.length === 0) { assert.equal(p.length, 0); continue; }
    assert.equal(p.length, 6);
    assert.equal(str(p[5].mois), aujourdhuiDe(m).slice(0, 7), `${nom} : le dernier mois est le mois courant`);
    assert.equal(num(p[5].payeCents), paye, `${nom} : le dernier mois vaut la somme des connecteurs`);
    for (let k = 1; k < 6; k += 1) { const ecart = D.ecartJours(`${str(p[k - 1].mois)}-01`, `${str(p[k].mois)}-01`); assert.ok(ecart >= 28 && ecart <= 31, 'mois consécutifs'); }
    assert.ok(p.every((x) => num(x.payeCents) >= 0 && num(x.economiseCents) >= 0));
  }
  assert.ok(normal.connecteurs.some((c) => c.mode === 'payant') && normal.connecteurs.some((c) => c.mode === 'local') && normal.connecteurs.some((c) => c.mode === 'a-brancher'), 'normal : les trois modes');
});

dit('LOT-03 (suite) : liens et échéances de blocs, commentaires ancrés, présence, signatures complètes, humeur à 5 niveaux, étapes, archives, relectures', () => {
  for (const [nom, m] of [['normal', normal], ['beaucoup', gros]] as const) {
    const auj = aujourdhuiDe(m);
    const pages = ids(m.pages);
    for (const p of m.pages) {
      for (const b of p.blocs as Lien[]) {
        if (b.type === 'tache') assert.equal(b.echeance !== null, b.fait !== true, `${nom} : échéance d'un bloc tâche ⇔ non fait`);
        for (const l of (b.liens as string[] | undefined) ?? []) assert.ok(pages.has(l) && l !== p.id, `${nom} : lien vers une autre page`);
      }
      const ca = p.commentairesAncres as Lien[];
      assert.ok(ca.length <= num(p.commentaires), `${nom} : commentaires ancrés`);
      for (const c of ca) assert.ok(num(c.bloc) < (p.blocs as unknown[]).length && Date.parse(str(c.le)) <= m.contexte.maintenant);
      for (const x of p.presence as Lien[]) assert.ok(m.contexte.maintenant - Date.parse(str(x.tapeA)) < 120_000 && (p.contributeurs as string[]).includes(str(x.email)), `${nom} : présence récente d'un contributeur`);
    }
    assert.ok(m.pages.some((p) => (p.blocs as Lien[]).some((b) => ((b.liens as unknown[] | undefined) ?? []).length > 0)) && m.pages.some((p) => (p.presence as unknown[]).length > 0) && m.pages.some((p) => (p.commentairesAncres as unknown[]).length > 0), `${nom} : liens, présence et commentaires existent`);
    for (const f of m.fichiers) assert.equal(f.faitsReleves !== null, f.typeMetier === 'Contrat', `${nom} : faits relevés ⇔ contrat`);
    assert.ok(m.fichiers.every((f) => str(f.intercalaire) === str(f.dossier).split('/')[0]));
    for (const s of m.signatures) {
      const sg = s.signataires as Lien[];
      const signataires = new Set(sg.map((x) => x.id));
      assert.equal(signataires.size, sg.length, `${nom} : identifiants de signataires`);
      for (const c of s.champs as Lien[]) { assert.ok(signataires.has(c.signataireId) && sg.find((x) => x.id === c.signataireId)?.role === 'signataire', `${nom} : champ d'un signataire`); assert.equal(c.rempli, sg.find((x) => x.id === c.signataireId)?.statut === 'Signé'); }
      const ra = s.relanceAuto as Lien;
      assert.equal(ra.active === true, ['Envoyée', 'Ouverte', 'Partiellement signée'].includes(str(s.etat)), `${nom} : relances automatiques tant que ça attend`);
      assert.equal(ra.prochaineAt !== null, ra.active === true);
    }
    assert.ok(m.signatures.some((s) => (s.signataires as Lien[]).some((x) => x.role === 'copie')), `${nom} : un destinataire en copie`);
    for (const j of m.journal) {
      assert.equal(['difficile', 'moyen', 'bien', 'très bien', 'excellent'].indexOf(str(j.humeur)) + 1, j.humeurNiveau, `${nom} : niveau d'humeur`);
      assert.ok([1, 2, 3, 4, 5].includes(num(j.energie)) && (j.mercis as string[]).length <= 3);
    }
    assert.equal(new Set(m.journal.map((j) => j.humeur)).size, 5, `${nom} : les cinq humeurs`);
    assert.ok(m.journal.some((j) => (j.mercis as string[]).length > 0));
    for (const k of m.connaissances) {
      assert.equal((k.etapes as unknown[]).length > 0, k.type !== 'question', `${nom} : des étapes sauf pour une question`);
      assert.ok(!(k.articlesLiesIds as string[]).includes(str(k.id)) && (k.articlesLiesIds as string[]).every((id) => ids(m.connaissances).has(id)), `${nom} : articles liés`);
      assert.ok(str(k.rubrique).length > 0);
    }
    assert.ok(m.connaissances.some((k) => (k.articlesLiesIds as unknown[]).length > 0) && new Set(m.connaissances.map((k) => k.rubrique)).size >= 3, `${nom} : articles liés, rubriques`);
    for (const a of m.archives) {
      assert.ok(str(a.texteIndexe).includes(str(a.nom).toLowerCase()), `${nom} : texte indexé`);
      for (const r of a.restaurations as Lien[]) assert.ok(str(r.le) >= str(a.archiveLe) && str(r.le) <= auj, `${nom} : restauration après l'archivage`);
    }
    assert.ok(m.archives.some((a) => (a.restaurations as unknown[]).length > 0), `${nom} : une restauration`);
    assert.deepEqual(m.reglesArchivage.map((r) => r.type), ['facture-payee', 'conversation-silencieuse', 'devis-refuse']);
    assert.ok(m.reglesArchivage.every((r) => r.active === (r.dernierePasseeLe !== null)) && m.reglesArchivage.some((r) => !r.active));
    const objets = new Set([...m.pages.map((p) => p.id), ...m.fichiers.map((f) => f.id)]);
    for (const d of m.demandesRelecture) {
      assert.ok(objets.has(str(d.objetId)), `${nom} : relecture d'un objet qui existe`);
      assert.equal(d.relecteurEmail === null, d.etat === 'Brouillon partagé', `${nom} : relecteur ⇔ demandée`);
      assert.ok(Date.parse(str(d.demandeAt)) <= m.contexte.maintenant);
    }
    assert.deepEqual([...new Set(m.demandesRelecture.map((d) => d.etat))].sort(), ['Brouillon partagé', 'En signature', 'Relecture demandée', 'Terminé'], `${nom} : les quatre étapes de la file`);
  }
  assert.equal(vide.reglesArchivage.length + vide.demandesRelecture.length, 0);
});

dit('remises : le prix de grille des lignes se compare au prix facturé ; MR08 : l’entonnoir se lit dans les commandes, les paniers et les sessions tiennent', () => {
  for (const [nom, m] of [['normal', normal], ['beaucoup', gros]] as const) {
    const lignes = [...m.factures.flatMap((f) => f.lines as Lien[]), ...m.devis.flatMap((d) => d.lignes as Lien[])];
    assert.ok(lignes.every((l) => Number.isInteger(num(l.prixGrilleCents)) && num(l.prixGrilleCents) > 0), `${nom} : chaque ligne porte son prix de grille`);
    const remises = lignes.filter((l) => num(l.unitPriceCents) < num(l.prixGrilleCents));
    assert.ok(remises.length > 0 && lignes.some((l) => num(l.unitPriceCents) === num(l.prixGrilleCents)) && lignes.some((l) => num(l.unitPriceCents) > num(l.prixGrilleCents)), `${nom} : des remises, des prix de grille, des majorations`);
    for (const l of remises) { const taux = 1 - num(l.unitPriceCents) / num(l.prixGrilleCents); assert.ok(taux > 0 && taux <= 0.15, `${nom} : une remise de 15 % au plus`); }
    // Entonnoir
    const e = m.entonnoirBoutique;
    assert.equal(e.length, nom === 'normal' ? 30 : 90);
    assert.equal(str(e[e.length - 1].jour), aujourdhuiDe(m));
    for (const [k, j] of e.entries()) {
      assert.ok(num(j.visites) >= num(j.produitsVus) && num(j.produitsVus) >= num(j.paniersCrees) && num(j.paniersCrees) >= num(j.commandes) && num(j.commandes) >= num(j.paiements), `${nom} : l’entonnoir ne remonte jamais (${str(j.jour)})`);
      assert.equal(num(j.commandes), m.commandes.filter((c) => c.creeLe === j.jour).length, `${nom} : commandes du ${str(j.jour)}`);
      assert.equal(num(j.paiements), m.commandes.filter((c) => c.creeLe === j.jour && c.paiement === 'Payé').length);
      if (k > 0) assert.equal(D.ecartJours(str(e[k - 1].jour), str(j.jour)), 1, 'jours consécutifs');
    }
    // Paniers
    const commandes = ids(m.commandes);
    for (const p of m.paniers) {
      assert.ok(Date.parse(str(p.derniereActiviteAt)) <= m.contexte.maintenant && num(p.lignes) >= 1 && num(p.montantCents) > 0);
      const age = m.contexte.maintenant - Date.parse(str(p.derniereActiviteAt));
      if (p.etat === 'ouvert') assert.ok(age < 3_600_000, `${nom} : un panier ouvert a une activité récente`);
      if (p.etat === 'abandonné') assert.ok(age >= 3_600_000);
      assert.equal(p.etat === 'converti', p.commandeId !== null);
      if (p.commandeId !== null) assert.ok(commandes.has(str(p.commandeId)));
    }
    assert.deepEqual([...new Set(m.paniers.map((p) => p.etat))].sort(), ['abandonné', 'converti', 'ouvert'], `${nom} : les trois états de panier`);
    // Sessions en direct
    assert.ok(m.sessionsBoutique.length > 0 && m.sessionsBoutique.every((x) => m.contexte.maintenant - Date.parse(str(x.derniereActiviteAt)) < 5 * 60_000 && Date.parse(str(x.debutAt)) <= Date.parse(str(x.derniereActiviteAt))), `${nom} : sessions actives dans les cinq dernières minutes`);
    const reg = m.entreprise.reglages as Lien;
    assert.ok(num(reg.objectifBoutiqueTrimestreCents) >= 100_000 && num(reg.objectifBoutiqueTrimestreCents) % 50_000 === 0, `${nom} : objectif du trimestre`);
  }
  assert.equal(vide.entonnoirBoutique.length + vide.paniers.length + vide.sessionsBoutique.length, 0);
  assert.ok(peu.entonnoirBoutique.length === 14 && peu.paniers.length === 3 && peu.sessionsBoutique.length === 2);
});

dit('rôles : les quatre du serveur (owner, admin, member, guest), un seul « owner » qui est « moi » ; « Partenaire » n’est pas un rôle', () => {
  for (const [nom, m] of [['normal', normal], ['peu', peu], ['beaucoup', gros], ['vide', vide]] as const) {
    assert.ok(m.equipe.every((x) => ['owner', 'admin', 'member', 'guest'].includes(str(x.role))), `${nom} : rôles du serveur`);
    assert.equal(m.equipe.filter((x) => x.role === 'owner').length, 1, `${nom} : un seul propriétaire`);
    assert.equal(m.equipe.find((x) => x.moi === true)?.role, 'owner', `${nom} : « moi » est le propriétaire (le dirigeant)`);
    assert.ok(!JSON.stringify(m.equipe).includes('Partenaire'), `${nom} : aucun « Partenaire » dans l’équipe`);
  }
  assert.deepEqual([...new Set(gros.equipe.map((x) => x.role))].sort(), ['admin', 'guest', 'member', 'owner']);
  assert.ok(normal.equipe.some((x) => x.role === 'admin') && normal.equipe.some((x) => x.role === 'guest') && normal.equipe.filter((x) => x.role !== 'guest').length >= 5);
});

dit('serveur (DEV-serveur) : résumé sans hôte ni adresse, disque cohérent avec les mesures, sauvegardes lues dans le jeu, coût du mois', () => {
  for (const [nom, m] of [['normal', normal], ['peu', peu], ['beaucoup', gros]] as const) {
    assert.equal(m.serveur.length, 1, `${nom} : un serveur`);
    const sv = m.serveur[0];
    assert.ok(num(sv.enLigneDepuisJours) > 0 && Math.abs(D.ecartJours(D.jourDe(Date.parse(str(sv.redemarreLe))), aujourdhuiDe(m)) - num(sv.enLigneDepuisJours)) <= 1, `${nom} : en ligne depuis N jours`);
    assert.ok(num(sv.disqueUtiliseGo) < num(sv.disqueTotalGo) && num(sv.memoireTotaleGo) > 0 && num(sv.capaciteReseauMoParS) > 0);
    const mesures = m.mesuresServeur;
    if (mesures.length) assert.equal(Math.round((num(sv.disqueUtiliseGo) / num(sv.disqueTotalGo)) * 100), num(mesures[mesures.length - 1].disquePct), `${nom} : le disque du résumé = celui de la dernière mesure`);
    const croissance = sv.croissanceDisqueGoParSemaine as number[];
    assert.ok(croissance.length === 4 && croissance.every((x) => x > 0 && x < 5), `${nom} : croissance du disque`);
    const sa = sv.sauvegardes as Lien;
    const derniere = [...m.sauvegardes].sort((a, b) => str(b.at).localeCompare(str(a.at)))[0];
    assert.equal(sa.derniereCopieAt, derniere ? derniere.at : null, `${nom} : dernière copie = dernière sauvegarde du jeu`);
    assert.equal(sa.derniereCopieReussie, derniere ? derniere.etat === 'Réussie' : false);
    assert.ok(sa.restaurationTesteeLe === null || str(sa.restaurationTesteeLe) <= aujourdhuiDe(m));
    const couts = sv.couts as Lien[];
    assert.ok(couts.length === 3 && couts.every((c) => Number.isInteger(num(c.cents)) && num(c.cents) > 0), `${nom} : coûts du mois`);
    assert.ok(!/https?:|localhost|\b\d{1,3}(\.\d{1,3}){3}\b|\b[a-z0-9-]+\.(com|fr|net|io|org|dev)\b|\bport\s*\d+/i.test(JSON.stringify(sv)), `${nom} : ni hôte, ni adresse, ni port`);
    for (const x of m.servicesServeur) {
      const d = num(x.disponibilite30jPct);
      assert.equal(x.etat, d < 99 ? 'arrêté' : d < 99.9 ? 'attention' : 'en marche', `${nom} : état d'un service (99,9 % / 99,0 %)`);
    }
  }
  assert.equal(num((normal.serveur[0].couts as Lien[]).reduce((t, c) => t + num(c.cents), 0)), 900, 'normal : 9 € tout compris');
  assert.equal(vide.serveur.length, 0);
});

console.log('  — Ma journée (LOT-01, suite)');

dit('priorités du jour : un enregistrement par personne et par jour ouvré, trois au plus, clôtures dans le passé ; la série de « moi » est de six jours', () => {
  for (const [nom, m] of [['normal', normal], ['peu', peu], ['beaucoup', gros]] as const) {
    const parClef = new Set<string>();
    for (const p of m.dailyPriorities) {
      assert.ok(!parClef.has(`${str(p.email)}:${str(p.day)}`), `${nom} : un enregistrement par personne et par jour`);
      parClef.add(`${str(p.email)}:${str(p.day)}`);
      assert.equal(str(p.id), `prio-${str(p.email).toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${str(p.day)}`, `${nom} : identifiant comme l'application`);
      assert.ok(str(p.day) <= aujourdhuiDe(m) && [1, 2, 3, 4, 5].includes((new Date(`${str(p.day)}T12:00:00Z`).getUTCDay() + 6) % 7 + 1), `${nom} : jour ouvré dans le passé`);
      const items = p.items as Lien[];
      assert.ok(items.length >= 1 && items.length <= 3, `${nom} : une à trois priorités`);
      for (const i of items) assert.ok(i.doneAt === null || Date.parse(str(i.doneAt)) <= m.contexte.maintenant, `${nom} : clôture dans le futur`);
      assert.ok(m.equipe.some((x) => x.email === p.email && x.role !== 'guest'), `${nom} : une personne de l'équipe`);
      assert.ok(Date.parse(str(p.updatedAt)) <= m.contexte.maintenant);
    }
    // Aujourd'hui, personne n'a tout bouclé, et « moi » a coché deux priorités sur trois.
    const aujourdhui = m.dailyPriorities.filter((p) => p.day === aujourdhuiDe(m));
    assert.ok(aujourdhui.length > 0 && aujourdhui.every((p) => (p.items as Lien[]).some((i) => i.doneAt === null)), `${nom} : la journée d'aujourd'hui n'est pas finie`);
  }
  const moiEmail = str((normal.equipe.find((x) => x.moi === true) as Lien).email);
  const maJournee = normal.dailyPriorities.find((p) => p.email === moiEmail && p.day === aujourdhui) as Lien;
  assert.deepEqual((maJournee.items as Lien[]).map((i) => i.doneAt !== null), [true, true, false], 'moi : deux priorités sur trois');
  assert.equal(D.attendusBilanSemaine(normal).jalons.serie, 6, 'moi : six jours bouclés d’affilée');
  assert.equal(D.attendusBilanSemaine(normal).jalons.prochainPalier, 10);
  assert.equal(D.attendusBilanSemaine(normal).jalons.joursRestants, 4, 'palier de 10 : quatre jours');
  assert.equal(vide.dailyPriorities.length, 0);
});

dit('la série des attendus (H04, H25) égale `serieDeLaJournee` de S2, pour chaque personne, aux quatre volumes, sur plusieurs jours et plusieurs graines', () => {
  let comparees = 0;
  const mondes: [string, MondeBrut][] = [['normal', normal], ['peu', peu], ['beaucoup', gros], ['vide', vide], ...[1, 2, 3, 4].map((g) => [`graine ${g}`, D.construireMonde({ volume: 'normal', graine: g })] as [string, MondeBrut])];
  for (const [nom, m] of mondes) {
    const emails = [...new Set(m.dailyPriorities.map((p) => str(p.email)))];
    if (emails.length === 0) emails.push(str((m.equipe[0] ?? { email: 'x@exemple.test' }).email));
    for (const email of emails) {
      for (const decalage of [0, 1, 2, 5, 9]) {
        const jour = D.jourDe(Date.parse(`${aujourdhuiDe(m)}T12:00:00Z`) - decalage * 86_400_000);
        const journees = m.dailyPriorities.filter((p) => p.email === email).map((p) => S2.prioritesDeLaCollection(p, D.jourDe));
        const attendu = D.serieDesPriorites(m, email, jour);
        assert.equal(attendu, S2.serieDeLaJournee(journees as unknown[], jour).serie, `${nom} ${email} au ${jour}`);
        comparees += 1;
      }
    }
  }
  assert.ok(comparees > 50);
  // H04 et H25 prennent cette série.
  assert.equal(D.attendusTableauDeBord(normal).mesTaches.serie, D.attendusBilanSemaine(normal).jalons.serie);
});

dit('la série : cas écrits à la main (repos, jour sans priorité, journée d’aujourd’hui, jour manqué), identiques pour les attendus et pour `serieDeLaJournee` de S2', () => {
  const email = str((normal.equipe.find((x) => x.moi === true) as Lien).email);
  const ligne = (day: string, faite: boolean) => ({ id: `s-${day}`, email, day, items: [{ id: `s-${day}-1`, label: 'Priorité', doneAt: faite ? `${day}T09:00:00Z` : null }], updatedAt: `${day}T09:00:00Z` });
  const cas: [string, [string, boolean][], number][] = [
    ['un jour manqué casse', [['2026-10-29', true], ['2026-10-28', true], ['2026-10-27', false], ['2026-10-26', true]], 2],
    ['un week-end non fini ne casse pas', [['2026-10-29', true], ['2026-10-24', false], ['2026-10-23', true], ['2026-10-22', true]], 3],
    ['un week-end fini compte', [['2026-10-30', true], ['2026-10-24', true], ['2026-10-23', true]], 3],
    ['aujourd’hui non fini ne casse pas', [['2026-10-30', false], ['2026-10-29', true], ['2026-10-28', true]], 2],
    ['un jour sans priorité ne casse pas', [['2026-10-29', true], ['2026-10-27', true]], 2],
    ['rien de bouclé : zéro', [['2026-10-29', false], ['2026-10-28', false]], 0],
  ];
  for (const [nom, lignes, voulu] of cas) {
    const m = { ...normal, dailyPriorities: lignes.map(([j, f]) => ligne(j, f)) } as unknown as MondeBrut;
    assert.equal(D.serieDesPriorites(m, email, '2026-10-30'), voulu, `attendu : ${nom}`);
    assert.equal(S2.serieDeLaJournee(m.dailyPriorities.map((p) => S2.prioritesDeLaCollection(p, D.jourDe)) as unknown[], '2026-10-30').serie, voulu, `S2 : ${nom}`);
  }
});

dit('engagements des défis, utilisateurs connectés, Boîte à zéro, objectif du mois : forme, recoupements, aucune donnée personnelle', () => {
  for (const [nom, m] of [['normal', normal], ['peu', peu], ['beaucoup', gros]] as const) {
    const defis = new Map(m.defis.map((d) => [str(d.id), d]));
    for (const e of m.engagementsDefis) {
      const d = defis.get(str(e.defiId));
      assert.ok(d && (d.participants as string[]).includes(str(e.email)), `${nom} : l'engagement est d'un participant du défi`);
      assert.ok(str(e.texte).length > 0 && str(e.le) <= aujourdhuiDe(m));
    }
    const participants = m.defis.reduce((t, d) => t + (d.participants as string[]).length, 0);
    assert.ok(m.engagementsDefis.length < participants || participants === 0, `${nom} : certaines personnes n'ont pas encore écrit le leur`);
    for (const c of m.utilisateursConnectes) assert.ok(Number.isInteger(num(c.connectes)) && num(c.connectes) >= 0 && num(c.connectes) < 1000 && str(c.jour) <= aujourdhuiDe(m));
    assert.equal(m.utilisateursConnectes.length, nom === 'peu' ? 7 : 30);
    assert.equal(str(m.utilisateursConnectes[m.utilisateursConnectes.length - 1].jour), aujourdhuiDe(m), `${nom} : la dernière barre est celle d'aujourd'hui`);
    const bz = m.boiteAZero;
    for (const b of bz) assert.ok(num(b.aTraiter) >= 0 && (b.zeroAtteint === false || num(b.aTraiter) >= 0));
    for (const b of bz.slice(0, -1)) assert.equal(b.zeroAtteint === true, num(b.aTraiter) === 0 || b.zeroAtteint === true, 'zéro atteint en cours de journée');
    const reg = m.entreprise.reglages as Lien;
    const mrr = m.abonnements.filter((a) => a.etat === 'Actif' && str(a.depuis) <= aujourdhuiDe(m)).reduce((t, a) => t + num(a.montantMensuelCents), 0);
    assert.ok(num(reg.objectifMrrCents) >= Math.max(100_000, mrr) && num(reg.objectifMrrCents) % 10_000 === 0, `${nom} : objectif du mois ≥ revenu récurrent`);
  }
  assert.deepEqual(D.attendusBilanSemaine(normal).boiteAZero, { jours: 3, enCours: true }, 'Boîte à zéro : 3 jours, série en cours');
  assert.equal(vide.boiteAZero.length + vide.utilisateursConnectes.length + vide.engagementsDefis.length, 0);
});

console.log('  — LOT-14 : la charge');

dit('des organisations de charge : reproductibles, emboîtées, de 10 à 600 personnes, rien de réel', () => {
  const cent = D.genererOrganisationsDeCharge({ nombre: 100 });
  const mille = D.genererOrganisationsDeCharge({ nombre: 1000 });
  assert.equal(cent.length, 100);
  assert.equal(mille.length, 1000);
  assert.deepEqual(mille.slice(0, 100), cent, 'les 100 premières organisations d’un essai à 1 000 sont celles de l’essai à 100');
  assert.deepEqual(D.genererOrganisationsDeCharge({ nombre: 100 }), cent, 'reproductible');
  assert.notDeepEqual(D.genererOrganisationsDeCharge({ nombre: 100, graine: 7 }).map((o) => o.effectif), cent.map((o) => o.effectif), 'une autre graine, d’autres organisations');
  for (const lot of [cent, mille]) {
    const effectifs = lot.map((o) => o.effectif);
    assert.ok(Math.min(...effectifs) === 10 && Math.max(...effectifs) === 600 && effectifs.every((e) => Number.isInteger(e) && e >= 10 && e <= 600), 'de 10 à 600, bornes comprises');
    assert.equal(new Set(lot.map((o) => o.id)).size, lot.length);
    assert.equal(new Set(lot.map((o) => o.nom)).size, lot.length, 'noms uniques');
    assert.equal(new Set(lot.map((o) => o.domaine)).size, lot.length, 'domaines uniques');
    assert.ok(lot.every((o) => /^[a-z0-9-]+\.exemple\.test$/.test(o.domaine) && D.estCourrielFictif(o.proprietaire)), 'courriels fictifs');
    assert.deepEqual([...new Set(lot.map((o) => o.taille))].sort(), ['grande', 'moyenne', 'petite'], 'les trois tailles');
    assert.ok(lot.every((o) => o.volume === (o.taille === 'petite' ? 'peu' : o.taille === 'moyenne' ? 'normal' : 'beaucoup')));
    assert.deepEqual([...new Set(lot.map((o) => o.profil))].sort(), ['calme', 'courant', 'intense']);
  }
  assert.equal(D.emailDuMembre(cent[0], 0), cent[0].proprietaire);
  assert.ok(D.estCourrielFictif(D.emailDuMembre(cent[1], 599)));
  assert.throws(() => D.emailDuMembre(cent[0], cent[0].effectif), /hors effectif/);
  assert.throws(() => D.genererOrganisationsDeCharge({ nombre: 10_000 }), /invalide/);
  assert.equal(D.genererOrganisationsDeCharge({ nombre: 0 }).length, 0);
  const texte = JSON.stringify(mille);
  assert.ok(!/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/.test(texte), 'aucune adresse réseau');
});

dit('des organisations connectées en même temps : toujours les mêmes, emboîtées', () => {
  const cent = D.genererOrganisationsDeCharge({ nombre: 100 });
  const vingt = D.choisirConnectees(cent, 20);
  const quarante = D.choisirConnectees(cent, 40);
  assert.equal(vingt.length, 20);
  assert.deepEqual(D.choisirConnectees(cent, 20), vingt);
  assert.ok(vingt.every((o) => quarante.some((x) => x.id === o.id)), 'les 20 sont dans les 40');
  assert.equal(new Set(vingt.map((o) => o.id)).size, 20);
  assert.equal(D.choisirConnectees(cent, 500).length, 100);
  assert.equal(D.choisirConnectees(cent, 0).length, 0);
});

dit('les seuils et la cible du code sont ceux de STATUT §1.20 et de docs/simulation/charge.md', () => {
  assert.deepEqual(D.SEUILS_DE_CHARGE, { partRapide: 0.95, actionRapideMs: 1000, visibiliteMs: 5000 });
  assert.deepEqual(D.CIBLE_DE_CHARGE, { organisations: 100, connectees: 20, internes: 3 });
  assert.equal(D.ESSAI_LONG_HEURES, 72);
  assert.equal(D.PALIERS_DE_CHARGE.at(-1), 1000);
  assert.ok(D.PALIERS_DE_CHARGE.every((p, i, l) => i === 0 || p > l[i - 1]), 'paliers croissants');
  assert.equal(D.EQUIPE_INTERNE_DE_CHARGE.length, 3);
  assert.equal(D.MELANGE_D_ACTIONS.reduce((s, a) => s + a.poids, 0), 100, 'le mélange d’actions fait 100');
  const doc = path.join(here, '..', 'docs', 'simulation', 'charge.md');
  assert.ok(fs.existsSync(doc), 'docs/simulation/charge.md existe');
  const texte = fs.readFileSync(doc, 'utf8');
  for (const motif of ['95 %', '1 s', '5 s', '72 h', '1 000', '20 organisations', '3 personnes', '127.0.0.1']) assert.ok(texte.includes(motif), `charge.md doit citer « ${motif} »`);
  // Le dépôt est public : le document ne décrit aucune faille et ne contient ni secret ni adresse hors 127.0.0.1.
  assert.ok(!/(mot de passe|token|jeton|secret)\s*[:=]\s*\S{6,}/i.test(texte), 'aucun secret dans charge.md');
  assert.ok((texte.match(/\b\d{1,3}(\.\d{1,3}){3}\b/g) ?? []).every((ip) => ip === '127.0.0.1'), 'aucune adresse autre que 127.0.0.1');
});

console.log('  — Le chargeur vers l’API d’essai');

const Chargeur = (await import(path.join(here, 'charger-donnees-essai.mjs'))) as {
  cibleAutorisee: (t: string) => { ok: boolean; base?: string; raison?: string };
  compteAutorise: (e: string) => boolean;
  remplacerChaine: (v: unknown, de: string, vers: string) => unknown;
  CHARGES: { jeu: string; collection: string }[];
};

dit('le chargeur n’écrit que sur 127.0.0.1, en http, sans identifiants ni redirection', () => {
  assert.deepEqual(Chargeur.cibleAutorisee('http://127.0.0.1:4171'), { ok: true, base: 'http://127.0.0.1:4171' });
  for (const refusee of [
    'http://localhost:4171', 'http://[::1]:4171', 'http://0.0.0.0:4171', 'http://127.0.0.2:4171', 'http://127.0.0.1.exemple.test:4171',
    'https://127.0.0.1:4171', 'http://user:mdp@127.0.0.1:4171', 'http://192.168.1.10:4171', 'https://api.exemple.org', 'pas une adresse', '',
  ]) assert.equal(Chargeur.cibleAutorisee(refusee).ok, false, `cible refusée : ${refusee}`);
  const source = fs.readFileSync(path.join(here, 'charger-donnees-essai.mjs'), 'utf8');
  assert.ok(source.includes("redirect: 'error'"), 'une redirection ne doit jamais emmener le chargeur ailleurs');
  const adresses = [...source.matchAll(/https?:\/\/[^\s'"`)\]]+/g)].map((x) => x[0]);
  assert.ok(adresses.every((a) => /^http:\/\/127\.0\.0\.1(:|…|\$\{|$)/.test(a)), `adresse inattendue dans le chargeur : ${adresses.join(' ')}`);
});

dit('le chargeur ne se connecte qu’avec un compte @exemple.test', () => {
  for (const bon of ['essai.interne@exemple.test', 'fleuriste.essai@exemple.test', 'camille.roux@maison-vallon.exemple.test']) assert.equal(Chargeur.compteAutorise(bon), true, bon);
  for (const mauvais of ['quelquun@gmail.com', 'a@exemple.test.fr', 'a@exemple.testt', 'a@autre-exemple.test.org', '@exemple.test', 'exemple.test', '']) assert.equal(Chargeur.compteAutorise(mauvais), false, mauvais);
});

dit('le chargeur remplace « moi » partout, et seulement la chaîne entière', () => {
  const moi = 'camille.roux@maison-vallon.exemple.test';
  const sortie = Chargeur.remplacerChaine({ a: moi, b: [moi, 'autre'], c: { d: `${moi}.x`, e: 3, f: null } }, moi, 'essai.interne@exemple.test');
  assert.deepEqual(sortie, { a: 'essai.interne@exemple.test', b: ['essai.interne@exemple.test', 'autre'], c: { d: `${moi}.x`, e: 3, f: null } });
});

dit('chaque jeu chargé existe, a un identifiant, et sa collection existe dans amn-api (quand le dépôt voisin est là)', () => {
  const noms = new Set(D.NOMS_DES_JEUX);
  assert.equal(new Set(Chargeur.CHARGES.map((c) => c.collection)).size, Chargeur.CHARGES.length, 'une collection par jeu');
  for (const c of Chargeur.CHARGES) {
    assert.ok(noms.has(c.jeu), `jeu inconnu : ${c.jeu}`);
    for (const ligne of normal[c.jeu]) assert.ok(ligne.id !== undefined && ligne.id !== null && String(ligne.id).length > 0 && String(ligne.id).length <= 200, `${c.jeu} : identifiant`);
    assert.equal(new Set(normal[c.jeu].map((l) => String(l.id))).size, normal[c.jeu].length, `${c.jeu} : identifiants uniques`);
  }
  const racines = [process.env.AMN_API_ROOT, '/workspace/amn-api', path.join(here, '..', '..', 'amn-api')].filter(Boolean) as string[];
  const racine = racines.find((r) => fs.existsSync(path.join(r, 'src', 'routes', 'collections.js')));
  if (!racine) return console.log('    (amn-api absent : comparaison des collections passée)');
  const texte = fs.readFileSync(path.join(racine, 'src', 'routes', 'collections.js'), 'utf8');
  const permises = new Set([...texte.slice(texte.indexOf('export const ALLOWED'), texte.indexOf(']);', texte.indexOf('export const ALLOWED'))).matchAll(/^\s*'([A-Za-z]+)',/gm)].map((x) => x[1]));
  assert.ok(permises.size > 50, 'la liste ALLOWED d’amn-api a été lue');
  for (const c of Chargeur.CHARGES) assert.ok(permises.has(c.collection), `amn-api n’ouvre pas la collection « ${c.collection} »`);
});

dit('le scénario de charge « cible » tourne contre une API d’essai en mémoire, sans écriture perdue (quand amn-api est là)', () => {
  const racines = [process.env.AMN_API_ROOT, '/workspace/amn-api', path.join(here, '..', '..', 'amn-api')].filter(Boolean) as string[];
  const racine = racines.find((r) => fs.existsSync(path.join(r, 'src', 'db', 'tenancy.js')));
  if (!racine) return console.log('    (amn-api absent : le scénario de charge n’a pas été joué)');
  const r = spawnSync(process.execPath, [path.join(here, '..', 'simulation', 'charge', 'executer.mjs'), 'cible', '--organisations', '6', '--connectees', '2', '--internes', '1', '--duree-s', '4'], {
    env: { PATH: process.env.PATH, AMN_API_ROOT: racine }, encoding: 'utf8', timeout: 120_000,
  });
  assert.equal(r.status, 0, `le scénario a échoué : ${r.stderr.slice(0, 300)}`);
  assert.ok(/Écritures acquittées : \d+ · perdues ou écrasées : 0/.test(r.stdout), 'aucune écriture perdue');
  assert.ok(!/(?:^|\D)(?!127\.0\.0\.1\b)\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(r.stdout), 'le compte rendu ne cite aucune autre adresse');
});

console.log(`\n${vus} contrôles, tous au vert.`);

/**
 * Contrôle des CONNECTEURS ET DE L'AUTONOMIE (LOT-12) — `src/refonte/connecteurs/`.
 *
 * Ce que le plan exige (PLAN-10NOV §4), éprouvé hors application :
 *
 *   · chaque catégorie du §4 a une version locale, et un connecteur arrêté
 *     rend la main au mode local (l'écran reste utilisable) ;
 *   · le coût s'affiche AVANT l'activation, avec sa source et sa date ; sans
 *     tarif relevé, pas d'activation (jamais un chiffre deviné) ;
 *   · activer en trois clics au plus, arrêter en deux ; plafond mensuel ;
 *   · la banque reste en lecture seule ;
 *   · aucun champ, aucun fichier de la zone ne porte une clé ; aucun appel réseau ;
 *   · l'interface tutoie, les textes destinés aux clients vouvoient ;
 *   · les moteurs locaux (courriels, rappels, relances, rapports, tri,
 *     sauvegardes, planificateur) tiennent leurs règles, heure de Paris comprise ;
 *   · le format des flux Quand / Si / Alors, et son pont avec `useAutomations` ;
 *   · le tout rejoué sur les jeux fictifs de SIM (vide, peu, normal, beaucoup).
 *
 *   npm run check:connecteurs
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const here = path.dirname(fileURLToPath(import.meta.url));
const racine = path.join(here, '..');
const ZONE = path.join(racine, 'src/refonte/connecteurs');

async function loadFromSrc<T>(entry: string): Promise<T> {
  const built = await esbuild.build({
    entryPoints: [path.join(racine, entry)],
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

const K = await loadFromSrc<any>('src/refonte/connecteurs/index.ts');
const D = await loadFromSrc<any>('src/refonte/donnees/index.ts');
const { temps, planificateur, courriels, relances, rappels, tri, rapports, sauvegardes } = K.moteurs;

let vus = 0;
const dit = (nom: string, fn: () => void) => {
  fn();
  vus += 1;
  console.log(`  ✓ ${nom}`);
};
const section = (titre: string) => console.log(`\n${titre}`);

/** Jeudi 12 novembre 2026, 10:42 à Paris. */
const MAINTENANT = Date.UTC(2026, 10, 12, 9, 42);
const AUJ = '2026-11-12';
const paris = (jour: string, hhmm: string) => temps.instantParis(jour, hhmm);
const MIN = 60_000;
const H = 3_600_000;

const ctx = (sur: Record<string, unknown> = {}) => ({
  maintenant: MAINTENANT,
  aujourdhui: AUJ,
  peutGerer: true,
  enLigne: true,
  parEmail: 'harun@equipe.exemple.test',
  ...sur,
});

/** Un tarif FICTIF, pour éprouver le cycle : jamais dans le catalogue réel. */
const tarifFictif = (sur: Record<string, unknown> = {}) => ({
  etat: 'releve',
  formule: 'a-l-usage',
  fixeMensuelCents: 500,
  parUniteCents: 5,
  unite: 'sms',
  inclusParMois: 100,
  source: 'https://tarifs.exemple.test/sms',
  releveLe: '2026-11-02',
  horsTaxes: true,
  ...sur,
});

const ok = (r: any) => {
  assert.equal(r.ok, true, `refusé : ${r.raison}`);
  return r.valeur;
};

/* ─────────────────────────────── Catalogue ─────────────────────────────── */
section('Catalogue');

const ORDRE_DU_PLAN = [
  'messagerie', 'agenda', 'paiement', 'banque', 'stockage', 'hebergement', 'code',
  'notifications', 'sms', 'whatsapp', 'telephonie', 'signature', 'assistant', 'comptabilite',
];

dit('les 14 catégories du §4 du plan, dans son ordre, sans doublon', () => {
  assert.deepEqual(K.CATALOGUE.map((c: any) => c.id), ORDRE_DU_PLAN);
});

dit('chaque catégorie a une version locale décrite, avec une disponibilité connue', () => {
  for (const c of K.CATALOGUE) {
    assert.ok(['prete', 'partielle', 'a-construire'].includes(c.local.disponibilite), c.id);
    for (const cle of [c.nom, c.local.nom, c.local.description]) {
      assert.ok(K.DICTIONNAIRES_CONNECTEURS.fr[cle] && K.DICTIONNAIRES_CONNECTEURS.en[cle], `${c.id} : ${cle}`);
    }
  }
});

dit('les fichiers « existant » cités par le catalogue sont bien dans le dépôt', () => {
  for (const c of K.CATALOGUE) for (const f of c.local.existant) assert.ok(fs.existsSync(path.join(racine, f)), `${c.id} : ${f}`);
});

dit('ce qu’une version locale attend d’amn-api est dans la liste « Demandé à amn-api »', () => {
  const ids = new Set(K.DEMANDES_AMN_API.map((d: any) => d.id));
  for (const c of K.CATALOGUE) for (const a of c.local.attendDAmnApi) assert.ok(ids.has(a), `${c.id} : ${a}`);
});

dit('chaque catégorie a au moins un service externe facultatif ; identifiants uniques', () => {
  for (const c of K.CATALOGUE) {
    assert.ok(c.options.some((o: any) => o.nature === 'service'), c.id);
    const ids = c.options.map((o: any) => o.id);
    assert.equal(new Set(ids).size, ids.length, c.id);
  }
});

dit('une brique « chez nous » est gratuite par construction, un service n’a jamais de tarif écrit de mémoire', () => {
  for (const c of K.CATALOGUE) {
    for (const o of c.options) {
      if (o.nature === 'chez-nous') assert.equal(o.tarif.etat, 'chez-nous', `${c.id}/${o.id}`);
      else assert.equal(o.tarif.etat, 'a-relever', `${c.id}/${o.id} : un tarif se relève dans tarifs.ts`);
    }
  }
});

dit('la banque reste en lecture seule : aucune option ne demande plus que « lecture »', () => {
  const banque = K.categorie('banque');
  for (const d of ['ajout', 'ecriture', 'envoi']) assert.ok(banque.droitsInterdits.includes(d), d);
  for (const o of banque.options) assert.deepEqual([...o.droits], ['lecture'], o.id);
});

dit('aucune option ne demande un droit interdit dans sa catégorie', () => {
  for (const c of K.CATALOGUE) for (const o of c.options) for (const d of o.droits) assert.ok(!c.droitsInterdits.includes(d), `${c.id}/${o.id}`);
});

dit('la prise « Passerelle SMS » de H21 existe, en brique chez nous', () => {
  const o = K.optionDe('sms', 'passerelle-sms');
  assert.equal(o?.nature, 'chez-nous');
});

dit('numéro de prise sur deux chiffres : P01, P10', () => {
  assert.equal(K.numeroDePrise(1), 'P01');
  assert.equal(K.numeroDePrise(10), 'P10');
});

/* ──────────────────────────────── Tarifs ──────────────────────────────── */
section('Tarifs relevés');

const releveValide = { categorie: 'sms', optionId: 'twilio', tarif: tarifFictif() };

dit('chaque relevé de tarifs.ts est recevable (source https, date passée, montants positifs)', () => {
  for (const r of K.RELEVES) assert.deepEqual(K.defautsDuReleve(r, AUJ), [], `${r.categorie}/${r.optionId}`);
});

dit('un relevé fictif bien formé passe ; chaque défaut est nommé', () => {
  assert.deepEqual(K.defautsDuReleve(releveValide, AUJ), []);
  const defauts = (sur: any, opt = {}) => K.defautsDuReleve({ ...releveValide, ...opt, tarif: tarifFictif(sur) }, AUJ);
  assert.equal(defauts({ source: 'http://tarifs.exemple.test/sms' }).length, 1);
  assert.equal(defauts({ releveLe: '2026-11-20' }).length, 1);
  assert.equal(defauts({ parUniteCents: -1 }).length, 1);
  assert.equal(defauts({ formule: 'abonnement', fixeMensuelCents: undefined }).length, 1);
  assert.equal(defauts({ formule: 'gratuit' }).length, 1);
  assert.equal(defauts({}, { optionId: 'passerelle-sms' }).length, 1);
  assert.equal(defauts({}, { optionId: 'inconnue' }).length, 1);
});

dit('fraîcheur : frais jusqu’à 90 jours, ancien jusqu’à 365, périmé au-delà', () => {
  assert.equal(K.fraicheur({ etat: 'a-relever' }, AUJ), 'a-relever');
  assert.equal(K.fraicheur({ etat: 'chez-nous' }, AUJ), 'chez-nous');
  assert.equal(K.fraicheur(tarifFictif({ releveLe: '2026-08-14' }), AUJ), 'frais'); // 90 j
  assert.equal(K.fraicheur(tarifFictif({ releveLe: '2026-08-13' }), AUJ), 'ancien'); // 91 j
  assert.equal(K.fraicheur(tarifFictif({ releveLe: '2025-11-12' }), AUJ), 'ancien'); // 365 j
  assert.equal(K.fraicheur(tarifFictif({ releveLe: '2025-11-11' }), AUJ), 'perime');
});

/* ───────────────────────────────── Cycle ───────────────────────────────── */
section('Cycle : coût avant, trois clics, plafond, retour au local');

const catalogueEssai = K.catalogueTarife([releveValide]);
const ctxEssai = (sur: Record<string, unknown> = {}) => ctx({ catalogue: catalogueEssai, ...sur });

dit('les parcours tiennent en trois clics au plus (activer 3, arrêter 2, reconnecter 2)', () => {
  assert.ok(K.PARCOURS.activer.length <= K.CLICS_MAX);
  assert.ok(K.PARCOURS.arreter.length <= K.CLICS_MAX);
  assert.ok(K.PARCOURS.reconnecter.length <= K.CLICS_MAX);
  assert.equal(K.CLICS_MAX, 3);
});

dit('jamais deviné : aucun service du catalogue réel ne s’active tant que son tarif n’est pas relevé', () => {
  for (const c of K.CATALOGUE) {
    for (const o of c.options.filter((x: any) => x.nature === 'service')) {
      const r = K.preparerActivation(K.instanceLibre(c.id, o.id, 1), ctx());
      assert.deepEqual(r, { ok: false, raison: 'tarif-a-relever' }, `${c.id}/${o.id}`);
    }
  }
});

dit('clic 1 : le coût s’affiche avant, avec la source et la date du relevé', () => {
  const devis = ok(K.preparerActivation(K.instanceLibre('sms', 'twilio', 8), ctxEssai()));
  assert.equal(devis.tarif.source, 'https://tarifs.exemple.test/sms');
  assert.equal(devis.tarif.releveLe, '2026-11-02');
  assert.equal(devis.gratuit, false);
  assert.equal(devis.fraicheur, 'frais');
});

dit('refus nommés : sans droit de gérer, hors ligne, tarif périmé, déjà actif', () => {
  const libre = K.instanceLibre('sms', 'twilio', 8);
  assert.equal(K.preparerActivation(libre, ctxEssai({ peutGerer: false })).raison, 'sans-droit-de-gerer');
  assert.equal(K.preparerActivation(libre, ctxEssai({ enLigne: false })).raison, 'hors-ligne');
  const vieux = K.catalogueTarife([{ ...releveValide, tarif: tarifFictif({ releveLe: '2025-01-01' }) }]);
  assert.equal(K.preparerActivation(libre, ctx({ catalogue: vieux })).raison, 'tarif-perime');
  assert.equal(K.preparerActivation({ ...libre, etat: 'connecte', motif: null }, ctxEssai()).raison, 'deja-actif');
});

/** Le parcours complet d'activation, clic par clic. */
function activerJusquAuBout(inst: any, plafond: number, c = ctxEssai()) {
  const devis = ok(K.preparerActivation(inst, c)); // clic 1 : Brancher
  const apres = ok(K.activer(inst, devis, plafond, c)); // clic 2 : Activer
  const fini = ok(K.autorisationRecue(apres.instance, c.maintenant + MIN)); // clic 3 : Autoriser
  return { devis, apres, fini };
}

dit('clic 2 : un service payant exige un plafond au-dessus de zéro ; le coût accepté est une copie', () => {
  const libre = K.instanceLibre('sms', 'twilio', 8);
  const devis = ok(K.preparerActivation(libre, ctxEssai()));
  assert.equal(K.activer(libre, devis, 0, ctxEssai()).raison, 'plafond-invalide');
  assert.equal(K.activer(libre, devis, 12.5, ctxEssai()).raison, 'plafond-invalide');
  const { instance, journal } = ok(K.activer(libre, devis, 2000, ctxEssai()));
  assert.equal(instance.etat, 'a-connecter');
  assert.equal(instance.motif, 'autorisation-en-attente');
  assert.equal(K.modeEffectif(instance), 'local', 'tant que le service n’a pas autorisé, le local tourne');
  devis.tarif.parUniteCents = 999;
  assert.equal(instance.coutAccepte.tarif.parUniteCents, 5);
  assert.equal(journal.geste, 'activation');
  assert.equal(journal.parEmail, 'harun@equipe.exemple.test');
});

dit('clic 3 : autorisé, le service est connecté et la catégorie passe en mode externe', () => {
  const { fini } = activerJusquAuBout(K.instanceLibre('sms', 'twilio', 8), 2000);
  assert.equal(fini.instance.etat, 'connecte');
  assert.equal(fini.instance.motif, null);
  assert.equal(K.modeEffectif(fini.instance, catalogueEssai), 'externe');
  assert.equal(K.modeDeCategorie('sms', [fini.instance], 'envoi', catalogueEssai), 'externe');
  assert.deepEqual(K.defautsDePrise(fini.instance, catalogueEssai), []);
});

dit('une brique chez nous : 0 €, plafond 0 accepté, et la catégorie reste en mode LOCAL', () => {
  const { devis, fini } = activerJusquAuBout(K.instanceLibre('sms', 'passerelle-sms', 9), 0);
  assert.equal(devis.gratuit, true);
  assert.equal(fini.instance.etat, 'connecte');
  assert.equal(K.modeDeCategorie('sms', [fini.instance]), 'local');
  assert.equal(K.briqueChezNousBranchee('sms', [fini.instance]), true);
});

dit('arrêter (2 clics) : données gardées, droits et coût oubliés, le mode local reprend', () => {
  const { fini } = activerJusquAuBout(K.instanceLibre('sms', 'twilio', 8), 2000);
  const { instance, journal } = ok(K.arreter(fini.instance, 'volontaire', ctx()));
  assert.equal(instance.etat, 'arrete');
  assert.deepEqual(instance.droits, []);
  assert.equal(instance.coutAccepte, null);
  assert.equal(K.modeDeCategorie('sms', [instance], undefined, catalogueEssai), 'local');
  assert.equal(journal.detail, 'journal.arret');
  assert.deepEqual(K.defautsDePrise(instance, catalogueEssai), []);
  assert.equal(K.arreter(instance, 'volontaire', ctx()).raison, 'pas-connecte');
  assert.equal(K.arreter(K.instanceLibre('sms', 'twilio', 8), 'volontaire', ctx()).raison, 'pas-connecte');
});

dit('arrêter à la main demande le droit de gérer et le réseau ; le plafond, non', () => {
  const { fini } = activerJusquAuBout(K.instanceLibre('sms', 'twilio', 8), 2000);
  assert.equal(K.arreter(fini.instance, 'volontaire', ctx({ peutGerer: false })).raison, 'sans-droit-de-gerer');
  assert.equal(K.arreter(fini.instance, 'volontaire', ctx({ enLigne: false })).raison, 'hors-ligne');
  const auPlafond = ok(K.arreter(fini.instance, 'plafond', ctx({ peutGerer: false, enLigne: false })));
  assert.equal(auPlafond.instance.motif, 'plafond');
  assert.equal(auPlafond.journal.parEmail, null);
});

dit('réactiver remontre le coût : rien n’est réactivé sans un nouveau « Activer »', () => {
  const { fini } = activerJusquAuBout(K.instanceLibre('sms', 'twilio', 8), 2000);
  const arrete = ok(K.arreter(fini.instance, 'volontaire', ctx())).instance;
  assert.equal(K.autorisationRecue(arrete, MAINTENANT).raison, 'rien-a-reconnecter');
  assert.equal(K.preparerActivation(arrete, ctxEssai()).ok, true);
});

dit('autorisation expirée : « à reconnecter », local en attendant, reconnexion en 2 clics sans redemander le coût', () => {
  const { fini } = activerJusquAuBout(K.instanceLibre('sms', 'twilio', 8), 2000);
  const panne = ok(K.signalerErreur(fini.instance, { at: MAINTENANT, message: 'erreur.autorisation-expiree', enAttente: 14 }, true));
  assert.equal(panne.instance.motif, 'a-reconnecter');
  assert.equal(K.modeDeCategorie('sms', [panne.instance], undefined, catalogueEssai), 'local');
  assert.deepEqual(K.defautsDePrise(panne.instance, catalogueEssai), []);
  ok(K.demanderReconnexion(panne.instance, ctx())); // clic 1
  const repris = ok(K.autorisationRecue(panne.instance, MAINTENANT + H)); // clic 2
  assert.equal(repris.journal.geste, 'reconnexion');
  assert.equal(repris.instance.coutAccepte.plafondMensuelCents, 2000);
  const autre = ok(K.signalerErreur(fini.instance, { at: MAINTENANT, message: 'erreur.service-indisponible', enAttente: 0 }, false));
  assert.equal(autre.instance.motif, 'erreur');
});

dit('numérotation des prises : fixe, jamais réutilisée', () => {
  const baie = K.baieInitiale([{ categorie: 'paiement', optionId: 'stripe' }, { categorie: 'agenda', optionId: 'google-agenda' }]);
  assert.deepEqual(baie.map((i: any) => i.prise), [1, 2]);
  assert.equal(K.prochainePrise([baie[1]]), 3);
});

/* ──────────────────────────── Baie (H21) ──────────────────────────── */
section('Règles de la baie (H21)');

/** Une prise branchée, avec un coût accepté fictif (le parcours a eu lieu). */
function branchee(categorie: string, optionId: string, prise: number, sur: Record<string, unknown> = {}) {
  const opt = K.optionDe(categorie, optionId);
  const tarif = opt.nature === 'chez-nous' ? { etat: 'chez-nous' } : tarifFictif();
  return {
    ...K.instanceLibre(categorie, optionId, prise),
    etat: 'connecte',
    motif: null,
    droits: opt.droits,
    coutAccepte: { optionId, tarif, plafondMensuelCents: 2000, accepteAt: MAINTENANT - 30 * 86_400_000, parEmail: 'harun@equipe.exemple.test' },
    derniereSynchroAt: MAINTENANT - 2 * MIN,
    ...sur,
  };
}

const BAIE = [
  branchee('paiement', 'stripe', 1, { synchroEnCours: true }),
  branchee('hebergement', 'vercel', 2),
  branchee('agenda', 'google-agenda', 3),
  { ...branchee('messagerie', 'gmail', 4), etat: 'a-connecter', motif: 'a-reconnecter', erreur: { at: MAINTENANT - 17 * H, message: 'erreur.autorisation-expiree', enAttente: 14 } },
  branchee('whatsapp', 'whatsapp-business', 5),
  branchee('hebergement', 'render', 6, { synchroEnCours: true }),
  branchee('notifications', 'slack', 7),
  branchee('sms', 'passerelle-sms', 8),
  K.instanceLibre('code', 'github', 9),
  K.instanceLibre('signature', 'yousign', 10),
];

dit('la baie d’exemple est cohérente prise par prise', () => {
  for (const i of BAIE) assert.deepEqual(K.defautsDePrise(i), [], K.numeroDePrise(i.prise));
});

dit('santé : 7 sur 8 en forme ; les libres ne comptent pas ; badge = 1', () => {
  const s = K.santeDeLaBaie(BAIE, MAINTENANT);
  assert.equal(s.enForme, 7);
  assert.equal(s.branchees, 8);
  assert.equal(s.aReconnecter, 1);
  assert.equal(s.libres, 2);
  assert.equal(K.badge(BAIE, MAINTENANT), 1);
});

dit('puces : Toutes 10, Branchées 8, À reconnecter 1, Libres 2', () => {
  assert.deepEqual(K.comptesDesPuces(BAIE, MAINTENANT), { toutes: 10, branchees: 8, 'a-reconnecter': 1, libres: 2 });
});

dit('une seule synchro animée à la fois : la première dans l’ordre des prises', () => {
  assert.equal(K.priseAnimee(BAIE), 1);
  assert.equal(K.priseAnimee(BAIE.slice(1)), 6);
  assert.equal(K.priseAnimee(BAIE.slice(1, 5)), null);
});

dit('droits accordés : 4 en lecture seule, 2 en lecture et écriture, 2 en envoi ou réception', () => {
  const g = K.droitsAccordes(BAIE, MAINTENANT);
  assert.deepEqual(g['lecture-seule'], ['paiement', 'hebergement', 'messagerie', 'hebergement']);
  assert.deepEqual(g['lecture-ecriture'], ['agenda', 'whatsapp']);
  assert.deepEqual(g['envoi-reception'], ['notifications', 'sms']);
});

dit('dernière erreur : Gmail ; aucune erreur → null', () => {
  assert.equal(K.derniereErreur(BAIE).optionId, 'gmail');
  assert.equal(K.derniereErreur(BAIE.filter((i: any) => i.prise !== 4)), null);
});

dit('plus de 24 h sans synchro : « synchro en retard », branchée mais pas en forme', () => {
  const tard = { ...BAIE[1], derniereSynchroAt: MAINTENANT - 25 * H };
  assert.equal(K.etatDePrise(tard, MAINTENANT), 'synchro-en-retard');
  const s = K.santeDeLaBaie([tard], MAINTENANT);
  assert.equal(s.branchees, 1);
  assert.equal(s.enForme, 0);
});

dit('« il y a » : secondes, minutes, heures, hier, date — veille au calendrier, même au changement d’heure', () => {
  assert.deepEqual(K.depuis(MAINTENANT - 30_000, MAINTENANT), { unite: 's', valeur: 30 });
  assert.deepEqual(K.depuis(MAINTENANT - 5 * MIN, MAINTENANT), { unite: 'min', valeur: 5 });
  assert.deepEqual(K.depuis(MAINTENANT - 3 * H, MAINTENANT), { unite: 'h', valeur: 3 });
  assert.deepEqual(K.depuis(paris('2026-11-11', '17:12'), MAINTENANT), { unite: 'hier' });
  assert.deepEqual(K.depuis(paris('2026-11-09', '17:12'), MAINTENANT), { unite: 'date', jour: '2026-11-09' });
  // Lundi 30 mars 2026, 00:30 : la veille (dimanche 29, 23 h seulement) n'est pas « maintenant − 24 h ».
  assert.deepEqual(K.depuis(paris('2026-03-29', '00:10'), paris('2026-03-30', '00:30')), { unite: 'hier' });
});

/* ──────────────────────────────── Coûts ──────────────────────────────── */
section('Coûts (DEV-couts)');

const CONSO = [
  { categorie: 'messagerie', operationsLocales: 412, operationsExternes: 0, payeCents: 0 },
  { categorie: 'agenda', operationsLocales: 96, operationsExternes: 0, payeCents: 0 },
  { categorie: 'paiement', operationsLocales: 0, operationsExternes: 18, payeCents: 0, encaisseCents: 540_000 },
  { categorie: 'sms', operationsLocales: 0, operationsExternes: 180, payeCents: 1400 },
];

dit('part faite en local : opérations locales sur le total, arrondie ; rien ce mois → null', () => {
  assert.equal(K.partLocale(CONSO), Math.round((508 * 100) / 706));
  assert.equal(K.partLocale([]), null);
  assert.equal(K.partLocale([{ categorie: 'sms', operationsLocales: 0, operationsExternes: 0, payeCents: 0 }]), null);
});

dit('payé ce mois, en centimes entiers', () => {
  assert.equal(K.payeCeMois(CONSO), 1400);
});

dit('plafond : prévenir à 80 % pile, tout s’arrête au plafond', () => {
  assert.equal(K.etatPlafond(1400, 4000), 'sous');
  assert.equal(K.etatPlafond(3199, 4000), 'sous');
  assert.equal(K.etatPlafond(3200, 4000), 'prevenir');
  assert.equal(K.etatPlafond(4000, 4000), 'atteint');
  assert.equal(K.etatPlafond(0, 0), 'sous');
});

dit('coût d’un tarif : abonnement + usage au-delà de l’inclus ; commission ; arrondi au centime supérieur', () => {
  assert.equal(K.coutPour(tarifFictif(), 180), 500 + 80 * 5);
  assert.equal(K.coutPour(tarifFictif(), 50), 500);
  const commission = tarifFictif({ formule: 'commission', fixeMensuelCents: undefined, parUniteCents: undefined, commissionDixMillieme: 150, commissionFixeCents: 25 });
  assert.equal(K.coutPour(commission, 18, 540_000), 8100 + 450);
  assert.equal(K.coutPour(tarifFictif({ fixeMensuelCents: 0, parUniteCents: 0.45, inclusParMois: 0 }), 3), 2);
});

dit('au plafond d’une prise, elle seule s’arrête ; au plafond global, tous les payants ; le local reprend', () => {
  const sms = branchee('sms', 'twilio', 1);
  const stripe = branchee('paiement', 'stripe', 2);
  const passerelle = branchee('sms', 'passerelle-sms', 3);
  const propre = K.arretsDusAuPlafond([sms, stripe, passerelle], [{ categorie: 'sms', operationsLocales: 0, operationsExternes: 400, payeCents: 2000 }], 10_000, MAINTENANT);
  assert.deepEqual(propre.map((c: any) => c.instance.optionId), ['twilio']);
  assert.equal(propre[0].instance.motif, 'plafond');
  const global = K.arretsDusAuPlafond([sms, stripe, passerelle], [{ categorie: 'sms', operationsLocales: 0, operationsExternes: 40, payeCents: 1000 }], 1000, MAINTENANT);
  assert.deepEqual(global.map((c: any) => c.instance.optionId), ['twilio', 'stripe']);
  assert.equal(K.modeDeCategorie('sms', [global[0].instance, passerelle]), 'local');
  assert.equal(K.arretsDusAuPlafond([sms, stripe], CONSO, 4000, MAINTENANT).length, 0);
});

dit('« si tout passait par des API » : jamais estimé sans tarif relevé pour chaque catégorie active', () => {
  assert.equal(K.siToutEnApi(CONSO, { sms: tarifFictif() }), null);
  assert.equal(K.economise(CONSO, {}), null);
  const refs = { messagerie: tarifFictif({ inclusParMois: 0 }), agenda: tarifFictif({ inclusParMois: 0 }), paiement: tarifFictif(), sms: tarifFictif() };
  const tout = K.siToutEnApi(CONSO, refs);
  assert.equal(tout, 500 + 412 * 5 + 500 + 96 * 5 + 500 + 500 + 80 * 5);
  assert.equal(K.economise(CONSO, refs), tout - 1400);
  assert.equal(K.economise([{ categorie: 'sms', operationsLocales: 0, operationsExternes: 1, payeCents: 99_999 }], { sms: tarifFictif() }), 0);
});

dit('projection et forfait : 180 SMS au 12 sur 30 jours → 450 ; 180 sur 250 inclus = 72 %', () => {
  assert.equal(K.projectionFinDeMois(180, 12, 30), 450);
  assert.equal(K.partDuForfait(180, 250), 72);
  assert.equal(K.partDuForfait(180, undefined), null);
  assert.ok(72 >= K.SEUIL_SUGGESTION_FORFAIT);
});

dit('six derniers mois, à cheval sur deux années, mois vides à 0', () => {
  const six = K.sixDerniersMois([{ mois: '2026-12', payeCents: 300 }, { mois: '2027-02', payeCents: 1400 }, { mois: '2026-01', payeCents: 9 }], '2027-02');
  assert.deepEqual(six.map((m: any) => m.mois), ['2026-09', '2026-10', '2026-11', '2026-12', '2027-01', '2027-02']);
  assert.deepEqual(six.map((m: any) => m.payeCents), [0, 0, 0, 300, 0, 1400]);
});

dit('pastilles de DEV-couts : Payant, Service gratuit, Local, À brancher', () => {
  assert.equal(K.pastille('sms', [branchee('sms', 'twilio', 1)]), 'payant');
  const gratuit = { ...branchee('sms', 'twilio', 1), coutAccepte: { ...branchee('sms', 'twilio', 1).coutAccepte, tarif: tarifFictif({ formule: 'gratuit', fixeMensuelCents: 0, parUniteCents: 0 }) } };
  assert.equal(K.pastille('sms', [gratuit]), 'externe-gratuit');
  assert.equal(K.pastille('messagerie', []), 'local');
  assert.equal(K.pastille('whatsapp', []), 'a-brancher');
  assert.equal(K.pastille('sms', [branchee('sms', 'passerelle-sms', 1)]), 'local');
  assert.equal(K.pastille('sms', [ok(K.arreter(branchee('sms', 'twilio', 1), 'volontaire', ctx())).instance]), 'a-brancher');
});

/* ──────────────────────────────── Flux ──────────────────────────────── */
section('Flux Quand / Si / Alors (DEV-editeur)');

const DEVIS_PAR_COURRIEL = {
  id: 'devis-courriel',
  nom: 'Demande de devis par courriel',
  etat: 'actif',
  quand: { id: 'q', mode: 'local', type: 'courriel-recu', parametres: { boite: 'contact@' } },
  si: { id: 's', mode: 'local', type: 'contient-mots', parametres: { mots: ['devis', 'tarif', 'prix'] } },
  alors: [
    { id: 'a1', mode: 'local', type: 'creer-contact', parametres: {} },
    { id: 'a2', mode: 'local', type: 'repondre-modele', parametres: { modeleId: 'accuse-devis' } },
    { id: 'a3', mode: 'local', type: 'creer-tache', parametres: { titre: 'Chiffrer la mission', echeanceJours: 1 } },
  ],
  sinon: [{ id: 'n1', mode: 'local', type: 'classer', parametres: { dossier: 'a-lire' } }],
};

dit('le flux de la maquette est valide, et se lit QUAND, SI, ALORS, PUIS, PUIS, SINON', () => {
  assert.deepEqual(K.defautsDuFlux(DEVIS_PAR_COURRIEL), []);
  assert.deepEqual(['q', 's', 'a1', 'a2', 'a3', 'n1'].map((id) => K.roleAffiche(DEVIS_PAR_COURRIEL, id)), ['quand', 'si', 'alors', 'puis', 'puis', 'sinon']);
  assert.equal(K.modeDuFlux(DEVIS_PAR_COURRIEL), 'local');
});

dit('mots repérés : sans accents ni casse, mot entier, pluriel simple, expressions', () => {
  assert.ok(K.contientUnMot('Quel est votre TARIF ?', ['tarif']));
  assert.ok(K.contientUnMot('Vos tarifs, svp', ['tarif']));
  assert.ok(K.contientUnMot('Un dévis rapide', ['devis']));
  assert.ok(!K.contientUnMot('prixfixe', ['prix']));
  assert.ok(!K.contientUnMot('Bonjour', ['', '  ']));
  assert.ok(K.contientUnMot('On peut prendre rendez-vous ?', ['rendez-vous']));
  assert.ok(K.contientUnMot('ça ne marche pas', ['ne marche pas']));
});

dit('tester : la branche Alors pour une demande de devis, Sinon pour le reste, rien pour une autre boîte', () => {
  const e = { type: 'courriel-recu', at: MAINTENANT, texte: 'Bonjour, quel est votre prix pour un site ?', boite: 'contact@equipe.exemple.test' };
  const oui = K.essayer(DEVIS_PAR_COURRIEL, e, { instances: [] });
  assert.equal(oui.branche, 'alors');
  assert.deepEqual(oui.etapes.map((x: any) => x.type), ['creer-contact', 'repondre-modele', 'creer-tache']);
  assert.ok(oui.etapes.every((x: any) => x.mode === 'local'));
  const non = K.essayer(DEVIS_PAR_COURRIEL, { ...e, texte: 'Une question sur la réunion' }, { instances: [] });
  assert.equal(non.branche, 'sinon');
  assert.equal(K.essayer(DEVIS_PAR_COURRIEL, { ...e, boite: 'factures@equipe.exemple.test' }, { instances: [] }).declenche, false);
  assert.equal(K.essayer(DEVIS_PAR_COURRIEL, { ...e, type: 'paiement-recu' }, { instances: [] }).declenche, false);
});

dit('défauts nommés : sinon sans si, si incompatible, heure, jours, modèle client, mode, taille, doublon, nom', () => {
  const avec = (sur: any) => K.defautsDuFlux({ ...DEVIS_PAR_COURRIEL, ...sur });
  assert.ok(avec({ si: null }).includes('sinon-sans-si'));
  assert.ok(avec({ alors: [] }).includes('sans-action'));
  assert.ok(avec({ si: { id: 's', mode: 'local', type: 'montant-au-moins', parametres: { montantCents: 100 } } }).includes('si-incompatible'));
  assert.ok(avec({ si: { id: 's', mode: 'local', type: 'contient-mots', parametres: { mots: [' '] } } }).includes('mots-vides'));
  const horaire = { id: 'q', mode: 'local', type: 'horaire', parametres: { heure: '8:00' } };
  assert.ok(avec({ quand: horaire, si: null, sinon: [] }).includes('heure-invalide'));
  assert.ok(avec({ quand: { ...horaire, parametres: { heure: '08:00', jours: [0] } }, si: null, sinon: [] }).includes('jours-invalides'));
  assert.deepEqual(avec({ quand: { ...horaire, parametres: { heure: '08:00', jours: [1, 5] } }, si: null, sinon: [] }), []);
  assert.ok(avec({ alors: [{ id: 'a2', mode: 'local', type: 'repondre-modele', parametres: {} }] }).includes('modele-manquant'));
  assert.ok(avec({ alors: [{ id: 'a3', mode: 'api', type: 'creer-tache', parametres: {} }] }).includes('mode-impossible'));
  assert.ok(avec({ quand: { ...DEVIS_PAR_COURRIEL.quand, type: 'horaire', mode: 'api', parametres: { heure: '08:00' } }, si: null, sinon: [] }).includes('mode-impossible'));
  const sept = Array.from({ length: 7 }, (_, i) => ({ id: `t${i}`, mode: 'local', type: 'creer-tache', parametres: {} }));
  assert.ok(avec({ alors: sept }).includes('trop-de-blocs'));
  assert.ok(avec({ sinon: [{ id: 'a1', mode: 'local', type: 'classer', parametres: {} }] }).includes('id-en-double'));
  assert.ok(avec({ nom: '  ' }).includes('nom-vide'));
});

dit('un bloc API dont le service est arrêté repasse en local : un flux ne casse jamais', () => {
  const bloc = { id: 'x', mode: 'api', type: 'envoyer-sms', parametres: { modeleId: 'rappel-rdv' } };
  const sms = branchee('sms', 'twilio', 1);
  assert.equal(K.modeEffectifBloc(bloc, 'action', []), 'local');
  assert.equal(K.modeEffectifBloc(bloc, 'action', [sms]), 'api');
  assert.equal(K.modeEffectifBloc(bloc, 'action', [ok(K.arreter(sms, 'volontaire', ctx())).instance]), 'local');
  assert.equal(K.modeEffectifBloc(bloc, 'action', [branchee('sms', 'passerelle-sms', 2)]), 'local');
});

dit('« Tu peux changer à tout moment » : la bascule ne touche que les blocs qui le peuvent', () => {
  const api = K.basculerFlux(DEVIS_PAR_COURRIEL, 'api');
  assert.equal(api.quand.mode, 'api');
  assert.equal(api.alors[1].mode, 'api');
  assert.equal(api.alors[0].mode, 'local');
  assert.equal(api.si.mode, 'local');
  assert.equal(K.modeDuFlux(api), 'api');
  assert.deepEqual(K.defautsDuFlux(api), []);
  assert.deepEqual(K.basculerFlux(api, 'local'), DEVIS_PAR_COURRIEL);
});

dit('pont avec useAutomations : chaque automatisation se lit en flux, et revient à l’identique', () => {
  for (const trigger of ['formAnswer', 'invoiceOverdue', 'ticketOpened', 'prospectWon', 'stockLow']) {
    for (const action of ['task', 'logbook']) {
      for (const enabled of [true, false]) {
        const a = { trigger, action, enabled, assigneeEmail: 'aaron@equipe.exemple.test', createdAt: '2026-11-01T08:00:00.000Z' };
        const f = K.depuisAutomation('r1', 'Règle', a);
        assert.deepEqual(K.defautsDuFlux(f), [], `${trigger}/${action}`);
        assert.deepEqual(K.versAutomation(f, a.createdAt), a, `${trigger}/${action}/${enabled}`);
      }
    }
  }
  assert.equal(K.versAutomation(DEVIS_PAR_COURRIEL, AUJ), null);
});

/* ──────────────────────────── Moteurs locaux ──────────────────────────── */
section('Moteurs locaux : heure de Paris et planificateur');

dit('heure de Paris : hiver UTC+1, été UTC+2', () => {
  assert.equal(paris('2026-11-12', '10:42'), MAINTENANT);
  assert.equal(paris('2026-07-01', '08:00'), Date.UTC(2026, 6, 1, 6, 0));
});

dit('changement d’heure : 02:30 absent glisse à 03:30 ; 02:30 en double prend le premier', () => {
  assert.equal(paris('2026-03-29', '02:30'), Date.UTC(2026, 2, 29, 1, 30));
  assert.equal(paris('2026-10-25', '02:30'), Date.UTC(2026, 9, 25, 0, 30));
});

dit('prochaine occurrence : même jour avant l’heure, lendemain après, lundi après un vendredi', () => {
  const tous = { id: 'p', heure: '08:00' };
  assert.equal(planificateur.prochaineOccurrence(tous, paris('2026-11-12', '07:59')), paris('2026-11-12', '08:00'));
  assert.equal(planificateur.prochaineOccurrence(tous, paris('2026-11-12', '08:00')), paris('2026-11-13', '08:00'));
  const ouvres = { id: 'p', heure: '08:00', jours: [1, 2, 3, 4, 5] };
  assert.equal(planificateur.prochaineOccurrence(ouvres, paris('2026-11-13', '09:00')), paris('2026-11-16', '08:00'));
  assert.equal(planificateur.prochaineOccurrence(tous, paris('2026-03-28', '09:00')), Date.UTC(2026, 2, 29, 6, 0));
});

dit('rattrapage : trois jours fermés, UNE exécution (la plus récente) ; déjà faite ou trop ancienne, rien', () => {
  const p = { id: 'rapport', heure: '08:00' };
  const r = planificateur.occurrenceAExecuter(p, { dernierPassageAt: paris('2026-11-09', '08:00'), creeeAt: 0 }, MAINTENANT);
  assert.deepEqual(r, { at: paris('2026-11-12', '08:00'), id: 'rapport-2026-11-12' });
  assert.equal(planificateur.occurrenceAExecuter(p, { dernierPassageAt: r.at, creeeAt: 0 }, MAINTENANT), null);
  assert.equal(planificateur.occurrenceAExecuter(p, { dernierPassageAt: null, creeeAt: paris('2026-11-12', '09:00') }, MAINTENANT), null);
});

dit('plages calmes : pas de texte client le week-end ni la nuit ; on avance au vendredi soir, on repousse au lundi matin', () => {
  const samedi = paris('2026-11-14', '10:00');
  assert.equal(planificateur.dansLaPlage(samedi, planificateur.PLAGE_CLIENTS), false);
  assert.equal(planificateur.dansLaPlage(samedi, planificateur.PLAGE_EQUIPE), true);
  assert.equal(planificateur.prochainCreneau(samedi, planificateur.PLAGE_CLIENTS), paris('2026-11-16', '08:00'));
  assert.equal(planificateur.dernierCreneau(samedi, planificateur.PLAGE_CLIENTS), paris('2026-11-13', '18:59'));
  assert.equal(planificateur.prochainCreneau(MAINTENANT, planificateur.PLAGE_CLIENTS), MAINTENANT);
  assert.equal(planificateur.dansLaPlage(paris('2026-11-12', '19:00'), planificateur.PLAGE_CLIENTS), false);
});

section('Moteurs locaux : courriels par la boîte de l’équipe');

const COURRIEL = {
  id: courriels.idCourriel('devis', 'dv-12', 'accuse-devis'),
  a: 'Camille.Roux@client.exemple.test',
  objet: 'Votre demande de devis',
  corps: 'Bonjour Camille,\nMerci & à bientôt.',
  modeleId: 'accuse-devis',
  origine: { type: 'devis', id: 'dv-12' },
};
const ctxEnvoi = (sur: Record<string, unknown> = {}) => ({ maintenant: MAINTENANT, desinscrits: new Set<string>(), envoyes: [], ...sur });

dit('identifiant déterministe : même origine et même modèle, même courriel', () => {
  assert.equal(COURRIEL.id, 'courriel-devis-dv-12-accuse-devis');
  assert.equal(courriels.idCourriel('devis', 'dv-12', 'accuse-devis'), COURRIEL.id);
});

dit('adresses : une seule @, un domaine à point, pas d’espace ni de retour à la ligne', () => {
  assert.ok(courriels.adresseValide('a.b@client.exemple.test'));
  for (const x of ['a@b', 'a b@c.fr', 'a@@c.fr', 'a@c.fr\nBcc: x@y.fr', '', 'a@c.fr,b@d.fr']) assert.ok(!courriels.adresseValide(x), JSON.stringify(x));
});

dit('modèle : une variable manquante n’est jamais laissée dans un courriel client', () => {
  assert.deepEqual(courriels.remplir('Bonjour {nom}, sous {delai}.', { nom: 'Camille', delai: '48 h' }), { texte: 'Bonjour Camille, sous 48 h.', manquantes: [] });
  const r = courriels.remplir('Bonjour {nom}, {nom}, {equipe}', { nom: ' ' });
  assert.deepEqual(r.manquantes, ['nom', 'equipe']);
  assert.deepEqual(courriels.decider({ ...COURRIEL, corps: r.texte }, ctxEnvoi()), { statut: 'refuser', raison: 'variables-manquantes' });
});

dit('mailto : tout est encodé, les retours à la ligne deviennent CRLF', () => {
  const l = courriels.lienMailto(COURRIEL);
  assert.ok(l.startsWith('mailto:Camille.Roux%40client.exemple.test?subject=Votre%20demande%20de%20devis&body='));
  assert.ok(l.includes('%0D%0A'));
  assert.ok(l.includes('%26'));
  assert.ok(!/\s/.test(l));
});

dit('décision : désinscrit, déjà parti, doublon sous 7 jours, hors plage → différé au lundi 08:00', () => {
  assert.deepEqual(courriels.decider(COURRIEL, ctxEnvoi()), { statut: 'envoyer' });
  assert.equal(courriels.decider(COURRIEL, ctxEnvoi({ desinscrits: new Set(['camille.roux@client.exemple.test']) })).raison, 'desinscrit');
  assert.equal(courriels.decider(COURRIEL, ctxEnvoi({ envoyes: [{ id: COURRIEL.id, a: COURRIEL.a, modeleId: 'x', at: 0 }] })).raison, 'deja-envoye');
  const recent = { id: 'autre', a: 'camille.roux@client.exemple.test', modeleId: 'accuse-devis', at: MAINTENANT - 6 * 86_400_000 };
  assert.equal(courriels.decider(COURRIEL, ctxEnvoi({ envoyes: [recent] })).raison, 'doublon-recent');
  assert.equal(courriels.decider(COURRIEL, ctxEnvoi({ envoyes: [{ ...recent, at: MAINTENANT - 8 * 86_400_000 }] })).statut, 'envoyer');
  assert.deepEqual(courriels.decider(COURRIEL, ctxEnvoi({ maintenant: paris('2026-11-14', '10:00') })), { statut: 'differer', a: paris('2026-11-16', '08:00') });
  assert.equal(courriels.decider({ ...COURRIEL, a: 'pas une adresse' }, ctxEnvoi()).raison, 'adresse-invalide');
});

dit('canal : un clic par la boîte du poste ; sans clic par amn-api une fois la boîte branchée ; API seulement si connectée', () => {
  assert.equal(courriels.canalDEnvoi([], false), 'boite-equipe-manuel');
  assert.equal(courriels.canalDEnvoi([], true), 'boite-equipe-manuel');
  const boite = branchee('messagerie', 'boite-equipe', 1);
  assert.equal(courriels.canalDEnvoi([boite], true), 'smtp-serveur');
  assert.equal(courriels.canalDEnvoi([boite], false), 'boite-equipe-manuel');
  assert.equal(courriels.canalDEnvoi([boite, branchee('messagerie', 'brevo', 2)], true), 'api-externe');
  assert.equal(courriels.canalDEnvoi([branchee('messagerie', 'gmail', 2)], true), 'boite-equipe-manuel', 'Gmail ne lit que');
});

dit('pas plus de 30 courriels automatiques par heure depuis la boîte de l’équipe', () => {
  const file = Array.from({ length: 50 }, (_, i) => ({ id: `c${i}` }));
  assert.equal(courriels.lotDeLHeure(file, 0).length, 30);
  assert.equal(courriels.lotDeLHeure(file, 25).length, 5);
  assert.equal(courriels.lotDeLHeure(file, 40).length, 0);
});

section('Moteurs locaux : relances, rappels, tri, rapports, sauvegardes');

const facture = (id: string, echeance: string, sur: Record<string, unknown> = {}) => ({ id, echeance, payee: false, courriel: 'compta@client.exemple.test', derniereRelance: null, ...sur });

dit('relances : ni payée, ni en litige, ni pas encore échue ; le palier suit le retard', () => {
  const r = relances.relancesDuJour(
    [facture('f1', '2026-11-09'), facture('f2', '2026-10-13'), facture('f3', '2026-11-12'), facture('f4', '2026-10-01', { payee: true }), facture('f5', '2026-10-01', { enLitige: true })],
    AUJ,
  );
  assert.deepEqual(r.map((x: any) => [x.factureId, x.palier, x.joursRetard]), [['f2', 'mise-en-demeure', 30], ['f1', 'rappel', 3]]);
});

dit('relances : mise en demeure et dernier avis attendent toujours une personne ; rappel et relance ferme, non', () => {
  const r = relances.relancesDuJour([facture('a', '2026-11-09'), facture('b', '2026-11-01'), facture('c', '2026-10-13'), facture('d', '2026-09-01')], AUJ);
  const v = Object.fromEntries(r.map((x: any) => [x.palier, x.validationHumaine]));
  assert.deepEqual(v, { rappel: false, ferme: false, 'mise-en-demeure': true, 'dernier-avis': true });
});

dit('relances : jamais deux à moins de 7 jours ; le ton qui monte est signalé ; sans courriel, une tâche', () => {
  const recente = facture('a', '2026-10-01', { derniereRelance: { palier: 'ferme', le: '2026-11-06' } });
  assert.equal(relances.relancesDuJour([recente], AUJ).length, 0);
  const r = relances.relancesDuJour([{ ...recente, derniereRelance: { palier: 'ferme', le: '2026-11-05' } }], AUJ)[0];
  assert.equal(r.palier, 'mise-en-demeure');
  assert.equal(r.toneAMonte, true);
  assert.equal(relances.relancesDuJour([facture('b', '2026-11-01', { courriel: undefined })], AUJ)[0].sansContact, true);
});

dit('relances : les clés de message existent dans le dictionnaire commun, au vouvoiement', () => {
  const fr = fs.readFileSync(path.join(racine, 'src/i18n/fr.ts'), 'utf8');
  for (const cle of ['relances.message', 'relances.message.ferme', 'relances.message.miseEnDemeure', 'relances.message.dernierAvis']) {
    const ligne = fr.split('\n').find((l) => l.includes(`'${cle}':`));
    assert.ok(ligne, cle);
    assert.ok(/\b(vous|votre|vos)\b/i.test(ligne) || /Madame, Monsieur/.test(ligne), `${cle} : vouvoiement attendu`);
    assert.ok(!/\b(tu|te|toi|ton|ta|tes)\b/i.test(ligne.replace(/'[^']*':/, '')), `${cle} : pas de tutoiement`);
  }
});

const RDV_LUNDI = { id: 'rdv1', debutAt: paris('2026-11-16', '09:00'), clientJoignable: true };

dit('rappels : le client la veille, avancé au vendredi 18:59 si la veille est un dimanche ; l’équipe une heure avant', () => {
  assert.equal(rappels.heureDuRappel(RDV_LUNDI.debutAt, { avantMin: 1440, pour: 'client' }), paris('2026-11-13', '18:59'));
  assert.equal(rappels.heureDuRappel(RDV_LUNDI.debutAt, { avantMin: 60, pour: 'equipe' }), paris('2026-11-16', '08:00'));
  const vendredi = rappels.rappelsDus([RDV_LUNDI], new Set(), paris('2026-11-13', '19:30'));
  assert.deepEqual(vendredi.map((r: any) => r.id), ['rappel-rdv1-1440']);
  const lundi = rappels.rappelsDus([RDV_LUNDI], new Set(['rappel-rdv1-1440']), paris('2026-11-16', '08:10'));
  assert.deepEqual(lundi.map((r: any) => r.id), ['rappel-rdv1-60']);
});

dit('rappels : rien pour un rendez-vous passé, annulé, ou un client sans moyen d’être prévenu', () => {
  const tard = paris('2026-11-16', '09:01');
  assert.equal(rappels.rappelsDus([RDV_LUNDI], new Set(), tard).length, 0);
  assert.equal(rappels.rappelsDus([{ ...RDV_LUNDI, annule: true }], new Set(), paris('2026-11-16', '08:30')).length, 0);
  const sansContact = rappels.rappelsDus([{ ...RDV_LUNDI, clientJoignable: false }], new Set(), paris('2026-11-16', '08:30'));
  assert.deepEqual(sansContact.map((r: any) => r.pour), ['equipe']);
});

dit('tri : devis, facturation, rendez-vous, support ; contact connu → Clients ; sinon À lire', () => {
  const m = (objet: string, corps = '', expediteur = 'x@client.exemple.test') => ({ objet, corps, expediteur });
  assert.equal(tri.trier(m('Demande de DEVIS')).dossier, 'devis');
  assert.equal(tri.trier(m('Question', 'La facture 2026-014 est-elle réglée ?')).dossier, 'facturation');
  assert.equal(tri.trier(m('Rendez-vous de jeudi')).dossier, 'rendez-vous');
  assert.equal(tri.trier(m('Le site ne marche pas')).dossier, 'support');
  assert.equal(tri.trier(m('Prix et facture')).regleId, 'devis', 'la priorité la plus petite gagne');
  assert.equal(tri.trier(m('Merci', '', 'Camille@client.exemple.test'), undefined, new Set(['camille@client.exemple.test'])).dossier, 'clients');
  assert.deepEqual(tri.trier(m('Bonjour')), { dossier: 'a-lire', regleId: null });
});

dit('rapports : la semaine close (lundi–dimanche), le mois clos, dus à l’heure prévue, une fois par période', () => {
  assert.deepEqual(rapports.periodePrecedente('hebdo', AUJ), { debut: '2026-11-02', fin: '2026-11-08' });
  assert.deepEqual(rapports.periodePrecedente('mensuel', '2027-01-05'), { debut: '2026-12-01', fin: '2026-12-31' });
  const plan = { id: 'hebdo', periodicite: 'hebdo', heure: '08:00' };
  assert.deepEqual(rapports.rapportDu(plan, new Set(), paris('2026-11-16', '07:00')), { id: 'rapport-hebdo-2026-11-02', periode: { debut: '2026-11-02', fin: '2026-11-08' } });
  assert.deepEqual(rapports.rapportDu(plan, new Set(), paris('2026-11-16', '08:00')).periode, { debut: '2026-11-09', fin: '2026-11-15' });
  assert.equal(rapports.rapportDu(plan, new Set(['rapport-hebdo-2026-11-09']), paris('2026-11-18', '12:00')), null);
  const mois = { id: 'mois', periodicite: 'mensuel', heure: '09:00' };
  assert.deepEqual(rapports.rapportDu(mois, new Set(), paris('2026-12-01', '08:00')).periode, { debut: '2026-10-01', fin: '2026-10-31' });
  assert.deepEqual(rapports.rapportDu(mois, new Set(), paris('2026-12-01', '09:00')).periode, { debut: '2026-11-01', fin: '2026-11-30' });
});

dit('sauvegardes : à jour, due, en retard ; rotation 7 jours, 4 semaines, 6 mois, la plus récente gardée', () => {
  assert.equal(sauvegardes.etatSauvegarde(null, MAINTENANT), 'jamais');
  assert.equal(sauvegardes.etatSauvegarde(MAINTENANT - 23 * H, MAINTENANT), 'a-jour');
  assert.equal(sauvegardes.etatSauvegarde(MAINTENANT - 30 * H, MAINTENANT), 'due');
  assert.equal(sauvegardes.etatSauvegarde(MAINTENANT - 37 * H, MAINTENANT), 'en-retard');
  const copies = Array.from({ length: 400 }, (_, i) => ({ id: `s${i}`, at: paris(temps.ajouterJours(AUJ, -i), '02:00') }));
  // s0 = jeudi 12 nov. ; semaines : s0, s4 (dim. 8), s11 (dim. 1er), s18 ; mois : s0, s12 (31 oct.), s43, s73, s104, s135.
  const garde = [...sauvegardes.aConserver(copies)].map((id: string) => Number(id.slice(1))).sort((a, b) => a - b);
  assert.deepEqual(garde, [0, 1, 2, 3, 4, 5, 6, 11, 12, 18, 43, 73, 104, 135]);
  assert.deepEqual([...sauvegardes.aConserver([])], []);
});

/* ───────────────────────── Textes : deux voix ───────────────────────── */
section('Textes : l’interface tutoie, les clients sont vouvoyés');

const FR = K.DICTIONNAIRES_CONNECTEURS.fr;
const EN = K.DICTIONNAIRES_CONNECTEURS.en;
/** Un mot entier, bornes Unicode : « vous » n'est pas dans « rendez-vous », « te » n'est pas dans « côte ». */
const mot = (alternatives: string) => new RegExp(`(?<![\\p{L}-])(?:${alternatives})(?![\\p{L}-])`, 'iu');
const VOUVOIEMENT = mot('vous|votre|vos');
const TUTOIEMENT = mot('tu|te|toi|ton|ta|tes');
const variables = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

dit('mêmes clés en français et en anglais, mêmes variables, aucun texte vide', () => {
  assert.deepEqual(Object.keys(FR).sort(), Object.keys(EN).sort());
  for (const cle of Object.keys(EN)) {
    assert.ok(FR[cle].trim() && EN[cle].trim(), cle);
    assert.deepEqual(variables(FR[cle]), variables(EN[cle]), cle);
  }
});

dit('interface : aucun vouvoiement (« vous », « votre », « vos »)', () => {
  for (const [cle, t] of Object.entries<string>(FR)) {
    if (cle.startsWith('client.')) continue;
    assert.ok(!VOUVOIEMENT.test(t), `${cle} : ${t}`);
  }
});

dit('textes clients : vouvoiement, jamais de tutoiement', () => {
  const clients = Object.entries<string>(FR).filter(([c]) => c.startsWith('client.'));
  assert.ok(clients.length >= 5);
  for (const [cle, t] of clients) {
    assert.ok(!TUTOIEMENT.test(t) && !/(?<!\p{L})t’/iu.test(t), `${cle} : ${t}`);
    if (cle.endsWith('.corps') || cle === 'client.desinscription') assert.ok(VOUVOIEMENT.test(t), `${cle} : vouvoiement attendu`);
  }
});

dit('voix : apostrophe typographique, pas de point d’exclamation', () => {
  for (const [cle, t] of Object.entries<string>(FR)) {
    assert.ok(!t.includes("'"), `${cle} : apostrophe droite`);
    assert.ok(!t.includes('!'), `${cle} : point d’exclamation`);
  }
});

/* ───────────────────── Aucun secret, aucun réseau ───────────────────── */
section('Aucun secret, aucun appel réseau, isolement des éditions');

function fichiers(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? fichiers(path.join(dir, e.name)) : [path.join(dir, e.name)]));
}
const SOURCES = fichiers(ZONE).filter((f) => /\.(ts|tsx)$/.test(f));
const CHAMP_SENSIBLE = /(secret|token|jeton|password|motdepasse|mot_de_passe|apikey|api_key|credential|authorization|bearer)/i;

function clesSensibles(v: unknown, chemin = '$'): string[] {
  if (Array.isArray(v)) return v.flatMap((x, i) => clesSensibles(x, `${chemin}[${i}]`));
  if (v && typeof v === 'object' && !(v instanceof Set)) {
    return Object.entries(v).flatMap(([k, x]) => [...(CHAMP_SENSIBLE.test(k) || /^(cle|key)$/i.test(k) ? [`${chemin}.${k}`] : []), ...clesSensibles(x, `${chemin}.${k}`)]);
  }
  return [];
}

dit('aucun champ ne ressemble à un secret : catalogue, prises, devis, journal, flux, demandes à amn-api', () => {
  const { fini, apres, devis } = activerJusquAuBout(K.instanceLibre('sms', 'twilio', 8), 2000);
  const tout = { catalogue: K.CATALOGUE, baie: BAIE, fini, apres, devis, flux: DEVIS_PAR_COURRIEL, amn: K.DEMANDES_AMN_API, releves: K.RELEVES };
  assert.deepEqual(clesSensibles(tout), []);
});

dit('les types du modèle ne déclarent aucun champ de secret', () => {
  const types = fs.readFileSync(path.join(ZONE, 'types.ts'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  const champs = [...types.matchAll(/^\s*(\w+)\??:/gm)].map((m) => m[1]);
  assert.ok(champs.length > 20);
  for (const c of champs) assert.ok(!CHAMP_SENSIBLE.test(c) && !/^(cle|key)$/i.test(c), c);
});

dit('aucune valeur qui ressemble à une clé dans les fichiers de la zone', () => {
  const motifs = [
    /\bsk_(live|test)_[A-Za-z0-9]{8,}/,
    /\bAKIA[0-9A-Z]{16}\b/,
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
    /\bxox[abprs]-[A-Za-z0-9-]{10,}/,
    /\bgh[pousr]_[A-Za-z0-9]{20,}/,
    /\bBearer\s+[A-Za-z0-9._~+/-]{16,}/,
    /['"`][A-Za-z0-9+/_-]{40,}={0,2}['"`]/,
  ];
  for (const f of SOURCES) {
    const t = fs.readFileSync(f, 'utf8');
    for (const m of motifs) assert.ok(!m.test(t), `${path.relative(racine, f)} : ${m}`);
  }
});

dit('la zone n’appelle pas le réseau et ne range rien dans le navigateur (les clés restent côté serveur)', () => {
  for (const f of SOURCES) {
    const t = fs.readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    for (const m of [/\bfetch\s*\(/, /XMLHttpRequest/, /\bWebSocket\b/, /\blocalStorage\b/, /\bsessionStorage\b/, /\bindexedDB\b/, /\bdocument\.cookie\b/]) {
      assert.ok(!m.test(t), `${path.relative(racine, f)} : ${m}`);
    }
  }
});

dit('seul langue.ts touche à React ; le reste de la zone est pur', () => {
  for (const f of SOURCES) {
    const t = fs.readFileSync(f, 'utf8');
    const rel = path.relative(ZONE, f);
    if (rel === 'langue.ts') continue;
    assert.ok(!/from ['"]react['"]/.test(t), rel);
    assert.ok(!/^import (?!type )[^;]*from ['"](?:\.\.\/)+i18n['"]/m.test(t), `${rel} : le dictionnaire commun ne s’importe qu’en type`);
  }
  assert.ok(!/from ['"]\.\/langue['"]/.test(fs.readFileSync(path.join(ZONE, 'index.ts'), 'utf8')), 'index.ts n’exporte pas le crochet React');
});

dit('isolement : rien hors de src/refonte n’importe la zone (elle n’entre pas dans le paquet client)', () => {
  const src = path.join(racine, 'src');
  const dehors = fichiers(src).filter((f) => /\.(ts|tsx)$/.test(f) && !f.startsWith(path.join(src, 'refonte') + path.sep));
  for (const f of dehors) assert.ok(!/refonte\/connecteurs/.test(fs.readFileSync(f, 'utf8')), path.relative(racine, f));
});

dit('« Demandé à amn-api » : identifiants uniques, un repli local pour chacune, rien qui parle de faiblesse', () => {
  const ids = K.DEMANDES_AMN_API.map((d: any) => d.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const d of K.DEMANDES_AMN_API) {
    assert.ok(d.repliLocal.trim().length > 10, d.id);
    assert.ok(d.debloque.length > 0, d.id);
    assert.ok([1, 2, 3].includes(d.priorite), d.id);
    assert.ok(!/(faille|vuln|exploit|contourn|attaqu|injection|fuite)/i.test(`${d.titre} ${d.attendu} ${d.repliLocal}`), d.id);
  }
  for (const id of ['smtp-serveur', 'coffre-cles', 'taches-planifiees-serveur']) assert.ok(ids.includes(id), id);
});

/* ───────────────────────── Jeux fictifs de SIM ───────────────────────── */
section('Rejoué sur les jeux fictifs de SIM');

for (const volume of ['vide', 'peu', 'normal', 'beaucoup']) {
  dit(`volume ${volume} : prises, baie, relances, rappels et sauvegardes tiennent leurs règles`, () => {
    const monde = D.construireMonde({ volume });
    const maintenant = monde.contexte.maintenant;
    const aujourdhui = monde.contexte.aujourdhui;

    const prises = K.depuisFictifs(monde.connecteurs);
    assert.equal(prises.length, monde.connecteurs.length, 'chaque connecteur fictif trouve sa catégorie');
    assert.deepEqual(prises.map((i: any) => i.prise), prises.map((_: any, k: number) => k + 1));
    for (const i of prises) {
      const d = K.defautsDePrise(i).filter((x: string) => x !== 'service connecté sans coût accepté');
      assert.deepEqual(d, [], `${K.numeroDePrise(i.prise)} ${i.optionId}`);
    }
    const s = K.santeDeLaBaie(prises, maintenant);
    assert.equal(s.branchees + s.libres, prises.length);
    assert.ok(s.enForme <= s.branchees);
    assert.equal(K.badge(prises, maintenant), monde.connecteurs.filter((c: any) => c.etat === 'À renouveler' || c.etat === 'Erreur').length);
    assert.deepEqual(clesSensibles(prises), []);
    for (const c of K.CATALOGUE) assert.ok(['local', 'externe'].includes(K.modeDeCategorie(c.id, prises)));

    const factures = monde.factures.map((f: any) => ({ id: f.id, echeance: f.dueAt, payee: f.status === 'paid', enLitige: f.status !== 'issued' && f.status !== 'paid', derniereRelance: null }));
    const enRetard = monde.factures.filter((f: any) => D.statutAffiche(f, aujourdhui) === 'En retard').length;
    const r = relances.relancesDuJour(factures, aujourdhui);
    assert.equal(r.length, enRetard, 'une relance proposée par facture en retard, ni plus ni moins');
    assert.equal(new Set(r.map((x: any) => x.id)).size, r.length);

    const rdvs = monde.evenements.map((e: any) => ({ id: e.id, debutAt: Date.parse(e.startAt), clientJoignable: e.clientId !== null }));
    const dus = rappels.rappelsDus(rdvs, new Set(), maintenant);
    assert.equal(new Set(dus.map((x: any) => x.id)).size, dus.length);
    for (const x of dus) {
      const rdv = rdvs.find((y: any) => y.id === x.rendezVousId);
      assert.ok(x.prevuAt <= maintenant && maintenant < rdv.debutAt, x.id);
    }

    const copies = monde.sauvegardes.filter((c: any) => c.etat === 'Réussie').map((c: any) => ({ id: c.id, at: Date.parse(c.at) }));
    const garde = sauvegardes.aConserver(copies);
    if (copies.length) assert.ok(garde.has([...copies].sort((a: any, b: any) => b.at - a.at)[0].id));
    assert.ok(garde.size <= copies.length);
  });
}

console.log(`\ncheck:connecteurs — ${vus} contrôles, tous verts.`);

#!/usr/bin/env node
/**
 * CHARGER LES JEUX DE DONNÉES FICTIVES DANS L'API D'ESSAI
 * ════════════════════════════════════════════════════════
 *
 * Les jeux de `src/refonte/donnees/` sont des objets en mémoire. Ce script en
 * écrit un volume choisi (vide, peu, normal, beaucoup) dans les collections de
 * l'API d'essai en mémoire (`scripts/qualite/api-essai.mjs`, port 4171), pour
 * que Harun essaie l'application sur son poste avec de quoi défiler.
 *
 *   AMN_E2E_EMAIL=essai.interne@exemple.test AMN_E2E_PASSWORD=… \
 *     node scripts/charger-donnees-essai.mjs --volume normal
 *
 * Options :
 *   --volume vide|peu|normal|beaucoup   défaut : normal
 *   --graine <nombre>                   défaut : la graine de référence
 *   --a-blanc                           compte ce qui serait écrit, sans rien envoyer
 *   --sans-vider                        n'efface pas les enregistrements en trop
 *   --garde                             lance aussi scripts/seed-supervision.mjs (voir plus bas)
 *   --avoirs                            ajoute les avoirs (AV-AAAA-NNNN), rangés avec les factures
 *
 * ## Ce qu'il refuse
 *
 *   · toute cible qui n'est pas `127.0.0.1` (ni `localhost`, ni un nom d'hôte,
 *     ni une redirection) ;
 *   · tout compte qui n'est pas en `@exemple.test` ;
 *   · de lire l'horloge : le monde est celui du vendredi 30 oct. 2026.
 *
 * ## Ce qu'il écrit
 *
 * Seulement les jeux dont une collection d'amn-api existe ET dont la forme est
 * vérifiée à la compilation (`compat.ts`) : clients, projets, rendez-vous, notes,
 * devis, factures, dépenses ; plus les tâches, dont le type du dépôt est lâche. Les autres jeux n'ont pas de collection
 * d'accueil dans amn-api (`ALLOWED` est une liste fermée) : le script les nomme
 * en fin de passage au lieu de les ranger dans une collection qui n'est pas la
 * leur. Ouvrir des collections est une décision du CO.
 *
 * « Moi » : le membre « moi » des jeux (Camille) est remplacé par le compte
 * connecté, pour que « Ma journée » montre les tâches de la personne qui essaie.
 *
 * ## La Garde
 *
 * `--garde` réutilise `scripts/seed-supervision.mjs`, qui écrit dans un FICHIER
 * sqlite de bac à sable (`SQLITE_PATH`), pas dans l'API en mémoire : il faut donc
 * une API d'essai qui travaille sur un fichier. Sans `SQLITE_PATH`, le script le
 * dit et passe son chemin.
 *
 * Les écritures vont à 9 par seconde : amn-api en accepte 600 par minute.
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.join(ICI, '..');

/* ---------------------------------- Options ---------------------------------- */

const args = process.argv.slice(2);
const drapeau = (nom) => args.includes(nom);
const valeur = (nom, defaut) => {
  const i = args.indexOf(nom);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : defaut;
};
const VOLUMES = ['vide', 'peu', 'normal', 'beaucoup'];
const volume = valeur('--volume', 'normal');
if (!VOLUMES.includes(volume)) {
  console.error(`Volume inconnu : « ${volume} ». Choisis parmi : ${VOLUMES.join(', ')}.`);
  process.exit(1);
}
const graine = valeur('--graine', undefined);
const aBlanc = drapeau('--a-blanc');
const viderLeReste = !drapeau('--sans-vider');

/* ---------------------------------- Garde-fous ---------------------------------- */

/**
 * La cible : `127.0.0.1` et rien d'autre. Le nom d'hôte est comparé tel quel,
 * sans résolution : `localhost` ou un domaine qui pointe vers 127.0.0.1 est refusé,
 * parce qu'un nom peut être repointé et qu'une adresse littérale ne le peut pas.
 */
export function cibleAutorisee(texte) {
  let url;
  try {
    url = new URL(texte);
  } catch {
    return { ok: false, raison: `adresse illisible : « ${texte} »` };
  }
  if (url.protocol !== 'http:') return { ok: false, raison: `protocole « ${url.protocol} » refusé (http seulement, en local)` };
  if (url.hostname !== '127.0.0.1') return { ok: false, raison: `hôte « ${url.hostname} » refusé (seul 127.0.0.1 est autorisé)` };
  if (url.username || url.password) return { ok: false, raison: 'des identifiants dans l’adresse sont refusés' };
  return { ok: true, base: `http://127.0.0.1${url.port ? `:${url.port}` : ''}` };
}

export function compteAutorise(email) {
  return /^[^@\s]+@([a-z0-9-]+\.)*exemple\.test$/i.test(email);
}

/* ---------------------------------- Les jeux ---------------------------------- */

/** Jeu → collection d'amn-api. Les jeux dont `compat.ts` prouve la forme, et les tâches (type lâche dans le dépôt). */
export const CHARGES = [
  { jeu: 'clients', collection: 'clients' },
  { jeu: 'projets', collection: 'projects' },
  { jeu: 'taches', collection: 'tasks' },
  { jeu: 'evenements', collection: 'appointments' },
  { jeu: 'notes', collection: 'notes' },
  { jeu: 'devis', collection: 'quotes' },
  { jeu: 'factures', collection: 'invoices' },
  { jeu: 'depenses', collection: 'expenses' },
];

async function chargerLesJeux() {
  const built = await esbuild.build({
    entryPoints: [path.join(RACINE, 'src', 'refonte', 'donnees', 'index.ts')],
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'neutral',
    target: 'node22',
    charset: 'utf8',
  });
  const code = Buffer.from(built.outputFiles[0].text, 'utf8').toString('base64');
  return import(`data:text/javascript;charset=utf-8;base64,${code}`);
}

/** Remplace, dans tout l'objet, une chaîne par une autre (le « moi » des jeux → le compte connecté). */
export function remplacerChaine(valeurX, de, vers) {
  if (typeof valeurX === 'string') return valeurX === de ? vers : valeurX;
  if (Array.isArray(valeurX)) return valeurX.map((x) => remplacerChaine(x, de, vers));
  if (valeurX && typeof valeurX === 'object') return Object.fromEntries(Object.entries(valeurX).map(([k, v]) => [k, remplacerChaine(v, de, vers)]));
  return valeurX;
}

/* ---------------------------------- La Garde ---------------------------------- */

function lancerLaGarde() {
  const chemin = process.env.SQLITE_PATH ?? '';
  if (!chemin) {
    console.log('\nLa Garde (--garde) : passée.');
    console.log('  scripts/seed-supervision.mjs écrit dans un fichier sqlite de bac à sable (SQLITE_PATH), pas dans l’API en mémoire.');
    console.log('  Il faut une API d’essai qui travaille sur un fichier ; voir le rapport DONNEES.md.');
    return;
  }
  console.log('\nLa Garde : scripts/seed-supervision.mjs (ses propres garde-fous s’appliquent).');
  const r = spawnSync(process.execPath, [path.join(ICI, 'seed-supervision.mjs')], { stdio: 'inherit', env: { PATH: process.env.PATH, SQLITE_PATH: chemin } });
  if (r.status !== 0) {
    console.error('La Garde : refusée ou en échec (voir au-dessus).');
    process.exitCode = 1;
  }
}

/* ---------------------------------- Principal ---------------------------------- */

async function principal() {
  const D = await chargerLesJeux();
  const monde = D.construireMonde({ volume, avoirs: drapeau('--avoirs'), ...(graine ? { graine: Number(graine) } : {}) });
  const moi = D.moi(monde.equipe).email;
  // Les avoirs sont rangés avec les factures : ils ne sont pas « non chargés ».
  const jeuxNonCharges = D.NOMS_DES_JEUX.filter((nom) => nom !== 'avoirs' && !CHARGES.some((c) => c.jeu === nom));

  // Les avoirs sont des factures de nature `creditNote` : ils vivent dans la même collection.
  const prevus = CHARGES.map((c) => ({ ...c, lignes: c.jeu === 'factures' ? [...monde.factures, ...monde.avoirs] : monde[c.jeu] }));
  console.log(`Volume « ${volume} » — ${prevus.reduce((s, p) => s + p.lignes.length, 0)} enregistrements dans ${prevus.length} collections.`);
  for (const p of prevus) console.log(`  ${p.collection.padEnd(13)} ← ${p.jeu.padEnd(11)} ${String(p.lignes.length).padStart(5)}`);

  if (aBlanc) {
    console.log(`\nÀ blanc : rien n’a été envoyé. ${jeuxNonCharges.length} jeux n’ont pas de collection d’accueil confirmée (non chargés).`);
    return;
  }

  const cible = cibleAutorisee(process.env.AMN_API ?? 'http://127.0.0.1:4171');
  if (!cible.ok) {
    console.error(`REFUS : ${cible.raison}.\n  Ce script écrit, et il n’écrit que sur ton poste (http://127.0.0.1:…).`);
    process.exit(1);
  }
  const email = process.env.AMN_E2E_EMAIL ?? '';
  const motDePasse = process.env.AMN_E2E_PASSWORD ?? '';
  if (!email || !motDePasse) {
    console.error('Il faut AMN_E2E_EMAIL et AMN_E2E_PASSWORD (les comptes d’essai sont dans LANCER-EN-LOCAL.md).');
    process.exit(1);
  }
  if (!compteAutorise(email)) {
    console.error(`REFUS : « ${email} » n’est pas un compte d’essai (@exemple.test).`);
    process.exit(1);
  }

  const appel = (chemin, options = {}) => fetch(`${cible.base}${chemin}`, { redirect: 'error', ...options });
  const connexion = await appel('/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: motDePasse }),
  })
    .then((r) => r.json())
    .catch((e) => ({ erreur: e.message }));
  if (!connexion?.token) {
    console.error(`Connexion refusée${connexion?.erreur ? ` (${connexion.erreur})` : ''}. L’API d’essai tourne-t-elle sur ${cible.base} ?`);
    process.exit(1);
  }
  const entetes = { 'Content-Type': 'application/json', Authorization: `Bearer ${connexion.token}` };

  const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
  let ecrits = 0;
  let supprimes = 0;
  let echecs = 0;
  /** 9 requêtes par seconde au plus : amn-api en accepte 600 par minute. */
  const PAS_MS = 112;
  async function envoyer(methode, collection, id, corps) {
    await dormir(PAS_MS);
    const url = `/v1/collections/${collection}/${encodeURIComponent(id)}`;
    for (let essai = 0; essai < 4; essai += 1) {
      const r = await appel(url, { method: methode, headers: entetes, ...(corps ? { body: JSON.stringify({ data: corps }) } : {}) });
      if (r.status === 429) {
        await dormir(Math.min(30_000, (Number(r.headers.get('retry-after')) || 2 ** essai * 2) * 1000));
        continue;
      }
      if (r.ok) return true;
      console.error(`  ✗ ${methode} ${collection}/${id} → ${r.status} ${(await r.text()).slice(0, 100)}`);
      return false;
    }
    console.error(`  ✗ ${methode} ${collection}/${id} → limite de débit persistante`);
    return false;
  }

  for (const p of prevus) {
    const voulus = new Set();
    for (const ligne of p.lignes) {
      const id = String(ligne.id);
      voulus.add(id);
      const donnee = remplacerChaine(ligne, moi, email);
      if (await envoyer('PUT', p.collection, id, donnee)) ecrits += 1;
      else echecs += 1;
    }
    if (viderLeReste) {
      const liste = await appel(`/v1/collections/${p.collection}`, { headers: entetes }).then((r) => r.json()).catch(() => ({}));
      const enTrop = (liste.records ?? []).filter((x) => !x.deleted && !voulus.has(String(x.id)));
      for (const x of enTrop) if (await envoyer('DELETE', p.collection, String(x.id))) supprimes += 1;
    }
    process.stdout.write(`  ${p.collection} ✓\n`);
  }

  console.log(`\n${ecrits} enregistrements écrits, ${supprimes} anciens retirés, ${echecs} échecs.`);
  if (jeuxNonCharges.length) {
    console.log(`${jeuxNonCharges.length} jeux sans collection d’accueil confirmée dans amn-api (non chargés) : ${jeuxNonCharges.join(', ')}.`);
  }
  if (drapeau('--garde')) lancerLaGarde();
  if (echecs > 0) process.exitCode = 1;
}

// Importable par les tests sans rien lancer : on n'exécute que si le fichier est le point d'entrée.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await principal();
}

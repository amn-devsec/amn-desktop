/**
 * LOT-07 (Outils et réglages) — la couture du moteur de H20 et les tarifs relevés de H21.
 *
 *   npm run check:outils
 *
 * 1. La couture `@edition/automatisations` : l'édition cliente reçoit un jumeau
 *    qui ne fait rien et n'atteint aucun fichier de la refonte ; l'édition
 *    interne branche le moteur étendu ; le moteur actuel reste monté tel quel.
 * 2. Le moteur étendu (`src/refonte/outils/planDuMoteur.ts`) : il ne prend que
 *    les règles `'flux'`, n'exécute un flux que s'il peut le faire en entier,
 *    garde les identifiants déterministes, et n'écrit jamais ce que le moteur
 *    actuel écrit déjà.
 * 3. Les tarifs relevés pour H21 : source officielle du service, date réelle,
 *    une entrée par option, et l'activation qui s'ouvre avec son coût.
 *
 * Sans réseau, sans navigateur, sans React (bouchons).
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';
import { editionAliases } from '../vite.edition.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const racine = path.join(here, '..');
process.chdir(racine);
const lire = (rel: string) => fs.readFileSync(path.join(racine, rel), 'utf8');

/** React et la synchronisation remplacés : on charge le vrai code, sans rien monter. */
const bouchons: esbuild.Plugin = {
  name: 'bouchons',
  setup(b) {
    b.onResolve({ filter: /^react$|^react\/jsx-runtime$|\/SyncContext$/ }, (a) => ({ path: a.path, namespace: 'bouchon' }));
    b.onLoad({ filter: /.*/, namespace: 'bouchon' }, () => ({
      contents:
        'export const useEffect = () => {}, useMemo = (f) => f(), useRef = (v) => ({ current: v }), useSync = () => ({}), useCollection = () => [];' +
        'export const jsx = () => null, jsxs = () => null, Fragment = null;',
      loader: 'js',
    }));
  },
};

async function construire(entree: string, edition: 'internal' | 'business', plugins: esbuild.Plugin[] = []) {
  return esbuild.build({
    entryPoints: [path.join(racine, entree)],
    bundle: true,
    write: false,
    metafile: true,
    format: 'esm',
    platform: 'neutral',
    target: 'node22',
    charset: 'utf8',
    jsx: 'automatic',
    alias: editionAliases(edition),
    plugins,
  });
}

async function charger<T>(entree: string, edition: 'internal' | 'business' = 'internal'): Promise<T> {
  const construit = await construire(entree, edition, [bouchons]);
  return (await import(
    `data:text/javascript;charset=utf-8;base64,${Buffer.from(construit.outputFiles[0].text, 'utf8').toString('base64')}`
  )) as T;
}

const atteints = (meta: esbuild.Metafile) => Object.keys(meta.inputs).filter((f) => !f.startsWith('bouchon:')).map((f) => f.replace(/\\/g, '/'));

let vus = 0;
const dit = async (nom: string, fn: () => void | Promise<void>) => {
  await fn();
  vus += 1;
  console.log(`  ✓ ${nom}`);
};
const section = (titre: string) => console.log(`\n${titre}`);

const E = await charger<any>('src/refonte/outils/planDuMoteur.ts');
const K = await charger<any>('src/refonte/connecteurs/index.ts');
const H20 = await charger<any>('src/state/useAutomations.ts');

/* ───────────────────────── 1. La couture ───────────────────────── */
section('Couture @edition/automatisations (moteur de H20)');

await dit('l’alias existe dans vite.edition.ts, tsconfig.json et tsconfig.business.json, chacun vers son jumeau', () => {
  assert.match(lire('vite.edition.ts'), /'@edition\/automatisations': at\(`src\/edition\/automatisations\.\$\{suffix\}\.tsx`\)/);
  assert.equal(JSON.parse(lire('tsconfig.json').replace(/^\s*\/\/.*$/gm, '')).compilerOptions.paths['@edition/automatisations']?.[0], 'src/edition/automatisations.internal.tsx');
  const business = JSON.parse(lire('tsconfig.business.json').replace(/^\s*\/\/.*$/gm, ''));
  assert.equal(business.compilerOptions.paths['@edition/automatisations']?.[0], 'src/edition/automatisations.business.tsx');
  assert.ok(editionAliases('business')['@edition/automatisations'].endsWith('automatisations.business.tsx'));
  assert.ok(editionAliases('internal')['@edition/automatisations'].endsWith('automatisations.internal.tsx'));
});

await dit('le jumeau client n’atteint aucun fichier de la refonte, du socle, ni aucun fichier interne', async () => {
  const { metafile } = await construire('src/edition/automatisations.business.tsx', 'business', [bouchons]);
  const fautes = atteints(metafile).filter((f) => /^src\/(refonte|socle)\//.test(f) || /\.internal\./.test(f));
  assert.deepEqual(fautes, []);
});

await dit('le jumeau client ne fait rien : il rend null, quels que soient les libellés', async () => {
  const B = await charger<any>('src/edition/automatisations.business.tsx', 'business');
  assert.equal(B.MoteurEtendu({ libelles: {} }), null);
  assert.doesNotMatch(lire('src/edition/automatisations.business.tsx'), /from ['"][^'"]*refonte/);
});

await dit('le jumeau interne branche le moteur étendu de la refonte', async () => {
  const { metafile } = await construire('src/edition/automatisations.internal.tsx', 'internal', [bouchons]);
  const fichiers = atteints(metafile);
  assert.ok(fichiers.includes('src/refonte/outils/MoteurEtendu.tsx'), fichiers.join(', '));
  assert.ok(fichiers.includes('src/refonte/outils/planDuMoteur.ts'));
});

await dit('AutomationsRunner (partagé) garde le moteur actuel et ne passe que par la couture', () => {
  const t = lire('src/components/AutomationsRunner.tsx');
  assert.match(t, /import \{ MoteurEtendu \} from '@edition\/automatisations';/);
  assert.match(t, /useAutomations\(libelles\);/);
  assert.match(t, /<MoteurEtendu libelles=\{libelles\} \/>/);
  assert.doesNotMatch(t, /from ['"][^'"]*(refonte|socle)\//);
});

await dit('l’édition cliente monte toujours le même AutomationsRunner, et sa mise en page n’a pas bougé', () => {
  assert.match(lire('src/business/BusinessLayout.tsx'), /import \{ AutomationsRunner \} from '\.\.\/components\/AutomationsRunner';/);
  assert.doesNotMatch(lire('src/business/BusinessLayout.tsx'), /automatisations/);
});

/* ───────────────────────── 2. Le moteur étendu ───────────────────────── */
section('Moteur étendu : règles « flux », en entier ou pas du tout');

const MAINTENANT = new Date('2026-11-12T10:42:00+01:00');
const EQUIPE = 'equipe@exemple.test';
const LIBELLES = {
  formAnswer: (a: string, b: string) => `Formulaire ${a} : ${b}`,
  invoiceOverdue: (a: string, b: string) => `Facture en retard ${a} ${b}`,
  ticketOpened: (a: string, b: string) => `SAV ${a} ${b}`,
  prospectWon: (a: string, b: string) => `Gagné ${a} ${b}`,
  stockLow: (a: string, b: string) => `Stock bas ${a} ${b}`,
};
const DONNEES = {
  formAnswers: [
    { id: 'rep-1', formId: 'f-1', answers: { message: 'Bonjour, vos tarifs ?' } },
    { id: 'rep-2', formId: 'f-1', answers: { message: 'Merci pour hier' } },
  ],
  forms: [{ id: 'f-1', title: 'Contact' }],
  invoices: [],
  tickets: [],
  prospects: [],
  stockItems: [],
};
const sourcesDe = (d: string) => H20.sourcesPour(d, DONNEES, LIBELLES);

const tache = (id: string, sur: Record<string, unknown> = {}) => ({ id, mode: 'local', type: 'creer-tache', parametres: { assigneeEmail: EQUIPE, ...sur } });
const journal = (id: string) => ({ id, mode: 'local', type: 'ecrire-journal', parametres: {} });
const flux = (sur: Record<string, unknown> = {}) => ({
  id: 'r-1',
  nom: 'Demande de tarifs',
  etat: 'actif',
  quand: { id: 'q', mode: 'local', type: 'formulaire-repondu', parametres: {} },
  si: null,
  alors: [tache('a-1')],
  sinon: [],
  ...sur,
});
const regle = (f: any) => {
  const r = K.versAutomation(f, '2026-11-01T09:00:00.000Z', f.nom);
  assert.ok(r, `flux ${f.id} refusé par versAutomation : ${JSON.stringify(K.defautsDuFlux(f))}`);
  return { ...r, id: f.id };
};
const planifier = (regles: any[], existants: string[] = []) =>
  E.planifierMoteurEtendu({ regles, sourcesDe, existants: new Set(existants), instances: [], maintenant: MAINTENANT });

await dit('une règle que le moteur actuel exécute en entier garde son déclencheur, et le moteur étendu la laisse', () => {
  const r = regle(flux());
  assert.notEqual(r.trigger, 'flux');
  assert.deepEqual(planifier([r]), { ecritures: [], inertes: [] });
});

await dit('ALORS puis PUIS : une tâche puis une note, avec les identifiants historiques et suffixés', () => {
  const r = regle(flux({ alors: [tache('a-1'), journal('a-2')] }));
  assert.equal(r.trigger, 'flux');
  const { ecritures, inertes } = planifier([r]);
  assert.deepEqual(inertes, []);
  assert.deepEqual(
    ecritures.map((e: any) => `${e.collection}:${e.id}`),
    ['tasks:auto-r-1-rep-1', 'logbook:auto-r-1-rep-1-p1', 'tasks:auto-r-1-rep-2', 'logbook:auto-r-1-rep-2-p1'],
  );
});

await dit('une tâche écrite a la forme de celle du moteur actuel (mêmes champs, même personne)', () => {
  const r = regle(flux({ alors: [tache('a-1'), journal('a-2')] }));
  const [t] = planifier([r]).ecritures;
  assert.deepEqual(Object.keys(t.valeur).sort(), ['assigneeEmail', 'clientId', 'createdAt', 'detail', 'siteId', 'status', 'title']);
  assert.equal(t.valeur.assigneeEmail, EQUIPE);
  assert.equal(t.valeur.status, 'todo');
  assert.equal(t.valeur.createdAt, MAINTENANT.toISOString());
});

await dit('SI « mots repérés » : ALORS quand le mot est là, SINON sinon', () => {
  const r = regle(
    flux({
      si: { id: 's', mode: 'local', type: 'contient-mots', parametres: { mots: ['tarif'] } },
      alors: [tache('a-1')],
      sinon: [journal('n-1')],
    }),
  );
  const ids = planifier([r]).ecritures.map((e: any) => e.id);
  assert.deepEqual(ids, ['auto-r-1-rep-1', 'auto-r-1-rep-2-sinon']);
});

await dit('ce qui est déjà écrit ne s’écrit pas deux fois ; deux passages donnent le même plan', () => {
  const r = regle(flux({ alors: [tache('a-1'), journal('a-2')] }));
  const ids = planifier([r], ['auto-r-1-rep-1']).ecritures.map((e: any) => e.id);
  assert.ok(!ids.includes('auto-r-1-rep-1'));
  assert.deepEqual(planifier([r]), planifier([r]));
});

await dit('en pause ou en brouillon : rien ne s’exécute', () => {
  const pause = regle(flux({ etat: 'en-pause', alors: [tache('a-1'), journal('a-2')] }));
  const brouillon = regle(flux({ id: 'r-2', etat: 'brouillon', alors: [tache('a-1'), journal('a-2')] }));
  assert.deepEqual(planifier([pause, brouillon]).ecritures, []);
});

await dit('jamais la moitié d’un flux : chaque cas non exécutable reste inerte, avec sa raison', () => {
  const montant = regle(
    flux({
      id: 'r-m',
      quand: { id: 'q', mode: 'local', type: 'facture-en-retard', parametres: {} },
      si: { id: 's', mode: 'local', type: 'montant-au-moins', parametres: { montantCents: 10000 } },
      alors: [tache('a-1')],
      sinon: [journal('n-1')],
    }),
  );
  const courriel = regle(flux({ id: 'r-c', alors: [tache('a-1'), { id: 'a-2', mode: 'local', type: 'envoyer-courriel', parametres: { modeleId: 'modele-1' } }] }));
  const recu = regle(flux({ id: 'r-q', quand: { id: 'q', mode: 'local', type: 'courriel-recu', parametres: { boite: 'contact' } }, alors: [tache('a-1')] }));
  const echeance = regle(flux({ id: 'r-e', alors: [tache('a-1', { echeanceJours: 3 }), journal('a-2')] }));
  const abimee = { id: 'r-x', trigger: 'flux', action: 'task', enabled: true, assigneeEmail: EQUIPE, createdAt: '2026-11-01T09:00:00.000Z' };
  const { ecritures, inertes } = planifier([montant, courriel, recu, echeance, abimee]);
  assert.deepEqual(ecritures, []);
  assert.deepEqual(inertes, [
    { regleId: 'r-m', raison: 'condition-sans-donnee' },
    { regleId: 'r-c', raison: 'action-a-brancher' },
    { regleId: 'r-q', raison: 'declencheur-a-brancher' },
    { regleId: 'r-e', raison: 'action-a-brancher' },
    { regleId: 'r-x', raison: 'regle-abimee' },
  ]);
});

await dit('aucune règle ne tourne deux fois : ce qu’écrit le moteur actuel et ce qu’écrit le moteur étendu ne se croisent pas', () => {
  const regles = [regle(flux()), regle(flux({ id: 'r-2', alors: [tache('a-1'), journal('a-2')] }))];
  // Le moteur actuel : une écriture par règle active et par source, avec SON déclencheur (`sourcesPour` → [] pour « flux »).
  const actuel = regles.filter((r) => r.enabled).flatMap((r) => H20.sourcesPour(r.trigger, DONNEES, LIBELLES).map((s: any) => `auto-${r.id}-${s.id}`));
  const etendu = planifier(regles).ecritures.map((e: any) => e.id);
  assert.ok(actuel.length > 0 && etendu.length > 0);
  assert.deepEqual(actuel.filter((id: string) => etendu.includes(id)), []);
  assert.deepEqual(H20.sourcesPour('flux', DONNEES, LIBELLES), []);
});

await dit('chaque QUAND branché correspond au déclencheur du moteur actuel qui fournit ses sources', () => {
  for (const [quand, declencheur] of Object.entries(E.DECLENCHEUR_DU_QUAND)) {
    assert.equal(K.evenementDepuisSource(declencheur, { id: 'x', titre: '', detail: '' }, 0).type, quand);
  }
  assert.deepEqual(Object.values(E.DECLENCHEUR_DU_QUAND).sort(), [...H20.DECLENCHEURS].sort());
});

/* ───────────────────────── 3. Les tarifs de H21 ───────────────────────── */
section('Tarifs relevés pour H21');

/** Le domaine officiel attendu pour chaque option relevée. */
const DOMAINE_OFFICIEL: Record<string, string> = {
  'messagerie/mailjet': 'mailjet.com',
  'messagerie/gmail': 'developers.google.com',
  'agenda/google-agenda': 'developers.google.com',
  'paiement/stripe': 'stripe.com',
  'paiement/mollie': 'mollie.com',
  'paiement/gocardless': 'gocardless.com',
  'sms/ovh-sms': 'ovhcloud.com',
  'messagerie/postmark': 'postmarkapp.com',
  'messagerie/resend': 'resend.com',
  'hebergement/vercel': 'vercel.com',
  'hebergement/netlify': 'netlify.com',
  'code/github': 'github.com',
  'notifications/slack': 'slack.com',
  'sms/twilio': 'twilio.com',
};
const AUJOURDHUI = new Intl.DateTimeFormat('fr-CA', { timeZone: 'Europe/Paris' }).format(new Date());

await dit('chaque relevé vient de la page du service lui-même, porte une date passée, et une seule fois par option', () => {
  const cles = new Set<string>();
  for (const r of K.RELEVES) {
    const cle = `${r.categorie}/${r.optionId}`;
    assert.ok(!cles.has(cle), `${cle} relevé deux fois`);
    cles.add(cle);
    const attendu = DOMAINE_OFFICIEL[cle];
    assert.ok(attendu, `${cle} : domaine officiel non déclaré dans la garde`);
    const hote = new URL(r.tarif.source).hostname;
    assert.ok(hote === attendu || hote.endsWith(`.${attendu}`), `${cle} : ${hote} n'est pas ${attendu}`);
    assert.ok(r.tarif.releveLe <= AUJOURDHUI, `${cle} : relevé daté du futur`);
    assert.deepEqual(K.defautsDuReleve(r, AUJOURDHUI), [], cle);
  }
  assert.equal(cles.size, Object.keys(DOMAINE_OFFICIEL).length);
});

await dit('avec les relevés, H21 ouvre l’activation et montre le coût avant ; sans eux, elle reste fermée', () => {
  const catalogue = K.catalogueTarife();
  const ctx = { maintenant: MAINTENANT.getTime(), aujourdhui: AUJOURDHUI, peutGerer: true, enLigne: true, parEmail: EQUIPE, catalogue };
  for (const r of K.RELEVES) {
    const avec = K.preparerActivation(K.instanceLibre(r.categorie, r.optionId, 1), ctx);
    assert.equal(avec.ok, true, `${r.categorie}/${r.optionId} : ${avec.raison}`);
    assert.equal(avec.valeur.tarif.source, r.tarif.source);
    const sans = K.preparerActivation(K.instanceLibre(r.categorie, r.optionId, 1), { ...ctx, catalogue: K.CATALOGUE });
    assert.deepEqual(sans, { ok: false, raison: 'tarif-a-relever' });
  }
});

await dit('les services non relevés restent « à relever » : aucun montant n’entre par une autre porte', () => {
  const releves = new Set(K.RELEVES.map((r: any) => `${r.categorie}/${r.optionId}`));
  for (const c of K.catalogueTarife()) {
    for (const o of c.options) {
      if (o.nature !== 'service') continue;
      assert.equal(o.tarif.etat, releves.has(`${c.id}/${o.id}`) ? 'releve' : 'a-relever', `${c.id}/${o.id}`);
    }
  }
});

/* ───────────────────────── 4. Les droits provisoires de H19 ───────────────────────── */
section('Droits provisoires de H19 (STATUT §1.34)');

const DR = await charger<any>('src/refonte/outils/droits.ts');
const T = await charger<any>('src/refonte/outils/i18n.ts');
const ROLES = ['owner', 'admin', 'member', 'guest'];

await dit('les rôles de H19 sont ceux du serveur, dans l’ordre de MembersScreen, avec leurs noms décidés', () => {
  assert.deepEqual([...DR.ROLES_H19], ROLES);
  assert.deepEqual(ROLES.map((r) => T.libelleDuRole('fr', r)), ['Propriétaire', 'Administrateur', 'Membre', 'Invité']);
  assert.deepEqual(ROLES.map((r) => T.libelleDuRole('en', r)), ['Owner', 'Administrator', 'Member', 'Guest']);
  assert.deepEqual(Object.keys(T.DICTIONNAIRES_OUTILS.fr).sort(), Object.keys(T.DICTIONNAIRES_OUTILS.en).sort());
});

await dit('seul owner publie ; les autres demandent la publication ; un rôle absent ne publie pas', () => {
  assert.deepEqual(ROLES.map((r) => DR.actionDePublicationPour(r)), ['publier', 'demander', 'demander', 'demander']);
  assert.equal(DR.peutPublier(null), false);
  assert.equal(DR.peutPublier(undefined), false);
});

await dit('publier suppose d’écrire : sans le droit d’écrire, même owner ne publie pas', () => {
  assert.deepEqual(DR.droitsDePage('owner', true, true), { ecrire: true, publier: true, enLigne: true });
  assert.deepEqual(DR.droitsDePage('owner', false, true), { ecrire: false, publier: false, enLigne: true });
  assert.deepEqual(DR.droitsDePage('admin', true, false), { ecrire: true, publier: false, enLigne: false });
});

await dit('owner et admin gèrent les connecteurs ; le cycle de H21 refuse les autres, avec le motif nommé', () => {
  assert.deepEqual(ROLES.map((r) => DR.peutGererLesConnecteurs(r)), [true, true, false, false]);
  const r = K.RELEVES[0];
  for (const role of ROLES) {
    const ctx = { maintenant: MAINTENANT.getTime(), aujourdhui: AUJOURDHUI, peutGerer: DR.peutGererLesConnecteurs(role), enLigne: true, parEmail: EQUIPE, catalogue: K.catalogueTarife() };
    const res = K.preparerActivation(K.instanceLibre(r.categorie, r.optionId, 1), ctx);
    if (DR.peutGererLesConnecteurs(role)) assert.equal(res.ok, true, role);
    else assert.deepEqual(res, { ok: false, raison: 'sans-droit-de-gerer' }, role);
  }
});

console.log(`\ncheck:outils — ${vus} contrôles, tous verts.`);

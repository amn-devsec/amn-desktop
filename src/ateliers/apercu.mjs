/**
 * L'APERÇU AUTONOME D'UN MODULE D'ATELIER — `node src/ateliers/apercu.mjs <id> [<id>…]`.
 *
 * Construit `docs/atelier/apercus/<id>.html` à partir du VRAI écran du module (pas d'une maquette refaite à la
 * main, qui dériverait), avec le CSS réel de l'application, comme `scripts/apercu/construire.ts` :
 *
 *   · le JavaScript : esbuild empaquette React, le socle et l'écran en un seul script en ligne ;
 *   · les feuilles du socle v4 (`noir.css` : jetons et néon `--fam-a` / `--fam-b`, briques, contrôles,
 *     archétypes, mouvement), importées par le montage comme le fait `Ambiance` dans l'application ;
 *   · Tailwind (même moteur, même `src/index.css`) pour les classes écrites dans `src/socle`, `src/ateliers/_commun`
 *     et le module ;
 *   · Inter (latin), embarquée en base64 ;
 *   · `<html data-ambiance="noir">`, comme `Ambiance` le pose.
 *
 * Aucune ressource n'est chargée du réseau : le fichier s'ouvre seul, hors ligne. Un bouton FR / EN en haut
 * change la langue de l'écran. Les modules qui n'ont pas encore été mis au socle v4 se rendent aussi : leurs
 * classes `socle-*` suivent les jetons noir et gris.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';
import { compile } from '@tailwindcss/node';
import { Scanner } from '@tailwindcss/oxide';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const dossierAteliers = path.join(racine, 'src/ateliers');
const sortie = path.join(racine, 'docs/atelier/apercus');

const DEFINES = {
  'process.env.NODE_ENV': '"production"',
  'import.meta.env.DEV': 'false',
  'import.meta.env.PROD': 'true',
  'import.meta.env.MODE': '"production"',
  'import.meta.env': '{"DEV":false,"PROD":true,"MODE":"production"}',
  __AMN_EDITION__: '"internal"',
  __AMN_VERSION__: '"0.0.0"',
};

/** Les feuilles et la police que `Ambiance` charge dans l'application, moins les graisses d'Inter inutiles ici. */
const MONTAGE = (id) => `
import { createElement as h, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-700.css';
import '../socle/noir.css';
import '../socle/ui/briques.css';
import '../socle/ui/controles/controles.css';
import '../socle/ui/situations/situations.css';
import '../socle/ui/graphiques/graphiques.css';
import '../socle/ui/archetypes/archetypes.css';
import '../socle/ui/vivant/vivant.css';
import '../socle/mouvement.css';
import { changerLangue } from '../i18n';
import Ecran from './${id}/Ecran';
function Apercu() {
  const [l, setL] = useState('fr');
  const choisir = (x) => { changerLangue(x); setL(x); };
  const lien = (x) => h('button', { type: 'button', onClick: () => choisir(x), 'aria-pressed': l === x, className: 'apercu-langue' }, x.toUpperCase());
  return h('div', null, h('nav', { className: 'apercu-barre', 'aria-label': 'Langue' }, lien('fr'), lien('en')), h(Ecran));
}
changerLangue('fr');
createRoot(document.getElementById('racine')).render(h(Apercu));
`;

async function bundle(id) {
  const r = await esbuild.build({
    stdin: { contents: MONTAGE(id), resolveDir: dossierAteliers, loader: 'tsx' },
    bundle: true,
    write: false,
    outdir: path.join(racine, '.apercu-sortie'),
    minify: true,
    format: 'iife',
    platform: 'browser',
    target: 'es2020',
    charset: 'utf8',
    jsx: 'automatic',
    loader: { '.woff2': 'dataurl', '.woff': 'dataurl', '.png': 'dataurl', '.svg': 'dataurl' },
    tsconfig: path.join(racine, 'tsconfig.json'),
    define: DEFINES,
    logLevel: 'error',
  });
  const fichier = (ext) => r.outputFiles.find((f) => f.path.endsWith(ext))?.text ?? '';
  return { js: fichier('.js').replace(/<\/script/gi, '<\\/script'), css: fichier('.css') };
}

/** Tailwind sur `src/index.css` (sans ses polices d'application, que l'aperçu n'emploie pas), pour les classes du module. */
async function tailwind(id) {
  const feuille = path.join(racine, 'src/index.css');
  const source = fs.readFileSync(feuille, 'utf8').replace(/^@import '@fontsource\/[^']+';\n/gm, '');
  const coutures = JSON.parse(fs.readFileSync(path.join(racine, 'tsconfig.json'), 'utf8').replace(/^\s*\/\/.*$/gm, '')).compilerOptions.paths;
  const compilateur = await compile(source, {
    base: path.dirname(feuille),
    onDependency: () => undefined,
    customCssResolver: async (spec) => (spec.startsWith('@edition/') && coutures[spec] ? path.join(racine, coutures[spec][0]) : undefined),
  });
  const scanner = new Scanner({
    sources: [path.join(racine, 'src/socle'), path.join(dossierAteliers, '_commun'), path.join(dossierAteliers, id)].map((base) => ({ base, pattern: '**/*', negated: false })),
  });
  return compilateur.build([...new Set(scanner.scan())]);
}

const ids = process.argv.slice(2);
if (ids.length === 0) {
  console.error('usage : node src/ateliers/apercu.mjs <id> [<id>…]');
  process.exit(2);
}
fs.mkdirSync(sortie, { recursive: true });
for (const id of ids) {
  const nom = /nom:\s*'([^']+)'/.exec(fs.readFileSync(path.join(dossierAteliers, id, 'module.ts'), 'utf8'))?.[1] ?? id;
  const { js, css } = await bundle(id);
  const html = `<!doctype html>
<html lang="fr" class="dark" data-ambiance="noir">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Atelier · ${nom}</title>
<!-- Généré par « node src/ateliers/apercu.mjs ${id} » depuis le vrai écran du module. Ne pas modifier à la main. -->
<style>
${await tailwind(id)}
${css}
html, body { margin: 0; background: var(--socle-fond-page, #0b0b0c); color: var(--socle-texte-1, #ededed); min-height: 100%; }
body { font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif; background: var(--socle-halos, none), var(--socle-fond-page, #0b0b0c); background-attachment: fixed; }
.apercu-barre { display: flex; justify-content: flex-end; gap: 4px; padding: 12px 24px 0; max-width: 1240px; margin: 0 auto; }
.apercu-langue { font: 500 12px 'Inter', system-ui, sans-serif; color: var(--socle-texte-2, #a0a0a5); background: transparent; border: 1px solid var(--socle-bord, #2a2a2e); border-radius: 6px; padding: 4px 8px; cursor: pointer; }
.apercu-langue[aria-pressed='true'] { color: var(--socle-texte-1, #ededed); border-color: var(--socle-bord-fort, #5a5a60); }
</style>
</head>
<body>
<div id="racine"></div>
<script>${js}</script>
</body>
</html>
`;
  fs.writeFileSync(path.join(sortie, `${id}.html`), html);
  console.log(`docs/atelier/apercus/${id}.html — ${Math.round(html.length / 1024)} Ko`);
}
fs.rmSync(path.join(racine, '.apercu-sortie'), { recursive: true, force: true });

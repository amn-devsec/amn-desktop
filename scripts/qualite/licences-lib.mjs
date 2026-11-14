/**
 * LA RÈGLE DE `check:licences` — pure, sans réseau, sans fichier (testée par tests/licences/classer.test.mjs).
 *
 * Direction de Harun (STATUT §1.43) : le contrôle liste les licences des dépendances, REFUSE toute AGPL, SIGNALE GPL et LGPL.
 *
 * Quatre niveaux, du moins grave au plus grave :
 *   ok       permissive (MIT, ISC, BSD, Apache-2.0, 0BSD, CC0, BlueOak, Unlicense…) ;
 *   info     copyleft faible par fichier (MPL, EPL, CDDL) : rien à faire, mais on le dit ;
 *   signale  GPL, LGPL, licence restrictive (SSPL, BUSL, « non commercial », Commons Clause), licence inconnue ou absente ;
 *   refuse   AGPL, quelle que soit la version (AGPL-1.0, AGPL-3.0-only, AGPL-3.0-or-later…).
 *
 * Une expression SPDX se lit ainsi : « A OR B » → on peut choisir, donc le niveau le plus doux ; « A AND B » → les deux
 * s'appliquent, donc le plus grave ; « X WITH exception » → le niveau de X (une exception adoucit parfois, jamais ici :
 * on garde la prudence). Les parenthèses sont comprises.
 */

export const NIVEAUX = ['ok', 'info', 'signale', 'refuse'];
const rang = (n) => NIVEAUX.indexOf(n);
export const pire = (a, b) => (rang(a) >= rang(b) ? a : b);
export const meilleur = (a, b) => (rang(a) <= rang(b) ? a : b);

/** Le niveau d'UNE licence SPDX simple (sans OR/AND), insensible à la casse. */
export function niveauDeLicence(id) {
  const s = String(id ?? '').trim();
  if (!s) return { niveau: 'signale', raison: 'licence absente' };
  const u = s.toUpperCase();
  if (/^AGPL/.test(u) || /\bAFFERO\b/.test(u)) return { niveau: 'refuse', raison: 'AGPL' };
  if (/^LGPL/.test(u) || /\bLESSER GENERAL\b/.test(u)) return { niveau: 'signale', raison: 'LGPL' };
  if (/^GPL/.test(u) || /\bGENERAL PUBLIC LICENSE\b/.test(u)) return { niveau: 'signale', raison: 'GPL' };
  if (/^(SSPL|BUSL|ELASTIC|COMMONS-CLAUSE|BUSINESS SOURCE)/.test(u) || /(^|-)NC(-|$)/.test(u) || /NONCOMMERCIAL/.test(u)) return { niveau: 'signale', raison: 'licence restrictive' };
  if (/^(UNLICENSED|SEE LICENSE|SEE LICENCE|CUSTOM|PROPRIETARY|COMMERCIAL|NONE|UNKNOWN)/.test(u)) return { niveau: 'signale', raison: `licence non standard (« ${s} »)` };
  if (/^(MPL|EPL|CDDL|EUPL|CPL|OSL)/.test(u)) return { niveau: 'info', raison: 'copyleft faible' };
  if (/^(MIT|ISC|BSD|APACHE|0BSD|CC0|UNLICENSE|BLUEOAK|PYTHON|ZLIB|WTFPL|OFL|CC-BY|X11|NCSA|PSF|HPND|MIT-0|ARTISTIC|BSL-1\.0|W3C|LIBPNG)/.test(u)) return { niveau: 'ok', raison: 'permissive' };
  return { niveau: 'signale', raison: `licence inconnue (« ${s} »)` };
}

/** Découpe une expression SPDX en jetons : ( ) AND OR WITH et identifiants. */
function jetons(expr) {
  const out = [];
  const re = /\(|\)|[^\s()]+/g;
  let m;
  while ((m = re.exec(expr))) out.push(m[0]);
  return out;
}

/**
 * Niveau d'une expression SPDX complète. Une expression illisible (parenthèses mal fermées) retombe sur « signale »,
 * jamais sur « ok » : mieux vaut un faux signalement qu'une AGPL qui passe.
 */
export function niveauDeExpression(expr) {
  const texte = String(expr ?? '').trim();
  if (!texte) return { niveau: 'signale', raison: 'licence absente' };
  // Ancienne écriture npm : { type: 'MIT' } ou tableau déjà aplati par l'appelant ; ici, une chaîne.
  const t = jetons(texte.replace(/^\((.*)\)$/s, '($1)'));
  let i = 0;
  const lireAtome = () => {
    const x = t[i];
    if (x === undefined) throw new Error('fin inattendue');
    if (x === '(') {
      i += 1;
      const r = lireOu();
      if (t[i] !== ')') throw new Error('parenthèse non fermée');
      i += 1;
      return r;
    }
    if (/^(AND|OR|WITH)$/i.test(x) || x === ')') throw new Error('opérateur à la place d’une licence');
    i += 1;
    const base = niveauDeLicence(x);
    if (t[i]?.toUpperCase() === 'WITH') i += 2; // « GPL-2.0 WITH Classpath-exception-2.0 » : on garde le niveau de GPL
    return base;
  };
  const lireEt = () => {
    let r = lireAtome();
    while (t[i]?.toUpperCase() === 'AND') {
      i += 1;
      const s = lireAtome();
      r = { niveau: pire(r.niveau, s.niveau), raison: rang(s.niveau) > rang(r.niveau) ? s.raison : r.raison };
    }
    return r;
  };
  const lireOu = () => {
    let r = lireEt();
    while (t[i]?.toUpperCase() === 'OR') {
      i += 1;
      const s = lireEt();
      r = rang(s.niveau) < rang(r.niveau) ? s : r;
    }
    return r;
  };
  try {
    const r = lireOu();
    if (i < t.length) throw new Error('jetons en trop');
    return r;
  } catch {
    // Illisible : on retombe sur la lecture la plus prudente (le plus grave des mots reconnus), au minimum « signale ».
    const tous = texte.split(/[\s()]+/).filter((x) => x && !/^(AND|OR|WITH)$/i.test(x)).map(niveauDeLicence);
    const pireNiveau = tous.reduce((n, x) => pire(n, x.niveau), 'signale');
    return { niveau: pireNiveau, raison: `expression illisible (« ${texte} »)` };
  }
}

/** La licence lue dans un `package.json` ou une entrée du lockfile : chaîne SPDX, ancien champ `licenses`, ou objet `{ type }`. */
export function licenceDe(entree) {
  if (!entree) return '';
  const l = entree.license ?? entree.licenses;
  if (typeof l === 'string') return l;
  if (Array.isArray(l)) return l.map((x) => (typeof x === 'string' ? x : x?.type)).filter(Boolean).join(' OR ');
  if (l && typeof l === 'object') return l.type ?? '';
  return '';
}

/** Le nom d'un paquet d'après sa clé de lockfile (« node_modules/@a/b/node_modules/c » → « c »). */
export function nomDepuisChemin(chemin) {
  const i = chemin.lastIndexOf('node_modules/');
  return i >= 0 ? chemin.slice(i + 'node_modules/'.length) : chemin;
}

#!/usr/bin/env node
/**
 * « EN RETARD » ET « À REPRENDRE » (STATUT §1.42 n° 10) — LE BON MOT AU BON ENDROIT, DANS LE TEXTE RENDU.
 *
 * Règle de Harun (14 nov.) : « à reprendre » vaut pour les TÂCHES, les rappels et les habitudes (pas de reproche) ;
 * pour les FACTURES on garde le terme précis, « en retard » ou « impayé » ; de même pour les PROJETS et les JALONS
 * (« en retard », « échue » : le retard y est un fait d'équipe) — précision provisoire du CO, soumise à Harun.
 *
 * Ce script lit des textes rendus (un fichier *.txt par écran : la sortie de `check:fidelite` / `lot.mjs` sur l'aperçu
 * rempli, ou tout autre dossier de textes) et dit, écran par écran :
 *   ✗ « à reprendre » (ou « reprendre ») près d'un mot de facture (facture, impayé, paiement, encaissement, règlement) sans mot de tâche ;
 *   ! même cas avec un mot de tâche ou de rappel (un rappel qui nomme une facture) : à relire ;
 *   ! « en retard » près d'un mot de tâche, rappel ou habitude : à relire (la règle demande « à reprendre » pour eux).
 * « Près » = la ligne elle-même et celle qui la précède et celle qui la suit.
 *
 *   node scripts/qualite/vocabulaire-retard.mjs --textes <dossier> [--textes <dossier2> …] [--sortie f.json]
 *   node scripts/qualite/vocabulaire-retard.mjs --controle     # contrôle positif : un texte qui doit faire sortir les deux cas
 *
 * Sortie 1 si au moins un ✗ ; les « ! » ne font pas échouer (relecture humaine).
 */
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const toutes = (n) => args.flatMap((a, i) => (a === `--${n}` ? [args[i + 1]] : []));
const SORTIE = toutes('sortie')[0];
const CONTROLE = args.includes('--controle');

const REPRENDRE = /(?<![a-zéèêàâîïôûù])(à reprendre|a reprendre|reprendre)(?![a-zéèêàâîïôûù])/i;
const FACTURE = /\b(factur\w*|impay\w*|paiements?|encaiss\w*|règlements?|relances? de paiement)\b/i;
const RETARD = /\ben retard\b/i;
// Projets et jalons : le terme précis reste (« en retard », « échue »), le retard y est un fait d'équipe (CO, 14 nov. 15h35, provisoire, soumis à Harun).
const PROJET = /\b(projets?|jalons?|feuille de route|échue?s?|échéance)\b/i;
const TACHE = /\b(tâches?|rappels?|habitudes?|à faire|priorités?|relanc\w+|stand-up)\b/i;

/** Les lignes qui comptent dans le voisinage d'une ligne i (elle-même ± 1). */
const voisinage = (L, i, r = 1) => L.slice(Math.max(0, i - r), i + r + 1).join(' · ');

export function analyser(texte) {
  const L = texte.split('\n').map((l) => l.trim());
  const trouves = [];
  L.forEach((l, i) => {
    if (!l) return;
    const v = voisinage(L, i);
    // Un rappel ou une tâche qui NOMME une facture (« Relancer la facture F-2041 ») garde « à reprendre » : on le signale à relire, pas comme une faute.
    if (REPRENDRE.test(l) && FACTURE.test(v)) trouves.push({ niveau: TACHE.test(v) ? 'relire' : 'faute', ligne: l.slice(0, 120), contexte: v.slice(0, 200) });
    else if (RETARD.test(l)) {
      const v2 = voisinage(L, i, 2); // « 13 ouvertes · 2 en retard » : le mot « Tâches » est deux lignes plus haut
      if (TACHE.test(v2) && !FACTURE.test(v2) && !PROJET.test(v2)) trouves.push({ niveau: 'relire', ligne: l.slice(0, 120), contexte: v2.slice(0, 200) });
    }
  });
  return trouves;
}

if (CONTROLE) {
  const t = ['Factures', 'F-2041 · à reprendre', 'impayée depuis 12 jours', '', 'Tâches', 'Relancer Menna', 'en retard de 2 jours'].join('\n');
  const r = analyser(t);
  const ok = r.some((x) => x.niveau === 'faute') && r.some((x) => x.niveau === 'relire');
  console.log(`${ok ? '✓' : '✗'} contrôle positif : ${r.length} trouvé(s) (attendu : 1 faute + 1 à relire)`);
  process.exit(ok ? 0 : 1);
}

const dossiers = toutes('textes');
if (!dossiers.length) { console.error('Usage : vocabulaire-retard.mjs --textes <dossier de *.txt> [--textes …] [--sortie f.json]  |  --controle'); process.exit(2); }
const resultats = [];
let fautes = 0;
let aRelire = 0;
let ecrans = 0;
for (const d of dossiers) {
  for (const f of fs.readdirSync(d).filter((x) => x.endsWith('.txt')).sort()) {
    ecrans += 1;
    const id = f.replace(/\.txt$/, '');
    const r = analyser(fs.readFileSync(path.join(d, f), 'utf8'));
    for (const x of r) {
      if (x.niveau === 'faute') fautes += 1; else aRelire += 1;
      resultats.push({ ecran: id, dossier: path.basename(d), ...x });
      console.log(`${x.niveau === 'faute' ? '✗' : '!'} ${id.padEnd(8)} ${x.niveau === 'faute' ? '« à reprendre » près d’un mot de facture' : '« en retard » près d’un mot de tâche/rappel/habitude'} : ${x.ligne}`);
    }
  }
}
console.log(`\n${ecrans} écran(s) lus : ${fautes} faute(s), ${aRelire} à relire.`);
if (SORTIE) fs.writeFileSync(path.resolve(SORTIE), JSON.stringify({ ecrans, fautes, aRelire, resultats }, null, 2));
process.exit(fautes ? 1 : 0);

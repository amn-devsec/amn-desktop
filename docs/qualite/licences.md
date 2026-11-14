# check:licences — les licences des dépendances

> Direction de Harun (STATUT §1.43) : lister les licences, **refuser toute AGPL**, **signaler GPL et LGPL**.
> Outil de T1 : [`scripts/qualite/check-licences.mjs`](../../scripts/qualite/check-licences.mjs), règle pure dans
> [`licences-lib.mjs`](../../scripts/qualite/licences-lib.mjs), tests dans `tests/licences/classer.test.mjs` (63 vérifications).

## Ce qu'il fait

Il lit `package-lock.json` (licence de chaque paquet installé, **dépendances indirectes comprises**), sans réseau ni
`node_modules` : il tourne tel quel sur la CI. Quatre niveaux :

| Niveau | Quoi | Effet |
|---|---|---|
| ✓ permissive | MIT, ISC, BSD, Apache-2.0, 0BSD, CC0, BlueOak, OFL, CC-BY… | compté |
| · copyleft faible | MPL, EPL, CDDL | listé (information) |
| ! à signaler | GPL, LGPL, SSPL / BUSL / « non commercial », licence inconnue ou absente | listé ; échoue seulement avec `--strict` |
| ✗ refusée | **AGPL**, toute version, en prod comme en dev | **sortie 1** |

Une expression SPDX est lue ainsi : `A OR B` → on choisit, donc le plus doux ; `A AND B` → les deux s'appliquent, donc le
plus grave ; `X WITH exception` → le niveau de X. Une expression illisible n'est jamais « permissive ».

Un signalement se **déclare accepté** dans [`licences-acceptees.json`](licences-acceptees.json) (paquet, licence, raison,
qui). Une AGPL ne s'accepte pas.

## Usage

```sh
node scripts/qualite/check-licences.mjs                 # le lockfile du dépôt
node scripts/qualite/check-licences.mjs --strict        # échoue aussi sur un signalement non accepté (lots qui ajoutent des dépendances)
node scripts/qualite/check-licences.mjs --tout          # détaille aussi les permissives
node scripts/qualite/check-licences.mjs --candidat ffmpeg-static --candidat prettier   # AVANT d'ajouter : licence lue sur le registre npm
node tests/licences/classer.test.mjs                    # la règle (sans réseau)
```

`--candidat` ne lit que le paquet lui-même : après l'ajout, relancer sans option pour voir aussi ses dépendances indirectes.

## État au 14 nov. (lockfile de la vivante)

926 paquets : 914 permissifs, 12 copyleft faible (`lightningcss*`, MPL-2.0, dépendance de développement), **0 à signaler,
0 refusée**.

## Candidats annoncés (registre npm, 14 nov.)

| Paquet | Licence | Niveau |
|---|---|---|
| `prettier` 3.10 | MIT | ✓ |
| `shiki` 4.6 | MIT | ✓ |
| `lighthouse` 13.6 | Apache-2.0 | ✓ |
| `onnxruntime-web` / `onnxruntime-node` 1.31 | MIT | ✓ |
| `@ffmpeg/ffmpeg` 0.12 (l'enveloppe) | MIT | ✓ |
| `axe-core` 4.14 | MPL-2.0 | · copyleft faible |
| **`ffmpeg-static` 5.3** | **GPL-3.0-or-later** | **! à signaler** |
| **`@ffmpeg/core` / `@ffmpeg/core-mt` 0.12** (le moteur WebAssembly) | **GPL-2.0-or-later** | **! à signaler** |

Pour le Studio : l'enveloppe `@ffmpeg/ffmpeg` est sous MIT mais le **moteur** qu'elle charge (`@ffmpeg/core`) est sous GPL.
Ce n'est pas une AGPL (le contrôle ne refuse pas), mais embarquer un moteur GPL dans une application distribuée a des
conséquences de licence : à faire valider par le CO avant d'ajouter la dépendance, puis à déclarer dans
`licences-acceptees.json` avec la raison.

## Branchement (à faire par le CO : fichiers partagés, hors de ma zone)

```diff
# package.json, scripts
+    "check:licences": "node scripts/qualite/check-licences.mjs",

# .github/workflows/editions.yml, avec les autres check:*
+      - run: npm run check:licences
+      - run: node tests/licences/classer.test.mjs
```

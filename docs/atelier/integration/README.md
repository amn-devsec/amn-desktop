# Intégrer les trois modules choisis — ce qu'il reste à poser

Les trois modules choisis par Harun (STATUT §1.21) sont **au socle v4 et prêts** ; ils ne sont pas encore au
registre. Deux choses sont hors de la zone de F1 (`src/ateliers/**`, `docs/atelier/**`) et attendent un accord.

## 1. Les trois déclarations (un fichier chacune)

`declarerModule` + `nouveau` : le registre de S5 en tire la place dans la famille Argent, la recherche par intention,
l'entrée du catalogue **et la route** (`routesDuRegistre()`, déjà monté par `appRoot.internal.tsx` : ce fichier n'est
pas à toucher).

Elles sont ici en `.txt`, pour ne pas être compilées tant qu'elles ne sont pas posées :

```
for m in tauxHoraire echeancier comparateurDevis; do
  cp docs/atelier/integration/$m.declaration.ts.txt src/refonte/modules/declarations/$m.ts
done
```

Retirer un module : supprimer son fichier de `declarations/` (et, si on veut, `src/ateliers/<id>/`).

## 2. Le correctif des gardes et du lexique (`hors-zone.patch`, 4 fichiers, 18 lignes ajoutées)

Aucun écran neuf n'existait au registre : plusieurs gardes l'ont écrit dans leurs assertions. Ce sont les premiers
écrans neufs réels, donc :

| Fichier | Changement | Pourquoi |
|---|---|---|
| `src/edition/navLexique.internal.ts` | 3 noms anglais (`NAV_EN`) | `check:navigation` : chaque module du catalogue a un nom anglais |
| `scripts/check-navigation.ts` | 101 → 104 entrées ; « aucun écran neuf » → « les trois de l'Atelier » ; la route d'essai se filtre sur `/essai/` | les deux assertions sur l'absence d'écran neuf, et le compte |
| `scripts/check-systeme-demarrage.ts` | 101 → 104 ; le registre se compare à son clone JSON | idem ; un clone JSON perd la fonction et l'icône d'un écran neuf |
| `scripts/check-socle-archetypes.ts` | `src/ateliers/` ajouté aux zones internes | les écrans de l'Atelier utilisent `Page`, `PageHead`, `RangeeKpi` |

```
git apply docs/atelier/integration/hors-zone.patch
```

## Ce qui a été validé, et où

Dans une copie jetable du dépôt (hors de la branche), avec les trois déclarations **et** le correctif : `typecheck`,
`typecheck:business`, `lint` et les 64 autres commandes de `editions.yml` sans navigateur, toutes vertes, ainsi que
`node src/ateliers/verifier.mjs` (le manifeste de chaque module y dit la même chose que sa déclaration). Détail :
`docs/atelier/rapport-integration-14nov.md`.

`tauxHoraire` est déclaré **courant** : le rail est plafonné à 16 essentiels et `check:navigation` en compterait 17.

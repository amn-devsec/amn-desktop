# Déclarations au registre de S5 — proposition

Les trois modules choisis par Harun (STATUT §1.21) se rangent chacun par **un fichier** de déclaration dans
`src/refonte/modules/declarations/` (`declarerModule` + `nouveau`) : le registre en tire la place dans la famille
Argent, la recherche par intention, l'entrée du catalogue **et la route** (`routesDuRegistre()`, déjà monté par
`appRoot.internal.tsx`). Aucun autre fichier à toucher.

Ces fichiers sont ici en `.txt` (pour ne pas être compilés tant qu'ils ne sont pas posés). Les poser :

```
for m in tauxHoraire echeancier comparateurDevis; do
  cp docs/atelier/integration/$m.declaration.ts.txt src/refonte/modules/declarations/$m.ts
done
node src/ateliers/verifier.mjs     # le manifeste de chaque module doit dire la même chose que sa déclaration
```

Retirer un module : supprimer son fichier de `declarations/` (et, si on veut, son dossier `src/ateliers/<id>/`).

Validé dans une copie jetable du dépôt : voir `docs/atelier/rapport-integration-14nov.md`.

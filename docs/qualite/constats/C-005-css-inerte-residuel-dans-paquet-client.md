# C-005 — Le paquet client garde 64 sélecteurs CSS du socle (+4,3 Ko) après la correction de C-001

- Gravité : **Mineur** (inerte : aucune classe du paquet client ne les utilise)
- Branche : `claude/refonte-socle` @ `888f7a0` (S0)
- Responsable proposé : S0 (génération des classes Tailwind de l'édition cliente), décision CO
- État : ouvert

## Constat

T1 a construit l'édition cliente depuis `main` (`630ef45`) et depuis le socle (`888f7a0`) et les a comparées avec
`scripts/qualite/comparer-paquet-client.mjs`. La règle de la mission : après C-001 l'écart doit revenir au niveau de
`main`, aux coutures vides près.

| | `main` | socle `888f7a0` |
|---|---|---|
| fichiers du paquet | 65 | 65 |
| CSS | 205 916 octets | 210 211 octets (**+4 295**, +2,1 %) |
| sélecteurs CSS | — | **64 ajoutés**, 1 retiré (C-001 en annonçait 96 : S0 a sorti la feuille du socle de `src/index.css`, 207 lignes retirées) |
| JavaScript | — | seulement les coutures vides (`return null`, composants vides) |
| mots interdits (« ajmani », `src/socle`, `src/refonte`, `emettreMoment`, `garde.escalade`, `site.muet`) | — | aucun |
| attribut `data-famille-active` | — | absent du paquet (et du rendu : `scripts/qualite/coquille-v4.mjs`, 2 vérifications) |

Les 64 sélecteurs ajoutés sont des utilitaires Tailwind (`.bg-\[\#0c0c0d\]`, `.text-\[\#8a8a8e\]`, `.border-\[var\(--fam-bord\)\]`,
`.tracking-\[0\.28em\]`, `.h-\[78vh\]`…) : Tailwind les génère parce que les fichiers du socle et de la refonte, qui ne sont
pas dans le paquet client, sont tout de même parcourus pour y lire des noms de classe.

## Preuve

[`docs/qualite/resultats/paquet-client-socle-888f7a0.md`](../resultats/paquet-client-socle-888f7a0.md) (rapport complet de l’outil), reproductible :
`node scripts/qualite/comparer-paquet-client.mjs <dist-main-cliente> <dist-socle-cliente>`.

## Correctif proposé

Limiter la lecture des classes Tailwind de l'édition cliente aux dossiers qu'elle importe réellement (exclure
`src/socle/` et `src/refonte/` de la source de classes quand `AMN_EDITION=business`). Si le CO préfère garder
4 Ko inertes, le dire dans STATUT : la règle « le paquet client ne change pas » n'est alors plus littérale.

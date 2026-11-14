# C-007 — `check:encres` passe sur `main` et échoue sur le socle (et sur vivante)

- Gravité : **Majeur** (le STATUT annonce « les 5 échecs connus de S0 échouent à l'identique sur main » : c'est faux pour celui-ci)
- Branche : `claude/refonte-socle` @ `888f7a0` **et** `claude/refonte-vivante` @ `8333822`
- Responsable proposé : S3 (fichier fautif), CO pour la mise à jour de STATUT
- État : ouvert

## Constat

`node scripts/check-encres.mjs`, même machine, mêmes dépendances :

| Arbre | Résultat |
|---|---|
| `main` @ `630ef45` | **sortie 0** — « 703 fichier(s) relus… Aucun défaut ; 26 copie(s) connue(s) en attente » |
| `vivante` @ `8333822` | **sortie 1** — 4 « copie nouvelle » |
| socle @ `888f7a0` | **sortie 1** — les mêmes 4 |

Les 4 copies sont dans `src/refonte/garde/equipes.ts:45` (`#a2acbc`, `#bcc4d1`, `#6e7a8d`, `#4c5667`, des copies des jetons
`--color-fam-outils` et `--color-fam-outils-texte`). Le fichier vient du commit `4e24ab3` (S3, « Garde visible »), déjà dans
vivante : ce n'est **pas** le socle de S0 qui l'introduit, mais ce n'est pas non plus un échec présent sur `main`.

## Où en sont les 4 autres « échecs connus » (même mesure)

| Garde | `main` | socle | Lecture |
|---|---|---|---|
| `check:migration` | sortie 2 | sortie 2 | **non jouable ici** (demande un clone d'amn-api, `AMN_API_DIR`) — ni pour ni contre |
| `check:xss` | sortie 0 | sortie 0 | passe des deux côtés **quand on lui donne l'API d'essai** (`AMN_API_URL=…:4171`) ; sans, « fetch failed » |
| `check:support` | sortie 0 | sortie 0 | passe des deux côtés avec le bundle interne (111 écrans de la cliente parcourus) |
| `check:visite` | sortie 1 | sortie 1 | échoue à l'identique : « Qui êtes-vous ? » intercepte le clic (voir C-002) |

Donc, sur ces cinq : un échec identique (`visite`), un jamais exécuté (`migration`), deux qui passent (`xss`, `support`) et
un qui n'est pas identique (`encres`).

## Correctif proposé

Dans `src/refonte/garde/equipes.ts`, écrire `var(--color-fam-outils)` / `var(--color-fam-outils-texte)` à la place des
quatre valeurs (le message de la garde le dit). Corriger la phrase de STATUT §1.25.

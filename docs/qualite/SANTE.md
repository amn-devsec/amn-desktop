# Tableau de santé — refonte vivante

> Tenu par T1, mis à jour à chaque passage. Comment relancer : [`README.md`](README.md).
> Bac à sable : amn-api en mémoire, comptes `@exemple.test`, données factices (`seed-essai.mjs`). Aucune donnée réelle, aucun secret.

## Passage 2 — 14 novembre 2026 — socle v4 (`claude/refonte-socle` @ `888f7a0`)

> Demande : STATUT §1.25 (feu vert au passage 2 de T1) et §1.30. Référence : `main` @ `630ef45`. Même bac à sable
> (API d'essai en mémoire, comptes `@exemple.test`, données fictives), même machine (4 cœurs), une garde à la fois.
> Le passage 1, plus bas, reste l'état de `refonte-vivante` @ `f059f32` (23 oct.).

### Verdict de T1 sur le socle v4

**Fusion du socle : feu vert de T1.** L'édition cliente est intacte (JavaScript : coutures vides ; CSS : 4,3 Ko inertes, C-005),
la coquille est éteinte par défaut, la fidélité v4 est mesurée et stable, les 59 contrôles de `editions.yml` sont verts,
et les trois conditions du CO sur la coquille tiennent (une limite de contraste à 0,01 point, C-010).

**Basculement de la coquille (allumée par défaut) : T1 ne donne pas encore son feu vert.** Raisons mesurées :
le tutoiement n'est pas respecté dans le rendu (C-006, 6 chaînes sur LOT-00) ; `check:encres` est rouge (C-007) ;
et, sous coquille v4, les gardes navigateur ne couvrent que 15 écrans sur 142 (C-008), donc elles ne peuvent rien certifier
sur le produit que les gens verront. Les points à trancher sont en bas de cette section.

| Contrôle demandé | Résultat |
|---|---|
| Paquet client, `main` contre socle | JavaScript : coutures vides seulement ; mots interdits : aucun ; `data-famille-active` : absent. **CSS : +4,3 Ko, 64 sélecteurs inertes restent** (C-001 en annonçait 96) : [C-005](constats/C-005-css-inerte-residuel-dans-paquet-client.md) |
| Condition 1 : lisibilité (AA, plancher T4) sous le troisième halo et le voile | **Tenue sauf une limite** : 1 136 textes mesurés sur les pixels, un seul à 4,49:1 (T4 sur le halo bleu, 11,5 px) : [C-010](constats/C-010-texte-t4-sous-4-5-sur-le-halo.md). `check:contraste` donne un faux rouge sous coquille (dégradés) : [C-008](constats/C-008-gardes-aveugles-avec-la-nouvelle-coquille.md) |
| Condition 1 : lueurs animées coupées en mouvement réduit | **Tenue** : 5 à 10 animations infinies en mouvement permis (`amnHalo`, `pulse`, `sc-mvt-clignote`, `sc-squelette`), **0** en mouvement réduit, sur 5 écrans ; `data-mouvement="reduit"` posé |
| Condition 2 : `data-famille-active` | **Tenue** : posé quand la coquille est allumée et suit la route (jour, argent, contacts), retiré **en direct** quand on l'éteint, retiré sur l'écran de connexion, **jamais** dans l'édition cliente (drapeau posé ou non ; ni `data-ambiance`, ni `--fam-a`) |
| Condition 3 : point d'horloge de G09 | **Acceptée par le CO** (§1.25) ; T1 n'a pas de mesure dédiée : G09 est à 0,2 % en disposition (±10) |
| Fidélité v4 des 9 écrans, ±2 px | [`ECARTS-LOT-00-v4.md`](fidelite/ECARTS-LOT-00-v4.md) : disposition sous 15 % partout (sept écrans sous 9 %) ; écart brut de 11,4 % (G06) à 43,4 % (G05), dû aux halos néon, aux données d'exemple et à la coquille |
| Tutoiement dans le rendu | **Pas conforme** : 6 chaînes sur LOT-00 et la coquille, 79 lignes sur 19 autres écrans : [C-006](constats/C-006-vouvoiement-residuel-dans-le-rendu.md) |
| Les « 5 échecs connus de S0, identiques sur main » | **Faux pour `check:encres`** (passe sur `main`, échoue sur socle et vivante : [C-007](constats/C-007-check-encres-rouge-sur-la-branche.md)) ; `xss` et `support` **passent** des deux côtés quand on leur donne l'API d'essai ; `visite` échoue des deux côtés ; `migration` non jouable ici |
| `check:ancres`, `check:avoirs` (delta annoncé par le CO) | Passent sur `main`, **échouent sur le socle et sur vivante** `8333822` : ancres `href="#sc-principal"` (`Coquille.tsx`) et `href="#…"` (`PageDemoSocle.tsx`) ; avoirs : `lucide-react` non résolu depuis `src/socle/ui/Bouton.tsx` (le contrôle n'empaquette pas cette dépendance). Correctifs annoncés par S0, non vérifiés |

### Gardes sans navigateur

`tester-branche.mjs origin/claude/refonte-socle` : `typecheck`, `typecheck:business`, `lint`, **59 `check:*` de `editions.yml`** : tous verts.
Hors `editions.yml` : les 5 « échecs connus », voir ci-dessus, et `ancres` / `avoirs`.

Points de la liste de contrôle de la branche (à relire par le CO) :

- le socle est **20 commits derrière** vivante (`8333822`) ;
- `docs/refonte/STATUT.md` modifié (« interdit sans accord du CO ») ;
- `src/index.css` : 2 lignes ajoutées, 207 retirées (la feuille du socle en sort : c'est la correction de C-001) ;
- jumeau `src/edition/coquille.business.tsx` : 10 lignes ajoutées, à relire (doit ne rien faire) ; nouveau jumeau `substitutions.business.tsx` ;
- `src/components/IdleScreensaver.tsx` importe directement `../refonte/garde/SalleDeSituation` : signalé « bloquant » par l'outil, **déjà présent sur vivante** (S3), commenté par ses auteurs (fichier monté seulement par la racine interne) ; le paquet client ne contient pas `SalleDeSituation` ;
- trois lignes de test associent « Ajmani » à un « personnage » (faux positif de mot : `SuggestionAjmani`).

### Gardes navigateur

« Amorce » = routes découvertes par la garde (cliente 118, interne 142 attendues). Trois passages : socle coquille éteinte (cliente + interne), socle
coquille allumée (interne), `main` (interne, les gardes qui avaient un défaut). `main` cliente reprend le passage 1 (même commit, même code).

| Garde | Édition | `main` | Socle, coquille éteinte | Socle, coquille allumée |
|---|---|---|---|---|
| `business` | cliente | ✓ | ✓ 28 motifs interdits absents | — |
| `isolation` | cliente / interne | ✓ / ✓ | ✓ / ✓ | ✓ (interne) |
| `mouvement` | cliente / interne | ✓ / ✓ | ✓ 558 / ✓ 412 déplacements, aucun en mouvement réduit | `?` amorce 15, non concluant |
| `contraste` | cliente / interne | ✓ / ✓ (188 écrans, 28 467 textes) | ✓ (135 écrans) / ✓ (199 écrans, 28 253 textes) | `?` non concluant ; 2 faux rouges (C-008). **Mesure sur pixels : 1 136 textes, 1 limite** |
| `focus` | cliente / interne | ✗ 5 / ✗ 8 | ✗ 5 / ✗ 9 | ✗ 1 forme sans focus (non comparable) |
| `cibles` | cliente / interne | ✗ 9 / ✗ 12 familles | ✗ 9 / ✗ 13 | `?` 8 familles sur 15 routes |
| `etiquettes` | cliente / interne | ✗ 1 / ✗ 3 formes | ✗ 1 / ✗ 5 | ✗ 1 forme (6 occurrences) |
| `largeur` | cliente / interne | ✗ 10 / ✗ 7 écrans sur 188 | ✗ 1 écran sur 136 / ✗ 7 sur 199 | `?` 4 écrans sur 169 |
| `signal` | cliente / interne | ✓ / ✗ | ✓ / ✗ | ✗ |
| `mobile` | cliente / interne | non mesuré | ✓ / ✓ | ✓ (interne) |
| `coquille` | cliente / interne | ✓ / **✓** | ✓ / **✗ 6 écrans sur 23** | **✗ 6 écrans sur 23** |

Lecture :

- **Édition cliente : rien de nouveau.** Mêmes familles de défauts qu'au passage 1 sur `focus` (5), `cibles` (9), `etiquettes` (1). La différence de `largeur` (1 écran contre 10 au passage 1) est de la couverture de la garde (C-004), pas du produit : l'édition cliente n'a pas bougé.
- **Édition interne, coquille éteinte** : mêmes défauts que `main`, à des écarts de données près (focus 9 contre 8 : `#/garde/ajmani` et `#/garde/organigramme` en plus, `#/salle` en moins ; étiquettes : le `<input type="file">` de `#/interventions` et un bouton ; cibles : « Nouvelle conversation » 32 px de l'assistant ; largeur : `#/tous-les-modules` à 667 px). Tout cela vient des branches fusionnées avant le socle (S3, S5, assistant), déjà relevé au passage 1, pas des feuilles de style v4.
- **`check:coquille` interne rouge sur le socle, coquille éteinte comme allumée** (6 écrans sur 23 « aucune coquille rendue ») : régression déjà annoncée par STATUT depuis S1 (rail de l'ancienne coquille masqué sur bureau). Le contrôle vise l'ancienne coquille ; les contrôles de la nouvelle sont `check:socle-coquille` et les `check:systeme-*`. À retirer ou à adapter par le CO.
- **Sous coquille v4, les gardes navigateur ne peuvent pas certifier** : amorce 15 au lieu de 142 ([C-008](constats/C-008-gardes-aveugles-avec-la-nouvelle-coquille.md)). T1 ne donne pas de « vert » pour la coquille sur ces gardes.
- **Un compte neuf** voit maintenant Démarrage à la première connexion : `check:contraste` plante sur deux « Plus tard » ([C-009](constats/C-009-deux-plus-tard-au-premier-lancement.md)) ; le lanceur de T1 pose le drapeau d'avance.

### Constats ouverts (nouveaux de ce passage)

| # | Gravité | Sujet | Proposé à |
|---|---|---|---|
| [C-005](constats/C-005-css-inerte-residuel-dans-paquet-client.md) | Mineur | 64 sélecteurs CSS inertes (+4,3 Ko) restent dans le paquet client | S0, CO |
| [C-006](constats/C-006-vouvoiement-residuel-dans-le-rendu.md) | **Majeur** | « vous / votre / vos » visible : 6 chaînes sur LOT-00, 79 lignes ailleurs | CO, S0 |
| [C-007](constats/C-007-check-encres-rouge-sur-la-branche.md) | **Majeur** | `check:encres` : vert sur `main`, rouge sur socle et vivante (4 copies, `equipes.ts`) ; STATUT §1.25 à corriger | S3, CO |
| [C-008](constats/C-008-gardes-aveugles-avec-la-nouvelle-coquille.md) | **Majeur** | gardes navigateur : amorce 15 sous coquille v4 ; `check:contraste` ignore les dégradés | auteurs des gardes |
| [C-009](constats/C-009-deux-plus-tard-au-premier-lancement.md) | Mineur | deux « Plus tard » au premier lancement : `check:contraste` plante | auteurs de la garde |
| [C-010](constats/C-010-texte-t4-sous-4-5-sur-le-halo.md) | Mineur | T4 à 4,49:1 sur le halo bleu | S0, CO |

C-001 est **en partie résolu** (96 → 64 sélecteurs, la feuille du socle est sortie de `index.css`) ; le reste est C-005.

### Ce que le CO doit décider avant la fusion

1. **Tutoiement** (C-006) : faut-il corriger les 6 chaînes de LOT-00 avant la fusion, et que fait-on des autres lots ?
2. **`check:encres`** (C-007) : S3 corrige `equipes.ts`, ou la garde reste rouge sur vivante.
3. **Gardes navigateur sous coquille v4** (C-008) : aucun vert possible tant que la découverte des écrans lit la navigation visible. Accepter la fusion sans, ou la faire corriger d'abord.
4. **T4** (C-010) et **CSS inerte** (C-005) : corriger ou accepter par écrit dans STATUT.

### Ce que T1 n'a pas pu vérifier

- `check:migration` (clone d'amn-api absent) ; la CI GitHub (pas lue) ; l'application Electron.
- Les gardes navigateur sur les 142 écrans **avec** la coquille v4 (C-008) : seuls 15 écrans ont été parcourus ; le contraste a été mesuré à part sur 10 écrans.
- Les sept écarts de coquille de la v3 (C2, C4, C5, C6, C11, C12, C13) : pas re-mesurés sur la v4.
- Les correctifs de S0 pour `ancres` et `avoirs` (pas encore poussés au moment du test).

---

## Passage 1 — 2026-10-23

- **Passage 1 — 2026-10-23.**
- Pointe testée : `claude/refonte-vivante` @ `f059f32` (S0, S1, S2, S3, S5 fusionnées). Référence : `main` @ `630ef45`.
- Machine : 4 cœurs, Chromium 1194 (Playwright), Node 22.22. Une garde à la fois.

## En bref

- **Édition cliente : rien n'a bougé dans ce que les gardes mesurent.** Sur les 6 gardes qui échouent aujourd'hui, `main` et la pointe donnent exactement les mêmes défauts (0 nouveau, 0 disparu). Le paquet web ne contient aucun mot interdit (« Ajmani », `refonte`, `src/socle`…). Il grossit quand même de 15 Ko de CSS inerte (C-001).
- **Une régression de la refonte, côté interne : `check:coquille`**, verte sur `main`, rouge sur la pointe (6 écrans sans colonne de navigation « coquille »). STATUT l'annonçait depuis S1.
- **Les modules de F1 ne sont pas intégrables tant que leur vérificateur casse sur la pointe** (C-003, patch validé). Leur logique d'argent est exacte (139 671 vérifications, 0 défaut).
- **Les gardes navigateur elles-mêmes sont peu fiables** : elles étaient aveuglées par la fenêtre de bienvenue (C-002) et leur couverture varie d'un passage à l'autre (C-004). Les résultats ci-dessous sont obtenus avec les deux contournements du bac à sable.

## Gardes sans navigateur

| Ensemble | Pointe `f059f32` |
|---|---|
| `typecheck`, `typecheck:business`, `lint` | ✓ ✓ ✓ |
| 43 `check:*` de `editions.yml` (dont les 5 contrôles croisés poste ↔ serveur, avec amn-api cloné à côté) | ✓ 43/43 |
| Fusion simulée F1 + pointe : mêmes gardes | ✓ (hors vérificateur de F1, voir C-003) |

La CI GitHub n'a pas été relue par T1. Selon STATUT, « Garde-fous croisés » y échoue pour une raison extérieure au code (secret `AMN_API_TOKEN` refusé) ; ici, ces 5 contrôles passent.

## Gardes navigateur — jamais exécutées avant ce passage

« Amorce » = nombre de routes découvertes par la garde (cliente 118, interne 142-143 attendues). Les défauts sont comptés tels que les garde les rend.

| Garde | Édition | `main` | Pointe | Ce que c'est |
|---|---|---|---|---|
| `business` (paquet client) | cliente | ✓ | ✓ | 28 motifs interdits absents, 3 marqueurs présents |
| `isolation` | cliente / interne | ✓ / ✓ | ✓ / ✓ | aucune donnée d'une organisation chez l'autre |
| `mouvement` | cliente / interne | ✓ / ✓ | ✓ / ✓ | 535 et 394 déplacements, aucun en mouvement réduit |
| `contraste` | cliente / interne | ✓ / ✓ | ✓ / ✓ | 135 et 190 écrans, 22 672 et 27 254 textes, aucun sous WCAG AA |
| `mobile` | cliente / interne | non mesuré | ✓ / ✓ | un objet ambre au plus, navigation du téléphone |
| `coquille` | cliente / interne | ✓ / ✓ | ✓ / **✗** | interne : 6 écrans sur 23 « aucune coquille rendue » — **régression de la refonte** (rail masqué sur bureau depuis S1) |
| `focus` | cliente / interne | ✗ 5 / ✗ 8 | ✗ 5 / ✗ 8 | fenêtres qui s'ouvrent sans prendre le focus. Cliente identique. Interne : 1 nouveau (`/garde/organigramme`, « Ouvrir la conversation »), 1 disparu |
| `cibles` | cliente / interne | ✗ 9 familles / ✗ 12 | ✗ 9 / ✗ 13 | cibles tactiles trop serrées. Interne : nouveau `#/tous-les-modules` (« Accueil et tableau de bord », 32 px, S5) |
| `etiquettes` | cliente / interne | ✗ 1 / ✗ 3 | ✗ 1 / ✗ 5 | champs sans nom. Les 2 nouveaux côté interne (`<input file>` de `#/interventions`, bouton de `#/outils/calculatrice`) sont sur des écrans qui existent aussi sur `main` : le même `<input file>` y est déjà relevé côté cliente. La garde ne les atteignait pas côté interne sur `main` ; la navigation de la pointe les lui montre (cause exacte non isolée) |
| `largeur` | cliente / interne | ✗ 10 / ✗ 20 | ✗ 10 / ✗ 22 | texte écrasé ou coupé à 390 px. Interne : nouveau `#/tous-les-modules` (516-584 px dans 390, S5) |
| `signal` | cliente / interne | ✓ / ✗ | ✓ / ✗ | interne : 4 écrans (Cyber, 16 écrans vides au total) sur `main` comme sur la pointe. Données d'essai absentes (voir ci-dessous) |

Lecture :

- **Défauts hérités de `main` et inchangés** (focus, cibles, étiquettes, largeur, côté cliente comme interne) : la refonte ne les a ni créés ni corrigés.
- **Défauts apportés par la refonte** : `coquille` interne (S1), `#/tous-les-modules` en cibles et en largeur (S5), une fenêtre sans focus sur l'organigramme de la Garde (S3).
- **`signal` interne n'est pas concluant sur le fond** : les écrans Cyber et Studio sont « vides » parce que `seed-essai.mjs` ne les peuple pas (aucun incident, aucune pièce de studio). La garde dit elle-même qu'un écran vide n'a rien à signaler. À corriger côté données d'essai, pas côté produit.

## Couverture

- **Scripts de garde dans le dépôt : 73** `scripts/check-*`. Pas de mesure de couverture de code (aucun lanceur de tests unitaires ; convention du dépôt, voir `check-money.ts`).
- **Tests de T1 : `tests/f1/argent.test.mjs`**, 139 671 vérifications sur 6 modules de F1 recalculés avec un oracle en entiers. 3 sabotages volontaires du code de F1 sont détectés.
- **Écrans parcourus par les gardes navigateur** : 136 écrans cliente, 188-190 interne (largeur) ; 135 et 190 (contraste).
- **Pas couverts** : l'application Electron (aucune garde ne l'ouvre, seulement le build web) ; l'édition cliente en tant que paquet installé ; les écrans de F1 (hors application) ; les appels, la voix, le temps réel ; le guide de première connexion lui-même (les gardes le masquent, voir C-002).

## Constats ouverts

| # | Gravité | Sujet | Proposé à |
|---|---|---|---|
| [C-001](constats/C-001-css-socle-dans-paquet-client.md) | Mineur | Le CSS du socle (+15 Ko, 124 sélecteurs) part dans le paquet client ; inerte aujourd'hui | CO (déjà repris dans STATUT) |
| [C-002](constats/C-002-gardes-navigateur-masquees-par-le-guide.md) | Majeur | La fenêtre de bienvenue masque tout aux gardes navigateur (277 faux défauts de focus) | auteurs des gardes |
| [C-003](constats/C-003-verifier-f1-casse-sur-refonte-vivante.md) | Majeur | Le vérificateur de F1 casse sur la pointe ; patch testé joint | F1 |
| [C-004](constats/C-004-couverture-des-gardes-instable.md) | Majeur | La couverture des gardes varie sans changement de code (11 routes vues au lieu de 118) | auteurs des gardes |

Relectures : [S2 @ a537dbe](relectures/S2-a537dbe.md) (fusionnée depuis ; 4 décisions restantes, M1 à M4), [F1 @ 59056ad](relectures/F1-59056ad.md).

## Relectures de branches

| Branche | État | T1 |
|---|---|---|
| `refonte-s2-accueil` | fusionnée | relue avant fusion : aucun bloquant technique, 4 décisions (persona de texte Ajmani, toasts, `emit` partagés, `App.tsx`) |
| `refonte-atelier-f1` | non fusionnée | relue et testée : voir ci-dessus ; **bloquée par C-003** |
| S6 (`refonte-sec-*`) | **rien de poussé** | rien à relire. Conforme à la règle du dépôt public (rien qui décrive une faille). T1 n'a pas non plus produit de document de sécurité |
| `refonte-sim-bac-a-sable` | non fusionnée, session « SIM » inconnue du CO | parcourue : ses constats de sécurité restent locaux (`.gitignore`), la carte poussée est « hors sécurité ». Non testée par T1 |
| S5 (`refonte-s5-modules`) | fusionnée | non relue avant fusion. Mesurée après : 2 défauts nouveaux sur `#/tous-les-modules` |

## Ce que T1 n'a pas pu vérifier

- **Les gardes navigateur sur la CI** : proposition prête ([`proposition-ci.md`](proposition-ci.md)), mais rien n'a été essayé sur GitHub Actions ; elle dépend du secret `AMN_API_TOKEN`, aujourd'hui refusé.
- **`check:mobile` et `check:signal` sur `main`** : `mobile` n'a pas été lancé sur `main` ; `signal` interne échoue des deux côtés mais pour une raison de données d'essai.
- **La reprise automatique du bac à sable** (relance d'une garde dont l'amorce est basse) : écrite et chargée, jamais déclenchée en conditions réelles (le dernier passage a eu une bonne couverture du premier coup).
- **Les rendus.** Aucune capture regardée ; les contrastes sont mesurés par calcul, pas à l'œil.
- **Le barème kilométrique 2026 et les autres valeurs légales** de F1 : mes tests prouvent que le code applique sa table, pas que la table est celle en vigueur.
- **Ce qui a changé sur `refonte-vivante` depuis `f059f32`.**

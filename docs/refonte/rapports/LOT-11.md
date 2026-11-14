# Rapport de fin de session — S8 · LOT-11 Espace Développement

## Résumé (5 lignes au plus)

1. **Étape 1 faite** : 6 fiches d'après les images `DEV-*` (13 rubriques, textes au tutoiement, cotes relevées sur les images) et 1 fiche proposée sans image (DEV-ensemble, sur le modèle des hubs, avec `ModuleTile`), plus `00-COMMUN.md` ; envoyées au CO (`6af5f4f`) pour la relecture de Harun.
2. **Étape 2 faite** : note `docs/refonte/preparation/LOT-11-developpement.md` (inventaire, sous-modules réutilisés avec leur lot, dépendances, 7 constats pour le CO, données à demander à SIM).
3. **Logique pure** dans `src/refonte/developpement/` : journal des exécutions, tâches planifiées locales, état des déploiements ; garde `check:developpement` (51 contrôles) ajoutée à `package.json` et `editions.yml`.
4. **Rien n'est contourné** : connecteurs Code, Hébergement et coûts attendent le modèle de S9 (LOT-12) ; DEV-serveur attend LOT-13. Aucun composant visuel.
5. **Étape 3 non commencée** : elle attend le feu vert du CO (socle v4 fusionné, fiches relues).

## Branche et sha

- Branche : `claude/refonte-developpement`
- Dernier commit : voir le message au CO (commit de ce rapport, après `5a390e7`)
- Partie de : `claude/refonte-vivante` @ `50a58c4`

## Fichiers touchés

Sortie de `git diff --name-status origin/claude/refonte-vivante...HEAD` (avant le commit de ce rapport) :

```
M	.github/workflows/editions.yml
M	docs/refonte/STATUT.md
A	docs/refonte/fiches/LOT-11/00-COMMUN.md
A	docs/refonte/fiches/LOT-11/DEV-couts.md
A	docs/refonte/fiches/LOT-11/DEV-deploiements.md
A	docs/refonte/fiches/LOT-11/DEV-editeur.md
A	docs/refonte/fiches/LOT-11/DEV-ensemble.md
A	docs/refonte/fiches/LOT-11/DEV-modeles-sites.md
A	docs/refonte/fiches/LOT-11/DEV-projets.md
A	docs/refonte/fiches/LOT-11/DEV-serveur.md
A	docs/refonte/preparation/LOT-11-developpement.md
M	package.json
A	scripts/check-developpement.ts
A	src/refonte/developpement/commun.ts
A	src/refonte/developpement/deploiements.ts
A	src/refonte/developpement/i18n.ts
A	src/refonte/developpement/journal.ts
A	src/refonte/developpement/planification.ts
```

Plus ce rapport (`docs/refonte/rapports/LOT-11.md`).

Fichiers **sensibles** ou **hors zone** touchés, avec la raison :

| Fichier | Changement (ajout seulement ?) | Pourquoi |
|---|---|---|
| `package.json` | ajout seulement : une ligne `check:developpement` après `check:donnees` | la garde du lot (demandée) |
| `.github/workflows/editions.yml` | ajout seulement : une étape « Espace Développement (LOT-11) » après `check:donnees` | la garde du lot en CI (demandée) |
| `docs/refonte/STATUT.md` | section LOT-11 du §7 seulement | une ligne par écran (`REGLES.md`) |

Aucun fichier de l'édition cliente, du socle, de `src/screens/**` ni de `appRoot.internal.tsx`. `package-lock.json` inchangé.

## Gardes

| Garde | Résultat |
|---|---|
| `typecheck` | vert |
| `typecheck:business` | vert |
| `lint` | vert |
| `check:accueils` | vert |
| `check:socle` | vert |
| `check:moments` | vert |
| `check:navigation` | vert |
| `check:donnees` | vert |
| `check:developpement` | vert, 51 contrôles |

Les mêmes gardes étaient vertes sur `refonte-vivante` avant le lot. Dépendances installées par `npm ci --ignore-scripts` (aucun script d'installation lancé). Ni `npm start`, ni `build:web`, ni serveur.

## Points à trancher

> Mis à jour après les décisions du CO (`STATUT.md` §1.17) : barre latérale, 8e hub, famille des Modèles de sites, « Éditeur de flux », comptes de DEV-couts, cible « Interne » et format Sinon / Puis (S9) sont **tranchés**, et les fiches y sont alignées. Restent ouverts : la relecture de Harun, la seconde entrée dans le registre et la teinte de la famille.

Détail : `preparation/LOT-11-developpement.md` §5 et rubrique 13 de chaque fiche.

- **Relecture des fiches par Harun**, dont DEV-ensemble (aucune image : disposition calée sur F50 et F60).
- **Seconde entrée** de H20, H21, H24, H03, ME05, MO03 : le registre refuse une vue en double (`check:navigation`) → par la sous-liste de la barre latérale (S0) ou un champ « aussi dans » du registre (S5).
- **Teinte de la famille** `developpement` dans le registre (sept teintes seulement ; La Garde a pris `outils`) → accepter une `FamilleCouleur` du socle v4, ou prendre `outils`.
- **8e hub** `/ensemble/developpement` dans `HUBS` du socle v4 (S0).
- **Moteur de H20** à étendre pour les blocs Sinon / Puis : avec S6, sans troisième moteur.
- **Barre latérale** des images (13 lignes dépliées) : je retiens la coquille du socle (5 lignes + « + N autres ») ; entrée « Développement » à poser par S0.
- **Écarts de maquette** : h1 « Éditeur d'automatisation » contre menu « Éditeur de flux » ; « 5 connecteurs sur 7 » contre 4 lignes « Local » ; durées d'étapes (113 s) contre « 1 min 48 » (retenu : durée mesurée) ; DEV-modeles-sites en v3 gris et parcours « Créer et produire » ; « Redémarrer » en bouton primaire.
- **Cible « Interne »** inerte (`DISTRIBUTION_INTERNE_OUVERTE = false`) jusqu'à DIST : à ouvrir seulement sur décision de Harun.
- **Données fictives** à commander à SIM (§8 de la note) : dépôts, déploiements et planifiés, journal d'exécutions, tâches planifiées, mesures et services du serveur, coûts des connecteurs.

## Ce qui n'a pas été vérifié

- **Aucune capture** : aucun écran n'est construit (étape 3 au feu vert). Les cotes des fiches sont relevées par analyse des pixels des images (bords des cartes) et à l'œil pour le reste : à ± 2 px, à confirmer à la première capture.
- **Les textes de l'image** sont recopiés à la lecture (pas de `_data/DEV-*.json` dans le dossier v4) ; un texte tronqué dans l'image est signalé (« 3 commit… »).
- **H21 et MO03** : leur écran actuel (sections des Paramètres) est noté « à confirmer » ; LOT-07 les tient.
- **La logique** n'est branchée sur aucun écran ni aucune donnée réelle ; elle est éprouvée sur des cas écrits et sur le jeu fictif `automatisations` seulement.
- La CI GitHub n'a pas tourné sur la branche (pas de PR, consigne).

---

# Étape 3 — construction des écrans (14 nov.)

## Résumé

1. Feu vert du CO (socle v4 fusionné, §1.35). Les **7 écrans** sont construits dans `src/refonte/developpement/`, un commit par écran : DEV-ensemble (`06919b5`), DEV-projets (`798fb91`), DEV-deploiements (`035e7aa`), correctif de noms (`c90e0a3`), DEV-serveur (`ab2925f`), DEV-editeur (`a94b9f1`), DEV-couts (`0e4f86b`), DEV-modeles-sites (`a07807d`).
2. Néon de la famille par `--fam-a` / `--fam-b` de la coquille, jetons du socle seulement (feuille `styles.ts`, contrôlée) ; textes au tutoiement (`i18n.ts`, fr et en) ; « Redémarrer » secondaire et inerte, cible « Interne » inerte ; sur téléphone, les écrans passent en une colonne et n'offrent aucune action lourde.
3. **Deux blocages au CO** : la déclaration des 6 écrans neufs au registre (`check:navigation`, S5) et les signaux de la barre (`check:socle-coquille`, S0). Les fichiers sont prêts, hors du dépôt.
4. Captures sur un banc statique hors dépôt (amn-api n'a pas pu être attaché : permission refusée dans cette session). T1 refait la mesure dans son banc.

## Choix et écarts

- **Source des données** (`donnees.tsx`) : jeux fictifs de SIM pour un compte `@exemple.test` seulement, étiquetés « Données d'exemple » ; « à brancher » pour tout autre compte. Aucune donnée inventée.
- **Feuille du lot en module** (`styles.ts`, injectée une fois) : `check:navigation` assemble le registre avec esbuild et suit les écrans neufs jusqu'à leurs imports, sans charger de CSS.
- **Noms de fichiers** : `PageDeploiements.tsx` (la logique `deploiements.ts` ne différait que par la casse, ce que Windows ne distingue pas) ; `chemins.ts` (une garde de S3 repère tout import `./routes`).
- Les écarts écran par écran sont dans `STATUT.md`, section LOT-11.

## Modification d'une garde hors zone (autorisée par le CO, 14 nov.)

`scripts/check-socle-coquille.ts` (garde de S0), trois changements, pour garder l'intention de la règle :

- la liste des familles qui déclarent des compteurs devient `['cyber', 'developpement', 'jour']` ;
- la règle « aucun fichier `compteurs/developpement.ts` » devient « chaque compteur déclaré par un lot a une source réelle (il lit une donnée, aucun nombre écrit en dur), et le socle comme la coquille n'en déclarent aucun eux-mêmes » ;
- contrôle négatif ajouté : une déclaration aux chiffres écrits en dur, ou qui ne lit aucune donnée, est refusée ; le motif de l'export accepte `useSignaux`, que le contrat de la coquille prévoit déjà.

Le fichier `src/refonte/compteurs/developpement.ts` est posé : signaux `null` tant que la source n'est pas l'exemple prêt, compteur de Projets de code = tests en échec.

## Gardes (lot B, avant le push)

Voir le message au CO : `typecheck` ×2, `lint`, `check:tutoiement`, `check:developpement` et les 74 gardes d'`editions.yml`, plus `build:web` en local. `check:business` non lancé : il exige le paquet client, dont le build est réservé à T1.

## Ce qui n'a pas été vérifié

- Le rendu dans la vraie application (coquille allumée, API d'essai) : pas d'amn-api dans cette session, et les routes `/developpement/*` attendent la décision sur le registre.
- Les gardes navigateur (T1).

## Retours de T1 sur `a86c470` (14 nov.)

Structure acceptée par T1 : 7 routes montées dans la coquille v4, rien de coupé à 390 px, paquet client identique.

- **Aperçus dans le dépôt** (§1.40) : `scripts/apercu/ecrans/DEV-<id>.tsx`, un par écran, plus `DEV-modeles-sites-code` ; commande `npm run apercu -- DEV-<id>`. Jeux de SIM à l'état rempli (`scripts/apercu/developpement.tsx`). Pour cela, chaque écran expose sa vue seule (`EnsembleDev`, `ProjetsDev`, `DeploiementsDev`, `ServeurDev`, `EditeurDev`, `CoutsDev`, `ModelesDev`), le composant par défaut restant l'enveloppe qui lit les données ; rien ne change dans l'application. `scripts/apercu/coquille.tsx` (fichier partagé) gagne la sous-liste Développement, montrée seulement quand cette famille est dépliée : aucun autre aperçu ne change.
- **Écarts justifiés** : `docs/qualite/fidelite/justifies-LOT-11.json`.
- **DEV-modeles-sites** : les 75,6 % de T1 comparent l'état vide de l'application (aucun modèle livré avant la relecture de Harun) à l'image remplie, dessinée en v3 grise avec la barre de « Créer et produire ». L'aperçu montre l'état rempli avec huit pages fictives : 68,5 % brut, 30,6 % en disposition. `DEV-modeles-sites-code.png` est la vue Code d'un modèle ouvert : 79,1 % brut mais 4,8 % en disposition (seul le texte du code diffère). Correctif au passage : la fiche d'un modèle ouvert pose elle-même la feuille du lot (sans cela, ouverte directement, elle s'affichait sans style).
- **Cibles de 34 px** (§1.39) : zone de clic invisible, centrée, d'au moins 34 × 34 px sur les boutons du socle dans les pages du lot, les puces de secteur, les jetons et les noms de poste du hub ; champ de recherche étiré à la hauteur de sa boîte ; la carte néon rogne en `overflow: clip` avec 4 px de marge pour ne pas couper ces zones ; lignes « À regarder » du hub à 35 px pour que deux zones voisines ne se recouvrent pas. Relevé (point au centre ± 16,5 px, hors coquille) sur les 8 aperçus : aucune cible sous 34 px.
- **Suite de T1 (« Relancer », 3 points sur 9)** : une zone de 34 px tout juste laisse dehors une sonde posée pile à ± 17 px du centre (bord exclusif). Les zones invisibles du lot font donc 36 px (34 utiles plus 1 px de chaque côté), lignes « À regarder » du hub à 36 px, et le sélecteur Aperçu / Code (Segmente du socle) prend la même marge dans la fiche d'un modèle. Sonde à 9 points (± 17 px) sur les 8 aperçus : aucun point dehors. Les zones du socle à 34 px exacts (`.sc-segment`, `.sc-interrupteur`, actions de `PageHead`) ont le même bord : signalé au CO pour S0.
- **Suite de T1 à 390 px (« Relancer », 3 points sur 9)** : sur téléphone, le texte d'une tuile de service passe à la ligne, alors que la tuile gardait ses 105 px de haut ; le bouton débordait de sa tuile et, dans la dernière rangée, la carte coupait le bas de sa zone. La tuile grandit désormais avec son contenu sous 700 px. Sonde de T1 (`exigences-ecran.mjs --min 36`) sur chaque écran rendu seul à 390 px : 0 zone sous 36 px sur les 7.

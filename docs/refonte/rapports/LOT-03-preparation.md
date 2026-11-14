# Rapport de fin de session — LOT-03 Écrire et retenir, préparation (S5)

## Résumé (5 lignes au plus)

1. Logique pure du lot dans `src/refonte/ecrire/` (14 fichiers, sans React ni brique du socle) : série d'écriture unique, pages, file de relecture, documents, signatures (dont relances automatiques), modèles, journal privé, rédaction, archives, base de connaissances avec réponse sourcée d'Ajmani, vue d'ensemble.
2. Garde `check:ecrire` : **99 contrôles** (cas des fiches, rejeu sur les jeux fictifs aux 4 volumes, structure), dans `package.json` et `editions.yml`.
3. Textes fr/en au tutoiement (≈ 100 clés) ; ce qui part chez un client reste au vouvoiement. Note de préparation `preparation/LOT-03-ecrire.md` ; section LOT-03 du `STATUT.md` à jour.
4. Dossier v4 lu (fiches, `06`, `tutoiement.json`). **Les images v4 n'ont pas été ouvertes** : la fidélité à ± 2 px reste à vérifier à la construction.
5. Six questions pour le CO (note §6), dont ME04 Archives : aucun module n'existe, il faut une collection.

## Déplacement de modules vers la famille `creer` (STATUT §1.27 n° 1)

Fait sur cette branche, en deux commits distincts de la logique du lot, après LOT-03. Liste exacte : la note de LOT-06 (`claude/refonte-creer` @ `f417bfe`) recoupée avec les 16 tuiles de F50.

| Vue (id) | Avant | Après |
|---|---|---|
| `assembly` + `interventions` (Chantiers, Bons d'intervention) | outils › terrain | creer › **fabriquer** |
| `checklists` (Qualité et contrôles) | outils › terrain | creer › **fabriquer** |
| `orders` (Commandes) | argent › vendre | creer › **livrer** |
| `rounds` + `itineraries` (Tournées) | outils › terrain | creer › **livrer** |
| `stock` + `stockForecast` (Stock) | outils › stock | creer › **stocker** |
| `equipment` + `fleet` (Matériel et flotte) | outils › terrain | creer › **stocker** |
| `shop` (Boutique en ligne) | argent › vendre | creer › **stocker** |

- Les actions `fabriquer`, `livrer`, `stocker` ouvrent la famille (ordre des groupes de F50) ; `terrain` disparaît d'Outils (plus d'entrée). Les entrées regroupées bougent d'un bloc (le registre n'accepte pas de vue en double) : « Matériel et flotte » reste une entrée, rangée dans **stocker** ; la tuile « Flotte de véhicules » de F50 (groupe Livrer) pointe vers sa vue.
- **Restent dans leur famille**, écrans d'un autre lot : `rooms` (Appels et salles, Échanger), `media` (Documents, Écrire), `cashCount`, `ticketing`, `donations` (Argent), `bom` (Outils, seul dans « Stock et achats » en attendant Fabrication).
- **Pas de vue ajoutée** : Catalogue produits, Réservations (`/reservations`), Photos de chantier (`/photos-chantier`) et la vue d'ensemble F50 demandent un écran (`nouveau`), donc le socle v4 ; ils s'ajouteront avec LOT-06. « Fabrication » reste masqué.
- Comptes après le déplacement (entrées / vues) : jour 14 / 20 · contacts 7 / 11 · écrire 11 / 16 · argent 11 / 19 · échanger 15 / 18 · **créer 14 / 21** · outils 14 / 16 · garde 15 / 20. Total inchangé : **101 entrées, 142 vues** ; niveaux 16 / 62 / 23.
- À prévenir par le CO : **LOT-04** (Commandes MR07 et Boutique MR08 quittent Argent), **LOT-07** (Stock, Matériel, Tournées, Flotte, Chantiers et Qualité quittent Outils), **LOT-05** et **LOT-03** (rien ne bouge : Salles et Médias restent). **D02** (S0) : ses comptes par famille changent, ils viennent du registre.
- `check:navigation` : 105 propriétés (une de plus : le rapatriement, sans perte). Gardes `check:systeme-*` et `check:socle-*` vertes.

## Branche et sha

- Branche : `claude/refonte-ecrire`
- Dernier commit : voir le message au CO (le commit de ce rapport)
- Partie de : `claude/refonte-vivante` @ `8333822`, fusionnée avec `37ca20c`

## Fichiers touchés

Sortie de `git diff --name-status origin/claude/refonte-vivante...HEAD` (hors ce rapport) :

```
M	.github/workflows/editions.yml
M	docs/refonte/STATUT.md
A	docs/refonte/preparation/LOT-03-ecrire.md
M	package.json
A	scripts/check-ecrire.ts
D	scripts/zz-audit.mjs
A	src/refonte/ecrire/{archives,commun,connaissances,documents,hub,i18n,journal,modeles,pages,phrases,redaction,relecture,serie,signatures}.ts
```

Fichiers **sensibles** ou **hors zone** touchés, avec la raison :

| Fichier | Changement (ajout seulement ?) | Pourquoi |
|---|---|---|
| `package.json` | ajout du script `check:ecrire` | garde du lot |
| `.github/workflows/editions.yml` | ajout d'une étape après `check:connecteurs` | garde du lot |
| `src/refonte/modules/declarations/{creer,outils,argent}.ts`, `scripts/check-navigation.ts` | déplacement de vues entre familles (aucune vue ajoutée ni retirée) | confié par le CO (§1.27 n° 1) |
| `docs/refonte/STATUT.md` | **section LOT-03 seule** (§ 7) | consigne : écrans en « en cours (préparation) », listes « Manque au socle » et « Manque aux données » |
| `scripts/zz-audit.mjs` | **supprimé** | script de travail laissé par erreur dans un commit de S5 (`25768fa`) ; n'était branché nulle part |

Aucun fichier `*.business.*`, aucun fichier du socle, `src/screens/**`, `src/assistant/**` ni `appRoot.internal.tsx`. Le registre n'est touché que par le déplacement ci-dessus ; les déclarations de LOT-03 (Archives, substitutions) sont préparées dans la note, §4, sans être posées. Aucun fichier partagé n'importe `src/refonte/ecrire/`.

## Gardes

| Garde | Résultat |
|---|---|
| `typecheck` | OK |
| `typecheck:business` | OK |
| `lint` | OK (0 erreur ; aucun avertissement dans les fichiers du lot) |
| `check:accueils` | OK |
| `check:socle` | OK |
| `check:moments` | OK |
| `check:navigation` | OK |
| `check:donnees` | OK |
| `check:ecrire` (nouveau, dans `editions.yml`) | OK, 99 contrôles |
| `check:ancres` (hors `editions.yml`) | **échoue** : `PageDemoSocle.tsx:148` et `Coquille.tsx:29` (code du socle fusionné, `href="#…"`). Rien du lot. |
| `check:contacts`, `check:developpement`, `check:connecteurs`, `check:langue`, `check:modules`, `check:garde-refonte`, `check:ecrans`, `check:barre`, `check:calques` | OK |

## Points à trancher

Détail dans la note, §6 :
- **Série d'écriture** : valider la règle unique (page + journal + rédaction) et les jours de repos.
- **ME04 Archives** : module à créer, collection à décider par Harun.
- **Présence en direct** (curseur d'un collègue) : aucune infrastructure ; acceptable au premier jet sans ?
- **Contrat signé qui arrive à échéance** : « À renouveler » ou « Signé » ?
- **Menu « / »** : la fiche annonce 14 entrées et en liste 13.
- **Dictée vocale** : ouvrir la commande vocale de la barre ⌘J (`src/assistant/**`, interdit à cette session) ?

## Ce qui n'a pas été vérifié

- **Les images v4** : non ouvertes. Les valeurs d'exemple viennent des fiches ; les mesures et le rendu (néon, lueurs, ± 2 px) sont à vérifier à la construction.
- **`check:tutoiement`** : n'existe pas encore dans la base. La garde du lot refuse « vous / votre / vos » et les impératifs en « -ez » dans ses textes, mais elle ne remplace pas la garde commune.
- **Le paquet client** : non comparé octet pour octet (aucun fichier partagé n'importe la zone, ce que `check:navigation` vérifie).
- **Les règles marquées « Proposition » ou « À confirmer dans le code »** (relances, 90 jours de versions, paliers de teinte, 60 jours de renouvellement, syntaxe `{nom}`) sont codées telles quelles et nommées dans le code ; aucune n'a été confirmée par un module réel.

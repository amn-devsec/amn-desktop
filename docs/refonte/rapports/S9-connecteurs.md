# Rapport de fin de session — S9 (LOT-12 Connecteurs et autonomie)

## Résumé

1. Modèle des connecteurs livré dans `src/refonte/connecteurs/` : 14 catégories du §4, version locale toujours présente, prises « service » ou « chez nous », état, coût affiché avant, plafond, 3 clics au plus.
2. Aucun tarif écrit : tous « à relever » ; sans relevé (source https + date), pas d'activation.
3. Règles de H21 (S6) et de DEV-couts, DEV-editeur (S8) prêtes à lire ; format des flux Quand / Si / Alors relié à `useAutomations`.
4. Moteurs locaux : courriels, relances, rappels, tri, rapports, sauvegardes, planificateur (heure de Paris) ; liste « Demandé à amn-api » avec un repli local par point.
5. Branches Sinon et Puis rangées dans le moteur H20 existant (`automatisations.ts`), sans perte dans les deux sens (décision du CO, 12 nov.).
6. Décisions du CO (§1.22) appliquées : prise Webhooks, « Demander un connecteur », prise arrêtée, valeurs de départ modifiables ; section LOT-12 au §7 de `STATUT.md`.
7. Garde `check:connecteurs` (100 contrôles), ajoutée à `package.json` et `editions.yml` ; note `docs/refonte/preparation/LOT-12-connecteurs.md`.

## Branche et sha

- Branche : `claude/refonte-connecteurs`
- Dernier commit : voir le message au CO
- Partie de : `claude/refonte-vivante` @ `50a58c4` ; suite après fusion : `212dfbb`

## Fichiers touchés

```
M	.github/workflows/editions.yml
A	docs/refonte/preparation/LOT-12-connecteurs.md
A	docs/refonte/rapports/S9-connecteurs.md
M	package.json
A	scripts/check-connecteurs.ts
A	src/refonte/connecteurs/** (24 fichiers)
```

| Fichier | Changement (ajout seulement ?) | Pourquoi |
|---|---|---|
| `package.json` | ajout d'une ligne (`check:connecteurs`) | garde du lot |
| `.github/workflows/editions.yml` | ajout d'une étape après `check:donnees` | garde du lot dans la CI |
| `docs/refonte/STATUT.md` | ajout de la section LOT-12 au §7, rien d'autre | demandé par le CO (§1.22, n° 5) |

Aucun fichier `*.business.*`, aucun écran ; `REGLES.md` non touché ; dans `STATUT.md`, seule la section LOT-12 du §7.

## Gardes

| Garde | Résultat |
|---|---|
| `typecheck` | vert |
| `typecheck:business` | vert |
| `lint` | vert |
| `check:donnees` | vert (87) |
| `check:connecteurs` | vert (100) ; mordant vérifié par 8 mutations volontaires (tarif non relevé, validation humaine, tutoiement client, déclencheur réel gardé à tort, SINON perdu, identifiant historique changé, prise arrêtée mal dessinée, réglage ignoré), toutes détectées |
| `check:accueils` | vert |
| `check:socle` | vert |
| `check:moments` | vert |

## Points à trancher

- Les 5 questions sont tranchées par le CO (§1.22) et appliquées.
- Reste, hors S9 : la couture du moteur de H20 (S6, LOT-07) et le relevé des tarifs au moment de construire H21.
- **14 nov., S6, accord du CO (§1.34 n° 7)** : le modèle porte en plus `devise` (euros par défaut), `plafondParTransactionCents` (affiché, jamais calculé) et `parUtilisateur`, tous facultatifs ; `siToutEnApi` et `economise` rendent `null` dès qu'une référence n'est pas en euros ou est publiée par personne ; rien ne change pour un tarif en euros ; `check:connecteurs` passe à 102 contrôles (détail : `rapports/S6-outils.md`).

## Ce qui n'a pas été vérifié

- Aucun écran construit (mode préparation) : pas de capture, pas de `build:web`.
- `check:business` (paquet client) non lancé : la zone n'est importée par aucun fichier hors de `src/refonte/`, ce que `check:connecteurs` vérifie.
- Rien côté amn-api (hors de ce dépôt).

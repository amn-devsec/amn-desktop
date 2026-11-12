# Rapport de fin de session — S9 (LOT-12 Connecteurs et autonomie)

## Résumé

1. Modèle des connecteurs livré dans `src/refonte/connecteurs/` : 14 catégories du §4, version locale toujours présente, prises « service » ou « chez nous », état, coût affiché avant, plafond, 3 clics au plus.
2. Aucun tarif écrit : tous « à relever » ; sans relevé (source https + date), pas d'activation.
3. Règles de H21 (S6) et de DEV-couts, DEV-editeur (S8) prêtes à lire ; format des flux Quand / Si / Alors relié à `useAutomations`.
4. Moteurs locaux : courriels, relances, rappels, tri, rapports, sauvegardes, planificateur (heure de Paris) ; liste « Demandé à amn-api » avec un repli local par point.
5. Branches Sinon et Puis rangées dans le moteur H20 existant (`automatisations.ts`), sans perte dans les deux sens (décision du CO, 12 nov.).
6. Garde `check:connecteurs` (93 contrôles), ajoutée à `package.json` et `editions.yml` ; note `docs/refonte/preparation/LOT-12-connecteurs.md`.

## Branche et sha

- Branche : `claude/refonte-connecteurs`
- Dernier commit : voir le message au CO
- Partie de : `claude/refonte-vivante` @ `50a58c4`

## Fichiers touchés

```
M	.github/workflows/editions.yml
A	docs/refonte/preparation/LOT-12-connecteurs.md
A	docs/refonte/rapports/S9-connecteurs.md
M	package.json
A	scripts/check-connecteurs.ts
A	src/refonte/connecteurs/** (22 fichiers)
```

| Fichier | Changement (ajout seulement ?) | Pourquoi |
|---|---|---|
| `package.json` | ajout d'une ligne (`check:connecteurs`) | garde du lot |
| `.github/workflows/editions.yml` | ajout d'une étape après `check:donnees` | garde du lot dans la CI |

Aucun fichier `*.business.*`, aucun écran, ni `STATUT.md` ni `REGLES.md`.

## Gardes

| Garde | Résultat |
|---|---|
| `typecheck` | vert |
| `typecheck:business` | vert |
| `lint` | vert |
| `check:donnees` | vert (87) |
| `check:connecteurs` | vert (93) ; mordant vérifié par 6 mutations volontaires (tarif non relevé, validation humaine, tutoiement client, déclencheur réel gardé à tort, SINON perdu, identifiant historique changé), toutes détectées |
| `check:accueils` | vert |
| `check:socle` | vert |
| `check:moments` | vert |

## Points à trancher

- Notion et Webhooks (prises d'exemple de H21) sans catégorie au §4 : proposition dans la note, §9.
- Dessin d'une prise « arrêtée » dans H21 (S6).
- Valeurs par défaut (plages d'envoi, délais, rotation, seuils) à valider par Harun.
- Couture `@edition/*` ou déplacement de `automatisations.ts` pour que S6 étende `useAutomations` (partagé avec l'édition cliente).
- Section LOT-12 dans `STATUT.md` § 7 : au CO de dire s'il en faut une.
- Les tarifs sont à relever au moment de construire H21 (procédure : note, §8).

## Ce qui n'a pas été vérifié

- Aucun écran construit (mode préparation) : pas de capture, pas de `build:web`.
- `check:business` (paquet client) non lancé : la zone n'est importée par aucun fichier hors de `src/refonte/`, ce que `check:connecteurs` vérifie.
- Rien côté amn-api (hors de ce dépôt).

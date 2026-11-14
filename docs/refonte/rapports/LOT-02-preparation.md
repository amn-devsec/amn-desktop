# Rapport de fin de session — LOT-02 préparation (S1)

> Session S1, mode préparation, 14 nov. 2026. Modèle : `rapports/MODELE.md`.

## Résumé (5 lignes au plus)

1. Logique pure de LOT-02 dans `src/refonte/contacts/` (9 fichiers) : pipeline (H06, MC01), relances (MC07), fidélité (MC02), rendez-vous (MC06), « Contacts par client » (H41). `check:contacts` : 85 contrôles.
2. **Dossier v4 lu** (fiches du lot, `06`, `tutoiement.json`, image MC07) : la règle de relance est celle de la fiche, en huit points testés ; trois de mes suppositions sont corrigées (messagerie ≠ courriel ; une relance par client et par **semaine** ; paliers de fidélité 800 / 1 800).
3. Décisions du CO du §1.28 appliquées (réouverture d'un perdu, deux formules de fidélité, MC03 « non disponible », pas de raccourci).
4. **Deux écarts à trancher** : la fiche dit 5 jours et 9:00–18:00, le CO a adopté 7 jours et 08:00–19:00 ; et deux jeux de SIM (fidélité, statut des clients) ne suivent pas la fiche.
5. Aucun écran, aucun import de `src/socle/ui`, rien côté édition cliente.

## Branche et sha

- Branche : `claude/refonte-contacts`
- Dernier commit : voir le message de fin de session (le sha est celui du push)
- Partie de : `claude/refonte-vivante` @ `8333822`

## Fichiers touchés

```
M	.github/workflows/editions.yml
M	docs/refonte/STATUT.md
A	docs/refonte/preparation/LOT-02-contacts.md
A	docs/refonte/rapports/LOT-02-preparation.md
M	package.json
A	scripts/check-contacts.ts
A	src/refonte/contacts/commun.ts
A	src/refonte/contacts/fidelite.ts
A	src/refonte/contacts/i18n.ts
A	src/refonte/contacts/index.ts
A	src/refonte/contacts/interet.ts
A	src/refonte/contacts/interlocuteurs.ts
A	src/refonte/contacts/pipeline.ts
A	src/refonte/contacts/relances.ts
A	src/refonte/contacts/rendezvous.ts
```

Fichiers **sensibles** ou **hors zone** touchés :

| Fichier | Changement (ajout seulement ?) | Pourquoi |
|---|---|---|
| `package.json` | oui, une ligne : `check:contacts` | garde du lot |
| `.github/workflows/editions.yml` | oui, une étape après `check:developpement` | garde du lot |
| `docs/refonte/STATUT.md` | seulement la section LOT-02 du §7 (états des 13 écrans, deux listes) | demandé par le prompt |

Lecture seule dans d'autres zones : `src/refonte/connecteurs/` (S9) est **importé** pour deux constantes (`DELAI_ENTRE_RELANCES_JOURS`, `PLAGE_CLIENTS`), afin que l'espacement et la plage d'envoi n'aient qu'une source. Rien n'y est modifié.

## Gardes

| Garde | Résultat |
|---|---|
| `typecheck` | OK |
| `typecheck:business` | OK |
| `lint` | OK (0 erreur) |
| `check:accueils` | OK |
| `check:socle` | OK |
| `check:moments` | OK |
| `check:navigation` | OK |
| `check:donnees` | OK |
| `check:contacts` (dans `editions.yml`) | OK, 85 contrôles |
| `check:tutoiement` | n'existe pas dans la base (arrive avec la passe finale v4 de S0) |

## Points à trancher (CO, Harun)

1. **Valeurs de relance : fiche ≠ CO.** Fiche et image : **5 jours** entre deux relances, plage **9:00–18:00**. CO (§1.22) : **7 jours**, **08:00–19:00**. Le code lit celles du CO ; 5 jours est un réglage permis (3 à 14). Pour suivre la fiche, changer `VALEURS_DE_DEPART` chez S9.
2. **§1.28 point 4 à corriger** : « un message par client et par jour » n'est plus la règle ; la fiche dit **une relance par client et par semaine glissante**. Le plafond de 3 est confirmé.
3. **SIM** : jeu « fidélité » (paliers 500 / 1 500 → 800 / 1 800, avis et recommandations) et jeu « clients » (statut affiché : « Impayé » dès 7 jours, « Nouveau »). Les autres manques sont dans `STATUT.md`, section LOT-02.
4. **Échelles de l'intérêt (H06)** : la fiche donne les poids et la fraîcheur, pas l'échelle des trois autres signaux. `ECHELLES` est un choix de la session, à valider par Harun.
5. **Un identifiant de messagerie (G07)** manque au modèle des interlocuteurs : `moyenDeJoindre` rend l'adresse faute de mieux.
6. Restent les décisions déjà prises par le CO et en attente de Harun : collection d'interlocuteurs (MC03).

## Ce qui n'a pas été vérifié

- Les images des 12 autres écrans : non comparées (aucun écran construit). `MC07-relances.png` a été vue pour contrôler les textes et les réglages d'envoi.
- `_data/tutoiement.json` reste hors du dépôt : l'alignement des textes est fait à la main, la CI ne peut pas le contrôler. `check:tutoiement` n'existe pas encore dans la base.
- Les règles des fiches H05, H44, H45, MC04, MC05 et F10 ne sont pas portées en logique (hors des quatre sujets) ; elles sont listées dans la note, §7.
- Aucun écran, donc aucune capture ni comparaison à ± 2 px ; l'application n'a pas été lancée.

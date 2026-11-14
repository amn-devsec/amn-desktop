# Rapport de fin de session — LOT-02 préparation (S1)

> Session S1, mode préparation, 14 nov. 2026. Modèle : `rapports/MODELE.md`.

## Résumé (5 lignes au plus)

1. La logique pure de LOT-02 est livrée dans `src/refonte/contacts/` : pipeline, relances (règle d'espacement), fidélité, rendez-vous, et la source « Contacts par client » de H41.
2. `check:contacts` : 63 contrôles, sur des cas écrits à la main et sur les jeux de SIM aux quatre volumes. Branché dans `package.json` et `editions.yml`.
3. La note `docs/refonte/preparation/LOT-02-contacts.md` décrit les 13 écrans (module existant, données, ce qui manque) et la section LOT-02 du §7 de `STATUT.md` est à jour.
4. **Limite importante : les 5 zips du dossier v4 n'étaient pas dans l'environnement.** Les 13 fiches, leurs images, `06-V4-NEON-ET-TUTOIEMENT.md` et `_data/tutoiement.json` n'ont pas été lus. Les règles qui en dépendent sont marquées « à confirmer ».
5. Aucun écran, aucun composant React, aucun import de `src/socle/ui`, rien côté édition cliente.

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
| `check:contacts` (nouveau, dans `editions.yml`) | OK, 63 contrôles |
| `check:tutoiement` | n'existe pas dans la base (arrive avec la passe finale v4 de S0) |

## Points à trancher (CO, Harun)

1. **Fiches non lues.** Poser les zips du dossier v4 (ou les 13 fiches) à un endroit lisible, puis relancer S1 pour : relire les règles « à confirmer », aligner `i18n.ts` sur `_data/tutoiement.json`, comparer aux images.
2. **Fidélité : deux mécaniques.** L'écran actuel `/fidelite` est une carte à tampons ; MC02 et le jeu de SIM parlent de points et de niveaux. Les garder, les remplacer ou proposer les deux ?
3. **Relances : un moteur ou deux.** La logique livrée traite les cinq motifs de MC07 ; l'escalade des factures (paliers) reste dans `src/lib/relances.ts` et chez S9. Recommandé : un seul moteur à la construction.
4. **Collection d'interlocuteurs.** Absente côté app ; indispensable à MC03 et à « Contacts par client » (H41). Schéma et migration à planifier.
5. **Deux valeurs venues de moi, pas d'une fiche** : 3 relances au plus par objet, un message par client et par jour. À confirmer avec MC07 (l'espacement de 7 jours et la plage lun.–ven. 08:00–19:00 viennent du CO, §1.22).
6. **MC04 Équipe et MC05 Partenaires** : le premier recoupe le trombinoscope, le second n'a ni écran ni jeu. Jeu d'organisations partenaires à commander à SIM ?
7. **Socle** : `ModuleTile`, `ModuleGroupGrid`, `AddModuleTile` ne sont pas dans la liste des composants disponibles (F10 en dépend).

## Ce qui n'a pas été vérifié

- Le contenu des 13 fiches et des images v4 : non lu (zips absents).
- Tous les textes de `i18n.ts` face à `_data/tutoiement.json` : non comparés.
- Aucun écran, donc aucune capture, aucune comparaison à ± 2 px.
- `build:web` et l'application : non lancés, inutile en préparation.
- Le comportement des écrans actuels (`RemindersScreen`, `LoyaltyScreen`…) : lu dans le code, jamais exécuté.

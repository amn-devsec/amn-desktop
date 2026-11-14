# Rapport · LOT-01 Ma journée — préparation (S2)

Branche `claude/refonte-journee`, partie de `claude/refonte-vivante` @ `fc94d38`. Note du lot : [`preparation/LOT-01-ma-journee.md`](../preparation/LOT-01-ma-journee.md).

## Résumé

1. **Mode préparation** : les 5 zips v4 n'étaient pas sur la machine. Les 16 fiches, `04-ECARTS-MAQUETTES.md`, `06-V4`, `_data/tutoiement.json` et les images n'ont pas été lus. **Aucun écran n'est construit** (0 sur 16).
2. **La logique pure du lot** est dans `src/refonte/journee/` (19 fichiers, sans React ni horloge) : la série (clôture des priorités), les paliers et jalons, H04, G08 et H25 calculés, les projets, les défis d'équipe, les habitudes, les rappels, le planning, le kanban, et les phrases qui en découlent (tutoiement, fr et en).
3. **H04, G08 et H25 égalent les valeurs attendues de SIM**, aux quatre volumes et sur quatre graines de plus. Vérifié par mutation : la garde rougit quand une règle est cassée.
4. **Les éléments ludiques protégés sont des propriétés du code** testées : aucun chiffre individuel, aucun classement, aucun point perdu, aucun reproche (L07, L01, trophées, défis).
5. **`check:journee`** (62 contrôles, ajouté à `editions.yml`) et toutes les gardes demandées sont vertes.

## Fichiers touchés

```
M	.github/workflows/editions.yml          (+ étape check:journee)
M	package.json                            (+ script check:journee)
M	scripts/check-tutoiement.ts             (+ 'src/refonte/journee' au PERIMETRE, comme le fichier le prévoit)
A	scripts/check-journee.ts
A	docs/refonte/preparation/LOT-01-ma-journee.md
A	docs/refonte/rapports/LOT-01-preparation.md
A	src/refonte/journee/{bilan,cockpit,commun,defis,habitudes,i18n,index,jalons,kanban,phrases,planning,projets,rappels,serie,tableauDeBord}.ts
```

Fichiers sensibles : `package.json`, `editions.yml` et `check-tutoiement.ts` : **ajouts seulement**. Rien dans `src/screens/**`, `src/assistant/**`, `*.business.*`, `src/socle/**`. L'édition cliente ne change pas.

## Gardes

`typecheck`, `typecheck:business`, `lint`, `check:accueils`, `check:socle`, `check:moments`, `check:navigation`, `check:donnees`, `check:tutoiement` et `check:journee` : **verts**. Toutes les gardes sans réseau d’`editions.yml` relancées : **vertes**.

## Décisions demandées au CO (détail : note §5)

1. **Trois définitions de « série »** coexistent (routines dans `calculerAujourdhui`, tâches chez SIM, priorités selon L01). Le lot implémente la règle du CO (priorités). `calculerAujourdhui` (fichier de S0) devrait la lire ; SIM devrait aligner ses attendus H04 et H25.
2. ~~Jeux sans priorités du jour~~ : livrés par SIM (d8ba0fc) ; branche fusionnée ici, `check:journee` éprouve la série sur `dailyPriorities`.
3. **Engagements écrits de L07** : aucune donnée ni collection. À présenter à Harun (demande à amn-api).
4. **Un moment `defi.tenu`** pour les célébrations (nouveau type : passe par le CO).
5. **G08** : agrégats serveur, aucune clé sur le poste (demande à amn-api).
6. **Écrans sans origine** (G08, H03, MJ05) : routes à lire sur les fiches.

## Lignes de STATUT proposées (section LOT-01, §7)

La modification de `STATUT.md` a été **refusée par le contrôle d'autorisation de la session** : je ne l'ai pas contournée. Le CO peut les coller :

| ID | État | Note |
|---|---|---|
| N01 | en cours (préparation) | lit `useAujourdhui` ; la série passe à `serieDeLaJournee` (note §5 n° 1) |
| H25 | en cours (préparation) | `tableauDeBord` égale `attendusTableauDeBord` ; format de la grille à lire sur la fiche |
| G08 | en cours (préparation) | `cockpitDuClient` égale `attendusCockpit` ; agrégats seulement, aucune clé ; route à lire sur la fiche |
| H02 | en cours (préparation) | paliers et série ; **trophées protégés** |
| H03 | en cours (préparation) | `trierLaColonne`, `deplacer` ; aucun écran d'origine |
| H04 | en cours (préparation) | `bilanDeLaSemaine` égale `attendusBilanSemaine` ; **trophées et paliers protégés** |
| MJ01 | en cours (préparation) | `projetCalcule` égale SIM |
| MJ03 | en cours (préparation) | `chevauchements`, `personnesDuCreneau` |
| MJ02 | en cours (préparation) | `serieDHabitude`, `tauxDeTenue` (propositions) |
| MJ05 | en cours (préparation) | `etatDuRappel` ; aucun écran d'origine |
| L01 | en cours (préparation) | `serieDeLaJournee`, paliers 5/10/20/30/50/100, jalons ; **protégé** ; priorités absentes des jeux |
| L07 | en cours (préparation) | défis, jauge, frise, célébrations, engagements, proposition ; **protégé** ; engagements sans donnée |
| H01 | en cours (préparation) | `calendrier.ts` : rendez-vous du jour, placement, semaine, mois ; **à confirmer sur la fiche** |
| MJ04 | en cours (préparation) | `notes.ts` : visibilité, tri, recherche, « sans place » ; **à confirmer** |
| L02 | en cours (préparation) | `focus.ts` : règles du Pomodoro existant (15/25/50, pauses 5 et 15 min) ; **à confirmer** |
| L03 | en cours (préparation) | `rituel.ts` : étapes, reprise, une proposition le matin ; **à confirmer** |

**Manque aux données** : liste des personnes d'une note « personnes choisies » (MJ04, visible de son auteur seulement en attendant) ; `objectifDuMois` et `utilisateursConnectes` de `attendusCockpit` (encore à `null` chez SIM) — le reste (priorités, engagements, connexions, Boîte à zéro, objectif MRR) est livré.

## Ce qui n'a pas été vérifié

- **Rien n'a été vu à l'écran** : aucun écran n'existe encore.
- **Les règles marquées « à confirmer »** (repos de la série, jour sans priorité, paliers de H04 et de L01, jalons de L01, états d'un défi de type « Taux de tenue ») s'appuient sur STATUT et sur les propositions reprises par SIM, pas sur les fiches.
- **MJ02, MJ03, MJ05 et H03** sont des propositions tirées du modèle de données de SIM.
- **`check:business`, `check:isolation` et les gardes navigateur** n'ont pas tourné (rien de partagé n'a été touché ; la logique n'est importée par aucun fichier partagé).

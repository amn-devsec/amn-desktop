# Rapport de fin de session — LOT-05 Échanger, préparation (S5)

## Résumé (5 lignes au plus)

1. Logique pure du lot dans `src/refonte/echanger/` (14 fichiers, sans React ni brique du socle) : boîte des clients (couloirs, Boîte à zéro, série de soirs), vue d'ensemble, canaux d'équipe, appels et salles, annonces, courriel, réunions, partage de fichiers, sondages, réponses automatiques, état des canaux lu sur la baie de S9.
2. Garde `check:echanger` : **88 contrôles** (cas des fiches, rejeu sur les jeux fictifs aux 4 volumes, structure), dans `package.json` et `editions.yml`.
3. G07 = boîte des CLIENTS ; WhatsApp, SMS, courriel et téléphonie sont des prises de la baie (`connecteurs.ts` : « connecteur à brancher », « à reconnecter »). Sans ligne pro, H13 = appel dans l'application seulement. Ce qui part chez un client reste au vouvoiement (la logique le vérifie).
4. Note `preparation/LOT-05-echanger.md` ; section LOT-05 du `STATUT.md` à jour. Dossier v4 lu ; **les images v4 n'ont pas été ouvertes**.
5. Quatre écrans sans module existant (MX01, MX03, MX06, et la boîte des clients de G07) ; six questions pour le CO (note §6), dont le renommage de l'entrée « Messagerie » du registre.

## Branche et sha

- Branche : `claude/refonte-echanger`
- Dernier commit : voir le message au CO (le commit de ce rapport)
- Partie de : `claude/refonte-vivante` @ `892c436`, fusionnée avec la tête suivante

## Fichiers touchés

```
M	.github/workflows/editions.yml
M	docs/refonte/STATUT.md
A	docs/refonte/preparation/LOT-05-echanger.md
A	docs/refonte/rapports/LOT-05-preparation.md
M	package.json
A	scripts/check-echanger.ts
A	src/refonte/echanger/{annonces,appels,boite,canaux,commun,connecteurs,courriel,hub,i18n,partages,phrases,reponsesAuto,reunions,sondages}.ts
```

Fichiers **sensibles** ou **hors zone** touchés, avec la raison :

| Fichier | Changement (ajout seulement ?) | Pourquoi |
|---|---|---|
| `package.json` | ajout du script `check:echanger` | garde du lot |
| `.github/workflows/editions.yml` | ajout d'une étape après `check:connecteurs` | garde du lot |
| `docs/refonte/STATUT.md` | **section LOT-05 seule** (§ 7) | consigne : écrans en « en cours (préparation) », listes « Manque au socle » et « Manque aux données » |

Aucun fichier `*.business.*`, aucun fichier du socle, `src/screens/**`, `src/assistant/**`, `src/refonte/modules/` ni `appRoot.internal.tsx`. Le registre n'est pas touché ici (déclarations préparées dans la note, §4). Le lot importe seulement le **modèle des connecteurs de S9** (`baie.ts`, `types.ts`), jamais un fichier partagé. Le déplacement de modules vers `creer` (§1.27 n° 1) est sur la branche `claude/refonte-ecrire`, pas ici.

## Gardes

| Garde | Résultat |
|---|---|
| `typecheck` | OK |
| `typecheck:business` | OK |
| `lint` | OK |
| `check:accueils`, `check:socle`, `check:moments`, `check:navigation`, `check:donnees` | OK |
| `check:echanger` (nouveau, dans `editions.yml`) | OK, 88 contrôles |
| `check:contacts`, `check:developpement`, `check:connecteurs`, `check:langue`, `check:modules` | OK |

## Points à trancher

Détail dans la note, §6 :
- **Registre** : l'entrée « Messagerie » (`dm` + `groups` + `team`, essentielle) est la messagerie d'équipe ; G07 lui prend son nom pour les clients. La renommer « Canaux » quand G07 est ajouté ?
- **MX01, MX03, MX06** : de nouveaux modules ; feu vert pour les ajouter au registre avec leur écran et présenter leurs collections à Harun.
- **Heures ouvrées** : horaires de l'organisation (lun.–ven. 9–18 par défaut) ; existe-t-il un réglage ?
- **Présence en temps réel** : aucune infrastructure ; masquée au premier jet ?
- **« Messages programmés »** : nom proposé par la fiche pour la dixième tuile.
- **Tutoiement de MX04** : la fiche dit « vouvoient » (reste de la v3) ; la v4 tutoie.

## Ce qui n'a pas été vérifié

- **Les images v4** : non ouvertes ; mesures et rendu (néon, lueurs, ± 2 px) à vérifier à la construction.
- **`check:tutoiement`** : absent de la base ; la garde du lot refuse « vous / votre / vos » et les impératifs en « -ez » dans ses textes, sans remplacer la garde commune.
- **Les règles marquées « Proposition » ou « À confirmer dans le code »** (promesse de 2 h ouvrées, fin de journée à 19 h, relances, seuils de préparation, 10 messages pour proposer une règle, etc.) sont codées telles quelles et nommées dans le code ; aucune n'a été confirmée par un module réel.
- **Le rejeu sur les jeux** adapte les conversations de clients du jeu en messages entrants (le jeu n'a ni canal ni état de tri) : il prouve que la logique tient aux quatre volumes, pas que les écrans afficheront les bons chiffres.

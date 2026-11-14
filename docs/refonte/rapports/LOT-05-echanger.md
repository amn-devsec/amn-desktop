# LOT-05 · Échanger — rapport de construction

Session S5 · branche `claude/refonte-echanger` · 14 nov. 2026. Prépare la note [`LOT-05-preparation.md`](LOT-05-preparation.md) ; l'état de chaque écran est au §7 de `docs/refonte/STATUT.md`.

## Ce qui est livré

Les 10 écrans, un commit chacun, dans `src/refonte/echanger/ecrans/<id>/` (`Vue*` présentationnelle, `composer.ts` pur, `Page*` branchée sur le poste, `i18n.ts`, feuille de style en jetons du socle seulement) :

| Écran | Route | Aperçu | Écart brut |
|---|---|---|---|
| F40 Vue d'ensemble | `/ensemble/echanger` | `npm run apercu -- F40` | 16,6 % |
| G07 Messagerie (boîte des clients) | `/messagerie` (écran neuf) | `npm run apercu -- G07` | 18,0 % |
| H13 Appels et salles | `/appels` | `npm run apercu -- H13` | 22,9 % |
| H14 Annonces | `/annonces` | `npm run apercu -- H14` | 31,6 % |
| MX01 Courriel | `/courriel` (écran neuf) | `npm run apercu -- MX01` | 20,1 % |
| MX02 Réunions | `/reunions` | `npm run apercu -- MX02` | 17,0 % |
| MX03 Partage de fichiers | `/partages` (écran neuf) | `npm run apercu -- MX03` | 24,3 % |
| MX04 Canaux | `/groupes` | `npm run apercu -- MX04` | 20,6 % |
| MX05 Sondages | `/sondages` | `npm run apercu -- MX05` | 15,6 % |
| MX06 Réponses automatiques | `/reponses-automatiques` (écran neuf) | `npm run apercu -- MX06` | 20,5 % |

Mesures brutes de S5 (aperçu 1440 × 900 contre l'image v4), à refaire par T1. Chaque écart au-dessus de 15 % est justifié zone par zone dans [`docs/qualite/fidelite/justifies-LOT-05.json`](../../qualite/fidelite/justifies-LOT-05.json).

Décisions du CO tenues : « Messagerie » (G07, clients) et « Canaux » (équipe) essentiels tous les deux, donc 17 essentiels (garde du rail relevée) ; heures ouvrées lues dans `connecteurs/reglages.ts`, rien de recopié ; présence masquée ; tutoiement dans l'interface, vouvoiement pour ce qui part chez un client (zones client nommées dans `check:tutoiement`) ; cibles de clic à 36 px (§1.41).

## Ce que le poste ne sait pas (rien n'est inventé)

Aucune nouvelle collection synchronisée (§1.27 n° 4). Les pages branchées ne montrent que ce que le poste sait ; la vue complète est celle de l'aperçu :

- **Sans source, « à brancher »** : G07, MX01, MX03, MX06 (messagerie, WhatsApp, SMS, stockage : prises de H21). Aucun faux chiffre : les tuiles de F40 disent « à brancher », jamais « 0 ».
- **H13** : repli sans ligne pro (combiné micro et raccrocher, journal, invitation d'un visiteur par lien) ; pas de plan des salles, de Standard, de pavé ni de résumé.
- **H14** : « À la une » sans bordure ambre, accusés nominatifs, lecture ; pas de catégories, réactions, épingle ni rappel.
- **MX02** : prochaine, à venir, décisions et actions de la dernière réunion passée ; pas de réunion « en cours », de notes en direct ni de préparation en %.
- **MX04** : groupes et leurs messages, création d'un canal ; pas de non lus, de réactions par icônes, de fils ni de carte « Urgent ».
- **MX05** : barres, participation sans nom, voter, clore, créer ; pas de « Votes en direct » (aucune heure de vote).

## Écarts avec les écrans d'origine

- **Suppression d'un sondage (MX05) et dissolution d'un canal (MX04)** : absentes de la fiche v4. Décision du CO (provisoire, révisable par Harun) : elles restent dans l'écran d'origine, que « Tous les sondages » et « Parcourir les canaux » ouvrent (`useOutlet`), avec leur confirmation. Aucune fonction perdue.
- **Fiches contre images** : (1) la règle d'attente orange est de 2 h OUVRÉES : « 2 h 11 » (message de 08:31) n'est pas orange, 1 h 42 ouvrée ; (2) la mosaïque de H14 suit la règle de la fiche, que l'image ne suit pas ; (3) MX03 trie les liens par expiration, l'image garde l'ordre de saisie ; (4) la suggestion de rappel de H14 est visible toute la journée sur l'image, la Proposition de la fiche dit 2 h avant (réglable, `rappelAvantMs`).

## Logique ajoutée

`GesteDeTri.depuisLe` et `Fil.attendDepuis` (G07, « depuis 2 j »), `segmentsDeLecture` et `confirmations[].at` facultatif, `rappelAProposer(…, avantMs)` (H14). `check:echanger` : 105 contrôles.

## Gardes

`typecheck` ×2, `lint` (0 erreur), `check:echanger`, `check:tutoiement`, `check:navigation`, `check:substitutions`, `check:clavier`, toutes les `check:*` d'`editions.yml` vertes ; `check:ancres` et `check:encres` sont rouges sur la base, hors de ce lot. Le correctif ME05 (LOT-03) est sur `claude/refonte-ecrire` @ `2da78ad5`.

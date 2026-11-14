# Rapport de fin de session — LOT-02 « Mes contacts et clients » (S1)

> Session S1, construction, 14 nov. 2026. Prépare la suite de `rapports/LOT-02-preparation.md`.

## Résumé

1. **Les 13 écrans sont construits** et branchés : F10, H05, G04, H06, H44, H45, MC01 à MC07. Chacun est un composant neuf dans `src/refonte/contacts/<dossier>/` (modèle pur testé, mots, vue, feuille de style aux jetons du socle, page branchée, aperçu), un commit par écran.
2. **Fidélité** (capture 1440 × 900 contre l'image v4, couleur ± 10) : de 5,8 % à 13,5 % en disposition, tous sous la barre de 15 %. Détail dans `STATUT.md` §7.
3. **Honnêteté des données** : toute donnée absente de l'application (achats, mouvements, signaux, réponses des clients, interlocuteurs, partenaires, tâches, trajets, lien de réservation) donne un état « non disponible » avec sa raison, jamais un zéro. Les valeurs fabriquées n'existent que dans les scripts d'aperçu.
4. **MC07** : la règle d'espacement (huit points de la fiche) est demandée avant l'affichage et avant chaque envoi ; rien ne part sans clic. Mais l'application n'envoie rien depuis cette couche : le bouton dit « Copier et suivante ».
5. `check:contacts` : 235 contrôles. Aucun fichier de `src/screens/**` ni de l'édition cliente touché.

## Branche et sha

- Branche : `claude/refonte-contacts`
- Dernier commit : voir le message envoyé au CO (le sha est celui du push)
- Écrans : F10 `8c8cfde5` · H05 `8a3ca88a` · G04 `45e574cf` · H06 `010e5a15` · H44 `64b5e767` · H45 `059e89b0` · MC01 `82d23d61` · MC02 `797d031a` · MC03 `b22796cf` · MC04 `ebbc8be4` · MC05 `2cbc757a` · MC06 `9c652c10` · MC07 `ed629328`

## Fichiers touchés hors `src/refonte/contacts/` et `scripts/apercu/`

| Fichier | Changement | Pourquoi |
|---|---|---|
| `src/refonte/substitutions/declarations/contacts.tsx` | ajouts | les 8 substitutions (`/ensemble/contacts`, `/clients`, `/pipeline`, `/avis`, `/fournisseurs`, `/trombinoscope`, `/relances`) |
| `src/refonte/modules/declarations/contacts.ts` | ajouts | 5 écrans neufs au registre : Pipeline commercial, Niveaux de fidélité, Fiches contacts, Partenaires, Rendez-vous clients |
| `src/edition/navLexique.internal.ts` | ajouts | l'anglais des 5 écrans neufs (exigé par `check:navigation`) |
| `scripts/check-navigation.ts` | une ligne | chargeur CSS vide : les écrans neufs importent leur feuille de style |
| `scripts/check-contacts.ts`, `package.json`, `editions.yml` | ajouts | la garde du lot |
| `docs/refonte/STATUT.md` | ma section LOT-02 du §7 seulement | demandé |

## Gardes (avant le dernier push)

`typecheck`, `typecheck:business`, `lint` (0 erreur), `check:tutoiement`, `check:voix`, `check:contacts`, `check:substitutions`, `check:navigation`, `check:socle`, `check:moments`, `check:donnees`, `check:connecteurs`, `check:systeme-modules`, `check:systeme-recherche`, `check:modules`, `check:ecrans`, `check:accueils`, `check:client-statique`, `check:calques`, `check:accent`, `check:garde-refonte`, `check:creer`, `check:argent`, `check:echanger`, `check:ecrire`, `check:developpement` : toutes vertes.

## Ce que le CO doit décider

1. **Où ranger ce que le poste retient** : aujourd'hui `localStorage` (`amn.refonte.contacts.*` : suggestions masquées, appels, objectif du mois, gestes de fidélité, renégociations, renouvellements, gestes et jours « boîte à zéro » des relances). À passer en stockage par organisation.
2. **Les sources qui manquent** (les écrans disent « non disponible » tant qu'elles n'existent pas) : historique d'achats fournisseurs (H45), mouvements d'étape et signaux d'intérêt (H06, MC01), réponses aux avis, thèmes et collecte (H44), collection d'interlocuteurs (MC03, décision de Harun), partenaires (MC05), tâches (MC04), durées de trajet (MC06, service d'itinéraire LOT-12), lien de réservation (MC06), réponses des clients aux relances (MC07).
3. **L'envoi des relances** : brancher un service d'envoi (courriel ou messagerie G07) pour que « Copier et suivante » devienne « Envoyer et suivante » et que « Tout envoyer » apparaisse ; aujourd'hui seul l'écran d'origine envoie les relances de facture. La rédaction par Ajmani (ton) est remplacée par un texte préparé d'après les données.
4. **Création préremplie** d'un client, d'un devis ou d'une facture depuis ces écrans, et `state.nouveau` de `ClientsScreen` : non faits sans toucher des fichiers partagés.
5. **Formule de fidélité par organisation** (carte à tampons ou niveaux, §1.28) : pas encore de réglage pour choisir.
6. **Réglages d'envoi des relances** (5 jours, 9:00–18:00) : valeurs lues de `connecteurs/reglages.ts`, pas encore d'écran pour les modifier ; « Modifier » mène à `/settings`.
7. **Anglais des écrans neufs** : fait dans `navLexique.internal.ts` (fichier partagé, ajouts seulement) ; à relire.

## Ce qui n'a pas été vérifié

- L'application n'a pas été lancée (règle : jamais `npm start`) : les pages branchées sont vérifiées par typecheck, lint, gardes et aperçus sur les jeux fictifs de SIM, pas dans la coquille réelle.
- Les états chargement, erreur et hors ligne sont codés, testés au niveau du modèle, mais non capturés.
- Les écarts de fidélité restants (barre latérale de l'aperçu, polices, ombres) sont du ressort de la coquille et du socle.

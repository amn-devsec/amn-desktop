# Les 20 tâches courantes, en nombre d'actions — première mesure (14 nov.)

> `node scripts/qualite/taches-courantes.mjs --dist <build-interne>` (T1). Build de vivante `c377b63`, coquille v4 allumée, bac à sable.
> **Première mesure, partielle** : chaque tâche a un ou deux chemins déclarés (barre latérale, ⌘K puis clic sur la ligne), joués dans le navigateur ; l'arrivée est vérifiée par un mot à l'écran. Les chemins qui échouent sont à reprendre à la main (libellé du bouton, famille dépliée) : ils ne disent pas « impossible ».

Règle de comptage : un clic, une touche ou un raccourci = 1 ; ⌘K et ⌘J = 1 ; saisir un mot dans la palette = 1 ; on compte jusqu'à l'arrivée sur l'écran, plus le clic qui ouvre le geste (« Nouvelle tâche »…) quand il existe. Remplir et envoyer sont « pour finir », à part. Cible : ≤ 3.

| # | Tâche | Actions | Résultat | Chemin | Pour finir (indicatif) |
|---|---|---:|---|---|---:|
| 1 | voir sa journée | 0 | ✓ ≤ 3 | déjà sur l’Accueil → `#/` | 0 |
| 2 | cocher une tâche | 1 | ✓ ≤ 3 (écran atteint, bouton du geste non trouvé) | barre :  Tâches et priorités → `#/tasks` | 0 |
| 3 | créer une tâche | 2 | ✓ ≤ 3 | barre :  Tâches et priorités → `#/tasks` | 2 |
| 4 | ajouter un rendez-vous | 2 | ✓ ≤ 3 | barre :  Calendrier et RDV → `#/agenda` | 3 |
| 5 | créer un client | 3 | ✓ ≤ 3 | barre :  Mes contacts et clients  puis  Clients → `#/clients` | 3 |
| 6 | écrire à un client | 1 | ✓ ≤ 3 | barre :  Messagerie → `#/messages-prives` | 2 |
| 7 | créer et envoyer un devis | — | ✗ non mesuré | chemin — locator.click: Timeout 4000ms exceeded. → `` | 4 |
| 8 | créer une facture | — | ✗ non mesuré | chemin — locator.click: Timeout 4000ms exceeded. → `` | 4 |
| 9 | relancer un impayé | 1 | ✓ ≤ 3 | barre :  Relancer ou mettre en demeure → `#/facturation` | 1 |
| 10 | noter une dépense | 4 | △ 4 | ⌘K · « dépense » · clic  Dépenses → `#/depenses` | 3 |
| 11 | ajouter une note | 3 | ✓ ≤ 3 | barre :  Écrire et retenir  puis  Notes → `#/notes` | 2 |
| 12 | déposer un document | 3 | ✓ ≤ 3 (écran atteint, bouton du geste non trouvé) | ⌘K · « document » · clic  Classeur → `#/classeur` | 2 |
| 13 | chercher n’importe quoi | 1 | ✓ ≤ 3 | ⌘K → `#/` | 0 |
| 14 | demander à Ajmani | 1 | ✓ ≤ 3 | ⌘J → `#/` | 1 |
| 15 | ouvrir une alerte de La Garde | — | ✗ non mesuré | chemin — locator.click: Timeout 4000ms exceeded. → `` | 1 |
| 16 | prendre en charge un incident | — | ✗ non mesuré | chemin — locator.click: Timeout 4000ms exceeded. → `` | 2 |
| 17 | lancer une ronde | 3 | ✓ ≤ 3 | ⌘K · « ronde » · clic  Organigramme → `#/garde/organigramme` | 1 |
| 18 | lancer une sauvegarde | — | ✗ non mesuré | ⌘K · « sauvegarde » · clic  Import . export → `#/outils/donnees` | 1 |
| 19 | voir les déploiements | — | ✗ non mesuré | barre :  Développement → `#/` | 0 |
| 20 | reprendre où l’on s’était arrêté | — | ✗ non mesuré | chemin — locator.click: Timeout 4000ms exceeded. → `` | 0 |

## Ce que la mesure montre

- **Le ⌘K ne sait pas créer.** La palette liste des modules, des fiches, des tâches et « Demander à Ajmani » ; son groupe « Actions » ne contient que cette dernière ligne. Aucune « Nouvelle tâche », « Nouveau client », « Nouvelle facture » : « créer » passe toujours par le module (⌘K + mot + clic = 3, puis le bouton = 4).
- **Entrée n'ouvre pas le premier module qui correspond** : la ligne sélectionnée par défaut est « Demander à Ajmani : « … » », devant les modules. Taper « client » puis Entrée lance Ajmani, pas Clients.
- La barre latérale est souvent plus courte que le ⌘K : Messagerie, Tâches, Calendrier sont épinglés (1 clic) ; une famille se déplie en 2 clics.
- **Développement** : l'entrée de la barre ne mène pas aux déploiements (« voir les déploiements » : non atteint). LOT-11 n'a monté que sa vue d'ensemble.
- « Lancer une sauvegarde » arrive sur Import / export, qui ne dit pas « sauvegarde » : à vérifier, la fonction est peut-être ailleurs.

## À reprendre pour finir la mesure

Tâches 7 et 8 (devis, facture : famille L'argent à déplier, libellé exact du bouton de création), 15 et 16 (La Garde / Cyber : chemin de la barre), 20 (reprendre : où se trouve « Reprendre ? »), 2 (case à cocher de `/tasks` : sélecteur), 12 (bouton « Déposer »).

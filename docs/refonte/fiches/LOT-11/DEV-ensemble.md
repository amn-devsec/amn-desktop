# DEV-ensemble · Développement, vue d'ensemble
Développement · LOT-11 · Image : **aucune** (proposition de S8 sur le modèle des hubs F10 à F70, **validée par Harun le 12 nov.**) · Statut : NOUVEAU
Parcours : Développement / Vue d'ensemble

> **Validée par Harun telle que proposée** (12 nov.). Aucune maquette n'existe (`STATUT.md` §1.14, point 3) : les cotes ci-dessous reprennent celles des hubs existants (F50 pour la grille des modules, F60 pour les instruments) et font foi à la place d'une image ; la capture se compare à cette fiche. Règles communes : [`00-COMMUN.md`](00-COMMUN.md).

## 1. Rôle
Page d'accueil de l'espace Développement, vue comme **la chaîne de mise en ligne** : le code (dépôts et tests), les déploiements, ce qui est en ligne, le serveur qui le porte, chacun en un poste. On voit où ça coince, les trois choses à regarder aujourd'hui, ce qui tourne seul et ce que ça coûte, puis on ouvre l'un des **12 modules** de l'espace, tous visibles. On ne travaille pas ici : chaque élément ouvre son écran.

## 2. Nouveau ou re-habillage ?
- **Tout est nouveau** : la page n'existe pas. Elle suit la règle des hubs v3 (une surface propre à la famille + les modules rangés en groupes avec la tuile partagée `ModuleTile`).
- **Nouveau** : `ChaineMiseEnLigne` (4 postes reliés : Code, Déploiements, En ligne, Serveur), « À regarder aujourd'hui » (même liste que DEV-projets, élargie aux déploiements et au serveur), « Ce qui tourne seul » (flux et coûts), la grille des 12 modules en 4 groupes.
- **Existant, à brancher** : DEV-projets, DEV-deploiements, DEV-serveur, DEV-editeur, DEV-couts, DEV-modeles-sites (ce lot) ; H20, H21, H24 (LOT-07), H03 (LOT-01), ME05 (LOT-03), MO03 (LOT-07) pour les mesures de leurs tuiles.
- **Dépend du socle** : la route `/ensemble/developpement` n'est pas dans la liste fermée des **sept hubs** du socle v4 (`src/refonte/substitutions/hubs.ts`, `HUBS`) : il faut un huitième hub (`DEV-ensemble`, famille `developpement`, lot `developpement`) : **accepté par le CO** (`STATUT.md` §1.17 n° 2), ajouté par S0. La famille `developpement` du registre des modules (`src/refonte/modules/declarations/developpement.ts`) est aussi à créer (fichier propre au lot).

## 3. Disposition par zones
Coordonnées relatives à la zone principale. **Propositions**, calées sur F50 et F60.
- **Z1 En-tête** : h1 « Développement » (30 px / 700, dégradé `#FFF → b`), sous-titre ; secondaire « Personnaliser » puis **primaire** « Déployer » (icône fusée).
- **Z2 Chaîne de mise en ligne** : carte **1108 × 236** à (40, 94). En-tête de 46 px (titre 15 px / 600, sous-titre 12.5 px T4). **4 postes** en colonnes égales de 262 px (x = 57 / 328 / 599 / 870), reliés par un **tapis** de 4 px en dégradé `a → b` qui passe sous des nœuds ronds de 32 px (y = 152) avec un pointillé qui avance (`FlowLine`, seule animation continue de la page avec le curseur Ajmani). Sous chaque nœud : nom du poste 13 px / 600, grand chiffre 28 px / 700 en dégradé `#FFF → a`, libellé 12 px T4, puis **2 jetons** au plus de **246 × 34** (point d'état, texte 12.5 px, âge monospace à droite), écart 6. Pied (filet, 38 px) : fait de la semaine à gauche, `SuggestionCompact` à droite.
- **Z3 Rangée du milieu** (y = 344, hauteur 142, écart 14) : « À regarder aujourd'hui » **547 × 142** à (40, 344) — 3 lignes de 32 px (point, nom monospace 600, texte T3, « Ouvrir » 28 px) ; « Ce qui tourne seul » **547 × 142** à (601, 344) — 2 colonnes : à gauche « 9 flux sur 12 » avec anneau de 56 px et « n exécutions aujourd'hui », à droite « 82 % fait seul » et la barre payé / plafond (« 14 € sur 40 € »).
- **Z4 Les 12 modules** : carte **1108 × 258** à (40, 500), comme F50 : en-tête (titre, sous-titre, lien « Tous les modules »), 4 colonnes de 261 px (x = 57 / 328 / 599 / 870), libellé de groupe puis `ModuleTile` de **261 × 41** (variante `standard`, icône 26), écart 5, première à y = 566.
- **Z5 Barre Ajmani** : standard, texte contextuel.
- **Barre latérale** : famille Développement dépliée, module actif « Vue d'ensemble ».

## 4. Contenu affiché (textes proposés, au tutoiement ; valeurs = celles des images `DEV-*`, pour la cohérence)
**En-tête** : « Développement » · « 6 dépôts suivis · 1 test à regarder · le serveur va bien » · « Personnaliser » · « Déployer ».

**Chaîne de mise en ligne** : « Chaîne de mise en ligne » · « du code au serveur, poste par poste ».
| Poste | Chiffre | Libellé | Jetons (2 au plus) |
|---|---|---|---|
| Code | 6 | dépôts suivis | « optique-avenue · 1 test en échec » (attention) ; « 47 commits cette semaine » |
| Déploiements | 9 | cette semaine | « amn-desktop vers Préproduction · réussi » ; « 2 planifiés · jeu. 12, 18:00 » |
| En ligne | 4 | cibles en ligne | « amndevsec.fr · 3 h » ; « Serveur AMN · hier » |
| Serveur | 6 sur 6 | services en marche | « disque 24 % · tranquille pour 2 ans » ; « dernière copie 03:00, réussie » |
Pied : « Cette semaine : 8 déploiements réussis sur 9 » · suggestion « L'aperçu d'Optique Avenue a échoué ce matin. Je te montre la ligne ? » · « Voir le journal ».

**À regarder aujourd'hui** : « À regarder aujourd'hui » · « 3 points » · « optique-avenue · 1 test en échec depuis ce matin » · « amn-desktop · 4 tickets ouverts, dont 1 bloquant » · « amn-site · le certificat expire dans 18 jours » · « Ouvrir ».

**Ce qui tourne seul** : « Ce qui tourne seul » · « 9 flux sur 12 » · « 38 exécutions ce mois » · « 82 % fait seul » · « 14 € sur 40 € ce mois ».

**Les 12 modules** : « Les 12 modules » · « du code à la mise en ligne » · « Tous les modules ».
| Construire | Mettre en ligne | Automatiser | Payer et protéger |
|---|---|---|---|
| Projets de code · « 1 test en échec » (attention) | Déploiements · « 2 planifiés » | Éditeur de flux · « 9 sur 12 actifs » | Coûts et API · « 14 € sur 40 € » |
| Modèles de sites · « 8 modèles » | Serveur et santé · « 6 sur 6 » (succès) | Automatisations · « 25 aujourd'hui » | Coffre-fort · « 2 à renouveler » (attention) |
| Missions et tickets · « 4 ouverts » | Sauvegardes · « réussie » (succès) | Connecteurs · « 1 à rebrancher » (attention) | |
| Base de connaissances · « 12 articles » | | | |

**Barre Ajmani** : « Demande à Ajmani : « Qu'est-ce qui part en ligne cette semaine ? » ».

## 5. Composants du socle utilisés
`Sidebar`, `Header`, `PageHead`, `Card`, `ModuleTile` (partagé F10 à F70, ici 41 px) et `ModuleGroupGrid` (4 groupes), `IconTile`, `CountBadge`, `StatusPill`, `Anneau`, `BarreProgression`, `LiveDot`, `FlowLine`, `SuggestionCompact` (voir CY01), `AjmaniBar`.
**Nouveaux composants** (lot) :
- `ChaineMiseEnLigne` : 4 postes sur un tapis, nœuds, grands chiffres, jetons, pied.
- `ListeARegarder` : partagée avec DEV-projets (même brique, même requête).
- `CarteToutSeul` : flux actifs + part locale + payé / plafond.

## 6. Données et règles de calcul
Aucune donnée propre : tout vient des écrans du lot et des modules réutilisés, **par les mêmes requêtes** (les chiffres de la page et ceux des écrans ne peuvent pas diverger).
- **Code** : dépôts suivis (DEV-projets) ; jetons = premier dépôt en échec, puis commits de la semaine.
- **Déploiements** : lancés cette semaine (DEV-deploiements) ; jetons = dernier déploiement (cible, état), puis planifiés (nombre, le plus proche).
- **En ligne** : cibles avec une version en ligne ; jetons = les deux plus récentes.
- **Serveur** : services en marche / déclarés (DEV-serveur) ; jetons = la mesure la plus haute avec sa projection, puis la dernière copie (MO03). Serveur non branché : poste en pointillé « à brancher » (LOT-13).
- **Nœud d'un poste** : succès si rien n'y est en échec, attention s'il y a un point à regarder, danger si un échec n'est pas repris (*Proposition*).
- **Fait de la semaine** : déploiements réussis / lancés depuis lundi.
- **À regarder aujourd'hui** : la liste de DEV-projets, élargie aux déploiements échoués non repris et aux services en attention ; 3 au plus, par gravité.
- **Ce qui tourne seul** : flux actifs / flux non brouillons et exécutions du mois (DEV-editeur, H20) ; part locale et payé / plafond (DEV-couts).
- **Tuiles** : mesure lue dans chaque module ; un module que le métier n'utilise pas est masqué (la colonne se resserre) ; un groupe vide disparaît.

## 7. Interactions
- Clic sur un poste : ouvre son écran (Code → DEV-projets, Déploiements → DEV-deploiements, En ligne → DEV-deploiements filtré « En ligne maintenant », Serveur → DEV-serveur). Clic sur un jeton : ouvre l'élément.
- « Ouvrir » (À regarder) : l'élément concerné.
- « Ce qui tourne seul » : clic à gauche → DEV-editeur (liste des flux) ; à droite → DEV-couts.
- Tuiles : Projets de code → DEV-projets · Modèles de sites → DEV-modeles-sites · Missions et tickets → H03 · Base de connaissances → ME05 · Déploiements → DEV-deploiements · Serveur et santé → DEV-serveur · Sauvegardes → MO03 · Éditeur de flux → DEV-editeur · Automatisations → H20 · Connecteurs → H21 · Coûts et API → DEV-couts · Coffre-fort → H24. « Tous les modules » → D02 filtré sur Développement.
- **« Déployer »** : le dialogue de DEV-deploiements, sans quitter la page. **« Personnaliser »** : réordonner ou masquer les postes et les groupes.
- **Mouvement** : entrée échelonnée des cartes, nœuds tracés, pointillé du tapis qui avance (continu), barres remplies. `prefers-reduced-motion` coupe tout ; la page reste lisible à l'arrêt.

## 8. États
- **Espace qui démarre** (aucun dépôt, aucun déploiement) : la chaîne affiche ses 4 postes en pointillé avec une invitation par poste (« Importe un dépôt », « Ton premier déploiement », « Rien en ligne encore », « Branche le serveur ») ; les tuiles restent.
- **Tout va bien** : « À regarder aujourd'hui » dit « Rien à regarder aujourd'hui. » ; la suggestion devient une astuce ou disparaît.
- **Connecteurs ou serveur absents** (cas actuel : LOT-12 et LOT-13) : postes concernés « à brancher », avec le lien vers H21 ; les autres postes fonctionnent.
- **Métier réduit** : tuiles et groupes inutiles masqués, sans trou.
- **Chargement** : squelettes de même gabarit. **Erreur** : bandeau « L'espace Développement n'a pas pu être chargé. » + « Réessayer ». **Hors ligne** : dernières valeurs.
- **Droits** : sans droit de développement, lecture seule, sans « Déployer ».

## 9. Éléments ludiques
- « Cette semaine : 8 déploiements réussis sur 9 », « 9 flux sur 12 », « 82 % fait seul » : faits encourageants.
- Ce qu'on ne fait pas : pas de score par personne, pas de classement, pas de célébration.

## 10. Ajmani
- `SuggestionCompact` dans le pied de la chaîne : la suggestion la plus utile de l'espace (échec de déploiement d'abord, puis disque, puis forfait), une seule à la fois.
- Barre ⌘J : « Qu'est-ce qui part en ligne cette semaine ? » ; autres invites : « Déploie amn-site en production », « Le serveur va bien ? », « Combien m'a coûté ce mois ? ».

## 11. Adaptation (fenêtre réduite, mobile)
- Sous 1280 px : la chaîne passe en 2 × 2 postes ; la rangée du milieu s'empile ; tuiles en 2 colonnes de groupes.
- Sous 900 px : un poste par rangée.
- Mobile (LOT-09) : **lecture seule** (décision de Harun, 12 nov.) : la chaîne en liste et « À regarder aujourd'hui » ; pas de « Déployer » sur le téléphone.

## 12. Critères de réussite
- [x] Validée par Harun (12 nov.), telle que proposée.
- [ ] Les chiffres sont ceux des écrans du lot, par les mêmes requêtes.
- [ ] Les 12 modules visibles, chacun ouvre le bon écran ; « Tous les modules » ouvre D02.
- [ ] Route `/ensemble/developpement` déclarée par la substitution du lot, une fois le huitième hub ajouté au socle.
- [ ] Une seule animation continue (tapis), plus le curseur Ajmani.
- [ ] `typecheck`, `lint`, `check:socle`, `check:navigation`, `check:developpement` verts.

## 13. Pièges
- Ne pas recopier DEV-deploiements : la chaîne montre un état par poste, pas l'historique.
- Les sous-modules réutilisés (H20, H21, H24, H03, ME05, MO03) gardent leur famille d'origine dans le registre : ici, ils n'ont qu'une **seconde entrée** (tuile et ligne de barre latérale).
- La route du hub est dans la liste fermée du socle : ne pas la déclarer avant qu'S0 l'ajoute.
- Valeurs d'exemple fictives : rien en dur.

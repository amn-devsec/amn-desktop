# LOT-06 · Créer et produire — note de préparation

> Branche `claude/refonte-creer`. Rédigée le 6 nov. 2026, **mise à jour pour la v4 le 14 nov. (voir §0)**, en mode PRÉPARATION (socle v4 pas encore fusionné : aucun écran visuel n’est construit).
> Sources : le zip v3 du lot (15 fiches, `04-ECARTS-MAQUETTES.md`), les modules du dépôt (relevé du 6 nov.), les jeux fictifs de SIM (`src/refonte/donnees/`).
> Rien dans ce document ne décrit une faiblesse de sécurité ; aucune donnée réelle.

## 0. Mise à jour v4 (14 nov. 2026) — néon, tutoiement, socle v4

> Sources : `PROMPTS-12NOV.md` §5, `STATUT.md` §1.14 à §1.25, le rapport `LOT-00.md` de `claude/refonte-socle` @ `888f7a0` et, **lus le 14 nov.**, `06-V4-NEON-ET-TUTOIEMENT.md`, `_data/tutoiement.json`, `_data/couleurs-familles.json`, les images v4 des 15 écrans (F50, MR04 vues en entier ; les 13 autres vérifiées par leurs `_data` et leurs fiches, identiques au v3) et `sources-neon/`. Les 15 fiches et les 15 `_data/*.json` du dossier v4 sont **identiques octet pour octet** à ceux du v3 : dispositions, cotes et textes de référence inchangés ; seuls changent l'habillage et le tutoiement (via `tutoiement.json`). Plus aucun point « à vérifier » ne reste dans cette note.

**Néon de la famille Créer.** Les écrans ne nomment jamais une couleur : ils lisent `--fam-a` / `--fam-b`, que la coquille pose selon la famille active (`Coquille`, prop de famille). Le lot n'écrit aucune teinte de famille à la main. Les couleurs d'état v4 (succès `#5EE6A8`, info `#6EA8FF`, attention `#FFBE5C`, danger `#FF6B7A`) viennent du socle. Dans la logique, les « tons » restent des mots (`vert`, `orange`, `rouge`, `bleu`, `ambre`) à traduire en jeton par l'écran ; rien à changer. **Paire de la famille Créer** (`couleurs-familles.json`, `06` §1) : `--fam-a` = `#FFA463` (orange), `--fam-b` = `#FF6B7A` (corail). Lecture des tons de la logique, confirmée par `sources-neon/MR04-materiel.html` (« À vérifier » en `#FFBE5C`) : `vert` = succès `#5EE6A8`, `bleu` = info `#6EA8FF`, `orange` et `ambre` = attention `#FFBE5C`, `rouge` = danger `#FF6B7A`. L'orange de famille (`--fam-a`) ne sert pas d'état (piège de H16 inchangé). Les 15 règles de rendu du §3 de `06` s'appliquent à la construction ; aucune ne touche la logique.

**Tutoiement.** Fait pour tous les textes calculés (`i18n.ts`) : 14 libellés passés au « tu » (« Ajoute ton logo », « Corrige la quantité ou fais un inventaire »). `check:creer` refuse désormais tout « vous / votre / vos » et tout impératif en « -ez » dans le français. **Vouvoiement gardé** pour les textes destinés aux clients : page publique du visiteur et avis affichés (MR02), message « Prévenir les clients » (MR03, `momentDePrevenir`), documents de commande. Ces textes n'existent pas encore dans `i18n.ts` ; ils seront écrits au vouvoiement, à part, à la construction. Les textes statiques des écrans suivront `_data/tutoiement.json` (lu, voir ci-dessous) et le guide de voix du socle (`src/socle/mots/voix.ts` de `claude/refonte-socle` : phrases courtes, aucun reproche, aucun point d'exclamation).

**`tutoiement.json`, lu : ce qui touche LOT-06** (14 entrées sur 353, plus « vous → toi » en général) :
- Texte calculé : « Aaron (vous) » → « Aaron (toi) » (talon de MR04) : clé `materiel.talon.toi`, ajoutée et testée.
- Textes statiques à reprendre tels quels à la construction : « Demandez à Ajmani » → « Demande à Ajmani » (F50) ; « Non activée pour votre métier » → « …ton métier » (F50, déjà dans `i18n.ts`) ; « Rien n'est publié sans votre accord » → « …ton accord » (MR02) ; « Votre vitrine sur internet · vous modifiez les avis clients… » → « Ta vitrine sur internet · tu modifies… » (MR02) ; « Vos produits et services… » → « Tes produits et services… » (MR05) ; « cliquez pour copier » → « clique pour copier » (H17) ; « cliquez sur une étape pour filtrer la liste » → « clique sur… » (MR07).
- Suggestions d'Ajmani (écrites par l'écran, pas par la logique) : H15 « Une seule commande t'évite 38 € de port » ; MR05 « …tu valides avant l'envoi » ; MR07 « …te fais gagner 40 minutes » ; MR08 « …tu le relis avant l'envoi ».
- H17 : « chaque visuel vous ressemble » → « chaque visuel **nous** ressemble » (le livre de marque parle au nom de l'entreprise, pas à la personne).
- Les `_data/*.json` des écrans restent au vouvoiement : la table `tutoiement.json` fait foi, pas les `_data`.
- Les apostrophes de la table sont droites (« t'évite ») ; `check:langue` impose la courbe : question 8 inchangée.
- Vouvoiement **gardé** : page publique visiteur et avis (MR02), message « Prévenir les clients » (MR03), documents de commande (MR07).

**Barre latérale et registre (image v4 de F50 et de MR04).** La sous-liste de la famille « Créer et produire » montre « Vue d'ensemble, Visuels et marque, Stock, Chantiers, + 13 autres » (« + 12 autres » quand Matériel est ouvert) : **17 entrées = la vue d'ensemble + les 16 modules**. Les 16 modules sont donc rangés sous la famille Créer dans la barre latérale v4 ; cela répond à la question 1 du 6 nov. dans le sens du rapatriement (reste à S5/S0 d'écrire les déclarations ; les familles `outils`, `argent`, `echanger`, `ecrire` perdent ces entrées).

**Briques du socle v4 (jamais construites par le lot).** `ModuleTile` (41 px, ligne 34 px), `ModuleGroupGrid`, `AddModuleTile`, `PageHead`, `IconTile`, `CountBadge`, `StatusPill`, `AvatarStack`, `Progress`, `Ring`, `Segmented`, `Chips`, `SuggestionCompact`, `Suggestion`, `FlagUrgent`, `Kbd`, `Check`, `SearchBox`, `IconButton`, `Empty` (= `EtatVide`), `Sparkline`, `AjmaniBar`, plus la coquille. Restent **au lot** les composants « propres à cet écran » de la rubrique 5 de chaque fiche (`LevelTube`, `SitePlan`, `ProductionLine`, `WorkToken`, `RouteMap`…). Le lot n'importe rien de `src/socle/ui` tant que STATUT ne dit pas « socle v4 fusionné ».

**Mécanisme de substitution (S0).** Un écran refondu est un composant de `src/refonte/creer/`, déclaré par `declarerSubstitutions('creer', [{ route, module, composant }])` dans `src/refonte/substitutions/declarations/creer.tsx` (ramassé seul ; `.tsx` seulement ; la clé `module` doit être celle de la garde `ModuleRoute` de la route d'origine, sinon `check:substitutions` échoue ; jouée coquille allumée par défaut). `appRoot.internal.tsx` et `src/screens/**` ne bougent pas. Ce mécanisme n'est pas encore dans `refonte-vivante` : je ne l'ai donc pas utilisé.

**DEV-modeles-sites (LOT-11).** Peut avoir une **seconde entrée dans Créer et produire**, par la sous-liste « Développement » de la barre latérale et **sans doublon dans le registre** (STATUT §1.17 n° 3, §1.19 n° 1). Le lot Créer ne déclare rien pour elle : aucune vue, aucun champ « aussi dans ». Le seul lien utile est F50 : si le CO le souhaite, une tuile « Modèles de sites » du groupe MONTRER pourrait pointer vers la vue de LOT-11 (non construit, non décidé).

### Décisions du CO (STATUT §1.27, 14 nov.) appliquées à cette note

- **Familles.** Les modules dont l'écran est un écran de LOT-06 reviennent dans `creer`, avec les actions `fabriquer`, `livrer`, `stocker` (comme la barre latérale v4). **Liste exacte du déplacement (à faire par S5, propriétaire du registre) :**

| Vue du registre | Route | Famille actuelle | Action dans `creer` | Écran |
|---|---|---|---|---|
| `assembly` (Chantiers) | `/montage` | outils | `fabriquer` | H16 |
| `interventions` (« Bons d'intervention », libellé de la fiche, gardé) | `/interventions` | outils | `fabriquer` | tuile de F50 |
| `checklists` (Qualité et contrôles) | `/controles` | outils | `fabriquer` | MR11 |
| `orders` (Commandes) | `/commandes` | argent | `livrer` | MR07 |
| `rounds` (Tournées) | `/tournees` | outils | `livrer` | MR03 |
| `fleet` (Flotte) | `/flotte` | outils | `livrer` | MR09 |
| `reservations` (**nouvelle vue**) | `/reservations` | — | `livrer` | MR06 |
| `stock` | `/stock` | outils | `stocker` | H15 |
| `equipment` (Matériel) | `/materiel` | outils | `stocker` | MR04 |
| `catalogue` (**nouvelle vue**, sur `stockItems`) | `/catalogue` | — | `stocker` | MR05 |
| `shop` (Boutique en ligne) | `/boutique` | argent | `stocker` | MR08 |
| `photosChantier` (**nouvelle vue**) | `/photos-chantier` | — | `fabriquer` | MR10 |

  Restent dans `creer` tels quels : `video`, `videoProductions`, `brand`, `adVisuals`, `minisite`, `portfolio`. **Gardent leur famille** (écran d'un autre lot ; F50 les affiche par une tuile de lien, sans doublon) : `rooms` (Salles, `echanger`) et `media` (Médiathèque, `ecrire`). « Fabrication » est **masqué** tant qu'il n'existe pas : F50 n'affiche pas sa tuile (le groupe FABRIQUER compte 3 tuiles). La tuile « **Modèles de sites** » de F50 renvoie vers DEV-modeles-sites (LOT-11), sans entrée au registre.
- **MR05 sur `stockItems`**, sans collection `products`. Ce que `StockItemData` n'a pas (prix, photos, TVA, prix d'achat, niveau conseillé, fournisseur) s'affiche « non disponible » avec la raison ; la collection `products` est une **demande à amn-api**, présentée à Harun par le CO. La logique de `catalogue.ts` lit déjà ces champs comme facultatifs.
- **Aucune collection synchronisée nouvelle** (Q4) : H16, MR02, MR04, MR10, MR11 se construisent sur l'existant ; les champs absents (budget, sections, énergie, écarts, phases multi-photos…) sont « non disponibles » avec une demande à amn-api (liste « Manque aux données » du STATUT).
- **MR03** : plan schématique, sans service ni clé (Q5). **Vidéo** : les deux sources (`videoEdits`, `videoProductions`) sont gardées et reliées (Q6). **Formats** : importer `src/socle/formats.ts` après la fusion du socle v4 et supprimer la copie de `commun.ts` (Q7). **Apostrophes courbes** (Q8). **Publier** distinct d'écrire, défini par H19 ; d'ici là seul le dirigeant publie et les autres passent par « Demander la publication » (Q9). **Aucun nouveau stockage de fichiers** (Q10). Q11 et Q12 : SIM.

### Déclarations préparées (à poser quand le socle v4 est fusionné ; rien n'est écrit dans `declarations/creer.ts` ni ailleurs)

**A. Substitutions** (`src/refonte/substitutions/declarations/creer.tsx`) — l'écran refondu remplace l'écran d'origine à la même route :

| Écran | Route | Clé `module` (vue du registre) | Composant à créer |
|---|---|---|---|
| H15 Stock | `/stock` | `stock` | `StockRefonte` |
| H16 Chantiers | `/montage` | `assembly` | `ChantiersRefonte` (les bons d'intervention `/interventions`, vue `interventions`, gardent leur écran) |
| H17 Visuels et marque | `/identite-visuelle` | `brand` | `VisuelsMarqueRefonte` (`/visuels-pub` : `adVisuals`, inchangé) |
| MR01 Vidéo | `/montage-video` | `video` | `VideoRefonte` (`/productions-video` : `videoProductions`, à fusionner : question 6) |
| MR02 Ma page publique | `/mini-page` | `minisite` | `PagePubliqueRefonte` (`/portfolio` : `portfolio`, inchangé) |
| MR03 Tournées | `/tournees` | `rounds` | `TourneesRefonte` |
| MR04 Matériel | `/materiel` | `equipment` | `MaterielRefonte` |
| MR07 Commandes | `/commandes` | `orders` | `CommandesRefonte` |
| MR08 Boutique en ligne | `/boutique` | `shop` | `BoutiqueRefonte` |
| MR09 Flotte de véhicules | `/flotte` | `fleet` | `FlotteRefonte` |
| MR11 Qualité et contrôles | `/controles` | `checklists` | `QualiteRefonte` |

Les clés `module` viennent de `declarations/*.ts` (vérifiées le 14 nov.) ; `check:substitutions` les comparera aux gardes `ModuleRoute` : à revalider à la pose.

**B. Écrans sur route nouvelle ou nouvelle entrée** (registre, `declarations/creer.ts`, avec `nouveau: { icone, ecran, indice }` ; routes ajoutées dans `appRoot.internal.tsx` seulement, §1.27 c) :

| Écran | Vue (`id`) | Route | Action | Niveau |
|---|---|---|---|---|
| F50 Vue d'ensemble | `creerEnsemble` | `/ensemble/creer` (route générique, remplacée par F50) | — (hub) | essentiel |
| MR05 Catalogue produits | `catalogue` | `/catalogue` | `stocker` | courant |
| MR06 Réservations | `reservations` | **`/reservations`** | `livrer` | courant |
| MR10 Photos de chantier | `photosChantier` | **`/photos-chantier`** | `fabriquer` (ou `visuels`, au choix de S5) | courant |

Verbes et mots-clés proposés (fr/en) : Catalogue → « ajouter un produit », « mettre à jour un prix » ; mots-clés `catalogue`, `produit`, `prix`, `référence`, `fiche produit`. Les actions de `creer.ts` (`video`, `visuels`, `publier`, `evenements`) ne couvrent pas Stock, Chantiers, Commandes… : si ces modules sont rapatriés dans la famille (Q1), prévoir les actions `fabriquer`, `livrer`, `stocker`.

## 1. En bref

- **Logique pure livrée** : `src/refonte/creer/` (17 fichiers, sans React ni brique visuelle) et `scripts/check-creer.ts` (`npm run check:creer`, **137 contrôles**, ajouté à `editions.yml`). Les cas sont écrits à la main d'après les règles des fiches (rubrique 6), puis rejoués sur les jeux fictifs aux volumes `vide`, `peu`, `normal`, `beaucoup`.
- **Aucun des 15 écrans n'est « re-habillage pur »** : le dépôt n'a, pour la plupart, que des modules plus simples que ce que demandent les fiches v3. Les fiches parlent de « modules existants » (stock, chantiers, tournées…) dont les données réelles sont minces (voir §3). La logique est donc écrite contre des **formes d'entrée minimales** ; les jeux fictifs de SIM, plus riches, servent de référence de test. L'écran branché sur les données réelles fera la traduction (adaptateur) le moment venu.
- **Deux constats pour le CO** (détaillés en §4) : (1) les modules du lot sont **rangés dans cinq familles différentes** du registre ; (2) **MR05 Catalogue produits** et **Fabrication** n'existent pas dans le dépôt.

## 2. Tableau récapitulatif

| ID | Écran | Module existant (route) | Famille du registre | Données réelles | Logique livrée (`src/refonte/creer/`) |
|---|---|---|---|---|---|
| F50 | Vue d'ensemble | aucun (page nouvelle ; repli `/ensemble/creer`) | — | lit H16, MR07, MR01, MR11, H15… | `ligneDeProduction.ts` |
| H15 | Stock | `StockScreen` (`/stock`) | outils | `stockItems` : nom, unité, quantité, seuil | `stock.ts` |
| H16 | Chantiers | `AssemblyScreen` (`/montage`), `InterventionsScreen` (`/interventions`) | outils | `assemblies` : titre, client, étapes cochées | `chantiers.ts` |
| H17 | Visuels et marque | `IdentiteVisuelleScreen` (`/identite-visuelle`), `VisuelsPubScreen` (`/visuels-pub`) | creer | `brandKit` : monogramme, couleurs, polices | `marque.ts` |
| MR01 | Vidéo | `MontageVideoScreen` (`/montage-video`), `VideoProductionsScreen` (`/productions-video`) | creer | `videoEdits`, `videoProductions` | `video.ts` |
| MR02 | Ma page publique | `MiniSiteScreen` (`/mini-page`), `PortfolioScreen` (`/portfolio`) | creer | `minisite` (un seul enregistrement), `portfolioItems` | `pagePublique.ts` |
| MR03 | Tournées | `DeliveryRoundsScreen` (`/tournees`), `ItinerairesScreen` (`/itineraires`) | outils | `deliveryRounds`, `routePlans` | `tournees.ts` |
| MR04 | Matériel | `EquipmentBookingScreen` (`/materiel`) | outils | `resources`, `resourceBookings` (prêts par créneau) | `materiel.ts` |
| MR05 | Catalogue produits | **aucun** | — | — | `catalogue.ts` |
| MR06 | Réservations | `SallesScreen` (`/salles`), `EquipmentBookingScreen` | echanger / outils | `roomBookings`, `resourceBookings` | `reservations.ts` |
| MR07 | Commandes | `OrdersScreen` (`/commandes`) | argent | `orders` (amn-api) | `commandes.ts` |
| MR08 | Boutique en ligne | `BoutiqueScreen` (`/boutique`) | argent | `shopCarts` (paniers, visites par jour) | `boutique.ts` |
| MR09 | Flotte de véhicules | `FlotteScreen` (`/flotte`) | outils | `vehicles` | `flotte.ts` |
| MR10 | Photos de chantier | `MediaLibraryScreen` (`/media`), `InterventionsScreen` | ecrire / outils | `interventions` (volets avant/pendant/après) | `photos.ts` |
| MR11 | Qualité et contrôles | `ChecklistsScreen` (`/controles`) | outils | `checklists`, `checkRuns` | `qualite.ts` |

Texte commun : `i18n.ts` (216 clés fr/en : sous-titres, états, messages de validation, comptes) et `commun.ts` (jours de Paris, semaines ISO, durées, formats français). Les textes statiques de chaque écran (titres, boutons, vides) seront recopiés des fiches à la construction.

## 3. Écran par écran

Légende : **Existant** = ce que le dépôt fait aujourd'hui ; **Manque** = ce que la fiche demande et que le modèle réel n'a pas ; **Prêt** = ce que la logique couvre déjà.

### F50 · Créer · Vue d'ensemble (nouveau)
- **Existant** : aucune page. La route générique `/ensemble/<famille>` (`PageEnsembleFamille`) sert de repli.
- **Données** : toutes viennent des autres écrans du lot (H16, MR07, MR01, MR11, H15…). Aucune donnée propre.
- **Manque** : (a) l'étape « Réception » de H16 et l'objet « contrôle ouvert sur un chantier » de MR11 n'existent pas dans le modèle réel ; (b) « Bons d'intervention » et « Fabrication » : voir §4.
- **Prêt** : correspondance poste ↔ étapes pour chantiers, commandes et contenus ; un élément n'est qu'à un poste ; comptes des postes = somme des couloirs ; « Tout n » = non livrés ; « n à reprendre » ; regroupement en jeton « n reçues » au-delà de 2 ; couloir absent si le module n'est pas activé ; ligne à l'arrêt ; livraisons à l'heure de la semaine ; palier ; les 16 modules en 4 groupes ; déclencheur de la suggestion (3 articles).
- **Choix** : la mesure de la tuile Livré des commandes réutilise `palierDeLivraisons` (MR07). Le contrôle « Câblage baie Roux » garde son nom et rattache le jeton au chantier (pas un second jeton).

### H15 · Créer · Stock (mixte)
- **Existant** : `StockScreen.tsx` (495 l.), type local `StockItemData {name, unit, quantity, minQuantity, createdAt, movedAt}`. Réutilisable : le calcul de `meche()` de `src/lib/cinquante/ajouts.ts` (rupture prévue sur 40 jours à partir des interventions planifiées) et `anneauxDeStock` (verdicts).
- **Manque** : emplacements, référence, prix d'achat, fournisseur par article, **historique de mouvements** (le réel ne garde qu'une quantité), commandes fournisseur par article (seule `SuppliersScreen` porte `leadTimeDays` et `deliveries[]` au niveau du fournisseur), consommation sur 30 jours observée.
- **Prêt** : quantité = somme des mouvements (par emplacement) ; niveau cible (2 × seuil par défaut, jamais nul) ; remplissage et repère du seuil ; états rupture / sous le seuil (ambre ou rouge à 25 %) / en stock ; articles à surveiller (même requête que la barre latérale et F50) ; valorisation ; ordre des jauges ; quantités en route ; consommation 30 jours hors inventaire ; **projection de rupture à 14 jours** (rupture / évitée / aucune / sans historique) ; couloirs visibles et « voir les N autres » ; stock négatif refusé ; mouvement inverse ; **une seule alerte au franchissement du seuil** ; commande groupée par fournisseur avec ajout d'un article pour atteindre le franco.
- **À confirmer** : la valorisation (Σ quantité × prix d'achat) et la définition de « évitée » (voir tests).

### H16 · Créer · Chantiers (mixte)
- **Existant** : `AssemblyScreen.tsx` (482 l.) = « montage » : `AssemblyData {title, client, steps[{label, doneAt}]}`. `InterventionsScreen.tsx` (670 l.) = bons d'intervention (avant/pendant/après, consommations, report en stock). Les `projects` du moteur de projets n'ont rien à voir avec un chantier de terrain.
- **Manque** : poids d'étape, semaine prévue, part réalisée, dates de début et de fin, équipe, **budget et dépensé**, statut « En retard », interventions planifiées avec date (hors `InterventionPlanifiee` lue par la prévision de stock), livraisons rattachées à un chantier.
- **Prêt** : avancement pondéré (58 % pour 2 étapes sur 5 faites et la 3e à 40 %, avec les poids des tests) ; budget consommé ; rythme « en phase » (écart < 5 points) / « à surveiller » / « à démarrer » / « sans budget » (jamais de rouge) ; barre de budget ambre au-delà de 90 % ; statut (en retard si la fin est dépassée ou l'étape en cours au-delà de sa semaine) ; compteur « à surveiller » de la barre latérale ; sous-titre « n en cours et n à démarrer » ; chantier ouvert par défaut ; dépensé = dépenses + sorties de stock « chantier » + heures ; bilan « 2 étapes sur 4 bouclées » ; prochaine intervention ; signal de livraison tardive ; agenda des 7 jours avec livraisons d'entrepôt ; abréviation des libellés d'étape.
- **Choix** : à 0 % d'avancement le rythme est « à démarrer » même si de l'argent est déjà dépensé (c'est la règle littérale de la fiche) ; à signaler si ce cas pose problème en usage.

### H17 · Créer · Visuels et marque (mixte)
- **Existant** : `IdentiteVisuelleScreen.tsx` (297 l.) et `VisuelsPubScreen.tsx` (188 l.). Le kit est un **monogramme** avec ratios, couleurs et polices sous forme de listes de chaînes (`LogoKit` dans `src/lib/cinquante/marketing.ts`) ; contrôles de lisibilité déjà là (`lisibilite`, `usageIllisible`, `horsZone`, corps minimum 6 px).
- **Manque** : logos importés (variantes, formats), palette nommée avec code, rôle et part d'usage, famille typographique avec graisses, modèles nommés avec dimensions, règles « à éviter », date et auteur de dernière mise à jour. Pas d'hébergement de fichiers.
- **Prêt** : état des 5 chapitres (contenu minimal) et ce qui manque ; kit exportable ou non ; codes hexadécimaux en majuscules (`#0C0C0D`) ; parts de couleur ramenées à 100 (plus fort reste) et étiquettes masquées sous 9 % ; colonnes de palette ; zone de protection (x = moitié de la hauteur du symbole) ; **contrôle à l'export** (déformé, pivoté, effet, marge, couleur hors palette, trop petit) qui avertit sans jamais bloquer.
- **Choix** : réutiliser `lisibilite`/`usageIllisible` pour la taille minimale plutôt que `TAILLE_MIN_*` de `marque.ts` quand le module sera branché.

### MR01 · Créer · Vidéo (mixte)
- **Existant** : deux modèles non reliés. `MontageVideo {titre, format story|reel, etat, plans[{nom, dureeS}], vues}` (collection `videoEdits`, `MontageVideoScreen`, 232 l.) et `VideoProduction {idee, synopsis, jourDeTournage, statut idee|tournage|montage|publie…}` (`useVideoProductions`, `VideoProductionsScreen`, 446 l.).
- **Manque** : étape « Sous-titrage » et « Relecture », avancement en pourcentage, durée, **sous-titres**, pistes audio, **commentaires de relecture**, lien de publication, rushes. Aucun lecteur ni moteur de montage : la frise sera **en lecture** (comme le prévoit la fiche).
- **Prêt** : étapes (Idée → Enregistrement → Montage → Sous-titrage → Relecture → Publiée ; « Tournage » du jeu = « Enregistrement ») ; « n en cours » ; 100 % seulement à « Publiée » ; ligne d'état (vues avec insécable, « À tourner mardi », étape) ; sous-titre « presque prête » dès 80 % + retours à traiter ; échelle et fenêtres de zoom (Tout / 30 s / 10 s, bornées) ; plan sous la tête de lecture ; code temporel ; baisse de la musique sous la voix (−10 dB) ; compteur de relecture « 1 sur 3 traité » et marqueurs ; « Enregistré à l'instant » puis relatif ; série « Une vidéo par semaine » (semaine en cours jamais manquée) ; droits et hors-ligne de la publication ; listes public / privé.
- **À trancher** : deux modèles (`videoEdits` / `videoProductions`) à fusionner ou à relier.

### MR02 · Créer · Ma page publique (mixte)
- **Existant** : `MiniSiteScreen.tsx` (345 l.) = **une seule configuration** (`MiniSiteConfig {enabled, title, intro, hours, address, phone, email, showReviews, showPortfolio}`) ; `PortfolioScreen.tsx` (323 l.) ; la page visiteur `PublicPageScreen` (`/p`). Le module « Pages » (blocs) est un autre objet (fiches internes).
- **Manque** : **sections ordonnées**, version en ligne distincte de la version de travail, statuts, compteur de visites, droit de publier distinct du droit d'écrire, avis avec accord du client (module Avis à relier, H44).
- **Prêt** : statut de section (En ligne / Modifiée / À vérifier / Brouillon) ; changements en attente ; réordonnancement ; contrôles « Avant de publier » (3 au plus) ; action de publication (publier / demander / désactivée avec sa raison) ; aperçu synchronisé ; visites sur 7 jours (variation, jour le plus haut) ; « record depuis <mois> » ; avis affichés **seulement avec l'accord**, prénom + initiale, jamais de contact.
- **Hypothèse** : ce que la fiche dit « sécurité » (adresse, certificat, hébergement) reste dans H18 ; rien ici.

### MR03 · Créer · Tournées (mixte)
- **Existant** : `DeliveryRoundsScreen.tsx` (525 l., `RoundData {title, day, stops[{label, address, doneAt, km, dureeMin}], departAt, vehiculeId}`) et `ItinerairesScreen.tsx` (281 l.) avec `evaluer`, `optimiser`, `traversees` (plan schématique en pourcentages, 28 km/h en ville).
- **Manque** : **aucun géocodage** (positions saisies en pourcentage sur un plan schématique), état « En route / Sur place », heure fixée par étape, conducteur, lien étape ↔ commande, service de plan et trafic (clés côté serveur uniquement).
- **Prêt** : heures d'arrivée (heure fixée = attente ou retard) ; résumé (distance, route, sur place, retard et sa couleur) ; gain de l'optimisation ; « arrivée dans n min » ; moment pour prévenir (30 min avant) ; **une seule étape « En route » à la fois** ; état de la tournée ; segments fait / en route / à venir / retour ; position du véhicule **interpolée, sans suivi GPS** ; contrôles « Avant de partir ». Les étapes dont l'adresse est à vérifier sortent du calcul.
- **Choix** : l'optimisation d'ordre reste côté serveur ou dans `optimiser` existant ; la logique ne calcule que le gain.

### MR04 · Créer · Matériel (mixte)
- **Existant** : `EquipmentBookingScreen.tsx` (490 l.) : `ResourceData {name, kind}` et `BookingData` (prêts par créneau), `chevauche` de `src/lib/creneaux.ts`.
- **Manque** : affectation permanente (personne ou lieu), numéro de série, état, valeur, entretien (date, périodicité), photo, réforme.
- **Prêt** : statut (En prêt / Disponible / Hors service) distinct de l'état ; un hors service ne se prête pas ; jauge à 5 segments (Neuf 5, Bon 4 ou 5 si contrôlé il y a moins de 30 jours, À vérifier 2, À réviser 1) ; prochain entretien (en retard, dans n jours ≤ 30, mois abrégé) ; entretien enregistré et échéance recalculée ; résumé du parc (**42 + 3 + 1 = 46**, un seul segment par équipement) ; puces ; entretiens du mois (3 + « n autres ») ; ordre des fiches ; talon (« Aaron (vous) ») ; mouvements du jour (5 visibles).

### MR05 · Créer · Catalogue produits (mixte → de fait nouveau)
- **Existant** : **aucun module**. Seulement des nomenclatures (`BomScreen`, `sellPriceCents`), des lignes de commande avec référence, des paniers de boutique, et un catalogue de prix tirés des devis (`devisBrief`). Aucune collection « produits ».
- **Manque** : tout (produit, prix HT/TVA, stock lié à H15, photos, type, état actif/archivé, prix d'achat).
- **Prêt** : TTC (890 € HT → 1 068 €) ; couleur du stock (même règle partout) ; jauge et repère ; stock bas ; marge (302 / 890 = 34 %, visible avec le droit) ; fiche complète et « 7 sur 8 » ; produit vedette de la semaine ; ventes sur 6 semaines ; ordre de la mosaïque ; prix affiché (HT, par an, par mois).
- **À trancher** : créer la collection `products` (et la relier à `stockItems` par article) ; l'écran ne peut pas être « fait » sans cela. Voir §4.

### MR06 · Créer · Réservations (mixte)
- **Existant** : trois candidats partiels. `SallesScreen.tsx` (329 l., `ReservationSalle {piece, debut, fin, motif}`, réservations « fantômes » libérées à 60 min), `EquipmentBookingScreen.tsx` (seul à **refuser** un chevauchement), `BookingScreen.tsx` (rendez-vous clients en ligne : autre objet).
- **Manque** : une ressource générique (type, groupe, règles, ouverture), statuts confirmée / en attente / annulée, détection de conflit côté serveur, lien tournée ↔ véhicule.
- **Prêt** : chevauchement (intervalles **ouverts à la fin** : 9:00–11:00 et 11:00–12:00 sont compatibles) ; vérification « aucun doublon » (référence du serveur) ; conflits = demandes qui chevauchent une confirmée (jamais résolus seuls) ; plages réservables ; créneaux libres ≥ 1 h calculés en heure de Paris ; « n créneaux libres » (≥ 2 h) et le plus long ; occupation du jour et de la semaine ; demi-journées creuses (< 40 %) ; « aucun doublon depuis n jours » ; ligne « maintenant » ; filtres.
- **Convention** : jours d'ouverture en ISO (1 = lundi … 7 = dimanche), comme les jeux fictifs.

### MR07 · Créer · Commandes (mixte)
- **Existant** : le module le plus complet. `OrdersScreen.tsx` (912 l.), type `Order` de `src/shared/api.ts` (statuts `new, confirmed, preparing, shipped, delivered, cancelled`, hook `useOrders`, transitions fermées `NEXT_STATUSES`, `orderTotals`).
- **Manque** : mode de remise (retrait / colis / tournée), échéance, urgence, responsable, étapes et preuve de remise, lien avec une tournée, instant de création précis (« +1 il y a 4 min »), numéros identiques entre MR07 et MR08.
- **Prêt** : les **statuts du module actuel et ceux de la fiche se rangent dans les mêmes 4 étapes** (le retrait « Prête au retrait » est compté avec les expédiées) ; urgente (à la main ou échéance dépassée sans expédition) ; à expédier aujourd'hui ; compteurs (4 + 4 + 3 = 11 en cours, livrées du mois, évolution à nombre de jours égal, commandes récentes) ; tri de la liste ; échéance affichée (Auj., Demain, jour, date) ; jetons (3 au plus + « n autres ») ; palier (prochain multiple de 10 au-dessus du record) ; suivi pas à pas (Payée seulement en ligne) ; retour d'une seule étape, jamais depuis « Livrée ».

### MR08 · Créer · Boutique en ligne (mixte)
- **Existant** : `BoutiqueScreen.tsx` (243 l.), `guichet.ts` : `parcoursAchat` (entonnoir en 5 étapes sur 30 jours, étape d'abandon dominante, panier moyen, paniers relançables), `PanierBoutique`, `VisitesBoutique {jour, nombre}`, `ReglageBoutique`.
- **Manque** : **visites en direct** (le réel ne garde qu'un compteur quotidien), événements fins de l'entonnoir (fiche vue, ajout au panier, paiement commencé), lien paniers ↔ commandes, objectif du trimestre (réglage à créer), produits (MR05).
- **Prêt** : visiteurs sur les 5 dernières minutes, sans identifiant persistant (les plus avancés d'abord, 5 au plus) ; appareil déduit de l'écran ; bilan de la semaine (CA hors remboursées, panier moyen arrondi à l'euro, variation à nombre de jours égal) ; « ce qui se vend » ; entonnoir (taux arrondis, écart le plus fort signalé) et hauteur de bande en racine ; paniers abandonnés (≥ 24 h) et contactables ; objectif du trimestre et « moins de n semaines comme celle-ci » ; état de la boutique.
- **À réutiliser** : `parcoursAchat` couvre déjà l'entonnoir à 30 jours ; la logique ajoutée complète le 7 jours et l'écart le plus fort.

### MR09 · Créer · Flotte de véhicules (mixte)
- **Existant** : `FlotteScreen.tsx` (360 l.), `Vehicule {nom, immatriculation, kmDepart, echeances[{nature km|jours, intervalle, dernierKm, dernierLe, rendezVous}], couts[{le, montantCents, nature}]}` ; `compteur`, `etatEcheance`, `kmParJour` (30 jours), `echeanceEnAmbre`, kilométrage tiré des tournées pointées.
- **Manque** : énergie, niveau de carburant ou de charge, autonomie du modèle, conducteur, état (disponible / en tournée / au garage), assurance datée, pleins avec litres.
- **Prêt** : état du véhicule (en tournée si une tournée ou une réservation est en cours ; le garage prime) ; couleur de la jauge (vert ≥ 50 %, orange 25–49 %, rouge, bleu en charge) ; autonomie arrondie à 10 km ; compteur à 6 chiffres ; **échéances au km datées au rythme des 30 jours (« ≈ »)** ; barre « part écoulée » (800 km restants sur 5 000 → 84 %) ; couleurs (rouge < 30 jours ou dépassée, orange < 1 000 km ou < 45 jours) ; frise sur 6 mois ; km du mois et variation du carburant ; contrôles « Avant le prochain trajet ». Aucun suivi de position du conducteur.
- **À réutiliser** : `kmParJour`, `etatEcheance` de `ajouts.ts` à l'intégration (mêmes règles, formes différentes).

### MR10 · Créer · Photos de chantier (mixte)
- **Existant** : `MediaLibraryScreen.tsx` (290 l.) : médiathèque tirée des pièces jointes de la messagerie, sans dossier ni phase. `InterventionsScreen.tsx` : volets **avant / pendant / après, une photo chacun**, par intervention.
- **Manque** : dossier multi-photos lié à un chantier ou un client, date et lieu à la prise, auteur, orientation, signature du client, partage par lien protégé.
- **Prêt** : comptes par phase (7 + 21 + 8 = 36) ; détail de ligne ; complétude (avant, après, signature) et couleurs ; planche « Photos par jour » (8 vignettes, la 8e dit « +5 » = restantes, elle-même comprise) ; appariement par lieu et orientation (à travers 0°/360°) ; « même angle, même cadrage » (≤ 10°) ; « 16 jours de travaux » ; partage client **sans lieu ni auteur**, lien à durée limitée.

### MR11 · Créer · Qualité et contrôles (mixte)
- **Existant** : `ChecklistsScreen.tsx` (591 l.), `ChecklistData {title, items: string[]}` et `CheckRunData {checked: boolean[], note, byEmail}` ; tout est inline, aucune fonction exportée.
- **Manque** : criticité et preuve par point, résultat « Sans objet », **objet « écart »** (cause, gravité, responsable, échéance), signature (la signature électronique existe à part), lien avec un chantier ou un client, statut du contrôle.
- **Prêt** : verdict d'un point ; compteurs (17 + 2 + 3 = 22) ; conformité (77 % **provisoire** tant que des points sont à vérifier, définitive à la signature ; « sans objet » hors du calcul) ; couleurs 90 / 70 ; signature possible sans point à vérifier ; contrôles du mois ; conformité du mois (moyenne des signés) et « validés du premier coup » ; **Pareto** de tous les écarts du mois (clos compris), cumul, causes colorées jusqu'au premier cumul ≥ 80 % (première rouge, suivantes orange) ; « où ils arrivent » (3 + Autres).

## 4. Constats à porter au CO

1. **Cinq familles pour un seul hub.** F50 affiche 16 modules « Créer et produire ». Le registre n'en range que 3 dans `creer` (Vidéo, Visuels et marque, Ma page publique). Stock, Chantiers, Tournées, Matériel, Flotte et Qualité sont dans `outils` ; Commandes et Boutique dans `argent` ; Salles dans `echanger` ; la Médiathèque dans `ecrire`. Le compteur « 16 modules » et le menu de la famille ne concordent pas tant que les déclarations ne sont pas redistribuées. Les fichiers de déclaration appartiennent à d'autres lots : **décision du CO**.
2. **MR05 et Fabrication n'existent pas.** MR05 est de fait un module à créer (collection `products`). « Fabrication » n'a aucun équivalent (les plus proches : nomenclatures `BomScreen`, étapes d'`AssemblyScreen`) ; « Bons d'intervention » existe sous le nom `InterventionsScreen`. F50 les liste avec des noms **proposés**.
3. **Les « modules existants » sont plus minces que les fiches ne le disent.** Le chantier, la tournée, le véhicule, le contrôle qualité et la page publique existent, mais sans budget, poids d'étape, géocodage, énergie, écarts ni sections. Chaque écran MIXTE est donc en partie un **nouveau modèle de données** à brancher sur la synchronisation (`useCollection`, `SYNCED_COLLECTIONS`, `src/shared/api.ts`). Cela touche des fichiers sensibles et le contrat avec amn-api : à cadrer avant la construction.
4. **Photos et fichiers.** MR10, MR05, MR04, H17 et MR01 supposent des photos, des rushes ou des logos ; le dépôt n'a pas d'hébergement de fichiers pour ces modules (la médiathèque est dérivée de la messagerie). Prévoir le stockage avant les écrans.
5. **Géocodage, plan et trafic (MR03)** : le dépôt n'en a pas. La fiche exige des clés côté serveur uniquement ; décision de CO sur le fournisseur de plan et son hébergement.
6. **Mobile (MB07)** : photos de chantier et scan se préparent aussi pour le téléphone ; les entrées de `photos.ts` n'ont aucune dépendance au bureau.
7. **Garde `check:socle-graphiques`** interdit d'importer la mise en forme des graphiques du socle hors d'une liste fermée. `commun.ts` en garde donc une copie minimale (nombre et espaces français). À remplacer par l'import du socle si le CO étend la liste, ou à déplacer vers `src/lib`.

## 5. Règles posées par défaut (Propositions des fiches, retenues telles quelles)

Chaque règle porte le nom de la fiche qui la propose ; toute valeur chiffrée est une constante nommée du code.

- **Stock** : niveau cible = 2 × seuil ; rouge si ≤ 25 % du seuil ; couloirs visibles = 3.
- **Chantiers** : « en phase » si l'écart budget − avancement < 5 points ; ambre au-delà de 90 % de budget ; retard si l'étape en cours dépasse sa semaine.
- **Vidéo** : « presque prête » dès 80 % ; musique −10 dB sous la voix.
- **Page publique** : 3 contrôles « Avant de publier » au plus ; « record depuis » = meilleure période de 7 jours depuis qu'une aussi bonne s'est terminée.
- **Tournées** : retard vert à 0, orange de 1 à 15 min, rouge au-delà ; prévenir 30 min avant.
- **Matériel** : Bon = 4 segments (5 si contrôlé il y a moins de 30 jours).
- **Réservations** : créneaux libres ≥ 1 h ; « n créneaux libres » = ≥ 2 h ; demi-journée creuse < 40 %.
- **Commandes** : récentes = 15 min ; palier = prochain multiple de 10 au-dessus du record du mois.
- **Boutique** : direct = 5 min ; abandon = 24 h.
- **Flotte** : rouge < 30 jours ou dépassée, orange < 1 000 km ou < 45 jours.
- **Photos** : même cadrage ≤ 10° ; lien client 14 jours ; conservation 10 ans.
- **Qualité** : vert ≥ 90 %, orange 70–89 % ; seuil de Pareto 80 %.

## 6. Données fictives : ce que SIM peut ajouter (champs manquants constatés)

Les jeux `creer.ts` suffisent pour les 130 contrôles. Champs absents, lus comme facultatifs par la logique :

- `ArticleStock` : niveau cible, emplacement par mouvement, commandes fournisseur (article, quantité, arrivée) ; fournisseur : franco et frais de port.
- `Chantier` : poids et part réalisée par étape, interventions planifiées, livraisons rattachées.
- `Marque` : rôle et part d'usage des couleurs, règles « à éviter », dernière modification.
- `Video` : étape « Sous-titrage », plans, sous-titres, commentaires de relecture ; date de publication.
- `PagePublique` : sections (le jeu actuel décrit des pages entières), visites par jour, avis avec accord.
- `EtapeTournee` : temps et distance de trajet, état « Sur place ».
- `Equipement` : dernier contrôle, dernier entretien, réforme, affectation datée.
- `Produit` : photos, TVA, prix d'achat, niveau conseillé ; lignes de vente par semaine.
- `Commande` : instant de création, heure d'échéance, date de livraison, mode de paiement en ligne.
- `Vehicule` : énergie, niveau, autonomie, kilomètres par jour, coûts de carburant.
- `DossierPhoto` : orientation des photos, signature du client.
- `Controle` / `EcartQualite` : résultat « sans objet », cause de l'écart, date de relevé.
- Boutique : sessions en direct, événements de l'entonnoir, paniers avec dernière activité.

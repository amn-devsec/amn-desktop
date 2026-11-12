# DEV-deploiements · Déploiements
Développement · LOT-11 · Image : `images/DEV-deploiements.png` · Statut : MIXTE
Parcours : Développement / Déploiements

> Règles communes de l'espace : [`00-COMMUN.md`](00-COMMUN.md).

## 1. Rôle
Mettre en ligne sans crainte : voir le **dernier déploiement étape par étape**, l'**historique** avec un **retour arrière en un clic** sur chaque ligne, ce qui est **en ligne maintenant**, et les **déploiements planifiés**. Quand un déploiement échoue, l'écran dit pourquoi et mène à la ligne du journal.

## 2. Nouveau ou re-habillage ?
- **Existant réutilisé** : la **livraison du Studio** (`src/bureaux/studio/Livraison.tsx`, `/studio/pieces/…`) tient déjà, par pièce, une liste de points bloquants et un **rail des mises en ligne** (`livraison.misesEnLigne[] : version, at, par, quoi`). Une mise en ligne notée là devient un déploiement réussi de la cible « Production » du dépôt relié. Les budgets de poids (`Performance.tsx`, `depassements`) restent un point bloquant avant « Déployer ».
- **Nouveau (à créer)** : (a) la carte du dernier déploiement avec ses **5 étapes** (Code reçu, Construction, Tests, Mise en ligne, Vérification) et leurs durées ; (b) le tableau « Historique » avec « Revenir » ; (c) « Planifiés » ; (d) l'histogramme « Déploiements par jour » ; (e) « En ligne maintenant » ; (f) la suggestion d'Ajmani sur un échec ; (g) « Planifier » et « Déployer ».
- **Dépend d'un connecteur** : l'exécution d'un déploiement, son journal et l'état des cibles viennent du **connecteur Hébergement** (LOT-12 : notre serveur d'abord, Vercel / Render / Netlify en option) et du **connecteur Code**. L'exécution planifiée côté serveur relève d'**amn-api** (liste « Demandé à amn-api » de LOT-12). *À confirmer dans le code* : aucun pipeline de déploiement n'est piloté par l'application aujourd'hui.

## 3. Disposition par zones
Coordonnées relatives à la zone principale, relevées sur l'image, à ± 2 px.
- **Z1 En-tête de page** : h1 « Déploiements », sous-titre ; à droite secondaire « Planifier » (icône calendrier) puis **primaire** « Déployer » (icône fusée), 36 px, y = 44.
- **Z2 Dernier déploiement** : carte **1108 × 171** à (40, 97). Ligne de titre : tuile d'icône 40 px (fusée, bordure `a`), nom du dépôt en monospace 15 px / 600 + « vers <cible> » 15 px / 600, sous-ligne 12.5 px T4 ; pastille d'état à droite. **Frise des 5 étapes** sur toute la largeur utile : 5 colonnes égales (≈ 226 px), chacune un rond de 32 px (coche, dégradé `a → b` avec lueur), libellé 13.5 px / 600 T1 dessous, durée 12 px T4 ; liens horizontaux de 2 px en dégradé entre deux ronds (≈ 116 px, centrés).
- **Z3 Historique** : carte **732 × 313** à (40, 284). Titre 15 px / 600 + « 4 derniers » à droite. En-têtes de colonnes en capitales 11 px, `letter-spacing:.09em`, T4 : PROJET (x + 52), CIBLE (x + 200), ÉTAT (x + 322), DURÉE (x + 420), QUAND (x + 504). 4 lignes de **55 px** séparées par un filet : point d'état 8 px, nom monospace 13 px / 600 et branche 12.5 px T4 sur deux lignes, cible 13.5 px T2, pastille d'état, durée 13.5 px, « quand » sur deux lignes (date relative T2, personne T4), bouton secondaire « Revenir » (≈ 78 × 36) à droite.
- **Z4 Planifiés** : carte **732 × 147** à (40, 611). Titre + « 2 à venir ». 2 lignes de ≈ 46 px : tuile calendrier 26 px, date 13.5 px T3, nom monospace 600 + « · » + texte T3, pastille de cible à droite.
- **Z5 Colonne droite** (x = 788, largeur 360) : « Déploiements par jour » **360 × 140** à (788, 284) — 14 barres de ≈ 18 px (écart ≈ 6), hauteur max ≈ 56, repères « 27 oct. » et « 9 nov. » 11 px T4 ; « En ligne maintenant » **360 × 168** à (788, 438) — 4 lignes de 27 px (point vert, nom 13.5 px T2, âge monospace 12 px T4 à droite) ; suggestion d'Ajmani **360 × 137** à (788, 621), bord en dégradé a → b, bouton pleine largeur.
- **Z6 Barre Ajmani** : standard.
- **Barre latérale** : famille Développement, module actif « Déploiements ».

## 4. Contenu affiché (textes exacts)
**En-tête** : « Déploiements » · « 9 cette semaine · 1 échec · tout se relance ou se défait en un clic » · « Planifier » · « Déployer ».

**Dernier déploiement** : « amn-desktop vers Préproduction » · « claude/refonte-socle · lancé par Mohamed il y a 12 min » · pastille « Réussi en 1 min 48 ».
| Étape | Durée |
|---|---|
| Code reçu | 3 s |
| Construction | 48 s |
| Tests | 52 s |
| Mise en ligne | 6 s |
| Vérification | 4 s |

**Historique** : « Historique » · « 4 derniers » · colonnes « PROJET », « CIBLE », « ÉTAT », « DURÉE », « QUAND ».
| Projet | Branche · quoi | Cible | État | Durée | Quand | Par |
|---|---|---|---|---|---|---|
| amn-desktop | claude/refonte-socle | Préproduction | Réussi | 1 min 48 | il y a 12 min | Mohamed |
| amn-site | main · textes de l'offre | Production | Réussi | 42 s | il y a 3 h | Aaron |
| optique-avenue | claude/refonte-v2 | Aperçu | Échec | 1 min 02 | il y a 5 h | Aaron |
| aura-prestige | main · nouvelle galerie | Production | Réussi | 57 s | hier 18:20 | Aaron |
Chaque ligne : bouton « Revenir ».

**Planifiés** : « Planifiés » · « 2 à venir ».
- « jeu. 12, 18:00 » · « amn-desktop » · « version 1.2.51 » · pastille « Interne » (info)
- « ven. 13, 09:00 » · « amn-api » · « correctif des sessions » · pastille « Serveur AMN » (info)

**Déploiements par jour** : « Déploiements par jour » · « 14 derniers jours » · « 27 oct. » · « 9 nov. » (une barre en danger : le jour d'un échec).

**En ligne maintenant** : « En ligne maintenant » · « amndevsec.fr » « 3 h » · « Aura Prestige » « hier » · « Serveur AMN » « hier » · « Poste interne » « lun. ».

**Suggestion d'Ajmani** : « Aperçu d'Optique Avenue en échec : la commande de build ne trouve pas l'image d'accueil. Je te montre la ligne ? » · « Voir le journal ».

## 5. Composants du socle utilisés
`Sidebar`, `Header`, `PageHead`, `Card`, `IconTile`, `StatusPill`, `Button` (secondaire 36 px), `Barres` (histogramme, 06 §3 règle 8 : barres en dégradé `a` 50 % → 10 %, barre d'échec en danger plein avec lueur), `LiveDot` (déploiement en cours), `Suggestion`, `AjmaniBar`, `DialogueConfirmation`.
**Nouveaux composants** (lot) :
- `FriseDeploiement` : 5 étapes (rond 32 px, libellé, durée) reliées ; états par étape : à venir (rond creux T4), en cours (rond `a` + voyant vivant + chronomètre), réussie (coche, dégradé `a → b`), échouée (croix, danger), sautée (tiret, T4).
- `LigneDeploiement` : ligne d'historique (point, projet et branche, cible, pastille, durée, quand et qui, « Revenir »).
- `LignePlanifiee` : tuile calendrier, date, projet, quoi, pastille de cible.
- `ListeEnLigne` : point d'état + nom de la cible + âge de la version en ligne.

## 6. Données et règles de calcul
Logique pure : `src/refonte/developpement/deploiements.ts` (préparation du lot, garde `check:developpement`).
- **Déploiement** : dépôt, branche, quoi (message court facultatif), cible, lancé par, lancé à, étapes (5, dans l'ordre fixe), état. Aucune variable d'environnement ni valeur de configuration n'est stockée ici (seulement leur nom côté H24).
- **État global** = `échec` si une étape a échoué ; `en cours` si une étape est en cours ; `réussi` si les 5 étapes sont réussies ou sautées ; `annulé` si arrêté à la main ; sinon `en attente`.
- **Durée** = fin de la dernière étape − début de la première (durée **mesurée de bout en bout**, pas la somme des étapes) ; écrite « 42 s », « 1 min 02 », « 1 min 48 ». **Piège de la maquette** : les durées d'étapes affichées font 113 s pour un total de 1 min 48 (108 s) ; la règle retenue est la mesure de bout en bout, et les étapes affichent leur propre durée.
- **Pastille** : « Réussi en <durée> », « Échec à l'étape <étape> » (*Proposition*), « En cours · <étape> », « Annulé ».
- **Sous-titre** : « n cette semaine » = déploiements lancés depuis lundi ; « n échec(s) » = échecs de la semaine **non repris** par un déploiement réussi ultérieur de la même cible ; la fin de phrase (« tout se relance ou se défait en un clic ») est fixe.
- **Historique** : 4 derniers, du plus récent au plus ancien ; « Quand » = relatif (« il y a 12 min », « il y a 3 h ») jusqu'à 24 h, puis « hier HH:MM », puis jour abrégé.
- **Revenir** : remet en ligne, sur la **même cible**, la dernière version **réussie antérieure** à la ligne choisie (pour une ligne en échec : la dernière réussie avant elle, c'est-à-dire ce qui est en ligne). Indisponible (bouton désactivé avec infobulle « Aucune version précédente sur cette cible ») s'il n'y en a pas. Un retour arrière est lui-même un déploiement de l'historique (quoi = « retour à <version> »).
- **Planifiés** = déploiements datés dans le futur, triés par date ; « n à venir ». Pastille = cible.
- **Déploiements par jour** = nombre par jour sur 14 jours glissants, aujourd'hui compris ; une barre est en danger si au moins un échec ce jour-là (*Proposition*).
- **En ligne maintenant** = pour chaque cible suivie, la version en ligne (dernier déploiement réussi) et son âge ; point vert si la dernière vérification est bonne, orange sinon (*Proposition*) ; tri par âge croissant.
- **Cible « Interne »** (l'installeur de l'édition interne) : **aucune distribution pour l'instant** (`STATUT.md` §1.16). Tant que le canal privé n'est pas décidé (DIST, après SEC-0), cette cible n'exécute rien : elle prépare la version et attend. Jamais de tag `v*` ni de Release publique depuis cet écran.

## 7. Interactions
- **« Déployer »** (primaire) : boîte de dialogue en une étape (dépôt, branche, cible ; la dernière combinaison est proposée), puis « Déployer » ; la frise passe en cours. Production : confirmation en une ligne (« Mettre en ligne en production ? ») (*Proposition*). Trois actions au plus.
- **« Planifier »** : même dialogue + date et heure ; ajoute une ligne à « Planifiés ». Un déploiement planifié s'annule depuis sa ligne (menu « Annuler »).
- **« Revenir »** : un clic ouvre une confirmation en une ligne « Revenir à la version du <date> sur <cible> ? » + « Revenir » ; *Proposition* : sans confirmation pour la cible Aperçu. Le retour apparaît en tête de l'historique.
- Clic sur une ligne d'historique : ouvre le **journal** du déploiement (lignes monospace, étape par étape) ; sur un échec, le journal s'ouvre à la première ligne en erreur.
- Clic sur une étape de la frise : journal filtré sur cette étape.
- Clic sur une barre : liste des déploiements du jour. Clic sur « En ligne maintenant » : ouvre la cible (lien externe si c'est un site, avec confirmation d'ouverture).
- **« Voir le journal »** (suggestion) : journal du déploiement en échec, à la ligne fautive.
- **Mouvement** : rond de l'étape en cours avec voyant vivant (seule animation continue, avec le curseur de la barre Ajmani) ; barres qui poussent (700 ms, décalage 30 ms) ; lignes d'historique qui glissent à l'arrivée d'un nouveau déploiement. `prefers-reduced-motion` coupe tout.

## 8. États
- **Aucun déploiement** : la carte Z2 affiche la frise à vide (5 ronds creux) et « Aucun déploiement pour l'instant. Choisis un dépôt et une cible : l'application s'occupe des 5 étapes. » + « Déployer ». Historique vide : « Rien encore. » ; histogramme à plat.
- **En cours** : pastille « En cours · Construction » avec voyant, chronomètre sur l'étape, « Déployer » désactivé pour la même cible.
- **Échec** : rond de l'étape en danger, étapes suivantes « sautées » ; pastille « Échec à l'étape Tests » ; suggestion d'Ajmani si une cause est lisible dans le journal, sinon « Voir le journal » seul.
- **Connecteur Hébergement non branché** : « Déployer » et « Planifier » remplacés par « Brancher l'hébergement » (H21) ; historique et rail du Studio restent lisibles.
- **Chargement** : squelettes de la frise, de 4 lignes et des barres. **Erreur** : bandeau « Les déploiements n'ont pas pu être chargés. » + « Réessayer ». **Hors ligne** : lecture seule, boutons d'action désactivés.
- **Droits** : sans droit de mise en ligne, on voit tout, sans « Déployer », « Planifier » ni « Revenir ». Production peut demander un droit distinct (*Proposition*).

## 9. Éléments ludiques
- Frise des 5 coches qui se remplit, « Réussi en 1 min 48 ».
- *Proposition* : phrase d'encouragement à la fin d'un déploiement réussi (« C'est en ligne. »), une seule, sans confettis ni son.
- Ce qu'on ne fait pas : pas de score de déploiements par personne, pas de reproche sur un échec.

## 10. Ajmani
- **Suggestion** (colonne droite) : déclencheur = un déploiement en échec dont le journal contient une erreur reconnaissable (fichier introuvable, test en échec, dépassement de budget). Le texte nomme le dépôt, la cible et la cause en une phrase, puis « Je te montre la ligne ? ». Sans échec : la carte devient une astuce courte (« Astuce : planifie les mises en production en début de matinée. ») ou disparaît.
- Barre ⌘J, invites : « Déploie optique-avenue en aperçu », « Reviens à la version d'hier sur amn-site », « Qu'est-ce qui part en ligne cette semaine ? ».

## 11. Adaptation (fenêtre réduite, mobile)
- Sous 1280 px : la colonne droite passe sous l'historique (3 cartes côte à côte) ; la frise garde ses 5 étapes, libellés sur deux lignes si besoin.
- Sous 900 px : historique en cartes (une par déploiement) ; la frise devient verticale.
- Mobile (LOT-09) : *Proposition* : lecture de l'état et des échecs ; « Revenir » et « Déployer » restent sur le poste.

## 12. Critères de réussite
- [ ] Identique à `images/DEV-deploiements.png` à ± 2 px : carte 1108 × 171, historique 732 × 313 (lignes de 55), planifiés 732 × 147, colonne droite 360 de large.
- [ ] La durée totale est mesurée de bout en bout ; chaque étape affiche la sienne.
- [ ] « Revenir » vise la dernière version réussie antérieure sur la même cible, et se confirme (sauf Aperçu, si retenu).
- [ ] La cible « Interne » ne publie rien tant que DIST n'est pas décidé ; aucun tag `v*`, aucune Release.
- [ ] Aucune variable d'environnement ni clé affichée, même masquée.
- [ ] Un seul bouton primaire (« Déployer ») ; états vide, en cours, échec, non branché, chargement, erreur, hors ligne présents.
- [ ] `typecheck`, `lint`, `check:socle`, `check:developpement` verts.

## 13. Pièges
- La somme des durées d'étapes de la maquette (113 s) ne fait pas 1 min 48 : ne jamais recalculer le total par addition.
- « Revenir » sur une ligne **en échec** ne remet pas la version en échec : il remet ce qui était en ligne avant.
- « 1 échec » du sous-titre ne compte plus un échec repris par un déploiement réussi de la même cible.
- « 9 cette semaine » = le « 9 déploiements » de DEV-projets.
- Les dates de l'histogramme (27 oct. → 9 nov.) et les noms sont fictifs.
- Le rail des mises en ligne du Studio et cet historique ne doivent pas se dédoubler : une mise en ligne notée au Studio est **le même** déploiement.

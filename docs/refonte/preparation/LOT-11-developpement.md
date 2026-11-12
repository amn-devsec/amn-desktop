# LOT-11 · Espace Développement — note de préparation

> Branche `claude/refonte-developpement`, partie de `claude/refonte-vivante` @ `50a58c4`. Rédigée le 12 nov. 2026 par S8, en mode PRÉPARATION (socle v4 non fusionné, fiches à relire par Harun : aucun écran visuel n'est construit).
> Sources : le dossier v4 (`07-ESPACE-DEV.md`, `06-V4-NEON-ET-TUTOIEMENT.md`, les 7 images `DEV-*`, `sources-neon/DEV-modeles-sites.html`), les fiches du lot (`docs/refonte/fiches/LOT-11/`), les modules du dépôt (relevé du 12 nov.), les jeux fictifs de SIM (`src/refonte/donnees/`).
> Rien dans ce document ne décrit une faiblesse de sécurité ; aucune donnée réelle.

## 1. En bref

- **Fiches** : 6 écrits d'après les images (DEV-projets, DEV-deploiements, DEV-serveur, DEV-editeur, DEV-couts, DEV-modeles-sites) et 1 proposé sans image (DEV-ensemble), plus une page de règles communes (`00-COMMUN.md`). Envoyées au CO pour la relecture de Harun (`6af5f4f`).
- **Logique pure livrée** : `src/refonte/developpement/` (5 fichiers, sans React ni brique visuelle) et `scripts/check-developpement.ts` (`npm run check:developpement`, **51 contrôles**, ajouté à `package.json` et `editions.yml`). Trois sujets, comme demandé : **journal des exécutions**, **tâches planifiées locales**, **état des déploiements**. Les cas sont écrits d'après les fiches (valeurs des images), et le résumé des flux est rejoué sur le jeu fictif `automatisations` (volumes `vide`, `peu`, `normal`, `beaucoup`).
- **Ce qui attend** : tout ce qui dépend d'un connecteur (Code, Hébergement, coûts) attend le **modèle de LOT-12 (S9)** ; DEV-serveur attend la **décision serveur (LOT-13)**, reportée. Rien n'est contourné : les écrans auront un état « à brancher ».
- **Quatre constats pour le CO** (§5) : la seconde entrée des sous-modules réutilisés ne peut pas passer par le registre ; la famille « developpement » n'a pas de teinte dans le registre ; il faut un 8e hub ; le moteur de H20 ne connaît pas les branches Sinon / Puis.

## 2. Tableau récapitulatif

| ID | Écran | Existant le plus proche (route) | Famille du registre (actuelle) | Dépend de | Logique livrée (`src/refonte/developpement/`) |
|---|---|---|---|---|---|
| DEV-ensemble | Vue d'ensemble | aucun ; repli générique `/ensemble/:famille` (socle v4) | — (famille `developpement` à créer) | 8e hub du socle ; tous les écrans du lot | — (lit les autres écrans) |
| DEV-projets | Projets de code | Studio (`/studio`, façade des pièces) ; Projets `ProjectsScreen` (`/projets`) | studio : hors registre ; projets : `jour` | connecteur Code (LOT-12) ; H03 ; SSL | — (attend le modèle des dépôts) |
| DEV-deploiements | Déploiements | `bureaux/studio/Livraison.tsx` (rail des mises en ligne) | hors registre | connecteur Hébergement (LOT-12), amn-api | `deploiements.ts` |
| DEV-serveur | Serveur et santé | aucun ; MO03 pour les sauvegardes | — | LOT-13, amn-api | — (attend LOT-13) |
| DEV-editeur | Éditeur de flux | `AutomationsScreen` (`/outils/automatisations`), `useAutomations`, `AutomationsRunner` | `outils` | moteur de H20 (S6) ; LOT-12 pour le mode API | `journal.ts`, `planification.ts` |
| DEV-couts | Coûts et API | aucun ; état des connecteurs (H21) | — | modèle de LOT-12 (catalogue, coût, plafond) | — (attend LOT-12) ; `partLocaleDuMois` côté journal |
| DEV-modeles-sites | Modèles de sites (et vue code) | aucun (prototype v4 fonctionnel) | — | rien (tout sur le poste) | — (à faire : logique de la bibliothèque, sans dépendance) |

Textes calculés : `i18n.ts` (46 clés fr/en, tutoiement). Aides communes : `commun.ts` (heure de Paris avec heure d'été et d'hiver, durées « 1 min 48 », dates « jeu. 12, 18:00 », « il y a 12 min », « hier 18:20 », masquage des valeurs secrètes dans un journal).

## 3. Inventaire de l'existant

### 3.1 Studio (`src/bureaux/studio/**`, 3 073 lignes, routes `/studio/…`)

Le Studio est l'atelier des **sites des clientes** : une « pièce » par site (`studioPieces`, type `PieceStudio` de `src/bureaux/donnees/types.ts`).

| Fichier | Rôle | Réutilisable pour LOT-11 |
|---|---|---|
| `Accueil.tsx` (283 l.) | la **façade** : un immeuble, une fenêtre par pièce (en ligne, chantier, attente cliente) | idée « une pièce = un site » ; état « attente cliente » → « validation du client » de DEV-projets |
| `Piece.tsx`, `NouvellePiece.tsx`, `ParCliente.tsx` | une pièce, sa création, les sites par cliente | lien dépôt ↔ pièce (DEV-projets) |
| `Livraison.tsx` (215 l.) | **livraisons** : liste de points (bloquants), **rail des mises en ligne** (`livraison.misesEnLigne[] : version, at, par, quoi`), « Mettre en ligne » | `deploiements.ts › depuisStudio` : une mise en ligne notée là **est** un déploiement réussi « Production » (pas un second) ; les points bloquants restent un préalable à « Déployer » |
| `Recette.tsx` (171 l.) | **recette visuelle** avant / après par page (`recettes[]`) | une 6e étape « Recette » possible plus tard ; pas dans les 5 étapes des images |
| `Performance.tsx` (87 l.) | **budget de poids** par page (`budget`, `depassements`) | un dépassement bloque « Déployer » (comme dans la Livraison) |
| `Accessibilite.tsx`, `Analytique.tsx` | manques d'accessibilité ; mesures hebdomadaires | hors lot (restent au Studio) |
| `Croquis.tsx`, `Notes.tsx`, `Prompts.tsx`, `Retours.tsx`, `maquette.tsx`, `commun.tsx` | mur de maquettes, notes, prompts, retours épinglés | hors lot |

Le Studio n'est pas dans le registre des modules de la refonte (il a son propre catalogue de bureau, `src/bureaux/catalogue.ts`).

### 3.2 Projets et tâches

- **Projets** : `ProjectsScreen.tsx` (1 633 l., `/projets`, famille `jour`, fiche MJ01) et `ProjectBoardScreen.tsx` (207 l.). Projets **de l'équipe** (avancement, tâches, temps), pas des dépôts de code. Un dépôt pourra être **relié** à un projet ; rien à reprendre tel quel.
- **Tâches** : `TasksScreen.tsx` (1 690 l., `/tasks`, famille `jour`, fiche **H03 Missions et tickets**, LOT-01). Seconde entrée dans l'espace ; DEV-projets y lit les tickets d'un dépôt (*à confirmer* : un champ qui relie un ticket à un dépôt n'existe pas encore).

### 3.3 Automatisations

- **Moteur de l'équipe** : `src/state/useAutomations.ts` (164 l.) — collection `automations`, **un** déclencheur (`formAnswer`, `invoiceOverdue`, `ticketOpened`, `prospectWon`, `stockLow`) et **une** action (`task`, `logbook`) par règle ; identifiants déterministes (`auto-<règle>-<source>`) pour que deux postes n'écrivent jamais deux fois. Exécuté par `AutomationsRunner.tsx` dans la mise en page (tant qu'un poste est ouvert). Écran : `AutomationsScreen.tsx` (425 l., `/outils/automatisations`, famille `outils`, fiche **H20**, LOT-07).
- **Moteur du bureau Supervisor** : `src/bureaux/donnees/regles.ts` et `executerRegles.ts` (QUAND / ALORS / SAUF, rejouable sur 30 jours de relevés du parc). Second moteur, propre à La Garde : **ne pas le dupliquer** ni le mélanger.
- **Ce qui manque pour DEV-editeur** : branches SINON et suites PUIS (plusieurs actions), déclencheur « courriel reçu » (connecteur Messagerie, LOT-12), déclencheurs planifiés (« Tous les jours à 08:00 »), journal des exécutions daté avec essais, mode Local / API par flux.
- **Prêt** : `journal.ts` (journal daté, essais à part, compteurs, pause après 3 échecs, temps gagné, résumé « 9 flux sur 12 ») et `planification.ts` (déclencheurs planifiés locaux, rattrapage au réveil du poste).

### 3.4 Planification existante

- `src/components/ScheduleControl.tsx` (147 l.) : planification **côté serveur** d'une analyse Scanner ou Comply (une par produit et par URL, cadence en jours) ; l'exécution poste fermé est faite par amn-api. Autre objet : ce lot n'y touche pas.
- Aucune tâche planifiée **locale** générique n'existe : `planification.ts` la fournit (aucune dépendance au serveur).

### 3.5 Sites, SSL et tracker

- `SitesDashboardScreen.tsx` (868 l., `/sites`), `SiteControlScreen.tsx` (684 l.), `TrackerScreen.tsx` (511 l., `/tracker`), `SslScreen.tsx` (238 l., `/ssl`, `toneFor`, `sslSummary`) — tous déclarés dans la famille **`garde`** du registre (fiche MO02, LOT-07 ; seconde entrée CY07, LOT-10).
- Réutilisés par DEV-projets (échéance d'un certificat dans « À regarder aujourd'hui ») et par DEV-serveur (même règle de disponibilité sur 30 jours que `disponibilite30j` du jeu `sites`). Pas de seconde entrée dans l'espace Développement (absents de la liste de `07-ESPACE-DEV.md`).

### 3.6 Sous-modules réutilisés (une seconde entrée, rien de plus)

| Fiche | Module | Écran actuel (route) | Famille du registre | Lot propriétaire |
|---|---|---|---|---|
| H20 | Automatisations | `AutomationsScreen` (`/outils/automatisations`) | `outils` | LOT-07 (S6) |
| H21 | Connecteurs | sections de `SettingsScreen` (extensions, Ollama, Whisper ; *à confirmer*) | — | LOT-07 (S6), modèle LOT-12 (S9) |
| H24 | Coffre-fort | `VaultScreen` (`/vault`) | `outils` | LOT-07 (S6) |
| H03 | Missions et tickets | `TasksScreen` (`/tasks`) | `jour` | LOT-01 (S2) |
| ME05 | Base de connaissances | `KnowledgeScreen` (`/knowledge`) | `ecrire` | LOT-03 (S5) |
| MO03 | Sauvegardes | `DataSection` des Paramètres (`/outils/donnees` pour l'import et l'export ; *à confirmer*) | `outils` | LOT-07 (S6) |

Ils gardent leurs fiches, leurs écrans et leur lot. LOT-11 ne les modifie pas et ne les redessine pas.

## 4. Écran par écran

Légende : **Existant** = ce que le dépôt fait aujourd'hui ; **Manque** = ce que la fiche demande et que le modèle réel n'a pas ; **Prêt** = ce que la logique couvre déjà ; **Attend** = la dépendance qui bloque.

### DEV-ensemble · Vue d'ensemble (proposition, nouveau)
- **Existant** : repli générique `/ensemble/:famille` (socle v4, `PageEnsembleFamille`).
- **Manque** : la route `/ensemble/developpement` n'est pas l'un des **sept hubs** de `src/refonte/substitutions/hubs.ts` (liste fermée, `fauteDeHub` refuse les autres) ; la famille `developpement` n'existe pas dans le registre.
- **Attend** : décision du CO (8e hub, ajouté par S0) ; validation de la fiche par Harun (aucune image).

### DEV-projets · Projets de code (nouveau)
- **Existant** : le Studio (sites des clientes), les projets de l'équipe (MJ01), les tickets (H03), le suivi des certificats (SSL).
- **Manque** : tout le modèle **dépôt** (nom, branches, commits datés, langages, état des tests, cible), le lien ticket ↔ dépôt, le lien dépôt ↔ pièce du Studio.
- **Attend** : le **connecteur Code** de LOT-12 (Git local ou forge auto-hébergée d'abord ; GitHub / GitLab en option). Aucun jeton ne passera par l'écran.

### DEV-deploiements · Déploiements (mixte)
- **Existant** : le rail des mises en ligne et les points bloquants du Studio (`Livraison.tsx`), le budget de poids (`Performance.tsx`).
- **Manque** : l'exécution d'un pipeline, les étapes datées, les cibles, les planifiés, le journal d'un déploiement.
- **Prêt** (`deploiements.ts`) : les 5 étapes dans un ordre fixe ; machine à états (`avancer`) qui refuse une étape avant les précédentes, fige une étape finie, saute la suite après un échec, sait annuler ; état global ; **durée mesurée de bout en bout** (la maquette affiche 113 s d'étapes pour « 1 min 48 ») ; pastilles « Réussi en 1 min 48 », « Échec à l'étape Tests », « En cours · Construction », « Annulé » ; historique des 4 derniers ; **« Revenir »** = dernière version réussie antérieure, même dépôt, même cible (pour une ligne en échec : ce qui est en ligne) ; échecs **non repris** ; sous-titre « 9 cette semaine · 1 échec » (depuis lundi, Paris) ; barres par jour sur 14 jours avec le jour d'échec ; « En ligne maintenant » avec âge court ; planifiés « 2 à venir » ; adaptateur du rail du Studio (`depuisStudio`) ; **cible « Interne » inerte** (`DISTRIBUTION_INTERNE_OUVERTE = false` : la version se prépare et s'arrête avant la mise en ligne ; aucun tag `v*`, aucune Release).
- **Attend** : le **connecteur Hébergement** de LOT-12 (notre serveur d'abord ; Vercel, Render, Netlify en option) et amn-api pour l'exécution planifiée poste fermé. L'adaptateur traduira leurs événements en appels à `avancer`.

### DEV-serveur · Serveur et santé (nouveau)
- **Existant** : les sauvegardes (MO03, jeu `sauvegardes`), la disponibilité des sites (jeu `sites`).
- **Manque** : tout : mesures (processeur, mémoire, disque, réseau), services déclarés, actions « Relancer » et « Redémarrer », coût du mois.
- **Attend** : **LOT-13** (quel serveur, quels services, quel coût ; décision en décembre, SRV en pause) et **amn-api** (mesures et actions, jamais depuis le poste). L'écran aura un état « serveur non branché ». Aucune logique écrite : les règles (disponibilité, projection du disque) sont dans la fiche, à coder quand le modèle des mesures sera fixé.

### DEV-editeur · Éditeur de flux (mixte)
- **Existant** : moteur et écran de H20 (voir §3.3).
- **Manque** : graphe de blocs (Quand / Si / Alors / Sinon / Puis), essai sans effet, mode par flux, déclencheurs courriel et planifié.
- **Prêt** : `journal.ts` (`noter` avec masquage et purge à 90 jours, `executionsDuMois`, `derniereExecution`, `compteursDuJour`, `echecsDeSuite` / `doitSeMettreEnPause`, `parJour`, `minutesGagneesDuMois`, `resultatTest` « Test sur 3 courriels : réussi », `resumeFlux` « 9 flux sur 12 tournent seuls », `partLocaleDuMois`) ; `planification.ts` (quotidien avec jours, intervalle, passage unique ; heure de Paris, heure qui manque et heure double ; prochain et précédent passage ; **un seul rattrapage** au réveil du poste, dans une fenêtre de 12 h, jamais avant la création ; libellés « Tous les jours à 08:00 », « Chaque nuit à 03:00 », « Toutes les 15 min »…).
- **Attend** : l'extension du moteur de H20 (branches, suites), **à décider avec S6** par le CO ; LOT-12 pour le mode API et le déclencheur « courriel reçu ».

### DEV-couts · Coûts et API (nouveau)
- **Existant** : l'état des connecteurs (H21 ; jeu `connecteurs` : nom, état, dernière synchro, sans clé).
- **Manque** : mode Local / API, coût (tarif, source, date), compteurs de consommation, plafond, historique des paiements.
- **Attend** : **le modèle de LOT-12 (S9)**. Pas de logique propre écrite pour ne pas créer un second modèle des connecteurs ; seule `partLocaleDuMois` (journal) est prête, à confronter à la définition de S9.

### DEV-modeles-sites · Modèles de sites (nouveau)
- **Existant** : rien dans le dépôt ; le prototype v4 est complet (recherche, puces, aperçu isolé, code, copie, ajout local).
- **Manque** : le catalogue des 8 modèles livrés (contenu à relire par Harun) ; l'habillage néon ; la famille (Développement ou Créer et produire, §5).
- **Prêt** : rien encore. *Proposition* : la logique de la bibliothèque (puces triées, recherche par mots, poids en Ko, lignes) n'a aucune dépendance ; elle peut s'écrire avant le feu vert si le CO le souhaite.

## 5. Constats à porter au CO

1. **Seconde entrée et registre.** `check:navigation` refuse une **vue en double** : H20, H21, H24, H03, ME05 et MO03 ne peuvent pas être redéclarés dans une famille `developpement`. La seconde entrée passe donc par la **sous-liste de la barre latérale** (coquille, S0) ou par un champ « aussi dans » du registre (S5). **Décision du CO.**
2. **Teinte de la famille.** `declarerFamille` n'accepte qu'une des **sept** teintes (`Famille` de `src/socle/familles.ts`) ; La Garde a pris celle des Outils. Le socle v4 connaît bien `developpement` dans `FAMILLES_COULEUR` (`--socle-fam-developpement-a|b`), mais le registre ne le lit pas. Proposition : que le registre accepte une `FamilleCouleur`, sinon prendre `outils` comme La Garde. **S0 / S5, par le CO.**
3. **Huitième hub.** DEV-ensemble demande `/ensemble/developpement` dans `HUBS` (`src/refonte/substitutions/hubs.ts`, socle v4) : à ajouter par S0. Sinon la vue d'ensemble reste sur le repli générique.
4. **Moteur de H20.** Les blocs SINON et PUIS de DEV-editeur demandent d'étendre `AutomationData` (plusieurs actions, une branche « non »). C'est le moteur de LOT-07 : à décider avec **S6**, sans créer un troisième moteur.
5. **Distribution interne.** La cible « Interne » de DEV-deploiements est **inerte** dans la logique (`DISTRIBUTION_INTERNE_OUVERTE = false`) tant que DIST n'est pas décidé ; la changer est une décision de Harun.
6. **Entrée « Développement » dans la barre latérale** (au-dessus de « Surveillance », avec ses signaux) : à poser par S0 dans la passe finale v4 ; absente de `refonte-socle` @ `db7e33b`. Les images montrent une barre simplifiée (13 lignes dépliées) : écart accepté, la coquille du socle l'emporte (`00-COMMUN.md` §1).
7. **Écarts de maquette à trancher** (détail en rubrique 13 des fiches) : h1 « Éditeur d'automatisation » contre menu « Éditeur de flux » ; « 5 connecteurs sur 7 tournent gratuitement » contre 4 lignes « Local » ; parcours « Créer et produire » de DEV-modeles-sites ; « Redémarrer » en bouton primaire.

## 6. Dépendances

| Dépendance | Ce qui l'attend | Ce qui est fait en attendant |
|---|---|---|
| **LOT-12 (S9)** : modèle des connecteurs (catalogue, mode, état, coût, plafond), connecteurs Code, Hébergement, Messagerie | DEV-projets (dépôts), DEV-deploiements (exécution), DEV-couts (tout), DEV-editeur (mode API, courriel reçu) | logique sans connecteur (déploiements, journal, planification) ; états « à brancher » écrits dans les fiches |
| **LOT-13 (SRV, en pause)** : le serveur | DEV-serveur (tout), cible « Serveur AMN » | fiche avec état « serveur non branché » |
| **amn-api** : mesures et actions serveur, exécution planifiée poste fermé, stockage chiffré des clés | DEV-serveur, déploiements planifiés, flux qui doivent tourner poste fermé | planification **locale** avec rattrapage au réveil |
| **Socle v4 (S0)** : entrée de barre latérale, 8e hub, teinte de famille | tous les écrans (construction) | aucun composant visuel |
| **S6 (LOT-07)** : moteur de H20 | DEV-editeur (branches) | journal et planification réutilisables par H20 |

## 7. Règles posées par défaut (propositions des fiches, constantes nommées du code)

- **Déploiements** : 5 étapes fixes (`ETAPES`) ; durée = mesure de bout en bout ; « Revenir » = dernière réussie antérieure, même dépôt, même cible ; un échec ne compte plus une fois repris ; histogramme sur 14 jours ; historique de 4 lignes ; `DISTRIBUTION_INTERNE_OUVERTE = false`.
- **Journal** : conservation 90 jours (`CONSERVATION_JOURS`), 2 000 lignes (`LIGNES_MAX`) ; pause automatique après 3 échecs réels de suite (`SEUIL_PAUSE_AUTO`) ; un essai ne compte jamais ; un résultat « ignoré » ne remet pas le compte d'échecs à zéro ; « n flux sur m » compte les brouillons dans m (le jeu fictif donne 9 sur 12, comme l'image) ; tout message est masqué (`masquerSecrets`) avant d'être gardé.
- **Planification** : heure de Paris ; heure qui manque décalée d'une heure, heure double = la première ; un seul rattrapage, dans une fenêtre de 12 h (`FENETRE_RATTRAPAGE_MIN`) ; intervalle de 5 minutes au moins (`INTERVALLE_MIN`) ; « Chaque nuit » pour une heure entre 00:00 et 05:59.

## 8. Données fictives : ce que SIM peut ajouter (à demander par le CO)

Aucun jeu n'existe pour l'espace Développement. Les 51 contrôles tournent sur des cas écrits à la main et sur le jeu `automatisations`. Pour construire et capturer les écrans :

- `depots` : nom, description, branche suivie, langages (parts), état des tests, commits datés sur 31 semaines, cible, lien éventuel à une pièce du Studio et à des tickets.
- `deploiements` : dépôt, branche, quoi, version, cible, par (prénom), lancé à, 5 étapes datées (dont des réussis, un échec, un en cours, un annulé), et `deploiementsPlanifies`.
- `executions` : journal d'exécutions des `automatisations` (dates, résultat, mode local / API, essais, action humaine), cohérent avec `executions` et `executionsMois` du jeu existant.
- `tachesPlanifiees` : quelques planifications (quotidien, semaine, intervalle, une fois) avec dernier passage.
- `mesuresServeur` (24 h, toutes les 10 min) et `servicesServeur` (nom, détail, disponibilité sur 30 jours, état), **sans** nom d'hôte, adresse ni port.
- `connecteurs` complétés (après le modèle de S9) : mode, modèle de coût, consommation du mois, limite ; `plafondMensuel` ; `paiementsConnecteurs` sur 6 mois.
- Les **modèles de sites** ne sont pas des données de SIM : c'est du contenu (8 pages du prototype), à relire par Harun.

## 9. Construction (étape 3, au feu vert du CO)

- Écrans dans `src/refonte/developpement/` (`.tsx`), branchés par le mécanisme de substitution (une déclaration du lot) et le fichier de famille du registre (`declarations/developpement.ts`, selon les décisions du §5).
- Couleurs : `data-famille-active="developpement"` posé par la coquille → `var(--fam-a)` / `var(--fam-b)` (`#6EA8FF` / `#5EE6A8` venus du socle), jamais écrits à la main.
- Un commit par écran ; captures à 1440 × 900 sur `build:web` local (127.0.0.1, API d'essai, données fictives), comparées aux images v4 ; T1 vérifie. Images et captures hors du dépôt.
- La garde `check:developpement` relâchera alors sa règle « aucun `.tsx` » pour les écrans déclarés, et ajoutera leurs contrôles (textes des fiches, aucune valeur des images en dur).

# Refonte vivante — statut

> Tenu par le CO. Une session ne modifie que **la section de son lot** dans « 7. Écrans » (une ligne par écran) ; tout le reste est au CO. Règles : [`REGLES.md`](REGLES.md).

## REPRISE (à lire en premier après une compaction ; tenu par le CO, réécrit à chaque tour)

Mode : **continu et autonome** (carte blanche de Harun, 14 nov.), jusqu'à son « stop ». Point pour Harun : [`POINT-HARUN.md`](POINT-HARUN.md). Intégration : `/home/user/amn-desktop-integration`, branche `claude/refonte-vivante` @ `baff3a3`.

**Si la limite d'utilisation coupe le CO** : à la reprise (un message de Harun, une session, ou le réveil programmé), relire ce bloc, faire `git fetch` des branches `claude/refonte-*`, puis reprendre la boucle (lister, lire, contrôler, fusionner, répondre, mettre à jour). Réveil du CO : `send_later`, toutes les 45 min environ, réarmé à chaque tour.

| Session | Identifiant | État | Prochain geste |
|---|---|---|---|
| S0 Socle | `session_01SJe828c2W5EnkMY4fhFY6z` | passe finale v4 finie (`888f7a0`) | corriger ce que T1 signale ; puis la baisse des échecs connus |
| T1 Qualité | `session_011oPZg1pe7zhmGFtd6x3W6h` | passage 2 sur `888f7a0` en cours | son verdict → fusion du socle v4 et allumage (§1.9) |
| S6 Sécurité | `session_01RHV8Xq2txWkfjAusKvq9DG` | LOT-07 en préparation ; une étape de sécurité attend amn-api | couture H20, tarifs H21 (§1.26) |
| SIM | `session_011UF2ufZg9moGv2rRZFRuf7` | chargeur vers l'API d'essai en cours | livrer → mettre à jour `LANCER-EN-LOCAL.md` |
| DS | `session_01TZGDvVWristJnnPK59rruY` | préparation de LOT-04 fusionnée (§1.29) ; **sans dossier v4** | relire ses points [fiche] dès qu'il a les zips |
| S5 | `session_012jWErBSSkcoVaU3iN895bQ` | LOT-03 fusionné (§1.29) | registre (12 vues vers `creer`), puis LOT-05 |
| S1 | `session_01CLLXtV5QPhZ4bZZRf6kdha` | décisions reçues (§1.28) ; lecture du v4 | relire et fusionner sa reprise |
| S7 | `session_01C5DAW2srkqgCKRjEKHH8Hy` | préparation v4 fusionnée (`526cd63`) | attend le socle v4 |
| S8 | `session_01C5DAVxfgf5v6YVweAwVqBj` | en pause | feu vert de l'étape 3 au socle v4 ; jeux à commander à SIM |
| S9 | `session_01C5DAVygXYax6Q7g436TPQx` | LOT-12 fini (§1.26) | rien |
| S2, S3, F1 | `session_014ZkF6SeGRNi6NR3uEsjM5q`, `session_01FBSpK6n1yYtYXYyxbLAuBV`, `session_01VZHqP3gvzrtnpgsTrrKguV` | arrêtées | relancer au socle v4 (prompts : `PROMPTS-11NOV.md`, §1.21) |

**Décisions provisoires en cours** (révisables par Harun) : arrondi et régime de TVA, seuils de l'argent (§1.29) ; valeurs de départ des connecteurs (§1.22 n° 3) ; plafonds de relance 3 et 1 par jour (§1.28 n° 4) ; seuils de charge (validés, §1.20). Liste « À décider par Harun » : `POINT-HARUN.md`.

**Échecs connus à faire baisser** (gardes rouges, aussi sur `main` selon S0, à confirmer par T1) : migration, encres, xss, visite, support. Aucune fusion n'en ajoute un nouveau.

## Journal des décisions du CO (une ligne chacune, la plus récente en haut)

- 14 nov. : LOT-04 et LOT-03 préparations fusionnées (`baff3a3`). TVA par ligne comme `money.ts` (provisoire), régime de TVA réglable (provisoire), numérotation existante, archives sans nouvelle collection (§1.29).
- 14 nov. : LOT-06 préparation v4 fusionnée (`750d8b3`). Les 12 vues à rapatrier dans `creer` sont listées par S7, et S5 fait le déplacement.
- 14 nov. : messages directs du CO aux sessions, règle dans `REGLES.md`.
- 14 nov. : LOT-02 préparation fusionnée ; fidélité aux deux formules ; un seul moteur de relances (§1.28).
- 14 nov. : LOT-06, quinze réponses ; aucune nouvelle collection synchronisée sans Harun (§1.27).
- 13 nov. : LOT-12 fini ; couture H20 et tarifs H21 confiés à S6 (§1.26).
- 13 nov. : passe finale v4 de S0 acceptée, passage 2 de T1 (§1.25).
- 12 nov. : modules de F1 (§1.21), seuils de charge (§1.20), LOT-11 et LOT-12 (§1.17 à §1.23), reprise après 18h (§1.18, §1.24).

- Branche d'intégration : **`claude/refonte-vivante`** (décision du 31 oct., §1.1). Base `main` @ `630ef45`.
- Dernière mise à jour : 2026-11-14, nuit. Mode continu du CO : bloc REPRISE et journal en tête. LOT-06 préparation v4 fusionnée.
- LOT-00 (socle v2) est fusionné (`488cdcc`), avec les 4 commits de S5. **Le socle v3 s'y ajoute avant la construction visuelle des lots** (S0 a ses consignes). D'ici là, chaque lot prépare et construit sa logique : §5.
- Fusionnés aussi le 1er nov. : T1 (API d'essai, bac à sable, contrôle de fidélité) et les données fictives de SIM (100 jeux, `4fe559b`), avec `check:donnees` en CI (87 contrôles).
- Gardes locales sur `refonte-vivante` : `typecheck`, `typecheck:business`, `lint` et les 55 contrôles sans navigateur de `editions.yml` verts.
- Sources : le dossier de construction **v3** (`AMN-refonte-v3-CO`) remplace le précédent. Il n'est pas committé (dépôt public). Les lots 01 à 10 démarrent avec leur zip v3 (`AMN-refonte-v3-LOT-xx-….zip`, images comprises) et leur prompt v3.

## 1. Décisions du CO (31 oct., complétées le 1er nov.)

### 1.1 Branche d'intégration : `claude/refonte-vivante`, pas `claude/refonte-design-socle`

Vérifié :

- `refonte-design-socle` @ `e97f479` (24 oct., un seul commit : « Refonte DS : jetons noir et gris, briques, coquille commune, Accueil recâblé ») est **1 commit devant** `refonte-vivante` et 0 derrière. C'est un descendant direct, pas une branche concurrente.
- Sur ce commit : `typecheck`, `typecheck:business`, `lint` et les 43 contrôles sans navigateur de `editions.yml` passent. `check:encres` (hors CI) échoue comme sur `refonte-vivante` : 4 copies de jeton dans `src/refonte/garde/equipes.ts` (S3), rien de nouveau.
- Fusions simulées avec `design-socle` : T1, SIM et F1 sans conflit ; S5 (4 commits postérieurs) : 1 conflit, `src/socle/i18n.ts` ; S2 (5 commits postérieurs) : 5 conflits, tous dans l'Accueil.

Décision :

- **`refonte-vivante` reste la branche d'intégration.** Elle porte S0 à S3, S5 et S2 fusionnées, la coordination (`docs/refonte/`) et l'historique de CI. Une branche non relue ne devient pas une base.
- **LOT-00 se construit sur `claude/refonte-socle`, créée depuis la pointe de `refonte-design-socle` (`e97f479`).** Le travail de DS est réutilisé tel quel, sans rien refaire. Comme la branche descend de `refonte-vivante`, sa fusion sera directe.
- `refonte-design-socle` est **gelée** : plus personne n'y pousse, ses évolutions passent par `refonte-socle`.
- Les lots 01 à 08 partent de `refonte-vivante` **après** la fusion de LOT-00, jamais avant.
- S0 a commencé LOT-00 : le CO ne voit que `e97f479` sur le serveur. Tout ce que S0 a fait depuis n'est visible qu'une fois poussé sur `claude/refonte-socle`.

### 1.2 Écarts entre le travail de DS et le nouveau socle (à corriger par LOT-00)

Comparaison de `src/socle/noir.css` avec `01-SOCLE-DESIGN.md` (le socle fait foi) :

- **Conformes** : fond `#0C0C0D`, latéral `#101011`, carte `#161617` → `#131314`, champ `#131314`, bordures `#232325` / `#1D1D1F` / `#19191B` / `#222224` / `#28282B`, T1 `#EDEDED`, plancher T4 `#8A8A8E`, 7 familles, états succès / critique / info, gabarits 252 et 60.
- **À corriger** :
  - ATTENTION vaut `#D9A27A` (la couleur de la famille Créer) ; le socle dit `#E0B35A` ;
  - le texte courant T2 `#C4C4C8` manque : DS a `#A0A0A5` comme « secondaire », qui est le T3 du socle ;
  - bordure de champ `#6E6E73` ; le socle dit `#5A5A60` ;
  - la 8e famille « La Garde et la supervision » `#D6D6DA` manque ;
  - rayons bouton / champ : 10 / 9 dans `noir.css`, 9 / 10 dans le socle ; sous-carte 11, tag 6 et ticket 12 absents ;
  - bordures `#212123`, `#2E2E31` et le pointillé `#2E2E33` absents ;
  - barre Ajmani : 48 px dans `noir.css`, 46 px dans le socle (§3).
- **Composants du §4** : d'après la liste des fichiers du commit, il manque au moins Toggle, Tabs, Segmented, Table, Ticket et colonne de kanban, Donut, graphiques, TimelineItem, les quatre cartes ludiques et Suggestion. À vérifier par S0.
- La nouvelle coquille de DS est **éteinte par défaut** (Paramètres › Nouvelle coquille). LOT-00 décide quand elle devient la coquille de l'édition interne.

### 1.3 Refondre un écran sans changer l'édition cliente

Les écrans à re-habiller vivent dans `src/screens/**`, **partagés avec l'édition cliente**, et sont montés un par un dans `appRoot.internal.tsx` (164 routes). Huit lots y touchant en parallèle donneraient des conflits garantis et un risque de changer l'édition cliente. Règle :

1. Un écran refondu est un **nouveau composant** dans `src/refonte/<lot>/`, qui réutilise les hooks et l'état existants (`src/state/**`, `src/lib/**`). **`src/screens/**` n'est pas modifié** : il continue de servir l'édition cliente.
2. **LOT-00 livre le mécanisme de substitution** : un fichier de déclaration par lot, ramassé automatiquement (comme les familles de S5). Il conserve la route, la garde `ModuleRoute` et la variante « session de support cliente ». Son jumeau `.business` ne fait rien. Piste d'implémentation : un seul point dans la coque interne (`AppLayout`, monté par l'édition interne seulement), au lieu de réécrire 164 routes.
3. Avant que ce mécanisme soit fusionné, **aucun lot ne touche `appRoot.internal.tsx`**. Les écrans NOUVEAU passent par le registre de S5 (`nouveau`), déjà en place.
4. Même règle pour les écrans système partagés avec l'édition cliente (G06 connexion, H40 notifications, H41 ⌘K, H42 démarrage) : couture `@edition/*`, jumeau cliente inerte.
5. **Preuve exigée à chaque fusion** : paquet client identique (`scripts/qualite/comparer-paquet-client.mjs` de T1) et `check:business` vert.
6. Le registre de S5 a un fichier par famille (`src/refonte/modules/declarations/<famille>.ts`), ce qui donne un fichier par lot : jour = LOT-01, contacts = LOT-02, ecrire = LOT-03, argent = LOT-04, echanger = LOT-05, creer = LOT-06, outils = LOT-07, garde = LOT-08, et `cyber` (nouveau fichier, famille contextuelle) = LOT-10. Pas de collision.

### 1.4 Mobile et tablette (LOT-09) : PWA responsive, même code

**Décision : on continue la PWA existante** (`docs/PWA.md`), sans second code ni nouvelle dépendance (règle 9 du dossier).

Le dépôt a déjà ce qu'il faut : le même renderer tourne en PWA installable (manifeste, `sw.js`), le pont navigateur parle à amn-api avec la synchro temps réel, `fileEnvoi.ts` et `EnvoiEnAttente` font la file d'attente hors ligne, `src/assistant/voix.ts` la voix, `useEtroit` le responsive, et `check:mobile`, `check:largeur` et `check:cibles` mesurent déjà le téléphone.

- Les écrans MB et T sont des vues propres à l'édition interne, branchées par le même mécanisme de substitution que les autres lots (§1.3). Seuils proposés : téléphone < 768 px, tablette de 768 à 1199 px (rail 76 px, vue scindée), bureau ≥ 1200 px. LOT-09 peut les ajuster.
- Cibles tactiles ≥ 42 px (04-C : MB04 et MB05 sont à 32-34 px sur les images).
- **Limites assumées en PWA** : scan de reçu (MB07) par la caméra du navigateur, sans scanneur natif ; dictée (MB05) par `voix.ts`, à tester sur iPhone avant de promettre.
- **MB09 (widgets et écran verrouillé)** : non faisable en PWA. Premier jet = connexion, démarrage, notifications web avec **aperçu masqué par défaut** (04-B #6). Les widgets natifs sont **hors du premier jet** (*confirmé par Harun le 1er nov.*) ; si Harun les veut, l'étape suivante est une enveloppe Capacitor autour du même build web, décidée à part. React Native (second code) est écarté.
- Avant MB08 (La Garde mobile) et MB03 (Argent) : vérifier écran par écran que les droits du jeton web (`WEB_OPERATOR_TOKEN`) suffisent. S6 relit ce point en privé.
- Pas de mode édition du tableau de bord sur téléphone au premier jet (04-B #5).
- LOT-09 démarre quand les lots 01 à 08 sont fusionnés. Il reprend le tiroir mobile resté ouvert chez S1 (`PanneauMobile`, `MobileBottomNav`).

### 1.5 Décisions par défaut (`04-ECARTS-MAQUETTES.md`, section B, points 1 à 8), appliquées jusqu'à contre-ordre de Harun

| # | Sujet | Décision appliquée |
|---|---|---|
| 1 | Banque | **Lecture seule. L'application n'émet jamais de virement** : elle prépare un ordre ou un rappel que la personne exécute dans sa banque. *Confirmé par Harun.* |
| 2 | Série quotidienne | Règle de L01 : la journée compte à la clôture des 3 priorités |
| 3 | Libellés d'état de La Garde | Sain (vert), Attention (orange), Critique (rouge), une seule table |
| 4 | Rondes (H33) | Reproduire l'image ; la « Proposition B » attend l'accord de Harun |
| 5 | Mode édition du tableau de bord sur mobile (MB06) | Absent au premier jet |
| 6 | Écran verrouillé et widgets (MB09) | Aperçu masqué par défaut |
| 7 | Anneau d'objectif (G08) | Orange, comme l'image |
| 8 | Libellés « Nouveau » | Base de connaissances = mixte ; dictée = barre Ajmani et mobile |

Les points 9 à 15 sont **validés** (§1.10). Les règles A1 à A9 de la section A du fichier 04 valent aussi pour tous les lots : chiffres calculés depuis les données réelles, un seul bouton primaire par page plus celui de la suggestion d'Ajmani, colonne droite de 340 px, format français, pastille de La Garde selon N02 §6.2, aucun avatar pour Ajmani.

### 1.6 Direction design (verrouillée par Harun) — **couleurs et vouvoiement remplacés par la v4 (§1.14)**

Sobre, noir et gris, ultra professionnel, ludique premium (cases à cocher, « x sur y fait », anneaux, séries, jalons, « Boîte à zéro »). **Aucun robot, aucune mascotte, aucun personnage** : Ajmani est une barre de texte en bas de page (⌘J) et une palette ⌘J. Vouvoiement, français. En v3 (§1.10), la barre latérale n'a plus de pastilles : la couleur d'une famille n'apparaît que sur l'icône de la famille active ; les teintes des familles et les accents d'équipe restent des accents rares sur fond noir et gris.

### 1.7 La famille Cyber dans la barre latérale (LOT-10) — **remplacé par la v3 (§1.10)**

> En v3, Cyber est **toujours visible** (section SURVEILLANCE, avec un compteur d'alertes du SOC) et dépliée seulement sur ses écrans : plus de famille « contextuelle ». Ce qui reste valable ci-dessous : Cyber n'entre ni dans les 7 familles de base ni dans le total « 101 », son fichier de déclaration est `declarations/cyber.ts`, et S0 l'ajoute au socle v3.

État du socle (`claude/refonte-socle`) :

- `BarreLaterale` reçoit `familles` (les 7 de base) et `garde` (la 8e, sous un filet).
- `src/socle/familles.ts` ne connaît que les 7.
- La Garde a son jeton `--socle-fam-garde` (`#D6D6DA`). Le fichier 05 donne la même valeur à Cyber : les deux se distinguent par l'**icône** (bouclier, cible), pas par la couleur.

Comment l'ajouter sans changer les 127 autres écrans :

1. **Socle** (S0, dans le socle v3 de §1.10, avant que LOT-10 ne démarre) :
   - `BarreLaterale` gagne une prop facultative `contextuelle?: FamilleLaterale | null`, avec son icône. Elle s'affiche sous le bloc de La Garde, dépliée. Absente ou `null`, le rendu est **identique à aujourd'hui** : `check:socle-coquille` le prouve par un rendu statique avec et sans.
   - Jeton `--socle-fam-cyber: #d6d6da` dans `noir.css`. La teinte `cyber` est acceptée par `FamilleLaterale` comme celle de La Garde, **sans** l'ajouter aux 7 familles de base : D02 et « Tous les modules (101) » ne bougent pas.
   - `src/refonte/coquille/donnees.ts` ne passe `contextuelle` que si le module courant appartient à une famille déclarée « contextuelle » au registre.
2. **Registre** (LOT-10) :
   - un fichier `src/refonte/modules/declarations/cyber.ts`, famille marquée `contextuelle: true`, avec les sous-éléments Red Team, Blue Team, SOC, Veille, OSINT et Missions ;
   - hors des comptes de D02 ;
   - LOT-10 adapte `check:navigation` pour exclure les familles contextuelles des totaux.
3. **Liens** : « Ouvrir Cyber » sur F70 est fait par LOT-08 (c'est son écran) ; le renvoi de CY04 vers La Garde est fait par LOT-10.

### 1.8 Les 15 questions de S3 (note `docs/refonte/preparation-garde.md`, branche `claude/refonte-garde`) — **décidé** le 1er nov.

**Règle générale : on habille ce qui existe, rien de neuf côté serveur dans ce lot.**

- Ce qui se calcule depuis les données existantes est calculé dans l'interface.
- Ce qui demande une donnée absente s'affiche « non disponible », avec la raison. Cela devient une demande à amn-api, notée dans la section du lot, et ne bloque pas l'écran.
- En cas de doute : la solution la plus simple, notée.

| # | Question | Règle |
|---|---|---|
| 1 | Route du hub F70 | `/ensemble/garde`, la route générique des « Vue d'ensemble » posée par LOT-00, que F70 remplit. `/garde` (Salle) et `/tour` restent inchangés. Même règle pour F10 à F60 : `/ensemble/<famille>`. |
| 2 | Un seul score de maturité | `scoreDe` (sur 100) fait foi pour F70, N02, H30, H31 et H34. Niveau 1 à 5 = tranches de 20 points. Les six domaines de H34 = les six signaux de `maturiteSoc.ts`. Pas de nouveau référentiel. |
| 3 | État et score par organisation | Règle N02 §6.1 calculée localement : le plus grave du score, des alertes ouvertes et du retard de ronde. « Dernière ronde » d'une organisation = dernière entrée de ronde de `garde.journal({ org })`. Rien côté amn-api. |
| 4 | Libellés d'état | **Sain / Attention / Critique** (04-B #3) sur tous les écrans refondus. Les anciens écrans et `src/i18n` restent inchangés. |
| 5 | Déclarer un incident ; prise en charge | Pas d'API serveur : bouton présent mais **désactivé**, avec la raison, plus une demande à amn-api. Pas d'incident local qui ne serait vu que d'un poste. Prise en charge : un mécanisme par objet. `acknowledgeIncident` pour un incident, `garde.prendre` pour une remontée. Les écrans refondus n'écrivent plus `suivis`. |
| 6 | Gravités et « alerte ouverte » | Trois niveaux affichés : Critique (critique / critical), Moyenne (haute, moyenne, normale, warning), Faible (faible, info). « Alerte ouverte » = remontées ouvertes de la Garde + incidents non résolus + alertes Cyber non prises en charge, chaque source comptée une fois, avec sa source affichée. MG02 lit `garde.journal` (`useJournalGarde`), sans troisième accès. |
| 7 | Astreinte (N03) | Hors du lot. « Qui veille » = les absences et retours existants (`garde.absence`, `garde.retour`). « Mode astreinte » absent, noté en écart. |
| 8 | Silence de nuit ; salles | Le réglage du silence de nuit va dans N03 (Veille H24), puisque `/garde/ajmani` ouvre désormais ⌘J (commit de S5 repris par LOT-00). N02 est la page de pilotage ; la Salle de situation de S3 reste l'écran de veille. |
| 9 | Périmètre Cyber | Zones de LOT-08 et LOT-10 élargies à `src/bureaux/cyber/**`, avec le partage de `REGLES.md` : LOT-08 possède `FicheIncident.tsx`, `Alertes.tsx` et `JournalAudit.tsx`, LOT-10 le reste. |
| 10 | Le mot « ronde » (H33) | L'écran s'adapte aux gardes du code. « Nouvelle ronde » ouvre le réglage d'une garde existante (`majAgent`). Pas de ronde programmable (la « Proposition B » attend Harun, 04-B #4). |
| 11 | Journal d'accès (H35) | Re-habillage du journal existant (ouvertures de dossiers par l'équipe), avec un titre et une légende qui le disent. « D'où » et « Résultat » : écart, plus une demande à amn-api. |
| 12 | Produits cyber (MG03) | Les produits = les outils existants (Scanner, Comply, SSL). « Client protégé » = organisation cliente qui a au moins un site surveillé (`clientOrgId`). Prix, objectifs et revenu récurrent : « non disponible », plus une demande. |
| 13 | Couleur de la famille | `--socle-fam-garde` (`#D6D6DA`, déjà dans le socle). LOT-08 aligne `declarations/garde.ts` sur ce jeton. |
| 14 | Raccourcis | On prend la touche de la fiche si elle est libre, sinon pas de raccourci (écart noté). On ne déplace jamais un raccourci existant. `⌘ ⇧ I` est libre en production ; `⌘ O` est libre ; `⇧ ⌘ O` reste au sélecteur d'organisation. |
| 15 | Textes | Français mot pour mot. Anglais traduit, avec les mêmes clés, dans `src/refonte/garde/i18n.ts` (le français est typé contre l'anglais, comme partout). |

### 1.9 Quand allumer la nouvelle coquille — **décidé** le 1er nov.

La coquille de LOT-00 est éteinte par défaut (drapeau `amn.coquille`). **Proposition : l'allumer par défaut dans l'édition interne au moment de la fusion de LOT-00**, à trois conditions :

1. T1 a fait un passage sur le paquet interne, coquille allumée : `check:coquille`, `contraste`, `focus` et `mouvement`, sans régression par rapport à `main` ;
2. le réglage « Paramètres › Nouvelle coquille » reste, pour revenir en arrière, jusqu'à la fin de LOT-09. L'ancienne coquille est retirée après LOT-09.

Pourquoi ce moment :

- les 141 maquettes sont dessinées dans la nouvelle coquille, et T1 ne peut comparer à ± 2 px que coquille allumée ;
- chaque lot construit dedans ;
- l'édition cliente n'est pas concernée (couture vide).

Le prix : pendant la transition, les écrans pas encore refondus s'affichent dans la nouvelle coquille. C'est acceptable pour une édition interne à trois personnes. S0 change la valeur par défaut (une ligne de `drapeau.ts`) dans le socle v3, dès que le passage 2 de T1 est propre.

### 1.10 Design v3 (1er nov., validé par le dirigeant dans son ensemble)

Nouveau dossier `AMN-refonte-v3-CO` (141 écrans redessinés, sans images), qui **remplace** le précédent. Identifiants et titres des 141 fiches inchangés (vérifié) ; changent le contenu des fiches, 19 types dans l'index (tous les « re-habillage » passent en « mixte »), les prompts et le socle. Le dirigeant valide l'ensemble.

**Ce qui change**

- **Socle v3 (`01-SOCLE-DESIGN.md` §0)**, prioritaire sur le reste :
  - barre latérale v3 : icônes grises, sections ESPACE / SURVEILLANCE / ÉPINGLÉS, sous-liste de 5 lignes au plus, carte « Aujourd'hui » à la place de « En ligne », bouton « Tous les modules (101) » à côté de la recherche ;
  - couche de mouvement commune (§0.2), coupée par `prefers-reduced-motion` ;
  - police monospace ;
  - composants `LiveDot`, `Caret`, `FilterChips`, `Severity`, `Gauge`, `HeatCell`, `FlowLine`, `InlineSuggestion` ;
  - barre Ajmani v3 (curseur, « Entrée pour envoyer »).
- **Une surface propre à chaque écran** : les 5 archétypes du §5 ne sont plus des gabarits (les briques de `src/socle/ui/archetypes/` restent disponibles, mais aucun écran n'est tenu de s'en servir). Plus de rangée de 4 KPI sur beaucoup d'écrans.
- **Plus de pastilles de couleur** dans la barre latérale : la couleur de la famille n'apparaît que sur l'icône de la famille active. Cela remplace la ligne « petits points de couleur » de la direction du 31 oct. ; les 7 familles et les accents d'équipe gardent leurs teintes ailleurs, en accent rare.
- **Cyber est toujours visible** dans la barre latérale (section SURVEILLANCE, avec un compteur d'alertes du SOC), dépliée seulement sur ses écrans. Cela remplace la famille « contextuelle » du §1.7.
- **Dates fictives des images** : vendredi 30 oct. 2026, 10:42 pour tout le bureau ; mardi 3 nov. 2026 pour Cyber.
- Les écrans mobiles et tablette (H46, MB*, T*) n'ont pas changé.

**Points 9 à 15 de `04-ECARTS-MAQUETTES.md` §B : validés par le dirigeant** (ce n'est plus un défaut à confirmer)

| # | Sujet | Décision validée |
|---|---|---|
| 9 | OSINT (CY06) | Accord signé valide exigé avant toute recherche, même passive |
| 10 | G07 Messagerie | Boîte des **clients** (courriel, WhatsApp, SMS) ; les échanges internes passent par Canaux (MX04). WhatsApp et la passerelle SMS sont des connecteurs de H21 |
| 11 | Téléphonie (H13) | Sans ligne pro branchée : appel dans l'application seulement (repli de la fiche) |
| 12 | Défi d'équipe (L07) | Contribution de chacun = engagement écrit, aucun chiffre individuel |
| 13 | Pastille de La Garde | Un seul état réel (N02 §6.2), identique partout au même instant |
| 14 | Rangées de KPI retirées | Les chiffres utiles sont dans la surface ; ne pas les réintroduire sans accord |
| 15 | Gris intermédiaires | Autorisés pour les illustrations (photos, objets, aperçus), jamais pour le texte ni les états |

Les points 1 à 8 (§1.5) restent des décisions par défaut, sauf le n° 1 (banque) confirmé.

**À ne pas simplifier à l'assemblage** (demande du dirigeant, qui y tient) : le **défi d'équipe L07** (défi de la semaine, jauge, « Ce que chacun apporte », « Aussi en cours », frise des défis passés, célébrations, « Proposer un défi »), les **trophées et paliers** (H02, H04, L01, MB04, CY01, CY04) et les **défis hebdomadaires**. Seules limites : celles qu'il a fixées, soit aucun chiffre individuel, aucun classement, aucune perte de points, aucun reproche. Si une session propose de couper ou d'alléger l'un de ces éléments pour tenir un délai, la réponse du CO est non ; T1 vérifie leur présence à la comparaison à ± 2 px. LOT-01 (S2) en est le gardien ; les trophées de Cyber, de MO02 et de MB04 relèvent de LOT-10, LOT-07 et LOT-09.

**Ce que le CO adapte dans son ordre d'assemblage**

1. **`ModuleTile` n'appartient à aucun lot.** Le prompt v3 de LOT-02 demande de le construire dans F10 et de le partager avec les autres vues d'ensemble. Cela ferait attendre ou dupliquer six lots (les fiches F10 à F60 le déclarent partagé, F70 a sa variante `LiveModuleTile`). **Décision : il entre dans le socle v3** avec `ModuleGroupGrid` (F10, F30, F50), `AddModuleTile` et les petites briques citées par dix lots ou plus (`PageHead`, `IconTile`, `IconButton`, `StatusPill`, `SearchBox`, `AvatarStack`, `AjmaniBar`, `SuggestionCompact`, `FlagUrgent`). S0 les livre ou les aligne sur les briques existantes. LOT-02 ne construit plus `ModuleTile`.
2. **Les hubs F10 à F70 sont sept écrans indépendants**, chacun construit par son lot, au-dessus de la route générique `/ensemble/<famille>` qui reste le repli. Plus de « F10 d'abord » : chaque lot commence par ce qui lui convient.
3. **La carte « Aujourd'hui » de la barre latérale et N01 lisent les mêmes chiffres.** Ils viennent d'un seul calcul, `useAujourdhui` (tâches faites sur prévues, série, prochain rendez-vous, présence), livré par S0 dans `src/refonte/coquille/` ; LOT-01 le lit sans le recalculer.
4. **G07 en boîte des clients** (point 10) et **H13 téléphonie** (point 11) dépendent des connecteurs de H21 (LOT-07, S6, après sa phase 1). LOT-05 construit les écrans et affiche « connecteur à brancher » en attendant.
5. **`check:coquille`** devra mesurer la barre latérale v3 : S0 l'adapte avec le socle v3.

**LOT-00 et le socle v3.** LOT-00 (v2) est déjà fusionné (`488cdcc`). **Le socle v3 s'y ajoute avant que les lots ne construisent leurs écrans** : S0 a ses consignes, sur `claude/refonte-socle`, repartie de `refonte-vivante`. Le CO fusionne dès que les gardes sont vertes et que T1 a passé le paquet client. Il couvre, dans l'ordre : le mouvement et les composants du §0.4, la barre latérale v3 avec la carte « Aujourd'hui » et Cyber, les briques partagées du point 1 ci-dessus, le mécanisme de substitution (§1.3), l'adaptation de `check:coquille`, puis l'allumage de la coquille (§1.9).

**Sources des sessions.** Les lots 01 à 10 démarrent avec leur zip v3 (`AMN-refonte-v3-LOT-xx-….zip`, images comprises) et leur prompt v3 du dossier `prompts/`, pas avec la version précédente. Les fiches v2 d'une session déjà démarrée sont périmées.

### 1.11 Données fictives de SIM (1er nov.) : 100 jeux, règles validées

`claude/refonte-donnees-fictives` @ `4fe559b` est **fusionnée** dans `refonte-vivante` : 75 jeux de plus, **100 au total** (Écrire, Échanger, Créer, Outils, La Garde, Cyber, et les écrans manquants TVA et impôts, paie, tarifs, partenaires, planning, défis). `check:donnees` passe de 55 à 87 contrôles, tous verts, déjà en CI. Fusion sans conflit, rien hors de `src/refonte/donnees/**`, `scripts/check-donnees.ts` et le rapport ; aucune adresse hors `exemple.test`, aucun motif de secret ; `typecheck`, `typecheck:business`, `lint` et les 55 contrôles sans navigateur de la CI verts après la fusion. Rapport : [`rapports/DONNEES.md`](rapports/DONNEES.md). Mode d'emploi : `src/refonte/donnees/LISEZ-MOI.md`.

**Règles validées par le dirigeant** (les écrans peuvent s'y fier) :

1. **État d'une organisation de La Garde** : Sain à partir de 70, à surveiller de 45 à 69, Critique sous 45 ; une alerte Critique ouverte rend l'organisation Critique, une alerte Moyenne ouverte la rend « à surveiller » ; une ronde en retard de plus de 2 intervalles la rend « à surveiller », de plus de 24 h Critique. **Le libellé affiché reste « Attention »** (04-B n° 3 et §1.8 n° 4), pas « À surveiller » : SIM aligne le libellé, le seuil ne change pas.
2. **Niveaux de maturité** : score = points obtenus ÷ points possibles ; niveaux de 1 à 5 par tranches de 20 points (§1.8 n° 2).
3. **Cotisations sociales de la paie fictive = 46 % du net.**
4. **États d'un accord Cyber** : En attente, Valide, Expire bientôt (à 30 jours), Expiré.
5. **Catalogue d'outils Cyber volontairement générique** (9 familles de 6 outils, aucun nom d'outil réel). Un écran qui réclame un nom précis le signale dans la section de son lot ; le CO tranche.

**Limites connues.** Aucun écran ne consomme encore ces jeux : un champ peut manquer. Règle : la session de lot qui manque d'un champ l'écrit dans la section de son lot de `STATUT.md` ; SIM l'ajoute, avec un contrôle, à son passage suivant. Les jeux sont datés du vendredi 30 oct. 2026 à **10 h 15** ; les images v3 supposent **10 h 42**, et **mardi 3 nov.** pour Cyber (§1.10) : à aligner (suite de SIM, n° 1).

**Suite de SIM, dans cet ordre** (SIM enchaîne, elle n'attend rien) :

1. **Aligner les dates** sur les images v3 : 10 h 42 le 30 oct. pour le bureau, mardi 3 nov. pour Cyber. Sans cela, T1 compare des écrans qui ne montrent pas les mêmes jours que leurs images.
2. **Le chargeur vers le bac à sable API** (celui de T1, `scripts/qualite/api-essai.mjs`) : il conditionne les captures de T1 et les essais de tout lot sur des données réelles de l'API. La Garde avec S3 (`scripts/seed-supervision.mjs`).
3. **Les jeux calculés** (trésorerie prévisionnelle H09, bilan de la semaine H04, cockpit client G08, configuration du tableau de bord H25) : sous forme de **valeurs attendues pour les tests**, pas de seconde implémentation. Le calcul reste à la session du lot (DS pour H09, S2 pour H04, G08 et H25), qui le compare aux attendus de SIM.
4. **Volumes « beaucoup » de Cyber** en situation, dès que LOT-10 a un écran.

### 1.12 Mises à jour du 6 nov.

**Dossier.** Le zip v3 léger du 6 nov. remplace la copie du CO (hors dépôt). Il ajoute **G09 Écran de veille** à LOT-00 : **142 écrans, LOT-00 en compte 9**. Les images partent avec le zip de chaque lot, que Harun donne aux sessions.

**S0** est en mode ULTRA (Fable 5.1, effort max) pour finir le socle v3. C'est la priorité absolue. Sa branche `claude/refonte-socle` (`de625f8`, 4 nov.) contient déjà :

- les 9 écrans en v3, dont G09 (0 % de pixels hors ± 2 px) ;
- la couche de mouvement, la police monospace, `LiveDot`, `Caret`, `Severity`, `Gauge`, `HeatCell`, `FlowLine`, `FilterChips` et `InlineSuggestion` ;
- la barre latérale v3 avec la carte « Aujourd'hui » et Cyber, l'en-tête, la barre Ajmani v3 ;
- `usePageCoquille` ;
- les 4 commits de S5, repris.

**Ce que le CO attend encore du socle v3 avant de le fusionner :**

1. **`ModuleTile`, `ModuleGroupGrid` et `AddModuleTile`**, ainsi que les briques citées par dix lots ou plus : `PageHead`, `IconTile`, `SuggestionCompact`, `FlagUrgent`, et `IconButton`, `StatusPill`, `SearchBox`, `AvatarStack`, `AjmaniBar` si les briques existantes ne les couvrent pas sous ces noms. Aucun lot ne les construit (§1.10).
2. **Le mécanisme de substitution d'écran** (§1.3) : remplacer l'écran d'une route interne existante, et monter une page qui n'est pas un module (hubs `/ensemble/<famille>`, pages L*) sans la compter dans les 101.
3. **Un seul calcul pour « Aujourd'hui »** (tâches faites sur prévues, série, prochain rendez-vous, présence), exporté pour N01, et **un seul calcul pour la pastille de La Garde** (`usePoulsGarde`), exporté pour LOT-08.
4. **`check:coquille`** adapté à la barre latérale v3.
5. **La liste exacte des composants disponibles** avec leurs chemins, envoyée au CO : c'est le signal de fusion.

**Réponses du CO aux questions de S0** (par délégation de Harun) :

| Question de S0 | Décision |
|---|---|
| Basculer la coquille, donc G09, par défaut ? | **Oui**, dans le socle v3, dès que le passage de T1 sur `claude/refonte-socle` est propre (paquet client identique, gardes navigateur coquille éteinte puis allumée) (§1.9) |
| Créer un vrai verrouillage menant à G06 ? | **Non dans LOT-00** : cela touche l'authentification. Le délai reste enregistré sans effet, « Espace verrouillé » ne s'affiche pas (écart actuel gardé). S6 étudiera le verrouillage dans sa phase sécurité, en privé. |
| Masquer les notifications natives pendant la veille ? | **Oui** : pendant la veille, une notification native n'affiche que « AMN Business · nouvelle notification », sans contenu. C'est le but de G09 : aucun nom ni montant visible depuis la salle. |
| 1. G05 : envoi réel des relances (N3, 10 s pour annuler) ? | **Non au premier jet** : Ajmani prépare, la personne envoie (écart « Préparer les n relances » gardé). |
| 2. G06 : compte mémorisé sur le poste ? | **Non au premier jet** (aucune adresse gardée en local). |
| 3. D02 : lignes de 21 px ou cibles de 34 px ; « 101 » | **Cibles de 34 px** (règle d'accessibilité §7.6, qui l'emporte), la colonne défile dans sa carte ; pas d'équilibrage, l'ordre du registre fait foi ; **un seul total** : celui de D02, repris tel quel par la barre, H47 et G06. |
| 4. Sources manquantes | Aucune nouvelle source dans LOT-00. Chacune revient au lot qui la possède : devis prérempli à LOT-04, contacts par client à LOT-02, note épinglée à LOT-03, automatisations et modèles des métiers (L04) à LOT-07. Créneaux du référent et historique des ouvertures : écarts gardés. |
| 5. H40 : émetteurs du bruit, du silence et du résumé ; rendez-vous dans « L'essentiel » | Pas d'émetteur nouveau dans LOT-00 (écarts gardés). Rendez-vous dans « L'essentiel » **comme la fiche** (pour le contenu d'un écran, la fiche l'emporte). |
| 6. H43 : exporter les pièces d'`EnSituation.tsx` | **Oui**, et les montrer sur `/dev/socle` : les lots en ont besoin pour leurs états. |
| 7. Hauteur des pages sous `AppLayout` | **Dans la coquille, une seule fois**, pas page par page. |

**S7** est créée (LOT-06, en mode préparation). Elle a déjà poussé `claude/refonte-creer` (`e402d0e`) : la logique pure des 15 écrans, `check:creer` et sa note `docs/refonte/preparation/LOT-06-creer.md`. **Ce dossier, `docs/refonte/preparation/LOT-xx-<nom>.md`, devient la règle pour toutes les notes de préparation**, et S3 y déplace la sienne.

**T1** a comparé les 8 écrans v2 de LOT-00 (`0a1751c`, `docs/qualite/fidelite/ECARTS-LOT-00.md`) ; S0 en a corrigé une partie dans le socle v3.

**Réglages par session** (recommandés par Harun, relus par le CO) :

| Session | Réglage | Avis du CO |
|---|---|---|
| CO, S2 (LOT-01), S3 (LOT-08), DS (LOT-04) | Opus 5.5, effort élevé | ✓ (au-dessus du dossier pour S2 et DS, sans inconvénient) |
| S0 (socle v3) | Fable 5.1, effort max (ULTRA) | ✓ |
| S6, sécurité (phases 0 à 3) | Opus 5.5, effort max, pas de Fable | ✓ |
| S6, LOT-10 Cyber | Opus 5.5, effort élevé | ✓ |
| **S6, LOT-07 Outils** | Opus 5.5, effort élevé (**confirmé par Harun le 12 nov.**) | Ce réglage est celui que conseille le dossier, pour les surfaces sensibles (accès H19, connecteurs H21 dont WhatsApp et SMS, coffre-fort H24). |
| S1 (LOT-02, LOT-09), S5 (LOT-03, LOT-05), S7 (LOT-06), T1, SIM | Sonnet 5.5, effort élevé | ✓ |
| F1 (non cité) | — | Sonnet 5.5, effort élevé |

**Règles qui ne changent pas** : des branches seulement, jamais de push sur `main`, **jamais de tag `v*`, aucune release, aucun déploiement client**, aucun secret dans le code.

**Ordre de lancement après la fusion du socle v3**, inchangé : S2 et S3 d'abord ; puis S1, S5, DS et S7 en parallèle ; S6 dès la fin de sa phase 1 ; S1 pour LOT-09 en dernier.

**SIM** doit encore : aligner ses dates sur 10 h 42 (mardi 3 nov. pour Cyber) ; livrer le chargeur vers l'API d'essai avec S3 ; fournir les valeurs attendues des écrans calculés (§1.11).

Les prompts de préparation du 6 nov. sont dans [`PROMPTS-6NOV.md`](PROMPTS-6NOV.md).

### 1.13 Directive du 10 nov. (Harun) — plan complet : [`PLAN-10NOV.md`](PLAN-10NOV.md)

AMN Business devient le seul outil de travail de l'équipe. Nouveaux lots :

- **LOT-11** Espace Développement (S8, à créer ; maquettes à fournir par Harun) ;
- **LOT-12** Connecteurs et autonomie (S9, à créer ; le modèle et les moteurs locaux, H21 en est l'écran) ;
- **LOT-13** Serveur (SRV, à créer ; comparatif en lecture seule, à rendre le 16 nov. au plus tard) ;
- **LOT-14** Charge et essais longs (SIM et T1) ;
- **SEC-0** (phase 0 de S6), puis **DIST** (distribution interne privée).

L'espace Cyber est couvert par LOT-10 et LOT-08 (correspondance au §3.1 du plan). Mohamed a validé le design : S0 et T1 avancent vers la bascule.

**Socle v3 : passe finale de S0.** Les 6 constats de sa seconde passe adverse sont **à corriger** avant la fusion : le segment survolé (régression visible), `Kpi` avec `title`, les gardes `check:socle-briques`, `check:socle` et `check:coquille` plus strictes, la démo, et « -0,00 € ». Puis T1 relit la différence et le CO fusionne. **T1 commence son passage 2 tout de suite**, sur `8e7e771`.

**Réponses du CO aux 14 questions du socle complet** (par délégation) :

| # | Décision |
|---|---|
| 1 | Compteurs : la déclaration du module **l'emporte**, pas d'addition. |
| 2 | `FournisseurAujourdhui` **au-dessus des deux coquilles** (une seule instance). |
| 3 | Deux briques pour l'instant (`EtatVide` du §4, `BlocEtat` aux cotes de H43), pas d'unification. **S2** (LOT-01) est prévenue pour N01. |
| 4 | `IconTile` : les variantes `part` et `bordure` deviennent **officielles** (les images font foi). |
| 5 | Hubs : **sept routes exactes**, une par lot. |
| 6 | Le substitut de la session de support suit le drapeau de la coquille (choix de S0 confirmé). La clé `module` garde aussi l'édition interne : **oui** (un module fermé renvoie à l'Accueil partout). |
| 7 | `check:coquille`, second passage : **mesurer aussi les bureaux** ; le voyant orange de La Garde est la **seule** exception à « aucun ambre dans la colonne » ; étendre la détection à l'ambre **translucide**. |
| 8 | Notifications : garder `{ section }` jusqu'à H18 (LOT-07), puis `/settings/notifications`. Le cadre commun des trois réglages convient. |
| 9 | C-001 : **sortir** les 48 références du socle de `src/index.css` avant la fusion. T1 vérifie ensuite que le paquet client revient au niveau de `main`. |
| 10 | Le §7.6 (accessibilité) l'emporte pour les **zones de clic** : 34 px au moins, **sans changer le dessin** (zone élargie invisible), pour l'interrupteur, les cases, les segments et les boutons de `PageHead`. Segment choisi : repère non chromatique par la graisse. |
| 11 | Interdire `vers` et `onClick` ensemble : **oui**. `Kpi` : ≤ 92 px, variation sur une ligne avec `title` (constat 2). Gris de décor en `fill` et `stroke` dans les `.tsx` : **non** (illustrations permises, 04-B n° 15). |
| 12 | D02 : drapeau `critique` au registre : **oui**, posé par S5 (propriétaire du registre), lu par D02. S0 rééquilibre son registre d'exemple. |
| 13 | `v-discussion.png` et `v-scan-inline.png` à la racine : **retirés** de l'arbre par S0 (ils restent dans l'historique). |
| 14 | Images des fiches F10, F30, F50, F70, MR06, MR09, H16, N01 et H18 : demandées à Harun pour S0. |

**Règles ajoutées** (dans `REGLES.md`) :

- seule l'édition Business (`internal`) est commitée : aucun commit nouveau sur l'édition cliente ;
- autonomie d'abord, une API payante est un connecteur facultatif ;
- trois actions au plus pour une tâche courante ;
- chaleur (les mots, le rythme, les petites attentions) ;
- aucun secret ni dans un chat, ni dans un ticket, ni dans un dépôt ;
- SEC-0 avant toute distribution, et distribution interne privée.

**Fait à connaître.** `.github/workflows/release.yml` publie l'installeur interne dans les Releases GitHub de ce dépôt public quand on pousse un tag `v*`, et la mise à jour automatique les lit. **Fait le 12 nov. (Harun)** : les tags `v*` sont protégés par une règle du dépôt, et le workflow de publication est désactivé. La distribution privée sera choisie après SEC-0.

**Ce que le CO demande à Harun** (détail au §9 du plan) :

1. les maquettes DV01 à DV10 et la place de Développement dans la barre latérale ;
2. créer S8, S9 et SRV, et attacher amn-api à SRV ;
3. les chiffres de Render et le budget du serveur ; la décision après le comparatif ;
4. où garder le travail sur Desktop client (A, B ou C ; A recommandée) ;
5. ~~protéger les tags `v*`~~ (fait le 12 nov., workflow de publication désactivé aussi) ; le canal de distribution privé après SEC-0 ;
6. ~~qui corrige amn-api~~ : **Harun est responsable, Mohamed suppléant** (12 nov.). Les « demandes à amn-api » des lots leur reviennent, et le détail des points de SIM reste hors du dépôt public ;
7. ~~les chiffres cibles des tests de charge~~ : fixés le 12 nov. (§1.20) ;
8. les images manquantes pour S0 ;
9. ~~S6 en Opus pour LOT-07~~ : confirmé le 12 nov. LOT-07 démarre après la priorité de sécurité de S6.

### 1.14 Dossier v4 : néon et tutoiement (11 nov., décisions de Harun)

**Dossier.** `AMN-Business-dossier-v4` (5 zips `AMN-v4-1-docs.zip` à `AMN-v4-5-images.zip`, à décompresser dans un même dossier, hors du dépôt) remplace le v3 pour tous les lots. Il contient 153 images : les 142 écrans, 4 écrans Cyber `CYB-*` et 7 images Développement `DEV-*`. S'y ajoutent `sources-neon/` (143 sources HTML aux styles exacts), `_data/couleurs-familles.json` et `_data/tutoiement.json` (353 textes). Les fiches, l'index, les écarts et les prompts sont identiques au v3 (vérifié).

**Décisions :**

1. **Néon dosé, couleur par famille.** `06-V4-NEON-ET-TUTOIEMENT.md` l'emporte sur `01-SOCLE-DESIGN.md`.
   - Deux couleurs par famille (`--fam-a`, `--fam-b`), posées par la coquille selon la famille active.
   - Nouvelles couleurs d'état : succès `#5EE6A8`, info `#6EA8FF`, attention `#FFBE5C`, danger `#FF6B7A`.
   - Les 15 règles de rendu du §3 de `06`. Le mouvement est inchangé ; `prefers-reduced-motion` coupe aussi les lueurs animées.
   - Les dispositions, les fiches et la logique ne changent pas. **Cela remplace « noir et gris » (§1.6 et §1.10).**
   - Cyber prend ses propres couleurs (`#FF6B7A`, `#A58BFF`) : il ne partage plus celles de La Garde.
   - `couleurs-familles.json` n'a pas d'entrée Développement : on prend le tableau de `06` (`#6EA8FF`, `#5EE6A8`).
2. **Tutoiement** dans toute l'interface ; **vouvoiement** gardé dans les textes destinés aux clients (courriels, devis, factures, relances, réponses automatiques, page publique, messages reçus). Table : `_data/tutoiement.json`. Les règles « vouvoiement » des prompts et des fiches sont remplacées. Les gardes qui exigent le vouvoiement (`check:systeme-ajmani`, `check:systeme-demarrage`, `check:systeme-demo`, `check:ajmani`) sont **mises à jour, pas désactivées** ; nouvelle garde `check:tutoiement`.
3. **Espace Développement (LOT-11)** :
   - 7 maquettes `DEV-*` : Projets de code, Déploiements, Serveur et santé, Éditeur de flux, Coûts et API, Modèles de sites (et sa vue code) ; brief dans `07-ESPACE-DEV.md`.
   - **Place dans la barre latérale : juste au-dessus de « Surveillance »**, validée.
   - Aucune fiche n'existe : **S8 les écrit d'abord** (gabarit `02-FICHE-MODELE.md`).
   - **Pas d'image « Vue d'ensemble »** : S8 propose sa fiche, sur le modèle des hubs F10 à F70.
   - Sous-modules réutilisés avec leurs fiches : H20, H21, H24, H03, ME05, MO03.
4. **Cyber** : 4 écrans ajoutés à LOT-10 (`CYB-vulnerabilites`, `CYB-rapport-audit`, `CYB-playbook`, `CYB-chiffrage`). **LOT-10 passe à 18 écrans.** Les fiches sont à écrire avant de construire (S6). Les prix et la mention de TVA de `CYB-chiffrage` sont des données d'un catalogue, jamais du code en dur.
5. **Images attendues par S0** (F10, F30, F50, F70, MR06, MR09, H16, N01, H18) : elles sont dans le dossier v4 (vérifié, 9 sur 9).
6. **`build:web` en local permis à toutes les sessions** sur données fictives (`REGLES.md`). `npm start` reste interdit, et `build:web:business` reste à T1.

**Passe finale de S0 (v4), avant la fusion du socle** :

- tout le §1.13 (6 constats, 14 réponses, C-001, zones de clic de 34 px, guide de voix) ;
- plus, pour la v4 :
  - jetons de famille `--fam-a` / `--fam-b` pour les 11 familles du tableau de `06`, posés par la coquille ;
  - couleurs d'état v4 ;
  - règles de rendu du §3 dans le socle (fond à deux halos, cartes, titre et grands chiffres en dégradé, boutons, pastilles, lueurs, barre latérale active, onglets, bord dégradé d'Ajmani, tuiles d'icône) ;
  - tutoiement de la coquille et des 9 écrans de LOT-00 ;
  - entrée « Développement » dans la barre latérale, au-dessus de « Surveillance », avec ses signaux ;
  - mise à jour des gardes qui figent les couleurs v3 ou le vouvoiement (`check:encres`, `check:socle`, `check:coquille`, `check:socle-*`, `check:systeme-*`), et `check:tutoiement` ;
  - correctif du `Segmented` au survol.
- Puis : passage de T1 sur les images v4 (paquet client, gardes navigateur coquille éteinte puis allumée, fidélité des 9 écrans), fusion par le CO, bascule de la coquille.

**À noter.** Depuis le 6 nov., aucune session de lot n'a poussé de branche de préparation, sauf S7 (`claude/refonte-creer`). S0 n'a rien poussé depuis `8e7e771` (passe finale à faire), ni T1 depuis `0a1751c`, ni SIM depuis `4fe559b`. Les prompts du 11 nov. relancent tout le monde : [`PROMPTS-11NOV.md`](PROMPTS-11NOV.md).

### 1.15 Serveur : 0 € ce mois-ci, serveur maison (décision de Harun, 11 nov.)

1. **Aucune dépense en novembre.** On construit en local, sur données fictives (`build:web` local, API d'essai, `src/refonte/donnees/`).
2. **Ensuite, un serveur maison** :
   - amn-api et Postgres dans Docker, sur un poste de l'équipe ;
   - Mohamed y accède par **Tailscale** (gratuit) ;
   - **rien n'est exposé sur Internet** : aucun port ouvert sur la box, services liés à `127.0.0.1` ou à l'interface Tailscale seulement ;
   - une sauvegarde nocturne chiffrée, et un essai de restauration.
3. **SRV garde son comparatif** (rendu le 16 nov., aucun achat), en **trois paliers** : gratuit (le serveur maison), environ 10 €/mois, environ 25 €/mois. **Décision d'achat en décembre.**
4. **SRV écrit en plus le guide pas à pas « serveur maison »** : `docs/serveur/SERVEUR-MAISON.md`, au plus tard le 18 nov. Il couvre Docker, Postgres, amn-api, Tailscale et la sauvegarde nocturne, sans aucun nom d'hôte, adresse, nom de machine ni secret. Les secrets sont générés sur le poste, dans un fichier `.env` jamais commité ni collé dans un chat. S6 relit le guide avant toute mise en service.
5. **Aucune donnée réelle de client tant que la phase 0 de sécurité (SEC-0) n'est pas terminée**, ni sur le serveur maison, ni ailleurs dans la refonte.

**Ce que le CO en déduit :**

- **L'accès de Mohamed au serveur maison, sur données fictives, n'est pas une distribution.** L'installeur Electron ne lui est remis qu'après SEC-0. Avant, s'il veut essayer l'application, c'est la version web (`build:web`) servie sur le réseau Tailscale, avec données fictives.
- **⚠ Avant le 23 nov.** : la base gratuite actuelle sur Render peut contenir des données réelles. **Harun l'exporte d'ici là** (sauvegarde chiffrée, hors ligne, hors dépôt, jamais dans un chat), pour ne rien perdre au moment de la restriction. Elle ne sera importée nulle part avant SEC-0.
- La migration de la production reste suspendue jusqu'à la décision de décembre.

### 1.16 Aucune distribution ; serveur reporté (décision de Harun, 12 nov.)

1. **Aucune distribution pour l'instant**, ni à l'équipe ni à des clients. L'application tourne **seulement en local, sur le poste de Harun, sur données fictives**, pour ses essais. **Le verrou de distribution reste fermé.** Cela remplace l'accès de Mohamed par Tailscale du §1.15.
2. **Serveur reporté. SRV est en pause** : pas de comparatif le 16 nov., pas de guide « serveur maison » pour l'instant. Le §1.15 reste écrit pour plus tard.
3. **S6 garde la phase 0, avec une seule priorité**, fixée par Harun et transmise en privé. Elle passe avant tout le reste de la phase 0 et avant la phase 1. Rien de cette priorité n'est décrit dans le dépôt.
4. **Le guide « lancer AMN Business sur mon PC »** est prêt : [`LANCER-EN-LOCAL.md`](LANCER-EN-LOCAL.md). Il est à suivre quand le socle v4 est fusionné, avec la version web construite en local, l'API d'essai en mémoire et les données fictives. Il demande un dossier neuf, sans `.env`, et jamais `npm start`.
5. Ce qui ne change pas : socle v4 (S0, puis T1, puis fusion), vague 1 (S2, S3), préparation des lots, S8, S9, SIM (son chargeur sert aux essais de Harun) et F1.

### 1.17 Fiches de LOT-11 (S8, 12 nov.) : décisions du CO

Les 7 fiches de l'espace Développement (`DEV-projets`, `DEV-deploiements`, `DEV-serveur`, `DEV-editeur`, `DEV-couts`, `DEV-modeles-sites`, et la proposition `DEV-ensemble`) sont fusionnées dans `refonte-vivante`, pour relecture par Harun : [`fiches/LOT-11/`](fiches/LOT-11/00-COMMUN.md). Rien ne se construit avant cette relecture et la fusion du socle v4.

| # | Point soulevé par S8 | Décision |
|---|---|---|
| 1 | Barre latérale des images DEV (13 lignes dépliées, section « ESPACES DE TRAVAIL ») | **Socle §0.1 pour la sous-liste** : 5 lignes au plus, puis « + N autres ». **L'image pour la section** : « ESPACES DE TRAVAIL », juste au-dessus de « SURVEILLANCE », qui contient Développement. S0 la pose. |
| 2 | 8e hub `/ensemble/developpement` | **Oui** : S0 l'ajoute aux hubs du socle (huit routes exactes au lieu de sept, §1.13 n° 5). |
| 3 | Famille de `DEV-modeles-sites` | **Développement**, avec une seconde entrée possible dans Créer et produire. |
| 4 | « Éditeur d'automatisation » (h1) ou « Éditeur de flux » (menu) | **« Éditeur de flux » partout**, comme le brief `07` et la liste de Harun. L'écart avec l'image est noté. |
| 5 | `DEV-couts` : « 5 connecteurs sur 7 » pour 4 lignes « Local » | **Calculé** depuis les connecteurs réels, jamais repris de l'image (04-A n° 1). |
| 6 | `DEV-deploiements` : total des étapes ≠ « 1 min 48 » ; cible « Interne » | Total **mesuré de bout en bout**. La cible « Interne » reste **inerte** : aucune distribution, aucun tag `v*`, aucune Release. |
| 7 | `DEV-editeur` : branches Sinon / Puis | Une extension du format des blocs et du moteur local, **qui revient à S9** (LOT-12 tient le format Quand / Si / Alors). S6 relit, et H20 (LOT-07) s'appuie dessus. S8 construit l'écran sur ce format. |

**Ajouté à la passe finale de S0** : la section « ESPACES DE TRAVAIL » de la barre latérale, et le hub `/ensemble/developpement`.

### 1.18 Point du 12 nov., 17h : registre de D02, ordre de reprise après 18h

**Registre d'exemple de D02 (question de S0, réponse 12 du §1.13)** : la réponse 12 est **retirée**. L'aperçu de D02 garde le vrai registre de S5 tel quel, parce que l'ordre du registre fait foi (§1.12 n° 3) et que les comptes viennent des données, jamais de l'image (04-A n° 1). La 4ᵉ colonne défile dans sa carte, comme livré. L'écart avec l'image (lignes du registre) est un **écart gardé**, hors pourcentage. Rien ne change dans `src/refonte/modules/`. Les points 5 à 9 de S0 continuent sans attendre.

**Ordre de reprise après la remise à zéro de 18h** (limite partagée, une session à la fois si besoin) :

1. **S0** : points 5 à 9 de la passe finale. C'est le chemin critique : rien ne se fusionne ni ne s'allume sans lui.
2. **S6** : phase 0, sa priorité en cours (étapes 3 à 6).
3. **S9** : LOT-12, le format des blocs Quand / Si / Alors avec Sinon / Puis (§1.17 n° 7). Branche `claude/refonte-connecteurs` @ `f7f3d1a` relue : 26 fichiers dans sa zone, aucun conflit, aucun secret.
4. **T1** : passage 2, **seulement quand S0 a poussé le point 9**, pas avant (une seule passe, pas deux).
5. **S8** : en pause après ses fiches, jusqu'à la relecture de Harun. Aucun coût d'ici là.

S2 et S3 : après la fusion du socle v4 et l'allumage de la coquille (§1.9).

### 1.19 LOT-11 étape 2 (S8, `c555718`) : fusionnée, constats tranchés

Fusionnée (`f984ad1`) : la note de préparation, la logique pure de `src/refonte/developpement/`, et la garde `check:developpement` (51 contrôles verts). Typecheck des deux éditions, lint et `check:navigation` sont verts après la fusion. Aucun écran, aucun build. L'étape 3 (les écrans) attend la relecture des fiches par Harun, la fusion du socle v4, et le modèle des connecteurs de S9.

| # | Constat de S8 (note §5) | Décision |
|---|---|---|
| 1 | Seconde entrée : le registre refuse une vue en double | **Le registre reste sans doublon.** H20, H21, H24, H03, ME05 et MO03 gardent leur famille. La seconde entrée passe par la **sous-liste « Développement » de la barre latérale** (S0, §1.17 n° 1), qui pointe vers les vues existantes. Aucun champ « aussi dans » pour l'instant. |
| 2 | Teinte de la famille dans le registre (7 teintes) | Dans le registre, **`outils` pour l'instant**, comme La Garde. Le néon vient de la coquille, par `--socle-fam-developpement-a/-b` (déjà posés par S0). Élargir `declarerFamille` aux onze `FamilleCouleur` est une petite tâche du socle, **après** la passe finale, pas sur son chemin critique. |
| 3 | 8e hub | Déjà tranché (§1.17 n° 2) : S0. |
| 4 | Sinon / Puis et le moteur de H20 | **Pas de troisième moteur.** On étend `AutomationData` du moteur de LOT-07 (plusieurs actions, une branche « non »). S9 fixe le format (§1.17 n° 7), S6 relit et l'intègre à H20, S8 construit l'écran dessus. |
| 5 | Cible « Interne » | `DISTRIBUTION_INTERNE_OUVERTE = false` : approuvé. Ne change que sur décision de Harun (DIST). |
| 6 | Entrée de la barre latérale | Déjà tranché (§1.17 n° 1) : S0, dans les points 5 à 9. |
| 7 | « Redémarrer » en bouton primaire (DEV-serveur) | **Bouton secondaire, avec confirmation.** Le bouton primaire reste l'action courante de la page. Le bouton est inerte tant que LOT-13 (serveur) est en pause. Les autres écarts : §1.17 n° 3 à 5. |

Jeux fictifs pour LOT-11 (note §8) : à commander à SIM quand l'étape 3 démarre, pas avant.

### 1.20 Seuils de LOT-14 (Harun, 12 nov.)

| Essai | Ce qu'on simule | Ce qui est attendu |
|---|---|---|
| **Charge (cible à tenir)** | 100 organisations clientes fictives, dont **20 connectées en même temps**, plus **3 personnes de l'équipe interne** au travail sur l'ensemble | Ça tient : aucune perte ni aucun écrasement de données, aucune erreur serveur. **Validé par Harun le 12 nov.** : **95 % des actions courantes en moins d'1 s**, et une écriture visible sur les autres postes en **moins de 5 s**. |
| **Résistance** | Montée jusqu'à **1 000 organisations**, en augmentant les connexions simultanées par paliers | On ne demande pas que ça tienne : on veut **le premier point de rupture** (à quel palier, sur quelle ressource : processeur, mémoire, base, connexions) et la façon dont ça casse (lenteur, erreurs, perte). |
| **Essais longs** | 72 h à la cible de charge, avec redémarrages, coupures réseau et reprise après plantage (PLAN-10NOV §8) | Aucune donnée perdue, et une reprise sans intervention. |

Où l'on mesure :
- **Maintenant**, sur l'API d'essai locale : SIM écrit les scénarios et génère les organisations fictives (jusqu'à 1 000), T1 vérifie que les scénarios tournent. Ces chiffres ne valent pas pour le serveur réel.
- **Les vrais chiffres**, sur le serveur maison, quand LOT-13 reprend.
- Toujours sur des données fictives, comme partout (REGLES).

Les points faibles d'amn-api que ces essais révèlent vont à Harun et Mohamed, et leur détail reste hors du dépôt public.

### 1.21 Modules de F1 choisis par Harun (12 nov.)

**Intégrés en premier** : `tauxHoraire` (Taux horaire de revient), `echeancier` (Paiement en plusieurs fois), `comparateurDevis` (Comparateur de devis). Les trois sont « prêts à intégrer », sans condition (`docs/atelier/PRET.md` @ `59056ad`). **Le Rétroplanning et les dix autres attendent.** `bonsCadeaux` reste bloqué.

Comment ça se passe (procédure [`INTEGRATION-F1.md`](INTEGRATION-F1.md), adoptée) :
1. F1 écrit le choix et sa date dans `PRET.md`, et applique le correctif C-003 de T1 (`docs/qualite/constats/C-003-verifier-f1.patch`).
2. **Après la fusion du socle v4**, F1 repart de la dernière `refonte-vivante` et met les trois modules au socle v4 : néon de leur famille (`--fam-a` / `--fam-b`), tutoiement, briques du socle. Pour chacun, une ligne dans le registre de S5 et une route dans `appRoot.internal.tsx`, rien d'autre hors de `src/ateliers/**`.
3. T1 teste les trois modules sur le même sha, en une seule passe.
4. Le CO relit et fusionne **un commit `--no-ff` par module**, pour pouvoir retirer chacun seul.

Édition interne seulement : rien côté édition cliente. Réglage de F1 : Sonnet 5.5, effort élevé. Ordre de lancement : avec S2 et S3, après la fusion du socle v4.

### 1.22 LOT-12 préparation (S9, `890522d`) : fusionnée, questions tranchées

Fusionnée (`4254e7a`) : le modèle des connecteurs, les moteurs locaux, le format Sinon / Puis rangé dans le moteur de H20 (convertible dans les deux sens, les règles existantes relues à l'identique), et `check:connecteurs` (93 contrôles). Un seul conflit, dans `editions.yml` et `package.json` : deux ajouts côte à côte, les deux gardés. Après la fusion, tout est vert : typecheck des deux éditions, lint, `check:connecteurs`, `check:developpement`, `check:navigation`, `check:moments`, `check:donnees`.

| # | Question de S9 | Décision |
|---|---|---|
| 1 | Notion et Webhooks, sans catégorie | Comme proposé : Webhooks est la brique « événements reçus » d'amn-api, affichée comme prise « chez nous ». Notion passe par « Demander un connecteur » tant que la liste des catégories ne l'ajoute pas. |
| 2 | Prise arrêtée | Comme proposé : même dessin que « libre », avec « arrêtée le … » à la place de « libre, à brancher ». |
| 3 | Valeurs par défaut | **Adoptées comme valeurs de départ**, toutes modifiables dans les réglages : plage clients lun.–ven. 08:00–19:00, plage équipe 07:30–21:00, 7 jours entre relances, 30 courriels par heure, rotation 7 / 4 / 6, suggestion à 70 % du forfait. Harun peut les corriger à tout moment. |
| 4 | Moteur de H20, aussi chargé par l'édition cliente | **Une couture `@edition/*`**, pas un déplacement. Un jumeau `.business` reprend le comportement actuel, à l'identique, et le `.internal` branche le format étendu. L'édition cliente ne change donc pas, ce que `check:client-statique` prouve. C'est S6 qui la pose, dans LOT-07. |
| 5 | Section LOT-12 dans §7 | **Oui, courte** : état, sha, gardes et dépendances, sans table d'écrans. S9 la crée et y touche seul. |

**Espace Développement** : Harun a répondu directement à S8 sur ses 8 questions (S8 transmet au CO). Les modèles de sites ajoutés restent **sur le poste** pour l'instant. Leur partage attend le serveur (LOT-13).

### 1.23 Fiches de LOT-11 relues par Harun (12 nov., soir)

Les 8 décisions de Harun sont en tête de `fiches/LOT-11/00-COMMUN.md`, et les fiches y sont alignées (`ae801d6`, fusionnée). Il n'y a plus de relecture en attente. Le seul point laissé au CO :

- **Confirmation avant « Revenir »** : Préproduction, Interne et Serveur AMN suivent la règle de la production, avec une ligne de confirmation. Seules les versions d'essai (Aperçu) n'en demandent pas. **Décidé par le CO**, comme S8 le propose.

**Étape 3 de S8 (les écrans)** : feu vert **dès la fusion du socle v4**. Elle n'attend plus que cela : les fiches sont relues et le modèle des connecteurs est fusionné (§1.22).

### 1.24 Qui travaille sans attendre le socle v4 (12 nov., soir), par ordre de priorité

Prompts : [`PROMPTS-12NOV.md`](PROMPTS-12NOV.md), qui remplacent ceux du 6 nov. pour S1, S5, DS, S7 et SIM.

| Ordre | Session | Ce qu'elle fait | Réglage |
|---|---|---|---|
| déjà lancées | **S0**, **S6**, **S9** | passe finale v4 (points 5 à 9), priorité de sécurité, puis la section LOT-12 du §7 (S9 se met ensuite en pause) | inchangé |
| 1 | **SIM** | dates à 10:42, chargeur vers l'API d'essai (essais de Harun), attendus des écrans calculés, générateur et scénarios de charge (§1.20) | Sonnet 5.5, élevé |
| 2 | **DS** | préparation de LOT-04 L'argent, le plus gros lot (17 écrans), logique d'argent | Opus 5.5, élevé |
| 3 | **S1** | préparation de LOT-02 Contacts et clients | Sonnet 5.5, élevé |
| 4 | **S5** | préparation de LOT-03 puis LOT-05 | Sonnet 5.5, élevé |
| 5 | **S7** | mise à jour de sa préparation de LOT-06 pour la v4 | Sonnet 5.5, moyen |

**Attendent, sans rien consommer** : T1 (passage 2, quand S0 a poussé le point 9), S2, S3, F1 et S8 étape 3 (après la fusion du socle v4), SRV (en pause).

### 1.25 Passe finale v4 de S0 terminée (`888f7a0`) : réponses du CO, passage 2 de T1

Points 5 à 9 poussés sur `claude/refonte-socle` @ `888f7a0` : section « ESPACES DE TRAVAIL » et 8e hub, tutoiement (guide de voix `src/socle/mots/voix.ts`), `check:tutoiement`, captures comparées aux images v4. Relu par le CO :
- aucun conflit avec `refonte-vivante` ;
- aucun fichier `*.business.*` changé depuis `db7e33b` ;
- `src/screens/**` est intact ;
- aucun secret.

| # | Question de S0 | Décision |
|---|---|---|
| 1 | Troisième halo et voile des pages pleines (absents de 06 §3, mais dessinés par `sources-neon/`) | **Acceptés.** Les sources font partie du dossier v4 et 06 ne les contredit pas. Deux conditions, vérifiées par T1 : le texte reste lisible (AA, plancher T4), et les lueurs animées s'arrêtent quand le mouvement est réduit. |
| 2 | La famille active posée sur la racine du document pendant que la coquille est affichée | **Accepté**, à deux conditions : l'attribut disparaît quand la coquille est éteinte ou démontée, et il n'existe jamais dans l'édition cliente. T1 le vérifie. |
| 3 | Point de l'horloge de G09 : couleur principale, sans le dégradé de la source | **Accepté.** Sur un disque de 10 px, le dégradé ne se voit pas. |

Les écarts restants viennent des données d'exemple, des pages derrière les palettes, des méthodes de connexion absentes (G06) et des lignes du registre de D02. Ce sont des **écarts gardés**.

**Passage 2 de T1 : feu vert** sur `888f7a0`, prompt de T1 du 11 nov. (`PROMPTS-11NOV.md`), avec les vérifications ci-dessus. T1 confirme aussi que les 5 échecs connus de S0 (migration, encres, xss, visite, support) échouent **à l'identique sur `main`**. Ensuite seulement : la fusion du socle v4 et l'allumage de la coquille (§1.9).

### 1.26 LOT-12 terminé côté S9 (`b90df75`)

Fusionnée (`refonte-vivante`, après `6d51dcb`), et tout reste vert après la fusion : `check:connecteurs` (100 contrôles), les typechecks des deux éditions, lint, `check:navigation` et `check:developpement`. Les décisions du §1.22 sont appliquées, et il ne reste aucune question ouverte. **S9 est en pause.**

Ce qui reste, hors S9 :
- **La couture du moteur de H20** : S6, dans LOT-07 (§1.22 n° 4).
- **Le relevé des tarifs pour H21** : S6, dans LOT-07, au moment de construire H21. Chaque prix est relevé sur la page officielle de l'outil, avec la date du relevé, et il est montré comme « indicatif au <date> ». Aucun prix n'est inventé.

### 1.27 S6 passe à LOT-07 ; réponses du CO à S7 (LOT-06), 14 nov.

**S6** : sa priorité de sécurité est terminée, sauf une étape qui attend le redémarrage d'amn-api (le détail reste privé). Le verrou de distribution reste fermé (§1.16). S6 passe à **LOT-07**, en préparation jusqu'à la fusion du socle v4. La couture du moteur de H20 et le relevé des tarifs de H21 (§1.26) en font partie.

**S7, LOT-06** (`claude/refonte-creer` @ `f417bfe`) :

| # | Question | Décision |
|---|---|---|
| 1 | Familles du registre (F50 annonce 16 modules, 11 rangés ailleurs) | **On rapatrie dans `creer`** les modules dont l'écran est un écran de LOT-06 (les 15 du §7), avec les actions `fabriquer`, `livrer` et `stocker`. C'est ce que montre la barre latérale v4. Un module qui est l'écran d'un autre lot garde sa famille : F50 le montre comme une tuile de lien, sans doublon dans le registre (§1.19 n° 1). **S7 donne la liste exacte dans sa note, et S5 (propriétaire du registre) fait le déplacement** sur sa branche, en prévenant les lots concernés par le CO. |
| 2 | MR05 : collection `products` | **Pas de nouvelle collection synchronisée pour l'instant.** Elle toucherait la synchronisation et le contrat d'amn-api. MR05 se construit sur les articles de stock (`stockItems`), et ce qui manque s'affiche « non disponible », avec la raison. La collection `products` devient une **demande à amn-api** (Harun, Mohamed suppléant). |
| 3 | « Fabrication » et « Bons d'intervention » | « Bons d'intervention » est **gardé**, comme libellé de la fiche posé sur `InterventionsScreen` (`/interventions`). « Fabrication » est **masqué** tant qu'il n'existe pas : rien n'est simulé. |
| 4 | Modèles de données plus riches que le réel | Même règle que la n° 2 : aucune session n'ajoute de collection synchronisée sans l'accord de Harun. Les écrans se construisent sur l'existant, et le reste est « non disponible » avec une demande à amn-api, notée dans la section du lot. |
| 5 | Géocodage et plan (MR03) | **Plan schématique**, comme `ItinerairesScreen`. Aucun service externe et aucune clé pour l'instant : un futur connecteur, local d'abord, dans le modèle de S9. |
| 6 | Vidéo : deux sources | **Garder les deux et les relier**, sans fusion de modèle. |
| 7 | Formats chiffrés | Importer `src/socle/formats.ts` (socle v4) une fois fusionné, et **supprimer la copie** de `commun.ts`. |
| 8 | Apostrophes courbes | **Oui** : `check:langue` l'emporte sur la fiche. |
| 9 | Droit de publier (MR01, MR02) | **Distinct du droit d'écrire.** Il sera défini dans H19 (LOT-07). D'ici là, seul le rôle dirigeant publie, et les autres passent par « Demander la publication ». |
| 10 | Fichiers lourds (logos, photos, rushes) | **Aucun stockage nouveau.** On réutilise ce que le dépôt sait déjà stocker ; le reste est « non disponible », avec une demande à amn-api. Le stockage d'équipe attend le serveur (LOT-13). |
| 11 | Dates des jeux | Le recalage à 10:42 est confié à SIM (§1.24). |
| 12 | Champs manquants | SIM les reprend depuis la section LOT-06 (§1.24, sa tâche 5). |
| c | Routes de MR06 et MR10 | Deux routes nouvelles, dans `appRoot.internal.tsx` seulement : **`/reservations`** (MR06) et **`/photos-chantier`** (MR10). |
| d | Tuile « Modèles de sites » dans F50 | **Oui** : une tuile de lien vers DEV-modeles-sites (LOT-11), sans doublon dans le registre (§1.17 n° 3). |

**Zips v4** : S5 et S7 les ont reçus le 14 nov. S7 lève ses points « à vérifier », et S5 démarre LOT-03 puis LOT-05.

### 1.28 LOT-02 préparation (S1, `00d9198`) : fusionnée, décisions du CO

Fusionnée (`66ba5c4`). Après la fusion : `check:contacts` (63 contrôles), les typechecks des deux éditions, lint, `check:navigation` et `check:connecteurs` sont verts. S1 n'avait pas le dossier v4 : textes et règles « à confirmer » à relire dès qu'il l'a.

| # | Question de S1 | Décision |
|---|---|---|
| 1 | Fidélité : tampons (`loyaltyCards`, réel) ou points et niveaux (fiche MC02) | **Les deux, sans rien perdre.** MC02 (points et niveaux) est l'écran. La carte à tampons existante reste une formule au choix de l'organisation, et c'est la formule par défaut là où elle sert déjà. Aucune donnée existante n'est convertie de force. |
| 2 | Relances : un moteur ou deux | **Un seul moteur** pour les cinq motifs, celui de `src/lib/relances.ts`, étendu (même règle que §1.19 n° 4). Les paliers d'escalade des factures restent tels quels. |
| 3 | Collection d'interlocuteurs | **Décision de Harun** (nouvelle collection synchronisée, §1.27 n° 4). Elle lui est présentée avec `products` et les modèles plus riches de LOT-06. D'ici là, MC03 s'affiche « non disponible », avec la raison. |
| 4 | Plafonds de 3 relances et d'un message par client et par jour | **Adoptés comme valeurs de départ**, modifiables dans les réglages, comme au §1.22 n° 3. À relire avec MC07. |
| 5 | MC04 Équipe et MC05 Partenaires | MC04 se construit sur le trombinoscope existant. Pour MC05, le jeu d'organisations partenaires est **commandé à SIM** (liste « Manque aux données »). |
| — | Rouvrir un prospect gagné ou perdu | Selon la fiche H06. Si elle ne dit rien : un prospect **perdu** se rouvre, avec confirmation et une trace. Un prospect **gagné** ne se rouvre pas, car il est devenu client. |
| — | « Messagerie » (MC03) | Selon la fiche MC03. Si elle ne dit rien : le courriel. |
| — | Raccourci « Relancer » | Aucun, confirmé (§1.8 n° 14). |

### 1.29 LOT-04 (DS, `11e05e2`) et LOT-03 (S5, `a59198f`) : préparations fusionnées, décisions du CO

Fusionnées (`baff3a3`). Seul conflit : deux ajouts côte à côte dans `editions.yml` et `package.json`, tous deux gardés. Après la fusion, tout est vert : `check:argent` (53), `check:ecrire` (94), `check:contacts`, `check:creer`, `check:connecteurs`, `check:developpement`, `check:donnees`, `check:navigation`, `check:money`, `check:moments`, `check:socle`, `check:accueils`, les typechecks des deux éditions et lint. **DS et S1 n'avaient pas le dossier v4** : leurs points [fiche] restent à relire.

**LOT-04, L'argent :**

| # | Point | Décision |
|---|---|---|
| 1 | Arrondi de la TVA (par taux ou par ligne) | **Provisoire, révisable par Harun** : la refonte suit `src/lib/money.ts`, par ligne. `money.ts` sert aussi l'édition cliente, qui ne change pas, et toutes les factures d'une organisation doivent suivre la même règle. L'écart est porté à Harun, pour l'avis d'un comptable. |
| 2 | Régime de TVA | **Provisoire, révisable par Harun** : c'est un réglage de l'entreprise. Par défaut, TVA sur les encaissements pour les prestations de services, sur les débits pour les ventes de biens. La mention « à valider par un comptable » reste affichée. |
| 3 | Seuils (30 j, 60 j, le 20, 14 j, 12 semaines, 80 %, 5 j, 30 j, 2 j) | **Adoptés comme valeurs de départ**, modifiables (provisoire, révisable par Harun). |
| 4 | Numérotation | **Le format du module existant** (`AAAA-NNNN`, `AV-AAAA-NNNN`) : la suite des numéros ne doit jamais se rompre. Les jeux de SIM s'y alignent. |
| 5 | Revenu récurrent | Comme proposé : « Paiement échoué » compté, « En pause » non, sous réserve de la fiche. |
| 6 | Taux des pénalités | Un réglage de l'**identité de facturation**, repris par H18. Par défaut, le minimum légal, présenté comme tel. |
| 7 | Comptes de la trésorerie | Le **compte courant par défaut**. L'épargne s'ajoute par un interrupteur et reste montrée à part. |
| 8 | Doublon de format | Remplacé par `src/socle/formats.ts` à la construction. La copie ne sert plus qu'aux textes envoyés aux clients. |

**LOT-03, Écrire et retenir :**

| # | Point | Décision |
|---|---|---|
| 1 | Série d'écriture | La règle unique est validée. **Repos par défaut : samedi et dimanche** (la série ne casse pas), réglable. |
| 2 | ME04 Archives | **Pas de nouvelle collection.** L'écran puise dans les sources existantes : la corbeille (H22) et les fichiers archivés (H11). La collection `archives` rejoint la liste présentée à Harun. |
| 3 | Présence en direct | Acceptable au premier jet : « Enregistré » seulement, sans curseur simulé. |
| 4 | Contrat arrivant à échéance | « À renouveler » à l'approche de l'échéance, sinon « Signé ». |
| 5 | Menu « / » (14 annoncées, 13 listées) | On suit la liste : **13**. L'écart avec la fiche est noté. |
| 6 | Dictée (tuile de F20) | **Oui** : la tuile ouvre la barre ⌘J avec la commande vocale existante, sans toucher à `src/assistant/**`. |

## 2. Les lots

Ordre : **LOT-00 d'abord, fusionné** ; puis les lots 01 à 08 et **10** en parallèle, une branche chacun ; **LOT-09 en dernier**. Les chiffres viennent de `03-INDEX.md` : 9 + 16 + 13 + 9 + 17 + 10 + 15 + 16 + 12 + 11 + 14 = **142**. (Le tableau du fichier 00 compte G05 dans LOT-05 ; l'index et les prompts le rangent dans LOT-00. Le CO suit l'index.)

| Vague | Lot | Écrans (re-habillage / mixte / nouveau) | Branche | Session | Modèle · effort | Dépend de | État |
|---|---|---|---|---|---|---|---|
| 1 | **LOT-00** Système et démarrage | 9 (0 / 7 / 2) | `claude/refonte-socle` | S0 | Opus 5.5, élevé | aucune | **v2 fusionné** (`488cdcc`) ; socle v3 en cours |
| 2 | **LOT-01** Ma journée | 16 (0 / 12 / 4) | `claude/refonte-journee` | S2 | Sonnet 5.5, élevé | socle v3 fusionné | à faire |
| 2 | **LOT-02** Mes contacts et clients | 13 (0 / 12 / 1) | `claude/refonte-contacts` | S1 | Sonnet 5.5, élevé | socle v3 fusionné | à faire |
| 2 | **LOT-03** Écrire et retenir | 9 (0 / 8 / 1) | `claude/refonte-ecrire` | S5 | Sonnet 5.5, élevé | socle v3 fusionné | à faire |
| 2 | **LOT-04** L'argent | 17 (0 / 16 / 1) | `claude/refonte-argent` | DS | Sonnet 5.5, élevé | socle v3 fusionné | à faire |
| 2 | **LOT-05** Échanger | 10 (0 / 9 / 1) | `claude/refonte-echanger` | S5 | Sonnet 5.5, élevé | socle v3 fusionné ; après LOT-03 | à faire |
| 2 | **LOT-06** Créer et produire | 15 (0 / 14 / 1) | `claude/refonte-creer` | S7 (à créer) | Sonnet 5.5, élevé | socle v3 fusionné | à faire |
| 2 | **LOT-07** Outils et réglages | 16 (0 / 12 / 4) | `claude/refonte-outils` | S6 | Opus 5.5, élevé | socle v4 fusionné ; priorité de sécurité de S6 terminée | à faire |
| 2 | **LOT-08** La Garde et la supervision | 12 (0 / 11 / 1) | `claude/refonte-garde` | S3 | Opus 5.5, élevé | socle v3 fusionné | préparation (note, §1.8) |
| 3 | **LOT-09** Mobile et tablette | 11 (0 / 0 / 11) | `claude/refonte-mobile` | S1, après LOT-02 | Sonnet 5.5, élevé | lots 01 à 08 et 10 fusionnés | à faire |
| 2 | **LOT-10** Cyber | 18 (0 / 4 / 14, dont 4 `CYB-*` sans fiche) | `claude/refonte-cyber` | S6, après LOT-07 | Opus 5.5, élevé | socle v3 fusionné ; phase 1 de S6 ; LOT-07 | à faire |
| 2 | **LOT-11** Espace Développement | 7 images `DEV-*` (fiches à écrire par S8 ; vue d'ensemble à proposer) | `claude/refonte-developpement` | S8 (à créer) | Opus 5.5, élevé | socle v4 fusionné ; LOT-12 pour les connecteurs | **fiches à écrire maintenant** |
| 2 | **LOT-12** Connecteurs et autonomie | modèle et moteurs (écran : H21, LOT-07) | `claude/refonte-connecteurs` | S9 (à créer) | Opus 5.5, élevé | socle v3 fusionné pour les écrans ; relu par S6 et T1 | préparation possible |
| — | **LOT-13** Serveur | **en pause** (12 nov.) : ni comparatif ni guide pour l'instant | `claude/refonte-serveur` | SRV (à créer) | Sonnet 5.5, élevé | décision de Harun | en pause |
| — | **LOT-14** Charge et essais longs | scénarios, 72 h, seuils | (branches de SIM et T1) | SIM et T1 | Sonnet 5.5, élevé | chargeur de SIM ; serveur cible | à lancer |
| — | **SEC-0**, puis **DIST** | rapport SEC (privé), puis distribution interne privée | (privé) | S6, Harun | Opus 5.5, max | avant toute distribution à l'équipe | en cours (S6) |

## 3. Répartition (décisions de Harun du 1er nov. incluses)

| Session | Lot | Avis | Précisions |
|---|---|---|---|
| S0 Socle | LOT-00 puis socle v3 | ✓ | LOT-00 (v2) fusionné. Socle v3 en cours : §1.10 et §5. |
| S2 | LOT-01 | ✓ | N01 remplace son Accueil ; M1, M2 et M4 sont absorbés par G05, H40 et H42. Ses 5 commits postérieurs (`b228f5d`) ne sont pas fusionnés. |
| S1 | LOT-02, puis LOT-09 | ✓ | **LOT-09 confié à S1 après LOT-02** (décision de Harun). |
| S5 | LOT-03, puis LOT-05 | ✓ | S5 reste propriétaire du registre. |
| DS | LOT-04 | ✓ à condition | Ne pousse plus dans `src/socle/**`. Banque en lecture seule ; LOT-04 n'affiche que l'état « connecté / à connecter », la configuration est dans H21 (LOT-07). |
| **S7** (nouvelle) | LOT-06 | ✓ | **Décision de Harun : LOT-06 confié à S7, F1 écartée.** Sonnet 5.5, effort élevé. À créer. |
| F1 | — | écartée de LOT-06 | Continue l'Atelier. Vérificateur cassé sur `refonte-vivante` (C-003, patch de T1 à appliquer par F1). Ses modules rejoignent les familles par le registre, après LOT-06. |
| S6 | LOT-07, puis LOT-10 | ⚠ à condition | Les deux après sa phase 1 (privée ; Harun dit au CO quand elle est finie). LOT-07 d'abord : CY07 étend MO02 (Sites et trackers), qui est dans LOT-07. 30 écrans à elle seule, Opus 5.5, effort élevé. Audit privé ; commits sans description de faiblesse ; écrans sensibles relus par T1. |
| S3 | LOT-08 | ✓ | Règles du §1.8. Zone élargie à `src/bureaux/cyber/**` (partage dans `REGLES.md`). Ajoute « Ouvrir Cyber » sur F70. |
| T1 | transversal | ✓ | API d'essai et bac à sable **fusionnés** (`97929c1`). Seule session autorisée à `build:web` sur données fictives (`REGLES.md`). Fait les captures et les comparaisons à ± 2 px de tous les lots. Outil de fidélité fusionné (`3cc8dff`). |
| SIM | transversal | ✓ | **100 jeux fusionnés** (`4fe559b`), `check:donnees` à 87 contrôles en CI, règles validées (§1.11). Enchaîne : dates v3, chargeur vers l'API d'essai, attendus des écrans calculés. |

## 4. Sessions et branches (état au 1er nov.)

| Session | Branche | État | Dernier sha | Rapport | Points |
|---|---|---|---|---|---|
| S0 / LOT-00 | `claude/refonte-socle` | **v2 fusionné** (`488cdcc`) ; socle v3 à suivre sur la même branche | `fdd6366` | `rapports/LOT-00.md` (sur sa branche) | Questions de LOT-00 : §7, section LOT-00 |
| DS | `claude/refonte-design-socle` | gelée, reprise par LOT-00 | `e97f479` | `rapports/DS.md` (branche LOT-00) | — |
| S1 | `claude/refonte-s1-navigation` | fusionnée (ancienne tranche) | `e788af8` | [`rapports/S1.md`](rapports/S1.md) | Prend LOT-02 puis LOT-09 |
| S2 | `claude/refonte-s2-accueil` | fusionnée à `a537dbe` ; 5 commits non fusionnés | `b228f5d` | [`rapports/S2.md`](rapports/S2.md) | Remplacée par LOT-01 |
| S3 | `claude/refonte-s3-supervisor` (ancienne), `claude/refonte-garde` (LOT-08) | ancienne fusionnée ; LOT-08 en préparation (note seulement, aucun code) | `e7f4f25`, `2eedc9b` | `docs/refonte/preparation-garde.md` (branche LOT-08) | 15 questions tranchées au §1.8 |
| S4 | — | annulée | — | — | — |
| S5 | `claude/refonte-s5-modules` | fusionnée, y compris les 4 commits postérieurs (`5410081`) | `b82e50f` | [`rapports/S5.md`](rapports/S5.md) | Prend LOT-03 puis LOT-05 |
| S6 | `claude/refonte-sec-*` | phase 1 en cours, privée. **Ne pas fusionner sans décision de Harun.** | — | `docs/securite/**`, hors dépôt | Prend LOT-07 puis LOT-10 |
| S7 | `claude/refonte-creer` | **à créer** | — | — | LOT-06 |
| F1 | `claude/refonte-atelier-f1` | prête, non fusionnée, rien de branché | `59056ad` | `docs/atelier/PRET.md` | C-003 à appliquer ; 3 modules choisis (§1.21), à intégrer après le socle v4 |
| T1 | `claude/refonte-qualite-t1`, `claude/refonte-qualite` | **les deux fusionnées** (`97929c1`, `3cc8dff`) | `51a962d`, `f2e243a` | [`../qualite/SANTE.md`](../qualite/SANTE.md) | Passage 2 à faire sur `refonte-vivante` |
| SIM | `claude/refonte-donnees-fictives`, `claude/refonte-sim-bac-a-sable` | **données fusionnées** (`4fe559b`) + `check:donnees` en CI ; bac à sable non fusionné | `4fe559b`, `95d9765` | [`rapports/DONNEES.md`](rapports/DONNEES.md) | Suite : §1.11 |
| G0 | — | retirée | — | — | — |

### Zones

| Session | Zone |
|---|---|
| Lots 00 à 10 | `src/refonte/<lot>/**`, le fichier de sa famille dans `src/refonte/modules/declarations/`, ses textes dans `src/refonte/<lot>/i18n.ts`, sa section de `STATUT.md`. LOT-00 seul écrit dans `src/socle/**` et livre le mécanisme de substitution. |
| LOT-08 et LOT-10 | en plus, `src/bureaux/cyber/**`, partagé selon `REGLES.md`. LOT-10 : `src/refonte/cyber/**` et `declarations/cyber.ts`. |
| S6 | `docs/securite/**` (hors dépôt) et `src/securite/**` ; pour ses lots, `src/refonte/outils/**` et `src/refonte/cyber/**`. |
| F1 | `src/ateliers/**` et `docs/atelier/**`. |
| T1 | `tests/**`, `scripts/qualite/**`, `docs/qualite/**`. Constats de sécurité : à S6, en privé. |
| SIM | `simulation/**`, `docs/simulation/**`, `src/refonte/donnees/**`, `scripts/check-donnees.ts`. |

**Relances automatiques : aucune**, tant que Harun n'a pas validé le plafond proposé (une relance par nuit et par piste).

## 5. Qui peut travailler, et ce qui lui manque (1er nov., après le passage à la v3)

**État.** LOT-00 (socle v2) et les 4 commits de S5 sont fusionnés dans `refonte-vivante` (`488cdcc`, `5410081`) ; les gardes sans navigateur y sont vertes. Le GO du matin pour les lots 01 à 08 et 10 est **ajusté, pas retiré** : le design est maintenant v3, et un écran construit sur les briques v2 serait à refaire. Donc :

- **Construction visuelle d'un écran : à la fusion du socle v3** (§1.10), pas avant.
- **Tout le reste peut commencer maintenant**, avec le zip v3 du lot : (1) lire les fiches v3 et écrire une note de préparation `docs/refonte/preparation-<lot>.md` sur sa branche (module existant, données disponibles, ce qui manque ; S3 l'a déjà fait pour La Garde, à reprendre sur les fiches v3) ; (2) construire la logique pure du lot dans `src/refonte/<lot>/` : modèles, calculs, hooks, textes fr/en, avec leurs gardes, **sans importer de brique visuelle du socle** ; (3) lister dans la section du lot de `STATUT.md` ce qui manque au socle.

| Session | Peut travailler maintenant ? | Sur quoi | Ce qui lui manque |
|---|---|---|---|
| **S0** | **oui, priorité absolue** (ULTRA) | Finir le socle v3 sur `claude/refonte-socle` : ce qui reste est listé au §1.12 (`ModuleTile` et briques partagées, substitution, calculs « Aujourd'hui » et pastille exportés, `check:coquille`, pièces de H43, veille sans contenu de notification, bascule après T1). Puis envoyer la liste des composants au CO | rien (réponses au §1.12) |
| **S2** | préparation et logique | LOT-01 `claude/refonte-journee` : note de préparation ; règles de calcul des séries, paliers, défis et jalons (L01, L07, H02, H04), à protéger telles quelles (§1.10) | zip v3 de LOT-01 ; socle v3 pour construire |
| **S1** | préparation et logique | LOT-02 `claude/refonte-contacts` : note de préparation ; modèles du pipeline et des relances | zip v3 de LOT-02 ; socle v3 |
| **S5** | préparation et logique | LOT-03 `claude/refonte-ecrire` puis LOT-05 `claude/refonte-echanger` : notes de préparation ; G07 en boîte des clients (§1.10 point 10) | zips v3 de LOT-03 et LOT-05 ; jeux Écrire et Échanger : fusionnés ; socle v3 |
| **DS** | préparation et logique | LOT-04 `claude/refonte-argent` : note de préparation ; calculs d'argent ; banque en lecture seule | zip v3 de LOT-04 ; socle v3 |
| **S7** | **oui** (créée le 6 nov.) | LOT-06 `claude/refonte-creer` : préparation déjà poussée (`e402d0e`) ; la compléter (prompt du 6 nov.) | socle v3 pour construire |
| **S3** | préparation et logique | LOT-08 `claude/refonte-garde` : mettre sa note `preparation-garde.md` à jour sur les fiches v3 ; règle de la pastille (N02 §6.2) et calculs d'état par organisation (§1.8) | zip v3 de LOT-08 ; jeux La Garde : fusionnés ; socle v3 |
| **S6** | **oui** | Phase 1 sécurité (privée). Puis LOT-07 `claude/refonte-outils` et LOT-10 `claude/refonte-cyber`, dont les connecteurs de H21 (WhatsApp, SMS) qu'attendent G07 et H13 | fin de la phase 1 ; zips v3 de LOT-07 et LOT-10 ; socle v3 |
| **T1** | **oui** | Passage 2 sur `refonte-vivante` (paquet client identique, gardes navigateur coquille éteinte puis allumée) ; adapter l'outil de fidélité aux images v3 (dates fictives du 30 oct. 10:42, mardi 3 nov. pour Cyber) | rien (images lot par lot) |
| **SIM** | **oui, elle enchaîne** | (1) dates des jeux sur les images v3 (10 h 42 le 30 oct., mardi 3 nov. pour Cyber) ; (2) chargeur vers l'API d'essai, La Garde avec S3 ; (3) valeurs attendues des écrans calculés (H09, H04, G08, H25) ; (4) champs manquants signalés par les lots | rien |
| **F1** | **après le socle v4** | Correctif C-003 ; intégrer `tauxHoraire`, `echeancier`, `comparateurDevis` (§1.21) | la fusion du socle v4 |
| **S1 (LOT-09)** | après les lots 01 à 08 et 10 | LOT-09 `claude/refonte-mobile` (inchangé en v3) | — |

**À lancer en premier après la fusion du socle v3**, par vagues (toutes les sessions ont leur zip v3 et leur note de préparation) :

1. **S2 (LOT-01) et S3 (LOT-08)** : ce sont elles qui produisent les chiffres que les autres écrans lisent (« Aujourd'hui », séries, pastille de La Garde).
2. **S1 (LOT-02), S5 (LOT-03 puis LOT-05), DS (LOT-04), S7 (LOT-06)** en parallèle.
3. **S6 (LOT-07 puis LOT-10)** dès la phase 1 terminée ; LOT-10 après LOT-07 parce que CY07 étend MO02 et CY11 s'appuie sur H20.
4. **S1 (LOT-09)** en dernier.

**Prérequis des lots 01 à 10 : les 100 jeux de données, fusionnés (`4fe559b`).** Les lots y lisent `src/refonte/donnees/` ; il leur manque encore, côté données, le chargeur vers l'API et les attendus calculés (SIM, §1.11).

Décisions prises par le CO, par délégation de Harun : les règles du §1.8, l'allumage de la coquille (§1.9), la procédure F1, l'entrée de `ModuleTile` dans le socle (§1.10). Restent à Harun (le choix des modules de F1 est fait, §1.21) : la constante « 12 organisations » de G06 (texte de la fiche par défaut), la création de S7.

**Fusion d'un lot** : relu par T1, paquet client identique, gardes vertes, éléments ludiques protégés présents (§1.10). Le CO fusionne dans `refonte-vivante`, jamais dans `main` ; Harun valide le passage dans `main`.

Dépendances croisées à surveiller :

- la pastille de La Garde (S0 l'affiche, S3 en fixe la règle) et « Aujourd'hui » (S0 l'affiche, S2 en fixe les chiffres) ;
- les connecteurs (LOT-04 lit leur état, LOT-07 les configure, LOT-05 en dépend pour G07 et H13) ;
- le registre et `TousLesModules` (propriétaire S5) ;
- Cyber : CY07 étend MO02 (LOT-07), CY11 s'appuie sur H20 (LOT-07), CY12 sur H03 (LOT-01), CY13 sur H11 et H12 (LOT-03), CY04 et F70 se renvoient l'un à l'autre.

## 6. Ce qui manque au CO

- **La liste des composants de S0** : c'est le signal de fusion du socle v3.
- **Le passage de T1 sur `claude/refonte-socle`** : il conditionne la bascule de la coquille.
- La fin de la phase 1 de S6.

## 7. Écrans (142, plus 4 `CYB-*` et 7 `DEV-*`)

Une ligne par écran, par lot. **Chaque session ne modifie que la section de son lot** (état : `à faire`, `en cours`, `fait`, `écart`, avec la raison en note). Les sections sont séparées pour que les branches ne se gênent pas à la fusion. Le CO tient les autres sections.

Total : 142 écrans = 0 re-habillage + 105 mixtes + 37 nouveaux (types de l'index v3 du 6 nov.). Captures et comparaisons à ± 2 px : faites par T1 (colonne « Écart / note »).

### LOT-00 · Système et démarrage — `claude/refonte-socle` — 9 écrans

8 sur 8 faits par S0, **fusionné** (`488cdcc`, rapport [`rapports/LOT-00.md`](rapports/LOT-00.md)). Aucune capture, l'app n'ayant pas été lancée : T1 les fera au passage 2.

| ID | Écran | Type | État | Écart / note |
|---|---|---|---|---|
| H40 | Système · Notifications | mixte | fait | `/notifications`, cloche de l'en-tête. Seul le canal « App » a des émetteurs ; mail et mobile : filtres seulement |
| H41 | Système · Recherche ⌘K | mixte | fait | « Écrire à X » ouvre `mailto:` ; pas de ⌘↵ (fenêtre unique d'Electron) |
| H42 | Système · Démarrage | mixte | fait | `/demarrage`, une fois, à la toute première connexion. Étapes 5 et 6 (paiement, appareil mobile) manuelles : aucune donnée de connecteur |
| H47 | Système · Choisir son métier | mixte | fait | `/demarrage/metier`. Réglage personnel, pas d'organisation ; « Passer » ne masque aucun module |
| H43 | Système · États et messages | nouveau | fait | `/dev/etats`, en développement seulement, et les briques `situations` |
| D02 | Système · Tous les modules | mixte | fait | Comptes par famille tirés du registre (14 / 7 / 12 / 12 / 15 / 7 / 19 / 15), pas de la maquette (12 / 14 / 9 / 18 / 10 / 16 / 14 / 8). Total 101 et niveaux 16 / 62 / 23 conformes |
| G06 | Système · Connexion | mixte | fait | `/login`. « Demandez un accès » affiche un texte, sans flux de demande ; « 12 organisations » est une constante de présentation à valider |
| G05 | Échanger · Ajmani, barre ⌘J ouverte | mixte | fait | Prépare un brouillon de relance, n'envoie rien ; « Décrire » passe à l'assistant existant |
| G09 | Système · Écran de veille | nouveau | fait dans le socle v3 (non fusionné) | Ajouté le 6 nov. Capture comparée : 0 % hors ± 2 px. Verrouillage : écart gardé (§1.12). Bascule avec la nouvelle coquille |

Questions de S0 et réponses du CO :

1. *Allumer la nouvelle coquille par défaut ?* Oui, dans le socle v3, après le passage 2 de T1 (§1.9).
2. *Phrase « Connexion protégée… journal de la Garde » et constante « 12 organisations » (G06) ?* À valider par Harun. Par défaut, on garde le texte de la fiche, et la constante reste un texte fixe, jamais une donnée lue avant la connexion.
3. *Réglage d'organisation pour le métier (H47) ?* Pas au premier jet : le réglage reste personnel, la solution la plus simple.
4. *Émetteurs « mail » et « mobile » pour H40 ?* Hors LOT-00. Le mobile passe par LOT-09 (notifications web), le mail devient une demande à amn-api.

Gardes en échec avant comme après le lot, sans lien avec lui : `check:encres` (`src/refonte/garde/equipes.ts`), `check:migration`, `check:xss`, `check:visite`, `check:support`. Aucune n'est dans la CI ; elles attendent un environnement.

#### Composants disponibles pour les autres lots

Tout s'importe depuis `src/socle/ui` (`index.ts`), dans le code interne seulement, jamais depuis un fichier partagé.

| Groupe | Dossier | Contenu |
|---|---|---|
| Base | `src/socle/ui/*.tsx` | `Bouton` (`raccourci`), `Carte`, `Modale`, `Saisie`, `TuileKpi`, `BarreProgression`, `AnneauProgression`, `Etiquette`, `PastilleEtat`, `Avatar`, `PileAvatars`, `Raccourci`, `CaseACocher`, `LigneTache`, `LigneActivite`, `EtapeFranchie`, `EtatVide`, `Squelette` |
| Contrôles | `controles/` | `Interrupteur`, `BoutonIcone`, `Selecteur`, `BoiteRecherche`, `Onglets`, `Segmente`, `SuggestionAjmani`, `Tag`, `SousCarte`, `CarteCases`, `CarteAnneau`, `CarteSerie`, `CarteJalon` |
| Situations | `situations/` | `EtatChargement`, `SqueletteLignes`, `DialogueConfirmation`, `FournisseurToasts` + `useToastsSocle`, `AvisCollaboration` |
| Graphiques | `graphiques/` | `Courbe`, `MiniCourbe`, `Barres`, `Donut`, `Anneau` ; formats `formaterNombre`, `formaterEuro`, `formaterPourcent` |
| Archétypes | `archetypes/` | `Page`, `RangeeKpi`, `ColonneDroite`, `Kanban`, `GrilleCartes`, `Scinde`, `Semaine`, `LigneTemps`, tableau triable (`trierLignes`…) |
| Coquille | `src/socle/coquille/` | `BarreLaterale`, `EnTete`, `BarreAjmani`, `Coquille` |
| Système | `src/refonte/systeme/` | notifications, recherche, Ajmani, modules, connexion, démarrage, H43, démonstration (`/dev/socle`) |

Mots fr/en par `definirMots`. Gardes : `check:socle-controles|graphiques|situations|archetypes|coquille`, `check:systeme-modules|notifications|recherche|ajmani|demo|demarrage`.

### LOT-01 · Ma journée — `claude/refonte-journee` — 16 écrans

**À ne pas simplifier** (§1.10) : le défi d'équipe L07, les trophées et paliers (H02, H04, L01) et les défis hebdomadaires. Aucun chiffre individuel, aucun classement, aucun reproche.

| ID | Écran | Type | État | Écart / note |
|---|---|---|---|---|
| N01 | Ma journée · Accueil | mixte | à faire | |
| H25 | Ma journée · Tableau de bord, widgets | mixte | à faire | |
| G08 | Ma journée · Cockpit client : Stripe, utilisateurs, tickets | mixte | à faire | |
| H01 | Ma journée · Calendrier | mixte | à faire | |
| H02 | Ma journée · Tâches | mixte | à faire | |
| H03 | Ma journée · Missions et tickets, kanban | mixte | à faire | |
| H04 | Ma journée · Bilan de la semaine | mixte | à faire | |
| MJ01 | Ma journée · Projets | mixte | à faire | |
| MJ03 | Ma journée · Planning de l'équipe | mixte | à faire | |
| MJ02 | Ma journée · Habitudes | mixte | à faire | |
| MJ04 | Ma journée · Notes rapides | mixte | à faire | |
| MJ05 | Ma journée · Rappels | mixte | à faire | |
| L03 | Ma journée · Rituel du matin | nouveau | à faire | |
| L02 | Ma journée · Mode Focus | nouveau | à faire | |
| L01 | Ma journée · Séries et jalons | nouveau | à faire | |
| L07 | Ma journée · Défis d'équipe | nouveau | à faire | |

### LOT-02 · Mes contacts et clients — `claude/refonte-contacts` — 13 écrans

| ID | Écran | Type | État | Écart / note |
|---|---|---|---|---|
| F10 | Contacts · Vue d'ensemble | nouveau | en cours (préparation) | préparation : aucune logique propre, lit les autres. Attend `ModuleTile`, `ModuleGroupGrid`, `AddModuleTile` |
| H05 | Contacts · Clients | mixte | en cours (préparation) | préparation : `ClientsScreen` `/clients` ; santé et statut à recalculer (SIM) |
| G04 | Contacts · Fiche client | mixte | en cours (préparation) | préparation : `ClientDetail` dans `ClientsScreen` ; « contacts par client » livré (`interlocuteurs.ts`) |
| H06 | Contacts · Prospects | mixte | en cours (préparation) | préparation : `PipelineScreen` `/pipeline` ; logique `pipeline.ts` |
| H44 | Contacts · Retours clients | mixte | en cours (préparation) | préparation : `ReviewsScreen`, `SentimentScreen`, `NpsScreen` ; sentiment et NPS sans jeu propre |
| H45 | Contacts · Fournisseurs | mixte | en cours (préparation) | préparation : `SuppliersScreen` `/fournisseurs` ; pas de logique neuve |
| MC01 | Contacts · Pipeline commercial | mixte | en cours (préparation) | préparation : même écran que H06 ; `colonnesPipeline`, `transitionsPermises` |
| MC02 | Contacts · Fidélité | mixte | en cours (préparation) | préparation : l'écran actuel est une carte à tampons, la fiche des points et niveaux → question au CO (note §5, 1) |
| MC03 | Contacts · Fiches contacts | mixte | en cours (préparation) | préparation : aucun écran existant ; collection d'interlocuteurs à créer (note §5, 3) |
| MC04 | Contacts · Équipe | mixte | en cours (préparation) | préparation : recoupe le trombinoscope (`DirectoryScreen`) |
| MC05 | Contacts · Partenaires | mixte | en cours (préparation) | préparation : aucun écran ni jeu d'organisations partenaires |
| MC06 | Contacts · Rendez-vous clients | mixte | en cours (préparation) | préparation : `AgendaScreen` partagé (couture requise) et `BookingScreen` ; logique `rendezvous.ts` |
| MC07 | Contacts · Relances | mixte | en cours (préparation) | préparation : `RemindersScreen` ne relance que les factures ; logique `relances.ts` pour les cinq motifs |

Préparation par S1 (14 nov., `claude/refonte-contacts`) : note [`preparation/LOT-02-contacts.md`](preparation/LOT-02-contacts.md), logique dans `src/refonte/contacts/`, garde `check:contacts` (63 contrôles). Aucun écran visuel. **Les 13 fiches et le dossier v4 n'ont pas pu être lus** (zips absents de l'environnement) : les règles qui en dépendent sont marquées « à confirmer ».

**Manque au socle**
- `ModuleTile`, `ModuleGroupGrid`, `AddModuleTile` (décidés au §1.10, absents de la liste des composants disponibles) pour F10.
- `PageHead`, `IconTile`, `FlagUrgent` : cités au §1.10, à confirmer par S0 (`Page`, `Etiquette` et `PastilleEtat` existent).
- Un `Kanban` existe ; son glisser-déposer doit appliquer `transitionsPermises` (MC01).
- `check:tutoiement` : pas encore dans la base.

**Manque aux données**
- Un jeu d'organisations partenaires (MC05) : seuls des interlocuteurs de type `partenaire` existent.
- Sentiment et NPS (H44) : pas de jeu propre, à dériver des `avis`.
- Une raison de perte sur les prospects perdus (H06).
- Les avantages de fidélité « offerts / utilisés » côté app : le jeu de SIM les porte, aucune collection ne les garde.
- Une collection d'interlocuteurs côté app (MC03, G04, source de H41).

### LOT-03 · Écrire et retenir — `claude/refonte-ecrire` — 9 écrans

| ID | Écran | Type | État | Écart / note |
|---|---|---|---|---|
| F20 | Écrire · Vue d'ensemble | nouveau | en cours (préparation) | préparation : page sans module ; logique `hub.ts`, `relecture.ts`, `serie.ts`. Attend `ModuleTile`, `ModuleGroupGrid`, `AddModuleTile` |
| H10 | Écrire · Notes | mixte | en cours (préparation) | préparation : `PagesScreen` `/pages` (les notes rapides `/notes` sont MJ04, LOT-01) ; logique `pages.ts` ; écart : le menu « / » compte 12 blocs, la fiche en annonce 14 |
| H11 | Écrire · Documents | mixte | en cours (préparation) | préparation : `ClasseurScreen` `/classeur` et `/media` ; logique `documents.ts` ; téléversement, partage et faits relevés « non disponibles » |
| H12 | Écrire · Signatures | mixte | en cours (préparation) | préparation : `SignatureDistanceScreen` `/signature-a-distance` ; logique `signatures.ts` (circuit, délai moyen, relances automatiques) |
| ME03 | Écrire · Modèles | mixte | en cours (préparation) | préparation : `TemplatesScreen` `/outils/modeles` ; logique `modeles.ts` (variables `{nom}`, case proposée) |
| ME01 | Écrire · Journal | mixte | en cours (préparation) | préparation : `DiaryScreen` `/personnel/journal`, local au poste ; logique `journal.ts` ; humeur à 5 niveaux absente des données |
| ME02 | Écrire · Rédaction et traduction | mixte | en cours (préparation) | préparation : `RedactionScreen`, `TraductionScreen` ; logique `redaction.ts` |
| ME04 | Écrire · Archives | mixte | en cours (préparation) | préparation : **aucun module existant** ; logique `archives.ts` ; collection à décider (note §6, 2) |
| ME05 | Écrire · Base de connaissances | mixte | en cours (préparation) | préparation : `KnowledgeScreen` `/knowledge` (titre, texte, date) ; logique `connaissances.ts` dont la réponse sourcée d'Ajmani |

Préparation par S5 (14 nov., `claude/refonte-ecrire`) : note [`preparation/LOT-03-ecrire.md`](preparation/LOT-03-ecrire.md), logique dans `src/refonte/ecrire/`, garde `check:ecrire` (94 contrôles), rapport [`rapports/LOT-03-preparation.md`](rapports/LOT-03-preparation.md). Aucun écran visuel. Dossier v4 lu (fiches, `06`, `tutoiement.json`) ; **les images v4 n'ont pas été ouvertes**. La série d'écriture est une seule règle pour F20, H10 et ME01 (« Proposition » de F20 §9, à valider). La note épinglée d'un client, source demandée par H41, est dans `pages.ts`.

**Manque au socle**
- `ModuleTile` (hauteur 50), `ModuleGroupGrid`, `AddModuleTile` pour F20 ; `ShortcutList` ; `SuggestionCompact` (cités, à confirmer par S0).
- L'icône de « Téléverser » (H11) est une flèche vers le bas dans le socle ; elle doit pointer vers le haut.
- `formats.ts` : le lot garde une copie de `nombre`, `pct`, `tailleLisible` à retirer à la fusion du socle v4.
- `check:tutoiement` : pas encore dans la base (la garde du lot refuse « vous / votre / vos » et les impératifs en « -ez » dans ses textes).

**Manque aux données**
- Pages : blocs avec échéance et liens vers d'autres pages ; commentaires ancrés ; propriétés (client lié, statut) ; présence en direct.
- Documents : intercalaires, partage avec lien externe, faits relevés d'un contrat, quota (aucun stockage nouveau, §1.27 n° 10).
- Signatures : champs posés, rôle « en copie », relances automatiques planifiées.
- Journal : humeur sur 5 niveaux, énergie, mercis (le jeu fictif a 4 niveaux).
- Base de connaissances : étapes, rubriques, journal de lectures, statut ; articles liés.
- Archives : éléments archivés, règles, restaurations, texte indexé.
- F20 : une demande de relecture comme objet.
- Aucune collection synchronisée n'est ajoutée sans l'accord de Harun (§1.27 n° 4) : en attendant, « non disponible », avec la raison.

### LOT-04 · L'argent — `claude/refonte-argent` — 17 écrans

Préparation par DS (14 nov.) : logique pure `src/refonte/argent/` et `check:argent` (53 propriétés, cas écrits à l'avance, rejeu sur les jeux de SIM). Note : [`preparation/LOT-04-argent.md`](preparation/LOT-04-argent.md). Aucun écran avant la fusion du socle v4. **Dossier v4 non disponible pendant la préparation** : les points marqués [fiche] sont à relire avec les fiches.

| ID | Écran | Type | État | Écart / note |
|---|---|---|---|---|
| F30 | Argent · Vue d'ensemble | nouveau | en cours (préparation) | logique prête : impayés, TVA du mois, trésorerie, revenu récurrent ; hub `/ensemble/argent` (S0) |
| G03 | Argent · Facturation | mixte | en cours (préparation) | `facturation.ts` : totaux par taux, reste dû (avoirs, règlements partiels), statut, numérotation, mentions |
| H07 | Argent · Devis | mixte | en cours (préparation) | `devis.ts` : état, transformation, **devis prérempli** (source de H41 et H42), devis → facture, acompte ; place du Comparateur de devis (F1) |
| H08 | Argent · Dépenses | mixte | en cours (préparation) | `depenses.ts` : HT et TVA depuis un TTC, catégories, justificatifs |
| H09 | Argent · Prévisions | mixte | en cours (préparation) | `tresorerie.ts` : projection 12 semaines, scénarios attendu et prudent, point bas, besoin ; **attendus de SIM non livrés** |
| MA07 | Argent · Trésorerie | mixte | en cours (préparation) | `tresorerie.ts`, `banque.soldeTotal` ; quels comptes comptent (à trancher) |
| MA04 | Argent · Impayés | mixte | en cours (préparation) | `impayes.ts` : tranches, priorités, pénalités, indemnité de 40 €, relance préparée au vouvoiement, jamais envoyée |
| MA01 | Argent · Contrats | mixte | en cours (préparation) | rien de propre au lot ; règles de renouvellement [fiche] |
| MA02 | Argent · Comptabilité | mixte | en cours (préparation) | FEC existant repris ; `banque.suggestionsDeRapprochement` |
| MA03 | Argent · Paiements en ligne | mixte | en cours (préparation) | `connecteurs.etatPaiementsEnLigne` (lecture du modèle de S9), `devis.acompte` |
| MA05 | Argent · Notes de frais | mixte | en cours (préparation) | `depenses.notesARembourser` ; remboursement préparé (`banque.preparerOrdre`) |
| MA06 | Argent · Budget | mixte | en cours (préparation) | `budget.ts` : consommé, projection, seuil de 80 % |
| MA08 | Argent · TVA et impôts | mixte | en cours (préparation) | `tva.ts` : débits ou encaissements, crédit, échéances ; « à valider par un comptable » sur chaque résultat |
| MA09 | Argent · Abonnements récurrents | mixte | en cours (préparation) | `abonnements.ts` : revenu récurrent, attrition, prochain prélèvement |
| MA10 | Argent · Banque | mixte | en cours (préparation) | `banque.ts` : **lecture seule**, ordre préparé, IBAN jamais complet ; `connecteurs.etatBanque` |
| MA11 | Argent · Paie | mixte | en cours (préparation) | `paie.ts` : cotisations fictives à 46 % du net, montants masqués par défaut |
| MA12 | Argent · Tarifs et remises | mixte | en cours (préparation) | `tarifs.ts` : marge, marge pondérée, remises (alerte sous le coût) ; place du Taux horaire (F1) |

**Manque au socle** (à vérifier sur la liste v4) :
- brique « montant masqué / révélé » (MA11, aussi G09) ;
- graphique de solde projeté avec ligne zéro, point bas marqué et zone sous zéro (H09, MA07) ;
- tableau ou barres par tranche d'âge des impayés (MA04).

**Manque aux données** (à commander à SIM) :
- règlements partiels (plusieurs paiements par facture) et avoirs ;
- identité fiscale : régime de TVA, franchise en base, taux de pénalités ;
- taux de TVA à 5,5 % et 10 % sur des lignes et des dépenses ;
- remises sur devis et prestations ;
- historique des enveloppes et des soldes par jour ;
- attendus calculés de H09 (déjà commandés, §1.11) ;
- indicateur « facture échue » sur les encaissements prévus.

**À trancher** (note §5) : arrondi de la TVA (par taux, fiche H07, ou par ligne, `src/lib/money.ts`) ; régime de TVA par défaut ; format de numérotation ; seuils proposés ; comptes de la trésorerie.

### LOT-05 · Échanger — `claude/refonte-echanger` — 10 écrans

| ID | Écran | Type | État | Écart / note |
|---|---|---|---|---|
| F40 | Échanger · Vue d'ensemble | nouveau | à faire | |
| G07 | Échanger · Messagerie d'équipe | mixte | à faire | |
| H13 | Échanger · Appels | mixte | à faire | |
| H14 | Échanger · Annonces | mixte | à faire | |
| MX01 | Échanger · Courriel | mixte | à faire | |
| MX02 | Échanger · Réunions | mixte | à faire | |
| MX03 | Échanger · Partage de fichiers | mixte | à faire | |
| MX04 | Échanger · Canaux | mixte | à faire | |
| MX05 | Échanger · Sondages | mixte | à faire | |
| MX06 | Échanger · Réponses automatiques | mixte | à faire | |

### LOT-06 · Créer et produire — `claude/refonte-creer` — 15 écrans

**Mode PRÉPARATION (consigne du CO, 6 nov.)** : le socle v3 n'étant pas fusionné, aucun écran visuel n'est construit. Livré : la note [`preparation/LOT-06-creer.md`](preparation/LOT-06-creer.md) (module existant, données, écarts, écran par écran), la **logique pure des 15 écrans** dans `src/refonte/creer/` (17 fichiers, sans React ni brique du socle) et `npm run check:creer` (137 contrôles, cas limites et tutoiement inclus : cas des fiches écrits à la main, puis jeux fictifs de SIM aux volumes vide, peu, normal, beaucoup ; ajouté à `editions.yml`). Gardes sans navigateur de la CI : toutes vertes sur la branche (`typecheck`, `typecheck:business`, `lint`, les contrôles de `editions.yml`) ; `check:business` attend un build.

La colonne « État » reste `à faire` : un écran n'est « fait » qu'une fois construit, capturé et comparé à son image.

| ID | Écran | Type | État | Écart / note |
|---|---|---|---|---|
| F50 | Créer · Vue d'ensemble | nouveau | à faire | Logique prête : `ligneDeProduction.ts`. « Fabrication » n'existe pas dans le dépôt, « Bons d'intervention » = `InterventionsScreen` ; les 16 modules sont dans 5 familles du registre (question 1) |
| H15 | Créer · Stock | mixte | à faire | Logique prête : `stock.ts`. Le module réel n'a ni emplacement, ni mouvements, ni commandes fournisseur par article (champs à ajouter) |
| H16 | Créer · Chantiers | mixte | à faire | Logique prête : `chantiers.ts`. Le module réel (`AssemblyScreen`) n'a ni budget, ni poids d'étape, ni dates : nouveau modèle à brancher |
| H17 | Créer · Visuels et marque | mixte | à faire | Logique prête : `marque.ts`. Le kit réel est un monogramme : logos, palette nommée et modèles à créer |
| MR01 | Créer · Vidéo | mixte | à faire | Logique prête : `video.ts`. Deux modèles non reliés (`videoEdits`, `videoProductions`) ; pas de moteur de montage : frise en lecture |
| MR02 | Créer · Ma page publique | mixte | à faire | Logique prête : `pagePublique.ts`. Le module réel est une configuration unique, sans sections ni version de travail |
| MR03 | Créer · Tournées | mixte | à faire | Logique prête : `tournees.ts`. Aucun géocodage ni service de plan dans le dépôt (question 5) |
| MR04 | Créer · Matériel | mixte | à faire | Logique prête : `materiel.ts`. Le module réel ne gère que des prêts par créneau |
| MR05 | Créer · Catalogue produits | mixte | à faire | Logique prête : `catalogue.ts`. **Aucun module existant** : collection de produits à créer (question 2) |
| MR06 | Créer · Réservations | mixte | à faire | Logique prête : `reservations.ts`. Ressource générique et détection de conflit à créer ; seul Matériel refuse un chevauchement |
| MR07 | Créer · Commandes | mixte | à faire | Logique prête : `commandes.ts`. Les statuts réels (`new`…`delivered`) et ceux de la fiche se rangent dans les mêmes 4 étapes |
| MR08 | Créer · Boutique en ligne | mixte | à faire | Logique prête : `boutique.ts`. Pas de visites en direct dans le réel (compteur quotidien) ; entonnoir 30 jours déjà dans `guichet.ts` |
| MR09 | Créer · Flotte de véhicules | mixte | à faire | Logique prête : `flotte.ts`. Échéances km et jours déjà dans `ajouts.ts` ; énergie, niveau et conducteur à ajouter |
| MR10 | Créer · Photos de chantier | mixte | à faire | Logique prête : `photos.ts`. Le réel : une photo par phase et par intervention ; dossier multi-photos à créer |
| MR11 | Créer · Qualité et contrôles | mixte | à faire | Logique prête : `qualite.ts`. Le réel : listes de cases et note libre ; écarts, criticité, preuve et signature à créer |

**Ce qui manque au socle v3 (pour le CO / LOT-00)** — à fournir avant la construction visuelle :

1. *Briques partagées déjà annoncées au §1.10* : `ModuleTile` (41 px) et `ModuleGroupGrid` (F50), `PageHead`, `IconTile`, `IconButton`, `StatusPill`, `AvatarStack`, `SearchBox`, `AjmaniBar`, `SuggestionCompact` / `InlineSuggestion`, `FlagUrgent`.
2. *Composants du §0.4 cités par le lot* : `Gauge` (demi-jauge 180°, MR09 et H16), `LiveDot` (MR01, MR02, MR06, MR07, MR08), `FlowLine` (MR03, MR07), `FilterChips` / `Chips` (H15, MR04, MR05, MR10), `Segmented` compact, `Progress` 4 px, `Ring` 26 à 58 px, `Tag`, la carte ludique `check` (MR02, MR03, MR04, MR09 : `CarteCases`), `Kbd`, `Check` 16 à 18 px.
3. *Jetons* : police monospace, gris de décor pour les illustrations (point 15 de `04-ECARTS`), teinte de sélection `#D9A27A` (MR02), hachures orange et grises (MR06), pointillés verts et orange.
4. *Mouvement* : `amn-grow`, `amn-slide`, `amn-bar`, `amnFlow` (pointillé qui s'écoule), `amnHalo`, toutes coupées par `prefers-reduced-motion`.
5. *Compteurs de la barre latérale* : un point d'entrée pour que les modules déclarent un compteur (Stock : articles sous le seuil ; Chantiers : à surveiller ; Commandes : à expédier). Les calculs existent : `articlesASurveiller`, `chantiersASurveiller`, `compter().aExpedier`.
6. *Mise en forme chiffrée* : le module de formats des graphiques du socle ne peut pas être importé hors de la liste de `check:socle-graphiques` ; `commun.ts` en garde une copie minimale (question 7).
7. *Composants propres à chaque écran* (rubrique 5 des fiches : `LevelTube`, `SitePlan`, `BookSpread`, `EditTimeline`, `RouteMap`, `AssetTag`, `ProductMosaic`, `ResourceTimeline`, `OrderPipeline`, `PurchaseFunnel`, `VehicleCard`, `BeforeAfterSlider`, `InspectionSheet`, `ParetoChart`, `ProductionLine`, `WorkToken`…) : construits par le lot dans `src/refonte/creer/`, pas par le socle.

**Mise à jour v4 (14 nov., S7)** : note mise à jour ([`preparation/LOT-06-creer.md`](preparation/LOT-06-creer.md) §0 : néon par `--fam-a` / `--fam-b`, tutoiement, briques du socle, substitution, DEV-modeles-sites sans doublon, déclarations préparées) ; textes calculés passés au tutoiement ; `check:creer` étendu aux cas limites. **Zips v4 reçus et lus le 14 nov.** : fiches et `_data` de LOT-06 identiques au v3 ; paire de la famille Créer `#FFA463` / `#FF6B7A` ; 14 entrées de `tutoiement.json` concernent le lot (note §0). La barre latérale v4 range les 16 modules sous « Créer et produire » (17 entrées avec la vue d'ensemble) : réponse à la question 1 ci-dessous, à confirmer par le CO. Rapport : [`rapports/LOT-06-preparation.md`](rapports/LOT-06-preparation.md).

**Manque aux données** (jeux de `src/refonte/donnees/`, à transmettre à SIM ; la logique les lit comme facultatifs) :

| Écran | Jeu | Champ manquant |
|---|---|---|
| H15 | `articles` | niveau cible ; emplacement par mouvement ; commandes fournisseur (article, quantité, arrivée) ; franco et frais de port du fournisseur |
| H16 | `chantiers` | poids et part réalisée par étape ; interventions planifiées ; livraisons rattachées |
| H17 | `marque` | rôle et part d'usage des couleurs ; règles « à éviter » ; dernière modification |
| MR01 | `videos` | étape « Sous-titrage » ; plans ; sous-titres ; commentaires de relecture ; date de publication |
| MR02 | `pagesPubliques` | sections ; visites par jour ; avis avec accord du client |
| MR03 | `etapesTournee` | durée et distance de trajet ; état « Sur place » |
| MR04 | `equipements` | dernier contrôle ; dernier entretien ; réforme ; affectation datée |
| MR05 | `produits` | photos ; TVA ; prix d'achat ; niveau conseillé ; lignes de vente par semaine |
| MR06 | `ressources`, `reservations` | indisponibilité (garage, hors service) ; historique des conflits |
| MR07 | `commandes` | instant de création ; heure d'échéance ; date de livraison ; paiement en ligne |
| MR08 | (aucun) | sessions en direct ; événements de l'entonnoir ; paniers avec dernière activité ; objectif du trimestre |
| MR09 | `vehicules` | énergie ; niveau de carburant ou de charge ; autonomie ; kilomètres et carburant par jour |
| MR10 | `dossiersPhotos` | orientation des photos ; signature du client |
| MR11 | `controles`, `ecarts` | résultat « sans objet » ; cause et date de relevé de l'écart |
| F50 | (tous) | contrôle qualité ouvert rattaché à un chantier ; étape « Réception » des chantiers |

**Questions pour le CO — toutes tranchées au §1.27 (14 nov.)** ; la note de préparation applique les réponses (liste exacte des modules à rapatrier, routes `/reservations` et `/photos-chantier`, tuile « Modèles de sites », « Fabrication » masqué). Texte d'origine :

1. *Familles du registre.* F50 annonce 16 modules « Créer et produire », mais 11 sont déclarés dans `outils`, `argent`, `echanger` ou `ecrire` et 2 n’existent pas (question 3). Faut-il les rattacher à `creer` (les fichiers de ces familles sont à d'autres lots) ou garder le hub comme simple vue transversale ?
2. *MR05 Catalogue produits* n'existe pas : on crée la collection `products` (avec lien vers `stockItems`) ? Cela touche `SyncContext` et le contrat amn-api.
3. *Noms des deux modules sans maquette* : « Fabrication » (aucun équivalent) et « Bons d'intervention » (= `InterventionsScreen`). Les garder, les renommer, ou masquer « Fabrication » tant qu'il n'existe pas ?
4. *Modèles de données plus riches que le réel* (chantier avec budget et poids, contrôle avec écarts, page en sections, dossier photos) : quelle session les ajoute à `SYNCED_COLLECTIONS` et à amn-api, et quand ? La construction visuelle de H16, MR02, MR10 et MR11 en dépend.
5. *Géocodage, plan et trafic (MR03)* : quel service, et hébergé où (clés côté serveur seulement) ? Sans cela, le plan reste schématique comme `ItinerairesScreen`.
6. *Vidéo* : fusionner `videoEdits` et `videoProductions` en un seul objet (MR01 les réunit) ou garder deux sources et les relier ?
7. *Formats chiffrés* : étendre la liste de `check:socle-graphiques` pour l'import du module de formats, ou le déplacer vers `src/lib` ?
8. *Typographie* : les textes calculés suivent `check:langue` (apostrophes courbes), donc « Il n’en reste que 4. » diffère de la fiche (apostrophe droite) ; d'accord ?
9. *Droit de publier* (MR01, MR02) : distinct du droit d'écrire ? La logique prévoit les deux cas (« Demander la publication »), la réponse relève de H19.
10. *Fichiers (logos, photos, rushes)* : le dépôt n'a pas de stockage pour H17, MR04, MR05, MR10, MR01. Où les met-on avant de construire ces écrans ?
11. *Dates de SIM* : les jeux sont à 10 h 15 le 30 oct., les images à 10 h 42 (suite de SIM, n° 1). La logique n'en dépend pas, mais la comparaison à ± 2 px, si.
12. *Champs manquants des jeux fictifs* : liste en §6 de la note de préparation, à transmettre à SIM.

### LOT-07 · Outils et réglages — `claude/refonte-outils` — 16 écrans

| ID | Écran | Type | État | Écart / note |
|---|---|---|---|---|
| F60 | Outils · Vue d'ensemble | nouveau | à faire | |
| H18 | Outils · Paramètres | mixte | à faire | |
| H19 | Outils · Membres et accès | mixte | à faire | |
| H20 | Outils · Automatisations | mixte | à faire | |
| H21 | Outils · Connecteurs | mixte | à faire | |
| H22 | Outils · Corbeille et historique | mixte | à faire | |
| H23 | Outils · Assistance | mixte | à faire | |
| H24 | Outils · Coffre-fort | mixte | à faire | |
| L04 | Outils · Galerie de modèles par métier | nouveau | à faire | |
| L05 | Outils · Import guidé | nouveau | à faire | |
| L06 | Outils · Nouveautés et aide | nouveau | à faire | |
| MO01 | Outils · Calculs | mixte | à faire | |
| MO02 | Outils · Sites et trackers | mixte | à faire | |
| MO03 | Outils · Sauvegardes | mixte | à faire | |
| MO04 | Outils · Import et export | mixte | à faire | |
| MO05 | Outils · Raccourcis et favoris | mixte | à faire | |

### LOT-08 · La Garde et la supervision — `claude/refonte-garde` — 12 écrans

| ID | Écran | Type | État | Écart / note |
|---|---|---|---|---|
| F70 | La Garde · Vue d'ensemble | nouveau | à faire | |
| N02 | La Garde · Salle de contrôle | mixte | à faire | |
| N03 | La Garde · Veille H24 | mixte | à faire | |
| H30 | La Garde · Organisations | mixte | à faire | |
| H31 | La Garde · Fiche organisation | mixte | à faire | |
| H32 | La Garde · Incident | mixte | à faire | |
| H33 | La Garde · Rondes | mixte | à faire | |
| H34 | La Garde · Maturité SOC | mixte | à faire | |
| H35 | La Garde · Journal d'accès | mixte | à faire | |
| MG01 | La Garde · Alertes | mixte | à faire | |
| MG02 | La Garde · Journal de sécurité | mixte | à faire | |
| MG03 | La Garde · Produits cyber | mixte | à faire | |

### LOT-09 · Mobile et tablette — `claude/refonte-mobile` — 11 écrans

| ID | Écran | Type | État | Écart / note |
|---|---|---|---|---|
| H46 | Mobile · Accueil, tâches, ticket urgent | nouveau | à faire | |
| MB02 | Mobile · Agenda et clients | nouveau | à faire | |
| MB03 | Mobile · Argent | nouveau | à faire | |
| MB04 | Mobile · Messages et alertes | nouveau | à faire | |
| MB05 | Mobile · Recherche, Ajmani, dictée | nouveau | à faire | |
| MB06 | Mobile · Tableau de bord, tickets, modules | nouveau | à faire | |
| MB07 | Mobile · Scan de reçu, dépense, hors ligne | nouveau | à faire | |
| MB08 | Mobile · La Garde | nouveau | à faire | |
| MB09 | Mobile · Connexion, démarrage, écran verrouillé | nouveau | à faire | |
| T01 | Tablette · Accueil | nouveau | à faire | |
| T02 | Tablette · Clients en vue scindée | nouveau | à faire | |

### LOT-10 · Cyber — `claude/refonte-cyber` — 18 écrans

Lire `05-CYBER-MODELE-COMMUN.md` : consentement d'abord (accord signé, périmètre, dates), OSINT limité à l'organisation du client, interface seulement. Famille contextuelle dans la barre latérale (§1.7).

| ID | Écran | Type | État | Écart / note |
|---|---|---|---|---|
| CY01 | Cyber · Vue d'ensemble | nouveau | à faire | |
| CY02 | Cyber · Red Team | nouveau | à faire | |
| CY03 | Cyber · Blue Team | nouveau | à faire | |
| CY04 | Cyber · SOC | nouveau | à faire | |
| CY05 | Cyber · Veille | nouveau | à faire | |
| CY06 | Cyber · OSINT | nouveau | à faire | |
| CY07 | Cyber · Sites et vie privée | mixte | à faire | |
| CY08 | Cyber · Réponse à incident | nouveau | à faire | |
| CY09 | Cyber · Conformité | nouveau | à faire | |
| CY10 | Cyber · Sensibilisation | nouveau | à faire | |
| CY11 | Cyber · Automatisation | mixte | à faire | |
| CY12 | Cyber · Missions | mixte | à faire | |
| CY13 | Cyber · Documents | mixte | à faire | |
| CY14 | Cyber · Dossier de mission | nouveau | à faire | |
| CYB-vulnerabilites | Cyber · Vulnérabilités | nouveau | fiche à écrire | v4, image seule |
| CYB-rapport-audit | Cyber · Rapport d'audit | nouveau | fiche à écrire | v4, image seule |
| CYB-playbook | Cyber · Playbook d'incident | nouveau | fiche à écrire | v4, image seule ; délai CNIL 72 h |
| CYB-chiffrage | Cyber · Chiffrage | nouveau | fiche à écrire | v4, image seule ; prix = données d'un catalogue |

### LOT-11 · Développement — `claude/refonte-developpement` — 7 images (6 écrans), plus une vue d'ensemble à proposer

Brief : `07-ESPACE-DEV.md`. Entrée de barre latérale au-dessus de « Surveillance ». Fiches écrites par S8 le 12 nov. : [`fiches/LOT-11/`](fiches/LOT-11/00-COMMUN.md), **relues par Harun le 12 nov.** (8 décisions, tableau en tête de `00-COMMUN.md`), alignées sur les décisions du CO (§1.17, §1.19) ; barre latérale : section « ESPACES DE TRAVAIL » de l'image, sous-liste du socle §0.1 (5 lignes, puis « + N autres »). Construction au feu vert du CO (socle v4 fusionné, fiches relues). Préparation : [`preparation/LOT-11-developpement.md`](preparation/LOT-11-developpement.md) (inventaire, dépendances, 7 constats pour le CO au §5) ; logique pure dans `src/refonte/developpement/` (journal des exécutions, tâches planifiées locales, état des déploiements), garde `check:developpement` (51 contrôles, en CI).

| ID | Écran | Type | État | Écart / note |
|---|---|---|---|---|
| DEV-ensemble | Développement · Vue d'ensemble | nouveau | fiche validée par Harun | aucune image : sur le modèle des hubs ; 8e hub `/ensemble/developpement` accepté (§1.17 n° 2), posé par S0 |
| DEV-projets | Développement · Projets de code | nouveau | fiche écrite | attend le connecteur Code (LOT-12) |
| DEV-deploiements | Développement · Déploiements | mixte | fiche écrite | attend le connecteur Hébergement (LOT-12) ; logique pure livrée (`deploiements.ts`) ; total mesuré de bout en bout (étapes de l'image : 113 s ≠ 1 min 48) ; cible « Interne » inerte (§1.17 n° 6) |
| DEV-serveur | Développement · Serveur et santé | nouveau | fiche écrite | lié à LOT-13 (reporté) : état « serveur non branché » |
| DEV-editeur | Développement · Éditeur de flux | mixte | fiche écrite | logique livrée (`journal.ts`, `planification.ts`) ; format des blocs avec Sinon / Puis : S9, relu par S6 (§1.17 n° 7) ; mode API : LOT-12 ; écart : « Éditeur de flux » partout, l'image dit « Éditeur d'automatisation » en h1 (§1.17 n° 4) |
| DEV-couts | Développement · Coûts et API | nouveau | fiche écrite | modèle de LOT-12 (S9) ; comptes calculés depuis les connecteurs réels (§1.17 n° 5) ; écart : l'image dit « 5 sur 7 » pour 4 lignes « Local » |
| DEV-modeles-sites | Développement · Modèles de sites (et vue code) | nouveau | fiche écrite | famille Développement, seconde entrée possible dans Créer et produire (§1.17 n° 3) ; prototype v3 gris : néon et tutoiement à appliquer |

### LOT-12 · Connecteurs et autonomie — `claude/refonte-connecteurs` — aucun écran

Tenue par S9. Pas d'écran à soi : H21 est à LOT-07 (S6), DEV-couts et DEV-editeur à LOT-11 (S8).

- **État** : préparation fusionnée (`890522d`, dans `4254e7a`, §1.22). Décisions du §1.22 appliquées dans le modèle : prise Webhooks « chez nous » (catégorie « Événements reçus »), « Demander un connecteur » pour Notion, prise arrêtée dessinée comme libre avec « arrêtée le … », valeurs de départ réunies et modifiables (`reglages.ts`). Branche : voir le dernier message de S9.
- **Contenu** : `src/refonte/connecteurs/` (catalogue, tarifs à relever, cycle en 3 clics, règles de H21 et de DEV-couts, flux Quand / Si / Alors rangés dans le moteur de H20, moteurs locaux, liste « Demandé à amn-api »). Note : [`preparation/LOT-12-connecteurs.md`](preparation/LOT-12-connecteurs.md).
- **Gardes** : `check:connecteurs` (100 contrôles, en CI), plus typecheck des deux éditions, lint, `check:donnees`.
- **Dépendances** :
  - S6 (LOT-07) : la couture `@edition/*` du moteur de H20 (jumeau `.business` à l'identique) ; l'écran H21 ; le relevé des tarifs au moment de construire H21.
  - S8 (LOT-11) : DEV-couts et DEV-editeur, construits sur ce modèle.
  - amn-api (hors dépôt) : clés côté serveur, retour d'autorisation, envoi SMTP, tâches planifiées, compteurs et plafond, lecture IMAP, événements reçus, sauvegarde nocturne. Chaque point a son repli local.

## 8. Références

### Le dépôt est public

`amn-devsec/amn-desktop` (ancienne adresse `aaronsyaa-dev/amn-desktop`, redirigée) est **public**. Rien qui décrive une faille de sécurité n'y est poussé (documents, commentaires, commits, noms de branche) ; `docs/securite/` est ignoré par `.gitignore`. La règle 4 du dossier de construction dit la même chose. Les images des maquettes et le dossier `AMN-refonte-CO` restent hors dépôt. Des documents déjà publiés sur `main` décrivent des mécanismes de détection (`docs/nuit-2026-08-28.md`, `docs/audit-soc.md`, `docs/casser-2026-09-04.md`) : à faire relire par S6, et/ou passer le dépôt en privé. **À trancher par Harun.** **12 nov. (Harun)** : le dépôt a changé d'organisation (`amn-devsec`, `amn-api` aussi). Il **reste public**, vérifié en navigation privée. Ce n'est pas l'option A, et le passage en privé reste ouvert. Jusque-là, la règle tient : rien d'exploitable dans les documents du dépôt.

### Niveau d'un module

`essentiel`, `courant`, `avance`, affichés Essentiel, Courant, Avancé (registre de S5). F1 est aligné (`59056ad`). Le dossier de construction compte 101 modules : 16 essentiels, 62 courants, 23 avancés, ce que le registre de S5 donne déjà.

### Gardes

- **Sans navigateur** : `typecheck`, `typecheck:business`, `lint`, 44 `check:*` de `editions.yml` (dont `check:donnees`). Chaque lot les lance avant de rendre la main ; le CO les relance à chaque fusion.
- **Avec navigateur** (`isolation`, `mouvement`, `contraste`, `mobile`, `coquille`, `focus`, `cibles`, `etiquettes`, `largeur`, `signal`, `business`) : lancées par T1 dans son bac à sable (passage 1 du 23 oct.). Elles ne tournent pas en CI ; T1 propose de les y mettre (`docs/qualite/proposition-ci.md`). Défauts hérités de `main` et inchangés : `focus`, `cibles`, `etiquettes`, `largeur`. Apportés par la refonte : `coquille` interne (S1), `#/tous-les-modules` en cibles et en largeur (S5), une fenêtre sans focus sur l'organigramme de la Garde (S3).
- **CI GitHub** : « Garde-fous croisés » échoue à « Récupérer amn-api » (secret `AMN_API_TOKEN` refusé). Cela ne dépend pas du code ; **le secret est à renouveler**.

### Bus de moments

Types de la Garde ajoutés au point 1 : `garde.escalade` (critique), `site.muet` (decision), `garde.remontee-critique` (critique). La liste des tons critiques est fermée dans `check:moments` : l'allonger passe par le CO. Émis aujourd'hui : `client.cree` et `facture.payee` par `@edition/socle` ; `tache.terminee` par l'Accueil.

### Isolement des éditions

Contrôlé par lecture des sources (`check:navigation`, `check:garde-refonte`, `check:accueils`, `check:ajmani`) et sur le vrai paquet client (« Build business + contrôle de fuite » en CI, comparateur de T1). À terme : un seul contrôle fondé sur le graphe d'imports depuis la racine cliente.

### Journal des fusions

| Date | Branche | sha | Résultat |
|---|---|---|---|
| 2026-10-20 | `claude/refonte-s0-socle` | `b7453e3` → `9a6ffe7` | sans conflit |
| 2026-10-22 | `claude/refonte-s3-supervisor` | `e7f4f25` → `596239e` | sans conflit |
| 2026-10-22 | `claude/refonte-s1-navigation` | `e788af8` → `c5f4707` | conflit additif dans `editions.yml`, les deux étapes gardées |
| 2026-10-22 | (CO) | `c808dae` | 3 types de moments ; `check:navigation` corrigé pour S3 |
| 2026-10-22 | `claude/refonte-s5-modules` | `69cd802` → `25c1d0d` | sans conflit |
| 2026-10-22 | `claude/refonte-s2-accueil` | `a537dbe` → `408a3f5` | sans conflit ; `check:clavier` rouge, corrigé par le CO (`c88814c`) |
| 2026-10-22 | (CO, branche F1) | `274381f` → `59056ad` | niveau `expert` → `avance` |
| 2026-10-31 | — | `f059f32` | nouveau plan : 10 lots, 127 écrans ; aucune fusion de code |
| 2026-11-01 | `claude/refonte-qualite-t1` | `51a962d` → `97929c1` | sans conflit ; API d'essai, bac à sable, `SANTE.md` |
| 2026-11-01 | `claude/refonte-donnees-fictives` | `d017393` | sans conflit ; 25 jeux |
| 2026-11-01 | (CO) | `4da65a8` | `check:donnees` dans `package.json` et en CI ; 44 contrôles verts |
| 2026-11-01 | `claude/refonte-socle` (LOT-00) | `fdd6366` → `488cdcc` | conflit `STATUT.md` (version de `refonte-vivante` gardée) |
| 2026-11-01 | `claude/refonte-s5-modules` | `b82e50f` → `5410081` | conflit `src/socle/i18n.ts` (« Outils et réglages » gardé) ; 55 contrôles verts |
| 2026-11-01 | `claude/refonte-qualite` (T1) | `f2e243a` | sans conflit ; contrôle de fidélité, local seulement |
| 2026-11-01 | `claude/refonte-donnees-fictives` (SIM) | `4fe559b` | sans conflit ; 100 jeux ; `check:donnees` 87 contrôles ; 55 contrôles de la CI verts |
| 2026-11-01 | — | `1ca2d7a` | design v3 : dossier remplacé, points 9 à 15 validés, `ModuleTile` dans le socle, GO ajusté |

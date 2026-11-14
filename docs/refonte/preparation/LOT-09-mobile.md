# LOT-09 · Mobile et tablette — note de préparation

> Branche `claude/refonte-mobile`, partie de `claude/refonte-vivante` @ `35629b15`. Rédigée le 14 nov. 2026 par S5, en PRÉPARATION : **aucun écran**. LOT-09 ne se construit qu'une fois les lots 01 à 08 fusionnés (STATUT §1.4).
> Sources lues : `STATUT.md` (§1.4, §1.37, §1.41, §7), `REGLES.md`, les 11 fiches du dossier v4 (`lots/LOT-09-mobile/` : rubriques 2, 6, 8 et, pour T01, le §11), `docs/PWA.md`, et le code existant (`PanneauMobile.tsx`, `MobileBottomNav.tsx`, `useEtroit.ts`, `check-mobile.mjs`, `check-largeur.mjs`, `check-cibles.mjs`, `public/sw.js`, `src/assistant/voix.ts`, `src/lib/fileEnvoi.ts`, `EnvoiEnAttente.tsx`, la coquille v4 et le CSS du socle).
> Ce qui est **mesuré** et ce qui est **supposé** est dit à chaque fois. Aucune donnée réelle, aucun secret. Rien dans `src/screens`, rien dans le socle.

## 1. En bref

- **11 écrans, tous nouveaux** : 9 écrans de téléphone (H46, MB02 à MB09) et 2 de tablette (T01, T02). Chacun est une **recomposition des écrans du bureau**, pas un second produit : même code, mêmes données, même registre (STATUT §1.4).
- **Livré ici** : cette note, une logique pure (`src/refonte/mobile/formats.ts`) et sa garde `npm run check:formats` (22 contrôles, ajoutée à `package.json` et à `editions.yml`). Elle dit le format d'une largeur, la navigation, liste/détail, la rotation, l'accueil de la tablette et le repli de chaque fonction d'appareil.
- **Trois points** (§7) : le CO a tranché les deux premiers à titre provisoire (révisable par Harun) — seuils des fiches v4 (600 / 800 / 1100), une seule disposition de widgets pour H25 et MB06 ; le troisième, les droits du jeton web pour MB03 et MB08, est une **règle proposée par S6, à décider par Harun** (POINT-HARUN n° 8).
- **Sept briques à demander à S0** (§6). La plus lourde est la barre basse de 70 px avec son bouton flottant.
- **Les lots déjà livrés tiennent déjà 390 px pour le contenu** (T1 : rien de coupé sur LOT-03) ; ce qui reste est la **cible tactile de 42 px** et les **ruptures de tablette** (600, 800, 1100), que presque aucun lot ne gère (§4).

## 2. Les 11 écrans

Colonnes : le bureau équivalent (les fiches les nomment), l'existant à reprendre, ce qui manque ou reste à confirmer.

| ID | Écran | Ce que le téléphone montre | Équivalents bureau | Existant | À confirmer |
|---|---|---|---|---|---|
| H46 | Accueil, tâches, ticket urgent | Accueil (cartes du jour), liste des tâches, ticket urgent en plein écran ; barre basse 70 px, bouton flottant 52 px | N01, H02, H03 | `MobileBottomNav`, `PanneauMobile` | l'Accueil du bureau (N01) est au LOT-01, pas fusionné |
| MB02 | Agenda et clients | Calendrier, liste de clients, fiche client | H01, H05, G04 | LOT-02 (clients, fiche) livré ; H01 au LOT-01 | « Plus > Clients » mène à T02 sur tablette, à la liste en pile sur téléphone |
| MB03 | Argent | Argent du jour, nouvelle facture, paiement reçu ; « Zéro impayé », mode discret | F30, G03, H40 | LOT-04 (DS), pas construit | **droits du jeton web : règle proposée par S6, à décider par Harun** (§7, point 3) ; le mode discret masque les montants |
| MB04 | Messages et alertes | Messages, conversation, notifications ; Boîte à zéro, réponse suggérée d'Ajmani | G07, H40, H03 | LOT-05 livré (G07, F40) | cibles de 32 à 34 px sur l'image : construire à 42 |
| MB05 | Recherche, Ajmani, dictée | Recherche, conversation avec Ajmani, dictée vocale ; permission du micro | H41, G05, MJ04, H10 | `voix.ts` ; H10 livré (LOT-03) | dictée **à tester sur iPhone** ; cibles 32 à 34 px sur l'image |
| MB06 | Tableau de bord, tickets, modules | Tableau de bord, tickets, tous les modules | G08, H25, H03, D02 | LOT-01 (H25, G08), pas fusionné | une seule disposition avec H25 (§7, point 2) |
| MB07 | Scan de reçu, dépense, hors ligne | Appareil photo du navigateur, dépense préremplie, file hors ligne | H08, MA05, H02, H16, G03 | `fileEnvoi.ts`, `EnvoiEnAttente.tsx` | caméra via le navigateur ; la file ne perd jamais une donnée |
| MB08 | La Garde mobile | Salle de contrôle, incident, ronde | N02, H30, H32, H33 | LOT-08 (S3), pas fusionné | interface seule, jamais un détail d'exploitation ni un secret ; **droits du jeton : règle proposée par S6, à décider par Harun** ; relecture S6 en privé |
| MB09 | Connexion, démarrage, écran verrouillé | Déverrouillage, démarrage du métier, écran verrouillé | G06, H47, H40 | LOT-00 (H47 livré) | **widgets impossibles en PWA** : première passe = connexion, démarrage, notifications dont l'aperçu est masqué par défaut |
| T01 | Tablette · Accueil | Cadre 1180 × 700, rail 76 px, 4 KPI de 252 × 92, trois volets de 384 / 338 / 300, lignes de 68 px | N01 | rien | paliers de la fiche, qui font foi (§7, point 1) |
| T02 | Tablette · Clients en vue scindée | Liste et fiche côte à côte | H05, G04 | `Scinde` du socle | les règles de H05 et de G04 font foi ; le socle ne scinde qu'à partir de 900 px |

Chaque fiche de téléphone compte jusqu'à **trois écrans** (cadre ≈ 345 px de contenu, de x = 19 à x = 325 ; lignes de 47 à 59 px ; boutons de 44 à 46 px). La barre basse est la même partout : Accueil, Tâches, Argent, Messages, Plus.

## 3. Ce qui existe déjà, et ce qu'on en reprend

| Pièce | Ce qu'elle fait | Pour LOT-09 |
|---|---|---|
| `src/components/rail/PanneauMobile.tsx` (356 l.) | tiroir à deux niveaux (familles, puis modules), lignes de 52 px, pleine largeur jusqu'à 420 px | **à reprendre** pour « Plus » : le geste et la hiérarchie ; **à refaire** : l'ambre (le néon v4 a ses tons), les lignes à 42 px minimum, les mots passés par `definirMots` |
| `src/components/MobileBottomNav.tsx` | barre basse, 4 liens au plus (`MAX_ITEMS`) plus « Modules », 56 px, l'Accueil au centre | **à reprendre** : l'idée du pouce (l'Accueil au milieu). **À changer** : les maquettes veulent **cinq places fixes** (Accueil, Tâches, Argent, Messages, Plus) et 70 px, pas des favoris qui bougent |
| `src/lib/useEtroit.ts` | `matchMedia`, seuil 640 par défaut | à remplacer par la lecture de `formats.ts` (`requetes()`), un seul seuil pour le CSS et le code |
| `public/sw.js`, `docs/PWA.md` | PWA installable, notifications reçues (`push`, `notificationclick`) | première passe de MB09 : connexion, démarrage, notifications **sans aperçu par défaut** |
| `src/assistant/voix.ts` | dictée dans Ajmani | MB05 ; **test sur iPhone**, où la reconnaissance du navigateur est la moins sûre |
| `src/lib/fileEnvoi.ts`, `EnvoiEnAttente.tsx` | file d'envoi hors ligne | MB07 : le reçu scanné entre dans la file, rien ne se perd |
| `scripts/check-mobile.mjs`, `check-largeur.mjs`, `check-cibles.mjs` | débordement, texte mangé, cibles de 44 px, par écran | **à garder tels quels** ; `check-cibles` demandera 42 px au toucher (voir §4) |
| Coquille v4 (`src/socle/coquille/coquille.css`) | tiroir sous 900 px, en-tête qui s'allège à 640 et 460 | à **réaligner** sur les seuils retenus (§7, point 1) |

## 4. Ce que chaque lot livré doit tenir à 390 px et en tablette

**Règles communes** (les mêmes pour tous les lots, à mesurer avec les trois gardes existantes plus `check:formats`) :

1. **390 px** : aucun débordement horizontal de la page, aucun texte réduit à une ellipse inutile, aucun paragraphe écrasé (`check:mobile`, `check:largeur`).
2. **Cibles** : 42 px au toucher (téléphone et tablette), 36 px au bureau (§1.41). Une zone invisible `::after` de 42 px suffit, le dessin ne bouge pas. **Aujourd'hui les lots livrés sont à 36 px**, c'est exact au bureau et trop juste au pouce : il faudra une variable (`--socle-cible`) qui passe à 42 px sous 1200 ou quand `(pointer: coarse)`.
3. **Aucune action ne dépend du survol.** Sous `(hover: none)` toute action cachée se voit (le socle le fait déjà pour `.sc-ticket__menu`).
4. **Les fenêtres deviennent des feuilles du bas** sous 600 px (`Modale` aujourd'hui centrée) ; **les tableaux deviennent des cartes**.
5. **Le clavier virtuel** ne cache ni le champ ni le bouton d'envoi.
6. **Rotation** : l'état est gardé, sans rechargement (T01 §11, 200 ms).

**Lot par lot** (ce qui est établi, puis ce qu'il reste à mesurer) :

| Lot | Établi | À faire tenir |
|---|---|---|
| LOT-00 système et démarrage | coquille v4 : tiroir sous 900 px, en-tête allégé à 640 et 460 | la barre basse n'existe pas : c'est la brique à demander (§6) ; les 9 écrans (palette, onboarding H47…) à 390 px |
| LOT-02 contacts (13) | CSS à 1279, 1100, 900 et 760 px | trois écrans les plus denses à contrôler en tablette : H05 (clients), G04 (fiche), MC01 (pipeline en colonnes : défilement horizontal voulu, avec repères) ; **T02 est leur recomposition** |
| LOT-03 écrire (9, S5) | T1 : « rien de coupé à 390 px » ; une seule rupture, à 1280 px | colonne de droite et panneaux latéraux sous 900 ; l'éditeur (H12, ME02) avec clavier virtuel ; le calendrier d'écriture (ME01) a des jours de 32 px (accepté au bureau, **à 42 px au toucher**) |
| LOT-05 échanger (10, S5) | ruptures à 1099 px (volets en colonne, rail masqué) et 1279 px (G07) | G07 (boîte) est **la** liste-détail de MB04 ; F40 ; les gestes de tri (ranger, reporter) sans survol ; MX01 sans dossiers sous 1100 : un sélecteur de dossier est à prévoir |
| LOT-06 créer (15) | une règle `@media` | éditeurs larges (images, documents) : lecture seule acceptable sur téléphone, à décider avec S7 |
| LOT-11 développement (6) | — | écrans techniques : aucune demande mobile, sauf la lisibilité à 390 px |
| LOT-12 connecteurs | aucun écran | rien |
| **À venir** : 01, 04, 07, 08, 10 | — | à construire **dès le départ** avec les six règles : c'est moins cher que de les reprendre. LOT-01 porte N01, H02, H03, H25, G08 ; LOT-04 porte F30, G03, H08 ; LOT-08 porte N02, H30, H32, H33 |

Le tableau est un **plan de mesure**, pas un constat : seuls LOT-03 (390 px) et les requêtes `@media` ont été lus. Les mesures sont refaites par T1 sur l'aperçu une fois LOT-09 construit.

## 5. Logique pure livrée

`src/refonte/mobile/formats.ts` (aucun import, aucun React, aucun accès au navigateur) et `scripts/check-mobile-refonte.ts` (`npm run check:formats`, **22 contrôles**).

| Fonction | Ce qu'elle dit |
|---|---|
| `SEUILS`, `formatDe(largeur)` | téléphone < 600, tablette 600 à 1199, bureau ≥ 1200 ; ajustables (un paramètre) |
| `requetes()` | les textes `matchMedia` des trois formats, sans trou ni recouvrement, vérifiés tous les 0,5 px de 200 à 2 000 |
| `NAVIGATION`, `BARRE_BASSE`, `HAUTEUR_BARRE_BASSE`, `LARGEUR_RAIL`, `TAILLE_BOUTON_FLOTTANT` | barre basse de 70 px (Accueil, Tâches, Argent, Messages, Plus), rail de 76 px, bouton flottant de 52 px |
| `cibleMinimale(format)`, `cibleTient(l, h, format)` | 42 px au toucher, 36 px au bureau ; les 34 px de MB04 et MB05 ne passent pas |
| `presentationListeDetail`, `ouvrirElement`, `retourALaListe`, `detailVisible` | pile au téléphone, scindé ensuite ; la sélection n'est **jamais** perdue en tournant l'appareil ; un détail refermé reste refermé |
| `accueilTablette(largeur)` | les paliers de T01 §11 (1100, 800, 600) : volets, KPI, rail |
| `repliDe(fonction, capacités)` | caméra → import de fichier ; micro → saisie au clavier ; biométrie → code seul ; notifications → aucune : jamais un bouton mort |
| `LIMITES_PWA` | pas de widget ; aperçu de notification masqué par défaut |

## 6. Briques à demander à S0 (le socle n'est pas touché ici)

| # | Brique | Pourquoi | Existe ? |
|---|---|---|---|
| 1 | **Barre basse** : 70 px, 5 places, pastille de compteur, bouton flottant de 52 px, zone de sécurité (`env(safe-area-inset-bottom)`) | H46 et toutes les fiches de téléphone | non |
| 2 | **Feuille du bas** (`FeuilleBasse`) : poignée, hauteurs de repli, fermeture au geste et à `Échap` | « Plus », filtres, actions, dictée, paiement reçu | non (`Modale` centrée seule) |
| 3 | **Rail de 76 px** (icônes + libellés courts) | T01, T02 | non (la barre latérale v4 fait 252 px) |
| 4 | **`Scinde` à deux présentations** : prop `presentation` (`pile` ou `scinde`), détail plein écran avec retour ; scindé dès 600 px | MB02, MB04, T02. Aujourd'hui il se scinde à 900 px et, dessous, empile la liste (320 px) sur le détail : correct pour le bureau étroit, pas pour le téléphone | partiel |
| 5 | **En-tête de téléphone** : titre, retour, recherche, état de synchronisation | toutes les fiches | partiel (l'en-tête v4 s'allège à 640 et 460) |
| 6 | **Variable de cible** (`--socle-cible`: 36 px, 42 px au toucher, c'est-à-dire sous 1200 ou `pointer: coarse`) appliquée aux zones `::after` du socle | cibles du socle (`Interrupteur`, `Case`, `Onglet`, `Segmenté`, `Bouton`) | non : 36 px écrits en dur |
| 7 | **Gestes** : tirer pour actualiser, balayer une ligne (ranger, reporter) avec son équivalent au bouton | MB04, H46 | non |

Briques secondaires à confirmer avec S0 : **état hors ligne** : le `BandeauHorsLigne` du socle existe déjà (`situations/EnSituation.tsx`), MB07 le reprend ; reste à vérifier qu'il tient à 390 px ; **mode discret** (masquer les montants, MB03) ; **hook `useFormat()`** qui lit `formats.ts` — c'est à S0 de décider s'il vit dans le socle.

## 7. Points à trancher

1. **Seuils — décidé (provisoire, révisable par Harun).** Les fiches v4 font foi : T01 §11 donne 600 (téléphone / tablette), 800 (KPI 2 × 2, deux volets) et 1100 (trois volets, KPI sur une rangée). STATUT §1.4 disait 768 / 1200 « ajustables par LOT-09 » : le CO le met à jour. Le bureau reste à 1200 (le STATUT, que les fiches ne contredisent pas) ; **800 et 1100 sont des ruptures internes de la tablette**, `accueilTablette` les applique. À réaligner : la coquille v4 (tiroir à 900 px, allègements à 640 et 460), `Scinde` (900) et la grille des KPI (900 et 1280). Le cadre de T01 (1180 px) reste une tablette.
2. **Tableau de bord sur téléphone — décidé (provisoire).** Une seule source pour la disposition des widgets : celle de H25. Le mode « modifier » de MB06 écrit dans cette même disposition, il n'en a pas une à lui. L'image de MB06 fait foi pour l'affichage (« Modifier », « Ajouter un bloc »).
3. **Droits du jeton web — règle proposée par S6, à décider par Harun.** MB03 (Argent) et MB08 (La Garde) lisent et écrivent par le pont navigateur : c'est un point de sécurité, le CO le passe à S6 et ne tranche pas. Vérifier les droits de `WEB_OPERATOR_TOKEN` **avant** de construire ces deux écrans ; S6 relit MB08 en privé. Aucun secret ne figure dans cette note ni dans le code.
   **Règle proposée par S6, à décider par Harun** (POINT-HARUN n° 8) :
   - aucune clé partagée dans la version web ; une session au nom de la personne, avec les droits de son rôle ;
   - MB03 : la banque en lecture seule, et tout envoi à un client demande une confirmation ;
   - MB08 : réservé au propriétaire et à l'administrateur ; sur mobile, lecture et décision de dossier seulement ;
   - session de 7 jours au plus, coupée après 24 h sans activité ; verrouillage après 5 min (MB09) ;
   - H19 liste les appareils ; le cache est vidé à la déconnexion.
4. **Cibles de 42 px contre images.** MB04 et MB05 montrent 32 à 34 px ; on construit à 42 px (STATUT §1.4). T1 compare à l'image avec cette tolérance, à écrire dans `justifies-LOT-09.json`.
5. **Capacitor et widgets.** Hors de la première passe (STATUT §1.4). Si Harun les veut, c'est une décision à part, et MB09 change de nature.
6. **Biométrie.** Aucune biométrie native en PWA. Le déverrouillage de MB09 ne s'allume que si l'appareil offre WebAuthn ; sinon, le code seul (`repliDe`).

## 8. Ordre de construction proposé

1. S0 livre les briques 1 à 4 (§6) ; `formats.ts` est branché dans `useEtroit`.
2. **Tablette d'abord** (T01, T02) : elle est la moins chère (le bureau, recomposé) et valide le rail et la vue scindée.
3. **Téléphone, par la barre basse** : H46, puis MB02, MB04 (déjà adossés à LOT-02 et LOT-05 livrés), puis MB05.
4. **Après** les lots qui les portent : MB03 (LOT-04), MB06 (LOT-01), MB08 (LOT-08), MB07 et MB09 en dernier (appareil, hors ligne, notifications).
5. Chaque écran : aperçu `npm run apercu -- <ID>` en 390 px **et** 1180 px, `check:mobile`, `check:largeur`, `check:cibles`, `check:formats`, fidélité contre l'image de la fiche, justifications dans `docs/qualite/fidelite/justifies-LOT-09.json`.

## 9. Ce qui n'est pas fait ici

- Aucun écran, aucun fichier dans `src/screens`, aucun fichier dans le socle ; `src/refonte/mobile/formats.ts` est la seule logique, dans la zone du lot.
- Rien n'est branché : ni `useEtroit`, ni la coquille. Le branchement attend l'accord de S0.
- Les mesures de §4 sont un plan, pas un constat (voir la remarque sous le tableau).

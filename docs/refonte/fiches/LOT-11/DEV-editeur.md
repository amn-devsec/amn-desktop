# DEV-editeur · Éditeur de flux
Développement · LOT-11 · Image : `images/DEV-editeur.png` · Statut : MIXTE
Parcours : Développement / Éditeur de flux

> Règles communes de l'espace : [`00-COMMUN.md`](00-COMMUN.md).

## 1. Rôle
Poser une automatisation en **blocs** (Quand / Si / Alors / Sinon / Puis), la **tester** sans effet réel, choisir pour chaque flux s'il est **fait par l'application** (gratuit, sur le poste) ou **passe par une API** (payant), puis l'enregistrer. C'est l'éditeur détaillé des recettes de **H20 Automatisations** : même moteur, même liste, une seconde porte.

## 2. Nouveau ou re-habillage ?
- **Existant réutilisé** : le moteur « si X alors Y » (`src/state/useAutomations.ts`, collection `automations`, déclencheurs `formAnswer`, `invoiceOverdue`, `ticketOpened`, `prospectWon`, `stockLow` ; actions `task`, `logbook`), exécuté par `AutomationsRunner` dans la mise en page ; la liste et les interrupteurs de `AutomationsScreen` (`/outils/automatisations`, fiche H20, LOT-07). Les règles du bureau Supervisor (`src/bureaux/donnees/regles.ts`, QUAND / ALORS / SAUF) sont un second moteur, à ne pas dupliquer.
- **Nouveau (à créer)** : (a) le **canevas** en blocs reliés (Quand, Si, Alors, Sinon, Puis) avec leur étiquette de mode ; (b) la palette « Ajouter un bloc » ; (c) le choix « Comment ça tourne » (Local ou API) ; (d) « Tester » sur des éléments réels, sans effet ; (e) les puces « Test sur n … : réussi » et « Dernière exécution » ; (f) la suggestion d'Ajmani.
- **À confirmer dans le code** : le moteur actuel ne connaît qu'**un** déclencheur et **une** action par règle ; les branches Sinon et les suites Puis supposent d'étendre le modèle (`AutomationData`) — en accord avec S6 (LOT-07, propriétaire de H20) ; le déclencheur « Un courriel arrive » dépend de la boîte de l'équipe (connecteur Messagerie, LOT-12) ; « Répondre avec le modèle » réutilise MX06 Réponses automatiques (LOT-05).
- **Mode API** : dépend du modèle des connecteurs (**LOT-12**) et du plafond de DEV-couts.

## 3. Disposition par zones
Coordonnées relatives à la zone principale, relevées sur l'image, à ± 2 px.
- **Z1 En-tête de page** : h1 « Éditeur d'automatisation » (voir §13), sous-titre ; secondaire « Tester » (icône lecture) puis **primaire** « Enregistrer » (icône coche), 36 px, y = 44.
- **Z2 Carte du flux** : **752 × 661** à (40, 97). Ligne de titre (nom du flux 15 px / 600 à gauche, état et compteur 12.5 px T4 à droite). **Canevas** **714 × 595** à (59, 146) : fond plus sombre, grille de points tous les 20 px, rayon 12.
  - **Blocs** de **204** px de large, rayon 12, bord teinté de la couleur du type avec lueur : en-tête (tuile 24 px, type en capitales 11 px / 700 teinté, étiquette « Local » à droite), titre 14 px / 600 T1, détail 12.5 px T3 sur 1 ou 2 lignes.
  - Positions : QUAND (80, 195) 204 × 114 · SI (306, 195) 204 × 97 · ALORS (532, 195) 204 × 114 · SINON (306, 379) 204 × 97 · PUIS (532, 379) 204 × 97 · PUIS (532, 539) 204 × 97.
  - **Liens** de 2 px : QUAND → SI horizontal (info), SI → ALORS horizontal (attention), SI → SINON vertical (attention), ALORS → PUIS vertical (succès), PUIS → PUIS vertical (violet).
  - **Puces** en bas à gauche du canevas, y ≈ 704 : « Test sur 3 courriels : réussi » (succès) puis « Dernière exécution : il y a 9 min » (info).
- **Z3 Colonne droite** (x = 808, largeur 340) : « Ajouter un bloc » **340 × 270** à (808, 97) — 4 lignes **280 × 44** à x = 838, y = 148 / 198 / 248 / 298 (tuile 26 px teintée + libellé 13.5 px) ; « Comment ça tourne » **340 × 213** à (808, 381) — 2 options de 280 × 53 (point d'état, titre 13.5 px / 600, sous-titre 12 px T4 ; l'option choisie a le bord `b` avec lueur), puis une ligne 12.5 px T4 ; suggestion d'Ajmani **340 × ≈ 138** à (808, ≈ 608).
- **Z4 Barre Ajmani** : standard.
- **Barre latérale** : famille Développement, module actif « Éditeur de flux ».

## 4. Contenu affiché (textes exacts)
**En-tête** : « Éditeur d'automatisation » · « Tu poses des blocs, l'application s'occupe du reste · 9 flux sur 12 tournent seuls » · « Tester » · « Enregistrer ».

**Carte du flux** : « Demande de devis par courriel » · « actif · 38 exécutions ce mois ».
| Type | Couleur | Mode | Titre | Détail |
|---|---|---|---|---|
| QUAND | info | Local | Un courriel arrive | Sur contact@ · demande de devis |
| SI | attention | Local | Demande de devis ? | Mots repérés : devis, tarif, prix |
| ALORS | succès | Local | Créer le contact | Nom, société, courriel, sans doublon |
| SINON | gris | Local | Classer dans « À lire » | Aucune réponse automatique |
| PUIS | violet | Local | Répondre avec le modèle | « Devis, accusé de réception » |
| PUIS | violet | Local | Créer une tâche | « Chiffrer la mission » · demain |
Puces : « Test sur 3 courriels : réussi » · « Dernière exécution : il y a 9 min ».

**Ajouter un bloc** : « Ajouter un bloc » · « Courriel reçu » · « Rendez-vous créé » · « Paiement reçu » · « Tous les jours à 08:00 ».

**Comment ça tourne** : « Comment ça tourne » · option choisie « Fait par l'application » / « Gratuit · reste sur ton poste » · option « Passer par une API » / « Payant · plus rapide à grande échelle » · « Tu peux changer à tout moment. »

**Suggestion d'Ajmani** : « Ce flux te fait gagner environ 3 h par mois. Je propose le même pour les demandes arrivées par la page de contact ? » · « Créer le flux ».

## 5. Composants du socle utilisés
`Sidebar`, `Header`, `PageHead`, `Card`, `IconTile` (24 et 26 px), `StatusPill` (puces), `Tag` (« Local », « API »), `FlowLine` (lien qui avance, socle §0.4), `Button`, `Suggestion`, `DialogueConfirmation`, `AjmaniBar`.
**Nouveaux composants** (lot ; à partager avec CY11 si S6 le souhaite, par le CO) :
- `CanevasFlux` : grille de points, blocs positionnés, liens orthogonaux, zoom et déplacement.
- `BlocFlux` : bloc typé (QUAND, SI, ALORS, SINON, PUIS) avec tuile, type, étiquette de mode, titre, détail ; états sélectionné, en erreur, désactivé.
- `PaletteBlocs` : liste des blocs ajoutables (tuile + libellé), glisser ou cliquer.
- `ChoixMode` : deux options exclusives Local / API avec coût affiché sous l'option API.

## 6. Données et règles de calcul
- **Flux** = une recette de H20 avec un graphe : un seul QUAND (déclencheur), au plus un SI par niveau, des ALORS (branche oui), un SINON (branche non), des PUIS (suite). *Proposition* de règles de validité : exactement un QUAND ; chaque bloc sauf QUAND a un parent ; pas de cycle ; un SI a au moins une branche ; un flux sans action n'est pas enregistrable (« Ajoute au moins une action »).
- **Mode** : par flux (choix « Comment ça tourne ») ; chaque bloc porte l'étiquette du mode qui l'exécute (« Local » ou « API »). Un bloc qui n'existe qu'en API (ex. envoi en volume) affiche « API » même si le flux est en Local, et le flux demande alors un connecteur payant branché (*Proposition*).
- **« n flux sur m tournent seuls »** = flux actifs / flux non brouillons (jeu fictif `automatisations` : 9 actifs, 3 en pause sur 12). *À confirmer* : les brouillons comptent-ils dans m ? Proposition : non.
- **« actif · n exécutions ce mois »** = état + exécutions réelles depuis le 1er (les essais ne comptent pas, comme H20).
- **Test** : rejoue le flux sur les **n derniers éléments réels** du déclencheur (*Proposition* : 3 courriels), **sans effet** (aucun contact créé, aucun courriel envoyé, aucune tâche) ; résultat « réussi » si chaque élément suit un chemin complet sans erreur, sinon « n sur 3 en erreur ».
- **« Dernière exécution : il y a n min »** = dernière exécution réelle (journal des exécutions, `src/refonte/developpement/journal.ts`).
- **« Tous les jours à 08:00 »** = déclencheur planifié local (`src/refonte/developpement/planification.ts` : prochaine heure de passage, jours, rattrapage d'un passage manqué au réveil du poste).
- **Temps gagné** (suggestion) = exécutions du mois × durée de référence de chaque action (règle de H20, *proposition, durées à valider avec le dirigeant*), arrondi à l'heure (« environ 3 h »).
- **Par défaut aucun flux n'est actif** (règle de H20) : un flux créé, dupliqué ou proposé par Ajmani arrive « En pause ».
- **Garde-fous** (repris de H20, *propositions*) : une réponse automatique par expéditeur et par flux tous les 7 jours au plus ; pause automatique après 3 échecs de suite ; un flux n'a jamais plus de droits que la personne qui l'a créé.
- **Textes envoyés à un client** (bloc « Répondre avec le modèle ») : au **vouvoiement**, pris dans les modèles de MX06.

## 7. Interactions
- Glisser un bloc de la palette sur le canevas, ou cliquer dessus (il s'ajoute sous le bloc sélectionné) ; un bloc se déplace à la souris, se supprime par `Suppr` avec annulation en une ligne.
- Clic sur un bloc : panneau de réglage du bloc (*Proposition* : panneau latéral qui remplace la colonne droite ; « Fermer » y revient).
- Clic sur un port, glisser vers un autre bloc : crée un lien ; un lien invalide (cycle, second QUAND) est refusé avec une phrase.
- **« Tester »** : lance le test ; les blocs s'allument dans l'ordre du chemin suivi ; la puce de test se met à jour.
- **« Enregistrer »** : valide le graphe, enregistre la recette (H20) ; si le flux était actif, une confirmation dit qu'il agit dès maintenant (« Il agira dès maintenant, au nom de … »).
- **« Comment ça tourne »** : choisir « Passer par une API » ouvre, si aucun connecteur payant n'est branché, le parcours de H21 avec le **coût affiché avant** (tarif, source, date) et le rappel du plafond (DEV-couts) ; au plus trois clics. Revenir à « Fait par l'application » est immédiat.
- **« Créer le flux »** (suggestion) : duplique le flux sur le nouveau déclencheur, **en pause**, et l'ouvre.
- Clavier : flèches pour passer d'un bloc à l'autre, Entrée ouvre le réglage, `⌘S` enregistre, `⌘Z` annule.
- **Mouvement** : liens en pointillés qui avancent pendant un test seulement (`FlowLine`) ; blocs qui s'allument l'un après l'autre (450 ms) ; aucune animation continue au repos hors curseur de la barre Ajmani. `prefers-reduced-motion` coupe tout.

## 8. États
- **Nouveau flux** : canevas vide avec un seul emplacement en pointillé « Choisis ce qui démarre le flux » et la palette ouverte ; « Enregistrer » désactivé.
- **Test en erreur** : bloc fautif bord danger, puce « Test sur 3 courriels : 1 en erreur », phrase sous le bloc (« Aucun modèle choisi »).
- **Flux en pause** : en-tête « en pause · 0 exécution ce mois » ; canevas à 72 % d'opacité (comme les cartes en pause de H20).
- **Mode API sans connecteur** : option API marquée « à brancher » ; les blocs API en attention.
- **Plafond atteint** (DEV-couts) : les blocs API s'arrêtent, le flux repasse en Local quand c'est possible, sinon se met en pause ; bandeau « Le plafond du mois est atteint : ce flux tourne en local jusqu'au 1er. ».
- **Chargement** : squelettes du canevas et de la colonne. **Erreur** : bandeau « Le flux n'a pas pu être chargé. » + « Réessayer ». **Hors ligne** : lecture seule.
- **Droits** : sans droit de gestion des automatisations, canevas en lecture, sans « Enregistrer » ni palette.

## 9. Éléments ludiques
- « 9 flux sur 12 tournent seuls », « 38 exécutions ce mois », « environ 3 h par mois » : faits encourageants.
- Ce qu'on ne fait pas : pas de score, pas de classement, pas de célébration.

## 10. Ajmani
- **Suggestion** : déclencheur (*Proposition*) = un flux actif qui fait gagner au moins 1 h par mois et un second déclencheur voisin sans flux (ici la page de contact). Le flux proposé arrive en pause.
- Barre ⌘J, invites : « Crée un flux : quand un paiement arrive, alors remercie le client », « Pourquoi ce flux a échoué hier ? », « Passe ce flux en local ».

## 11. Adaptation (fenêtre réduite, mobile)
- Sous 1280 px : la colonne droite devient un tiroir (bouton « Blocs ») ; le canevas prend toute la largeur, zoom ajusté.
- Sous 900 px : le canevas devient une liste indentée des blocs (lecture et test), l'édition reste sur grand écran.
- Mobile (LOT-09) : *Proposition* : liste des flux, interrupteur actif / pause, résultat de la dernière exécution.

## 12. Critères de réussite
- [ ] Identique à `images/DEV-editeur.png` à ± 2 px : carte 752 × 661, canevas 714 × 595, blocs de 204 aux positions du §3, colonne droite 340 de large.
- [ ] Même moteur et même liste que H20 : une recette modifiée ici l'est aussi là-bas, sans copie.
- [ ] « Tester » n'a aucun effet réel ; les essais ne comptent pas dans les exécutions.
- [ ] Passer en API affiche le coût avant, respecte le plafond, tient en trois clics.
- [ ] Un flux créé démarre en pause.
- [ ] Un seul bouton primaire (« Enregistrer ») ; états nouveau, erreur, pause, API sans connecteur, plafond, chargement, erreur, hors ligne présents.
- [ ] `typecheck`, `lint`, `check:socle`, `check:developpement` verts.

## 13. Pièges
- **Titre** : l'image dit « Éditeur d'automatisation » dans le h1 mais « Éditeur de flux » dans la barre latérale et le fil d'Ariane. Proposition : garder les deux comme sur l'image (le module s'appelle « Éditeur de flux », la page « Éditeur d'automatisation ») ; à trancher par Harun.
- « contact@ » est un exemple tronqué : l'adresse vient de la boîte branchée, jamais du code.
- L'étiquette « Local » est par bloc, le choix « Comment ça tourne » est par flux : ne pas les confondre.
- Ne pas créer un troisième moteur : étendre celui de H20 avec S6, par le CO.
- Les réponses envoyées aux clients restent au vouvoiement.

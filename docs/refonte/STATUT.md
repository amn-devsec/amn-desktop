# Refonte vivante — statut

> Tenu par le CO. Une session ne modifie que **la section de son lot** dans « 7. Écrans » (une ligne par écran) ; tout le reste est au CO. Règles : [`REGLES.md`](REGLES.md).

## REPRISE (à lire en premier après une compaction ; tenu par le CO, réécrit à chaque tour)

Mode : **continu et autonome** (carte blanche de Harun, 14 nov.), jusqu'à son « stop ». Point pour Harun : [`POINT-HARUN.md`](POINT-HARUN.md). Intégration : `/home/user/amn-desktop-integration`, branche `claude/refonte-vivante` @ `5014f1cc`.

**Avoirs** : réglé, ils sont présents par défaut (`b0173f3`).

**Si la limite d'utilisation coupe le CO** : à la reprise (un message de Harun, une session, ou le réveil programmé), relire ce bloc, faire `git fetch` des branches `claude/refonte-*`, puis reprendre la boucle (lister, lire, contrôler, fusionner, répondre, mettre à jour). Réveil du CO : `send_later`, toutes les 20 min tant que des sessions travaillent, 45 min quand toutes attendent (consigne de Harun), réarmé à chaque tour.

| Session | Identifiant | État | Prochain geste |
|---|---|---|---|
| S0 Socle | `session_01SJe828c2W5EnkMY4fhFY6z` | attend l'accord direct de Harun | sa liste, §1.38 |
| T1 Qualité | `session_011oPZg1pe7zhmGFtd6x3W6h` | `check:fidelite` et `tester-branche` par lot | LOT-03 `2da78ad5` (fidélité 9/9, structure en cours) ; LOT-05 après « Gérer » |
| S1 | `session_01CLLXtV5QPhZ4bZZRf6kdha` | **LOT-02 livré** ; segments de MC07 et de H45 à 38 px (`ca47af79`) chez T1 | **LOT-01, moitié S1** (H01, H03, G08, MJ01 à MJ05) sur `claude/refonte-journee-2` |
| S2 | `session_014ZkF6SeGRNi6NR3uEsjM5q` | préparation de LOT-01 finie ; **sans zips v4** ; la construction de LOT-01 passe à S7 | en pause jusqu'aux zips, puis un autre lot |
| S3 | `session_01FBSpK6n1yYtYXYyxbLAuBV` | attend l'accord de Harun (`check:encres`) ; **sans zips v4** | correctif d'`equipes.ts`, puis LOT-08 |
| S5 | `session_012jWErBSSkcoVaU3iN895bQ` | **LOT-03 et LOT-05 livrés** ; dernières zones de LOT-03 (`d597994f`) chez T1 | **préparation de LOT-09** Mobile et tablette (note, sans écran), sur `claude/refonte-mobile` |
| S6 | `session_01RHV8Xq2txWkfjAusKvq9DG` | préparation de LOT-07 fusionnée ; **sans zips v4** ; LOT-10 passe à S8 | construire LOT-07 dès les zips ; relire la sécurité de LOT-10 avant sa fusion |
| S7 | `session_01C5DAW2srkqgCKRjEKHH8Hy` | **LOT-06 livré** (`66719328` fusionné) | zones de 34 → 36 px et « Réduire » (#/tournees), puis **LOT-01, moitié S7** (N01, H25, H02, H04, L01, L02, L03, L07) |
| S8 | `session_01C5DAVxfgf5v6YVweAwVqBj` | **LOT-11 livré** (`6a87e35` fusionné) | attend l'accord de Harun pour LOT-10 Cyber (POINT-HARUN) |
| DS | `session_01TZGDvVWristJnnPK59rruY` | attend l'accord direct de Harun pour construire LOT-04 | commencer par MA03, H07, MA12 |
| SIM, S9, F1 | `session_011UF2ufZg9moGv2rRZFRuf7`, `session_01C5DAVygXYax6Q7g436TPQx`, `session_01VZHqP3gvzrtnpgsTrrKguV` | en pause | F1 : intégration reportée (S0) |

**À dire au prochain message** : à chaque lot, donner dans son rapport la commande d'aperçu de ses écrans (§1.40) ; à chaque lot, ses exigences de cibles et de largeur (§1.37) ; à DS, la place des modules de F1 est corrigée (MA03 ↔ H07, §1.33 n° 4) ; à T1, (a) La Garde dans l'API d'essai demande une base sur fichier (SIM), (b) comparer le paquet client de `claude/refonte-outils` @ `f52ef5d` (`AutomationsRunner.tsx` partagé) avant sa fusion.

**Décisions provisoires en cours** (révisables par Harun) : arrondi et régime de TVA, seuils de l'argent (§1.29) ; valeurs de départ des connecteurs (§1.22 n° 3) ; plafonds de relance 3 et 1 par jour (§1.28 n° 4) ; seuils de charge (validés, §1.20). Liste « À décider par Harun » : `POINT-HARUN.md`.

**Échecs connus à faire baisser** (relevé de T1 le 14 nov., ses mesures font foi) :
- **régressions de la refonte** (vertes sur `main`) : `check:ancres` et `check:avoirs` (`lucide-react` non résolu dans `src/socle/ui/Bouton.tsx`), confiés à **S0** ; `check:encres` (copies de jetons dans `src/refonte/garde/equipes.ts`, venues de S3), pour **S3** à sa relance.
- **rouges aussi sur `main`** : `check:visite` (guide masqué). `check:migration` n'est pas jouable sans amn-api.
- `check:xss` et `check:support` **passent des deux côtés** chez T1. Mon relevé contraire venait de mon environnement : retirés de la liste.
- Aucune fusion n'a ajouté de nouvel échec : le déplacement du registre (`bb54c03`) a été comparé avant et après.

## Vitesse, jour par jour (tenu par le CO, une ligne par jour)

« Construits » : écrans marqués « fait » au §7, construits et comparés à leur image. « Livrés » : fusionnés dans `refonte-vivante`, après le passage de T1. Total : 153 écrans, soit 142, plus 4 `CYB-*` et 7 `DEV-*`. Lots : 13, de LOT-00 à LOT-12.

| Jour | Construits | Livrés (cumul) | Livrés depuis la veille | Lots préparés | Lots finis | Note |
|---|---|---|---|---|---|---|
| 14 nov. | 67 / 153 | 63 (LOT-00 9, LOT-06 15, LOT-11 7, LOT-02 13, LOT-03 9, LOT-05 10) | 63 | 8 / 13 | 5 / 13 (LOT-06, LOT-11, LOT-02, LOT-03, LOT-05) ; LOT-00 attend l'allumage | LOT-02 retiré à 11h25 (`check:clavier`), refusionné corrigé à 11h40. LOT-01 en construction (S7 4/8, S1 0/8). Préparations fusionnées : LOT-02, 03, 04, 05, 06, 11 et 12. |

## Journal des décisions du CO (une ligne chacune, la plus récente en haut)

- 14 nov., 10h45 : **LOT-02 complet** (S1, `fbed7734`, 13 sur 13), en file chez T1. Réglages en `localStorage` à titre provisoire ; aucun envoi réel des relances avant la phase 0 de sécurité et le connecteur d'envoi ; formule de fidélité et réglages des relances dans H18. LOT-05 : 4 écrans sur 10 (S5), 17 essentiels acceptés.
- 14 nov., 10h25 : suites de LOT-06 (S7 `5177df0`) : zones de clic de 34 px, repli de H17, H17 à 9,2 % en disposition. T1 remesure avant la fusion. Deux points du socle vont à la liste de S0 : le Bouton à 31 px et le décalage de PageHead (§1.38 n° 6).
- 14 nov., 10h20 : LOT-11 (`a86c470`) : structure et paquet client bons (7 routes montées, identique octet pour octet côté client), mais **pas fusionné** : la fidélité n'est pas mesurable, faute d'aperçus dans le dépôt. S8 pousse ses aperçus (`scripts/apercu/ecrans/DEV-*.tsx`) et `justifies-LOT-11.json`, puis vérifie DEV-modeles-sites (75,6 % brut). DEV-ensemble n'a pas d'image, c'est une proposition validée : « ni pour ni contre » accepté. La règle tient : aucune fusion d'écrans sans fidélité mesurée.
- 14 nov., 10h20 : entrées de registre des 3 écrans neufs de LOT-06 fusionnées (S7 `37152cf`) ; valeurs acceptées de LOT-06 fixées par T1 (brut et disposition surveillés, à +2 points). Gardes vertes.
- 14 nov., 10h15 : **LOT-06 fusionné** (`e1615090`, 15 écrans), **premier lot livré** de la vague de construction. T1 l'a accepté : fidélité sur l'aperçu, les 15 écrans justifiés ; structure sur l'application, les 12 routes montées dans la coquille v4, rien de coupé à 390 px. Suites demandées à S7 : relire 6 écrans au-dessus de 15 % en disposition (H17, MR01, MR10, H16, MR05, MR04) ; zones de clic de 34 px (§1.39) ; l'état vide de H17 (« Le livre de marque d’ · ») ; les entrées de registre de ses 3 écrans neufs. T1 fixe les valeurs acceptées de LOT-06.
- 14 nov., 10h00 : **LOT-06 complet** (S7, `277263a`, 15 sur 15). S7 et S8 butent tous deux sur `check:systeme-demarrage` (« le registre ne doit pas bouger », qui perd les fonctions des écrans neufs). Le correctif est sur la branche LOT-03 de S5 et arrive avec sa fusion. Ordre : LOT-03, puis S7 et S8 déclarent leurs écrans neufs, puis LOT-06 et LOT-11.
- 14 nov., 10h00 : méthode de `check:fidelite` (§1.40). La fidélité se mesure sur l'aperçu statique, rempli avec les jeux de SIM ; l'application sert à la structure. Pas de collection nouvelle dans l'API d'essai.
- 14 nov., 12h30 : préparation de LOT-09 (S5) : sa session refuse de pousser sur une 3ᵉ branche, elle passe donc par `claude/refonte-echanger`. Décisions *provisoires, révisables par Harun* : seuils de la fiche T01 (600 / 800 / 1100) ; MB06 écrit dans la disposition des widgets de H25, sans disposition à lui. Droits du jeton web de MB03 et MB08 : question passée à S6 (sécurité), puis à Harun si elle touche au serveur.
- 14 nov., 12h15 : **LOT-05 Échanger fusionné** (S5 `c0320220`, T1 `aea04dfd`), cinquième lot livré. Toutes les gardes passent, dont `naming` et clavier ; 10 écrans dans les seuils ; F40 et G07 ont de nouveau leur centre. Règle du CO : un lot peut passer ses propres lignes du §7 à « fait », sans accord à demander. S5 prépare LOT-09 Mobile (une note, sans écran, §1.4).
- 14 nov., 12h10 : LOT-05 corrigé (S5 `c0320220`) et zones de LOT-06 (S7 `5672a939`) chez T1. LOT-01 : S7 a 4 écrans sur 8 (`053dc48e` : N01, H25, H02, H04). T1 fait un premier passage tôt, pour les éléments ludiques protégés. La règle de `creer.css` qui passe les briques du socle à 36 px pour les écrans de LOT-06 est acceptée à titre provisoire, avec un commentaire pour la retirer quand S0 aura corrigé le socle.
- 14 nov., 12h05 : suites fusionnées après la sonde de T1 : LOT-02 `ca47af79` (segments de MC07 et de H45), LOT-03 `38330a29` et `d44c6e34` (zones de 36 px ; jours de ME01 et lignes de liste acceptés, §1.41), T1 `16fdb7ba`. Reste à S5 pour LOT-03, après LOT-05 : ME04, le champ et la case dans un `<label>`, et trois petites cibles. Gardes du CO : seuls les échecs connus.
- 14 nov., 11h50 : **LOT-03 Écrire et retenir fusionné** (S5 `2da78ad5`, T1 `6e5a6bd5`), quatrième lot livré. 75 contrôles verts, dont clavier ; 9 écrans dans les seuils ; ME05 sorti de l'ancien bureau ; paquet client identique ; 0 clic au centre renvoyé à un voisin. Reste : zones de 34 → 36 px (`commun/ecran.css`, S5, en cours). Gardes du CO : seuls les échecs connus.
- 14 nov., 11h45 : **LOT-01 partagé entre S7 et S1** pour aller plus vite. S7 : N01, H25, H02, H04, L01, L02, L03, L07, sur `claude/refonte-journee`. S1 : H01, H03, G08, MJ01 à MJ05, sur `claude/refonte-journee-2`. Fichiers communs (`declarations/jour.ts`, §7) : chacun n'ajoute que ses lignes, le CO résout à la fusion. LOT-09 attend toujours les lots 01 à 08 (§1.4). Réversible.
- 14 nov., 11h40 : **LOT-02 Contacts refusionné** : le retrait `2b02ad23` est annulé, puis fusion de `7796608f` (clavier : 16 → 0, nuages bornés par le voisin, MC03). T1 l'accepte : 75 contrôles verts, dont clavier ; 13 écrans dans les seuils ; 0 clic au centre renvoyé à un voisin. Reste à S1 : pastilles de 20 px de MC07 et H45. Fusionnés avec : LOT-06 `66719328` (S7 reprend les zones de 34 → 36 px et « Réduire » des tournées), LOT-11 `6a87e35` (accepté), T1 `8c7bf98e`. §1.41 : 36 px, formule de T1. Gardes du CO : toutes les `check:*`, seuls les échecs connus.
- 14 nov., 11h37 : S8 demande l'accord direct de Harun pour LOT-10, nouveau lot qui touche à la sécurité. La ligne à coller est dans POINT-HARUN. En attendant, S8 ne crée pas la branche.
- 14 nov., 11h35 : **LOT-10 Cyber confié à S8** sur `claude/refonte-cyber`, au lieu de S6. S6 n'a pas les zips et a déjà les 30 écrans de LOT-07 ; S8 a les zips et a fini LOT-11. S8 commence par la note de préparation et les écrans sans dépendance. CY07, CY11, CY12, CY13 et CY04 attendent leurs lots. Les 4 `CYB-*` attendent leurs fiches, et les prix de CYB-chiffrage sont à Harun. S6 relit la sécurité avant la fusion. Réversible.
- 14 nov., 11h30 : **LOT-01 Ma journée (16 écrans) confié à S7** pour la construction, sur `claude/refonte-journee`, à partir de la préparation de S2. S7 a les zips v4 et a fini LOT-06 ; S2 ne les a pas. S2 reste en pause et reprendra un autre lot dès qu'il aura les zips. Réversible.
- 14 nov., 11h25 : **INCIDENT, LOT-02 retiré de vivante** (retrait de la fusion `d8319fa2`). `check:clavier` n'était pas dans la boucle de gardes du CO (exclusion par erreur). `850f940b` le rend rouge : 16 `<div>`/`<g>` cliquables sans clavier. La garde est verte sans LOT-02. S7 l'a vu en fusionnant vivante. **Correction de méthode** : la boucle lance toutes les `check:*`, sauf `business` (construction) et `fidelite` (outil de T1, avec paramètres). Refusion : S1 corrige le clavier et les nuages, T1 fait un contrôle court, puis le CO annule le retrait et fusionne la branche corrigée.
- 14 nov., 11h20 : **réserve sur les cibles de LOT-02 tranchée par T1, au clic réel** (`0b04dd0f`). Sur 7 routes, 4 relevés étaient des artefacts de l'état vide. Vrai défaut seulement sur les nuages denses F10, H06 et MC01 : les zones se recouvrent au centre. Va à S1 en suite de lot : zone de Voronoï, ou clic choisi par le conteneur dans un rayon de 17 px.
- 14 nov., 11h15 : LOT-05 (S5 `078ca378`) à 4 écrans. **Supprimer un sondage (MX05) et dissoudre un canal (MX04)** sont absents des fiches v4. Ils restent accessibles par l'écran d'origine (passage de main, `useOutlet`), avec sa confirmation : aucune fonction perdue. *Provisoire, révisable par Harun.* S5 doit d'abord pousser ME05 (LOT-03).
- 14 nov., 11h10 : **LOT-02 Contacts fusionné** (S1 `850f940b`, T1 `a3184509` et `e705a8eb`) : troisième lot livré, 13 écrans. Fidélité, structure et paquet client sont bons. **Réserve sur les cibles** (réversible, la coquille n'est pas allumée) : la sonde de T1 ne confirme pas le « 0 sous 34 px » sur 7 routes (pastilles de F10, points de H06, MC01, MC04, MC06, H05 Mosaïque, MC02 recherche). T1 fait un test au clic réel, puis S1 corrige. Fusionnés avec : suite de LOT-06 (S7 `e580cbb3`, T1 `d3d8b455`), zones de 36 px de LOT-11 (S8 `5523167`). Gardes : seuls les échecs connus.
- 14 nov., 11h05 : zones de clic, règle commune §1.41 : 36 px, et le centre de l'élément ne doit jamais renvoyer un voisin. Bord des zones du socle à 34 px : ajouté à la liste de S0.
- 14 nov., 11h00 : **LOT-11 Développement fusionné** (S8 `f363811`, T1 `026759b1`), deuxième lot livré : 7 écrans dans les seuils, DEV-modeles-sites justifié (image v3), paquet client identique. Reste « Relancer » 72×26 sur le serveur (S8). Gardes : seuls les échecs connus.
- 14 nov., 10h55 : **LOT-02 accepté par T1, fusion retenue** : la fusion d'essai rend `check:socle-graphiques` rouge (5 fichiers de `src/refonte/contacts/` importent `socle/ui/graphiques`). Correctif demandé à S1 : `formaterEuro` depuis `socle/formats`, `MiniCourbe` depuis l'index `socle/ui`. La garde de S0 n'est pas touchée.
- 14 nov., 10h00 : **intégration de F1 reportée**. Elle demande de modifier `check:socle-archetypes` (garde de S0, qui attend Harun) et de pousser une 3ᵉ branche, ce que la session de S5 refuse. Elle reprendra avec S0. LOT-02 : réglages sur le poste et blocs « non disponible » acceptés (S1, 8 écrans sur 13). T1 envoie à S5 les zones exactes qui dépassent pour H11, H12 et ME01.
- 14 nov., 09h55 : **`check:navigation` et `check:systeme-demarrage` sont durables** (S5, `e9b6c404` + `91ec0f92`, reportés par le CO en `ce524697` et `b9511a5b`). Le compte est 101 + les écrans neufs déclarés, avec des contrôles négatifs. S8 et S7 peuvent déclarer leurs écrans neufs. ME05 : `/knowledge` et `/decisions` sortent de l'« aussi » du Supervisor (`src/bureaux/catalogue.ts`), une modification que **S5 est autorisé à faire** puisque S3 est bloqué. Ces deux écrans passent à la coquille, et la famille Écrire garde leurs entrées.
- 14 nov., 09h50 : 39 routes, toutes atteignables par un geste : **condition d'allumage remplie**. Fragilité notée : 36 routes ne passent que par la Bibliothèque. D02 et ⌘K vont à la liste de S0. Outils de T1 fusionnés.
- 14 nov., 09h45 : verdict de T1 sur LOT-03, **non accepté en l'état**. ME05 s'ouvre dans l'ancien bureau (bloquant) ; H11, H12, ME01 et ME05 à reprendre ; les autres écrans à justifier ; rien de coupé à 390 px. Les cibles gardent le dessin des fiches, avec une zone de clic invisible de 34 px (§1.39).
- 14 nov., 09h40 : relevé de T1 sur les 20 tâches courantes, première mesure : 12 sur 20 en 3 actions au plus. Deux défauts de la palette ⌘K (pas d'action de création ; Entrée lance Ajmani avant le module) vont à la liste de S0 (§1.38). Éléments ludiques absents, mais non construits : à surveiller, pas une régression.
- 14 nov., 09h35 : **LOT-03 complet** (S5, `a565a07`, 9 sur 9, ME04 sur `/archives`), en attente de T1. « Signatures » garde son identifiant (sur place), parce que H42 et H47 le citent : ma décision précédente est annulée. S5 a mis la garde à 102, un nombre encore figé : la version durable lui est redemandée en priorité, pour la deuxième fois.
- 14 nov., 09h25 : la session de S8 a refusé de modifier `check-navigation.ts`, qu'elle juge être un assouplissement de garde. **La correction revient à S5**, propriétaire du registre, qui a déjà pu modifier ce fichier. Leçon : une garde ne se modifie que par sa session propriétaire.
- 14 nov., 09h25 : défauts C-011 répartis (§1.37). On ne touche pas `src/screens` : chaque défaut devient une exigence de l'écran de la refonte qui le remplace. Deux corrections vont à S0. Les 39 routes ont toutes une entrée au registre : T1 vérifie qu'un geste mène à chacune, et c'est une condition de l'allumage.
- 14 nov., 09h20 : **LOT-07 préparation fusionnée** (`89ef910a`), paquet client vérifié par T1 ; 5 conflits, tous des ajouts, gardés. Premier `check:fidelite` sur les lots : LOT-11 non accepté (6 écrans non montés, faute de déclaration au registre) ; F20 à justifier, avec deux tuiles à ajouter ; F50 et H15 à justifier ; H16 à reprendre (bouton, jauge, suggestion). Réorganisation : la correction durable de `check:navigation` passe de S5 à S8, qui est bloqué et disponible.
- 14 nov., 09h10 : **C-008 réglé** (patch de T1, appliqué par le CO dans `check-contraste.mjs` et `routes-coquille.mjs`). Sous la coquille v4, les gardes trouvent 160 écrans au lieu de 15 ; contraste : 34 622 textes, aucun sous AA ; plus de faux rouge sur le néon. C-009 corrigé aussi. Restent des défauts réels, à répartir : 11 familles de cibles trop petites, 4 écrans qui débordent à 390 px, 39 écrans de l'ancienne barre que la coquille v4 ne relie plus.
- 14 nov., 09h00 : LOT-02, 4 écrans sur 13 (S1, `479995a`). La création préremplie demanderait de toucher `src/screens` : refusé, puisque l'édition cliente ne change pas. Les boutons ouvrent la création existante, avec l'écart noté. L'intérêt de H06 est estimé et dit comme tel.
- 14 nov., 08h55 : attendus du cockpit G08 (SIM `651ba70`) et calcul de S2 (`bf2f29e`) fusionnés ensemble. `check:journee` est à 64, toutes les gardes sont vertes. SIM et S2 n'ont plus rien en attente avant les zips v4.
- 14 nov., 08h50 : LOT-03, 5 écrans sur 9 (S5, `60de991`). Acceptés : `src/refonte/ecrire` au périmètre de `check:tutoiement`, avec 4 zones client ; « Signatures » qui s'ouvre sur H12 ; la série de ME01, sans devoir (repos le week-end, aucun reproche). S5 doit d'abord passer l'intégration de F1 et la correction durable de `check:navigation`.
- 14 nov., 08h45 : jeux de LOT-01 (SIM `d8ba0fc7`) et harnais de `check:journee` (S2 `c4f31a7`) fusionnés ensemble. Gardes lues avant le push, toutes vertes (`check:donnees` 122, `check:journee`).
- 14 nov., 08h40 : LOT-01 (`c978d05`) fusionné. `calculerAujourdhui` lit `serieDeLaJournee`, `defi.tenu` est au catalogue, et deux assertions de `check:socle-coquille` sont mises à jour par S2 pour la nouvelle règle de série. Gardes lues avant le push, toutes vertes.
- 14 nov., 08h35 : `check:navigation` figeait 101 entrées et aucun écran neuf, ce qui bloquait F1 et S8. S5 en fait une correction durable : 101 + les écrans neufs déclarés, seules les routes `/essai/` sont comparées, et le `nom.en` de la déclaration est accepté, avec des contrôles négatifs. S8 est autorisé à modifier deux assertions de `check:socle-coquille` (zone de S0, bloqué) pour le compteur de LOT-11, sans perdre l'intention de la garde. S7 a 3 écrans sur 15 au-dessus du seuil de fidélité : justifications écrites, puis T1 tranche. T1 passe `check:fidelite` environ une fois par heure.
- 14 nov., 08h30 : Atelier F1 (`e10a601`). Fusion d'essai faite en local : `check:socle-archetypes` rouge, donc **annulée avant le push**. L'intégration complète (branche de F1, déclarations au registre, correctif hors zone) est confiée à S5, sur `claude/refonte-atelier-integration`. tauxHoraire passe en « courant ». Place des modules corrigée (§1.33 n° 4). F1 se met en pause.
- 14 nov., 08h20 : LOT-01 préparation fusionnée (S2). La série suit la clôture des priorités ; S2 peut modifier une ligne de `calculer.ts` du socle, puisque S0 est bloqué ; moment `defi.tenu` accepté (§1.36).
- 14 nov., 08h : DS demande l'accord direct de Harun avant de construire, et n'a pas accès à amn-api : ses captures passent par l'aperçu statique, comme pour S0, et T1 garde les captures sur API. La session de S3 a refusé l'édition d'`equipes.ts` (C-007) : il faut l'accord de Harun. S3 n'a pas les zips v4. Lignes à coller dans `POINT-HARUN.md`.
- 14 nov., 08h : **socle v4 fusionné** (`a76c201`) après le feu vert de T1. La coquille n'est pas allumée par défaut (conditions de T1, §1.35). Feu vert à la construction des écrans pour tous les lots préparés.
- 14 nov., 05h25 : outils de T1 fusionnés (`be05376`) : contrôle de fidélité v4, garde `check:fidelite` (tests unitaires 2 sur 2), conditions de la coquille v4. Gardes vertes. Le verdict du passage 2 sur le socle est toujours attendu.
- 14 nov., 05h : **S0, deuxième échec sur le même point** (anti-blocage, règle C). Diagnostic : S0 ne pousse pas sur un message d'une autre session, et attend l'accord direct de Harun. Ce n'est pas un défaut de travail : c'est une règle de prudence de la session. Tentatives : deux messages du CO, dont un avec la règle de `REGLES.md`. Correctif proposé par S0 et retenu par le CO : un pont `@edition/moments` séparé, avec son jumeau `*.business`. Mis dans `POINT-HARUN.md`, une ligne à coller par Harun. Rien d'autre n'est bloqué par là.
- 14 nov., 04h30 : S0 s'était arrêté pour demander une confirmation avant de corriger `ancres` et `avoirs`. Le CO l'a relancé avec carte blanche dans son cadre (règle « Messages du CO »). Première relance sur ce point.
- 14 nov. : données de SIM `b0173f3` fusionnées : avoirs par défaut, rôles du serveur, jeu `serveur`. Gardes lues avant le push, toutes vertes (les trois rouges annoncés par SIM étaient déjà réglés sur `refonte-vivante`).
- 14 nov. : jeux de SIM `541b2bd` fusionnés avec les adaptations de S1 (`c06c8f3`), DS (`d99a197`) et S5 (`17a89e7`, `76a1ed8`), en une passe (`dabcd1e`). Gardes lues avant le push : contacts 93, argent 70, ecrire 99, echanger 94, donnees 116 ; aucune garde nouvelle rouge.
- 14 nov. : jeux de SIM `541b2bd` (fidélité de MC02, statut H05, liste de LOT-03, règlements partiels, remises, MR08) **pas encore fusionnés**. Ils rendent `check:contacts`, `check:argent` et `check:ecrire` rouges, par des changements commandés. S1, DS et S5 adaptent leur logique, puis le CO fusionne quand les trois sont verts dessus.
- 14 nov. : arbitrage S6 / S9. S6 étend le modèle des connecteurs (zone de S9, en pause) pour les devises et les plafonds : champs facultatifs seulement, aucune somme mêlant € et $, `check:connecteurs` étendu sans rien assouplir, une ligne dans le rapport de S9.
- 14 nov. : LOT-03 et LOT-05 complétés d'après les images v4 (S5, `0804131`, `425e4ad`), fusionnés (`d41501a`). Écarts image/texte : tutoiement dans l'interface (F20, MX05) ; humeur et énergie de ME01 comme l'image, bandeau de série non codé tant que la fiche n'a pas de règle ; compteurs de H10 et F40 calculés depuis les données, jamais repris de l'image.
- 14 nov. : LOT-04 avec les avoirs fusionné (`0727968`, 70 propriétés). Rôles du serveur dans H19, `owner` publie, `owner` et `admin` gèrent les connecteurs (provisoire), prises de H21 sur le poste, tarifs tels que publiés (§1.34).
- 14 nov. : données de SIM fusionnées (`b76b7cb`, 109 jeux, 114 contrôles). Gardes lues avant le push, toutes vertes, `check:argent` (69) compris. Les avoirs n'entrent dans le monde que sur demande, jusqu'à ce que DS les lise ; ensuite une ligne de `monde.ts` les active par défaut. Les jeux de LOT-11 sont livrés.
- 14 nov. : LOT-04 relu avec le v4, fusionné (`74bb0d4`) ; neuf décisions, dont le moteur de relances unique et la série de G03 (§1.33).
- 14 nov. : LOT-07 préparation (S6, `f52ef5d`). Couture `@edition/automatisations` et tarifs de H21 relevés. Fusion à blanc propre : aucune garde nouvelle rouge, typechecks verts, un seul conflit d'ajout dans `editions.yml`. **Fusion en attente** : elle touche `AutomationsRunner.tsx`, partagé avec l'édition cliente, donc T1 compare d'abord le paquet client (règle D). LOT-05 (`df07f85`) fusionné.
- 14 nov. : LOT-05 préparation et réglages de MC07 fusionnés (`5b2e8d0`), gardes lues avant le push (§1.32).
- 14 nov. : **incident**. La fusion de `c9e8713` (SIM) a été poussée (`c565bd7`) avant que ses gardes soient lues : `check:argent` était rouge (avoirs rangés avec les factures). Elle a été retirée quelques minutes après (`8121e07`), et tout est revenu au vert. DS adapte sa logique aux avoirs, puis le CO refusionne. **Correction de méthode : le CO lit toutes les gardes avant chaque push, jamais après.**
- 14 nov. : LOT-02 (`1c036fd`) fusionné : les relances lisent `connecteurs/reglages.ts`.
- 14 nov. : LOT-02 relu avec le v4, fusionné. Les fiches l'emportent sur les valeurs du CO : relances à 5 j, 9:00–18:00, une par client et par semaine glissante, une seule source de réglages (§1.31).
- 14 nov. : test quotidien avec Harun, dossier v4 dans un dépôt privé, `check:fidelite` confié à T1 avec un seuil provisoire (2 points au-dessus de l'accepté, 15 % pour un écran nouveau) (§1.30).
- 14 nov. : données fictives de SIM fusionnées (`f820c70`, 106 contrôles) : chargeur vers l'API d'essai (127.0.0.1, `@exemple.test`), dates à 10:42, attendus, scénarios de charge, partenaires. Jeux de LOT-11 commandés à SIM dès maintenant. `LANCER-EN-LOCAL.md` étape 4 à jour.
- 14 nov. : registre, 11 vues déplacées vers `creer` par S5 (`bb54c03`), fusionné : 101 entrées, 142 vues. LOT-04 (Commandes, Boutique) et LOT-07 (terrain, stock) prévenus par le CO. Régressions `ancres` et `avoirs` confiées à S0, `encres` à S3.
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

- Les écrans MB et T sont des vues propres à l'édition interne, branchées par le même mécanisme de substitution que les autres lots (§1.3). Seuils proposés : téléphone < 768 px, tablette de 768 à 1199 px (rail 76 px, vue scindée), bureau ≥ 1200 px. LOT-09 peut les ajuster. **Ajusté le 14 nov.** : ce sont les seuils de la fiche v4 T01 qui valent, 600 / 800 / 1100 px (*provisoire, révisable par Harun*).
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
| 3 | Valeurs par défaut | **Adoptées comme valeurs de départ**, toutes modifiables dans les réglages : plage clients lun.–ven. ~~08:00–19:00~~ **09:00–18:00**, plage équipe 07:30–21:00, ~~7~~ **5** jours entre relances (corrigé d'après la fiche MC07, §1.31), 30 courriels par heure, rotation 7 / 4 / 6, suggestion à 70 % du forfait. Harun peut les corriger à tout moment. |
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
| c | Routes de MR06 et MR10 | Deux routes nouvelles, dans `appRoot.internal.tsx` seulement : **`/reservations`** (MR06) et **`/photos-chantier`** (MR10). *Posées le 14 nov. dans `appRoot.internal.tsx` (MR05 y ajoute `/catalogue`, accepté par le CO). Les entrées de registre attendent S5 : le patch (déclarations `nouveau`, `NAV_EN` interne, `check:navigation` 101 → 104 et fixtures) est prêt hors dépôt.* |
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

### 1.30 Trois améliorations validées par Harun (14 nov.)

1. **Test quotidien avec Harun.** Chaque jour, en tête de `POINT-HARUN.md` : un « Programme de test du jour », avec ce qui est nouveau, comment le lancer (`LANCER-EN-LOCAL.md`, données de SIM), 5 à 10 essais précis et où noter les retours. Harun donne ses retours au CO dans leur conversation. Le CO en fait des tâches, consignées dans la section du lot concerné, et les distribue. **Premier test dès la fusion du socle v4.**
2. **Dossier v4 privé et lisible par les sessions.** Un dépôt privé séparé, `amn-devsec/amn-refonte-dossier`, jamais le dépôt public. **Vérifié par le CO le 14 nov.** : l'accès GitHub des sessions voit déjà des dépôts privés d'`amn-devsec` (`amn-api`, avec droit d'écriture). Un nouveau dépôt privé y sera donc lisible, si l'application GitHub de Claude y a accès. Chaque session l'ajoute (`add_repo`), puis le lit. Étapes pour Harun : `POINT-HARUN.md`, « À créer par Harun ». Le dossier ne contient rien de secret.
3. **Comparaison automatique aux images v4** (`check:fidelite`), **confiée à T1**, qui a déjà l'outil de fidélité, après son passage 2. Pour chaque écran livré : une capture, l'écart brut à l'image v4, et une ligne dans la section du lot. **Seuil provisoire, révisable par Harun** :
   - un écran déjà mesuré échoue si son écart monte de plus de 2 points au-dessus de sa valeur acceptée ;
   - un écran nouveau échoue au-dessus de 15 %, sauf écart justifié et écrit dans `docs/qualite/fidelite/justifies-LOT-xx.json` (données d'exemple, lignes du registre, pages derrière les palettes, méthodes de connexion absentes).
   
   Les images n'entrent jamais dans le dépôt public. La garde lit le dossier privé par `AMN_DOSSIER_V4`, et T1 et les sessions de lot la lancent avant chaque fusion. Dans GitHub Actions, seuls ses tests unitaires tournent : y lire le dépôt privé demanderait un secret, que le CO ne propose pas. **Passée sur chaque lot avant fusion.**

### 1.31 LOT-02 relu avec le dossier v4 (S1, `2c328de`) : fusionné, décisions du CO

Fusionné. `check:contacts` (85), les typechecks et lint sont verts, et aucune garde nouvelle n'est rouge. S1 a les zips v4.

| # | Point | Décision |
|---|---|---|
| 1 | Relances : la fiche MC07 dit 5 j et 9:00–18:00, le CO avait dit 7 j et 08:00–19:00 | **La fiche l'emporte** : 5 jours entre relances, plage clients du lundi au vendredi, 9:00–18:00, réglable de 3 à 14 jours. Une seule source pour tous : `src/refonte/connecteurs/reglages.ts`. S9 y aligne les valeurs par défaut, et S1 les lit sans les recopier. Le §1.22 n° 3 est corrigé d'autant. |
| 2 | Plafond par client | **Correction du §1.28 n° 4** : une relance par client et par **semaine glissante**, d'après la fiche, et non par jour. Le plafond de 3 est confirmé. |
| 3 | Jeux de SIM | Fidélité aux paliers de la fiche (800 / 1 800, avis 50, recommandation 200) et statut des clients (H05) : **commandés à SIM**. |
| 4 | « Messagerie » (MC03) | Ce sont les échanges de G07, pas le courriel. Corrigé par S1. |
| 5 | Échelles de l'intérêt (H06) | Le choix de S1 est adopté, **provisoire, révisable par Harun**. |

### 1.32 LOT-05 préparation (S5, `44690a3`) et réglages de MC07 (S9, `bcdc65f`) : fusionnés

Fusionnés (`5b2e8d0`). Gardes lues **avant** le push, et toutes vertes : `check:echanger` (88), `check:connecteurs` (103), `check:contacts` (85, qui lit les nouvelles valeurs de S9), les typechecks, lint, et aucune garde nouvelle rouge.

| # | Question de S5 (LOT-05) | Décision |
|---|---|---|
| 1 | Entrée « Messagerie » du registre | **Oui** : quand G07 arrive, l'entrée actuelle (équipe) est renommée « Canaux », G07 prend « Messagerie », et les deux sont essentielles. |
| 2 | MX01, MX03, MX06, nouveaux modules | **Oui** : ils entrent au registre avec leur écran, à la construction. Leurs collections rejoignent la liste présentée à Harun. D'ici là, « non disponible », avec la raison. |
| 3 | Heures ouvrées de la promesse de 2 h | **Une seule source** : la plage de `src/refonte/connecteurs/reglages.ts` (lun.–ven. 9:00–18:00, §1.31). Elle sert aussi d'horaires de l'organisation tant qu'il n'en existe pas d'autres. |
| 4 | Présence « lit / écrit » | **Masquée** au premier jet, sans rien simuler (comme §1.29, LOT-03 n° 3). |
| 5 | « Messages programmés » | Le nom de la fiche est gardé, **provisoire, révisable par Harun**. |
| 6 | Tutoiement dans MX04 | **La v4 l'emporte** : tutoiement dans l'interface, vouvoiement pour ce qui part chez un client. |

### 1.33 LOT-04 relu avec le dossier v4 (DS, `85aebbd`) : fusionné, décisions du CO

Fusionné (`74bb0d4`). Gardes lues avant le push : `check:argent` (69), les typechecks et lint sont verts, et aucune garde nouvelle n'est rouge. DS a les zips v4. Avec les jeux de SIM (`c9e8713`), 2 propriétés échouent encore : DS les traite (les avoirs).

| # | Point de DS | Décision |
|---|---|---|
| 1 | TVA par taux (fiche) ou par ligne | Reste **par ligne** (§1.29 n° 1, provisoire). Aucun écart sur l'exemple de H07 ni sur les jeux. La question va à Harun et à un comptable. |
| 2 | Relances : « J+7 » de la fiche contre le 8e jour du moteur ; étapes successives | On garde **le moteur unique** (le palier s'ouvre après le seuil) : `src/lib/relances.ts` sert aussi l'édition cliente. L'écart d'un jour est noté, **provisoire, révisable par Harun**. La condition d'étape de MA04 (relance 2 après relance 1) **s'ajoute** dans la couche de la refonte. |
| 3 | Modèle de mise en demeure | Il se règle dans l'**identité de facturation** (H18). Pas de modèle par défaut : l'étape reste vide tant qu'un modèle validé par un juriste n'est pas posé. La validation revient à Harun. |
| 4 | Place des modules de F1 | **Corrigé le 14 nov. sur la remarque de F1** : Taux horaire de revient dans MA12 (Tarifs et remises), Paiement en plusieurs fois dans **MA03** (Paiements en ligne), Comparateur de devis dans **H07** (Devis). Ce sont des liens : F1 garde ses modules. |
| 5 | Deux « séries » de même nom | **La définition de G03** (aucune facture en retard laissée « non traitée » à 23 h 59). F30 renvoie à G03, donc F30 la suit. |
| 6 | TVA récupérable | **Deux chiffres distincts**, chacun nommé : indicatif dans H08 (dépenses justifiées), déclaratif dans MA08. |
| 7 | Période de TVA | Un réglage, mensuel ou trimestriel. **Mensuel par défaut**, comme les jeux ; le trimestre est la somme des mois. **Provisoire**, à valider par un comptable. |
| 8 | Ordre des cartes de MA04 | **La règle de la fiche** (retard décroissant). L'écart avec l'image est noté. |
| 9 | Seuils | Les valeurs de la fiche remplacent les miennes là où elles existent. Elles restent réglables. |

### 1.34 Avoirs lus par DS (`0727968`), questions de LOT-07 (S6)

LOT-04 fusionné : `check:argent` passe ses 70 propriétés, avec et sans les avoirs. Gardes lues avant le push, toutes vertes. SIM peut passer `avoirs` à `true` par défaut.

| # | Question de S6 (LOT-07) | Décision |
|---|---|---|
| 1 | Zips v4 de LOT-07 | **S6 ne les a pas** : Harun les lui donne, ou le dépôt privé du dossier les rend lisibles (§1.30 n° 2). D'ici là, S6 prépare ce qui ne dépend pas des fiches. |
| 2 | Rôles : fictifs (MC04) ou serveur | **Les rôles du serveur**, seuls réels : Propriétaire (`owner`), Administrateur (`admin`), Membre (`member`), Invité (`guest`). « Partenaire » n'est pas un rôle : les partenaires sont des contacts (MC05). SIM aligne ses rôles fictifs sur ces quatre. |
| 3 | « Rôle dirigeant » | **Oui, c'est `owner`.** |
| 4 | Où vit le droit de publier | **Une règle par rôle**, sans champ nouveau : `owner` publie, les autres passent par « Demander la publication ». Un droit réglable par personne serait une demande à amn-api, présentée à Harun. **Provisoire.** |
| 5 | Qui gère les connecteurs | **`owner` et `admin`** (`isAdminRole`). **Provisoire, révisable par Harun.** |
| 6 | Où vit l'état des prises de H21 | **Sur le poste** pour l'instant (local d'abord). Les clés ne sont jamais sur le poste, elles restent chez amn-api. L'état passera au serveur avec LOT-13. |
| 7 | Devise et plafonds des tarifs | **Tels que publiés** : un prix en dollars reste en dollars, avec la mention « publié en dollars », sans conversion inventée. Le plafond par transaction est indiqué comme publié. |

### 1.35 Socle v4 fusionné (14 nov., 08h) ; coquille pas encore allumée par défaut

**Passage 2 de T1 sur `888f7a0` : feu vert à la fusion.** Rapport : `docs/qualite/SANTE.md` « Passage 2 » (claude/refonte-qualite @ `e4d20af`, fusionnée).
- L'édition cliente est intacte : le JS du paquet client ne contient que les coutures vides, aucun mot interdit, et pas de `data-famille-active`.
- 59 `check:*` d'`editions.yml` sont verts, ainsi que le typecheck et lint.
- Les trois conditions du §1.25 tiennent : attribut de famille posé et retiré en direct ; aucune animation infinie en mouvement réduit ; contraste mesuré sur les pixels, 1 136 textes, dont un seul à 4,49:1 (C-010).

**Fusionné** : `a76c201`, puis les outils de T1, puis `check:fidelite` et `test:fidelite` branchés (`9759cbd`). Seul conflit : des ajouts côte à côte dans `package.json` et `editions.yml`, tous gardés, sans doublon. Gardes lues avant le push : aucune garde rouge nouvelle, aucune garde d'`editions.yml` rouge, typechecks et lint verts.

**Allumage de la coquille par défaut (§1.9) : pas encore.** T1 ne le valide pas tant que ces points restent ouverts :
- **C-006** (S0) : tutoiement. 6 chaînes visibles sur LOT-00 et la coquille, plus 79 lignes sur 19 autres écrans. `check:tutoiement` est vert parce qu'il ne lit que les 353 textes du dictionnaire : il faut l'étendre au rendu.
- **C-007** (S3) : `check:encres`, des copies de jetons dans `src/refonte/garde/equipes.ts`.
- ~~**C-008** (T1)~~ : **réglé le 14 nov.**, les gardes trouvent 160 écrans. Ont été révélés : 11 familles de cibles, 4 écrans à 390 px, 39 écrans de l'ancienne barre que la coquille ne relie plus.
- Les correctifs `ancres` et `avoirs` (S0) ; l'ancienne garde `check:coquille` interne, à adapter (S0) ; C-005, CSS inerte dans le paquet client, 64 sélecteurs (S0) ; C-009, un compte neuf qui voit H42 fait planter `check:contraste` (S0 ou T1) ; C-010, encre T4 à `#8b8b8f` (S0).

**Fidélité de LOT-00** (mesures de T1, écart brut à ± 2 px, valeurs acceptées dans `docs/qualite/fidelite/acceptes-LOT-00.json`) : G09 13,3 · G06 11,4 · H42 18,1 · H40 20,0 · H47 21,3 · H41 22,7 · H43 27,6 · D02 30,6 · G05 43,4 %. En disposition (couleur à ± 10), tous les écrans sont sous 15 %. Les écarts justifiés sont dans `justifies-LOT-00.json`.

**Feu vert à la construction des écrans**, derrière le drapeau de la coquille. La coquille reste éteinte par défaut ; on l'allume dans Paramètres › Nouvelle coquille. Pour chaque lot :
- un commit par écran, et un push par lot de 3 à 5 écrans ;
- avant de signaler au CO : `check:tutoiement` et la garde du lot ;
- avant la fusion : T1 passe `check:fidelite`.

### 1.36 LOT-01 préparation (S2, `09a0a28`) : fusionnée, décisions du CO

Fusionnée. Les gardes, lues avant le push, sont vertes : `check:journee` (45), aucune garde nouvelle rouge, typechecks et lint. **S2 n'a pas les zips v4** : rien n'est construit, et les écrans sans fiche lue restent « à faire ». La session de S2 n'a pas pu écrire dans STATUT : le CO a reporté ses lignes au §7.

| # | Question de S2 | Décision |
|---|---|---|
| 1 | Trois définitions de « série » | **(c), la clôture des priorités du jour**, comme le dit la règle du §1.10 (« Série = clôture des 3 priorités »). `calculerAujourdhui` (fichier de S0, qui attend Harun) passe à `serieDeLaJournee` : **S2 est autorisé à faire ce changement d'une ligne**, avec `check:socle-vivant` et les gardes du socle verts. SIM aligne ses attendus H04 et H25. |
| 2 | Pas de priorités du jour dans les jeux | **Commandé à SIM** : un jeu `dailyPriorities`. |
| 3 | H25 « même règle que N01 » | **Le fil du jour de N01**, comme le dit le texte cité de la fiche. **Provisoire**, à relire avec la fiche. |
| 4 | Engagements écrits de L07 | Ils demandent une collection nouvelle : la question rejoint la liste présentée à Harun. D'ici là, l'invitation à écrire son engagement s'affiche, et l'enregistrement est « non disponible », avec la raison. |
| 5 | Moment `defi.tenu` (ton `fete`) | **Accepté.** S2 l'ajoute au catalogue et à la liste de `check:moments`. |
| 6 | Agrégats Stripe de G08 | Une demande à amn-api (Harun et Mohamed). Aucune clé ne passe par le poste. |
| 7 | Routes de G08, H03 et MJ05 | À lire sur les fiches, quand S2 aura les zips. |
| 8 | Périmètre de `check:tutoiement` | Ajout de `src/refonte/journee` : **accepté**. |

### 1.37 Défauts révélés sous la coquille v4 (C-011, T1) : répartition du CO

Le détail est dans `docs/qualite/constats/C-011-defauts-reveles-sous-coquille-v4.md` (claude/refonte-qualite @ `ba54ec4a`). Ce sont presque tous des **écrans d'origine** (`src/screens/*`), que les gardes ne voyaient pas. **On ne touche pas `src/screens/**`**, qui sert à l'édition cliente. Chaque défaut devient donc une **exigence de l'écran de la refonte qui le remplace** : cibles de 34 px au moins, rien de coupé à 390 px. T1 le vérifie au `check:fidelite` du lot.

| Propriétaire | Écrans d'origine concernés (cibles ; largeur à 390 px) |
|---|---|
| S2 (LOT-01) | Agenda : jours de 42 px, créneaux de 7 et 41 px. Partagé avec l'édition cliente, donc corrigé dans l'écran de la refonte seulement. |
| S5 (LOT-03) | Templates (11 px), Pages (34 px) ; Journal de bord et Décisions (texte écrasé) |
| DS (LOT-04) | Dépenses (barres de 17 px), Relances (32 px) |
| S7 (LOT-06) | Tournées (24 px, 529 px), Réservation de matériel (620 px) |
| S6 (LOT-07) | Automatisations (413 px), Calculatrice pro (445 px) |
| S3 (LOT-08) | ChoixModules (32 px), Organisations (texte écrasé), Rapport client (402 px) |
| S6 (LOT-10) | Hameçonnage (texte écrasé) |
| **S0 (socle)** | Lignes de H40 (18 px) ; `.dm-recherche` de `VueTousLesModules.tsx` (660 px : **une seule correction règle 10 écrans**). Ajouté à la liste de S0, qui attend l'accord de Harun. |
| aucun lot | `src/assistant/AssistantPanel.tsx`, « Nouvelle conversation » à 32 px (80 occurrences). Partagé avec l'édition cliente : **laissé tel quel**, et noté. |

**39 routes que la coquille ne relie plus directement** : **condition d'allumage remplie** (T1, 14 nov.). Chacune a un geste qui y mène. **Fragilité** : pour 36 d'entre elles, le seul chemin est la page Bibliothèque (`#/bibliotheque`). « Tous les modules » ne montre que la première vue de chaque module, et aucun onglet n'y mène. Correctif pour S0 (§1.38 n° 7) : « Tous les modules » montre aussi les vues secondaires de chaque module, et ⌘K les trouve. Script : `scripts/qualite/routes-atteignables.mjs`.

### 1.38 Liste de S0 (socle), à reprendre dès que Harun le débloque

Dans l'ordre :
1. `check:ancres` (lien d'évitement transformé en bouton, phrase de la démo) et `check:avoirs` (pont `@edition/moments`, avec son jumeau `*.business` vide). Ajouter les deux à `editions.yml`.
2. **C-006**, tutoiement : 6 chaînes sur LOT-00 et la coquille, 79 lignes sur 19 écrans. Étendre `check:tutoiement` au rendu, pas seulement aux 353 textes du dictionnaire.
3. **C-010** (encre T4 à `#8b8b8f`), **C-005** (CSS inerte dans le paquet client, 64 sélecteurs), ancienne garde `check:coquille` interne à adapter.
4. **C-011, part du socle**, plus la pastille « La Garde veille » de l'en-tête (zone de clic de 34 px, §1.39) : lignes de H40 à 18 px ; `.dm-recherche` de `VueTousLesModules.tsx` à 660 px, une correction qui règle 10 écrans à 390 px.
5. **Palette ⌘K (H41)**, relevé de T1 sur les 20 tâches courantes :
   - (a) ajouter des actions de création (« Nouvelle tâche », « Nouveau client », « Nouvelle facture », « Nouveau devis », « Nouveau rendez-vous »), pour tenir l'objectif de 3 actions au plus ;
   - (b) quand la saisie correspond à un module, **Entrée ouvre le module**, et « Demander à Ajmani » passe en second. Aujourd'hui, « client » puis Entrée lance Ajmani.
6. **Bouton du socle** : zone de clic invisible de 36 px (§1.41 ; il fait 31 px de haut, comme les fiches), et même bord pour `FilterChips` (filtres de 34 px), `.sc-segment`, `.sc-interrupteur` et les actions de PageHead, aujourd'hui à 34 px exacts ; de même, dans la coquille : « Ouvrir le menu » et « Notifications » de l'en-tête mobile (34×34), « Chercher un module, un client… » (181×34), « Tous les modules » (34×34), carte « Aujourd'hui » (197×34), relevés par T1 ; **boutons de PageHead** décalés de 26 px par rapport aux images, sur les 15 écrans de LOT-06 (relevé de S7).
7. **« Tous les modules » (D02)** : montrer les vues secondaires de chaque module (36 écrans n'ont aujourd'hui que la Bibliothèque comme chemin) ; ⌘K les trouve par leur nom.

Éléments ludiques protégés (relevé de T1) : absents partout, parce que leurs écrans (LOT-01, LOT-10) ne sont pas encore construits. Ce n'est **pas une régression**. L'absence devient bloquante dès qu'un lot annonce L07, H02, H04 ou L01 livrés : T1 relance son contrôle à chaque lot concerné.

### 1.39 Cibles de 34 px et dessin des fiches v4 (14 nov.)

Les fiches v4 dessinent beaucoup de boutons d'action à 31 px de haut (Personnaliser, Nouvelle page, Partager…), plus des cases et des pastilles de 26 à 28 px. **Décision du CO** : le dessin suit la fiche, et **chaque cible reçoit une zone de clic invisible d'au moins 34 px**, comme le socle le fait déjà pour PageHead, l'interrupteur et les cases (§1.13). T1 mesure la zone de clic, pas le dessin. C'est valable pour tous les lots. La pastille « La Garde veille » de l'en-tête (28 × 29) est au socle : elle va dans la liste de S0 (§1.38).

### 1.40 Méthode de `check:fidelite` : l'aperçu pour la fidélité, l'application pour la structure (14 nov.)

Sur l'API d'essai, beaucoup d'écrans s'affichent à l'état vide : seuls 8 jeux de SIM sur 101 y ont une collection. Les images v4 montrent l'état rempli, donc l'écart mesurait surtout « vide contre rempli ». **Décision du CO** :
- la **fidélité aux images v4** se mesure sur l'**aperçu statique** de chaque lot (`npm run apercu -- <ID>` ou le banc du lot), avec les jeux de SIM, à l'état rempli ;
- l'**application** (build interne, API d'essai, coquille v4) sert aux **contrôles de structure** : écran monté dans la coquille, route, paquet client, cibles de 34 px, largeur à 390 px, contraste, et un état vide propre et honnête.

**Pas de nouvelle collection dans l'API d'essai** : ce serait le contrat d'amn-api, donc une décision de Harun (liste « Nouvelles données partagées »). Chaque lot donne dans son rapport la commande d'aperçu de ses écrans.

### 1.41 Zones de clic : 36 px, et le centre de l'élément reste à lui (14 nov.)

Deux précisions de §1.39, mesurées par T1 et S8.
1. **Taille** : zone de clic **≥ 36 × 36 px centrée sur l'élément**, vérifiée par 9 points à ±17 px (le bord à ±18 est exclusif ; outil de T1 : `h = min/2 − 1`). Une zone de 34 px exacts ne passe pas. Les zones invisibles (`::after`) font donc au moins 36 px, le dessin ne change pas. Sur un nuage dense, la zone de chaque point s'arrête à mi-chemin du point voisin : elle peut faire moins de 36 px, à condition que son centre reste à lui. De même pour les cases d'un calendrier (ME01, 32 × 32) et pour les lignes de liste qui se touchent : leur zone est la cellule ou la ligne elle-même. Un `<label>` qui enveloppe son champ reçoit le clic à bon droit ; un `<div>` qui ne transmet pas le clic, non. Le socle a le même bord à 34 px (`.sc-segment`, `.sc-interrupteur`, actions de `PageHead`) : c'est ajouté à la liste de S0 (§1.38).
2. **Recouvrement** (règle de T1, dans `scripts/qualite/exigences-ecran.mjs`) : c'est **refusé** si le centre, ou la moitié centrale de la boîte visible, renvoie un voisin (un clic au milieu de l'élément part ailleurs). C'est **accepté** si seuls les bords des marges de 34 px se chevauchent : le dernier élément dessiné reçoit le clic dans la marge.

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
| S1 | `session_01CLLXtV5QPhZ4bZZRf6kdha` | **LOT-02 livré** ; segments de MC07 et de H45 à 38 px (`ca47af79`) chez T1 | **LOT-01, moitié S1** (H01, H03, G08, MJ01 à MJ05) sur `claude/refonte-journee-2` |
| S5 | `session_012jWErBSSkcoVaU3iN895bQ` | **LOT-03 et LOT-05 livrés** ; dernières zones de LOT-03 (`d597994f`) chez T1 | **préparation de LOT-09** Mobile et tablette (note, sans écran), sur `claude/refonte-mobile` |
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
| S1 | `session_01CLLXtV5QPhZ4bZZRf6kdha` | **LOT-02 livré** ; segments de MC07 et de H45 à 38 px (`ca47af79`) chez T1 | **LOT-01, moitié S1** (H01, H03, G08, MJ01 à MJ05) sur `claude/refonte-journee-2` |
| S2 | `claude/refonte-s2-accueil` | fusionnée à `a537dbe` ; 5 commits non fusionnés | `b228f5d` | [`rapports/S2.md`](rapports/S2.md) | Remplacée par LOT-01 |
| S3 | `claude/refonte-s3-supervisor` (ancienne), `claude/refonte-garde` (LOT-08) | ancienne fusionnée ; LOT-08 en préparation (note seulement, aucun code) | `e7f4f25`, `2eedc9b` | `docs/refonte/preparation-garde.md` (branche LOT-08) | 15 questions tranchées au §1.8 |
| S4 | — | annulée | — | — | — |
| S5 | `session_012jWErBSSkcoVaU3iN895bQ` | **LOT-03 et LOT-05 livrés** ; dernières zones de LOT-03 (`d597994f`) chez T1 | **préparation de LOT-09** Mobile et tablette (note, sans écran), sur `claude/refonte-mobile` |
| S6 | `claude/refonte-sec-*` | phase 1 en cours, privée. **Ne pas fusionner sans décision de Harun.** | — | `docs/securite/**`, hors dépôt | Prend LOT-07 puis LOT-10 |
| S7 | `session_01C5DAW2srkqgCKRjEKHH8Hy` | **LOT-06 livré** (`66719328` fusionné) | zones de 34 → 36 px et « Réduire » (#/tournees), puis **LOT-01, moitié S7** (N01, H25, H02, H04, L01, L02, L03, L07) |
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

**v2** : 8 sur 8 faits, **fusionné** (`488cdcc`). **v3** (design v3 du dirigeant, 1er nov.) : les 8 écrans refaits, plus **G09 Écran de veille** (ajout du dirigeant, 4 nov.), la coquille v3, la couche de mouvement et les composants du §0.4, **et, le 6 nov., le socle v3 complet du §1.10** : briques partagées, `useAujourdhui`, mécanisme de substitution (§1.3), `check:coquille` sur la barre v3, audit du §4 et du §1.2, réglages propres des écrans : sur la branche, **à fusionner**. `refonte-vivante` (`fc1623e`) y est fusionnée : la fusion sera directe. Le dossier complet (fidélité écran par écran, écarts de T1 corrigés et laissés, écarts v3, écarts du socle complet, questions) : [`rapports/LOT-00.md`](rapports/LOT-00.md).

Captures : faites par S0 **sans lancer l'app** (aperçu statique `file://` des vrais composants de chaque écran sur données fictives, `npm run apercu -- <ID>`, capture et comparaison avec l'outil de T1) ; T1 refera les siennes au passage 2. Pourcentages ci-dessous : pixels hors ± 2 px, données d'exemple écartées. Après le socle complet, les 13 aperçus (9 écrans, 4 en coquille) sont **identiques au pixel** à ceux d'avant (0 px d'écart), donc mêmes pourcentages.

**Captures v4 (point 9 de la passe finale, 12 nov.)** : les 9 écrans et les 4 aperçus en coquille, capturés à 1440 × 900 et comparés aux images v4 (`AMN-Business-dossier-v4/images`) par l'outil de T1, **en brut** (aucune zone de données d'exemple écartée, contrairement aux pourcentages v3 de la colonne « Écart / note » ; coquilles : zone principale écartée). Avant → après les corrections du point 9 :

| Aperçu | Écart brut v4 | Ce qui reste (écarts gardés ou à T1) |
|---|---|---|
| H40 | 16,3 % → **14,5 %** | données fictives de l'aperçu (contenus des fils, anneau) |
| H41 | 19,9 % → **19,9 %** | la page derrière la palette (vide dans l'aperçu, remplie dans l'image) ; pas d'effectif, de contacts ni de note épinglée (aucune source) |
| H42 | 10,4 % → **9,9 %** | données fictives (étapes, papier) ; pas de référent ni de créneaux |
| H47 | 15,7 % → **15,3 %** | totaux réels des modèles (10 à 12 au lieu de 20) ; encarts automatisations et modèles absents |
| H43 | 36,6 % → **24,0 %** | fonds des mini-fenêtres (à ± 4 niveaux sur de grandes surfaces, comptés en entier) ; contenus des neuf situations |
| D02 | 24,9 % → **12,2 %** | lignes du registre : **écart gardé** (§1.18 : l'ordre et les comptes du registre font foi), hors pourcentage |
| G06 | 24,8 % → **12,3 %** | « Bon retour, Aaron », compte enregistré, clé d'accès et lien par e-mail : n'existent pas dans le dépôt (fiche §8), non dessinés |
| G05 | 39,1 % → **39,1 %** | la page derrière le voile (l'image montre l'Accueil rempli) ; « Préparer les relances » au lieu d'« Envoyer » ; pas de ligne « Objet » |
| G09 | 19,5 % → **3,4 %** | orbites et balayage (mouvement figé à un autre instant) |
| Coquille H40 / H42 / H47 / D02 | 3,7 / 2,8 / 3,2 / 10,1 % → **3,6 / 2,6 / 2,8 / 10,0 %** | la section « ESPACES DE TRAVAIL » (Développement), absente des images antérieures à §1.17 ; D02 : la page derrière le voile |

| ID | Écran | Type | État | Écart / note |
|---|---|---|---|---|
| H40 | Système · Notifications | mixte | fait (v4) | 0,22 %. Seul le canal « App » a des émetteurs ; niveau de bruit et silence enregistrés sans émetteur (effet : pointillé de l'anneau) ; pas de « lu par … » (aucune source) ; « Réglages » ouvre la rubrique Notifications des Paramètres |
| H41 | Système · Recherche ⌘K | mixte | fait (v4) | palette 0,62 % ; pas de ⌘↵ (fenêtre unique d'Electron) ; pas d'effectif, de contacts ni de note épinglée dans l'aperçu (aucune source) |
| H42 | Système · Démarrage | mixte | fait (v4) | 0,33 % ; une fois, à la toute première connexion ; « Créer le devis » ouvre les clients (aucun devis prérempli, H07) ; étapes 5 et 6 manuelles ; pas de référent ni de créneaux (→ `/assistance`) |
| H47 | Système · Choisir son métier | mixte | fait (v4) | 0,51 % ; réglage personnel ; totaux réels des modèles (10 à 12) au lieu de 20 ; encarts automatisations et modèles absents (les modèles de métier n'en créent pas) |
| H43 | Système · États et messages | nouveau | fait (v4) | 0,72 % ; `/dev/etats` (développement seulement) et les briques `situations` compactes ; `BlocEtat` passe par `IconTile` |
| D02 | Système · Tous les modules | mixte | fait (v4) | vraie page de la coquille (plus un panneau) ; 0,30 % hors lignes du registre ; comptes du registre (14 / 7 / 11 / 13 / 15 / 7 / 19 / 15), la 4ᵉ colonne défile dans sa carte ; Cyber « 9 espaces » (catalogue) ; tuiles, grille des épinglés et tuile d'ajout = `ModuleTile`, `ModuleGroupGrid`, `AddModuleTile` |
| G06 | Système · Connexion | mixte | fait (v4) | 0,09 % hors balayage et méthodes absentes ; clé d'accès, lien par e-mail et compte enregistré n'existent pas dans le dépôt : non dessinés (fiche §8) ; authentification inchangée (`check:systeme-connexion`) ; « 12 organisations » : texte fixe |
| G05 | Échanger · Ajmani ⌘J | mixte | fait (v4) | bandes à ± 1 px ; « Préparer les relances » au lieu d'« Envoyer » (n'envoie rien) ; pas de ligne « Objet » ni de modèle approuvé (aucune source) |
| G09 | Système · Écran de veille | nouveau | fait (v4) | 0,00 % ; derrière le drapeau de la coquille (éteint : le voile d'avant) ; jamais pendant un appel, un partage, une dictée ou une vidéo ; **aucun verrouillage après inactivité n'existe** (écart gardé, §1.12) : délai enregistré sans effet, « Espace verrouillé » non affiché ; réglage « Écran de veille » dans Paramètres (surface propre, 6 nov.) |

**Passe finale v4 (12 nov., §1.13 et §1.14) : points 1 à 9 faits, et les compléments du CO (§1.17).** Un commit par point sur la branche :

| Point | État | Commit |
|---|---|---|
| 1. Les six constats de la seconde passe adverse, et « -0,00 € » | fait : `Segmented` choisi en T1 au survol (`:where`), `Kpi` avec infobulle complète et rien sous la mini-courbe, gardes `check:socle-briques` / `check:socle-situations` (tuile de `BlocEtat` sous toute écriture), `check:socle` (liste de sélecteurs entière), `check:coquille` (`color(srgb …)` lu, `oklch` / `lab` / `lch` refusés), rangées de `/dev/socle`, `formaterMontant` | `8815d6d` |
| 2. Réponses du CO aux 14 questions | fait : zones de clic de 34 px invisibles (interrupteur, cases, segments, boutons de `PageHead` ; mesurées dans Chromium, dessin inchangé), segment choisi en graisse 600 (largeur réservée), compteurs (la déclaration du module l'emporte, l'activité non vue en repli), `FournisseurAujourdhui` au-dessus des deux coquilles, sept routes exactes pour les hubs (`hubs.ts`, La Garde : `/ensemble/garde`), C-001 fermé (socle dans `src/socle/theme.css` par la couture `@edition/socle-theme.css` ; feuille cliente compilée identique à celle de `main`), deux PNG retirés, drapeau `critique` lu par D02 (aucun posé : attendu de S5), `vers` / `onClick` exclusifs, bureaux mesurés coquille allumée | `1345183` |
| 3. Jetons de famille `--fam-a` / `--fam-b` | fait : onze paires (`--socle-fam-<famille>-a/-b`), posées par la coquille selon la famille active (`data-famille-active` ; Cyber, sinon la famille, sinon Système) et par tout bloc `data-famille` ; Cyber distinct de La Garde ; rien ne les lit encore (aperçus identiques) | `d35320f` |
| 4. Couleurs d'état v4 | fait : les huit couleurs de 06 §2 dans `noir.css` (états et teintes de famille qui les portaient) ; `check:socle` refuse toute couleur d'état v3 dans le socle et les zones de LOT-00 ; `check:coquille` passe à l'ambre et aux teintes v4 | `505d73a` |
| 5. Les quinze règles de rendu (06 §3) | fait : halos de la famille (un jeton `--socle-halos` qui suit la paire de l'élément), cartes v4, h1 et grands chiffres en dégradé, boutons principal et secondaire, pastilles, lueurs (points, anneaux, courbes, arcs), histogrammes, progression, barre latérale active (famille, module, repère 3 × 14), onglets, segments, puces, bord dégradé de la barre Ajmani et des suggestions, avatars, tuiles d'icône ; mouvement réduit et « aucun » coupent les lueurs animées ; teintes v3 passées en v4 (Outils `#7CC4FF`, La Garde `#5EE6A8`, interrupteur allumé, bord du toast `#243931`) ; `check:socle` vérifie les quinze règles, `check:coquille --page` mesure la barre v4 | `4e49562` |
| 6. Entrée « Développement » | fait : toujours visible, dernière ligne d'ESPACE juste au-dessus de SURVEILLANCE, dépliée sur ses écrans (modules du registre quand LOT-11 déclare `developpement`, sinon sa vue d'ensemble `/ensemble/developpement`, substituable) ; deux signaux (déploiements en cours, tests en échec) déclarés par LOT-11 : `declarerCompteurs({ famille: 'developpement', useCompteurs, useSignaux })` dans `src/refonte/compteurs/developpement.ts` | `175d0be` |
| 6 bis. Compléments du CO (§1.17, §1.19) | fait : section « ESPACES DE TRAVAIL » (Développement seul, juste au-dessus de SURVEILLANCE) ; sous-liste dans l'ordre des 13 lignes de l'image, modules de LOT-11 à leur rang et vues reprises d'autres familles (Automatisations, Coffre-fort, Base de connaissances ; Connecteurs, Missions et tickets, Sauvegardes dès qu'ils seront au registre), cinq lignes au plus puis « + N autres » ; 8ᵉ hub `/ensemble/developpement` | `7134ca6` |
| 7. Tutoiement | fait : coquille, mots du socle et 9 écrans (et leurs aperçus), d'après `_data/tutoiement.json` ; vouvoiement gardé dans le brouillon de relance (texte client), « Combien êtes-vous ? » (l'équipe) et les mots reconnus à la saisie ; **guide de voix** du socle (`src/socle/mots/voix.ts`) ; gardes des écrans passées à l'exigence du tutoiement | `8c8b8e9` |
| 8. Gardes | fait : `check:tutoiement` (périmètre, zones client, lexiques de saisie, citations, écrits dans la garde) ; `check:voix` étendu au guide de voix et aux mots du socle ; les deux dans le workflow des éditions | `b5d61a5` |
| 9. Captures v4 | fait : tableau ci-dessus ; corrections trouvées par la comparaison, toutes d'après les sources : la famille active posée aussi sur la racine du document (palettes ⌘K / ⌘J, dialogues et toasts en portail la reçoivent), le 3ᵉ halo des sources (140 pages sur 143), le voile de halos des pages pleines (D02, G06, G09, H43), le bouton principal de G06, l'instant de G09, la case cochée de G05, le bord dégradé du « point d'Ajmani » de H40 | voir le message au CO |

Écarts et restes de la passe finale (points 1 à 9) :

- Les pourcentages de la colonne « Écart / note » sont ceux de la v3 ; ceux de la v4 sont au tableau des captures v4, en brut.
- Outils : le CO a demandé sa couleur v4 ; les sources v4 (F60, H18 à H20, tuiles de D02) dessinent encore son icône en `#9A9AA0`. Appliqué : `#7CC4FF`, sa couleur a, comme toute famille.
- Bord du toast : les sources v4 de H43 gardent `#2C3327` ; appliqué `#243931`, la même règle qu'avant (le succès à 15 % sur le fond du dialogue) avec le succès v4.
- Gardés comme les sources : les tuiles plates de D02 / H41 / H43 (`part`), le rayon 14 des boîtes (dialogue, toast, palettes, zone vide). Écarts restants : la teinte d'avatar par nom (les sources la prennent à l'initiale) ; l'instant de G09 rendu dans sa couleur a, sans le dégradé de la source (un disque de 10 px).
- `check:encres` : ses 4 fautes restent celles d'avant, dans la zone de La Garde (`src/refonte/garde/equipes.ts`), hors socle.
- `check:ajmani` (« valeurs validées ») : surface, élevé et bord passent aux valeurs des cartes v4 (`#111113`, `#19191C`, `#2A2A2E`), parce que `check:socle` exige que ces miroirs suivent les cartes.
- Développement : à 900 px de haut, une famille dépliée et trois épinglés, la colonne dépasse d'une ligne et défile (la carte « Aujourd'hui » s'atteint en descendant). La source DEV le montre en tête d'« ESPACES DE TRAVAIL » avec ses treize sous-modules : appliqué la place demandée par le CO et la règle des cinq lignes.
- Réponse 12 du §1.13 (registre d'exemple de D02) : **retirée** par le CO (§1.18) ; l'aperçu garde le vrai registre de S5, écart gardé hors pourcentage.
- Réponse 14 : les images F10, F30, F50, F70, MR06, MR09, H16, N01 et H18 sont dans le dossier v4 ; les cotes provisoires du socle seront reprises au point 9.
- `check:coquille` en mode bundle (second passage avec les bureaux) : non exécuté ici, à T1.
- `src/index.css` (fichier sensible, « ajouts seulement ») perd le bloc du socle sur décision du CO (C-001) : il ne garde, de plus que `main`, que l'import de la couture. Un `*.business.*` nouveau : `src/edition/socle-theme.business.css`, le jumeau vide de cette couture.

**Socle v3 (§1.10), état au 6 nov. : complet, sauf l'allumage (§1.9).** Un commit par livrable et par écran ; tout est sur la branche.

| Pièce | État | Où |
|---|---|---|
| Mouvement §0.2, police monospace, composants §0.4 | fait (`3c0ad5d`) ; les noms des fiches `amn-grow`, `amn-slide`, `amn-bar`, `amnFlow`, `amnHalo` sur la même couche (`c173bcf`) | `src/socle/mouvement.css`, `couche-mouvement.ts`, `src/socle/ui/vivant/` |
| Barre latérale v3, carte « Aujourd'hui », **Cyber toujours visible** (SURVEILLANCE, compteur du SOC) | fait (`f9251f7`) ; compteurs de la barre **déclarables par lot** (`7d53523`) : un fichier `src/refonte/compteurs/<famille>.ts` ramassé seul | `src/socle/coquille/`, `src/refonte/coquille/` |
| `useAujourdhui` (point 3) : un seul calcul pour la barre et N01 | fait (`be95edc`) : fonction pure `calculerAujourdhui` (règles de S2 appelées, pas recopiées), fournisseur monté une fois dans la coque interne, la carte et `useAccueil` lisent le même objet ; LOT-01 le lit sans recalculer | `src/refonte/coquille/aujourdhui/` |
| Briques partagées (point 1) | fait (`83e8433` → `dcd3679`) : `ModuleTile`, `ModuleGroupGrid`, `AddModuleTile`, `PageHead`, `IconTile`, `CountBadge`, `StatusPill` ; `IconButton`, `SearchBox`, `AvatarStack`, `AjmaniBar`, `SuggestionCompact`, `FlagUrgent` = noms des fiches posés sur les briques existantes (`noms.ts`) ; D02, la barre, H40, H42, H47, H41 et H43 passent par elles **sans changer un pixel** (captures identiques) | `src/socle/ui/briques-partagees/`, `src/socle/ui/noms.ts` |
| Audit du §4 (chaque brique mesurée dans le CSS calculé) et du §1.2 | fait (`da4f2c2`, `b52665d`) : tout à la valeur exacte sauf trois corrections (Empty = `EtatVide` : pointillé `#2E2E33`, rayon 14, titre 14, texte 300 px, tuile 44, action obligatoire ; filet de TimelineItem `#222224` ; rayon de bouton 9) ; ajouts demandés par LOT-06 : `Anneau` 26 à 80 px, `Check` 16 px, `Segmented` compact, `SearchBox` 38 px, `Mono`, `src/socle/formats.ts`, jetons de décor, hachures et pointillés d'état | `src/socle/ui/`, `src/socle/noir.css`, `src/socle/formats.ts` |
| Mécanisme de substitution (§1.3) | fait (`634c965`, `bfaf40d`) : un fichier `src/refonte/substitutions/declarations/<lot>.tsx` par lot, ramassé seul ; un point unique `SubstitutionDEcran` à la place des quatre `Outlet` de la coque interne (`AppLayout` × 2, `ClientContextLayout`, `CadreBureau` des bureaux ; route, `ModuleRoute` et session de support conservés) ; jumeau cliente inerte ; **aucune substitution réelle déclarée** (LOT-00 n'a rien d'honnête à substituer : D02 est déjà la route d'origine) ; preuve statique d'isolement `check:client-statique` (graphe d'imports depuis `src/renderer.tsx` avec les alias client + motifs de `check:business`), sans build servi | `src/refonte/substitutions/`, `@edition/substitutions`, `AppLayout`, `ClientContextLayout` |
| `check:coquille` sur la barre v3 (point 5) | fait (`53fc39a`, `6ccedb2`) : second passage coquille allumée en mode bundle (même squelette que le premier, **à prouver par T1** : aucun build servi ici ; lancer `AMN_COQUILLE=eteinte` puis `allumee`) ; mode `--page` prouvé sur les quatre aperçus en coquille (OK) et sur des copies sabotées (ambre opaque ou translucide, pastilles, encre et interlettrage des sections, réseau) ; le premier passage (T1) ne voit que l'ambre opaque, comme avant | `scripts/check-coquille.mjs` |
| Réglages propres aux écrans (demande du dirigeant, 6 nov.) | fait (`c03bed3`) : Mouvement (segmenté, état en pastille), Écran de veille (interrupteur d'en-tête, délai en segmenté, verrou en liste), Nouvelle coquille (ce qu'elle apporte, interrupteur) : trois surfaces distinctes sur les contrôles du socle, aucun gabarit ; H40 « Réglages » atteint la rubrique Notifications (`ANCRES_REGLAGES`) ; G09 reste inactif ; D02, H47, H43, G06, G05, H41 : aucun réglage prévu | `src/edition/socle.internal.tsx`, `src/refonte/systeme/veille/EcranDeVeilleSection.tsx`, `src/refonte/coquille/CoquilleSection.tsx` |
| Allumage de la coquille (§1.9) | **non fait** : attend le passage 2 de T1 ; une ligne de `src/refonte/coquille/drapeau.ts` | — |

**Lecture de la demande du 6 nov.** (« socle complet, pour les deux éditions ») : le socle est **utilisable par les deux éditions** à travers les coutures `@edition/*` (chaque brique interne a son jumeau cliente inerte), et **l'édition cliente ne change pas** (REGLES, §1.3) : `src/screens/**` intact, aucun `*.business.*` changé de comportement, preuve statique `check:client-statique` en plus de `check:business` (T1). « Une page de réglages propre à chaque écran concerné » : le §0.3 (aucun gabarit) appliqué aux trois réglages de LOT-00 ; H18 (LOT-07) n'est pas construit, les surfaces vivent dans la porte interne des Paramètres. `/ensemble/:famille` reste le repli générique (§1.10 point 2).

**Ce qui n'est pas branché (dit, jamais simulé)** : la coquille, éteinte par défaut ; les compteurs de Stock, Chantiers et Commandes (LOT-06) ne sont pas déclarés, seul le point d'entrée existe ; les alertes Cyber : rien tant que le SOC n'est pas prêt (`useCyber().pret`) ; le délai de verrouillage de l'écran de veille, enregistré sans effet (aucun verrou n'existe, l'aide le dit) ; aucune substitution déclarée ; `check:coquille` en mode bundle coquille allumée, non exécuté ici.

**Provisoire (attend une fiche ou une décision)** : les cotes de `ModuleTile` standard (41 px), de `ModuleGroupGrid` et d'`AddModuleTile` (fiches F10 à F70 non disponibles au socle) ; `Segmented` compact 26 px, `Anneau` 26 à 58 px, hachures et pointillés (fiches MR06, MR09, H16 non disponibles) ; `IconTile` 44 (Empty) rayon 12 et glyphe 20, `IconTile` 38 rayon 10 et glyphe 18 (aucune image ne dessine ces deux tailles).

**Vérification adverse (6 nov., détail dans le rapport)** : sept vérificateurs indépendants (briques, alignement § 4, « Aujourd'hui », substitution, `check:coquille` et réglages, transversal, visuel), puis trois réfutateurs par constat majeur. Aucun bloquant ; dix majeurs confirmés et **tous corrigés** sur la branche : catalogue `noms.ts` périmé sur Empty (alias `Empty` = `EtatVide` posé) ; formats « — » non tenus par `formaterMontant`, `formaterRatio`, `formaterDate`, `formaterHeure` ; pastilles de jour qui ne suivaient plus l'heure ; les 77 routes des bureaux (`CadreBureau`) hors du point de substitution ; clé `module` d'une substitution non vérifiée contre la route d'origine ; `check:substitutions` faux positif sur `node_modules` lié ; ambre translucide invisible pour `check:coquille` v3 ; ancres « guide » et « extensions » omises (prémisse fausse du compte rendu) ; segmenté sans état désactivé visible ; sous-texte de `ModuleTile` ouverte sous AA. Mineurs : 35 corrigés, 20 (notes ou décisions du CO) laissés et dits dans le rapport. Les 13 aperçus restent identiques au pixel après corrections, sauf `SOCLE-DEMO` (le libellé du sommaire « Alignement § 4 ») et `REGLAGES-LOT-00` (aides de Mouvement, texte relié au commutateur), tous deux sans image de référence. Une seconde passe adverse, sur les corrections elles-mêmes, a été **arrêtée sur instruction du CO avant son arbitrage** : rien n'en a été corrigé. Ses constats sont consignés dans le rapport avec le plus petit correctif, pour décision : deux confirmés par les réfutateurs (au survol, le segment actif d'un `Segmented` passe de T1 à T2, régression de la correction de l'état désactivé, une ligne de `controles.css` ; `Kpi` coupe une variation longue de l'Accueil vivant dans une colonne de deux tuiles), quatre non arbitrés (trois trous de gardes : une redéfinition de la tuile de `BlocEtat` écrite en sélecteur composé, une liste de sélecteurs sur deux lignes dans `check:socle`, un ambre écrit en `color-mix()` / `oklch()` pour `check:coquille` ; et l'alignement des rangées de `/dev/socle`), plus des mineurs et des notes.

Questions de S0 et réponses du CO (v2) :

1. *Allumer la nouvelle coquille par défaut ?* Oui, dans le socle v3, après le passage 2 de T1 (§1.9).
2. *Phrase « Connexion protégée… journal de la Garde » et constante « 12 organisations » (G06) ?* À valider par Harun. Par défaut, on garde le texte de la fiche, et la constante reste un texte fixe, jamais une donnée lue avant la connexion.
3. *Réglage d'organisation pour le métier (H47) ?* Pas au premier jet : le réglage reste personnel, la solution la plus simple.
4. *Émetteurs « mail » et « mobile » pour H40 ?* Hors LOT-00. Le mobile passe par LOT-09 (notifications web), le mail devient une demande à amn-api.

Questions v3 de S0 pour le CO (détail dans le rapport) : brancher Ajmani (G05) sur l'envoi réel de Relances (N3, 10 s pour annuler) ? créer un vrai verrouillage après inactivité menant à G06 (touche à l'authentification) ? compte mémorisé sur le poste (G06) ? D02 : lignes de 21 px (fiche) ou cibles de 34 px (§7.6) ? sources manquantes à créer (devis prérempli H07, créneaux du référent, contacts par client, note épinglée, automatisations et modèles des métiers L04, historique des ouvertures) ? H40 : émetteurs du niveau de bruit, du silence et du résumé du matin ; retenir les rendez-vous en « L'essentiel » (fiche) ou non (image) ?

Questions du socle complet (6 nov., détail dans le rapport) — **répondues par le CO au §1.13, appliquées le 12 nov. (point 2 ci-dessus)** :

1. Compteurs de la barre : deux déclarations sur une même adresse s'additionnent (livré). Faut-il plutôt que la déclaration du module l'emporte sur l'activité non vue ?
2. `FournisseurAujourdhui` est monté dans la branche « nouvelle coquille » de la coque. Le monter au-dessus des deux coquilles, pour que l'Accueil vivant partage l'objet même drapeau éteint ?
3. Empty : `EtatVide` suit maintenant le §4 (alias `Empty`) ; l'Accueil vivant (LOT-01) et les archétypes `Tableau` et `Scinde` en héritent (pointillé une marche plus claire, rayon 14 : à signaler à S1 pour sa capture N01). `BlocEtat` (H43) garde ses cotes mesurées sur l'image (48 / 15 / 240) et son neutre standard (gris T3 à 13 %, là où `IconTile` neutre est l'aplat `#1A1A1C`). Une seule brique à terme, ou une par contexte ?
4. `IconTile` : les images de D02 (10 %, bordure) et de H41 (14 %) diffèrent du 13 % du socle ; les écrans gardent leurs pixels par `part` / `bordure`. Variantes officielles, ou images à aligner par DS ?
5. Hubs F10 à F70 : déclarer la substitution de `/ensemble/:famille` (route paramétrée, un seul lot peut la déclarer) ou sept routes exactes ?
6. Session de support cliente : un substitut « identique » suit le drapeau `amn.coquille` du poste (choix fait, écrit dans la doc) ou s'affiche dès sa déclaration ? Et la clé `module` d'une substitution s'applique aussi dans l'édition interne, où la route d'origine n'a aucune garde `ModuleRoute` : voulu, ou garde en session de support seulement ?
7. `check:coquille`, second passage : mesurer aussi les bureaux (Supervisor, Cyber, Studio, Stratégie, La Garde) ? Le voyant de La Garde orange en « attention » dans la barre : seule exception admise à « aucun ambre dans la colonne » ? Le premier passage (T1) ne voit que l'ambre opaque : l'étendre au translucide ?
8. Rubrique Notifications : garder l'état de navigation `{ section }` ou passer à une route `/settings/notifications` quand H18 (LOT-07) arrivera ? Sans H18, les trois réglages de LOT-00 partagent le même cadre de carte (titre, état ou commutateur à droite) : acceptable ?
9. C-001 (T1) : `src/index.css`, atteint par le paquet client, porte 48 références au socle (sélecteurs inertes faute de DOM) : les sortir avant la fusion ?
10. Cibles sous 34 px dictées par le §4 lui-même : boutons de `PageHead` 31 px, `Toggle` 34 × 20, segments 29 à 30 px, cases 16 / 18 / 24, segmenté compact 26. Le §4 prime-t-il sur le §7.6 (≥ 34 px) ? Si c'est le §7.6, l'interrupteur gagne une zone de clic de 34 px sans changer de dessin et les boutons passent à 34. Même question pour le segment choisi, porté par le fond et l'encre seulement (§4) : un repère non chromatique ?
11. Briques : interdire aussi `vers` + `onClick` ensemble sur `ModuleTile` / `AddModuleTile` (aujourd'hui : lien qui prévient) ? Garder la règle « `Kpi` ≤ 92 px, variation sur une ligne en ellipse » ou imposer une variation courte par les fiches ? Étendre l'interdit des gris de décor aux `fill` / `stroke` posés en `.tsx` (au risque de refuser une illustration) ?
12. D02 : le « chiffre rouge » d'Alertes (fiche) n'a pas de source : ajouter un drapeau `critique` au registre des modules ? Avec le registre fictif, la 4ᵉ colonne déborde (fiche : 101 noms visibles) : rééquilibrer les données d'exemple ?
13. Deux captures PNG suivies à la racine du dépôt public (`v-discussion.png`, `v-scan-inline.png`, antérieures) : les déplacer ou les retirer ?
14. Fiches à fournir au socle pour lever le provisoire : F10, F30, F50, F70 (`LiveModuleTile`), MR06, MR09, H16, N01, H18.

Gardes en échec avant comme après le lot, sans lien avec lui : `check:encres` (`src/refonte/garde/equipes.ts`), `check:migration`, `check:xss`, `check:visite`, `check:support`. Aucune n'est dans la CI ; elles attendent un environnement.

#### Composants disponibles pour les autres lots (liste exacte des exports, mise à jour le 12 nov.)

Tout s'importe depuis `src/socle/ui` (`index.ts`) sauf mention, dans le code interne seulement, jamais depuis un fichier partagé. Les noms des fiches (anglais, §4) sont des alias réels (`src/socle/ui/noms.ts`), donnés entre parenthèses. Mots fr/en par `definirMots` (`src/socle/mots.ts`). Mode d'emploi : [`refonte-socle.md`](../refonte-socle.md).

| Groupe | Dossier | Exports |
|---|---|---|
| Base | `src/socle/ui/*.tsx` | `Bouton` (`Button`), `Carte` (`Card`), `Modale`, `Saisie` (`Field`), `TuileKpi` (`Kpi`), `TuileAjouter`, `BarreProgression` (`Progress`), `AnneauProgression` (`Ring`), `tonDeSante`, `Etiquette`, `PastilleEtat` (`StatusPill`), `Avatar`, `PileAvatars` (`AvatarStack`), `Raccourci` (`Kbd`), `initiales`, `teinteDe`, `CaseACocher` (`Check`, tailles 16 / 18 / 24), `LigneTache`, `LigneActivite`, `EtapeFranchie`, `EtatVide` (`Empty`, action obligatoire), `Squelette`, `Chargement`, `Mono` (+ `tailleMono`, `TAILLE_MONO_MIN/MAX`) |
| Briques partagées (v3, §1.10 point 1) | `briques-partagees/` | `IconTile` (22 à 48 ; `part` et `bordure` officielles), `CountBadge` (+ `PLAFOND_COMPTE` ; `critique` : chiffre rouge), `ModuleTile` et `AddModuleTile` (`vers` OU `onClick`, type `CibleTuile`), `ModuleGroupGrid` (`onAjouter` OU `versAjouter`, type `AjoutGroupe`) ; `PageHead` (= `EnTeteDePage`, dans `archetypes/`) ; zones de clic de 34 px sur l'interrupteur, les cases, les segments et les boutons de `PageHead` |
| Contrôles | `controles/` | `Interrupteur` (`Toggle`), `BoutonIcone` (`IconButton`), `Selecteur` (`Select`), `BoiteRecherche` (`SearchBox`, 34 ou 38 px), `Onglets` (`Tabs`), `PanneauOnglet`, `Segmente` (`Segmented`, normale ou compacte), `cleSuivante`, `SuggestionAjmani` (`Suggestion`), `IconeEtincelle`, `Tag`, `SousCarte` (`Subcard`), `DrapeauUrgent` (`FlagUrgent`), `PastilleFiltre`, cartes ludiques `CarteCases`, `CarteAnneau`, `CarteSerie`, `CarteJalon` |
| Vivant (v3, §0.4) | `vivant/` | `LiveDot`, `Caret`, `Severity` (+ `NIVEAUX_SEVERITE`), `FilterChips` (`Chips`), `Gauge`, `HeatCell` (+ `opaciteChaleur`, `OPACITE_CHALEUR`), `FlowLine` (+ `cheminFlux`), `InlineSuggestion` (`SuggestionCompact`), `TONS_VIVANT` |
| Situations | `situations/` | `BlocEtat` (+ `EtatVideInvitation`, `EtatHorsConnexion`, `EtatAccesRefuse`, `EtatAucunResultat`, `EtatErreurChargement`), `SqueletteLignes`, `EtatChargement`, `useChargementDiffere`, `DialogueConfirmation`, `DialogueConfirmationEnPlace`, `Toast`, `FournisseurToasts`, `useToastsSocle`, `AvisCollaboration`, `SANS_ACTION` |
| Graphiques | `graphiques/` | `Courbe`, `MiniCourbe` (`Sparkline`), `Barres`, `Donut` (+ `ECART_DONUT`), `Anneau` (26 à 80 px ; `tailleAnneau`, `epaisseurAnneau`, `coteAnneau`, `EPAISSEUR_ANNEAU`, `TAILLE_ANNEAU_MIN/MAX`), `calculerEchelle`, `repartirPourcents`, `arcsDonut`, `couleurTon`, formats `formaterNombre`, `formaterPourcent`, `formaterEuro` |
| Formats (hors `ui/`, importable de tout code interne) | `src/socle/formats.ts` | `formaterNombre`, `formaterPourcent`, `formaterRatio`, `formaterEuro`, `formaterMontant`, `formaterDate`, `formaterHeure`, `dateIso`, `ESPACE_INSECABLE`, `ESPACE_FINE`, `TIRET_ABSENT` |
| Archétypes (briques, pas des gabarits) | `archetypes/` | `Page`, `PageHead` (`EnTeteDePage`), `RangeeKpi`, `ColonneDroite`, `DispositionPage`, `Kanban`, `ColonneKanban`, `Ticket`, `GrilleCartes`, `CarteModule`, `Scinde`, `ListeScindee`, `ElementListe`, `DetailScinde`, `Semaine`, `LigneTemps` (`TimelineItem`), `ChronologieTemps`, `Tableau` + cellules (`CelluleNom`, `CelluleTexte`, `CelluleEtat`, `CelluleProgression`, `CelluleAvatar`, `CelluleMontant`, `CelluleTag`, `CelluleDate`, `CelluleCase`, `CelluleInterrupteur`, `CelluleIcone`, `CelluleBouton`), `TexteTronque` ; logique `trierLignes`, `filtrerLignes`, `regrouperLignes`, `prochainTri`, `ariaSort`, `deplacerElement`, `deplacerLineaire`, `deplacerDansGrille`, `nombreDeColonnes`, `debutDeSemaine`, `joursConsecutifs`, `memeJour`, `placerEvenements`, `positionMaintenant`, `PX_PAR_HEURE` |
| Mouvement (§0.2) | `src/socle/mouvement.css`, `src/socle/mouvement.ts`, `src/socle/couche-mouvement.ts` | attribut `data-mvt="entree\|cascade\|arrivee\|fondu\|remplit\|anneau\|arc\|pousse\|trace\|aire\|point-final\|onde\|flux\|balayage\|curseur"`, survols `data-mvt-survol="carte\|bouton\|ligne\|noeud"` ; classes des fiches `.amn-grow`, `.amn-slide`, `.amn-bar`, keyframes `amnFlow`, `amnHalo` ; `styleRang`, `rangMouvement`, `entreeCarte`, `arriveeLigne`, `decalageBarres`, `dureeFlux`, `niveauVivant`, `useMouvementVivant`, `entreeMotion`, `COTES_MOUVEMENT`, `COURBE_MOUVEMENT`, `CLASSES_MOUVEMENT` (+ type `ClasseMouvement`) ; réglage `useMouvement`, `lireMouvement`, `ecrireMouvement`, `choixMouvement`, `systemeDemandeMoins`, `configMotion`, `niveauParDefaut`, `NIVEAUX_MOUVEMENT`, `CLE_MOUVEMENT`, `EVENEMENT_MOUVEMENT` ; coupé par `prefers-reduced-motion` et Mouvement « aucun » |
| Jetons | `src/socle/noir.css`, `src/socle/theme.css` (jetons `--color-socle-*` / `fam-` / `etat-` et règles `data-famille`, par la couture `@edition/socle-theme.css`) | `--socle-*` (§1 ; couleurs d'état v4 de 06 §2), `--socle-police-mono` + `.sc-mono`, `--socle-decor-1/2/3` (illustrations seulement), `--socle-hachure-attention`, `--socle-hachure-grise`, `--socle-pointille-ok`, `--socle-pointille-attention`, `--socle-veille-noir` (G09 seulement) ; la teinte de sélection des fiches est `--socle-fam-creer` |
| Coquille | `src/socle/coquille/`, `src/refonte/coquille/` | `BarreLaterale` (`Sidebar`), `EnTete` (`Header`), `BarreAjmani` (`AjmaniBar`), `Coquille`, `PaletteAjmani` ; `usePageCoquille({ famille, sousPage, miettes, tousLesModules?, ajmani? })`, `ContextePageCoquille` (`page.ts`), `pagesSysteme.ts` ; drapeau `lireCoquille`, `ecrireCoquille`, `useCoquilleActive`, `CLE_COQUILLE` (`drapeau.ts`) ; `Coquille` prend `famille` (v4 : la famille de couleur active) ; `BarreLaterale` prend `developpement` (toujours là, section « ESPACES DE TRAVAIL ») ; type `SignalLateral` (signaux d'une ligne) ; `ID_DEVELOPPEMENT` (`donnees.ts`) ; `ORDRE_DEVELOPPEMENT`, `lignesDeveloppement` (`sousListeDeveloppement.ts`) ; la coquille pose aussi sa famille sur la racine du document (portails) |
| « Aujourd'hui » (§1.10 point 3) | `src/refonte/coquille/aujourdhui/` | `useAujourdhui` (lit le contexte, sinon calcule ; expose aussi `acces` : tâches, priorités, rendez-vous, factures, clients lus une fois, type `AccesAujourdhui`), `useCalculAujourdhui`, `calculerAujourdhui` (pure), `FournisseurAujourdhui` (aussi par `@edition/coquille`), `ContexteAujourdhui`, `useCarteAujourdhui`, `delaiAvant`, `heureDe` |
| Compteurs de la barre | `src/refonte/coquille/declarerCompteurs.ts`, `compteurs.ts`, `src/refonte/compteurs/<famille>.ts` | `declarerCompteurs({ famille, useCompteurs, useRepli?, useSignaux? })` (rien ne s'additionne : la déclaration du module l'emporte, `useRepli` ne remplit que les adresses libres ; `useSignaux` : Développement seulement, type `SignauxDeveloppement`), `verifierDeclaration` ; `ramasserCompteurs`, `fusionnerCompteurs`, `useCompteursDe`, `useCompteursDeclares`, `fusionnerSignaux`, `useSignauxDe`, `useSignauxDeclares`, `COMPTEURS_DECLARES` ; déclarations livrées : `jour.ts`, `cyber.ts` (`developpement.ts` : à LOT-11) |
| Substitution d'écrans (§1.3) | `src/refonte/substitutions/`, `@edition/substitutions` | `declarerSubstitutions(lot, [...])` (`declarer.ts`), `trouverSubstitution`, `assemblerSubstitutions`, `REGISTRE_SUBSTITUTIONS` (`registre.ts`), `SubstitutionDEcran`, `SubstitutionDEcranDe` ; hubs F10 à F70 : `HUBS`, `ROUTE_GENERIQUE_HUBS`, `fauteDeHub` (`hubs.ts` : sept routes exactes, une par lot) ; un fichier `declarations/<lot>.tsx` par lot ; quatre points de substitution dans la coque interne (`AppLayout` × 2, `ClientContextLayout`, `CadreBureau`) ; huit hubs (`HUBS`, F10 à F70 et DEV-ensemble `/ensemble/developpement`) |
| Réglages (porte interne des Paramètres) | `src/edition/socle.internal.tsx` | `MouvementSection` (les trois surfaces), `ANCRES_REGLAGES`, `ancreDeReglages`, `RacineSocle` (racine de l'édition interne, antérieure) ; un écran envoie par `navigate('/settings', { state: { section } })` |
| Bus de moments, familles, mots | `src/socle/moments.ts`, `familles.ts`, `mots.ts` | `subscribe`, `emit` (`emettreMoment` par `@edition/socle`), `poserJournal`, `reinitialiserMoments`, `CATALOGUE_DES_MOMENTS`, `TYPES_DE_MOMENTS` ; `FAMILLES`, `estFamille`, **`FAMILLES_COULEUR`** (les onze familles v4, type `FamilleCouleur`), `estFamilleCouleur`, `familleDeCouleur` ; `definirMots` ; guide de voix `src/socle/mots/voix.ts` : `TOURNURES`, `ecartsDeVoix(texte, zone)`, `VOUS_PLURIELS`, `ENCOURAGEMENTS`, `encouragement(n)` |
| Couleurs de famille v4 (06 §1) | `src/socle/noir.css` | `--socle-fam-<famille>-a` / `-b` (onze familles : les sept, `garde`, `cyber`, `developpement`, `systeme`) ; un écran lit **`var(--fam-a)`** et **`var(--fam-b)`**, posés par la coquille selon la famille active (`data-famille-active`) ou par un bloc `data-famille` ; Système par défaut ; `--socle-halos` (les trois halos de la paire de l'élément, à poser sous `--socle-fond-page`) ; `sc-halos-ecran` (le voile des pages pleines, `--socle-halos-ecran`) ; les quinze règles de rendu (06 §3) sont portées par les briques : aucun lot n'écrit une couleur |
| Système | `src/refonte/systeme/` | notifications, recherche, Ajmani, modules, connexion, démarrage, veille (G09), H43, démonstration (`/dev/socle`, dix-huit sections dont « Briques partagées » et « Alignement § 4 ») |
| Aperçus de capture | `scripts/apercu/` | `npm run apercu -- <ID>` ; `ApercuBureau` (`scripts/apercu/coquille.tsx`) pour un écran dans la coquille ; `SOCLE-DEMO`, `REGLAGES-LOT-00`, `COQUILLE-*` |
| Contrôle de la coquille | `scripts/check-coquille.mjs` | mode bundle (T1, deux passages : coquille éteinte puis allumée, `AMN_COQUILLE=eteinte\|allumee`), mode `--page <index.html>` (page statique, réseau refusé) |

Gardes : `check:socle`, `check:tutoiement`, `check:voix`, `check:socle-controles|graphiques|situations|archetypes|coquille|vivant|briques`, `check:systeme-modules|notifications|recherche|ajmani|demo|demarrage|connexion|veille`, `check:substitutions`, `check:client-statique`, `check:donnees` ; toutes en CI (`editions.yml`). `check:coquille` (navigateur) n'y est pas.

### LOT-01 · Ma journée — `claude/refonte-journee` — 16 écrans

**À ne pas simplifier** (§1.10) : le défi d'équipe L07, les trophées et paliers (H02, H04, L01) et les défis hebdomadaires. Aucun chiffre individuel, aucun classement, aucun reproche.

| ID | Écran | Type | État | Écart / note |
|---|---|---|---|---|
| N01 | Ma journée · Accueil | mixte | en cours (préparation) | préparation (S2) : lit `useAujourdhui` ; série = `serieDeLaJournee` (§1.36 n° 1) |
| H25 | Ma journée · Tableau de bord, widgets | mixte | en cours (préparation) | préparation : `tableauDeBord` = attendus de SIM ; grille à lire sur la fiche |
| G08 | Ma journée · Cockpit client : Stripe, utilisateurs, tickets | mixte | en cours (préparation) | préparation : `cockpitDuClient` = attendus de SIM ; agrégats seulement, aucune clé ; route à lire sur la fiche |
| H01 | Ma journée · Calendrier | mixte | à faire | |
| H02 | Ma journée · Tâches | mixte | en cours (préparation) | préparation : paliers et série ; **trophées protégés** |
| H03 | Ma journée · Missions et tickets, kanban | mixte | en cours (préparation) | préparation : `trierLaColonne`, `deplacer` ; aucun écran d'origine |
| H04 | Ma journée · Bilan de la semaine | mixte | en cours (préparation) | préparation : `bilanDeLaSemaine` = attendus de SIM ; **trophées et paliers protégés** |
| MJ01 | Ma journée · Projets | mixte | en cours (préparation) | préparation : `projetCalcule` = SIM |
| MJ03 | Ma journée · Planning de l'équipe | mixte | en cours (préparation) | préparation : `chevauchements`, `personnesDuCreneau` |
| MJ02 | Ma journée · Habitudes | mixte | en cours (préparation) | préparation : `serieDHabitude`, `tauxDeTenue` (propositions) |
| MJ04 | Ma journée · Notes rapides | mixte | à faire | |
| MJ05 | Ma journée · Rappels | mixte | en cours (préparation) | préparation : `etatDuRappel` ; aucun écran d'origine |
| L03 | Ma journée · Rituel du matin | nouveau | à faire | |
| L02 | Ma journée · Mode Focus | nouveau | à faire | |
| L01 | Ma journée · Séries et jalons | nouveau | en cours (préparation) | préparation : `serieDeLaJournee`, paliers 5/10/20/30/50/100 ; **protégé** ; priorités absentes des jeux |
| L07 | Ma journée · Défis d'équipe | nouveau | en cours (préparation) | préparation : défis, jauge, frise, célébrations, engagements, proposition ; **protégé** ; engagements sans donnée |

### LOT-02 · Mes contacts et clients — `claude/refonte-contacts` — 13 écrans

| ID | Écran | Type | État | Écart / note |
|---|---|---|---|---|
| F10 | Contacts · Vue d'ensemble | nouveau | fait | `src/refonte/contacts/hub/` ; substitue `/ensemble/contacts`. Fidélité mesurée sur l'aperçu (jeu de SIM, 30 oct. 10:42) : **11,2 % en disposition** (couleur ± 10), 25,2 % brut ; l'écart est la donnée (noms et chiffres du jeu, pas ceux de l'image). Écarts : « Segments » et « Carte des clients » absents (aucun module au registre) ; 13 tuiles au lieu de 14 (SAV ajouté) ; « Réponse médiane » omise (pas d'historique des réponses) ; « Ils attendent une réponse » dit « messagerie non branchée » dans l'application (G07 n'a pas de conversations clients) |
| H05 | Contacts · Clients | mixte | fait | `src/refonte/contacts/clients/` ; substitue `/clients` (mosaïque 4 × 3, segments, recherche, responsables, tris, liste, bandeau de santé, pagination). Fidélité sur l'aperçu (jeu de SIM, 30 oct. 10:42) : **11,5 % en disposition** (couleur ± 10), 23,6 % brut ; l'écart est la donnée. Un clic ouvre la fiche G04 (`/clients?fiche=<id>`) ; la création, la modification, les notes, l'historique et les sites liés restent servis par `ClientsScreen` (`useOutlet`) : « Nouveau client » et « Modifier la fiche » lui passent la main. Écarts : « Importer » n'est montré que si un import existe (il n'y en a pas dans l'application) ; « Nouveau client » (et la touche N) passe la main à l'écran d'origine, qui n'ouvre pas sa création depuis `state.nouveau` (1 ligne dans `src/screens`, hors de ma zone : à décider par le CO) ; filtre « Responsable » masqué quand aucune fiche n'en porte (champ absent de l'application) |
| G04 | Contacts · Fiche client | mixte | fait | `src/refonte/contacts/fiche/` ; vue de `/clients?fiche=<id>` (colonne d'identité 300 × 664, frise « La relation », « Ce qui est ouvert », « L'argent » avec bande de ponctualité, bande « Documents »). Fidélité sur l'aperçu (jeu de SIM, 30 oct. 10:42) : **8,5 % en disposition** (couleur ± 10), 18,5 % brut. Écarts : frise à **deux couloirs** (Échanges, Devis et factures) : pas de tickets datés ni d'historique de surveillance par client dans l'application ; « Sous la Garde » = nombre de sites reliés (`linkedSiteIds`), sans alerte ; « Documents » dit « non disponible » (pas de documents rattachés aux clients) ; « Interlocuteurs » dit « non disponible » tant que Harun n'a pas décidé la collection (§1.28) ; pas de pastille « Décide » ; « Nouveau devis » et « Nouvelle facture » mènent aux modules d'origine sans préremplir le client (les écrans d'origine n'acceptent pas ce paramètre : à décider par le CO) ; « Relancer » et « Envoyer » ouvrent la facture dans son module, l'envoi reste un geste fait là-bas ; un bouton « Modifier la fiche » (crayon) donne accès à l'écran d'origine pour tout ce qui n'est pas refondu |
| H06 | Contacts · Prospects | mixte | fait | `src/refonte/contacts/prospects/` ; substitue `/pipeline` (nuage intérêt × montant 772 × 664 avec quadrants, traînée, « Prospect survolé », « Appels de la semaine », liste par intérêt). Fidélité sur l'aperçu (jeu de SIM, 30 oct. 10:42) : **5,8 % en disposition** (couleur ± 10), 12,7 % brut ; l'écart est la donnée (montants du jeu < 3 000 €, quadrant vide). Écarts : **les signaux d'intérêt (lectures du devis, réponses) ne sont pas des collections de l'application** : dans l'application l'intérêt est ESTIMÉ (étape et ancienneté, `signauxEstimes`), le pied du nuage le dit et la fiche du prospect dit que les signaux ne sont pas branchés ; l'aperçu fabrique des signaux (script d'aperçu seulement) ; « Colonnes » et la création passent par l'écran d'origine (`useOutlet`, sous une barre qui permet de revenir) ; « Appels de la semaine » : les cases se gardent sur le poste, par semaine (clé `amn.refonte.contacts.appels`), faute d'un stockage décidé (à trancher) ; « Appeler » ouvre Ajmani (le prospect n'a pas de téléphone dans l'application) ; « Les miens » n'apparaît que si des prospects ont un responsable ; « mis à jour il y a N min » omis |
| H44 | Contacts · Retours clients | mixte | fait | `src/refonte/contacts/retours/` ; substitue `/avis` (demi-jauge de recommandation, répartition, mini-courbe, « Ce qui revient », mur de citations en trois colonnes, carte « À répondre »). Fidélité sur l'aperçu (jeu de SIM, 30 oct. 10:42, plus UN avis de 3 étoiles ajouté dans le script d'aperçu pour dessiner la carte) : **12,8 % en disposition** (couleur ± 10), 26,2 % brut. Écarts : **aucune réponse à un avis n'est enregistrée** dans l'application : « À répondre » = note ≤ 3 des 30 derniers jours, sans réponse préparée ni « Envoyer » ; « Répondre avec Ajmani » ouvre l'assistant, rien ne part tout seul ; la carte dit seulement que la facture du client est en retard, elle n'affirme aucune pause des relances (le moteur de relance ne la porte pas encore, à trancher avec S9) ; « Collecter des avis » dit « non disponible » (demandes et règles d'envoi non suivies) ; « Ce qui revient » dit « non disponible » quand aucun avis ne porte de thème (le cas dans l'application) ; puce « Avec une idée » omise (détection à confirmer) ; pas de note de recommandation dans l'application : la répartition se fait sur les étoiles (5 / 4 / ≤ 3) ; « Demander un avis » passe par l'écran d'origine ; « Exporter » écrit un CSV (cellules neutralisées pour un tableur) ; « Voir plus d'avis » au-delà de sept cartes |
| H45 | Contacts · Fournisseurs | mixte | fait | `src/refonte/contacts/fournisseurs/` ; substitue `/fournisseurs` (matrice « Comparer pour un besoin » 1108 × 482, scores en anneau, colonne recommandée, coches de meilleure valeur, « Commandes en cours », suggestion de renégociation). Fidélité sur l'aperçu (jeu de SIM, 30 oct. 10:42) : **7,6 % en disposition** (couleur ± 10), 14,1 % brut. Écarts : **l'application n'a pas d'historique d'achats** (`achats: null`) : la matrice dit « non disponible » et « Tous les fournisseurs » (écran d'origine, par `useOutlet`) reste le chemin vers la liste ; tout se calcule sur les achats passés (dernier prix payé, délai annoncé, qualité 70 % délai + 30 % conformité sur 12 mois) ; **garantie et contrat n'existent nulle part** : critère affiché « à demander », hors du score, poids ramenés à 100 ; **les besoins** (article, quantité) ne sont pas une collection : ils sont proposés d'après les achats (articles pris chez au moins deux fournisseurs) ou saisis dans « Nouveau besoin », sans rien enregistrer ; réglage des poids = deux préréglages de la fiche (dépannage, planifié), pas de curseur par critère ; « Commander ici » passe par l'écran d'origine (pas de commande d'achat), « Demander un devis » et « Préparer la demande » ouvrent Ajmani ; commandes en cours : une piste à étape « commandée » seulement (l'application ne connaît ni préparée ni expédiée) ; renégociation : plus forte dépense 12 mois sans négociation enregistrée depuis un an (pas de fin de contrat dans les données) ; « Plus tard » masque 14 jours sur le poste |
| MC01 | Contacts · Pipeline commercial | nouveau | fait | `src/refonte/contacts/pipeline/` ; écran neuf `/pipeline-commercial`, déclaré au registre (`modules/declarations/contacts.ts`, `nouveau`) : entonnoir 1108 × 434 (bande, pastilles de rayon 9 + 0,34 × √montant, taux de passage, sortie « Signé ce mois » et objectif), prévision pondérée, suggestion, signatures par mois. Les pastilles se glissent (pointeur) ou se déplacent aux flèches ← → ; le déplacement s'écrit comme l'écran d'origine (`stage` et `movedAt`), annulable 6 s. Fidélité sur l'aperçu (jeu de SIM, 30 oct. 10:42) : **11,5 % en disposition** (couleur ± 10), 19,0 % brut. Écarts : **l'application ne garde pas l'historique des mouvements** : taux de passage « — » dans l'application (l'aperçu en fabrique un, script d'aperçu seulement) ; âge dans l'étape depuis `movedAt` (sinon depuis la création, dit comme tel) ; **objectif du mois** : pas de réglage décidé, gardé sur le poste (`amn.refonte.contacts.objectifMois`) avec « Définir » (à trancher) ; « qualifié » de l'application devient l'étape « Rendez-vous » (la correspondance des étapes est dans `depuisApp.ts`, `ETAPE_DE` / `STAGE_DE`) ; au plus 4 / 3 / 2 pastilles par étape, les autres regroupées en « + N » (la fiche dit douze : le tracé de 245 px par étape ne porte pas plus sans toucher les libellés) ; pas de panneau latéral de 360 px, pas de montant demandé au dépôt dans Signé ; « Nouvelle opportunité » mène à l'écran d'origine des prospects (vue « Colonnes ») ; « Importer » absent (pas d'import) ; « Plus tard » masque la relance 7 jours. Contrôle de navigation : `check-navigation.ts` chargeait mal un écran neuf (feuille de style) et comptait 101 entrées sans les écrans neufs : corrigé (feuilles ignorées, écrans neufs comptés à part) ; l'anglais du module est dans `navLexique.internal.ts` |
| MC02 | Contacts · Fidélité | mixte | fait | `src/refonte/contacts/fidelite/` ; écran neuf `/fidelite/niveaux`, vue « Niveaux de fidélité » de l'entrée « Fidélité et parrainage » (registre, `nouveau`) : l'échelle des paliers 768 × 664 (barreaux, clients posés selon leurs points, flèches « plus que N points », carrés « revenus ce mois »), « À offrir cette semaine », « Le programme ce mois », suggestion. Fidélité sur l'aperçu (jeu de SIM, 30 oct. 10:42) : **8,4 % en disposition** (couleur ± 10), 17,8 % brut. **Deux formules, un choix par organisation (§1.28)** : la carte à tampons reste l'écran d'origine `/fidelite` ; la tuile « Fidélité » de F10 mène à `/fidelite/niveaux` pour une organisation sans carte à tampons, à `/fidelite` pour celle qui en a déjà (`formuleDe`). Il n'y a pas encore de réglage pour choisir l'autre formule : à trancher (stockage par organisation). Écarts : l'**avantage d'un palier** (catalogue) n'existe pas dans les données : « Avantage à définir » ; « Règles du programme » mène à `/fidelite` (aucun écran de réglage des points par euro, avis, recommandation : les valeurs de la fiche, 1 / 50 / 200, sont les constantes de `fidelite.ts`) ; « Offrir un avantage » et « Préparer » ouvrent Ajmani, rien ne part ; « À offrir cette semaine » se calcule (passage de palier, anniversaire de relation sous 7 jours, seuil de 500 points) avec des récompenses génériques, sans montant ni bon (aucun catalogue d'avantages) ; les gestes cochés se gardent sur le poste, par semaine (`amn.refonte.contacts.gestesFidelite`) ; « Le programme ce mois » se recalcule depuis les factures payées, les avis et les recommandations du mois (pas d'historique de points) ; l'Or s'affiche jusqu'à 2 500 points : au-delà tous les clients sont au bout du barreau et s'écartent de 140 px ; pas de panneau latéral de l'historique d'un client (le clic ouvre la fiche G04) |
| MC03 | Contacts · Fiches contacts | nouveau | fait | `src/refonte/contacts/personnes/` ; écran neuf `/contacts/fiches`, déclaré au registre (`nouveau`) : liste compacte de 272 × 664 (groupes par récence, lignes de 50 px), grand profil de 816 × 664 (en-tête, 4 faits, frise « La relation » de 768 × 128 sur deux rangées sans chevauchement, derniers échanges, préférences, bandeau de préparation). Fidélité sur l'aperçu (jeu de SIM, 30 oct. 10:42) : **7,9 % en disposition** (couleur ± 10), 15,9 % brut. **Dans l'application l'écran dit « non disponible »** (`interlocuteurs: null`, décision de Harun en attente, §1.28) avec la raison et un renvoi vers les clients : il n'invente aucune personne ; dès que la collection existe, la liste et le profil se construisent depuis elle. Écarts : les chiffres d'un profil sont ceux de l'ORGANISATION cliente de la personne (l'application ne relie pas les échanges à une personne) ; « Derniers échanges » ne montre que des dates (ni canal ni résumé : pas d'historique unifié G07 / MX01 / H13) ; « Préférences » = le canal préféré et les notes (pas de créneau ni de jours à éviter) ; événements de la frise = premier contact, devis signés, dernier échange (pas de contrats ni de livrables) ; pas de filtre avancé (bouton de 34 px), pas de « … » (Fusionner, Exporter, Supprimer) ; « ajoutés cette semaine » omis (pas de date de création) ; « Nouveau contact » et « Importer » mènent aux clients / sont absents tant qu'il n'y a pas de collection |
| MC04 | Contacts · Équipe | mixte | fait | `src/refonte/contacts/equipe/` ; substitue `/trombinoscope` (trois cartes de personne de 360 × 472 : maintenant, compétences, charge de la semaine en histogramme avec capacité 7 h, pied « libre à partir de » ; bande basse de 178 : défi, accès externes, suggestion « alléger »). Fidélité sur l'aperçu (jeu de SIM, 30 oct. 10:42) : **13,5 % en disposition** (couleur ± 10), 26,6 % brut. Écarts : la **charge** = heures des rendez-vous où la personne figure + **1 h par tâche échue** (hypothèse : les tâches n'ont pas de durée) ; l'application ne donne ni les tâches ni les participants : la charge y dit « inconnue : relie le calendrier ou les tâches » (`charge: null`), jamais des zéros, et la suggestion « alléger » retombe sur la carte « astuce » ; **compétences** = `specialites`, sans niveau sur 3 (pas de niveau déclaré dans les données) ; **« Défi d'équipe »** dit « non disponible » (il compte des tickets clients clos qui ne sont pas enregistrés) ; « Accès externes » = les membres invités, sans statut d'invitation ; pas de statut « Concentré » dans les données (la lune n'apparaît que pour une personne absente) ; cartes jamais triées par charge ; « Organigramme » passe la main à l'écran d'origine, « Inviter » et « Membres et accès » mènent à H19 (`/membres`), « Confier » et « Proposer » ouvrent Ajmani (rien n'est attribué sans l'accord de la personne) ; sources : `taches` ajouté (`null` dans l'application) et rôle, fonction, spécialités, heures, congés optionnels sur les membres |
| MC05 | Contacts · Partenaires | nouveau | fait | `src/refonte/contacts/partenaires/` ; écran neuf `/partenaires`, déclaré au registre (`nouveau`) : carte du réseau 768 × 664 (AMN au centre bas, trois orbites en demi-ellipses selon la fréquence des échanges sur 90 jours, liens d'épaisseur 1 + force × 5 px, pointillés sous 20, nœuds à bord orange en pause et rouge à renouveler), partenaire sélectionné, « Recommandations », suggestion « Renouveler X ». Fidélité sur l'aperçu (jeu de SIM, 30 oct. 10:42) : **8,0 % en disposition** (couleur ± 10), 16,9 % brut. **Dans l'application l'écran dit « non disponible »** (`partenaires: null`) avec la raison et un renvoi vers les fournisseurs. Écarts : la force se calcule sur la régularité seule (la fiche mêle régularité, récence et recommandations : ni la date du dernier échange ni les recommandations ne sont dans les données ; `composantes` le dit) ; « Dernier échange » et « Accès donné » disent « pas encore enregistré » ; la carte « Recommandations » dit « non disponible » (aucune pastille de recommandation ni flux animé sur les liens) ; pas de chip « Recommandations » (rien à filtrer) ; placement : angles répartis par orbite, libellé au-dessus ou en dessous, vérifié sans chevauchement sur l'exemple de la fiche ; sur les jeux denses de SIM un libellé peut en toucher un autre (l'info-bulle du disque porte le nom) ; pas de disque « + N » au-delà de 12 partenaires ; « Ajouter » mène aux fournisseurs, « Inviter » et « Voir les accès » à H19 (`/membres`), « Comparer » ouvre Ajmani (rien n'est résilié), « Plus tard » masque 7 jours |
| MC06 | Contacts · Rendez-vous clients | nouveau | fait | `src/refonte/contacts/rdv/` ; écran neuf `/rendez-vous-clients`, déclaré au registre (`nouveau`) : surface « journée » de 1108 × 383 (flèches, puces de jour avec un point par rendez-vous, ruban de 1 036 px de 08:00 à 19:00 à 94,2 px par heure, cartes décalées sans chevauchement, ligne « maintenant » sous les cartes, pause déjeuner), bande basse de 267. Fidélité sur l'aperçu (jeu de SIM, 30 oct. 10:42, avec des durées de trajet fabriquées dans le script d'aperçu seulement) : **7,7 % en disposition** (couleur ± 10), 24,5 % brut. Écarts : **pas de service d'itinéraire** (LOT-12) : sans durées, pas de bande de route, et « Le trajet du jour » dit « non disponible » (aucun schéma de distances inventé) ; la bande de route se dessine dès que `durees` est fournie (blocs, trop juste en orange avec le départ conseillé, lieu à préciser en pointillé) ; **« Ton lien de réservation » dit « non disponible »** (ni créneaux ouverts ni pris, ni adresse publique, MR02 à confirmer) ; le bandeau d'Ajmani « ouvrir 2 créneaux » exige ces demandes de créneau : il est remplacé par l'astuce (« ouvre l'agenda ») ; **pas de glisser-déposer d'un rendez-vous** (déplacer se fait dans l'agenda, `/agenda`) ; « Nouveau rendez-vous », « Lien de réservation » et un clic sur une carte mènent à l'agenda ; les rendez-vous de l'application sont tous des rendez-vous clients (leur type n'est pas distingué) ; durée de carte, jour et heures viennent du calendrier réel, jamais en dur |
| MC07 | Contacts · Relances | mixte | fait | `src/refonte/contacts/pile/` ; substitue `/relances` : file du jour 260 × 664 (segments « n sur N traitée », lignes faite / en cours / à venir, « Réponses du jour », série « Boîte à zéro » lun.–ven., deux compteurs), pile focalisée 522 × 626 avec deux bandes « ensuite : … » derrière, ton (courtois / chaleureux / très bref), message modifiable dans la carte, actions et raccourcis (⏎, R, →), « Annuler » 10 s, colonne droite 290 (cadence de l'objet, réglages d'envoi, suggestion « Un appel plutôt qu'un message »). Fidélité sur l'aperçu (jeu de SIM, 30 oct. 10:42, avec une sélection de relances et des réponses fabriquées dans le script d'aperçu seulement) : **9,1 % en disposition** (couleur ± 10), 16,7 % brut. **La règle d'espacement (huit points de la fiche, `relances.ts`) est demandée avant l'affichage de chaque relance et avant chaque envoi** : une relance qui attend n'entre pas dans la file, « Envoyer » est désactivé tant que la règle l'interdit (la phrase dit pourquoi et quand), rien ne part sans le clic. Écarts : **l'application n'envoie rien depuis cette couche** : dans l'application le bouton dit « Copier et suivante » (il copie l'objet et le texte, note le geste, passe à la suivante ; « Tout envoyer » n'est pas affiché) ; l'envoi par courriel d'une relance de facture reste dans l'écran d'origine (« Modèles de messages » y mène, `useOutlet`) ; le **texte** est préparé d'après les données (ton = entrée et fin), pas rédigé par Ajmani (aucun service de rédaction) : le pied dit « Préparé d'après tes données, relis-le » ; **pas de pièce jointe en lien protégé** (MX03) ni de « Ouvert N fois » (aucun suivi d'ouverture) ; **les réponses des clients ne sont pas enregistrées** : « Réponses du jour » et « Réponses reçues » disent « non disponible » (aucun taux inventé) ; « Envoyées ce mois » compte les relances dont la dernière date est de ce mois ; la **pause d'un avis sans réponse (H44)** n'est pas appliquée (les avis n'ont pas d'état « répondu ») ; « Passer » laisse la relance dans la file sans la compter comme traitée (la fiche la compte) pour que « Boîte à zéro » reste vrai ; hors de la plage d'envoi, la carte s'affiche mais « Envoyer » est désactivé ; le **téléphone** et « Planifier l'appel » ouvrent l'agenda (rien n'est planifié ni suspendu) ; « Modifier » mène aux réglages (`/settings`) : les réglages d'envoi (5 jours, 9:00–18:00) n'ont pas encore d'écran ; la frise suit `cadence()` : J+5 pour une 1re relance de devis (la fiche dit J+6 et 5 jours d'écart, 5 nov. au lieu de 4) ; le sous-titre compte les relances restantes (« 4 relances prêtes ») là où l'image garde 5 ; **ce que le poste retient** (gestes, jours « boîte à zéro », liste du matin, « Non » de la suggestion) est écrit dans `localStorage` (`amn.refonte.contacts.relances`, `…relanceAppelMasque`) : provisoire, à trancher (stockage par organisation). Mots : `pile/i18n.ts` (tutoiement) ; messages client `client.*` (vouvoiement) dans `contacts/i18n.ts`. **Zones de clic de 34 px (§1.39)** pour les 13 écrans : `src/refonte/contacts/cibles.css` (pseudo-élément transparent sur les boutons du socle et les petits boutons, cercle ou carré transparent sur les points SVG, champ de recherche à 34 px), mesurées par sonde sur les aperçus : plus aucune cible sous 34 px ; sur un nuage dense (F10, H06) deux zones voisines se recouvrent, la dernière dessinée reçoit le clic. |

Préparation par S1 (14 nov., `claude/refonte-contacts`) : note [`preparation/LOT-02-contacts.md`](preparation/LOT-02-contacts.md), logique dans `src/refonte/contacts/`, garde `check:contacts` (93 contrôles). Aucun écran visuel. **Dossier v4 lu le 14 nov.** (deuxième passe) : les règles « à confirmer » sont levées ou transformées en questions (note §7).

**Manque au socle**
- `ModuleTile`, `ModuleGroupGrid`, `AddModuleTile` (décidés au §1.10, absents de la liste des composants disponibles) pour F10.
- `PageHead`, `IconTile`, `FlagUrgent` : cités au §1.10, à confirmer par S0 (`Page`, `Etiquette` et `PastilleEtat` existent).
- Un `Kanban` existe ; son glisser-déposer doit appliquer `transitionsPermises` (MC01).
- `check:tutoiement` : pas encore dans la base.
- Rien d'autre : les fiches du lot n'appellent pas de composant absent de la liste du §1.10.

**Manque aux données**
- Un jeu d'organisations partenaires (MC05) : **commandé à SIM** (§1.28). Seuls des interlocuteurs de type `partenaire` existent.
- Sentiment et NPS (H44) : pas de jeu propre, à dériver des `avis`.
- Une raison de perte sur les prospects perdus (H06).
- Les avantages de fidélité « offerts / utilisés » côté app : le jeu de SIM les porte, aucune collection ne les garde.
- **Pipeline** : historique des mouvements d'étape (date d'entrée), montant estimé, signaux d'intérêt (lectures du devis, délai de réponse) pour H06 et MC01.
- **Relances** : état « reportée » ; ton du message ; préférences d'envoi des contacts (MC03).
- Une collection d'interlocuteurs côté app (MC03, G04, source de H41) : décision de Harun en attente (§1.28).

### LOT-03 · Écrire et retenir — `claude/refonte-ecrire` — 9 écrans

| ID | Écran | Type | État | Écart / note |
|---|---|---|---|---|
| F20 | Écrire · Vue d'ensemble | nouveau | fait (v4, mesure à confirmer par T1) | composants `src/refonte/ecrire/ecrans/f20/` (`VueHub`, `composerHub` : la logique du lot assemblée, `PageHub` : branchée sur le poste) ; substitution de `/ensemble/ecrire` ; aperçu `npm run apercu -- F20`. Capture 1440 × 900 : 16,0 % brut en tout, dont la barre latérale et l'en-tête de l'aperçu (données de la coquille fictive) ; géométrie tenue (index 272 × 658, pile 478 × 658, relecture 330 × 310, série 330 × 334). **Écarts gardés** : le poste n'a ni présence en direct (jamais de curseur ni de « … écrit »), ni file de relecture, ni souvenir de journal, ni rangement des notes rapides (aucune source, STATUT §1.27 n° 4) : ces zones sont absentes ou vides, comme la fiche le prévoit (rubrique 8) ; les tuiles Archives (ME04) et Dictée vocale n'ont pas d'écran et ne se montrent pas ; les pages sont les notes de l'équipe ; la ligne de relecture ne dit pas « relue par … » (donnée absente) ; « le tien d'abord » au lieu de « le vôtre d'abord » (tutoiement, décision du CO)
| H10 | Écrire · Notes et pages | mixte | fait (v4, mesure à confirmer par T1) | composants `src/refonte/ecrire/ecrans/h10/` (`VueNotes`, `composerNotes`, `PageNotes`) ; substitution de `/notes` ; aperçu `npm run apercu -- H10`. Capture 1440 × 900 : 27,3 % brut en tout (arbre 204, page 604, colonne de droite 272 tenus ; le reste : texte de l'aperçu, données fictives, barre latérale de l'aperçu). **Écarts gardés** : les pages sont les notes de l'équipe (titre et texte, enregistrés une seconde après la dernière frappe) ; **ni blocs, ni menu « / », ni tâches assignées, ni commentaires, ni suggestions d'Ajmani, ni liens retour, ni présence** (aucune source : STATUT §1.27 n° 4, §1.29 n° 3) ; pas de dossiers de clients ; « Partager » et « Historique » inactifs (rien à partager ni à rejouer côté poste)
| H11 | Écrire · Documents | mixte | fait (v4, mesure à confirmer par T1) | composants `src/refonte/ecrire/ecrans/h11/` (`VueDocuments`, `composerDocuments`, `PageDocuments`) ; substitution de `/classeur` ; aperçu `npm run apercu -- H11`. Capture 1440 × 900 : 23,3 % brut en tout (liste 372, document ouvert, frise des versions tenus ; le reste : textes, données fictives, barre latérale de l'aperçu). **Écarts gardés** : le classeur du poste garde des documents à versions (`documentVersions`) : un seul intercalaire « Documents », la liste par année, les versions déposées et la signature ; **pas d'intercalaires par type, pas de « Ce qu'il faut savoir » relevé par Ajmani, pas de quota d'espace, pas de partage ni de lien, pas de comparaison v2 / v3 ni de restauration** (aucune source : STATUT §1.27 n° 4) ; l'aperçu de la feuille montre les articles de la dernière version
| H12 | Écrire · Signatures | mixte | fait (v4, mesure à confirmer par T1) | composants `src/refonte/ecrire/ecrans/h12/` (`VueSignatures`, `composerSignatures`, `PageSignatures`) ; substitution de `/signature-a-distance` ; **attention** : l'entrée « Signatures » du registre (`esign` puis `remoteSign`) s'ouvre toujours sur la signature sur place (`/signature`) : H12 est sa seconde vue ; la permuter changerait l'identifiant de l'entrée (`remoteSign`), cité par les métiers de Démarrage (H42/H47, `esign`) : décision du CO ; aperçu `npm run apercu -- H12`. Capture 1440 × 900 : 34,8 % brut en tout (rangée de tickets, circuit, relance et preuve tenus ; le document à signer de l'image est dessiné, l'aperçu en met le texte). **Écarts gardés** : le poste garde des circuits de signature (`signatureCircuits` : document, client, signataires dans l'ordre, relances) ; **pas d'éditeur de champs sur la page** (aucune donnée de positions : la carte centrale montre un état vide), **pas d'heure d'ouverture par signataire** (seulement un nombre), **pas de relance préparée par Ajmani ni de piste de preuve détaillée, pas de personne en copie** (aucune source : STATUT §1.27 n° 4) ; la signature sur place (`/signature`) garde son écran d'origine
| ME03 | Écrire · Modèles | mixte | fait (v4, mesure à confirmer par T1) | composants `src/refonte/ecrire/ecrans/me03/` (`VueModeles`, `composerModeles`, `PageModeles`) ; substitution de `/outils/modeles` ; aperçu `npm run apercu -- ME03`. Capture 1440 × 900 : 35,8 % brut en tout (galerie, proposition d'Ajmani et modèle ouvert tenus ; textes et miniatures diffèrent). Le poste garde des modèles de texte (`templates`, variables `{prénom}`) : **créer, dupliquer, remplir les variables et copier le texte rempli fonctionnent** (un texte à trous ne se copie pas ; chaque copie compte une utilisation). **Écarts gardés** : **pas de types de modèle (Devis, E-mails…), pas de sources de variables (fiche client, catalogue : toutes sont « à saisir »), pas de bibliothèque recommandée « 24 sur 30 », pas de modèle proposé par Ajmani, pas d'import, pas de « utilisé par … »** (aucune source : STATUT §1.27 n° 4)
| ME01 | Écrire · Journal | mixte | fait (v4, mesure à confirmer par T1) | composants `src/refonte/ecrire/ecrans/me01/` (`VueJournal`, `composerJournal`, `PageJournal`) ; substitution de `/personnel/journal` ; aperçu `npm run apercu -- ME01`. Capture 1440 × 900 : 15,9 % brut en tout. Le journal reste PERSONNEL (stockage du poste, jamais une collection partagée). **Écarts gardés** : le poste garde un jour, un texte et une humeur de 1 à 5 : **pas d'énergie, de trois mercis, d'étiquettes ni d'heure de début** (aucune source : STATUT §1.27 n° 10, pas de nouveau rangement), pas de résumé du vendredi (aucun bilan lu au calendrier) ; **le bandeau de série du calendrier n'est pas codé** (aucune règle dans la fiche : décision du CO, §1.29) ; « ⌘↵ pour passer à demain » ne se montre que si demain n'est pas dans le futur (règle de la fiche ; l'image le montre le jour même) ; **tension à connaître** : l'ancien écran du journal retirait la série et l'humeur moyenne pour que le journal ne devienne pas un devoir ; la série revient parce que le dossier v4 et le CO (§1.29 n° 1) la veulent, sans comparaison ni rappel
| ME02 | Écrire · Rédaction et traduction | mixte | fait (v4, mesure à confirmer par T1) | composants `src/refonte/ecrire/ecrans/me02/` (`VueRedaction`, `composerRedaction`, `PageRedaction`) ; substitution de `/outils/redaction` ; aperçu `npm run apercu -- ME02`. Capture 1440 × 900 : 46 % brut en tout (la mise en page est tenue ; le texte de la lettre et le retour à la ligne diffèrent, le détail est à T1). Le poste garde des brouillons à corrections (`writingDrafts`) : les corrections se lisent barrées et soulignées, **accepter ou ignorer une correction s'enregistre**, un engagement (geste, date, prix) reste en attention jusqu'à la décision. **Écarts gardés** : **ni ton, ni longueur, ni langue choisis, ni destinataire, ni pièce jointe, ni vérification de date au planning, ni version traduite** (aucune source : STATUT §1.27 n° 4) ; la colonne de réglages n'est donc pas montrée ; **« Envoyer » et « Traduire » restent inactifs** : « l'assistant ne publie jamais », l'envoi est le geste de la personne depuis l'écran qui envoie ; l'anneau compte les mots du texte final sur un objectif « moyen » (250)
| ME04 | Écrire · Archives | nouveau | fait (v4, mesure à confirmer par T1) | composants `src/refonte/ecrire/ecrans/me04/` (`VueArchives`, `composerArchives`, `PageArchives`) ; **écran neuf du registre** : vue `archives` (`/archives`, `nouveau`) dans `declarations/ecrire.ts`, sous « Ranger les documents » ; aperçu `npm run apercu -- ME04`. Capture 1440 × 900 : 30,7 % brut en tout (les trois colonnes, la recherche rangée par mois, le quota, les règles, les restaurations et la suggestion tenus). **Écart gardé, important** : le poste n'a **aucune source d'archives** (pas de collection, décision du CO §1.29 n° 2 ; ni corbeille H22 ni fichiers archivés H11 dans les données) : la page branchée dit « Rien n'est encore archivé » et **n'affiche ni règles automatiques, ni espace, ni suggestion** (elles n'agiraient sur rien) ; la vue complète vit dans l'aperçu et s'allume quand la source existera (la collection `archives` est sur la liste présentée à Harun)
| ME05 | Écrire · Base de connaissances | mixte | fait (v4, mesure à confirmer par T1) | composants `src/refonte/ecrire/ecrans/me05/` (`VueConnaissances`, `composerConnaissances`, `PageConnaissances`) ; substitution de `/knowledge` ; aperçu `npm run apercu -- ME05`. Capture 1440 × 900 : 23,3 % brut en tout, le plan et « Voir aussi » dans la carte de l’article comme l’image (tous les blocs de la maquette sont là : question et réponse sourcée, arbre, article en étapes, plan, « Voir aussi »). **Ce que la capture a appris** : « Comment annuler une facture ? » citait la première étape au lieu de celle de l'avoir ; `repondre` reconnaît maintenant les mots qui disent la même chose (annuler, supprimer, corriger…) sur leurs six premières lettres, avec ses contrôles. Le poste garde des documents de connaissance (`knowledge` : titre, texte) : chacun est un article, ses paragraphes sont ses étapes ; **modifier un article reste possible** (enregistrement une seconde après la frappe). **Écarts gardés** : pas de rubriques (une seule, « Articles »), pas d'auteur, pas de compte de lectures, pas d'article « à relire » (aucun module cité), pas de parcours des nouveaux membres ni d'astuces, pas de « lu par … » (aucune source : STATUT §1.27 n° 4)

**Construction (14 nov.)** : les 9 écrans sont faits (un commit chacun, `src/refonte/ecrire/ecrans/`). **Cibles (décision §1.39)** : toute cible des 9 écrans a une zone de clic invisible de 34 px au moins (`::after`, `commun/ecran.css`), sans changer le dessin des fiches. Écarts de fidélité justifiés zone par zone dans [`docs/qualite/fidelite/justifies-LOT-03.json`](../qualite/fidelite/justifies-LOT-03.json) (mesures brutes de S5, à refaire par T1 sur le build) : F20 16,0 · ME01 15,9 · H11 22,9 · ME05 23,3 · H10 27,3 · ME04 30,7 · H12 34,8 · ME03 35,8 · ME02 46,0 %.

Préparation par S5 (14 nov., `claude/refonte-ecrire`) : note [`preparation/LOT-03-ecrire.md`](preparation/LOT-03-ecrire.md), logique dans `src/refonte/ecrire/`, garde `check:ecrire` (99 contrôles), rapport [`rapports/LOT-03-preparation.md`](rapports/LOT-03-preparation.md). Aucun écran visuel. Dossier v4 lu (fiches, `06`, `tutoiement.json`) ; **les images v4 n'ont pas été ouvertes**. La série d'écriture est une seule règle pour F20, H10 et ME01 (« Proposition » de F20 §9, à valider). La note épinglée d'un client, source demandée par H41, est dans `pages.ts`.

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

Préparation par DS (14 nov.) : logique pure `src/refonte/argent/` (18 fichiers) et `check:argent` (69 propriétés : cas écrits à l'avance, dont les exemples chiffrés des fiches ; rejeu sur les jeux de SIM). Note : [`preparation/LOT-04-argent.md`](preparation/LOT-04-argent.md). Aucun écran avant la fusion du socle v4. **Relue avec le dossier v4** (17 fiches) : les points [fiche] sont levés ; décisions du CO appliquées (§1.28 n° 2, §1.29) ; écarts restants au §5 de la note.

| ID | Écran | Type | État | Écart / note |
|---|---|---|---|---|
| F30 | Argent · Vue d'ensemble | nouveau | en cours (préparation) | `ensemble.ts` : rivière du mois, objectif d'encaissement ; définition de la « série » à trancher (G03 ≠ F30) |
| G03 | Argent · Facturation | mixte | en cours (préparation) | `facturation.ts` : six stations (dont « Vue »), reste dû, numérotation existante, mentions, paiement à vérifier avant relance |
| H07 | Argent · Devis | mixte | en cours (préparation) | `devis.ts` : états de la fiche (signé, facturé), **devis prérempli** (H41, H42), écart de version ; TVA par ligne (CO) au lieu de par taux (fiche) |
| H08 | Argent · Dépenses | mixte | en cours (préparation) | `depenses.ts` : justificatifs avant le 5, reçu rapproché, TVA récupérable des seules dépenses justifiées |
| H09 | Argent · Prévisions | mixte | en cours (préparation) | `tresorerie.ts` : 90 jours, trois scénarios par hypothèses, ce qui pèse le plus, seuil de confort ; **attendus de SIM non livrés** |
| MA07 | Argent · Trésorerie | mixte | en cours (préparation) | même moteur que H09 ; compte courant par défaut, épargne à part ; autonomie, bande d'incertitude |
| MA04 | Argent · Impayés | mixte | en cours (préparation) | `impayes.ts` : colonnes d'âge, échelle de relance sur les seuils de `relances.ts` ; aucun calcul de pénalités (fiche) ; mise en demeure sans modèle par défaut |
| MA01 | Argent · Contrats | mixte | en cours (préparation) | `contrats.ts` : à renouveler dans le préavis de 60 jours, jamais pour un tacite ; révision |
| MA02 | Argent · Comptabilité | mixte | en cours (préparation) | `comptabilite.ts` : soldes du 512, résultat indicatif, 8 points calculés ; FEC existant |
| MA03 | Argent · Paiements en ligne | mixte | en cours (préparation) | `paiements.ts` : réussite, frais, par moyen ; état « à brancher » (S9, H21) |
| MA05 | Argent · Notes de frais | mixte | en cours (préparation) | sommes dues par personne ; remboursement préparé |
| MA06 | Argent · Budget | mixte | en cours (préparation) | `budget.ts` : presque plein dès 90 %, payé, dépassé ; bandeau |
| MA08 | Argent · TVA et impôts | mixte | en cours (préparation) | `tva.ts` : débits ou encaissements, prochaine échéance, 2 jours ouvrés, mis de côté ; période trimestrielle à confirmer |
| MA09 | Argent · Abonnements récurrents | mixte | en cours (préparation) | `abonnements.ts` : revenu récurrent, résiliations, prélèvements des 15 jours |
| MA10 | Argent · Banque | mixte | en cours (préparation) | `banque.ts` : **lecture seule**, pièce proposée jamais appliquée seule, ordre préparé |
| MA11 | Argent · Paie | mixte | en cours (préparation) | `paie.ts` : montants masqués par défaut ; aucune cotisation calculée à l'écran (les 46 % ne servent qu'aux jeux) |
| MA12 | Argent · Tarifs et remises | mixte | en cours (préparation) | `tarifs.ts` : marge entière, objectif 55 %, remise au-delà de 5 % avec accord ; place des modules de F1 à décider |

**Manque au socle** (à vérifier sur la liste v4) :
- brique « montant masqué / révélé » (MA11, aussi G09) ;
- graphique à trois scénarios avec seuil et zone « sous le seuil » (H09, MA07) ;
- surfaces nommées par les fiches : `AgingBoard`, `DunningLadder`, `HypothesisRuler`, `DeadlineCountdown`, `VatWaterfall`, `FiscalMatrix`, `GoalCard`.

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
| F40 | Échanger · Vue d'ensemble | nouveau | fait (v4, mesure à confirmer par T1) | composants `src/refonte/echanger/ecrans/f40/` (`VueHub`, `composerHub`, `PageHub`) ; substitution de `/ensemble/echanger` ; aperçu `npm run apercu -- F40`. Capture 1440 × 900 : 16,6 % brut en tout (pouls, canaux actifs, Boîte à zéro et dix tuiles tenus). **La capture a corrigé la logique** : l'axe de la règle d'attente est de 3 h (15 min, 30 min, 1 h, 2 h, 3 h tombent aux rangs √(t/3 h) sur l'image), pas de 8 h ; `check:echanger` mis à jour. **Écarts gardés** : le poste sait les annonces à confirmer, les sondages en cours, les réunions de la semaine, les messages privés non lus et les messages d'équipe : **pas de boîte des clients (G07), de courriel (MX01), de partage (MX03), de réponses automatiques (MX06)** : leurs écrans existent (LOT-05 fini), leurs tuiles se montrent avec « à brancher » vers leur écran ; **pas de messages programmés** (aucun écran) : sa tuile ne se montre pas ; donc « Personne n'attend » et pas de Boîte à zéro ; pas de présence (« … lit ») : masquée au premier jet (§1.32 n° 4)
| G07 | Échanger · Messagerie (boîte des clients) | mixte | fait (v4, mesure à confirmer par T1) | composants `src/refonte/echanger/ecrans/g07/` (`VueBoite`, `composerBoite`, `PageBoite`) ; **écran neuf du registre** (`clientInbox`, route `/messagerie`, famille Échanger, module « Messagerie » essentiel) ; l'ancienne « Messagerie » d'équipe devient **« Canaux »** (essentielle aussi, §1.32 n° 1). Aperçu `npm run apercu -- G07` : 18,2 % brut en tout (bandeau 1108 × 72, couloirs 344, lignes de 54 et 42 px, contexte 71 px, réponse 127 px ; justifié dans `justifies-LOT-05.json`). **Le poste n'a pas de messages de clients** : courriel, WhatsApp et SMS sont des prises de H21 (LOT-07) et la collection des messages est sur la liste de Harun (§1.27 n° 4) ; la page branchée dit « connecteur à brancher » pour les trois canaux et ne montre ni couloir, ni Boîte à zéro, ni série ; « Nouveau message » reste éteint. La vue complète est celle de l'aperçu. **Règles tenues** : un fil par client, le plus ancien sans réponse compte, la note interne ne quitte pas l'équipe, brouillon jamais envoyé seul, « 2 h ouvrées » lues dans `connecteurs/reglages.ts` (donc « 2 h 11 » du message de 08:31 n'est pas orange : 1 h 42 ouvrée, écart gardé contre l'image). **Ajout de logique** : `GesteDeTri.depuisLe` et `Fil.attendDepuis` (« depuis 2 j » : depuis quand la balle est chez le client). **Rail** : 17 essentiels au lieu de 16 (les deux entrées essentielles), `check:navigation` mis à 17. Écart de la fiche : les deux « Medina » de l'image sont deux clients dans l'aperçu (un fil par client) |
| H13 | Échanger · Appels et salles | mixte | fait (v4, mesure à confirmer par T1) | composants `src/refonte/echanger/ecrans/h13/` (`VueAppels`, `composerAppels`, `PageAppels`) ; substitution de `/appels` (`/salles` garde l'écran d'origine). Aperçu `npm run apercu -- H13` : 22,9 % brut (justifié dans `justifies-LOT-05.json`) ; la vue complète (ligne pro, pavé, transfert, Standard, plan des salles, historique résumé) est celle de l'aperçu. **Ce que le poste sait** : l'appel en cours dans l'application (correspondant, durée réelle, micro, raccrocher), qui est en ligne et peut être appelé, le journal des appels (sens, durée, manqué ; un manqué est « rappelé » quand la personne a rappelé depuis). **Sans ligne pro (repli de la fiche §2)** : pas de pavé, d'attente, de transfert ni de Standard ; **pas montré** (§1.27 n° 4) : plan des salles en direct (aucune présence de salle au poste), résumés, décisions et tâches d'Ajmani, onde (pas de signal), notes d'appel, « Créer les tâches ». « Appel instantané » ouvre l'invitation d'un visiteur par lien (`CallLinkPanel`, comme l'écran d'origine : rien n'est perdu) ; « Programmer » reste éteint (lien avec le Calendrier à venir). **Règles tenues** : aucun lien, jeton ni mot de passe de salle affiché ; aucun temps d'appel cumulé par personne ; la salle de La Garde ne se voit que par la supervision |
| H14 | Échanger · Annonces | mixte | fait (v4, mesure à confirmer par T1) | composants `src/refonte/echanger/ecrans/h14/` (`VueAnnonces`, `composerAnnonces`, `PageAnnonces`) ; substitution de `/annonces`. Aperçu `npm run apercu -- H14` : 31,9 % brut (justifié dans `justifies-LOT-05.json` : le rangement de la mosaïque suit la règle de la fiche, que l'image ne suit pas). **Ce que le poste sait** : titre, texte, auteur, date, qui a confirmé (`readBy`, sans l'heure) : « À la une » = la plus récente **sans bordure ambre**, accusés nominatifs, « Lu par x sur y » (l'auteur compté d'office), mosaïque, barre de lecture à 3 segments, « Presque à jour » (x/y personnel), « J'ai lu » et « Publier » (logique de l'écran d'origine). **Pas montré** (§1.27 n° 4, pas de nouvelle donnée synchronisée sans Harun) : catégories et leur carte, réactions, épingle, réponses, rappel d'Ajmani, « Nouveauté d'AMN Business », interrupteur « Épingler ». **Ajouts de logique** : `segmentsDeLecture`, `confirmations[].at` facultatif (le poste ne garde pas l'heure), `rappelAProposer(…, avantMs)`. Écarts de la fiche : la suggestion de rappel de l'image est visible toute la journée, la Proposition de la fiche dit 2 h avant (gardée, réglable par `rappelAvantMs`) ; le rappel est proposé 15 min avant l'heure annoncée, comme l'image (21:45 pour 22 h) |
| MX01 | Échanger · Courriel | mixte | fait (v4, mesure à confirmer par T1) | composants `src/refonte/echanger/ecrans/mx01/` (`VueCourriel`, `composerCourriel`, `PageCourriel`) ; **écran neuf du registre** (`sharedMail`, route `/courriel`, famille Échanger, module « Courriel » courant). Aperçu `npm run apercu -- MX01` : 20,1 % brut (justifié dans `justifies-LOT-05.json`). **Le poste n'a pas de boîte partagée** : la messagerie est une prise de H21 (LOT-07) et la collection des courriels est sur la liste de Harun (§1.27 n° 4) ; la page branchée dit « connecteur à brancher » et ne montre ni dossier, ni fil, ni résumé ; « Nouveau message » reste éteint. La vue complète (dossiers et comptes, étiquettes, « Dans la boîte », fils, résumé d'Ajmani en demandes numérotées, messages repliés, pièce jointe analysée, brouillon prêt) est celle de l'aperçu. **Règles tenues** : aucune clé, aucun mot de passe, aucun jeton ni adresse de serveur ; une pièce jointe n'est montrée qu'avec son état d'analyse ; le brouillon d'Ajmani n'est jamais envoyé seul ; les envois programmés ne sont pas des fils ; ni compteur par personne, ni minuteur de réponse |
| MX02 | Échanger · Réunions | mixte | fait (v4, mesure à confirmer par T1) | composants `src/refonte/echanger/ecrans/mx02/` (`VueReunions`, `composerReunions`, `PageReunions`) ; substitution de `/reunions`. Aperçu `npm run apercu -- MX02` : 18,5 % brut (justifié dans `justifies-LOT-05.json`) ; la vue complète (réunion en cours, vignettes et parole, notes en direct, suggestion « Raccourcir », ordre du jour minuté, cases « Avant 11:00 », préparation en %) est celle de l'aperçu. **Ce que le poste sait** : titre, heure, durée, participants (une phrase libre), ordre du jour (un texte, une ligne par sujet, sans minutes), décisions et actions avec leur case : « Prochaine réunion » (compte à rebours sous une heure), « À venir », et à gauche les décisions et les actions de la **dernière réunion passée**, où l'on peut en noter et cocher les actions ; « Planifier » garde les champs de l'écran d'origine. **Pas montré** (§1.27 n° 4) : réunion « en cours » (aucun début réel), vignettes et parole, notes en direct, suggestion de durée, documents et cases de préparation (donc pas de pourcentage dans « À venir »), « Rejoindre », « Modèles d'ordre du jour ». L'enregistrement n'est jamais lancé sans l'accord de chaque participant ; ni mesure du temps de parole, ni classement de préparation |
| MX03 | Échanger · Partage de fichiers | mixte | fait (v4, mesure à confirmer par T1) | composants `src/refonte/echanger/ecrans/mx03/` (`VuePartages`, `composerPartages`, `PagePartages`) ; **écran neuf du registre** (`sharedFiles`, route `/partages`, famille Échanger, module « Partage de fichiers » courant). Aperçu `npm run apercu -- MX03` : 24,3 % brut (justifié dans `justifies-LOT-05.json`). **Le poste n'a pas de liens de partage** : la collection des liens est sur la liste de Harun (§1.27 n° 4) et le stockage des fichiers n'est pas branché ; la page branchée dit « à brancher », ne montre ni zone de dépôt, ni carte, ni transfert, et n'envoie rien. La vue complète (dépôt, réglages du prochain lien, cartes de lien et jauge d'expiration, transferts, protection de tous les liens, espace utilisé, relance proposée) est celle de l'aperçu. **Règles tenues** : aucune adresse de lien, aucun jeton, aucun mot de passe (ni dans le texte, ni dans le DOM) ; un lien ne part jamais sans protection ; « Prolonger » n'existe pas pour un lien sans expiration ; orange et jamais rouge pour « bientôt expiré » ; rien n'est envoyé sans clic |
| MX04 | Échanger · Canaux | mixte | fait (v4, mesure à confirmer par T1) | composants `src/refonte/echanger/ecrans/mx04/` (`VueCanaux`, `composerCanaux`, `PageCanaux`) ; substitution de `/groupes` (`/team` et `/messages-prives` gardent leur écran). Aperçu `npm run apercu -- MX04` : 18,3 % brut (justifié dans `justifies-LOT-05.json`) ; la vue complète (carte « Urgent », réactions par icônes, fil, « en train d'écrire », tiroir et résumé d'Ajmani) est celle de l'aperçu. **Ce que le poste sait** : les groupes (nom, membres) et leurs messages : rail, flux, compositeur (Entrée envoie), « Nouveau canal » (nom et membres, logique de l'écran d'origine) ; « général » ouvre la messagerie d'équipe `/team` (fils, réactions et épingles y restent). **Pas montré** (§1.27 n° 4) : pastilles de non lus (aucune dernière lecture par canal), réactions par icônes (celles de l'équipe sont des émojis), fils de réponses et résumé d'Ajmani, carte « Urgent » (aucun lien ticket-canal), « en train d'écrire » et statuts des messages directs (aucun signal), coche « message en tâche ». **Écart avec l'écran d'origine** : dissoudre un canal n'a pas de place dans la fiche v4 ; décision du CO (provisoire, révisable par Harun) : il reste dans l'écran d'origine, que « Parcourir les canaux » ouvre (`useOutlet`), avec sa confirmation. Un invité ne voit que les canaux dont il est membre et n'a pas de « Nouveau canal » (contrôlé) |
| MX05 | Échanger · Sondages | mixte | fait (v4, mesure à confirmer par T1) | composants `src/refonte/echanger/ecrans/mx05/` (`VueSondages`, `composerSondages`, `PageSondages`) ; substitution de `/sondages`. Aperçu `npm run apercu -- MX05` : 15,6 % brut (justifié dans `justifies-LOT-05.json`). **Ce que le poste sait** : question, options, qui a voté quoi (sans l'heure), anonyme ou non, clôture, équipe comme destinataires : barres (pourcentage, voix, en tête, avatars des votants si le sondage n'est pas anonyme), participation sans nom (« 1 vote attendu »), « Autres sondages » (option en tête ou note moyenne), éditeur (question, options, réponses anonymes), voter (une barre se clique tant qu'on n'a pas voté), clore (auteur ou administrateur), créer : logique de l'écran d'origine. **Pas montré** (§1.27 n° 4) : « Votes en direct » (aucune heure de vote), type de réponse autre qu'un choix, ouverture aux clients, résultats visibles avant la fin, date de clôture, brouillon d'Ajmani, « Partager », « Modèles », « Tous les sondages », « Aperçu ». **Écart avec l'écran d'origine** : la suppression d'un sondage (auteur ou administrateur) n'a pas de place dans la fiche v4 ; décision du CO (provisoire, révisable par Harun) : elle reste dans l'écran d'origine, que « Tous les sondages » ouvre (`useOutlet`), avec sa confirmation. Un sondage anonyme n'affiche jamais qui a voté quoi (contrôlé : ni avatar, ni nom, ni initiale) |
| MX06 | Échanger · Réponses automatiques | mixte | fait (v4, mesure à confirmer par T1) | composants `src/refonte/echanger/ecrans/mx06/` (`VueReponses`, `composerReponses`, `PageReponses`) ; **écran neuf du registre** (`autoReplies`, route `/reponses-automatiques`, famille Échanger, module « Réponses automatiques » courant). Aperçu `npm run apercu -- MX06` : 20,5 % brut (justifié dans `justifies-LOT-05.json`). **Le poste n'a pas de règles** : la collection des règles est sur la liste de Harun (§1.27 n° 4) et l'envoi passe par la messagerie, prise de H21 ; la page branchée dit « à brancher », ne montre ni liste, ni éditeur, ni aperçu, et n'envoie rien. La vue complète (liste et compteurs du mois, règle proposée née désactivée, éditeur en phrases QUAND · ET SI · ALORS · ET AUSSI · SAUF SI, aperçu avec variables, suggestion « Une règle manque ») est celle de l'aperçu. **Règles tenues** : une règle neuve, importée ou proposée naît désactivée ; une règle incomplète ne s'active pas ; une variable sans valeur ne bloque jamais l'envoi (« Bonjour, ») ; le garde-fou « SAUF SI » (24 h) est la proposition par défaut ; les horaires et la prochaine ouverture viennent des réglages des heures ouvrées (rien de recopié) ; le message qui part chez un client garde le vouvoiement (il vient du modèle de la règle) |

Préparation par S5 (14 nov., `claude/refonte-echanger`) : note [`preparation/LOT-05-echanger.md`](preparation/LOT-05-echanger.md), logique dans `src/refonte/echanger/`, garde `check:echanger` (94 contrôles), rapport [`rapports/LOT-05-preparation.md`](rapports/LOT-05-preparation.md). Aucun écran visuel. Dossier v4 lu (fiches, `06`, `tutoiement.json`) ; **les images v4 n'ont pas été ouvertes**. G07 est la boîte des clients ; WhatsApp, SMS, le courriel et la téléphonie sont des prises de la baie de S9 : `connecteurs.ts` dit « connecteur à brancher » et ne simule rien. Ce qui part chez un client reste au vouvoiement (la logique le vérifie, elle n'écrit aucun texte client).

**Manque au socle**
- `ModuleTile`, `ModuleGroupGrid`, `AddModuleTile` pour F40 ; `SuggestionCompact`, `FlagUrgent`, `Kbd`, `LiveDot`, `Caret` (cités, à confirmer par S0).
- `formats.ts` : le lot garde une copie de `nombre` et `pct` à retirer à la fusion du socle v4.
- `check:tutoiement` : pas encore dans la base (la garde du lot refuse « vous / votre / vos » et les impératifs en « -ez » dans ses textes).

**Manque aux données**
- Messagerie : le canal et le sens de chaque message client, l'état de tri, les notes internes, les adresses et numéros des fiches pour le rattachement.
- Courriel (MX01) : une boîte partagée, des fils, l'état d'analyse des pièces jointes, les envois programmés.
- Annonces : épinglage, catégories, destinataires, heure de lecture par personne, réactions. Sondages : types de réponse, destinataires clients. Réunions : début réel, ordre du jour minuté, notes en direct.
- Partage de fichiers (MX03) : tout (liens, ouvertures, protection, quota).
- Réponses automatiques (MX06) : des règles structurées et leurs envois.
- Appels : ligne professionnelle, file d'attente, transfert, présence vocale.
- Aucune collection synchronisée n'est ajoutée sans l'accord de Harun (§1.27 n° 4) : en attendant, « non disponible », avec la raison.

### LOT-06 · Créer et produire — `claude/refonte-creer` — 15 écrans

**Mode PRÉPARATION (consigne du CO, 6 nov.)** : le socle v3 n'étant pas fusionné, aucun écran visuel n'est construit. Livré : la note [`preparation/LOT-06-creer.md`](preparation/LOT-06-creer.md) (module existant, données, écarts, écran par écran), la **logique pure des 15 écrans** dans `src/refonte/creer/` (17 fichiers, sans React ni brique du socle) et `npm run check:creer` (137 contrôles, cas limites et tutoiement inclus : cas des fiches écrits à la main, puis jeux fictifs de SIM aux volumes vide, peu, normal, beaucoup ; ajouté à `editions.yml`). Gardes sans navigateur de la CI : toutes vertes sur la branche (`typecheck`, `typecheck:business`, `lint`, les contrôles de `editions.yml`) ; `check:business` attend un build.

La colonne « État » reste `à faire` : un écran n'est « fait » qu'une fois construit, capturé et comparé à son image.

| ID | Écran | Type | État | Écart / note |
|---|---|---|---|---|
| F50 | Créer · Vue d'ensemble | nouveau | fait | Hub branché sur `assemblies`, `orders`, `videoProductions`, `stockItems` (substitution `/ensemble/creer`) ; « Fabrication » masqué, tuile « Modèles de sites » (LOT-11) ; 16 tuiles en 4 groupes de 4. Aperçu `npm run apercu -- F50` : écart brut 31,6 % à ± 2 px contre l'image v4, dû surtout aux données fictives de SIM (noms, nombre de jetons, mesures de tuiles absentes) et à l'en-tête de page 5 px plus haut (socle). Pas de contrôle qualité ouvert ni d'échéance de commande dans les modules réels : postes « Contrôler » vides. |
| H15 | Créer · Stock | mixte | fait | Substitué à `/stock` (clé `stock`), branché sur `stockItems` : jauges exactes ; sans emplacement, historique ni commande fournisseur dans le dépôt, la projection dit « pas assez d'historique », « en route » est vide et le journal ne montre que le dernier mouvement de chaque article (demande à amn-api). Pas de puces de catégorie (champ absent). Aperçu `npm run apercu -- H15` : écart brut 23,0 % à ± 2 px (données fictives de SIM ≠ données de l'image ; commandes en route posées dans l'aperçu seulement). |
| H16 | Créer · Chantiers | mixte | fait | Substitué à `/montage` (clé `assembly`) ; branché sur `assemblies` (étapes cochables ici, même écriture `doneAt`) et `interventions` (agenda). Budget, dépensé, poids d'étape, dates de fin et livraisons n'existent pas dans le dépôt : « Budget non renseigné » (demande à amn-api). Vues « Liste » et « Carte » : sélecteur posé, pas construites (fiche D). Aperçu `npm run apercu -- H16` : écart brut 35,1 % à ± 2 px (données fictives de SIM ≠ image : noms, nombre d'étapes, interventions posées dans l'aperçu). Repris le 14 nov. après la mesure de T1 : jauge de budget VIDE avec « Budget non renseigné » à l'intérieur (au lieu de rien) ; suggestion « Risque de retard » en `SuggestionCompact` (règle réelle : une livraison non faite d'une tournée qui cite le client tombe après la prochaine intervention du chantier ; « Voir la tournée » ouvre les tournées, rien n'est envoyé au client). Le bouton « Nouveau chantier » est le primaire de `PageHead` (dégradé orange) : à remesurer par T1. |
| H17 | Créer · Visuels et marque | mixte | fait | Substitué à `/identite-visuelle` (clé `brand`) ; branché sur `brandKit` (monogramme, couleurs, police). Logos importés, rôle et part des couleurs, graisses, modèles et règles « à éviter » : « non disponible » (aucun stockage de fichiers nouveau, §1.27 n° 10) ; « Exporter le kit » désactivé sans logo. Les 4 tuiles « à éviter » sont dessinées en CSS (illustrations). Aperçu `npm run apercu -- H17` : écart brut 37,9 % à ± 2 px (marque fictive de SIM ≠ AMN DevSec : couleurs de la barre et des pastilles, nom). |
| MR01 | Créer · Vidéo | mixte | fait | Substitué à `/montage-video` (clé `video`) ; liste branchée sur `videoProductions`, frise sur les plans du montage `videoEdits` de même titre (les deux sources gardées et reliées, §1.27 n° 6). Pas de moteur de montage : frise en lecture. Sous-titres, voix off, musique, version et commentaires de relecture absents du dépôt : « non disponible » (demande à amn-api). Fenêtre de confirmation de publication non construite (« Préparer la publication » ouvre la production). Aperçu `npm run apercu -- MR01` : écart brut 37,5 % à ± 2 px (données fictives de SIM ; plans, sous-titres et retours posés dans l'aperçu). |
| MR02 | Créer · Ma page publique | mixte | fait | Substitué à `/mini-page` (clé `minisite`) ; branché sur la mini-page du dépôt (une configuration unique) : sections DÉDUITES de la configuration, statut « En ligne » / « Brouillon » selon l'interrupteur, pas de version de travail ni de visites mesurées (« non disponible »). Publier = allumer la page, avec fenêtre de confirmation (ce qui devient public, ce qui reste privé, contrôles restants) ; seul le dirigeant publie, les autres « demandent la publication » (§1.27 n° 9). Aperçu `npm run apercu -- MR02` : écart brut 32,6 % à ± 2 px (site d'exemple générique ≠ image ; sections, visites et avis posés dans l'aperçu). Zone client ajoutée à `check:tutoiement` pour le texte du site d'exemple (vouvoiement). |
| MR03 | Créer · Tournées | mixte | fait | Substitué à `/tournees` (clé `rounds`) ; branché sur `deliveryRounds` (arrêts, km depuis l'arrêt précédent, durée, heure de départ ; heures d'arrivée calculées). Plan SCHÉMATIQUE sans service ni clé (§1.27 n° 5) : repères posés par `pointsSchematiques`. Pas d'état « En route », d'heure fixée ni de véhicule suivi dans le dépôt : « Je suis arrivé » pointe l'arrêt (`doneAt`), gain d'optimisation et suggestion de prévenir les clients absents du réel. « Avant de partir » : cases locales (pas encore écrites dans Tâches). Aperçu `npm run apercu -- MR03` : écart brut 30,9 % à ± 2 px (étapes fictives de SIM ≠ image ; km, véhicule et positions posés dans l'aperçu). |
| MR04 | Créer · Matériel | mixte | fait | Substitué à `/materiel` (clé `equipment`) ; branché sur `resources` et `resourceBookings` : « En prêt » quand un prêt est en cours (personne du prêt), « Disponible » sinon ; état, numéro de série, entretien et valeur absents du dépôt : « non disponible » (rien n'est supposé). Mouvements du jour tirés des prêts du jour ; « Entretien du mois » cochable en local (pas encore écrit dans Tâches). Scanner un code : bouton sans action (pas de lecteur). Aperçu `npm run apercu -- MR04` : écart brut 35,8 % à ± 2 px (équipements fictifs de SIM ≠ image ; mouvements posés dans l'aperçu). Correction commune : fond des avatars du lot (`--socle-avatar-m`). |
| MR05 | Créer · Catalogue produits | mixte | fait | Écran construit sur `stockItems` (aucune nouvelle collection, §1.27 n° 2) : nom, quantité, seuil ; prix, photos, TVA, prix d'achat, fournisseur et ventes « non disponible » (demande à amn-api : collection `products`). Mosaïque avec tuile vedette, anneau « fiches complètes », volet « Fiche produit ». Route `/catalogue` NOUVELLE, montée dans `appRoot.internal.tsx` (acceptée par le CO) ; l'entrée de registre « Catalogue produits » (action Stocker) attend la correction de `check:navigation` par S5 (patch prêt : `nouveau` dans `declarations/creer.ts`, `NAV_EN` interne, 101 → 104). Aperçu `npm run apercu -- MR05` : écart brut 39,4 % à ± 2 px (produits fictifs de SIM ≠ image ; photos remplacées par une icône, prix d'achat et ventes posés dans l'aperçu). |
| MR06 | Créer · Réservations | mixte | fait | Écran sur la route NOUVELLE `/reservations` (§1.27 c ; route montée dans `appRoot.internal.tsx` ; entrée de registre « Réservations », action Livrer, en attente de la correction de `check:navigation` par S5). Construit sur `roomBookings` (pièces) et `resources` / `resourceBookings` (matériel) : plage 08:00-18:00 du lundi au vendredi par défaut, tout « confirmée » (le dépôt n'a ni demande ni conflit : aucun conflit affiché tant que le serveur n'en porte pas) ; véhicules non reliés (MR09). Créneaux libres calculés, jamais enregistrés ; « maintenant » à l'heure de Paris. Aperçu `npm run apercu -- MR06` : écart brut 22,5 % à ± 2 px (journée de l'image posée à la main dans l'aperçu : le jeu de SIM place ses réservations sur d'autres jours). |
| MR07 | Créer · Commandes | mixte | fait | Substitué à `/commandes` (clé `orders`) ; branché sur `orders` : les statuts réels (`new`…`delivered`) se rangent dans les 4 étapes de la bande, « Marquer prête » avance d'un statut par les transitions fermées du dépôt (pas de retour en arrière depuis cet écran). Mode de remise, échéance, urgence, responsable et preuve de remise absents du dépôt : pas d'échéance ni d'urgence inventées, palier calculé sur le record du mois (0 faute de données). Suivi pas à pas sans les détails (« Riyad vérifie… ») : champ absent. Aperçu `npm run apercu -- MR07` : écart brut 21,3 % à ± 2 px (commandes fictives de SIM ≠ image ; échéances et 58 livrées posées dans l'aperçu). |
| MR08 | Créer · Boutique en ligne | mixte | fait | Substitué à `/boutique` (clé `shop`) ; branché sur `shopCarts` (paniers par étape, visites par jour) et `orders` (semaine, ce qui se vend). Visites en direct, étape « produit vu » et objectif du trimestre absents du dépôt : carte « en ce moment » = « non mesurées », l'entonnoir saute l'étape absente (au lieu de la supposer), objectif « non défini » (réglage à créer : demande à amn-api). Paniers contactables : 0 faute de consentement stocké. Aperçu `npm run apercu -- MR08` : écart brut 22,2 % à ± 2 px (visiteurs, ventes, entonnoir et objectif posés dans l'aperçu, le jeu de SIM n'en a pas). |
| MR09 | Créer · Flotte de véhicules | mixte | fait | Écran substitué sur `/flotte` (module `fleet`). Branché sur `vehicles` (compteur = départ + kilomètres des arrêts pointés de `deliveryRounds`, rythme des 30 jours pour dater les échéances au km, bilan du mois km + carburant par les coûts « carburant »). Absents du dépôt, affichés « Aucun plein enregistré » / « non disponible » (§1.27 n° 4) : énergie (thermique par défaut), niveau de carburant ou de charge, autonomie, conducteur, lieu du garage. « En tournée » = tournée du jour non finie avec ce véhicule (pas la réservation MR06). Aucun suivi de position. « Avant le prochain trajet » : 3 contrôles, ordre de l'image (pneus, carnet de bord, plein ou charge ; le 3e contrôle est le carnet, plus « papiers » : ils restent au coffre), cases locales à l'écran (pas d'écriture dans Tâches sans collection). « Ajouter un véhicule » : fenêtre (modèle, plaque, compteur) qui écrit `vehicles`. « Carnets d'entretien » ouvre le classeur. Écarts à l'image : la vidange du Kangoo est rouge (la règle de la fiche, moins de 30 jours, l'emporte sur l'orange de l'image) ; les échéances ni urgentes ni réglementaires sont vertes (pas de gris) ; deux libellés voisins peuvent se toucher sur la frise. Aperçu `npm run apercu -- MR09` : écart brut 27,5 % à ± 2 px (silhouette dessinée, cartes 14 px plus hautes, frise 18 px plus haute ; données de l'image posées à la main). |
| MR10 | Créer · Photos de chantier | mixte | fait | Écran sur la route NOUVELLE `/photos-chantier` (route montée dans `appRoot.internal.tsx` ; entrée de registre « Photos de chantier », action Fabriquer, en attente de la correction de `check:navigation` par S5). Construit sur `interventions` : une intervention porte AU PLUS une photo par volet (avant, pendant, après), lue en `data:` ; aucun nouvel hébergement de fichiers (§1.27 n° 7). Un dossier = les interventions d'un client. Date de la photo = celle de l'intervention, lieu = son adresse ; absents du dépôt : date et lieu « à la prise », auteur, orientation (pas de « Même angle, même cadrage » sans elle), signature du client (case « Signature du client » jamais cochée, ouvre `/signature`), partage par lien protégé (« Partager au client » inactif, avec la raison), rappel interne (suggestion « Compléter » masquée sur données réelles). « Ajouter des photos » ouvre les interventions. Comparateur : glisser (curseur ← → par pas de 5 %), côte à côte, superposer (fondu) ; repères dessinés quand la photo n'a pas d'image. Règles de la fiche gardées : complétude en tiers (avant, après, signature) et « jours de travaux » = première photo pendant → dernière après, donc l'aperçu n'affiche pas 72 / 60 / 25 % ni « 16 jours » de l'image (67 / 67 / 33 %, 8 jours). Aperçu `npm run apercu -- MR10` : écart brut 33,1 % à ± 2 px (repères dessinés à la place des photos, données de l’image posées à la main). |
| MR11 | Créer · Qualité et contrôles | mixte | fait | Écran substitué sur `/controles` (module `checklists`). Branché sur `checklists` (titre, points) et `checkRuns` (points cochés, auteur, date) : un passage enregistré est un contrôle signé, un point coché « Conforme », un point non coché « À vérifier ». Le dépôt ne retient pas « non conforme » ni « sans objet » : ces deux choix sont grisés avec la raison (§1.27 n° 4). « Nouveau contrôle » : choix d'une liste puis brouillon local, écrit dans `checkRuns` à « Signer le contrôle » (possible quand tous les points sont conformes ; signature électronique H12 non reliée). Absents du dépôt : sections, criticité et preuve par point, écarts (cause, responsable, échéance : le Pareto dit pourquoi il est vide, « validés du premier coup » masqué), chantier ou client, action corrective (bouton inactif avec la raison). Règles de la fiche : conformité provisoire tant que des points restent à vérifier, couleurs 90 / 70, Pareto des écarts ouverts ou clos du mois, cumul et seuil 80 %, « où ils arrivent » 3 + Autres. Écart à l'image : « validés du premier coup » compte sur les contrôles signés (18 sur 25), pas sur 26. Aperçu `npm run apercu -- MR11` : écart brut 21,9 % à ± 2 px (contrôle et écarts de l'image posés à la main). |

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
| H18 | Outils · Paramètres | mixte | en cours (préparation) | Existant inventorié (`preparation/LOT-07-outils.md` §3) ; attend la fiche v4, puis le socle v4. |
| H19 | Outils · Membres et accès | mixte | en cours (préparation) | Existant inventorié (§4 de la note). Droits provisoires livrés (`src/refonte/outils/droits.ts`, §1.34 n° 2 à 5) : rôles du serveur, seul `owner` publie, `owner` et `admin` gèrent les connecteurs. Attend la fiche v4. |
| H20 | Outils · Automatisations | mixte | en cours (préparation) | Couture `@edition/automatisations` posée (§1.22 n° 4) : le moteur actuel reste tel quel dans les deux éditions ; l'interne exécute en plus les règles `'flux'` (`src/refonte/outils/`), en entier ou pas du tout ; la cliente reçoit un jumeau vide. Écran : après le socle v4. |
| H21 | Outils · Connecteurs | mixte | en cours (préparation) | 14 tarifs relevés le 14 nov. sur les pages officielles, tels que publiés (§1.34 n° 7) : 7 en euros (Mailjet, Gmail et Google Agenda par leurs API, Stripe, Mollie, GoCardless, OVHcloud SMS) et 7 en dollars (Postmark, Resend, Vercel, Netlify, GitHub, Slack, Twilio). Les autres restent « à relever » (détail dans `rapports/S6-outils.md`). Écran : après le socle v4. |
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

**Garde** : `check:outils` (22 contrôles, en CI).

**Manque aux données** : un champ d'échéance des tâches (une tâche « à échéance » d'un flux attend) ; le montant et l'expéditeur dans les sources du moteur de H20 (un SI « montant » ou « expéditeur connu » attend).

**Modèle des connecteurs** (LOT-12, S9 en pause) : devise, plafond par transaction et prix par personne ajoutés par S6 le 14 nov., avec l'accord du CO (§1.34 n° 7).

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

Brief : `07-ESPACE-DEV.md`. Fiches : [`fiches/LOT-11/`](fiches/LOT-11/00-COMMUN.md), relues par Harun le 12 nov. (tableau en tête de `00-COMMUN.md`), alignées sur §1.17, §1.19 et §1.23. Préparation : [`preparation/LOT-11-developpement.md`](preparation/LOT-11-developpement.md). **Les 7 écrans sont construits** (14 nov., feu vert §1.35) dans `src/refonte/developpement/`, garde `check:developpement` (67 contrôles, en CI). Rapport : [`rapports/LOT-11.md`](rapports/LOT-11.md).

- **Source des écrans** (`donnees.tsx`) : amn-api n'a aucune collection pour le lot. Les jeux fictifs de SIM ne s'affichent que pour un compte d'essai `@exemple.test`, avec l'étiquette « Données d'exemple » ; tout autre compte voit l'état « à brancher », jamais une donnée inventée. L'Éditeur de flux lit et écrit les vraies règles du moteur de H20 (collection `automations`, format de S9).
- **Registre et barre** : les 6 écrans sont déclarés (`modules/declarations/developpement.ts`, famille `developpement`, teinte `outils`, `a86c470`) et les deux signaux de la barre ont leur source (`compteurs/developpement.ts`). T1 (14 nov.) : les 7 routes sont montées dans la coquille v4, rien n'est coupé à 390 px, paquet client identique.
- **Fidélité (§1.40)** : aperçus dans le dépôt, `npm run apercu -- DEV-<id>` (`ensemble`, `projets`, `deploiements`, `serveur`, `editeur`, `couts`, `modeles-sites`, `modeles-sites-code`), sur les jeux de SIM à l'état rempli. Les écrans exposent leur vue seule (`EnsembleDev`, `ProjetsDev`… : données passées) ; l'aperçu de l'éditeur pose une règle fictive, celui des modèles huit pages fictives (`scripts/apercu/modeles-exemple.ts`). Écarts justifiés : [`justifies-LOT-11.json`](../qualite/fidelite/justifies-LOT-11.json). Mesures ci-dessous : brut / disposition (couleur ± 10).
- **Cibles de 34 px (§1.39)** : zone de clic invisible sur les boutons du socle, les puces, les jetons et les noms de poste ; lignes de « À regarder » du hub à 35 px. Relevé sur les 8 aperçus : aucune cible sous 34 px.

| ID | Écran | Type | État | Écart / note |
|---|---|---|---|---|
| DEV-ensemble | Développement · Vue d'ensemble | nouveau | fait | `/ensemble/developpement` (substitution, 8e hub). Un jeton par poste (« deux au plus ») pour tenir au-dessus de la barre Ajmani ; « Personnaliser » inactif (réordonner : plus tard). Pas d'image de référence |
| DEV-projets | Développement · Projets de code | nouveau | fait | carte d'activité par semaine (le jeu n'a pas de commits par jour : aucune case inventée) ; « tests verts » = part des dépôts verts. Écart 39,3 % / 17,5 % |
| DEV-deploiements | Développement · Déploiements | mixte | fait | `PageDeploiements.tsx`. Total mesuré de bout en bout ; « Revenir » : une ligne de confirmation sauf Aperçu (§1.23) ; « Déployer » et « Planifier » inactifs jusqu'au connecteur Hébergement ; cible « Interne » inerte. Écart 34,0 % / 14,8 % |
| DEV-serveur | Développement · Serveur et santé | nouveau | fait | « Redémarrer » secondaire et inerte, « Relancer » inerte (LOT-13) ; courbes cadrées sur la plus haute mesure. Écart 45,7 % / 19,8 % |
| DEV-editeur | Développement · Éditeur de flux | mixte | fait | format de S9, règles du moteur de H20 ; « Éditeur de flux » partout (§1.17 n° 4) ; titre du bloc Si = libellé de S9 (le format ne nomme pas la condition) ; « Tester » attend le connecteur de la boîte. Écart 53,6 % / 16,6 % (règle fictive posée par l'aperçu) |
| DEV-couts | Développement · Coûts et API | nouveau | fait | comptes calculés (§1.17 n° 5) ; aucun plafond imposé (Harun) ; tableau = connecteurs branchés, « À brancher plus tard » = les autres (les jeux de SIM ne portent pas la catégorie du catalogue de S9). Écart 34,1 % / 15,1 % |
| DEV-modeles-sites | Développement · Modèles de sites (et vue code) | nouveau | fait | famille Développement (§1.17 n° 3), néon ; aucun modèle livré avant la relecture de Harun ; ajoutés gardés sur le poste. Image de référence en v3 grise avec sa propre barre ; l'état vide de l'application (75,6 %, T1) attend les modèles relus. Aperçu rempli : 68,5 % / 30,6 % (bibliothèque, pages fictives), 79,1 % / 4,8 % (vue code : même disposition, autre texte) |

### LOT-12 · Connecteurs et autonomie — `claude/refonte-connecteurs` — aucun écran

Tenue par S9. Pas d'écran à soi : H21 est à LOT-07 (S6), DEV-couts et DEV-editeur à LOT-11 (S8).

- **État** : préparation fusionnée (`890522d`, dans `4254e7a`, §1.22). Décisions du §1.22 appliquées dans le modèle : prise Webhooks « chez nous » (catégorie « Événements reçus »), « Demander un connecteur » pour Notion, prise arrêtée dessinée comme libre avec « arrêtée le … », valeurs de départ réunies et modifiables (`reglages.ts`). Relances alignées sur la fiche MC07 (§1.31) : 5 jours entre deux relances d'une facture (3 à 14), plage clients lun.–ven. 09:00–18:00, 3 relances au plus par facture, une relance au plus par client sur 7 jours glissants ; `reglages.ts` est la seule source, S1 la lit. Branche : voir le dernier message de S9.
- **Contenu** : `src/refonte/connecteurs/` (catalogue, tarifs à relever, cycle en 3 clics, règles de H21 et de DEV-couts, flux Quand / Si / Alors rangés dans le moteur de H20, moteurs locaux, liste « Demandé à amn-api »). Note : [`preparation/LOT-12-connecteurs.md`](preparation/LOT-12-connecteurs.md).
- **Gardes** : `check:connecteurs` (103 contrôles, en CI), plus typecheck des deux éditions, lint, `check:donnees`. `check:contacts` (S1) fige encore les anciennes valeurs (7 jours, 08:00–19:00) : à mettre à jour par S1 avec cette fusion.
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

# DEV-projets · Projets de code
Développement · LOT-11 · Image : `images/DEV-projets.png` · Statut : NOUVEAU
Parcours : Développement / Projets de code

> Règles communes de l'espace (coquille, couleurs, tutoiement, secrets, local d'abord) : [`00-COMMUN.md`](00-COMMUN.md).

## 1. Rôle
Voir d'un coup d'œil **tous les dépôts de code que l'équipe suit** : s'ils sont verts, ce qui y bouge, ce qui part bientôt en ligne, et les trois choses à regarder aujourd'hui. On ouvre un dépôt pour agir ; cet écran ne sert ni à lire le code ni à le modifier.

## 2. Nouveau ou re-habillage ?
- **Nouveau (à créer)** : (a) le bandeau d'activité (commits de la semaine, déploiements, part de tests verts, carte d'activité) ; (b) les 6 cartes de dépôt (état des tests, barre des langages, branche et derniers commits, cible de mise en ligne, tickets, courbe d'activité de 7 jours) ; (c) la liste « À regarder aujourd'hui » ; (d) la liste « Prochaines versions » ; (e) « Importer un dépôt ».
- **Existant réutilisé** : les tickets d'un dépôt viennent de **H03 Missions et tickets** (`TasksScreen`, `/tasks`) ; l'échéance d'un certificat vient du module **SSL** (`SslScreen`, `sslSummary`, `/ssl`) ; un dépôt de site client peut être relié à sa **pièce du Studio** (`studioPieces`, `src/bureaux/studio/`, champs `url`, `livraison.version`) ; « Prochaines versions » lit les **déploiements planifiés** de DEV-deploiements.
- **Dépend d'un connecteur** : la liste des dépôts, les commits, les branches, les langages et l'état des tests viennent du **connecteur Code** (LOT-12 : Git local ou forge auto-hébergée d'abord, GitHub / GitLab en option). *À confirmer dans le code* : aucun connecteur Code n'existe aujourd'hui dans le dépôt.

## 3. Disposition par zones
Coordonnées relatives à la zone principale (x = 0 au px absolu 252 ; y = 0 au px absolu 60), relevées sur l'image (pas de `_data` pour les images `DEV-*`), à ± 2 px.
- **Z1 En-tête de page** : h1 « Projets de code » (30 px / 700, dégradé `#FFF → b`), sous-titre 13.5 px T3 ; à droite, deux boutons de 36 px alignés sur le bord droit (y = 44) : secondaire « Importer un dépôt » (icône +) puis **primaire** « Nouveau projet » (icône +).
- **Z2 Bandeau d'activité** : carte **1108 × 120** à (40, 97). À gauche trois grands chiffres (≈ 36 px / 700, dégradé `#FFF → a` ; le troisième en dégradé `#FFF → b`) avec leur libellé 13 px T3 dessous, espacés de ≈ 60 px. À droite la **carte d'activité** : 31 colonnes × 7 rangées de cases de 10 px au pas de 13 px (≈ 403 × 88), bord droit à 20 px du bord de la carte.
- **Z3 Grille des dépôts** : 3 colonnes × 2 rangées de cartes **360 × 144**, x = 40 / 414 / 788, y = 235 / 394 (écarts 14 et 15). Dans une carte (padding 16) : tuile d'icône 32 px (branche) teintée, nom en monospace 14 px / 600 et description 13 px T3 sur deux lignes, pastille d'état à droite ; barre des langages de 5 px pleine largeur ; ligne des langages 12 px T4 ; deux lignes basses (monospace 12 px T2, puis 12 px T4) ; courbe de 7 jours ≈ 94 × 24 en bas à droite.
- **Z4 « À regarder aujourd'hui »** : carte **638 × 204** à (40, 554) : titre 15 px / 600 et compteur à droite, 3 lignes de ≈ 53 px séparées par un filet (point d'état 8 px, nom du dépôt en monospace 600, texte T3, bouton secondaire « Ouvrir » de 70 × 36 à droite).
- **Z5 « Prochaines versions »** : carte **456 × 204** à (692, 554) : titre, 3 lignes de ≈ 48 px (date 13 px T3 à gauche, colonne de texte à x + 70 : titre 13.5 px / 500 T1, sous-titre 12 px T4), filet entre les lignes.
- **Z6 Barre Ajmani** : standard, (40, 774) 1108 × 46.
- **Barre latérale** : famille Développement dépliée, module actif « Projets de code » (`00-COMMUN.md` §1).

## 4. Contenu affiché (textes exacts)
**En-tête** : « Projets de code » · « 6 dépôts suivis · 1 test en échec à regarder » · « Importer un dépôt » · « Nouveau projet ».

**Bandeau** : « 47 » « commits cette semaine » · « 9 » « déploiements » · « 98 % » « tests verts ».

**Cartes de dépôt**
| Nom | Description | Pastille | Langages | Ligne 1 (monospace) | Ligne 2 |
|---|---|---|---|---|---|
| amn-desktop | Poste de travail de l'équipe | Tests verts | TypeScript · CSS · HTML | claude/refonte-socle · 3 commit… (tronqué) | v1.2.50 interne · 4 tickets |
| amn-api | Serveur de l'application | Tests verts | TypeScript · Python | main · dernier commit hier | serveur AMN · 2 tickets |
| amn-site | Site vitrine amndevsec.fr | Tests verts | HTML · CSS · TypeScript | main · dernier commit il y a 3 j | Vercel prod · 1 ticket |
| optique-avenue | Refonte du site d'un client | 1 test en échec | TypeScript · CSS · HTML | claude/refonte-v2 · 6 commits | Aperçu Vercel · 3 tickets |
| aura-prestige | Site de location de véhicules | Tests verts | HTML · CSS · TypeScript | main · dernier commit il y a 2 j | Vercel prod · 2 tickets |
| portfolio | Site personnel, candidatures | Tests verts | HTML · CSS | main · dernier commit il y a 5 j | Vercel prod · 0 ticket |

Pastilles : « Tests verts » (succès), « 1 test en échec » (attention). Couleur de la courbe : celle de la tuile d'icône (bleu, violet, vert, orange, violet, gris).

**À regarder aujourd'hui** : « À regarder aujourd'hui » · « 3 points ».
1. point orange · « optique-avenue » · « 1 test en échec depuis ce matin » · « Ouvrir »
2. point rouge · « amn-desktop » · « 4 tickets ouverts, dont 1 bloquant » · « Ouvrir »
3. point orange · « amn-site » · « le certificat expire dans 18 jours » · « Ouvrir »

**Prochaines versions** : « Prochaines versions ».
| Date | Titre | Sous-titre |
|---|---|---|
| jeu. 12 | amn-desktop v1.2.51 | 4 tickets restants |
| ven. 13 | amn-api, correctif des sessions | prêt à déployer |
| ven. 20 | optique-avenue en ligne | validation du client |

**Barre Ajmani** : « Demande à Ajmani, ou dis ce que tu veux faire ».

## 5. Composants du socle utilisés
`Sidebar`, `Header`, `PageHead` (2 boutons, un seul primaire), `Card`, `IconTile` (32 px, teinte de l'icône, 06 §3 règle 14), `StatusPill`, `Sparkline` (`MiniCourbe`), `HeatCell`, `Button` (secondaire 36 px), `LiveDot` (aucun ici), `AjmaniBar`.
**Nouveaux composants** (propres au lot, dans `src/refonte/developpement/`) :
- `BandeauActivite` : trois grands chiffres + carte d'activité (31 × 7 `HeatCell`, 5 niveaux de `b` : 0, 18 %, 40 %, 65 %, 90 % ; *Proposition* pour les seuils).
- `CarteDepot` : la carte de dépôt (tuile, nom monospace, description, pastille, `BarreLangages`, lignes basses, courbe).
- `BarreLangages` : segments proportionnels de 5 px, séparés de 2 px, couleurs tirées des jetons d'état v4 (*Proposition* : TypeScript info, CSS violet, HTML orange, Python attention ; autres langages en gris de décor).
- `ListeARegarder` : lignes point + nom + texte + bouton (même brique que dans DEV-ensemble).
- `ListeVersions` : lignes date + titre + sous-titre.

## 6. Données et règles de calcul
- **Dépôt** (nouveau, via le connecteur Code) : nom, description, branche suivie, cible de mise en ligne, lien éventuel à une pièce du Studio, langages (part en octets), état des tests du dernier passage, commits datés. Aucun jeton d'accès ne transite par l'écran.
- **« n dépôts suivis »** = dépôts actifs (non archivés). **« n test(s) en échec à regarder »** = nombre de dépôts dont le dernier passage de tests est en échec ; si 0 : « tout est vert » (*Proposition*).
- **Commits cette semaine** = commits de toutes les branches suivies depuis lundi 00:00 (heure de Paris). **Déploiements** = déploiements lancés cette semaine (même compte que le sous-titre de DEV-deploiements, « 9 cette semaine »). **Tests verts** = passages de tests réussis / passages de la semaine, arrondi à l'entier (*Proposition* ; *à confirmer* : part des tests ou part des passages).
- **Carte d'activité** = commits par jour, 7 rangées (lundi en haut) × 31 semaines, la dernière colonne = semaine en cours (*À confirmer* : 31 colonnes relevées sur l'image). Niveau = quintile du nombre de commits du jour sur la période (*Proposition*).
- **Pastille** : « Tests verts » si le dernier passage est réussi ; « n test(s) en échec » sinon ; « Pas de tests » (gris) si le dépôt n'en a pas (*Proposition*).
- **Ligne 1** : branche suivie, puis « n commits » non encore en ligne si la branche n'est pas la principale, sinon « dernier commit <date relative> » (« hier », « il y a 3 j »). Tronquée par « … » si elle dépasse la carte.
- **Ligne 2** : cible de mise en ligne lisible (« Vercel prod », « Aperçu Vercel », « serveur AMN », « v1.2.50 interne ») · tickets ouverts liés au dépôt dans H03 (« 0 ticket », « 1 ticket », « 4 tickets »).
- **Courbe** : commits par jour sur 7 jours.
- **Tri** (*Proposition*) : dépôts en échec d'abord, puis par dernier commit le plus récent. Au-delà de 6 dépôts, la grille défile dans sa zone.
- **À regarder aujourd'hui** = 3 points au plus, par gravité puis ancienneté : test en échec (orange), ticket bloquant ouvert (rouge), certificat qui expire dans 30 jours ou moins (orange, seuil de `SslScreen` *à confirmer dans le code*), déploiement échoué non repris (rouge). Compteur « n points » = total, même au-delà de 3.
- **Prochaines versions** = déploiements planifiés à venir (DEV-deploiements) et jalons de version de H03, triés par date, 3 au plus. Sous-titre : tickets restants avant la version, « prêt à déployer » si 0 ticket et tests verts, ou l'attente nommée (« validation du client » : demande de validation ouverte sur la pièce du Studio).

## 7. Interactions
- Clic sur une carte de dépôt : ouvre la fiche du dépôt (*Proposition* : panneau latéral avec branches, derniers commits, tickets, déploiements ; écran à dessiner plus tard). Survol : bordure plus claire, relèvement de 1 px (150 ms).
- Clic sur la pastille « 1 test en échec » : ouvre le journal du passage de tests en échec.
- « Ouvrir » (À regarder) : ouvre l'élément concerné (journal de tests, ticket dans H03, certificat dans SSL).
- Clic sur une version : ouvre le déploiement planifié dans DEV-deploiements, ou le jalon dans H03.
- **« Importer un dépôt »** : parcours du connecteur Code de H21 (choisir la forge, autoriser chez elle, choisir le dépôt) ; aucun jeton saisi ni affiché ici. Sans connecteur Code branché : le parcours commence par « Brancher un outil ».
- **« Nouveau projet »** : *Proposition* : crée un dépôt local (Git sur le poste ou forge auto-hébergée) à partir d'un nom et, au choix, d'un modèle de DEV-modeles-sites ; le relie à un projet existant (MJ01) ou à une pièce du Studio.
- Clavier : flèches entre les cartes, Entrée ouvre ; `⌘N` = Nouveau projet.
- **Mouvement** : entrée échelonnée des cartes (45 ms), courbes tracées (1,3 s), cases de la carte d'activité en fondu. Aucune animation continue sur cet écran, hors curseur de la barre Ajmani. `prefers-reduced-motion` coupe tout.

## 8. États
- **Aucun dépôt** : carte `EtatVide` pleine zone, icône branche, « Aucun dépôt suivi pour l'instant », « Importe un dépôt ou crée un projet : tu verras ici ses tests, ses commits et ses mises en ligne. », boutons « Importer un dépôt » (primaire) et « Nouveau projet ». Le bandeau affiche 0 et « — ».
- **Connecteur Code non branché** : bandeau d'information dans la zone « Le connecteur Code n'est pas branché : les dépôts ne se mettent plus à jour. » + « Brancher » (H21). Les cartes gardent leur dernier état connu, grisées, avec « mis à jour il y a … ».
- **Tout est vert** : sous-titre « 6 dépôts suivis · tout est vert » ; « À regarder aujourd'hui » affiche « Rien à regarder aujourd'hui. » (une ligne, T3).
- **Chargement** : squelettes de 6 cartes et du bandeau, mêmes dimensions.
- **Erreur** : bandeau « Les dépôts n'ont pas pu être chargés. » + « Réessayer ».
- **Hors ligne** : dernière version enregistrée, bandeau discret « Hors ligne ».
- **Droits** : un membre sans droit de développement voit tout en lecture, sans « Importer un dépôt » ni « Nouveau projet ».

## 9. Éléments ludiques
- « 98 % tests verts » et la carte d'activité : faits encourageants, jamais par personne.
- *Proposition* : quand tous les dépôts sont verts, le sous-titre dit « tout est vert » (une phrase, sans célébration).
- Ce qu'on ne fait pas : pas de classement des développeurs, pas de commits par personne, pas de série individuelle.

## 10. Ajmani
- Pas de carte de suggestion sur cette image. *Proposition* : quand un test échoue depuis plus de 2 h, une `InlineSuggestion` peut apparaître en tête de « À regarder aujourd'hui » : « Le test d'optique-avenue échoue depuis ce matin. Je te montre la ligne ? » + « Voir le journal ».
- Barre ⌘J, invites : « Quels dépôts ont un test en échec ? », « Qu'est-ce qui part en ligne cette semaine ? », « Crée un projet à partir du modèle Atelier Marceau ».

## 11. Adaptation (fenêtre réduite, mobile)
- Sous 1280 px : grille de dépôts en 2 colonnes ; « À regarder » et « Prochaines versions » l'une sous l'autre ; la carte d'activité passe à 16 colonnes.
- Sous 900 px : une carte par rangée ; le bandeau garde ses 3 chiffres, sans carte d'activité.
- Mobile (LOT-09) : *Proposition* : lecture seule (état des tests, « À regarder »), dans MB06.

## 12. Critères de réussite
- [ ] Identique à `images/DEV-projets.png` à ± 2 px : bandeau 1108 × 120, cartes 360 × 144 en 3 × 2, cartes du bas 638 × 204 et 456 × 204 ; annotations de maquette absentes (`00-COMMUN.md` §1).
- [ ] Aucune valeur de l'image en dur : tout vient des dépôts (connecteur Code), de H03, de SSL et des déploiements planifiés.
- [ ] Aucun jeton ni identifiant d'accès affiché, même masqué.
- [ ] Un seul bouton primaire (« Nouveau projet »).
- [ ] États vide, connecteur non branché, tout vert, chargement, erreur, hors ligne présents.
- [ ] Clavier complet, focus visible ; `prefers-reduced-motion` respecté.
- [ ] `typecheck`, `lint`, `check:socle`, `check:developpement` verts.

## 13. Pièges
- « 9 déploiements » doit être le même nombre que « 9 cette semaine » de DEV-deploiements : une seule requête.
- « 0 ticket » s'écrit au singulier (« 0 ticket », « 1 ticket », « 2 tickets »).
- La couleur d'une carte (halo et courbe) suit sa tuile d'icône ; la carte en échec prend la teinte attention. Ne pas confondre avec la couleur de famille.
- Les noms de dépôts (amn-desktop, optique-avenue…), le domaine du site vitrine et les versions sont des exemples : rien en dur.
- Le connecteur Code n'existe pas encore : ne pas appeler une forge directement depuis l'écran ; attendre le modèle de LOT-12.

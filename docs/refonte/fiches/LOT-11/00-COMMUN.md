# LOT-11 · Espace Développement — règles communes aux fiches

> Écrites par S8 le 12 nov. 2026, d'après les 7 images `DEV-*` du dossier v4, `07-ESPACE-DEV.md`, `06-V4-NEON-ET-TUTOIEMENT.md`, `01-SOCLE-DESIGN.md` §0 et le gabarit `02-FICHE-MODELE.md`. Les images restent hors du dépôt.
> Ce qui n'est pas lisible dans une image est marqué **Proposition** ou **À confirmer dans le code**. Rien ici ne décrit une faiblesse de sécurité ; toutes les données citées sont fictives.

## Les fiches

| ID | Écran | Image | Statut | Fiche |
|---|---|---|---|---|
| DEV-ensemble | Vue d'ensemble | aucune (proposition) | NOUVEAU | [`DEV-ensemble.md`](DEV-ensemble.md) |
| DEV-projets | Projets de code | `images/DEV-projets.png` | NOUVEAU | [`DEV-projets.md`](DEV-projets.md) |
| DEV-deploiements | Déploiements | `images/DEV-deploiements.png` | MIXTE | [`DEV-deploiements.md`](DEV-deploiements.md) |
| DEV-serveur | Serveur et santé | `images/DEV-serveur.png` | NOUVEAU | [`DEV-serveur.md`](DEV-serveur.md) |
| DEV-editeur | Éditeur de flux | `images/DEV-editeur.png` | MIXTE | [`DEV-editeur.md`](DEV-editeur.md) |
| DEV-couts | Coûts et API | `images/DEV-couts.png` | NOUVEAU | [`DEV-couts.md`](DEV-couts.md) |
| DEV-modeles-sites | Modèles de sites (et vue code) | `images/DEV-modeles-sites.png`, `images/DEV-modeles-sites-code.png`, prototype `sources-neon/DEV-modeles-sites.html` | NOUVEAU | [`DEV-modeles-sites.md`](DEV-modeles-sites.md) |

Sous-modules réutilisés, **avec leur fiche et leur lot** (une seconde entrée dans l'espace, rien de plus) : H20 Automatisations, H21 Connecteurs, H24 Coffre-fort (LOT-07), H03 Missions et tickets (LOT-01), ME05 Base de connaissances (LOT-03), MO03 Sauvegardes (LOT-07). Précédent validé : MO02 et CY07, « un seul module, deux entrées de menu » (`PLAN-10NOV.md` §3).

## Décisions de Harun (relecture du 12 nov.)

| # | Question | Décision | Fiche |
|---|---|---|---|
| 1 | Vue d'ensemble sans image | **Validée** telle que proposée | DEV-ensemble |
| 2 | Confirmation de « Revenir » | **Une ligne en production, aucune sur les versions d'essai** | DEV-deploiements |
| 3 | Modèles de sites ajoutés | **Sur ce poste** ; phrase « Il reste sur cet ordinateur. » ; partage avec l'équipe = évolution (demande le serveur) | DEV-modeles-sites |
| 4 | Plafond mensuel | **Aucune valeur imposée** ; montant demandé au premier branchement d'un outil payant ; alerte à 80 % | DEV-couts |
| 5 | Suggestion SMS | « **payer au-delà du forfait** » | DEV-couts |
| 6 | Temps gagné | **Estimations de S8 gardées**, ajustées plus tard par Harun | DEV-editeur |
| 7 | Textes des 8 modèles livrés | **Relus par Harun avant leur entrée**, sans bloquer la construction | DEV-modeles-sites |
| 8 | Téléphone | **Lecture seule** partout ; mises en ligne, retours arrière et redémarrages sur l'ordinateur | toutes |

Décisions du CO déjà reportées : `STATUT.md` §1.17 et §1.19 (barre latérale, « Éditeur de flux », comptes calculés, famille des modèles de sites, 8e hub, format Sinon / Puis par S9, « Redémarrer » secondaire et inerte).

## 1. Coquille commune aux images `DEV-*`

- **En-tête** standard : fil d'Ariane « Développement / <écran> » (13.5 px, T3 puis T1), pile d'avatars « 3 en ligne », cloche avec compteur, pastille « La Garde veille, tout est en ordre ». Rien de propre au lot.
- **Barre latérale** (décision du CO, `STATUT.md` §1.17 n° 1) : les images montrent la famille « Développement » dépliée sur ses **13 lignes**. **La section vient de l'image** : « ESPACES DE TRAVAIL », juste au-dessus de « SURVEILLANCE », et elle contient Développement. **La sous-liste suit le socle §0.1** : 5 lignes au plus (« Vue d'ensemble » d'abord, le module actif toujours visible), puis « + N autres ». L'écart avec les 13 lignes de l'image est noté. La section et l'entrée sont posées par S0 (passe finale v4), pas par ce lot.
- **Ordre des 13 lignes** de la famille (image) : Vue d'ensemble, Projets de code, Déploiements, Serveur et santé, Éditeur de flux, Automatisations, Connecteurs, Coûts et API, Coffre-fort, Modèles de sites, Missions et tickets, Sauvegardes, Base de connaissances.
- **Signaux de la ligne « Développement »** (`PLAN-10NOV.md` §3.2) : déploiements en cours et tests en échec. *Proposition* : un compteur = tests en échec + déploiements échoués non repris ; un voyant vivant bleu tant qu'un déploiement est en cours.
- **Annotations de maquette, à ne pas reproduire** : les étiquettes « À CRÉER » de la barre latérale, la pastille « Maquette · données d'exemple » à droite du titre, et le suffixe « · EXEMPLE » de « COÛT DU MOIS · EXEMPLE » (DEV-serveur). Ce sont des repères pour la relecture, pas de l'interface.
- **Barre Ajmani** standard v3 (46 px, collée en bas à y = 774 dans la zone principale) : « Demande à Ajmani, ou dis ce que tu veux faire » · « Entrée pour envoyer » · `⌘J`. Bord en dégradé a → b (06 §3 règle 12).

## 2. Couleurs (v4)

- Famille **Développement** : `--fam-a` = `#6EA8FF`, `--fam-b` = `#5EE6A8` (06 §1), **posées par la coquille** (`data-famille-active="developpement"` ; jetons `--socle-fam-developpement-a|b` du socle v4). Aucun écran n'écrit ces valeurs : il lit `var(--fam-a)` / `var(--fam-b)`.
- États v4 : succès `#5EE6A8`, info `#6EA8FF`, attention `#FFBE5C`, danger `#FF6B7A` ; violet `#A58BFF`, orange `#FFA463`, rose `#FF7EB6`, sarcelle `#4FE3C1` (06 §2). Toujours un point ou une pastille + un libellé, jamais la couleur seule.
- Rendu néon (06 §3) : fond à deux halos, cartes en dégradé `#19191C → #111113` avec halo de famille dans un coin alterné, h1 30 px / 700 en dégradé `#FFF → b`, grands chiffres en dégradé `#FFF → a`, bouton principal en dégradé 135° a → b avec texte `#0B0B0C`, pastilles d'état (fond 14 %, bord 38 %), lueurs sur points, anneaux, courbes et barres de progression.

## 3. Tutoiement

L'interface tutoie (06 §4, `_data/tutoiement.json`). Les images `DEV-*` sont déjà au tutoiement, sauf le prototype des modèles de sites (vouvoiement) : sa fiche donne les textes passés au tutoiement. **Restent au vouvoiement** : tout texte destiné à un client (courriel de réponse automatique, contenu d'un modèle de site, page publique).

## 4. Secrets, clés et accès (règle absolue de l'espace)

- Jetons d'accès aux forges, clés d'hébergeur, clés d'API payantes, variables d'environnement d'un déploiement : **côté serveur, chiffrés, toujours affichés masqués**, jamais dans le code, un journal, une capture, un chat, un ticket ni un dépôt.
- Un écran de l'espace n'affiche **jamais** une valeur, même masquée, sauf le Coffre-fort (H24) qui a ses propres règles. Il affiche au plus l'**état** (« connecté », « à rebrancher », « expire le … ») et le **nom** d'une variable.
- Brancher un outil passe par le parcours de H21 (autorisation chez le fournisseur ou saisie dans le Coffre-fort), jamais par un champ de cet espace.
- Aucun nom d'hôte, adresse, port ni nom de machine n'apparaît dans l'espace (dépôt public, `REGLES.md`).

## 5. Local d'abord, API payante en option (`PLAN-10NOV.md` §4)

- Chaque action de l'espace a une **version locale gratuite** (sur le poste ou sur notre serveur) ; une API payante est un **connecteur facultatif de H21**, activé ou arrêté en **trois clics au plus**, **coût affiché avant** (tarif, source, date du relevé ; jamais deviné), et **sous le plafond mensuel** de DEV-couts.
- Le modèle des connecteurs (catalogue, mode, état, coût) est celui de **LOT-12 (S9)** : ces fiches le lisent, elles ne le redéfinissent pas. Tant qu'il n'est pas livré, les écrans qui en dépendent (DEV-projets, DEV-deploiements, DEV-couts, une partie de DEV-editeur) affichent « connecteur à brancher » et restent utilisables en lecture.
- **DEV-serveur** dépend de la **décision serveur (LOT-13)**, reportée (`STATUT.md` §1.16) : écran construit sur données fictives, branché plus tard.

## 6. Données

Tous les noms (dépôts, clients, personnes), montants, dates et compteurs des images sont **fictifs** et ne sont jamais codés en dur. Jeux fictifs à demander à SIM par le CO : voir la note de préparation `docs/refonte/preparation/LOT-11-developpement.md` §6.

## 7. Vocabulaire

| Terme | Sens dans l'espace |
|---|---|
| Dépôt | un dépôt de code suivi (connecteur Code : Git local, forge auto-hébergée, ou GitHub / GitLab) |
| Déploiement | une mise en ligne d'une version d'un dépôt vers une **cible** (Aperçu, Préproduction, Production, Interne, Serveur AMN) |
| Revenir | remettre en ligne, sur la même cible, la dernière version réussie **avant** celle affichée |
| Flux | une automatisation dessinée en blocs Quand / Si / Alors / Sinon / Puis (même moteur que H20) |
| Mode | Local (fait par l'application, gratuit) ou API (fournisseur externe, payant) |

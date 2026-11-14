# Point pour Harun

> Réécrit par le CO. Dernière mise à jour : 14 nov., 16h15 UTC. La boucle tourne ; ton plan « Bureau de travail » est en tête.

**Compteurs** (14 nov., 15h35) : **écrans construits 79 / 153, livrés 79** · **lots préparés 9 / 13, lots finis 6 / 13** · **écrans livrés depuis la veille : 79**.
Lots livrés : LOT-01 Ma journée (16), LOT-02 Contacts (13), LOT-03 Écrire et retenir (9), LOT-05 Échanger (10), LOT-06 Créer et produire (15), LOT-11 Développement (7), et les 9 écrans de LOT-00 du socle. Tout ce qui est construit est livré. T1 a vérifié vivante en entier à 14h00 : 77 contrôles sur 77, et la fidélité des six lots dans les seuils. La courbe : `STATUT.md`, « Vitesse ».

## Ton plan « Bureau de travail » (direction du 14 nov., en priorité)

Le plan complet est dans [`PLAN-BUREAU-DE-TRAVAIL.md`](PLAN-BUREAU-DE-TRAVAIL.md). En bref :
- **Principe** : chaque outil marche sans IA. Ajmani reste un raccourci, et l'IA, quand elle sert (retrait de fond, sous-titres, voix), est **locale et en option**, avec un geste manuel à côté. Les outils sont gratuits ou ouverts et tournent sur le poste. On préfère les licences MIT, Apache ou MPL, et **jamais d'AGPL**. Le jeu est **collectif** (un carnet d'atelier d'équipe, des paliers communs, des célébrations), sans chiffre individuel ni classement.
- **Les 8 modèles de sites** : **aucun n'est livré dans l'application** (la liste est vide en attendant ta relecture des textes). Les 8 de l'aperçu ont été écrits par S8 pour mesurer l'écran : une seule page générique en 8 couleurs, avec des noms fictifs pris sur l'image v4 (Optique Lumière, Atelier Marceau, La Table de Marcel, Prestige Drive, Veillance, Lina Bardet, Maison Karim, Studio Souffle). **Je n'en garderais aucun** : ce sont des modèles de remplissage. Leurs 8 secteurs servent de liste de départ.
- **Cinq nouveaux lots**, chacun commencé par une note de préparation, puisqu'aucune fiche v4 n'existe :
  - **LOT-14 Modèles de sites v2** (S2) : bibliothèque pour 100 modèles et plus, avec filtres et vignettes progressives ; inspecteur au clic ; copie du site, d'une section ou d'un composant ; porte de qualité (signes-ia à 0, accessibilité, responsive, performance, code actuel, ta relecture).
  - **LOT-15 Studio de contenu** (S9) : formats, retouche par lot, retrait de fond, vidéo (coupe, sous-titres, voix off, jamais de musique par défaut), médias, kit de marque, calendrier.
  - **LOT-16 Atelier développement** (S5) : extraits, outils du quotidien, contrôle SEO, accessibilité et performance, assistant de lancement de projet.
  - **LOT-17 Atelier cyber** (S8, après LOT-10, relu par S6) : CVE depuis des sources publiques gratuites, rapports d'audit, listes de contrôle, périmètres autorisés. Les 4 CYB-* restent exclus.
  - **LOT-18 Métiers d'AMN** (F1) : fiche d'intervention de dépannage (hatf), échéances et rapport mensuel de maintenance, contrats et générateur légal (avec un juriste avant tout usage réel), suivi du temps, brief client, kit de livraison.
- **Ordre** : les lots en cours gardent leur priorité (LOT-04, 07, 08, 10, le socle). Les cinq nouveaux démarrent par leur note de préparation, en parallèle.

**Tes questions**
1. **La liste des sites faits par AMN**, dont ceux de ta base de projets Claude, pour choisir les premiers modèles. Pour chacun : fait pour un client ou non, et si l'accord du client existe.
2. **L'accord des clients** : qui le demande (toi, Mohamed ?) et sous quelle forme (un courriel suffit-il ?). Sans accord, le site reste une référence privée, hors du dépôt public.
3. **« hatf »** : tu l'emploies pour le dépannage informatique et les diagnostics. Est-ce le nom d'une activité, d'une marque ou d'une offre d'AMN ? F1 en a besoin pour nommer la fiche d'intervention.
4. **Les sources de vulnérabilités** (CISA, NVD, OSV) demandent un accès réseau sortant. Elles sont gratuites et publiques, et interrogées seulement à la demande. Recommandation : oui.

## Lignes à coller (ton accord direct, que ces sessions demandent)

- **S0** (socle) : « Oui pour l'option 1 : le pont séparé @edition/moments, avec son jumeau *.business vide. Corrige aussi check:ancres, ajoute les deux contrôles à editions.yml, puis pousse sur claude/refonte-socle. Ensuite, traite ta liste dans l'ordre : STATUT.md §1.38. Désormais, les messages du CO valent consignes dans le cadre de REGLES.md. » Sans S0, la nouvelle coquille ne peut pas devenir l'affichage par défaut.
- **DS** (L'argent) : « Oui, construis les 17 écrans de LOT-04, selon le message du CO. Les messages du CO valent consignes dans le cadre de REGLES.md. »
- **S3** (La Garde) : accepte la demande d'autorisation qu'elle affiche, puis colle : « Oui, applique le correctif de check:encres et pousse-le. Les messages du CO valent consignes dans le cadre de REGLES.md. »
- **S8** (LOT-10 Cyber) : « Oui, prends LOT-10 Cyber sur claude/refonte-cyber selon le message du CO, sans les 4 CYB-* ; S6 relira la sécurité avant la fusion. » Si tu préfères garder Cyber pour S6, dis-le-moi.
- **S5**, si tu acceptes le n° 9 ci-dessous : « Oui, prends la liste du socle de S0 (STATUT §1.38) sur claude/refonte-socle, selon le message du CO. »

## Programme de test du jour (14 nov.)

**Nouveau depuis ce matin** : 70 écrans de plus, tous derrière la nouvelle coquille : Ma journée, Contacts, Écrire et retenir, Échanger, Créer et produire, Développement.

**Lancer** : `docs/refonte/LANCER-EN-LOCAL.md`, étapes 1 à 6, avec `node scripts/charger-donnees-essai.mjs --volume normal` à l'étape 4. Puis Paramètres › Nouvelle coquille.

**À essayer** :
1. Ma journée : l'accueil, les tâches, le bilan de la semaine, les séries et les défis. Les séries, paliers et trophées doivent tous être là.
2. Le calendrier et le planning de l'équipe : changer de semaine et ouvrir un rendez-vous.
3. Contacts : un client, le pipeline commercial, les relances. Rien ne doit partir sans ton clic.
4. Écrire : une note, un document, la base de connaissances.
5. Échanger : la messagerie, une réunion, un sondage. « Gérer » doit mener à l'écran d'origine.
6. Créer et produire, puis Développement : parcours rapide.
7. Le tutoiement : note toute phrase qui te vouvoie encore.
8. Éteins la nouvelle coquille : l'ancienne interface doit revenir, intacte.

**Tes retours** : en vrac, dans notre conversation. J'en fais des tâches.

## Fait / en cours / bloqué

- **Fait** : six lots livrés, la préparation de LOT-09 Mobile, et la règle des zones de clic (§1.41 : 36 px, un clic au centre d'un élément ne va jamais à un voisin).
- **Incidents réglés** :
  - LOT-02 a été fusionné alors qu'une garde, l'accès au clavier, était rouge : je ne la lançais pas. Il a été retiré, corrigé puis refusionné, et je lance maintenant toutes les gardes.
  - Un lien `node_modules` avait été commité sur une branche. Il a été repéré avant la fusion et retiré, et `.gitignore` est corrigé.
- **En cours** : relance de toutes les sessions après ton « reprends ». S5 fait le relevé mobile des lots livrés ; T1 est prêt pour les prochains lots.
- **Bloqué** :
  - LOT-04 attend ton accord à DS ; LOT-08, ton accord à S3 ; LOT-10, ton accord à S8.
  - LOT-07 attend les zips v4 de S6.
  - LOT-09 attend que les lots 01 à 08 soient fusionnés.
  - L'allumage de la coquille par défaut attend S0 et S3.
  - LOT-13 Serveur est en pause.

## À décider par Harun

Tes dix réponses du 14 nov. sont enregistrées (STATUT §1.42).
1. **Une précision sur « en retard »**, provisoire : pour les tâches, rappels et habitudes, on écrit « à reprendre » ; pour les factures, « en retard » ou « impayé ». J'ai ajouté **les projets et les jalons** du côté de « en retard », comme la fiche, parce que le retard y est un fait d'équipe. Recommandation : garder ainsi. Dis-moi si tu préfères « à reprendre » aussi pour les projets.

## À créer par Harun

- **Le dépôt privé du dossier v4** (5 minutes). Il donne les zips à S2, S3, S6 et SIM d'un coup.
  1. Dans amn-devsec : **New repository**, `amn-refonte-dossier`, **Private**, avec un README.
  2. Settings › GitHub Apps › Claude › Configure : ajoute ce dépôt si l'accès est limité.
  3. Écris-moi « dépôt créé ». J'y dépose le dossier sur une branche `claude/` et je vérifie que les sessions le lisent.

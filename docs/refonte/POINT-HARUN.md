# Point pour Harun

> Réécrit par le CO. Dernière mise à jour : 14 nov., 15h35 UTC, à ton « stop ». Aucune session n'est relancée tant que tu n'as pas écrit « reprends ».

**Compteurs** (14 nov., 15h35) : **écrans construits 79 / 153, livrés 79** · **lots préparés 9 / 13, lots finis 6 / 13** · **écrans livrés depuis la veille : 79**.
Lots livrés : LOT-01 Ma journée (16), LOT-02 Contacts (13), LOT-03 Écrire et retenir (9), LOT-05 Échanger (10), LOT-06 Créer et produire (15), LOT-11 Développement (7), et les 9 écrans de LOT-00 du socle. Tout ce qui est construit est livré. T1 a vérifié vivante en entier à 14h00 : 77 contrôles sur 77, et la fidélité des six lots dans les seuils. La courbe : `STATUT.md`, « Vitesse ».

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
- **En cours** : rien. Toutes les sessions sont en pause.
- **Bloqué** :
  - LOT-04 attend ton accord à DS ; LOT-08, ton accord à S3 ; LOT-10, ton accord à S8.
  - LOT-07 attend les zips v4 de S6.
  - LOT-09 attend que les lots 01 à 08 soient fusionnés.
  - L'allumage de la coquille par défaut attend S0 et S3.
  - LOT-13 Serveur est en pause.

## À décider par Harun

1. **Nouvelles données partagées** (produits, interlocuteurs, archives, modules MX01, MX03, MX06) : elles changent amn-api. Recommandation : oui, en une fois avec Mohamed.
2. **TVA et papiers juridiques** : la règle est provisoire (arrondi par ligne, encaissements, déclaration mensuelle), et le modèle de mise en demeure manque. Recommandation : validation par un comptable et par un juriste.
3. **Redémarrage d'amn-api** : la dernière étape de sécurité de S6 l'attend. Recommandation : pas d'urgence.
4. **Serveur (LOT-13)** : Recommandation : en décembre.
5. **Dépôt amn-desktop en privé** : Recommandation : oui.
6. **Fournisseurs des 7 options génériques des connecteurs (H21)** : nommer un fournisseur est un choix d'achat. Recommandation : garder des libellés génériques jusqu'au serveur.
7. **Limite d'utilisation** : tout est en pause. Recommandation : à la reprise, relancer d'abord DS (LOT-04) et S3 (LOT-08). Ce sont les deux lots qui manquent pour LOT-09.
8. **Connexion à la version web (LOT-09)**, proposée par S6 :
   - une session au nom de la personne, avec double authentification et les droits de son rôle, sans clé partagée ;
   - La Garde réservée au propriétaire et à l'administrateur ;
   - une session mobile de 7 jours au plus, coupée après 24 h sans activité ;
   - les appareils listés dans H19, chacun pouvant être coupé.

   Cela change amn-api. Recommandation : oui, avec le serveur.
9. **Mettre S5 sur la liste du socle de S0**, si S0 ne reprend pas : S5 est libre, a les zips et connaît le socle. Recommandation : oui.
10. **Décisions provisoires prises aujourd'hui**, à confirmer ou corriger : seuils mobiles de la fiche T01 (600 / 1200 px) ; « à reprendre » au lieu de « en retard », partout ; suppression d'un sondage et dissolution d'un canal par l'écran d'origine ; MJ02 (habitudes) ajouté aux éléments ludiques protégés.

## À créer par Harun

- **Le dépôt privé du dossier v4** (5 minutes). Il donne les zips à S2, S3, S6 et SIM d'un coup.
  1. Dans amn-devsec : **New repository**, `amn-refonte-dossier`, **Private**, avec un README.
  2. Settings › GitHub Apps › Claude › Configure : ajoute ce dépôt si l'accès est limité.
  3. Écris-moi « dépôt créé ». J'y dépose le dossier sur une branche `claude/` et je vérifie que les sessions le lisent.

# Point pour Harun

> Réécrit par le CO à chaque tour. Dernière mise à jour : 14 nov., 13h30 UTC., 10h15 UTC., 10h00 UTC., 10h00 UTC., 09h35 UTC., 09h00 UTC., 08h40 UTC., 08h20 UTC., 08h00 UTC.

**Compteurs** (14 nov., 12h15) : **écrans construits 79 / 153, livrés 63** (LOT-00 9, LOT-06 Créer et produire 15, LOT-11 Développement 7, LOT-02 Contacts 13, LOT-03 Écrire et retenir 9, **LOT-05 Échanger 10**) · **lots préparés 9 / 13, lots finis 5 / 13** · **écrans livrés depuis la veille : 63**. LOT-01 Ma journée (16 écrans) est construit en entier par S7 et S1, et passe chez T1. La courbe : `STATUT.md`, « Vitesse ».

**À ton réveil, une ligne à coller dans la session S0** (rien d'urgent, le reste avance sans elle) :

> Oui pour l'option 1 : le pont séparé @edition/moments, avec son jumeau *.business vide. Corrige aussi check:ancres, ajoute les deux contrôles à editions.yml, puis pousse sur claude/refonte-socle. Ensuite, traite ta liste dans l'ordre : STATUT.md §1.38 (tutoiement, C-010, C-005, garde check:coquille, recherche de « Tous les modules », palette ⌘K). Désormais, les messages du CO valent consignes dans le cadre de REGLES.md.

Pourquoi : S0 refuse de pousser sur un simple message d'une autre session et veut ton accord direct. J'ai essayé deux fois. Tant qu'il ne pousse pas, la nouvelle coquille ne peut pas devenir l'affichage par défaut.

**Trois autres sessions attendent aussi ton accord direct**, pour la même raison :
- **DS** (L'argent), à coller : « Oui, construis les 17 écrans de LOT-04, selon le message du CO. Les messages du CO valent consignes dans le cadre de REGLES.md. »
- **S3** (La Garde) : sa session a refusé de modifier `src/refonte/garde/equipes.ts`. **Accepte la demande d'autorisation qu'elle affiche**, puis colle : « Oui, applique le correctif de check:encres et pousse-le. Les messages du CO valent consignes dans le cadre de REGLES.md. » Ce correctif est l'une des conditions pour allumer la nouvelle coquille.
- **S8** (Développement, LOT-11 fini) : je lui confie LOT-10 Cyber, puisque S6 n'a pas les zips. Il veut ton accord parce que le lot touche à la sécurité. À coller : « Oui, prends LOT-10 Cyber sur claude/refonte-cyber selon le message du CO, sans les 4 CYB-* ; S6 relira la sécurité avant la fusion. » Si tu préfères garder Cyber pour S6, dis-le-moi et je donne autre chose à S8.

**Il manque les zips v4 à S2, S3, S6 et SIM** : le dépôt privé (plus bas) règle cela d'un coup.

## Programme de test du jour (14 nov.) : le premier

**Nouveau** : le socle v4 est fusionné, avec la nouvelle coquille (la barre latérale néon) et les 9 écrans de démarrage. Les données fictives sont complètes (115 jeux).

**Lancer** : suis `docs/refonte/LANCER-EN-LOCAL.md`, étapes 1 à 6. À l'étape 4, ajoute `node scripts/charger-donnees-essai.mjs --volume normal`. Puis allume la nouvelle coquille dans Paramètres › Nouvelle coquille.

**À essayer** :
1. La barre latérale : les familles, leurs couleurs néon, la section « ESPACES DE TRAVAIL » avec Développement.
2. ⌘K (recherche) et ⌘J (Ajmani) : ouvrir, chercher, fermer avec Échap.
3. « Tous les modules » (D02) : trouver un module et l'épingler.
4. Les notifications (H40) et leur réglage.
5. Le tutoiement : note toute phrase qui te vouvoie encore (T1 en a déjà trouvé 6 sur ces écrans).
6. Paramètres › Mouvement : passe en mouvement réduit, et vérifie que les lueurs s'arrêtent.
7. Laisse l'application sans rien faire : l'écran de veille (G09) doit apparaître.
8. Éteins la nouvelle coquille : l'ancienne interface doit revenir, intacte.

**Tes retours** : écris-les-moi dans notre conversation, en vrac. J'en fais des tâches et je les distribue.

**En cours** : S8 a fini l'espace Développement (7 sur 7), qui passe le premier chez T1. S5 et S7 ont 11 écrans sur leurs branches. S1 construit LOT-02. S2 et SIM ont fini leur préparation et sont en pause. F1 intègre ses trois modules. S2 prépare LOT-01, SIM ajoute les priorités du jour. T1 adapte ses gardes à la nouvelle coquille. DS, S3, S0 et S6 attendent ton accord ou les zips v4.

**Bloqué** : l'allumage de la coquille par défaut, qui attend S0 et S3 (tes lignes ci-dessus) et une correction de T1. La construction de LOT-01, LOT-07 et LOT-08 attend les zips v4.

## À décider par Harun

1. **Nouvelles données partagées** (produits, interlocuteurs, archives, données plus riches de Créer, modules MX01, MX03, MX06). Elles changent amn-api. Recommandation : oui, en une fois avec Mohamed.
2. **TVA et papiers juridiques** : la règle provisoire est l'arrondi par ligne, les encaissements pour les services et une déclaration mensuelle ; le modèle de mise en demeure manque. Recommandation : faire valider la TVA par un comptable et le modèle par un juriste.
3. **Redémarrage d'amn-api** : la dernière étape de sécurité de S6 l'attend. Recommandation : pas d'urgence.
4. **Serveur (LOT-13)** : en pause. Recommandation : en décembre.
5. **Dépôt amn-desktop en privé** : question ouverte. Recommandation : oui.
6. **Fournisseurs des 7 options génériques des connecteurs (H21)** : S6 demande quel outil nommer pour chacune (messagerie, agenda, paiement, etc.). Nommer un fournisseur, c'est un choix d'achat. Recommandation : garder des libellés génériques jusqu'au serveur (décembre), sans rien nommer.
7. **Limite d'utilisation** : jusqu'à 8 sessions vont construire en même temps. Recommandation : laisse-les tourner. Si la limite se resserre, dis-moi lesquelles mettre en pause (je propose de garder S1, DS et S5).
8. **Connexion à la version web (téléphone, LOT-09)**, proposée par S6 : aucune clé partagée dans la version web ; une session au nom de la personne (mot de passe et double authentification), avec les droits de son rôle ; La Garde réservée au propriétaire et à l'administrateur ; sur mobile, la session dure au plus 7 jours et se coupe après 24 h sans activité, avec verrouillage après 5 min ; liste des appareils dans H19 pour en couper un ; cookie protégé plutôt qu'un stockage lisible par la page. Cela change amn-api. Recommandation : oui, avec le chantier du serveur (décembre) ; LOT-09 avance sur cette base, rien n'est branché avant ton accord.
9. **S5 est libre** (LOT-03, LOT-05 et la préparation de LOT-09 sont finis). Ce qui reste est bloqué par d'autres : LOT-04 attend ton accord à DS, LOT-07 les zips de S6, LOT-08 ton accord à S3, et la liste du socle ton accord à S0. Recommandation : si S0 ne peut pas reprendre bientôt, confie sa liste du socle (§1.38 : boutons et filtres à 36 px, tutoiement, ⌘K…) à S5, qui a les zips et connaît le socle. À coller dans S5 : « Oui, prends la liste du socle de S0 (STATUT §1.38) sur claude/refonte-socle, selon le message du CO. »

## À créer par Harun

- **Le dépôt privé du dossier v4** (5 minutes) :
  1. Dans l'organisation amn-devsec : **New repository**, nom `amn-refonte-dossier`, **Private**, avec un README.
  2. Settings › GitHub Apps › Claude › Configure : si l'accès est limité à certains dépôts, ajoute `amn-refonte-dossier`.
  3. Écris-moi « dépôt créé ». J'y dépose le dossier moi-même, sur une branche `claude/`, puis je vérifie que les sessions le lisent.

  Il règle le manque de zips pour toutes les sessions.

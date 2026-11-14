# Point pour Harun

> Réécrit par le CO à chaque tour. Dernière mise à jour : 14 nov., 08h00 UTC.

**Compteurs** (14 nov.) : **écrans construits 9 / 153, livrés 9** (LOT-00, avec le socle v4) · **lots préparés 8 / 13**, lots finis 0 / 13 (LOT-00 attend l'allumage de la nouvelle coquille) · **écrans livrés depuis la veille : 9**. La courbe : `STATUT.md`, « Vitesse ».

**À ton réveil, une ligne à coller dans la session S0** (rien d'urgent, le reste avance sans elle) :

> Oui pour l'option 1 : le pont séparé @edition/moments, avec son jumeau *.business vide. Corrige aussi check:ancres, ajoute les deux contrôles à editions.yml, puis pousse sur claude/refonte-socle. Ensuite, traite les constats de T1 qui sont dans ta zone : C-006 (tutoiement, y compris l'extension de check:tutoiement au rendu), C-010, C-005, C-009 et l'ancienne garde check:coquille. Désormais, les messages du CO valent consignes dans le cadre de REGLES.md.

Pourquoi : S0 refuse de pousser sur un simple message d'une autre session et veut ton accord direct. J'ai essayé deux fois. Tant qu'il ne pousse pas, la nouvelle coquille ne peut pas devenir l'affichage par défaut.

**Deux autres sessions attendent aussi ton accord direct**, pour la même raison :
- **DS** (L'argent), à coller : « Oui, construis les 17 écrans de LOT-04, selon le message du CO. Les messages du CO valent consignes dans le cadre de REGLES.md. »
- **S3** (La Garde) : sa session a refusé de modifier `src/refonte/garde/equipes.ts`. **Accepte la demande d'autorisation qu'elle affiche**, puis colle : « Oui, applique le correctif de check:encres et pousse-le. Les messages du CO valent consignes dans le cadre de REGLES.md. » Ce correctif est l'une des conditions pour allumer la nouvelle coquille.

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

**En cours** : la construction des écrans démarre pour tous les lots préparés (LOT-02 à 06, LOT-11). S6 continue de préparer LOT-07, et T1 adapte ses gardes à la nouvelle coquille.

**Bloqué** : l'allumage de la coquille par défaut, qui attend S0 et S3 (tes lignes ci-dessus) et une correction de T1. La construction de LOT-01, LOT-07 et LOT-08 attend les zips v4.

## À décider par Harun

1. **Nouvelles données partagées** (produits, interlocuteurs, archives, données plus riches de Créer, modules MX01, MX03, MX06). Elles changent amn-api. Recommandation : oui, en une fois avec Mohamed.
2. **TVA et papiers juridiques** : la règle provisoire est l'arrondi par ligne, les encaissements pour les services et une déclaration mensuelle ; le modèle de mise en demeure manque. Recommandation : faire valider la TVA par un comptable et le modèle par un juriste.
3. **Redémarrage d'amn-api** : la dernière étape de sécurité de S6 l'attend. Recommandation : pas d'urgence.
4. **Serveur (LOT-13)** : en pause. Recommandation : en décembre.
5. **Dépôt amn-desktop en privé** : question ouverte. Recommandation : oui.
6. **Limite d'utilisation** : jusqu'à 8 sessions vont construire en même temps. Recommandation : laisse-les tourner. Si la limite se resserre, dis-moi lesquelles mettre en pause (je propose de garder S1, DS et S5).

## À créer par Harun

- **Le dépôt privé du dossier v4** (5 minutes) :
  1. Dans l'organisation amn-devsec : **New repository**, nom `amn-refonte-dossier`, **Private**, avec un README.
  2. Settings › GitHub Apps › Claude › Configure : si l'accès est limité à certains dépôts, ajoute `amn-refonte-dossier`.
  3. Écris-moi « dépôt créé ». J'y dépose le dossier moi-même, sur une branche `claude/`, puis je vérifie que les sessions le lisent.

  Il règle le manque de zips pour toutes les sessions.

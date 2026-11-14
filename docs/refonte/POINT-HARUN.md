# Point pour Harun

> Réécrit par le CO à chaque tour. Dernière mise à jour : 14 nov., 05h25 UTC., 05h05 UTC., 04h35 UTC., 04h10 UTC., 03h50 UTC.

**À ton réveil, une ligne à coller dans la session S0** (rien d'urgent, le reste avance sans elle) :

> Oui pour l'option 1 : le pont séparé @edition/moments, avec son jumeau *.business vide. Corrige aussi check:ancres, ajoute les deux contrôles à editions.yml, puis pousse sur claude/refonte-socle. Désormais, les messages du CO valent consignes dans le cadre de REGLES.md.

Pourquoi : S0 a préparé la réparation de deux contrôles cassés par le socle, mais il refuse de pousser sur un simple message d'une autre session. Il veut ton accord direct. J'ai essayé deux fois. Sa proposition est la bonne, et je la recommande.

**Compteurs** (14 nov.) : **écrans construits 9 / 153**, ceux de LOT-00, qui attendent la vérification de T1 · **lots préparés 7 / 13**, lots finis 0 / 13 · **écrans livrés depuis la veille : 0**. Courbe jour par jour : `STATUT.md`, « Vitesse ».

**⚠ Zips v4** : **Il manque les 5 zips à S6 (LOT-07) et à SIM.** S1, DS, S5 et S7 les ont. Le dépôt privé décrit plus bas règle cela pour toutes les sessions. La solution durable est le dépôt privé décrit plus bas. Elle évite de redonner les zips à chaque session.

## Programme de test du jour

**Pas encore.** Le premier test commence dès la fusion du socle v4, qui attend le verdict de T1. Tu y trouveras ce qui est nouveau, comment le lancer (`LANCER-EN-LOCAL.md`, déjà prêt, données de SIM comprises), une liste de 5 à 10 essais, et où me donner tes retours : dans notre conversation, tout simplement.

**Fait** : préparations fusionnées pour LOT-02, 03, 04, 05, 06, 11 et 12, et chargeur de données fictives. Toutes les gardes de ces fusions sont vertes, aucune nouvelle garde rouge.

**En cours** :
- T1 vérifie le socle v4, puis fera la comparaison automatique aux images.
- S0 répare deux contrôles cassés par le socle.
- SIM complète ses jeux.
- S6 a livré la préparation de LOT-07 ; elle attend que T1 compare le paquet client (elle touche un fichier partagé).
- Les données fictives sont complètes et fusionnées (115 jeux, avoirs compris), avec les adaptations de S1, DS et S5. SIM est en pause.

**Bloqué** : rien.

## À décider par Harun

1. **Nouvelles données partagées** (produits, interlocuteurs, archives, données plus riches de Créer). Elles changent amn-api, et 92 des 100 jeux fictifs n'y ont pas encore de place. Recommandation : oui, en une fois avec Mohamed, après le socle v4.
2. **TVA et papiers juridiques** : la règle provisoire est l'arrondi par ligne, les encaissements pour les services et une déclaration mensuelle. Le modèle de mise en demeure n'existe pas encore. Recommandation : faire valider la TVA par un comptable et le modèle par un juriste.
3. **Redémarrage d'amn-api**, qu'attend la dernière étape de sécurité de S6. Recommandation : pas d'urgence tant que rien n'est distribué.
4. **Serveur (LOT-13)** : en pause. Recommandation : en décembre.
5. **Dépôt amn-desktop en privé** : question ouverte. Recommandation : oui.

## À créer par Harun

**Le dépôt privé du dossier v4** : 5 minutes, une seule fois.

1. Sur github.com, dans l'organisation **amn-devsec** : **New repository**. Nom : `amn-refonte-dossier`. Visibilité : **Private**. Coche « Add a README ».
2. Toujours dans amn-devsec : **Settings › GitHub Apps › Claude › Configure**. Dans « Repository access », si « Only select repositories » est coché, ajoute `amn-refonte-dossier`, puis Save. Si « All repositories » est coché, il n'y a rien à faire.
3. Écris-moi « dépôt créé ». **Je dépose moi-même le dossier v4** dans ce dépôt privé, à partir de ma copie décompressée : 603 fichiers, 94 Mo, aucun au-dessus de 25 Mo. Tu n'as donc rien à envoyer. Je le mets sur une branche `claude/refonte-dossier-v4`, jamais sur `main`, comme partout ailleurs.
4. Ensuite, je vérifie qu'une session le lit vraiment, puis je dis à chaque session de l'ajouter et de le lire. Plus aucun zip à donner à la main.

Rien de secret dans ce dossier, et il ne va jamais dans le dépôt public.

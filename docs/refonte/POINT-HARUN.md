# Point pour Harun

> Réécrit par le CO à chaque tour. Dernière mise à jour : 14 nov., 03h40 UTC.

**Compteurs** (14 nov.) : **écrans construits 9 / 153**, ceux de LOT-00, qui attendent la vérification de T1 · **lots préparés 6 / 13**, lots finis 0 / 13 · **écrans livrés depuis la veille : 0**. Courbe jour par jour : `STATUT.md`, « Vitesse ».

**⚠ Zips v4** : **SIM ne les a pas, et DS non plus d'après son rapport** (j'attends sa confirmation). S1 les a. La solution durable est le dépôt privé décrit plus bas. Elle évite de redonner les zips à chaque session.

## Programme de test du jour

**Pas encore.** Le premier test commence dès la fusion du socle v4, qui attend le verdict de T1. Tu y trouveras ce qui est nouveau, comment le lancer (`LANCER-EN-LOCAL.md`, déjà prêt, données de SIM comprises), une liste de 5 à 10 essais, et où me donner tes retours : dans notre conversation, tout simplement.

**Fait** : préparations fusionnées pour LOT-02, 03, 04, 06, 11 et 12, et chargeur de données fictives. Toutes les gardes de ces fusions sont vertes, aucune nouvelle garde rouge.

**En cours** :
- T1 vérifie le socle v4, puis fera la comparaison automatique aux images.
- S0 répare deux contrôles cassés par le socle.
- SIM complète ses jeux.
- S5 prépare LOT-05.
- S6 prépare LOT-07.

**Bloqué** : rien.

## À décider par Harun

1. **Nouvelles données partagées** (produits, interlocuteurs, archives, données plus riches de Créer). Elles changent amn-api, et 92 des 100 jeux fictifs n'y ont pas encore de place. Recommandation : oui, en une fois avec Mohamed, après le socle v4.
2. **TVA** : la règle provisoire est l'arrondi par ligne, avec les encaissements pour les services. Recommandation : faire valider par un comptable.
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

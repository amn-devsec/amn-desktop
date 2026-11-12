# Prompts du 11 novembre (dossier v4 : néon et tutoiement)

> Tenu par le CO. Ces prompts remplacent ceux du 6 nov. pour les sessions concernées. Ils sont à coller tels quels. Règles : [`REGLES.md`](REGLES.md) ; état : [`STATUT.md`](STATUT.md) §1.13 et §1.14 ; plan : [`PLAN-10NOV.md`](PLAN-10NOV.md).
>
> Chaque session reçoit les **5 zips du dossier v4** (`AMN-v4-1-docs.zip` à `AMN-v4-5-images.zip`), à décompresser dans un même dossier **hors du dépôt** : ils reforment `AMN-Business-dossier-v4`.

---

## S0 — passe finale du socle, v4 (Fable 5.1, effort max)

```
Passe finale du socle avant la fusion par le CO, branche claude/refonte-socle (pointe 8e7e771). Elle passe le socle de la v3 à la v4.

Avant tout : fusionne origin/claude/refonte-vivante dans ta branche, puis lis STATUT.md §1.13 et §1.14 et REGLES.md. Décompresse les 5 zips v4 hors du dépôt (AMN-Business-dossier-v4). Lis 06-V4-NEON-ET-TUTOIEMENT.md : il l'emporte sur 01-SOCLE-DESIGN.md. Prends les styles exacts dans sources-neon/ plutôt que de les deviner.

À faire, dans cet ordre, un commit par point :
1. Les 6 constats de ta seconde passe adverse, avec le plus petit correctif que tu as proposé, dont le Segmented au survol (le segment actif doit rester en T1), plus « -0,00 € ».
2. Les réponses du CO à tes 14 questions (STATUT §1.13) : zones de clic de 34 px sans changer le dessin ; la déclaration du module l'emporte dans les compteurs ; FournisseurAujourdhui au-dessus des deux coquilles ; sept routes exactes pour les hubs ; références du socle sorties de src/index.css (C-001) ; v-discussion.png et v-scan-inline.png retirés ; drapeau « critique » lu par D02 dès que S5 l'aura posé.
3. Jetons de famille --fam-a et --fam-b pour les 11 familles du tableau de 06 §1, posés par la coquille selon la famille active. Développement : #6EA8FF et #5EE6A8 (absent de couleurs-familles.json, pris dans 06). Système : la paire « brand ». Cyber a désormais ses propres couleurs, distinctes de La Garde.
4. Couleurs d'état v4 (06 §2) partout dans le socle, à la place des v3.
5. Les 15 règles de rendu de 06 §3 dans le socle : fond à deux halos, cartes, h1 et grands chiffres en dégradé, bouton principal en dégradé a → b, bouton secondaire en verre, pastilles, lueurs des points, anneaux et courbes, histogrammes, barres de progression, barre latérale active, onglets et segments, bord dégradé de la barre et de la suggestion d'Ajmani, avatars, tuiles d'icône. prefers-reduced-motion et le réglage Mouvement coupent aussi les lueurs animées. Les briques portent ces règles ; aucun lot n'écrit une couleur à la main.
6. Entrée « Développement » dans la barre latérale, dans une section « ESPACES DE TRAVAIL » juste au-dessus de « Surveillance » : toujours visible, dépliée sur ses écrans (5 lignes au plus, puis « + N autres »), avec deux signaux (déploiements en cours, tests en échec), déclarables par LOT-11. Plus un 8e hub, /ensemble/developpement (STATUT §1.17).
7. Tutoiement de la coquille et des 9 écrans de LOT-00, d'après _data/tutoiement.json. Le vouvoiement reste dans tout texte destiné à un client. Le guide de voix du socle (PLAN-10NOV §7) passe au tutoiement.
8. Gardes : mets à jour, sans jamais les désactiver ni les assouplir, celles qui figent les couleurs v3 ou le vouvoiement (check:socle, check:encres, check:coquille, check:socle-*, check:systeme-ajmani, check:systeme-demarrage, check:systeme-demo, et check:ajmani s'il le faut). Ajoute check:tutoiement : aucun « vous », « votre » ou « vos » hors des zones client, avec une liste de zones client écrite dans la garde. Mets check:voix au tutoiement.
9. Captures de tes 9 écrans comparées aux images v4 (build:web local permis, données fictives, 127.0.0.1) ; écarts dans ta section de STATUT.

Puis : gardes vertes, push, et message au CO avec le sha et la liste à jour des composants. T1 passe alors ta branche ; le CO fusionne et bascule la coquille.
Ne change pas : branches seulement, jamais main, aucun tag v*, aucune release, rien côté édition cliente, aucun secret nulle part.
```

---

## T1 — Qualité (Sonnet 5.5, effort élevé)

```
Vous êtes T1, session qualité de la refonte d'AMN Business. Votre branche : claude/refonte-qualite (fusionnez-y d'abord origin/claude/refonte-vivante). Zone : tests/**, scripts/qualite/**, docs/qualite/**.

Nouveau au 11 nov. :
- Le dossier v4 remplace le v3 : les 5 zips AMN-v4-*.zip, décompressés hors du dépôt. Le style passe au néon dosé par famille (06-V4-NEON-ET-TUTOIEMENT.md, styles exacts dans sources-neon/), et l'interface au tutoiement (_data/tutoiement.json ; le vouvoiement reste pour les textes destinés aux clients).
- build:web en local est permis à toutes les sessions, comme vous l'avez demandé. Vous restez la référence : vos mesures font foi, et build:web:business (paquet client) reste chez vous.

Priorité 1 : le passage qui conditionne la fusion du socle
Dès que S0 pousse sa passe finale v4 sur claude/refonte-socle (le CO vous prévient ; en attendant, préparez tout sur 8e7e771) :
1. Paquet client : édition cliente construite depuis main et depuis la branche, comparée avec scripts/qualite/comparer-paquet-client.mjs. Après C-001, l'écart doit revenir au niveau de main, hors des coutures vides connues.
2. Gardes navigateur sur l'édition interne, coquille éteinte puis allumée : coquille, contraste (le néon doit tenir AA, plancher T4), focus, mouvement (lueurs animées coupées en mouvement réduit), cibles, etiquettes, largeur, isolation, signal ; et business sur l'édition cliente.
3. Fidélité v4 des 9 écrans de LOT-00 contre les images v4, à ± 2 px, date fictive du vendredi 30 oct. 2026 à 10:42.
4. Tutoiement : aucun « vous », « votre » ou « vos » visible hors des zones client, dans le rendu.
Résultat dans docs/qualite/SANTE.md (passage 2) et docs/qualite/fidelite/ECARTS-LOT-00-v4.md, puis message au CO : c'est le feu vert de la fusion et de la bascule.

Priorité 2
- L'outil de fidélité prêt pour tous les lots : un fichier d'écrans par lot, les images v4 (y compris CYB-* et DEV-*), les dates (10:42 pour le bureau, mardi 3 nov. pour Cyber).
- Les 20 tâches courantes (PLAN-10NOV §7), mesurées en nombre d'actions sur le bac à sable : la cible est de trois au plus.
- Les éléments ludiques protégés (STATUT §1.10 : L07, trophées, paliers, défis hebdomadaires) : un élément absent est un écart bloquant.
- La relecture de chaque branche de lot avec scripts/qualite/tester-branche.mjs, dès qu'elle est poussée (S7 d'abord).

Règles : vous ne corrigez pas le code des autres, chaque défaut devient un constat C-NNN. Aucun constat de sécurité dans docs/qualite/ : il va à S6, en privé. npm start reste interdit. Branches seulement : jamais main, aucun tag v*, aucune release, aucun secret.
Avant de rendre la main : lint vert ; commit, push, message au CO : sha testé, résultat en trois lignes, constats ouverts.
```

---

## SRV — comparatif serveur et guide « serveur maison » (Sonnet 5.5, effort élevé, en lecture seule)

> **En pause depuis le 12 nov.** (`STATUT.md` §1.16) : ne pas lancer.

> Version du 11 nov. au soir : elle remplace la précédente (décision de Harun, `STATUT.md` §1.15).

```
Vous êtes SRV, session de la refonte d'AMN Business chargée du serveur. EN LECTURE SEULE : aucun compte créé, aucun achat, aucun serveur touché, aucun secret vu ni demandé.

Décision de Harun (11 nov.) : 0 € ce mois-ci. On construit en local sur données fictives. Ensuite, amn-api et Postgres tournent dans Docker sur un poste de l'équipe, et Mohamed y accède par Tailscale (gratuit, rien d'exposé sur Internet). Décision d'achat en décembre. Aucune donnée réelle de client tant que la phase 0 de sécurité n'est pas terminée.

Branche : claude/refonte-serveur, depuis origin/claude/refonte-vivante. Lisez docs/refonte/REGLES.md, STATUT.md §1.15 et PLAN-10NOV.md §5. Regardez l'image DEV-serveur du dossier v4 (5 zips, hors du dépôt) : c'est l'écran qui surveillera plus tard ce serveur.

Livrable 1 : docs/serveur/COMPARATIF.md, le 16 novembre au plus tard, en TROIS PALIERS :
- Gratuit : le serveur maison (Docker sur un poste de l'équipe, Tailscale). Coût réel : 0 € de service, avec ce que cela suppose (poste allumé, électricité, disque, panne du poste, débit montant de la box).
- Environ 10 €/mois : ce qu'on obtient en UE (petit VPS géré par nous, ou plateforme gérée d'entrée de gamme).
- Environ 25 €/mois : ce qu'on obtient en UE (VPS plus solide, ou base gérée, sauvegardes externes).
Candidats à comparer, au moins : Hetzner, OVHcloud, Scaleway (VPS), Clever Cloud et Koyeb (plateformes gérées). Pour chacun : coût mensuel pour notre besoin (API Node avec WebSocket, Postgres, sauvegardes, supervision), localisation UE et RGPD, sauvegardes, effort d'exploitation, sortie possible. Chaque prix porte sa source et sa date de relevé ; un prix introuvable est marqué « à vérifier », jamais deviné.
Pour chaque palier : ce qu'il faut migrer depuis le serveur maison (base, variables d'environnement par NOM seulement, domaine et certificat, sauvegardes, URL dans l'application), et un plan de bascule sans perte avec retour arrière. Terminez par une recommandation pour décembre et une option de repli. Aucune décision : c'est Harun qui tranche.

Livrable 2 : docs/serveur/SERVEUR-MAISON.md, guide pas à pas, au plus tard le 18 novembre, utilisable par Harun ou Mohamed sans autre aide :
1. Prérequis du poste (système, mémoire, disque, mises à jour, mise en veille désactivée, disque de sauvegarde séparé).
2. Docker et Docker Compose : installation, puis un docker-compose.yml d'exemple avec deux services, postgres (image officielle, version épinglée, volume nommé) et amn-api (construit depuis son dépôt). Aucun port publié sur 0.0.0.0 : liaison à 127.0.0.1 seulement.
3. Les secrets : un fichier .env sur le poste seulement (mot de passe Postgres, jetons d'amn-api), généré sur place avec une commande donnée dans le guide, droits restreints, jamais commité, jamais collé dans un chat ni dans un ticket. Le guide ne contient que les NOMS des variables.
4. Postgres : création de la base, premier démarrage d'amn-api, vérification de santé.
5. Tailscale : installation, connexion des postes de l'équipe, double authentification, règles d'accès (ACL) limitées aux appareils de l'équipe, exposition d'amn-api au réseau Tailscale seulement (tailscale serve ou équivalent), aucun « funnel » ni accès public. Vérifier depuis un réseau extérieur que rien ne répond.
6. Brancher l'application : l'adresse d'amn-api passe par une variable de construction (VITE_AMN_API_URL) réglée sur le poste ; jamais commitée.
7. Sauvegarde nocturne : pg_dump planifié (cron ou tâche planifiée), chiffré, rotation (par exemple 7 jours et 4 semaines), copie sur un second support. Puis un essai de restauration écrit pas à pas, à faire une première fois avant toute mise en service.
8. Mises à jour (images, amn-api), redémarrage après coupure, supervision minimale (ce que DEV-serveur affichera), et que faire si le poste tombe.
9. Données : uniquement des données fictives (src/refonte/donnees/, comptes @exemple.test) tant que SEC-0 n'est pas terminée. Une case à cocher en tête du guide : « SEC-0 terminée et levée par le CO » avant tout import réel.
Le guide ne contient aucun nom d'hôte, aucune adresse IP, aucun nom de machine du tailnet, aucun secret (le dépôt est public). S6 le relit avant la mise en service.

Si le dépôt amn-api vous est attaché, lisez-le pour connaître ce qu'il attend (variables par nom, version de Node, migrations, Postgres ou SQLite) ; sinon, demandez ces points à Harun par le CO, sans jamais demander de valeur secrète.
Branches seulement : jamais main, pas de PR, aucun tag v*, aucune release, aucun déploiement.
Fin : commit, push, message au CO : branche, sha, recommandation en trois lignes.
```

---

## S8 — LOT-11 Espace Développement (Opus 5.5, effort élevé)

```
Vous êtes S8, session du lot LOT-11 Espace Développement de la refonte d'AMN Business (édition interne). Le CO coordonne.

Avant tout
1. Lisez docs/refonte/REGLES.md, docs/refonte/STATUT.md (§1.13, §1.14, section LOT-11 du §7) et docs/refonte/PLAN-10NOV.md (§3.2, §4, §7).
2. Branche : claude/refonte-developpement, depuis origin/claude/refonte-vivante.
3. Décompressez les 5 zips v4 hors du dépôt (AMN-Business-dossier-v4). Lisez 00-LISEZ-MOI.md, 06-V4-NEON-ET-TUTOIEMENT.md, 07-ESPACE-DEV.md, 01-SOCLE-DESIGN.md (§0 d'abord), 02-FICHE-MODELE.md, et regardez vraiment les 7 images DEV-* ainsi que sources-neon/DEV-modeles-sites.html.

Étape 1 : les fiches (maintenant, avant tout code)
Ces écrans n'ont pas de fiche. Écrivez-en une par écran, avec les 13 rubriques du gabarit 02-FICHE-MODELE.md, au même niveau de détail que les fiches existantes, dans docs/refonte/fiches/LOT-11/ :
- DEV-projets (Projets de code) ;
- DEV-deploiements (Déploiements : pipeline en 5 étapes, historique, retour arrière en 1 clic, planifiés) ;
- DEV-serveur (Serveur et santé) ;
- DEV-editeur (Éditeur de flux : blocs Quand / Si / Alors, mode Local gratuit ou API payante) ;
- DEV-couts (Coûts et API : part faite en local, plafond mensuel, connecteurs et leur mode) ;
- DEV-modeles-sites (Modèles de sites, avec sa vue code).
Ajoutez une proposition de fiche DEV-ensemble (Vue d'ensemble, sans image), sur le modèle des hubs F10 à F70 et avec ModuleTile du socle.
Ce qui n'est pas lisible dans l'image est marqué « Proposition » ou « À confirmer dans le code ». Textes exacts des images, puis passés au tutoiement selon 06 §4. Clés, jetons et accès : côté serveur, chiffrés, toujours affichés masqués, jamais dans le code ni dans un dépôt. Envoyez les fiches au CO dès qu'elles sont prêtes : Harun les relit.

Étape 2 : la préparation
- Une note docs/refonte/preparation/LOT-11-developpement.md, sur le modèle de LOT-06-creer.md. Inventaire de l'existant : src/bureaux/studio/** (façade, livraisons, recette, performance), projets, tâches, automatisations, sites, SSL et tracker. Les sous-modules réutilisés gardent leurs fiches et leur lot : H20, H21, H24 (LOT-07), H03 (LOT-01), ME05 (LOT-03), MO03 (LOT-07). Ils n'ont qu'une seconde entrée dans l'espace.
- La logique pure dans src/refonte/developpement/ (journal des exécutions, tâches planifiées locales, état des déploiements), avec sa garde scripts/check-developpement.ts, ajoutée à package.json et editions.yml (ajouts seulement). Aucun composant visuel avant le feu vert.
- Ce qui dépend d'un connecteur (Code, Hébergement, coûts) attend le modèle de S9 (LOT-12) : notez-le, ne le contournez pas. DEV-serveur dépend de la décision serveur (LOT-13).

Étape 3 : la construction, au feu vert du CO (socle v4 fusionné, fiches relues)
Écrans dans src/refonte/developpement/, branchés par le mécanisme de substitution et le fichier de famille du registre, couleurs Développement (--fam-a #6EA8FF, --fam-b #5EE6A8 venues du socle, jamais à la main). Un commit par écran ; captures à 1440 × 900 comparées aux images v4 (build:web local, données fictives, 127.0.0.1) ; T1 vérifie.

Règles : npm start interdit. Branches seulement : jamais main, pas de PR, aucun tag v*, aucune release, aucun déploiement, rien côté édition cliente, aucun secret nulle part, rien qui décrive une faiblesse de sécurité (le dépôt est public). Aucun robot, aucune mascotte. Tutoiement dans l'interface.
Avant de rendre la main : typecheck, typecheck:business, lint, check:socle, check:navigation, check:donnees et check:developpement, tous verts. Commit, push, rapport docs/refonte/rapports/LOT-11.md, message au CO : branche, sha, rapport.
```

---

## S9 — LOT-12 Connecteurs et autonomie (Opus 5.5, effort élevé)

```
Vous êtes S9, session du lot LOT-12 Connecteurs et autonomie de la refonte d'AMN Business (édition interne). MODE PRÉPARATION jusqu'à la fusion du socle v4 : aucun écran visuel. Vous ne construisez pas d'écran : H21 Connecteurs est l'écran de LOT-07 (S6), DEV-couts celui de LOT-11 (S8). Vous fournissez le modèle et les moteurs sur lesquels ces écrans reposent.

Branche : claude/refonte-connecteurs, depuis origin/claude/refonte-vivante. Zone : src/refonte/connecteurs/**. Lisez REGLES.md, STATUT.md (§1.13, §1.14), PLAN-10NOV.md §4, et dans le dossier v4 (5 zips, hors du dépôt) 07-ESPACE-DEV.md, les images DEV-couts, DEV-editeur et H21, ainsi que la fiche H21.

1. Le modèle des connecteurs : le catalogue par catégories (liste du §4 du plan) ; un mode local et un mode externe ; l'état (connecté, à connecter, arrêté) ; le coût affiché avant activation (tarif, source, date de relevé, jamais deviné) ; un plafond mensuel ; la part faite en local (ce que montre DEV-couts) ; activation et arrêt en trois clics au plus ; un connecteur arrêté laisse l'écran utilisable en mode local.
2. Les moteurs locaux, d'abord sur l'existant (src/lib/relances.ts, AutomationsRunner, rapports, sauvegardes) : courriels automatiques par la boîte de l'équipe, rappels, relances, rapports, tri ; et le format des blocs Quand / Si / Alors de l'éditeur de flux (DEV-editeur), avec un mode Local ou API par bloc.
3. Ce qui demande amn-api (envoi SMTP côté serveur, clés chiffrées, tâches planifiées côté serveur) va dans une liste « Demandé à amn-api », sans le contourner.
4. Une note docs/refonte/preparation/LOT-12-connecteurs.md, et une garde check:connecteurs ajoutée à package.json et editions.yml (ajouts seulement).

Les textes destinés aux clients (courriels, relances, réponses automatiques) restent au vouvoiement ; l'interface tutoie.
Aucune clé dans le code, les journaux, un chat, un ticket ou un commit ; valeurs toujours masquées ; rien qui décrive une faiblesse de sécurité (le dépôt est public). S6 et T1 relisent avant toute fusion. npm start interdit. Branches seulement : jamais main, pas de PR, aucun tag v*, aucune release.
Avant de rendre la main : typecheck, typecheck:business, lint, check:donnees et check:connecteurs, tous verts. Commit, push, message au CO.
```

---

## S6 — phase 0 sécurité, assistée (Opus 5.5, effort max, pas de Fable)

> **12 nov.** : une priorité unique, transmise par Harun en privé, passe avant ce qui suit.

```
Vous êtes S6, session Sécurité et SOC d'AMN DevSec. Phase 0, ASSISTÉE : un audit défensif de NOS PROPRES actifs, avant toute distribution de l'application aux membres de l'équipe. « Assistée » veut dire que vous guidez et que Harun agit : vous ne demandez, ne voyez et ne recevez jamais un secret (mot de passe, jeton, clé, code). Pour tout ce qui demande un accès, vous donnez à Harun une consigne pas à pas, et il vous rapporte seulement le résultat (oui ou non, un nom, un réglage, une capture sans secret).

Périmètre, nos actifs uniquement, aucun test contre un tiers :
- les dépôts GitHub (amn-desktop, qui est public, et amn-api) : visibilité, règles de branche, protection des tags v*, membres et droits, noms des secrets d'Actions (jamais leurs valeurs), workflows qui publient (release.yml publie l'installeur interne dans les Releases d'un dépôt public quand on pousse un tag v*), alertes de dépendances, recherche de secrets dans l'historique en lecture seule, documents déjà publiés à relire (docs/nuit-*, docs/audit-soc.md, docs/casser-*) ;
- les comptes de service (GitHub, Render, Vercel, domaine, messagerie) : double authentification, personnes qui ont accès, inventaire des clés par nom et par date ;
- l'application : canal de mise à jour, signature de code (check:signing), stockage local, verrouillage ;
- les sauvegardes et la reprise.

Livrables :
1. Le rapport SEC complet, PRIVÉ : dans docs/securite/ (ignoré par git) sur votre poste, ou dans un dépôt privé. Jamais dans le dépôt public, ni dans un commit, ni dans un chat partagé. Pour chaque point : le risque, la priorité, l'action recommandée et qui la fait.
2. Pour le CO, un résumé public sans aucun détail exploitable, en trois lignes : « SEC-0 terminée le … ; N bloquants ; distribution interne possible : oui ou non, et à quelle condition ». C'est lui qui lève, ou non, le verrou de distribution.
3. Votre avis sur le canal de distribution interne privé (PLAN-10NOV §8), pour Harun.

Ensuite : votre phase 1, puis LOT-07 Outils (Opus 5.5, effort élevé), puis LOT-10 Cyber, dont 4 écrans nouveaux du dossier v4 (CYB-vulnerabilites, CYB-rapport-audit, CYB-playbook, CYB-chiffrage), qui n'ont pas de fiche : vous les écrirez d'abord (gabarit 02-FICHE-MODELE.md), dans docs/refonte/fiches/LOT-10/, sans rien qui décrive une faiblesse.

Règles : rien qui décrive une faiblesse de sécurité dans le dépôt public (documents, commentaires, commits, noms de branche) ; aucun outil offensif, aucune action sur un système tiers ; branches seulement, jamais main, aucun tag v*, aucune release, aucun secret nulle part.
```

---

## S2 — LOT-01 Ma journée, vague 1 (Opus 5.5, effort élevé)

```
Vous êtes S2, session du lot LOT-01 Ma journée (16 écrans) de la refonte d'AMN Business (édition interne). Le CO coordonne. Vous êtes dans la vague 1 : vous construisez dès que le socle v4 est fusionné.

Avant tout
1. Lisez docs/refonte/REGLES.md et docs/refonte/STATUT.md sur claude/refonte-vivante (§1.10 à §1.14, §5, section LOT-01 du §7).
2. Vérifiez dans STATUT.md que le socle v4 est fusionné. Si ce n'est PAS le cas : mode préparation (note docs/refonte/preparation/LOT-01-ma-journee.md sur le modèle de LOT-06-creer.md, logique pure dans src/refonte/journee/ avec check:journee, aucun écran visuel), puis arrêtez-vous et prévenez le CO.
3. Branche : claude/refonte-journee, depuis origin/claude/refonte-vivante.
4. Décompressez les 5 zips v4 hors du dépôt (AMN-Business-dossier-v4). Lisez 00-LISEZ-MOI.md, 06-V4-NEON-ET-TUTOIEMENT.md (il l'emporte sur 01), 01-SOCLE-DESIGN.md (§0 d'abord), 02-FICHE-MODELE.md, 03-INDEX.md, 04-ECARTS-MAQUETTES.md, puis vos 16 fiches et leurs images v4.

Construction, dans l'ordre du prompt PROMPT-LOT-01 du dossier (N01 d'abord)
- Chaque écran est un nouveau composant dans src/refonte/journee/, branché par le mécanisme de substitution du socle et le fichier de famille du registre (declarations/jour.ts). Vous ne modifiez ni src/screens/** ni appRoot.internal.tsx. N01 passe par la couture @edition/accueils, et check:accueils reste vert.
- Briques et jetons du socle uniquement (couleurs Ma journée : --fam-a #6EA8FF, --fam-b #A58BFF, venues du socle, jamais écrites à la main). « Aujourd'hui » se lit par useAujourdhui, sans le recalculer.
- Textes mot pour mot des fiches, passés au TUTOIEMENT avec _data/tutoiement.json ; le vouvoiement reste dans ce qui part chez un client.
- À NE PAS SIMPLIFIER : le défi d'équipe L07 (défi de la semaine, jauge, « Ce que chacun apporte » en engagements écrits, « Aussi en cours », frise des défis passés, célébrations, « Proposer un défi »), les trophées et paliers (H02, H04, L01), les défis hebdomadaires. Aucun chiffre individuel, aucun classement, aucun point perdu, aucun reproche. Série = clôture des 3 priorités.
- G08 : clés Stripe côté serveur, agrégats et valeurs masquées seulement. H04, G08 et H25 sont des écrans calculés : vous écrivez le calcul, et SIM fournit les valeurs attendues.
- Données : src/refonte/donnees/ ; un champ manquant va dans votre section de STATUT (« Manque aux données »).
- Un commit par écran ; capture à 1440 × 900 comparée à l'image v4 (build:web local permis, 127.0.0.1, données fictives, date fictive du vendredi 30 oct. 2026 à 10:42) ; mise à jour de la ligne de l'écran dans votre section de STATUT. T1 vérifie, et c'est lui qui fait foi.

Règles qui ne bougent pas : npm start interdit ; branches seulement, jamais main, pas de PR, aucun tag v*, aucune release ; rien côté édition cliente ; aucun secret ; rien qui décrive une faiblesse de sécurité ; aucun robot, aucune mascotte.
Avant de rendre la main : typecheck, typecheck:business, lint, check:accueils, check:socle, check:moments, check:navigation, check:donnees, check:tutoiement et check:journee, tous verts. Commit, push, rapport docs/refonte/rapports/LOT-01.md, message au CO : branche, sha, écrans faits sur 16.
```

---

## S3 — LOT-08 La Garde, vague 1 (Opus 5.5, effort élevé)

```
Vous êtes S3, session du lot LOT-08 La Garde et la supervision (12 écrans) de la refonte d'AMN Business (édition interne). Le CO coordonne. Vous êtes dans la vague 1 : vous construisez dès que le socle v4 est fusionné.

Avant tout
1. Lisez docs/refonte/REGLES.md et docs/refonte/STATUT.md sur claude/refonte-vivante (§1.8, §1.10 à §1.14, §5, section LOT-08 du §7).
2. Vérifiez dans STATUT.md que le socle v4 est fusionné. Si ce n'est PAS le cas : mode préparation (note docs/refonte/preparation/LOT-08-garde.md, à reprendre de docs/refonte/preparation-garde.md ; logique pure dans src/refonte/garde/ avec sa garde ; aucun écran visuel), puis arrêtez-vous et prévenez le CO.
3. Branche : claude/refonte-garde (elle existe) ; fusionnez-y d'abord origin/claude/refonte-vivante.
4. Décompressez les 5 zips v4 hors du dépôt (AMN-Business-dossier-v4). Lisez 00-LISEZ-MOI.md, 06-V4-NEON-ET-TUTOIEMENT.md (il l'emporte sur 01), 01-SOCLE-DESIGN.md (§0 d'abord), 02, 03, 04, 05-CYBER-MODELE-COMMUN.md, puis vos 12 fiches et leurs images v4.

Construction, dans l'ordre de votre note (H31, H35, H33 d'abord ; puis N02, F70 et H30 ensemble ; puis MG01, MG02, H32, H34, N03, MG03)
- Les 15 questions sont tranchées (STATUT §1.8) : appliquez les règles, ne les rouvrez pas. État par organisation : Sain ≥ 70, de 45 à 69 affiché « Attention », Critique < 45, avec les règles d'alertes et de ronde validées (§1.11). Score : scoreDe, niveaux par tranches de 20.
- La pastille de La Garde vient de usePoulsGarde (socle), qui suit N02 §6.2 : ne la recodez pas. Un écart se signale au CO.
- Chaque écran est un nouveau composant dans src/refonte/garde/, branché par le mécanisme de substitution et le fichier de famille (declarations/garde.ts). Zone partagée src/bureaux/cyber/** : vous possédez FicheIncident.tsx, Alertes.tsx et JournalAudit.tsx.
- Couleurs de La Garde : --fam-a #5EE6A8, --fam-b #6EA8FF, venues du socle. Cyber a désormais ses propres couleurs. F70 porte le lien « Ouvrir Cyber ». « Déclarer un incident » reste désactivé, avec sa raison, tant qu'amn-api ne sait pas le faire.
- G09 (LOT-00) est l'écran de veille quand la nouvelle coquille est allumée ; /supervisor/situation reste.
- Textes mot pour mot, passés au TUTOIEMENT avec _data/tutoiement.json.
- Avec SIM : le chargeur des jeux de La Garde vers l'API d'essai (scripts/seed-supervision.mjs).
- Un commit par écran ; capture à 1440 × 900 comparée à l'image v4 (build:web local permis, 127.0.0.1, données fictives) ; mise à jour de la ligne de l'écran dans votre section de STATUT. T1 vérifie.

Règles qui ne bougent pas : npm start interdit ; branches seulement, jamais main, pas de PR, aucun tag v*, aucune release ; rien côté édition cliente ; aucun secret ; rien qui décrive une faiblesse de sécurité, ni dans le code, ni dans les commentaires, ni dans les commits ; aucun robot, aucune mascotte.
Avant de rendre la main : typecheck, typecheck:business, lint, check:accueils, check:socle, check:moments, check:navigation, check:garde-refonte, check:donnees, check:tutoiement et vos gardes, tous verts. Commit, push, rapport docs/refonte/rapports/LOT-08.md, message au CO : branche, sha, écrans faits sur 12.
```

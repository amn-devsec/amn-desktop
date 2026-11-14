# Prompts du 12 nov. : sessions qui travaillent sans attendre le socle v4

> Pour Harun. Chaque bloc se colle tel quel dans une nouvelle session. Ordre de priorité, réglages et raisons : `STATUT.md` §1.24.
> Ces prompts remplacent ceux du 6 nov. pour S1, S5, DS, S7 et SIM : ils passent au dossier v4 (néon, tutoiement).

---

## 1. SIM — Données fictives (Sonnet 5.5, effort élevé)

```
Vous êtes SIM, session des données fictives de la refonte d'AMN Business (édition interne). Vos 100 jeux sont fusionnés (4fe559b, check:donnees à 87 contrôles) et vos règles sont validées (STATUT §1.11). Le CO coordonne.

Avant tout
1. Lisez docs/refonte/REGLES.md et docs/refonte/STATUT.md sur claude/refonte-vivante (§1.11, §1.16, §1.20, §1.22, §5).
2. Branche : claude/refonte-donnees-fictives ; fusionnez-y d'abord origin/claude/refonte-vivante. Zone : src/refonte/donnees/**, scripts/check-donnees.ts, simulation/**, docs/simulation/**, plus les nouveaux scripts nommés ci-dessous.

À faire, dans cet ordre
1. Dates : vendredi 30 oct. 2026 à 10:42 pour le bureau (au lieu de 10 h 15), mardi 3 nov. 2026 pour Cyber, toujours sans lire l'horloge. Libellé de la bande du milieu : « Attention » (seuil inchangé). check:donnees le vérifie.
2. Le chargeur vers l'API d'essai (scripts/charger-donnees-essai.mjs) : il écrit un volume choisi (vide, peu, normal, beaucoup) dans les collections de l'API en mémoire de T1 (scripts/qualite/api-essai.mjs, port 4171), avec les comptes @exemple.test seulement, et refuse toute autre cible que 127.0.0.1. C'est lui qui permet à Harun d'essayer l'application sur son poste (docs/refonte/LANCER-EN-LOCAL.md, étape 4 : ajoutez-y une ligne pour l'utiliser). Pour La Garde, réutilisez scripts/seed-supervision.mjs au lieu de le recopier.
3. Les valeurs attendues des écrans calculés : trésorerie prévisionnelle H09 (LOT-04), bilan de la semaine H04, cockpit client G08 et tableau de bord H25 (LOT-01). Ce sont des attendus de test, pas une seconde implémentation.
4. LOT-14, la charge (STATUT §1.20) : un générateur d'organisations fictives reproductible à la graine (100 pour la cible, jusqu'à 1 000 pour la résistance, de 10 à 600 personnes chacune), et les scénarios écrits dans docs/simulation/charge.md : 20 organisations connectées en même temps plus 3 personnes internes, montée par paliers jusqu'à 1 000, essais longs de 72 h. Seuils validés : 95 % des actions courantes en moins d'1 s, une modification visible sur les autres postes en moins de 5 s. Ici, vous vérifiez seulement que les scénarios tournent contre l'API d'essai : les vrais chiffres viendront du serveur maison, plus tard.
5. Les champs que les lots inscrivent dans leurs listes « Manque aux données » de STATUT.md : ajoutez-les, chacun avec un contrôle.

Règles qui ne bougent pas
- Aucune donnée réelle, aucun nom d'outil de sécurité réel, aucune adresse réseau autre que 127.0.0.1, aucun secret ; identifiants FICT-…, comptes @exemple.test.
- Un point faible d'amn-api trouvé par vos essais ne s'écrit pas dans le dépôt (il est public) : vous le signalez au CO en une ligne, sans détail, et il le transmet à Harun.
- npm start interdit. Branches seulement : jamais main, pas de PR, aucun tag v*, aucune release, aucun déploiement. Rien côté édition cliente.

Avant de rendre la main : typecheck, typecheck:business, lint, check:donnees, tous verts. Commit, push, rapport docs/refonte/rapports/DONNEES.md mis à jour, message au CO : branche, sha, ce qui est livré.
```

---

## 2. DS — LOT-04 L'argent, préparation (Opus 5.5, effort élevé)

```
Vous êtes DS, session du lot LOT-04 L'argent (17 écrans) de la refonte d'AMN Business (édition interne). Le CO coordonne. Vous ne touchez pas à src/socle/** : il appartient à S0.

MODE PRÉPARATION. Tant que STATUT.md ne dit pas « socle v4 fusionné » : aucun écran visuel, aucun import de src/socle/ui, aucun composant React visuel. Tout le reste commence maintenant.

Avant tout
1. Lisez docs/refonte/REGLES.md et docs/refonte/STATUT.md sur claude/refonte-vivante (§1.5, §1.10 à §1.24, §5, section LOT-04 du §7, et la liste des composants du socle dans la section LOT-00).
2. Branche : claude/refonte-argent, créée depuis origin/claude/refonte-vivante.
3. Décompressez les 5 zips v4 hors du dépôt (AMN-Business-dossier-v4). Lisez 00-LISEZ-MOI.md, 06-V4-NEON-ET-TUTOIEMENT.md (il l'emporte sur 01), 01-SOCLE-DESIGN.md (§0 d'abord), 02-FICHE-MODELE.md, 03-INDEX.md, 04-ECARTS-MAQUETTES.md, puis vos 17 fiches et leurs images v4.

Livrables
A. La note docs/refonte/preparation/LOT-04-argent.md, sur le modèle de docs/refonte/preparation/LOT-11-developpement.md : par écran, le module existant et ses fichiers, les données (src/refonte/donnees/), ce qui manque, vos questions.
B. La logique pure dans src/refonte/argent/ : facturation, devis (dont le devis prérempli demandé par H42 et H41, une source de votre lot), dépenses, impayés, budget, TVA, abonnements, tarifs, trésorerie prévisionnelle H09 (comparée aux attendus que SIM fournit). Textes fr/en au tutoiement (_data/tutoiement.json) ; garde scripts/check-argent.ts, branchée dans package.json et editions.yml (ajouts seulement).
C. Dans STATUT.md, seulement la section LOT-04 du §7 : écrans en « en cours (préparation) », listes « Manque au socle » et « Manque aux données ».

Points propres à LOT-04
- Banque en LECTURE SEULE : l'application n'émet jamais de virement ; elle prépare un ordre ou un rappel que la personne exécute dans sa banque (MA05, MA08, MA10, MA11).
- Paie : montants masqués par défaut ; cotisations de la paie fictive = 46 % du net.
- TVA et impôts : la mention « à valider par un comptable » reste ; « Valable juridiquement » (H07) est une affirmation à faire valider, jamais une promesse.
- Connecteurs (paiements, banque) : vous lisez seulement leur état, depuis le modèle de S9 (src/refonte/connecteurs/, STATUT §1.22). Ils se configurent dans H21 (LOT-07). Aucune clé saisie dans vos écrans.
- Trois modules de l'Atelier entrent dans la famille Argent (STATUT §1.21) : Taux horaire de revient, Paiement en plusieurs fois, Comparateur de devis. F1 les intègre ; vous ne les refaites pas, vous prévoyez seulement leur place dans vos écrans.
- Ce qui part chez un client (devis, factures, relances) reste au vouvoiement.

Règles qui ne bougent pas : npm start interdit (vous n'avez pas besoin de lancer l'app en préparation) ; branches seulement, jamais main, pas de PR, aucun tag v*, aucune release, aucun déploiement ; rien côté édition cliente, fichiers sensibles en ajout seulement ; aucun secret, aucune donnée réelle ; rien qui décrive une faiblesse de sécurité (le dépôt est public) ; aucun robot, aucune mascotte.

Avant de rendre la main : typecheck, typecheck:business, lint, check:accueils, check:socle, check:moments, check:navigation, check:money, check:donnees et check:argent, tous verts. Commit, push, rapport docs/refonte/rapports/LOT-04-preparation.md, message au CO : branche, sha, rapport.
```

---

## 3. S1 — LOT-02 Contacts et clients, préparation (Sonnet 5.5, effort élevé)

```
Vous êtes S1, session du lot LOT-02 Mes contacts et clients (13 écrans) de la refonte d'AMN Business (édition interne). Vous ferez ensuite LOT-09 (mobile, en PWA), en dernier. Le CO coordonne.

MODE PRÉPARATION. Tant que STATUT.md ne dit pas « socle v4 fusionné » : aucun écran visuel, aucun import de src/socle/ui, aucun composant React visuel. Tout le reste commence maintenant.

Avant tout
1. Lisez docs/refonte/REGLES.md et docs/refonte/STATUT.md sur claude/refonte-vivante (§1.4, §1.8, §1.10 à §1.24, §5, section LOT-02 du §7, et la liste des composants du socle dans la section LOT-00).
2. Branche : claude/refonte-contacts, créée depuis origin/claude/refonte-vivante.
3. Décompressez les 5 zips v4 hors du dépôt (AMN-Business-dossier-v4). Lisez 00-LISEZ-MOI.md, 06-V4-NEON-ET-TUTOIEMENT.md (il l'emporte sur 01), 01-SOCLE-DESIGN.md (§0 d'abord), 02-FICHE-MODELE.md, 03-INDEX.md, 04-ECARTS-MAQUETTES.md, puis vos 13 fiches et leurs images v4.

Livrables
A. La note docs/refonte/preparation/LOT-02-contacts.md, sur le modèle de docs/refonte/preparation/LOT-11-developpement.md : par écran, le module existant et ses fichiers, les données (src/refonte/donnees/), ce qui manque, vos questions.
B. La logique pure dans src/refonte/contacts/ : pipeline, relances (avec la règle d'espacement de la fiche : on ne harcèle jamais un client ; le délai par défaut de 7 jours vient de STATUT §1.22), fidélité, rendez-vous. Textes fr/en au tutoiement (_data/tutoiement.json) ; garde scripts/check-contacts.ts, branchée dans package.json et editions.yml (ajouts seulement).
C. Dans STATUT.md, seulement la section LOT-02 du §7 : écrans en « en cours (préparation) », listes « Manque au socle » et « Manque aux données ».

Points propres à LOT-02
- ModuleTile, ModuleGroupGrid et AddModuleTile viennent du socle : ne les construisez pas.
- « Contacts par client » (demandé par H41) est une source de votre lot : décrivez-la dans la note.
- ⌘R est pris par le rechargement d'Electron : sans touche libre, pas de raccourci (STATUT §1.8 n° 14).
- H45 Fournisseurs : noms fictifs seulement.
- Ce qui part chez un client (courriels, relances) reste au vouvoiement.

Règles qui ne bougent pas : npm start interdit (vous n'avez pas besoin de lancer l'app en préparation) ; branches seulement, jamais main, pas de PR, aucun tag v*, aucune release, aucun déploiement ; rien côté édition cliente, fichiers sensibles en ajout seulement ; aucun secret, aucune donnée réelle ; rien qui décrive une faiblesse de sécurité (le dépôt est public) ; aucun robot, aucune mascotte.

Avant de rendre la main : typecheck, typecheck:business, lint, check:accueils, check:socle, check:moments, check:navigation, check:donnees et check:contacts, tous verts. Commit, push, rapport docs/refonte/rapports/LOT-02-preparation.md, message au CO : branche, sha, rapport.
```

---

## 4. S5 — LOT-03 Écrire, puis LOT-05 Échanger, préparation (Sonnet 5.5, effort élevé)

```
Vous êtes S5, session des lots LOT-03 Écrire et retenir (9 écrans) puis LOT-05 Échanger (10 écrans) de la refonte d'AMN Business (édition interne). Vous restez propriétaire du registre des modules (src/refonte/modules/). Le CO coordonne.

MODE PRÉPARATION. Tant que STATUT.md ne dit pas « socle v4 fusionné » : aucun écran visuel, aucun import de src/socle/ui, aucun composant React visuel. LOT-03 d'abord, LOT-05 ensuite.

Avant tout
1. Lisez docs/refonte/REGLES.md et docs/refonte/STATUT.md sur claude/refonte-vivante (§1.10 à §1.24, §5, sections LOT-03 et LOT-05 du §7, et la liste des composants du socle dans la section LOT-00).
2. Branches : claude/refonte-ecrire, puis claude/refonte-echanger, chacune créée depuis origin/claude/refonte-vivante.
3. Décompressez les 5 zips v4 hors du dépôt (AMN-Business-dossier-v4). Lisez 00-LISEZ-MOI.md, 06-V4-NEON-ET-TUTOIEMENT.md (il l'emporte sur 01), 01-SOCLE-DESIGN.md (§0 d'abord), 02-FICHE-MODELE.md, 03-INDEX.md, 04-ECARTS-MAQUETTES.md, puis vos fiches et leurs images v4.

Livrables, pour chaque lot
A. La note docs/refonte/preparation/LOT-03-ecrire.md (puis LOT-05-echanger.md), sur le modèle de docs/refonte/preparation/LOT-11-developpement.md.
B. La logique pure dans src/refonte/ecrire/ (puis src/refonte/echanger/), avec textes fr/en au tutoiement (_data/tutoiement.json) et une garde scripts/check-ecrire.ts (puis check-echanger.ts), branchée dans package.json et editions.yml (ajouts seulement).
C. Dans STATUT.md, seulement la section du lot au §7 : écrans en « en cours (préparation) », listes « Manque au socle » et « Manque aux données ».

Points propres
- LOT-03 : la « note épinglée » demandée par H41 est une source de votre lot ; ME05 (base de connaissances) est mixte ; la dictée vit dans la barre Ajmani et sur mobile.
- LOT-05 : G07 devient la boîte des CLIENTS (courriel, WhatsApp, SMS) ; les échanges internes passent par Canaux (MX04). WhatsApp et SMS sont des connecteurs du modèle de S9 (src/refonte/connecteurs/, STATUT §1.22) : prévoyez l'état « connecteur à brancher ». H13 : sans ligne pro, appel dans l'application seulement. Ce qui part chez un client reste au vouvoiement.
- Registre : il n'accepte pas de vue en double (STATUT §1.19 n° 1). Si la préparation d'un autre lot demande une évolution du registre, c'est vous qui la faites, sur votre branche, et vous le signalez au CO.

Règles qui ne bougent pas : npm start interdit (vous n'avez pas besoin de lancer l'app en préparation) ; branches seulement, jamais main, pas de PR, aucun tag v*, aucune release, aucun déploiement ; rien côté édition cliente, fichiers sensibles en ajout seulement ; aucun secret, aucune donnée réelle ; rien qui décrive une faiblesse de sécurité (le dépôt est public) ; aucun robot, aucune mascotte : Ajmani = barre de texte et palette ⌘J.

Avant de rendre la main, à chaque lot : typecheck, typecheck:business, lint, check:accueils, check:socle, check:moments, check:navigation, check:donnees et votre garde, tous verts. Commit, push, rapport docs/refonte/rapports/LOT-03-preparation.md (puis LOT-05), message au CO : branche, sha, rapport.
```

---

## 5. S7 — LOT-06 Créer et produire, mise à jour de la préparation (Sonnet 5.5, effort moyen)

```
Vous êtes S7, session du lot LOT-06 Créer et produire (15 écrans) de la refonte d'AMN Business (édition interne). Votre préparation est poussée depuis le 6 nov. (claude/refonte-creer @ e402d0e : logique pure, check:creer, note docs/refonte/preparation/LOT-06-creer.md). Le CO coordonne.

MODE PRÉPARATION. Tant que STATUT.md ne dit pas « socle v4 fusionné » : aucun écran visuel, aucun import de src/socle/ui, aucun composant React visuel.

À faire
1. Fusionnez origin/claude/refonte-vivante dans claude/refonte-creer. Lisez docs/refonte/REGLES.md et STATUT.md (§1.10 à §1.24, §5, section LOT-06 du §7, et la liste des composants du socle dans la section LOT-00).
2. Décompressez les 5 zips v4 hors du dépôt (AMN-Business-dossier-v4). Lisez 06-V4-NEON-ET-TUTOIEMENT.md (il l'emporte sur 01), puis vos 15 fiches et leurs images v4.
3. Mettez la note à jour pour la v4 : néon de la famille Créer par --fam-a / --fam-b (venus du socle, jamais écrits à la main), textes au tutoiement (_data/tutoiement.json), briques du socle v4 (ModuleTile, ModuleGroupGrid, PageHead… viennent du socle, pas de votre lot), mécanisme de substitution de S0 pour brancher vos écrans.
4. DEV-modeles-sites (LOT-11) peut avoir une seconde entrée dans Créer et produire, par la sous-liste de la barre latérale et sans doublon dans le registre (STATUT §1.17 n° 3 et §1.19 n° 1) : notez-le dans la note, sans rien construire.
5. Confrontez votre logique aux 100 jeux de src/refonte/donnees/ : chaque champ manquant va dans la liste « Manque aux données » de votre section de STATUT, avec l'écran concerné. Étendez check:creer aux cas limites des fiches : volume vide, volume « beaucoup », seuils de stock, retards.
6. Préparez, sans les brancher, les déclarations de vos écrans pour src/refonte/modules/declarations/creer.ts : la liste va dans la note, pas encore dans ce fichier.

Points propres à LOT-06
- Gris intermédiaires permis pour les illustrations seulement (photos, objets, véhicules), jamais pour le texte ni les états.
- MR01 et MR02 : fenêtres de confirmation de publication.

Règles qui ne bougent pas : npm start interdit ; branches seulement, jamais main, pas de PR, aucun tag v*, aucune release, aucun déploiement ; rien côté édition cliente, fichiers sensibles en ajout seulement ; aucun secret, aucune donnée réelle ; rien qui décrive une faiblesse de sécurité (le dépôt est public) ; aucun robot, aucune mascotte.

Avant de rendre la main : typecheck, typecheck:business, lint, check:accueils, check:socle, check:moments, check:navigation, check:donnees et check:creer, tous verts. Commit, push, rapport docs/refonte/rapports/LOT-06-preparation.md, message au CO : branche, sha, rapport.
```

# Rapport de fin de session — Données fictives (bac à sable), mission du 12 nov.

## Résumé (5 lignes au plus)

1. **Dates alignées** sur les images v3 : vendredi 30 oct. 2026 à 10 h 42 pour le bureau, mardi 3 nov. 2026 pour Cyber (second « maintenant » dans le contexte). Le libellé de la bande du milieu de La Garde est « Attention ».
2. **Chargeur** `scripts/charger-donnees-essai.mjs` : écrit un volume choisi dans l'API d'essai locale (127.0.0.1 seulement, comptes `@exemple.test`), huit collections ; La Garde par `seed-supervision.mjs`. Ligne ajoutée à `LANCER-EN-LOCAL.md`.
3. **Attendus** des écrans calculés H09, H04, G08 et H25 (`attendus.ts`), avec les cas que leurs fiches montrent garantis dans les jeux.
4. **LOT-14** : 1 000 organisations fictives reproductibles (`charge.ts`), scénarios dans `docs/simulation/charge.md`, exécution locale `simulation/charge/executer.mjs` : les trois scénarios tournent, aucune écriture perdue.
5. **Champs réclamés** par les lots 02, 04 et 06 ajoutés avec contrôle, sauf une courte liste plus bas ; **numérotation** `AAAA-NNNN` et **avoirs** `AV-AAAA-NNNN` (CO, §1.28 n° 4). `check:donnees` : **114 contrôles** (87 avant).

## Branche et sha

- Branche : `claude/refonte-donnees-fictives`
- Dernier commit de code : voir le message au CO (le sha change si une fusion de `refonte-vivante` arrive après ce rapport)
- Partie de : `claude/refonte-vivante`, fusionnée trois fois pendant la mission (`8333822`, `37ca20c`, puis `892c436`)

## Fichiers touchés

Nouveaux : `scripts/charger-donnees-essai.mjs`, `src/refonte/donnees/attendus.ts`, `src/refonte/donnees/charge.ts`, `simulation/charge/executer.mjs`, `docs/simulation/charge.md`.
Modifiés : `src/refonte/donnees/` (`argent.ts`, `contacts.ts`, `creer.ts`, `equipe.ts`, `garde.ts`, `index.ts`, `ma-journee.ts`, `monde.ts`, `outils.ts`, `types.ts`, `types-suite.ts`, `LISEZ-MOI.md`), `scripts/check-donnees.ts`, `docs/refonte/LANCER-EN-LOCAL.md` (une ligne, demandée), ce rapport.

Fichiers **sensibles** ou **hors zone** : aucun (ni `package.json`, ni `editions.yml`, ni `STATUT.md`, ni `REGLES.md`). `docs/simulation/` et `simulation/` sont dans ma zone ; seuls `charge.md` et `executer.mjs` y sont poussés.

## Gardes

| Garde | Résultat |
|---|---|
| `typecheck` | vert |
| `typecheck:business` | vert |
| `lint` | vert |
| `check:accueils`, `check:socle`, `check:moments` | vert |
| `check:langue`, `check:accent`, `check:naming`, `check:modules` | vert |
| `check:donnees` (118 contrôles) | vert |

Le scénario de charge « cible » est rejoué par `check:donnees` quand amn-api est à côté (sinon le contrôle le dit et passe).

## Ce qui est livré

| N° | Livré | Où |
|---|---|---|
| 1 | Dates 10 h 42 et 3 nov. (Cyber), libellé « Attention », contrôles | `outils.ts`, `monde.ts`, `types.ts`, `garde.ts` |
| 2 | Chargeur, refus de toute cible autre que 127.0.0.1 (et des redirections), refus des comptes hors `@exemple.test`, « moi » remplacé par le compte connecté, 9 écritures par seconde | `scripts/charger-donnees-essai.mjs` |
| 3 | Attendus H09, H04, G08, H25 | `attendus.ts` |
| 4 | Générateur d'organisations, scénarios, exécution | `charge.ts`, `charge.md`, `executer.mjs` |
| 5 | Champs des listes « Manque aux données » (LOT-02, LOT-04, LOT-06) | voir ci-dessous |

### Ce que les attendus ont demandé aux jeux

Pour que les cas des fiches existent : prévisions de trésorerie sur quatre mois (abonnements actifs et impôts à payer en plus des factures et charges) ; trois clients arrivés cette semaine et deux la précédente ; deux règlements cette semaine, deux la semaine d'avant et deux tôt le mois précédent (dès « normal ») ; la semaine suivante plus chargée que la moyenne des quatre dernières ; les nouveaux clients du mois s'abonnent.

### Champs ajoutés (avec un contrôle chacun)

- **LOT-02** : référents de partenaires (interlocuteurs de type partenaire), sentiment des avis et NPS (`calculerNps`), raison de perte des prospects.
- **LOT-04** : numérotation des factures `AAAA-NNNN` et jeu `avoirs` (`AV-AAAA-NNNN`, factures de nature `creditNote`, partiels sur les factures dues, le reste dû baisse, la TVA aussi) ; régime de TVA ; lignes à 10 % et 5,5 % (factures, devis) et dépenses à 5,5 % ; historique des soldes (90 jours) et des enveloppes (6 mois) ; indicateur « échue » sur les encaissements prévus ; attendus de H09.
- **LOT-06** : tout ce que la liste réclame **sauf MR08** (aucun jeu) — H15 (niveau cible, emplacement par mouvement, commandes fournisseur, franco et port), H16 (poids et part réalisée, interventions, livraisons), H17 (rôle et part des couleurs, « à éviter », dernière modification), MR01 (étape « Sous-titrage », plans, sous-titres, commentaires, publication), MR02 (sections, visites par jour, avis avec accord), MR03 (trajets, « Sur place »), MR04 (affectation datée, entretien, contrôle, réforme), MR05 (photos, TVA, prix d'achat, niveau conseillé, ventes par semaine), MR06 (indisponibilités, conflits), MR07 (création, échéance, livraison, paiement en ligne), MR09 (énergie, niveau, autonomie, kilomètres et carburant par jour), MR10 (orientation, signature du client), MR11 (« sans objet », cause, relevé), F50 (contrôle ouvert rattaché à un chantier, étape « Réception »).

## LOT-11 Développement (commande du CO, §8 de la note de préparation)

Huit jeux de plus (109 au total) : `depots`, `deploiements`, `deploiementsPlanifies`, `executions`, `tachesPlanifiees`, `mesuresServeur`, `servicesServeur`, `paiementsConnecteurs`, et les `connecteurs` complétés (mode local / payant / à brancher, modèle de coût, consommation du mois, payé), plus le plafond mensuel dans les réglages (40 €, alerte à 80 %). `developpement.ts`. Formes en sur-ensembles de celles de S8, vérifiées à la compilation et lues par la logique même de S8 dans `check:donnees`. Cas garantis : les quatre états de déploiement, neuf déploiements dans la semaine, un « Revenir », un test en échec, une pause automatique après trois échecs, un service à surveiller, les trois modes de connecteur. Les noms de dépôts sont inventés (aucun dépôt réel).

Pas fait : le résumé du serveur de DEV-serveur (en ligne depuis N jours, copie hors serveur, coût du mois, remplissage du disque) — non listé dans la commande ; les modèles de sites (contenu, pas des données).

## Suite de la commande du CO (14 nov., STATUT §1.31)

- **Fidélité (MC02)** aux paliers de la fiche : 1 € payé = 1 point, un avis = 50, une recommandation = 200, sur 12 mois ; Bronze dès 0, Argent dès 800, Or dès 1 800 ; les trois paliers existent dès « normal » (12 graines). Champ ajouté : `recommandations`.
- **Statut des clients (H05)** : « Impayé » = facture échue depuis plus de 7 jours ; « À relancer » = échue depuis 7 jours ou moins, dernier échange il y a plus de 5 jours, ou santé sous 45 ; « Nouveau » = client depuis moins de 30 jours ; sinon « Actif ». Les quatre statuts existent dès « normal ».
- **LOT-03** : liens et échéances de blocs, commentaires ancrés, présence en direct, propriété « rendez-vous » (pages) ; intercalaire et faits relevés d'un contrat (fichiers) ; champs posés, rôle « en copie », relances automatiques (signatures) ; humeur à 5 niveaux, énergie, mercis (journal) ; rubrique, étapes, articles liés (connaissances) ; texte indexé et restaurations (archives) ; jeux `reglesArchivage` (ME04) et `demandesRelecture` (F20).
- **Règlements partiels** (G03, MA03) : des règlements réussis plus petits que la facture, sur des factures encore envoyées ; le reste dû (`soldeCents`) = TTC − avoirs − règlements, l'encaissement attendu aussi.
- **Remises** (MA12) : chaque ligne de devis ou de facture porte `prixGrilleCents` ; l'écart avec le prix facturé est la remise accordée (jusqu'à 15 %). Pas de remise globale sur un document (`remisePct` de DS) : à demander si besoin.
- **MR08** : jeux `entonnoirBoutique` (visites → paiements, 30 jours, lu dans `commandes`), `paniers` (ouvert, abandonné, converti), `sessionsBoutique` (actives depuis moins de 5 minutes) ; objectif du trimestre dans les réglages.

115 jeux, `check:donnees` : 118 contrôles. **Contrôles des autres lots sur ces jeux** : creer 137, echanger 89, developpement 51, connecteurs 103 verts ; trois rouges, chacun à cause d'un changement commandé : `check:contacts` rejoue encore la fidélité à 500 / 1 500 sur les seules factures (S1 : passer à `pointsProgramme`, `PALIERS`, avis et recommandations du jeu) ; `check:argent` appelle `resteDu(…, { paiements: [] })` (DS : lui passer `m.paiements`, les règlements partiels y sont) ; `check:ecrire` affirme « les jeux n'ont pas de liens entre pages » (S5 : ils en ont, c'est ce qu'elle demandait).

## Avoirs par défaut, rôles du serveur, résumé du serveur (messages du CO, 14 nov.)

- **Avoirs** : DS les lit (`check:argent`, §1.34) ; ils sont dans le monde **par défaut** (`construireMonde({ avoirs: false })` redonne un monde sans avoir).
- **Rôles fictifs** alignés sur le serveur (§1.34 n° 2) : `owner` (le dirigeant, « moi »), `admin`, `member`, `guest`. « Partenaire » n'est plus un rôle : Inès (graphiste) devient une invitée (`guest`), les partenaires sont des contacts (MC05). `compat.ts` vérifie la correspondance avec `UserRole`.
- **DEV-serveur** : jeu `serveur` (un enregistrement) — jours en ligne, mémoire, disque cohérent avec les mesures, croissance sur 4 semaines, capacité du lien, sauvegardes lues dans le jeu `sauvegardes`, coût du mois (9 € : hébergement, stockage, copies). Les états des services suivent la fiche : en marche dès 99,9 %, attention de 99,0 à 99,9 %, arrêté dessous. Ni hôte, ni adresse, ni port.

## Ce qui reste à faire (par ordre d'utilité)

1. **Champs réclamés, non faits** (relus sur `STATUT.md` de `refonte-vivante` pour LOT-02, et sur les branches `refonte-argent` et `refonte-creer` pour LOT-04 et LOT-06, pas encore fusionnées) :
   - LOT-04 : règlements partiels (plusieurs paiements par facture), remises sur devis et prestations ;
   - LOT-06 : MR08 (aucun jeu : sessions en direct, entonnoir, paniers, objectif du trimestre) ;
   - LOT-02 : deux points ne sont pas des jeux mais des collections côté application (avantages de fidélité offerts et utilisés, collection d'interlocuteurs).
2. **LOT-03 (Écrire)** a inscrit sa liste pendant la mission (arrivée par la dernière fusion) ; **rien n'en est fait** : pages (blocs avec échéance et liens, commentaires ancrés, propriétés, présence), documents (intercalaires, partage externe, faits relevés), signatures (champs posés, rôle « en copie », relances planifiées), journal (humeur sur 5 niveaux, énergie, mercis : les noms des niveaux sont dans la fiche ME01, que je n'ai pas relue), base de connaissances, archives, relecture de F20. Les lots 01, 05, 07, 08 et 10 n'ont inscrit aucune liste à ce jour.
3. **Le chargeur n’écrit que huit jeux (et les avoirs, avec les factures) sur 101** : voir « Points à trancher ».
4. **Cyber** : le volume « beaucoup » n'est toujours pas éprouvé par un écran (§1.11, n° 4).

## Points à trancher (CO)

- **Collections d'accueil dans amn-api.** La liste `ALLOWED` d'amn-api est fermée. Huit jeux ont une collection d'accueil (sept dont la forme est prouvée par `compat.ts`, plus les tâches) ; les **92 autres** (hors avoirs, rangés avec les factures) n’ont pas de collection confirmée (équipe, tickets, paiements, abonnements, contrats, mouvements, bulletins, partenaires, Écrire, Échanger, Créer, Outils, La Garde, Cyber…). Ouvrir des collections, ou dire dans quelles collections existantes les ranger, est une décision du CO et un travail côté amn-api. Tant que ce n'est pas fait, l'application d'essai ne voit que ces huit jeux.
- **La Garde dans l'API d'essai.** `seed-supervision.mjs` écrit dans un **fichier** sqlite de bac à sable ; `scripts/qualite/api-essai.mjs` (T1) travaille en mémoire. Proposition : T1 ajoute à `api-essai.mjs` une base sur fichier facultative (une variable d'environnement), et `--garde` fonctionne tel quel. Vérifié avec une copie locale de `api-essai.mjs` qui prend le chemin d'un fichier : le parc de supervision s'écrit bien.
- **L'heure de Cyber.** Les fiches donnent le jour (mardi 3 nov.), pas l'heure : j'ai pris 10 h 42, comme le bureau.
- **Le runner de charge démarre sa propre API d'essai** (même code, `createApp`, base en mémoire ou fichier jetable, 127.0.0.1) au lieu de viser le port 4171 : il doit créer des organisations, ce que l'API n'offre pas depuis l'extérieur. Est-ce acceptable pour « contre l'API d'essai » ?
- **Règles ajoutées comme propositions** : paliers de série 5, 10, 20, 30, 50, 100 (H04) ; « à reporter » = non faites dont l'échéance tombe dans la semaine ; « nouveaux clients actifs » (G08) = clients du mois au statut actif ; le prévisionnel de H09 vient de la liste `mouvements` (MA07) ; fourchette = entrées retardées de 15 jours / entrées à l'échéance ; coût d'embauche saisi (3 200 € par mois, jamais calculé), premier prélèvement le 1er du mois, trois mois après le mois courant.

## Signalement

Aucun point faible d'amn-api n'a été trouvé par ces essais.

## Ce qui n'a pas été vérifié

- **Aucun écran n'a encore consommé** ces jeux ni ces attendus : tout est vérifié par le compilateur et 118 contrôles, pas en situation. Pas de navigateur.
- **Les chiffres de charge ne valent pas pour le serveur réel** (même processus pour le serveur et les personnes simulées). Le palier de 1 000 organisations connectées et les 72 h n'ont pas été joués : seulement 100 organisations dont 20 connectées pendant 30 s, des paliers jusqu'à 40, et 80 s d'essai long avec coupures et redémarrages.
- **Le chargeur a été essayé** sur une API d'essai locale (volumes « peu », « normal » et « vide », retour d'un volume à l'autre, refus des cibles et des comptes) mais **pas** contre le port 4171 de T1.
- **Les formes des huit collections** sont celles de `compat.ts` ; les tâches n'y figurent pas (leur type dans le dépôt est lâche) et n'ont pas de champ `priority` : un écran qui l'exigerait le dira.
- **Plausibilité des montants et des noms** : relue à l'œil sur un échantillon, pas validée.

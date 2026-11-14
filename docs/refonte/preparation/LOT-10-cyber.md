# LOT-10 · Cyber — note de préparation (S8, 14 nov.)

Lot confié à S8 le 14 nov. (STATUT, journal 11h35), avec l'accord de l'utilisateur. Branche `claude/refonte-cyber`, partie de
`refonte-vivante` @ `8fcc60a`. Sources lues : `05-CYBER-MODELE-COMMUN.md`, `PROMPT-LOT-10-cyber.md`, les 14 fiches
`lots/LOT-10-cyber/CY*.md` et leurs images (dossier v4, hors dépôt), STATUT §1.7, §1.10 (points 9 à 15), §1.42, section
LOT-10 du §7, `REGLES.md` (partage de `src/bureaux/cyber/**`), les jeux de SIM (`src/refonte/donnees/cyber.ts`).

**Hors de ce lot pour l'instant** : les 4 `CYB-*` (vulnérabilités, rapport d'audit, playbook, chiffrage), sans fiche ;
les prix de `CYB-chiffrage` sont à Harun.

## 1. Règles du lot (rappel, elles priment sur tout)

1. **Accord d'abord.** Un outil « Accord requis » reste désactivé tant qu'une mission ne porte pas un accord **signé et
   valide** couvrant le client, le périmètre et les dates ; la raison est écrite à côté (« Joins l'accord signé à une
   mission »). Règle pure, testée, partagée par tous les écrans (§4).
2. **OSINT (CY06)** : accord signé valide exigé avant **toute** recherche, même passive (STATUT §1.10 n° 9) ; seulement
   l'organisation du client ; « Personnes privées : Exclues », jamais réglable ; aucun profil d'individu.
3. **Interface seulement.** Aucun collecteur, aucun scanner, aucune charge, aucune procédure, aucun détail technique de
   faille, aucun contenu de fuite ni de preuve. Les écrans montrent des comptes, des états, des dates et des liens.
4. **Aucune donnée réelle** : les jeux de SIM pour un compte d'essai `@exemple.test`, avec l'étiquette « Données
   d'exemple » ; tout autre compte voit l'état « à brancher » (même porte que LOT-11). Jour de référence Cyber :
   mardi 3 nov. 2026 (`maintenantCyberDe`).
5. **Dépôt public** : rien qui décrive une faiblesse, dans le code, les commentaires, les commits ou les documents.
   Aucun secret, aucune adresse IP, aucun numéro de téléphone affiché. S6 relit la sécurité du lot avant sa fusion.
6. **Ludique sobre** : séries, jalons, badges d'équipe, défi de la semaine ; jamais de classement entre personnes,
   jamais de point perdu, jamais d'animation de célébration. Les trophées de Cyber sont protégés (STATUT §1.10).
7. **Textes** : les fiches sont écrites au vouvoiement (v3) ; l'interface v4 est au **tutoiement**
   (`06-V4-NEON-ET-TUTOIEMENT.md`, `check:tutoiement`). Les textes des fiches sont repris mot pour mot, passés au
   tutoiement.
8. **Couleurs** : celles de la famille Cyber du socle v4 (`--fam-a` / `--fam-b`, `#FF6B7A` / `#A58BFF`, posées par la
   coquille), jamais écrites à la main ; les couleurs de niveaux de CY09 passent par les jetons d'état du socle.

## 2. Les écrans

| Ordre | ID | Écran | Construire | Attend |
|---|---|---|---|---|
| 1 | CY01 | Vue d'ensemble | maintenant | ses tuiles CY04, CY07, CY11 et CY12 : « à brancher » d'ici là |
| 2 | CY02 | Red Team | maintenant | — |
| 3 | CY03 | Blue Team | maintenant | — |
| 4 | CY05 | Veille | maintenant | — |
| 5 | CY06 | OSINT | maintenant | — |
| 6 | CY08 | Réponse à incident | maintenant | lit l'incident de La Garde (H32) en lecture seule |
| 7 | CY09 | Conformité | maintenant | — |
| 8 | CY10 | Sensibilisation | maintenant | — |
| 9 | CY14 | Dossier de mission | maintenant | — |
| — | CY04 | SOC | non | renvoi avec F70 (LOT-08) |
| — | CY07 | Sites et vie privée | non | étend MO02 (LOT-07) |
| — | CY11 | Automatisation | non | s'appuie sur H20 (LOT-07) |
| — | CY12 | Missions | non | s'appuie sur H03 (LOT-01) |
| — | CY13 | Documents | non | s'appuie sur H11 et H12 (LOT-03) |

CY14 vient avant CY12 parce qu'il ne lit que les jeux Cyber (mission, accord, constats, journal) ; la liste des
missions (CY12) attend H03.

## 3. Origines et données, écran par écran

« SIM » = champ présent dans `construireMonde()` ; « manque » = à demander à SIM (§6).

- **CY01 Vue d'ensemble.** Nouveau ; remplace l'accueil du bureau Cyber (`/cyber`, `bureaux/cyber/Accueil.tsx`, le
  « rempart ») par substitution. Mosaïque 5 × 2 de tuiles vivantes, rail des missions, accords qui expirent, défi
  « Zéro alerte en attente ». Chaque tuile reprend **la fonction de calcul** de son écran (aucun second calcul) : une
  tuile dont l'écran n'est pas construit affiche « à brancher ». SIM : `missions`, `accords`, `constats`, `outilsCyber`.
- **CY02 Red Team.** Chaîne de mission en 5 phases, liste d'outils avec leur verrou d'accord, sceau d'accord,
  constats par gravité. SIM : `missions` (famille Red Team), `accords` (`perimetre.domaines`, `locaux`, `creneau`),
  `constats`, `outilsCyber`. Manque : le **type de cible** d'un outil (domaine, adresse, locaux) pour « Locaux non
  inclus » ; les **sous-étapes** d'une phase ; le **journal** de mission (« N entrées »).
- **CY03 Blue Team.** Carte de chaleur des appareils, panneau d'appareil, quatre anneaux. SIM : `parcSecurite`
  (agrégats par client). Manque : les **appareils un par un** (type poste ou serveur, dernier contact, correctifs en
  attente, antivirus, sauvegarde) ; les comptes avec double validation existent en agrégat. Sans appareils, la carte de
  chaleur ne peut pas être fidèle : je la dessine depuis les agrégats (une case par appareil compté, sans nom) et je le
  justifie, ou j'attends SIM (question au CO).
- **CY05 Veille.** Radar par gravité et proximité, « Ce qui te concerne », série de veille. SIM : `alertesVeille`,
  `logicielsClients` (`concerneParVeille`, `correctifDisponible`), `fuites` (compteurs seulement). Manque : le
  **score publié** (seuils Critique / Importante / Modérée), la **catégorie** du logiciel (secteur du radar), l'éditeur
  (anneau « Même éditeur »), la **série** du digest du matin.
- **CY06 OSINT.** Graphe d'empreinte, frise sur 30 jours, périmètre de la mission, élément sélectionné, carte « Avant
  de chercher ». SIM : `missions` (famille OSINT), `accords`. Manque : l'entité **Élément d'empreinte** (catégorie
  parmi 7, valeur montrée **sans contenu sensible**, source, date, niveau, état). Le cadre est vérifié **avant** tout
  affichage d'action : sans accord signé valide, « Nouvelle recherche » et « Actualiser » sont désactivés.
- **CY08 Réponse à incident.** Salle de crise : chronomètre, échéance de notification à 72 h, playbook « compte
  compromis », qui fait quoi, journal de communication, preuves. S'appuie sur l'incident de La Garde (H32) **en
  lecture** (fichier `FicheIncident.tsx` à LOT-08, non modifié). SIM : `incidents`. Manque : le **modèle de playbook**
  (étapes par type), les **rôles** dans l'incident, le **journal de communication**, la liste des **preuves** (nom,
  empreinte vérifiée, jamais le contenu), « données personnelles concernées ».
- **CY09 Conformité.** Matrice 10 contrôles × 7 clients à 5 niveaux de maturité, anneaux par référentiel, tiroir des
  preuves. SIM : `dossiersConformite` (RGPD seulement, points vrai / faux), `criteresMaturite`. Manque : les
  **niveaux** 0 à 4 par case, les référentiels Sécurité de base et NIS2, les preuves attendues et jointes, la date de
  revue. Liste des contrôles « à valider par un conseiller » (fiche) : je la mets dans un catalogue de données, jamais
  dans le code.
- **CY10 Sensibilisation.** Campagne en entonnoir avec son accord, résultats **par équipe** (jamais par personne),
  parcours de 5 modules, badges d'équipe. SIM : `campagnes` (comptes agrégés par équipe). Manque : le **parcours de
  formation** (modules, état par équipe, prochain quiz) et l'historique des 6 campagnes pour la mini-courbe. Garde-fous
  de la fiche tenus par construction : aucune liste de personnes, équipe de moins de 5 regroupée.
- **CY14 Dossier de mission.** Onglets de dossiers, chemise, sceau d'accord, frise à axe brisé, périmètre (nombre
  d'adresses sans les afficher), constats, journal, équipe. SIM : `missions`, `accords`, `constats`, `documentsCyber`.
  Manque : le **journal** de mission (entrées typées, résumés généraux), l'équipe et le contact d'urgence (« joignable
  19 h à 7 h », jamais le numéro).

## 4. Logique pure (avant les écrans, testée par une garde `check:cyber`)

Dans `src/refonte/cyber/`, sans composant :

- `accords.ts` : état d'un accord (reprend `etatAccord` de SIM : Valide, Expire bientôt à 30 jours, Expiré, En
  attente), jours restants, part écoulée, et **la règle de verrouillage d'un outil** : `Interne` et `Passif` toujours
  possibles, `Accord requis` seulement si l'accord est Valide ou Expire bientôt **et** si son périmètre contient le
  type de cible de l'outil ; sinon la raison (« Locaux non inclus », « Hors accord, avenant requis », « Joins l'accord
  signé à une mission »). Pour CY06, la règle plus stricte : toute recherche exige un accord valide.
- `missions.ts` : phase courante, avancement, mission affichée (non terminée, échéance la plus proche), rail de CY01.
- `constats.ts` : comptes ouverts par gravité, déjà corrigés.
- `veille.ts`, `conformite.ts`, `sensibilisation.ts`, `incident.ts` : les règles des rubriques 6 (anneaux, seuils,
  statuts, échéance à 72 h, comptes de l'entonnoir) — seuils marqués « Proposition » rangés dans un fichier de
  réglages, jamais dispersés.
- La garde `check:cyber` (ajoutée à `package.json` et `editions.yml`, ajout seulement) teste ces règles, dont les cas
  négatifs : un outil « Accord requis » sans accord, avec un accord expiré, hors périmètre, est refusé ; une recherche
  OSINT sans accord est refusée ; aucune liste de personnes dans les résultats de CY10. Elle vérifie aussi qu'aucun
  fichier du lot ne contient d'adresse IP, de numéro de téléphone ni de motif de secret.

## 5. Intégration (questions au CO)

1. **Routes.** Proposition : CY01 remplace `/cyber` par substitution ; les écrans neufs prennent `/cyber/red-team`,
   `/cyber/blue-team`, `/cyber/veille`, `/cyber/osint`, `/cyber/reponse-incident`, `/cyber/conformite`,
   `/cyber/sensibilisation`, `/cyber/dossier`. Les écrans de l'ancien bureau restent à leurs routes (aucun n'est
   supprimé) tant que le CO n'a pas décidé lesquels les CY remplacent : `Vulnerabilites` ↔ CY05, `Inventaire` ↔
   CY03, `Playbooks` et `Crise` ↔ CY08, `Hameconnage` ↔ CY10, `Surface` ↔ CY06 (proposition, à confirmer).
2. **Registre.** STATUT §1.7 : Cyber n'entre ni dans les 7 familles de base ni dans le total de D02. Le registre ne
   connaît pas de famille « contextuelle » ; la correction de `check:navigation` (101 + écrans neufs) compterait les
   écrans Cyber dans le total. Faut-il déclarer `declarations/cyber.ts` (famille hors total, à ajouter au registre par
   S5) ou garder les écrans Cyber hors registre, atteints par la barre et par CY01 ?
3. **Barre latérale.** L'entrée Cyber (section SURVEILLANCE) n'a pas de sous-liste aujourd'hui (`modules: []`). Le
   modèle commun veut Red Team, Blue Team, SOC, Veille, OSINT, Missions, dépliés sur les écrans Cyber : c'est la
   coquille (S0). Je propose une sous-liste déclarée par le lot, comme celle de Développement.
4. **Compteur.** `compteurs/cyber.ts` (S0) compte les alertes du bureau (`useCyber`) : je n'y touche pas.
5. **CY03 sans appareils** : dessiner depuis les agrégats et justifier l'écart, ou attendre que SIM ajoute les
   appareils ?

## 6. Données à demander à SIM

Type de cible d'un outil ; sous-étapes et journal de mission ; appareils un par un (CY03) ; score publié, catégorie et
éditeur d'une faille, série du digest (CY05) ; Élément d'empreinte (CY06) ; playbook, rôles, journal de communication,
preuves (CY08) ; niveaux de maturité par case, référentiels Sécurité de base et NIS2, preuves (CY09) ; parcours de
formation et historique des campagnes (CY10) ; équipe et créneau de joignabilité d'une mission (CY14). Aucun de ces
champs ne contient de donnée sensible : ce sont des états, des dates et des comptes.

## 7. Méthode (celle de LOT-11)

Un commit par écran ; aperçu `scripts/apercu/ecrans/CYxx.tsx` sur les jeux de SIM remplis, capturé à 1440 × 900 et
comparé à l'image ; `docs/qualite/fidelite/justifies-LOT-10.json` ; zones de clic de 36 px (§1.39) ; à chaque push, toutes
les gardes de `editions.yml` (`check:clavier` compris), `typecheck` des deux éditions, `lint`, `check:cyber`,
`build:web`, puis un message au CO. Aucun fichier de l'édition cliente touché.

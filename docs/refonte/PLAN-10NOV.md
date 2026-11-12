# Plan de la refonte — mise à jour du 10 novembre

> Tenu par le CO, d'après la directive de Harun du 10 nov. Résumé et décisions dans [`STATUT.md`](STATUT.md) §1.13 ; règles dans [`REGLES.md`](REGLES.md).

**Vision.** AMN Business (l'édition interne, `internal` dans le code) devient le seul outil de travail de l'équipe. Tout ce qu'on fait au quotidien s'y trouve et s'y fait.

---

## 1. Où en est le socle v3

- **S0 a fini** le socle v3 sur `claude/refonte-socle` (`8e7e771`, 6 nov.) :
  - les 9 écrans de LOT-00, dont G09 ;
  - les briques partagées (`ModuleTile`, `ModuleGroupGrid`, `AddModuleTile`, `PageHead`, `IconTile`…) ;
  - `useAujourdhui`, le mécanisme de substitution d'écrans, `check:coquille` sur la barre v3, `check:substitutions` et `check:client-statique` ;
  - la liste des composants, dans `rapports/LOT-00.md`.
- **Mohamed a validé le design.** Il reste trois étapes avant la fusion et la bascule de la coquille :
  1. **Passe finale de S0** (courte) : les 6 constats de sa seconde passe adverse, plus les réponses du CO à ses 14 questions (`STATUT.md` §1.13) ;
  2. **Passage 2 de T1** sur la pointe de `claude/refonte-socle` : paquet client comparé à `main`, gardes navigateur coquille éteinte puis allumée, fidélité des 9 écrans. T1 commence tout de suite sur `8e7e771` et relit seulement les écarts après la passe finale ;
  3. **Fusion par le CO** dans `claude/refonte-vivante`, puis bascule de la coquille par défaut.

---

## 2. Ordre des lots (mis à jour)

| Étape | Lots et sessions | Condition de départ |
|---|---|---|
| **Maintenant** | S0 passe finale · T1 passage 2 · **S6 phase 0 sécurité (rapport SEC)** · **SRV comparatif serveur (urgent)** · préparation de tous les lots (S2, S3, S1, S5, DS, S7) · SIM · F1 · **préparation de LOT-11 et LOT-12** | aucune |
| **Après la fusion du socle v3** | vague 1 : S2 (LOT-01) et S3 (LOT-08) ; vague 2 : S1 (LOT-02), S5 (LOT-03 puis LOT-05), DS (LOT-04), S7 (LOT-06) | socle v3 fusionné |
| **Après la phase 1 de S6** | S6 : LOT-07 Outils (Opus 5.5), puis LOT-10 Cyber | phase 1 finie |
| **Dès que les maquettes arrivent** | **LOT-11 Espace Développement** | fiches et images de Harun |
| **En même temps que LOT-07** | **LOT-12 Connecteurs et autonomie** : le modèle et les moteurs locaux ; H21 (LOT-07) en est l'écran | LOT-12 prêt avant les écrans de H21 |
| **Avant le 23 nov.** | **LOT-13 Serveur** : décision de Harun, puis migration sur son feu vert | comparatif rendu |
| **En continu, renforcé à partir de J − 6 semaines** | **LOT-14 Charge et essais longs** (SIM et T1) | chargeur de SIM ; serveur cible |
| **Avant toute distribution à l'équipe** | **SEC-0** (phase 0 de S6) puis **DIST** : distribution interne privée | rapport SEC rendu et lu |
| **En dernier** | S1 : LOT-09 Mobile et tablette | lots 01 à 08, 10 et 11 fusionnés |
| **Lancement client (dans 2 à 3 mois)** | après LOT-14 vert et SEC levée | décision de Harun |

---

## 3. Les deux espaces de travail

Chaque espace a sa page d'accueil, ses modules et ses signaux dans la barre latérale (compteur, voyant). Un module n'appartient qu'à une famille, mais il peut avoir une **seconde entrée** dans un espace (précédent validé : MO02 et CY07, « un seul module, deux entrées de menu »).

### 3.1 Espace Cyber (« Cyber », sans nom de personne)

**Déjà couvert par des fiches v3 et par l'existant ; rien de neuf à dessiner.**

| Besoin de Harun | Fiches v3 (lot) | Déjà dans l'app |
|---|---|---|
| Accueil | CY01 (LOT-10) | `src/bureaux/cyber/Accueil.tsx` |
| SOC | CY04 (LOT-10) ; N02, MG01, H32, MG02 (LOT-08) | `bureaux/cyber/Alertes`, `FicheIncident`, `Crise`, `Playbooks` |
| Audit | CY02 Red Team, CY09 Conformité (LOT-10) ; H34 Maturité SOC (LOT-08) | `Matrice`, `Surface`, `Inventaire`, `Vulnerabilites` |
| Veille | CY05 (LOT-10) | `src/lib/veille.ts`, `Echeances` |
| OSINT | CY06 (LOT-10), sous accord signé (04-B n° 9) | — |
| Rapports | CY13 Documents, CY14 Dossier de mission (LOT-10) | `bureaux/cyber/Rapports`, rapport client |
| Suivi des clients cyber | CY12 Missions (LOT-10) ; H30, H31, MG03 (LOT-08) | `bureaux/supervisor/*` |
| Aussi | CY03 Blue Team, CY07 Sites et vie privée (+ MO02), CY08 Réponse à incident, CY10 Sensibilisation (`Hameconnage`), CY11 Automatisation (+ H20) | |

Barre latérale : Cyber est **toujours visible** (section SURVEILLANCE), avec son compteur d'alertes du SOC (socle v3). Lots porteurs : **LOT-10** (S6) et **LOT-08** (S3).

### 3.2 Espace Développement

> **Mise à jour du 11 nov.** Les maquettes sont arrivées avec le dossier v4 : 7 images `DEV-*` et le brief `07-ESPACE-DEV.md`. Elles remplacent la proposition DV01 à DV10 ci-dessous. Place validée : au-dessus de « Surveillance ». Voir `STATUT.md` §1.14.

**Il n'a aucune fiche ni aucune image.** Il faut un lot de maquettes v3, comme Cyber l'a eu. L'existant donne une bonne base :

| Besoin de Harun | Fiches v3 réutilisables (seconde entrée) | Déjà dans l'app | À dessiner (proposition) |
|---|---|---|---|
| Accueil | — | `src/bureaux/studio/Accueil.tsx` (façade des projets) | **DV01 Vue d'ensemble** |
| Projets | MJ01 Projets (LOT-01) | `ProjectsScreen`, `bureaux/studio/Piece`, `ParCliente` | DV02 Projets de développement |
| Tickets | H03 Missions et tickets (LOT-01) | `TasksScreen` | (seconde entrée de H03) |
| Déploiements | — | `bureaux/studio/Livraison` (mises en ligne) | **DV03 Déploiements** |
| Dépôts | — | — | **DV04 Dépôts** (connecteur Code) |
| Environnements | MO02 Sites et trackers (LOT-07) | `SitesDashboard`, `SiteControl`, `Ssl`, `Tracker` | **DV05 Environnements** |
| Tests | — | `bureaux/studio/Recette`, `Performance`, `Accessibilite` | **DV06 Tests et recette** |
| Flux d'automatisation | H20 Automatisations (LOT-07), CY11 | `AutomationsScreen`, `AutomationsRunner` | (seconde entrée de H20) |
| Tâches planifiées | — | `ScheduleControl` | **DV07 Tâches planifiées** |
| Courriels automatiques | MX06 Réponses automatiques (LOT-05) | `src/lib/relances.ts` | **DV08 Courriels automatiques** |
| Scripts | — | — | **DV09 Scripts** (exécution locale, journal) |
| Journal | — | — | **DV10 Journal des exécutions** |

Proposition : **une dizaine de maquettes (DV01 à DV10)**, avec la place de Développement dans la barre latérale. Par défaut, une ligne « Développement » (icône code) juste au-dessus de la section SURVEILLANCE, toujours visible, dépliée sur ses écrans, avec deux signaux : déploiements en cours et tests en échec. La ligne en plus dans la barre est un écart accepté sur les 142 images existantes. Lot porteur : **LOT-11**, nouvelle session **S8** (Opus 5.5, effort élevé : déploiements et environnements touchent des secrets, toujours masqués).

---

## 4. Autonomie d'abord et connecteurs (LOT-12)

**Règle.** Tout ce que l'application peut faire seule, sur le poste ou sur notre serveur, elle le fait : courriels automatiques, rappels, relances, rapports, tri. Une API payante n'est jamais requise. Chaque API payante est un **connecteur facultatif de H21** :

- l'activer ou l'arrêter tient en **trois clics au plus** ;
- le **coût est affiché avant** l'activation, avec la date du tarif relevé et sa source ; jamais un chiffre inventé ;
- l'état est visible partout où il compte (« connecté / à connecter / arrêté »), et un connecteur arrêté laisse l'écran utilisable en mode local ;
- les clés restent côté serveur, chiffrées, affichées masquées ; elles ne passent ni par un chat, ni par un ticket, ni par un dépôt.

**Liste proposée** (local d'abord, payant ensuite ; tarifs à relever par LOT-12 au moment de construire) :

| Catégorie | Version locale, gratuite | Version externe ou payante (facultative) |
|---|---|---|
| Messagerie (courriel) | IMAP et SMTP de la boîte existante ; envois automatiques préparés et envoyés par l'application | API d'envoi en volume (Brevo, Mailjet, Postmark, Resend…) |
| Agenda | agenda intégré, export et abonnement ICS, CalDAV | Google Agenda (déjà étudié, `docs/google-agenda.md`), Microsoft 365 |
| Paiement | lien et QR de virement SEPA, suivi manuel | Stripe, Mollie, SumUp, GoCardless (prélèvement) |
| Banque (**lecture seule**) | import de relevés (CSV, OFX, CAMT.053) | agrégateur DSP2 en lecture seule ; jamais de virement (décision confirmée) |
| Stockage | disque du poste, sauvegardes chiffrées (MO03), stockage sur notre serveur | stockage objet S3 en UE, Drive, Dropbox |
| Hébergement | notre serveur (LOT-13) | Vercel, Render, Netlify (état des déploiements) |
| Code | Git local, ou forge auto-hébergée (Forgejo, Gitea) sur notre serveur | GitHub, GitLab |
| Notifications | notifications du système, Web Push (déjà là), ntfy auto-hébergé | service de notification mobile payant |
| SMS | passerelle SMS sur un téléphone Android de l'équipe | opérateur SMS (OVH, Brevo, Twilio…) |
| WhatsApp | lien `wa.me` et WhatsApp Web (envoi manuel préparé) | WhatsApp Business Platform, via un fournisseur |
| Téléphonie (H13) | appel dans l'application (WebRTC, déjà là) | ligne SIP (04-B n° 11, validé) |
| Signature | signature simple intégrée | Yousign, Docusign |
| Assistant Ajmani | modèles locaux (Ollama, Whisper, déjà là) | API d'un modèle en ligne |
| Comptabilité | export FEC (déjà là) | logiciel comptable en ligne |

Lot porteur : **LOT-12**, nouvelle session **S9** (Opus 5.5, effort élevé), relue par S6 et T1.

- **Zone** : `src/refonte/connecteurs/**`, avec le modèle (catalogue, état, coût, mode local) et les moteurs locaux.
- **H21** reste l'écran de LOT-07 (S6), construit sur ce modèle.
- **Limite connue** : l'envoi SMTP, le stockage chiffré des clés et l'exécution planifiée côté serveur relèvent d'amn-api, hors de ce dépôt (§9).

---

## 5. Serveur (LOT-13) : comparatif en lecture seule

> **Décision du 12 nov.** Serveur reporté, SRV en pause ; aucune distribution. Voir `STATUT.md` §1.16.

> **Décision du 11 nov.** 0 € ce mois-ci. Serveur maison d'abord : amn-api et Postgres dans Docker sur un poste de l'équipe, accès de Mohamed par Tailscale, rien d'exposé sur Internet. Le comparatif porte sur trois paliers (gratuit, environ 10 €/mois, environ 25 €/mois), achat décidé en décembre ; SRV écrit aussi le guide « serveur maison ». Aucune donnée réelle avant SEC-0. Voir `STATUT.md` §1.15.

**Contexte.** Render est trop cher, et sa base gratuite est restreinte jusqu'au **23 nov.** On vise un serveur à nous. **Aucune décision d'achat** : Harun tranche.

Le comparatif, à rendre **le 16 nov. au plus tard**, couvre au moins :

- **Offres** : VPS ou serveur dédié en UE, géré par nous (Hetzner, OVHcloud, Scaleway…) ; plateforme gérée en UE (Clever Cloud, Koyeb…) ; serveur physique chez nous. Pour chacune : **coût mensuel** pour notre besoin (API, base, WebSocket, sauvegardes), localisation UE et RGPD, sauvegardes, effort d'exploitation, sortie possible. Chaque prix porte sa date de relevé et sa source.
- **Ce qu'il faut migrer** : le service amn-api (Node, WebSocket), la base de données (export puis import, vérification), les variables d'environnement (listées par nom seulement), le domaine et le certificat, les sauvegardes, la supervision, les URL dans l'application. Plus un plan de bascule sans perte, avec retour arrière.
- **Recommandation** argumentée, et deux options de repli.

Session : **SRV** (Sonnet 5.5, effort élevé), en lecture seule, sur `claude/refonte-serveur`, livrable `docs/serveur/COMPARATIF.md` (aucun nom d'hôte interne, aucune adresse, aucun secret). La migration elle-même vient après la décision de Harun : un runbook, exécuté par Harun pour tout ce qui touche un secret.

---

## 6. Dépôt : seule l'édition Business est commitée

> ⚠ Piège de nommage : « édition Business » (AMN Business) = `internal` dans le code ; « Desktop client » (AMN Desktop) = `business` dans le code.

**Règle immédiate** (dans `REGLES.md`) : aucun commit nouveau sur l'édition cliente dans ce dépôt (`*.business.*`, `src/business/**`, déploiement de la cliente), sauf le jumeau vide d'une couture interne et les gardes d'isolation. Le code client déjà présent reste en l'état ; la CI continue de prouver que l'édition interne ne fuit pas dans le paquet client.

**Où garder le travail sur Desktop client** (Harun décide) :

| Option | Pour | Contre |
|---|---|---|
| **A. Un dépôt privé `amn-desktop-cliente`** (recommandée) | historique, sauvegarde, accès de l'équipe, CI possible | le code commun aux deux éditions se synchronise à la main |
| B. Passer **ce** dépôt en privé, et y garder les deux éditions | le plus simple ; règle aussi les documents déjà publiés et les Releases publiques (§8) | changement de visibilité, à décider |
| C. Un dossier local seulement | aucun outil | aucune sauvegarde, un seul poste, aucun suivi : déconseillé |

---

## 7. Facilité et chaleur (règles pour tous les lots ; S0 les met dans le socle)

**Facilité.**

- Chaque tâche courante se fait en **trois actions au plus**, depuis n'importe où (⌘K et ⌘J comptent pour une), sans manuel.
- T1 chronomètre les **20 tâches courantes** suivantes : voir sa journée ; cocher une tâche ; créer une tâche ; ajouter un rendez-vous ; créer un client ; écrire à un client ; créer et envoyer un devis ; créer une facture ; relancer un impayé ; noter une dépense ; ajouter une note ; déposer un document ; chercher n'importe quoi ; demander à Ajmani ; ouvrir une alerte de La Garde ; prendre en charge un incident ; lancer une ronde ; lancer une sauvegarde ; voir les déploiements ; reprendre où l'on s'était arrêté.

**Chaleur.**

- **Les mots** : phrases courtes et simples, tutoiement dans l'interface (v4 ; vouvoiement pour les textes destinés aux clients), aucun reproche, aucune urgence inventée. Une phrase d'encouragement quand une tâche est finie : une seule, sans confettis ni son.
- **Le rythme** : peu de choses à la fois, trois éléments mis en avant au plus, calme visuel, contrastes doux (jetons du socle), deux ou trois animations continues au plus (socle §0.2).
- **Les petites attentions** : salutation selon l'heure (`src/lib/homeGreetings.ts`), reprise là où l'on s'était arrêté (déjà en place dans la coque), mémoire des filtres et des onglets.
- **Jamais** de robot, de mascotte ni de personnage.
- **Dans le socle** : S0 ajoute un guide de voix (tournures, encouragements, salutations) et l'étend à `check:voix`. Chaque lot l'applique à ses textes, et T1 relit.

---

## 8. Sécurité, distribution et lancement

- **SEC-0 avant toute distribution.** La phase 0 de S6 (rapport SEC, privé) passe avant toute distribution de l'application aux membres de l'équipe.
- **Aucune Release interne publique.** Fait vérifié : `.github/workflows/release.yml` publie l'installeur de l'édition interne dans les **Releases GitHub de ce dépôt, qui est public**, quand on pousse un tag `v*`, et la mise à jour automatique de l'application les lit. La règle « aucun tag `v*` » empêche toute publication. Pour la rendre impossible, il faut protéger les tags `v*` par une règle du dépôt GitHub (action de Harun).
- **DIST** (après SEC-0) : la distribution interne doit être privée. Options : Releases d'un dépôt privé ; téléchargement authentifié sur notre serveur (LOT-13) ; remise manuelle de l'installeur. Le canal de mise à jour automatique doit suivre le même choix. S6 donne son avis, Harun tranche.

**Lancement client (dans 2 à 3 mois) : LOT-14 Charge et essais longs** (SIM et T1) :

- **charge** : N postes simultanés, organisations de 10 à 600 personnes, pics de synchronisation, présence temps réel ;
- **essais longs** : 72 h en continu, redémarrages, coupures réseau, écritures concurrentes, reprise après plantage ;
- **sur le bac à sable d'abord, puis sur le serveur cible** (LOT-13) ;
- **seuils à atteindre**, fixés avec Harun (nombre de clientes et d'utilisateurs au lancement).

Les points faibles déjà trouvés par SIM dans amn-api se corrigent **dans amn-api**, hors de ce dépôt, avant le lancement : écrasement concurrent (haute), lot d'événements non atomique, présence en N³, route manquante.

---

## 9. Ce que le CO demande à Harun

1. **Maquettes de l'Espace Développement** : fiches et images v3 de DV01 à DV10 (ou votre liste), avec la place de « Développement » dans la barre latérale (défaut proposé au §3.2).
2. **Créer trois sessions** : **S8** (LOT-11 Développement, Opus 5.5, élevé), **S9** (LOT-12 Connecteurs, Opus 5.5, élevé), **SRV** (LOT-13 Serveur, Sonnet 5.5, élevé, en lecture seule). Attachez le dépôt amn-api à SRV, en lecture.
3. **Serveur** : ce qui tourne sur Render (services, taille de la base, trafic), votre budget mensuel maximum, et votre décision après le comparatif (rendu au plus tard le 16 nov., avant l'échéance du 23).
4. **Dépôt** : l'option A, B ou C du §6 (le CO recommande A).
5. **Distribution** : tags `v*` protégés et workflow de publication désactivé (fait le 12 nov.) ; puis choisir le canal privé (§8) après le rapport SEC.
6. **amn-api** : Harun est responsable, avec Mohamed comme suppléant (décidé le 12 nov.). Les corrections se font hors du dépôt public.
7. **Lancement** : les chiffres cibles pour les tests de charge (clientes, utilisateurs par cliente, postes simultanés).
8. **Images manquantes pour S0** : les images de F10, F30, F50, F70, MR06, MR09, H16, N01 et H18, ou les zips des lots 01, 02, 04, 06, 07 et 08, pour lever le « provisoire » de quelques briques.
9. **Réglage** : S6 pour LOT-07 en Opus 5.5, effort élevé (au lieu de Sonnet).

---

## 10. Prompts courts des sessions qui démarrent ou repartent maintenant

### S0 — passe finale du socle v3 (même session)

```
Passe finale du socle v3 sur claude/refonte-socle, avant la fusion par le CO. Lis STATUT.md §1.13 (sur claude/refonte-vivante) : le CO y tranche tes 14 questions et tes 6 constats.
1. Corrige les constats 1 à 6 de ta seconde passe adverse avec le plus petit correctif que tu as proposé (segment survolé, Kpi avec title, gardes check:socle-briques, check:socle et check:coquille plus strictes, démo), ainsi que « -0,00 € ».
2. Applique les réponses du §1.13 qui touchent le socle : zone de clic de 34 px sans changer le dessin, compteurs (la déclaration du module l'emporte), FournisseurAujourdhui au-dessus des deux coquilles, sept routes exactes pour les hubs, références du socle sorties de src/index.css (C-001), captures PNG de la racine retirées, drapeau « critique » prêt à lire dans D02.
3. Ajoute au socle le guide de voix (PLAN-10NOV.md §7) et étends check:voix.
4. Gardes vertes, push, message au CO avec le sha. T1 relit les écarts, puis le CO fusionne et bascule la coquille.
Branches seulement, jamais main, aucun tag v*, aucune release, aucun secret.
```

### T1 — passage 2 sur le socle v3 (même session)

```
Passage 2 maintenant, sur origin/claude/refonte-socle @ 8e7e771 (Mohamed a validé le design) : paquet client comparé à main ; gardes navigateur sur l'édition interne, coquille éteinte puis allumée ; fidélité des 9 écrans de LOT-00. Résultat dans docs/qualite/SANTE.md et ECARTS-LOT-00-v3.md, message au CO. Quand S0 aura poussé sa passe finale, ne relis que la différence.
Ensuite : la liste des 20 tâches courantes (PLAN-10NOV.md §7), chronométrées en nombre d'actions, sur le bac à sable.
Règles inchangées (build:web sur 127.0.0.1 et données fictives seulement ; aucun constat de sécurité dans docs/qualite/).
```

### SRV — comparatif serveur (nouvelle session, Sonnet 5.5, effort élevé)

```
Vous êtes SRV, session de la refonte d'AMN Business chargée d'un comparatif d'hébergement, EN LECTURE SEULE : vous ne créez aucun compte, n'achetez rien, ne touchez à aucun serveur ni à aucun secret.
Branche : claude/refonte-serveur, depuis origin/claude/refonte-vivante. Livrable : docs/serveur/COMPARATIF.md, le 16 novembre au plus tard (la base gratuite actuelle est restreinte jusqu'au 23 nov.).
Lisez docs/refonte/PLAN-10NOV.md §5 et REGLES.md. Comparez au moins : VPS ou serveur dédié en UE géré par nous (Hetzner, OVHcloud, Scaleway…), plateforme gérée en UE (Clever Cloud, Koyeb…), serveur physique chez nous. Pour chacun : coût mensuel pour notre besoin (API Node avec WebSocket, base de données, sauvegardes), localisation UE et RGPD, sauvegardes, effort d'exploitation, sortie possible. Chaque prix porte sa source et sa date de relevé ; un prix introuvable est marqué « à vérifier », jamais deviné.
Listez ce qu'il faut migrer (service, base, variables d'environnement par NOM seulement, domaine, certificat, sauvegardes, supervision, URL dans l'application), et un plan de bascule sans perte avec retour arrière. Terminez par une recommandation et deux options de repli. Aucune décision : c'est Harun qui tranche.
Si le dépôt amn-api vous est attaché, lisez-le pour connaître le besoin réel ; sinon, demandez les chiffres à Harun par le CO.
Aucun secret, aucun nom d'hôte interne, aucune adresse IP dans le document (le dépôt est public). Branches seulement : jamais main, pas de PR, aucun tag v*, aucune release.
Fin : commit, push, message au CO : branche, sha, recommandation en trois lignes.
```

### S8 — LOT-11 Espace Développement, préparation (nouvelle session, Opus 5.5, effort élevé)

```
Vous êtes S8, session du lot LOT-11 Espace Développement de la refonte d'AMN Business (édition interne). Les maquettes n'existent pas encore : MODE PRÉPARATION, aucun écran visuel.
Branche : claude/refonte-developpement, depuis origin/claude/refonte-vivante. Lisez REGLES.md, STATUT.md et PLAN-10NOV.md (§3.2, §4, §7).
1. Inventaire : src/bureaux/studio/**, les écrans projets, tâches, automatisations, sites, SSL et tracker, et les fiches v3 MJ01, H03, H20, MO02, MO03, H21, MX06 et CY11 du zip v3. Note : docs/refonte/preparation/LOT-11-developpement.md (par besoin : ce qui existe, ce qui manque, ce qui dépend d'un connecteur de LOT-12).
2. Une proposition de contenu pour chaque maquette DV01 à DV10, en texte seulement, à remettre à Harun pour le dessin.
3. La logique pure, quand elle ne dépend d'aucun connecteur, dans src/refonte/developpement/ (journal des exécutions, tâches planifiées locales), avec sa garde check:developpement.
Secrets des environnements : jamais affichés, toujours masqués, jamais dans le dépôt. Ne lancez pas l'app. Branches seulement : jamais main, pas de PR, aucun tag v*, aucune release, aucun déploiement.
Fin : gardes vertes (typecheck, typecheck:business, lint, check:socle, check:navigation, check:donnees, la vôtre), commit, push, message au CO.
```

### S9 — LOT-12 Connecteurs et autonomie, préparation (nouvelle session, Opus 5.5, effort élevé)

```
Vous êtes S9, session du lot LOT-12 Connecteurs et autonomie de la refonte d'AMN Business (édition interne). MODE PRÉPARATION jusqu'à la fusion du socle v3 et l'arrivée de H21 (LOT-07, S6) : aucun écran visuel.
Branche : claude/refonte-connecteurs, depuis origin/claude/refonte-vivante. Zone : src/refonte/connecteurs/**. Lisez REGLES.md, STATUT.md et PLAN-10NOV.md §4.
1. Le modèle des connecteurs : catalogue par catégories (la liste du §4), mode local et mode externe, état (connecté, à connecter, arrêté), coût affiché avant activation (tarif, source, date de relevé ; jamais deviné), activation et arrêt en trois clics au plus.
2. Les moteurs locaux, d'abord sur l'existant (src/lib/relances.ts, AutomationsRunner, rapports, sauvegardes) : courriels automatiques par la boîte de l'équipe, rappels, relances, rapports, tri. Tout ce qui demande amn-api (envoi SMTP serveur, clés chiffrées, tâches planifiées serveur) va dans une liste « Demandé à amn-api », sans le contourner.
3. Note docs/refonte/preparation/LOT-12-connecteurs.md, et garde check:connecteurs.
Aucune clé dans le code, les journaux, un chat, un ticket ou un commit ; valeurs toujours masquées ; rien qui décrive une faiblesse de sécurité (le dépôt est public). S6 et T1 relisent avant toute fusion. Ne lancez pas l'app. Branches seulement : jamais main, pas de PR, aucun tag v*, aucune release.
Fin : gardes vertes, commit, push, message au CO.
```

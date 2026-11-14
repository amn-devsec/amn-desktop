# LOT-05 · Échanger — note de préparation

> Branche `claude/refonte-echanger`, partie de `claude/refonte-vivante` @ `892c436`. Rédigée le 14 nov. 2026 par S5, en mode PRÉPARATION (socle v4 non fusionné : aucun écran visuel, aucune brique de `src/socle/ui`).
> Sources : le dossier v4 reçu le 14 nov. (`00-LISEZ-MOI`, `06-V4-NEON-ET-TUTOIEMENT` qui l'emporte sur `01`, `02`, `03`, `04`, les 10 fiches de `lots/LOT-05-echanger/`, `_data/tutoiement.json`) ; les modules du dépôt (relevé du 14 nov.) ; le modèle des connecteurs de S9 (`src/refonte/connecteurs/`) ; les jeux fictifs de SIM (`src/refonte/donnees/`). **Les images v4 ne sont pas ouvertes ici** : les valeurs d'exemple viennent des fiches ; la fidélité à ± 2 px reste à vérifier à la construction.
> Rien dans ce document ne décrit une faiblesse de sécurité ; aucune donnée réelle.

## 1. En bref

- **Logique pure livrée** : `src/refonte/echanger/` (14 fichiers, sans React ni brique visuelle) et `scripts/check-echanger.ts` (`npm run check:echanger`, **94 contrôles**, ajouté à `package.json` et `editions.yml`). Les cas sont écrits à la main d'après la rubrique 6 de chaque fiche, puis rejoués sur les jeux fictifs aux volumes `vide`, `peu`, `normal`, `beaucoup`.
- **G07 devient la boîte des CLIENTS** (courriel, WhatsApp, SMS) ; les échanges internes passent par Canaux (MX04) : la logique de `boite.ts` ne lit jamais les messages d'équipe. WhatsApp, SMS, le courriel et la téléphonie sont des **prises de la baie de S9** : `connecteurs.ts` lit leur état (`etatDePrise`) et dit « connecteur à brancher », « à reconnecter », sans rien simuler.
- **H13 sans ligne pro** : `modeDAppel` répond `application-seulement` tant que la prise « téléphonie » n'est pas branchée et en forme (pas de pavé, pas de pièce « Standard »).
- **Ce qui part chez un client reste au vouvoiement** : `reponsesAuto.ts` ne produit aucun texte client ; il **repère le tutoiement** dans un modèle destiné à un client (`tutoiementDansUnTexteClient`). L'interface (`i18n.ts`, ≈ 100 clés fr/en) tutoie.
- **Quatre écrans n'ont pas de module dans le dépôt** (MX01 Courriel, MX03 Partage de fichiers, MX06 Réponses automatiques, et G07 tel que décrit) : ils s'ajouteront au registre avec leur écran (§4). Aucune collection synchronisée n'est ajoutée sans l'accord de Harun (§1.27 n° 4) : en attendant, « non disponible », avec la raison.
- **Six questions pour le CO** (§6).

## 2. Tableau récapitulatif

| ID | Écran | Type | Module existant (route) | Registre (famille › vue) | Logique livrée (`src/refonte/echanger/`) |
|---|---|---|---|---|---|
| F40 | Vue d'ensemble | nouveau | aucun ; repli `/ensemble/<famille>` | hors registre (hub) | `hub.ts` |
| G07 | Messagerie (clients) | mixte | **aucun** : les écrans actuels (`DirectMessagesScreen` `/messages-prives`, `TeamScreen`) sont internes | échanger › `dm` + `groups` + `team` aujourd'hui (voir §4) | `boite.ts`, `connecteurs.ts` |
| H13 | Appels et salles | mixte | `CallsScreen` (`/appels`, `calls`, `CallContext`) ; `SallesScreen` (`/salles`, `roomBookings`) | échanger › `calls` + `rooms` | `appels.ts` |
| H14 | Annonces | mixte | `AnnouncementsScreen` (`/annonces`, `announcements` : titre, texte, auteur, `readBy`) | échanger › `announcements` | `annonces.ts` |
| MX01 | Courriel | mixte (en fait nouveau) | **aucun** écran de boîte partagée ; seul `NewsletterScreen` (`/lettre`) envoie du courriel | à ajouter | `courriel.ts` |
| MX02 | Réunions | mixte | `MeetingsScreen` (`/reunions`, `meetings` : titre, heure, durée, suites) | échanger › `meetings` | `reunions.ts` |
| MX03 | Partage de fichiers | mixte (en fait nouveau) | **aucun** | à ajouter | `partages.ts` |
| MX04 | Canaux | mixte | `GroupsScreen` (`/groupes`, `groups` + `groupMessages`), `DirectMessagesScreen` (`dms`) | échanger › `groups` (et `dm`, `team`) | `canaux.ts` |
| MX05 | Sondages | mixte | `PollsScreen` (`/sondages`, `polls` : question, options, votes, anonyme, clôture) | échanger › `polls` | `sondages.ts` |
| MX06 | Réponses automatiques | mixte (en fait nouveau) | **aucun** ; le plus proche : `AutomationsScreen` (moteur de H20) | à ajouter | `reponsesAuto.ts` |

Aides communes : `commun.ts` (heure de Paris avec heure d'été et d'hiver, `instantParis`, jours ouvrés, formats, temps d'attente « 6 min » / « 1 h 05 » / « hier », compteur d'appel). Une partie fait double emploi avec `src/socle/formats.ts` (socle v4, non fusionné) : à supprimer au profit du socle à la fusion (§1.27 n° 7). Textes : `i18n.ts` et `phrases.ts`.

## 3. Écran par écran

Légende : **Existant** = ce que le dépôt fait aujourd'hui ; **Manque** = ce que la fiche demande et que le modèle réel n'a pas ; **Prêt** = ce que la logique couvre déjà.

### F40 · Vue d'ensemble
- **Existant** : rien. **Prêt** : la règle d'attente (échelle en **racine carrée**, orange au-delà de la promesse de 2 h ouvrées, jamais rouge ; « Personne n'attend de réponse. Belle matinée. » selon l'heure), la présence « lit / écrit » (état présent seulement, **aucun historique**), les canaux actifs (message dans les 2 dernières heures, barres par tranche de 5 min plafonnées à 4), « n messages depuis 8 h », la suggestion de résumé (> 20 messages et ≥ 3 canaux actifs), les cases du jour (2 « Répondre à… » + « Archiver N messages lus », cochées seules), les **dix tuiles** (orange quand une action est attendue).
- **Choix** : le dixième module, « Messages programmés », porte un nom **proposé** par la fiche ; il lit les envois programmés de MX01.

### G07 · Messagerie (boîte des clients)
- **Existant** : aucun écran de boîte des clients. Les conversations du dépôt sont internes. **Manque** : le canal de chaque message, l'état de tri, la note interne, le rattachement à une fiche client par adresse ou numéro, WhatsApp et SMS (prises de la baie).
- **Prêt** : un fil par client, trois couloirs (**À répondre** : le plus ancien d'abord ; **En attente** : l'équipe a répondu ou posé « A », un nouveau message du client fait revenir le fil ; **Fait** : remis à zéro chaque nuit, l'historique reste), temps d'attente (le **plus ancien** message sans réponse, en heures ouvrées lun.–ven. 9–18), filtres de canal, **Boîte à zéro** (« 12 sur 17 » = 71 %, carrés dans l'ordre fait / en attente / à répondre, « encore 5 réponses et c'est fini », « Boîte à zéro, belle journée », journée calme), **belle série** (soirs de suite à zéro à 19 h, jours ouvrés, une journée manquée remet à zéro **sans message négatif**), bande de contexte client (« Rien à signaler » plutôt qu'un vide), canal de réponse (grisé si la prise est à reconnecter), note interne jamais exportée, expéditeur inconnu (« ? » puis « Rattacher à un client »), numéro jamais montré en entier.
- **Choix** : « fils du jour » = ceux qui ont écrit aujourd'hui, **plus** ceux qui attendent encore une réponse (de n'importe quand) ; sinon la Boîte à zéro ne pourrait pas être « atteinte » tant qu'un fil de la veille reste sans réponse.

### H13 · Appels et salles
- **Existant** : `CallContext` (visio et audio dans l'application), `CallsScreen` (historique des appels : sens, durée, manqué), `SallesScreen` (réservations). La téléphonie est une catégorie de la baie (`disponibilite: 'prete'`).
- **Manque** : ligne professionnelle, file d'attente, transfert, résumé d'Ajmani, plan des salles en direct avec voix.
- **Prêt** : poste interne résolu **dès 3 chiffres** exactement, état d'une salle (« depuis 8 min », « 2 sur 8 places », un seul halo : celui qui a parlé dans la dernière seconde), salle libre (prochain événement du jour, sinon « Rien de prévu aujourd'hui »), salle de La Garde (ouverte par un incident, visible de la supervision seulement), personnes connectées sans doublon, Standard (file, attente en m:ss), historique (première phrase du résumé, décisions, tâches, « à rappeler »), **Rappels du jour** (« 1 sur 2 », « Tous rappelés »), contrôle qu'un résumé n'ajoute **aucun nombre absent de la source**, accord de tous pour enregistrer la voix.

### H14 · Annonces
- **Existant** : titre, texte, auteur, date, `readBy`. **Manque** : épinglage, catégories, destinataires, réactions (nouveau modèle), heure de lecture par personne.
- **Prêt** : « À la une » (l'épinglée la plus récente ; les autres en tête de mosaïque), « Lu par x sur y » (l'auteur compté d'office, barre verte à x = y), accusés par personne, « J'ai lu » (jamais pour l'auteur ni un déjà confirmé), trois réactions fixes qui **ne valent pas confirmation**, « 5/6 » (hors les miennes et hors « Nouveauté d'AMN Business »), catégories, rangement « maçonnerie » de la mosaïque (colonne la moins haute, brouillon en 2ᵉ colonne), rappel d'Ajmani (épinglée portant une heure, non confirmée, dans les 2 h qui précèdent).

### MX01 · Courriel
- **Existant** : rien (pas de boîte partagée dans le dépôt). Le courriel passe par la catégorie « messagerie » de la baie (`boite-equipe` IMAP et SMTP chez nous, attend amn-api ; ou un service externe). **Aucune clé, aucun mot de passe, aucun jeton, aucune adresse de serveur** n'est affiché ni stocké dans l'application.
- **Prêt** : fils (compteur, non lu, « à moi », pièce jointe), messages déployés (le dernier et tout non lu plus ancien), dossiers « Clients » et « Partenaires » en filtres automatiques, programmés, présence « Dans la boîte » (autres seulement), résumé d'Ajmani à partir de 3 messages, demandes détectées, brouillon jamais envoyé seul, pièces jointes jamais ouvertes sans analyse, connexion perdue (messages déjà chargés lisibles).

### MX02 · Réunions
- **Existant** : `MeetingsScreen` (réunions, durée, suites). **Manque** : début réel, ordre du jour minuté, notes en direct, participants, documents.
- **Prêt** : en cours / « depuis N min », ordre du jour minuté (sujet marqué, sinon le temps écoulé ; remplissage), notes (« Décision : … » ; une action sans personne ou échéance reste « À confirmer », rien d'inventé), prochaine réunion (compte à rebours sous une heure), préparation en % (≥ 70 vert, 45–69 neutre, < 45 orange), suggestion de durée (3 dernières occurrences ≥ 30 % plus courtes). Le niveau de parole n'est **jamais** gardé ; accord de chaque participant pour les notes et l'enregistrement.

### MX03 · Partage de fichiers
- **Existant** : rien. Aucun stockage nouveau (§1.27 n° 10) : « non disponible » tant que le stockage d'équipe n'existe pas (LOT-13). **Strict** : l'écran n'affiche **jamais** l'adresse d'un lien, ni un jeton, ni un code ; le type d'un lien ne porte donc aucune adresse (la garde le vérifie).
- **Prêt** : jauge d'expiration (jours restants ÷ durée, orange à 2 jours ou moins, « Expire demain », pas de « Prolonger » sans expiration), « pas encore ouvert », liens protégés (17 sur 17), tri, refus de dépôt (> 2 Go, espace plein), transferts des 24 h, fichiers reçus ouvrables **seulement après vérification serveur**, relance proposée.

### MX04 · Canaux
- **Existant** : `GroupsScreen` (groupes et leurs messages) et les messages privés. **Manque** : alertes de tickets urgents par canal, réactions, fils de réponses, statut « concentré », messages épinglés.
- **Prêt** : non lus, canaux visibles (un invité ne voit que les siens, pas de « Nouveau canal »), carte d'événement de ticket (suit le ticket, **n'est pas un message** : ni réaction ni fil), **trois réactions en icônes** (coche, œil, étoile — pas d'emoji ; une par personne et par icône), fil (réponses, abonnés), saisie en cours (6 s, jamais le contenu), statut d'un message direct, message vers tâche (le message d'origine par son identifiant, jamais une adresse). Aucun compteur de messages par personne.

### MX05 · Sondages
- **Existant** : `PollsScreen` (question, options, votes par personne, anonyme, clôture). **Manque** : types de réponse (plusieurs, note), destinataires clients, visibilité des résultats avant la fin.
- **Prêt** : pourcentages entiers (somme forcée à 100 % sur l'option la plus forte), « en tête » / « à égalité », participation en 8 cases (« 7 sur 8 », « 1 vote attendu » : **un nombre, jamais un nom**), votes en direct (24 h ; **anonyme : « Un vote reçu »**, ni nom ni avatar), autres sondages, éditeur (question + 2 options), clôture, naissance en brouillon.

### MX06 · Réponses automatiques
- **Existant** : rien de dédié (le moteur de H20 exécute des règles générales). **Règle d'or** : rien n'est envoyé sans règle explicite et **active** ; une règle créée, importée ou proposée par Ajmani **naît désactivée** ; Ajmani n'active jamais.
- **Prêt** : règle incomplète non activable, modification d'une règle active → « à tester », horaires (lun.–ven. 9–18, jours fériés), prochaine ouverture, décision d'envoi (canal, déclencheur, garde-fou « pas deux fois la même réponse en 24 h »), variables (`{prénom}` sinon « Bonjour, », `{réouverture}` ; **une variable sans valeur ne bloque jamais l'envoi**), repérage du **tutoiement** dans un texte client, compteurs (« 5 actives sur 7 », gagné = envois × 2,5 min), « Une règle manque » (≥ 10 messages identiques en 30 jours).

## 4. Registre (S5 propriétaire)

Aucun changement n'est posé tant que le socle v4 n'est pas fusionné (les vues `nouveau` demandent un écran). Prévu :

| Besoin | Déclaration | Où |
|---|---|---|
| G07 Messagerie des clients | vue `messagerie`, route `/messagerie`, échanger › discuter, **essentiel** | `declarations/echanger.ts` (`nouveau`) |
| MX01 Courriel | vue `courriel`, route `/courriel`, échanger › discuter, courant ; verbes « répondre à un courriel », « écrire un courriel » | idem |
| MX03 Partage de fichiers | vue `partages`, route `/partage-de-fichiers`, échanger › annoncer (ou documents), courant | idem |
| MX06 Réponses automatiques | vue `reponsesAuto`, route `/reponses-automatiques`, échanger › public, courant | idem |
| MX04 Canaux | l'entrée « Messagerie » actuelle (`dm` + `groups` + `team`) est en réalité la messagerie d'**équipe** : à renommer « Canaux » (fr) / « Channels » (en) au moment où G07 prend le nom « Messagerie ». Le niveau « essentiel » suit | idem |
| Substitutions | `/annonces` (`announcements`) → `AnnoncesRefonte` ; `/reunions` (`meetings`) → `ReunionsRefonte` ; `/sondages` (`polls`) → `SondagesRefonte` ; `/appels` (`calls`) → `AppelsRefonte` ; `/groupes` (`groups`) → `CanauxRefonte` | `src/refonte/substitutions/declarations/echanger.tsx` (mécanisme de S0) |
| F40 | page sur `/ensemble/echanger`, sans entrée au registre | substitutions |

Le registre refuse les vues en double (§1.19 n° 1). La clé `module` des substitutions doit être celle de la garde `ModuleRoute` (à revalider à la pose).

## 5. Ce qui manque aux données réelles (aucune collection ajoutée sans accord)

1. **Boîte des clients** : le canal de chaque message (courriel, WhatsApp, SMS), l'état de tri (À répondre / En attente / Fait), les notes internes, les adresses et numéros des fiches clients pour le rattachement.
2. **Courriel** : une boîte partagée (IMAP et SMTP, attend amn-api), fils, pièces jointes avec état d'analyse, envois programmés.
3. **Annonces** : épinglage, catégories, destinataires, heure de lecture par personne, réactions. **Sondages** : types de réponse et destinataires clients. **Réunions** : début réel, ordre du jour minuté, notes en direct.
4. **Partage de fichiers** : tout (liens, ouvertures, protection, quota) ; dépend du stockage d'équipe (LOT-13) et d'amn-api.
5. **Réponses automatiques** : règles en phrases et leurs envois (le jeu fictif a un déclencheur en un libellé, pas une structure).
6. **Appels** : ligne professionnelle, file d'attente, transfert ; présence vocale des salles.

## 6. Questions pour le CO

1. **L'entrée « Messagerie » du registre** (`dm` + `groups` + `team`, essentiel) est aujourd'hui la messagerie d'équipe. G07 prend ce nom pour les clients : renommer l'entrée actuelle « Canaux » quand G07 est ajouté, et mettre les deux en essentiels ?
2. **MX01, MX03, MX06 sont de nouveaux modules** malgré la mention « mixte » : feu vert pour les ajouter au registre avec leur écran, et pour présenter à Harun les collections qu'ils demandent (§1.27 n° 4).
3. **Heures ouvrées** : la promesse de 2 h compte en heures ouvrées (lun.–ven. 9–18, réglable). Les horaires de l'organisation sont-ils un réglage existant ? À défaut, la logique prend ceux de MX06.
4. **Présence « lit / écrit » et saisie en cours** : il n'existe aucune infrastructure de présence temps réel dans le dépôt. Acceptable de les masquer au premier jet ?
5. **« Messages programmés » (dixième tuile de F40)** : nom proposé par la fiche ; à confirmer avec Harun.
6. **Tutoiement dans MX04** : la fiche dit que « les textes de l'application vouvoient » (reste de la v3) ; la v4 tutoie. La logique tutoie partout dans l'interface et garde le vouvoiement pour ce qui part chez un client.

## 7. Manque au socle (à dire à S0)

- `ModuleTile` (hauteur 41 en v4), `ModuleGroupGrid`, `AddModuleTile`, `SuggestionCompact`, `FlagUrgent`, `Kbd`, `LiveDot`, `Caret` : du socle, pas du lot.
- Propres au lot, à construire une fois le socle fusionné : `WaitRuler`, `ChannelPulse`, `ZeroInbox` (jauge en segments), `ThreadView`, `Handset` (combiné et pavé), `RoomPlan`, `AnnouncementWall`, `ReviewComposer`, `TokenRule` (jetons modifiables, atteignables au clavier), `ResultBars`.
- Formats : importer `src/socle/formats.ts` et retirer `nombre`, `pct` de `commun.ts`.

## 8. Jeux fictifs

Les 11 jeux d'Échanger (`conversations`, `messages`, `canaux`, `annonces`, `courriels`, `salles`, `appels`, `reunions`, `partages`, `sondages`, `reponsesAuto`) suffisent à rejouer la logique aux quatre volumes. À demander à SIM (liste « Manque aux données » de STATUT) : le canal et le sens de chaque message client, des gestes de tri, des notes internes, la présence, les destinataires et réactions d'annonces, l'ordre du jour minuté d'une réunion en cours, les votes par personne, des règles structurées, des appels manqués et une file de Standard. Les noms, montants et dates des images ne sont jamais codés en dur (la garde le vérifie dans la logique).

## 9. Lecture des images v4 (14 nov.)

Les dix images de LOT-05 (F40, G07, H13, H14, MX01 à MX06) ont été ouvertes et comparées à la logique. Presque tout y était déjà. Ajouté, avec ses contrôles :

| Image | Ce qu'elle montre | Ajout |
|---|---|---|
| G07 | « Hier, par courriel · Afficher 2 messages » | `boite.plierLesAnciens` (par jour et par canal) |
| G07 | « Fait 9 · DU PS BL MC +5 · dernier à 10:12 » | `boite.apercuDuFait` |
| F40 | tuiles : « 6 cette semaine · 4 h », « 148 envoyées ce mois », « partent lundi 9:00 », « 6 canaux », « tous protégés » | `hub.TuileDEchange.detail`, alimenté par des mesures facultatives (sans elles, la tuile garde son nombre) |
| MX01 | étiquettes Urgent, À facturer, En attente client | `courriel.compterEtiquettes` |
| MX03 | réglages du prochain lien (30 jours, code, filigrane, téléchargement) ; onglets Partagés, Reçus, Expirés | `partages.REGLAGES_DU_LIEN_PAR_DEFAUT`, `reglagesValides` (jamais sans protection), `ongletsDePartage` |
| H13 | filtres « Tout », « Manqués », « Avec résumé » | `appels.compteursDHistorique` |

Les textes de ces ajouts sont dans `i18n.ts` (fr, en).

**Écarts entre les images et le texte du dossier, à garder en tête à la construction**
- MX05 : « Préparé par Ajmani : vous hésitez entre deux tarifs de maintenance » est une phrase de l'interface écrite au vouvoiement. L'interface tutoie : « tu hésites ». La question posée aux clients (« préférez-vous ? ») reste au vouvoiement.
- F40 : la tuile « Réponses automatiques » montre « 148 envoyées ce mois », pas « 5 actives sur 7 » : la mesure à afficher est `envoisAutoDuMois`.
- G07 : « code 0x0000009F » est un texte d'exemple dans une pièce jointe : donnée fictive, rien à coder.
- Presence : « Mohamed lit », « Riyad écrit » (F40, G07, MX01) et « Riyad est en train d'écrire » (MX04) sont de la présence en direct. Masqués au premier jet (STATUT §1.32 n° 4).

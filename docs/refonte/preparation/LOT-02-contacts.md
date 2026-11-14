# LOT-02 · Mes contacts et clients — note de préparation

> Branche `claude/refonte-contacts`, partie de `claude/refonte-vivante` @ `8333822`. Rédigée le 14 nov. 2026 par S1, en MODE PRÉPARATION (socle v4 non fusionné : aucun écran visuel, aucun import de `src/socle/ui`).
> Sources lues : `REGLES.md`, `STATUT.md` (§1.4, §1.8, §1.10 à §1.28, §5, §7), `PROMPTS-12NOV.md`, le code des modules existants (relevé du 14 nov.), les jeux fictifs de SIM (`src/refonte/donnees/`), la note modèle `LOT-11-developpement.md`.
> **Dossier v4 lu le 14 nov. (deuxième passe)** : `06-V4-NEON-ET-TUTOIEMENT.md`, `_data/tutoiement.json`, les 13 fiches de `lots/LOT-02-contacts/` (rubriques 2, 6 et 8 en entier) et les images `MC07-relances.png`. La première passe n'avait pas les zips ; ce que la fiche a changé est au §7. Les images des autres écrans n'ont pas été comparées (aucun écran n'est construit).
> Rien ici ne décrit une faiblesse de sécurité ; aucune donnée réelle ; les noms et courriels sont ceux des jeux fictifs (`@exemple.test`).

## 1. En bref

- **Livré** : `src/refonte/contacts/` (9 fichiers, logique pure, sans React) et `scripts/check-contacts.ts` (`npm run check:contacts`, **85 contrôles**, ajouté à `package.json` et `editions.yml`). Quatre sujets : **pipeline** (H06, MC01), **relances** (MC07), **fidélité** (MC02), **rendez-vous** (MC06), plus la source **« Contacts par client »** de H41.
- **La règle de relance** est celle de la fiche MC07, en huit points, tous testés (§7, point 1) : une relance par client et par semaine glissante, espacement d'un même objet, trois relances au plus, jamais le week-end ni un jour férié, préférences du contact, arrêt dès que le client répond, rien dans les 24 h après un échange, **rien ne part sans un clic**.
- **Deux voix** : l'interface tutoie, tout ce qui part chez un client vouvoie. Les phrases de la fiche sont reprises telles quelles.
- **Les fiches ont corrigé trois de mes suppositions** (messagerie ≠ courriel ; « un message par client et par jour » → « par semaine » ; paliers de fidélité 800 / 1 800 et pas 500 / 1 500) et **deux jeux de SIM** ne les suivent pas (§7).
- **Ce qui attend** : tous les écrans (socle v4) et `check:tutoiement` (pas encore dans la base).

## 2. Les 13 écrans

Colonnes : module existant (route, fichier, lignes), données de SIM (`src/refonte/donnees/`), logique livrée (`src/refonte/contacts/`), ce qui manque.

| ID | Écran | Existant le plus proche | Données (SIM) | Logique livrée | Ce qui manque |
|---|---|---|---|---|---|
| F10 | Vue d'ensemble | aucun (hub neuf). Repli générique `/ensemble/:famille` du socle v4 | tous les jeux ci-dessous | `resumePipeline`, `resumeFidelite`, `aConfirmer`, `ordonnerFile` fournissent les comptes | `ModuleTile`, `ModuleGroupGrid`, `AddModuleTile` (socle v4, décidés au §1.10) |
| H05 | Clients | `ClientsScreen` `/clients` (2 505 l.), `useClients` | `clients` (`FicheClient`) | `contactsDuClient` (principal, non lus) | santé et statut : l'écran les **recalcule** (`calculerSante` de SIM) ; filtres de la fiche |
| G04 | Fiche client | `ClientDetail` dans `ClientsScreen` (l. 1195) | `clients`, `devis`, `factures`, `avis`, `evenements`, `interlocuteurs` | `contactsDuClient`, `joursSansEchange` | devis prérempli (source de LOT-04), note épinglée (source de LOT-03) |
| H06 | Prospects | `PipelineScreen` `/pipeline` (469 l.), collection `prospects` ; `ScoringLeadsScreen` `/scoring-leads` | `prospects` (`Prospect`) | `comparerProspects`, `valeurPonderee`, `actionEnRetard`, `deplacer` | champ « raison de la perte » absent du modèle ; score (écran voisin) à relier |
| H44 | Retours clients | `ReviewsScreen` `/avis`, `SentimentScreen` `/sentiment`, `NpsScreen` `/nps` (regroupés au registre) | `avis` (note sur 5, recommandation 0 à 10, thèmes) | — (calculs de santé déjà dans SIM) | sentiment et NPS : pas de jeu propre ; à dériver des `avis` (à confirmer avec la fiche) |
| H45 | Fournisseurs | `SuppliersScreen` `/fournisseurs` (626 l.), collection `suppliers` | `fournisseurs`, `achats` | — | suggestion « renégocier » (`negociationLe`) : règle de la fiche à lire ; noms fictifs seulement |
| MC01 | Pipeline commercial | **même écran que H06**, autre regroupement | `prospects` | `COLONNES`, `colonnesPipeline` (4 colonnes, totaux et pondéré), `transitionsPermises` | `Kanban` du socle existe ; glisser-déposer : règles de `transitionsPermises` à brancher |
| MC02 | Fidélité | `LoyaltyScreen` `/fidelite` (356 l.) : **carte à tampons** (10 tampons, le 11e offert) ; `ReferralsScreen` `/parrainage` | `fidelite` (`CompteFidelite` : points, niveaux Bronze/Argent/Or, avantages) | `PALIERS`, `pointsDe`, `progression`, `resumeFidelite`, `niveauCoherent` | **la mécanique diffère** (voir §5, constat 1) ; collection pour les avantages offerts/utilisés |
| MC03 | Fiches contacts | aucun écran n'en liste les interlocuteurs d'une organisation. `DirectoryScreen` est l'annuaire de l'**équipe** | `interlocuteurs` | `contactsParOrganisation`, `comparerInterlocuteurs`, `moyenDeJoindre` | collection d'interlocuteurs côté app : n'existe pas (voir §3) |
| MC04 | Équipe | `DirectoryScreen` `/trombinoscope` (352 l.), `MembersScreen` `/membres`, `useMembers`, collection `shifts` | `equipe` | — (rien de neuf : déjà du LOT-01/LOT-07) | doublon possible avec le trombinoscope déjà au registre (action « partenaires ») |
| MC05 | Partenaires | aucun écran | `interlocuteurs` de type `partenaire` ; **pas de jeu « partenaires »** | `contactsParOrganisation(…, 'partenaire', id)` | un jeu d'organisations partenaires (nom, type, contact) à commander à SIM |
| MC06 | Rendez-vous clients | `AgendaScreen` `/agenda` (`src/business/AgendaScreen.tsx`, partagé avec l'édition cliente), `BookingScreen` `/rdv-en-ligne` (528 l.), `useAppointments` | `evenements` (`Evenement` : confirmation, mode, durée) | `etatRendezVous`, `aConfirmer`, `manques`, `chevauchements`, `creneauxLibres`, `relanceDepuisManque` | l'agenda est partagé : une vue neuve passe par une couture `@edition/*` (REGLES) |
| MC07 | Relances | `RemindersScreen` `/relances` (611 l.), collection `paymentReminders` (factures seulement, avec paliers) | `relances` (5 motifs : facture, devis, rendez-vous, prospect, inactif) | `REGLES_PAR_DEFAUT`, `verdictRelance`, `ordonnerFile`, `marquerEnvoyee`, `phraseAttente`, `messageClient` | l'écran actuel ne relance que les factures : devis, rendez-vous, prospects et inactifs sont **neufs** côté app (voir §5, constat 2) |

Types de la colonne « Données » : `src/refonte/donnees/types.ts`. Le `check:contacts` rejoue la logique sur les quatre volumes (`vide`, `peu`, `normal`, `beaucoup`).

## 3. « Contacts par client » (source demandée par H41)

H41 (Recherche ⌘K, LOT-00) propose « Écrire à X » : il lui faut, pour un client, **qui écrire en premier**. C'est une source de ce lot.

- **Forme** : `contactsDuClient(interlocuteurs, clientId)` rend `{ principal, tous, nonLus, dernierEchangeAt }`. Le principal est le premier de la liste triée : favoris, puis le plus récemment joint, puis l'ordre alphabétique. `moyenDeJoindre` dit comment le joindre selon sa préférence (courriel, téléphone, messagerie), avec un repli si le champ manque.
- **Où elle sert** : H41 (le principal), G04 (liste des contacts de la fiche), MC03 (liste par organisation), F10 (compte de messages non lus).
- **Clé de rattachement** : `Interlocuteur.organisationType` + `organisationId`. Pour un client, `organisationId` est `String(client.id)` ; le `check:contacts` vérifie sur les quatre volumes qu'aucun interlocuteur de client n'est orphelin.
- **Ce qu'elle ne fait pas** : elle ne crée ni ne modifie rien. L'app n'a **pas encore de collection d'interlocuteurs** (les contacts d'un client vivent dans sa fiche) : la collection à créer, son schéma et la migration sont à décider avec le CO avant la construction de MC03 (§5, constat 3).
- **Isolement** : la liste est celle de l'organisation courante, comme toute collection synchronisée ; aucune lecture entre organisations.

## 4. La logique livrée (`src/refonte/contacts/`)

| Fichier | Contenu |
|---|---|
| `commun.ts` | jours et heure de Paris (repris de SIM, heure d'été comprise), `euros`, `jourFrancais`. Rien ne lit l'horloge : « maintenant » est un paramètre. |
| `pipeline.ts` | étapes et colonnes ; `valeurPonderee` (par prospect, H06) ; `colonnesPipeline` ; `resumePipeline` ; `transitionsPermises`, `deplacer`, `rouvrir` ; entonnoir de MC01 : `CHANCES_MC01`, `enJeu`, `previsionPonderee`, `tauxDePassage`, `ageMoyenDansEtape`, `joursSansReponse`, `signesDuMois`, `objectifDuMois`, `signaturesParMois`, `faitEncourageant` |
| `interet.ts` | H06 : `interet` (35 / 25 / 20 / 20), `fraicheur`, `libelleInteret`, quadrant « À appeler cette semaine », `appelsDeLaSemaine`, `trainee` |
| `relances.ts` | les huit points de MC07 : `REGLES_PAR_DEFAUT`, `verdictRelance` (raison + prochain instant permis), `ordonnerFile`, `marquerEnvoyee` (clic humain exigé), `arreterPour`, `reporterADemain`, `cadence`, `progressionFile`, `serieBoiteAZero`, `joursFeries`, `PreferencesEnvoi`, `phraseAttente`, `messageClient` (vouvoiement) |
| `fidelite.ts` | paliers de la fiche (0 / 800 / 1 800) et du jeu de SIM ; `pointsDe`, `pointsProgramme` (1 € = 1, avis = 50, recommandation = 200), `progression`, `bientotAuPalier`, `descenteDePalier`, `clientsAffiches` ; les deux formules : `formuleDe`, `progressionTampons` |
| `rendezvous.ts` | états, `aConfirmer`, `manques`, `chevauchements`, `creneauxLibres`, `relanceDepuisManque` ; la journée de MC06 : `pauseDejeuner`, `trajetsDeLaJournee` (durées données par le service d'itinéraire), `resumeJournee`, `tauxReservation` |
| `interlocuteurs.ts` | la source « Contacts par client » (§3), `moyenDeJoindre` |
| `i18n.ts` | 74 clés fr/en (`definirMots`), l'anglais est le schéma. Interface au tutoiement, clés `client.*` au vouvoiement. |
| `index.ts` | exports |

**Choix à connaître**

- Les relances rendent un **verdict** (`possible` ou la raison et l'instant) plutôt qu'un booléen : l'écran affiche « Pas avant le 03/11 : une relance par semaine au plus. » sans inventer de phrase.
- `marquerEnvoyee` **lève une erreur** sans `clic: true` (rien ne part seul) et si le verdict ne le permet pas : un écran ne peut pas, par erreur, envoyer deux fois la même semaine.
- Les jeux de SIM (`relances`, `fidelite`) servent de **comparaison**, pas de source : `pointsDe` redonne exactement les points du jeu (avec `PALIERS_DU_JEU_SIM`), et la file recalculée respecte les règles de la fiche sur chaque volume.

## 5. Constats et décisions du CO (`STATUT.md` §1.28, 14 nov.)

| # | Constat | Décision du CO | Où c'est dans la logique |
|---|---|---|---|
| 1 | Fidélité : l'écran actuel est une carte à tampons, la fiche MC02 des points et niveaux | **Les deux formules, sans rien perdre.** Points et niveaux = l'écran. La carte à tampons reste une formule au choix de l'organisation, et la formule par défaut là où elle sert déjà | `fidelite.ts` : `Formule`, `formuleDe`, `progressionTampons` |
| 2 | Relances : cinq motifs, l'écran actuel n'en relance qu'un | **Un seul moteur** pour les cinq motifs, `src/lib/relances.ts` étendu ; les paliers des factures restent tels quels | `relances.ts` (verdicts) est la couche « quand et à qui » ; l'extension de `src/lib/relances.ts` se fait à la construction, avec S9 |
| 3 | Collection d'interlocuteurs absente | **À Harun**, présenté par le CO. D'ici là, MC03 s'affiche « non disponible », avec la raison | clé `contacts.indisponible` (`i18n.ts`) |
| 4 | Plafond de 3 relances, un message par client et par jour | **Adoptés comme valeurs de départ, modifiables.** À relire avec MC07 | `REGLES_PAR_DEFAUT`. **MC07 lue : le plafond de 3 est confirmé ; « un message par client et par jour » est remplacé par « une relance par client et par semaine glissante »** (plus strict) |
| 5 | MC04 Équipe et MC05 Partenaires | MC04 se construit sur le trombinoscope ; le jeu d'organisations partenaires est **commandé à SIM** | liste « Manque aux données » de `STATUT.md` |
| — | Rouvrir un prospect | Selon la fiche H06. À défaut : un perdu se rouvre, **avec confirmation et une trace** ; un gagné ne se rouvre pas | `pipeline.ts` : `rouvrir`, `TraceReouverture`. **Fiches H06 et MC01 lues : elles n'en disent rien** (MC01 : « existence d'un état Perdu (non dessiné) ») → la règle du CO s'applique |
| — | « Messagerie » comme moyen de joindre | Selon la fiche MC03. À défaut : le courriel | **La fiche MC03 le dit** : « Écrire » ouvre un courriel (MX01) **ou la messagerie (G07)** selon la préférence. `moyenDeJoindre` rend donc `messagerie` (≠ courriel) |
| — | Raccourci « Relancer » | Aucun (⌘R est pris par Electron) | — |

Choix de la session, que les fiches ne contredisent pas : un prospect rouvert repart en « Nouveau » (`ETAPE_DE_REOUVERTURE`) et sa probabilité reste à 0, pour qu'aucune valeur pondérée n'apparaisse sans que la personne l'ait fixée.

## 6. Ce qui n'a pas été fait

- **Aucun écran, aucune brique visuelle, aucun import de `src/socle/ui`** : mode préparation.
- **Aucune capture, aucune comparaison aux images** (sauf `MC07-relances.png`, vue pour contrôler les textes et les réglages d'envoi).
- **Images des 12 autres écrans non comparées** : elles le seront à la construction.
- **`check:tutoiement`** : n'existe pas dans la base (il arrive avec la passe finale v4 de S0). `check:contacts` en reprend l'esprit sur ses propres clés ; la table `_data/tutoiement.json` reste hors du dépôt, donc hors de la CI.
- **Règles des fiches non portées en logique** (H05, H44, H45, MC04, MC05, F10) : listées au §7, point 10. Elles ne font pas partie des quatre sujets demandés.
- **Aucune édition cliente touchée** : tout est dans `src/refonte/contacts/` (code interne), `scripts/`, `package.json`, `editions.yml` et `docs/`.

## 7. Ce que les fiches du dossier v4 ont changé (lues le 14 nov.)

| # | Point | Ce que disent les fiches | Effet sur la logique |
|---|---|---|---|
| 1 | **Règle d'espacement (MC07, rubrique 6)** | Huit points : (1) au plus une relance par client et par semaine glissante, objets regroupés ; (2) au moins 5 jours entre deux relances d'un même objet (réglable de 3 à 14) ; (3) trois relances au plus par objet, appel proposé après la 2e, suivi manuel après la 3e ; (4) jamais le week-end, un jour férié ni hors de la plage d'envoi, les préférences d'une fiche MC03 décalent l'envoi ; (5) arrêt dès que le client répond, paie, signe ou demande à ne plus être relancé ; (6) rien dans les 24 h après un échange humain ; (7) entrée dans la file seulement le jour où c'est permis ; (8) **rien ne part sans un clic humain** | `relances.ts` : les huit points, un test chacun ; `joursFeries` (11 jours, Pâques calculée) ; `PreferencesEnvoi` ; `marquerEnvoyee` exige `clic: true` ; `reglesBornees` (3 à 14) |
| 2 | **Valeurs : fiche ≠ CO** | La fiche dit **5 jours** entre deux relances d'un objet et la plage **9:00–18:00** (l'image aussi : « 9:00 à 18:00, jours ouvrés », « Préparée après 5 jours »). Le CO a adopté **7 jours** et **08:00–19:00** (§1.22), lus chez S9 | **Écart à trancher par Harun.** Le code lit les valeurs du CO (une seule source) ; l'espacement se règle de 3 à 14, donc 5 est un réglage. Pour passer à la fiche : changer `VALEURS_DE_DEPART` chez S9 |
| 3 | **« Un message par client et par jour »** (valeur de S1, adoptée au §1.28) | Remplacée par « **une relance par client et par semaine glissante** » | `clientDelaiJours` = 7. Le §1.28 point 4 est donc à corriger : ce plafond-là vient de la fiche, pas de S1 |
| 4 | **Plafond de 3 relances** | Confirmé (« trois relances au plus par objet ») | `maxParObjet` = 3, `suiteApres` (message, appel, suivi à la main) |
| 5 | **Messagerie** (MC03) | « Écrire » ouvre un courriel (MX01) ou la messagerie (G07) selon la préférence | `moyenDeJoindre` rend `messagerie` (≠ courriel). **Manque** : un identifiant de messagerie dans le modèle ; la valeur rendue est l'adresse |
| 6 | **Rouvrir un prospect** | H06 et MC01 n'en parlent pas (« existence d'un état Perdu (non dessiné) ») | Règle du CO conservée (§5) |
| 7 | **Fidélité (MC02)** | Paliers **Bronze 0–799, Argent 800–1 799, Or dès 1 800** (réglables), 12 mois glissants ; points : 1 € payé = 1, **avis = 50, client recommandé = 200** ; jamais de point retiré ; descente d'un palier seulement après 12 mois sans activité, avec un message avant ; « bientôt au palier suivant » à moins de 100 points ; au plus 4 clients par barreau. **Pas un mot sur les tampons** | `fidelite.ts` : `PALIERS` = la fiche ; `PALIERS_DU_JEU_SIM` pour rejouer le jeu ; `pointsProgramme`, `bientotAuPalier`, `descenteDePalier`, `clientsAffiches`. La décision du CO (deux formules, tampons au choix de l'organisation) tient, la fiche ne la contredit pas |
| 8 | **Jeu de SIM « fidélité »** | — | **À aligner par SIM** : paliers 500 / 1 500 au lieu de 800 / 1 800, points des factures seulement (ni avis ni recommandations) |
| 9 | **Pipeline : deux calculs** | MC01 : chance **par étape** (Nouveau 20 %, Rendez-vous 40 %, Devis envoyé 55 %, Signé 100 %), « en jeu » hors signés et perdus, prévision pondérée, taux de passage sur 90 jours, âge moyen dans l'étape, « N j sans réponse » dès 5 jours, signé ce mois, objectif du mois, signatures par mois. H06 : chance **par prospect** modifiable, **intérêt** de 0 à 100 (35 % lectures, 25 % réponses, 20 % rendez-vous, 20 % fraîcheur), quadrant « À appeler cette semaine » (intérêt ≥ 60 et montant ≥ 3 000 €), traînée ≥ 10 points | `pipeline.ts` (MC01) et `interet.ts` (H06). **Les échelles de trois signaux d'intérêt ne sont pas dans la fiche** : `ECHELLES` est un choix de la session, à valider |
| 10 | **Données absentes du modèle** | MC01 : date d'entrée dans l'étape, historique des mouvements, montant estimé, objectif du mois, état « Perdu » ; H06 : lectures du devis, délai de réponse, intérêt d'il y a 14 jours ; MC07 : état « reportée », suivi d'ouverture (« Ouvert 2 fois », MX03, à confirmer), ton du message ; MC06 : durées de trajet (service d'itinéraire, LOT-12), point de départ réglé | La logique reçoit ces données en **entrée** ; SIM les ajoutera (liste « Manque aux données » de `STATUT.md`) |
| 11 | **Textes** | `tutoiement.json` : 353 textes des maquettes (vouvoiement → tutoiement), dont « Rien ne part sans ton accord », « Tes réglages d'envoi » ; l'image dit « rien ne part sans ton clic » | `i18n.ts` reprend les phrases de la fiche : « Pas avant le {date} : une relance par semaine au plus », « Dernière relance par message, ensuite suivi à la main », « Un appel plutôt qu'un message », « Encore {n} et la boîte est à zéro », « Rédigé par Ajmani avec tes mots · rien ne part sans ton clic ». Le message de relance d'un devis suit le corps de la fiche (« Je reviens vers vous au sujet du devis… Avez-vous pu le parcourir ? ») |
| 12 | **Règles des autres fiches du lot** (non portées en logique, à reprendre à la construction) | H05 : statut « Impayé » = facture échue **depuis plus de 7 jours**, « À relancer » = échue depuis 7 jours ou moins, ou dernier échange > 5 jours, ou santé < 45, « Nouveau » = créé depuis moins de 30 jours ; couleur de santé 70 / 45. H44 : recommandation = % recommandent − % déçus. H45 : score fournisseur = Σ note × poids, par type de besoin. MC04 : charge = heures planifiées ÷ 35 h (< 80 % vert, 80–100 % orange, > 100 % rouge). MC05 : orbite par fréquence d'échanges sur 90 jours, force de la relation 50 / 30 / 20. F10 : chaleur des relations (< 7 j, 7 à 29 j, ≥ 30 j) | **Jeu de SIM « clients »** : son statut affiché est « Impayé » dès l'échéance passée et n'a pas de « Nouveau » ; la fiche H05 est plus fine. À aligner par SIM |

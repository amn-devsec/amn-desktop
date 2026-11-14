# LOT-02 · Mes contacts et clients — note de préparation

> Branche `claude/refonte-contacts`, partie de `claude/refonte-vivante` @ `8333822`. Rédigée le 14 nov. 2026 par S1, en MODE PRÉPARATION (socle v4 non fusionné : aucun écran visuel, aucun import de `src/socle/ui`).
> Sources lues : `REGLES.md`, `STATUT.md` (§1.4, §1.8, §1.10 à §1.26, §5, §7), `PROMPTS-12NOV.md`, le code des modules existants (relevé du 14 nov.), les jeux fictifs de SIM (`src/refonte/donnees/`), la note modèle `LOT-11-developpement.md`.
> **Non lues : le dossier v4 (5 zips), donc les 13 fiches, leurs images, `06-V4-NEON-ET-TUTOIEMENT.md` et `_data/tutoiement.json`.** Ils ne sont pas dans l'environnement de la session et le dépôt ne les contient pas (REGLES : « hors du dépôt »). Tout ce qui dépend d'une fiche est marqué **à confirmer** ; rien n'a été deviné au-delà des règles écrites dans `STATUT.md` et dans les types de SIM. Voir le §6.
> Rien ici ne décrit une faiblesse de sécurité ; aucune donnée réelle ; les noms et courriels sont ceux des jeux fictifs (`@exemple.test`).

## 1. En bref

- **Livré** : `src/refonte/contacts/` (8 fichiers, logique pure, sans React) et `scripts/check-contacts.ts` (`npm run check:contacts`, **63 contrôles**, ajouté à `package.json` et `editions.yml`). Quatre sujets, comme demandé : **pipeline**, **relances**, **fidélité**, **rendez-vous**, plus la source **« Contacts par client »** de H41.
- **La règle de relance** : on ne harcèle jamais un client. Quatre garde-fous, tous testés, aucun contournable par un écran : 7 jours minimum entre deux relances du même objet (valeur de départ du CO, §1.22, **lue chez S9** pour qu'il n'y ait qu'une source), 3 relances au plus par objet, un seul message par client et par jour, envoi seulement lun.–ven. 08:00–19:00 heure de Paris.
- **Deux voix** : l'interface tutoie, tout ce qui part chez un client vouvoie. `check:contacts` vérifie les deux sens sur les clés fr.
- **Ce qui attend** : tous les écrans (socle v4), les 13 fiches (à relire avec le dossier v4), `check:tutoiement` (pas encore dans la base).
- **Cinq constats pour le CO** (§5).

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
| `pipeline.ts` | les 6 étapes et 4 colonnes ; `valeurPonderee` ; `colonnesPipeline` (tri : urgent, prochaine action, nom) ; `resumePipeline` (en retard, taux de conversion) ; `transitionsPermises` (avancer librement, reculer d'une, perdre partout, terminaux) ; `deplacer` (signature, 100 %, client à créer) |
| `relances.ts` | `REGLES_PAR_DEFAUT` ; `verdictRelance` (raison + prochain instant permis) ; `ordonnerFile` (un départ par client) ; `marquerEnvoyee` (refuse ce que le verdict interdit) ; `phraseAttente` ; `messageClient` (vouvoiement) |
| `fidelite.ts` | paliers 0 / 500 / 1 500 ; `pointsDe` (1 point par euro TTC payé sur 12 mois) ; `progression` ; `resumeFidelite` |
| `rendezvous.ts` | états, `aConfirmer`, `manques`, `chevauchements`, `creneauxLibres`, `relanceDepuisManque` |
| `interlocuteurs.ts` | la source « Contacts par client » (§3) |
| `i18n.ts` | 52 clés fr/en (`definirMots`), l'anglais est le schéma. Interface au tutoiement, clés `client.*` au vouvoiement. |
| `index.ts` | exports |

**Choix à connaître**

- Les relances rendent un **verdict** (`possible` ou la raison et l'instant) plutôt qu'un booléen : l'écran affiche « Tu l'as relancé il y a moins de 7 jours. La prochaine sera possible le 06/11. » sans inventer de phrase.
- `marquerEnvoyee` **lève une erreur** si le verdict ne le permet pas : un écran ne peut pas, par erreur, envoyer deux fois le même jour.
- Les jeux de SIM (`relances`, `fidelite`) servent de **comparaison**, pas de source : `pointsDe` redonne exactement les points du jeu, et la file recalculée respecte les quatre garde-fous sur chaque volume.

## 5. Constats et questions pour le CO

1. **Fidélité : deux mécaniques.** L'écran actuel `/fidelite` est une carte à tampons (collection `loyaltyCards` : 10 tampons, le 11e offert). Le jeu de SIM et la logique livrée suivent la fiche MC02 (points, niveaux Bronze/Argent/Or, avantages). Lire la fiche avant de construire : garder les tampons, les remplacer, ou proposer les deux ? Une décision de Harun.
2. **Relances : le périmètre grandit.** `RemindersScreen` relance les factures seules (paliers `rappel` → `dernier-avis`, moteur `src/lib/relances.ts` que S9 réutilise). MC07 en attend cinq (devis, rendez-vous, prospects, inactifs). La logique livrée traite les cinq ; **elle ne reprend pas les paliers d'escalade des factures**, déjà dans `src/lib/relances.ts` et `connecteurs/moteurs/relances.ts`. À arbitrer à la construction : un seul moteur pour les cinq motifs (recommandé) ou deux côte à côte.
3. **Collection d'interlocuteurs.** MC03 et la source de H41 supposent une collection d'interlocuteurs ; l'app n'en a pas. Il faut un schéma, un hook et une migration (sans toucher à l'édition cliente). À planifier, avec l'accord du CO.
4. **Plafond de 3 relances et un message par client et par jour.** Ces deux garde-fous découlent de « on ne harcèle jamais un client » ; leurs valeurs viennent de moi (3 et 1), pas d'une fiche. L'espacement (7 jours) et la plage (lun.–ven. 08:00–19:00) viennent du CO. Valeurs à confirmer avec MC07.
5. **MC04 Équipe et MC05 Partenaires.** MC04 recoupe le trombinoscope (déjà au registre) ; MC05 n'a ni écran ni jeu d'organisations partenaires. À décider : jeu à commander à SIM, ou écrans plus simples.

Questions de mise en œuvre, à trancher avant les écrans :

- Reculer d'une étape dans le pipeline, rouvrir un prospect gagné ou perdu : la logique les interdit pour l'instant (terminaux). La fiche H06 dit-elle autre chose ?
- « Messagerie » comme moyen de joindre : ce que la fiche MC03 entend par là (message interne ? courriel ?) n'est pas lu. Aujourd'hui `moyenDeJoindre` rend l'adresse courriel.
- ⌘R est pris par le rechargement d'Electron (`STATUT.md` §1.8 n° 14) : aucun raccourci « Relancer » tant qu'une touche libre n'est pas choisie.

## 6. Ce qui n'a pas été fait, et pourquoi

- **Lecture du dossier v4 et des 13 fiches** : les zips ne sont pas dans l'environnement. Ni la mise en page, ni les textes des écrans, ni `tutoiement.json` n'ont été lus. Les textes de `i18n.ts` sont donc écrits par la session, au tutoiement de l'interface et au vouvoiement des messages clients, **sans être comparés à la table du dossier**. À faire dès que les zips sont posés : lire les 13 fiches et leurs images v4, aligner `i18n.ts` sur `_data/tutoiement.json`, relire les règles marquées « à confirmer ».
- **`check:tutoiement`** : n'existe pas dans la base actuelle (il arrive avec la passe finale v4 de S0). `check:contacts` en reprend l'esprit sur ses propres clés ; il faudra le brancher quand la garde commune existera.
- **Aucun écran, aucune brique visuelle, aucun import de `src/socle/ui`** : mode préparation, comme demandé.
- **Aucune capture** et aucune comparaison aux images : pas d'écran, pas de dossier d'images.
- **Aucune édition cliente touchée** : tout est dans `src/refonte/contacts/` (code interne), `scripts/`, `package.json`, `editions.yml` et `docs/`.

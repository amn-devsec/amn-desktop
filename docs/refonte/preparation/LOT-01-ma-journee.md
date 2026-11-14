# LOT-01 · Ma journée — note de préparation

> Branche `claude/refonte-journee`. Rédigée le 14 nov. 2026 par S2, en mode **PRÉPARATION** : la logique pure du lot est écrite et testée, **aucun écran visuel n'est construit**.
> **Les 5 zips v4 (`AMN-v4-1-docs.zip`, `AMN-v4-2` à `5-images.zip`) n'étaient pas sur la machine de la session.** Les 16 fiches, `04-ECARTS-MAQUETTES.md`, `06-V4-NEON-ET-TUTOIEMENT.md`, `_data/tutoiement.json` et les images v4 du lot **n'ont pas été lues**. Tout ce qui en dépend est marqué « à confirmer » ci-dessous et dans le code (`REGLES_PAR_DEFAUT`, `PALIERS_DE_SERIE`, `MODULES_SUIVIS`…, chacun à un seul endroit).
> Rien dans ce document ne décrit une faiblesse de sécurité ; aucune donnée réelle (jeux de SIM, `@exemple.test`).

## 0. Ce qui a été lu, et ce qui ne l'a pas été

| Lu | Pas lu |
|---|---|
| `REGLES.md`, `STATUT.md` (§1.5, §1.10 à §1.14, §1.29, §1.35, §5, section LOT-01 du §7), `PROMPTS-11NOV.md` (S2) | Les 16 fiches du lot et leurs images v4 |
| Les jeux de SIM (`src/refonte/donnees/ma-journee.ts`, `complements.ts`, `types*.ts`) et leurs **valeurs attendues** (`attendus.ts`, H04, G08, H25) | `04-ECARTS-MAQUETTES.md` (sections A et B) |
| Les écrans d'origine (`src/screens/**`, `src/business/AgendaScreen.tsx`), le registre (`declarations/jour.ts`), la substitution (`src/refonte/substitutions/`), `useAujourdhui` (`src/refonte/coquille/aujourdhui/`) | `06-V4-NEON-ET-TUTOIEMENT.md`, `_data/tutoiement.json`, `sources-neon/` |
| La logique des lots voisins (LOT-03 `serie.ts`, LOT-02, LOT-06) pour tenir les mêmes conventions | Le prompt PROMPT-LOT-01 du dossier |

Conséquence : **aucune disposition, aucune cote, aucun texte statique** n'est écrit. Les textes que la logique produit (`i18n.ts`) suivent le guide de voix du socle (tutoiement, aucun reproche) ; ils seront alignés mot pour mot sur les fiches à la construction.

## 1. Règles du CO qui s'appliquent (et où elles vivent)

- **Ne pas simplifier** (STATUT §1.10, demande du dirigeant) : le défi d'équipe **L07** (défi de la semaine, jauge, « Ce que chacun apporte » en engagements écrits, « Aussi en cours », frise des défis passés, célébrations, « Proposer un défi »), les **trophées et paliers** (H02, H04, L01) et les **défis hebdomadaires**. Limites fixées : **aucun chiffre individuel, aucun classement, aucun point perdu, aucun reproche**. Ce sont des propriétés du code, vérifiées par `check:journee` (§4).
- **Série = clôture des priorités du jour** (STATUT §1.5 n° 2, fiche L01) : une journée compte quand ses priorités sont faites avant la fin du jour. Repos par défaut samedi et dimanche, la série ne casse pas (décision du CO pour la série d'écriture, §1.29 n° 1, reprise ici par cohérence : **à confirmer sur L01**).
- **« Aujourd'hui » se lit par `useAujourdhui`** (§1.10 n° 3) : N01 et la carte de la barre latérale lisent les mêmes chiffres, calculés une fois.
- **Écrans calculés** (§1.11) : H04, G08 et H25. Le calcul est écrit ici ; SIM fournit les valeurs attendues, et `check:journee` les compare.
- **Tutoiement** dans l'interface ; vouvoiement seulement dans ce qui part chez un client (`REGLES.md`).
- **Couleurs v4** : `--fam-a` / `--fam-b` de Ma journée, posées par la coquille (le prompt dit `#6EA8FF` et `#A58BFF`). Le lot n'écrit aucune teinte à la main. États : succès `#5EE6A8`, info `#6EA8FF`, attention `#FFBE5C`, danger `#FF6B7A`, du socle.
- **Un commit par écran**, un push par lot de 3 à 5 écrans, capture 1440 × 900 comparée à l'image v4, date fictive du vendredi 30 oct. 2026, 10 h 42.

## 2. Les 16 écrans : d'où l'on part

« Origine » = l'écran existant que le substitut remplace (même route). « Clé module » = la garde `ModuleRoute` de la route d'origine, que `check:substitutions` compare à la source. « Logique » = ce qui est prêt dans `src/refonte/journee/`.

| ID | Écran | Type | Origine (route · fichier · clé module) | Données (jeux de SIM) | Logique préparée | À écrire à la construction |
|---|---|---|---|---|---|---|
| N01 | Accueil | mixte | `/` · couture `@edition/accueils` (l'Accueil `42k` actuel : `src/refonte/accueil/`) | `taches`, `evenements`, `tickets`, `factures`… via `useAujourdhui` | `serieDeLaJournee` (la règle unique), `bilan`, phrases | l'écran ; **il lit `useAujourdhui`, il ne recalcule rien** ; `check:accueils` reste vert |
| H25 | Tableau de bord, widgets | mixte | `/tableau-de-bord` · `src/screens/TableauDeBordScreen.tsx` · `dashboard` | `tickets`, `factures`, `paiements`, `taches`, `evenements`, `devis` | `tableauDeBord` (égale `attendusTableauDeBord`) | les widgets et leur disposition (format de la grille : à confirmer, fiche H25) |
| G08 | Cockpit client : Stripe, utilisateurs, tickets | mixte | **aucun écran, aucune route** : à lire sur la fiche (contexte client / support ?) | `abonnements`, `paiements`, `clients`, `tickets`, `connecteurs` | `cockpitDuClient` (égale `attendusCockpit`) | l'écran ; **clés Stripe côté serveur**, l'écran ne voit que des agrégats et des valeurs masquées |
| H01 | Calendrier | mixte | `/agenda` · `src/business/AgendaScreen.tsx` (**partagé avec l'édition cliente**) · `agenda` | `evenements` (⊇ `Appointment`) | aucune (la grille et le placement des événements qui se chevauchent sont à écrire) | l'écran, par une couture si le fichier d'origine reste partagé ; `systeme` ne compte pas dans « n rendez-vous » |
| H02 | Tâches | mixte | `/tasks` · `src/screens/TasksScreen.tsx` · `tasks` | `taches` | série et paliers (`PALIERS_DE_SERIE`) | l'écran, les trophées et paliers (**protégés**) |
| H03 | Missions et tickets, kanban | mixte | **pas d'écran d'origine** (le plus proche, `/tableau-projets`, est le tableau des projets) : route à lire sur la fiche | `tickets` | `trierLaColonne`, `deplacer` (CY12 s'appuie sur H03) | l'écran ; entrée `nouveau` dans `declarations/jour.ts` |
| H04 | Bilan de la semaine | mixte | `/revue-hebdo` · `src/screens/WeeklyReviewScreen.tsx` · `weekly` | `taches`, `paiements`, `clients`, `factures` | `bilanDeLaSemaine` (égale `attendusBilanSemaine`), jalons | l'écran, les trophées et paliers (**protégés**) |
| MJ01 | Projets | mixte | `/projets` · `src/screens/ProjectsScreen.tsx` · `projects` | `projets`, `taches` | `projetCalcule` (avancement et statut, égale SIM) | l'écran |
| MJ03 | Planning de l'équipe | mixte | `/planning` · `src/screens/ShiftsScreen.tsx` · `shifts` | `creneaux` | `personnesDuCreneau`, `chevauchements` | l'écran |
| MJ02 | Habitudes | mixte | `/personnel/habitudes` · `src/screens/HabitsScreen.tsx` · `habits` (et `/routines`, `routines`) | `habitudes` | `serieDHabitude`, `tauxDeTenue`, `prevueCeJour` | l'écran |
| MJ04 | Notes rapides | mixte | `/notes` · `src/screens/NotesScreen.tsx` · `notes` | `notes` (⊇ `Note`, `nonLue`) | aucune | l'écran |
| MJ05 | Rappels | mixte | **pas d'écran d'origine** : `/relances` (`RemindersScreen`) est celui des relances de paiement, pas MJ05 | `rappels` | `etatDuRappel`, `ordreDesRappels` | l'écran ; entrée `nouveau` |
| L03 | Rituel du matin | nouveau | aucun | — (composé des sources de N01) | à lire sur la fiche | tout |
| L02 | Mode Focus | nouveau | aucun (existe : `/personnel/pomodoro`, `PomodoroScreen`) | — | à lire sur la fiche (machine à états de la session) | tout |
| L01 | Séries et jalons | nouveau | aucun | `taches` (SIM) ; **priorités du jour absentes des jeux** | `serieDeLaJournee`, `PALIERS_DE_SERIE`, `jalonDeFactures` | tout ; trophées et paliers (**protégés**) |
| L07 | Défis d'équipe | nouveau | aucun | `defis` | `etatDuDefi`, `jaugeDuDefi`, `defiDeLaSemaine`, `aussiEnCours`, `friseDesDefis`, `defisACelebrer`, `apportsDeLEquipe`, `verifierProposition`, `joursSansImpaye` | tout (**protégé : rien n'est simplifié**) |

**Comment les écrans seront branchés** (à la construction, rien n'est écrit aujourd'hui) :

- **Écrans qui remplacent un écran existant** (H25, H01, H02, H04, MJ01, MJ03, MJ02, MJ04) : `declarerSubstitutions('journee', [{ route, module, composant: lazy(...) }])` dans `src/refonte/substitutions/declarations/journee.tsx` (un fichier par lot, `.tsx`). Je ne modifie ni `src/screens/**` ni `appRoot.internal.tsx`.
- **Écrans nouveaux** (H03, MJ05, G08, L01, L02, L03, L07) : une vue déclarée avec `nouveau` dans `src/refonte/modules/declarations/jour.ts` (le fichier de ma famille) ; `ecransNeufs` leur donne leur route et leur garde.
- **N01** : par la couture `@edition/accueils` (l'entrée de `accueils.internal.tsx`), `check:accueils` reste vert.
- **Écrans d'origine partagés avec l'édition cliente** (H01 : `src/business/AgendaScreen.tsx`) : le substitut vit dans `src/refonte/journee/`, le fichier d'origine ne bouge pas.

## 3. Les règles de calcul, et d'où elles viennent

| Règle | Source | Code | Statut |
|---|---|---|---|
| **Série** : journées dont toutes les priorités sont faites avant la fin du jour ; aujourd'hui non fini = neutre ; samedi/dimanche = repos ; un jour sans priorité choisie n'est pas joué | STATUT §1.5 n° 2 (L01), §1.29 n° 1 (repos) | `serie.ts` (`serieDeLaJournee`, `REGLES_PAR_DEFAUT`) | règle validée ; **repos et « jour sans priorité » à confirmer sur L01** |
| **Paliers** 5, 10, 20, 30, 50, 100 ; **record** et palier atteint gardés pour toujours ; série interrompue = « reprise », jamais un 0 | H04 *Proposition* (reprise par SIM) ; §1.10 (aucun point perdu) | `serie.ts` | **à confirmer sur H04 et L01** (LOT-03 utilise 7/14/21/30/60/100 : deux échelles) |
| **Jalon « 10 factures »** (envoyées ou payées) | H04 *Proposition* | `jalons.ts` | à confirmer (les autres jalons de L01 sont à lire sur la fiche) |
| **H04** : tâches faites/total/écart, encaissé et écart, nouveaux clients, par jour, meilleur jour (le plus récent à égalité), « à reporter », semaine chargée (écart ≥ 2 sur la moyenne des 4 semaines) | fiche H04 rubrique 6, via `attendusBilanSemaine` | `bilan.ts` | **égale les attendus de SIM** (4 volumes, 8 graines, 4 semaines, 4 personnes) |
| **G08** : revenu récurrent et écart à 30 jours, encaissé du mois, clients actifs, tickets par colonne (3 visibles, urgents d'abord) | fiche G08 rubrique 6, via `attendusCockpit` | `cockpit.ts` | **égale les attendus de SIM** ; objectif du mois et utilisateurs connectés rendus `null` (pas de faux chiffre) |
| **H25** : CA du mois à date et écart au même quantième, tickets, impayés par client, mes tâches du jour, prochain rendez-vous, activité | fiche H25 rubrique 6, via `attendusTableauDeBord` | `tableauDeBord.ts` | **égale les attendus de SIM** |
| **MJ01** : avancement = tâches faites / tâches, sinon saisie manuelle ; statut dans l'ordre Terminé, En retard, Presque fini, À démarrer, En cours | fiche MJ01 « règle d'affichage », via SIM | `projets.ts` | **égale SIM** sur chaque projet |
| **L07** : état d'un défi (Compteur de jours et Seuil tenus dès la cible ; Taux de tenue jugé à la fin de sa période), jauge d'équipe, « zéro impayé » (30 jours, tolérance 3 jours) | fiche L07 *Propositions*, via SIM | `defis.ts` | **égale SIM** ; à confirmer sur L07 |
| **MJ02, MJ03, MJ05, H03** | modèle de données de SIM (`Habitude`, `Creneau`, `Rappel`, `Ticket`) | `habitudes.ts`, `planning.ts`, `rappels.ts`, `kanban.ts` | **propositions** ; à confirmer sur les fiches |

Les écrans calculés reçoivent **la série en entrée** (`serie: { serie }`) : ils ne la recalculent pas. C'est ce qui permet de la changer à un seul endroit (§4 n° 1).

## 4. Ce qui est protégé, et comment `check:journee` le tient

Les quatre limites sont des **propriétés du code**, pas des consignes : un test les casserait.

1. **Aucun chiffre individuel.** « Ce que chacun apporte » (`apportsDeLEquipe`) renvoie, par personne, un **engagement écrit** ou `null` ; aucun type du fichier (`ApportDeLaPersonne`, `Engagement`) ne porte un nombre. La jauge est celle de l'équipe.
2. **Aucun classement.** L'ordre des personnes est alphabétique : il ne dépend d'aucune valeur ni de l'ordre d'arrivée (testé sur des permutations). Aucun mot de rang dans le code des défis et de la série.
3. **Aucun point perdu.** Une série interrompue « reprend aujourd'hui » ; le record et chaque palier atteint restent ; un défi tenu reste dans la frise ; l'état d'un défi n'a que trois valeurs (« En cours », « Tenu », « Terminé »), jamais « raté ».
4. **Aucun reproche.** Un rappel passé est « À reprendre », pas « en retard » ; un projet en retard reçoit une proposition (« Tu veux décaler l'échéance, ou découper ce qui reste ? ») ; le guide de voix du socle passe sur chaque texte français.

T1 vérifiera en plus **leur présence à l'écran** à ± 2 px (§1.10) : c'est l'écran de la construction, pas la logique.

## 5. Décisions à demander au CO

1. **Trois définitions de « série » coexistent dans le dépôt.**
   - (a) `calculerAujourdhui` (`src/refonte/coquille/aujourdhui/calculer.ts`, **fichier de S0**) appelle `meilleureSerie(routines)` de mon ancien Accueil : les jours de routine cochés ;
   - (b) SIM compte les jours où toutes les **tâches** d'échéance sont faites (`journeesDeTravail`, `serieEnCours`), et ses attendus H04 et H25 en dépendent ;
   - (c) la règle du CO et de la fiche L01 : la clôture des **priorités** du jour.

   Le lot implémente (c) (`serieDeLaJournee`). **Demande** : que `calculerAujourdhui` lise (c) (c'est une ligne), et que SIM aligne ses attendus H04 et H25 sur la même règle. D'ici là, `check:journee` compare H04 et H25 **en leur donnant la série de SIM**, pour tout vérifier sauf la série elle-même, qui a ses propres tests.
2. **Les jeux de SIM n'ont pas de priorités du jour** (collection `dailyPriorities`). Sans elles, (c) ne peut pas être éprouvée sur le monde de SIM : seulement sur des cas écrits à la main.
3. **H25 « Mes tâches : même règle que N01 »** : N01 lit le fil du jour (priorités, rendez-vous, tâches), SIM compte les tâches d'échéance du jour. Le lot suit SIM pour H25. À trancher quand la fiche sera lue.
4. **Les engagements écrits de L07 n'ont aucune donnée** : `Defi` n'a pas de champ « engagements » et aucune collection n'existe côté amn-api. Les stocker demande une **collection nouvelle** ou un autre support : décision à présenter à Harun (« demande à amn-api », §1.13 n° 6). En attendant, l'écran peut s'appuyer sur `apportsDeLEquipe(participants, [])` : chaque personne est invitée à écrire la sienne.
5. **Un moment `defi.tenu`** (ton `fete`) au catalogue du bus de moments pour les célébrations : un nouveau type passe par le CO (`REGLES.md`). `defisACelebrer` dit déjà quels défis fêter, une seule fois.
6. **G08, clés Stripe** : les agrégats (revenu récurrent, encaissé) doivent venir du **serveur**. Les clés ne passent jamais par le poste. Une demande à amn-api (point d'agrégats) est à ouvrir ; elle ne décrit rien de sensible.
7. **Écrans sans origine ni route** (G08, H03, MJ05) : leur route est à lire sur la fiche. Ils s'ajoutent comme vues `nouveau` dans `declarations/jour.ts`.
8. **`check:tutoiement`** : le dossier `src/refonte/journee` est ajouté à son périmètre (le fichier le prévoit : « un lot qui passe ses textes au tutoiement ajoute son dossier »). Ajout signalé, rien d'autre n'est touché dans ce script.

## 6. Manque aux données (à recopier dans la section de STATUT)

| Manque | Pour quoi | Demandé à |
|---|---|---|
| Priorités du jour (`dailyPriorities` : jour, priorités, instant de clôture) | la série (L01, N01, H04, H25) | SIM |
| Engagements écrits des défis (personne, texte, défi) | L07 « Ce que chacun apporte » | Harun / amn-api (§5 n° 4) |
| Objectif du mois (réglage) | G08, anneau d'objectif | SIM |
| Utilisateurs connectés par jour (API du client) | G08, H25 | amn-api |
| Historique quotidien des messages à traiter | « Boîte à zéro » (N01, H04) | SIM |
| Disposition des widgets (format de la grille) | H25 | à lire sur la fiche |

## 7. Ce que `check:journee` vérifie (45 contrôles, sans réseau ni navigateur)

- la série : clôture, aujourd'hui neutre, repos, jour sans priorité, paliers, record, jour du palier, fuseau de Paris ;
- **H04, G08 et H25 égaux aux valeurs attendues de SIM**, aux quatre volumes et sur quatre graines de plus (la garde rougit si une règle est cassée : vérifié par mutation) ;
- les projets, les habitudes, les rappels, le planning, le kanban ;
- les propriétés protégées de L07 et de L01 (§4) ;
- la voix : tutoiement, aucun « -ez », aucun point d'exclamation, aucun mot de reproche, français et anglais alignés, formes `.1` et `.n` ;
- la structure : aucun composant ni React ni brique du socle visuel, aucune horloge, aucun secret dans le cockpit, aucune adresse hors `exemple.test`, aucune dépendance à la logique d'un autre lot.

## 8. Reste à faire dès que les zips sont là

1. Lire les 16 fiches et `04-ECARTS-MAQUETTES.md`, puis passer chaque « à confirmer » de la §3 : un par un, la valeur change à un seul endroit.
2. Écrire N01 d'abord (le prompt), puis par lots de 3 à 5 écrans : un commit par écran, une capture à 1440 × 900 comparée à l'image v4, la ligne de l'écran dans la section de STATUT.
3. Ajouter à `i18n.ts` les textes statiques de chaque fiche, mot pour mot, passés au tutoiement avec `_data/tutoiement.json`.

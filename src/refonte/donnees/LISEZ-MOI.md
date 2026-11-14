# Jeux de données fictives de la refonte

Des données **entièrement inventées**, en français, pour construire et tester les
écrans sans jamais toucher à une vraie donnée. Un appel suffit :

```ts
import { construireMonde, jeu } from '../donnees';

const monde = construireMonde();                       // tout, volume « normal »
const gros = construireMonde({ volume: 'beaucoup' });  // de quoi éprouver défilement et pagination
const clients = jeu('clients', 'peu');                 // un seul jeu
const mixte = construireMonde({ volume: 'normal', volumes: { factures: 'vide', clients: 'beaucoup' } });
```

## Ce qui est garanti

| Garantie | Comment |
|---|---|
| **Reproductible** | même graine, mêmes données, à l'octet près (`GRAINE_REFERENCE`). Chaque jeu a son hasard : changer le volume d'un jeu ne déplace pas les autres. |
| **Stable dans le temps** | rien ne lit l'horloge. « Maintenant » = **vendredi 30 octobre 2026, 10 h 42** (`MAINTENANT_REFERENCE`), le jour des maquettes ; **mardi 3 novembre 2026** pour le lot Cyber (`MAINTENANT_CYBER`). Une capture refaite dans un an est identique. `construireMonde({ maintenant })` décale tout de façon cohérente. |
| **Rien de réel** | courriels en `@….exemple.test` (domaine réservé, RFC 2606) ; téléphones dans les plages que l'ARCEP réserve à la fiction (`01 99 00`, `06 39 98`) ; SIRET commençant par `000`, IBAN à clé `00`, jamais d'IBAN complet ; plaques d'immatriculation invalides par construction ; aucune photo, aucun secret (les secrets sont des **valeurs masquées**, jamais une valeur). La Garde et Cyber : identifiants `FICT-AAAA-NNNN`, aucune adresse réseau, aucun nom d'outil de sécurité réel, constats réduits à un titre et une gravité, campagnes réduites à des agrégats. Les noms sont des assemblages de prénoms et noms courants : une ressemblance avec une vraie personne est une coïncidence. |
| **Cohérent** | une facture payée a son paiement, qui a son mouvement bancaire ; un client est « Impayé » parce qu'une facture est échue ; une série vient des tâches faites ; le statut d'un projet vient de ses tâches ; la TVA à payer vient des factures et des dépenses du mois ; le net d'un bulletin vient des salaires du mouvement bancaire ; la quantité d'un article est la somme de ses mouvements ; le nombre de non-lus d'une conversation vient de ses messages ; l'état d'une organisation de La Garde vient de son score, de ses alertes ouvertes et de sa dernière ronde ; l'état d'une mission Cyber vient de son accord. Les maquettes se contredisent (72 clients ici, 48 là) : ces jeux, non. |
| **Complet pour les écrans** | dès « peu » ou « normal », chaque cas que les fiches montrent existe : un impayé, un brouillon, une facture annulée, une tâche en retard, une ronde de La Garde à venir, les trois statuts de client, les quatre colonnes de tickets… |

## Volumes

| Volume | Sert à | Exemple (clients / factures / tâches) |
|---|---|---|
| `vide` | l'état vide de chaque écran | 0 / 0 / 0 (l'équipe garde la personne connectée) |
| `peu` | un compte qui démarre | 6 / 8 / ≈ 50 |
| `normal` | le cas des maquettes | 48 / 70 / ≈ 270 |
| `beaucoup` | défilement, pagination, performance | 300 / 700 / ≈ 1 750 |

`construireMonde` assemble les 119 jeux en quelques centaines de millisecondes, même au volume `beaucoup`.

## Conventions

- **Montants en centimes entiers** (`...Cents`), TTC sauf mention contraire. Aides : `totauxDeFacture`, `totauxDeLignes`.
- **Un champ qui existe déjà dans le dépôt garde son nom** (`title`, `status`, `assigneeEmail`, `amountCents`…). Un champ que seule une fiche réclame est en français et cite sa fiche (`types.ts`). `compat.ts` vérifie à la compilation que `FicheClient`, `Devis`, `Facture`, `Evenement`, `Depense`, `NoteRapide` et `Projet` restent des sur-ensembles des types du dépôt.
- **Numérotation** : le format du module existant — `AAAA-NNNN` pour une facture, `AV-AAAA-NNNN` pour un avoir, chacune continue par année. Les avoirs (`avoirs`) sont des factures de nature `creditNote` qui réduisent `creditNoteFor` ; le reste dû (`soldeCents`) en tient compte, et le chargeur les range avec les factures. Ils sont dans le monde par défaut (`construireMonde({ avoirs: false })` pour un monde sans avoir).
- **Rôles** : les quatre du serveur (`owner`, `admin`, `member`, `guest`). « Partenaire » n'est pas un rôle : les partenaires sont des contacts (MC05).
- **Jours** : `AAAA-MM-JJ` du calendrier de Paris (heure d'hiver et d'été gérées). **Instants** : ISO.
- **Ce qui est dérivé se recalcule** : « En retard » (`statutAffiche`), santé d'un client (`calculerSante`, formule proposée par H05), avancement et statut d'un projet (`avancementProjet`, `statutProjet`), série (`journeesDeTravail`, `serieEnCours`), quantité en stock (`quantiteEnStock`), état d'une organisation (`etatOrganisation`), score et niveau de maturité (`scoreMaturite`, `niveauMaturite`), état d'un accord (`etatAccord`), disponibilité d'un outil (`outilDisponible`), niveau de conformité (`niveauConformite`), jours sans impayé (`joursSansImpaye`). Un écran doit refaire ces calculs ; les valeurs stockées servent à comparer.
- Les règles que les fiches disent « à confirmer dans le code » sont implémentées comme **propositions**, nommées dans le code. Ne les prenez pas pour la règle du produit.

## Catalogue des jeux

Les 119 jeux sont dans `types.ts` (`NOMS_DES_JEUX`, 25) et `types-suite.ts` (`NOMS_DES_JEUX_SUITE`, 94). Fiches = celles de `AMN-refonte-CO/lots/`.

| Lot | Jeux | Fichier |
|---|---|---|
| Base | `equipe`, `entreprise` | `equipe.ts`, `fond.ts` |
| Ma journée | `taches`, `evenements`, `projets`, `tickets`, `notes`, `rappels`, `habitudes` ; `dailyPriorities` (la série), `engagementsDefis`, `utilisateursConnectes`, `boiteAZero` ; planning de l'équipe : `creneaux` ; défis : `defis` | `ma-journee.ts`, `complements.ts` |
| Contacts | `clients`, `interlocuteurs`, `prospects`, `fournisseurs`, `achats`, `avis`, `relances`, `fidelite` ; `partenaires` | `contacts.ts`, `complements.ts` |
| L'argent | `devis`, `factures`, `avoirs`, `paiements`, `depenses`, `abonnements`, `contrats`, `comptes`, `mouvements`, `enveloppes` ; TVA et impôts : `echeancesFiscales` ; paie : `bulletins` ; tarifs : `prestations` | `argent.ts`, `complements.ts` |
| Écrire | `fichiers`, `signatures`, `pages`, `modeles`, `journal`, `textes`, `archives`, `connaissances`, `reglesArchivage`, `demandesRelecture` | `ecrire.ts` |
| Échanger | `conversations`, `messages`, `canaux`, `annonces`, `courriels`, `salles`, `appels`, `reunions`, `partages`, `sondages`, `reponsesAuto` | `echanger.ts` |
| Créer | `articles`, `produits`, `commandes`, `chantiers`, `dossiersPhotos`, `marque`, `videos`, `pagesPubliques`, `etapesTournee`, `equipements`, `ressources`, `reservations`, `vehicules`, `modelesControle`, `controles`, `ecarts` ; boutique en ligne (MR08) : `entonnoirBoutique`, `paniers`, `sessionsBoutique` | `creer.ts`, `boutique.ts` |
| Outils | `corbeille`, `aide`, `secrets` (masqués), `sites`, `trackers`, `sauvegardes`, `operations`, `raccourcis`, `automatisations`, `connecteurs`, `notifications`, `modelesMetier`, `usagesCalculs` | `boite-outils.ts` |
| La Garde | `organisations`, `actifs`, `alertes`, `incidents`, `vulnerabilites`, `rondes`, `evenementsSecurite`, `journalAcces`, `criteresMaturite`, `offresCyber` | `garde.ts` |
| Développement (LOT-11) | `depots`, `deploiements`, `deploiementsPlanifies`, `executions`, `tachesPlanifiees`, `mesuresServeur`, `servicesServeur`, `serveur` (résumé : jours en ligne, disque, sauvegardes, coût du mois), `paiementsConnecteurs` ; `connecteurs` complétés (mode, modèle de coût, consommation, payé) | `developpement.ts` |
| Cyber (LOT-10) | `outilsCyber`, `accords`, `missions`, `constats`, `documentsCyber`, `logicielsClients`, `alertesVeille`, `fuites`, `dossiersConformite`, `campagnes`, `parcSecurite` | `cyber.ts` |
| Cyber, compléments de LOT-10 (S8) | `sousEtapesMission`, `journalMission`, `equipeMission`, `appareilsParc` (CY03, un par un), `digestVeille`, `elementsEmpreinte`, `playbooksIncident`, `reponsesIncident`, `communicationsIncident`, `preuvesIncident`, `controlesConformite`, `maturiteConformite`, `modulesFormation`, `parcoursFormation`, `historiqueCampagnes` ; champs ajoutés : `cible` d'un outil, `perimetre.nbAdresses`, `categorie` / `editeur` / `scorePublie`, `accordId` d'une campagne, `antivirusActifs` | `cyber.ts`, `cyber-suite.ts`, `attendus-cyber.ts` |

Aides communes : `commun.ts` (horodatages bornés au passé, cycles, hasard par jeu).

**Pas encore faits** : voir le rapport `docs/refonte/rapports/DONNEES.md`.

## Les valeurs attendues des écrans calculés (`attendus.ts`)

Quatre écrans calculent au lieu de lire un jeu. Leurs **attendus de test** sont des fonctions littérales du monde (pas une seconde implémentation : le calcul reste à la session du lot, qui compare) :

| Écran | Fonction | Ce qu'elle rend |
|---|---|---|
| H09 Prévisions de trésorerie | `attendusPrevisions(monde, { horizonJours })` | solde, série jour par jour, point le plus bas et creux, entrées attendues, six prochains mouvements, trois scénarios, fourchette, bannière |
| H04 Bilan de la semaine | `attendusBilanSemaine(monde, { jour, email })` | tâches faites sur total, encaissé, nouveaux clients, tâches par jour, à reporter, jalons, suggestion de la semaine suivante |
| G08 Cockpit | `attendusCockpit(monde)` | revenu récurrent, encaissé du mois, clients actifs, tickets par colonne, sources |
| H25 Tableau de bord | `attendusTableauDeBord(monde)` | chiffre d'affaires, tickets, factures impayées, mes tâches, prochain rendez-vous, activité |

**La série** (L01, N01, H04, H25) est celle de la clôture des priorités du jour (`dailyPriorities`, `serieDesPriorites`), relue à la lettre dans `attendus.ts` et comparée à `serieDeLaJournee` de S2. `attendusCockpit` rend maintenant l'objectif du mois (`objectifMrrCents` : anneau, « plus que… », avance ou retard en jours, objectif atteint) et les utilisateurs connectés (aujourd'hui et sept jours ; `null` sans série). Les règles que les fiches disent « Proposition » ou « à confirmer » le restent dans les commentaires.

## Charger les jeux dans l'API d'essai (`scripts/charger-donnees-essai.mjs`)

```
node scripts/charger-donnees-essai.mjs --volume normal      # vide | peu | normal | beaucoup
```

N'écrit que sur `127.0.0.1` et que pour un compte `@exemple.test`. Huit jeux ont une collection d'accueil dans amn-api (clients, projets, tâches, rendez-vous, notes, devis, factures, dépenses ; sept sont prouvés par `compat.ts`, les tâches ont un type lâche) ; le script nomme les autres en fin de passage. Mode d'emploi pour Harun : `docs/refonte/LANCER-EN-LOCAL.md`, étape 4. La Garde (`--garde`) passe par `scripts/seed-supervision.mjs`, qui exige une API d'essai sur un fichier.

## Développement (LOT-11, `developpement.ts`)

Les formes sont des sur-ensembles de celles de S8 (`src/refonte/developpement/`) : sa logique (`etatGlobal`, `executionsDuMois`, `precedentPassage`…) lit ces jeux sans adaptateur, ce que `compat.ts` et `check:donnees` vérifient. Le journal d'exécutions est la vérité des automatisations : le compte du mois et le dernier passage s'en déduisent. Aucun nom d'hôte, aucune adresse, aucun port, aucune variable d'environnement. Les modèles de sites ne sont pas des données de SIM (contenu à relire par Harun).

## La charge (LOT-14, `charge.ts`)

`genererOrganisationsDeCharge({ graine, nombre })` : jusqu'à 1 000 organisations fictives de 10 à 600 personnes, reproductibles et emboîtées ; `choisirConnectees` désigne celles qui travaillent en même temps. Scénarios, seuils et mode d'emploi : `docs/simulation/charge.md` ; exécution : `simulation/charge/executer.mjs`.

## Vérifier

```
node --experimental-strip-types --disable-warning=ExperimentalWarning --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/check-donnees.ts
```

106 contrôles : reproductibilité, volumes, absence de données réelles, références
qui existent, numérotation continue des factures, chiffres qui se recoupent,
français correct, absence de secret, d'adresse réseau et de nom d'outil de sécurité réel, et les mêmes invariants sur 12 graines (« peu » et « normal »), 4 graines (« beaucoup ») et 4 dates de référence.

## Ajouter un jeu

1. Le type dans `types.ts` (sur-ensemble du type du dépôt s'il existe, puis une ligne dans `compat.ts`) ; le nom dans `NOMS_DES_JEUX` et dans `Monde`.
2. Un générateur : `hasard(graineDe(ctx.graine, 'nom'))`, `compter(ctx.volumes.nom, [vide, peu, normal, beaucoup])`, aucune lecture de l'horloge.
3. Son appel dans `monde.ts`, **après** les jeux dont il dépend.
4. Les cas que les écrans montrent doivent être **garantis**, pas laissés au tirage (voir `garantir` dans `argent.ts`).
5. Des contrôles dans `scripts/check-donnees.ts` : références, passé et futur, recoupements.

## Cyber, LOT-10 (S8) : ce que les jeux donnent aux écrans CY01 à CY14

Jour de référence : **mardi 3 novembre 2026, 10 h 42** (`contexte.aujourdhuiCyber`). Tout est fictif : aucune adresse IP, aucun numéro, aucun nom de personne privée, aucun contenu de preuve ou de fuite. `attendusCyber(monde)` (fichier `attendus-cyber.ts`) rend les valeurs attendues des écrans calculés.

| Écran | Jeu ou champ | Ce qu'il faut savoir |
|---|---|---|
| CY02 | `outilsCyber[].cible` (`domaine`, `adresse`, `locaux`, ou vide) | Un outil « Accord requis » en a toujours une, les autres jamais. L'accord porte `perimetre.domaines`, `locaux` et `nbAdresses` (un nombre, jamais les adresses). |
| CY02, CY14 | `sousEtapesMission` | 3 par phase, 15 par mission. Phase passée faite, phase courante entamée, phases suivantes vides ; « Accord signé » dit la vérité de l'accord. |
| CY02, CY14 | `journalMission` | Entrées typées (Accord, Phase, Constat, Document, Contact, Note), du plus récent au plus ancien ; rien pour une mission « À préparer ». |
| CY14 | `equipeMission` | Un responsable, un seul contact d'urgence par mission, `joignable` = le créneau de l'accord (« 19 h – 7 h »), sinon « 8 h – 19 h ». |
| CY03 | `appareilsParc` | Un appareil par ligne (« Poste 03 », « Serveur 1 »). Le parc EST la somme de ses appareils (à jour, correctifs, antivirus, sauvegardes). Hors ligne = plus de 48 h sans nouvelles (`HORS_LIGNE_APRES_HEURES`). |
| CY05 | `alertesVeille[].scorePublie` / `categorie` / `editeur`, `logicielsClients[].categorie` / `editeur`, `digestVeille` | Bandes proposées : 9 et plus Critique, 7 à 8,9 Importante, 4 à 6,9 Modérée, moins Faible (`SEUILS_SCORE`, `bandeDuScore`). Un logiciel « concerné » est du produit de l'alerte. `serieDigest` : jours ouvrés lus d'affilée, un jour non lu aujourd'hui ne casse pas. |
| CY06 | `elementsEmpreinte` | 7 catégories (`CATEGORIES_EMPREINTE`, proposition de SIM à confirmer avec la fiche), seulement pour une mission de recherche à accord signé, des libellés généraux (« 2 dirigeants inscrits (noms non repris) »), sur 30 jours. |
| CY08 | `playbooksIncident`, `reponsesIncident`, `communicationsIncident`, `preuvesIncident` | Un suivi par incident de La Garde. **Les dates sont de l'horloge Cyber**, pas de celle de `IncidentGarde.ouvertAt` : le premier incident (INC-0412, « compte compromis ») est détecté 26 h 15 min avant le 3 nov., 10 h 42 ; il reste 45 h 45 min avant l'échéance de 72 h, la notification n'est pas faite. Une preuve = un nom et une empreinte vérifiée, jamais le contenu. |
| CY09 | `controlesConformite`, `maturiteConformite` | 10 contrôles (5 RGPD = les points du dossier, 3 Sécurité de base, 2 NIS2) × les clients du dossier (7 au volume « normal »), niveau de 0 à 4, preuves jointes ⊆ preuves attendues. Une case RGPD au niveau 3 ou 4 = point rempli du dossier. La liste « à valider par un conseiller » est en donnée (`aValiderParConseiller`). |
| CY10 | `modulesFormation`, `parcoursFormation`, `historiqueCampagnes`, `campagnes[].accordId` | Parcours de 5 modules par équipe (jamais par personne). Une équipe de moins de 5 (`EFFECTIF_MINIMUM_EQUIPE`) existe au volume « normal ». L'historique : 6 simulations par client qui en fait. Une simulation porte l'accord signé de son client. |

Choix de SIM à connaître : les 7 catégories d'empreinte, les bandes de score, l'éditeur fictif de chaque produit (« Éditeur Aster »…), le créneau par défaut et le seuil « hors ligne » sont des propositions ; chaque valeur est dans une constante exportée.

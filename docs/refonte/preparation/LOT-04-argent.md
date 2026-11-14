# LOT-04 · L'argent — note de préparation

> Branche `claude/refonte-argent`, partie de `claude/refonte-vivante` @ `8333822`. Rédigée le 14 nov. 2026 par DS, en mode PRÉPARATION (socle v4 non fusionné : aucun écran, aucune brique visuelle).
> Prompt : `PROMPTS-12NOV.md` §2 (commit `e79cd7b`).
> Rien dans ce document ne décrit une faiblesse de sécurité ; aucune donnée réelle.

## 0. ⚠ Source manquante : le dossier v4

Les 5 zips `AMN-Business-dossier-v4` n'étaient **pas disponibles** dans la session. On n'y avait ni les 17 fiches, ni les images, ni `_data/tutoiement.json`, ni `06` et `01`.

- **Ce qui ne dépend pas des fiches est livré** : la logique d'argent, testée sur des cas écrits à la main et rejouée sur les jeux de SIM.
- **Ce qui en dépend reste à faire avec le dossier** :
  - la ligne « ce que la fiche demande » de chaque écran (§4) ;
  - les textes exacts des écrans ;
  - les seuils propres à une fiche.

  Ces points sont marqués **[fiche]** ci-dessous.

Les règles ont été tirées de quatre sources :

- les commentaires des jeux de SIM (qui citent les fiches : « comme H07 ») ;
- les décisions de `STATUT.md` (§1.5, §1.11, §1.21, §1.22) ;
- le prompt du 12 nov. ;
- le code existant.

**À faire dès que le dossier est là** : relire §4 et §7 contre les 17 fiches. Une règle de fiche qui contredit le code se corrige dans le code, avec son cas dans `check:argent`.

## 1. En bref

- **Logique pure livrée** : `src/refonte/argent/`, 14 fichiers. Ni React, ni réseau, ni horloge (« aujourd'hui » est toujours passé en paramètre). Tous les montants sont en centimes entiers, avec un seul arrondi, celui de `src/lib/money.ts` (0,5 s'éloigne de zéro).
- **Garde** : `scripts/check-argent.ts` (`npm run check:argent`), **53 propriétés**, ajoutée à `package.json` et `editions.yml` (ajouts seulement). Elle contrôle trois choses :
  - des **cas écrits à l'avance**, détail du calcul en commentaire, montants vérifiés à part avant le code ;
  - le **rejeu sur les jeux de SIM** (volumes `vide`, `peu`, `normal`, `beaucoup`, plus 3 graines). La logique retrouve les totaux et les soldes stockés, la TVA de chaque échéance « TVA de … », les cotisations, les prélèvements et les impayés ;
  - la **structure** : aucun écran, aucun import depuis le code partagé, aucune fonction qui émette un virement, fr et en aux mêmes clés, tutoiement de l'interface et vouvoiement des textes clients.
- **Banque en lecture seule** : rien n'émet de virement. `banque.preparerOrdre` prépare un ordre (`emis: false`, `aExecuterDansTaBanque: true`) sans IBAN complet (4 derniers caractères seulement).
- **Deux écarts à trancher** (§5) :
  - l'**arrondi de la TVA** diffère entre la fiche H07 (par taux) et le module existant `src/lib/money.ts` (par ligne). C'est un centime de différence possible par facture ;
  - le **régime de TVA** : les jeux comptent la TVA à l'émission (« débits »), alors que la règle par défaut des prestations de services est « encaissements ». Les deux régimes sont codés, le choix revient au CO et au comptable.

## 2. Tableau récapitulatif

| ID | Écran | Existant le plus proche (route) | Données (`src/refonte/donnees/`) | Logique livrée (`src/refonte/argent/`) |
|---|---|---|---|---|
| F30 | Vue d'ensemble | aucun ; repli `/ensemble/:famille` (socle) | tout le lot | lit les autres (impayés, TVA, trésorerie, revenu récurrent) |
| G03 | Facturation | `InvoicesScreen` (`/facturation`, 1 879 l.) | `factures`, `paiements`, `entreprise` | `facturation.ts` |
| H07 | Devis | `QuotesScreen` (`/facturation/devis`, 483 l.), `lib/devisBrief.ts` | `devis`, `prestations` | `devis.ts` (dont le devis prérempli de H41 et H42) |
| H08 | Dépenses | `ExpensesScreen` (`/depenses`, 758 l.), `state/expenseEngine.ts` | `depenses` | `depenses.ts` |
| H09 | Prévisions | `TresorerieScreen` (`/tresorerie`), `ScenariosScreen`, `SimulateurPretScreen` ; `lib/cinquante/finance.ts` | `comptes`, `mouvements` (prévus), `factures`, `abonnements`, `echeancesFiscales`, `bulletins` | `tresorerie.ts` |
| MA07 | Trésorerie | `TresorerieScreen` (cône sur 12 semaines) | `comptes`, `mouvements` | `tresorerie.ts`, `banque.soldeTotal` |
| MA04 | Impayés | `RemindersScreen` (`/relances`, 611 l.), `lib/relances.ts` | `factures`, `relances` | `impayes.ts` |
| MA01 | Contrats | `ContractsScreen` (`/contrats`, 791 l.) | `contrats` | — (échéancier dans l'écran existant ; voir §4) |
| MA02 | Comptabilité | `RapprochementScreen` (`/rapprochement`), `lib/fec.ts` (export FEC) | `mouvements`, `factures` | `banque.suggestionsDeRapprochement` ; FEC repris tel quel |
| MA03 | Paiements en ligne | `AcompteScreen` (`/acompte`), `lib/cinquante/guichet.ts` | `paiements` | `devis.acompte`, `connecteurs.etatPaiementsEnLigne` |
| MA05 | Notes de frais | `NotesDeFraisScreen` (`/notes-de-frais`), `FacturesEntrantesScreen` | `depenses` (`noteDeFrais`), `achats` | `depenses.notesARembourser`, `banque.preparerOrdre` |
| MA06 | Budget | `BudgetPanel` (enveloppes de dépenses) ; `PersonalBudgetScreen` (budget personnel, autre sujet) | `enveloppes`, `depenses` | `budget.ts` |
| MA08 | TVA et impôts | `PrevisionFiscaleScreen` (`/prevision-fiscale`) | `echeancesFiscales`, `factures`, `depenses` | `tva.ts` |
| MA09 | Abonnements récurrents | `SubscriptionsScreen` (`/abonnements`, 634 l.) | `abonnements` | `abonnements.ts` |
| MA10 | Banque | aucun écran de comptes ; `RapprochementScreen` | `comptes`, `mouvements` | `banque.ts`, `connecteurs.etatBanque` |
| MA11 | Paie | `BulletinsScreen` (`/bulletins`) | `bulletins` | `paie.ts` |
| MA12 | Tarifs et remises | aucun catalogue ; `CalculatorsScreen` (`/calculateurs`) | `prestations` | `tarifs.ts` |

Textes calculés : `i18n.ts` (60 clés fr/en, `definirMots`). Aides communes : `commun.ts` (jours et mois sans horloge, lundi de la semaine, montants et dates au format français).

## 3. Inventaire de l'existant

Les calculs qui existent déjà, et ce qu'en fait le lot :

| Où | Ce qu'il calcule | Décision |
|---|---|---|
| `src/lib/money.ts` | centimes, arrondi commercial, `documentTotals` (TVA par taux, **arrondie ligne par ligne**) | arrondi repris ; règle de TVA **non** reprise (§5 n° 1) |
| `src/state/useInvoices.ts` | `netDueCents`, `creditedCents`, `isOverdue`, `nextNumber` (`AAAA-NNNN`, `AV-AAAA-NNNN`) | même sens repris dans `facturation.resteDu`, qui ajoute les **règlements partiels** ; les jeux numérotent `F-AAAA-NNNN` (§5 n° 4) |
| `src/lib/relances.ts` | paliers 0 / 7 / 21 / 45 jours, `rangPalier`, `toneAMonte` | **importé tel quel** : un seul barème |
| `src/lib/fec.ts` | export FEC (18 colonnes, débit et crédit équilibrés) | repris tel quel par MA02, rien à refaire |
| `src/lib/cinquante/finance.ts` | `cone` (12 semaines, bande σ√k), `mensualite`, `durees`, `fermeture` (rapprochement), `filigrane` (part fiscale du solde), `bulles` (devises) | MA07 peut garder le cône en complément ; H09 s'appuie sur `tresorerie.projeter` (flux datés et explicables) ; `mensualite` et `durees` restent au simulateur de prêt |
| `src/lib/cinquante/guichet.ts` | `acompteDe`, `sas` (signés sans acompte) | MA03 les garde ; `devis.acompte` refait le même calcul sur un TTC |
| `src/state/expenseEngine.ts` | `budgetVerdict`, `categoryBreakdown` | MA06 passe à `budget.etatEnveloppe` (projection et seuil de 80 %) |
| `src/lib/cinquante/rh.ts` | `tuyau` (cohérence d'un bulletin) | MA11 le garde pour les vrais bulletins ; `paie.ts` ne sert qu'à la paie fictive |
| `SubscriptionsScreen` | revenu récurrent (dans l'écran, non exporté) | refait, exporté et testé dans `abonnements.ts` |
| Écrans existants | âge des devis, tranches de relance, frise des contrats (tous **dans** les écrans) | à sortir dans la logique quand les fiches le demandent [fiche] |

**Rien n'existait** pour :

- les pénalités de retard et l'indemnité de 40 € ;
- les remises ;
- la TVA calculée depuis les factures (`filigrane` reçoit des montants saisis) ;
- la projection de trésorerie à partir des factures, abonnements et échéances ;
- le devis prérempli depuis le catalogue ;
- l'ordre préparé (banque en lecture seule).

## 4. Écran par écran

Légende :

- **Prêt** : ce que la logique couvre ;
- **Manque** : ce qui n'existe ni dans le code ni dans les jeux ;
- **[fiche]** : à relire avec le dossier v4.

### F30 · Vue d'ensemble (nouveau)
- **Prêt** : tous les chiffres d'une vue d'ensemble se calculent :
  - impayés : `totalImpaye`, `tranchesDeRetard` ;
  - TVA du mois en cours : `tvaDuMois` ;
  - trésorerie à 12 semaines : `projeter` ;
  - revenu récurrent : `revenuMensuelRecurrent` ;
  - devis en jeu : `etatDevis`.
- **Manque** : le hub `/ensemble/argent` est l'une des 8 routes du socle v4 (S0). La composition de la vue reste à reprendre [fiche].

### G03 · Facturation (mixte)
- **Existant** : `InvoicesScreen` couvre l'émission, les avoirs, le PDF, le FEC et le graphique sur 12 mois (`douzeMois`).
- **Prêt** (`facturation.ts`) :
  - totaux par taux, avec remise globale ;
  - reste dû (avoirs émis et règlements partiels réussis ; échoués, en attente et remboursés exclus) ;
  - statut calculé : brouillon, envoyée, en retard (au lendemain de l'échéance), payée en partie, payée, annulée ;
  - jours de retard ;
  - échéance par défaut à 30 jours, délai conforme jusqu'à 60 jours ;
  - numéro suivant et trous de numérotation ;
  - liste des **mentions manquantes**, toujours avec `aFaireValider: true`.
- **Manque** : régime de TVA et franchise en base dans l'identité (§7) ; règlements partiels dans les jeux.

### H07 · Devis (mixte)
- **Existant** : `QuotesScreen` (âge des devis, panier moyen) ; `lib/devisBrief.ts` (lignes depuis un brief).
- **Prêt** (`devis.ts`) :
  - état d'un devis (vu, expiré au lendemain de la validité) ;
  - taux de transformation sur les devis tranchés ;
  - **devis prérempli** : recherche d'une prestation active sans accent ni casse, numéro `D-AAAA-NNNN` suivant, validité 30 jours, totaux. C'est la source que H41 (⌘K) et H42 (démarrage) attendent de ce lot (STATUT §1.12 n° 4) ;
  - passage d'un devis accepté en facture brouillon (lignes copiées) ;
  - acompte en %.
- **« Valable juridiquement »** : jamais affirmé par le code. `verifierMentions` dit ce qui manque, et le texte affiché renvoie au comptable (`mentions.complet`).
- **Comparateur de devis** (module de F1, §1.21) : F1 l'intègre. Il faudra prévoir sa place dans H07 [fiche].

### H08 · Dépenses (mixte)
- **Prêt** (`depenses.ts`) : HT et TVA depuis un TTC, totaux du mois par catégorie, justificatifs manquants.
- **Manque** : taux de TVA par dépense dans les jeux (seul `tvaCents` existe ; le taux se déduit).

### H09 · Prévisions (mixte)
- **Prêt** (`tresorerie.ts`) :
  - projection jour par jour sur 12 semaines (réglable) ;
  - deux scénarios : « attendu », et « prudent » sans les encaissements incertains ;
  - point bas, premier jour sous zéro, besoin, clôtures par semaine du lundi au dimanche ;
  - flux venant des factures (une facture échue est attendue à J+14, comme incertaine), des abonnements, des échéances fiscales et des mouvements prévus des jeux.
- **Attend** : les **attendus calculés de SIM pour H09** (STATUT §1.11 n° 3), pas encore livrés. La garde compare aujourd'hui à des cas écrits à la main et à des invariants sur les jeux (solde final = départ + flux de l'horizon ; point bas ≤ chaque jour ; semaine = dernier jour). La comparaison aux attendus s'ajoute dès leur livraison.
- **Paiement en plusieurs fois** (module de F1) : place à prévoir dans H09 ou MA03 [fiche].

### MA07 · Trésorerie (mixte)
- **Existant** : le cône de `finance.ts` (incertitude statistique).
- **Prêt** :
  - `banque.soldeTotal` ;
  - `projeter` ;
  - `fluxDesMouvementsPrevus`, qui lit le prévisionnel des jeux.
- **À trancher** [fiche] : quels comptes forment la trésorerie disponible (courant seul, ou épargne comprise) ? Le code prend ceux que l'écran lui passe.

### MA04 · Impayés (mixte)
- **Prêt** (`impayes.ts`) :
  - tranches 0–30, 31–60, 61–90, plus de 90 jours (bornes dans la tranche basse) ;
  - total ;
  - priorités (palier, puis montant, puis ancienneté) ;
  - délai moyen de paiement ;
  - **pénalités de retard** (taux annuel en paramètre, jamais écrit en dur) et **indemnité forfaitaire de 40 €** ;
  - **relance préparée au vouvoiement**, jamais envoyée (`envoyee: false`), avec le montant et la date au format français.
- **Lien G05** : la barre ⌘J prépare déjà un brouillon de relance (LOT-00). `preparerRelance` peut lui fournir le texte par palier.

### MA01 · Contrats (mixte)
- **Existant** : `ContractsScreen` (échéances, frise, valeur).
- **Prêt** : rien de propre au lot ; les jeux `contrats` ont l'état et l'échéance.
- **Manque** [fiche] : les règles de renouvellement (préavis de résiliation, reconduction tacite) et le lien contrat ↔ factures.

### MA02 · Comptabilité (mixte)
- **Existant** : export FEC (`lib/fec.ts`, `check:fec`) ; rapprochement (`fermeture`).
- **Prêt** : `suggestionsDeRapprochement` (encaissement « à vérifier » et facture payée du même TTC, à 5 jours près). Le module propose, il ne pointe jamais seul.
- **Mention** : « à valider par un comptable » sur toute déclaration.

### MA03 · Paiements en ligne (mixte)
- **Prêt** :
  - `connecteurs.etatPaiementsEnLigne` lit le modèle de S9 : local et « à brancher », ou externe dès qu'un service de paiement est connecté avec le droit de lecture. Aucune clé ne passe par l'écran ; la configuration se fait dans H21 ;
  - `devis.acompte`.
- **Manque** : les frais réels d'un service (les jeux les simulent : 1,4 % + 0,25 € par carte).

### MA05 · Notes de frais (mixte)
- **Prêt** :
  - `notesARembourser` (par personne, hors notes déjà remboursées) ;
  - remboursement **préparé** (`preparerOrdre`), exécuté par la personne dans sa banque.
- **Existant gardé** : lecture des tickets et champs à confirmer (`finance.ts`, `champsLisibles`).

### MA06 · Budget (mixte)
- **Prêt** (`budget.ts`) :
  - consommé, reste, pourcentage ;
  - projection au rythme du mois ;
  - état : « dans les clous », « à surveiller » dès 80 % ou si la projection dépasse le prévu, « dépassé ».
- **Manque** : l'historique des enveloppes (les jeux n'ont que le mois en cours).

### MA08 · TVA et impôts (mixte)
- **Prêt** (`tva.ts`) :
  - TVA d'un mois **en débits ou en encaissements** ; un avoir se déduit en débits ; les encaissements comptent au prorata ;
  - crédit de TVA ;
  - échéance proposée le 20 du mois suivant (réglable) ;
  - échéances à payer d'ici 30 jours, en retard comprises, montants inconnus comptés à part ;
  - **`aValiderParUnComptable: true`** sur chaque résultat.
- **Rejeu** : chaque échéance « TVA de … » des jeux est retrouvée au centime (régime des débits, celui de SIM).
- **Hors du lot** : l'impôt sur les sociétés et la CFE sont des montants saisis ou importés, jamais calculés ici.

### MA09 · Abonnements récurrents (mixte)
- **Prêt** (`abonnements.ts`) :
  - revenu mensuel et annuel récurrent (Actif et Paiement échoué) ;
  - attrition du mois ;
  - prochain prélèvement, strictement après aujourd'hui, ramené au dernier jour d'un mois court ;
  - prélèvements à venir (pour H09).
- **Rejeu** : le prochain prélèvement de chaque abonnement actif des jeux est retrouvé.

### MA10 · Banque (mixte)
- **Prêt** :
  - `soldeTotal` ;
  - `preparerOrdre` (lecture seule, IBAN masqué, montant positif, référence exigée) ;
  - `dateLimiteDeLOrdre` (2 jours avant l'échéance, proposition) ;
  - `etatBanque` : toujours `lectureSeule: true`, « à brancher » dans H21 tant que l'agrégateur n'est pas connecté.
- **Manque** : l'historique des soldes par jour (graphique), aujourd'hui seulement reconstructible depuis `mouvements`.

### MA11 · Paie (mixte)
- **Prêt** (`paie.ts`) :
  - cotisations fictives à **46 % du net** (STATUT §1.11 n° 3) ;
  - coût total ;
  - masse salariale du mois ;
  - **montants masqués par défaut** (`MONTANTS_MASQUES_PAR_DEFAUT`, `montantAffiche`).
- Les salaires sont versés par un ordre préparé, jamais par un virement.

### MA12 · Tarifs et remises (mixte)
- **Prêt** (`tarifs.ts`) :
  - marge (une décimale) ;
  - marge moyenne pondérée par les ventes du mois ;
  - remise en % ou en montant, plancher à zéro, signalée « sous le coût » sans être refusée ;
  - variation d'un prix.
- **Taux horaire de revient** (module de F1) : place à prévoir dans MA12 [fiche].
- **Manque** : les remises dans les jeux (aucune remise sur les devis ni les prestations).

## 5. Écarts et décisions à porter au CO

1. **Arrondi de la TVA.**
   - La fiche H07, d'après les jeux de SIM, calcule la TVA **par taux sur la somme des bases**. C'est ce que fait le lot, et c'est l'usage le plus courant.
   - `src/lib/money.ts` (`documentTotals`, utilisé par `InvoicesScreen` aujourd'hui) arrondit **ligne par ligne**.
   - Sur 3 × 0,33 € à 20 %, la règle par taux donne 0,20 € et la règle par ligne 0,21 €. Le cas T2 de `check:argent` fige l'écart.
   - **Décision** : aligner `money.ts` sur la règle par taux, ou l'inverse. Les factures déjà émises ne changent jamais : la règle ne vaut que pour les nouvelles. Avis d'un comptable recommandé.
2. **Régime de TVA.**
   - Les jeux comptent la TVA à l'émission (régime des débits).
   - Pour des prestations de services, la règle par défaut est la TVA sur les encaissements, sauf option pour les débits.
   - Les deux régimes sont codés. **Décision** : un réglage de l'entreprise, avec quelle valeur par défaut ? À valider par un comptable.
3. **Seuils proposés** (constantes nommées, faciles à changer) :

   | Constante | Valeur proposée |
   |---|---|
   | échéance par défaut | 30 jours |
   | délai jugé conforme | 60 jours |
   | jour limite de la TVA | le 20 |
   | retard supposé d'une facture échue | 14 jours |
   | horizon | 12 semaines |
   | seuil « à surveiller » du budget | 80 % |
   | fenêtre de rapprochement | 5 jours |
   | validité d'un devis | 30 jours |
   | ordre à passer avant l'échéance | 2 jours |

4. **Numérotation.** Formats en concurrence :
   - les jeux : `F-AAAA-NNNN` ;
   - le module existant : `AAAA-NNNN` et `AV-AAAA-NNNN` ;
   - le lot : préfixe en paramètre (`F`, `AV`, `D`).

   **Décision** : un seul format pour la refonte.
5. **Revenu récurrent** : « Paiement échoué » compté, « En pause » non. À confirmer [fiche].
6. **Pénalités** : le taux des conditions générales est un réglage de l'entreprise (aujourd'hui inexistant). Quel réglage, et où (H18 ou l'identité de facturation) ?
7. **Comptes de la trésorerie** : compte courant seul, ou épargne comprise ?
8. **Doublon de format.** `commun.formaterMontant` existe parce que le lot ne peut pas importer `formaterEuro` du socle (`src/socle/ui/graphiques`) en préparation. À remplacer par la brique du socle à la construction ; il ne reste alors que pour les textes envoyés aux clients.

## 6. Dépendances

| Dépendance | Ce qui l'attend | Ce qui est fait en attendant |
|---|---|---|
| **Dossier v4** (fiches, images, `tutoiement.json`) | §4 [fiche], textes exacts, place des modules de F1 | logique sans texte d'écran ; textes calculés au tutoiement, textes clients au vouvoiement |
| **Socle v4 (S0)** | tous les écrans ; hub `/ensemble/argent` | aucun composant visuel |
| **SIM** : attendus de H09 | comparaison de `projeter` | cas à la main et invariants sur les jeux |
| **LOT-12 (S9)** : modèle des connecteurs | MA03, MA10 | `connecteurs.ts` lit le modèle fusionné ; rien n'est configuré ici |
| **LOT-07 (S6)** : H21 (configuration), H18 (réglages) | brancher paiements et banque ; réglages TVA et pénalités | états « à brancher » |
| **F1** : Taux horaire, Paiement en plusieurs fois, Comparateur de devis | MA12, H09 ou MA03, H07 | places notées [fiche], rien de refait |

## 7. Ce qui manque aux données (à demander par le CO à SIM)

- **Règlements partiels** : plusieurs paiements pour une facture (aujourd'hui un seul, du montant total).
- **Avoirs** : aucun dans les jeux (`kind: 'creditNote'`, `creditNoteFor`).
- **Identité fiscale de l'entreprise** : régime de TVA (débits ou encaissements), franchise en base, taux de pénalités des conditions générales. `entreprise.identite` a déjà le SIRET et le numéro de TVA.
- **Taux de TVA par ligne et par dépense** autres que 20 % (5,5 % et 10 %), pour que MA08 détaille plusieurs taux.
- **Remises** : sur quelques devis et prestations (MA12).
- **Historique** : enveloppes de budget des mois passés (MA06), soldes de compte par jour (MA10).
- **Attendus calculés de H09** (déjà commandés, §1.11 n° 3).
- **Lien encaissement prévu ↔ facture échue**, pour classer « incertain » dans le prévisionnel des jeux. `mouvement.lien` porte déjà l'identifiant ; il manque l'indicateur d'échéance dépassée.

## 8. Ce qui manque au socle (à porter au CO)

À vérifier sur la liste des composants v4 à la fusion (la liste du §7 LOT-00 de STATUT est celle de la v3) :

- une brique **montant masqué / révélé**, pour MA11 et partout où un montant sensible s'affiche (G09 le demande aussi) ;
- un **graphique de solde projeté** avec la ligne zéro, le point bas marqué et les jours sous zéro ombrés (H09, MA07). `Courbe` existe ; la marque du point bas et la zone sous zéro sont à confirmer ;
- un **tableau en tranches** pour l'âge des impayés (MA04). `Barres` pourrait suffire [fiche].

## 9. Construction (au feu vert du CO, après la fusion du socle v4)

- **Écrans** : dans `src/refonte/argent/` (`.tsx`), branchés par le mécanisme de substitution. La garde relâchera alors sa règle « aucun `.tsx` » pour les écrans déclarés.
- **Couleurs** : `--fam-a` et `--fam-b` de la famille Argent, posés par la coquille.
- **Textes** :
  - l'interface tutoie, d'après `_data/tutoiement.json` ;
  - ce qui part chez un client (devis, factures, relances) vouvoie, avec des clés `client.`.
- **Méthode** : un commit par écran ; captures à 1440 × 900 sur `build:web` local (127.0.0.1, API d'essai, données fictives), comparées aux images v4 et vérifiées par T1. Images et captures restent hors du dépôt.

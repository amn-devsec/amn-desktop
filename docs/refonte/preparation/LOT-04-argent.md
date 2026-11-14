# LOT-04 · L'argent — note de préparation

> Branche `claude/refonte-argent`. Rédigée le 14 nov. 2026 par DS, en mode PRÉPARATION (socle v4 non fusionné : aucun écran, aucune brique visuelle).
> Prompt : `PROMPTS-12NOV.md` §2 (commit `e79cd7b`). Décisions du CO appliquées : STATUT §1.28 n° 2 (un seul moteur de relances) et §1.29 n° 1 à 8.
> Révisée le même jour avec le **dossier v4** (17 fiches de `lots/LOT-04-argent/`, images, `_data/tutoiement.json`, `06-V4-NEON-ET-TUTOIEMENT.md`), lu hors du dépôt. Le dossier n'est pas committé (dépôt public).
> Rien dans ce document ne décrit une faiblesse de sécurité ; aucune donnée réelle.

## 0. Les points « à vérifier » sont levés

La première version, écrite sans le dossier, marquait **[fiche]** ce qui dépendait des fiches. Chaque point a été relu contre la rubrique 6 (règles de calcul) de sa fiche :

- quand la fiche fixe une règle, **le code la suit**, avec ses propres exemples chiffrés comme cas de `check:argent` ;
- quand la fiche contredit une décision du CO, **la décision du CO s'applique** et l'écart est porté au §5 ;
- quand la fiche ne dit rien (modules de F1), le point reste ouvert au §5.

Ce que la lecture a changé dans le code est au §4, écran par écran (« Changé avec la fiche »).

## 1. En bref

- **Logique pure** : `src/refonte/argent/`, **18 fichiers** (4 de plus : `contrats`, `paiements`, `comptabilite`, `ensemble`). Ni React, ni réseau, ni horloge (« aujourd'hui » est un paramètre). Montants en centimes entiers, un seul arrondi (celui de `src/lib/money.ts`, 0,5 s'éloigne de zéro).
- **Garde** `check:argent` : **69 propriétés**, en CI. Trois parties :
  - des **cas écrits à l'avance**, dont les exemples chiffrés des fiches (H07 : 6 796 € HT, 1 359,20 € de TVA ; MA12 : 62,5 % → 63 % ; MA06 : 5 331 € sur 6 600 € → 81 %, etc.) ;
  - le **rejeu sur les jeux de SIM** (4 volumes et 3 graines) : totaux, soldes, TVA des échéances, cotisations, prélèvements, impayés ;
  - la **structure** : aucun écran, aucun import depuis le code partagé, aucune fonction qui émette un virement, fr et en aux mêmes clés, tutoiement de l'interface, vouvoiement des textes clients.
- **Un défaut trouvé par les cas écrits à l'avance** et corrigé dans le calcul : dans H09, l'hypothèse « retard des encaissements » faisait revenir dans l'horizon un encaissement du jour, déjà compté dans le solde. Les hypothèses ne s'appliquent plus qu'aux mouvements à venir.
- **Banque en lecture seule** : rien n'émet de virement. `banque.preparerOrdre` prépare un ordre (`emis: false`, `aExecuterDansTaBanque: true`), sans IBAN complet.
- **Textes** : 109 clés fr/en. L'interface tutoie, d'après `tutoiement.json` et les libellés des fiches ; ce qui part chez un client (relances, devis) vouvoie.

## 2. Tableau récapitulatif

| ID | Écran | Existant le plus proche (route) | Données (`src/refonte/donnees/`) | Logique (`src/refonte/argent/`) |
|---|---|---|---|---|
| F30 | Vue d'ensemble | aucun ; hub `/ensemble/argent` (socle v4) | tout le lot | `ensemble.ts` (rivière du mois, objectif), plus les autres modules |
| G03 | Facturation | `InvoicesScreen` (`/facturation`) | `factures`, `paiements`, `entreprise` | `facturation.ts` |
| H07 | Devis | `QuotesScreen` (`/facturation/devis`), `lib/devisBrief.ts` | `devis`, `prestations` | `devis.ts` (dont le devis prérempli de H41 et H42) |
| H08 | Dépenses | `ExpensesScreen` (`/depenses`), `state/expenseEngine.ts` | `depenses`, `enveloppes` | `depenses.ts`, `budget.ts`, `tva.tvaRecuperable` |
| H09 | Prévisions | `TresorerieScreen`, `ScenariosScreen` ; `lib/cinquante/finance.ts` | `comptes`, `mouvements`, `factures`, `abonnements`, `echeancesFiscales` | `tresorerie.ts` (trois scénarios) |
| MA07 | Trésorerie | `TresorerieScreen` | `comptes`, `mouvements` | `tresorerie.ts`, `banque.soldeDeDepart` |
| MA04 | Impayés | `RemindersScreen` (`/relances`), `lib/relances.ts` | `factures`, `relances` | `impayes.ts` |
| MA01 | Contrats | `ContractsScreen` (`/contrats`) | `contrats` | `contrats.ts` |
| MA02 | Comptabilité | `RapprochementScreen`, `lib/fec.ts` | `mouvements`, `factures` | `comptabilite.ts` ; FEC repris tel quel |
| MA03 | Paiements en ligne | `AcompteScreen` (`/acompte`), `lib/cinquante/guichet.ts` | `paiements` | `paiements.ts`, `connecteurs.etatPaiementsEnLigne` |
| MA05 | Notes de frais | `NotesDeFraisScreen`, `FacturesEntrantesScreen` | `depenses` (`noteDeFrais`) | `depenses.notesARembourser`, `banque.preparerOrdre` |
| MA06 | Budget | `BudgetPanel` | `enveloppes`, `depenses` | `budget.ts` |
| MA08 | TVA et impôts | `PrevisionFiscaleScreen` (`/prevision-fiscale`) | `echeancesFiscales`, `factures`, `depenses` | `tva.ts` |
| MA09 | Abonnements récurrents | `SubscriptionsScreen` (`/abonnements`) | `abonnements` | `abonnements.ts` |
| MA10 | Banque | `RapprochementScreen` | `comptes`, `mouvements` | `banque.ts`, `connecteurs.etatBanque` |
| MA11 | Paie | `BulletinsScreen` (`/bulletins`) | `bulletins` | `paie.ts` (masquage ; aucun calcul de paie à l'écran) |
| MA12 | Tarifs et remises | `CalculatorsScreen` (`/calculateurs`) | `prestations` | `tarifs.ts` |

Aides communes : `commun.ts` (jours et mois sans horloge, jours ouvrés, montants au format de G03 : espace fine insécable, vrai signe moins, mode compact ou exact).

## 3. Inventaire de l'existant

| Où | Ce qu'il calcule | Décision |
|---|---|---|
| `src/lib/money.ts` | centimes, arrondi commercial, `documentTotals` (TVA arrondie ligne par ligne) | **suivi** (§1.29 n° 1) : `totauxDocument` donne le même résultat, contrôlé facture par facture sur les jeux |
| `src/state/useInvoices.ts` | `netDueCents`, `nextNumber` (`AAAA-NNNN`, `AV-AAAA-NNNN`) | même sens dans `facturation.resteDu` (plus les règlements partiels) ; même numérotation (§1.29 n° 4) |
| `src/lib/relances.ts` | seuils 7 / 21 / 45 jours, paliers de ton | **un seul moteur** (§1.28 n° 2) : `impayes.ts` lit ses seuils (`ECHELLE`), avec la même comparaison stricte que `paliereDe` |
| `src/lib/fec.ts` | export FEC | repris tel quel par MA02 |
| `src/lib/cinquante/finance.ts` | cône sur 12 semaines, simulateur de prêt | le cône reste un complément ; H09 et MA07 s'appuient sur `tresorerie.projeter` (même moteur, exigé par H09) |
| `src/lib/cinquante/guichet.ts` | `acompteDe` | MA03 le garde ; `devis.acompte` fait le même calcul sur un TTC |
| `src/state/expenseEngine.ts` | `budgetVerdict` | MA06 passe à `budget.etatEnveloppe` |
| `src/lib/cinquante/rh.ts` | cohérence d'un bulletin | MA11 le garde |
| Écrans existants | revenu récurrent, frise des contrats, âge des devis (dans les écrans) | sortis dans la logique quand la fiche le demande (`abonnements`, `contrats`, `impayes.colonnesDeRetard`) |

## 4. Écran par écran

Légende : **Prêt** (couvert par la logique et ses cas) ; **Changé avec la fiche** ; **Manque** (ni dans le code, ni dans les jeux).

### F30 · Vue d'ensemble (nouveau)
- **Prêt** (`ensemble.ts`) : rivière du mois (entrées rapprochées par client, sorties par catégorie, 5 groupes nommés et le reste groupé) ; solde au bout = solde au 1er + entrées − sorties, remplacé par le solde réel s'il s'en écarte de plus de 1 € (l'écart est montré) ; objectif d'encaissement plafonné à 100 %, avec le jour du dépassement.
- **Changé avec la fiche** : la composition n'est plus à deviner (rubrique 6 de F30).
- **Manque** : la « série d'encaissement » (voir §5 n° 5).

### G03 · Facturation (mixte)
- **Prêt** (`facturation.ts`) : totaux ligne par ligne ; reste dû ; **six stations** (brouillon, envoyée, vue, en retard, payée, annulée) ; gravité du retard (rouge au-delà de 30 jours) ; compteurs par station ; délai moyen de paiement ; numérotation et trous ; mentions manquantes, toujours `aFaireValider: true` ; mouvement bancaire qui ressemble au paiement avant toute relance (± 0,50 €, 30 jours).
- **Changé avec la fiche** : « payée en partie » n'est pas une station de G03, il disparaît (une facture réglée en partie reste envoyée ou vue, avec son reste dû) ; « Vue » arrive (nombre d'ouvertures).
- **Manque** : nombre de vues et journal des événements dans les jeux.

### H07 · Devis (mixte)
- **Prêt** (`devis.ts`) : états de la fiche (brouillon, envoyé, vu, signé, facturé, refusé, annulé, expiré) ; taux de transformation ; **devis prérempli** pour H41 et H42 ; devis signé → facture brouillon ; acompte plafonné au total ; écart entre deux versions (− 172,80 € sur l'exemple).
- **Changé avec la fiche** : « accepté » devient « signé » ; numéro de devis sans zéros (`D-2026-114`).
- **« Valable juridiquement »** : jamais affirmé ; `verifierMentions` dit ce qui manque.

### H08 · Dépenses (mixte)
- **Prêt** : HT et TVA depuis un TTC ; catégories ; justificatifs à fournir avant le 5 du mois suivant (compte à rebours, jamais en rouge plein) ; part du mois justifiée ; reçu rapproché d'une dépense (± 0,50 €, ± 3 jours, proposé, jamais validé seul) ; TVA récupérable des seules dépenses justifiées ; abonnement inutilisé depuis 30 jours ; barre du budget global neutre sous 85 %, orange jusqu'à 100 %, rouge au-delà.

### H09 · Prévisions (mixte)
- **Prêt** (`tresorerie.ts`) : projection jour par jour sur **90 jours** (30, 90 ou 180) ; **trois scénarios** (prudent, central, ambitieux) tirés d'hypothèses réglables (retard des encaissements, volume des ventes ; chaque hypothèse a une valeur par scénario) ; « ce qui pèse le plus » (écart à l'horizon quand une seule hypothèse bouge) ; passage sous le seuil de confort (creux court, ou reste sous le seuil depuis telle date) ; point bas, besoin.
- **Changé avec la fiche** : 12 semaines → 90 jours ; « attendu / prudent » → trois scénarios ; le central est exactement la prévision de MA07.
- **Attend** : les attendus calculés de SIM pour H09 (§1.11 n° 3). Les cas à la main et les invariants sur les jeux tiennent lieu de contrôle.

### MA07 · Trésorerie (mixte)
- **Prêt** : solde de départ sur les comptes courants, l'épargne ajoutée par un interrupteur et montrée à part (§1.29 n° 7) ; variation de la semaine ; prévision à J+30 arrondie à la centaine ; bande d'incertitude ± 170 € × √n ; couleur du point bas ; autonomie en mois (santé bonne, correcte ou fragile ; réserve de 3 mois) ; achat décalable (ni récurrent, ni fiscal).

### MA04 · Impayés (mixte)
- **Prêt** (`impayes.ts`) : quatre colonnes d'âge (0–30, 31–60, 61–90, plus de 90), toujours affichées, même vides, triées par retard ; échelle de relance (à relancer, relance 1, relance 2, mise en demeure), le client posé sur sa dernière étape faite ; « Appeler » à partir de la relance 2 ou au-delà de 30 jours ; objectif zéro impayé ; plan en deux échéances (le 5 et le 20 du mois suivant) ; délais comparés d'une période à l'autre ; relance préparée au vouvoiement, jamais envoyée.
- **Changé avec la fiche** :
  - MA04 est **informatif** : le calcul des pénalités et l'indemnité de 40 € sont retirés. Le taux reste un réglage de l'identité de facturation, pour la mention des factures (§1.29 n° 6) ;
  - la **mise en demeure** n'a plus de texte par défaut (« aucun modèle par défaut sans validation d'un juriste ») : le modèle validé vient du réglage ; sans lui, rien n'est préparé. Elle exige toujours l'accord d'un administrateur.

### MA01 · Contrats (mixte)
- **Prêt** (`contrats.ts`) : valeur annualisée ; « à renouveler » quand l'échéance tombe dans le préavis (60 jours par défaut), **jamais pour une reconduction tacite** ; compte à rebours (44 jours de préavis écoulés sur 60 → 73 %) ; valeur révisée d'un avenant ; fenêtre de la frise.

### MA02 · Comptabilité (mixte)
- **Prêt** (`comptabilite.ts`) : soldes courants du compte 512 ; résultat indicatif et marge ; variation mensuelle ; les 8 points « Prêt pour le comptable », calculés, jamais cochés à la main. Tout est « indicatif, à valider par un comptable ».

### MA03 · Paiements en ligne (mixte)
- **Prêt** (`paiements.ts`) : taux de réussite du mois ((41 − 1) ÷ 41 → 98 %) ; encaissé et part des frais (1,9 %) ; réussite par moyen ; hauteur des barres en racine ; état « à brancher » d'après le modèle de S9, configuré dans H21.

### MA05 · Notes de frais (mixte)
- **Prêt** : sommes dues par personne ; remboursement **préparé** (`preparerOrdre`), exécuté dans la banque.

### MA06 · Budget (mixte)
- **Prêt** (`budget.ts`) : dépensé, reste, pourcentage (jamais « 100 % » sous le prévu, au moins 101 % au-dessus) ; états de la fiche (dans le budget, presque plein dès 90 %, payé, dépassé) ; bandeau (budget, dépensé, reste, « il te restera environ ») ; avancée du mois ; mois sous le budget ; enveloppe qui peut donner pour un rééquilibrage.
- **Changé avec la fiche** : seuil 80 % → 90 % (réglable) ; projection retirée (la fiche n'en a pas) ; état « payé » pour une enveloppe à paiement unique.

### MA08 · TVA et impôts (mixte)
- **Prêt** (`tva.ts`) : TVA d'un mois en débits ou en encaissements, avec bases HT et part reversée ; crédit de TVA ; prochaine échéance, jours restants et jour de paiement proposé (2 jours ouvrés avant) ; préparation (arrondie vers le bas) ; part mise de côté ; dû de l'année par famille. `aValiderParUnComptable: true` partout.

### MA09 · Abonnements récurrents (mixte)
- **Prêt** : revenu mensuel et annuel (actifs et paiements échoués, §1.29 n° 5) ; abonnés ; résiliations du mois ; taux de prélèvement ; objectif ; prélèvements des 15 prochains jours, groupés par date, « à réessayer » compris.
- **Changé avec la fiche** : l'attrition est retirée (la fiche montre les résiliations du mois).

### MA10 · Banque (mixte)
- **Prêt** : part rapprochée (arrondie vers le bas) ; **pièce proposée** pour un mouvement (exacte avec le numéro, probable avec le nom du client, à vérifier après une relance récente ; au centime ; jamais appliquée seule) ; ordre préparé ; date limite de l'ordre (2 jours ouvrés) ; `etatBanque` toujours `lectureSeule: true`.

### MA11 · Paie (mixte)
- **Prêt** : montants masqués par défaut ; visibles 2 minutes, masqués après 1 minute hors de la fenêtre ; bulletins prêts.
- **Fiche** : « l'application ne calcule aucune cotisation ». Les 46 % fictifs (§1.11 n° 3) ne servent plus qu'au contrôle des jeux de SIM ; aucun écran ne les affichera.

### MA12 · Tarifs et remises (mixte)
- **Prêt** (`tarifs.ts`) : marge en % entier (62,5 → 63) ; couleur au regard de l'objectif de 55 % ; remise au-delà de 5 % → accord requis ; effet d'un prix sur un mois ; suggestion + 10 % à l'euro supérieur ; marge moyenne pondérée ; remises accordées du mois.

## 5. Écarts et décisions à porter au CO

1. **Arrondi de la TVA.** La fiche H07 calcule la TVA **par taux** (« Σ HT à ce taux × taux ») ; la décision provisoire du CO (§1.29 n° 1) est **ligne par ligne**, comme `money.ts`. Le code suit le CO. Sur l'exemple de H07, les deux règles donnent le même résultat (1 359,20 €) ; sur les jeux, aucun écart. L'écart reste à porter à Harun, comme prévu.
2. **Relances : la fiche MA04 et le moteur unique.** Seuils identiques (7, 21, 45). Deux différences :
   - **le jour** : la fiche écrit « J+7 » ; `paliereDe` ouvre le palier au 8e jour. Le code suit le moteur unique (§1.28 n° 2) ;
   - **l'étape** : MA04 avance d'une étape à la fois (une relance 2 suppose la relance 1 envoyée) ; `relances.ts` ne regarde que les jours. Les deux coexistent (l'étape s'ajoute au moteur). Les noms diffèrent aussi (« mise en demeure » est le 3e palier de ton dans `relances.ts`, la 4e étape dans MA04).
   **Décision** : garder « après le seuil » (moteur) ou « le jour du seuil » (fiche) ?
3. **Mise en demeure** : sans modèle par défaut (fiche). **Décision** : où se règle le modèle validé par un juriste (H18 avec l'identité de facturation ?) ; jusque-là, l'étape reste vide.
4. **Modules de F1** (Taux horaire, Paiement en plusieurs fois, Comparateur de devis, §1.21) : **aucune des 17 fiches ne les mentionne**. **Décision** : leur place (MA12, H09 ou MA03, H07 étaient pressentis).
5. **Deux « séries » de même nom.** G03 : un jour compte si aucune facture en retard n'est « non traitée » à 23 h 59. F30 : jours consécutifs avec au moins un encaissement, « même série que G03 ». Les définitions se contredisent. **Décision** : laquelle ; rien n'est codé tant que ce n'est pas tranché.
6. **TVA récupérable** : H08 ne compte que les dépenses justifiées ; MA08 et les jeux comptent toute la TVA déductible. Les deux sont codés (`tvaRecuperable`, `tvaDuMois`). **Décision** : confirmer qu'il s'agit de deux chiffres différents (indicatif dans H08, déclaratif dans MA08).
7. **Période de TVA** : MA08 montre un trimestre (« 1er juil. au 30 sept. »), le code calcule par mois. Un réglage (mensuel ou trimestriel) suffira, en sommant les mois. À confirmer.
8. **Ordre des cartes de MA04** : la règle de la fiche dit « retard décroissant » ; l'image montre la colonne 0–30 en ordre croissant (4, 12, 15 jours). Le code suit la règle. À confirmer.
9. **Seuils à jour** (valeurs de départ, §1.29 n° 3, réglables) :

   | Constante | Avant | Avec la fiche |
   |---|---|---|
   | horizon de trésorerie | 12 semaines | **90 jours** (H09) |
   | « presque plein » du budget | 80 % | **90 %** (MA06) ; barre globale orange dès **85 %** (H08) |
   | fenêtre de rapprochement | 5 jours | remplacée par la règle de MA10 (au centime) et celle de G03 (± 0,50 €, 30 jours) |
   | ordre avant l'échéance | 2 jours | **2 jours ouvrés** (MA08) |
   | préavis d'un contrat | — | **60 jours** (MA01) |
   | objectif de marge, remise sans accord | — | **55 %**, **5 %** (MA12) |
   | échéance, délai conforme, le 20, J+14, validité d'un devis | inchangés | inchangés |

## 6. Dépendances

| Dépendance | Ce qui l'attend | Ce qui est fait en attendant |
|---|---|---|
| **Socle v4 (S0)** | tous les écrans ; hub `/ensemble/argent` ; `src/socle/formats.ts` (§1.29 n° 8) | aucun composant visuel ; `commun.formaterMontant` en attendant |
| **SIM** | attendus de H09 ; alignement des jeux (§7) | cas à la main et invariants |
| **LOT-12 (S9)** | MA03, MA10 | `connecteurs.ts` lit le modèle fusionné |
| **LOT-07 (S6)** : H21, H18 | brancher paiements et banque ; réglages (TVA, pénalités, politique de relance, modèle de mise en demeure, seuils) | états « à brancher » et valeurs de départ |
| **F1** | §5 n° 4 | rien de refait |

## 7. Ce qui manque aux données (à demander par le CO à SIM)

- **Numérotation** : passer de `F-AAAA-NNNN` au format existant `AAAA-NNNN` (§1.29 n° 4). La logique lit encore les deux.
- **Devis** : statuts de H07 (signé, facturé, annulé) et numéros `D-AAAA-N`.
- **Contrats** : des contrats tacites sont « À renouveler » dans les jeux ; d'après MA01, un tacite ne l'est jamais.
- **Factures** : nombre de vues, journal des événements, règlements partiels, avoirs.
- **Relances** : nombre et dates des relances par facture (MA04).
- **TVA** : taux par ligne et par dépense autres que 20 % ; bases HT de la période.
- **Abonnements** : montants en HT (MA09).
- **Historique** : enveloppes des mois passés (MA06), soldes par jour (MA10).
- **Identité de facturation** : régime de TVA, franchise en base, taux de pénalités.
- **Attendus calculés de H09** (déjà commandés).

## 8. Ce qui manque au socle (à vérifier sur la liste v4)

Les fiches nomment leurs surfaces : `AgingBoard` et `DunningLadder` (MA04), `HypothesisRuler` (H09), `DeadlineCountdown`, `VatWaterfall` et `FiscalMatrix` (MA08), `GoalCard` (F30). À confronter à la liste des composants du socle v4 à la fusion, avec :

- une brique **montant masqué / révélé** (MA11, aussi G09) ;
- un **graphique à trois scénarios** avec seuil, zone « sous le seuil » et étiquettes de fin (H09, MA07).

## 9. Construction (au feu vert du CO, après la fusion du socle v4)

- **Écrans** : dans `src/refonte/argent/` (`.tsx`), branchés par la substitution. La garde relâchera alors sa règle « aucun `.tsx` » pour les écrans déclarés.
- **Couleurs** : `--fam-a` et `--fam-b` de la famille Argent, posées par la coquille.
- **Textes** : l'interface tutoie (`tutoiement.json`, libellés des fiches) ; devis, factures et relances vouvoient (clés `client.`).
- **Méthode** : un commit par écran ; captures à 1440 × 900 sur `build:web` local (données fictives), comparées aux images v4 et vérifiées par T1. Images et captures restent hors du dépôt.

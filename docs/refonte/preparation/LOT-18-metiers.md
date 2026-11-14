# LOT-18 · Métiers d'AMN — note de préparation

> Branche `claude/refonte-atelier-f1`. Rédigée le 14 nov. 2026 par F1, en mode PRÉPARATION (étape 1 de la consigne du CO) : **aucun écran, aucun code, rien dans le registre**.
> Modèle : `LOT-06-creer.md`. Rien dans ce document ne décrit une faiblesse de sécurité ; aucune donnée réelle.

## 0. Sources, et ce que je n'ai pas pu lire

- **Lu** : la consigne du CO (cinq blocs, 14 nov.), le dépôt (écrans, collections, `src/lib`, `src/lib/cinquante/juridique.ts`, `src/refonte/donnees/` et son `LISEZ-MOI.md`), `REGLES.md`, `STATUT.md` @ `0ca1469`, la note `LOT-06-creer.md`, et mes propres modules de l'Atelier.
- **Pas lu : `docs/refonte/PLAN-BUREAU-DE-TRAVAIL.md` (§4 et §5) ni `STATUT.md` §1.43.** Ils ne sont ni sur `refonte-vivante` @ `0ca1469` ni sur aucune branche distante (le CO les pousse « dès son prochain push »). Cette note part donc **de la liste du CO**, découpée en huit écrans provisoires `L18-01` à `L18-08`. Les identifiants, noms et dispositions de la fiche priment : à rapprocher dès réception, avant la construction.
- Le sigle « **hatf** » (fiche d'intervention de dépannage) : je ne sais pas ce qu'il désigne (un client, un modèle, un acronyme). Je l'ai gardé tel quel. Question 2, §4.

## 1. En bref

- **Tout marche sans IA.** Les « diagnostics », « brouillons » et « textes » ci-dessous sont des **tables de règles et des modèles de phrases écrits à la main**, relus par un humain, jamais un modèle de langage. Le dépôt fait déjà ainsi (`src/lib/devisBrief.ts` : brief → lignes de devis par rapprochement avec le catalogue réel, sans modèle).
- **Cinq blocs, huit écrans.** Sur les huit, **cinq étendent ou remplacent un écran existant** ; **trois assemblent l'existant dans une vue nouvelle** (calendrier des échéances, rapport mensuel de maintenance, kit de livraison).
- **Deux écrans dépendent d'un texte juridique que seul un juriste peut valider** (L18-04, L18-05). Ils sont construits avec des **textes d'exemple marqués « non validé »** ; la mention « validation par un juriste avant tout usage réel » est affichée sur chaque modèle et sur chaque document produit.
- **Trois sujets décident du reste** (§4) : où vit le code, où sont enregistrées les données (le dépôt a une règle « aucune collection synchronisée nouvelle »), et ce que signifie « hatf ».

## 2. Tableau récapitulatif

| ID provisoire | Écran | Existant dans le dépôt | Nouveauté |
|---|---|---|---|
| L18-01 | Fiche d'intervention de dépannage | `InterventionsScreen` (`/interventions`), `SignatureScreen` (`/signature`), Facturation | **moyenne** : symptôme, matériel et n° de série, bon signé, facture |
| L18-02 | Calendrier des échéances | `agenda`, `ContractsScreen`, `SslScreen`, `entretiens` et `vigilance` (Atelier) | **élevée** : une vue qui rassemble des échéances venues de cinq modules |
| L18-03 | Rapport mensuel de maintenance | `ReportsScreen` (`/reports`), `ClientReportScreen` | **élevée** : le rapport par client et par mois |
| L18-04 | Bibliothèque de contrats | `ContractsScreen` (suivi), `ClausierScreen` (`/clausier`), `templates` | **moyenne** : modèles versionnés par métier, état de validation |
| L18-05 | Générateur légal | `ClausierScreen`, `RgpdScreen` (`/rgpd`), `ComplyScreen` (`/comply`) | **élevée** : questionnaire → cinq documents |
| L18-06 | Suivi du temps relié au taux horaire | `TimeScreen` (`/temps`), `tauxHoraire` (Atelier) | **faible côté écran, forte côté données** : le taux devient un réglage |
| L18-07 | Brief client | `src/lib/devisBrief.ts`, `forms`, `pipeline` | **moyenne** : un brief structuré, avec un état |
| L18-08 | Kit de livraison | `ChecklistsScreen` (`/controles`), `binder` (`/classeur`), `reports`, `SignatureScreen` | **élevée** : un dossier de fin de mission qui assemble l'existant |

## 3. Écran par écran

Légende : **Existant** = ce que le dépôt fait aujourd'hui (vérifié) ; **Neuf** = ce que la liste du CO demande en plus ; **SIM** = ce que je demande aux jeux fictifs ; **Sans IA** = comment ça se passe sans modèle.

### L18-01 · Fiche d'intervention de dépannage
- **Existant** : `InterventionsScreen` (collection `interventions`) : `title`, `clientName`, `address`, `at`, trois volets avant / pendant / après (photo + commentaire), `consommations` (reportées dans Stock et Dépenses), `closedAt`, `reportedAt`. `SignatureScreen` (collection `signatures` : titre, signataire, instant, tracé, **empreinte SHA-256** du tout). Facturation (`invoices`) et la facture « depuis le temps » de `TimeScreen`. SIM a déjà `chantiers[].interventions` (libellé, jour, fait).
- **Neuf** : (1) le **diagnostic par symptôme** : une liste de symptômes par métier → causes probables → vérifications → actions ; (2) le **matériel et son numéro de série**, avec l'historique des interventions par matériel ; (3) le **bon signé** : la fiche figée à la clôture, signée sur l'écran (réutilise l'empreinte existante, pas un second mécanisme) ; (4) la **facture** créée depuis la fiche : main-d'œuvre (temps, L18-06) + consommations.
- **Données absentes du modèle réel** : symptôme, diagnostic, matériel, n° de série, lien fiche ↔ signature ↔ facture. Selon la règle de LOT-06 (Q4), un champ absent s'affiche « non disponible » avec sa raison, et la demande va à amn-api.
- **Sans IA** : le diagnostic est une **table écrite à la main** (symptôme → causes → étapes), jamais devinée.
- **SIM** : `symptomes` (le catalogue), `materielsClients` (marque, modèle, n° de série `FICT-…`), des interventions complètes (volets, consommations, clôture) aux quatre volumes, `bonsSignes` (empreinte fictive). **Aucune photo** : SIM n'en a pas, l'écran montre des vignettes générées.

### L18-02 · Calendrier des échéances
- **Existant** : chaque module a sa date, aucune vue ne les assemble : `ContractsScreen` (`endsAt`, `autoRenew`), `SslScreen` (certificats), `entretiens` (prochaine visite, états « en retard / ce mois-ci / sous 30 jours / à jour »), `vigilance` (pièces qui expirent), `agenda`. SIM : `echeancesFiscales`, `contrats`.
- **Neuf** : un modèle commun `Echeance` (source, objet, client, jour, gravité) et une vue chronologique par client et par mois. **La règle d'état est celle d'`entretiens`** (déjà testée) : on ne la réécrit pas.
- **Sans IA** : tout est calculé depuis des dates. Rien n'est « prévu » par modèle.
- **SIM** : `echeancesMaintenance` (certificats, noms de domaine, licences, contrats, visites) : 12 à 20 par client fictif, avec des cas en retard, ce mois-ci, à plus de 30 jours.

### L18-03 · Rapport mensuel de maintenance
- **Existant** : `ReportsScreen` (rapports livrables, fil de tâches et décisions), `ClientReportScreen` (rapport client enrichi, côté cyber). Aucun ne fait « un mois, un client ».
- **Neuf** : par client et par mois : interventions faites, temps passé et son coût au taux (L18-06), échéances franchies et à venir (L18-02), ce qui est prévu le mois suivant. Sortie **imprimable et copiable**.
- **Voix** : le rapport **part chez le client** : il est au **vouvoiement** (zone client du guide de voix), le reste de l'écran au tutoiement.
- **Sans IA** : des **modèles de phrases** à trous (« 3 interventions ce mois-ci, 5 h 30 au total »), remplis par les chiffres ; aucune phrase inventée.
- **SIM** : un mois complet par client (interventions, temps, échéances) à « maintenant » = vendredi 30 octobre 2026.

### L18-04 · Bibliothèque de contrats
- **Existant** : `ContractsScreen` (suivi : titre, partie, dates, montant, statut, reconduction), `ClausierScreen` (`Clause`, `ContratGenere`, cinq réponses, clauses repliées et non supprimées, `majLe`, client pro ou particulier lu sur la fiche), signature (`SignatureScreen`, `SignatureDistanceScreen`), `templates`.
- **Neuf** : une **bibliothèque de modèles** par métier (maintenance, hébergement, développement, sous-traitance…), **versionnés** (date de mise à jour juridique, déjà prévue par `Clause.majLe`), avec un **état de validation** : « non validé » / « validé par … le … ». Un contrat généré rejoint `ContractsScreen` et le calendrier (L18-02).
- **Mention obligatoire** : « **validation par un juriste avant tout usage réel** », sur chaque modèle et sur chaque document généré. Tant qu'aucun modèle n'est validé, tout ce qui sort est marqué **« EXEMPLE — non validé »** et ne peut pas partir à la signature.
- **SIM** : des clauses d'exemple **clairement fictives** (aucun texte juridique recopié). Les vrais textes viennent d'un juriste, par Harun : question 4.

### L18-05 · Générateur légal
- **Existant** : `ClausierScreen` (génération par réponses), `RgpdScreen` (`gdprRegister` : `Traitement` avec base légale et durée, `DemandeRgpd`, `Purge`, `Revue`), `ComplyScreen` (conformité d'un site : bannière de consentement, politique de confidentialité, mentions légales).
- **Neuf** : un **questionnaire** (éditeur, hébergeur, cookies utilisés, sous-traitants, données collectées) qui produit **cinq documents** : mentions légales, politique de confidentialité, politique de cookies, **registre des traitements** pré-rempli (le registre existe : on l'alimente, on n'en crée pas un second), annexe de **sous-traitance**.
- **Références légales** : je n'en cite que de sûres (LCEN pour les mentions ; RGPD, informations aux personnes, sous-traitance, registre des traitements). Les règles sur les cookies et leurs durées sont **à faire confirmer par le juriste** : rien n'est codé en dur, tout est un paramètre daté avec sa source.
- **Même mention que L18-04**, et même état « non validé » par défaut.
- **SIM** : un `profilLegal` fictif (éditeur, hébergeur, cookies) et des traitements fictifs ; aucun nom d'outil ou d'hébergeur réel.

### L18-06 · Suivi du temps relié au taux horaire
- **Existant** : `TimeScreen` (collection `timeEntries`, hook `useTimeTracking`, totaux par intitulé, drapeau facturable). La facture « depuis le temps » prend `{ heures, rateCents, entryIds }` : **le taux est saisi à la main** à chaque fois. Mon module `tauxHoraire` calcule le minimum, mais seulement en bac à sable.
- **Neuf** : le **taux de revient devient un réglage de l'organisation** ; `TimeScreen` le propose à la facturation et signale « sous ton minimum » ; une **marge réelle** par client et par projet (heures × (tarif − coût)).
- **Contrainte** : `TimeScreen` est un écran **partagé** avec l'édition cliente. Elle ne doit pas bouger : la version refondue passe par une **substitution** (`declarerSubstitutions`, comme LOT-06), jamais par une modification de l'écran d'origine.
- **SIM** : **aucun jeu de temps passé** n'existe (j'ai cherché : pas de `temps`, `timeEntries` ni équivalent). À demander : `tempsPasses` par client et projet.

### L18-07 · Brief client
- **Existant** : `src/lib/devisBrief.ts` (brief → lignes de devis, sans modèle de langage ; une phrase sans correspondance reste « à chiffrer »), `forms` (formulaires publics), `pipeline` (prospects).
- **Neuf** : un **brief structuré** (objectifs, périmètre, contraintes, budget, délai, accès et éléments à fournir), rattaché à un client ou à un prospect, avec un **état** (à compléter / reçu / validé). Une fois validé, il est **figé** (empreinte) et ouvre le pont existant vers le devis.
- **Sans IA** : un questionnaire à champs, par métier. Le rapprochement avec le catalogue est celui de `devisBrief.ts`.
- **SIM** : 4 à 6 briefs fictifs aux trois états.

### L18-08 · Kit de livraison
- **Existant** : `ChecklistsScreen` (`checklists`, `checkRuns`), `binder` (classeur de documents), `reports`, `SignatureScreen` (réception), Facturation (solde).
- **Neuf** : le **dossier de fin de mission** : une checklist de livraison, les documents à remettre (rapport, accès, procédures d'exploitation, garanties), le **procès-verbal de réception signé**, la facture de solde ; un état « complet » ou « il manque … ».
- **Aucun nouveau stockage de fichiers** (règle de LOT-06, Q10) : le kit **référence** les documents du classeur, il n'en stocke pas.
- **SIM** : 3 à 4 kits fictifs, du « vide » au « complet ».

## 4. Questions

1. **Où vit le code ?** F1 a `src/ateliers/**`. Une note de LOT-06 met les écrans dans `src/refonte/<zone>/`. Je propose `src/refonte/metiers/` pour la **logique pure** (testée comme `src/refonte/creer/`, avec un `check:metiers`) ; à confirmer.
2. **« hatf »** : qu'est-ce que c'est exactement ? (Sans la fiche, je ne peux pas dire si c'est un client, un modèle ou un acronyme.)
3. **Où sont enregistrées les données ?** La règle « aucune collection synchronisée nouvelle » (LOT-06 Q4) empêche d'ajouter symptôme, n° de série, brief ou kit. Faut-il une **demande à amn-api** (présentée à Harun par le CO), ou ces écrans restent-ils en lecture sur l'existant avec des champs « non disponibles » ?
4. **Qui fournit et valide les textes juridiques** (L18-04 et L18-05), et dans quel délai ? Sans eux, ces deux écrans restent à l'état « exemple non validé ».
5. **Famille et action** de ces huit écrans (Ma journée ? Écrire ? Outils ? une famille « Métiers » ?) : le registre de S5 décide.
6. **`TimeScreen` par substitution** (L18-06) : d'accord avec le principe ? Et le taux horaire comme réglage de l'organisation : où ?
7. **Rapprochement avec le plan** : dès que `PLAN-BUREAU-DE-TRAVAIL.md` §4 et §5 et le §1.43 sont poussés, je compare cette note à la fiche et je corrige les identifiants et les dispositions.

## 5. Données à demander à SIM

| Jeu | Contenu | Pour |
|---|---|---|
| `symptomes` | catalogue : symptôme → causes → vérifications → actions, par métier | L18-01 |
| `materielsClients` | marque, modèle, n° de série `FICT-…`, client | L18-01 |
| `interventionsDepannage` | interventions complètes (volets, consommations, clôture), quatre volumes | L18-01, L18-03 |
| `bonsSignes` | empreinte fictive, signataire fictif, instant | L18-01, L18-08 |
| `tempsPasses` | durées par client et projet, drapeau facturable | L18-06, L18-03 |
| `echeancesMaintenance` | certificats, domaines, licences, contrats, visites : en retard, ce mois-ci, à venir | L18-02, L18-03 |
| `modelesContrat`, `clausesExemple` | clauses d'exemple **fictives**, avec `majLe` et état de validation | L18-04 |
| `profilLegal` | éditeur, hébergeur, cookies, sous-traitants (tous fictifs) | L18-05 |
| `briefs` | 4 à 6 briefs aux trois états | L18-07 |
| `kitsLivraison` | 3 à 4 kits, du vide au complet | L18-08 |

Conventions de `src/refonte/donnees/LISEZ-MOI.md` : montants en centimes entiers, jours `AAAA-MM-JJ`, « maintenant » = vendredi 30 octobre 2026, identifiants `FICT-…`, rien de réel, **aucune photo**.

## 6. Ordre proposé

1. **L18-01 Fiche d'intervention** : le cœur du métier de dépannage, et le plus appuyé sur l'existant.
2. **L18-06 Temps relié au taux** : alimente la facture de L18-01 et les chiffres de L18-03.
3. **L18-02 Calendrier des échéances** : réutilise la règle d'état d'`entretiens`.
4. **L18-03 Rapport mensuel** : dépend de 1, 2 et 3.
5. **L18-07 Brief client** : indépendant, petit.
6. **L18-08 Kit de livraison** : dépend de 3 et de la signature (L18-01).
7. **L18-04 Bibliothèque de contrats** puis **L18-05 Générateur légal** : en dernier, parce qu'ils attendent les textes validés (question 4). Les moteurs peuvent être construits avant, sur des textes d'exemple.

## 7. Ce qui n'a pas été vérifié

- Le plan et le §1.43 (voir §0) : tout le découpage en huit écrans est provisoire.
- Les noms exacts des fiches, leurs dispositions et leurs images.
- Les références légales : aucune n'est codée ; elles sont à faire confirmer par un juriste.
- Le rendu : rien n'est construit, rien n'est lancé.

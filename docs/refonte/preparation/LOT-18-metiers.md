# LOT-18 · Métiers d'AMN — note de préparation

> Branche `claude/refonte-atelier-f1`. Rédigée le 14 nov. 2026 par F1, **rapprochée du plan le jour même** (`PLAN-BUREAU-DE-TRAVAIL.md` @ `98ae31ef`) et des décisions du CO. Mode PRÉPARATION (étape 1) : **aucun écran, aucun code, rien dans le registre**.
> Modèle : `LOT-06-creer.md`. Rien dans ce document ne décrit une faiblesse de sécurité ; aucune donnée réelle.

## 0. Sources, décisions, règles

- **Lu** : `PLAN-BUREAU-DE-TRAVAIL.md` §0, §4 et §5 ; `STATUT.md` §1.40 à §1.43 ; `REGLES.md` ; le dépôt (écrans, collections, `src/lib`, `src/lib/cinquante/juridique.ts`, `src/refonte/donnees/` et son `LISEZ-MOI.md`, les déclarations du registre) ; `LOT-06-creer.md` ; mes modules de l'Atelier.
- **Ces modules n'ont pas de fiche v4** (plan §0 n° 5) : les écrans suivent les **archétypes du socle** ; Harun valide sur l'**aperçu**, T1 contrôle archétypes, accessibilité, zones de clic et textes.
- **Décisions du CO (14 nov., réversibles)** :
  1. le code vit dans **`src/refonte/metiers/`** ; rien dans `src/screens` ;
  2. « **hatf** » : Harun l'emploie pour l'activité de **dépannage informatique et de diagnostic** d'AMN ; il en donnera la précision, je garde le mot tel quel ;
  3. **données nouvelles** : Harun a dit oui aux nouvelles données partagées (amn-api), **plus tard**, en une fois avec Mohamed (§1.42 n° 1). D'ici là : **réutiliser les collections existantes** (missions et tickets, documents, photos, signatures, factures), **lister chaque champ neuf comme besoin amn-api** (§5), commander les jeux fictifs à SIM et afficher **« non disponible »** là où rien n'existe, **sans rien inventer** ;
  4. **textes juridiques** : des exemples clairement marqués **« exemple non validé ; validation par un juriste avant tout usage réel »** (§1.42 n° 2) ; **le juriste, c'est Harun qui le choisit** ;
  5. **`TimeScreen`** : refondu **par substitution**, sans rien dans `src/screens` ;
  6. **familles** : chaque écran dans sa famille naturelle, pas de famille nouvelle (§4). Déclarations : **des lignes ajoutées seulement** dans chaque `declarations/<famille>.ts` ; le CO résout les conflits.
- **Règles du plan qui valent ici** : tout marche **sans IA** (Ajmani n'est qu'un raccourci) ; **aucune nouvelle dépendance** (donc aucune licence à contrôler ; impression par le navigateur, pas de bibliothèque PDF) ; **ludique collectif** seulement (aucun chiffre par personne, aucun classement, rien qui se perde) ; §1.40 (aperçus : fidélité sur l'aperçu avec les jeux de SIM à l'état rempli, structure dans l'application avec un état vide honnête) ; §1.41 (zones de clic ≥ 36 px) ; §1.42 n° 10 (vocabulaire : « à reprendre » pour une tâche, « en retard » ou « impayé » pour une facture) ; tutoiement dans l'interface, **vouvoiement dans tout ce qui part chez un client** ; toutes les `check:*` ; aucun lien `node_modules` commité.
- **Pas fait** : aucun écran ; aucune référence légale en dur ; rien lancé.

## 1. En bref

- **Huit écrans** (identifiants provisoires `L18-01` à `L18-08`), tirés des lignes de la table du plan §4 : dépannage (hatf), maintenance et suivi, devis/contrats, documents légaux, organisation de l'équipe, brief client, livraison d'un site.
- **Cinq étendent ou remplacent un écran existant** ; **trois assemblent l'existant dans une vue nouvelle** (échéances, rapport mensuel, kit de livraison).
- **Presque tout est calculé depuis des dates, des listes et des modèles de phrases écrits à la main.** Le dépôt fait déjà ainsi (`src/lib/devisBrief.ts` : brief → lignes de devis par rapprochement avec le catalogue réel, sans modèle de langage).
- **Peu de champs neufs sont nécessaires, mais ils manquent presque tous au modèle réel** : ils sont listés au §5 comme besoins amn-api et affichés « non disponible » d'ici là.
- **Deux écrans attendent des textes que Harun fera valider** (L18-04, L18-05) : construits sur des exemples marqués non validés.

## 2. Tableau récapitulatif

| ID | Écran | Ligne du plan §4 | Famille · action proposée | Existant (vérifié) | Nouveauté |
|---|---|---|---|---|---|
| L18-01 | Fiche d'intervention (hatf) | Dépannage informatique | Créer et produire · `fabriquer` | `InterventionsScreen`, `SignatureScreen`, Facturation | moyenne |
| L18-02 | Calendrier des échéances | Maintenance et suivi | La Garde · `superviser` | `sites`, `trackers`, `SslScreen`, `ContractsScreen`, `entretiens` (Atelier) | élevée |
| L18-03 | Rapport mensuel de maintenance | Maintenance et suivi | La Garde · `superviser` | `ReportsScreen`, `ClientReportScreen`, sauvegardes (MO03) | élevée |
| L18-04 | Bibliothèque de contrats | Devis, factures, contrats | Écrire · `signer` | `ContractsScreen`, `ClausierScreen`, signatures | moyenne |
| L18-05 | Générateur légal | Documents légaux | Outils · Conformité (`conformite`) | `RgpdScreen`, `ComplyScreen`, `ClausierScreen` | élevée |
| L18-06 | Suivi du temps relié au taux | Organiser l'équipe | Ma journée · `suivre` | `TimeScreen`, `tauxHoraire` (Atelier) | faible côté écran, forte côté données |
| L18-07 | Brief client | Trouver et signer un client | Contacts · `prospecter` | `devisBrief.ts`, formulaires, `pipeline`, `comparateurDevis` (Atelier) | moyenne |
| L18-08 | Kit de livraison | Créer et livrer un site | Développement · `mettreEnLigne` | `ChecklistsScreen`, `binder`, signatures, déploiements (LOT-11) | élevée |

Les **actions** sont des propositions (celles qui existent déjà dans chaque famille) ; l'action exacte revient à S5, propriétaire du registre. Le **niveau** (essentiel, courant, avancé) est à fixer avec le CO : le rail est plafonné à 16 essentiels.

## 3. Écran par écran

Légende : **Existant** = ce que le dépôt fait aujourd'hui ; **Neuf** = ce que la ligne du plan demande en plus ; **amn-api** = champ ou collection à demander (§5) ; **Sans IA** = comment ça marche sans modèle ; **SIM** = jeu fictif demandé (§6).

### L18-01 · Fiche d'intervention de dépannage (hatf)
- **Plan** : « fiche d'intervention : diagnostic par symptôme (listes de contrôle écrites par nous), matériel et numéro de série, photos avant et après, bon signé sur place, facture en un geste » ; manque aussi le **parc matériel du client** et le **suivi des garanties**.
- **Existant** : `InterventionsScreen` (collection `interventions` : titre, client, adresse, instant, trois volets avant / pendant / après avec photo et commentaire, consommations reportées dans Stock et Dépenses, clôture). `SignatureScreen` (collection `signatures` : titre, signataire, instant, tracé, **empreinte SHA-256**). Facturation (`invoices`) et la facture « depuis le temps » de `TimeScreen`. Missions et tickets (LOT-01) pour le lien.
- **Neuf** : diagnostic par symptôme (symptôme → causes → vérifications → actions) ; matériel du client avec n° de série et **garantie** (date d'achat, durée, fin calculée) ; bon = la fiche **figée à la clôture** et signée (l'empreinte existante, pas un second mécanisme) ; facture créée depuis la fiche (main-d'œuvre via L18-06, consommations).
- **amn-api** : symptôme et diagnostic, matériel (marque, modèle, n° de série, garantie), lien fiche ↔ signature ↔ facture.
- **Sans IA** : les listes de contrôle sont **écrites par AMN** (« écrites par nous »), jamais devinées.
- **Voix** : le bon signé et la facture partent chez le client : vouvoiement.

### L18-02 · Calendrier des échéances
- **Plan** : « un calendrier d'échéances automatique par site » (domaine, HTTPS, mises à jour).
- **Existant** : `sites` et `trackers` (La Garde, SIM `sites`, `trackers`), `SslScreen` (certificats), `ContractsScreen` (`endsAt`, `autoRenew`), `entretiens` (Atelier : visites périodiques, états « en retard / ce mois-ci / sous 30 jours / à jour »), `agenda`.
- **Neuf** : un modèle commun `Echeance` (source, objet, site ou client, jour, gravité) et une vue chronologique par site et par mois. **La règle d'état est celle d'`entretiens`** (déjà testée) ; pour les factures on garde « en retard » ou « impayé » (§1.42 n° 10), pour le reste « à reprendre ».
- **amn-api** : date d'expiration du domaine, des mises à jour prévues (le HTTPS vient déjà du suivi des certificats, à confirmer).
- **Sans IA** : des dates, rien d'autre.

### L18-03 · Rapport mensuel de maintenance
- **Plan** : « un rapport mensuel pré-rempli à relire » ; manque aussi le **contrôle des sauvegardes**.
- **Existant** : `ReportsScreen` (rapports livrables), `ClientReportScreen` (rapport client enrichi), sauvegardes (SIM `sauvegardes`, MO03).
- **Neuf** : par site ou client et par mois : interventions faites, temps passé et son coût (L18-06), échéances franchies et à venir (L18-02), état des sauvegardes, prévu le mois suivant ; **pré-rempli, à relire** avant envoi. Sortie imprimable et copiable.
- **Voix** : le rapport **part chez le client** : vouvoiement.
- **Sans IA** : des **modèles de phrases à trous** remplis par les chiffres (« 3 interventions ce mois-ci, 5 h 30 au total »).
- **amn-api** : état et date de la dernière sauvegarde réussie par site, si le suivi actuel ne les porte pas.

### L18-04 · Bibliothèque de contrats
- **Plan** : « une bibliothèque de contrats pré-remplis depuis la fiche client, signés dans l'application » (création de site, maintenance, audit, CGV). **Validation par un juriste avant tout usage réel.**
- **Existant** : `ContractsScreen` (suivi), `ClausierScreen` (`Clause`, `ContratGenere`, cinq réponses, clauses repliées et non supprimées, `majLe`, client pro ou particulier lu sur la fiche), signatures (`SignatureScreen`, `SignatureDistanceScreen`).
- **Neuf** : modèles par type, **versionnés** (date de mise à jour juridique, déjà prévue par `Clause.majLe`) avec un **état de validation** (« exemple non validé » / « validé par … le … ») ; pré-remplissage depuis la fiche client ; un contrat signé rejoint `ContractsScreen` et le calendrier (L18-02).
- **Marquage** : tout modèle et tout document produit porte « **exemple non validé ; validation par un juriste avant tout usage réel** » tant qu'aucune validation n'est enregistrée ; un exemple non validé **ne peut pas partir à la signature**.
- **amn-api** : état de validation et auteur de la validation d'un modèle.
- **SIM** : clauses d'exemple **clairement fictives** (aucun texte juridique recopié).

### L18-05 · Générateur légal
- **Plan** : « un générateur légal par site client, versionné » : mentions légales, politique de confidentialité, bandeau de cookies, registre des traitements, accord de sous-traitance.
- **Existant** : `RgpdScreen` (`gdprRegister` : `Traitement` avec base légale et durée, `DemandeRgpd`, `Purge`, `Revue`), `ComplyScreen` (conformité d'un site), `ClausierScreen` (génération par réponses).
- **Neuf** : un **questionnaire par site** (éditeur, hébergeur, cookies, sous-traitants, données collectées) → **cinq documents versionnés**. Le registre des traitements existe : on l'alimente, on n'en crée pas un second.
- **Références légales** : aucune n'est codée en dur ; chaque règle est un **paramètre daté avec sa source**, à confirmer par le juriste que Harun choisira.
- **Même marquage que L18-04.**
- **amn-api** : le profil légal d'un site, la version d'un document généré.
- **SIM** : un profil légal fictif (éditeur, hébergeur, cookies, sous-traitants), aucun nom réel.

### L18-06 · Suivi du temps relié au taux horaire
- **Plan** : « un suivi du temps léger (minuteur relié à la tâche) qui **alimente le taux horaire de F1** » ; manque : temps passé par projet, rentabilité par client.
- **Existant** : `TimeScreen` (collection `timeEntries`, minuteur, totaux par intitulé, drapeau facturable, facture « depuis le temps » dont le taux est saisi à la main). `tauxHoraire` (Atelier) calcule le minimum, aujourd'hui en bac à sable avec une **part facturable supposée**.
- **Neuf** : les **heures réellement saisies** remplacent la part facturable supposée du calcul du taux (c'est le sens du plan : le temps alimente le taux) ; en retour, le taux de revient est proposé à la facturation et signale « sous ton minimum » ; **temps et rentabilité par projet et par client**.
- **Écran** : `TimeScreen` est **partagé avec l'édition cliente** : la version refondue passe par une **substitution** (décision n° 5), rien dans `src/screens`.
- **amn-api** : lien d'une entrée de temps à sa tâche ou à son projet (`timeEntries` n'a qu'un intitulé), et le **taux de revient comme réglage de l'organisation**.
- **SIM** : **aucun jeu de temps passé n'existe** (recherché : pas de `temps`, `timeEntries` ni équivalent).

### L18-07 · Brief client
- **Plan** : « un questionnaire de brief partagé au client, qui produit le cahier des charges et le devis » ; manque : brief client, cahier des charges, proposition commerciale.
- **Existant** : `src/lib/devisBrief.ts` (brief → lignes de devis, sans modèle ; une phrase sans correspondance reste « à chiffrer »), formulaires publics (`forms`), `pipeline`, devis (LOT-04), `comparateurDevis` et `tauxHoraire` (Atelier).
- **Neuf** : un **brief structuré** (objectifs, périmètre, contraintes, budget, délai, éléments à fournir), rattaché à un prospect, avec un **état** (à compléter / reçu / validé) ; une fois validé, il est **figé** (empreinte) et produit un **cahier des charges** puis le **devis** par le pont existant.
- **Voix** : le questionnaire **partagé au client** est au vouvoiement.
- **amn-api** : un brief (champs, état, empreinte) et son lien prospect → cahier des charges → devis ; un partage public tel que celui des formulaires, s'il ne couvre pas ce cas.
- **SIM** : 4 à 6 briefs fictifs aux trois états.

### L18-08 · Kit de livraison
- **Plan** : « un kit de livraison en un clic : PV signé, accès transmis, guide d'usage du client » ; manque : recette avec le client, liste de mise en ligne, procès-verbal de livraison, passation (accès, domaine).
- **Existant** : `ChecklistsScreen` (`checklists`, `checkRuns`), `binder` (classeur), signatures, déploiements et modèles (LOT-11), `reports`.
- **Neuf** : le **dossier de fin de mission** : recette, liste de mise en ligne (checklist), **PV de livraison signé**, passation, guide d'usage ; un état « complet » ou « il manque … ».
- **Aucun secret stocké** : « accès transmis » est une **référence** au coffre-fort (`vault`), jamais une valeur. **Aucun nouveau stockage de fichiers** (règle de LOT-06, Q10) : le kit référence des documents du classeur.
- **Ludique** : un palier **collectif** du « carnet d'atelier » à chaque kit livré (plan §4), sans chiffre par personne ; à décrire avec la fiche du carnet, pas ici.
- **Dépendance** : la famille Développement est déclarée par LOT-11 ; l'action `mettreEnLigne` existe déjà.
- **amn-api** : un kit (liste de pièces, état, lien aux documents, au PV, au coffre).

## 4. Familles (décision du CO)

| Écran | Famille · action |
|---|---|
| L18-01 | Créer et produire · `fabriquer` |
| L18-02, L18-03 | La Garde · `superviser` |
| L18-04 | Écrire · `signer` |
| L18-05 | Outils · Conformité (`conformite`) |
| L18-06 | Ma journée · `suivre` |
| L18-07 | Contacts · `prospecter` |
| L18-08 | Développement · `mettreEnLigne` |

Le CO a donné « Écrire, ou Outils > Conformité » pour les contrats et le générateur légal : je propose **Écrire** pour la bibliothèque de contrats (on y signe) et **Outils › Conformité** pour le générateur légal (le registre RGPD y est déjà). À confirmer.

## 5. Besoins amn-api (champs neufs, à demander en une fois avec Mohamed)

| Écran | Champ ou collection | Aujourd'hui |
|---|---|---|
| L18-01 | symptôme, diagnostic ; matériel (marque, modèle, n° de série, garantie) ; lien fiche ↔ signature ↔ facture | absents : « non disponible » |
| L18-02 | échéance de domaine, mises à jour prévues | à confirmer avec le suivi des sites |
| L18-03 | dernière sauvegarde réussie par site | à confirmer avec MO03 |
| L18-04 | état de validation d'un modèle (auteur, date) | absent |
| L18-05 | profil légal d'un site ; version d'un document généré | absent |
| L18-06 | lien temps → tâche ou projet ; taux de revient (réglage d'organisation) | absents (`timeEntries` : intitulé seul) |
| L18-07 | brief (champs, état, empreinte) ; lien prospect → cahier des charges → devis ; partage public | absents |
| L18-08 | kit (pièces, état, liens documents, PV, coffre) | absent |

D'ici là, chaque écran **réutilise les collections existantes** (`interventions`, `signatures`, `invoices`, `timeEntries`, `gdprRegister`, `checklists`, les documents et les photos) et affiche « non disponible », avec sa raison, là où rien n'existe.

## 6. Données à demander à SIM

| Jeu | Contenu | Pour |
|---|---|---|
| `symptomes` | catalogue : symptôme → causes → vérifications → actions | L18-01 |
| `materielsClients` | marque, modèle, n° de série `FICT-…`, achat, garantie | L18-01 |
| `interventionsDepannage` | interventions complètes (volets, consommations, clôture), quatre volumes | L18-01, L18-03 |
| `bonsSignes` | empreinte fictive, signataire fictif, instant | L18-01, L18-08 |
| `tempsPasses` | durées par client, projet et tâche, drapeau facturable | L18-06, L18-03 |
| `echeancesMaintenance` | domaines, certificats, mises à jour, contrats, visites : en retard, ce mois-ci, à venir | L18-02, L18-03 |
| `modelesContrat`, `clausesExemple` | clauses **fictives**, `majLe`, état de validation | L18-04 |
| `profilLegal` | éditeur, hébergeur, cookies, sous-traitants (tous fictifs) | L18-05 |
| `briefs` | 4 à 6 briefs aux trois états | L18-07 |
| `kitsLivraison` | 3 à 4 kits, du vide au complet | L18-08 |

Conventions de `src/refonte/donnees/LISEZ-MOI.md` : montants en centimes entiers, jours `AAAA-MM-JJ`, « maintenant » = vendredi 30 octobre 2026, identifiants `FICT-…`, rien de réel, **aucune photo** (vignettes générées). Réutiliser les jeux existants : `sites`, `trackers`, `sauvegardes`, `signatures`, `contrats`, `chantiers`.

## 7. Ordre proposé

1. **L18-01 Fiche d'intervention** : le cœur du dépannage, le plus appuyé sur l'existant.
2. **L18-06 Temps relié au taux** : alimente la facture de L18-01 et les chiffres de L18-03 ; boucle avec le taux de F1.
3. **L18-02 Calendrier des échéances** : réutilise la règle d'état d'`entretiens`.
4. **L18-03 Rapport mensuel** : dépend de 1, 2 et 3.
5. **L18-07 Brief client** : indépendant, relie le devis et le comparateur existants.
6. **L18-08 Kit de livraison** : dépend de la signature (L18-01) et des déploiements (LOT-11).
7. **L18-04 Bibliothèque de contrats**, puis **L18-05 Générateur légal** : en dernier, parce qu'ils attendent le juriste de Harun. Les moteurs se construisent avant, sur des exemples marqués non validés.

Chaque lot suivra §1.40 : la **commande d'aperçu** de ses écrans dans son rapport (`npm run apercu -- <ID>`), sur les jeux de SIM à l'état rempli, et un état vide honnête dans l'application. La logique pure vit dans `src/refonte/metiers/`, avec un `check:metiers` (cas écrits à la main, puis rejoués sur les jeux), ajouté à `editions.yml` (ajout seulement, signalé).

## 8. Questions restantes (pour Harun, par le CO)

1. **« hatf »** : la précision attendue (le CO la demande à Harun). Sans elle, le découpage de L18-01 reste fondé sur « dépannage informatique et diagnostic ».
2. **Le juriste** : qui le choisit et quand ; sans lui, L18-04 et L18-05 restent à l'état « exemple non validé ».
3. **Le niveau** de chaque écran (essentiel, courant, avancé) : le rail est plafonné à 16 essentiels.
4. **Contrats et générateur légal** : Écrire pour l'un, Outils › Conformité pour l'autre, ou les deux au même endroit.

## 9. Ce qui n'a pas été vérifié

- Que les trois lignes du plan « Maintenance et suivi » et « Dépannage » correspondent aux fiches de LOT-01 et LOT-02 (missions et tickets, rendez-vous, tournées) : je les ai lues dans le plan, pas dans leurs fiches.
- Si le suivi des sites porte déjà le HTTPS, le domaine et les sauvegardes (§5, « à confirmer »).
- Les références légales : aucune n'est codée ; tout reste à faire confirmer par un juriste.
- Le rendu : rien n'est construit, rien n'est lancé.

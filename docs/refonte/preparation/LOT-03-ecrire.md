# LOT-03 · Écrire et retenir — note de préparation

> Branche `claude/refonte-ecrire`, partie de `claude/refonte-vivante` @ `8333822`, puis fusionnée avec `37ca20c`. Rédigée le 14 nov. 2026 par S5, en mode PRÉPARATION (socle v4 non fusionné : aucun écran visuel, aucune brique de `src/socle/ui`).
> Sources : le dossier v4 reçu le 14 nov. (`00-LISEZ-MOI`, `06-V4-NEON-ET-TUTOIEMENT` qui l'emporte sur `01`, `02`, `03`, `04`, les 9 fiches de `lots/LOT-03-ecrire/`, `_data/tutoiement.json`) ; les modules du dépôt (relevé du 14 nov.) ; les jeux fictifs de SIM (`src/refonte/donnees/`). **Les images v4 ne sont pas ouvertes ici** : les valeurs d'exemple viennent des fiches (qui les recopient) ; la fidélité à ± 2 px reste à vérifier à la construction.
> Rien dans ce document ne décrit une faiblesse de sécurité ; aucune donnée réelle.

## 1. En bref

- **Logique pure livrée** : `src/refonte/ecrire/` (14 fichiers, sans React ni brique visuelle) et `scripts/check-ecrire.ts` (`npm run check:ecrire`, **99 contrôles**, ajouté à `package.json` et `editions.yml`). Les cas sont écrits à la main d'après la rubrique 6 de chaque fiche, puis rejoués sur les jeux fictifs aux volumes `vide`, `peu`, `normal`, `beaucoup`.
- **Textes** : `i18n.ts` (≈ 100 clés fr/en, tutoiement, comptes `.1` / `.n`) et `phrases.ts` (phrases composées : « Belle série · prochain palier : 14 jours, dans 2 jours »). Les textes statiques de chaque écran (titres, boutons, vides) seront recopiés de `_data/tutoiement.json` à la construction. Ce qui part chez un client reste au vouvoiement et n'est pas produit ici.
- **Une seule règle pour la série d'écriture** (F20 rubrique 9, « Proposition »), lue par F20, H10 et ME01 : `serie.ts`. Les maquettes montrent 6 jours dans H10 et 12 dans ME01 ; ici, un jour compte dès qu'un mot est enregistré dans une page, le journal ou Rédaction.
- **Ce que le lot ne peut pas faire seul** : 5 sources manquent dans les données réelles (§5) et aucune collection synchronisée ne peut être ajoutée sans l'accord de Harun (§1.27 n° 4). Les écrans s'affichent donc « non disponible », avec la raison, là où la donnée n'existe pas.
- **Cinq questions pour le CO** (§6) et une évolution du registre (§4).

## 2. Tableau récapitulatif

| ID | Écran | Type | Module existant (route) | Famille / vue du registre | Logique livrée (`src/refonte/ecrire/`) |
|---|---|---|---|---|---|
| F20 | Vue d'ensemble | nouveau | aucun ; repli `/ensemble/<famille>` du socle | hors registre (page, pas un module) | `hub.ts`, `relecture.ts`, `serie.ts` |
| H10 | Notes et pages | mixte | `PagesScreen` (`/pages`, collection `pages`) ; `NotesScreen` (`/notes`) est MJ04 (LOT-01) | écrire › `notes` + `pages` | `pages.ts` |
| H11 | Documents | mixte | `ClasseurScreen` (`/classeur`, `documentVersions`), `MediaLibraryScreen` (`/media`) | écrire › `binder` + `media` | `documents.ts` |
| H12 | Signatures | mixte | `SignatureDistanceScreen` (`/signature-a-distance`, `signatureCircuits`) ; `SignatureScreen` (`/signature`, sur place) | écrire › `esign` + `remoteSign` | `signatures.ts` |
| ME03 | Modèles | mixte | `TemplatesScreen` (`/outils/modeles`, `templates` avec `uses`, `lastUsedAt`, `editedAt`) | écrire › `templates` | `modeles.ts` |
| ME01 | Journal | mixte | `DiaryScreen` (`/personnel/journal`, **sur le poste seulement**) ; `LogbookScreen` (`/journal-de-bord`, journal de l'organisation) | écrire › `logbook` + `diary` (Pro, Perso) | `journal.ts` |
| ME02 | Rédaction et traduction | mixte | `RedactionScreen` (`/outils/redaction`, `writingDrafts`), `TraductionScreen` (`/outils/traduction`, `translations`) | écrire › `writing` + `translation` | `redaction.ts` |
| ME04 | Archives | mixte (en fait nouveau) | **aucun module** | à ajouter (§4) | `archives.ts` |
| ME05 | Base de connaissances | mixte | `KnowledgeScreen` (`/knowledge`, `knowledge` : titre, texte, date) | écrire › `knowledge` | `connaissances.ts` |
| — | Dictée vocale (tuile de F20) | nouveau | la commande vocale de la barre Ajmani (maintenir F9) | — | `hub.ts` (la tuile et son « Nouveau ») |

Aides communes : `commun.ts` (heure de Paris avec heure d'été et d'hiver, `instantParis`, jours ouvrés, mois, formats français, mots, écart-type). Une partie fait double emploi avec `src/socle/formats.ts` (socle v4, non fusionné) : **à supprimer au profit du socle** à la fusion (même règle que §1.27 n° 7).

## 3. Écran par écran

Légende : **Existant** = ce que le dépôt fait aujourd'hui ; **Manque** = ce que la fiche demande et que le modèle réel n'a pas ; **Prêt** = ce que la logique couvre déjà.

### F20 · Vue d'ensemble
- **Existant** : rien. Le repli est la page générique `/ensemble/<famille>`.
- **Données** : toutes viennent des autres écrans du lot. Aucune donnée propre.
- **Prêt** : les 9 tuiles et leurs mesures (journal en vert, signatures en orange avec pastille, « Nouveau » tant qu'aucune dictée), les modules inactifs masqués ; la pile des pages récentes (5, filtres Toutes / Les miennes / Partagées, invité limité au partagé) ; « Attend une relecture » (tri : ceux où je relis d'abord, puis l'ancienneté ; segments de la barre d'étapes ; ligne « signature » absente si Signatures est inactif) ; la série, le calendrier du mois, les badges (7 jours, 14 jours, Record) ; le souvenir du journal (privé) ; la suggestion de rangement (≥ 5 notes rapides sans place depuis plus de 3 jours) ; la salutation.
- **Manque** : une demande de relecture n'existe pas comme objet (« à confirmer dans le code ») ; voir §5. Les coauteurs en direct (curseur) dépendent d'une présence temps réel que le dépôt n'a pas (§6 n° 3).
- **Choix** : « signés en 1,8 jour en moyenne » (pied de la file) utilise la fenêtre de 90 jours de F20 §6 ; H12 utilise « ce mois-ci » : une seule fonction, deux fenêtres.

### H10 · Notes et pages
- **Existant** : le moteur de pages en blocs (`PageData` : titre, icône, blocs, rôles d'édition, `scope`, gabarit, site public), les favoris, la corbeille. Les notes rapides (`useNotes`, cartes épinglables) sont l'écran MJ04 de LOT-01, rangé dans la même entrée du registre.
- **Manque** : propriétés de page (client lié, statut, rendez-vous), commentaires ancrés, liens entre pages (donc liens retour), présence en direct, versions, bloc « Décision », échéance d'une tâche de bloc. Voir §5.
- **Prêt** : pages récentes, arborescence (compteurs à tous niveaux, favoris par personne), « 2 sur 3 » par section avec « sans date » en ambre, plan, liens retour (extrait de 60 caractères, 3 visibles), menu « / » filtré sans accent, enregistrement à 1 s avec ses états, avertissement « ressemble à une clé » (jamais bloquant), **note épinglée d'un client** (source demandée par H41 : la plus récemment épinglée, une seule, 80 caractères).
- **Écart de fiche** : H10 §6 annonce 14 entrées dans le menu « / » et n'en liste que 13, dont « Demander à Ajmani » qui n'est pas un bloc. La logique compte 12 blocs + Ajmani à part (« 2 sur 12 » au lieu de « 2 sur 14 »). À confirmer : quel est le 14ᵉ bloc ? (§6 n° 5).

### H11 · Documents
- **Existant** : `ClasseurScreen` rend un document et ses versions (le « palimpseste ») ; la signature y est située sur la frise. `MediaLibraryScreen` indexe les images du chat.
- **Manque** : le téléversement de fichiers, les intercalaires (types), le partage avec lien externe à durée limitée, le quota, l'extraction des faits d'un contrat. §1.27 n° 10 : **aucun stockage nouveau** ; ce qui n'existe pas s'affiche « non disponible », et le stockage d'équipe attend LOT-13.
- **Prêt** : intercalaires (8 visibles, « Plus » au-delà), liste groupée par année avec « N autres », états de ligne (Signé, À signer, Envoyé, À renouveler à 60 jours), prix annuel, date de préavis (31 oct. 2027 − 2 mois = 31 août 2027), rappel à 30 jours avant le préavis, faits « à vérifier » / « vérifié » (jamais une valeur absente de la page), versions (90 jours, sauf l'actuelle et les signées), restauration (crée une version, prévient si l'ancienne était signée), jauge d'espace (neutre / ambre / rouge).
- **Piège de la fiche** : l'icône de « Téléverser » du socle est une flèche vers le bas ; à corriger dans le socle (§7).

### H12 · Signatures
- **Existant** : le circuit (`CircuitSignature` : document, client, signataires dans l'ordre fixé à l'envoi, relances, abandon à 15 jours — `src/lib/cinquante/juridique.ts`) et la signature sur place scellée par une empreinte.
- **Manque** : champs posés sur le document (position, type, obligatoire), rôle « en copie », couleurs de signataire, relances automatiques (aucune n'est planifiée aujourd'hui), lien avec le devis (montant, récapitulatif).
- **Prêt** : états d'une demande, étapes d'un signataire, circuit ordonné (qui « tient le témoin »), « 1 sur 2 signé », champs « 5 posés, 3 à remplir », demandes en attente (même nombre que la barre latérale et F20), délai moyen et « belle régularité » (écart-type sous 1 jour), **relances automatiques** (48 h puis tous les 3 jours, 3 au plus, entre 9 h et 18 h en jours ouvrés, heure de Paris), relance manuelle toutes les 24 h.
- **Choix** : aucune mention de valeur légale ; « Preuve conservée » seulement. L'empreinte n'est jamais affichée, ni lien, ni code.

### ME03 · Modèles
- **Existant** : `TemplatesScreen` (étagère de tranches ; `uses` incrémenté par la copie seule ; `lastUsedAt` ; `editedAt`).
- **Manque** : variables typées avec source, catalogue recommandé par métier (L04, LOT-07), journal d'usage par personne.
- **Prêt** : usages du mois, barre d'usage (÷ le plus utilisé), bibliothèque « n sur 30 », variables (`{nom}`, 8 sources, « remplies toutes seules »), numéro proposé, **case proposée** (≥ 5 messages proches à plus de 70 % de phrases communes en 30 jours, sans modèle existant), tri de la galerie.
- **Choix** : la syntaxe des variables est `{nom}` (Proposition, « à confirmer dans le code »).

### ME01 · Journal
- **Existant** : `DiaryScreen`, entièrement **local au poste** (rien n'est synchronisé), ce qui colle à « Visible par toi seul ». `LogbookScreen` est le journal de l'organisation.
- **Manque** : humeur sur **5** niveaux (le jeu fictif en a 4), énergie, trois mercis, étiquettes, heure de début. Le journal étant local, F20 ne le lit que sur le poste de la personne.
- **Prêt** : jour écrit, mots, intensité (mots / 260), humeur du mois et « le plus souvent » (à égalité, la plus récente), « il y a un mois » (même jour, sinon la page la plus proche avant, 7 jours au plus), bandeau du vendredi (3 pages écrites dans la semaine + un « Bilan » au calendrier ; « Non merci » jusqu'au vendredi suivant), ⌘↵ vers demain, confidentialité (jamais le journal d'un autre).

### ME02 · Rédaction et traduction
- **Existant** : `RedactionScreen` (brouillon rendu avec ses « ratures » : `morceaux`, source visible au-dessus), `TraductionScreen` (interlinéaire, glossaire maison).
- **Manque** : destinataire, objet, ton, longueur, pièces jointes, langue cible ; types de notes de marge ; canal d'envoi (courriel MX01 ou connecteur H21).
- **Prêt** : objectif de mots (120 / 250 / 500), anneau (78 / 120 = 65 %), « lu en 25 secondes », positions des notes de marge (écart 12, fil oblique), date vérifiée (planning + calendrier), déclencheurs de suggestions, enregistrement à 2 s, registre de langue (un texte pour un client reste au vouvoiement), choix du canal d'envoi.

### ME04 · Archives
- **Existant** : **aucun module**. Seules des notions voisines existent (corbeille de H22, conversations closes).
- **Manque** : tout : éléments archivés, règles, restaurations, index du contenu, quota. C'est un module nouveau malgré la mention « mixte » ; il demande une collection (décision de Harun, §6 n° 2).
- **Prêt** : index du temps (densité ≠ correspondances), recherche (titre, puis contenu avec l'option, extrait d'une ligne, du plus récent au plus ancien), groupes par mois (5 puis « Afficher la suite »), compteurs par type, règles (facture payée 12 mois, conversation 6 mois, devis refusé 3 mois), conservation (factures 10 ans, **jamais de suppression définitive** depuis l'écran), espace (2,1 Go / 20 Go = 11 %, proche au-delà de 85 %), restaurés récemment (90 jours, 2 affichés), suggestion de compression (> 1 Go).

### ME05 · Base de connaissances
- **Existant** : `KnowledgeScreen` (document à deux mains : index étroit, document pleine largeur) ; collection `knowledge` : titre, texte, date seulement.
- **Manque** : rubriques, étapes et astuces, statut publié / à relire, journal de lectures, articles liés, parcours d'accueil.
- **Prêt** : « à relire » (plus de 6 mois ou module cité modifié), lectures (plus de 10 s, une par personne et par jour), durée de lecture (mots ÷ 200), « un collègue l'a lu lundi » (7 jours, jamais moi), étape courante et progression, **réponse d'Ajmani sourcée** (deux phrases au plus, tirée d'une étape publiée, source toujours citée, rien d'inventé, sinon `null`), déclencheur du parcours des nouveaux (≥ 5 citations ou questions), questions fréquentes.
- **Choix** : la recherche de la réponse est déterministe et locale (aucun modèle, aucune API) ; l'assistant pourra la reformuler plus tard, sans ajouter d'information.

## 4. Évolution du registre (S5 propriétaire)

Aucun changement n'est posé tant que le socle v4 n'est pas fusionné. Prévu :

| Besoin | Déclaration | Où |
|---|---|---|
| ME04 Archives | vue `archives`, route `/archives`, famille `ecrire`, action `documents`, niveau `courant`, `nouveau: { icone, ecran, indice }` ; verbes « retrouver un document archivé », « restaurer un devis » ; mots-clés `archive`, `ancien`, `conservation` | `declarations/ecrire.ts` |
| Substitutions de LOT-03 | `/pages` (`pages`) → `PagesRefonte` ; `/classeur` (`binder`) → `DocumentsRefonte` ; `/signature-a-distance` (`remoteSign`) → `SignaturesRefonte` ; `/outils/modeles` (`templates`) → `ModelesRefonte` ; `/personnel/journal` (`diary`) → `JournalRefonte` ; `/outils/redaction` (`writing`) → `RedactionRefonte` ; `/knowledge` (`knowledge`) → `BaseDeConnaissancesRefonte` | `src/refonte/substitutions/declarations/ecrire.tsx` (mécanisme de S0, à vérifier à la pose : la clé `module` doit être celle de la garde `ModuleRoute`) |
| F20 | page montée par le mécanisme de S0 sur `/ensemble/ecrire`, sans entrée au registre | substitutions |

Le registre refuse les vues en double (§1.19 n° 1) : Écrire n'en a aucune. Les modules qui sont l'écran d'un autre lot (`reports`, `decisions`, `sharedEditor`, `clauses`) gardent leur place ; F20 les montre comme tuiles de lien s'il le faut.

## 5. Ce qui manque aux données réelles (aucune collection ajoutée sans accord)

Demandes à amn-api (Harun, Mohamed suppléant) ou décisions de Harun ; en attendant, l'écran dit « non disponible » avec la raison :
1. **Liens entre pages** et **échéance d'un bloc tâche** (H10) ; **commentaires ancrés**, **propriétés de page** (client lié, statut), **présence en direct**.
2. **Archives** (ME04) : collection d'éléments archivés, règles, restaurations.
3. **Téléversement et partage de fichiers** (H11), intercalaires, quota ; **faits relevés** d'un contrat.
4. **Champs posés, rôle « en copie », relances automatiques** (H12).
5. **Humeur sur 5 niveaux, énergie, mercis** (ME01) ; **étapes, rubriques, lectures, statut** (ME05) ; **demande de relecture** (F20).

## 6. Questions pour le CO

1. **Série d'écriture** : valider la règle unique (page + journal + rédaction, un mot suffit, jours de repos réglés sans casser). Choisir les jours de repos par défaut (aucun ici).
2. **ME04 est un module nouveau** : feu vert pour une collection `archives` (ou pour tirer l'écran de la corbeille H22 et des fichiers archivés de H11), à présenter à Harun avec `products` et les interlocuteurs (§1.28 n° 3).
3. **Présence en direct** (curseur d'un collègue, « Mohamed écrit avec toi ») : aucune infrastructure aujourd'hui. Sans elle, F20 et H10 n'affichent que « Enregistré » et le curseur est absent ; est-ce acceptable au premier jet ?
4. **Contrat signé qui arrive à échéance** : la ligne montre « À renouveler » (action) ou « Signé » (état) ? La fiche ne tranche pas ; la logique retient « À renouveler ».
5. **Menu « / »** : la fiche annonce 14 entrées et en liste 13. Quel est le 14ᵉ bloc, ou faut-il corriger en « 2 sur 12 » ?
6. **Dictée vocale** (tuile de F20) : le point d'entrée peut ouvrir la barre ⌘J avec la commande vocale existante (maintenir F9), qui vit dans `src/assistant/**` (interdit à cette session). OK ?

## 7. Manque au socle (à dire à S0)

- L'icône de « Téléverser » (H11) doit être une flèche vers le haut.
- `PageStack`, `ReviewQueue` + `StageBar`, `MonthStreak`, `PageThumb`, `TemplatePreview`, `VarChip`, `TimeIndex`, `AskBand`, `KbTree`, `StepRail`, `FloatingToc`, `MarginThread`, `DraftPage`, `JournalPage`, `MonthDots`, `Bench` (établi de H12) : composants **propres au lot**, à construire ici une fois le socle fusionné.
- `ModuleTile` (hauteur 50 dans F20), `ModuleGroupGrid`, `AddModuleTile`, `ShortcutList`, `SuggestionCompact`, `Kbd`, `LiveDot`, `Caret` : du socle, pas du lot.
- Formats chiffrés : importer `src/socle/formats.ts` et retirer `nombre`, `pct`, `tailleLisible` de `commun.ts`.

## 8. Jeux fictifs

Les 8 jeux d'Écrire (`pages`, `fichiers`, `signatures`, `modeles`, `journal`, `textes`, `archives`, `connaissances`) suffisent à rejouer la logique aux quatre volumes. À demander à SIM (liste « Manque aux données » de STATUT) : blocs avec échéance et liens, humeur sur 5 niveaux avec énergie et mercis, étapes et lectures d'un article, rôle « en copie » et champs posés d'une demande, texte indexé d'une archive, présence en direct, demande de relecture. Les noms, montants et dates des images ne sont jamais codés en dur (la garde le vérifie dans la logique).

## 9. Lecture des images v4 (14 nov.)

Les dix images de LOT-03 (F20, H10, H11, H12, ME01 à ME05) ont été ouvertes et comparées à la logique. Presque tout y était déjà. Ajouté, avec ses contrôles :

| Image | Ce qu'elle montre | Ajout |
|---|---|---|
| H10, ME01 | « palier de 14 jours dimanche » | `serie.jourDuPalier` : premier jour où le palier serait atteint en écrivant chaque jour |
| H11 | fait relevé « ajouté en v3 » | `FaitReleve.ajouteEnVersion` |
| H12 | « Preuve conservée » : envoi, ouverture, signature datés | `signatures.pisteDePreuve` (sans copie, sans empreinte) |
| ME02 | trois tons ; version arabe | `redaction.TONS_DE_REDACTION`, `sensDEcriture` (droite à gauche pour ar, he, fa, ur) |
| ME03 | « utilisé par … » | `modeles.utilisateursDuMois` |
| ME04 | années repliées : total, trouvés, courbe | `archives.resumeParAnnee` |

**Écarts entre les images et le texte du dossier, à garder en tête à la construction**
- F20 : « le vôtre d'abord » (en-tête de « Attend une relecture »). L'interface tutoie : « le tien d'abord ».
- ME01 : cinq niveaux d'humeur (Difficile, Moyen, Bien, Très bien, Excellent) et une énergie à cinq barres (« Bonne »). La logique a l'humeur et l'énergie sans fixer le nombre de niveaux : la fiche tranche.
- ME01 : un bandeau relie les jours d'une même série dans le calendrier (19 au 25). La règle de découpe du bandeau (par semaine ? à partir de 7 jours ?) n'est pas dans la fiche : non codée.
- H10 : « BLOCS · 2 SUR 14 » : l'image compte 14 blocs, le CO a retenu 13 (STATUT §1.29 n° 5).
- ME05 : « Voir aussi » avec la durée de lecture de chaque article : `lieA` et `dureeDeLecture` suffisent.

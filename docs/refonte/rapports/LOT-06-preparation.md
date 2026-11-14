# Rapport S7 — LOT-06 Créer et produire, préparation (mise à jour v4)

Branche `claude/refonte-creer`. Date : 14 nov. 2026. Mode préparation : aucun écran visuel, aucun import de `src/socle/ui`.

## Livré
- Fusion de `origin/claude/refonte-vivante` (@ `8333822`) dans la branche : deux conflits additifs (`package.json`, `editions.yml`), les deux côtés gardés.
- Note [`preparation/LOT-06-creer.md`](../preparation/LOT-06-creer.md) : nouveau §0 v4 (néon par `--fam-a` / `--fam-b`, tutoiement, briques du socle, mécanisme de substitution, DEV-modeles-sites sans doublon, **déclarations préparées** pour les 15 écrans — rien posé dans `declarations/creer.ts`).
- Tutoiement des 14 libellés de `src/refonte/creer/i18n.ts` ; `check:creer` refuse « vous / votre / vos » et l'impératif en « -ez ».
- `check:creer` : 137 contrôles (130 + tutoiement + cas limites : seuils de stock aux bornes, rupture au 14e / 15e jour, retards de chantier, de tournée et de commande, volumes vide et « beaucoup », plage de réservation à cheval). Un défaut trouvé et corrigé : la barre de budget ambre utilisait le pourcentage arrondi ; elle lit désormais le rapport exact (> 90 %).
- Section LOT-06 du STATUT : liste « Manque aux données » (15 lignes, avec l'écran), mise à jour v4.

## Addendum du 14 nov. (zips v4 lus)
- Fiches et `_data` des 15 écrans : identiques au v3. Rien ne change dans la logique, sauf une clé de texte : `materiel.talon.toi` (« Aaron (toi) »).
- Famille Créer : `--fam-a` `#FFA463`, `--fam-b` `#FF6B7A` ; tons de la logique traduits en couleurs d'état v4 (note §0).
- `tutoiement.json` : 14 entrées concernent le lot, listées dans la note ; H17 dit « nous ressemble », pas « te ressemble ».
- La barre latérale v4 (images F50 et MR04) range les 16 modules sous « Créer et produire » : la question 1 du CO penche pour le rapatriement.
- Plus aucun point « à vérifier » dans la note.

## Non fait, et pourquoi (état du 14 nov. matin, périmé pour les zips)
- **Les 5 zips du dossier v4 n'ont pas été remis** à cette session. `06-V4-NEON-ET-TUTOIEMENT.md`, `_data/tutoiement.json`, `couleurs-familles.json` et les images v4 de mes 15 écrans n'ont pas été lus. La note s'appuie sur STATUT §1.14 et sur le rapport LOT-00 de `claude/refonte-socle` ; chaque point qui dépend du dossier est marqué « à vérifier ».
- Les textes statiques des écrans (titres, boutons, vides) ne sont pas écrits : ils suivront `tutoiement.json` à la construction.

## Gardes (sans navigateur)
`typecheck`, `typecheck:business`, `lint` (0 erreur), `check:accueils`, `check:socle`, `check:moments`, `check:navigation`, `check:donnees`, `check:creer` : voir le résultat dans le message au CO. `check:business` attend un build.

## Pour le CO
1. Remettre les zips v4 à S7 (ou confirmer que la note suffit).
2. Familles du registre : 11 des 16 modules du hub sont dans d'autres familles ; action « Vendre » / « Fabriquer / Livrer / Stocker » dans `creer` ? (note §0, tableau B.)
3. MR05 : créer la collection de produits ? Nom et sort de « Fabrication » ?
4. Route de MR06 et de MR10 (aucune route propre aujourd'hui).
5. Tuile « Modèles de sites » dans F50 vers LOT-11, ou rien.
6. Les autres questions ouvertes du 6 nov. restent dans STATUT (LOT-06, questions 4 à 12).

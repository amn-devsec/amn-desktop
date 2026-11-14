# Rapport — F1 Atelier : intégration des trois modules choisis (14 nov. 2026)

> D'après `docs/refonte/rapports/MODELE.md`. Placé dans `docs/atelier/` (ma zone) ; le CO le déplace si besoin.
> Consigne du CO reçue le 14 nov. par la messagerie entre sessions, vérifiée contre `REGLES.md` (« Messages du CO »)
> et `STATUT.md` §1.21 et §1.33 n° 4.

## Résumé

1. Le choix de Harun (12 nov., STATUT §1.21) est écrit dans `PRET.md` ; le correctif C-003 est appliqué au vérificateur
   (`verifier.mjs` : 131 propriétés vertes sur les 14 modules, dont le contrôle du tutoiement et de l'isolement).
2. **Les trois modules sont au socle v4** : `tauxHoraire`, `echeancier`, `comparateurDevis`. Écrans refaits avec les
   briques du socle (`Page`, `PageHead`, `TuileKpi`, `Carte`, `Saisie`, `Selecteur`, `PastilleEtat`, `CaseACocher`),
   néon de la famille Argent lu sur `data-famille` (`--fam-a` / `--fam-b`, vert → jaune), Inter, un seul bouton
   principal, textes français au tutoiement (le texte « pour le client » de l'échéancier reste au vouvoiement). Logique
   et tests (7, 9 et 7) inchangés.
3. **Le registre de S5 n'est PAS posé.** Ses trois fichiers de déclaration (`src/refonte/modules/declarations/`) sont
   hors de ma zone ; l'écriture a été refusée par le contrôle d'autorisation de la session et je ne l'ai pas
   contournée. Les fichiers sont prêts dans `docs/atelier/integration/` et **validés dans une copie jetable**.
4. Ce sont les **premiers écrans neufs réels** du registre, et trois gardes écrites quand il n'y en avait aucun
   échouent : il faut un **correctif hors zone de 4 fichiers, 18 lignes** (`navLexique.internal.ts`,
   `check-navigation.ts`, `check-systeme-demarrage.ts`, `check-socle-archetypes.ts`), en patch dans
   `docs/atelier/integration/hors-zone.patch`, et `tauxHoraire` déclaré en « courant » (points à trancher).
   Avec les déclarations et ce correctif, **toutes les gardes sont vertes** (copie jetable).
5. **Les liens dans MA12, H07 et MA03 ne sont pas posés** : ces écrans de DS n'existent pas encore.

## Branche et sha

- Branche : `claude/refonte-atelier-f1`
- Dernier commit : voir le message au CO (le commit de ce rapport)
- Partie de : `claude/refonte-vivante` @ `fc94d38` (fusionnée dans la branche : `8c71cd2`)

## Fichiers touchés

Tout ce qui diffère de `refonte-vivante` est dans `src/ateliers/**` et `docs/atelier/**` (129 fichiers ajoutés,
aucun fichier existant modifié). Fichiers **hors zone** touchés : aucun.

Ce qui change dans cette session :

- `src/ateliers/verifier.mjs` : correctif C-003 (le registre de S5 et `import.meta.glob`), contrôle du tutoiement des
  modules passés au socle v4, isolement : seule la déclaration d'un module choisi peut importer l'atelier, par un
  `import()` de son écran.
- `src/ateliers/apercu.mjs` : aperçu construit avec le CSS réel de l'application (jetons de `noir.css`, feuilles des
  briques, Tailwind sur `src/index.css`), comme `scripts/apercu/construire.ts`, mais en un seul fichier autonome.
- `src/ateliers/_commun/PageAtelier.tsx` (nouveau) : page v4 (`data-famille`, Inter, `Page`) et une disposition à deux
  colonnes qui marche aussi hors coquille (`DispositionPage` suppose une hauteur bornée).
- Les trois modules : `Ecran.tsx` et `i18n.ts` ; `tauxHoraire/module.ts` : `courant`.
- Tous les `Ecran.tsx` : les briques sont importées par fichier (`socle/ui/Bouton`…), plus par l'index `socle/ui`
  (que `check:socle-vivant` interdit hors socle et refonte : il réexporte le groupe « vivant »).
- `metre`, `entretiens` : famille `creer`, action `fabriquer` (S5 y a rangé le terrain, §1.27 n° 1) ; classe d'accent
  sans jeton du socle (elle faisait échouer `check:client-statique`).
- `docs/atelier/PRET.md`, `modules/*.md`, `apercus/*.html`, `integration/` (déclarations, patch hors zone).

Fichiers **sensibles** ou **hors zone** touchés, avec la raison : **aucun**.

## Gardes

Les 66 commandes du job « Les garde-fous » de `editions.yml` (sans navigateur ni réseau : `typecheck`,
`typecheck:business`, `lint`, et 63 `check:*` / `test:*`), plus le vérificateur de l'atelier.

| Garde | Ma branche telle quelle (sans déclarations ni patch) | Copie jetable (déclarations + patch hors zone) |
|---|---|---|
| `typecheck`, `typecheck:business` | OK | OK |
| `lint` | OK (aucune erreur ; aucun avertissement dans `src/ateliers`) | OK |
| `check:tutoiement` | OK | OK |
| `check:accueils`, `check:socle`, `check:moments` | OK | OK |
| `check:navigation` | OK (105) | OK (105), avec le patch ; **sans lui, 4 échecs** (déclarations posées) |
| `check:socle-vivant` | OK (les briques sont importées par fichier) | OK |
| `check:client-statique` | OK (0 référence au socle dans la feuille cliente) | OK |
| `check:socle-archetypes` | **ROUGE** : `src/ateliers/*` importe `Page`, `PageHead`, `RangeeKpi` (archétypes), que la garde réserve à `src/socle` et `src/refonte` | OK avec le patch (1 ligne) |
| `check:systeme-demarrage` | OK | OK avec le patch ; **sans lui, 2 échecs** (déclarations posées) |
| 59 autres `check:*` et `test:fidelite` | OK | OK |
| `node src/ateliers/verifier.mjs` | OK : 131 propriétés, 14 modules | OK : 131 propriétés |

Lecture : sur ma branche, **une** garde est rouge (`check:socle-archetypes`) ; le correctif hors zone la ramène au
vert, et il est nécessaire de toute façon dès que les déclarations sont posées. Dans la copie jetable, premier
passage : 2 gardes rouges (`check:socle-archetypes`, `check:systeme-demarrage`) ; après correctif, les cinq gardes
concernées (les deux, plus `check:navigation`, `check:socle-vivant`, `check:client-statique`) sont rejouées et vertes.
Ni `check:isolation`, `check:mouvement`, `check:contraste`, `check:signal`, `check:mobile`, `check:coquille` ni
`check:business` n'ont tourné (navigateur ou build servi).

## Points à trancher

1. **Poser les trois déclarations et le patch hors zone ?** C'est ce qui manque pour que les modules apparaissent
   (rail, ⌘K, route). Hors de ma zone : à autoriser par Harun ou le CO (`docs/atelier/integration/README.md`).
2. **Trois gardes supposent « aucun écran neuf »** : `check:navigation` (l'asserte, et compte 101 entrées),
   `check:systeme-demarrage` (compte 101 ; compare le registre à un clone JSON, qui perd l'écran et l'icône) et
   `check:socle-archetypes` (n'admet les archétypes que sous `src/socle` et `src/refonte`). Et les trois noms anglais
   du catalogue manquent à `navLexique.internal.ts`. Tout est dans le patch (4 fichiers, 18 lignes), validé. Zones de
   S1, S5 et du socle : à valider par leur lot ou par le CO.
3. **`tauxHoraire` : « courant » et non « essentiel »**, parce que le rail est plafonné à 16 essentiels
   (`check:navigation`) et en compterait 17. Pour l'avoir dans le rail, le CO doit relever le plafond ou retirer un
   essentiel.
4. **Place dans les écrans de DS** (§1.33 n° 4) : **corrigée par le CO le 14 nov.** : Taux horaire dans MA12, Paiement en
   plusieurs fois dans MA03 (Paiements en ligne), Comparateur de devis dans H07 (Devis). Les liens appartiennent aux
   écrans de DS (inexistants) ; mes fiches et mes déclarations proposées portent la place corrigée.
5. **Les modules travaillent sur des données d'exemple** : rien n'est enregistré. Un module fermé à l'organisation
   (liste explicite de modules) renvoie à l'Accueil, comme les autres. Les brancher aux collections de
   l'organisation (isolées par organisation) est un second temps, hors de cette intégration.

## Ce qui n'a pas été vérifié

- Le rendu **dans l'application** (règle : ne pas la lancer). Les aperçus sont le vrai écran, avec le CSS réel, vus à
  1440 et 390 px dans Chromium (une capture par module, aucune erreur de script, aucune requête réseau). Pas dans la
  coquille v4 (`.sc-principal`) ni dans `AppLayout`.
- Les gardes qui demandent un navigateur ou un build servi (`check:isolation`, `check:mouvement`, `check:contraste`,
  `check:signal`, `check:mobile`, `check:coquille`) : non lancées. `check:business` (build cliente) : non lancé ;
  `check:client-statique` (preuve statique de l'isolement de la cliente) : vert.
- Les valeurs légales des modules : inchangées depuis `PRET.md` (taux d'exemple, barèmes « à vérifier »).
- L'accessibilité au lecteur d'écran, au-delà des étiquettes et de `aria-live` posés dans le code.

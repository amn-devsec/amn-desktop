# Rapport de fin de session — DS, LOT-04 L'argent (préparation)

## Résumé (5 lignes au plus)

1. La logique pure de l'argent est dans `src/refonte/argent/` (18 fichiers, sans écran), **relue contre les 17 fiches du dossier v4** : les points [fiche] sont levés, les décisions du CO appliquées (§1.28 n° 2, §1.29 n° 1 à 8).
2. `check:argent` compte **69 propriétés** : cas écrits à l'avance (dont les exemples chiffrés des fiches), rejeu sur 7 mondes fictifs de SIM, structure et deux voix (tutoiement de l'interface, vouvoiement des textes clients).
3. Un défaut trouvé par un cas écrit à l'avance et corrigé dans le calcul : l'hypothèse « retard » de H09 faisait revenir dans l'horizon un encaissement du jour, déjà compté.
4. La note `preparation/LOT-04-argent.md` est réécrite : ce que chaque fiche a changé, 9 écarts à trancher, ce qui manque aux données et au socle. STATUT §7 : section LOT-04 seulement.
5. Le dossier v4 a été lu hors du dépôt ; rien n'en est committé.

## Branche et sha

- Branche : `claude/refonte-argent`
- Commits de cette reprise : `f4ecea3` (décisions du CO, §1.29), puis le commit « LOT-04 : relecture avec le dossier v4 » (sha dans le message au CO)

## Ce que les fiches ont changé

| Fiche | Avant | Après |
|---|---|---|
| G03 | station « payée en partie » | six stations, dont « Vue » ; un paiement partiel reste « envoyée » avec son reste dû |
| H07 | « accepté », `D-AAAA-NNNN` | « signé », « facturé », « annulé » ; `D-AAAA-N` ; écart de version |
| H09, MA07 | 12 semaines ; attendu / prudent | 90 jours ; prudent, central, ambitieux par hypothèses ; ce qui pèse le plus ; seuil de confort |
| MA04 | pénalités et indemnité calculées ; paliers par jours | aucun calcul de pénalités ; échelle par étapes sur les seuils de `relances.ts` ; mise en demeure sans modèle par défaut |
| MA06 | seuil 80 %, projection | presque plein dès 90 %, « payé », bandeau ; plus de projection |
| MA09 | attrition | résiliations du mois, taux de prélèvement, prélèvements des 15 jours |
| MA10 | rapprochement à 5 jours | pièce proposée au centime (exacte, probable, à vérifier), jamais appliquée seule |
| MA12 | marge à une décimale | marge entière (62,5 → 63), objectif 55 %, accord au-delà de 5 % de remise |
| H08, MA01, MA02, MA03, MA08, F30 | — | nouveaux calculs (`contrats`, `comptabilite`, `paiements`, `ensemble`, justificatifs, échéances) |

## Fichiers touchés (cette reprise)

```
M	docs/refonte/preparation/LOT-04-argent.md
M	docs/refonte/rapports/LOT-04-preparation.md
M	docs/refonte/STATUT.md            (section LOT-04 du §7 seulement)
M	scripts/check-argent.ts
M	src/refonte/argent/{abonnements,banque,budget,commun,depenses,devis,facturation,i18n,impayes,paie,tarifs,tresorerie,tva}.ts
A	src/refonte/argent/{contrats,paiements,comptabilite,ensemble}.ts
```

Aucun fichier sensible touché dans cette reprise. Rien sous `src/socle/**`, `src/screens/**` ni `src/assistant/**`. Imports en lecture seulement : `src/lib/money.ts`, `src/lib/relances.ts` (seuils), `src/refonte/connecteurs/`, `src/socle/mots.ts`.

## Gardes

| Garde | Résultat |
|---|---|
| `typecheck` | OK |
| `typecheck:business` | OK |
| `lint` | OK |
| `check:accueils` | OK |
| `check:socle` | OK |
| `check:moments` | OK |
| `check:navigation` | OK |
| `check:money` | OK |
| `check:donnees` | OK |
| `check:argent` | OK, 69 propriétés |

## Ce que le CO doit décider

Détail dans la note, §5 (9 points).

1. **Relances** : la fiche MA04 écrit « J+7 », le moteur unique ouvre le palier au 8e jour. Le code suit le moteur.
2. **Modèle de mise en demeure** : où le régler (validé par un juriste) ; d'ici là, l'étape ne prépare rien.
3. **Modules de F1** : aucune fiche ne les place.
4. **Série d'encaissement** : G03 et F30 la définissent différemment.
5. **TVA récupérable** (H08, justifiées seules) et **TVA déductible** (MA08, toutes) : deux chiffres distincts, à confirmer.
6. **Période de TVA** : mensuelle ou trimestrielle (MA08 montre un trimestre).
7. **Arrondi de la TVA** : la fiche H07 dit « par taux », le code suit le CO (par ligne). Toujours à porter à Harun.
8. **Commande à SIM** (§7 de la note) : numérotation `AAAA-NNNN`, statuts et numéros de devis, contrats tacites jamais « à renouveler », vues et relances par facture.

## Ce qui n'a pas été vérifié

- **Les images v4** : seule MA04 a été comparée à sa fiche (libellés, « aucune pénalité calculée ici »). Son ordre des cartes contredit la règle écrite (note, §5 n° 8). Les autres images n'ont pas été comparées une à une ; aucune mise en page n'est codée.
- **Les attendus calculés de H09** (SIM) : non livrés.
- **Aucun écran, aucun build, aucune capture.**

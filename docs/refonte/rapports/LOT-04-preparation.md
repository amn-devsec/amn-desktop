# Rapport de fin de session — DS, LOT-04 L'argent (préparation)

## Résumé (5 lignes au plus)

1. La logique pure de l'argent est livrée dans `src/refonte/argent/` (14 fichiers, sans écran) : facturation, devis (dont le devis prérempli de H41 et H42), dépenses, impayés, budget, TVA, abonnements, tarifs, trésorerie prévisionnelle H09, banque en lecture seule, paie fictive, état des connecteurs.
2. La garde `check:argent` compte 53 propriétés :
   - chaque calcul d'argent a ses cas écrits à la main **avant** le code ;
   - la logique est rejouée sur 7 mondes fictifs de SIM, où elle retrouve au centime les totaux, les soldes, la TVA des échéances, les cotisations et les prélèvements ;
   - la garde vérifie aussi la structure et les deux voix (tutoiement de l'interface, vouvoiement des textes clients).
3. La note `docs/refonte/preparation/LOT-04-argent.md` couvre l'existant écran par écran, ce qui manque, 8 points à trancher et les listes « Manque aux données » et « Manque au socle ».
4. STATUT §7, section LOT-04 seulement : les 17 écrans passent « en cours (préparation) », avec les deux listes de manques.
5. **Le dossier v4 n'était pas disponible** (ni fiches, ni images, ni `tutoiement.json`) : les points qui en dépendent sont marqués [fiche] dans la note.

## Branche et sha

- Branche : `claude/refonte-argent`
- Dernier commit : voir le message au CO
- Partie de : `claude/refonte-vivante` @ `8333822`

## Fichiers touchés

```
A	docs/refonte/preparation/LOT-04-argent.md
A	docs/refonte/rapports/LOT-04-preparation.md
M	docs/refonte/STATUT.md            (section LOT-04 du §7 seulement)
M	package.json                      (ajout : check:argent)
M	.github/workflows/editions.yml    (ajout : une étape check:argent)
A	scripts/check-argent.ts
A	src/refonte/argent/{commun,facturation,devis,depenses,impayes,tva,abonnements,budget,tarifs,tresorerie,banque,paie,connecteurs,i18n}.ts
```

Fichiers **sensibles** touchés :

| Fichier | Changement | Pourquoi |
|---|---|---|
| `package.json` | 1 ligne ajoutée | garde `check:argent` |
| `.github/workflows/editions.yml` | 2 lignes ajoutées après `check:connecteurs` | garde en CI |

Aucun fichier partagé, aucun `*.business.*`, rien sous `src/socle/**`, `src/screens/**` ni `src/assistant/**`. Imports en lecture seulement depuis :

- `src/lib/money.ts` (arrondi) ;
- `src/lib/relances.ts` (paliers) ;
- `src/refonte/connecteurs/` (modèle de S9) ;
- `src/socle/mots.ts` (`definirMots`, ce n'est pas une brique visuelle).

## Gardes

| Garde | Résultat |
|---|---|
| `typecheck` | OK |
| `typecheck:business` | OK |
| `lint` | OK (0 erreur ; aucun avertissement sur les fichiers du lot) |
| `check:accueils` | OK |
| `check:socle` | OK |
| `check:moments` | OK |
| `check:navigation` | OK |
| `check:money` | OK |
| `check:donnees` | OK |
| `check:argent` (nouveau, en CI) | OK, 53 propriétés |
| `check:connecteurs`, `check:developpement` | OK |

## Points à trancher

Détail dans la note, §5.

1. **Arrondi de la TVA.** La fiche H07 et les jeux calculent par taux ; `src/lib/money.ts` (factures actuelles) calcule ligne par ligne. Il peut y avoir un centime d'écart par facture.
2. **Régime de TVA par défaut.** Les jeux sont en débits ; le défaut légal des services est les encaissements. Les deux régimes sont codés.
3. **Format de numérotation.** `F-AAAA-NNNN` (jeux) ou `AAAA-NNNN` (module existant).
4. **Seuils proposés** :

   | Constante | Valeur proposée |
   |---|---|
   | échéance par défaut | 30 jours |
   | délai jugé conforme | 60 jours |
   | jour limite de la TVA | le 20 |
   | retard supposé d'une facture échue | 14 jours |
   | horizon de trésorerie | 12 semaines |
   | seuil « à surveiller » du budget | 80 % |
   | fenêtre de rapprochement | 5 jours |
   | validité d'un devis | 30 jours |
   | ordre à passer avant l'échéance | 2 jours |

5. **Revenu récurrent.** Faut-il compter « Paiement échoué » ?
6. **Taux de pénalités.** Où le régler ?
7. **Comptes de la trésorerie.** Faut-il compter l'épargne ?
8. **Dossier v4.** Le transmettre à DS pour relire la note contre les 17 fiches.

## Ce qui n'a pas été vérifié

- **Les fiches et les images v4**, absentes de la session : aucune règle propre à une fiche n'a pu être confrontée.
- **Les attendus calculés de H09 que SIM doit fournir** : non livrés. La projection est vérifiée par des cas à la main et des invariants, pas encore contre les attendus.
- **Aucun écran, aucun build, aucune capture** : c'est le mode préparation.

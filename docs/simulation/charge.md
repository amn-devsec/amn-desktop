# LOT-14 · La charge : scénarios

> Écrit par SIM, le 14 nov. Seuils : `STATUT.md` §1.20 (validés par Harun le 12 nov.). Organisations fictives : `src/refonte/donnees/charge.ts`. Exécution : `simulation/charge/executer.mjs`.
> **Ici, on vérifie seulement que les scénarios tournent** contre une API d'essai en mémoire. Les vrais chiffres viendront du serveur maison, quand LOT-13 reprendra. Rien de ce qui suit ne vaut pour le serveur réel.

## 1. Les seuils

| Essai | Ce qu'on simule | Ce qui est attendu |
|---|---|---|
| **Charge** (la cible) | 100 organisations clientes fictives, dont **20 organisations connectées en même temps**, plus **3 personnes** de l'équipe interne au travail | Aucune perte ni aucun écrasement de données, aucune erreur serveur. **95 %** des actions courantes en moins d'**1 s**. Une écriture visible sur les autres postes en moins de **5 s**. |
| **Résistance** | Montée jusqu'à **1 000** organisations, en augmentant les connexions simultanées par paliers | On ne demande pas que ça tienne : on cherche **le premier point de rupture** (quel palier, quelle ressource, et comment ça casse : lenteur, erreurs ou perte). |
| **Essais longs** | **72 h** à la cible, avec redémarrages, coupures réseau et reprise après plantage | Aucune donnée perdue ; une reprise sans intervention. |

Toujours sur des données fictives. Les points faibles qu'un essai révélerait vont à Harun et à Mohamed, par un canal privé : leur détail ne s'écrit pas dans ce dépôt public.

## 2. Qui est dans l'essai

Le générateur `genererOrganisationsDeCharge({ graine, nombre })` rend des organisations fictives, **reproductibles à la graine** et **emboîtées** : les 100 premières d'un essai à 1 000 sont celles de l'essai à 100, donc un palier ne change pas qui était déjà là.

- **De 10 à 600 personnes** par organisation (répartition en logarithme : beaucoup de petites structures, quelques grandes), les deux bornes présentes dès deux organisations.
- Trois tailles : petite (jusqu'à 40 personnes, volume de données « peu »), moyenne (jusqu'à 200, « normal »), grande (au-delà, « beaucoup »).
- Trois profils d'activité : calme, courant, intense.
- Courriels en `….exemple.test` seulement. Aucun secret, aucune adresse réseau.
- `choisirConnectees(organisations, n, graine)` désigne les organisations connectées en même temps, toujours les mêmes pour une graine, et emboîtées (les 20 sont dans les 40).
- Les effectifs pilotent le volume de données et la taille de l'organisation ; ils **n'obligent pas** à créer 600 comptes par organisation pour vérifier qu'un scénario tourne. `--connectes-par-organisation` (2 par défaut) dit combien de personnes travaillent réellement.

## 3. Ce que fait une personne connectée

Elle agit, attend entre 0,4 et 2,5 s, puis recommence. Le mélange d'actions (somme : 100) :

| Action | Poids | Écriture ? |
|---|---|---|
| Lire une liste | 40 | non |
| Ouvrir tout l'espace (chargement groupé) | 10 | non |
| Créer ou modifier un enregistrement | 35 | oui |
| Retirer un enregistrement | 10 | oui |
| Écrire un enregistrement vu par les collègues | 5 | oui |

- **Action courante** : une de ces cinq actions, mesurée de l'envoi de la requête à la fin de la réponse. C'est sur elle que porte le seuil de **95 % en moins d'1 s**.
- **Visibilité** : pour la dernière action, un collègue de la même organisation écoute le flux en direct ; on mesure le temps entre l'envoi de l'écriture et l'arrivée du message chez lui. Une écriture jamais vue au bout de 5 s est comptée comme **manquée**.
- **Perte ou écrasement** : à la fin, chaque écriture que le serveur a acquittée est relue ; elle doit être là, telle qu'acquittée (ou retirée, si elle l'a été). Toute différence fait échouer l'exécution.
- Les trois personnes de l'équipe interne travaillent dans l'espace interne avec le même mélange.

## 4. Scénarios

### Scénario A · La cible

1. Créer les 100 organisations fictives et leurs données de départ.
2. Connecter **20 organisations** (2 personnes chacune) et **3 personnes internes**.
3. Les laisser travailler (60 s par défaut ; plusieurs heures pour une vraie mesure).
4. Relever : part des actions en moins d'1 s, erreurs, visibilité, écritures perdues.

```
node simulation/charge/executer.mjs cible --duree-s 60
```

### Scénario B · La résistance, par paliers

1. Partir de la cible, puis augmenter le nombre d'organisations connectées par paliers : **20, 50, 100, 200, 400, 700, 1 000** (`PALIERS_DE_CHARGE`).
2. À chaque palier, laisser travailler, puis relever la part en moins d'1 s, les erreurs, la visibilité, et les ressources du serveur : processeur, mémoire, retard de la boucle d'événements.
3. Le **premier point de rupture** est le premier palier où la part passe sous 95 %, ou où une erreur apparaît. On note la ressource saturée à ce moment-là et la façon dont ça casse.

```
node simulation/charge/executer.mjs paliers --paliers 20,50,100,200,400,700,1000 --palier-s 600
```

### Scénario C · Les essais longs

1. Partir de la cible, sur une base **dans un fichier** (le script en crée un jetable dans le dossier temporaire, effacé à la fin).
2. Toutes les heures : une **coupure réseau** (tous les flux se ferment ; les postes se reconnectent seuls). Toutes les six heures : un **redémarrage brutal** du serveur, base rouverte depuis son fichier, sur la même adresse.
3. Pendant les coupures, les actions sont comptées « indisponibles », pas « erreurs » : c'est la reprise qu'on juge. Au bout de **72 h**, aucune écriture acquittée ne doit manquer.

```
node simulation/charge/executer.mjs long --duree-s 259200 --coupure-s 3600 --redemarrage-s 21600
```

Le script retient les mesures en mémoire (environ 100 octets l'une) : pour 72 h, mieux vaut jouer douze tranches de 6 h. Sur le serveur maison, cet essai sera repris avec l'outil qu'on y aura choisi.

## 5. Options

| Option | Rôle | Défaut |
|---|---|---|
| `--organisations` | nombre d'organisations créées | 100 (cible), 40 sinon |
| `--connectees` | organisations connectées en même temps | 20 (cible), 6 (long) |
| `--internes` | personnes de l'équipe interne | 3 |
| `--connectes-par-organisation` | personnes qui travaillent par organisation | 2 |
| `--duree-s`, `--palier-s` | durée de la période mesurée | 60, 15 |
| `--paliers` | liste des paliers | `10,20,40` |
| `--coupure-s`, `--redemarrage-s` | rythme des coupures et des redémarrages (essai long) | 30, 45 |
| `--donnees-max` | plafond d'enregistrements de départ par organisation | 40 |
| `--graine` | graine des organisations | celle des jeux |
| `--json` | écrit le rapport dans un fichier (hors du dépôt) | — |

## 6. Garde-fous

- Le serveur d'essai n'écoute que sur **127.0.0.1**, sur un port libre tiré au hasard ; aucune autre cible n'est possible.
- Les comptes sont créés dans une base en mémoire (ou un fichier jetable) : rien n'est écrit ailleurs, tout disparaît à la fin.
- Le jeton d'opérateur du processus est tiré au hasard, jamais écrit. Aucun secret n'est lu ni affiché.
- `npm start` reste interdit. Aucune donnée réelle, aucune connexion à un serveur réel, aucun tiers.
- L'exécution s'arrête avec le code 1 si une écriture acquittée a été perdue ou écrasée. Les seuils de vitesse sont un constat, pas une panne du script.
- Le script a besoin d'amn-api à côté (`AMN_API_ROOT`, voir `scripts/api-root.mjs`). Il crée lui-même les organisations dans la base, parce que l'API n'offre pas d'inscription depuis l'extérieur et freine la connexion (c'est voulu, ce n'est pas ce qu'on mesure).

## 7. Ce qui a été vérifié (14 nov., poste de SIM, amn-api voisine)

Les trois scénarios **tournent**. Chiffres de fumée, courts, serveur et personnes simulées dans le même processus :

| Scénario | Paramètres | Résultat |
|---|---|---|
| Cible | 100 organisations, 20 connectées, 3 internes, 30 s | 849 actions, 0 erreur, 100 % en moins d'1 s (p95 5 ms), 0 écriture perdue sur 328, 50 visibilités observées (p95 4 ms) |
| Paliers | 10, 20, 40 organisations connectées, 10 s chacun | aucun point de rupture sur ces paliers |
| Long | 80 s, une coupure toutes les 20 s, un redémarrage toutes les 30 s | 4 coupures, 2 redémarrages, 0 écriture perdue sur 306 |

Un essai a aussi servi à vérifier le contrôle lui-même : une écriture acquittée retirée à la main de la base est bien détectée, et l'exécution échoue.

## 8. Ce qu'on ne peut pas conclure

- Ces chiffres ne disent rien du serveur maison : machine, réseau et base y seront autres.
- Le palier de 1 000 organisations connectées n'a pas été joué ici (il demande des milliers de connexions simultanées dans un seul processus).
- 72 h n'ont pas été jouées : seulement 80 s avec les mêmes mécanismes (coupures, redémarrages, reprise).
- Le temps de visibilité est mesuré sur le flux en direct d'une seule instance ; une réplication changerait la mesure.

# Rapport de fin de session — S6, LOT-07 (couture du moteur de H20, tarifs de H21)

## Résumé (5 lignes au plus)

1. Couture `@edition/automatisations` posée (STATUT §1.22 n° 4) : le moteur actuel de H20 (`src/state/useAutomations.ts`) ne change pas et tourne dans les deux éditions ; l'édition interne monte en plus un moteur étendu, l'édition cliente un jumeau vide.
2. Le moteur étendu (`src/refonte/outils/`) n'exécute que les règles `'flux'` du format de S9, et seulement s'il peut faire tout le flux sur le poste : sinon la règle reste inerte, avec sa raison. Aucune règle n'est exécutée deux fois.
3. Tarifs de H21 : 7 relevés le 14 nov. sur les pages officielles, en euros, cités mot pour mot. Les autres services restent « à relever », chacun avec sa raison (ci-dessous).
4. Nouvelle garde `check:outils` (18 contrôles, en CI), vérifiée par mutation : un moteur qui ignore le SI, ou un jumeau client qui importe la refonte, la font échouer.
5. Aucun écran : H20 et H21 attendent le socle v4.

## Branche et sha

- Branche : `claude/refonte-outils`
- Dernier commit : `355a7f8` (code et STATUT), puis ce rapport
- Partie de : `claude/refonte-vivante` @ `8333822`

## Fichiers touchés

Sortie de `git diff --name-status origin/claude/refonte-vivante...HEAD` :

```
M	.github/workflows/editions.yml
M	docs/refonte/STATUT.md
M	package.json
M	scripts/check-connecteurs.ts
A	scripts/check-outils.ts
M	src/components/AutomationsRunner.tsx
A	src/edition/automatisations.business.tsx
A	src/edition/automatisations.internal.tsx
M	src/refonte/connecteurs/tarifs.ts
A	src/refonte/outils/MoteurEtendu.tsx
A	src/refonte/outils/planDuMoteur.ts
M	tsconfig.business.json
M	tsconfig.json
M	vite.edition.ts
A	docs/refonte/rapports/S6-outils.md
```

Fichiers **sensibles** ou **hors zone** touchés, avec la raison :

| Fichier | Changement (ajout seulement ?) | Pourquoi |
|---|---|---|
| `vite.edition.ts` | ajout d'une ligne d'alias | la couture `@edition/automatisations` |
| `tsconfig.json`, `tsconfig.business.json` | ajout d'une ligne d'alias chacun | idem, chaque édition vers son jumeau |
| `package.json` | ajout du script `check:outils` | la garde du lot |
| `.github/workflows/editions.yml` | ajout d'une étape après `check:connecteurs` | la garde du lot en CI |
| `src/edition/automatisations.business.tsx` | nouveau, jumeau vide (rend `null`) | permis : jumeau vide d'une nouvelle couture |
| `src/components/AutomationsRunner.tsx` (partagé) | 1 import, 1 commentaire, `return null` → `return <MoteurEtendu libelles={libelles} />` | le point de montage de la couture ; côté client le jumeau rend `null`, donc rien ne change |
| `src/refonte/connecteurs/tarifs.ts` (zone de S9, en pause) | la liste `RELEVES` et son commentaire | le relevé des tarifs est confié à S6 (STATUT §1.26, note LOT-12 §8) |
| `scripts/check-connecteurs.ts` (S9) | un contrôle : les relevés sont jugés à la date réelle de Paris, plus au jour figé des essais (12 nov.) | sinon un vrai relevé daté du 14 passe pour « daté du futur » |

Non touchés : `src/state/useAutomations.ts`, `src/business/**`, `src/components/AppLayout.tsx`, `src/socle/**`, `src/screens/**`.

## La couture, en clair

- `AutomationsRunner` (partagé, monté par `AppLayout` et par `BusinessLayout`) appelle toujours `useAutomations(libelles)`, puis rend `<MoteurEtendu libelles={libelles} />`, importé de `@edition/automatisations`.
- **Cliente** : `automatisations.business.tsx` rend `null` et n'importe rien de la refonte. Le comportement est donc le même qu'avant ; `check:outils` le prouve sur le graphe d'imports, et `check:client-statique` (branche du socle) le confirmera à la fusion.
- **Interne** : `automatisations.internal.tsx` → `src/refonte/outils/MoteurEtendu.tsx` (React, mêmes collections que le moteur actuel) → `planDuMoteur.ts` (pur).
- **Partage du travail** : une règle à l'ancienne (vrai `trigger`) reste au moteur actuel ; une règle `'flux'` (que le moteur actuel ignore, `sourcesPour` → `[]`) est au moteur étendu. Les identifiants viennent de `planDExecution` (S9) : `auto-<règle>-<source>`, puis `-p1`, `-sinon`…
- **En entier ou pas du tout** : le moteur étendu laisse une règle inerte (avec sa raison) si son QUAND n'est pas encore observé par le poste (courriel reçu, rendez-vous, paiement, horaire), si une action n'a pas d'exécutant local (aujourd'hui : seules « créer une tâche » et « écrire au journal » en ont), si une tâche demande une échéance (les tâches n'ont pas ce champ), ou si le SI porte sur un montant ou un expéditeur (absents des sources). Il ne prend jamais SINON sur une donnée manquante.
- Les connecteurs actifs viendront de H21 ; d'ici là, tout tourne en local (`instances: []`).

## Tarifs relevés (14 nov. 2026)

| Option | Formule | Montant relevé | HT | Source |
|---|---|---|---|---|
| messagerie / Mailjet | abonnement | Starter, 8 €/mois, 8 000 courriels/mois | oui (« n'incluent pas la TVA ») | mailjet.com/fr/tarifs |
| messagerie / Gmail | gratuit | « All standard use of the Gmail API is available at no additional cost. » | — | developers.google.com (quotas de l'API Gmail) |
| agenda / Google Agenda | gratuit | même phrase pour l'API Google Calendar | — | developers.google.com (quotas de l'API Calendar) |
| paiement / Stripe | commission | 1,5 % + 0,25 € (cartes standard de l'EEE), sans frais mensuels | non précisé | stripe.com/fr/pricing |
| paiement / Mollie | commission | 1,80 % + 0,25 € (cartes de consommateur de l'EEE) | non précisé | mollie.com/fr/pricing |
| paiement / GoCardless | commission | 1 % + 0,20 €, « Plafonnés à 2 € » (le modèle n'a pas de plafond : le coût affiché est un maximum) | oui | gocardless.com/fr-fr/tarifs |
| SMS / OVHcloud SMS | à l'usage | 0,06 € HT par SMS (pack de 100) | oui | ovhcloud.com/fr/sms |

« Non précisé » : la page ne dit pas HT ; le montant est pris tel qu'affiché (`horsTaxes: false`).

**Restent « à relever », et pourquoi :**

- **Publiés en dollars** : Postmark, Resend, Dropbox, Vercel, Netlify, GitHub, GitLab, Slack, Twilio. Le modèle n'a pas de devise : convertir serait inventer (question au CO ci-dessous).
- **Prix illisibles** sur la page (chargés par script, ou absents du texte) : Brevo, Brevo SMS, Google Drive (Google One), Render, SumUp (le taux du paiement en ligne n'est pas lisible sans ambiguïté).
- **Page en erreur ou introuvable** : Microsoft 365 (erreur du serveur), Yousign (la redirection mène à une page introuvable).
- **Prix mensuel non affiché** : Docusign ne montre que l'équivalent mensuel d'un abonnement annuel (9 €/mois, « 108 € – facturé annuellement »).
- **Sans fournisseur choisi** (options génériques du catalogue) : stockage S3 (UE), agrégateur bancaire DSP2, service de notification mobile, WhatsApp Business Platform, ligne SIP, API d'un modèle en ligne, logiciel comptable en ligne.

À revérifier d'un coup d'œil : Mailjet (la page a un sélecteur mensuel/annuel ; le prix relevé est celui affiché par défaut, et le lien de l'offre indique le mensuel, sans que la page l'écrive en toutes lettres) et OVHcloud (la page ne dit pas la destination du SMS).

## Gardes

| Garde | Résultat |
|---|---|
| `typecheck` | vert |
| `typecheck:business` | vert |
| `lint` | vert |
| `check:accueils` | vert |
| `check:socle` | vert |
| `check:moments` | vert |
| `check:navigation` | vert |
| `check:donnees` | vert |
| `check:connecteurs` | vert |
| `check:outils` | vert |
| les 47 autres contrôles sans réseau de `editions.yml` | verts (relancés le 14 nov. sur cette branche) |

Total : 57 gardes vertes, aucune rouge.

`check:outils` a été éprouvé par mutation : un moteur qui ignore le SI ou qui prend les règles à l'ancienne, et un jumeau client qui importe la refonte, le font échouer.

## Points à trancher

- **CO** : ajouter une devise au modèle des tarifs (LOT-12) pour les 9 services publiés en dollars, ou les laisser « à relever » ?
- **CO** : un plafond par transaction dans le modèle (GoCardless « plafonnés à 2 € ») ; sans lui, le coût affiché est un maximum.
- **CO / SIM** : un champ d'échéance pour les tâches, et le montant et l'expéditeur dans les sources de H20, pour que ces flux puissent s'exécuter.
- **Harun** : pour les 7 options génériques, quel fournisseur relever (un nom suffit).

## Ce qui n'a pas été vérifié

- Aucun écran (pas de socle v4) : ni capture, ni rendu, ni `build:web`.
- `check:client-statique` n'existe pas encore sur `refonte-vivante` (il arrive avec le socle) : la preuve d'isolement de la couture est faite par `check:outils`, sur le graphe d'imports du jumeau.
- Les gardes qui demandent amn-api ou un build (`check:roles`, `check:journal`, `check:supervision`, `check:sync`, `check:naming`, `check:business`) n'ont pas tourné ici.
- Les pages de tarifs ont été lues par un outil de lecture, sans navigateur : les prix chargés par script n'ont pas pu être lus.

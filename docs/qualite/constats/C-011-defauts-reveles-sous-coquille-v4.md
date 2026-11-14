# C-011 — Défauts réels que les gardes révèlent depuis qu'elles voient les 160 écrans (coquille v4), par propriétaire

- Gravité : **Mineur à Majeur** (tactile et petit écran ; aucun n'est propre à la coquille v4)
- Branche : vivante `c377b63` + correctif C-008, coquille v4 allumée, amorce **160**
- Demandé par : CO (14 nov.). Preuve : `check:cibles` et `check:largeur`, sorties dans le bac à sable de T1
- État : ouvert, à répartir par le CO

La plupart de ces écrans sont des **écrans d'origine** (`src/screens/*`, partagés avec l'édition cliente), pas encore refondus ; le « lot »
est celui de leur famille au registre (jour = LOT-01, contacts = LOT-02, écrire = LOT-03, argent = LOT-04, échanger = LOT-05,
créer = LOT-06, outils = LOT-07, garde = LOT-08, cyber = LOT-10). Ces défauts ne viennent pas de la coquille v4 : tant que les gardes
ne voyaient que 15 écrans, personne ne les voyait.

## 1. Les 11 familles de cibles trop serrées (`check:cibles`, 390 px)

| # | Cible (taille, écart au voisin) | Fichier | Propriétaire |
|---|---|---|---|
| 1 | Jours du calendrier « 26… » : 42 px, 4 px d'écart (108×) | écran Agenda (`/agenda`, composant `AgendaScreen`) | LOT-01 (jour) |
| 2 | Créneaux « 15:00 » : 7 px et 41 px, 0 px d'écart | idem | LOT-01 (jour) |
| 3 | Bouton « Nouvelle conversation » : 32 px, 4 px (80×, sur La Garde et Supervisor) | `src/assistant/AssistantPanel.tsx` (`flex h-8 w-8`) | panneau Ajmani, aucun lot : CO |
| 4 | Barres des mois « jan… » : 17 px, 6 px (40×) | `src/screens/ExpensesScreen.tsx` (`/depenses`) | LOT-04 (argent) |
| 5 | Ligne « Hugo Marchand 45 j » : 32 px, 4 px | `src/screens/RemindersScreen.tsx` (`/relances`) | LOT-04 (argent) |
| 6 | Pastilles « Confirmation de commande 92 » : 11 px, 6 px | `src/screens/TemplatesScreen.tsx` (`/outils/modeles`) | LOT-03 (écrire) |
| 7 | Choix « Texte — Remise maximale… » : 34 px, 6 px | `src/screens/PagesScreen.tsx` (`/pages`) | LOT-03 (écrire) |
| 8 | « Avancer cet arrêt » : 24 px (`h-6 w-8`) | `src/screens/DeliveryRoundsScreen.tsx` (`/tournees`) | LOT-06 (créer) |
| 9 | « + Marketing 0/10 » : 32 px, 6 px | `src/components/generator/ChoixModules.tsx` (`/tour/generateur`) | LOT-08 (garde) |
| 10 | Lignes de la liste de notifications « 08:51 · Facture… » : 18 px, icône SVG | `src/refonte/systeme/notifications/` (H40, `/notifications`) | socle / S0 (LOT-00) |
| 11 | (famille « agenda » côté créneaux, voir 2) | — | — |

La famille 11 listée par la garde est le groupe des créneaux de l'Agenda dont la hauteur diffère (41 px) : même écran que 1 et 2.

## 2. Les écrans qui débordent à 390 px (`check:largeur`)

**4 écrans au texte écrasé** (le texte tient dans 17 à 160 px) :

| Écran | Élément | Fichier | Propriétaire |
|---|---|---|---|
| `#/tour/organisations` | `<span class="mt-[3px] block text-[12px]…">` (138 px) | `src/screens/OrganizationsScreen.tsx` | LOT-08 (garde) |
| `#/journal-de-bord` | `<span class="min-w-0 truncate text-[13.5px]…">` (60 px) | `src/screens/LogbookScreen.tsx` | LOT-03 (écrire) |
| `#/decisions` | `<p class="min-w-0 border-l pl-4…">` (17 px, 465 px de haut) | `src/screens/DecisionsScreen.tsx` | LOT-03 (écrire) |
| `#/cyber/hameconnage` | `<p class="mt-3.5 max-w-[74ch]…">` (159 px) | `src/bureaux/cyber/Hameconnage.tsx` | LOT-10 (cyber) |

**18 écrans coupés** (contenu plus large que l'écran) :

| Écran(s) | Largeur | Élément | Fichier | Propriétaire |
|---|---|---|---|---|
| `#/tous-les-modules` + 8 familles, `#/ensemble/developpement` (10 écrans) | 660 px | `div.dm-recherche` | `src/refonte/systeme/modules/VueTousLesModules.tsx`, `modules.css` | socle / S0 (LOT-00, D02) |
| `#/tournees` (2 écrans) | 529 / 460 px | `div.flex.flex-col.gap-4` | `src/screens/DeliveryRoundsScreen.tsx` | LOT-06 (créer) |
| `#/materiel` (2 écrans) | 620 px | `section.rounded-xl.border…` | `src/screens/EquipmentBookingScreen.tsx` | LOT-06 (créer) |
| `#/outils/automatisations` | 413 px | `aside.panel.p-4` | `src/screens/AutomationsScreen.tsx` | LOT-07 (outils) |
| `#/outils/calculatrice` | 445 px | `aside.panel.p-4` | `src/screens/CalculatorProScreen.tsx` | LOT-07 (outils) |
| `#/rapport-client` (2 écrans) | 402 px | `h2.text-xl…` | `src/screens/ClientReportScreen.tsx` | LOT-08 (garde) |

Les 10 écrans à 660 px relèvent d'une seule correction (`.dm-recherche`, une largeur fixe) ; c'est aussi la page du hub
`/ensemble/developpement` quand LOT-11 n'a pas monté sa vue (voir le test de fidélité de LOT-11).

## 3. Les 39 écrans de l'ancienne barre que la coquille v4 ne relie plus

Mesure : routes que la barre de l'ancienne coquille liste (142) moins celles que la coquille v4 déplie (121) sur le build `c377b63`.
**Les 39 ont une entrée au registre** (`src/refonte/modules/declarations/<famille>.ts`) : aucune n'est orpheline. La coquille v4
ne montre que la première vue d'un module fusionné ; les autres existent mais ne sont liées que si l'écran du module y mène.
Ce que T1 n'a **pas** vérifié : qu'un geste (onglet, lien dans la page du module) atteigne chacune d'elles.

| Famille (lot) | Routes |
|---|---|
| jour (LOT-01) | `/absences`, `/priorites`, `/rdv-en-ligne`, `/routines`, `/tableau-de-bord`, `/tableau-projets` |
| contacts (LOT-02) | `/nps`, `/parrainage`, `/scoring-leads`, `/sentiment` |
| écrire (LOT-03) | `/media`, `/outils/traduction`, `/pages`, `/personnel/journal`, `/signature-a-distance` |
| argent (LOT-04) | `/abonnements`, `/acompte`, `/factures-entrantes`, `/notes-de-frais`, `/prevision-fiscale`, `/relances`, `/scenarios`, `/simulateur-pret` |
| échanger (LOT-05) | `/groupes`, `/salles` |
| créer (LOT-06) | `/flotte`, `/identite-visuelle`, `/interventions`, `/itineraires`, `/portfolio`, `/prevision-stock`, `/productions-video` |
| outils (LOT-07) | `/outils/calculatrice`, `/outils/convertisseurs` |
| garde (LOT-08) | `/alertes-personnalisees`, `/comparatif`, `/comply`, `/ssl`, `/tracker` |

Liste versionnée : [`docs/qualite/routes-interne.json`](../routes-interne.json) (les gardes les parcourent désormais par elle).

# Taux horaire de revient (`tauxHoraire`)

**Famille** argent · **Action** prévoir · **Niveau** essentiel · **Route proposée** `/taux-horaire`

## Le besoin

Un artisan ou un indépendant fixe son tarif « au marché », sans savoir s'il
couvre sa rémunération, ses charges et ses cotisations une fois retirés les
congés, les fériés et les heures non facturables (devis, trajets,
administratif). Le catalogue a des calculateurs de prix e-commerce, de panier
et d'événement, mais aucun taux horaire.

## Ce que fait le module

- Entrées : rémunération annuelle visée, charges fixes, base et taux de
  cotisations, marge de sécurité, jours par semaine, semaines de congés,
  fériés chômés, autres jours off, heures par jour, part facturable, tarif
  actuel (facultatif).
- Sorties : **taux horaire minimum HT** (la réponse), prix de journée,
  chiffre d'affaires nécessaire (dont cotisations), heures facturables par an
  et par semaine, et l'écart avec le tarif actuel, par heure et sur l'année.
- Un bouton : copier le calcul.

## Règles

- Jours travaillés = jours/semaine × (52 − semaines de congés) − fériés − autres jours.
- Au réel : CA = revenu × (1 + taux) + charges. En micro : CA = (revenu + charges) / (1 − taux),
  les cotisations portant sur le chiffre d'affaires.
- Marge de sécurité appliquée au CA, puis taux = CA / heures facturables,
  **arrondi au centime supérieur** (un minimum ne s'arrondit pas vers le bas).
- Aucun taux de cotisations en dur : il change et dépend du statut ; l'aide
  renvoie au dernier avis URSSAF.
- Argent en centimes entiers.

## Hors périmètre

Impôt sur le revenu, TVA (tout est HT), saisonnalité.

## Au socle v4 (14 nov. 2026)

- Écran fait des briques du socle (`Page`, `PageHead`, `TuileKpi`, `Carte`, `Saisie`, `Selecteur`,
  `PastilleEtat`…), néon de la famille Argent (`--fam-a` / `--fam-b`, lus sur `data-famille`), Inter,
  un seul bouton principal par écran. Aucune couleur écrite à la main.
- Textes français **au tutoiement** (guide de voix `src/socle/mots/voix.ts`), vérifié par `verifier.mjs`. Ce
  qui part chez un client reste au vouvoiement (rien ici).
- **Place dans les écrans de DS** (provisoire, STATUT §1.33 n° 4) : MA12 Tarifs et remises (`/calculateurs`), par un lien vers `/taux-horaire`.
  Le lien appartient à l'écran de DS, qui n'existe pas encore : ce module ne l'écrit pas.
- Déclaration au registre de S5 : `src/refonte/modules/declarations/tauxHoraire.ts` — **pas encore posée** (`declarerModule` + `nouveau`, qui monte
  la route par `routesDuRegistre()`).
- Il travaille encore sur des **données d'exemple** : rien n'est enregistré. Le brancher à une collection de
  l'organisation est un second temps, hors de cette intégration.


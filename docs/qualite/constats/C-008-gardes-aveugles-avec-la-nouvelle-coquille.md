# C-008 — Avec la nouvelle coquille allumée, les gardes navigateur ne voient presque plus rien ; `check:contraste` ignore les dégradés

- Gravité : **Majeur** (un « vert » sous coquille v4 ne prouverait rien ; un « rouge » peut être faux)
- Où : `scripts/check-{contraste,mouvement,cibles,largeur}.mjs`, `scripts/lib/vues-detail.mjs` (découverte des écrans), `scripts/check-contraste.mjs` (couleurs)
- Branche : `claude/refonte-socle` @ `888f7a0`
- Responsable proposé : auteurs des gardes (S1/S0), CO
- État : **correctif prêt** ([`C-008-gardes-coquille-v4.patch`](C-008-gardes-coquille-v4.patch), à appliquer par le CO : les deux fichiers touchés sont hors de la zone de T1). Mesure complémentaire : `scripts/qualite/contraste-pixels.mjs`

## Constat 1 — la découverte d'écrans s'effondre

Les gardes lisent les liens `a[href^="#/"]` de la navigation. La coquille v4 ne montre que des familles repliées :

| Garde, édition interne | coquille éteinte | coquille allumée (`amn.coquille=noir`) |
|---|---|---|
| amorce (routes découvertes) | **142** | **15** (3 essais, « NON CONCLUANT ») |
| `mouvement` | OK, 412 déplacements | `?` non concluant |
| `contraste` | OK, 199 écrans | `?` non concluant, 941 s |
| `cibles` | ✗ 13 familles (142 routes) | `?` 8 familles sur 15 routes |
| `largeur` | ✗ 7 écrans sur 199 | `?` 4 écrans sur 169 |

Aucune de ces gardes ne peut donc, aujourd'hui, certifier la coquille v4 sur les 142 écrans. Les gardes de la coquille elle-même
(`check:socle-coquille`, `check:systeme-*`) sont sans navigateur.

## Constat 2 — faux rouge sur le contraste

Avec la coquille allumée, `check:contraste` rapporte « 2 combinaisons sous le seuil, 162 occurrences » :
`« EI »` (initiales de l'avatar, 10,5 px, ratio 1,01) et `« Ouvrir »` (12 px). Les deux sont du **texte sombre
`rgb(11,11,12)` posé sur un dégradé néon clair** (`linear-gradient(135deg, rgb(255,107,122), rgb(165,139,255))`, et
`rgb(110,168,255) → rgb(165,139,255)`). La garde ne lit que `background-color` : elle compare le texte au fond de page. Calcul
sur les extrémités des dégradés : **7,2:1 à 8,2:1** (AAA). C'est un faux positif, vérifié sur les pixels.

## Correctif proposé

1. Constat 2 : lire `background-image` (prendre le pire des arrêts du dégradé) dans `check-contraste.mjs`, ou s'appuyer sur
   `scripts/qualite/contraste-pixels.mjs`, qui rend la page avec tous les textes transparents et mesure le contraste sur ce
   qui se trouve vraiment derrière (10 écrans, 1 136 textes, contrôle négatif intégré : `--css 'aside *{color:#2a2a2d !important}'`
   fait tomber 36 textes sur 86).
2. Constat 1 : faire lire la liste des routes dans le registre (`src/refonte/systeme/modules`) au lieu de la navigation visible,
   ou déplier les familles avant de lire les liens. Tant que ce n'est pas fait, T1 ne donne pas de vert « gardes navigateur »
   pour la coquille v4.

## Correctif livré (14 nov., build de vivante `c377b63`, coquille v4 allumée)

[`C-008-gardes-coquille-v4.patch`](C-008-gardes-coquille-v4.patch) (`git apply`, vérifié applicable) touche deux fichiers hors zone T1 :

- `scripts/lib/routes-coquille.mjs` : déplie chaque famille de la coquille v4 (`[data-socle="lateral"] button[aria-expanded]`) et ses « + N autres », lit la page « Tous les modules », puis ajoute la liste versionnée [`docs/qualite/routes-interne.json`](../routes-interne.json) (régénérable : `node scripts/qualite/lister-routes.mjs`). Utilisé par `contraste`, `cibles`, `largeur`, `mouvement`. La coquille v4 fusionne des modules : sur 142 écrans de l'ancienne barre, 39 ne sont plus liés nulle part (`#/relances`, `#/tracker`, `#/ssl`…), d'où la liste.
- `scripts/check-contraste.mjs` : (1) lit la couche du dessus d'un `background-image` en dégradé opaque et retient le pire arrêt (les 160 faux « EI » 1,01:1 disparaissent) ; la couche du dessus seulement, car `linear-gradient(plein, plein), linear-gradient(néon)` est une bordure dégradée ; (2) ferme les « Plus tard » un par un (C-009).

| Garde, interne, coquille v4 allumée | Avant | Avec le patch |
|---|---|---|
| amorce | 15, « non concluant » | **160** |
| `mouvement` | `?` | ✓ 393 déplacements, aucun en mouvement réduit |
| `contraste` | `?` + 2 faux rouges | ✓ **209 écrans + 27 vues de détail + 46 bascules, 34 622 textes, aucun sous AA** |
| `cibles` | `?` 8 familles sur 15 routes | conclusive, ✗ (défauts réels, voir le rapport) |
| `largeur` | `?` 4 écrans sur 169 | conclusive, ✗ (défauts réels, voir le rapport) |

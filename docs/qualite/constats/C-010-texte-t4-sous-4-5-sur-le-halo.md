# C-010 — Le texte T4 passe à 4,49:1 sur le halo bleu de la coquille (limite : 4,5:1)

- Gravité : **Mineur** (0,01 point ; un seul texte sur 1 136 mesurés)
- Où : jeton de texte T4 `#8a8a8e` posé sur le halo bleu derrière la carte « prochain rendez-vous » de la barre latérale
- Branche : `claude/refonte-socle` @ `888f7a0`, coquille allumée
- Responsable proposé : S0 (jeton), décision CO
- État : ouvert

## Constat

Condition posée par le CO (STATUT §1.25) : texte lisible (AA, plancher T4) sous le troisième halo et le voile de page.
Mesure sur les pixels (`scripts/qualite/contraste-pixels.mjs`, coquille allumée, 10 écrans, 1 136 textes visibles,
dégradés compris) :

- `« dans 4 h 11 »` (11,5 px) — T4 `rgb(138,138,142)` sur `rgb(31,37,44)` : **4,49:1** < 4,5. Écran `#/tous-les-modules`, pied de barre latérale.
- Tout le reste passe AA, y compris tous les textes T4 posés sur le halo ailleurs.

Hors condition, à ne pas confondre : sur `#/agenda`, les jours des mois voisins (« 26 » à « 31 », 10 px, opacité réduite) tombent
à 1,8:1. C'est identique sur `main` (mêmes 6 jours, mêmes valeurs) : hérité, pas lié à la coquille.

## Correctif proposé

T4 `#8a8a8e` → `#8b8b8f` : 4,55:1 sur ce fond (et ne bouge rien d'autre à l'œil). Si le jeton est figé par la spec v4, accepter
l'écart et le dire dans STATUT.

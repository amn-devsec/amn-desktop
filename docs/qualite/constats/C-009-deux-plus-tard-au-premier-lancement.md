# C-009 — Un compte neuf ouvre Démarrage (H42) : deux boutons « Plus tard » et `check:contraste` plante

- Gravité : **Mineur** (garde fragile ; pas de défaut produit)
- Où : `scripts/check-contraste.mjs:147-148` (`getByRole('button', { name: 'Plus tard' })` sans `.first()`)
- Branche : `claude/refonte-socle` @ `888f7a0`
- Responsable proposé : auteurs de la garde
- État : ouvert. Contournement dans le lanceur de T1 (`amn.demarrage.propose.<email>` posé d'avance)

## Constat

À la toute première connexion d'un compte, le socle redirige vers Démarrage (`destinationApresConnexion`, G06 §6). La page
porte son propre « Plus tard », et la fenêtre « Qui êtes-vous ? » en porte un autre. `check:contraste` (édition interne)
fait `getByRole('button', { name: 'Plus tard' }).click()` : deux éléments, Playwright refuse
(`strict mode violation`) et la garde sort en 8 s avec une trace Node, sans mesure.

## Preuve

Premier passage de T1 sur le socle : `✗ contraste interne 8 s … strict mode violation: getByRole('button', { name: 'Plus tard' }) resolved to 2 elements`.
Le même compte, avec le drapeau posé, donne `✓ contraste interne … 199 écrans + 25 vues de détail`.

## Correctif proposé

`.first()` sur ce `getByRole`, ou fermer les fenêtres en boucle jusqu'à ce qu'il n'en reste aucune (comme `check-isolation.mjs:127`).

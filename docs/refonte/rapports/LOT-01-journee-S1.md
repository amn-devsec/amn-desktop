# LOT-01 · Ma journée — moitié de S1 (rapport court)

Branche `claude/refonte-journee-2`. Huit écrans : H01, H03, G08, MJ01, MJ02, MJ03, MJ04, MJ05. Un commit par écran.

## Livré

| Écran | Route | Nature | Fidélité (disposition, couleur ± 10) |
|---|---|---|---|
| H01 Calendrier | `/agenda` | substitue l'existant | 6,2 % |
| H03 Missions et tickets | `/missions` | écran neuf (kanban) | 4,5 % |
| G08 Cockpit d'un client | `/cockpit-client` | écran neuf | 7,3 % |
| MJ01 Projets | `/projets` | substitue | 9,4 % |
| MJ02 Habitudes | `/personnel/habitudes` | substitue | 8,6 % |
| MJ03 Planning de l'équipe | `/planning` | substitue | 11,6 % |
| MJ04 Notes rapides | `/notes-rapides` | écran neuf | 8,3 % |
| MJ05 Rappels | `/rappels` | écran neuf | 7,9 % |

Écarts bruts au-dessus de 15 % : dans `docs/qualite/fidelite/justifies-LOT-01.json` (H01, MJ01, MJ02, MJ03, MJ04, MJ05). Ils viennent des données fabriquées dans les aperçus et de la barre latérale de l'aperçu (hors écran).

Garde ajoutée : `check:journee-ecrans` (85 contrôles : logique pure de chaque écran, textes fr et en, structure, aucune couleur écrite, aucun nom réel), branchée dans `package.json` et `editions.yml`. `check:journee` (S2) saute désormais les sous-dossiers des écrans construits.

## Honnêteté des données

Rien n'est inventé dans l'application ; ce qui manque est dit ou masqué.
- Kanban (H03) : les tickets du SAV, en lecture, sans urgence ni sous-tâches ; renvoi vers `/sav`.
- Cockpit (G08) : tout est « non disponible » avec la raison (aucun agrégat serveur) ; test de sécurité : aucune clé, aucun « révéler ».
- Planning (MJ03) : un poste est une demi-journée sans heure ni titre ; lecture seule.
- Notes (MJ04) : texte simple ; sans type, étiquette, voix, accès masqué ni carte d'Ajmani. Une note d'accès ne porte jamais sa valeur (le modèle n'a pas de champ « valeur »).
- Rappels (MJ05) : l'application n'a aucun rappel ; la page est en lecture, vide, avec renvoi vers Relances et Tâches.

## Ce que le CO doit décider

1. **MJ04 sur `/notes-rapides`, pas `/notes`** : `/notes` est déjà substituée par H10 « Notes et pages ». Les deux lisent la même collection. Si vous préférez fusionner les deux, c'est un choix de produit.
2. **MJ05 : « en retard » devient « à reprendre »** (guide de voix), en orange et non en rouge, sans clignotement. La fiche dit « en retard de 42 min » en rouge. À valider.
3. **Sources absentes à créer** pour que ces écrans montrent plus que du texte : une collection de rappels (MJ05), des agrégats serveur d'un client (G08), des heures et titres de créneaux d'équipe (MJ03), types et étiquettes de notes (MJ04), jalons et membres de projets (MJ01).
4. **Fichiers communs avec S7** : `declarations/jour.ts` et `substitutions/declarations/journee.tsx` (je n'ajoute que mes lignes), et `scripts/check-journee.ts` (mon seul changement : `fichiersDe` ignore les sous-dossiers).
5. **Zones de clic** : 38 px par pseudo-élément, `src/refonte/contacts/cibles.css` (partagé avec LOT-02). Restent sous 36 px : les cases à cocher d'une note en liste (pas de 26 px entre lignes) et les interrupteurs du socle. Le centre d'une note d'accès tombe sur son bouton « Afficher ».
6. **Lien `node_modules`** : retiré de l'index (`git ls-tree HEAD node_modules` est vide). À vérifier avant la fusion.

## Reste hors de ce lot
Mobile (LOT-09) attend les lots 01 à 08 fusionnés. Les aperçus de la barre latérale de l'aperçu n'ont pas de ligne « Notes rapides » ni « Rappels » (coquille partagée, non modifiée).

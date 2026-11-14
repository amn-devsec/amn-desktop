# C-006 — Du « vous / votre / vos » reste visible dans l'interface interne

- Gravité : **Majeur** (règle v4 : tutoiement dans l'interface ; `check:tutoiement` reste vert parce qu'il ne regarde que la liste de 353 textes)
- Branche : `claude/refonte-socle` @ `888f7a0`
- Responsable proposé : CO (décider du périmètre), puis S0 pour les écrans de LOT-00
- État : ouvert

## Constat

Mesuré **dans le navigateur** (`scripts/qualite/tutoiement-rendu.mjs`, texte visible de chaque écran, « rendez-vous » et
« êtes-vous » écartés) sur le build du socle, compte d'essai.

**Sur les écrans de LOT-00 et la coquille** (la règle de la mission) — 6 chaînes, toutes dans des textes qui existent
dans le build mais pas dans la liste `_data/tutoiement.json` :

| Texte affiché | Où | Clé |
|---|---|---|
| « À votre avis » | nom du module « La pile » dans la barre latérale et la recherche, sur 34 écrans | `garde.pile.titre`, `src/bureaux/catalogue.ts:197`, `src/accueils/interne/Compteur.tsx:115` |
| « Vous êtes seul·e ici pour l'instant. » | accueil (`#/`) et `#/messages` | `presence.seule` |
| « Écrire à votre prestataire » | idem | `presence.amn` |
| « 619 écritures chez vos clientes sur 7 jours. » | bandeau de l'accueil | `src/components/SupervisionBand.tsx:104`, `tour.silence.*` |
| « Quel est votre poste ? » | panneau « Première ouverture » de l'accueil | `profil.titre` |
| « Votre barre ne gardera que ce qui sert à votre mission… » | idem | `profil.aide` |

**Hors LOT-00** (écrans d'autres lots, déjà dans le produit) : 79 lignes de plus sur 19 écrans, dont `#/settings` (33),
`#/formulaires` (9), `#/assistance` (8), `#/hall` (7), `#/garde/pile` (6), `#/membres` (3), `#/lettre` (3).
Une partie est peut-être du texte destiné aux clients (formulaires, lettre, signature) : T1 ne les classe pas à la place
du CO. Liste complète : [`tutoiement-rendu-coquille-eteinte.json`](../resultats/tutoiement-rendu-coquille-eteinte.json) et [`…-allumee.json`](../resultats/tutoiement-rendu-coquille-allumee.json).

Exemple légitime vu en passant : la lettre de relance de G05 (« Dans l'attente de votre règlement ») est un texte client, le
vouvoiement y est voulu.

## Correctif proposé

1. Le CO tranche si « À votre avis » est un nom de module (à passer en « À ton avis ») ou une marque.
2. Ajouter les 6 chaînes ci-dessus à la liste `tutoiement` et à `check:tutoiement`, pour que la garde voie ce que le rendu montre.
3. Le script de T1 peut servir de garde (sortie 1 s'il trouve un « vous »), une fois la liste des textes « client » connue.

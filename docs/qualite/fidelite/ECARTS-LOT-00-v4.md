# Fidélité LOT-00 (v4) — écarts image contre écran, sur le socle v4

> Tenu par T1. Remplace [`ECARTS-LOT-00.md`](ECARTS-LOT-00.md) (mesure v3 du 11 nov.) pour la branche
> `claude/refonte-socle` **@ `888f7a0`** (S0, point 9). Les captures et les images v4 restent hors dépôt.
> Garde de suivi : `check:fidelite` ([`CONTROLE-FIDELITE.md`](../../refonte/CONTROLE-FIDELITE.md)), valeurs dans
> [`acceptes-LOT-00.json`](acceptes-LOT-00.json), raisons dans [`justifies-LOT-00.json`](justifies-LOT-00.json).

## Conditions de mesure

- Build interne de production (et de développement pour H43), construit sur `888f7a0`, API d'essai en mémoire, **données
  fictives** (`seed-essai.mjs` + `graines-maquettes.mjs` : Menna Conseil, Atelier Dupont, quatre factures en retard dont F-2041).
- Chromium sans tête, **1440 × 900**, plate-forme Mac simulée (⌘), horloge fixée au **vendredi 30 oct. 2026 à 10:42** (fuseau
  de Paris), nouvelle coquille allumée (`localStorage['amn.coquille'] = 'noir'`), guide et accueil quotidien marqués vus.
- G09 : l'écran de veille s'ouvre à l'inactivité ; la capture accélère les minuteries de plus d'une minute (le temps simulé
  de Playwright fige les animations).
- Images : `AMN-Business-dossier-v4/images/` (153 PNG), lues par `AMN_DOSSIER_V4`.
- Deux mesures par écran, même outil :
  - **écart brut** (celle de la garde) : un pixel est accepté s'il existe, à ±2 px, un pixel de la même couleur (±2 niveaux
    sur un aplat), dans les deux sens ;
  - **disposition** : la même, couleur ±10 — elle isole la mise en page des nuances de néon (halos, dégradés).
- Reproductible : deux passages complets donnent les mêmes chiffres au dixième.

## Résultats

| Écran | Écart brut | Disposition (±10) | Valeur de S0 | Textes de la maquette retrouvés | Zone de la palette seule |
|---|---:|---:|---:|---:|---|
| G09 Écran de veille | 13,3 % | **0,2 %** | 3,4 | 10 / 15 | — |
| G06 Connexion | 11,4 % | 4,1 % | 12,3 | 10 / 21 | — |
| H42 Démarrage | 18,1 % | 6,8 % | 9,9 | 22 / 79 | — |
| H47 Choisir son métier | 21,3 % | 4,7 % | 15,3 | 51 / 87 | — |
| H40 Notifications | 20,0 % | 8,1 % | 14,5 | 42 / 92 | — |
| H41 Recherche ⌘K | 22,7 % | 9,9 % | 19,9 | 11 / 78 | 14,5 % |
| H43 États et messages (dev) | 27,6 % | 6,2 % | 24,0 | 60 / 88 | — |
| D02 Tous les modules | 30,6 % | 8,3 % | 12,2 | 69 / 147 | — |
| G05 Ajmani ⌘J | 43,4 % | 14,8 % | 39,1 | 14 / 95 | 42,5 % |

Les valeurs de S0 viennent d'une autre mesure (non reproduite par T1) : l'écart brut de T1 est plus sévère sur G09 et D02,
plus tolérant sur H47. Les valeurs acceptées de `check:fidelite` sont celles de T1.

**Lecture.** En disposition, tous les écrans sont sous 15 % et sept sur neuf sous 9 % : la mise en page du socle v4 suit
les images. L'écart brut élevé vient de trois choses qui ne sont pas des erreurs de mise en page : les halos et dégradés
néon (quelques niveaux de différence sur de grandes surfaces, surtout G09 : 13,3 % brut, 0,2 % en disposition), les
données d'exemple, et la coquille (voir plus bas).

## Ce qui reste, écran par écran

| Écran | Écarts relevés (zones de plus de 6 % des pixels du carré) |
|---|---|
| **G09** | quatre petites zones « absentes de la capture » : lignes de texte de l'état de La Garde (« prochaine ronde », « 12:30 », ligne de réglage « Veille après 5 min · verrouillage après 15 min ») que le texte rendu ne retrouve pas à l'identique. La disposition est identique. |
| **G06** | carte de clé d'accès et pied (écart connu de S0 : méthodes de connexion absentes), horloge 08:57 de la maquette contre l'heure fixée, pastille « tous les services sont en ligne ». |
| **H42** | cartes d'étapes : textes d'exemple (« 7 importés d'Excel », devis type, « ÉTAPE 3 SUR 6 »), en-tête et section « Développement » (voir coquille). |
| **H47** | cartes de métier : « + 16 autres modules, 20 en tout » issu du registre du build ; la maquette sélectionne « Conseil et services » (l'app aussi dans la capture). |
| **H40** | contenu des notifications (données d'exemple du bac à sable, pas celles de la maquette) ; en-tête et section « Développement ». |
| **H41** | page derrière la palette (≠ de l'image), résultats « menna » issus des données d'exemple, pied « ⌘↵ » de la palette absent (écart connu de S0). |
| **H43** | page de démonstration des états : textes et données d'exemple de la maquette ≠ de ceux du build. |
| **D02** | lignes du registre : noms et nombres du build (« Accueil et tableau de bord » là où la maquette écrit « Tableau de bord », etc.). |
| **G05** | page derrière la palette ⌘J, factures et points d'attention du bac à sable (pas les mêmes clients ni montants que la maquette), « Préparer » absent (écart connu de S0), texte saisi. |

## Écarts de coquille communs (état sur la v4)

Relevés dans [`ECARTS-LOT-00.md`](ECARTS-LOT-00.md) (v3), contrôlés sur le texte rendu de la v4 :

| Écart v3 | Sur la v4 |
|---|---|
| C1 fil d'Ariane (« Notifications » sans « Ma journée / ») | **corrigé** : « Ma journée / … » présent |
| C7 route brute (« sur /notifications ») dans « EN LIGNE » | **corrigé** : plus aucune route brute dans le texte |
| C8 « ⌘ K » avec espace | **corrigé** : « ⌘K », « ⌘J » d'un bloc |
| C10 bouton rond flottant ✦ | **corrigé** (plus de bouton flottant dans les captures) |
| C3 noms longs du registre (« Accueil et tableau de bord », « Calendrier et RDV en ligne ») | **persiste** (maquette : noms courts) |
| C9 sélecteur d'organisation dans l'en-tête (« ORGANISATION AMN DevSec ») et pastille « RECONNEXION EN COURS… » | **persiste** (la pastille vient de l'API d'essai sans temps réel ; le sélecteur n'est pas sur l'image) |
| section « ESPACES DE TRAVAIL / Développement » dans la barre latérale | **présente** dans l'app, absente de l'image (à décider : D02, H40, H42, H47, G05) |
| C2, C4, C5, C6, C11, C12, C13 (dépliage des familles, pas de 36 px, compteurs, troncature, `tabular-nums`, gris des titres, tailles de boutons) | **non re-mesurés** sur la v4 : T1 n'a pas refait les mesures de pixels de ces sept points ; la disposition à ±10 les englobe (aucun écran au-dessus de 15 %), pas davantage |

## Autres contrôles de cette passe

- **Tutoiement dans le rendu** : voir [C-006](../constats/C-006-vouvoiement-residuel-dans-le-rendu.md). 6 chaînes sur les écrans de LOT-00 et la coquille, 79 lignes de plus sur 19 écrans d'autres lots.
- **Contraste sur les pixels** (halos, voile, dégradés) : un texte à 4,49:1 sur 1 136 ([C-010](../constats/C-010-texte-t4-sous-4-5-sur-le-halo.md)).
- **Mouvement réduit** : 0 animation CSS infinie sur 5 écrans (5 à 10 en mouvement permis : `amnHalo`, `pulse`, `sc-mvt-clignote`, `sc-squelette`).

## Limites

- Une image fixe : pas de survol, de focus, d'animation en cours ; le fond de G09 et ses halos sont mesurés à un instant.
- Les données d'exemple ne sont pas celles des maquettes : chaque nom, montant ou date qui diffère compte comme un écart brut.
  C'est pour cela que la garde donne une valeur acceptée par écran plutôt qu'un seuil unique.
- Les écarts de la dernière colonne de « Résultats » (zone de la palette seule) isolent la palette de la page qui est derrière.

# LOT-14 · Modèles de sites v2 — note de préparation

> Branche `claude/refonte-modeles`, partie de `claude/refonte-vivante` @ `98ae31ef`. Rédigée le 14 nov. 2026 par S2, en mode PRÉPARATION (étape 1 du CO : aucune ligne d'écran, aucun modèle livré).
> Sources : `PLAN-BUREAU-DE-TRAVAIL.md` §1 et `STATUT.md` §1.43, le code de LOT-11 (`src/refonte/developpement/ModelesDeSites.tsx`, `modeles.ts`) et sa note, le skill `signes-ia` (94 signes), le socle (`src/socle/ui/**`), et quatre essais jetables faits ici (§9 : isolation, taille de Prettier et de Shiki, licences).
> **Mesuré** = observé sur cette machine ; **proposition** = choix que je recommande ; **à vérifier** = non éprouvé. Rien ici ne décrit une faiblesse de sécurité ; aucune donnée réelle.

## 1. En bref

- **Le principe** : un modèle est un **dossier** (un site complet : pages, ressources, `modele.json`), pas un fichier HTML. La bibliothèque lit un **index généré** ; seul le modèle ouvert est rendu dans un cadre ; la grille n'affiche que des **vignettes** (images capturées à l'entrée du modèle).
- **L'inspecteur sans script** (mesuré, §4.3) : un cadre `sandbox="allow-same-origin"` **sans** `allow-scripts` n'exécute aucun script du modèle, et l'application peut pourtant lire son DOM et ses feuilles de style. Le clic, le survol et le surlignage vivent donc dans l'application, jamais dans le modèle. Conséquence assumée : **un modèle doit marcher sans JavaScript** (règle de la porte, à valider par Harun, §11 n° 3).
- **Trois écrans** : Bibliothèque (grille virtualisée), Fiche du modèle avec inspecteur, Collection de l'atelier (ludique, collectif). Tous suivent les archétypes du socle (`Page`, `Scinde`) ; **une brique manque** au socle : une grille virtualisée (§6).
- **Une porte de qualité** rejouée par `check:modeles` (rapide, sans navigateur) et `check:modeles:rendu` (Chromium : axe-core, 390/768/1280 px, sans JavaScript, Lighthouse). Sur les 94 signes d'IA, **une soixantaine se vérifient par programme** ; le reste est une relecture écrite de Harun (§7.2).
- **Dépendances** : Prettier, Shiki, TanStack Virtual, fflate à l'exécution ; axe-core, Lighthouse, html-validate en développement. **Un piège de licence trouvé** : Lighthouse 13.6.0 tire un paquet sous licence FSL (non ouverte). On épingle une version antérieure (§8).
- **Deux modèles pilotes** (§10) écrits ici de toutes pièces et marqués `pilote` : ils prouvent la chaîne de bout en bout sans attendre la liste de Harun, et n'entrent pas dans la bibliothèque livrée.
- **Un conflit de numéro à régler par le CO** : `STATUT.md` §2 donne déjà « LOT-14 » à *Charge et essais longs* (SIM et T1). Les branches ne se heurtent pas (`claude/refonte-modeles` ici), mais deux lots ne peuvent pas porter le même numéro dans le tableau.

## 2. Ce qui existe (LOT-11, S8) et ce qu'on en fait

| Élément | Aujourd'hui | Dans LOT-14 |
|---|---|---|
| `ModelesDeSites.tsx` (285 l.) | une page : recherche, puces de secteur, **un `<iframe sandbox="">` par tuile** (échelle 0,28), fiche plein écran aperçu/code, copie du HTML, « Ajouter » (HTML collé, `localStorage`) | remplacé par la bibliothèque v2 ; **un iframe par tuile ne tient pas à 100 modèles** (chaque tuile rend une page entière) |
| `modeles.ts` (96 l.) | `ModeleSite` = un HTML ; `puces`, `filtrer`, `poids`, `lignes`, `fauteDAjout`, `lireAjoutes`, `jetonsHtml` (colorateur maison) | `filtrer` et `puces` repris en facettes (§5.3) ; `jetonsHtml` remplacé par Shiki, gardé en repli si le chargement échoue |
| `MODELES_LIVRES` | vide, en attendant la relecture de Harun | supprimé : la liste vient de l'index (§4.2) |
| `scripts/apercu/modeles-exemple.ts` | 8 pages de remplissage, **non gardées** (plan §1) | restent des données d'aperçu de LOT-11 ; l'aperçu de LOT-14 lit l'index des pilotes + un jeu de charge (§10.3) |
| Route `/developpement/modeles-sites`, vue `devModelesSites` (fichier de S8) | déclarée dans `declarations/developpement.ts` | LOT-14 garde la route ; **comment la reprendre sans toucher le fichier de S8** est une question (§11 n° 10) |
| Flux « Ajouter un modèle » (code collé) | fonctionne, local au poste | **à conserver** comme voie rapide (un seul fichier, étiquette « Ajouté », hors porte de qualité) ; question posée à S8 |

## 3. Écrans et archétypes du socle

| Écran | Route (proposition) | Composition | Briques du socle |
|---|---|---|---|
| **MOD-bibliotheque** | `/developpement/modeles-sites` | en-tête de page, une barre de recherche et trois groupes de filtres (secteur, style, type), compteur « n modèles », grille virtualisée de cartes | `Page`, `EnTeteDePage`, `BoiteRecherche`, `FilterChips` (vivant), `Tag` ; **grille virtualisée : manquante** |
| **MOD-fiche** | `/developpement/modeles-sites/:id` (+ `/:page`) | `Scinde` : à gauche l'arbre *pages → sections → composants* (liste, clavier) ; à droite le cadre d'aperçu (largeurs 390 / 768 / 1280) et, en bas, le panneau code (onglets HTML et CSS) avec les trois copies | `Scinde`, `ListeScindee`, `DetailScinde`, `Onglets`, `Segmente`, `Bouton`, `Modale` |
| **MOD-collection** | `/developpement/modeles-sites/collection` | la collection de l'atelier : sections et composants *allumés* quand ils ont servi dans un vrai projet ; paliers collectifs | `GrilleCartes`, `CarteJalon`, `CarteSerie` (ludiques) ; un moment du bus (§11 n° 6) |

Règles tenues : néon par `--fam-a` / `--fam-b` seulement (famille *Développement*, posée par la coquille) ; zones de clic de 36 px (§1.41) ; aucune couleur écrite à la main (la coloration du code suit les jetons, §5.5) ; textes au tutoiement dans `src/refonte/modeles/i18n.ts` (périmètre de `check:tutoiement` à étendre). **Attention** : le *contenu* des modèles est du texte de site client, donc au **vouvoiement** (REGLES « Produit ») ; le dossier `modeles/` est exclu de `check:tutoiement` (§11 n° 9).

Pas d'image v4 : Harun valide sur l'aperçu ; T1 contrôle archétypes, accessibilité, zones de clic, textes (plan §0 n° 5).

## 4. Architecture

### 4.1 Où vivent les modèles (proposition)

```
modeles/                         ← racine du dépôt, hors de src/ (ni tsc, ni eslint, ni le paquet client)
  index.json                     ← GÉNÉRÉ, committé, vérifié à jour (§4.2)
  vocabulaire.json               ← secteurs, styles, types, catégories de sections et de composants
  <id>/
    modele.json                  ← le manifeste (§4.4)
    revue.json                   ← relecture de Harun et résultat de la porte (§7.3)
    vignette.webp                ← capturée à l'entrée (§4.5)
    site/                        ← le site, tel qu'on le livre
      index.html, a-propos.html, contact.html, 404.html, robots.txt, sitemap.xml
      css/…  img/…  polices/…  (js/… seulement s'il est utile)
src/refonte/modeles/             ← le code des trois écrans, la logique pure, i18n.ts (zone de LOT-14)
scripts/modeles/                 ← indexer, capturer, empaqueter, porte (statique et rendu), jeu de charge
```

- **Pourquoi hors de `src/`** : du HTML/CSS/JS de sites n'est pas du code de l'application ; `tsc` et `eslint --ext .ts,.tsx .` ne le voient pas, et on évite qu'un `.js` de modèle soit lié par erreur. Chargement par `import.meta.glob('/modeles/*/modele.json')` et `?raw` à la demande, **depuis `src/refonte/modeles/` seulement** : donc interne, absent du paquet client (garde : `comparer-paquet-client.mjs` doit rester vide de « modeles »).
- **Dépôt public** (REGLES « Sécurité ») : un modèle écrit par AMN et sans donnée client y est admissible. **Un site fait pour un client n'y entre qu'avec son accord écrit, anonymisé** ; sans accord, il reste une référence privée (dépôt privé du dossier, jamais ici). Le manifeste ne porte jamais le nom du client ni l'accord lui-même, seulement `origine.sorte` et une référence opaque.
- **Poids** : visé ≤ 1,5 Mo par modèle (hors vignette), images ≤ 200 Ko chacune (signe 4.20). À 100 modèles : ≈ 100 à 150 Mo dans le dépôt. **À peser avec le CO** avant le 20ᵉ modèle (§11 n° 2) ; l'issue de repli est de sortir les ressources lourdes vers le serveur maison, sans changer le format.
- **Taille du paquet interne** : les chunks `?raw` ne sont chargés qu'à l'ouverture d'un modèle, mais ils existent dans `dist/`. **À mesurer au pilote** (critère : < +10 Mo pour 12 modèles) ; sinon, copie statique de `modeles/` dans `dist/` et lecture par `fetch`.

### 4.2 L'index généré

`npm run modeles:indexer` produit `modeles/index.json` à partir des manifestes et du site : par modèle, `id`, `nom`, `resume`, `secteur`, `styles`, `type`, `pages[]`, nombre de sections et de composants, poids par page, `couleurDominante`, `vignette` (fichier, taille, empreinte des sources), et un **texte à chercher** (titres, intertitres, premier paragraphe, ≤ 2 Ko, normalisé sans accent). Déterministe (ordre des clés, aucune date) ; `check:modeles` refuse un index périmé. Charge : ≈ 2 Ko par modèle, soit 200 Ko pour 100 ; chargé à l'ouverture de la bibliothèque, jamais les sites.

### 4.3 L'aperçu et l'inspecteur dans un cadre isolé

Trois régimes de cadre, du plus fermé au plus ouvert :

| Régime | `sandbox` | Usage |
|---|---|---|
| Aucun cadre | — | la grille (vignettes) |
| **Lecture** | `allow-same-origin` (sans `allow-scripts`) | l'aperçu et l'inspecteur de la fiche |
| Repli | `""` (comme LOT-11) | « Ajouter » : code collé, jamais lu par l'application |

**Mesuré ici** (Chromium de Playwright 1.65, page `setContent`, trois cadres `srcdoc`) : avec `sandbox=""` ou `allow-scripts` seul, l'application **ne peut pas** lire le cadre (origine opaque) ; avec `allow-same-origin` sans script, elle lit `contentDocument`, énumère les règles CSS (y compris celles d'un `@media`), teste `element.matches(selecteur)`, et un `<script>` du modèle **ne s'exécute pas** (le titre posé par le script reste vide ; la page parente n'est pas modifiée).

- **Pourquoi `srcdoc` et pas une adresse** : un fichier chargé par adresse dépend du schéma d'origine (`file://` d'Electron, serveur local du `build:web`) ; `srcdoc` donne la même origine partout. Les ressources relatives (CSS, images, polices) sont donc **empaquetées à l'ouverture** : un petit assembleur (`empaqueter`) remplace les `href`/`src` relatifs par des URL `blob:` créées pour la session (pas de `data:` géants), les révoque à la fermeture. **À vérifier** sous Electron (`npm start` interdit à tous : le contrôle se fera au `build:web` local, puis par Harun).
- **Plusieurs pages** : le parent intercepte le clic sur un lien interne (écouteur posé sur le document du cadre) et recharge le `srcdoc` de la page cible ; un lien externe est neutralisé (pas de navigation hors modèle, aucun réseau). Le parent ré-attache l'inspecteur à chaque `load`.
- **Rien n'est injecté dans le modèle** : surlignage, étiquette « Section · En-tête » et poignées sont des éléments du **parent**, positionnés d'après `getBoundingClientRect` du cadre (en tenant compte de l'échelle d'ajustement). Le code copié est donc exactement celui du modèle.
- **Largeurs 390 / 768 / 1280** : le cadre prend la vraie largeur (pour que les `@media` jouent) puis est réduit par transformation pour tenir dans le panneau.
- **Limite connue** : ce qui dépend d'un script (menu mobile à bascule, carrousel, validation maison) ne joue pas dans l'aperçu. D'où la règle « le contenu et la navigation marchent sans JavaScript » (menus par `<details>`, `:target`, `popover`…), contrôlée par la porte (§7.1). Si Harun veut des démos interactives, l'option B est un cadre à origine opaque (`allow-scripts`) avec un petit script de l'application injecté et un dialogue par `postMessage` : plus de surface, plus de travail, **non recommandée en v2**.

### 4.4 Le manifeste `modele.json` (schéma 1, proposition)

```json
{
  "schema": 1,
  "id": "atelier-pilote-vitrine",
  "nom": "Atelier vitrine",
  "resume": "Vitrine artisan en quatre pages, claire et chaleureuse.",
  "secteur": "artisan",
  "styles": ["clair", "chaleureux"],
  "type": "vitrine",
  "langue": "fr",
  "origine": { "sorte": "original-amn", "pilote": true },
  "pages": [
    { "id": "accueil", "fichier": "index.html", "titre": "Accueil" },
    { "id": "contact", "fichier": "contact.html", "titre": "Contact" },
    { "id": "404", "fichier": "404.html", "titre": "Page introuvable" }
  ],
  "sections": [
    { "id": "entete", "nom": "En-tête", "categorie": "en-tete", "selecteur": "header.entete", "pages": ["*"] },
    { "id": "heros", "nom": "Héros", "categorie": "heros", "selecteur": ".heros", "pages": ["accueil"] }
  ],
  "composants": [
    { "id": "bouton", "nom": "Bouton principal", "categorie": "bouton", "selecteur": ".bouton", "exemple": { "page": "accueil", "indice": 0 } }
  ],
  "actifs": [
    { "fichier": "site/polices/exemple.woff2", "sorte": "police", "licence": "OFL-1.1", "source": "…" }
  ],
  "vignette": { "fichier": "vignette.webp", "largeur": 640, "hauteur": 400, "sources": "sha256:…" }
}
```

Règles vérifiées par `check:modeles` : `id` = nom du dossier, en minuscules et tirets, unique ; `secteur`, `styles`, `type`, `categorie` pris dans `vocabulaire.json` (listes fermées : c'est ce qui rend les filtres cohérents) ; chaque `fichier` existe ; **un sélecteur de section désigne exactement un élément par page où il est déclaré** (`"*"` = toutes), **un sélecteur de composant en désigne au moins un** et `exemple` pointe une occurrence réelle ; chaque `actif` a une licence dans la liste admise (MIT, Apache-2.0, MPL-2.0, BSD, ISC, OFL-1.1 pour une police, CC0, ou `AMN-original`) et aucune AGPL ; une photo ne peut être « générée » (signe 2.3) : `AMN-original` ou CC0 avec source ; aucun nom de client, aucune adresse hors `exemple.test`/`example.com`.

### 4.5 Les vignettes : capturées à l'entrée, chargées au défilement

- **Capture à l'entrée** : `npm run modeles:capturer -- <id>` ouvre l'accueil en 1280 × 800, JavaScript coupé et animations arrêtées (même régime que l'aperçu), attend les polices, prend le haut de page, et le réduit en **WebP 640 × 400** (< 40 Ko) *dans Chromium* (canvas), sans nouvelle dépendance native (`playwright-core` est déjà au dépôt). La vignette est **committée** avec le modèle (ce n'est pas une capture d'écran de l'application : la règle « captures hors du dépôt » vise les images v4 ; **à confirmer par le CO**, §11 n° 2).
- **Pas périmée** : `vignette.sources` est l'empreinte des fichiers du site au moment de la capture ; `check:modeles` la recalcule (déterministe, sans navigateur) et refuse une vignette dont le site a changé. Les octets d'une capture ne sont pas comparés (ils varient d'une machine à l'autre) ; `check:modeles:rendu` recapture et compare avec une tolérance.
- **Chargement** : la grille est virtualisée (§5.2) ; une carte visible porte `<img loading="lazy" decoding="async" width height>` sur fond `couleurDominante` (pas de saut de mise en page) ; un fondu à l'apparition qui respecte le mouvement réduit.

## 5. La bibliothèque

### 5.1 Recherche
Plein texte sur `nom`, `resume`, `secteur`, `styles`, `type` et le texte de l'index, **sans accent ni casse, chaque mot tapé doit se trouver** (comme `filtrer` aujourd'hui), avec un classement : nom > étiquettes > secteur/type > texte. Pas de bibliothèque : à 100 ou 1 000 entrées, un balayage coûte quelques millisecondes (à mesurer sur le jeu de charge, §10.3).

### 5.2 Grille virtualisée
TanStack Virtual (MIT) par **rangées** : nombre de colonnes d'après la largeur du conteneur (`ResizeObserver`), hauteur de rangée fixe (vignette 16:10 + 64 px d'information), 2 rangées de marge. `role="list"` avec `aria-setsize` / `aria-posinset` sur chaque élément rendu (le lecteur d'écran annonce « 37 sur 112 »). Clavier : tabindex itinérant ; les flèches, Début, Fin, Ctrl+flèches **réutilisent `deplacerDansGrille(index, total, colonnes, touche, ctrl)`** du socle (fonction pure sur des indices, pas sur le DOM), puis la rangée est amenée dans la vue avant de poser le focus. Rien n'est rendu hors fenêtre : **zéro iframe dans la grille**.

### 5.3 Filtres à facettes
Trois groupes (secteur, style, type) ; un style est multiple (un modèle peut être « clair » et « sobre »). Les **comptes** de chaque puce sont calculés avec *les autres* filtres appliqués (jamais un compte qui promet un résultat que la grille ne donne pas) ; une puce à zéro reste visible mais atténuée. L'état (recherche, filtres) vit dans l'adresse (`?q=…&secteur=…`) pour le retour arrière et le lien partagé ; message d'absence de résultat avec « Effacer les filtres ». Vocabulaire de départ : les 8 secteurs de l'aperçu (commerce local, artisan, restauration, automobile, services B2B, portfolio, beauté, bien-être), les types du plan (vitrine, une page, réservation, boutique, portfolio) et des styles (clair, sombre, sobre, chaleureux, …) à fixer avec Harun.

### 5.4 La fiche et l'arbre
L'arbre à gauche (pages, puis sections, puis composants du manifeste) est la **voie clavier et lecteur d'écran** de l'inspecteur : choisir un nœud sélectionne l'élément dans le cadre. Le clic dans le cadre est la voie pointeur ; il sélectionne l'élément pointé et remonte à la section ou au composant déclaré le plus proche (`closest`).

### 5.5 Mise en forme et coloration (Prettier + Shiki)
- **Prettier** en mode autonome (`prettier/standalone` + plugins `html`, `postcss`, `babel`, `estree`), chargé par `import()` à l'ouverture d'une fiche, jamais au démarrage.
- **Shiki** en noyau + **moteur d'expressions JavaScript** (sans WebAssembly), langages `html`, `css`, `javascript`. Le thème passe par des **variables CSS** (thème « variables » de Shiki, **à vérifier** dans la version retenue) pour que la couleur des jetons vienne des jetons du socle et non d'un thème écrit à la main.
- **Mesuré ici** (esbuild, `--minify`) : Prettier + 4 plugins = **961 Ko** (270 Ko gzip) ; Shiki noyau + moteur JS = **166 Ko** (54 Ko gzip), plus ≈ 58 Ko (12 Ko gzip) pour la grammaire HTML et 11 Ko pour un thème. Exécution (Node, page de 16 Ko / 600 lignes) : mise en forme **112 ms**, coloration **168 ms**, initialisation de Shiki **11 ms**. Au-delà de ≈ 200 Ko d'entrée : mise en forme dans un Worker et affichage fenêtré ; au-delà d'un plafond fixé au pilote, le panneau montre le texte sans couleur.

### 5.6 Les trois copies
| Copie | Contenu | Sortie |
|---|---|---|
| **Site entier** | les fichiers du dossier `site/` + un `LISEZ-MOI.txt` (nom, licences des ressources) | archive `.zip` (fflate, MIT), téléchargement ; sources déjà formatées (`prettier --check` dans la porte) |
| **Section** | le HTML de l'élément déclaré + le **CSS utile** ; la liste des ressources qu'elle appelle (« 2 images, 1 police : à copier aussi ») avec l'option *Section + ressources* en archive | presse-papiers : HTML, CSS, ou les deux (le CSS dans un `<style>` avant le HTML) |
| **Composant** | idem, **autonome** : HTML et CSS qui, collés seuls, redonnent le composant | idem |

**Le CSS utile** (algorithme, à éprouver au pilote) : (1) parcourir `document.styleSheets` du cadre, y compris `@media`, `@supports`, `@layer`, `@container` (l'enveloppe est conservée, donc le responsive aussi) ; (2) garder une règle si l'un de ses sélecteurs, **débarrassé des pseudo-classes d'état et des pseudo-éléments**, correspond à l'élément choisi ou à un de ses descendants ; (3) y ajouter les `--propriétés` appelées par `var()` (valeurs prises sur `:root`/`html`), les `@font-face` des familles utilisées et les `@keyframes` appelés ; (4) garder l'ordre d'origine ; (5) passer le tout dans Prettier. **Limite dite à l'écran** : une règle qui ne s'applique qu'après un script ou une classe posée à l'exécution n'est pas reprise. Contrôle de la porte : le composant copié, rendu **seul** dans un cadre, doit ressembler à son découpage dans la page (tolérance), preuve que la copie est autonome.

Raccourcis (proposition, à valider par T1 pour le clavier) : `I` inspecteur, `↑` parent, `↓` premier enfant, `←` `→` frères, `S` / `K` section / composant le plus proche, `Maj+C` copier la sélection, `Maj+A` archive du site, `Échap` quitter. Ils ne s'appliquent que si le focus n'est pas dans un champ.

## 6. Ce qu'il manque au socle (à dire au CO, jamais contourné)

1. **Grille virtualisée** : `GrilleCartes` rend toutes ses cartes. LOT-14 écrit sa grille dans sa zone en réutilisant `deplacerDansGrille` et le style de `CarteModule` ; elle pourra être promue au socle plus tard.
2. **Cadre isolé** : aucune brique « aperçu de page isolé » au socle. LOT-14 écrit `CadreIsole` dans sa zone ; LOT-16 (Atelier développement) en aura besoin aussi pour les extraits.

## 7. La porte de qualité

### 7.1 Les contrôles (plan §1 : points 1 à 6)

| # | Point du plan | Outil | Seuil (proposition) | Où |
|---|---|---|---|---|
| 1 | `signes-ia` à 0 | contrôles écrits ici (§7.2) + relecture | 0 signe automatique ; relecture signée | statique + `revue.json` |
| 2 | accessibilité | axe-core (MPL-2.0, fichier non modifié) dans Chromium, 3 largeurs, JavaScript coupé | 0 violation *critique* ou *sérieuse* (règles `wcag2a`, `wcag2aa`, `wcag21aa`, `best-practice`) ; le reste est un avertissement | `check:modeles:rendu` |
| 3 | responsive | Chromium à 390, 768, 1280 **et 360** (signe 4.10) | aucun défilement horizontal, aucun élément hors fenêtre, texte lisible | `check:modeles:rendu` |
| 4 | poids et performance | Lighthouse (Apache-2.0), `127.0.0.1`, bureau et mobile | à fixer avec Harun ; départ : performance ≥ 90, accessibilité ≥ 95, bonnes pratiques ≥ 95, SEO ≥ 95 | `check:modeles:rendu` |
| 5 | code actuel | règles statiques (`html-validate`, MIT) | pas de jQuery, Bootstrap ≤ 4, Font Awesome ≤ 4, `moment`, etc. ; pas de `<font>`/`<center>`/`<table>` de mise en page ; pas de `@import` ni de ressource distante ; JavaScript ≤ 15 Ko minifié au total, sans framework, sans gestionnaire en ligne ; mesure *informative* de l'emploi de `grid`, `flex`, `clamp()`, propriétés logiques | `check:modeles` |
| 6 | relecture de Harun | `revue.json` | présent, daté, signé, sans point ouvert | `check:modeles` |
| + | sans JavaScript | Chromium, JavaScript coupé | contenu et navigation complets | `check:modeles:rendu` |
| + | licences et origine | manifeste | §4.4 | `check:modeles` |

Les gardes **navigateur** (rendu) tournent en local et par T1, comme `check:contraste` ou `check:clavier` (elles ne sont pas dans `editions.yml`). Lighthouse sur plusieurs dizaines de pages est lent : la porte ne rejoue que les modèles **modifiés** (différence git), et tout rejoue à la demande. **Lighthouse « dans le Chromium d'Electron »** (plan) se heurte à `npm start` interdit à tous : on le fait dans le Chromium de Playwright, et Harun le refera dans Electron quand il voudra.

### 7.2 Les 94 signes : ce qui se vérifie par programme
Le script `verifier-signes-ia.mjs` du skill vit dans le dépôt d'amndevsec.fr, pas ici : `check:modeles` embarque **sa propre version des contrôles mécaniques**, numérotée comme le guide (section.numéro) pour que la liste des échecs soit la même que celle que Harun reçoit.

- **Par programme** (≈ 60) : 1.1 tirets cadratins ; 1.3 puce à emoji ; 1.9 vocabulaire marqueur ; 1.10 guillemets ; 2.1 adresses `*.vercel.app`/`*.netlify.app` ; 2.2 dégradé violet vers bleu ; 2.5 liens et feuilles inexistants ; 2.6 animation au défilement (`animation-timeline`, `IntersectionObserver`, bibliothèques de révélation) ; 2.7 plusieurs pages reliées par le même bandeau ; 2.8 logo en SVG ; 2.9 favicon et icône d'écran d'accueil ; 2.10 `background-clip: text` ; 2.11-2.12 confidentialité (≥ 150 mots) et conditions remplies, sans *lorem* ; 2.13-2.14 compteurs ; 2.16 emoji comme icône ; 2.18 polices manuscrites ; 2.19 mention de l'outil ; 3.1 dégradé à deux couleurs saturées ; 3.3 blanc pur ; 3.7 `backdrop-filter` ; 3.8 police générique par défaut sans raison (avertissement) ; 3.12 coche verte ; 3.16 violet comme accent ; 3.18-3.21 orbe, grille de points, étincelle, flèche qui rebondit ; 3.23 néon sur fond sombre ; 4.1 page 404 ; 4.2 appel à l'action visible sans défiler (rendu) ; 4.3-4.4 titre et description uniques ; 4.5 `og:image` 1200 × 630 ; 4.6 icônes ; 4.7-4.8 `robots.txt` et `sitemap.xml` ; 4.9 `alt` ; 4.10 360 px ; 4.14 confirmation d'envoi sans JavaScript ; 4.19 contact en clair ; 4.20 poids et format des images ; 5.1 aucune clé ; 5.4 formulaire : champ piège et délai minimal.
- **Par relecture de Harun** (≈ 30, consignés dans `revue.json`) : tout ce qui juge le sens ou le goût — 1.2, 1.4-1.8 (style d'écriture), 2.3-2.4 (photos, avis), 2.15 (chiffres sourcés), 2.17 (h1), 3.2, 3.5, 3.6, 3.9-3.11, 3.13-3.15, 3.22, 3.24, 4.11-4.13, 4.15-4.18. Les points de la section 5 qui supposent des comptes ou une base ne concernent pas un modèle statique.
- **Deux conflits avec le plan, à trancher** : les sections *témoignages* et *tarifs* citées au plan frôlent les signes **2.4** (faux témoignage) et **3.13** (trois paliers, celui du milieu en avant). Proposition : un modèle ne livre jamais d'avis inventé (la section est une **place à remplir**, marquée `data-a-remplir` et décrite dans le manifeste) et le nombre de colonnes des offres suit le contenu.

### 7.3 `revue.json`
`{ "relecture": { "par": "Harun", "le": "AAAA-MM-JJ", "points_ouverts": [] }, "signes": { "manuels_verifies": ["1.2", …], "echecs": [] }, "porte": { "statique": "ok", "rendu": "ok", "outils": { "axe-core": "4.x", "lighthouse": "13.x" } } }`. `check:modeles` vérifie la présence, la cohérence (aucun échec, relecture postérieure à la dernière modification des sources, par empreinte) ; **il ne juge pas** la relecture.

## 8. Dépendances et licences

Registre npm consulté le 14 nov. ; licences lues dans `package.json` de chaque paquet. **Mesuré** sur une installation jetable (hors dépôt) : 139 paquets MIT, 13 Apache-2.0, 7 BlueOak-1.0.0, 7 ISC, 6 BSD-3-Clause, 2 BSD-2-Clause, 2 MPL-2.0, 1 0BSD, 1 `(MIT OR CC0-1.0)` et **1 FSL-1.1-Apache-2.0**.

| Paquet | Version | Licence | Où | Rôle |
|---|---|---|---|---|
| `prettier` | 3.10.1 | MIT | exécution (chargement à la demande) | mise en forme HTML/CSS/JS |
| `shiki` | 4.6.0 | MIT | exécution (à la demande) | coloration |
| `@tanstack/react-virtual` | 3.14.26 | MIT | exécution | grille virtualisée |
| `fflate` | à fixer | MIT (**à confirmer**, non lu) | exécution (à la demande) | archive `.zip` |
| `axe-core`, `@axe-core/playwright` | 4.14.0 | **MPL-2.0** | développement | accessibilité ; fichier **non modifié**, jamais lié à l'application |
| `lighthouse` | **≤ 13.3.x** | Apache-2.0 | développement | performance, SEO |
| `html-validate` | 11.21.1 | MIT | développement | règles statiques du HTML |
| `pixelmatch`, `pngjs` | 8.0.0, 7.0.0 | ISC, MIT | développement | tolérance de comparaison des vignettes et des composants |
| `playwright-core` | déjà ^1.62.1 | Apache-2.0 | développement | capture, rendu |

**Le piège** : `lighthouse@13.6.0` dépend de `@sentry/node@11` → `@sentry/bundler-plugins` → `sentry@0.49.0`, sous licence **FSL-1.1-Apache-2.0** (source disponible, usage concurrent restreint, ne devient Apache qu'après deux ans) : ce n'est pas une licence ouverte au sens du plan. Les versions 12.8 à 13.3 dépendent de `@sentry/node@9` (sans ce paquet). **Proposition** : épingler `lighthouse` exactement à une 13.3.x, ajouter l'exception au futur `check:licences` de T1 seulement si la FSL est un jour acceptée, et relire l'arbre complet à l'installation (**à vérifier** : l'arbre de 13.3 n'a pas été installé ici). Lighthouse n'est qu'un outil de développement, jamais distribué.

`package.json` et `package-lock.json` sont des fichiers sensibles : **ajouts seulement, signalés au rapport**. Aucun ajout avant l'étape 2.

## 9. Ce qui a été essayé pour cette note (jetable, hors dépôt)
1. **Isolation** : trois cadres `srcdoc` dans Chromium (`""`, `allow-same-origin`, `allow-scripts`) → §4.3.
2. **Taille et vitesse** de Prettier et de Shiki, regroupés par esbuild → §5.5.
3. **Licences** de 8 paquets (registre) et de l'arbre de 12 paquets installés → §8.
4. **Lecture de l'existant** : `ModelesDeSites.tsx`, `modeles.ts`, `GrilleCartes`, `Scinde`, le catalogue des briques du socle.

Aucun de ces essais ne laisse de fichier dans le dépôt.

## 10. Plan des deux modèles pilotes

### 10.1 Pourquoi des pilotes écrits ici
La liste des sites d'AMN viendra de Harun ; en attendant, la chaîne (manifeste → index → capture → porte → bibliothèque → inspecteur → copies) ne peut pas rester sans cobaye. Les deux pilotes sont **originaux**, au contenu fictif et visiblement fictif (`origine.pilote: true`, nom d'entreprise inventé, aucun chiffre, aucun avis), au **vouvoiement**. Ils ne sont pas relus par Harun et **n'entrent pas dans la bibliothèque livrée** : l'index les range sous « pilote » et la porte les marque.

| | Pilote A | Pilote B |
|---|---|---|
| Rôle | multi-pages | une page, sombre |
| Secteur / type | artisan · vitrine | portfolio · une page |
| Style | clair, chaleureux | sombre, sobre (sans lueur : signe 3.23) |
| Pages | accueil, prestations, contact (avec formulaire : champ piège, délai minimal, page de confirmation), mentions légales, confidentialité, 404 | une page + 404 + mentions |
| Sections déclarées | en-tête, héros, prestations, galerie, FAQ, formulaire, pied | en-tête, héros, projets, contact, pied |
| Composants déclarés | bouton, carte, menu (sans JavaScript, `<details>`), champ, lien d'évitement | bouton, carte de projet, champ |
| Ce qu'il éprouve | liens internes dans le cadre, `@media`, polices OFL empaquetées, images WebP et `srcset`, menu sans script | une seule page, thème sombre sans blanc pur, très peu de ressources |

### 10.2 Critères de réussite des pilotes
- la porte statique et la porte de rendu **passent** (0 signe automatique, 0 violation critique ou sérieuse, aucun débordement à 360/390/768/1280, contenu complet sans JavaScript, Lighthouse dans les seuils) ;
- l'index, la vignette (< 40 Ko) et son empreinte se régénèrent **à l'identique** (hors octets de l'image) ;
- les **trois copies** : l'archive se décompresse et s'ouvre ; la section collée seule rend comme dans la page ; le composant collé seul rend comme son découpage dans la page (tolérance) ;
- l'aperçu et l'inspecteur marchent **à la souris et au clavier seul** ; le survol nomme la section ou le composant ;
- **mesures** relevées pour décider : poids du paquet interne avec 2 modèles (§4.1), temps de Prettier + Shiki sur la plus grosse page, chargement paresseux effectif (aucune vignette hors fenêtre demandée).

### 10.3 Contrôles négatifs et jeu de charge
- `scripts/modeles/mauvais/` : de petits sites **faits pour échouer** — un par signe mécanique et par règle (un tiret cadratin, un dégradé violet-bleu, un lien mort, une image de 400 Ko, un `jQuery`, un contraste raté…). `check:modeles` doit les refuser **chacun pour sa raison** : c'est la preuve que la porte rougit quand elle doit (même méthode que `check:journee`, vérifiée par mutation).
- `scripts/modeles/jeu-de-charge.ts` : 120 entrées d'index fabriquées à partir des pilotes (métadonnées variées, vignettes en aplat) pour éprouver la grille virtualisée, la recherche et les facettes à 100+ ; jamais livré.

## 11. Décisions et questions

**Au CO**
1. **Numéro** : « LOT-14 » existe déjà dans `STATUT.md` §2 (Charge et essais longs). Renuméroter l'un des deux ?
2. **Emplacement et poids** : racine `modeles/` hors de `src/`, vignettes WebP committées, 100 à 150 Mo à terme dans un dépôt public. Accord ? Seuil à partir duquel on sort les ressources vers le serveur maison ?
4. **Dépendances** (ajouts à `package.json` à l'étape 2) : celles du §8, Lighthouse épinglé. T1 : `check:licences` doit lire l'arbre complet et signaler la FSL.
5. **Socle** : grille virtualisée et cadre isolé écrits dans la zone du lot, promotion plus tard (§6).
6. **Moments et collection** : la collection de l'atelier a besoin de deux moments du bus (un modèle *allumé*, un palier collectif) et d'un stockage **collectif** (jamais par personne) ; sans amn-api, un stockage local au poste. Données fictives à commander à SIM (usages des sections et composants).
8. **Zone** : `src/refonte/modeles/`, `scripts/modeles/`, `modeles/`.
9. **Textes** : périmètre de `check:tutoiement` étendu à `src/refonte/modeles` seulement ; le dossier `modeles/` (contenu de sites clients) reste au vouvoiement.
10. **Reprise de la route** de `devModelesSites` sans toucher au fichier de S8 (substitution ou déclaration à reprendre ?). Question posée à S8, réponse attendue.

**À Harun** (via le CO)
3. **Aperçu sans JavaScript** (option A, recommandée) ou démos interactives (option B, plus lourde) ? Dans les deux cas, un modèle doit marcher sans script.
7. **Seuils Lighthouse**, **vocabulaire** des styles, **sections témoignages et tarifs** (§7.2), **liste des sites** d'AMN et accord écrit des clients concernés.

## 12. Étapes suivantes (au feu vert du CO)

| Étape | Contenu | Sortie |
|---|---|---|
| 2 | schéma et validateur du manifeste, vocabulaire, indexeur, capture, porte statique, `check:modeles` + contrôles négatifs, **pilote A** | `check:modeles` vert, ajouté à `editions.yml` |
| 3 | porte de rendu (`check:modeles:rendu`), **pilote B**, mesures du §10.2 | rapport de mesures ; décisions §11 n° 3 et 7 confirmées ou changées |
| 4 | écran MOD-bibliotheque : grille virtualisée, recherche, facettes | aperçu pour Harun |
| 5 | écran MOD-fiche : cadre isolé, arbre, inspecteur, Prettier + Shiki, trois copies | aperçu pour Harun ; clavier relevé par T1 |
| 6 | MOD-collection et ludique collectif (après la décision §11 n° 6) | aperçu |

## 13. Ce qui n'a pas été vérifié
- **Électron** : l'isolation et les `blob:` n'ont été éprouvés que dans le Chromium de Playwright, pas sous Electron (`npm start` interdit). À contrôler au `build:web` local puis par Harun.
- **Le thème « variables » de Shiki**, la lecture de `@layer`/`@container` par l'API des feuilles de style, et le rendu d'un composant copié seul : décrits, non essayés.
- **L'arbre complet** de `lighthouse@13.3.x` (licences) : non installé.
- **La licence de `fflate`** : non lue.
- **La part des 94 signes qui se vérifie par programme** (≈ 60) est une estimation faite en lisant la liste, pas un décompte de contrôles écrits.
- **Aucun fichier de l'application n'a été modifié** ; aucune garde n'a tourné, car rien de partagé n'a été touché (note seule).

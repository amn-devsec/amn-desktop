# DEV-modeles-sites · Modèles de sites (et sa vue code)
Développement · LOT-11 · Images : `images/DEV-modeles-sites.png` (bibliothèque), `images/DEV-modeles-sites-code.png` (fiche d'un modèle, vue code) · Prototype : `sources-neon/DEV-modeles-sites.html` · Statut : NOUVEAU
Parcours : Développement / Modèles de sites (l'image et le prototype disent « Créer et produire / Modèles de sites » ; famille Développement décidée par le CO, voir §13)

> Règles communes de l'espace : [`00-COMMUN.md`](00-COMMUN.md).

## 1. Rôle
Une **bibliothèque de sites complets, prêts à copier** : on cherche par secteur ou par style, on ouvre un modèle, on **regarde le site en direct** (ordinateur ou téléphone), puis on **prend le code en un clic**. L'équipe peut **ajouter ses propres modèles**. C'est le point de départ d'un site client ou d'un nouveau projet de code.

## 2. Nouveau ou re-habillage ?
- **Nouveau (à créer)** : tout l'écran. Le prototype `sources-neon/DEV-modeles-sites.html` est **fonctionnel** (recherche, puces, grille d'aperçus réels, fiche Aperçu / Code, copie, ajout) : sa **logique et ses textes** font foi ; son **habillage** est celui de la v3 (gris, sa propre barre latérale de 240 px) et doit passer au néon v4 dans la coquille d'AMN Business.
- **Existant voisin, à ne pas confondre** : MR02 Ma page publique (`MiniSiteScreen`, page de l'organisation), le Studio (`src/bureaux/studio/`, sites des clients en cours), L04 Galerie de modèles par métier (LOT-07, modèles de documents et de recettes). Aucun ne fournit de modèles de sites.
- **Lien** : « Nouveau projet » de DEV-projets peut partir d'un modèle (*Proposition*).
- Aucun connecteur requis : tout se fait sur le poste.

## 3. Disposition par zones
**Bibliothèque** (image `DEV-modeles-sites.png`, prototype). L'image montre la coquille du prototype (barre de 240 px, marge 28) ; dans AMN Business, la page prend la zone principale standard (x = 0 au px 252, contenu de 1108 de large à x = 40). Cotes du prototype, à garder :
- **Z1 En-tête** : fil d'Ariane 13 px ; h1 « Modèles de sites » 30 px (v4 : 700, dégradé `#FFF → b`) ; sous-titre T3, largeur max 60 caractères, sur deux lignes ; à droite **primaire** « + Ajouter un modèle », aligné en bas sur le sous-titre.
- **Z2 Outils** : champ de recherche (icône loupe, hauteur ≈ 40, largeur 240 à **360** px max, bordure 1 px, rayon 8) puis les puces de secteur (12.5 px, rayon 99, padding 5 × 12 ; compteur monospace 11.5 px à 65 % ; puce active pleine), retour à la ligne si besoin. Écart 10, marge basse 18.
- **Z3 Compte** : « 8 modèles » 12.5 px T4, marge basse 12.
- **Z4 Grille** : `repeat(auto-fill, minmax(290px, 1fr))`, écart 16 ; dans 1108 px : **3 colonnes de ≈ 359 px**. Tuile : rayon 12, bordure 1 px ; **aperçu au format 16:10** (le site réel rendu à 1280 × 800 puis réduit à la largeur de la tuile) ; pied (padding 12 / 14 / 14) : nom 14.5 px / 600 et poids monospace 11.5 px à droite ; étiquettes (11.5 px, bordure, rayon 5) et secteur monospace à droite. Survol : bordure plus claire, relèvement de 2 px (150 ms).
- **Barre latérale** : famille Développement, module actif « Modèles de sites » (compteur « 8 » de l'image : *Proposition*, le compte des modèles, comme l'entrée du prototype).

**Fiche d'un modèle** (image `DEV-modeles-sites-code.png`) : plein écran au-dessus de la page (prototype : `.sheet`, fixe, z 50).
- **Barre du haut** (≈ 64 px, filet bas) : « ← Retour » (secondaire) ; titre 15 px / 600 et méta monospace (« secteur · n lignes · n Ko ») ; à droite le segment « Aperçu | Code », en aperçu seulement le segment « Ordinateur | Téléphone », puis **primaire** « Copier le code ».
- **Aperçu** : le site dans un cadre isolé pleine hauteur ; en « Téléphone », cadre de 390 px de large centré, rayon 14, marge 16.
- **Code** : barre d'information (monospace « n lignes · n Ko » + phrase), puis le code : gouttière des numéros de ligne (alignés à droite, fixe au défilement horizontal), code monospace **12.5 px / 1.65**, coloration : balises info, attributs orange, valeurs succès, commentaires gris.

**Dialogue « Ajouter un modèle »** : 760 px de large au plus, rayon 14, padding 22 ; titre 19 px ; consigne ; deux champs côte à côte (« Nom », « Secteur » avec liste des secteurs existants) ; « Code HTML » (zone monospace, 220 px de haut au moins) ; « Annuler » et **« Enregistrer »** à droite.

## 4. Contenu affiché (textes exacts, passés au tutoiement)
Le prototype vouvoie : les textes ci-dessous sont **passés au tutoiement** (06 §4). Le **contenu des modèles** (les pages des sites) reste tel quel, au vouvoiement : ce sont des pages destinées aux clients.

**Bibliothèque**
- Fil d'Ariane : « Développement / Modèles de sites » (décision du CO, voir §13).
- h1 : « Modèles de sites ».
- Sous-titre : « Chaque modèle est une page complète, prête à copier. Ouvre-en un, regarde le site, puis prends le code d'un clic. » (prototype : « Ouvrez-en un, regardez le site, puis prenez le code d'un clic. »)
- Bouton : « + Ajouter un modèle ».
- Recherche : texte indicatif « Chercher un modèle, un secteur, un style » ; nom accessible « Chercher un modèle ».
- Puces : « Tous 8 » · « Artisan 1 » · « Automobile 1 » · « Beauté 1 » · « Bien-être 1 » · « Commerce local 1 » · « Portfolio 1 » · « Restauration 1 » · « Services B2B 1 ».
- Compte : « 8 modèles » (« 1 modèle » au singulier).
- Aucun résultat : « Aucun modèle ne correspond. Essaie un autre mot, ou ajoute le tien. » (prototype : « Essayez un autre mot, ou ajoutez le vôtre. »)
- Tuile en attente d'aperçu : « chargement ». Nom accessible d'une tuile : « Ouvrir <nom> ».

**Les 8 modèles livrés** (contenu fictif du prototype)
| Nom | Secteur | Étiquettes | Poids (image) |
|---|---|---|---|
| Optique Lumière | Commerce local | Serif · Clair · Boutique | 3,9 Ko |
| Atelier Marceau | Artisan | Sombre · Mobilier · Sobre | 4,1 Ko |
| La Table de Marcel | Restauration | Chaud · Menu · Réservation | 3,9 Ko |
| Prestige Drive | Automobile | Sombre · Location · Premium | 4,3 Ko |
| Veillance | Services B2B | Cybersécurité · Sombre · Prix clairs | 4,5 Ko |
| Lina Bardet | Portfolio | Minimal · Clair · Développeuse | 3,1 Ko |
| Maison Karim | Beauté | Barbier · Sombre · Réservation | (hors image) |
| Studio Souffle | Bien-être | Pilates · Clair · Planning | (hors image) |
Un modèle ajouté par l'équipe porte l'étiquette « Ajouté » (orange).

**Fiche d'un modèle**
- « ← Retour » · nom (ex. « Veillance ») · méta « Services B2B · 61 lignes · 4,5 Ko ».
- Segments : « Aperçu » | « Code » ; en aperçu : « Ordinateur » | « Téléphone ».
- « Copier le code ».
- Barre d'information du code : « 61 lignes · 4,5 Ko » · « Un seul fichier HTML, sans dépendance. Colle-le dans un fichier index.html et ouvre-le. » (prototype : « Collez-le … et ouvrez-le. »)
- Nom accessible du cadre d'aperçu : « Aperçu du modèle ».
- Messages : « Code copié (61 lignes) » ; si la copie automatique est refusée : « Sélectionné : fais Ctrl+C » (prototype : « faites »).

**Dialogue d'ajout**
- « Ajouter un modèle » · « Colle le code complet d'une page. Il reste sur cet ordinateur. » (prototype : « Collez le code complet d'une page. Il reste dans ce navigateur, sur cet ordinateur. » ; « navigateur » retiré : dans AMN Business, le modèle est gardé par l'application, sur le poste) · « Nom » (indicatif « Ex. Garage Dumont ») · « Secteur » (indicatif « Ex. Artisan ») · « Code HTML » (indicatif « <!doctype html> ... ») · « Annuler » · « Enregistrer ».
- Messages : « Modèle ajouté » ; si l'enregistrement local échoue : « Ajouté pour cette session seulement ».

## 5. Composants du socle utilisés
`Sidebar`, `Header`, `PageHead`, `BoiteRecherche`, `FilterChips` (puces avec compteur), `Tag`, `Card`, `Segmente` (Aperçu / Code, Ordinateur / Téléphone), `Bouton`, `Modale`, `Saisie`, `useToastsSocle`, `EtatVide`, `AjmaniBar`.
**Nouveaux composants** (lot) :
- `TuileModele` : aperçu réduit (cadre isolé, chargé quand la tuile approche de l'écran) + pied (nom, poids, étiquettes, secteur).
- `FicheModele` : plein écran, barre du haut, aperçu ou code.
- `VueCode` : gouttière + code coloré, sélection et copie ; lecture seule.
- `DialogueAjoutModele`.

## 6. Données et règles de calcul
- **Modèle** : identifiant, nom, secteur, étiquettes (3 au plus), code HTML complet (un seul fichier, aucune ressource externe), origine (`livré` ou `ajouté`), date d'ajout et auteur pour un modèle ajouté.
- **Modèles livrés** : *Proposition* : un fichier HTML par modèle dans un dossier de contenu du lot, lus par un catalogue (jamais écrits dans un composant). Leur texte est **relu par Harun avant leur entrée dans l'application** (contenu public, au vouvoiement) ; cette relecture ne bloque pas la construction de l'écran (décision de Harun, 12 nov.). Ils ne chargent rien de l'extérieur (vérifié par la garde du lot, *Proposition*).
- **Modèles ajoutés** (décision de Harun, 12 nov.) : gardés **sur ce poste** pour l'instant (« Il reste sur cet ordinateur. »). **Évolution prévue** : les partager avec l'équipe ; cela demande le serveur (LOT-13, reporté) et changera la phrase du dialogue.
- **Puces** : « Tous » + un secteur par valeur distincte, triés par ordre alphabétique (français), avec leur compte ; un secteur ajouté apparaît seul.
- **Recherche** : chaque mot tapé (séparé par des espaces) doit se trouver dans « nom + secteur + étiquettes », sans tenir compte des majuscules (*Proposition* : ni des accents). Combinée à la puce active.
- **Compte** : « n modèles » / « 1 modèle » après filtre.
- **Poids** = taille du code en octets / 1024, une décimale, virgule française (« 4,5 Ko »). **Lignes** = nombre de lignes du code.
- **Aperçu** : le code est affiché dans un **cadre isolé, scripts coupés**, sans accès à l'application ni au réseau de l'application ; jamais inséré dans la page de l'application.
- **Ajout** : nom (50 caractères au plus), secteur (30 au plus) et code requis ; refusé s'il est vide.

## 7. Interactions
- Puce : filtre ; recherche : filtre à la frappe.
- Clic (ou Entrée) sur une tuile : ouvre la fiche en « Aperçu », « Ordinateur » ; le focus va sur « ← Retour ».
- « Aperçu » / « Code » : bascule ; « Ordinateur » / « Téléphone » : largeur du cadre (en aperçu seulement).
- **« Copier le code »** : copie tout le code ; message « Code copié (n lignes) ». Si le presse-papiers est refusé : passe en vue Code, sélectionne le code et dit « Sélectionné : fais Ctrl+C ».
- « ← Retour » ou Échap : ferme la fiche (et le dialogue d'abord s'il est ouvert).
- « + Ajouter un modèle » : ouvre le dialogue ; clic hors du dialogue ou « Annuler » : ferme ; « Enregistrer » : ajoute, revient sur « Tous », message « Modèle ajouté ».
- *Proposition* : « Supprimer » sur un modèle ajouté (menu de la fiche), avec annulation en une ligne ; un modèle livré ne se supprime pas.
- **Mouvement** : entrée échelonnée des tuiles, aperçus en fondu à leur chargement ; aucune animation continue. `prefers-reduced-motion` coupe les transitions.

## 8. États
- **Aucun résultat** : la phrase d'état vide sur toute la largeur de la grille (bordure en pointillé, rayon 12, padding 40).
- **Aperçu en chargement** : « chargement » centré dans la tuile.
- **Bibliothèque vide** (aucun modèle livré ni ajouté, cas d'essai) : `EtatVide` « Aucun modèle pour l'instant » + « Ajouter un modèle ».
- **Code invalide à l'ajout** : le dialogue ne se ferme pas ; le champ fautif est signalé (« Ajoute le code complet de la page »).
- **Stockage local indisponible** : l'ajout vaut pour la session, message « Ajouté pour cette session seulement ».
- **Droits** : tout le monde peut voir et copier ; *Proposition* : l'ajout est ouvert à tous les membres (c'est local au poste).

## 9. Éléments ludiques
Sans objet (bibliothèque d'outils). Ce qu'on ne fait pas : pas de « modèle le plus copié », pas de classement.

## 10. Ajmani
- Pas de suggestion sur l'image. *Proposition* : barre ⌘J : « Trouve un modèle sombre pour un garage », « Ouvre le modèle Veillance en code », « Crée un projet à partir d'Atelier Marceau ».
- Ajmani ne génère pas de modèle sans qu'on le demande ; un modèle généré arriverait comme un modèle « Ajouté », à relire.

## 11. Adaptation (fenêtre réduite, mobile)
- La grille est fluide (`minmax(290px, 1fr)`) : 3 colonnes à 1440, 2 puis 1 en dessous.
- Sous 820 px (prototype) : la barre du haut de la fiche passe sur deux lignes ; « Téléphone » prend toute la largeur ; le dialogue empile ses deux champs.
- Mobile (LOT-09) : **lecture seule** (décision de Harun, 12 nov.) : consultation, aperçu et copie du code ; pas d'ajout de modèle depuis le téléphone.

## 12. Critères de réussite
- [ ] Même comportement que le prototype `sources-neon/DEV-modeles-sites.html` (recherche, puces, compte, fiche, copie, repli de copie, ajout, Échap).
- [ ] Habillage néon v4 dans la coquille d'AMN Business ; cotes de grille et de tuile du prototype gardées ; écart d'habillage noté dans `STATUT.md`.
- [ ] Textes au tutoiement (§4) ; contenu des modèles au vouvoiement, inchangé.
- [ ] Aperçu toujours dans un cadre isolé, scripts coupés ; aucun modèle ne charge de ressource externe.
- [ ] Aucun modèle écrit en dur dans un composant ; les modèles livrés viennent du catalogue.
- [ ] Un seul bouton primaire par vue (« + Ajouter un modèle », puis « Copier le code »).
- [ ] `typecheck`, `lint`, `check:socle`, `check:developpement` verts.

## 13. Pièges
- **Parcours** : l'image et le prototype disent « Créer et produire / Modèles de sites » et montrent une barre latérale de prototype (CRÉER ET PRODUIRE, OUTILS ET RÉGLAGES) ; `07-ESPACE-DEV.md` place le module dans Développement. **Décision du CO** (`STATUT.md` §1.17 n° 3) : famille Développement, avec une seconde entrée possible dans Créer et produire (précédent MO02 / CY07).
- **Style** : l'image est en v3 (gris) ; 06 §3 s'applique (néon, couleurs de la famille Développement).
- Le prototype vouvoie l'interface : tutoyer l'interface, pas les modèles.
- Les noms des modèles (Optique Lumière, Veillance…) sont fictifs ; « Veillance » vend des services de cybersécurité : contenu marketing, à relire, sans aucune donnée réelle.
- Un modèle ajouté vient d'un collage : ne jamais l'afficher hors du cadre isolé.

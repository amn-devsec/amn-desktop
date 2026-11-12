# DEV-couts · Coûts et API
Développement · LOT-11 · Image : `images/DEV-couts.png` · Statut : NOUVEAU
Parcours : Développement / Coûts et API

> Règles communes de l'espace : [`00-COMMUN.md`](00-COMMUN.md). **Lit le modèle des connecteurs de LOT-12 (S9)** ; ne le redéfinit pas.

## 1. Rôle
Voir **ce que l'application fait seule** (gratuit, en local) et **ce qui coûte** (API payantes), connecteur par connecteur ; tenir un **plafond mensuel** qui arrête tout ce qui est payant quand il est atteint ; décider en un clic de passer un outil en payant ou de le garder en local, **coût affiché avant**.

## 2. Nouveau ou re-habillage ?
- **Nouveau (à créer)** : tout l'écran : part faite en local (anneau), payé ce mois et plafond, économie estimée, historique de 6 mois, tableau des connecteurs (mode, coût du mois, consommation), « Plafond et alertes », suggestion d'Ajmani, « À brancher plus tard », « Brancher un outil ».
- **Existant réutilisé** : la liste et l'état des connecteurs viennent de **H21 Connecteurs** (LOT-07 ; jeu fictif `connecteurs`, type `Connecteur` : nom, état, dernière synchro, sans aucune clé) ; l'assistant Ajmani local (Ollama, Whisper) existe déjà (`OllamaSection`, `WhisperSection`, `@edition/exclusive`).
- **Dépend** : du **modèle de LOT-12** (catalogue, mode Local / API, état, **coût avec tarif, source et date de relevé**, compteurs de consommation, plafond). Sans ce modèle, l'écran ne peut afficher que l'état des connecteurs de H21. *À confirmer* : où se mesure la consommation (envois, événements, paiements, SMS) — côté poste ou côté amn-api.

## 3. Disposition par zones
Coordonnées relatives à la zone principale, relevées sur l'image, à ± 2 px.
- **Z1 En-tête de page** : h1 « Coûts et API », sous-titre ; un seul bouton, **primaire** « Brancher un outil » (icône +), 36 px, y = 44.
- **Z2 Bandeau** : carte **1108 × 165** à (40, 97), trois parties :
  - à gauche, anneau de **128 px** (épaisseur 12 ; arc succès pour la part locale, arc orange pour le payant, avec lueur), « 82 % » 26 px / 700 et « fait seul » 12 px T3 au centre ; légende à droite de l'anneau (point succès « Local, gratuit », point orange « API payantes ») ;
  - au centre (x ≈ 301), libellé capitales « PAYÉ CE MOIS », montant **≈ 52 px / 700** en dégradé `#FFF → b` + « sur un plafond de 40 € » 13.5 px T3, pastille succès « 82 € économisés ce mois », phrase 12.5 px T3 ;
  - à droite (x ≈ 833), libellé capitales « PAYÉ, SUR 6 MOIS », 6 barres de ≈ 36 px (écart ≈ 6, hauteur max ≈ 80), la dernière (mois en cours) en succès, les autres en dégradé `a` ; repères « juin » et « nov. » 11 px T4.
- **Z3 Tableau des connecteurs** : carte **732 × 480** à (40, 278). Titre 15 px / 600 + « 7 connecteurs » à droite. En-têtes capitales 11 px T4 : CONNECTEUR (x + 81), MODE (x + 247), CE MOIS (x + 371), CONSOMMATION (x + 535). 7 lignes de **49 px** séparées par un filet : tuile d'icône 32 px teintée, nom 14 px / 600, pastille de mode, coût 13.5 px, consommation 12.5 px T3 au-dessus d'une barre de 4 px (≈ 170 px).
- **Z4 Colonne droite** (x = 788, largeur 360) : « Plafond et alertes » **360 × 167** à (788, 278) — anneau de 96 px (« 14 € » / « sur 40 € » au centre), deux lignes libellé / valeur à droite ; suggestion d'Ajmani **360 × ≈ 139** à (788, ≈ 459) ; « À brancher plus tard » **360 × 146** à (788, 612) — 2 lignes (tuile 26 px, nom 13.5 px, mode 12 px T4 à droite).
- **Z5 Barre Ajmani** : standard.
- **Barre latérale** : famille Développement, module actif « Coûts et API ».

## 4. Contenu affiché (textes exacts)
**En-tête** : « Coûts et API » · « 14 € payés ce mois · 5 connecteurs sur 7 tournent gratuitement » (les deux comptes sont **calculés**, voir §6) · « Brancher un outil ».

**Bandeau** : « 82 % » « fait seul » · « Local, gratuit » · « API payantes » · « PAYÉ CE MOIS » · « 14 € » · « sur un plafond de 40 € » · « 82 € économisés ce mois » · « Tout en API payantes, ce mois coûterait environ 96 €. » · « PAYÉ, SUR 6 MOIS » · « juin » · « nov. ».

**Tableau** : « Ce que l'application fait seule, et ce qui coûte » · « 7 connecteurs » · colonnes « CONNECTEUR », « MODE », « CE MOIS », « CONSOMMATION ».
| Connecteur | Mode | Ce mois | Consommation | Barre |
|---|---|---|---|---|
| Courriels (Gmail) | Local | 0 € | 412 envois | info, courte |
| Agenda | Local | 0 € | 96 événements | vide |
| Paiements (Stripe) | Payant | commission seule | 18 paiements | orange, courte |
| Courriels en masse | Local | 0 € | 220 sur 500 | succès, 44 % |
| SMS | Payant | 14 € ce mois | 180 sur 250 inclus | orange, 72 % |
| Messages WhatsApp | À brancher | — | non branché | vide |
| Assistant Ajmani | Local | 0 € | à la demande | violet, courte |
Pastilles : « Local » (succès), « Payant » (orange), « À brancher » (gris).

**Plafond et alertes** : « Plafond et alertes » · « 14 € » « sur 40 € » · « Prévenir à » « 80 % » · « Au plafond » « Tout s'arrête ».

**Suggestion d'Ajmani** : « Les SMS atteignent 72 % de ton forfait. Je te préviens avant la fin du mois, ou tu préfères payer au-delà du forfait ? » (l'image dit « passer en payant », reformulé par Harun le 12 nov.) · « Me prévenir ».

**À brancher plus tard** : « À brancher plus tard » · « Signature électronique » « payant » · « Export comptable » « local ».

## 5. Composants du socle utilisés
`Sidebar`, `Header`, `PageHead`, `Card`, `Donut` (anneau à deux arcs), `Anneau` (plafond), `Barres` (6 mois), `BarreProgression` (4 px), `IconTile`, `StatusPill`, `Suggestion`, `AjmaniBar`, `DialogueConfirmation`.
**Nouveaux composants** (lot) :
- `PartLocale` : donut à deux arcs + légende.
- `LigneConnecteurCout` : tuile, nom, pastille de mode, coût du mois, consommation avec barre.
- `CartePlafond` : anneau du payé / plafond, seuil d'alerte, comportement au plafond.

## 6. Données et règles de calcul
Toutes les valeurs viennent du modèle de LOT-12. Les règles ci-dessous sont des **propositions** à aligner avec S9.
- **Connecteur** (LOT-12) : catégorie, nom, mode (`local` / `api`), état (connecté, à connecter, arrêté), modèle de coût (gratuit, forfait avec quantité incluse, à l'usage, commission), tarif avec **source et date de relevé**, compteur de consommation du mois, limite éventuelle. **Aucune clé**, même masquée.
- **Payé ce mois** = somme des coûts facturés du mois des connecteurs en mode API. Les **commissions** prélevées sur un paiement (Stripe) ne s'y ajoutent pas : elles sont déjà retenues sur l'encaissement et visibles dans L'argent ; la ligne affiche « commission seule ».
- **Part faite seul** = opérations du mois exécutées en local / toutes les opérations du mois, arrondie à l'entier. *À confirmer* : la définition d'une « opération » par connecteur (un envoi, un événement, un paiement, une demande à l'assistant).
- **Coût « tout en API »** = pour chaque connecteur, consommation du mois × tarif de son équivalent API (catalogue de LOT-12) ; « environ » et arrondi à l'euro. **Économisé** = coût « tout en API » − payé (ici 96 − 14 = 82). Si un tarif manque, pas d'estimation : la phrase et la pastille disparaissent (jamais un chiffre deviné).
- **« n connecteurs sur m tournent gratuitement »** : **calculé depuis les connecteurs réels, jamais repris de l'image** (décision du CO, `STATUT.md` §1.17 n° 5 ; 04-A n° 1). n = connecteurs branchés en mode local ; m = connecteurs du tableau. Sur les données de l'image, cela donne « 4 sur 7 », pas « 5 sur 7 ».
- **Consommation** : « n envois », « n événements », « n paiements » (compteurs du mois) ; « n sur m » quand le connecteur a une limite (quota de la boîte d'envoi, forfait inclus) ; barre = n / m. « à la demande » pour l'assistant local (pas de compteur utile).
- **Plafond** (décision de Harun, 12 nov.) : réglage mensuel en euros, **sans valeur imposée** : le montant est **demandé au premier branchement d'un outil payant** (étape du parcours de H21, avant l'activation). Les « 40 € » de l'image sont un exemple. **Prévenir à** = seuil en % du plafond (**80 %**, réglable), une notification H40 une fois par mois. **Au plafond** = tous les connecteurs en mode API passent à « arrêté » jusqu'au 1er du mois suivant ; ceux qui ont une version locale y repassent, les autres attendent. « Tout s'arrête » = tout ce qui est payant.
- **Payé sur 6 mois** = payé par mois civil, du plus ancien au mois en cours (en succès).
- **À brancher plus tard** = catalogue de LOT-12, catégories encore non branchées, avec le mode disponible (« local » s'il existe une version gratuite, sinon « payant »).

## 7. Interactions
- **« Brancher un outil »** : ouvre le catalogue de LOT-12 dans H21, filtré sur ce qui n'est pas branché ; pour un outil payant, **coût affiché avant** et rappel du plafond ; trois clics au plus jusqu'à l'activation. Aucune clé saisie ici : l'autorisation se fait chez le fournisseur ou dans le Coffre-fort (H24).
- Clic sur une pastille de mode : bascule Local ↔ API avec confirmation en une ligne qui donne le coût (« Passer les SMS en payant : environ 0,07 € par message, tarif relevé le … » — exemple de forme, jamais de chiffre inventé). Un connecteur sans version locale n'a pas la bascule.
- Clic sur une ligne : ouvre le connecteur dans H21.
- Clic sur l'anneau du plafond ou sur « Prévenir à » : réglage du plafond et du seuil (deux champs, « Enregistrer »).
- **« Me prévenir »** : pose une alerte au seuil choisi pour ce connecteur ; la suggestion disparaît.
- Clic sur « À brancher plus tard » : parcours de branchement de H21 pour cet outil.
- **Mouvement** : arcs tracés depuis 0, barres qui poussent, barres de consommation remplies (900 ms). Aucune animation continue hors curseur de la barre Ajmani. `prefers-reduced-motion` coupe tout.

## 8. États
- **Tout en local** (aucun connecteur payant) : « 0 € payés ce mois », anneau 100 % « fait seul », la carte du plafond dit « Aucun outil payant : rien à plafonner. » ; pas de suggestion. Aucun plafond n'est demandé tant qu'aucun outil payant n'est branché.
- **Seuil atteint** : anneau du plafond en attention, pastille « 80 % du plafond atteint ».
- **Plafond atteint** : anneau plein en attention, bandeau « Le plafond de 40 € est atteint : les outils payants sont arrêtés jusqu'au 1er. » + « Relever le plafond » (avec confirmation) ; les lignes payantes passent « arrêté ».
- **Tarif inconnu** : la ligne affiche « tarif à relever » et l'économie n'est pas calculée.
- **Modèle de LOT-12 absent** (cas actuel) : l'écran affiche la liste de H21 avec l'état seul et la phrase « Les coûts arrivent avec le catalogue des connecteurs. ».
- **Chargement** : squelettes. **Erreur** : bandeau « Les coûts n'ont pas pu être chargés. » + « Réessayer ». **Hors ligne** : dernières valeurs, datées.
- **Droits** : sans droit d'administration, tout en lecture, sans bascule de mode, plafond ni « Brancher un outil ».

## 9. Éléments ludiques
- « 82 % fait seul » et « 82 € économisés ce mois » : faits encourageants, mis en avant.
- Ce qu'on ne fait pas : pas d'alerte anxiogène sous le seuil, pas de compte à rebours, pas de publicité pour un outil payant.

## 10. Ajmani
- **Suggestion** : déclencheur = un connecteur à forfait dont la consommation dépasse 70 % de la quantité incluse avant le 20 du mois (*Proposition*). Elle propose d'abord de **prévenir** (gratuit), et seulement ensuite de payer au-delà du forfait.
- Barre ⌘J, invites : « Combien m'a coûté le mois dernier ? », « Mets les SMS en local », « Baisse le plafond à 30 € ».

## 11. Adaptation (fenêtre réduite, mobile)
- Sous 1280 px : la colonne droite passe sous le tableau ; le bandeau garde ses trois parties, les barres de 6 mois passent sous l'anneau.
- Sous 900 px : tableau en cartes (une par connecteur).
- Mobile (LOT-09) : **lecture seule** (décision de Harun, 12 nov.) : payé, plafond et alertes ; aucune bascule de mode ni réglage du plafond.

## 12. Critères de réussite
- [ ] Identique à `images/DEV-couts.png` à ± 2 px : bandeau 1108 × 165, tableau 732 × 480 (lignes de 49), colonne droite 360 de large.
- [ ] Aucun chiffre inventé : chaque tarif a une source et une date ; sans tarif, pas d'estimation.
- [ ] Au plafond, tout ce qui est payant s'arrête, et le local continue.
- [ ] Activer un outil payant tient en trois clics, coût affiché avant.
- [ ] Aucune clé ni identifiant d'accès affiché, même masqué.
- [ ] Un seul bouton primaire (« Brancher un outil ») ; états tout local, seuil, plafond, tarif inconnu, modèle absent, chargement, erreur, hors ligne présents.
- [ ] `typecheck`, `lint`, `check:socle`, `check:developpement` verts.

## 13. Pièges
- **« 5 connecteurs sur 7 »** ne correspond pas aux 4 lignes « Local » de la maquette : le chiffre se calcule (§6), l'écart avec l'image est noté dans `STATUT.md`.
- « Paiements (Stripe) » est « Payant » mais ne compte pas dans « 14 € » (commission seule).
- « Courriels en masse » est « Local » avec une limite (« 220 sur 500 ») : la limite est celle de la boîte d'envoi, pas un forfait payant.
- La suggestion de l'image dit « passer en payant » pour les SMS déjà « Payant » : le texte retenu par Harun est « payer au-delà du forfait » (§4).
- Montants, quantités et noms d'outils sont fictifs ; les tarifs réels viennent du catalogue de LOT-12.

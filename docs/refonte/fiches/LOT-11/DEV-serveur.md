# DEV-serveur · Serveur et santé
Développement · LOT-11 · Image : `images/DEV-serveur.png` · Statut : NOUVEAU
Parcours : Développement / Serveur et santé

> Règles communes de l'espace : [`00-COMMUN.md`](00-COMMUN.md). **Dépend de la décision serveur (LOT-13)**, reportée (`STATUT.md` §1.16) : écran construit sur données fictives, branché sur le vrai serveur plus tard.

## 1. Rôle
Savoir en un regard que **notre serveur va bien** : sa charge (processeur, mémoire, disque, réseau), les **services** qui tournent dessus et leur disponibilité sur 30 jours, l'état des **sauvegardes** et le **coût du mois**. On relance un service d'un clic ; on ne configure pas le serveur ici.

## 2. Nouveau ou re-habillage ?
- **Nouveau (à créer)** : tout l'écran. Les 4 jauges, la courbe de charge sur 24 h, les 6 tuiles de service avec « Relancer », la carte de coût, la suggestion d'Ajmani sur le disque, « Journal » et « Redémarrer ».
- **Existant réutilisé** : la carte « Sauvegardes » lit **MO03 Sauvegardes** (LOT-07 ; jeu fictif `sauvegardes`, type `CopieSauvegarde`) ; le service « La Garde H24 » renvoie à **N03 Veille H24** (LOT-08). La disponibilité d'un site suivi existe déjà (`SitesDashboardScreen`, jeu `sites`, `disponibilite30j`) : même règle de calcul pour les services.
- **Dépend** : (a) de **LOT-13** (quel serveur, quels services, quel coût) ; (b) d'**amn-api** pour les mesures et les actions sur le serveur (relancer, redémarrer), qui ne s'exécutent jamais depuis le poste. *À confirmer dans le code* : aucune mesure de serveur n'est lue par l'application aujourd'hui.

## 3. Disposition par zones
Coordonnées relatives à la zone principale, relevées sur l'image, à ± 2 px.
- **Z1 En-tête de page** : h1 « Serveur et santé », sous-titre ; secondaire « Journal » (icône liste) puis **secondaire** « Redémarrer » (icône lecture), 36 px, y = 44 : primaire sur l'image, rétrogradé par le CO (`STATUT.md` §1.19 n° 7) ; la page n'a donc pas de bouton primaire.
- **Z2 Quatre jauges** : cartes **267 × 117** à x = 40 / 321 / 601 / 882, y = 97 (écart 14). Dans chacune : anneau de 88 px (épaisseur 8, arc en dégradé avec lueur, pourcentage 17 px / 600 au centre) à gauche ; à droite libellé en capitales 11 px `letter-spacing:.09em` T4, valeur 24 px / 700 en dégradé (avec « sur 8 » 12.5 px T3 accolé), ligne 12.5 px T3.
- **Z3 Charge sur 24 heures** : carte **742 × 199** à (40, 230) : titre 15 px / 600, légende à droite (point + « Processeur », point + « Mémoire »), graphique ≈ 700 × 110 (deux courbes lissées, aire sous courbe 0,42 → 0, point final vivant sur la mémoire), repères horaires 11 px T4 dessous.
- **Z4 Services** : carte **742 × 315** à (40, 443) : titre + ligne à droite ; 3 × 2 tuiles **225 × 105** à x = 61 / 298 / 536, y = 495 / 612 (écarts 13 et 12). Tuile : point d'état + nom 13.5 px / 600, détail 12.5 px T3, disponibilité 16 px / 700 en couleur d'état en bas à gauche, bouton secondaire « Relancer » (≈ 86 × 36) en bas à droite. Tuile en attention : bordure attention à 38 %.
- **Z5 Colonne droite** (x = 798, largeur 350) : « Sauvegardes » **350 × 144** à (798, 231) — 3 lignes libellé / valeur à droite ; « Coût du mois » **350 × 147** à (798, 390) — libellé capitales, montant 44 px / 700 en dégradé + « tout compris », texte 12.5 px T3 sur deux lignes ; suggestion d'Ajmani **350 × ≈ 138** à (798, ≈ 552), bord dégradé a → b, bouton pleine largeur.
- **Z6 Barre Ajmani** : standard.
- **Barre latérale** : famille Développement, module actif « Serveur et santé ».

## 4. Contenu affiché (textes exacts)
**En-tête** : « Serveur et santé » · « Ton serveur, en bonne forme · 6 services sur 6 en marche · en ligne depuis 41 jours » · « Journal » · « Redémarrer ».

**Jauges**
| Anneau | Libellé | Valeur | Ligne |
|---|---|---|---|
| 23 % | PROCESSEUR | 23 % | moyenne sur 1 h |
| 51 % | MÉMOIRE | 4,1 Go « sur 8 » | 51 % utilisée |
| 24 % | DISQUE | 38 Go « sur 160 » | 24 % utilisé |
| 31 % | RÉSEAU | 1,2 Mo/s | pic 6,4 Mo/s |

**Charge sur 24 heures** : « Charge sur 24 heures » · « Processeur » · « Mémoire » · « hier 20:00 » · « 02:00 » · « 08:00 » · « 14:00 » · « maintenant ».

**Services** : « Services » · « 6 sur 6 en marche · disponibilité sur 30 jours ».
| Service | Détail | Disponibilité | État |
|---|---|---|---|
| amn-api | Serveur de l'application | 99,98 % | succès |
| Base de données | Postgres, 2 connexions | 99,99 % | succès |
| La Garde H24 | Rondes toutes les 15 min | 100 % | succès |
| Sauvegardes | Chaque nuit à 03:00 | 100 % | succès |
| Reverse proxy | HTTPS, certificats auto | 99,97 % | succès |
| Mails sortants | File d'attente : 0 | 99,41 % | attention |
Chaque tuile : « Relancer ».

**Sauvegardes** : « Sauvegardes » · « Dernière copie » « 03:00, réussie » (succès) · « Restauration testée » « 2 nov. » · « Copie hors serveur » « oui, chiffrée » (succès).

**Coût du mois** : « COÛT DU MOIS » (l'image ajoute « · EXEMPLE », annotation à ne pas reproduire) · « 9 € » · « tout compris » · « Serveur, stockage et copies. Une panne se règle chez nous, pas chez un client. »

**Suggestion d'Ajmani** : « Le disque se remplit de 1,1 Go par semaine. À ce rythme, tu es tranquille pour 2 ans. Je surveille et je te préviens à 80 % ? » · « Oui, surveiller ».

## 5. Composants du socle utilisés
`Sidebar`, `Header`, `PageHead`, `Card`, `Anneau` (`AnneauProgression`, 88 px), `Courbe` (deux séries, aire), `LiveDot` (point final), `StatusPill`, `Button`, `Suggestion`, `DialogueConfirmation`, `AjmaniBar`.
**Nouveaux composants** (lot) :
- `JaugeServeur` : anneau + libellé capitales + valeur + ligne. Couleur de l'arc : une teinte fixe par mesure, tirée des jetons d'état v4 (*Proposition* d'après l'image : processeur violet → info, mémoire info → succès, disque rose → danger, réseau orange → danger). La couleur **ne porte pas la gravité** : au-delà de 80 %, la ligne de texte passe en attention et dit « élevée » (*Proposition*).
- `TuileService` : point, nom, détail, disponibilité, « Relancer ».
- `CarteCout` : libellé, montant en dégradé, « tout compris », texte.

## 6. Données et règles de calcul
- **Mesures** (amn-api, toutes les minutes, *Proposition*) : processeur (%), mémoire utilisée / totale, disque utilisé / total, débit réseau. Aucun nom d'hôte, adresse ni port n'est lu ni affiché.
- **Processeur** = moyenne sur la dernière heure. **Mémoire** et **disque** = valeur actuelle, part arrondie à l'entier ; Go à une décimale sous 10, entier au-delà (« 4,1 Go », « 38 Go »). **Réseau** = débit moyen des 5 dernières minutes ; « pic » = maximum sur 24 h ; l'anneau = débit / capacité déclarée du lien (*À confirmer* : la capacité du lien n'est pas lisible dans l'image).
- **Courbe** = processeur et mémoire en %, un point toutes les 10 min sur 24 h glissantes.
- **Services** : liste déclarée par la configuration du serveur (LOT-13), jamais codée en dur. **Disponibilité** = minutes « en marche » / minutes des 30 derniers jours, deux décimales, « 100 % » sans décimale quand c'est exact. **État** (*Proposition*) : succès si ≥ 99,9 % et en marche ; attention entre 99,0 et 99,9 % ; danger sous 99,0 % ou arrêté. « n sur m en marche » = services en marche maintenant.
- **« en ligne depuis n jours »** = jours depuis le dernier redémarrage du serveur.
- **Sauvegardes** (MO03) : dernière copie (heure, état), dernier essai de restauration réussi (date), présence d'une copie hors serveur chiffrée (« oui, chiffrée » / « non » en attention).
- **Coût du mois** = somme des lignes de coût déclarées pour le serveur (hébergement, stockage, copies) du mois en cours, TTC, sans décimale si entier. Source : la décision de LOT-13 et ses factures, jamais un chiffre inventé ; sans coût déclaré, la carte affiche « Coût à renseigner » (*Proposition*).
- **Projection du disque** (suggestion) : pente = croissance moyenne par semaine sur les 4 dernières semaines ; durée avant 100 % = (total − utilisé) / pente, arrondie à l'année au-delà de 12 mois (« 2 ans »), au mois en deçà. Exemple : (160 − 38) / 1,1 ≈ 111 semaines ≈ 2 ans.

## 7. Interactions
- Clic sur une jauge : la courbe montre cette mesure seule sur 24 h (un second clic revient aux deux).
- Survol de la courbe : valeurs et heure.
- **« Relancer »** (un service) : confirmation en une ligne « Relancer <service> ? Il sera indisponible quelques secondes. » + « Relancer » ; l'action est demandée à amn-api ; la tuile passe « en relance » puis revient. Droit d'administration exigé.
- **« Redémarrer »** (tout le serveur) : bouton secondaire, confirmation explicite (« Redémarrer le serveur ? Les 6 services seront coupés environ une minute. ») ; jamais sans confirmation ; **inerte tant que LOT-13 est en pause** (décision du CO, §1.19 n° 7).
- **« Journal »** : journal du serveur (monospace, filtrable par service) ; aucune adresse ni secret n'y figure, les lignes sont filtrées côté serveur.
- Clic sur la carte Sauvegardes : ouvre MO03. Clic sur « La Garde H24 » : ouvre N03.
- **« Oui, surveiller »** : crée une alerte « disque à 80 % » (notification H40) ; la suggestion disparaît.
- **Mouvement** : anneaux tracés depuis 0 (1,1 s), courbes tracées (1,3 s), point final vivant (seule animation continue avec le curseur de la barre Ajmani). `prefers-reduced-motion` coupe tout.

## 8. États
- **Serveur non branché** (cas actuel, LOT-13 reporté) : carte pleine zone « Le serveur n'est pas encore branché. Quand il le sera, tu verras ici sa santé, ses services et son coût. » ; « Redémarrer » et « Relancer » absents. En développement, les données fictives remplissent l'écran.
- **Un service arrêté** : tuile en danger, « arrêté depuis <durée> », « Relancer » devient primaire dans la tuile ; sous-titre « 5 services sur 6 en marche ».
- **Mesures en retard** (plus de 5 min sans mesure) : bandeau « Dernière mesure il y a 12 min. » ; jauges grisées.
- **Sauvegarde échouée** : « Dernière copie » en danger « 03:00, échouée » + lien « Relancer la copie » (MO03).
- **Chargement** : squelettes de même gabarit. **Erreur** : bandeau « La santé du serveur n'a pas pu être chargée. » + « Réessayer ». **Hors ligne** : dernières valeurs, datées.
- **Droits** : sans droit d'administration, tout en lecture, sans « Redémarrer » ni « Relancer ».

## 9. Éléments ludiques
- « en ligne depuis 41 jours », « 100 % » et « tu es tranquille pour 2 ans » : faits rassurants.
- Ce qu'on ne fait pas : pas d'alerte rouge pour une valeur normale, pas de compte à rebours, pas d'urgence inventée.

## 10. Ajmani
- **Suggestion** : déclencheur = projection du disque calculable (au moins 2 semaines de mesures) et aucune alerte « disque » déjà posée. Variantes (*Proposition*) : mémoire au-dessus de 85 % sur 24 h (« La mémoire reste haute depuis hier. Je regarde quel service la prend ? ») ; disponibilité d'un service sous 99,5 % (« Les mails sortants ont eu 4 coupures ce mois. Je te montre quand ? »). Sinon : astuce courte ou rien.
- Barre ⌘J, invites : « Le serveur va bien ? », « Relance les mails sortants », « Quand a eu lieu la dernière restauration testée ? ».

## 11. Adaptation (fenêtre réduite, mobile)
- Sous 1280 px : jauges en 2 × 2 ; colonne droite sous les services (3 cartes côte à côte).
- Sous 900 px : une carte par rangée ; tuiles de service en 2 colonnes.
- Mobile (LOT-09) : **lecture seule** (décision de Harun, 12 nov.) : jauges, services et sauvegardes ; « Relancer » et « Redémarrer » restent sur l'ordinateur.

## 12. Critères de réussite
- [ ] Identique à `images/DEV-serveur.png` à ± 2 px : jauges 267 × 117, charge 742 × 199, services 742 × 315 (tuiles 225 × 105), colonne droite 350 de large.
- [ ] Aucun nom d'hôte, adresse, port, nom de machine ni secret, ni à l'écran ni dans le journal affiché.
- [ ] « Relancer » et « Redémarrer » se confirment toujours et passent par amn-api.
- [ ] La couleur d'un anneau ne dit pas la gravité ; le texte la dit.
- [ ] État « serveur non branché » présent tant que LOT-13 n'est pas décidé.
- [ ] `typecheck`, `lint`, `check:socle`, `check:developpement` verts.

## 13. Pièges
- « COÛT DU MOIS · EXEMPLE » : le suffixe est une annotation de maquette.
- « 9 € » est un exemple, pas un tarif : la décision serveur n'est pas prise (achat décidé en décembre).
- « Redémarrer » est primaire sur l'image : il devient secondaire (décision du CO), toujours confirmé ; écart noté.
- Ne pas confondre la disponibilité d'un **service** (cet écran) et celle d'un **site client** (MO02 / CY07).
- « Reverse proxy » et « Postgres » sont des noms de service, pas des détails de configuration : ne rien ajouter (version, port, adresse).

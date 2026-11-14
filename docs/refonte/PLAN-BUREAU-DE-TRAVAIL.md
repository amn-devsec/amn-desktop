# Plan « Bureau de travail » : travailler sans dépendre d'une IA

> Direction de Harun du 14 nov. (carte blanche, priorité dans la boucle). Plan écrit par le CO ; résumé et questions dans [`POINT-HARUN.md`](POINT-HARUN.md). Ce document décrit des outils et des écrans, et rien qui touche à une faiblesse de sécurité.

## 0. Le principe

Harun, Mohamed et Riyad doivent pouvoir faire leur travail de développement, de cybersécurité et de contenu **comme s'ils partaient de zéro avec de bons outils**. L'IA (Ajmani) reste un plus : chaque écran marche entièrement sans elle, et la suggestion d'Ajmani n'est qu'un raccourci.

Règles qui valent pour tout le plan :
1. **Outils intégrés, gratuits ou ouverts, qui tournent en local.** Aucun service payant caché. Un service en ligne gratuit (une source de données publique, par exemple) est nommé et peut se couper. Rien ne part sans un geste de la personne.
2. **Licences** : on préfère MIT, Apache-2.0, BSD, ISC, et MPL-2.0 pour un fichier non modifié. LGPL seulement en bibliothèque liée dynamiquement. **Jamais d'AGPL.** Une licence GPL (ffmpeg dans certaines constructions) reste un outil séparé, appelé et non lié. La distribution est la décision de Harun ; tant qu'elle n'est pas prise, tout reste dans l'édition interne.
3. **L'IA en option, et en local quand c'est possible** : retrait de fond, transcription, voix de synthèse. Le modèle tourne sur le poste, se télécharge à la demande et peut se désactiver. Chaque fonction a toujours son geste manuel : pinceau, saisie des sous-titres, enregistrement au micro.
4. **Ludique, dans les limites déjà fixées** (STATUT, « À ne pas simplifier ») : aucun chiffre individuel, aucun classement, aucune perte de points, aucun reproche. Le jeu est **collectif** : on avance ensemble, on débloque ensemble, on fête ensemble.
5. **Les règles des lots** s'appliquent sans changement : §1.40 (aperçus), §1.41 (zones de 36 px), §1.42 (vocabulaire), tutoiement, toutes les `check:*`, aucun lien `node_modules` commité. Ces modules n'ont **pas de fiche v4** : chaque lot commence par une note de préparation, puis les écrans suivent les archétypes du socle. Harun valide sur l'aperçu, et T1 contrôle la conformité aux archétypes, l'accessibilité, les zones de clic et les textes, à la place d'une image.

## 1. Modèles de sites, revus (LOT-14)

**État aujourd'hui.** Dans l'application, **aucun modèle n'est livré** : `MODELES_LIVRES` est vide, en attendant la relecture des textes par Harun (décision du 12 nov.). Les 8 « modèles » qu'on voit dans l'aperçu (`scripts/apercu/modeles-exemple.ts`) ont été écrits par S8 le 14 nov., uniquement pour mesurer la fidélité de l'écran DEV-modeles-sites. Ce sont 8 couleurs posées sur **une seule page générique** (en-tête, accroche, trois offres, pied), avec des noms et des secteurs pris sur l'image v4 :

| Aperçu | Secteur | Origine | À garder ? |
|---|---|---|---|
| Optique Lumière | Commerce local | fictif, nom de l'image v4 | non : page générique |
| Atelier Marceau | Artisan | idem | non |
| La Table de Marcel | Restauration | idem | non |
| Prestige Drive | Automobile | idem | non |
| Veillance | Services B2B | idem | non |
| Lina Bardet | Portfolio | idem | non |
| Maison Karim | Beauté | idem | non |
| Studio Souffle | Bien-être | idem | non |

**Recommandation : n'en garder aucun comme modèle.** Ce sont exactement des « modèles de remplissage ». Ils restent seulement comme données de test de l'aperçu. Leurs 8 secteurs servent de liste de départ pour choisir les vrais modèles.

**La nouvelle bibliothèque**
- **Capacité de 100 modèles et plus** : grille virtualisée ; vignettes produites hors de l'application (capture faite une fois, à l'entrée du modèle) et chargées au fil du défilement ; recherche plein texte ; filtres par secteur, par style (clair, sombre, sobre, chaleureux…) et par type de page (vitrine, une page, réservation, boutique, portfolio).
- **Un modèle = un site complet** : plusieurs pages, des sections nommées (en-tête, héros, offres, tarifs, témoignages, FAQ, formulaire, pied), des composants nommés (bouton, carte, menu, champ). Chaque modèle est livré avec un manifeste (`modele.json`) qui déclare ses pages, ses sections et ses composants, avec leur sélecteur.
- **Le mode inspecteur** : on clique sur n'importe quel élément du modèle, affiché dans un cadre isolé, et on obtient sa structure (HTML) et son style (le CSS qui le touche, ramené aux règles utiles, pas tout le calculé). Le code est mis en forme par Prettier (MIT) et coloré par Shiki (MIT). **Trois copies** : le site entier (archive), une section choisie dans le manifeste, ou un composant seul (HTML et CSS autonomes). Raccourcis au clavier ; le survol montre le nom de la section ou du composant.
- **Porte d'entrée de qualité.** Aucun modèle n'entre sans passer :
  1. le skill `signes-ia` (les 94 signes d'un site fait par IA), avec 0 signe ;
  2. l'accessibilité : axe-core (MPL-2.0), 0 violation sérieuse ;
  3. le responsive à 390, 768 et 1280 px, sans débordement ;
  4. le poids et la performance : Lighthouse (Apache-2.0), dans le Chromium d'Electron ;
  5. l'actualité du code : HTML et CSS modernes (grid, flex, `clamp()`, propriétés logiques), aucune bibliothèque périmée (pas de jQuery, pas de Bootstrap 3), JavaScript seulement s'il est utile ;
  6. la relecture des textes par Harun.

  Un contrôle `check:modeles` rejoue les points 2 à 5 à chaque ajout.
- **D'où viennent les modèles.** On part des sites qu'AMN a déjà faits, dont ceux de la base de projets Claude (**liste à demander à Harun**). Pour un site fait pour un client :
  - avec **l'accord écrit du client**, il est anonymisé (noms, logos, textes et photos remplacés) puis devient un modèle ;
  - sans accord, il reste une **référence interne privée**. Il n'entre jamais dans le dépôt tant que celui-ci est public, et va dans le dépôt privé du dossier.

  Mieux vaut **8 à 12 modèles excellents d'abord**, puis la bibliothèque grandit.
- **Ludique** : la « collection » de l'atelier. Chaque section et chaque composant réutilisé dans un vrai projet s'allume dans la collection de l'équipe. Une étape collective (« 10 composants réutilisés », « premier site livré depuis un modèle ») déclenche une célébration discrète, qui respecte le mouvement réduit.

## 2. Studio de contenu (LOT-15)

Un espace de **Créer et produire** pour préparer des publications sans IA.
- **Formats** : posts (1:1, 4:5), stories et reels (9:16), couvertures (16:9), avec des gabarits par format et les zones de sécurité de chaque réseau affichées.
- **Photos** :
  - recadrage aux bons formats, avec une proposition de cadrage par smartcrop.js (MIT, sans IA) ;
  - redimensionnement et export par lot : sharp (Apache-2.0, avec libvips en LGPL liée), dans le processus principal ;
  - filtres et réglages (lumière, contraste, saturation, netteté), en local ;
  - **retrait de fond** : manuel au pinceau et à la baguette, ou automatique **en option** avec un modèle local (MediaPipe Selfie Segmentation, Apache-2.0, par onnxruntime-web, MIT), téléchargé à la demande.
- **Vidéo simple** :
  - coupe et assemblage, par ffmpeg appelé comme outil séparé (construction LGPL ; à vérifier, voir règle 2) ;
  - **sous-titres** : éditeur SRT ou WebVTT à la main, incrustation au rendu, transcription automatique **en option** par whisper.cpp (MIT), en local ;
  - **voix off** : enregistrement au micro (MediaRecorder), voix de synthèse **en option** par Piper (MIT ; on ne garde que les voix sous licence libre) ;
  - **jamais de musique par défaut**.
- **Bibliothèque de médias** : des fichiers locaux indexés, avec des étiquettes, le client, le droit d'usage (photo du client, photo libre, avec sa source et sa licence), et la recherche.
- **Kit de marque par client** : couleurs, polices (les fichiers fournis par le client ou des polices libres OFL), logos, ton. Le Studio applique le kit aux gabarits.
- **Calendrier de publication** : il prolonge le module « Publier » existant. On prépare, on planifie et on exporte (fichier et texte prêts à poster). La publication automatique vers un réseau passe par un connecteur nommé, coupé par défaut ; rien ne part sans un clic.
- **Ludique** : la « série de publication » de l'équipe (régularité collective, sans pression) et le mur des publications du mois.

## 3. Atelier développement et cyber (LOT-16 et LOT-17)

**LOT-16 Atelier développement** (espace Développement)
- **Bibliothèque d'extraits et de composants** : du code classé par langage et par usage, avec recherche, coloration (Shiki), copie, et les composants issus des modèles (lien avec LOT-14).
- **Outils du quotidien**, tous en local :
  - format et validation JSON ;
  - testeur d'expressions régulières, avec l'explication des groupes ;
  - couleurs (conversions, contraste WCAG avec culori, MIT) et dégradés ;
  - générateur d'icônes et de favicons (sharp, resvg-js en MPL-2.0) ;
  - images de partage Open Graph (satori, MPL-2.0) ;
  - encodages (base64, URL) et horodatages.
- **Contrôle d'une page** : SEO (balises, titres, liens, plan du site, données structurées : règles écrites dans l'application), accessibilité (axe-core), performance (Lighthouse). Le rapport est lisible et peut s'exporter pour le client.
- **Assistant de lancement de projet** : un questionnaire court (type de site, pages, langues, formulaires, paiement), puis le dépôt créé depuis un modèle de LOT-14, la liste de contrôle de mise en ligne (domaine, DNS, HTTPS, mentions légales, cookies, sauvegardes) et le lien avec Projets de code et Déploiements.

**LOT-17 Atelier cyber** (espace Cyber, avec LOT-10 ; S6 relit la sécurité de tout)
- **Suivi des vulnérabilités (CVE)** : sources publiques et gratuites, nommées, interrogées seulement sur demande ou à heure fixe (catalogue KEV de la CISA, API NVD, OSV.dev). Rapprochement avec le parc déclaré de chaque client (logiciels et versions). Une alerte n'est qu'une **information** : aucune action automatique.
- **Modèles de rapports d'audit** : un résumé pour la direction et une partie technique, l'échelle de gravité, le plan de correction suivi dans le temps. Export PDF.
- **Listes de contrôle** : à partir de référentiels ouverts, avec leur licence respectée (le guide d'hygiène de l'ANSSI sous Licence Ouverte ; OWASP ASVS sous CC BY-SA, avec attribution).
- **Périmètres autorisés** : chaque mission porte son périmètre écrit, sa lettre de mission signée (via Signatures), ses dates de début et de fin. Rien ne se lance hors du périmètre ni hors des dates : c'est la règle déjà posée pour OSINT (CY06), étendue à tout l'atelier.
- **Exclus** : les 4 `CYB-*` (vulnérabilités, rapport d'audit, playbook, chiffrage), comme décidé pour LOT-10. Les nouveaux écrans ne les remplacent pas en douce : si un écran de LOT-17 recouvre un `CYB-*`, il attend la décision de Harun.
- **Ludique** : le « carnet de veille » de l'équipe (les alertes lues ensemble dans la semaine, sans compte individuel) et la frise des audits rendus.

## 4. Les vraies tâches d'AMN DevSec, et ce qu'il faut pour chacune

« Existe » : un module déjà livré ou en construction. « Manque » : ce qui n'existe pas. « Facile » : ce qui la rendrait simple.

| Tâche | Existe | Manque | Facile |
|---|---|---|---|
| **Trouver et signer un client de site** | contacts, pipeline, prospects, relances (LOT-02) ; devis (LOT-04) ; taux horaire et comparateur de devis (F1) | brief client, cahier des charges, proposition commerciale | un **questionnaire de brief** partagé au client, qui produit le cahier des charges et le devis |
| **Créer et livrer un site** | projets de code, déploiements, serveur, modèles (LOT-11) | recette avec le client, liste de mise en ligne, procès-verbal de livraison, passation (accès, domaine) | l'**assistant de lancement** (LOT-16) et un **kit de livraison** en un clic : PV signé, accès transmis, guide d'usage du client |
| **Maintenance et suivi** | sites et trackers, supervision (La Garde) ; cockpit client (LOT-01) ; contrats et abonnements (LOT-04) | calendrier des échéances (domaine, HTTPS, mises à jour), rapport mensuel au client, contrôle des sauvegardes | un **calendrier d'échéances** automatique par site, et un **rapport mensuel** pré-rempli à relire |
| **Dépannage informatique (hatf)** | missions et tickets (LOT-01) ; rendez-vous, tournées, matériel, photos de chantier (LOT-02 et LOT-06) ; facturation | fiche d'intervention, diagnostic guidé, parc matériel du client, suivi des garanties, bon signé | une **fiche d'intervention** : diagnostic par symptôme (listes de contrôle écrites par nous), matériel et numéro de série, photos avant et après, bon signé sur place, facture en un geste |
| **Audits et rapports de cybersécurité** | Cyber (LOT-10, en cours) ; maturité et comparatif (La Garde) | lettre de mission, périmètre, rapport type, suivi des corrections | l'**atelier cyber** (LOT-17) |
| **Devis, factures, contrats** | L'argent (LOT-04, en cours) ; signatures, documents (LOT-03) | modèles de contrats (création de site, maintenance, audit), CGV | une **bibliothèque de contrats** pré-remplis depuis la fiche client, signés dans l'application. Validation par un juriste avant tout usage réel (§1.42 n° 2) |
| **Documents légaux (RGPD, mentions légales)** | Conformité (Outils) | générateur de mentions légales, politique de confidentialité, bandeau de cookies, registre des traitements, accord de sous-traitance | un **générateur légal** par site client, versionné. Validation par un juriste avant tout usage réel |
| **Contenu pour les réseaux** | vidéo, images, publier, visuels et marque (LOT-06) | formats, retouche par lot, sous-titres, kit de marque, calendrier | le **Studio** (LOT-15) |
| **Formation et veille** | base de connaissances, notes, journal (LOT-03) | veille en flux (RSS local), parcours de formation interne, supports et attestations pour les formations clients, sensibilisation des clients | un **lecteur de veille** local, des **parcours** de fiches, un module de **sensibilisation** pour les clients (quiz sur l'hameçonnage, sans piège réel) |
| **Organiser l'équipe de trois** | Ma journée, planning, défis d'équipe (LOT-01) | temps passé par projet, rentabilité par client | un **suivi du temps** léger (minuteur relié à la tâche) qui alimente le taux horaire de F1 |

**Plus loin** (à peser plus tard, sans engagement) :
- un mode **entièrement hors ligne**, avec une synchronisation quand le réseau revient ;
- un **jumeau de recette** de chaque site client, pour tester avant de mettre en ligne ;
- le **paquet de passation** pour un client qui part (ses données, ses accès, sa documentation) ;
- un **plan de reprise** par client (que faire si le site tombe).

**Le fil ludique du Bureau de travail.** Un « carnet d'atelier » d'équipe relie tout : les chantiers livrés, la collection de composants, la série de publication, le carnet de veille. Il a des paliers collectifs et des célébrations discrètes. On n'y trouve aucun chiffre par personne, aucun classement, et rien qui se perd.

## 5. Découpage et ordre

| Lot | Contenu | Session proposée | D'abord |
|---|---|---|---|
| **LOT-14** | Modèles de sites v2 : bibliothèque, inspecteur, porte de qualité | **S2** (libre ; ce lot n'a pas besoin des zips) ; S8 consulté (il a construit ModelesDeSites) | note de préparation, puis 2 modèles pilotes de bout en bout |
| **LOT-15** | Studio de contenu | **S9** (libre depuis LOT-12) | note de préparation : choix et licences des outils, avec preuve qu'ils tournent en local |
| **LOT-16** | Atelier développement | **S5**, après le relevé mobile | note de préparation |
| **LOT-17** | Atelier cyber | **S8**, après LOT-10 ; S6 relit la sécurité | note de préparation, relue par S6 |
| **LOT-18** | Métiers d'AMN : fiche d'intervention hatf, échéances et rapport mensuel, contrats et générateur légal, suivi du temps, brief client, kit de livraison | **F1** (taux horaire, devis), après son intégration avec S0 ; SIM pour les données | note de préparation, avec les priorités de Harun |

T1 contrôle chaque lot sans image v4 : conformité aux archétypes du socle, accessibilité, zones de clic, textes et vocabulaire, licences des dépendances (un contrôle `check:licences` à créer par T1 : aucune AGPL, liste des licences à jour), et taille du paquet. Les lots déjà en cours (LOT-04, 07, 08, 10, le socle) gardent leur priorité.

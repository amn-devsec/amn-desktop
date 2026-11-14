# BDT-2 · Studio de contenu — note de préparation (étape 1)

> Branche `claude/refonte-studio`, partie de `claude/refonte-vivante` @ `0ca14694`. Rédigée le 14 nov. 2026 par S9, à la demande du CO. Relue contre [`PLAN-BUREAU-DE-TRAVAIL.md`](../PLAN-BUREAU-DE-TRAVAIL.md) §2 et `STATUT.md` §1.43 dès leur arrivée sur `refonte-vivante` (`a12a81b7`).
> Étape 1 seulement : aucun écran, aucune dépendance ajoutée au dépôt. Images de synthèse, aucune donnée réelle, aucune clé.

## 1. En bref

- **Le principe tient** : tout le studio peut marcher **sans IA**, en local, avec des outils gratuits et ouverts. L'IA reste une option locale, toujours avec un geste manuel à côté. Jamais de musique par défaut. Rien ne se publie sans un clic.
- **Preuve dans un vrai Electron 43.2.0** (Node 24.18, Chrome 150), sans l'application : sharp et smartcrop (processus principal), ffmpeg en outil séparé avec contrôle de licence, onnxruntime-web en WebAssembly dans une fenêtre isolée, et le recadrage par le canvas seul. Résultats : §4, essai rejouable : [`BDT-2-essai/`](BDT-2-essai/LISEZ-MOI.md).
- **Images** : le plan retient sharp (libvips en LGPL liée dynamiquement, admise par §1.43) pour l'export par lot ; l'essai montre que le **canvas du rendu** suffit aussi pour l'aperçu et les exports simples, sans rien ajouter. Proposition : les deux, chacun à sa place (§8, question 1).
- **Pas prouvé dans cette session** (§5) : la construction **LGPL** de ffmpeg, le modèle de détourage MediaPipe, whisper.cpp pour les sous-titres, Piper pour la voix. Le téléchargement et l'exécution de ces binaires ou modèles récupérés sur Internet ont été **refusés par le garde-fou de la session** ; je ne l'ai pas contourné. Ils sont à prouver sur le poste de Harun, ou avec une autorisation explicite.
- **Licences** (§1.43) : MIT, Apache, BSD ou MPL de préférence ; LGPL liée dynamiquement ; GPL seulement en outil séparé ; jamais d'AGPL. Piper dépend d'espeak-ng (GPL-3.0, à confirmer à la source) : il reste donc un **processus séparé**, jamais lié à l'app (§5). `check:licences`, à créer par T1, contrôlera la liste.

## 2. Les écrans et ce qu'ils réutilisent

Famille **Créer et produire** (registre `src/refonte/modules/declarations/creer.ts`), actions « Vidéo et son », « Images et visuels », « Publier ». Le studio **prolonge** ces modules ; il ne les double pas.

| Écran du studio | Ce qu'il fait | Ce qui existe déjà (route, fichier) | Lien avec LOT-06 |
|---|---|---|---|
| **Formats** | une photo ou une vidéo déclinée en carré 1080 × 1080, portrait 4:5 1080 × 1350, story et reel 9:16 1080 × 1920, couverture 16:9 ; gabarits par format ; zones de sécurité de chaque réseau ; cadre proposé, déplacé à la main | Visuels pub `/visuels-pub` (`VisuelsPubScreen`, `horsZone`, zones sûres par plateforme) ; Images produits `/images-produits` | — |
| **Retouche** | recadrer, redresser, lumière, contraste, saturation, netteté ; texte et logo dans la zone sûre ; retrait de fond au pinceau et à la baguette, automatique en option ; export par lot | Identité visuelle `/identite-visuelle` (`lisibilite`, `usageIllisible` de `src/lib/cinquante/marketing.ts`) | H17 (contrôle à l'export, `marque.ts`) |
| **Vidéo** | couper, assembler, format 9:16, titres ; sous-titres dans un éditeur SRT ou WebVTT, incrustés au rendu, proposés par whisper.cpp en option ; voix off au micro (MediaRecorder), Piper en option ; **aucune musique par défaut** | Montage vidéo `/montage-video` (`MontageVideoScreen` : plans, crans Story 15 s et Reel 30 s, « Appliquer les coupes ») ; Productions vidéo `/productions-video` ; Podcast `/podcast` (onde, coupes) | MR01 Vidéo (étapes Idée → Publiée, sous-titrage, relecture) |
| **Médias** | fichiers locaux indexés : étiquettes, client, droit d'usage (photo du client, photo libre avec sa source et sa licence), recherche | Médias `/media` (`MediaLibraryScreen`, famille Écrire) ; Photos de chantier (MR10) | MR10 |
| **Kit de marque, par client** | couleurs, polices (fournies par le client, ou libres OFL), logos, ton ; appliqué aux gabarits | Identité visuelle ; `LogoKit` (`src/lib/cinquante/marketing.ts`) | **H17 Visuels et marque** : le kit vient de là, le studio le lit |
| **Calendrier** | préparer, planifier, exporter (fichier et texte prêts à poster) ; publication automatique seulement par un connecteur nommé, coupé par défaut, et toujours un clic ; série de publication de l'équipe et mur des publications du mois (ludique collectif) | Planificateur `/planificateur` (`PlanificateurScreen`, horloge d'audience) ; Mini-page, Portfolio | MR02 Ma page publique |

Le kit de marque **par client** dépasse H17, qui décrit le kit de l'entreprise : le studio garde un kit par client et lit celui de l'entreprise pour ses propres publications. Le kit et les vidéos ont déjà leurs fiches dans LOT-06 (H17, MR01) : le studio en est la **suite côté production**, à ranger avec S7 pour éviter deux écrans du même objet (§8, question 5).

## 3. Les outils, leur licence, leur rôle

| Outil | Version essayée | Licence | Rôle | Où il tourne | Sans lui |
|---|---|---|---|---|---|
| **Canvas / OffscreenCanvas** (Chromium d'Electron) | Chrome 150 | celle d'Electron (MIT) | recadrer, redimensionner, encoder JPEG et WebP | rendu | — (c'est le socle) |
| **smartcrop.js** | 2.0.5 | MIT | proposer le cadre sur le sujet (contraste, teinte de peau, saturation), sans IA | rendu ou principal | cadre centré, déplacé à la main |
| **sharp** | 0.34.5 | Apache-2.0 ; **libvips en LGPL-3.0-or-later** (bibliothèque dynamique) | traitement d'image dans le processus principal, rapide sur gros fichiers | principal | canvas du rendu |
| **ffmpeg** | à choisir | **construction LGPL** exigée (sans `--enable-gpl`, sans `--enable-nonfree`), outil séparé | couper, assembler, encoder H.264 et AAC, incruster les sous-titres | processus à part, lancé par le principal | pas de vidéo exportée ; la vidéo reste dans l'outil du téléphone |
| **onnxruntime-web** | 1.31.1 | MIT | faire tourner un modèle ONNX en WebAssembly, en option | rendu | — |
| **MediaPipe Selfie Segmentation** (modèle, en ONNX) | à choisir | Apache-2.0 annoncée, **à vérifier** sur la fiche du modèle | détourage, en option, **téléchargé à la demande** (plan) | rendu, par onnxruntime-web | pinceau et baguette, à la main |
| **whisper.cpp** | celui que l'équipe installe (déjà branché : `src/main/whisper.ts`) | MIT | proposer les sous-titres, en option | serveur local de l'équipe, comme aujourd'hui | sous-titres tapés |
| **Piper** | à choisir | MIT pour le moteur d'origine ; dépend d'espeak-ng (GPL-3.0) ; licence propre à **chaque voix** (le plan : seulement les voix sous licence libre) | voix off, en option | **processus séparé** (GPL admise ainsi, §1.43) | voix enregistrée au micro, ou pas de voix |
| **MediaRecorder** (Chromium d'Electron) | Chrome 150 | celle d'Electron | voix off au micro | rendu | — |

Jamais d'AGPL. Aucune musique fournie : une piste ne s'ajoute que si la personne l'apporte, avec ses droits.

## 4. Preuve : ce qui tourne en local dans Electron (essai du 14 nov.)

Banc d'essai minimal : `main.cjs` (processus principal) et `page.html` (fenêtre cachée, `sandbox`, `contextIsolation`, sans Node), lancés par **Electron 43.2.0**, la version du dépôt, sans l'application ni `npm start`, sans réseau, sur une image de synthèse de 1200 × 800 (fond uni, sujet contrasté décentré à droite). Sortie complète : [`BDT-2-essai/resultat.json`](BDT-2-essai/resultat.json).

| Essai | Où | Résultat |
|---|---|---|
| sharp + smartcrop : carré 1080 × 1080 | principal | cadre 800 × 800 en x = 350, **sujet dans le cadre**, 12 032 octets, 199 ms |
| sharp + smartcrop : portrait 1080 × 1350 | principal | cadre 637 × 800 en x = 475, **sujet dans le cadre**, 15 461 octets, 231 ms |
| sharp + smartcrop : story 1080 × 1920 | principal | cadre 450 × 800 en x = 700, **sujet dans le cadre**, 22 802 octets, 263 ms |
| smartcrop sur canvas, 4:5 | rendu | même cadre que dans le principal (637 × 800 en x = 475) |
| **Canvas seul** (sans sharp) : 4:5 | rendu | 1080 × 1350 ; JPEG 19 643 octets, WebP 5 074 octets ; 107 ms |
| onnxruntime-web, WebAssembly, 1 fil | rendu isolé | sigmoïde sur [−2, 0, 1, 3] = [0,1192 ; 0,5 ; 0,7311 ; 0,9526], **identique au calcul attendu** ; 278 à 320 ms (chargement compris) |
| ffmpeg séparé : contrôle de licence | principal → processus à part | le ffmpeg du système (6.1.1, Ubuntu) est construit **en GPL** : **refusé** par le contrôle (`-buildconf`, recherche de `--enable-gpl` et `--enable-nonfree`) |
| ffmpeg séparé : mécanique | principal → processus à part | story.jpg → MP4 9:16 de 2 s, flux `mpeg4 1080×1920` + `aac` (codeurs natifs de ffmpeg), 213 476 octets. **Mécanique seulement** : ce binaire GPL ne serait pas livré |

Le modèle ONNX de l'essai est construit à la main (81 octets) : l'essai prouve le **moteur**, pas encore le modèle de détourage (§5).

**Ce que l'essai établit** : le canvas, smartcrop et onnxruntime-web tournent dans le rendu isolé, sans Node ; sharp tourne dans le principal d'Electron 43 ; un ffmpeg séparé se lance, se contrôle et s'utilise depuis le principal. **Ce qu'il n'établit pas** : §5.

## 5. Ce qui reste à prouver, et pourquoi

| Point | État | Ce qu'il faut |
|---|---|---|
| **ffmpeg en construction LGPL** | **non prouvé** : téléchargement et exécution d'un binaire pris sur Internet refusés par le garde-fou de la session | sur le poste de Harun (ou avec autorisation) : une construction LGPL pour Windows, puis `-buildconf` sans `--enable-gpl` ni `--enable-nonfree`, et l'essai rejoué |
| **H.264 dans une construction LGPL** | non prouvé | libx264 est GPL, donc exclu. Pistes : le codeur du système (`h264_mf` sous Windows, `h264_videotoolbox` sous macOS) ou `libopenh264` (BSD-2). À vérifier par `ffmpeg -encoders` sur la construction retenue : Instagram attend du H.264 et de l'AAC en MP4 |
| **Modèle MediaPipe en ONNX** | non prouvé (modèle non téléchargé) | choisir le modèle, lire sa fiche (licence, usage), le convertir ou prendre une conversion publiée, le faire tourner dans `page.html` à la place de la sigmoïde |
| **whisper.cpp pour les sous-titres** | déjà branché dans l'app (serveur que l'équipe installe, `src/main/whisper.ts`) ; **horodatage non vérifié** | vérifier que le serveur rend des sous-titres horodatés (SRT ou VTT) ; sinon, sous-titres tapés |
| **Piper** | non essayé | lire les dépôts au moment du choix : licence du moteur, de la phonétisation (espeak-ng, GPL-3.0) et de **chaque voix** (fiche par voix) |
| **Photos d'iPhone (HEIC)** | non prouvé | ni Chromium ni le sharp précompilé ne lisent le HEIC (brevets HEVC). Repli : réglage « Le plus compatible » du téléphone, ou export en JPEG. À confirmer sur un fichier réel |
| **Polices** | non traité | les polices du kit de marque sont souvent en OFL : licence à ajouter à la liste, ou polices du système seulement |

## 6. Poids ajouté au paquet

Mesuré dans `node_modules` ou au registre npm (taille décompressée). Electron lui-même est déjà dans le paquet (326 Mo décompressé sous Linux).

| Brique | Poids | Remarque |
|---|---|---|
| Canvas | **0** | déjà dans Electron |
| smartcrop.js | **18 Ko** (`smartcrop.js`, 17 674 octets) | |
| onnxruntime-web, seulement si l'IA est activée | **≈ 14,9 Mo** : `ort.wasm.min.js` 53 796 + `ort-wasm-simd-threaded.mjs` 24 738 + `ort-wasm-simd-threaded.wasm` 14 848 852 octets | le paquet npm entier fait 150 Mo : ne copier que ces trois fichiers |
| Modèle de détourage | **0 dans le paquet** | téléchargé à la demande (plan) ; taille non mesurée |
| sharp (si retenu) | **≈ 17,1 Mo** sous Linux (sharp 533 Ko, binaire 423 Ko, libvips 16,7 Mo) ; **19,9 Mo** pour `@img/sharp-win32-x64` (registre) | binaire natif à sortir de l'archive asar à la construction |
| ffmpeg LGPL | **non mesuré** | l'archive Linux complète d'une construction LGPL publique pèse 140 Mo compressée (ffmpeg, ffprobe, ffplay) : une construction réduite aux codecs utiles est à mesurer |
| whisper.cpp, Piper, modèles de voix et de transcription | **0 dans le paquet** | installés par l'équipe, comme whisper aujourd'hui |

Ordre de grandeur, d'après le plan : **≈ 20 Mo** (sharp, smartcrop) ; **≈ 15 Mo** de plus si le moteur de l'IA en option est livré (il peut aussi venir à la demande, avec le modèle) ; ffmpeg à part, à mesurer. Sans sharp (canvas seul) : ≈ 18 Ko.

## 7. Ce qui reste manuel

- **Le cadre** : smartcrop propose, la personne déplace et valide. Aucun export sans ce regard.
- **Le détourage** : le pinceau et la baguette sont toujours là ; le modèle n'est qu'un premier jet.
- **Les sous-titres** : tapés dans l'éditeur SRT ou WebVTT, ou proposés par whisper.cpp puis **relus et corrigés** avant l'export.
- **La voix off** : enregistrée au micro par défaut ; Piper en option.
- **La musique** : aucune par défaut ; seulement celle que la personne apporte, avec ses droits.
- **La légende, les hashtags, le texte alternatif** : écrits par la personne (Ajmani local peut proposer, en option).
- **La publication** : un clic. Sans connecteur, l'app prépare les fichiers et la légende, et la personne publie depuis Instagram. La publication directe passe par un connecteur nommé, coupé par défaut (LOT-12, catégorie à ajouter, §8, question 6), jamais automatique.
- **Le droit d'usage d'un média** : noté par la personne (source, licence, accord du client) ; le studio le rappelle à l'export, il ne le devine pas.
- **Les droits d'image** : une personne visible sur une photo donne son accord ; le studio le demande, il ne le devine pas.

## 8. Questions au CO

Réglées par le plan (§1.43) : la GPL n'entre qu'en outil séparé (Piper, et ffmpeg s'il n'était pas LGPL) ; les polices libres OFL sont admises ; le modèle de détourage vient à la demande. Restent :

1. **sharp et canvas** : sharp pour l'export par lot dans le principal (plan), canvas pour l'aperçu et les exports simples dans le rendu (prouvé, 0 octet). D'accord pour les deux, chacun à sa place ?
2. **ffmpeg** : quelle construction LGPL (publique, ou faite par nous avec seulement les codecs utiles), et quel codeur H.264 (celui du système, ou openh264, BSD-2) ? Livré dans le paquet, ou installé par l'équipe comme whisper ?
3. **Preuves restantes** (§5) : à faire sur le poste de Harun, ou dans une session autorisée à télécharger ces binaires et modèles.
4. **Moteur de l'IA en option (≈ 15 Mo)** : livré dans le paquet, ou téléchargé à la demande avec le modèle ?
5. **Frontière avec LOT-06** : H17 (kit de l'entreprise) et MR01 (Vidéo) sont des écrans de S7. Le studio les lit et les prolonge (kit par client, production), ou il les absorbe ?
6. **Publication** : ajouter au catalogue de LOT-12 une catégorie « Réseaux sociaux » (local : préparer et publier à la main ; externe : l'API de publication de Meta, facultative, coupée par défaut) ?

## 9. Gardes

Note et essai seulement : aucun fichier de `src/`, aucune dépendance, aucun `node_modules` ni lien dans le dépôt. Les gardes passées avant le push sont dans le message au CO.

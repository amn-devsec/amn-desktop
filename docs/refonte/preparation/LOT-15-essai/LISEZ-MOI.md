# LOT-15 · essai minimal dans Electron

Preuve que les outils du studio tournent en local dans un **vrai Electron** (43.2.0, la version du dépôt), sans l'application, sans réseau, sur des images de synthèse. Résultat obtenu le 14 nov. : [`resultat.json`](resultat.json).

À rejouer dans un dossier neuf, **hors du dépôt** (aucun `node_modules` ici, aucun lien) :

```bash
mkdir essai-studio && cd essai-studio && npm init -y
```

```bash
npm install electron@43.2.0 sharp@0.34.5 smartcrop@2.0.5 onnxruntime-web@1.31.1
```

Copier ici `main.cjs`, `page.html` et `modele.mjs` dans un sous-dossier `essai/`, puis :

```bash
node essai/modele.mjs
```

```bash
npx electron essai/main.cjs
```

(Sur un Linux sans écran : `xvfb-run -a npx electron --no-sandbox essai/main.cjs`.)

Ce que l'essai fait : sharp et smartcrop dans le processus principal (trois formats Instagram), un ffmpeg séparé lancé par le processus principal avec son contrôle de licence, onnxruntime-web (WebAssembly) et smartcrop dans une fenêtre cachée isolée (`sandbox`, `contextIsolation`), et le recadrage par le canvas seul. Le modèle ONNX est construit à la main par `modele.mjs` (81 octets, une sigmoïde) : rien n'est téléchargé.

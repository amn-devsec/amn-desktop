# Lancer AMN Business sur mon PC (données fictives)

> Pour Harun. **Le socle v4 est fusionné** dans `claude/refonte-vivante` (14 nov.) : tu peux le suivre dès maintenant. Tout reste sur ton poste : l'application, une API d'essai qui garde tout en mémoire, et des données inventées. Rien ne part sur Internet, rien de réel n'est touché, et tout s'efface quand tu arrêtes.

## Ce qu'il faut avant de commencer

- **Windows**, avec **PowerShell** (toutes les commandes ci-dessous s'y tapent).
- **Node.js 22** : `node -v` doit afficher `v22.…`. Sinon, installe la version 22 LTS depuis nodejs.org.
- **Git**, et ton accès GitHub aux deux dépôts `amn-desktop` et `amn-api` de l'organisation `amn-devsec`.
- Environ 3 Go libres et 20 minutes la première fois.

## Règle de sécurité, avant tout

**Utilise un dossier neuf, rien que pour ces essais.** Ton dossier de travail habituel contient peut-être un fichier `.env` qui pointe vers le vrai serveur : on ne s'en sert pas. Ne copie jamais ce `.env` dans le dossier d'essai, et ne lance pas `npm start` (l'application Electron lit ce fichier). On utilise la version web, construite sur ton poste et branchée seulement sur l'API d'essai.

## 1. Récupérer le code (une seule fois)

```powershell
mkdir C:\AMN-essai
cd C:\AMN-essai
git clone -b claude/refonte-vivante https://github.com/amn-devsec/amn-desktop.git
git clone https://github.com/amn-devsec/amn-api.git
```

Les deux dépôts sont maintenant dans l'organisation `amn-devsec`. Les anciennes adresses `aaronsyaa-dev/…` redirigent aussi.

Les deux dossiers doivent être côte à côte : `C:\AMN-essai\amn-desktop` et `C:\AMN-essai\amn-api`.

Vérifie qu'aucun `.env` n'est arrivé :

```powershell
Test-Path C:\AMN-essai\amn-desktop\.env
```

La réponse doit être `False`.

## 2. Installer les dépendances (une seule fois, puis après chaque mise à jour)

```powershell
cd C:\AMN-essai\amn-desktop
npm ci --ignore-scripts
npm rebuild esbuild

cd C:\AMN-essai\amn-api
npm ci --ignore-scripts
npm rebuild better-sqlite3
```

## 3. Démarrer l'API d'essai (fenêtre PowerShell n° 1)

```powershell
cd C:\AMN-essai\amn-desktop
$env:AMN_API_ROOT = "C:\AMN-essai\amn-api"
node scripts/qualite/api-essai.mjs
```

Attends la ligne **« prête sur http://127.0.0.1:4171 »**, puis **laisse cette fenêtre ouverte** : c'est ton serveur d'essai. Il garde tout en mémoire, et ne répond qu'à ton poste (`127.0.0.1`).

## 4. Remplir l'espace avec des données inventées (fenêtre n° 2)

Ouvre une seconde fenêtre PowerShell :

```powershell
cd C:\AMN-essai\amn-desktop
$env:AMN_API = "http://127.0.0.1:4171"
$env:AMN_E2E_EMAIL = "essai.interne@exemple.test"
$env:AMN_E2E_PASSWORD = "Interne-2026-Essai"
node scripts/seed-essai.mjs
```

Ce compte et ce mot de passe sont **fictifs** : ils n'existent que dans l'API d'essai et disparaissent à l'arrêt.

Ce script remplit les écrans actuels. Pour y ajouter les jeux de données de la refonte (`src/refonte/donnees/`), dans la même fenêtre et avec le même compte :

```powershell
node scripts/charger-donnees-essai.mjs --volume normal
```

Le volume est `vide`, `peu`, `normal` ou `beaucoup` (`beaucoup` prend environ 8 minutes). Le script n'écrit que sur `127.0.0.1` et que pour un compte `@exemple.test`. Il remplace ce qu'il a déjà posé : relancer avec un autre volume suffit. Il dit à la fin quels jeux n'ont pas encore de collection où se ranger.

## 5. Construire l'application (fenêtre n° 2)

```powershell
$env:VITE_AMN_API_URL = "http://127.0.0.1:4171"
$env:AMN_WEB_OUT = "dist-essai"
node scripts/build-web.mjs
```

C'est l'édition interne, AMN Business. Compte une à deux minutes.

## 6. Ouvrir l'application (fenêtre n° 2)

```powershell
node scripts/servir-bundle.mjs dist-essai 4180
```

Ouvre ton navigateur sur **http://127.0.0.1:4180** et connecte-toi avec `essai.interne@exemple.test` / `Interne-2026-Essai`.

Si la nouvelle barre latérale n'apparaît pas, active-la dans Paramètres › Nouvelle coquille.

## 7. Arrêter

Dans chaque fenêtre, appuie sur **Ctrl + C**. Tout ce que tu as saisi disparaît avec l'API d'essai : c'est voulu.

## 8. Mettre à jour, après une fusion annoncée par le CO

```powershell
cd C:\AMN-essai\amn-desktop
git pull
npm ci --ignore-scripts
npm rebuild esbuild
```

Puis recommence aux étapes 3 à 6.

## À ne jamais faire

- Lancer `npm start`, ou copier un `.env` dans `C:\AMN-essai`.
- Mettre l'adresse d'un vrai serveur dans `VITE_AMN_API_URL` : seulement `http://127.0.0.1:4171`.
- Se connecter avec un vrai compte, ou importer des données réelles de clients.
- Envoyer `dist-essai` à quelqu'un : aucune distribution pour l'instant.

## Si ça bloque

| Ce que tu vois | Quoi faire |
|---|---|
| « amn-api introuvable » | Vérifie que `C:\AMN-essai\amn-api` existe, et que `$env:AMN_API_ROOT` est réglé dans la même fenêtre. |
| Une erreur qui parle de `better-sqlite3` | Vérifie que `node -v` affiche bien la version 22, puis relance `npm rebuild better-sqlite3` dans `amn-api`. |
| « EADDRINUSE » (port pris) | Une ancienne fenêtre tourne encore : ferme-la, ou appuie sur Ctrl + C dedans. |
| La connexion échoue | L'API d'essai (fenêtre n° 1) doit être prête **avant** l'étape 4. Relance les étapes 3 et 4. |
| Écran vide après connexion | Relance l'étape 4 : l'API d'essai repart vide à chaque démarrage. |
| Autre chose | Copie le message d'erreur, **sans aucun mot de passe ni jeton**, et envoie-le au CO. |

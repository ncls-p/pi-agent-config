# pi-agent-config

Configuration du [pi coding agent](https://github.com/earendil-works/pi) — extensions, thèmes, MCP servers, et packages npm.

## Contenu

| Dossier / Fichier | Description |
|---|---|
| `agent/settings.json` | Paramètres globaux (thème, modèles, packages) |
| `agent/mcp.json` | Serveurs MCP (WebAccess, chrome-devtools) |
| `agent/npm/` | Packages npm (`pi-lens`, `pi-mcp-adapter`) |
| `agent/extensions/` | Extensions TUI custom (`minimal-ui`) |
| `agent/themes/` | Thèmes TUI (`minimal-ui`) |
| `.mcp.json` | Config MCP partagée (vide = pas d'override) |
| `.gitignore` | Exclut les secrets et fichiers locaux |

## Installation sur une nouvelle machine

### 1. Pré-requis

- Node.js ≥ 20
- [pi coding agent](https://github.com/earendil-works/pi) installé

### 2. Cloner le repo

```bash
git clone git@github.com:ncls-p/pi-agent-config.git ~/.pi
```

### 3. Installer les packages npm

```bash
cd ~/.pi/agent/npm
npm install
```

### 4. Configurer les credentials locaux

Les fichiers suivants sont exclus du repo et doivent être créés manuellement :

- **`agent/auth.json`** — Tokens d'authentification (OAuth OpenAI, etc.)
- **`agent/models.json`** — Configuration des providers locaux (baseUrl, apiKey)
- **`agent/trust.json`** — Liste des répertoires de confiance

> 💡 `agent/mcp.json` utilise `${WEBACCESS_API_KEY}` — assure-toi que cette variable d'environnement est définie :
>
> ```bash
> export WEBACCESS_API_KEY="votre-cle-ici"
> ```

### 5. Lancer pi

```bash
pi
```

## Modèles configurés

| Provider | Modèle |
|---|---|
| cortex (local) | `nvidia/Qwen3.6-27B-NVFP4` |
| openai-codex | `gpt-5.5` |

## Thème

`minimal-ui` — Thème sombre minimaliste (fond `#0a0a0c`, texte blanc, accents bleus/violets).

## Fichiers non-suivis (`.gitignore`)

- `agent/auth.json` — Credentials OAuth
- `agent/models.json` — IPs/apiKeys locales
- `agent/trust.json` — Chemins de confiance
- `agent/sessions/` — Sessions de discussion
- `agent/bin/` — Binaires installés
- `agent/*cache*.json` — Caches MCP
- `agent/*onboarding*.json` — État onboarding
- `pi-acp/` — State ACP

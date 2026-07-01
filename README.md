# 🤖 pi-agent-config

Configuration for my [pi coding agent](https://github.com/earendil-works/pi) setup — extensions, themes, MCP servers, and npm packages.

## 📦 Contents

| Path | Description |
|---|---|
| `agent/settings.json` | Global settings (theme, models, packages) |
| `agent/mcp.json` | MCP server configuration (WebAccess, chrome-devtools) |
| `agent/npm/` | npm workspace (`pi-lens`, `pi-mcp-adapter`) |
| `agent/extensions/` | Custom TUI extensions (`minimal-ui`) |
| `agent/themes/` | TUI themes (`minimal-ui`) |
| `.mcp.json` | Shared MCP config (empty = no override) |
| `.gitignore` | Excludes secrets and local files |

## 🚀 Quick Start

### Prerequisites

- Node.js ≥ 20
- [pi coding agent](https://github.com/earendil-works/pi) installed

### Clone the repo

```bash
git clone git@github.com:ncls-p/pi-agent-config.git ~/.pi
```

### Install npm packages

```bash
cd ~/.pi/agent/npm
npm install
```

### Configure local credentials

The following files are git-ignored and must be created manually:

| File | Purpose |
|---|---|
| `agent/auth.json` | OAuth tokens (OpenAI, etc.) |
| `agent/models.json` | Local provider config (baseUrl, apiKey) |
| `agent/trust.json` | Trusted project directories |

> **Note:** `agent/mcp.json` references `${WEBACCESS_API_KEY}` — make sure this environment variable is set:
>
> ```bash
> export WEBACCESS_API_KEY="your-api-key-here"
> ```

### Start pi

```bash
pi
```

## 🤖 Models

| Provider | Model |
|---|---|
| **cortex** (local) | `nvidia/Qwen3.6-27B-NVFP4` |
| **openai-codex** | `gpt-5.5` |

## 🎨 Theme

`minimal-ui` — A minimal dark theme (background `#0a0a0c`, white text, blue/violet accents).

## 🔒 Excluded files (`.gitignore`)

| Pattern | Reason |
|---|---|
| `agent/auth.json` | OAuth credentials |
| `agent/models.json` | Internal IPs & API keys |
| `agent/trust.json` | Local trusted paths |
| `agent/sessions/` | Conversation session data |
| `agent/bin/` | Installed binaries |
| `agent/*cache*.json` | MCP runtime caches |
| `agent/*onboarding*.json` | Onboarding state |
| `pi-acp/` | ACP state |

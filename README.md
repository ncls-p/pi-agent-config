# pi-agent-config

My [pi coding agent](https://github.com/earendil-works/pi) configuration — TUI extensions, themes, MCP servers, and npm packages.

> ⚠️ **Not a standalone project.** This is a drop-in config repo meant to replace `~/.pi`.

---

## 📁 Structure

```
~/.pi/
├── .gitignore              # secrets, sessions, caches
├── .mcp.json               # empty shared MCP config
├── agent/
│   ├── settings.json       # theme, models, packages
│   ├── mcp.json            # MCP servers (WebAccess, chrome-devtools)
│   ├── npm/                # pi-lens, pi-mcp-adapter
│   ├── extensions/
│   │   └── minimal-ui/     # custom TUI extension
│   └── themes/
│       └── minimal-ui.json # dark minimal theme
└── pi-acp/                 # ACP state (gitignored)
```

---

## 🚀 Quick Setup

```bash
# 1. Install pi (Node.js ≥ 20 required)
#    Follow https://github.com/earendil-works/pi

# 2. Clone this repo as ~/.pi
git clone git@github.com:ncls-p/pi-agent-config.git ~/.pi

# 3. Install npm packages
cd ~/.pi/agent/npm && npm install

# 4. Create local secrets (NOT in this repo)
#    - agent/auth.json       # OAuth tokens (OpenAI, etc.)
#    - agent/models.json     # Local provider config (baseUrl, models)
#    - agent/trust.json      # Trusted workspace paths

# 5. Set the WebAccess API key env var
export WEBACCESS_API_KEY="your-key-here"

# 6. Done
pi
```

---

## 🤖 Models

| Provider | Model |
|---|---|
| **cortex** (local) | `nvidia/Qwen3.6-27B-NVFP4` |
| **openai-codex** | `gpt-5.5` |

Default provider: `cortex` · Default model: `Qwen3.6-27B-NVFP4`

---

## 🎨 Theme

**minimal-ui** — dark minimal theme:

- Background: `#0a0a0c` (near-black)
- Text: white, muted `#888`, dim `#555`
- Accents: blue `#93c5fd` / purple `#8b5cf6`
- User messages: amber `#fcd34d`
- Code: pink keywords, blue functions, green strings

The matching `minimal-ui` extension applies TUI-level customizations (header, footer, tool renderers).

---

## 🔧 MCP Servers

| Server | Source |
|---|---|
| **WebAccess** | `https://metamcp.nclsp.com` (env: `WEBACCESS_API_KEY`) |
| **chrome-devtools** | `npx chrome-devtools-mcp@latest` |

---

## 📦 Packages

| Package | Version |
|---|---|
| `pi-lens` | ^3.8.62 |
| `pi-mcp-adapter` | ^2.10.0 |

---

## 🚫 Excluded from git

Files tracked by `.gitignore` — create them locally:

| Path | Why |
|---|---|
| `agent/auth.json` | OAuth tokens |
| `agent/models.json` | Internal IPs & API keys |
| `agent/trust.json` | Local trusted paths |
| `agent/sessions/` | Chat session history |
| `agent/bin/` | Installed binaries |
| `agent/*cache*.json` | MCP caches |
| `agent/*onboarding*.json` | Onboarding state |
| `pi-acp/` | ACP session state |

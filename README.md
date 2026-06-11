# pi-agent-config

Backup de mes customs Pi (`~/.pi`) sans credentials/runtime.

## Install en 1 commande

```bash
sh -c 'tmp=$(mktemp -d) && git clone git@github.com:ncls-p/pi-agent-config.git "$tmp" && mkdir -p "$HOME/.pi" && rsync -av --exclude=.git "$tmp"/ "$HOME/.pi"/ && rm -rf "$tmp"'
```

Après install, les credentials ne sont pas inclus : recrée/login tes auth Pi et copie `agent/models.example.json` vers `~/.pi/agent/models.json` si besoin, puis remets tes clés/API tokens localement.

## Contenu sauvegardé

- `agent/settings.json`
- `agent/mcp.json`
- `agent/models.example.json` (sanitisé)
- `agent/extensions/`
- `agent/skills/` si présent
- `agent/prompts/` si présent
- `agent/themes/`
- mémoires Markdown Pi/Hermes et project memories
- liste des packages npm Pi (`agent/npm/package*.json`)

## Exclu volontairement

Credentials, sessions, caches, DB, binaries, `node_modules`, `trust.json`, `context-mode`, deps vendorizées.

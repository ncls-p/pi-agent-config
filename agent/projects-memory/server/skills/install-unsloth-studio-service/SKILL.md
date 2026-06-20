---
name: "install-unsloth-studio-service"
description: "Install or repair Unsloth Studio as a uv-managed user systemd service in this server repo"
version: 3
created: "2026-06-13"
updated: "2026-06-13"
---
## When to Use
Use when installing, updating, or repairing /home/ncls/server/unsloth-studio or its integration with llama-service and the global queue proxy.

## Procedure
1. Install with uv into stock Unsloth location: `STUDIO_HOME=$HOME/.unsloth/studio; uv venv --python 3.12 $STUDIO_HOME/unsloth_studio; uv pip install --python $STUDIO_HOME/unsloth_studio/bin/python --torch-backend=auto unsloth`.
2. Run the packaged Studio setup with no custom storage env: `PATH=$STUDIO_HOME/unsloth_studio/bin:$PATH SKIP_STUDIO_BASE=1 SKIP_STUDIO_FRONTEND=0 STUDIO_PACKAGE_NAME=unsloth STUDIO_LOCAL_INSTALL=0 STUDIO_LOCAL_REPO= UNSLOTH_NO_TORCH=false bash $( $STUDIO_HOME/unsloth_studio/bin/python -c "import importlib.resources; print(importlib.resources.files('studio') / 'setup.sh')" )`.
3. Maintain `unsloth-studio/systemd/unsloth-studio.service` as a stock-style service: `WorkingDirectory=/home/ncls/.unsloth/studio`, `ExecStart=/home/ncls/.unsloth/studio/unsloth_studio/bin/unsloth studio -H 0.0.0.0 -p 8888 --no-cloudflare`, and only a minimal PATH override.
4. Do not set `UNSLOTH_STUDIO_HOME`, `HF_HUB_CACHE`, `LLAMA_CACHE`, `LLAMA_SERVER_PATH`, or `UNSLOTH_LLAMA_CPP_PATH` in the service; the user requested stock Unsloth storage/discovery behavior.
5. Symlink the unit into `~/.config/systemd/user`, run `systemctl --user daemon-reload`, then enable/restart `unsloth-studio.service`.
6. Keep the global queue proxy (8081) independent for llama/image/video/music. Do not route root/assets/API to Unsloth; Unsloth UI is direct on port 8888.
## Pitfalls
- Do not use Docker; the user prefers uv/local venv installs.
- The official shell installer may require sudo for `libcurl4-openssl-dev`; avoid it if sudo is unavailable by using uv and the packaged setup path.
- If `--cloudflare` is left enabled while binding `0.0.0.0`, Studio starts a cloudflared tunnel; use `--no-cloudflare` for local service mode.

## Verification
- `systemctl --user status unsloth-studio.service --no-pager` is active and the process path is under `/home/ncls/.unsloth/studio/unsloth_studio`.
- `curl http://127.0.0.1:8888/api/health` returns healthy JSON.
- `tr '\0' '\n' < /proc/$(systemctl --user show -p MainPID --value unsloth-studio.service)/environ | grep -E '^(HF_HUB_CACHE|LLAMA_CACHE|LLAMA_SERVER_PATH|UNSLOTH_LLAMA_CPP_PATH|UNSLOTH_STUDIO_HOME)='` returns no lines.
- `curl http://127.0.0.1:8081/health` still reports llama/image/video/music only.
- `curl http://127.0.0.1:8081/` serves llama.cpp; `curl http://127.0.0.1:8888/` serves Unsloth Studio.
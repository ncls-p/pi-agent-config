---
name: "add-local-image-service-model"
description: "Add and validate a local model in this user's /home/ncls/server/image-service"
version: 1
created: "2026-06-04"
updated: "2026-06-04"
---
## When to Use
Use when working on this user's OpenAI-compatible image-service under /home/ncls/server/image-service to add or validate image-generation/editing models.

## Procedure
1. Install Python dependencies into the service environment with uv, e.g. `cd /home/ncls/server/image-service && uv pip install --python .venv/bin/python ...`.
2. Update `/home/ncls/server/image-service/config/models.ini` with a model section; set `backend`, `pipeline`, `task`, repo/paths, size and generation parameters explicitly when they differ from global defaults.
3. If the model is Hugging Face gated, accept the license and authenticate the service HF cache with `HF_HOME=/home/ncls/server/image-service/cache/huggingface uv run --python .venv/bin/python hf auth login`.
4. Run `./scripts/apply-ini.sh --restart` from `/home/ncls/server/image-service`.
5. Verify `/v1/models?reload=1` includes the new model and run a small smoke generation using `response_format=b64_json`, saving decoded output to `outputs/` rather than printing raw base64.

## Pitfalls
- Do not use bare pip/venv commands; this setup prefers uv for Python env changes.
- Avoid printing API tokens or full base64 image payloads in logs/context.
- Global `models.ini` defaults may be inherited unexpectedly; override `backend`, `device`, `dtype`, and other critical fields in the model section.

## Verification
1. `systemctl --user is-active image-service.service` returns active.
2. `curl -sS 'http://127.0.0.1:8090/v1/models?reload=1'` lists the model.
3. A smoke request to `/v1/images/generations` returns HTTP 200 and the decoded PNG exists in `/home/ncls/server/image-service/outputs`.
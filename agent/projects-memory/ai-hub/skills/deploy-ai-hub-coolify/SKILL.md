---
name: "deploy-ai-hub-coolify"
description: "Build, smoke-test, and deploy this repo's single AI Hub app to Coolify at maiah.shiftify.eco"
version: 2
created: "2026-06-11"
updated: "2026-06-15"
---
## When to Use
Use when deploying ai-hub to the Deodis internal Coolify project or debugging its Docker/Coolify deployment.

## Procedure
1. Keep the deployment model as one web app plus support services: app, worker, migrate, postgres, dragonflydb, garage, garage-init, searxng. Do not copy mono-repo's multi-web-app web-admin/web-platform/web-user structure.
2. Validate compose files with `docker compose -f docker-compose.prod.yml config --no-interpolate`, `docker compose -f docker-compose.dev.yml config --no-interpolate`, and `docker compose -f .coolify/stack.compose.yml config --no-interpolate`.
3. Validate npm/Docker compatibility with `npx --yes npm@10.9.8 ci --ignore-scripts` because Docker Node 22 currently uses npm 10.
4. Run `npm run typecheck`, `npm run lint`, `npm run test:ci`, and a production `npm run build` with safe env placeholders.
5. Build Docker targets: `runner`, `worker`, `migrator`, `garage`, and `garage-init`. The Coolify workflow pushes these as GHCR images and patches `.coolify/stack.compose.yml` into the single `ai-hub` Coolify service.
6. For local production smoke, export valid non-placeholder secrets and run `docker compose -f docker-compose.prod.yml up -d --build`; validate `http://127.0.0.1:3001/api/health` returns 200, then clean with `docker compose -f docker-compose.prod.yml down -v --remove-orphans`.
7. Remote deploy requires GitHub/Coolify secrets: `COOLIFY_TOKEN`, `POSTGRES_PASSWORD`, `BETTER_AUTH_SECRET`, `APP_ENCRYPTION_KEY`, `DRAGONFLY_PASSWORD`, `OBJECT_STORAGE_ACCESS_KEY_ID`, `OBJECT_STORAGE_SECRET_ACCESS_KEY`. The workflow targets `https://maiah.shiftify.eco`.

## Pitfalls
- Do not rely on Coolify `AI_HUB_*_IMAGE` environment variables alone for image rollout; render image refs directly into the Compose payload before sending it to Coolify to avoid stale image env values.
- For SearXNG 2026.6.15+, keep the Docker `searxng` target build-time validation that removes `woxikon.de synonyme`/`wikimini` and verifies `EngineAbout` metadata, otherwise granian can crash with `Unexpected keyword argument 'language'`.
- SearXNG must be treated as healthy, not merely started; app/worker should depend on `searxng` with `condition: service_healthy`.
## Verification
1. Compose config commands all exit 0.
2. Typecheck/lint/tests/build exit 0.
3. Docker target builds exit 0.
4. Local `/api/health` returns JSON with `status: ok` and `database: connected`.
5. After remote deploy, `https://maiah.shiftify.eco/api/health` returns HTTP 200.
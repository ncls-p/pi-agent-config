---
name: "work-with-ai-hub-deployment"
description: "Work with AI Hub deployment — Docker images, Docker Compose, Coolify, and CI/CD pipeline."
version: 1
created: "2026-07-05"
updated: "2026-07-05"
---
## When to Use
Use when working with AI Hub deployment — Docker builds, Docker Compose, Coolify, CI/CD, environment variables, or production setup. Triggers on: deploy, Docker, Docker Compose, Coolify, CI/CD, production, environment variables.

## Procedure
1. Identify the deploy target: local dev, local prod, Coolify production, or PR preview.
2. For local dev: docker compose -f docker-compose.dev.yml up -d.
3. For local prod: docker compose -f docker-compose.prod.yml up -d --build.
4. For Docker builds: docker build --target {runner|worker|migrator} -t ai-hub-{name}:latest .
5. For Coolify: push to main (production) or create PR (preview).
6. Check docs/deployment.md for env vars, resource limits, and volume config.
7. Verify health checks: /api/health (app) and /health on :3001 (worker).

## Pitfalls
- Never set NODE_ENV in .env files — Next.js manages it.
- Use APP_ENV for runtime environment detection.
- Sandbox runner requires network_mode: none and read-only filesystem.
- Postgres + pgvector must use the pgvector/pgvector:pg16 image.
- Worker must run migrations before starting (CMD includes migrate-standalone.mjs).
- Coolify deploys use GHCR images pinned to commit SHA.
- PR previews auto-delete on PR close — don't rely on them for data persistence.
- Volume names differ between dev (postgres-dev-data) and prod (postgres-prod-data).

## Verification
1. Docker build succeeds for all required targets.
2. Docker Compose starts without errors.
3. Health checks pass for all services.
4. App is accessible on the expected port.
5. Worker health check responds on :3001/health.
6. Migrations run successfully on startup.
7. docs/deployment.md is up-to-date with any changes.
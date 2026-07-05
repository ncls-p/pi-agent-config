---
name: "navigate-ai-hub-codebase"
description: "Navigate and work with AI Hub codebase using its comprehensive documentation — architecture, API reference, database schema, and deployment guides."
version: 1
created: "2026-07-05"
updated: "2026-07-05"
---
## When to Use
Use when working on the AI Hub codebase — navigating modules, understanding architecture, finding API routes, database schema, or deployment configuration. Triggers on: AI Hub, ai-hub, workspace, agents, chat, providers, MCP, knowledge base, marketplace, scheduled tasks.

## Procedure
1. Identify the task category: architecture, API, database, deployment, user guide, or developer workflow.
2. Load the relevant doc: docs/architecture.md (architecture overview), docs/api-reference.md (endpoints), docs/database-reference.md (schema), docs/deployment.md (deploy), docs/user-guide.md (features), docs/developer-guide.md (dev workflow).
3. For API changes: check docs/api-reference.md for endpoint patterns, then find the route in src/app/api/workspace/{feature}/route.ts.
4. For DB changes: check docs/database-reference.md for table definitions, then modify src/server/infrastructure/db/schema-tables/, run npm run db:generate.
5. For module changes: check docs/architecture.md Core Modules section, then edit src/modules/{feature}/use-cases.ts.
6. For deployment changes: check docs/deployment.md for Docker targets, compose files, and env vars.
7. Cross-reference README.md for quick commands and .env.example for environment variable reference.

## Pitfalls
- Never edit schema tables without also updating schema-relations.ts if new tables have foreign keys.
- Always use handleRoute() for workspace routes and handleAdminRoute() for admin routes — never skip the auth wrapper.
- Always check IAM permissions before CRUD operations — use requireWorkspacePermissionAsync().
- The chat route is the most complex file (~1093 lines) — use read_enclosing to find specific sections rather than reading the whole file.
- Sandbox runner uses a Unix socket — check .data/sandbox-runner/sandbox.sock path in dev.
- Drizzle migrations must be generated with npm run db:generate, not written manually (except edge cases).

## Verification
1. Documentation file exists at docs/{name}.md and is up-to-date with the codebase.
2. Changes follow the 4-layer architecture: routes → modules → domain → infrastructure.
3. New routes use handleRoute() or handleAdminRoute() with IAM permission checks.
4. Database migrations are generated and reviewed before pushing.
5. All blocking diagnostics pass (lsp_diagnostics + lens_diagnostics).
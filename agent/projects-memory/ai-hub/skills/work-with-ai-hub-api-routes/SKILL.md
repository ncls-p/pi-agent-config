---
name: "work-with-ai-hub-api-routes"
description: "Work with AI Hub API routes — add new routes, understand existing routes, debug route handlers, and implement permission checks."
version: 1
created: "2026-07-05"
updated: "2026-07-05"
---
## When to Use
Use when working with AI Hub API routes — adding new endpoints, modifying existing routes, debugging route handlers, or implementing permission checks. Triggers on: API route, route handler, endpoint, handleRoute, permission check, workspace API.

## Procedure
1. Locate the route file: src/app/api/workspace/{feature}/route.ts or nested [param]/route.ts.
2. Read the route handler with module_report() to understand the structure.
3. For new routes: create route.ts with handleRoute() or handleAdminRoute().
4. Add input validation with Zod schemas.
5. Add IAM permission checks with requireWorkspacePermissionAsync().
6. Delegate to module use cases in src/modules/{feature}/use-cases.ts.
7. Add error handling in the expectedError() callback.
8. Test the route with curl or the internal API client.

## Pitfalls
- Always use handleRoute() for workspace routes — never write raw auth checks.
- Use requireWorkspacePermissionAsync() for IAM checks — never inline authorization.hasPermission() in route handlers.
- Validate all input with Zod — never trust request body directly.
- Admin routes must use handleAdminRoute() — not handleRoute().
- Return proper HTTP status codes: 400 for bad input, 401 for unauth, 403 for forbidden, 404 for not found, 409 for conflicts.
- Set logLabel in route options for proper error logging.

## Verification
1. Route file exists with proper Next.js export (GET/POST/PATCH/DELETE).
2. Route uses handleRoute() or handleAdminRoute() wrapper.
3. Input is validated with Zod schema before processing.
4. IAM permission check is present for protected operations.
5. Business logic is delegated to module use cases.
6. Error responses include proper status codes and messages.
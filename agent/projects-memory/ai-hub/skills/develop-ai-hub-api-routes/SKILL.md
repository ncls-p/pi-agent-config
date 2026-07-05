---
name: "develop-ai-hub-api-routes"
description: "Develop API routes and module use cases in AI Hub following the 4-layer architecture pattern."
version: 1
created: "2026-07-05"
updated: "2026-07-05"
---
## When to Use
Use when developing API routes or module use cases in AI Hub. Triggers on: API route, route handler, use case, module, create API, add endpoint, CRUD, workspace route.

## Procedure
1. Check docs/api-reference.md for existing endpoint patterns and naming conventions.
2. Find the route file at src/app/api/workspace/{feature}/route.ts.
3. If new feature: create the route file, module use case, and UI components.
4. Use handleRoute() for workspace routes and handleAdminRoute() for admin routes.
5. Validate input with Zod schemas before processing.
6. Check IAM permissions with requireWorkspacePermissionAsync() or authorization.hasPermission().
7. Delegate to module use cases in src/modules/{feature}/use-cases.ts.
8. Return NextResponse.json() with appropriate status codes.
9. Add error handling in the expectedError callback.
10. Write unit tests in test/unit/ for the module use cases.

## Pitfalls
- Never put business logic in route handlers — delegate to modules.
- Always validate with Zod before processing — never trust client input.
- Always check IAM permissions — use requireWorkspacePermissionAsync().
- Use handleRoute() wrapper — never skip session auth and error handling.
- UUID validation: use z.uuid() for workspace/agent/provider IDs.
- Expected errors: return 400 for bad input, 404 for not found, 409 for conflicts.
- Async params: Next.js 16 uses Promise<{ param: string }> for route params.
- Workspace isolation: always filter by workspaceId in queries.

## Verification
1. Route compiles without TypeScript errors.
2. Route passes lint check.
3. IAM permission checks are in place.
4. Zod validation covers all input fields.
5. Module use cases have unit tests.
6. docs/api-reference.md is updated with new endpoints.
---
name: "validate-ai-hub-test-coverage-and-ci"
description: "Validate AI Hub unit coverage, E2E discovery, and CI test integration after test changes."
version: 1
created: "2026-07-02"
updated: "2026-07-02"
---
## When to Use
Use after adding or changing AI Hub unit/E2E tests or CI workflow steps for tests.

## Procedure
1. Run `npm run lint` and fix errors/warnings introduced by the current change.
2. Run `npm run typecheck`.
3. Run `npx vitest run --coverage` and confirm no coverage threshold errors; parse `coverage/coverage-final.json` if an exact percentage is needed.
4. Run `npx playwright test --list` to confirm E2E discovery count before attempting full browser execution.
5. For CI, run Vitest via `npm run test:coverage`, install Chromium with `npx playwright install --with-deps chromium`, build the app, start it with `npm run start`, wait for `http://localhost:3000`, then run `npm run test:e2e` with CI database/auth/object-storage env vars.

## Pitfalls
- Avoid broad `vi.mock()` of internal `@/` modules in coverage tests unless using `vi.importActual`; full mocks can reduce V8 source coverage unexpectedly.
- Do not globally mock `next/server` in route-helper tests when real `NextResponse` works; it can reduce coverage for the module under test.
- E2E fixtures require a migrated PostgreSQL schema before inserting the shared E2E user.
- GitHub Actions `uses:` references may trigger zizmor/semgrep errors unless pinned to full commit SHAs.

## Verification
1. `npm run lint` exits 0.
2. `npm run typecheck` exits 0.
3. `npx vitest run --coverage` exits 0 and coverage is at or above the configured threshold.
4. `npx playwright test --list` reports the expected E2E tests.
5. CI YAML has no blocking diagnostics; non-blocking warnings are understood and documented.
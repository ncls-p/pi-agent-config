AI Hub Vitest/testing quirks: `vi.mock` factories are hoisted (use `vi.hoisted`/factory-local values); Next/server-only imports may need dependency mocks or pure-logic tests to avoid Client Component import errors; V8 coverage undercounts when mocking the module under test, so mock dependencies instead. <!-- created=2026-07-02, last=2026-07-02 -->
§
[tool-quirk] When edit/replace reports content drift or stale preview, re-read the exact file range and rebuild oldText from current verbatim content rather than retrying from memory. — Failed: Several edits failed due to stale oldText/content drift. <!-- created=2026-07-02, last=2026-07-02 -->
§
When WebAccess search/fetch tools are missing, limited, stale, or failing, refresh/reconnect the WebAccess MCP; after reconnect it may expose newer omnifeed web_search/fetch_url and context7 tools. <!-- created=2026-07-02, last=2026-07-02 -->
§
AI Hub sandbox-runner lessons: treat `sdcb/code-interpreter`/OpenSandbox only as slow fallback/reference; use a lean custom runner for deploy speed. Runtime tmpfs can reset ownership, so chown/chmod run dirs for the sandbox user. Avoid overly tight PID limits; cap BLAS thread env vars (`OPENBLAS_NUM_THREADS`, `OMP_NUM_THREADS`, `MKL_NUM_THREADS`, `NUMEXPR_NUM_THREADS`) and keep `SANDBOX_MAX_PROCESSES` high enough for NumPy/pandas. <!-- created=2026-07-02, last=2026-07-02 -->
§
AI Hub custom sandbox-runner: tmpfs mounts reset ownership/permissions, so chown/chmod `SANDBOX_RUN_ROOT` at runtime and make run dirs/files accessible to the sandbox user. NumPy/pandas/OpenBLAS can fail under tight PID/thread limits; cap `OPENBLAS_NUM_THREADS`, `OMP_NUM_THREADS`, `MKL_NUM_THREADS`, and `NUMEXPR_NUM_THREADS` to 1 and keep `SANDBOX_MAX_PROCESSES` high enough (e.g. 256). <!-- created=2026-07-02, last=2026-07-02 -->
§
[failure] Do not create or modify skills when extracting durable memories from conversations; a prior assistant incorrectly created a project skill during an ai-hub coding session despite the memory-extraction scope forbidding skill changes. <!-- created=2026-07-02, last=2026-07-02 -->
§
[tool-quirk] In ai-hub, `gh` CLI is unavailable; use GitHub REST API via curl/python for Actions status. REST log download may return HTTP 403 without admin rights, but workflow/job statuses and image digests can still be queried. <!-- created=2026-07-02, last=2026-07-02 -->
§
[failure] ai-hub sandbox-runner smoke test initially failed with `Permission denied` opening files under `/sandbox-runs` when the runner dropped execution to the sandbox user but the tmpfs/run directories were root-owned; ensure run directories/files are owned or accessible by the sandbox execution user. <!-- created=2026-07-02, last=2026-07-02 -->
§
[convention] AI Hub chat route convention: never grant model-only special UI capabilities without explicit enabled tools. Code workspace creation/editing must go through bound code_workspace_* tools; do not reintroduce markdown-fence auto workspace creation or auto-enable code workspace edit tools just because a code workspace is attached. <!-- created=2026-07-02, last=2026-07-02 -->
§
[insight] AI Hub accessibility audit insight: JSX a11y lint does not catch custom wrapper controls (`Input`, `Textarea`, `SelectTrigger`, `Switch`, `Checkbox`), so audit them with a custom search/script and require each opening tag to have an explicit `id`, `aria-label`, or `aria-labelledby`. <!-- created=2026-07-02, last=2026-07-02 -->
§
[tool-quirk] GitHub REST polling without authentication can hit the 60 req/hour rate limit while `gh` is unavailable; use an authenticated token/App route when checking Actions status repeatedly. <!-- created=2026-07-02, last=2026-07-02 -->
§
[correction] Do not create project skills during ai-hub coding work unless the user explicitly asks for a skill; prior sessions created validation/accessibility project skills unnecessarily while implementing fixes. <!-- created=2026-07-02, last=2026-07-02 -->
§
[insight] When generating Playwright test fixtures with `test.extend`, unused parameters (like `page` inside the fixture factory if not explicitly used in the fixture logic) cause TypeScript/LSP errors. Ensure fixture factories use or prefix with `_` any injected fixtures that are not directly used in the factory logic. <!-- created=2026-07-02, last=2026-07-02 -->
§
[failure] Vitest coverage threshold is strictly enforced at >=95% statements/lines (configured in vitest.config.mts via V8 provider). The `coverage` directory may not exist or be empty after initial runs; use `npx vitest run --coverage` and check JSON reporter if CLI output is truncated. Uncovered files currently include `src/modules/auth/session.ts` (requires mocking `next/headers`) and `src/lib/logger.ts` (conditional formatting based on NODE_ENV). — Failed: Vitest coverage run failed with 'ERROR: Coverage for lines (94.82%) does not meet global threshold (95%)'. <!-- created=2026-07-02, last=2026-07-02 -->
§
[tool-quirk] When creating Playwright fixtures that extend the base test (`test.extend`), do not pass extra arguments to the `run` callback (e.g., `await run()` instead of `await run(page)`). If the fixture doesn't need to modify the page, just call `await run()`. Ensure imports are minimal to avoid unused variable errors (e.g., import `test` directly if not aliasing `base`). — Failed: Playwright extend fixture type errors: 'Property page does not exist', 'Expected 1 arguments, but got 0'. <!-- created=2026-07-02, last=2026-07-02 -->
§
[tool-quirk] Playwright Locator does not have an `addLocatorPopup` method. To handle dialogs/popups in specific contexts, use `page.route()` for network interception or standard locator interactions. For browser dialogs, use `page.on('dialog', ...)`. — Failed: TypeScript error: Property 'addLocatorPopup' does not exist on type 'Locator'. <!-- created=2026-07-02, last=2026-07-02 -->
§
[tool-quirk] Creating Playwright test fixtures: `test.extend` returns a `TestType`, but accessing the `page` fixture directly in extended functions requires correct typing. Avoid importing `test as base` if not needed; use direct imports from `@playwright/test`. Watch for 'unused variable' errors on helper variables like `foundTemplate` in test assertions. <!-- created=2026-07-02, last=2026-07-02 -->
§
[failure] Playwright `addLocatorPopup` method does not exist on `Locator` type in recent versions; use standard locator strategies or `page` level methods for handling popups/alerts. <!-- created=2026-07-02, last=2026-07-02 -->
§
[tool-quirk] Vitest V8 coverage reports incorrect (lower) percentages when tests use `vi.mock()` on the modules being measured, because mocking prevents the real code execution from being tracked by the V8 profiler. To maintain accurate coverage metrics, avoid mocking the modules included in the `vitest.config.mts` coverage include paths (e.g., `src/lib/`, `src/modules/`, `src/server/domain/`). Instead, mock their dependencies or use test doubles that don't replace the entire module under test. <!-- created=2026-07-02, last=2026-07-02 -->
§
[correction] If user corrects an E2E request with '95% coverage', immediately pivot to Vitest unit coverage and remove/ignore unnecessary Playwright work unless explicitly requested. <!-- created=2026-07-02, last=2026-07-02 -->
§
[correction] For /home/ncls/server/vllm-service Qwen3.6-27B-NVFP4, do not keep experimental 175K/184K context settings unless explicitly re-requested; user said to leave it at 160K after 184K crashed during a code task. — Failed: User cancelled the 175K context change after requesting it and explicitly said to leave Qwen at 160K. <!-- created=2026-07-03, last=2026-07-03 -->
§
[tool-quirk] In Next.js 16.2.6, `@next/env` exports `loadEnvConfig` as a named export, not a default export. Importing via `import nextEnv from "@next/env"` results in `undefined`, causing `TypeError: Cannot read properties of undefined (reading 'loadEnvConfig')`. Correct import is `import { loadEnvConfig } from "@next/env";`. — Failed: Importing `@next/env` as default export in Next.js 16.x causes runtime TypeError because `loadEnvConfig` is a named export. <!-- created=2026-07-03, last=2026-07-03 -->
§
[correction] When fixing basic-user onboarding/permissions in ai-hub, also verify the zero-data path (fresh user/workspace with no assistant/provider/model) and ensure logout remains accessible; do not only test permission lists or configured workspaces. <!-- created=2026-07-03, last=2026-07-03 -->
§
[correction] ai-hub chat empty-state correction: when agents.length===0, do not return a standalone full-page NoAssistantsState that hides navigation/sidebar/sign-out. Basic users in an empty workspace must still see app shell/logout and actionable self-service paths such as creating an assistant. — Failed: A basic user with no prior setup was trapped on “Create one or finish setup to start chatting” and could not even log out. <!-- created=2026-07-03, last=2026-07-03 -->
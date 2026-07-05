User prefers French when appropriate and terse autonomous coding workflow: proceed on brief commands, verify with tests/coverage/diagnostics before reporting, and for validated ai-hub deployment/sandbox fixes update deploy config if relevant, commit/push, and report branch/commit/status succinctly. <!-- created=2026-07-02, last=2026-07-02 -->
§
Environment fact: the `gh` CLI is not installed in /home/ncls/work/deodis/ai-hub; use GitHub REST API via curl/python for Actions status when needed. <!-- created=2026-07-02, last=2026-07-02 -->
§
When web research tools seem incomplete or failing, user may ask to refresh/reconnect the WebAccess MCP; after refresh, use the newly available WebAccess tools proactively for searches/fetches. <!-- created=2026-07-02, last=2026-07-02 -->
§
User requested adding structured logging across all API routes and services using `src/lib/logger` (e.g., `logHandledWarning`, `logHandledError`, `logger.info`); implement in route handlers (`src/app/api/...`) and sandbox runner (`scripts/sandbox-runner.mjs`). <!-- created=2026-07-02, last=2026-07-02 -->
§
User interprets "test coverage" as unit test coverage (Vitest) with a strict >=95% threshold, not just E2E tests. When coverage is requested, prioritize generating unit tests to meet the quantitative coverage goal over writing E2E tests alone. <!-- created=2026-07-02, last=2026-07-02 -->
§
User distinguishes between 'test coverage e2e' (Playwright) and '95% coverage' (Vitest unit tests). When the user requests coverage with a percentage threshold, they are referring to Vitest unit test coverage, not E2E test count or breadth. The existing memory about interpreting 'test coverage' as Vitest is correct but this interaction reinforces that E2E requests should not trigger unit test generation unless explicitly requested as 'coverage'. <!-- created=2026-07-02, last=2026-07-02 -->
§
When user requests 'test coverage e2e', they actually mean Vitest unit test coverage (not Playwright E2E). The default coverage target is >=95%. If initial coverage is below 95%, generate additional unit tests for the most impactful uncovered files to meet the threshold. <!-- created=2026-07-02, last=2026-07-02 -->
§
When the user requests 'test coverage e2e' but follows up with a percentage threshold (e.g., '95% coverage'), they are referring to Vitest unit test coverage, not Playwright E2E tests. The agent should interpret the percentage target as the primary goal for unit tests and generate/extend unit tests to meet the >=95% threshold. <!-- created=2026-07-02, last=2026-07-02 -->
§
When the user requests '95% coverage' or just 'coverage', they are referring to Vitest unit test coverage with a strict >=95% threshold. This overrides any request for 'e2e' tests; if the user initially asks for e2e but then corrects with '95% coverage' or 'continue' after being low, prioritize generating Vitest unit tests to meet the threshold. <!-- created=2026-07-02, last=2026-07-02 -->
§
User distinguishes strictly between 'e2e' (Playwright) and 'coverage' (Vitest unit tests with >=95% threshold). When the user initially requests 'e2e' tests but follows up with '95% coverage', the agent must pivot immediately to generating/extending Vitest unit tests to meet the quantitative threshold, disregarding the initial E2E request context. <!-- created=2026-07-02, last=2026-07-02 -->
§
When adding or expanding tests in ai-hub, user expects the tests to be wired into CI/CD before commit/push, not only validated locally. <!-- created=2026-07-02, last=2026-07-02 -->
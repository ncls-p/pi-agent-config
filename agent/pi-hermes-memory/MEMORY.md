User communicates primarily in French and is comfortable giving terse commands like “continue”; respond in French when appropriate and proceed autonomously on coding tasks. <!-- created=2026-07-02, last=2026-07-02 -->
§
User expects coding work to be verified with tests/coverage and diagnostics before reporting completion; when asked to commit and push, perform git commit/push and report branch/commit succinctly. <!-- created=2026-07-02, last=2026-07-02 -->
§
For ai-hub deployment-related changes, user expects the agent to update deployment config and commit/push once a solution is validated, without waiting for another explicit commit instruction. <!-- created=2026-07-02, last=2026-07-02 -->
§
Environment fact: the `gh` CLI is not installed in /home/ncls/work/deodis/ai-hub; use GitHub REST API via curl/python for Actions status when needed. <!-- created=2026-07-02, last=2026-07-02 -->
§
When user says "go" or asks to validate a deployment-related fix in ai-hub, they expect autonomous implementation, validation, deployment config updates if relevant, commit, push, and concise status without waiting for extra approval. <!-- created=2026-07-02, last=2026-07-02 -->
§
For ai-hub sandbox/deployment work, if a validated approach is still too slow for deployments, pivot proactively to a lean custom implementation; user expects commit/push after validation without extra prompting. <!-- created=2026-07-02, last=2026-07-02 -->
§
When web research tools seem incomplete or failing, user may ask to refresh/reconnect the WebAccess MCP; after refresh, use the newly available WebAccess tools proactively for searches/fetches. <!-- created=2026-07-02, last=2026-07-02 -->
§
User strongly prefers autonomous execution for ai-hub deployment/sandbox fixes: once a viable approach is validated, update deploy config, commit, push, and report status without waiting for another prompt. <!-- created=2026-07-02, last=2026-07-02 -->
§
User requested adding logging across API routes and services; implement logging using `src/lib/logger` (e.g., `logHandledWarning`, `logHandledError`) in route handlers (`src/app/api/...`) and sandbox runner (`scripts/sandbox-runner.mjs`). <!-- created=2026-07-02, last=2026-07-02 -->
§
User requested adding structured logging across all API routes and services using `src/lib/logger` (e.g., `logHandledWarning`, `logHandledError`, `logger.info`); implement in route handlers (`src/app/api/...`) and sandbox runner (`scripts/sandbox-runner.mjs`). <!-- created=2026-07-02, last=2026-07-02 -->
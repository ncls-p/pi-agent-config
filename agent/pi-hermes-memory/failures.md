Vitest quirks: `vi.mock` factories are hoisted (use `vi.hoisted`/factory-local values), and Next/server-only imports may need mocking or pure-logic tests to avoid Client Component import errors. <!-- created=2026-07-02, last=2026-07-02 -->
§
[tool-quirk] When edit/replace reports content drift or stale preview, re-read the exact file range and rebuild oldText from current verbatim content rather than retrying from memory. — Failed: Several edits failed due to stale oldText/content drift. <!-- created=2026-07-02, last=2026-07-02 -->
§
[tool-quirk] Next/server-only modules can fail in Vitest with “This module cannot be imported from a Client Component module”; mock server-only or test pure logic separately when importing server-only files. <!-- created=2026-07-02, last=2026-07-02 -->
§
When WebAccess search/fetch tools are missing, limited, stale, or failing, refresh/reconnect the WebAccess MCP; after reconnect it may expose newer omnifeed web_search/fetch_url and context7 tools. <!-- created=2026-07-02, last=2026-07-02 -->
§
For AI Hub sandbox deployments, `sdcb/code-interpreter`/OpenSandbox images were technically validated but still too slow/impractical; treat them only as fallback/reference and pivot to a lean custom sandbox runner when deployment speed is the problem. <!-- created=2026-07-02, last=2026-07-02 -->
§
Docker Compose rejects services that set both `pids_limit` and `deploy.resources.limits.pids` with distinct values (`can't set distinct values on 'pids_limit' and 'deploy.resources.limits.pids'`); use only one PID limit mechanism. <!-- created=2026-07-02, last=2026-07-02 -->
§
[insight] For ai-hub custom sandbox-runner, too-low pids/process limits can break Python scientific imports with OpenBLAS errors like `pthread_create failed ... Resource temporarily unavailable`; set BLAS thread-count env vars (e.g. OMP/OPENBLAS/MKL/NUMEXPR threads) and ensure pids limit is not overly restrictive. <!-- created=2026-07-02, last=2026-07-02 -->
§
AI Hub custom sandbox-runner: tmpfs mounts reset ownership/permissions, so chown/chmod `SANDBOX_RUN_ROOT` at runtime and make run dirs/files accessible to the sandbox user. NumPy/pandas/OpenBLAS can fail under tight PID/thread limits; cap `OPENBLAS_NUM_THREADS`, `OMP_NUM_THREADS`, `MKL_NUM_THREADS`, and `NUMEXPR_NUM_THREADS` to 1 and keep `SANDBOX_MAX_PROCESSES` high enough (e.g. 256). <!-- created=2026-07-02, last=2026-07-02 -->
§
[insight] For ai-hub sandbox-runner, very tight pids limits can break Python scientific imports with OpenBLAS errors like `pthread_create failed ... Resource temporarily unavailable`; cap BLAS/thread env vars (e.g. OPENBLAS/OMP/MKL/NUMEXPR threads) and allow enough pids. <!-- created=2026-07-02, last=2026-07-02 -->
§
[failure] Do not create or modify skills when extracting durable memories from conversations; a prior assistant incorrectly created a project skill during an ai-hub coding session despite the memory-extraction scope forbidding skill changes. <!-- created=2026-07-02, last=2026-07-02 -->
§
[tool-quirk] In ai-hub, `gh` CLI is unavailable; use GitHub REST API via curl/python for Actions status. REST log download may return HTTP 403 without admin rights, but workflow/job statuses and image digests can still be queried. <!-- created=2026-07-02, last=2026-07-02 -->
§
[failure] ai-hub sandbox-runner smoke test initially failed with `Permission denied` opening files under `/sandbox-runs` when the runner dropped execution to the sandbox user but the tmpfs/run directories were root-owned; ensure run directories/files are owned or accessible by the sandbox execution user. <!-- created=2026-07-02, last=2026-07-02 -->
§
[insight] For ai-hub sandbox-runner, Python scientific stacks like NumPy/OpenBLAS may fail under tight process/thread limits (`pthread_create failed`) unless BLAS thread counts are constrained (e.g. OMP/OPENBLAS/MKL/NUMEXPR thread env vars) or pids limits are sized appropriately. <!-- created=2026-07-02, last=2026-07-02 -->
§
[insight] ai-hub sandbox-runner: Python data/science smoke tests can fail under tight pids/thread limits with OpenBLAS `pthread_create failed`; keep BLAS/thread env caps such as OPENBLAS_NUM_THREADS/OMP_NUM_THREADS low when running numpy/pandas workloads in the sandbox. <!-- created=2026-07-02, last=2026-07-02 -->
§
[failure] During ai-hub sandbox-runner work, a project skill was created even though durable memory review should not create/modify skills; avoid skill creation unless explicitly requested by the user in a normal coding session. — Failed: Reviewer/agent used skill creation for validation workflow, which is not appropriate for memory extraction. <!-- created=2026-07-02, last=2026-07-02 -->
§
[failure] Do not create or modify project skills during normal ai-hub coding work unless the user explicitly requests it; a previous session incorrectly created a project skill while implementing sandbox changes. <!-- created=2026-07-02, last=2026-07-02 -->
§
[convention] AI Hub chat route convention: never grant model-only special UI capabilities without explicit enabled tools. Code workspace creation/editing must go through bound code_workspace_* tools; do not reintroduce markdown-fence auto workspace creation or auto-enable code workspace edit tools just because a code workspace is attached. <!-- created=2026-07-02, last=2026-07-02 -->
§
[insight] AI Hub accessibility audit insight: JSX a11y lint does not catch custom wrapper controls (`Input`, `Textarea`, `SelectTrigger`, `Switch`, `Checkbox`), so audit them with a custom search/script and require each opening tag to have an explicit `id`, `aria-label`, or `aria-labelledby`. <!-- created=2026-07-02, last=2026-07-02 -->
§
[failure] Assistant created project skills (`validate-ai-hub-sandbox-runner`, `audit-ai-hub-accessibility-controls`) during coding work; avoid creating/modifying skills unless the user explicitly requests skill changes. — Failed: Skills are durable agent capabilities, not normal task artifacts. <!-- created=2026-07-02, last=2026-07-02 -->
§
[tool-quirk] GitHub REST polling without authentication can hit the 60 req/hour rate limit while `gh` is unavailable; use an authenticated token/App route when checking Actions status repeatedly. <!-- created=2026-07-02, last=2026-07-02 -->
§
[correction] Do not create project skills during ai-hub coding work unless the user explicitly asks for a skill; prior sessions created validation/accessibility project skills unnecessarily while implementing fixes. <!-- created=2026-07-02, last=2026-07-02 -->
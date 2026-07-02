---
name: "validate-ai-hub-sandbox-runner"
description: "Build and smoke-test AI Hub's custom sandbox-runner image"
version: 1
created: "2026-07-02"
updated: "2026-07-02"
---
## When to Use
Use after changing Dockerfile target `sandbox-runner`, `scripts/sandbox-runner.mjs`, sandbox package lists, or compose wiring for code execution.

## Procedure
1. Run `npm run sandbox:build` to build `ai-hub-sandbox-runner:local`.
2. Check size with `docker image ls ai-hub-sandbox-runner:local --format '{{.Repository}}:{{.Tag}} {{.Size}} {{.ID}}'`.
3. Run the image with `--network none`, `--read-only`, tmpfs mounts for `/tmp` and `/sandbox-runs`, a bind/named volume for `/run/sandbox`, `SANDBOX_SOCKET_GID=$(id -g)`, `no-new-privileges`, and caps CHOWN/DAC_OVERRIDE/FOWNER/KILL/SETGID/SETUID.
4. Call `/health` and `/run` over the Unix socket. Smoke Python with pandas/numpy, Node with `require('zod')`, and Bash with a simple command.
5. Also run `SANDBOX_RUNNER_SOCKET=<socket> npx tsx - <<'TS'` importing `executeCodeSandbox` for an end-to-end client+runner smoke.

## Pitfalls
- Tmpfs overrides Dockerfile ownership for `/sandbox-runs`; the runner must chown/chmod the run root at runtime before creating workdirs.
- OpenBLAS can exceed process/thread limits; keep BLAS thread env vars set to 1 and `SANDBOX_MAX_PROCESSES` high enough.
- For local dev host access, set `SANDBOX_SOCKET_GID` to the host user's group (usually `$(id -g)`), not the app container gid.

## Verification
1. `npm run sandbox:build` succeeds.
2. Unix-socket health returns `{"status":"ok"}`.
3. Python, Node, and Bash `/run` smoke payloads return `ok: true`.
4. `npm run test:ci -- test/unit/code-sandbox.test.ts test/unit/code-sandbox-runner.test.ts` passes.
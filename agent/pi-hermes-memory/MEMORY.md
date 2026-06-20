ai-hub essentials/gotchas: tests live in `test/unit` + `test/e2e`; run `npm run test:ci`; use `python3` (not `python`). Risks: in-memory worker queue loses jobs on restart; `src/lib/auth.ts` hardcodes dev IP origins; silent catches/API routes may need logging + Zod validation. Tool quirks: use Node Unicode regex for emoji search; pi-lens ignores `eslint-disable`, so restructure code. <!-- created=2026-06-07, last=2026-06-11 -->
§
Environment/tooling: `gh` CLI is not installed in the ai-hub workspace environment (`gh: command not found`); use plain `git` commands or other available APIs instead of GitHub CLI here. <!-- created=2026-06-15, last=2026-06-15 -->
§
Tool quirk: `npx tsx -e` may reject top-level `await` in this repo with CJS output; wrap inline smoke-test code in an async IIFE. <!-- created=2026-06-18, last=2026-06-18 -->
§
Next.js/TS quirk: `NextResponse` body types may reject `Uint8Array`; convert bytes to an `ArrayBuffer` (copy) before returning binary ZIP responses. <!-- created=2026-06-18, last=2026-06-18 -->
ai-hub tests live in `test/` directory (not `src/`), organized as `test/unit/` and `test/e2e/`. Use `npm run test:ci` to run. The worker queue (`src/server/infrastructure/worker/index.ts`) is in-memory (JS array) — jobs lost on restart; needs Redis/Dragonfly persistence. Auth (`src/lib/auth.ts`) has hardcoded dev IPs (192.168.x, 100.90.x, 100.98.x) in `developmentOrigins`. Silent catch patterns return null/undefined/[] without logging — ~229 catch blocks total. Some API routes lack Zod input validation. <!-- created=2026-06-07, last=2026-06-07 -->
§
Shell grep may fail with unicode emojis in some environments; use a Node.js script with a unicode-aware regex range (e.g., /[\u{1F300}-\u{1F9FF}...]/gu) for reliable detection. <!-- created=2026-06-10, last=2026-06-10 -->
§
Pi-lens diagnostic rules do not respect eslint-disable comments. To resolve linter warnings that pi-lens flags, the code must be restructured (e.g., moving state updates from useEffect to async .then() callbacks) rather than relying on disable comments. <!-- created=2026-06-10, last=2026-06-10 -->
§
Environment/tool quirk: `python` may be missing in ai-hub shell (`command not found`); use `python3` for ad-hoc scripts. <!-- created=2026-06-11, last=2026-06-11 -->
§
Tool quirk in ai-hub shell: `python` is not available (`command not found`); use `python3` or uv-managed Python instead. <!-- created=2026-06-11, last=2026-06-11 -->
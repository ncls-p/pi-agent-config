---
name: "add-ai-hub-builtin-tool"
description: "Add a new built-in tool to AI Hub agents and expose it in the tools UI"
version: 1
created: "2026-06-17"
updated: "2026-06-17"
---
## When to Use
Use when adding or changing built-in agent tools in this AI Hub repo.

## Procedure
1. Implement the server-side tool definition in `src/modules/tool/builtin-tools.ts` or extract larger logic into `src/modules/tool/<tool-name>.ts`.
2. Add a stable UUID-style ID and client-safe summary in `src/modules/tool/builtin-tools-catalog.ts`.
3. Add a manual JSON schema entry in `commonSchemas` so `/api/workspace/tools` exposes useful schema metadata.
4. If the tool outputs an HTML artifact, return `kind: "html_artifact"` with `title`, `html`, `css`, `js`, and `height`; update chat history extraction in `src/app/api/workspace/[agentId]/chat/route.ts` when follow-up edits need previous artifact context.
5. Update agent tool guidance in `src/app/api/workspace/[agentId]/chat/route.ts` when the model should prefer the new tool for specific user intents.
6. Update `src/app/[locale]/(workspace)/tools/builtin-tools-panel.tsx` with an appropriate Lucide icon so the tool appears correctly in the built-in tools page.
7. Run `npm run typecheck`, `npm run lint`, `npm run build`, revert generated `next-env.d.ts` if changed, then run `lens_diagnostics mode=full severity=error`.

## Pitfalls
- Do not import server-only modules in `builtin-tools-catalog.ts`; it is client-safe metadata.
- For printable HTML artifacts, iframe sandbox may need `allow-modals` for `window.print()`, but avoid enabling broader sandbox permissions unless required.
- `next build` can modify `next-env.d.ts`; revert it before committing unless intentional.
- Existing agents only get the tool after it is bound/enabled in their tool configuration.

## Verification
1. `npm run typecheck` passes.
2. `npm run lint` passes.
3. `npm run build` passes.
4. `lens_diagnostics mode=full severity=error` reports no blocking errors.
5. `/api/workspace/tools` lists the new built-in tool and the tools page renders its icon.
---
name: "ai-hub-chat-performance"
description: "Optimize AI Hub chat rendering, streaming, and tool artifact performance without changing the flat UI direction."
version: 1
created: "2026-06-17"
updated: "2026-06-17"
---
## When to Use
Use when AI Hub chat feels slow, long conversations stutter, streaming updates are too frequent, or tool/artifact previews make the UI heavy.

## Procedure
1. Inspect `src/hooks/use-chat-stream.ts`, `src/components/chat/chat-message-list.tsx`, `src/app/[locale]/(workspace)/chat/page.tsx`, and `src/modules/agent/use-cases.ts` first.
2. Batch token streaming state updates and draft persistence; avoid dispatching same-tab draft events for local stream writes.
3. Avoid full conversation refetch after successful streaming when local streamed state is already canonical enough; keep recovery/resume reload paths.
4. Keep long-message rendering bounded: show only recent messages by default, memoize message/tool cards, disable decorative markdown word animations, and use `content-visibility` for offscreen messages.
5. Treat HTML/tool artifacts as expensive: lazy-mount iframes, memoize `srcDoc`, avoid live iframe updates while tool input is still streaming, and only stringify full JSON when the tool card is expanded.
6. For server history loading, avoid sequential decrypt loops; prefer batched/parallel rendering of message parts.

## Pitfalls
- `next build` changes `next-env.d.ts` between dev/prod route types; revert that generated file before committing unless the change is intentional.
- Do not use heavy visual effects or animations as loading indicators; this project prefers flat ChatGPT/OpenWebUI-like UI.
- Be careful with scroll-follow logic: only auto-scroll if the user is still attached to the bottom.

## Verification
1. Run `npm run typecheck`.
2. Run `npm run lint`.
3. Run `npm run build`, then revert generated `next-env.d.ts` if it changed.
4. Run `lens_diagnostics mode=full severity=error`.
5. Check `git diff --check` and ensure the net diff excludes generated Next route-type changes.
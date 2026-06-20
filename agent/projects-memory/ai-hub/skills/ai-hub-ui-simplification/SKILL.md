---
name: "ai-hub-ui-simplification"
description: "Simplify AI Hub UI/UX toward flat ChatGPT/OpenWebUI-style workflows"
version: 1
created: "2026-06-17"
updated: "2026-06-17"
---
## When to Use
Use when redesigning or reviewing AI Hub UI, especially chat, navigation, dashboard, agent, tools, and settings workflows where the user asks for less AI slop or simpler UX.

## Procedure
1. Start from the product direction: flat Apple/ChatGPT/OpenWebUI-like UI, no glassmorphism, no mesh gradients, no sparkles, minimal shadows, neutral palette, strong typography, and progressive disclosure.
2. For chat, never render the workspace sidebar plus a separate conversation sidebar. Use one unified chat sidebar containing conversations, New chat, minimal workspace navigation, account/theme controls, and collapse/drawer behavior.
3. Apply progressive disclosure: keep primary actions visible; move advanced/admin/secondary controls into Advanced sections, dropdowns, or detail pages.
4. Prefer performance-simplifying UX changes too: remove per-row background fetching when the data is only decorative (for example counts/badges in broad lists).
5. Use existing shadcn primitives and semantic tokens; do not create custom visual treatments unless a primitive cannot express the layout.
6. Fetch or consult current Web Interface Guidelines/NNG/OpenAI UI guidance for navigation, progressive disclosure, and accessibility when doing major changes.
7. Validate with npm run typecheck, npm run lint, npm run build, and lens_diagnostics mode=full severity=error. Revert next-env.d.ts if Next build rewrites it.

## Pitfalls
- Do not introduce two sidebars on /chat.
- Avoid icon-only navigation without text labels unless collapsed/tooltipped.
- Avoid decorative status badges, capability counters, and duplicate CTAs in list rows; keep list rows scannable.
- Do not leave generated Next next-env.d.ts changes after build unless intentionally required.

## Verification
1. /chat has only one sidebar on desktop and one drawer on mobile.
2. Core flows have one obvious primary action and secondary actions are hidden or moved to detail pages.
3. No LSP, typecheck, lint, build, or lens blocking errors remain.
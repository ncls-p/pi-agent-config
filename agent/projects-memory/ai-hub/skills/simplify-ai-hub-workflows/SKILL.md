---
name: "simplify-ai-hub-workflows"
description: "Simplify AI Hub UI flows while preserving advanced configuration for power users"
version: 2
created: "2026-06-17"
updated: "2026-06-17"
---
## When to Use
Use when improving AI Hub screens, especially assistants, chat, providers, tools, knowledge, onboarding, or settings workflows. The goal is beginner-friendly paths without removing advanced customization.

## Procedure
1. Start from the primary user outcome for the screen and make that path visible as a single obvious CTA.
2. Show a short checklist or guided path for multi-step workflows; keep advanced controls in AdvancedSection/collapsible areas.
3. Use assistant logos and plain-language labels anywhere users choose or recognize assistants.
4. Treat an assistant as ready only when it has a usable model, not merely an active version row.
5. After creating a resource, route users to the next configuration step instead of leaving them on a passive list.
6. For provider/model setup, make “connect → discover models → assign to assistant” the visible beginner path; keep manual model IDs, headers, query params, health metrics, and other technical controls in AdvancedSection.
7. Keep the existing flat Apple/ChatGPT/OpenWebUI style: neutral surfaces, restrained Deodis accents, no sparkles, no bot/robot iconography, no heavy gradients or shadows.
8. Verify navigation icons too: avoid BotIcon/SparklesIcon and use neutral workflow/code/message icons instead.
## Pitfalls
- Do not expose technical fields like slugs, sampling, MCP details, or guardrails as first-step requirements for non-technical users.
- Do not send users to chat when required model/provider setup is missing.
- Avoid large formatting-only diffs unless a formatter already changed the file and the change is intentional.

## Verification
1. Run npm run typecheck, npm run lint, npm run build, and revert next-env.d.ts if Next.js changed it.
2. Run lens_diagnostics mode=full severity=error.
3. Check that the key happy path has fewer visible decisions and a clear next action.
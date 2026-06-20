ai-hub UX: keep pages clean/minimal/beautiful (ChatGPT/Gemini/OpenWebUI), less “AI slop,” advanced options hidden by default, preserving white/blue palette + current font. Custom tool builder must never mention n8n/internal backend; use simple schematic workflow diagrams; secrets via chat card/button before modals with clear field explanations; progress must be real, not fake timers. <!-- created=2026-06-01, last=2026-06-13 -->
§
Work/preferences: direct execution, minimal chatter. If only asking for a plan, give a concise plan; write .md only when asked. “fini”=finish implementation. “why failing?”=root cause first, fix only if asked. “Calme toi et continue”=stop explaining/looping and execute quietly. Avoid long polling loops; summarize state and ask next action. Technical emails: humble/collaborative. Web searches must include today’s date. Prefer uv for Python envs. <!-- created=2026-06-01, last=2026-06-15 -->
§
General UI/UX: clean, minimal, intentional, balanced contrast, subtle modern animations. Avoid AI-slop/glow/sheens/animated avatars/busy loaders/large colored backgrounds. Streaming/reasoning should feel fast: opacity fades on last tokens/line only; no destructive masks or visible cursors. Reasoning stays collapsed with discreet in-progress/done indicator unless user expands. For “plus” then “trop” contrast feedback, choose the balanced middle. <!-- created=2026-06-01, last=2026-06-15 -->
§
Préfère utiliser uv pour les environnements Python (python envs) plutôt que venv/pip classiques. <!-- created=2026-06-04, last=2026-06-04 -->
§
Implementation preference: improve/adapt existing solutions before building new ones. For PI protocols/features, prefer using PI’s built-in exposure path rather than separate sidecars/duplicate services. <!-- created=2026-06-06, last=2026-06-13 -->
§
For local image-service Ideogram work, user’s priority is fixing bugged censorship/safety behavior and using Ideogram structured JSON prompts because Ideogram is trained for that format. <!-- created=2026-06-07, last=2026-06-07 -->
§
Pi TUI design preference: no large colored backgrounds; modern minimal chrome with foreground accents. `read` quieter than edit/write but `✓ read N lines` visible; truncation/ellipsis lines themed, not white. `edit`/`write` use foreground + diff stats (+N -N); expanded `edit` shows +/-/@@; expanded `write` shows full content/live writing. Working indicator: editor-border only, pulse ["·","•","●","•"] pastel RGB; "· working" then "● ready". If user says improve Pi “accueil”, target Pi TUI welcome screen/header (π pi / coding agent / Context sections), not app home pages. <!-- created=2026-06-07, last=2026-06-07 -->
§
L'utilisateur indique que quand ses LLM utilisent context-mode, l'output complet est visible; il faut tenir compte de cette contrainte et ne pas supposer que context-mode masque toujours les sorties côté utilisateur. <!-- created=2026-06-07, last=2026-06-07 -->
§
Web searches must include today's date. UI contrast iterations: user will iterate ("plus" then "trop") — aim for balanced middle ground, don't over-darken. <!-- created=2026-06-08, last=2026-06-10 -->
§
For ai-hub, user wants workflows/logique simplified like `../AltScribe/`: admin, users, marketplace, onboarding, and permission concepts should avoid visible workspace/enterprise complexity and use a simple user/admin model where possible. <!-- created=2026-06-15, last=2026-06-15 -->
§
User is comfortable with the agent committing and pushing directly when fixing production/deployment issues; they explicitly said “hésite pas à commit et push direct.” <!-- created=2026-06-15, last=2026-06-15 -->
§
Preference for AI Hub UI: remove bot/robot emoji/iconography; keep the interface clean and light, with Deodis colors used subtly rather than heavily. <!-- created=2026-06-17, last=2026-06-17 -->
§
Prefers the AI Hub UI to avoid bot/robot emoji or iconography; when discussing UI polish, avoid decorative emoji and AI-slop visuals. <!-- created=2026-06-17, last=2026-06-17 -->
§
User prefers not to commit/push changes automatically; leave changes uncommitted so they can test first unless they explicitly ask to commit/push. <!-- created=2026-06-19, last=2026-06-19 -->
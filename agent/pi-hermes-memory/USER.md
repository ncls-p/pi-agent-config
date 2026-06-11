ai-hub UX: keep clean/minimal/beautiful (ChatGPT/Gemini/OpenWebUI), advanced hidden by default, and preserve white/blue palette + current font. Custom tool builder must not mention n8n/internal backend; use simple schematic workflow diagrams; secrets via chat card/button before modals with clear field explanations; progress must be real, not fake timers. <!-- created=2026-06-01, last=2026-06-09 -->
§
Work style: prefers direct execution with minimal chatter after planning; if asking only for a plan, give a concise plan immediately; write plans to .md only when asked; “fini” means finish implementation. For “why is this failing?”, explain root cause first and fix only after asked. <!-- created=2026-06-01, last=2026-06-09 -->
§
UI streaming: prefer text opacity fades over blur; fast/smooth, only last tokens/line, no destructive CSS mask or visible cursor. <!-- created=2026-06-01, last=2026-06-06 -->
§
L'utilisateur préfère un ton humble et collaboratif dans les mails techniques; éviter les formulations qui semblent expliquer à un expert ce qu'il sait déjà ou paraître arrogant. <!-- created=2026-06-02, last=2026-06-02 -->
§
Préfère utiliser uv pour les environnements Python (python envs) plutôt que venv/pip classiques. <!-- created=2026-06-04, last=2026-06-04 -->
§
Prefers improving existing solutions before building new ones (e.g. ACP/PI features); ask whether existing paths can be enhanced first. <!-- created=2026-06-06, last=2026-06-06 -->
§
When extending PI protocols/features, user prefers improving or adapting PI’s existing built-in exposure path rather than creating a separate sidecar/duplicate service. <!-- created=2026-06-06, last=2026-06-06 -->
§
Custom tool builder UX preference for ai-hub: keep page minimal, never expose n8n/internal backend wording to end users, show workflow as simple visual diagrams/schemas, show a chat button before opening secret modals (do not auto-open), clearly explain what each modal field needs, and never fake progress counters. <!-- created=2026-06-06, last=2026-06-06 -->
§
For local image-service Ideogram work, user’s priority is fixing bugged censorship/safety behavior and using Ideogram structured JSON prompts because Ideogram is trained for that format. <!-- created=2026-06-07, last=2026-06-07 -->
§
Pi TUI design preference: no large colored backgrounds; modern minimal chrome with foreground accents. `read` quieter than edit/write but `✓ read N lines` visible; truncation/ellipsis lines themed, not white. `edit`/`write` use foreground + diff stats (+N -N); expanded `edit` shows +/-/@@; expanded `write` shows full content/live writing. Working indicator: editor-border only, pulse ["·","•","●","•"] pastel RGB; "· working" then "● ready". If user says improve Pi “accueil”, target Pi TUI welcome screen/header (π pi / coding agent / Context sections), not app home pages. <!-- created=2026-06-07, last=2026-06-07 -->
§
L'utilisateur indique que quand ses LLM utilisent context-mode, l'output complet est visible; il faut tenir compte de cette contrainte et ne pas supposer que context-mode masque toujours les sorties côté utilisateur. <!-- created=2026-06-07, last=2026-06-07 -->
§
Web searches must include today's date. UI contrast iterations: user will iterate ("plus" then "trop") — aim for balanced middle ground, don't over-darken. <!-- created=2026-06-08, last=2026-06-10 -->
§
When I get stuck in loops or over-explain, user says "calme toi et continue" (calm down and continue) — meaning: stop explaining, just execute silently. This reinforces their general preference for direct execution with minimal chatter. <!-- created=2026-06-10, last=2026-06-10 -->
§
User communicates design feedback iteratively in French: first "manque de contraste" (too little), then "plus encore" (more), then "c'est trop" (too much) — prefers the agent find a middle ground through iterative adjustments rather than getting it perfect on the first try. <!-- created=2026-06-10, last=2026-06-10 -->
§
ai-hub UI preference reinforced: some pages feel too complex or “AI slop” (example `/en/tools`); prefer simplifying existing pages into cleaner, less generic, more intentional designs. <!-- created=2026-06-11, last=2026-06-11 -->
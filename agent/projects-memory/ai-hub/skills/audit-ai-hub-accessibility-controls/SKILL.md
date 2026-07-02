---
name: "audit-ai-hub-accessibility-controls"
description: "Audit AI Hub custom form controls for accessible names"
version: 1
created: "2026-07-02"
updated: "2026-07-02"
---
## When to Use
Use after adding or changing UI controls in AI Hub, especially custom wrapper components (`Input`, `Textarea`, `SelectTrigger`, `Switch`, `Checkbox`) that ESLint's jsx-a11y rules may not fully understand.

## Procedure
1. Run `npm run test:ci -- test/unit/accessibility-controls.test.ts` to enforce explicit accessible names on custom controls.
2. If the test fails, add one of `id` + visible `Label htmlFor`, `aria-label`, or `aria-labelledby` to each reported custom control opening tag.
3. For drag-and-drop affordances, provide a button/menu alternative such as Move up/Move down and keep it keyboard operable.
4. Run `npm run lint`, `npm run typecheck`, `npm run test:ci`, and `npm run build` before shipping.

## Pitfalls
- Place `aria-label` before inline arrow-function props when possible; simple text-based audits can otherwise stop at `=>` if written naively.
- Wrapping Radix `Switch` or `Checkbox` in a `<label>` is not enough because they render button-like controls; add an explicit accessible name or id association.
- Lighthouse smoke tests may be blocked locally if `next start` fails production env validation; use CLI validation/build as fallback unless valid local production env is available.

## Verification
1. `test/unit/accessibility-controls.test.ts` passes.
2. LSP diagnostics show no errors in touched UI files.
3. `npm run lint`, `npm run typecheck`, `npm run test:ci`, and `npm run build` pass.
---
name: "document-ai-hub"
description: "Document the AI Hub project — architecture, API reference, user guide, deployment, and developer guide."
version: 1
created: "2026-07-05"
updated: "2026-07-05"
---
## When to Use
Use when asked to document the AI Hub project, create user guides, API references, architecture docs, or developer guides.

## Procedure
1. Identify the target audience: developers, end users, or admins.
2. Determine the documentation scope: architecture, API, user guide, or deployment.
3. Read the relevant source files — use module_report() for modules, read_symbol() for specific functions.
4. Write documentation in docs/ directory with clear TOC, code examples, and tables.
5. Cross-reference existing docs to avoid duplication.
6. Use markdownlint and LSP diagnostics to validate the docs.
7. Create or update skills that help navigate the documented areas.

## Pitfalls
- Don't invent APIs or features — verify against actual source code.
- Keep docs in docs/ directory, not in the root.
- Use consistent formatting: headers, tables, code blocks, TOC.
- Update user-guide.md for user-facing changes, architecture.md for developer-facing changes.
- Avoid duplicating README.md content — reference it instead.

## Verification
1. Doc files exist in docs/ with proper markdown formatting.
2. All referenced modules, routes, and tables exist in the source code.
3. Cross-references between docs work.
4. No blocking LSP diagnostics in the doc files.
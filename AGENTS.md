# AGENTS.md — quack-auth index

Overview for AI agents and contributors. **Detailed conventions live in `.cursor/rules/`** — this file indexes them; do not duplicate rule text here. Session logs and judgement calls stay in [`AI.md`](./AI.md).

## Monorepo layout

| Area              | Path                    | Import alias                             |
| ----------------- | ----------------------- | ---------------------------------------- |
| Frontend          | `apps/FE`               | `@/*` (app-local)                        |
| Backend           | `apps/BE`               | `@/*` (app-local)                        |
| Shared constants  | `libs/qu-constants`     | `@shared/constants`                      |
| Shared DTOs (Zod) | `libs/dtos`             | `@shared/dtos`                           |
| Mongoose layer    | `mongoose/` (repo root) | `@quack/mongoose/*`, `@shared/constants` |
| Docs              | `apps/DOCS`             | —                                        |

## Cursor rules (conventions)

| Rule                 | Path                                                                                 | Summary                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| Project conventions  | [`.cursor/rules/project-conventions.mdc`](./.cursor/rules/project-conventions.mdc)   | DTO suffixes, Mongoose layout, `BE_ROUTES` in `be-routes.constants.ts`, BE `*.util.ts` / `utils/libs/`, `@quack/mongoose/*` |
| AI-first engineering | [`.cursor/rules/ai-first-engineering.mdc`](./.cursor/rules/ai-first-engineering.mdc) | Verify output, log `AI.md` sessions with `YYYY-MM-DD HH:MM` headings, quality gates                                         |
| Subagent delegation  | [`.cursor/rules/ai-first-subagent.mdc`](./.cursor/rules/ai-first-subagent.mdc)       | Delegate non-trivial work to ai-first-engineering subagent                                                                  |
| Docusaurus docs      | [`.cursor/rules/docusaurus-docs.mdc`](./.cursor/rules/docusaurus-docs.mdc)           | `apps/DOCS` structure and when to update setup docs                                                                         |

**New convention from Developer?** Update [`project-conventions.mdc`](./.cursor/rules/project-conventions.mdc) first, then add a one-line pointer in the table above.

## Cursor artifacts

| What                     | Path                                     |
| ------------------------ | ---------------------------------------- |
| AI session log           | `AI.md`                                  |
| AI-first subagent        | `.cursor/agents/ai-first-engineering.md` |
| Docs maintainer subagent | `.cursor/agents/docs-maintainer.md`      |
| Setup docs               | `apps/DOCS/docs/setup/`                  |

## Cursor plugins (MCP)

| Plugin  | Use when                                                                                                                                                      |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MongoDB | Connection tuning, schema design, query/aggregation help, index advice, Atlas Stream Processing — use MCP tools when working with MongoDB data or performance |

Installed by Developer (2026-06-08). Agents may call MongoDB MCP for exploration and optimization; app code still uses `mongoose/` + `@quack/mongoose/*`.

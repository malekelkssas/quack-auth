# AGENTS.md — quack-auth index

Overview for AI agents and contributors. **Detailed conventions live in `.cursor/rules/`** — this file indexes them; do not duplicate rule text here. Session logs and judgement calls stay in [`AI.md`](./AI.md).

**When the Developer asks you to log something in `AI.md`, do it in the same turn** — do not defer or skip. See [AI-first engineering](./.cursor/rules/ai-first-engineering.mdc) step 5.

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

| Rule                 | Path                                                                                 | Summary                                                                                                                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project conventions  | [`.cursor/rules/project-conventions.mdc`](./.cursor/rules/project-conventions.mdc)   | DTOs, Mongoose, `BE_ROUTES`, BE `*.util.ts`, FE Tailwind v4, dev tools, `axiosConfig` + RTK Query `authApi`/`axiosBaseQuery`, Redux `authSlice` + persist whitelist, layered FE flow, `@quack/mongoose/*` |
| AI-first engineering | [`.cursor/rules/ai-first-engineering.mdc`](./.cursor/rules/ai-first-engineering.mdc) | Verify output, log `AI.md` sessions with `YYYY-MM-DD HH:MM` headings, quality gates                                                                                                                       |
| Subagent delegation  | [`.cursor/rules/ai-first-subagent.mdc`](./.cursor/rules/ai-first-subagent.mdc)       | Delegate non-trivial work to ai-first-engineering subagent                                                                                                                                                |
| Docusaurus docs      | [`.cursor/rules/docusaurus-docs.mdc`](./.cursor/rules/docusaurus-docs.mdc)           | `apps/DOCS` structure and when to update setup docs                                                                                                                                                       |

**New convention from Developer?** Update [`project-conventions.mdc`](./.cursor/rules/project-conventions.mdc) first, add a one-line pointer in the table above, then **must** update related Docusaurus docs (`apps/DOCS/docs/apps/FE/`, `apps/DOCS/docs/apps/be/`, setup pages, …) in the same branch.

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

## Technical backlog (`TODO.md`)

Root [`TODO.md`](./TODO.md) tracks security, conventions, and feature work (aligned with `docs/quack-auth-tech-decisions.pdf`).

**Agents must keep it current:** when you complete work that satisfies an open item in `TODO.md`, update that file in the **same branch/PR** — set table status to `[x]` (or `[~]` if partial), check off list tasks, and refresh **Last audited** with the date and branch. Do not leave finished work marked `[ ]`.

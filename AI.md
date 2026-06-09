# AI.md — quack-auth

Engineering log for AI-assisted work on this repo. Goes beyond disclosure: **session id**, **Cursor surface** (editor vs agents), **model** (full name + version, e.g. **Composer 2.5** — not just “Composer”), prompts, fixes, judgement calls, and **chat summaries**.

## Cursor surface (editor vs agents)

Log which Cursor UI hosted the chat:

| Value      | Meaning                                                    |
| ---------- | ---------------------------------------------------------- |
| **Editor** | Cursor **editor** app — inline chat / Composer in the IDE  |
| **Agents** | Cursor **Agents** window — dedicated multi-chat agent runs |

**From now on**, every session entry must include **`Cursor surface`** — `Editor` or `Agents`.

### Setup-first (Developer)

All work logged in this file through session **`S006-quality-gates`** was done in the **Editor** app. The Developer stressed that **initial setup** (monorepo, Husky, CI, DOCS, quality gates) is the **most important** foundation — keep a **close eye** on setup docs, hooks, and `apps/DOCS/docs/setup/` staying accurate as the repo evolves.

The Developer is moving to the **Agents** window next for **multi-chat / multi-branch** work (parallel agents on separate branches). Editor remains fine for focused setup edits; Agents is the preferred surface for parallel feature work.

## Branch per chat

**Every new chat** must start on a dedicated branch:

| Pattern                   | Example               |
| ------------------------- | --------------------- |
| `quack-XX-<feature-slug>` | `quack-01-auth-login` |

1. Inspect: `git branch -a | grep quack-` and `git worktree list` (parallel agents may hold `quack-XX-*` only in another worktree).
2. Create: `./scripts/next-quack-branch.sh <feature-slug>` or `git checkout -b quack-XX-<feature>` — the script scans refs **and** checked-out worktree branches when picking the next `XX`.
3. Log **branch name** in session entries when useful.

`XX` = next zero-padded number. One branch per chat — do not share across agents.

**Commits:** Conventional Commits enforced by commitlint (`feat:`, `fix:`, `docs:`, `test:`, `chore:`, …). See `apps/DOCS/docs/setup/10-git-branches-commits.md`.

## Session IDs

One id per **chat** — all changes made in the same conversation share the same session id:

| Format            | Example                                    |
| ----------------- | ------------------------------------------ |
| `S###-short-slug` | `S001-initial-scaffold`, `S005-docusaurus` |

- Use the **same session id** for every entry logged from the **same chat**.
- Start a **new id** when the Developer opens a **new chat** (even if the topic continues).
- Reference in prompts: `Continuing S005-docusaurus: …`

## Chat summaries

When Cursor **summarizes / compacts** chat context (or you start a new chat with handoff), log it:

1. Note it in the session entry (`**Chat summary** — Yes …`).
2. Add a `### Chat summary — [date time]` block under the active session with what was carried forward and what may need re-reading.

If an agent is working from summarized context, it should say so explicitly at the start of the turn.

## Cursor AI artifacts

| What                     | Path                                     | When to use                                          |
| ------------------------ | ---------------------------------------- | ---------------------------------------------------- |
| **Subagent**             | `.cursor/agents/ai-first-engineering.md` | **Always** for non-trivial work — `/create-subagent` |
| **AI-first rule**        | `.cursor/rules/ai-first-engineering.mdc` | Policy + workflow — should have been `/create-rule`  |
| **Delegation rule**      | `.cursor/rules/ai-first-subagent.mdc`    | Task-tool fallback + "always delegate" rules         |
| **Docusaurus docs rule** | `.cursor/rules/docusaurus-docs.mdc`      | When editing `apps/DOCS/**`                          |
| **Project conventions**  | `.cursor/rules/project-conventions.mdc`  | DTOs, Mongoose layout, paths                         |

Invoke subagent: `Use the ai-first-engineering subagent to [task]`

### Developer mistake: skills instead of rules

The Developer used **`/create-skill`** for project-wide guidance that belongs in **Cursor rules** (`/create-rule`):

- `ai-first-engineering`, `ai-first-subagent`, `docusaurus-docs` were under `.cursor/skills/*/SKILL.md`
- Migrated to `.cursor/rules/*.mdc` (this session). Old skill dirs removed.

**Skill ≠ subagent** (earlier fix): first `/create-subagent` pass only added `.cursor/skills/ai-first-subagent/` — a skill, not a subagent. Subagents must live in `.cursor/agents/*.md`. Fixed by adding `.cursor/agents/ai-first-engineering.md`.

Reference: `pnpm nx serve DOCS` (http://localhost:4001) — setup docs live in `apps/DOCS/docs/setup/`.

---

## Project summary (so far)

Nx monorepo (`pnpm` + Nx 22) with:

| Area            | What exists                                                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **FE**          | React + Vite + Tailwind at `apps/FE` (`pnpm nx serve FE` → :4200)                                                              |
| **BE**          | NestJS at `apps/BE` (`pnpm nx serve BE` → :3000/api, Swagger at `/docs`)                                                       |
| **Shared libs** | `libs/qu-constants` (`@shared/constants`), `libs/dtos` (`@shared/dtos`)                                                        |
| **Mongoose**    | Root `mongoose/` — `client.ts`, `models/`, `fixtures/`, planned `seed.ts`                                                      |
| **Env**         | `.env.example` committed; `.env` gitignored; keys in `ENV_KEYS`                                                                |
| **Docker**      | `docker-compose.yml` — MongoDB 8 (`quack_auth_mongodb`)                                                                        |
| **Docs**        | Docusaurus at `apps/DOCS` (`pnpm nx serve DOCS` → :4001)                                                                       |
| **Quality**     | Husky pre-commit — lint-staged (Prettier + ESLint fix) + `pnpm check`                                                          |
| **CI**          | `.github/workflows/ci.yml` — `pnpm ci` (check + build); `pr-open-change-summary.yml` — Cursor digest on PR **opened**          |
| **AI surface**  | Sessions through `S006` — **Editor**; from here prefer **Agents** window for parallel work                                     |
| **Conventions** | `AGENTS.md` indexes rules; detail in `.cursor/rules/project-conventions.mdc` (DTOs, Mongoose, paths) and sibling `*.mdc` rules |

### Completed setup steps

1. Nx monorepo init (FE + BE apps)
2. Path aliases — `@/*` per app; shared libs via `baseUrl: "../.."` (FE must extend `./tsconfig.json` for `jsx`)
3. `qu-constants` + `dtos` libs; Zod + nestjs-zod
4. BE: global pipes/interceptors/filters; greeting endpoint `GET /api?name=…`
5. MongoDB deps + env constants + `mongoose/client.ts`
6. Docker Compose for local MongoDB
7. AI policy skill + subagent + this log
8. Docusaurus DOCS app — migrated from root `docs/setup.md`
9. Husky + lint-staged + Prettier + ESLint/typecheck gates (`pnpm check`)
10. Commitlint + `quack-XX-*` branch-per-chat workflow (`scripts/next-quack-branch.sh`)

### Cursor agents & rules

| Role                   | Path                                     |
| ---------------------- | ---------------------------------------- |
| AI-first engineering   | `.cursor/agents/ai-first-engineering.md` |
| Docs maintenance       | `.cursor/agents/docs-maintainer.md`      |
| AI-first policy        | `.cursor/rules/ai-first-engineering.mdc` |
| Subagent delegation    | `.cursor/rules/ai-first-subagent.mdc`    |
| Docusaurus conventions | `.cursor/rules/docusaurus-docs.mdc`      |

---

## 2026-06-09 16:13 — Quack endpoint FE integration

**Session** — `S012-fe-quack-home`

**Local start time** — `2026-06-09 16:13`

**Cursor surface** — Agents

**Model** — Claude Opus 4.8

**Branch** — `quack-09-fe-auth-rtk-query` (worktree `br0z`; not switched)

**Done** — Inspected the `main`-branch quack endpoint via `gh` (read-only, no checkout) and integrated it into the protected Home page.

- **Endpoint (main):** `POST /api/quack`, guarded by `JwtCookieAuthGuard` (cookie auth). Body `QuackInput` (`{ name?: string }`, optional override); response `QuackResponse` (`{ quack: string }`). Service falls back to the stored user's name → `"<name> quack"`.
- **Mirrored to this branch (was missing):** added `BE_ROUTES.QUACK = 'quack'`; added `libs/dtos/src/lib/quack/` (`quack.dto.ts`, `quack-response.dto.ts`, `index.ts`) + barrel export. `QuackResponse` is an exact mirror; `QuackInput` is a self-contained wire-shape mirror (main's `OptionalPlainTextName` pulls in the `sanitize`/`name.schema` modules that do not exist on this branch — kept the length rules, BE still sanitizes server-side).
- **FE:** new `store/api/quackApi.ts` `createApi` slice (`quack` **query**, POST, empty body for auto-greet on mount); wired reducer (`root-reducer.ts`), middleware (`store.ts`), and cache blacklist (`persist.config.ts`) mirroring `authApi`. `useHome.ts` calls `useQuackQuery()` and feeds the live quack into the Det. Quacksworth `SpeechBubble` (loading + error fallbacks), prepends a ticker item, and flips the status bar to `SIGNAL LOST` on error. Paths from `@shared/constants`, types from `@shared/dtos` — no magic strings.

**Verified** — `pnpm nx run FE:typecheck --skip-nx-cache` ✅, `pnpm nx run FE:lint --skip-nx-cache` ✅, `pnpm check` ✅ (5 projects typecheck + prettier), `pnpm nx build DOCS` ✅.

**Changed vs default AI** — used a `builder.query` (not mutation) for the POST so the greeting auto-fetches on Home mount; kept quack in a separate `quackApi` slice rather than overloading `authApi`.

## 2026-06-08 18:30 — Initial scaffolding & shared libs

**Session** — `S001-initial-scaffold`

**Local start time** — `2026-06-08 18:30`

**Cursor surface** — Editor

**Model** — not recorded (session predates model logging in AI.md)

**Chat summary** — not recorded (early sessions may have had silent compaction)

**Prompts that worked**

- Generate Nx FE/BE apps with `--no-interactive`, document in `docs/setup.md`
- Add shared `qu-constants` / `dtos` with `@shared/*` path aliases from monorepo root
- Wire nestjs-zod (pipe, interceptor, Swagger `cleanupOpenApiDoc`, `app.dto.ts` wrappers)
- MongoDB: `pnpm add @nestjs/mongoose mongoose`, `mongodb-memory-server`, root `mongoose/` layout

**Output that needed fixing**

- **Jest types** — `@types/jest` in package.json but not installed; resolved via `pnpm install`
- **FE tsconfig** — extending `tsconfig.base.json` directly dropped `jsx: "react-jsx"`; fixed by extending `./tsconfig.json`
- **Path aliases** — `baseUrl: "."` + `../../libs/...` duplicated root paths; unified on `baseUrl: "../.."`
- **Schema naming** — `GreetingQuery` as both const and type broke `createZodDto` inference / `query.name`; Developer preferred same-name pattern; kept but documented sync needs
- **ZodSerializationException** — default 500 with no `errors` array; customized `http-exception.filter.ts` to match request validation shape (400 + `errors`)
- **Constants layout** — renamed `qu-constants.ts` → `app.constants.ts`; added `env.constants.ts`, `node-env.constants.ts`
- **`mongoose/client.ts`** — relative imports to lib files; switched to `@shared/constants`
- **Skill vs subagent** — `/create-subagent` initially created only `.cursor/skills/ai-first-subagent/`; real subagent belongs in `.cursor/agents/ai-first-engineering.md`

**Decisions different from AI**

- **Response validation errors as 400** — nestjs-zod treats serialization failures as 500 (server bug); we map them to the same body as input validation for consistent API DX during development
- **Same-name Zod schema + type** — Developer choice over `*Schema` suffix convention
- **Filters directory** — `apps/BE/src/filters/` (`http-exception`, `global-exception`) instead of colocating in `app/`
- **`app.dto.ts` sync warning** in setup — BE needs `createZodDto` wrappers separate from shared Zod schemas in `libs/dtos`; Developer later pointed to [filelinks](https://github.com/Vilancer/filelinks) as the tool being built to link these (not on npm yet)
- **Always-use subagent** — non-trivial work should go through `ai-first-engineering` subagent, not inline parent agent

**Verified**

- [x] `pnpm nx build BE` / `pnpm nx build FE`
- [x] `curl "http://localhost:3000/api?name=world"` → `{ name, appName }`
- [x] `tsc -p mongoose/tsconfig.json --noEmit`
- [x] `tsc -p apps/FE/tsconfig.app.json --noEmit`
- [x] `docker compose config`

---

## 2026-06-08 — Docusaurus DOCS app (continued in same chat)

**Session** — `S005-docusaurus`

**Local start time** — not recorded at session start

**Cursor surface** — Editor

**Model** — Composer (exact version not recorded for this session)

**Chat summary** — No (single continuous thread for DOCS migration)

**Prompts that worked**

- `pnpm nx g @nx-extend/docusaurus:app DOCS` + relocate to `apps/DOCS`
- Split `docs/setup.md` into `apps/DOCS/docs/setup/01-*.md` … `08-docusaurus.md`
- `docs-maintainer` subagent + `docusaurus-docs` skill

**Verified**

- [x] `pnpm nx build DOCS`

---

## 2026-06-08 — Husky, README, multi-agent prep

**Session** — `S006-quality-gates`

**Local start time** — not recorded at session start

**Cursor surface** — Editor (entire session through CI, PR summary, secrets; Developer next moves to **Agents** for multi-chat/branch work)

**Model** — Composer 2.5

**Chat summary** — Yes — prior thread summarized at handoff; Developer asked to continue Husky + README + CI prep for parallel agent work.

**Developer asked for**

- Set up **Husky** with linting, TypeScript checks, **Prettier**, and auto-fix for fixable linter/Prettier issues on commit
- Update **root README** with a good summary; keep only prerequisites, `pnpm install`, `.env` locally — point everything else to **DOCS**
- Update **skills** with README boundary and quality-gate commands
- **CI next** — Developer explicitly said we will add Husky and CI so multiple agents can work in different chats/branches

**Implemented**

- `husky` + `lint-staged` — pre-commit: format/fix staged files, then `pnpm check`
- Root scripts: `lint`, `lint:fix`, `typecheck`, `format`, `format:check`, `check`
- `typecheck` targets on BE, DOCS, dtos, qu-constants (FE already had vite plugin target)
- ESLint: `eslint-config-prettier`, ignore `.docusaurus` / build dirs
- Fixed `dtos` package.json missing `zod` dep (dependency-checks lint)
- Excluded root `quack-auth` Nx project from `run-many` to avoid recursive script loops

**Verified**

- [x] `pnpm check`

**Developer asked for (same session)**

- Rename **section id** → **session id** — one id per chat, not per topic arc; refer to the human as **Developer**
- Document **Husky** in DOCS — what the pre-commit hook runs (`lint-staged` + `pnpm check`), lint-staged globs, and manual `pnpm check` scripts (was missing from Docusaurus after implementation)

**Output that needed fixing**

- Husky landed in code + README + skills but **not** in `apps/DOCS` until Developer flagged it — added `setup/09-husky-quality-gates.md`, updated `intro.md`, maintenance tables, and doc skills/agents
- Developer ran `pnpm check` and hit `format:check` failure — `09-husky-quality-gates.md` and `docusaurus-docs/SKILL.md` were edited but not Prettier-formatted before commit; fixed with `prettier --write`
- Document **[filelinks](https://github.com/Vilancer/filelinks)** at the `app.dto.ts` sync warning — Developer-built tool linking trigger/affects files and directories for hooks/agents; README shows `pnpm add` but **not published on npm yet**
- Document **`filelinks check --run-agents`** — when a trigger is staged, filelinks can spawn a Cursor agent with a per-link prompt to fix affects (e.g. `createZodDto` wrappers); Developer asked to mention this explicitly
- Log **model with exact version** (e.g. Composer 2.5), not shorthand “Composer”
- Developer hit `EBADDEVENGINES` running `npx nx generate ci-workflow` — repo requires **pnpm**; Developer then ran **`pnpm nx generate ci-workflow --ci=github`** to scaffold `.github/workflows/ci.yml`
- Align **CI** with Husky — workflow customized so main step is `pnpm check` (not default `nx affected -t lint test build`); commented TODOs for **BE unit tests** and **FE E2E** when ready (E2E only if not too heavy)
- **PR open change summary** — Developer asked for main-branch email digest pattern adapted to PRs: `.github/workflows/pr-open-change-summary.yml` (renamed from bad “main change summary” naming), same Cursor agent provider, appends digest to **PR description** on `pull_request: opened` only (no Gmail)
- **CI Node version** — Developer reported CI failure: pnpm 11.5.2 on Node 20 → `ERR_UNKNOWN_BUILTIN_MODULE: node:sqlite`; fixed `ci.yml` to `node-version: 22`
- Developer added **`CURSOR_API_KEY`** to GitHub Actions repo secrets; documented in README (maintainers) and DOCS PR summary section
- Log **Cursor surface** (`Editor` \| `Agents`) per session; note all `AI.md` work through `S006` was **Editor** — setup is highest priority; Developer shifting to **Agents** window for efficient multi-chat / multi-branch work
- Developer noted CI was missing **build** — added `pnpm build` / `pnpm ci` (`check` + `build`); `ci.yml` now runs `pnpm ci` (Husky still `check` only)
- Before **Agents** window: **one branch per chat** (`quack-XX-<feature>`); `@commitlint/cli` + `@commitlint/config-conventional` + `.commitlintrc.json` + Husky `commit-msg`; Developer prefers `feat:` / `fix:` / `docs:` / `test:` prefixes

---

## Session entry timestamps

**Heading format (required):** `## YYYY-MM-DD HH:MM — Short title` — local **24-hour** time, not date-only.

The Developer flagged that agents **stopped including `HH:MM`** in headings after early sessions (e.g. `S001` at `18:30`). Rule: `.cursor/rules/ai-first-engineering.mdc` — **AI.md timestamps** section.

- New entries: always `HH:MM` in the heading.
- Backfill: add time only when known; otherwise keep date in heading and set **`Local start time`** — _not recorded at session start_.

## How to extend this file

After each significant AI-assisted session, append:

- **Heading** — `## YYYY-MM-DD HH:MM — Short title` (see **Session entry timestamps** above)
- **Session id** (`S###-slug`) — one id per chat; reuse for all entries from the same conversation
- **Cursor surface** — `Editor` or `Agents`
- **Branch** — e.g. `quack-07-auth-login` (optional but recommended for Agents chats)
- **Local start time** (`YYYY-MM-DD HH:MM`) — repeat in body when useful
- **Model** — full product name + version (e.g. Composer 2.5, Claude Opus 4.6)
- **Chat summary** — `No`, or `Yes` + `### Chat summary — YYYY-MM-DD HH:MM` block if context was compacted

Template: see **How to extend this file** above; policy in `.cursor/rules/ai-first-engineering.mdc`.

---

## 2026-06-08 — AGENTS.md indexes rules (Developer request)

**Session** — `S007-user-model` (conventions doc refactor)

**Local start time** — not recorded at session start

**Developer asked for**

- **`AGENTS.md` = index only** — pointers to `.cursor/rules/*.mdc`, not duplicated convention text.
- **`.cursor/rules/project-conventions.mdc` = source of truth** for coding/layout conventions; on new convention → update rule first, then one-line pointer in AGENTS.md.
- Complete **skills → rules** migration (`ai-first-engineering`, `ai-first-subagent`, `docusaurus-docs`); log Developer mistake using `/create-skill` instead of `/create-rule`.

**Implemented**

- Rewrote `AGENTS.md` as layout table + rules index + artifacts table.
- Expanded `project-conventions.mdc` with full DTO/Mongoose detail moved from AGENTS.md; added source-of-truth header and update workflow.
- `ai-first-engineering.mdc` step 0: new conventions → project-conventions + AGENTS pointer.
- Empty `.cursor/skills/*/` dirs removed (SKILL.md files already gone; content lives in `.mdc` rules).

---

## 2026-06-08 — `/simplify` + `/code-review` on `quack-02-user-model`

**Session** — `S008-simplify-review`

**Local start time** — not recorded at session start

**Cursor surface** — Agents

**Branch** — `quack-02-user-model` (diff vs `main`)

**Developer asked for**

- Run **`/simplify`** and **`/code-review`** on this branch/PR against `main`; log outcome in `AI.md`.

**What the commands do**

- **`/simplify`** — read-only pass for unnecessary complexity (duplication, dead code, weak abstractions), then targeted fixes that preserve behavior.
- **`/code-review`** — read-only pass for bugs, regressions, security, missing tests; report by severity; fix only clear in-scope issues.

**Key findings**

| Lens        | Finding                                                                      | Action                                                                                                          |
| ----------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Reuse       | `email` / `name` Zod rules duplicated in `signup.dto.ts` and `user.model.ts` | **Wrong** — AI added `user.fields.ts` (not a Developer convention); **reverted** — see `S011-dto-fields-revert` |
| Simplify    | Unused `UserPath` type in `user.paths.ts`                                    | **Fixed** — removed                                                                                             |
| Code review | No NestJS `createZodDto` wrappers for `Signup` / `User` in `app.dto.ts`      | **Skipped** — follow-up when signup endpoint lands                                                              |
| Code review | Zod `User` omits `_id`, `createdAt`, `updatedAt`                             | **Skipped** — intentional stored-field subset per conventions                                                   |
| Code review | No unit/integration tests for user model or DTOs                             | **Skipped** — out of PR scope                                                                                   |
| Code review | Duplicate validation Mongoose vs Zod (`minlength` / `min(3)`)                | **Skipped** — defense in depth at ODM layer                                                                     |

**Verified**

- [x] `pnpm exec tsc --noEmit -p mongoose/tsconfig.json`
- [x] `pnpm exec tsc --noEmit -p libs/dtos/tsconfig.lib.json`
- [x] ESLint on changed `libs/dtos/src/lib/user/*.ts` and `mongoose/models/**/*.ts`

**Fixes left uncommitted** — Developer did not request commit.

---

## 2026-06-08 — Babysit PR #3 (`/babysit` first use)

**Session** — `S007-babysit-pr`

**Local start time** — not recorded at session start

**Cursor surface** — Agents

**Branch** — `quack-02-user-model`

**Model** — Composer 2.5 (babysit subagent via ai-first-engineering delegate)

**Chat summary** — No

**Developer asked for**

- **First use of `/babysit`** — keep [PR #3](https://github.com/malekelkssas/quack-auth/pull/3) merge-ready.

**What babysit does** (for future sessions)

Get a PR to **merge-ready**: check PR status, comments, and CI; resolve merge conflicts with main when behind; triage unresolved review comments (including Bugbot) and fix valid issues; fix CI failures in PR scope (not by weakening workflows); push scoped fixes and re-watch until **mergeable + green**.

**Babysit outcome**

| Check          | Result                                                      |
| -------------- | ----------------------------------------------------------- |
| Merge state    | `CLEAN` — mergeable, no conflicts with `main`               |
| CI             | Green — `main` (pnpm ci) + `Cursor digest → PR description` |
| Review threads | None (no Bugbot or human review comments)                   |
| Local branch   | Clean working tree on `quack-02-user-model`                 |

**Actions taken**

- Inspected PR via `gh pr view`, `gh pr checks`, GraphQL review threads — no fixes required.
- No push (nothing to change).

**PR merge-ready** — Yes.

---

## 2026-06-08 — Parallel workflow delay (convention / AI.md gap)

**Session** — `S009-convention-delay`

**Local start time** — not recorded at session start

**Cursor surface** — Agents

**Branches** — `quack-02-user-model` (PR [#3](https://github.com/malekelkssas/quack-auth/pull/3)); destroyed/abandoned `quack-02-fe-setup`

**Chat summary** — No

**Context**

The Developer was running **multi-chat / parallel agent work** (separate branches per chat) from the **Agents** window. [PR #3](https://github.com/malekelkssas/quack-auth/pull/3) on `quack-02-user-model` landed in that plan alongside other in-flight chats.

**What happened**

After work on `quack-02-user-model`, the Developer noticed the AI had **not** updated `AI.md` for those changes. Related gaps surfaced at the same time: **mongoose/dtos conventions** lived in rules but were **not** reflected in `apps/DOCS` (later mirrored in `S008-convention-docs`), and other convention/doc sync issues disrupted the parallel plan.

**Developer judgement call**

Rather than continue parallel feature work on a shaky foundation, the Developer **destroyed/abandoned** the in-progress PR/branch **`quack-02-fe-setup`** and redirected effort to **conventions and documentation** (see `S007-user-model` — `project-conventions.mdc`, `AGENTS.md` index, skills→rules migration).

**Impact**

A **slight delay** in the Developer’s planned parallel agent workflow — one chat/branch (`quack-02-fe-setup`) was dropped so convention and logging hygiene could catch up before resuming multi-branch feature work.

---

## 2026-06-08 — Mongoose / DTO convention docs gap

**Session** — `S008-convention-docs`

**Local start time** — not recorded at session start

**Cursor surface** — Agents (subagent)

**Model** — Composer 2.5

**Developer flagged**

- Mongoose domain layout (`*.schema.ts`, `*.model.ts`, `*.paths.ts`) and DTO suffix conventions (`.model.ts` vs `.dto.ts`, domain folders) were defined in `.cursor/rules/project-conventions.mdc` and `AGENTS.md` but **not** mirrored in Docusaurus setup docs.

**What was missing**

- `07-mongodb.md` / `apps/mongodb.md` — only top-level `mongoose/` tree; no per-domain three-file pattern or `*.paths.ts` rationale.
- `05-shared-libraries.md` — flat `greeting.dto.ts` example only; no domain folders or `.model.ts` / `.dto.ts` split.
- `libs/dtos/README.md` — Nx boilerplate only.

**Docs added**

- `apps/DOCS/docs/setup/07-mongodb.md` — §7d domain model layout + link to `project-conventions.mdc`; Docker renumbered to §7e.
- `apps/DOCS/docs/apps/mongodb.md` — domain folders summary + cross-link to setup.
- `apps/DOCS/docs/setup/05-shared-libraries.md` — DTO domain folders, suffix table, NestJS wrapper pointer.
- `apps/DOCS/docs/ai/maintenance.md` — maintenance table rows for Mongoose/DTO conventions.

**Source of truth** — `.cursor/rules/project-conventions.mdc` (agents); DOCS are the human-facing mirror.

---

## 2026-06-08 21:31 — Restore AI.md session timestamps

**Session** — `S010-ai-md-timestamps`

**Local start time** — `2026-06-08 21:31`

**Cursor surface** — Agents

**Model** — Composer 2.5

**Developer asked for**

- Agents had **stopped logging `HH:MM`** in `AI.md` session headings after early entries (e.g. `S001` at `18:30`); later entries used date-only headings.
- Document the requirement in **`.cursor/rules/ai-first-engineering.mdc`** and note the Developer flagged it.
- Backfill times where known; mark _not recorded_ elsewhere.

**Implemented**

- Added **AI.md timestamps** section to `ai-first-engineering.mdc` (heading format `## YYYY-MM-DD HH:MM — …`).
- Added **Session entry timestamps** section to this file’s template.
- Backfilled **`Local start time`** on date-only sessions (`S005`–`S009`); `S001` heading already had `18:30`.

---

## 2026-06-08 21:33 — Revert invalid `user.fields.ts` (DTO convention)

**Session** — `S011-dto-fields-revert`

**Local start time** — `2026-06-08 21:33`

**Cursor surface** — Agents

**Model** — Composer 2.5

**Developer steered**

- During `S008-simplify-review`, AI introduced **`libs/dtos/src/lib/user/user.fields.ts`** (`UserEmail`, `UserName`) to dedupe Zod rules between `signup.dto.ts` and `user.model.ts`.
- The Developer **never defined** a `.fields.ts` suffix. Valid DTO layout is **`.model.ts`** (persisted mirror) and **`.dto.ts`** (flow/API) per domain folder — see `.cursor/rules/project-conventions.mdc`.
- Shared blocks inside a domain (e.g. `password.schema.ts`) are fine when multiple DTOs need the same rules; a new suffix is not.

**Fixed**

- Deleted `user.fields.ts`.
- Restored inline `email` / `name` validation in `user.model.ts` and `signup.dto.ts` as before the simplify pass.

---

## 2026-06-08 22:10 — FE Redux store + encrypt-storage (Developer request)

**Session** — `S012-fe-redux-store`

**Local start time** — `2026-06-08 22:10` (continued from earlier turns in same chat)

**Cursor surface** — Agents

**Branch** — `quack-02-fe-setup`

**Model** — Composer 2.5

**Chat summary** — No

**Developer asked for**

- Checkout `quack-02-fe-setup` for deep FE work; install RTK + `react-redux` + `redux-persist` + `@types/react-redux`; add `VITE_REDUX_PERSIST_SECRET_KEY` to `.env.example` and `ENV_KEYS`; scaffold `apps/FE/src/store/`.
- **Research encrypt integration first** — Developer shared findings: `redux-persist-transform-encrypt` is abandoned; static `VITE_*` keys are bundled and give false security; prefer runtime auth token or `encrypt-storage` as redux-persist storage engine.
- **Log this in `AI.md`** — Developer flagged that prior FE work skipped `AI.md`; update `AGENTS.md` so agents do not forget the logging rule.

**Implemented**

- Installed `@reduxjs/toolkit`, `react-redux`, `redux-persist`, `encrypt-storage`, `@types/react-redux`.
- **Skipped** `redux-persist-transform-encrypt` (archived Feb 2024); used **`encrypt-storage`** `AsyncEncryptStorage` as redux-persist `storage` with `stateManagementUse: true`.
- `apps/FE/src/store/` — `persist-secret.ts` (`getDevPersistSecretKey`, `setRuntimePersistSecretKey` for future JWT/session key), `encrypted-storage.ts`, `persist.config.ts`, `root-reducer.ts`, `store.ts`, `hooks.ts`, `index.ts`.
- `main.tsx` — `Provider` + `PersistGate` (loading placeholder until ProgressLoader lands in follow-up commit).
- `.env.example` + `libs/qu-constants/src/lib/env.constants.ts` — `VITE_REDUX_PERSIST_SECRET_KEY` with comment that it is dev obfuscation only.

**Decisions different from Developer’s initial package list**

| Developer listed                  | Chosen                                        | Why                                                                                          |
| --------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `redux-persist-transform-encrypt` | `encrypt-storage`                             | Original archived; storage-level encryption is the maintained redux-persist integration path |
| Static `VITE_` key as “security”  | Dev fallback + `setRuntimePersistSecretKey()` | `VITE_*` is in client bundle; real key should be runtime session/JWT when auth exists        |

**Verified**

- [x] `pnpm nx run FE:typecheck`

**Developer asked for (same session, next)**

- Commit Redux work; then shadcn scaffold (`apps/FE/src/components/ui`, `@/lib/utils.ts`); `ProgressLoader` on `PersistGate` instead of `null` loading.

**Implemented (continued)**

- Committed `feat(FE): add Redux store with encrypted redux-persist` (`8fcd399`).
- shadcn scaffold: `apps/FE/components.json` (CLI-ready, `ui` → `@/components/ui`), `src/lib/utils.ts` (`cn`), empty `src/components/ui/`.
- Deps: `tailwind-merge`, `class-variance-authority`, `lucide-react`, `tailwindcss-animate`; Tailwind theme tokens + `--academic-blue` in `styles.css`.
- `ProgressLoader` at `src/components/ProgressLoader.tsx`; `PersistGate loading={<ProgressLoader />}`.

**Verified**

- [x] `pnpm nx run FE:typecheck` (shadcn + ProgressLoader)

---

## 2026-06-08 22:20 — FE axios client convention

**Session** — `S012-fe-redux-store` (same chat)

**Local start time** — `2026-06-08 22:20`

**Cursor surface** — Agents

**Branch** — `quack-02-fe-setup`

**Model** — Composer 2.5

**Developer asked for**

- Install **axios**; create FE convention; `apps/FE/src/api/axiosConfig.ts` only — keep it simple (no interceptors, domain modules, or env wiring yet); **log in `AI.md`**.

**Implemented**

- `pnpm add axios`.
- `apps/FE/src/api/axiosConfig.ts` — default-exported instance, JSON content-type (baseURL initially wrong — see fix below).
- Convention in `.cursor/rules/project-conventions.mdc` — single shared instance, no stray `axios.create()`, future `*.api.ts` + interceptors rules; one-line pointer in `AGENTS.md`.

**Output that needed fixing**

- **Hard-coded API `baseURL`** — AI set `http://localhost:3000/api` directly in `axiosConfig.ts` instead of `VITE_API_URL` + `ENV_KEYS`. Developer corrected immediately.

**Verified**

- [x] `pnpm nx run FE:typecheck`

---

## 2026-06-08 22:23 — Fix axios baseURL env (Developer correction)

**Session** — `S012-fe-redux-store` (same chat)

**Local start time** — `2026-06-08 22:23`

**Cursor surface** — Agents

**Branch** — `quack-02-fe-setup`

**Developer asked for**

- Replace hard-coded `baseURL` with **`VITE_API_URL`**; update `.env.example` and `libs/qu-constants/src/lib/env.constants.ts`; log the mistake.

**Fixed**

- `VITE_API_URL=http://localhost:3000/api` in `.env.example`.
- `ENV_KEYS.VITE_API_URL` in `env.constants.ts`.
- `axiosConfig.ts` reads `import.meta.env[ENV_KEYS.VITE_API_URL]` with throw if missing.
- `project-conventions.mdc` — `baseURL` must come from `VITE_API_URL`, never hard-coded.

**Verified**

- [x] `pnpm nx run FE:typecheck`

---

## 2026-06-08 22:29 — Vite host env + FE build chunks

**Session** — `S012-fe-redux-store` (same chat)

**Local start time** — `2026-06-08 22:29`

**Cursor surface** — Agents

**Branch** — `quack-02-fe-setup`

**Developer asked for**

- Commit axios work; add `VITE_ALLOWED_HOSTS` + `VITE_HOST` to `.env.example` and `ENV_KEYS`; update `apps/FE/vite.config.mts` (server/preview host + `allowedHosts`, vendor chunk split) — **no** `@tailwindcss/vite` or `react-grab`.

**Implemented**

- Committed `feat(FE): add axios client with VITE_API_URL env` (`5e637f8`).
- `.env.example` — `VITE_ALLOWED_HOSTS=localhost`, `VITE_HOST=localhost` (comment notes `0.0.0.0` option).
- `vite.config.mts` — `process.env.VITE_HOST`, `VITE_ALLOWED_HOSTS` comma-split, `manualChunks` vendor split, `chunkSizeWarningLimit: 1000`.

**Output that needed fixing**

- **`manualChunks` object** — Vite 8 / Rolldown expects a **function**, not `{ vendor: [...] }`; converted to `manualChunks(id)` guard for react/react-dom.

**Verified**

- [x] `pnpm nx run FE:build`

---

## 2026-06-08 22:37 — FE Tailwind v3 → v4 migration

**Session** — `S012-fe-redux-store` (same chat)

**Local start time** — `2026-06-08 22:37`

**Cursor surface** — Agents

**Branch** — `quack-02-fe-setup`

**Model** — Composer 2.5 (Developer switched to **Plan mode** for migration planning; implementation resumed in Agent mode on a **different model/context handoff** from the planning turn)

**Chat summary** — No

**Developer asked for**

- Implement attached **FE Tailwind v4 Migration Plan** after committing pending vite-host work.
- Developer explicitly flipped assistant to **Plan mode** because migration is annoying/complex; requested **AI.md** note about Plan mode and **model switch**.
- Note that **Nx template ships Tailwind v3** — FE migrated to latest v4.

**Implemented**

- Committed `feat(FE): add Vite host env and build chunk tuning` (`b883208`) before migration.
- Deps: `tailwindcss@4.3.0`, `@tailwindcss/vite@4.3.0`, `tw-animate-css`; removed `tailwindcss@3.4.3`, `tailwindcss-animate`, `autoprefixer`.
- `apps/FE/vite.config.mts` — `@tailwindcss/vite` plugin (host/chunk settings preserved).
- `apps/FE/src/styles.css` — `@import "tailwindcss"`, `@import "tw-animate-css"`, `@custom-variant dark`, `@theme inline` shadcn tokens, `--academic-blue`, `animate-progress`.
- Removed `apps/FE/tailwind.config.js` and `apps/FE/postcss.config.js` (v4 CSS-first).
- `apps/FE/components.json` — `"config": ""` for shadcn v4 CLI.
- `ProgressLoader` — `var(--academic-blue)` + `animate-progress` token.
- Docs/conventions: `project-conventions.mdc`, `AGENTS.md`, `apps/DOCS/docs/setup/02-frontend.md`.

**Verified**

- [x] `pnpm nx run FE:typecheck`
- [x] `pnpm nx run FE:build`

---

## 2026-06-08 22:45 — FE dev tools: React Scan + React Grab

**Session** — `S012-fe-redux-store` (same chat)

**Local start time** — `2026-06-08 22:45`

**Cursor surface** — Agents

**Branch** — `quack-02-fe-setup`

**Model** — Composer 2.5

**Developer asked for**

- Add [React Grab](https://www.react-grab.com/) and [React Scan](https://react-scan.com/) to FE; **dev environment only**; document usefulness in `AI.md` and FE docs.

**Implemented**

- Dev deps: `react-grab`, `react-scan` (no Vite plugin — `react-grab` uses official `index.html` pattern; avoids Vite 8 peer mismatch on `@react-scan/vite-plugin-react-scan`).
- ~~`apps/FE/index.html` dynamic `await import()`~~ — **wrong** vs upstream docs; fixed below.

**Output that needed fixing (dev tools)**

- **index.html async imports** — not the latest Vite pattern. [React Scan](https://github.com/aidenybai/react-scan/blob/main/docs/installation/vite.md) requires **static** `import { scan } from 'react-scan'` before React. [React Grab](https://github.com/aidenybai/react-grab/blob/main/README.md#vite) belongs at the top of `main.tsx` via `import('react-grab')` when `import.meta.env.DEV`.

**Fixed (2026-06-08)**

- `apps/FE/src/dev-tools.ts` — static `scan` import + `scan({ enabled: true })` + `void import('react-grab')` in dev (per GitHub READMEs).
- `dev-entry.ts` → `dev-tools.ts` (when `!import.meta.env.PROD`) → `main.tsx` — correct load order; `index.html` no longer uses async imports.
- `vite.config.mts` — on `vite build`, force `import.meta.env.PROD` / `DEV` when Nx sets `NODE_ENV=development` so dev-tool chunks are not shipped.
- Docs: `apps/DOCS/docs/apps/frontend.md` — **Dev-only tooling** table with links; `project-conventions.mdc` — **FE dev tooling**.

**Why these tools**

- **React Scan** — zero-config visual highlights for avoidable re-renders during UI work.
- **React Grab** — copy component/file/HTML context straight into coding agents (⌘C / Ctrl+C on hover).

**Verified**

- [x] `pnpm nx run FE:build` — no `react-scan` / `react-grab` strings in `dist/apps/FE` output

---

## 2026-06-08 21:50 — BE utils + mongoose path aliases

**Session** — `S012-be-utils-mongoose-alias`

**Local start time** — `2026-06-08 21:50`

**Cursor surface** — Agents (subagent)

**Model** — Composer 2.5

**Branch** — `quack-03-signup-endpoint`

**Developer preferences (new conventions)**

- BE utility files live under `apps/BE/src/utils/` with **`.util.ts`** suffix (e.g. `password.util.ts`, `mongo-error.util.ts`).
- External service wrappers (S3, logger, email providers, …) go under `apps/BE/src/utils/libs/<domain-name-for-service>/` (e.g. `utils/libs/s3/`).
- **Rejected** deep relative imports to the repo Mongoose layer (e.g. `../../../../mongoose/models/user`). Use path alias **`@quack/mongoose/*`** instead — avoids npm `mongoose` package collision.

**Implemented**

- Documented BE `/utils` + `.util.ts` and `utils/libs/<service>/` in `.cursor/rules/project-conventions.mdc`; one-line pointer in `AGENTS.md`.
- Added `@quack/mongoose/*` → `mongoose/*` in `tsconfig.base.json` and `apps/BE/tsconfig.app.json`.
- Replaced deep relative mongoose imports in `user.repository.ts`, `password.util.ts`, `main.ts`.

---

## 2026-06-08 21:52 — Tech decisions TODO + PDF in repo

**Session** — `S012-tech-decisions-todo`

**Local start time** — `2026-06-08 21:52`

**Cursor surface** — Agents

**Model** — Composer 2.5

**Branch** — `quack-03-tech-decisions-todo` (`./scripts/next-quack-branch.sh tech-decisions-todo`)

**Developer asked**

- Branch for security/convention/feature backlog from `quack-auth-tech-decisions.pdf`.
- Detailed root `TODO.md` with audit of what is already done.
- Add PDF to repo; check branches/worktrees first.

**Implemented**

- Added `docs/quack-auth-tech-decisions.pdf` (from `/mnt/smalek/github/quack-auth/quack-auth-tech-decisions.pdf`).
- Added root `TODO.md` — 11 sections, `[x]`/`[~]`/`[ ]` per PDF area, repo-vs-PDF naming table, phased implementation order, cross-branch notes.

**Audit summary**

- **Done:** Nx scaffold, FE/BE apps, `libs/dtos` + `qu-constants`, nestjs-zod + Swagger + exception filters, Mongoose user schema + paths, Mongo Docker, Husky/CI conventions, DOCS.
- **Not done:** Auth endpoints, Passport/JWT, bcrypt, Helmet/throttler/CSRF, XSS transforms, pino/Seq, Redux/RTK/Router/auth UI, tests, app Dockerfiles.

---

## 2026-06-08 21:58 — BE route segments in shared constants

**Session** — `S013-be-routes-convention`

**Local start time** — `2026-06-08 21:58`

**Cursor surface** — Agents

**Model** — Composer 2.5

**Branch** — `quack-03-signup-endpoint`

**Developer preference**

- BE endpoint path segments must live in **`libs/qu-constants/src/lib/be-routes.constants.ts`** as a **`BE_ROUTES` enum**, exported via `@shared/constants` — not hardcoded in controllers or `main.ts`.
- Align global prefix with `BE_ROUTES.BASE` (`api`).

**Related conventions (already logged)**

- BE `*.util.ts` / `utils/libs/<service>/` — see `S012-be-utils-mongoose-alias`.
- `@quack/mongoose/*` path alias (no deep relative mongoose imports) — same session.

**Implemented**

- Added `BE_ROUTES` enum: `BASE`, `USERS`, `SIGNUP`.
- `users.controller.ts` — `@Controller(BE_ROUTES.USERS)`, `@Post(BE_ROUTES.SIGNUP)`.
- `main.ts` — `setGlobalPrefix(BE_ROUTES.BASE)`.
- Documented in `.cursor/rules/project-conventions.mdc`; pointer in `AGENTS.md`.

**Verified** — `pnpm nx run BE:typecheck`, lint on changed files.

---

## 2026-06-08 22:15 — Signup endpoint, conventions, MongoDB plugin

**Session** — `S014-signup-endpoint`

**Local start time** — `2026-06-08 22:15`

**Cursor surface** — Agents

**Model** — Composer 2.5

**Branch** — `quack-03-signup-endpoint`

**Developer preferences (new / confirmed)**

- **Feature DTO wrappers** colocated with controller: `apps/BE/src/<feature>/<feature>.dto.ts` (e.g. `users/users.dto.ts` + `SignupDto`) — keep this pattern.
- **Global Mongoose error handler** — `MongooseErrorHandler` in `mongoose-error.handler.util.ts`; maps ValidationError, CastError, DocumentNotFoundError, VersionError, duplicate key (11000), network/selection errors to Nest HTTP exceptions; used in services via `rethrow` and globally in `GlobalExceptionFilter`.
- **MongoDB Cursor plugin** installed — MCP available for connection tuning, schema design, queries, index advice; documented in `AGENTS.md` and `ai-first-engineering` subagent.
- **Repository follow-ups** (TODO only, not implemented): unified repository interface + atomic transaction setup.

**Implemented**

- Signup stack: `UserRepository`, `UserService`, `UsersModule`, `POST /api/users/signup` → 201, Argon2id hashing.
- `BE_ROUTES`, `@quack/mongoose/*`, BE `*.util.ts` conventions.
- Synced root `TODO.md` from `main` worktree (remote pull unavailable — SSH); audited completed items; added repository-interface + atomic-transaction TODOs.
- Replaced minimal `mongo-error.util.ts` with `mongoose-error.handler.util.ts`.

**Remote** — `git pull` failed (SSH key); used main worktree copy for `TODO.md` + tech-decisions PDF.

---

## 2026-06-08 23:30 — Signup review, unified exception filter, PR #5

**Session** — `S015-signup-review-pr`

**Local start time** — `2026-06-08 23:30`

**Cursor surface** — Agents

**Model** — Composer 2.5

**Branch** — `quack-03-signup-endpoint` → [PR #5](https://github.com/malekelkssas/quack-auth/pull/5)

**Implemented**

- Code review + simplify: consolidated `HttpExceptionFilter` into `GlobalExceptionFilter`; dropped `toHttpException` alias (`transformError` public); email normalize in `Signup` Zod; Mongoose pre-save owns hashing; unique index for duplicate email.
- Docs: `06-nestjs-zod.md` + `backend.md` synced to `ErrorResponse` contract.
- Merged `main` (tech-decisions TODO branch); resolved `AI.md` / `TODO.md` conflicts.

**Verified** — `pnpm check`, `pnpm nx build DOCS`.

---

## 2026-06-08 23:45 — DB seed data & fixtures (`quack-05-db-seed-fixtures`)

**Session** — `S016-db-seed-fixtures`

**Local start time** — `2026-06-08 23:45`

**Cursor surface** — Agents

**Model** — Composer 2.5

**Branch** — `quack-05-db-seed-fixtures` (from `main` via `./scripts/next-quack-branch.sh db-seed-fixtures`; renamed from `quack-04-db-seed-fixtures` because `quack-04-be-tests-setup` already exists — script does not strip worktree `+` prefix when scanning branch numbers)

**Implemented**

- `mongoose/fixtures/user.fixtures.ts` — three dev users (`alice@example.com`, `bob@example.com`, `admin@quack.dev`) with known plaintext passwords (`FIXTURE_USER_PASSWORD` / `AdminPass1!`).
- `mongoose/fixtures/load.fixtures.ts` — `loadFixtures()` using `UserModel.create()` so Argon2id pre-save hashing runs; supports `{ reset: true }`.
- `mongoose/fixtures/index.ts` — re-exports.
- `mongoose/seed.ts` — CLI entry; `--reset` drops users before insert.
- `mongoose/register-paths.js` + `mongoose/tsconfig.json` `ts-node` commonjs block — path alias resolution for standalone seed script.
- `package.json` — `pnpm db:seed`, `pnpm db:seed:reset`; added `tsconfig-paths` devDependency.

**Validated (live Docker MongoDB)**

- `docker compose` — `quack_auth_mongodb` healthy on `:27017`.
- `pnpm db:seed:reset` → `Seeded 3 user(s) (collections reset).`
- `pnpm db:seed` (idempotent) → re-run skips existing, still reports 3 users.
- `mongosh` on `quack-auth.users`: 3 documents; emails `alice@example.com`, `bob@example.com`, `admin@quack.dev`; all passwords `$argon2id$…` (no plaintext).

**Judgement calls**

- Fixtures use `UserModel.create()` not `insertMany()` — pre-save middleware must run for hashing.
- Seed runner uses `ts-node` + `tsconfig-paths` + `node --env-file=.env` instead of adding `dotenv`.

---

## 2026-06-08 23:50 — FE auth branch + worktree-aware branch script

**Session** — `S016-fe-auth-pages`

**Local start time** — `2026-06-08 23:50`

**Cursor surface** — Agents

**Model** — Composer 2.5

**Branch** — `quack-06-fe-auth-pages` (created from `main` @ `166ba97`)

**Developer request**

- Start a branch for FE theme/design and sign-up + login pages (sign-up wired first; login UI only for now).
- When running `./scripts/next-quack-branch.sh`, **do not miss `quack-XX-*` branches checked out in other Cursor worktrees** — Developer noticed parallel worktrees (`quack-04-be-tests-setup`, `quack-05-db-seed-fixtures`) and asked for script + doc updates.

**Implemented**

- Updated `scripts/next-quack-branch.sh` to union branch names from `refs/heads`, `refs/remotes/origin`, and `git worktree list --porcelain` (`branch refs/heads/...`); prints active worktrees on quack branches before creating the next branch.
- Ran `./scripts/next-quack-branch.sh fe-auth-pages` → `quack-06-fe-auth-pages` (next after `05`, worktrees listed correctly).
- Updated **Branch per chat** section above to mention worktree inspection + script behavior.

**Planned on this branch (not started this turn)**

- FE theme/design system baseline, sign-up page (functional), login page (static/shell).

---

## 2026-06-09 00:05 — FE API conventions (`handleError`, `services/`)

**Session** — `S016-fe-auth-pages`

**Local start time** — `2026-06-09 00:05`

**Cursor surface** — Agents

**Model** — Composer 2.5

**Branch** — `quack-06-fe-auth-pages`

**Developer conventions (new)**

1. **`apps/FE/src/api/handleError.ts`** — maps `AxiosError` / network failures to `ErrorResponse` (`@shared/dtos`); axios codes/messages in `apps/FE/src/utils/constants.ts`.
2. **`apps/FE/src/api/services/`** — domain axios call sites (e.g. `authService.ts`); routes built from `BE_ROUTES` (`@shared/constants`), shared `api` instance from `axiosConfig.ts`.

**Implemented**

- `handleError.ts`, `utils/constants.ts` (`AXIOS_ERROR_CODES`, `AXIOS_CONSTANTS`).
- `services/authService.ts` — `AuthService.signup` → `POST /users/signup`.
- Updated `.cursor/rules/project-conventions.mdc` (FE HTTP client section).

---

## 2026-06-09 00:20 — Convention must sync Docusaurus docs (Developer catch)

**Session** — `S016-fe-auth-pages`

**Local start time** — `2026-06-09 00:20`

**Cursor surface** — Agents

**Model** — Composer 2.5

**Branch** — `quack-06-fe-auth-pages`

**Developer feedback**

- FE API conventions were added to `project-conventions.mdc` but **Docusaurus app docs were not updated** — Developer asked to make doc updates **mandatory** when conventions change.

**Implemented**

- `project-conventions.mdc` — step 3 + **Convention → docs map** (FE → `frontend.md`, BE → `backend.md`, Mongoose, setup, AI).
- `ai-first-engineering.mdc` step 0 — same requirement; `AGENTS.md` pointer updated.
- Backfilled docs: `apps/DOCS/docs/apps/frontend.md` (HTTP client), `backend.md` (`BE_ROUTES`), `setup/10-git-branches-commits.md` (worktree list).

---

## 2026-06-09 00:45 — FE Redux slices, slice hooks, layered flow

**Session** — `S016-fe-auth-pages`

**Local start time** — `2026-06-09 00:45`

**Cursor surface** — Agents

**Model** — Composer 2.5

**Branch** — `quack-06-fe-auth-pages`

**Developer rationale (slice hooks)**

> Unified slice-hook interface so when slice shape changes, you update few interface files instead of many consumers across the app.

**Implemented**

- `store/slices/authSlice.ts` — `signup` async thunk (`AuthService.signup` + `handleError` + `rejectWithValue`); granular `isSigningUp` / `signupError` / `signupSucceeded`; `user` placeholder for future auth endpoints.
- `hooks/slices/useAuth.ts` — unified auth slice interface (state + `signup` / `clearSignup` / `clearError`).
- `api/services/index.ts` — barrel export for `AuthService`.
- `root-reducer.ts` — wired `auth` slice.
- Conventions: `project-conventions.mdc` (Redux, slice hooks, layered flow); `frontend.md` (full FE flow + mermaid); `README.md` (monorepo + FE layer diagram); `@docusaurus/theme-mermaid` enabled in DOCS.

**Deferred**

- Full auth pages, page contexts, component logic hooks — structure only; login/checkAuth/logout thunks wait for BE routes.

## 2026-06-09 01:15 — FE duck theme + auth pages + toast system

**Session** — `S016-fe-auth-pages`

**Local start time** — `2026-06-09 01:15`

**Cursor surface** — Agents

**Model** — Composer 2.5

**Branch** — `quack-06-fe-auth-pages`

**Overview**

> Retheme FE Tailwind tokens to the retro "duck pond" design language, build animated-duck Login + Sign-up pages with react-router, add a classic shadcn toast system with success/warning/error variants + `use-error`/`use-success`, and wire Sign-up to the `useAuth` slice hook via react-hook-form + the shared Zod `Signup` DTO.

**Deps added** (root `package.json`, hoisted to FE)

- `react-router-dom` — real `/login` + `/signup` routes.
- `react-hook-form` + `@hookform/resolvers` — `zodResolver` (Zod v4 compatible).
- `@radix-ui/react-toast` — classic shadcn toast primitive.

**Implemented**

- **Tokens & fonts** — full token replacement to the duck pond palette (single dark theme; dropped the `.dark` block), Google Fonts `@import` (Press Start 2P + VT323), `@theme inline` `--color-*` + `--font-pixel`/`--font-body`, `bob` keyframes + `.pixelated` helper; duck `index.html` title.
- **Sprites + visuals** — walking-duck sprite sheets in `apps/FE/public/sprites/` (`duckling.png`, `mallard.png`); `components/duck/` `DuckCanvas` (6-frame animation, modes `duckling`/`mallard`/`both`), `StarField`, `PixelField`, `PixelButton`.
- **Routing + pages** — `BrowserRouter` in `main.tsx`; `Routes` (`/login`, `/signup`, `/` → `/signup`) + `<Toaster/>` in `app/app.tsx`; `pages/auth/` with `AuthLayout`, `Login` (UI only) + `useLogin`, `Signup` + `useSignup`.
- **Toast system** — classic shadcn `toast.tsx`/`toaster.tsx` + `use-toast`; `success`/`warning`/`error` variants; `utils/constants.ts` → `utils/constants/` dir (`index.ts` barrel, `axios.constants.ts`, `toast-variants.constants.ts`); `use-error` / `use-success` system hooks.
- **Signup integration** — `useSignup` uses `useForm<z.input, unknown, z.output>` + `zodResolver(Signup)` from `@shared/dtos` → `useAuth().signup`; success toast "Welcome to the pond!", error via `use-error`, cleanup on unmount.
- **Docs** — expanded `docs/apps/frontend.md` into the `docs/apps/FE/` directory (`_category_.json` + `01-overview`…`09-testing`, new testing page), deleted the old `frontend.md`, fixed cross-links (`backend.md`, `ai/maintenance.md`); updated `project-conventions.mdc` (FE docs-map row + new pages/system-hooks/constants-dir/toast-variant/public-assets conventions), `AGENTS.md`, `ai-first-engineering.mdc`, `docusaurus-docs.mdc`, and `TODO.md`.

**Judgement calls / deviations**

- **Classic toast vs `sonner`** — chose the classic shadcn Radix toast for a typed `cva` variant API + reducer queue that `use-error`/`use-success` can drive, rather than `sonner`.
- **`useEffectEvent` availability** — verified the installed React supports it; otherwise the toast hooks fall back to a `useRef`-of-latest-values pattern.
- **Single dark duck theme** — dropped the shadcn light/dark split in favor of one dark pond theme per the design language.

## 2026-06-09 01:50 — FE route path constants

**Session** — `S016-fe-auth-pages`

**Local start time** — `2026-06-09 01:50`

**Cursor surface** — Agents

**Model** — Composer 2.5

**Developer request**

> Use a constants file for FE route paths (e.g. redirects in `app.tsx` and cross-links in Login/Signup) instead of scattered magic strings like `"/login"` and `"/signup"`. Log this in `AI.md`.

**Done**

- Added `apps/FE/src/utils/constants/routes.constants.ts` — `FE_ROUTES` (`HOME`, `LOGIN`, `SIGNUP`), `FE_DEFAULT_ROUTE` (`FE_ROUTES.SIGNUP`); re-exported from `@/utils/constants`.
- Wired `app/app.tsx` (`<Route>`, `<Navigate>`), `Login.tsx` and `Signup.tsx` (`<Link>`) to the constants.
- Updated `project-conventions.mdc` (FE pages routing + `utils/constants/` list) and `apps/DOCS/docs/apps/FE/04-routing-pages.md`.

---

## 2026-06-08 — BE API test plan revised (`quack-04-be-tests-setup`)

**Session** — `S017-be-tests-setup`

**Cursor surface** — Agents

**Model** — Composer 2.5

**Branch** — `quack-04-be-tests-setup`

**Deferred then implemented** — execution paused until S016 (`quack-05-db-seed-fixtures`) merged; tests reuse `mongoose/fixtures/` + `loadFixtures({ reset: true })`.

**Developer direction (testing preferences)**

- **API-level only** — same habit as plain Node: **Supertest** on HTTP, not colocated unit `*.spec.ts` next to services.
- **Branch** — `quack-04-be-tests-setup`; fixtures/seeding (`quack-05`) had to land first so tests share `mongoose/fixtures/`.
- **Follow-up asks (same session):**
  - Use **`BE_ROUTES`** from `libs/qu-constants/.../be-routes.constants.ts` in test helpers/paths (no hardcoded `/users/signup`).
  - **Signup coverage** — trace DTO → controller → service → repo; add edge cases with **exact** `response.body.message` (e.g. missing password, weak password rules) via `expectApiError()` convention.
  - **Docs** — expand BE section under `apps/DOCS/docs/apps/be/` (not just a line in `backend.md`); dedicated **testing** page for structure, fixtures, CI.
  - **README** — document `pnpm test:be` / `pnpm nx test BE` and CI including BE tests.

**AI.md correction (S016)** — only `loadFixtures()` exists; `loadUserFixtures()` was a logging typo.

**Implemented**

- `apps/BE/src/test/` — Jest + Supertest API specs (`*.api-spec.ts`), in-memory Mongo, `resetDb()` → `loadFixtures({ reset: true })`.
- `apps/BE/src/app/configure-app.ts` — shared global prefix + CORS for `main.ts` and tests.
- `apps/BE/jest.config.ts`, `tsconfig.spec.json`; `pnpm test:be` / `pnpm nx test BE`; CI via `pnpm ci`.
- Test helpers: `API_PATHS` / `apiPath()` from `BE_ROUTES`; `expectApiError()` for exact `{ message }` assertions.
- Signup specs: **11** cases + **1** app smoke = **12** total (201, 409 duplicate, 400 validation — missing fields, email, name length, password rules).
- Docs: `apps/DOCS/docs/apps/be/` (`overview.md` slug `/apps/backend`, `testing.md`); README **Tests** section.

**Verified** — `pnpm nx test BE` (12 tests), `pnpm nx typecheck BE`, `pnpm nx build DOCS`.

**Developer noticed: “only 4 tests?”** — Nx had **cached** an earlier `BE:test` run from before signup expansion (`Nx read the output from the cache instead of running the command`). Fresh run: `pnpm nx reset && pnpm nx test BE --skip-nx-cache` → **12 passed**. Not a missing-spec bug; stale task cache. After noticing, confirmed all 11 signup + 1 app tests in source.

**Developer workflow (first triple command in one message)** — Ran **`/code-review`**, **`/simplify`**, and **`/babysit`** together in a single chat message (not split across messages/chats). Outcomes: code review flagged docs/CI wiring gap (`pnpm ci` missing `nx test BE` despite README); simplify pass added `api-spec-lifecycle`, `it.each` validation table, slimmer `expectApiError`; babysit targeted merge-ready fixes before PR.

---

## 2026-06-09 00:43 — Login + cookie JWT auth endpoints

**Session** — `S017-login-auth-endpoints`

**Local start time** — `2026-06-09 00:43`

**Cursor surface** — Agents

**Model** — Codex 5.3

**Branch** — `quack-07-login-auth-endpoints`

**Chat summary** — No

**Developer confirmed route decisions**

- Auth endpoints under `/api/auth` (`register`, `login`, `refresh`)
- `GET /api/users/me` remains under users

**Implemented**

- Added shared route/env constants and DTOs for login + auth response payloads.
- Added backend `auth` module with register/login/refresh endpoints, cookie issuance, token verification, refresh-token hashing and rotation.
- Added cookie-based guard for `/api/users/me` returning `401` when unauthorized.
- Updated user persistence model/repository for `refreshTokenHash` metadata and rotation timestamp.
- Replaced FE scaffold with `/signin` and protected `/app` flow using `@shared/dtos` `Login` schema and credentialed requests.
- Synced docs (`apps/DOCS`), `TODO.md`, and `.env.example` with the new auth flow.

**Security defaults implemented**

- Access token TTL: `600` seconds (10 minutes)
- Refresh token TTL: `86400` seconds (24 hours)
- HttpOnly cookies for both access and refresh tokens
- `SameSite=lax` default, `Secure` in production
- Invalid/expired refresh returns `401` and clears cookies

**Verified**

- [x] `pnpm nx run BE:typecheck`
- [x] `pnpm nx run FE:typecheck`
- [x] `pnpm nx build BE`
- [x] `pnpm nx build FE`
- [x] `pnpm check` (lint + typecheck + format:check)

**Follow-up — DTO mirror + auth response shape (Developer request)**

- Extended `libs/dtos/src/lib/user/user.model.ts` to mirror persisted user docs: `_id`, `createdAt`, `updatedAt`, plus refresh metadata fields.
- Removed hand-written `auth-user.dto.ts`; `AuthUser` is now `User.pick({ _id, email, name, createdAt, updatedAt })` in `auth-response.dto.ts`.
- Updated repository/auth service/FE to use `_id` (not `id`) for API user payloads and JWT `sub`.

**Follow-up — `@CurrentUser()` decorator (Developer request)**

- Replaced manual `request.user?.sub` extraction in `users.controller.ts` with `@CurrentUser()` param decorator.
- Moved decorator to `apps/BE/src/decorators/current-user.decorator.ts` (shared decorators live under `decorators/`, not feature folders).
- Documented BE decorators layout in `.cursor/rules/project-conventions.mdc`.

**Verified (follow-up)**

- [x] `pnpm nx run BE:lint --skip-nx-cache`
- [x] `pnpm nx run BE:typecheck --skip-nx-cache`

**Follow-up — auth API test suite (S017)**

- Added Supertest specs: `auth/register`, `auth/login`, `auth/refresh`, `users/me` (27 tests total).
- Helpers: `cookies.ts`, `auth.ts`, `auth-user.ts`; extended `API_PATHS` in `request.ts`.
- Removed legacy `users/signup.api-spec.ts` (superseded by `auth/register.api-spec.ts`).
- Refresh rotation reuse test waits 1.1s so JWT `iat` differs (same-second refresh can re-issue identical tokens).
- Expired access token tested via `jwt.sign({ expiresIn: -60 })` — no time mock needed.

**Verified (auth tests)**

- [x] `pnpm nx test BE --skip-nx-cache` (27 passed)
- [x] `pnpm check`

---

## 2026-06-09 14:30 — S007-login-auth-endpoints (auth security hardening)

**Session id** — `S007-login-auth-endpoints`

**Local start time** — `2026-06-09 14:30`

**Cursor surface** — Agents

**Model** — Composer 2.5

**Branch** — `quack-07-login-auth-endpoints`

**Chat summary** — No

**Decisions**

- **Refresh storage:** HMAC-SHA256 digest of refresh JWT (`token-hash.util.ts`) keyed by `AUTH_REFRESH_TOKEN_SECRET` — not Argon2 (passwords stay Argon2id).
- **Rotation:** Compare-and-swap `rotateRefreshTokenHash` — concurrent refresh losers get 401 + cookie clear.
- **CSRF:** `csrf-csrf` double-submit; cookie `qa_csrf_token`, header `x-csrf-token`; protects auth POSTs only.
- **Logout:** `POST /api/auth/logout` → 204, `clearRefreshTokenHash` when access valid, always clear cookies.
- **Production secrets:** `resolveAuthSecret` / `assertProductionSecret` fail-fast on missing or `change-me-*` / `dev-*-secret` placeholders.
- **Tests:** `SIGNUP_VALIDATION_CASES` fixture for shared `it.each` validation matrix.

**Documentation (sections 7–9)**

- Added `apps/DOCS/docs/apps/be/security.md`; linked from `overview.md`, `03-backend.md`, `testing.md`.
- Updated `testing.md` — CSRF helpers, logout spec, **41** tests.
- `TODO.md` — CSRF `[x]`, logout/CAS/secret items, Last audited.

**Known limitation (documented)**

- Access JWT valid until TTL after logout (no revocation list).

**Verified**

- [x] `pnpm nx test BE --skip-nx-cache` (**41** passed)
- [x] `pnpm nx build DOCS`

---

## 2026-06-09 16:00 — S008-fe-auth-rtk-query

**Session id** — `S008-fe-auth-rtk-query`

**Local start time** — `2026-06-09 16:00`

**Cursor surface** — Agents

**Model** — Composer 2.5

**Branch** — `cursor/5bce9f1d`

**Chat summary** — No

**Decisions**

- **Auth HTTP via RTK Query** — `authApi` + `axiosBaseQuery` on the shared axios instance; removed `AuthService.signup` and `createAsyncThunk` signup from `authSlice`.
- **Session state split** — `authSlice` holds `user` only; matchers sync from `register` / `login` / `getMe` / `logout` fulfilled.
- **Persist** — blacklist `authApi` cache; whitelist `auth.user` only via `createTransform`.
- **401 refresh** — `setupAxiosInterceptors` with single-flight queue; refresh 401 → `resetApp()` + `authApi.util.resetApiState()` + `persistor.purge()` + hard redirect to login (not soft `navigate`).
- **Routes** — `/` protected home; `FE_DEFAULT_ROUTE = LOGIN`; `/logout` trigger page; `ProtectedRoute` always calls `lazyGetMe()` to validate cookies even when `user` is rehydrated.
- **Page hooks** — signup/login use RTK Query mutation `unwrap()` + inline success toast + navigate home; `useError` + `toErrorResponse()` for mutation errors (no slice-level signup flags).

**Verified**

- [x] `pnpm nx build DOCS`
- [x] `pnpm check`

---

## 2026-06-09 16:00 — S008-be-security-hardening

**Session id** — `S008-be-security-hardening`

**Local start time** — `2026-06-09 16:00`

**Branch** — `quack-08-be-security-hardening`

**Scope** — TODO Phase C: Helmet, `@nestjs/throttler` on auth routes, shared Zod XSS sanitize, password-hash response regression tests, docs sync.

**Multi-agent** — Wave 1 (parallel): Helmet, Throttler, XSS sanitize. Wave 2: integration tests. Wave 3: docs-maintainer. Parent: `pnpm ci` + TODO audit.

**Decisions**

- **Helmet:** `helmet.config.ts` colocated with `csrf.config.ts`; CSP off outside production (Swagger); prod HSTS + `frameguard: deny` + `noSniff`.
- **Throttler:** `@UseGuards(ThrottlerGuard)` on `AuthController` only (not global); defaults 10 req / 60s; e2e `AUTH_THROTTLE_LIMIT=1000`.
- **XSS:** `sanitizePlainText` via `sanitize-html` with decode+strip loop (preserves plain `&`); `Signup.name` only — not password/email.
- **Build:** `esModuleInterop` in `apps/BE/tsconfig.app.json` for webpack + dtos `sanitize-html` import; dtos `tsconfig.lib.json` excludes `*.spec.ts`.

**Documentation**

- [docs-maintainer](cfbc1bf5-de91-4b35-a71f-143ba902586d): `security.md`, `03-backend.md`, `testing.md` — **48** BE tests documented.

**Verified**

- [x] `pnpm ci` (check + build + `pnpm nx test BE`)
- [x] `pnpm nx test dtos` (**5** passed)
- [x] `pnpm nx build DOCS`

**Changed vs default AI**

- Iterative decode+strip for XSS (Agent 3) vs single `sanitize-html` pass.
- `esModuleInterop` on BE app tsconfig (not only dtos) to unblock webpack build.

### Developer notice — ErrorResponse + body limit (follow-up)

**Developer found (review after S008 wave):**

1. Rate limiter **429** did not follow our `ErrorResponse` convention — message was internal Nest text (`ThrottlerException: Too Many Requests`), no stable `code`.
2. **Max JSON body size** was never configured or documented — only Express default (~100kb), no `BE_JSON_BODY_LIMIT` env.

**Developer asked explicitly:** (1) Does the rate limiter 429 respect `libs/dtos/src/lib/error/error-response.dto.ts`? (2) Is max JSON body size indicated/configured?

**What initial S008 got wrong (AI oversight):**

- Shipped `@nestjs/throttler` and asserted the raw exception string in `throttle.api-spec.ts` instead of mapping through `fromHttpException` / `API_ERROR_CODES` like other API errors.
- Omitted body-parser limit wiring in `configure-app.ts` and env/docs for payload size.
- Closed S008 with `pnpm ci` (build + test) but **did not verify `pnpm nx serve BE`** — so the Swagger/OpenAPI path was untested until the Developer ran serve locally.

**Before fix:** Throttle **429** returned `{ message: 'ThrottlerException: Too Many Requests' }` — `{ message }` shape only, not a product-facing error. No env-configurable body size limit.

**Fix**

- `fromHttpException` maps **429** → `{ message: 'Too many requests', code: 'TOO_MANY_REQUESTS' }` and **413** → `{ message: 'Request body too large', code: 'PAYLOAD_TOO_LARGE' }` (`API_ERROR_CODES` in `@shared/constants`).
- `GlobalExceptionFilter` handles Express `entity.too.large` for oversized bodies.
- `BE_JSON_BODY_LIMIT` (default `100kb`) via `body-parser.config.ts`; apps created with `{ bodyParser: false }`.
- Tests: `throttle.api-spec.ts` updated; new `body-size.api-spec.ts` + `error-response.util.spec.ts`. `expectApiError` accepts optional `code`.

**Verified (follow-up)**

- [x] `pnpm nx test BE --skip-nx-cache` (**52** passed)
- [x] `pnpm check`

### Fix — Zod date / OpenAPI startup crash (Developer terminal find)

**Developer surfaced:** `pnpm nx serve BE` exit **1** — stack in `zod/v4/core/json-schema-processors.cjs` (`dateProcessor`): **`Date cannot be represented in JSON Schema`**. Observed while serving BE after S008 (local terminal during `nx serve BE`).

**Root cause:** `AuthUser` picked `createdAt`/`updatedAt` from persisted `User` (`z.coerce.date()`). nestjs-zod / Swagger `cleanupOpenApiDoc` at startup cannot emit Zod dates to JSON Schema (Zod v4). Build + API tests passed; **serve-only** failure.

**Fix**

- `AuthUser` (`auth-response.dto.ts`): `createdAt`/`updatedAt` as `z.iso.datetime()` (API/OpenAPI-safe ISO strings); persisted `User` model keeps `z.coerce.date()`.
- `UserRepository.toAuthUser`: `toISOString()` when mapping Mongoose dates to `AuthUser`.

**Verified**

- [x] `pnpm nx build dtos --skip-nx-cache` + `pnpm nx build BE --skip-nx-cache`
- [x] `pnpm nx serve BE --skip-nx-cache` — starts; Swagger at `/docs`
- [x] `pnpm nx test BE --skip-nx-cache` (**52** passed)

### Developer UAT — signup 403 / “CORS Missing Allow Origin”

**Developer reported:** `POST /api/auth/register` from FE showed **403** and browser **“CORS header Access-Control-Allow-Origin missing”** while testing XSS on signup.

**Actual cause:** **CSRF** rejection (`invalid csrf token`) — FE never bootstrapped `qa_csrf_token` before the first mutating request; CSRF error responses also lacked CORS headers when CORS was registered after CSRF middleware (browser misreported as CORS).

**Fix**

- `apps/FE/src/hooks/use-csrf-bootstrap.ts` + `useCsrfBootstrap()` in `app.tsx` — safe `GET /api` on load (matches test `fetchCsrf` flow).
- `configure-app.ts` — `enableCors` moved **first** so 403s include `Access-Control-Allow-Origin`.

**Developer XSS signup test (after fix):** use name `bad<script>alert(1)</script>guy` → expect stored/display name `badguy`; fresh email + password `Password1!`.

---

## 2026-06-09 — S009-quack-endpoint

**Session id** — `S009-quack-endpoint`

**Local start time** — _not recorded at session start_

**Branch** — `quack-11-endpoint`

**Cursor surface** — Agents

**Developer intent**

- **CSRF scope shift:** Remove CSRF from login/register/refresh/logout — no real authenticated state change there yet; CSRF belongs on **logged-in mutations** instead.
- **New `POST /api/quack`:** JWT cookie auth; optional `name` in body; response `{ quack: "<resolvedName> quack" }`; fallback to stored user name when `name` omitted.
- **Response shape confirmed:** `{ "quack": "Jane quack" }`.

**Implementation**

- `BE_ROUTES.QUACK` + `QuackInput` / `QuackResponse` in `libs/dtos`.
- `apps/BE/src/quack/` module — `JwtCookieAuthGuard`, name resolution via `UserService.getMe`.
- `csrf.config.ts` — protects `POST /api/quack` only; **403** includes `INVALID_CSRF_TOKEN`.
- Tests: `quack.api-spec.ts` (401/403/200 cases); CSRF stripped from auth specs + `auth.ts` helper.
- Docs: `security.md`, `overview.md`, `testing.md`, `TODO.md`.

**Verified**

- [x] `pnpm check`
- [x] `pnpm nx test BE --skip-nx-cache` (**56** passed)
- [x] `pnpm nx build DOCS`

**Changed vs default AI**

- 401 quack spec bootstraps CSRF without auth cookies — global CSRF middleware runs before `JwtCookieAuthGuard`, so bare POST without token returns **403**, not **401**.

### Developer override — no sanitize on quack name fallback (2026-06-09 16:03)

**Developer asked:** why does `QuackService` call `sanitizePlainText(user.name)` when falling back to the stored name?

**Judgement:** **Not needed.** Names are already sanitized at **signup** (`Signup.name` → `PlainTextName` / `sanitizePlainText` transform). Re-sanitizing on read in quack was defensive over-engineering from `/code-review` / `/simplify` — rejected.

**Reverted:** `quack.service.ts` uses `user.name` as stored; optional request `name` still goes through `QuackInput` / `OptionalPlainTextName` (sanitize + length on input only).

---

## 2026-06-09 16:55 — S010-fe-merge-duck-polish

**Session id** — `S010-fe-merge-duck-polish`

**Local start time** — `2026-06-09 16:55`

**Cursor surface** — Agents

**Model** — Claude Opus 4.8

**Branch** — `quack-09-fe-auth-rtk-query`

**Chat summary** — No

**Scope** — Commit/push the FE auth RTK Query + detective-home + quack work, merge `main`, then fix a merge regression and polish the duck canvas.

**Decisions**

- **Branch/commits** — split the FE work into Conventional Commits (`fix(scripts)`, `feat(dtos)` quack route/DTO, `feat(FE)` auth+home+quack, `docs`), pushed `quack-09-fe-auth-rtk-query` with upstream tracking. Git auth fixed by switching `origin` to HTTPS + `gh auth setup-git` (was failing on SSH publickey).
- **Merge `main`** — resolved 5 conflicts: took main's canonical `QuackInput` (`OptionalPlainTextName`, real sanitize) over my simplified mirror; kept both `sanitize` export + `useCsrfBootstrap`; merged both AI.md/TODO.md log blocks.
- **Sanitizer regression (root cause)** — main's `sanitizePlainText` used Node-only `sanitize-html`; because the shared `Signup`/`Login` DTOs are imported by the FE, Vite tried to bundle `sanitize-html` (fs/path/url/source-map-js externalized warnings), breaking the auth-page module graph so `DuckCanvas` stopped rendering. Reimplemented `sanitizePlainText` as a **pure-JS isomorphic** stripper (script/style content removal + tag strip + entity-decode loop), no external deps — single shared schema preserved, BE behavior unchanged.
- **DuckCanvas UX** — ducks now spread across the canvas on first paint (no slow off-screen walk-in), smaller wrap gap, and a `transition-opacity duration-500` fade keyed off a `ready` flag so the duckling/mallard/both toggle crossfades instead of snapping.

**Verified**

- [x] `pnpm check` (pre-commit, all commits)
- [x] `pnpm nx test dtos --skip-nx-cache` (**5** passed — sanitize behavior unchanged)
- [x] `pnpm nx test BE --skip-nx-cache` (**59** passed — incl. XSS signup spec)
- [x] `pnpm nx build FE --skip-nx-cache` (2000 modules, no `sanitize-html` externalization)
- [x] FE typecheck + lint

**Changed vs default AI**

- Chose an isomorphic regex/JS sanitizer over polyfilling Node built-ins in Vite or splitting the shared schema — keeps one `@shared/dtos` source of truth while unblocking the browser bundle.

**Needs Developer note**

- `sanitize-html` (+ `@types/sanitize-html`) is now an **unused dependency** — safe to drop from `package.json` in a follow-up cleanup.
- Quack query auto-fires on Home mount and may race the CSRF bootstrap on a cold load (one-off 403, SpeechBubble shows error fallback) — can convert to a lazy/triggered query if it surfaces.

---

## 2026-06-09 17:32 — S011-fe-home-401-disappear

**Session id** — `S011-fe-home-401-disappear`

**Local start time** — `2026-06-09 17:32`

**Cursor surface** — Agents (multitasking subagent)

**Model** — Claude Opus 4.8

**Branch** — `quack-09-fe-auth-rtk-query`

**Chat summary** — Yes (context compacted earlier this chat — see summary note below)

**Scope** — Home-page bug triage: (1) content disappears "after some time, background remains"; (2) Developer reports `GET /api/users/me → 401` in the Network tab while still sitting on the homepage (NOT redirected to `/login`). Also: make quack user-triggered, remove action buttons + pond, confirm `/me` name in Redux.

### Developer notice — `GET /api/users/me 401` but stays on homepage (logged via Developer request)

**Observed (Developer):** Network tab shows `GET http://localhost:3000/api/users/me → 401 Unauthorized`, yet the homepage stays mounted (no redirect to `/login`). Console also shows a React Grab `v0.1.44` dev-tool banner line (dev-only `react-grab` from `dev-tools.ts`); unrelated to the 401.

**Root cause (confirmed against the running BE on `:3000` via curl, FE `:4200`):**

- `auth.user` is persisted (redux-persist whitelist) → on boot `isAuthenticated` is `true` **immediately**, before any network call. The FE's "logged in" state is the persisted user object, not the httpOnly access cookie.
- `ProtectedRoute` fires `getMe` once (`useLazyGetMeQuery`, `attemptedRef`). The access token (`AUTH_ACCESS_TOKEN_TTL_SECONDS=600`) has expired, so `GET /users/me` returns **401**.
- The axios response interceptor (`setupAxiosInterceptors.ts`) catches that 401 — `/users/me` is **not** in `AUTH_SKIP_401_PATHS` — and fires `POST /auth/refresh`. The refresh token is valid for 24h, so refresh returns **200** and rotates the cookies; the interceptor then **retries** `GET /users/me`, which now returns **200**.
- `axiosBaseQuery` only ever sees the successful retry, so RTK `getMe` resolves **fulfilled** (never `isError`). `ProtectedRoute`'s `if (isError || !isAuthenticated)` branch never runs → `<Outlet/>` (Home) stays. **The 401 is the transient pre-refresh probe and is expected** — followed in the Network tab by `POST /auth/refresh 200` + a second `GET /users/me 200`.

**curl contract verification (live BE):**

| Request                                                    | Status                |
| ---------------------------------------------------------- | --------------------- |
| `GET /api/users/me` (valid access cookie)                  | 200                   |
| `GET /api/users/me` (refresh cookie only → expired access) | 401                   |
| `POST /api/auth/refresh` (valid refresh)                   | 200 + rotates cookies |
| `POST /api/auth/refresh` (garbage / missing refresh)       | 401                   |

**Tie-in to "content disappears, background remains":** same flow, but when the **refresh also fails** (refresh token expired after 24h, cleared cookies, or `POST /auth/refresh 401`), the interceptor's `catch` runs `handleSessionDead()` → `resetApp()` + `authApi.util.resetApiState()` + `persistor.purge()` + **`window.location.assign('/login')`**. The hard reload tears down the React tree → the browser shows only the page's navy base background with no content → looks like a crash → then `/login` loads. A _separate_ failure mode (any render-time throw) also blanked the whole tree because the app had **no error boundary**.

**Fix decision:**

1. **Soft session-death redirect** — drop the hard `window.location.assign('/login')` from `handleSessionDead`. The store resets already flip `isAuthenticated` false and the failed `/me` makes `getMe` `isError`, so `ProtectedRoute` performs an in-app `<Navigate to=LOGIN>` (no reload, no blank). Keeps `resetApp` + `resetApiState` + `purge` for a clean slate.
2. **App-wide `ErrorBoundary`** (`apps/FE/src/components/ErrorBoundary.tsx`, wraps `App` in `main.tsx`) — converts any render-time throw from a silent blank into a visible recoverable fallback + logged `error.message`.
3. **Quack is now user-triggered** (`useLazyQuackQuery` + name input form) instead of auto-firing on mount — removes a background CSRF POST that could 401 after token expiry. Removed the action-buttons `<div>` and the pond ellipse from `Home.tsx`. `/me` name already flows into Redux via `getMe.matchFulfilled` and is persisted.

**Verified** — `pnpm nx lint FE`, `pnpm nx typecheck FE`; BE auth/refresh contract confirmed via curl against the running server. (Browser repro via chrome-devtools MCP unavailable — no Chrome debug port.)

### Chat summary

Context was compacted earlier this chat. Prior work this chat (before this notice): converted quack to user-triggered lazy query, removed Home action buttons + pond ellipse, added root `ErrorBoundary`, and diagnosed the `/me 401`-but-stays behavior as the expected silent-refresh path. All edits in the Desktop checkout (`/mnt/smalek/github/quack-auth/quack-auth`, branch `quack-09-fe-auth-rtk-query`); the `br0z` worktree is this chat's incidental workspace and was not edited.

### Chat summary — 2026-06-09 17:42 (follow-up: refresh 401 + blank screen)

**Local time** — `2026-06-09 17:42` (UTC+3)

**Developer report (still broken after prior soft-redirect fix):** `GET /api/users/me → 401` then `POST /api/auth/refresh → 401`; user not redirected to `/login`. After idle, screen goes blank — inspector shows `html` height `0`, only dark navy background + thin bright blue bar at top (ProgressLoader).

**Root cause:**

1. **No redirect** — Prior fix removed `window.location.assign('/login')` from `handleSessionDead`, expecting `ProtectedRoute` to soft-navigate. That failed because `handleSessionDead` calls `authApi.util.resetApiState()`, which resets `getMe` to `isUninitialized`. `ProtectedRoute` checked `isChecking` (includes `isUninitialized`) **before** `!isAuthenticated`, and `attemptedRef` blocked a second `getMe` trigger. Result: infinite `ProgressLoader` gate, never reaching `<Navigate to=LOGIN>`.
2. **Blank screen / html height 0** — `ProgressLoader` is `position: fixed; height: 4px` with no in-flow content. When it became the only rendered output, the document collapsed to zero height; `body` background (`duck-navy`) + blue progress bar matched the screenshot. Not an ErrorBoundary catch or PersistGate hang.
3. **`axiosBaseQuery` does not swallow errors** — RTK Query receives `{ error }` correctly; the bug was route-guard ordering + `resetApiState`, not error masking.

**Fix applied:**

- `ProtectedRoute` — check `!isAuthenticated` **before** `isChecking`; remove one-shot `attemptedRef`; re-trigger `getMe` when `isAuthenticated`; wrap loading state in `min-h-screen` container.
- `SessionDeathRedirect` + `SESSION_DEAD_EVENT` — axios interceptor dispatches event after `resetApp`/`purge`; `App` listens and `navigate(LOGIN)` as backup.
- `styles.css` — `min-height: 100%` on `html`, `body`, `#root`.
- `main.tsx` — PersistGate loading wrapped in `min-h-screen` for same safety.

**Verified** — `pnpm nx lint FE`, `pnpm nx typecheck FE`, fresh `eslint` + `tsc` on changed files (exit 0).

### Final polish — 2026-06-09 17:50

**Local time** — `2026-06-09 17:50` (UTC+3)

**Developer** — Happy with session-death + mobile nav fixes; requested commit of all pending work, seamless ticker loop, and signup field max bounds.

**Ticker glitch** — Single flex row duplicated items with `translateX(-50%)` could flash on loop reset (subpixel seam + uneven gap at the duplicate boundary). Replaced with two identical `TickerTrack` siblings (`pr-12` matches inter-item `gap-12`) and `translate3d(-50%, 0, 0)` + `will-change-transform` for a seamless infinite marquee.

**Signup max bounds** — `name` already capped at 100 via `PlainTextName` in `name.schema.ts`. Added `MAX_PASSWORD_LENGTH = 128` + `.max()` on `Password` in `password.schema.ts` (consumed by `Signup` in `signup.dto.ts`). Prevents abuse-length payloads before hashing.

**Also in commit** — Responsive Home nav (mobile: initials-only greeting, `[ OUT ]`, tighter padding); `ErrorBoundary`, `SessionDeathRedirect`, `ProtectedRoute` dead-session fix, user-triggered quack form, pond/action-buttons removal, root `min-height` safety.

**Verified** — `pnpm check` before commit.

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

1. Inspect: `git branch -a | grep quack-`
2. Create: `./scripts/next-quack-branch.sh <feature-slug>` or `git checkout -b quack-XX-<feature>`
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

## 2026-06-08 18:30 — Initial scaffolding & shared libs

**Session** — `S001-initial-scaffold`

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

## How to extend this file

After each significant AI-assisted session, append:

- **Session id** (`S###-slug`) — one id per chat; reuse for all entries from the same conversation
- **Cursor surface** — `Editor` or `Agents`
- **Branch** — e.g. `quack-07-auth-login` (optional but recommended for Agents chats)
- **Local start time** (`YYYY-MM-DD HH:MM`)
- **Model** — full product name + version (e.g. Composer 2.5, Claude Opus 4.6)
- **Chat summary** — `No`, or `Yes` + `### Chat summary` block if context was compacted

Template: see **How to extend this file** above; policy in `.cursor/rules/ai-first-engineering.mdc`.

---

## 2026-06-08 — AGENTS.md indexes rules (Developer request)

**Session** — `S007-user-model` (conventions doc refactor)

**Developer asked for**

- **`AGENTS.md` = index only** — pointers to `.cursor/rules/*.mdc`, not duplicated convention text.
- **`.cursor/rules/project-conventions.mdc` = source of truth** for coding/layout conventions; on new convention → update rule first, then one-line pointer in AGENTS.md.
- Complete **skills → rules** migration (`ai-first-engineering`, `ai-first-subagent`, `docusaurus-docs`); log Developer mistake using `/create-skill` instead of `/create-rule`.

**Implemented**

- Rewrote `AGENTS.md` as layout table + rules index + artifacts table.
- Expanded `project-conventions.mdc` with full DTO/Mongoose detail moved from AGENTS.md; added source-of-truth header and update workflow.
- `ai-first-engineering.mdc` step 0: new conventions → project-conventions + AGENTS pointer.
- Empty `.cursor/skills/*/` dirs removed (SKILL.md files already gone; content lives in `.mdc` rules).

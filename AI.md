# AI.md — quack-auth

Engineering log for AI-assisted work on this repo. Goes beyond disclosure: **model**, prompts, fixes, and judgement calls.

## Cursor AI artifacts

| What | Path | When to use |
|---|---|---|
| **Subagent** | `.cursor/agents/ai-first-engineering.md` | **Always** for non-trivial work — `/create-subagent` |
| **Policy skill** | `.cursor/skills/ai-first-engineering/SKILL.md` | Policy + workflow (`/create-skill`) |
| **Delegation skill** | `.cursor/skills/ai-first-subagent/SKILL.md` | Task-tool fallback + "always delegate" rules |

Invoke subagent: `Use the ai-first-engineering subagent to [task]`

### Misunderstanding (skill ≠ subagent)

First `/create-subagent` pass only added `.cursor/skills/ai-first-subagent/` — a **skill**, not a Cursor subagent. Subagents must live in **`.cursor/agents/*.md`**. Fixed by adding `.cursor/agents/ai-first-engineering.md` and documenting the distinction above.

Reference: [docs/setup.md](docs/setup.md) for reproducible setup steps.

---

## Project summary (so far)

Nx monorepo (`pnpm` + Nx 22) with:

| Area | What exists |
|---|---|
| **FE** | React + Vite + Tailwind at `apps/FE` (`pnpm nx serve FE` → :4200) |
| **BE** | NestJS at `apps/BE` (`pnpm nx serve BE` → :3000/api, Swagger at `/docs`) |
| **Shared libs** | `libs/qu-constants` (`@shared/constants`), `libs/dtos` (`@shared/dtos`) |
| **Mongoose** | Root `mongoose/` — `client.ts`, `models/`, `fixtures/`, planned `seed.ts` |
| **Env** | `.env.example` committed; `.env` gitignored; keys in `ENV_KEYS` |
| **Docker** | `docker-compose.yml` — MongoDB 8 (`quack_auth_mongodb`) |

### Completed setup steps

1. Nx monorepo init (FE + BE apps)
2. Path aliases — `@/*` per app; shared libs via `baseUrl: "../.."` (FE must extend `./tsconfig.json` for `jsx`)
3. `qu-constants` + `dtos` libs; Zod + nestjs-zod
4. BE: global pipes/interceptors/filters; greeting endpoint `GET /api?name=…`
5. MongoDB deps + env constants + `mongoose/client.ts`
6. Docker Compose for local MongoDB
7. AI policy skill + subagent + this log

---

## 2026-06-08 18:30 — Initial scaffolding & shared libs

**Model** — not recorded (session predates model logging in AI.md)

**Prompts that worked**

- Generate Nx FE/BE apps with `--no-interactive`, document in `docs/setup.md`
- Add shared `qu-constants` / `dtos` with `@shared/*` path aliases from monorepo root
- Wire nestjs-zod (pipe, interceptor, Swagger `cleanupOpenApiDoc`, `app.dto.ts` wrappers)
- MongoDB: `pnpm add @nestjs/mongoose mongoose`, `mongodb-memory-server`, root `mongoose/` layout

**Output that needed fixing**

- **Jest types** — `@types/jest` in package.json but not installed; resolved via `pnpm install`
- **FE tsconfig** — extending `tsconfig.base.json` directly dropped `jsx: "react-jsx"`; fixed by extending `./tsconfig.json`
- **Path aliases** — `baseUrl: "."` + `../../libs/...` duplicated root paths; unified on `baseUrl: "../.."`
- **Schema naming** — `GreetingQuery` as both const and type broke `createZodDto` inference / `query.name`; user preferred same-name pattern; kept but documented sync needs
- **ZodSerializationException** — default 500 with no `errors` array; customized `http-exception.filter.ts` to match request validation shape (400 + `errors`)
- **Constants layout** — renamed `qu-constants.ts` → `app.constants.ts`; added `env.constants.ts`, `node-env.constants.ts`
- **`mongoose/client.ts`** — relative imports to lib files; switched to `@shared/constants`
- **Skill vs subagent** — `/create-subagent` initially created only `.cursor/skills/ai-first-subagent/`; real subagent belongs in `.cursor/agents/ai-first-engineering.md`

**Decisions different from AI**

- **Response validation errors as 400** — nestjs-zod treats serialization failures as 500 (server bug); we map them to the same body as input validation for consistent API DX during development
- **Same-name Zod schema + type** — user choice over `*Schema` suffix convention
- **Filters directory** — `apps/BE/src/filters/` (`http-exception`, `global-exception`) instead of colocating in `app/`
- **`app.dto.ts` sync warning** in setup — BE needs `createZodDto` wrappers separate from shared Zod schemas in `libs/dtos`
- **Always-use subagent** — non-trivial work should go through `ai-first-engineering` subagent, not inline parent agent

**Verified**

- [x] `pnpm nx build BE` / `pnpm nx build FE`
- [x] `curl "http://localhost:3000/api?name=world"` → `{ name, appName }`
- [x] `tsc -p mongoose/tsconfig.json --noEmit`
- [x] `tsc -p apps/FE/tsconfig.app.json --noEmit`
- [x] `docker compose config`

---

## How to extend this file

After each significant AI-assisted session, append a section with **local start time** (`YYYY-MM-DD HH:MM`) and **Model** (which Cursor model ran the task). Template: `.cursor/skills/ai-first-engineering/SKILL.md`.

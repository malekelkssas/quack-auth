# quack-auth — Technical TODO

Living checklist for security, conventions, and feature work. Source of intent: [`docs/quack-auth-tech-decisions.pdf`](./docs/quack-auth-tech-decisions.pdf) (v1.0).

**Branch for this doc:** `quack-03-tech-decisions-todo` (created via `./scripts/next-quack-branch.sh tech-decisions-todo`).

**Legend:** `[x]` done · `[~]` partial · `[ ]` not done

**Last audited:** 2026-06-09 — `quack-12-dry-run`: `DatabaseModule` (`MongooseModule`), `nestjs-pino` + correlation IDs + Seq compose, OpenAPI auth docs, `withMongoTransaction`, Passport deferred (custom `JwtCookieAuthGuard`), FE error boundary + Tailwind v4 evidence synced; BE API suite count verified on branch.

---

## Repo map vs PDF naming

The PDF uses older names; the repo has evolved:

| PDF               | Repo (current)      | Notes                                    |
| ----------------- | ------------------- | ---------------------------------------- |
| `apps/frontend`   | `apps/FE`           | React + Vite                             |
| `apps/backend`    | `apps/BE`           | NestJS                                   |
| `libs/validation` | `libs/dtos`         | Shared Zod — domain folders (`user/`, …) |
| `libs/types`      | _(none)_            | Types inferred from Zod via `z.infer`    |
| —                 | `libs/qu-constants` | `ENV_KEYS`, app constants                |
| —                 | `mongoose/`         | Mongoose schemas (not an Nx app)         |
| —                 | `apps/DOCS`         | Docusaurus setup docs                    |

---

## 1. Monorepo & conventions

| #    | Item                                                                    | Status | Evidence / notes                                                             |
| ---- | ----------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------- |
| 1.1  | Nx workspace root                                                       | [x]    | `nx.json`, `package.json`                                                    |
| 1.2  | `apps/FE`, `apps/BE`, shared libs                                       | [x]    | Standard layout                                                              |
| 1.3  | Path aliases `@shared/dtos`, `@shared/constants`                        | [x]    | `tsconfig.base.json`                                                         |
| 1.4  | DTO suffix convention (`.model.ts`, `.dto.ts`)                          | [x]    | `.cursor/rules/project-conventions.mdc`, `libs/dtos/src/lib/user/`           |
| 1.5  | Mongoose triple-file layout (`*.schema.ts`, `*.model.ts`, `*.paths.ts`) | [x]    | `mongoose/models/user/`                                                      |
| 1.6  | `UserPaths` — no hard-coded field strings in queries                    | [x]    | `mongoose/models/user/user.paths.ts`                                         |
| 1.7  | Nx module boundaries (real FE/BE/lib tags)                              | [~]    | `@nx/enforce-module-boundaries` enabled; projects use empty `tags: []`       |
| 1.8  | Nx Cloud / affected CI                                                  | [~]    | `nxCloudId` present; CI distribution commented in `.github/workflows/ci.yml` |
| 1.9  | `pnpm check` / Husky / commitlint                                       | [x]    | Pre-commit quality gates                                                     |
| 1.10 | `AI.md` session logging                                                 | [x]    | Root `AI.md`                                                                 |
| 1.11 | Setup docs in `apps/DOCS`                                               | [x]    | `pnpm nx serve DOCS` → :4001                                                 |

### Convention follow-ups

- [ ] Tag Nx projects (`type:app`, `scope:fe`, `scope:be`, `scope:lib`) and tighten `depConstraints`
- [x] Add `login.dto.ts` under `libs/dtos/src/lib/user/` (signup exists; login missing)
- [x] Wrap user/auth Zod schemas with `createZodDto` in BE (`auth/auth.dto.ts`, `users/users.dto.ts`)
- [x] Feature-colocated DTO wrappers (`<feature>/<feature>.dto.ts`) — `users/users.dto.ts`
- [x] `BE_ROUTES` enum for path segments — `libs/qu-constants/src/lib/be-routes.constants.ts`
- [x] BE `*.util.ts` + `utils/libs/<service>/` layout
- [x] `@quack/mongoose/*` path alias (no deep relative mongoose imports)
- [ ] Do **not** add unofficial DTO suffixes (e.g. `.fields.ts`) — keep duplication between `.model.ts` / `.dto.ts` acceptable per conventions

---

## 2. Frontend

| #    | Item                                 | Status | Evidence / notes                                                                                     |
| ---- | ------------------------------------ | ------ | ---------------------------------------------------------------------------------------------------- |
| 2.1  | React + TypeScript                   | [x]    | `apps/FE/src/main.tsx`                                                                               |
| 2.2  | Vite (via Nx)                        | [x]    | `apps/FE/vite.config.mts`                                                                            |
| 2.3  | Tailwind v4                          | [x]    | `@tailwindcss/vite` in `apps/FE/vite.config.mts`; `apps/FE/src/styles.css` — no `tailwind.config.js` |
| 2.4  | Redux Toolkit + RTK Query            | [x]    | `@reduxjs/toolkit@^2.12` bundles RTK Query; `authApi` + `axiosBaseQuery` in FE                       |
| 2.5  | React Router v6                      | [x]    | `react-router-dom`; `/` protected home; `/login`, `/signup`, `/logout`                               |
| 2.6  | Sign Up page + shared Zod validation | [x]    | `pages/auth/Signup` + `useSignup` (RHF + `zodResolver(Signup)` from `@shared/dtos`)                  |
| 2.7  | Sign In page                         | [x]    | `pages/auth/Login` wired to `useLoginMutation` + shared `Login` DTO                                  |
| 2.8  | Protected route / auth guard         | [x]    | `ProtectedRoute` + `GuestRoute`; `lazyGetMe` cookie validation                                       |
| 2.9  | Global error boundary                | [x]    | `apps/FE/src/components/ErrorBoundary.tsx` in `main.tsx`                                             |
| 2.10 | FE imports `@shared/dtos` for forms  | [x]    | `Signup` in `useSignup`; `Login` DTO available for login form                                        |

### Frontend tasks

- [x] Add React Router with `/signup`, `/signin`, `/app` (protected) — `/login` + `/signup` + protected `/` (home) done
- [x] Add RTK Query API slice for auth endpoints (`store/api/authApi.ts`)
- [x] Reuse `SignupSchema` (and future `LoginSchema`) from `@shared/dtos` on the client — `Signup` + `Login` wired into page hooks
- [x] Auth guard HOC or route wrapper redirecting unauthenticated users (`ProtectedRoute`, `GuestRoute`)
- [x] React error boundary at app root (`ErrorBoundary` in `main.tsx`)

---

## 3. Backend

| #    | Item                                 | Status | Evidence / notes                                                            |
| ---- | ------------------------------------ | ------ | --------------------------------------------------------------------------- |
| 3.1  | NestJS app                           | [x]    | `apps/BE/`                                                                  |
| 3.2  | Global Zod validation pipe           | [x]    | `ZodValidationPipe` in `app.module.ts`                                      |
| 3.3  | Global exception filter              | [x]    | `global-exception.filter.ts` (HttpException + Zod + Mongoose + 500)         |
| 3.4  | Swagger at `/docs`                   | [x]    | `apps/BE/src/main.ts` + `cleanupOpenApiDoc`                                 |
| 3.5  | Mongoose user schema                 | [x]    | `mongoose/models/user/user.schema.ts`                                       |
| 3.6  | `MongooseModule` wired in BE         | [x]    | `apps/BE/src/database/database.module.ts`; CLI/seed still use `dbClient()`  |
| 3.7  | `POST /auth/register` (or `/signup`) | [x]    | `POST /api/auth/register` implemented                                       |
| 3.13 | Repository + service layers          | [x]    | `repositories/user.repository.ts`, `services/user.service.ts`               |
| 3.14 | Global Mongoose error mapping        | [x]    | `mongoose-error.handler.util.ts` + `GlobalExceptionFilter`                  |
| 3.8  | `POST /auth/login`                   | [x]    | `POST /api/auth/login`                                                      |
| 3.9  | `GET /auth/me` (protected)           | [x]    | Implemented as `GET /api/users/me` per route decision                       |
| 3.10 | Passport.js + JWT strategy           | [~]    | **Won't adopt** — custom `JwtCookieAuthGuard`; see `security.md`            |
| 3.11 | `@nestjs/throttler` on `/auth/*`     | [x]    | `ThrottlerGuard` on `AuthController`; `AUTH_THROTTLE_*` env — `security.md` |
| 3.12 | class-validator (secondary)          | [ ]    | Intentionally Zod-only via nestjs-zod                                       |

### Backend tasks

- [x] Wire `MongooseModule` via `DatabaseModule` (`resolveMongoConnectionOptions` shared with `dbClient()`)
- [x] Auth module: `register`, `login`, `refresh`, `logout` under `apps/BE/src/auth/`
- [x] Production auth secret fail-fast (`auth-config.util.ts`)
- [x] Refresh token HMAC storage + compare-and-swap rotation (`token-hash.util.ts`, `rotateRefreshTokenHash`)
- [x] **Argon2id** hash on signup + `verifyPassword` on login (`mongoose/utils/password.util.ts`; PDF says bcrypt — repo chose Argon2id per OWASP)
- [ ] **Unified repository layer interface** — shared contract/base for all repositories (Developer request)
- [x] **Atomic transaction setup** — `@MongoTransaction()` decorator + `getMongoTransactionSession()` ALS; repos auto-join active txn (e.g. `AuthService.register`)
- [x] JWT issued into **HttpOnly** access + refresh cookies (10m/24h defaults + rotation)
- [x] Auth guard on `GET /users/me`
- [x] OpenAPI: `@ApiTags('auth'|'users'|'quack')`, cookie + CSRF security schemes (`openapi.config.ts`)
- [x] Align route naming with PDF (`/auth/register` selected) and document in DOCS

---

## 4. Shared validation (Zod)

| #   | Item                                   | Status | Evidence / notes                                                                   |
| --- | -------------------------------------- | ------ | ---------------------------------------------------------------------------------- |
| 4.1 | Shared Zod library                     | [x]    | `libs/dtos/`                                                                       |
| 4.2 | `signup.dto.ts`                        | [x]    | `libs/dtos/src/lib/user/signup.dto.ts`                                             |
| 4.3 | `user.model.ts` (persisted shape)      | [x]    | `libs/dtos/src/lib/user/user.model.ts`                                             |
| 4.4 | `password.schema.ts` (strength rules)  | [x]    | Shared building block                                                              |
| 4.5 | `login.dto.ts`                         | [x]    | `libs/dtos/src/lib/user/login.dto.ts`                                              |
| 4.6 | XSS sanitization in Zod `.transform()` | [x]    | `sanitizePlainText` in `libs/dtos`; `Signup.name` transform; FE via `@shared/dtos` |
| 4.7 | nestjs-zod bridge                      | [x]    | Global pipe + greeting DTOs                                                        |
| 4.8 | Shared `ErrorResponse` DTO             | [x]    | `libs/dtos/src/lib/error/error-response.dto.ts`                                    |

### Validation tasks

- [x] Add `login.dto.ts` (email + password; no plaintext storage fields in model DTO)
- [x] Implement shared sanitize helper used inside Zod transforms (both apps)
- [x] Export sanitize from `libs/dtos/src/index.ts` (`sanitizePlainText`)
- [x] BE: `createZodDto` wrapper for Signup (`users/users.dto.ts`)
- [x] Zod validation errors → `ErrorResponse` (first issue only) in `global-exception.filter.ts`
- [x] BE: `createZodDto` wrappers for Login, User response

---

## 5. Security

| Area        | PDF decision                           | Status | Notes                                                                                                                              |
| ----------- | -------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Passwords   | bcrypt, salt rounds 12 (PDF)           | [~]    | **Argon2id** (OWASP min) on signup; PDF still says bcrypt — reconcile in DOCS                                                      |
| Auth tokens | JWT in HttpOnly cookie                 | [x]    | Access + refresh cookies with rotation                                                                                             |
| CSRF        | Double-submit cookie (`csrf-csrf`)     | [x]    | Protects `POST /api/quack` only (not auth POSTs); `INVALID_CSRF_TOKEN` on 403 — [security doc](apps/DOCS/docs/apps/be/security.md) |
| XSS         | Zod `.transform()` sanitize            | [x]    | `libs/dtos/src/lib/sanitize/`; `Signup.name` — `security.md`                                                                       |
| Rate limit  | `@nestjs/throttler` on `/auth/*`       | [x]    | `AuthController` only; defaults 10 req / 60s — `security.md`                                                                       |
| Headers     | Helmet.js (CSP, HSTS, X-Frame-Options) | [x]    | `helmet.config.ts` via `configure-app.ts`; relaxed CSP in dev/e2e                                                                  |

### Security tasks (ordered)

1. [x] Password hashing on write (`argon2id` signup) + `verifyPassword` on login
2. [x] JWT + HttpOnly cookie + refresh strategy
3. [x] Helmet in `configure-app.ts` (`helmet.config.ts`)
4. [x] ThrottlerModule — per-IP limits on auth routes; env-configurable TTL/limit
5. [x] CSRF middleware for authenticated mutations (`csrf-csrf`, `POST /api/quack`)
6. [x] XSS sanitization at schema level (§4.6)
7. [x] Review cookie flags: `Secure`, `SameSite`, `HttpOnly`
8. [x] Never return password hash in API responses (`AuthUser` + `response-secrets.api-spec.ts`)

---

## 6. Logging & observability

| #   | Item                                          | Status | Evidence / notes                                                |
| --- | --------------------------------------------- | ------ | --------------------------------------------------------------- |
| 6.1 | nestjs-pino structured JSON logs              | [x]    | `LoggerModule` + `pino.config.ts`; `app.useLogger` in `main.ts` |
| 6.2 | Correlation ID middleware (AsyncLocalStorage) | [x]    | `correlation-id.middleware.ts` + `CorrelationIdModule`          |
| 6.3 | pino-pretty for local dev                     | [x]    | Auto in `NODE_ENV=development`; optional pipe documented        |
| 6.4 | Seq in Docker (optional dev UI)               | [x]    | `docker-compose.yml` → host `:5341`                             |
| 6.5 | Request journey sample in PDF                 | [x]    | `apps/DOCS/docs/apps/be/observability.md`                       |

### Logging tasks

- [x] Add `nestjs-pino` + configure JSON output with `level`, `route`, `ms`
- [x] Correlation ID middleware; bind `correlationId` into pino via `customProps`
- [x] Add Seq service to `docker-compose.yml` (container port 80 → host 5341, dev-only)
- [x] Document log workflow in `apps/DOCS` (`observability.md`)

---

## 7. Testing

| #   | Item                                      | Status | Evidence / notes                                                                                    |
| --- | ----------------------------------------- | ------ | --------------------------------------------------------------------------------------------------- |
| 7.1 | Jest (BE) — dependency / config           | [x]    | `jest.config.ts`, `*.api-spec.ts` under `apps/BE/src/test/`                                         |
| 7.2 | BE unit tests (services, guards, pipes)   | [ ]    | API-level only per Developer preference                                                             |
| 7.3 | Supertest e2e (HTTP + Mongo)              | [~]    | Auth + security specs (throttle, sanitize, headers, secrets); **59** tests; expand as features land |
| 7.4 | Vitest (FE) — dependency                  | [~]    | In devDependencies; no `test` block in vite config                                                  |
| 7.5 | FE unit tests (components, hooks)         | [ ]    | —                                                                                                   |
| 7.6 | Cypress e2e (signup → signin → protected) | [ ]    | FE generated with `--e2e-test-runner=none`                                                          |
| 7.7 | `mongodb-memory-server` usage             | [x]    | `global-setup.ts` for BE API tests                                                                  |
| 7.8 | CI test step                              | [x]    | `pnpm ci` includes `pnpm nx test BE`                                                                |

### Testing tasks

- [ ] BE: colocated unit tests (optional — Developer prefers API-level Supertest)
- [x] BE: Supertest auth + security API specs (`throttle`, `sanitize`, `security-headers`, `response-secrets` — **59** tests)
- [ ] FE: Vitest + React Testing Library for forms and guards
- [ ] FE: Cypress flows for full auth journey
- [ ] Uncomment and stabilize CI test jobs

---

## 8. API documentation (Swagger)

| #   | Item                               | Status | Notes                                                               |
| --- | ---------------------------------- | ------ | ------------------------------------------------------------------- |
| 8.1 | Swagger UI at `/docs`              | [x]    | Dev only                                                            |
| 8.2 | Zod → OpenAPI via nestjs-zod       | [x]    | Greeting endpoint only                                              |
| 8.3 | Auth endpoints documented          | [x]    | `@ApiTags` + operations on auth/users/quack controllers             |
| 8.4 | Security schemes (Bearer / cookie) | [x]    | Cookie access JWT + CSRF header in `openapi.config.ts` (not Bearer) |

---

## 9. Docker & dev environment

| #    | Item                                     | Status | Evidence / notes                             |
| ---- | ---------------------------------------- | ------ | -------------------------------------------- |
| 9.1  | `docker-compose.yml`                     | [x]    | Root compose file                            |
| 9.2  | MongoDB (`mongo:8`, volume, healthcheck) | [x]    | Port 27017                                   |
| 9.3  | `.env.example` for Mongo                 | [x]    | Root                                         |
| 9.4  | Seq (datalust/seq)                       | [x]    | `docker-compose.yml` — http://localhost:5341 |
| 9.5  | `Dockerfile` for BE (multi-stage)        | [ ]    | —                                            |
| 9.6  | `Dockerfile` for FE (multi-stage)        | [ ]    | —                                            |
| 9.7  | Non-root `USER` in prod images           | [ ]    | PDF §9                                       |
| 9.8  | `HEALTHCHECK` on `/health`               | [ ]    | Only Mongo has healthcheck today             |
| 9.9  | `.dockerignore`                          | [ ]    | —                                            |
| 9.10 | `.env.docker` (gitignored)               | [ ]    | PDF §9                                       |

### Docker tasks

- [ ] `Dockerfile.backend` — dev (hot reload) + prod (compiled JS, no devDeps)
- [ ] `Dockerfile.frontend` — Vite build + static serve or nginx
- [~] Extend compose: `backend`, `frontend` with `depends_on` — `seq` + `mongodb` done; app images still open
- [ ] `GET /health` on BE for container healthchecks
- [ ] `node:20-alpine` base, multi-stage builds per PDF

---

## 10. Cross-branch / in-flight work

Other local branches (check worktrees before merging):

| Branch                     | Worktree                              | Likely focus                                                               |
| -------------------------- | ------------------------------------- | -------------------------------------------------------------------------- |
| `quack-02-fe-setup`        | `~/.cursor/worktrees/quack-auth/iya6` | FE setup                                                                   |
| `quack-03-signup-endpoint` | `~/.cursor/worktrees/quack-auth/bo10` | Signup API — **PR #5** (unified filter, `ErrorResponse`, signup hardening) |
| `quack-02-user-model`      | —                                     | User model / DTOs (merged)                                                 |

Before implementing items above, **reconcile** with open PRs/branches to avoid duplicate work.

---

## 11. Suggested implementation order

Phases align with dependencies (auth core unlocks FE + security hardening).

### Phase A — Data & auth API

1. Wire Mongoose in BE
2. `login.dto.ts` + Nest DTO wrappers
3. `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
4. bcrypt + JWT HttpOnly cookies + auth guard

### Phase B — Frontend auth UX

5. React Router + signup/signin pages
6. RTK Query + shared Zod on client
7. Protected routes + error boundary

### Phase C — Security hardening

8. Helmet + throttler + CSRF
9. XSS Zod transforms

### Phase D — Observability & ops

10. nestjs-pino + correlation IDs + Seq
11. Dockerfiles + full compose stack

### Phase E — Quality

12. Unit + e2e tests (BE + FE)
13. Enable CI test jobs
14. Nx module boundary tags

---

## References

- Tech decisions PDF: [`docs/quack-auth-tech-decisions.pdf`](./docs/quack-auth-tech-decisions.pdf)
- Project conventions: [`.cursor/rules/project-conventions.mdc`](./.cursor/rules/project-conventions.mdc)
- Setup docs: `apps/DOCS/docs/setup/`
- AI session log: [`AI.md`](./AI.md)

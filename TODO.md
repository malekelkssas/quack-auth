# quack-auth — Technical TODO

Living checklist for security, conventions, and feature work. Source of intent: [`docs/quack-auth-tech-decisions.pdf`](./docs/quack-auth-tech-decisions.pdf) (v1.0).

**Branch for this doc:** `quack-03-tech-decisions-todo` (created via `./scripts/next-quack-branch.sh tech-decisions-todo`).

**Legend:** `[x]` done · `[~]` partial · `[ ]` not done

**Last audited:** 2026-06-09 — `quack-07-login-auth-endpoints` merged with `main` @ `2967592` (cookie JWT auth BE + FE duck auth pages from `quack-06`).

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

| #    | Item                                 | Status | Evidence / notes                                                                       |
| ---- | ------------------------------------ | ------ | -------------------------------------------------------------------------------------- |
| 2.1  | React + TypeScript                   | [x]    | `apps/FE/src/main.tsx`                                                                 |
| 2.2  | Vite (via Nx)                        | [x]    | `apps/FE/vite.config.mts`                                                              |
| 2.3  | Tailwind (scaffold)                  | [x]    | `tailwind.config.js`                                                                   |
| 2.4  | Redux Toolkit + RTK Query            | [ ]    | Not in `package.json`                                                                  |
| 2.5  | React Router v6                      | [x]    | `react-router-dom`; `/login`, `/signup`, `/` → `/signup` (`app/app.tsx`)               |
| 2.6  | Sign Up page + shared Zod validation | [x]    | `pages/auth/Signup` + `useSignup` (RHF + `zodResolver(Signup)` from `@shared/dtos`)    |
| 2.7  | Sign In page                         | [~]    | `pages/auth/Login` UI done; BE `POST /api/auth/login` exists — FE wiring still pending |
| 2.8  | Protected route / auth guard         | [ ]    | —                                                                                      |
| 2.9  | Global error boundary                | [ ]    | —                                                                                      |
| 2.10 | FE imports `@shared/dtos` for forms  | [x]    | `Signup` in `useSignup`; `Login` DTO available for login form                          |

### Frontend tasks

- [~] Add React Router with `/signup`, `/signin`, `/app` (protected) — `/login` + `/signup` done; protected `/app` still missing
- [ ] Add RTK Query API slice for auth endpoints
- [x] Reuse `SignupSchema` (and future `LoginSchema`) from `@shared/dtos` on the client — `Signup` wired into `useSignup`
- [ ] Auth guard HOC or route wrapper redirecting unauthenticated users
- [ ] React error boundary at app root

---

## 3. Backend

| #    | Item                                 | Status | Evidence / notes                                                                 |
| ---- | ------------------------------------ | ------ | -------------------------------------------------------------------------------- |
| 3.1  | NestJS app                           | [x]    | `apps/BE/`                                                                       |
| 3.2  | Global Zod validation pipe           | [x]    | `ZodValidationPipe` in `app.module.ts`                                           |
| 3.3  | Global exception filter              | [x]    | `global-exception.filter.ts` (HttpException + Zod + Mongoose + 500)              |
| 3.4  | Swagger at `/docs`                   | [x]    | `apps/BE/src/main.ts` + `cleanupOpenApiDoc`                                      |
| 3.5  | Mongoose user schema                 | [x]    | `mongoose/models/user/user.schema.ts`                                            |
| 3.6  | `MongooseModule` wired in BE         | [~]    | `dbClient()` in `main.ts`; direct `UserModel` — no `@nestjs/mongoose` module yet |
| 3.7  | `POST /auth/register` (or `/signup`) | [x]    | `POST /api/auth/register` implemented                                            |
| 3.13 | Repository + service layers          | [x]    | `repositories/user.repository.ts`, `services/user.service.ts`                    |
| 3.14 | Global Mongoose error mapping        | [x]    | `mongoose-error.handler.util.ts` + `GlobalExceptionFilter`                       |
| 3.8  | `POST /auth/login`                   | [x]    | `POST /api/auth/login`                                                           |
| 3.9  | `GET /auth/me` (protected)           | [x]    | Implemented as `GET /api/users/me` per route decision                            |
| 3.10 | Passport.js + JWT strategy           | [ ]    | Not in dependencies                                                              |
| 3.11 | `@nestjs/throttler` on `/auth/*`     | [ ]    | —                                                                                |
| 3.12 | class-validator (secondary)          | [ ]    | Intentionally Zod-only via nestjs-zod                                            |

### Backend tasks

- [~] Wire `mongoose/client.ts` in `main.ts` (done); `MongooseModule` in `app.module.ts` still optional
- [x] Auth module: `register`, `login`, `refresh` under `apps/BE/src/auth/`
- [x] **Argon2id** hash on signup + `verifyPassword` on login (`mongoose/utils/password.util.ts`; PDF says bcrypt — repo chose Argon2id per OWASP)
- [ ] **Unified repository layer interface** — shared contract/base for all repositories (Developer request)
- [ ] **Atomic transaction setup** — MongoDB session/transaction wrapper for multi-document repository operations (Developer request)
- [x] JWT issued into **HttpOnly** access + refresh cookies (10m/24h defaults + rotation)
- [x] Auth guard on `GET /users/me`
- [ ] OpenAPI: `@ApiTags('auth')`, `@ApiBearerAuth` or cookie security scheme
- [x] Align route naming with PDF (`/auth/register` selected) and document in DOCS

---

## 4. Shared validation (Zod)

| #   | Item                                   | Status | Evidence / notes                                              |
| --- | -------------------------------------- | ------ | ------------------------------------------------------------- |
| 4.1 | Shared Zod library                     | [x]    | `libs/dtos/`                                                  |
| 4.2 | `signup.dto.ts`                        | [x]    | `libs/dtos/src/lib/user/signup.dto.ts`                        |
| 4.3 | `user.model.ts` (persisted shape)      | [x]    | `libs/dtos/src/lib/user/user.model.ts`                        |
| 4.4 | `password.schema.ts` (strength rules)  | [x]    | Shared building block                                         |
| 4.5 | `login.dto.ts`                         | [x]    | `libs/dtos/src/lib/user/login.dto.ts`                         |
| 4.6 | XSS sanitization in Zod `.transform()` | [ ]    | PDF: strip `<script>`, `<img onerror>`, etc. on FE **and** BE |
| 4.7 | nestjs-zod bridge                      | [x]    | Global pipe + greeting DTOs                                   |
| 4.8 | Shared `ErrorResponse` DTO             | [x]    | `libs/dtos/src/lib/error/error-response.dto.ts`               |

### Validation tasks

- [x] Add `login.dto.ts` (email + password; no plaintext storage fields in model DTO)
- [ ] Implement shared sanitize helper used inside Zod transforms (both apps)
- [ ] Export user schemas from `libs/dtos/src/index.ts` / `user/index.ts` as needed
- [x] BE: `createZodDto` wrapper for Signup (`users/users.dto.ts`)
- [x] Zod validation errors → `ErrorResponse` (first issue only) in `global-exception.filter.ts`
- [x] BE: `createZodDto` wrappers for Login, User response

---

## 5. Security

| Area        | PDF decision                           | Status | Notes                                                                         |
| ----------- | -------------------------------------- | ------ | ----------------------------------------------------------------------------- |
| Passwords   | bcrypt, salt rounds 12 (PDF)           | [~]    | **Argon2id** (OWASP min) on signup; PDF still says bcrypt — reconcile in DOCS |
| Auth tokens | JWT in HttpOnly cookie                 | [x]    | Access + refresh cookies with rotation                                        |
| CSRF        | Double-submit cookie (`csurf`)         | [ ]    | Required once cookie auth exists                                              |
| XSS         | Zod `.transform()` sanitize            | [ ]    | See §4.6                                                                      |
| Rate limit  | `@nestjs/throttler` on `/auth/*`       | [ ]    | —                                                                             |
| Headers     | Helmet.js (CSP, HSTS, X-Frame-Options) | [ ]    | Not in `main.ts`                                                              |

### Security tasks (ordered)

1. [~] Password hashing on write (`argon2id` signup); verify on login path not built
2. [x] JWT + HttpOnly cookie + refresh strategy
3. [ ] Helmet in `apps/BE/src/main.ts`
4. [ ] ThrottlerModule — per-IP limits on auth routes; env-configurable TTL/limit
5. [ ] CSRF middleware for state-changing routes when using cookies
6. [ ] XSS sanitization at schema level (§4.6)
7. [x] Review cookie flags: `Secure`, `SameSite`, `HttpOnly`
8. [ ] Never return password hash in API responses (enforce via `user.model.ts` + serializers)

---

## 6. Logging & observability

| #   | Item                                          | Status | Evidence / notes                                   |
| --- | --------------------------------------------- | ------ | -------------------------------------------------- |
| 6.1 | nestjs-pino structured JSON logs              | [ ]    | BE uses Nest `Logger` in filters only              |
| 6.2 | Correlation ID middleware (AsyncLocalStorage) | [ ]    | PDF: UUID per request, propagated to all log lines |
| 6.3 | pino-pretty for local dev                     | [ ]    | `nx serve BE \| pino-pretty`                       |
| 6.4 | Seq in Docker (optional dev UI)               | [ ]    | Not in `docker-compose.yml`                        |
| 6.5 | Request journey sample in PDF                 | [ ]    | Target format documented in PDF §6                 |

### Logging tasks

- [ ] Add `nestjs-pino` + configure JSON output with `level`, `route`, `ms`
- [ ] Correlation ID middleware; bind `requestId` into pino child logger
- [ ] Add Seq service to `docker-compose.yml` (port 80, dev-only)
- [ ] Document log workflow in `apps/DOCS`

---

## 7. Testing

| #   | Item                                      | Status | Evidence / notes                                   |
| --- | ----------------------------------------- | ------ | -------------------------------------------------- |
| 7.1 | Jest (BE) — dependency / config           | [~]    | `jest.config.ts`; no `*.spec.ts` files             |
| 7.2 | BE unit tests (services, guards, pipes)   | [ ]    | —                                                  |
| 7.3 | Supertest e2e (HTTP + Mongo)              | [ ]    | BE generated with `--e2e-test-runner=none`         |
| 7.4 | Vitest (FE) — dependency                  | [~]    | In devDependencies; no `test` block in vite config |
| 7.5 | FE unit tests (components, hooks)         | [ ]    | —                                                  |
| 7.6 | Cypress e2e (signup → signin → protected) | [ ]    | FE generated with `--e2e-test-runner=none`         |
| 7.7 | `mongodb-memory-server` usage             | [~]    | Dev dependency; unused                             |
| 7.8 | CI test step                              | [~]    | Commented in `.github/workflows/ci.yml`            |

### Testing tasks

- [ ] BE: Jest unit tests for auth service, password hashing, guards
- [ ] BE: Supertest e2e against in-memory or test-container Mongo
- [ ] FE: Vitest + React Testing Library for forms and guards
- [ ] FE: Cypress flows for full auth journey
- [ ] Uncomment and stabilize CI test jobs

---

## 8. API documentation (Swagger)

| #   | Item                               | Status | Notes                  |
| --- | ---------------------------------- | ------ | ---------------------- |
| 8.1 | Swagger UI at `/docs`              | [x]    | Dev only               |
| 8.2 | Zod → OpenAPI via nestjs-zod       | [x]    | Greeting endpoint only |
| 8.3 | Auth endpoints documented          | [ ]    | —                      |
| 8.4 | Security schemes (Bearer / cookie) | [ ]    | —                      |

---

## 9. Docker & dev environment

| #    | Item                                     | Status | Evidence / notes                 |
| ---- | ---------------------------------------- | ------ | -------------------------------- |
| 9.1  | `docker-compose.yml`                     | [x]    | Root compose file                |
| 9.2  | MongoDB (`mongo:8`, volume, healthcheck) | [x]    | Port 27017                       |
| 9.3  | `.env.example` for Mongo                 | [x]    | Root                             |
| 9.4  | Seq (datalust/seq)                       | [ ]    | PDF §6, §9                       |
| 9.5  | `Dockerfile` for BE (multi-stage)        | [ ]    | —                                |
| 9.6  | `Dockerfile` for FE (multi-stage)        | [ ]    | —                                |
| 9.7  | Non-root `USER` in prod images           | [ ]    | PDF §9                           |
| 9.8  | `HEALTHCHECK` on `/health`               | [ ]    | Only Mongo has healthcheck today |
| 9.9  | `.dockerignore`                          | [ ]    | —                                |
| 9.10 | `.env.docker` (gitignored)               | [ ]    | PDF §9                           |

### Docker tasks

- [ ] `Dockerfile.backend` — dev (hot reload) + prod (compiled JS, no devDeps)
- [ ] `Dockerfile.frontend` — Vite build + static serve or nginx
- [ ] Extend compose: `backend`, `frontend`, `seq` with `depends_on`
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

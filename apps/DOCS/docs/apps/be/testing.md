---
sidebar_position: 2
---

# Backend API tests

Jest + Supertest exercises the **real** Nest app — global prefix, pipes, filters, controllers, and Mongoose — against an in-memory MongoDB instance.

```bash
pnpm test:be          # shorthand
pnpm nx test BE       # equivalent
```

`pnpm ci` and GitHub Actions run the same suite after `pnpm check` and builds.

## Directory layout

```
apps/BE/src/test/
├── api/                          # *.api-spec.ts — HTTP integration specs
│   ├── app.api-spec.ts           # smoke / root routes
│   ├── auth/
│   │   ├── register.api-spec.ts  # POST /api/auth/register
│   │   ├── login.api-spec.ts     # POST /api/auth/login
│   │   └── refresh.api-spec.ts   # POST /api/auth/refresh
│   └── users/
│       └── me.api-spec.ts        # GET /api/users/me (cookie JWT guard)
├── helpers/
│   ├── auth.ts                   # loginFixtureUser, registerUser session helpers
│   ├── auth-user.ts              # expectAuthUserShape — safe user payload
│   ├── cookies.ts                # parse Set-Cookie, build Cookie header
│   ├── db.ts                     # resetDb() → loadFixtures({ reset: true })
│   ├── expect-error.ts           # expectApiError() — exact message assertions
│   └── request.ts                # api(), apiPath(), API_PATHS, fullApiPath()
└── setup/
    ├── api-spec-lifecycle.ts     # registerApiTestLifecycle() — one app/connection per file
    ├── create-test-app.ts        # Nest TestingModule + configureApp
    ├── global-setup.ts           # mongodb-memory-server
    └── global-teardown.ts        # disconnect + stop memory server
```

| Artifact                 | Role                                                                             |
| ------------------------ | -------------------------------------------------------------------------------- |
| `jest.config.ts`         | `testMatch: **/*.api-spec.ts`, `globalSetup` / `globalTeardown`, `maxWorkers: 1` |
| `tsconfig.spec.json`     | TypeScript for test sources                                                      |
| `configure-app.ts` (app) | Shared HTTP config for production **and** tests (prefix, CORS, `cookie-parser`)  |

## Naming convention

- File suffix: **`*.api-spec.ts`**
- One spec file per route group or feature area under `test/api/`
- `describe` titles use **`fullApiPath(...)`** so failures show the same path as production (e.g. `POST /api/auth/register`)

## Memory Mongo and fixtures

**`global-setup.ts`** starts `mongodb-memory-server`, sets `NODE_ENV=e2e`, and exports the URI via `E2E_MONGODB_URI`. `mongoose/client.ts` connects to that URI in e2e mode.

Each spec file:

1. **`registerApiTestLifecycle()`** — `beforeAll` → `createTestApp()` once; `afterAll` → close app + disconnect Mongoose.
2. **`resetDb()`** in `beforeEach` only when the test needs seeded users (conflict / success paths) — calls **`loadFixtures({ reset: true })`** from `@quack/mongoose/fixtures`.
3. Validation-only cases skip `resetDb()` — no Argon2 re-seeding for pure 400 paths.

## HTTP helpers and `BE_ROUTES`

`test/helpers/request.ts` wraps Supertest with the global `/api` prefix. Route segments come from **`BE_ROUTES`** — never hard-code paths in specs.

```ts
import { BE_ROUTES } from '@shared/constants';
import { api, API_PATHS, fullApiPath } from '../helpers/request';

describe(`POST ${fullApiPath(BE_ROUTES.AUTH, BE_ROUTES.REGISTER)}`, () => {
  it('creates a user', async () => {
    await api(app)
      .post(API_PATHS.auth.register)
      .send({ email, name, password })
      .expect(201);
  });
});
```

| Helper          | Purpose                                        |
| --------------- | ---------------------------------------------- |
| `api(app)`      | Supertest client scoped to `/api`              |
| `apiPath(...)`  | Join controller segments → `/auth/register`    |
| `API_PATHS`     | Named routes used in `.post()` / `.get()`      |
| `fullApiPath()` | Include `BE_ROUTES.BASE` for `describe` titles |

### Cookie auth helpers

Auth endpoints set HttpOnly access + refresh cookies. Use `helpers/cookies.ts` to parse `Set-Cookie` from a login/register response and pass them to protected routes:

```ts
import { collectAuthCookies, cookieHeader } from '../../helpers/cookies';

const loginRes = await api(app)
  .post(API_PATHS.auth.login)
  .send(credentials)
  .expect(200);
const cookies = collectAuthCookies(loginRes);

await api(app)
  .get(API_PATHS.users.me)
  .set('Cookie', cookieHeader(cookies))
  .expect(200);
```

## Error message assertions

`GlobalExceptionFilter` always returns `{ message: string; code?: string }`. Zod validation exposes **only the first issue** (`fromZodError`).

**Convention:** use Supertest `.expect(status)` **and** assert the exact user-facing string:

```ts
import { expectApiError } from '../../helpers/expect-error';

const response = await api(app)
  .post(API_PATHS.auth.register)
  .send({ name: 'Alice', password: FIXTURE_USER_PASSWORD })
  .expect(400);

expectApiError(response, 'A valid email is required');
```

Use Supertest `.expect(status)` for HTTP status; `expectApiError` asserts only `response.body.message`. Message strings must match the shared Zod schemas in `libs/dtos` (e.g. `signup.dto.ts`, `login.dto.ts`, `password.schema.ts`) or service-layer exceptions (e.g. duplicate email → `Email is already registered`).

When adding a new endpoint test:

1. Trace the flow: DTO → controller → service → repository → Mongoose.
2. Read the Zod schema (or `MongooseErrorHandler`) for the exact `message`.
3. Add a case per distinct error path; prefer `userFixtures` for seeded conflict scenarios.

## Auth test coverage (current)

| Spec                   | Route                     | Cases                                                            |
| ---------------------- | ------------------------- | ---------------------------------------------------------------- |
| `register.api-spec.ts` | `POST /api/auth/register` | 201 + AuthUser shape + cookies, 409 duplicate, validation matrix |
| `login.api-spec.ts`    | `POST /api/auth/login`    | 200 + cookies, 401 wrong password / unknown email, validation    |
| `refresh.api-spec.ts`  | `POST /api/auth/refresh`  | rotation, missing/invalid/reused refresh + cookie clear          |
| `me.api-spec.ts`       | `GET /api/users/me`       | 200 after session, 401 missing/tampered/expired access token     |
| `app.api-spec.ts`      | `GET /api`                | smoke                                                            |

**27** tests total. Refresh rotation specs include a short delay because JWT `iat` is second-granular — identical tokens can be issued within the same second without a `jti` claim.

## CI

`.github/workflows/ci.yml` runs `pnpm ci` (`check` + `build` + `pnpm nx test BE`). See [Husky & quality gates](../../setup/09-husky-quality-gates.md).

## Troubleshooting

**Nx shows an old test count** — Nx may replay a **cached** `BE:test` result. Force a fresh run:

```bash
pnpm nx reset && pnpm nx test BE --skip-nx-cache
```

## Related

- [Backend overview](./overview.md) — dev server, validation, filters, auth endpoints
- [MongoDB](../mongodb.md) — fixtures and `loadFixtures()`
- [nestjs-zod setup](../../setup/06-nestjs-zod.md)

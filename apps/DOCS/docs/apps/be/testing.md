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
│   └── users/
│       └── signup.api-spec.ts    # POST /api/users/signup
├── helpers/
│   ├── db.ts                     # resetDb() → loadFixtures({ reset: true })
│   ├── expect-error.ts           # expectApiError() — exact message assertions
│   └── request.ts                # api(), apiPath(), API_PATHS, fullApiPath()
└── setup/
    ├── configure-app.ts          # test-only configureApp re-export
    ├── create-test-app.ts        # Nest TestingModule + configureApp
    ├── global-setup.ts           # mongodb-memory-server
    └── global-teardown.ts        # disconnect + stop memory server
```

| Artifact                 | Role                                                                                |
| ------------------------ | ----------------------------------------------------------------------------------- |
| `jest.config.ts`         | `testMatch: **/*.api-spec.ts`, `globalSetup` / `globalTeardown`, `maxWorkers: 1`    |
| `tsconfig.spec.json`     | TypeScript for test sources                                                         |
| `configure-app.ts` (app) | Shared HTTP config for production **and** tests (`setGlobalPrefix(BE_ROUTES.BASE)`) |

## Naming convention

- File suffix: **`*.api-spec.ts`**
- One spec file per route group or feature area under `test/api/`
- `describe` titles use **`fullApiPath(...)`** so failures show the same path as production (e.g. `POST /api/users/signup`)

## Memory Mongo and fixtures

**`global-setup.ts`** starts `mongodb-memory-server`, sets `NODE_ENV=e2e`, and exports the URI via `E2E_MONGODB_URI`. `mongoose/client.ts` connects to that URI in e2e mode.

Each test:

1. **`createTestApp()`** — bootstraps `AppModule` with `configureApp` (same as production minus Swagger/listen).
2. **`resetDb()`** — clears collections and calls **`loadFixtures({ reset: true })`** from `@quack/mongoose/fixtures` (Argon2-hashed users, same data as `pnpm db:seed`).
3. **`afterEach`** — closes the Nest app and disconnects Mongoose.

## HTTP helpers and `BE_ROUTES`

`test/helpers/request.ts` wraps Supertest with the global `/api` prefix. Route segments come from **`BE_ROUTES`** — never hard-code `/users/signup` in specs.

```ts
import { BE_ROUTES } from '@shared/constants';
import { api, API_PATHS, fullApiPath } from '../helpers/request';

describe(`POST ${fullApiPath(BE_ROUTES.USERS, BE_ROUTES.SIGNUP)}`, () => {
  it('creates a user', async () => {
    await api(app)
      .post(API_PATHS.users.signup)
      .send({ email, name, password })
      .expect(201);
  });
});
```

| Helper          | Purpose                                        |
| --------------- | ---------------------------------------------- |
| `api(app)`      | Supertest client scoped to `/api`              |
| `apiPath(...)`  | Join controller segments → `/users/signup`     |
| `API_PATHS`     | Named routes used in `.post()` / `.get()`      |
| `fullApiPath()` | Include `BE_ROUTES.BASE` for `describe` titles |

## Error message assertions

`GlobalExceptionFilter` always returns `{ message: string; code?: string }`. Zod validation exposes **only the first issue** (`fromZodError`).

**Convention:** use Supertest `.expect(status)` **and** assert the exact user-facing string:

```ts
import { expectApiError } from '../../helpers/expect-error';

const response = await api(app)
  .post(API_PATHS.users.signup)
  .send({ name: 'Alice', password: FIXTURE_USER_PASSWORD })
  .expect(400);

expectApiError(response, 400, 'A valid email is required');
```

`expectApiError` in `test/helpers/expect-error.ts` checks `response.status` and `response.body.message`. Message strings must match the shared Zod schemas in `libs/dtos` (e.g. `signup.dto.ts`, `password.schema.ts`) or service-layer exceptions (e.g. duplicate email → `Email is already registered`).

When adding a new endpoint test:

1. Trace the flow: DTO → controller → service → repository → Mongoose.
2. Read the Zod schema (or `MongooseErrorHandler`) for the exact `message`.
3. Add a case per distinct error path; prefer `userFixtures` for seeded conflict scenarios.

## CI

`.github/workflows/ci.yml` runs `pnpm ci` (`check` + `build` + `pnpm nx test BE`). See [Husky & quality gates](../../setup/09-husky-quality-gates.md).

## Related

- [Backend overview](./overview.md) — dev server, validation, filters
- [MongoDB](../mongodb.md) — fixtures and `loadFixtures()`
- [nestjs-zod setup](../../setup/06-nestjs-zod.md)

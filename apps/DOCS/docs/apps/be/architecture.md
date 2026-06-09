---
sidebar_position: 2
---

import MermaidChart from '@site/src/components/MermaidChart';

# Backend architecture

How an HTTP request flows through NestJS into MongoDB — and why the repo splits **feature code** (`apps/BE`) from the **shared Mongoose layer** (`mongoose/` at repo root).

## Layer diagram

<MermaidChart chart={`flowchart TB
subgraph httpEdge["HTTP edge"]
Client["Browser or Supertest"]
MW["configure-app.ts"]
end

subgraph nestBe["apps/BE"]
Pipe["ZodValidationPipe"]
Ctrl["Controller"]
Svc["Service"]
Repo["UserRepository"]
DBMod["DatabaseModule"]
end

subgraph mongooseLayer["mongoose/"]
Conn["connection-options + client"]
Model["UserModel + userSchema"]
end

DB[("MongoDB users collection")]

Client --> MW --> Pipe --> Ctrl --> Svc --> Repo
Repo --> Model
DBMod --> Conn
Conn --> DB
Model --> DB`} />

**Read top to bottom:** middleware and global pipes run first; controllers stay thin; services own business rules (JWT, cookies, password verify); repositories are the only BE code that talks to `UserModel`; the Mongoose layer owns schema, hashing hooks, and path constants.

## Request flow (example: register)

| Step | Layer       | File                                  | Responsibility                                                                                      |
| ---- | ----------- | ------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 1    | HTTP config | `config/configure-app.ts`             | Global prefix `/api`, CORS, Helmet, CSRF cookie issuance, JSON body limit                           |
| 2    | Validation  | `ZodValidationPipe` (global)          | `RegisterDto` → shared `Signup` schema from `@shared/dtos` (includes `sanitizePlainText` on `name`) |
| 3    | Controller  | `controllers/auth/auth.controller.ts` | `POST /api/auth/register`, `@UseGuards(ThrottlerGuard)`, `@ZodResponse`                             |
| 4    | Service     | `controllers/auth/auth.service.ts`    | Orchestrate user create, issue JWTs, set HttpOnly cookies, persist refresh HMAC                     |
| 5    | Repository  | `repositories/user.repository.ts`     | `UserModel.create`, `setRefreshTokenHash`; map documents → `AuthUser` (no secrets in JSON)          |
| 6    | Mongoose    | `mongoose/models/user/user.schema.ts` | Schema validation, unique email index, **pre-save Argon2id** on plaintext password                  |
| 7    | Response    | `ZodSerializerInterceptor`            | Serialize `{ user: AuthUser }`; tokens travel in **cookies**, not body                              |

Protected routes add `JwtCookieAuthGuard` (`decorators/jwt-cookie-auth.guard.ts`) before the controller method. Mutations like `POST /api/quack` also require CSRF double-submit — see [Backend security](./security.md).

### `GET /api/users/me` (read path)

```
UsersController → UserService.getMe → UserRepository.findById → UserModel.findById
```

No password or refresh fields are selected; repository `toAuthUser()` strips anything not in the public `AuthUser` shape.

## Source layout vs responsibilities

| Directory                | Role                                                                 | Touches MongoDB?           |
| ------------------------ | -------------------------------------------------------------------- | -------------------------- |
| `controllers/<feature>/` | HTTP routes, feature services, `createZodDto` wrappers, Nest modules | Via repository only        |
| `repositories/`          | Persistence API for the BE (`UserRepository` today)                  | Yes — `UserModel` queries  |
| `database/`              | Nest connection bootstrap (`DatabaseModule`)                         | Connects only              |
| `decorators/`            | `@CurrentUser()`, `JwtCookieAuthGuard`                               | No                         |
| `config/`                | Helmet, CSRF, OpenAPI, body parser                                   | No                         |
| `filters/`               | `GlobalExceptionFilter` + Mongoose error mapping                     | No                         |
| `utils/`                 | Auth secrets, token HMAC, password verify re-exports                 | No direct queries          |
| `mongoose/` (repo root)  | Schemas, models, seed CLI, shared connection helpers                 | Yes — schema + `UserModel` |

Feature modules wire repositories explicitly — e.g. `AuthModule` provides `UserRepository`; `UsersModule` imports `AuthModule` for the guard and reuses the same repository via `UserService`.

## Two ways Mongo connects

The same **`resolveMongoConnectionOptions()`** (`mongoose/connection-options.ts`) picks the URI:

| `NODE_ENV` | URI source                                        |
| ---------- | ------------------------------------------------- |
| `e2e`      | `E2E_MONGODB_URI` (in-memory server in API tests) |
| otherwise  | `MONGODB_URI`                                     |

Optional `MONGODB_DATABASE` sets `dbName` on connect.

### Nest bootstrap — `DatabaseModule`

```ts
// apps/BE/src/database/database.module.ts
MongooseModule.forRootAsync({
  useFactory: async () => {
    const { uri, dbName } = resolveMongoConnectionOptions();
    return { uri, ...(dbName ? { dbName } : {}) };
  },
});
```

Imported once in `AppModule`. There is **no** `MongooseModule.forFeature` — `UserModel` is registered in `@quack/mongoose/models/user` and bound to the **default** connection.

### CLI / test priming — `dbClient()`

```ts
// mongoose/client.ts — used by pnpm db:seed and BE bootstrap
await mongoose.connect(uri, dbName ? { dbName } : undefined);
```

**Why `main.ts` calls `dbClient()` before `NestFactory.create`:** the BE is webpack-bundled (`apps/BE/webpack.config.js`). Bundled imports of `@quack/mongoose/models/user` register `UserModel` at module load time. If nothing has connected yet, Mongoose **buffers** operations and eventually times out (~10s) with `users.insertOne() buffering timed out`. Calling `dbClient()` first ensures a live default connection before any repository runs.

The same pattern exists in API tests (`test/setup/create-test-app.ts`).

| Entry point                     | Connection path                                                           |
| ------------------------------- | ------------------------------------------------------------------------- |
| `pnpm nx serve BE` / production | `await dbClient()` → `DatabaseModule.forRootAsync`                        |
| `pnpm db:seed`                  | `dbClient()` only                                                         |
| `pnpm nx test BE`               | `global-setup` sets `E2E_MONGODB_URI` → `dbClient()` in `createTestApp()` |

Full Docker and env setup: [MongoDB](../mongodb.md).

## Webpack and native modules

`apps/BE/webpack.config.js` marks **`mongoose`** and **`argon2`** as **externals** so the runtime uses one copy from `node_modules` (native bindings for Argon2 must not be double-bundled). Shared DTOs and `@quack/mongoose` compile into the BE bundle via `tsconfig.app.json` path alias `@quack/mongoose/*` → `mongoose/*`.

Implication: treat `@quack/mongoose` as part of the deployed BE artifact, but keep schemas in the repo-root `mongoose/` folder so seed scripts and tests import the same definitions without going through Nest.

## Shared contracts across layers

| Artifact                                    | Location                             | Used by                                         |
| ------------------------------------------- | ------------------------------------ | ----------------------------------------------- |
| `BE_ROUTES`                                 | `libs/qu-constants`                  | Controllers, FE, API tests                      |
| Zod DTOs (`Signup`, `Login`, `AuthUser`, …) | `libs/dtos`                          | FE forms, `ZodValidationPipe`, OpenAPI          |
| `UserPaths`                                 | `mongoose/models/user/user.paths.ts` | Repository queries — **no magic field strings** |
| `IUserDocument`                             | `mongoose/models/user/user.model.ts` | Schema typing                                   |
| `createZodDto` wrappers                     | `controllers/*/*.dto.ts`             | Nest param types only                           |

## Error path back to the client

Repository and Mongoose errors bubble to `GlobalExceptionFilter`:

- Duplicate email (MongoDB `11000`) → **409** `Email is already registered`
- Other Mongoose errors → `mongoose-error.handler.util.ts`
- Zod → first issue only in `{ message, code? }`

See [Backend overview → Exception handling](./overview.md#exception-handling).

## Security touchpoints in this stack

Security is not a separate layer — it is applied at the edges and in services:

| Concern            | Where in the stack                                            |
| ------------------ | ------------------------------------------------------------- |
| Password hashing   | `user.schema.ts` pre-save hook (`argon2id`)                   |
| Login verify       | `AuthService` → `verifyPassword` (re-export of mongoose util) |
| JWT + cookies      | `AuthService` — HttpOnly access/refresh cookies               |
| Refresh rotation   | `AuthService` + `UserRepository.rotateRefreshTokenHash` (CAS) |
| Auth guard         | `JwtCookieAuthGuard` on protected controllers                 |
| CSRF               | `csrf.config.ts` on `POST /api/quack`                         |
| Rate limit         | `ThrottlerGuard` on `AuthController`                          |
| Helmet             | `helmet.config.ts` in `configure-app.ts`                      |
| No secrets in JSON | `UserRepository.toAuthUser` + `@ZodResponse`                  |

Full detail and env tables: [Backend security](./security.md).

## Related

- [Backend overview](./overview.md) — dev server, routes, validation
- [Backend security](./security.md) — cookies, CSRF, throttling, threat model status
- [MongoDB](../mongodb.md) — Docker, seed, domain folder layout
- [Backend API tests](./testing.md) — Supertest lifecycle and `resetDb()`

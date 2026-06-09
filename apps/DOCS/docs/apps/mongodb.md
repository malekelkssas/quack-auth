---
sidebar_position: 3
---

import MermaidChart from '@site/src/components/MermaidChart';

# MongoDB

Local database layer for **quack-auth** — Docker for dev, root `mongoose/` for connection and models, Nest **`DatabaseModule`** for the API runtime.

> MongoDB is a **shared data layer**, not an Nx app. The BE imports `@quack/mongoose/*`; seed scripts and API tests use the same schemas and fixtures.

## Why this layout?

| Choice                             | Rationale                                                                                                                                                            |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`mongoose/` at repo root**       | One schema definition for BE, seed CLI, and Supertest — avoids duplicating models inside `apps/BE`                                                                   |
| **`UserPaths` constants**          | Field renames touch one file; repositories never hard-code `"email"` strings                                                                                         |
| **`DatabaseModule` + `UserModel`** | Nest owns the connection (`forRootAsync`); models stay in `@quack/mongoose` on the **default** connection (no `forFeature` double-registration)                      |
| **`dbClient()` before Nest boot**  | Webpack-bundled BE must connect before `UserModel` runs queries — see [Backend architecture → Two ways Mongo connects](./be/architecture.md#two-ways-mongo-connects) |
| **Pre-save password hook**         | Hashing at the schema layer guarantees CLI seed and API signup share the same Argon2id rules                                                                         |

### Layer placement

<MermaidChart chart={`flowchart LR
subgraph runtime["Runtime entry points"]
BE["apps/BE UserRepository"]
Seed["pnpm db:seed"]
Test["API tests"]
end

subgraph layer["mongoose/"]
CO["connection-options"]
Client["client.ts"]
User["models/user"]
Fix["fixtures"]
end

Mongo[("MongoDB")]

BE --> User
BE --> CO
Seed --> Client --> CO
Test --> Client
CO --> Mongo
User --> Mongo
Fix --> User`} />

**BE request flow** (controller → service → repository → `UserModel`): [Backend architecture](./be/architecture.md).

## Quick start

```bash
docker compose up -d mongodb
cp .env.example .env   # if needed
pnpm db:seed           # load dev user fixtures
```

| Item        | Value                                  |
| ----------- | -------------------------------------- |
| Container   | `quack_auth_mongodb`                   |
| Port        | `27017`                                |
| Default DB  | `quack-auth` (`MONGODB_DATABASE`)      |
| Credentials | `mongo` / `mongo` (see `.env.example`) |

```bash
docker compose ps
docker compose logs mongodb
```

## Layout (`mongoose/`)

Standalone layer at the repo root:

```
mongoose/
├── client.ts              # dbClient() — CLI, main.ts, test bootstrap
├── connection-options.ts  # resolveMongoConnectionOptions() — shared with DatabaseModule
├── seed.ts                # CLI: pnpm db:seed / db:seed:reset
├── register-paths.js      # ts-node path aliases for seed script
├── tsconfig.json
├── utils/
│   └── password.util.ts   # Argon2id hash / verify (used by user schema + BE login)
├── fixtures/              # dev/test fixture data + loaders
└── models/                # domain folders (user/, …)
```

### Seed scripts

| Command              | Behavior                                    |
| -------------------- | ------------------------------------------- |
| `pnpm db:seed`       | Upsert fixture users (skip existing emails) |
| `pnpm db:seed:reset` | Drop all users, then seed                   |

Fixture passwords are Argon2id-hashed via the user schema pre-save hook. Known plaintext values: `FIXTURE_USER_PASSWORD` / `FIXTURE_ADMIN_PASSWORD` in `mongoose/fixtures/user.fixtures.ts`.

### Domain folders (`models/<domain>/`)

Three files per domain — see [Setup → MongoDB → domain layout](../setup/07-mongodb.md#7d--domain-model-layout-mongoosemodelsdomain):

| File          | Purpose                                                 |
| ------------- | ------------------------------------------------------- |
| `*.schema.ts` | Mongoose schema + `model()` registration                |
| `*.model.ts`  | TypeScript interfaces (`IUserDocument`, …)              |
| `*.paths.ts`  | Field path constants (no hard-coded strings in queries) |

Reference implementation: `mongoose/models/user/`.

**User document (persisted fields):**

| Field                     | Notes                                       |
| ------------------------- | ------------------------------------------- |
| `email`                   | Unique, lowercased                          |
| `name`                    | Min length 3                                |
| `password`                | Argon2id hash, `select: false`              |
| `refreshTokenHash`        | HMAC digest of refresh JWT, `select: false` |
| `refreshTokenRotatedAt`   | Rotation audit, `select: false`             |
| `createdAt` / `updatedAt` | Mongoose timestamps                         |

API responses expose only the `AuthUser` subset — never password or refresh fields. See [Backend security → API response shape](./be/security.md#api-response-shape-no-secrets).

### Password hashing (Argon2id)

Implemented in `mongoose/utils/password.util.ts` and triggered from `user.schema.ts`:

```ts
userSchema.pre('save', async function () {
  if (!this.isModified(UserPaths.password)) return;
  if (isArgon2Hash(this[UserPaths.password])) return;
  this[UserPaths.password] = await hashPassword(this[UserPaths.password]);
});
```

OWASP-minimum **Argon2id** options: 19 MiB memory, 2 iterations, parallelism 1. The project PDF mentions bcrypt; the repo deliberately chose Argon2id — tracked as `[~]` in `TODO.md` §5 until the PDF is updated.

## Environment

Use `ENV_KEYS` from `@shared/constants` — never hardcode env var names.

| Key                                       | Purpose                                    |
| ----------------------------------------- | ------------------------------------------ |
| `MONGODB_URI`                             | Dev / default connection string            |
| `E2E_MONGODB_URI`                         | E2E test database (memory server)          |
| `MONGODB_DATABASE`                        | Database name passed to `mongoose.connect` |
| `MONGO_INITDB_ROOT_USERNAME` / `PASSWORD` | Docker init (compose)                      |

Copy `.env.example` → `.env` before connecting locally.

## NestJS connection (`@nestjs/mongoose`)

| Component                                     | Role                                                                              |
| --------------------------------------------- | --------------------------------------------------------------------------------- |
| `apps/BE/src/database/database.module.ts`     | `MongooseModule.forRootAsync` using `resolveMongoConnectionOptions()`             |
| `apps/BE/src/main.ts`                         | `await dbClient()` **before** `NestFactory.create` (webpack / default connection) |
| `apps/BE/src/repositories/user.repository.ts` | Queries via `UserModel` + `UserPaths`                                             |
| `mongoose/client.ts`                          | Direct connect for seed CLI and test `createTestApp()`                            |

There is no `MongooseModule.forFeature` — `UserModel` registers once in `@quack/mongoose/models/user` and attaches to the default connection opened by `DatabaseModule` / `dbClient()`.

**API tests:** `global-setup.ts` starts `MongoMemoryServer`, sets `NODE_ENV=e2e` and `E2E_MONGODB_URI`. Each spec calls `dbClient()` in `createTestApp()` before loading `AppModule`.

## Related packages

- **Runtime:** `mongoose`, `@nestjs/mongoose` (BE `DatabaseModule`)
- **Hashing:** `argon2` (external in BE webpack bundle)
- **Tests:** `mongodb-memory-server` (devDependency)

## Related docs

- [Backend architecture](./be/architecture.md) — full HTTP → repository → `UserModel` flow
- [Backend security](./be/security.md) — refresh HMAC, cookies, CSRF
- [Backend API tests](./be/testing.md) — `resetDb()`, fixtures
- [Setup → MongoDB](../setup/07-mongodb.md) — install and Docker Compose

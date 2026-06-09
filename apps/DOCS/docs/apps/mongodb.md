---
sidebar_position: 3
---

# MongoDB

Local database layer for **quack-auth** — Docker for dev, root `mongoose/` for connection and models, shared env keys via `@shared/constants`.

> Initially the Apps section only listed FE and BE; MongoDB was documented under Setup but missing as its own app entity. Added here so data layer sits alongside the other runtime apps.

## Quick start

```bash
docker compose up -d mongodb seq   # seq = optional log UI (dev)
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

Not an Nx app — standalone layer at the repo root:

```
mongoose/
├── client.ts           # connects via ENV_KEYS; E2E URI when NODE_ENV=e2e
├── seed.ts             # CLI: pnpm db:seed / db:seed:reset
├── register-paths.js   # ts-node path aliases for seed script
├── tsconfig.json
├── fixtures/           # dev/test fixture data + loaders
└── models/             # domain folders (user/, …)
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
| `*.model.ts`  | Repository interfaces                                   |
| `*.paths.ts`  | Field path constants (no hard-coded strings in queries) |

Reference implementation: `mongoose/models/user/`.

Connection helper:

```ts
import { ENV_KEYS, NODE_ENV } from '@shared/constants';

// E2E → E2E_MONGODB_URI, otherwise MONGODB_URI
```

## Environment

Use `ENV_KEYS` from `@shared/constants` — never hardcode env var names.

| Key                                       | Purpose                                    |
| ----------------------------------------- | ------------------------------------------ |
| `MONGODB_URI`                             | Dev / default connection string            |
| `E2E_MONGODB_URI`                         | E2E test database                          |
| `MONGODB_DATABASE`                        | Database name passed to `mongoose.connect` |
| `MONGO_INITDB_ROOT_USERNAME` / `PASSWORD` | Docker init (compose)                      |

Copy `.env.example` → `.env` before connecting locally.

## NestJS connection (`@nestjs/mongoose`)

The BE wires Mongo via `apps/BE/src/database/database.module.ts`:

- `MongooseModule.forRootAsync` — same URI resolution as `mongoose/client.ts` (`resolveMongoConnectionOptions()` in `mongoose/connection-options.ts`)
- CLI scripts (`pnpm db:seed`) still call `dbClient()` directly
- Repositories import `UserModel` from `@quack/mongoose/models/user` (shared schema registration on the default connection)

## Related packages

- **Runtime:** `mongoose`, `@nestjs/mongoose` (BE `DatabaseModule`)
- **Tests:** `mongodb-memory-server` (devDependency)

## Setup reference

Full install and Docker Compose steps: [Setup → MongoDB](../setup/07-mongodb.md).

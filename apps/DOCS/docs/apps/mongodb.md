---
sidebar_position: 3
---

# MongoDB

Local database layer for **quack-auth** — Docker for dev, root `mongoose/` for connection and models, shared env keys via `@shared/constants`.

> Initially the Apps section only listed FE and BE; MongoDB was documented under Setup but missing as its own app entity. Added here so data layer sits alongside the other runtime apps.

## Quick start

```bash
docker compose up -d mongodb
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
├── client.ts       # connects via ENV_KEYS; E2E URI when NODE_ENV=e2e
├── seed.ts         # planned
├── tsconfig.json
├── fixtures/
└── models/         # Mongoose schemas
```

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

## Related packages

- **Runtime:** `mongoose`, `@nestjs/mongoose` (BE integration — follow-up)
- **Tests:** `mongodb-memory-server` (devDependency)

## Setup reference

Full install and Docker Compose steps: [Setup → MongoDB](../setup/07-mongodb.md).

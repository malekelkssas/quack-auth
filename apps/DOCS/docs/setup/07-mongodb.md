---
sidebar_position: 7
---

# MongoDB (Mongoose)

### 7a — Dependencies

```bash
pnpm add @nestjs/mongoose mongoose
pnpm add -D mongodb-memory-server
pnpm approve-builds
```

- `@nestjs/mongoose` + `mongoose` — runtime MongoDB integration (BE)
- `mongodb-memory-server` — in-memory MongoDB for tests (devDependency)

### 7b — Environment variables

Add `.env.example` at the repo root (committed). Copy to `.env` locally (gitignored):

```bash
cp .env.example .env
```

`.gitignore` should include `.env` and `.env.*`, with `!.env.example` so the template stays tracked.

```env
# MongoDB (Docker: docker compose up -d mongodb)
MONGO_INITDB_ROOT_USERNAME=mongo
MONGO_INITDB_ROOT_PASSWORD=mongo
MONGODB_URI=mongodb://mongo:mongo@localhost:27017/quack-auth?authSource=admin
E2E_MONGODB_URI=mongodb://mongo:mongo@localhost:27017/quack-auth-e2e?authSource=admin
MONGODB_DATABASE=quack-auth

# Node Environment
NODE_ENV=development
VITE_NODE_ENV=development
```

Use `ENV_KEYS` from `@shared/constants` when reading these in code — keeps key names in one place for FE, BE, and scripts.

### 7c — `mongoose/` directory (repo root)

Standalone Mongoose layer at the monorepo root (not an Nx app):

```
mongoose/
├── client.ts       # connection helper (picks URI by NODE_ENV)
├── seed.ts         # planned — database seeding
├── tsconfig.json   # extends tsconfig.base.json, resolves @shared/constants
├── fixtures/       # test/dev fixture data
└── models/         # Mongoose model definitions
```

`mongoose/client.ts` connects using `ENV_KEYS` and switches to `E2E_MONGODB_URI` when `NODE_ENV` is `e2e`:

```ts
import { ENV_KEYS, NODE_ENV } from '@shared/constants';

if (process.env[ENV_KEYS.NODE_ENV] === NODE_ENV.E2E) {
  mongoUri = process.env[ENV_KEYS.E2E_MONGODB_URI];
} else {
  mongoUri = process.env[ENV_KEYS.MONGODB_URI];
}
```

### 7d — Docker Compose (local MongoDB)

`docker-compose.yml` at the repo root runs MongoDB 8 for local development:

```bash
docker compose up -d mongodb
```

```yaml
services:
  mongodb:
    image: mongo:8
    container_name: quack_auth_mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_INITDB_ROOT_USERNAME:-mongo}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_INITDB_ROOT_PASSWORD:-mongo}
    ports:
      - '27017:27017'
    volumes:
      - quack_auth_mongodb_data:/data/db
    healthcheck:
      test: ['CMD', 'mongosh', '--eval', "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s

volumes:
  quack_auth_mongodb_data:
```

Copy `.env.example` to `.env` so `MONGODB_URI` includes the same credentials (`mongo:mongo@…?authSource=admin`). Data persists in the `quack_auth_mongodb_data` volume.

```bash
docker compose ps          # check health
docker compose logs mongodb
docker compose down        # stop
docker compose down -v     # stop and wipe data
```

NestJS `@nestjs/mongoose` module wiring in the BE app is a follow-up step.

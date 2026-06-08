---
sidebar_position: 0
slug: /
---

# Quack Auth

Nx monorepo for **quack-auth** — React frontend, NestJS backend, shared Zod DTOs and constants, MongoDB via Mongoose.

## Quick start

| App                | Command                        | URL                        |
| ------------------ | ------------------------------ | -------------------------- |
| Frontend           | `pnpm nx serve FE`             | http://localhost:4200      |
| Backend            | `pnpm nx serve BE`             | http://localhost:3000/api  |
| API docs (Swagger) | —                              | http://localhost:3000/docs |
| **This site**      | `pnpm nx serve DOCS`           | http://localhost:4001      |
| MongoDB (Docker)   | `docker compose up -d mongodb` | `localhost:27017`          |

## Quality gates (Husky)

Every commit runs **lint-staged** (Prettier + ESLint fix on staged files), then **`pnpm check`** (full lint, typecheck, format check).

```bash
pnpm check    # run the same suite manually
```

Details: [Setup → Husky & quality gates](./setup/09-husky-quality-gates.md).

## Documentation map

- **Setup** — step-by-step project initialization (migrated from the original `docs/setup.md`)
- **Apps** — FE, BE, and MongoDB runtime notes
- **AI** — AI-first engineering policy and how we maintain docs

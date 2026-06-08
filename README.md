# quack-auth

A full-stack authentication module — sign up, sign in, and quack your way in. Built with **React**, **NestJS**, **MongoDB**, and **Zod** in an **Nx** monorepo.

## What’s in the repo

| Area        | Path                              | Notes                                           |
| ----------- | --------------------------------- | ----------------------------------------------- |
| Frontend    | `apps/FE`                         | React + Vite + Tailwind                         |
| Backend     | `apps/BE`                         | NestJS, Swagger at `/docs`, Zod validation      |
| Docs site   | `apps/DOCS`                       | Docusaurus — setup guides, app notes, AI policy |
| Shared libs | `libs/dtos`, `libs/qu-constants`  | `@shared/dtos`, `@shared/constants`             |
| MongoDB     | `mongoose/`, `docker-compose.yml` | Mongoose client, models, local Docker DB        |

For architecture details, setup walkthroughs, path aliases, nestjs-zod wiring, and AI workflow — see the **documentation site** (below).

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **pnpm** 11.5.2 (`packageManager` is pinned in `package.json`)
- **Docker** (optional, for local MongoDB via `docker compose`)

## Getting started

```bash
# Install dependencies
pnpm install

# Copy environment template and adjust if needed
cp .env.example .env
```

Start MongoDB (optional for early BE work):

```bash
docker compose up -d mongodb
```

Run apps:

```bash
pnpm nx serve FE      # http://localhost:4200
pnpm nx serve BE      # http://localhost:3000/api  (Swagger: /docs)
pnpm nx serve DOCS    # http://localhost:4001
```

## Documentation

**Full docs live in the Docusaurus app** — not in this README.

```bash
pnpm nx serve DOCS
```

Then open http://localhost:4001 for setup steps, per-app guides (FE, BE, MongoDB), and AI-first engineering policy.

## Quality checks

Pre-commit hooks (Husky) auto-fix staged files with **Prettier** and **ESLint**, then run the full check suite:

```bash
pnpm check          # lint + typecheck + format:check
pnpm lint           # ESLint (all Nx projects)
pnpm lint:fix       # ESLint with --fix
pnpm typecheck      # tsc --noEmit (apps, libs, mongoose/)
pnpm format         # Prettier write
pnpm format:check   # Prettier check
```

CI is planned next so multiple agents can work on separate branches with automated gates.

## AI-assisted development

This repo uses an AI-first workflow. See `AI.md` for session log and `.cursor/agents/` for subagents. Policy and doc conventions are in the DOCS app under **AI**.

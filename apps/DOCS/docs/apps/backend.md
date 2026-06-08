---
sidebar_position: 2
---

# Backend (BE)

NestJS at `apps/BE`.

## Dev server

```bash
pnpm nx serve BE
```

- API: http://localhost:3000/api
- Swagger: http://localhost:3000/docs

## Validation

- [nestjs-zod](https://github.com/BenLorantfy/nestjs-zod) — global pipe, interceptor, filters
- Shared Zod schemas in `libs/dtos`; Nest wrappers in `apps/BE/src/app/app.dto.ts` — see [nestjs-zod setup → sync warning](../setup/06-nestjs-zod.md) and [filelinks](https://github.com/Vilancer/filelinks) (trigger/affects links; optional `--run-agents` to spawn Cursor to fix companions; not on npm yet)

## Path aliases

- `@/*` → `apps/BE/src/*`
- `@shared/dtos`, `@shared/constants` → shared libs

## Filters

`apps/BE/src/filters/global-exception.filter.ts` — `HttpException`, Zod, Mongoose, and 500 handling in one filter

## Routes

API path segments live in `libs/qu-constants/src/lib/be-routes.constants.ts` as the `BE_ROUTES` enum, exported via `@shared/constants`.

- **No magic route strings** in controllers or `main.ts` — use `BE_ROUTES` in `@Controller`, HTTP method decorators, and `setGlobalPrefix(BE_ROUTES.BASE)`.
- FE services import the same enum for client URLs (see [Frontend → HTTP client](./FE/02-http-client.md)).

| Constant           | Value    | Usage                    |
| ------------------ | -------- | ------------------------ |
| `BE_ROUTES.BASE`   | `api`    | Global prefix            |
| `BE_ROUTES.USERS`  | `users`  | Users controller segment |
| `BE_ROUTES.SIGNUP` | `signup` | `POST /api/users/signup` |

## Database

MongoDB is a separate app entity — see [MongoDB](./mongodb.md). NestJS `@nestjs/mongoose` module wiring is a follow-up step.

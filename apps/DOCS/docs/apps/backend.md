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
- Shared Zod schemas in `libs/dtos`; Nest wrappers live in feature DTO files (for example `apps/BE/src/auth/auth.dto.ts`, `apps/BE/src/users/users.dto.ts`) — see [nestjs-zod setup → sync warning](../setup/06-nestjs-zod.md) and [filelinks](https://github.com/Vilancer/filelinks) (trigger/affects links; optional `--run-agents` to spawn Cursor to fix companions; not on npm yet)

## Path aliases

- `@/*` → `apps/BE/src/*`
- `@shared/dtos`, `@shared/constants` → shared libs

## Filters

`apps/BE/src/filters/global-exception.filter.ts` — `HttpException`, Zod, Mongoose, and 500 handling in one filter

## Auth endpoints (cookie JWT)

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/users/me` (protected; returns `401` when unauthorized)

Tokens are transported via HttpOnly cookies for both access and refresh tokens. Default TTLs are:

- Access token: 10 minutes
- Refresh token: 24 hours

Refresh uses token rotation; invalid or expired refresh tokens return `401` and clear auth cookies.

## Database

MongoDB is a separate app entity — see [MongoDB](./mongodb.md). NestJS `@nestjs/mongoose` module wiring is a follow-up step.

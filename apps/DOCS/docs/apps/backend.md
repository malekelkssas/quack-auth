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

`apps/BE/src/filters/` — `http-exception.filter.ts`, `global-exception.filter.ts`

## Database

MongoDB is a separate app entity — see [MongoDB](./mongodb.md). NestJS `@nestjs/mongoose` module wiring is a follow-up step.

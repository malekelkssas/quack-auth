---
sidebar_position: 1
slug: /apps/backend
---

# Backend overview

NestJS app at `apps/BE`.

## Dev server

```bash
pnpm nx serve BE
```

| Surface    | URL                        |
| ---------- | -------------------------- |
| API        | http://localhost:3000/api  |
| Swagger UI | http://localhost:3000/docs |

Scaffold and first-time setup: [Setup → Backend app](../../setup/03-backend.md).

## Path aliases

| Alias               | Resolves to                            |
| ------------------- | -------------------------------------- |
| `@/*`               | `apps/BE/src/*`                        |
| `@shared/dtos`      | `libs/dtos`                            |
| `@shared/constants` | `libs/qu-constants` (e.g. `BE_ROUTES`) |
| `@quack/mongoose/*` | repo-root `mongoose/`                  |

Details: [Path aliases](../../setup/04-path-aliases.md).

## Routes

API path segments live in `libs/qu-constants/src/lib/be-routes.constants.ts` as `BE_ROUTES`. Controllers, `main.ts`, and API tests must use these constants — no magic route strings.

```ts
import { BE_ROUTES } from '@shared/constants';

@Controller(BE_ROUTES.AUTH)
export class AuthController {
  @Post(BE_ROUTES.REGISTER)
  register() {
    /* … */
  }
}
```

## Auth endpoints (cookie JWT)

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/users/me` (protected; returns `401` when unauthorized)

Tokens are transported via HttpOnly cookies for both access and refresh tokens. Default TTLs:

- Access token: 10 minutes
- Refresh token: 24 hours

Refresh uses token rotation; invalid or expired refresh tokens return `401` and clear auth cookies.

## Validation

- [nestjs-zod](https://github.com/BenLorantfy/nestjs-zod) — global `ZodValidationPipe`, `ZodSerializerInterceptor`, and filters
- Shared Zod schemas in `libs/dtos`; Nest `createZodDto` wrappers colocated with controllers (e.g. `users/users.dto.ts`)
- Setup walkthrough: [nestjs-zod on the backend](../../setup/06-nestjs-zod.md)

## Exception handling

`apps/BE/src/filters/global-exception.filter.ts` maps errors to a consistent JSON body:

```json
{ "message": "Human-readable text", "code": "optional_zod_code" }
```

| Source               | Handler                                             |
| -------------------- | --------------------------------------------------- |
| Nest `HttpException` | `error-response.util.ts` → `fromHttpException`      |
| Zod (nestjs-zod)     | `fromZodError` — **first issue only**               |
| Mongoose / MongoDB   | `mongoose-error.handler.util.ts`                    |
| Unknown              | `500` with `{ "message": "Internal server error" }` |

Duplicate email on signup resolves to **409** with message `Email is already registered` (MongoDB error code 11000).

## Database

MongoDB is documented as its own app — see [MongoDB](../mongodb.md). `@nestjs/mongoose` module wiring in Nest is a follow-up step; persistence uses the shared `mongoose/` layer.

## API tests

Full test layout, memory Mongo, fixtures, and error-message conventions: [Backend → Testing](./testing.md).

```bash
pnpm test:be    # or: pnpm nx test BE
```

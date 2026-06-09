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

## Source layout

| Directory                                               | Purpose                                                               |
| ------------------------------------------------------- | --------------------------------------------------------------------- |
| `app/`                                                  | Bootstrap module only (`app.module.ts`)                               |
| `config/`                                               | HTTP/OpenAPI config (`configure-app.ts`, Helmet, CSRF, Swagger)       |
| `controllers/<feature>/`                                | Feature controllers, services, DTO wrappers, modules                  |
| `decorators/`                                           | Shared decorators and guards (`@CurrentUser()`, `JwtCookieAuthGuard`) |
| `database/`, `filters/`, `middleware/`, `repositories/` | Cross-cutting infra                                                   |

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
- `POST /api/auth/logout`
- `GET /api/users/me` (protected; returns `401` when unauthorized)
- `POST /api/quack` (protected; optional `{ name?: string }` — returns `{ quack: "<name> quack" }`; falls back to stored user name when `name` omitted)

Tokens are transported via HttpOnly cookies for both access and refresh tokens. Default TTLs:

- Access token: 10 minutes
- Refresh token: 24 hours

Refresh uses token rotation with compare-and-swap hash updates; invalid or expired refresh tokens return `401` and clear auth cookies. Logout revokes the stored refresh hash and clears cookies (204).

`POST /api/quack` requires JWT cookies **and** CSRF double-submit (`x-csrf-token` header + `qa_csrf_token` cookie). Auth POSTs do **not** require CSRF. Full detail: [Backend security](./security.md).

## Security

Cookie flags, JWT claims, HMAC refresh storage, production secret fail-fast, CSRF, logout semantics, and the access-token TTL limitation after logout: [Backend security](./security.md).

## Validation

- [nestjs-zod](https://github.com/BenLorantfy/nestjs-zod) — global `ZodValidationPipe`, `ZodSerializerInterceptor`, and filters
- Shared Zod schemas in `libs/dtos`; Nest `createZodDto` wrappers colocated with controllers (e.g. `controllers/users/users.dto.ts`)
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

MongoDB is documented as its own app — see [MongoDB](../mongodb.md). Nest connects via **`DatabaseModule`** (`MongooseModule.forRootAsync` in `apps/BE/src/database/database.module.ts`); repositories continue to use `UserModel` from `@quack/mongoose/models/user`.

## Logging

The BE uses NestJS built-in `Logger` (`@nestjs/common`) — bootstrap messages in `main.ts`; `GlobalExceptionFilter` logs unexpected errors with stack traces.

## OpenAPI (Swagger)

Auth, users, and quack routes are tagged in Swagger (`/docs`). Security schemes document the **access JWT cookie** and **CSRF header** for protected mutations — not Bearer tokens. See `apps/BE/src/config/openapi.config.ts`.

## API tests

Full test layout, memory Mongo, fixtures, and error-message conventions: [Backend → Testing](./testing.md).

```bash
pnpm test:be    # or: pnpm nx test BE
```

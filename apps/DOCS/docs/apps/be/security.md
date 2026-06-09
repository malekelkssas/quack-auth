---
sidebar_position: 3
---

# Backend security (auth)

Cookie-based JWT auth, refresh rotation, CSRF, and production secret requirements. Implementation lives under `apps/BE/src/controllers/auth/` and `apps/BE/src/config/csrf.config.ts`.

## Cookie auth

Access and refresh tokens are **HttpOnly** cookies — JavaScript cannot read them.

| Cookie (default name) | Purpose         | Default TTL | Env override                             |
| --------------------- | --------------- | ----------- | ---------------------------------------- |
| `qa_access_token`     | Short-lived JWT | 10 minutes  | `AUTH_ACCESS_TOKEN_TTL_SECONDS` (600)    |
| `qa_refresh_token`    | Rotation JWT    | 24 hours    | `AUTH_REFRESH_TOKEN_TTL_SECONDS` (86400) |

Cookie names are overridable via `AUTH_ACCESS_COOKIE_NAME` and `AUTH_REFRESH_COOKIE_NAME`.

Shared cookie flags (`AuthService`):

- **`httpOnly: true`** — both auth cookies
- **`sameSite`** — from `AUTH_COOKIE_SAME_SITE` (`lax` default; `strict` / `none` supported)
- **`secure: true`** when `NODE_ENV=production`
- **`path: '/'`**

The FE axios client uses `withCredentials: true` so the browser sends cookies on cross-origin API calls when CORS allows credentials.

## JWT claims

Each access and refresh token is a signed JWT with:

| Claim   | Meaning                                    |
| ------- | ------------------------------------------ |
| `sub`   | User `_id` (MongoDB ObjectId string)       |
| `email` | User email (convenience; guard uses `sub`) |
| `jti`   | Unique id per issuance (`randomUUID()`)    |

**Rotation on refresh:** `POST /api/auth/refresh` verifies the refresh JWT and stored hash, issues new access + refresh tokens (new `jti` values), and updates the DB hash via compare-and-swap (see below). Invalid, expired, or reused refresh tokens return **401** and clear auth cookies.

Signing secrets: `AUTH_ACCESS_TOKEN_SECRET` and `AUTH_REFRESH_TOKEN_SECRET` (separate keys).

## Refresh storage (HMAC + CAS)

Refresh tokens are high-entropy JWTs; the DB stores an **HMAC-SHA256** digest — not Argon2 (Argon2id remains for user passwords only).

- **Hash:** `apps/BE/src/utils/token-hash.util.ts` — `hashRefreshToken(token, AUTH_REFRESH_TOKEN_SECRET)`
- **Verify:** `timingSafeEqual` on hex digests
- **Persist:** `User.refreshTokenHash` (+ `refreshTokenRotatedAt` on rotation)

**Compare-and-swap rotation** (`UserRepository.rotateRefreshTokenHash`):

```ts
updateOne(
  { _id: userId, refreshTokenHash: expectedHash },
  { $set: { refreshTokenHash: newHash, refreshTokenRotatedAt: new Date() } },
);
```

Returns success only when `modifiedCount === 1`. Concurrent refresh with the same token: one request wins, the loser gets **401** and cookies cleared (reuse / race protection).

**Deploy note:** If refresh hashes were previously Argon2-based, existing sessions fail refresh once — users re-login; test DBs use `resetDb()` / fixtures.

## Production secrets (fail-fast)

`apps/BE/src/utils/auth-config.util.ts` — `resolveAuthSecret()`:

- **Development / e2e:** missing secrets fall back to `dev-*-secret` placeholders.
- **Production (`NODE_ENV=production`):** startup throws if a secret is missing, empty, or matches weak placeholders (`change-me-*`, `dev-*-secret`).

Applies to:

- `AUTH_ACCESS_TOKEN_SECRET`
- `AUTH_REFRESH_TOKEN_SECRET`
- `AUTH_CSRF_SECRET` (CSRF middleware)

Set strong, unique values in production `.env` — see root `.env.example`.

## CSRF (double-submit)

Package: [`csrf-csrf`](https://www.npmjs.com/package/csrf-csrf) (not deprecated `csurf`).

Wiring: `apps/BE/src/config/csrf.config.ts`, registered from `config/configure-app.ts` after `cookie-parser`.

| Artifact | Value (default)    | Notes                                       |
| -------- | ------------------ | ------------------------------------------- |
| Cookie   | `qa_csrf_token`    | **Not** HttpOnly — FE reads it for header   |
| Header   | `x-csrf-token`     | `CSRF_CONSTANTS.HEADER_NAME`                |
| Secret   | `AUTH_CSRF_SECRET` | Same fail-fast rules as JWT secrets in prod |

**Protected routes** (authenticated mutations only):

- `POST /api/quack` — JWT cookie + double-submit CSRF

**Exempt:** Auth POSTs (`register`, `login`, `refresh`, `logout`) — no real authenticated state change yet in those flows; CSRF belongs on logged-in mutations. Also exempt: `GET` / `HEAD` / `OPTIONS` (including `GET /api/users/me`, Swagger, smoke routes). Safe methods still **issue** a CSRF cookie on each request so the FE can read the token before the first `POST /api/quack`.

Invalid or missing CSRF token → **403** `{ "message": "invalid csrf token", "code": "INVALID_CSRF_TOKEN" }`.

**Learning-app note:** Cookie auth without CSRF on auth POSTs is acceptable here but differs from typical production setups where login/register are also protected. CSRF now guards the first real state-changing **authenticated** action (`POST /api/quack`).

**Frontend:** `apps/FE/src/api/axiosConfig.ts` request interceptor reads the CSRF cookie (`VITE_CSRF_COOKIE_NAME`, default `qa_csrf_token`) and sets `x-csrf-token` on `POST` / `PUT` / `PATCH` / `DELETE`.

## Logout

`POST /api/auth/logout` — **204 No Content**, idempotent.

1. If a valid access cookie is present → extract `sub`, **`clearRefreshTokenHash`** in MongoDB.
2. Always **`clearAuthCookies`** (access + refresh), even when tokens are missing or invalid.

After logout, refresh with old cookies fails with **401** (`Invalid refresh token`).

**Known limitation:** There is no access-token revocation list. A stolen access JWT remains valid until its TTL expires (~10 minutes by default) even after logout. Refresh revocation limits long-lived session extension.

## HTTP security headers (Helmet)

Package: [`helmet`](https://www.npmjs.com/package/helmet). Wiring: `apps/BE/src/config/helmet.config.ts`, registered from `config/configure-app.ts` before CSRF.

| Environment                            | Behavior                                                                                                                                                                                                                          |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Development / e2e**                  | Helmet enabled with **`contentSecurityPolicy: false`** so Swagger (`/docs`) and local tooling are not blocked by CSP. Default Helmet headers still apply (e.g. `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`). |
| **Production** (`NODE_ENV=production`) | **HSTS** — `maxAge` 1 year, `includeSubDomains: true`; **frameguard** — `deny`; **noSniff** — `true`. CSP is not customized yet — rely on Helmet defaults unless a stricter policy is added later.                                |

Restart the BE after changing `NODE_ENV` to pick up the production header set.

## Auth rate limiting (Throttler)

Package: [`@nestjs/throttler`](https://www.npmjs.com/package/@nestjs/throttler`). Global config in `apps/BE/src/app/app.module.ts`; **`@UseGuards(ThrottlerGuard)`** on `controllers/auth/auth.controller.ts` only — limits apply to all `POST /api/auth/*` routes (register, login, refresh, logout).

| Env var                | Default | Meaning                                  |
| ---------------------- | ------- | ---------------------------------------- |
| `AUTH_THROTTLE_TTL_MS` | `60000` | Sliding window length (ms) per client IP |
| `AUTH_THROTTLE_LIMIT`  | `10`    | Max auth POSTs per IP within the window  |

When exceeded → **429** `{ "message": "Too many requests", "code": "TOO_MANY_REQUESTS" }` via `GlobalExceptionFilter` / `fromHttpException` (not raw `ThrottlerException` text).

**API tests:** `global-setup.ts` sets `AUTH_THROTTLE_LIMIT=1000` so the main auth suite is not throttled. The dedicated `throttle.api-spec.ts` boots its own app with a low limit (`2`) to assert **429** behavior.

## Input sanitization (XSS)

Shared helper: `libs/dtos/src/lib/sanitize/plain-text.sanitize.ts` — **`sanitizePlainText()`** strips HTML tags, scripts, and event handlers via `sanitize-html` (no allowed tags), with up to three decode-and-strip passes for encoded payloads.

Applied on signup **`name`** in `libs/dtos/src/lib/user/signup.dto.ts` as a Zod **`.transform(sanitizePlainText)`** after length validation — stored and returned name is plain text only (e.g. `bad<script>alert(1)</script>guy` → `badguy`).

Extend the same helper to other user-facing string fields when new DTOs need it; keep transforms in `@shared/dtos`, not in Nest controllers.

## Request body size limit

JSON and urlencoded bodies are parsed with an env-configurable limit. Wiring: `apps/BE/src/config/body-parser.config.ts`, registered first in `config/configure-app.ts`. Nest apps are created with `{ bodyParser: false }` so the custom limit applies (`main.ts`, API test bootstrap).

| Env var              | Default | Meaning                                        |
| -------------------- | ------- | ---------------------------------------------- |
| `BE_JSON_BODY_LIMIT` | `100kb` | Express `limit` for JSON and urlencoded bodies |

When exceeded → **413** `{ "message": "Request body too large", "code": "PAYLOAD_TOO_LARGE" }` (`GlobalExceptionFilter` maps Express `entity.too.large` and 413 `HttpException`s to `ErrorResponse`).

## Auth guard (Passport.js not used)

**Decision:** Passport.js and `@nestjs/passport` are **not** adopted. The PDF listed a JWT strategy; this repo uses a custom **`JwtCookieAuthGuard`** (`apps/BE/src/decorators/jwt-cookie-auth.guard.ts`) that:

1. Reads the access token from the **HttpOnly cookie** (not `Authorization: Bearer`).
2. Verifies the JWT via `AuthService.verifyAccessToken`.
3. Attaches `{ sub: userId }` to the request for `@CurrentUser()`.

This matches cookie-first auth and avoids Passport boilerplate for a single strategy. Revisit only if you add OAuth/OIDC providers that Passport plugins simplify.

## API response shape (no secrets)

Auth and profile endpoints return a safe **`AuthUser`** subset — defined in `libs/dtos/src/lib/user/auth-response.dto.ts` and enforced by `@ZodResponse` on auth routes:

| Field                                                   | Included          |
| ------------------------------------------------------- | ----------------- |
| `_id`, `email`, `name`, `createdAt`, `updatedAt`        | Yes               |
| `password`, `refreshTokenHash`, `refreshTokenRotatedAt` | **Never** in JSON |

Password hashing and refresh HMAC storage stay server-side only. Tokens are issued via **HttpOnly cookies**, not response bodies. See `response-secrets.api-spec.ts` and `expectAuthUserShape` in API tests.

## Related

- [Backend observability](./observability.md) — structured logs, correlation IDs, Seq
- [Backend overview](./overview.md) — routes and validation
- [Backend API tests](./testing.md) — CSRF helpers, throttle/sanitize/security-headers/response-secrets specs
- [Setup → Backend app](../../setup/03-backend.md) — first-time BE setup

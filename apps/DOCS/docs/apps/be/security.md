---
sidebar_position: 3
---

# Backend security (auth)

Cookie-based JWT auth, refresh rotation, CSRF, and production secret requirements. Implementation lives under `apps/BE/src/auth/` and `apps/BE/src/app/csrf.config.ts`.

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

Wiring: `apps/BE/src/app/csrf.config.ts`, registered from `configure-app.ts` after `cookie-parser`.

| Artifact | Value (default)    | Notes                                       |
| -------- | ------------------ | ------------------------------------------- |
| Cookie   | `qa_csrf_token`    | **Not** HttpOnly — FE reads it for header   |
| Header   | `x-csrf-token`     | `CSRF_CONSTANTS.HEADER_NAME`                |
| Secret   | `AUTH_CSRF_SECRET` | Same fail-fast rules as JWT secrets in prod |

**Protected routes** (state-changing auth POSTs only):

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

**Exempt:** `GET` / `HEAD` / `OPTIONS` (including `GET /api/users/me`, Swagger, smoke routes). Safe methods still **issue** a CSRF cookie on each request so the FE can read the token.

Invalid or missing CSRF token → **403** `{ "message": "invalid csrf token" }`.

**Frontend:** `apps/FE/src/api/axiosConfig.ts` request interceptor reads the CSRF cookie (`VITE_CSRF_COOKIE_NAME`, default `qa_csrf_token`) and sets `x-csrf-token` on `POST` / `PUT` / `PATCH` / `DELETE`.

## Logout

`POST /api/auth/logout` — **204 No Content**, idempotent.

1. If a valid access cookie is present → extract `sub`, **`clearRefreshTokenHash`** in MongoDB.
2. Always **`clearAuthCookies`** (access + refresh), even when tokens are missing or invalid.

After logout, refresh with old cookies fails with **401** (`Invalid refresh token`).

**Known limitation:** There is no access-token revocation list. A stolen access JWT remains valid until its TTL expires (~10 minutes by default) even after logout. Refresh revocation limits long-lived session extension.

## Related

- [Backend overview](./overview.md) — routes and validation
- [Backend API tests](./testing.md) — CSRF test helpers, logout spec
- [Setup → Backend app](../../setup/03-backend.md) — first-time BE setup

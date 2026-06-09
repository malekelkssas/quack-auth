---
sidebar_position: 3
---

# Backend app (BE)

Generate the NestJS app (no e2e runner):

```bash
pnpm nx g @nx/nest:app --name=BE --directory=apps/BE --e2e-test-runner=none --no-interactive
pnpm approve-builds
```

### Run the dev server

```bash
pnpm nx serve BE
```

API is served at http://localhost:3000/api

### CORS (required for local FE)

The FE dev server runs on **http://localhost:4200** and calls the API on **:3000**. Set `CORS_ORIGIN` in the repo root `.env` (see `.env.example`):

```bash
CORS_ORIGIN=http://localhost:4200
```

CORS is applied in `apps/BE/src/app/configure-app.ts` (shared with API tests). Restart the BE after changing `.env`:

```bash
pnpm nx build BE --skip-nx-cache
pnpm nx serve BE
```

Without a fresh build + restart, the browser blocks FE requests with a CORS error — the **OPTIONS** preflight may return **404** and `Access-Control-Allow-Origin` is missing.

### Auth routes (current)

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/users/me` (protected)
- `POST /api/quack` (protected; optional `{ name }` body → `{ quack: "<name> quack" }`)

JWT access and refresh tokens are stored in HttpOnly cookies. Default TTLs are 10 minutes (access) and 24 hours (refresh). CSRF (`csrf-csrf` double-submit) applies to **`POST /api/quack`** only — not auth POSTs. Bootstrap the CSRF cookie with a safe `GET /api` before the first quack call.

Runtime docs (validation, filters, API tests): [Backend overview](../apps/be/overview.md). Security (cookies, rotation, CSRF, Helmet, throttling, XSS sanitize, production secrets): [Backend security](../apps/be/security.md).

### Auth rate limiting (env)

Throttling applies to **`POST /api/auth/*`** only. Set in the repo root `.env` (see `.env.example`):

```bash
AUTH_THROTTLE_TTL_MS=60000   # window per IP (ms)
AUTH_THROTTLE_LIMIT=10       # max auth POSTs per window
```

Restart the BE after changing these values. API tests override the limit to `1000` in `global-setup.ts`; production and local dev use your `.env` defaults unless you tune them.

### JSON body size limit (env)

Set the max request body size for JSON and urlencoded payloads (see `.env.example`):

```bash
BE_JSON_BODY_LIMIT=100kb   # Express limit string (e.g. 100kb, 1mb)
```

Restart the BE after changing this value. Oversized bodies return **413** with `{ "message": "Request body too large", "code": "PAYLOAD_TOO_LARGE" }`. Details: [Backend security](../apps/be/security.md).

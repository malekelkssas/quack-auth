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

Restart the BE after changing `.env` or `main.ts`:

```bash
# stop whatever is on :3000, then:
pnpm nx build BE --skip-nx-cache
pnpm nx serve BE
```

Without a fresh build + restart, the browser blocks FE requests with a CORS error — the **OPTIONS** preflight to `/api/users/signup` returns **404** and `Access-Control-Allow-Origin` is missing. The route path itself is correct (`POST /api/users/signup`); the problem is the running process, not the endpoint name.

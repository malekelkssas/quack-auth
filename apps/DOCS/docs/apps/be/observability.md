---
sidebar_position: 4
---

# Backend observability

Structured request logging with **nestjs-pino**, per-request **correlation IDs** (`AsyncLocalStorage`), and optional **Seq** log UI in Docker for local development.

## Stack

| Piece                 | Location                                                                                               | Role                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `nestjs-pino`         | `apps/BE/src/utils/libs/logging/pino.config.ts`                                                        | JSON logs in production; `pino-pretty` transport in `NODE_ENV=development`                       |
| Correlation ID        | `apps/BE/src/middleware/correlation-id.middleware.ts` + `utils/libs/logging/correlation-id.context.ts` | UUID per request (or `x-correlation-id` passthrough); bound to every pino line via `customProps` |
| `CorrelationIdModule` | `apps/BE/src/utils/libs/logging/correlation-id.module.ts`                                              | Registers correlation middleware **before** pino HTTP logging                                    |
| Seq (dev)             | `docker-compose.yml` → `seq` service                                                                   | Browse structured logs at http://localhost:5341                                                  |

## Request journey (sample)

1. **Client** — `POST /api/auth/login` (or any route).
2. **Correlation middleware** — reads `x-correlation-id` or generates a UUID; sets response header `x-correlation-id`; stores id in `AsyncLocalStorage`.
3. **Pino HTTP** — logs request start; `customProps` adds `{ correlationId }` to each line.
4. **Nest route** — controller → service → repository (Mongo).
5. **Exception filter** — unexpected errors log via Nest `Logger` (pino-backed when `app.useLogger` is set in `main.ts`).
6. **Pino HTTP** — logs response with `method`, `url`, `statusCode`, and duration (`ms`).

Example dev output (pretty-printed):

```text
[18:35:12.041] INFO: POST /api/auth/login 200
    correlationId: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
    responseTime: 42
```

In production (`NODE_ENV` not `development`), logs are single-line JSON suitable for Seq, CloudWatch, or similar sinks.

## Local dev

```bash
docker compose up -d mongodb seq
pnpm nx serve BE
```

- **API** — http://localhost:3000/api
- **Swagger** — http://localhost:3000/docs
- **Seq UI** — http://localhost:5341 (ingest/API on the same host; configure a Seq sink when you wire centralized shipping)

`pino-pretty` is enabled automatically when `NODE_ENV=development` — no pipe required. To force pretty output on raw JSON:

```bash
pnpm nx serve BE 2>&1 | pnpm exec pino-pretty
```

## Propagating correlation IDs

- **Inbound** — send `x-correlation-id` from the FE or an API gateway; the BE echoes it on the response.
- **Application code** — `getCorrelationId()` from `utils/libs/logging/correlation-id.context.ts` inside the request async context.

## Redis (not used)

Sessions use **HttpOnly JWT cookies** + **MongoDB refresh token hashes**. Correlation IDs are per-request only (`AsyncLocalStorage`). Auth rate limits use `@nestjs/throttler` in-process defaults. **Redis was not added** — no session or correlation store requirement at current scale. Revisit if you add distributed throttling or server-side session storage.

## Related

- [Backend overview](./overview.md)
- [MongoDB transactions](../mongodb.md#mongodb-transactions)
- [Setup → MongoDB](../../setup/07-mongodb.md)
- Root `README.md` — Docker Compose (dev services)

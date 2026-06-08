# Setup

Project initialization steps, recorded as they are completed.

## Step 1 — Monorepo tooling (Nx)

```bash
pnpm init
pnpm add -D @nx/react @nx/nest nx
pnpm approve-builds
pnpm nx init
```

## Step 2 — Frontend app (FE)

Generate the React app with Vite and Tailwind (no e2e runner):

```bash
pnpm nx g @nx/react:app FE --directory=apps/FE --e2e-test-runner=none --style=tailwind --no-interactive
pnpm approve-builds
```

### PostCSS / ESM fix

`pnpm nx init` adds `"type": "module"` to the root `package.json`. The Nx-generated `postcss.config.js` and `tailwind.config.js` use CommonJS (`require` / `module.exports`), which breaks Vite with:

```
Failed to load PostCSS config ... require is not defined in ES module scope
```

Remove `"type": "module"` from the root `package.json` — nothing in the monorepo depends on root-level ESM.

### Run the dev server

```bash
pnpm nx serve FE
```

App is served at http://localhost:4200/

## Step 3 — Backend app (BE)

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

## Step 4 — Path aliases (`@/*`)

Set `baseUrl` to the monorepo root (`"../.."`) in each app's `tsconfig.app.json` and add an app-scoped `@/*` path:

```json
"baseUrl": "../..",
"paths": {
  "@/*": ["apps/FE/src/*"]
}
```

Use `apps/BE/src/*` for the backend. Enables imports like `import { Foo } from '@/components/Foo'` from each app's `src/` directory. FE resolves these via the Nx Vite tsconfig-paths plugin; BE via webpack/tsc.

**FE only:** `tsconfig.app.json` must extend `./tsconfig.json` (not `tsconfig.base.json` directly) so it inherits `jsx: "react-jsx"` and other React compiler options from the Nx-generated `apps/FE/tsconfig.json`. Extending the base config alone causes `Module was resolved to '.tsx', but '--jsx' is not set`.

## Step 5 — Shared libraries (constants & DTOs)

Two libs are shared across FE and BE: `qu-constants` for global constants and `dtos` for Zod schemas/types used by both apps.

### 5a — Global constants (`qu-constants`)

```bash
pnpm nx g @nx/js:lib qu-constants --directory=libs/qu-constants --no-interactive
```

**Naming convention:** use the `qu` prefix. It is optional for other libs, but required for the constants library to avoid conflicts with Node's built-in `node:constants` module, which can cause import issues.

**File naming:** one concern per file, suffixed with `.constants.ts` under `libs/qu-constants/src/lib/`:

| File | Purpose |
|---|---|
| `app.constants.ts` | App-wide values (e.g. `APP_NAME`) |
| `env.constants.ts` | `.env` variable keys (`ENV_KEYS`) — use these instead of raw strings when reading `process.env` |
| `node-env.constants.ts` | Allowed `NODE_ENV` values (`NODE_ENV.DEVELOPMENT`, `NODE_ENV.E2E`, etc.) |

Re-export everything from `libs/qu-constants/src/index.ts`.

**Skip tests:** remove the Jest scaffolding — not needed for static constant files:

- `libs/qu-constants/jest.config.cts`
- `libs/qu-constants/tsconfig.spec.json`
- `libs/qu-constants/src/**/*.spec.ts`
- the `tsconfig.spec.json` project reference in `libs/qu-constants/tsconfig.json`
- the `test` target from `libs/qu-constants/project.json` (if present)

### 5b — Shared DTOs (`dtos`)

```bash
pnpm nx g @nx/js:lib dtos --directory=libs/dtos --no-interactive
```

Apply the same Jest cleanup as above for `libs/dtos/`.

DTOs are defined with [Zod](https://zod.dev/) so the same schema validates on both client and server:

```bash
pnpm add zod nestjs-zod
```

- `zod` — schema definitions and inferred TypeScript types (used in FE and BE)
- `nestjs-zod` — NestJS pipes/guards that validate request bodies against Zod schemas on the BE

Example schemas in `libs/dtos/src/lib/greeting.dto.ts`:

```ts
import { z } from 'zod';

export const GreetingQuery = z.object({
  name: z.string().min(1),
});

export type GreetingQuery = z.infer<typeof GreetingQuery>;

export const GreetingResponse = z.object({
  name: z.string(),
  appName: z.string(),
});

export type GreetingResponse = z.infer<typeof GreetingResponse>;
```

Re-export from `libs/dtos/src/index.ts`.

### 5c — Path aliases

Register the libs at the monorepo root in `tsconfig.base.json` under `compilerOptions.paths`:

```json
"paths": {
  "qu-constants": ["./libs/qu-constants/src/index.ts"],
  "dtos": ["./libs/dtos/src/index.ts"],
  "@shared/dtos": ["./libs/dtos/src/index.ts"],
  "@shared/constants": ["./libs/qu-constants/src/index.ts"]
}
```

In each app's `tsconfig.app.json`, set `baseUrl` to `"../.."` and repeat the shared lib paths from `tsconfig.base.json` using root-relative paths (same strings as the root config, without `./`). Only `@/*` is app-specific.

**FE** — extend `./tsconfig.json` (keeps `jsx: "react-jsx"`):

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "baseUrl": "../..",
    "paths": {
      "@/*": ["apps/FE/src/*"],
      "qu-constants": ["libs/qu-constants/src/index.ts"],
      "dtos": ["libs/dtos/src/index.ts"],
      "@shared/dtos": ["libs/dtos/src/index.ts"],
      "@shared/constants": ["libs/qu-constants/src/index.ts"]
    }
  }
}
```

**BE** — extend `../../tsconfig.base.json` directly (no JSX):

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": "../..",
    "paths": {
      "@/*": ["apps/BE/src/*"],
      "qu-constants": ["libs/qu-constants/src/index.ts"],
      "dtos": ["libs/dtos/src/index.ts"],
      "@shared/dtos": ["libs/dtos/src/index.ts"],
      "@shared/constants": ["libs/qu-constants/src/index.ts"]
    }
  }
}
```

Avoid `baseUrl: "."` with `../../libs/...` paths — that duplicates root aliases and drifts easily from `tsconfig.base.json`.

Prefer the `@shared/*` aliases in app code — they read clearly as cross-app imports:

```ts
import { GreetingQuery } from '@shared/dtos';
import { APP_NAME, ENV_KEYS, NODE_ENV } from '@shared/constants';
```

The bare `dtos` and `qu-constants` aliases are kept for Nx project-name resolution and tooling compatibility.

## Step 6 — nestjs-zod on the backend

Wire up [nestjs-zod](https://github.com/BenLorantfy/nestjs-zod) so request query/body/params and response bodies are validated against the shared Zod schemas.

### 6a — Dependencies

Already added in Step 5b. Also install Swagger for OpenAPI docs:

```bash
pnpm add zod nestjs-zod @nestjs/swagger
pnpm approve-builds
```

### 6b — `ZodValidationPipe` and `ZodSerializerInterceptor`

Register both globally in `apps/BE/src/app/app.module.ts`:

```ts
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import {
  ZodSerializerInterceptor,
  ZodValidationPipe,
} from 'nestjs-zod';

@Module({
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
    // HttpExceptionFilter — see 6c
  ],
})
export class AppModule {}
```

- `ZodValidationPipe` — validates `@Body()`, `@Query()`, and `@Param()` inputs against Zod DTOs
- `ZodSerializerInterceptor` — serializes controller return values through `@ZodResponse` / `@ZodSerializerDto` schemas

### 6c — Exception filters

Add filters under `apps/BE/src/filters/`:

- `http-exception.filter.ts` — maps `ZodSerializationException` to the same `{ statusCode, message, errors }` shape as request validation failures
- `global-exception.filter.ts` — catch-all for unhandled errors (500)

Register both in `app.module.ts`:

```ts
import { GlobalExceptionFilter } from '../filters/global-exception.filter';
import { HttpExceptionFilter } from '../filters/http-exception.filter';

{
  provide: APP_FILTER,
  useClass: HttpExceptionFilter,
},
{
  provide: APP_FILTER,
  useClass: GlobalExceptionFilter,
},
```

### 6d — Swagger + `cleanupOpenApiDoc`

In `apps/BE/src/main.ts`, post-process the OpenAPI document so nestjs-zod DTOs render correctly:

```ts
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';

const openApiDoc = SwaggerModule.createDocument(
  app,
  new DocumentBuilder().setTitle('Quack Auth API').setVersion('1.0').build(),
);
SwaggerModule.setup('docs', app, cleanupOpenApiDoc(openApiDoc));
```

Swagger UI: http://localhost:3000/docs

### 6e — NestJS DTO classes from shared schemas

Keep Zod schemas in `libs/dtos` (shared with FE). In the BE app, wrap them with `createZodDto`:

```ts
// apps/BE/src/app/app.dto.ts
import { createZodDto } from 'nestjs-zod';
import { GreetingQuery, GreetingResponse } from '@shared/dtos';

export class GreetingQueryDto extends createZodDto(GreetingQuery) {}
export class GreetingResponseDto extends createZodDto(GreetingResponse) {}
```

> **Keep `app.dto.ts` in sync.** Adding a schema to `libs/dtos` is not enough for the backend — each schema used in a controller (`@Query()`, `@Body()`, `@ZodResponse()`, etc.) needs a matching `createZodDto` class in `apps/BE/src/app/app.dto.ts` (or a feature-scoped `*.dto.ts` as the API grows). The FE only imports the Zod schema/type from `@shared/dtos`; NestJS validation and OpenAPI require the wrapper on the BE side.

Use in the controller:

```ts
@Get()
@ZodResponse({ type: GreetingResponseDto })
getGreeting(@Query() query: GreetingQueryDto) {
  return this.appService.getGreeting(query.name);
}
```

Example request: `GET /api?name=world` → `{ "name": "world", "appName": "quack-auth" }`

## Step 7 — MongoDB (Mongoose)

### 7a — Dependencies

```bash
pnpm add @nestjs/mongoose mongoose
pnpm add -D mongodb-memory-server
pnpm approve-builds
```

- `@nestjs/mongoose` + `mongoose` — runtime MongoDB integration (BE)
- `mongodb-memory-server` — in-memory MongoDB for tests (devDependency)

### 7b — Environment variables

Add `.env.example` at the repo root (committed). Copy to `.env` locally (gitignored):

```bash
cp .env.example .env
```

`.gitignore` should include `.env` and `.env.*`, with `!.env.example` so the template stays tracked.

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/quack-auth
E2E_MONGODB_URI=mongodb://localhost:27017/quack-auth-e2e
MONGODB_DATABASE=quack-auth

# Node Environment
NODE_ENV=development
VITE_NODE_ENV=development
```

Use `ENV_KEYS` from `@shared/constants` when reading these in code — keeps key names in one place for FE, BE, and scripts.

### 7c — `mongoose/` directory (repo root)

Standalone Mongoose layer at the monorepo root (not an Nx app):

```
mongoose/
├── client.ts       # connection helper (picks URI by NODE_ENV)
├── seed.ts         # planned — database seeding
├── tsconfig.json   # extends tsconfig.base.json, resolves @shared/constants
├── fixtures/       # test/dev fixture data
└── models/         # Mongoose model definitions
```

`mongoose/client.ts` connects using `ENV_KEYS` and switches to `E2E_MONGODB_URI` when `NODE_ENV` is `e2e`:

```ts
import { ENV_KEYS, NODE_ENV } from '@shared/constants';

if (process.env[ENV_KEYS.NODE_ENV] === NODE_ENV.E2E) {
  mongoUri = process.env[ENV_KEYS.E2E_MONGODB_URI];
} else {
  mongoUri = process.env[ENV_KEYS.MONGODB_URI];
}
```

NestJS `@nestjs/mongoose` module wiring in the BE app is a follow-up step.

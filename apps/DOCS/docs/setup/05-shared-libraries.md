---
sidebar_position: 5
---

# Shared libraries (constants & DTOs)

Two libs are shared across FE and BE: `qu-constants` for global constants and `dtos` for Zod schemas/types used by both apps.

### 5a — Global constants (`qu-constants`)

```bash
pnpm nx g @nx/js:lib qu-constants --directory=libs/qu-constants --no-interactive
```

**Naming convention:** use the `qu` prefix. It is optional for other libs, but required for the constants library to avoid conflicts with Node's built-in `node:constants` module, which can cause import issues.

**File naming:** one concern per file, suffixed with `.constants.ts` under `libs/qu-constants/src/lib/`:

| File                    | Purpose                                                                                         |
| ----------------------- | ----------------------------------------------------------------------------------------------- |
| `app.constants.ts`      | App-wide values (e.g. `APP_NAME`)                                                               |
| `env.constants.ts`      | `.env` variable keys (`ENV_KEYS`) — use these instead of raw strings when reading `process.env` |
| `node-env.constants.ts` | Allowed `NODE_ENV` values (`NODE_ENV.DEVELOPMENT`, `NODE_ENV.E2E`, etc.)                        |

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

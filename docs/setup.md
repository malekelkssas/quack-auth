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

Add to `compilerOptions` in both `apps/FE/tsconfig.app.json` and `apps/BE/tsconfig.app.json`:

```json
"baseUrl": ".",
"paths": {
  "@/*": ["./src/*"]
}
```

Enables imports like `import { Foo } from '@/components/Foo'` from each app's `src/` directory. FE resolves these via the Nx Vite tsconfig-paths plugin; BE via webpack/tsc.

## Step 5 — Shared libraries (constants & DTOs)

Two libs are shared across FE and BE: `qu-constants` for global constants and `dtos` for Zod schemas/types used by both apps.

### 5a — Global constants (`qu-constants`)

```bash
pnpm nx g @nx/js:lib qu-constants --directory=libs/qu-constants --no-interactive
```

**Naming convention:** use the `qu` prefix. It is optional for other libs, but required for the constants library to avoid conflicts with Node's built-in `node:constants` module, which can cause import issues.

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

Example DTO in `libs/dtos/src/lib/`:

```ts
import { z } from 'zod';

export const TestDto = z.object({
  name: z.string(),
});

export type TestDto = z.infer<typeof TestDto>;
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

Add the same aliases (with relative paths from each app) to `compilerOptions.paths` in both `apps/FE/tsconfig.app.json` and `apps/BE/tsconfig.app.json`, alongside the existing `@/*` entry:

```json
"paths": {
  "@/*": ["./src/*"],
  "dtos": ["../../libs/dtos/src/index.ts"],
  "qu-constants": ["../../libs/qu-constants/src/index.ts"],
  "@shared/dtos": ["../../libs/dtos/src/index.ts"],
  "@shared/constants": ["../../libs/qu-constants/src/index.ts"]
}
```

Prefer the `@shared/*` aliases in app code — they read clearly as cross-app imports:

```ts
import { TestDto } from '@shared/dtos';
import { SOME_CONSTANT } from '@shared/constants';
```

The bare `dtos` and `qu-constants` aliases are kept for Nx project-name resolution and tooling compatibility.

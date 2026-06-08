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

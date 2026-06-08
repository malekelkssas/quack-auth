# Setup

Project initialization steps, recorded as they are completed.

## Step 1 — Monorepo tooling (Nx)

```bash
pnpm init
pnpm add -D @nx/react @nx/node nx
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

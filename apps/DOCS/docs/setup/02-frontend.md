---
sidebar_position: 2
---

# Frontend app (FE)

Generate the React app with Vite and Tailwind (no e2e runner):

```bash
pnpm nx g @nx/react:app FE --directory=apps/FE --e2e-test-runner=none --style=tailwind --no-interactive
pnpm approve-builds
```

### Tailwind CSS v4 (FE)

The Nx React generator scaffolds **Tailwind v3** (`tailwind.config.js` + PostCSS). This repo migrates `apps/FE` to **Tailwind v4**:

- `@tailwindcss/vite` in `apps/FE/vite.config.mts`
- Theme tokens in `apps/FE/src/styles.css` (`@import "tailwindcss"`, `@theme inline`)
- `tw-animate-css` instead of `tailwindcss-animate`
- shadcn: `apps/FE/components.json`, components under `apps/FE/src/components/ui`

See `.cursor/rules/project-conventions.mdc` — **FE styling (Tailwind v4)**.

### Run the dev server

```bash
pnpm nx serve FE
```

App is served at http://localhost:4200/

---
sidebar_position: 1
---

# Frontend (FE)

React + Vite + Tailwind at `apps/FE`.

## Dev server

```bash
pnpm nx serve FE
```

http://localhost:4200

## Path aliases

- `@/*` → `apps/FE/src/*`
- `@shared/dtos`, `@shared/constants` → shared libs (see Setup → Path aliases)

## TypeScript note

`tsconfig.app.json` must extend `./tsconfig.json` (not `tsconfig.base.json` directly) to inherit `jsx: "react-jsx"`.

## What's in this section

| Page                                               | Covers                                                             |
| -------------------------------------------------- | ------------------------------------------------------------------ |
| [HTTP client](./02-http-client.md)                 | `api/` — shared axios, `handleError`, services, `BE_ROUTES`        |
| [State & Redux](./03-state-redux.md)               | Store, slices, slice hooks, the layered data flow                  |
| [Routing & pages](./04-routing-pages.md)           | react-router, `pages/auth/` structure, `AuthLayout`, Login/Signup  |
| [Theme & design](./05-theme-design.md)             | Duck pond tokens, fonts, sprite assets, `DuckCanvas` / `StarField` |
| [Toast notifications](./06-toast-notifications.md) | Toast variants, `use-toast` / `use-error` / `use-success`          |
| [Forms](./07-forms.md)                             | react-hook-form + `zodResolver` + shared DTOs                      |
| [Dev tooling](./08-dev-tooling.md)                 | React Scan / React Grab (dev only)                                 |
| [Testing](./09-testing.md)                         | Vitest, `pnpm nx test FE`, component/hook test patterns            |

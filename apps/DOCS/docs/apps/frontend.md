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

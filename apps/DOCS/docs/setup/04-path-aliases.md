---
sidebar_position: 4
---

# Path aliases (`@/*`)

Set `baseUrl` to the monorepo root (`"../.."`) in each app's `tsconfig.app.json` and add an app-scoped `@/*` path:

```json
"baseUrl": "../..",
"paths": {
  "@/*": ["apps/FE/src/*"]
}
```

Use `apps/BE/src/*` for the backend. Enables imports like `import { Foo } from '@/components/Foo'` from each app's `src/` directory. FE resolves these via the Nx Vite tsconfig-paths plugin; BE via webpack/tsc.

**FE only:** `tsconfig.app.json` must extend `./tsconfig.json` (not `tsconfig.base.json` directly) so it inherits `jsx: "react-jsx"` and other React compiler options from the Nx-generated `apps/FE/tsconfig.json`. Extending the base config alone causes `Module was resolved to '.tsx', but '--jsx' is not set`.

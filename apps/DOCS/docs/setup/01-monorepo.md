---
sidebar_position: 1
---

# Monorepo tooling (Nx)

This repo pins **pnpm** 11.5.2 (`packageManager` + `devEngines` in root `package.json`). Use **`pnpm nx …`**, not `npx nx …` — npm will fail with `EBADDEVENGINES` / `Invalid name "pnpm" does not match "npm"`.

```bash
pnpm init
pnpm add -D @nx/react @nx/nest nx
pnpm approve-builds
pnpm nx init
```

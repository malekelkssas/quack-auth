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

## Dev-only tooling

Bootstrap: `index.html` → `dev-entry.ts` → (`dev-tools.ts` in dev only) → `main.tsx`. Matches [React Scan Vite](https://github.com/aidenybai/react-scan/blob/main/docs/installation/vite.md) and [React Grab Vite](https://github.com/aidenybai/react-grab/blob/main/README.md#vite) guides. Production builds skip `dev-tools` entirely.

| Tool                                      | Site                        | What it does                                                                                                                         |
| ----------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| [React Scan](https://react-scan.com/)     | https://react-scan.com/     | Highlights components that re-render too often — great for spotting performance issues without code changes.                         |
| [React Grab](https://www.react-grab.com/) | https://www.react-grab.com/ | Hover a UI element and press **⌘C** / **Ctrl+C** to copy component context (file, name, HTML) into your clipboard for coding agents. |

Both are especially useful during local development and agent-assisted UI work. Run `pnpm nx serve FE` and use them in the browser at http://localhost:4200.

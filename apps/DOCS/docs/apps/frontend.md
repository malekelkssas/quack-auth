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

## HTTP client (`apps/FE/src/api/`)

One shared axios instance — **do not** call `axios.create()` elsewhere in FE.

| File             | Purpose                                                                                                                 |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `axiosConfig.ts` | Default client; `baseURL` from `VITE_API_URL` (`ENV_KEYS`); `withCredentials: true`; future interceptors live here only |
| `handleError.ts` | Maps `unknown` / `AxiosError` → `ErrorResponse` (`@shared/dtos`)                                                        |
| `services/*.ts`  | Domain API calls (e.g. `authService.ts`)                                                                                |

### Imports

```ts
import api from '@/api/axiosConfig';
import { handleError } from '@/api/handleError';
import { AuthService } from '@/api/services/authService';
```

### Error handling

`handleError` uses axios codes from `apps/FE/src/utils/constants.ts` (`AXIOS_ERROR_CODES`, `AXIOS_CONSTANTS`) for network/timeout fallbacks; HTTP error bodies are returned as `ErrorResponse` when the API responds.

### Services & routes

Service modules under `api/services/` use the shared `api` instance and build paths from `BE_ROUTES` (`@shared/constants`) — **no magic route strings** in FE.

Example — signup (`AuthService.signup`):

```ts
// POST {VITE_API_URL}/users/signup  (baseURL already includes /api)
await api.post(`/${BE_ROUTES.USERS}/${BE_ROUTES.SIGNUP}`, body);
```

Shared route segments are defined in `libs/qu-constants/src/lib/be-routes.constants.ts` (see [Backend](./backend.md#routes)).

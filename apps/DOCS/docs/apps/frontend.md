---
sidebar_position: 1
---

import MermaidChart from '@site/src/components/MermaidChart';

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

### Services barrel

```ts
import { AuthService } from '@/api/services';
```

Re-exported from `api/services/index.ts`.

## Redux store (`apps/FE/src/store/`)

| Path                   | Purpose                                           |
| ---------------------- | ------------------------------------------------- |
| `slices/*.ts`          | RTK slices; thunks call `@/api/services/`         |
| `root-reducer.ts`      | Register slices via `combineReducers`             |
| `store.ts`, `hooks.ts` | Store + typed `useAppDispatch` / `useAppSelector` |

### Thunk pattern

Slices import services from the barrel, map errors with `handleError`, and reject with `ErrorResponse`:

```ts
export const signup = createAsyncThunk<
  void,
  Signup,
  { rejectValue: ErrorResponse }
>('auth/signup', async (body, { rejectWithValue }) => {
  try {
    await AuthService.signup(body);
  } catch (error) {
    return rejectWithValue(handleError(error));
  }
});
```

Use **granular loading flags** per operation (`isSigningUp`, `isCreating`, …) rather than one ambiguous `isLoading` when multiple ops can overlap.

Current slices: **`auth`** — `signup` thunk only (login/checkAuth deferred until BE routes exist); state shaped for easy extension.

## Slice hooks (`apps/FE/src/hooks/slices/`)

One hook per slice — e.g. `useAuth.ts` — exposing state, selectors, and dispatch wrappers behind a **unified interface**.

**Developer rationale:** when slice shape or actions change, update a few slice-hook files instead of many consumers across pages and components.

Slice hooks supply **action ops** (`create` / `update` / `delete` / `select` / `clear`) to component logic hooks. They do **not** own `fetch*` orchestration.

## Layered data flow

<MermaidChart chart={`flowchart LR
API["API service"]
SLICE["Redux slice"]
SHOOK["Slice hook"]
CTX["Page context"]
LOGIC["Logic hook"]
UI["UI component"]

API --> SLICE --> SHOOK --> CTX --> LOGIC --> UI`} />

| Layer               | Responsibility                                                                                                                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **API service**     | HTTP via `axiosConfig`; paths from `BE_ROUTES`                                                                                                                                                   |
| **Redux slice**     | Async thunks, normalized state, granular loading/error flags                                                                                                                                     |
| **Slice hook**      | Typed facade over slice state + actions                                                                                                                                                          |
| **Page context**    | **`fetch*` only** — load data in effects; expose `data`, `isLoading`, `error`, pagination; optional `useError` / `useSuccess` toasts; use `useEffectEvent` for effect callbacks (omit from deps) |
| **Component logic** | `useComponentName.ts` — local state, handlers, non-fetch effects; calls slice-hook mutations                                                                                                     |
| **UI component**    | `ComponentName.tsx` — presentational                                                                                                                                                             |

### Forms

- react-hook-form + `zodResolver` + shared Zod schemas from `@shared/dtos`
- `useForm<z.input<typeof Schema>, unknown, z.output<typeof Schema>>` when defaults/transforms differ
- Child form components use the same input type as the parent form

### Cleanup

Clear page-owned Redux state on unmount unless persistence is required (`redux-persist` blacklist when appropriate).

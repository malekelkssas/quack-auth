---
sidebar_position: 3
---

import MermaidChart from '@site/src/components/MermaidChart';

# State & Redux (`apps/FE/src/store/`)

| Path                   | Purpose                                                                 |
| ---------------------- | ----------------------------------------------------------------------- |
| `api/authApi.ts`       | RTK Query `createApi` — auth HTTP via `axiosBaseQuery`                  |
| `slices/*.ts`          | Client session state (e.g. `auth.user`); matchers sync from API         |
| `root-reducer.ts`      | `combineReducers` + `RESET_APP` wrapper (`appReducer`)                  |
| `reset.ts`             | `resetApp()` for full store reset on session death                      |
| `persist.config.ts`    | Blacklist `authApi` cache; persist **`auth.user` only**                 |
| `store.ts`, `hooks.ts` | Store + typed `useAppDispatch` / `useAppSelector`; `authApi.middleware` |

## RTK Query auth API

`authApi` (`store/api/authApi.ts`) owns auth HTTP:

| Endpoint   | Method | Path             | Response       |
| ---------- | ------ | ---------------- | -------------- |
| `register` | POST   | `/auth/register` | `AuthResponse` |
| `login`    | POST   | `/auth/login`    | `AuthResponse` |
| `logout`   | POST   | `/auth/logout`   | void (204)     |
| `getMe`    | GET    | `/users/me`      | `AuthResponse` |

Generated hooks: `useRegisterMutation`, `useLoginMutation`, `useLogoutMutation`, `useGetMeQuery`, `useLazyGetMeQuery`.

## Additional RTK Query slices (`quackApi`)

Non-auth domains get their own `createApi` slice rather than crowding `authApi`. `quackApi` (`store/api/quackApi.ts`) owns the cookie-guarded quack greeting:

| Endpoint | Method | Path     | Arg                  | Response        |
| -------- | ------ | -------- | -------------------- | --------------- |
| `quack`  | POST   | `/quack` | `QuackInput \| void` | `QuackResponse` |

- It is a `builder.query` (not a mutation) so the Home page auto-fetches the greeting on mount; an empty body lets the BE greet the signed-in agent by their stored name.
- Generated hooks: `useQuackQuery`, `useLazyQuackQuery`.
- **Wiring mirrors `authApi`:** add the reducer in `root-reducer.ts`, concat `.middleware` in `store.ts`, and blacklist the `reducerPath` in `persist.config.ts`.
- Paths come from `BE_ROUTES` (`@shared/constants`); request/response typing from `@shared/dtos` (`QuackInput`, `QuackResponse`). No magic route strings.

## Auth slice (`authSlice`)

- **`user: AuthUser | null`** — client session; populated by RTK Query matchers.
- **`resetAuth`** — clears `user` (also triggered indirectly via `RESET_APP`).
- **Matchers** — on `register` / `login` / `getMe` fulfilled → `state.user = payload.user`; on `logout` fulfilled → `state.user = null`.
- **No `createAsyncThunk`** for auth HTTP — loading/error state lives on RTK Query mutation hooks in page logic hooks.

## Persist rules

- **Blacklist** `authApi` reducer path — never persist RTK Query cache.
- **Whitelist `auth.user` only** via `createTransform` on the `auth` slice — rehydrate merges into full initial state so ephemeral flags stay fresh.

## Slice hooks (`apps/FE/src/hooks/slices/`)

One hook per slice — e.g. `useAuth.ts` — exposing `user`, `isAuthenticated`, and `resetAuth`.

RTK Query auth hooks are re-exported from the slice-hook module (or imported directly from `@/store/api/authApi` in page hooks).

**Developer rationale:** when slice shape or auth hooks change, update a few slice-hook files instead of many consumers across pages and components.

> System hooks (e.g. `use-toast`, `use-error`, `use-success`) live directly under `apps/FE/src/hooks/` — not in `hooks/slices/`. See [Toast notifications](./06-toast-notifications.md).

## Layered data flow

<MermaidChart chart={`flowchart LR
API["authApi (RTK Query)"]
SLICE["authSlice matchers"]
SHOOK["Slice hook"]
GUARD["Route guard / page context"]
LOGIC["Logic hook"]
UI["UI component"]

API --> SLICE --> SHOOK --> GUARD --> LOGIC --> UI`} />

| Layer               | Responsibility                                                                                                               |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **RTK Query API**   | Auth HTTP via `axiosBaseQuery`; paths from `BE_ROUTES`                                                                       |
| **Redux slice**     | Client session (`user`); matchers sync from fulfilled endpoints                                                              |
| **Slice hook**      | Typed facade over slice state + `resetAuth`                                                                                  |
| **Route guard**     | **`fetch*` only** — e.g. `ProtectedRoute` calls `lazyGetMe()` once to validate cookies; shows `ProgressLoader` while loading |
| **Component logic** | `useComponentName.ts` — RHF + RTK Query mutations; `useError` for mutation errors                                            |
| **UI component**    | `ComponentName.tsx` — presentational                                                                                         |

## Session reset

When refresh fails (401), `setupAxiosInterceptors` dispatches `resetApp()` (`RESET_APP`), resets RTK Query cache, purges persisted state, and hard-redirects to login. See [HTTP client](./02-http-client.md#401--refresh--retry).

## Cleanup

Persist only `auth.user`. RTK Query cache and loading flags are ephemeral. On logout, the `logout` matcher clears `user`.

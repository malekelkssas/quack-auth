---
sidebar_position: 3
---

import MermaidChart from '@site/src/components/MermaidChart';

# State & Redux (`apps/FE/src/store/`)

| Path                   | Purpose                                           |
| ---------------------- | ------------------------------------------------- |
| `slices/*.ts`          | RTK slices; thunks call `@/api/services/`         |
| `root-reducer.ts`      | Register slices via `combineReducers`             |
| `store.ts`, `hooks.ts` | Store + typed `useAppDispatch` / `useAppSelector` |

## Thunk pattern

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

> System hooks (e.g. `use-toast`, `use-error`, `use-success`) live directly under `apps/FE/src/hooks/` — not in `hooks/slices/`. See [Toast notifications](./06-toast-notifications.md).

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

## Cleanup

Clear page-owned Redux state on unmount unless persistence is required (`redux-persist` blacklist when appropriate).

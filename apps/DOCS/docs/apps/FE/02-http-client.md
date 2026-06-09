---
sidebar_position: 2
---

# HTTP client (`apps/FE/src/api/`)

One shared axios instance — **do not** call `axios.create()` elsewhere in FE.

| File                        | Purpose                                                                                                                |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `axiosConfig.ts`            | Default client; `baseURL` from `VITE_API_URL` (`ENV_KEYS`); `withCredentials: true`; **request** CSRF interceptor only |
| `axiosBaseQuery.ts`         | RTK Query `BaseQueryFn` wrapping the shared client; maps failures → `{ error: ErrorResponse }`                         |
| `setupAxiosInterceptors.ts` | **Response** interceptor: 401 → refresh → retry; refresh 401 → full session reset + redirect                           |
| `handleError.ts`            | Maps `unknown` / `AxiosError` → `ErrorResponse` (`@shared/dtos`)                                                       |

## Imports

```ts
import api from '@/api/axiosConfig';
import { axiosBaseQuery } from '@/api/axiosBaseQuery';
import { handleError } from '@/api/handleError';
```

Auth HTTP uses RTK Query `authApi` (see [State & Redux](./03-state-redux.md)), not `api/services/`.

## Error handling

`handleError` uses axios codes from `apps/FE/src/utils/constants/` (`AXIOS_ERROR_CODES`, `AXIOS_CONSTANTS`) for network/timeout fallbacks; HTTP error bodies are returned as `ErrorResponse` when the API responds.

RTK Query endpoints use `axiosBaseQuery`, so mutation/query hooks surface the same `ErrorResponse` shape. Page hooks normalize with `toErrorResponse()` from `@/utils/rtk-error.util` before passing to `useError`.

## Routes

Paths are built from `BE_ROUTES` (`@shared/constants`) — **no magic route strings** in FE.

Example — register (via `authApi`):

```ts
// POST {VITE_API_URL}/auth/register  (baseURL already includes /api)
url: `/${BE_ROUTES.AUTH}/${BE_ROUTES.REGISTER}`,
```

Shared route segments are defined in `libs/qu-constants/src/lib/be-routes.constants.ts` (see [Backend routes](../be/overview.md#routes)).

## 401 → refresh → retry

`setupAxiosInterceptors` is invoked from `store.ts` **after** `configureStore` (avoids circular imports).

**Behavior:**

1. On response **401**, skip if the request already retried (`_retry`) or the URL is an auth endpoint where 401 is expected: `/auth/login`, `/auth/refresh`, `/auth/register`.
2. **Single-flight refresh** — queue concurrent 401s while one `POST /auth/refresh` runs.
3. Refresh success → retry the original request(s).
4. Refresh **401** (session dead):
   - `dispatch(resetApp())` + `authApi.util.resetApiState()`
   - `persistor.purge()`
   - `window.location.assign(FE_ROUTES.LOGIN)` (hard navigation clears in-flight React state)

Request CSRF headers for `POST /auth/refresh` are applied by the existing request interceptor in `axiosConfig.ts`.

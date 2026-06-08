---
sidebar_position: 2
---

# HTTP client (`apps/FE/src/api/`)

One shared axios instance — **do not** call `axios.create()` elsewhere in FE.

| File             | Purpose                                                                                                                 |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `axiosConfig.ts` | Default client; `baseURL` from `VITE_API_URL` (`ENV_KEYS`); `withCredentials: true`; future interceptors live here only |
| `handleError.ts` | Maps `unknown` / `AxiosError` → `ErrorResponse` (`@shared/dtos`)                                                        |
| `services/*.ts`  | Domain API calls (e.g. `authService.ts`)                                                                                |

## Imports

```ts
import api from '@/api/axiosConfig';
import { handleError } from '@/api/handleError';
import { AuthService } from '@/api/services/authService';
```

## Error handling

`handleError` uses axios codes from `apps/FE/src/utils/constants/` (`AXIOS_ERROR_CODES`, `AXIOS_CONSTANTS`) for network/timeout fallbacks; HTTP error bodies are returned as `ErrorResponse` when the API responds.

## Services & routes

Service modules under `api/services/` use the shared `api` instance and build paths from `BE_ROUTES` (`@shared/constants`) — **no magic route strings** in FE.

Example — signup (`AuthService.signup`):

```ts
// POST {VITE_API_URL}/users/signup  (baseURL already includes /api)
await api.post(`/${BE_ROUTES.USERS}/${BE_ROUTES.SIGNUP}`, body);
```

Shared route segments are defined in `libs/qu-constants/src/lib/be-routes.constants.ts` (see [Backend](../backend.md#routes)).

## Services barrel

```ts
import { AuthService } from '@/api/services';
```

Re-exported from `api/services/index.ts`.

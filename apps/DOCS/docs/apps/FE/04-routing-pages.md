---
sidebar_position: 4
---

# Routing & pages

FE routing uses [react-router](https://reactrouter.com/) (`react-router-dom`).

## Setup

- `apps/FE/src/main.tsx` wraps `<App/>` in `<BrowserRouter>`.
- `apps/FE/src/app/app.tsx` declares the route table and renders the global `<Toaster/>`.

Path strings are centralized in `apps/FE/src/utils/constants/routes.constants.ts` — import `FE_ROUTES` and `FE_DEFAULT_ROUTE` from `@/utils/constants`. Use them in `<Route>`, `<Navigate>`, and `<Link>` (e.g. Signup footer → `FE_ROUTES.LOGIN`).

```tsx
// utils/constants/routes.constants.ts
export const FE_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  LOGOUT: '/logout',
} as const;

export const FE_DEFAULT_ROUTE = FE_ROUTES.LOGIN;
```

```tsx
// app/app.tsx
import { FE_DEFAULT_ROUTE, FE_ROUTES } from '@/utils/constants';

<Routes>
  <Route element={<ProtectedRoute />}>
    <Route path={FE_ROUTES.HOME} element={<Home />} />
  </Route>
  <Route element={<GuestRoute />}>
    <Route path={FE_ROUTES.LOGIN} element={<Login />} />
    <Route path={FE_ROUTES.SIGNUP} element={<Signup />} />
  </Route>
  <Route path={FE_ROUTES.LOGOUT} element={<Logout />} />
  <Route path="*" element={<Navigate to={FE_DEFAULT_ROUTE} replace />} />
</Routes>
<Toaster />
```

| Constant / route               | Guard            | Page     | Notes                               |
| ------------------------------ | ---------------- | -------- | ----------------------------------- |
| `FE_ROUTES.HOME` (`/`)         | `ProtectedRoute` | `Home`   | Shows `user.name`; link to logout   |
| `FE_ROUTES.LOGIN` (`/login`)   | `GuestRoute`     | `Login`  | RHF + `useLoginMutation`            |
| `FE_ROUTES.SIGNUP` (`/signup`) | `GuestRoute`     | `Signup` | RHF + `useRegisterMutation`         |
| `FE_ROUTES.LOGOUT` (`/logout`) | —                | `Logout` | Empty page; logout on mount → login |
| `*`                            | —                | → login  | `FE_DEFAULT_ROUTE`                  |

## Route guards

| Component        | File                                    | Behavior                                                                |
| ---------------- | --------------------------------------- | ----------------------------------------------------------------------- |
| `ProtectedRoute` | `components/routing/ProtectedRoute.tsx` | Calls `lazyGetMe()` once; `ProgressLoader` while loading; error → login |
| `GuestRoute`     | `components/routing/GuestRoute.tsx`     | Redirect authenticated users to `FE_ROUTES.HOME`                        |

On first protected entry with a persisted `user`, `ProtectedRoute` still calls `getMe` to validate cookies (background revalidation).

## `pages/` structure (`apps/FE/src/pages/<Page>/`)

```
pages/
├── Home/
│   ├── Home.tsx              # protected welcome (user name)
│   └── useHome.ts
├── Logout/
│   └── Logout.tsx            # logout on mount → redirect login
└── auth/
    ├── AuthLayout.tsx        # shared pond scene + card + duck stage
    ├── Login/
    │   ├── Login.tsx
    │   └── useLogin.ts
    └── Signup/
        ├── Signup.tsx
        └── useSignup.ts
```

Auth pages follow the layered convention. Register/login are **mutations** via RTK Query — component logic hooks call mutation hooks directly; no page-context `fetch*` layer.

### `AuthLayout`

Shared layout for both auth pages:

- Pond scene — `StarField` background + ground.
- Card wrapper around the form.
- Duck stage rendering `DuckCanvas` with a duck-mode toggle.
- A slot (`children`) for the page's form.

See [Theme & design](./05-theme-design.md) for `DuckCanvas` / `StarField`.

### Login vs Signup

| Aspect        | Login                     | Signup                       |
| ------------- | ------------------------- | ---------------------------- |
| Default duck  | `duckling`                | `both`                       |
| Title         | `QUACK & LOGIN`           | `JOIN THE POND`              |
| Submit button | `[ ENTER THE POND ]`      | `[ JOIN THE POND ]`          |
| On submit     | `useLoginMutation` → home | `useRegisterMutation` → home |
| Extra field   | —                         | `name`                       |

Pages cross-link to each other. Form integration is documented in [Forms](./07-forms.md).

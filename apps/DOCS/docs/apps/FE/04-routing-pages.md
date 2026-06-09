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
} as const;

export const FE_DEFAULT_ROUTE = FE_ROUTES.SIGNUP;
```

```tsx
// app/app.tsx
import { FE_DEFAULT_ROUTE, FE_ROUTES } from '@/utils/constants';

<Routes>
  <Route path={FE_ROUTES.LOGIN} element={<Login />} />
  <Route path={FE_ROUTES.SIGNUP} element={<Signup />} />
  <Route
    path={FE_ROUTES.HOME}
    element={<Navigate to={FE_DEFAULT_ROUTE} replace />}
  />
  <Route path="*" element={<Navigate to={FE_DEFAULT_ROUTE} replace />} />
</Routes>
<Toaster />
```

| Constant / route               | Page                 | Notes                           |
| ------------------------------ | -------------------- | ------------------------------- |
| `FE_ROUTES.LOGIN` (`/login`)   | `Login`              | UI only — no BE login route yet |
| `FE_ROUTES.SIGNUP` (`/signup`) | `Signup`             | Wired to `useAuth().signup`     |
| `FE_ROUTES.HOME` / `*`         | → `FE_DEFAULT_ROUTE` | Default redirect                |

## `pages/` structure (`apps/FE/src/pages/<Page>/`)

Auth pages follow the layered convention. A signup is a **mutation**, so it uses a component logic hook calling the slice hook — no page-context `fetch*` layer is needed.

```
pages/
└── auth/
    ├── AuthLayout.tsx        # shared pond scene + card + duck stage, slot for the form
    ├── Login/
    │   ├── Login.tsx         # UI
    │   └── useLogin.ts       # logic hook (UI only)
    └── Signup/
        ├── Signup.tsx        # UI
        └── useSignup.ts      # logic hook (RHF + zodResolver + useAuth)
```

### `AuthLayout`

Shared layout for both auth pages:

- Pond scene — `StarField` background + ground.
- Card wrapper around the form.
- Duck stage rendering `DuckCanvas` with a duck-mode toggle.
- A slot (`children`) for the page's form.

See [Theme & design](./05-theme-design.md) for `DuckCanvas` / `StarField`.

### Login vs Signup

| Aspect        | Login                                                                       | Signup                   |
| ------------- | --------------------------------------------------------------------------- | ------------------------ |
| Default duck  | `duckling`                                                                  | `both`                   |
| Title         | `QUACK & LOGIN`                                                             | `JOIN THE POND`          |
| Submit button | `[ ENTER THE POND ]`                                                        | `[ JOIN THE POND ]`      |
| On submit     | warning toast (demo): _"Login isn't open yet — sign up to enter the pond!"_ | calls `useAuth().signup` |
| Extra field   | —                                                                           | `name`                   |

Pages cross-link to each other. The Login submit deliberately fires a **warning** toast to demonstrate the warning variant while no BE login route exists. Signup integration is documented in [Forms](./07-forms.md).

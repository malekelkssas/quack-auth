---
sidebar_position: 7
---

# Forms

FE forms use [react-hook-form](https://react-hook-form.com/) + `@hookform/resolvers`
`zodResolver` with the **shared Zod DTOs** from `@shared/dtos` — never a FE-local copy
of the schema.

## Typing rule

Use the three-argument `useForm` generic when defaults/transforms differ between input
and output:

```ts
useForm<z.input<typeof Schema>, unknown, z.output<typeof Schema>>;
```

Child form components use the same **input** type as the parent form.

## Signup example

`pages/auth/Signup/useSignup.ts`:

```ts
const [register, { isLoading, error, reset }] = useRegisterMutation();

const form = useForm<z.input<typeof Signup>, unknown, z.output<typeof Signup>>({
  resolver: zodResolver(Signup),
});

const onSubmit = form.handleSubmit(async (values) => {
  await register(values).unwrap();
  // success toast + navigate(FE_ROUTES.HOME)
});

useError({ error: toErrorResponse(error), clearError: reset });
```

- Schema: `Signup` from `@shared/dtos` — fields `email`, `name`, `password`.
- On submit → `useRegisterMutation` (RTK Query); `authSlice` matcher sets `user`.
- Feedback → `useError` on mutation error; success toast + navigate home on unwrap success.

## Login example

`pages/auth/Login/useLogin.ts` mirrors signup:

```ts
const [login, { isLoading, error, reset }] = useLoginMutation();

const form = useForm<z.input<typeof Login>, unknown, z.output<typeof Login>>({
  resolver: zodResolver(Login),
});

const onSubmit = form.handleSubmit(async (values) => {
  await login(values).unwrap();
  // success toast + navigate(FE_ROUTES.HOME)
});

useError({ error: toErrorResponse(error), clearError: reset });
```

- Schema: `Login` from `@shared/dtos` — fields `email`, `password`.
- `Login.tsx` wires `PixelField` with `register()` and `errors` (same pattern as Signup).

This keeps validation rules in one shared place (used by both FE and BE) and routes
API/error handling through RTK Query + the [toast hooks](./06-toast-notifications.md).

See [State & Redux](./03-state-redux.md) for the auth slice / matcher flow.

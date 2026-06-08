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

`pages/auth/Signup/useSignup.ts` is the canonical form logic hook:

```ts
const form = useForm<z.input<typeof Signup>, unknown, z.output<typeof Signup>>({
  resolver: zodResolver(Signup),
});
```

- Schema: `Signup` from `@shared/dtos` (`libs/dtos/src/lib/user/signup.dto.ts`) —
  fields `email`, `name`, `password`. RHF surfaces inline field errors.
- On submit → `useAuth().signup(values)` (the slice hook from
  [State & Redux](./03-state-redux.md)).
- Feedback → `useError({ error: signupError, clearError })` and `useSuccess` on
  `signupSucceeded` (success toast _"Welcome to the pond!"_), then `clearSignup`.
- The signup Redux state is cleared on unmount.

This keeps validation rules in one shared place (used by both FE and BE) and routes
all API/error/success handling through the layered flow and the
[toast hooks](./06-toast-notifications.md).

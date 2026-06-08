---
sidebar_position: 6
---

# Toast notifications

FE uses the **classic shadcn toast** (Radix `@radix-ui/react-toast`) — not `sonner`.
This keeps a typed `cva` variant API and a reducer-based queue that the error/success
hooks can drive.

## Components & hooks

| File                        | Purpose                                                              |
| --------------------------- | -------------------------------------------------------------------- |
| `components/ui/toast.tsx`   | Radix primitives + `cva` `toastVariants`                             |
| `components/ui/toaster.tsx` | Renders the toast queue (mounted once in `app/app.tsx`)              |
| `hooks/use-toast.ts`        | shadcn toast reducer + `toast()` function                            |
| `hooks/use-error.ts`        | Toasts an `error`-variant message from a slice error, then clears it |
| `hooks/use-success.ts`      | Toasts a `success`-variant message, then clears it                   |

These system hooks live directly under `apps/FE/src/hooks/` (not `hooks/slices/`).

## Variants

`toastVariants` defines four variants:

| Variant   | Color             | Token       |
| --------- | ----------------- | ----------- |
| `default` | neutral           | —           |
| `success` | green             | `--success` |
| `warning` | yellow / amber    | `--warning` |
| `error`   | red (destructive) | `--error`   |

Variant names are centralized in `apps/FE/src/utils/constants/toast-variants.constants.ts`:

```ts
export const TOAST_VARIANTS = {
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;
```

## `use-error` / `use-success`

`use-error` skips the generic network fallback message, fires an `error` toast for a
real API error, then calls the slice's `clearError`. `use-success` is the analogous
hook for success messages. Both are intended to be wired in component logic hooks or
page contexts:

```ts
useError({ error: signupError, clearError });
useSuccess({ succeeded: signupSucceeded, message: 'Welcome to the pond!' });
```

See [Forms](./07-forms.md) for the full signup wiring.

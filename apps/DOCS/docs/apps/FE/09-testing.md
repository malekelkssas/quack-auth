---
sidebar_position: 9
---

# Testing

FE tests run on **[Vitest](https://vitest.dev/)** (the Nx default for Vite projects),
with [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
for components and hooks.

## Running tests

```bash
pnpm nx test FE          # run the FE suite
pnpm nx test FE --watch  # watch mode
```

The `test` target is **inferred** by the `@nx/vite` plugin from `apps/FE/vite.config.mts`
(`apps/FE/project.json` keeps `targets: {}` — no hand-written target).

## Config (`apps/FE/vite.config.mts`)

Vitest is configured via the `test` block in the FE Vite config — a `jsdom`
environment with globals enabled and an RTL setup file:

```ts
/// <reference types='vitest' />
export default defineConfig(() => ({
  // ...plugins, server, build...
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['src/test-setup.ts'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/apps/FE',
      provider: 'v8',
    },
  },
}));
```

`jsdom` and `vitest` are already in the workspace `devDependencies`. The setup file
typically imports `@testing-library/jest-dom` matchers.

## Patterns

### Component tests

Render with RTL, assert on accessible roles/text, and drive interactions via
`@testing-library/user-event`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

it('renders the signup CTA', () => {
  render(<Signup />);
  expect(
    screen.getByRole('button', { name: /join the pond/i }),
  ).toBeInTheDocument();
});
```

Components that read Redux or routing need providers — wrap them in a test helper that
mounts `<Provider store={...}>` and `<MemoryRouter>` so slice hooks and `react-router`
resolve.

### Hook tests

Use `renderHook` for logic and slice hooks:

```tsx
import { renderHook, act } from '@testing-library/react';

it('exposes signup state', () => {
  const { result } = renderHook(() => useAuth(), { wrapper: StoreWrapper });
  expect(result.current.isSigningUp).toBe(false);
});
```

Mock the API service layer (`@/api/services`) rather than axios so tests assert on the
slice/hook behavior, not HTTP wiring.

## Status

Vitest is wired and runnable; concrete component/hook specs are tracked in the repo
root `TODO.md` §7 (FE unit tests, Cypress e2e). This page is the parallel of the BE
testing notes.

---
sidebar_position: 9
---

# Husky & quality gates

Local git hooks enforce formatting, linting, and TypeScript checks before every commit.

## Dependencies

Installed as root devDependencies (via `pnpm install` after clone):

- **husky** — git hooks (enabled by the `prepare` script)
- **lint-staged** — run formatters/linters only on staged files
- **prettier** + **eslint** — already part of the Nx ESLint setup

## Hook: pre-commit

File: `.husky/pre-commit`

```bash
pnpm exec lint-staged
pnpm run check
```

### Step 1 — `lint-staged` (staged files only)

Configured in root `package.json`:

| Glob                                                  | Command                         |
| ----------------------------------------------------- | ------------------------------- |
| `*.{ts,tsx,js,jsx,mjs,cjs,json,md,css,scss,yml,yaml}` | `prettier --write`              |
| `*.{ts,tsx,js,jsx,mjs,cjs}`                           | `eslint --fix --max-warnings=0` |

Auto-fixes what it can on **staged** files, then re-stages the results.

### Step 2 — `pnpm check` (full repo)

Runs the full verification suite:

```bash
pnpm lint && pnpm typecheck && pnpm format:check
```

| Script              | What it does                                                 |
| ------------------- | ------------------------------------------------------------ |
| `pnpm lint`         | ESLint on all Nx projects (FE, BE, DOCS, dtos, qu-constants) |
| `pnpm typecheck`    | `tsc --noEmit` on those projects + `mongoose/`               |
| `pnpm format:check` | Prettier check on the whole repo                             |

Root `quack-auth` is excluded from `nx run-many` so workspace scripts do not recurse into themselves.

## Manual commands

Same scripts you can run without committing:

```bash
pnpm check          # lint + typecheck + format:check
pnpm lint           # ESLint (all projects)
pnpm lint:fix       # ESLint with --fix
pnpm typecheck      # TypeScript (apps, libs, mongoose/)
pnpm format         # Prettier write
pnpm format:check   # Prettier check
```

## ESLint & Prettier config

- ESLint: root `eslint.config.mjs` (Nx flat config + `eslint-config-prettier`)
- Prettier: `.prettierrc`, `.prettierignore` (ignores `dist`, `.docusaurus`, `pnpm-lock.yaml`, etc.)
- Generated Docusaurus output (`.docusaurus/`) is ignored by ESLint

## First-time setup after clone

```bash
pnpm install   # runs "prepare" → husky installs hooks into .git/hooks
```

If hooks are missing, run `pnpm prepare` manually.

## Next: CI

GitHub Actions (planned) will run the same `pnpm check` on pull requests so multiple agents can work on separate branches with automated gates — see root `README.md` and `AI.md` session `S006-quality-gates`.

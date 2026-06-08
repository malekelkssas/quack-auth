---
sidebar_position: 9
---

# Husky & quality gates

Local git hooks enforce formatting, linting, and TypeScript checks before every commit.

## Dependencies

Installed as root devDependencies (via `pnpm install` after clone):

- **husky** — git hooks (enabled by the `prepare` script)
- **lint-staged** — run formatters/linters only on staged files
- **@commitlint/cli** + **@commitlint/config-conventional** — conventional commit messages
- **prettier** + **eslint** — already part of the Nx ESLint setup

## Hooks

### `pre-commit` — `.husky/pre-commit`

```bash
pnpm exec lint-staged
pnpm run check
```

### `commit-msg` — `.husky/commit-msg`

```bash
pnpm exec commitlint --edit "$1"
```

Validates [Conventional Commits](https://www.conventionalcommits.org/) via `.commitlintrc.json` (`@commitlint/config-conventional`). Examples: `feat: …`, `fix: …`, `docs: …`, `test: …`, `chore: …`. See [Git branches & commits](./10-git-branches-commits.md).

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
pnpm ci             # check + build + BE API tests (same as CI job)
pnpm test:be        # BE API tests only (Jest + Supertest)
pnpm check          # lint + typecheck + format:check
pnpm build          # nx run-many -t build (FE, BE, DOCS, libs)
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

## CI (GitHub Actions)

Workflow: `.github/workflows/ci.yml` — runs on `push` to `main` and on pull requests (Node **22** in Actions — pnpm 11.5.2 needs **≥ 22.13**).

| Layer                 | Husky (local)                             | CI                                                                    |
| --------------------- | ----------------------------------------- | --------------------------------------------------------------------- |
| Auto-fix staged files | `lint-staged` (Prettier + ESLint `--fix`) | — (use `pnpm format` / `pnpm lint:fix` locally)                       |
| Verify full repo      | `pnpm check`                              | **`pnpm check`** (same)                                               |
| Production builds     | — (run manually or rely on CI)            | **`pnpm build`** — FE, BE, DOCS, `dtos`, `qu-constants` via `pnpm ci` |
| BE API tests          | — (run manually or rely on CI)            | **`pnpm nx test BE`** — in-memory Mongo + Supertest via `pnpm ci`     |

CI runs **`pnpm ci`** = `pnpm check` + **`pnpm build`** + **`pnpm nx test BE`**. Builds and tests are omitted from Husky pre-commit (too slow); CI catches broken compiles and API regressions.

CI does **not** re-run `lint-staged` (nothing is staged in Actions); `pnpm check` already includes `format:check`, `lint`, and `typecheck` on the whole tree.

### Planned (not enabled yet)

Add these steps to `.github/workflows/ci.yml` when ready — **do not forget**:

| When ready | Command              | Notes                                                                                           |
| ---------- | -------------------- | ----------------------------------------------------------------------------------------------- |
| **FE E2E** | `pnpm nx run FE:e2e` | Only if the suite is light enough for every PR; consider `nx affected` or a nightly job if slow |

### Generating / updating the workflow

The Developer scaffolded this workflow with:

```bash
pnpm nx generate ci-workflow --ci=github
```

Nx’s default tip uses `npx nx generate ci-workflow`, which fails here with `EBADDEVENGINES` — `npx` invokes **npm**, but this repo’s `devEngines.packageManager` requires **pnpm** 11.5.2. Always use **`pnpm nx …`** instead.

After generating (or regenerating), keep the main step as **`pnpm check`** to stay aligned with Husky — the stock generator may use `nx affected -t lint test build` instead.

## PR open change summary (Cursor agent)

Workflow: **`.github/workflows/pr-open-change-summary.yml`** (not the old “main change summary (email)” pattern).

| Trigger                          | Output                                                    |
| -------------------------------- | --------------------------------------------------------- |
| `pull_request` **`opened`** only | Appends an AI digest to the **PR description** (no email) |

Same **Cursor agent CLI** provider as the Developer’s main-branch digest workflow: lab tarball pin, `agent -p --trust --mode=ask`, read-only role prompt.

| Path                                                  | Purpose                                                  |
| ----------------------------------------------------- | -------------------------------------------------------- |
| `.github/ai-prompts/role-prompt-pr-change-summary.md` | PM-oriented digest structure (read-only)                 |
| `.github/scripts/append-pr-summary-to-body.py`        | Merges summary under `<!-- pr-change-summary:cursor -->` |
| `pr-open.diff`                                        | `base.sha…head.sha` diff (written in CI)                 |

### Secrets & variables

| Name                           | Required     | Notes                                                                                             |
| ------------------------------ | ------------ | ------------------------------------------------------------------------------------------------- |
| `CURSOR_API_KEY`               | Yes (for AI) | Actions secret — **configured** by the Developer in repo secrets; skip notice appended if missing |
| `CURSOR_SUMMARY_MODEL`         | No           | Repo variable (default `composer-2.5`)                                                            |
| `CURSOR_REVIEW_MODEL`          | No           | Fallback model variable                                                                           |
| `CURSOR_AGENT_PACKAGE_VERSION` | No           | Pinned lab build id                                                                               |
| `CURSOR_AGENT_PACKAGE_SHA256`  | No           | Must match tarball version                                                                        |

Runs **once per PR** when opened — not on every push/sync. Edit the description marker block manually if you need to regenerate.

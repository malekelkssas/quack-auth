---
sidebar_position: 10
---

# Git branches & commits (multi-chat)

One **Cursor chat** (Editor or Agents) maps to **one branch**. Keeps parallel agents from stepping on each other.

## Branch naming

```
quack-XX-<feature-slug>
```

| Part             | Meaning                                                                                   |
| ---------------- | ----------------------------------------------------------------------------------------- |
| `quack`          | Repo prefix                                                                               |
| `XX`             | Zero-padded sequence (`01`, `02`, …) — next free number after existing `quack-*` branches |
| `<feature-slug>` | Short kebab-case topic (`auth-login`, `husky-ci`)                                         |

### Start of every new chat (required)

1. List existing branches: `git branch -a | grep quack-`
2. Create the next branch — **do not** reuse another chat’s branch:

```bash
./scripts/next-quack-branch.sh <feature-slug>
# e.g. ./scripts/next-quack-branch.sh auth-login → quack-01-auth-login
```

Or manually:

```bash
git checkout -b quack-03-my-feature
```

Stay on that branch for the whole chat. Open a **new chat** → **new branch**.

## Commit messages (Conventional Commits)

Enforced by **commitlint** on `git commit` (Husky `commit-msg` hook).

Config: `.commitlintrc.json` extends `@commitlint/config-conventional`.

### Prefixes (examples)

| Type        | When                            |
| ----------- | ------------------------------- |
| `feat:`     | New feature                     |
| `fix:`      | Bug fix                         |
| `docs:`     | Documentation only              |
| `test:`     | Tests only                      |
| `chore:`    | Tooling, deps, CI, Husky        |
| `refactor:` | Code change without feature/fix |
| `ci:`       | CI workflow changes             |

```bash
feat: add greeting endpoint query validation
fix: map Zod serialization errors to 400
docs: document Husky and CI parity
test: add BE health check spec
chore: add commitlint and branch helper script
```

Body/footer optional; subject line is what commitlint checks first.

## Husky hooks (summary)

| Hook         | Runs                         |
| ------------ | ---------------------------- |
| `pre-commit` | `lint-staged` → `pnpm check` |
| `commit-msg` | `commitlint --edit`          |

See [09-husky-quality-gates](./09-husky-quality-gates.md) for lint/format/typecheck detail.

## Agents window

When using **Cursor Agents** with multiple chats/branches:

- **First action** in a new agent chat: create `quack-XX-<feature>` (script or manual).
- Log **session id**, **Cursor surface** (`Agents`), and **branch name** in `AI.md`.

---
sidebar_position: 2
---

# Documentation maintenance

When code or setup changes, update **this Docusaurus site** — not a root `docs/` folder.

## Invoke the docs maintainer

```
Use the docs-maintainer subagent to update docs for [change description]
```

## What to update

| Change                      | Update                                                                                          |
| --------------------------- | ----------------------------------------------------------------------------------------------- |
| New setup step              | `apps/DOCS/docs/setup/NN-*.md` + `08-docusaurus` if tooling changes                             |
| Husky / lint / CI           | `apps/DOCS/docs/setup/09-husky-quality-gates.md` + `intro.md`                                   |
| Git / commitlint            | `apps/DOCS/docs/setup/10-git-branches-commits.md`                                               |
| FE/BE/MongoDB behavior      | `apps/DOCS/docs/apps/frontend.md`, `apps/be/overview.md`, `apps/be/testing.md`, or `mongodb.md` |
| Mongoose domain layout      | `apps/DOCS/docs/setup/07-mongodb.md` + `apps/DOCS/docs/apps/mongodb.md`                         |
| DTO suffix / domain folders | `apps/DOCS/docs/setup/05-shared-libraries.md` + `.cursor/rules/project-conventions.mdc`         |
| Env / Docker                | `apps/DOCS/docs/setup/07-mongodb.md` + `.env.example`                                           |
| AI workflow                 | `apps/DOCS/docs/ai/*.md` + `AI.md`                                                              |

## Verify

```bash
pnpm nx build DOCS
pnpm nx serve DOCS
```

Fix broken links — `onBrokenLinks: 'throw'` in `docusaurus.config.ts`.

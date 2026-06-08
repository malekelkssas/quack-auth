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

| Change | Update |
|---|---|
| New setup step | `apps/DOCS/docs/setup/NN-*.md` + `08-docusaurus` if tooling changes |
| FE/BE/MongoDB behavior | `apps/DOCS/docs/apps/frontend.md`, `backend.md`, or `mongodb.md` |
| Env / Docker | `apps/DOCS/docs/setup/07-mongodb.md` + `.env.example` |
| AI workflow | `apps/DOCS/docs/ai/*.md` + `AI.md` |

## Verify

```bash
pnpm nx build DOCS
pnpm nx serve DOCS
```

Fix broken links — `onBrokenLinks: 'throw'` in `docusaurus.config.ts`.

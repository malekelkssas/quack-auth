---
sidebar_position: 8
---

# Docusaurus (DOCS app)

Documentation site powered by [Docusaurus](https://docusaurus.io/) in `apps/DOCS`.

## Dependencies

```bash
pnpm add -D @nx-extend/docusaurus @docusaurus/core @docusaurus/preset-classic @mdx-js/react clsx prism-react-renderer
pnpm approve-builds   # allow core-js postinstall in pnpm-workspace.yaml
```

## Generate (reference)

```bash
pnpm nx g @nx-extend/docusaurus:app DOCS --directory=apps --no-interactive
```

The generator may nest under `apps/apps/docs` — relocate to `apps/DOCS` and fix `project.json` paths if needed.

## Commands

```bash
pnpm nx serve DOCS    # http://localhost:4001
pnpm nx build DOCS
```

## Doc structure

```
apps/DOCS/docs/
├── intro.md
├── setup/          # Steps 01–08
├── apps/           # FE, BE & MongoDB
└── ai/             # AI policy & doc maintenance
```

When setup or app behavior changes, update the relevant page under `apps/DOCS/docs/` — use the **docs-maintainer** subagent (see AI → Maintenance).

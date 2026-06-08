---
sidebar_position: 1
---

# AI-first policy

AI assistance is **expected**. Reviewers evaluate judgement: what you generated, adapted, and did differently.

## Artifacts in this repo

| Artifact                  | Path                                           |
| ------------------------- | ---------------------------------------------- |
| Subagent                  | `.cursor/agents/ai-first-engineering.md`       |
| Policy skill              | `.cursor/skills/ai-first-engineering/SKILL.md` |
| Subagent delegation skill | `.cursor/skills/ai-first-subagent/SKILL.md`    |
| Session log               | `AI.md` (repo root)                            |

Invoke: `Use the ai-first-engineering subagent to [task]`

## AI.md entries

Each chat should log one **session id** (`S###-slug` — all entries from the same conversation share it), **Cursor surface** (`Editor` or `Agents`), **date**, **time**, **model** (full version, e.g. Composer 2.5), plus prompts that worked, fixes needed, and decisions vs AI defaults.

**Setup-first:** early repo work (through `S006-quality-gates` in `AI.md`) ran in the **Editor**; keep `apps/DOCS/docs/setup/` accurate. Parallel feature work should use the **Agents** window with separate chats/branches.

If Cursor **summarizes / compacts** chat context, log a **Chat summary** block — note what was carried forward and what may need re-reading.

See `AI.md` at the repo root for the full project log.

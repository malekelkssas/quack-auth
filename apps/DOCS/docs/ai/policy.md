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

Each chat should log one **session id** (`S###-slug` — all entries from the same conversation share it), **date**, **time**, **model**, plus prompts that worked, fixes needed, and decisions vs AI defaults.

If Cursor **summarizes / compacts** chat context, log a **Chat summary** block — note what was carried forward and what may need re-reading.

See `AI.md` at the repo root for the full project log.

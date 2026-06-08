---
name: ai-first-subagent
description: ALWAYS spawn the ai-first-engineering subagent or Task delegates with quack-auth policy. Use when delegating work, when the user invokes /create-subagent, or for any non-trivial multi-file/build/exploration task on this repo.
---

# AI-First Subagent

## Always delegate

For **any non-trivial task** on quack-auth (multi-file edits, builds, exploration, Docker, setup docs):

1. **Prefer** the project subagent: `Use the ai-first-engineering subagent to [task]`
2. **Or** use the Task tool with the preamble below

Do **not** handle scaffolding, verification, or multi-step implementation inline in the parent agent.

## Project subagent file

The Cursor subagent lives at **`.cursor/agents/ai-first-engineering.md`** (not in `skills/`).

```
Use the ai-first-engineering subagent to [task]
```

### Skill vs subagent (common mistake)

`/create-subagent` creates **`.cursor/agents/<name>.md`**. A file under `.cursor/skills/` is a **skill** (instructions), not a subagent. We initially only added `ai-first-subagent` as a skill — fixed by adding `.cursor/agents/ai-first-engineering.md`.

## Task tool fallback

When the custom subagent is unavailable, use **Task** with this preamble:

```
Follow the quack-auth AI-first engineering policy:
1. Read .cursor/skills/ai-first-engineering/SKILL.md if available.
2. Verify your work (build, tsc, or curl as appropriate).
3. Return: Model name, what you did, what you verified, what you changed vs default AI suggestions.
4. Do not commit unless explicitly asked.
```

## When to spawn

| Work | Delegate? |
|---|---|
| Multi-file feature / setup | **Always** |
| `pnpm nx build`, docker, curl verify | **Always** |
| Codebase exploration | **Always** |
| Single-line typo fix | Parent OK |

## Parent agent duties

After subagent completes:

1. **Synthesize** — confirm risky claims with a quick check.
2. **Update AI.md** — log **model**, delegation, outcome, overrides.
3. **Prefer parallel** — independent subagents in one message when possible.

## Anti-patterns

- Creating only a skill when user asked for `/create-subagent`
- Skipping verification when subagent reports "should work"
- Letting subagent commit without user request
- Omitting **Model** from AI.md session entries

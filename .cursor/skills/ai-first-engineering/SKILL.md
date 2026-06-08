---
name: ai-first-engineering
description: Applies quack-auth AI-first engineering policy—use AI as a force multiplier, verify output, document judgement in AI.md. ALWAYS delegate non-trivial work to the ai-first-engineering subagent. Use when scaffolding, generating boilerplate, using Cursor Agent, or when the user mentions AI.md, AI policy, or AI-assisted development.
---

# AI-First Engineering

## Policy (verbatim)

AI Usage Policy & Guidelines

We are looking for engineers who use AI as a force multiplier. AI assistance is not just permitted, it is expected.
What we are evaluating is the quality of your judgement on top of it: what you chose to generate, what you
adapted, and what you decided to do differently.

What good AI-first engineering looks like here:

- Use AI to move fast on scaffolding, boilerplate, and validation logic, then verify and own the output.
- Your AI.md should go beyond disclosure. Tell us which prompts worked well, where the output needed
fixing, and any decisions you made differently than what AI suggested.
- Speed is a signal. A strong candidate should complete this task in a few hours, not a few days.

## Agent workflow

1. **Always use the subagent** — for multi-file, build, or exploration work, delegate to `.cursor/agents/ai-first-engineering.md` (`Use the ai-first-engineering subagent to …`). Do not do that work inline in the parent session.
2. **Generate fast** — scaffolding, boilerplate, Zod schemas, tsconfig paths, filters, setup docs.
3. **Verify always** — run `pnpm nx build <project>`, `tsc --noEmit`, curl endpoints, check lints.
4. **Own deviations** — if you reject AI output, say why and implement the better approach.
5. **Update AI.md** — after meaningful sessions, append model, prompts, fixes, and decisions (not just "used AI").

## Skill vs subagent (do not mix up)

| Artifact | Path | Role |
|---|---|---|
| **Subagent** | `.cursor/agents/ai-first-engineering.md` | Cursor delegate with its own system prompt — created with `/create-subagent` |
| **Skill** | `.cursor/skills/ai-first-engineering/SKILL.md` | Policy + workflow instructions read by any agent |
| **Delegation skill** | `.cursor/skills/ai-first-subagent/SKILL.md` | Task-tool preamble when spawning built-in subagent types |

Early mistake: `/create-subagent` was implemented as a **skill only** (`ai-first-subagent`). That is not a Cursor subagent — subagents must live under `.cursor/agents/*.md`.

## What to generate with AI

| Good fit | Verify after |
|---|---|
| Nx lib/app scaffolding | build + path resolution |
| Zod DTOs + nestjs-zod wiring | HTTP request/response shapes |
| tsconfig path aliases | FE jsx + BE webpack compile |
| `docs/setup.md` steps | matches actual repo state |
| Exception filters | status codes + error body shape |
| Constants file layout | exports from `@shared/constants` |

## What to decide yourself

- Security-sensitive config (secrets stay in `.env`, never committed)
- Schema/type naming conventions (e.g. same-name Zod schema + type)
- Whether response validation errors should be 400 vs 500
- Monorepo path strategy (`baseUrl: "../.."` from workspace root)

## AI.md entry template

Append to project root `AI.md`. Use **local time** when the session started (`HH:MM`, 24-hour — stay consistent within the file).

```markdown
## [YYYY-MM-DD HH:MM] — <short title>

**Model** — e.g. Composer, Claude Opus 4.6, GPT-4.1 (parent and/or subagent)

**Prompts that worked**
- ...

**Output that needed fixing**
- ...

**Decisions different from AI**
- ...

**Verified**
- [ ] build / test commands run
```

## Related

- **Cursor subagent:** `.cursor/agents/ai-first-engineering.md` — invoke with `Use the ai-first-engineering subagent to …`
- **Delegation skill:** [ai-first-subagent](../ai-first-subagent/SKILL.md) — Task-tool preamble for spawned agents
- Setup reference: [docs/setup.md](../../../docs/setup.md)

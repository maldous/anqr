# Memory

## Recent Work

### Basher Rule Hardening (2026-04)

**Problem:** Native Freebuff sessions repeatedly attempted to spawn `basher` with missing or malformed `params.command`, often using natural-language task descriptions instead of exact shell commands.

**Observed failure mode:** `Invalid params for agent basher: expected string, received undefined`

**Hardening applied in docs:**

1. `knowledge.md` now includes a mandatory basher session-start contract, refusal rules, and a self-test payload.
2. `AGENTS.md` now requires agents to read `knowledge.md` and prefer `run_terminal_command` for direct shell actions.
3. `CODEBUFF.md` and `CLAUDE.md` now include a fresh-session checklist and the same basher self-test.
4. `README.md` handover contract now includes `knowledge.md` / `MEMORY.md` in the AI read order and requires a basher self-test before delegated work.

**Working rule:** Basher is a command runner, not a task-description agent. If the exact shell command is unknown, do not spawn `basher`.

# CODEBUFF.md

Read order:

1. [AGENTS.md](/home/user/src/anqr/AGENTS.md) — execution rules
2. [.agents/SPAWN_AGENTS_GUIDE.md](/home/user/src/anqr/.agents/SPAWN_AGENTS_GUIDE.md) — spawn_agents reference (agent types, required params, basher pitfalls)
3. [README.md](/home/user/src/anqr/README.md) — bootstrap truth and scope
4. [docs/README.md](/home/user/src/anqr/docs/README.md) — documentation index
5. [docs/harness/00-index.md](/home/user/src/anqr/docs/harness/00-index.md) — harness doctrine
6. [knowledge.md](/home/user/src/anqr/knowledge.md) — persistent local rules
7. [MEMORY.md](/home/user/src/anqr/MEMORY.md) — recent durable memory

## Native Freebuff startup checklist

Before real work in a fresh session:

1. read `AGENTS.md`
2. read `knowledge.md`
3. load the permanent basher rule
4. produce one valid basher payload example
5. prefer `run_terminal_command` for direct shell actions
6. do not spawn `basher` until the exact shell command is known

**Basher self-test:**

```json
{ "agent_type": "basher", "params": { "command": "pwd" } }
```

If this cannot be produced exactly, do not use `basher` in that session.

## Harness Context

ANQR uses an **all-in-one Symphony Bridge** architecture (ADR-0003) where each worktree-local bridge provides:

- AI completion (`/v1/chat/completions`) with provider cascade
- Codebuff SDK operations (tool use, code edits, file operations)
- Worktree-isolated execution via systemd `WorkingDirectory`

**Agent router:** port 4319 (control-plane, routes to worktree bridges)
**Worktree bridges:** ports 4321-4328 (wt1-wt8, isolated per worktree)

There is no standalone Codebuff bridge service in the active design.

### Worktree execution environment (OPERATIONAL as of 2026-03-31)

Symphony runner supports concurrent execution via git worktrees with **8 concurrent worktrees** (fully validated through Phase 0-8):

**Symphony worktrees (wt1-wt4):** Handle Linear issues and general Symphony work
**Discord worktrees (wt5-wt8):** Handle ONLY Discord-sourced issues (prevents conflicts)

- Each runner instance operates in an isolated worktree directory (e.g., `/home/user/src/anqr-wt1`, `/home/user/src/anqr-wt2`)
- Environment variables: `ANQR_WORKTREE_ID` (e.g., `wt1`, `wt2`, ..., `wt8`, or `main`) and `ANQR_WORKTREE_PATH`
- Each worktree uses a unique branch (`symphony/wt1`, `symphony/wt2`, ..., `symphony/wt8`) tracking `origin/main`
- `harness/ops/orchestration/symphony-runner.mjs` refuses to run from the main repository without worktree context
- Worktrees sync with `origin/main` before each issue execution: `git fetch origin main && git merge origin/main --ff-only`
- Shared state (`$XDG_RUNTIME_DIR/anqr-symphony-state/state.json`) uses file-based locking for atomicity
- Lease system prevents concurrent work on the same Linear issue
- Source-based routing is enforced: `wt1`-`wt4` handle non-Discord work, `wt5`-`wt8` handle Discord-sourced work
- Linear issues created by linear-guardian are automatically marked with `source: "linear"` for proper routing
- When Discord interactions create Linear issues, they MUST be marked with `source: "discord"` via patchIssueState()
- **Isolation verified:** All 6 defense layers validated (config routing, router cwd rebasing, systemd WorkingDirectory, process cwd, Codebuff client isolation, file operations)
- **Concurrency enforced:** Max 8 concurrent operations (4 Symphony + 4 Discord), 429 overflow tested
- **7 ports listening:** 4319 (main bridge), 4325-4328 (worktree bridges), 18789 (gateway), 18790 (router)
- Documentation: `docs/harness/12-concurrent-execution-with-worktrees.md`, `docs/harness/WORKTREE-QUICKSTART.md`

### Key modules (all under `harness/ops/integrations/model/`)

- `symphony-openai-bridge.mjs` — AI SDK bridge with tool execution, provider fallback, streaming
- `symphony-credit-gate.mjs` — 4-tier provider selection (paid → free-cloud → local-proxy → local-safety-net)
- `symphony-adaptive-context.mjs` — dynamic per-provider token ceilings, rate-limit throttling, TPM/RPM tracking
- `symphony-bridge-truncation.mjs` — static token limits and message truncation
- `codebuff-direct.mjs` — Codebuff SDK execution (runs inside each worktree-local bridge)
- `symphony-agent-router.mjs` — Control-plane router for worktree-local bridges

### Bridge contract

- `symphony-openai-bridge.mjs` returns `_symphonyResult` in completion payloads
- `codebuff-direct.mjs` returns `_symphonyResult` when invoked from within a worktree bridge
- `harness/ops/runtime/symphony/symphony-agent.mjs` consumes `_symphonyResult` directly and falls back to inference only when necessary
- Symphony bridge requests use a 15-minute request timeout for long-running turns
- Codex SDK execution through Symphony defaults to `CODEX_SANDBOX_MODE=danger-full-access` unless explicitly overridden

### Native context usage

- Prefer `read_docs` for framework/library questions before `web_search`
  - ANQR routes this through the local Context7 service on port `4320` first
- Prefer `search_linear_issues` when prior ANQR issue context, regressions, or historical decisions are relevant
  - ANQR routes this through the local Linear RAG index instead of hitting the Linear API on every request
- Prefer `find_files` or `file_search` for repository discovery before broad `code_search`
  - `find_files` uses hybrid BM25 + semantic retrieval backed by the local RAG stack when available
  - `file_search` is the compatibility wrapper that routes to exact or natural-language retrieval as appropriate
- Use `code_search` after retrieval narrows the likely files or symbols

This is the intended fast path for Codex and bridge-routed agents.

### Adaptive context system

The bridge dynamically adjusts per-provider context limits at runtime:

- **413/context errors** → shrink provider's token ceiling (precise ratio or 25% flat)
- **429/rate-limit** → throttle provider with backoff timer from headers
- **Stream errors** → fatal stream errors (part.type === "error") are classified and thrown after the stream completes to trigger adaptive recording + provider fallback
- **Consecutive successes** → slowly expand ceiling back toward base (5% per 3-success cycle)
- **Sticky sessions** → cleared immediately on provider failure so concurrent requests don't retry broken providers

### Bridge restart procedure (CRITICAL)

**⚠️ WARNING: Never restart bridges during active concurrent requests — data loss will occur.**

**Procedure:**

1. **STOP TASK EXECUTION FIRST:**

   ```bash
   node harness/ops/orchestration/symphony-control.mjs --stop
   ```

   - **CRITICAL:** This must be the FIRST step before any other actions
   - Disables all 4 Symphony runner timers (wt1-wt4) to prevent new tasks from starting
   - Shows "🛑 STOPPED - no new tasks will be picked up" status

2. **Check concurrent runner status**: `node harness/ops/orchestration/symphony-runner.mjs --status`
   - Verify all worktree runners are idle (no active leases)

3. **Wait for zero concurrency**: Check Discord for "(0 concurrent)" or verify all locks released

4. **Commit & push first**: `git add -A && git commit -m "..." && git push`

5. **Restart bridge**: `systemctl --user restart anqr-symphony-bridge` (and/or worktree instances)

6. **RESTART TASK EXECUTION:**

   ```bash
   node harness/ops/orchestration/symphony-control.mjs --start
   ```

   - **CRITICAL:** Must restart task execution after bridge restart
   - Re-enables all 4 Symphony runner timers (wt1-wt4)
   - Shows "✅ RUNNING - new tasks will be picked up" status
   - Without this step, the system remains stopped and no work will be processed

7. **Update MEMORY.md** with stop/start entries, then commit & push again

**CRITICAL: Don't forget steps 1 and 6!** Skipping these will cause data loss or leave the system permanently disabled.

### Validation commands

For harness work:

```bash
npx vitest run harness/ops/integrations/model/symphony-adaptive-context.spec.ts
npx vitest run harness/ops/integrations/model/symphony-bridge-truncation.spec.ts
npx vitest run harness/ops/integrations/model/symphony-credit-gate.spec.ts
npx vitest run harness/ops/integrations/model/symphony-openai-bridge-fallback.spec.ts
```

For product work:

```bash
npm run typecheck:all
npm run lint:all
npm run test:unit
```

### Agent spawning

See [.agents/SPAWN_AGENTS_GUIDE.md](/home/user/src/anqr/.agents/SPAWN_AGENTS_GUIDE.md) for the full reference on `spawn_agents` usage, including:

- All agent types and their required/optional params
- The #1 error: basher `params.command` must be a non-empty string
- Common pitfalls (empty params, wrong types, editor doesn't take prompt)
- Working examples for every agent type

**Extra native Freebuff rule:** basher is a command runner, not a task-description agent. Never send natural-language task text as the basher command. Prefer `run_terminal_command` for direct shell actions.

The Symphony bridge `spawn_agents` tool is **acknowledgment-only** — it delegates to the parent Codebuff/OpenClaw instance and does not spawn agents itself.

### Queue behavior

- The runner self-feeds the queue after issue completion
- `anqr-queue-feeder.timer` is a safety-net maintenance loop, not the primary feeder
- Queue feed/drain decisions use `readyDepth` (Todo-only depth), not aggregate queue depth including `In Progress`

### Worktree operations

**Check status of all worktrees:**

```bash
node harness/ops/orchestration/symphony-runner.mjs --status
```

**View worktree pool health:**

```bash
node harness/ops/orchestration/symphony-worktree-pool.mjs status
```

**Emergency worktree repair:**

```bash
node harness/ops/orchestration/symphony-worktree-pool.mjs repair
```

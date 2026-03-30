# CODEBUFF.md

Read order:

1. [AGENTS.md](/home/user/src/anqr/AGENTS.md) — execution rules
2. [README.md](/home/user/src/anqr/README.md) — bootstrap truth and scope
3. [docs/README.md](/home/user/src/anqr/docs/README.md) — documentation index
4. [docs/harness/00-index.md](/home/user/src/anqr/docs/harness/00-index.md) — harness doctrine

## Harness Context

ANQR uses a Symphony Bridge (port 4319) and Codebuff Bridge (port 4318) as OpenAI-compatible gateways. Both run as user-level systemd services.

### Worktree execution environment

Symphony runner supports concurrent execution via git worktrees. When enabled:

- Each runner instance operates in an isolated worktree directory (e.g., `/home/user/src/anqr-wt1`, `/home/user/src/anqr-wt2`)
- Environment variables: `ANQR_WORKTREE_ID` (e.g., `wt1`, `wt2`) and `ANQR_WORKTREE_PATH`
- Each worktree uses a unique branch (`symphony/wt1`, `symphony/wt2`) tracking `origin/main`
- `scripts/ops/orchestration/symphony-runner.mjs` refuses to run from the main repository without worktree context
- Worktrees sync with `origin/main` before each issue execution
- Shared state (`reports/symphony/state.json`) uses file-based locking for atomicity
- Lease system prevents concurrent work on the same Linear issue
- Source-based routing is enforced: `wt1`-`wt4` handle non-Discord work, `wt5`-`wt8` handle Discord-sourced work
- Linear issues created by linear-guardian are automatically marked with `source: "linear"` for proper routing
- When Discord interactions create Linear issues, they MUST be marked with `source: "discord"` via patchIssueState()
- Documentation: `docs/harness/12-concurrent-execution-with-worktrees.md`, `docs/harness/WORKTREE-QUICKSTART.md`

### Key modules (all under `scripts/ops/integrations/model/`)

- `symphony-openai-bridge.mjs` — AI SDK bridge with tool execution, provider fallback, streaming
- `symphony-credit-gate.mjs` — 4-tier provider selection (paid → free-cloud → local-proxy → local-safety-net)
- `symphony-adaptive-context.mjs` — dynamic per-provider token ceilings, rate-limit throttling, TPM/RPM tracking
- `symphony-bridge-truncation.mjs` — static token limits and message truncation
- `codebuff-openai-bridge.mjs` — Codebuff SDK exposed as OpenAI-compatible HTTP

### Bridge contract

- Both `symphony-openai-bridge.mjs` and `codebuff-openai-bridge.mjs` return `_symphonyResult` in their completion payloads
- `scripts/ops/runtime/symphony/symphony-agent.mjs` consumes `_symphonyResult` directly and falls back to inference only when necessary
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
   node scripts/ops/orchestration/symphony-control.mjs --stop
   ```
   - **CRITICAL:** This must be the FIRST step before any other actions
   - Disables all Symphony runner timers to prevent new tasks from starting

2. **Check concurrent runner status**: `node scripts/ops/orchestration/symphony-runner.mjs --status`

3. **Wait for zero concurrency**: Check Discord for "(0 concurrent)"

4. **Commit & push first**: `git add -A && git commit -m "..." && git push`

5. **Restart bridge**: `systemctl --user restart anqr-symphony-bridge` or `anqr-codebuff-bridge`

6. **RESTART TASK EXECUTION:**
   ```bash
   node scripts/ops/orchestration/symphony-control.mjs --start
   ```
   - **CRITICAL:** Must restart task execution after bridge restart
   - Without this step, the system remains stopped and no work will be processed

7. **Update MEMORY.md** with stop/start entries, then commit & push again

**CRITICAL: Don't forget steps 1 and 6!** Skipping these will cause data loss or leave the system permanently disabled.

### Validation commands

For harness work:

```bash
npx vitest run scripts/ops/integrations/model/symphony-adaptive-context.spec.ts
npx vitest run scripts/ops/integrations/model/symphony-bridge-truncation.spec.ts
npx vitest run scripts/ops/integrations/model/symphony-credit-gate.spec.ts
npx vitest run scripts/ops/integrations/model/symphony-openai-bridge-fallback.spec.ts
```

For product work:

```bash
npm run typecheck:all
npm run lint:all
npm run test:unit
```

### Queue behavior

- The runner self-feeds the queue after issue completion
- `anqr-queue-feeder.timer` is a safety-net maintenance loop, not the primary feeder
- Queue feed/drain decisions use `readyDepth` (Todo-only depth), not aggregate queue depth including `In Progress`

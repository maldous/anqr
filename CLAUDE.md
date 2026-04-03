# CLAUDE.md

Read order:

1. [AGENTS.md](/home/user/src/anqr/AGENTS.md) — execution rules
2. [README.md](/home/user/src/anqr/README.md) — bootstrap truth and scope
3. [docs/README.md](/home/user/src/anqr/docs/README.md) — documentation index
4. [docs/harness/00-index.md](/home/user/src/anqr/docs/harness/00-index.md) — harness doctrine

## Harness Context

ANQR uses an **all-in-one Symphony Bridge** architecture (ADR-0003) where each bridge provides:

- AI completion (`/v1/chat/completions`) with provider cascade
- Codebuff SDK operations (tool use, code edits, file operations)
- Worktree-isolated execution via systemd `WorkingDirectory`

**Agent router:** port 4319 (control plane, routes requests to worktree bridges)
**Worktree bridges:** ports 4321-4328 (wt1-wt8, isolated per worktree)

### Worktree execution environment (OPERATIONAL as of 2026-03-31)

Symphony runner supports concurrent execution via git worktrees with **8 concurrent worktrees** (fully validated through Phase 0-8):

**Symphony worktrees (wt1-wt4):** Handle Linear issues and general Symphony work
**Discord worktrees (wt5-wt8):** Handle ONLY Discord-sourced issues (prevents conflicts)

- Each runner instance operates in an isolated worktree directory (e.g., `/home/user/src/anqr-wt1`, `/home/user/src/anqr-wt2`)
- Environment variables: `ANQR_WORKTREE_ID` (e.g., `wt1`, `wt2`, ..., `wt8`, or `main`) and `ANQR_WORKTREE_PATH`
- Each worktree uses a unique branch (`symphony/wt1`, `symphony/wt2`, ..., `symphony/wt8`) tracking `origin/main`
- **Issue routing:** Issues are automatically routed based on their `source` field in state.json:
  - Discord issues (`source: "discord"`) → wt5-wt8 only
  - All other issues → wt1-wt4, main only
- **Worktree sync workflow:**
  - Before each issue: `git fetch origin main && git merge origin/main --ff-only` (brings in all pushed work from other worktrees)
  - After commit: `git push origin HEAD:main` (makes work immediately available to other worktrees)
  - **CRITICAL:** Work from other worktrees is only visible AFTER it's pushed to `origin/main`
  - **CRITICAL:** Always push completed work immediately to enable other worktrees to build on it
- Shared state (`$XDG_RUNTIME_DIR/anqr-symphony-state/state.json`) uses file-based locking for atomicity
- Lease system prevents concurrent work on the same Linear issue
- **Isolation verified:** All 6 defense layers validated (config routing, router cwd rebasing, systemd WorkingDirectory, process cwd, Codebuff client isolation, file operations)
- **Concurrency enforced:** Max 8 concurrent operations (4 Symphony + 4 Discord), 429 overflow tested
- **7 ports listening:** 4319 (main bridge), 4325-4328 (worktree bridges), 18789 (gateway), 18790 (router)
- Documentation: `docs/harness/12-concurrent-execution-with-worktrees.md`, `docs/harness/WORKTREE-QUICKSTART.md`

**Initial setup (one-time):**

```bash
# 1. Initialize all 8 worktrees
node scripts/ops/orchestration/symphony-worktree-pool.mjs init 8

# 2. Verify creation
node scripts/ops/orchestration/symphony-worktree-pool.mjs status

# 3. Enable all runners
node scripts/ops/orchestration/symphony-control.mjs --start

# 4. Verify runners are active
systemctl --user list-timers | grep symphony
```

**Daily operations:**

```bash
# Check runner status
node scripts/ops/orchestration/symphony-runner.mjs --status

# Check queue depth
node scripts/ops/orchestration/symphony-queue-control.mjs --check

# Stop all runners (before bridge restart)
node scripts/ops/orchestration/symphony-control.mjs --stop

# Start all runners (after bridge restart)
node scripts/ops/orchestration/symphony-control.mjs --start
```

### Key modules (all under `scripts/ops/integrations/model/`)

- `symphony-openai-bridge.mjs` — AI SDK bridge with tool execution, provider fallback, streaming
- `symphony-credit-gate.mjs` — 4-tier provider selection (paid → free-cloud → local-proxy → local-safety-net)
- `symphony-adaptive-context.mjs` — dynamic per-provider token ceilings, rate-limit throttling, TPM/RPM tracking
- `symphony-bridge-truncation.mjs` — static token limits and message truncation
- `codebuff-direct.mjs` — Codebuff SDK execution (runs inside each worktree-local bridge)
- `symphony-agent-router.mjs` — Control-plane router for worktree-local bridges

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

5. **Restart bridge**: `systemctl --user restart anqr-symphony-bridge` (and/or worktree instances)

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

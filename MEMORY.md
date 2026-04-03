# Memory

## Recent Work

### Worktree Concurrency Fix (2025-07)

**Problem:** Multiple symphony executors (wt1-wt8) running validation simultaneously spawned dozens of parallel vitest/typecheck processes, exhausting system resources and crashing the host.

**Root cause:** Each executor's `runValidation()` call in `symphony-validation.mjs` spawned its own vitest and tsc process. With 8 executors + 4 linear runners active, this created 12+ concurrent vitest processes, each consuming significant memory.

**Fix (3 layers):**

1. **vitest.config.ts** — Set `fileParallelism: false`, `maxWorkers: 1`, `minWorkers: 1` to run tests sequentially on a single worker within each vitest process.
2. **symphony-validation.mjs** — Wrapped vitest and typecheck commands with `flock -w 120` file locks (`/tmp/anqr-vitest.lock`, `/tmp/anqr-typecheck.lock`) so only one instance runs system-wide at a time, even across worktrees. Bumped timeouts from 120s → 240s to account for lock wait time.
3. **lefthook.yml** — Added `ANQR_AUTOMATION_COMMIT=1` / `ANQR_AUTOMATION_PUSH=1` env guards to skip pre-commit/pre-push hooks during automation commits.

**Related changes:**

- Runner pushes to `origin/symphony/wtN` branches instead of `origin/main`
- New `symphony-integrator.mjs` service serially promotes worktree branches to main
- Bridge no longer pushes to main (`finalizeWorktreeRequest` replaces `pushWorktreeToMain`)
- Finalization state tracking in `symphony-state.mjs` (commit_failed_repairable, integration_pending, etc.)
- Sticky repair: failed issues stay assigned to the same worktree for retry

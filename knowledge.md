# Knowledge

## Best Practices

Always test code

### Validation Concurrency

- **Vitest runs single-threaded:** `vitest.config.ts` sets `fileParallelism: false`, `maxWorkers: 1`, `minWorkers: 1`. Never increase these — the host cannot handle parallel vitest workers across 8 worktrees.
- **flock serialization:** Heavy validation commands (vitest, typecheck) are wrapped with `flock -w 120 9 ... 9>/tmp/anqr-*.lock` in `symphony-validation.mjs`. This ensures only one vitest or typecheck process runs system-wide at a time, even when multiple executors trigger validation simultaneously.
- **Lock files:** `/tmp/anqr-vitest.lock` and `/tmp/anqr-typecheck.lock` are the global serialization points. Do not delete these while executors are running.
- **Timeout budget:** Validation timeouts are 240s (120s lock wait + 120s execution). If you see timeout failures, check whether another executor is holding the lock.

### Git Automation Hooks

- `ANQR_AUTOMATION_COMMIT=1` skips pre-commit hooks (oxlint, typecheck, cspell, ast-density) in `lefthook.yml`.
- `ANQR_AUTOMATION_PUSH=1` skips pre-push hooks (typecheck) in `lefthook.yml`.
- These are set in `anqr-symphony-executor@.service` so automation commits bypass expensive hooks that validation already ran.

### Worktree Branch Strategy

- Executors push to `origin/symphony/wtN` branches, never to `origin/main`.
- The single `symphony-integrator` service serially promotes queued branches to main.
- Failed commits/pushes stay attached to the same worktree (sticky repair) via finalization state in `symphony-state.mjs`.

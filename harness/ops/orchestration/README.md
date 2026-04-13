# Orchestration

## Purpose
Directory for serial integration back into the main repository; immediate files include `analyze-worktree-benchmark.mjs`, `latency-report.mjs`, `nightly-ops-pass.mjs`, `reset-queue.mjs`, and others, with child directories `analyze-worktree-benchmark/`, `latency-report/`, `linear-reconciler/`, `nightly-ops-pass/`, and others.

## Contents
- 11 immediate files
- 10 child directories

## Key Files
- `analyze-worktree-benchmark.mjs` - JavaScript/TypeScript module used by this directory.
- `latency-report.mjs` - JavaScript/TypeScript module used by this directory.
- `nightly-ops-pass.mjs` - JavaScript/TypeScript module used by this directory.
- `reset-queue.mjs` - JavaScript/TypeScript module used by this directory.
- `symphony-control.mjs` - JavaScript/TypeScript module used by this directory.
- `symphony-integrator.mjs` - JavaScript/TypeScript module used by this directory.
- `symphony-queue-control.mjs` - JavaScript/TypeScript module used by this directory.
- `symphony-worktree-pool.mjs` - JavaScript/TypeScript module used by this directory.
- `symphony-worktree-pool.mjs.d.ts` - Type declaration file for the sibling module surface.
- `symphony-worktree-pool.spec.ts` - Mock node modules
- `symphony-worktree-recovery.mjs` - JavaScript/TypeScript module used by this directory.

## Subdirectories
- `analyze-worktree-benchmark/` - Directory for git worktree management and concurrency support; immediate files include `compare-benchmarks.mjs`, `dirname.mjs`, `evidence-dir.mjs`, `extract-benchmark-metrics.mjs`, and others.
- `latency-report/` - Directory for runtime service bootstrap or environment support; immediate files include `acceptable-ms.mjs`, `classify-latency.mjs`, `format-duration.mjs`, `generate-report.mjs`, and others.
- `linear-reconciler/` - Directory for Linear ingestion, reconciliation, or issue management; immediate files include `compute-reconciliation-actions.mjs`, `get-healthy-linear-capacity.mjs`, `index.mjs`, `logger.mjs`, and others, with child directories `compute-reconciliation-actions/`, `get-healthy-linear-capacity/`, `logger/`, `run-reconciliation-cycle/`.
- `nightly-ops-pass/` - Directory for runtime service bootstrap or environment support; immediate files include `archive-report.mjs`, `dirname.mjs`, `dry-run-flag.mjs`, `dry-run.mjs`, and others.
- `symphony-control/` - Directory for runtime service bootstrap or environment support; immediate files include `disable-all-timers.mjs`, `enable-all-timers.mjs`, `get-enabled-timers.mjs`, `get-timer-status.mjs`, and others.
- `symphony-integrator/` - Directory for serial integration back into the main repository; immediate files include `find-issue-by-identifier.mjs`, `git.mjs`, `index.mjs`, `integrate-candidate.mjs`, and others, with child directories `integrate-candidate/`.
- `symphony-queue-control/` - Directory for runtime service bootstrap or environment support; immediate files include `actions.mjs`, `count-enabled-timers.mjs`, `detect-stuck-work.mjs`, `drain-overflow.mjs`, and others.
- `symphony-runner/` - Directory for Discord ingress, delivery, or notification support; immediate files include `acquire-lock.mjs`, `auto-detected-worktree-id.mjs`, `classify-provider-failure.mjs`, `current-branch-name-for-runner.mjs`, and others, with child directories `sync-worktree-before-validation/`.
- `symphony-worktree-pool/` - Directory for git worktree management and concurrency support; immediate files include `cleanup-worktree-pool.d.ts`, `cleanup-worktree-pool.mjs`, `create-worktree.d.ts`, `create-worktree.mjs`, and others.
- `symphony-worktree-recovery/` - Directory for fleet recovery, quarantine, and health enforcement; immediate files include `all-worktree-ids.mjs`, `attempt-cspell-auto-fix.mjs`, `check-baseline-health.mjs`, `check-quarantined-for-reprovisioning.mjs`, and others, with child directories `execute-repair/`.

## Operational Notes
- Current on-disk inventory: 11 immediate files and 10 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus
Check whether ownership, timing, and state transitions in this directory stay consistent with the harness concurrency and integration model.

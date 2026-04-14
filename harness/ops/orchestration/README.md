# Orchestration

## Purpose

Long-running control-loop surface for scheduling, queue control, worktree execution, integration, reconciliation, recovery, and fleet measurement.

## Contents

- 11 immediate files
- 11 child directories

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
- `symphony-worktree-pool.spec.ts` - JavaScript/TypeScript module used by this directory.
- `symphony-worktree-recovery.mjs` - JavaScript/TypeScript module used by this directory.

## Subdirectories

- `analyze-worktree-benchmark/` - Analyze Worktree Benchmark scope; immediate files include `compare-benchmarks.mjs`, `dirname.mjs`, `evidence-dir.mjs`, `extract-benchmark-metrics.mjs`, and others.
- `latency-report/` - Latency Report scope; immediate files include `acceptable-ms.mjs`, `classify-latency.mjs`, `format-duration.mjs`, `generate-report.mjs`, and others.
- `linear-reconciler/` - Linear Reconciler scope; immediate files include `compute-reconciliation-actions.mjs`, `get-healthy-linear-capacity.mjs`, `index.mjs`, `logger.mjs`, and others; child directories include `compute-reconciliation-actions/`, `get-healthy-linear-capacity/`, `logger/`, `run-reconciliation-cycle/`.
- `nightly-ops-pass/` - Nightly Ops Pass scope; immediate files include `archive-report.mjs`, `dirname.mjs`, `dry-run-flag.mjs`, `dry-run.mjs`, and others.
- `symphony-control/` - Symphony Control scope; immediate files include `disable-all-timers.mjs`, `enable-all-timers.mjs`, `get-enabled-timers.mjs`, `get-timer-status.mjs`, and others.
- `symphony-integrator/` - Symphony Integrator scope; immediate files include `find-issue-by-identifier.mjs`, `git.mjs`, `index.mjs`, `integrate-candidate.mjs`, and others; child directories include `integrate-candidate/`.
- `symphony-queue-control/` - Symphony Queue Control scope; immediate files include `actions.mjs`, `count-enabled-timers.mjs`, `detect-stuck-work.mjs`, `drain-overflow.mjs`, and others.
- `symphony-runner/` - Symphony Runner scope; immediate files include `acquire-lock.mjs`, `auto-detected-worktree-id.mjs`, `classify-provider-failure.mjs`, `current-branch-name-for-runner.mjs`, and others; child directories include `sync-worktree-before-validation/`.
- `symphony-scheduler/` - Symphony Scheduler scope; immediate files include `drain-desired-work.mjs`, `get-eligible-work.mjs`, `index.mjs`, `logger.mjs`, and others.
- `symphony-worktree-pool/` - Symphony Worktree Pool scope; immediate files include `cleanup-worktree-pool.d.ts`, `cleanup-worktree-pool.mjs`, `create-worktree.d.ts`, `create-worktree.mjs`, and others.
- `symphony-worktree-recovery/` - Symphony Worktree Recovery scope; immediate files include `all-worktree-ids.mjs`, `check-baseline-health.mjs`, `check-quarantined-for-reprovisioning.mjs`, `classify-worktree.mjs`, and others; child directories include `execute-repair/`.

## Operational Notes

- Current on-disk inventory: 11 immediate file(s) and 11 child directories.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus

Check that the current implementation in this directory still matches its intended role in the harness architecture.

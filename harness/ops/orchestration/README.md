# ANQR Orchestration

## 1. Directory Overview

This directory implements **ANQR Orchestration** within the ANQR harness. Key immediate entries include `symphony-worktree-pool.spec.ts`, `symphony-worktree-recovery.mjs`, `symphony-worktree-pool.mjs`, `symphony-queue-control.mjs`. The current inventory is 12 non-README files and 9 subdirectories.

## 2. File Summaries

### Files

- **analyze-worktree-benchmark.mjs** - Facade module that re-exports public members from `./analyze-worktree-benchmark/index.mjs`, `./analyze-worktree-benchmark/runtime.mjs`.
- **latency-report.mjs** - Facade module that re-exports public members from `./latency-report/index.mjs`, `./latency-report/runtime.mjs`.
- **nightly-ops-pass.mjs** - Facade module that re-exports public members from `./nightly-ops-pass/index.mjs`, `./nightly-ops-pass/runtime.mjs`.
- **reset-queue.mjs** - Module that implements reset queue.
- **symphony-control.mjs** - Facade module that re-exports public members from `./symphony-control/index.mjs`, `./symphony-control/runtime.mjs`.
- **symphony-integrator.mjs** - Facade module that re-exports public members from `./symphony-integrator/index.mjs`, `./symphony-integrator/runtime.mjs`.
- **symphony-queue-control.mjs** - Facade module that re-exports public members from `./symphony-queue-control/index.mjs`, `./symphony-queue-control/runtime.mjs`.
- **symphony-runner.mjs** - Facade module that re-exports public members from `./symphony-runner/index.mjs`, `./symphony-runner/runtime.mjs`.
- **symphony-worktree-pool.mjs** - Facade module that re-exports public members from `./symphony-worktree-pool/index.mjs`, `./symphony-worktree-pool/runtime.mjs`.
- **symphony-worktree-pool.mjs.d.ts** - Facade module that re-exports public members from `./symphony-worktree-pool/index.d.ts`.
- **symphony-worktree-pool.spec.ts** - Module that implements symphony worktree pool.spec.
- **symphony-worktree-recovery.mjs** - Facade module that re-exports public members from `./symphony-worktree-recovery/index.mjs`, `./symphony-worktree-recovery/runtime.mjs`.

### Subdirectories

- **analyze-worktree-benchmark/** - Contains **ANQR Worktree Benchmark Analysis**; it contains a runtime-oriented module set with helper files, `main.mjs`, and `runtime.mjs` and has 0 child directories.
- **latency-report/** - Contains **ANQR Latency Report**; it contains a runtime-oriented module set with helper files, `main.mjs`, and `runtime.mjs` and has 0 child directories.
- **nightly-ops-pass/** - Contains **ANQR Nightly Operations Pass**; it contains a runtime-oriented module set with helper files, `main.mjs`, and `runtime.mjs` and has 0 child directories.
- **symphony-control/** - Contains **ANQR Symphony Control**; it contains a runtime-oriented module set with helper files, `main.mjs`, and `runtime.mjs` and has 0 child directories.
- **symphony-integrator/** - Contains **ANQR Symphony Integrator**; it contains 14 immediate files and has 0 child directories.
- **symphony-queue-control/** - Contains **ANQR Queue Control**; it contains a runtime-oriented module set with helper files, `main.mjs`, and `runtime.mjs` and has 0 child directories.
- **symphony-runner/** - Contains **ANQR Symphony Runner**; it contains a runtime-oriented module set with helper files, `main.mjs`, and `runtime.mjs` and has 0 child directories.
- **symphony-worktree-pool/** - Contains **ANQR Symphony Worktree Pool**; it contains 21 immediate files and has 0 child directories.
- **symphony-worktree-recovery/** - Contains **ANQR Worktree Recovery**; it contains 17 immediate files and has 0 child directories.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory include Symphony integration, and git/worktree awareness.

## 4. Usage Instructions

```bash
npx tsx ops/orchestration/symphony-worktree-pool.mjs.d.ts
npx tsx ops/orchestration/symphony-worktree-pool.spec.ts
```

## 5. Dependencies

- **External packages/services referenced in immediate code** - `vitest`
- **Internal relative modules** - `../linear-client.mjs`, `../symphony-state.mjs`, `./analyze-worktree-benchmark/index.mjs`, `./analyze-worktree-benchmark/runtime.mjs`, `./latency-report/index.mjs`, `./latency-report/runtime.mjs`, `./nightly-ops-pass/index.mjs`, `./nightly-ops-pass/runtime.mjs`, `./symphony-control/index.mjs`, `./symphony-control/runtime.mjs`, `./symphony-integrator/index.mjs`, `./symphony-integrator/runtime.mjs`

## 6. Additional Comments

- No direct standalone runtime entry point is defined in the immediate directory contents.

# Linear Reconciler

## Purpose
Level-triggered backlog reconciler that compares Linear state with local execution state, repairs stale issue progress, and feeds desired-work signals without directly dispatching runnable work.

## Contents
- 8 immediate files
- 4 child directories

## Key Files
- `compute-reconciliation-actions.mjs` - Re-export facade that assembles the public surface for this directory.
- `get-healthy-linear-capacity.mjs` - Re-export facade that assembles the public surface for this directory.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `main.mjs` - Exports `main`, the main helper defined in this file.
- `run-daemon.mjs` - Exports `runDaemon`, the main helper defined in this file.
- `run-reconciliation-cycle.mjs` - Re-export facade that assembles the public surface for this directory.
- `runtime.mjs` - Executable runtime bootstrap for this directory.

## Subdirectories
- `compute-reconciliation-actions/` - Compute Reconciliation Actions scope; immediate files include `compute-reconciliation-actions.mjs`, `index.mjs`, `is-missing-from-local-execution.mjs`.
- `get-healthy-linear-capacity/` - Get Healthy Linear Capacity scope; immediate files include `get-healthy-linear-capacity.mjs`, `index.mjs`, `normalize-worktree-state.mjs`.
- `logger/` - Logger scope; immediate files include `index.mjs`, `log-debug.mjs`, `log-error.mjs`, `log-info.mjs`, and others.
- `run-reconciliation-cycle/` - Run Reconciliation Cycle scope; immediate files include `index.mjs`, `recover-in-progress-issue.mjs`, `run-reconciliation-cycle.mjs`.

## Operational Notes
- After Workstream A, this daemon acts as a safety-net feeder and repair loop rather than a competing global dispatcher.
- It still matters for stale in-progress recovery, healthy-capacity inspection, and backlog pressure management.

## Review Focus
Confirm that reconciliation now supports scheduler authority instead of bypassing it, and that stale issue recovery still lines up with the state model.

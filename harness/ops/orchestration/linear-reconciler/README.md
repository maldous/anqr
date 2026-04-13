# Linear Reconciler

## Purpose
Level-triggered backlog reconciler that continuously compares Linear state with local execution state, dispatches recoverable work, and restores drifted issues to a processable state.

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
- `compute-reconciliation-actions/` - Directory for Linear ingestion, reconciliation, or issue management; immediate files include `compute-reconciliation-actions.mjs`, `index.mjs`, `is-missing-from-local-execution.mjs`.
- `get-healthy-linear-capacity/` - Directory for Linear ingestion, reconciliation, or issue management; immediate files include `get-healthy-linear-capacity.mjs`, `index.mjs`, `normalize-worktree-state.mjs`.
- `logger/` - Directory for Linear ingestion, reconciliation, or issue management; immediate files include `index.mjs`, `log-debug.mjs`, `log-error.mjs`, `log-info.mjs`, and others.
- `run-reconciliation-cycle/` - Directory for Linear ingestion, reconciliation, or issue management; immediate files include `dispatch-issue.mjs`, `index.mjs`, `recover-in-progress-issue.mjs`, `run-reconciliation-cycle.mjs`.

## Operational Notes
- This daemon is intended to catch missed webhook events and restart-safe backlog drift.
- It is one of the main places where current runtime behavior can diverge from the desired singular-scheduler architecture.

## Review Focus
Check whether reconciliation duplicates dispatch authority, whether stale issue recovery is safe, and whether healthy-capacity checks line up with the worktree fleet design.

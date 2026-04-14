# Run Reconciliation Cycle

## Purpose

Directory for Linear ingestion, reconciliation, or issue management; immediate files include `index.mjs`, `recover-in-progress-issue.mjs`, and `run-reconciliation-cycle.mjs`.

## Contents

- 3 immediate files
- 0 child directories

## Key Files

- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `recover-in-progress-issue.mjs` - Exports `recoverInProgressIssue`, the main helper defined in this file.
- `run-reconciliation-cycle.mjs` - Exports `runReconciliationCycle`, the main helper defined in this file.

## Subdirectories

- No child directories in this directory.

## Operational Notes

- Current on-disk inventory: 3 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus

Check whether ownership, timing, and state transitions in this directory stay consistent with the harness concurrency and integration model.

# Symphony Scheduler

## Purpose
Authoritative scheduler that owns global claim-and-assignment for runnable Linear work and dispatches only already-claimed work into the router.

## Contents
- 7 immediate files
- 0 child directories

## Key Files
- `drain-desired-work.mjs` - Exports `drainDesiredWork`, the main helper defined in this file.
- `get-eligible-work.mjs` - Exports `getEligibleWork`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `main.mjs` - Exports `main`, the main helper defined in this file.
- `runtime.mjs` - Executable runtime bootstrap for this directory.
- `schedule-cycle.mjs` - Exports `scheduleCycle`, the main helper defined in this file.

## Subdirectories
- No child directories in this directory.

## Operational Notes
- This directory embodies the Workstream A change that introduced a first-class scheduler and durable worktree assignment at claim time.
- The scheduler drains desired-work hints, discovers eligible Linear work, claims atomically, assigns a worktree, and then asks the router to transport the already-claimed job.

## Review Focus
Verify that this scheduler is now the only component that can move work from eligible to claimed and that all downstream paths honour its durable assignment.

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

- `drain-desired-work.mjs` — Drains the `symphony-desired-work` durable queue each cycle. These signals are advisory priority hints from webhook and reconciler ingress, not authoritative work sources.
- `get-eligible-work.mjs` — Queries Linear for Todo issues, filters by execution eligibility and Discord sourcing, applies desired-work priority boost. Returns the authoritative list of schedulable issues.
- `schedule-cycle.mjs` — Runs one authoritative scheduling cycle: housekeeping → capacity check → eligible work → atomic claim+dispatch. Each claim includes a durable worktree assignment. On dispatch failure, calls `releaseLease()` for atomic bidirectional rollback.
- `main.mjs` — Entry point supporting `--once` (single cycle) and `--daemon` (polling loop) modes.
- `runtime.mjs` — Executable runtime bootstrap.
- `index.mjs` — Re-export facade for the public surface.
- `logger.mjs` — Shared logging helper.

## Subdirectories

- No child directories in this directory.

## Architecture

### Scheduling Cycle Flow

```
1. Housekeeping
   ├── detectStuckWork() — recover stale In Progress issues
   └── feedQueue() — ensure Linear queue depth ≥ TARGET_MIN

2. Capacity Check
   └── getHealthyLinearCapacity() — enumerate wt1-wt4 health/availability

3. Eligible Work
   ├── drainDesiredWork() — consume advisory signals from webhook+reconciler
   ├── listIssuesByState("Todo") — authoritative Linear state
   ├── filter: canExecuteIssue, !isDiscordSourced, !leaseIsActive
   └── sort: desired-work boost → priority → creation date

4. Claim + Dispatch (up to SCHEDULER_MAX_DISPATCH_PER_CYCLE)
   ├── Select available worktree from capacity pool (no double-assignment)
   ├── If no worktree available → stop dispatch (do not claim without assignment)
   ├── claimAndAssignWorktree(identifier, { worktreeId, source })
   │   └── Atomic: withStateLock → acquireLease → set assignment + worktree
   └── HTTP POST to router /v1/linear/trigger
       ├── Router verifies claim on all paths before dispatch (transport only)
       └── On failure: releaseLease() for atomic bidirectional rollback
```

### Authority Boundaries

| Component      | Role                                     | What it does NOT do            |
| -------------- | ---------------------------------------- | ------------------------------ |
| **Scheduler**  | Owns `eligible → claimed`                | Does not execute issues        |
| **Router**     | Transport — honours scheduler assignment | Does not originate claims      |
| **Runner**     | Executes claimed work                    | Does not self-pick global work |
| **Webhook**    | Write-only ingress → desired-work queue  | Does not dispatch or claim     |
| **Reconciler** | Feeds desired-work queue + recovery      | Does not dispatch directly     |

### Claim Contract

Every `claimAndAssignWorktree()` call produces a durable state record containing:

- **`lease`** — Active lease with `owner: "scheduler"`, `nonce`, `expires_at`
- **`assignment`** — Worktree assignment with `worktreeId`, `claimedBy: "scheduler"`, `source`, `timestamp`
- **`worktreeStates[wtId]`** — Worktree set to `"executing"` with `assignedIssue` pointing back to the issue

Both sides (issue and worktree) are set atomically under one `withStateLock` call. `releaseLease()` clears both sides atomically on release.

The router's `verifySchedulerClaim()` checks all three conditions:

1. Active lease exists (`leaseIsActive`)
2. Lease owner is `"scheduler"` (not a stale runner lease)
3. Assignment metadata exists with a `worktreeId`

See ADR-0011 for the full execution state model.

## Configuration

All timing and limit constants are in `symphony-config.mjs`:

- `SCHEDULER_POLL_INTERVAL_MS` — 15s daemon poll interval
- `SCHEDULER_MAX_DISPATCH_PER_CYCLE` — max 4 issues claimed per cycle
- `RECONCILER_DISPATCH_COOLDOWN_MS` — 5s delay between dispatches

## Systemd Service

`services/systemd/anqr-symphony-scheduler.service` runs the scheduler in daemon mode:

```bash
node harness/ops/orchestration/symphony-scheduler/runtime.mjs --daemon
```

## Usage

```bash
# Single cycle (for testing/debugging)
node harness/ops/orchestration/symphony-scheduler/runtime.mjs --once

# Daemon mode (production)
node harness/ops/orchestration/symphony-scheduler/runtime.mjs --daemon

# Via systemd
systemctl --user start anqr-symphony-scheduler.service
```

## Operational Notes

- This directory embodies the Workstream A change that introduced a first-class scheduler and durable worktree assignment at claim time.
- The scheduler drains desired-work hints, discovers eligible Linear work, claims atomically, assigns a worktree, and then asks the router to transport the already-claimed job.

## Review Focus

Verify that this scheduler is now the only component that can move work from eligible to claimed and that all downstream paths honour its durable assignment.

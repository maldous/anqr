# Symphony Scheduler

## Purpose

The authoritative scheduler for the ANQR harness. Per ADR-0002, this is the **single component** that owns global issue admission and the transition from `eligible` to `claimed`. No runner, reconciler, webhook handler, or router path may independently self-pick or re-dispatch work outside this authority.

## Contents

- 7 immediate files
- 0 child directories

## Key Files

- `drain-desired-work.mjs` — Drains the `symphony-desired-work` durable queue each cycle. These signals are advisory priority hints from webhook and reconciler ingress, not authoritative work sources.
- `get-eligible-work.mjs` — Queries Linear for Todo issues, filters by execution eligibility and Discord sourcing, applies desired-work priority boost. Returns the authoritative list of schedulable issues.
- `schedule-cycle.mjs` — Runs one authoritative scheduling cycle: housekeeping → capacity check → eligible work → atomic claim+dispatch. Each claim includes a durable worktree assignment.
- `main.mjs` — Entry point supporting `--once` (single cycle) and `--daemon` (polling loop) modes.
- `runtime.mjs` — Executable runtime bootstrap.
- `index.mjs` — Re-export facade for the public surface.
- `logger.mjs` — Shared logging helper.

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
   ├── claimIssue(identifier, { worktreeId, source: "scheduler" })
   │   └── Atomic: withStateLock → acquireLease → set assignment
   └── HTTP POST to router /v1/linear/trigger
       └── Router verifies claim on all paths before dispatch (transport only)
```

### Authority Boundaries

| Component | Role | What it does NOT do |
|---|---|---|
| **Scheduler** | Owns `eligible → claimed` | Does not execute issues |
| **Router** | Transport — honours scheduler assignment | Does not originate claims |
| **Runner** | Executes claimed work | Does not self-pick global work |
| **Webhook** | Write-only ingress → desired-work queue | Does not dispatch or claim |
| **Reconciler** | Feeds desired-work queue + recovery | Does not dispatch directly |

### Claim Contract

Every `claimIssue()` call produces a durable state record containing:

- **`lease`** — Active lease with `owner: "scheduler"`, `nonce`, `expires_at`
- **`assignment`** — Worktree assignment with `worktreeId`, `claimedBy: "scheduler"`, `source`, `timestamp`

The router's `verifySchedulerClaim()` checks all three conditions:
1. Active lease exists (`leaseIsActive`)
2. Lease owner is `"scheduler"` (not a stale runner lease)
3. Assignment metadata exists with a `worktreeId`

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

- The scheduler shares the filesystem-backed `symphony-state.json` with the router and recovery daemon. All run on the same host.
- Desired-work signals are advisory. If the queue is empty, the scheduler still discovers eligible work from Linear state directly.
- The drain limit (`MAX_DRAIN_PER_CYCLE = 100`) prevents unbounded queue processing.
- Worktree assignment is mandatory. If all worktrees are occupied, the scheduler stops dispatching for that cycle rather than claiming without assignment. The router rejects claims missing `assignment.worktreeId`.

## Review Focus

Verify that only this scheduler can move issues from eligible to claimed, and that the router, runner, webhook, and reconciler respect the authority boundary.

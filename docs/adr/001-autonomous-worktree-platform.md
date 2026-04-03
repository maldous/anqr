# ADR-001: Autonomous Worktree Execution Platform

**Status:** Implementing
**Date:** 2025-07-01
**Authors:** Symphony Platform Team

---

## 1. Context

The current Symphony orchestration stack runs multiple AI agents in parallel across git worktrees (wt1–wt8). While the runner, integrator, state layer, and queue control are operational, the platform lacks **autonomous recovery** — dirty worktrees, failed commits, stuck leases, and integration conflicts require manual triage. This ADR defines the implementation program to close the gap between "parallel execution" and "fully autonomous operation."

## 2. Decision

Build a control-plane upgrade across six phases, each gated by acceptance criteria, to achieve unattended autonomous operation of the worktree fleet.

---

## 3. Gap Analysis

### What Already Exists

| Component         | File                                                                      | Status                                                                                                                                                                                                      |
| ----------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| State schema v2   | `scripts/ops/core/symphony-state.mjs`                                     | ✅ Finalization states, integration queue/lock, sticky owner, lease/heartbeat, exponential backoff                                                                                                          |
| Integrator        | `scripts/ops/orchestration/symphony-integrator.mjs`                       | ✅ Single writer to main via cherry-pick, daemon mode, queue processing, conflict → `integration_failed_repairable`                                                                                         |
| Runner            | `scripts/ops/orchestration/symphony-runner.mjs`                           | ✅ Worktree detection, validation, commit, branch-only push, finalization state mgmt, sticky repair priority (`getNextRepairableIssueForWorktree` before `pickIssue`), continuation, failure fingerprinting |
| Worktree config   | `scripts/ops/core/worktree-config.mjs`                                    | ✅ Paths, branch naming, Discord/Symphony routing                                                                                                                                                           |
| Worktree pool     | `scripts/ops/orchestration/symphony-worktree-pool.mjs`                    | ✅ Create, cleanup, repair, list                                                                                                                                                                            |
| Queue control     | `scripts/ops/orchestration/symphony-queue-control.mjs`                    | ✅ Feed, drain, enforce concurrency, detect stuck work                                                                                                                                                      |
| Config            | `scripts/ops/core/symphony-config.mjs`                                    | ✅ Timing chain, retry limits, concurrency                                                                                                                                                                  |
| Systemd services  | `services/systemd/anqr-symphony-*`                                        | ✅ executor@, integrator, runner, watchdog, router                                                                                                                                                          |
| Unit tests        | `tests/unit/finalization-state.spec.ts`                                   | ✅ Finalization CRUD, queue dedup, lock exclusivity, repair candidate lookup                                                                                                                                |
| Integration tests | `tests/integration/symphony-integrator.spec.ts`                           | ✅ Queue flow, conflict handling, sticky owner preservation                                                                                                                                                 |
| Recovery tools    | `scripts/ops/tools/recover-stale-in-progress.mjs`, `startup-recovery.mjs` | ✅ Partial — stale lease cleanup, service restart                                                                                                                                                           |
| Watchdog          | `scripts/ops/runtime/symphony/watchdog-monitor.mjs`                       | ✅ Bridge health, log analysis, auto-rollback                                                                                                                                                               |

### What Is Missing

| Gap ID  | Requirement                                                                                        | Current State                                                            | Severity                                               |
| ------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------ |
| **G1**  | Recovery daemon (scan → classify → repair → quarantine)                                            | Does not exist                                                           | **Critical** — no autonomous dirty worktree resolution |
| **G2**  | `validation_failed_repairable` finalization state                                                  | Validation failures `gitRevert()` + return to Todo                       | **High** — loses work, violates repair-first principle |
| **G3**  | `RUNNER_AUTO_PUSH = false`                                                                         | Branch→integrator flow disabled                                          | **Blocker** — integrator never receives candidates     |
| **G4**  | Explicit worktree state tracking (`available`/`executing`/`dirty`/`quarantined`)                   | Implicit — no per-worktree state in shared store                         | **High** — scheduler cannot make informed decisions    |
| **G5**  | Quarantine model with reprovisioning                                                               | Uses `Backlog` + `retry_exhausted` as proxy                              | **Medium** — no formal quarantine/reprovision workflow |
| **G6**  | Machine-readable fleet health inventory                                                            | No dedicated health snapshot                                             | **Medium** — not externally observable                 |
| **G7**  | End-to-end simulation harness                                                                      | Does not exist                                                           | **Medium** — cannot prove autonomy                     |
| **G8**  | Deprecated `gitPush()` still exists                                                                | Dead code in runner                                                      | **Low** — cleanup                                      |
| **G9**  | Integrator re-enqueue after repair                                                                 | No automatic re-enqueue when `integration_failed_repairable` is repaired | **Medium** — requires manual intervention              |
| **G10** | `RUNNER_MAX_RETRIES = Infinity`                                                                    | No bounded retries — violates spec requirement                           | **High** — repair loops can cycle forever              |
| **G11** | Bridge commit/push audit                                                                           | Bridge may have auto-commit/push paths in runner flows                   | **Medium** — spec requires bridge never auto-commits   |
| **G12** | Explicit issue execution states (`locally_validated`, `local_commit_complete`, `branch_published`) | Currently implicit in runner flow, not tracked in state model            | **Medium** — reduces observability                     |

---

## 4. Target Architecture

### 4.1 Four Autonomous Loops

```
┌─────────────────────────────────────────────────────────────┐
│                    Shared Durable State                      │
│              scripts/ops/core/symphony-state.mjs             │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │ issues{} │  │ worktrees{}  │  │ global.integrationQueue│ │
│  │ leases   │  │ state per wt │  │ global.integrationLock │ │
│  │ finalize │  │ quarantine   │  │ global.fleetSnapshot   │ │
│  └──────────┘  └──────────────┘  └────────────────────────┘ │
└──────────┬──────────┬──────────────┬──────────────┬─────────┘
           │          │              │              │
     ┌─────▼────┐ ┌───▼────────┐ ┌──▼──────────┐ ┌▼──────────────┐
     │Scheduler │ │  Executor  │ │  Recovery   │ │  Integrator   │
     │  Loop    │ │   Loop     │ │  Daemon     │ │  (single      │
     │(queue-   │ │(runner per │ │  Loop       │ │   writer)     │
     │ control) │ │ worktree)  │ │             │ │               │
     └──────────┘ └────────────┘ └─────────────┘ └───────────────┘
```

### 4.2 Worktree State Machine

```
                    ┌──────────┐
        ┌──────────►│available │◄────────────────────────────┐
        │           └────┬─────┘                             │
        │                │ scheduler assigns                 │
        │           ┌────▼─────┐                             │
        │           │executing │                             │
        │           └────┬─────┘                             │
        │                │                                   │
        │     ┌──────────┼──────────────┐                    │
        │     │          │              │                    │
        │  ┌──▼───┐  ┌──▼──────┐  ┌────▼────────────┐       │
        │  │commit│  │validate │  │ branch_push      │       │
        │  │failed│  │failed   │  │ failed           │       │
        │  │repair│  │repair   │  │ repairable       │       │
        │  └──┬───┘  └──┬──────┘  └────┬─────────────┘       │
        │     │          │              │                    │
        │     └──────────┼──────────────┘                    │
        │                │ repair succeeds                   │
        │           ┌────▼─────────────┐                     │
        │           │integration       │                     │
        │           │pending           │                     │
        │           └────┬─────────────┘                     │
        │                │                                   │
        │     ┌──────────┼──────────┐                        │
        │     │                     │                        │
        │  ┌──▼───────────┐   ┌────▼────────────┐           │
        │  │integrated    │   │integration      │           │
        │  │main (Done)   │   │failed_repairable│──repair──►│
        │  └──────────────┘   └─────────────────┘           │
        │                                                    │
        │  quarantine after max retries                      │
        │  ┌──────────────┐   ┌──────────────┐              │
        └──│reprovisioned │◄──│ quarantined  │              │
           └──────────────┘   └──────────────┘
```

---

## 5. Implementation Plan

### Phase 0: Observability & State Hardening

**Goal:** Make the fleet observable enough to safely automate recovery.

#### New Files

| File                                   | Responsibility                                 |
| -------------------------------------- | ---------------------------------------------- |
| `scripts/ops/core/worktree-health.mjs` | Per-worktree health snapshot + fleet inventory |
| `tests/unit/worktree-health.spec.ts`   | Health snapshot classification tests           |

#### Modifications

| File                                    | Change                                                                                                                     |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `scripts/ops/core/symphony-state.mjs`   | Add `store.worktreeStates` map, `setWorktreeState()`, `getWorktreeState()`, `listWorktreesByState()`, `getFleetSnapshot()` |
| `tests/unit/finalization-state.spec.ts` | Add worktree state CRUD tests                                                                                              |

#### Interface: `worktree-health.mjs`

```javascript
/**
 * @param {string} worktreeId - e.g. "wt1"
 * @returns {{
 *   id: string,
 *   path: string,
 *   exists: boolean,
 *   gitDirtyFiles: string[],
 *   branch: string,
 *   headSha: string,
 *   finalizationState: object|null,
 *   leaseState: object|null,
 *   classification: 'available'|'executing'|'dirty_owned'|'dirty_orphaned'|'quarantined'|'blocked',
 *   issueIdentifier: string|null,
 *   updatedAt: string
 * }}
 */
export function getWorktreeHealthSnapshot(worktreeId) {}

/**
 * @returns {{
 *   worktrees: Snapshot[],
 *   summary: { available: number, executing: number, dirty: number, quarantined: number, blocked: number },
 *   timestamp: string
 * }}
 */
export function getFleetInventory() {}
```

#### Interface: State model additions in `symphony-state.mjs`

```javascript
// New store shape additions:
// store.worktreeStates = {
//   "wt1": { state: "available", issueIdentifier: null, updatedAt: "..." },
//   "wt2": { state: "executing", issueIdentifier: "ANQ-123", updatedAt: "..." },
//   "wt3": { state: "quarantined", issueIdentifier: "ANQ-456", reason: "...", quarantinedAt: "...", repairAttempts: 3, lastError: "..." }
// }

export function setWorktreeState(worktreeId, patch) {}
export function getWorktreeState(worktreeId) {}
export function listWorktreesByState(state) {}
export function recordQuarantine(worktreeId, details) {}
export function clearQuarantine(worktreeId) {}
```

#### State Migration

Adding `store.worktreeStates` requires no explicit migration. The existing `loadState()` normalizer already falls back to defaults for missing fields via `emptyStore()`. Phase 0 must:

- Extend `emptyStore()` to include `worktreeStates: {}`
- Add normalization in `loadState()` for the new field
- Add a schema migration test that loads a v2 state file without `worktreeStates` and verifies it round-trips correctly

#### Gate 0 Acceptance Criteria

- [ ] `getWorktreeHealthSnapshot()` returns correct classification for clean, dirty, leased, and quarantined worktrees
- [ ] `getFleetInventory()` produces valid JSON with summary counts
- [ ] `setWorktreeState()` / `getWorktreeState()` round-trip correctly
- [ ] Stale lock expiry tests pass
- [ ] State migration: loading existing v2 state.json without `worktreeStates` produces valid store
- [ ] All Phase 0 unit tests pass: `npx vitest run tests/unit/worktree-health.spec.ts tests/unit/finalization-state.spec.ts`

---

### Phase 1: Remove Unsafe Finalization Paths

**Goal:** Enable the branch→integrator flow and eliminate dead code paths.

#### Modifications

| File                                            | Change                                                                                                                                                 |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `scripts/ops/core/symphony-config.mjs`          | Set `RUNNER_AUTO_PUSH = true`. Set `RUNNER_MAX_RETRIES = 10` (bounded — spec requires finite retries; Infinity violates repair-first model).           |
| `scripts/ops/orchestration/symphony-runner.mjs` | Remove deprecated `gitPush()` function (~80 lines). Add `setWorktreeState('executing')` on issue start, `setWorktreeState('available')` on clean exit. |

#### Gate 1 Acceptance Criteria

- [ ] `RUNNER_AUTO_PUSH = true` — runner successfully pushes to worktree branch
- [ ] `RUNNER_MAX_RETRIES` is finite (≤ 10)
- [ ] Integrator receives candidates via integration queue
- [ ] `git grep 'push.*origin.*HEAD:main' scripts/ops/orchestration/symphony-runner.mjs` returns zero matches
- [ ] Deprecated `gitPush()` function removed from runner
- [ ] Bridge audit: `git grep 'git.*push\|git.*commit' scripts/ops/bridges/` confirms bridge does not auto-commit or push in runner flows
- [ ] Integration test: runner commit → branch push → integration queue entry created
- [ ] `npx vitest run tests/integration/symphony-integrator.spec.ts` passes

---

### Phase 2: Complete Sticky Repair Model

**Goal:** Preserve dirty trees for repair instead of reverting validated work.

#### Modifications

| File                                            | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/ops/core/symphony-state.mjs`           | Add `"validation_failed_repairable"` to `REPAIRABLE_FINALIZATION_STATES`                                                                                                                                                                                                                                                                                                                                                                                   |
| `scripts/ops/core/symphony-config.mjs`          | Add `RUNNER_VALIDATION_REPAIR_MAX = 3` — max same-worktree validation repair cycles before quarantine                                                                                                                                                                                                                                                                                                                                                      |
| `scripts/ops/orchestration/symphony-runner.mjs` | **Behavioral change:** When validation fails and `finalization.attempts < RUNNER_VALIDATION_REPAIR_MAX`, set `validation_failed_repairable` finalization state with sticky owner instead of `gitRevert()` + return to Todo. Preserve dirty tree. Store full validation output (not truncated) in `lastError` or a sidecar file at `.git/SYMPHONY_VALIDATION_ERRORS`. On next cycle, sticky repair picks it up and continues with validation error context. |
| `tests/unit/finalization-state.spec.ts`         | Add: `validation_failed_repairable` is returned by `getNextRepairableIssueForWorktree()`                                                                                                                                                                                                                                                                                                                                                                   |

#### New Runner Validation Failure Flow

```
Before (current):
  validation fails → gitRevert() → return to Todo → fresh start

After (target):
  validation fails (attempt < RUNNER_VALIDATION_REPAIR_MAX) →
    setFinalizationState("validation_failed_repairable", {
      stickyOwner: WORKTREE_ID,
      lastError: validation stderr (truncated summary),
      attempts: N
    }) →
    write full validation output to .git/SYMPHONY_VALIDATION_ERRORS →
    updateIssue(STATES.inReview) →
    dirty tree preserved →
    next cycle: getNextRepairableIssueForWorktree() picks it up →
    runner sends validation errors as repair prompt →
    agent fixes in same worktree with preserved context

  validation fails (attempt >= threshold) →
    gitRevert() → quarantine to Backlog (existing behavior)
```

#### Gate 2 Acceptance Criteria

- [ ] Validation failure sets `validation_failed_repairable` in finalization state
- [ ] Same worktree picks up repair issue on next runner cycle
- [ ] Repair prompt includes validation error details
- [ ] After successful repair + validation pass → commit + push to branch
- [ ] Repeated same-signature validation failure → quarantine (existing fingerprinting)
- [ ] `npx vitest run tests/unit/finalization-state.spec.ts` passes with new state

---

### Phase 3: Recovery Daemon

**Goal:** Autonomously drain dirty worktrees back to healthy state.

#### New Files

| File                                                       | Responsibility                             |
| ---------------------------------------------------------- | ------------------------------------------ |
| `scripts/ops/orchestration/symphony-worktree-recovery.mjs` | Scan → classify → repair → quarantine loop |
| `services/systemd/anqr-symphony-worktree-recovery.service` | Systemd unit                               |
| `tests/unit/worktree-recovery.spec.ts`                     | Classification + state machine unit tests  |
| `tests/integration/recovery-daemon.spec.ts`                | Repair dispatch integration tests          |

#### Interface: `symphony-worktree-recovery.mjs`

```javascript
/**
 * Classify a worktree's current state and determine repair action.
 * @param {HealthSnapshot} snapshot - from worktree-health.mjs
 * @returns {{
 *   classification: 'clean'|'dirty_owned'|'dirty_orphaned'|'stale_lease'|'conflicted'|'half_committed',
 *   confidence: number,  // 0.0–1.0 (threshold: RECOVERY_OWNERSHIP_CONFIDENCE_THRESHOLD),
 *   inferredOwner: string|null,
 *   repairAction: 'continue_repair'|'retry_push'|'retry_commit'|'quarantine'|'reprovision'|'skip'|null
 * }}
 */
export function classifyWorktree(snapshot) {}

/**
 * Execute repair action on a worktree.
 * @returns {{ ok: boolean, action: string, nextState: string, error?: string }}
 */
export async function executeRepair(worktreeId, classification) {}

/**
 * Run one full recovery cycle across all worktrees.
 * @returns {{ scanned: number, repaired: number, quarantined: number, skipped: number, errors: string[] }}
 */
export async function runRecoveryCycle() {}

/** Daemon mode: poll loop with configurable interval. */
export async function runDaemon() {}

/** CLI: once | daemon | status */
```

#### Classification Logic

```
Input: worktree health snapshot

1. No dirty files + no active finalization → 'clean' → skip
2. Active lease with recent heartbeat → 'executing' → skip (runner is alive)
3. Dirty files + finalization.stickyOwner matches worktree:
   → 'dirty_owned' / high confidence
   → repairAction: 'continue_repair'
4. Dirty files + stale/expired lease:
   → 'stale_lease'
   → release lease, attempt ownership inference from branch + recent commits
   → if confident: 'dirty_owned' → 'continue_repair'
   → if not: 'dirty_orphaned' → 'quarantine'
5. Dirty files + no finalization + no lease:
   → 'dirty_orphaned' / confidence < RECOVERY_OWNERSHIP_CONFIDENCE_THRESHOLD
   → attempt inference from branch name, git log, recent state transitions
   → if confident: reassign ownership → 'continue_repair'
   → if not: 'quarantine'
6. Commit exists but push failed:
   → 'half_committed'
   → 'retry_push'
7. Merge conflict markers in files:
   → 'conflicted'
   → 'quarantine' (conflict resolution requires AI context)
```

#### Recovery Config (added to `symphony-config.mjs`)

```javascript
export const RECOVERY_POLL_INTERVAL_MS = 60_000; // 1 min scan interval
export const RECOVERY_MAX_REPAIR_ATTEMPTS = 5; // per worktree before quarantine
export const RECOVERY_QUARANTINE_THRESHOLD_MS = 600_000; // 10 min stuck in repairable → quarantine
export const RECOVERY_STALE_LEASE_GRACE_MS = 300_000; // 5 min grace before reclaiming lease
export const RECOVERY_OWNERSHIP_CONFIDENCE_THRESHOLD = 0.7;
```

#### Gate 3 Acceptance Criteria

- [ ] Daemon detects dirty worktree with known owner → dispatches repair
- [ ] Daemon detects dirty orphan with low confidence → quarantines
- [ ] Bounded retries → `blocked` / `quarantined` transition after `RECOVERY_MAX_REPAIR_ATTEMPTS`
- [ ] Clean repaired worktree returns to `available` state
- [ ] Orphaned worktree quarantine does not auto-commit
- [ ] `npx vitest run tests/unit/worktree-recovery.spec.ts tests/integration/recovery-daemon.spec.ts` passes
- [ ] `systemctl --user start anqr-symphony-worktree-recovery` runs without error

---

### Phase 4: Harden Integrator

**Goal:** Make integration conflict-safe and support repair re-enqueue.

#### Modifications

| File                                                | Change                                                                                                                                                                                                                                                                                                                    |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/ops/orchestration/symphony-integrator.mjs` | (1) After `integration_failed_repairable` is repaired and branch re-pushed, automatically re-enqueue via a recovery-daemon hook or periodic queue scan. (2) `git fetch` the specific branch ref before cherry-pick to handle force-pushed branches after conflict repair. (3) Add metric logging for integration latency. |
| `scripts/ops/orchestration/symphony-runner.mjs`     | After successful repair of `integration_failed_repairable` → re-push branch → `enqueueIntegrationCandidate()` → set state back to `integration_pending`                                                                                                                                                                   |
| `tests/integration/symphony-integrator.spec.ts`     | Add: re-enqueue-after-repair test, force-pushed branch handling test, two-branch serial integration test                                                                                                                                                                                                                  |

#### Gate 4 Acceptance Criteria

- [ ] Two published worktree branches integrate one at a time (lock enforced)
- [ ] Conflict does not mark Done — marks `integration_failed_repairable`
- [ ] Repaired branch is re-enqueued automatically after re-push
- [ ] Force-pushed branch (new headSha) is fetched correctly
- [ ] `npx vitest run tests/integration/symphony-integrator.spec.ts` passes

---

### Phase 5: Fleet Health & Reprovisioning

**Goal:** Self-heal over long unattended runs.

#### New Files

| File                                            | Responsibility                         |
| ----------------------------------------------- | -------------------------------------- |
| `services/systemd/anqr-worktree-health.timer`   | Periodic health snapshot (every 5 min) |
| `services/systemd/anqr-worktree-health.service` | One-shot health check                  |

#### Modifications

| File                                                       | Change                                                                                                                                                                                     |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `scripts/ops/orchestration/symphony-worktree-pool.mjs`     | Add `reprovisionWorktree(id)` — force-remove + recreate from `origin/main`, reinstall deps, reset upstream                                                                                 |
| `scripts/ops/orchestration/symphony-worktree-recovery.mjs` | Add reprovisioning path: quarantined worktree with `repairAttempts >= RECOVERY_MAX_REPAIR_ATTEMPTS` → call `reprovisionWorktree()` → `clearQuarantine()` → `setWorktreeState('available')` |
| `scripts/ops/core/worktree-health.mjs`                     | Add `writeFleetHealthFile()` — persist JSON to `reports/symphony/fleet-health.json` for external observability                                                                             |

#### Gate 5 Acceptance Criteria

- [ ] Crashed runner's lease expires → recovery picks up within `RECOVERY_STALE_LEASE_GRACE_MS`
- [ ] Quarantined worktree is reprovisioned automatically after threshold
- [ ] Reprovisioned worktree passes health check and returns to `available`
- [ ] Poisoned worktree does not receive new work (scheduler checks worktree state)
- [ ] `reports/symphony/fleet-health.json` is machine-readable and updated periodically
- [ ] `systemctl --user status anqr-worktree-health.timer` shows active

---

### Phase 6: Closed-Loop Autonomy Verification

**Goal:** Prove unattended operation across mixed failure modes.

#### New Files

| File                                    | Responsibility                                     |
| --------------------------------------- | -------------------------------------------------- |
| `tests/e2e/autonomy-simulation.spec.ts` | End-to-end simulation harness with fault injection |

#### Scenarios

| #   | Scenario                                              | Expected Outcome                                                          |
| --- | ----------------------------------------------------- | ------------------------------------------------------------------------- |
| 1   | AI edits introduce lint errors                        | Recovery loop fixes and publishes → integrator promotes to main           |
| 2   | Two worktrees touch same file, both publish           | First integrates, second conflicts → repair → second integrates           |
| 3   | Executor crashes mid-edit                             | Stale lease expires → recovery resumes → issue completes                  |
| 4   | Dirty orphaned worktree with low-confidence ownership | Quarantine → scheduler uses remaining healthy pool                        |
| 5   | Kill runner during validation                         | Recovery classifies `validation_failed_repairable` → same-worktree repair |
| 6   | Break network during push                             | `branch_push_failed_repairable` → retry → succeeds → integrates           |
| 7   | Corrupt lock holder process                           | Stale lock detected → released → execution resumes                        |
| 8   | Integration crashes while lock held                   | TTL expires → next cycle acquires lock → continues                        |

#### SLO Targets

| Metric                                     | Target       |
| ------------------------------------------ | ------------ |
| Dirty worktree detection                   | < 2 minutes  |
| Repair reassignment to same worktree       | < 2 minutes  |
| Quarantine decision for irrecoverable tree | < 10 minutes |
| Integration queue latency (normal load)    | < 5 minutes  |
| Stale lease recovery                       | < 10 minutes |
| Main promotion concurrency violations      | 0            |

#### Gate 6 Acceptance Criteria

- [ ] All 8 simulation scenarios pass
- [ ] Overnight unattended run completes mixed workloads
- [ ] All SLO targets met across 24-hour window
- [ ] No dirty worktree blocks the whole platform
- [ ] Zero human interventions required for routine failures

---

## 6. File Inventory Summary

### New Files (9)

| File                                                       | Phase |
| ---------------------------------------------------------- | ----- |
| `scripts/ops/core/worktree-health.mjs`                     | 0     |
| `tests/unit/worktree-health.spec.ts`                       | 0     |
| `scripts/ops/orchestration/symphony-worktree-recovery.mjs` | 3     |
| `tests/unit/worktree-recovery.spec.ts`                     | 3     |
| `tests/integration/recovery-daemon.spec.ts`                | 3     |
| `services/systemd/anqr-symphony-worktree-recovery.service` | 3     |
| `services/systemd/anqr-worktree-health.service`            | 5     |
| `services/systemd/anqr-worktree-health.timer`              | 5     |
| `tests/e2e/autonomy-simulation.spec.ts`                    | 6     |

### Modified Files (8)

| File                                                   | Phases    |
| ------------------------------------------------------ | --------- |
| `scripts/ops/core/symphony-state.mjs`                  | 0, 2      |
| `scripts/ops/core/symphony-config.mjs`                 | 1, 2, 3   |
| `scripts/ops/orchestration/symphony-runner.mjs`        | 1, 2, 4   |
| `scripts/ops/orchestration/symphony-integrator.mjs`    | 4         |
| `scripts/ops/orchestration/symphony-worktree-pool.mjs` | 5         |
| `tests/unit/finalization-state.spec.ts`                | 0, 2      |
| `tests/integration/symphony-integrator.spec.ts`        | 4         |
| `docs/adr/001-autonomous-worktree-platform.md`         | This file |

---

## 7. Critical Path

```
Phase 0 ──► Phase 1 ──► Phase 2 ──► Phase 3 ──► Phase 4 ──► Phase 5 ──► Phase 6
  │            │            │            │            │            │
  │ health     │ enable     │ validation │ recovery   │ harden     │ reprovision
  │ snapshot   │ auto-push  │ repairable │ daemon     │ integrator │ + health
  │            │ rm dead    │ state      │            │            │ service
  │            │ code       │            │            │            │
  ▼            ▼            ▼            ▼            ▼            ▼
Gate 0      Gate 1       Gate 2       Gate 3       Gate 4       Gate 5 → Gate 6
```

**Phases 0–3 are strictly sequential** — each depends on the prior phase's output.
**Phase 4 can overlap with Phase 3** — integrator hardening is independent of recovery daemon.
**Phase 5 depends on Phases 3 and 4** — reprovisioning needs recovery daemon + integrator.
**Phase 6 depends on all prior phases.**

---

## 8. Risks & Mitigations

| Risk                                                                    | Impact | Mitigation                                                                                         |
| ----------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------- |
| Enabling `RUNNER_AUTO_PUSH` causes cascading integrator failures        | High   | Gate 1 requires integration test passing before proceeding. Roll back config if failures detected. |
| `validation_failed_repairable` preserves bad state that blocks worktree | Medium | Bounded attempts (existing `RUNNER_MAX_VALIDATION_FIXES`). After threshold → revert + quarantine.  |
| Recovery daemon misclassifies executing worktree as dirty               | High   | Skip worktrees with active lease AND recent heartbeat. Grace period before any action.             |
| Reprovisioning destroys forensic evidence                               | Low    | Quarantine period before reprovision. Health file preserves snapshot at quarantine time.           |
| Overnight chaos soak reveals unknown failure modes                      | Medium | Phase 6 is verification — failures discovered here feed back into prior phases.                    |

---

## 9. Validation Commands

Each phase's gate should be verified with:

```bash
# Unit tests (single-threaded, flock-serialized)
flock -w 120 9 npx vitest run tests/unit/worktree-health.spec.ts 9>/tmp/anqr-vitest.lock
flock -w 120 9 npx vitest run tests/unit/finalization-state.spec.ts 9>/tmp/anqr-vitest.lock
flock -w 120 9 npx vitest run tests/unit/worktree-recovery.spec.ts 9>/tmp/anqr-vitest.lock

# Integration tests
flock -w 120 9 npx vitest run tests/integration/symphony-integrator.spec.ts 9>/tmp/anqr-vitest.lock
flock -w 120 9 npx vitest run tests/integration/recovery-daemon.spec.ts 9>/tmp/anqr-vitest.lock

# Safety grep: no direct main push outside integrator
git grep 'push.*origin.*HEAD:main' scripts/ops/orchestration/ | grep -v symphony-integrator

# Typecheck
flock -w 120 9 npx tsc --noEmit 9>/tmp/anqr-typecheck.lock
```

---

## 10. Definition of Done

The platform is **fully autonomous** when:

1. Work begins without human dispatch
2. Failures are detected automatically (< 2 min)
3. Same-worktree repair is automatic
4. Branch publication is automatic
5. Main integration is automatic and serialized
6. Stuck/dirty/orphaned worktrees are autonomously drained, quarantined, or reprovisioned
7. Normal scheduling resumes after recovery without human intervention
8. Human intervention is needed only for true policy exceptions or repeated irrecoverable failures
9. All of the above is externally observable via machine-readable health status

---

## 11. Next Step

Create Linear issues for each phase, starting with Phase 0 (worktree-health.mjs + state model additions). Each phase should be a single issue with its gate criteria as the acceptance checklist.

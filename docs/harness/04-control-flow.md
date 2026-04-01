# Maintained Control Flow

This document defines the maintained harness control flow for ANQR 1.0.

## Primary loop

The maintained flow is:

1. `harness-report`
2. `linear-guardian`
3. `queue control`
4. `symphony runner`
5. `notify`

## Components

### 1. Harness report

- root entrypoint: `scripts/ops/harness-report.mjs`
- implementation: `scripts/ops/reporting/harness-report.mjs`
- purpose:
  - report repo and gate health
  - provide quick, continuous, and full views

### 2. Linear guardian

- root entrypoint: `scripts/ops/linear-guardian.mjs`
- implementation: `scripts/ops/governance/linear-guardian.mjs`
- purpose:
  - enforce issue hygiene
  - create or normalize governance-level issues
  - keep required labels and policy shape intact

### 3. Queue control

- root entrypoint: `scripts/ops/symphony-queue-control.mjs`
- implementation: `scripts/ops/orchestration/symphony-queue-control.mjs`
- purpose:
  - feed execution-ready work
  - enforce queue limits
  - detect stale work
  - act as the maintenance layer behind the runner
  - evaluate queue health using `readyDepth` (Todo-only depth)

### 4. Symphony runner

- root entrypoint: `scripts/ops/symphony-runner.mjs`
- implementation: `scripts/ops/orchestration/symphony-runner.mjs`
- purpose:
  - pick ready work from Linear
  - execute via configured providers
  - run validation and evidence steps
  - update issue state and comments
  - self-feed the queue after issue completion when ready depth falls below target

Runner execution notes:

- canonical execution is from worktrees, not the main repository
- the runner auto-detects worktree context from `.git` metadata when possible
- Discord-sourced issues are routed to Discord worktrees (`wt5`-`wt8`); other Symphony work stays on `wt1`-`wt4`

### 5. Notify

- root entrypoint: `scripts/ops/notify.mjs`
- implementation: `scripts/ops/lib/notify.mjs`
- purpose:
  - send operational notifications
  - apply dedup/rate limiting to operator notifications

## Supporting flows

- nightly:
  - `scripts/ops/nightly-ops-pass.mjs`
  - orchestrates broader recurring checks and reporting
- email ingest:
  - `scripts/ops/email-ingest.mjs`
  - optional operator integration that turns selected mail into issues
- sonar sync:
  - `scripts/ops/integrations/sonar/sonar-linear-sync.mjs`
  - keeps Sonar findings visible in Linear

## Additional scripts

### Linear utilities

- `scripts/ops/linear-all.mjs` — Fetches all backlog issues from Linear, handling pagination. Used for bulk operations and reporting.
- `scripts/ops/linear-issue-review.mjs` — Performs one-time review and correction of open Linear issues to ensure they adhere to hexagonal architecture contracts.
- `scripts/ops/integrations/linear/linear-client.mjs` — Helper library for Linear API. Provides reusable functions for Linear operations (query building, mutations, etc.).

### Diagnostics

- `scripts/ops/harness-doctor.mjs` — Performs runtime diagnostics and health checks on the AI harness. Validates environment, tokens, services, and connectivity.

## Phase completion validation

For multi-phase issues, the agent MUST validate that previous phases completed successfully before proceeding:

- Check issue comments for failure indicators (provider errors, model errors, timeouts)
- If a previous phase failed, complete that phase first before moving to the next
- This prevents building on incomplete or failed work
- Particularly important when provider/model issues cause mid-execution failures

## Service management protocol

**CRITICAL: Before making ANY changes to bridge services (symphony-bridge, worktree bridges):**

1. **STOP task execution FIRST:**
   ```bash
   node scripts/ops/orchestration/symphony-control.mjs --stop
   ```
   - This prevents new tasks from starting while you make changes
   - Without this step, new tasks may start during service restart causing data loss

2. **Wait for zero concurrency:**
   ```bash
   node scripts/ops/orchestration/symphony-runner.mjs --status
   ```
   - All worktree runners must be idle (no active leases)
   - Check Discord for "(0 concurrent)" confirmation
   - Typical wait: 5-20 minutes

3. **Make your changes** (restart service, update config, etc.)

4. **RESTART task execution:**
   ```bash
   node scripts/ops/orchestration/symphony-control.mjs --start
   ```
   - **CRITICAL:** Without this step, the system remains permanently stopped
   - No work will be processed until timers are re-enabled

**This protocol applies to:**
- Agent router restart (`systemctl --user restart anqr-symphony-bridge`)
- Worktree bridge restarts (`systemctl --user restart 'anqr-symphony-bridge@*.service'`)
- Bridge configuration changes
- Any changes to `scripts/ops/integrations/model/*` bridge files
- Provider configuration updates
- Any change that requires service restart

**Why this matters:**
- Restarting bridges during active requests drops streaming connections
- Partial file writes corrupt issue state
- Lost validation results require re-execution
- Wasted provider credits from duplicate API calls

## Truth rules

- root `scripts/ops/*` entrypoints remain the stable operator contract
- structured subdirectories are the preferred implementation ownership locations
- duplicate or legacy helper locations must not be removed until their replacement path is recorded and accepted

## Degraded mode

The harness may run in degraded mode when:

- provider tokens are absent
- local model services are unavailable
- notification sinks are unavailable
- queue mutation is intentionally disabled via dry-run

In degraded mode:

- dry-run and read-only visibility are preferred
- the system must say which capability is degraded
- the public product runtime must not depend on the harness loop for basic QR generation

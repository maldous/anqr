# ANQR Webhook System Verification

## 1. Directory Overview

This directory contains tools for verifying the ANQR (Agentic Number Query Runner) webhook system, including systemd service checks, queue health monitoring, and retry state verification. The tools help diagnose issues with the Linear webhook integration and Symphony queue system.

## 2. File Summaries

### Core Modules

- **check-systemd-service.mjs** - Checks if a systemd service is active using `systemctl --user is-active`. Returns `true` if active, `false` otherwise.

- **check-systemd-timer.mjs** - Checks if a systemd timer is active using `systemctl --user is-active`. Returns `true` if active, `false` otherwise.

- **get-systemd-status.mjs** - Retrieves detailed status output for a systemd service or timer. Returns the full status output or an error message if the service is not found.

- **logger.mjs** - Shared logging module that re-exports `logInfo`, `logWarn`, and `logError` from the central logger in `../../lib/logger.mjs`.

- **main.mjs** - Main orchestration script that verifies the webhook system by checking services, timers, queue health, retry states, and stale work. It also tests queue feeding functionality.

### Generated Files

- **index.mjs** - Auto-generated facade that exports all public API members: `checkSystemdService`, `checkSystemdTimer`, `getSystemdStatus`, and `main`.

- **runtime.mjs** - Auto-generated runtime carry-forward that imports and executes the main function.

## 3. Overall Directory Function

This directory provides a comprehensive verification tool for the ANQR webhook system. The main.mjs script performs multiple health checks:

- **Systemd Services**: Checks active status of key services (anqr-linear-webhook, anqr-symphony-router, anqr-queue-feeder)
- **Systemd Timers**: Verifies runner timers (anqr-linear-runner@1-4.timer) and queue-feeder timer
- **Queue Health**: Monitors backlog, todo, and in-progress queue states, alerts if queue is low or overflowing
- **Retry State**: Identifies issues that have exhausted retries and need manual intervention
- **Stale Work Detection**: Finds "In Progress" issues older than 2 hours without active leases
- **Queue Feeding Test**: Tests feeding issues from Backlog to Todo when needed

The tools work together to provide a complete system health diagnostic for the webhook and queue infrastructure.

## 4. Usage Instructions

### Running the Verification

```bash
node ops/tools/verify-webhook-system/runtime.mjs
```

Or via the facade:

```bash
node ops/tools/verify-webhook-system/index.mjs
```

Or via the shim in ops/:

```bash
node ops/verify-webhook-system.mjs
```

### Expected Output

The script will display:
- Active and inactive systemd services
- Active and inactive systemd timers
- Queue health metrics (backlog, todo, in-progress counts)
- Retry-exhausted issues (if any)
- Stale "In Progress" issues (if any)
- Results of queue feeding test

### Recommended Actions

If issues are found, the script provides next steps:
- Enable inactive services: `systemctl --user enable --now <service>`
- Reset retry-exhausted issues: `node harness/ops/tools/reset-retry-exhausted.mjs --all`
- Recover stale work: `node harness/ops/tools/recover-stale-in-progress.mjs --dry-run`

## 5. Dependencies

### Internal Dependencies

- **../../lib/logger.mjs** - Central logging module
- **../../orchestration/symphony-queue-control.mjs** - Queue control functions (getQueueSnapshot, feedQueue)
- **../../integrations/linear/linear-client.mjs** - Linear API client (listIssuesByState)
- **../../core/symphony-state.mjs** - State management (getIssueState)

### Runtime Requirements

- **Node.js** - ESM modules with .mjs extension
- **systemd** - User-level systemctl commands
- **Running Symphony infrastructure** - Queue control and Linear client require active services

### Environment

- Requires ANQR environment with Linear API access
- Requires access to Symphony state directory
- User-level systemd services must be configured

## 6. Additional Comments

- **User-level systemd**: All service and timer checks use `--user` flag for user-level systemd units
- **Graceful degradation**: The script handles failures gracefully and continues checking even if individual checks fail
- **Safety checks**: Queue feeding only occurs when deficit > 0 to avoid overfilling
- **Stale detection threshold**: Issues are considered stale after 2 hours (120 minutes) without an active lease
- **Integration with recovery tools**: The verification script recommends running related recovery tools when issues are detected
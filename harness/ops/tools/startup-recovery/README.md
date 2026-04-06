# ANQR Startup Recovery

## 1. Directory Overview

This directory contains startup recovery tooling for the ANQR (Agentic Number Query Runner) system. It handles system startup recovery after downtime, checking and enabling services, timers, queue health, and cleaning up stale state. The recovery automation ensures the Linear webhook system returns to operational status after a restart or system failure.

## 2. File Summaries

### Core Files

- **main.mjs** - Main recovery logic implementing a 6-step recovery process:
  - **Step 1**: Check and enable core services (anqr-linear-webhook.service, anqr-symphony-router.service, anqr-queue-feeder.timer)
  - **Step 2**: Check and enable runner timers (anqr-linear-runner@1-4.timer, anqr-queue-feeder.timer)
  - **Step 3**: Check queue health and feed up to 3 issues if queue depth is low
  - **Step 4**: Check for retry-exhausted issues and reset their retry state
  - **Step 5**: Check for stale/expired leases and release them
  - **Step 6**: Final verification of active ANQR services

- **logger.mjs** - Shared logger module that creates a logger using the project's standard logger from `../../lib/logger.mjs`. Exports `logInfo`, `logWarn`, and `logError` functions.

- **run-command.mjs** - Utility function for running shell commands via `execFileSync`. Returns an object with `success` (boolean), and either `output` (on success) or `error`/`stderr` (on failure).

- **index.mjs** - Generated facade index that exports `runCommand` from `./run-command.mjs` and `main` from `./main.mjs`.

- **runtime.mjs** - Generated runtime carry-forward that imports and executes `main()` from `./index.mjs`.

## 3. Overall Directory Function

This directory provides automation for recovering the ANQR system after a restart or system downtime. The recovery script ensures:

- **Service Availability**: All required systemd user services are enabled and running
- **Timer Functionality**: All runner timers are active to process issues
- **Queue Health**: The issue queue has sufficient depth (minimum 3 issues) by feeding from Backlog if needed
- **Retry State Cleanup**: Retry-exhausted issues are reset so they can be attempted again
- **Lease Cleanup**: Stale leases are released so issues can be re-processed
- **Verification**: Final check confirms all ANQR services are operational

The recovery process is idempotent - it can be run safely even when services are already healthy.

## 4. Usage Instructions

Run the startup recovery to restore the Linear webhook system after downtime:

```bash
# Option 1: Run directly
node ops/tools/startup-recovery/main.mjs

# Option 2: Run via runtime (auto-imports and executes main)
node ops/tools/startup-recovery/runtime.mjs

# Option 3: Run via facade
node ops/tools/startup-recovery/index.mjs
```

The script uses `systemctl --user` commands to manage systemd user services. It requires systemd user mode to be available.

### What It Does

1. **Services Checked**:
   - `anqr-linear-webhook.service` - Linear webhook receiver
   - `anqr-symphony-router.service` - Symphony routing service
   - `anqr-queue-feeder.timer` - Queue feeder timer

2. **Timers Checked**:
   - `anqr-linear-runner@1.timer` through `@4.timer` - Issue processing runners
   - `anqr-queue-feeder.timer` - Queue feeding timer

3. **State Recovery**:
   - Feeds up to 3 issues from Backlog to Todo if queue is low
   - Resets retry-exhausted issues so they can be tried again
   - Releases expired leases so issues can be re-processed

## 5. Dependencies

### Internal Dependencies

- **../../lib/logger.mjs** - Standard logger creation utility
- **../../symphony-queue-control.mjs** - Queue control functions (`feedQueue`, `getQueueSnapshot`)
- **../../integrations/linear/linear-client.mjs** - Linear API client (`listIssuesByState`)
- **../../core/symphony-state.mjs** - State management (`getIssueState`, `releaseLease`, `clearCooldown`, `resetRetryState`, `recordTransition`, `findExpiredLeases`)

### Runtime Requirements

- **Node.js** - ESM modules (.mjs)
- **systemd** - User services and timers (`systemctl --user`)
- **Linear API** - Access to Linear instance for issue operations

## 6. Additional Comments

- The recovery script is designed to be idempotent - running it multiple times is safe
- Services that are already active are reported as such and not restarted
- Queue feeding only occurs if current depth is below 3 issues
- Retry-exhausted issues are reset with retry_count: 0 and cooldown cleared
- The final verification step lists all active ANQR units to confirm health
- All operations include error handling with user-friendly messages
- The script provides detailed progress output with emojis for readability
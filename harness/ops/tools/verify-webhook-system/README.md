# ANQR Webhook System Verification

## 1. Directory Overview

This directory contains tools for verifying the ANQR (Agentic Number Query Runner) webhook system,
including systemd service checks, queue health monitoring, and retry state verification. The tools
help diagnose issues with the Linear webhook integration and Symphony queue system. It currently
contains 7 files and 0 subdirectories.

## 2. File Summaries

### Files

- **check-systemd-service.mjs** - Checks if a systemd service is active using `systemctl --user is-active`. Returns `true` if active, `false` otherwise.
- **check-systemd-timer.mjs** - Checks if a systemd timer is active using `systemctl --user is-active`. Returns `true` if active, `false` otherwise.
- **get-systemd-status.mjs** - Retrieves detailed status output for a systemd service or timer. Returns the full status output or an error message if the service is not found.
- **index.mjs** - Auto-generated facade that exports all public API members: `checkSystemdService`, `checkSystemdTimer`, `getSystemdStatus`, and `main`.
- **logger.mjs** - Shared logging module that re-exports `logInfo`, `logWarn`, and `logError` from the central logger in `../../lib/logger.mjs`.
- **main.mjs** - Main orchestration script that verifies the webhook system by checking services, timers, queue health, retry states, and stale work. It also tests queue feeding functionality.
- **runtime.mjs** - Auto-generated runtime carry-forward that imports and executes the main function.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `main.mjs` coordinates the main execution
path, `runtime.mjs` provides a direct execution path. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/tools/verify-webhook-system/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.

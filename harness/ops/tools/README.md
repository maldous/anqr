# ANQR Tools

## 1. Directory Overview

This directory contains operational tooling for the ANQR (Agentic Number Query Runner) harness
system. It provides recovery, reset, and verification utilities to maintain system health and
recover from various failure states. The tools handle stale issues, retry exhaustion, startup
recovery, and webhook system verification. It currently contains 4 files and 3 subdirectories.

## 2. File Summaries

### Files

- **recover-stale-in-progress.mjs** - Auto-generated facade exporting from `./recover-stale-in-progress/index.mjs` and `./recover-stale-in-progress/runtime.mjs`. Recovers issues stuck in "In Progress" state that have gone stale.
- **reset-retry-exhausted.mjs** - Standalone script that resets retry_exhausted state for blocked issues. Allows recovery of issues that have failed due to retry exhaustion by resetting their retry count and clearing any cooldowns. Supports dry-run mode to preview what would be reset.
- **startup-recovery.mjs** - Auto-generated facade exporting from `./startup-recovery/index.mjs` and `./startup-recovery/runtime.mjs`. Provides startup recovery capabilities for the harness system.
- **verify-webhook-system.mjs** - Auto-generated facade exporting from `./verify-webhook-system/index.mjs` and `./verify-webhook-system/runtime.mjs`. Verifies the webhook system is functioning correctly.

### Child Directories

- **recover-stale-in-progress/** - This directory contains the recover-stale-in-progress automation tool for the ANQR (Agentic Number Query Runner) harness.
- **startup-recovery/** - This directory contains startup recovery tooling for the ANQR (Agentic Number Query Runner) system.
- **verify-webhook-system/** - This directory contains tools for verifying the ANQR (Agentic Number Query Runner) webhook system, including systemd service checks, queue health monitoring, and retry state verification.

## 3. Overall Directory Function

In practice, child directories split the area into smaller focused modules. The README content below
is aligned to the current immediate directory contents.

## 4. Usage Instructions

This directory is primarily consumed through its files and child modules rather than a single entry point.

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.

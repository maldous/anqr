# ANQR Tools

## 1. Directory Overview

This directory implements **ANQR Tools** within the ANQR harness. Key immediate entries include `recover-stale-in-progress.mjs`, `reset-retry-exhausted.mjs`, `verify-webhook-system.mjs`, `startup-recovery.mjs`. The current inventory is 4 non-README files and 3 subdirectories.

## 2. File Summaries

### Files

- **recover-stale-in-progress.mjs** - Facade module that re-exports public members from `./recover-stale-in-progress/index.mjs`, `./recover-stale-in-progress/runtime.mjs`.
- **reset-retry-exhausted.mjs** - Defines `main`, which orchestrates the main workflow for this directory.
- **startup-recovery.mjs** - Facade module that re-exports public members from `./startup-recovery/index.mjs`, `./startup-recovery/runtime.mjs`.
- **verify-webhook-system.mjs** - Facade module that re-exports public members from `./verify-webhook-system/index.mjs`, `./verify-webhook-system/runtime.mjs`.

### Subdirectories

- **recover-stale-in-progress/** - Contains **Recover Stale In Progress**; it contains a runtime-oriented module set with helper files, `main.mjs`, and `runtime.mjs` and has 0 child directories.
- **startup-recovery/** - Contains **ANQR Startup Recovery**; it contains a runtime-oriented module set with helper files, `main.mjs`, and `runtime.mjs` and has 0 child directories.
- **verify-webhook-system/** - Contains **ANQR Webhook System Verification**; it contains a runtime-oriented module set with helper files, `main.mjs`, and `runtime.mjs` and has 0 child directories.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory include network/API integration, and Symphony integration.

## 4. Usage Instructions

This directory does not define an obvious standalone entry point. Its files are consumed by adjacent harness modules or by child directories.

## 5. Dependencies

- **Internal relative modules** - `../core/symphony-state.mjs`, `../integrations/linear/linear-client.mjs`, `../lib/logger.mjs`, `./recover-stale-in-progress/index.mjs`, `./recover-stale-in-progress/runtime.mjs`, `./startup-recovery/index.mjs`, `./startup-recovery/runtime.mjs`, `./verify-webhook-system/index.mjs`, `./verify-webhook-system/runtime.mjs`

## 6. Additional Comments

- No direct standalone runtime entry point is defined in the immediate directory contents.

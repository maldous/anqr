# ANQR Tools

## 1. Directory Overview

This directory contains operational tooling for the ANQR (Agentic Number Query Runner) harness system. It provides recovery, reset, and verification utilities to maintain system health and recover from various failure states. The tools handle stale issues, retry exhaustion, startup recovery, and webhook system verification.

## 2. File Summaries

### Facade Modules (Auto-Generated)

- **startup-recovery.mjs** - Auto-generated facade exporting from `./startup-recovery/index.mjs` and `./startup-recovery/runtime.mjs`. Provides startup recovery capabilities for the harness system.

- **recover-stale-in-progress.mjs** - Auto-generated facade exporting from `./recover-stale-in-progress/index.mjs` and `./recover-stale-in-progress/runtime.mjs`. Recovers issues stuck in "In Progress" state that have gone stale.

- **verify-webhook-system.mjs** - Auto-generated facade exporting from `./verify-webhook-system/index.mjs` and `./verify-webhook-system/runtime.mjs`. Verifies the webhook system is functioning correctly.

### Standalone Scripts

- **reset-retry-exhausted.mjs** - Standalone script that resets retry_exhausted state for blocked issues. Allows recovery of issues that have failed due to retry exhaustion by resetting their retry count and clearing any cooldowns. Supports dry-run mode to preview what would be reset.

## 3. Overall Directory Function

This directory provides operational recovery and maintenance tools for the ANQR harness. The tools work together to:

- **Recover Stale Issues**: detect and recover issues that have been stuck in "In Progress" for too long
- **Reset Retry Exhaustion**: allow operators to manually reset issues that have exhausted their retry attempts, enabling them to be picked up again from the Backlog
- **Startup Recovery**: handle recovery operations during harness startup
- **Webhook Verification**: verify that the webhook system is functioning correctly

These tools are critical for maintaining system health and enabling manual intervention when automated recovery is insufficient.

## 4. Usage Instructions

### reset-retry-exhausted.mjs

```bash
# Dry run - show what would be reset without making changes
node ops/tools/reset-retry-exhausted.mjs --dry-run

# Reset ALL retry_exhausted issues in Backlog
node ops/tools/reset-retry-exhausted.mjs --all

# Reset specific issue by identifier
node ops/tools/reset-retry-exhausted.mjs --id=ANQ-1234
```

### Startup Recovery

```bash
node ops/tools/startup-recovery.mjs
```

### Recover Stale In Progress

```bash
node ops/tools/recover-stale-in-progress.mjs
```

### Verify Webhook System

```bash
node ops/tools/verify-webhook-system.mjs
```

## 5. Dependencies

### Internal Dependencies

- **../integrations/linear/linear-client.mjs** - For listing issues by state
- **../core/symphony-state.mjs** - For getting/resetting issue state and managing cooldowns
- **../lib/logger.mjs** - For logging functionality

### Runtime Requirements

- **Node.js** - ESM modules with .mjs extension
- **Linear API** - Access to Linear for issue state management

### Environment Variables

- **ANQR_LINEAR_API_KEY** - Linear API key for issue operations (used by linear-client.mjs)

## 6. Additional Comments

- **Manual Intervention Tools**: These tools are designed for manual operator intervention when automated recovery is insufficient. They provide safety features like --dry-run to preview changes before applying them.

- **Facade Pattern**: Most files in this directory use an auto-generated facade pattern where the original file has been decomposed into sibling modules under matching directories. The facade files maintain backwards compatibility by re-exporting from the decomposed modules.

- **State Management**: The reset-retry-exhausted.mjs tool directly manipulates issue state in symphony-state, resetting retry_count to 0 and clearing cooldowns to allow issues to be picked up again.

- **Recovery Workflow**: The typical recovery workflow involves using these tools to identify and fix issues that have become stuck, then allowing the normal queue processing to continue.
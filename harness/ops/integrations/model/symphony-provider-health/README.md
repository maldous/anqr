# ANQR Symphony Provider Health

## 1. Directory Overview

This directory contains provider health monitoring functionality for the ANQR (Agentic Number Query
Runner) Symphony orchestration system. It implements a health probing mechanism that periodically
checks provider availability and responsiveness, enabling the credit-gate to make intelligent
routing decisions based on real-time provider status. It currently contains 13 files and 0
subdirectories.

## 2. File Summaries

### Files

- **get-provider-health-state.mjs** - Module that retrieves provider health state. Exports `getProviderHealthState`.
- **health-state-file.mjs** - Module that supports health state file. Exports `HEALTH_STATE_FILE`.
- **health-states.mjs** - Defines the health state enumeration including `HEALTHY`, `DEGRADED`, `UNHEALTHY`, `UNKNOWN` states with associated metadata.
- **index.mjs** - Main module exporting the public API including `getProviderHealth`, `probeProvider`, `startHealthProbing`, `stopHealthProbing`, `HEALTH_STATES`, and configuration constants. Provides the entry point for all health monitoring functionality.
- **load-health-state.mjs** - Module that loads health state. Exports `loadHealthState`.
- **logger.mjs** - Module that provides logging helpers for. Exports `logInfo, logWarn`.
- **project-root.mjs** - Module that supports project root. Exports `PROJECT_ROOT`.
- **record-provider-health-failure.mjs** - Module that records provider health failure. Exports `recordProviderHealthFailure`.
- **record-provider-health-success.mjs** - Module that records provider health success. Exports `recordProviderHealthSuccess`.
- **save-health-state.mjs** - Module that saves health state. Exports `saveHealthState`.
- **set-provider-health-state.mjs** - Module that sets or updates provider health state. Exports `setProviderHealthState`.
- **should-retry-provider.mjs** - Module that supports should retry provider. Exports `shouldRetryProvider`.
- **state-dir.mjs** - Module that supports state dir. Exports `STATE_DIR`.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```javascript
import * as moduleApi from "./index.mjs";
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory exposes a public API through `index.mjs`.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.

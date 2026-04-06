# ANQR Symphony Provider Health

## 1. Directory Overview

This directory implements **ANQR Symphony Provider Health** within the ANQR harness. Key immediate entries include `index.mjs`, `record-provider-health-failure.mjs`, `record-provider-health-success.mjs`, `set-provider-health-state.mjs`. The current inventory is 13 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **get-provider-health-state.mjs** - Exports `getProviderHealthState`, which gets provider health state.
- **health-state-file.mjs** - Exports `HEALTH_STATE_FILE`, a shared constant used by sibling modules.
- **health-states.mjs** - Exports `HEALTH_STATES`, a shared constant used by sibling modules.
- **index.mjs** - Facade module that re-exports public members from `./health-states.mjs`, `./project-root.mjs`, `./state-dir.mjs`, `./health-state-file.mjs`, `./load-health-state.mjs`, `./save-health-state.mjs`, and 5 more siblings.
- **load-health-state.mjs** - Exports `loadHealthState`, which loads health state.
- **logger.mjs** - Shared logging helper module exporting `logInfo`, `logWarn`.
- **project-root.mjs** - Exports `PROJECT_ROOT`, a shared constant used by sibling modules.
- **record-provider-health-failure.mjs** - Exports `recordProviderHealthFailure`, which implements record provider health failure.
- **record-provider-health-success.mjs** - Exports `recordProviderHealthSuccess`, which implements record provider health success.
- **save-health-state.mjs** - Exports `saveHealthState`, which implements save health state.
- **set-provider-health-state.mjs** - Exports `setProviderHealthState`, which implements set provider health state.
- **should-retry-provider.mjs** - Exports `shouldRetryProvider`, which implements should retry provider.
- **state-dir.mjs** - Exports `STATE_DIR`, a shared constant used by sibling modules.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory include file-system access, timer, scheduling, cooldown, or watchdog behavior, Symphony integration, and git/worktree awareness.

## 4. Usage Instructions

```javascript
import * as moduleApi from "./ops/integrations/model/symphony-provider-health/index.mjs";
```

## 5. Dependencies

- **Node.js built-ins** - `node:fs`, `node:path`
- **Internal relative modules** - `../../../lib/logger.mjs`, `./get-provider-health-state.mjs`, `./health-state-file.mjs`, `./health-states.mjs`, `./load-health-state.mjs`, `./logger.mjs`, `./project-root.mjs`, `./save-health-state.mjs`, `./set-provider-health-state.mjs`, `./state-dir.mjs`

## 6. Additional Comments

- No direct standalone runtime entry point is defined in the immediate directory contents.

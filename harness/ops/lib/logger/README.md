# ANQR Logger

## 1. Directory Overview

This directory implements **ANQR Logger** within the ANQR harness. Key immediate entries include `index.mjs`, `get-caller-info.mjs`, `log-levels.mjs`, `create-logger.mjs`. The current inventory is 4 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **create-logger.mjs** - Exports `createLogger`, which creates logger.
- **get-caller-info.mjs** - Exports `getCallerInfo`, which gets caller info.
- **index.mjs** - Facade module that re-exports public members from `./log-levels.mjs`, `./get-caller-info.mjs`, `./create-logger.mjs`.
- **log-levels.mjs** - Exports `LOG_LEVELS`, a shared constant used by sibling modules.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```javascript
import * as moduleApi from "./ops/lib/logger/index.mjs";
```

## 5. Dependencies

- **Internal relative modules** - `./get-caller-info.mjs`, `./log-levels.mjs`

## 6. Additional Comments

- No direct standalone runtime entry point is defined in the immediate directory contents.

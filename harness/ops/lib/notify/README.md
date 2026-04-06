# ANQR Notify Library

## 1. Directory Overview

This directory implements **ANQR Notify Library** within the ANQR harness. Key immediate entries include `index.mjs`, `rate-limit-file.mjs`, `linear-issue-url.mjs`, `dedup-window-ms.mjs`. The current inventory is 16 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **check-dedup.mjs** - Exports `checkDedup`, which checks dedup.
- **dedup-window-ms.mjs** - Exports `DEDUP_WINDOW_MS`, a shared constant used by sibling modules.
- **dirname.mjs** - Exports `__dirname`, which implements dirname.
- **ensure-dir.mjs** - Exports `ensureDir`, which ensures dir.
- **format-issue-line.mjs** - Exports `formatIssueLine`, which formats issue line.
- **index.mjs** - Facade module that re-exports public members from `./dirname.mjs`, `./project-root.mjs`, `./state-dir.mjs`, `./rate-limit-file.mjs`, `./recipient.mjs`, `./dedup-window-ms.mjs`, and 8 more siblings.
- **linear-issue-url.mjs** - Exports `linearIssueUrl`, which implements linear issue url.
- **linear-workspace.mjs** - Exports `LINEAR_WORKSPACE`, a shared constant used by sibling modules.
- **load-state.mjs** - Exports `loadState`, which loads state.
- **logger.mjs** - Shared logging helper module exporting `logError`, `logInfo`.
- **project-root.mjs** - Exports `PROJECT_ROOT`, a shared constant used by sibling modules.
- **rate-limit-file.mjs** - Exports `RATE_LIMIT_FILE`, a shared constant used by sibling modules.
- **recipient.mjs** - Exports `RECIPIENT`, a shared constant used by sibling modules.
- **save-state.mjs** - Exports `saveState`, which implements save state.
- **send-notification.mjs** - Exports `sendNotification`, which implements send notification.
- **state-dir.mjs** - Exports `STATE_DIR`, a shared constant used by sibling modules.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory include file-system access, network/API integration, subprocess execution, and Linear integration. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```javascript
import * as moduleApi from "./ops/lib/notify/index.mjs";
```

## 5. Dependencies

- **Node.js built-ins** - `node:child_process`, `node:fs`, `node:path`, `node:url`
- **Internal relative modules** - `../logger.mjs`, `./check-dedup.mjs`, `./dedup-window-ms.mjs`, `./dirname.mjs`, `./ensure-dir.mjs`, `./linear-issue-url.mjs`, `./linear-workspace.mjs`, `./load-state.mjs`, `./logger.mjs`, `./project-root.mjs`, `./rate-limit-file.mjs`, `./recipient.mjs`

## 6. Additional Comments

- No direct standalone runtime entry point is defined in the immediate directory contents.

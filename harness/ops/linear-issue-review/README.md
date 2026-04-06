# Linear Issue Review

## 1. Directory Overview

This directory implements **Linear Issue Review** within the ANQR harness. The immediate code follows the common harness pattern of helper modules plus `main.mjs` orchestration, `index.mjs` facade exports, and `runtime.mjs` bootstrap execution. The current inventory is 18 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **add-comment.mjs** - Exports `addComment`, which implements add comment.
- **close-as-canceled.mjs** - Exports `CLOSE_AS_CANCELED`, a shared constant used by sibling modules.
- **close-as-done.mjs** - Exports `CLOSE_AS_DONE`, a shared constant used by sibling modules.
- **dry-run.mjs** - Exports `dryRun`, which implements dry run.
- **get-api-key.mjs** - Exports `getApiKey`, which gets api key.
- **index.mjs** - Facade module that re-exports public members from `./linear-api.mjs`, `./request-timeout-ms.mjs`, `./states.mjs`, `./team-id.mjs`, `./get-api-key.mjs`, `./query.mjs`, and 9 more siblings.
- **linear-api.mjs** - Exports `LINEAR_API`, a shared constant used by sibling modules.
- **list-all-open.mjs** - Exports `listAllOpen`, which lists all open.
- **logger.mjs** - Shared logging helper module exporting `logError`, `logInfo`, `logWarn`.
- **main.mjs** - Primary orchestration module for the directory. It coordinates the immediate helper modules.
- **query.mjs** - Exports `query`, which implements query.
- **request-timeout-ms.mjs** - Exports `REQUEST_TIMEOUT_MS`, a shared constant used by sibling modules.
- **runtime.mjs** - Executable runtime entry point. Imports `main()` from `./index.mjs` and invokes it.
- **scope-updates.mjs** - Exports `SCOPE_UPDATES`, a shared constant used by sibling modules.
- **states.mjs** - Exports `STATES`, a shared constant used by sibling modules.
- **stats.mjs** - Exports `stats`, which implements stats.
- **team-id.mjs** - Exports `TEAM_ID`, a shared constant used by sibling modules.
- **update-issue.mjs** - Exports `updateIssue`, which implements update issue.

## 3. Overall Directory Function

The directory is structured as a reusable module set plus an executable entry path: helper files implement the detail work, `main.mjs` coordinates it, `index.mjs` re-exports the public API, and `runtime.mjs` executes the workflow. Verified immediate files in this directory include network/API integration, timer, scheduling, cooldown, or watchdog behavior, Linear integration, Symphony integration, and git/worktree awareness. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```bash
node ops/linear-issue-review/runtime.mjs
```

## 5. Dependencies

- **Internal relative modules** - `../lib/logger.mjs`, `./add-comment.mjs`, `./close-as-canceled.mjs`, `./close-as-done.mjs`, `./dry-run.mjs`, `./get-api-key.mjs`, `./index.mjs`, `./linear-api.mjs`, `./list-all-open.mjs`, `./logger.mjs`, `./query.mjs`, `./request-timeout-ms.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.

# ANQR Linear Issue Hygiene

## 1. Directory Overview

This directory implements **ANQR Linear Issue Hygiene** within the ANQR harness. The immediate code follows the common harness pattern of helper modules plus `main.mjs` orchestration, `index.mjs` facade exports, and `runtime.mjs` bootstrap execution. The current inventory is 15 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **action-delay-ms.mjs** - Exports `ACTION_DELAY_MS`, a shared constant used by sibling modules.
- **analysis-delay-ms.mjs** - Exports `ANALYSIS_DELAY_MS`, a shared constant used by sibling modules.
- **analyze-comments.mjs** - Exports `analyzeComments`, which implements analyze comments.
- **analyze-issue.mjs** - Exports `analyzeIssue`, which implements analyze issue.
- **apply-hygiene.mjs** - Exports `applyHygiene`, which applies hygiene.
- **build-failure-summary.mjs** - Exports `buildFailureSummary`, which builds failure summary.
- **default-comment-threshold.mjs** - Exports `DEFAULT_COMMENT_THRESHOLD`, a shared constant used by sibling modules.
- **failure-patterns.mjs** - Exports `FAILURE_PATTERNS`, a shared constant used by sibling modules.
- **index.mjs** - Facade module that re-exports public members from `./default-comment-threshold.mjs`, `./systemic-failure-threshold.mjs`, `./max-description-length.mjs`, `./analysis-delay-ms.mjs`, `./action-delay-ms.mjs`, `./failure-patterns.mjs`, and 6 more siblings.
- **logger.mjs** - Shared logging helper module exporting `logDebug`, `logError`, `logInfo`, `logWarn`.
- **main.mjs** - Primary orchestration module for the directory. It coordinates the immediate helper modules.
- **max-description-length.mjs** - Exports `MAX_DESCRIPTION_LENGTH`, a shared constant used by sibling modules.
- **parse-args.mjs** - Exports `parseArgs`, which parses args.
- **runtime.mjs** - Executable runtime entry point. Imports `main()` from `./index.mjs` and invokes it.
- **systemic-failure-threshold.mjs** - Exports `SYSTEMIC_FAILURE_THRESHOLD`, a shared constant used by sibling modules.

## 3. Overall Directory Function

The directory is structured as a reusable module set plus an executable entry path: helper files implement the detail work, `main.mjs` coordinates it, `index.mjs` re-exports the public API, and `runtime.mjs` executes the workflow. Verified immediate files in this directory include timer, scheduling, cooldown, or watchdog behavior, and Linear integration. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```bash
node ops/integrations/linear/issue-hygiene/runtime.mjs
```

## 5. Dependencies

- **Internal relative modules** - `../../../lib/logger.mjs`, `../linear-client.mjs`, `./action-delay-ms.mjs`, `./analysis-delay-ms.mjs`, `./analyze-comments.mjs`, `./analyze-issue.mjs`, `./apply-hygiene.mjs`, `./build-failure-summary.mjs`, `./default-comment-threshold.mjs`, `./failure-patterns.mjs`, `./index.mjs`, `./logger.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.

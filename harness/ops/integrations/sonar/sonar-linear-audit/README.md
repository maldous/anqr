# ANQR Sonar-Linear Audit

## 1. Directory Overview

This directory implements **ANQR Sonar-Linear Audit** within the ANQR harness. The immediate code follows the common harness pattern of helper modules plus `main.mjs` orchestration, `index.mjs` facade exports, and `runtime.mjs` bootstrap execution. The current inventory is 10 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **consolidated-issue-title.mjs** - Exports `CONSOLIDATED_ISSUE_TITLE`, a shared constant used by sibling modules.
- **find-or-create-consolidated-issue.mjs** - Exports `findOrCreateConsolidatedIssue`, which finds or create consolidated issue.
- **index.mjs** - Facade module that re-exports public members from `./sonar-token.mjs`, `./sonar-host.mjs`, `./project-key.mjs`, `./consolidated-issue-title.mjs`, `./resolve-stale-linear-issues.mjs`, `./find-or-create-consolidated-issue.mjs`, and 1 more sibling.
- **logger.mjs** - Shared logging helper module exporting `logError`, `logInfo`.
- **main.mjs** - Primary orchestration module for the directory. It coordinates the immediate helper modules.
- **project-key.mjs** - Exports `PROJECT_KEY`, a shared constant used by sibling modules.
- **resolve-stale-linear-issues.mjs** - Exports `resolveStaleLinearIssues`, which resolves stale linear issues.
- **runtime.mjs** - Executable runtime entry point. Imports `main()` from `./index.mjs` and invokes it.
- **sonar-host.mjs** - Exports `SONAR_HOST`, a shared constant used by sibling modules.
- **sonar-token.mjs** - Exports `SONAR_TOKEN`, a shared constant used by sibling modules.

## 3. Overall Directory Function

The directory is structured as a reusable module set plus an executable entry path: helper files implement the detail work, `main.mjs` coordinates it, `index.mjs` re-exports the public API, and `runtime.mjs` executes the workflow. Verified immediate files in this directory include network/API integration, Linear integration, and SonarQube integration. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```bash
node ops/integrations/sonar/sonar-linear-audit/runtime.mjs
```

## 5. Dependencies

- **Internal relative modules** - `../../../lib/logger.mjs`, `../../../lib/notify.mjs`, `../../../lib/sonar-linear-sync.mjs`, `../../linear/linear-client.mjs`, `./consolidated-issue-title.mjs`, `./find-or-create-consolidated-issue.mjs`, `./index.mjs`, `./logger.mjs`, `./project-key.mjs`, `./resolve-stale-linear-issues.mjs`, `./sonar-host.mjs`, `./sonar-token.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.

# ANQR GitHub-Linear Sync Audit

## 1. Directory Overview

This directory implements **ANQR GitHub-Linear Sync Audit** within the ANQR harness. The immediate code follows the common harness pattern of helper modules plus `main.mjs` orchestration, `index.mjs` facade exports, and `runtime.mjs` bootstrap execution. The current inventory is 12 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **audit-sync.mjs** - Exports `auditSync`, which audits sync.
- **close-git-hub-issue.mjs** - Exports `closeGitHubIssue`, which implements close git hub issue.
- **extract-linear-identifier.mjs** - Exports `extractLinearIdentifier`, which implements extract linear identifier.
- **fetch-git-hub-issues.mjs** - Exports `fetchGitHubIssues`, which fetches git hub issues.
- **get-git-hub-token.mjs** - Exports `getGitHubToken`, which gets git hub token.
- **github-api.mjs** - Exports `GITHUB_API`, a shared constant used by sibling modules.
- **github-repo.mjs** - Exports `GITHUB_REPO`, a shared constant used by sibling modules.
- **index.mjs** - Facade module that re-exports public members from `./github-api.mjs`, `./github-repo.mjs`, `./request-timeout-ms.mjs`, `./get-git-hub-token.mjs`, `./fetch-git-hub-issues.mjs`, `./close-git-hub-issue.mjs`, and 3 more siblings.
- **logger.mjs** - Shared logging helper module exporting `logDebug`, `logError`, `logInfo`, `logWarn`.
- **main.mjs** - Primary orchestration module for the directory. It coordinates the immediate helper modules.
- **request-timeout-ms.mjs** - Exports `REQUEST_TIMEOUT_MS`, a shared constant used by sibling modules.
- **runtime.mjs** - Executable runtime entry point. Imports `main()` from `./index.mjs` and invokes it.

## 3. Overall Directory Function

The directory is structured as a reusable module set plus an executable entry path: helper files implement the detail work, `main.mjs` coordinates it, `index.mjs` re-exports the public API, and `runtime.mjs` executes the workflow. Verified immediate files in this directory include network/API integration, timer, scheduling, cooldown, or watchdog behavior, Linear integration, and git/worktree awareness. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```bash
node ops/integrations/linear/github-linear-sync-audit/runtime.mjs
```

## 5. Dependencies

- **Internal relative modules** - `../../../lib/logger.mjs`, `../linear-client.mjs`, `./audit-sync.mjs`, `./close-git-hub-issue.mjs`, `./extract-linear-identifier.mjs`, `./fetch-git-hub-issues.mjs`, `./get-git-hub-token.mjs`, `./github-api.mjs`, `./github-repo.mjs`, `./index.mjs`, `./logger.mjs`, `./request-timeout-ms.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.

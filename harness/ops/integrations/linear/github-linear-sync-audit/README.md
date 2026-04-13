# Github Linear Sync Audit

## Purpose
Directory for Linear ingestion, reconciliation, or issue management; immediate files include `audit-sync.mjs`, `close-git-hub-issue.mjs`, `extract-linear-identifier.mjs`, `fetch-git-hub-issues.mjs`, and others.

## Contents
- 12 immediate files
- 0 child directories

## Key Files
- `audit-sync.mjs` - Exports `auditSync`, the main helper defined in this file.
- `close-git-hub-issue.mjs` - Exports `closeGitHubIssue`, the main helper defined in this file.
- `extract-linear-identifier.mjs` - Exports `extractLinearIdentifier`, the main helper defined in this file.
- `fetch-git-hub-issues.mjs` - Exports `fetchGitHubIssues`, the main helper defined in this file.
- `get-git-hub-token.mjs` - Exports `getGitHubToken`, the main helper defined in this file.
- `github-api.mjs` - Exports `GITHUB_API`, a shared constant or state value used by sibling modules.
- `github-repo.mjs` - Exports `GITHUB_REPO`, a shared constant or state value used by sibling modules.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `main.mjs` - Exports `main`, the main helper defined in this file.
- `request-timeout-ms.mjs` - Exports `REQUEST_TIMEOUT_MS`, a shared constant or state value used by sibling modules.
- `runtime.mjs` - Executable runtime bootstrap for this directory.

## Subdirectories
- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 12 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus
Check whether the external-system contract in this directory still matches live usage and the intended control-plane boundaries.

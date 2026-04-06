# ANQR GitHub-Linear Sync Audit

## 1. Directory Overview

This directory contains automation for auditing the synchronization between GitHub Issues and Linear
issue tracking. It provides tools to identify orphaned GitHub issues (not linked to active Linear
issues), detect ambiguous references, and optionally close orphaned issues automatically. The module
ensures that GitHub Issues are only used as mirrors for Linear issues and helps maintain a clean
issue state by closing unreferenced or stale GitHub issues. It currently contains 12 files and 0
subdirectories.

## 2. File Summaries

### Files

- **audit-sync.mjs** - Main audit logic that fetches GitHub and Linear issues, analyzes their relationship, and reports findings. Supports optional orphan closure with `--close-orphans` flag. Categorizes issues into linked, orphaned, and ambiguous groups.
- **close-git-hub-issue.mjs** - Closes a GitHub issue via the API with "not_planned" state reason. Automatically adds a comment explaining why the issue was closed, directing users to use Linear for issue tracking.
- **extract-linear-identifier.mjs** - Extracts Linear issue identifiers from GitHub issue titles and bodies using regex patterns. Supports patterns like ANQR-123, [ANQR-123], and "Linear: ANQR-123". Returns a deduplicated array of found identifiers.
- **fetch-git-hub-issues.mjs** - Fetches open GitHub issues from the configured repository using the GitHub REST API with pagination support. Filters out pull requests from the results. Uses a 20-second timeout for requests.
- **get-git-hub-token.mjs** - Retrieves the GitHub personal access token from the `GITHUB_TOKEN` environment variable. Throws an error if not set.
- **github-api.mjs** - Exports the GitHub API base URL constant (`https://api.github.com`).
- **github-repo.mjs** - Exports the GitHub repository constant, defaulting to `maldous/anqr` from the `GITHUB_REPO` environment variable.
- **index.mjs** - Facade index exporting all public API members including constants, functions, and the main entry point. Re-exports from all other modules for convenient imports.
- **logger.mjs** - Shared logger module using the project's standard logger from `../../../lib/logger.mjs`. Exports `logInfo`, `logError`, `logWarn`, and `logDebug` functions.
- **main.mjs** - CLI entry point that parses command-line arguments and invokes the audit sync process. Supports `--close-orphans` flag to automatically close orphaned GitHub issues.
- **request-timeout-ms.mjs** - Exports the request timeout constant (20,000 ms) for API calls.
- **runtime.mjs** - Generated runtime carry-forward that imports and executes the main function via `await main()`. Used for direct execution of the module.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `main.mjs` coordinates the main execution
path, `runtime.mjs` provides a direct execution path. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/integrations/linear/github-linear-sync-audit/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.

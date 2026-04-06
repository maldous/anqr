# Linear Issue Review

## 1. Directory Overview

This directory contains automation tools for reviewing and managing Linear issues as part of the
ANQR (Agentic Number Query Runner) harness governance system. It provides batch operations to close
resolved issues, cancel stale issues, and apply scope review comments to align issues with current
architecture and launch scope. It currently contains 18 files and 0 subdirectories.

## 2. File Summaries

### Files

- **add-comment.mjs** - Adds comments to issues via GraphQL mutation.
- **close-as-canceled.mjs** - Map of issue identifiers to cancellation reasons for stale issues to cancel.
- **close-as-done.mjs** - Map of issue identifiers to closure evidence for issues to close as Done. Contains ~20 completed architecture work items (e.g., src/ decomposition, symphony implementation, queue control).
- **dry-run.mjs** - Detects `--dry-run` CLI flag.
- **get-api-key.mjs** - Retrieves `LINEAR_API_KEY` from environment, throws if not set.
- **index.mjs** - Generated facade index that re-exports all public API members including `LINEAR_API`, `REQUEST_TIMEOUT_MS`, `STATES`, `TEAM_ID`, `getApiKey`, `query`, `updateIssue`, `addComment`, `listAllOpen`, `CLOSE_AS_DONE`, `CLOSE_AS_CANCELED`, `SCOPE_UPDATES`, `dryRun`, `stats`, and `main`.
- **linear-api.mjs** - Linear GraphQL API endpoint constant (`https://api.linear.app/graphql`).
- **list-all-open.mjs** - Lists all open issues (Backlog, Todo, In Progress, In Review, Blocked, Human Review) with pagination.
- **logger.mjs** - Shared logger using `../lib/logger.mjs`, exports `logInfo`, `logWarn`, `logError`.
- **main.mjs** - Main orchestration module that processes open issues in three phases: (1) close completed issues as Done, (2) cancel stale issues, (3) add scope review comments. Supports `--dry-run` flag for testing.
- **query.mjs** - GraphQL query executor with 20-second timeout, handles API errors and response parsing.
- **request-timeout-ms.mjs** - Request timeout constant (20,000ms).
- **runtime.mjs** - Generated runtime carry-forward that imports and executes the main function via `await main()`.
- **scope-updates.mjs** - Map of issue identifiers to scope review comments for issues needing scope alignment. Contains ~20 scope corrections for 1.0 launch truth and architecture alignment.
- **states.mjs** - Linear state UUIDs for: backlog, todo, inProgress, inReview, done, canceled.
- **stats.mjs** - Mutable stats object tracking: done, canceled, updated, skipped, errors.
- **team-id.mjs** - Team ID constant (`01534c1e-4041-474d-a81e-24f917f33912`).
- **update-issue.mjs** - Updates issue fields (state, title, etc.) via GraphQL mutation.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `main.mjs` coordinates the main execution
path, `runtime.mjs` provides a direct execution path. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/linear-issue-review/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.

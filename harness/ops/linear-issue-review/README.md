# Linear Issue Review

## 1. Directory Overview

This directory contains automation tools for reviewing and managing Linear issues as part of the ANQR (Agentic Number Query Runner) harness governance system. It provides batch operations to close resolved issues, cancel stale issues, and apply scope review comments to align issues with current architecture and launch scope.

## 2. File Summaries

### Core Entry Points

- **index.mjs** - Generated facade index that re-exports all public API members including `LINEAR_API`, `REQUEST_TIMEOUT_MS`, `STATES`, `TEAM_ID`, `getApiKey`, `query`, `updateIssue`, `addComment`, `listAllOpen`, `CLOSE_AS_DONE`, `CLOSE_AS_CANCELED`, `SCOPE_UPDATES`, `dryRun`, `stats`, and `main`.

- **runtime.mjs** - Generated runtime carry-forward that imports and executes the main function via `await main()`.

- **main.mjs** - Main orchestration module that processes open issues in three phases: (1) close completed issues as Done, (2) cancel stale issues, (3) add scope review comments. Supports `--dry-run` flag for testing.

### Query and API

- **query.mjs** - GraphQL query executor with 20-second timeout, handles API errors and response parsing.

- **linear-api.mjs** - Linear GraphQL API endpoint constant (`https://api.linear.app/graphql`).

- **get-api-key.mjs** - Retrieves `LINEAR_API_KEY` from environment, throws if not set.

- **request-timeout-ms.mjs** - Request timeout constant (20,000ms).

### Issue Operations

- **update-issue.mjs** - Updates issue fields (state, title, etc.) via GraphQL mutation.

- **add-comment.mjs** - Adds comments to issues via GraphQL mutation.

- **list-all-open.mjs** - Lists all open issues (Backlog, Todo, In Progress, In Review, Blocked, Human Review) with pagination.

### Configuration and State

- **states.mjs** - Linear state UUIDs for: backlog, todo, inProgress, inReview, done, canceled.

- **team-id.mjs** - Team ID constant (`01534c1e-4041-474d-a81e-24f917f33912`).

- **dry-run.mjs** - Detects `--dry-run` CLI flag.

- **stats.mjs** - Mutable stats object tracking: done, canceled, updated, skipped, errors.

### Issue Collections

- **close-as-done.mjs** - Map of issue identifiers to closure evidence for issues to close as Done. Contains ~20 completed architecture work items (e.g., src/ decomposition, symphony implementation, queue control).

- **close-as-canceled.mjs** - Map of issue identifiers to cancellation reasons for stale issues to cancel.

- **scope-updates.mjs** - Map of issue identifiers to scope review comments for issues needing scope alignment. Contains ~20 scope corrections for 1.0 launch truth and architecture alignment.

### Utilities

- **logger.mjs** - Shared logger using `../lib/logger.mjs`, exports `logInfo`, `logWarn`, `logError`.

## 3. Overall Directory Function

This directory provides automated issue governance for the ANQR project. The main workflow:

1. **List Open Issues** - Fetch all open issues from Linear team via pagination
2. **Close Completed** - For issues in `CLOSE_AS_DONE`, add evidence comment and transition to Done state
3. **Cancel Stale** - For issues in `CLOSE_AS_CANCELED`, add reason comment and transition to Canceled state
4. **Scope Review** - For issues in `SCOPE_UPDATES`, add scope review comment to align with current architecture/1.0 scope
5. **Report Summary** - Print stats showing counts by action type

The tool ensures issues stay aligned with current architecture (e.g., after src/ decomposition into packages/) and 1.0 launch scope (web + netlify only). It supports dry-run mode for testing without making actual API calls.

## 4. Usage Instructions

### Running the Review

```bash
# Via facade (recommended)
node ops/linear-issue-review/runtime.mjs
```

Or directly:

```bash
node ops/linear-issue-review/main.mjs
```

### Dry Run Mode

To test without making actual Linear API calls:

```bash
node ops/linear-issue-review/main.mjs --dry-run
```

This will show what actions would be taken without modifying any issues.

### Prerequisites

- `LINEAR_API_KEY` environment variable set with valid Linear API token
- Network access to `https://api.linear.app/graphql`

### Output

Actions are logged with icons:

- `Done` (Issue closed as completed)
- `Canceled` (Issue closed as stale/canceled)
- `Updated` (Scope review comment added)
- `Skipped` (Issue not found in open list)
- `Error` (API call failed)

A summary is printed showing counts by action type.

## 5. Dependencies

### Internal Dependencies

- **../lib/logger.mjs** - Logger factory for consistent logging

### External Services

- **Linear** - Issue tracking and management platform (GraphQL API)

### Environment Requirements

- Node.js with ESM support (.mjs files)
- Valid Linear API credentials in `LINEAR_API_KEY` environment variable

## 6. Additional Comments

- **Batch Processing** - The tool processes all open issues in bulk rather than one-by-one, making it efficient for regular governance sweeps.

- **Stale Auto-Detection** - Issues in `CLOSE_AS_CANCELED` are typically stale guardian-created issues that are no longer relevant.

- **Scope Review Categories** - The scope updates cover two main categories: (1) 1.0 launch truth alignment (narrowing to web + netlify), (2) architecture alignment (updating references from old src/ to new packages/).

- **Evidence-Based Closures** - When closing issues as Done, the tool adds detailed evidence explaining why the issue is being closed (e.g., "src/modules/ no longer exists - all module directories dissolved into packages/").

- **Graceful Degradation** - If an individual API call fails, the tool logs the error and continues processing remaining issues rather than aborting.
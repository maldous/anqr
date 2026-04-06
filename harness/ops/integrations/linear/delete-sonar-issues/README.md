# ANQR Linear Delete Sonar Issues

## 1. Directory Overview

This directory contains functionality to identify and delete Sonar-generated issues from Linear. It is part of the Linear integrations layer in the ANQR (Agentic Number Query Runner) harness system. The module scans all Linear issues across all states and removes issues with "[Sonar]" in their title, helping to clean up stale or obsolete Sonar code quality tracking issues.

## 2. File Summaries

### Core Implementation Files

- **main.mjs** - Main orchestration module that coordinates the entire deletion workflow. It fetches all issues across 8 states (Backlog, Todo, In Progress, In Review, Blocked, Human Review, Done, Canceled), filters for issues containing "[Sonar]" in the title, displays them for review, and then deletes each one with proper error handling. Reports summary statistics (deleted, failed, total counts) upon completion.

- **delete-issue.mjs** - Provides the `deleteIssue` function that executes a GraphQL mutation to delete a specific issue by ID. Uses the `query` helper from `../linear-client.mjs` to perform the `issueDelete` mutation. Throws an error if deletion fails and returns the success status on success.

- **logger.mjs** - Shared logging utility module that creates a module-specific logger using `createLogger` from the centralized `../../../lib/logger.mjs`. Exports `logInfo`, `logWarn`, and `logError` functions for consistent logging across the module.

### Generated Files

- **index.mjs** - Auto-generated facade index that exports the public API surface: `deleteIssue` from `delete-issue.mjs` and `main` from `main.mjs`. This provides a clean public interface for importing the module's functionality.

- **runtime.mjs** - Auto-generated runtime carry-forward that imports the main function from `./index.mjs` and executes it. This serves as the CLI entry point for running the module directly.

## 3. Overall Directory Function

This directory provides a cleanup utility for managing Sonar-related issues in Linear. The workflow:

1. `main()` is invoked (via `runtime.mjs`)
2. Fetches all issues across 8 states using `listIssuesByState`
3. Filters issues where `issue.title.includes("[Sonar]")`
4. Displays each Sonar issue with its identifier, title, state, labels, and creation date
5. Warns that deletion is about to begin
6. Iterates through each Sonar issue calling `deleteIssue`
7. Tracks success/failure counts and reports final statistics

The module is useful for periodic cleanup of stale Sonar issues that have been resolved or are no longer relevant. It provides visibility into what will be deleted before actually performing deletions.

## 4. Usage Instructions

### Running the Module

```bash
# Via runtime (recommended entry point)
node ops/integrations/linear/delete-sonar-issues/runtime.mjs
```

Or via the facade:

```bash
node ops/integrations/linear/delete-sonar-issues/index.mjs
```

### Programmatic Usage

```javascript
import { deleteIssue, main } from "./ops/integrations/linear/delete-sonar-issues/index.mjs";

// Run the full deletion workflow
await main();

// Delete a specific issue by ID
await deleteIssue("issue-id-here");
```

### Expected Output

The module displays:

- Count of Sonar issues found
- Detailed list of each issue (identifier, title, state, labels, creation date)
- Warning before deletion begins
- Deletion progress with success/failure indicators
- Final summary (Deleted: X, Failed: Y, Total: Z)

## 5. Dependencies

### Internal Dependencies

- **../linear-client.mjs** - Provides `query` for GraphQL mutations and `listIssuesByState` for fetching issues across all states
- **../../../lib/logger.mjs** - Centralized logging utility (`createLogger`)

### External Services

- **Linear API** - Requires valid Linear API credentials configured in the environment

### Runtime Requirements

- Node.js with ESM support (.mjs files)
- Valid Linear API credentials
- Network access to Linear's GraphQL API

## 6. Additional Comments

- **State Coverage**: The module queries all 8 Linear states to ensure comprehensive coverage of Sonar issues across the entire project lifecycle.

- **Error Handling**: Individual deletion failures are caught and reported without stopping the overall process, allowing partial cleanup to complete even if some issues fail to delete.

- **Visibility**: The module shows exactly what will be deleted before performing deletions, allowing operators to verify the list.

- **Use Case**: This utility is typically run manually or on a schedule to clean up Sonar issues that were auto-created but are no longer needed (e.g., after code is refactored, issues are resolved in other ways, or the project no longer uses Sonar).

# ANQR Linear Export Issues

## 1. Directory Overview

This directory contains the Linear issue export functionality for the ANQR (Agentic Number Query Runner) harness. It provides the capability to export Linear issues (both open and recently completed) to JSON files for reporting, backup, or further processing purposes.

## 2. File Summaries

### Facade Module

- **index.mjs** - Auto-generated facade index that exports all public API members: `OPEN_STATES`, `DONE_DAYS_LOOKBACK`, `OUTPUT_DIR`, `OUTPUT_FILE`, `fetchRecentDoneIssues`, and `main`.

### Runtime

- **runtime.mjs** - Generated runtime carry-forward that imports and executes the main function. This is the CLI entry point for running the export.

### Configuration Files

- **done-days-lookback.mjs** - Exports `DONE_DAYS_LOOKBACK = 90`, defining how many days back to look for recently completed issues.

- **open-states.mjs** - Exports `OPEN_STATES` array containing the states considered "open": Backlog, Todo, In Progress, In Review, Blocked, and Human Review.

- **output-dir.mjs** - Exports `OUTPUT_DIR = "reports/linear-export"`, the directory where exports are written.

- **output-file.mjs** - Exports `OUTPUT_FILE = "reports/linear-export/issues-latest.json"`, the full path to the output JSON file.

### Core Implementation

- **main.mjs** - Main export orchestration. Fetches open issues, fetches recent Done issues (last 90 days), combines them (filtering out Canceled), and writes to JSON. Also prints state distribution summary.

- **fetch-recent-done-issues.mjs** - Function to fetch issues in "Done" state updated within the specified number of days. Uses pagination to fetch all results and returns an array of issue nodes with id, identifier, title, description, priority, state, labels, createdAt, and updatedAt.

### Utilities

- **logger.mjs** - Shared logger for this module using the centralized logger from `../../../lib/logger.mjs`. Exports `logInfo` and `logError`.

## 3. Overall Directory Function

This directory serves as the Linear issue data export layer for the ANQR harness. It works in conjunction with the Linear client (`../linear-client.mjs`) to fetch issue data and write it to JSON files.

The export workflow:

1. Fetch all open issues (states: Backlog, Todo, In Progress, In Review, Blocked, Human Review)
2. Fetch recently Done issues (updated in the last 90 days)
3. Combine and filter out "Canceled" issues
4. Write to `reports/linear-export/issues-latest.json`
5. Print state distribution summary

This export is used by other harness modules for reporting, backup, or further processing of Linear issue data.

## 4. Usage Instructions

### Running the Export

```bash
# Via runtime (CLI entry point)
node ops/integrations/linear/export-issues/runtime.mjs
```

Or programmatically:

```javascript
import { main } from "./ops/integrations/linear/export-issues/index.mjs";

await main();
```

### Output

The export creates:

- `reports/linear-export/` directory (if not exists)
- `reports/linear-export/issues-latest.json` - JSON file containing all exported issues

Example output:

```
[export-issues] Starting Linear issue export...
[export-issues] Fetching open issues...
[export-issues] Found 42 open issues
[export-issues] Fetching Done issues updated in last 90 days...
[export-issues] Found 15 recent Done issues
[export-issues] Total issues after filtering: 57
[export-issues] Export complete: reports/linear-export/issues-latest.json
[export-issues] Exported 57 issues

[export-issues] State distribution:
  Backlog: 20
  Todo: 15
  In Progress: 12
  Done: 10
```

## 5. Dependencies

### Internal Dependencies

- **../linear-client.mjs** - Linear API client (`query`, `listIssuesByState`, `TEAM_ID`)
- **../../../lib/logger.mjs** - Centralized logger factory

### Runtime Requirements

- Node.js with ESM support (.mjs files)
- Valid Linear API credentials configured in environment
- Write access to `reports/linear-export/` directory

### External Services

- **Linear** - Issue tracking platform (via linear-client.mjs)

## 6. Additional Comments

- **Pagination**: The fetch functions handle pagination automatically to retrieve all issues.
- **Filtering**: "Canceled" issues are filtered out from the final export.
- **State Distribution**: The main function prints a summary of issues by state after export.
- **Days Lookback**: The 90-day lookback for Done issues can be adjusted via the `DONE_DAYS_LOOKBACK` constant.
- **Open States**: The set of states considered "open" is configurable via `OPEN_STATES`.

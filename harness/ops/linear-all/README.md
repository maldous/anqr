# ANQR Linear All

## 1. Directory Overview

This directory contains the Linear backlog issue exporter for the ANQR (Agentic Number Query Runner) harness. It fetches all issues in "backlog" state from a Linear team and provides summary statistics organized by project. The module uses the Linear GraphQL API with pagination to handle large numbers of issues efficiently.

## 2. File Summaries

### Core Modules

- **is-main.mjs** - Entry point detection utility. Exports `isMain` which checks if the current module is the main entry point by comparing `process.argv[1]` against `fileURLToPath(import.meta.url)`.

- **query.mjs** - GraphQL query definition. Contains a `query` constant that fetches backlog issues with pagination support. The query retrieves issue `id`, `identifier`, `team.name`, and `project.name` for each issue, along with `pageInfo` for cursor-based pagination.

- **api-key.mjs** - API key configuration. Exports `API_KEY` from the `LINEAR_API_KEY` environment variable, required for authenticating with the Linear API.

- **logger.mjs** - Shared logging utility. Imports `createLogger` from `../lib/logger.mjs` and exports `logInfo` and `logError` functions for consistent logging throughout the module.

- **team-id.mjs** - Team identifier configuration. Exports `TEAM_ID` from the `LINEAR_TEAM_ID` environment variable, with a default fallback to `"01534c1e-4041-474d-a81e-24f917f33912"`.

- **fetch-page.mjs** - Pagination handler. Exports `fetchPage(after)` function that makes POST requests to the Linear GraphQL API with the query and variables. Handles errors and returns the issues data with pagination info.

- **main.mjs** - Main orchestration logic. Exports an async `main()` function that iterates through all backlog issues using pagination, collects them into an array, prints progress for each page, and outputs a summary grouped by project. Saves the full data to `/tmp/linear-all-backlog.json`.

- **index.mjs** - Facade index. Re-exports all public API members from the sibling modules: `API_KEY`, `TEAM_ID`, `query`, `fetchPage`, `main`, and `isMain`.

- **runtime.mjs** - Runtime carry-forward. Entry point that checks for the `LINEAR_API_KEY` environment variable, validates it exists, and executes `main()` if running as the main module. Handles errors gracefully with logging.

## 3. Overall Directory Function

This directory provides a CLI tool for exporting all backlog issues from a Linear team. The workflow begins in `runtime.mjs` which validates the API key is set, then invokes the main function from `main.mjs`. The main function iteratively fetches pages of issues using `fetchPage.mjs`, which executes the GraphQL query from `query.mjs` against the Linear API.

After collecting all issues, the module groups them by project and outputs a sorted summary showing issue counts per project. Finally, the complete issue data is saved to `/tmp/linear-all-backlog.json` for further processing or analysis.

The module uses cursor-based pagination to handle teams with many backlog issues without overwhelming memory or the API. Each page fetches up to 250 issues at a time, with progress logging for visibility into the export process.

## 4. Usage Instructions

### Prerequisites

```bash
export LINEAR_API_KEY="your_linear_api_key"
export LINEAR_TEAM_ID="your_team_id"  # Optional, has default
```

### Run the Exporter

```bash
node harness/ops/linear-all/runtime.mjs
```

Or via the facade:

```bash
LINEAR_API_KEY=your_key node harness/ops/linear-all.mjs
```

### Output

The script prints progress for each page fetched:
```
Fetching backlog issues for team: 01534c1e-4041-474d-a81e-24f917f33912

Page 1: +250 issues (total: 250)
Page 2: +250 issues (total: 500)
...

=== Total backlog issues: 1234 ===

By project:
  Project A: 500
  Project B: 400
  No Project: 334
```

The complete data is saved to `/tmp/linear-all-backlog.json`.

## 5. Dependencies

### Environment Variables

- **LINEAR_API_KEY** (required) - Linear API key for authentication
- **LINEAR_TEAM_ID** (optional) - Linear team ID, defaults to `"01534c1e-4041-474d-a81e-24f917f33912"`

### Internal Dependencies

- **../lib/logger.mjs** - Shared logging utility (`createLogger`)

### External Services

- **Linear API** - GraphQL API at `https://api.linear.app/graphql`

### Runtime Requirements

- Node.js with ESM support (.mjs files)
- Network access to Linear API

## 6. Additional Comments

- **Pagination Strategy**: Uses cursor-based pagination via GraphQL's `pageInfo.hasNextPage` and `pageInfo.endCursor` to iterate through all backlog issues efficiently.

- **Error Handling**: The fetch-page module throws errors if the GraphQL API returns errors, and the runtime catches and logs these with `logError`.

- **Default Team**: The default team ID provides a fallback for development but should be overridden via environment variable for production use.

- **Output Location**: The JSON output is written to `/tmp/linear-all-backlog.json` - a temporary location that can be changed in `main.mjs` if needed.
# export-linear-all

## 1. Directory Overview

This directory contains tooling to fetch and export all Linear issues for a specific team to a JSON file. It provides a simple interface to retrieve complete issue data including comments, labels, and state information from the Linear API.

## 2. File Summaries

### fetch-all-issues.mjs

Exports the `fetchAllIssues()` function which performs paginated GraphQL queries to retrieve all issues from the configured Linear team. The function:

- Queries issues in batches of 50 using cursor-based pagination
- Fetches comprehensive issue data including: id, identifier, title, description, priority, state, labels, and comments
- Returns an array of all issue nodes

### index.mjs

Generated facade index that re-exports `fetchAllIssues` from `./fetch-all-issues.mjs` and `main` from `./main.mjs`. Provides the public API for this module.

### main.mjs

Main entry point that orchestrates the full export workflow:

- Calls `fetchAllIssues()` to retrieve all issues
- Transforms each issue to include issue number, title, description, state, last comment, priority, labels, and timestamps
- Writes the transformed data to `linear.json`
- Prints summary statistics including state distribution and comment counts

## 3. Overall Directory Function

This directory serves as a data export utility for the Linear issue tracking system. The files work together to:

1. **fetch-all-issues.mjs** handles the low-level API communication with Linear, managing pagination to retrieve all issues
2. **main.mjs** transforms the raw issue data into a clean export format and writes it to disk
3. **index.mjs** provides a unified exports interface for external consumers

The export produces a `linear.json` file containing all issues with their current state, labels, and most recent comment (if any).

## 4. Usage Instructions

To run the export:

```bash
node export-linear-all/main.mjs
```

This will:

1. Query the Linear API for all issues in the configured team
2. Transform and export them to `linear.json` in the current directory
3. Print summary statistics (state distribution, comment counts)

**Note:** The Linear API client must be configured with valid credentials and a team ID. See the `linear-client.mjs` module in `ops/integrations/linear/` for configuration details.

## 5. Dependencies

- **Linear API** - Requires configured Linear team and API credentials (via `ops/integrations/linear/linear-client.mjs`)
- **Node.js** - Runtime environment
- **Node.js built-ins** - Uses `node:fs/promises` for file writing

## 6. Additional Comments

- The export uses cursor-based pagination to handle large numbers of issues without memory issues
- Each issue includes up to 100 comments; older comments beyond this limit are not fetched
- The output format is designed to be easily consumable by other scripts or analysis tools
- State distribution and comment statistics are printed to stdout for quick verification

# ANQR Linear Client

## 1. Directory Overview

This directory contains the Linear API client implementation for the ANQR (Agentic Number Query
Runner) harness. It provides a programmatic interface to interact with Linear's GraphQL API for
issue management, state tracking, label handling, and team operations. The client is designed to be
used by other harness modules (especially governance and orchestration) to create, update, query,
and manage Linear issues programmatically. It currently contains 20 files and 0 subdirectories.

## 2. File Summaries

### Files

- **add-comment.mjs** - Adds comments to existing issues via `commentCreate` mutation.
- **create-issue.mjs** - Creates new Linear issues using the `issueCreate` mutation. Automatically associates issues with the team ID and returns the created issue object.
- **find-open-issues-by-description-fragment.mjs** - Wrapper that filters open issues by description content fragment.
- **find-open-issues-by-identifier.mjs** - Finds issues by their identifier (e.g., "ANQR-123") using `getIssueDetail` since Linear's filter doesn't support the identifier field directly.
- **find-open-issues-by-title.mjs** - Wrapper around `findOpenIssues` that filters by title fragment using the `contains` operator.
- **find-open-issues.mjs** - Queries open issues (in states defined by `OPEN_STATE_NAMES`) with pagination support, filtering by team ID.
- **get-api-key.mjs** - Retrieves the Linear API key from the `LINEAR_API_KEY` environment variable, throwing an error if not set.
- **get-issue-detail.mjs** - Retrieves full issue details including identifier, title, description, priority, estimate, state, labels, comments, and timestamps via the `issue` query.
- **get-queue-depth.mjs** - Calculates the current queue depth by listing issues in "Todo" and "In Progress" states, filtering for automatable issues using `canExecuteIssue` from symphony-state.
- **index.mjs** - Generated facade that exports all public API members from the directory for convenient single-point imports.
- **labels.mjs** - Exports label definitions for work type taxonomy (harness, governance, hygiene, product, release, growth, incident, research), legacy check-failure labels (bug, reliability), and source attribution labels (discord).
- **linear-api.mjs** - Exports the Linear GraphQL API endpoint URL (`https://api.linear.app/graphql`).
- **list-issues-by-state.mjs** - Lists issues in specified states with full pagination support (50 items per page). Used for queue depth calculations.
- **open-state-names.mjs** - Exports an array of state names considered "open": `Backlog`, `Todo`, `In Progress`, `In Review`, `Blocked`, and `Human Review`.
- **query.mjs** - The central GraphQL query execution function. Handles authentication, request timeouts (via AbortController), error handling, and returns parsed JSON data. Used by all other API functions.
- **request-timeout-ms.mjs** - Exports the request timeout configuration (default 20 seconds, configurable via `LINEAR_REQUEST_TIMEOUT_MS` environment variable).
- **states.mjs** - Exports the workflow state mapping: `backlog`, `todo`, `inProgress`, `inReview`, `done`, and `canceled` with their corresponding Linear UUIDs.
- **team-id.mjs** - Exports the team identifier constant (`01534c1e-4041-474d-a81e-24f917f33912`) used for all issue operations.
- **update-comment.mjs** - Updates existing comments via `commentUpdate` mutation.
- **update-issue.mjs** - Updates existing issues via `issueUpdate` mutation. Supports updating title, description, priority, estimate, state, and labels.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```javascript
import * as moduleApi from "./index.mjs";
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory exposes a public API through `index.mjs`.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.

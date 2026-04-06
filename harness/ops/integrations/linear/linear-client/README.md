# ANQR Linear Client

## 1. Directory Overview

This directory contains the Linear API client implementation for the ANQR (Agentic Number Query Runner) harness. It provides a programmatic interface to interact with Linear's GraphQL API for issue management, state tracking, label handling, and team operations. The client is designed to be used by other harness modules (especially governance and orchestration) to create, update, query, and manage Linear issues programmatically.

## 2. File Summaries

### Core Configuration Files

- **linear-api.mjs** - Exports the Linear GraphQL API endpoint URL (`https://api.linear.app/graphql`).

- **team-id.mjs** - Exports the team identifier constant (`01534c1e-4041-474d-a81e-24f917f33912`) used for all issue operations.

- **request-timeout-ms.mjs** - Exports the request timeout configuration (default 20 seconds, configurable via `LINEAR_REQUEST_TIMEOUT_MS` environment variable).

- **states.mjs** - Exports the workflow state mapping: `backlog`, `todo`, `inProgress`, `inReview`, `done`, and `canceled` with their corresponding Linear UUIDs.

- **open-state-names.mjs** - Exports an array of state names considered "open": `Backlog`, `Todo`, `In Progress`, `In Review`, `Blocked`, and `Human Review`.

- **labels.mjs** - Exports label definitions for work type taxonomy (harness, governance, hygiene, product, release, growth, incident, research), legacy check-failure labels (bug, reliability), and source attribution labels (discord).

- **get-api-key.mjs** - Retrieves the Linear API key from the `LINEAR_API_KEY` environment variable, throwing an error if not set.

### Core Query Layer

- **query.mjs** - The central GraphQL query execution function. Handles authentication, request timeouts (via AbortController), error handling, and returns parsed JSON data. Used by all other API functions.

### Issue Operations

- **create-issue.mjs** - Creates new Linear issues using the `issueCreate` mutation. Automatically associates issues with the team ID and returns the created issue object.

- **update-issue.mjs** - Updates existing issues via `issueUpdate` mutation. Supports updating title, description, priority, estimate, state, and labels.

- **get-issue-detail.mjs** - Retrieves full issue details including identifier, title, description, priority, estimate, state, labels, comments, and timestamps via the `issue` query.

- **find-open-issues.mjs** - Queries open issues (in states defined by `OPEN_STATE_NAMES`) with pagination support, filtering by team ID.

- **find-open-issues-by-title.mjs** - Wrapper around `findOpenIssues` that filters by title fragment using the `contains` operator.

- **find-open-issues-by-description-fragment.mjs** - Wrapper that filters open issues by description content fragment.

- **find-open-issues-by-identifier.mjs** - Finds issues by their identifier (e.g., "ANQR-123") using `getIssueDetail` since Linear's filter doesn't support the identifier field directly.

- **list-issues-by-state.mjs** - Lists issues in specified states with full pagination support (50 items per page). Used for queue depth calculations.

### Comment Operations

- **add-comment.mjs** - Adds comments to existing issues via `commentCreate` mutation.

- **update-comment.mjs** - Updates existing comments via `commentUpdate` mutation.

### Queue Management

- **get-queue-depth.mjs** - Calculates the current queue depth by listing issues in "Todo" and "In Progress" states, filtering for automatable issues using `canExecuteIssue` from symphony-state.

### Facade Index

- **index.mjs** - Generated facade that exports all public API members from the directory for convenient single-point imports.

## 3. Overall Directory Function

This directory serves as the canonical Linear API client for the ANQR harness. It provides a clean abstraction over Linear's GraphQL API, enabling other harness modules to:

- Create and manage issues programmatically
- Query and filter issues by state, title, description, or identifier
- Add and update comments on issues
- Track queue depth for orchestration decisions
- Manage labels and states via constant definitions

The client follows a consistent pattern where each file exports a single responsibility (one function or constant), and the `index.mjs` facade provides a unified export surface. All functions use the centralized `query.mjs` for GraphQL execution, ensuring consistent authentication, timeout handling, and error management.

This module is critical for governance automation (linear-guardian.mjs) and orchestration scripts that need to interact with Linear for issue tracking and workflow management.

## 4. Usage Instructions

### Importing the Client

```javascript
import {
  createIssue,
  updateIssue,
  findOpenIssues,
  listIssuesByState,
  addComment,
  getQueueDepth,
  STATES,
  LABELS,
} from "./ops/integrations/linear/linear-client/index.mjs";
```

### Creating an Issue

```javascript
const issue = await createIssue({
  title: "Fix authentication bug",
  description: "Users cannot log in via OAuth",
  priority: 2,
  labelIds: [LABELS.bug],
});
```

### Updating an Issue

```javascript
await updateIssue(issueId, {
  stateId: STATES.inProgress,
  priority: 1,
});
```

### Adding a Comment

```javascript
await addComment(issueId, "This is being worked on by the automation system.");
```

### Querying Queue Depth

```javascript
const { total, automatable } = await getQueueDepth();
console.log(`Queue: ${automatable}/${total} automatable`);
```

### Finding Issues

```javascript
const issues = await findOpenIssuesByTitle("authentication");
```

### Prerequisites

- Set the `LINEAR_API_KEY` environment variable with a valid Linear API token
- Ensure the team ID (`01534c1e-4041-474d-a81e-24f917f33912`) corresponds to your Linear team

## 5. Dependencies

### Internal Dependencies

- **../../../symphony-state.mjs** - For `canExecuteIssue` function used in queue depth calculations

### Environment Variables

- **LINEAR_API_KEY** (required) - API token for Linear authentication
- **LINEAR_REQUEST_TIMEOUT_MS** (optional) - Request timeout in milliseconds (default: 20000)

### Runtime Requirements

- Node.js with ESM support (.mjs files)
- Network access to Linear API (`https://api.linear.app/graphql`)

### External Services

- **Linear** - Issue tracking and workflow management platform

## 6. Additional Comments

- **Fail-Fast Design**: All API functions throw errors on failure, making it easy to handle error cases in calling code.

- **Pagination**: The `listIssuesByState` function handles pagination automatically, fetching all pages until complete.

- **Timeout Protection**: Each query has a configurable timeout to prevent hanging on network issues (default 20 seconds).

- **Team-Scoped**: All issue operations are scoped to a single team defined by `TEAM_ID`, ensuring consistent context.

- **State Machine Integration**: The `STATES` and `OPEN_STATE_NAMES` constants provide a type-safe interface to Linear's workflow states.

- **Label Taxonomy**: The `LABELS` object encodes both work type taxonomy (from program documentation) and operational labels for governance and source attribution.

- **Identifier vs ID**: Note that finding issues by identifier requires using `getIssueDetail` because Linear's GraphQL filter API doesn't support the `identifier` field directly, only the internal `id`.
# ANQR Sonar-Linear Sync

## 1. Directory Overview

This directory contains the SonarQube to Linear synchronization module for the ANQR (Agentic Number Query Runner) harness. It provides automated bidirectional sync between SonarQube code quality/security findings and Linear issues, enabling tracking and resolution of code quality issues through the Linear project management workflow.

## 2. File Summaries

### Core Sync Modules

- **sync-sonar-to-linear.mjs** - Main orchestration module that fetches Sonar issues and creates/updates Linear issues. Handles priority promotion, requeue logic, stale issue resolution, and legacy issue cleanup.

- **sync-sonar-hotspots-to-linear.mjs** - Specialized sync for security hotspots. Creates `[SonarHotspot]` tagged issues with security-specific metadata (category, vulnerability probability, status).

- **sync-sonar-duplications-to-linear.mjs** - Specialized sync for code duplication issues. Creates `[SonarDup]` tagged issues with duplication-specific details (rule, severity).

- **index.mjs** - Generated facade index that exports all public API members including fetch functions, builders, sync functions, and utilities.

### Fetch Modules (SonarQube API)

- **fetch-all-sonar-issues.mjs** - Fetches all unresolved Sonar issues with pagination support. Filters out known false positives ("too many parameters", "Cognitive Complexity", "top-level await").

- **fetch-all-sonar-hotspots.mjs** - Fetches all security hotspots in "TO_REVIEW" status with pagination.

- **fetch-all-sonar-duplication-issues.mjs** - Fetches code smells filtered for duplication-related rules and messages.

- **fetch-sonar-measures.mjs** - Fetches project measures (duplication density, coverage).

- **fetch-with-timeout.mjs** - Helper function for fetch with configurable timeout (30s default).

- **sonar-auth-header.mjs** - Builds Basic auth header for SonarQube API.

### Builder Modules (Linear Format)

- **build-linear-title.mjs** - Builds Linear issue title with `[Sonar]` prefix, truncated message, and file location.

- **build-linear-description.mjs** - Builds Linear issue description with Sonar metadata (rule, severity, type, file, line, effort, message) and SonarQube link.

- **build-hotspot-linear-title.mjs** - Builds title for security hotspots with `[SonarHotspot]` prefix.

- **build-hotspot-linear-description.mjs** - Builds description for security hotspots with security category, vulnerability probability, status, and SonarQube link.

- **build-duplication-linear-title.mjs** - Builds title for duplication issues with `[SonarDup]` prefix.

- **build-duplication-linear-description.mjs** - Builds description for duplication issues with rule, severity, and SonarQube link.

- **strip-project-prefix.mjs** - Strips project key prefix from component paths for cleaner display.

### Utility Modules

- **extract-sonar-key.mjs** - Extracts Sonar key from Linear issue description using regex pattern.

- **sonar-key-pattern.mjs** - Regex pattern `<!-- sonar-key:([a-f0-9-]+) -->` for tracking Sonar-Linear correlation.

- **apply-promote-and-requeue.mjs** - Applies priority promotion and state requeue to existing Linear issues. Adds comments explaining changes.

- **resolve-stale-linear-issues.mjs** - Resolves Linear issues when corresponding Sonar findings are no longer present. Adds resolution comment and moves to Done state.

- **find-open-linear-issues-by-tag.mjs** - Queries Linear for open issues containing a specific title tag (e.g., `[Sonar]`, `[SonarHotspot]`, `[SonarDup]`).

- **priority-labels.mjs** - Mapping of priority numbers to labels: 1="Urgent", 2="High", 3="Medium", 4="Low".

- **open-state-names.mjs** - List of open Linear state names: Backlog, Todo, In Progress, In Review, Blocked, Human Review.

- **fetch-timeout-ms.mjs** - Timeout constant (30,000ms) for API calls.

- **logger.mjs** - Shared logger using the project's logger library.

## 3. Overall Directory Function

This directory serves as the integration layer between SonarQube (code quality/security analysis) and Linear (issue tracking). The sync modules work together to:

1. **Fetch** - Retrieve issues, hotspots, and duplications from SonarQube API
2. **Build** - Transform Sonar data into Linear issue format (titles, descriptions)
3. **Sync** - Create new Linear issues, update existing ones, handle stale resolution
4. **Track** - Use HTML comment anchors (`<!-- sonar-key:... -->`) to correlate Sonar and Linear

The sync handles three types of Sonar findings:
- **Regular issues** (`[Sonar]`) - Code smells, bugs, vulnerabilities
- **Security hotspots** (`[SonarHotspot]`) - Security review items
- **Duplications** (`[SonarDup]`) - Code duplication issues

Key features include:
- Automatic issue creation for new Sonar findings
- Priority promotion when higher priority is detected
- Requeue to Todo state for backlog handling
- Stale resolution when Sonar finding is no longer present
- Legacy issue cleanup (aggregate issues replaced by per-finding)

## 4. Usage Instructions

This module is typically invoked as part of nightly audit operations. The main entry point is through the facade index:

```javascript
import {
  syncSonarToLinear,
  syncSonarHotspotsToLinear,
  syncSonarDuplicationsToLinear,
  fetchAllSonarIssues,
  fetchAllSonarHotspots,
  fetchAllSonarDuplicationIssues,
} from "./ops/integrations/sonar/sonar-linear-sync/index.mjs";
```

### Environment Variables

- `SONAR_TOKEN` - SonarQube authentication token
- `SONAR_HOST` - SonarQube base URL (e.g., https://sonar.example.com)
- `LINEAR_API_KEY` - Linear API key (handled by linear-client.mjs)

### Example Usage

```javascript
// Fetch and sync regular issues
const sonarIssues = await fetchAllSonarIssues(
  process.env.SONAR_TOKEN,
  process.env.SONAR_HOST,
  "my-project"
);

const result = await syncSonarToLinear({
  sonarIssues,
  projectKey: "my-project",
  sonarHost: process.env.SONAR_HOST,
  priority: 2, // High
  resolveStale: true,
  requeueToReady: true,
});

console.log(result);
// { created: [...], skipped: [...], promoted: [...], requeued: [...], resolved: [...] }
```

## 5. Dependencies

### Internal Dependencies

- **../../linear/linear-client.mjs** - Linear API client (createIssue, updateIssue, addComment, query, STATES, TEAM_ID)
- **../../../lib/logger.mjs** - Logger factory

### Runtime Requirements

- Node.js with ESM support (.mjs files)
- Valid SonarQube API token with appropriate project permissions
- Valid Linear API key with team access

### External Services

- **SonarQube** - Code quality and security analysis platform
- **Linear** - Project management and issue tracking

## 6. Additional Comments

- **Correlation Strategy**: Each synced issue includes `<!-- sonar-key:... -->` HTML comment in description, enabling bidirectional tracking between Sonar and Linear.

- **Filtering**: The fetch module filters out known false positives: "too many parameters", "Cognitive Complexity", "top-level await" rules/messages.

- **Stale Resolution**: When `resolveStale: true`, Linear issues are marked Done when corresponding Sonar findings are no longer present in the scan.

- **Priority Handling**: If existing Linear issue has lower priority than new Sonar issue, it gets promoted with comment explaining the change.

- **Requeue Logic**: When `requeueToReady: true`, non-Todo issues are moved back to Todo state so the runner can pick them up.

- **Legacy Cleanup**: When syncing, aggregate legacy issues (without sonar-key anchor) are resolved and replaced by individual per-finding issues.

- **Nightly Execution**: This module is designed for nightly audit runs to keep Linear in sync with SonarQube state.
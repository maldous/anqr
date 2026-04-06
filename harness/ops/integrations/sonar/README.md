# ANQR Sonar Integration

## 1. Directory Overview

This directory contains SonarQube integration modules for the ANQR (Agentic Number Query Runner) harness. It provides bidirectional synchronization between SonarQube code quality findings and Linear issue tracking, enabling automated tracking and resolution of code quality issues.

## 2. File Summaries

### Facade Modules (Auto-Generated)

- **sonar-linear-audit.mjs** - Auto-generated facade that re-exports from `./sonar-linear-audit/index.mjs` and `./sonar-linear-audit/runtime.mjs`. Provides CLI entry point for nightly Sonar audit operations.

- **sonar-linear-sync.mjs** - Auto-generated facade that re-exports from `./sonar-linear-sync/index.mjs`. Main facade for syncing SonarQube issues, hotspots, and duplications to Linear.

### sonar-linear-audit/ Subdirectory

- **index.mjs** - Facade index exporting `SONAR_TOKEN`, `SONAR_HOST`, `PROJECT_KEY`, `CONSOLIDATED_ISSUE_TITLE`, `resolveStaleLinearIssues`, `findOrCreateConsolidatedIssue`, `updateConsolidatedIssue`, and `main`.

- **main.mjs** - Main orchestration for nightly audit. Fetches all Sonar issues, hotspots, and duplications, resolves stale Linear issues, creates or updates a consolidated "Nightly Sonar:" issue, and sends notifications. Exits with code 1 if findings exist (blocking), 0 if clean.

- **runtime.mjs** - Runtime carry-forward that imports and executes `main()`.

- **sonar-token.mjs** - Exports `SONAR_TOKEN` from `SONAR_TOKEN` environment variable.

- **sonar-host.mjs** - Exports `SONAR_HOST` from `SONAR_HOST` environment variable.

- **project-key.mjs** - Exports `PROJECT_KEY` from `SONAR_PROJECT_KEY` environment variable.

- **consolidated-issue-title.mjs** - Exports consolidated issue title: "Nightly Sonar:".

- **find-or-create-consolidated-issue.mjs** - Finds existing open "Nightly Sonar:" issue or creates a new one.

- **update-consolidated-issue.mjs** - Updates the consolidated issue with all findings (issues, hotspots, duplications).

- **resolve-stale-linear-issues.mjs** - Resolves Linear issues that no longer exist in SonarQube.

- **logger.mjs** - Shared logging utility.

### sonar-linear-sync/ Subdirectory

- **index.mjs** - Facade index exporting all sync utilities including fetch functions, build helpers, and sync functions for issues, hotspots, and duplications.

- **sync-sonar-to-linear.mjs** - Main sync function that syncs individual SonarQube issues to Linear. Creates new Linear issues for new findings, updates existing ones, resolves stale issues, and handles legacy aggregate issues.

- **sync-sonar-hotspots-to-linear.mjs** - Syncs security hotspots from SonarQube to Linear.

- **sync-sonar-duplications-to-linear.mjs** - Syncs code duplication issues from SonarQube to Linear.

- **fetch-all-sonar-issues.mjs** - Fetches all SonarQube issues for a project with pagination.

- **fetch-all-sonar-hotspots.mjs** - Fetches all security hotspots for a project.

- **fetch-all-sonar-duplication-issues.mjs** - Fetches all duplication issues for a project.

- **fetch-sonar-measures.mjs** - Fetches SonarQube measures (metrics) for a project.

- **fetch-with-timeout.mjs** - Wrapper for fetch with timeout support.

- **fetch-timeout-ms.mjs** - Timeout constant (30000ms).

- **sonar-auth-header.mjs** - Builds Authorization header using `SONAR_TOKEN`.

- **sonar-key-pattern.mjs** - Regex pattern for extracting Sonar issue keys.

- **extract-sonar-key.mjs** - Extracts Sonar key from Linear issue description.

- **strip-project-prefix.mjs** - Strips project prefix from Sonar keys.

- **build-linear-title.mjs** - Builds Linear issue title from Sonar issue.

- **build-linear-description.mjs** - Builds Linear issue description with Sonar details.

- **build-hotspot-linear-title.mjs** - Builds Linear title for security hotspots.

- **build-hotspot-linear-description.mjs** - Builds Linear description for security hotspots.

- **build-duplication-linear-title.mjs** - Builds Linear title for duplication issues.

- **build-duplication-linear-description.mjs** - Builds Linear description for duplication issues.

- **find-open-linear-issues-by-tag.mjs** - Finds open Linear issues by tag (e.g., "[Sonar]", "[SonarHotspot]").

- **apply-promote-and-requeue.mjs** - Applies priority promotion and requeue logic to existing issues.

- **resolve-stale-linear-issues.mjs** - Resolves stale Linear issues that no longer exist in SonarQube.

- **open-state-names.mjs** - Array of open state names for Linear queries.

- **priority-labels.mjs** - Priority label mapping for Linear issues.

- **logger.mjs** - Shared logging utility.

## 3. Overall Directory Function

This directory serves as the SonarQube integration layer for ANQR, enabling automated code quality tracking through Linear. The two main workflows are:

- **sonar-linear-sync**: Real-time or on-demand sync of SonarQube findings (issues, hotspots, duplications) to Linear as individual issues. Supports creating, updating, promoting, and resolving issues based on current SonarQube state.

- **sonar-linear-audit**: Nightly audit that consolidates all SonarQube findings into a single "Nightly Sonar:" issue, resolves stale individual issues from previous syncs, and sends notifications with summary and dashboard link.

Both modules use consistent patterns for authentication (environment variables), Linear issue creation/update, and stale issue resolution.

## 4. Usage Instructions

### Running sonar-linear-sync

```bash
# Via facade (requires implementation of CLI entry)
node ops/integrations/sonar/sonar-linear-sync.mjs
```

Or import and call directly:

```javascript
import { syncSonarToLinear } from "./ops/integrations/sonar/sonar-linear-sync.mjs";

await syncSonarToLinear({
  sonarIssues: sonarIssuesArray,
  projectKey: "my-project",
  sonarHost: "https://sonar.example.com",
  priority: 2,
  resolveStale: true,
  requeueToReady: false,
});
```

### Running sonar-linear-audit

```bash
# Via facade
node ops/integrations/sonar/sonar-linear-audit.mjs

# Or directly
node ops/integrations/sonar/sonar-linear-audit/runtime.mjs
```

### Environment Variables Required

- `SONAR_TOKEN` - SonarQube authentication token
- `SONAR_HOST` - SonarQube host URL (e.g., https://sonar.example.com)
- `SONAR_PROJECT_KEY` - SonarQube project key to sync
- `LINEAR_API_KEY` - Linear API key (for audit mode)

### Exit Codes

- **0** - No findings (clean)
- **1** - Findings exist (blocking)
- **2** - Configuration error (missing env vars)

## 5. Dependencies

### Internal Dependencies

- **../../linear/linear-client.mjs** - Linear API client (`createIssue`, `updateIssue`, `addComment`, `findOpenIssuesByTitle`, `STATES`)
- **../../../lib/notify.mjs** - Notification service (`sendNotification`)
- **../../../lib/logger.mjs** - Logging utility

### Environment Variables

- `SONAR_TOKEN` - Required
- `SONAR_HOST` - Required
- `SONAR_PROJECT_KEY` - Required for audit
- `LINEAR_API_KEY` - Required for audit

### External Services

- **SonarQube** - Code quality analysis platform
- **Linear** - Issue tracking platform

## 6. Additional Comments

- **Tagging Convention**: Linear issues are tagged with `[Sonar]` for issues, `[SonarHotspot]` for hotspots, and `[SonarDup]` for duplications.

- **Consolidated Issue**: The audit creates a "Nightly Sonar:" issue that serves as a single source of truth for all current findings, with grouping guidance for batch resolution.

- **Stale Resolution**: Both modules resolve stale Linear issues when the corresponding SonarQube finding no longer exists, keeping Linear in sync with current code quality state.

- **Priority Mapping**: Sonar issue severities are mapped to Linear priorities via `priority-labels.mjs`.

- **Blocking Behavior**: The audit module exits with code 1 when findings exist, enabling use in CI/CD pipelines to block merges when code quality degrades.

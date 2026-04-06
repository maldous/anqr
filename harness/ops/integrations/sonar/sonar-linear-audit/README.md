# ANQR Sonar-Linear Audit

## 1. Directory Overview

This directory contains the Sonar-Linear audit automation module for the ANQR (Agentic Number Query Runner) harness. It consolidates all SonarQube findings (issues, security hotspots, and code duplications) into a single Linear issue for centralized tracking and batch resolution. The module also handles stale issue resolution - automatically closing Linear issues that are no longer present in SonarQube.

## 2. File Summaries

### Main Entry Point

- **main.mjs** - Main orchestration module. Fetches all SonarQube data (issues, hotspots, duplications, measures), resolves stale Linear issues from previous per-finding approach, finds or creates a consolidated issue, updates it with all findings, and sends notifications. Exits with code 1 when findings exist (blocking), 0 when clean.

### Facade Files

- **index.mjs** - Facade index exporting all public API members including constants and functions.
- **runtime.mjs** - Runtime carry-forward that imports and executes the main function with error handling.

### Core Implementation Files

- **find-or-create-consolidated-issue.mjs** - Finds existing open issues with title "Nightly Sonar:" or creates a new consolidated issue with priority P1 and "harness" label.
- **update-consolidated-issue.mjs** - Updates the consolidated issue description with all findings grouped by type (Issues, Security Hotspots, Duplications), including grouping guidance for batch resolution. Uses HTML comment anchors for tracking.
- **resolve-stale-linear-issues.mjs** - Resolves stale Linear issues by checking if their Sonar key still exists in current findings. Handles issues, hotspots, and duplications with appropriate tag prefixes.

### Constants and Configuration

- **consolidated-issue-title.mjs** - Exports `CONSOLIDATED_ISSUE_TITLE = "Nightly Sonar: unresolved findings"`
- **project-key.mjs** - Exports `PROJECT_KEY = "anqr"` for SonarQube project identification
- **sonar-host.mjs** - Exports `SONAR_HOST` from `SONAR_HOST_URL` environment variable or default `http://localhost:9000`
- **sonar-token.mjs** - Exports `SONAR_TOKEN` from environment variable
- **logger.mjs** - Shared logger module using the central logger from `../../../lib/logger.mjs`

## 3. Overall Directory Function

This directory serves as the SonarQube audit integration for the ANQR harness. The workflow:

1. **Data Collection**: Fetches all open SonarQube issues, security hotspots, and duplication issues for the configured project
2. **Stale Resolution**: Finds and resolves individual Linear issues from previous per-finding approach that no longer exist in SonarQube
3. **Consolidation**: Creates or updates a single consolidated Linear issue containing all current findings
4. **Notification**: Sends notification with summary of findings and link to SonarQube dashboard
5. **Exit Status**: Exits with code 1 if findings exist (blocking for nightly pipelines), 0 if all clear

The consolidated issue includes grouping guidance to help resolve findings by file, rule, or category rather than marking everything done at once.

## 4. Usage Instructions

### Running the Module

```bash
# Via facade (recommended)
node ops/integrations/sonar/sonar-linear-audit.mjs

# Or directly
node ops/integrations/sonar/sonar-linear-audit/runtime.mjs

# Or via index
node ops/integrations/sonar/sonar-linear-audit/index.mjs
```

### Required Environment Variables

- `SONAR_TOKEN` - SonarQube API token (required)
- `SONAR_HOST_URL` - SonarQube host URL (optional, defaults to `http://localhost:9000`)
- `LINEAR_API_KEY` - Linear API key (required)

### Exit Codes

- `0` - All findings resolved, clean state
- `1` - Findings exist (blocking exit for pipeline integration)
- `2` - Configuration error (missing SONAR_TOKEN or LINEAR_API_KEY)

### Output

The module logs progress and results:
- `[sonar-audit] Querying {host} for project {key}...`
- `[sonar-audit] Issues: {n}, Hotspots: {n}, Duplications: {n}, Measures: {metrics}`
- `[sonar-audit] Resolved stale: {n} issues, {n} hotspots, {n} duplications`
- `[sonar-audit] Findings exist - exiting with code 1 (blocking)` or `[sonar-audit] Clean - no findings`

## 5. Dependencies

### Internal Dependencies

- **../../../lib/sonar-linear-sync.mjs** - Provides `fetchAllSonarIssues`, `fetchAllSonarHotspots`, `fetchAllSonarDuplicationIssues`, `fetchSonarMeasures`, `findOpenLinearIssuesByTag`
- **../../linear/linear-client.mjs** - Provides `createIssue`, `updateIssue`, `findOpenIssuesByTitle`, `STATES`, `LABELS`
- **../../../lib/notify.mjs** - Provides `sendNotification`
- **../../../lib/logger.mjs** - Provides logger factory

### External Services

- **SonarQube** - Code quality analysis platform
- **Linear** - Issue tracking platform

### Runtime Requirements

- Node.js with ESM support (.mjs files)
- Valid SonarQube API token with appropriate permissions
- Valid Linear API key with appropriate permissions

## 6. Additional Comments

- **Blocking Design**: The module exits with code 1 when findings exist, making it suitable for blocking nightly pipelines until code quality issues are addressed.

- **Consolidation Approach**: Instead of creating individual Linear issues per Sonar finding (which can create hundreds of issues), this module consolidates all findings into a single issue with grouping guidance.

- **Stale Resolution**: The module automatically resolves Linear issues that were created for individual Sonar findings when those findings are no longer present in SonarQube (fixed or closed).

- **HTML Anchors**: Issue descriptions include HTML comment anchors like `<!-- sonar-key:xxx -->` for programmatic tracking of individual findings.

- **Notification Severity**: Sends "critical" severity notifications when findings exist, "info" severity when all resolved.

- **Project Key**: Currently hardcoded to "anqr" - could be made configurable via environment variable if needed.
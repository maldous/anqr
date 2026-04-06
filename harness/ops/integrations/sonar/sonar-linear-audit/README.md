# ANQR Sonar-Linear Audit

## 1. Directory Overview

This directory contains the Sonar-Linear audit automation module for the ANQR (Agentic Number Query
Runner) harness. It consolidates all SonarQube findings (issues, security hotspots, and code
duplications) into a single Linear issue for centralized tracking and batch resolution. The module
also handles stale issue resolution - automatically closing Linear issues that are no longer present
in SonarQube. It currently contains 11 files and 0 subdirectories.

## 2. File Summaries

### Files

- **consolidated-issue-title.mjs** - Exports `CONSOLIDATED_ISSUE_TITLE = "Nightly Sonar: unresolved findings"`
- **find-or-create-consolidated-issue.mjs** - Finds existing open issues with title "Nightly Sonar:" or creates a new consolidated issue with priority P1 and "harness" label.
- **index.mjs** - Facade index exporting all public API members including constants and functions.
- **logger.mjs** - Shared logger module using the central logger from `../../../lib/logger.mjs`
- **main.mjs** - Main orchestration module. Fetches all SonarQube data (issues, hotspots, duplications, measures), resolves stale Linear issues from previous per-finding approach, finds or creates a consolidated issue, updates it with all findings, and sends notifications. Exits with code 1 when findings exist (blocking), 0 when clean.
- **project-key.mjs** - Exports `PROJECT_KEY = "anqr"` for SonarQube project identification
- **resolve-stale-linear-issues.mjs** - Resolves stale Linear issues by checking if their Sonar key still exists in current findings. Handles issues, hotspots, and duplications with appropriate tag prefixes.
- **runtime.mjs** - Runtime carry-forward that imports and executes the main function with error handling.
- **sonar-host.mjs** - Exports `SONAR_HOST` from `SONAR_HOST_URL` environment variable or default `http://localhost:9000`
- **sonar-token.mjs** - Exports `SONAR_TOKEN` from environment variable
- **update-consolidated-issue.mjs** - Updates the consolidated issue description with all findings grouped by type (Issues, Security Hotspots, Duplications), including grouping guidance for batch resolution. Uses HTML comment anchors for tracking.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `main.mjs` coordinates the main execution
path, `runtime.mjs` provides a direct execution path. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/integrations/sonar/sonar-linear-audit/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.

# ANQR Sonar-Linear Sync

## 1. Directory Overview

This directory contains the SonarQube to Linear synchronization module for the ANQR (Agentic Number
Query Runner) harness. It provides automated bidirectional sync between SonarQube code
quality/security findings and Linear issues, enabling tracking and resolution of code quality issues
through the Linear project management workflow. It currently contains 26 files and 0 subdirectories.

## 2. File Summaries

### Files

- **apply-promote-and-requeue.mjs** - Applies priority promotion and state requeue to existing Linear issues. Adds comments explaining changes.
- **build-duplication-linear-description.mjs** - Builds description for duplication issues with rule, severity, and SonarQube link.
- **build-duplication-linear-title.mjs** - Builds title for duplication issues with `[SonarDup]` prefix.
- **build-hotspot-linear-description.mjs** - Builds description for security hotspots with security category, vulnerability probability, status, and SonarQube link.
- **build-hotspot-linear-title.mjs** - Builds title for security hotspots with `[SonarHotspot]` prefix.
- **build-linear-description.mjs** - Builds Linear issue description with Sonar metadata (rule, severity, type, file, line, effort, message) and SonarQube link.
- **build-linear-title.mjs** - Builds Linear issue title with `[Sonar]` prefix, truncated message, and file location.
- **extract-sonar-key.mjs** - Extracts Sonar key from Linear issue description using regex pattern.
- **fetch-all-sonar-duplication-issues.mjs** - Fetches code smells filtered for duplication-related rules and messages.
- **fetch-all-sonar-hotspots.mjs** - Fetches all security hotspots in "TO_REVIEW" status with pagination.
- **fetch-all-sonar-issues.mjs** - Fetches all unresolved Sonar issues with pagination support. Filters out known false positives ("too many parameters", "Cognitive Complexity", "top-level await").
- **fetch-sonar-measures.mjs** - Fetches project measures (duplication density, coverage).
- **fetch-timeout-ms.mjs** - Timeout constant (30,000ms) for API calls.
- **fetch-with-timeout.mjs** - Helper function for fetch with configurable timeout (30s default).
- **find-open-linear-issues-by-tag.mjs** - Queries Linear for open issues containing a specific title tag (e.g., `[Sonar]`, `[SonarHotspot]`, `[SonarDup]`).
- **index.mjs** - Generated facade index that exports all public API members including fetch functions, builders, sync functions, and utilities.
- **logger.mjs** - Shared logger using the project's logger library.
- **open-state-names.mjs** - List of open Linear state names: Backlog, Todo, In Progress, In Review, Blocked, Human Review.
- **priority-labels.mjs** - Mapping of priority numbers to labels: 1="Urgent", 2="High", 3="Medium", 4="Low".
- **resolve-stale-linear-issues.mjs** - Resolves Linear issues when corresponding Sonar findings are no longer present. Adds resolution comment and moves to Done state.
- **sonar-auth-header.mjs** - Builds Basic auth header for SonarQube API.
- **sonar-key-pattern.mjs** - Regex pattern `<!-- sonar-key:([a-f0-9-]+) -->` for tracking Sonar-Linear correlation.
- **strip-project-prefix.mjs** - Strips project key prefix from component paths for cleaner display.
- **sync-sonar-duplications-to-linear.mjs** - Specialized sync for code duplication issues. Creates `[SonarDup]` tagged issues with duplication-specific details (rule, severity).
- **sync-sonar-hotspots-to-linear.mjs** - Specialized sync for security hotspots. Creates `[SonarHotspot]` tagged issues with security-specific metadata (category, vulnerability probability, status).
- **sync-sonar-to-linear.mjs** - Main orchestration module that fetches Sonar issues and creates/updates Linear issues. Handles priority promotion, requeue logic, stale issue resolution, and legacy issue cleanup.

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

# ANQR Incident Manager

## 1. Directory Overview

This directory contains incident management functionality for the ANQR (Agentic Number Query Runner)
harness. It provides capabilities to create, track, and deduplicate incidents in Linear based on
various failure types detected by the harness system. The module integrates with the Linear issue
tracking system to automatically create incidents for operational failures, deployment issues, and
health check failures. It currently contains 8 files and 0 subdirectories.

## 2. File Summaries

### Files

- **build-incident-description.mjs** - Generates comprehensive incident descriptions including fingerprint marker for deduplication, context details (service, trigger, related issue), formatted evidence, and resolution instructions. Includes auto-resolution criteria and manual resolution guidance.
- **build-incident-title.mjs** - Constructs incident titles based on incident type and context (service, issueRef, or trigger). Uses the `titlePrefix` from incident type config to build descriptive titles like "Watchdog rollback: service-name".
- **create-or-update-incident.mjs** - Main orchestration function that creates new Linear incidents or updates existing ones with recurrence comments. Validates incident type, collects evidence, generates fingerprint for deduplication, and creates issues with appropriate priority and estimate.
- **dedup-window-ms.mjs** - Constants file exporting `DEDUP_WINDOW_MS` set to 24 hours (86,400,000 ms). Used to determine if a new incident is a recurrence of an existing one within the deduplication window.
- **find-existing-incident.mjs** - Searches for existing open incidents matching a fingerprint within the dedup window. Uses the Linear client's `findOpenIssuesByDescriptionFragment` to locate potential duplicates and returns the first match within the 24-hour window.
- **incident-types.mjs** - Defines all supported incident types with their priority levels (P0-P2) and story point estimates. Supported types include: WATCHDOG_ROLLBACK (P0, 3pts), RAPID_RESTART (P1, 3pts), PROVIDERS_EXHAUSTED (P1, 2pts), RETRY_EXHAUSTED (P2, 2pts), BUILD_FAILURE (P0, 2pts), DEPLOYMENT_FAILURE (P0, 2pts), TEST_FAILURE (P1, 2pts), VALIDATION_FAILURE (P1, 2pts), MONITORING_ALERT (P1, 2pts), SERVICE_UNHEALTHY (P0, 3pts).
- **index.mjs** - Generated facade index that exports all public API members including `DEDUP_WINDOW_MS`, `INCIDENT_TYPES`, `findExistingIncident`, `buildIncidentTitle`, `buildIncidentDescription`, and `createOrUpdateIncident`.
- **logger.mjs** - Shared logger module that imports and re-exports logging functions from the central logger utility (`../../../lib/logger.mjs`). Provides logInfo, logWarn, and logError for consistent logging across the module.

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

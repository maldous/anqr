# ANQR Incident Manager

## 1. Directory Overview

This directory contains incident management functionality for the ANQR (Agentic Number Query Runner) harness. It provides capabilities to create, track, and deduplicate incidents in Linear based on various failure types detected by the harness system. The module integrates with the Linear issue tracking system to automatically create incidents for operational failures, deployment issues, and health check failures.

## 2. File Summaries

### Core Implementation Files

- **create-or-update-incident.mjs** - Main orchestration function that creates new Linear incidents or updates existing ones with recurrence comments. Validates incident type, collects evidence, generates fingerprint for deduplication, and creates issues with appropriate priority and estimate.

- **dedup-window-ms.mjs** - Constants file exporting `DEDUP_WINDOW_MS` set to 24 hours (86,400,000 ms). Used to determine if a new incident is a recurrence of an existing one within the deduplication window.

- **incident-types.mjs** - Defines all supported incident types with their priority levels (P0-P2) and story point estimates. Supported types include: WATCHDOG_ROLLBACK (P0, 3pts), RAPID_RESTART (P1, 3pts), PROVIDERS_EXHAUSTED (P1, 2pts), RETRY_EXHAUSTED (P2, 2pts), BUILD_FAILURE (P0, 2pts), DEPLOYMENT_FAILURE (P0, 2pts), TEST_FAILURE (P1, 2pts), VALIDATION_FAILURE (P1, 2pts), MONITORING_ALERT (P1, 2pts), SERVICE_UNHEALTHY (P0, 3pts).

- **find-existing-incident.mjs** - Searches for existing open incidents matching a fingerprint within the dedup window. Uses the Linear client's `findOpenIssuesByDescriptionFragment` to locate potential duplicates and returns the first match within the 24-hour window.

- **build-incident-title.mjs** - Constructs incident titles based on incident type and context (service, issueRef, or trigger). Uses the `titlePrefix` from incident type config to build descriptive titles like "Watchdog rollback: service-name".

- **build-incident-description.mjs** - Generates comprehensive incident descriptions including fingerprint marker for deduplication, context details (service, trigger, related issue), formatted evidence, and resolution instructions. Includes auto-resolution criteria and manual resolution guidance.

- **logger.mjs** - Shared logger module that imports and re-exports logging functions from the central logger utility (`../../../lib/logger.mjs`). Provides logInfo, logWarn, and logError for consistent logging across the module.

### Facade Module

- **index.mjs** - Generated facade index that exports all public API members including `DEDUP_WINDOW_MS`, `INCIDENT_TYPES`, `findExistingIncident`, `buildIncidentTitle`, `buildIncidentDescription`, and `createOrUpdateIncident`.

## 3. Overall Directory Function

This directory serves as the incident management layer for the ANQR harness. When the harness detects operational failures (provider exhaustion, service health failures, watchdog rollbacks, etc.), the incident manager creates Linear issues to track and escalate these events.

The workflow: `createOrUpdateIncident` receives an incident type, optional service, trigger, and evidence. It generates a fingerprint for deduplication, checks for existing incidents within the 24-hour window, and either adds a recurrence comment to an existing incident or creates a new one with appropriate labels, priority, and estimate.

Key features include:
- Automatic deduplication using fingerprint matching
- Recurrence tracking with timeline comments
- Priority-based escalation (P0 for critical, P1 for high, P2 for medium)
- Evidence collection and formatting
- Integration with Linear labels (incident, harness)

## 4. Usage Instructions

### Creating an Incident

```javascript
import { createOrUpdateIncident } from "./ops/integrations/linear/incident-manager/index.mjs";

// Create a new incident
const incident = await createOrUpdateIncident({
  type: "SERVICE_UNHEALTHY",
  service: "symphony-bridge",
  trigger: "Connection timeout after 30s",
});
```

### Checking for Existing Incidents

```javascript
import { findExistingIncident } from "./ops/integrations/linear/incident-manager/index.mjs";

const existing = await findExistingIncident("fingerprint-hash");
if (existing) {
  console.log(`Found existing: ${existing.identifier}`);
}
```

### Importing Incident Types

```javascript
import { INCIDENT_TYPES } from "./ops/integrations/linear/incident-manager/index.mjs";

// Access incident type configuration
const config = INCIDENT_TYPES.SERVICE_UNHEALTHY;
console.log(`Priority: ${config.priority}, Estimate: ${config.estimate}`);
```

## 5. Dependencies

### Internal Dependencies

- **../linear-client.mjs** - Linear API client for creating issues, adding comments, and searching issues (`createIssue`, `addComment`, `findOpenIssuesByDescriptionFragment`, `STATES`, `LABELS`)
- **../incident-evidence.mjs** - Evidence collection and formatting (`collectIncidentEvidence`, `formatEvidenceForIssue`)
- **../incident-fingerprint.mjs** - Fingerprint generation and marker building (`generateIncidentFingerprint`, `buildFingerprintMarker`)
- **../../../lib/logger.mjs** - Central logging utility

### External Services

- **Linear** - Issue tracking and management platform

### Runtime Requirements

- Node.js with ESM support (.mjs files)
- Valid Linear API credentials configured
- The incident-evidence and incident-fingerprint modules must be available

## 6. Additional Comments

- **Fail-Safe Design**: The `findExistingIncident` function catches errors and returns null, preventing incident creation from failing due to search errors.

- **Fingerprint Deduplication**: Each incident includes a fingerprint marker in the description (hidden from UI but searchable) to enable reliable deduplication across recurrences.

- **Auto-Resolution Criteria**: Incidents include guidance for automatic resolution: service health checks pass for >1 hour, or related issue moves to Done state.

- **Priority Mapping**: Critical issues (P0) include watchdog rollbacks, build failures, deployment failures, and service health failures. High-priority (P1) covers rapid restarts, provider exhaustion, test failures, and monitoring alerts.

- **Label Integration**: Created incidents are automatically labeled with `incident` and `harness` labels for filtering and organization in Linear.
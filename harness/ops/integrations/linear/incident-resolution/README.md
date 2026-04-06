# ANQR Incident Resolution

## 1. Directory Overview

This directory contains automatic incident resolution functionality for the ANQR (Agentic Number Query Runner) harness. It monitors Linear issues labeled as "incident" and automatically resolves them when the affected service has been healthy for a specified duration. This provides self-healing capability for the system by detecting when incidents have been mitigated and closing them without manual intervention.

## 2. File Summaries

### Facade Module

- **index.mjs** - Generated facade index that re-exports all public API members including HEALTH_ENDPOINTS, HEALTHY_DURATION_MS, checkServiceHealth, extractServiceName, canAutoResolve, autoResolveIncident, and main.

- **runtime.mjs** - Generated runtime carry-forward that imports and executes the main function from index.mjs, providing the CLI entry point.

### Core Implementation Files

- **main.mjs** - Main orchestration module. Finds open incidents (Todo, In Progress, In Review states) with the "incident" label, iterates through each to check if they can be auto-resolved, and resolves them if ready. Logs progress and includes a 500ms rate limit between checks.

- **can-auto-resolve.mjs** - Determines if an incident can be automatically resolved. Checks two conditions: (1) the service is healthy via health endpoint, and (2) the incident has been open for at least HEALTHY_DURATION_MS (1 hour). Returns canResolve flag with reason if not ready.

- **auto-resolve-incident.mjs** - Performs the actual resolution of an incident. Adds a Markdown comment with resolution details (service, health status, timestamp, health check data) and moves the issue to the Done state using Linear API.

- **check-service-health.mjs** - Checks service health by calling configured health endpoints. Uses a 5-second timeout and returns healthy status with response data if the endpoint returns HTTP 200, or returns unhealthy with reason otherwise.

- **extract-service-name.mjs** - Extracts the service name from an issue. Searches the title for "symphony" or "codebuff" (case-insensitive), or falls back to extracting from a "Service: **" field in the description. Returns null if no service identified.

- **health-endpoints.mjs** - Defines the HEALTH_ENDPOINTS mapping. Currently configures the Symphony service health endpoint at http://127.0.0.1:4319/health.

- **healthy-duration-ms.mjs** - Defines HEALTHY_DURATION_MS as 60 * 60 * 1000 (1 hour). This is the minimum duration a service must remain healthy before an incident can be auto-resolved.

- **logger.mjs** - Shared logger module that wraps the createLogger function from the project's central logger (../../../lib/logger.mjs). Exports logInfo, logWarn, and logDebug functions.

## 3. Overall Directory Function

This directory implements a self-healing mechanism for the ANQR harness. The workflow: main.mjs queries Linear for open issues with the "incident" label, then for each incident it extracts the service name (e.g., "symphony"), checks if that service's health endpoint returns healthy status, verifies the incident has been open for at least 1 hour, and if all conditions are met, automatically resolves the incident by adding a resolution comment and moving it to Done.

The system uses a defensive approach where incidents are only resolved when the service has been continuously healthy for a meaningful duration, preventing premature resolution during flapping or transient issues. The 1-hour threshold balances responsiveness with reliability.

## 4. Usage Instructions

### Running Incident Resolution

```bash
# Via index (recommended)
node ops/integrations/linear/incident-resolution/index.mjs
```

Or via runtime:

```bash
node ops/integrations/linear/incident-resolution/runtime.mjs
```

### Prerequisites

- A valid Linear API token configured in the environment
- Services must have configured health endpoints (currently only Symphony)
- Incidents must have the "incident" label in Linear

### Configuration

To add health endpoints for additional services, edit health-endpoints.mjs:

```javascript
export const HEALTH_ENDPOINTS = {
  symphony: "http://127.0.0.1:4319/health",
  // Add more services here
};
```

To adjust the healthy duration threshold, edit healthy-duration-ms.mjs:

```javascript
export const HEALTHY_DURATION_MS = 60 * 60 * 1000; // 1 hour in milliseconds
```

### Output

The module logs progress with prefix `[incident-resolver]`:
- Number of open incidents found
- Each resolution attempt with reason if skipped
- Final summary: "Complete: X resolved, Y skipped"

## 5. Dependencies

### Internal Dependencies

- **../linear-client.mjs** - Linear API client for listing issues, updating issues, and adding comments
- **../../../lib/logger.mjs** - Central logger factory used by logger.mjs

### External Services

- **Linear** - Issue tracking and state management
- **Service Health Endpoints** - Configured endpoints (e.g., Symphony at http://127.0.0.1:4319/health)

### Runtime Requirements

- Node.js with ESM support (.mjs files)
- Network access to health endpoints
- Valid Linear API credentials in environment

## 6. Additional Comments

- **Defensive Auto-Resolution**: The 1-hour healthy duration requirement prevents premature resolution during service flapping. Even if a service recovers quickly, the incident remains open for at least an hour to ensure stability.

- **Graceful Degradation**: If a service has no configured health endpoint, canAutoResolve returns canResolve: false with "no service identified" reason, ensuring incidents aren't auto-resolved without proper validation.

- **Extensibility**: New services can be added to HEALTH_ENDPOINTS and extract-service-name.mjs can be extended to recognize additional service names.

- **Rate Limiting**: The 500ms delay between processing incidents prevents API rate limiting and reduces load on health endpoints.

- **Audit Trail**: Auto-resolved incidents receive a detailed comment documenting the resolution, including service status, timestamp, and health check data for future reference.
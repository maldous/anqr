# ANQR Incident Resolution

## 1. Directory Overview

This directory contains automatic incident resolution functionality for the ANQR (Agentic Number
Query Runner) harness. It monitors Linear issues labeled as "incident" and automatically resolves
them when the affected service has been healthy for a specified duration. This provides self-healing
capability for the system by detecting when incidents have been mitigated and closing them without
manual intervention. It currently contains 10 files and 0 subdirectories.

## 2. File Summaries

### Files

- **auto-resolve-incident.mjs** - Performs the actual resolution of an incident. Adds a Markdown comment with resolution details (service, health status, timestamp, health check data) and moves the issue to the Done state using Linear API.
- **can-auto-resolve.mjs** - Determines if an incident can be automatically resolved. Checks two conditions: (1) the service is healthy via health endpoint, and (2) the incident has been open for at least HEALTHY_DURATION_MS (1 hour). Returns canResolve flag with reason if not ready.
- **check-service-health.mjs** - Checks service health by calling configured health endpoints. Uses a 5-second timeout and returns healthy status with response data if the endpoint returns HTTP 200, or returns unhealthy with reason otherwise.
- **extract-service-name.mjs** - Extracts the service name from an issue. Searches the title for "symphony" or "codebuff" (case-insensitive), or falls back to extracting from a "Service: \*\*" field in the description. Returns null if no service identified.
- **health-endpoints.mjs** - Defines the HEALTH_ENDPOINTS mapping. Currently configures the Symphony service health endpoint at http://127.0.0.1:4319/health.
- **healthy-duration-ms.mjs** - Defines HEALTHY_DURATION_MS as 60 _ 60 _ 1000 (1 hour). This is the minimum duration a service must remain healthy before an incident can be auto-resolved.
- **index.mjs** - Generated facade index that re-exports all public API members including HEALTH_ENDPOINTS, HEALTHY_DURATION_MS, checkServiceHealth, extractServiceName, canAutoResolve, autoResolveIncident, and main.
- **logger.mjs** - Shared logger module that wraps the createLogger function from the project's central logger (../../../lib/logger.mjs). Exports logInfo, logWarn, and logDebug functions.
- **main.mjs** - Main orchestration module. Finds open incidents (Todo, In Progress, In Review states) with the "incident" label, iterates through each to check if they can be auto-resolved, and resolves them if ready. Logs progress and includes a 500ms rate limit between checks.
- **runtime.mjs** - Generated runtime carry-forward that imports and executes the main function from index.mjs, providing the CLI entry point.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `main.mjs` coordinates the main execution
path, `runtime.mjs` provides a direct execution path. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/integrations/linear/incident-resolution/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.

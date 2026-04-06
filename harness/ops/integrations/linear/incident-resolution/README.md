# ANQR Incident Resolution

## 1. Directory Overview

This directory implements **ANQR Incident Resolution** within the ANQR harness. The immediate code follows the common harness pattern of helper modules plus `main.mjs` orchestration, `index.mjs` facade exports, and `runtime.mjs` bootstrap execution. The current inventory is 10 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **auto-resolve-incident.mjs** - Exports `autoResolveIncident`, which implements auto resolve incident.
- **can-auto-resolve.mjs** - Exports `canAutoResolve`, which determines whether auto resolve.
- **check-service-health.mjs** - Exports `checkServiceHealth`, which checks service health.
- **extract-service-name.mjs** - Exports `extractServiceName`, which implements extract service name.
- **health-endpoints.mjs** - Exports `HEALTH_ENDPOINTS`, a shared constant used by sibling modules.
- **healthy-duration-ms.mjs** - Exports `HEALTHY_DURATION_MS`, a shared constant used by sibling modules.
- **index.mjs** - Facade module that re-exports public members from `./health-endpoints.mjs`, `./healthy-duration-ms.mjs`, `./check-service-health.mjs`, `./extract-service-name.mjs`, `./can-auto-resolve.mjs`, `./auto-resolve-incident.mjs`, and 1 more siblings.
- **logger.mjs** - Shared logging helper module exporting `logDebug`, `logInfo`, `logWarn`.
- **main.mjs** - Primary orchestration module for the directory. It coordinates the immediate helper modules.
- **runtime.mjs** - Executable runtime entry point. Imports `main()` from `./index.mjs` and invokes it.

## 3. Overall Directory Function

The directory is structured as a reusable module set plus an executable entry path: helper files implement the detail work, `main.mjs` coordinates it, `index.mjs` re-exports the public API, and `runtime.mjs` executes the workflow. Verified immediate files in this directory include network/API integration, timer, scheduling, cooldown, or watchdog behavior, Linear integration, and Symphony integration.

## 4. Usage Instructions

```bash
node ops/integrations/linear/incident-resolution/runtime.mjs
```

## 5. Dependencies

- **Internal relative modules** - `../../../lib/logger.mjs`, `../linear-client.mjs`, `./auto-resolve-incident.mjs`, `./can-auto-resolve.mjs`, `./check-service-health.mjs`, `./extract-service-name.mjs`, `./health-endpoints.mjs`, `./healthy-duration-ms.mjs`, `./index.mjs`, `./logger.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.

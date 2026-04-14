# Incident Resolution

## Purpose
Incident Resolution contains the code, configuration, or support files that implement this part of the harness architecture.

## Contents
- 10 immediate files
- 0 child directories

## Key Files
- `auto-resolve-incident.mjs` - Exports `autoResolveIncident`, the main helper defined in this file.
- `can-auto-resolve.mjs` - Exports `canAutoResolve`, the main helper defined in this file.
- `check-service-health.mjs` - Exports `checkServiceHealth`, the main helper defined in this file.
- `extract-service-name.mjs` - Exports `extractServiceName`, the main helper defined in this file.
- `health-endpoints.mjs` - Exports `HEALTH_ENDPOINTS`, a shared constant or state value used by sibling modules.
- `healthy-duration-ms.mjs` - Exports `HEALTHY_DURATION_MS`, a shared constant or state value used by sibling modules.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `main.mjs` - Exports `main`, the main helper defined in this file.
- `runtime.mjs` - Executable runtime bootstrap for this directory.

## Subdirectories
- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 10 immediate file(s) and 0 child directories.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus
Check that the current implementation in this directory still matches its intended role in the harness architecture.

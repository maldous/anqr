# Incident Manager

## Purpose
Incident Manager contains the code, configuration, or support files that implement this part of the harness architecture.

## Contents
- 8 immediate files
- 0 child directories

## Key Files
- `build-incident-description.mjs` - Exports `buildIncidentDescription`, the main helper defined in this file.
- `build-incident-title.mjs` - Exports `buildIncidentTitle`, the main helper defined in this file.
- `create-or-update-incident.mjs` - Exports `createOrUpdateIncident`, the main helper defined in this file.
- `dedup-window-ms.mjs` - Exports `DEDUP_WINDOW_MS`, a shared constant or state value used by sibling modules.
- `find-existing-incident.mjs` - Exports `findExistingIncident`, the main helper defined in this file.
- `incident-types.mjs` - Exports `INCIDENT_TYPES`, a shared constant or state value used by sibling modules.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.

## Subdirectories
- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 8 immediate file(s) and 0 child directories.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus
Check that the current implementation in this directory still matches its intended role in the harness architecture.

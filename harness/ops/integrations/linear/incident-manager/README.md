# Incident Manager

## Purpose

Directory for Linear ingestion, reconciliation, or issue management; immediate files include `build-incident-description.mjs`, `build-incident-title.mjs`, `create-or-update-incident.mjs`, `dedup-window-ms.mjs`, and others.

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

- Current on-disk inventory: 8 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus

Check whether the external-system contract in this directory still matches live usage and the intended control-plane boundaries.

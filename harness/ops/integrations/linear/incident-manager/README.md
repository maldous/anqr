# ANQR Incident Manager

## 1. Directory Overview

This directory implements **ANQR Incident Manager** within the ANQR harness. Key immediate entries include `index.mjs`, `create-or-update-incident.mjs`, `build-incident-description.mjs`, `find-existing-incident.mjs`. The current inventory is 8 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **build-incident-description.mjs** - Exports `buildIncidentDescription`, which builds incident description.
- **build-incident-title.mjs** - Exports `buildIncidentTitle`, which builds incident title.
- **create-or-update-incident.mjs** - Exports `createOrUpdateIncident`, which creates or update incident.
- **dedup-window-ms.mjs** - Exports `DEDUP_WINDOW_MS`, a shared constant used by sibling modules.
- **find-existing-incident.mjs** - Exports `findExistingIncident`, which finds existing incident.
- **incident-types.mjs** - Exports `INCIDENT_TYPES`, a shared constant used by sibling modules.
- **index.mjs** - Facade module that re-exports public members from `./dedup-window-ms.mjs`, `./incident-types.mjs`, `./find-existing-incident.mjs`, `./build-incident-title.mjs`, `./build-incident-description.mjs`, `./create-or-update-incident.mjs`.
- **logger.mjs** - Shared logging helper module exporting `logError`, `logInfo`, `logWarn`.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory include timer, scheduling, cooldown, or watchdog behavior, and Linear integration.

## 4. Usage Instructions

```javascript
import * as moduleApi from "./ops/integrations/linear/incident-manager/index.mjs";
```

## 5. Dependencies

- **Internal relative modules** - `../../../lib/logger.mjs`, `../incident-evidence.mjs`, `../incident-fingerprint.mjs`, `../linear-client.mjs`, `./build-incident-description.mjs`, `./build-incident-title.mjs`, `./dedup-window-ms.mjs`, `./find-existing-incident.mjs`, `./incident-types.mjs`, `./logger.mjs`

## 6. Additional Comments

- No direct standalone runtime entry point is defined in the immediate directory contents.

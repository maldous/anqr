# ANQR Sonar-Linear Sync

## 1. Directory Overview

This directory implements **ANQR Sonar-Linear Sync** within the ANQR harness. Key immediate entries include `index.mjs`, `find-open-linear-issues-by-tag.mjs`, `sync-sonar-hotspots-to-linear.mjs`, `sync-sonar-duplications-to-linear.mjs`. The current inventory is 26 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **apply-promote-and-requeue.mjs** - Exports `applyPromoteAndRequeue`, which applies promote and requeue.
- **build-duplication-linear-description.mjs** - Exports `buildDuplicationLinearDescription`, which builds duplication linear description.
- **build-duplication-linear-title.mjs** - Exports `buildDuplicationLinearTitle`, which builds duplication linear title.
- **build-hotspot-linear-description.mjs** - Exports `buildHotspotLinearDescription`, which builds hotspot linear description.
- **build-hotspot-linear-title.mjs** - Exports `buildHotspotLinearTitle`, which builds hotspot linear title.
- **build-linear-description.mjs** - Exports `buildLinearDescription`, which builds linear description.
- **build-linear-title.mjs** - Exports `buildLinearTitle`, which builds linear title.
- **extract-sonar-key.mjs** - Exports `extractSonarKey`, which implements extract sonar key.
- **fetch-all-sonar-duplication-issues.mjs** - Exports `fetchAllSonarDuplicationIssues`, which fetches all sonar duplication issues.
- **fetch-all-sonar-hotspots.mjs** - Exports `fetchAllSonarHotspots`, which fetches all sonar hotspots.
- **fetch-all-sonar-issues.mjs** - Exports `fetchAllSonarIssues`, which fetches all sonar issues.
- **fetch-sonar-measures.mjs** - Exports `fetchSonarMeasures`, which fetches sonar measures.
- **fetch-timeout-ms.mjs** - Exports `FETCH_TIMEOUT_MS`, a shared constant used by sibling modules.
- **fetch-with-timeout.mjs** - Exports `fetchWithTimeout`, which fetches with timeout.
- **find-open-linear-issues-by-tag.mjs** - Exports `findOpenLinearIssuesByTag`, which finds open linear issues by tag.
- **index.mjs** - Facade module that re-exports public members from `./fetch-timeout-ms.mjs`, `./sonar-key-pattern.mjs`, `./open-state-names.mjs`, `./priority-labels.mjs`, `./fetch-with-timeout.mjs`, `./sonar-auth-header.mjs`, and 18 more siblings.
- **logger.mjs** - Shared logging helper module exporting `logInfo`.
- **open-state-names.mjs** - Exports `OPEN_STATE_NAMES`, a shared constant used by sibling modules.
- **priority-labels.mjs** - Exports `PRIORITY_LABELS`, a shared constant used by sibling modules.
- **resolve-stale-linear-issues.mjs** - Exports `resolveStaleLinearIssues`, which resolves stale linear issues.
- **sonar-auth-header.mjs** - Exports `sonarAuthHeader`, which implements sonar auth header.
- **sonar-key-pattern.mjs** - Exports `SONAR_KEY_PATTERN`, a regular-expression constant used for validation.
- **strip-project-prefix.mjs** - Exports `stripProjectPrefix`, which strips project prefix.
- **sync-sonar-duplications-to-linear.mjs** - Exports `syncSonarDuplicationsToLinear`, which implements sync sonar duplications to linear.
- **sync-sonar-hotspots-to-linear.mjs** - Exports `syncSonarHotspotsToLinear`, which implements sync sonar hotspots to linear.
- **sync-sonar-to-linear.mjs** - Exports `syncSonarToLinear`, which implements sync sonar to linear.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory include network/API integration, timer, scheduling, cooldown, or watchdog behavior, Linear integration, and SonarQube integration.

## 4. Usage Instructions

```javascript
import * as moduleApi from "./ops/integrations/sonar/sonar-linear-sync/index.mjs";
```

## 5. Dependencies

- **Internal relative modules** - `../../../lib/logger.mjs`, `../../linear/linear-client.mjs`, `./apply-promote-and-requeue.mjs`, `./build-duplication-linear-description.mjs`, `./build-duplication-linear-title.mjs`, `./build-hotspot-linear-description.mjs`, `./build-hotspot-linear-title.mjs`, `./build-linear-description.mjs`, `./build-linear-title.mjs`, `./extract-sonar-key.mjs`, `./fetch-timeout-ms.mjs`, `./fetch-with-timeout.mjs`

## 6. Additional Comments

- No direct standalone runtime entry point is defined in the immediate directory contents.

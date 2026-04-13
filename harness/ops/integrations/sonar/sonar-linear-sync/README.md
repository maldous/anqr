# Sonar Linear Sync

## Purpose
Directory for Linear ingestion, reconciliation, or issue management; immediate files include `apply-promote-and-requeue.mjs`, `build-duplication-linear-description.mjs`, `build-duplication-linear-title.mjs`, `build-hotspot-linear-description.mjs`, and others.

## Contents
- 26 immediate files
- 0 child directories

## Key Files
- `apply-promote-and-requeue.mjs` - Exports `applyPromoteAndRequeue`, the main helper defined in this file.
- `build-duplication-linear-description.mjs` - Exports `buildDuplicationLinearDescription`, the main helper defined in this file.
- `build-duplication-linear-title.mjs` - Exports `buildDuplicationLinearTitle`, the main helper defined in this file.
- `build-hotspot-linear-description.mjs` - Exports `buildHotspotLinearDescription`, the main helper defined in this file.
- `build-hotspot-linear-title.mjs` - Exports `buildHotspotLinearTitle`, the main helper defined in this file.
- `build-linear-description.mjs` - Exports `buildLinearDescription`, the main helper defined in this file.
- `build-linear-title.mjs` - Exports `buildLinearTitle`, the main helper defined in this file.
- `extract-sonar-key.mjs` - Exports `extractSonarKey`, the main helper defined in this file.
- `fetch-all-sonar-duplication-issues.mjs` - Exports `fetchAllSonarDuplicationIssues`, the main helper defined in this file.
- `fetch-all-sonar-hotspots.mjs` - Exports `fetchAllSonarHotspots`, the main helper defined in this file.
- `fetch-all-sonar-issues.mjs` - Exports `fetchAllSonarIssues`, the main helper defined in this file.
- `fetch-sonar-measures.mjs` - Exports `fetchSonarMeasures`, the main helper defined in this file.
- `fetch-timeout-ms.mjs` - Exports `FETCH_TIMEOUT_MS`, a shared constant or state value used by sibling modules.
- `fetch-with-timeout.mjs` - Exports `fetchWithTimeout`, the main helper defined in this file.
- `find-open-linear-issues-by-tag.mjs` - Exports `findOpenLinearIssuesByTag`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `open-state-names.mjs` - Exports `OPEN_STATE_NAMES`, a shared constant or state value used by sibling modules.
- `priority-labels.mjs` - Exports `PRIORITY_LABELS`, a shared constant or state value used by sibling modules.
- `resolve-stale-linear-issues.mjs` - Exports `resolveStaleLinearIssues`, the main helper defined in this file.
- `sonar-auth-header.mjs` - Exports `sonarAuthHeader`, the main helper defined in this file.
- `sonar-key-pattern.mjs` - Exports `SONAR_KEY_PATTERN`, a shared constant or state value used by sibling modules.
- `strip-project-prefix.mjs` - Exports `stripProjectPrefix`, the main helper defined in this file.
- `sync-sonar-duplications-to-linear.mjs` - Exports `syncSonarDuplicationsToLinear`, the main helper defined in this file.
- `sync-sonar-hotspots-to-linear.mjs` - Exports `syncSonarHotspotsToLinear`, the main helper defined in this file.
- `sync-sonar-to-linear.mjs` - Exports `syncSonarToLinear`, the main helper defined in this file.

## Subdirectories
- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 26 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus
Check whether the external-system contract in this directory still matches live usage and the intended control-plane boundaries.

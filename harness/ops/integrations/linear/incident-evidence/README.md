# Incident Evidence

## Purpose

Incident Evidence contains the code, configuration, or support files that implement this part of the harness architecture.

## Contents

- 8 immediate files
- 0 child directories

## Key Files

- `collect-incident-evidence.mjs` - Exports `collectIncidentEvidence`, the main helper defined in this file.
- `format-evidence-for-issue.mjs` - Exports `formatEvidenceForIssue`, the main helper defined in this file.
- `get-git-context.mjs` - Exports `getGitContext`, the main helper defined in this file.
- `get-service-journal.mjs` - Exports `getServiceJournal`, the main helper defined in this file.
- `get-state-file-info.mjs` - Exports `getStateFileInfo`, the main helper defined in this file.
- `get-system-info.mjs` - Exports `getSystemInfo`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.

## Subdirectories

- No child directories in this directory.

## Operational Notes

- Current on-disk inventory: 8 immediate file(s) and 0 child directories.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus

Check that the current implementation in this directory still matches its intended role in the harness architecture.

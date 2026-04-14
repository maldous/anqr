# Incident Evidence

## Purpose

Directory for Linear ingestion, reconciliation, or issue management; immediate files include `collect-incident-evidence.mjs`, `format-evidence-for-issue.mjs`, `get-git-context.mjs`, `get-service-journal.mjs`, and others.

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

- Current on-disk inventory: 8 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus

Check whether the external-system contract in this directory still matches live usage and the intended control-plane boundaries.

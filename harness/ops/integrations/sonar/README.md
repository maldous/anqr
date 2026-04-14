# Sonar

## Purpose

Directory for Linear ingestion, reconciliation, or issue management; immediate files include `sonar-linear-audit.mjs`, `sonar-linear-sync.mjs`, with child directories `sonar-linear-audit/`, `sonar-linear-sync/`.

## Contents

- 2 immediate files
- 2 child directories

## Key Files

- `sonar-linear-audit.mjs` - JavaScript/TypeScript module used by this directory.
- `sonar-linear-sync.mjs` - JavaScript/TypeScript module used by this directory.

## Subdirectories

- `sonar-linear-audit/` - Directory for Linear ingestion, reconciliation, or issue management; immediate files include `consolidated-issue-title.mjs`, `find-or-create-consolidated-issue.mjs`, `index.mjs`, `logger.mjs`, and others.
- `sonar-linear-sync/` - Directory for Linear ingestion, reconciliation, or issue management; immediate files include `apply-promote-and-requeue.mjs`, `build-duplication-linear-description.mjs`, `build-duplication-linear-title.mjs`, `build-hotspot-linear-description.mjs`, and others.

## Operational Notes

- Current on-disk inventory: 2 immediate files and 2 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus

Check whether the external-system contract in this directory still matches live usage and the intended control-plane boundaries.

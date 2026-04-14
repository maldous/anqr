# Sonar

## Purpose

Sonar contains the code, configuration, or support files that implement this part of the harness architecture.

## Contents

- 2 immediate files
- 2 child directories

## Key Files

- `sonar-linear-audit.mjs` - JavaScript/TypeScript module used by this directory.
- `sonar-linear-sync.mjs` - JavaScript/TypeScript module used by this directory.

## Subdirectories

- `sonar-linear-audit/` - Sonar Linear Audit scope; immediate files include `consolidated-issue-title.mjs`, `find-or-create-consolidated-issue.mjs`, `index.mjs`, `logger.mjs`, and others.
- `sonar-linear-sync/` - Sonar Linear Sync scope; immediate files include `apply-promote-and-requeue.mjs`, `build-duplication-linear-description.mjs`, `build-duplication-linear-title.mjs`, `build-hotspot-linear-description.mjs`, and others.

## Operational Notes

- Current on-disk inventory: 2 immediate file(s) and 2 child directories.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus

Check that the current implementation in this directory still matches its intended role in the harness architecture.

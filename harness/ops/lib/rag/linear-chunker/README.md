# Linear Chunker

## Purpose

Directory for Linear ingestion, reconciliation, or issue management; immediate files include `as-comma-list.mjs`, `chunk-linear-issue.mjs`, `chunk-linear-issues.mjs`, `compact-whitespace.mjs`, and others.

## Contents

- 9 immediate files
- 0 child directories

## Key Files

- `as-comma-list.mjs` - Exports `asCommaList`, the main helper defined in this file.
- `chunk-linear-issue.mjs` - Exports `chunkLinearIssue`, the main helper defined in this file.
- `chunk-linear-issues.mjs` - Exports `chunkLinearIssues`, the main helper defined in this file.
- `compact-whitespace.mjs` - Exports `compactWhitespace`, the main helper defined in this file.
- `count-lines.mjs` - Exports `countLines`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `max-description-chars.mjs` - Exports `MAX_DESCRIPTION_CHARS`, a shared constant or state value used by sibling modules.
- `truncate-description.mjs` - Exports `truncateDescription`, the main helper defined in this file.

## Subdirectories

- No child directories in this directory.

## Operational Notes

- Current on-disk inventory: 9 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus

Check whether the directory purpose, immediate files, and child modules still align with the current harness architecture.

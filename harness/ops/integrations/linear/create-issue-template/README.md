# Create Issue Template

## Purpose

Directory for Linear ingestion, reconciliation, or issue management; immediate files include `customize-issue.mjs`, `index.mjs`, `issue-template.mjs`, `main.mjs`, and others.

## Contents

- 6 immediate files
- 0 child directories

## Key Files

- `customize-issue.mjs` - Exports `customizeIssue`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `issue-template.mjs` - Exports `issueTemplate`, a shared constant or state value used by sibling modules.
- `main.mjs` - Exports `main`, the main helper defined in this file.
- `runtime.mjs` - Executable runtime bootstrap for this directory.
- `validate-issue.mjs` - Exports `validateIssue`, the main helper defined in this file.

## Subdirectories

- No child directories in this directory.

## Operational Notes

- Current on-disk inventory: 6 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus

Check whether the external-system contract in this directory still matches live usage and the intended control-plane boundaries.

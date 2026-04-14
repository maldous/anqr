# Create Issue Template

## Purpose
Create Issue Template contains the code, configuration, or support files that implement this part of the harness architecture.

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
- Current on-disk inventory: 6 immediate file(s) and 0 child directories.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus
Check that the current implementation in this directory still matches its intended role in the harness architecture.

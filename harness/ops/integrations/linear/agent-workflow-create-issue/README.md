# Agent Workflow Create Issue

## Purpose

Directory for Linear ingestion, reconciliation, or issue management; immediate files include `args.mjs`, `available-labels.mjs`, `available-states.mjs`, `create-linear-issue-workflow.mjs`, and others.

## Contents

- 12 immediate files
- 0 child directories

## Key Files

- `args.mjs` - Exports `args`, a shared constant or state value used by sibling modules.
- `available-labels.mjs` - Exports `AVAILABLE_LABELS`, a shared constant or state value used by sibling modules.
- `available-states.mjs` - Exports `AVAILABLE_STATES`, a shared constant or state value used by sibling modules.
- `create-linear-issue-workflow.mjs` - Exports `createLinearIssueWorkflow`, the main helper defined in this file.
- `get-priority-name.mjs` - Exports `getPriorityName`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `parse-labels.mjs` - Exports `parseLabels`, the main helper defined in this file.
- `runtime.mjs` - Executable runtime bootstrap for this directory.
- `show-help.mjs` - Exports `showHelp`, the main helper defined in this file.
- `validate-priority.mjs` - Exports `validatePriority`, the main helper defined in this file.
- `validate-state-id.mjs` - Exports `validateStateId`, the main helper defined in this file.
- `workflow-create-linear-issue.mjs` - Exports `workflowCreateLinearIssue`, the main helper defined in this file.

## Subdirectories

- No child directories in this directory.

## Operational Notes

- Current on-disk inventory: 12 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus

Check whether the external-system contract in this directory still matches live usage and the intended control-plane boundaries.

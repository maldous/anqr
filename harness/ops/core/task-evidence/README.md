# Task Evidence

## Purpose
Directory for git worktree management and concurrency support; immediate files include `create-evidence-record.mjs`, `get-evidence-dir.mjs`, `get-evidence-path.mjs`, `index.mjs`, and others.

## Contents
- 14 immediate files
- 0 child directories

## Key Files
- `create-evidence-record.mjs` - Exports `createEvidenceRecord`, the main helper defined in this file.
- `get-evidence-dir.mjs` - Exports `getEvidenceDir`, the main helper defined in this file.
- `get-evidence-path.mjs` - Exports `getEvidencePath`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `load-evidence-record.mjs` - Exports `loadEvidenceRecord`, the main helper defined in this file.
- `record-execution-result.mjs` - Exports `recordExecutionResult`, the main helper defined in this file.
- `record-integration-result.mjs` - Exports `recordIntegrationResult`, the main helper defined in this file.
- `record-provider-selection.mjs` - Exports `recordProviderSelection`, the main helper defined in this file.
- `record-push-result.mjs` - Exports `recordPushResult`, the main helper defined in this file.
- `record-routing-decision.mjs` - Exports `recordRoutingDecision`, the main helper defined in this file.
- `record-validation-result.mjs` - Exports `recordValidationResult`, the main helper defined in this file.
- `record-worktree-selection.mjs` - Exports `recordWorktreeSelection`, the main helper defined in this file.
- `save-evidence.mjs` - Exports `saveEvidence`, the main helper defined in this file.
- `update-evidence-record.mjs` - Exports `updateEvidenceRecord`, the main helper defined in this file.

## Subdirectories
- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 14 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus
Check whether the directory purpose, immediate files, and child modules still align with the current harness architecture.

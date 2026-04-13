# Core

## Purpose
Directory for Discord ingress, delivery, or notification support; immediate files include `bridge-result.mjs`, `bridge-result.spec.ts`, `discord-source.mjs`, `linear-worktree-health-states.mjs`, and others, with child directories `bridge-result/`, `discord-source/`, `symphony-state/`, `symphony-validation/`, and others.

## Contents
- 12 immediate files
- 7 child directories

## Key Files
- `bridge-result.mjs` - JavaScript/TypeScript module used by this directory.
- `bridge-result.spec.ts` - JavaScript/TypeScript module used by this directory.
- `discord-source.mjs` - JavaScript/TypeScript module used by this directory.
- `linear-worktree-health-states.mjs` - Exports `LINEAR_WORKTREE_HEALTH_STATES`, a shared constant or state value used by sibling modules.
- `symphony-config.mjs` - Exports `TARGET_MIN`, a shared constant or state value used by sibling modules.
- `symphony-config.spec.ts` - JavaScript/TypeScript module used by this directory.
- `symphony-state.mjs` - JavaScript/TypeScript module used by this directory.
- `symphony-state.spec.ts` - @ts-ignore - No type declarations for .mjs module
- `symphony-validation.mjs` - JavaScript/TypeScript module used by this directory.
- `task-evidence.mjs` - Re-export facade that assembles the public surface for this directory.
- `worktree-config.mjs` - JavaScript/TypeScript module used by this directory.
- `worktree-health.mjs` - JavaScript/TypeScript module used by this directory.

## Subdirectories
- `bridge-result/` - Directory for harness support logic; immediate files include `index.mjs`, `infer-symphony-result-from-completion.mjs`, `normalize-count.mjs`, `normalize-failure-class.mjs`, and others.
- `discord-source/` - Directory for Discord ingress, delivery, or notification support; immediate files include `detect-and-mark-discord-source.mjs`, `index.mjs`, `is-discord-sourced.mjs`, `mark-discord-source.mjs`.
- `symphony-state/` - Directory for git worktree management and concurrency support; immediate files include `acquire-integration-lock.mjs`, `acquire-lease.mjs`, `acquire-state-lock.mjs`, `add-external-key.mjs`, and others, with child directories `acquire-state-lock/`.
- `symphony-validation/` - Directory for harness support logic; immediate files include `filter-changed-files.mjs`, `format-validation-feedback.mjs`, `index.mjs`, `run-ast-density.mjs`, and others.
- `task-evidence/` - Directory for git worktree management and concurrency support; immediate files include `create-evidence-record.mjs`, `get-evidence-dir.mjs`, `get-evidence-path.mjs`, `index.mjs`, and others.
- `worktree-config/` - Directory for Discord ingress, delivery, or notification support; immediate files include `dirname.mjs`, `discord-worktree-ids.mjs`, `get-worktree-branch.mjs`, `get-worktree-path.mjs`, and others.
- `worktree-health/` - Directory for git worktree management and concurrency support; immediate files include `all-worktree-ids.mjs`, `get-current-branch.mjs`, `get-fleet-inventory.mjs`, `get-git-dirty-files.mjs`, and others.

## Operational Notes
- Current on-disk inventory: 12 immediate files and 7 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus
Check whether the directory purpose, immediate files, and child modules still align with the current harness architecture.

# Core

## Purpose
Core contains the code, configuration, or support files that implement this part of the harness architecture.

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
- `symphony-state.spec.ts` - JavaScript/TypeScript module used by this directory.
- `symphony-validation.mjs` - JavaScript/TypeScript module used by this directory.
- `task-evidence.mjs` - Re-export facade that assembles the public surface for this directory.
- `worktree-config.mjs` - JavaScript/TypeScript module used by this directory.
- `worktree-health.mjs` - JavaScript/TypeScript module used by this directory.

## Subdirectories
- `bridge-result/` - Bridge Result scope; immediate files include `index.mjs`, `infer-symphony-result-from-completion.mjs`, `normalize-count.mjs`, `normalize-failure-class.mjs`, and others.
- `discord-source/` - Discord Source scope; immediate files include `detect-and-mark-discord-source.mjs`, `index.mjs`, `is-discord-sourced.mjs`, `mark-discord-source.mjs`.
- `symphony-state/` - Symphony State scope; immediate files include `acquire-integration-lock.mjs`, `acquire-lease.mjs`, `acquire-state-lock.mjs`, `add-external-key.mjs`, and others; child directories include `acquire-state-lock/`.
- `symphony-validation/` - Symphony Validation scope; immediate files include `filter-changed-files.mjs`, `format-validation-feedback.mjs`, `index.mjs`, `run-ast-density.mjs`, and others.
- `task-evidence/` - Task Evidence scope; immediate files include `create-evidence-record.mjs`, `get-evidence-dir.mjs`, `get-evidence-path.mjs`, `index.mjs`, and others.
- `worktree-config/` - Worktree Config scope; immediate files include `dirname.mjs`, `discord-worktree-ids.mjs`, `get-worktree-branch.mjs`, `get-worktree-path.mjs`, and others.
- `worktree-health/` - Worktree Health scope; immediate files include `all-worktree-ids.mjs`, `get-current-branch.mjs`, `get-fleet-inventory.mjs`, `get-git-dirty-files.mjs`, and others.

## Operational Notes
- Current on-disk inventory: 12 immediate file(s) and 7 child directories.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus
Check that the current implementation in this directory still matches its intended role in the harness architecture.

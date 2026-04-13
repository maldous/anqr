# Symphony Worktree Pool

## Purpose
Utility surface for creating, listing, repairing, reprovisioning, and removing the git worktree fleet used by the concurrent executor pool.

## Contents
- 21 immediate files
- 0 child directories

## Key Files
- `cleanup-worktree-pool.d.ts` - Type declaration file for the sibling module surface.
- `cleanup-worktree-pool.mjs` - Exports `cleanupWorktreePool`, the main helper defined in this file.
- `create-worktree.d.ts` - Type declaration file for the sibling module surface.
- `create-worktree.mjs` - Exports `createWorktree`, the main helper defined in this file.
- `get-symphony-worktrees.d.ts` - Type declaration file for the sibling module surface.
- `get-symphony-worktrees.mjs` - Exports `getSymphonyWorktrees`, the main helper defined in this file.
- `index.d.ts` - Type declaration file for the sibling module surface.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `init-worktree-pool.d.ts` - Type declaration file for the sibling module surface.
- `init-worktree-pool.mjs` - Exports `initWorktreePool`, the main helper defined in this file.
- `list-worktrees.d.ts` - Type declaration file for the sibling module surface.
- `list-worktrees.mjs` - Exports `listWorktrees`, the main helper defined in this file.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `print-worktree-status.d.ts` - Type declaration file for the sibling module surface.
- `print-worktree-status.mjs` - Exports `printWorktreeStatus`, the main helper defined in this file.
- `remove-worktree.d.ts` - Type declaration file for the sibling module surface.
- `remove-worktree.mjs` - Exports `removeWorktree`, the main helper defined in this file.
- `repair-worktrees.d.ts` - Type declaration file for the sibling module surface.
- `repair-worktrees.mjs` - Exports `repairWorktrees`, the main helper defined in this file.
- `reprovision-worktree.mjs` - Exports `reprovisionWorktree`, the main helper defined in this file.
- `runtime.mjs` - Executable runtime bootstrap for this directory.

## Subdirectories
- No child directories in this directory.

## Operational Notes
- This directory manages the physical executor sandboxes rather than routing or scheduling policy.
- Its outputs must stay aligned with systemd instance naming and the scheduler's worktree partition assumptions.

## Review Focus
Confirm the pool lifecycle matches the documented worktree topology, branch naming, dependency installation expectations, and repair workflow assumptions.

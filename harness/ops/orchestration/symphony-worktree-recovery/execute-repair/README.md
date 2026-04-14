# Execute Repair

## Purpose
Concrete recovery action surface that applies quarantine, lease reclamation, reprovision, or guarded sandbox reset decisions to a classified worktree.

## Contents
- 2 immediate files
- 0 child directories

## Key Files
- `execute-repair.mjs` - Exports `executeRepair`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.

## Subdirectories
- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 2 immediate file(s) and 0 child directories.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus
Check that the current implementation in this directory still matches its intended role in the harness architecture.

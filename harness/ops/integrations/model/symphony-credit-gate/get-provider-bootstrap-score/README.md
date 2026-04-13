# Get Provider Bootstrap Score

## Purpose
Directory for provider selection, probing, and credit-aware routing; immediate files include `compute-context-bootstrap-boost.mjs`, `get-provider-bootstrap-score.mjs`, `index.mjs`.

## Contents
- 3 immediate files
- 0 child directories

## Key Files
- `compute-context-bootstrap-boost.mjs` - Exports `computeContextBootstrapBoost`, the main helper defined in this file.
- `get-provider-bootstrap-score.mjs` - Exports `getProviderBootstrapScore`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.

## Subdirectories
- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 3 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus
Check whether the external-system contract in this directory still matches live usage and the intended control-plane boundaries.

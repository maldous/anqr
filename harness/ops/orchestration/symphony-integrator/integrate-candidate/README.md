# Integrate Candidate

## Purpose
Directory for serial integration back into the main repository; immediate files include `build-evidence-comment.mjs`, `index.mjs`, `integrate-candidate.mjs`, `publish-evidence-and-close.mjs`.

## Contents
- 4 immediate files
- 0 child directories

## Key Files
- `build-evidence-comment.mjs` - Exports `buildEvidenceComment`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `integrate-candidate.mjs` - Exports `integrateCandidate`, the main helper defined in this file.
- `publish-evidence-and-close.mjs` - Exports `publishEvidenceAndClose`, the main helper defined in this file.

## Subdirectories
- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 4 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus
Check whether ownership, timing, and state transitions in this directory stay consistent with the harness concurrency and integration model.

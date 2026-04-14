# Send Via Open Claw

## Purpose

Directory for OpenClaw gateway/runtime configuration; immediate files include `delete-via-open-claw.mjs`, `index.mjs`, `send-via-open-claw.mjs`.

## Contents

- 3 immediate files
- 0 child directories

## Key Files

- `delete-via-open-claw.mjs` - Exports `deleteViaOpenClaw`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `send-via-open-claw.mjs` - Exports `sendViaOpenClaw`, the main helper defined in this file.

## Subdirectories

- No child directories in this directory.

## Operational Notes

- Current on-disk inventory: 3 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus

Check whether the external-system contract in this directory still matches live usage and the intended control-plane boundaries.

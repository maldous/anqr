# Quarantine And Restart

## Purpose

Directory for fleet recovery, quarantine, and health enforcement; immediate files include `index.mjs`, `quarantine-and-restart.mjs`, `write-evidence-record.mjs`.

## Contents

- 3 immediate files
- 0 child directories

## Key Files

- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `quarantine-and-restart.mjs` - Exports `quarantineAndRestart`, the main helper defined in this file.
- `write-evidence-record.mjs` - Exports `writeEvidenceRecord`, the main helper defined in this file.

## Subdirectories

- No child directories in this directory.

## Operational Notes

- Current on-disk inventory: 3 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus

Check whether runtime bootstrap assumptions and configuration boundaries still match the service topology described in the ADRs and workspace model.

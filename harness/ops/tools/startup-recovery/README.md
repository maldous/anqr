# Startup Recovery

## Purpose
Directory for fleet recovery, quarantine, and health enforcement; immediate files include `index.mjs`, `logger.mjs`, `main.mjs`, `run-command.mjs`, and others.

## Contents
- 5 immediate files
- 0 child directories

## Key Files
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `main.mjs` - Exports `main`, the main helper defined in this file.
- `run-command.mjs` - Exports `runCommand`, the main helper defined in this file.
- `runtime.mjs` - Executable runtime bootstrap for this directory.

## Subdirectories
- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 5 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus
Check whether the directory purpose, immediate files, and child modules still align with the current harness architecture.

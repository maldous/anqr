# Credentials

## Purpose
Directory for OpenClaw gateway/runtime configuration; immediate files include `discord-default-allowFrom.json`, `discord-pairing.json`.

## Contents
- 2 immediate files
- 0 child directories

## Key Files
- `discord-default-allowFrom.json` - JSON configuration/data file with top-level keys `version`, `allowFrom`.
- `discord-pairing.json` - JSON configuration/data file with top-level keys `version`, `requests`.

## Subdirectories
- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 2 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus
Check whether runtime bootstrap assumptions and configuration boundaries still match the service topology described in the ADRs and workspace model.

# Test Discord

## Purpose
Directory for OpenClaw gateway/runtime configuration; immediate files include `index.mjs`, `logger.mjs`, `openclaw-gateway-host.mjs`, `openclaw-gateway-port.mjs`, and others.

## Contents
- 8 immediate files
- 0 child directories

## Key Files
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `openclaw-gateway-host.mjs` - Exports `OPENCLAW_GATEWAY_HOST`, a shared constant or state value used by sibling modules.
- `openclaw-gateway-port.mjs` - Exports `OPENCLAW_GATEWAY_PORT`, a shared constant or state value used by sibling modules.
- `openclaw-gateway-token.mjs` - Exports `OPENCLAW_GATEWAY_TOKEN`, a shared constant or state value used by sibling modules.
- `run-tests.mjs` - Exports `runTests`, the main helper defined in this file.
- `runtime.mjs` - Executable runtime bootstrap for this directory.
- `test-voice-announcement.mjs` - Exports `testVoiceAnnouncement`, the main helper defined in this file.

## Subdirectories
- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 8 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus
Check whether the external-system contract in this directory still matches live usage and the intended control-plane boundaries.

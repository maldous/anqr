# Test Discord

## Purpose

Test Discord contains the code, configuration, or support files that implement this part of the harness architecture.

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

- Current on-disk inventory: 8 immediate file(s) and 0 child directories.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus

Check that the current implementation in this directory still matches its intended role in the harness architecture.

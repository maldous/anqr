# ANQR Test Discord Integration

## 1. Directory Overview

This directory implements **ANQR Test Discord Integration** within the ANQR harness. The immediate code includes a standalone runtime entry point alongside helper modules. The current inventory is 8 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **index.mjs** - Facade module that re-exports public members from `./openclaw-gateway-host.mjs`, `./openclaw-gateway-port.mjs`, `./openclaw-gateway-token.mjs`, `./test-voice-announcement.mjs`, `./run-tests.mjs`.
- **logger.mjs** - Shared logging helper module exporting `logError`, `logInfo`, `logWarn`.
- **openclaw-gateway-host.mjs** - Exports `OPENCLAW_GATEWAY_HOST`, a shared constant used by sibling modules.
- **openclaw-gateway-port.mjs** - Exports `OPENCLAW_GATEWAY_PORT`, a shared constant used by sibling modules.
- **openclaw-gateway-token.mjs** - Exports `OPENCLAW_GATEWAY_TOKEN`, a shared constant used by sibling modules.
- **run-tests.mjs** - Exports `runTests`, which runs tests.
- **runtime.mjs** - Executable runtime entry point for this directory.
- **test-voice-announcement.mjs** - Exports `testVoiceAnnouncement`, which implements test voice announcement.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory include network/API integration, Discord integration, OpenClaw integration, and Symphony integration. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```bash
node ops/integrations/notifications/test-discord/runtime.mjs
```

## 5. Dependencies

- **Node.js built-ins** - `node:http`
- **Internal relative modules** - `../../../lib/logger.mjs`, `./index.mjs`, `./logger.mjs`, `./openclaw-gateway-host.mjs`, `./openclaw-gateway-port.mjs`, `./openclaw-gateway-token.mjs`, `./test-voice-announcement.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.

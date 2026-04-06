# ANQR Test Discord Integration

## 1. Directory Overview

This directory contains test utilities for the Discord notification integration within the ANQR
(Agentic Number Query Runner) harness. It provides a test suite that validates Discord webhook
functionality including text messages, embedded messages, progress streaming, and voice
announcements via the OpenClaw Gateway. It currently contains 8 files and 0 subdirectories.

## 2. File Summaries

### Files

- **index.mjs** - Generated facade index that exports all public API members: `OPENCLAW_GATEWAY_HOST`, `OPENCLAW_GATEWAY_PORT`, `OPENCLAW_GATEWAY_TOKEN`, `testVoiceAnnouncement`, and `runTests`.
- **logger.mjs** - Shared logger module that re-exports `logInfo`, `logWarn`, and `logError` functions from the project's central logger (`../../../lib/logger.mjs`).
- **openclaw-gateway-host.mjs** - Exports the OpenClaw Gateway hostname configuration. Defaults to `127.0.0.1` if not set via environment variable `OPENCLAW_GATEWAY_HOST`.
- **openclaw-gateway-port.mjs** - Exports the OpenClaw Gateway port configuration. Defaults to `18789` if not set via environment variable `OPENCLAW_GATEWAY_PORT`.
- **openclaw-gateway-token.mjs** - Exports the OpenClaw Gateway authentication token from environment variable `OPENCLAW_GATEWAY_TOKEN`. Returns `null` if not configured.
- **run-tests.mjs** - Main test runner that executes four tests: (1) simple Discord text message, (2) Discord embedded message with fields, (3) progress update with streaming and flush, and (4) voice announcement via OpenClaw TTS. Prints summary and exits with code 0 on all pass or 1 on any failure.
- **runtime.mjs** - Generated runtime carry-forward that imports and executes the `runTests` function, with error handling that logs failures and exits with code 1 on error.
- **test-voice-announcement.mjs** - Voice announcement test function that sends text-to-speech via the OpenClaw Gateway HTTP API. Requires `OPENCLAW_GATEWAY_TOKEN` to be set. Makes a POST request to `/tools/invoke` with the message payload.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `runtime.mjs` provides a direct execution
path. The README content below is aligned to the current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/integrations/notifications/test-discord/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.

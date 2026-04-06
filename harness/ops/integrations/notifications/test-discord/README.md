# ANQR Test Discord Integration

## 1. Directory Overview

This directory contains test utilities for the Discord notification integration within the ANQR (Agentic Number Query Runner) harness. It provides a test suite that validates Discord webhook functionality including text messages, embedded messages, progress streaming, and voice announcements via the OpenClaw Gateway.

This directory follows the project's decomposition pattern where facade files (ending in `.mjs`) re-export from sibling modules under matching directories containing `index.mjs` and `runtime.mjs` files.

## 2. File Summaries

### Configuration Files

- **openclaw-gateway-host.mjs** - Exports the OpenClaw Gateway hostname configuration. Defaults to `127.0.0.1` if not set via environment variable `OPENCLAW_GATEWAY_HOST`.

- **openclaw-gateway-port.mjs** - Exports the OpenClaw Gateway port configuration. Defaults to `18789` if not set via environment variable `OPENCLAW_GATEWAY_PORT`.

- **openclaw-gateway-token.mjs** - Exports the OpenClaw Gateway authentication token from environment variable `OPENCLAW_GATEWAY_TOKEN`. Returns `null` if not configured.

### Logger Module

- **logger.mjs** - Shared logger module that re-exports `logInfo`, `logWarn`, and `logError` functions from the project's central logger (`../../../lib/logger.mjs`).

### Test Modules

- **index.mjs** - Generated facade index that exports all public API members: `OPENCLAW_GATEWAY_HOST`, `OPENCLAW_GATEWAY_PORT`, `OPENCLAW_GATEWAY_TOKEN`, `testVoiceAnnouncement`, and `runTests`.

- **runtime.mjs** - Generated runtime carry-forward that imports and executes the `runTests` function, with error handling that logs failures and exits with code 1 on error.

- **run-tests.mjs** - Main test runner that executes four tests: (1) simple Discord text message, (2) Discord embedded message with fields, (3) progress update with streaming and flush, and (4) voice announcement via OpenClaw TTS. Prints summary and exits with code 0 on all pass or 1 on any failure.

- **test-voice-announcement.mjs** - Voice announcement test function that sends text-to-speech via the OpenClaw Gateway HTTP API. Requires `OPENCLAW_GATEWAY_TOKEN` to be set. Makes a POST request to `/tools/invoke` with the message payload.

## 3. Overall Directory Function

This directory provides a validation suite for the Discord notification system used by the ANQR harness. The test runner exercises the core notification functions from the parent `openclaw-discord.mjs` module and validates both Discord webhook delivery and OpenClaw Gateway voice capabilities.

The test flow: `runtime.mjs` imports and executes `runTests` from `run-tests.mjs`, which calls the notification functions (`sendDiscordMessage`, `sendDiscordEmbed`, `streamDiscordUpdate`, `flushDiscordStream`) and `testVoiceAnnouncement`. Results are printed with pass/fail status, and the process exits with appropriate code.

## 4. Usage Instructions

### Running the Tests

```bash
# Via the facade (recommended)
node ops/integrations/notifications/test-discord.mjs
```

Or directly:

```bash
node ops/integrations/notifications/test-discord/runtime.mjs
```

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENCLAW_GATEWAY_HOST` | No | `127.0.0.1` | OpenClaw Gateway hostname |
| `OPENCLAW_GATEWAY_PORT` | No | `18789` | OpenClaw Gateway port |
| `OPENCLAW_GATEWAY_TOKEN` | No (for voice) | - | Authentication token for voice tests |

### Test Output

The test suite prints:
- Individual test results with pass/fail status
- A summary table showing all test outcomes
- Exit code 0 if all tests pass, 1 if any fail

## 5. Dependencies

### Internal Dependencies

- **../openclaw-discord.mjs** - Parent module providing `sendDiscordMessage`, `sendDiscordEmbed`, `streamDiscordUpdate`, and `flushDiscordStream` functions
- **../../../lib/logger.mjs** - Centralized logging utility

### Runtime Requirements

- Node.js with ESM support (.mjs files)
- Discord webhook URL configured in parent module
- OpenClaw Gateway running (for voice tests)

### External Services

- **Discord** - Webhook endpoint for text and embed messages
- **OpenClaw Gateway** - HTTP service for voice announcements (optional, voice test skipped if not configured)

## 6. Additional Comments

- **Graceful Degradation**: Voice announcement test is skipped if `OPENCLAW_GATEWAY_TOKEN` is not set, rather than failing the entire suite.

- **Buffer Flushing**: Test 3 intentionally exceeds the buffer limit to verify the flush mechanism works correctly.

- **Exit Codes**: The test runner uses exit codes to integrate with CI/CD pipelines - 0 for success, 1 for failure.

- **Voice Channel**: The voice announcement test hardcodes Discord channel ID `1486262758256410647` for testing purposes.
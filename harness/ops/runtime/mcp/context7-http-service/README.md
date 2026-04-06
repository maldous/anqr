# Context7 HTTP Service

## 1. Directory Overview

This directory implements **Context7 HTTP Service** within the ANQR harness. The immediate code includes a standalone runtime entry point alongside helper modules. The current inventory is 10 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **handle-request.mjs** - Exports `handleRequest`, which implements handle request.
- **index.mjs** - Facade module that re-exports public members from `./port.mjs`, `./started-at.mjs`, `./read-body.mjs`, `./send-json.mjs`, `./handle-request.mjs`, `./server.mjs`, and 1 more siblings.
- **logger.mjs** - Shared logging helper module exporting `logDebug`, `logError`, `logInfo`, `logWarn`.
- **port.mjs** - Exports `PORT`, a shared constant used by sibling modules.
- **read-body.mjs** - Exports `readBody`, which reads body.
- **runtime.mjs** - Executable runtime entry point for this directory.
- **send-json.mjs** - Exports `sendJSON`, which implements send json.
- **server.mjs** - Exports `server`, which implements server.
- **shutdown.mjs** - Exports `shutdown`, which implements shutdown.
- **started-at.mjs** - Exports `startedAt`, which implements started at.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory use network/API integration. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```bash
node ops/runtime/mcp/context7-http-service/runtime.mjs
```

## 5. Dependencies

- **Node.js built-ins** - `node:http`
- **Internal relative modules** - `../../../lib/logger.mjs`, `../context7-server.mjs`, `./handle-request.mjs`, `./index.mjs`, `./logger.mjs`, `./read-body.mjs`, `./send-json.mjs`, `./server.mjs`, `./started-at.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.

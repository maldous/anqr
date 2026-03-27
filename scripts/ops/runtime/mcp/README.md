# MCP Runtime — Context7 Server Wrapper

Local MCP (Model Context Protocol) server management for documentation resolution.

## Overview

This directory contains a wrapper around the [`@upstash/context7-mcp`](https://www.npmjs.com/package/@upstash/context7-mcp) package that:

1. **Spawns** a local Context7 MCP server as a child process (`npx -y @upstash/context7-mcp`)
2. **Communicates** with it via stdio using JSON-RPC 2.0 (the MCP transport layer)
3. **Falls back** to the Context7 cloud API when the local server is unavailable
4. **Manages** the full server lifecycle — start, stop, and health checks

## Files

| File | Purpose |
|---|---|
| `context7-server.mjs` | Server wrapper — spawns, manages, and communicates with the local MCP server |
| `README.md` | This file |

## Quick Start

```js
import {
  startContext7Server,
  stopContext7Server,
  resolveDocsLocally,
  isContext7ServerHealthy,
} from './context7-server.mjs';

// 1. Start the local MCP server
const started = await startContext7Server();
console.log('Server started:', started);

// 2. Check health
const healthy = await isContext7ServerHealthy();
console.log('Server healthy:', healthy);

// 3. Resolve documentation
const result = await resolveDocsLocally({
  libraryTitle: 'react',
  topic: 'hooks',
  max_tokens: 5000,
});
console.log(`Source: ${result.source}`);  // "local" or "cloud"
console.log(result.documentation);

// 4. Stop the server when done
await stopContext7Server();
```

## Exported Functions

### `startContext7Server() → Promise<boolean>`

Spawns the `@upstash/context7-mcp` process and performs the MCP `initialize` handshake. Returns `true` if the server started and responded successfully.

### `stopContext7Server() → Promise<void>`

Sends `SIGTERM` to the child process and waits up to 5 seconds for a clean exit. Falls back to `SIGKILL` if the process does not terminate in time.

### `isContext7ServerHealthy() → Promise<boolean>`

Sends a lightweight `tools/list` JSON-RPC request to verify the server is alive and processing requests. Times out after 5 seconds.

### `resolveDocsLocally({ libraryTitle, topic?, max_tokens? }) → Promise<{ source, documentation }>`

Two-step documentation resolution:

1. **Local MCP server** — calls `resolve-library-id` then `get-library-docs` via JSON-RPC
2. **Cloud API fallback** — if the local server is unavailable or returns no results, calls the Context7 REST API at `https://mcp.context7.com`

Returns an object:

| Field | Type | Description |
|---|---|---|
| `source` | `string` | `"local"`, `"cloud"`, or `"error"` |
| `documentation` | `string \| null` | The resolved documentation text, or `null` on failure |

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `CONTEXT7_API_KEY` | For cloud fallback | — | API key for the Context7 cloud REST API |
| `CONTEXT7_STARTUP_TIMEOUT_MS` | No | `15000` | Max time to wait for the local server to initialize |
| `CONTEXT7_REQUEST_TIMEOUT_MS` | No | `30000` | Per-request timeout for JSON-RPC and cloud API calls |
| `CONTEXT7_SERVER_LOG_LEVEL` | No | `DEBUG` | Log level for this module (`DEBUG`, `INFO`, `WARN`, `ERROR`) |

## Architecture

```
┌─────────────────────────┐
│   Calling Script         │
│   (e.g. symphony-agent) │
└─────────┬───────────────┘
          │  import { resolveDocsLocally }
          ▼
┌─────────────────────────┐
│  context7-server.mjs     │
│  (this wrapper)          │
│                          │
│  ┌───────────┐           │
│  │ JSON-RPC  │◄─stdio──►│──► npx @upstash/context7-mcp
│  │ over stdin/│           │     (child process)
│  │ stdout    │           │
│  └───────────┘           │
│                          │
│  ┌───────────┐           │
│  │ Cloud API │◄─HTTPS──►│──► https://mcp.context7.com
│  │ fallback  │           │
│  └───────────┘           │
└──────────────────────────┘
```

## MCP Protocol Details

The wrapper implements a minimal MCP client that:

1. Sends an `initialize` request with `protocolVersion: "2024-11-05"` on startup
2. Sends a `notifications/initialized` notification after successful handshake
3. Uses `tools/call` to invoke the two Context7 tools:
   - **`resolve-library-id`** — translates a library name to a Context7 library ID
   - **`get-library-docs`** — fetches documentation for a resolved library ID
4. Uses `tools/list` as a lightweight health-check probe

All communication is newline-delimited JSON over the child process stdio streams.

## Logging

Uses the shared logger from `scripts/ops/lib/logger.mjs`:

```js
import { createLogger } from '../../lib/logger.mjs';
const { logDebug, logInfo, logWarn, logError } = createLogger('context7-server');
```

Log output goes to stderr (for systemd journal capture). Control verbosity via:

```bash
export CONTEXT7_SERVER_LOG_LEVEL=INFO   # Suppress DEBUG messages
```

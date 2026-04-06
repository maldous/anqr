# ANQR MCP Runtime

## 1. Directory Overview

This directory contains the MCP (Model Context Protocol) runtime wrapper for Context7 documentation resolution. It provides a wrapper around the `@upstash/context7-mcp` package that spawns a local MCP server as a child process, communicates with it via stdio using JSON-RPC 2.0, falls back to the Context7 cloud API when the local server is unavailable, and manages the full server lifecycle including start, stop, and health checks. The directory also includes an HTTP service that exposes the MCP server over HTTP on port 4320 so other services like the Symphony Bridge can resolve documentation without spawning their own MCP child processes.

## 2. File Summaries

### Root Level Files

- **context7-server.mjs** - Auto-generated facade file that re-exports from `./context7-server/index.mjs` and `./context7-server/runtime.mjs`. This is the main server wrapper module that spawns, manages, and communicates with the local Context7 MCP server.

- **context7-http-service.mjs** - Auto-generated facade file that re-exports from `./context7-http-service/index.mjs` and `./context7-http-service/runtime.mjs`. This is a standalone HTTP service that wraps the MCP server and exposes it on port 4320.

- **README.md** - This file.

### Subdirectories

- **context7-server/** - Contains the decomposed server wrapper implementation with index.mjs, runtime.mjs, and supporting modules.

- **context7-http-service/** - Contains the decomposed HTTP service implementation with index.mjs, runtime.mjs, and supporting modules.

## 3. Overall Directory Function

This directory serves as the documentation resolution layer for the ANQR harness. The Context7 MCP server wrapper enables AI agents to fetch up-to-date library documentation from the Context7 service. The system works in two modes:

1. **Local MCP Server Mode**: Spawns `@upstash/context7-mcp` as a child process and communicates via JSON-RPC 2.0 over stdio. Uses the `resolve-library-id` tool to translate library names to Context7 library IDs, then uses the `query-docs` tool to fetch documentation.

2. **Cloud API Fallback**: When the local MCP server is unavailable or returns no results, falls back to the Upstash Context7 cloud API at `https://api.upstash.com/v1/context7` with the `POST /resolve` and `POST /docs` endpoints.

The HTTP service (`context7-http-service.mjs`) exposes this functionality over HTTP on port 4320 with endpoints `/v1/resolve-docs` and `/health`, allowing the Symphony Bridge to resolve documentation without spawning its own MCP child process.

## 4. Usage Instructions

### As a Library

```js
import {
  startContext7Server,
  stopContext7Server,
  resolveDocsLocally,
  isContext7ServerHealthy,
} from "./context7-server.mjs";

// 1. Start the local MCP server
const started = await startContext7Server();
console.log("Server started:", started);

// 2. Check health
const healthy = await isContext7ServerHealthy();
console.log("Server healthy:", healthy);

// 3. Resolve documentation
const result = await resolveDocsLocally({
  libraryTitle: "React",
  topic: "hooks",
  max_tokens: 5000,
});
console.log(`Source: ${result.source}`); // "local" or "cloud"
console.log(result.documentation);

// 4. Stop the server when done
await stopContext7Server();
```

### As an HTTP Service

```bash
# Install and enable the systemd service
cp services/systemd/anqr-context7-mcp.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now anqr-context7-mcp.service

# Check status
curl http://127.0.0.1:4320/health
systemctl --user status anqr-context7-mcp
```

**HTTP Endpoints:**

| Method | Path | Purpose |
| ------ | ---- | ------- |
| `POST` | `/v1/resolve-docs` | Resolve library documentation. Body: `{ libraryTitle, topic?, max_tokens? }` |
| `GET` | `/health` | Health check. Response: `{ status, serverReady, uptime }` |

### Exported Functions

- `startContext7Server()` - Spawns the MCP process and performs the initialize handshake. Returns `Promise<boolean>`.
- `stopContext7Server()` - Sends SIGTERM to the child process, falls back to SIGKILL after 5 seconds. Returns `Promise<void>`.
- `isContext7ServerHealthy()` - Sends a lightweight `tools/list` JSON-RPC request. Returns `Promise<boolean>`.
- `resolveDocsLocally({ libraryTitle, topic?, max_tokens? })` - Resolves documentation locally or via cloud fallback. Returns `Promise<{ source, documentation }>`.

## 5. Dependencies

### Runtime Dependencies

- **Node.js** - ESM modules with .mjs extension
- **@upstash/context7-mcp** - The Context7 MCP server package (installed via npx)

### External Services

- **Context7 MCP Server** - Local child process spawned via `npx -y @upstash/context7-mcp`
- **Context7 Cloud API** - Fallback API at `https://api.upstash.com/v1/context7`

### Environment Variables

| Variable | Required | Default | Description |
| -------- | -------- | ------- | ----------- |
| `CONTEXT7_API_KEY` | For cloud fallback | - | API key for the Context7 cloud REST API |
| `CONTEXT7_HTTP_URL` | No | `http://127.0.0.1:4320` | URL for the HTTP service |
| `CONTEXT7_STARTUP_TIMEOUT_MS` | No | `15000` | Max time to wait for local server to initialize |
| `CONTEXT7_REQUEST_TIMEOUT_MS` | No | `30000` | Per-request timeout for JSON-RPC and cloud API calls |
| `CONTEXT7_SERVER_LOG_LEVEL` | No | `DEBUG` | Log level (`DEBUG`, `INFO`, `WARN`, `ERROR`) |

### Internal Dependencies

- **../../lib/logger.mjs** - Shared logger module for logging

## 6. Additional Comments

- **Protocol Version**: The wrapper implements MCP protocol version "2024-11-05" and sends a `notifications/initialized` notification after successful handshake.

- **Library Name Normalization**: The wrapper accepts library names in any casing (e.g., "React", "react", "REACT") and passes them to the MCP server as-is. The Context7 MCP server handles normalization internally.

- **Logging**: Uses the shared logger from `harness/ops/lib/logger.mjs`. Log output goes to stderr for systemd journal capture. Control verbosity via `CONTEXT7_SERVER_LOG_LEVEL` environment variable.

- **Architecture**: The calling script imports `resolveDocsLocally` from `context7-server.mjs`, which communicates with the MCP server over stdio using JSON-RPC. If the local server is unavailable, it falls back to the cloud API over HTTPS.

- **Health Checks**: The `isContext7ServerHealthy()` function uses `tools/list` as a lightweight health-check probe with a 5-second timeout.

- **Systemd Integration**: The HTTP service can be run as a systemd user service for persistent operation, allowing other services to resolve documentation without managing their own MCP server lifecycle.
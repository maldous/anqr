# Context7 HTTP Service

## 1. Directory Overview

This directory contains the HTTP service layer that exposes the Context7 MCP (Model Context
Protocol) server via REST API endpoints. The service acts as a bridge between HTTP clients and the
local Context7 MCP server, providing documentation resolution capabilities. It currently contains 10
files and 0 subdirectories.

## 2. File Summaries

### Files

- **handle-request.mjs** - Request routing and handling module. Implements two endpoints:
- **index.mjs** - Facade module that exports all public API members from sibling modules including PORT, startedAt, readBody, sendJSON, handleRequest, server, and shutdown.
- **logger.mjs** - Shared logger module. Creates a namespaced logger for "context7-http" using the project's shared logger factory. Exports logDebug, logInfo, logWarn, and logError functions.
- **port.mjs** - Port configuration module. Parses port from command-line arguments (--port), environment variable (CONTEXT7_HTTP_PORT), or defaults to 4320.
- **read-body.mjs** - Request body reading utility. Reads and buffers incoming request body chunks, returning a Promise that resolves to the body as a UTF-8 string.
- **runtime.mjs** - Runtime carry-forward module that initializes and starts the HTTP server. Sets up server timeouts (timeout=0, keepAliveTimeout=0), registers signal handlers for SIGTERM and SIGINT, listens on the configured port, and starts the Context7 MCP server.
- **send-json.mjs** - JSON response helper. Sends JSON responses with proper Content-Type and Content-Length headers.
- **server.mjs** - HTTP server creation module using Node.js built-in http module. Exports the server instance created with handleRequest as the request handler.
- **shutdown.mjs** - Graceful shutdown handler. Stops the Context7 MCP server and closes the HTTP server when receiving shutdown signals (SIGTERM/SIGINT).
- **started-at.mjs** - Uptime tracking module. Exports startedAt timestamp constant set to Date.now() at module load time.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `runtime.mjs` provides a direct execution
path. The README content below is aligned to the current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/runtime/mcp/context7-http-service/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.

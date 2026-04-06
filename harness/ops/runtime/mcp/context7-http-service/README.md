# Context7 HTTP Service

## 1. Directory Overview

This directory contains the HTTP service layer that exposes the Context7 MCP (Model Context Protocol) server via REST API endpoints. The service acts as a bridge between HTTP clients and the local Context7 MCP server, providing documentation resolution capabilities.

## 2. File Summaries

- **index.mjs** - Facade module that exports all public API members from sibling modules including PORT, startedAt, readBody, sendJSON, handleRequest, server, and shutdown.

- **runtime.mjs** - Runtime carry-forward module that initializes and starts the HTTP server. Sets up server timeouts (timeout=0, keepAliveTimeout=0), registers signal handlers for SIGTERM and SIGINT, listens on the configured port, and starts the Context7 MCP server.

- **server.mjs** - HTTP server creation module using Node.js built-in http module. Exports the server instance created with handleRequest as the request handler.

- **handle-request.mjs** - Request routing and handling module. Implements two endpoints:
  - GET /health - Returns health status of the Context7 MCP server and server uptime
  - POST /v1/resolve-docs - Resolves documentation for a given library title and topic

- **port.mjs** - Port configuration module. Parses port from command-line arguments (--port), environment variable (CONTEXT7_HTTP_PORT), or defaults to 4320.

- **read-body.mjs** - Request body reading utility. Reads and buffers incoming request body chunks, returning a Promise that resolves to the body as a UTF-8 string.

- **send-json.mjs** - JSON response helper. Sends JSON responses with proper Content-Type and Content-Length headers.

- **shutdown.mjs** - Graceful shutdown handler. Stops the Context7 MCP server and closes the HTTP server when receiving shutdown signals (SIGTERM/SIGINT).

- **logger.mjs** - Shared logger module. Creates a namespaced logger for "context7-http" using the project's shared logger factory. Exports logDebug, logInfo, logWarn, and logError functions.

- **started-at.mjs** - Uptime tracking module. Exports startedAt timestamp constant set to Date.now() at module load time.

## 3. Overall Directory Function

This directory serves as the HTTP facade for the Context7 MCP server. The service listens on localhost (127.0.0.1) and exposes two main endpoints:

- **Health endpoint** - Allows monitoring systems to check if the Context7 MCP server is running and healthy
- **Documentation resolution endpoint** - Accepts library titles and topics, resolves them via the Context7 MCP server, and returns documentation

The runtime module orchestrates server startup, setting appropriate timeout configurations and registering signal handlers for graceful shutdown. If the Context7 MCP server fails to start, the service logs a warning and continues running (cloud API fallback is available).

## 4. Usage Instructions

### Starting the Service

```bash
# Default port (4320)
node ops/runtime/mcp/context7-http-service/runtime.mjs

# Custom port via CLI
node ops/runtime/mcp/context7-http-service/runtime.mjs --port 5000

# Custom port via environment variable
CONTEXT7_HTTP_PORT=5000 node ops/runtime/mcp/context7-http-service/runtime.mjs
```

### API Endpoints

**Health Check**
```bash
curl http://127.0.0.1:4320/health
```

**Resolve Documentation**
```bash
curl -X POST http://127.0.0.1:4320/v1/resolve-docs \
  -H "Content-Type: application/json" \
  -d '{"libraryTitle": "react", "topic": "useState"}'
```

### Shutdown

The service handles SIGTERM and SIGINT signals gracefully, closing both the Context7 MCP server and the HTTP server before exiting.

## 5. Dependencies

### Internal Dependencies

- **../context7-server.mjs** - Provides startContext7Server, stopContext7Server, resolveDocsLocally, and isContext7ServerHealthy functions
- **../../../lib/logger.mjs** - Shared logger factory for creating namespaced loggers
- **node:http** - Node.js built-in HTTP module (no external dependency)

### Runtime Requirements

- Node.js with ESM support (.mjs files)
- Context7 MCP server module (context7-server.mjs)
- Local MCP server must be properly configured and accessible

### Environment Variables

- **CONTEXT7_HTTP_PORT** - Optional port override (defaults to 4320)

## 6. Additional Comments

- **Local-only binding** - The server binds to 127.0.0.1 (localhost only) for security, ensuring it's not exposed externally by default.

- **Timeout configuration** - Server timeouts are set to 0 (unlimited) to handle long-running requests without disconnecting clients.

- **Graceful degradation** - If the local Context7 MCP server fails to start, the service logs a warning and continues running, potentially falling back to cloud API.

- **Uptime tracking** - The startedAt constant enables the /health endpoint to report server uptime in seconds.

- **Error handling** - The /v1/resolve-docs endpoint validates required fields (libraryTitle) and returns appropriate 400 errors for missing parameters, 500 errors for processing failures.
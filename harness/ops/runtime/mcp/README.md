# ANQR MCP Runtime

## 1. Directory Overview

This directory contains the MCP (Model Context Protocol) runtime wrapper for Context7 documentation
resolution. It provides a wrapper around the `@upstash/context7-mcp` package that spawns a local MCP
server as a child process, communicates with it via stdio using JSON-RPC 2.0, falls back to the
Context7 cloud API when the local server is unavailable, and manages the full server lifecycle
including start, stop, and health checks. The directory also includes an HTTP service that exposes
the MCP server over HTTP on port 4320 so other services like the Symphony Bridge can resolve
documentation without spawning their own MCP child processes. It currently contains 2 files and 2
subdirectories.

## 2. File Summaries

### Files

- **context7-http-service.mjs** - Auto-generated facade file that re-exports from `./context7-http-service/index.mjs` and `./context7-http-service/runtime.mjs`. This is a standalone HTTP service that wraps the MCP server and exposes it on port 4320.
- **context7-server.mjs** - Auto-generated facade file that re-exports from `./context7-server/index.mjs` and `./context7-server/runtime.mjs`. This is the main server wrapper module that spawns, manages, and communicates with the local Context7 MCP server.

### Child Directories

- **context7-http-service/** - This directory contains the HTTP service layer that exposes the Context7 MCP (Model Context Protocol) server via REST API endpoints.
- **context7-server/** - This directory contains the Context7 MCP (Model Context Protocol) server integration for the ANQR (Agentic Number Query Runner) harness.

## 3. Overall Directory Function

In practice, child directories split the area into smaller focused modules. The README content below
is aligned to the current immediate directory contents.

## 4. Usage Instructions

This directory is primarily consumed through its files and child modules rather than a single entry point.

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.

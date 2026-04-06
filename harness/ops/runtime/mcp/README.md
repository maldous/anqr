# ANQR MCP Runtime

## 1. Directory Overview

This directory implements **ANQR MCP Runtime** within the ANQR harness. It primarily acts as a namespace and aggregation layer for child directories, with only a small amount of immediate code. The current inventory is 2 non-README files and 2 subdirectories.

## 2. File Summaries

### Files

- **context7-http-service.mjs** - Facade module that re-exports public members from `./context7-http-service/index.mjs`, `./context7-http-service/runtime.mjs`.
- **context7-server.mjs** - Facade module that re-exports public members from `./context7-server/index.mjs`, `./context7-server/runtime.mjs`.

### Subdirectories

- **context7-http-service/** - Contains **Context7 HTTP Service**; it contains 10 immediate files and has 0 child directories.
- **context7-server/** - Contains **ANQR Context7 Server**; it contains 51 immediate files and has 0 child directories.

## 3. Overall Directory Function

Most of the behavior lives in child directories; the immediate directory mainly provides namespacing and lightweight aggregation.

## 4. Usage Instructions

This directory does not define an obvious standalone entry point. Its files are consumed by adjacent harness modules or by child directories.

## 5. Dependencies

- **Internal relative modules** - `./context7-http-service/index.mjs`, `./context7-http-service/runtime.mjs`, `./context7-server/index.mjs`, `./context7-server/runtime.mjs`

## 6. Additional Comments

- No direct standalone runtime entry point is defined in the immediate directory contents.

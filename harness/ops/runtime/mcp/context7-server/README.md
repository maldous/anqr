# ANQR Context7 Server

## 1. Directory Overview

This directory contains the Context7 MCP (Model Context Protocol) server integration for the ANQR
(Agentic Number Query Runner) harness. It provides a wrapper around the `@upstash/context7-mcp`
package to enable documentation retrieval capabilities. The module handles server lifecycle
management, JSON-RPC communication, library ID resolution, and documentation fetching with both
local MCP and cloud API fallback mechanisms. It currently contains 51 files and 0 subdirectories.

## 2. File Summaries

### Files

- **add-part.mjs** - Adds non-empty trimmed strings to parts arrays.
- **build-docs-arguments.mjs** - Builds arguments for the docs tool based on its supported parameters (context7CompatibleLibraryID, libraryId, topic, query, tokens, max_tokens, page).
- **build-resolve-arguments.mjs** - Builds arguments for the resolve-library-id tool based on its supported parameter names.
- **call-local-tool.mjs** - Invokes a tool on the local MCP server via JSON-RPC `tools/call`.
- **cloud-api-base.mjs** - Cloud API base URLs (current: context7.com, legacy: api.context7.com), configurable via environment variables.
- **collect-documentation.mjs** - Recursively collects documentation from nested objects, arrays, and various response formats (content, results, infoSnippets, codeSnippets).
- **extract-documentation.mjs** - Collects documentation parts from tool results and deduplicates identical entries.
- **extract-from-value.mjs** - Recursively extracts arrays of tools from nested JSON structures.
- **extract-ids-from-string.mjs** - Uses regex patterns to extract Context7 library IDs from plain text responses.
- **extract-library-id.mjs** - Inspects resolver results to extract library IDs, scoring candidates by fuzzy matching against preferred text.
- **extract-tools-list.mjs** - Recursively extracts tool objects from nested JSON-RPC response structures.
- **fetch-cloud.mjs** - Module that supports fetch cloud. Exports `fetchCloud`.
- **format-cloud-context.mjs** - Formats cloud API responses into deduplicated Markdown documentation with code blocks and source URLs.
- **get-documentation-local.mjs** - Retrieves documentation by calling the local MCP server's docs tool with built arguments.
- **get-library-docs-cloud.mjs** - Fetches documentation from the Context7 cloud API at `/api/v2/context`, with automatic 301 redirect handling and legacy fallback.
- **get-library-docs-legacy-cloud.mjs** - Legacy cloud API endpoint at `/v1/docs` for backward compatibility.
- **get-tool-property-names.mjs** - Extracts property names from a tool's input schema for dynamic argument building.
- **handle-json-rpc-message.mjs** - Routes incoming JSON-RPC messages to their corresponding pending request resolvers or logs server-initiated notifications.
- **handle-shutdown.mjs** - Processes SIGTERM and SIGINT signals to cleanly shutdown the Context7 MCP server.
- **handle-stdout-data.mjs** - Buffers stdout data from the MCP server and parses newline-delimited JSON-RPC messages. Handles partial messages and logs parsing failures.
- **index.mjs** - Generated facade that exports all public API members from the implementation modules.
- **inspect-value.mjs** - Recursively inspects values to extract library IDs from nested objects and arrays.
- **is-context7-server-healthy.mjs** - Health check that verifies the server process is running, ready, and has a valid tool registry.
- **local-tool-arguments.mjs** - Re-exports buildResolveArguments and buildDocsArguments for external use.
- **logger.mjs** - Shared logger using the project's logger module, tagged with "context7-server".
- **next-request-id.mjs** - Counter for generating unique JSON-RPC request IDs.
- **normalize-name.mjs** - Normalizes tool names to lowercase for comparison.
- **normalize-value.mjs** - Normalizes values to lowercase trimmed strings.
- **normalized-topic.mjs** - Normalizes the topic query, defaulting to a generic documentation request if empty.
- **pending-requests.mjs** - Map storing in-flight requests with their resolve/reject callbacks and timeout timers.
- **pick-tool.mjs** - Selects a tool from the registry by preferred exact name or fallback regex pattern.
- **push-candidate.mjs** - Adds valid library ID candidates (those starting with "/") to the candidates array.
- **read-schema.mjs** - Reads the input schema from a tool object, supporting various schema property names (inputSchema, parameters, schema).
- **refresh-tool-registry.mjs** - Queries the MCP server's `tools/list` method and caches the available tools. Identifies the resolve-library-id and docs tools by name pattern matching.
- **reject-all-pending.mjs** - Module that supports reject all pending. Exports `rejectAllPending`.
- **render-code-block.mjs** - Wraps code in triple backticks for Markdown rendering.
- **render-code-snippet.mjs** - Renders code snippets with titles and code blocks in Markdown format.
- **request-timeout-ms.mjs** - Request timeout configuration (default 30s), configurable via `CONTEXT7_REQUEST_TIMEOUT_MS`.
- **resolve-docs-locally.mjs** - High-level function that attempts local MCP resolution first, then falls back to cloud API.
- **resolve-library-id-cloud.mjs** - Fallback resolver using the Context7 cloud API at `/api/v2/libs/search` when local resolution fails or is unavailable.
- **resolve-library-id-local.mjs** - Resolves a library ID by calling the local MCP server's resolve-library-id tool with the library title and optional topic.
- **runtime.mjs** - Generated runtime carry-forward that imports and executes the shutdown handler.
- **score-candidate.mjs** - Scores library ID candidates by comparing normalized ID and hint against preferred text (exact match: 100, suffix match: 90, contains: 70).
- **send-request.mjs** - Sends JSON-RPC requests to the MCP server over stdin, manages request timeouts, and maintains a pending requests map for response correlation.
- **server-process.mjs** - Mutable state holder for the spawned child process reference.
- **server-ready.mjs** - Boolean flag indicating whether the MCP server has completed initialization and is ready to accept requests.
- **start-context7-server.mjs** - Spawns the Context7 MCP server as a child process using `npx @upstash/context7-mcp --transport stdio`. Handles server initialization, protocol handshake, and tool registry discovery.
- **startup-timeout-ms.mjs** - Server startup timeout (default 15s), configurable via `CONTEXT7_STARTUP_TIMEOUT_MS`.
- **stdout-buffer.mjs** - Accumulates stdout data chunks for line-by-line JSON-RPC parsing.
- **stop-context7-server.mjs** - Gracefully stops the MCP server with SIGTERM, with a force-kill fallback after 5 seconds. Rejects all pending requests and resets server state.
- **tool-registry.mjs** - Module that supports tool registry. Exports `setToolRegistry, toolRegistry`.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `runtime.mjs` provides a direct execution
path. The README content below is aligned to the current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/runtime/mcp/context7-server/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.

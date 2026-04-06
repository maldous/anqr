# ANQR Context7 Server

## 1. Directory Overview

This directory contains the Context7 MCP (Model Context Protocol) server integration for the ANQR (Agentic Number Query Runner) harness. It provides a wrapper around the `@upstash/context7-mcp` package to enable documentation retrieval capabilities. The module handles server lifecycle management, JSON-RPC communication, library ID resolution, and documentation fetching with both local MCP and cloud API fallback mechanisms.

## 2. File Summaries

### Server Lifecycle

- **start-context7-server.mjs** - Spawns the Context7 MCP server as a child process using `npx @upstash/context7-mcp --transport stdio`. Handles server initialization, protocol handshake, and tool registry discovery.

- **stop-context7-server.mjs** - Gracefully stops the MCP server with SIGTERM, with a force-kill fallback after 5 seconds. Rejects all pending requests and resets server state.

- **handle-shutdown.mjs** - Processes SIGTERM and SIGINT signals to cleanly shutdown the Context7 MCP server.

### Communication & JSON-RPC

- **handle-stdout-data.mjs** - Buffers stdout data from the MCP server and parses newline-delimited JSON-RPC messages. Handles partial messages and logs parsing failures.

- **handle-json-rpc-message.mjs** - Routes incoming JSON-RPC messages to their corresponding pending request resolvers or logs server-initiated notifications.

- **send-request.mjs** - Sends JSON-RPC requests to the MCP server over stdin, manages request timeouts, and maintains a pending requests map for response correlation.

- **server-process.mjs** - Mutable state holder for the spawned child process reference.

- **server-ready.mjs** - Boolean flag indicating whether the MCP server has completed initialization and is ready to accept requests.

- **stdout-buffer.mjs** - Accumulates stdout data chunks for line-by-line JSON-RPC parsing.

- **pending-requests.mjs** - Map storing in-flight requests with their resolve/reject callbacks and timeout timers.

- **next-request-id.mjs** - Counter for generating unique JSON-RPC request IDs.

### Tool Registry Management

- **refresh-tool-registry.mjs** - Queries the MCP server's `tools/list` method and caches the available tools. Identifies the resolve-library-id and docs tools by name pattern matching.

- **get-tool-property-names.mjs** - Extracts property names from a tool's input schema for dynamic argument building.

- **extract-tools-list.mjs** - Recursively extracts tool objects from nested JSON-RPC response structures.

- **pick-tool.mjs** - Selects a tool from the registry by preferred exact name or fallback regex pattern.

- **read-schema.mjs** - Reads the input schema from a tool object, supporting various schema property names (inputSchema, parameters, schema).

- **call-local-tool.mjs** - Invokes a tool on the local MCP server via JSON-RPC `tools/call`.

### Library ID Resolution

- **resolve-library-id-local.mjs** - Resolves a library ID by calling the local MCP server's resolve-library-id tool with the library title and optional topic.

- **resolve-library-id-cloud.mjs** - Fallback resolver using the Context7 cloud API at `/api/v2/libs/search` when local resolution fails or is unavailable.

- **extract-library-id.mjs** - Inspects resolver results to extract library IDs, scoring candidates by fuzzy matching against preferred text.

- **build-resolve-arguments.mjs** - Builds arguments for the resolve-library-id tool based on its supported parameter names.

- **score-candidate.mjs** - Scores library ID candidates by comparing normalized ID and hint against preferred text (exact match: 100, suffix match: 90, contains: 70).

- **inspect-value.mjs** - Recursively inspects values to extract library IDs from nested objects and arrays.

- **extract-ids-from-string.mjs** - Uses regex patterns to extract Context7 library IDs from plain text responses.

- **push-candidate.mjs** - Adds valid library ID candidates (those starting with "/") to the candidates array.

### Documentation Retrieval

- **get-documentation-local.mjs** - Retrieves documentation by calling the local MCP server's docs tool with built arguments.

- **get-library-docs-cloud.mjs** - Fetches documentation from the Context7 cloud API at `/api/v2/context`, with automatic 301 redirect handling and legacy fallback.

- **get-library-docs-legacy-cloud.mjs** - Legacy cloud API endpoint at `/v1/docs` for backward compatibility.

- **build-docs-arguments.mjs** - Builds arguments for the docs tool based on its supported parameters (context7CompatibleLibraryID, libraryId, topic, query, tokens, max_tokens, page).

- **extract-documentation.mjs** - Collects documentation parts from tool results and deduplicates identical entries.

- **collect-documentation.mjs** - Recursively collects documentation from nested objects, arrays, and various response formats (content, results, infoSnippets, codeSnippets).

- **render-code-snippet.mjs** - Renders code snippets with titles and code blocks in Markdown format.

- **render-code-block.mjs** - Wraps code in triple backticks for Markdown rendering.

- **format-cloud-context.mjs** - Formats cloud API responses into deduplicated Markdown documentation with code blocks and source URLs.

### Utilities & Helpers

- **logger.mjs** - Shared logger using the project's logger module, tagged with "context7-server".

- **request-timeout-ms.mjs** - Request timeout configuration (default 30s), configurable via `CONTEXT7_REQUEST_TIMEOUT_MS`.

- **startup-timeout-ms.mjs** - Server startup timeout (default 15s), configurable via `CONTEXT7_STARTUP_TIMEOUT_MS`.

- **extract-from-value.mjs** - Recursively extracts arrays of tools from nested JSON structures.

- **add-part.mjs** - Adds non-empty trimmed strings to parts arrays.

- **normalize-name.mjs** - Normalizes tool names to lowercase for comparison.

- **normalize-value.mjs** - Normalizes values to lowercase trimmed strings.

- **normalized-topic.mjs** - Normalizes the topic query, defaulting to a generic documentation request if empty.

- **is-context7-server-healthy.mjs** - Health check that verifies the server process is running, ready, and has a valid tool registry.

- **resolve-docs-locally.mjs** - High-level function that attempts local MCP resolution first, then falls back to cloud API.

- **local-tool-arguments.mjs** - Re-exports buildResolveArguments and buildDocsArguments for external use.

- **cloud-api-base.mjs** - Cloud API base URLs (current: context7.com, legacy: api.context7.com), configurable via environment variables.

### Facade Files

- **index.mjs** - Generated facade that exports all public API members from the implementation modules.

- **runtime.mjs** - Generated runtime carry-forward that imports and executes the shutdown handler.

## 3. Overall Directory Function

This directory provides a comprehensive Context7 MCP server integration for the ANQR harness. The system operates in two modes:

1. **Local MCP Mode**: Spawns the `@upstash/context7-mcp` server as a child process and communicates via JSON-RPC over stdio. The server exposes tools for resolving library IDs and retrieving documentation.

2. **Cloud Fallback Mode**: When the local MCP server is unavailable, the system falls back to the Context7 cloud APIs for library resolution and documentation retrieval.

The workflow for resolving documentation:
1. Start the MCP server (or use cloud fallback)
2. Resolve library ID (local tool or cloud search)
3. Fetch documentation (local tool or cloud API)
4. Format and deduplicate results

Key features include automatic tool discovery, adaptive argument building based on tool schemas, robust error handling with graceful degradation, health monitoring, and request timeout management.

## 4. Usage Instructions

This module is primarily imported by other harness components. Key usage patterns:

```javascript
// Start the Context7 MCP server
import { startContext7Server } from "./ops/runtime/mcp/context7-server/index.mjs";
const started = await startContext7Server();

// Check server health
import { isContext7ServerHealthy } from "./ops/runtime/mcp/context7-server/index.mjs";
const healthy = await isContext7ServerHealthy();

// Resolve documentation (local first, then cloud fallback)
import { resolveDocsLocally } from "./ops/runtime/mcp/context7-server/index.mjs";
const result = await resolveDocsLocally({
  libraryTitle: "react",
  topic: "useState",
  max_tokens: 5000
});
// result: { source: "local" | "cloud", documentation: string | null }

// Stop the server
import { stopContext7Server } from "./ops/runtime/mcp/context7-server/index.mjs";
await stopContext7Server();
```

### Environment Variables

- `CONTEXT7_API_KEY` - API key for cloud fallback (required for cloud mode)
- `CONTEXT7_API_BASE` - Override for cloud API base URL (default: https://context7.com)
- `CONTEXT7_LEGACY_API_BASE` - Override for legacy API base URL (default: https://api.context7.com)
- `CONTEXT7_REQUEST_TIMEOUT_MS` - Request timeout in milliseconds (default: 30000)
- `CONTEXT7_STARTUP_TIMEOUT_MS` - Server startup timeout in milliseconds (default: 15000)

### Signal Handling

The module automatically handles SIGTERM and SIGINT for clean shutdown:

```javascript
process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));
```

## 5. Dependencies

### Runtime Dependencies

- **Node.js** - ESM modules with .mjs extension
- **@upstash/context7-mcp** - The Context7 MCP server package (installed via npx)

### Internal Dependencies

- **../../../lib/logger.mjs** - Shared logging utility

### External Services

- **Context7 Cloud API** - Cloud fallback for library resolution and documentation (requires API key)
- **Legacy Context7 API** - Backward compatibility fallback

## 6. Additional Comments

- **JSON-RPC Protocol**: The local MCP server communication uses JSON-RPC 2.0 over stdio. Messages are newline-delimited and include id, method, and params fields.

- **Fail-Closed Design**: The module defaults to local MCP mode and only falls back to cloud when the local server is unavailable or returns empty results.

- **Tool Discovery**: The system dynamically discovers tool capabilities by reading their input schemas, enabling adaptive argument building across different MCP server versions.

- **Request Correlation**: Each JSON-RPC request gets a unique ID for correlating responses with pending promises.

- **Timeout Management**: Separate timeouts for startup (15s default) and requests (30s default) prevent indefinite blocking.

- **Graceful Degradation**: If the MCP server crashes or becomes unresponsive, pending requests are rejected with meaningful error messages, and the system can fall back to cloud APIs.

- **Memory Safety**: The stdout buffer is accumulated and processed line-by-line to handle partial JSON-RPC messages correctly.

- **Library ID Format**: Context7 library IDs follow the format `/provider/library-name` (e.g., `/npm/react`).
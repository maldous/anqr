# Context7 Server

## Purpose
Context7 Server contains the code, configuration, or support files that implement this part of the harness architecture.

## Contents
- 51 immediate files
- 0 child directories

## Key Files
- `add-part.mjs` - Exports `addPart`, the main helper defined in this file.
- `build-docs-arguments.mjs` - Exports `buildDocsArguments`, the main helper defined in this file.
- `build-resolve-arguments.mjs` - Exports `buildResolveArguments`, the main helper defined in this file.
- `call-local-tool.mjs` - Exports `callLocalTool`, the main helper defined in this file.
- `cloud-api-base.mjs` - Exports `CLOUD_API_BASE`, a shared constant or state value used by sibling modules.
- `collect-documentation.mjs` - Exports `collectDocumentation`, the main helper defined in this file.
- `extract-documentation.mjs` - Exports `extractDocumentation`, the main helper defined in this file.
- `extract-from-value.mjs` - Exports `extractFromValue`, the main helper defined in this file.
- `extract-ids-from-string.mjs` - Exports `extractIdsFromString`, the main helper defined in this file.
- `extract-library-id.mjs` - Exports `extractLibraryId`, the main helper defined in this file.
- `extract-tools-list.mjs` - Exports `extractToolsList`, the main helper defined in this file.
- `fetch-cloud.mjs` - Exports `fetchCloud`, the main helper defined in this file.
- `format-cloud-context.mjs` - Exports `formatCloudContext`, the main helper defined in this file.
- `get-documentation-local.mjs` - Exports `getDocumentationLocal`, the main helper defined in this file.
- `get-library-docs-cloud.mjs` - Exports `getLibraryDocsCloud`, the main helper defined in this file.
- `get-library-docs-legacy-cloud.mjs` - Exports `getLibraryDocsLegacyCloud`, the main helper defined in this file.
- `get-tool-property-names.mjs` - Exports `getToolPropertyNames`, the main helper defined in this file.
- `handle-json-rpc-message.mjs` - Exports `handleJsonRpcMessage`, the main helper defined in this file.
- `handle-shutdown.mjs` - Exports `handleShutdown`, the main helper defined in this file.
- `handle-stdout-data.mjs` - Exports `handleStdoutData`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `inspect-value.mjs` - Exports `inspectValue`, the main helper defined in this file.
- `is-context7-server-healthy.mjs` - Exports `isContext7ServerHealthy`, the main helper defined in this file.
- `local-tool-arguments.mjs` - Re-export facade that assembles the public surface for this directory.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `next-request-id.mjs` - Exports `setNextRequestId`, the main helper defined in this file.
- `normalize-name.mjs` - Exports `normalizeName`, the main helper defined in this file.
- `normalize-value.mjs` - Exports `normalizeValue`, the main helper defined in this file.
- `normalized-topic.mjs` - Exports `normalizedTopic`, the main helper defined in this file.
- `pending-requests.mjs` - Exports `pendingRequests`, a shared constant or state value used by sibling modules.
- `pick-tool.mjs` - Exports `pickTool`, the main helper defined in this file.
- `push-candidate.mjs` - Exports `pushCandidate`, the main helper defined in this file.
- `read-schema.mjs` - Exports `readSchema`, the main helper defined in this file.
- `refresh-tool-registry.mjs` - Exports `refreshToolRegistry`, the main helper defined in this file.
- `reject-all-pending.mjs` - Exports `rejectAllPending`, the main helper defined in this file.
- `render-code-block.mjs` - Exports `renderCodeBlock`, the main helper defined in this file.
- `render-code-snippet.mjs` - Exports `renderCodeSnippet`, the main helper defined in this file.
- `request-timeout-ms.mjs` - Exports `REQUEST_TIMEOUT_MS`, a shared constant or state value used by sibling modules.
- `resolve-docs-locally.mjs` - Exports `resolveDocsLocally`, the main helper defined in this file.
- `resolve-library-id-cloud.mjs` - Exports `resolveLibraryIdCloud`, the main helper defined in this file.
- `resolve-library-id-local.mjs` - Exports `resolveLibraryIdLocal`, the main helper defined in this file.
- `runtime.mjs` - Executable runtime bootstrap for this directory.
- `score-candidate.mjs` - Exports `scoreCandidate`, the main helper defined in this file.
- `send-request.mjs` - Exports `sendRequest`, the main helper defined in this file.
- `server-process.mjs` - Exports `setServerProcess`, the main helper defined in this file.
- `server-ready.mjs` - Exports `setServerReady`, the main helper defined in this file.
- `start-context7-server.mjs` - Exports `startContext7Server`, the main helper defined in this file.
- `startup-timeout-ms.mjs` - Exports `STARTUP_TIMEOUT_MS`, a shared constant or state value used by sibling modules.
- `stdout-buffer.mjs` - Exports `setStdoutBuffer`, the main helper defined in this file.
- `stop-context7-server.mjs` - Exports `stopContext7Server`, the main helper defined in this file.
- `tool-registry.mjs` - Exports `setToolRegistry`, the main helper defined in this file.

## Subdirectories
- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 51 immediate file(s) and 0 child directories.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus
Check that the current implementation in this directory still matches its intended role in the harness architecture.

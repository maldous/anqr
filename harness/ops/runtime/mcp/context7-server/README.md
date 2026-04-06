# ANQR Context7 Server

## 1. Directory Overview

This directory implements **ANQR Context7 Server** within the ANQR harness. The immediate code includes a standalone runtime entry point alongside helper modules. The current inventory is 51 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **add-part.mjs** - Exports `addPart`, which implements add part.
- **build-docs-arguments.mjs** - Exports `buildDocsArguments`, which builds docs arguments.
- **build-resolve-arguments.mjs** - Exports `buildResolveArguments`, which builds resolve arguments.
- **call-local-tool.mjs** - Exports `callLocalTool`, which implements call local tool.
- **cloud-api-base.mjs** - Exports `CLOUD_API_BASE`, `LEGACY_CLOUD_API_BASE`, providing the reusable API for this directory concern.
- **collect-documentation.mjs** - Exports `collectDocumentation`, which collects documentation.
- **extract-documentation.mjs** - Exports `extractDocumentation`, which implements extract documentation.
- **extract-from-value.mjs** - Exports `extractFromValue`, which implements extract from value.
- **extract-ids-from-string.mjs** - Exports `extractIdsFromString`, which implements extract ids from string.
- **extract-library-id.mjs** - Exports `extractLibraryId`, which implements extract library id.
- **extract-tools-list.mjs** - Exports `extractToolsList`, which implements extract tools list.
- **fetch-cloud.mjs** - Exports `fetchCloud`, which fetches cloud.
- **format-cloud-context.mjs** - Exports `formatCloudContext`, which formats cloud context.
- **get-documentation-local.mjs** - Exports `getDocumentationLocal`, which gets documentation local.
- **get-library-docs-cloud.mjs** - Exports `getLibraryDocsCloud`, which gets library docs cloud.
- **get-library-docs-legacy-cloud.mjs** - Exports `getLibraryDocsLegacyCloud`, which gets library docs legacy cloud.
- **get-tool-property-names.mjs** - Exports `getToolPropertyNames`, which gets tool property names.
- **handle-json-rpc-message.mjs** - Exports `handleJsonRpcMessage`, which implements handle json rpc message.
- **handle-shutdown.mjs** - Exports `handleShutdown`, which implements handle shutdown.
- **handle-stdout-data.mjs** - Exports `handleStdoutData`, which implements handle stdout data.
- **index.mjs** - Facade module that re-exports public members from `./startup-timeout-ms.mjs`, `./request-timeout-ms.mjs`, `./cloud-api-base.mjs`, `./server-process.mjs`, `./server-ready.mjs`, `./next-request-id.mjs`, and 19 more siblings.
- **inspect-value.mjs** - Exports `inspectValue`, which implements inspect value.
- **is-context7-server-healthy.mjs** - Exports `isContext7ServerHealthy`, which checks whether context7 server healthy.
- **local-tool-arguments.mjs** - Facade module that re-exports public members from `./build-resolve-arguments.mjs`, `./build-docs-arguments.mjs`.
- **logger.mjs** - Shared logging helper module exporting `logDebug`, `logError`, `logInfo`, `logWarn`.
- **next-request-id.mjs** - Exports `nextRequestId`, `setNextRequestId`, providing the reusable API for this directory concern.
- **normalize-name.mjs** - Exports `normalizeName`, which normalizes name.
- **normalize-value.mjs** - Exports `normalizeValue`, which normalizes value.
- **normalized-topic.mjs** - Exports `normalizedTopic`, which implements normalized topic.
- **pending-requests.mjs** - Exports `pendingRequests`, which implements pending requests.
- **pick-tool.mjs** - Exports `pickTool`, which implements pick tool.
- **push-candidate.mjs** - Exports `pushCandidate`, which implements push candidate.
- **read-schema.mjs** - Exports `readSchema`, which reads schema.
- **refresh-tool-registry.mjs** - Exports `refreshToolRegistry`, which implements refresh tool registry.
- **reject-all-pending.mjs** - Exports `rejectAllPending`, which implements reject all pending.
- **render-code-block.mjs** - Exports `renderCodeBlock`, which implements render code block.
- **render-code-snippet.mjs** - Exports `renderCodeSnippet`, which implements render code snippet.
- **request-timeout-ms.mjs** - Exports `REQUEST_TIMEOUT_MS`, a shared constant used by sibling modules.
- **resolve-docs-locally.mjs** - Exports `resolveDocsLocally`, which resolves docs locally.
- **resolve-library-id-cloud.mjs** - Exports `resolveLibraryIdCloud`, which resolves library id cloud.
- **resolve-library-id-local.mjs** - Exports `resolveLibraryIdLocal`, which resolves library id local.
- **runtime.mjs** - Executable runtime entry point for this directory.
- **score-candidate.mjs** - Exports `scoreCandidate`, which implements score candidate.
- **send-request.mjs** - Exports `sendRequest`, which implements send request.
- **server-process.mjs** - Exports `serverProcess`, `setServerProcess`, providing the reusable API for this directory concern.
- **server-ready.mjs** - Exports `serverReady`, `setServerReady`, providing the reusable API for this directory concern.
- **start-context7-server.mjs** - Exports `startContext7Server`, which starts context7 server.
- **startup-timeout-ms.mjs** - Exports `STARTUP_TIMEOUT_MS`, a shared constant used by sibling modules.
- **stdout-buffer.mjs** - Exports `setStdoutBuffer`, `stdoutBuffer`, providing the reusable API for this directory concern.
- **stop-context7-server.mjs** - Exports `stopContext7Server`, which implements stop context7 server.
- **tool-registry.mjs** - Exports `setToolRegistry`, `toolRegistry`, providing the reusable API for this directory concern.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory include network/API integration, subprocess execution, and timer, scheduling, cooldown, or watchdog behavior. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```bash
node ops/runtime/mcp/context7-server/runtime.mjs
```

## 5. Dependencies

- **Node.js built-ins** - `node:child_process`
- **Internal relative modules** - `../../../lib/logger.mjs`, `./add-part.mjs`, `./build-docs-arguments.mjs`, `./build-resolve-arguments.mjs`, `./call-local-tool.mjs`, `./cloud-api-base.mjs`, `./collect-documentation.mjs`, `./extract-documentation.mjs`, `./extract-from-value.mjs`, `./extract-ids-from-string.mjs`, `./extract-library-id.mjs`, `./extract-tools-list.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.

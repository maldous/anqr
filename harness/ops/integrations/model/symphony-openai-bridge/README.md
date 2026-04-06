# ANQR Symphony OpenAI Bridge

## 1. Directory Overview

This directory contains the OpenAI bridge implementation for the ANQR (Agentic Number Query Runner)
Symphony orchestration system. It provides an abstraction layer that translates between the Symphony
provider-agnostic interface and OpenAI-compatible API endpoints, enabling OpenAI models to be used
within the multi-provider credit-gate routing system. It currently contains 185 files and 0
subdirectories.

## 2. File Summaries

### Files

- **active-requests.mjs** - Module that supports active requests. Exports `activeRequests`.
- **add-message-tool.mjs** - Module that supports add message tool. Exports `addMessageTool`.
- **add-subgoal-tool.mjs** - Module that supports add subgoal tool. Exports `addSubgoalTool`.
- **additional-tokens.mjs** - Module that supports additional tokens. Exports `additionalTokens`.
- **advertised-models.mjs** - Module that supports advertised models. Exports `ADVERTISED_MODELS`.
- **api-key.mjs** - Module that supports api key. Exports `API_KEY`.
- **apply-patch-tool.mjs** - Module that supports apply patch tool. Exports `applyPatchTool`.
- **ask-user-tool.mjs** - Module that supports ask user tool. Exports `askUserTool`.
- **bridge-metrics.mjs** - Module that supports bridge metrics. Exports `BRIDGE_METRICS`.
- **bridge-parent-root.mjs** - Module that supports bridge parent root. Exports `BRIDGE_PARENT_ROOT`.
- **bridge-provider-blocklist-reasons.mjs** - Module that supports bridge provider blocklist reasons. Exports `BRIDGE_PROVIDER_BLOCKLIST_REASONS`.
- **bridge-provider-blocklist.mjs** - Module that supports bridge provider blocklist. Exports `BRIDGE_PROVIDER_BLOCKLIST`.
- **bridge-root.mjs** - Module that supports bridge root. Exports `BRIDGE_ROOT`.
- **build-catalog-definitions.mjs** - Module that builds catalog definitions. Exports `buildCatalogDefinitions`.
- **build-openrouter-providers-from-catalog.mjs** - Module that builds openrouter providers from catalog. Exports `buildOpenrouterProvidersFromCatalog`.
- **build-provider-name-from-model-id.mjs** - Module that builds provider name from model id. Exports `buildProviderNameFromModelId`.
- **build-selection-options.mjs** - Module that builds selection options. Exports `buildSelectionOptions`.
- **calculate-timeout-ms.mjs** - Module that supports calculate timeout ms. Exports `calculateTimeoutMs`.
- **check-auth.mjs** - Module that checks auth. Exports `checkAuth`.
- **classify-tool-probe-error-outcome.mjs** - Module that supports classify tool probe error outcome. Exports `classifyToolProbeErrorOutcome`.
- **code-search-tool.mjs** - Module that supports code search tool. Exports `codeSearchTool`.
- **codex-sandbox-mode.mjs** - Module that supports codex sandbox mode. Exports `CODEX_SANDBOX_MODE`.
- **coerce-optional-number-input.mjs** - Module that supports coerce optional number input. Exports `coerceOptionalNumberInput`.
- **coerce-string-array-input.mjs** - Module that supports coerce string array input. Exports `coerceStringArrayInput`.
- **context7-http-base.mjs** - Module that supports context7 http base. Exports `CONTEXT7_HTTP_BASE`.
- **control-repo-root.mjs** - Module that supports control repo root. Exports `CONTROL_REPO_ROOT`.
- **convert-messages.mjs** - Module that supports convert messages. Exports `convertMessages`.
- **create-open-ai-compatible-model.mjs** - Module that creates or builds open ai compatible model. Exports `createOpenAiCompatibleModel`.
- **create-provider-model.mjs** - Module that creates or builds provider model. Exports `createProviderModel`.
- **current-branch-name.mjs** - Module that supports current branch name. Exports `currentBranchName`.
- **current-head-sha.mjs** - Module that supports current head sha. Exports `currentHeadSha`.
- **current-request-id.mjs** - Module that supports current request id. Exports `setCurrentRequestId, currentRequestId`.
- **detect-control-repo-root.mjs** - Module that supports detect control repo root. Exports `detectControlRepoRoot`.
- **ensure-string.mjs** - Module that ensures string. Exports `ensureString`.
- **error-to-string.mjs** - Module that supports error to string. Exports `errorToString`.
- **exec-tool.mjs** - Module that supports exec tool. Exports `execTool`.
- **extract-tool-probe-answer.mjs** - Module that supports extract tool probe answer. Exports `extractToolProbeAnswer`.
- **fallback-delay-ms.mjs** - Module that supports fallback delay ms. Exports `FALLBACK_DELAY_MS`.
- **fetch-provider-catalog-json.mjs** - Module that supports fetch provider catalog json. Exports `fetchProviderCatalogJson`.
- **finalize-worktree-request.mjs** - Module that supports finalize worktree request. Exports `finalizeWorktreeRequest`.
- **find-files-tool.mjs** - Module that supports find files tool. Exports `findFilesTool`.
- **format-elapsed.mjs** - Module that formats elapsed. Exports `formatElapsed`.
- **gateway-batch-delay-ms.mjs** - Module that supports gateway batch delay ms. Exports `GATEWAY_BATCH_DELAY_MS`.
- **gateway-batch-size.mjs** - Module that supports gateway batch size. Exports `GATEWAY_BATCH_SIZE`.
- **get-cached-context-window-by-provider-name.mjs** - Module that retrieves cached context window by provider name. Exports `getCachedContextWindowByProviderName`.
- **get-cached-openrouter-models.mjs** - Module that retrieves cached openrouter models. Exports `getCachedOpenrouterModels`.
- **get-current-request-cwd.mjs** - Module that retrieves current request cwd. Exports `getCurrentRequestCwd`.
- **get-current-request-id.mjs** - Module that retrieves current request id. Exports `getCurrentRequestId`.
- **get-provider-gateway.mjs** - Module that retrieves provider gateway. Exports `getProviderGateway`.
- **glob-tool.mjs** - Module that supports glob tool. Exports `globTool`.
- **has-tracked-changes.mjs** - Module that supports has tracked changes. Exports `hasTrackedChanges`.
- **index.mjs** - Main module exporting the public API including `createChatCompletion`, `createChatCompletionStream`, `listModels`, and configuration constants. Provides the primary interface for making OpenAI API calls.
- **invoke-codebuff-direct-stream-to-sse.mjs** - Module that supports invoke codebuff direct stream to sse. Exports `invokeCodebuffDirectStreamToSSE`.
- **invoke-with-ai.mjs** - Module that supports invoke with ai. Exports `invokeWithAI`.
- **invoke-with-aiinner.mjs** - Module that supports invoke with aiinner. Exports `invokeWithAIInner`.
- **invoke-with-codex.mjs** - Module that supports invoke with codex. Exports `invokeWithCodex`.
- **invoke-with-fallback-stream.mjs** - Module that supports invoke with fallback stream. Exports `invokeWithFallbackStream`.
- **invoke-with-fallback.mjs** - Module that supports invoke with fallback. Exports `invokeWithFallback`.
- **is-openrouter-text-tool-model.mjs** - Module that supports is openrouter text tool model. Exports `isOpenrouterTextToolModel`.
- **is-path-within-root.mjs** - Module that supports is path within root. Exports `isPathWithinRoot`.
- **is-probably-binary-content.mjs** - Module that supports is probably binary content. Exports `isProbablyBinaryContent`.
- **is-probe-running.mjs** - Module that supports is probe running. Exports `setIsProbeRunning, isProbeRunning`.
- **is-retryable-error-deep.mjs** - Module that supports is retryable error deep. Exports `isRetryableErrorDeep`.
- **is-retryable-error.mjs** - Module that supports is retryable error. Exports `isRetryableError`.
- **is-voice-noise.mjs** - Module that supports is voice noise. Exports `isVoiceNoise`.
- **is-worktree-bridge.mjs** - Module that supports is worktree bridge. Exports `IS_WORKTREE_BRIDGE`.
- **known-tool-capable.mjs** - Module that supports known tool capable. Exports `KNOWN_TOOL_CAPABLE`.
- **known-tool-names.mjs** - Module that supports known tool names. Exports `knownToolNames`.
- **last-probe-start-time.mjs** - Module that supports last probe start time. Exports `setLastProbeStartTime, lastProbeStartTime`.
- **last-probe-time-check.mjs** - Module that supports last probe time check. Exports `setLastProbeTimeCheck, lastProbeTimeCheck`.
- **list-directory-tool.mjs** - Module that lists directory tool. Exports `listDirectoryTool`.
- **list-dirty-files.mjs** - Module that lists dirty files. Exports `listDirtyFiles`.
- **load-probe-cache.mjs** - Module that loads probe cache. Exports `loadProbeCache`.
- **load-provider-catalog-cache.mjs** - Module that loads provider catalog cache. Exports `loadProviderCatalogCache`.
- **log-bridge-stats.mjs** - Module that supports log bridge stats. Exports `logBridgeStats`.
- **log-memory.mjs** - Module that supports log memory. Exports `logMemory`.
- **logger.mjs** - Module that provides logging helpers for. Exports `logDebug, logInfo, logWarn, logError`.
- **lookup-agent-info-tool.mjs** - Module that supports lookup agent info tool. Exports `lookupAgentInfoTool`.
- **max-concurrent-requests.mjs** - Module that supports max concurrent requests. Exports `MAX_CONCURRENT_REQUESTS`.
- **max-response-text-bytes.mjs** - Module that supports max response text bytes. Exports `MAX_RESPONSE_TEXT_BYTES`.
- **max-tool-iterations.mjs** - Module that supports max tool iterations. Exports `MAX_TOOL_ITERATIONS`.
- **maybe-gc.mjs** - Module that supports maybe gc. Exports `maybeGC`.
- **memory-get-tool.mjs** - Module that supports memory get tool. Exports `memoryGetTool`.
- **memory-search-tool.mjs** - Module that supports memory search tool. Exports `memorySearchTool`.
- **model-id.mjs** - Module that supports model id. Exports `MODEL_ID`.
- **non-tool-capable-providers.mjs** - Module that supports non tool capable providers. Exports `nonToolCapableProviders`.
- **normalize-generic-provider-catalog.mjs** - Module that normalizes generic provider catalog. Exports `normalizeGenericProviderCatalog`.
- **normalize-model-id.mjs** - Module that normalizes model id. Exports `normalizeModelId`.
- **normalize-openrouter-catalog.mjs** - Module that normalizes openrouter catalog. Exports `normalizeOpenrouterCatalog`.
- **normalize-request-cwd.mjs** - Module that normalizes request cwd. Exports `normalizeRequestCwd`.
- **openclaw-gateway-host.mjs** - Module that supports openclaw gateway host. Exports `OPENCLAW_GATEWAY_HOST`.
- **openclaw-gateway-port.mjs** - Module that supports openclaw gateway port. Exports `OPENCLAW_GATEWAY_PORT`.
- **openclaw-gateway-token.mjs** - Module that supports openclaw gateway token. Exports `OPENCLAW_GATEWAY_TOKEN`.
- **openrouter-provider-name-set.mjs** - Module that supports openrouter provider name set. Exports `OPENROUTER_PROVIDER_NAME_SET`.
- **openrouter-provider-names.mjs** - Module that supports openrouter provider names. Exports `OPENROUTER_PROVIDER_NAMES`.
- **parse-body.mjs** - Module that parses body. Exports `parseBody`.
- **port.mjs** - Module that supports port. Exports `PORT`.
- **probe-all-tool-capability.mjs** - Module that supports probe all tool capability. Exports `probeAllToolCapability`.
- **probe-cache-file.mjs** - Module that supports probe cache file. Exports `PROBE_CACHE_FILE`.
- **probe-cache-ttl-ms.mjs** - Module that supports probe cache ttl ms. Exports `PROBE_CACHE_TTL_MS`.
- **probe-completion-count.mjs** - Module that supports probe completion count. Exports `setProbeCompletionCount, probeCompletionCount`.
- **probe-completions-before-ranking.mjs** - Module that supports probe completions before ranking. Exports `PROBE_COMPLETIONS_BEFORE_RANKING`.
- **probe-cycle-interval-ms.mjs** - Module that supports probe cycle interval ms. Exports `PROBE_CYCLE_INTERVAL_MS`.
- **probe-cycle-turn-threshold.mjs** - Module that supports probe cycle turn threshold. Exports `PROBE_CYCLE_TURN_THRESHOLD`.
- **probe-gateway-batched.mjs** - Module that supports probe gateway batched. Exports `probeGatewayBatched`.
- **probe-mistral-tool-capability-via-http.mjs** - Module that supports probe mistral tool capability via http. Exports `probeMistralToolCapabilityViaHttp`.
- **probe-tool-capability-for-provider.mjs** - Module that supports probe tool capability for provider. Exports `probeToolCapabilityForProvider`.
- **probe-turn-counter.mjs** - Module that supports probe turn counter. Exports `setProbeTurnCounter, probeTurnCounter`.
- **propose-str-replace-tool.mjs** - Module that supports propose str replace tool. Exports `proposeStrReplaceTool`.
- **propose-write-file-tool.mjs** - Module that supports propose write file tool. Exports `proposeWriteFileTool`.
- **provider-catalog-cache-file.mjs** - Module that supports provider catalog cache file. Exports `PROVIDER_CATALOG_CACHE_FILE`.
- **provider-status-cache.mjs** - Module that supports provider status cache. Exports `providerStatusCache`.
- **provider-supports-tools.mjs** - Module that supports provider supports tools. Exports `providerSupportsTools`.
- **provider-tool-support-hint.mjs** - Module that supports provider tool support hint. Exports `providerToolSupportHint`.
- **raw-tool-json-re.mjs** - Module that supports raw tool json re. Exports `RAW_TOOL_JSON_RE`.
- **read-docs-tool.mjs** - Module that reads docs tool. Exports `readDocsTool`.
- **read-file-tool.mjs** - Module that reads file tool. Exports `readFileTool`.
- **read-files-tool.mjs** - Module that reads files tool. Exports `readFilesTool`.
- **read-generic-provider-tool-support.mjs** - Module that reads generic provider tool support. Exports `readGenericProviderToolSupport`.
- **read-subtree-tool.mjs** - Module that reads subtree tool. Exports `readSubtreeTool`.
- **record-bridge-metrics.mjs** - Module that records bridge metrics. Exports `recordBridgeMetrics`.
- **record-successful-metrics.mjs** - Module that records successful metrics. Exports `recordSuccessfulMetrics`.
- **refresh-live-provider-catalogs.mjs** - Module that supports refresh live provider catalogs. Exports `refreshLiveProviderCatalogs`.
- **refresh-provider-status.mjs** - Module that supports refresh provider status. Exports `refreshProviderStatus`.
- **remap-repo-path-to-bridge-root.mjs** - Module that supports remap repo path to bridge root. Exports `remapRepoPathToBridgeRoot`.
- **request-count.mjs** - Module that supports request count. Exports `setRequestCount, requestCount`.
- **request-cwd-storage.mjs** - Module that supports request cwd storage. Exports `requestCwdStorage`.
- **request-id-counter.mjs** - Module that supports request id counter. Exports `setRequestIdCounter, requestIdCounter`.
- **request-timeout-ms.mjs** - Module that supports request timeout ms. Exports `REQUEST_TIMEOUT_MS`.
- **resolve-request-dir.mjs** - Module that resolves request dir. Exports `resolveRequestDir`.
- **resolve-request-path.mjs** - Module that resolves request path. Exports `resolveRequestPath`.
- **resolve-route.mjs** - Module that resolves route. Exports `resolveRoute`.
- **run-continuous-provider-probe.mjs** - Module that runs continuous provider probe. Exports `runContinuousProviderProbe`.
- **run-file-change-hooks-tool.mjs** - Module that runs file change hooks tool. Exports `runFileChangeHooksTool`.
- **runtime.mjs** - Runtime carry-forward that imports and executes the main index module. Provides a CLI entry point for direct execution when needed.
- **safe-log-debug.mjs** - Module that supports safe log debug. Exports `safeLogDebug`.
- **sanitize-for-discord-preview.mjs** - Module that supports sanitize for discord preview. Exports `sanitizeForDiscordPreview`.
- **sanitize-text-for-speech.mjs** - Module that supports sanitize text for speech. Exports `sanitizeTextForSpeech`.
- **save-probe-cache.mjs** - Module that saves probe cache. Exports `saveProbeCache`.
- **save-provider-catalog-cache.mjs** - Module that saves provider catalog cache. Exports `saveProviderCatalogCache`.
- **search-linear-issues-tool.mjs** - Module that supports search linear issues tool. Exports `searchLinearIssuesTool`.
- **send-json.mjs** - Module that sends json. Exports `sendJson`.
- **server.mjs** - Module that supports server. Exports `server`.
- **set-current-request-id.mjs** - Module that sets or updates current request id. Exports `setCurrentRequestId`.
- **set-messages-tool.mjs** - Module that sets or updates messages tool. Exports `setMessagesTool`.
- **set-output-tool.mjs** - Module that sets or updates output tool. Exports `setOutputTool`.
- **setup-process-handlers.mjs** - Module that supports setup process handlers. Exports `setupProcessHandlers`.
- **shutdown.mjs** - Module that shuts down. Exports `shutdown`.
- **skill-tool.mjs** - Module that supports skill tool. Exports `skillTool`.
- **sleep.mjs** - Module that supports sleep. Exports `sleep`.
- **spawn-agents-tool.mjs** - Module that supports spawn agents tool. Exports `spawnAgentsTool`.
- **speech-emoji-re.mjs** - Module that supports speech emoji re. Exports `SPEECH_EMOJI_RE`.
- **startup-banner.mjs** - Module that supports startup banner. Exports `logStartupBanner`.
- **startup-context7-verify.mjs** - Module that supports startup context7 verify. Exports `verifyContext7Health`.
- **startup-discord-notify.mjs** - Module that supports startup discord notify. Exports `sendStartupDiscordNotification`.
- **startup-probe-init.mjs** - Module that supports startup probe init. Exports `initializeProbes`.
- **startup-retrieval-warmup.mjs** - Module that supports startup retrieval warmup. Exports `runRetrievalWarmup`.
- **startup-self-test.mjs** - Module that supports startup self test. Exports `runStartupSelfTests`.
- **stats-log-interval.mjs** - Module that supports stats log interval. Exports `STATS_LOG_INTERVAL`.
- **str-replace-tool.mjs** - Module that supports str replace tool. Exports `strReplaceTool`.
- **suggest-followups-tool.mjs** - Module that supports suggest followups tool. Exports `suggestFollowupsTool`.
- **task-completed-tool.mjs** - Module that supports task completed tool. Exports `taskCompletedTool`.
- **think-deeply-tool.mjs** - Module that supports think deeply tool. Exports `thinkDeeplyTool`.
- **to-provider-metrics-usage.mjs** - Module that supports to provider metrics usage. Exports `toProviderMetricsUsage`.
- **tool-capable-providers.mjs** - Module that supports tool capable providers. Exports `toolCapableProviders`.
- **tool-probe-retry-delay-ms.mjs** - Module that supports tool probe retry delay ms. Exports `TOOL_PROBE_RETRY_DELAY_MS`.
- **tool-probe-retry-scheduled.mjs** - Module that supports tool probe retry scheduled. Exports `setToolProbeRetryScheduled, toolProbeRetryScheduled`.
- **tool-probe-timeout-ms.mjs** - Module that supports tool probe timeout ms. Exports `TOOL_PROBE_TIMEOUT_MS`.
- **tools-proxy.mjs** - Module that supports tools proxy. Exports `toolsProxy`.
- **tools.mjs** - Module that supports tools. Exports `tools`.
- **track-file-change.mjs** - Module that supports track file change. Exports `trackFileChange`.
- **unauthorized.mjs** - Module that supports unauthorized. Exports `unauthorized`.
- **unwrap-aierror.mjs** - Module that supports unwrap aierror. Exports `unwrapAIError`.
- **update-subgoal-tool.mjs** - Module that supports update subgoal tool. Exports `updateSubgoalTool`.
- **valid-tokens.mjs** - Module that supports valid tokens. Exports `VALID_TOKENS`.
- **verify-worktree-freshness-non-blocking.mjs** - Module that verifies worktree freshness non blocking. Exports `verifyWorktreeFreshnessNonBlocking`.
- **voice-announce.mjs** - Module that supports voice announce. Exports `voiceAnnounce`.
- **voice-speak-tool.mjs** - Module that supports voice speak tool. Exports `voiceSpeakTool`.
- **voice-system-prompt.mjs** - Module that supports voice system prompt. Exports `VOICE_SYSTEM_PROMPT`.
- **voice-transcript-re.mjs** - Module that supports voice transcript re. Exports `VOICE_TRANSCRIPT_RE`.
- **web-search-tool.mjs** - Module that supports web search tool. Exports `webSearchTool`.
- **with-request-cwd.mjs** - Module that supports with request cwd. Exports `withRequestCwd`.
- **worktree-checkout-pattern.mjs** - Module that supports worktree checkout pattern. Exports `WORKTREE_CHECKOUT_PATTERN`.
- **write-file-tool.mjs** - Module that writes file tool. Exports `writeFileTool`.
- **write-todos-tool.mjs** - Module that writes todos tool. Exports `writeTodosTool`.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `runtime.mjs` provides a direct execution
path. The README content below is aligned to the current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/integrations/model/symphony-openai-bridge/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.

# ANQR Symphony OpenAI Bridge

## 1. Directory Overview

This directory implements **ANQR Symphony OpenAI Bridge** within the ANQR harness. The immediate code includes a standalone runtime entry point alongside helper modules. Worktree executors now expose targeted Linear execution through the bridge HTTP surface, replacing the old spawned runner trigger path. The current inventory is 185 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **active-requests.mjs** - Exports `activeRequests`, which implements active requests.
- **add-message-tool.mjs** - Exports `addMessageTool`, which implements add message tool.
- **add-subgoal-tool.mjs** - Exports `addSubgoalTool`, which implements add subgoal tool.
- **additional-tokens.mjs** - Exports `additionalTokens`, which implements additional tokens.
- **advertised-models.mjs** - Exports `ADVERTISED_MODELS`, a shared constant used by sibling modules.
- **api-key.mjs** - Exports `API_KEY`, a shared constant used by sibling modules.
- **apply-patch-tool.mjs** - Exports `applyPatchTool`, which applies patch tool.
- **ask-user-tool.mjs** - Exports `askUserTool`, which implements ask user tool.
- **bridge-metrics.mjs** - Exports `BRIDGE_METRICS`, a shared constant used by sibling modules.
- **bridge-parent-root.mjs** - Exports `BRIDGE_PARENT_ROOT`, a shared constant used by sibling modules.
- **bridge-provider-blocklist-reasons.mjs** - Exports `BRIDGE_PROVIDER_BLOCKLIST_REASONS`, a shared constant used by sibling modules.
- **bridge-provider-blocklist.mjs** - Exports `BRIDGE_PROVIDER_BLOCKLIST`, a shared `Set` constant used by this module group.
- **bridge-root.mjs** - Exports `BRIDGE_ROOT`, a shared constant used by sibling modules.
- **build-catalog-definitions.mjs** - Exports `buildCatalogDefinitions`, which builds catalog definitions.
- **build-openrouter-providers-from-catalog.mjs** - Exports `buildOpenrouterProvidersFromCatalog`, which builds openrouter providers from catalog.
- **build-provider-name-from-model-id.mjs** - Exports `buildProviderNameFromModelId`, which builds provider name from model id.
- **build-selection-options.mjs** - Exports `buildSelectionOptions`, which builds selection options.
- **calculate-timeout-ms.mjs** - Exports `calculateTimeoutMs`, which calculates timeout ms.
- **check-auth.mjs** - Exports `checkAuth`, which checks auth.
- **classify-tool-probe-error-outcome.mjs** - Exports `classifyToolProbeErrorOutcome`, which implements classify tool probe error outcome.
- **code-search-tool.mjs** - Exports `codeSearchTool`, which implements code search tool.
- **codex-sandbox-mode.mjs** - Exports `CODEX_SANDBOX_MODE`, a shared constant used by sibling modules.
- **coerce-optional-number-input.mjs** - Exports `coerceOptionalNumberInput`, which implements coerce optional number input.
- **coerce-string-array-input.mjs** - Exports `coerceStringArrayInput`, which implements coerce string array input.
- **context7-http-base.mjs** - Exports `CONTEXT7_HTTP_BASE`, a shared constant used by sibling modules.
- **control-repo-root.mjs** - Exports `CONTROL_REPO_ROOT`, a shared constant used by sibling modules.
- **convert-messages.mjs** - Exports `convertMessages`, which implements convert messages.
- **create-open-ai-compatible-model.mjs** - Exports `createOpenAiCompatibleModel`, which creates open ai compatible model.
- **create-provider-model.mjs** - Exports `createProviderModel`, which creates provider model.
- **current-branch-name.mjs** - Exports `currentBranchName`, which implements current branch name.
- **current-head-sha.mjs** - Exports `currentHeadSha`, which implements current head sha.
- **current-request-id.mjs** - Exports `currentRequestId`, `setCurrentRequestId`, providing the reusable API for this directory concern.
- **detect-control-repo-root.mjs** - Exports `detectControlRepoRoot`, which detects control repo root.
- **ensure-string.mjs** - Exports `ensureString`, which ensures string.
- **error-to-string.mjs** - Exports `errorToString`, which implements error to string.
- **execute-linear-issue-request.mjs** - Exports `executeLinearIssueRequest`, which executes a targeted Linear issue within the current worktree executor.
- **exec-tool.mjs** - Exports `execTool`, which implements exec tool.
- **extract-tool-probe-answer.mjs** - Exports `extractToolProbeAnswer`, which implements extract tool probe answer.
- **fallback-delay-ms.mjs** - Exports `FALLBACK_DELAY_MS`, a shared constant used by sibling modules.
- **fetch-provider-catalog-json.mjs** - Exports `fetchProviderCatalogJson`, which fetches provider catalog json.
- **finalize-worktree-request.mjs** - Exports `finalizeWorktreeRequest`, which implements finalize worktree request.
- **find-files-tool.mjs** - Exports `findFilesTool`, which finds files tool.
- **format-elapsed.mjs** - Exports `formatElapsed`, which formats elapsed.
- **gateway-batch-delay-ms.mjs** - Exports `GATEWAY_BATCH_DELAY_MS`, a shared constant used by sibling modules.
- **gateway-batch-size.mjs** - Exports `GATEWAY_BATCH_SIZE`, a shared constant used by sibling modules.
- **get-cached-context-window-by-provider-name.mjs** - Exports `getCachedContextWindowByProviderName`, which gets cached context window by provider name.
- **get-cached-openrouter-models.mjs** - Exports `getCachedOpenrouterModels`, which gets cached openrouter models.
- **get-current-request-cwd.mjs** - Exports `getCurrentRequestCwd`, which gets current request cwd.
- **get-current-request-id.mjs** - Exports `getCurrentRequestId`, which gets current request id.
- **get-provider-gateway.mjs** - Exports `getProviderGateway`, which gets provider gateway.
- **glob-tool.mjs** - Exports `globTool`, which implements glob tool.
- **has-tracked-changes.mjs** - Exports `hasTrackedChanges`, which checks for tracked changes.
- **index.mjs** - Facade module that re-exports public members from `./codex-sandbox-mode.mjs`, `./context7-http-base.mjs`, `./openclaw-gateway-host.mjs`, `./openclaw-gateway-port.mjs`, `./openclaw-gateway-token.mjs`, `./format-elapsed.mjs`, and 151 more siblings.
- **invoke-codebuff-direct-stream-to-sse.mjs** - Exports `invokeCodebuffDirectStreamToSSE`, which implements invoke codebuff direct stream to sse.
- **invoke-with-ai.mjs** - Exports `invokeWithAI`, which implements invoke with ai.
- **invoke-with-aiinner.mjs** - Exports `invokeWithAIInner`, which implements invoke with aiinner.
- **invoke-with-codex.mjs** - Exports `invokeWithCodex`, which implements invoke with codex.
- **invoke-with-fallback-stream.mjs** - Exports `invokeWithFallbackStream`, which implements invoke with fallback stream.
- **invoke-with-fallback.mjs** - Exports `invokeWithFallback`, which implements invoke with fallback.
- **is-openrouter-text-tool-model.mjs** - Exports `isOpenrouterTextToolModel`, which checks whether openrouter text tool model.
- **is-path-within-root.mjs** - Exports `isPathWithinRoot`, which checks whether path within root.
- **is-probably-binary-content.mjs** - Exports `isProbablyBinaryContent`, which checks whether probably binary content.
- **is-probe-running.mjs** - Exports `isProbeRunning`, `setIsProbeRunning`, providing the reusable API for this directory concern.
- **is-retryable-error-deep.mjs** - Exports `isRetryableErrorDeep`, which checks whether retryable error deep.
- **is-retryable-error.mjs** - Exports `isRetryableError`, which checks whether retryable error.
- **is-voice-noise.mjs** - Exports `isVoiceNoise`, which checks whether voice noise.
- **is-worktree-bridge.mjs** - Exports `IS_WORKTREE_BRIDGE`, a shared constant used by sibling modules.
- **known-tool-capable.mjs** - Exports `KNOWN_TOOL_CAPABLE`, a shared `Set` constant used by this module group.
- **known-tool-names.mjs** - Exports `knownToolNames`, a shared `Set` constant used by this module group.
- **last-probe-start-time.mjs** - Exports `lastProbeStartTime`, `setLastProbeStartTime`, providing the reusable API for this directory concern.
- **last-probe-time-check.mjs** - Exports `lastProbeTimeCheck`, `setLastProbeTimeCheck`, providing the reusable API for this directory concern.
- **list-directory-tool.mjs** - Exports `listDirectoryTool`, which lists directory tool.
- **list-dirty-files.mjs** - Exports `listDirtyFiles`, which lists dirty files.
- **load-probe-cache.mjs** - Exports `loadProbeCache`, which loads probe cache.
- **load-provider-catalog-cache.mjs** - Exports `loadProviderCatalogCache`, which loads provider catalog cache.
- **log-bridge-stats.mjs** - Exports `logBridgeStats`, which implements log bridge stats.
- **log-memory.mjs** - Exports `logMemory`, which implements log memory.
- **logger.mjs** - Shared logging helper module exporting `logDebug`, `logError`, `logInfo`, `logWarn`.
- **lookup-agent-info-tool.mjs** - Exports `lookupAgentInfoTool`, which implements lookup agent info tool.
- **max-concurrent-requests.mjs** - Exports `MAX_CONCURRENT_REQUESTS`, a shared constant used by sibling modules.
- **max-response-text-bytes.mjs** - Exports `MAX_RESPONSE_TEXT_BYTES`, a shared constant used by sibling modules.
- **max-tool-iterations.mjs** - Exports `MAX_TOOL_ITERATIONS`, a shared constant used by sibling modules.
- **maybe-gc.mjs** - Exports `maybeGC`, which implements maybe gc.
- **memory-get-tool.mjs** - Exports `memoryGetTool`, which implements memory get tool.
- **memory-search-tool.mjs** - Exports `memorySearchTool`, which implements memory search tool.
- **model-id.mjs** - Exports `MODEL_ID`, a shared constant used by sibling modules.
- **non-tool-capable-providers.mjs** - Exports `nonToolCapableProviders`, a shared `Set` constant used by this module group.
- **normalize-generic-provider-catalog.mjs** - Exports `normalizeGenericProviderCatalog`, which normalizes generic provider catalog.
- **normalize-model-id.mjs** - Exports `normalizeModelId`, which normalizes model id.
- **normalize-openrouter-catalog.mjs** - Exports `normalizeOpenrouterCatalog`, which normalizes openrouter catalog.
- **normalize-request-cwd.mjs** - Exports `normalizeRequestCwd`, which normalizes request cwd.
- **openclaw-gateway-host.mjs** - Exports `OPENCLAW_GATEWAY_HOST`, a shared constant used by sibling modules.
- **openclaw-gateway-port.mjs** - Exports `OPENCLAW_GATEWAY_PORT`, a shared constant used by sibling modules.
- **openclaw-gateway-token.mjs** - Exports `OPENCLAW_GATEWAY_TOKEN`, a shared constant used by sibling modules.
- **openrouter-provider-name-set.mjs** - Exports `OPENROUTER_PROVIDER_NAME_SET`, a shared `Set` constant used by this module group.
- **openrouter-provider-names.mjs** - Exports `OPENROUTER_PROVIDER_NAMES`, a shared constant used by sibling modules.
- **parse-body.mjs** - Exports `parseBody`, which parses body.
- **port.mjs** - Exports `PORT`, a shared constant used by sibling modules.
- **probe-all-tool-capability.mjs** - Exports `probeAllToolCapability`, which implements probe all tool capability.
- **probe-cache-file.mjs** - Exports `PROBE_CACHE_FILE`, a shared constant used by sibling modules.
- **probe-cache-ttl-ms.mjs** - Exports `PROBE_CACHE_TTL_MS`, a shared constant used by sibling modules.
- **probe-completion-count.mjs** - Exports `probeCompletionCount`, `setProbeCompletionCount`, providing the reusable API for this directory concern.
- **probe-completions-before-ranking.mjs** - Exports `PROBE_COMPLETIONS_BEFORE_RANKING`, a shared constant used by sibling modules.
- **probe-cycle-interval-ms.mjs** - Exports `PROBE_CYCLE_INTERVAL_MS`, a shared constant used by sibling modules.
- **probe-cycle-turn-threshold.mjs** - Exports `PROBE_CYCLE_TURN_THRESHOLD`, a shared constant used by sibling modules.
- **probe-gateway-batched.mjs** - Exports `probeGatewayBatched`, which implements probe gateway batched.
- **probe-mistral-tool-capability-via-http.mjs** - Exports `probeMistralToolCapabilityViaHttp`, which implements probe mistral tool capability via http.
- **probe-tool-capability-for-provider.mjs** - Exports `probeToolCapabilityForProvider`, which implements probe tool capability for provider.
- **probe-turn-counter.mjs** - Exports `probeTurnCounter`, `setProbeTurnCounter`, providing the reusable API for this directory concern.
- **propose-str-replace-tool.mjs** - Exports `proposeStrReplaceTool`, which implements propose str replace tool.
- **propose-write-file-tool.mjs** - Exports `proposeWriteFileTool`, which implements propose write file tool.
- **provider-catalog-cache-file.mjs** - Exports `PROVIDER_CATALOG_CACHE_FILE`, a shared constant used by sibling modules.
- **provider-status-cache.mjs** - Exports `providerStatusCache`, which implements provider status cache.
- **provider-supports-tools.mjs** - Exports `providerSupportsTools`, which implements provider supports tools.
- **provider-tool-support-hint.mjs** - Exports `providerToolSupportHint`, which implements provider tool support hint.
- **raw-tool-json-re.mjs** - Exports `RAW_TOOL_JSON_RE`, a regular-expression constant used for validation.
- **read-docs-tool.mjs** - Exports `readDocsTool`, which reads docs tool.
- **read-file-tool.mjs** - Exports `readFileTool`, which reads file tool.
- **read-files-tool.mjs** - Exports `readFilesTool`, which reads files tool.
- **read-generic-provider-tool-support.mjs** - Exports `readGenericProviderToolSupport`, which reads generic provider tool support.
- **read-subtree-tool.mjs** - Exports `readSubtreeTool`, which reads subtree tool.
- **record-bridge-metrics.mjs** - Exports `recordBridgeMetrics`, which implements record bridge metrics.
- **record-successful-metrics.mjs** - Exports `recordSuccessfulMetrics`, which implements record successful metrics.
- **refresh-live-provider-catalogs.mjs** - Exports `refreshLiveProviderCatalogs`, which implements refresh live provider catalogs.
- **refresh-provider-status.mjs** - Exports `refreshProviderStatus`, which implements refresh provider status.
- **remap-repo-path-to-bridge-root.mjs** - Exports `remapRepoPathToBridgeRoot`, which implements remap repo path to bridge root.
- **request-count.mjs** - Exports `requestCount`, `setRequestCount`, providing the reusable API for this directory concern.
- **request-cwd-storage.mjs** - Exports `requestCwdStorage`, which implements request cwd storage.
- **request-id-counter.mjs** - Exports `requestIdCounter`, `setRequestIdCounter`, providing the reusable API for this directory concern.
- **request-timeout-ms.mjs** - Exports `REQUEST_TIMEOUT_MS`, a shared constant used by sibling modules.
- **resolve-request-dir.mjs** - Exports `resolveRequestDir`, which resolves request dir.
- **resolve-request-path.mjs** - Exports `resolveRequestPath`, which resolves request path.
- **resolve-route.mjs** - Exports `resolveRoute`, which resolves route.
- **run-continuous-provider-probe.mjs** - Exports `runContinuousProviderProbe`, which runs continuous provider probe.
- **run-file-change-hooks-tool.mjs** - Exports `runFileChangeHooksTool`, which runs file change hooks tool.
- **runtime.mjs** - Executable runtime entry point for this directory.
- **safe-log-debug.mjs** - Exports `safeLogDebug`, which implements safe log debug.
- **sanitize-for-discord-preview.mjs** - Exports `sanitizeForDiscordPreview`, which implements sanitize for discord preview.
- **sanitize-text-for-speech.mjs** - Exports `sanitizeTextForSpeech`, which implements sanitize text for speech.
- **save-probe-cache.mjs** - Exports `saveProbeCache`, which implements save probe cache.
- **save-provider-catalog-cache.mjs** - Exports `saveProviderCatalogCache`, which implements save provider catalog cache.
- **search-linear-issues-tool.mjs** - Exports `searchLinearIssuesTool`, which implements search linear issues tool.
- **send-json.mjs** - Exports `sendJson`, which implements send json.
- **server.mjs** - Exports `server`, which implements server.
- **set-current-request-id.mjs** - Facade module that re-exports public members from `./current-request-id.mjs`.
- **set-messages-tool.mjs** - Exports `setMessagesTool`, which implements set messages tool.
- **set-output-tool.mjs** - Exports `setOutputTool`, which implements set output tool.
- **setup-process-handlers.mjs** - Exports `setupProcessHandlers`, which sets up process handlers.
- **shutdown.mjs** - Exports `shutdown`, which implements shutdown.
- **skill-tool.mjs** - Exports `skillTool`, which implements skill tool.
- **sleep.mjs** - Exports `sleep`, which implements sleep.
- **spawn-agents-tool.mjs** - Exports `spawnAgentsTool`, which implements spawn agents tool.
- **speech-emoji-re.mjs** - Exports `SPEECH_EMOJI_RE`, a regular-expression constant used for validation.
- **startup-banner.mjs** - Exports `logStartupBanner`, which implements log startup banner.
- **startup-context7-verify.mjs** - Exports `verifyContext7Health`, which verifies context7 health.
- **startup-discord-notify.mjs** - Exports `sendStartupDiscordNotification`, which implements send startup discord notification.
- **startup-probe-init.mjs** - Exports `initializeProbes`, which implements initialize probes.
- **startup-retrieval-warmup.mjs** - Exports `runRetrievalWarmup`, which runs retrieval warmup.
- **startup-self-test.mjs** - Exports `runStartupSelfTests`, which runs startup self tests.
- **stats-log-interval.mjs** - Exports `STATS_LOG_INTERVAL`, a shared constant used by sibling modules.
- **str-replace-tool.mjs** - Exports `strReplaceTool`, which implements str replace tool.
- **suggest-followups-tool.mjs** - Exports `suggestFollowupsTool`, which implements suggest followups tool.
- **task-completed-tool.mjs** - Exports `taskCompletedTool`, which implements task completed tool.
- **think-deeply-tool.mjs** - Exports `thinkDeeplyTool`, which implements think deeply tool.
- **to-provider-metrics-usage.mjs** - Exports `toProviderMetricsUsage`, which implements to provider metrics usage.
- **tool-capable-providers.mjs** - Exports `toolCapableProviders`, a shared `Set` constant used by this module group.
- **tool-probe-retry-delay-ms.mjs** - Exports `TOOL_PROBE_RETRY_DELAY_MS`, a shared constant used by sibling modules.
- **tool-probe-retry-scheduled.mjs** - Exports `setToolProbeRetryScheduled`, `toolProbeRetryScheduled`, providing the reusable API for this directory concern.
- **tool-probe-timeout-ms.mjs** - Exports `TOOL_PROBE_TIMEOUT_MS`, a shared constant used by sibling modules.
- **tools-proxy.mjs** - Exports `toolsProxy`, which implements tools proxy.
- **tools.mjs** - Exports `tools`, which implements tools.
- **track-file-change.mjs** - Exports `trackFileChange`, which implements track file change.
- **unauthorized.mjs** - Exports `unauthorized`, which implements unauthorized.
- **unwrap-aierror.mjs** - Exports `unwrapAIError`, which implements unwrap aierror.
- **update-subgoal-tool.mjs** - Exports `updateSubgoalTool`, which implements update subgoal tool.
- **valid-tokens.mjs** - Exports `VALID_TOKENS`, a shared `Set` constant used by this module group.
- **verify-worktree-freshness-non-blocking.mjs** - Exports `verifyWorktreeFreshnessNonBlocking`, which verifies worktree freshness non blocking.
- **voice-announce.mjs** - Exports `voiceAnnounce`, which implements voice announce.
- **voice-speak-tool.mjs** - Exports `voiceSpeakTool`, which implements voice speak tool.
- **voice-system-prompt.mjs** - Exports `VOICE_SYSTEM_PROMPT`, a shared constant used by sibling modules.
- **voice-transcript-re.mjs** - Exports `VOICE_TRANSCRIPT_RE`, a regular-expression constant used for validation.
- **web-search-tool.mjs** - Exports `webSearchTool`, which implements web search tool.
- **with-request-cwd.mjs** - Exports `withRequestCwd`, which implements with request cwd.
- **worktree-checkout-pattern.mjs** - Exports `WORKTREE_CHECKOUT_PATTERN`, a regular-expression constant used for validation.
- **write-file-tool.mjs** - Exports `writeFileTool`, which writes file tool.
- **write-todos-tool.mjs** - Exports `writeTodosTool`, which writes todos tool.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory include file-system access, network/API integration, subprocess execution, timer, scheduling, cooldown, or watchdog behavior, Linear integration, Discord integration, OpenClaw integration, Symphony integration, and git/worktree awareness. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```bash
node ops/integrations/model/symphony-openai-bridge/runtime.mjs
```

## 5. Dependencies

- **Node.js built-ins** - `node:async_hooks`, `node:child_process`, `node:fs`, `node:fs/promises`, `node:http`, `node:path`
- **External packages/services referenced in immediate code** - `@ai-sdk/google`, `@ai-sdk/groq`, `@ai-sdk/openai`, `@openai/codex-sdk`, `@openrouter/ai-sdk-provider`, `ai`, `zod`
- **Internal relative modules** - `../../../lib/logger.mjs`, `../../../lib/rag/vector-store.mjs`, `../../../lib/search/hybrid-search.mjs`, `../../../lib/search/linear-search.mjs`, `../../../lib/update-memory.mjs`, `../../notifications/openclaw-discord.mjs`, `../codebuff-direct.mjs`, `../symphony-adaptive-context.mjs`, `../symphony-bridge-truncation.mjs`, `../symphony-credit-gate.mjs`, `../symphony-credit-gate/project-root.mjs`, `../symphony-credit-gate/providers.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.

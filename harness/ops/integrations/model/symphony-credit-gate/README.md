# ANQR Symphony Credit Gate

## 1. Directory Overview

This directory contains the provider credit gate functionality for the ANQR (Agentic Number Query
Runner) Symphony orchestration system. It manages provider selection, scoring, health probing,
metrics tracking, and lease management for the multi-provider routing system. It currently contains
154 files and 0 subdirectories.

## 2. File Summaries

### Files

- **acquire-provider-lease.mjs** - Acquires provider lease with TTL, filtering out existing leases for same owner/familyKey/modelKey.
- **build-dynamic-catalog-providers.mjs** - Builds dynamic providers from catalog cache with model variants.
- **build-provider-probe-failure-breakdown.mjs** - Builds failure breakdown by status code.
- **build-provider-probe-markdown.mjs** - Builds full Markdown report with sections: summary, ranked healthy pool, tool-capability, provider results, selector order, failure breakdown, codebuff transitions.
- **build-provider-probe-ranked-healthy.mjs** - Builds ranked healthy provider list with stats, route info, tool probe.
- **build-provider-probe-report.mjs** - Builds complete report: generatedAt, results, rankedHealthy, selector, failureBreakdown, toolSummary, summary.
- **build-provider-probe-result-for-provider.mjs** - Builds single provider probe result with gateway cooldown handling.
- **build-provider-probe-results.mjs** - Builds all provider probe results with progress callback and shuffled order.
- **build-provider-probe-selector-summary.mjs** - Builds selector summary with wouldChoose and full sequence.
- **build-provider-probe-sequence.mjs** - Builds probe sequence: preferred, ranked, fallback.
- **build-provider-probe-summary.mjs** - Builds summary: total, healthy, degraded, failed, bridgeBlocked counts.
- **build-provider-probe-tool-probe.mjs** - Builds tool probe result, skipping if provider access failed.
- **build-provider-probe-tool-summary.mjs** - Builds tool summary: total capable, selectable count, per-provider entries.
- **build-provider-registry.mjs** - Combines static, dynamic catalog, and OpenRouter providers into unified registry.
- **build-provider-selection-candidate-names.mjs** - Builds ordered list of candidate provider names: preferred first, then ranked, then all providers from registry.
- **build-ranked-healthy-markdown-lines.mjs** - Builds markdown table for ranked healthy providers.
- **build-static-providers.mjs** - Builds static provider definitions including: codex (SDK), codebuff (SDK), groq, mistral, gemini, gemini-lite, sambanova, cerebras, github-models, huggingface, fireworks, together, and local-safety-net Ollama providers.
- **calculate-provider-score.mjs** - Calculates dynamic provider score using weighted formula: successRate (15%), avgDuration (8%), validationRate (12%), volume (2%), recency (3%), probeCapability (5%), linearCompletionRate (15%), linearComplexitySuccess (10%), linearSimpleSuccess (5%), estimateSuccessRate (10%), estimateEfficiency (10%), estimateThroughput (5%), plus preference boost. Applies safety-net ceiling.
- **catalog-model-lookup.mjs** - Parses model catalog (JSON or text) and checks for model needle match.
- **classify-codebuff-probe-error.mjs** - Classifies Codebuff-specific errors: quota_exhausted, rate_limited, timeout, auth_missing, provider_error.
- **classify-probe-failure-status.mjs** - Classifies general probe failure status from error text.
- **classify-provider-probe-error.mjs** - Classifies probe errors: auth_missing, auth_invalid, quota_exhausted, rate_limited, timeout, network_error, provider_error.
- **classify-provider-probe-http-status.mjs** - Classifies HTTP status codes: 401/403 -> auth_invalid, 402 -> quota_exhausted, 408/504 -> timeout, 429 -> rate_limited, 500+ -> provider_error.
- **clear-provider-failure.mjs** - Clears provider failure from state.
- **codebuff-probe-timeout-ms.mjs** - Exports `CODEBUFF_PROBE_TIMEOUT_MS` from environment (default 90000ms) for Codebuff probe.
- **codex-probe-timeout-ms.mjs** - Exports `CODEX_PROBE_TIMEOUT_MS = 20000` for Codex SDK probe timeout.
- **codex-sandbox-mode.mjs** - Exports CODEX_SANDBOX_MODE from env (default "danger-full-access").
- **codex-success-window-ms.mjs** - Exports `CODEX_SUCCESS_WINDOW_MS = 5 * 60 * 1000` (5 minutes) for Codex success caching window.
- **create-codebuff-probe-timeout.mjs** - Module that creates or builds codebuff probe timeout. Exports `createCodebuffProbeTimeout`.
- **dirname.mjs** - ESM \_\_dirname polyfill using import.meta.url.
- **ensure-state-dir.mjs** - Ensures state directory exists with proper permissions (0o700).
- **escape-provider-probe-markdown-cell.mjs** - Escapes pipe and newline for Markdown table cells.
- **failure-state-file.mjs** - Exports `FAILURE_STATE_FILE` path for provider failure tracking.
- **find-provider-by-name.mjs** - Finds provider definition by name from PROVIDERS array.
- **get-active-provider-leases.mjs** - Gets active (non-expired) leases with auto-pruning.
- **get-cached-probe-entry.mjs** - Gets cached probe entry from probe cache.
- **get-configured-providers.mjs** - Returns providers that have valid credentials (checks env vars, SDK availability, loadToken function).
- **get-effective-provider-score.mjs** - Applies modifiers to base score: preference boost, recent success boost, health penalty, cache penalty.
- **get-effective-provider-tier.mjs** - Gets effective tier with special handling: codebuff in degraded+free mode returns TIER_FREE_CLOUD.
- **get-provider-bootstrap-score.mjs** - Bootstrap score for providers below MIN_SELECTIONS_FOR_RANKING: base 0.45 + probeRate*0.2 + recency*0.15 + preferenceBoost, capped at 0.95.
- **get-provider-cache-penalty.mjs** - Applies penalty from cached probe: rate_limited 0.03, provider_error 0.04, quota_exhausted 0.06, cooling_down 0.04.
- **get-provider-definitions.mjs** - Returns all provider definitions with optional exclusion filtering.
- **get-provider-health-penalty.mjs** - Applies penalty: cooling_down 0.08, degraded 0.03.
- **get-provider-lease-owner.mjs** - Gets lease owner: ANQR_WORKTREE_ID env, ANQR_WORKTREE_PATH basename, or pid:${process.pid}.
- **get-provider-model-key.mjs** - Gets model key: `${providerGatewayKey(provider)}::${provider.model/name/unknown}`.
- **get-provider-preference-boost.mjs** - Returns boost: codex +0.22, codebuff +0.18, others 0.
- **get-provider-recent-success-boost.mjs** - Calculates exponential decay boost (half-life 7 days) up to 0.06 for recent successes.
- **get-provider-stats.mjs** - Returns detailed provider statistics including tier, selections, successes, failures, successRate, timing (avg/min/max duration), tokens (avg/total input/output), validation rates, Linear completion metrics by priority and estimate size ranges, probe metrics, timestamps, and score.
- **get-provider-tier.mjs** - Gets provider tier from provider.tier or defaults to TIER_FREE_CLOUD.
- **get-ranked-providers.mjs** - Returns ranked providers sorted by score, with separate handling for scored, pending, safety-nets, with tool confirmation and exclusion support.
- **has-durable-provider-access-failure.mjs** - Checks for durable (permanent) access failures: "never purchased credits", "payment required", "positive credit balance required", "credit limit exceeded", "forbidden", "unauthorized", "invalid api key", "auth_invalid", "quota_exhausted".
- **has-historical-provider-capability.mjs** - Checks if provider has historical success evidence for bootstrap eligibility.
- **high-priority-threshold.mjs** - Exports `HIGH_PRIORITY_THRESHOLD = 2` for high priority Linear issues (P0-P2).
- **index.mjs** - Generated facade re-exporting all public API members from sibling modules.
- **is-never-purchased-credits.mjs** - Checks specifically for "never purchased credits" text.
- **is-preferred-paid-provider-eligible.mjs** - Special logic for codebuff: only eligible if not in degraded+free mode.
- **is-provider-current-pool-healthy.mjs** - Checks if provider is healthy: status success/degraded, bridgeRoute advertised, toolProbe capable.
- **is-provider-lease-allowed.mjs** - Checks if lease is allowed: exempt providers always allowed, family phase checks no other leases in family, model phase checks no other leases for model.
- **is-provider-lease-exempt.mjs** - Checks if provider is exempt from lease: codex and codebuff are exempt.
- **is-provider-ranked-pool-eligible.mjs** - Checks if provider is eligible for ranked pool: not bridge blocked, bridgeRoute advertised, not auth_missing/invalid, no durable access failure, toolProbe not non_capable.
- **is-provider-tool-confirmed.mjs** - Checks if provider tool capability is confirmed (toolProbe.toolStatus === "capable").
- **is-recently-failed.mjs** - Checks if provider recently failed within failure window, respecting permanentSkip and transient flags.
- **is-recently-probed.mjs** - Checks if provider was probed within TTL, returning cached entry or null.
- **is-transient-provider-failure-type.mjs** - Identifies transient failure types: rate_limited, timeout, network_error, provider_error.
- **load-failures.mjs** - Loads provider failure state tracking.
- **load-probe-results.mjs** - Loads cached provider probe results.
- **load-provider-leases.mjs** - Loads active provider leases, supporting both array and object formats.
- **load-stats.mjs** - Loads and merges provider statistics from JSON file with defaults.
- **local-probe-timeout-ms.mjs** - Exports `LOCAL_PROBE_TIMEOUT_MS = 15000` for local (Ollama) provider probe timeout.
- **local-safety-net-provider-names.mjs** - Exports `LOCAL_SAFETY_NET_PROVIDER_NAMES` Set containing ["ollama-qwen2.5-coder-3b", "ollama-qwen2.5-coder-0.5b"].
- **log-provider-stats.mjs** - Logs provider rankings and details to console with formatted output.
- **logger.mjs** - Creates logger from lib/logger.mjs, exports logDebug, logInfo, logWarn, logError.
- **make-provider-probe-progress-callback.mjs** - Creates progress callback for console logging provider stages.
- **make-skipped-tool-probe-result.mjs** - Creates skipped tool probe result for access-failed providers.
- **matches-allowed-names.mjs** - Checks if provider name matches allowed names set.
- **matches-excluded-names.mjs** - Checks if provider name matches excluded names set.
- **medium-priority-threshold.mjs** - Exports `MEDIUM_PRIORITY_THRESHOLD = 4` for medium priority issues (P3).
- **min-selections-for-ranking.mjs** - Exports `MIN_SELECTIONS_FOR_RANKING = 3` minimum selections before provider enters dynamic ranking.
- **preferred-provider-order.mjs** - Exports `PREFERRED_PROVIDER_ORDER = ["codex", "codebuff"]` for preferred paid providers.
- **probe-all-providers.mjs** - Probes all configured providers in parallel with exclusion support, records health success/failure, returns array of probe results.
- **probe-codebuff-detailed.mjs** - Detailed Codebuff probe with mode transitions, stage tracking, detailed result object.
- **probe-codebuff.mjs** - Probes Codebuff SDK with paid/free mode fallback, timeout handling.
- **probe-codex-detailed.mjs** - Module that supports probe codex detailed. Exports `probeCodexDetailed`.
- **probe-codex-sdk.mjs** - Probes Codex SDK with success window caching, timeout handling, result recording.
- **probe-gemini-detailed.mjs** - Detailed Gemini probe wrapper.
- **probe-gemini-models.mjs** - Probes Google Gemini models via generateText.
- **probe-generate-text-detailed.mjs** - Generic generateText probe using AI SDK.
- **probe-git-hub-models.mjs** - Probes GitHub Models catalog.
- **probe-github-models-detailed.mjs** - Detailed GitHub Models probe with HTTP headers.
- **probe-http-model-list-detailed.mjs** - Generic HTTP model list probe with catalog matching.
- **probe-ollama-detailed.mjs** - Detailed Ollama probe using HTTP model list endpoint.
- **probe-ollama-model.mjs** - Probes local Ollama instance for model availability.
- **probe-open-aimodels.mjs** - Probes OpenAI-compatible API endpoints checking model availability in provider catalog.
- **probe-openrouter-detailed.mjs** - Detailed OpenRouter probe with HTTP status classification.
- **probe-openrouter-invocation.mjs** - Module that supports probe openrouter invocation. Exports `probeOpenrouterInvocation`.
- **probe-provider-detailed.mjs** - Detailed probe for single provider with routing to specialized probe functions based on provider type.
- **probe-result-ttl-ms.mjs** - Exports `PROBE_RESULT_TTL_MS = 90_000` (90 seconds) TTL for probe result caching.
- **probe-results-file.mjs** - Exports `PROBE_RESULTS_FILE` path for probe results.
- **probe-timeout-ms.mjs** - Exports `PROBE_TIMEOUT_MS = 5000` for remote provider probe timeout.
- **probe-with-timeout.mjs** - Generic fetch with AbortController timeout wrapper.
- **project-root.mjs** - Exports PROJECT_ROOT resolving to 4 directories up from this file.
- **provider-gateway-key.mjs** - Extracts gateway key from provider name: handles openrouter-\*, github-models-, ollama-, groq-, mistral-, huggingface-, together-, sambanova-, cerebras-, fireworks-, gemini prefixes, falls back to catalogCacheKey/driver/baseUrl/name.
- **provider-lease-file.mjs** - Exports `PROVIDER_LEASE_FILE` path for provider lease storage.
- **provider-lease-ttl-ms.mjs** - Exports `PROVIDER_LEASE_TTL_MS = 180000` (3 minutes) TTL for provider leases.
- **provider-probe-base-result.mjs** - Module that supports provider probe base result. Exports `providerProbeBaseResult`.
- **provider-probe-bridge-route.mjs** - Gets bridge route status: blocked, not_advertised, or advertised with route IDs.
- **provider-probe-catalog-available.mjs** - Checks if model needle exists in catalog haystack (case-insensitive).
- **provider-probe-catalog-matched-needle.mjs** - Returns normalized model name for catalog matching.
- **provider-probe-diagnostics.mjs** - Main diagnostics runner: refreshes catalogs, builds results, writes reports.
- **provider-probe-direct-status.mjs** - Extracts direct probe status and reason from result.
- **provider-probe-fetch-with-timeout.mjs** - Module that supports provider probe fetch with timeout. Exports `providerProbeFetchWithTimeout`.
- **provider-probe-results-with-progress.mjs** - Iterates providers with progress events for each stage.
- **provider-probe-route-info.mjs** - Gets route info: advertisedRouteIds, isBridgeBlocked, bridgeBlockReason, knownToolCapable.
- **provider-probe-stage.mjs** - Creates stage object with name, at timestamp, extra properties.
- **provider-probe-tool-reason.mjs** - Extracts tool probe reason from probe object.
- **provider-probe-tool-status.mjs** - Normalizes tool status: capable (capable/sdk-capable/known-capable/safety-net-always-allowed), non_capable (various non-capable statuses), inconclusive (various inconclusive statuses).
- **provider-probe-truncate.mjs** - Truncates long text to max length with ellipsis.
- **provider-stats.mjs** - Exports default `PROVIDER_STATS` object with tracks for: selections, successes, failures, metricSamples, totalDuration/avgDuration/minDuration/maxDuration, totalInputTokens/avgInputTokens, totalOutputTokens/avgOutputTokens, validationPasses/validationFailures, lastSelected/lastSuccess/lastFailure/firstUsed, score, linearCompleted/linearFailed, linearHighPrioritySuccess/Total, linearMediumPrioritySuccess/Total, linearLowPrioritySuccess/Total, totalEstimatePoints/avgEstimatePoints/completedEstimatePoints, smallIssuesCompleted/Total, mediumIssuesCompleted/Total, largeIssuesCompleted/Total, and probe metrics (probeSelections, probeSuccesses, probeFailures, probeTotalDuration, probeAvgDuration).
- **providers.mjs** - Main provider registry using `buildProviderRegistry()` to combine static, dynamic catalog, and OpenRouter providers.
- **prune-provider-leases.mjs** - Filters out expired leases based on expiresAt timestamp.
- **record-linear-completion.mjs** - Records Linear issue completion by provider with complexity tracking (high/medium/low priority by threshold, estimate-based size ranges for small/medium/large issues), and recalculates provider score.
- **record-probe-result.mjs** - Records probe results (success/failure/duration) in separate probe metrics to avoid contaminating runtime stats.
- **record-provider-failure-count.mjs** - Records provider failure count and timestamp, recalculating score.
- **record-provider-failure.mjs** - Records provider failure with transient/permanent classification and health system integration.
- **record-provider-metrics.mjs** - Records detailed metrics including durationMs, inputTokens, outputTokens, validationPassed, with running calculations for averages and score recalculation.
- **record-provider-selection.mjs** - Records when a provider is selected, tracking selections count, lastSelected, and firstUsed timestamp.
- **record-provider-success.mjs** - Records provider success, updating successes, lastSuccess, and triggering health success recording.
- **release-provider-lease.mjs** - Releases provider lease for current owner.
- **reload-providers-from-catalog-cache.mjs** - Module that supports reload providers from catalog cache. Exports `reloadProvidersFromCatalogCache`.
- **reset-provider-stats.mjs** - Resets all provider stats to defaults.
- **resolve-provider-api-key.mjs** - Resolves API key from provider.envVar, process.env, or loadToken function.
- **run-codebuff-probe-mode.mjs** - Runs Codebuff probe in specific cost mode (paid/free) with stage tracking.
- **safety-net-score-ceiling.mjs** - Exports `SAFETY_NET_SCORE_CEILING = 0.25` to cap safety-net provider scores.
- **sanitize-codebuff-probe-error.mjs** - Compacts error message whitespace.
- **sanitize-model-segment.mjs** - Sanitizes model segment: lowercase, alphanum only, dashes, max 80 chars.
- **save-failures.mjs** - Persists provider failure state.
- **save-probe-result.mjs** - Saves individual provider probe result with permanentSkip detection for "never purchased credits" errors.
- **save-provider-leases.mjs** - Saves provider leases as `{ leases: [...] }` object.
- **save-stats.mjs** - Persists provider statistics to JSON file.
- **score-weights.mjs** - Exports `SCORE_WEIGHTS` object defining weighted scoring for provider selection (successRate: 0.15, avgDuration: 0.08, validationRate: 0.12, volume: 0.02, recency: 0.03, probeCapability: 0.05, linearCompletionRate: 0.15, etc.).
- **select-provider.mjs** - Main provider selection function with allowedNames/excludeNames filtering, health state checking, preferred paid provider handling, safety-net fallback for P0 override, returns selected provider or null.
- **should-skip-provider-from-cache.mjs** - Determines if provider should be skipped based on hard statuses (auth_missing, auth_invalid, quota_exhausted) or durable access failures.
- **should-skip-tool-probe-for-result.mjs** - Determines if tool probe should be skipped based on provider status.
- **shuffle-array.mjs** - Fisher-Yates shuffle implementation.
- **shuffle-provider-probe-order.mjs** - Shuffle by gateway key buckets for fair distribution across provider families.
- **state-dir.mjs** - Exports `STATE_DIR` pointing to `reports/symphony` directory.
- **stats-file.mjs** - Exports `STATS_FILE` path for provider statistics storage.
- **tier-free-cloud.mjs** - Exports `TIER_FREE_CLOUD = "free-cloud"` constant for free cloud provider tier.
- **tier-local-safety-net.mjs** - Exports `TIER_LOCAL_SAFETY_NET = "local-safety-net"` for local fallback providers like Ollama.
- **tier-paid.mjs** - Exports `TIER_PAID = "paid"` constant for paid provider tier classification.
- **to-selected-provider.mjs** - Converts provider to selected format with apiKey, requiresSdk, driver, cwd, useMaxCompletionTokens, tier.
- **tool-probe-for-provider.mjs** - Probes provider tool capability using symphony-openai-bridge.
- **try-provider.mjs** - Attempts to use a provider checking: cache validity, API key presence, lease contention, recent failures, probing if needed, recording selection, acquiring lease. Returns provider with lease or null.
- **write-provider-probe-report-files.mjs** - Writes report to JSON and Markdown files with timestamps and latest symlinks.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```javascript
import * as moduleApi from "./index.mjs";
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory exposes a public API through `index.mjs`.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.

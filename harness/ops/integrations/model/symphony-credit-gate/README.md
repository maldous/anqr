# ANQR Symphony Credit Gate

## 1. Directory Overview

This directory contains the provider credit gate functionality for the ANQR (Agentic Number Query Runner) Symphony orchestration system. It manages provider selection, scoring, health probing, metrics tracking, and lease management for the multi-provider routing system.

The credit gate serves as the intelligent routing layer that selects the best available AI provider based on dynamic scoring, health state, probe results, and lease contention management. It supports multiple tiers of providers (paid, free-cloud, local-safety-net) with sophisticated fallback and degraded-mode handling.

## 2. File Summaries

### Constants and Configuration

- **tier-paid.mjs** - Exports `TIER_PAID = "paid"` constant for paid provider tier classification.
- **tier-free-cloud.mjs** - Exports `TIER_FREE_CLOUD = "free-cloud"` constant for free cloud provider tier.
- **tier-local-safety-net.mjs** - Exports `TIER_LOCAL_SAFETY_NET = "local-safety-net"` for local fallback providers like Ollama.
- **safety-net-score-ceiling.mjs** - Exports `SAFETY_NET_SCORE_CEILING = 0.25` to cap safety-net provider scores.
- **score-weights.mjs** - Exports `SCORE_WEIGHTS` object defining weighted scoring for provider selection (successRate: 0.15, avgDuration: 0.08, validationRate: 0.12, volume: 0.02, recency: 0.03, probeCapability: 0.05, linearCompletionRate: 0.15, etc.).
- **min-selections-for-ranking.mjs** - Exports `MIN_SELECTIONS_FOR_RANKING = 3` minimum selections before provider enters dynamic ranking.
- **high-priority-threshold.mjs** - Exports `HIGH_PRIORITY_THRESHOLD = 2` for high priority Linear issues (P0-P2).
- **medium-priority-threshold.mjs** - Exports `MEDIUM_PRIORITY_THRESHOLD = 4` for medium priority issues (P3).
- **probe-timeout-ms.mjs** - Exports `PROBE_TIMEOUT_MS = 5000` for remote provider probe timeout.
- **local-probe-timeout-ms.mjs** - Exports `LOCAL_PROBE_TIMEOUT_MS = 15000` for local (Ollama) provider probe timeout.
- **codex-probe-timeout-ms.mjs** - Exports `CODEX_PROBE_TIMEOUT_MS = 20000` for Codex SDK probe timeout.
- **codex-success-window-ms.mjs** - Exports `CODEX_SUCCESS_WINDOW_MS = 5 * 60 * 1000` (5 minutes) for Codex success caching window.
- **probe-result-ttl-ms.mjs** - Exports `PROBE_RESULT_TTL_MS = 90_000` (90 seconds) TTL for probe result caching.
- **provider-lease-ttl-ms.mjs** - Exports `PROVIDER_LEASE_TTL_MS = 180000` (3 minutes) TTL for provider leases.
- **codebuff-probe-timeout-ms.mjs** - Exports `CODEBUFF_PROBE_TIMEOUT_MS` from environment (default 90000ms) for Codebuff probe.
- **preferred-provider-order.mjs** - Exports `PREFERRED_PROVIDER_ORDER = ["codex", "codebuff"]` for preferred paid providers.
- **local-safety-net-provider-names.mjs** - Exports `LOCAL_SAFETY_NET_PROVIDER_NAMES` Set containing ["ollama-qwen2.5-coder-3b", "ollama-qwen2.5-coder-0.5b"].

### State Management and Files

- **state-dir.mjs** - Exports `STATE_DIR` pointing to `reports/symphony` directory.
- **stats-file.mjs** - Exports `STATS_FILE` path for provider statistics storage.
- **probe-results-file.mjs** - Exports `PROBE_RESULTS_FILE` path for probe results.
- **failure-state-file.mjs** - Exports `FAILURE_STATE_FILE` path for provider failure tracking.
- **provider-lease-file.mjs** - Exports `PROVIDER_LEASE_FILE` path for provider lease storage.
- **load-stats.mjs** - Loads and merges provider statistics from JSON file with defaults.
- **save-stats.mjs** - Persists provider statistics to JSON file.
- **load-probe-results.mjs** - Loads cached provider probe results.
- **save-probe-result.mjs** - Saves individual provider probe result with permanentSkip detection for "never purchased credits" errors.
- **load-failures.mjs** - Loads provider failure state tracking.
- **save-failures.mjs** - Persists provider failure state.
- **load-provider-leases.mjs** - Loads active provider leases, supporting both array and object formats.
- **save-provider-leases.mjs** - Saves provider leases as `{ leases: [...] }` object.
- **ensure-state-dir.mjs** - Ensures state directory exists with proper permissions (0o700).

### Stats and Metrics

- **provider-stats.mjs** - Exports default `PROVIDER_STATS` object with tracks for: selections, successes, failures, metricSamples, totalDuration/avgDuration/minDuration/maxDuration, totalInputTokens/avgInputTokens, totalOutputTokens/avgOutputTokens, validationPasses/validationFailures, lastSelected/lastSuccess/lastFailure/firstUsed, score, linearCompleted/linearFailed, linearHighPrioritySuccess/Total, linearMediumPrioritySuccess/Total, linearLowPrioritySuccess/Total, totalEstimatePoints/avgEstimatePoints/completedEstimatePoints, smallIssuesCompleted/Total, mediumIssuesCompleted/Total, largeIssuesCompleted/Total, and probe metrics (probeSelections, probeSuccesses, probeFailures, probeTotalDuration, probeAvgDuration).

### Recording Functions

- **record-provider-selection.mjs** - Records when a provider is selected, tracking selections count, lastSelected, and firstUsed timestamp.
- **record-provider-success.mjs** - Records provider success, updating successes, lastSuccess, and triggering health success recording.
- **record-provider-failure-count.mjs** - Records provider failure count and timestamp, recalculating score.
- **record-provider-metrics.mjs** - Records detailed metrics including durationMs, inputTokens, outputTokens, validationPassed, with running calculations for averages and score recalculation.
- **record-probe-result.mjs** - Records probe results (success/failure/duration) in separate probe metrics to avoid contaminating runtime stats.
- **record-linear-completion.mjs** - Records Linear issue completion by provider with complexity tracking (high/medium/low priority by threshold, estimate-based size ranges for small/medium/large issues), and recalculates provider score.
- **record-provider-failure.mjs** - Records provider failure with transient/permanent classification and health system integration.

### Provider Registry and Selection

- **providers.mjs** - Main provider registry using `buildProviderRegistry()` to combine static, dynamic catalog, and OpenRouter providers.
- **build-static-providers.mjs** - Builds static provider definitions including: codex (SDK), codebuff (SDK), groq, mistral, gemini, gemini-lite, sambanova, cerebras, github-models, huggingface, fireworks, together, and local-safety-net Ollama providers.
- **build-dynamic-catalog-providers.mjs** - Builds dynamic providers from catalog cache with model variants.
- **build-provider-registry.mjs** - Combines static, dynamic catalog, and OpenRouter providers into unified registry.
- **get-provider-definitions.mjs** - Returns all provider definitions with optional exclusion filtering.
- **get-configured-providers.mjs** - Returns providers that have valid credentials (checks env vars, SDK availability, loadToken function).
- **get-ranked-providers.mjs** - Returns ranked providers sorted by score, with separate handling for scored, pending, safety-nets, with tool confirmation and exclusion support.
- **build-provider-selection-candidate-names.mjs** - Builds ordered list of candidate provider names: preferred first, then ranked, then all providers from registry.
- **get-provider-stats.mjs** - Returns detailed provider statistics including tier, selections, successes, failures, successRate, timing (avg/min/max duration), tokens (avg/total input/output), validation rates, Linear completion metrics by priority and estimate size ranges, probe metrics, timestamps, and score.
- **log-provider-stats.mjs** - Logs provider rankings and details to console with formatted output.

### Provider Selection Logic

- **select-provider.mjs** - Main provider selection function with allowedNames/excludeNames filtering, health state checking, preferred paid provider handling, safety-net fallback for P0 override, returns selected provider or null.
- **try-provider.mjs** - Attempts to use a provider checking: cache validity, API key presence, lease contention, recent failures, probing if needed, recording selection, acquiring lease. Returns provider with lease or null.
- **matches-allowed-names.mjs** - Checks if provider name matches allowed names set.
- **matches-excluded-names.mjs** - Checks if provider name matches excluded names set.
- **is-preferred-paid-provider-eligible.mjs** - Special logic for codebuff: only eligible if not in degraded+free mode.

### Scoring and Ranking

- **calculate-provider-score.mjs** - Calculates dynamic provider score using weighted formula: successRate (15%), avgDuration (8%), validationRate (12%), volume (2%), recency (3%), probeCapability (5%), linearCompletionRate (15%), linearComplexitySuccess (10%), linearSimpleSuccess (5%), estimateSuccessRate (10%), estimateEfficiency (10%), estimateThroughput (5%), plus preference boost. Applies safety-net ceiling.
- **get-effective-provider-score.mjs** - Applies modifiers to base score: preference boost, recent success boost, health penalty, cache penalty.
- **get-provider-preference-boost.mjs** - Returns boost: codex +0.22, codebuff +0.18, others 0.
- **get-provider-recent-success-boost.mjs** - Calculates exponential decay boost (half-life 7 days) up to 0.06 for recent successes.
- **get-provider-health-penalty.mjs** - Applies penalty: cooling_down 0.08, degraded 0.03.
- **get-provider-cache-penalty.mjs** - Applies penalty from cached probe: rate_limited 0.03, provider_error 0.04, quota_exhausted 0.06, cooling_down 0.04.
- **get-provider-bootstrap-score.mjs** - Bootstrap score for providers below MIN_SELECTIONS_FOR_RANKING: base 0.45 + probeRate*0.2 + recency*0.15 + preferenceBoost, capped at 0.95.
- **has-historical-provider-capability.mjs** - Checks if provider has historical success evidence for bootstrap eligibility.

### Probe Functions

- **probe-all-providers.mjs** - Probes all configured providers in parallel with exclusion support, records health success/failure, returns array of probe results.
- **probe-provider-detailed.mjs** - Detailed probe for single provider with routing to specialized probe functions based on provider type.
- **probe-open-aimodels.mjs** - Probes OpenAI-compatible API endpoints checking model availability in provider catalog.
- **probe-codex-sdk.mjs** - Probes Codex SDK with success window caching, timeout handling, result recording.
- **probe-codebuff.mjs** - Probes Codebuff SDK with paid/free mode fallback, timeout handling.
- **probe-codebuff-detailed.mjs** - Detailed Codebuff probe with mode transitions, stage tracking, detailed result object.
- **probe-gemini-models.mjs** - Probes Google Gemini models via generateText.
- **probe-gemini-detailed.mjs** - Detailed Gemini probe wrapper.
- **probe-git-hub-models.mjs** - Probes GitHub Models catalog.
- **probe-github-models-detailed.mjs** - Detailed GitHub Models probe with HTTP headers.
- **probe-ollama-model.mjs** - Probes local Ollama instance for model availability.
- **probe-ollama-detailed.mjs** - Detailed Ollama probe using HTTP model list endpoint.
- **probe-openrouter-invailed.mjs** - Probes OpenRouter API endpoint.
- **probe-openrouter-detailed.mjs** - Detailed OpenRouter probe with HTTP status classification.
- **probe-http-model-list-detailed.mjs** - Generic HTTP model list probe with catalog matching.
- **probe-generate-text-detailed.mjs** - Generic generateText probe using AI SDK.
- **probe-with-timeout.mjs** - Generic fetch with AbortController timeout wrapper.
- **run-codebuff-probe-mode.mjs** - Runs Codebuff probe in specific cost mode (paid/free) with stage tracking.

### Tool Probing

- **tool-probe-for-provider.mjs** - Probes provider tool capability using symphony-openai-bridge.
- **build-provider-probe-tool-probe.mjs** - Builds tool probe result, skipping if provider access failed.

### Classification and Helpers

- **classify-provider-probe-error.mjs** - Classifies probe errors: auth_missing, auth_invalid, quota_exhausted, rate_limited, timeout, network_error, provider_error.
- **classify-codebuff-probe-error.mjs** - Classifies Codebuff-specific errors: quota_exhausted, rate_limited, timeout, auth_missing, provider_error.
- **classify-probe-failure-status.mjs** - Classifies general probe failure status from error text.
- **classify-provider-probe-http-status.mjs** - Classifies HTTP status codes: 401/403 -> auth_invalid, 402 -> quota_exhausted, 408/504 -> timeout, 429 -> rate_limited, 500+ -> provider_error.
- **is-recently-failed.mjs** - Checks if provider recently failed within failure window, respecting permanentSkip and transient flags.
- **is-recently-probed.mjs** - Checks if provider was probed within TTL, returning cached entry or null.
- **is-transient-provider-failure-type.mjs** - Identifies transient failure types: rate_limited, timeout, network_error, provider_error.
- **has-durable-provider-access-failure.mjs** - Checks for durable (permanent) access failures: "never purchased credits", "payment required", "positive credit balance required", "credit limit exceeded", "forbidden", "unauthorized", "invalid api key", "auth_invalid", "quota_exhausted".
- **is-never-purchased-credits.mjs** - Checks specifically for "never purchased credits" text.
- **should-skip-provider-from-cache.mjs** - Determines if provider should be skipped based on hard statuses (auth_missing, auth_invalid, quota_exhausted) or durable access failures.
- **should-skip-tool-probe-for-result.mjs** - Determines if tool probe should be skipped based on provider status.
- **is-provider-current-pool-healthy.mjs** - Checks if provider is healthy: status success/degraded, bridgeRoute advertised, toolProbe capable.
- **is-provider-ranked-pool-eligible.mjs** - Checks if provider is eligible for ranked pool: not bridge blocked, bridgeRoute advertised, not auth_missing/invalid, no durable access failure, toolProbe not non_capable.

### Route and Bridge Info

- **provider-gateway-key.mjs** - Extracts gateway key from provider name: handles openrouter-*, github-models-, ollama-, groq-, mistral-, huggingface-, together-, sambanova-, cerebras-, fireworks-, gemini prefixes, falls back to catalogCacheKey/driver/baseUrl/name.
- **provider-probe-route-info.mjs** - Gets route info: advertisedRouteIds, isBridgeBlocked, bridgeBlockReason, knownToolCapable.
- **provider-probe-bridge-route.mjs** - Gets bridge route status: blocked, not_advertised, or advertised with route IDs.
- **provider-probe-direct-status.mjs** - Extracts direct probe status and reason from result.

### Leases

- **acquire-provider-lease.mjs** - Acquires provider lease with TTL, filtering out existing leases for same owner/familyKey/modelKey.
- **release-provider-lease.mjs** - Releases provider lease for current owner.
- **get-active-provider-leases.mjs** - Gets active (non-expired) leases with auto-pruning.
- **prune-provider-leases.mjs** - Filters out expired leases based on expiresAt timestamp.
- **is-provider-lease-allowed.mjs** - Checks if lease is allowed: exempt providers always allowed, family phase checks no other leases in family, model phase checks no other leases for model.
- **is-provider-lease-exempt.mjs** - Checks if provider is exempt from lease: codex and codebuff are exempt.
- **get-provider-lease-owner.mjs** - Gets lease owner: ANQR_WORKTREE_ID env, ANQR_WORKTREE_PATH basename, or pid:${process.pid}.
- **get-provider-model-key.mjs** - Gets model key: `${providerGatewayKey(provider)}::${provider.model/name/unknown}`.

### Tier and Configuration

- **get-provider-tier.mjs** - Gets provider tier from provider.tier or defaults to TIER_FREE_CLOUD.
- **get-effective-provider-tier.mjs** - Gets effective tier with special handling: codebuff in degraded+free mode returns TIER_FREE_CLOUD.
- **resolve-provider-api-key.mjs** - Resolves API key from provider.envVar, process.env, or loadToken function.

### Provider Lookup

- **find-provider-by-name.mjs** - Finds provider definition by name from PROVIDERS array.
- **get-cached-probe-entry.mjs** - Gets cached probe entry from probe cache.

### Tool and Capability

- **is-provider-tool-confirmed.mjs** - Checks if provider tool capability is confirmed (toolProbe.toolStatus === "capable").
- **make-skipped-tool-probe-result.mjs** - Creates skipped tool probe result for access-failed providers.

### Reporting and Diagnostics

- **build-provider-probe-results.mjs** - Builds all provider probe results with progress callback and shuffled order.
- **provider-probe-results-with-progress.mjs** - Iterates providers with progress events for each stage.
- **build-provider-probe-result-for-provider.mjs** - Builds single provider probe result with gateway cooldown handling.
- **build-provider-probe-report.mjs** - Builds complete report: generatedAt, results, rankedHealthy, selector, failureBreakdown, toolSummary, summary.
- **build-provider-probe-ranked-healthy.mjs** - Builds ranked healthy provider list with stats, route info, tool probe.
- **build-provider-probe-selector-summary.mjs** - Builds selector summary with wouldChoose and full sequence.
- **build-provider-probe-tool-summary.mjs** - Builds tool summary: total capable, selectable count, per-provider entries.
- **build-provider-probe-failure-breakdown.mjs** - Builds failure breakdown by status code.
- **build-provider-probe-summary.mjs** - Builds summary: total, healthy, degraded, failed, bridgeBlocked counts.
- **build-provider-probe-markdown.mjs** - Builds full Markdown report with sections: summary, ranked healthy pool, tool-capability, provider results, selector order, failure breakdown, codebuff transitions.
- **build-ranked-healthy-markdown-lines.mjs** - Builds markdown table for ranked healthy providers.
- **build-provider-probe-sequence.mjs** - Builds probe sequence: preferred, ranked, fallback.
- **make-provider-probe-progress-callback.mjs** - Creates progress callback for console logging provider stages.
- **write-provider-probe-report-files.mjs** - Writes report to JSON and Markdown files with timestamps and latest symlinks.
- **provider-probe-diagnostics.mjs** - Main diagnostics runner: refreshes catalogs, builds results, writes reports.

### Stage and Result Helpers

- **provider-probe-stage.mjs** - Creates stage object with name, at timestamp, extra properties.
- **provider-probe-truncate.mjs** - Truncates long text to max length with ellipsis.
- **provider-probe-catalog-available.mjs** - Checks if model needle exists in catalog haystack (case-insensitive).
- **provider-probe-catalog-matched-needle.mjs** - Returns normalized model name for catalog matching.
- **escape-provider-probe-markdown-cell.mjs** - Escapes pipe and newline for Markdown table cells.
- **provider-probe-tool-status.mjs** - Normalizes tool status: capable (capable/sdk-capable/known-capable/safety-net-always-allowed), non_capable (various non-capable statuses), inconclusive (various inconclusive statuses).
- **provider-probe-tool-reason.mjs** - Extracts tool probe reason from probe object.

### Other Utilities

- **shuffle-array.mjs** - Fisher-Yates shuffle implementation.
- **shuffle-provider-probe-order.mjs** - Shuffle by gateway key buckets for fair distribution across provider families.
- **to-selected-provider.mjs** - Converts provider to selected format with apiKey, requiresSdk, driver, cwd, useMaxCompletionTokens, tier.
- **catalog-model-lookup.mjs** - Parses model catalog (JSON or text) and checks for model needle match.
- **sanitize-model-segment.mjs** - Sanitizes model segment: lowercase, alphanum only, dashes, max 80 chars.
- **sanitize-codebuff-probe-error.mjs** - Compacts error message whitespace.
- **clear-provider-failure.mjs** - Clears provider failure from state.
- **reset-provider-stats.mjs** - Resets all provider stats to defaults.

### Infrastructure

- **logger.mjs** - Creates logger from lib/logger.mjs, exports logDebug, logInfo, logWarn, logError.
- **dirname.mjs** - ESM __dirname polyfill using import.meta.url.
- **project-root.mjs** - Exports PROJECT_ROOT resolving to 4 directories up from this file.
- **codex-sandbox-mode.mjs** - Exports CODEX_SANDBOX_MODE from env (default "danger-full-access").

### Facade

- **index.mjs** - Generated facade re-exporting all public API members from sibling modules.

## 3. Overall Directory Function

This directory provides the intelligent provider routing system for ANQR. The credit gate functions as the decision layer that:

1. **Provider Discovery**: Maintains registry of all available providers (static definitions, dynamic from catalogs, OpenRouter variants)

2. **Health Probing**: Probes providers to verify availability, model existence, tool capability with detailed staging and error classification

3. **Dynamic Scoring**: Calculates provider scores using weighted metrics (success rate, duration, validation, Linear completion by priority, estimate complexity) with preference boosts and recent-success decay

4. **Selection**: Selects best provider through ordered candidate list (preferred paid -> ranked -> fallback) with health/lease/failure filtering, culminating in safety-net fallback

5. **Lease Management**: Prevents concurrent provider usage through lease tracking with TTL, owner identification, family/model phase contention

6. **Metrics Tracking**: Records detailed metrics for selection, success, failure, duration, tokens, validation, Linear issue completion by complexity, probe results

7. **Reporting**: Generates diagnostic reports (JSON/Markdown) with ranked healthy pool, tool capability, failure breakdown

The system supports multiple tiers (paid, free-cloud, local-safety-net), sophisticated fallback (Codebuff paid->free), and graceful degradation when providers fail.

## 4. Usage Instructions

This module is primarily imported by other harness modules rather than being run directly. Key usage patterns:

```javascript
// Import provider selection
import { selectProvider } from "./symphony-credit-gate/index.mjs";
const selected = await selectProvider({ excludeNames: ["ollama-qwen2.5-coder-3b"] });

// Import stats management
import { loadStats, saveStats, getProviderStats } from "./symphony-credit-gate/index.mjs";
const stats = getProviderStats();

// Import probing
import { runProviderProbeDiagnostics } from "./symphony-credit-gate/index.mjs";
const { report, jsonPath, mdPath } = await runProviderProbeDiagnostics();

// Import ranking
import { getRankedProviders } from "./symphony-credit-gate/index.mjs";
const ranked = getRankedProviders({ excludeNames: new Set(["codex"]) });

// Import recording functions
import { recordProviderSelection, recordProviderSuccess, recordProviderFailureCount } from "./symphony-credit-gate/index.mjs";
recordProviderSelection("codex");
recordProviderSuccess("codex");
recordProviderFailureCount("codex");
```

### Running Diagnostics

To run provider probe diagnostics and generate reports:

```bash
node ops/integrations/model/symphony-credit-gate/provider-probe-diagnostics.mjs
```

Output files are written to `reports/provider-probes/`.

## 5. Dependencies

### Internal Dependencies

- **../../../symphony-config.mjs** - Configuration constants (RUNNER_OLLAMA_BASE_URL, RUNNER_PAID_PROVIDER_FAILURE_WINDOW_SECS, etc.)
- **../symphony-openai-bridge/** - Bridge integrations (createProviderModel, probeToolCapabilityForProvider, loadProbeCache, ADVERTISED_MODELS, KNOWN_TOOL_CAPABLE, BRIDGE_PROVIDER_BLOCKLIST, etc.)
- **../symphony-provider-health.mjs** - Provider health state management (getProviderHealthState, HEALTH_STATES, shouldRetryProvider, recordProviderHealthSuccess/Failure)
- **../codebuff-direct/** - Codebuff SDK integration (getApiKey, tryMode, isPaymentRequiredError, isRateLimitError, isRecoverableError, normalizeCwd)
- **../../../lib/logger.mjs** - Logger factory

### External Dependencies

- **Node.js** - ESM modules with .mjs extension
- **ai** - Vercel AI SDK (generateText)
- **@openai/codex-sdk** - OpenAI Codex SDK

### Environment Variables

- **ANQR_WORKTREE_ID** - Explicit worktree ID for lease ownership
- **ANQR_WORKTREE_PATH** - Worktree path for lease ownership fallback
- **CODEX_SANDBOX_MODE** - Codex sandbox mode (default "danger-full-access")
- **CODEBUFF_PROBE_TIMEOUT_MS** - Codebuff probe timeout (default 90000ms)
- Provider API keys: OPENAI_API_KEY, CODEBUFF_API_KEY, GROQ_TOKEN, MISTRAL_TOKEN, GEMINI_TOKEN, SAMBANOVA_TOKEN, CEREBRAS_TOKEN, GITHUB_MODELS_TOKEN, HUGGING_TOKEN, FIREWORKS_KEY, TOGETHER_KEY, OPENROUTER_TOKEN

## 6. Additional Comments

- **Fail-Safe Design**: Safety-net providers (TIER_LOCAL_SAFETY_NET) are always available as last resort regardless of restrictions, with score ceiling at 0.25 to prevent them from dominating rankings.

- **Probe Isolation**: Probe metrics are tracked separately from runtime metrics (probeSelections, probeSuccesses, probeFailures vs selections, successes, failures) to prevent probe failures from contaminating provider scoring.

- **Lease Contention**: Provider leases use 3-minute TTL with family/model phases to allow concurrent usage of different provider families while preventing same-model concurrent usage.

- **Degraded Mode**: Codebuff supports degraded mode where paid mode failure falls back to free mode with status "degraded" instead of "unavailable".

- **Permanent Skip**: Providers returning "never purchased credits" error are permanently skipped (permanentSkip flag) to avoid repeated probing of providers requiring purchase.

- **Gateway Cooldowns**: Transient failures (rate_limited, timeout, network_error, provider_error) trigger gateway-level cooldowns to prevent rapid re-probing of failing provider families.

- **Tool Capability**: Providers are probed for tool capability separate from availability, with "known tool capable" providers (KNOWN_TOOL_CAPABLE set) skipping explicit tool probing.

- **Complexity Tracking**: Linear issue completion is tracked by priority thresholds (HIGH <= 2, MEDIUM <= 4, else LOW) and estimate size ranges (SMALL <= 2, MEDIUM <= 5, LARGE > 5).
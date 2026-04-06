# ANQR Symphony Credit Gate

## 1. Directory Overview

This directory implements **ANQR Symphony Credit Gate** within the ANQR harness. Key immediate entries include `index.mjs`, `build-provider-probe-result-for-provider.mjs`, `should-skip-tool-probe-for-result.mjs`, `build-provider-probe-ranked-healthy.mjs`. The current inventory is 154 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **acquire-provider-lease.mjs** - Exports `acquireProviderLease`, which acquires provider lease.
- **build-dynamic-catalog-providers.mjs** - Exports `buildDynamicCatalogProviders`, which builds dynamic catalog providers.
- **build-provider-probe-failure-breakdown.mjs** - Exports `buildProviderProbeFailureBreakdown`, which builds provider probe failure breakdown.
- **build-provider-probe-markdown.mjs** - Exports `buildProviderProbeMarkdown`, which builds provider probe markdown.
- **build-provider-probe-ranked-healthy.mjs** - Exports `buildProviderProbeRankedHealthy`, which builds provider probe ranked healthy.
- **build-provider-probe-report.mjs** - Exports `buildProviderProbeReport`, which builds provider probe report.
- **build-provider-probe-result-for-provider.mjs** - Exports `buildProviderProbeResultForProvider`, which builds provider probe result for provider.
- **build-provider-probe-results.mjs** - Exports `buildProviderProbeResults`, which builds provider probe results.
- **build-provider-probe-selector-summary.mjs** - Exports `buildProviderProbeSelectorSummary`, which builds provider probe selector summary.
- **build-provider-probe-sequence.mjs** - Exports `buildProviderProbeSequence`, which builds provider probe sequence.
- **build-provider-probe-summary.mjs** - Exports `buildProviderProbeSummary`, which builds provider probe summary.
- **build-provider-probe-tool-probe.mjs** - Exports `buildProviderProbeToolProbe`, which builds provider probe tool probe.
- **build-provider-probe-tool-summary.mjs** - Exports `buildProviderProbeToolSummary`, which builds provider probe tool summary.
- **build-provider-registry.mjs** - Exports `buildProviderRegistry`, which builds provider registry.
- **build-provider-selection-candidate-names.mjs** - Exports `buildProviderSelectionCandidateNames`, which builds provider selection candidate names.
- **build-ranked-healthy-markdown-lines.mjs** - Exports `buildRankedHealthyMarkdownLines`, which builds ranked healthy markdown lines.
- **build-static-providers.mjs** - Exports `buildStaticProviders`, which builds static providers.
- **calculate-provider-score.mjs** - Exports `calculateProviderScore`, which calculates provider score.
- **catalog-model-lookup.mjs** - Exports `catalogModelLookup`, which implements catalog model lookup.
- **classify-codebuff-probe-error.mjs** - Exports `classifyCodebuffProbeError`, which implements classify codebuff probe error.
- **classify-probe-failure-status.mjs** - Exports `classifyProbeFailureStatus`, which implements classify probe failure status.
- **classify-provider-probe-error.mjs** - Exports `classifyProviderProbeError`, which implements classify provider probe error.
- **classify-provider-probe-http-status.mjs** - Exports `classifyProviderProbeHttpStatus`, which implements classify provider probe http status.
- **clear-provider-failure.mjs** - Exports `clearProviderFailure`, which clears provider failure.
- **codebuff-probe-timeout-ms.mjs** - Exports `CODEBUFF_PROBE_TIMEOUT_MS`, a shared constant used by sibling modules.
- **codex-probe-timeout-ms.mjs** - Exports `CODEX_PROBE_TIMEOUT_MS`, a shared constant used by sibling modules.
- **codex-sandbox-mode.mjs** - Exports `CODEX_SANDBOX_MODE`, a shared constant used by sibling modules.
- **codex-success-window-ms.mjs** - Exports `CODEX_SUCCESS_WINDOW_MS`, a shared constant used by sibling modules.
- **create-codebuff-probe-timeout.mjs** - Exports `createCodebuffProbeTimeout`, which creates codebuff probe timeout.
- **dirname.mjs** - Exports `__dirname`, which implements dirname.
- **ensure-state-dir.mjs** - Exports `ensureStateDir`, which ensures state dir.
- **escape-provider-probe-markdown-cell.mjs** - Exports `escapeProviderProbeMarkdownCell`, which implements escape provider probe markdown cell.
- **failure-state-file.mjs** - Exports `FAILURE_STATE_FILE`, a shared constant used by sibling modules.
- **find-provider-by-name.mjs** - Exports `findProviderByName`, which finds provider by name.
- **get-active-provider-leases.mjs** - Exports `getActiveProviderLeases`, which gets active provider leases.
- **get-cached-probe-entry.mjs** - Exports `getCachedProbeEntry`, which gets cached probe entry.
- **get-configured-providers.mjs** - Exports `getConfiguredProviders`, which gets configured providers.
- **get-effective-provider-score.mjs** - Exports `getEffectiveProviderScore`, which gets effective provider score.
- **get-effective-provider-tier.mjs** - Exports `getEffectiveProviderTier`, which gets effective provider tier.
- **get-provider-bootstrap-score.mjs** - Exports `getProviderBootstrapScore`, which gets provider bootstrap score.
- **get-provider-cache-penalty.mjs** - Exports `getProviderCachePenalty`, which gets provider cache penalty.
- **get-provider-definitions.mjs** - Exports `getProviderDefinitions`, which gets provider definitions.
- **get-provider-health-penalty.mjs** - Exports `getProviderHealthPenalty`, which gets provider health penalty.
- **get-provider-lease-owner.mjs** - Exports `getProviderLeaseOwner`, which gets provider lease owner.
- **get-provider-model-key.mjs** - Exports `getProviderModelKey`, which gets provider model key.
- **get-provider-preference-boost.mjs** - Exports `getProviderPreferenceBoost`, which gets provider preference boost.
- **get-provider-recent-success-boost.mjs** - Exports `getProviderRecentSuccessBoost`, which gets provider recent success boost.
- **get-provider-stats.mjs** - Exports `getProviderStats`, which gets provider stats.
- **get-provider-tier.mjs** - Exports `getProviderTier`, which gets provider tier.
- **get-ranked-providers.mjs** - Exports `getRankedProviders`, which gets ranked providers.
- **has-durable-provider-access-failure.mjs** - Exports `hasDurableProviderAccessFailure`, which checks for durable provider access failure.
- **has-historical-provider-capability.mjs** - Exports `hasHistoricalProviderCapability`, which checks for historical provider capability.
- **high-priority-threshold.mjs** - Exports `HIGH_PRIORITY_THRESHOLD`, a shared constant used by sibling modules.
- **index.mjs** - Facade module that re-exports public members from `./dirname.mjs`, `./project-root.mjs`, `./codex-sandbox-mode.mjs`, `./state-dir.mjs`, `./failure-state-file.mjs`, `./stats-file.mjs`, and 55 more siblings.
- **is-never-purchased-credits.mjs** - Exports `isNeverPurchasedCredits`, which checks whether never purchased credits.
- **is-preferred-paid-provider-eligible.mjs** - Exports `isPreferredPaidProviderEligible`, which checks whether preferred paid provider eligible.
- **is-provider-current-pool-healthy.mjs** - Exports `isProviderCurrentPoolHealthy`, which checks whether provider current pool healthy.
- **is-provider-lease-allowed.mjs** - Exports `isProviderLeaseAllowed`, which checks whether provider lease allowed.
- **is-provider-lease-exempt.mjs** - Exports `isProviderLeaseExempt`, which checks whether provider lease exempt.
- **is-provider-ranked-pool-eligible.mjs** - Exports `isProviderRankedPoolEligible`, which checks whether provider ranked pool eligible.
- **is-provider-tool-confirmed.mjs** - Exports `isProviderToolConfirmed`, which checks whether provider tool confirmed.
- **is-recently-failed.mjs** - Exports `isRecentlyFailed`, which checks whether recently failed.
- **is-recently-probed.mjs** - Exports `isRecentlyProbed`, which checks whether recently probed.
- **is-transient-provider-failure-type.mjs** - Exports `isTransientProviderFailureType`, which checks whether transient provider failure type.
- **load-failures.mjs** - Exports `loadFailures`, which loads failures.
- **load-probe-results.mjs** - Exports `loadProbeResults`, which loads probe results.
- **load-provider-leases.mjs** - Exports `loadProviderLeases`, which loads provider leases.
- **load-stats.mjs** - Exports `loadStats`, which loads stats.
- **local-probe-timeout-ms.mjs** - Exports `LOCAL_PROBE_TIMEOUT_MS`, a shared constant used by sibling modules.
- **local-safety-net-provider-names.mjs** - Exports `LOCAL_SAFETY_NET_PROVIDER_NAMES`, a shared `Set` constant used by this module group.
- **log-provider-stats.mjs** - Exports `logProviderStats`, which implements log provider stats.
- **logger.mjs** - Shared logging helper module exporting `logDebug`, `logError`, `logInfo`, `logWarn`.
- **make-provider-probe-progress-callback.mjs** - Exports `makeProviderProbeProgressCallback`, which implements make provider probe progress callback.
- **make-skipped-tool-probe-result.mjs** - Exports `makeSkippedToolProbeResult`, which implements make skipped tool probe result.
- **matches-allowed-names.mjs** - Exports `matchesAllowedNames`, which implements matches allowed names.
- **matches-excluded-names.mjs** - Exports `matchesExcludedNames`, which implements matches excluded names.
- **medium-priority-threshold.mjs** - Exports `MEDIUM_PRIORITY_THRESHOLD`, a shared constant used by sibling modules.
- **min-selections-for-ranking.mjs** - Exports `MIN_SELECTIONS_FOR_RANKING`, a shared constant used by sibling modules.
- **preferred-provider-order.mjs** - Exports `PREFERRED_PROVIDER_ORDER`, a shared constant used by sibling modules.
- **probe-all-providers.mjs** - Exports `probeAllProviders`, which implements probe all providers.
- **probe-codebuff-detailed.mjs** - Exports `probeCodebuffDetailed`, which implements probe codebuff detailed.
- **probe-codebuff.mjs** - Exports `probeCodebuff`, `probeCodebuffDetailed`, providing the reusable API for this directory concern.
- **probe-codex-detailed.mjs** - Exports `probeCodexDetailed`, which implements probe codex detailed.
- **probe-codex-sdk.mjs** - Exports `probeCodexSdk`, which implements probe codex sdk.
- **probe-gemini-detailed.mjs** - Exports `probeGeminiDetailed`, which implements probe gemini detailed.
- **probe-gemini-models.mjs** - Exports `probeGeminiModels`, which implements probe gemini models.
- **probe-generate-text-detailed.mjs** - Exports `probeGenerateTextDetailed`, which implements probe generate text detailed.
- **probe-git-hub-models.mjs** - Exports `probeGitHubModels`, which implements probe git hub models.
- **probe-github-models-detailed.mjs** - Exports `probeGitHubModelsDetailed`, which implements probe git hub models detailed.
- **probe-http-model-list-detailed.mjs** - Exports `probeHttpModelListDetailed`, which implements probe http model list detailed.
- **probe-ollama-detailed.mjs** - Exports `probeOllamaDetailed`, which implements probe ollama detailed.
- **probe-ollama-model.mjs** - Exports `probeOllamaModel`, which implements probe ollama model.
- **probe-open-aimodels.mjs** - Exports `probeOpenAIModels`, which implements probe open aimodels.
- **probe-openrouter-detailed.mjs** - Exports `probeOpenrouterDetailed`, which implements probe openrouter detailed.
- **probe-openrouter-invocation.mjs** - Exports `probeOpenrouterInvocation`, which implements probe openrouter invocation.
- **probe-provider-detailed.mjs** - Exports `probeProviderDetailed`, which implements probe provider detailed.
- **probe-result-ttl-ms.mjs** - Exports `PROBE_RESULT_TTL_MS`, a shared constant used by sibling modules.
- **probe-results-file.mjs** - Exports `PROBE_RESULTS_FILE`, a shared constant used by sibling modules.
- **probe-timeout-ms.mjs** - Exports `PROBE_TIMEOUT_MS`, a shared constant used by sibling modules.
- **probe-with-timeout.mjs** - Exports `probeWithTimeout`, which implements probe with timeout.
- **project-root.mjs** - Exports `PROJECT_ROOT`, a shared constant used by sibling modules.
- **provider-gateway-key.mjs** - Exports `providerGatewayKey`, which implements provider gateway key.
- **provider-lease-file.mjs** - Exports `PROVIDER_LEASE_FILE`, a shared constant used by sibling modules.
- **provider-lease-ttl-ms.mjs** - Exports `PROVIDER_LEASE_TTL_MS`, a shared constant used by sibling modules.
- **provider-probe-base-result.mjs** - Exports `providerProbeBaseResult`, which implements provider probe base result.
- **provider-probe-bridge-route.mjs** - Exports `providerProbeBridgeRoute`, which implements provider probe bridge route.
- **provider-probe-catalog-available.mjs** - Exports `providerProbeCatalogAvailable`, which implements provider probe catalog available.
- **provider-probe-catalog-matched-needle.mjs** - Exports `providerProbeCatalogMatchedNeedle`, which implements provider probe catalog matched needle.
- **provider-probe-diagnostics.mjs** - Exports `runProviderProbeDiagnostics`, which runs provider probe diagnostics.
- **provider-probe-direct-status.mjs** - Exports `providerProbeDirectStatus`, which implements provider probe direct status.
- **provider-probe-fetch-with-timeout.mjs** - Exports `providerProbeFetchWithTimeout`, which implements provider probe fetch with timeout.
- **provider-probe-results-with-progress.mjs** - Exports `providerProbeResultsWithProgress`, which implements provider probe results with progress.
- **provider-probe-route-info.mjs** - Exports `providerProbeRouteInfo`, which implements provider probe route info.
- **provider-probe-stage.mjs** - Exports `providerProbeStage`, which implements provider probe stage.
- **provider-probe-tool-reason.mjs** - Exports `providerProbeToolReason`, which implements provider probe tool reason.
- **provider-probe-tool-status.mjs** - Exports `providerProbeToolStatus`, which implements provider probe tool status.
- **provider-probe-truncate.mjs** - Exports `providerProbeTruncate`, which implements provider probe truncate.
- **provider-stats.mjs** - Exports `PROVIDER_STATS`, a shared constant used by sibling modules.
- **providers.mjs** - Exports `PROVIDERS`, `reloadProvidersFromCatalogCache`, providing the reusable API for this directory concern.
- **prune-provider-leases.mjs** - Exports `pruneProviderLeases`, which implements prune provider leases.
- **record-linear-completion.mjs** - Exports `recordLinearCompletion`, which implements record linear completion.
- **record-probe-result.mjs** - Exports `recordProbeResult`, which implements record probe result.
- **record-provider-failure-count.mjs** - Exports `recordProviderFailureCount`, which implements record provider failure count.
- **record-provider-failure.mjs** - Exports `recordProviderFailure`, which implements record provider failure.
- **record-provider-metrics.mjs** - Exports `recordProviderMetrics`, which implements record provider metrics.
- **record-provider-selection.mjs** - Exports `recordProviderSelection`, which implements record provider selection.
- **record-provider-success.mjs** - Exports `recordProviderSuccess`, which implements record provider success.
- **release-provider-lease.mjs** - Exports `releaseProviderLease`, which releases provider lease.
- **reload-providers-from-catalog-cache.mjs** - Exports `reloadProvidersFromCatalogCache`, which implements reload providers from catalog cache.
- **reset-provider-stats.mjs** - Exports `resetProviderStats`, which implements reset provider stats.
- **resolve-provider-api-key.mjs** - Exports `resolveProviderApiKey`, which resolves provider api key.
- **run-codebuff-probe-mode.mjs** - Exports `runCodebuffProbeMode`, which runs codebuff probe mode.
- **safety-net-score-ceiling.mjs** - Exports `SAFETY_NET_SCORE_CEILING`, a shared constant used by sibling modules.
- **sanitize-codebuff-probe-error.mjs** - Exports `sanitizeCodebuffProbeError`, which implements sanitize codebuff probe error.
- **sanitize-model-segment.mjs** - Exports `sanitizeModelSegment`, which implements sanitize model segment.
- **save-failures.mjs** - Exports `saveFailures`, which implements save failures.
- **save-probe-result.mjs** - Exports `saveProbeResult`, which implements save probe result.
- **save-provider-leases.mjs** - Exports `saveProviderLeases`, which implements save provider leases.
- **save-stats.mjs** - Exports `saveStats`, which implements save stats.
- **score-weights.mjs** - Exports `SCORE_WEIGHTS`, a shared constant used by sibling modules.
- **select-provider.mjs** - Exports `selectProvider`, which implements select provider.
- **should-skip-provider-from-cache.mjs** - Exports `shouldSkipProviderFromCache`, which implements should skip provider from cache.
- **should-skip-tool-probe-for-result.mjs** - Exports `shouldSkipToolProbeForResult`, which implements should skip tool probe for result.
- **shuffle-array.mjs** - Exports `shuffleArray`, which implements shuffle array.
- **shuffle-provider-probe-order.mjs** - Exports `shuffleProviderProbeOrder`, which implements shuffle provider probe order.
- **state-dir.mjs** - Exports `STATE_DIR`, a shared constant used by sibling modules.
- **stats-file.mjs** - Exports `STATS_FILE`, a shared constant used by sibling modules.
- **tier-free-cloud.mjs** - Exports `TIER_FREE_CLOUD`, a shared constant used by sibling modules.
- **tier-local-safety-net.mjs** - Exports `TIER_LOCAL_SAFETY_NET`, a shared constant used by sibling modules.
- **tier-paid.mjs** - Exports `TIER_PAID`, a shared constant used by sibling modules.
- **to-selected-provider.mjs** - Exports `toSelectedProvider`, which implements to selected provider.
- **tool-probe-for-provider.mjs** - Exports `toolProbeForProvider`, which implements tool probe for provider.
- **try-provider.mjs** - Exports `tryProvider`, which implements try provider.
- **write-provider-probe-report-files.mjs** - Exports `writeProviderProbeReportFiles`, which writes provider probe report files.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory include file-system access, network/API integration, timer, scheduling, cooldown, or watchdog behavior, Linear integration, Symphony integration, and git/worktree awareness. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```javascript
import * as moduleApi from "./ops/integrations/model/symphony-credit-gate/index.mjs";
```

## 5. Dependencies

- **Node.js built-ins** - `node:fs`, `node:fs/promises`, `node:path`, `node:url`
- **External packages/services referenced in immediate code** - `@openai/codex-sdk`, `ai`
- **Internal relative modules** - `../../../lib/logger.mjs`, `../../../symphony-config.mjs`, `../codebuff-direct/get-api-key.mjs`, `../codebuff-direct/is-payment-required-error.mjs`, `../codebuff-direct/is-rate-limit-error.mjs`, `../codebuff-direct/is-recoverable-error.mjs`, `../codebuff-direct/normalize-cwd.mjs`, `../codebuff-direct/try-mode.mjs`, `../symphony-openai-bridge/advertised-models.mjs`, `../symphony-openai-bridge/bridge-provider-blocklist-reasons.mjs`, `../symphony-openai-bridge/bridge-provider-blocklist.mjs`, `../symphony-openai-bridge/build-openrouter-providers-from-catalog.mjs`

## 6. Additional Comments

- No direct standalone runtime entry point is defined in the immediate directory contents.

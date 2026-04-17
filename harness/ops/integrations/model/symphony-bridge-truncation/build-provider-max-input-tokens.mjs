import { buildDynamicCatalogLimits } from "./build-dynamic-catalog-limits.mjs";
import { STATIC_CONTEXT_WINDOWS } from "./static-context-windows.mjs";
import { STATIC_INPUT_BUDGETS } from "./static-input-budgets.mjs";
import { STATIC_PER_REQUEST_LIMITS, PROVIDER_PREFIX_DEFAULTS } from "./static-per-request-limits.mjs";
import { loadDiscoveredPerRequestLimits } from "./load-discovered-per-request-limits.mjs";
import { toInputBudget } from "./to-input-budget.mjs";

export function buildProviderMaxInputTokens() {
  // External providers: convert raw context windows to safe input budgets (60%).
  /** @type {Record<string, number>} */
  const externalBudgets = {};
  for (const [name, contextLength] of Object.entries(STATIC_CONTEXT_WINDOWS)) {
    externalBudgets[name] = toInputBudget(contextLength) || contextLength;
  }

  // Dynamic catalog limits (from /v1/models) override static fallbacks.
  // These are already converted to input budgets by buildDynamicCatalogLimits.
  /** @type {Record<string, number>} */
  const dynamicLimits = buildDynamicCatalogLimits();

  // Merge all sources: static windows → static budgets → dynamic catalog
  const merged = {
    ...externalBudgets,
    ...STATIC_INPUT_BUDGETS,
    ...dynamicLimits,
  };

  // ── Free-tier per-request caps (static seed) ─────────────────────────
  // These are known limits from past 413 errors, serving as seed data.
  // Dynamically discovered limits (from the cache) take priority below.
  for (const [name, perRequestLimit] of Object.entries(STATIC_PER_REQUEST_LIMITS)) {
    if (name in merged) {
      merged[name] = Math.min(merged[name], perRequestLimit);
    } else {
      // Provider exists in per-request table but not yet in merged budgets
      // (e.g. dynamic catalog entry not yet discovered). Use the limit directly.
      merged[name] = perRequestLimit;
    }
  }

  // ── Dynamically discovered per-request caps ───────────────────────────
  // These are limits learned from 413 errors at runtime and persisted to
  // a cache file. Fresh discoveries take priority over the static seed table
  // because they reflect the provider's ACTUAL current limit.
  // Stale entries (older than 7 days without re-confirmation) are downgraded
  // to static-seed priority — they cap but don't override, allowing the
  // adaptive context system to re-learn the real limit if providers increase it.
  const STALENESS_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
  const discoveredLimits = loadDiscoveredPerRequestLimits();
  for (const [name, entry] of Object.entries(discoveredLimits)) {
    const discoveredLimit = entry.limit;
    if (!discoveredLimit || discoveredLimit <= 0) continue;
    const age = Date.now() - (entry.discoveredAt || 0);
    const isStale = age > STALENESS_MS;
    if (name in merged) {
      if (isStale) {
        // Stale discovery: only cap if it's lower than the static seed
        // (allows adaptive system to re-learn if provider increased limit)
        const staticLimit = STATIC_PER_REQUEST_LIMITS[name];
        const cap = staticLimit ? Math.min(staticLimit, discoveredLimit) : discoveredLimit;
        merged[name] = Math.min(merged[name], cap);
      } else {
        // Fresh discovery: takes priority over static seed
        merged[name] = Math.min(merged[name], discoveredLimit);
      }
    } else {
      merged[name] = discoveredLimit;
    }
  }

  // ── Provider prefix defaults ──────────────────────────────────────────
  // For any provider whose name matches a known prefix (e.g. "groq-") but
  // has no specific entry in the static or discovered tables, apply a
  // conservative default cap. This covers NEW models added by providers
  // after the static table was written, preventing 413 on first request.
  for (const [name, budget] of Object.entries(merged)) {
    // Skip providers that already have a specific cap applied
    if (name in STATIC_PER_REQUEST_LIMITS || name in discoveredLimits) continue;

    for (const { prefix, defaultLimit } of PROVIDER_PREFIX_DEFAULTS) {
      if (name.startsWith(prefix) && budget > defaultLimit) {
        merged[name] = defaultLimit;
        break; // first matching prefix wins
      }
    }
  }

  return merged;
}

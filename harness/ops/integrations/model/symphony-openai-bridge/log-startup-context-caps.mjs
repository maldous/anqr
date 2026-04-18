import { PROVIDER_MAX_INPUT_TOKENS } from "../symphony-bridge-truncation.mjs";
import {
  STATIC_PER_REQUEST_LIMITS,
  PROVIDER_PREFIX_DEFAULTS,
} from "../symphony-bridge-truncation/static-per-request-limits.mjs";
import { loadDiscoveredPerRequestLimits } from "../symphony-bridge-truncation/load-discovered-per-request-limits.mjs";
import { logInfo } from "./logger.mjs";

/**
 * Log the effective per-request token caps at bridge startup so operators
 * can verify the limits without reading code or checking cache files.
 * Shows which caps come from static seed vs dynamically discovered cache
 * vs provider prefix defaults.
 */
export function logStartupContextCaps() {
  const discovered = loadDiscoveredPerRequestLimits();

  // Find all providers where the effective budget is capped below the
  // dynamic catalog limit (i.e. a per-request limit is in effect)
  const caps = [];
  const prefixCaps = [];

  for (const [name, budget] of Object.entries(PROVIDER_MAX_INPUT_TOKENS)) {
    const staticLimit = STATIC_PER_REQUEST_LIMITS[name];
    const discoveredEntry = discovered[name];

    if (discoveredEntry) {
      caps.push({
        name,
        budget,
        source: "discovered",
        discoveredAt: discoveredEntry.discoveredAt || null,
      });
    } else if (staticLimit) {
      caps.push({ name, budget, source: "static" });
    } else {
      // Check if this provider was capped by a prefix default
      for (const { prefix, defaultLimit } of PROVIDER_PREFIX_DEFAULTS) {
        if (name.startsWith(prefix) && budget === defaultLimit) {
          prefixCaps.push({ name, budget, prefix });
          break;
        }
      }
    }
  }

  if (caps.length === 0 && prefixCaps.length === 0) {
    logInfo(
      `[startup] No per-request token caps active — all providers use context window budgets`,
    );
    return;
  }

  logInfo(
    `[startup] 📊 Per-request token caps active (${caps.length + prefixCaps.length} providers):`,
  );

  for (const cap of caps.sort((a, b) => a.name.localeCompare(b.name))) {
    const sourceTag = cap.source === "discovered" ? "🔧" : "📖";
    const age = cap.discoveredAt
      ? ` (${Math.round((Date.now() - cap.discoveredAt) / 3600000)}h ago)`
      : "";
    logInfo(
      `  ${sourceTag} ${cap.name}: ${cap.budget.toLocaleString()} tokens [${cap.source}${age}]`,
    );
  }

  if (prefixCaps.length > 0) {
    logInfo(`[startup] 📋 Prefix-default caps (${prefixCaps.length} providers):`);
    for (const cap of prefixCaps.sort((a, b) => a.name.localeCompare(b.name))) {
      logInfo(`  🏷️ ${cap.name}: ${cap.budget.toLocaleString()} tokens [prefix: ${cap.prefix}]`);
    }
  }

  const discoveredCount = caps.filter((c) => c.source === "discovered").length;
  const staticCount = caps.filter((c) => c.source === "static").length;
  logInfo(
    `[startup] Sources: ${staticCount} static seed, ${discoveredCount} dynamically discovered, ${prefixCaps.length} prefix defaults`,
  );
}

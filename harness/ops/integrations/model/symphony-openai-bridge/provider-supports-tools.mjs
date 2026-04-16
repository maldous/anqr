import { nonToolCapableProviders } from "./non-tool-capable-providers.mjs";
import { toolCapableProviders } from "./tool-capable-providers.mjs";
import { KNOWN_TOOL_CAPABLE } from "./known-tool-capable.mjs";

/**
 * Check whether a provider supports tool calls.
 *
 * Default mode (strict = false): unprobed providers are optimistically
 * allowed — the runtime safety net catches failures.  This is acceptable
 * for general traffic where a single probe failure is recoverable.
 *
 * Strict mode (strict = true): unprobed providers are REJECTED.  Only
 * providers confirmed via probe or the KNOWN_TOOL_CAPABLE allowlist are
 * permitted.  Use strict mode for demo routes and high-visibility
 * traffic where an unprobed provider failure is unacceptable.
 */
export function providerSupportsTools(providerName, { strict = false } = {}) {
  if (nonToolCapableProviders.has(providerName)) return false;
  if (toolCapableProviders.has(providerName)) return true;
  if (KNOWN_TOOL_CAPABLE.has(providerName)) return true;
  // Not yet probed — decision depends on mode
  if (strict) return false;
  return true;
}

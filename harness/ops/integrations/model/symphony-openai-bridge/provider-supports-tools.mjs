import { nonToolCapableProviders } from "./non-tool-capable-providers.mjs";
import { toolCapableProviders } from "./tool-capable-providers.mjs";
import { KNOWN_TOOL_CAPABLE } from "./known-tool-capable.mjs";

/**
 * Extract the base provider name from a dynamic catalog provider name.
 *
 * Dynamic catalog providers are named `{baseProviderName}-{sanitizedModel}`
 * (e.g. `github-models-cohere-cohere-command-a` → base `github-models`).
 * We match by finding the longest known-tool-capable or runtime-confirmed
 * entry that is a prefix of the dynamic name followed by a dash.
 * Longest-match-first avoids `gemini` matching when `gemini-lite` is correct.
 */
function baseProviderName(name) {
  let best = null;
  // Check both static allowlist and runtime-confirmed tool-capable providers
  const candidates = [...KNOWN_TOOL_CAPABLE, ...toolCapableProviders];
  for (const base of candidates) {
    if (name === base || name.startsWith(base + "-")) {
      if (!best || base.length > best.length) best = base;
    }
  }
  return best;
}

/**
 * Check whether a provider supports tool calls.
 *
 * Default mode (strict = false): unprobed providers are optimistically
 * allowed — the runtime safety net catches failures.  This is acceptable
 * for general traffic where a single probe failure is recoverable.
 *
 * Strict mode (strict = true): unprobed providers are REJECTED.  Only
 * providers confirmed via probe or the KNOWN_TOOL_CAPABLE allowlist are
 * permitted.  Dynamic catalog providers inherit tool capability from
 * their base provider (e.g. `github-models-*` inherits from `github-models`).
 * Use strict mode for demo routes and high-visibility traffic where an
 * unprobed provider failure is unacceptable.
 */
export function providerSupportsTools(providerName, { strict = false } = {}) {
  if (nonToolCapableProviders.has(providerName)) return false;
  if (toolCapableProviders.has(providerName)) return true;
  if (KNOWN_TOOL_CAPABLE.has(providerName)) return true;

  // Dynamic catalog providers: inherit tool capability from base provider.
  // This is critical — without it, dynamic providers like
  // `github-models-cohere-command-a` get no tools in strict mode,
  // meaning they can NEVER call write_file/patch_file, producing
  // false-positive completions with zero file changes.
  const base = baseProviderName(providerName);
  if (base) {
    // Base provider is non-tool-capable → inherit rejection
    if (nonToolCapableProviders.has(base)) return false;
    // Base is confirmed tool-capable (static or runtime) → inherit
    return true;
  }

  // Not yet probed — decision depends on mode
  if (strict) return false;
  return true;
}

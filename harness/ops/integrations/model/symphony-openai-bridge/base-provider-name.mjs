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
export function baseProviderName(name) {
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

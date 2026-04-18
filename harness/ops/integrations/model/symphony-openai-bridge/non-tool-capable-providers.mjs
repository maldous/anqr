/**
 * Runtime-detected set of providers that don't support proper tool_call format.
 *
 * Populated dynamically at runtime via:
 *   - RAW_TOOL_JSON_TEXT detection in invoke-with-aiinner.mjs
 *   - Tool capability probing in probe-tool-capability-for-provider.mjs
 *   - Continuous probe cycle in run-continuous-provider-probe.mjs
 *
 * Do NOT add static entries — all classification should be dynamic so providers
 * can become available automatically when they fix their tool support.
 */
export const nonToolCapableProviders = new Set([]);

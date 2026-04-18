/**
 * Operator-configurable blocklist for providers that should never be selected.
 *
 * Keep empty by default — all exclusion should be dynamic:
 *   - 404 models are caught by the probe system and marked unavailable
 *   - Quota-exhausted providers get cache penalties and auto-recover
 *   - Non-tool-capable providers are detected at runtime via RAW_TOOL_JSON_TEXT
 *
 * Only add entries here for operator-controlled hard-exclusions (e.g. compliance).
 */
export const BRIDGE_PROVIDER_BLOCKLIST = new Set([]);

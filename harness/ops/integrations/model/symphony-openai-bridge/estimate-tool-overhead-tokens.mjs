import { knownToolNames } from "./known-tool-names.mjs";

export const TOOL_SCHEMA_TOKENS_PER_TOOL = 120;
export const TOOL_SCHEMA_FIXED_OVERHEAD = 800;

export function estimateToolOverheadTokens(options = {}) {
  function parsePositiveInteger(value) {
    const parsed = Number.parseInt(String(value || ""), 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  if (options.useTools === false) return 0;
  const override = parsePositiveInteger(process.env.SYMPHONY_TOOL_SCHEMA_OVERHEAD_TOKENS);
  if (override) return override;
  const count = options.toolCount || knownToolNames.size;
  return TOOL_SCHEMA_FIXED_OVERHEAD + count * TOOL_SCHEMA_TOKENS_PER_TOOL;
}

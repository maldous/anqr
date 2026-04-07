import { knownToolNames } from "./known-tool-names.mjs";

const TOOL_SCHEMA_TOKENS_PER_TOOL = 120;
const TOOL_SCHEMA_FIXED_OVERHEAD = 800;

export function estimateToolOverheadTokens(options = {}) {
  function parsePositiveInteger(value) {
    const parsed = Number.parseInt(String(value || ""), 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  if (options.useTools === false) return 0;
  const override = parsePositiveInteger(process.env.SYMPHONY_TOOL_SCHEMA_OVERHEAD_TOKENS);
  if (override) return override;
  return TOOL_SCHEMA_FIXED_OVERHEAD + knownToolNames.size * TOOL_SCHEMA_TOKENS_PER_TOOL;
}

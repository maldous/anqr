import { knownToolNames } from "./known-tool-names.mjs";
import { parsePositiveInteger } from "./estimate-tool-overhead-tokens/parse-positive-integer.mjs";

export const TOOL_SCHEMA_TOKENS_PER_TOOL = 120;
export const TOOL_SCHEMA_FIXED_OVERHEAD = 800;

export function estimateToolOverheadTokens(options = {}) {

  if (options.useTools === false) return 0;
  const override = parsePositiveInteger(process.env.SYMPHONY_TOOL_SCHEMA_OVERHEAD_TOKENS);
  if (override) return override;
  const count = options.toolCount || knownToolNames.size;
  return TOOL_SCHEMA_FIXED_OVERHEAD + count * TOOL_SCHEMA_TOKENS_PER_TOOL;
}

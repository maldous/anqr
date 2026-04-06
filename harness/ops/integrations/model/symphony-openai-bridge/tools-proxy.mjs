import { tool } from "ai";
import { z } from "zod";

import { knownToolNames } from "./known-tool-names.mjs";
import { tools } from "./tools.mjs";
import { logDebug, logWarn } from "./logger.mjs";

const UNKNOWN_TOOL_WARNED_KEY = Symbol.for("anqr.tools-proxy.warned");
const SELF_TEST_UNKNOWN_TOOL = "completely_hallucinated_tool_name_xyz";

function getWarnedTools() {
  if (!globalThis[UNKNOWN_TOOL_WARNED_KEY]) {
    globalThis[UNKNOWN_TOOL_WARNED_KEY] = new Set();
  }
  return globalThis[UNKNOWN_TOOL_WARNED_KEY];
}

export const toolsProxy = new Proxy(tools, {
  get(target, prop, receiver) {
    if (typeof prop !== "string" || prop in target) {
      return Reflect.get(target, prop, receiver);
    }

    if (prop === "then" || prop === "toJSON" || prop === "constructor" || prop.startsWith("_")) {
      return undefined;
    }

    if (prop === SELF_TEST_UNKNOWN_TOOL) {
      logDebug(`Tool proxy self-test requested unknown tool "${prop}"`);
    } else {
      const warned = getWarnedTools();
      if (!warned.has(prop)) {
        warned.add(prop);
        logWarn(`⚠️ Unknown tool requested: "${prop}" — returning graceful no-op`);
      }
    }

    return tool({
      description: `Unknown tool "${prop}" (catch-all — this tool is not available)`,
      inputSchema: z.object({}).passthrough(),
      execute: async (args) => {
        if (prop === SELF_TEST_UNKNOWN_TOOL) {
          logDebug(`Tool proxy self-test executed unknown tool "${prop}"`, {
            argsKeys: Object.keys(args || {}),
          });
        } else {
          logWarn(`🔧 Catch-all invoked for unknown tool "${prop}"`, {
            argsKeys: Object.keys(args || {}),
          });
        }
        return {
          error: `Tool "${prop}" is not available in this environment`,
          message: `The tool "${prop}" does not exist. Available tools: ${[...knownToolNames].slice(0, 20).join(", ")}...`,
          available: false,
          suggestion:
            "Check available tools with mcp_list_tools or use one of the listed tools above.",
        };
      },
    });
  },

  has(target, prop) {
    if (typeof prop === "string" && prop !== "then" && !prop.startsWith("_")) {
      return true;
    }
    return Reflect.has(target, prop);
  },
});

import { tool } from "ai";
import { z } from "zod";

import { knownToolNames } from "./known-tool-names.mjs";
import { tools } from "./tools.mjs";
import { logWarn } from "./logger.mjs";

export const toolsProxy = new Proxy(tools, {
  get(target, prop, receiver) {
    // Pass through existing tools, symbols, and non-string properties
    if (typeof prop !== "string" || prop in target) {
      return Reflect.get(target, prop, receiver);
    }

    // Ignore internal JS/Node properties that aren't tool names
    if (prop === "then" || prop === "toJSON" || prop === "constructor" || prop.startsWith("_")) {
      return undefined;
    }

    logWarn(`⚠️ Unknown tool requested: "${prop}" — returning graceful no-op`);

    return tool({
      description: `Unknown tool "${prop}" (catch-all — this tool is not available)`,
      inputSchema: z.object({}).passthrough(),
      execute: async (args) => {
        logWarn(`🔧 Catch-all invoked for unknown tool "${prop}"`, {
          argsKeys: Object.keys(args || {}),
        });
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
    // Report all string properties as present so the AI SDK doesn't reject
    // unknown tool calls before they reach our execute handler
    if (typeof prop === "string" && prop !== "then" && !prop.startsWith("_")) {
      return true;
    }
    return Reflect.has(target, prop);
  },
});

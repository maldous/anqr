import { tool } from "ai";
import { z } from "zod";

import { logWarn } from "./logger.mjs";

export function wrapToolsWithFallback(filteredTools) {
  return new Proxy(filteredTools, {
    get(target, prop, receiver) {
      if (typeof prop !== "string" || prop in target) {
        return Reflect.get(target, prop, receiver);
      }
      if (prop === "then" || prop === "toJSON" || prop === "constructor" || prop.startsWith("_")) {
        return undefined;
      }
      logWarn(`⚠️ Filtered tools: model requested unavailable tool "${prop}"`);
      return tool({
        description: `Tool "${prop}" is not available for this provider's context budget`,
        inputSchema: z.object({}).passthrough(),
        execute: async () => ({
          error: `Tool "${prop}" is not included in the current tool tier. Use available tools instead.`,
          available: false,
        }),
      });
    },
  });
}
